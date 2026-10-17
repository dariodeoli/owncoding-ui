// Instancia privada compartida por el entry de recursos y la presentación.
export function crearCargadorFinanciero(loaders) {
  const pendientes = new Map()
  return function cargar(clave) {
    if (typeof clave !== 'string' || !Object.hasOwn(loaders,clave)) return Promise.resolve(null)
    if (!pendientes.has(clave)) {
      const promise = loaders[clave]().catch(error=>{pendientes.delete(clave);throw error})
      pendientes.set(clave,promise)
    }
    return pendientes.get(clave)
  }
}
