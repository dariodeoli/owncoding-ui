import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  Aviso,
  Badge,
  BarraProgreso,
  Button,
  Card,
  CeldaMoneda,
  ChipEstado,
  ChipsLocks,
  ConteoChecklist,
  EmptyState,
  ErrorState,
  FichaCertificado,
  FilaChecklist,
  FilaDato,
  GradoBadge,
  IconoCategoria,
  Input,
  Label,
  MedidorBateria,
  Money,
  Modal,
  Nota,
  Select,
  SemaforoItem,
  Skeleton,
  Stat,
  Stepper,
  Switch,
  Textarea,
  TileEquipo,
} from '../src/index.js'
import { BotonDentroCampo } from '../src/index.js'
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

  test('no se exporta un alias Toggle: el interruptor es uno solo (#186)', async () => {
    const modulo = await import('../src/index.js')
    expect(modulo.Toggle).toBeUndefined()
    expect(typeof modulo.Switch).toBe('function')
  })

  test('las clases de tabla son únicas y estables', () => {
    expect(ROTULO_DATO).toBe('text-[10px] font-bold uppercase tracking-wider text-mute')
    expect(CELDA_ENCABEZADO).toBe(`truncate ${ROTULO_DATO}`)
    expect(ROTULO_SECCION).toBe('text-xs font-bold uppercase tracking-wider text-mute')
    expect(CELDA_DATO).toBe('truncate text-xs text-mute')
    expect(CELDA_NUMERO).toBe('text-right tabular-nums')
  })

  test('el modal elige el ancho por tamaño y el botón vive dentro del campo', () => {
    const amplio = renderToStaticMarkup(<Modal open title="Proveedores" size="amplio">…</Modal>)
    expect(amplio).toContain('max-w-3xl')
    expect(renderToStaticMarkup(<Modal open title="Aviso" />)).toContain('max-w-xl')
    expect(renderToStaticMarkup(<Modal open title="Chico" size="corto" />)).toContain('max-w-md')
    expect(renderToStaticMarkup(<Modal open title="Grande" size="completo" />)).toContain('max-w-5xl')

    const boton = renderToStaticMarkup(<BotonDentroCampo etiqueta="Extraer los datos del RUC" />)
    expect(boton).toContain('Extraer los datos del RUC')
    expect(boton).toContain('absolute inset-y-0 right-0')
    const ocupado = renderToStaticMarkup(<BotonDentroCampo etiqueta="Extraer" ocupado />)
    expect(ocupado).toContain('Consultando…')
    expect(ocupado).toContain('animate-spin')
  })

  test('la nota y la barra de gráfico salen de los objetos', () => {
    const nota = renderToStaticMarkup(<Nota>Sin seguimiento asignado</Nota>)
    expect(nota).toContain('border-warn/30 bg-warn/10')
    expect(nota).toContain('text-mute')
    expect(nota).not.toContain('role="status"')
    expect(renderToStaticMarkup(<Nota tono="info" compact>Dato de referencia</Nota>)).toContain('border-info/25 bg-info/10')
    expect(renderToStaticMarkup(<Nota tono="neutro">Neutra</Nota>)).toContain('border-ink-600 bg-ink-800/40')

    const barra = renderToStaticMarkup(<BarraProgreso valor={30} max={60} pista="bg-ink-600" relleno="bg-blue-line" etiqueta="Ventas del mes" />)
    expect(barra).toContain('role="progressbar"')
    expect(barra).toContain('bg-ink-600')
    expect(barra).toContain('bg-blue-line')
    expect(barra).toContain('aria-valuenow="50"')
    expect(renderToStaticMarkup(<BarraProgreso valor={10} tono="onbrand" />)).toContain('bg-onbrand')
  })

  test('operación de equipos: semáforo, chips, batería, grado, tile y stepper (#240/#241)', () => {
    const punto = renderToStaticMarkup(<SemaforoItem estado="falla" etiqueta="Pantalla" detalle="Rayón profundo" />)
    expect(punto).toContain('Pantalla: Falla')
    expect(punto).toContain('Rayón profundo')
    expect(punto).toContain('text-bad')

    const fila = renderToStaticMarkup(<FilaChecklist etiqueta="Face ID" estado="ok" nota="Probado en 3 intentos" />)
    expect(fila).toContain('Face ID')
    expect(fila).toContain('Probado en 3 intentos')
    const conteo = renderToStaticMarkup(<ConteoChecklist pasan={12} total={12} />)
    expect(conteo).toContain('12 de 12 pass')
    expect(conteo).toContain('text-pass')
    expect(renderToStaticMarkup(<ConteoChecklist pasan={10} total={12} fallas={2} />)).toContain('2 fallas')

    const chip = renderToStaticMarkup(<ChipEstado estado="pass" />)
    expect(chip).toContain('Certificado')
    expect(chip).toContain('border-pass/30')
    expect(renderToStaticMarkup(<ChipEstado estado="falla" />)).toContain('Con fallas')

    const locks = renderToStaticMarkup(<ChipsLocks locks={[{ clave: 'icloud', estado: 'libre' }, { clave: 'mdm', estado: 'activo' }, { clave: 'esn', estado: 'desconocido' }]} />)
    expect(locks).toContain('iCloud / Find My')
    expect(locks).toContain('MDM: Activo')
    expect(locks).toContain('ESN / lista negra: Sin dato')

    const bateria = renderToStaticMarkup(<MedidorBateria porcentaje={86} ciclos={412} />)
    expect(bateria).toContain('86%')
    expect(bateria).toContain('412 ciclos')
    expect(bateria).toContain('role="progressbar"')
    expect(renderToStaticMarkup(<MedidorBateria porcentaje={null} />)).toContain('Sin dato')
    expect(renderToStaticMarkup(<MedidorBateria porcentaje={72} variante="chip" />)).toContain('text-bad')

    const grado = renderToStaticMarkup(<GradoBadge grado="B" conDescripcion />)
    expect(grado).toContain('Grado B')
    expect(grado).toContain('Marcas leves de uso')
    expect(renderToStaticMarkup(<GradoBadge grado="Z" />)).toContain('Z')

    const stepper = renderToStaticMarkup(<Stepper pasos={[{ id: 'intake', etiqueta: 'Intake' }, { id: 'diag', etiqueta: 'Diagnóstico' }, { id: 'listo', etiqueta: 'Listo' }]} actual="diag" hechos={['intake']} />)
    expect(stepper).toContain('Intake')
    expect(stepper).toContain('Diagnóstico')
    expect(stepper).toContain('text-pass')

    const tile = renderToStaticMarkup(<TileEquipo modelo="iPhone 13" imei="•••• 1234" estado="pass" grado="A" bateria={94} locks={[{ clave: 'icloud', estado: 'libre' }]} />)
    expect(tile).toContain('iPhone 13')
    expect(tile).toContain('•••• 1234')
    expect(tile).toContain('Certificado')
    expect(tile).toContain('Grado A')
    expect(tile).toContain('94%')
    expect(tile).toContain('iCloud / Find My')
    expect(renderToStaticMarkup(<TileEquipo modelo="MacBook Pro" />)).toContain('M5 5h14v10H5z')

    const icono = renderToStaticMarkup(<IconoCategoria categoria="AirPods" />)
    expect(icono).toContain('<svg')
    expect(icono).toContain('M7 3.5a3 3 0 0 1 3 3v7')
    expect(renderToStaticMarkup(<IconoCategoria categoria="Servicio" />)).toContain('<svg')
    expect(renderToStaticMarkup(<IconoCategoria icono="mobile" />)).toContain('M8 2h8a2 2 0 0 1 2 2v16')
  })

  test('la ficha de certificado compone los objetos del informe (#240)', () => {
    const ficha = renderToStaticMarkup(
      <FichaCertificado
        empresa="Tienda Demo"
        modelo="iPhone 13"
        imei="•••• 1234"
        grado="B"
        bateria={86}
        ciclos={412}
        locks={[{ clave: 'icloud', estado: 'libre' }, { clave: 'mdm', estado: 'desconocido' }]}
        aprobados={11}
        total={12}
        verificadoPor="Ana"
        verificadoAt="22/09/2026 10:30"
        enlace="https://moboss.online/u/DEMO0001"
      />,
    )
    expect(ficha).toContain('iPhone 13')
    expect(ficha).toContain('•••• 1234')
    expect(ficha).toContain('Grado B')
    expect(ficha).toContain('86%')
    expect(ficha).toContain('412 ciclos')
    expect(ficha).toContain('11 de 12 pass')
    expect(ficha).toContain('iCloud / Find My: Libre')
    expect(ficha).toContain('MDM: Sin dato')
    expect(ficha).toContain('Verificado por Ana · 22/09/2026 10:30')
    expect(ficha).toContain('Certificado')
    // El QR se genera en el cliente (useEffect): en SSR no aparece la imagen.
    expect(ficha).not.toContain('<img')
    expect(renderToStaticMarkup(<FichaCertificado modelo="iPad" total={0} />)).toContain('Sin verificación física')
  })
})
