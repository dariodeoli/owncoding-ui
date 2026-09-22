# Changelog — owncoding-ui

Formato: [Keep a Changelog](https://keepachangelog.com/es/1.0.0/). Versionado
0.x: mientras la biblioteca se forma, un objeto puede cambiar de nombre (se
documenta acá y en el README).

## Sin publicar — v0.14.0 propuesta (2026-09-22)

Cierre de los huecos que dejó el piloto de adopción en LedBox/EventOS (issue
#3). Todos los agregados son opcionales: nada de lo que consumía `v0.13.1`
cambia de firma ni de valor por defecto. **Versión sugerida: v0.14.0** (la rama
`lib`, con la cosecha de PagaYa/ScaleOS, también apunta a esa versión: el
integrador decide el número final).

- **Tailwind — `owncodingContent`:** Tailwind 3.4 ignora el `content` que
  declara un preset, así que la librería exporta `owncodingContent` (globs de
  `owncoding-ui/dist/**/*.js` y `src/**/*.jsx`) desde `tailwind-preset.js` y el
  README explica cómo sumarlo (`content: [...owncodingContent, …]`). El preset
  mantiene su clave `content` y avisa del bug; sin sumarlo, los componentes se
  purgaban en silencio (íconos gigantes).
- **Tipos publicados:** `types/index.d.ts` (declarado a mano, aditivo) con los
  objetos principales, los campos, los estados, las tablas y los formatos;
  `package.json` expone `types` y la condición `types` del `exports`, y el build
  lo copia a `dist/index.d.ts`. `tailwind-preset` también tiene tipos. Una app
  TypeScript `strict` ya no necesita un shim propio.
- **Hojas CSS separadas:** `tokens.css` (solo variables, no toca el documento)
  y `base.css` (base global opt-in: `html`/`body`, tipografías, foco, tabulares,
  animaciones y `@media print` de `DocumentoImpresion`). `styles.css` sigue
  siendo tokens + base concatenadas, autocontenido, compatible con v0.13.1.
  `exports` publica las tres.
- **Fechas con zona:** `fechaHora`, `fechaDia`, `fechaHoraCorta` y `fechaCorta`
  aceptan `{ timeZone }` (o un objeto de opciones como segundo argumento); sin
  zona se mantiene el huso del navegador. Una fecha pura `YYYY-MM-DD` se dibuja
  como día de calendario (no se corre de zona).
- **`formatGs` con símbolo configurable:** `formatGs(valor, { simbolo })` (o
  una cadena suelta), propagado a `montoTexto`, `montoGs`, `montoConSigno`,
  `formatMoney`, `Money`, `CeldaMoneda`, `MoneyInput` (`symbol`),
  `PlanPagos`, `DocumentoImpresion` e `ImporteDelta`. El default sigue siendo
  `Gs 1.234.567`; `SIMBOLOS_MONEDA` es la fuente única del prefijo.
- **`ChipEstado` genérico:** suma los estados de negocio (borrador, enviado,
  aprobado, rechazado, vencido, cobrado/pagado, por cobrar, activo, pausado,
  anulado, cancelado y en revisión) con tonos coherentes, lectura tolerante
  (mayúsculas, acentos, espacios y género) y `title`/`data-estado` accesibles.
  Los estados de dispositivo no cambian.
- **Íconos (23 nuevos, 78 en total):** `overview`, `events`, `clients`, `leads`,
  `budgets`, `finance`, `inventory`, `suppliers`, `promoters`, `building`,
  `plan`, `audit`, `arrowRight`, `arrowLeft`, `sun`, `moon`, `power`, `mail`,
  `bank`, `checkin`, `globe`, `database` e `instagram`, con el trazo de la
  librería (1.75) y el mapa `AdminIcon` → librería en el README. `ICONOS` expone
  la lista; ningún glifo existente se renombró ni cambió.
- **`Stat` con `tono` y `nota`:** el valor se colorea con el tono semántico y el
  KPI suma el dato al pie (lo que cubría `AdminKpi`), sin cambiar la firma
  anterior.
- **Fix — `.pin-oculto`:** la clase que `PinInput` usa para no mostrar los
  dígitos reales sobre los puntos no existía en la librería; ahora vive en
  `base.css`.
- 18 tests nuevos (149 en total), con verificación de consumo real del paquete
  construido (tipos, `owncodingContent`, hojas CSS, `timeZone`, símbolo y
  `ChipEstado`). `dist/` regenerado (incluye `dist/index.d.ts`).

## v0.14.0 — 2026-09-22

- **Adopción sin fricción (pedido del piloto de LedBox):** `owncodingContent`
  exportado del preset, **tipos** (`.d.ts`) publicados, `styles.css` partido en
  **`tokens.css` + `base.css`**, fechas con **`timeZone`**, **`formatGs`** con
  símbolo configurable (default `Gs 1.234.567`), **`ChipEstado`** con estados de
  negocio, **23 íconos nuevos** (78 en total) y **`Stat`** con `tono` y `nota`.
  Todo compatible con v0.13.1.
## v0.13.1 — 2026-09-22

- **Release completa:** suma al lote LedBox ya etiquetado el **lote 2** (agenda,
  filtros, shell y tablero: `Calendario`, `RangoFecha`, `PaletaComandos`,
  `AyudaModulo`, `BarraInferior`, `Avatar`, `ImporteDelta`, `IndicadorConexion`,
  `CampanaAvisos`, `GraficoBarras`) y el resto de los helpers.
- **Formato de guaraníes sin punto:** `Money` y `CeldaMoneda` muestran
  `Gs 1.234.567` (el símbolo de `PYG` pierde el punto) para coincidir con el
  formato que usan las apps en pantalla y en los imprimibles. Los
  formateadores puros (`formatGs`, `montoTexto`, `formatMoney`, `montoGs`) ya lo
  hacían.
- Nota: `v0.13.0` quedó como pre-release parcial (sin el lote 2 ni el formato);
  las apps deben fijar **v0.13.1**.

## v0.13.0 — 2026-09-22

- **Agenda:** `Calendario` — grilla mensual (semana opcional) con encabezado de
  navegación, conteo por día, detalle del día elegido y lista por día en mobile
  (sin scroll horizontal). Ítems `{ fecha, titulo, hora?, detalle?, tono?,
  href? }` con `renderItem` a medida y rango visible por
  `onCambiarPeriodo(ancla, rango)`; el consumidor decide qué datos pide. Los
  días son claves puras `YYYY-MM-DD` (`utils/calendario.js`: `rangoMes`,
  `rangoSemana`, `sumarDias`, `sumarMeses`, `etiquetaMes`/`etiquetaDia` es-PY).
- **Filtro de fechas:** `RangoFecha` — atajos Hoy · Esta semana · Este mes · Mes
  pasado · Últimos 30 días · Personalizado + campos desde/hasta, controlado o
  suelto, con `onCambio(desde, hasta)` y aviso de rango invertido
  (`utils/rangoFecha.js`: `rangoDePeriodo`, `periodoDeRango`).
- **Búsqueda global:** `PaletaComandos` — ⌘/Ctrl+K (atajo configurable), foco
  automático, resultados agrupados por tipo, ↑↓/Enter/Escape, debounce con
  cancelación, «seguí escribiendo» con mínimo configurable, sin resultados y
  error con reintento. La búsqueda la provee el consumidor (`buscar` async) y
  el elegido se devuelve por `onElegir`; helpers `agruparResultados` y
  `estadoPaleta`.
- **Shell:** `AyudaModulo` («¿Qué es esto?»: resumen + 3–5 puntos + 2–3 enlaces
  internos en el diálogo de la librería) y `BarraInferior` (hasta 4 ítems +
  «Más»; activo con `aria-current`, `ESPACIO_BARRA_INFERIOR` para que no tape el
  contenido).
- **Identidad:** `Avatar` — iniciales con color estable derivado del nombre
  (`inicialesDeNombre`, `colorDeNombre`), imagen opcional con caída a iniciales,
  tamaños sm/md/lg, forma redonda o cuadrada (empresas) y `role="img"` con
  `aria-label`. Queda pendiente la cadena de identidad de #211.
- **Tablero:** `ImporteDelta` (monto con signo y color, tabular, `invertir`),
  `IndicadorConexion` (en línea/sin conexión + pendientes de subir),
  `CampanaAvisos` (contador de no leídos hasta 99+ y panel props-driven) y
  `GraficoBarras` (barras CSS sin dependencias, vertical/horizontal, lista
  accesible). `utils/moneda.js` suma `formatoNumero`, `signoDe` y
  `montoConSigno`.
- 45 tests nuevos (101 en total); props y reglas en `docs/REGLAS.md` §10. Sin
  bump de versión: lo decide el dueño junto con el resto del lote.
## Sin publicar — v0.13.0 propuesta (2026-09-22)

Lote de objetos genéricos portado de LedBox (los seis que su panel resolvía a
mano). Props y reglas en `docs/REGLAS.md` §8 ter; ejemplos de uso por objeto en
el README. Sin cambios incompatibles.

- **`TableroKanban` + `useTableroOptimista`:** pipeline por columnas de estado
  con contador, tarjetas con chips/monto/fecha/detalle, arrastre HTML5 y
  «Mover a…» accesible por teclado; movimiento optimista con revert si
  `onMover` falla. Helpers puros `columnasDelTablero`, `agruparTarjetas` y
  `destinosDeTarjeta`. Referencia: `AdminBoard` de LedBox.
- **`Cronologia`:** lista de hitos con ícono/tono por tipo, título, detalle,
  actor y fecha es-PY 24 h, agrupable por día; `ICONOS_HITO`, `TONOS_HITO`,
  `ETIQUETAS_HITO` por defecto y pisables por props, con vacío. Referencia:
  `AdminTimeline` + `lib/server/timeline.ts` de LedBox.
- **`PlanPagos`:** anticipo + cuotas con etiqueta, monto (Int PYG), vencimiento
  y estado (`ESTADOS_CUOTA` dibujados con `ChipEstado`), «a transferir ahora»
  destacado, total y saldo sin cuota. Referencia: el plan del portal de LedBox
  (`PortalBudgetView` + `paymentPlan`).
- **`DocumentoImpresion`:** hoja A4 con emisor/receptor, meta (número, fechas,
  estado), detalle, liquidación (subtotal, descuento, IVA por tasa, total),
  notas, pie y botón de imprimir opcional; las reglas `@media print` viven en
  `styles.css` (`.oc-print`, `oc-print-oculto`). Referencia: las hojas `lbprint`
  de LedBox.
- **`SubidaImagen`:** campo de imagen con arrastrar y soltar, vista previa,
  validación por firma real (JPG/PNG/WebP) y tamaño, error, limpiar y
  compresión opcional en canvas sin librerías (`mimeDeImagen`,
  `validarImagen`, `prepararImagen`). Referencia: `AdminImageUpload` +
  `lib/identity-image.ts` de LedBox.
- **`ProgresoChecklist`:** barra accesible + «x de y» + porcentaje, con tonos
  por umbral (completo `ok`, vencidas `warn`, riesgo `bad`) y la lógica pura
  `progresoChecklist`. Referencia: `checklistProgress` de LedBox.
- **Tonos unificados:** `utils/tonos.js` es el único mapa de clases por tono
  (`ok`/`warn`/`bad`/`mute`/`info`/`pass`/`fono`), con alias de otras apps
  (`neutral`, `accent`, `danger`…) y helpers `puntoDeTono`, `chipDeTono` y
  `textoDeTono`. `TONOS` se sigue exportando igual. `ChipEstado` suma la prop
  `tono` para los estados propios de cada módulo.
- **Fix — `qrcode` ya no rompe el import:** la peer opcional pasa de import
  estático a import dinámico dentro de `qrDataUrl`; importar el paquete sin
  `qrcode` instalado funciona y el QR inexistente devuelve `''`. Test nuevo
  con la peer mockeada como ausente.
- **Fix — fechas puras (`YYYY-MM-DD`):** `fechaValida` las interpreta como día
  local (como los `dueAt` del API) y no como medianoche UTC, que en Asunción
  mostraba el día anterior; un día inexistente (31/9) sigue siendo inválido.
- 30 tests nuevos (86 en total) y `dist/` regenerado.

## v0.12.0 — 2026-09-22

- **Informe público (#240):** `FichaCertificado` — tarjeta del informe de
  dispositivo (empresa, modelo, IMEI enmascarado, grado, batería, "x de y pass",
  chips de locks, quién/cuándo verificó y QR) que compone los objetos del
  checklist. `CodigoQr` + `qrDataUrl` unifican la generación del QR (nivel M,
  margen 1, ancho 220 por defecto) que antes se repetía en cada pantalla con
  opciones distintas; `qrcode` queda como peer dependency **opcional**.
  En MobOS se migraron 16 llamadas en 7 pantallas.

## v0.11.0 — 2026-09-22

- **Tokens v2 del piloto (promovidos desde `slot/diseno`, #241):** scope
  `.tema-v2` con alias `.v2-piloto` — variante **clara** (fondo #F6F8FB,
  superficie #FFFFFF, borde #D6DCE6, texto #0E1116, ok #16A34A, bad #DC2626,
  warn #D97706) y **oscura** (`html.dark`: fondo #0E1116, panel #1F2430, borde
  #373F51, texto #F4F6FA, ok #22C55E, bad #EF4444, warn #F59E0B), con el azul
  acción #4D7CFE como `info`. Se aplica por clase al contenedor de la pantalla
  y suma `.v2-numero` (tabular, tracking ajustado) para los números grandes del
  checklist y los tableros.
- Así las pantallas del piloto pueden borrar su bloque local de `index.css` y
  consumir los tokens desde la biblioteca; el resto de la app no cambia.

## v0.10.0 — 2026-09-22

- **Sistema v2 "device ops" (épicas #240/#241):** tokens del tema consola
  (`.consola` con fondo #0E1116, panel #1F2430, borde #2D2D30, texto #F1F3F5) y
  verde **pass** (`--c-pass` #22C55E + variantes) y azul **acción**
  (`--c-accion` #4D7CFE), disponibles también fuera del tema consola.
- **Objetos:** `ChipEstado` (certificado/en revisión/pendiente/con fallas),
  `ChipsLocks` (iCloud/MDM/ESN/carrier/OEM), `SemaforoItem`,
  `FilaChecklist` + `ConteoChecklist` ("x de y pass"), `MedidorBateria`
  (barra/chip, umbrales 90/80), `GradoBadge` (A/B/C), `TileEquipo` y `Stepper`;
  estados y tonos en `utils/estadoEquipo.js`. Props en `docs/REGLAS.md` §8 bis.
- **Categorías con icono (#242):** `IconoCategoria` con los glifos mobile,
  laptop, tablet, watch, buds y cable; `CATEGORIAS_PRODUCTO`, `ICONO_CATEGORIA`
  y normalización de texto libre (`normalizarCategoria`) en
  `utils/categorias.js` ("Funda iPhone" → accesorios, "CELULAR" → iPhone).

## v0.9.0 — 2026-09-22

- **`Nota`:** superficie informativa para aclaraciones que no son resultado (no
  anuncia con `role`), con `tono` warn/info/neutro, `compact` y `como`. Portada
  del lote 10 de MobOS, donde reemplaza 8 notas copiadas en 4 pantallas.
- **`BarraProgreso` con `pista`/`relleno` y tono `onbrand`:** las barras de
  gráfico (ranking, series, fondo sobre color de marca) también pasan por el
  objeto (rol, aria y transición) sin copiar el markup. En MobOS se migraron 5
  barras a mano.
- El README de consumo fija la versión publicada (`#v0.9.0`).

## v0.8.0 — 2026-09-22

- **Ancho de modales por tipo (#237, portado de MobOS):** `Modal` expone
  `size` y el ancho vive en `utils/modal.js` — `corto` (`max-w-md`),
  `formulario` (`max-w-xl`, predeterminado), `amplio` (`max-w-3xl`) y
  `completo` (`max-w-5xl`). `ConfirmDialog` usa `corto`. En MobOS se migraron
  67 modales con `max-w-*` suelto; acá el ancho ya no se pasa en `className`.
  Regla nueva: el contenido de un modal `amplio`/`completo` va en grillas
  (`GRILLA_DOS_COLUMNAS`, filas de tabla) para no dejar franjas vacías.
- **`BotonDentroCampo` (#234):** acción trailing **dentro** del input, con
  `title`/`aria-label` (tooltip), estado ocupado «Consultando…» con spinner y
  `disabled` cuando no hay dato. Portable: la pantalla decide qué hace
  `onClick`; la librería no consulta nada.
- **`esRazonSocial` (+ fix de `normalizarNombre`):** una razón social con tipo
  societario (S.A., S.R.L., LTDA, cooperativa…) no se reordena ni se capitaliza
  como un nombre de persona, aunque venga en mayúsculas desde el proveedor
  de RUC.

## v0.7.0 — 2026-09-22

- **Piezas de formulario:** `GRILLA_DOS_COLUMNAS` (+ `_COMPACTA`),
  `PIE_ACCIONES` y `PIE_ACCIONES_REVERSO` en `utils/formulario.js`, portadas
  del barrido de MobOS (90 usos migrados allá).

## v0.6.0 — 2026-09-22

- `CELDA_IDENTIDAD` (`truncate text-[13px] font-semibold`) para la celda de
  nombre en tablas y listados.
- Consumo: el preset de Tailwind ya incluye el bundle de la librería en
  `content` (si no, las clases de los componentes se purgan); el README suma
  notas de release hasta v0.6 y un ejemplo completo de consumo.
- Sin cambios incompatibles.

## v0.5.0 — 2026-09-22

- **Ciudades de Paraguay:** catálogo `CIUDADES_PARAGUAY` (263 municipios + 18
  departamentos), `departamentoDe` y `buscarCiudad`; `CityAutocomplete` resuelve
  el departamento solo con la ciudad (al tipear coincidencia exacta, al elegir
  una sugerencia y al salir del campo), con `buscar` inyectable para usar la API
  propia.
- **Catálogos de productos:** `MODELOS_IPHONE`, `CAPACIDADES_IPHONE`,
  `COLORES_IPHONE`, `CATEGORIAS_ACCESORIOS`, `MARCAS_ACCESORIOS` y
  `buscarEnCatalogo` como predeterminados actualizables por release.
- **Tamaños de campo:** `TAMANOS_CAMPO` + `anchoParaLargo`; `MoneyInput`
  (`w-36`) y `PercentField` (`w-24`) aplican su ancho recomendado.
- **Impresión — builder y prueba:** `printing/escpos.js` (`crearTicket`,
  columnas, líneas, cortes, `bloqueFirma`) y `printing/prueba.js`
  (`paginaDePrueba` con verificador). `docs/IMPRESION.md` queda con los
  apartados por tipo y lo que falta portar.
- 8 tests nuevos (45 en total).

## v0.4.0 — 2026-09-22

- **Impresión LAN/USB funcional:** `AjustesImpresion`, `BotonImprimir` y
  `printing/estadoImpresoras.js` (destinos `lan:<ip>:<puerto>` y `cups:<cola>`,
  estados honestos, agregado por empresa). Guía: `docs/IMPRESION.md`.
- **Navegación y shell:** `NavLateral` (colapsable) y `MenuDesplegable`.
- **Ajustes (modelo):** `PanelDerecho` y `TarjetaAjuste`.
- **Bancos de Paraguay:** catálogo `BANCOS_PARAGUAY` + `BancoCombobox` +
  `BancoLogo` (archivo/marca/monograma).
- **Nombres:** `normalizarNombre` con orden SIFEN (A1 A2 N1 N2 → N1 N2 A1 A2),
  `nombrePartes` y `esApellidosPrimero`.
- **Moneda:** `largoMaximoMonto(max, { decimales })` y `MoneyInput` con
  `maxLength` derivado del tope (general 14, ventas 14, decimales 17).
- **Docs:** `docs/ALIMENTAR.md` (alimentar la biblioteca y cosechar de otras
  apps). 12 tests nuevos (37 en total).

## v0.3.0 — 2026-09-22

- **Familia de acceso (sin API):** `GoogleButton` (+`GoogleMark`,
  `OAuthDivider`), `AuthLayout` (slots de logo/copy/acciones/pie),
  `ProductFooter`, `LoadingScreen` y `PegarEnlaceToken`. Todo por props: no
  leen sesión, marca ni llaman a la API (la app pasa logo, nombre, versión y
  callbacks).
- **Campos ampliados:** `EmailField` (sugerencia de dominios, `dominios` por
  prop), `PhoneField` (+`parseTelefono`, `componerTelefono`, códigos por prop),
  `SerialField` (normalización inyectable) e `InstagramField`.
- **Lógica:** `utils/serial.js` (`ultimos4`, `partirSerial`,
  `serialEnmascarado`) y `utils/token.js` (`extractTokenFromUrl`, `esToken`).
- `styles.css` trae las animaciones de la pantalla de carga y respeta
  `prefers-reduced-motion`.
- 10 tests nuevos (25 en total).

## v0.2.2 — 2026-09-21

- README: consumo real (versión fija por tag) y notas de release v0.2.x con la
  guía de actualización del cambio de `Toggle` a `Switch`; checklist de adopción.
- CHANGELOG incluido en el paquete. Sin cambios de API.

## v0.2.1 — 2026-09-21

- `exports` expone `./package.json`; `engines.node >= 18` (robustez de consumo).
- CI en GitHub Actions: `npm ci` + build + tests + chequeo de exports.

## v0.2.0 — 2026-09-21

- **Interruptor único (#186):** se retira el alias `Toggle`; el objeto canónico
  es `Switch` (checkbox accesible, `onChange(event)`). Cambio incompatible de
  API (0.x).
- `REGLAS.md` y el README lo documentan; test que verifica que no se exportan
  alias de compatibilidad.

## v0.1.0 — 2026-09-21

- Bootstrap del paquete: componentes portables de MobOS (campos, acciones,
  contenedores, estados/avisos, datos), lógica compartida (moneda, fechas,
  teléfono/WhatsApp, clases de tabla), tokens CSS + preset de Tailwind.
- Build con esbuild (`dist/index.js` + `dist/styles.css`), `prepare`, `dist`
  commiteado; smoke de render (vitest) y tests de lógica.
- Docs: `REGLAS.md`, `MODOS-DE-TRABAJO.md`, `PLANTILLA-AGENTS.md` y README de
  consumo (git dependency / GitHub Packages).
- Pendiente: tipos `.d.ts`, identidad unificada (#211, DSN) y adopción por app
  (fase 2).
