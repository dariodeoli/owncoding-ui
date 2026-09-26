import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { MoneyInput, caretTrasDigitos, normalizarMontoInput } from '../src/index.js'

// Caret estable y pegado de montos (cosecha de ScaleOS, #2). La lógica vive en
// `utils/moneda.js`; el campo la usa para no saltar al final al editar en el medio.

describe('normalizarMontoInput', () => {
  test('PYG: enteros, separadores y cero a la izquierda', () => {
    expect(normalizarMontoInput('1.234.567', 'PYG')).toBe('1234567')
    expect(normalizarMontoInput('1234567', 'PYG')).toBe('1234567')
    expect(normalizarMontoInput('1.234', 'PYG')).toBe('1234')
    expect(normalizarMontoInput('007', 'PYG')).toBe('7')
    // Un separador corta: PYG no tiene centavos y lo de después se descarta.
    expect(normalizarMontoInput('0,5', 'PYG')).toBe('0')
    expect(normalizarMontoInput('1.234,50', 'PYG')).toBe('1234')
    // Tipear más allá del separador continúa el entero (1.2345 → 12345).
    expect(normalizarMontoInput('1.2345', 'PYG')).toBe('12345')
  })

  test('USD: pegado es-PY, en-US y decimal suelto', () => {
    expect(normalizarMontoInput('1.250,50', 'USD')).toBe('1250.50')
    expect(normalizarMontoInput('1,250.50', 'USD')).toBe('1250.50')
    expect(normalizarMontoInput('1250.50', 'USD')).toBe('1250.50')
    expect(normalizarMontoInput('1.250', 'USD')).toBe('1250')
    expect(normalizarMontoInput('1,234', 'USD')).toBe('1234')
    expect(normalizarMontoInput('1.234.567', 'USD')).toBe('1234567')
    expect(normalizarMontoInput('0,5', 'USD')).toBe('0.5')
    expect(normalizarMontoInput('10,', 'USD')).toBe('10.')
    expect(normalizarMontoInput('', 'USD')).toBe('')
  })

  test('integerOnly fuerza enteros en cualquier moneda', () => {
    expect(normalizarMontoInput('1.250,50', 'USD', { integerOnly: true })).toBe('1250')
    expect(normalizarMontoInput('12,5', 'USD', { integerOnly: true })).toBe('12')
  })

  test('caretTrasDigitos deja el cursor después del dígito editado', () => {
    expect(caretTrasDigitos('1.234.567', 0)).toBe(0)
    expect(caretTrasDigitos('1.234.567', 2)).toBe(3)
    expect(caretTrasDigitos('1.234', 4)).toBe(5)
    expect(caretTrasDigitos('1.234', 99)).toBe(5)
  })
})

describe('MoneyInput', () => {
  test('PYG agrupa los miles y usa teclado numérico', () => {
    const html = renderToStaticMarkup(<MoneyInput value={1234567} onValueChange={() => {}} />)
    expect(html).toContain('value="1.234.567"')
    expect(html).toContain('inputMode="numeric"')
  })

  test('USD muestra 2 decimales es-PY', () => {
    const html = renderToStaticMarkup(<MoneyInput currency="USD" value="1250.5" onValueChange={() => {}} />)
    expect(html).toContain('value="1.250,50"')
    expect(html).toContain('inputMode="decimal"')
  })

  test('integerOnly recorta los decimales y pide enteros', () => {
    const html = renderToStaticMarkup(<MoneyInput currency="USD" integerOnly value="1250.99" onValueChange={() => {}} />)
    expect(html).toContain('value="1.250"')
    expect(html).toContain('inputMode="numeric"')
  })

  test('el campo usa la normalización y el caret compartidos', () => {
    const fuente = readFileSync(new URL('../src/components/ui.jsx', import.meta.url), 'utf8')
    expect(fuente).toContain('normalizarMontoInput(input.value')
    expect(fuente).toContain('caretTrasDigitos(nodo.value')
    expect(fuente).toContain('requestAnimationFrame')
  })
})
