import { useEffect, useRef } from 'react'

// Trampa de foco de diálogos (Modal, Drawer y cualquier overlay propio):
// bloquea el scroll del documento, enfoca al abrir, cicla Tab, cierra con Esc
// y devuelve el foco al elemento anterior. Un solo lugar para el
// comportamiento que antes estaba copiado en cada objeto.

export const SELECTOR_ENFOCABLES =
  'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'

// Decisión del ciclo de Tab, aislada del DOM para poder probarla: devuelve a
// qué extremo saltar (o null si el navegador se encarga).
export function destinoDeTab({ shiftKey, activo, primero, ultimo, contenedor, fuera = false }) {
  if (!primero) return null
  const enPrimero = activo === primero || activo === contenedor
  const enUltimo = activo === ultimo
  if (shiftKey && (enPrimero || fuera)) return ultimo
  if (!shiftKey && (enUltimo || fuera)) return primero
  return null
}

// `initialFocus` (opcional) devuelve el elemento que recibe el foco al abrir;
// por defecto lo toma el contenedor. `bloquearScroll` permite que un overlay
// embebido no toque el scroll del documento.
export default function useDialogFocusTrap(open, onClose, ref, { initialFocus, bloquearScroll = true } = {}) {
  const cerrar = useRef(onClose)
  const opciones = useRef({ initialFocus, bloquearScroll })
  useEffect(() => {
    cerrar.current = onClose
  }, [onClose])
  useEffect(() => {
    opciones.current = { initialFocus, bloquearScroll }
  }, [initialFocus, bloquearScroll])

  useEffect(() => {
    if (!open) return undefined
    const contenedor = ref.current
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    const bloquear = opciones.current.bloquearScroll
    if (bloquear) document.body.style.overflow = 'hidden'
    const inicial = opciones.current.initialFocus?.() ?? contenedor
    inicial?.focus?.()

    const alTeclear = (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        cerrar.current?.()
        return
      }
      if (evento.key !== 'Tab' || !contenedor) return
      const nodos = [...contenedor.querySelectorAll(SELECTOR_ENFOCABLES)].filter((el) => el.getClientRects().length)
      if (!nodos.length) {
        evento.preventDefault()
        contenedor.focus?.()
        return
      }
      const destino = destinoDeTab({
        shiftKey: evento.shiftKey,
        activo: document.activeElement,
        primero: nodos[0],
        ultimo: nodos[nodos.length - 1],
        contenedor,
        fuera: !contenedor.contains(document.activeElement),
      })
      if (destino) {
        evento.preventDefault()
        destino.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      if (bloquear) document.body.style.overflow = overflow
      if (anterior?.isConnected) anterior.focus()
    }
  }, [open, ref])
}
