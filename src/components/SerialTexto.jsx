import { partirSerial, serialEnmascarado } from '../utils/serial.js'
import { cn } from '../utils/cn.js'

// Serial/IMEI en tablas y fichas: se ve completo cuando entra y, si la columna
// queda corta, se recorta la cabeza y los últimos 4 siguen siempre visibles.
// `enmascarar` deja solo la cola (`••••4821`, cosecha de ScaleOS #2) para las
// vistas donde el serial completo no aporta; el valor completo queda en el
// `title` del elemento.
export default function SerialTexto({ serial, className, tonoCola = 'text-fore', vacio = '—', enmascarar = false }) {
  if (enmascarar) {
    const mascara = serialEnmascarado(serial)
    if (!mascara) return <span className={cn('font-mono', className)}>{vacio}</span>
    return (
      <span className={cn('font-mono', className)} title={String(serial)}>
        {mascara}
      </span>
    )
  }
  const { cabeza, cola } = partirSerial(serial)
  if (!cola) return <span className={cn('font-mono', className)}>{vacio}</span>
  return (
    <span className={cn('flex min-w-0 font-mono', className)} title={String(serial)}>
      <span className="min-w-0 truncate">{cabeza}</span>
      <b className={cn('shrink-0', tonoCola)}>{cola}</b>
    </span>
  )
}
