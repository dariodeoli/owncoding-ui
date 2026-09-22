import { describe, expect, test } from 'vitest'

import {
  fechaCorta,
  fechaDia,
  fechaHora,
  fechaHoraCorta,
  fechaValida,
  formatGs,
  formatUsd,
  internationalPhone,
  montoGs,
  montoTexto,
  montoUsd,
  parseGsInput,
  parsePercent,
  parseUsdInput,
  primerNombre,
  telefonoVisible,
  telefonoValido,
  whatsappUrl,
  cn,
} from '../src/index.js'

describe('lógica compartida', () => {
  test('cn resuelve conflictos de Tailwind', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe('text-sm font-bold')
  })

  test('montos en la presentación dominante', () => {
    expect(formatGs(1201032)).toBe('Gs 1.201.032')
    expect(formatUsd(1234.5)).toBe('USD 1.234,50')
    expect(montoGs(1201032)).toBe('Gs 1.201.032')
    expect(montoUsd(1234.56)).toBe('US$ 1,234.56')
    expect(montoTexto('1234.5', 'USD')).toBe('US$ 1,234.5')
    expect(montoTexto(null)).toBe('—')
    expect(montoGs(0)).toBe('Gs 0')
  })

  test('montos de entrada: PYG entero y USD con 2 decimales', () => {
    expect(parseGsInput('Gs 1.201.032')).toBe(1201032)
    expect(parseUsdInput('1.234,50')).toBe('1234.5')
  })

  test('un valor inválido no se muestra como 0', () => {
    expect(montoTexto(undefined)).toBe('—')
    expect(montoTexto('nada', 'USD', '')).toBe('')
  })

  test('porcentajes con coma', () => {
    expect(parsePercent('12,5')).toBe(12.5)
    expect(parsePercent('nada')).toBe(null)
    expect(parsePercent('')).toBe(null)
  })

  test('fechas en 24 h y sin “Invalid Date”', () => {
    const fecha = new Date(2026, 8, 17, 15, 30)
    expect(fechaHora(fecha)).toContain('15:30')
    expect(fechaHora('nada')).toBe('—')
    expect(fechaDia('2026-09-17T12:00:00')).toMatch(/17/)
    expect(fechaHoraCorta(fecha)).toContain('15:30')
    expect(fechaCorta(fecha)).toContain('·')
    expect(fechaValida('nada')).toBe(null)
  })

  test('teléfono y WhatsApp', () => {
    expect(internationalPhone('0981123456')).toBe('595981123456')
    expect(telefonoVisible('0981123456')).toBe('+595 981 123 456')
    expect(telefonoValido('981123456')).toBe(true)
    expect(whatsappUrl('0981123456', 'Hola Ana')).toBe('https://wa.me/595981123456?text=Hola%20Ana')
    expect(whatsappUrl('', 'Hola')).toBe('')
  })

  test('primer nombre', () => {
    expect(primerNombre('Dario De Oliveira')).toBe('Dario')
    expect(primerNombre('')).toBe('')
  })
})
