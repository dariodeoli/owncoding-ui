// Metadatos ópticos de los assets financieros. Viven junto a los assets (entrada
// `owncoding-ui/financial`) y no en el catálogo puro para no inflar los bundles
// de metadata ni de utils.
//
// Cada entrada se midió una sola vez rasterizando el archivo oficial y tomando
// el rectángulo de píxeles con alpha > 25 ("tinta"). Los archivos no se
// modifican: el componente solo recorta y escala la vista.
//   clave empaquetada -> [anchoNatural, altoNatural, x0, y0, x1, y1, fondo?]
// con x/y en fracciones 0..1 del archivo, con 0,4 % de margen de seguridad.
// Los archivos opacos con fondo blanco se recortan igual y llevan un 7.º
// elemento (BLANCO): la caja conserva el blanco del archivo para que el recorte
// no deje la marca sobre el fondo del slot. Los ya ajustados quedan 0,0,1,1.
// Para regenerar: rasterizar cada archivo a 1000 px, tomar el bbox alpha > 25,
// ampliarlo 0,4 % y dejar 0,0,1,1 si el archivo es opaco o ya está ajustado.
const BLANCO = '#ffffff'

export const OPTICA_ASSETS_FINANCIEROS = Object.freeze({
  'bancos/atlas-compacto.png': [512, 512, 0.036, 0, 0.964, 1],
  'bancos/atlas-horizontal-blanco.svg': [192, 53, 0, 0, 1, 1],
  'bancos/bancop-compacto.png': [180, 180, 0.1, 0.06, 0.909, 0.95, BLANCO],
  'bancos/bancop-horizontal.png': [432, 125, 0.038, 0.0514, 0.962, 0.9452],
  'bancos/basa-compacto.svg': [179, 150, 0, 0, 1, 1],
  'bancos/basa-horizontal.svg': [300, 39, 0, 0, 1, 1],
  'bancos/bna-compacto.svg': [110, 110, 0.201, 0.152, 0.926, 0.877],
  'bancos/bna-horizontal.svg': [300, 66, 0.041, 0.1505, 0.85, 0.8813],
  'bancos/bnf-compacto.png': [260, 280, 0.0412, 0.08, 0.9448, 0.998],
  'bancos/bnf-horizontal.svg': [131, 43, 0, 0, 1, 1],
  'bancos/capiata-horizontal.png': [1152, 494, 0, 0, 1, 1],
  'bancos/citi-horizontal.svg': [204, 118, 0, 0, 1, 1],
  'bancos/continental-compacto.png': [156, 153, 0, 0, 1, 1],
  'bancos/continental-horizontal.svg': [201, 40, 0, 0, 1, 1],
  'bancos/coodene-horizontal.png': [443, 95, 0, 0, 1, 1],
  'bancos/coomecipar-compacto.png': [256, 255, 0, 0, 1, 1],
  'bancos/coomecipar-horizontal.png': [562, 118, 0, 0.0103, 0.984, 0.9564],
  'bancos/coopeduc-horizontal.png': [738, 335, 0, 0, 1, 1],
  'bancos/familiar-compacto.png': [256, 256, 0, 0, 1, 1],
  'bancos/familiar-horizontal.webp': [352, 114, 0.035, 0.1071, 0.963, 0.8744],
  'bancos/fic-compacto.png': [192, 192, 0, 0.153, 1, 0.849],
  'bancos/fic-horizontal.png': [512, 337, 0.058, 0.0872, 0.942, 0.9128],
  'bancos/finlatina-compacto.png': [108, 108, 0, 0, 1, 1],
  'bancos/finlatina-horizontal.png': [1123, 302, 0, 0.0889, 1, 0.8962],
  'bancos/fpj-compacto.png': [542, 293, 0.113, 0.0015, 0.962, 0.9892],
  'bancos/fpj-horizontal.png': [1276, 293, 0.046, 0.0003, 0.971, 0.9866],
  'bancos/gnb-compacto.png': [920, 920, 0.294, 0.221, 0.706, 0.779, BLANCO],
  'bancos/gnb-horizontal.svg': [300, 62, 0, 0.0346, 0.982, 0.9654],
  'bancos/interfisa-compacto.png': [256, 256, 0, 0, 1, 1],
  'bancos/interfisa-horizontal.png': [320, 185, 0.093, 0.156, 0.91, 0.831, BLANCO],
  'bancos/itau-compacto.svg': [340, 340, 0, 0, 1, 1],
  'bancos/lambare-horizontal.gif': [121, 122, 0, 0, 1, 1],
  'bancos/luque-horizontal.svg': [241, 150, 0.151, 0.2452, 0.847, 0.7548],
  'bancos/mburicao-horizontal.png': [185, 77, 0.037, 0.0032, 0.961, 0.9391],
  'bancos/medalla-compacto.webp': [512, 512, 0.081, 0.007, 0.919, 0.993],
  'bancos/medalla-horizontal.png': [300, 58, 0.019, 0.1307, 0.979, 0.89],
  'bancos/mercado-n4-horizontal.png': [80, 80, 0, 0, 1, 1],
  'bancos/nemby-compacto.png': [207, 202, 0.01, 0.0185, 0.982, 0.9856],
  'bancos/nemby-horizontal.png': [661, 661, 0.041, 0.082, 0.954, 0.902],
  'bancos/san-cristobal-compacto.png': [512, 512, 0.094, 0.099, 0.906, 0.921],
  'bancos/san-cristobal-horizontal.png': [370, 64, 0, 0.0307, 1, 0.7728],
  'bancos/san-lorenzo-compacto.png': [192, 192, 0, 0, 1, 1],
  'bancos/solar-compacto.png': [512, 276, 0.022, 0.0424, 0.979, 0.9576],
  'bancos/solar-horizontal.svg': [867, 156, 0, 0, 1, 1],
  'bancos/sudameris-compacto.svg': [36, 36, 0.157, 0.019, 0.842, 0.978],
  'bancos/sudameris-horizontal.svg': [253, 36, 0, 0.0171, 1, 0.9829],
  'bancos/tu-financiera-compacto.svg': [51, 64, 0, 0, 1, 1],
  'bancos/ueno-compacto.svg': [40, 40, 0, 0, 1, 1],
  'bancos/ueno-horizontal.svg': [184, 28, 0, 0, 1, 1],
  'bancos/universitaria-compacto.png': [180, 180, 0.05, 0.112, 0.955, 0.895, BLANCO],
  'bancos/universitaria-horizontal.svg': [208, 46, 0, 0, 1, 1],
  'bancos/zeta-compacto.png': [192, 192, 0, 0, 1, 1],
  'bancos/zeta-horizontal.png': [778, 207, 0.034, 0.1389, 0.966, 0.8611],
  'pagos/amex-compacto.svg': [45, 45, 0, 0, 1, 1],
  'pagos/amex-horizontal.svg': [100, 28, 0, 0, 1, 1],
  'pagos/bancard-compacto.png': [512, 512, 0, 0, 1, 1],
  'pagos/bancard-horizontal.png': [192, 60, 0, 0, 1, 1],
  'pagos/cabal-horizontal.png': [546, 186, 0, 0, 1, 1],
  'pagos/dinelco-compacto.png': [180, 180, 0.051, 0.198, 0.943, 0.794, BLANCO],
  'pagos/dinelco-horizontal.svg': [832, 218, 0, 0, 0.994, 0.962],
  'pagos/eclub-compacto.svg': [150, 150, 0, 0, 1, 1],
  'pagos/eclub-horizontal.svg': [300, 76, 0.017, 0.0711, 0.984, 0.9329],
  'pagos/eko-compacto.svg': [80, 69, 0, 0, 1, 1],
  'pagos/eko-horizontal.svg': [100, 33, 0, 0, 1, 1],
  'pagos/infonet-marca.png': [365, 235, 0, 0, 1, 1],
  'pagos/mango-compacto.png': [534, 534, 0.072, 0.009, 0.929, 0.991],
  'pagos/mango-horizontal.svg': [180, 45, 0.005, 0.032, 0.995, 0.96],
  'pagos/mastercard-marca.svg': [243, 150, 0, 0, 1, 1],
  'pagos/pagopar-horizontal.svg': [114, 28, 0, 0, 1, 1],
  'pagos/panal-marca.png': [269, 269, 0, 0, 1, 1],
  'pagos/paypro-horizontal.png': [798, 686, 0.273, 0.1832, 0.726, 0.8714],
  'pagos/personal-pay-compacto.png': [192, 192, 0, 0, 1, 1],
  'pagos/personal-pay-horizontal.svg': [300, 60, 0.036, 0.101, 0.964, 0.899],
  'pagos/pik-compacto.png': [180, 180, 0.05, 0.273, 0.95, 0.733, BLANCO],
  'pagos/pik-horizontal.svg': [83, 40, 0, 0, 1, 1],
  'pagos/pix-compacto.svg': [172, 172, 0.011, 0.011, 0.989, 0.989],
  'pagos/pix-horizontal.svg': [503, 180, 0, 0, 1, 1],
  'pagos/procard-compacto.png': [16, 16, 0, 0, 1, 1],
  'pagos/procard-horizontal.png': [140, 50, 0, 0.1277, 1, 0.9116],
  'pagos/upay-compacto.svg': [64, 64, 0, 0, 1, 1],
  'pagos/upay-horizontal.svg': [91, 32, 0, 0, 1, 1],
  'pagos/vaquita-compacto.png': [2251, 2250, 0, 0, 1, 1],
  'pagos/vaquita-horizontal.png': [4001, 1209, 0.011, 0.0589, 0.989, 0.9411],
  'pagos/visa-marca.png': [208, 68, 0, 0, 1, 1],
  'pagos/wally-compacto.ico': [48, 48, 0, 0, 1, 1],
  'pagos/wally-horizontal.svg': [128, 45, 0, 0, 1, 1],
  'pagos/zimple-compacto.ico': [64, 64, 0, 0, 1, 1],
  'pagos/zimple-horizontal.png': [127, 127, 0, 0, 1, 1],
})

