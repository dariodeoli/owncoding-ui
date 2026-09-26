import { cn } from '../utils/cn.js'

// Contadores de una necesidad/compra (#250 F1): pendiente, comprado y faltan.
// Números tabulares, sin negativos inventados y con el «faltan» en rojo solo
// cuando hay diferencia. `variante="chips"` es para la tarjeta compacta del
// panel móvil; `texto` para la lista.
export default function ContadoresCompra({ pendiente = 0, comprado = 0, faltan = 0, variante = 'texto', className }) {
  const conteo = (valor) => Math.max(0, Math.trunc(Number(valor) || 0))
  const datos = [
    { clave: 'pendiente', etiqueta: 'pendiente', valor: conteo(pendiente), tono: conteo(pendiente) > 0 ? 'text-warn-text' : 'text-mute' },
    { clave: 'comprado', etiqueta: 'comprado', valor: conteo(comprado), tono: 'text-ok-text' },
    { clave: 'faltan', etiqueta: 'faltan', valor: conteo(faltan), tono: conteo(faltan) > 0 ? 'text-bad-text' : 'text-mute' },
  ]

  if (variante === 'chips') {
    return (
      <span className={cn('flex min-w-0 flex-wrap items-center gap-1.5', className)}>
        {datos.map((dato) => (
          <span key={dato.clave} className="inline-flex items-center gap-1 rounded-lg border border-ink-600 bg-ink-800 px-2 py-0.5 text-[11px] text-mute">
            <b className={cn('tabular-nums', dato.tono)}>{dato.valor}</b>
            {dato.etiqueta}
          </span>
        ))}
      </span>
    )
  }

  return (
    <span className={cn('flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-mute', className)} aria-label="Conteo de la necesidad">
      {datos.map((dato) => (
        <span key={dato.clave}>
          <b className={cn('tabular-nums', dato.tono)}>{dato.valor}</b> {dato.etiqueta}
        </span>
      ))}
    </span>
  )
}
