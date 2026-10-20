import { useEffect, useLayoutEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { dialogFocusableElements, registrarDialogPortal, SELECTOR_ENFOCABLES } from '../utils/dialogFocusScope.js'
import { menuAnchorVisible, menuPortalPosition } from '../utils/menuPortal.js'
import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'

// Menú desplegable portable (usuario, acciones de fila, filtros):
//   items: [{ id?, label, icono?, onClick?, peligro?, disabled?, separador? }]
// Cierra con clic afuera y con Esc; `trigger` es el botón visible.

const useClientLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect

export default function MenuDesplegable({ trigger, items = [], alineacion = 'right', ariaLabel = 'Menú', disabled = false, className, portal = false }) {
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(0)
  const menuId = useId()
  const [posicion, setPosicion] = useState(null)
  const [tema, setTema] = useState({ clases: '', estilo: {}, dir: 'ltr' })
  const raiz = useRef(null)
  const disparador = useRef(null)
  const menu = useRef(null)
  const acciones = items.filter((item) => !item.separador && !item.disabled)

  function enfocar(indice) {
    const elementos = menu.current?.querySelectorAll('[role="menuitem"]:not(:disabled)') || []
    if (!elementos.length) return
    const siguiente = (indice + elementos.length) % elementos.length
    setActivo(siguiente)
    elementos[siguiente]?.focus()
  }

  function cerrar({ devolverFoco = false } = {}) {
    setAbierto(false)
    if (devolverFoco) {
      const previo = menu.current
      disparador.current?.focus({ preventScroll: true })
      requestAnimationFrame(() => {
        const actual = document.activeElement
        // Una acción puede abrir otro diálogo o dar foco explícitamente. No
        // se lo quitamos para devolverlo al disparador del menú anterior.
        if (!actual || actual === document.body || actual === document.documentElement || actual === disparador.current || previo?.contains(actual)) disparador.current?.focus({ preventScroll: true })
      })
    }
  }

  function abrir(indice = 0) {
    if (disabled || !acciones.length) return
    setAbierto(true)
    requestAnimationFrame(() => enfocar(indice))
  }

  useEffect(() => {
    if (!abierto) return undefined
    const cerrarFuera = (event) => {
      if (event.target instanceof Node && (raiz.current?.contains(event.target) || menu.current?.contains(event.target))) return
      cerrar()
    }
    document.addEventListener('click', cerrarFuera)
    if (portal) document.addEventListener('focusin', cerrarFuera)
    return () => {
      document.removeEventListener('click', cerrarFuera)
      if (portal) document.removeEventListener('focusin', cerrarFuera)
    }
  }, [abierto, portal])

  useClientLayout(() => {
    if (!abierto || !portal || !menu.current || !disparador.current) return undefined
    const ancla = disparador.current, panel = menu.current
    const liberar = registrarDialogPortal(ancla, panel)
    let frame
    const actualizar = () => {
      if (!ancla.isConnected) { cerrar(); return }
      const visual = window.visualViewport
      const viewport = { left: visual?.offsetLeft || 0, top: visual?.offsetTop || 0,
        right: (visual?.offsetLeft || 0) + (visual?.width || document.documentElement.clientWidth || innerWidth),
        bottom: (visual?.offsetTop || 0) + (visual?.height || document.documentElement.clientHeight || innerHeight) }
      const rect = ancla.getBoundingClientRect()
      if (!menuAnchorVisible(ancla, rect, viewport)) { cerrar(); return }
      const caja = panel.getBoundingClientRect(), css = getComputedStyle(panel)
      const alto = Math.max(caja.height, panel.scrollHeight + (parseFloat(css.borderTopWidth) || 0) + (parseFloat(css.borderBottomWidth) || 0))
      const siguiente = menuPortalPosition(rect, { width: caja.width, height: alto }, viewport, alineacion)
      if (!siguiente) { cerrar(); return }
      setPosicion(previo => JSON.stringify(previo) === JSON.stringify(siguiente) ? previo : siguiente)
      const estilo = getComputedStyle(ancla), variables = {}
      for (let i = 0; i < estilo.length; i++) {
        const nombre = estilo.item(i)
        if (nombre.startsWith('--') && !nombre.startsWith('--tw-')) variables[nombre] = estilo.getPropertyValue(nombre)
      }
      variables.fontFamily = estilo.fontFamily
      const clases = ['dark', 'tema-v2', 'v2-piloto'].filter(clase => ancla.closest('.' + clase)).join(' ')
      const siguienteTema = { clases, estilo: variables, dir: estilo.direction || 'ltr' }
      setTema(previo => JSON.stringify(previo) === JSON.stringify(siguienteTema) ? previo : siguienteTema)
    }
    const programar = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(actualizar) }
    actualizar()
    window.addEventListener('scroll', programar, true)
    window.addEventListener('resize', programar)
    window.visualViewport?.addEventListener('scroll', programar)
    window.visualViewport?.addEventListener('resize', programar)
    const observador = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(programar)
    observador?.observe(ancla)
    observador?.observe(panel)
    const temaObserver = typeof MutationObserver === 'undefined' ? null : new MutationObserver(programar)
    for (let nodo = ancla; nodo; nodo = nodo.parentElement) temaObserver?.observe(nodo, { attributes: true, attributeFilter: ['class', 'style', 'dir'] })
    return () => {
      liberar()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', programar, true)
      window.removeEventListener('resize', programar)
      window.visualViewport?.removeEventListener('scroll', programar)
      window.visualViewport?.removeEventListener('resize', programar)
      observador?.disconnect()
      temaObserver?.disconnect()
    }
  }, [abierto, portal, alineacion])

  useEffect(() => { if (disabled || !acciones.length) cerrar() }, [disabled, acciones.length])

  function manejarMenu(event) {
    if (event.key === 'Tab' && portal) {
      const ancla = disparador.current
      const dialogo = ancla?.closest('[role="dialog"], [role="alertdialog"]')
      const selectorTab = `${SELECTOR_ENFOCABLES}, summary, [contenteditable], [tabindex]`
      const nodos = dialogFocusableElements(dialogo || document.body, selectorTab)
        .filter(nodo => !menu.current?.contains(nodo) && !nodo.matches(':disabled') && (nodo.tabIndex >= 0 || (!nodo.hasAttribute('tabindex') && (nodo.tagName === 'SUMMARY' || (nodo.hasAttribute('contenteditable') && nodo.getAttribute('contenteditable') !== 'false')))))
        .sort((a, b) => (a.tabIndex > 0 ? a.tabIndex : Infinity) - (b.tabIndex > 0 ? b.tabIndex : Infinity))
      const indice = nodos.indexOf(ancla)
      const siguiente = indice + (event.shiftKey ? -1 : 1)
      const destino = dialogo ? nodos[(siguiente + nodos.length) % nodos.length] : nodos[siguiente]
      cerrar()
      if (destino) { event.preventDefault(); destino.focus() }
      else ancla?.focus()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cerrar({ devolverFoco: true })
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      enfocar(activo + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      enfocar(activo - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      enfocar(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      enfocar(-1)
    }
  }

  const contenido = abierto && (

        <div
          ref={menu}
          id={menuId}
          data-oc-menu-portal={portal ? "" : undefined}
          dir={portal ? tema.dir : undefined}
          style={portal ? { ...tema.estilo, position: "fixed", width: "max-content", minWidth: 192, maxWidth: "calc(100vw - 16px)", maxHeight: "calc(100dvh - 16px)", overflowY: "auto", overflowX: "hidden", zIndex: 2147483000, margin: 0, visibility: posicion ? "visible" : "hidden", ...posicion } : undefined}
          role="menu"
          aria-label={ariaLabel}
          onKeyDown={manejarMenu}
          className={cn('min-w-48 rounded-xl border border-ink-500 bg-ink p-1 shadow-float', portal ? tema.clases : ['absolute z-30 mt-1', alineacion === 'right' ? 'right-0' : 'left-0'])}
        >
          {items.map((item, indice) => {
            if (item.separador) return <div key={`sep-${indice}`} role="separator" className="my-1 h-px bg-ink-600" />
            const indiceActivo = items.slice(0, indice).filter((candidato) => !candidato.separador && !candidato.disabled).length
            return (
              <button
                key={item.id ?? item.label ?? indice}
                type="button"
                role="menuitem"
                tabIndex={!item.disabled && indiceActivo === activo ? 0 : -1}
                disabled={item.disabled}
                onFocus={() => { if (!item.disabled) setActivo(indiceActivo) }}
                onClick={() => { cerrar({ devolverFoco: true }); item.onClick?.() }}
                className={cn(
                  'flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition',
                  item.peligro ? 'text-bad-text hover:bg-bad/10' : 'text-fore hover:bg-ink-700',
                  item.disabled && 'cursor-not-allowed opacity-40',
                )}
              >
                {item.icono && <Icon name={item.icono} className="h-4 w-4 shrink-0" />}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.extra}
              </button>
            )
          })}
        </div>
  )

  return (
    <div ref={raiz} className={cn('relative', className)}>
      <button
        ref={disparador}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-label={portal ? ariaLabel : undefined}
        aria-controls={abierto ? menuId : undefined}
        aria-expanded={abierto}
        onClick={() => { if (abierto) cerrar(); else abrir(0) }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            abrir(event.key === 'ArrowDown' ? 0 : -1)
          }
        }}
        className="toque-44 inline-flex min-h-11 items-center gap-2 rounded-lg transition"
      >
        {trigger}
      </button>
      {portal && typeof document !== 'undefined' ? createPortal(contenido, document.body) : contenido}
    </div>
  )
}
