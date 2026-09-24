import { cn } from '../utils/cn.js'

// Stepper compacto del flujo de una unidad (por verificar → verificado →
// listo): puntos que marcan el avance y el nombre del paso a la vista. Es el
// indicador de una línea para listas y racks; el `Stepper` completo (línea o
// tarjetas) es para el flujo con acciones.
//
//   <PasosEquipo pasos={['Por verificar', 'Verificado', 'Listo']} actual={1} />
export default function PasosEquipo({ pasos = [], actual = 0, etiqueta, testId, className }) {
  if (!pasos.length) return null
  const etiquetaDe = (paso) => (typeof paso === 'string' ? paso : (paso.etiqueta ?? paso.label ?? ''))
  const claveDe = (paso, indice) => (typeof paso === 'string' ? indice : (paso.id ?? indice))
  const indiceActual = (() => {
    const i = pasos.findIndex((paso, indice) => claveDe(paso, indice) === actual)
    if (i >= 0) return i
    const numero = Number(actual)
    return Number.isInteger(numero) ? Math.min(Math.max(0, numero), pasos.length - 1) : 0
  })()
  const texto = etiqueta || etiquetaDe(pasos[indiceActual]) || String(actual)
  return (
    <span
      className={cn('flex items-center gap-1', className)}
      data-testid={testId}
      data-paso={indiceActual + 1}
      aria-label={`Paso ${indiceActual + 1} de ${pasos.length}: ${texto}`}
    >
      {pasos.map((paso, orden) => (
        <span
          key={claveDe(paso, orden)}
          aria-hidden="true"
          className={cn(
            'h-1.5 rounded-full transition-all',
            orden < indiceActual ? 'w-3 bg-fono/60' : orden === indiceActual ? 'w-5 bg-fono' : 'w-1.5 bg-ink-600',
          )}
        />
      ))}
      <span className="text-[10px] font-semibold text-mute">{texto}</span>
    </span>
  )
}
