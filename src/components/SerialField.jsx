import { Input } from './ui.jsx'

// IMEI/serial: alfanumérico en mayúsculas, sin prefijo interno, sin espacios ni
// guiones. Portable: `normalizar` es inyectable para que la app agregue su
// lector de QR o etiquetas antes de la limpieza estándar.

// Limpieza estándar: sin espacios ni guiones, en mayúsculas. Si la app tiene
// prefijos propios (etiquetas, QR, marcas), pasa su `normalizar`.
export function normalizarSerial(value = '') {
  return String(value ?? '')
    .trim()
    .replace(/[\s-]+/g, '')
    .toUpperCase()
}

export default function SerialField({
  value = '',
  onChange,
  disabled = false,
  placeholder = 'IMEI o serial',
  normalizar = normalizarSerial,
  maxLength = 32,
  ...props
}) {
  return (
    <Input
      autoCapitalize="characters"
      autoCorrect="off"
      spellCheck={false}
      maxLength={maxLength}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
      value={normalizar(value)}
      onChange={(event) => onChange?.(normalizar(event.target.value))}
    />
  )
}
