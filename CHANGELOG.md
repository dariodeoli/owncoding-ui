# Changelog — owncoding-ui

Formato: [Keep a Changelog](https://keepachangelog.com/es/1.0.0/). Versionado
0.x: mientras la biblioteca se forma, un objeto puede cambiar de nombre (se
documenta acá y en el README).

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
