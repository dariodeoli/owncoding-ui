// Rangos de fecha de los filtros de lista (Hoy · Esta semana · Este mes · Mes
// pasado · Últimos 30 días · Personalizado). Un solo lugar calcula el rango: la
// pantalla solo muestra los atajos y manda el par `desde`/`hasta` a su API.
//
// Las fechas son claves de día `YYYY-MM-DD` (ver `utils/calendario.js`), sin
// hora ni zona: el filtro corta por día, no por instante. "Este mes" llega
// hasta hoy (no inventa días futuros) y "Últimos 30 días" incluye hoy.

import { hoyClave, rangoSemana, sumarDias } from './calendario.js'

export const PERIODOS_FECHA = ['hoy', 'esta-semana', 'este-mes', 'mes-pasado', 'ultimos-30', 'personalizado']

export const ETIQUETA_PERIODO = {
  hoy: 'Hoy',
  'esta-semana': 'Esta semana',
  'este-mes': 'Este mes',
  'mes-pasado': 'Mes pasado',
  'ultimos-30': 'Últimos 30 días',
  personalizado: 'Personalizado',
}

/** ¿Es un atajo con rango propio? (`personalizado` no tiene uno fijo) */
export function esAtajo(periodo) {
  return PERIODOS_FECHA.includes(periodo) && periodo !== 'personalizado'
}

/**
 * Rango de un atajo como `{ desde, hasta }`; `null` si el período no tiene rango
 * fijo (personalizado o desconocido). `hoy` se puede inyectar para tests.
 */
export function rangoDePeriodo(periodo, { hoy } = {}) {
  const clave = hoyClave(hoy)
  if (!clave) return null
  switch (periodo) {
    case 'hoy':
      return { desde: clave, hasta: clave }
    case 'esta-semana': {
      const semana = rangoSemana(clave)
      return { desde: semana.desde, hasta: semana.hasta }
    }
    case 'este-mes':
      return { desde: `${clave.slice(0, 7)}-01`, hasta: clave }
    case 'mes-pasado': {
      const primeroDeEste = `${clave.slice(0, 7)}-01`
      const ultimoDelAnterior = sumarDias(primeroDeEste, -1)
      return { desde: `${ultimoDelAnterior.slice(0, 7)}-01`, hasta: ultimoDelAnterior }
    }
    case 'ultimos-30':
      return { desde: sumarDias(clave, -29), hasta: clave }
    default:
      return null
  }
}

/** Atajo que corresponde a un par `desde`/`hasta`; si ninguno coincide, `personalizado`. */
export function periodoDeRango(desde, hasta, { hoy } = {}) {
  if (!desde || !hasta) return 'personalizado'
  for (const periodo of PERIODOS_FECHA) {
    const rango = esAtajo(periodo) ? rangoDePeriodo(periodo, { hoy }) : null
    if (rango && rango.desde === desde && rango.hasta === hasta) return periodo
  }
  return 'personalizado'
}

/** ¿El rango está al revés? (desde posterior a hasta) */
export function rangoInvertido(desde, hasta) {
  return Boolean(desde) && Boolean(hasta) && desde > hasta
}
