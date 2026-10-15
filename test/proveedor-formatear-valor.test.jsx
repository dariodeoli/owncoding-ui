// @vitest-environment jsdom
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { BuscadorProveedor } from '../dist/index.js'

const proveedores = [{ id: 'p1', name: 'Ñandú Importaciones', code: 'NDU' }, { id: 'p2', name: 'Proveedor Dos', code: 'PD' }]
const formato = p => [p.code, p.name || p.nombre].filter(Boolean).join(' · ')
const input = () => screen.getByRole('combobox')
const escribir = text => fireEvent.change(input(), { target: { value: text } })
beforeEach(() => { vi.stubGlobal('CSS', { escape: value => value.replace(/:/g, '\\:') }); Element.prototype.scrollIntoView = vi.fn() })
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('API pública BuscadorProveedor.formatearValor opt-in', () => {
  test.each(['id', 'nombre', 'formato'])('selección controlada con eco %s conserva ID y no confirma libre al salir', echo => {
    const onSelect = vi.fn(), onLibre = vi.fn()
    function Controlado() {
      const [value, setValue] = useState(''), [selectedId, setSelectedId] = useState('')
      return <><BuscadorProveedor proveedores={proveedores} selectedId={selectedId} value={value} formatearValor={p => formato(p)} confirmarAlSalir onSelect={p => { onSelect(p); setSelectedId(p.id); setValue(echo === 'id' ? p.id : echo === 'nombre' ? p.name : formato(p)) }} onLibre={text => { onLibre(text); setValue(text) }} /><output>{selectedId}</output><button onClick={() => setValue('')}>Reset</button></>
    }
    render(<Controlado />)
    escribir('NDU')
    const option = screen.getByRole('option', { name: 'Ñandú ImportacionesNDU' })
    expect(option.textContent).toBe('Ñandú ImportacionesNDU')
    expect(option.textContent).not.toContain('NDU · Ñandú')
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(input().value).toBe('NDU · Ñandú Importaciones')
    fireEvent.blur(input())
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(proveedores[0])
    expect(onLibre).not.toHaveBeenCalled()
    expect(screen.getByRole('status').textContent).toBe('p1')
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(input().value).toBe('')
    fireEvent.blur(input())
    expect(onSelect).toHaveBeenCalledTimes(1); expect(onLibre).not.toHaveBeenCalled()
  })

  test.each(['NDU', 'NDU · Ñandú Importaciones'])('resolver exacto %s al salir usa formato, no onLibre ni alta', text => {
    const onSelect = vi.fn(), onLibre = vi.fn(), onCreate = vi.fn()
    render(<BuscadorProveedor proveedores={proveedores} formatearValor={formato} confirmarAlSalir onSelect={onSelect} onLibre={onLibre} onCreate={onCreate} />)
    escribir(text)
    fireEvent.keyDown(input(), { key: 'Escape' })
    fireEvent.blur(input())
    expect(input().value).toBe('NDU · Ñandú Importaciones')
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(proveedores[0])
    expect(onLibre).not.toHaveBeenCalled(); expect(onCreate).not.toHaveBeenCalled()
    fireEvent.blur(input())
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  test('selectedId y value inicial formateado no reemiten una selección ya conocida', () => {
    const onSelect = vi.fn(), onLibre = vi.fn()
    const { rerender } = render(<BuscadorProveedor proveedores={proveedores} selectedId="p1" value="p1" formatearValor={formato} confirmarAlSalir onSelect={onSelect} onLibre={onLibre} />)
    expect(input().value).toBe(formato(proveedores[0]))
    rerender(<BuscadorProveedor proveedores={proveedores} selectedId="p1" value={formato(proveedores[0])} formatearValor={formato} confirmarAlSalir onSelect={onSelect} onLibre={onLibre} />)
    fireEvent.blur(input())
    expect(onSelect).not.toHaveBeenCalled(); expect(onLibre).not.toHaveBeenCalled()
  })

  test('confirmarAlTipear emite cada edición, pero eco de sigla y selección no agrega libre al blur', () => {
    const onSelect = vi.fn(), onLibre = vi.fn()
    function Controlado() {
      const [value, setValue] = useState(''), [selectedId, setSelectedId] = useState('')
      return <BuscadorProveedor proveedores={proveedores} selectedId={selectedId} value={value} formatearValor={formato} confirmarAlTipear confirmarAlSalir onLibre={text => { onLibre(text); setValue(text) }} onSelect={p => { onSelect(p); setSelectedId(p.id); setValue(p.id) }} />
    }
    render(<Controlado />)
    escribir('NDU')
    fireEvent.keyDown(input(), { key: 'Enter' })
    fireEvent.blur(input())
    expect(onLibre.mock.calls).toEqual([['NDU']])
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(proveedores[0])
    expect(input().value).toBe(formato(proveedores[0]))
  })

  test('alta controlada conserva el proveedor antes de que llegue el catálogo y no duplica libre', async () => {
    const creado = { id: 'p3', name: 'Nuevo Proveedor', code: 'NP' }, catalogo = []
    const onCreate = vi.fn(async () => creado), onSelect = vi.fn(), onLibre = vi.fn()
    function Controlado() {
      const [value, setValue] = useState('')
      return <BuscadorProveedor proveedores={catalogo} value={value} formatearValor={formato} confirmarAlSalir onCreate={onCreate} onSelect={p => { onSelect(p); setValue(p.id) }} onLibre={onLibre} />
    }
    render(<Controlado />)
    escribir('Nuevo Proveedor')
    fireEvent.click(screen.getByRole('option', { name: 'Crear proveedor «Nuevo Proveedor»' }))
    await vi.waitFor(() => expect(input().value).toBe('NP · Nuevo Proveedor'))
    fireEvent.blur(input())
    fireEvent.focus(input())
    expect(screen.queryByRole('option', { name: /Crear proveedor/ })).toBeNull()
    expect(onCreate).toHaveBeenCalledExactlyOnceWith('Nuevo Proveedor')
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(creado)
    expect(onLibre).not.toHaveBeenCalled()
  })

  test('formatter inline no interrumpe edición; texto libre confirmado sigue deduplicado', () => {
    const onLibre = vi.fn()
    function Controlado() {
      const [tick, setTick] = useState(0), [value, setValue] = useState('p1')
      return <BuscadorProveedor proveedores={proveedores} value={value} formatearValor={p => formato(p)} confirmarAlSalir onQueryChange={() => setTick(tick + 1)} onLibre={text => { onLibre(text); setValue(text) }} />
    }
    render(<Controlado />)
    escribir(' Libre ')
    expect(input().value).toBe(' Libre ')
    fireEvent.keyDown(input(), { key: 'Enter' })
    fireEvent.blur(input())
    expect(input().value).toBe('Libre')
    expect(onLibre.mock.calls).toEqual([['Libre']])
  })

  test('readOnly mantiene valor formateado sin permitir edición ni callbacks', () => {
    const onSelect = vi.fn(), onLibre = vi.fn(), onCreate = vi.fn()
    render(<BuscadorProveedor proveedores={proveedores} selectedId="p1" value="p1" formatearValor={formato} confirmarAlSalir confirmarAlTipear onSelect={onSelect} onLibre={onLibre} onCreate={onCreate} inputProps={{ readOnly: true }} />)
    fireEvent.focus(input()); escribir('PD'); fireEvent.keyDown(input(), { key: 'Enter' }); fireEvent.blur(input())
    expect(input().value).toBe(formato(proveedores[0])); expect(input().readOnly).toBe(true)
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onSelect).not.toHaveBeenCalled(); expect(onLibre).not.toHaveBeenCalled(); expect(onCreate).not.toHaveBeenCalled()
  })

  test('sin formateador sigue mostrando solo el nombre elegido', () => {
    render(<BuscadorProveedor proveedores={proveedores} selectedId="p1" />)
    expect(input().value).toBe('Ñandú Importaciones')
  })

  test.each(['reset', 'catálogo', 'catálogo y reset'])('%s invalida el proveedor anterior y no resucita su ID al confirmar texto', cambio => {
    const onSelect = vi.fn(), onLibre = vi.fn(), vacios = []
    function Controlado() {
      const [value, setValue] = useState(''), [selectedId, setSelectedId] = useState(''), [catalogo, setCatalogo] = useState(proveedores)
      return <><BuscadorProveedor proveedores={catalogo} value={value} selectedId={selectedId} formatearValor={formato} confirmarAlSalir onQueryChange={setValue} onLibre={onLibre} onSelect={p => { onSelect(p); setSelectedId(p.id); setValue(p.id) }} /><button onClick={() => { if (cambio !== 'reset') setCatalogo(vacios); if (cambio !== 'catálogo') { setValue(''); setSelectedId('') } }}>Cambiar contexto</button></>
    }
    render(<Controlado />)
    escribir('NDU')
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(proveedores[0])
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contexto' }))
    escribir(formato(proveedores[0]))
    fireEvent.keyDown(input(), { key: 'Escape' })
    fireEvent.blur(input())
    // Un reset con el mismo catálogo permite resolver nuevamente su proveedor real.
    if (cambio === 'reset') {
      expect(onSelect).toHaveBeenCalledTimes(2)
      expect(onSelect).toHaveBeenLastCalledWith(proveedores[0])
      expect(onLibre).not.toHaveBeenCalled()
    } else {
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onLibre).toHaveBeenCalledExactlyOnceWith(formato(proveedores[0]))
    }
  })

})
