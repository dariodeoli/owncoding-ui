// @vitest-environment jsdom
// Shell para paneles (pedido OwnData): NavLateral con enlaces y chip,
// SelectorEspacio y paleta sobria del Avatar. Todo aditivo y opt-in.
import { act, forwardRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createRoot } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  Avatar,
  COLORES_AVATAR_SOBRIOS,
  NavLateral,
  ProductFooter,
  SelectorEspacio,
  claveColorDeNombre,
  colorDeNombre,
} from '../src/index.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let contenedor
let raiz

beforeEach(() => {
  contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  raiz = createRoot(contenedor)
  // jsdom no implementa la navegación de los enlaces reales.
  contenedor.addEventListener('click', (event) => event.preventDefault())
})

afterEach(() => {
  act(() => raiz.unmount())
  contenedor.remove()
})

const montar = (elemento) => act(async () => raiz.render(elemento))
const clic = (nodo) => act(async () => nodo.dispatchEvent(new MouseEvent('click', { bubbles: true })))
const tecla = (nodo, key) => act(async () => nodo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })))
const abrirMenu = () => clic(contenedor.querySelector('button[aria-haspopup="menu"]'))

describe('NavLateral con enlaces y chip', () => {
  const Enlace = forwardRef(({ href, children, ...props }, ref) => (
    <a ref={ref} href={href} data-enlace-propio="si" {...props}>{children}</a>
  ))
  const items = [
    { id: 'resumen', label: 'Resumen', icono: 'home', href: '/panel' },
    { id: 'ajustes', label: 'Ajustes', icono: 'settings' },
    { id: 'facturas', label: 'Facturas', icono: 'money', href: '/facturas', chip: 'Próximamente' },
  ]

  test('los ítems con href son enlaces del componenteEnlace y el activo lleva aria-current', async () => {
    await montar(<NavLateral items={items} activeId="resumen" componenteEnlace={Enlace} />)
    const enlaces = [...contenedor.querySelectorAll('a[data-enlace-propio]')]
    expect(enlaces.map((nodo) => nodo.getAttribute('href'))).toEqual(['/panel', '/facturas'])
    expect(enlaces[0].getAttribute('aria-current')).toBe('page')
    expect(enlaces[1].getAttribute('aria-current')).toBeNull()
  })

  test('sin componenteEnlace usa <a> y avisa onSelect', async () => {
    const onSelect = vi.fn()
    await montar(<NavLateral items={items} onSelect={onSelect} />)
    const enlace = contenedor.querySelector('a[href="/panel"]')
    expect(enlace.hasAttribute('data-enlace-propio')).toBe(false)
    await clic(enlace)
    expect(onSelect).toHaveBeenCalledWith('resumen')
  })

  test('los ítems sin href siguen siendo botones con el mismo comportamiento', async () => {
    const onSelect = vi.fn()
    await montar(<NavLateral items={items} activeId="ajustes" onSelect={onSelect} componenteEnlace={Enlace} />)
    const boton = [...contenedor.querySelectorAll('button')].find((nodo) => nodo.textContent.includes('Ajustes'))
    expect(boton.getAttribute('type')).toBe('button')
    expect(boton.getAttribute('aria-current')).toBe('page')
    await clic(boton)
    expect(onSelect).toHaveBeenCalledWith('ajustes')
  })

  test('el chip se dibuja junto al texto y, colapsado, queda para lectores de pantalla', async () => {
    await montar(<NavLateral items={items} />)
    expect(contenedor.querySelector('a[href="/facturas"]').textContent).toContain('Próximamente')
    await montar(<NavLateral items={items} colapsado />)
    const chip = [...contenedor.querySelectorAll('a[href="/facturas"] .sr-only')].map((nodo) => nodo.textContent)
    expect(chip).toContain('Próximamente')
  })

  test('tactil sube las filas a 44 px y sin él no cambia nada', async () => {
    await montar(<NavLateral items={items} />)
    expect(contenedor.querySelector('a').className).not.toContain('min-h-11')
    await montar(<NavLateral items={items} tactil />)
    expect(contenedor.querySelector('a').className).toContain('min-h-11')
  })
})

