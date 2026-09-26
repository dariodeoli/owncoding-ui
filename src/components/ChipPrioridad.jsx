import { etiquetaPrioridad, tonoPrioridad } from '../utils/abastecimiento.js'
import { cn } from '../utils/cn.js'

// Chip de prioridad de una necesidad/compra (#250 F1): alta (rojo), media
// (ámbar) y baja (mute). La etiqueta y el tono salen del mapa compartido
// (`utils/abastecimiento.js`); con `etiqueta` se puede pisar el texto.
export default function ChipPrioridad({ prioridad = 'media', etiqueta, title, className }) {
  const tono = tonoPrioridad(prioridad)
  const texto = etiqueta || etiquetaPrioridad(prioridad)
  const CLASES = {
    bad: 'border-bad/30 bg-bad/10 text-bad',
    warn: 'border-warn/30 bg-warn/10 text-warn',
    ok: 'border-ok/30 bg-ok/10 text-ok',
    info: 'border-info/30 bg-info/10 text-info',
    mute: 'border-ink-500 bg-ink-700 text-mute',
  }
  return (
    <span
      className={cn('inline-flex items-center whitespace-nowrap rounded-lg border px-2 py-0.5 text-xs font-semibold', CLASES[tono] || CLASES.mute, className)}
      title={title || `Prioridad ${String(texto).toLowerCase()}`}
    >
      {texto}
    </span>
  )
}
