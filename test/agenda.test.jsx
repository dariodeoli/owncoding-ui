import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  Calendario,
  DIAS_SEMANA,
  ETIQUETA_PERIODO,
  PERIODOS_FECHA,
  RangoFecha,
  agruparPorDia,
  claveDia,
  esClaveDia,
  etiquetaDia,
  etiquetaDiaCorta,
  etiquetaMes,
  fechaDeClave,
  hoyClave,
  indiceSemana,
  mismoMes,
  periodoDeRango,
  rangoDePeriodo,
  rangoInvertido,
  rangoMes,
  rangoSemana,
  sumarDias,
  sumarMeses,
} from '../src/index.js'

// Smoke del calendario y del filtro de rango: HTML con el contrato (día, tono,
// conteo, detalle) y lógica pura de días y atajos. Los días son claves
// `YYYY-MM-DD`: la lógica no debe depender de la zona del equipo.

const HOY = '2026-09-22' // martes

const ITEMS = [
  { id: 'a', fecha: '2026-09-22', titulo: 'Cobro cliente', hora: '09:30', tono: 'ok' },
  { id: 'b', fecha: '2026-09-22', titulo: 'Montaje', hora: '14:00', tono: 'info' },
  { id: 'c', fecha: '2026-09-22', titulo: 'Reunión de equipo', tono: 'warn' },
  { id: 'd', fecha: '2026-09-25', titulo: 'Desmontaje', detalle: 'Salón principal', tono: 'bad' },
]

