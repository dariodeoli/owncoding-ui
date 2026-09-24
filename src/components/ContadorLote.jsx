import { cn } from '../utils/cn.js'

// Contador de lote «N de M» (#250): unidades recibidas/etiquetadas sobre el
// total, con el tono según el avance (en curso, completo) y el vacío explícito
// cuando no hay dato. Lo usan los envíos entrantes, la recepción y las
// etiquetas («3 de 12»).
//
//   <ContadorLote recibidos={3} total={12} />
//   <ContadorLote recibidos={12} total={12} variante="barra" sufijo="unidades" />
export default function ContadorLote({ recibidos, total, variante = 'texto', sufijo, mostrarFaltan = false, vacio = 'Sin dato', className }) {
  const r = Number(recibidos)
  const t = Number(total)
  if (recibidos === null || recibidos === undefined || !Number.isFinite(t) || t <= 0 || !Number.isFinite(r)) {
    return <span className={cn('text-xs text-mute', className)}>{vacio}</span>
  }
  const hechas = Math.max(0, Math.min(t, Math.trunc(r)))
  const completo = hechas >= t
  const tono = completo ? 'ok' : hechas > 0 ? 'warn' : 'mute'
  const faltan = t - hechas
  const texto = sufijo ? `${hechas} de ${t} ${sufijo}` : `${hechas} de ${t}`

  if (variante === 'barra') {
    const porcentaje = Math.round((hechas / t) * 100)
    return (
      <span className={cn('block min-w-0 space-y-1', className)}>
        <span className="flex items-baseline justify-between gap-2 text-xs">
          <span className={cn('font-semibold', tono === 'ok' ? 'text-ok' : tono === 'warn' ? 'text-warn' : 'text-mute')}>{texto}</span>
          {mostrarFaltan && !completo && <span className="text-mute">faltan {faltan}</span>}
        </span>
        <span
          role="progressbar"
          aria-label={sufijo ? `${hechas} de ${t} ${sufijo}` : `${hechas} de ${t}`}
          aria-valuenow={hechas}
          aria-valuemin={0}
          aria-valuemax={t}
          className="block h-1.5 overflow-hidden rounded-full bg-ink-700"
        >
          <span className={cn('block h-full rounded-full transition-[width]', tono === 'ok' ? 'bg-ok' : tono === 'warn' ? 'bg-warn' : 'bg-mute')} style={{ width: `${porcentaje}%` }} />
        </span>
      </span>
    )
  }

  if (variante === 'chip') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2 py-0.5 text-xs font-semibold',
          tono === 'ok' ? 'border-ok/30 bg-ok/10 text-ok' : tono === 'warn' ? 'border-warn/30 bg-warn/10 text-warn' : 'border-ink-500 bg-ink-700 text-mute',
          className,
        )}
        title={texto}
      >
        <span className="tabular-nums">{texto}</span>
        {mostrarFaltan && !completo && <span className="font-normal">· faltan {faltan}</span>}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-baseline gap-1.5 whitespace-nowrap text-xs', className)} title={texto}>
      <span className={cn('font-semibold tabular-nums', tono === 'ok' ? 'text-ok' : tono === 'warn' ? 'text-warn' : 'text-mute')}>{texto}</span>
      {mostrarFaltan && !completo && <span className="text-mute">faltan {faltan}</span>}
    </span>
  )
}
