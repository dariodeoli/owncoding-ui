import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { Money } from './ui.jsx'
import { chipDeTono, puntoDeTono } from '../utils/tonos.js'
import { fechaDia } from '../utils/fecha.js'
import { cn } from '../utils/cn.js'

// Tablero kanban de un pipeline por estados (portado del `AdminBoard` de
// LedBox): columnas con título, tono y contador; tarjetas con identidad,
// monto/fecha y chips; arrastre nativo HTML5 y el menú «Mover a…» como
// alternativa accesible (el arrastre nunca es la única vía).
//
// Portable: el tablero no conoce ningún endpoint ni estado de negocio. El
// consumidor describe columnas/tarjetas, decide los destinos permitidos y
// ejecuta el movimiento real en `onMover(id, estadoDestino)`. Cuando `onMover`
// devuelve una promesa, la tarjeta se mueve al soltar (optimismo) y vuelve a su
// columna si el resultado es `{ ok: false }` o la promesa rechaza; el aviso lo
// elige el consumidor con `onError`.

const SIN_MOVIMIENTOS = new Set()

/**
 * Columnas reales del tablero: las declaradas más los estados que llegan en los
 * datos sin columna propia (se dibujan igual, con su valor crudo, para no
 * ocultar filas).
 */
export function columnasDelTablero(columnas = [], tarjetas = []) {
  const declaradas = [...(columnas || [])]
  const valores = new Set(declaradas.map((columna) => columna.valor))
  const extras = [...new Set((tarjetas || []).map((tarjeta) => tarjeta.estado).filter((estado) => estado !== null && estado !== undefined && estado !== '' && !valores.has(estado)))].sort()
  return [...declaradas, ...extras.map((valor) => ({ valor, titulo: valor, tono: 'mute' }))]
}

/** Tarjetas agrupadas por columna (`{ [valor]: tarjeta[] }`, en el orden que llegan). */
export function agruparTarjetas(columnas = [], tarjetas = []) {
  const grupos = {}
  for (const columna of columnas) grupos[columna.valor] = []
  for (const tarjeta of tarjetas || []) {
    if (grupos[tarjeta.estado]) grupos[tarjeta.estado].push(tarjeta)
  }
  return grupos
}

/**
 * Destinos reales de una tarjeta: su máquina de estados (`destinos`) o todas
 * las columnas, sin repetidos y sin la columna donde ya está.
 */
export function destinosDeTarjeta(tarjeta, columnas = []) {
  const permitidos = tarjeta?.destinos ?? columnas.map((columna) => columna.valor)
  return (permitidos || []).filter((valor, indice) => valor !== tarjeta?.estado && permitidos.indexOf(valor) === indice)
}

/**
 * Movimiento optimista del tablero (el mismo contrato del `useAdminBoardMove`
 * de LedBox): la tarjeta cambia de columna al pedirlo, `onMover` ejecuta el
 * cambio real y, si falla, se revierte y se avisa por `onError`.
 *
 * Idempotencia: pedir la columna donde la tarjeta ya está es un no-op y una
 * tarjeta con un movimiento en vuelo no acepta otro (single-flight). El override
 * se limpia solo cuando el dato real ya coincide.
 */
