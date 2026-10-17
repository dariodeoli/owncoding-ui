import {resolve} from 'node:path'
import {expect,test} from 'vitest'
import {numericBuildBoundaries} from '../scripts/numeric-build-boundaries.mjs'
function fixture({inputs={'src/numeric/number-utils.js':{bytesInOutput:1}},imports=[],text='export const x=1'}={}) {
 const purePath='dist/chunks/arbitrary-hash.js'
 const output=(path,text)=>({path:resolve(path),text,contents:Buffer.from(text)})
 return {metafile:{outputs:{
  'dist/number-utils.js':{inputs:{},imports:[{path:purePath}]},
  [purePath]:{inputs,imports},
  'dist/numeric.js':{inputs:{'src/numeric/controls.jsx':{}},imports:[{path:purePath}]},
 }},outputFiles:[output('dist/number-utils.js','export {x} from "./chunks/arbitrary-hash.js"'),output(purePath,text),output('dist/numeric.js','export const NumericControl=1'),output('dist/numeric.js.map',JSON.stringify({mappings:'AAAA'}))]}
}
test('la excepción depende de imports y entradas verificadas, no del nombre del chunk',()=>{
 const result=numericBuildBoundaries(fixture())
 expect(result[0].contents.toString()).not.toMatch(/use client/)
 expect(result[1].contents.toString()).not.toMatch(/use client/)
 expect(result[2].contents.toString()).toMatch(/^"use client";/)
 expect(JSON.parse(result[3].contents.toString()).mappings).toBe(';AAAA')
})
test.each([
 [{inputs:{'src/hidden-react.jsx':{}}},/Entrada no autorizada/],
 [{imports:[{path:'react',external:true}]},/Dependencia externa/],
 [{imports:[{path:'dist/missing.js'}]},/Salida pura ausente/],
 [{text:'"use client";export const x=1'},/Contenido no puro/],
 [{text:'export const x="data:image/png;base64,AA"'},/Contenido no puro/],
])('rechaza contaminación de la clausura pura %j',(options,error)=>{
 expect(()=>numericBuildBoundaries(fixture(options))).toThrow(error)
})
