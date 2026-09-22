import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  CATEGORIAS_ACCESORIOS,
  CIUDADES_PARAGUAY,
  CityAutocomplete,
  DEPARTAMENTOS_PARAGUAY,
  MODELOS_IPHONE,
  TAMANOS_CAMPO,
  anchoParaLargo,
  buscarCiudad,
  buscarEnCatalogo,
  departamentoDe,
  paginaDePrueba,
  paginaDePruebaSimple,
} from '../src/index.js'

describe('ciudades y departamentos', () => {
  test('el catálogo trae los 263 municipios y 18 departamentos', () => {
    expect(CIUDADES_PARAGUAY.length).toBe(263)
    expect(DEPARTAMENTOS_PARAGUAY.length).toBe(18)
    expect(DEPARTAMENTOS_PARAGUAY).toContain('Itapúa')
  })

  test('el departamento se resuelve solo desde la ciudad', () => {
    expect(departamentoDe('Encarnación')).toBe('Itapúa')
    expect(departamentoDe('encarnacion')).toBe('Itapúa')
    expect(departamentoDe('Ciudad del Este')).toBe('Alto Paraná')
    expect(departamentoDe('Ciudad Inventada')).toBe('')
    expect(departamentoDe('')).toBe('')
  })

  test('las sugerencias priorizan las coincidencias al principio', () => {
    const filas = buscarCiudad('asunc')
    expect(filas[0]).toEqual({ city: 'Asunción', department: 'Asunción' })
    expect(buscarCiudad('a')).toEqual([])
    expect(buscarCiudad('itapúa').length).toBeGreaterThan(3)
  })

  test('el campo de ciudad renderiza el combobox', () => {
    const html = renderToStaticMarkup(<CityAutocomplete value="Encarnación" onSelect={() => {}} />)
    expect(html).toContain('role="combobox"')
    expect(html).toContain('value="Encarnación"')
  })
})

describe('catálogos de productos y tamaños', () => {
  test('hay modelos de iPhone y categorías de accesorios por defecto', () => {
    expect(MODELOS_IPHONE).toContain('iPhone 17 Pro Max')
    expect(MODELOS_IPHONE.length).toBeGreaterThan(30)
    expect(CATEGORIAS_ACCESORIOS).toContain('Fundas')
    expect(buscarEnCatalogo(MODELOS_IPHONE, '16 pro')).toContain('iPhone 16 Pro')
    expect(buscarEnCatalogo(MODELOS_IPHONE, '')).toHaveLength(MODELOS_IPHONE.length)
  })

  test('los tamaños recomendados existen y son clases de ancho', () => {
    expect(TAMANOS_CAMPO.moneda).toBe('w-36')
    expect(TAMANOS_CAMPO.porcentaje).toBe('w-24')
    expect(anchoParaLargo(6)).toBe('w-28')
    expect(anchoParaLargo(30)).toBe('w-56')
    expect(anchoParaLargo(90)).toBe('w-full')
  })
})

describe('página de prueba de impresora', () => {
  test('arma el ticket de prueba con la validación y el pie auditable', () => {
    const prueba = paginaDePrueba({ tipo: 'pedido', ancho: 80, impresora: 'lan:192.168.1.50:9100', nombre: 'Mostrador', usuario: 'Ana' })
    const lineas = prueba.lineas().join('\n')
    expect(prueba.validador).toMatch(/^\d{4}-\d$/)
    expect(lineas).toContain('TICKET DE PRUEBA')
    expect(lineas).toContain('Ticket de pedido')
    expect(lineas).toContain(`VALIDACIÓN ${prueba.validador}`)
    expect(lineas).toContain('Mostrador')
    expect(lineas).toContain('LAN (TCP directo)')
    expect(lineas).toContain('Ana')
    expect(prueba.base64()).toEqual(expect.any(String))
  })

  test('la prueba corta y la simple usan los tipos esperados', () => {
    expect(paginaDePruebaSimple().lineas().join('\n')).toContain('Caracteres y formato')
    expect(paginaDePrueba({ tipo: 'corte' }).lineas().join('\n')).toContain('Corte físico por variantes')
  })
})
