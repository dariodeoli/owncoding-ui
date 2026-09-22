// Estados de la operación de equipos (épicas #240/#241): semáforo del
// checklist, locks del dispositivo, salud de batería y grado de condición.
// Etiqueta, tono e ícono viven acá para que el checklist, el tile, el rack, la
// ficha y el informe lean igual. Portable: sin API, sin stores.

// 1) Ítems del checklist: bien / con observación / falla / sin verificar.
export const ESTADOS_ITEM = {
  ok: { etiqueta: 'Bien', tono: 'ok', icono: 'check' },
  aviso: { etiqueta: 'Con observación', tono: 'warn', icono: 'alert' },
  falla: { etiqueta: 'Falla', tono: 'bad', icono: 'close' },
  sinVerificar: { etiqueta: 'Sin verificar', tono: 'mute', icono: 'clock' },
}

export const estadoItem = (clave) => ESTADOS_ITEM[clave] || ESTADOS_ITEM.sinVerificar

// 2) Chips de estado: dispositivo (consola/rack) **y negocio** (documentos,
// cobros, cuentas). `pass` es el verde de certificado del tema consola.
//
// Estados de más de una palabra («En revisión», «Por cobrar»): la pantalla los
// escribe con espacio y el mapa los expone también normalizados.
const REVISION = { etiqueta: 'En revisión', tono: 'info', icono: 'refresh' }
const POR_COBRAR = { etiqueta: 'Por cobrar', tono: 'warn', icono: 'clock' }

// Los estados de negocio son genéricos y portables: la etiqueta por defecto se
// puede pisar con la prop `etiqueta`, y `tono` sigue pisando el color. La
// lectura tolera mayúsculas, acentos, espacios y el género
// («En revisión», «POR COBRAR», «Pagada», «Aprobada»).
export const ESTADOS_CHIP = {
  // — Dispositivos (#241) —
  pass: { etiqueta: 'Certificado', tono: 'pass', icono: 'check' },
  revision: REVISION,
  enrevision: REVISION,
  pendiente: { etiqueta: 'Pendiente', tono: 'mute', icono: 'clock' },
  falla: { etiqueta: 'Con fallas', tono: 'bad', icono: 'alert' },

  // — Documentos y pipelines —
  borrador: { etiqueta: 'Borrador', tono: 'mute', icono: 'edit' },
  enviado: { etiqueta: 'Enviado', tono: 'info', icono: 'send' },
  aprobado: { etiqueta: 'Aprobado', tono: 'ok', icono: 'check' },
  rechazado: { etiqueta: 'Rechazado', tono: 'bad', icono: 'close' },
  anulado: { etiqueta: 'Anulado', tono: 'mute', icono: 'close' },
  cancelado: { etiqueta: 'Cancelado', tono: 'bad', icono: 'close' },

  // — Cobros y cuentas —
  cobrado: { etiqueta: 'Cobrado', tono: 'pass', icono: 'money' },
  porcobrar: POR_COBRAR,
  pagado: { etiqueta: 'Pagado', tono: 'pass', icono: 'check' },
  vencido: { etiqueta: 'Vencido', tono: 'bad', icono: 'alert' },
  activo: { etiqueta: 'Activo', tono: 'ok', icono: 'check' },
  pausado: { etiqueta: 'Pausado', tono: 'warn', icono: 'clock' },
}

/** Clave de lectura: minúsculas, sin acentos ni separadores («En revisión» → `enrevision`). */
function claveDeEstado(valor) {
  return String(valor ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Estado del chip por clave. Un estado desconocido cae en `pendiente` (nunca
 * inventa un chip); las variantes de género caen en la forma masculina
 * («aprobada» → «aprobado») para no duplicar el mapa.
 */
export function estadoChip(clave) {
  const normalizada = claveDeEstado(clave)
  if (ESTADOS_CHIP[normalizada]) return ESTADOS_CHIP[normalizada]
  if (normalizada.endsWith('a')) {
    const masculina = `${normalizada.slice(0, -1)}o`
    if (ESTADOS_CHIP[masculina]) return ESTADOS_CHIP[masculina]
  }
  return ESTADOS_CHIP.pendiente
}

// 3) Locks del dispositivo: iCloud/Find My, MDM, ESN/lista negra, carrier/SIM
// lock y repuesto no OEM. El estado lo aporta el diagnóstico.
export const LOCKS_DISPOSITIVO = {
  icloud: 'iCloud / Find My',
  mdm: 'MDM',
  esn: 'ESN / lista negra',
  carrier: 'Carrier / SIM lock',
  oem: 'Repuesto no OEM',
}

export const ESTADOS_LOCK = {
  libre: { etiqueta: 'Libre', tono: 'ok', icono: 'unlock' },
  activo: { etiqueta: 'Activo', tono: 'bad', icono: 'lock' },
  desconocido: { etiqueta: 'Sin dato', tono: 'mute', icono: 'clock' },
}

export const estadoLock = (clave) => ESTADOS_LOCK[clave] || ESTADOS_LOCK.desconocido

// 4) Batería: 90 % o más está bien; 80–89 % pide atención; por debajo, cambio.
export const UMBRAL_BATERIA_OK = 90
export const UMBRAL_BATERIA_ATENCION = 80

export function tonoBateria(porcentaje) {
  if (porcentaje === null || porcentaje === undefined || porcentaje === '') return 'mute'
  const valor = Number(porcentaje)
  if (!Number.isFinite(valor)) return 'mute'
  if (valor >= UMBRAL_BATERIA_OK) return 'ok'
  if (valor >= UMBRAL_BATERIA_ATENCION) return 'warn'
  return 'bad'
}

// 5) Grado de condición: A como nuevo, B marcas leves, C marcas visibles.
export const GRADOS_CONDICION = {
  A: { etiqueta: 'Grado A', tono: 'ok', descripcion: 'Como nuevo, sin marcas visibles' },
  B: { etiqueta: 'Grado B', tono: 'warn', descripcion: 'Marcas leves de uso' },
  C: { etiqueta: 'Grado C', tono: 'bad', descripcion: 'Marcas o detalles visibles' },
}

export const gradoCondicion = (clave) => GRADOS_CONDICION[String(clave || '').trim().toUpperCase()] || null

// Tono semántico → color del Badge compartido (el Badge usa nombres de color).
export const COLOR_BADGE = { ok: 'green', warn: 'orange', bad: 'red', mute: 'slate', info: 'blue', pass: 'green' }
export const colorBadge = (tono) => COLOR_BADGE[tono] || 'slate'

// Clases de los tonos por uso (el mismo tono en punto, chip y texto). El mapa
// vive en `utils/tonos.js` porque lo comparten todos los objetos que muestran
// estados; acá se re-exporta para no romper a los consumidores del checklist.
export { TONOS } from './tonos.js'
