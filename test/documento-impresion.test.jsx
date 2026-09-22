// Documento imprimible A4 (lote LedBox): encabezado emisor/receptor, meta,
// detalle, liquidación con IVA por tasa, notas, pie y reglas de impresión.
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'

import { DocumentoImpresion } from '../src/index.js'

// Las reglas `@media print` viajan con la base opt-in (`base.css`); `styles.css`
// las incluye al concatenar tokens + base.
const styles = readFileSync(new URL('../src/styles/base.css', import.meta.url), 'utf8')

const DOC = {
  titulo: 'Presupuesto',
  numero: '0001-0000123',
  emisor: { nombre: 'Tienda Demo S.A.', documento: '80012345-6', direccion: 'Asunción', telefono: '+595 981 123 456', correo: 'hola@demo.com' },
  receptor: { nombre: 'Cliente E2E', documento: '1234567-8', telefono: '+595 971 000 000' },
  meta: [
    { etiqueta: 'Emitido', valor: '22/9/2026 10:30' },
    { etiqueta: 'Válido hasta', valor: '30/9/2026' },
  ],
  estado: 'Aprobado',
  estadoTono: 'ok',
  detalle: [
    { cantidad: 2, concepto: 'Alquiler de parlante', unitario: 250000, subtotal: 500000, nota: 'Incluye cables' },
    { cantidad: 1, concepto: 'Flete', unitario: 100000, subtotal: 100000 },
  ],
  liquidacion: { subtotal: 600000, descuento: 50000, iva: [{ tasa: 10, base: 550000, monto: 55000 }], total: 605000 },
  notas: 'El pago se confirma con el comprobante.',
  pie: 'ledbox.online · Documento generado desde el panel',
}

describe('DocumentoImpresion', () => {
  test('la hoja trae emisor, receptor, número, meta y estado', () => {
    const html = renderToStaticMarkup(<DocumentoImpresion {...DOC} />)
    expect(html).toContain('oc-print-hoja')
    expect(html).toContain('Tienda Demo S.A.')
    expect(html).toContain('80012345-6')
    expect(html).toContain('Cliente E2E')
    expect(html).toContain('N.º 0001-0000123')
    expect(html).toContain('Emitido')
    expect(html).toContain('22/9/2026 10:30')
    expect(html).toContain('Aprobado')
    expect(html).toContain('border-ok/30')
  })

  test('el detalle y la liquidación usan Money, con descuento negativo e IVA por tasa', () => {
    const html = renderToStaticMarkup(<DocumentoImpresion {...DOC} />)
    expect(html).toContain('Alquiler de parlante')
    expect(html).toContain('Incluye cables')
    expect(html).toContain('Gs 250.000')
    expect(html).toContain('Gs 500.000')
    expect(html).toContain('Subtotal')
    expect(html).toContain('Gs 600.000')
    expect(html).toContain('Descuento')
    expect(html).toContain('− ')
    expect(html).toContain('Gs 50.000')
    expect(html).not.toContain('Gs -50.000')
    expect(html).toContain('IVA 10%')
    expect(html).toContain('sobre')
    expect(html).toContain('Gs 550.000')
    expect(html).toContain('Total')
    expect(html).toContain('Gs 605.000')
    expect(html).toContain('El pago se confirma con el comprobante.')
    expect(html).toContain('ledbox.online · Documento generado desde el panel')
  })

  test('el botón de imprimir es opcional y queda fuera del papel', () => {
    const conBoton = renderToStaticMarkup(<DocumentoImpresion titulo="Factura" onImprimir={() => {}} />)
    expect(conBoton).toContain('oc-print-oculto')
    expect(conBoton).toContain('>Imprimir<')
    const sinBoton = renderToStaticMarkup(<DocumentoImpresion titulo="Factura" />)
    expect(sinBoton).not.toContain('oc-print-oculto')
    expect(sinBoton).toContain('Sin ítems cargados')
  })

  test('la moneda y los textos se pueden ajustar por props', () => {
    const html = renderToStaticMarkup(
      <DocumentoImpresion
        titulo="Factura"
        moneda="USD"
        detalle={[{ cantidad: 1.5, concepto: 'Soporte', unitario: 80, subtotal: 120 }]}
        liquidacion={{ total: 120 }}
      />,
    )
    expect(html).toContain('US$ 80')
    expect(html).toContain('US$ 120')
    expect(html).toContain('1,5')
  })

  test('las reglas de impresión viven en el CSS de la librería', () => {
    expect(styles).toContain('@media print')
    expect(styles).toContain('@page { size: A4; margin: 14mm 12mm; }')
    expect(styles).toContain('.oc-print-oculto { display: none !important; }')
    expect(styles).toContain('.oc-print-hoja')
    expect(styles).toContain('break-inside: avoid')
  })
})
