import { EmptyState } from './ui.jsx'
import { cn } from '../utils/cn.js'
import { formatoNumero } from '../utils/moneda.js'

// Gráfico de barras sin dependencias (CSS puro) para tableros y resúmenes:
// `datos` = `[{ etiqueta, valor, tono? }]`. Vertical (columnas) u horizontal
// (filas), con el valor a la vista y la etiqueta debajo/al costado.
//
// Portable: recibe los datos ya calculados y un `formatoValor` para dibujarlos
// (por defecto, número es-PY). Los negativos no se inventan como barras: se
// dibujan en 0 y el valor real queda en el `title` y en la lista accesible. Un
// gráfico sin datos dice que no hay datos, no dibuja una barra vacía.

const COLORES = {
  fono: 'bg-fono',
  ok: 'bg-ok',
  bad: 'bg-bad',
  warn: 'bg-warn',
  info: 'bg-info',
  pass: 'bg-pass',
  accion: 'bg-accion',
  mute: 'bg-mute',
}

/** Tope de la escala: el `max` pedido o el valor más alto de la serie (mínimo 1). */
export function maximoDeBarras(datos = [], max) {
  const pedido = Number(max)
  if (Number.isFinite(pedido) && pedido > 0) return pedido
  return datos.reduce((tope, dato) => Math.max(tope, Number(dato?.valor) || 0), 0) || 1
}

/** Porcentaje de la barra (0–100): los negativos se dibujan en 0. */
export function porcentajeBarra(valor, max) {
  const numero = Number(valor)
  const tope = Number(max) > 0 ? Number(max) : 1
  if (!Number.isFinite(numero) || numero <= 0) return 0
  return Math.min(100, (numero / tope) * 100)
}

export default function GraficoBarras({
  datos = [],
  max,
  orientacion = 'vertical',
  altura = 160,
  tono = 'fono',
  formatoValor,
  etiqueta = 'Gráfico de barras',
  mostrarValores = true,
  className,
}) {
  const formatear = formatoValor || ((valor) => formatoNumero(valor))
  if (!datos.length) return <EmptyState compact icon="chart" title="Sin datos para graficar" className={className} />

  const tope = maximoDeBarras(datos, max)
  const colorDe = (dato) => COLORES[dato.tono] || COLORES[tono] || COLORES.fono

  const listaAccesible = (
    <ul className="sr-only">
      {datos.map((dato, indice) => (
        <li key={dato.id ?? indice}>{`${dato.etiqueta}: ${formatear(dato.valor)}`}</li>
      ))}
    </ul>
  )

  if (orientacion === 'horizontal') {
    return (
      <div className={cn('space-y-1.5', className)}>
        {datos.map((dato, indice) => (
          <div key={dato.id ?? indice} className="flex items-center gap-2 text-xs">
            <span className="w-28 shrink-0 truncate text-mute" title={dato.etiqueta}>
              {dato.etiqueta}
            </span>
            <span
              className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-fore/10"
              role="img"
              aria-label={`${dato.etiqueta}: ${formatear(dato.valor)}`}
              title={`${dato.etiqueta}: ${formatear(dato.valor)}`}
            >
              <span className={cn('block h-full rounded-full transition-[width] duration-500', colorDe(dato))} style={{ width: `${porcentajeBarra(dato.valor, tope)}%` }} />
            </span>
            {mostrarValores && <span className="w-24 shrink-0 text-right font-semibold tabular-nums text-fore">{formatear(dato.valor)}</span>}
          </div>
        ))}
        {listaAccesible}
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-end gap-2" style={{ height: altura }} role="img" aria-label={etiqueta}>
        {datos.map((dato, indice) => (
          <div key={dato.id ?? indice} className="relative h-full min-w-0 flex-1">
            <span
              className={cn('absolute inset-x-0 bottom-0 rounded-t-md transition-[height] duration-500', colorDe(dato))}
              style={{ height: `${porcentajeBarra(dato.valor, tope)}%` }}
              title={`${dato.etiqueta}: ${formatear(dato.valor)}`}
            >
              {mostrarValores && (
                <span className="absolute inset-x-0 -top-4 truncate text-center text-[10px] font-semibold tabular-nums text-mute">
                  {formatear(dato.valor)}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {datos.map((dato, indice) => (
          <span key={dato.id ?? indice} className="min-w-0 flex-1 truncate text-center text-[10px] text-mute" title={dato.etiqueta}>
            {dato.etiqueta}
          </span>
        ))}
      </div>
      {listaAccesible}
    </div>
  )
}
