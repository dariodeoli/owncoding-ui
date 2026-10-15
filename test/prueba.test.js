// Ticket de prueba (#277): el corto es el predeterminado y sale solo con el
// título y la validación (fecha/hora opcional); el completo conserva la
// trazabilidad y los códigos. La plantilla fija ancho, tipo de corte y copias.
import { createHash } from 'node:crypto'
import { describe, expect, test, vi } from 'vitest'

import {
  ANCHOS_PRUEBA,
  CORTES_PRUEBA,
  PLANTILLA_PRUEBA,
  TIPOS_TICKET_PRUEBA,
  paginaDePrueba,
  plantillaDePrueba,
} from '../src/index.js'

const lineas = (opciones) => paginaDePrueba(opciones).lineas().join('\n')

describe('ticket de prueba', () => {
  test('el corto es el predeterminado: título + validación y nada más', () => {
    const prueba = paginaDePrueba({ nombreApp: 'MobOS' })
    const texto = prueba.lineas().join('\n')

    expect(texto).toContain('TICKET DE PRUEBA MobOS')
    expect(texto).toContain(`VALIDACIÓN ${prueba.validador}`)
    expect(prueba.validador).toMatch(/^\d{4}-\d$/)
    expect(prueba.corte).toBe(true, 'corta el papel')
    // Sin pie de trazabilidad, códigos ni acentos: es el ticket corto.
    expect(texto).not.toContain('Puente')
    expect(texto).not.toContain('Trabajo')
    expect(texto).not.toContain('Escanear')
    expect(texto).not.toContain('Acentos')
    expect(texto).not.toContain('Fecha')
    expect(prueba.lineas().length).toBeLessThan(12)
  })

  test('el corto puede incluir la fecha/hora', () => {
    const texto = lineas({ tipo: 'corta', incluyeFecha: true })
    expect(texto).toContain('Fecha')
  })

  test('el completo conserva trazabilidad, códigos y corte elegido', () => {
    const prueba = paginaDePrueba({
      tipo: 'completa',
      impresora: 'lan:192.168.1.50:9100',
      nombre: 'Mostrador',
      usuario: 'Ana',
      puente: 'Mac local',
      marca: 'A',
      corte: 'parcial',
    })
    const texto = prueba.lineas().join('\n')
    expect(texto).toContain('TICKET DE PRUEBA')
    expect(texto).toContain('Prueba completa')
    expect(texto).toContain('Comparativa A')
    expect(texto).toContain('Escanear')
    expect(texto).toContain('Acentos')
    expect(texto).toContain('Mostrador')
    expect(texto).toContain('Ana')
    expect(texto).toContain('Puente')
    expect(texto).toContain('[CORTE: parcial]')
  })

  test('los tipos siguen disponibles con sus etiquetas', () => {
    expect(TIPOS_TICKET_PRUEBA.corta).toBe('Prueba corta')
    expect(TIPOS_TICKET_PRUEBA.completa).toBe('Prueba completa')
    expect(TIPOS_TICKET_PRUEBA.venta).toBe('Ticket completo de venta')
    expect(Object.keys(TIPOS_TICKET_PRUEBA)).toEqual(['corta', 'completa', 'pedido', 'qr', 'venta', 'caracteres', 'corte'])
  })

  test('la plantilla valida el tipo, el ancho, el corte y las copias', () => {
    expect(PLANTILLA_PRUEBA).toEqual({ tipo: 'corta', ancho: 80, incluyeFecha: false, corte: 'completo', copias: 1 })
    expect(plantillaDePrueba()).toEqual(PLANTILLA_PRUEBA)
    expect(ANCHOS_PRUEBA).toEqual([58, 80])
    expect(CORTES_PRUEBA).toContain('parcial')

    expect(plantillaDePrueba({ tipo: 'completa', ancho: 58, incluyeFecha: true, corte: 'parcial', copias: 3 }))
      .toEqual({ tipo: 'completa', ancho: 58, incluyeFecha: true, corte: 'parcial', copias: 3 })
    // Basura: cae al default en vez de romper la impresión.
    expect(plantillaDePrueba({ tipo: 'inventado', ancho: 100, corte: 'raro', copias: 0 })).toEqual(PLANTILLA_PRUEBA)
    expect(plantillaDePrueba({ copias: 99 }).copias).toBe(1)
  })

  test('la plantilla se aplica al armar el ticket', () => {
    const plantilla = plantillaDePrueba({ tipo: 'completa', ancho: 58, corte: 'avanza-parcial', copias: 2 })
    const texto = paginaDePrueba(plantilla).lineas().join('\n')
    expect(texto).toContain('Prueba completa')
    expect(texto).toContain('[CORTE: avanza-parcial]')
    expect(texto).toContain('Copias')
  })
})

