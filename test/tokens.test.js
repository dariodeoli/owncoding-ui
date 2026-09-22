// Tokens del tema v2 del piloto (#241): el CSS y el preset tienen que seguir
// ofreciendo el scope claro/oscuro y el verde pass, para que las pantallas del
// piloto no mantengan su propio bloque.
import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'

const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
const preset = readFileSync(new URL('../tailwind-preset.js', import.meta.url), 'utf8')

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
