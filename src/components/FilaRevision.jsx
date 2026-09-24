import SerialTexto from './SerialTexto.jsx'
import { CELDA_DATO } from '../utils/tabla.js'
import { etiquetaRevision, tonoRevision } from '../utils/revision.js'
import { cn } from '../utils/cn.js'

// Fila de revisión de una recepción (#250 F5): lo esperado (producto + serial)
// con su estado y las acciones que pase la pantalla. El estado sale del mapa
// compartido (`utils/revision.js`) y pinta el chip y el borde: las incidencias
// usan la superficie suave del tono, el resto queda neutro.
//
//   <FilaRevision etiqueta="iPhone 15 · 128 GB" serial="356789104523178" estado="ok" />
//   <FilaRevision etiqueta="AirPods Pro" estado="faltante" detalle="No llegó" acciones={<Button …/>} />
const TONOS = {
  ok: 'border-ok/30 bg-ok/5',
  warn: 'border-warn/25 bg-warn/5',
  bad: 'border-bad/25 bg-bad/5',
  mute: 'border-ink-600',
}

const CHIP = {
  ok: 'border-ok/30 bg-ok/10 text-ok',
  warn: 'border-warn/30 bg-warn/10 text-warn',
  bad: 'border-bad/30 bg-bad/10 text-bad',
  mute: 'border-ink-500 bg-ink-700 text-mute',
}

export default function FilaRevision({ etiqueta, serial, estado = 'ok', detalle, acciones, compact = false, className }) {
  const tono = tonoRevision(estado)
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border px-3', compact ? 'py-1.5' : 'py-2.5', TONOS[tono] || TONOS.mute, className)}>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{etiqueta}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-mute">
          {serial ? <SerialTexto serial={serial} className="text-[11px]" /> : <span>IMEI pendiente</span>}
          {detalle ? <span className={CELDA_DATO} title={String(detalle)}>{detalle}</span> : null}
        </span>
      </span>
      <span className={cn('shrink-0 rounded-lg border px-2 py-0.5 text-xs font-semibold', CHIP[tono] || CHIP.mute)} data-estado={estado}>{etiquetaRevision(estado)}</span>
      {acciones ? <span className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</span> : null}
    </div>
  )
}
