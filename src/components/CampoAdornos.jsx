import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../utils/cn.js'

// Sistema único de adornos de los campos: `inicio` (ícono, unidad, prefijo como
// «Gs» o «https://») a la izquierda y `fin` (botón, unidad, sufijo) a la
// derecha, más el spinner de `cargando` y el check de `estado="ok"`. Los slots
// son absolutos sobre el control; el relleno del <input> se mide con el ancho
// real del slot (ResizeObserver), así «https://» o un botón ocupado reservan su
// espacio sin saltos. Antes de medir (SSR/primer pintado) rige un relleno por
// defecto según el tipo de contenido.
const useEfectoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function Spinner({ className }) {
  return <span aria-hidden="true" data-oc-spinner="" className={cn('inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent', className)} />
}

export function CheckOk({ className }) {
  return (
    <span aria-hidden="true" data-oc-ok="" className={cn('oc-campo-ok inline-flex text-ok-text', className)}>
      {/* SVG propio, sin `Icon`: así Input no arrastra el set de íconos a los bundles pequeños (dist/phone.js). */}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  )
}

const presente = (nodo) => nodo !== undefined && nodo !== null && nodo !== false && nodo !== ''

export function usaAdornos({ inicio, fin, cargando, ok }) {
  return presente(inicio) || presente(fin) || Boolean(cargando) || Boolean(ok)
}

/**
 * Envoltorio con slots; `children` es el control. Devuelve el relleno medido
 * para que el control lo aplique con `style`.
 */
export function useReservaAdornos(dependencias) {
  const refInicio = useRef(null)
  const refFin = useRef(null)
  const [medido, setMedido] = useState({ izquierda: 0, derecha: 0 })
  useEfectoLayout(() => {
    const medir = () => {
      const izquierda = refInicio.current?.offsetWidth ?? 0
      const derecha = refFin.current?.offsetWidth ?? 0
      setMedido((actual) => (actual.izquierda === izquierda && actual.derecha === derecha ? actual : { izquierda, derecha }))
    }
    medir()
    const nodos = [refInicio.current, refFin.current].filter(Boolean)
    // Sin adornos no hay nada que observar: no se crea el ResizeObserver.
    if (nodos.length === 0 || typeof ResizeObserver === 'undefined') return undefined
    const observador = new ResizeObserver(medir)
    for (const nodo of nodos) observador.observe(nodo)
    return () => observador.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias)
  return { refInicio, refFin, medido }
}

export function SlotInicio({ refSlot, children }) {
  return (
    <span ref={refSlot} data-oc-inicio="" className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1.5 pl-3.5 pr-2 text-sm font-medium text-mute peer-disabled:opacity-50 [&>svg]:h-4 [&>svg]:w-4">
      {children}
    </span>
  )
}

export function SlotFin({ refSlot, cargando, ok, children }) {
  return (
    <span ref={refSlot} data-oc-fin="" className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 pr-1.5 text-mute peer-disabled:opacity-50">
      {cargando ? <span className="grid h-7 w-7 place-items-center"><Spinner className="text-mute" /></span> : null}
      {ok && !cargando ? <span className="grid h-7 w-7 place-items-center"><CheckOk /></span> : null}
      {presente(children) ? <span className="pointer-events-auto flex items-center self-stretch text-sm font-medium [&>svg]:h-4 [&>svg]:w-4">{children}</span> : null}
    </span>
  )
}

/** Relleno por defecto (antes de medir) y estilo medido del control. */
export function rellenoAdornos({ inicio, fin, cargando, ok }, medido) {
  const clases = []
  const estilo = {}
  if (presente(inicio)) {
    clases.push(typeof inicio === 'string' ? 'pl-12' : 'pl-10')
    if (medido.izquierda > 0) estilo.paddingLeft = medido.izquierda
  }
  if (presente(fin) || cargando || ok) {
    // 3.25rem = botón de 44 px (w-11) + el pr-1.5 del slot.
    clases.push(presente(fin) ? 'pr-[3.25rem]' : 'pr-10')
    if (medido.derecha > 0) estilo.paddingRight = medido.derecha
  }
  return { clases: clases.join(' '), estilo }
}
