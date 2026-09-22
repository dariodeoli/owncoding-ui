import { Badge } from './ui.jsx'
import { colorBadge, gradoCondicion } from '../utils/estadoEquipo.js'
import { cn } from '../utils/cn.js'

// Badge de grado de condición (#240/#241): A/B/C con su color fijo (A verde, B
// naranja, C rojo) y la descripción corta en el tooltip; `conDescripcion` la
// muestra al lado para el informe o la etiqueta impresa. Un grado fuera de
// A/B/C se muestra crudo y neutro, nunca se traduce a un grado que no es.
export default function GradoBadge({ grado, conDescripcion = false, className }) {
  const config = gradoCondicion(grado)
  if (!config) return <Badge className={className}>{grado || 'Sin grado'}</Badge>
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Badge color={colorBadge(config.tono)} className="whitespace-nowrap" title={config.descripcion}>{config.etiqueta}</Badge>
      {conDescripcion && <span className="text-xs text-mute">{config.descripcion}</span>}
    </span>
  )
}
