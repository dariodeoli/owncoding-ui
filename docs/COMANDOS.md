# Comandos del orquestador

Los comandos con los que el dueño ordena el trabajo de los agentes. Viven acá
para que cualquier app del grupo los conozca; el detalle de roles, worktrees y
ciclo está en `docs/MODOS-DE-TRABAJO.md`.

| Comando | Qué hace |
| --- | --- |
| **`pp`** | Resumen de pendientes: qué hay en producción, ramas con trabajo, agentes activos, issues abiertos y pendientes del dueño. |
| **`pd`** | Pendiente de deploy: tabla **commit → qué cambia** con el tipo de cada cambio (`feature` / `fix` / `test` / `docs`), listo para decidir la ronda. |
| **`al`** | Agentes libres: qué slot está libre y cómo repartir el trabajo pendiente entre los dominios. |
| **`hd`** | **Deploy rápido**: merge + specs afectados en verde + push + release. Sin suite completa y sin smoke. |
| **`hdd`** | **Deploy completo**: `hd` + suite completa + CI verde + smoke de producción + cierres. |
| **`ht`** | Nombre histórico del deploy completo (equivale a `hdd`). |

## Los dos modos de deploy

### `hd` — rápido (rutina)

Para integrar y publicar seguido, sin frenar la ronda:

1. Preámbulo: matar servidores zombies del repo y verificar que no haya otro
   merge en curso (`.git/MERGE_HEAD` ajeno).
2. `git fetch origin --prune` y relevar las ramas con trabajo (`pd`).
3. Integrar **de a una rama por vez** (API antes que frontend cuando aplique)
   verificando el árbol mergeado: lint, builds con `BUILD_ID` y tests, más los
   **specs afectados** por lo que entró (unitarios y e2e del dominio tocado),
   todos en verde. Conflictos: parar y consultar; rama superseded: resolver del
   lado de `main` y verificar diff neto vacío.
4. Push a `main` con `<APP>_INTEGRATOR=1`.
5. Release: bump de patch + `NOVEDADES.md` + push/tag (y el deploy del proyecto
   si corresponde).
6. Reportar qué ramas integró y la versión publicada.

**No** corre la suite completa, **no** espera el CI y **no** hace smoke de
producción; tampoco cierra issues.

### `hdd` — completo (ronda de release)

El gate de release: lo mismo que `hd` y además, con todo integrado:

7. **Suite completa** en verde (e2e completa del proyecto).
8. **CI verde** en GitHub para el push a `main`.
9. **Smoke de producción**, reintentando hasta que sirva la versión nueva.
10. **Cierre de issues** verificando por contenido contra `origin/main` (citando
    el commit) e incluyendo el bloque «Novedades para el dueño».

`ht` es el nombre con el que históricamente se pedía este ciclo completo; sigue
funcionando como alias de `hdd`.

## Política automática de integración

Para que las ramas no se acumulen sin integrar:

- Cuando el repo tiene **≥ 15 commits nuevos sin integrar** (suma de
  `git log --oneline main..<rama>` de las ramas con trabajo) **y el integrador
  está libre**, el orquestador dispara un **`hd` automático** (modo rápido).
- El **`hdd` (completo) no se dispara solo**: lo pide el dueño/orquestador
  cuando quiere la ronda con suite completa, CI, smoke y cierres.
- **Cooldown de 20 minutos** entre disparos automáticos: si el `hd` recién
  terminó (o falló), no se vuelve a disparar hasta que pase la ventana.
- El umbral y el cooldown se miden sobre el estado real del repo, no sobre la
  cantidad de pedidos: con 14 commits se espera, con 15 se dispara.
- Si hay un merge o un ciclo en curso, el disparo automático espera: nunca hay
  dos ciclos de integración a la vez.
- El dueño puede adelantarlo escribiendo `hd` o `hdd` (`ht`) a mano. El disparo
  automático se suma a la política, no la reemplaza: sigue vigente que nada se
  mergea, pushea ni despliega fuera de un ciclo o una ronda ordenada.

