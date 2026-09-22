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

// 2) Chips de estado del equipo en consola/rack: certificado, en revisión,
// pendiente y con fallas. `pass` es el verde de certificado del tema consola.
export const ESTADOS_CHIP = {
  pass: { etiqueta: 'Certificado', tono: 'pass', icono: 'check' },
  revision: { etiqueta: 'En revisión', tono: 'info', icono: 'refresh' },
  pendiente: { etiqueta: 'Pendiente', tono: 'mute', icono: 'clock' },
  falla: { etiqueta: 'Con fallas', tono: 'bad', icono: 'alert' },
}

export const estadoChip = (clave) => ESTADOS_CHIP[clave] || ESTADOS_CHIP.pendiente

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
