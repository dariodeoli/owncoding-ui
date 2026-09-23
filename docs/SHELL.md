# Shell v2 — armar la navegación con la biblioteca

Cómo se compone el shell de una app (barra lateral, topbar, menú móvil, barra
inferior y buscador global) con los objetos de `owncoding-ui`, y las reglas de
accesibilidad del sistema v2 **device ops** medidas sobre el shell real (#241).

Referencias: `docs/V2.md` (tokens e iconos) · `docs/REGLAS.md` §10 (props y
reglas de los objetos) · `docs/MIGRACION-V2.md` (migrar una pantalla) ·
`docs/ADOPCION.md` (sumar la biblioteca a una app).

Los objetos son **portables**: reciben props y avisan por callbacks; no hacen
`fetch`, no leen stores ni conocen el router. La app resuelve datos, rutas y
permisos; el shell solo dibuja y navega.

## 1. Piezas del shell

| Zona | Objeto | Qué resuelve |
| --- | --- | --- |
| Encabezado de la vista | `PageHeader` | `eyebrow` + un solo `h1` + `subtitle` + `actions`; `backTo` para subpáginas |
| Barra lateral (escritorio) | `NavLateral` | Ítems con ícono, contador y activo; colapsable; slots `cabecera` (logo/marca) y `pie` (identidad) |
| Menú de usuario / acciones | `MenuDesplegable` | Menú portable (`role="menu"`): usuario, acciones de fila y filtros; cierra con clic afuera y `Esc` |
| Cajón (móvil) | `Drawer` | Panel lateral con overlay, foco atrapado, `Esc` y clic afuera |
| Buscador global | `PaletaComandos` | `⌘`/`Ctrl`+`K`: búsqueda async (`buscar` → `onElegir`) con estados honestos (mínimo, cargando, sin resultados, error con reintento) |
| Ayuda de la pantalla | `AyudaModulo` | Botón «?» + diálogo con `titulo`, `resumen`, `puntos` y `enlaces` |
| Barra inferior (móvil) | `BarraInferior` | Hasta 4 destinos + «Más»; el contenido suma `ESPACIO_BARRA_INFERIOR` |
| Estado de la cola | `IndicadorConexion` | Chip de `role="status"`: en línea / sin conexión y pendientes de subir (la app decide el estado) |
| Avisos | `CampanaAvisos` | Contador de no leídos (`99+`) + panel; abrir/elegir se avisan por callback |
| Identidad de la sesión | `Avatar` | Foto → iniciales con color estable; vive en el `pie` de la barra o del menú |
| Pie institucional | `ProductFooter` | Versión, crédito y textos por props (la biblioteca no conoce la marca) |
| Ajustes con formulario | `PanelDerecho` + `TarjetaAjuste` | Contenido/lista a la izquierda; formulario fijo a la derecha desde `lg` y apilado en móvil |

## 2. Props (resumen)

| Objeto | Props |
| --- | --- |
| `PageHeader` | `title` (único `h1`), `eyebrow`, `subtitle`, `actions`, `backTo` |
| `NavLateral` | `items` `[{ id, label, icono?, contador? }]`, `activeId`, `onSelect(id)`, `colapsado`, `onToggle`, `cabecera`, `pie`, `ancho` (`w-64`), `ariaLabel` |
| `MenuDesplegable` | `trigger`, `items` `[{ id?, label, icono?, onClick?, peligro?, disabled?, separador? }]`, `alineacion` (`right`/`left`), `ariaLabel` |
| `PaletaComandos` | `abierta`/`onAbrir`/`onCerrar`, `buscar(consulta)` async, `onElegir(resultado)`, `etiquetasTipo`, `iconosTipo`, `atajo`, `atajoTexto`, `conAtajo`, `minimo` (2), `espera` (220 ms), `boton`, `textoBoton` |
| `AyudaModulo` | `titulo`, `resumen`, `puntos` (3–5), `enlaces` `[{ href, etiqueta, onClick? }]`, `abierta`/`onAbrir`/`onCerrar` |
| `BarraInferior` | `items` (máx. 4) `[{ id, etiqueta, icono, href }]`, `activo`, `onSelect`, `onMas`, `masEtiqueta`, `menuAbierto`, `menuId`, `maxItems` (4) |
| `IndicadorConexion` | `enLinea`, `pendientes`, `sincronizando`, `onSincronizar`, etiquetas (`etiquetaEnLinea`/`etiquetaSinConexion`/`etiquetaSincronizando`) |
| `CampanaAvisos` | `avisos` `[{ id, titulo, detalle?, tono?, fecha?, href?, onClick?, leido? }]`, `onAbrir`, `onElegir`, `pie`, `anclaje` |
| `Avatar` | `nombre`, `src`, `tamano` (`sm`/`md`/`lg`), `forma` (`redondo`/`cuadrado`), `empresa`, `title`, `ariaLabel`, `decorativo` |
| `ProductFooter` | `nombre`, `version`, `credito`, `creditoUrl`, `anio`, `leading`, `children` |

## 3. Anatomía por breakpoint

- **Escritorio (`lg+`)**: `NavLateral` fija a la izquierda (colapsable); la app
  recuerda el estado si quiere. La identidad de la sesión va en el `pie`; la
  marca, en la `cabecera`.
- **Móvil**: la navegación va al cajón (`Drawer` + `MenuDesplegable`) y los
  destinos frecuentes a `BarraInferior`; el contenido suma
  `ESPACIO_BARRA_INFERIOR` para no quedar tapado.
- **Estados**: el ítem activo lleva `aria-current="page"`; los grupos plegables,
  `aria-expanded`; el contador se oculta con `sr-only` cuando el menú está
  colapsado (el `title` conserva la etiqueta).
- **Un solo buscador**: la paleta global reemplaza los buscadores duplicados del
  topbar; el botón visible se activa con `boton`.

## 4. Tokens v2 y contraste AA (shell v2, #241)

El shell v2 se activa aplicando el scope **`tema-v2`** (alias `v2-piloto`) al
contenedor: los tokens bajan a toda la pantalla y se apagan retirando la clase
(por eso el rollout puede ir detrás de un flag por dispositivo).

Los roles semánticos del scope v2 son **tonos de texto AA**: los vivos de
PhoneCheck no llegan a 4.5:1 sobre las superficies v2 y quedan para rellenos e
indicadores (`--c-pass`, `--c-accion` y las clases `bg-*`).

| Rol | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--c-ok` | `#166534` | `#4ADE80` | Textos y cifras «pass» |
| `--c-bad` | `#B91C1C` | `#FCA5A5` | Errores y avisos de falla |
| `--c-warn` | `#92400E` | `#FCD34D` | Atención |
| `--c-info` | `#2059BE` | `#9FB8FF` | Azul de acción: ítem activo, enlaces |
| `--c-fono` / `--c-fono-light` | `#10B981` / `#047857` | `#05F19C` / `#7CFFC9` | Marca; en claro el tono de texto es el oscuro |
| Relleno «vivo» | `#22C55E` (`--c-pass`) | `#22C55E` | Sellos, indicadores y barras |

Reglas del shell (medidas sobre el shell real, claro y oscuro):

1. **Rótulos de grupo sólidos**: el verde al 75% daba 3.2:1 en claro; va
   `--c-fono-light` sin alfa.
2. **Ítem activo** con el azul de acción AA sobre su tinte (`/14` en claro,
   `/20` en oscuro); el azul vivo no se usa como texto.
3. **Foco visible** en cada tema: verde oscuro en claro (el de marca quedaba
   casi blanco sobre blanco) y el de marca en oscuro.
4. **Superficies rojas** (contador de notificaciones; el aviso ancho de sin
   conexión si la app lo muestra): texto blanco en claro; en oscuro el rojo es
   claro y pide texto oscuro (`--c-onbrand`). El chip de la cola es
   `IndicadorConexion`; el aviso ancho es de la app (`Aviso`/`Nota`).
5. La **guarda** `test/contraste-tokens.test.js` mide los tonos de texto contra
   las superficies del scope en ambos temas y falla por debajo de AA.

Medición de referencia (antes → después): rótulos de grupo 3.20 → 4.97; ítem
activo 2.91 → 4.80 en claro y 3.49 → 5.93 en oscuro; `ok` 2.99–3.30 → 6.46+;
`warn` 2.89–3.19 → 6.43+; `info` 3.38–3.73 → 5.89+; `bad` 4.38 → 5.86+ (claro)
y 4.12 → 5.61+ (oscuro).

## 5. Ejemplo mínimo

```jsx
import { useState } from 'react'
import {
  Avatar, BarraInferior, ESPACIO_BARRA_INFERIOR, NavLateral, PaletaComandos,
} from 'owncoding-ui'

export function Shell({ usuario, nav, activo, ir, buscar }) {
  const [menu, setMenu] = useState(false)
  return (
    <div className="tema-v2 flex min-h-dvh">
      <NavLateral
        items={nav} // [{ id, label, icono, contador? }]
        activeId={activo}
        onSelect={ir}
        cabecera={<b>Marca</b>}
        pie={<Avatar nombre={usuario.nombre} src={usuario.fotoUrl} tamano="sm" />}
      />
      <div className={`min-w-0 flex-1 ${ESPACIO_BARRA_INFERIOR}`}>
        <PaletaComandos abierta={menu} onCerrar={() => setMenu(false)} buscar={buscar} onElegir={(r) => ir(r.datos.id)} />
        {/* …contenido de la pantalla… */}
      </div>
      <BarraInferior items={nav.slice(0, 4)} activo={activo} onSelect={ir} />
    </div>
  )
}
```

## 6. Checklist de adopción

- [ ] Scope `tema-v2` en el contenedor del shell (y el flag de la app si el
      rollout va por partes).
- [ ] Navegación con `aria-current`, grupos con `aria-expanded` y contadores
      accesibles.
- [ ] Un solo buscador global (`PaletaComandos`) y ayuda por pantalla
      (`AyudaModulo`) si la pantalla es densa.
- [ ] Identidad de la sesión con `Avatar` (nunca iniciales a mano).
- [ ] Barra inferior con `ESPACIO_BARRA_INFERIOR` en el contenido.
- [ ] Contraste AA verificado en claro y oscuro (`test/contraste-tokens.test.js`
      en esta biblioteca; en la app, su propia guarda).
- [ ] Capturas antes/después en mobile y escritorio, sin scroll horizontal.

## 7. Pendientes declarados (con DSN, #241)

Lo que falta para que una app pueda retirar su bloque local `.v2-piloto`
completo sin perder AA. Salen de la revisión cruzada CMP ↔ DSN del shell real:

1. **CSS de navegación en la biblioteca** (DSN confirmó que va acá): rótulos de
   grupo sólidos (`color: rgb(var(--c-fono-light))`; hooks
   `nav button[aria-expanded] > span` y el rótulo «Acciones» del cajón), ítem
   activo (claro `rgb(var(--c-info) / .14)` + `color: var(--c-info)`; oscuro
   `/ .2` + `color: var(--c-fore)`), foco por tema (claro
   `rgb(var(--c-fono-dark))`; oscuro `var(--oc-brand)`) y superficies rojas
   (claro `#fff`; oscuro `rgb(var(--c-onbrand))`). Las superficies rojas se
   resuelven en los objetos de aviso/contador, no con un override genérico de
   `.bg-bad`.
2. **`NavLateral` con grupos**: hoy es lista plana y el activo es verde
   (`bg-fono/15 text-fono-light`); la variante con grupos plegables + contador y
   el activo azul del v2 van con el próximo lote (DSN manda el diff sugerido).
3. **Capa de contenido del v2** (publicada por DSN en MobOS): `v2-chip` (y chip
   neutro en oscuro), `tabular-nums` con `letter-spacing: -.02em` dentro del
   scope, el paso extra de `strong.text-xl.tabular-nums` y el activo azul de
   `button.bg-fono/15.text-fono-light` y de las pestañas seleccionadas.
4. **Objetos que hoy son de la app**: alternador de tema y presencia («en
   línea»); el banner ancho de sin conexión.
5. **`PageHeader`**: si se busca paridad total con la miga de sección de MobOS,
   evaluar un prop de migas.
