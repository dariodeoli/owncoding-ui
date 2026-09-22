import { useEffect, useState } from 'react'
import { cn } from '../utils/cn.js'
import { colorDeNombre, inicialesDeNombre } from '../utils/avatar.js'

// Avatar de identidad (persona o empresa): imagen opcional con caída a las
// iniciales pintadas con un color estable derivado del nombre. Nunca queda un
// cuadro roto: si la imagen falla, se muestran las iniciales.
//
// Portable: recibe el nombre y la URL de la imagen por props (la app resuelve
// si tiene foto, logo o ninguna). `forma="cuadrado"` es para empresas/logos;
// `forma="redondo"` (predeterminado) para personas.
//
// Accesible: el marco es `role="img"` con `aria-label` (nombre o el que se
// pase). Si el avatar solo acompaña a un texto que ya dice el nombre, se usa
// `decorativo` para no repetirlo al lector de pantalla.

export const TAMANOS_AVATAR = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-14 w-14 text-lg',
}

export default function Avatar({
  nombre,
  src,
  tamano = 'md',
  forma,
  empresa = false,
  title,
  ariaLabel,
  decorativo = false,
  className,
}) {
  const [fallo, setFallo] = useState(false)

  // Una URL nueva (otra persona, otra versión) vuelve a intentar la imagen.
  useEffect(() => {
    setFallo(false)
  }, [src])

  const cuadro = empresa ? 'cuadrado' : forma || 'redondo'
  const redondo = cuadro !== 'cuadrado'
  const etiqueta = ariaLabel || title || String(nombre ?? '').trim() || 'Identidad'
  const conImagen = Boolean(src) && !fallo

  return (
    <span
      role={decorativo ? undefined : 'img'}
      aria-label={decorativo ? undefined : etiqueta}
      aria-hidden={decorativo || undefined}
      title={title}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden font-bold uppercase',
        redondo ? 'rounded-full' : 'rounded-lg',
        !conImagen && colorDeNombre(nombre),
        TAMANOS_AVATAR[tamano] || TAMANOS_AVATAR.md,
        className,
      )}
    >
      {conImagen ? (
        <img
          src={src}
          alt=""
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFallo(true)}
          className={cn('h-full w-full', redondo ? 'object-cover' : 'object-contain')}
        />
      ) : (
        <span aria-hidden="true">{inicialesDeNombre(nombre)}</span>
      )}
    </span>
  )
}
