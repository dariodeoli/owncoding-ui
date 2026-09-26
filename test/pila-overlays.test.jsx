import { describe, expect, test } from 'vitest'

import { Button, conFormulario, crearPilaCapas, crearRegistroPendientes } from '../src/index.js'

// Pila de overlays y pending por formulario (cosecha de ScaleOS, #2): la capa
// superior es la única activa y un formulario ocioso no destraba a otro que
// está guardando.

describe('crearPilaCapas', () => {
  test('la última capa en entrar es la superior', () => {
    const pila = crearPilaCapas()
    const padre = Symbol('padre')
    const hijo = Symbol('hijo')
    pila.agregar(padre)
    pila.agregar(hijo)
    expect(pila.esSuperior(hijo)).toBe(true)
    expect(pila.esSuperior(padre)).toBe(false)
    expect(pila.tamano).toBe(2)
  })

  test('insertar la capa que contiene al hijo la deja por debajo', () => {
    const pila = crearPilaCapas()
    const padre = Symbol('padre')
    const hijo = Symbol('hijo')
    pila.agregar(hijo)
    pila.insertar(padre, 0)
    expect(pila.ids()).toEqual([padre, hijo])
    expect(pila.esSuperior(hijo)).toBe(true)
  })

  test('quitar libera la capa y deja arriba a la anterior', () => {
    const pila = crearPilaCapas()
    const padre = Symbol('padre')
    const hijo = Symbol('hijo')
    pila.agregar(padre)
    pila.agregar(hijo)
    pila.quitar(hijo)
    expect(pila.esSuperior(padre)).toBe(true)
    expect(pila.tamano).toBe(1)
    pila.quitar(hijo)
    expect(pila.tamano).toBe(1)
  })
})

describe('crearRegistroPendientes', () => {
  test('un formulario ocioso no destraba al que está guardando', () => {
    const registro = crearRegistroPendientes()
    const formA = Symbol('a')
    const formB = Symbol('b')
    registro.registrar(formA, true)
    registro.registrar(formB, true)
    expect(registro.bloqueado).toBe(true)
    expect(registro.cantidad).toBe(2)
    registro.registrar(formB, false)
    expect(registro.bloqueado).toBe(true)
    registro.registrar(formA, false)
    expect(registro.bloqueado).toBe(false)
  })

  test('registrar dos veces el mismo formulario no duplica el bloqueo', () => {
    const registro = crearRegistroPendientes()
    const form = Symbol('form')
    registro.registrar(form, true)
    registro.registrar(form, true)
    expect(registro.cantidad).toBe(1)
    registro.registrar(form, false)
    expect(registro.bloqueado).toBe(false)
  })
})

describe('conFormulario', () => {
  test('asocia botones nativos y componentes, y respeta un `form` explícito', () => {
    const hijos = [
      <button key="a" type="submit">Guardar</button>,
      <Button key="b">Cancelar</Button>,
      <button key="c" type="button" form="otro">Otra</button>,
      <span key="d">Texto</span>,
    ]
    const asociados = conFormulario(hijos, 'form-1')
    expect(asociados[0].props.form).toBe('form-1')
    expect(asociados[1].props.form).toBe('form-1')
    expect(asociados[2].props.form).toBe('otro')
    expect(asociados[3].props.form).toBeUndefined()
  })

  test('sin formulario no inventa atributos', () => {
    const [boton] = conFormulario([<button key="a">Guardar</button>], '')
    expect(boton.props.form).toBeUndefined()
  })
})
