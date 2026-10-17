import {readFileSync} from 'node:fs'
import {SourceMap} from 'node:module'
import {describe,expect,test} from 'vitest'
import {measureClosure} from '../scripts/bundle-closure.mjs'

describe('piloto empaquetado: identidad y frontera',()=>{
 test('root, numeric y utils comparten funciones/objetos exactos',async()=>{
  const [root,numeric,pure]=await Promise.all([import('../dist/index.js'),import('../dist/numeric.js'),import('../dist/number-utils.js')])
  for(const name of ['InputBase','TextareaBase','NumericControl','NumberInput','PercentageInput','numberInputProblem','numberInputValid','nativeNumberSettings']) expect(root[name]).toBe(numeric[name])
  for(const name of ['numberInputProblem','numberInputValid','nativeNumberSettings']) expect(root[name]).toBe(pure[name])
 })
 test('clausura pura sin React/cliente/assets y un solo cuerpo por export compartido',async()=>{
  const pure=await measureClosure('dist/number-utils.js',{pure:true})
  expect(pure.files.length).toBeGreaterThan(0)
  const numeric=await measureClosure('dist/numeric.js')
  expect(numeric.files.map(file=>file.source).join('')).not.toMatch(/data:image|@base-ui|react-dom/)
  const root=await measureClosure('dist/index.js')
  const combined=[...new Map([...root.files,...numeric.files,...pure.files].map(file=>[file.file,file])).values()]
  for(const name of ['numberInputProblem','nativeNumberSettings']) expect(combined.map(file=>file.source).join('').match(new RegExp('function '+name+'\\(', 'g'))).toHaveLength(1)
 })
 test('sourcemaps continúan apuntando al origen después de frontera cliente',async()=>{
  const closure=await measureClosure('dist/numeric.js')
  for(const file of closure.files){
   const map=new SourceMap(JSON.parse(readFileSync(file.file+'.map','utf8')))
   const token=file.source.includes('function NumericControl')?'function NumericControl':file.source.includes('function numberInputProblem')?'function numberInputProblem':null
   if(!token)continue
   const position=file.source.indexOf(token),before=file.source.slice(0,position).split('\n')
   const entry=map.findEntry(before.length-1,before.at(-1).length)
   expect(entry.originalSource).toMatch(/src\/numeric\/(controls.jsx|number-utils.js)$/)
   expect(entry.originalLine).toBeGreaterThanOrEqual(0)
  }
 })
})
