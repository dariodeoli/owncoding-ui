import { expect, it } from 'vitest'
import { validarClavePublicable } from '../gallery/owndata-key-guard.js'

it('accepts an empty value or a publishable pk_ key', () => {
  expect(validarClavePublicable(undefined)).toBe('')
  expect(validarClavePublicable('  ')).toBe('')
  expect(validarClavePublicable('pk_live_abc123')).toBe('pk_live_abc123')
})

it('refuses any non-publishable key without echoing it', () => {
  for (const clave of ['od_test_77c78d84_secret', 'sk_live_x', 'Bearer pk_x', 'pk_ con espacio']) {
    let error
    try { validarClavePublicable(clave) } catch (e) { error = e }
    expect(error).toBeInstanceOf(Error)
    expect(error.message).not.toContain(clave.trim())
  }
})
