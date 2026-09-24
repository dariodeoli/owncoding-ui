import PersonaChip from './PersonaChip.jsx'
import { identidadDeUsuario, resumenPresencia } from '../utils/identidad.js'
import { cn } from '../utils/cn.js'

// Pila de personas en línea (#211/#241): avatares superpuestos con el punto de
// presencia y un contador «+N» cuando hay más de los que se muestran. Es la
// pieza de la píldora del shell; la app aporta las personas (el objeto no hace
// fetch) y puede usar `resumenPresencia` para el texto.
//
//   <PilaPersonas personas={presentes} max={4} onMas={abrirLista} />
export default function PilaPersonas({
  personas = [],
  max = 4,
  size = 'md',
  onMas,
  resumen = true,
  ariaLabel = 'Personas en línea',
  title,
  className,
}) {
  const lista = Array.isArray(personas) ? personas : []
  if (!lista.length) return null
  const visibles = lista.slice(0, Math.max(0, max))
  const restantes = lista.length - visibles.length
  const texto = title || resumenPresencia(lista)
  const contenido = (
    <>
      <span className="flex -space-x-2">
        {visibles.map((persona, indice) => {
          const fuente = typeof persona === 'string' ? { name: persona } : (persona || {})
          const identidad = identidadDeUsuario(fuente)
          return (
            <PersonaChip
              key={fuente.id ?? `${identidad.nombre}-${indice}`}
              user={fuente}
              foto={fuente.foto}
              picture={fuente.picture}
              size={size}
              nombre={false}
              estado={fuente.estado ?? (fuente.active ? 'en-linea' : undefined)}
              title={`${identidad.nombre}${identidad.scope ? ` · ${identidad.scope}` : ''}`}
              avatarClassName="border-paper"
            />
          )
        })}
        {restantes > 0 && (
          <span
            className={cn(
              'grid place-items-center rounded-full border border-paper bg-ink-700 font-bold text-mute',
              size === 'sm' ? 'h-6 w-6 text-[10px]' : size === 'lg' ? 'h-14 w-14 text-sm' : size === 'xs' ? 'h-5 w-5 text-[9px]' : size === 'xl' ? 'h-20 w-20 text-lg' : 'h-9 w-9 text-xs',
            )}
            aria-hidden={onMas ? undefined : 'true'}
          >
            +{restantes}
          </span>
        )}
      </span>
      {resumen && texto ? <span className="whitespace-nowrap text-xs font-semibold text-mute">{texto}</span> : null}
    </>
  )
  const clases = 'flex items-center gap-2 rounded-full border border-fore/10 bg-ink-700/60 px-2.5 py-1'
  return onMas ? (
    <button type="button" onClick={onMas} className={cn(clases, className)} aria-label={texto || ariaLabel} title={texto}>
      {contenido}
    </button>
  ) : (
    <div role="group" aria-label={texto || ariaLabel} title={texto} className={cn(clases, className)}>
      {contenido}
    </div>
  )
}
