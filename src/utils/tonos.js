// Tonos semánticos compartidos: un solo mapa de clases por uso (punto, chip,
// texto). Los objetos que muestran estados (checklist de equipos, tablero,
// cronología, plan de pagos) leen de acá para que un mismo tono se dibuje
// igual en toda la app y en cualquier tema.
//
// Claves canónicas: `ok`, `warn`, `bad`, `mute`, `info` y `pass`. Los alias que
// usan algunas apps (`neutral`, `accent`, `danger`, `success`, `warning`) se
// normalizan con `tonoCanonico`, así el consumidor no tiene que traducirlos.

export const TONOS = {
  // El texto va por la familia `*-text` (#5): el tono base queda para el
  // relleno/punto/borde y el par de texto sostiene AA sobre el tinte.
  punto: {
    ok: 'bg-ok/15 text-ok-text',
    warn: 'bg-warn/15 text-warn-text',
    bad: 'bg-bad/15 text-bad-text',
    mute: 'bg-ink-700 text-mute',
    info: 'bg-info/15 text-info-text',
    pass: 'bg-pass/15 text-pass-text',
    fono: 'bg-fono/15 text-fono-text',
  },
  chip: {
    ok: 'border-ok/30 bg-ok/10 text-ok-text',
    warn: 'border-warn/30 bg-warn/10 text-warn-text',
    bad: 'border-bad/30 bg-bad/10 text-bad-text',
    mute: 'border-ink-600 bg-ink-800/40 text-mute',
    info: 'border-info/30 bg-info/10 text-info-text',
    pass: 'border-pass/30 bg-pass/10 text-pass-text',
    fono: 'border-fono/30 bg-fono/10 text-fono-text',
  },
  texto: {
    ok: 'text-ok-text',
    warn: 'text-warn-text',
    bad: 'text-bad-text',
    mute: 'text-mute',
    info: 'text-info-text',
    pass: 'text-pass-text',
    fono: 'text-fono-light',
  },
}

/** Alias de otras apps → clave canónica de `TONOS`. */
export const TONOS_ALIAS = {
  neutral: 'mute',
  neutro: 'mute',
  accent: 'info',
  acento: 'info',
  danger: 'bad',
  error: 'bad',
  success: 'ok',
  warning: 'warn',
}

/** Clave canónica del tono; un valor desconocido cae en `mute` (nunca inventa color). */
export function tonoCanonico(valor) {
  const clave = String(valor ?? '').trim().toLowerCase()
  if (!clave) return 'mute'
  const canonico = TONOS_ALIAS[clave] || clave
  return TONOS.punto[canonico] ? canonico : 'mute'
}

/** Clases del punto de estado (fondo suave + ícono del mismo color). */
export function puntoDeTono(valor) {
  return TONOS.punto[tonoCanonico(valor)]
}

/** Clases del chip (borde + fondo + texto). */
export function chipDeTono(valor) {
  return TONOS.chip[tonoCanonico(valor)]
}

/** Clase de texto del tono. */
export function textoDeTono(valor) {
  return TONOS.texto[tonoCanonico(valor)]
}
