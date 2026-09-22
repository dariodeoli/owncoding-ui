import ChipEstado from './ChipEstado.jsx'
import { EmptyState, Money, Nota } from './ui.jsx'
import { CELDA_DATO, CELDA_ENCABEZADO, CELDA_NUMERO } from '../utils/tabla.js'
import { fechaDia } from '../utils/fecha.js'
import { cn } from '../utils/cn.js'

// Plan de pagos de una venta a plazo (portado del bloque «Plan de pagos» del
// portal de LedBox y de `paymentPlan`/`expectedPayments` de su API): anticipo
// (si existe) + cuotas con etiqueta, monto (Int PYG), vencimiento y estado; la
// fila «a transferir ahora» destacada y el total al pie.
//
// Portable: el objeto no calcula cuotas, no consulta la API y no sabe de
// ningún estado de negocio; recibe el plan ya resuelto y lo dibuja. Los montos
// van enteros en guaraníes (o `moneda="USD"`) y el formato lo hace `Money`.

/** Estados de cuota → chip del plan. `pagada` usa el verde `pass`. */
export const ESTADOS_CUOTA = {
  pendiente: { chip: 'pendiente', etiqueta: 'Pendiente', icono: 'clock' },
  revision: { chip: 'revision', etiqueta: 'En revisión', icono: 'refresh' },
  pagada: { chip: 'pass', etiqueta: 'Pagada', icono: 'check' },
  cancelada: { chip: 'pendiente', etiqueta: 'Cancelada', icono: 'close', tono: 'mute' },
}

function ChipCuota({ estado, estados }) {
  const config = estados[estado]
  if (!config) return null
  return <ChipEstado estado={config.chip} etiqueta={config.etiqueta} icono={config.icono} tono={config.tono} />
}

function FilaPlan({ etiqueta, monto, vence, estado, nota, moneda, simbolo, estados, destacada, conEstado }) {
  return (
    <tr className="border-t border-ink-700">
      <td className={cn(CELDA_DATO, 'py-1.5 pr-3 text-xs text-fore')}>
        <span className="font-semibold">{etiqueta}</span>
        {destacada && <small className="ml-1.5 font-medium text-fono-light">A transferir ahora</small>}
        {nota && <small className="mt-0.5 block text-[11px] text-mute">{nota}</small>}
      </td>
      <td className={cn(CELDA_NUMERO, 'py-1.5 pr-3 text-xs font-semibold text-fore')}>
        <Money value={monto} currency={moneda} simbolo={simbolo} />
      </td>
      <td className={cn(CELDA_DATO, 'py-1.5 pr-3 whitespace-nowrap text-xs')}>{vence ? fechaDia(vence) : '—'}</td>
      {conEstado && (
        <td className={cn(CELDA_DATO, 'py-1.5 text-xs')}>
          {estado ? <ChipCuota estado={estado} estados={estados} /> : null}
        </td>
      )}
    </tr>
  )
}

