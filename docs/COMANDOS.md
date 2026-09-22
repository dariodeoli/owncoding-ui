# Comandos del orquestador

Los comandos con los que el dueño ordena el trabajo de los agentes. Viven acá
para que cualquier app del grupo los conozca; el detalle de roles, worktrees y
ciclo está en `docs/MODOS-DE-TRABAJO.md`.

| Comando | Qué hace |
| --- | --- |
| **`pp`** | Resumen de pendientes: qué hay en producción, ramas con trabajo, agentes activos, issues abiertos y pendientes del dueño. |
| **`pd`** | Pendiente de deploy: tabla **commit → qué cambia** con el tipo de cada cambio (`feature` / `fix` / `test` / `docs`), listo para decidir la ronda. |
| **`al`** | Agentes libres: qué slot está libre y cómo repartir el trabajo pendiente entre los dominios. |
| **`ht`** | Ciclo completo de integración + deploy: **merge → suite de checks → push → `NOVEDADES.md` → release + smoke** de producción. |
| **`hd`** | Alias de `ht` (mismo ciclo). |

## Política automática de integración

Para que las ramas no se acumulen sin integrar:

- Cuando el repo tiene **≥ 15 commits nuevos sin integrar** (suma de
  `git log --oneline main..<rama>` de las ramas con trabajo) **y el integrador
  está libre**, el orquestador dispara un **`hd` automático** — el mismo ciclo
  que `ht`: merge → suite de checks → push → `NOVEDADES.md` → release + smoke.
- **Cooldown de 20 minutos** entre disparos automáticos: si el `hd` recién
  terminó (o falló), no se vuelve a disparar hasta que pase la ventana.
- El umbral y el cooldown se miden sobre el estado real del repo, no sobre la
  cantidad de pedidos: con 14 commits se espera, con 15 se dispara.
- Si hay un merge o un `hd` en curso, el disparo automático espera: nunca hay
  dos ciclos de integración a la vez.
- El dueño puede adelantarlo escribiendo `ht`/`hd` a mano. El disparo
  automático se suma a la política, no la reemplaza: sigue vigente que nada se
  mergea, pushea ni despliega fuera de un `hd`/`ht` o una ronda ordenada.

### Script de referencia: `tools/auto-ht.sh`

El script genérico que implementa la política (cada app lo copia y lo
parametriza: repo del integrador, ramas, agente, umbral y cooldown). Cuenta los
commits sin integrar, arma la tabla del `pd` (commit → qué cambia, con tipo
`feature`/`fix`/`test`/`docs`/…) y, si corresponde, dispara el ciclo con el
comando que le pases.

```bash
# Revisar sin disparar nada (informa y sale)
tools/auto-ht.sh --repo ../MobOS \
  --ramas "slot/componentes slot/diseno slot/impresion" --dry-run

# Cron cada 5 minutos: dispara el hd cuando se juntan 15 commits
*/5 * * * * /ruta/owncoding-ui/tools/auto-ht.sh \
  --repo /ruta/al/checkout-del-integrador \
  --ramas "slot/componentes slot/diseno slot/impresion" \
  --agente integrador --umbral 15 --cooldown 20 \
  --comando 'herdr agent run integrador "hd"' >> /tmp/auto-ht.log 2>&1
```

| Opción | Para qué |
| --- | --- |
| `--repo <dir>` | Checkout del integrador (obligatorio) |
| `--ramas "<a b c>"` | Ramas de los slots a relevar (obligatorio) |
| `--ref <ref>` | Referencia contra la que se cuenta (default `origin/main`) |
| `--agente <nombre>` | Agente integrador a invocar (se exporta como `AUTO_HT_AGENTE`) |
| `--umbral <n>` / `--cooldown <min>` | 15 commits / 20 min por defecto |
| `--comando "<cmd>"` | Ciclo a ejecutar al disparar (default: solo informa) |
| `--estado <archivo>` | Marca del último disparo (default `/tmp/auto-ht-<repo>.stamp`) |
| `--force` / `--dry-run` / `--sin-fetch` | Pruebas y control fino |

Siempre: si hay un merge en curso en el integrador, espera; nunca corre dos
ciclos a la vez; y sin `--comando` solo informa (el `hd` lo escribe el dueño).

## Reglas

- **Nada se mergea, pushea ni despliega sin `ht`** (o una ronda explícitamente
  ordenada por el orquestador). El único que toca `main` y despliega es el
  implementador (integrador), y lo hace con `MOBOS_INTEGRATOR=1`.
- **Los conflictos se resuelven en el worktree del slot que rebasea**, contra el
  main del integrador, y se avisan en el handover. Nunca se resuelven en `main`
  ni en el checkout del integrador, y nunca en silencio. Si después del rebase
  el diff neto contra `main` queda vacío, la rama quedó superseded: se descarta
  y se avisa.
- **El orquestador no toca código**: abre issues (backlog canónico), elige el
  slot por dominio, briefea, sigue los handovers, ordena la integración y
  mantiene el estado. No mergea, no pushea, no despliega y no resuelve
  conflictos.
- Cada entrega cierra con los **checks de entrega** (lint, tests, builds con
  `BUILD_ID`, prisma, smoke) y el bloque **«Novedades para el dueño»** (2-5
  bullets en lenguaje de producto).

Referencia: `docs/MODOS-DE-TRABAJO.md` (roles, ramas, ciclo de un pedido,
handover y releases) y el `AGENTS.md` de cada repo.
