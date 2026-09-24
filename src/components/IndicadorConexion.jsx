import Icon from './Icon.jsx'
import { Dot } from './ui.jsx'
import { cn } from '../utils/cn.js'
import { formatoNumero } from '../utils/moneda.js'

// Indicador de conexión del trabajo de campo: en línea / sin conexión y cuántas
// acciones quedan pendientes de subir. Lo usa la cola offline del panel.
//
// Portable: el estado entra por props (la app decide con su propia lógica); el
// botón «Sincronizar» solo avisa por callback cuando hay algo pendiente. Estados
// honestos: sin conexión se dice, y los pendientes se cuentan de verdad.
//
// `variante="chip"` (predeterminada) es el chip de la cola; `variante="banner"`
// es la franja ancha del shell (sin conexión: fondo rojo con texto legible en
// cada tema, según la regla de superficies rojas del v2).
export default function IndicadorConexion({
  enLinea = true,
  pendientes = 0,
  sincronizando = false,
  onSincronizar,
  variante = 'chip',
  mensaje,
  etiquetaEnLinea = 'En línea',
  etiquetaSinConexion = 'Sin conexión',
  etiquetaSincronizando = 'Sincronizando…',
  className,
}) {
  const cuenta = Number.isFinite(Number(pendientes)) && Number(pendientes) > 0 ? Math.trunc(Number(pendientes)) : 0
  const texto = sincronizando ? etiquetaSincronizando : enLinea ? etiquetaEnLinea : etiquetaSinConexion
  const detalle = cuenta > 0 ? `${formatoNumero(cuenta)} ${cuenta === 1 ? 'pendiente' : 'pendientes'} de subir` : ''
  const titulo = [texto, detalle].filter(Boolean).join(' · ')

  const boton = onSincronizar && cuenta > 0 && (
    <button
      type="button"
      onClick={onSincronizar}
      disabled={sincronizando}
      aria-label={sincronizando ? etiquetaSincronizando : `Sincronizar ${formatoNumero(cuenta)} pendientes`}
      title={sincronizando ? etiquetaSincronizando : 'Sincronizar ahora'}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-md border px-1.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variante === 'banner' ? 'border-current/40 hover:bg-fore/10' : 'border-ink-500 text-mute hover:border-fono hover:text-fore',
      )}
    >
      <Icon name="refresh" className={cn('h-3.5 w-3.5', sincronizando && 'animate-spin')} />
      Sincronizar
    </button>
  )

  if (variante === 'banner') {
    return (
      <div
        role="status"
        aria-live="polite"
        title={titulo}
        className={cn(
          'flex flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-sm font-medium',
          enLinea ? 'bg-ink-800 text-mute' : 'bg-bad text-white dark:text-onbrand',
          className,
        )}
      >
        <Icon name={enLinea ? 'refresh' : 'alert'} className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{mensaje || texto}{!mensaje && detalle ? ` · ${detalle}` : ''}</span>
        {!enLinea && !mensaje && <span className="hidden sm:inline">Se sincroniza al reconectar.</span>}
        {boton}
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      title={titulo}
      className={cn(
        'inline-flex min-w-0 items-center gap-2 rounded-lg border border-ink-600 bg-ink-800 px-2.5 py-1.5 text-xs',
        enLinea ? 'text-mute' : 'text-warn',
        className,
      )}
    >
      <Dot color={enLinea ? 'green' : 'orange'} pulse={sincronizando || !enLinea} />
      <span className="min-w-0 truncate font-medium">
        {texto}
        {detalle && <span className="text-mute"> · {detalle}</span>}
      </span>
      {boton}
    </div>
  )
}
