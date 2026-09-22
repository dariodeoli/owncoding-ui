// Bancos y financieras de Paraguay (listado vigente del BCP) como
// predeterminado de la librería: el campo Banco sugiere el catálogo completo y
// el usuario puede escribir cualquier otro nombre. El registro `LOGOS_BANCOS`
// es la fuente única de logo por banco (archivo, marca o monograma).

export const BANCOS_PARAGUAY = [
  'Banco Atlas',
  'Banco Basa',
  'Banco Continental',
  'Banco de la Nación Argentina',
  'Banco do Brasil',
  'Banco Familiar',
  'Banco GNB Paraguay',
  'Banco Interfisa',
  'Banco Itaú Paraguay',
  'Banco Nacional de Fomento',
  'Banco Sudameris',
  'Bancop',
  'Citibank Paraguay',
  'Coomecipar',
  'Cooperativa Medalla Milagrosa',
  'Cooperativa San Cristóbal',
  'Cooperativa Universitaria',
  'Financiera El Comercio',
  'Financiera Finexpar',
  'Financiera Paraguayo Japonesa',
  'Solar Banco',
  'ueno bank',
]

export const LOGOS_BANCOS = {
  'Banco Atlas': { archivo: 'banco-atlas.png' },
  'Banco Basa': { archivo: 'banco-basa.svg' },
  'Banco Continental': { marca: 'continental' },
  'Banco de la Nación Argentina': { archivo: 'banco-nacion-argentina.png', chip: true, alias: ['banco nacion', 'bna'] },
  'Banco do Brasil': { archivo: 'banco-do-brasil.svg', alias: ['bb', 'brasil'] },
  'Banco Familiar': { marca: 'familiar' },
  'Banco GNB Paraguay': { archivo: 'banco-gnb.svg' },
  'Banco Interfisa': { archivo: 'interfisa.png' },
  'Banco Itaú Paraguay': { archivo: 'itau.png', alias: ['itau', 'banco itau', 'itau paraguay'] },
  'Banco Nacional de Fomento': { archivo: 'bnf.png' },
  'Banco Sudameris': { archivo: 'sudameris.png' },
  'Bancop': { archivo: 'bancop.png' },
  'Citibank Paraguay': { archivo: 'citibank.svg', alias: ['citibank', 'citi'] },
  'Coomecipar': { monograma: 'CO', color: '#0B6E4F' },
  'Cooperativa Medalla Milagrosa': { monograma: 'MMM', color: '#6C3FA0' },
  'Cooperativa San Cristóbal': { monograma: 'CSC', color: '#167A54' },
  'Cooperativa Universitaria': { monograma: 'CU', color: '#1D4E9E' },
  'Financiera El Comercio': { monograma: 'FEC', color: '#0E7C7B' },
  'Financiera Finexpar': { monograma: 'FX', color: '#C24E1B' },
  'Financiera Paraguayo Japonesa': { archivo: 'paraguayo-japonesa.png' },
  'Solar Banco': { archivo: 'solar.svg', alias: ['solar', 'solar ahorro y finanzas'] },
  'ueno bank': { marca: 'ueno', alias: ['ueno'] },
}

// Paleta de respaldo para nombres escritos a mano fuera del catálogo.
export const COLORES_BANCO_RESPALDO = ['#33414F', '#1D4E9E', '#0B6E4F', '#8A3A1B', '#6C3FA0', '#12659E']

export function normalizarBanco(texto) {
  return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

const INDICE = new Map(
  Object.entries(LOGOS_BANCOS).flatMap(([nombre, entrada]) =>
    [nombre, ...(entrada.alias || [])].map((clave) => [normalizarBanco(clave), { nombre, ...entrada }]),
  ),
)

// Iniciales para el monograma: hasta 3 palabras significativas del nombre.
const VACIAS = new Set(['banco', 'financiera', 'cooperativa', 'banca', 'de', 'del', 'la', 'el', 'y'])

export function inicialesDeBanco(nombre) {
  const palabras = String(nombre || '').split(/[\s/]+/).filter(Boolean)
  const utiles = palabras.filter((palabra) => !VACIAS.has(normalizarBanco(palabra)))
  const base = (utiles.length ? utiles : palabras).slice(0, 3)
  const iniciales = base.map((palabra) => palabra[0].toUpperCase()).join('')
  return iniciales || '?'
}

export function colorDeBanco(nombre) {
  const texto = normalizarBanco(nombre)
  let hash = 0
  for (const letra of texto) hash = (hash * 31 + letra.charCodeAt(0)) % 9973
  return COLORES_BANCO_RESPALDO[hash % COLORES_BANCO_RESPALDO.length]
}

// Resolución para una pantalla: archivo propio, marca compartida o monograma.
// Devuelve null si no hay nada que mostrar (texto vacío).
export function logoDeBanco(nombre) {
  const texto = String(nombre || '').trim()
  if (!texto) return null
  const entrada = INDICE.get(normalizarBanco(texto))
  if (entrada?.archivo) return { banco: entrada.nombre, tipo: 'archivo', archivo: entrada.archivo, chip: Boolean(entrada.chip) }
  if (entrada?.marca) return { banco: entrada.nombre, tipo: 'marca', marca: entrada.marca }
  if (entrada) return { banco: entrada.nombre, tipo: 'monograma', iniciales: entrada.monograma, color: entrada.color }
  return { banco: texto, tipo: 'monograma', iniciales: inicialesDeBanco(texto), color: colorDeBanco(texto), generico: true }
}

// Diagnóstico para tests y para documentar la cobertura del catálogo.
export function coberturaBancos(catalogo = BANCOS_PARAGUAY) {
  return catalogo.map((nombre) => {
    const entrada = LOGOS_BANCOS[nombre]
    const tipo = entrada?.archivo ? 'archivo' : entrada?.marca ? 'marca' : 'monograma'
    return { nombre, tipo, archivo: entrada?.archivo || null, marca: entrada?.marca || null }
  })
}

// Sugerencias del catálogo para el campo Banco (filtra sin acentos).
export function sugerenciasDeBanco(texto, catalogo = BANCOS_PARAGUAY) {
  const termino = normalizarBanco(texto)
  if (!termino) return catalogo
  return catalogo.filter((banco) => normalizarBanco(banco).includes(termino))
}
