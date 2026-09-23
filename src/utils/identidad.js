// Identidad de usuario unificada (#211): normaliza el nombre visible, el primer
// nombre y las DOS fuentes de foto para que la cadena sea una sola en toda la
// app: foto local (subida por la persona) → foto de Google (`picture`) →
// iniciales. Los estados de presencia del chip también viven acá.
//
// La librería no pide la foto: la app resuelve la URL local (por id) y la pasa
// por `foto`; el adaptador también acepta los nombres de campo habituales
// (name/nombre, avatarUrl/foto/photoURL, picture, hasAvatar/tieneFoto) para que
// los call sites no tengan que pluckear campos.
import { primerNombre } from './cn.js'

const primerTexto = (...valores) => {
  for (const valor of valores) {
    if (typeof valor === 'string' && valor.trim()) return valor.trim()
  }
  return ''
}

export function identidadDeUsuario(fuente = {}) {
  const objeto = fuente && typeof fuente === 'object' ? fuente : {}
  const nombre =
    primerTexto(objeto.nombre, objeto.name, objeto.displayName, objeto.fullName) ||
    primerTexto(objeto.email) ||
    'Sistema'
  return {
    nombre,
    primerNombre: primerNombre(nombre) || 'Sistema',
    // Foto local (subida): la app la resuelve por id y la pasa acá.
    fotoLocal: primerTexto(objeto.foto, objeto.avatarUrl, objeto.photoURL, objeto.fotoUrl),
    // Foto de la identidad (Google).
    picture: primerTexto(objeto.picture),
    hasAvatar: objeto.hasAvatar ?? objeto.tieneFoto ?? undefined,
    scope: primerTexto(objeto.scope),
  }
}

// Presencia para el punto del chip: una etiqueta para el tooltip y el color del
// punto (sólidos, no tintes).
export const ESTADOS_PRESENCIA = {
  'en-linea': { etiqueta: 'En línea', punto: 'bg-ok' },
  ausente: { etiqueta: 'Ausente', punto: 'bg-warn' },
  ocupado: { etiqueta: 'Ocupado', punto: 'bg-bad' },
  offline: { etiqueta: 'Sin conexión', punto: 'bg-mute' },
}
