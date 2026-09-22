// Tablero kanban (lote LedBox): columnas con contador, tarjetas con chips y
// pie, arrastre + «Mover a…» y los helpers puros del pipeline.
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  TableroKanban,
  agruparTarjetas,
  columnasDelTablero,
  destinosDeTarjeta,
  useTableroOptimista,
} from '../src/index.js'

const COLUMNAS = [
  { valor: 'borrador', titulo: 'Borrador', tono: 'mute' },
  { valor: 'enviado', titulo: 'Enviado', tono: 'info' },
  { valor: 'aprobado', titulo: 'Aprobado', tono: 'ok' },
]

const TARJETAS = [
  {
    id: 'p1',
    estado: 'enviado',
    titulo: 'Presupuesto Ana',
    subtitulo: 'Ana Giménez',
    monto: 1250000,
    montoNota: 'seña',
    fecha: '2026-09-30',
    chips: [{ etiqueta: 'Portal', tono: 'info' }],
    detalle: '3 equipos',
    destinos: ['borrador', 'aprobado'],
  },
  { id: 'p2', estado: 'borrador', titulo: 'Presupuesto Luis', subtitulo: 'Luis Rojas' },
]

describe('TableroKanban', () => {
  test('columnas con contador, tarjetas con datos y vacío por columna', () => {
    const html = renderToStaticMarkup(<TableroKanban etiqueta="Presupuestos" columnas={COLUMNAS} tarjetas={TARJETAS} />)
    expect(html).toContain('aria-label="Presupuestos"')
    expect(html).toContain('Borrador: 1')
    expect(html).toContain('Enviado: 1')
    expect(html).toContain('Aprobado: 0')
    expect(html).toContain('Sin tarjetas')
    expect(html).toContain('Presupuesto Ana')
    expect(html).toContain('Ana Giménez')
    expect(html).toContain('Gs 1.250.000')
    expect(html).toContain('seña')
    expect(html).toContain('30/9/2026')
    expect(html).toContain('Portal')
    expect(html).toContain('3 equipos')
    // Sin `onMover`/`puedeMover` no hay arrastre ni menú: el tablero es de lectura.
    expect(html).not.toContain('draggable="true"')
    expect(html).not.toContain('Mover a…')
  })

  test('con permiso hay arrastre HTML5 y «Mover a…» accesible por teclado', () => {
    const html = renderToStaticMarkup(<TableroKanban columnas={COLUMNAS} tarjetas={[TARJETAS[0]]} puedeMover onMover={() => {}} />)
    expect(html).toContain('draggable="true"')
    expect(html).toContain('Mover a…')
    expect(html).toContain('Mover Presupuesto Ana a otro estado')
    expect(html).toContain('>Aprobado</option>')
    expect(html).toContain('>Borrador</option>')
    // El estado actual no se ofrece como destino.
    expect(html).not.toContain('>Enviado</option>')
  })

  test('un estado sin columna declarada se dibuja igual (no se ocultan filas)', () => {
    const html = renderToStaticMarkup(<TableroKanban columnas={COLUMNAS} tarjetas={[...TARJETAS, { id: 'p3', estado: 'perdido', titulo: 'Presupuesto viejo' }]} />)
    expect(html).toContain('perdido: 1')
    expect(html).toContain('Presupuesto viejo')
  })

  test('los helpers del pipeline son puros y estables', () => {
    expect(typeof useTableroOptimista).toBe('function')
    expect(columnasDelTablero(COLUMNAS, TARJETAS).map((columna) => columna.valor)).toEqual(['borrador', 'enviado', 'aprobado'])
    expect(columnasDelTablero(COLUMNAS, [...TARJETAS, { id: 'x', estado: 'perdido' }]).map((columna) => columna.valor)).toEqual(['borrador', 'enviado', 'aprobado', 'perdido'])
    expect(agruparTarjetas(COLUMNAS, TARJETAS).enviado.map((tarjeta) => tarjeta.id)).toEqual(['p1'])
    expect(agruparTarjetas(COLUMNAS, TARJETAS).aprobado).toEqual([])
    expect(destinosDeTarjeta(TARJETAS[0], COLUMNAS)).toEqual(['borrador', 'aprobado'])
    expect(destinosDeTarjeta({ id: 'p2', estado: 'borrador' }, COLUMNAS)).toEqual(['enviado', 'aprobado'])
    expect(destinosDeTarjeta({ id: 'p3', estado: 'borrador', destinos: [] }, COLUMNAS)).toEqual([])
  })
})
