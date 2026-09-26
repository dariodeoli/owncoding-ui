import { useMemo, useState } from 'react'
import { Textarea } from './ui.jsx'
import { imeiValido, normalizarSeriales } from '../utils/serial.js'
import { cn } from '../utils/cn.js'

// Campo de seriales/IMEI por lote (pegar o escanear varios): el texto se
// normaliza al vuelo y la pantalla recibe **solo los válidos únicos** por
// `onCambio`, con los conteos de repetidos e inválidos a la vista. Para IMEI,
// la app pasa `validar={imeiValido}` (Luhn); sin `validar` no hay inválidos.
//
//   <CampoSeriales etiqueta="IMEI" validar={imeiValido} onCambio={setSeriales} />
export default function CampoSeriales({
  valor,
  onCambio,
  validar,
  limite = 9999,
  maxLargo = 32,
  etiqueta = 'Seriales / IMEI',
  placeholder = 'Pegá o escaneá los seriales (uno por línea)',
  ayuda,
  disabled = false,
  className,
}) {
  const [texto, setTexto] = useState(() => (Array.isArray(valor) ? valor.join('\n') : (valor || '')))
  const resultado = useMemo(() => normalizarSeriales(texto, { validar, limite, maxLargo }), [texto, validar, limite, maxLargo])

  function cambiar(siguiente) {
    setTexto(siguiente)
    const limpio = normalizarSeriales(siguiente, { validar, limite, maxLargo })
    onCambio?.(limpio.seriales, limpio)
  }

  const hay = resultado.seriales.length > 0
  return (
    <div className={cn('space-y-2', className)}>
      {etiqueta ? <span className="block text-xs font-semibold text-mute">{etiqueta}</span> : null}
      <Textarea
        rows={4}
        value={texto}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => cambiar(event.target.value)}
        spellCheck={false}
        autoCapitalize="characters"
      />
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" role="status">
        <span className={hay ? 'font-semibold text-ok-text' : 'text-mute'}>{resultado.seriales.length} listo(s) para cargar</span>
        {resultado.repetidos.length > 0 && <span className="text-warn-text">{resultado.repetidos.length} repetido(s)</span>}
        {resultado.invalidos.length > 0 && <span className="text-bad-text">{resultado.invalidos.length} inválido(s)</span>}
      </p>
      {resultado.invalidos.length > 0 && (
        <p className="break-words text-[11px] text-mute" title={resultado.invalidos.join(' · ')}>Revisá: {resultado.invalidos.slice(0, 5).join(' · ')}{resultado.invalidos.length > 5 ? ' …' : ''}</p>
      )}
      {ayuda ? <p className="text-[11px] text-mute">{ayuda}</p> : null}
    </div>
  )
}

// Reexporta el validador de IMEI para que la app no tenga que importar el utils
// por separado cuando usa este campo.
export { imeiValido }
