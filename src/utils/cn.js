import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Une clases resolviendo conflictos de Tailwind (el último gana).
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Primer nombre: en una línea de tiempo el apellido no aporta y ocupa lugar.
export function primerNombre(nombre = '') {
  return String(nombre ?? '').trim().split(/\s+/)[0] || ''
}
