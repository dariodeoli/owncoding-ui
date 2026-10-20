// Sólo los portales registrados por objetos de la biblioteca amplían el foco.
// No se confía en atributos DOM: un panel ajeno o un nodo que imite el markup
// nunca queda autorizado para escapar de la trampa del diálogo actual.
const portales = new Set()
export const SELECTOR_ENFOCABLES = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'

export function registrarDialogPortal(ancla, panel) {
  const registro = { ancla, panel }
  portales.add(registro)
  return () => portales.delete(registro)
}

function alcances(contenedor) {
  const resultado = [contenedor]
  if (!contenedor) return []
  // Incluye portales anidados sólo cuando su ancla pertenece al alcance ya
  // admitido; ningún menú de otro diálogo o del fondo se incorpora.
  let cambio = true
  while (cambio) {
    cambio = false
    for (const { ancla, panel } of portales) {
      if (!ancla?.isConnected || !panel?.isConnected || resultado.includes(panel)) continue
      if (resultado.some(raiz => raiz?.contains(ancla))) {
        resultado.push(panel)
        cambio = true
      }
    }
  }
  return resultado
}

export function dialogFocusContains(contenedor, objetivo) {
  const Nodo = contenedor?.ownerDocument?.defaultView?.Node
  if (!Nodo || !(objetivo instanceof Nodo)) return false
  return alcances(contenedor).some(raiz => raiz.contains(objetivo))
}

function enfocables(raiz, selector) {
  return [...raiz.querySelectorAll(selector)].filter(nodo =>
    (selector !== SELECTOR_ENFOCABLES || nodo.tabIndex >= 0) && nodo.getClientRects().length &&
    !nodo.closest('[hidden], [inert], [aria-hidden="true"]'))
}

export function dialogFocusableElements(contenedor, selector = SELECTOR_ENFOCABLES) {
  if (!contenedor?.querySelectorAll) return []
  const scopes = alcances(contenedor)
  const resultado = enfocables(contenedor, selector)
  for (const panel of scopes.slice(1)) {
    const registro = [...portales].find(entrada => entrada.panel === panel)
    const posicion = resultado.indexOf(registro?.ancla)
    const nuevos = enfocables(panel, selector).filter(nodo => !resultado.includes(nodo))
    resultado.splice(posicion < 0 ? resultado.length : posicion + 1, 0, ...nuevos)
  }
  return resultado
}
