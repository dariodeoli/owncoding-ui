import Icon from './Icon.jsx'
import { Button, Money } from './ui.jsx'
import { chipDeTono } from '../utils/tonos.js'
import { cn } from '../utils/cn.js'

// Hoja A4 imprimible (portada de los `lbprint` de LedBox: presupuesto, factura
// y orden de trabajo): encabezado con emisor/receptor e identificación, meta
// del documento (número, fechas, estado), tabla de detalle, liquidación
// (subtotal, descuento, IVA por tasa y total), notas y pie.
//
// Portable: los datos llegan resueltos por props y el botón de imprimir es un
// callback opcional (`onImprimir`); la librería no llama a `window.print()` ni
// conoce la marca. Las reglas `@media print` viven en `styles.css` (clase
// `oc-print`) y dejan la hoja limpia en A4: el consumidor marca con
// `oc-print-oculto` lo que no debe salir en papel (toolbar, navegación).

const CANTIDAD_FORMATTER = new Intl.NumberFormat('es-PY', { maximumFractionDigits: 3 })

/** Cantidad de la tabla: el número formateado o el texto tal cual llega. */
function cantidadTexto(cantidad) {
  if (cantidad === null || cantidad === undefined || cantidad === '') return ''
  return typeof cantidad === 'number' ? CANTIDAD_FORMATTER.format(cantidad) : cantidad
}

/** Bloque etiqueta/valor de la hoja (dato de emisor, receptor o meta). */
function Dato({ etiqueta, valor, className }) {
  if (!valor) return null
  return (
    <p className={cn('min-w-0', className)}>
      <span className="block text-[9.5px] font-bold uppercase tracking-wider oc-print-suave">{etiqueta}</span>
      <span className="block whitespace-pre-wrap text-[12.5px]">{valor}</span>
    </p>
  )
}

/** Bloque de identificación: nombre + documento + contacto, con o sin logo. */
function Identidad({ titulo, datos, logo, monograma }) {
  if (!datos) return null
  return (
    <section className="oc-print-bloque">
      <h2 className="mb-1.5 border-b pb-1 text-[10.5px] font-bold uppercase tracking-wider oc-print-suave oc-print-linea">{titulo}</h2>
      <div className="flex items-start gap-3">
        {(logo || monograma) && (
          <span className="shrink-0">
            {logo ? (
              <img src={logo} alt="" aria-hidden="true" className="h-9 w-9 object-contain" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-lg border text-[11px] font-bold oc-print-linea oc-print-suave" aria-hidden="true">
                {monograma}
              </span>
            )}
          </span>
        )}
        <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-2">
          <Dato etiqueta="Nombre" valor={datos.nombre} className="sm:col-span-2" />
          <Dato etiqueta={datos.etiquetaDocumento || 'RUC'} valor={datos.documento} />
          <Dato etiqueta="Teléfono" valor={datos.telefono} />
          <Dato etiqueta="Correo" valor={datos.correo} />
          <Dato etiqueta="Dirección" valor={datos.direccion} className="sm:col-span-2" />
        </div>
      </div>
    </section>
  )
}

/** Fila de la liquidación (subtotal, descuento, IVA, total u otros). */
function FilaLiquidacion({ etiqueta, valor, moneda, simbolo, nota, fuerte = false }) {
  const numero = Number(valor)
  const negativo = Number.isFinite(numero) && numero < 0
  return (
    <div className={cn('oc-print-fila', fuerte ? 'oc-print-fila--total' : 'oc-print-linea')}>
      <span className="min-w-0">
        {etiqueta}
        {nota && <small className="oc-print-suave"> {nota}</small>}
      </span>
      <span className="oc-print-num shrink-0 font-semibold">
        {negativo && '− '}
        <Money value={negativo ? Math.abs(numero) : valor} currency={moneda} simbolo={simbolo} />
      </span>
    </div>
  )
}

