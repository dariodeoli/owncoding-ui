# Reglas de interfaz — OwnCoding

Reglas vivas, portables a cualquier app del grupo. Antes de crear un campo, un
aviso o una celda, se busca acá y se usa el objeto del paquete. Si algo falta,
se crea en `owncoding-ui` y se adopta en todas las apps.

## 1. Campos de formulario

### Tabla por tipo de dato

| Tipo | Objeto | Patrón |
| --- | --- | --- |
| Texto libre | `Input` + `Label`/`FormField` | label arriba (`htmlFor`), `required` real, `maxLength` por tipo (120/200) |
| Texto largo | `Textarea` | hasta 2000/400 según uso, `rows` fijo |
| Moneda Gs/USD | `MoneyInput` + `CurrencySelect` | PYG sin decimales, USD/monedas con 2; el símbolo lo dibuja el campo; `max` por tipo de monto |
| Moneda de solo lectura | `Money` | nunca convertir a mano; no finito → `—` |
| Porcentaje | `PercentField` | coma decimal, 0–100; guardar con `parsePercent`, mostrar con `formatPercent` |
| Teléfono | `PhoneField` | código de país editable (default +595), valida con `telefonoValido`; guardar con `componerTelefono` |
| Correo | `EmailField` | sugiere dominios mientras se tipea, sin romper pegado/autofill |
| Serial/IMEI | `SerialField` | mayúsculas, sin espacios ni prefijo; varios seriales con normalización propia (prop `normalizar`) |
| Fechas/horas | `Input type="date"`/`datetime-local` | 24 h; para mostrar, `fechaHora`/`fechaDia`/`fechaCorta` |
| Booleano | `Switch` | interruptor estilo iPhone, guarda `onChange(event.target.checked)` |
| Selección múltiple | `Input type="checkbox"` | para listas con varias filas |
| Opciones excluyentes (2–5) | `SegmentedField` | `aria-pressed`; opciones `[id, etiqueta, icono?, contador?]` |
| Subnavegación | `Subtabs` | pestañas anchas de una subpágina |
| Catálogo cerrado | `Select` | nunca texto libre para catálogos |
| Lista/cuadrícula | `ListGridToggle` | solo íconos, `aria-pressed` |
| Búsqueda instantánea | `SearchField` | lupa + limpiar; el debounce vive en la pantalla |
| Acción dentro del campo | `BotonDentroCampo` | botón trailing **adentro** del input (`relative` + `pr-11`): ícono con tooltip (`title`/`aria-label`) y estado ocupado «Consultando…» con spinner; vacío → `disabled`. La pantalla decide qué hace `onClick` (la librería no consulta nada) |
| Ciudad | `CityAutocomplete` | sugiere al tipear y **resuelve el departamento solo** (es dependiente de la ciudad); el texto libre sigue permitido |

### Tamaños recomendados (#148, portable)

| Dato | Clase | Ejemplo |
| --- | --- | --- |
| Monto | `w-36` (`monedaAmplia`: `w-44` en ventas) | Gs 12.500.000 |
| Porcentaje | `w-24` | 12,5 |
| Cantidad | `w-20` | 999 |
| Fecha | `w-40` | 17/09/2026 |
| Teléfono | `w-44` | +595 981 123 456 |
| RUC/CI | `w-44` | 80012345-6 |
| IP | `w-40` | 192.168.1.50 |
| Ciudad | `w-56` | Ciudad del Este |

`TAMANOS_CAMPO` (librería) trae los valores; `MoneyInput` y `PercentField` ya
aplican su ancho por defecto y la pantalla puede pisarlo (`w-full` cuando el
campo va solo). Regla: **el campo no se estira más de lo que el dato necesita**;
si hay espacio libre, se lo lleva el layout, no el input.

Transversales: error **o** hint (nunca ambos), `aria-invalid` +
`aria-describedby`, error con `role="alert"`, teclado móvil correcto y nada de
máscaras que rompan pegado/autofill. El servidor revalida siempre. El
interruptor booleano es **`Switch`** (un solo objeto; #186 retiró el alias
`Toggle` y la librería no expone alias de compatibilidad).

## 2. Botones y acciones

- Jerarquía: primario (marca), secundario/outline, peligro (rojo, nunca marca),
  fantasma. No se restylean sin pedido.
- Botón solo-icono: `IconAction` (trae `aria-label` y `title`).
- Deshabilitado: opacidad reducida y `cursor: not-allowed`; foco visible.
- Altura táctil ≥44 px en móvil; radios por contexto.

## 2 bis. Acceso (login/registro)

- `GoogleButton` (+ `GoogleMark`, `OAuthDivider`) para el acceso con Google;
  `AuthLayout` arma la pantalla (slots de logo, copy de marca, acciones y pie);
  `ProductFooter` y `LoadingScreen` son institucionales y van por props.
