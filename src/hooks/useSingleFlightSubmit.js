import { useCallback, useRef, useState } from 'react'
import { crearEnvioUnico } from '../utils/guardado.js'

// Envío a prueba de doble submit (cosecha de ScaleOS, #2): el bloqueo empieza
// antes de la validación asíncrona —no cuando arranca la red— y el `pendiente`
// pertenece al envío original. Un segundo submit mientras corre se ignora: no
// libera el estado de un envío ajeno.
//
//   const { pendiente, onSubmit } = useSingleFlightSubmit(async (evento) => {
//     evento?.preventDefault?.()
//     if (!(await validar())) return
//     await guardar()
//   })
//   <form onSubmit={onSubmit}>…</form>
//
// Para el cierre del diálogo, el formulario registra su bloqueo con
// `useDialogPending(pendiente)` (o usa `SaveActions`); al terminar de persistir
// llama a `completeSave(cerrar, refrescar, { avisar })`.
export function useSingleFlightSubmit(enviar) {
  const [pendiente, setPendiente] = useState(false)
  const ultimoEnviar = useRef(enviar)
  ultimoEnviar.current = enviar
  const envio = useRef(null)
  if (!envio.current) {
    envio.current = crearEnvioUnico(async (evento) => {
      setPendiente(true)
      try {
        await ultimoEnviar.current(evento)
      } finally {
        setPendiente(false)
      }
    })
  }
  const onSubmit = useCallback(async (evento) => {
    evento?.preventDefault?.()
    await envio.current.ejecutar(evento)
  }, [])
  return { pendiente, onSubmit }
}