export function useTableroOptimista({ tarjetas = [], onMover, onError } = {}) {
  const [overrides, setOverrides] = useState({})
  const [moviendo, setMoviendo] = useState(SIN_MOVIMIENTOS)
  const tarjetasRef = useRef(tarjetas)
  const overridesRef = useRef(overrides)
  const enVueloRef = useRef(new Set())

  useEffect(() => {
    tarjetasRef.current = tarjetas
  }, [tarjetas])

  useEffect(() => {
    overridesRef.current = overrides
  }, [overrides])

  // El estado real ya alcanzó al optimista (o la fila desapareció): el override sobra.
  useEffect(() => {
    setOverrides((actual) => {
      const entradas = Object.entries(actual)
      if (entradas.length === 0) return actual
      const siguiente = {}
      for (const [id, estado] of entradas) {
        const tarjeta = (tarjetas || []).find((candidata) => candidata.id === id)
        if (tarjeta && tarjeta.estado !== estado) siguiente[id] = estado
      }
      return Object.keys(siguiente).length === entradas.length ? actual : siguiente
    })
  }, [tarjetas])

  const efectivas = useMemo(
    () =>
      (tarjetas || []).map((tarjeta) => {
        const optimista = overrides[tarjeta.id]
        return optimista && optimista !== tarjeta.estado ? { ...tarjeta, estado: optimista } : tarjeta
      }),
    [tarjetas, overrides],
  )

  const revertir = useCallback(
    (id, mensaje) => {
      setOverrides((actual) => {
        if (!(id in actual)) return actual
        const siguiente = { ...actual }
        delete siguiente[id]
        return siguiente
      })
      if (mensaje) onError?.(mensaje)
    },
    [onError],
  )

  const moverA = useCallback(
    (id, estadoDestino) => {
      if (!onMover || !id || !estadoDestino) return
      const tarjeta = tarjetasRef.current.find((candidata) => candidata.id === id)
      const vigente = overridesRef.current[id] ?? tarjeta?.estado
      if (!tarjeta || vigente === estadoDestino || enVueloRef.current.has(id)) return

      const liberar = () => {
        enVueloRef.current.delete(id)
        setMoviendo((actual) => {
          if (!actual.has(id)) return actual
          const siguiente = new Set(actual)
          siguiente.delete(id)
          return siguiente
        })
      }
      const terminar = (resultado) => {
        if (resultado && resultado.ok === false) revertir(id, resultado.error || 'No se pudo mover la tarjeta.')
      }

      enVueloRef.current.add(id)
      setOverrides((actual) => ({ ...actual, [id]: estadoDestino }))
      setMoviendo((actual) => new Set(actual).add(id))
      try {
        const resultado = onMover(id, estadoDestino)
        if (resultado && typeof resultado.then === 'function') {
          resultado
            .then(terminar)
            .catch(() => revertir(id, 'No se pudo mover la tarjeta.'))
            .finally(liberar)
        } else {
          terminar(resultado)
          liberar()
        }
      } catch {
        revertir(id, 'No se pudo mover la tarjeta.')
        liberar()
      }
    },
    [onMover, revertir],
  )

  return { tarjetas: efectivas, moverA, moviendo }
}

