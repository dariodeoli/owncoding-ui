import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  Avatar,
  COLORES_AVATAR,
  TAMANOS_AVATAR,
  claveColorDeNombre,
  colorDeNombre,
  inicialesDeNombre,
} from '../src/index.js'

// Smoke de la identidad: iniciales, color estable y caída a iniciales cuando no
// hay imagen o la imagen falla. El objeto no inventa fotos ni nombres.

describe('iniciales y color del avatar', () => {
  test('iniciales de personas, empresas y vacíos', () => {
    expect(inicialesDeNombre('Ana Pérez')).toBe('AP')
    expect(inicialesDeNombre('juan carlos de la cruz')).toBe('JC')
    expect(inicialesDeNombre('LedBox S.A.')).toBe('LS')
    expect(inicialesDeNombre('LedBox')).toBe('L')
    expect(inicialesDeNombre('')).toBe('—')
    expect(inicialesDeNombre(null)).toBe('—')
  })

  test('el color es estable y sale de la paleta del avatar', () => {
    expect(claveColorDeNombre('Ana Pérez')).toBe(claveColorDeNombre('Ana Pérez'))
    expect(Object.keys(COLORES_AVATAR)).toContain(claveColorDeNombre('Ana Pérez'))
    const clases = colorDeNombre('Ana Pérez')
    expect(clases).toContain('bg-')
    expect(clases).toContain('text-')
  })
})

describe('Avatar', () => {
  test('persona: iniciales, color derivado y etiqueta accesible', () => {
    const html = renderToStaticMarkup(<Avatar nombre="Ana Pérez" />)
    expect(html).toContain('AP')
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Ana Pérez"')
    expect(html).toContain('rounded-full')
    expect(html).toContain(TAMANOS_AVATAR.md)
    expect(html).not.toContain('<img')
  })

  test('con imagen: la <img> usa la URL y no repite el texto', () => {
    const html = renderToStaticMarkup(<Avatar nombre="Ana Pérez" src="https://cdn.test/ana.png" />)
    expect(html).toContain('src="https://cdn.test/ana.png"')
    expect(html).toContain('object-cover')
    expect(html).not.toContain('>AP<')
  })

  test('empresa: cuadrado redondeado y tamaño grande', () => {
    const html = renderToStaticMarkup(<Avatar nombre="LedBox S.A." empresa tamano="lg" />)
    expect(html).toContain('LS')
    expect(html).toContain('rounded-lg')
    expect(html).toContain(TAMANOS_AVATAR.lg)
  })

  test('decorativo: sin rol ni etiqueta (el nombre ya está al lado)', () => {
    const html = renderToStaticMarkup(<Avatar nombre="Ana Pérez" decorativo />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('role="img"')
  })

  test('title y ariaLabel se pueden pisar', () => {
    const html = renderToStaticMarkup(<Avatar nombre="Ana Pérez" title="Ana P." ariaLabel="Perfil de Ana" />)
    expect(html).toContain('title="Ana P."')
    expect(html).toContain('aria-label="Perfil de Ana"')
  })
})
