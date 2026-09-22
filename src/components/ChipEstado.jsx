import Icon from './Icon.jsx'
import { estadoChip } from '../utils/estadoEquipo.js'
import { TONOS, tonoCanonico } from '../utils/tonos.js'
import { cn } from '../utils/cn.js'

// Chip de estado único de la biblioteca: sirve para los estados de dispositivo
// (certificado / en revisión / pendiente / con fallas) y para los estados de
// negocio (borrador, enviado, aprobado, vencido, cobrado, anulado, cancelado,
// en revisión, por cobrar…). La etiqueta, el tono y el ícono por defecto salen
// de `ESTADOS_CHIP` (`utils/estadoEquipo.js`); el estado se lee tolerando
// mayúsculas, acentos, espacios y género («Pagada» → Pagado).
//
// `tono` pisa el color del estado (sin cambiar etiqueta ni ícono) para los
// estados propios de cada módulo: el plan de pagos usa el mismo chip con
// «Pagada»/«Cancelada» en vez de copiar el `<span>` con borde y fondo.
//
// Accesibilidad: el ícono es decorativo (`aria-hidden`), el texto es el nombre
// accesible del chip y `title` repite la etiqueta para el tooltip.
export default function ChipEstado({ estado = 'pendiente', etiqueta, icono, tono, title, className }) {
  const config = estadoChip(estado)
  const texto = etiqueta || config.etiqueta
  return (
    <span
      data-estado={estado}
      title={title ?? texto}
      className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold', TONOS.chip[tonoCanonico(tono || config.tono)], className)}
    >
      <Icon name={icono || config.icono} className="h-3 w-3" aria-hidden="true" />
      {texto}
    </span>
  )
}
