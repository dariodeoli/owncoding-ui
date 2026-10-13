import { cn } from '../utils/cn.js'
import { useFormulariosPro } from './FormulariosPro.jsx'

// Interruptor estilo iPhone para booleanos de formulario ("activo", "aplica
// descuento", "se acredita en días"). Por dentro es un checkbox real: conserva
// teclado, lectores de pantalla y la asociación con <label>; para listas de
// selección múltiple va el checkbox de siempre.
//
// Movimiento (solo con `FormulariosPro`; sin él el interruptor se mueve como en la
// primera ola, con transición lineal de color y pulgar): el pulgar se desliza con una curva con rebote leve, la pista
// cambia de color y, presionado, el pulgar se ensancha. Todo es CSS con los
// tokens `--oc-motion-*`; `motion={false}` o `prefers-reduced-motion` lo apagan.
// El área táctil del input mide 44 px de alto (crece solo en vertical, 12 px por
// lado, sin z-index): no pisa a los controles vecinos de la fila.
const RESORTE = '[transition-timing-function:cubic-bezier(.34,1.56,.64,1)]'

export default function Switch({ checked, onChange, disabled = false, id, ariaLabel, className, motion = true, ...props }) {
  const pro = useFormulariosPro()
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
        className="peer absolute inset-x-0 top-1/2 h-11 w-full -translate-y-1/2 cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full border',
          pro
            ? 'transition-[background-color,border-color,box-shadow] [transition-duration:var(--oc-motion-feedback,240ms)] [transition-timing-function:var(--oc-motion-ease,cubic-bezier(.2,.8,.2,1))] peer-focus-visible:ring-[3px] peer-focus-visible:ring-fono-dark/25 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper'
            : 'transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-fono/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper',
          // Contraste (WCAG 1.4.11): pista y borde ≥3:1 contra el fondo (`interactivo`
          // apagado, `fono-dark` encendido) y pulgar `ink` ≥3:1 contra la pista.
          checked ? 'border-fono-dark bg-fono-dark' : 'border-interactivo bg-interactivo',
          disabled && 'opacity-50',
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-ink shadow',
          pro ? ['transition-[transform,width] [transition-duration:var(--oc-motion-feedback,240ms)]', RESORTE] : 'transition-transform',
          checked && (pro ? 'translate-x-4 peer-active:w-5 peer-active:translate-x-3' : 'translate-x-4'),
          pro && !checked && 'peer-active:w-5',
          disabled && 'opacity-50',
        )}
      />
    </span>
  )
}