// Slots de referencia (alto = 1). El compacto es cuadrado; el horizontal es el
// de la galería (9rem x 3.25rem). `area` es el área de tinta objetivo en
// unidades de alto². Todo logo con tinta mayor se reduce hasta ese área, de modo
// que las marcas cuadradas y los wordmarks pesan lo mismo; los wordmarks muy
// anchos (por encima del área objetivo ya a ancho completo) no se agrandan.
export const REFERENCIA_OPTICA = Object.freeze({
  compacto: Object.freeze({ ancho: 1, area: 0.41 }),
  horizontal: Object.freeze({ ancho: 144 / 52, area: 0.95 }),
})

// Tope cuando el logo va sobre placa de color (`fondo`): deja aire visible.
export const ESCALA_MAXIMA_CON_PLACA = 0.94
export const ESCALA_MINIMA = 0.55

// Marcas cuyo único asset oficial compacto trae texto diminuto: se muestran a
// slot completo en vez de reducirse al área común.
const ESCALA_FIJA = Object.freeze({ 'pagos/bancard-compacto.png': 1 })

const redondear = (n) => Math.round(n * 1000) / 1000

// Relación ancho/alto del rectángulo de tinta.
export function relacionDeTinta([nw, nh, x0, y0, x1, y1]) {
  return ((x1 - x0) * nw) / ((y1 - y0) * nh)
}

