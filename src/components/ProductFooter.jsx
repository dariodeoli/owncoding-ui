import { cn } from '../utils/cn.js'

// Pie institucional (#291): © + nombre + versión + crédito «Desarrollado por
// Owncoding» con enlace. **Obligatorio en TODAS las páginas** —panel, auth y
// públicas/tokenizadas—: la app inyecta marca y versión por props (la
// biblioteca no conoce la marca) y el crédito viene por defecto. Regla y
// checklist: `docs/REGLAS.md` §14 y `docs/SHELL.md` §6.
//
// `modelo="panel"` (opt-in) es la variante delgada para ir DENTRO de un panel:
// una sola fila (~49 px en escritorio), sin relleno de página; el área de toque
// de los enlaces sigue en 44 px (`toque-44`). El resto de los modelos no cambia.

/** Crédito institucional por defecto: la app puede pisarlo, no quitarlo. */
export const CREDITO_PIE = 'Desarrollado por Owncoding'
export const CREDITO_PIE_URL = 'https://owncoding.dev/'

export default function ProductFooter({
  identidad,
  nombre,
  version,
  modelo = 'compacto',
  enlaces = [],
  credito,
  creditoUrl,
  anio = new Date().getFullYear(),
  leading,
  children,
  className,
}) {
  const nombreVisible = nombre ?? identidad?.nombre ?? ''
  const versionVisible = version ?? identidad?.etiquetaVersion ?? (identidad?.version ? `v${identidad.version}` : '')
  const creditoVisible = credito === undefined ? (identidad?.credito ?? CREDITO_PIE) : credito
  const creditoHref = creditoUrl ?? identidad?.creditoUrl ?? CREDITO_PIE_URL
  const distribuido = modelo === 'distribuido'
  const apilado = modelo === 'apilado'
  const panel = modelo === 'panel'

  return (
    <footer
      data-testid="product-footer"
      data-modelo={modelo}
      className={cn(
        'border-t border-fore/10 bg-transparent px-4 py-4 text-xs leading-5 text-mute',
        panel && 'flex flex-wrap items-center justify-between gap-x-4 gap-y-0 py-2 text-left',
        distribuido ? 'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-left' : 'text-center',
        apilado && 'flex flex-col items-center gap-1',
        className,
      )}
    >
      <div className={cn('flex min-w-0 flex-wrap items-center justify-center gap-x-2', (distribuido || panel) && 'justify-start')}>
        {leading}
        {panel ? (
          <span>© {anio}{nombreVisible ? ` ${nombreVisible}` : ''}.<span className="max-sm:hidden"> Todos los derechos reservados.</span>{versionVisible ? ` · ${versionVisible}` : ''}</span>
        ) : (
          <span>© {anio}{nombreVisible ? ` ${nombreVisible}` : ''}. Todos los derechos reservados.{versionVisible ? ` · ${versionVisible}` : ''}</span>
        )}
        {children ? <span>{children}</span> : null}
      </div>
      {(enlaces.length > 0 || creditoVisible) ? (
        <nav aria-label="Información institucional" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {enlaces.map((enlace, indice) => {
            const externo = enlace.externo ?? /^https?:\/\//i.test(enlace.href ?? '')
            return enlace?.href && enlace?.etiqueta ? (
              <a
                key={enlace.id ?? enlace.href ?? indice}
                href={enlace.href}
                target={externo ? '_blank' : undefined}
                rel={externo ? 'noreferrer' : undefined}
                className={`toque-44 inline-flex ${panel ? 'min-h-8' : 'min-h-11'} items-center rounded-lg px-1 font-medium text-fono-dark underline-offset-4 hover:underline dark:text-fono-light`}
              >
                {enlace.etiqueta}
                {externo ? <span className="sr-only"> (se abre en otra pestaña)</span> : null}
              </a>
            ) : null
          })}
          {creditoVisible ? (
          <a
            href={creditoHref}
            target="_blank"
            rel="noreferrer"
            className={`toque-44 inline-flex ${panel ? 'min-h-8' : 'min-h-11'} items-center rounded-lg px-1 font-medium text-fono-dark underline-offset-4 hover:underline dark:text-fono-light`}
          >
            {creditoVisible}
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
          ) : null}
        </nav>
      ) : null}
    </footer>
  )
}

export { ProductFooter }
