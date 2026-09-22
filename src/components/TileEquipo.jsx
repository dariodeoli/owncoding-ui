import Icon from './Icon.jsx'
import ChipEstado from './ChipEstado.jsx'
import ChipsLocks from './ChipsLocks.jsx'
import GradoBadge from './GradoBadge.jsx'
import MedidorBateria from './MedidorBateria.jsx'
import IconoCategoria from './IconoCategoria.jsx'
import { cn } from '../utils/cn.js'

// Tile de equipo (#241): la unidad de la consola/rack — foto o icono de
// categoría, modelo, IMEI en monoespaciada, chip de estado, grado, batería y
// chips de locks. `onOpen` lo vuelve botón; `acciones` recibe los botones de la
// pantalla. No consulta nada: todo entra por props.
export default function TileEquipo({
  modelo,
  imei,
  detalle,
  foto,
  estado,
  grado,
  bateria,
  ciclos,
  locks,
  acciones,
  onOpen,
  className,
}) {
  const raiz = cn('w-full space-y-2.5 rounded-2xl border border-ink-600 bg-ink-800 p-3 text-left', onOpen && 'transition hover:border-fono active:scale-[.995]', className)
  const contenido = (
    <>
      <div className="flex items-start gap-3">
        {foto
          ? <img src={foto} alt={modelo || 'Equipo'} className="h-12 w-12 shrink-0 rounded-xl border border-ink-600 object-cover" />
          : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-ink-600 bg-ink-700 text-mute"><IconoCategoria categoria={modelo} className="h-6 w-6" /></span>}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{modelo || 'Equipo'}</p>
          {imei && <p className="mt-0.5 truncate font-mono text-[11px] text-mute" data-serial>{imei}</p>}
          {detalle && <p className="mt-0.5 truncate text-[11px] text-mute">{detalle}</p>}
        </div>
        {estado && <ChipEstado estado={estado} />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {grado && <GradoBadge grado={grado} />}
        {(bateria !== undefined && bateria !== null) && <MedidorBateria porcentaje={bateria} ciclos={ciclos} variante="chip" />}
        {locks?.length ? <ChipsLocks locks={locks} /> : null}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </>
  )

  if (onOpen) {
    return <button type="button" onClick={onOpen} className={raiz}>{contenido}</button>
  }
  return <article className={raiz}>{contenido}</article>
}
