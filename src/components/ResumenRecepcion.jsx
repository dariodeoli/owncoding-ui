import { claveRevision, etiquetaPluralRevision, tonoRevision } from '../utils/revision.js'
import { cn } from '../utils/cn.js'

// Resumen por resultado de una recepción (#250 F5): recibidos + incidencias con
// los conteos reales. Acepta el mapa que devuelve el backend
// (`{ RECIBIDO: 12, FALTANTE: 1, … }`) o la lista de ítems de la recepción; los
// tonos salen del mapa compartido (`utils/revision.js`). Sin datos no dibuja
// nada y la pantalla decide su vacío.
const ORDEN = ['recibido', 'faltante', 'sobrante', 'danado', 'incorrecto']

const CHIP = {
  ok: 'border-ok/30 bg-ok/10 text-ok-text',
  warn: 'border-warn/30 bg-warn/10 text-warn-text',
  bad: 'border-bad/30 bg-bad/10 text-bad-text',
  mute: 'border-ink-500 bg-ink-700 text-mute',
}

export default function ResumenRecepcion({ resumen, items, className }) {
  const conteos = resumen && typeof resumen === 'object' && !Array.isArray(resumen)
    ? Object.fromEntries(Object.entries(resumen).map(([clave, valor]) => [claveRevision(clave), Number(valor) || 0]))
    : (Array.isArray(items)
      ? items.reduce((acumulado, item) => {
        const clave = claveRevision(item?.resultado)
        if (clave) acumulado[clave] = (acumulado[clave] || 0) + 1
        return acumulado
      }, {})
      : {})

  const filas = ORDEN.filter((clave) => (conteos[clave] || 0) > 0)
  if (!filas.length) return null

  return (
    <span className={cn('flex min-w-0 flex-wrap items-center gap-1.5', className)} aria-label="Resumen de la recepción">
      {filas.map((clave) => (
        <span key={clave} className={cn('inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-semibold', CHIP[tonoRevision(clave)] || CHIP.mute)}>
          <b className="tabular-nums">{conteos[clave]}</b>
          {etiquetaPluralRevision(clave).toLowerCase()}
        </span>
      ))}
    </span>
  )
}
