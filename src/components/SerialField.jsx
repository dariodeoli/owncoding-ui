import { Input } from './ui.jsx'
import { normalizarSerial } from '../utils/serial.js'

// IMEI/serial: alfanumérico en mayúsculas, sin prefijo interno, sin espacios ni
// guiones. Portable: `normalizar` es inyectable para que la app agregue su
// lector de QR o etiquetas antes de la limpieza estándar (el normalizador
// compartido vive en `utils/serial.js`).
export { normalizarSerial }

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
