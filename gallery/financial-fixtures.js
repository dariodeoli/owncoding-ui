import { BANCOS_PARAGUAY } from '../src/utils/bancos.js'
import { MEDIOS_PAGO_CON_MARCA, SOLUCIONES_PAGO_COMERCIOS, logoDeMedioPago } from '../src/utils/mediosPago.js'

export const BANCO_DESTACADO = 'ueno bank'

function tieneDosAssets(resolver, nombre) {
  return ['compacto', 'horizontal'].every((variante) => Boolean(resolver(nombre, variante)?.visual?.empaquetado))
}

export const BANCOS_PREVIEW = Object.freeze([
  BANCO_DESTACADO,
  ...BANCOS_PARAGUAY.filter((nombre) => nombre !== BANCO_DESTACADO),
])

export const MARCAS_PAGO_PREVIEW = Object.freeze(
  MEDIOS_PAGO_CON_MARCA.filter((nombre) => nombre !== 'uPOS' && tieneDosAssets(logoDeMedioPago, nombre)),
)

export const MARCAS_CONECTADAS_PREVIEW = Object.freeze(['Mango', 'Vaquita', 'EKO', 'eCLUB', 'Pik'])

export const SOLUCIONES_PAGO_COMERCIOS_PREVIEW = SOLUCIONES_PAGO_COMERCIOS

export const MARCAS_PAGO_RESTO_PREVIEW = Object.freeze(
  MARCAS_PAGO_PREVIEW.filter((nombre) => (
    !MARCAS_CONECTADAS_PREVIEW.includes(nombre)
    && !SOLUCIONES_PAGO_COMERCIOS_PREVIEW.marcas.includes(nombre)
  )),
)

// Slot uniforme de revisión: todas las instituciones usan el mismo tamaño por
// variante (48 px compacto, 52 px horizontal). El recorte y la escala ópticos
// (src/utils/financialOptica.js) compensan marcas con aire interno o formas
// muy distintas; ya no se agranda ningún banco a mano.
export function bankReviewSize(_nombre, variante) {
  return variante === 'compacto' ? 'h-12' : 'h-[3.25rem]'
}
