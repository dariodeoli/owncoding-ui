import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { FormField, Input, Label, MoneyInput, PasswordInput, PinInput, Select, Textarea } from '../src/index.js'
import { CAMPO_ESTADOS, CLASES_CAMPO, separarClasesDeLayout } from '../src/utils/campo.js'

const html = (nodo) => renderToStaticMarkup(nodo)
const clase = (marcado) => /class="([^"]*)"/.exec(marcado)?.[1] ?? ''
const claseDe = (marcado, etiqueta) => (new RegExp(`<${etiqueta}[^>]*class="([^"]*)"`).exec(marcado)?.[1] ?? '').replaceAll('&amp;', '&')

describe('estilo único de los campos', () => {
  test('todos los controles comparten los estados de CAMPO_ESTADOS', () => {
    const estados = CAMPO_ESTADOS.split(' ')
    const controles = {
      Input: claseDe(html(<Input />), 'input'),
      Select: claseDe(html(<Select><option>a</option></Select>), 'select'),
      Textarea: claseDe(html(<Textarea />), 'textarea'),
      MoneyInput: claseDe(html(<MoneyInput value={1} onValueChange={() => {}} />), 'input'),
      PasswordInput: claseDe(html(<PasswordInput />), 'input'),
      PinInput: claseDe(html(<PinInput value="" onChange={() => {}} />), 'input'),
    }
    for (const [nombre, clases] of Object.entries(controles)) {
      const presentes = new Set(clases.split(' '))
      const faltan = estados.filter((token) => !presentes.has(token))
      expect(faltan, `${nombre} perdió estados compartidos`).toEqual([])
    }
  })

  test('no queda la cadena vieja repetida en las primitivas', () => {
    const fuente = readFileSync(new URL('../src/components/ui.jsx', import.meta.url), 'utf8')
    expect(fuente).not.toContain('focus:ring-1 focus:ring-fono/40')
    expect(fuente).not.toContain('border border-interactivo bg-ink-800')
  })

  test('declara hover, foco, inválido por aria, deshabilitado y solo lectura', () => {
    const c = CLASES_CAMPO.input
    expect(c).toContain('hover:border-mute')
    expect(c).toContain('focus:ring-[3px]')
    expect(c).toContain('aria-[invalid=true]:border-bad')
    expect(c).toContain('disabled:bg-ink-700')
    expect(c).toContain('[&[readonly]]:border-dashed')
    expect(c).toContain('placeholder:text-placeholder')
    // El indicador es borde + anillo: sin outline propio no hay doble contorno.
    expect(c).toContain('outline-none')
  })

  test('conserva las alturas táctiles (44 px mobile, 36 px desde md)', () => {
    for (const nombre of ['input', 'select']) expect(CLASES_CAMPO[nombre]).toContain('h-11 md:h-9')
    expect(CLASES_CAMPO.textarea).not.toContain('h-11')
  })

  test('el Select lee solo lectura por atributo, no por :read-only', () => {
    expect(CLASES_CAMPO.select).not.toContain('readonly')
  })
})

describe('aria-invalid', () => {
  test('el atributo llega al control y el estilo depende de él', () => {
    expect(html(<Input aria-invalid="true" />)).toContain('aria-invalid="true"')
    expect(html(<MoneyInput value={99999999999999} onValueChange={() => {}} max={10} />)).toContain('aria-invalid="true"')
  })

  test('FormField con error marca el control como inválido y lo describe', () => {
    const marcado = html(
      <FormField label="Correo" htmlFor="c" error="Falta el dominio">
        <Input id="c" />
      </FormField>,
    )
    expect(marcado).toContain('aria-invalid="true"')
    expect(marcado).toContain('aria-describedby="c-descripcion"')
    expect(marcado).toContain('role="alert"')
    // El mensaje de error lleva ícono decorativo.
    expect(/role="alert"[^>]*>\s*<svg[^>]*aria-hidden="true"/.test(marcado)).toBe(true)
  })

  test('FormField sin error no marca inválido', () => {
    expect(html(<FormField label="A" htmlFor="a" hint="ayuda"><Input id="a" /></FormField>)).not.toContain('aria-invalid="')
  })
})

describe('Select con chevron propio', () => {
  test('sin flecha nativa y con ícono decorativo que no intercepta el clic', () => {
    const marcado = html(<Select aria-label="Estado"><option value="a">A</option></Select>)
    expect(claseDe(marcado, 'select')).toContain('appearance-none')
    expect(claseDe(marcado, 'select')).toContain('pr-9')
    expect(marcado).toContain('<svg')
    expect(marcado).toContain('aria-hidden="true"')
    expect(marcado).toContain('pointer-events-none')
    // Sigue siendo el <select> nativo: opciones y atributos pasan igual.
    expect(marcado).toContain('<option value="a">A</option>')
    expect(marcado).toContain('aria-label="Estado"')
  })

  test('las clases de ancho van al envoltorio y el select ocupa todo', () => {
    const marcado = html(<Select className="w-36 text-sm"><option>a</option></Select>)
    const envoltorio = /<span class="([^"]*)"/.exec(marcado)[1]
    expect(envoltorio).toContain('w-36')
    expect(envoltorio).not.toContain('w-full')
    expect(claseDe(marcado, 'select')).toContain('w-full')
    expect(claseDe(marcado, 'select')).not.toContain('w-36')
  })

  test('sin ancho propio el envoltorio ocupa el ancho disponible', () => {
    expect(/<span class="([^"]*)"/.exec(html(<Select><option>a</option></Select>))[1]).toContain('w-full')
  })

  test('deshabilitado: el select lleva disabled y el chevron se apaga', () => {
    const marcado = html(<Select disabled><option>a</option></Select>)
    expect(marcado).toContain('disabled=""')
    expect(marcado).toContain('opacity-50')
  })
})

