// QR compartido (#240): opciones por defecto, valor vacío y overrides.
import { describe, expect, test } from 'vitest'
import { QR_OPCIONES, qrDataUrl } from '../src/index.js'

describe('qrDataUrl', () => {
  test('un valor genera un data URL de imagen y el vacío no genera nada', async () => {
    const imagen = await qrDataUrl('https://moboss.online/u/DEMO0001')
    expect(imagen.startsWith('data:image/png;base64,')).toBe(true)
    expect(await qrDataUrl('')).toBe('')
    expect(await qrDataUrl('   ')).toBe('')
    expect(await qrDataUrl(null)).toBe('')
    expect(await qrDataUrl(undefined)).toBe('')
  })

  test('las opciones por defecto son las de la app y se pueden pisar', async () => {
    expect(QR_OPCIONES).toEqual({ nivel: 'M', margen: 1, ancho: 220 })
    const chico = await qrDataUrl('https://moboss.online/u/DEMO0001', { ancho: 120 })
    const grande = await qrDataUrl('https://moboss.online/u/DEMO0001', { ancho: 320, nivel: 'H', margen: 2 })
    expect(grande.length).toBeGreaterThan(chico.length)
  })
})
