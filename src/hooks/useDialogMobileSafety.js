import { createContext, createElement, useContext, useEffect } from 'react'

const ContextoSeguridadMovil = createContext(false)

/** Opt-in heredable por Modal/Drawer, también cuando React usa portales. */
export function DialogMobileSafety({ children, enabled = true }) {
  return createElement(ContextoSeguridadMovil.Provider, { value: Boolean(enabled) }, children)
}

/**
 * Repara el paneo automático del cursor sin alterar el zoom elegido por la persona.
 * Un overlay propio debe pasar su ref, su estado de pila y el atributo
 * data-oc-mobile-safety="true" para activar también el CSS compartido.
 */
export function useDialogMobileSafety(open, ref, { enabled, topmost = true } = {}) {
  const heredado = useContext(ContextoSeguridadMovil)
  const activo = enabled ?? heredado
  useEffect(() => {
    if (!open || !activo || !topmost || !ref.current) return undefined
    const panel = ref.current
    const timers = new Set()
    const viewport = window.visualViewport
    const limpiarTimers = () => {
      for (const timer of timers) window.clearTimeout(timer)
      timers.clear()
    }
    const dialogoPropio = (elemento) => elemento instanceof Element && elemento.closest('[role="dialog"]') === panel
    const reponer = (origen) => {
      // Pinch zoom necesita poder panear: no se cambia viewport, escala ni scroll.
      if (Math.abs((viewport?.scale ?? 1) - 1) > 0.01 || !panel.isConnected) return
      if (panel.getAttribute('aria-modal') === 'false') return
      const superior = document.querySelector('[role="dialog"][aria-modal="true"]')
      if (superior && superior !== panel) return
      const bases = [document.documentElement, document.body, panel.parentElement, panel]
      const camino = []
      let nodo = dialogoPropio(origen) ? origen : null
      while (nodo && nodo !== panel) { camino.push(nodo); nodo = nodo.parentElement }
      if (window.scrollX !== 0) window.scrollTo(0, window.scrollY)
      for (const elemento of [...bases, ...camino]) {
        if (!elemento || elemento.scrollLeft === 0) continue
        // Tablas/carruseles con overflow-x propio siguen desplazándose.
        if (camino.includes(elemento) && (elemento.hasAttribute('data-oc-scroll-x') || ['auto', 'scroll'].includes(window.getComputedStyle(elemento).overflowX))) continue
        elemento.scrollLeft = 0
      }
    }
    const alScroll = (evento) => {
      const origen = evento.target
      if (origen instanceof Element && panel.contains(origen) && !dialogoPropio(origen)) return
      if (origen instanceof Element && !panel.contains(origen) && ![document.documentElement, document.body, panel.parentElement].includes(origen)) return
      reponer(origen)
    }
    const alEnfocar = () => {
      const origen = document.activeElement
      if (!dialogoPropio(origen)) return
      limpiarTimers()
      reponer(origen)
      for (const demora of [120, 350]) {
        const timer = window.setTimeout(() => { timers.delete(timer); reponer(document.activeElement) }, demora)
        timers.add(timer)
      }
    }
    document.addEventListener('scroll', alScroll, { capture: true, passive: true })
    document.addEventListener('focusin', alEnfocar)
    viewport?.addEventListener('resize', alEnfocar)
    alEnfocar()
    return () => {
      limpiarTimers()
      document.removeEventListener('scroll', alScroll, { capture: true })
      document.removeEventListener('focusin', alEnfocar)
      viewport?.removeEventListener('resize', alEnfocar)
    }
  }, [open, activo, topmost, ref])
  return Boolean(activo)
}
