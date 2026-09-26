import { Badge, Money } from './ui.jsx'
import ContadorLote from './ContadorLote.jsx'
import Icon from './Icon.jsx'
import { colorDeTono, estadoCompra } from '../utils/abastecimiento.js'
import { cn } from '../utils/cn.js'

// Tarjeta de compra (#250 F2–F5): código `COM-…`, proveedor, estado,
// IMEI completados («9 de 12 con IMEI»), costo/moneda y referencia. Portable:
// los datos y las acciones entran por props y el stock no se toca acá.
//
//   <TarjetaCompra codigo="COM-CDE-0048" proveedor="Importadora XYZ" estado="COMPRADA"
//     unidades={12} conImei={9} costo={1500} moneda="USD" referencia="Factura 001-123" />
export default function TarjetaCompra({
  codigo,
  proveedor,
  referencia,
  moneda = 'PYG',
  simbolo,
  costo,
  estado,
  unidades,
  conImei,
  origen,
  destino,
  notas,
  onAbrir,
  acciones,
  className,
}) {
  const est = estadoCompra(estado)
  const titulo = (
    <>
      <span className="block truncate font-mono text-xs font-bold text-fono-light">{codigo || 'Sin código'}</span>
      <span className="block truncate font-semibold">{proveedor || 'Sin proveedor'}</span>
    </>
  )

  return (
    <article className={cn('rounded-xl border border-ink-600 bg-ink-800 p-3 text-sm', className)} data-estado={estado}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {onAbrir ? (
            <button type="button" onClick={() => onAbrir()} className="block max-w-full text-left">{titulo}</button>
          ) : titulo}
          {referencia ? <span className="mt-0.5 block truncate text-xs text-mute">Ref. {referencia}</span> : null}
        </div>
        <Badge color={colorDeTono(est.tono)} className="shrink-0">{est.etiqueta}</Badge>
      </div>

      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-mute">
        {Number.isFinite(Number(unidades)) ? (
          <ContadorLote recibidos={conImei} total={unidades} variante="chip" sufijo="con IMEI" mostrarFaltan />
        ) : null}
        {costo !== null && costo !== undefined && costo !== '' ? (
          <span className="inline-flex items-center gap-1">
            <Icon name="money" className="h-3.5 w-3.5 shrink-0" />
            <Money value={costo} currency={moneda} simbolo={simbolo} />
          </span>
        ) : null}
        {origen ? (
          <span className="inline-flex min-w-0 items-center gap-1">
            <Icon name="building" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{origen}</span>
          </span>
        ) : null}
        {destino ? (
          <span className="inline-flex min-w-0 items-center gap-1">
            <Icon name="arrowRight" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{destino}</span>
          </span>
        ) : null}
      </div>

      {notas ? <p className="mt-1.5 text-xs text-mute">{notas}</p> : null}
      {acciones ? <div className="mt-2 flex flex-wrap items-center gap-2">{acciones}</div> : null}
    </article>
  )
}
