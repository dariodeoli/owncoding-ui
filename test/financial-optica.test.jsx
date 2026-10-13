import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import { describe, expect, test } from 'vitest'
import BancoLogo from '../src/components/BancoLogo.jsx'
import MedioPagoLogo from '../src/components/MedioPagoLogo.jsx'
import { LOGOS_BANCOS } from '../src/utils/bancos.js'
import { MARCAS_MEDIOS_PAGO } from '../src/utils/mediosPago.js'
import { ASSET_KEYS_FINANCIEROS } from '../src/financial/assets.js'
import {
  ESCALA_MAXIMA_CON_PLACA,
  ESCALA_MINIMA,
  OPTICA_ASSETS_FINANCIEROS,
  cajaOptica,
  opticaDeAsset,
} from '../src/financial/optica.js'

// Slots de la galería: compacto 48x48, horizontal 144x52 con 8 px laterales si
// el logo lleva placa. Los slots reales pueden ser más anchos, nunca más chicos.
const SLOT = { compacto: { ancho: 48, alto: 48 }, horizontal: { ancho: 144, alto: 52 } }

function visuales() {
  const filas = []
  for (const [catalogo, registros] of [['banco', LOGOS_BANCOS], ['pago', MARCAS_MEDIOS_PAGO]]) {
    for (const [nombre, registro] of Object.entries(registros)) {
      for (const variante of ['compacto', 'horizontal']) {
        const visual = registro.variantes?.[variante]
        if (!visual?.empaquetado) continue
        const optica = opticaDeAsset(visual.empaquetado, variante, { placa: Boolean(visual.fondo) })
        filas.push({ catalogo, nombre, variante, visual: { ...visual, optica } })
      }
    }
  }
  return filas
}

