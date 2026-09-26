import { useId, useRef, useState } from 'react'
import { Aviso, Input, Label } from './ui.jsx'
import { cn } from '../utils/cn.js'
import { ETIQUETA_PERIODO, PERIODOS_FECHA, periodoDeRango, rangoDePeriodo, rangoInvertido } from '../utils/rangoFecha.js'

// Filtro de rango de fechas: atajos (Hoy · Esta semana · Este mes · Mes pasado ·
// Últimos 30 días) + campos desde/hasta. Muestra el atajo activo cuando el par
// coincide con uno; si no, marca «Personalizado».
//
// Portable: el consumidor decide si lo controla (`desde`/`hasta` + `onCambio`)
// o lo deja suelto (`desdePorDefecto`/`hastaPorDefecto`). El rango viaja como
// claves de día `YYYY-MM-DD` (ver `utils/calendario.js`): el filtro corta por
// día, no por instante, y `onCambio(desde, hasta)` entrega el par ya listo para
// la API. El rango invertido se marca en pantalla, pero no se corrige solo.

export default function RangoFecha({
  desde,
  hasta,
  onCambio,
  desdePorDefecto,
  hastaPorDefecto,
  periodoPorDefecto = 'este-mes',
  atajos = PERIODOS_FECHA,
  hoy,
  ariaLabel = 'Filtro por rango de fechas',
  mostrarCampos = true,
  className,
}) {
  const controlado = desde !== undefined || hasta !== undefined
  const [interno, setInterno] = useState(() => {
    if (desdePorDefecto !== undefined || hastaPorDefecto !== undefined) {
      return { desde: desdePorDefecto || '', hasta: hastaPorDefecto || '' }
    }
    return rangoDePeriodo(periodoPorDefecto, { hoy }) || { desde: '', hasta: '' }
  })
  const idDesde = useId()
  const idHasta = useId()
  const refDesde = useRef(null)

  const actual = controlado ? { desde: desde ?? '', hasta: hasta ?? '' } : interno
  const activo = periodoDeRango(actual.desde, actual.hasta, { hoy })
  const invertido = rangoInvertido(actual.desde, actual.hasta)

  function aplicar(siguienteDesde, siguienteHasta) {
    const par = { desde: siguienteDesde ?? '', hasta: siguienteHasta ?? '' }
    if (!controlado) setInterno(par)
    onCambio?.(par.desde, par.hasta)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={ariaLabel}>
        {atajos.map((periodo) => {
          const esActivo = activo === periodo
          return (
            <button
              key={periodo}
              type="button"
              aria-pressed={esActivo}
              onClick={() => {
                const rango = rangoDePeriodo(periodo, { hoy })
                if (rango) aplicar(rango.desde, rango.hasta)
                else refDesde.current?.focus()
              }}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
                esActivo
                  ? 'border-fono/30 bg-fono/15 text-fono-text'
                  : 'border-ink-600 text-mute hover:border-fono/40 hover:text-fore',
              )}
            >
              {ETIQUETA_PERIODO[periodo] || periodo}
            </button>
          )
        })}
      </div>

      {mostrarCampos && (
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label htmlFor={idDesde}>Desde</Label>
            <Input
              id={idDesde}
              ref={refDesde}
              type="date"
              value={actual.desde}
              max={actual.hasta || undefined}
              onChange={(event) => aplicar(event.target.value, actual.hasta)}
              className="w-40 max-w-full tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor={idHasta}>Hasta</Label>
            <Input
              id={idHasta}
              type="date"
              value={actual.hasta}
              min={actual.desde || undefined}
              onChange={(event) => aplicar(actual.desde, event.target.value)}
              className="w-40 max-w-full tabular-nums"
            />
          </div>
        </div>
      )}

      {invertido && (
        <Aviso tono="warn" compact>
          El rango está invertido: «desde» es posterior a «hasta».
        </Aviso>
      )}
    </div>
  )
}