// Huellas capturadas antes de agregar callbacks: bytes y vista previa sin cambios.
const formatosPredeterminados = [
  [
    58,
    "corta",
    "037ef6afc596a01474def1f940de12e0024a56f0897929663dc3be2321441049"
  ],
  [
    58,
    "completa",
    "bc7135476f7b6bce685cf66ba3d3d7d4095cae15490d2a8d0aa37d5220acd118"
  ],
  [
    58,
    "pedido",
    "7403408b9e03f188f75031ffb6ac3c8158193f52d8e47f953401cea4f3a30a6e"
  ],
  [
    58,
    "qr",
    "f5aef62e8e78b7a087cb879c1caab4f316d3dd9e542d6375418267ee8acc6051"
  ],
  [
    58,
    "venta",
    "a6a8d9a48766297fb036f973d0922c7aa7787c445382c36d1ef439765f2af461"
  ],
  [
    58,
    "caracteres",
    "5a26806b6df9b469c2be2d08ab11ce5d275a210b007363c48aeadb2c82dc3baa"
  ],
  [
    58,
    "corte",
    "7f6ac918a1a35a6750437c620469a502c54a49c787bd3a1229e566a271fab590"
  ],
  [
    80,
    "corta",
    "f5206b70e9e9fca4139a7b32e416064b1d98d57743f9cd2a905052f8639042b5"
  ],
  [
    80,
    "completa",
    "5fe033053fe5cc7d4ef3d50f3022070093524b99321b77abf216799efa9008f7"
  ],
  [
    80,
    "pedido",
    "6504988603ffd57cf363e914101c75f5501f8522a9fbfcb108101fbe0830b151"
  ],
  [
    80,
    "qr",
    "18cf8a5e5f46e2dee7b797a5a15a8a48ca897fad2c9385197b648fdb6496cb58"
  ],
  [
    80,
    "venta",
    "831b58ed153d57530a5ebe4a794e13c96869a64d3d682ba4bbb8e4ef8ad91397"
  ],
  [
    80,
    "caracteres",
    "b86fa8aec0bf6bed490b327bf41ff2d3611585547ee1fba415bb8a22fa33361c"
  ],
  [
    80,
    "corte",
    "d6aa2090e51f3b2782d7f93bbcc8edca1ded345c3f64560cf5d918e95edd4592"
  ]
]

test.each(formatosPredeterminados)('conserva bytes y líneas predeterminados: %s mm, %s', (ancho, tipo, huella) => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
  const azar = vi.spyOn(Math, 'random').mockReturnValue(0.123)
  // El texto de fecha es una entrada estable de estas huellas: zona horaria
  // e ICU difieren entre macOS y CI. El formato real se sigue solicitando a es-PY.
  const fecha = vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('1/1/26, 9:00 a. m.')
  try {
    const t = paginaDePrueba({ ancho, tipo, incluyeFecha: true, nombreApp: 'MobOS', validacion: '1234' })
    expect(createHash('sha256').update(JSON.stringify([t.base64(), t.lineas()])).digest('hex')).toBe(huella)
    expect(fecha).toHaveBeenCalledWith('es-PY', { dateStyle: 'short', timeStyle: 'short' })
  } finally {
    fecha.mockRestore()
    azar.mockRestore()
    vi.useRealTimers()
  }
})

test.each(Object.keys(TIPOS_TICKET_PRUEBA))('encabezado y pie compartidos en %s', tipo => {
  const encabezado = vi.fn(t => t.texto('ENCABEZADO PREMIUM'))
  const pie = vi.fn(t => t.texto('PIE PREMIUM'))
  const qr = vi.fn(() => 'QR-CONSUMIDOR')
  const prueba = paginaDePrueba({ tipo, encabezado, pie, qr, validacion: '1234', incluyeFecha: true })
  const texto = prueba.lineas().join('')
  expect(encabezado).toHaveBeenCalledTimes(1)
  expect(pie).toHaveBeenCalledTimes(1)
  expect(encabezado.mock.calls[0][0]).toBe(pie.mock.calls[0][0])
  expect(texto).not.toContain('TICKET DE PRUEBA')
  expect(texto).toContain(`VALIDACIÓN ${prueba.validador}`)
  expect(texto.indexOf('ENCABEZADO PREMIUM')).toBeLessThan(texto.indexOf('VALIDACIÓN'))
  expect(texto.indexOf('PIE PREMIUM')).toBeGreaterThan(texto.lastIndexOf('VALIDACIÓN'))
  expect(texto.indexOf('PIE PREMIUM')).toBeLessThan(texto.lastIndexOf('[CORTE]'))
  const bytes = Buffer.from(prueba.base64(), 'base64')
  // El pie precede los avances de cierre y GS V 0, sin otro reinicio ESC @.
  expect(bytes.subarray(-10)).toEqual(Buffer.from([10, 27, 100, 2, 27, 100, 4, 29, 86, 0]))
  expect(bytes.toString('latin1').match(/\x1b@/g)).toHaveLength(1)
  if (tipo === 'corta') {
    expect(texto).not.toContain('Trabajo')
    expect(qr).not.toHaveBeenCalled()
  } else {
    expect(texto).toContain(prueba.ref)
    expect(texto).toContain('Puente')
    expect(texto.indexOf('PIE PREMIUM')).toBeGreaterThan(texto.indexOf(prueba.ref))
    expect(qr).toHaveBeenCalledWith(expect.objectContaining({ validacion: '1234', tipo }))
    expect(texto).toContain('QR-CONSUMIDOR')
  }
  if (tipo === 'corte') {
    expect(texto.match(/\[CORTE/g)).toHaveLength(5)
    expect(texto.indexOf('PIE PREMIUM')).toBeGreaterThan(texto.indexOf('[CORTE: avanza-parcial]'))
  }
})

test('cada callback es independiente y sus errores se propagan', () => {
  expect(lineas({ pie: t => t.texto('SOLO PIE') })).toContain('TICKET DE PRUEBA OwnCoding')
  expect(lineas({ encabezado: t => t.texto('SOLO ENCABEZADO') })).toContain('SOLO ENCABEZADO')
  for (const callback of ['encabezado', 'pie']) {
    const error = new Error(`Fallo ${callback}`)
    expect(() => paginaDePrueba({ [callback]: () => { throw error } })).toThrow(error)
  }
})
