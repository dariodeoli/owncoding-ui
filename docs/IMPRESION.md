# Impresión LAN / USB — guía portable

Objetivo: cualquier app puede imprimir en **impresora de red (LAN)** o
**conectada por USB**, con el mismo modelo que ya funciona en producción. La
librería trae los componentes; el **agente local** hace el trabajo físico.

## Piezas

| Pieza | Dónde vive | Qué hace |
| --- | --- | --- |
| `AjustesImpresion` | `owncoding-ui` | Pantalla de configuración: lista de impresoras, formulario con destino LAN/USB, verificación y prueba. Recibe datos y callbacks (sin API). |
| `BotonImprimir` | `owncoding-ui` | Dispara la impresión y muestra el estado honesto del trabajo (`aceptado` ≠ impreso). |
| `printing/estadoImpresoras.js` | `owncoding-ui` | Estado de impresoras y trabajos, motivos de fallo, agregado por empresa. Puro y testeable. |
| **Agente local** | artefacto del backend (`/print-agent/`) | Corre en la computadora con la impresora: reclama trabajos, los manda al sistema (CUPS/USB o red) y confirma el papel. |
| Backend | cada app | Guarda impresoras y cola, expone los endpoints y firma los trabajos. |

## Destino de una impresora

Se guarda como string con prefijo (misma convención en toda la cadena):

```
lan:<ip>:<puerto>     → impresora de red (9100 por defecto)
cups:<cola>           → cola local del sistema (USB o compartida)
```

`destinoDeConexion({ conexion, ip, puerto, cola })` lo compone y
`conexionDeDestino(destino)` dice si es `lan` o `cups`.

## Cómo lo implementa una app

1. **Configuración**: montá `AjustesImpresion` con las impresoras de tu API y
   callbacks para guardar/eliminar/probar/verificar. El formulario ya distingue
   LAN (IP + puerto) de USB/cola local y avisa cómo se guardará el destino.
2. **Verificación**: pedile al agente el diagnóstico por impresora y traducilo
   con `estadoDeDiagnostico(resultado)`; el motivo legible sale de
   `motivoDeDiagnostico(resultado)`. El agregado (`agregarEstado`) da el estado
   de la empresa: *Listo para imprimir / Con problemas / Sin verificar*.
3. **Impresión**: encolá el trabajo en tu backend y usá `BotonImprimir` con el
   estado real. Regla de oro: **aceptado no es impreso**; solo `confirmado`
   significa que el papel salió. Si el agente está caído, el trabajo queda en
   cola y se reintenta; nunca se descarta en silencio.
4. **Agente**: la computadora que tiene la impresora instala el agente y se
   vincula con un código (Configuración → Impresoras → Gestionar puentes). El
   agente sirve para varias apps del grupo: es el mismo artefacto.

## Reglas de honestidad (no negociables)

- La UI nunca dice “impreso” antes de la confirmación física.
- Un fallo muestra el motivo real; si el agente no responde, se dice “sin
  respuesta”, no se inventa.
- Una impresora sin verificar se muestra como tal; no se asume que está lista.
- El ancho de papel (58/80/A4) y las copias son de la impresora, no del trabajo:
  se configuran una vez y todas las pantallas los respetan.

## Apartados por tipo de impresión (qué hay y qué falta)

| Apartado | Objeto | Estado |
| --- | --- | --- |
| Constructor térmico 58/80 mm | `crearTicket` + `columnasDeAncho`/`envolver`/`repartirLinea` (`printing/escpos.js`) | ✅ en la librería (con CP850, cortes y firmas) |
| Página de prueba / verificador | `paginaDePrueba` (`printing/prueba.js`): **corto predeterminado** (`corta` = título + validación + fecha opcional, #277), `completa` con pie auditable y códigos, más `pedido`, `qr`, `venta`, `caracteres` y `corte`; `PLANTILLA_PRUEBA`/`plantillaDePrueba` (tipo, ancho 58/80, corte, copias) | ✅ en la librería (la app pasa el QR si lo tiene y persiste la plantilla) |
| Estado y verificación | `printing/estadoImpresoras.js` | ✅ en la librería |
| Configuración LAN/USB | `AjustesImpresion` | ✅ en la librería |
| Disparo de impresión | `BotonImprimir` | ✅ en la librería |
| Comprobantes/etiquetas/remitos/recibos (modelos por documento) | `ticketComprobante`, `ticketEtiqueta*`, `ticketRemito`, `ticketReserva`, `ticketNotaEntrega`, `ticketRemision`, `ticketReciboInterno`, `ticketProforma`, `ticketRecepcionServicio`, `ticketVerificacionImei` | ⏳ siguiente lote: se portan sobre `crearTicket` con datos por props |
| Páginas A4/firmas | `DocumentoImpresion` (hoja A4: emisor/receptor, detalle, liquidación, notas y pie con reglas `@media print`) + `bloqueFirma` para el ticket | ✅ hoja A4 en la librería (lote LedBox); firma también |

## Referencia en MobOS (lo que ya funciona)
- Pantalla: `src/components/control/Impresoras.jsx` (cola, puentes, actividad,
  diagnóstico y prueba) — es la fuente de la que se portaron los componentes.
- Agente: `print-agent/` (artefacto versionado en `backend/public/print-agent/`).
- Backend: rutas de impresión + `lib/printing/*` (tickets, documentos,
  etiquetas) y el reparto por tipo de documento.

### Encabezado y pie de la app en la página de prueba

`paginaDePrueba` y `paginaDePruebaSimple` aceptan callbacks síncronos opt-in
`encabezado(t)` y `pie(t)`, con el mismo constructor ESC/POS ya iniciado. El
encabezado reemplaza el título, subtítulo y marca predeterminados; la validación
sigue en el cuerpo. El pie de la app se agrega una sola vez después de los
códigos y la trazabilidad diagnóstica, antes del avance y corte final. El corto
conserva su cuerpo mínimo y también acepta ambos callbacks. El tipo `corte`
mantiene sus cuatro cortes de diagnóstico; el pie va después de esas pruebas
y antes del último corte.

```js
paginaDePrueba({
  tipo: 'completa',
  encabezado: t => encabezadoTicket(t),
  pie: t => pieTicket(t),
})
```

Los callbacks deben escribir en `t`, restaurar los estilos que activen y dejar
el avance/corte final a la librería; no deben reiniciar el constructor ni
concatenar bytes de otro ticket. Sus errores se propagan al consumidor. Si se
omiten, los bytes y las líneas de la prueba conservan el comportamiento previo.
