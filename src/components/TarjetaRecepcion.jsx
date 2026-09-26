import { Badge } from './ui.jsx'
import ContadorLote from './ContadorLote.jsx'
import Icon from './Icon.jsx'
import Vencimiento from './Vencimiento.jsx'
import { colorDeTono, estadoEnvio, etiquetaMetodoEnvio, iconoMetodoEnvio } from '../utils/abastecimiento.js'
import { cn } from '../utils/cn.js'

// Tarjeta de llegada pendiente (#250 F5): el lote que está por recibirse, con lo
// esperado («N de M con IMEI» y los pendientes), la ETA, el depósito sugerido y
// la acción de abrir/retomar la recepción. Portable: los datos y las acciones
// entran por props; el stock nace recién al confirmar.
//
//   <TarjetaRecepcion codigo="ENV-CDE-ASU-0021" estado="EN_TRANSITO" origen="CDE"
//     destino="Asunción" metodo="BUS" eta="2026-10-02" unidades={12} conImei={9}
//     deposito="Depósito 1" onAbrir={() => abrir(id)} />
export default function TarjetaRecepcion({
  codigo,
  estado,
  origen,
  destino,
  metodo,
  eta,
  unidades,
  conImei,
  deposito,
  depositoSugerido,
  llegada,
  notas,
  onAbrir,
  acciones,
  className,
}) {
  const est = estadoEnvio(estado)
  const ruta = [origen, destino].filter(Boolean).join(' → ')
  const depositoTexto = deposito ?? depositoSugerido
  const titulo = (
    <>
      <span className="block truncate font-mono text-xs font-bold text-fono-light">{codigo || 'Sin código'}</span>
      <span className="block truncate font-semibold">{ruta || 'Sin origen ni destino'}</span>
    </>
  )

  return (
    <article className={cn('rounded-xl border border-ink-600 bg-ink-800 p-3 text-sm', className)} data-estado={estado}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {onAbrir ? (
            <button type="button" onClick={() => onAbrir()} className="block max-w-full text-left">{titulo}</button>
          ) : titulo}
          {llegada ? <span className="mt-0.5 block truncate text-xs text-mute">Llegó {llegada}</span> : null}
        </div>
        <Badge color={colorDeTono(est.tono)} className="shrink-0">{est.etiqueta}</Badge>
      </div>

      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-mute">
        {metodo ? (
          <span className="inline-flex items-center gap-1">
            <Icon name={iconoMetodoEnvio(metodo)} className="h-3.5 w-3.5 shrink-0" />
            {etiquetaMetodoEnvio(metodo)}
          </span>
        ) : null}
        {eta ? (
          <span className="inline-flex items-center gap-1">
            <Icon name="calendar" className="h-3.5 w-3.5 shrink-0" />
            <Vencimiento fecha={eta} />
          </span>
        ) : null}
        {depositoTexto ? (
          <span className="inline-flex min-w-0 items-center gap-1">
            <Icon name="box" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{depositoTexto}</span>
          </span>
        ) : null}
        {Number.isFinite(Number(unidades)) ? (
          <ContadorLote recibidos={conImei} total={unidades} variante="chip" sufijo="con IMEI" mostrarFaltan />
        ) : null}
      </div>

      {notas ? <p className="mt-1.5 text-xs text-mute">{notas}</p> : null}
      {acciones ? <div className="mt-2 flex flex-wrap items-center gap-2">{acciones}</div> : null}
    </article>
  )
}
