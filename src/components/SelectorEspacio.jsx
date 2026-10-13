import { useEffect, useId, useRef, useState } from 'react'
import Avatar from './Avatar.jsx'
import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'

// Selector de espacio de trabajo (empresa, tienda, cuenta): botón con avatar +
// nombre del espacio activo que abre un menú para cambiar de espacio.
//
//   espacios: [{ id, nombre, detalle?, avatar? }]   (`avatar` = URL de imagen)
//   valor / onCambiar(id)                           (controlado por la app)
//   acciones: [{ id?, label, icono?, onClick?, href? }] o un nodo libre; es el
//             pie del menú («+ Crear empresa», «Aceptar invitación»)
//   estado: 'listo' | 'cargando' | 'error' (+ `onReintentar`)
//   cambiando: hay un cambio guardándose → la lista y las acciones quedan
//             bloqueadas con `aria-busy` (siguen enfocables, no se disparan)
//
// Teclado como `MenuDesplegable`: ↓/↑/Inicio/Fin recorren, Esc cierra y
// devuelve el foco al botón, Tab cierra, clic afuera cierra. Filas de 44 px.
// Los avatares usan la paleta sobria (azules y grises) para que ningún espacio
// parezca «error» u «ok» por el color. `AccountSwitcher` no cambia.

const ITEM = 'flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-fore transition hover:bg-ink-700 focus-visible:bg-ink-700'

