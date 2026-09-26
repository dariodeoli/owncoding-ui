import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  MENSAJE_RUC,
  TaxIdField,
  limpiarTaxId,
  normalizeTaxId,
  taxIdGenericoValid,
  taxIdValid,
  taxIdValidoParaPais,
} from '../src/index.js'

// RUC paraguayo y documento genérico: la lógica pura y el contrato de render
// del campo que la app usa (la consulta de razón social es un callback suyo).

describe('taxId: validación y normalización', () => {
  test('el RUC PY va de 5 a 8 dígitos con verificador opcional', () => {
    for (const valido of ['80012345-6', '80012345', '12345', '12345678-1']) {
      expect(taxIdValid(valido)).toBe(true)
    }
    for (const invalido of ['1234', '123456789', '80012345-67', '8001234a', '80012345--6', '', '   ']) {
      expect(taxIdValid(invalido)).toBe(false)
    }
    expect(taxIdValid(undefined)).toBe(false)
    expect(MENSAJE_RUC).toContain('5 a 8 dígitos')
  })

  test('normalizeTaxId saca puntos y espacios, conserva el guion', () => {
    expect(normalizeTaxId('800.12345-6')).toBe('80012345-6')
    expect(normalizeTaxId(' 80012345-6 ')).toBe('80012345-6')
    expect(normalizeTaxId('J-12345678-9')).toBe('J-12345678-9')
    expect(normalizeTaxId('   ')).toBe(null)
    expect(normalizeTaxId(null)).toBe(null)
    expect(normalizeTaxId(12345678)).toBe(null)
  })

  test('limpiarTaxId descarta lo que el documento no admite', () => {
    expect(limpiarTaxId('80012345-6')).toBe('80012345-6')
    expect(limpiarTaxId('80012🙂345')).toBe('80012345')
    expect(limpiarTaxId('800.12345-6', 6)).toBe('800.12')
  })

  test('el documento genérico acepta letras y separadores', () => {
    expect(taxIdGenericoValid('J-12345678-9')).toBe(true)
    expect(taxIdGenericoValid('900.123.456-7')).toBe(true)
    expect(taxIdGenericoValid('ab')).toBe(false)
  })

  test('cada país elige su patrón y la comparación no distingue mayúsculas', () => {
    expect(taxIdValidoParaPais('80012345-6')).toBe(true)
    expect(taxIdValidoParaPais('80012345-6', 'py')).toBe(true)
    expect(taxIdValidoParaPais('J-12345678-9', 'py')).toBe(false)
    expect(taxIdValidoParaPais('J-12345678-9', 'VE')).toBe(true)
  })
})

describe('TaxIdField', () => {
  test('renderiza label, valor, teclado numérico y hint enlazados', () => {
    const html = renderToStaticMarkup(
      <TaxIdField id="ruc-empresa" label="RUC" value="80012345-6" hint="Sin puntos" required onChange={() => {}} />,
    )
    expect(html).toContain('>RUC<')
    expect(html).toContain('for="ruc-empresa"')
    expect(html).toContain('value="80012345-6"')
    expect(html).toMatch(/inputmode="numeric"/i)
    expect(html).toContain('required')
    expect(html).toContain('aria-describedby="ruc-empresa-descripcion"')
    expect(html).toContain('id="ruc-empresa-descripcion"')
    expect(html).toContain('Sin puntos')
  })

  test('el error se anuncia y queda descrito por el campo', () => {
    const html = renderToStaticMarkup(
      <TaxIdField id="ruc-empresa" value="800" error="RUC inválido" onChange={() => {}} />,
    )
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('role="alert"')
    expect(html).toContain('id="ruc-empresa-descripcion"')
    expect(html).toContain('RUC inválido')
  })

  test('el documento genérico cambia el teclado y el ejemplo', () => {
    const html = renderToStaticMarkup(<TaxIdField value="J-12345678-9" pais="VE" onChange={() => {}} />)
    expect(html).toMatch(/inputmode="text"/i)
    expect(html).not.toContain('80012345-6')
  })

  test('sin callback no hay consulta; con callback el botón va dentro del campo', () => {
    const soloCampo = renderToStaticMarkup(<TaxIdField value="80012345-6" onChange={() => {}} />)
    expect(soloCampo).not.toContain('Consultar RUC')

    const conConsulta = renderToStaticMarkup(
      <TaxIdField value="80012345-6" onChange={() => {}} onBuscarRazonSocial={async () => 'ACME S.A.'} onAplicarRazonSocial={() => {}} />,
    )
    expect(conConsulta).toContain('Consultar RUC')
    expect(conConsulta).toContain('absolute inset-y-0 right-0')
    expect(conConsulta).toContain('pr-11')

    const vacio = renderToStaticMarkup(<TaxIdField value="" onChange={() => {}} onBuscarRazonSocial={async () => null} />)
    expect(vacio).toContain('disabled')
  })
})
