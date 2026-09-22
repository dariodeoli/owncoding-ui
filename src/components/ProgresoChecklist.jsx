import { BarraProgreso } from './ui.jsx'
import { cn } from '../utils/cn.js'
import { tonoCanonico } from '../utils/tonos.js'

// Avance de un checklist (portado de `checklistProgress` de LedBox): barra +
// «x de y» + porcentaje con los umbrales reales —completo en `ok`, vencidas en
// `warn` y riesgo (sin ningún avance) en `bad`— y el detalle para el `title`.
//
// Portable: el objeto no cuenta tareas ni conoce fechas; recibe los números ya
// calculados por la pantalla. `role="progressbar"` y los `aria-*` los pone
// `BarraProgreso`; el texto visible repite el avance para no depender del color.

/**
 * Avance resuelto: porcentaje, tono, etiqueta «x de y» y detalle para el
 * `title`. Nunca inventa: `total` 0 es «Sin datos», no un 0 % engañoso.
 */
export function progresoChecklist({
  hechas = 0,
  total = 0,
  vencidas = 0,
  riesgo = false,
  sustantivo = 'tareas',
  textoVacio = 'Sin datos',
} = {}) {
  const totalNum = Math.max(0, Math.floor(Number(total) || 0))
  const hechasNum = Math.min(totalNum, Math.max(0, Math.floor(Number(hechas) || 0)))
  const vencidasNum = Math.min(totalNum - hechasNum, Math.max(0, Math.floor(Number(vencidas) || 0)))
  const pendientes = totalNum - hechasNum
  const completo = totalNum > 0 && hechasNum === totalNum
  const enRiesgo = Boolean(riesgo) && totalNum > 0 && hechasNum === 0
  const tono = enRiesgo ? 'bad' : vencidasNum > 0 ? 'warn' : completo ? 'ok' : 'fono'
  const porcentaje = totalNum > 0 ? Math.round((hechasNum / totalNum) * 100) : 0
  const etiqueta = totalNum > 0 ? `${hechasNum} de ${totalNum} ${sustantivo}` : textoVacio
  const partes = totalNum > 0 ? [`${hechasNum} de ${totalNum} ${sustantivo} cumplidas`] : [textoVacio]
  if (pendientes > 0) partes.push(`${pendientes} pendiente${pendientes === 1 ? '' : 's'}`)
  if (vencidasNum > 0) partes.push(`${vencidasNum} vencida${vencidasNum === 1 ? '' : 's'}`)
  if (enRiesgo) partes.push('sin avance: riesgo')
  return {
    hechas: hechasNum,
    total: totalNum,
    pendientes,
    vencidas: vencidasNum,
    riesgo: enRiesgo,
    completo,
    tono: tonoCanonico(tono),
    porcentaje,
    etiqueta,
    detalle: partes.join(' · '),
  }
}

export default function ProgresoChecklist({
  hechas = 0,
  total = 0,
  /** Pendientes ya vencidas (la pantalla las cuenta con su calendario real). */
  vencidas = 0,
  /** Checklist de un trabajo próximo sin ningún avance. */
  riesgo = false,
  /** Sustantivo del conteo («tareas», «ítems», «pass»). */
  sustantivo = 'tareas',
  /** Muestra el porcentaje a la derecha del conteo. */
  porcentaje = true,
  /** Muestra el detalle de pendientes/vencidas debajo de la barra. */
  mostrarDetalle = true,
  /** Altura de la barra (`sm`, `md`, `lg`). */
  alto = 'md',
  textoVacio = 'Sin datos',
  className,
}) {
  const avance = progresoChecklist({ hechas, total, vencidas, riesgo, sustantivo, textoVacio })
  const tonoTexto = avance.tono === 'ok' ? 'text-ok' : avance.tono === 'bad' ? 'text-bad' : avance.tono === 'warn' ? 'text-warn' : 'text-fore'
  const hayDetalle = avance.vencidas > 0 || avance.riesgo

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn('min-w-0 truncate text-xs font-semibold', avance.total > 0 ? tonoTexto : 'text-mute')} title={avance.detalle}>
          {avance.etiqueta}
        </span>
        {porcentaje && avance.total > 0 && <span className="shrink-0 text-xs tabular-nums text-mute">{avance.porcentaje}%</span>}
      </div>
      {avance.total > 0 && (
        <BarraProgreso valor={avance.hechas} max={avance.total} tono={avance.tono} alto={alto} etiqueta={avance.detalle} className="mt-1.5" />
      )}
      {mostrarDetalle && hayDetalle && (
        <p className="mt-1 text-[11px] text-mute">
          {avance.riesgo && <span className="text-bad">Sin avance</span>}
          {avance.riesgo && avance.vencidas > 0 && ' · '}
          {avance.vencidas > 0 && <span className="text-warn">{avance.vencidas} vencida{avance.vencidas === 1 ? '' : 's'}</span>}
        </p>
      )}
    </div>
  )
}
