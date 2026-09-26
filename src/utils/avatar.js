// Identidad por nombre para el avatar (personas y empresas): iniciales y color
// estable derivado del nombre. El color no es dato de negocio: solo ayuda a
// distinguir dos identidades de un vistazo y se repite igual en toda la app.
//
// Función pura: mismo nombre → mismas iniciales y mismo color, sin depender del
// orden de la lista ni de la sesión.

/** Paleta del avatar: fondo suave + texto del mismo tono, legible en claro y oscuro. */
export const COLORES_AVATAR = {
  fono: 'bg-fono/15 text-fono-text',
  ok: 'bg-ok/15 text-ok-text',
  info: 'bg-info/15 text-info-text',
  warn: 'bg-warn/15 text-warn-text',
  bad: 'bg-bad/15 text-bad-text',
  pass: 'bg-pass/15 text-pass-text',
  reserved: 'bg-reserved/15 text-reserved',
  mute: 'bg-ink-600 text-mute',
}

const CLAVES_COLOR = Object.keys(COLORES_AVATAR)

// El tipo societario (S.A., S.R.L., LTDA…) no cuenta como palabra del nombre,
// pero su inicial acompaña cuando el nombre queda de una sola palabra:
// "LedBox S.A." → "LS".
const TIPO_SOCIETARIO = /^(sa|srl|saci|sae|sas|ltda|eas|cia|s|a)$/i

const primeraLetra = (palabra) => [...String(palabra || '')][0] ?? ''

/**
 * Iniciales para el avatar: dos palabras → primera letra de la primera y de la
 * última; una sola palabra → su primera letra (más la del tipo societario, si
 * lo trae). Siempre en mayúsculas y sin signos ("LedBox S.A." → "LS").
 */
export function inicialesDeNombre(nombre) {
  const palabras = String(nombre ?? '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (!palabras.length) return '—'
  const significativas = palabras.filter((palabra) => !TIPO_SOCIETARIO.test(palabra))
  if (!significativas.length) return (primeraLetra(palabras[0]) + primeraLetra(palabras[1])).toUpperCase()
  if (significativas.length > 1) {
    return (primeraLetra(significativas[0]) + primeraLetra(significativas[significativas.length - 1])).toUpperCase()
  }
  const societario = palabras.find((palabra) => TIPO_SOCIETARIO.test(palabra))
  return (primeraLetra(significativas[0]) + (societario ? primeraLetra(societario) : '')).toUpperCase()
}

/** Clave de color estable para un nombre (misma identidad → mismo color). */
export function claveColorDeNombre(nombre) {
  const texto = String(nombre ?? '').trim().toLowerCase()
  let hash = 0
  for (let indice = 0; indice < texto.length; indice += 1) {
    hash = (hash * 31 + texto.charCodeAt(indice)) % 100000
  }
  return CLAVES_COLOR[hash % CLAVES_COLOR.length]
}

/** Clases Tailwind del color que le toca al nombre. */
export function colorDeNombre(nombre) {
  return COLORES_AVATAR[claveColorDeNombre(nombre)] || COLORES_AVATAR.mute
}
