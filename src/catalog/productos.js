// Catálogos de productos como predeterminado de la librería: modelos de iPhone
// y categorías de accesorios. Se actualizan acá y llegan a todas las apps con
// el release (a futuro, el listado se revisa por generación).

export const MODELOS_IPHONE = [
  // Generación actual y anteriores (del más nuevo al más viejo)
  'iPhone 17 Pro Max',
  'iPhone 17 Pro',
  'iPhone 17 Plus',
  'iPhone 17',
  'iPhone 16 Pro Max',
  'iPhone 16 Pro',
  'iPhone 16 Plus',
  'iPhone 16',
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15 Plus',
  'iPhone 15',
  'iPhone 14 Pro Max',
  'iPhone 14 Pro',
  'iPhone 14 Plus',
  'iPhone 14',
  'iPhone 13 Pro Max',
  'iPhone 13 Pro',
  'iPhone 13 mini',
  'iPhone 13',
  'iPhone 12 Pro Max',
  'iPhone 12 Pro',
  'iPhone 12 mini',
  'iPhone 12',
  'iPhone 11 Pro Max',
  'iPhone 11 Pro',
  'iPhone 11',
  'iPhone XS Max',
  'iPhone XS',
  'iPhone XR',
  'iPhone X',
  'iPhone 8 Plus',
  'iPhone 8',
  'iPhone 7 Plus',
  'iPhone 7',
  'iPhone SE (3.ª generación)',
  'iPhone SE (2.ª generación)',
]

export const CAPACIDADES_IPHONE = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB']

export const COLORES_IPHONE = [
  'Negro',
  'Blanco',
  'Plata',
  'Gris espacial',
  'Dorado',
  'Azul',
  'Verde',
  'Rojo',
  'Rosa',
  'Morado',
  'Amarillo',
  'Titanio natural',
  'Titanio azul',
  'Titanio blanco',
  'Titanio negro',
  'Titanio desierto',
]

export const CATEGORIAS_ACCESORIOS = [
  'Fundas',
  'Vidrios templados',
  'Cargadores',
  'Cables',
  'Auriculares',
  'Baterías',
  'Parlantes',
  'Relojes y correas',
  'Soportes',
  'Power banks',
  'Adaptadores',
  'Lápices y stylus',
  'Memorias y almacenamiento',
  'Cámaras y accesorios',
  'Repuestos',
  'Otros accesorios',
]

export const MARCAS_ACCESORIOS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'JBL',
  'Baseus',
  'Anker',
  'Hoco',
  'Generic',
  'Otro',
]

// Búsqueda tolerante (sin acentos ni mayúsculas) sobre cualquiera de los
// catálogos; devuelve el valor tal cual está cargado.
export function normalizarBusqueda(texto = '') {
  return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function buscarEnCatalogo(catalogo = [], texto = '') {
  const q = normalizarBusqueda(texto)
  if (!q) return catalogo
  return catalogo.filter((item) => normalizarBusqueda(item).includes(q))
}
