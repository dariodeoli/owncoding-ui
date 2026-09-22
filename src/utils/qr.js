// QR de la app (#240, informe público): un solo lugar para generar la imagen.
// Antes cada pantalla llamaba a `qrcode` con sus propias opciones (nivel M/H,
// margen 1/2, ancho 200/220/320); acá viven las opciones por defecto y el
// helper que usan tanto las pantallas como los impresos (HTML autónomo).
//
// `qrcode` es una peer dependency opcional: la app que use estos objetos la
// instala (`npm install qrcode`); el resto del paquete no la necesita. Por eso
// el import es **dinámico y dentro de la función**: importar el paquete nunca
// falla si `qrcode` no está, y el error se resuelve devolviendo `''`.
export const QR_OPCIONES = { nivel: 'M', margen: 1, ancho: 220 }

/** Data URL del QR, o `''` si no hay valor, falta `qrcode` o el generador falla (nunca lanza). */
export async function qrDataUrl(valor, { ancho = QR_OPCIONES.ancho, nivel = QR_OPCIONES.nivel, margen = QR_OPCIONES.margen } = {}) {
  const texto = String(valor ?? '').trim()
  if (!texto) return ''
  try {
    const { default: QRCode } = await import('qrcode')
    return await QRCode.toDataURL(texto, { errorCorrectionLevel: nivel, margin: margen, width: ancho })
  } catch {
    return ''
  }
}
