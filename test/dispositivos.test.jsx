import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  BuscadorDispositivo,
  CONECTIVIDADES_MOVIL,
  PERFILES_DISPOSITIVO,
  buscarDispositivo,
  etiquetaDispositivo,
  limpiarDependientes,
  opcionesDependiente,
} from '../src/index.js'

// Buscador dependiente de dispositivos (#241/#250): el modelo manda y las
// variantes dependen de él, configurables por tipo de tienda.
describe('catálogo de dispositivos', () => {
  const MODELOS = [
    { nombre: 'iPhone 17 Pro', codigo: 'IP17P', capacidades: ['256 GB', '512 GB'], colores: ['Titanio azul'] },
    { nombre: 'iPhone 17', codigo: 'IP17' },
    'iPhone 16',
  ]

  test('busca por nombre y por código, tolerando acentos y mayúsculas', () => {
    expect(buscarDispositivo(MODELOS, 'iPhone 17').map((m) => m.nombre || m)).toEqual(['iPhone 17 Pro', 'iPhone 17'])
    expect(buscarDispositivo(MODELOS, 'ip17p').map((m) => m.nombre)).toEqual(['iPhone 17 Pro'])
    expect(buscarDispositivo(MODELOS, 'ip17').map((m) => m.nombre || m)).toEqual(['iPhone 17 Pro', 'iPhone 17'])
    expect(buscarDispositivo(MODELOS, 'IPHONE 16')).toEqual(['iPhone 16'])
    expect(buscarDispositivo(MODELOS, 'nada')).toEqual([])
    expect(buscarDispositivo(MODELOS, '', { limite: 2 })).toHaveLength(2)
  })

  test('las opciones propias del modelo mandan sobre el catálogo del perfil', () => {
    const perfil = PERFILES_DISPOSITIVO.mobile
    expect(opcionesDependiente(MODELOS[0], 'capacidad', perfil)).toEqual(['256 GB', '512 GB'])
    expect(opcionesDependiente(MODELOS[1], 'capacidad', perfil)).toContain('128 GB')
    expect(opcionesDependiente(MODELOS[1], 'conectividad', perfil)).toEqual(CONECTIVIDADES_MOVIL)
  })

  test('cambiar de modelo limpia los dependientes que ya no aplican', () => {
    const perfil = PERFILES_DISPOSITIVO.mobile
    const valor = { modelo: 'iPhone 17 Pro', capacidad: '256 GB', color: 'Titanio azul', conectividad: '5G' }
    expect(limpiarDependientes(valor, 'iPhone 17', perfil)).toEqual({ modelo: 'iPhone 17', capacidad: '', color: '', conectividad: '' })
    const mismo = limpiarDependientes({ modelo: 'iPhone 17 Pro', capacidad: '256 GB', color: 'Rojo' }, MODELOS[0], perfil)
    expect(mismo.color).toBe('') // «Rojo» no está entre los colores de ese modelo
    expect(mismo.capacidad).toBe('256 GB')
  })

  test('la etiqueta del dispositivo arma el nombre completo', () => {
    expect(etiquetaDispositivo({ modelo: 'iPhone 17', capacidad: '256 GB', color: 'Azul', conectividad: '5G' })).toBe('iPhone 17 · 256 GB · Azul · 5G')
    expect(etiquetaDispositivo({ modelo: 'iPhone 17' })).toBe('iPhone 17')
    expect(etiquetaDispositivo({})).toBe('')
  })
})

describe('BuscadorDispositivo', () => {
  test('con modelo elegido despliega los dependientes del perfil mobile', () => {
    const html = renderToStaticMarkup(<BuscadorDispositivo valor={{ modelo: 'iPhone 17', capacidad: '256 GB' }} />)
    expect(html).toContain('role="combobox"')
    expect(html).toContain('value="iPhone 17"')
    expect(html).toContain('Capacidad')
    expect(html).toContain('Color')
    expect(html).toContain('Conectividad')
    expect(html).toContain('<select')
    expect(html).toContain('128 GB')
    expect(html).toContain('value="256 GB"')
  })

  test('el perfil de accesorios pide marca y categoría (sin capacidad)', () => {
    const html = renderToStaticMarkup(<BuscadorDispositivo tipo="accesorios" valor={{ modelo: 'Funda MagSafe' }} />)
    expect(html).toContain('Marca')
    expect(html).toContain('Categoría')
    expect(html).not.toContain('Capacidad')
  })

  test('el perfil de servicio no pide conectividad', () => {
    const html = renderToStaticMarkup(<BuscadorDispositivo tipo="servicio" valor={{ modelo: 'iPhone 15' }} />)
    expect(html).toContain('Capacidad')
    expect(html).toContain('Color')
    expect(html).not.toContain('Conectividad')
  })

  test('sin modelo no despliega dependientes', () => {
    const html = renderToStaticMarkup(<BuscadorDispositivo valor={{}} />)
    expect(html).not.toContain('<select')
    expect(html).toContain('Modelo')
  })

  test('el catálogo propio pisa el predeterminado', () => {
    const html = renderToStaticMarkup(
      <BuscadorDispositivo
        valor={{ modelo: 'Pixel 9' }}
        catalogo={{ modelos: [{ nombre: 'Pixel 9', codigo: 'PX9', capacidades: ['128 GB', '256 GB'] }] }}
      />,
    )
    expect(html).toContain('value="Pixel 9"')
    expect(html).toContain('128 GB')
  })
})
