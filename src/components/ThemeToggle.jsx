import { useSyncExternalStore } from 'react'
import { cn } from '../utils/cn.js'
import Icon from './Icon.jsx'

// Control único de tema (portado de PagaYa): alterna claro/oscuro sobre el
// contrato de la librería — la clase `dark` en <html> (ver styles.css) — y
// guarda la preferencia en localStorage.
//
// Portable: la clave de almacenamiento se pasa por prop y el arranque (aplicar
// la preferencia antes del primer pintado) es de la app, que conoce su layout:
// puede usar `aplicarTema(tema, clave)`. El control lee la clase vigente en el
// documento, así varios toggles comparten estado y no hay parpadeo.

export const TEMA_CLARO = 'claro'
export const TEMA_OSCURO = 'oscuro'

const CLAVE_PREDETERMINADA = 'owncoding-theme'
const suscriptores = new Set()

function suscribir(listener) {
  suscriptores.add(listener)
  return () => {
    suscriptores.delete(listener)
  }
}

function leerTema() {
  return document.documentElement.classList.contains('dark') ? TEMA_OSCURO : TEMA_CLARO
}

// Aplica el tema al documento y lo persiste (si hay clave). Es la función que
// la app puede llamar antes de pintar para restaurar la preferencia guardada.
export function aplicarTema(tema, clave = CLAVE_PREDETERMINADA) {
  const oscuro = tema === TEMA_OSCURO
  document.documentElement.classList.toggle('dark', oscuro)
  if (clave) {
    try {
      window.localStorage.setItem(clave, oscuro ? TEMA_OSCURO : TEMA_CLARO)
    } catch {
      // Sin almacenamiento (modo privado, permisos): la clase ya quedó aplicada.
    }
  }
  for (const listener of suscriptores) listener()
}

export default function ThemeToggle({
  clave = CLAVE_PREDETERMINADA,
  alCambiar,
  etiquetaClaro = 'Cambiar a modo claro',
  etiquetaOscuro = 'Cambiar a modo oscuro',
  className,
}) {
  const tema = useSyncExternalStore(suscribir, leerTema, () => TEMA_CLARO)
  const oscuro = tema === TEMA_OSCURO
  const etiqueta = oscuro ? etiquetaClaro : etiquetaOscuro
  return (
    <button
      type="button"
      onClick={() => {
        const siguiente = oscuro ? TEMA_CLARO : TEMA_OSCURO
        aplicarTema(siguiente, clave)
        alCambiar?.(siguiente)
      }}
      aria-label={etiqueta}
      title={etiqueta}
      aria-pressed={oscuro}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-lg border border-ink-500 text-mute transition',
        'hover:border-fono hover:bg-fono/10 hover:text-fore',
        className,
      )}
    >
      <Icon name={oscuro ? 'sun' : 'moon'} className="h-4 w-4" />
    </button>
  )
}