export default function TableroKanban({
  /** Nombre del tablero para lectores de pantalla («Presupuestos», «Trabajos»). */
  etiqueta = 'Tablero',
  /** Columnas del pipeline: `[{ valor, titulo, tono? }]`. */
  columnas = [],
  /**
   * Tarjetas: `[{ id, estado, titulo, subtitulo?, chips?, monto?, montoNota?,
   * fecha?, detalle?, acciones?, destinos? }]`.
   */
  tarjetas = [],
  /** Rol con permiso de escritura: sin él no hay arrastre ni «Mover a…». */
  puedeMover = false,
  etiquetaMover = 'Mover a…',
  textoVacio = 'Sin tarjetas',
  /** `(id, estadoDestino) => void | { ok: true } | { ok: false, error } | Promise<…>`. */
  onMover,
  /** Aviso del revert (por ejemplo, el toast de la pantalla). */
  onError,
  className,
}) {
  const { tarjetas: efectivas, moverA, moviendo } = useTableroOptimista({ tarjetas, onMover, onError })
  const [arrastrandoId, setArrastrandoId] = useState('')
  const [sobreColumna, setSobreColumna] = useState('')

  const columnasReales = useMemo(() => columnasDelTablero(columnas, efectivas), [columnas, efectivas])
  const grupos = useMemo(() => agruparTarjetas(columnasReales, efectivas), [columnasReales, efectivas])

  const arrastrando = arrastrandoId ? efectivas.find((tarjeta) => tarjeta.id === arrastrandoId) ?? null : null
  const acepta = (tarjeta, valor) =>
    Boolean(onMover && puedeMover && tarjeta && !moviendo.has(tarjeta.id) && destinosDeTarjeta(tarjeta, columnasReales).includes(valor))

  function terminarArrastre() {
    setArrastrandoId('')
    setSobreColumna('')
  }

  const tituloDe = (valor) => columnasReales.find((columna) => columna.valor === valor)?.titulo ?? valor

  return (
    <div className={cn('flex snap-x gap-3 overflow-x-auto pb-2', className)} role="group" aria-label={etiqueta}>
      {columnasReales.map((columna) => {
        const deLaColumna = grupos[columna.valor] ?? []
        const sobre = sobreColumna === columna.valor && acepta(arrastrando, columna.valor)
        return (
          <section
            key={columna.valor}
            aria-label={`${columna.titulo}: ${deLaColumna.length}`}
            className={cn(
              'flex w-[17.5rem] shrink-0 snap-start flex-col rounded-2xl border border-ink-600 bg-ink-900/60 transition',
              sobre && 'border-fono/60 ring-2 ring-fono/30',
            )}
            onDragOver={(event) => {
              if (!acepta(arrastrando, columna.valor)) return
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              setSobreColumna(columna.valor)
            }}
            onDragLeave={() => setSobreColumna((actual) => (actual === columna.valor ? '' : actual))}
            onDrop={(event) => {
              if (!acepta(arrastrando, columna.valor)) return
              event.preventDefault()
              const id = event.dataTransfer.getData('text/plain') || arrastrandoId
              terminarArrastre()
              if (id) moverA(id, columna.valor)
            }}
          >
            <header className="flex items-center gap-2 border-b border-ink-600 px-3 py-2">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', puntoDeTono(columna.tono))} aria-hidden="true" />
              <h3 className="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-wider text-mute">{columna.titulo}</h3>
              <span className="shrink-0 rounded-md bg-ink-700 px-1.5 text-[11px] font-bold tabular-nums text-mute" title={`${deLaColumna.length} tarjeta${deLaColumna.length === 1 ? '' : 's'}`}>
                {deLaColumna.length}
              </span>
            </header>

            <div className="flex min-h-[3rem] flex-col gap-2 p-2">
              {deLaColumna.map((tarjeta) => {
                const destinos = destinosDeTarjeta(tarjeta, columnasReales)
                const movible = Boolean(onMover && puedeMover && destinos.length > 0 && !moviendo.has(tarjeta.id))
                const tieneMonto = tarjeta.monto !== null && tarjeta.monto !== undefined
                return (
                  <article
                    key={tarjeta.id}
                    className={cn(
                      'rounded-xl border border-ink-600 bg-ink p-2.5 transition',
                      arrastrandoId === tarjeta.id && 'opacity-60',
                      moviendo.has(tarjeta.id) && 'opacity-70',
                    )}
                    aria-busy={moviendo.has(tarjeta.id) || undefined}
                    draggable={movible}
                    onDragStart={(event) => {
                      if (!movible) {
                        event.preventDefault()
                        return
                      }
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', tarjeta.id)
                      setArrastrandoId(tarjeta.id)
                    }}
                    onDragEnd={terminarArrastre}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <strong className="min-w-0 flex-1 truncate text-sm font-semibold text-fore" title={tarjeta.titulo}>
                        {tarjeta.titulo}
                      </strong>
                      {tarjeta.acciones && <span className="shrink-0">{tarjeta.acciones}</span>}
                    </div>

                    {tarjeta.subtitulo && (
                      <p className="mt-0.5 truncate text-xs text-mute" title={tarjeta.subtitulo}>
                        {tarjeta.subtitulo}
                      </p>
                    )}

                    {tarjeta.chips?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {tarjeta.chips.map((chip, indice) => (
                          <span
                            key={chip.etiqueta ?? indice}
                            title={chip.titulo ?? chip.etiqueta}
                            className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold', chipDeTono(chip.tono))}
                          >
                            {chip.icono && <Icon name={chip.icono} className="h-3 w-3" aria-hidden="true" />}
                            {chip.etiqueta}
                          </span>
                        ))}
                      </div>
                    )}

                    {(tieneMonto || tarjeta.fecha) && (
                      <div className="mt-1.5 flex items-baseline justify-between gap-2">
                        {tieneMonto && (
                          <span className="min-w-0 truncate text-xs font-semibold tabular-nums text-fore">
                            <Money value={tarjeta.monto} />
                            {tarjeta.montoNota && <small className="ml-1 font-normal text-mute">{tarjeta.montoNota}</small>}
                          </span>
                        )}
                        {tarjeta.fecha && (
                          <span className={cn('shrink-0 text-[11px] tabular-nums text-mute', !tieneMonto && 'ml-auto')} title={tarjeta.fechaTitulo}>
                            {fechaDia(tarjeta.fecha)}
                          </span>
                        )}
                      </div>
                    )}

                    {tarjeta.detalle && <p className="mt-1 text-[11px] leading-4 text-mute">{tarjeta.detalle}</p>}

                    {movible && (
                      <div className="mt-2" onDragStart={(event) => event.preventDefault()}>
                        <label className="sr-only" htmlFor={`mover-${tarjeta.id}`}>{`Mover ${tarjeta.titulo} a otro estado`}</label>
                        <select
                          id={`mover-${tarjeta.id}`}
                          value=""
                          onChange={(event) => {
                            if (event.target.value) moverA(tarjeta.id, event.target.value)
                          }}
                          title={etiquetaMover}
                          className={cn(
                            'h-8 w-full cursor-pointer rounded-lg border border-ink-500 bg-ink-800 px-2 text-xs text-fore',
                            'outline-none transition focus:border-fono focus:ring-1 focus:ring-fono/40 [&>option]:bg-ink-800 [&>option]:text-fore',
                          )}
                        >
                          <option value="">{etiquetaMover}</option>
                          {destinos.map((valor) => (
                            <option key={valor} value={valor}>
                              {tituloDe(valor)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </article>
                )
              })}

              {deLaColumna.length === 0 && <p className="px-2 py-6 text-center text-xs text-mute">{textoVacio}</p>}
            </div>
          </section>
        )
      })}
    </div>
  )
}
