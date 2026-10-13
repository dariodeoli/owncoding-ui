import { cn } from '../utils/cn.js'

// Interruptor estilo iPhone para booleanos de formulario ("activo", "aplica
// descuento", "se acredita en días"). Por dentro es un checkbox real: conserva
// teclado, lectores de pantalla y la asociación con <label>; para listas de
// selección múltiple va el checkbox de siempre.
//
// Movimiento: el pulgar se desliza con una curva con rebote leve, la pista
// cambia de color y, presionado, el pulgar se ensancha. Todo es CSS con los
// tokens `--oc-motion-*`; `motion={false}` o `prefers-reduced-motion` lo apagan.
// El área táctil del input crece a 44 px de alto sin mover el dibujo.
const RESORTE = '[transition-timing-function:cubic-bezier(.34,1.56,.64,1)]'

export default function Switch({ checked, onChange, disabled = false, id, ariaLabel, className, motion = true, ...props }) {
  return (
    <span data-motion={motion ? 'on' : 'off'} data-oc-switch="" className={cn('relative inline-flex h-5 w-9 shrink-0 items-center', className)}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={Boolean(checked)}
        aria-label={ariaLabel}
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={onChange}
        className="peer absolute left-1/2 top-1/2 z-10 h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full border transition-[background-color,border-color,box-shadow] [transition-duration:var(--oc-motion-feedback,240ms)] [transition-timing-function:var(--oc-motion-ease,cubic-bezier(.2,.8,.2,1))]',
          'peer-focus-visible:ring-[3px] peer-focus-visible:ring-fono-dark/25 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper',
          checked ? 'border-fono bg-fono' : 'border-ink-500 bg-ink-600',
          disabled && 'opacity-50',
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-[transform,width] [transition-duration:var(--oc-motion-feedback,240ms)]',
          RESORTE,
          checked ? 'translate-x-4 peer-active:w-5 peer-active:translate-x-3' : 'peer-active:w-5',
          disabled && 'opacity-50',
        )}
      />
    </span>
  )
}
