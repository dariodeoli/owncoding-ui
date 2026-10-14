// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { FormField, FormulariosPro, Input, MoneyInput, PasswordInput, Select, Textarea } from '../src/index.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const CSS = readFileSync(join(process.cwd(), 'src/styles/base.css'), 'utf8')
const html = (nodo) => renderToStaticMarkup(nodo)

// Selector de la regla que sube el label (la que declara `--oc-flota: 1`).
// Se evalúa con el motor de selectores de jsdom (soporta :has, :where y
// :placeholder-shown); `:-webkit-autofill` no existe ahí y `:where()` lo perdona,
// así que el autofill se simula con el gancho `[data-oc-autofill]`.
function selectorFlotada() {
  const regla = /(\[data-oc-flotante\]:where\([\s\S]*?\) > \.oc-etiqueta-flotante) \{\s*--oc-flota: 1;/.exec(CSS)
  if (!regla) throw new Error('No se encontró la regla de etiqueta flotada en base.css')
  return regla[1].replace(/\s+/g, ' ')
}

let raiz
let contenedor
function montar(nodo) {
  contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  raiz = createRoot(contenedor)
  act(() => { raiz.render(nodo) })
  return contenedor
}
afterEach(() => {
  act(() => raiz?.unmount())
  contenedor?.remove()
  raiz = undefined
})

const sube = (cont) => Boolean(cont.querySelector(selectorFlotada()))

describe('etiquetaFlotante: marcado', () => {
  test('apagada por defecto: el label de siempre y ningún cambio en el DOM', () => {
    const marcado = html(<FormField label="Nombre" htmlFor="n"><Input id="n" /></FormField>)
    expect(marcado).not.toContain('data-oc-flotante')
    expect(marcado).not.toContain('oc-etiqueta-flotante')
    expect(marcado).not.toContain('placeholder=')
    expect(marcado).toMatch(/<label class="mb-1\.5[^>]*for="n"/)
  })

  test('encendida: sigue siendo un <label for> real y el control recibe placeholder de un espacio', () => {
    const marcado = html(<FormField etiquetaFlotante label="Nombre" htmlFor="n"><Input id="n" /></FormField>)
    expect(marcado).toContain('data-oc-flotante')
    expect(marcado).toMatch(/<label for="n"[^>]*data-oc-etiqueta-flotante/)
    expect(marcado).toMatch(/<input[^>]*placeholder=" "/)
  })

  test('respeta el placeholder propio y no se lo pone al Select', () => {
    expect(html(<FormField etiquetaFlotante label="N" htmlFor="n"><Input id="n" placeholder="Ej. Ana" /></FormField>)).toContain('placeholder="Ej. Ana"')
    expect(html(<FormField etiquetaFlotante label="Z" htmlFor="z"><Select id="z"><option>a</option></Select></FormField>)).not.toContain('placeholder=')
  })

  test('requerido conserva el asterisco decorativo y aria-required en el control', () => {
    const marcado = html(<FormField etiquetaFlotante requerido label="Nombre" htmlFor="n"><Input id="n" /></FormField>)
    expect(marcado).toContain('data-oc-requerido')
    expect(marcado).toContain('aria-required="true"')
  })

  test('el mensaje de error sigue fuera del envoltorio y enlazado por aria-describedby', () => {
    const marcado = html(<FormField etiquetaFlotante label="Nombre" htmlFor="n" error="Falta"><Input id="n" /></FormField>)
    expect(marcado).toMatch(/aria-describedby="n-descripcion"/)
    expect(marcado.indexOf('data-oc-flotante')).toBeLessThan(marcado.indexOf('role="alert"'))
    expect(marcado.indexOf('</div><p')).toBeGreaterThan(0)
  })

  test('con `accion` el label queda dentro de la columna del control', () => {
    const marcado = html(<FormField etiquetaFlotante label="RUC" htmlFor="r" accion={<button type="button">Ir</button>}><Input id="r" /></FormField>)
    expect(marcado.indexOf('flex-1')).toBeLessThan(marcado.indexOf('data-oc-flotante'))
    expect(marcado.indexOf('data-oc-flotante')).toBeLessThan(marcado.indexOf('<button'))
  })

  test('sin htmlFor avisa por consola y deja el label normal', () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const marcado = html(<FormField etiquetaFlotante label="Nombre"><Input /></FormField>)
    expect(aviso).toHaveBeenCalledOnce()
    expect(marcado).not.toContain('data-oc-flotante')
    aviso.mockRestore()
  })

  test('FormulariosPro no cambia el marcado flotante', () => {
    const marcado = html(<FormulariosPro><FormField etiquetaFlotante label="Nombre" htmlFor="n"><Input id="n" /></FormField></FormulariosPro>)
    expect(marcado).toContain('oc-etiqueta-flotante')
  })
})

describe('etiquetaFlotante: cuándo sube el label (reglas reales de base.css)', () => {
  test('reposa con el campo vacío y sin foco', () => {
    const cont = montar(<FormField etiquetaFlotante label="Nombre" htmlFor="n"><Input id="n" /></FormField>)
    expect(sube(cont)).toBe(false)
  })

  test('sube con foco y vuelve a reposar al salir', () => {
    const cont = montar(<FormField etiquetaFlotante label="Nombre" htmlFor="n"><Input id="n" /></FormField>)
    act(() => cont.querySelector('input').focus())
    expect(sube(cont)).toBe(true)
    act(() => cont.querySelector('input').blur())
    expect(sube(cont)).toBe(false)
  })

  test('sube con valor (controlado y no controlado)', () => {
    const a = montar(<FormField etiquetaFlotante label="Nombre" htmlFor="n"><Input id="n" defaultValue="Ana" onChange={() => {}} /></FormField>)
    expect(sube(a)).toBe(true)
    act(() => raiz.unmount()); a.remove()
    const b = montar(<FormField etiquetaFlotante label="Nombre" htmlFor="n"><Input id="n" value="Luis" onChange={() => {}} /></FormField>)
    expect(sube(b)).toBe(true)
  })

  test('sube con autocompletado (simulado con [data-oc-autofill])', () => {
    const cont = montar(<FormField etiquetaFlotante label="Correo" htmlFor="c"><Input id="c" data-oc-autofill="" /></FormField>)
    expect(sube(cont)).toBe(true)
  })

  test('con un placeholder propio sigue reposando hasta que hay foco o valor', () => {
    const cont = montar(<FormField etiquetaFlotante label="Nombre" htmlFor="n"><Input id="n" placeholder="Ej. Ana" /></FormField>)
    expect(sube(cont)).toBe(false)
  })

  test('con adorno `inicio` (MoneyInput) queda siempre arriba', () => {
    const cont = montar(<FormField etiquetaFlotante label="Anticipo" htmlFor="m"><MoneyInput id="m" value="" onValueChange={() => {}} /></FormField>)
    expect(cont.querySelector('[data-oc-inicio]')).not.toBeNull()
    expect(sube(cont)).toBe(true)
  })

  test('con adorno `fin` (ojo de PasswordInput) reposa vacío y sube con foco', () => {
    const cont = montar(<FormField etiquetaFlotante label="Clave" htmlFor="p"><PasswordInput id="p" /></FormField>)
    expect(cont.querySelector('[data-oc-fin]')).not.toBeNull()
    expect(sube(cont)).toBe(false)
    act(() => cont.querySelector('input').focus())
    expect(sube(cont)).toBe(true)
  })

  test('el Select y la fecha nunca chocan con el label: quedan arriba', () => {
    const cont = montar(<FormField etiquetaFlotante label="Zona" htmlFor="z"><Select id="z"><option>a</option></Select></FormField>)
    expect(sube(cont)).toBe(true)
  })

  test('el Textarea sube con valor', () => {
    const vacio = montar(<FormField etiquetaFlotante label="Notas" htmlFor="t"><Textarea id="t" /></FormField>)
    expect(sube(vacio)).toBe(false)
    act(() => raiz.unmount()); vacio.remove()
    const lleno = montar(<FormField etiquetaFlotante label="Notas" htmlFor="t"><Textarea id="t" defaultValue="hola" /></FormField>)
    expect(sube(lleno)).toBe(true)
  })
})

describe('etiquetaFlotante: contrato de la hoja de estilos', () => {
  test('cubre Safari/Chrome y Firefox para el autocompletado', () => {
    expect(CSS).toContain(':has([data-oc-control]:-webkit-autofill)')
    expect(CSS).toContain(':has([data-oc-control]:autofill)')
  })

  test('sin transición con reduced-motion y con motion={false} (por la regla del FormField)', () => {
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.oc-etiqueta-flotante \{ transition: none !important; \}/)
    expect(CSS).toMatch(/\[data-oc-formfield\]\[data-motion="off"\] :is\(label,/)
  })

  test('no toca la altura del control: solo relleno superior', () => {
    const bloque = CSS.slice(CSS.indexOf('Etiqueta flotante (opt-in'), CSS.indexOf('Campos de formulario: movimiento'))
    expect(bloque).not.toMatch(/(?<![-\w])(?:min-|max-)?height\s*:/)
    expect(bloque).toContain('padding-top')
  })

  test('sin :has() el label queda arriba (nunca sobre el valor)', () => {
    expect(CSS).toContain('@supports not selector(:has(*))')
  })
})