describe('metadatos ópticos de logos financieros', () => {
  test('cada asset empaquetado tiene una fila bien formada y existe en el registro', () => {
    expect(Object.keys(OPTICA_ASSETS_FINANCIEROS).sort()).toEqual([...ASSET_KEYS_FINANCIEROS].sort())
    for (const [clave, fila] of Object.entries(OPTICA_ASSETS_FINANCIEROS)) {
      const [nw, nh, x0, y0, x1, y1] = fila
      expect(nw, clave).toBeGreaterThan(0)
      expect(nh, clave).toBeGreaterThan(0)
      expect(x0, clave).toBeGreaterThanOrEqual(0)
      expect(y0, clave).toBeGreaterThanOrEqual(0)
      expect(x1, clave).toBeLessThanOrEqual(1)
      expect(y1, clave).toBeLessThanOrEqual(1)
      expect(x1 - x0, clave).toBeGreaterThan(0.2)
      expect(y1 - y0, clave).toBeGreaterThan(0.2)
    }
  })

  test('toda variante con asset empaquetado resuelve metadatos y el contrato visual no cambia', () => {
    const conAsset = []
    for (const registros of [LOGOS_BANCOS, MARCAS_MEDIOS_PAGO]) {
      for (const registro of Object.values(registros)) {
        for (const [variante, visual] of Object.entries(registro.variantes || {})) {
          expect(visual.optica).toBeUndefined()
          if (visual.empaquetado) {
            conAsset.push({ ...visual, optica: opticaDeAsset(visual.empaquetado, variante, { placa: Boolean(visual.fondo) }) })
          }
        }
      }
    }
    expect(conAsset.length).toBeGreaterThan(60)
    for (const visual of conAsset) {
      expect(visual.optica, visual.empaquetado).toBeTruthy()
      expect(visual.optica.escala).toBeGreaterThanOrEqual(ESCALA_MINIMA)
      expect(visual.optica.escala).toBeLessThanOrEqual(1)
      expect(visual.optica.altura).toBeGreaterThan(0)
      expect(visual.optica.altura).toBeLessThanOrEqual(1)
      if (visual.fondo) expect(visual.optica.escala).toBeLessThanOrEqual(ESCALA_MAXIMA_CON_PLACA)
    }
    expect(opticaDeAsset('no/existe.png')).toBeNull()
  })

  test.each(['compacto', 'horizontal'])('la caja de tinta nunca excede el slot (%s)', (variante) => {
    const filas = visuales().filter((fila) => fila.variante === variante)
    expect(filas.length).toBeGreaterThan(30)
    for (const { nombre, visual } of filas) {
      const rellenoX = variante === 'horizontal' && visual.fondo ? 8 : 0
      const caja = cajaOptica(visual.optica, { ...SLOT[variante], rellenoX })
      expect(caja.ancho, `${nombre} ${variante}`).toBeLessThanOrEqual(SLOT[variante].ancho - 2 * rellenoX + 0.001)
      expect(caja.alto, `${nombre} ${variante}`).toBeLessThanOrEqual(SLOT[variante].alto + 0.001)
    }
  })

  test('todo wordmark horizontal conserva al menos 12 px de alto en el slot de la galería', () => {
    for (const { nombre, visual } of visuales().filter((fila) => fila.variante === 'horizontal')) {
      const rellenoX = visual.fondo ? 8 : 0
      const caja = cajaOptica(visual.optica, { ...SLOT.horizontal, rellenoX })
      expect(caja.alto, nombre).toBeGreaterThanOrEqual(12)
    }
  })

  test('las marcas compactas pesan lo mismo (±15 % de área) salvo wordmarks contenidos muy anchos', () => {
    const marcas = visuales().filter((fila) => fila.variante === 'compacto' && fila.visual.optica.relacion <= 2.5 && fila.visual.empaquetado !== 'pagos/bancard-compacto.png')
    const areas = marcas.map(({ visual }) => {
      const caja = cajaOptica(visual.optica, SLOT.compacto)
      return caja.ancho * caja.alto
    })
    const media = areas.reduce((a, b) => a + b, 0) / areas.length
    expect(marcas.length).toBeGreaterThan(30)
    areas.forEach((area, i) => {
      expect(Math.abs(area / media - 1), marcas[i].nombre).toBeLessThanOrEqual(0.15)
    })
  })

  test('el render recorta la tinta y no desborda: caja dentro del span y sin tamaños fijos', () => {
    const casos = [
      <MedioPagoLogo key="v" marca="Visa" variante="horizontal" alto="h-5" />,
      <MedioPagoLogo key="pp" marca="PayPro" variante="horizontal" alto="h-6" />,
      <BancoLogo key="s" banco="Sudameris" variante="horizontal" alto="h-[3.25rem]" />,
      <BancoLogo key="g" banco="Banco GNB Paraguay" variante="compacto" alto="h-12" />,
    ]
    for (const caso of casos) {
      const documento = new JSDOM(renderToStaticMarkup(caso)).window.document
      const raiz = documento.querySelector('[data-logo-variante]')
      const caja = raiz.querySelector('[data-logo-optico]')
      expect(caja).not.toBeNull()
      expect(caja.getAttribute('style')).toMatch(/height:\s*\d+(\.\d+)?%/)
      expect(caja.getAttribute('style')).toContain('aspect-ratio')
      expect(caja.getAttribute('style')).not.toMatch(/(^|;)\s*width:/)
      expect(raiz.querySelectorAll('img')).toHaveLength(1)
      expect(raiz.classList).toContain('max-w-full')
    }
  })
})

describe('placa clara en tema oscuro', () => {
  test('todo logo con asset y sin `fondo` lleva la placa clara dark:; con `fondo` no', () => {
    let sinPlaca = 0
    for (const [Comp, prop, registros] of [[BancoLogo, 'banco', LOGOS_BANCOS], [MedioPagoLogo, 'marca', MARCAS_MEDIOS_PAGO]]) {
      for (const [nombre, registro] of Object.entries(registros)) {
        for (const variante of ['compacto', 'horizontal']) {
          const visual = registro.variantes?.[variante]
          if (!visual?.empaquetado) continue
          const raiz = new JSDOM(renderToStaticMarkup(<Comp {...{ [prop]: nombre }} variante={variante} />)).window.document.querySelector('[data-logo-variante]')
          if (!raiz) continue
          const clases = [...raiz.classList]
          if (visual.fondo) expect(clases, `${nombre} ${variante}`).not.toContain('dark:bg-white')
          else { sinPlaca += 1; expect(clases, `${nombre} ${variante}`).toContain('dark:bg-white') }
        }
      }
    }
    expect(sinPlaca).toBeGreaterThan(40)
  }, 30000)

  test('Bancard compacto no se reduce al área común', () => {
    expect(opticaDeAsset('pagos/bancard-compacto.png', 'compacto').escala).toBe(1)
  })
})
