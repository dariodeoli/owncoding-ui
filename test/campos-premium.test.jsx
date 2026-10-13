// @vitest-environment jsdom
import React, { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { PinInput } from '../src/index.js'
import { BotonDentroCampo, Button, Checkbox, FormField, FormulariosPro, Input, MoneyInput, PasswordInput, SearchField, SegmentedField, Select, Switch, Textarea } from '../src/index.js'
import { CLASES_CAMPO, nivelContador, separarClasesDeLayout } from '../src/utils/campo.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
let host, root
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
afterEach(() => { act(() => root.unmount()); host.remove(); vi.useRealTimers() })
const montar = (nodo) => act(() => root.render(nodo))
const pro = (nodo) => <FormulariosPro>{nodo}</FormulariosPro>
const html = (nodo) => renderToStaticMarkup(nodo).replaceAll('&amp;', '&')

describe('separarClasesDeLayout (posición, z, visibilidad)', () => {
  test('absolute right-0 top-2 z-10 van al envoltorio', () => {
    const r = separarClasesDeLayout('absolute right-0 top-2 z-10 text-sm')
    expect(r.layout).toBe('absolute right-0 top-2 z-10')
    expect(r.control).toBe('text-sm')
  })
  test('!w-full cuenta como ancho y como layout', () => {
    expect(separarClasesDeLayout('!w-full')).toEqual({ layout: '!w-full', control: '', tieneAncho: true })
    expect(separarClasesDeLayout('md:!w-1/2').tieneAncho).toBe(true)
  })
  test('sr-only, invisible, hidden, float y negativos', () => {
    const r = separarClasesDeLayout('sr-only invisible hidden float-right -top-2 inset-x-0 sticky')
    expect(r.control).toBe('')
    expect(r.layout.split(' ')).toHaveLength(7)
  })
  test('min-h-11, h-*, padding y texto se quedan en el control', () => {
    const r = separarClasesDeLayout('min-h-11 max-h-20 h-9 px-2 text-xs')
    expect(r.layout).toBe('')
    expect(r.control).toBe('min-h-11 max-h-20 h-9 px-2 text-xs')
  })
  test('Select: min-h-11 queda en el <select>; style y hidden van al envoltorio', () => {
    const marcado = html(<Select className="min-h-11 absolute right-0 z-10 sr-only" style={{ top: 3 }} hidden><option>a</option></Select>)
    const envoltorio = /<span ([^>]*)>/.exec(marcado)[1]
    expect(envoltorio).toContain('absolute right-0 z-10 sr-only')
    expect(envoltorio).toContain('style="top:3px"')
    expect(envoltorio).toContain('hidden')
    const select = /<select[^>]*class="([^"]*)"/.exec(marcado)[1]
    expect(select).toContain('min-h-11')
    expect(select).not.toContain('absolute')
  })
  test('Input con adornos usa el mismo reparto', () => {
    const marcado = html(<Input inicio="Gs" className="w-36 min-h-11" />)
    expect(/<span[^>]*data-oc-campo[^>]*class="([^"]*)"/.exec(marcado)?.[1] ?? /class="([^"]*)"[^>]*data-oc-campo/.exec(marcado)[1]).toContain('w-36')
    expect(/<input[^>]*class="([^"]*)"/.exec(marcado)[1]).toContain('min-h-11')
  })
})

describe('Select: bloque, chevron y solo lectura', () => {
  test('el select es block y el chevron se apaga con peer-disabled (también fieldset disabled)', () => {
    const marcado = html(<Select><option>a</option></Select>)
    expect(CLASES_CAMPO.select.split(' ')).toContain('block')
    expect(marcado).toContain('peer-disabled:opacity-50')
    expect(/<select[^>]*class="([^"]*)"/.exec(marcado)[1].split(' ')).toContain('peer')
  })
  test('solo lectura usa el borde interactivo (≥3:1), no ink-500', () => {
    expect(CLASES_CAMPO.input).toContain('[&[readonly]]:border-interactivo')
    expect(CLASES_CAMPO.input).not.toContain('border-ink-500')
  })
  test('tokens: --c-placeholder también en .consola', () => {
    const tokens = readFileSync('src/styles/tokens.css', 'utf8')
    const consola = tokens.slice(tokens.indexOf('.consola {'))
    expect(consola).toContain('--c-placeholder: 168 176 190;')
  })
  test('Select acepta ref y apunta al <select>', () => {
    const ref = React.createRef()
    montar(<Select ref={ref}><option>a</option></Select>)
    expect(ref.current.tagName).toBe('SELECT')
  })
})

