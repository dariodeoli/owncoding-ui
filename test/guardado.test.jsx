import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { AVISO_REFRESCO, completeSave, crearEnvioUnico, useSingleFlightSubmit } from '../src/index.js'

// Ciclo de guardado (cosecha de ScaleOS, #2): a prueba de doble submit, con el
// cierre después de persistir y el fallo de refresco como advertencia.

describe('crearEnvioUnico', () => {
  test('un segundo envío mientras corre se ignora por completo', async () => {
    let llamadas = 0
    let resolver
    const envio = crearEnvioUnico(() => {
      llamadas += 1
      return new Promise((res) => { resolver = res })
    })
    const primero = envio.ejecutar()
    const segundo = envio.ejecutar()
    expect(llamadas).toBe(1)
    expect(envio.enCurso).toBe(true)
    resolver('ok')
    await expect(primero).resolves.toBe('ok')
    await expect(segundo).resolves.toBeUndefined()
    expect(envio.enCurso).toBe(false)
  })

  test('libera el bloqueo también cuando el envío falla', async () => {
    const envio = crearEnvioUnico(async () => {
      throw new Error('boom')
    })
    await expect(envio.ejecutar()).rejects.toThrow('boom')
    expect(envio.enCurso).toBe(false)
    await expect(envio.ejecutar()).rejects.toThrow('boom')
  })
})

describe('completeSave', () => {
  test('cierra y después refresca; un refresco OK devuelve true sin avisar', async () => {
    const orden = []
    const avisos = []
    const ok = await completeSave(
      () => orden.push('cerrar'),
      async () => { orden.push('refrescar') },
      { avisar: (mensaje) => avisos.push(mensaje) },
    )
    expect(orden).toEqual(['cerrar', 'refrescar'])
    expect(ok).toBe(true)
    expect(avisos).toEqual([])
  })

  test('un fallo de refresco avisa sin sugerir repetir la escritura y devuelve false', async () => {
    const avisos = []
    const ok = await completeSave(
      () => {},
      () => { throw new Error('sin red') },
      { avisar: (mensaje) => avisos.push(mensaje) },
    )
    expect(ok).toBe(false)
    expect(avisos).toEqual([AVISO_REFRESCO])
    expect(AVISO_REFRESCO).toContain('no hace falta guardar otra vez')
  })

  test('sin refrescar también cierra', async () => {
    let cerrado = 0
    await completeSave(() => { cerrado += 1 })
    expect(cerrado).toBe(1)
  })
})

describe('useSingleFlightSubmit', () => {
  test('el bloqueo arranca antes de la validación y no toca el estado ajeno', () => {
    const fuente = readFileSync(new URL('../src/hooks/useSingleFlightSubmit.js', import.meta.url), 'utf8')
    expect(fuente).toContain('crearEnvioUnico')
    expect(fuente).toContain('setPendiente(true)')
    expect(fuente).toContain('setPendiente(false)')
    expect(fuente).toContain('ultimoEnviar.current(evento)')
    expect(typeof useSingleFlightSubmit).toBe('function')
  })
})
