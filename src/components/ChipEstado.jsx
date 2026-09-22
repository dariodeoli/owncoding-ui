import Icon from './Icon.jsx'
import { TONOS, estadoChip } from '../utils/estadoEquipo.js'
import { cn } from '../utils/cn.js'

// Chip de estado del equipo (#241): certificado / en revisión / pendiente / con
// fallas, con el ícono y el color del mapa compartido. El `pass` usa el verde de
// certificado del tema consola. Portable: la pantalla decide el estado.
export default function ChipEstado({ estado = 'pendiente', etiqueta, icono, className }) {
  const config = estadoChip(estado)
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold', TONOS.chip[config.tono], className)}>
      <Icon name={icono || config.icono} className="h-3 w-3" aria-hidden="true" />
      {etiqueta || config.etiqueta}
    </span>
  )
}
