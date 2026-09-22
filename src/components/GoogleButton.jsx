import { cn } from '../utils/cn.js'

// Acceso con Google, portable: el componente no sabe de sesión ni de API, solo
// dibuja el botón y avisa el clic. Los colores de Google son de marca (fijos);
// el foco sigue el token del tema.

export function GoogleMark({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className={cn('h-[18px] w-[18px] shrink-0', className)}>
      <path fill="#EA4335" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.909c1.703-1.568 2.683-3.878 2.683-6.615Z" />
      <path fill="#4285F4" d="M9 18c2.43 0 4.467-.806 5.957-2.18l-2.91-2.258c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.037-3.71H.956v2.331A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.963 10.712A5.412 5.412 0 0 1 3.681 9c0-.594.102-1.171.282-1.712V4.957H.956A9 9 0 0 0 0 9c0 1.452.348 2.827.956 4.043l3.007-2.331Z" />
      <path fill="#34A853" d="M9 3.578c1.322 0 2.508.454 3.441 1.345l2.581-2.582C13.463.891 11.426 0 9 0A9 9 0 0 0 .956 4.957l3.007 2.331C4.672 5.162 6.656 3.578 9 3.578Z" />
    </svg>
  )
}

export function OAuthDivider({ texto = 'o', className }) {
  return (
    <div className={cn('flex items-center gap-4 py-1 text-sm font-medium text-mute', className)}>
      <span className="h-px flex-1 bg-fore/10" />
      {texto}
      <span className="h-px flex-1 bg-fore/10" />
    </div>
  )
}

export default function GoogleButton({
  crear = false,
  busy = false,
  onClick,
  etiquetaCrear = 'Crear con Google',
  etiquetaContinuar = 'Continuar con Google',
  etiquetaBusy = 'Conectando con Google…',
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={busy}
      className={cn(
        'group flex h-14 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-base font-semibold text-slate-900 shadow-sm transition',
        'hover:-translate-y-px hover:border-white hover:bg-slate-50 hover:shadow-lg',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fono',
        'disabled:cursor-wait disabled:opacity-70 sm:rounded-full',
        className,
      )}
    >
      {busy
        ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#4285F4]" />
        : <GoogleMark />}
      <span className="ml-3">{busy ? etiquetaBusy : crear ? etiquetaCrear : etiquetaContinuar}</span>
    </button>
  )
}
