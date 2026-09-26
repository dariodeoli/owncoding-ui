import { Badge } from './ui.jsx'
import ChipOrigen from './ChipOrigen.jsx'
import ChipPrioridad from './ChipPrioridad.jsx'
import ContadoresCompra from './ContadoresCompra.jsx'
import Icon from './Icon.jsx'
import ResumenDestinos from './ResumenDestinos.jsx'
import Vencimiento from './Vencimiento.jsx'
import { colorDeTono, estadoNecesidad } from '../utils/abastecimiento.js'
import { cn } from '../utils/cn.js'

// Tarjeta de necesidad/compra (#250 F1): la pieza compacta del panel «Por
// comprar» en móvil. Muestra producto y variante exacta, estado, prioridad,
// origen, fecha prometida, vínculo con la venta/reserva, contadores
// (pendiente/comprado/faltan), destinos de la consolidación y observaciones.
// Portable: todo entra por props y abrir/elegir se avisan por callback; la
// tarjeta no crea stock ni decide permisos.
//
//   <TarjetaNecesidad
//     producto="iPhone 15 Pro" variante="256 GB · Titanio natural · Nuevo"
//     prioridad="alta" estado="por_comprar" origen="CDE"
//     fechaPrometida={pedido.deliveryAt}
//     vinculo={{ etiqueta: 'Pedido MOB-0042', onClick: abrirPedido }}
//     destinos={[{ etiqueta: 'Pedido MOB-0042', cantidad: 1 }, { etiqueta: 'stock', cantidad: 3 }]}
//     pendiente={4} comprado={1} faltan={3}
//     observaciones="El cliente confirmó color"
//     onAbrir={() => abrirNecesidad(id)}
//   />
export default function TarjetaNecesidad({
  producto,
  variante,
  prioridad,
  estado,
  origen,
  centro,
  fechaPrometida,
  diasAviso,
  vinculo,
  destinos,
  onElegirDestino,
  observaciones,
  pendiente,
  comprado,
  faltan,
  onAbrir,
  acciones,
  className,
}) {
  const est = estadoNecesidad(estado)

  const titulo = (
    <>
      <span className="block truncate font-semibold">{producto || 'Sin producto'}</span>
      {variante ? <span className="block truncate text-xs text-mute">{variante}</span> : null}
    </>
  )

  return (
    <article className={cn('rounded-xl border border-ink-600 bg-ink-800 p-3 text-sm', className)} data-estado={estado}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {onAbrir ? (
            <button type="button" onClick={() => onAbrir()} className="block max-w-full text-left">{titulo}</button>
          ) : titulo}
        </div>
        <ChipPrioridad prioridad={prioridad} className="shrink-0" />
      </div>

      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-mute">
        <Badge color={colorDeTono(est.tono)}>{est.etiqueta}</Badge>
        {origen ? <ChipOrigen origen={origen} /> : null}
        {centro ? (
          <span className="inline-flex min-w-0 items-center gap-1">
            <Icon name="building" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{centro}</span>
          </span>
        ) : null}
        {fechaPrometida ? (
          <span className="inline-flex items-center gap-1">
            <Icon name="calendar" className="h-3.5 w-3.5 shrink-0" />
            <Vencimiento fecha={fechaPrometida} diasAviso={diasAviso} />
          </span>
        ) : null}
        {vinculo?.etiqueta ? (
          vinculo.onClick ? (
            <button type="button" onClick={vinculo.onClick} className="inline-flex min-w-0 items-center gap-1 transition hover:text-fore">
              <Icon name="receipt" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{vinculo.etiqueta}</span>
            </button>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Icon name="receipt" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{vinculo.etiqueta}</span>
            </span>
          )
        ) : null}
      </div>

      <ContadoresCompra className="mt-2" pendiente={pendiente} comprado={comprado} faltan={faltan} />
      {Array.isArray(destinos) && destinos.length > 0 ? (
        <div className="mt-1.5">
          <ResumenDestinos destinos={destinos} onElegir={onElegirDestino} />
        </div>
      ) : null}
      {observaciones ? <p className="mt-1.5 text-xs text-mute">{observaciones}</p> : null}
      {acciones ? <div className="mt-2 flex flex-wrap items-center gap-2">{acciones}</div> : null}
    </article>
  )
}
