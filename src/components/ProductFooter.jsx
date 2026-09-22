import { cn } from '../utils/cn.js'

// Pie institucional: nombre, versión, un texto propio (children) y el crédito
// con enlace. Todo por props: la librería no conoce la marca ni la versión.

export default function ProductFooter({
  nombre = '',
  version = '',
  credito = '',
  creditoUrl = '',
  anio = new Date().getFullYear(),
  leading,
  children,
  className,
}) {
  return (
    <footer className={cn('border-t border-fore/10 bg-transparent px-4 py-3 text-center text-[11px] text-mute', className)}>
      {leading}
      <span>© {anio} {nombre}. Todos los derechos reservados.{version ? ` · ${version}` : ''}</span>
      {children && <>{' · '}{children}</>}
      {credito && (
        <>
          {' · '}
          <a href={creditoUrl} target="_blank" rel="noreferrer" className="font-medium text-fono-dark hover:underline">{credito}</a>
        </>
      )}
    </footer>
  )
}

export { ProductFooter }
