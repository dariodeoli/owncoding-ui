import {readFileSync} from 'node:fs'
import {build} from 'esbuild'
import {expect,test} from 'vitest'
import {DECLARED_EXTERNALS,measureClosure} from '../scripts/bundle-closure.mjs'

const required = ['AVISO_REFRESCO', 'Aviso', 'AvisoPrivacidad', 'AyudaModulo', 'Badge', 'BarraProgreso', 'CREDITO_PIE', 'CREDITO_PIE_URL', 'CampanaAvisos', 'Card', 'CeldaMoneda', 'Checkbox', 'ChipEstado', 'ConsentimientoDatos', 'DataTable', 'EmptyState', 'ErrorState', 'FilaDato', 'ListGridToggle', 'MENSAJE_RUC', 'MenuDesplegable', 'MoneyInput', 'Nota', 'PaletaComandos', 'ProductFooter', 'SegmentedField', 'SerialField', 'SerialTexto', 'Skeleton', 'Stat', 'Subtabs', 'Switch', 'cn', 'completeSave', 'componerTelefono', 'dialogFocusContains', 'dialogFocusableElements', 'diasHasta', 'esToken', 'extractTokenFromUrl', 'fechaDia', 'fechaHora', 'fechaLista', 'fechaListaCorta', 'hayVersionNueva', 'normalizarNombre', 'normalizeTaxId', 'parseTelefono', 'partirSerial', 'primerNombre', 'registroConsentimiento', 'serialEnmascarado', 'soloDigitos', 'taxIdValid', 'ventanaDeLista', 'whatsappUrl']

test('core exports the complete consumer surface with strict root identity',async()=>{
 const [root,core]=await Promise.all([import('../dist/index.js'),import('../dist/core.js')])
 expect(Object.keys(core).sort()).toEqual([...required,'Button'].sort())
 for(const [name,value] of Object.entries(core))expect(value,name).toBe(root[name])
 expect(core.BancoLogo).toBeUndefined()
 expect(core.BancoCombobox).toBeUndefined()
 const manifest=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'))
 expect(manifest.exports['./core']).toEqual({types:'./dist/core.d.ts',default:'./dist/core.js'})
})

test('the full core client closure contains no financial artwork without relying on DCE',async()=>{
 const closure=await measureClosure('dist/core.js')
 expect(closure.files.length).toBeGreaterThan(1)
 for(const file of closure.files)expect(file.source,file.file).not.toMatch(/data:image\//i)
 expect(closure.raw).toBeLessThanOrEqual(156_000)
 expect(closure.gzip).toBeLessThanOrEqual(47_000)
 expect(readFileSync('dist/core.js','utf8')).toMatch(/^"use client"/)
 const bundle=await build({entryPoints:['dist/core.js'],bundle:true,write:false,format:'esm',platform:'neutral',external:DECLARED_EXTERNALS,minify:true})
 expect(bundle.outputFiles[0].text).not.toMatch(/data:image\//i)
 // Every core export remains present; this is not a selected-import DCE probe.
 expect(bundle.outputFiles[0].text).toContain('MoneyInput')
 expect(bundle.outputFiles[0].contents.length).toBeLessThan(90_000)
})
