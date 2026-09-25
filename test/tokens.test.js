// Tokens del lenguaje v2 (#241): promovidos a **globales** en la ronda .21, con
// el scope del piloto como alias temporal. El CSS y el preset tienen que seguir
// ofreciendo el claro AA y el oscuro consola, más el verde pass y el azul de
// acción, para que las pantallas no mantengan su propio bloque.
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

describe('tokens v2 globales (con alias del piloto)', () => {
  test('la paleta global es la del v2, clara y oscura', () => {
    expect(tokens).toContain('--c-paper: 241 244 248') // lienzo claro con profundidad
    expect(tokens).toContain('--c-fore: 14 17 22')
    expect(tokens).toContain('--c-info: 32 89 190') // azul acción AA en claro
    expect(tokens).toContain('--c-ok: 22 101 52') // ok de texto AA en claro
    expect(tokens).toContain('--c-paper: 14 17 22') // consola oscura #0E1116
    expect(tokens).toContain('--c-ink: 31 36 48') // panel #1F2430
    expect(tokens).toContain('--c-ink-600: 213 220 230') // borde claro
    expect(tokens).toContain('--c-fono-soft: 236 253 245') // tinte de marca
    expect(tokens).toContain('--c-info: 159 184 255') // azul AA en oscuro
    expect(tokens).toContain('html.dark {')
  })

  test('la profundidad viaja en sombras por tema (#241)', () => {
    expect(tokens).toContain('--oc-shadow-card:')
    expect(tokens).toContain('--oc-shadow-float:')
    const preset = readFileSync(new URL('../tailwind-preset.js', import.meta.url), 'utf8')
    expect(preset).toContain("card: 'var(--oc-shadow-card)'")
    expect(preset).toContain("float: 'var(--oc-shadow-float)'")
  })

  test('el scope del piloto queda como alias temporal, sin overrides', () => {
    const alias = tokens.slice(tokens.indexOf('.tema-v2,\n.v2-piloto {'), tokens.indexOf('.tema-v2 .v2-numero,'))
    expect(alias).not.toContain('--c-')
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
