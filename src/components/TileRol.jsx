import { Badge } from './ui.jsx'
import { cn } from '../utils/cn.js'

// Tile de un rol o acceso (#241, lote F): título, descripción, el conteo
// «x/y» en número grande y los dominios como chips (verde los que tiene).
// Portable: todo entra por props; la pantalla decide qué hacer al abrirlo.
//
//   <TileRol titulo="Gerente" descripcion="Opera el día a día" cantidad={18} total={32}
//     dominios={[{ etiqueta: 'Ventas', activo: true }, { etiqueta: 'Finanzas' }]} />
export default function TileRol({ titulo, descripcion, cantidad, total, dominios = [], onAbrir, className }) {
  const contenido = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <b className="block truncate text-sm">{titulo}</b>
          {descripcion ? <p className="mt-0.5 text-[11px] leading-4 text-mute">{descripcion}</p> : null}
        </div>
        {Number.isFinite(Number(total)) && Number(total) > 0 ? (
          <span className="v2-numero shrink-0 text-2xl font-bold tabular-nums">
            {Number(cantidad) || 0}<span className="text-sm font-semibold text-mute">/{Number(total)}</span>
          </span>
        ) : null}
      </div>
      {dominios.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {dominios.map((dominio, indice) => (
            <Badge key={dominio.id ?? `${dominio.etiqueta}-${indice}`} color={dominio.activo ? 'green' : 'slate'}>{dominio.etiqueta}</Badge>
          ))}
        </div>
      )}
    </>
  )
  const clases = 'block w-full rounded-2xl border border-ink-600 bg-ink-800 p-3 text-left'
  if (!onAbrir) return <div className={cn(clases, className)}>{contenido}</div>
  return (
    <button type="button" onClick={onAbrir} className={cn(clases, 'transition hover:border-fono/60', className)}>
      {contenido}
    </button>
  )
}
