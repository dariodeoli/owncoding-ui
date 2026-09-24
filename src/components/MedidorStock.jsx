import { cn } from '../utils/cn.js'

// Medidor de stock contra el punto de reposición: un solo objeto para las
// alertas y el panel de abastecimiento. Tonos: `bad` agotado (stock ≤ 0),
// `warn` reponer (stock ≤ umbral) y `ok` por encima. Sin dato (`stock` null)
// muestra el vacío explícito, nunca un 0 inventado.
//
//   <MedidorStock stock={3} umbral={5} />
//   <MedidorStock stock={24} umbral={5} variante="chip" />
export default function MedidorStock({
  stock,
  umbral,
  variante = 'texto',
  etiqueta,
  mostrarUmbral = true,
  vacio = 'Sin dato',
  className,
}) {
  const sinDato = stock === null || stock === undefined || stock === ''
  const n = Number(stock)
  const u = Number(umbral)
  if (sinDato || !Number.isFinite(n)) {
    return <span className={cn('text-xs text-mute', className)}>{vacio}</span>
  }
  const tieneUmbral = Number.isFinite(u)
  const agotado = n <= 0
  const bajo = !agotado && tieneUmbral && n <= u
  const tono = agotado ? 'bad' : bajo ? 'warn' : 'ok'
  const texto = agotado ? 'Agotado' : bajo ? 'Reponer' : 'En stock'
  const detalle = tieneUmbral ? `${n} de ${u}` : String(n)

  if (variante === 'barra') {
    const techo = tieneUmbral ? Math.max(u, n) : n
    const porcentaje = techo > 0 ? Math.min(100, Math.round((n / techo) * 100)) : 0
    return (
      <span className={cn('block min-w-0 space-y-1', className)}>
        <span className="flex items-baseline justify-between gap-2 text-xs">
          <span className={cn('font-semibold', tono === 'bad' ? 'text-bad' : tono === 'warn' ? 'text-warn' : 'text-ok')}>{texto}</span>
          <span className="tabular-nums text-mute">{detalle}</span>
        </span>
        <span role="progressbar" aria-label={etiqueta ?? `Stock ${detalle}`} aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} className="block h-1.5 overflow-hidden rounded-full bg-ink-700">
          <span className={cn('block h-full rounded-full transition-[width]', tono === 'bad' ? 'bg-bad' : tono === 'warn' ? 'bg-warn' : 'bg-ok')} style={{ width: `${porcentaje}%` }} />
        </span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold',
        variante === 'chip' && 'rounded-lg border px-2 py-0.5',
        variante === 'chip' && (tono === 'bad' ? 'border-bad/30 bg-bad/10 text-bad' : tono === 'warn' ? 'border-warn/30 bg-warn/10 text-warn' : 'border-ok/30 bg-ok/10 text-ok'),
        variante === 'texto' && (tono === 'bad' ? 'text-bad' : tono === 'warn' ? 'text-warn' : 'text-ok'),
        className,
      )}
      title={etiqueta ?? `${texto} · ${detalle}`}
    >
      {variante !== 'chip' && <span className={cn('h-1.5 w-1.5 rounded-full', tono === 'bad' ? 'bg-bad' : tono === 'warn' ? 'bg-warn' : 'bg-ok')} aria-hidden="true" />}
      <span className="tabular-nums">{detalle}</span>
      {mostrarUmbral && <span className="font-normal text-mute">{texto}</span>}
    </span>
  )
}
