// Abastecimiento F1 (#250): prioridades, estados, contadores y la tarjeta de
// necesidad del panel «Por comprar».
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  ChipOrigen,
  ChipPrioridad,
  ContadoresCompra,
  ESTADOS_NECESIDAD,
  ORIGENES_NECESIDAD,
  PASOS_NECESIDAD,
  PRIORIDADES_COMPRA,
  TarjetaNecesidad,
  claveDeEstado,
  claveDePrioridad,
  colorDeTono,
  etiquetaNecesidad,
  etiquetaOrigen,
  etiquetaPrioridad,
  iconoOrigen,
  ordenarPorPrioridad,
  tonoNecesidad,
  tonoOrigen,
  tonoPrioridad,
} from '../src/index.js'

describe('abastecimiento F1', () => {
  test('prioridades del contrato (URGENTE/ALTA/NORMAL/BAJA) con alias de la UI', () => {
    expect(Object.keys(PRIORIDADES_COMPRA)).toEqual(['urgente', 'alta', 'normal', 'baja'])
    expect(etiquetaPrioridad('URGENTE')).toBe('Urgente')
    expect(tonoPrioridad('urgente')).toBe('bad')
    expect(claveDePrioridad('ALTA')).toBe('alta')
    expect(etiquetaPrioridad('media')).toBe('Normal')
    expect(etiquetaPrioridad('desconocida')).toBe('Normal')
    const ordenadas = ordenarPorPrioridad([{ id: 1, prioridad: 'BAJA' }, { id: 2, prioridad: 'URGENTE' }, { id: 3 }])
    expect(ordenadas.map((n) => n.id)).toEqual([2, 3, 1])
  })

  test('orígenes con etiqueta, tono e ícono (y clave libre en mute)', () => {
    expect(Object.keys(ORIGENES_NECESIDAD)).toContain('sale_no_stock')
    expect(etiquetaOrigen('SALE_NO_STOCK')).toBe('Venta sin stock')
    expect(tonoOrigen('sale_no_stock')).toBe('warn')
    expect(iconoOrigen('RESERVATION_NO_STOCK')).toBe('clock')
    expect(etiquetaOrigen('CDE')).toBe('CDE')
    expect(tonoOrigen('CDE')).toBe('mute')
  })

  test('estados del contrato con alias de la UI', () => {
    for (const clave of ['ABIERTA', 'ASIGNADA', 'COMPRADA', 'RECIBIDA', 'CANCELADA']) {
      expect(ESTADOS_NECESIDAD[claveDeEstado(clave)], `falta ${clave}`).toBeTruthy()
    }
    expect(etiquetaNecesidad('ABIERTA')).toBe('Por comprar')
    expect(etiquetaNecesidad('por_comprar')).toBe('Por comprar')
    expect(claveDeEstado('COMPRADA')).toBe('comprada')
    expect(tonoNecesidad('incidencia')).toBe('bad')
    expect(etiquetaNecesidad('inexistente')).toBe('Por comprar')
    expect(PASOS_NECESIDAD[0]).toBe('abierta')
    expect(colorDeTono('ok')).toBe('green')
    expect(colorDeTono('x')).toBe('slate')
  })

  test('ChipOrigen pinta el ícono y el tono del origen', () => {
    const html = renderToStaticMarkup(<ChipOrigen origen="SALE_NO_STOCK" />)
    expect(html).toContain('Venta sin stock')
    expect(html).toContain('text-warn')
    expect(html).toContain('<svg')
  })

  test('ChipPrioridad pinta el tono y acepta etiqueta propia', () => {
    const urgente = renderToStaticMarkup(<ChipPrioridad prioridad="URGENTE" />)
    expect(urgente).toContain('Urgente')
    expect(urgente).toContain('text-bad')
    expect(urgente).toContain('Prioridad urgente')
    expect(renderToStaticMarkup(<ChipPrioridad prioridad="alta" />)).toContain('text-warn')
    expect(renderToStaticMarkup(<ChipPrioridad prioridad="baja" etiqueta="Sin apuro" />)).toContain('Sin apuro')
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
        prioridad="URGENTE"
        estado="ABIERTA"
        origen="SALE_NO_STOCK"
        centro="CDE"
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
    expect(html).toContain('Urgente')
    expect(html).toContain('Por comprar')
    expect(html).toContain('Venta sin stock')
    expect(html).toContain('CDE')
    expect(html).toContain('Pedido MOB-0042')
    expect(html).toContain('El cliente confirmó color')
    expect(html).toContain('data-estado="ABIERTA"')
    const conAbrir = renderToStaticMarkup(<TarjetaNecesidad producto="X" onAbrir={() => {}} acciones={<button>Abrir</button>} />)
    expect(conAbrir).toContain('<button')
    expect(conAbrir).toContain('Abrir')
  })
})
