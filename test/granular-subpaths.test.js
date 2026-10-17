import { existsSync, readFileSync } from 'node:fs'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import { measureClosure } from '../scripts/bundle-closure.mjs'
import { describe, expect, test } from 'vitest'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

const entradas = {
  './ia': ['ia', false],
  './phone': ['phone', true],
  './financial': ['financial', true],
  './financial-lazy': ['financial-lazy', true],
  './core': ['core', true],
  './financial-metadata': ['financial-metadata', false],
  './app-identity': ['app-identity', false],
  './numeric': ['numeric', true],
  './number-utils': ['number-utils', false],
  './email': ['email', false],
}

describe('subpaths granulares publicados', () => {
  test.each(Object.entries(entradas))('%s publica JS y tipos con la frontera correcta', (subpath, [archivo, cliente]) => {
    expect(pkg.exports[subpath]).toEqual({
      types: `./dist/${archivo}.d.ts`,
      default: `./dist/${archivo}.js`,
    })
    const js = new URL(`../dist/${archivo}.js`, import.meta.url)
    const tipos = new URL(`../dist/${archivo}.d.ts`, import.meta.url)
    expect(existsSync(js)).toBe(true)
    expect(existsSync(tipos)).toBe(true)
    expect(readFileSync(js, 'utf8').startsWith('"use client"')).toBe(cliente)
  })

  test('only visual reachable closures carry authorized artwork, shared once physically', async () => {
    const root = await measureClosure('dist/index.js')
    const financial = await measureClosure('dist/financial.js')
    for (const entry of ['utils', 'financial-metadata', 'ia', 'app-identity', 'email', 'number-utils']) {
      const closure = await measureClosure(`dist/${entry}.js`, { pure: true })
      expect(closure.files.every(file => !file.source.includes('data:image/'))).toBe(true)
    }
    const artwork = financial.files.filter(file => /data:image\/[\w.+-]+;base64,[A-Za-z0-9+/]{16}/.test(file.source))
    expect(artwork.length).toBeGreaterThan(1)
    expect(root.files.filter(file => /data:image\/[\w.+-]+;base64,[A-Za-z0-9+/]{16}/.test(file.source)).map(file => file.file).sort()).toEqual(artwork.map(file => file.file).sort())
    // Excepción derivada de la clausura pura auditada; jamás por nombre de chunk.
    const pure = await measureClosure('dist/number-utils.js', { pure: true })
    const resources = [], values = []
    for (const file of financial.files) {
      const exports = Object.values(await import(pathToFileURL(file.file).href))
      if (exports.length && exports.every(value => typeof value === 'string' && value.startsWith('data:image/'))) {
        resources.push(file)
        values.push(...exports)
        expect(file.source).not.toMatch(/from["'](?:react|react-dom)/)
      }
    }
    expect(values).toHaveLength(89)
    const baseline = JSON.parse(readFileSync('test/fixtures/financial-lazy-legacy.json','utf8'))
    expect(values.map(value => createHash('sha256').update(value).digest('hex')).sort()).toEqual(Object.values(baseline.assets).sort())
    const purePaths = new Set([...pure.files,...resources].map(file => file.file))
    for (const file of [...root.files, ...financial.files]) expect(file.source.startsWith('"use client"')).toBe(!purePaths.has(file.file))
  })

  test('los módulos publicados exponen contratos representativos', async () => {
    const [ia, phone, financiero, metadata, identidad] = await Promise.all([
      import('../dist/ia.js'),
      import('../dist/phone.js'),
      import('../dist/financial.js'),
      import('../dist/financial-metadata.js'),
      import('../dist/app-identity.js'),
    ])
    expect(ia.motorIA).toBeTypeOf('function')
    expect(phone.PhoneField).toBeTypeOf('function')
    expect(financiero.BancoLogo).toBeTypeOf('function')
    expect(financiero.logoDeBanco('ueno')?.visual?.asset).toMatch(/^data:image\//)
    expect(financiero.logoDeBanco('ueno')?.redistribucion).toMatchObject({ permitida: true, evidencia: 'docs/financial-assets-manifest.json' })
    expect(financiero.relacionFinancieraDe('Mango')?.financialProvider).toBe('Tu Financiera')
    expect(metadata.logoDeBanco('ueno')?.visual?.asset).toBeUndefined()
    expect(metadata.relacionFinancieraDe('App Vaquita')?.operador?.nombreLegal).toBe('MUTECH S.R.L.')
    expect(metadata.sugerenciasDeMarcaPago('Banco Familiar')).toEqual(['EKO'])
    expect(identidad.crearIdentidadApp({ nombre: 'App', version: '1.0.0' }).etiquetaVersion).toBe('v1.0.0')
  })
})
