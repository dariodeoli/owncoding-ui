import { fechaCorta } from '../utils/fecha.js'
import { cn } from '../utils/cn.js'

// Semáforo de un vencimiento (#240/#250): dice «venció», «en 3 d» o la fecha,
// con el tono según la urgencia. Portable: la fecha entra por prop (o por
// `estadoVencimiento`) y el vacío es explícito.
//
//   <Vencimiento fecha={garantia.expiresAt} />         // texto con tono
//   <Vencimiento fecha={cuota.vence} variante="chip" />
export function estadoVencimiento(fecha, { hoy = new Date(), diasAviso = 7 } = {}) {
  const vence = fecha ? new Date(fecha) : null
  if (!vence || Number.isNaN(vence.getTime())) return { texto: '—', tono: 'mute', vencido: false, dias: null, titulo: 'Sin vencimiento cargado' }
  const titulo = `Vence el ${vence.toLocaleDateString('es-PY')}`
  const dias = Math.ceil((vence.getTime() - hoy.getTime()) / 86400000)
  if (dias < 0) return { texto: 'venció', tono: 'bad', vencido: true, dias, titulo }
  if (dias <= diasAviso) return { texto: `en ${dias} d`, tono: 'warn', vencido: false, dias, titulo }
  return { texto: fechaCorta(vence), tono: 'mute', vencido: false, dias, titulo }
}

const CLASES = {
  bad: 'text-bad-text',
  warn: 'text-warn-text',
  ok: 'text-ok-text',
  mute: 'text-mute',
}
const CHIP = {
  bad: 'border-bad/30 bg-bad/10 text-bad-text',
  warn: 'border-warn/30 bg-warn/10 text-warn-text',
  ok: 'border-ok/30 bg-ok/10 text-ok-text',
  mute: 'border-ink-500 bg-ink-700 text-mute',
}

export default function Vencimiento({ fecha, variante = 'texto', diasAviso = 7, hoy, texto, vacio = '—', className }) {
  if (!fecha) return <span className={cn('text-xs text-mute', className)}>{vacio}</span>
  const estado = estadoVencimiento(fecha, { hoy, diasAviso })
  const contenido = texto || estado.texto
  if (variante === 'chip') {
    return (
      <span className={cn('inline-flex items-center whitespace-nowrap rounded-lg border px-2 py-0.5 text-xs font-semibold tabular-nums', CHIP[estado.tono] || CHIP.mute, className)} title={estado.titulo}>
        {contenido}
      </span>
    )
  }
  return <span className={cn('whitespace-nowrap text-xs font-medium tabular-nums', CLASES[estado.tono] || CLASES.mute, className)} title={estado.titulo}>{contenido}</span>
}
