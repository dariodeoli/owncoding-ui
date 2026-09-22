// Plan de pagos (lote LedBox): anticipo, cuotas con estado, «a transferir
// ahora», total, saldo y condiciones. Montos Int PYG con `Money`.
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { ESTADOS_CUOTA, PlanPagos } from '../src/index.js'

const CUOTAS = [
  { id: 'c1', etiqueta: 'Cuota 1', monto: 500000, vence: '2026-10-05', estado: 'pagada' },
  { id: 'c2', etiqueta: 'Cuota 2', monto: 500000, vence: '2026-11-05', estado: 'pendiente' },
  { id: 'c3', etiqueta: 'Cuota 3', monto: 500000, vence: '2026-12-05', estado: 'revision' },
]

describe('PlanPagos', () => {
  test('anticipo, cuotas con vencimiento y estado, y total al pie', () => {
    const html = renderToStaticMarkup(
      <PlanPagos
        anticipo={300000}
        anticipoVence="2026-09-25"
        cuotas={CUOTAS}
        total={1800000}
        totalEtiqueta="Total del presupuesto"
        saldoSinCuota={0}
      />,
    )
    expect(html).toContain('Anticipo')
    expect(html).toContain('25/9/2026')
    expect(html).toContain('Gs 300.000')
    expect(html).toContain('Cuota 1')
    expect(html).toContain('5/10/2026')
    expect(html).toContain('Pagada')
    expect(html).toContain('text-pass')
    expect(html).toContain('En revisión')
    expect(html).toContain('Total del presupuesto')
    expect(html).toContain('Gs 1.800.000')
  })

  test('«a transferir ahora» se destaca y marca la cuota que corresponde', () => {
    const html = renderToStaticMarkup(
      <PlanPagos cuotas={CUOTAS} aTransferir={{ id: 'c2', etiqueta: 'Cuota 2', monto: 500000 }} total={1500000} />,
    )
    expect(html).toContain('A transferir ahora')
    expect(html).toContain('border-fono/40 bg-fono/10')
    expect(html).toContain('Cuota 2')
  })

  test('saldo sin cuota y condiciones del plan', () => {
    const html = renderToStaticMarkup(
      <PlanPagos cuotas={CUOTAS} saldoSinCuota={150000} condiciones="Vence a los 30 días de la entrega." />,
    )
    expect(html).toContain('Saldo sin cuota agendada')
    expect(html).toContain('Gs 150.000')
    expect(html).toContain('Vence a los 30 días de la entrega.')
    expect(html).toContain('border-info/25')
  })

  test('sin plan avisa con el vacío real, no con una tabla fantasma', () => {
    const vacio = renderToStaticMarkup(<PlanPagos />)
    expect(vacio).toContain('El presupuesto se paga en un solo pago.')
    expect(vacio).not.toContain('<table')
    expect(renderToStaticMarkup(<PlanPagos total={0} />)).toContain('Gs 0')
    expect(ESTADOS_CUOTA.pagada.chip).toBe('pass')
    expect(ESTADOS_CUOTA.cancelada.tono).toBe('mute')
  })

  test('la moneda del plan se elige por prop', () => {
    const html = renderToStaticMarkup(<PlanPagos cuotas={[{ etiqueta: 'Cuota 1', monto: 1200, estado: 'pendiente' }]} total={1200} moneda="USD" />)
    expect(html).toContain('US$ 1,200')
  })
})