### Script de referencia: `tools/auto-ht.sh`

El script genérico que implementa la política (cada app lo copia y lo
parametriza: repo del integrador, ramas, agente, umbral y cooldown). Cuenta los
commits sin integrar, arma la tabla del `pd` (commit → qué cambia, con tipo
`feature`/`fix`/`test`/`docs`/…) y, si corresponde, dispara el ciclo con el
comando que le pases (el automático usa `hd`, el modo rápido).

```bash
# Revisar sin disparar nada (informa y sale)
tools/auto-ht.sh --repo ../MobOS \
  --ramas "slot/componentes slot/diseno slot/impresion" --dry-run

# Cron cada 5 minutos: dispara el hd (rápido) cuando se juntan 15 commits
*/5 * * * * /ruta/owncoding-ui/tools/auto-ht.sh \
  --repo /ruta/al/checkout-del-integrador \
  --ramas "slot/componentes slot/diseno slot/impresion" \
  --agente integrador --umbral 15 --cooldown 20 \
  --comando 'herdr agent prompt integrador "hd"' >> /tmp/auto-ht.log 2>&1
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
ciclos a la vez; y sin `--comando` solo informa (el ciclo lo escribe el dueño).

## Reglas

- **Nada se mergea, pushea ni despliega sin un ciclo (`hd`/`hdd`, o `ht`)** o
  una ronda explícitamente ordenada por el orquestador. El único que toca
  `main` y despliega es el implementador (integrador), y lo hace con
  `MOBOS_INTEGRATOR=1`.
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

## Glosario (en simple)

Para leer los reportes sin jerga: estas son las palabras que aparecen en los
handovers y en el tablero.

| Palabra | Qué significa |
| --- | --- |
| **Suite** | El conjunto **completo** de pruebas automáticas de la app: recorre todas las pantallas y flujos como lo haría una persona. «La suite quedó verde» = pasó todo. |
| **Specs afectados** | Las pruebas que cubren **justo lo que se tocó** en la ronda (por ejemplo, las de Ventas si se cambió el carrito). Son las que corre el modo rápido. |
| **Unitarias** | Pruebas de una pieza chica y aislada (un cálculo, un formato): rápidas y sin abrir la app. |
| **Integración** | Pruebas de varias piezas juntas (por ejemplo, la pantalla con la API y la base), para ver que se hablen bien. |
| **E2E** (de punta a punta) | La prueba que hace el recorrido completo en un navegador automático: entrar, cargar una venta, ver el pedido. Es la que más se parece a usar la app. |
| **Smoke** | La verificación «de humo» sobre producción ya publicada: comprueba que lo esencial esté vivo y sirviendo la versión nueva. No reemplaza a la suite; avisa rápido si algo quedó apagado. |
| **CI** | El robot de GitHub que corre las pruebas solo cada vez que sube código. **Verde** = todo pasó; **rojo** = algo falló y hay que arreglarlo antes de publicar. |
| **Gate** | La «puerta» de calidad: el punto donde hay que estar en verde para seguir (por ejemplo, la suite antes del release o el CI antes de cerrar). Nada pasa si está en rojo. |
| **Release** | La **publicación** de una versión nueva: sube el número, se anota en `NOVEDADES.md` y sale a producción. |
| **Ronda** | Una **tanda** de trabajo: lo que hicieron los slots en un período, integrado y publicado (por ejemplo, «la ronda .145»). |
| **NOVEDADES.md** | El registro de lo que salió a producción, contado en lenguaje de negocio. Cada versión agrega su sección y todo handover/cierre incluye el bloque «Novedades para el dueño». |
| **`hd`** (rápido) | El deploy de **rutina**: integra las ramas, pasa los specs afectados, sube y publica. No corre toda la suite ni verifica producción. |
| **`hdd`** (completo) | El deploy de **ronda**: todo lo del rápido + suite completa + CI verde + smoke de producción + cierre de issues. `ht` es su alias histórico. |
