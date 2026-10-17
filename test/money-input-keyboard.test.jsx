// @vitest-environment jsdom
import React, { useState } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MoneyInput } from '../src/components/ui.jsx'

let frames
beforeEach(() => {
  frames = []
  vi.stubGlobal('requestAnimationFrame', (callback) => { frames.push(callback); return frames.length })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
function Form(props) {
  const [value, setValue] = useState('')
  return <><MoneyInput aria-label="Importe" currency="USD" {...props} value={value} onValueChange={setValue} /><output data-testid="value">{String(value)}</output></>
}
function key(input, key) {
  if (fireEvent.keyDown(input, { key })) {
    let start = input.selectionStart, end = input.selectionEnd
    if (key === 'Backspace' && start === end) start = Math.max(0, start - 1)
    if (key === 'Delete' && start === end) end += 1
    const text = input.value.slice(0, start) + (key.length === 1 ? key : '') + input.value.slice(end)
    const caret = start + (key.length === 1 ? key.length : 0)
    fireEvent.input(input, { target: { value: text, selectionStart: caret, selectionEnd: caret } })
  }
  frames.splice(0).forEach((callback) => callback())
}
function type(input, text) { [...text].forEach((character) => key(input, character)) }
function mount(props) { render(<Form {...props} />); const input = screen.getByLabelText('Importe'); input.focus(); return input }

test.each(['100.25', '100,25'])('escribir %s por tecla conserva centavos y caret', (text) => {
  const input = mount()
  expect(input.value).toBe('')
  type(input, text)
  expect(input.value).toBe('100,25')
  expect(screen.getByTestId('value').textContent).toBe('100.25')
  expect(input.selectionStart).toBe(6)
  key(input, '9')
  expect(input.value).toBe('100,25')
})
test('decimal inicial y borrar el separador no convierten centavos a enteros', () => {
  const input = mount()
  type(input, '.25')
  expect(input.value).toBe('0,25')
  input.setSelectionRange(2, 2)
  key(input, 'Backspace')
  expect(input.value).toBe('0,25')
  expect(input.selectionStart).toBe(1)
  key(input, 'Delete')
  expect(input.value).toBe('0,25')
  expect(input.selectionStart).toBe(2)
})
test.each(['.', ','])('selección total y %s25 reemplaza el importe por centavos', (separator) => {
  const input = mount()
  type(input, '100.25')
  input.setSelectionRange(0, input.value.length)
  type(input, `${separator}25`)
  expect(input.value).toBe('0,25')
  expect(screen.getByTestId('value').textContent).toBe('0.25')
})
test.each(['.', ','])('cero existente sin RAF pendiente admite selección total y %s25', (separator) => {
  const input = mount()
  type(input, '0')
  expect(frames).toHaveLength(0)
  input.setSelectionRange(0, input.value.length)
  type(input, `${separator}25`)
  expect(input.value).toBe('0,25')
  expect(screen.getByTestId('value').textContent).toBe('0.25')
})
test('restaura caret aunque el padre rechace la actualización y no haya commit', () => {
  render(<MoneyInput aria-label="Importe" currency="USD" value="100.25" onValueChange={() => {}} />)
  const input = screen.getByLabelText('Importe')
  input.focus()
  input.setSelectionRange(1, 1)
  key(input, '9')
  expect(input.value).toBe('100,25')
  expect(input.selectionStart).toBe(2)
  input.setSelectionRange(4, 4)
  key(input, '4')
  expect(input.value).toBe('100,25')
  expect(input.selectionStart).toBe(5)
})
test('reemplaza centavos existentes y permite borrar y editar la fracción', () => {
  const input = mount()
  type(input, '100.25')
  key(input, ',')
  type(input, '47')
  expect(input.value).toBe('100,47')
  input.setSelectionRange(5, 5)
  key(input, 'Backspace')
  expect(input.value).toBe('100,70')
  expect(input.selectionStart).toBe(4)
  key(input, '2')
  expect(input.value).toBe('100,20')
  input.setSelectionRange(4, 5)
  key(input, 'Delete')
  expect(input.value).toBe('100,00')
  input.setSelectionRange(0, input.value.length)
  key(input, 'Backspace')
  expect(input.value).toBe('')
  expect(screen.getByTestId('value').textContent).toBe('')
})
test.each([{ currency: 'PYG' }, { currency: 'USD', integerOnly: true }])('enteros mantienen agrupación, edición y separadores bloqueados: %j', (props) => {
  const input = mount(props)
  type(input, '12345')
  expect(input.value).toBe('12.345')
  key(input, ',')
  key(input, '.')
  expect(input.value).toBe('12.345')
  input.setSelectionRange(2, 2)
  key(input, 'Backspace')
  expect(input.value).toBe('1.345')
  expect(input.selectionStart).toBe(1)
})
test.each(['1.250,50', '1,250.50'])('pegado %s conserva normalización pública', (text) => {
  const input = mount()
  fireEvent.input(input, { target: { value: text, selectionStart: text.length, selectionEnd: text.length } })
  frames.splice(0).forEach((callback) => callback())
  expect(input.value).toBe('1.250,50')
  expect(screen.getByTestId('value').textContent).toBe('1250.50')
})
