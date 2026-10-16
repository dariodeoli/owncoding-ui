// @vitest-environment jsdom
import { act, StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Drawer, Modal } from '../src/index.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
let host, root
beforeEach(() => {
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  // jsdom no calcula geometría. Solo habilita la visibilidad del filtro de Tab;
  // el montaje, eventos, foco y atributos se verifican en nodos DOM reales.
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{ width: 100, height: 44 }])
  document.body.style.overflow = 'auto'
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
  vi.restoreAllMocks()
  document.body.style.overflow = ''
})
const click = async node => act(async () => node.dispatchEvent(new MouseEvent('click', { bubbles: true })))
const key = async (node, value, shiftKey = false) => act(async () => node.dispatchEvent(new KeyboardEvent('keydown', { key: value, shiftKey, bubbles: true, cancelable: true })))
const dialog = title => [...host.querySelectorAll('[role="dialog"]')].find(node => node.querySelector('h2')?.textContent === title)
const unique = title => {
  expect([...host.querySelectorAll('[aria-modal="true"]')]).toEqual([dialog(title)])
}

function Scenario({ Parent = Modal, initialChild = false }) {
  const [parent, setParent] = useState(false)
  const [child, setChild] = useState(initialChild)
  return <>
    <button data-open onClick={() => setParent(true)}>Abrir ficha</button>
    {parent && <Parent open title="Ficha" onClose={() => setParent(false)}>
      <button data-child onClick={() => setChild(true)}>Editar identidad</button>
      {child && <Modal open title="Identidad" onClose={() => setChild(false)}>
        <input aria-label="Razón social" />
        <button data-last>Guardar</button>
      </Modal>}
    </Parent>}
  </>
}

test.each([
  ['Modal', Modal, false], ['Modal StrictMode', Modal, true],
  ['Drawer', Drawer, false], ['Drawer StrictMode', Drawer, true],
])('%s: abrir, cerrar y reabrir hijo conserva un solo modal, Tab/Escape y foco', async (_name, Parent, strict) => {
  const tree = <Scenario Parent={Parent} />
  await act(async () => root.render(strict ? <StrictMode>{tree}</StrictMode> : tree))
  const opener = host.querySelector('[data-open]')
  opener.focus()
  await click(opener)
  unique('Ficha')
  const childOpener = host.querySelector('[data-child]')
  for (let cycle = 0; cycle < 2; cycle++) {
    childOpener.focus()
    await click(childOpener)
    unique('Identidad')
    expect(dialog('Ficha').hasAttribute('aria-modal')).toBe(false)
    expect(document.activeElement).toBe(dialog('Identidad'))
    expect(document.body.style.overflow).toBe('hidden')
    const first = dialog('Identidad').querySelector('button')
    const last = host.querySelector('[data-last]')
    last.focus()
    await key(last, 'Tab')
    expect(document.activeElement).toBe(first)
    await key(first, 'Tab', true)
    expect(document.activeElement).toBe(last)
    opener.focus()
    expect(document.activeElement).toBe(dialog('Identidad'))
    await key(dialog('Identidad'), 'Escape')
    expect(dialog('Identidad')).toBeUndefined()
    unique('Ficha')
    expect(document.activeElement).toBe(childOpener)
    expect(document.body.style.overflow).toBe('hidden')
  }
  await key(dialog('Ficha'), 'Escape')
  expect(host.querySelector('[role="dialog"]')).toBeNull()
  expect(document.activeElement).toBe(opener)
  expect(document.body.style.overflow).toBe('auto')
})

test('hijo abierto al montar bajo StrictMode y desmontaje completo no dejan capas ni scroll bloqueado', async () => {
  await act(async () => root.render(<StrictMode><Scenario initialChild /></StrictMode>))
  host.querySelector('[data-open]').focus()
  await click(host.querySelector('[data-open]'))
  unique('Identidad')
  expect(document.activeElement).toBe(dialog('Identidad'))
  await act(async () => root.render(null))
  expect(document.body.style.overflow).toBe('auto')
  await act(async () => root.render(<Modal open title="Nueva ficha" onClose={() => {}}><button>Acción</button></Modal>))
  unique('Nueva ficha')
  expect(document.activeElement).toBe(dialog('Nueva ficha'))
})
