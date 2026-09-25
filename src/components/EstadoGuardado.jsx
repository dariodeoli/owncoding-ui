import { Aviso, Badge } from './ui.jsx'
import { cn } from '../utils/cn.js'

// Estado del guardado de un formulario de Configuración (#162/#253): el chip
// verde «Guardado…» o el error en rojo, en el mismo lugar donde el usuario
// apretó Guardar. Portable: recibe `estado` (`{ ok, texto }` o null) y anuncia
// el cambio con `aria-live`; el guardado contra la API lo maneja la app.
export default function EstadoGuardado({ testId, estado, className }) {
  return (
    <div data-testid={testId} aria-live="polite" className={cn('min-w-0', className)}>
      {estado && (estado.ok
        ? <Badge color="green">{estado.texto}</Badge>
        : <Aviso tono="error" compact className="max-w-xl">{estado.texto}</Aviso>)}
    </div>
  )
}
