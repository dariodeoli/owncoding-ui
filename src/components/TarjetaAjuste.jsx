import { Card } from './ui.jsx'
import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'

// Tarjeta de ajuste (modelo de ajustes): título + descripción y, a la derecha,
// una acción opcional; el cuerpo va como children. Es la pieza con la que se
// arma una pantalla de Configuración sin repetir la cabecera en cada sección.

export default function TarjetaAjuste({ titulo, descripcion, accion, icono, children, className, id }) {
  return (
    <Card id={id} className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-semibold">
            {icono && <Icon name={icono} className="h-4 w-4 text-mute" />}
            {titulo}
          </h2>
          {descripcion && <p className="mt-1 text-sm text-mute">{descripcion}</p>}
        </div>
        {accion && <div className="shrink-0">{accion}</div>}
      </div>
      {children}
    </Card>
  )
}
