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

export default function IndicadorConexion({
  enLinea = true,
  pendientes = 0,
  sincronizando = false,
  onSincronizar,
  etiquetaEnLinea = 'En línea',
  etiquetaSinConexion = 'Sin conexión',
  etiquetaSincronizando = 'Sincronizando…',
  className,
}) {
  const cuenta = Number.isFinite(Number(pendientes)) && Number(pendientes) > 0 ? Math.trunc(Number(pendientes)) : 0
  const texto = sincronizando ? etiquetaSincronizando : enLinea ? etiquetaEnLinea : etiquetaSinConexion
  const detalle = cuenta > 0 ? `${formatoNumero(cuenta)} ${cuenta === 1 ? 'pendiente' : 'pendientes'} de subir` : ''
  const titulo = [texto, detalle].filter(Boolean).join(' · ')

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
      {onSincronizar && cuenta > 0 && (
        <button
          type="button"
          onClick={onSincronizar}
          disabled={sincronizando}
          aria-label={sincronizando ? etiquetaSincronizando : `Sincronizar ${formatoNumero(cuenta)} pendientes`}
          title={sincronizando ? etiquetaSincronizando : 'Sincronizar ahora'}
          className="inline-flex h-6 items-center gap-1 rounded-md border border-ink-500 px-1.5 font-medium text-mute transition hover:border-fono hover:text-fore disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="refresh" className={cn('h-3.5 w-3.5', sincronizando && 'animate-spin')} />
          Sincronizar
        </button>
      )}
    </div>
  )
}
