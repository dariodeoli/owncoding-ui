// Tamaños recomendados de los campos según el dato: un monto, un porcentaje o
// una cantidad no tienen por qué ocupar todo el ancho. La app los pasa como
// className (o usa el default del objeto); el mínimo evita que el número se
// corte y el máximo evita que el campo se estire de más.

export const TAMANOS_CAMPO = Object.freeze({
  // Anchos recomendados (Tailwind) por tipo de dato
  moneda: 'w-36', // Gs 12.500.000
  monedaAmplia: 'w-44', // montos de venta (hasta 99.000.000.000)
  porcentaje: 'w-24', // 12,5
  cantidad: 'w-20', // 999
  anio: 'w-20',
  dias: 'w-24',
  fecha: 'w-40', // 17/09/2026
  fechaHora: 'w-52',
  telefono: 'w-44',
  codigoPostal: 'w-28',
  ip: 'w-40',
  puerto: 'w-24',
  documento: 'w-44', // RUC/CI
  ciudad: 'w-56',
})

// Ancho sugerido para el texto que se va a escribir (mínimo y máximo en
// caracteres) y la clase correspondiente: útil para campos libres.
export function anchoParaLargo(largoMin = 0, largoMax = 0) {
  if (largoMax <= 12) return 'w-28'
  if (largoMax <= 24) return 'w-40'
  if (largoMax <= 40) return 'w-56'
  return 'w-full'
}
