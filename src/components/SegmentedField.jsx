import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'
import { useFormulariosPro } from './FormulariosPro.jsx'

const useEfectoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect

// Opciones excluyentes en una barra segmentada (mismo lenguaje que el
// selector lista/cuadrícula): 2 a 5 opciones cortas, con ícono y contador
// opcionales. `options` usa la convención del repo: [id, etiqueta, icono?,
// contador?].
//
// Sin `FormulariosPro` queda la barra de la primera ola (la opción activa lleva
// su propio fondo, sin DOM extra). Con el interruptor:
// El fondo de la opción activa es un indicador único que se desliza entre
// opciones (`transform`, medido con ref y recalculado al cambiar el tamaño o
// al envolver las opciones). Antes de medir —SSR, primer pintado— la opción
// activa lleva su propio fondo, así nunca queda sin marcar. `motion={false}` o
// `prefers-reduced-motion` dejan el cambio instantáneo.
function SegmentedConIndicador({ value, onChange, options = [], ariaLabel, className, motion = true }) {
  const contenedor = useRef(null)
  const botones = useRef(new Map())
  const [indicador, setIndicador] = useState(null)
  const [listo, setListo] = useState(false)
  // Etiquetas y contadores: si cambian, el indicador se vuelve a medir.
  const firma = options.map(([id, label, , contador]) => `${id}\u0001${label}\u0001${contador ?? ''}`).join('\u0002')

  useEfectoLayout(() => {
    const medir = () => {
      const activo = botones.current.get(value)
      if (!activo || !activo.offsetWidth) { setIndicador(null); return }
      const siguiente = { x: activo.offsetLeft, y: activo.offsetTop, w: activo.offsetWidth, h: activo.offsetHeight }
      setIndicador((actual) => (actual && actual.x === siguiente.x && actual.y === siguiente.y && actual.w === siguiente.w && actual.h === siguiente.h ? actual : siguiente))
    }
    medir()
    // Las fuentes web cambian el ancho de las etiquetas al cargar.
    let vigente = true
    if (typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(() => { if (vigente) medir() }, () => {})
    if (typeof ResizeObserver === 'undefined') return () => { vigente = false }
    // Se observan el contenedor y cada opción: un cambio de etiqueta o de
    // contador mueve el indicador aunque el contenedor conserve su tamaño.
    const observador = new ResizeObserver(medir)
    if (contenedor.current) observador.observe(contenedor.current)
    for (const boton of botones.current.values()) observador.observe(boton)
    return () => { vigente = false; observador.disconnect() }
  }, [value, firma])

  // La primera posición se asienta sin transición: el indicador no «viaja» al montar.
  useEffect(() => {
    if (!indicador || listo) return undefined
    const marco = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => setListo(true)) : null
    if (marco === null) { setListo(true); return undefined }
    return () => cancelAnimationFrame(marco)
  }, [indicador, listo])

  if (!options.length) return null
  return (
    <div ref={contenedor} data-motion={motion ? 'on' : 'off'} data-oc-segmentado="" className={cn('relative flex flex-wrap gap-1 rounded-xl border border-ink-600 bg-ink-800 p-1', className)} role="group" aria-label={ariaLabel}>
      {indicador ? (
        <span
          aria-hidden="true"
          data-oc-indicador=""
          className={cn('pointer-events-none absolute left-0 top-0 rounded-lg bg-fono/15', listo && '[transition:transform_var(--oc-motion-feedback,240ms)_var(--oc-motion-ease,cubic-bezier(.2,.8,.2,1)),width_var(--oc-motion-feedback,240ms)_var(--oc-motion-ease,cubic-bezier(.2,.8,.2,1)),height_var(--oc-motion-feedback,240ms)_var(--oc-motion-ease,cubic-bezier(.2,.8,.2,1))]')}
          style={{ width: indicador.w, height: indicador.h, transform: `translate3d(${indicador.x}px, ${indicador.y}px, 0)` }}
        />
      ) : null}
      {options.map(([id, label, icon, contador]) => {
        const activo = value === id
        return (
          <button
            key={id}
            ref={(nodo) => { if (nodo) botones.current.set(id, nodo); else botones.current.delete(id) }}
            type="button"
            aria-pressed={activo}
            aria-label={contador === undefined ? label : `${label} (${contador})`}
            title={label}
            onClick={() => onChange(id)}
            className={cn(
              'relative z-10 inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors [transition-duration:var(--oc-motion-fast,160ms)]',
              activo ? (indicador ? 'text-fono-text' : 'bg-fono/15 text-fono-text') : 'text-mute hover:bg-fore/5 hover:text-fore',
            )}
          >
            {icon && <Icon name={icon} className="h-4 w-4 shrink-0" />}
            <span className="min-w-0 truncate">{label}</span>
            {contador !== undefined && <span className="text-xs opacity-75">{contador}</span>}
          </button>
        )
      })}
    </div>
  )
}

// Primera ola: sin indicador deslizante ni medición.
function SegmentedBasico({ value, onChange, options = [], ariaLabel, className }) {
  if (!options.length) return null
  return (
    <div className={cn('flex flex-wrap gap-1 rounded-xl border border-ink-600 bg-ink-800 p-1', className)} role="group" aria-label={ariaLabel}>
      {options.map(([id, label, icon, contador]) => {
        const activo = value === id
        return (
          <button
            key={id}
            type="button"
            aria-pressed={activo}
            aria-label={contador === undefined ? label : `${label} (${contador})`}
            title={label}
            onClick={() => onChange(id)}
            className={cn(
              'inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition',
              activo ? 'bg-fono/15 text-fono-text' : 'text-mute hover:bg-fore/5 hover:text-fore',
            )}
          >
            {icon && <Icon name={icon} className="h-4 w-4 shrink-0" />}
            <span className="min-w-0 truncate">{label}</span>
            {contador !== undefined && <span className="text-xs opacity-75">{contador}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default function SegmentedField(props) {
  const pro = useFormulariosPro()
  return pro ? <SegmentedConIndicador {...props} /> : <SegmentedBasico {...props} />
}
