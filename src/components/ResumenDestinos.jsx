import { cn } from '../utils/cn.js'

// Destinos de una compra consolidada (#250 §5): agrupa solicitudes idénticas
// **conservando destinos** («1 pedido A · 2 pedido B · 3 stock»). Presentacional:
// los destinos entran por props y elegir uno se avisa por callback.
//
//   <ResumenDestinos destinos={[{ etiqueta: 'Pedido MOB-0042', cantidad: 1 }, { etiqueta: 'Stock', cantidad: 3 }]} />
export default function ResumenDestinos({ destinos = [], ariaLabel = 'Destinos', onElegir, className }) {
  const lista = (Array.isArray(destinos) ? destinos : []).filter((destino) => destino && Number(destino.cantidad) > 0)
  if (!lista.length) return null
  return (
    <span className={cn('flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-mute', className)} aria-label={ariaLabel}>
      {lista.map((destino, indice) => (
        <span key={destino.id ?? `${destino.etiqueta}-${indice}`} className="flex min-w-0 items-center gap-1.5">
          {indice > 0 && <span aria-hidden="true">·</span>}
          {onElegir ? (
            <button
              type="button"
              onClick={() => onElegir(destino)}
              title={destino.detalle || undefined}
              className="min-w-0 truncate transition hover:text-fore"
            >
              <b className="tabular-nums text-fore">{Number(destino.cantidad)}</b> {destino.etiqueta}
            </button>
          ) : (
            <span className="min-w-0 truncate" title={destino.detalle || undefined}>
              <b className="tabular-nums text-fore">{Number(destino.cantidad)}</b> {destino.etiqueta}
            </span>
          )}
        </span>
      ))}
    </span>
  )
}
