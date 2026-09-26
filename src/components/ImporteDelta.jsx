import { cn } from '../utils/cn.js'
import { formatPercent } from './PercentField.jsx'
import { montoConSigno, signoDe } from '../utils/moneda.js'

// Importe con signo y color: lo que entró (+) en verde y lo que salió (−) en
// rojo, con dígitos tabulares y sin cortes de línea. Es el mismo objeto para
// cobros, gastos, movimientos de tesorería y diferencias de conciliación.
//
// Portable: recibe el número ya calculado; no interpreta el negocio. `invertir`
// existe para las filas donde el signo tiene el significado opuesto (por
// ejemplo, un ajuste a favor); `formato="porcentaje"` dibuja la variación.
// Un valor ausente o no finito se muestra como texto de vacío, nunca como 0.

export function tonoDelta(valor, { invertir = false } = {}) {
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero === 0) return 'mute'
  const positivo = numero > 0
  const bueno = invertir ? !positivo : positivo
  return bueno ? 'ok' : 'bad'
}

const TONO_TEXTO = { ok: 'text-ok-text', bad: 'text-bad-text', mute: 'text-mute' }

export default function ImporteDelta({
  valor,
  moneda = 'PYG',
  formato = 'moneda',
  invertir = false,
  vacio = '—',
  simbolo,
  className,
}) {
  const numero = Number(valor)
  const ausente = valor === null || valor === undefined || valor === '' || !Number.isFinite(numero)
  if (ausente) return <span className={cn('tabular-nums text-mute', className)}>{vacio}</span>

  const texto =
    formato === 'porcentaje'
      ? `${signoDe(numero) ? `${signoDe(numero)} ` : ''}${formatPercent(Math.abs(numero))} %`
      : montoConSigno(numero, moneda, vacio, { simbolo })

  return (
    <span
      className={cn(
        'inline-flex items-center justify-end whitespace-nowrap font-semibold tabular-nums',
        TONO_TEXTO[tonoDelta(numero, { invertir })],
        className,
      )}
    >
      {texto}
    </span>
  )
}
