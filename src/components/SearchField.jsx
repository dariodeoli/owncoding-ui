import { forwardRef } from 'react'
import { Input } from './ui.jsx'
import Icon from './Icon.jsx'
import { useFormulariosPro } from './FormulariosPro.jsx'

// Búsqueda instantánea con el formato único de la app: lupa a la izquierda
// (`inicio` de Input), botón para limpiar cuando hay texto (`fin`) y el contrato
// de siempre (value/onChange, placeholder, aria-label, ref). El campo no
// retrasa lo que se escribe: si una pantalla consulta a la API, el debounce
// vive en la pantalla. Limpiar llama a onClear si existe; si no, emite el cambio
// con valor vacío.
//
// Opt-in: `limpiable` (el × se muestra salvo `limpiable={false}`; con `limpiable`
// o con `FormulariosPro`, Esc limpia), `cargando` (spinner +
// aria-busy mientras la pantalla consulta). Cuando Esc limpia (y no sube al
// diálogo que lo contiene) es porque hay texto; sin texto, Esc sigue su camino. El × aparece con
// fundido (base.css; sin movimiento con reduced-motion o `motion={false}`).
const SearchField = forwardRef(function SearchField({ value = '', onChange, onClear, placeholder, ariaLabel, className, disabled = false, limpiable, cargando = false, motion = true, onKeyDown, ...props }, ref) {
  const pro = useFormulariosPro()
  // `limpiable` explícito gana; sin él, el × se muestra siempre y Esc limpia solo con `FormulariosPro`.
  const mostrarX = limpiable !== false
  const escLimpia = limpiable === true || (limpiable === undefined && pro)
  function limpiar() {
    if (onClear) onClear()
    else onChange?.({ target: { value: '' } })
  }
  return (
    <Input
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={ariaLabel || placeholder}
      disabled={disabled}
      cargando={cargando}
      motion={motion}
      className={['min-w-0', className].filter(Boolean).join(' ')}
      inicio={<Icon name="search" className="h-4 w-4" aria-hidden="true" />}
      fin={mostrarX && value ? (
        <button
          type="button"
          onClick={limpiar}
          disabled={disabled}
          data-motion={motion ? 'on' : 'off'}
          className="oc-campo-aparece my-auto grid h-7 w-7 place-items-center rounded-md text-mute transition-colors hover:bg-ink-700 hover:text-fore disabled:opacity-40"
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
        >
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      ) : undefined}
      onKeyDown={(evento) => {
        onKeyDown?.(evento)
        if (evento.defaultPrevented || evento.key !== 'Escape' || !escLimpia || !value || disabled) return
        evento.preventDefault()
        evento.stopPropagation()
        limpiar()
      }}
      {...props}
    />
  )
})

export default SearchField
