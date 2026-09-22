import { useState } from 'react'
import { cn } from '../utils/cn.js'
import { colorDeBanco, inicialesDeBanco, logoDeBanco } from '../utils/bancos.js'

// Logo de un banco: asset del host, marca vectorial o monograma con iniciales +
// color. Nunca deja un cuadro roto: si el archivo no carga, cae al monograma.
//
// - `baseAssets`: carpeta pública donde viven los archivos del catálogo
//   (por defecto `/bancos`; si se pasa `''`, el registro debe traer URL).
// - `marcas`: mapa `nombre → componente` para los bancos que usan marca
//   vectorial compartida (p. ej. `{ ueno: UenoMark }`).
// - `soloCatalogo`: en listados, no inventar monograma para nombres escritos a
//   mano (solo bancos del catálogo o marcas conocidas).
export default function BancoLogo({ banco, alto = 'h-5', className, soloCatalogo = false, baseAssets = '/bancos', marcas = {} }) {
  const [fallo, setFallo] = useState(false)
  const texto = String(banco || '').trim()
  const registro = logoDeBanco(texto)
  if (!registro) return null

  const marca = registro.tipo === 'marca' ? registro.marca : null
  if (marca && marcas[marca]) {
    const Logo = marcas[marca]
    return (
      <span className={cn('inline-flex items-center', alto, className)} title={texto}>
        <Logo />
      </span>
    )
  }

  if (soloCatalogo && registro.generico) return null

  if (registro.tipo === 'archivo' && !fallo) {
    return (
      <span className={cn('inline-flex items-center', alto, className)} title={texto}>
        <img
          src={baseAssets ? `${baseAssets.replace(/\/$/, '')}/${registro.archivo}` : registro.archivo}
          alt=""
          loading="lazy"
          onError={() => setFallo(true)}
          className={cn('h-full w-auto max-w-[6rem] object-contain', registro.chip && 'rounded-[4px] bg-white px-1 py-[1px]')}
        />
      </span>
    )
  }

  // Si el asset no carga, monograma con las iniciales del banco.
  const iniciales = registro.iniciales || inicialesDeBanco(texto)
  const color = registro.color || colorDeBanco(texto)
  return (
    <span className={cn('inline-flex items-center', alto, className)} title={texto}>
      <span
        aria-hidden="true"
        className="grid h-full min-w-[1.15rem] place-items-center rounded-[5px] px-1 text-[9px] font-bold leading-none tracking-tight text-white"
        style={{ backgroundColor: color }}
      >
        {iniciales}
      </span>
    </span>
  )
}