describe('separarClasesDeLayout', () => {
  test('manda ancho y márgenes al envoltorio y deja el resto', () => {
    expect(separarClasesDeLayout('w-24 mt-2 md:w-40 text-center font-bold')).toEqual({
      layout: 'w-24 mt-2 md:w-40',
      control: 'text-center font-bold',
      tieneAncho: true,
    })
  })

  test('sin clases devuelve vacío', () => {
    expect(separarClasesDeLayout(undefined)).toEqual({ layout: '', control: '', tieneAncho: false })
  })

  test('mx-auto y flex-1 también son layout, un padding no', () => {
    const r = separarClasesDeLayout('mx-auto flex-1 px-4')
    expect(r.layout).toBe('mx-auto flex-1')
    expect(r.control).toBe('px-4')
    expect(r.tieneAncho).toBe(false)
  })
})

describe('Label y FormField', () => {
  test('el label es legible: sin mayúsculas forzadas ni 11 px', () => {
    const c = clase(html(<Label htmlFor="x">Nombre</Label>))
    expect(c).toContain('text-[13px]')
    expect(c).toContain('font-medium')
    expect(c).not.toContain('uppercase')
    expect(c).not.toContain('text-[11px]')
    expect(html(<Label htmlFor="x">Nombre</Label>)).toContain('for="x"')
  })

  test('requerido es opt-in: asterisco decorativo y aria-required en el control', () => {
    const sin = html(<FormField label="A" htmlFor="a"><Input id="a" /></FormField>)
    expect(sin).not.toContain('data-oc-requerido')
    expect(sin).not.toContain('aria-required')
    const con = html(<FormField label="A" htmlFor="a" requerido><Input id="a" /></FormField>)
    expect(con).toContain('data-oc-requerido')
    expect(con).toMatch(/<span aria-hidden="true" data-oc-requerido="" class="[^"]*">\*<\/span>/)
    expect(con).toContain('aria-required="true"')
  })

  test('requerido no duplica aria-required si el control ya trae required', () => {
    const con = html(<FormField label="A" htmlFor="a" requerido><Input id="a" required /></FormField>)
    expect(con).not.toContain('aria-required')
    expect(con).toContain('required=""')
  })

  test('el hint sigue describiendo el control', () => {
    const marcado = html(<FormField label="A" htmlFor="a" hint="ayuda"><Input id="a" /></FormField>)
    expect(marcado).toContain('aria-describedby="a-descripcion"')
    expect(marcado).toContain('id="a-descripcion"')
  })
})

// ── Contraste medido sobre los tokens reales ─────────────────────────
const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')

function paleta(apertura) {
  const todas = tokens.split('\n')
  // Hay bloques con la misma apertura sin tokens (p. ej. `html.dark { color-scheme }`).
  for (let inicio = 0; inicio < todas.length; inicio++) {
    if (!todas[inicio].trim().startsWith(apertura)) continue
    const lineas = todas.slice(inicio)
    const fin = lineas.findIndex((linea) => linea.includes('}'))
    const salida = {}
    for (const m of lineas.slice(0, fin + 1).join('\n').matchAll(/--c-([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+);/g)) salida[m[1]] = [+m[2], +m[3], +m[4]]
    if (Object.keys(salida).length) return salida
  }
  throw new Error(`sin tokens en ${apertura}`)
}
const luminancia = ([r, g, b]) => {
  const f = (v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contraste = (a, b) => {
  const [alto, bajo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (alto + 0.05) / (bajo + 0.05)
}

describe('contraste de los campos', () => {
  const claro = paleta(':root {')
  const oscuro = { ...claro, ...paleta('html.dark {') }
  const temas = [
    ['claro', claro, claro['fono-dark']],
    ['oscuro', oscuro, oscuro['fono-dark']],
  ]

  test.each(temas)('%s: texto y placeholder ≥ 4.5:1, borde y foco ≥ 3:1', (_nombre, t, foco) => {
    expect(t.placeholder, 'falta --c-placeholder').toBeDefined()
    for (const fondo of [t['ink-800'], t.ink, t.paper]) {
      expect(contraste(t.fore, fondo)).toBeGreaterThanOrEqual(4.5)
      expect(contraste(t.placeholder, fondo)).toBeGreaterThanOrEqual(4.5)
      expect(contraste(t.interactivo, fondo)).toBeGreaterThanOrEqual(3)
      expect(contraste(foco, fondo)).toBeGreaterThanOrEqual(3)
      expect(contraste(t.bad, fondo)).toBeGreaterThanOrEqual(3)
      // El hover (mute) refuerza el borde, nunca lo debilita.
      expect(contraste(t.mute, fondo)).toBeGreaterThan(contraste(t.interactivo, fondo))
    }
    // Texto del error y del hint sobre la superficie del formulario.
    expect(contraste(t['bad-text'], t.ink)).toBeGreaterThanOrEqual(4.5)
    expect(contraste(t.mute, t.ink)).toBeGreaterThanOrEqual(4.5)
  })

  test('deshabilitado conserva el texto legible (≥ 4.5:1 sobre ink-700)', () => {
    for (const t of [claro, oscuro]) expect(contraste(t.mute, t['ink-700'])).toBeGreaterThanOrEqual(4.5)
  })
})
