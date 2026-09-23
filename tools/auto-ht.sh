#!/usr/bin/env bash
# auto-ht.sh — política automática de integración (ver docs/COMANDOS.md)
#
# Cuenta los commits sin integrar de las ramas de los slots y, si llegan al
# umbral y el integrador está libre, dispara el ciclo que le pases por
# `--comando` — el automático usa `hd`, el modo rápido (merge → specs afectados
# → push → release) — respetando un cooldown. Es genérico: cada app lo copia y
# lo parametriza. Los modos (`hd` rápido y `hdd`/`ht` completo) están en
# docs/COMANDOS.md.
#
# Ejemplo de uso (cron cada 5 minutos):
#   */5 * * * * /ruta/a/owncoding-ui/tools/auto-ht.sh \
#     --repo /ruta/al/checkout-del-integrador \
#     --ramas "slot/componentes slot/diseno slot/impresion" \
#     --agente integrador --umbral 15 --cooldown 20 \
#     --comando 'herdr agent prompt integrador "hd"' >> /tmp/auto-ht.log 2>&1
#
# Ejemplo de prueba (no dispara nada, solo informa):
#   tools/auto-ht.sh --repo ../MobOS --ramas "slot/componentes" --dry-run
#
# Opciones:
#   --repo <dir>        Checkout del integrador (obligatorio).
#   --ramas "<a b c>"   Ramas de los slots a relevar (obligatorio).
#   --ref <ref>         Referencia contra la que se cuenta (default: origin/main).
#   --agente <nombre>   Nombre del agente integrador (se informa y exporta como AUTO_HT_AGENTE).
#   --umbral <n>        Commits sin integrar que disparan el ciclo (default: 15).
#   --cooldown <min>    Minutos mínimos entre disparos (default: 20).
#   --estado <archivo>  Marca del último disparo (default: /tmp/auto-ht-<repo>.stamp).
#   --comando "<cmd>"   Comando a ejecutar al disparar (default: solo informa).
#   --force             Ignora el cooldown (para pruebas).
#   --dry-run           No escribe la marca ni ejecuta el comando.
#   --sin-fetch         No hace `git fetch` antes de contar.
#
# Salida: 0 = no correspondía (o dry-run); 10 = disparó (o habría disparado en dry-run).

set -euo pipefail

REPO=""
RAMAS=""
REF="origin/main"
AGENTE="integrador"
UMBRAL=15
COOLDOWN=20
ESTADO=""
COMANDO=""
FORCE=0
DRY_RUN=0
FETCH=1

while [ $# -gt 0 ]; do
  case "$1" in
    --repo) REPO="${2:-}"; shift 2 ;;
    --ramas) RAMAS="${2:-}"; shift 2 ;;
    --ref) REF="${2:-}"; shift 2 ;;
    --agente) AGENTE="${2:-}"; shift 2 ;;
    --umbral) UMBRAL="${2:-}"; shift 2 ;;
    --cooldown) COOLDOWN="${2:-}"; shift 2 ;;
    --estado) ESTADO="${2:-}"; shift 2 ;;
    --comando) COMANDO="${2:-}"; shift 2 ;;
    --force) FORCE=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --sin-fetch) FETCH=0; shift ;;
    -h|--help) sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "auto-ht: opción desconocida «$1» (usá --help)" >&2; exit 2 ;;
  esac
done

[ -n "$REPO" ] || { echo "auto-ht: falta --repo <checkout del integrador>" >&2; exit 2; }
[ -n "$RAMAS" ] || { echo "auto-ht: falta --ramas \"<rama> <rama>\"" >&2; exit 2; }
cd "$REPO"
git rev-parse --git-dir >/dev/null 2>&1 || { echo "auto-ht: $REPO no es un repo git" >&2; exit 2; }

# La marca del último disparo vive fuera del repo: no ensucia el árbol.
SUFIJO="$(basename "$REPO" | tr -c 'a-zA-Z0-9-' '_')"
[ -n "$ESTADO" ] || ESTADO="/tmp/auto-ht-${SUFIJO}.stamp"