export default function PlanPagos({
  /** Monto del anticipo (0 o `null` = no hay anticipo separado). */
  anticipo = 0,
  anticipoEtiqueta = 'Anticipo',
  anticipoVence,
  /** Cuotas: `[{ id?, etiqueta, monto, vence?, estado?, nota? }]`. */
  cuotas = [],
  /**
   * Lo que corresponde transferir ahora: `{ id?, etiqueta, monto }`. Con `id`
   * se marca además la cuota correspondiente en la tabla.
   */
  aTransferir = null,
  /** Total del plan; `null` no dibuja el pie. */
  total = null,
  totalEtiqueta = 'Total',
  /** Saldo del plan sin cuota agendada (0 = el plan cubre todo). */
  saldoSinCuota = 0,
  saldoEtiqueta = 'Saldo sin cuota agendada',
  /** Condiciones de pago escritas por el equipo. */
  condiciones = null,
  /** Moneda de los montos (`PYG` entero o `USD` con decimales). */
  moneda = 'PYG',
  /** Símbolo del guaraní para el panel de la app (p. ej. `'Gs.'` o `'₲'`). */
  simbolo,
  /** Mapa `estado → chip`; pisa `ESTADOS_CUOTA`. */
  estados = ESTADOS_CUOTA,
  /** Texto del vacío: no hay anticipo ni cuotas. */
  vacio = 'El presupuesto se paga en un solo pago.',
  className,
}) {
  const montoAnticipo = Number(anticipo) || 0
  const hayAnticipo = montoAnticipo > 0
  const conEstado = (cuotas || []).some((cuota) => Boolean(cuota.estado))
  const vacioPlan = !hayAnticipo && !(cuotas || []).length

  if (vacioPlan && total === null && !condiciones && !aTransferir) {
    return <EmptyState compact icon="receipt" title={vacio} className={className} />
  }

  return (
    <div className={cn('space-y-2.5', className)}>
      {aTransferir && (
        <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-fono/40 bg-fono/10 px-3 py-2">
          <span className="text-xs font-semibold text-fono-light">{aTransferir.etiqueta || 'A transferir ahora'}</span>
          <strong className="text-lg font-bold tabular-nums text-fore">
            <Money value={aTransferir.monto} currency={moneda} simbolo={simbolo} />
          </strong>
        </div>
      )}

      {vacioPlan ? (
        <p className="text-xs text-mute">{vacio}</p>
      ) : (
        <table className="w-full">
          <caption className="sr-only">Plan de pagos</caption>
          <thead>
            <tr>
              <th className={cn(CELDA_ENCABEZADO, 'pb-1 text-left')} scope="col">Cuota</th>
              <th className={cn(CELDA_ENCABEZADO, 'pb-1 text-right')} scope="col">Monto</th>
              <th className={cn(CELDA_ENCABEZADO, 'pb-1 text-left')} scope="col">Vencimiento</th>
              {conEstado && (
                <th className={cn(CELDA_ENCABEZADO, 'pb-1 text-left')} scope="col">Estado</th>
              )}
            </tr>
          </thead>
          <tbody>
            {hayAnticipo && (
              <FilaPlan
                etiqueta={anticipoEtiqueta}
                monto={montoAnticipo}
                vence={anticipoVence}
                moneda={moneda}
                simbolo={simbolo}
                estados={estados}
                conEstado={false}
                destacada={aTransferir?.id === 'anticipo'}
              />
            )}
            {(cuotas || []).map((cuota, indice) => (
              <FilaPlan
                key={cuota.id ?? `${cuota.etiqueta}-${indice}`}
                etiqueta={cuota.etiqueta}
                monto={cuota.monto}
                vence={cuota.vence}
                estado={cuota.estado}
                nota={cuota.nota}
                moneda={moneda}
                simbolo={simbolo}
                estados={estados}
                conEstado={conEstado}
                destacada={Boolean(aTransferir?.id && aTransferir.id === cuota.id)}
              />
            ))}
          </tbody>
          {total !== null && (
            <tfoot>
              <tr className="border-t border-ink-500">
                <td className={cn(CELDA_DATO, 'py-2 text-xs font-semibold text-fore')} colSpan={conEstado ? 3 : 2}>
                  {totalEtiqueta}
                </td>
                <td className={cn(CELDA_NUMERO, 'py-2 text-sm font-bold text-fore')}>
                  <Money value={total} currency={moneda} simbolo={simbolo} />
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      )}

      {vacioPlan && total !== null && (
        <div className="flex items-baseline justify-between gap-2 border-t border-ink-700 pt-2">
          <span className="text-xs font-semibold text-fore">{totalEtiqueta}</span>
          <span className="text-sm font-bold tabular-nums text-fore">
            <Money value={total} currency={moneda} simbolo={simbolo} />
          </span>
        </div>
      )}

      {saldoSinCuota > 0 && (
        <p className="text-xs text-mute">
          {saldoEtiqueta}:{' '}
          <span className="font-semibold tabular-nums text-fore">
            <Money value={saldoSinCuota} currency={moneda} simbolo={simbolo} />
          </span>
        </p>
      )}
      {condiciones && <Nota tono="info" compact>{condiciones}</Nota>}
    </div>
  )
}
