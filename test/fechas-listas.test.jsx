import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  SerialTexto,
  diasHasta,
  estadoVencimiento,
  fechaDia,
  fechaLista,
  fechaListaCorta,
  tonoVencimiento,
} from '../src/index.js'

// Seriales y fechas de listas densas (cosecha de ScaleOS, #2): la cola del
// serial siempre visible (`••••4821` donde no aporta), fechas con zona de la
// app y tono de vencimiento por día de calendario.

describe('fechaLista / fechaListaCorta', () => {
  test('día + mes corto + año y hora h23 en la zona pedida', () => {
    expect(fechaLista('2026-09-17T12:00:00Z', { timeZone: 'America/Asuncion' })).toBe('17 sept 26 · 09:00')
    expect(fechaLista('2026-09-17T23:30:00Z', { timeZone: 'America/Asuncion' })).toBe('17 sept 26 · 20:30')
  })

  test('un día puro se formatea en UTC y no lleva reloj salvo `hora`', () => {
    expect(fechaLista('2026-09-17', { timeZone: 'America/Asuncion' })).toBe('17 sept 26')
    expect(fechaLista('2026-09-17', { hora: '14:30' })).toBe('17 sept 26 · 14:30')
  })

  test('el vacío es explícito en las dos', () => {
    expect(fechaLista(null)).toBe('—')
    expect(fechaLista('', { vacio: 'Sin fecha' })).toBe('Sin fecha')
    expect(fechaListaCorta(undefined)).toBe('—')
  })

  test('fechaListaCorta deja día y mes corto unidos por guion', () => {
    expect(fechaListaCorta('2026-09-17T23:30:00Z', { timeZone: 'America/Asuncion' })).toBe('17-sept')
    expect(fechaListaCorta('2026-09-17')).toBe('17-sept')
  })
})

describe('diasHasta / tonoVencimiento', () => {
  const hoy = '2026-09-17'

  test('cuenta días de calendario, no milisegundos', () => {
    expect(diasHasta('2026-09-17', { hoy })).toBe(0)
    expect(diasHasta('2026-09-18', { hoy })).toBe(1)
    expect(diasHasta('2026-09-24', { hoy })).toBe(7)
    expect(diasHasta('2026-09-16', { hoy })).toBe(-1)
    expect(diasHasta('', { hoy })).toBeNull()
  })

  test('el tono marca vencido y la ventana de aviso', () => {
    expect(tonoVencimiento('2026-09-10', { hoy })).toBe('bad')
    expect(tonoVencimiento('2026-09-17', { hoy })).toBe('warn')
    expect(tonoVencimiento('2026-09-24', { hoy })).toBe('warn')
    expect(tonoVencimiento('2026-09-25', { hoy })).toBe('')
    expect(tonoVencimiento('', { hoy })).toBe('')
  })

  test('estadoVencimiento compone el mismo cálculo', () => {
    expect(estadoVencimiento('2026-09-17', { hoy })).toMatchObject({ texto: 'hoy', tono: 'warn', dias: 0 })
    expect(estadoVencimiento('2026-09-10', { hoy })).toMatchObject({ texto: 'venció', tono: 'bad', vencido: true })
    expect(estadoVencimiento('', { hoy })).toMatchObject({ texto: '—', tono: 'mute', dias: null })
    // Un día puro lejano se muestra como día, sin reloj ni corrimiento de zona.
    expect(estadoVencimiento('2026-12-31', { hoy }).texto).toBe(fechaDia('2026-12-31'))
  })
})

describe('SerialTexto enmascarado', () => {
  test('deja solo la cola y conserva el serial completo en el title', () => {
    const html = renderToStaticMarkup(<SerialTexto serial="356789104523178" enmascarar />)
    expect(html).toContain('••••3178')
    expect(html).toContain('title="356789104523178"')
  })

  test('sin serial sigue mostrando el vacío explícito', () => {
    expect(renderToStaticMarkup(<SerialTexto serial="" enmascarar />)).toContain('—')
  })

  test('sin enmascarar, la cabeza se recorta y la cola queda visible', () => {
    const html = renderToStaticMarkup(<SerialTexto serial="356789104523178" />)
    expect(html).toContain('35678910452')
    expect(html).toContain('>3178</b>')
    expect(html).toContain('truncate')
  })
})
