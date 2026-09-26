// Pila de capas de los overlays (cosecha de ScaleOS, #2). La capa superior es
// la única que responde a Esc/Tab/foco, la única que lleva `aria-modal` y la
// que conserva el cierre interactivo; el pie de acciones de un formulario se
// asocia al `<form>` real aunque viva fuera de él.

// Orden de capas con inserción: una capa que CONTIENE a otra (un diálogo padre
// montado después que su hijo) se inserta antes, así el hijo queda arriba.
export function crearPilaCapas() {
  const capas = []
  return {
    agregar(id) {
      if (!capas.includes(id)) capas.push(id)
    },
    insertar(id, indice) {
      if (capas.includes(id)) return
      capas.splice(Math.max(0, Math.min(indice, capas.length)), 0, id)
    },
    quitar(id) {
      const indice = capas.indexOf(id)
      if (indice >= 0) capas.splice(indice, 1)
    },
    esSuperior(id) {
      return capas[capas.length - 1] === id
    },
    get tamano() {
      return capas.length
    },
    ids() {
      return [...capas]
    },
  }
}

// Registro de formularios pendientes de un diálogo. Cada formulario se
// registra con su propio id y el diálogo queda bloqueado mientras haya al
// menos uno: un form ocioso no destraba a otro que está guardando.
export function crearRegistroPendientes() {
  const pendientes = new Set()
  return {
    registrar(id, pendiente) {
      if (pendiente) pendientes.add(id)
      else pendientes.delete(id)
      return pendientes.size
    },
    get bloqueado() {
      return pendientes.size > 0
    },
    get cantidad() {
      return pendientes.size
    },
  }
}
