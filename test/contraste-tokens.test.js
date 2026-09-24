// Guarda de contraste del scope v2 (#241): los tonos SEMÁNTICOS del tema v2
// se usan como TEXTO sobre las superficies del shell y de las pantallas del
// piloto, así que tienen que cumplir AA (4.5:1) en claro y oscuro. Si alguien
// vuelve a los vivos de PhoneCheck (#16A34A, #DC2626, #D97706, #4D7CFE) para
// texto, este test lo frena. Medición de referencia: shell v2 de MobOS (DSN),
// tabla de contrastes en `docs/SHELL.md`.
import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'

const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
const lineas = tokens.split('\n')

// Devuelve el bloque que ABRE con el selector pedido y contiene tokens `--c-*`.
// (Un `indexOf` a secas puede caer en un bloque sin tokens, como el
// `html.dark { color-scheme }` de las apps que precede a la paleta.)
function bloqueDe(apertura) {
  const inicios = lineas
    .map((linea, indice) => (linea.trim().startsWith(apertura) ? indice : -1))
    .filter((indice) => indice !== -1)
  for (const inicio of inicios) {
    let fin = inicio
    while (fin < lineas.length && !lineas[fin].includes('}')) fin++
    const bloque = lineas.slice(inicio, fin + 1).join('\n')
    if (bloque.includes('--c-')) return bloque
  }
  throw new Error(`falta el bloque de tokens que abre con ${apertura}`)
}

function tokensDe(apertura) {
  const paleta = {}
  for (const match of bloqueDe(apertura).matchAll(/--c-([\w-]+):\s*([\d]+)\s+([\d]+)\s+([\d]+);/g)) {
    paleta[match[1]] = [Number(match[2]), Number(match[3]), Number(match[4])]
  }
  return paleta
}

// Paleta global (el lenguaje v2 es la base desde la ronda .21).
const PALETAS = {
  claro: [':root {'],
  oscuro: ['html.dark {'],
}

const efectiva = (bloques) => bloques.reduce((paleta, apertura) => ({ ...paleta, ...tokensDe(apertura) }), {})

const luminancia = ([r, g, b]) => {
  const f = (valor) => { const v = valor / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contraste = (a, b) => {
  const [alto, bajo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (alto + 0.05) / (bajo + 0.05)
}
// Composición de un color con alfa sobre un fondo opaco.
const sobre = (color, alfa, fondo) => color.map((valor, indice) => valor * alfa + fondo[indice] * (1 - alfa))

// Tokens con rol de texto + superficies donde se apoyan en el shell/pantallas.
const TEXTO = ['fore', 'mute', 'fono-dark', 'fono-light', 'ok', 'warn', 'bad', 'info']
const SUPERFICIES = ['paper', 'ink', 'ink-900', 'ink-800']

describe('contraste AA de la paleta global (lenguaje v2)', () => {
  test('los tonos de texto cumplen AA sobre las superficies en claro y oscuro', () => {
    for (const [tema, bloques] of Object.entries(PALETAS)) {
      const paleta = efectiva(bloques)
      for (const rol of TEXTO) {
        for (const superficie of SUPERFICIES) {
          const texto = paleta[rol]
          const fondo = paleta[superficie]
          if (!texto || !fondo) continue
          const ratio = contraste(texto, fondo)
          expect(ratio, `${tema}: --c-${rol} sobre --c-${superficie} da ${ratio.toFixed(2)}:1 (AA exige 4.5)`).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })

  test('el ítem activo de la navegación cumple AA sobre su propio tinte (#241)', () => {
    // Claro: azul de acción como texto sobre `rgb(var(--c-info) / .14)`.
    const claro = efectiva(PALETAS.claro)
    const fondoClaro = sobre(claro.info, 0.14, claro['ink-800'])
    const ratioClaro = contraste(claro.info, fondoClaro)
    expect(ratioClaro, `claro: texto activo sobre su tinte da ${ratioClaro.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)

    // Oscuro: texto de primer nivel sobre `rgb(var(--c-info) / .20)`.
    const oscuro = efectiva(PALETAS.oscuro)
    const fondoOscuro = sobre(oscuro.info, 0.2, oscuro['ink-800'])
    const ratioOscuro = contraste(oscuro.fore, fondoOscuro)
    expect(ratioOscuro, `oscuro: texto activo sobre su tinte da ${ratioOscuro.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
  })
})
