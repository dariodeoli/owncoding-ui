// @vitest-environment jsdom
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { BuscadorProveedor, RucField } from '../src/index.js'

const proveedores = [
  { id: 'p1', name: 'Ñandú Importaciones', code: 'NDU' },
  { id: 'p2', name: 'Proveedor Dos', code: 'PD' },
]
beforeEach(() => {
  vi.stubGlobal('CSS', { escape: value => value.replace(/:/g, '\\:') })
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

const proveedorInput = () => screen.getByRole('combobox')
const escribir = texto => fireEvent.change(proveedorInput(), { target: { value: texto } })

describe('proveedor con texto libre opt-in', () => {
  test('el contrato anterior no confirma al tipear ni al salir y crea desde dos caracteres', () => {
    const onSelect = vi.fn(), onCreate = vi.fn(), onQueryChange = vi.fn()
    render(<BuscadorProveedor proveedores={proveedores} onSelect={onSelect} onCreate={onCreate} onQueryChange={onQueryChange} />)
    escribir('Nuevo')
    fireEvent.blur(proveedorInput())
    expect(onSelect).not.toHaveBeenCalled()
    expect(onCreate).not.toHaveBeenCalled()
    expect(onQueryChange).toHaveBeenCalledWith('Nuevo')
    expect(screen.getByRole('option', { name: 'Crear proveedor «Nuevo»' })).toBeTruthy()
    escribir('X')
    expect(screen.queryByRole('option')).toBeNull()
  })

  test('emite texto y vacío al tipear solo cuando se activa la opción', () => {
    const onLibre = vi.fn(), onQueryChange = vi.fn()
    render(<BuscadorProveedor onLibre={onLibre} onQueryChange={onQueryChange} confirmarAlTipear />)
    escribir('Libre')
    escribir('')
    expect(onLibre.mock.calls).toEqual([['Libre'], ['']])
    expect(onQueryChange.mock.calls).toEqual([['Libre'], ['']])
  })

  test('onLibre solo no confirma al salir, pero sí la fila libre mediante Enter', () => {
    const onLibre = vi.fn()
    render(<BuscadorProveedor onLibre={onLibre} />)
    escribir(' X ')
    fireEvent.blur(proveedorInput())
    expect(onLibre).not.toHaveBeenCalled()
    fireEvent.keyDown(proveedorInput(), { key: 'Enter' })
    expect(onLibre).toHaveBeenCalledExactlyOnceWith('X')
  })

  test('confirma nombre libre recortado al salir sin crear ni repetir después de Enter', () => {
    const onLibre = vi.fn(), onCreate = vi.fn()
    render(<BuscadorProveedor onLibre={onLibre} onCreate={onCreate} confirmarAlSalir />)
    escribir(' Nuevo ')
    fireEvent.keyDown(proveedorInput(), { key: 'Escape' })
    fireEvent.keyDown(proveedorInput(), { key: 'Enter' })
    fireEvent.blur(proveedorInput())
    expect(onLibre).toHaveBeenCalledExactlyOnceWith('Nuevo')
    expect(onCreate).not.toHaveBeenCalled()
    expect(proveedorInput().getAttribute('aria-expanded')).toBe('false')
  })

  test.each(['p1', 'nandu importaciones', 'ndu'])('resuelve coincidencia exacta %s al salir', texto => {
    const onLibre = vi.fn(), onSelect = vi.fn()
    render(<BuscadorProveedor proveedores={proveedores} onLibre={onLibre} onSelect={onSelect} confirmarAlSalir />)
    escribir(texto)
    fireEvent.blur(proveedorInput())
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(proveedores[0])
    expect(onLibre).not.toHaveBeenCalled()
    expect(proveedorInput().value).toBe('Ñandú Importaciones')
  })

  test('mantiene navegación de teclado y selección sin confirmación libre posterior', () => {
    const onSelect = vi.fn(), onLibre = vi.fn()
    render(<BuscadorProveedor proveedores={proveedores} onSelect={onSelect} onLibre={onLibre} confirmarAlSalir />)
    fireEvent.focus(proveedorInput())
    fireEvent.keyDown(proveedorInput(), { key: 'ArrowDown' })
    const activo = proveedorInput().getAttribute('aria-activedescendant')
    expect(document.getElementById(activo).textContent).toContain('Proveedor Dos')
    fireEvent.keyDown(proveedorInput(), { key: 'Enter' })
    fireEvent.blur(proveedorInput())
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(proveedores[1])
    expect(onLibre).not.toHaveBeenCalled()
  })

  test('el clic conserva el foco, selecciona y no confirma dos veces', () => {
    const onSelect = vi.fn(), onLibre = vi.fn()
    render(<BuscadorProveedor proveedores={proveedores} onSelect={onSelect} onLibre={onLibre} confirmarAlSalir />)
    escribir('Ñandú')
    const opcion = screen.getByRole('option', { name: /Ñandú Importaciones/ })
    expect(fireEvent.mouseDown(opcion)).toBe(false)
    fireEvent.click(opcion)
    fireEvent.blur(proveedorInput())
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(proveedores[0])
    expect(onLibre).not.toHaveBeenCalled()
  })

  test('value sincroniza id, texto y reset, y deja selectedId anterior disponible', () => {
    const onLibre = vi.fn(), onSelect = vi.fn()
    const { rerender, unmount } = render(<BuscadorProveedor proveedores={proveedores} value="p1" selectedId="p2" onSelect={onSelect} onLibre={onLibre} confirmarAlSalir />)
    expect(proveedorInput().value).toBe('Ñandú Importaciones')
    fireEvent.blur(proveedorInput())
    expect(onSelect).not.toHaveBeenCalled()
    rerender(<BuscadorProveedor proveedores={proveedores} value="Texto libre" onLibre={onLibre} confirmarAlSalir />)
    expect(proveedorInput().value).toBe('Texto libre')
    rerender(<BuscadorProveedor proveedores={proveedores} value="" onLibre={onLibre} confirmarAlSalir />)
    fireEvent.blur(proveedorInput())
    expect(proveedorInput().value).toBe('')
    expect(onLibre).not.toHaveBeenCalled()
    unmount()
    render(<BuscadorProveedor proveedores={proveedores} selectedId="p2" />)
    expect(proveedorInput().value).toBe('Proveedor Dos')
  })

  test('onCreate conserva prioridad frente a onLibre en la fila nueva', async () => {
    const creado = { id: 'p3', name: 'Nuevo' }
    const onCreate = vi.fn(async () => creado), onLibre = vi.fn(), onSelect = vi.fn()
    render(<BuscadorProveedor onCreate={onCreate} onLibre={onLibre} onSelect={onSelect} confirmarAlSalir />)
    escribir('Nuevo')
    fireEvent.click(screen.getByRole('option', { name: 'Crear proveedor «Nuevo»' }))
    await vi.waitFor(() => expect(onSelect).toHaveBeenCalledWith(creado))
    fireEvent.blur(proveedorInput())
    expect(onCreate).toHaveBeenCalledExactlyOnceWith('Nuevo')
    expect(onLibre).not.toHaveBeenCalled()
  })

  test.each([false, true])('Enter y blur confirman una sola vez después del eco controlado (catálogo omitido: %s)', omitido => {
    const onLibre = vi.fn()
    const catalogoEstable = []
    function Controlado() {
      const [value, setValue] = useState(' Libre ')
      return <BuscadorProveedor {...(omitido ? {} : { proveedores: catalogoEstable })} value={value} confirmarAlSalir onLibre={texto => { onLibre(texto); setValue(texto) }} />
    }
    render(<Controlado />)
    fireEvent.focus(proveedorInput())
    fireEvent.keyDown(proveedorInput(), { key: 'Enter' })
    expect(proveedorInput().value).toBe('Libre')
    fireEvent.blur(proveedorInput())
    expect(onLibre.mock.calls).toEqual([['Libre']])
  })

  test('readOnly no confirma ni permite selección, alta o edición al enfocar y salir', () => {
    const onLibre = vi.fn(), onSelect = vi.fn(), onCreate = vi.fn(), onQueryChange = vi.fn()
    render(<BuscadorProveedor proveedores={proveedores} value="Libre" confirmarAlSalir confirmarAlTipear onLibre={onLibre} onSelect={onSelect} onCreate={onCreate} onQueryChange={onQueryChange} inputProps={{ readOnly: true }} />)
    fireEvent.focus(proveedorInput())
    expect(screen.queryByRole('listbox')).toBeNull()
    fireEvent.keyDown(proveedorInput(), { key: 'ArrowDown' })
    fireEvent.keyDown(proveedorInput(), { key: 'Enter' })
    fireEvent.blur(proveedorInput())
    expect(onLibre).not.toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled()
    expect(onCreate).not.toHaveBeenCalled()
    expect(onQueryChange).not.toHaveBeenCalled()
    expect(proveedorInput().value).toBe('Libre')
    expect(proveedorInput().readOnly).toBe(true)
  })

  test('al deshabilitar no confirma texto pendiente', () => {
    const onLibre = vi.fn()
    const { rerender } = render(<BuscadorProveedor value="Libre" onLibre={onLibre} confirmarAlSalir />)
    rerender(<BuscadorProveedor value="Libre" onLibre={onLibre} confirmarAlSalir disabled />)
    fireEvent.blur(proveedorInput())
    expect(onLibre).not.toHaveBeenCalled()
  })
})

describe('resultado RUC compacto con consentimiento explícito', () => {
  const resultado = { name: 'Empresa Ñandú', fullRuc: '80012345-6', simulado: true }
  async function resultadoVisible(props = {}) {
    const consultar = vi.fn(async () => resultado)
    const view = render(<RucField value="80012345-6" onChange={() => {}} consultar={consultar} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Extraer los datos del RUC' }))
    await screen.findByRole('status')
    return view
  }

  test('normal sigue sin Descartar y sin aplicación automática', async () => {
    const onAplicar = vi.fn(), onDescartar = vi.fn()
    await resultadoVisible({ onAplicar, onDescartar })
    expect(screen.queryByRole('button', { name: 'Descartar' })).toBeNull()
    expect(onAplicar).not.toHaveBeenCalled()
    expect(onDescartar).not.toHaveBeenCalled()
    expect(screen.getByRole('status').className).toBe('flex flex-wrap items-center justify-between gap-3 rounded-xl border border-fono/25 bg-fono/5 p-3 text-sm')
  })

  test('compacta muestra identidad y aviso; Descartar limpia sugerencia sin modificar RUC ni aplicar', async () => {
    const onAplicar = vi.fn(), onDescartar = vi.fn(), onChange = vi.fn()
    await resultadoVisible({ variante: 'compacta', onAplicar, onDescartar, onChange })
    expect(screen.getByRole('status').textContent).toContain('Empresa Ñandú')
    expect(screen.getByRole('status').textContent).toContain('RUC 80012345-6')
    expect(screen.getByRole('status').textContent).toContain('Resultado ficticio')
    expect(onAplicar).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }))
    expect(screen.queryByRole('status')).toBeNull()
    expect(onDescartar).toHaveBeenCalledExactlyOnceWith()
    expect(onAplicar).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox').value).toBe('80012345-6')
  })

  test('compacta aplica únicamente al pulsar Usar estos datos', async () => {
    const onAplicar = vi.fn(), onDescartar = vi.fn()
    await resultadoVisible({ variante: 'compacta', onAplicar, onDescartar })
    fireEvent.click(screen.getByRole('button', { name: 'Usar estos datos' }))
    expect(onAplicar).toHaveBeenCalledExactlyOnceWith(resultado)
    expect(onDescartar).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).toBeNull()
  })
})