describe('lógica de días del calendario', () => {
  test('las claves de día son válidas y no se corren de fecha', () => {
    expect(esClaveDia('2026-09-22')).toBe(true)
    expect(esClaveDia('2026-9-2')).toBe(false)
    expect(esClaveDia('2026-02-30')).toBe(false)
    expect(claveDia('2026-09-22')).toBe('2026-09-22')
    expect(claveDia(new Date(2026, 8, 22, 10, 30))).toBe('2026-09-22')
    expect(claveDia('nada')).toBe('')
    expect(fechaDeClave('2026-09-22').toISOString()).toBe('2026-09-22T00:00:00.000Z')
    expect(hoyClave('2026-09-22')).toBe('2026-09-22')
  })

  test('la semana va de lunes a domingo y el mes arma la grilla completa', () => {
    const semana = rangoSemana(HOY)
    expect(semana.desde).toBe('2026-09-21')
    expect(semana.hasta).toBe('2026-09-27')
    expect(semana.dias).toHaveLength(7)
    expect(indiceSemana('2026-09-21')).toBe(0)
    expect(indiceSemana('2026-09-27')).toBe(6)

    const mes = rangoMes(HOY)
    expect(mes.desde).toBe('2026-08-31')
    expect(mes.hasta).toBe('2026-10-04')
    expect(mes.dias).toHaveLength(35)
    expect(mes.dias[0]).toBe('2026-08-31')
    expect(mismoMes('2026-09-01', HOY)).toBe(true)
    expect(mismoMes('2026-08-31', HOY)).toBe(false)
  })

  test('sumar días y meses no se pasa del último día del mes', () => {
    expect(sumarDias(HOY, -29)).toBe('2026-08-24')
    expect(sumarDias(HOY, 1)).toBe('2026-09-23')
    expect(sumarMeses('2026-01-31', 1)).toBe('2026-02-28')
    expect(sumarMeses('2026-03-31', -1)).toBe('2026-02-28')
    expect(sumarMeses(HOY, -1)).toBe('2026-08-22')
  })

  test('etiquetas es-PY de mes, día y día corto', () => {
    expect(DIAS_SEMANA).toEqual(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'])
    expect(etiquetaMes(HOY)).toBe('Septiembre de 2026')
    expect(etiquetaDia(HOY)).toBe('Martes, 22 de septiembre')
    expect(etiquetaDiaCorta(HOY)).toBe('22 sept')
    expect(etiquetaMes('nada')).toBe('—')
  })

  test('los ítems se agrupan por día', () => {
    const porDia = agruparPorDia(ITEMS)
    expect(porDia.get('2026-09-22')).toHaveLength(3)
    expect(porDia.get('2026-09-25')).toHaveLength(1)
    expect(agruparPorDia([{ titulo: 'sin fecha' }]).size).toBe(0)
  })
})

describe('Calendario', () => {
  test('la grilla mensual muestra período, conteo, ítems y el «+N más»', () => {
    const html = renderToStaticMarkup(<Calendario items={ITEMS} hoy={HOY} anclaPorDefecto={HOY} />)
    expect(html).toContain('Septiembre de 2026')
    expect(html).toContain('Cobro cliente')
    expect(html).toContain('Montaje')
    expect(html).toContain('aria-label="Ver el detalle de Martes, 22 de septiembre"')
    expect(html).toContain('3 movimientos')
    expect(html).toContain('+1 más')
    expect(html).toContain('Desmontaje')
    expect(html).toContain('Salón principal')
    expect(html).toContain('Mes anterior')
    expect(html).toContain('Mes siguiente')
    expect(html).toContain('data-hoy="true"')
    expect(html).not.toContain('Sin movimientos en el período')
  })

  test('la vista semanal y el render a medida del ítem', () => {
    const html = renderToStaticMarkup(
      <Calendario
        items={ITEMS}
        hoy={HOY}
        anclaPorDefecto={HOY}
        vistas={['mes', 'semana']}
        vistaPorDefecto="semana"
        renderItem={(item, contexto) => <span data-propio={contexto.vista}>{item.titulo}</span>}
      />,
    )
    expect(html).toContain('21 sept – 27 sept')
    expect(html).toContain('Semana')
    expect(html).toContain('data-propio="grilla"')
    expect(html).toContain('data-propio="lista"')
  })

  test('el día seleccionado se abre en detalle y el vacío se dice', () => {
    const conDetalle = renderToStaticMarkup(<Calendario items={ITEMS} hoy={HOY} anclaPorDefecto={HOY} diaSeleccionado={HOY} />)
    expect(conDetalle).toContain('aria-label="Detalle de Martes, 22 de septiembre"')
    expect(conDetalle).toContain('Cerrar')

    const vacio = renderToStaticMarkup(<Calendario items={ITEMS} hoy={HOY} anclaPorDefecto={HOY} diaSeleccionado="2026-09-28" />)
    expect(vacio).toContain('Elegí otro día o navegá a otro período.')
  })

  test('sin ítems en el rango y en carga, el calendario es honesto', () => {
    const vacio = renderToStaticMarkup(<Calendario hoy={HOY} anclaPorDefecto={HOY} />)
    expect(vacio).toContain('Sin movimientos en el período')

    const cargando = renderToStaticMarkup(<Calendario cargando hoy={HOY} anclaPorDefecto={HOY} />)
    expect(cargando).toContain('aria-busy="true"')
    expect(cargando).not.toContain('Cobro cliente')
  })
})

describe('lógica de rangos de fecha', () => {
  test('los atajos calculan el rango esperado', () => {
    expect(PERIODOS_FECHA).toEqual(['hoy', 'esta-semana', 'este-mes', 'mes-pasado', 'ultimos-30', 'personalizado'])
    expect(ETIQUETA_PERIODO.personalizado).toBe('Personalizado')
    expect(rangoDePeriodo('hoy', { hoy: HOY })).toEqual({ desde: HOY, hasta: HOY })
    expect(rangoDePeriodo('esta-semana', { hoy: HOY })).toEqual({ desde: '2026-09-21', hasta: '2026-09-27' })
    expect(rangoDePeriodo('este-mes', { hoy: HOY })).toEqual({ desde: '2026-09-01', hasta: HOY })
    expect(rangoDePeriodo('mes-pasado', { hoy: HOY })).toEqual({ desde: '2026-08-01', hasta: '2026-08-31' })
    expect(rangoDePeriodo('ultimos-30', { hoy: HOY })).toEqual({ desde: '2026-08-24', hasta: HOY })
    expect(rangoDePeriodo('personalizado', { hoy: HOY })).toBe(null)
  })

  test('un par de fechas se reconoce como atajo o como personalizado', () => {
    expect(periodoDeRango('2026-09-01', HOY, { hoy: HOY })).toBe('este-mes')
    expect(periodoDeRango('2026-09-02', HOY, { hoy: HOY })).toBe('personalizado')
    expect(periodoDeRango('', '', { hoy: HOY })).toBe('personalizado')
    expect(rangoInvertido('2026-09-30', '2026-09-01')).toBe(true)
    expect(rangoInvertido('2026-09-01', '2026-09-30')).toBe(false)
  })
})

describe('RangoFecha', () => {
  test('sin control, arranca en «Este mes» y muestra los campos', () => {
    const html = renderToStaticMarkup(<RangoFecha hoy={HOY} />)
    expect(html).toMatch(/aria-pressed="true"[^>]*>Este mes</)
    expect(html).toContain('value="2026-09-01"')
    expect(html).toContain('value="2026-09-22"')
    expect(html).toContain('Desde')
    expect(html).toContain('Hasta')
    expect(html).toContain('Hoy')
    expect(html).toContain('Mes pasado')
    expect(html).toContain('Últimos 30 días')
  })

  test('controlado: marca el atajo que corresponde y avisa el rango invertido', () => {
    const ultimos30 = renderToStaticMarkup(<RangoFecha hoy={HOY} desde="2026-08-24" hasta={HOY} />)
    expect(ultimos30).toMatch(/aria-pressed="true"[^>]*>Últimos 30 días</)

    const invertido = renderToStaticMarkup(<RangoFecha hoy={HOY} desde="2026-09-30" hasta="2026-09-01" />)
    expect(invertido).toContain('El rango está invertido')
  })

  test('se pueden limitar los atajos y ocultar los campos', () => {
    const html = renderToStaticMarkup(<RangoFecha hoy={HOY} atajos={['hoy', 'personalizado']} mostrarCampos={false} />)
    expect(html).toContain('Hoy')
    expect(html).toContain('Personalizado')
    expect(html).not.toContain('Este mes')
    expect(html).not.toContain('<input')
  })
})
