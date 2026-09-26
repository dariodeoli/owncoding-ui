import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'

// Menú desplegable portable (usuario, acciones de fila, filtros):
//   items: [{ id?, label, icono?, onClick?, peligro?, disabled?, separador? }]
// Cierra con clic afuera y con Esc; `trigger` es el botón visible.

export default function MenuDesplegable({ trigger, items = [], alineacion = 'right', ariaLabel = 'Menú', className }) {
  const [abierto, setAbierto] = useState(false)
  const raiz = useRef(null)

  useEffect(() => {
    if (!abierto) return undefined
    const cerrarFuera = (event) => {
      if (event.target instanceof Node && raiz.current?.contains(event.target)) return
      setAbierto(false)
    }
    const cerrarEsc = (event) => { if (event.key === 'Escape') setAbierto(false) }
    document.addEventListener('click', cerrarFuera)
    document.addEventListener('keydown', cerrarEsc)
    return () => {
      document.removeEventListener('click', cerrarFuera)
      document.removeEventListener('keydown', cerrarEsc)
    }
  }, [abierto])

  return (
    <div ref={raiz} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((actual) => !actual)}
        className="inline-flex items-center gap-2 rounded-lg transition"
      >
        {trigger}
      </button>
      {abierto && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={cn('absolute z-30 mt-1 min-w-48 rounded-xl border border-ink-500 bg-ink p-1 shadow-float', alineacion === 'right' ? 'right-0' : 'left-0')}
        >
          {items.map((item, indice) => {
            if (item.separador) return <div key={`sep-${indice}`} className="my-1 h-px bg-ink-600" />
            return (
              <button
                key={item.id ?? item.label ?? indice}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => { setAbierto(false); item.onClick?.() }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition',
                  item.peligro ? 'text-bad-text hover:bg-bad/10' : 'text-fore hover:bg-ink-700',
                  item.disabled && 'cursor-not-allowed opacity-40',
                )}
              >
                {item.icono && <Icon name={item.icono} className="h-4 w-4 shrink-0" />}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.extra}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
