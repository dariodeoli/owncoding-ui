import { useCallback, useEffect, useRef, useState } from 'react'
import { crearPilaCapas } from '../utils/pilaOverlays.js'

// Trampa de foco de diálogos (Modal, Drawer y cualquier overlay propio):
// bloquea el scroll del documento, enfoca al abrir, cicla Tab, cierra con Esc
// y devuelve el foco al elemento anterior. Un solo lugar para el
// comportamiento que antes estaba copiado en cada objeto.
//
// Además sostiene la PILA DE CAPAS (#2): la capa superior es la única que
// responde a Esc/Tab/foco y la única que debería llevar `aria-modal`; al
// cerrarse, el foco vuelve a lo que la abrió (o a la capa que queda debajo).
// `busy` bloquea el cierre interactivo (Esc) mientras el overlay guarda.

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

// Estado del módulo: una sola pila para todos los overlays montados y un
// contador de bloqueos de scroll, así el primero guarda el overflow original y
// el último lo restaura.
const pila = crearPilaCapas()
const paneles = new Map()
const oyentes = new Set()
let bloqueosScroll = 0
let overflowOriginal = ''

function avisar() {
  for (const oyente of oyentes) oyente()
}

// `initialFocus` (opcional) devuelve el elemento que recibe el foco al abrir;
// por defecto lo toma el contenedor. `bloquearScroll` permite que un overlay
// embebido no toque el scroll del documento. `busy` bloquea el cierre por Esc.
export default function useDialogFocusTrap(open, onClose, ref, { initialFocus, bloquearScroll = true, busy = false } = {}) {
  const id = useRef(Symbol('capa')).current
  const [esSuperior, setEsSuperior] = useState(true)
  const cerrar = useRef(onClose)
  const opciones = useRef({ initialFocus, bloquearScroll, busy })
  useEffect(() => {
    cerrar.current = onClose
  }, [onClose])
  useEffect(() => {
    opciones.current = { initialFocus, bloquearScroll, busy }
  }, [initialFocus, bloquearScroll, busy])

  const requestClose = useCallback(() => {
    if (pila.esSuperior(id) && !opciones.current.busy) cerrar.current?.()
  }, [id])

  useEffect(() => {
    if (!open) return undefined
    const contenedor = ref.current
    const bloquear = opciones.current.bloquearScroll
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
    paneles.set(id, ref)
    // React monta primero los hijos: una capa que contiene a otra ya abierta se
    // inserta por debajo (el hijo queda arriba).
    const indice = pila.ids().findIndex((otra) => {
      const panelOtra = paneles.get(otra)?.current
      return contenedor && panelOtra && contenedor.contains(panelOtra)
    })
    if (indice >= 0) pila.insertar(id, indice)
    else pila.agregar(id)
    if (bloquear) {
      bloqueosScroll += 1
      if (bloqueosScroll === 1) overflowOriginal = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    const actualizar = () => setEsSuperior(pila.esSuperior(id))
    oyentes.add(actualizar)
    actualizar()
    const inicial = opciones.current.initialFocus?.() ?? contenedor
    if (pila.esSuperior(id)) inicial?.focus?.()

    const alTeclear = (evento) => {
      if (!pila.esSuperior(id)) return
      if (evento.key === 'Escape') {
        // Un select nativo abierto se queda con Esc; el estado no es visible.
        if (evento.isComposing || evento.repeat || evento.target?.tagName === 'SELECT') return
        evento.preventDefault()
        if (!opciones.current.busy) cerrar.current?.()
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
    const alEnfocar = (evento) => {
      if (!pila.esSuperior(id) || !contenedor) return
      if (evento.target instanceof Node && contenedor.contains(evento.target)) return
      const primero = opciones.current.initialFocus?.() ?? contenedor
      primero?.focus?.()
    }
    document.addEventListener('keydown', alTeclear)
    document.addEventListener('focusin', alEnfocar)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.removeEventListener('focusin', alEnfocar)
      oyentes.delete(actualizar)
      const eraSuperior = pila.esSuperior(id)
      pila.quitar(id)
      paneles.delete(id)
      avisar()
      if (bloquear) {
        bloqueosScroll = Math.max(0, bloqueosScroll - 1)
        if (bloqueosScroll === 0) document.body.style.overflow = overflowOriginal
      }
      if (eraSuperior) {
        const superior = pila.ids().at(-1)
        const panelSuperior = superior ? paneles.get(superior)?.current : null
        if (anterior?.isConnected) anterior.focus()
        else panelSuperior?.focus?.()
      }
    }
  }, [open, ref, id])

  return { esSuperior, requestClose }
}
