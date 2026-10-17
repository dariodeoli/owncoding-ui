import {resolve} from 'node:path'

/** Clasifica por clausura verificada, nunca por nombre de archivo. */
export function numericBuildBoundaries(compartido) {
const salidas = new Map(Object.entries(compartido.metafile.outputs).map(([file, info]) => [resolve(file), info]))
const puros = new Set()
function marcarPuro(file) {
  const absolute = resolve(file)
  if (puros.has(absolute)) return
  puros.add(absolute)
  const info = salidas.get(absolute)
  if (!info) throw new Error(`Salida pura ausente: ${file}`)
  // La clasificación no puede alternar por nombre: sólo el módulo sin React
  // que posee el parser puede integrar esta clausura. El hash de esbuild
  // identifica su contenido; el prefijo cliente es constante para el resto.
  if (Object.keys(info.inputs).some(input => input !== 'src/numeric/number-utils.js')) throw new Error(`Entrada no autorizada en motor puro: ${file}`)
  const output = compartido.outputFiles.find(output => output.path === absolute)
  if (!output || /data:image\//i.test(output.text) || /^\s*["']use client["']/.test(output.text)) throw new Error(`Contenido no puro: ${file}`)
  for (const item of info.imports) {
    if (item.external) throw new Error(`Dependencia externa en motor puro: ${item.path}`)
    marcarPuro(item.path)
  }
}
marcarPuro('dist/number-utils.js')
const finalized = []
for (const output of compartido.outputFiles) {
  let contents = output.contents
  const modulePath = output.path.endsWith('.map') ? output.path.slice(0, -4) : output.path
  if (!puros.has(modulePath)) {
    if (output.path.endsWith('.js')) contents = Buffer.from(`"use client";\n${output.text}`)
    else if (output.path.endsWith('.js.map')) {
      const map = JSON.parse(output.text)
      map.mappings = ';' + map.mappings
      contents = Buffer.from(JSON.stringify(map))
    }
  }
  finalized.push({...output, contents})
}
return finalized
}
