import React from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import { describe, expect, test } from 'vitest'
import MedioPagoLogo from '../src/components/MedioPagoLogo.jsx'

// CSS layout is independently checked in the browser; these assertions prevent
// loss of the containment contract or recurrence of the known undersized slot.
describe('payment logo frame containment', () => {
  test.each(['Bancard', 'Dinelco', 'upay', 'Pik'])('%s keeps both original variants centered and bounded', (marca) => {
    for (const variante of ['compacto', 'horizontal']) {
      const document = new JSDOM(renderToStaticMarkup(<MedioPagoLogo marca={marca} variante={variante} alto={variante === 'compacto' ? 'h-11' : 'h-7'} />)).window.document
      const container = document.querySelector('[data-logo-variante]')
      const image = container.querySelector('img')
      expect(container.classList).toContain('justify-center')
      expect(container.classList).toContain('max-w-full')
      expect(container.classList).toContain('max-h-full')
      expect(image.classList).toContain('object-contain')
      // La vista óptica recorta la tinta dentro de una caja que nunca excede el
      // slot: overflow oculto, se encoge con flex y su alto es una fracción <= 1.
      const caja = container.querySelector('[data-logo-optico]')
      expect(caja.classList).toContain('overflow-hidden')
      expect(caja.classList).toContain('min-w-0')
      expect(caja.classList).toContain('shrink')
      expect(parseFloat(caja.style.height)).toBeLessThanOrEqual(100)
      expect(image.getAttribute('src')).toMatch(/compacto|horizontal/)
    }
  })

  test('fixed compact slot leaves room for the 44px logo plus border and internal padding', () => {
    const css = readFileSync('gallery/styles.css', 'utf8')
    expect(css).toContain('grid-template-columns: 3.5rem minmax(0, 1fr)')
    expect(css).toContain('.payment-peer-grid__compact { width: 3.5rem; height: 3.5rem; }')
    expect(css).toContain('box-sizing: border-box')
    expect(css).toContain('max-height: 100%; object-fit: contain;')
    expect(3.5 * 16 - 2 * 0.25 * 16 - 2).toBeGreaterThanOrEqual(44)
    expect(css).toContain('.payment-peer-grid { grid-template-columns: minmax(0, 1fr); }')
  })
})
