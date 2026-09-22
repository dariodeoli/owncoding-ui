import { Badge, Button } from './ui.jsx'
import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'
import { colorTrabajo, etiquetaTrabajo } from '../printing/estadoImpresoras.js'

// Botón de impresión con estados honestos: mientras el trabajo viaja no dice
// "impreso"; cuando el transporte lo aceptó, aclara que falta confirmar el
// papel. La app pasa el estado real del trabajo y el disparador.
//
// Estados: pendiente | reclamado | aceptado | incierto | fallido | confirmado
export default function BotonImprimir({
  onImprimir,
  estado = null,
  etiqueta = 'Imprimir',
  icono = 'printer',
  variant = 'outline',
  disabled = false,
  className,
}) {
  const enCurso = estado === 'pendiente' || estado === 'reclamado'
  const texto = enCurso ? etiquetaTrabajo(estado) : etiqueta
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Button type="button" variant={variant} disabled={disabled || enCurso} onClick={onImprimir} aria-busy={enCurso}>
        <Icon name={icono} className="h-4 w-4" />{texto}
      </Button>
      {estado && !enCurso && <Badge color={colorTrabajo(estado)} className="whitespace-nowrap">{etiquetaTrabajo(estado)}</Badge>}
    </span>
  )
}
