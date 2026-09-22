// Formato único de fecha y hora del front (docs/PLANTILLA-OBJETOS.md §7).
// Las pantallas no arman `toLocaleString` a mano: eligen el helper según el
// contexto. Todos devuelven el texto de vacío (por defecto '—') cuando el valor
// falta o no es una fecha válida, para que nunca aparezca "Invalid Date".
//
// La hora va SIEMPRE en 24 h (`hour12: false`), como pide la regla de formato
// del repo; el locale es-PY de CLDR rinde 12 h con "p. m." si no se fuerza.
//
// Zona horaria (opcional, agregado 22-09-2026): el huso sigue siendo el del
// navegador por defecto (compatible con lo que ya había). Una app multiempresa
// que necesita el mismo día en el servidor y en el cliente pasa la zona por
// llamada:
//
//   fechaDia(pago.dueAt, '—', { timeZone: 'America/Asuncion' })
//   fechaHora(evento.startsAt, { timeZone: 'America/Asuncion' })
//
// El segundo argumento sigue siendo el texto de vacío; también se acepta un
// objeto de opciones (`{ vacio, timeZone }`) para no encadenar argumentos.

const ES_PY = 'es-PY'
const OPCIONES_HORA = { hour12: false }

// Fecha válida o null. Acepta Date o cualquier valor que `new Date` entienda.
// Una clave `YYYY-MM-DD` (fecha pura, como los `dueAt` del API) se interpreta
// como día local y no como medianoche UTC: si no, en Asunción se mostraba el
// día anterior.
const SOLO_DIA = /^(\d{4})-(\d{2})-(\d{2})$/

// Día puro de calendario como Date en UTC (medianoche), o null. Una clave
// `YYYY-MM-DD` no es un instante: es un día, y se formatea siempre en UTC para
// que ninguna zona lo corra al día anterior o siguiente. Un día inexistente
// (31/9) no es un día válido.
function diaDeCalendario(value) {
  if (typeof value !== 'string') return null
  const partes = SOLO_DIA.exec(value.trim())
  if (!partes) return null
  const anio = Number(partes[1])
  const mes = Number(partes[2])
  const dia = Number(partes[3])
  const fecha = new Date(Date.UTC(anio, mes - 1, dia))
  const real = fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
  return real ? fecha : null
}

export function fechaValida(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'string') {
    const partes = SOLO_DIA.exec(value.trim())
    if (partes) {
      const anio = Number(partes[1])
      const mes = Number(partes[2])
      const dia = Number(partes[3])
      const fecha = new Date(anio, mes - 1, dia)
      // Rechaza días que ruedan (31/9 → 1/10): la fecha pura tiene que ser real.
      const real = fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia
      return real ? fecha : null
    }
  }
  const fecha = new Date(value)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

// Opciones por llamada: `fechaDia(valor, '—', { timeZone })` o
// `fechaDia(valor, { timeZone })`. El vacío conserva su default ('—') y `''`
// sigue siendo un vacío explícito.
function opcionesDe(vacio, opciones) {
  if (vacio && typeof vacio === 'object') return { vacio: vacio.vacio, timeZone: vacio.timeZone }
  return { vacio, timeZone: opciones?.timeZone }
}

function formateador(formato, timeZone) {
  return new Intl.DateTimeFormat(ES_PY, timeZone ? { ...formato, timeZone } : formato)
}

// Aplica el formato al valor: día puro → UTC (nunca se corre de zona), instante
// (Date/ISO) → huso pedido o el del navegador.
function textoFormateado(value, formato, { vacio = '—', timeZone } = {}) {
  const dia = diaDeCalendario(value)
  if (dia) return formateador(formato, 'UTC').format(dia)
  const fecha = fechaValida(value)
  if (!fecha) return vacio
  return formateador(formato, timeZone).format(fecha)
}

// Fecha y hora cortas: "17/9/26, 15:30" (es-PY, 24 h). El formato de fila y
// de detalle más usado de la app.
export function fechaHora(value, vacio = '—', opciones) {
  const { vacio: vacioFinal, timeZone } = opcionesDe(vacio, opciones)
  return textoFormateado(value, { dateStyle: 'short', timeStyle: 'short', ...OPCIONES_HORA }, { vacio: vacioFinal ?? '—', timeZone })
}

// Solo la fecha: "17/9/2026" (es-PY). Para listados y fichas sin hora.
export function fechaDia(value, vacio = '—', opciones) {
  const { vacio: vacioFinal, timeZone } = opcionesDe(vacio, opciones)
  return textoFormateado(value, {}, { vacio: vacioFinal ?? '—', timeZone })
}

// Fecha compacta con mes corto y hora: "17 sep, 15:30". Para filas angostas
// (rendiciones, repartos) donde la fecha completa no entra.
export function fechaHoraCorta(value, vacio = '—', opciones) {
  const { vacio: vacioFinal, timeZone } = opcionesDe(vacio, opciones)
  return textoFormateado(value, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', ...OPCIONES_HORA }, { vacio: vacioFinal ?? '—', timeZone })
}

// Día y mes cortos con hora: "17 sep · 15:30". La fecha de las listas densas
// (conciliación, auditoría) donde el año no aporta.
export function fechaCorta(value, vacio = '—', opciones) {
  const { vacio: vacioFinal, timeZone } = opcionesDe(vacio, opciones)
  const vacioReal = vacioFinal ?? '—'
  const dia = diaDeCalendario(value)
  const fecha = dia || fechaValida(value)
  if (!fecha) return vacioReal
  const zona = dia ? 'UTC' : timeZone
  const parteDia = formateador({ day: '2-digit', month: 'short' }, zona).format(fecha)
  const parteHora = formateador({ hour: '2-digit', minute: '2-digit', ...OPCIONES_HORA }, zona).format(fecha)
  return `${parteDia} · ${parteHora}`
}
