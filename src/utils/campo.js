// Estilo único de los campos de formulario (Input, Select, Textarea,
// MoneyInput, PasswordInput, PinInput y los campos tipados que los componen).
// Una sola fuente: si cambia el aspecto, cambia acá y todos los controles
// quedan idénticos. Todo sale de tokens (`--c-*`), así que sirve en claro y
// oscuro sin ramas por tema.
//
// Estados (se resuelven con CSS, no con props):
// - reposo: superficie `ink-800` y borde `interactivo` (≥3:1, WCAG 1.4.11).
// - hover: el borde pasa a `mute`.
// - foco: borde de acento + anillo suave de 3 px. El control lleva
//   `outline-none` a propósito: el indicador es el borde + anillo, así no hay
//   doble contorno con el `:focus-visible` global de base.css.
// - inválido: `aria-invalid="true"` pinta borde y anillo `bad` sin otra prop
//   (FormField y MoneyInput ya lo ponen).
// - deshabilitado: superficie hundida, texto apagado y cursor prohibido.
// - solo lectura (`readOnly`): sin relleno y borde punteado. Se apoya en el
//   atributo, no en `:read-only`, porque un <select> siempre coincide con éste.

const COLOR_Y_TRANSICION = [
  'border border-interactivo bg-ink-800 text-fore',
  'outline-none transition-[border-color,box-shadow,background-color,color]',
  '[transition-duration:var(--oc-motion-fast,160ms)] [transition-timing-function:var(--oc-motion-ease,cubic-bezier(.2,.8,.2,1))]',
  'placeholder:text-placeholder',
].join(' ')

const HOVER = 'hover:border-mute'

// `fono-dark` es el tono de acento legible como indicador en los dos temas:
// con los tokens por defecto da ≥3:1 sobre la superficie del campo en claro
// (4 120 87) y en oscuro (4 185 120); una app con acento propio lo define
// legible en ambos (la galería lo hace). El de marca (`fono`) queda casi blanco
// sobre superficies claras (#241).
const FOCO = 'focus:border-fono-dark focus:ring-[3px] focus:ring-fono-dark/25'

const INVALIDO = [
  'aria-[invalid=true]:border-bad aria-[invalid=true]:hover:border-bad',
  'aria-[invalid=true]:focus:border-bad aria-[invalid=true]:focus:ring-bad/25',
].join(' ')

// Éxito opt-in (`estado="ok"` en el control → `data-oc-estado="ok"`): borde y
// anillo `ok`. El inválido gana: el control no emite `ok` si hay `aria-invalid`.
const OK = [
  '[&[data-oc-estado=ok]]:border-ok [&[data-oc-estado=ok]]:hover:border-ok',
  '[&[data-oc-estado=ok]]:focus:border-ok [&[data-oc-estado=ok]]:focus:ring-ok/25',
].join(' ')

const DESHABILITADO = [
  'disabled:cursor-not-allowed disabled:border-ink-600 disabled:bg-ink-700 disabled:text-mute',
  'disabled:hover:border-ink-600 disabled:placeholder:text-mute',
].join(' ')

const SOLO_LECTURA = [
  '[&[readonly]]:border-dashed [&[readonly]]:border-interactivo [&[readonly]]:bg-transparent',
  '[&[readonly]]:hover:border-interactivo [&[readonly]]:focus:ring-0',
].join(' ')

/** Estados compartidos (color, hover, foco, inválido, deshabilitado). Sin forma ni tamaño. */
export const CAMPO_ESTADOS = `${COLOR_Y_TRANSICION} ${HOVER} ${FOCO} ${INVALIDO} ${OK} ${DESHABILITADO}`

/** Altura táctil: 44 px en mobile y 36 px desde `md`. */
export const CAMPO_ALTURA = 'h-11 md:h-9'

/** Forma de los campos de una línea (Input, Select, MoneyInput, PasswordInput). */
export const CAMPO_LINEA = `w-full rounded-lg px-3.5 ${CAMPO_ALTURA} text-base md:text-sm`

/** Clases completas por tipo de control. */
export const CLASES_CAMPO = Object.freeze({
  input: `${CAMPO_LINEA} ${CAMPO_ESTADOS} ${SOLO_LECTURA}`,
  select: `block ${CAMPO_LINEA} ${CAMPO_ESTADOS} cursor-pointer appearance-none pr-9 hover:bg-ink-700/60`,
  textarea: `w-full rounded-lg px-3.5 py-2.5 text-base md:text-sm resize-none ${CAMPO_ESTADOS} ${SOLO_LECTURA}`,
  // PIN: caja grande; comparte los estados, no la forma.
  pin: `h-full w-full rounded-2xl bg-paper text-center text-3xl font-bold tracking-[.45em] shadow-card ${CAMPO_ESTADOS} ${SOLO_LECTURA}`,
})

// Clases que describen el lugar del control en su contenedor (ancho, márgenes,
// flex/grid, posición, z-index, float, visibilidad): en el Select y en el Input
// con adornos se aplican al envoltorio que dibuja el chevron/los slots, para
// que `className="w-36"` o `absolute right-0 top-2` sigan dimensionando y
// ubicando el campo entero. Se aceptan variantes (`md:`) y el `!` de important.
// Quedan en el control las alturas (`min-h-11`, `h-*`), el relleno y el texto.
const CLASE_DE_LAYOUT = new RegExp(
  '^(?:[a-z0-9-]+:)*!?-?(?:' + [
    'm[trblxyse]?-', 'w-', 'min-w-', 'max-w-', 'flex-', 'grow', 'shrink', 'basis-', 'col-', 'row-', 'self-', 'justify-self-', 'order-',
    'top-', 'right-', 'bottom-', 'left-', 'inset-', 'z-', 'float-',
    'hidden$', 'block$', 'inline-block$', 'absolute$', 'fixed$', 'relative$', 'sticky$', 'static$', 'invisible$', 'visible$', 'sr-only$', 'not-sr-only$',
  ].join('|') + ')',
)

/**
 * Separa las clases de posición/ancho (`layout`) del resto (`control`).
 * `tieneAncho` indica si el llamador fijó un ancho propio.
 */
export function separarClasesDeLayout(className) {
  const layout = []
  const control = []
  for (const clase of String(className || '').split(/\s+/).filter(Boolean)) {
    ;(CLASE_DE_LAYOUT.test(clase) ? layout : control).push(clase)
  }
  return {
    layout: layout.join(' '),
    control: control.join(' '),
    tieneAncho: layout.some((clase) => /(?:^|:)!?w-/.test(clase)),
  }
}

/** `aria-invalid` verdadero (`true` o `"true"`); `grammar`/`spelling` no cuentan. */
export function esInvalido(valor) {
  return valor === true || valor === 'true'
}

/** Nivel del contador de caracteres: normal, aviso desde el 90 % y tope al 100 %. */
export function nivelContador(largo, max) {
  if (!(max > 0)) return 'normal'
  if (largo >= max) return 'tope'
  if (largo >= max * 0.9) return 'aviso'
  return 'normal'
}
