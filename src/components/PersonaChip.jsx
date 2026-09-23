import { useEffect, useState } from 'react'
import Avatar from './Avatar.jsx'
import { CELDA_DATO, CELDA_IDENTIDAD_GRANDE } from '../utils/tabla.js'
import { ESTADOS_PRESENCIA, identidadDeUsuario } from '../utils/identidad.js'
import { cn } from '../utils/cn.js'

// Identidad de usuario unificada (#211): UN solo objeto para mostrar a una
// persona en cualquier superficie. Envuelve al `Avatar` compartido y resuelve
// la foto en el **orden único**: foto local (`foto`, la resuelve la app por id)
// → foto de Google (`picture`) → iniciales; si la local falla cae a la de
// Google y, si tampoco hay, a las iniciales (nunca una imagen rota).
//
// Props: `user` (objeto o texto), `foto`/`picture` explícitas, `size` (xs…xl),
// `nombre` (mostrar/ocultar), **`nombreCorto`** (solo el primer nombre en
// contextos compactos), **`estado`** (presencia: `en-linea`/`ausente`/`ocupado`/
// `offline`), `title` y `children` (texto extra, p. ej. la fecha).
// `data-testid="persona-chip"` para las pruebas.
export default function PersonaChip({
  user,
  foto,
  picture,
  size = 'md',
  nombre = true,
  nombreCorto = false,
  estado,
  title,
  className,
  textoClassName,
  avatarClassName,
  children,
}) {
  const fuente = typeof user === 'string' ? { name: user } : (user || {})
  const identidad = identidadDeUsuario(fuente)
  const visible = nombreCorto ? identidad.primerNombre : identidad.nombre
  const presencia = ESTADOS_PRESENCIA[estado] || null

  // La foto local manda; si falla (o no hay), se intenta la de Google.
  const local = foto ?? (identidad.hasAvatar === false ? '' : identidad.fotoLocal)
  const google = picture ?? identidad.picture
  const [localRota, setLocalRota] = useState(false)
  useEffect(() => { setLocalRota(false) }, [local])
  const src = !localRota && local ? local : google

  const etiqueta = title || [identidad.nombre, presencia?.etiqueta, identidad.scope].filter(Boolean).join(' · ')
  return (
    <span data-testid="persona-chip" className={cn('inline-flex min-w-0 items-center gap-2', className)} title={etiqueta}>
      <span className="relative inline-flex shrink-0">
        <Avatar
          nombre={identidad.nombre}
          src={src}
          tamano={size}
          onError={() => setLocalRota(true)}
          className={avatarClassName}
          decorativo={!nombre && !children}
          title={etiqueta}
        />
        {presencia ? <i aria-hidden className={cn('absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-paper', presencia.punto)} /> : null}
      </span>
      {nombre ? <span className={cn('min-w-0', CELDA_IDENTIDAD_GRANDE, textoClassName)}>{visible}</span> : null}
      {children ? <span className={CELDA_DATO}>{children}</span> : null}
    </span>
  )
}
