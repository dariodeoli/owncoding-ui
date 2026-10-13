import { useState } from 'react'
import { cn } from '../utils/cn.js'
import { opticaDeAsset } from '../financial/optica.js'

function fuenteDe(visual, baseAssets) {
  if (!visual?.archivo) return null
  if (visual.asset) return visual.asset
  if (typeof baseAssets === 'string' && baseAssets) {
    return `${baseAssets.replace(/\/$/, '')}/${visual.archivo}`
  }
  return visual.archivo
}

function Monograma({ iniciales, color, compacto }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid place-items-center rounded-[5px] px-1 text-[9px] font-bold leading-none tracking-tight text-white',
        compacto ? 'h-full w-full' : 'h-full min-w-[1.15rem]',
      )}
      style={{ backgroundColor: color }}
    >
      {iniciales}
    </span>
  )
}

// Vista recortada a la tinta del asset. La caja mide `altura` (fracción del alto del slot)
// y respeta la relación de la tinta; si el ancho disponible no alcanza se
// encoge (flex) y la imagen se vuelve a ajustar con object-fit, sin deformarse
// ni desbordar el slot. El archivo original no se modifica.
function ImagenOptica({ fuente, optica, chip, onError }) {
  const [x0, y0, x1, y1] = optica.tinta
  const ancho = x1 - x0
  const alto = y1 - y0
  const pct = (n) => `${+(n * 100).toFixed(3)}%`
  return (
    <span
      data-logo-optico=""
      className={cn('relative block min-w-0 shrink overflow-hidden', chip && 'rounded-[4px] bg-white')}
      style={{ height: pct(optica.altura), aspectRatio: String(optica.relacion), ...(optica.fondo ? { backgroundColor: optica.fondo } : {}) }}
    >
      <span
        aria-hidden="true"
        className="absolute block"
        style={{ width: pct(1 / ancho), height: pct(1 / alto), left: pct(-x0 / ancho), top: pct(-y0 / alto) }}
      >
        <img
          src={fuente}
          alt=""
          loading="lazy"
          decoding="async"
          onError={onError}
          className="block h-full w-full object-contain"
          style={{ objectPosition: `${pct(x0 + ancho / 2)} ${pct(y0 + alto / 2)}`, maxWidth: 'none', maxHeight: 'none' }}
        />
      </span>
    </span>
  )
}

// Render común para bancos y marcas de pago. La entrada ya viene resuelta por
// la utilidad pura correspondiente; el componente solo aplica presentación y
// fallback seguro ante un asset ausente o roto.
export default function LogoFinanciero({
  nombre,
  registro,
  alto = 'h-5',
  className,
  baseAssets,
  marcas = {},
  soloCatalogo = false,
  decorativo = false,
}) {
  const [assetFallido, setAssetFallido] = useState(null)
  if (!registro || (soloCatalogo && registro.generico)) return null

  const compacto = registro.variante === 'compacto'
  const visual = registro.visual || { tipo: 'monograma', estado: 'fallback' }
  const fuente = fuenteDe(visual, baseAssets)
  const fallo = fuente && assetFallido === fuente
  const iniciales = registro.iniciales || '?'
  const color = registro.color || '#33414F'
  const etiqueta = registro.banco || registro.marca || nombre
  const semantica = decorativo
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': `${etiqueta}, ${visual.descripcion || `logo ${compacto ? 'compacto' : 'horizontal'}`}` }

  const marcaPersonalizada = registro.marca && marcas[registro.marca]
  if (marcaPersonalizada) {
    const Logo = marcaPersonalizada
    return (
      <span
        {...semantica}
        className={cn('inline-flex items-center', compacto && 'aspect-square justify-center', alto, className)}
        data-logo-estado={visual.estado || registro.estado}
        data-logo-variante={registro.variante}
      >
        <Logo />
      </span>
    )
  }

  if (fuente && !fallo && ['archivo', 'horizontal-contained', 'marca-contained'].includes(visual.tipo)) {
    const placa = Boolean(visual.fondo)
    // Metadato óptico del asset empaquetado (o el que traiga el propio visual).
    const optica = visual.optica || (visual.empaquetado ? opticaDeAsset(visual.empaquetado, registro.variante, { placa }) : null)
    return (
      <span
        {...semantica}
        className={cn(
          'inline-flex min-w-0 max-w-full max-h-full items-center justify-center',
          compacto && 'aspect-square shrink-0 rounded-[5px]',
          // Un solo relleno por tamaño de slot: el compacto no lleva relleno (la
          // escala óptica ya deja aire) y el horizontal reserva el borde lateral.
          // Tema oscuro: toda marca sin placa propia va sobre placa clara para
          // conservar contraste; en tema claro no cambia nada.
          !placa && 'dark:rounded-md dark:bg-white',
          !placa && !compacto && 'dark:px-1.5',
          placa && visual.padding && (optica ? (compacto ? 'rounded-md' : 'rounded-md px-2') : (compacto ? 'rounded-md p-[2px]' : 'rounded-md p-1.5')),
          alto,
          className,
        )}
        style={placa ? { backgroundColor: visual.fondo } : undefined}
        data-logo-estado={visual.estado || registro.estado}
        data-logo-variante={registro.variante}
        data-logo-tipo={visual.tipo}
        title={visual.descripcion}
      >
        {optica ? (
          <ImagenOptica fuente={fuente} optica={optica} chip={registro.chip} onError={() => setAssetFallido(fuente)} />
        ) : (
          <img
            src={fuente}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setAssetFallido(fuente)}
            className={cn(
              'block max-h-full max-w-full object-contain',
              compacto ? 'h-full w-full' : 'h-full w-auto max-w-[min(100%,11rem)]',
              registro.chip && 'rounded-[4px] bg-white px-1 py-[1px]',
            )}
          />
        )}
      </span>
    )
  }

  if (visual.tipo === 'texto' || fallo) {
    return (
      <span
        {...semantica}
        className={cn(
          'inline-flex items-center justify-center text-center font-semibold leading-tight text-current',
          compacto ? 'aspect-square shrink-0 overflow-hidden rounded-[5px] px-0.5 text-[7px]' : 'whitespace-nowrap text-xs',
          alto,
          className,
        )}
        data-logo-estado={fallo ? 'asset-fallido' : (visual.estado || registro.estado)}
        data-logo-variante={registro.variante}
        data-logo-tipo="texto"
      >
        <span aria-hidden="true">{etiqueta}</span>
      </span>
    )
  }

  return (
    <span
      {...semantica}
      className={cn('inline-flex items-center', compacto && 'aspect-square shrink-0', alto, className)}
      data-logo-estado={visual.estado || registro.estado}
      data-logo-variante={registro.variante}
      data-logo-tipo="monograma"
    >
      <Monograma iniciales={iniciales} color={color} compacto={compacto} />
    </span>
  )
}