describe('Input: estado, cargando y adornos', () => {
  test('estado="ok": borde ok y check; el inválido gana', () => {
    montar(<Input estado="ok" aria-label="x" />)
    expect(host.querySelector('input').dataset.ocEstado).toBe('ok')
    expect(host.querySelector('[data-oc-ok] svg')).not.toBeNull()
    montar(<Input estado="ok" aria-invalid="true" aria-label="x" />)
    expect(host.querySelector('input').dataset.ocEstado).toBeUndefined()
    expect(host.querySelector('[data-oc-ok]')).toBeNull()
  })
  test('estado="error" equivale a aria-invalid', () => {
    montar(<Input estado="error" aria-label="x" />)
    expect(host.querySelector('input').getAttribute('aria-invalid')).toBe('true')
  })
  test('cargando: aria-busy y spinner decorativo', () => {
    montar(<Input cargando aria-label="x" />)
    expect(host.querySelector('input').getAttribute('aria-busy')).toBe('true')
    expect(host.querySelector('[data-oc-spinner]').getAttribute('aria-hidden')).toBe('true')
  })
  test('Select cargando: aria-busy y spinner', () => {
    montar(<Select cargando aria-label="x"><option>a</option></Select>)
    expect(host.querySelector('select').getAttribute('aria-busy')).toBe('true')
    expect(host.querySelector('[data-oc-spinner]')).not.toBeNull()
  })
  test('sin opt-ins el DOM sigue siendo el input pelado', () => {
    montar(<Input aria-label="x" />)
    expect(host.firstElementChild.tagName).toBe('INPUT')
    expect(host.querySelector('[data-oc-campo]')).toBeNull()
  })
  test('inicio y fin reservan relleno y se dibujan en sus slots', () => {
    montar(<Input inicio="https://" fin={<span>.com</span>} aria-label="x" />)
    expect(host.querySelector('[data-oc-inicio]').textContent).toBe('https://')
    expect(host.querySelector('[data-oc-fin]').textContent).toBe('.com')
    const clase = host.querySelector('input').className
    expect(clase).toContain('pl-12')
    expect(clase).toContain('pr-[3.25rem]')
  })
  test('el relleno medido se aplica por style', () => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get() { return this.hasAttribute('data-oc-inicio') ? 52 : this.hasAttribute('data-oc-fin') ? 40 : 0 } })
    try {
      montar(<Input inicio="https://" fin={<b>x</b>} aria-label="x" />)
      expect(host.querySelector('input').style.paddingLeft).toBe('52px')
      expect(host.querySelector('input').style.paddingRight).toBe('40px')
    } finally { Object.defineProperty(HTMLElement.prototype, 'offsetWidth', original) }
  })
  test('BotonDentroCampo integrado no se posiciona solo; sin integrado sí', () => {
    expect(html(<BotonDentroCampo etiqueta="Consultar" integrado />)).not.toMatch(/class="[^"]*\babsolute\b/)
    expect(html(<BotonDentroCampo etiqueta="Consultar" />)).toMatch(/class="[^"]*\babsolute\b/)
  })
  test('PasswordInput: el ojo es el adorno final y alterna el tipo', () => {
    montar(<PasswordInput aria-label="clave" />)
    expect(host.querySelector('[data-oc-fin] button')).not.toBeNull()
    act(() => host.querySelector('[data-oc-fin] button').click())
    expect(host.querySelector('input').type).toBe('text')
  })
  test('MoneyInput dibuja el prefijo como adorno inicial', () => {
    montar(<MoneyInput value={1000} onValueChange={() => {}} aria-label="m" />)
    expect(host.querySelector('[data-oc-inicio]').textContent).toBe('Gs')
  })
})

