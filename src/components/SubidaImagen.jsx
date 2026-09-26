import { useId, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { Button, IconAction } from './ui.jsx'
import { cn } from '../utils/cn.js'

// Subida de imagen sin dependencias (portada del `AdminImageUpload` de LedBox):
// campo de archivo estilizado, arrastrar y soltar, vista previa, validación de
// tipo real (JPG/PNG/WebP por magic bytes) y tamaño máximo, estados de error y
// limpiar.
//
// La compresión es opcional y ocurre en el navegador con canvas, sin librerías
// (`prepararImagen`): recorta cuadrado o conserva la relación de aspecto y
// baja la calidad hasta entrar en el objetivo. El objeto no sube nada: entrega
// la imagen preparada por `onImagen` y el consumidor decide qué hacer con ella.

/** Tipos de imagen aceptados por defecto. */
export const MIMES_IMAGEN = ['image/jpeg', 'image/png', 'image/webp']

/** Extensión canónica por tipo MIME. */
export const EXTENSION_IMAGEN = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

/** Tamaño máximo del archivo elegido (5 MB) antes de comprimir. */
export const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024

/** Tamaño objetivo de la imagen ya comprimida (1 MB), como el API de LedBox. */
export const TAMANO_OBJETIVO_IMAGEN = 1024 * 1024

const ETIQUETA_TIPO = { 'image/jpeg': 'JPG', 'image/png': 'PNG', 'image/webp': 'WebP' }

function asciiEn(bytes, offset, length) {
  return String.fromCharCode(...bytes.slice(offset, offset + length))
}

/**
 * Tipo real del archivo por su firma (magic bytes): JPG, PNG o WebP; `null` si
 * no es una imagen aceptada. Un PDF o un ejecutable renombrado no pasa.
 */
export function mimeDeImagen(bytes) {
  if (!bytes || bytes.length < 4) return null
  const empiezaCon = (...firma) => firma.every((byte, indice) => bytes[indice] === byte)
  if (empiezaCon(0xff, 0xd8, 0xff)) return 'image/jpeg'
  if (empiezaCon(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png'
  if (bytes.length >= 12 && asciiEn(bytes, 0, 4) === 'RIFF' && asciiEn(bytes, 8, 4) === 'WEBP') return 'image/webp'
  return null
}

function pesoLegible(bytes) {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Validación rápida del archivo elegido (antes de leerlo): vacío, tamaño y
 * tipo declarado. La firma real se confirma al preparar la imagen.
 * Devuelve `{ ok: true }` o `{ ok: false, error }`.
 */
export function validarImagen(archivo, { tipos = MIMES_IMAGEN, tamanoMaximo = TAMANO_MAXIMO_IMAGEN } = {}) {
  if (!archivo) return { ok: false, error: 'No se eligió ningún archivo.' }
  if (!archivo.size) return { ok: false, error: 'El archivo está vacío; probá de nuevo.' }
  if (archivo.size > tamanoMaximo) {
    return { ok: false, error: `El archivo supera los ${pesoLegible(tamanoMaximo)}; probá con una imagen más chica.` }
  }
  const mime = String(archivo.type ?? '').toLowerCase()
  if (mime && !tipos.includes(mime)) {
    return { ok: false, error: `Solo se aceptan imágenes ${tipos.map((tipo) => ETIQUETA_TIPO[tipo] || tipo).join(', ')}.` }
  }
  return { ok: true }
}

async function cargarFuente(archivo) {
  if (typeof createImageBitmap === 'function') {
    try {
      // `from-image` respeta la orientación EXIF de las fotos de celular.
      const bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
      return { imagen: bitmap, ancho: bitmap.width, alto: bitmap.height, liberar: () => bitmap.close() }
    } catch {
      // Safari viejo o formato raro: se reintenta con `<img>`.
    }
  }
  const url = URL.createObjectURL(archivo)
  try {
    const imagen = await new Promise((resolve, reject) => {
      const elemento = new Image()
      elemento.onload = () => resolve(elemento)
      elemento.onerror = () => reject(new Error('No pudimos leer la imagen.'))
      elemento.src = url
    })
    return { imagen, ancho: imagen.naturalWidth, alto: imagen.naturalHeight, liberar: () => URL.revokeObjectURL(url) }
  } catch {
    URL.revokeObjectURL(url)
    return null
  }
}

function blobABase64(blob) {
  return new Promise((resolve) => {
    const lector = new FileReader()
    lector.onload = () => {
      const resultado = typeof lector.result === 'string' ? lector.result : ''
      const coma = resultado.indexOf(',')
      resolve(coma >= 0 ? resultado.slice(coma + 1) : null)
    }
    lector.onerror = () => resolve(null)
    lector.readAsDataURL(blob)
  })
}

function canvasABlob(canvas, calidad) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', calidad))
}

/** Reintentos de calidad hasta entrar en el tamaño objetivo. */
const CALIDADES = [0.86, 0.7, 0.55]

/**
 * Valida, recorta/escala y comprime la imagen elegida en el navegador (canvas,
 * sin librerías). Devuelve `{ ok: true, imagen }` con `dataUrl`, `base64`,
 * `tipo`, `ancho`, `alto` y `tamano`, o `{ ok: false, error }` (nunca lanza).
 * Fuera del navegador devuelve un error claro.
 */
export async function prepararImagen(
  archivo,
  { cuadrado = false, ladoMaximo = 1024, objetivo = TAMANO_OBJETIVO_IMAGEN } = {},
) {
  const rapida = validarImagen(archivo)
  if (!rapida.ok) return rapida
  if (typeof document === 'undefined') return { ok: false, error: 'La imagen se prepara en el navegador.' }

  const cabecera = new Uint8Array(await archivo.slice(0, 16).arrayBuffer())
  const tipo = mimeDeImagen(cabecera)
  if (!tipo) return { ok: false, error: 'El archivo no es un JPG, PNG o WebP real: revisá que no esté renombrado.' }

  const fuente = await cargarFuente(archivo)
  if (!fuente || fuente.ancho < 1 || fuente.alto < 1) {
    fuente?.liberar()
    return { ok: false, error: 'No pudimos leer la imagen; probá con otro archivo.' }
  }

  try {
    const escala = Math.min(1, ladoMaximo / Math.max(fuente.ancho, fuente.alto))
    const lado = cuadrado ? Math.min(fuente.ancho, fuente.alto) : 0
    const ancho = cuadrado ? Math.max(1, Math.round(lado * escala)) : Math.max(1, Math.round(fuente.ancho * escala))
    const alto = cuadrado ? ancho : Math.max(1, Math.round(fuente.alto * escala))
    const canvas = document.createElement('canvas')
    canvas.width = ancho
    canvas.height = alto
    const contexto = canvas.getContext('2d')
    if (!contexto) return { ok: false, error: 'No pudimos procesar la imagen en este navegador.' }

    if (cuadrado) {
      const origen = Math.min(fuente.ancho, fuente.alto)
      contexto.drawImage(fuente.imagen, (fuente.ancho - origen) / 2, (fuente.alto - origen) / 2, origen, origen, 0, 0, ancho, alto)
    } else {
      contexto.drawImage(fuente.imagen, 0, 0, ancho, alto)
    }

    let blob = null
    for (const calidad of CALIDADES) {
      blob = await canvasABlob(canvas, calidad)
      if (blob && blob.size > 0 && blob.size <= objetivo) break
    }
    if (!blob || blob.size === 0) return { ok: false, error: 'No pudimos comprimir la imagen; probá con otra.' }
    if (blob.size > objetivo) return { ok: false, error: `La imagen sigue superando ${pesoLegible(objetivo)} después de comprimirla; probá con una más chica.` }

    const base64 = await blobABase64(blob)
    if (!base64) return { ok: false, error: 'No pudimos leer la imagen; probá de nuevo.' }
    return {
      ok: true,
      imagen: {
        base64,
        tipo: 'image/webp',
        ancho,
        alto,
        tamano: blob.size,
        dataUrl: `data:image/webp;base64,${base64}`,
      },
    }
  } finally {
    fuente.liberar()
  }
}

export default function SubidaImagen({
  /** Etiqueta del campo. */
  etiqueta,
  /** Aclaración debajo del campo (nunca junto al error). */
  descripcion,
  /** Vista previa de una imagen ya guardada (data URL servida por la app). */
  valor = null,
  /** Error externo (del API); se muestra con `role="alert"`. */
  error = null,
  /** Tipos aceptados; por defecto JPG, PNG y WebP. */
  tipos = MIMES_IMAGEN,
  /** Tamaño máximo del archivo elegido, en bytes. */
  tamanoMaximo = TAMANO_MAXIMO_IMAGEN,
  /** Comprime en el navegador antes de avisar (canvas, sin librerías). */
  comprimir = true,
  /** Recorta cuadrado desde el centro (avatar) o conserva la relación (logo). */
  cuadrado = false,
  /** Lado máximo de la imagen final, en px. */
  ladoMaximo = 1024,
  /** Tamaño objetivo de la imagen comprimida, en bytes. */
  tamanoObjetivo = TAMANO_OBJETIVO_IMAGEN,
  /** Recibe `{ archivo, dataUrl, tipo, ancho, alto, tamano, base64?, preparada }`. */
  onImagen,
  /** Quita la imagen (limpia la vista previa y avisa al consumidor). */
  onLimpiar,
  limpiarEtiqueta = 'Quitar imagen',
  subirEtiqueta = 'Subir imagen',
  cambiarEtiqueta = 'Cambiar imagen',
  disabled = false,
  /** Ocupado externo (por ejemplo, mientras el API guarda). */
  ocupado = false,
  className,
}) {
  const inputRef = useRef(null)
  const campoId = useId()
  const errorId = `${campoId}-error`
  const ayudaId = `${campoId}-ayuda`
  const [preparando, setPreparando] = useState(false)
  const [errorLocal, setErrorLocal] = useState('')
  const [vistaLocal, setVistaLocal] = useState(null)
  const [arrastrando, setArrastrando] = useState(false)

  const mensaje = error || errorLocal
  const trabajando = Boolean(ocupado) || preparando
  const vista = vistaLocal ?? valor
  const acepta = tipos.map((tipo) => EXTENSION_IMAGEN[tipo] ? `.${EXTENSION_IMAGEN[tipo]}` : tipo).join(',')

  async function elegir(archivo) {
    if (!archivo || trabajando || disabled) return
    setErrorLocal('')
    const rapida = validarImagen(archivo, { tipos, tamanoMaximo })
    if (!rapida.ok) {
      setErrorLocal(rapida.error)
      return
    }
    if (!comprimir) {
      onImagen?.({ archivo, tipo: archivo.type, tamano: archivo.size, preparada: false })
      return
    }
    setPreparando(true)
    const resultado = await prepararImagen(archivo, { cuadrado, ladoMaximo, objetivo: tamanoObjetivo })
    setPreparando(false)
    if (!resultado.ok) {
      setErrorLocal(resultado.error)
      return
    }
    setVistaLocal(resultado.imagen.dataUrl)
    onImagen?.({ archivo, ...resultado.imagen, preparada: true })
  }

  function limpiar() {
    setVistaLocal(null)
    setErrorLocal('')
    if (inputRef.current) inputRef.current.value = ''
    onLimpiar?.()
  }

  return (
    <div className={cn('min-w-0', className)}>
      {etiqueta && <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-mute">{etiqueta}</span>}

      <div
        className={cn(
          'flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed p-3 transition',
          arrastrando ? 'border-fono/70 bg-fono/5' : 'border-ink-500',
          (disabled || trabajando) && 'opacity-70',
        )}
        onDragOver={(event) => {
          if (disabled || trabajando) return
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
          setArrastrando(true)
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(event) => {
          if (disabled || trabajando) return
          event.preventDefault()
          setArrastrando(false)
          void elegir(event.dataTransfer.files?.[0] ?? null)
        }}
      >
        {vista ? (
          <span className={cn('grid shrink-0 place-items-center overflow-hidden rounded-xl border border-ink-500 bg-ink-800', cuadrado ? 'h-20 w-20' : 'h-20 w-28')}>
            <img src={vista} alt="" className={cn('h-full w-full', cuadrado ? 'object-cover' : 'object-contain')} />
          </span>
        ) : (
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border border-ink-600 bg-ink-800 text-mute" aria-hidden="true">
            <Icon name="image" className="h-6 w-6" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs text-mute">
            {vista ? 'La imagen está lista.' : 'Arrastrá una imagen o elegí un archivo.'}
          </p>
          <p className="mt-0.5 text-[11px] text-mute">
            {tipos.map((tipo) => ETIQUETA_TIPO[tipo] || tipo).join(' · ')} · hasta {pesoLegible(tamanoMaximo)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" disabled={disabled || trabajando} onClick={() => inputRef.current?.click()} aria-describedby={mensaje ? errorId : descripcion ? ayudaId : undefined}>
              <Icon name="upload" className="h-4 w-4" />
              {trabajando ? 'Procesando…' : vista ? cambiarEtiqueta : subirEtiqueta}
            </Button>
            {(vista || vistaLocal) && (
              <IconAction icon="trash" label={limpiarEtiqueta} disabled={disabled || trabajando} onClick={limpiar} />
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept={acepta}
          aria-label={etiqueta || subirEtiqueta}
          disabled={disabled || trabajando}
          onChange={(event) => {
            void elegir(event.target.files?.[0] ?? null)
            event.target.value = ''
          }}
        />
      </div>

      {mensaje ? (
        <p className="mt-1.5 text-xs text-bad-text" id={errorId} role="alert">{mensaje}</p>
      ) : descripcion ? (
        <p className="mt-1.5 text-xs text-mute" id={ayudaId}>{descripcion}</p>
      ) : null}
    </div>
  )
}
