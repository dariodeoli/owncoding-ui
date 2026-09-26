import { useState } from 'react'
import Icon from './Icon.jsx'
import { Button, Modal } from './ui.jsx'
import { cn } from '../utils/cn.js'

// Ayuda contextual de una pantalla («¿Qué es esto?»): botón de ayuda + diálogo
// con el resumen del módulo, 3–5 puntos cortos y 2–3 enlaces internos.
//
// Portable: los textos y los enlaces entran por props (la app tiene su propio
// mapa de ayuda por ruta). Sin título ni resumen no monta nada, así una pantalla
// sin ayuda no deja un botón mudo.
//
// Accesible: el diálogo es el `Modal` de la librería (foco, Escape, clic afuera
// y retorno de foco). Los enlaces cierran el diálogo al navegar: si el enlace
// trae `onClick` (router de la app), se lo llama; si no, la navegación del
// `<a>` sigue sola.

export default function AyudaModulo({
  titulo,
  resumen,
  puntos = [],
  enlaces = [],
  etiquetaBoton = '¿Qué es esto?',
  tituloDialogo,
  abierta,
  onAbrir,
  onCerrar,
  className,
}) {
  const [interna, setInterna] = useState(false)
  if (!titulo && !resumen) return null

  const controlada = abierta !== undefined
  const visible = controlada ? Boolean(abierta) : interna
  const abrir = () => {
    if (!controlada) setInterna(true)
    onAbrir?.()
  }
  const cerrar = () => {
    if (!controlada) setInterna(false)
    onCerrar?.()
  }

  const encabezado = tituloDialogo || `${etiquetaBoton} · ${titulo || 'Ayuda'}`

  return (
    <div className={cn('inline-flex', className)}>
      <button
        type="button"
        onClick={abrir}
        aria-label={encabezado}
        aria-haspopup="dialog"
        title={encabezado}
        className="grid h-9 w-9 place-items-center rounded-lg border border-ink-500 text-sm font-bold text-mute transition hover:border-fono hover:bg-fono/10 hover:text-fore"
      >
        <span aria-hidden="true">?</span>
      </button>

      <Modal open={visible} onClose={cerrar} title={encabezado} size="formulario">
        <div className="space-y-4">
          {resumen && <p className="text-sm leading-6 text-mute">{resumen}</p>}

          {puntos.length > 0 && (
            <ul className="space-y-2">
              {puntos.map((punto) => (
                <li key={punto} className="flex items-start gap-2 text-sm leading-5 text-fore">
                  <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok-text" />
                  <span className="min-w-0">{punto}</span>
                </li>
              ))}
            </ul>
          )}

          {enlaces.length > 0 && (
            <nav aria-label={`Ir a otro módulo desde ${titulo || 'la ayuda'}`} className="grid gap-1.5 border-t border-ink-600 pt-3">
              {enlaces.map((enlace) => (
                <a
                  key={enlace.href || enlace.etiqueta}
                  href={enlace.href}
                  onClick={(event) => {
                    enlace.onClick?.(event)
                    cerrar()
                  }}
                  className="flex items-center justify-between gap-2 rounded-lg border border-ink-600 px-3 py-2 text-sm font-medium text-fore transition hover:border-fono hover:bg-fono/10"
                >
                  <span className="min-w-0 truncate">{enlace.etiqueta}</span>
                  <Icon name="external" className="h-3.5 w-3.5 shrink-0 text-mute" />
                </a>
              ))}
            </nav>
          )}

          <div className="flex justify-end border-t border-ink-600 pt-3">
            <Button type="button" variant="outline" onClick={cerrar}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
