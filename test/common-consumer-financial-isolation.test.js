import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {build} from 'esbuild'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {expect,test} from 'vitest'
import {DECLARED_EXTERNALS} from '../scripts/bundle-closure.mjs'

const root=fileURLToPath(new URL('../',import.meta.url))
async function consumer(names){
 const result=await build({stdin:{contents:`export {${names.join(',')}} from './dist/index.js'`,resolveDir:root},bundle:true,write:false,format:'esm',target:'es2020',platform:'neutral',external:DECLARED_EXTERNALS,minify:true,metafile:true,logLevel:'silent'})
 return {source:result.outputFiles[0].text,inputs:Object.keys(result.metafile.inputs)}
}

test('common root imports tree-shake financial artwork out of the consumer startup',async()=>{
 const {source,inputs}=await consumer(['cn','Button','normalizarNombre'])
 expect(source).not.toMatch(/data:image\//i)
 expect(Buffer.byteLength(source)).toBeLessThan(80_000)
 // Ensure the real published graph was consumed, not an alternate source facade.
 expect(inputs.some(file=>file.endsWith('dist/index.js'))).toBe(true)
 expect(inputs.some(file=>file.includes('dist/chunks/'))).toBe(true)
})

test('financial imports retain artwork and the private partition adds no public API',async()=>{
 const {source}=await consumer(['BancoLogo'])
 expect(source).toMatch(/data:image\//i)
 const manifest=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'))
 expect(manifest.exports['./class-utils']).toBeUndefined()
 const financial=await import('../dist/financial.js')
 expect(financial.ASSET_KEYS_FINANCIEROS.length).toBeGreaterThan(50)
 for(const key of financial.ASSET_KEYS_FINANCIEROS)expect(financial.obtenerAssetFinanciero(key)).toMatch(/^data:image\//)
})

test('root and financial keep one BancoLogo object and byte-identical baseline SSR',async()=>{
 const [entry,financial]=await Promise.all([import('../dist/index.js'),import('../dist/financial.js')])
 expect(entry.BancoLogo).toBe(financial.BancoLogo)
 const props={banco:'Banco Continental',variante:'compacto'}
 const html=renderToStaticMarkup(createElement(entry.BancoLogo,props))
 expect(html).toBe(renderToStaticMarkup(createElement(financial.BancoLogo,props)))
 expect(html).toContain('data:image/')
 // Captured from shipped v0.68.17 before changing only the build partition.
 expect(createHash('sha256').update(html).digest('hex')).toBe('888c1fca67ec6d19fac1d8a370b9905415e5419bf216a42b7a39d6598b210f88')
})
