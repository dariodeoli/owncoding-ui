// Prioridades, orígenes y estados del Centro de Abastecimiento (#250 F1). Las
// claves del backend (`URGENTE · ALTA · NORMAL · BAJA`, `ABIERTA · ASIGNADA ·
// COMPRADA · RECIBIDA · CANCELADA`) se normalizan a minúsculas sin acentos, y
// los alias de la UI (`media`, `por_comprar`, `comprado`…) siguen andando.
// Portable: sin API, sin stock y sin precios.

const normalizarClave = (clave) =>
  String(clave ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

// Prioridades del contrato (`NORMAL` es el default del backend).
export const PRIORIDADES_COMPRA = {
  urgente: { etiqueta: 'Urgente', tono: 'bad', orden: 0 },
  alta: { etiqueta: 'Alta', tono: 'warn', orden: 1 },
  normal: { etiqueta: 'Normal', tono: 'info', orden: 2 },
  baja: { etiqueta: 'Baja', tono: 'mute', orden: 3 },
}

const ALIAS_PRIORIDAD = { media: 'normal', media_alta: 'alta', media_baja: 'baja' }

/** Clave canónica de prioridad (tolerante a mayúsculas y alias). */
export function claveDePrioridad(clave) {
  const k = normalizarClave(clave)
  return ALIAS_PRIORIDAD[k] || (PRIORIDADES_COMPRA[k] ? k : 'normal')
}
export const prioridadDe = (clave) => PRIORIDADES_COMPRA[claveDePrioridad(clave)]
export const etiquetaPrioridad = (clave) => prioridadDe(clave).etiqueta
export const tonoPrioridad = (clave) => prioridadDe(clave).tono
export const ordenDePrioridad = (clave) => prioridadDe(clave).orden

/** Copia de la lista ordenada por prioridad (urgente → baja), sin mutar el origen. */
export function ordenarPorPrioridad(lista = [], clave = 'prioridad') {
  return [...(Array.isArray(lista) ? lista : [])].sort(
    (a, b) => ordenDePrioridad(a?.[clave]) - ordenDePrioridad(b?.[clave]),
  )
}

// Orígenes de una necesidad automática (y el manual), con su etiqueta, tono e
// ícono: el panel no arma el mapa por su cuenta.
export const ORIGENES_NECESIDAD = {
  sale_no_stock: { etiqueta: 'Venta sin stock', tono: 'warn', icono: 'cart' },
  reservation_no_stock: { etiqueta: 'Reserva sin unidad', tono: 'info', icono: 'clock' },
  quantity_over_stock: { etiqueta: 'Venta sobre stock', tono: 'info', icono: 'trending' },
  below_reorder: { etiqueta: 'Bajo reposición', tono: 'warn', icono: 'inventory' },
  order_committed: { etiqueta: 'Pedido comprometido', tono: 'info', icono: 'receipt' },
  manual: { etiqueta: 'Manual', tono: 'mute', icono: 'edit' },
}

/** Origen con sus defaults; una clave libre se muestra tal cual, en tono mute. */
export function origenDe(clave) {
  const k = normalizarClave(clave)
  if (ORIGENES_NECESIDAD[k]) return ORIGENES_NECESIDAD[k]
  const texto = String(clave ?? '').trim()
  return { etiqueta: texto || 'Sin origen', tono: 'mute', icono: 'tag' }
}
export const etiquetaOrigen = (clave) => origenDe(clave).etiqueta
export const tonoOrigen = (clave) => origenDe(clave).tono
export const iconoOrigen = (clave) => origenDe(clave).icono

// Estados de una necesidad: los cinco del contrato más los de las fases
// siguientes (envío/tránsito/recepción/incidencia). El stock recién existe al
// recibir.
export const ESTADOS_NECESIDAD = {
  abierta: { etiqueta: 'Por comprar', tono: 'warn', icono: 'cart' },
  asignada: { etiqueta: 'Asignada', tono: 'info', icono: 'user' },
  comprada: { etiqueta: 'Comprada', tono: 'ok', icono: 'check' },
  preparar_envio: { etiqueta: 'Preparar envío', tono: 'info', icono: 'package' },
  en_transito: { etiqueta: 'En tránsito', tono: 'info', icono: 'truck' },
  recepcion: { etiqueta: 'En recepción', tono: 'warn', icono: 'box' },
  recibida: { etiqueta: 'Recibida', tono: 'ok', icono: 'box' },
  incidencia: { etiqueta: 'Con incidencia', tono: 'bad', icono: 'alert' },
  cancelada: { etiqueta: 'Cancelada', tono: 'mute', icono: 'close' },
}

const ALIAS_ESTADO = {
  por_comprar: 'abierta',
  comprando: 'asignada',
  asignado: 'asignada',
  comprado: 'comprada',
  recibido: 'recibida',
}

/** Clave canónica de estado (tolerante a mayúsculas y alias de la UI). */
export function claveDeEstado(clave) {
  const k = normalizarClave(clave)
  return ALIAS_ESTADO[k] || (ESTADOS_NECESIDAD[k] ? k : 'abierta')
}
export const estadoNecesidad = (clave) => ESTADOS_NECESIDAD[claveDeEstado(clave)]
export const etiquetaNecesidad = (clave) => estadoNecesidad(clave).etiqueta
export const tonoNecesidad = (clave) => estadoNecesidad(clave).tono

/** Recorrido lineal de una necesidad (sin incidencia ni cancelada). */
export const PASOS_NECESIDAD = ['abierta', 'asignada', 'comprada', 'preparar_envio', 'en_transito', 'recepcion', 'recibida']

// ── F2–F5: compra, envío, método y recepción ────────────────────────────────
// Un lookup tolerante (mayúsculas, espacios y guiones) con clave canónica:
// evita repetir el mismo normalizador por mapa.

function conClaves(mapa, defecto) {
  const porClave = new Map(Object.keys(mapa).map((clave) => [normalizarClave(clave), clave]))
  const canonica = (valor) => porClave.get(normalizarClave(valor)) || defecto
  return { canonica, de: (valor) => mapa[canonica(valor)] }
}

// Compra (F2 + lo que suman F4/F5).
export const ESTADOS_COMPRA = {
  comprada: { etiqueta: 'Comprada', tono: 'info', icono: 'check' },
  preparando: { etiqueta: 'Preparando', tono: 'info', icono: 'package' },
  en_transito: { etiqueta: 'En tránsito', tono: 'info', icono: 'truck' },
  recibida: { etiqueta: 'Recibida', tono: 'ok', icono: 'box' },
  cancelada: { etiqueta: 'Cancelada', tono: 'mute', icono: 'close' },
}
const COMPRA = conClaves(ESTADOS_COMPRA, 'comprada')
export const claveDeEstadoCompra = COMPRA.canonica
export const estadoCompra = COMPRA.de
export const etiquetaCompra = (clave) => estadoCompra(clave).etiqueta
export const tonoCompra = (clave) => estadoCompra(clave).tono

// Lote/envío (F4): la recepción (F5) resuelve `recepcion_parcial`/`recibido`.
export const ESTADOS_ENVIO = {
  borrador: { etiqueta: 'Borrador', tono: 'mute', icono: 'edit' },
  preparando: { etiqueta: 'Preparando', tono: 'info', icono: 'package' },
  despachado: { etiqueta: 'Despachado', tono: 'info', icono: 'truck' },
  en_transito: { etiqueta: 'En tránsito', tono: 'info', icono: 'truck' },
  recepcion_parcial: { etiqueta: 'Recepción parcial', tono: 'warn', icono: 'box' },
  recibido: { etiqueta: 'Recibido', tono: 'ok', icono: 'check' },
  con_incidencia: { etiqueta: 'Con incidencia', tono: 'bad', icono: 'alert' },
  cancelado: { etiqueta: 'Cancelado', tono: 'mute', icono: 'close' },
}
const ENVIO = conClaves(ESTADOS_ENVIO, 'borrador')
export const claveDeEstadoEnvio = ENVIO.canonica
export const estadoEnvio = ENVIO.de
export const etiquetaEnvio = (clave) => estadoEnvio(clave).etiqueta
export const tonoEnvio = (clave) => estadoEnvio(clave).tono
export const PASOS_ENVIO = ['borrador', 'preparando', 'despachado', 'en_transito', 'recibido']

// Método del envío (F4).
export const METODOS_ENVIO = {
  bus: { etiqueta: 'Bus', icono: 'truck' },
  transportadora: { etiqueta: 'Transportadora', icono: 'truck' },
  aex: { etiqueta: 'AEX', icono: 'send' },
  importacion: { etiqueta: 'Importación', icono: 'globe' },
}
const METODO = conClaves(METODOS_ENVIO, 'bus')
export const claveDeMetodoEnvio = METODO.canonica
export const metodoEnvio = METODO.de
export const etiquetaMetodoEnvio = (clave) => metodoEnvio(clave).etiqueta
export const iconoMetodoEnvio = (clave) => metodoEnvio(clave).icono

// Recepción (F5).
export const ESTADOS_RECEPCION = {
  borrador: { etiqueta: 'Borrador', tono: 'mute', icono: 'edit' },
  confirmada: { etiqueta: 'Confirmada', tono: 'ok', icono: 'check' },
  cancelada: { etiqueta: 'Cancelada', tono: 'mute', icono: 'close' },
}
const RECEPCION = conClaves(ESTADOS_RECEPCION, 'borrador')
export const claveDeEstadoRecepcion = RECEPCION.canonica
export const estadoRecepcion = RECEPCION.de
export const etiquetaRecepcion = (clave) => estadoRecepcion(clave).etiqueta
export const tonoRecepcion = (clave) => estadoRecepcion(clave).tono

// Tono semántico → color del `Badge` y clases de chip del tono, para no repetir
// el mapa en cada pantalla del abastecimiento.
export const COLOR_DE_TONO = { ok: 'green', bad: 'red', warn: 'orange', info: 'blue', mute: 'slate' }
export const colorDeTono = (tono) => COLOR_DE_TONO[tono] || 'slate'
