import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'

// Stepper del workflow (#241): Intake → Diagnóstico → Borrado → Listo. Cada paso
// puede venir hecho (check verde), actual (anillo) o pendiente (número gris).
// `pasos` = [{ id, etiqueta, detalle? }]; `actual` = id o índice; `hechos` = ids
// completados. Portable: la pantalla maneja el avance y las acciones.
export default function Stepper({ pasos = [], actual = 0, hechos = [], className }) {
  if (!pasos.length) return null
  const esHecho = (paso, indice) => hechos.includes(paso.id ?? indice) || (typeof actual === 'number' && indice < actual)
  const esActual = (paso, indice) => (paso.id !== undefined ? paso.id === actual : indice === actual)
  return (
    <ol className={cn('flex flex-wrap items-center gap-x-2 gap-y-2', className)}>
      {pasos.map((paso, indice) => {
        const hecho = esHecho(paso, indice)
        const enCurso = esActual(paso, indice)
        return (
          <li key={paso.id ?? indice} className="flex items-center gap-2">
            <span
              className={cn(
                'grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold',
                hecho && 'border-pass/40 bg-pass/15 text-pass',
                !hecho && enCurso && 'border-fono bg-fono/10 text-fono-light',
                !hecho && !enCurso && 'border-ink-600 bg-ink-800 text-mute',
              )}
              aria-hidden="true"
            >
              {hecho ? <Icon name="check" className="h-3.5 w-3.5" /> : indice + 1}
            </span>
            <span className={cn('text-xs font-semibold', enCurso ? 'text-fore' : hecho ? 'text-pass' : 'text-mute')}>
              {paso.etiqueta}
              {paso.detalle && <span className="ml-1 font-normal text-mute">· {paso.detalle}</span>}
            </span>
            {indice < pasos.length - 1 && <span className="mx-1 h-px w-6 bg-ink-600" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}
