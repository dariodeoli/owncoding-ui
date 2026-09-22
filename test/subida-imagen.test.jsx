// Subida de imagen (lote LedBox): validación pura por firma real y tamaño,
// render del campo con vista previa/limpiar y compresión sólo en navegador.
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  MIMES_IMAGEN,
  SubidaImagen,
  TAMANO_MAXIMO_IMAGEN,
  mimeDeImagen,
  prepararImagen,
  validarImagen,
} from '../src/index.js'

const FIRMAS = {
  jpg: new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]),
  png: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]),
  webp: new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]),
  pdf: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]),
}

describe('SubidaImagen', () => {
  test('el tipo real se detecta por magic bytes', () => {
    expect(mimeDeImagen(FIRMAS.jpg)).toBe('image/jpeg')
    expect(mimeDeImagen(FIRMAS.png)).toBe('image/png')
    expect(mimeDeImagen(FIRMAS.webp)).toBe('image/webp')
    expect(mimeDeImagen(FIRMAS.pdf)).toBe(null)
    expect(mimeDeImagen(new Uint8Array(0))).toBe(null)
    expect(MIMES_IMAGEN).toEqual(['image/jpeg', 'image/png', 'image/webp'])
  })

  test('la validación rechaza vacío, tamaño y tipo', () => {
    expect(validarImagen({ size: 1200, type: 'image/png' })).toEqual({ ok: true })
    expect(validarImagen({ size: 0, type: 'image/png' }).error).toContain('vacío')
    expect(validarImagen({ size: TAMANO_MAXIMO_IMAGEN + 1, type: 'image/png' }).error).toContain('supera')
    expect(validarImagen({ size: 1200, type: 'application/pdf' }).error).toContain('JPG, PNG, WebP')
    expect(validarImagen({ size: 1200, type: 'image/gif' }).ok).toBe(false)
  })

  test('preparar la imagen fuera del navegador no rompe: devuelve el motivo', async () => {
    const resultado = await prepararImagen({ size: 1200, type: 'image/png', slice: () => ({ arrayBuffer: async () => FIRMAS.png.buffer }) })
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toContain('navegador')
  })

  test('el campo con imagen muestra la vista previa y el limpiar', () => {
    const html = renderToStaticMarkup(
      <SubidaImagen
        etiqueta="Logo de la empresa"
        descripcion="Se ve en el portal y en los impresos."
        valor="data:image/png;base64,AAAA"
        onImagen={() => {}}
        onLimpiar={() => {}}
      />,
    )
    expect(html).toContain('Logo de la empresa')
    expect(html).toContain('Se ve en el portal y en los impresos.')
    expect(html).toContain('data:image/png;base64,AAAA')
    expect(html).toContain('Cambiar imagen')
    expect(html).toContain('aria-label="Quitar imagen"')
    expect(html).toContain('accept=".jpg,.png,.webp"')
  })

  test('el campo vacío invita a arrastrar y el error se anuncia', () => {
    const vacio = renderToStaticMarkup(<SubidaImagen etiqueta="Foto" onImagen={() => {}} />)
    expect(vacio).toContain('Subir imagen')
    expect(vacio).toContain('Arrastrá una imagen')
    expect(vacio).toContain('type="file"')
    expect(vacio).not.toContain('Quitar imagen')
    const error = renderToStaticMarkup(<SubidaImagen etiqueta="Foto" error="El API rechazó la imagen." onImagen={() => {}} />)
    expect(error).toContain('role="alert"')
    expect(error).toContain('El API rechazó la imagen.')
  })
})