describe('SelectorEspacio', () => {
  const espacios = [
    { id: 'a', nombre: 'Acme S.A.', detalle: 'Propietario' },
    { id: 'b', nombre: 'Norte SRL' },
  ]

  test('elige un espacio, marca el activo y cierra devolviendo el foco', async () => {
    const onCambiar = vi.fn()
    await montar(<SelectorEspacio espacios={espacios} valor="a" onCambiar={onCambiar} />)
    await abrirMenu()
    const filas = contenedor.querySelectorAll('[role="menuitemradio"]')
    expect(filas).toHaveLength(2)
    expect(filas[0].getAttribute('aria-checked')).toBe('true')
    expect(filas[0].querySelector('svg')).not.toBeNull()
    expect(filas[1].getAttribute('aria-checked')).toBe('false')
    expect(filas[1].className).toContain('min-h-11')
    await clic(filas[1])
    expect(onCambiar).toHaveBeenCalledWith('b')
    expect(contenedor.querySelector('[role="menu"]')).toBeNull()
  })

  test('elegir el espacio activo no dispara onCambiar', async () => {
    const onCambiar = vi.fn()
    await montar(<SelectorEspacio espacios={espacios} valor="a" onCambiar={onCambiar} />)
    await abrirMenu()
    await clic(contenedor.querySelector('[aria-checked="true"]'))
    expect(onCambiar).not.toHaveBeenCalled()
  })

  test('teclado: flechas recorren, Fin va al último y Esc cierra', async () => {
    await montar(<SelectorEspacio espacios={espacios} valor="a" onCambiar={() => {}} acciones={[{ label: 'Crear empresa' }]} />)
    await abrirMenu()
    await act(async () => new Promise((resolver) => requestAnimationFrame(() => resolver())))
    const items = [...contenedor.querySelectorAll('[data-item]')]
    expect(document.activeElement).toBe(items[0])
    await tecla(document.activeElement, 'ArrowDown')
    expect(document.activeElement).toBe(items[1])
    await tecla(document.activeElement, 'End')
    expect(document.activeElement).toBe(items[2])
    await tecla(document.activeElement, 'ArrowDown')
    expect(document.activeElement).toBe(items[0])
    await tecla(document.activeElement, 'Escape')
    expect(contenedor.querySelector('[role="menu"]')).toBeNull()
  })

  test('el pie de acciones se dibuja y dispara sus callbacks', async () => {
    const onCrear = vi.fn()
    await montar(<SelectorEspacio espacios={espacios} valor="a" acciones={[{ id: 'crear', label: '+ Crear empresa', onClick: onCrear }, { id: 'inv', label: 'Aceptar invitación', href: '/invitacion' }]} />)
    await abrirMenu()
    const acciones = [...contenedor.querySelectorAll('[aria-label="Acciones del espacio"] [role="menuitem"]')]
    expect(acciones.map((nodo) => nodo.textContent)).toEqual(['+ Crear empresa', 'Aceptar invitación'])
    expect(acciones[1].getAttribute('href')).toBe('/invitacion')
    await clic(acciones[0])
    expect(onCrear).toHaveBeenCalledTimes(1)
  })

  test('cargando muestra estado y error muestra alerta con reintento', async () => {
    const onReintentar = vi.fn()
    await montar(<SelectorEspacio espacios={[]} estado="cargando" defaultAbierto />)
    expect(contenedor.querySelector('[role="status"]').textContent).toContain('Cargando espacios')
    expect(contenedor.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(contenedor.querySelector('[role="menuitemradio"]')).toBeNull()
    await montar(<SelectorEspacio espacios={[]} estado="error" onReintentar={onReintentar} defaultAbierto />)
    expect(contenedor.querySelector('[role="alert"]').textContent).toContain('No se pudieron cargar')
    await clic([...contenedor.querySelectorAll('button')].find((nodo) => nodo.textContent === 'Reintentar'))
    expect(onReintentar).toHaveBeenCalledTimes(1)
  })

  test('cambiando bloquea la lista y las acciones con aria-busy', async () => {
    const onCambiar = vi.fn()
    const onCrear = vi.fn()
    await montar(<SelectorEspacio espacios={espacios} valor="a" onCambiar={onCambiar} acciones={[{ label: 'Crear', onClick: onCrear }]} cambiando defaultAbierto />)
    expect(contenedor.querySelector('button[aria-haspopup="menu"]').getAttribute('aria-busy')).toBe('true')
    expect(contenedor.querySelector('[aria-busy="true"][id]')).not.toBeNull()
    const filas = [...contenedor.querySelectorAll('[role="menuitemradio"]')]
    expect(filas.every((fila) => fila.getAttribute('aria-disabled') === 'true')).toBe(true)
    await clic(filas[1])
    await clic(contenedor.querySelector('[role="menuitem"]'))
    expect(onCambiar).not.toHaveBeenCalled()
    expect(onCrear).not.toHaveBeenCalled()
    expect(contenedor.querySelector('[role="menu"]')).not.toBeNull()
  })

  test('Esc devuelve el foco al botón', async () => {
    await montar(<SelectorEspacio espacios={espacios} valor="a" />)
    await abrirMenu()
    await tecla(contenedor.querySelector('[data-item]'), 'Escape')
    await act(async () => new Promise((resolver) => requestAnimationFrame(() => resolver())))
    expect(document.activeElement).toBe(contenedor.querySelector('button[aria-haspopup="menu"]'))
  })
})

// ── Avatar sobria ──────────────────────────────────────────────────────────
const tokens = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')
function paleta(apertura) {
  const lineas = tokens.split('\n')
  for (let inicio = 0; inicio < lineas.length; inicio += 1) {
    if (!lineas[inicio].trim().startsWith(apertura)) continue
    let fin = inicio
    while (fin < lineas.length && !/^\}/.test(lineas[fin])) fin += 1
    const bloque = lineas.slice(inicio, fin).join('\n')
    if (!/--c-ink:/.test(bloque)) continue
    const resultado = {}
    for (const m of bloque.matchAll(/--c-([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+);/g)) resultado[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])]
    return resultado
  }
  throw new Error(`sin bloque ${apertura}`)
}
const luminancia = ([r, g, b]) => {
  const f = (v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contraste = (a, b) => { const [alto, bajo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x); return (alto + 0.05) / (bajo + 0.05) }
const mezcla = (color, alfa, fondo) => color.map((v, i) => v * alfa + fondo[i] * (1 - alfa))

describe('Avatar paleta sobria', () => {
  const NOMBRES = Array.from({ length: 400 }, (_, i) => `Empresa ${i} ${String.fromCharCode(65 + (i % 26))}${i * 7}`)

  test('nunca produce un tono semántico y sin paleta nada cambia', () => {
    const prohibidos = /\b(ok|bad|warn|pass|reserved|fono)\b/
    const vistas = new Set()
    for (const nombre of NOMBRES) {
      const clase = colorDeNombre(nombre, 'sobria')
      vistas.add(claveColorDeNombre(nombre, 'sobria'))
      expect(clase).toBe(COLORES_AVATAR_SOBRIOS[claveColorDeNombre(nombre, 'sobria')])
      expect(clase.replace(/-/g, ' ')).not.toMatch(prohibidos)
      expect(clase).not.toMatch(/(?:ok|bad|warn|pass|reserved|fono)(?:[-/]|\b)/)
    }
    expect([...vistas].sort()).toEqual(Object.keys(COLORES_AVATAR_SOBRIOS).sort())
    expect(colorDeNombre('Persona Demo')).toBe(colorDeNombre('Persona Demo', undefined))
    expect(claveColorDeNombre('Persona Demo')).not.toBe(undefined)
  })

  test('el componente aplica la paleta solo cuando se pide', async () => {
    await montar(<Avatar nombre="Acme Demo" paleta="sobria" />)
    expect(Object.values(COLORES_AVATAR_SOBRIOS)).toContain(contenedor.firstChild.className.match(/bg-\S+ text-\S+/)[0])
    await montar(<Avatar nombre="Acme Demo" />)
    expect(contenedor.firstChild.className).toContain(colorDeNombre('Acme Demo'))
  })

  test('las iniciales cumplen 4.5:1 en claro y oscuro', () => {
    const temas = { claro: paleta(':root {'), oscuro: paleta('html.dark {') }
    const claro = { ...temas.claro }
    const oscuro = { ...temas.claro, ...temas.oscuro }
    for (const [nombre, tema] of Object.entries({ claro, oscuro })) {
      const fondoBase = tema.ink
      const casos = {
        azul: [mezcla(tema.info, 0.15, fondoBase), tema['info-text']],
        'azul-fuerte': [mezcla(tema.info, 0.25, fondoBase), tema.fore],
        gris: [tema['ink-600'], tema.fore],
        'gris-fuerte': [mezcla(tema['ink-500'], 0.5, fondoBase), tema.fore],
      }
      for (const [clave, [fondo, texto]] of Object.entries(casos)) {
        expect(contraste(fondo, texto), `${clave} en ${nombre}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })
})

describe('Shell: textos, disparador, forma, lado y encabezado (#25)', () => {
  const espacios = [
    { id: 'a', nombre: 'Acme Distribuidora de Alimentos y Bebidas S.A.', detalle: 'Propietario' },
    { id: 'p', nombre: 'Ana Pérez', detalle: 'Personal', avatar: 'https://lh3.googleusercontent.com/foto', forma: 'redondo' },
  ]

  test('SelectorEspacio: locale en traduce el copy y textos lo pisa; el español no cambia', async () => {
    const reintentar = () => {}
    await montar(<SelectorEspacio espacios={[]} estado="error" onReintentar={reintentar} defaultAbierto />)
    expect(contenedor.textContent).toContain('Reintentar')
    await montar(<SelectorEspacio espacios={[]} estado="error" onReintentar={reintentar} defaultAbierto locale="en" />)
    expect(contenedor.querySelector('[role="alert"]').textContent).toBe('Workspaces could not be loaded.')
    expect(contenedor.textContent).toContain('Retry')
    expect(contenedor.querySelector('button[aria-haspopup="menu"]').getAttribute('aria-label')).toBe('Switch workspace: Choose workspace')
    await montar(<SelectorEspacio espacios={[]} estado="error" onReintentar={reintentar} defaultAbierto locale="en" textos={{ reintentar: 'Try again' }} />)
    expect(contenedor.textContent).toContain('Try again')
    expect(contenedor.textContent).not.toContain('Retry')
    await montar(<SelectorEspacio espacios={[]} estado="cargando" defaultAbierto locale="en" />)
    expect(contenedor.querySelector('[role="status"]').textContent).toBe('Loading workspaces…')
    await montar(<SelectorEspacio espacios={[]} locale="xx" defaultAbierto />)
    expect(contenedor.textContent).toContain('Todavía no hay espacios.')
    await montar(<SelectorEspacio espacios={[]} locale="en" ariaLabel="Mi etiqueta" />)
    expect(contenedor.querySelector('button').getAttribute('aria-label')).toBe('Mi etiqueta: Choose workspace')
  })

  test('SelectorEspacio: el disparador muestra el detalle (opt-in) y title con el nombre completo', async () => {
    await montar(<SelectorEspacio espacios={espacios} valor="a" />)
    const base = contenedor.querySelector('button[aria-haspopup="menu"]')
    expect(base.getAttribute('title')).toBe(espacios[0].nombre)
    expect(base.textContent).not.toContain('Propietario')
    await montar(<SelectorEspacio espacios={espacios} valor="a" mostrarDetalle />)
    const con = contenedor.querySelector('button[aria-haspopup="menu"]')
    const detalle = [...con.querySelectorAll('span')].find((nodo) => nodo.textContent === 'Propietario')
    expect(detalle.className).toContain('truncate')
    expect(con.querySelector('span.truncate').textContent).toBe(espacios[0].nombre)
  })

  test('SelectorEspacio: formaAvatar/espacio.forma redondo llena el círculo; por defecto sigue cuadrado', async () => {
    await montar(<SelectorEspacio espacios={espacios} valor="p" defaultAbierto />)
    const foto = contenedor.querySelector('button[aria-haspopup="menu"] img')
    expect(foto.parentElement.className).toContain('rounded-full')
    expect(foto.className).toContain('object-cover')
    await montar(<SelectorEspacio espacios={[{ id: 'e', nombre: 'Empresa', avatar: 'https://x.test/logo.png' }]} valor="e" />)
    const logo = contenedor.querySelector('button[aria-haspopup="menu"] img')
    expect(logo.parentElement.className).toContain('rounded-lg')
    expect(logo.className).toContain('object-contain')
    await montar(<SelectorEspacio espacios={[{ id: 'e', nombre: 'Empresa', avatar: 'https://x.test/logo.png' }]} valor="e" formaAvatar="redondo" />)
    expect(contenedor.querySelector('button[aria-haspopup="menu"] img').className).toContain('object-cover')
  })

  test('Avatar: forma redondo usa object-cover y cuadrado object-contain', () => {
    const redondo = renderToStaticMarkup(<Avatar nombre="Ana" src="https://x.test/a.jpg" forma="redondo" />)
    expect(redondo).toContain('rounded-full')
    expect(redondo).toContain('object-cover')
    const cuadrado = renderToStaticMarkup(<Avatar nombre="Acme" src="https://x.test/a.jpg" empresa />)
    expect(cuadrado).toContain('object-contain')
  })

  test('SelectorEspacio: lado arriba abre hacia arriba, sin min-w-64 fijo, y conserva teclado y Esc', async () => {
    await montar(<SelectorEspacio espacios={espacios} valor="a" lado="arriba" />)
    await abrirMenu()
    const panel = contenedor.querySelector('[id][tabindex="-1"]')
    expect(panel.className).toContain('bottom-full')
    expect(panel.className).not.toContain('mt-1')
    expect(panel.className).not.toContain('min-w-64')
    expect(panel.className).toContain('min-w-[min(16rem,calc(100vw-2rem))]')
    const filas = contenedor.querySelectorAll('[role="menuitemradio"]')
    expect(document.activeElement).toBe(filas[0])
    await tecla(panel, 'ArrowDown')
    expect(document.activeElement).toBe(filas[1])
    await tecla(panel, 'Escape')
    await act(async () => new Promise((resolver) => requestAnimationFrame(() => resolver())))
    expect(contenedor.querySelector('[role="menu"]')).toBeNull()
    expect(document.activeElement).toBe(contenedor.querySelector('button[aria-haspopup="menu"]'))
    await montar(<SelectorEspacio espacios={espacios} valor="a" />)
    await abrirMenu()
    expect(contenedor.querySelector('[id][tabindex="-1"]').className).toContain('mt-1')
  })

  test('NavLateral: sin cabecera ni onToggle no dibuja la franja de encabezado', async () => {
    await montar(<NavLateral items={[{ id: 'a', label: 'Inicio' }]} />)
    expect(contenedor.querySelector('nav').firstElementChild.tagName).toBe('DIV')
    expect(contenedor.querySelector('nav').firstElementChild.className).toContain('overflow-y-auto')
    await montar(<NavLateral items={[{ id: 'a', label: 'Inicio' }]} cabecera={<b>Logo</b>} />)
    expect(contenedor.querySelector('nav').firstElementChild.className).toContain('py-3')
    await montar(<NavLateral items={[{ id: 'a', label: 'Inicio' }]} onToggle={() => {}} />)
    expect(contenedor.querySelector('nav button[aria-expanded]')).not.toBeNull()
  })

  test('NavLateral: locale en y textos; los rótulos de grupo miden 44 px con tactil', async () => {
    const grupos = [{ titulo: 'Ventas', items: [{ id: 'a', label: 'Pedidos' }] }]
    await montar(<NavLateral grupos={grupos} onToggle={() => {}} />)
    expect(contenedor.querySelector('nav').getAttribute('aria-label')).toBe('Navegación principal')
    expect(contenedor.querySelector('button[aria-label="Contraer menú"]')).not.toBeNull()
    expect(contenedor.querySelector('button[title="Ocultar Ventas"]').className).not.toContain('min-h-11')
    await montar(<NavLateral grupos={grupos} onToggle={() => {}} locale="en" tactil />)
    expect(contenedor.querySelector('nav').getAttribute('aria-label')).toBe('Main navigation')
    expect(contenedor.querySelector('button[aria-label="Collapse menu"]')).not.toBeNull()
    const grupo = contenedor.querySelector('button[title="Hide Ventas"]')
    expect(grupo.className).toContain('min-h-11')
    await montar(<NavLateral grupos={grupos} onToggle={() => {}} locale="en" textos={{ ocultarGrupo: 'Fold {titulo}', contraer: 'Fold menu' }} />)
    expect(contenedor.querySelector('button[title="Fold Ventas"]')).not.toBeNull()
    expect(contenedor.querySelector('button[aria-label="Fold menu"]')).not.toBeNull()
    await montar(<NavLateral grupos={grupos} locale="en" ariaLabel="Principal" />)
    expect(contenedor.querySelector('nav').getAttribute('aria-label')).toBe('Principal')
  })
})

describe('ProductFooter modelo panel', () => {
  test('la variante panel es delgada (opt-in) y el modelo compacto no cambia', () => {
    const panel = renderToStaticMarkup(<ProductFooter nombre="Demo" modelo="panel" anio={2026} />)
    expect(panel).toContain('data-modelo="panel"')
    expect(panel).toContain('py-2')
    expect(panel).not.toContain('py-4')
    expect(panel).toContain('min-h-8')
    expect(panel).toContain('toque-44')
    const compacto = renderToStaticMarkup(<ProductFooter nombre="Demo" anio={2026} />)
    expect(compacto).toContain('py-4')
    expect(compacto).toContain('min-h-11')
    expect(compacto).toContain('. Todos los derechos reservados.')
  })
})
