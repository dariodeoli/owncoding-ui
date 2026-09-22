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
# Versión fija (recomendado: se adopta una versión y se sube a propósito)
npm install github:dariodeoli/owncoding-ui#v0.9.0

# Rama principal (solo para probar)
npm install github:dariodeoli/owncoding-ui

# Repo privado por SSH
npm install git+ssh://git@github.com/dariodeoli/owncoding-ui.git#v0.2.2
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

### Notas de release

- **v0.10.0** — sistema v2 "device ops" (#240/#241): tokens consola (`.consola`
  + verde `pass` + azul `accion`), `ChipEstado`, `ChipsLocks`, `SemaforoItem`,
  `FilaChecklist`/`ConteoChecklist`, `TileEquipo`, `Stepper`, `MedidorBateria`
  y `GradoBadge`; iconos de categoría `IconoCategoria` + `CATEGORIAS_PRODUCTO`
  / `ICONO_CATEGORIA` (#242). Props y reglas en `docs/REGLAS.md` §8 bis.
- **v0.9.0** — `Nota` (superficie informativa warn/info/neutra, sin `role`),
  `BarraProgreso` con `pista`/`relleno` y tono `onbrand` para las barras de
  gráfico, `BotonDentroCampo`, `esRazonSocial` y el tamaño estándar de modal
  (`Modal size` + `TAMANOS_MODAL`). El README de consumo queda en la versión
  publicada.
- **v0.8.0** — ancho de modales por tipo (`Modal size` + `TAMANOS_MODAL`:
  corto/formulario/amplio/completo, sin `max-w-*` suelto), `BotonDentroCampo`
  (acción trailing dentro del input, con tooltip y «Consultando…») y
  `esRazonSocial` (`normalizarNombre` ya no reordena razones sociales).
- **v0.7.0** — piezas de formulario: `GRILLA_DOS_COLUMNAS` (+ `_COMPACTA`),
  `PIE_ACCIONES` y `PIE_ACCIONES_REVERSO` (mismo criterio que las clases de
  tabla).
- **v0.6.0** — `CELDA_IDENTIDAD` (celda de nombre en tablas) y consumo más
  simple: el preset ya incluye el bundle de la librería en el `content` de
  Tailwind (si no, las clases de los componentes se purgan).
- **v0.5.0** — catálogos por defecto (263 ciudades con departamento, modelos de
  iPhone y accesorios), tamaños de campo (`TAMANOS_CAMPO`) y modelos de
  impresión (`crearTicket` ESC/POS + `paginaDePrueba`).
- **v0.4.0** — impresión LAN/USB (`AjustesImpresion`, `BotonImprimir`),
  navegación (`NavLateral`, `MenuDesplegable`), ajustes (`PanelDerecho`,
  `TarjetaAjuste`) y bancos de Paraguay.
- **v0.3.0** — familia de acceso (Google, `AuthLayout`, `ProductFooter`,
  `LoadingScreen`, `PegarEnlaceToken`) y campos ampliados (correo, teléfono,
  serial, Instagram), sin API.
- **v0.2.2 / v0.2.1** — documentación de consumo y robustez (`exports`,
  `engines`, CI).
- **v0.2.0 (cambio incompatible)** — se retiró el alias `Toggle` (#186).
  **Actualizar:** reemplazar `Toggle` por `Switch`; el callback ahora recibe el
  evento (`onChange={(event) => setValor(event.target.checked)}`) en vez del
  booleano. Los alias de compatibilidad no viven en esta librería.
- Detalle completo por versión: `CHANGELOG.md`.

### Ejemplo completo de consumo

```jsx
// main.jsx (Vite o Next.js cliente)
import 'owncoding-ui/styles.css' // después de las directivas de Tailwind

// pantalla
import { AjustesImpresion, BotonImprimir, Card, CELDA_IDENTIDAD, CityAutocomplete, MoneyInput, montoTexto } from 'owncoding-ui'

export function Pantalla({ impresoras, onGuardar, onImprimir, ciudad, setCiudad }) {
  return (
    <Card className="space-y-3">
      <p className="tabular-nums">{montoTexto(1250000)}</p>
      <MoneyInput value={0} onValueChange={() => {}} />
      <CityAutocomplete value={ciudad} onSelect={(c, d) => setCiudad(c, d)} />
      <span className={CELDA_IDENTIDAD}>Cliente de prueba</span>
      <AjustesImpresion impresoras={impresoras} onGuardar={onGuardar} />
      <BotonImprimir onImprimir={onImprimir} />
    </Card>
  )
}
```

### Adopción en una app (checklist)

1. Instalar la versión fija por tag y configurar el preset en Tailwind.
2. Importar `owncoding-ui/styles.css` después de las directivas de Tailwind.
3. Definir la paleta de la app en `:root`/`.dark` (si no usa la de referencia).
4. Reemplazar los objetos locales por los de la librería, de a un objeto por
   commit (sin mezclar con cambios de negocio).
5. Correr lint + tests + build + e2e smoke de la app.
6. Si falta un objeto, se crea acá (con test) y después se adopta en la app.

## Qué incluye (v0.10.0)

- **Campos:** `Input`, `Textarea`, `Select`, `Label`, `FormField`,
  `MoneyInput`, `PinInput`, `PasswordInput`, `Switch`, `SegmentedField`,
  `SearchField`, `BotonDentroCampo` (acción trailing dentro del input),
  `PercentField` (+`parsePercent`/`formatPercent`),
  `CurrencySelect`, `EmailField` (sugerencia de dominios), `PhoneField`
  (código de país + validación), `SerialField` (IMEI/serial), `InstagramField`.
- **Acceso (sin API):** `GoogleButton` (+`GoogleMark`, `OAuthDivider`),
  `AuthLayout` (slots de logo/copy/acciones/pie), `ProductFooter`,
  `LoadingScreen` y `PegarEnlaceToken` (extrae el token del enlace). No leen
  sesión ni llaman a la API: reciben props y avisan por callback.
- **Acciones y contenedores:** `Button`, `IconAction`, `Card`, `Stat`,
  `Modal` (ancho por `size`: corto/formulario/amplio/completo),
  `ConfirmDialog`, `Drawer`, `ToastProvider`/`useToast`, `Subtabs`.
  El interruptor booleano es **`Switch`** (un solo objeto; #186 retiró el alias
  `Toggle`).
- **Navegación y shell:** `NavLateral` (colapsable, modelo `[{id,label,icono,contador}]`),
  `MenuDesplegable` (usuario, acciones de fila), `AuthLayout`, `ProductFooter`,
  `LoadingScreen`.
- **Ajustes (modelo):** `PanelDerecho` (contenido + formulario fijo a la
  derecha) y `TarjetaAjuste` (título/descripción/acción + cuerpo).
- **Impresión LAN/USB (funcional):** `AjustesImpresion`, `BotonImprimir` y
  `printing/estadoImpresoras.js` (estados honestos, destinos `lan:<ip>:<puerto>`
  y `cups:<cola>`). Guía completa: `docs/IMPRESION.md`.
- **Bancos de Paraguay:** catálogo `BANCOS_PARAGUAY` como predeterminado,
  `BancoCombobox` y `BancoLogo` (archivo/marca/monograma, sin cuadros rotos).
- **Catálogos por defecto (Paraguay):** `CIUDADES_PARAGUAY` (263 municipios con
  departamento) + `CityAutocomplete` (el departamento se resuelve solo con la
  ciudad), `MODELOS_IPHONE`, `CAPACIDADES_IPHONE`, `COLORES_IPHONE` y
  `CATEGORIAS_ACCESORIOS`. Se actualizan acá y llegan a todas las apps.
- **Tamaños de campo:** `TAMANOS_CAMPO` (`moneda: w-36`, `porcentaje: w-24`,
  `cantidad: w-20`, `fecha: w-40`, …) para que los campos no se estiren de más;
  `MoneyInput` y `PercentField` ya traen su ancho recomendado.
- **Tamaños de modal:** `TAMANOS_MODAL` (`corto`, `formulario`, `amplio`,
  `completo`) con el predeterminado `formulario`; se elige con `size` y no se
  pasa `max-w-*` suelto.
- **Piezas de formulario:** `GRILLA_DOS_COLUMNAS` (+ `_COMPACTA`) y
  `PIE_ACCIONES`/`PIE_ACCIONES_REVERSO` en `utils/formulario.js`.
- **Impresión — modelos:** `crearTicket` (ESC/POS 58/80 mm) y `paginaDePrueba`
  (verificador con validación de 4 dígitos y secciones por tipo). Ver
  `docs/IMPRESION.md`.
- **Estados y avisos:** `Aviso` (error/ok/warn, con contenedor), `Nota`
  (aclaración sin `role`: warn/info/neutra, `compact`), `EmptyState`,
  `ErrorState`, `Skeleton`, `Badge`, `Dot`.
- **Operación de equipos (#240/#241):** `SemaforoItem`, `FilaChecklist` (+
  `ConteoChecklist` "x de y pass"), `ChipEstado`, `ChipsLocks`,
  `MedidorBateria`, `GradoBadge`, `TileEquipo`, `Stepper` y los estados en
  `utils/estadoEquipo.js`; tema **consola** y verde `pass` en `styles.css`.
- **Categorías de producto (#242):** `IconoCategoria` (mobile/laptop/tablet/
  watch/buds/cable) + `CATEGORIAS_PRODUCTO`, `ICONO_CATEGORIA` y
  `normalizarCategoria` en `utils/categorias.js`.
- **Datos:** `Money`, `FilaDato`, `CeldaMoneda`, `BarraProgreso`
  (`pista`/`relleno` para las barras de gráfico),
  `DataTable`, `PageHeader`, `Eyebrow`, clases de tabla `CELDA_DATO`,
  `CELDA_NUMERO`, `CELDA_ENCABEZADO`, `ROTULO_DATO`, `ROTULO_SECCION`.
- **Lógica:** `cn`, `primerNombre`, moneda (`formatGs`, `montoTexto`, …),
  fechas (`fechaHora`, `fechaCorta`, …), teléfono/WhatsApp (`whatsappUrl`,
  `telefonoVisible`, …), seriales (`ultimos4`, `serialEnmascarado`) y tokens de
  acción (`extractTokenFromUrl`).

## Estructura

```
src/components/   objetos portables (ui.jsx = primitivas y objetos)
src/utils/        lógica compartida pura (moneda, fechas, teléfono, nombre, bancos, tabla, cn)
src/printing/     estado de impresoras y trabajos (puro)
src/styles/       tokens.css
docs/             REGLAS.md · MODOS-DE-TRABAJO.md · PLANTILLA-AGENTS.md · IMPRESION.md · ALIMENTAR.md
scripts/build.mjs build (esbuild → dist/index.js + dist/styles.css)
test/             smoke de render (vitest + renderToStaticMarkup) y lógica
```

## Alimentar la biblioteca

La biblioteca crece con lo que ya funciona en las apps y también cosecha de
otras apps del grupo: ver `docs/ALIMENTAR.md` (criterio, pasos y cuándo no
traerlo).

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
