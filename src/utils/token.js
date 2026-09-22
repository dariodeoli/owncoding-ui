// Token de acción que viaja en un enlace (invitaciones, verificación de correo,
// recuperación). El token es 64 hex; se acepta la ruta `/…/<token>`, el
// fragmento `#token=…` y el query legacy, además del token pelado.

const RUTA_CON_TOKEN = /(?:^|\/)([^/?#]+)\/([a-f0-9]{64})(?:[/?#]|$)/i

export function extractTokenFromUrl(raw = '') {
  const texto = (() => {
    try { return decodeURIComponent(String(raw)) } catch { return String(raw) }
  })()
  const porRuta = texto.match(RUTA_CON_TOKEN)
  if (porRuta) return porRuta[2]
  const match = texto.match(/[a-f0-9]{64}/i)
  return match ? match[0] : ''
}

export function esToken(value) {
  return /^[a-f0-9]{64}$/i.test(String(value ?? '').trim())
}
