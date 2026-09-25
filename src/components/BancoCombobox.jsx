import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { BANCOS_PARAGUAY, normalizarBanco, sugerenciasDeBanco } from '../utils/bancos.js'
import { Input } from './ui.jsx'
import BancoLogo from './BancoLogo.jsx'
import { cn } from '../utils/cn.js'

// Campo de banco con sugerencias ilustradas: al abrir muestra el catálogo
// completo (lista scrollable) y mientras se escribe filtra al instante.
// Mantiene el contrato del campo de texto: entrega el string por onChange.
// El catálogo por defecto es el de Paraguay (`BANCOS_PARAGUAY`).
export default function BancoCombobox({
  id,
  value = '',
  onChange,
  required = false,
  disabled = false,
  placeholder,
  className,
  catalogo = BANCOS_PARAGUAY,
  logoProps,
}) {
  const [abierto, setAbierto] = useState(false)
  const [resaltado, setResaltado] = useState(0)
  const listaId = useId()
  const raiz = useRef(null)
  const lista = useRef(null)

  useEffect(() => {
    const cerrarFuera = (event) => {
      if (event.target instanceof Node && raiz.current?.contains(event.target)) return
      setAbierto(false)
    }
    document.addEventListener('click', cerrarFuera)
    return () => document.removeEventListener('click', cerrarFuera)
  }, [])

  const sugerencias = useMemo(() => sugerenciasDeBanco(value, catalogo), [value, catalogo])

  // La opción resaltada con el teclado queda a la vista en la lista larga.
  useEffect(() => {
    if (!abierto) return
    lista.current?.querySelector(`#${CSS.escape(`${listaId}-${resaltado}`)}`)?.scrollIntoView({ block: 'nearest' })
  }, [abierto, resaltado, listaId])

  function elegir(banco) {
    onChange?.(banco)
    setAbierto(false)
    setResaltado(0)
  }

  function alTeclear(event) {
    if (event.key === 'Escape') { setAbierto(false); return }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!abierto) { setAbierto(true); return }
      if (!sugerencias.length) return
      const paso = event.key === 'ArrowDown' ? 1 : -1
      setResaltado((actual) => (actual + paso + sugerencias.length) % sugerencias.length)
      return
    }
    if (event.key === 'Enter' && abierto && sugerencias[resaltado]) {
      event.preventDefault()
      elegir(sugerencias[resaltado])
    }
  }

  const listaVisible = abierto && sugerencias.length > 0

  return (
    <div ref={raiz} className={cn('relative', className)}>
      <Input
        id={id}
        role="combobox"
        aria-expanded={listaVisible}
        aria-controls={listaId}
        aria-autocomplete="list"
        aria-activedescendant={listaVisible ? `${listaId}-${resaltado}` : undefined}
        autoComplete="off"
        required={required}
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onChange={(event) => { onChange?.(event.target.value); setAbierto(true); setResaltado(0) }}
        onFocus={() => setAbierto(true)}
        onKeyDown={alTeclear}
      />
      {listaVisible && (
        <ul
          id={listaId}
          ref={lista}
          role="listbox"
          aria-label="Bancos"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-ink-500 bg-ink p-1 shadow-float"
        >
          {sugerencias.map((banco, indice) => (
            <li key={banco} id={`${listaId}-${indice}`} role="option" aria-selected={indice === resaltado}>
              <button
                type="button"
                className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition', indice === resaltado ? 'bg-ink-700 text-fore' : 'text-mute hover:bg-ink-700 hover:text-fore')}
                onMouseEnter={() => setResaltado(indice)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => elegir(banco)}
              >
                <BancoLogo banco={banco} alto="h-4" {...logoProps} />
                <span className="min-w-0 flex-1 truncate">{banco}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { normalizarBanco }
