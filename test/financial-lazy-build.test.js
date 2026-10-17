import {expect,test,vi} from 'vitest'
import {readFileSync} from 'node:fs'
import {financialLazyLoaders} from '../scripts/financial-lazy-build.mjs'
import {crearCargadorFinanciero} from '../src/financial/lazy-loader.js'

test('loaders derive every key exclusively from the canonical resource registry',()=>{
 const source=readFileSync('src/financial/assets.js','utf8')
 const generated=financialLazyLoaders(source)
 expect((generated.match(/=>import\(/g)||[]).length).toBe(89)
 expect(generated).not.toContain('data:image')
 expect(()=>financialLazyLoaders(source.replace('assetPixCompact,','missingBinding,'))).toThrow('Invalid canonical')
 expect(()=>financialLazyLoaders('export const ASSETS = {}')).toThrow('Missing canonical')
})

test('one resource promise is shared, failures reject and explicit retry can recover',async()=>{
 let reject
 const failing=vi.fn(()=>new Promise((_,r)=>{reject=r}))
 const load=crearCargadorFinanciero({key:failing})
 const first=load('key')
 expect(load('key')).toBe(first)
 expect(failing).toHaveBeenCalledTimes(1)
 reject(new Error('offline'))
 await expect(first).rejects.toThrow('offline')
 failing.mockImplementation(()=>Promise.resolve('data:image/png;base64,AA'))
 await expect(load('key')).resolves.toBe('data:image/png;base64,AA')
 expect(failing).toHaveBeenCalledTimes(2)
 await expect(load('__proto__')).resolves.toBeNull()
 await expect(load('unknown')).resolves.toBeNull()
})
