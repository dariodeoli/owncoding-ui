import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'

// Navegación lateral colapsable. Modelo de items portable:
//   [{ id, label, icono, contador?, activo? }]
// El estado colapsado es controlado (`colapsado` + `onToggle`) para que la app
// decida si lo recuerda; `cabecera` y `pie` son slots (logo, usuario, etc.).

export default function NavLateral({
  items = [],
  activeId,
  onSelect,
  colapsado = false,
  onToggle,
  cabecera,
  pie,
  ancho = 'w-64',
  ariaLabel = 'Navegación principal',
  className,
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn('flex h-dvh flex-col border-r border-ink-600 bg-ink-900 transition-[width] duration-200', colapsado ? 'w-[4.5rem]' : ancho, className)}
    >
      <div className={cn('flex items-center gap-2 px-3 py-3', colapsado && 'justify-center')}>
        {cabecera && <div className="min-w-0 flex-1">{cabecera}</div>}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={colapsado ? 'Expandir menú' : 'Contraer menú'}
            aria-expanded={!colapsado}
            className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg text-mute transition hover:bg-ink-700 hover:text-fore', colapsado && 'w-full')}
          >
            <Icon name="back" className={cn('h-4 w-4 transition-transform', colapsado && 'rotate-180')} />
          </button>
        )}
      </div>

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {items.map((item) => {
          const activo = item.id === activeId
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect?.(item.id)}
                aria-current={activo ? 'page' : undefined}
                title={colapsado ? item.label : undefined}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                  activo ? 'bg-fono/15 text-fono-light' : 'text-mute hover:bg-ink-700 hover:text-fore',
                  colapsado && 'justify-center px-2',
                )}
              >
                {item.icono && <Icon name={item.icono} className="h-4 w-4 shrink-0" />}
                {!colapsado && <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>}
                {!colapsado && item.contador != null && (
                  <span className="shrink-0 rounded-full bg-ink-700 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-mute">{item.contador}</span>
                )}
                {colapsado && item.contador != null && <span className="sr-only">{item.contador}</span>}
              </button>
            </li>
          )
        })}
      </ul>

      {pie && <div className="border-t border-ink-600 p-2">{pie}</div>}
    </nav>
  )
}
