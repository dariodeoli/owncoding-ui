import { describe, expect, test } from 'vitest'

import {
  CATEGORIAS_PRODUCTO,
  ICONO_CATEGORIA,
  LOCKS_DISPOSITIVO,
  TONOS,
  UMBRAL_BATERIA_ATENCION,
  UMBRAL_BATERIA_OK,
  categoriaDe,
  colorBadge,
  estadoChip,
  estadoItem,
  estadoLock,
  etiquetaDeCategoria,
  gradoCondicion,
  iconoDeCategoria,
  tonoBateria,
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
  normalizarNombre,
  esRazonSocial,
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
    // Una fecha pura (`YYYY-MM-DD`, como los `dueAt` del API) es el día local:
    // no se corre al día anterior por la medianoche UTC.
    expect(fechaDia('2026-09-30')).toContain('30/9/2026')
    expect(fechaDia('2026-12-31')).toContain('31/12/2026')
    expect(fechaValida('2026-09-31')).toBe(null)
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

  test('nombres de personas y razones sociales', () => {
    // El formato SIFEN "apellidos primero" en mayúsculas se reordena…
    expect(normalizarNombre('PEREZ GOMEZ JUAN CARLOS', { apellidosPrimero: 'sifen' })).toBe('Juan Carlos Perez Gomez')
    // …pero una razón social se respeta tal cual, sin reordenar ni capitalizar.
    for (const razon of ['DISTRIBUIDORA DEL SUR S.A.', 'IMPORTADORA GUARANÍ S.R.L.', 'COOPERATIVA LA UNION LTDA.']) {
      expect(normalizarNombre(razon, { apellidosPrimero: 'sifen' })).toBe(razon)
      expect(esRazonSocial(razon)).toBe(true)
    }
    expect(esRazonSocial('PEREZ GOMEZ JUAN CARLOS')).toBe(false)
  })

  test('estados de la operación de equipos (#240/#241)', () => {
    expect(estadoItem('aviso').tono).toBe('warn')
    expect(estadoItem('nada').etiqueta).toBe('Sin verificar')
    expect(estadoChip('pass').tono).toBe('pass')
    expect(estadoChip('falla').etiqueta).toBe('Con fallas')
    expect(Object.keys(LOCKS_DISPOSITIVO)).toEqual(['icloud', 'mdm', 'esn', 'carrier', 'oem'])
    expect(estadoLock('libre').tono).toBe('ok')
    expect(estadoLock('activo').tono).toBe('bad')
    expect(tonoBateria(100)).toBe('ok')
    expect(tonoBateria(UMBRAL_BATERIA_OK - 1)).toBe('warn')
    expect(tonoBateria(UMBRAL_BATERIA_ATENCION - 1)).toBe('bad')
    expect(tonoBateria('')).toBe('mute')
    expect(gradoCondicion('b').tono).toBe('warn')
    expect(gradoCondicion('Z')).toBe(null)
    expect(colorBadge('pass')).toBe('green')
    expect(TONOS.chip.bad).toContain('border-bad/30')
  })

  test('categorías de producto con icono (#242)', () => {
    expect(ICONO_CATEGORIA).toEqual({
      iphone: 'mobile', macbook: 'laptop', ipad: 'tablet', watch: 'watch',
      airpods: 'buds', accesorios: 'cable', servicio: 'wrench', otro: 'box',
    })
    expect(categoriaDe('MacBook Pro 14')).toBe('macbook')
    expect(categoriaDe('CELULAR')).toBe('iphone')
    expect(categoriaDe('Apple Watch')).toBe('watch')
    expect(categoriaDe('AirPods Pro')).toBe('airpods')
    expect(categoriaDe('Funda iPhone 15')).toBe('accesorios')
    expect(categoriaDe('Cable USB-C')).toBe('accesorios')
    expect(categoriaDe('Servicio técnico')).toBe('servicio')
    expect(categoriaDe('ZZZ')).toBe('otro')
    expect(iconoDeCategoria('iPad Air')).toBe('tablet')
    expect(etiquetaDeCategoria('auriculares')).toBe('AirPods')
  })
})