// Metadato óptico de un asset para una variante. Se calcula una sola vez al
// armar el catálogo; no mide nada en runtime.
export function opticaDeAsset(clave, variante = 'horizontal', { placa = false } = {}) {
  const fila = Object.hasOwn(OPTICA_ASSETS_FINANCIEROS, clave) ? OPTICA_ASSETS_FINANCIEROS[clave] : null
  if (!fila) return null
  const ref = REFERENCIA_OPTICA[variante === 'compacto' ? 'compacto' : 'horizontal']
  const relacion = relacionDeTinta(fila)
  const ancho = Math.min(ref.ancho, relacion)
  const area = ancho * (ancho / relacion)
  let escala = Math.min(1, Math.sqrt(ref.area / area))
  if (Object.hasOwn(ESCALA_FIJA, clave) && variante === 'compacto') escala = ESCALA_FIJA[clave]
  else if (placa) escala = Math.min(escala, ESCALA_MAXIMA_CON_PLACA)
  escala = redondear(Math.max(ESCALA_MINIMA, escala))
  const [, , x0, y0, x1, y1] = fila
  return Object.freeze({
    aspecto: redondear(fila[0] / fila[1]),
    tinta: Object.freeze([x0, y0, x1, y1]),
    relacion: redondear(relacion),
    escala,
    // Alto de la caja de tinta como fracción del alto del slot: el ajuste
    // "contain" en el slot de referencia multiplicado por la escala.
    altura: redondear(escala * Math.min(1, ref.ancho / relacion)),
    placa: Boolean(placa),
    ...(fila[6] ? { fondo: fila[6] } : {}),
  })
}

// Caja de tinta resultante dentro de un slot (px). El alto lo fija la escala y
// el ancho se recorta al disponible; nunca excede el slot.
export function cajaOptica(optica, { ancho, alto, rellenoX = 0 }) {
  const disponible = Math.max(0, ancho - 2 * rellenoX)
  let h = alto * optica.altura
  let w = h * optica.relacion
  if (w > disponible) {
    w = disponible
    h = w / optica.relacion
  }
  return { ancho: w, alto: h }
}