export default function DocumentoImpresion({
  /** Título del documento («Presupuesto», «Factura», «Orden de trabajo»). */
  titulo = 'Documento',
  /** Número o referencia visible junto al título. */
  numero = null,
  etiquetaNumero = 'N.º',
  /**
   * Datos del emisor: `{ nombre, documento?, etiquetaDocumento?, direccion?,
   * telefono?, correo?, logo? }`. El logo es una URL servida por la app.
   */
  emisor = null,
  /** Datos del receptor, con la misma forma que el emisor. */
  receptor = null,
  /** Meta del documento: `[{ etiqueta, valor }]` (fechas, validez, depósito…). */
  meta = [],
  /** Estado visible del documento («Aprobado», «Anulado»…). */
  estado = null,
  estadoTono = 'mute',
  /** Detalle: `[{ cantidad, concepto, unitario, subtotal, nota? }]`. */
  detalle = [],
  /**
   * Liquidación: `{ subtotal, descuento?, descuentoEtiqueta?, iva?, otros?,
   * total }`. `iva` = `[{ tasa, base?, monto }]` y `otros` =
   * `[{ etiqueta, monto }]` (flete, ajustes).
   */
  liquidacion = null,
  /** Notas del pie del documento (texto o nodo). */
  notas = null,
  notasEtiqueta = 'Notas',
  /** Pie de la hoja (texto o nodo). */
  pie = null,
  /** Callback del botón «Imprimir»; sin él no se dibuja el botón. */
  onImprimir,
  etiquetaImprimir = 'Imprimir',
  /** Moneda de los montos (`PYG` entero o `USD` con decimales). */
  moneda = 'PYG',
  /** Símbolo del guaraní para el panel de la app (p. ej. `Gs.`). */
  simbolo,
  etiquetaDetalle = 'Detalle',
  etiquetaEmisor = 'Emisor',
  etiquetaReceptor = 'Receptor',
  etiquetaLiquidacion = 'Liquidación',
  etiquetaMeta = 'Documento',
  vacioDetalle = 'Sin ítems cargados',
  className,
}) {
  const monograma = String(emisor?.nombre ?? '').trim().slice(0, 2).toUpperCase() || '··'
  const tieneLiquidacion = Boolean(liquidacion && (liquidacion.subtotal !== undefined || liquidacion.total !== undefined))

  return (
    <div className={cn('oc-print min-h-screen px-3 py-4 md:px-6', className)}>
      {onImprimir && (
        <div className="oc-print-oculto mx-auto mb-3 flex w-full max-w-[210mm] justify-end">
          <Button type="button" variant="outline" onClick={onImprimir}>
            <Icon name="printer" className="h-4 w-4" />
            {etiquetaImprimir}
          </Button>
        </div>
      )}

      <article className="oc-print-hoja">
        <header className="oc-print-bloque flex flex-wrap items-start justify-between gap-4 border-b-2 pb-2.5 oc-print-linea">
          <div className="flex min-w-0 items-center gap-2.5">
            {emisor?.logo ? (
              <img src={emisor.logo} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
            ) : (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-[11px] font-bold oc-print-linea oc-print-suave" aria-hidden="true">
                {monograma}
              </span>
            )}
            <span className="grid min-w-0 gap-0.5">
              <strong className="truncate text-[13px] font-bold tracking-wider">{emisor?.nombre || '—'}</strong>
              {emisor?.direccion && <span className="truncate text-[10.5px] uppercase tracking-wider oc-print-suave">{emisor.direccion}</span>}
            </span>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold uppercase tracking-wide">{titulo}</h1>
            {numero && (
              <p className="text-[12px] font-bold">
                {etiquetaNumero} {numero}
              </p>
            )}
            {estado && (
              <span className={cn('mt-0.5 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold', chipDeTono(estadoTono))}>{estado}</span>
            )}
          </div>
        </header>

        {(emisor || receptor) && (
          <div className="mt-3.5 grid gap-4 sm:grid-cols-2">
            <Identidad titulo={etiquetaEmisor} datos={emisor} logo={emisor?.logo} monograma={monograma} />
            <Identidad titulo={etiquetaReceptor} datos={receptor ? { ...receptor, etiquetaDocumento: receptor.etiquetaDocumento || 'RUC' } : null} />
          </div>
        )}

        {meta?.length > 0 && (
          <section className="oc-print-bloque mt-3.5">
            <h2 className="mb-1.5 border-b pb-1 text-[10.5px] font-bold uppercase tracking-wider oc-print-suave oc-print-linea">{etiquetaMeta}</h2>
            <div className="grid gap-1.5 sm:grid-cols-3">
              {meta.map((dato, indice) => (
                <Dato key={dato.etiqueta ?? indice} etiqueta={dato.etiqueta} valor={dato.valor} />
              ))}
            </div>
          </section>
        )}

        <section className="oc-print-bloque mt-3.5">
          <h2 className="mb-1.5 border-b pb-1 text-[10.5px] font-bold uppercase tracking-wider oc-print-suave oc-print-linea">{etiquetaDetalle}</h2>
          {detalle?.length > 0 ? (
            <table className="oc-print-tabla">
              <thead>
                <tr>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Concepto</th>
                  <th scope="col" className="oc-print-num">Unitario</th>
                  <th scope="col" className="oc-print-num">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalle.map((item, indice) => (
                  <tr key={item.id ?? indice}>
                    <td className="oc-print-num w-16">{cantidadTexto(item.cantidad)}</td>
                    <td>
                      {item.concepto}
                      {item.nota && <small className="block oc-print-suave">{item.nota}</small>}
                    </td>
                    <td className="oc-print-num">
                      <Money value={item.unitario} currency={moneda} simbolo={simbolo} />
                    </td>
                    <td className="oc-print-num">
                      <Money value={item.subtotal} currency={moneda} simbolo={simbolo} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="rounded-md border border-dashed px-2.5 py-2 text-[11.5px] oc-print-linea oc-print-suave">{vacioDetalle}</p>
          )}
        </section>

        {tieneLiquidacion && (
          <section className="oc-print-totales oc-print-bloque mt-3 ml-auto w-full max-w-[86mm]">
            <h2 className="mb-1.5 border-b pb-1 text-[10.5px] font-bold uppercase tracking-wider oc-print-suave oc-print-linea">{etiquetaLiquidacion}</h2>
            {liquidacion.subtotal !== undefined && <FilaLiquidacion etiqueta="Subtotal" valor={liquidacion.subtotal} moneda={moneda} simbolo={simbolo} />}
            {liquidacion.descuento ? (
              <FilaLiquidacion etiqueta={liquidacion.descuentoEtiqueta || 'Descuento'} valor={-Number(liquidacion.descuento)} moneda={moneda} simbolo={simbolo} />
            ) : null}
            {liquidacion.otros?.map((otro, indice) => (
              <FilaLiquidacion key={otro.etiqueta ?? indice} etiqueta={otro.etiqueta} valor={otro.monto} moneda={moneda} simbolo={simbolo} />
            ))}
            {liquidacion.iva?.map((iva, indice) => (
              <FilaLiquidacion
                key={`${iva.tasa}-${indice}`}
                etiqueta={`IVA ${iva.tasa}%`}
                nota={iva.base !== undefined ? <>sobre <Money value={iva.base} currency={moneda} simbolo={simbolo} /></> : null}
                valor={iva.monto}
                moneda={moneda} simbolo={simbolo}
              />
            ))}
            {liquidacion.total !== undefined && <FilaLiquidacion etiqueta="Total" valor={liquidacion.total} moneda={moneda} simbolo={simbolo} fuerte />}
          </section>
        )}

        {notas && (
          <section className="oc-print-bloque mt-3.5">
            <h2 className="mb-1.5 border-b pb-1 text-[10.5px] font-bold uppercase tracking-wider oc-print-suave oc-print-linea">{notasEtiqueta}</h2>
            <div className="oc-print-nota">{notas}</div>
          </section>
        )}

        {pie && <footer className="oc-print-bloque mt-5 flex flex-wrap items-baseline justify-between gap-3 border-t pt-2 text-[10px] oc-print-linea oc-print-suave">{pie}</footer>}
      </article>
    </div>
  )
}
