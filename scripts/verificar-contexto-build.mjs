// Mide el contexto de build que recibe Coolify: los archivos que no excluye
// .dockerignore. Falla si supera 400 MB o si algún archivo pesa más de 5 MB,
// y muestra los culpables. Usa `git ls-files` si hay repo; si no, recorre el disco.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export const LIMITE_TOTAL = 400 * 1024 * 1024
export const LIMITE_ARCHIVO = 5 * 1024 * 1024

export function leerPatrones(texto) {
  return texto.split('\n').map(linea => linea.trim()).filter(linea => linea && !linea.startsWith('#'))
}

function patronARegex(patron) {
  let p = patron.replace(/^\.\//, '').replace(/^\//, '')
  const carpeta = p.endsWith('/')
  if (carpeta) p = p.slice(0, -1)
  const cuerpo = p.split('**').map(parte => parte.split('*').map(t => t.replace(/[.+^${}()|[\]\\?]/g, '\\$&')).join('[^/]*')).join('.*')
  const inicio = p.startsWith('**') ? '(^|.*/)' : '^'
  return new RegExp(inicio + cuerpo.replace(/^\.\*\//, '') + '(/.*)?$')
}

// Como Docker: gana la última regla que coincide; `!` vuelve a incluir.
export function excluido(ruta, patrones) {
  let resultado = false
  for (const patron of patrones) {
    const negado = patron.startsWith('!')
    if (patronARegex(negado ? patron.slice(1) : patron).test(ruta)) resultado = !negado
  }
  return resultado
}

function listarArchivos(raiz) {
  try {
    return execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: raiz, encoding: 'utf8' }).split('\0').filter(Boolean)
  } catch {
    const salida = []
    const recorrer = dir => {
      for (const nombre of readdirSync(dir)) {
        if (nombre === 'node_modules' || nombre === '.git') continue
        const ruta = join(dir, nombre)
        const info = statSync(ruta)
        if (info.isDirectory()) recorrer(ruta)
        else salida.push(relative(raiz, ruta))
      }
    }
    recorrer(raiz)
    return salida
  }
}

export function medirContexto(raiz = process.cwd()) {
  const archivoIgnore = join(raiz, '.dockerignore')
  const patrones = existsSync(archivoIgnore) ? leerPatrones(readFileSync(archivoIgnore, 'utf8')) : []
  const incluidos = []
  for (const ruta of listarArchivos(raiz)) {
    if (excluido(ruta, patrones) || !existsSync(join(raiz, ruta))) continue
    incluidos.push({ ruta, bytes: statSync(join(raiz, ruta)).size })
  }
  const total = incluidos.reduce((suma, archivo) => suma + archivo.bytes, 0)
  return { total, incluidos, grandes: incluidos.filter(archivo => archivo.bytes > LIMITE_ARCHIVO) }
}

const mb = bytes => (bytes / 1048576).toFixed(1) + ' MB'

if (import.meta.url === `file://${process.argv[1]}`) {
  const { total, incluidos, grandes } = medirContexto()
  const pesados = [...incluidos].sort((a, b) => b.bytes - a.bytes).slice(0, 10)
  console.log(`contexto de build: ${mb(total)} en ${incluidos.length} archivos (límite ${mb(LIMITE_TOTAL)}, ${mb(LIMITE_ARCHIVO)} por archivo)`)
  if (total > LIMITE_TOTAL || grandes.length) {
    console.error('El contexto de build está inflado. Más pesados:')
    for (const archivo of (grandes.length ? grandes : pesados)) console.error(`  ${mb(archivo.bytes)}  ${archivo.ruta}`)
    console.error('Excluí estas rutas en .dockerignore o sacalas del repo (evidencias de QA van a artefactos de CI).')
    process.exit(1)
  }
}
