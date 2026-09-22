import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  Aviso,
  Badge,
  BarraProgreso,
  Button,
  Card,
  CeldaMoneda,
  EmptyState,
  ErrorState,
  FilaDato,
  Input,
  Label,
  Money,
  Select,
  Skeleton,
  Stat,
  Switch,
  Textarea,
} from '../src/index.js'
import { CELDA_DATO, CELDA_ENCABEZADO, CELDA_NUMERO, ROTULO_DATO, ROTULO_SECCION } from '../src/index.js'

// Smoke mínimo: los objetos renderizan en el servidor y el HTML trae el
// contrato (rol, aria, clase). No reemplaza al QA visual de cada app.

describe('render de los objetos base', () => {
  test('botón y campos', () => {
    expect(renderToStaticMarkup(<Button>Guardar</Button>)).toContain('>Guardar<')
    expect(renderToStaticMarkup(<Button variant="outline" disabled>Guardar</Button>)).toContain('disabled')
    expect(renderToStaticMarkup(<Input value="hola" readOnly />)).toContain('value="hola"')
    expect(renderToStaticMarkup(<Textarea rows={2} defaultValue="nota" />)).toContain('rows="2"')
    expect(renderToStaticMarkup(<Label htmlFor="x">Nombre</Label>)).toContain('for="x"')
    expect(renderToStaticMarkup(<Select value="a" onChange={() => {}}><option value="a">A</option></Select>)).toContain('<select')
  })

  test('avisos con el rol que corresponde', () => {
    expect(renderToStaticMarkup(<Aviso>Error</Aviso>)).toContain('role="alert"')
    expect(renderToStaticMarkup(<Aviso tono="ok">Listo</Aviso>)).toContain('role="status"')
    expect(renderToStaticMarkup(<Aviso tono="warn">Ojo</Aviso>)).toContain('border-warn/30')
    expect(renderToStaticMarkup(<Aviso como="div"><b>Error</b></Aviso>)).toContain('<div role="alert"')
  })

  test('estados, cápsulas y celdas', () => {
    expect(renderToStaticMarkup(<EmptyState title="Nada" />)).toContain('Nada')
    expect(renderToStaticMarkup(<ErrorState description="Falló" />)).toContain('Falló')
    expect(renderToStaticMarkup(<Skeleton className="h-4" />)).toContain('animate-pulse')
    expect(renderToStaticMarkup(<Badge color="green">Activo</Badge>)).toContain('Activo')
    expect(renderToStaticMarkup(<Stat label="Ventas" valor="10" />)).toContain('Ventas')
    expect(renderToStaticMarkup(<Card>Contenido</Card>)).toContain('Contenido')
  })

  test('dinero, fila de dato y barra de progreso', () => {
    expect(renderToStaticMarkup(<Money value={1201032} />)).toContain('Gs 1.201.032')
    expect(renderToStaticMarkup(<Money value={1234.56} currency="USD" />)).toContain('US$ 1,234.56')
    expect(renderToStaticMarkup(<CeldaMoneda valor={150000} tono="ok" />)).toContain('Gs 150.000')
    expect(renderToStaticMarkup(<FilaDato etiqueta="Pagado" valor="Gs 10.000" />)).toContain('Pagado')
    const barra = renderToStaticMarkup(<BarraProgreso valor={30} etiqueta="Avance" />)
    expect(barra).toContain('role="progressbar"')
    expect(barra).toContain('30%')
  })

  test('el switch es un checkbox accesible', () => {
    const html = renderToStaticMarkup(<Switch checked onChange={() => {}} ariaLabel="Activo" />)
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked')
  })

  test('las clases de tabla son únicas y estables', () => {
    expect(ROTULO_DATO).toBe('text-[10px] font-bold uppercase tracking-wider text-mute')
    expect(CELDA_ENCABEZADO).toBe(`truncate ${ROTULO_DATO}`)
    expect(ROTULO_SECCION).toBe('text-xs font-bold uppercase tracking-wider text-mute')
    expect(CELDA_DATO).toBe('truncate text-xs text-mute')
    expect(CELDA_NUMERO).toBe('text-right tabular-nums')
  })
})
