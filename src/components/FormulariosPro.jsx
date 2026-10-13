import { createContext, createElement, useContext } from 'react'

// Interruptor único de la segunda ola de formularios («pro»). Sin él, las apps
// se ven y se comportan como en la primera ola; con él se activan: tinte del
// Label con foco/error, entrada animada del mensaje de error, sacudida única,
// fondo de hover y giro del chevron del Select, Checkbox con dibujo propio,
// resorte del Switch, indicador deslizante de SegmentedField y Esc que limpia
// SearchField.
//
// Dos mitades que van juntas:
// - CSS: el atributo `data-oc-formularios="pro"` en un ancestro (el proveedor lo
//   pone en su contenedor; en apps con portales conviene ponerlo también en
//   <html> y usar `contenedor={false}`).
// - JS: el contexto que lee `useFormulariosPro()`.
// Las props de cada componente (`motion={false}`, `limpiable`, …) ganan sobre el
// interruptor.
const ContextoFormulariosPro = createContext(false)

/** `true` dentro de <FormulariosPro>. */
export function useFormulariosPro() {
  return useContext(ContextoFormulariosPro)
}

/**
 * Activa la segunda ola de formularios para su contenido. `activo={false}` lo
 * apaga (anidado). `contenedor={false}` omite el <div> (display: contents) y
 * solo entrega el contexto: el atributo lo pone la app en su raíz.
 */
export function FormulariosPro({ children, activo = true, contenedor = true }) {
  const proveedor = createElement(ContextoFormulariosPro.Provider, { value: Boolean(activo) }, children)
  if (!contenedor) return proveedor
  return createElement('div', { 'data-oc-formularios': activo ? 'pro' : undefined, style: { display: 'contents' } }, proveedor)
}

export default FormulariosPro
