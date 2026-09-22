import { useId, useState } from 'react'
import BotonDentroCampo from './BotonDentroCampo.jsx'
import { FormField, Input } from './ui.jsx'
import { cn } from '../utils/cn.js'
import {
  limpiarTaxId,
  MENSAJE_RUC,
  MENSAJE_RUC_CONSULTA,
  MENSAJE_RUC_SIN_DATOS,
  normalizeTaxId,
  taxIdValidoParaPais,
} from '../utils/taxId.js'

// RUC / identificación fiscal (portado de PagaYa). Paraguay: 5 a 8 dígitos con
// o sin dígito verificador; el resto de los países usa el patrón genérico.
//
// Portable: la librería no consulta nada. Si la app pasa
// `onBuscarRazonSocial(taxId)` —una función async que devuelve la razón social
// o null—, el campo muestra el resultado y ofrece aplicarlo con
// `onAplicarRazonSocial`. Sin ese callback queda como un campo validado más.
export default function TaxIdField({
  label = 'RUC / identificación fiscal',
  value = '',
  onChange,
  pais = 'PY',
  onBuscarRazonSocial,
  onAplicarRazonSocial,
  etiquetaConsulta = 'Consultar RUC',
  mensajeInvalido = MENSAJE_RUC,
  mensajeSinDatos = MENSAJE_RUC_SIN_DATOS,
  mensajeError = MENSAJE_RUC_CONSULTA,
  hint,
  error,
  required = false,
  disabled = false,
  maxLength = 32,
  id,
  name,
  className,
  ...props
}) {
  const generado = useId()
  const inputId = id || generado
  const descripcionId = `${inputId}-descripcion`
  const [tocado, setTocado] = useState(false)
  const [consulta, setConsulta] = useState({ estado: 'inicial' })
  const esRucPy = String(pais).trim().toUpperCase() === 'PY'
  const normalizado = normalizeTaxId(value)
  const invalido = normalizado !== null && !taxIdValidoParaPais(normalizado, pais)
  const errorVisible = error ?? (tocado && invalido ? mensajeInvalido : null)
  const consultando = consulta.estado === 'consultando'
  const consultable = Boolean(normalizado) && !invalido

  async function consultar() {
    const taxId = normalizeTaxId(value)
    if (!taxId || !taxIdValidoParaPais(taxId, pais)) {
      setConsulta({ estado: 'error', mensaje: mensajeInvalido })
      return
    }
    setConsulta({ estado: 'consultando' })
    try {
      const razonSocial = await onBuscarRazonSocial(taxId)
      const texto = typeof razonSocial === 'string' ? razonSocial.trim() : ''
      if (!texto) {
        setConsulta({ estado: 'error', mensaje: mensajeSinDatos })
        return
      }
      setConsulta({ estado: 'encontrada', razonSocial: texto })
    } catch {
      setConsulta({ estado: 'error', mensaje: mensajeError })
    }
  }

  function aplicar() {
    onAplicarRazonSocial?.(consulta.razonSocial)
    setConsulta({ estado: 'inicial' })
  }

  return (
    <FormField label={label} hint={hint} error={errorVisible} htmlFor={inputId} descripcionId={descripcionId}>
      <div className="relative">
        <Input
          id={inputId}
          name={name}
          value={value}
          disabled={disabled}
          required={required}
          inputMode={esRucPy ? 'numeric' : 'text'}
          autoComplete="off"
          spellCheck={false}
          placeholder={esRucPy ? '80012345-6' : ''}
          onBlur={() => setTocado(true)}
          aria-invalid={errorVisible ? true : undefined}
          aria-describedby={errorVisible || hint ? descripcionId : undefined}
          onChange={(event) => {
            setConsulta({ estado: 'inicial' })
            onChange?.(limpiarTaxId(event.target.value, maxLength))
          }}
          className={cn(onBuscarRazonSocial && (consultando ? 'pr-32' : 'pr-11'), className)}
          {...props}
        />
        {onBuscarRazonSocial ? (
          <BotonDentroCampo
            etiqueta={etiquetaConsulta}
            titulo={etiquetaConsulta}
            ocupado={consultando}
            disabled={disabled || !consultable}
            onClick={() => void consultar()}
          />
        ) : null}
      </div>
      {consulta.estado === 'encontrada' ? (
        <div role="status" className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-600 bg-ink-800/60 px-3 py-2 text-xs">
          <span className="text-mute">
            Razón social: <b className="font-semibold text-fore">{consulta.razonSocial}</b>
          </span>
          {onAplicarRazonSocial ? (
            <button
              type="button"
              onClick={aplicar}
              className="rounded-md px-2 py-1 text-xs font-semibold text-fono-light transition hover:bg-fono/10"
            >
              Usar razón social
            </button>
          ) : null}
        </div>
      ) : null}
      {consulta.estado === 'error' ? (
        <p role="alert" className="mt-1.5 text-xs text-bad">{consulta.mensaje}</p>
      ) : null}
    </FormField>
  )
}
