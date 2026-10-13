import { useEffect, useId, useRef } from 'react'
import { cn } from '../utils/cn.js'

// Checkbox de formulario (selección múltiple): por dentro es un
// `<input type="checkbox">` real — conserva teclado, lectores de pantalla y el
// acento de cada tema. Para booleanos de encendido/apagado va `Switch`.
//
//   variante="simple"   → control + label en línea (permisos, listas)
//   indeterminate       → estado mixto (selección parcial de un grupo): raya en
//                         vez del check y `aria-checked="mixed"`
//   motion={false}      → sin trazo animado ni escala al presionar
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
  indeterminate = false,
  motion = true,
  disabled = false,
  id,
  ariaLabel,
  className,
  ...props
}) {
  const generado = useId()
  const campoId = id || generado
  const nodo = useRef(null)
  // `indeterminate` solo existe como propiedad del DOM.
  useEffect(() => { if (nodo.current) nodo.current.indeterminate = Boolean(indeterminate) }, [indeterminate, checked])
  const malo = tono === 'bad'
  const control = (
    <span data-motion={motion ? 'on' : 'off'} data-oc-checkbox="" className="relative inline-grid h-[18px] w-[18px] shrink-0 place-items-center has-[:disabled]:opacity-50">
      <input
        ref={nodo}
        id={campoId}
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={onChange}
        aria-label={label ? undefined : ariaLabel}
        aria-checked={indeterminate ? 'mixed' : undefined}
        data-oc-indeterminado={indeterminate ? '' : undefined}
        className={cn(
          'peer h-full w-full cursor-pointer appearance-none rounded-[5px] border border-interactivo bg-ink-800 outline-none',
          'transition-[background-color,border-color,box-shadow,transform] [transition-duration:var(--oc-motion-fast,160ms)] [transition-timing-function:var(--oc-motion-ease,cubic-bezier(.2,.8,.2,1))]',
          'hover:border-mute focus-visible:ring-[3px] focus-visible:ring-fono-dark/25 active:scale-90',
          malo
            ? 'checked:border-bad checked:bg-bad data-[oc-indeterminado]:border-bad data-[oc-indeterminado]:bg-bad'
            : 'checked:border-fono-dark checked:bg-fono data-[oc-indeterminado]:border-fono-dark data-[oc-indeterminado]:bg-fono',
          'disabled:cursor-not-allowed disabled:active:scale-100',
        )}
        {...props}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'pointer-events-none absolute inset-0 h-full w-full scale-75 p-[2px] opacity-0 transition-[opacity,transform] [transition-duration:var(--oc-motion-fast,160ms)]',
          malo ? 'text-on-bad' : 'text-onbrand',
          'peer-checked:scale-100 peer-checked:opacity-100 peer-data-[oc-indeterminado]:scale-100 peer-data-[oc-indeterminado]:opacity-100',
        )}
      >
        {indeterminate
          ? <path d="M6 12h12" />
          : <path d="M5 12.5l4.5 4.5L19 7.5" className="oc-check-trazo" />}
      </svg>
    </span>
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
