// Ciclo de guardado (cosecha de ScaleOS, #2). El envío de un formulario no se
// solapa consigo mismo y el cierre del diálogo ocurre SOLO después de persistir:
//
//   const { pendiente, onSubmit } = useSingleFlightSubmit(async () => {
//     if (!(await validar())) return
//     await guardar()
//     await completeSave(cerrar, refrescar, { avisar: toast.warning })
//   })
//
// `completeSave` corre el refresco después de la escritura y convierte un
// fallo de refresco en advertencia: el guardado ya quedó y no se le pide al
// usuario que escriba otra vez.

export const AVISO_REFRESCO =
  'Se guardó correctamente, pero no se pudo actualizar la lista. Recargá la página para ver los cambios; no hace falta guardar otra vez.'

// Envoltorio puro del envío (lo usa `useSingleFlightSubmit`): el bloqueo se
// toma ANTES de ejecutar —así la validación asíncrona también queda cubierta—
// y se suelta pase lo que pase. Mientras corre, otro `ejecutar` se ignora por
// completo: no toca el estado ni la promesa del envío original.
export function crearEnvioUnico(enviar) {
  let enCurso = false
  return {
    get enCurso() {
      return enCurso
    },
    async ejecutar(evento) {
      if (enCurso) return undefined
      enCurso = true
      try {
        return await enviar(evento)
      } finally {
        enCurso = false
      }
    },
  }
}

// Cierra y refresca: `cerrar` primero (el diálogo deja de estar pendiente), el
// refresco después. Si el refresco falla, avisa por `avisar` sin sugerir
// repetir la escritura y devuelve `false`; si sale bien, `true`.
export async function completeSave(cerrar, refrescar, { avisar } = {}) {
  cerrar?.()
  try {
    await refrescar?.()
    return true
  } catch {
    avisar?.(AVISO_REFRESCO)
    return false
  }
}
