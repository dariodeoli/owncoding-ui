import { useEffect, useRef, useState } from 'react'
import { useFormulariosPro } from '../components/FormulariosPro.jsx'

const DURACION_MS = 320

function movimientoReducido() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Solo con el interruptor `FormulariosPro` (segunda ola); sin él no hay sacudida.
// Sacudida única al pasar de válido a inválido (no en el primer render ni en
// cada render inválido). Devuelve `true` durante la animación para que el
// control marque `data-oc-sacude`; el movimiento lo pone base.css y se apaga
// con `prefers-reduced-motion` o `motion={false}`. Nunca retrasa foco ni eventos.
export default function useSacudida(invalido, motion = true) {
  const pro = useFormulariosPro()
  const previo = useRef(Boolean(invalido))
  const [activa, setActiva] = useState(false)
  useEffect(() => {
    const antes = previo.current
    previo.current = Boolean(invalido)
    if (!invalido) setActiva(false)
    if (!invalido || antes || !motion || !pro || movimientoReducido()) return undefined
    setActiva(true)
    const timer = setTimeout(() => setActiva(false), DURACION_MS)
    return () => clearTimeout(timer)
  }, [invalido, motion, pro])
  return activa
}
