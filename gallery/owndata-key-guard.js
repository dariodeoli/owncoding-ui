// Frena el build de la galería si VITE_OWNDATA_PUBLISHABLE_KEY trae algo que no
// sea una clave publicable `pk_`: toda variable VITE_ termina en el JavaScript
// público, así que una clave secreta quedaría expuesta. Nunca imprime el valor.
export function validarClavePublicable(valor) {
  const clave = (valor ?? '').trim()
  if (!clave) return ''
  if (!/^pk_[A-Za-z0-9_-]+$/.test(clave)) {
    throw new Error('VITE_OWNDATA_PUBLISHABLE_KEY solo acepta claves publicables pk_. La recibida no es pk_ y se publicaría en el JavaScript de la galería: revóquela en OwnData y deje la variable vacía o con la clave pk_.')
  }
  return clave
}
