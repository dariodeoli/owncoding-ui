import CodigoQr from './CodigoQr.jsx'
import { cn } from '../utils/cn.js'

// Etiqueta de preparación (#250 §11 / F3–F4): «ENV-… · PRODUCTO n DE N» con el
// modelo/variante, el IMEI (o «IMEI pendiente»), el pedido/destino y el QR del
// manifiesto. Se imprime en papel claro (igual que el resto de los imprimibles),
// así que el contenedor puede envolverla con `DocumentoImpresion`.
//
//   <EtiquetaLote codigo="ENV-CDE-ASU-0021" numero={3} total={12} producto="iPhone 15"
//     variante="128 GB · Negro · Nuevo" serial="356789104523178" pedido="MOB-0042" destino="Asunción" />
export default function EtiquetaLote({
  codigo,
  numero,
  total,
  producto,
  variante,
  serial,
  pendienteImei = false,
  pedido,
  destino,
  qr,
  qrValor,
  nota,
  className,
}) {
  return (
    <div className={cn('w-full max-w-[320px] rounded-xl border-2 border-[#10161a] bg-white p-3 text-[#10161a]', className)}>
      <div className="flex items-start justify-between gap-2">
        <b className="font-mono text-sm">{codigo || 'ENV-…'}</b>
        {qr ? <img src={qr} alt="QR del lote" className="h-16 w-16" /> : null}
        {!qr && qrValor ? <CodigoQr valor={qrValor} ancho={96} alt="QR del lote" className="h-16 w-16 rounded-md bg-white p-0" /> : null}
      </div>
      {total ? (
        <p className="mt-1 text-center text-xs font-bold uppercase tracking-wider">Producto {numero} de {total}</p>
      ) : null}
      <p className="mt-1 text-center text-base font-bold leading-tight">{producto || 'Producto'}</p>
      {variante ? <p className="text-center text-[11px]">{variante}</p> : null}
      <p className="mt-1 text-center font-mono text-sm">{serial || (pendienteImei ? 'IMEI pendiente' : '—')}</p>
      {pedido || destino ? (
        <div className="mt-1 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide">
          <span className="min-w-0 truncate">{pedido || ''}</span>
          <span className="min-w-0 truncate text-right">{destino || ''}</span>
        </div>
      ) : null}
      {nota ? <p className="mt-1 text-[10px]">{nota}</p> : null}
    </div>
  )
}
