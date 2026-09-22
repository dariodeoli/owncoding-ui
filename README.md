# OwnCoding UI

Componentes, objetos y reglas de interfaz **reutilizables entre todas las apps
de OwnCoding** (MobOS, ScaleOS, LedBox, PagaYa): un solo paquete, sin copiar y
pegar entre repos.

Filosofía: **buscar antes de crear**. Si un campo, un aviso, una celda o una
regla ya existe acá, se usa tal cual; si falta, se crea en este paquete y se
adopta en todas las apps. Los objetos no saben de negocio: no hacen `fetch`, no
leen stores ni conocen el router; reciben props y devuelven interfaz.

## Cómo lo consume una app

```bash
npm install github:dariodeoli/owncoding-ui
# repo privado con SSH:  npm install git+ssh://git@github.com/dariodeoli/owncoding-ui.git
```

`prepare` corre el build al instalar (npm instala las devDependencies de una
dependencia git para eso). El bundle ya queda commiteado en `dist/` por si la
instalación se hace con `--ignore-scripts`. Alternativa sin git: publicar el
mismo paquete en GitHub Packages (`npm.pkg.github.com`) y consumirlo con
`@dariodeoli/owncoding-ui`; el paquete es el mismo, cambia el registry.

Requisitos: **React 18+** y **Tailwind CSS 3.4+**.

```js
// tailwind.config.js
import preset from 'owncoding-ui/tailwind-preset'
export default { presets: [preset], content: ['./index.html', './src/**/*.{js,jsx}'] }
```

```css
/* tu CSS principal, después de las directivas de Tailwind */
@tailwind base;
@tailwind components;
@tailwind utilities;
@import 'owncoding-ui/styles.css'; /* tokens de tema (claro/oscuro) y base */
```

```jsx
import { Button, Aviso, EmptyState, montoTexto, CELDA_DATO } from 'owncoding-ui'

<Button onClick={guardar}>Guardar</Button>
{error && <Aviso>{error}</Aviso>}
{montoTexto(pedido.totalPyg)}
```

Cada app pisa sus colores en `:root` (y `.dark`) sin tocar la librería; el
acento es el token `fono` (borde `--c-fono`, etc.). La paleta de referencia es
la de MobOS.

## Qué incluye (v0.1.0)

- **Campos:** `Input`, `Textarea`, `Select`, `Label`, `FormField`,
  `MoneyInput`, `PinInput`, `PasswordInput`, `Switch`, `SegmentedField`,
  `SearchField`, `PercentField` (+`parsePercent`/`formatPercent`),
  `CurrencySelect`.
- **Acciones y contenedores:** `Button`, `IconAction`, `Card`, `Stat`,
  `Modal`, `ConfirmDialog`, `Drawer`, `ToastProvider`/`useToast`, `Subtabs`.
  El interruptor booleano es **`Switch`** (un solo objeto; #186 retiró el alias
  `Toggle`).
- **Estados y avisos:** `Aviso` (error/ok/warn, con contenedor), `EmptyState`,
  `ErrorState`, `Skeleton`, `Badge`, `Dot`.
- **Datos:** `Money`, `FilaDato`, `CeldaMoneda`, `BarraProgreso`,
  `DataTable`, `PageHeader`, `Eyebrow`, clases de tabla `CELDA_DATO`,
  `CELDA_NUMERO`, `CELDA_ENCABEZADO`, `ROTULO_DATO`, `ROTULO_SECCION`.
- **Lógica:** `cn`, `primerNombre`, moneda (`formatGs`, `montoTexto`, …),
  fechas (`fechaHora`, `fechaCorta`, …), teléfono/WhatsApp (`whatsappUrl`,
  `telefonoVisible`, …).

## Estructura

```
src/components/   objetos portables (ui.jsx = primitivas y objetos)
src/utils/        lógica compartida pura (moneda, fechas, teléfono, tabla, cn)
src/styles/       tokens.css
docs/             REGLAS.md · MODOS-DE-TRABAJO.md · PLANTILLA-AGENTS.md
scripts/build.mjs build (esbuild → dist/index.js + dist/styles.css)
test/             smoke de render (vitest + renderToStaticMarkup) y lógica
```

## Versionado

- `v0.x` = biblioteca en formación; los objetos pueden cambiar de nombre.
- Cada release sube la versión del `package.json` y se etiqueta (`v0.1.0`).
- Una app adopta una versión fija; para subir, se cambia la dependencia y se
  corren sus checks (la adopción es un cambio de la app, no de la librería).

## Pendientes (fase 2)

- **Identidad unificada (#211, DSN):** entra cuando esté cerrada en MobOS
  (`PersonaChip`/`UsuarioIdentidad` + Avatar). Acá queda el TODO.
- **Tipos:** el paquete se distribuye en JS/JSX; falta generar `.d.ts`.
- **Adopción por app:** migrar MobOS (y luego ScaleOS, LedBox, PagaYa) a
  consumir el paquete sin romper nada. Ver `docs/MODOS-DE-TRABAJO.md`.
- Objetos de MobOS que aún no se portaron: `Avatar`, `ComprobantePreview`,
  `SeccionColapsable`, combos con datos (`BancoCombobox`, `ProductCombobox`,
  `CityAutocomplete`) y el agente de impresión (no es UI).