export default function SelectorEspacio({
  espacios = [],
  valor,
  onCambiar,
  acciones,
  estado = 'listo',
  onReintentar,
  cambiando = false,
  etiqueta = 'Elegir espacio',
  ariaLabel = 'Cambiar de espacio',
  alineacion = 'left',
  defaultAbierto = false,
  paletaAvatar = 'sobria',
  className,
}) {
  const [abierto, setAbierto] = useState(defaultAbierto)
  const raiz = useRef(null)
  const disparador = useRef(null)
  const panel = useRef(null)
  const enfocarAlAbrir = useRef(false)
  const idPanel = useId()
  const cargando = estado === 'cargando'
  const conError = estado === 'error'
  const ocupado = cambiando || cargando
  const activo = espacios.find((espacio) => espacio.id === valor)
  const listaAcciones = Array.isArray(acciones) ? acciones : []
  const nodoAcciones = acciones && !Array.isArray(acciones) ? acciones : null

  const elementos = () => [...(panel.current?.querySelectorAll('[data-item]:not([aria-disabled="true"])') || [])]

  function enfocar(indice) {
    const lista = elementos()
    if (!lista.length) {
      panel.current?.focus()
      return
    }
    lista[(indice + lista.length) % lista.length]?.focus()
  }

  function cerrar({ devolverFoco = false } = {}) {
    setAbierto(false)
    if (devolverFoco) requestAnimationFrame(() => disparador.current?.focus())
  }

  function abrir(desde = 0) {
    enfocarAlAbrir.current = desde
    setAbierto(true)
  }

  // Al abrir con teclado/clic el foco entra al espacio activo (o al primero);
  // una vista previa abierta de origen (`defaultAbierto`) no roba el foco.
  useEffect(() => {
    if (!abierto || enfocarAlAbrir.current === false) return
    const lista = elementos()
    const indiceActivo = lista.findIndex((nodo) => nodo.getAttribute('aria-checked') === 'true')
    const destino = enfocarAlAbrir.current === -1 ? -1 : indiceActivo >= 0 ? indiceActivo : 0
    enfocarAlAbrir.current = false
    enfocar(destino)
  }, [abierto])

  useEffect(() => {
    if (!abierto) return undefined
    const cerrarFuera = (event) => {
      if (event.target instanceof Node && raiz.current?.contains(event.target)) return
      cerrar()
    }
    document.addEventListener('click', cerrarFuera)
    return () => document.removeEventListener('click', cerrarFuera)
  }, [abierto])

  function teclado(event) {
    const lista = elementos()
    const actual = lista.indexOf(document.activeElement)
    if (event.key === 'Escape') {
      event.preventDefault()
      cerrar({ devolverFoco: true })
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      enfocar(actual + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      enfocar(actual < 0 ? -1 : actual - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      enfocar(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      enfocar(-1)
    } else if (event.key === 'Tab') {
      cerrar()
    }
  }

  function elegir(espacio) {
    if (cambiando) return
    if (espacio.id !== valor) onCambiar?.(espacio.id)
    cerrar({ devolverFoco: true })
  }

  function accionar(accion) {
    if (cambiando || accion.disabled) return
    cerrar({ devolverFoco: !accion.href })
    accion.onClick?.()
  }

  const nombreActivo = activo?.nombre ?? (cargando ? 'Cargando…' : etiqueta)

  return (
    <div ref={raiz} className={cn('relative min-w-0', className)}>
      <button
        ref={disparador}
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={abierto ? idPanel : undefined}
        aria-busy={ocupado || undefined}
        aria-label={`${ariaLabel}: ${typeof nombreActivo === 'string' ? nombreActivo : etiqueta}`}
        onClick={() => { if (abierto) cerrar(); else abrir(0) }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            abrir(event.key === 'ArrowDown' ? 0 : -1)
          }
        }}
        className="toque-44 inline-flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-interactivo bg-ink px-2 py-1 text-left text-sm font-medium text-fore transition hover:bg-ink-700"
      >
        {activo ? <Avatar nombre={activo.nombre} src={activo.avatar} tamano="sm" empresa decorativo paleta={paletaAvatar} /> : null}
        <span className="min-w-0 flex-1 truncate">{nombreActivo}</span>
        {cambiando ? <Icon name="refresh" className="h-4 w-4 shrink-0 text-mute motion-safe:animate-spin" /> : <Icon name="chevron" className={cn('h-4 w-4 shrink-0 text-mute transition-transform motion-reduce:transition-none', abierto && 'rotate-180')} />}
      </button>
      {cambiando ? <span role="status" className="sr-only">Cambiando de espacio…</span> : null}

      {abierto ? (
        <div
          ref={panel}
          id={idPanel}
          tabIndex={-1}
          aria-busy={ocupado || undefined}
          onKeyDown={teclado}
          className={cn(
            'absolute z-30 mt-1 w-full min-w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-interactivo bg-ink p-1 text-fore shadow-float',
            alineacion === 'right' ? 'right-0' : 'left-0',
            cambiando && 'opacity-80',
          )}
        >
          {cargando ? (
            <div role="status" className="space-y-1 p-2">
              <span className="sr-only">Cargando espacios…</span>
              {[0, 1, 2].map((fila) => (
                <div key={fila} aria-hidden="true" className="flex min-h-11 items-center gap-2.5 px-1 motion-safe:animate-pulse">
                  <span className="h-7 w-7 rounded-lg bg-ink-700" />
                  <span className="h-3 flex-1 rounded bg-ink-700" />
                </div>
              ))}
            </div>
          ) : conError ? (
            <div className="space-y-2 p-3">
              <p role="alert" className="text-sm text-bad-text">No se pudieron cargar los espacios.</p>
              {onReintentar ? (
                <button type="button" data-item role="menuitem" tabIndex={-1} onClick={onReintentar} className={cn(ITEM, 'border border-interactivo')}>
                  <Icon name="refresh" className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">Reintentar</span>
                </button>
              ) : null}
            </div>
          ) : espacios.length ? (
            <div role="menu" aria-label={ariaLabel}>
              {espacios.map((espacio) => {
                const seleccionado = espacio.id === valor
                return (
                  <button
                    key={espacio.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={seleccionado}
                    aria-disabled={cambiando || undefined}
                    data-item
                    tabIndex={-1}
                    onClick={() => elegir(espacio)}
                    className={cn(ITEM, seleccionado && 'bg-fono/10', cambiando && 'cursor-not-allowed')}
                  >
                    <Avatar nombre={espacio.nombre} src={espacio.avatar} tamano="sm" empresa decorativo paleta={paletaAvatar} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{espacio.nombre}</span>
                      {espacio.detalle ? <span className="block truncate text-xs text-mute">{espacio.detalle}</span> : null}
                    </span>
                    {seleccionado ? <Icon name="check" className="h-4 w-4 shrink-0 text-fono-text" /> : null}
                  </button>
                )
              })}
            </div>
          ) : (
            <p role="status" className="p-3 text-sm text-mute">Todavía no hay espacios.</p>
          )}

          {listaAcciones.length || nodoAcciones ? (
            <>
              <div role="separator" className="my-1 h-px bg-ink-600" />
              {listaAcciones.length ? (
                <div role="menu" aria-label="Acciones del espacio">
                  {listaAcciones.map((accion, indice) => {
                    const contenido = (
                      <>
                        {accion.icono ? <Icon name={accion.icono} className="h-4 w-4 shrink-0" /> : null}
                        <span className="min-w-0 flex-1 truncate">{accion.label}</span>
                      </>
                    )
                    const comun = {
                      role: 'menuitem',
                      'data-item': true,
                      tabIndex: -1,
                      'aria-disabled': cambiando || accion.disabled || undefined,
                      className: cn(ITEM, (cambiando || accion.disabled) && 'cursor-not-allowed opacity-60'),
                    }
                    return accion.href && !cambiando && !accion.disabled ? (
                      <a key={accion.id ?? indice} href={accion.href} {...comun} onClick={() => accionar(accion)}>{contenido}</a>
                    ) : (
                      <button key={accion.id ?? indice} type="button" {...comun} onClick={() => accionar(accion)}>{contenido}</button>
                    )
                  })}
                </div>
              ) : null}
              {nodoAcciones ? <div className="p-1">{nodoAcciones}</div> : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
