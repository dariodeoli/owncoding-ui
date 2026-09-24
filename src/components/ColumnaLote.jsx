import { Badge, EmptyState } from './ui.jsx'
import { cn } from '../utils/cn.js'

// Columna de un tablero por lotes/estaciones (#240 §4 y #250): encabezado con
// el chip del estado, el conteo y las acciones masivas que pase la pantalla;
// abajo, las tarjetas del lote (o el vacío explícito). La usan el rack del
// taller y los tableros operativos para que todas las columnas se vean igual.
//
//   <ColumnaLote etiqueta="Por verificar" tono="orange" contador={5}
//     acciones={<Button …>Imprimir (5)</Button>} vacio="Sin equipos">
//     {tiles}
//   </ColumnaLote>
export default function ColumnaLote({ etiqueta, tono = 'slate', contador, acciones, children, vacio = 'Sin equipos', testId, className }) {
  const lista = Array.isArray(children) ? children.filter(Boolean) : children
  const vacia = !lista || (Array.isArray(lista) && lista.length === 0)
  return (
    <section data-testid={testId} className={cn('rounded-2xl border border-ink-600 bg-ink-800/40 p-3', className)}>
      <header className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Badge color={tono}>{etiqueta}</Badge>
          {contador !== undefined && contador !== null && <span className="text-xs tabular-nums text-mute">{contador}</span>}
        </span>
        {acciones ? <span className="flex flex-wrap items-center gap-2">{acciones}</span> : null}
      </header>
      <div className="mt-3 space-y-2">
        {vacia ? <EmptyState compact title={vacio} /> : lista}
      </div>
    </section>
  )
}
