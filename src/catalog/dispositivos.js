// Buscador dependiente de dispositivos (#241/#250): el modelo manda y las
// variantes (capacidad, color, conectividad, marca o categoría) dependen de él.
// Es el mismo patrón que `CityAutocomplete` (ciudad → departamento), pero para
// equipos: sirve en la asistencia (POS), el stock y las compras.
//
// La librería trae un perfil por tipo de tienda (`PERFILES_DISPOSITIVO`) con
// los catálogos de iPhone por defecto; una app puede pisar el catálogo o el
// perfil completo. Los modelos pueden ser texto (`'iPhone 17'`) o un objeto con
// sus dependientes propios:
//   { nombre: 'iPhone 17', codigo: 'IP17', capacidades: ['128 GB'], colores: […] }
import { CAPACIDADES_IPHONE, COLORES_IPHONE, MARCAS_ACCESORIOS, CATEGORIAS_ACCESORIOS, MODELOS_IPHONE, normalizarBusqueda } from './productos.js'

export const CONECTIVIDADES_MOVIL = ['5G', '4G LTE', 'WiFi', 'WiFi + Cellular', 'Bluetooth', 'eSIM']

// Catálogo predeterminado del rubro mobile: los modelos del catálogo de la
// librería, sin código (cada app puede pasar el suyo).
export const DISPOSITIVOS_MOBILE = MODELOS_IPHONE.map((nombre) => ({ nombre }))

export const PERFILES_DISPOSITIVO = {
  // Celulares: modelo → capacidad, color y conectividad.
  mobile: {
    campos: ['capacidad', 'color', 'conectividad'],
    etiquetas: { modelo: 'Modelo', capacidad: 'Capacidad', color: 'Color', conectividad: 'Conectividad' },
    catalogo: { modelos: DISPOSITIVOS_MOBILE, capacidades: CAPACIDADES_IPHONE, colores: COLORES_IPHONE, conectividades: CONECTIVIDADES_MOVIL },
  },
  // Accesorios: marca → categoría (el modelo compatible es opcional).
  accesorios: {
    campos: ['marca', 'categoria'],
    etiquetas: { modelo: 'Producto o modelo compatible', marca: 'Marca', categoria: 'Categoría' },
    catalogo: { modelos: [], marcas: MARCAS_ACCESORIOS, categorias: CATEGORIAS_ACCESORIOS },
  },
  // Servicio técnico: modelo → capacidad y color (sin conectividad).
  servicio: {
    campos: ['capacidad', 'color'],
    etiquetas: { modelo: 'Modelo', capacidad: 'Capacidad', color: 'Color' },
    catalogo: { modelos: DISPOSITIVOS_MOBILE, capacidades: CAPACIDADES_IPHONE, colores: COLORES_IPHONE },
  },
}

export const CAMPOS_DISPOSITIVO = ['capacidad', 'color', 'conectividad', 'marca', 'categoria']

// Campo visible → clave plural del catálogo (las listas propias de un modelo).
const CLAVES_DEPENDIENTE = { capacidad: 'capacidades', color: 'colores', conectividad: 'conectividades', marca: 'marcas', categoria: 'categorias' }

// El nombre (y el código, si viene) de un modelo del catálogo.
export function nombreDeDispositivo(modelo) {
  return typeof modelo === 'string' ? modelo : (modelo?.nombre || '')
}

export function codigoDeDispositivo(modelo) {
  return typeof modelo === 'string' ? '' : (modelo?.codigo || '')
}

// Sugerencias del modelo por nombre o código, tolerante a acentos y
// mayúsculas. Sin texto devuelve los primeros `limite` del catálogo.
export function buscarDispositivo(modelos = [], texto = '', { porCodigo = true, limite = 8 } = {}) {
  const q = normalizarBusqueda(texto)
  const lista = Array.isArray(modelos) ? modelos : []
  if (!q) return lista.slice(0, limite)
  return lista
    .filter((modelo) => {
      const nombre = normalizarBusqueda(nombreDeDispositivo(modelo))
      if (nombre.includes(q)) return true
      return porCodigo !== false && normalizarBusqueda(codigoDeDispositivo(modelo)).includes(q)
    })
    .slice(0, limite)
}

// Opciones de cada dependiente para un modelo: las propias del modelo mandan
// (claves plurales del catálogo: `capacidades`, `colores`, …); si no las trae,
// se usa el catálogo del perfil.
export function opcionesDependiente(modelo, campo, perfil = PERFILES_DISPOSITIVO.mobile) {
  const clave = CLAVES_DEPENDIENTE[campo] || campo
  const propias = typeof modelo === 'object' && modelo ? modelo[clave] : null
  if (Array.isArray(propias) && propias.length) return propias
  return (perfil?.catalogo?.[clave] || [])
}

// Un cambio de modelo limpia los dependientes que ya no son válidos (o todos,
// cuando el modelo cambió): la variante nunca queda apuntando a otro equipo.
export function limpiarDependientes(valor = {}, modelo, perfil = PERFILES_DISPOSITIVO.mobile) {
  const siguiente = { ...valor, modelo: nombreDeDispositivo(modelo) }
  const mismosCampos = nombreDeDispositivo(modelo) && normalizarBusqueda(nombreDeDispositivo(modelo)) === normalizarBusqueda(valor.modelo)
  for (const campo of perfil?.campos || []) {
    if (!mismosCampos) { siguiente[campo] = ''; continue }
    const opciones = opcionesDependiente(modelo, campo, perfil)
    if (opciones.length && valor[campo] && !opciones.includes(valor[campo])) siguiente[campo] = ''
  }
  return siguiente
}

// Etiqueta legible del dispositivo elegido: «iPhone 17 · 256 GB · Azul · 5G».
export function etiquetaDispositivo(valor = {}, { separador = ' · ' } = {}) {
  const partes = [valor.modelo, valor.capacidad, valor.color, valor.conectividad, valor.marca, valor.categoria]
  return partes.filter(Boolean).join(separador)
}
