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
