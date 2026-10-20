// Coordenadas CSS de viewport; no depende de Popover ni de un contenedor
// position/transform. La app no necesita repetir este motor.
export function menuPortalPosition(ancla, menu, viewport, alineacion = 'right') {
  const margen = 8, separacion = 4
  if (ancla.right <= viewport.left || ancla.left >= viewport.right ||
      ancla.bottom <= viewport.top || ancla.top >= viewport.bottom ||
      ancla.width <= 0 || ancla.height <= 0) return null
  const disponible = Math.max(0, viewport.right - viewport.left - margen * 2)
  if (!disponible) return null
  const ancho = Math.min(menu.width, disponible)
  const abajo = Math.max(0, viewport.bottom - margen - ancla.bottom - separacion)
  const arriba = Math.max(0, ancla.top - viewport.top - margen - separacion)
  const superior = menu.height > abajo && arriba > abajo
  const altoMaximo = superior ? arriba : abajo
  if (!altoMaximo) return null
  const alto = Math.min(menu.height, altoMaximo)
  const x = alineacion === 'right' ? ancla.right - ancho : ancla.left
  return {
    left: Math.max(viewport.left + margen, Math.min(x, viewport.right - margen - ancho)),
    top: superior ? ancla.top - separacion - alto : ancla.bottom + separacion,
    minWidth: Math.min(192, disponible),
    maxWidth: disponible,
    maxHeight: altoMaximo,
  }
}

export function menuAnchorVisible(ancla, rect, viewport) {
  let visible = { left: Math.max(rect.left, viewport.left), top: Math.max(rect.top, viewport.top), right: Math.min(rect.right, viewport.right), bottom: Math.min(rect.bottom, viewport.bottom) }
  for (let nodo = ancla.parentElement; nodo && visible.right > visible.left && visible.bottom > visible.top; nodo = nodo.parentElement) {
    const estilo = getComputedStyle(nodo), caja = nodo.getBoundingClientRect()
    if (/(auto|scroll|hidden|clip)/.test(estilo.overflowX) && caja.width) visible = { ...visible, left: Math.max(visible.left, caja.left), right: Math.min(visible.right, caja.right) }
    if (/(auto|scroll|hidden|clip)/.test(estilo.overflowY) && caja.height) visible = { ...visible, top: Math.max(visible.top, caja.top), bottom: Math.min(visible.bottom, caja.bottom) }
  }
  return visible.right > visible.left && visible.bottom > visible.top
}
