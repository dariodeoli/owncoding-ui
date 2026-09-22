import Icon from './Icon.jsx'
import { TONOS, estadoItem } from '../utils/estadoEquipo.js'
import { cn } from '../utils/cn.js'

// Fila del checklist con conteo (#240/#241): el punto con su estado, la etiqueta,
// la nota de la inspección y, si la pantalla lo permite, el botón para cambiarlo.
// `ConteoChecklist` es el "3 de 3 pass" del encabezado (con las fallas aparte).
export default function FilaChecklist({ etiqueta, estado = 'sinVerificar', nota, accion, className }) {
  const config = estadoItem(estado)
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl border border-ink-600 p-2.5', className)}>
      <span className={cn('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full', TONOS.punto[config.tono])} title={config.etiqueta} aria-hidden="true">
        <Icon name={config.icono} className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{etiqueta}</p>
        {nota && <p className="mt-0.5 text-xs text-mute">{nota}</p>}
      </div>
      <span className="shrink-0 text-[11px] font-semibold text-mute" title={config.etiqueta}>{config.etiqueta}</span>
      {accion}
    </div>
  )
}

export function ConteoChecklist({ pasan = 0, total = 0, fallas = 0, sustantivo = 'pass', className }) {
  const completo = total > 0 && pasan === total
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-2 text-xs font-semibold', className)}>
      <span className={completo ? 'text-pass' : 'text-mute'}>{pasan} de {total} {sustantivo}</span>
      {fallas > 0 && <span className="text-bad">{fallas} {fallas === 1 ? 'falla' : 'fallas'}</span>}
    </span>
  )
}