- `PegarEnlaceToken` resuelve los enlaces de correo que llegan incompletos.
- Todos son **sin API**: no leen sesión ni llaman al backend; la app maneja el
  flujo y pasa callbacks.

## 3. Avisos, estados y vacíos

- `Aviso` es el único objeto para el mensaje inline: `tono="error"` (role
  `alert`), `tono="ok"`/`tono="warn"` (role `status`), `compact` para el tamaño
  chico, `como="div"` cuando el contenido es estructurado (ícono o botón de
  reintentar). No se copia el `<p>` con borde y fondo de color.
- Vacíos: `EmptyState` (`compact` dentro de tablas y paneles), con acción
  opcional.
- Carga: `Skeleton` para placeholders; las pulsaciones decorativas (un ícono,
  un punto de estado) no son skeletons.
- Errores de pantalla completa: `ErrorState` con reintento.

## 4. Datos y tablas

- Encabezado: `CELDA_ENCABEZADO` (una línea, truncado); rótulos de sección:
  `ROTULO_SECCION`; etiqueta de dato: `ROTULO_DATO`.
- Dato secundario: `CELDA_DATO`; número/cantidad: `CELDA_NUMERO`
  (`text-right tabular-nums`); **dinero: `CeldaMoneda`** (renderiza `Money`).
- `FilaDato`: fila etiqueta/valor de paneles de detalle (mantiene `dt`/`dd`).
- Barras de avance: `BarraProgreso` (accesible, con tono y altura).
- Reglas: misma altura de fila, sin cortes de texto, acciones en una línea,
  montos/fechas/códigos con `nowrap` + dígitos tabulares.
- Vacíos y estados dentro de la tabla: `EmptyState compact`.

## 5. Diálogos y overlays

- **Ancho por tipo, no por uso:** `Modal` expone `size` y el ancho vive en
  `utils/modal.js` (`TAMANOS_MODAL`): `corto` = `max-w-md` (avisos,
  confirmaciones y formularios de un campo), `formulario` = `max-w-xl`
  (predeterminado: formularios de una columna), `amplio` = `max-w-3xl`
  (formularios de dos columnas, tablas y contenido amplio) y `completo` =
  `max-w-5xl` (editores y pantallas grandes). No se pasa `max-w-*` en el
  `className` de un modal. `ConfirmDialog` usa `corto`.
- **Sin franjas vacías:** el contenido de un modal `amplio`/`completo` se
  acomoda en grillas (`GRILLA_DOS_COLUMNAS`, filas de tabla), nunca en una
  columna angosta con la mitad del modal vacía.
- `Modal`/`ConfirmDialog` con foco atrapado, `Esc`, scroll bloqueado y retorno
  de foco; el pie de guardado va asociado al formulario y bloquea doble clic.
- Eliminación destructiva: confirmación propia; datos críticos con doble
  confirmación y plazo recuperable.

## 6. Identidad y personas

- Identidad **por ID**, nunca por nombre o correo.
- Un solo objeto para mostrar personas (foto local → foto de identidad →
  iniciales, sin imágenes rotas). **TODO:** entra cuando cierre #211 (DSN) en
  MobOS; hasta entonces, la librería no expone avatar.
- `primerNombre` para contextos compactos (la cronología) — ya en la librería.
- `normalizarNombre` respeta las **razones sociales** (`esRazonSocial`): un
  nombre de empresa con tipo societario (S.A., S.R.L., LTDA, cooperativa…)
  no se reordena ni se capitaliza como un nombre de persona, aunque venga en
  mayúsculas desde el proveedor de RUC.

## 7. Dinero, fechas y formatos

- Un solo lugar para cada formato: `moneda.js` (`formatGs`, `formatUsd`,
  `montoGs`/`montoUsd`/`montoTexto`), `fecha.js` (24 h, vacío explícito,
  nunca “Invalid Date”), `telefono.js` (`whatsappUrl` arma el único enlace).
- Prohibido `toLocaleString` de dinero/fechas por pantalla y los helpers
  locales (`fmt`, `fecha`, `precio`).
- Los montos y las fechas no se convierten ni se inventan: dato ausente → texto
  de vacío.

## 8. Tokens y estilo

- Colores, tipografía y sombras salen del preset + `styles.css`; prohibido
  hardcodear colores o usar estilos inline salvo valores dinámicos.
- Modo oscuro con la clase `dark` en `<html>`; toda superficie nueva tiene que
  verse bien en ambos temas.
- Un solo activo de marca por app; los componentes no traen logos.

## 9. Cómo se fija una regla

1. El objeto se crea en este paquete con props claras y sin acoplarse a una app.
2. Cada regla nueva se fija con un test de aserción de fuente o de render en
   `test/` (si una app vuelve a copiar el patrón, su test lo marca).
3. La app adopta el objeto y borra su copia en el mismo cambio.
