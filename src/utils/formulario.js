// Piezas de formulario compartidas: grillas de campos y pie de acciones. Se
// escriben una sola vez acá; las pantallas no repiten las clases (mismo
// criterio que `tabla.js`).

// Grilla de campos en dos columnas (formularios y diálogos).
export const GRILLA_DOS_COLUMNAS = 'grid gap-3 sm:grid-cols-2'

// Variante compacta (diálogos con poco alto).
export const GRILLA_DOS_COLUMNAS_COMPACTA = 'grid gap-2 sm:grid-cols-2'

// Pie de acciones de un formulario o diálogo: acciones alineadas a la derecha.
export const PIE_ACCIONES = 'flex flex-wrap justify-end gap-2'

// Pie con el primario primero en móvil (acciones apiladas al revés).
export const PIE_ACCIONES_REVERSO = 'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'
