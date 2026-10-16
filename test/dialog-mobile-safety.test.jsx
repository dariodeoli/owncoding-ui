// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createPortal } from 'react-dom'
import { useRef, useState } from 'react'
import { DialogMobileSafety, Drawer, Modal, useDialogMobileSafety } from '../src/index.js'

let viewport
beforeEach(() => {
  vi.useFakeTimers()
  viewport = new EventTarget()
  viewport.scale = 1
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); document.body.style.overflow = ''; Object.defineProperty(window, 'scrollX', { configurable: true, value: 0 }) })

function contenido(nombre) {
  return <div data-testid={`${nombre}-clip`} style={{ overflowX: 'hidden' }}><input aria-label={nombre} /><div data-testid={`${nombre}-carousel`} style={{ overflowX: 'auto' }}><button>Horario {nombre}</button></div></div>
}
function Nested() {
  const [child, setChild] = useState(false)
  return <Modal open mobileSafe title="Padre">{contenido('padre')}<button onClick={() => setChild(true)}>Abrir hijo</button>
    <Drawer open={child} onClose={() => setChild(false)} title="Hijo">{contenido('hijo')}</Drawer>
  </Modal>
}

describe('dialog mobile safety opt-in', () => {
  it('no instala protección por defecto; prop y provider funcionan incluso en portales', () => {
    const add = vi.spyOn(viewport, 'addEventListener')
    const plain = render(<Modal open title="Original"><input aria-label="original" /></Modal>)
    expect(screen.getByRole('dialog').dataset.ocMobileSafety).toBeUndefined()
    expect(add).not.toHaveBeenCalled()
    plain.unmount()
    const active = render(<DialogMobileSafety>{createPortal(<Drawer open title="Portal">{contenido('portal')}</Drawer>, document.body)}</DialogMobileSafety>)
    expect(screen.getByRole('dialog').dataset.ocMobileSafety).toBe('true')
    expect(add).toHaveBeenCalledWith('resize', expect.any(Function))
    active.unmount()
    render(<DialogMobileSafety><Modal open mobileSafe={false} title="Excepción" /></DialogMobileSafety>)
    expect(screen.getByRole('dialog').dataset.ocMobileSafety).toBe('false')
  })

  it('corrige el scroll oculto en foco/scroll, conserva Y y los carruseles X intencionales', () => {
    render(<Modal open mobileSafe title="Formulario">{contenido('campo')}</Modal>)
    const clip = screen.getByTestId('campo-clip'), carousel = screen.getByTestId('campo-carousel')
    clip.scrollLeft = 34; clip.scrollTop = 57; carousel.scrollLeft = 88
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 12 })
    screen.getByLabelText('campo').focus()
    expect(clip.scrollLeft).toBe(0); expect(clip.scrollTop).toBe(57); expect(carousel.scrollLeft).toBe(88)
    expect(window.scrollTo).toHaveBeenCalledWith(0, window.scrollY)
    clip.scrollLeft = 19; fireEvent.scroll(clip)
    expect(clip.scrollLeft).toBe(0)
    carousel.scrollLeft = 60; fireEvent.scroll(carousel)
    expect(carousel.scrollLeft).toBe(60)
    clip.scrollLeft = 17; vi.advanceTimersByTime(120)
    expect(clip.scrollLeft).toBe(0)
  })

  it('respeta pinch zoom y vuelve a reparar tras terminar el zoom', () => {
    render(<Modal open mobileSafe title="Zoom">{contenido('zoom')}</Modal>)
    const clip = screen.getByTestId('zoom-clip')
    viewport.scale = 2; clip.scrollLeft = 70
    screen.getByLabelText('zoom').focus(); fireEvent.scroll(clip); viewport.dispatchEvent(new Event('resize')); vi.advanceTimersByTime(500)
    expect(clip.scrollLeft).toBe(70); expect(window.scrollTo).not.toHaveBeenCalled()
    viewport.scale = 1; viewport.dispatchEvent(new Event('resize'))
    expect(clip.scrollLeft).toBe(0)
  })

  it('solo repara la capa superior sin robar foco y devuelve el control al padre', () => {
    render(<Nested />)
    const parentClip = screen.getByTestId('padre-clip')
    fireEvent.click(screen.getByText('Abrir hijo'))
    const childInput = screen.getByLabelText('hijo'), childClip = screen.getByTestId('hijo-clip')
    parentClip.scrollLeft = 41; childClip.scrollLeft = 52
    childInput.focus()
    expect(document.activeElement).toBe(childInput)
    expect(childClip.scrollLeft).toBe(0); expect(parentClip.scrollLeft).toBe(41)
    fireEvent.keyDown(childInput, { key: 'Escape' })
    expect(screen.queryByLabelText('hijo')).toBeNull()
    const parentInput = screen.getByLabelText('padre')
    parentInput.focus()
    expect(document.activeElement).toBe(parentInput); expect(parentClip.scrollLeft).toBe(0)
  })

  it('limpia todos los listeners y timeouts al desmontar o desactivar la prop', () => {
    const setTimer = vi.spyOn(window, 'setTimeout'), clearTimer = vi.spyOn(window, 'clearTimeout')
    const addDocument = vi.spyOn(document, 'addEventListener'), removeDocument = vi.spyOn(document, 'removeEventListener')
    const addViewport = vi.spyOn(viewport, 'addEventListener'), removeViewport = vi.spyOn(viewport, 'removeEventListener')
    const view = render(<Modal open mobileSafe title="Limpieza">{contenido('limpieza')}</Modal>)
    screen.getByLabelText('limpieza').focus()
    expect(setTimer.mock.calls.filter(([, delay]) => [120, 350].includes(delay))).toHaveLength(4)
    const clip = screen.getByTestId('limpieza-clip')
    view.rerender(<Modal open mobileSafe={false} title="Limpieza">{contenido('limpieza')}</Modal>)
    setTimer.mock.calls.forEach(([, delay], index) => {
      if ([120, 350].includes(delay)) expect(clearTimer).toHaveBeenCalledWith(setTimer.mock.results[index].value)
    })
    clip.scrollLeft = 33; fireEvent.scroll(clip); vi.advanceTimersByTime(500)
    expect(clip.scrollLeft).toBe(33)
    for (const [name, listener] of addDocument.mock.calls.filter(([name]) => name === 'scroll')) {
      expect(removeDocument).toHaveBeenCalledWith(name, listener, { capture: true })
    }
    for (const [name, listener] of addViewport.mock.calls) expect(removeViewport).toHaveBeenCalledWith(name, listener)
    view.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('el hook sirve para overlays propios sin depender de clases Tailwind', () => {
    function Custom() {
      const ref = useRef(null)
      const enabled = useDialogMobileSafety(true, ref, { enabled: true })
      return <section ref={ref} role="dialog" data-oc-mobile-safety={String(enabled)}>{contenido('propio')}</section>
    }
    const view = render(<Custom />)
    const clip = screen.getByTestId('propio-clip')
    clip.scrollLeft = 42; screen.getByLabelText('propio').focus()
    expect(clip.scrollLeft).toBe(0)
    view.unmount(); clip.scrollLeft = 47; vi.advanceTimersByTime(500); expect(clip.scrollLeft).toBe(47)
  })
})
