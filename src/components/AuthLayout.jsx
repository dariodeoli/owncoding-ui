import { cn } from '../utils/cn.js'

// Layout de las pantallas de acceso: columna de marca a la izquierda (slot) y
// el formulario a la derecha. Portable: la app pasa su logo, su copy, el
// cambio de tema y el pie; acá no se conoce ninguna marca ni sesión.

export default function AuthLayout({ logo, aside, acciones, pie, children, className }) {
  return (
    <main className={cn('relative flex min-h-dvh flex-col overflow-x-hidden bg-paper text-fore', className)}>
      {acciones && <div className="absolute right-4 top-4 z-20">{acciones}</div>}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-fono/15 blur-3xl" />
      <div className="mx-auto grid w-full max-w-[1380px] flex-1 items-center gap-12 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-12">
        <section className="hidden lg:block">
          {logo}
          {aside}
        </section>
        {children}
      </div>
      {pie && <div className="shrink-0">{pie}</div>}
    </main>
  )
}
