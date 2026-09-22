// Calendario: los días se manejan como **clave pura** `YYYY-MM-DD`, sin hora y
// sin zona horaria. Así una fecha no se corre de día al viajar entre el server
// y el navegador, y el consumidor puede guardar/filtrar por día sin ambigüedad.
//
// Las etiquetas se rinden en es-PY y en UTC (la clave ya es un día puro): el
// mes, el día de la semana y el día del mes se leen siempre igual, sin depender
// de la zona del equipo. Los instantes completos (hora de un ítem) los formatea
// la app con `utils/fecha.js`.
//
// Todo es lógica pura: sin API, sin stores, sin React.

const ES_PY = 'es-PY'
const UTC = 'UTC'
const CLAVE = /^\d{4}-\d{2}-\d{2}$/

const FORMATO_SEMANA = new Intl.DateTimeFormat(ES_PY, { timeZone: UTC, weekday: 'short' })
const FORMATO_MES = new Intl.DateTimeFormat(ES_PY, { timeZone: UTC, month: 'long', year: 'numeric' })
const FORMATO_DIA = new Intl.DateTimeFormat(ES_PY, { timeZone: UTC, weekday: 'long', day: 'numeric', month: 'long' })
const FORMATO_DIA_NUMERO = new Intl.DateTimeFormat(ES_PY, { timeZone: UTC, day: '2-digit' })
const FORMATO_MES_CORTO = new Intl.DateTimeFormat(ES_PY, { timeZone: UTC, month: 'short' })

const capitalizar = (texto) => (texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto)

/** ¿El valor es una clave de día `YYYY-MM-DD`? */
export function esClaveDia(valor) {
  if (typeof valor !== 'string' || !CLAVE.test(valor)) return false
  const [anio, mes, dia] = valor.split('-').map(Number)
  const fecha = new Date(Date.UTC(anio, mes - 1, dia))
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
}

/** Clave de día de un `Date` (o de un valor que `Date` entienda); `''` si no es válido. */
export function claveDia(valor) {
  if (typeof valor === 'string' && esClaveDia(valor)) return valor
  const fecha = valor instanceof Date ? valor : valor ? new Date(valor) : null
  if (!fecha || Number.isNaN(fecha.getTime())) return ''
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}
/** `Date` en UTC de una clave de día (mediodía libre de corrimientos). */
export function fechaDeClave(clave) {
  if (!esClaveDia(clave)) return null
  const [anio, mes, dia] = clave.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia))
}

/** Día de hoy como clave (por defecto, el día local del equipo). */
export function hoyClave(hoy = new Date()) {
  return claveDia(hoy)
}

/** Corre una clave la cantidad de días pedida (negativo hacia atrás). */
export function sumarDias(clave, dias) {
  const fecha = fechaDeClave(clave)
  if (!fecha) return ''
  return claveUTC(fechaConDias(fecha, Number(dias) || 0))
}

/** Corre una clave la cantidad de meses pedida, sin pasarse del último día del mes. */
export function sumarMeses(clave, meses) {
  const fecha = fechaDeClave(clave)
  if (!fecha) return ''
  const anio = fecha.getUTCFullYear()
  const mes = fecha.getUTCMonth() + (Number(meses) || 0)
  const ultimo = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate()
  return claveUTC(new Date(Date.UTC(anio, mes, Math.min(fecha.getUTCDate(), ultimo))))
}

/** Índice de la semana con lunes = 0 (el calendario es-PY arranca el lunes). */
export function indiceSemana(clave) {
  const fecha = fechaDeClave(clave)
  return fecha ? (fecha.getUTCDay() + 6) % 7 : 0
}

/** Semana (lunes a domingo) que contiene la clave. */
export function rangoSemana(clave) {
  const inicio = sumarDias(clave, -indiceSemana(clave))
  const dias = Array.from({ length: 7 }, (_, indice) => sumarDias(inicio, indice))
  return { desde: dias[0], hasta: dias[6], dias }
}

/** Mes completo en grilla: desde el lunes previo al día 1 hasta el domingo posterior al último. */
export function rangoMes(clave) {
  const fecha = fechaDeClave(clave)
  if (!fecha) return { desde: '', hasta: '', dias: [] }
  const anio = fecha.getUTCFullYear()
  const mes = fecha.getUTCMonth()
  const primero = new Date(Date.UTC(anio, mes, 1))
  const ultimo = new Date(Date.UTC(anio, mes + 1, 0))
  const inicio = fechaConDias(primero, -indiceSemana(claveUTC(primero)))
  const fin = fechaConDias(ultimo, 6 - indiceSemana(claveUTC(ultimo)))
  const dias = []
  for (let cursor = inicio.getTime(); cursor <= fin.getTime(); cursor += 86_400_000) {
    dias.push(claveUTC(new Date(cursor)))
  }
  return { desde: dias[0], hasta: dias[dias.length - 1], dias }
}

/** ¿Las dos claves caen en el mismo mes? (los días de la grilla de los meses vecinos no lo están) */
export function mismoMes(clave, referencia) {
  return Boolean(clave) && Boolean(referencia) && clave.slice(0, 7) === referencia.slice(0, 7)
}

/** Mes y año: "Septiembre de 2026". */
export function etiquetaMes(clave) {
  const fecha = fechaDeClave(clave)
  return fecha ? capitalizar(FORMATO_MES.format(fecha)) : '—'
}

/** Día completo: "Lunes, 21 de septiembre". */
export function etiquetaDia(clave) {
  const fecha = fechaDeClave(clave)
  return fecha ? capitalizar(FORMATO_DIA.format(fecha)) : '—'
}

/** Día y mes cortos: "22 sept". */
export function etiquetaDiaCorta(clave) {
  const fecha = fechaDeClave(clave)
  return fecha ? `${FORMATO_DIA_NUMERO.format(fecha)} ${FORMATO_MES_CORTO.format(fecha).replace(/\.$/, '')}` : '—'
}

/** Encabezado de la grilla, lunes primero: `['Lun', 'Mar', …]`. */
export const DIAS_SEMANA = Array.from({ length: 7 }, (_, indice) =>
  capitalizar(FORMATO_SEMANA.format(new Date(Date.UTC(2024, 0, 1 + indice))).replace(/\.$/, '')),
)

/**
 * Agrupa ítems por día. `claveDe` decide qué campo manda (por defecto `fecha`);
 * devuelve un `Map` con los días en el orden en que aparecen los ítems.
 */
export function agruparPorDia(items = [], claveDe = (item) => item?.fecha) {
  const mapa = new Map()
  for (const item of items) {
    const clave = claveDia(claveDe(item))
    if (!clave) continue
    const lista = mapa.get(clave)
    if (lista) lista.push(item)
    else mapa.set(clave, [item])
  }
  return mapa
}

function fechaConDias(fecha, dias) {
  return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate() + dias))
}

// Clave de día en UTC: la usan los cálculos internos, que trabajan con fechas
// construidas desde claves y no deben depender de la zona del equipo.
function claveUTC(fecha) {
  return `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}-${String(fecha.getUTCDate()).padStart(2, '0')}`
}
