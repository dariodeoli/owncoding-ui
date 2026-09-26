import { iconoOrigen, etiquetaOrigen, tonoOrigen } from '../utils/abastecimiento.js'
import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'

// Chip de origen de una necesidad (#250 F1): venta sin stock, reserva sin
// unidad, venta sobre stock, bajo reposición, pedido comprometido o manual.
// La etiqueta, el tono y el ícono salen del mapa compartido
// (`utils/abastecimiento.js`); una clave libre se muestra tal cual en mute.
export default function ChipOrigen({ origen, etiqueta, title, className }) {
  const tono = tonoOrigen(origen)
  const texto = etiqueta || etiquetaOrigen(origen)
  const CLASES = {
    bad: 'border-bad/30 bg-bad/10 text-bad',
    warn: 'border-warn/30 bg-warn/10 text-warn',
    ok: 'border-ok/30 bg-ok/10 text-ok',
    info: 'border-info/30 bg-info/10 text-info',
    mute: 'border-ink-500 bg-ink-700 text-mute',
  }
  return (
    <span
      className={cn('inline-flex min-w-0 items-center gap-1 whitespace-nowrap rounded-lg border px-2 py-0.5 text-xs font-semibold', CLASES[tono] || CLASES.mute, className)}
      title={title || texto}
    >
      <Icon name={iconoOrigen(origen)} className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{texto}</span>
    </span>
  )
}
