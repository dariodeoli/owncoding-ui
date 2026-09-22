# Migrar una pantalla al sistema v2 — guía para las otras apps

Para adoptar el lenguaje "device ops" (tokens + objetos publicados en
`owncoding-ui`) en **ScaleOS, LedBox, PagaYa** y en las demás pantallas de
MobOS. El ejemplo completo paso a paso está en `docs/V2.md` §4; acá va el
proceso por pantalla, qué reemplazar y cómo verificar.

## 0. Inventario de la pantalla (antes de tocar código)

1. Anotá los **colores/tamaños sueltos** (`hex`, `sky-*`, `max-w-*` sueltos) y
   los **objetos duplicados**: chips de estado, medidores de batería/avance,
   tarjetas de equipo, checklist, previews de impresión, QR.
2. Sacá **capturas "antes"**: claro y oscuro, 360/768/1440, con la densidad y
   las acciones actuales a la vista (nada se pierde en la migración).
3. Elegí **una** pantalla piloto por app (la de mayor densidad: tabla de
   inventario, tablero de pedidos, listado de clientes).

## 1. Preparar la app

```bash
npm install github:dariodeoli/owncoding-ui#vX.Y.Z   # versión fijada
```

```js
// tailwind.config.js
import preset from 'owncoding-ui/tailwind-preset'
export default { presets: [preset], content: ['./index.html', './src/**/*.{js,jsx}'] }
```

```css
/* CSS principal, después de las directivas de Tailwind */
@import 'owncoding-ui/styles.css';
```

## 2. Mapear la paleta propia → tokens

| En la app | Token v2 | Nota |
| --- | --- | --- |
| Acento de marca | `fono` (`--c-fono`) | el verde pass `#22C55E` es el acento del tema consola; si la marca es otra, se pisa la var |
| Éxito / aprobado | `ok` + `pass` | `pass` es el verde de certificado (`--c-pass*`) |
| Error / falla | `bad` | |
| Atención | `warn` | |
| Información / acción | `info` / `accion` | en el scope v2 `info` = azul acción `#4D7CFE` |
| Superficies | `paper`, `ink-*` | `ink` es superficie, `paper` el fondo |
| Texto secundario | `mute` | |

Colores propios que no tienen equivalente (marcas de terceros, datos de color):
se declaran como `--c-*` en el CSS de la app, **nunca** en la pantalla.

## 3. Aplicar el scope y los objetos

1. `tema-v2` (alias `v2-piloto`) en el contenedor de la pantalla piloto; el
   resto de la app sigue igual hasta que se migre a propósito.
2. Reemplazá por tipo:

| En la pantalla | Objeto |
| --- | --- |
| Fila/tabla | `CELDA_DATO`, `CELDA_NUMERO`, `CELDA_IDENTIDAD`, `CeldaMoneda` |
| Producto / equipo | `IconoCategoria` (mobile/laptop/tablet/watch/buds/cable) y `TileEquipo` en grillas |
| Estado | `ChipEstado`; pedidos/entregas: `lib/estadosPedido` + `EstadoBadge` |
| Inspección | `SemaforoItem`, `FilaChecklist` + `ConteoChecklist`, `ChipsLocks`, `MedidorBateria`, `GradoBadge` |
| Impresión / informe | `VistaPreviaPapel`, `FichaCertificado`, `CodigoQr` + `qrDataUrl` |
| Avisos | `Aviso` (resultado, con `role`) y `Nota` (aclaración, sin `role`) |
| Carga / vacío / error | `Skeleton`, `EmptyState`, `ErrorState`, `SectionState` |

3. Números grandes (contadores, "x de y pass"): `.v2-numero`; identificadores
   (IMEI/serial): monoespaciada (`font-mono` + `data-serial`).

## 4. Verificación por pantalla

- Densidad y acciones intactas (mismas columnas, mismos botones, mismos flujos).
- 360/768/1440 en claro y oscuro.
- Capturas **después** con el mismo encuadre que las "antes".
- `npm run lint` · tests · build · smoke de la app.
- Buscar restos: `hex` propios, `sky-*/amber-*/slate-*`, `max-w-*` sueltos en
  modales, `<iframe>` de previews, `QRCode.toDataURL` fuera del helper.

## 5. Fases (una app a la vez)

| Fase | Alcance | Puerta de salida |
| --- | --- | --- |
| F1 | tokens + objetos en la biblioteca | publicado con tag (esto ya está hecho: v0.14.x) |
| F2 | **piloto de 3 pantallas** (tabla, ficha, carrito) | capturas antes/después y aprobación del dueño |
| F3 | shell + tableros (dashboard, pedidos, clientes, finanzas) | capturas por módulo |
| F4 | rollout completo + demo + portal/informe público | suite completa y smoke de producción |

## 6. Qué no hacer

- No crear ramas de estilo por pantalla ("si es la tabla uso esto, si es la
  ficha aquello"): el objeto se ajusta con props o se agrega al objeto.
- No copiar hex ni clases de color del tema consola; no reimplementar el QR, los
  locks, la batería, el grado ni el preview.
- No migrar dos pantallas en el mismo commit: una por vez, con su captura.
