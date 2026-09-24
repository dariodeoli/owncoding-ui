// Serial/IMEI: el final identifica el equipo de un vistazo y nunca se recorta.

// Limpieza estándar: sin espacios ni guiones, en mayúsculas.
export function normalizarSerial(value = '') {
  return String(value ?? '')
    .trim()
    .replace(/[\s-]+/g, '')
    .toUpperCase()
}

export function ultimos4(serial) {
  return String(serial ?? '').slice(-4)
}

export function partirSerial(serial) {
  const texto = String(serial ?? '')
  if (!texto) return { cabeza: '', cola: '' }
  return { cabeza: texto.slice(0, -4), cola: texto.slice(-4) }
}

// Máscara para las vistas donde el serial completo no aporta: "••••4821".
export function serialEnmascarado(serial) {
  const cola = ultimos4(serial)
  return cola ? `••••${cola}` : ''
}

// IMEI de 15 dígitos con dígito control (Luhn): el proveedor y el backend
// rechazan los que no pasan, así que la UI puede avisar antes de enviar.
export function imeiValido(valor) {
  const imei = String(valor ?? '').replace(/\D/g, '')
  if (imei.length !== 15) return false
  let suma = 0
  for (let i = 0; i < 15; i += 1) {
    let digito = Number(imei[14 - i])
    if (i % 2 === 1) {
      digito *= 2
      if (digito > 9) digito -= 9
    }
    suma += digito
  }
  return suma % 10 === 0
}

// Separa un texto pegado o escaneado (líneas, comas, punto y coma, espacios o
// tabs) en seriales normalizados y únicos, en orden de aparición.
export function separarSeriales(texto, { maxLargo = 32 } = {}) {
  const vistos = new Set()
  const seriales = []
  for (const bruto of String(texto ?? '').split(/[\s,;|]+/)) {
    const serial = normalizarSerial(bruto).slice(0, maxLargo)
    if (!serial || vistos.has(serial)) continue
    vistos.add(serial)
    seriales.push(serial)
  }
  return seriales
}

// Normaliza una lista pegada con los conteos que necesita la UI: los válidos
// únicos, los repetidos (dentro del texto) y los que no pasan `validar`
// (por ejemplo `imeiValido` para IMEI). Sin `validar` no hay inválidos.
export function normalizarSeriales(texto, { validar, limite = 9999, maxLargo = 32 } = {}) {
  const vistos = new Set()
  const repetidos = []
  const invalidos = []
  const seriales = []
  for (const bruto of String(texto ?? '').split(/[\s,;|]+/)) {
    const serial = normalizarSerial(bruto).slice(0, maxLargo)
    if (!serial) continue
    if (vistos.has(serial)) {
      repetidos.push(serial)
      continue
    }
    vistos.add(serial)
    if (typeof validar === 'function' && !validar(serial)) {
      invalidos.push(serial)
      continue
    }
    if (seriales.length >= limite) continue
    seriales.push(serial)
  }
  return { seriales, repetidos, invalidos }
}
