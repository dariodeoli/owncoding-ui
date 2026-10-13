// Clave publicable `pk_` de OwnData para la galería. Es pública por diseño:
// OwnData la acepta solo desde https://controlaria.online, con alcance RUC y
// tope diario. Vacía = la vista usa datos de prueba.
export const OWNDATA_API_RUC_URL = 'https://app.controlaria.online/api/v1/ruc/'
export const OWNDATA_PUBLISHABLE_KEY = (import.meta.env?.VITE_OWNDATA_PUBLISHABLE_KEY || '').trim()
