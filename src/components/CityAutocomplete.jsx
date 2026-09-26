import { useEffect, useRef, useState } from 'react'
import { Input } from './ui.jsx'
import { buscarCiudad, departamentoDe } from '../catalog/ciudades.js'
import { cn } from '../utils/cn.js'

// Ciudad con autocompletado y departamento automático: el departamento es
// dependiente de la ciudad, así que se resuelve solo (al tipear una coincidencia
// exacta y al elegir una sugerencia). El texto libre sigue permitido.
//
// Por defecto usa el catálogo bilingüe de Paraguay de la librería (sin API),
// que trae `ciudad`/`departamento` y `city`/`department`. Si la app tiene su
// propio buscador pasa `buscar(texto) => Promise<[{city, department}]>` (o las
// claves en español; se aceptan las dos) y el resto se comporta igual.

// Las filas del catálogo (y de un `buscar` propio) pueden venir con las claves
// en inglés o en español; se leen las dos.
function ciudadDe(fila) {
  return fila?.city ?? fila?.ciudad ?? ''
}

function departamentoDeFila(fila) {
  return fila?.department ?? fila?.departamento ?? ''
}

export default function CityAutocomplete({
  value = '',
  onSelect,
  placeholder = 'Ej: Asunción, Ciudad del Este…',
  disabled = false,
  className,
  buscar,
  limite = 8,
  maxLength = 100,
  inputProps,
  mensajeError = 'No se pudieron cargar las sugerencias.',
}) {
  const [sugerencias, setSugerencias] = useState([])
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef(null)
  const raiz = useRef(null)

  useEffect(() => {
    const cerrarFuera = (event) => {
      if (event.target instanceof Node && raiz.current?.contains(event.target)) return
      setAbierto(false)
    }
    document.addEventListener('mousedown', cerrarFuera)
    return () => document.removeEventListener('mousedown', cerrarFuera)
  }, [])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function resolver(texto) {
    const q = String(texto || '').trim()
    if (q.length < 2) { setSugerencias([]); setAbierto(false); setError(''); return }
    if (!buscar) {
      setSugerencias(buscarCiudad(q, limite))
      setAbierto(true)
      setError('')
      return
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const filas = await buscar(q)
        setSugerencias(Array.isArray(filas) ? filas.slice(0, limite) : [])
        setAbierto(true)
        setError('')
      } catch {
        setSugerencias([])
        setAbierto(false)
        setError(mensajeError)
      }
    }, 250)
  }

  function change(texto) {
    // Al escribir se resuelve el departamento si la ciudad coincide exacta;
    // si no, queda vacío hasta que el usuario elija una sugerencia.
    onSelect?.(texto, departamentoDe(texto))
    resolver(texto)
  }

  function elegir(fila) {
    if (timer.current) clearTimeout(timer.current)
    const ciudad = ciudadDe(fila)
    const departamento = departamentoDeFila(fila) || departamentoDe(ciudad)
    onSelect?.(ciudad, departamento)
    setSugerencias([])
    setAbierto(false)
  }

  function alPerderFoco() {
    // Al salir del campo, si tipearon una ciudad del catálogo, el departamento
    // se completa igual (dependiente de la ciudad).
    const departamento = departamentoDe(value)
    if (departamento) onSelect?.(value, departamento)
  }

  return (
    <div ref={raiz} className={cn('relative', className)}>
      <Input
        maxLength={maxLength}
        disabled={disabled}
        value={value}
        onChange={(event) => change(event.target.value)}
        onFocus={() => { if (value.trim().length >= 2 && sugerencias.length) setAbierto(true) }}
        onBlur={alPerderFoco}
        placeholder={placeholder}
        autoComplete="off"
        aria-label="Ciudad"
        role="combobox"
        aria-expanded={abierto && sugerencias.length > 0}
        {...inputProps}
      />
      {abierto && sugerencias.length > 0 && (
        <ul role="listbox" aria-label="Ciudades" className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-ink-500 bg-ink shadow-float">
          {sugerencias.map((fila) => (
            <li key={`${ciudadDe(fila)}-${departamentoDeFila(fila)}`} role="option" aria-selected={false}>
              <button
                type="button"
                className="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-ink-700"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => elegir(fila)}
              >
                <span className="truncate font-medium text-fore">{ciudadDe(fila)}</span>
                <span className="shrink-0 text-xs text-mute">{departamentoDeFila(fila)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error ? <p role="alert" className="mt-1 text-xs text-bad-text">{error}</p> : null}
    </div>
  )
}
