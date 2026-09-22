// Progreso de checklist (lote LedBox): barra accesible + «x de y» + porcentaje
// con los umbrales reales (completo, vencidas y riesgo).
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { ProgresoChecklist, progresoChecklist } from '../src/index.js'

describe('progresoChecklist', () => {
  test('cuenta pendientes, vencidas y porcentaje', () => {
    const avance = progresoChecklist({ hechas: 3, total: 12, vencidas: 2 })
    expect(avance).toMatchObject({ hechas: 3, total: 12, pendientes: 9, vencidas: 2, completo: false, tono: 'warn', porcentaje: 25 })
    expect(avance.etiqueta).toBe('3 de 12 tareas')
    expect(avance.detalle).toContain('9 pendientes')
    expect(avance.detalle).toContain('2 vencidas')
  })

  test('los umbrales de tono son ok (completo), warn (vencidas) y bad (riesgo)', () => {
    expect(progresoChecklist({ hechas: 4, total: 4 }).tono).toBe('ok')
    expect(progresoChecklist({ hechas: 4, total: 4 }).porcentaje).toBe(100)
    expect(progresoChecklist({ hechas: 1, total: 4 }).tono).toBe('fono')
    expect(progresoChecklist({ hechas: 1, total: 4, vencidas: 1 }).tono).toBe('warn')
    expect(progresoChecklist({ hechas: 0, total: 4, riesgo: true }).tono).toBe('bad')
    // Sin datos no se inventa un 0 %: es un vacío explícito.
    const vacio = progresoChecklist({})
    expect(vacio.etiqueta).toBe('Sin datos')
    expect(vacio.porcentaje).toBe(0)
    expect(vacio.tono).toBe('fono')
  })

  test('los números raros no rompen el conteo', () => {
    const avance = progresoChecklist({ hechas: 9, total: 4, vencidas: 8 })
    expect(avance).toMatchObject({ hechas: 4, total: 4, pendientes: 0, vencidas: 0, completo: true, tono: 'ok' })
    expect(progresoChecklist({ hechas: 'x', total: 'y' }).total).toBe(0)
  })
})

describe('ProgresoChecklist', () => {
  test('la barra es accesible y el texto repite el avance', () => {
    const html = renderToStaticMarkup(<ProgresoChecklist hechas={2} total={4} sustantivo="ítems" />)
    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-valuenow="50"')
    expect(html).toContain('2 de 4 ítems')
    expect(html).toContain('50%')
  })

  test('completo, vencidas y riesgo se ven distinto (no sólo por color)', () => {
    expect(renderToStaticMarkup(<ProgresoChecklist hechas={4} total={4} />)).toContain('text-ok')
    const conVencidas = renderToStaticMarkup(<ProgresoChecklist hechas={1} total={4} vencidas={2} />)
    expect(conVencidas).toContain('2 vencidas')
    expect(conVencidas).toContain('text-warn')
    const enRiesgo = renderToStaticMarkup(<ProgresoChecklist hechas={0} total={4} riesgo />)
    expect(enRiesgo).toContain('Sin avance')
    expect(enRiesgo).toContain('text-bad')
    const sinDatos = renderToStaticMarkup(<ProgresoChecklist />)
    expect(sinDatos).toContain('Sin datos')
    expect(sinDatos).not.toContain('role="progressbar"')
  })
})
