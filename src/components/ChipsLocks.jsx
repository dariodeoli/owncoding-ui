import Icon from './Icon.jsx'
import { LOCKS_DISPOSITIVO, TONOS, estadoLock } from '../utils/estadoEquipo.js'
import { cn } from '../utils/cn.js'

// Chips de locks del dispositivo (#240/#241): iCloud/Find My, MDM, ESN/lista
// negra, carrier/SIM lock y repuesto no OEM. Verde = libre, rojo = activo,
// gris = sin dato; el tooltip lleva el estado en palabras y `conEstado` lo
// muestra en el chip (informe). `locks` = [{ clave, estado, etiqueta?, detalle? }].
export default function ChipsLocks({ locks = [], conEstado = false, className }) {
  if (!locks.length) return null
  return (
    <ul className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {locks.map((lock) => {
        const config = estadoLock(lock.estado)
        const etiqueta = lock.etiqueta || LOCKS_DISPOSITIVO[lock.clave] || lock.clave
        return (
          <li
            key={lock.clave || etiqueta}
            className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold', TONOS.chip[config.tono])}
            title={lock.detalle || `${etiqueta}: ${config.etiqueta}`}
          >
            <Icon name={config.icono} className="h-3 w-3" aria-hidden="true" />
            {etiqueta}{conEstado ? ` · ${config.etiqueta}` : ''}
          </li>
        )
      })}
    </ul>
  )
}
