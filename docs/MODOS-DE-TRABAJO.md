# Modos de trabajo — OwnCoding

Cómo se trabaja en las apps del grupo (MobOS, ScaleOS, LedBox, PagaYa) y cómo
se mantiene esta biblioteca. Es el mismo esquema probado en MobOS, portable.

## Piezas y límites

```
Dueño ──▶ ORQUESTADOR ──▶ SLOTS (worktrees, ramas persistentes)
              │                │ handover
              └──▶ INTEGRADOR ◀─┘  (único dueño de main: merge, checks, push, deploy)
```

| Pieza | Dónde vive | Qué hace | Qué NO hace |
| --- | --- | --- | --- |
| **Orquestador** | carpeta de coordinación, sin repo (`~/.herdr/worktrees/<app>/orquestador/`) | interlocutor único del dueño: abre issues, elige slot, briefea, sigue handovers, ordena la integración | no mergea, no pushea, no despliega, no edita código |
| **Integrador** | checkout principal de `main` | verifica por contenido, `merge --no-ff` una rama por vez, checks del árbol mergeado, push, cierra issues, despliega | no implementa features, no resuelve conflictos reales en silencio |
| **Slots** | un worktree por dominio, rama persistente | implementan, commitean por unidad, corren checks, entregan handover | no mergean ni pushean a `main`, no despliegan, no tocan worktrees ajenos |
| **Librería (este repo)** | `owncoding-ui` | objetos y reglas compartidas; se versiona y se consume como dependencia | no tiene lógica de negocio ni estado de ninguna app |

## Ramas y worktrees

- Una rama persistente por slot (`slot/<dominio>`); no se crea rama por tarea.
- Antes de cada tarea: `git fetch origin --prune && git rebase origin/main`.
  Después de cada integración, la rama se reposiciona y sigue viva.
- `--force-with-lease` solo a la rama propia; **jamás** a `main`.
- `main` se protege con hook local (`pre-push`) y branch protection de GitHub:
  solo el integrador pushea a `main` (con la variable de entorno del proyecto).

## Ciclo de un pedido

> Los comandos abreviados del dueño (`pp`, `pd`, `al`, `ht`, `hd`) están en
> **`docs/COMANDOS.md`**: `ht` es el ciclo completo (merge → suite → push →
> `NOVEDADES.md` → release + smoke).

1. El dueño le cuenta el problema al orquestador, en lenguaje de producto.
2. El orquestador abre un issue (plantilla) y elige el slot por dominio.
3. Brief al slot: issue, alcance, criterio, rama, checks, handover.
4. El slot rebasea, implementa, commitea (conventional commits sin atribución
   de IA, citando `Refs #N`), corre los checks, pushea su rama y entrega
   handover.
5. El integrador verifica por contenido contra `origin/main`, mergea una rama
   por vez, corre los checks del árbol mergeado, pushea y cierra el issue.
6. El deploy es solo con pedido explícito (o el comando abreviado acordado con
   el dueño) y se valida con el smoke de producción.

## Handover (obligatorio)

- Rama y `git log --oneline origin/main..HEAD`.
- Qué hace cada commit y rutas tocadas.
- Resultado de cada check.
- Bloque **Novedades para el dueño**: 2–5 bullets en lenguaje de producto, sin
  jerga técnica (ver `docs/NOVEDADES.md` de cada app).
- Riesgos, pendientes y conflictos de dominio detectados.

## Checks de entrega (frontend)

1. Lint con 0 errores.
2. Build de la app (y del API si aplica) con artefacto verificado.
3. Suite de tests en verde.
4. Cero marcadores de conflicto.
5. e2e smoke con puertos/base aislados por worktree cuando haya app.
6. Si se tocó el schema: validación + migración idempotente + `db:check`.

## QA

- Cada dominio tiene su spec e2e; el smoke subset es el gate rápido y la suite
  completa es el gate de release.
- QA visual en 360/768/1440 y en claro/oscuro.
- Los bugs se reproducen con evidencia (captura o spec) antes de arreglarlos.

## Releases y deploy

- Una sola fuente de versión; el release bueno sube patch, corre checks,
  publica y avisa la versión desplegada explícita.
- Nadie presenta local como publicado; si falta un dato del proveedor, se
  informa “no disponible”.

## La biblioteca (esta repo)

- **Se versiona con tags** (`v0.x.y`); cada app adopta una versión fija.
- Un objeto nuevo entra acá con: props claras, sin acoplarse a una app, tests
  de render/lógica y su regla en `docs/REGLAS.md`.
- La adopción por app es un cambio de la app (rama de su slot), no de la
  librería: se cambia la dependencia, se reemplazan las copias y se corren los
  checks de la app.
- Los conflictos entre apps se resuelven acá: si dos apps necesitan variantes,
  la prop (no la copia) es el camino.

## Por app

| App | Estado | Notas |
| --- | --- | --- |
| **MobOS** | Modo completo (orquestador + integrador + slots por dominio + deploy con release) | Es la fuente de los objetos portados. La adopción de la librería es la fase 2. |
| **ScaleOS** | A completar | Copiar el modo de MobOS y ajustar dominios, puertos y comando de release. |
| **LedBox** | A completar | Ídem. |
| **PagaYa** | A completar | Ídem. |

Plantilla para configurar agentes y slots en una app nueva:
`docs/PLANTILLA-AGENTS.md`.
