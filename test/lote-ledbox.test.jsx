// Smoke conjunto del primer lote de objetos genéricos (LedBox): los seis
// renderizan juntos en el servidor, sin fetch, sin router y sin estado de app.
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  Cronologia,
  DocumentoImpresion,
  PlanPagos,
  ProgresoChecklist,
  SubidaImagen,
  TableroKanban,
} from '../src/index.js'

describe('lote de objetos genéricos', () => {
  test('los seis objetos renderizan juntos', () => {
    const html = renderToStaticMarkup(
      <div>
        <ProgresoChecklist hechas={2} total={4} />
        <TableroKanban
          etiqueta="Presupuestos"
          columnas={[{ valor: 'borrador', titulo: 'Borrador' }, { valor: 'enviado', titulo: 'Enviado' }]}
          tarjetas={[{ id: 'p1', estado: 'borrador', titulo: 'Presupuesto Ana', monto: 1250000 }]}
        />
        <Cronologia hitos={[{ id: 'a', fecha: '2026-09-22T10:30:00', tipo: 'creado', titulo: 'Presupuesto creado' }]} />
        <PlanPagos cuotas={[{ etiqueta: 'Cuota 1', monto: 500000, estado: 'pendiente' }]} total={500000} />
        <SubidaImagen etiqueta="Logo" onImagen={() => {}} />
        <DocumentoImpresion
          titulo="Presupuesto"
          numero="0001"
          emisor={{ nombre: 'Tienda Demo' }}
          receptor={{ nombre: 'Cliente E2E' }}
          detalle={[{ cantidad: 1, concepto: 'Alquiler', unitario: 500000, subtotal: 500000 }]}
          liquidacion={{ subtotal: 500000, total: 500000 }}
        />
      </div>,
    )
    for (const texto of ['2 de 4 tareas', 'Presupuesto Ana', 'Gs 1.250.000', 'Presupuesto creado', 'Cuota 1', 'Subir imagen', 'Cliente E2E', 'oc-print-hoja']) {
      expect(html).toContain(texto)
    }
  })
})
