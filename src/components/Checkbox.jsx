import { useId } from 'react'
import { cn } from '../utils/cn.js'

// Checkbox de formulario (selección múltiple): por dentro es un
// `<input type="checkbox">` real — conserva teclado, lectores de pantalla y el
// acento de cada tema. Para booleanos de encendido/apagado va `Switch`.
//
//   variante="simple"   → control + label en línea (permisos, listas)
//   variante="tarjeta"  → fila con borde y padding, título + descripción
//                         (preferencias, ajustes con detalle)
//
// Sin `label` queda el control pelado con `ariaLabel` (filas de tabla y colas).
export default function Checkbox({
  checked,
  onChange,
  label,
  descripcion,
  variante = 'simple',
  tono = 'fono',
  disabled = false,
  id,
  ariaLabel,
  className,
  ...props
}) {
  const generado = useId()
  const campoId = id || generado
  const control = (
    <input
      id={campoId}
      type="checkbox"
      checked={Boolean(checked)}
      disabled={disabled}
      onChange={onChange}
      aria-label={label ? undefined : ariaLabel}
      className={cn(
        'h-4 w-4 shrink-0 rounded border-ink-500 accent-fono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fono/40 disabled:cursor-not-allowed disabled:opacity-50',
        tono === 'bad' && 'accent-bad',
      )}
      {...props}
    />
  )

  if (!label) return <span className={cn('inline-flex items-center', className)}>{control}</span>

  if (variante === 'tarjeta') {
    return (
      <label
        htmlFor={campoId}
        className={cn(
          'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-ink-600 p-3 transition has-[:focus-visible]:border-fono',
          disabled && 'cursor-not-allowed opacity-60',
          className,
        )}
      >
        <span className="mt-0.5 flex shrink-0">{control}</span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{label}</span>
          {descripcion && <span className="mt-0.5 block text-xs text-mute">{descripcion}</span>}
        </span>
      </label>
    )
  }

  return (
    <label
      htmlFor={campoId}
      className={cn(
        'flex min-h-11 cursor-pointer items-center gap-2 text-sm',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      {control}
      <span className="min-w-0">{label}</span>
    </label>
  )
}