# Tipo del commit para la tabla «pendiente de deploy» (`pd`).
tipo_de() {
  case "$1" in
    feat*|feature*) echo "feature" ;;
    fix*) echo "fix" ;;
    test*) echo "test" ;;
    docs*) echo "docs" ;;
    refactor*|perf*|chore*|build*|ci*) echo "${1%%(*}" ;;
    *) echo "otros" ;;
  esac
}

# Cooldown: si el último disparo fue hace menos de N minutos, no se hace nada.
segundos_de() { # fecha de modificación portable (macOS y GNU)
  stat -f %m "$1" 2>/dev/null || stat -c %Y "$1" 2>/dev/null || echo 0
}
if [ "$FORCE" -eq 0 ] && [ -f "$ESTADO" ]; then
  transcurridos=$(( ( $(date +%s) - $(segundos_de "$ESTADO") ) / 60 ))
  if [ "$transcurridos" -lt "$COOLDOWN" ]; then
    echo "auto-ht: en cooldown (${transcurridos} de ${COOLDOWN} min). Nada que hacer."
    exit 0
  fi
fi

# Integrador ocupado: un merge en curso o el propio ciclo corriendo.
if [ -e "$(git rev-parse --git-dir)/MERGE_HEAD" ]; then
  echo "auto-ht: hay un merge en curso en el integrador ($REPO). Se espera."
  exit 0
fi

[ "$FETCH" -eq 1 ] && git fetch --prune --quiet origin 2>/dev/null || true

# Conteo por rama (se ignoran las que no existen en el repo).
TOTAL=0
DETALLE=""
for RAMA in $RAMAS; do
  if ! git rev-parse --verify --quiet "$RAMA" >/dev/null; then
    echo "auto-ht: la rama $RAMA no existe en $REPO (se omite)."
    continue
  fi
  N="$(git rev-list --count "$REF..$RAMA" 2>/dev/null || echo 0)"
  TOTAL=$((TOTAL + N))
  DETALLE+="$(printf '%4d  %s\n' "$N" "$RAMA")"$'\n'
done

echo "auto-ht: $TOTAL commits sin integrar (umbral $UMBRAL) contra $REF"
echo "$DETALLE" | sed '/^$/d'

if [ "$TOTAL" -lt "$UMBRAL" ]; then
  echo "auto-ht: todavía no corresponde (faltan $((UMBRAL - TOTAL)))."
  exit 0
fi

# Tabla «pd»: commit → qué cambia, con su tipo.
echo
echo "Pendiente de deploy (commit → qué cambia):"
for RAMA in $RAMAS; do
  git rev-parse --verify --quiet "$RAMA" >/dev/null || continue
  git log --oneline --no-merges --reverse "$REF..$RAMA" 2>/dev/null | while IFS= read -r linea; do
    hash="${linea%% *}"; asunto="${linea#* }"
    printf '  %s  %-8s %s  (%s)\n' "$hash" "$(tipo_de "$asunto")" "$asunto" "$RAMA"
  done
done

echo
if [ "$DRY_RUN" -eq 1 ]; then
  echo "auto-ht: DRY-RUN — correspondería disparar el hd (agente: $AGENTE). No se ejecuta nada."
  exit 10
fi

# Disparo: marca el cooldown y ejecuta el comando del ciclo (si se pasó uno).
date +%s > "$ESTADO"
export AUTO_HT_AGENTE="$AGENTE"
export AUTO_HT_TOTAL="$TOTAL"
export AUTO_HT_REPO="$REPO"
echo "auto-ht: disparando el ciclo (hd por defecto) con el agente «$AGENTE» (marca: $ESTADO)"
if [ -n "$COMANDO" ]; then
  bash -c "$COMANDO"
else
  echo "auto-ht: sin --comando, el ciclo queda a cargo del dueño/agente: escribí hd (rápido) o hdd/ht (completo)."
fi
exit 10
