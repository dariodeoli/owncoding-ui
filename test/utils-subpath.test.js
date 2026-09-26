// Entrada pura `owncoding-ui/utils`: la misma lógica compartida sin React y
// sin el banner `"use client"`, para server components, route handlers y
// scripts de Next. Verifica que el paquete la publique, que el build la genere
// sin directiva de cliente y que no se despegue de la entrada principal ni de
// sus declaraciones.
import { describe, expect, test } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import * as puro from '../src/utils/index.js'
import * as todo from '../src/index.js'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const fuente = readFileSync(new URL('../src/utils/index.js', import.meta.url), 'utf8')
const dts = readFileSync(new URL('../types/utils.d.ts', import.meta.url), 'utf8')
const dist = new URL('../dist/utils.js', import.meta.url)
const distDts = new URL('../dist/utils.d.ts', import.meta.url)
const distIndex = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8')

const declarado = (nombre) =>
  new RegExp(`export (function|const|type|interface|class) ${nombre}\\b`).test(dts)

describe('owncoding-ui/utils (entrada pura)', () => {
  test('package.json publica el subpath con tipos y JS', () => {
    expect(pkg.exports['./utils']).toEqual({
      types: './dist/utils.d.ts',
      default: './dist/utils.js',
    })
  })

  test('el build genera dist/utils.js sin "use client" ni React', () => {
    expect(existsSync(dist)).toBe(true)
    expect(existsSync(distDts)).toBe(true)
    expect(readFileSync(distDts, 'utf8')).toBe(dts)
    // El bundle principal sigue siendo de cliente; el de utils no.
    expect(distIndex.startsWith('"use client"')).toBe(true)
    const utils = readFileSync(dist, 'utf8')
    expect(utils.startsWith('"use client"')).toBe(false)
    expect(utils).not.toMatch(/from\s*"react"/)
    expect(utils).not.toMatch(/jsx-runtime/)
    // La fuente tampoco importa React ni componentes.
    expect(fuente).not.toMatch(/from 'react'/)
    expect(fuente).not.toMatch(/components\//)
  })

  test('cada export del runtime tiene su declaración en types/utils.d.ts', () => {
    const nombres = Object.keys(puro)
    expect(nombres.length).toBeGreaterThan(100)
    for (const nombre of nombres) {
      expect(declarado(nombre), `falta el tipo de ${nombre}`).toBe(true)
    }
  })

  test('la entrada pura es un subconjunto exacto de la principal', () => {
    for (const [nombre, valor] of Object.entries(puro)) {
      expect(todo[nombre], `${nombre} no sale por owncoding-ui`).toBeDefined()
      expect(valor).toBe(todo[nombre])
    }
  })
})
