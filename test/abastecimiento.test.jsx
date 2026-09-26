// Abastecimiento F1 (#250): prioridades, estados, contadores y la tarjeta de
// necesidad del panel «Por comprar».
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  ChipPrioridad,
  ContadoresCompra,
  ESTADOS_NECESIDAD,
  PASOS_NECESIDAD,
  PRIORIDADES_COMPRA,
  TarjetaNecesidad,
  colorDeTono,
  etiquetaNecesidad,
  etiquetaPrioridad,
  ordenarPorPrioridad,
  tonoNecesidad,
  tonoPrioridad,
} from '../src/index.js'

describe('abastecimiento F1', () => {
  test('prioridades: etiqueta, tono y orden (con fallback en media)', () => {
    expect(Object.keys(PRIORIDADES_COMPRA)).toEqual(['alta', 'media', 'baja'])
    expect(etiquetaPrioridad('alta')).toBe('Alta')
    expect(tonoPrioridad('alta')).toBe('bad')
    expect(etiquetaPrioridad('desconocida')).toBe('Media')
    const ordenadas = ordenarPorPrioridad([{ id: 1, prioridad: 'baja' }, { id: 2, prioridad: 'alta' }, { id: 3 }])
    expect(ordenadas.map((n) => n.id)).toEqual([2, 3, 1])
  })

  test('estados: etiqueta y tono con las claves del panel', () => {
    for (const clave of ['por_comprar', 'comprando', 'comprado', 'preparar_envio', 'en_transito', 'recepcion', 'incidencia', 'cancelada']) {
      expect(ESTADOS_NECESIDAD[clave], `falta ${clave}`).toBeTruthy()
    }
    expect(etiquetaNecesidad('por_comprar')).toBe('Por comprar')
    expect(tonoNecesidad('incidencia')).toBe('bad')
    expect(etiquetaNecesidad('inexistente')).toBe('Por comprar')
    expect(PASOS_NECESIDAD[0]).toBe('por_comprar')
    expect(colorDeTono('ok')).toBe('green')
    expect(colorDeTono('x')).toBe('slate')
  })

  test('ChipPrioridad pinta el tono y acepta etiqueta propia', () => {
    const alta = renderToStaticMarkup(<ChipPrioridad prioridad="alta" />)
    expect(alta).toContain('Alta')
    expect(alta).toContain('text-bad')
    expect(alta).toContain('Prioridad alta')
    expect(renderToStaticMarkup(<ChipPrioridad prioridad="baja" etiqueta="Urgente" />)).toContain('Urgente')
  })

  test('ContadoresCompra: números tabulares, sin negativos', () => {
    const texto = renderToStaticMarkup(<ContadoresCompra pendiente={4} comprado={1} faltan={3} />)
    expect(texto).toContain('4')
    expect(texto).toContain('pendiente')
    expect(texto).toContain('faltan')
    expect(texto).toContain('text-bad')
    const chips = renderToStaticMarkup(<ContadoresCompra variante="chips" pendiente={-2} faltan={0} />)
    expect(chips).toContain('>0<')
    expect(chips).not.toContain('>-2<')
  })

  test('TarjetaNecesidad compone producto, prioridad, estado, fecha y destinos', () => {
    const html = renderToStaticMarkup(
      <TarjetaNecesidad
        producto="iPhone 15 Pro"
        variante="256 GB · Titanio natural · Nuevo"
        prioridad="alta"
        estado="por_comprar"
        origen="CDE"
        fechaPrometida="2026-09-30"
        vinculo={{ etiqueta: 'Pedido MOB-0042' }}
        destinos={[{ etiqueta: 'Pedido MOB-0042', cantidad: 1 }, { etiqueta: 'stock', cantidad: 3 }]}
        pendiente={4}
        comprado={1}
        faltan={3}
        observaciones="El cliente confirmó color"
      />,
    )
    expect(html).toContain('iPhone 15 Pro')
    expect(html).toContain('256 GB')
    expect(html).toContain('Alta')
    expect(html).toContain('Por comprar')
    expect(html).toContain('CDE')
    expect(html).toContain('Pedido MOB-0042')
    expect(html).toContain('El cliente confirmó color')
    expect(html).toContain('data-estado="por_comprar"')
    const conAbrir = renderToStaticMarkup(<TarjetaNecesidad producto="X" onAbrir={() => {}} acciones={<button>Abrir</button>} />)
    expect(conAbrir).toContain('<button')
    expect(conAbrir).toContain('Abrir')
  })
})
