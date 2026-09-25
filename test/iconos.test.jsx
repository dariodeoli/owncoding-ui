// Íconos de módulo y de acción portados del panel de LedBox (AdminIcons). El
// set de la librería no pisa ningún glifo existente: los nombres que ya estaban
// (calendar, users, receipt, print/printer…) se mantienen tal cual y el mapa
// nombre de LedBox → nombre de la librería vive en el README.
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { ICONOS, Icon } from '../src/index.js'

const NUEVOS = [
  // Módulos del panel
  'overview', 'events', 'clients', 'leads', 'budgets', 'finance', 'inventory',
  'suppliers', 'promoters', 'building', 'plan', 'audit',
  // Acciones y utilidades
  'arrowRight', 'arrowLeft', 'sun', 'moon', 'power', 'mail', 'bank', 'checkin',
  'globe', 'database', 'instagram',
]

describe('íconos portados del panel de LedBox', () => {
  test('los nombres nuevos existen y dibujan con el trazo de la librería', () => {
    for (const nombre of NUEVOS) {
      expect(ICONOS, `falta ${nombre} en ICONOS`).toContain(nombre)
      const html = renderToStaticMarkup(<Icon name={nombre} />)
      expect(html, `${nombre} no dibuja`).toContain('<svg')
      expect(html).toContain('stroke-width="1.75"')
      expect(html).toContain('aria-hidden="true"')
    }
  })

  test('los glifos que ya existían no se pisan', () => {
    expect(renderToStaticMarkup(<Icon name="calendar" />)).toContain('M8 2v4')
    expect(renderToStaticMarkup(<Icon name="users" />)).toContain('M16 21v-2')
    expect(renderToStaticMarkup(<Icon name="printer" />)).toContain('M6 9V3h12v6')
    expect(ICONOS).toContain('receipt')
    expect(ICONOS).toContain('settings')
  })

  test('un nombre desconocido no renderiza nada (sin íconos rotos)', () => {
    expect(renderToStaticMarkup(<Icon name="no-existe" />)).toBe('')
  })

  test('paridad con la app: `share` existe y `mail` conserva su trazo (#253)', () => {
    // Al unificar el set, la app no puede quedarse sin íconos ni cambiar los
    // que ya veía en producción.
    expect(ICONOS).toContain('share')
    expect(renderToStaticMarkup(<Icon name="share" />)).toContain('M8.6 13.5l6.8 3.5')
    expect(renderToStaticMarkup(<Icon name="mail" />)).toContain('M4 5h16a1 1 0 0 1 1 1v12')
  })
})
