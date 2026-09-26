import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { Icon, TEMA_CLARO, TEMA_OSCURO, ThemeToggle, aplicarTema } from '../src/index.js'

// Tema claro/oscuro: el control alterna la clase `dark` de <html>, persiste en
// localStorage con clave configurable y se anuncia con etiquetas de acción.

const fuente = readFileSync(new URL('../src/components/ThemeToggle.jsx', import.meta.url), 'utf8')
const reglas = readFileSync(new URL('../docs/REGLAS.md', import.meta.url), 'utf8')

describe('ThemeToggle', () => {
  test('renderiza el contrato accesible y la luna en claro (SSR)', () => {
    const html = renderToStaticMarkup(<ThemeToggle />)
    expect(html).toContain('aria-label="Cambiar a modo oscuro"')
    expect(html).toContain('title="Cambiar a modo oscuro"')
    expect(html).toContain('aria-pressed="false"')
    expect(html).toContain('M20 14.6A8.6 8.6 0 0 1 9.4 4') // luna: la acción es ir a oscuro
    expect(html).not.toContain('M16 12a4 4 0 1 1-8 0')
  })

  test('las etiquetas se configuran por prop', () => {
    const html = renderToStaticMarkup(<ThemeToggle etiquetaOscuro="Ir al modo oscuro" etiquetaClaro="Ir al modo claro" />)
    expect(html).toContain('Ir al modo oscuro')
    expect(html).not.toContain('Cambiar a modo oscuro')
  })

  test('el control aplica la clase `dark` y persiste con la clave de la app', () => {
    expect(fuente).toContain("classList.toggle('dark'")
    expect(fuente).toContain('window.localStorage.setItem(clave')
    expect(fuente).toContain('if (clave)')
    expect(fuente).toContain('useSyncExternalStore')
  })

  test('los iconos de tema viven en Icon', () => {
    expect(renderToStaticMarkup(<Icon name="sun" />)).toContain('M16 12a4 4 0 1 1-8 0')
    expect(renderToStaticMarkup(<Icon name="moon" />)).toContain('M20 14.6A8.6 8.6 0 0 1 9.4 4')
  })

  test('la API exportada y la regla documentada', () => {
    expect(typeof aplicarTema).toBe('function')
    expect(TEMA_CLARO).toBe('claro')
    expect(TEMA_OSCURO).toBe('oscuro')
    expect(reglas).toContain('`ThemeToggle` es el único control de tema')
    expect(reglas).toContain('`aplicarTema(tema, clave)`')
  })
})
