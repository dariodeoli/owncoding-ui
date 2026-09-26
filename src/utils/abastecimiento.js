// Prioridades y estados del Centro de Abastecimiento (#250 F1): etiqueta, tono
// y orden viven acá para que el panel «Por comprar», la lista de compra y las
// tarjetas lean igual. Portable: sin API, sin stock y sin precios.

export const PRIORIDADES_COMPRA = {
  alta: { etiqueta: 'Alta', tono: 'bad', orden: 0 },
  media: { etiqueta: 'Media', tono: 'warn', orden: 1 },
  baja: { etiqueta: 'Baja', tono: 'mute', orden: 2 },
}

/** Prioridad con sus defaults (una clave desconocida cae en `media`). */
export function prioridadDe(clave) {
  return PRIORIDADES_COMPRA[clave] || PRIORIDADES_COMPRA.media
}
export const etiquetaPrioridad = (clave) => prioridadDe(clave).etiqueta
export const tonoPrioridad = (clave) => prioridadDe(clave).tono
export const ordenDePrioridad = (clave) => prioridadDe(clave).orden

/** Copia de la lista ordenada por prioridad (alta → baja), sin mutar el origen. */
export function ordenarPorPrioridad(lista = [], clave = 'prioridad') {
  return [...(Array.isArray(lista) ? lista : [])].sort(
    (a, b) => ordenDePrioridad(a?.[clave]) - ordenDePrioridad(b?.[clave]),
  )
}

// Estados de una necesidad/compra: el mismo orden de los tabs del panel
// («Por comprar · Comprando · Comprado · Preparar envío · En tránsito ·
// Recepción · Incidencia · Historial»). El stock recién existe al recibir.
export const ESTADOS_NECESIDAD = {
  por_comprar: { etiqueta: 'Por comprar', tono: 'warn', icono: 'cart' },
  comprando: { etiqueta: 'Comprando', tono: 'info', icono: 'truck' },
  comprado: { etiqueta: 'Comprado', tono: 'ok', icono: 'check' },
  preparar_envio: { etiqueta: 'Preparar envío', tono: 'info', icono: 'package' },
  en_transito: { etiqueta: 'En tránsito', tono: 'info', icono: 'truck' },
  recepcion: { etiqueta: 'En recepción', tono: 'warn', icono: 'box' },
  recibido: { etiqueta: 'Recibido', tono: 'ok', icono: 'check' },
  incidencia: { etiqueta: 'Con incidencia', tono: 'bad', icono: 'alert' },
  cancelada: { etiqueta: 'Cancelada', tono: 'mute', icono: 'close' },
}

/** Estado con sus defaults (una clave desconocida cae en `por_comprar`). */
export function estadoNecesidad(clave) {
  return ESTADOS_NECESIDAD[clave] || ESTADOS_NECESIDAD.por_comprar
}
export const etiquetaNecesidad = (clave) => estadoNecesidad(clave).etiqueta
export const tonoNecesidad = (clave) => estadoNecesidad(clave).tono

/** Recorrido lineal de una necesidad (sin incidencia ni cancelada). */
export const PASOS_NECESIDAD = [
  'por_comprar', 'comprando', 'comprado', 'preparar_envio', 'en_transito', 'recepcion', 'recibido',
]

// Tono semántico → color del `Badge` y clases de chip del tono, para no repetir
// el mapa en cada pantalla del abastecimiento.
export const COLOR_DE_TONO = { ok: 'green', bad: 'red', warn: 'orange', info: 'blue', mute: 'slate' }
export const colorDeTono = (tono) => COLOR_DE_TONO[tono] || 'slate'
