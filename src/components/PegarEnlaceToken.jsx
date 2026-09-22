import { useState } from 'react'
import { Aviso, Button, Input, Label } from './ui.jsx'
import { extractTokenFromUrl } from '../utils/token.js'

// Cuando el enlace del correo llega incompleto (relays, redirecciones), el
// usuario pega el enlace completo y el token se extrae solo. Portable: no
// valida contra ninguna API, solo entrega el token a la app.

export default function PegarEnlaceToken({
  onToken,
  etiqueta = 'Pegá tu enlace completo',
  textoBoton = 'Usar este enlace',
  errorMensaje = 'No encontramos el código en ese enlace. Pegá el enlace completo de tu correo.',
  id = 'pegar-enlace',
  className,
}) {
  const [enlace, setEnlace] = useState('')
  const [error, setError] = useState('')

  function aplicar(event) {
    event.preventDefault()
    setError('')
    const token = extractTokenFromUrl(enlace)
    if (!token) return setError(errorMensaje)
    onToken?.(token)
  }

  return (
    <form onSubmit={aplicar} className={className ?? 'space-y-3 rounded-xl border border-fono/25 bg-fono/5 p-4'}>
      <div>
        <Label htmlFor={id}>{etiqueta}</Label>
        <Input
          id={id}
          value={enlace}
          onChange={(event) => { setEnlace(event.target.value); setError('') }}
          placeholder="https://…"
          autoComplete="off"
          className="mt-1.5"
        />
      </div>
      {error && <Aviso tono="error">{error}</Aviso>}
      <Button type="submit" disabled={!enlace.trim()}>{textoBoton}</Button>
    </form>
  )
}
