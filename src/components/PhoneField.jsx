import { useState } from 'react'
import { Input } from './ui.jsx'
import { telefonoValido, MENSAJE_TELEFONO } from '../utils/telefono.js'

// Teléfono unificado: el código de país es editable (por defecto +595) y el
// número acepta espacios, guiones y paréntesis. Portable: los códigos
// sugeridos se pasan por prop y el mensaje de error es configurable.

const MAX_CODIGO = 6
const MAX_NUMERO = 30

export const CODIGOS_PAIS = ['+595', '+55', '+54', '+56', '+591', '+598', '+1', '+34', '+44', '+351']

function soloDigitos(value) {
  return String(value || '').replace(/\D/g, '').slice(0, MAX_CODIGO)
}

function soloNumero(value) {
  return String(value || '').replace(/[^\d\s()-]/g, '').slice(0, MAX_NUMERO)
}

// Separa un teléfono guardado como string único ("+595 971521111") en código
// de país y número. Sin "+" inicial se interpreta con el código por defecto.
export function parseTelefono(value, countryCodePorDefecto = '+595') {
  const texto = String(value || '').trim()
  const partes = texto.match(/^\+(\d{1,3})\s*(.*)$/)
  if (partes) return { countryCode: `+${partes[1]}`, phone: partes[2].trim() }
  return { countryCode: countryCodePorDefecto, phone: texto }
}

// Compone el string único que se guarda: "+<código> <número>". Sin número,
// devuelve null.
export function componerTelefono({ countryCode = '+595', phone = '' } = {}) {
  const numero = String(phone || '').trim().replace(/\s+/g, ' ')
  if (!numero) return null
  const codigo = String(countryCode || '').replace(/\D/g, '') || '595'
  return `+${codigo} ${numero}`
}

export default function PhoneField({
  countryCode = '+595',
  phone = '',
  onChange,
  onCountryCodeChange,
  disabled = false,
  placeholder = '981 123 456',
  countryAriaLabel = 'Código de país',
  phoneAriaLabel = 'Teléfono',
  codigos = CODIGOS_PAIS,
  mensajeInvalido = MENSAJE_TELEFONO,
  id = 'telefono-codigos',
  className,
}) {
  // El mensaje aparece recién cuando el usuario sale del campo (touched):
  // mientras escribe no lo interrumpimos.
  const [tocado, setTocado] = useState(false)
  const invalido = tocado && Boolean(String(phone).trim()) && !telefonoValido(phone, countryCode)
  return (
    <div className={className}>
      <div className="flex gap-2">
        <Input
          inputMode="numeric"
          list={id}
          disabled={disabled}
          value={`+${soloDigitos(countryCode)}`}
          onChange={(event) => onCountryCodeChange?.(`+${soloDigitos(event.target.value)}`)}
          aria-label={countryAriaLabel}
          className="w-[92px] shrink-0 text-center"
        />
        <datalist id={id}>
          {codigos.map((codigo) => <option key={codigo} value={codigo} />)}
        </datalist>
        <Input
          type="tel"
          inputMode="tel"
          maxLength={MAX_NUMERO}
          disabled={disabled}
          value={phone}
          onChange={(event) => onChange?.(soloNumero(event.target.value))}
          placeholder={placeholder}
          aria-label={phoneAriaLabel}
          onBlur={() => setTocado(true)}
          className="min-w-0 flex-1"
        />
      </div>
      {invalido && <span className="block pt-1 text-[11px] text-bad">{mensajeInvalido}</span>}
    </div>
  )
}
