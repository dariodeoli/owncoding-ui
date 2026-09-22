import { useEffect, useState } from 'react'
import { qrDataUrl } from '../utils/qr.js'
import { cn } from '../utils/cn.js'

// Código QR (#240): muestra la imagen generada por `qrDataUrl` con las opciones
// compartidas. Sin valor (o si el generador falla) no renderiza nada: la
// pantalla decide qué mostrar en su lugar. Requiere `qrcode` instalado en la
// app (peer dependency opcional).
export default function CodigoQr({ valor, ancho = 220, nivel = 'M', margen = 1, alt = 'Código QR', className, ...props }) {
  const [imagen, setImagen] = useState('')

  useEffect(() => {
    let activo = true
    qrDataUrl(valor, { ancho, nivel, margen }).then((data) => { if (activo) setImagen(data) })
    return () => { activo = false }
  }, [valor, ancho, nivel, margen])

  if (!imagen) return null
  return <img src={imagen} alt={alt} title={alt} className={cn('rounded-xl bg-white p-2', className)} {...props} />
}
