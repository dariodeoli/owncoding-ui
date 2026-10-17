import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {dirname,resolve} from 'node:path'
import {init,parse} from 'es-module-lexer'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {expect,test} from 'vitest'
import {measureClosure} from '../scripts/bundle-closure.mjs'

const baseline=JSON.parse(readFileSync('test/fixtures/financial-lazy-legacy.json','utf8'))
const hash=value=>createHash('sha256').update(value).digest('hex')
async function staticClosure(entry){
 await init
 const seen=new Map()
 function visit(file){file=resolve(file);if(seen.has(file))return;const source=readFileSync(file,'utf8');seen.set(file,source);for(const item of parse(source)[0])if(item.d===-1&&item.n?.startsWith('.'))visit(resolve(dirname(file),item.n))}
 visit(entry);return seen
}

test('initial lazy entry and singleton selector engine contain no inline financial assets',async()=>{
 const files=await staticClosure('dist/financial-lazy.js')
 expect([...files.values()].join('')).not.toMatch(/data:image\//i)
 expect([...files.keys()].some(file=>file.endsWith('/bank-combobox-base.js'))).toBe(true)
 expect(readFileSync('dist/financial-lazy.js','utf8')).not.toContain('function BancoComboboxBase')
 const root=await measureClosure('dist/index.js'),engine=await measureClosure('dist/bank-combobox-base.js')
 const union=[...new Map([...root.files,...engine.files].map(file=>[file.file,file.source])).values()].join('')
 expect((union.match(/function BancoComboboxBase\(/g)||[]).length).toBe(1)
 expect((union.match(/function Input\d*\(/g)||[]).length).toBe(1)
})

test('all resource data URLs and 108 legacy SSR cases remain byte-identical to shipped baseline',async()=>{
 const legacy=await import('../dist/financial.js'),lazy=await import('../dist/financial-lazy.js')
 expect(Object.keys(baseline.assets).sort()).toEqual([...legacy.ASSET_KEYS_FINANCIEROS].sort())
 for(const [key,expected] of Object.entries(baseline.assets)){
  expect(hash(legacy.obtenerAssetFinanciero(key)),key).toBe(expected)
  expect(hash(await lazy.cargarAssetFinanciero(key)),key).toBe(expected)
 }
 for(const row of baseline.ssr)expect(hash(renderToStaticMarkup(React.createElement(row.kind==='bank'?legacy.BancoLogo:legacy.MedioPagoLogo,row.props)))).toBe(row.sha256)
 await expect(lazy.cargarAssetFinanciero('unknown')).resolves.toBeNull()
})

test('SSR fallback never requests a relative asset and hydrated/preloaded Continental preserves crop/a11y',async()=>{
 const lazy=await import('../dist/financial-lazy.js')
 expect(renderToStaticMarkup(React.createElement(lazy.BancoLogoLazy,{banco:''}))).toBe('')
 const fallback=renderToStaticMarkup(React.createElement(lazy.BancoLogoLazy,{banco:'Banco Continental',variante:'compacto'}))
 expect(fallback).not.toContain('<img')
 expect(fallback).toContain('Banco Continental')
 expect(fallback).toContain('data-logo-carga="pendiente"')
 const clave='bancos/continental-compacto.png',asset=await lazy.cargarAssetFinanciero(clave)
 const ready=renderToStaticMarkup(React.createElement(lazy.BancoLogoLazy,{banco:'Banco Continental',variante:'compacto',recursoInicial:{clave,asset}}))
 expect(ready).toContain('src="data:image/png;')
 expect(ready).toContain('data-logo-optico')
 expect(ready).toContain('role="img"')
 expect(ready).not.toContain('asset-fallido')
})
