import {readFileSync} from 'node:fs'
import {dirname,resolve,extname} from 'node:path'

// Deriva cada import literal del registro canónico; no mantiene otro catálogo.
export function financialLazyLoaders(source) {
  const imports = new Map([...source.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g)].map(match => [match[1],match[2]]))
  const registry = source.match(/Object\.freeze\(\{([\s\S]*?)\}\)/)?.[1]
  if (!registry) throw new Error('Missing canonical financial registry')
  const entries = [...registry.matchAll(/['"]([^'"]+)['"]:\s*(\w+)\s*,/g)]
  if (!entries.length || entries.length !== imports.size) throw new Error('Incomplete canonical financial registry')
  const keys = new Set()
  return 'export const loaders = Object.freeze({'+entries.map(([,key,binding]) => {
    const file = imports.get(binding)
    if (file !== '../assets/financial/'+key || keys.has(key)) throw new Error('Invalid canonical financial asset: '+key)
    keys.add(key)
    const group = key.replace(/-(?:compacto|horizontal|marca)(?:-[^.]+)?\.[^.]+$/, '')
    return JSON.stringify(key)+':()=>import('+JSON.stringify('owncoding:financial-group:'+group)+').then(module=>module.default['+JSON.stringify(key)+'])'
  }).join(',')+'})'
}

export function financialLazyPlugin() {
  const registry = resolve('src/financial/assets.js')
  const source = readFileSync(registry,'utf8')
  const resourcePaths = new Map([...source.matchAll(/import\s+\w+\s+from\s+['"]([^'"]+)['"]/g)].map((match,index)=>[resolve(dirname(registry),match[1]),'r'+index+extname(match[1])]))
  return {name:'financial-lazy-assets',setup(build){
    build.onResolve({filter:/^owncoding:financial-group:/},args=>({path:args.path.slice('owncoding:financial-group:'.length),namespace:'financial-group'}))
    build.onLoad({filter:/.*/,namespace:'financial-group'},args=>{
      const keys = [...resourcePaths.keys()].filter(file=>{const key=file.slice(resolve('src/assets/financial').length+1);return key.replace(/-(?:compacto|horizontal|marca)(?:-[^.]+)?\.[^.]+$/, '') === args.path})
      if(!keys.length)throw new Error('Empty financial resource group')
      const contents = keys.map((file,index)=>'import a'+index+' from '+JSON.stringify(file)).join(';')+';export default {'+keys.map((file,index)=>JSON.stringify(file.slice(resolve('src/assets/financial').length+1))+':a'+index).join(',')+'}'
      return {contents,resolveDir:dirname(registry),loader:'js'}
    })
    build.onResolve({filter:/assets\/financial\//},args=>{
      const file = resolve(args.resolveDir,args.path)
      const resource = resourcePaths.get(file)
      return resource ? {path:resource,namespace:'financial-resource',pluginData:{file}} : undefined
    })
    build.onLoad({filter:/.*/,namespace:'financial-resource'},args=>({contents:readFileSync(args.pluginData.file),loader:'dataurl'}))
    build.onResolve({filter:/^owncoding:financial-assets$/},()=>({path:registry,namespace:'financial-loaders'}))
    build.onLoad({filter:/.*/,namespace:'financial-loaders'},()=>({contents:financialLazyLoaders(readFileSync(registry,'utf8')),resolveDir:dirname(registry),loader:'js'}))
  }}
}
