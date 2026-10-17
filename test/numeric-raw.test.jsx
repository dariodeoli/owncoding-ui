// @vitest-environment jsdom
import {createRef, useState} from 'react'
import {afterEach, describe, expect, test, vi} from 'vitest'
import {cleanup, fireEvent, render} from '@testing-library/react'
import {InputBase, TextareaBase, NumericControl, NumberInput, PercentageInput} from '../src/numeric/index.js'
import {numberInputProblem, numberInputValid, nativeNumberSettings} from '../src/numeric/number-utils.js'
afterEach(cleanup)

describe('validación decimal exacta, sin coerción del borrador', () => {
  test.each([
    ['', 'integer', {}, ''], ['', 'decimal', {required:true}, 'Completá este campo.'],
    ['-', 'decimal', {}, 'Ingresá un número válido.'], ['-.', 'decimal', {}, 'Ingresá un número válido.'],
    ['0', 'integer', {}, ''], ['-12', 'integer', {}, ''], ['1.5', 'integer', {}, 'Ingresá un número entero.'],
    ['9007199254740993', 'integer', {max:'9007199254740992'}, 'El valor máximo es 9007199254740992.'],
    ['-9007199254740993', 'integer', {min:'-9007199254740992'}, 'El valor mínimo es -9007199254740992.'],
    ['1.', 'decimal', {}, ''], ['.25', 'decimal', {step:'.05'}, ''],
    ['0.3', 'decimal', {step:'.1'}, ''], ['0.31', 'decimal', {step:'.1'}, 'Usá incrementos de .1.'],
    ['0.35', 'decimal', {min:'.05', step:'.1'}, ''],
    ['1.20', 'decimal', {precision:1}, 'Usá hasta 1 decimales.'],
    ['1', 'integer', {min:'oops'}, 'Revisá los límites del campo.'],
    ['1', 'decimal', {step:'0'}, 'Revisá el incremento del campo.'],
    ['1e-2', 'decimal', {}, 'Ingresá un número válido.'],
    ['1e-2', 'decimal', {notation:'native',step:'.01'}, ''],
    ['1e309', 'decimal', {notation:'native'}, 'Ingresá un número válido.'],
    ['1e-4000', 'integer', {notation:'native'}, ''],
  ])('%s / %s / %j', (raw, policy, rules, message) => {
    expect(numberInputProblem(raw, policy, rules)).toBe(message)
    expect(numberInputValid(raw, policy, rules)).toBe(!message)
  })
  test('el tercer argumento es opcional y native conserva step/base heredados', () => {
    expect(numberInputProblem('1', 'integer')).toBe('')
    expect(nativeNumberSettings({})).toEqual({policy:'integer',step:1})
    expect(nativeNumberSettings({step:'any'})).toEqual({policy:'decimal',step:'any'})
    expect(nativeNumberSettings({step:'0'})).toEqual({policy:'integer',step:1})
    expect(nativeNumberSettings({defaultValue:'.2'})).toEqual({policy:'decimal',step:1})
    expect(nativeNumberSettings({min:'0',defaultValue:'.2'})).toEqual({policy:'integer',step:1})
  })
})

describe('DOM nativo y fachadas del mismo motor', () => {
  test('InputBase/TextareaBase preservan refs, eventos, ARIA y pending', () => {
    const input=createRef(), textarea=createRef(), onChange=vi.fn()
    const view=render(<><InputBase ref={input} aria-describedby="first" describedBy="second" invalid onChange={onChange} /><TextareaBase ref={textarea} pending /></>)
    expect(input.current).toBeInstanceOf(HTMLInputElement)
    expect(textarea.current).toBeInstanceOf(HTMLTextAreaElement)
    expect(input.current.getAttribute('aria-describedby')).toBe('first second')
    expect(input.current.getAttribute('aria-invalid')).toBe('true')
    expect(textarea.current.disabled).toBe(true)
    fireEvent.change(input.current,{target:{value:'RAW'}})
    expect(onChange.mock.calls[0][0].target).toBe(input.current)
    view.rerender(<InputBase ref={input} aria-invalid="grammar" aria-busy="true" />)
    expect(input.current.getAttribute('aria-invalid')).toBe('grammar')
    expect(input.current.getAttribute('aria-busy')).toBe('true')
  })
  test('native event, RAW parciales, ref real, FormData y customValidity', () => {
    const input=createRef(), onChange=vi.fn()
    const {container}=render(<form><NumericControl ref={input} policy="decimal" name="amount" required step=".1" onChange={onChange}/></form>)
    expect(input.current.type).toBe('text')
    expect(input.current.validationMessage).toBe('Completá este campo.')
    for(const raw of ['-','-.','1.','-1.2','0']) {
      fireEvent.change(input.current,{target:{value:raw}})
      expect(input.current.value).toBe(raw)
      expect(onChange.mock.calls.at(-1)[0].target).toBe(input.current)
      expect(new FormData(container.querySelector('form')).get('amount')).toBe(raw)
    }
    fireEvent.change(input.current,{target:{value:'0.31'}})
    expect(input.current.validationMessage).toBe('Usá incrementos de .1.')
    fireEvent.change(input.current,{target:{value:'0.3'}})
    expect(input.current.checkValidity()).toBe(true)
  })
  test('la fachada string conserva el borrador controlado y unidad explícita sin recorte', () => {
    const input=createRef()
    function Controlled(){const [value,setValue]=useState('');return <PercentageInput ref={input} policy="ratio" value={value} onChange={setValue}/>}
    render(<Controlled/> )
    for(const raw of ['-','1.','2.5','-200']) {fireEvent.change(input.current,{target:{value:raw}});expect(input.current.value).toBe(raw)}
  })
  test('pending no emite y deshabilita, readonly permanece nativo', () => {
    const input=createRef(), onChange=vi.fn()
    const view=render(<NumberInput ref={input} policy="integer" value="5" onChange={onChange} pending/>)
    expect(input.current.disabled).toBe(true)
    fireEvent.change(input.current,{target:{value:'6'}})
    expect(onChange).not.toHaveBeenCalled()
    view.rerender(<NumberInput ref={input} policy="integer" value="5" onChange={onChange} readOnly/>)
    expect(input.current.readOnly).toBe(true)
    expect(input.current.disabled).toBe(false)
  })
  test('valor asignado por ref de librería de formulario se valida sin reemplazarlo', () => {
    const input=createRef()
    render(<NumericControl policy="decimal" step=".1" ref={node=>{input.current=node;if(node)node.value='1.25'}}/>)
    expect(input.current.value).toBe('1.25')
    expect(input.current.validationMessage).toBe('Usá incrementos de .1.')
  })
})
