// Íconos de módulo y de acción portados del panel de LedBox (AdminIcons). El
// set de la librería no pisa ningún glifo existente: los nombres que ya estaban
// (calendar, users, receipt, print/printer…) se mantienen tal cual y el mapa
// nombre de LedBox → nombre de la librería vive en el README.
import { readFileSync } from 'node:fs'
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

// Glifos de pago y operación cosechados de PagaYa (#1). Se suman sin tocar los
// existentes; las equivalencias quedan documentadas en docs/REGLAS.md.
// `building`, `mail`, `bank` y `backspace` ya existían en la librería (lote de
// LedBox, paridad #253): se conserva el glifo de la librería y no se duplica.

const NUEVOS_PAGAYA = {
  home: 'M3 11l9-8 9 8',
  arrow: 'M5 12h14',
  link: 'M10 13a5 5 0 0 0 7.5.5l2-2',
  play: 'M9 7l8 5-8 5z',
  pause: 'M9 7v10',
  archive: 'M6 7v12h12V7',
  call: 'M8.2 3.7 5.7 5.1',
  pin: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z',
  code: 'M8 9l-4 3 4 3',
  qr: 'M3 3h7v7H3z',
  transfer: 'M4 7h15',
  subscription: 'M20 7h-7',
  card: 'M3 5h18v14H3z',
  terminal: 'M12 3 3 8v2h18V8l-9-5Z',
  nfc: 'M5.25 9a4.5 4.5 0 0 1 0 6',
}

describe('Icon: glifos de pago y operación (#1)', () => {
  test('cada glifo nuevo renderiza su trazo', () => {
    for (const [nombre, trazo] of Object.entries(NUEVOS_PAGAYA)) {
      const html = renderToStaticMarkup(<Icon name={nombre} />)
      expect(html, nombre).toContain('<svg')
      expect(html, nombre).toContain(trazo)
    }
  })

  test('los glifos existentes no se renombran ni se pisan', () => {
    // `phone` sigue siendo el teléfono móvil del equipo (el auricular de
    // PagaYa entra como `call`); los nombres viejos conservan su forma.
    expect(renderToStaticMarkup(<Icon name="phone" />)).toContain('M7 2h10a2 2 0 0 1 2 2v16')
    expect(renderToStaticMarkup(<Icon name="dots" />)).toContain('M12 13a1 1 0 1 0 0-2')
    expect(renderToStaticMarkup(<Icon name="package" />)).toContain('M16.5 9.4')
    expect(renderToStaticMarkup(<Icon name="pulse" />)).toContain('M3 12h4l3-8 4 16 3-8h4')
    expect(renderToStaticMarkup(<Icon name="trending" />)).toContain('M22 7l-8.5 8.5-5-5L2 17')
    expect(renderToStaticMarkup(<Icon name="user" />)).toContain('M19 21v-2a4 4 0 0 0-4-4H9')
    expect(renderToStaticMarkup(<Icon name="report" />)).toContain('M14 2H6a2 2 0 0 0-2 2v16')
    // Los que PagaYa también traía y la librería ya tenía: gana el glifo de
    // la librería (sin duplicar la clave del mapa).
    expect(renderToStaticMarkup(<Icon name="building" />)).toContain('M5 20V5.5')
    expect(renderToStaticMarkup(<Icon name="bank" />)).toContain('M3.5 9.5 12 4l8.5 5.5')
    expect(renderToStaticMarkup(<Icon name="backspace" />)).toContain('M21 4H8l-7 8 7 8h13')
  })

  test('un nombre desconocido no inventa un ícono', () => {
    expect(renderToStaticMarkup(<Icon name="glifo-que-no-existe" />)).toBe('')
  })

  test('las equivalencias con el set de PagaYa quedan documentadas', () => {
    const reglas = readFileSync(new URL('../docs/REGLAS.md', import.meta.url), 'utf8')
    for (const equivalencia of [
      '`activity` → `pulse`',
      '`trend` → `trending`',
      '`person` → `user`',
      '`more` → `dots`',
      '`products` → `package`',
      '`orders` → `report`',
      '`company` → `building`',
      '`phone` (auricular) → `call`',
    ]) {
      expect(reglas, equivalencia).toContain(equivalencia)
    }
  })
})
