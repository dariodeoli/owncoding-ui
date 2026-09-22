import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { Drawer, Modal, SELECTOR_ENFOCABLES, destinoDeTab, useDialogFocusTrap } from '../src/index.js'

// El comportamiento de los diálogos vive en un solo hook: scroll bloqueado,
// foco inicial, ciclo de Tab, Esc y devolución del foco.

const fuente = readFileSync(new URL('../src/components/ui.jsx', import.meta.url), 'utf8')
const hook = readFileSync(new URL('../src/hooks/useDialogFocusTrap.js', import.meta.url), 'utf8')
const reglas = readFileSync(new URL('../docs/REGLAS.md', import.meta.url), 'utf8')

describe('useDialogFocusTrap (#1)', () => {
  test('el ciclo de Tab decide el extremo y no interviene en el medio', () => {
    const primero = { id: 'primero' }
    const ultimo = { id: 'ultimo' }
    const contenedor = { id: 'contenedor' }
    const base = { primero, ultimo, contenedor }

    // Tab desde el último vuelve al primero; Shift+Tab desde el primero (o el
    // contenedor, que tiene tabIndex -1) va al último.
    expect(destinoDeTab({ ...base, activo: ultimo, shiftKey: false })).toBe(primero)
    expect(destinoDeTab({ ...base, activo: primero, shiftKey: true })).toBe(ultimo)
    expect(destinoDeTab({ ...base, activo: contenedor, shiftKey: true })).toBe(ultimo)
    // Si el foco se escapó del contenedor, se lo devuelve adentro.
    expect(destinoDeTab({ ...base, activo: {}, shiftKey: false, fuera: true })).toBe(primero)
    expect(destinoDeTab({ ...base, activo: {}, shiftKey: true, fuera: true })).toBe(ultimo)
    // En el medio no se mete: lo maneja el navegador.
    expect(destinoDeTab({ ...base, activo: {}, shiftKey: false })).toBe(null)
    // Sin enfocables no hay a dónde saltar.
    expect(destinoDeTab({ ...base, primero: undefined, activo: ultimo, shiftKey: false })).toBe(null)
  })

  test('Modal y Drawer comparten el hook, sin la copia inline', () => {
    expect(typeof useDialogFocusTrap).toBe('function')
    expect(SELECTOR_ENFOCABLES).toContain('button:not(:disabled)')
    expect(fuente).toContain('useDialogFocusTrap(open, onClose, dialog)')
    expect(fuente).toContain('useDialogFocusTrap(open, onClose, panel)')
    expect(fuente).not.toContain("document.body.style.overflow = 'hidden'")
    expect(fuente).not.toContain("querySelectorAll('button:not(:disabled)")
  })

  test('el hook cubre scroll, foco inicial, Tab, Esc y retorno del foco', () => {
    expect(hook).toContain("document.body.style.overflow = 'hidden'")
    expect(hook).toContain("evento.key === 'Escape'")
    expect(hook).toContain('initialFocus')
    expect(hook).toContain('anterior?.isConnected')
    expect(hook).toContain('bloquearScroll')
  })

  test('Modal y Drawer siguen renderizando el diálogo accesible', () => {
    const modal = renderToStaticMarkup(<Modal open title="Proveedores">…</Modal>)
    expect(modal).toContain('role="dialog"')
    expect(modal).toContain('aria-modal="true"')
    expect(modal).toContain('Proveedores')

    const drawer = renderToStaticMarkup(<Drawer open title="Detalle" side="left">…</Drawer>)
    expect(drawer).toContain('role="dialog"')
    expect(drawer).toContain('left-0 border-r')

    expect(renderToStaticMarkup(<Modal open={false} title="Cerrado" />)).toBe('')
    expect(renderToStaticMarkup(<Drawer open={false} title="Cerrado" />)).toBe('')
  })

  test('la regla queda documentada', () => {
    expect(reglas).toContain('`useDialogFocusTrap(open, onClose, ref)`')
  })
})
