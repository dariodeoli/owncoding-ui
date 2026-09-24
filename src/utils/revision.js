// Estados de una revisión/recepción (#250 F5): una sola fuente para el chip de
// la fila, el selector de incidencia y el resumen. Los estados «incidencia»
// suman al resumen; `ok` y `pendiente` no.
export const ESTADOS_REVISION = {
  ok: { etiqueta: 'OK', etiquetaPlural: 'OK', tono: 'ok' },
  pendiente: { etiqueta: 'Pendiente', etiquetaPlural: 'Pendientes', tono: 'mute' },
  faltante: { etiqueta: 'Falta', etiquetaPlural: 'Faltan', tono: 'bad' },
  sobrante: { etiqueta: 'Sobra', etiquetaPlural: 'Sobran', tono: 'warn' },
  danado: { etiqueta: 'Dañada', etiquetaPlural: 'Dañadas', tono: 'bad' },
  incorrecto: { etiqueta: 'Incorrecta', etiquetaPlural: 'Incorrectas', tono: 'warn' },
  sinImei: { etiqueta: 'Sin IMEI', etiquetaPlural: 'Sin IMEI', tono: 'mute' },
  sinDocumentacion: { etiqueta: 'Sin documentación', etiquetaPlural: 'Sin documentación', tono: 'warn' },
}

// Tipos que cuentan como incidencia (y por eso aparecen en el resumen).
export const INCIDENCIAS = ['faltante', 'sobrante', 'danado', 'incorrecto', 'sinImei', 'sinDocumentacion']

export const esIncidencia = (estado) => INCIDENCIAS.includes(estado)
export const etiquetaRevision = (estado) => ESTADOS_REVISION[estado]?.etiqueta || String(estado || '')
export const etiquetaPluralRevision = (estado) => ESTADOS_REVISION[estado]?.etiquetaPlural || String(estado || '')
export const tonoRevision = (estado) => ESTADOS_REVISION[estado]?.tono || 'mute'
