import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { COOPERATIVAS_PARAGUAY } from '../src/utils/bancos.js'
import * as fixtures from '../gallery/financial-fixtures.js'

test('gallery review uses one uniform slot per variant; optical crop replaces per-bank enlargement', () => {
  expect(fixtures.bankReviewSize).toBeTypeOf('function')
  expect(COOPERATIVAS_PARAGUAY).toHaveLength(13)
  // Cooperatives and whitespace-heavy GNB used to need h-24/h-28; the crop in
  // financialOptica now trims their margins, so every institution shares a slot.
  for (const name of [...COOPERATIVAS_PARAGUAY, 'Banco GNB Paraguay', 'Banco Atlas']) {
    expect(fixtures.bankReviewSize(name, 'compacto')).toBe('h-12')
    expect(fixtures.bankReviewSize(name, 'horizontal')).toBe('h-[3.25rem]')
  }
  const source = readFileSync(new URL('../gallery/main.jsx', import.meta.url), 'utf8')
  expect(source).toContain('alto={bankReviewSize(nombre, variante)}')
  expect(source).toContain('data-bank-review-size')
})

test('all existing originals retain their manifest hashes after presentation changes', () => {
  const manifest = JSON.parse(readFileSync(new URL('../docs/financial-assets-manifest.json', import.meta.url)))
  for (const record of manifest.assets) {
    const bytes = readFileSync(new URL(`../src/assets/financial/${record.file}`, import.meta.url))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(record.sha256)
  }
})
