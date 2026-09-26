import { ESTADOS_REVISION, INCIDENCIAS, etiquetaRevision, tonoRevision } from '../utils/revision.js'
import { cn } from '../utils/cn.js'

// Selector del estado/incidencia de una unidad en la recepción (#250 F5):
// botones cortos con el tono del mapa compartido; elegir el mismo estado lo
// quita (vuelve a `null`). Portable: los tipos entran por `tipos` y el valor
// por `valor`.
//
//   <SelectorIncidencia valor={tipo} onChange={setTipo} />
const CHIP = {
  ok: 'border-ok/40 bg-ok/10 text-ok-text',
  warn: 'border-warn/40 bg-warn/10 text-warn-text',
  bad: 'border-bad/40 bg-bad/10 text-bad-text',
  mute: 'border-ink-500 bg-ink-700 text-mute',
}
const CHIP_APAGADO = 'border-ink-500 text-mute hover:border-fono hover:text-fore'

export default function SelectorIncidencia({ valor, onChange, tipos = INCIDENCIAS, permitirQuitar = true, disabled = false, ariaLabel = 'Incidencia de la unidad', className }) {
  return (
    <span role="group" aria-label={ariaLabel} className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {tipos.map((tipo) => {
        const activo = valor === tipo
        const tono = tonoRevision(tipo)
        return (
          <button
            key={tipo}
            type="button"
            disabled={disabled}
            aria-pressed={activo}
            title={activo && permitirQuitar ? 'Quitar la incidencia' : etiquetaRevision(tipo)}
            onClick={() => onChange?.(activo && permitirQuitar ? null : tipo)}
            className={cn(
              'rounded-lg border px-2 py-0.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
              activo ? CHIP[tono] || CHIP.mute : CHIP_APAGADO,
            )}
          >
            {ESTADOS_REVISION[tipo]?.etiqueta || tipo}
          </button>
        )
      })}
    </span>
  )
}
