// Textos incorporados de `SelectorEspacio` y `NavLateral` (pedido OwnData, #25).
// `locale` elige el juego ('es' por defecto, 'en'); `textos` es un objeto
// parcial que se mezcla encima. Las claves con `{nombre}` / `{titulo}` se
// rellenan con `textoShell`. Un `locale` desconocido cae a español.

export const TEXTOS_SELECTOR_ESPACIO = {
  es: {
    etiqueta: 'Elegir espacio',
    ariaLabel: 'Cambiar de espacio',
    cargandoNombre: 'Cargando…',
    cargandoEspacios: 'Cargando espacios…',
    cambiando: 'Cambiando de espacio…',
    errorCarga: 'No se pudieron cargar los espacios.',
    reintentar: 'Reintentar',
    sinEspacios: 'Todavía no hay espacios.',
    acciones: 'Acciones del espacio',
  },
  en: {
    etiqueta: 'Choose workspace',
    ariaLabel: 'Switch workspace',
    cargandoNombre: 'Loading…',
    cargandoEspacios: 'Loading workspaces…',
    cambiando: 'Switching workspace…',
    errorCarga: 'Workspaces could not be loaded.',
    reintentar: 'Retry',
    sinEspacios: 'No workspaces yet.',
    acciones: 'Workspace actions',
  },
}

export const TEXTOS_NAV_LATERAL = {
  es: {
    ariaLabel: 'Navegación principal',
    expandir: 'Expandir menú',
    contraer: 'Contraer menú',
    mostrarGrupo: 'Mostrar {titulo}',
    ocultarGrupo: 'Ocultar {titulo}',
  },
  en: {
    ariaLabel: 'Main navigation',
    expandir: 'Expand menu',
    contraer: 'Collapse menu',
    mostrarGrupo: 'Show {titulo}',
    ocultarGrupo: 'Hide {titulo}',
  },
}

/** Mezcla: juego del `locale` → `textos` de la app (solo claves con valor). */
export function resolverTextosShell(juegos, locale = 'es', textos) {
  const base = juegos[locale] || juegos.es
  const extra = {}
  for (const [clave, valor] of Object.entries(textos || {})) if (valor != null) extra[clave] = valor
  return { ...base, ...extra }
}

/** Rellena `{variable}` en un texto con los valores dados. */
export function textoShell(plantilla, valores = {}) {
  return String(plantilla).replace(/\{(\w+)\}/g, (completo, clave) => (valores[clave] != null ? String(valores[clave]) : completo))
}
