// Clave publicable `pk_` de OwnData para la galería. Es pública por diseño:
// OwnData la acepta solo desde https://controlaria.online, con alcance RUC y
// tope diario (10 por IP y 500 por clave). Se envía en `X-API-Key`.
// VITE_OWNDATA_PUBLISHABLE_KEY (Coolify, build) la reemplaza si se define.
export const OWNDATA_API_RUC_URL = 'https://app.controlaria.online/api/v1/ruc/'
const CLAVE_GALERIA = 'pk_test_4137745e_ikZlG2jyxNNwv2qmYsNd9wSuOodSGr80'
export const OWNDATA_PUBLISHABLE_KEY = ((import.meta.env?.VITE_OWNDATA_PUBLISHABLE_KEY || '').trim() || CLAVE_GALERIA)
