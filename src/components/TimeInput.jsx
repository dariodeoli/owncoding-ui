import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Input } from './ui.jsx'
import { cn } from '../utils/cn.js'

// Sin fechas ni zona horaria: el contrato es una hora local de 24 horas.
function normalizar(texto) {
  const limpio = String(texto ?? '').trim()
  if (!limpio) return ''
  const partes = /^(\d{1,2})(?::?(\d{2}))?$/.exec(limpio)
  if (!partes) return null
  const hora = Number(partes[1]), minuto = Number(partes[2] || 0)
  return hora < 24 && minuto < 60 ? `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}` : null
}
const minutos = (valor) => Number(valor.slice(0, 2)) * 60 + Number(valor.slice(3))
const desdeMinutos = (valor) => `${String(Math.floor(valor / 60)).padStart(2, '0')}:${String(valor % 60).padStart(2, '0')}`

const useEfectoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** Hora manual opt-in. Los límites y el incremento los define la aplicación. */
const TimeInput = forwardRef(function TimeInput(propiedades, ref) {
  const {
  value, defaultValue = '', onValueChange, stepMinutes = 1, min, max,
  name, form, required = false, disabled = false, readOnly = false,
  onChange, onBlur, onKeyDown, className, ...props
} = propiedades
  const controlado = Object.prototype.hasOwnProperty.call(propiedades, 'value')
  const [interno, setInterno] = useState(defaultValue)
  const actual = controlado ? value : interno
  const [texto, setTexto] = useState(String(actual ?? ''))
  const [mostrarError, setMostrarError] = useState(false)
  const inputRef = useRef(null)
  const errorId = useId()
  const paso = Number.isInteger(stepMinutes) && stepMinutes > 0 && stepMinutes <= 1440 ? stepMinutes : 1
  const minimo = /^\d{2}:\d{2}$/.test(min || '') ? normalizar(min) : null
  const maximo = /^\d{2}:\d{2}$/.test(max || '') ? normalizar(max) : null
  const validar = (borrador) => {
    const hora = normalizar(borrador)
    if (hora === null) return 'Ingresá una hora válida (HH:mm).'
    if (!hora) return required ? 'Ingresá una hora.' : ''
    if ((minimo && hora < minimo) || (maximo && hora > maximo)) return 'La hora está fuera del rango permitido.'
    return ''
  }
  const error = validar(texto)
  const mensaje = mostrarError ? error : ''
  const valorFormulario = !error ? normalizar(actual) ?? '' : ''
  const ultimo = useRef(null)
  const asignarRef = useCallback((nodo) => {
    inputRef.current = nodo
    if (typeof ref === 'function') ref(nodo)
    else if (ref) ref.current = nodo
  }, [ref])

  useEffect(() => { setTexto(String(actual ?? '')); setMostrarError(false) }, [actual])
  useEfectoLayout(() => { inputRef.current?.setCustomValidity(disabled || readOnly ? '' : error) }, [error, disabled, readOnly])

  const aplicar = (hora) => {
    if (!controlado) setInterno(hora)
    setTexto(controlado ? String(actual ?? '') : hora)
    setMostrarError(false)
    if (hora !== String(actual ?? '')) onValueChange?.(hora)
  }
  const confirmar = () => {
    if (disabled || readOnly) return true
    const borrador = inputRef.current?.value ?? texto
    if (validar(borrador)) { setMostrarError(true); return false }
    aplicar(normalizar(borrador))
    return true
  }
  // Se actualiza tras cada render: el guard no captura un borrador antiguo.
  ultimo.current = { confirmar, error, disabled, readOnly }
  useEffect(() => {
    const input = inputRef.current
    const formulario = input?.form
    if (!formulario) return
    const ventana = formulario.ownerDocument.defaultView
    const enviar = (evento) => {
      if (evento.target !== formulario) return
      const estado = ultimo.current
      if (estado.disabled || estado.readOnly) return
      let valido
      // También cubre requestSubmit/noValidate: el submit de React ve el valor
      // confirmado, y jamás el valor anterior detrás de un borrador inválido.
      flushSync(() => { valido = estado.confirmar() })
      if (!valido) {
        evento.preventDefault()
        evento.stopImmediatePropagation()
        input.focus()
        input.reportValidity()
      }
    }
    let activo = true
    const reiniciar = (evento) => {
      // El onReset delegado de React puede cancelar después del listener nativo.
      queueMicrotask(() => {
        if (!activo || controlado || evento.defaultPrevented) return
        setInterno(defaultValue)
        setTexto(String(defaultValue))
        setMostrarError(false)
      })
    }
    // Window precede al listener delegado del root de React: también protege
    // onSubmitCapture antes de que el consumidor lea o persista el valor.
    ventana.addEventListener('submit', enviar, true)
    formulario.addEventListener('reset', reiniciar)
    return () => {
      activo = false
      ventana.removeEventListener('submit', enviar, true)
      formulario.removeEventListener('reset', reiniciar)
    }
  }, [form, controlado, defaultValue])

  return <>
    <Input
      {...props} ref={asignarRef} form={form} type="text" inputMode="numeric"
      required={required} disabled={disabled} readOnly={readOnly}
      placeholder={props.placeholder ?? 'HH:mm'} value={texto}
      className={cn('tabular-nums', className)}
      aria-invalid={!!mensaje || props['aria-invalid'] || undefined}
      aria-describedby={[props['aria-describedby'], mensaje && errorId].filter(Boolean).join(' ') || undefined}
      onChange={(evento) => {
        setTexto(evento.target.value)
        evento.target.setCustomValidity(validar(evento.target.value))
        onChange?.(evento)
      }}
      onBlur={(evento) => { confirmar(); onBlur?.(evento) }}
      onInvalid={(evento) => { setMostrarError(true); props.onInvalid?.(evento) }}
      onKeyDown={(evento) => {
        onKeyDown?.(evento)
        if (evento.defaultPrevented || disabled || readOnly) return
        if (evento.key === 'Enter') {
          if (!confirmar()) evento.preventDefault()
        } else if (evento.key === 'ArrowUp' || evento.key === 'ArrowDown') {
          evento.preventDefault()
          const base = normalizar(texto)
          if (base === null || (base && validar(base))) { setMostrarError(true); return }
          const inicio = base ? minutos(base) : minutos(minimo || '00:00')
          const total = base ? inicio + (evento.key === 'ArrowUp' ? paso : -paso) : inicio
          const siguiente = desdeMinutos(Math.max(minimo ? minutos(minimo) : 0, Math.min(maximo ? minutos(maximo) : 1439, total)))
          aplicar(siguiente)
        }
      }}
    />
    {name ? <input type="hidden" name={name} form={form} value={valorFormulario} disabled={disabled} /> : null}
    {mensaje ? <p id={errorId} role="alert" className="mt-1 text-xs text-bad-text">{mensaje}</p> : null}
  </>
})
export default TimeInput
