import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { FormulariosPro, Input, Switch } from '../src/index.js'

const BASE = readFileSync(join(process.cwd(), 'src/styles/base.css'), 'utf8')
const TOKENS = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8')

function token(bloque, nombre) {
  const m = new RegExp(`--c-${nombre}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)`).exec(bloque)
  if (!m) throw new Error(`Falta --c-${nombre}`)
  return m.slice(1).map(Number)
}
const lum = ([r, g, b]) => {
  const f = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

describe('foco del Switch (#30)', () => {
  test('el anillo es sólido en las dos olas (el opacado medía menos de 3:1)', () => {
    const ola1 = renderToStaticMarkup(<Switch ariaLabel="a" checked={false} onChange={() => {}} />)
    const ola2 = renderToStaticMarkup(<FormulariosPro><Switch ariaLabel="a" checked={false} onChange={() => {}} /></FormulariosPro>)
    for (const marcado of [ola1, ola2]) {
      expect(marcado).toContain('peer-focus-visible:ring-fono-dark')
      expect(marcado).not.toMatch(/peer-focus-visible:ring-fono(?:-dark)?\/\d+/)
    }
  })

  test('fono-dark contra el fondo y el hueco del anillo ≥3:1 con los tokens por defecto', () => {
    const [claro, oscuro] = [TOKENS.slice(TOKENS.indexOf(':root {'), TOKENS.indexOf('html.dark {')), TOKENS.slice(TOKENS.indexOf('html.dark {'))]
    for (const bloque of [claro, oscuro]) {
      const anillo = token(bloque, 'fono-dark')
      expect(contraste(anillo, token(bloque, 'paper'))).toBeGreaterThanOrEqual(3)
      expect(contraste(anillo, token(bloque, 'ink'))).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('spinners con prefers-reduced-motion (#30)', () => {
  test('el CSS global corta el giro a una sola iteración instantánea: queda el anillo parcial quieto', () => {
    const reducido = [...BASE.matchAll(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n')
    expect(reducido).toMatch(/animation-duration: \.01ms !important/)
    expect(reducido).toMatch(/animation-iteration-count: 1 !important/)
  })

  test('el spinner es un anillo con el cuarto superior transparente (se lee como «cargando» sin girar) y el estado va en aria-busy', () => {
    const marcado = renderToStaticMarkup(<Input cargando aria-label="RUC" />)
    expect(marcado).toContain('aria-busy="true"')
    expect(marcado).toMatch(/data-oc-spinner=""[^>]*class="[^"]*border-2 border-current border-t-transparent/)
    expect(marcado).toMatch(/<span aria-hidden="true" data-oc-spinner/)
  })
})
