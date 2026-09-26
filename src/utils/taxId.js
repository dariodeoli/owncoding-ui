// Identificación fiscal (RUC de Paraguay y documento genérico de otros países).
// Lógica pura y compartida: el campo la usa para validar en vivo y el backend
// que revalida puede importar exactamente las mismas funciones.

// RUC PY: 5 a 8 dígitos con dígito verificador opcional (80012345-6).
export const PATRON_RUC = /^\d{5,8}(-\d)?$/
// Documento genérico: alfanumérico de 3 a 32 con punto, barra y guion.
export const PATRON_TAX_ID_GENERICO = /^[\p{L}\p{N}./-]{3,32}$/u

export const MENSAJE_RUC = 'RUC inválido: usá 5 a 8 dígitos, con o sin dígito verificador (ej: 80012345-6).'
export const MENSAJE_RUC_SIN_DATOS = 'No encontramos la razón social de este RUC.'
export const MENSAJE_RUC_CONSULTA = 'No pudimos consultar el RUC. Intentá nuevamente.'

export function taxIdValid(value) {
  return PATRON_RUC.test(String(value ?? '').trim())
}

export function taxIdGenericoValid(value) {
  return PATRON_TAX_ID_GENERICO.test(String(value ?? '').trim())
}

// Verificación según el país: Paraguay usa el patrón de RUC; el resto, el
// genérico. El país no distingue mayúsculas ni espacios.
export function taxIdValidoParaPais(value, pais = 'PY') {
  return String(pais).trim().toUpperCase() === 'PY' ? taxIdValid(value) : taxIdGenericoValid(value)
}

// Devuelve el documento sin puntos ni espacios (el guion del verificador se
// conserva), o null si no hay dato. No valida: eso es taxIdValid.
export function normalizeTaxId(value) {
  if (typeof value !== 'string') return null
  const taxId = value.replace(/[.\s]/g, '').trim()
  return taxId || null
}

// Limpieza al tipear o pegar: descarta lo que el documento no admite (emojis,
// símbolos sueltos) sin tocar letras, números, punto, barra ni guion, y corta
// en el máximo. No normaliza (los puntos se conservan hasta el guardado).
export function limpiarTaxId(value, max = 32) {
  return String(value ?? '').replace(/[^\p{L}\p{N}./-]/gu, '').slice(0, max)
}
