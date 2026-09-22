import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'

// Barra de navegación inferior para mobile: hasta 4 accesos directos + «Más»,
// que dispara el callback de la app (drawer de módulos, hoja de opciones, lo
// que corresponda). El ítem activo se marca con `aria-current="page"`.
//
// La barra es `fixed` y NO reserva espacio: el consumidor corre el contenido
// con `ESPACIO_BARRA_INFERIOR` (o su propio padding) para que no tape nada.
// En pantallas medianas en adelante no se dibuja (`md:hidden`).
//
// Portable: no conoce el router; cada ítem es un enlace (`href`) o un botón
// (`onClick`).

/** Padding que la app le da al contenido para que la barra no lo tape. */
export const ESPACIO_BARRA_INFERIOR = 'pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0'

export default function BarraInferior({
  items = [],
  activo,
  onSelect,
  onMas,
  masEtiqueta = 'Más',
  masIcono = 'menu',
  menuAbierto = false,
  menuId,
  maxItems = 4,
  ariaLabel = 'Navegación inferior',
  className,
}) {
  const visibles = items.slice(0, maxItems)
  if (!visibles.length && !onMas) return null

  const claseItem = (esActivo) =>
    cn(
      'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-semibold transition',
      esActivo ? 'text-fono-light' : 'text-mute hover:text-fore',
    )

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 flex border-t border-ink-600 bg-ink-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden',
        className,
      )}
    >
      {visibles.map((item) => {
        const esActivo = item.id === activo
        const contenido = (
          <>
            <span className="relative">
              {item.icono && <Icon name={item.icono} className="h-[18px] w-[18px]" />}
              {item.contador != null && item.contador !== 0 && (
                <span className="absolute -right-2 -top-1.5 rounded-full bg-fono px-1 text-[9px] font-bold tabular-nums text-onbrand">
                  {item.contador}
                </span>
              )}
            </span>
            <span className="max-w-full truncate">{item.etiqueta}</span>
          </>
        )
        const titulo = item.title || item.etiqueta
        const clase = cn(claseItem(esActivo), 'h-14')
        return item.href ? (
          <a
            key={item.id ?? item.href}
            href={item.href}
            onClick={item.onClick}
            aria-current={esActivo ? 'page' : undefined}
            aria-label={item.ariaLabel || item.etiqueta}
            title={titulo}
            className={clase}
          >
            {contenido}
          </a>
        ) : (
          <button
            key={item.id ?? item.etiqueta}
            type="button"
            onClick={() => {
              onSelect?.(item.id)
              item.onClick?.()
            }}
            aria-current={esActivo ? 'page' : undefined}
            aria-label={item.ariaLabel || item.etiqueta}
            title={titulo}
            className={clase}
          >
            {contenido}
          </button>
        )
      })}

      {onMas && (
        <button
          type="button"
          onClick={onMas}
          aria-label={masEtiqueta}
          aria-controls={menuId}
          aria-expanded={menuAbierto}
          title={masEtiqueta}
          className={cn(claseItem(menuAbierto), 'h-14')}
        >
          <Icon name={masIcono} className="h-[18px] w-[18px]" />
          <span className="max-w-full truncate">{masEtiqueta}</span>
        </button>
      )}
    </nav>
  )
}
