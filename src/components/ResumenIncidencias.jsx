import { cn } from '../utils/cn.js'

// Resumen de incidencias de una recepción (#250 §9/§10): faltantes, sobrantes,
// dañados, incorrectos y unidades sin IMEI, con los conteos reales. Solo
// muestra lo que hay; un conteo en cero no ocupa lugar y sin incidencias dice
// «Sin incidencias» en verde (nunca se corrige nada en silencio: la app decide
// qué hacer con cada una).
const TIPOS = {
  faltante: { etiqueta: 'Faltan', tono: 'bad' },
  sobrante: { etiqueta: 'Sobran', tono: 'warn' },
  danado: { etiqueta: 'Dañadas', tono: 'bad' },
  incorrecto: { etiqueta: 'Incorrectas', tono: 'warn' },
  sinImei: { etiqueta: 'Sin IMEI', tono: 'mute' },
  sinDocumentacion: { etiqueta: 'Sin documentación', tono: 'warn' },
}

const CLASES = {
  bad: 'border-bad/30 bg-bad/10 text-bad',
  warn: 'border-warn/30 bg-warn/10 text-warn',
  mute: 'border-ink-500 bg-ink-700 text-mute',
  ok: 'border-ok/30 bg-ok/10 text-ok',
}

export default function ResumenIncidencias({ incidencias = [], sinIncidencias = 'Sin incidencias', className }) {
  const lista = (Array.isArray(incidencias) ? incidencias : [])
    .map((incidencia) => ({ ...incidencia, cantidad: Math.trunc(Number(incidencia?.cantidad) || 0) }))
    .filter((incidencia) => incidencia.cantidad > 0)

  if (!lista.length) {
    return <span className={cn('inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold', CLASES.ok, className)}>{sinIncidencias}</span>
  }

  return (
    <span className={cn('flex min-w-0 flex-wrap items-center gap-1.5', className)} role="list" aria-label="Incidencias de la recepción">
      {lista.map((incidencia, indice) => {
        const base = TIPOS[incidencia.tipo] || { etiqueta: incidencia.tipo || 'Incidencia', tono: 'mute' }
        const tono = incidencia.tono || base.tono
        return (
          <span
            key={`${incidencia.tipo}-${indice}`}
            role="listitem"
            title={incidencia.detalle || undefined}
            className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-lg border px-2 py-0.5 text-xs font-semibold', CLASES[tono] || CLASES.mute)}
          >
            {incidencia.etiqueta || base.etiqueta}
            <span className="tabular-nums">{incidencia.cantidad}</span>
          </span>
        )
      })}
    </span>
  )
}
