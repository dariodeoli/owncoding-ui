// Objetos de Configuración (#253): el checkbox de formulario (selección
// múltiple) y el estado de guardado transversal (#162). El guardado contra la
// API lo maneja la app; acá se fija el dibujo y la accesibilidad.
import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { Checkbox, EstadoGuardado } from '../src/index.js'

describe('Checkbox', () => {
  test('simple: label asociado al control y estado marcado', () => {
    const html = renderToStaticMarkup(<Checkbox label="Aplica descuento" checked onChange={() => {}} />)
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked=""')
    expect(html).toContain('Aplica descuento')
    const para = html.match(/for="([^"]+)"/)?.[1]
    expect(para, 'el label apunta al input').toBeTruthy()
    expect(html).toContain(`id="${para}"`)
  })

  test('tarjeta: título y descripción, con el borde del ajuste', () => {
    const html = renderToStaticMarkup(
      <Checkbox
        variante="tarjeta"
        label="Notificaciones"
        descripcion="Mostrar el aviso de novedades."
        checked
        onChange={() => {}}
      />,
    )
    expect(html).toContain('Notificaciones')
    expect(html).toContain('Mostrar el aviso de novedades.')
    expect(html).toContain('rounded-xl border border-ink-600')
  })

  test('sin label queda el control pelado con aria-label y tono', () => {
    const html = renderToStaticMarkup(
      <Checkbox ariaLabel="Seleccionar trabajo" tono="bad" disabled onChange={() => {}} />,
    )
    expect(html).toContain('aria-label="Seleccionar trabajo"')
    expect(html).toContain('accent-bad')
    expect(html).toContain('disabled=""')
    expect(html).not.toContain('<label')
  })
})

describe('EstadoGuardado', () => {
  test('ok: chip verde con el texto y anuncio educado', () => {
    const html = renderToStaticMarkup(<EstadoGuardado testId="datos-estado" estado={{ ok: true, texto: 'Guardado…' }} />)
    expect(html).toContain('data-testid="datos-estado"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('Guardado…')
    expect(html).toContain('text-ok')
  })

  test('error: aviso con role="alert"', () => {
    const html = renderToStaticMarkup(<EstadoGuardado estado={{ ok: false, texto: 'No se pudo guardar.' }} />)
    expect(html).toContain('role="alert"')
    expect(html).toContain('No se pudo guardar.')
    expect(html).toContain('text-bad')
  })

  test('sin estado no dibuja nada adentro', () => {
    const html = renderToStaticMarkup(<EstadoGuardado testId="x" estado={null} />)
    expect(html).toContain('data-testid="x"')
    expect(html).toContain('aria-live="polite"')
    expect(html).not.toContain('text-ok')
    expect(html).not.toContain('text-bad')
  })
})
