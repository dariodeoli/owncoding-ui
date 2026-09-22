// Tokens del tema v2 del piloto (#241): el CSS y el preset tienen que seguir
// ofreciendo el scope claro/oscuro y el verde pass, para que las pantallas del
// piloto no mantengan su propio bloque.
//
// Además, la separación pedida por el piloto de LedBox: `tokens.css` (solo
// variables, importable por una app con diseño propio), `base.css` (la base
// global opt-in) y `styles.css` (las dos, compatible con v0.13.1).
import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'

const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
const base = readFileSync(new URL('../src/styles/base.css', import.meta.url), 'utf8')
const hoja = readFileSync(new URL('../src/styles/styles.css', import.meta.url), 'utf8')
const distTokens = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8')
const distBase = readFileSync(new URL('../dist/base.css', import.meta.url), 'utf8')
const distStyles = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8')
const preset = readFileSync(new URL('../tailwind-preset.js', import.meta.url), 'utf8')
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

describe('tokens del tema v2 (piloto)', () => {
  test('el scope v2 existe con alias del piloto y las dos variantes', () => {
    expect(tokens).toContain('.tema-v2,\n.v2-piloto {')
    expect(tokens).toContain('--c-paper: 246 248 251') // claro
    expect(tokens).toContain('html.dark .tema-v2,')
    expect(tokens).toContain('--c-paper: 14 17 22') // consola oscura
    expect(tokens).toContain('--c-info: 77 124 254') // azul acción
    expect(tokens).toContain('.tema-v2 .v2-numero')
  })

  test('el verde pass y el azul acción están en cualquier tema', () => {
    expect(tokens).toContain('--c-pass: 22 197 94')
    expect(tokens).toContain('--c-pass-dark: 26 141 79')
    expect(tokens).toContain('--c-accion: 77 124 254')
    expect(preset).toContain('pass:')
    expect(preset).toContain('accion:')
  })
})

describe('hojas separadas: tokens.css, base.css y styles.css', () => {
  test('tokens.css es solo variables: no toca el documento', () => {
    expect(tokens).toContain(':root {')
    expect(tokens).toContain('html.dark {')
    expect(tokens).not.toContain('body {')
    expect(tokens).not.toContain(':focus-visible')
    expect(tokens).not.toContain('.oc-print')
  })

  test('base.css es la base global opt-in (tipografías, foco y hoja A4)', () => {
    expect(base).toContain('html {')
    expect(base).toContain('body {')
    expect(base).toContain('h1, h2, h3, nav, button, label')
    expect(base).toContain(':focus-visible')
    expect(base).toContain('.oc-print')
    expect(base).toContain(`@media print`)
    // El PIN de `PinInput` oculta los dígitos reales (clase que antes faltaba).
    expect(base).toContain('.pin-oculto')
  })

  test('styles.css importa las dos (compatibilidad con v0.13.1)', () => {
    expect(hoja).toContain("@import './tokens.css'")
    expect(hoja).toContain("@import './base.css'")
  })

  test('el paquete publica las tres hojas y dist queda sincronizado', () => {
    expect(pkg.exports['./styles.css']).toBe('./dist/styles.css')
    expect(pkg.exports['./tokens.css']).toBe('./dist/tokens.css')
    expect(pkg.exports['./base.css']).toBe('./dist/base.css')

    expect(distTokens).toBe(tokens)
    expect(distBase).toBe(base)
    // `styles.css` sale autocontenido del build: tokens + base concatenadas.
    expect(distStyles).toBe(`${tokens.trimEnd()}\n\n${base}`)
    expect(distStyles).toContain(':root {')
    expect(distStyles).toContain('body {')
  })
})
