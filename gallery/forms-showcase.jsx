import React, { useId, useRef, useState } from 'react'
import {
  AnimatedStatus, BotonDentroCampo, Button, Checkbox, EmailField, FormField, FormulariosPro, Input, MoneyInput, PasswordInput, PhoneField,
  SearchField, SegmentedField, Select, Switch, Textarea,
} from '../src/index.js'

// Showcase «Formularios»: un alta de cliente realista con todos los estados de
// los campos (foco, error con sacudida, éxito, cargando, adornos, contador) y
// un guardado con cargando → éxito. Datos locales: no se envía ni se guarda nada.
const PLANES = [['basico', 'Básico · Gs 150.000'], ['pro', 'Pro · Gs 420.000'], ['empresa', 'Empresa · a medida']]
const PERIODOS = [['mensual', 'Mensual'], ['anual', 'Anual · 2 meses gratis']]

export function FormulariosShowcase() {
  const base = useId()
  const id = (nombre) => `${base}-${nombre}`
  const [nombre, setNombre] = useState('')
  const [ruc, setRuc] = useState('80012345-6')
  const [rucEstado, setRucEstado] = useState(undefined)
  const [pais, setPais] = useState('PY')
  const [telefono, setTelefono] = useState('981 123 456')
  const [correo, setCorreo] = useState('')
  const [monto, setMonto] = useState(1250000)
  const [plan, setPlan] = useState('pro')
  const [periodo, setPeriodo] = useState('mensual')
  const [factura, setFactura] = useState(true)
  const [avisos, setAvisos] = useState({ correo: true, whatsapp: false })
  const [terminos, setTerminos] = useState(false)
  const [notas, setNotas] = useState('Cliente referido por el taller de Luque.')
  const [busqueda, setBusqueda] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [intento, setIntento] = useState(false)
  const [guardado, setGuardado] = useState('idle')
  const [flotante, setFlotante] = useState({ usuario: '', clave: '', monto: '', zona: 'centro', nota: '' })
  const temporizadores = useRef([])

  const errorNombre = intento && nombre.trim().length < 3 ? 'Escribí al menos tres letras.' : undefined
  const errorTerminos = intento && !terminos
  const todosAvisos = Object.values(avisos).every(Boolean)
  const algunosAvisos = Object.values(avisos).some(Boolean)

  function programar(fn, ms) {
    temporizadores.current.push(setTimeout(fn, ms))
  }
  function consultarRuc() {
    setRucEstado('cargando')
    programar(() => setRucEstado('ok'), 900)
  }
  function buscar(valor) {
    setBusqueda(valor)
    setBuscando(Boolean(valor))
    programar(() => setBuscando(false), 600)
  }
  function guardar(evento) {
    evento.preventDefault()
    setIntento(true)
    if (nombre.trim().length < 3 || !terminos) return
    setGuardado('cargando')
    programar(() => setGuardado('exito'), 1300)
    programar(() => setGuardado('idle'), 3200)
  }

  return (
    <FormulariosPro>
    <section id="formularios" aria-labelledby="titulo-formularios" className="priority-section">
      <div className="section-heading">
        <div>
          <p>Sistema de formularios</p>
          <h2 id="titulo-formularios">Formularios</h2>
        </div>
        <span>Fixtures locales · no se guarda nada</span>
      </div>
      <form data-forms-showcase noValidate onSubmit={guardar} className="mx-auto grid max-w-3xl gap-5 rounded-2xl border border-ink-600 bg-ink p-5 sm:p-7">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Nuevo cliente</h3>
          <p className="mt-1 text-sm text-mute">Probá el foco, dejá el nombre vacío y guardá para ver el error, o completá todo para ver el guardado.</p>
        </div>

        <SearchField value={busqueda} onChange={(evento) => buscar(evento.target.value)} cargando={buscando} placeholder="Buscar cliente existente" ariaLabel="Buscar cliente existente" />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre o razón social" htmlFor={id('nombre')} requerido error={errorNombre}>
            <Input id={id('nombre')} value={nombre} onChange={(evento) => setNombre(evento.target.value)} placeholder="Ej. Taller San José" autoComplete="off" />
          </FormField>
          <FormField label="RUC" htmlFor={id('ruc')} hint="Consultamos el nombre en el registro (simulado)">
            <Input
              id={id('ruc')}
              value={ruc}
              onChange={(evento) => { setRuc(evento.target.value); setRucEstado(undefined) }}
              inputMode="numeric"
              cargando={rucEstado === 'cargando'}
              estado={rucEstado === 'ok' ? 'ok' : undefined}
              fin={<BotonDentroCampo integrado etiqueta="Consultar RUC" onClick={consultarRuc} disabled={!ruc || rucEstado === 'cargando'} />}
            />
          </FormField>
          <FormField label="Teléfono" htmlFor={id('tel')}>
            <PhoneField id={id('tel')} country={pais} phone={telefono} onCountryChange={setPais} onChange={setTelefono} onInternationalChange={() => {}} />
          </FormField>
          <FormField label="Correo" htmlFor={id('correo')} hint="Para enviar la factura">
            <EmailField id={id('correo')} value={correo} onChange={setCorreo} placeholder="cliente@dominio.com" />
          </FormField>
          <FormField label="Anticipo" htmlFor={id('monto')}>
            <MoneyInput id={id('monto')} value={monto} onValueChange={setMonto} className="w-full" />
          </FormField>
          <FormField label="Plan" htmlFor={id('plan')}>
            <Select id={id('plan')} value={plan} onChange={(evento) => setPlan(evento.target.value)}>
              {PLANES.map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}
            </Select>
          </FormField>
        </div>

        <div>
          <span id={id('periodo')} className="mb-1.5 block text-[13px] font-medium leading-5">Período de facturación</span>
          <SegmentedField ariaLabel="Período de facturación" value={periodo} onChange={setPeriodo} options={PERIODOS} />
        </div>

        <div className="grid gap-1">
          <label className="flex min-h-11 items-center justify-between gap-4 text-sm"><span>Enviar la factura por correo</span><Switch checked={factura} onChange={(evento) => setFactura(evento.target.checked)} ariaLabel="Enviar la factura por correo" /></label>
          <Checkbox
            label="Avisos al cliente"
            checked={todosAvisos}
            indeterminate={algunosAvisos && !todosAvisos}
            onChange={(evento) => setAvisos({ correo: evento.target.checked, whatsapp: evento.target.checked })}
          />
          <div className="ml-6 grid">
            <Checkbox label="Por correo" checked={avisos.correo} onChange={(evento) => setAvisos({ ...avisos, correo: evento.target.checked })} />
            <Checkbox label="Por WhatsApp" checked={avisos.whatsapp} onChange={(evento) => setAvisos({ ...avisos, whatsapp: evento.target.checked })} />
          </div>
        </div>

        <FormField label="Notas internas" htmlFor={id('notas')} hint="Solo las ve tu equipo">
          <Textarea id={id('notas')} rows={2} autoCrecer contador maxLength={120} value={notas} onChange={(evento) => setNotas(evento.target.value)} />
        </FormField>

        <div>
          <Checkbox label="El cliente acepta los términos del servicio" checked={terminos} onChange={(evento) => setTerminos(evento.target.checked)} aria-invalid={errorTerminos || undefined} tono={errorTerminos ? 'bad' : 'fono'} />
          {errorTerminos ? <p role="alert" className="text-xs text-bad-text">Falta la aceptación de los términos.</p> : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <AnimatedStatus state={guardado === 'cargando' ? 'loading' : guardado === 'exito' ? 'success' : 'idle'} className={guardado === 'idle' ? 'invisible' : undefined}>
            {guardado === 'cargando' ? 'Guardando…' : guardado === 'exito' ? 'Cliente guardado' : 'Sin cambios'}
          </AnimatedStatus>
          <Button type="submit" cargando={guardado === 'cargando'} exito={guardado === 'exito'} className="min-w-32">Guardar cliente</Button>
        </div>
      </form>

      <form data-forms-flotante noValidate onSubmit={(evento) => evento.preventDefault()} className="mx-auto mt-6 grid max-w-3xl gap-5 rounded-2xl border border-ink-600 bg-ink p-5 sm:p-7">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Etiqueta flotante</h3>
          <p className="mt-1 text-sm text-mute">Opt-in con <code>etiquetaFlotante</code> en <code>FormField</code>: el label descansa dentro del campo y sube al enfocar, al escribir o con autocompletado. Mismas alturas y mismo <code>label for</code>.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField etiquetaFlotante label="Usuario o correo" htmlFor={id('f-usuario')}>
            <Input id={id('f-usuario')} name="username" autoComplete="username" value={flotante.usuario} onChange={(evento) => setFlotante({ ...flotante, usuario: evento.target.value })} />
          </FormField>
          <FormField etiquetaFlotante label="Contraseña" htmlFor={id('f-clave')} hint="El ojo conserva su espacio">
            <PasswordInput id={id('f-clave')} name="password" autoComplete="current-password" value={flotante.clave} onChange={(evento) => setFlotante({ ...flotante, clave: evento.target.value })} />
          </FormField>
          <FormField etiquetaFlotante label="Anticipo" htmlFor={id('f-monto')}>
            <MoneyInput id={id('f-monto')} value={flotante.monto} onValueChange={(valor) => setFlotante({ ...flotante, monto: valor })} className="w-full" />
          </FormField>
          <FormField etiquetaFlotante label="Zona" htmlFor={id('f-zona')}>
            <Select id={id('f-zona')} value={flotante.zona} onChange={(evento) => setFlotante({ ...flotante, zona: evento.target.value })}>
              <option value="centro">Centro</option>
              <option value="norte">Norte</option>
              <option value="sur">Sur</option>
            </Select>
          </FormField>
          <FormField etiquetaFlotante requerido label="Con error" htmlFor={id('f-error')} error="Este campo es obligatorio.">
            <Input id={id('f-error')} defaultValue="" />
          </FormField>
          <FormField etiquetaFlotante label="Con placeholder" htmlFor={id('f-ph')}>
            <Input id={id('f-ph')} placeholder="Ej. Taller San José" />
          </FormField>
        </div>
        <FormField etiquetaFlotante label="Notas" htmlFor={id('f-nota')}>
          <Textarea id={id('f-nota')} rows={2} value={flotante.nota} onChange={(evento) => setFlotante({ ...flotante, nota: evento.target.value })} />
        </FormField>
      </form>
    </section>
    </FormulariosPro>
  )
}