describe('SearchField', () => {
  function Buscador(props) {
    const [valor, setValor] = useState(props.inicial ?? 'hola')
    return <SearchField value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Buscar" {...props} />
  }
  test('Esc limpia y no sube; sin texto Esc sigue su camino', () => {
    const alto = vi.fn()
    document.body.addEventListener('keydown', alto)
    montar(pro(<Buscador />))
    const input = host.querySelector('input')
    act(() => { input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect(input.value).toBe('')
    expect(alto).not.toHaveBeenCalled()
    act(() => { input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect(alto).toHaveBeenCalledTimes(1)
    document.body.removeEventListener('keydown', alto)
  })
  test('el × limpia, aparece solo con texto y limpiable={false} lo quita', () => {
    montar(<Buscador />)
    const boton = host.querySelector('button[aria-label="Limpiar búsqueda"]')
    expect(boton.className).toContain('oc-campo-aparece')
    act(() => boton.click())
    expect(host.querySelector('button[aria-label="Limpiar búsqueda"]')).toBeNull()
    montar(<Buscador limpiable={false} />)
    expect(host.querySelector('button[aria-label="Limpiar búsqueda"]')).toBeNull()
  })
  test('cargando muestra spinner y aria-busy', () => {
    montar(<Buscador cargando />)
    expect(host.querySelector('input').getAttribute('aria-busy')).toBe('true')
    expect(host.querySelector('[data-oc-spinner]')).not.toBeNull()
  })
})

describe('Textarea: contador y auto-crecer', () => {
  test('umbrales: normal < 90 %, aviso desde 90 %, tope al 100 %', () => {
    expect(nivelContador(89, 100)).toBe('normal')
    expect(nivelContador(90, 100)).toBe('aviso')
    expect(nivelContador(99, 100)).toBe('aviso')
    expect(nivelContador(100, 100)).toBe('tope')
    expect(nivelContador(5, 0)).toBe('normal')
  })
  test('muestra n/max, cambia de nivel y avisa solo al cruzar el umbral', () => {
    function Notas() { const [v, setV] = useState('a'.repeat(5)); return <><Textarea contador maxLength={100} value={v} onChange={(e) => setV(e.target.value)} aria-label="n" /><button onClick={() => setV('a'.repeat(95))}>aviso</button><button onClick={() => setV('a'.repeat(100))}>tope</button></> }
    montar(<Notas />)
    const contador = () => host.querySelector('[data-oc-contador]')
    const vivo = () => host.querySelector('[aria-live="polite"]')
    expect(contador().textContent).toBe('5/100')
    expect(contador().className).toContain('text-mute')
    expect(vivo().textContent).toBe('')
    act(() => [...host.querySelectorAll('button')].find((b) => b.textContent === 'aviso').click())
    expect(contador().textContent).toBe('95/100')
    expect(contador().className).toContain('text-warn-text')
    expect(vivo().textContent).toBe('Quedan 5 caracteres')
    act(() => [...host.querySelectorAll('button')].find((b) => b.textContent === 'tope').click())
    expect(contador().className).toContain('text-bad-text')
    expect(vivo().textContent).toBe('Límite de caracteres alcanzado')
    expect(host.querySelector('textarea').getAttribute('aria-describedby')).toBeTruthy()
  })
  test('no controlado: cuenta lo que se escribe', () => {
    montar(<Textarea contador maxLength={10} defaultValue="abc" aria-label="n" />)
    expect(host.querySelector('[data-oc-contador]').textContent).toBe('3/10')
  })
  test('sin contador ni autoCrecer es el textarea pelado; autoCrecer no rompe sin layout', () => {
    montar(<Textarea aria-label="n" />)
    expect(host.firstElementChild.tagName).toBe('TEXTAREA')
    montar(<Textarea autoCrecer defaultValue="x" aria-label="n" />)
    expect(host.querySelector('textarea').className).toContain('overflow-hidden')
  })
  test('autoCrecer ajusta la altura al contenido (con medidas simuladas)', () => {
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight')
    Object.defineProperty(Element.prototype, 'scrollHeight', { configurable: true, get() { return 120 } })
    try {
      montar(<Textarea autoCrecer defaultValue="x" aria-label="n" />)
      expect(host.querySelector('textarea').style.height).toBe('120px')
    } finally { Object.defineProperty(Element.prototype, 'scrollHeight', original) }
  })
})

describe('Checkbox, Switch y SegmentedField', () => {
  test('indeterminate nativo: propiedad del DOM, sin aria-checked ni SVG', () => {
    montar(<Checkbox label="Todos" checked={false} indeterminate onChange={() => {}} />)
    const input = host.querySelector('input')
    expect(input.indeterminate).toBe(true)
    expect(input.hasAttribute('aria-checked')).toBe(false)
    expect(host.querySelector('svg')).toBeNull()
    expect(input.className).toContain('accent-fono')
    montar(<Checkbox label="Todos" checked onChange={() => {}} />)
    expect(host.querySelector('input').indeterminate).toBe(false)
  })
  test('indeterminate con FormulariosPro: raya, check y sin aria-checked', () => {
    montar(pro(<Checkbox label="Todos" checked={false} indeterminate onChange={() => {}} />))
    const input = host.querySelector('input')
    expect(input.indeterminate).toBe(true)
    expect(input.hasAttribute('aria-checked')).toBe(false)
    expect(host.querySelector('svg path').getAttribute('d')).toBe('M6 12h12')
    montar(pro(<Checkbox label="Todos" checked onChange={() => {}} />))
    expect(host.querySelector('input').indeterminate).toBe(false)
    expect(host.querySelector('svg path').className.baseVal).toContain('oc-check-trazo')
  })
  test('Checkbox conserva input real y motion={false} lo marca', () => {
    montar(pro(<Checkbox label="A" checked onChange={() => {}} motion={false} />))
    expect(host.querySelector('input[type="checkbox"]')).not.toBeNull()
    expect(host.querySelector('[data-oc-checkbox]').dataset.motion).toBe('off')
  })
  test('Switch: rol, resorte, pulgar que se ensancha y área táctil de 44 px', () => {
    const marcado = html(pro(<Switch checked ariaLabel="x" onChange={() => {}} />))
    expect(marcado).toContain('role="switch"')
    expect(marcado).toContain('cubic-bezier(.34,1.56,.64,1)')
    expect(marcado).toContain('peer-active:w-5')
    // Área de 44 px solo en vertical y sin z-index: no pisa a los vecinos.
    expect(marcado).toContain('h-11 w-full')
    expect(/<input[^>]*class="([^"]*)"/.exec(marcado)[1]).not.toMatch(/\bz-\d+/)
    // Sin el interruptor no hay resorte ni ensanche.
    const base = html(<Switch checked ariaLabel="x" onChange={() => {}} />)
    expect(base).not.toContain('cubic-bezier(.34,1.56,.64,1)')
    expect(base).not.toContain('peer-active:w-5')
    expect(base).toContain('h-11 w-full')
    expect(html(<Switch ariaLabel="x" motion={false} />)).toContain('data-motion="off"')
  })
  test('SegmentedField: el indicador se posiciona sobre la opción activa y sigue al cambio', () => {
    const geometria = { a: [0, 0, 80, 44], b: [84, 0, 100, 44] }
    const o = ['offsetLeft', 'offsetTop', 'offsetWidth', 'offsetHeight'].map((p) => [p, Object.getOwnPropertyDescriptor(HTMLElement.prototype, p)])
    o.forEach(([p], i) => Object.defineProperty(HTMLElement.prototype, p, { configurable: true, get() { const id = this.getAttribute('title') === 'Bi' ? 'b' : this.getAttribute('title') === 'Ai' ? 'a' : null; return id ? geometria[id][i] : 0 } }))
    try {
      function Seg() { const [v, setV] = useState('a'); return <SegmentedField value={v} onChange={setV} options={[['a', 'Ai'], ['b', 'Bi']]} ariaLabel="p" /> }
      montar(pro(<Seg />))
      const ind = () => host.querySelector('[data-oc-indicador]')
      expect(ind().style.transform).toBe('translate3d(0px, 0px, 0)')
      expect(ind().style.width).toBe('80px')
      act(() => host.querySelector('button[title="Bi"]').click())
      expect(ind().style.transform).toBe('translate3d(84px, 0px, 0)')
      expect(ind().style.width).toBe('100px')
      expect(host.querySelector('button[title="Bi"]').getAttribute('aria-pressed')).toBe('true')
    } finally { o.forEach(([p, d]) => Object.defineProperty(HTMLElement.prototype, p, d)) }
  })
  test('SegmentedField sin medidas (SSR): la opción activa lleva su propio fondo', () => {
    const marcado = html(<SegmentedField value="a" onChange={() => {}} options={[['a', 'A'], ['b', 'B']]} />)
    expect(marcado).not.toContain('data-oc-indicador')
    expect(marcado).toContain('bg-fono/15')
  })
})

describe('Button: cargando y éxito', () => {
  test('sin opt-in conserva el DOM de siempre', () => {
    expect(html(<Button>Guardar</Button>)).toMatch(/<button[^>]*>Guardar<\/button>/)
  })
  test('cargando: aria-busy, clic bloqueado (también el submit) y la etiqueta sigue ocupando lugar', () => {
    const alClic = vi.fn()
    const alEnviar = vi.fn((e) => e.preventDefault())
    montar(<form onSubmit={alEnviar}><Button type="submit" cargando onClick={alClic}>Guardar</Button></form>)
    const boton = host.querySelector('button')
    expect(boton.getAttribute('aria-busy')).toBe('true')
    expect(boton.disabled).toBe(false)
    expect(boton.textContent).toBe('Guardar')
    act(() => boton.click())
    expect(alClic).not.toHaveBeenCalled()
    expect(alEnviar).not.toHaveBeenCalled()
  })
  test('cargando={false} activa la estructura sin bloquear', () => {
    const alClic = vi.fn()
    montar(<Button cargando={false} onClick={alClic}>Guardar</Button>)
    act(() => host.querySelector('button').click())
    expect(alClic).toHaveBeenCalledTimes(1)
    expect(host.querySelector('[data-oc-spinner]')).toBeNull()
  })
  test('exito: relleno ok, check dibujado y marca de destello', () => {
    montar(<Button cargando={false} exito>Guardar</Button>)
    const boton = host.querySelector('button')
    expect(boton.hasAttribute('data-oc-exito')).toBe(true)
    expect(boton.className).toContain('bg-ok')
    expect(host.querySelector('[data-oc-ok] svg')).not.toBeNull()
  })
})

describe('FormField y sacudida', () => {
  test('el mensaje de error entra con la clase de animación y el campo hereda motion', () => {
    const marcado = html(<FormField label="A" htmlFor="a" error="Mal" motion={false}><Input id="a" /></FormField>)
    expect(marcado).toContain('oc-campo-mensaje')
    expect(marcado).toContain('data-motion="off"')
    expect(marcado).toContain('group/campo')
  })
  test('el label toma el tono de marca con foco dentro y bad en error', () => {
    const marcado = html(pro(<FormField label="A" htmlFor="a"><Input id="a" /></FormField>))
    expect(marcado).toContain('group-focus-within/campo:text-fono-text')
    expect(marcado).toContain('group-has-[[aria-invalid=true]]/campo:text-bad-text')
  })
  test('sacude solo al pasar de válido a inválido, no al montar ni con motion={false}', () => {
    vi.useFakeTimers()
    montar(pro(<Input aria-invalid="true" aria-label="x" />))
    expect(host.querySelector('input').hasAttribute('data-oc-sacude')).toBe(false)
    montar(pro(<Input aria-label="x" />))
    montar(pro(<Input aria-invalid="true" aria-label="x" />))
    expect(host.querySelector('input').hasAttribute('data-oc-sacude')).toBe(true)
    act(() => { vi.advanceTimersByTime(400) })
    expect(host.querySelector('input').hasAttribute('data-oc-sacude')).toBe(false)
    montar(pro(<Input aria-label="x" motion={false} />))
    montar(pro(<Input aria-invalid="true" aria-label="x" motion={false} />))
    expect(host.querySelector('input').hasAttribute('data-oc-sacude')).toBe(false)
  })
  test('un re-render inválido no vuelve a sacudir', () => {
    vi.useFakeTimers()
    montar(pro(<Input aria-label="x" />))
    montar(pro(<Input aria-invalid="true" aria-label="x" />))
    act(() => { vi.advanceTimersByTime(400) })
    montar(pro(<Input aria-invalid="true" aria-label="x" placeholder="otra" />))
    expect(host.querySelector('input').hasAttribute('data-oc-sacude')).toBe(false)
  })
})

// AC12 — movimiento reducido. Método: (1) estático, sobre base.css: la regla
// global de reduced-motion y los bloques propios de los campos apagan
// animaciones y transiciones; (2) `data-motion="off"` las apaga por CSS;
// (3) en navegador real se comprobó con `reducedMotion: 'reduce'` (ver informe).
describe('movimiento reducido', () => {
  const css = readFileSync('src/styles/base.css', 'utf8')
  const bloques = [...css.matchAll(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n')
  test('la regla global acorta toda animación y transición', () => {
    expect(bloques).toContain('animation-duration: .01ms !important')
    expect(bloques).toContain('transition-duration: .01ms !important')
  })
  test('sacudida, mensaje, aparición, check y destello quedan sin animación', () => {
    for (const selector of ['[data-oc-sacude]', '.oc-campo-mensaje', '.oc-campo-aparece', '.oc-campo-ok path', '[data-oc-exito]']) expect(bloques).toContain(selector)
    expect(bloques).toMatch(/animation: none !important/)
  })
  test('el trazo del check y los deslizables pierden la transición', () => {
    expect(bloques).toContain('.oc-check-trazo')
    expect(bloques).toContain('[data-oc-segmentado] [data-oc-indicador]')
    expect(bloques).toContain('[data-oc-switch] *')
  })
  test('motion off apaga animación y transición del control y su contenido', () => {
    expect(css).toMatch(/\[data-motion="off"\]:not\(\[data-oc-formfield\][^{]*\{\s*animation: none !important;\s*transition: none !important/)
  })
  test('las animaciones solo corren con data-motion="on"', () => {
    for (const regla of ['[data-oc-sacude][data-motion="on"]', '[data-motion="on"] .oc-campo-mensaje', '.oc-campo-aparece[data-motion="on"]', '[data-oc-exito][data-motion="on"]']) expect(css).toContain(regla)
  })
})

describe('Ronda de correcciones del QA', () => {
  const css = readFileSync('src/styles/base.css', 'utf8')
  test('caret, selección y autofill solo aplican a los campos de la librería', () => {
    const bloque = css.slice(css.indexOf('Campos de formulario: color y selección'), css.indexOf('Campos de formulario: movimiento'))
    expect(bloque).toContain('input[data-oc-control], textarea[data-oc-control]')
    expect(bloque).toContain('input[data-oc-control]:-webkit-autofill')
    expect(bloque).not.toMatch(/^input, textarea \{/m)
    expect(bloque).not.toMatch(/^input::selection/m)
    montar(<><Input aria-label="a" /><Select aria-label="b"><option>x</option></Select><Textarea aria-label="c" /><PinInput value="" onChange={() => {}} /><input aria-label="crudo" /></>)
    const crudo = host.querySelector('input[aria-label="crudo"]')
    expect(crudo.matches('[data-oc-control]')).toBe(false)
    for (const nodo of host.querySelectorAll('input:not([aria-label="crudo"]), select, textarea')) expect(nodo.matches('[data-oc-control]')).toBe(true)
  })
  test('tabular-nums no se aplica a los campos de texto libre', () => {
    expect(css).toMatch(/input\[inputmode="numeric"\][^{]*\{\s*font-variant-numeric: tabular-nums/)
    expect(css).not.toMatch(/^input, td, \[data-money\]/m)
  })
  test('el spinner sobrevive a motion off y FormField no cascada fuera de su campo', () => {
    expect(css).toContain('*:not([data-oc-spinner])')
    expect(css).toMatch(/\[data-oc-formfield\]\[data-motion="off"\] :is\(label, \.oc-campo-mensaje/)
  })
  test('modo contraste forzado: el Checkbox vuelve al control nativo', () => {
    expect(css).toMatch(/@media \(forced-colors: active\) \{[\s\S]*?\[data-oc-checkbox\] input \{\s*appearance: auto/)
  })
  test('PasswordInput: ojo de 44 px de ancho', () => {
    montar(<PasswordInput aria-label="clave" />)
    expect(host.querySelector('[data-oc-fin] button').className).toContain('w-11')
  })
  test('Textarea contador sin maxLength positivo no dibuja nada', () => {
    montar(<Textarea contador aria-label="n" defaultValue="abc" />)
    expect(host.querySelector('[data-oc-contador]')).toBeNull()
    expect(host.textContent).not.toContain('/0')
    expect(host.querySelector('textarea').hasAttribute('aria-describedby')).toBe(false)
    montar(<Textarea contador maxLength={0} aria-label="n" defaultValue="abc" />)
    expect(host.querySelector('[data-oc-contador]')).toBeNull()
  })
  test('sin adornos no se crea ResizeObserver; con adornos sí', () => {
    const original = globalThis.ResizeObserver
    const creados = []
    globalThis.ResizeObserver = class { constructor() { creados.push(this) } observe() {} disconnect() {} }
    try {
      montar(<Input aria-label="x" />)
      expect(creados).toHaveLength(0)
      montar(<Input aria-label="x" inicio="Gs" />)
      expect(creados.length).toBeGreaterThan(0)
    } finally { globalThis.ResizeObserver = original }
  })
  test('Enter en un campo no envía el formulario si el botón submit está cargando', () => {
    // El envío implícito del navegador (Enter) dispara un clic sintético sobre el
    // botón submit por defecto: si Button lo cancela, no hay envío.
    const alEnviar = vi.fn((e) => e.preventDefault())
    montar(<form onSubmit={alEnviar}><Input aria-label="x" /><Button type="submit" cargando>Guardar</Button></form>)
    const clic = new MouseEvent('click', { bubbles: true, cancelable: true })
    act(() => { host.querySelector('button[type="submit"]').dispatchEvent(clic) })
    expect(clic.defaultPrevented).toBe(true)
    expect(alEnviar).not.toHaveBeenCalled()
  })
  test('Switch en claro: pista, borde y pulgar usan tokens con contraste', () => {
    const marcado = html(<><Switch checked ariaLabel="a" /><Switch ariaLabel="b" /></>)
    expect(marcado).toContain('border-interactivo bg-interactivo')
    expect(marcado).toContain('border-fono-dark bg-fono-dark')
    expect(marcado).toContain('bg-ink shadow')
    expect(marcado).not.toContain('bg-ink-600')
    expect(marcado).not.toContain('bg-white')
  })
  test('CountryPhoneSelect no usa el carácter ▾', () => {
    expect(readFileSync('src/components/CountryPhoneSelect.jsx', 'utf8')).not.toContain('▾')
  })
})

describe('FormulariosPro: sin interruptor se ve como la primera ola', () => {
  test('Label, Checkbox, Select y SegmentedField sin el interruptor', () => {
    const base = html(<><FormField label="A" htmlFor="a"><Input id="a" /></FormField><Checkbox label="C" checked onChange={() => {}} /><Select><option>x</option></Select><SegmentedField value="a" onChange={() => {}} options={[['a', 'A'], ['b', 'B']]} /></>)
    expect(base).not.toContain('group-focus-within/campo')
    expect(base).not.toContain('data-oc-checkbox')
    expect(base).not.toContain('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"')
    expect(base).toContain('accent-fono')
    expect(base).not.toContain('hover:bg-ink-700/60')
    expect(base).not.toContain('group-focus-within/select')
    expect(base).not.toContain('data-oc-segmentado')
    expect(base).not.toContain('data-oc-indicador')
    expect(base).not.toContain('data-oc-formularios')
  })
  test('con el interruptor se activan; el atributo CSS lo pone el proveedor', () => {
    const marcado = html(pro(<Checkbox label="C" checked onChange={() => {}} />))
    expect(marcado).toContain('data-oc-formularios="pro"')
    expect(marcado).toContain('data-oc-checkbox')
    expect(html(<FormulariosPro contenedor={false}><Checkbox label="C" onChange={() => {}} /></FormulariosPro>)).not.toContain('data-oc-formularios')
  })
  test('las reglas CSS de la segunda ola cuelgan del atributo', () => {
    const css = readFileSync('src/styles/base.css', 'utf8')
    for (const regla of ['[data-oc-formularios="pro"] [data-motion="on"] .oc-campo-mensaje', '[data-oc-formularios="pro"] [data-oc-select] > select:hover', '[data-oc-formularios="pro"] [data-oc-select]:focus-within .oc-select-chevron']) expect(css).toContain(regla)
  })
  test('sin interruptor no hay sacudida ni Esc que limpia', () => {
    vi.useFakeTimers()
    montar(<Input aria-label="x" />)
    montar(<Input aria-invalid="true" aria-label="x" />)
    expect(host.querySelector('input').hasAttribute('data-oc-sacude')).toBe(false)
    const alto = vi.fn()
    document.body.addEventListener('keydown', alto)
    let valor = 'hola'
    montar(<SearchField value={valor} onChange={() => {}} onClear={() => { valor = '' }} placeholder="Buscar" />)
    act(() => { host.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect(valor).toBe('hola')
    expect(alto).toHaveBeenCalledTimes(1)
    document.body.removeEventListener('keydown', alto)
  })
  test('SegmentedField: sin ResizeObserver sigue funcionando con el interruptor', () => {
    const original = globalThis.ResizeObserver
    globalThis.ResizeObserver = undefined
    try {
      montar(pro(<SegmentedField value="a" onChange={() => {}} options={[['a', 'A'], ['b', 'B']]} />))
      expect(host.querySelectorAll('button')).toHaveLength(2)
      expect(host.querySelector('button[aria-pressed="true"]').title).toBe('A')
    } finally { globalThis.ResizeObserver = original }
  })
  test('SegmentedField: cambiar la etiqueta de la opción activa vuelve a medir', () => {
    const geometria = { Ai: [0, 0, 80, 44], 'Ai largo': [0, 0, 140, 44] }
    const o = ['offsetLeft', 'offsetTop', 'offsetWidth', 'offsetHeight'].map((p) => [p, Object.getOwnPropertyDescriptor(HTMLElement.prototype, p)])
    o.forEach(([p], i) => Object.defineProperty(HTMLElement.prototype, p, { configurable: true, get() { const g = geometria[this.getAttribute('title')]; return g ? g[i] : 0 } }))
    try {
      montar(pro(<SegmentedField value="a" onChange={() => {}} options={[['a', 'Ai'], ['b', 'Bi']]} />))
      expect(host.querySelector('[data-oc-indicador]').style.width).toBe('80px')
      montar(pro(<SegmentedField value="a" onChange={() => {}} options={[['a', 'Ai largo'], ['b', 'Bi']]} />))
      expect(host.querySelector('[data-oc-indicador]').style.width).toBe('140px')
    } finally { o.forEach(([p, d]) => Object.defineProperty(HTMLElement.prototype, p, d)) }
  })
})
