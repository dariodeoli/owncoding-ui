// Reglas del shell v2 (#241): la navegación accesible que DSN midió sobre el
// shell real vive en la biblioteca (base.css, scope `tema-v2`) para que las
// apps puedan retirar su bloque local `.v2-piloto` sin perder AA. Si alguien
// borra una regla, este test lo frena.
import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'

const base = readFileSync(new URL('../src/styles/base.css', import.meta.url), 'utf8')
const distStyles = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8')

describe('shell v2 en la biblioteca', () => {
  test('la navegación usa el azul de acción AA sobre su tinte en ambos temas', () => {
    expect(base).toContain('.tema-v2 nav [aria-current="page"]')
    expect(base).toContain('.tema-v2 nav [aria-pressed="true"]')
    expect(base).toContain('background: rgb(var(--c-info) / .14)')
    expect(base).toContain('.dark .tema-v2 button.bg-fono\\/15.text-fono-light')
    expect(base).toContain('.dark .tema-v2 [role="tab"][aria-selected="true"]')
    expect(base).toContain('background: rgb(var(--c-info) / .2)')
  })

  test('los rótulos de grupo van en verde sólido, con hook portable', () => {
    expect(base).toContain('.tema-v2 nav button[aria-expanded] > span')
    expect(base).toContain('.tema-v2 .oc-rotulo-grupo')
    expect(base).toContain('color: rgb(var(--c-fono-light))')
  })

  test('el foco visible se ve en cada tema', () => {
    expect(base).toContain('outline: 2px solid rgb(var(--c-fono-dark))')
    expect(base).toContain('html.dark :focus-visible')
    expect(base).toContain('outline-color: var(--oc-brand)')
  })

  test('el scope v2 aprieta los números y las píldoras de contenido', () => {
    expect(base).toContain('.tema-v2 .v2-chip')
    expect(base).toContain('.tema-v2 .tabular-nums')
    expect(base).toContain('.dark .tema-v2 .v2-chip.text-mute')
  })

  test('las reglas viajan al styles.css publicado', () => {
    expect(distStyles).toContain('.tema-v2 nav [aria-current="page"]')
    expect(distStyles).toContain('.oc-rotulo-grupo')
  })
})
