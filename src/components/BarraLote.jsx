import { Button } from './ui.jsx'

// Barra de acciones por lote: aparece cuando hay selección, dice cuántos
// elementos se van a tocar y aloja las acciones (que pasa el llamador). Un solo
// objeto para todas las listas.
export default function BarraLote({ cantidad = 0, onLimpiar, children, etiqueta, className }) {
  if (!cantidad) return null
  return (
    <div className={className ?? 'flex flex-wrap items-center justify-between gap-2 rounded-xl border border-fono/30 bg-fono/5 px-3 py-2 text-sm'}>
      <span className="font-medium">{etiqueta ?? `${cantidad} seleccionada(s)`}</span>
      <span className="flex flex-wrap items-center gap-2">
        {children}
        {onLimpiar ? <Button variant="ghost" className="h-8 px-2 text-xs" onClick={onLimpiar}>Limpiar</Button> : null}
      </span>
    </div>
  )
}
