import { useState } from 'react'
import { Badge, Button, Card, Dot, Input, Label, Select } from './ui.jsx'
import Icon from './Icon.jsx'
import { cn } from '../utils/cn.js'
import {
  agregarEstado,
  conexionDeDestino,
  destinoDeConexion,
  ETIQUETA_ESTADO,
  textoVerificacion,
  TONO_ESTADO,
} from '../printing/estadoImpresoras.js'

// Ajustes de impresión (LAN/USB) funcionales y portables: la app pasa las
// impresoras y los callbacks; el componente pone la lista, el formulario con
// destino `lan:<ip>:<puerto>` o `cups:<cola>`, la verificación y la prueba.
//
//   <AjustesImpresion
//     impresoras={impresoras} estado={estado}
//     onGuardar={(impresora) => api.post('/printers', impresora)}
//     onEliminar={(id) => api.del(`/printers/${id}`)}
//     onProbar={(impresora) => imprimirPrueba(impresora)}
//     onVerificar={() => verificarTodas()} />
//
// Sin API ni agente adentro: eso lo maneja la app (ver docs/IMPRESION.md).

const VACIO = () => ({
  id: null,
  nombre: '',
  ubicacion: '',
  conexion: 'lan',
  ip: '',
  puerto: '9100',
  cola: '',
  ancho: '80',
  copias: '1',
  predeterminada: false,
  activa: true,
})

const ANCHOS = [
  { id: '80', label: '80 mm (térmica)' },
  { id: '58', label: '58 mm (térmica chica)' },
  { id: 'a4', label: 'A4 (láser/inyección)' },
]

function aFormulario(impresora) {
  if (!impresora) return VACIO()
  const conexion = impresora.conexion === 'cups' || conexionDeDestino(impresora.destino) === 'cups' ? 'cups' : 'lan'
  const destino = String(impresora.destino || '')
  const [, ip = '', puerto = '9100'] = destino.match(/^lan:([^:]+):?(\d+)?/) || []
  return {
    ...VACIO(),
    ...impresora,
    conexion,
    ip: impresora.ip || ip,
    puerto: impresora.puerto || puerto || '9100',
    cola: impresora.cola || (destino.startsWith('cups:') ? destino.slice(5) : ''),
    copias: String(impresora.copias ?? '1'),
  }
}

export default function AjustesImpresion({
  impresoras = [],
  estado = {},
  guardando = false,
  probando = null,
  onGuardar,
  onEliminar,
  onProbar,
  onVerificar,
  anchoOpciones = ANCHOS,
  titulo = 'Impresoras',
  descripcion = 'Elegí cómo sale el papel: por red (LAN) o por una cola local (USB). La app verifica cada impresora antes de usarla.',
  className,
}) {
  const [form, setForm] = useState(null)
  const resumen = agregarEstado(impresoras, estado)

  function cambiar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }))
  }

  function enviar(event) {
    event.preventDefault()
    if (!form) return
    const destino = destinoDeConexion(form)
    if (!destino) return
    onGuardar?.({ ...form, destino, copias: Number(form.copias) || 1 })
    setForm(null)
  }

  return (
    <Card className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-semibold"><Icon name="printer" className="h-4 w-4" />{titulo}</h2>
          <p className="mt-1 text-sm text-mute">{descripcion}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={resumen.tono} className="w-fit whitespace-nowrap" title={resumen.detalle}>{resumen.label}</Badge>
          {onVerificar && <Button type="button" variant="outline" onClick={onVerificar}><Icon name="refresh" className="h-3.5 w-3.5" />Verificar</Button>}
          <Button type="button" onClick={() => setForm(VACIO())}><Icon name="plus" className="h-4 w-4" />Agregar impresora</Button>
        </div>
      </div>

      {impresoras.length === 0 && <p className="rounded-xl border border-ink-600 p-4 text-sm text-mute">Todavía no hay impresoras configuradas.</p>}

      <ul className="space-y-2">
        {impresoras.map((impresora) => {
          const registro = estado?.[impresora.id]
          const tono = TONO_ESTADO[registro?.estado] || 'slate'
          return (
            <li key={impresora.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-600 p-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  <Dot color={tono} />
                  {impresora.nombre || 'Impresora'}
                  {impresora.predeterminada && <Badge color="fono">Predeterminada</Badge>}
                  {impresora.activa === false && <Badge color="slate">Inactiva</Badge>}
                </p>
                <p className="mt-0.5 truncate text-xs text-mute" title={impresora.destino}>
                  {conexionDeDestino(impresora.destino) === 'cups' ? 'USB / cola local' : 'LAN'} · {impresora.destino || 'sin destino'} · {impresora.ancho || '80'} mm
                  {registro ? ` · ${textoVerificacion(registro)}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {onProbar && <Button type="button" variant="outline" disabled={probando === impresora.id} onClick={() => onProbar(impresora)}>{probando === impresora.id ? 'Probando…' : 'Imprimir prueba'}</Button>}
                <Button type="button" variant="ghost" onClick={() => setForm(aFormulario(impresora))}>Editar</Button>
                {onEliminar && <Button type="button" variant="ghost" className="text-bad" onClick={() => onEliminar(impresora.id)}>Eliminar</Button>}
              </div>
            </li>
          )
        })}
      </ul>

      {form && (
        <form onSubmit={enviar} className="space-y-3 rounded-xl border border-fono/25 bg-fono/5 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="imp-nombre">Nombre</Label>
              <Input id="imp-nombre" required value={form.nombre} onChange={(event) => cambiar('nombre', event.target.value)} placeholder="Mostrador" />
            </div>
            <div>
              <Label htmlFor="imp-ubicacion">Ubicación (opcional)</Label>
              <Input id="imp-ubicacion" value={form.ubicacion} onChange={(event) => cambiar('ubicacion', event.target.value)} placeholder="Caja 1" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="imp-conexion">Conexión</Label>
              <Select id="imp-conexion" value={form.conexion} onChange={(event) => cambiar('conexion', event.target.value)}>
                <option value="lan">LAN (impresora de red)</option>
                <option value="cups">USB / cola local (CUPS)</option>
              </Select>
            </div>
            {form.conexion === 'lan' ? (
              <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
                <div>
                  <Label htmlFor="imp-ip">IP</Label>
                  <Input id="imp-ip" required value={form.ip} onChange={(event) => cambiar('ip', event.target.value)} placeholder="192.168.1.50" inputMode="decimal" />
                </div>
                <div>
                  <Label htmlFor="imp-puerto">Puerto</Label>
                  <Input id="imp-puerto" value={form.puerto} onChange={(event) => cambiar('puerto', event.target.value.replace(/\D/g, ''))} placeholder="9100" inputMode="numeric" />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="imp-cola">Cola local</Label>
                <Input id="imp-cola" required value={form.cola} onChange={(event) => cambiar('cola', event.target.value)} placeholder="Nombre exacto en el sistema" />
                <p className="mt-1 text-xs text-mute">En Windows/macOS el nombre de la cola es el que ves en Impresoras del sistema.</p>
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="imp-ancho">Ancho de papel</Label>
              <Select id="imp-ancho" value={form.ancho} onChange={(event) => cambiar('ancho', event.target.value)}>
                {anchoOpciones.map((opcion) => <option key={opcion.id} value={opcion.id}>{opcion.label}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="imp-copias">Copias</Label>
              <Input id="imp-copias" value={form.copias} onChange={(event) => cambiar('copias', event.target.value.replace(/\D/g, ''))} inputMode="numeric" maxLength={2} />
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-fono" checked={form.predeterminada} onChange={(event) => cambiar('predeterminada', event.target.checked)} />
              Predeterminada
            </label>
          </div>
          <p className="text-xs text-mute">
            {form.conexion === 'lan'
              ? `Se guardará como lan:${form.ip || '<ip>'}:${form.puerto || '9100'}`
              : `Se guardará como cups:${form.cola || '<cola>'}`}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar impresora'}</Button>
          </div>
        </form>
      )}

      <p className="text-xs text-mute">
        La impresión sale por el <b className="text-fore">agente local</b>: instalalo en la computadora que tiene la impresora
        (LAN o USB conectada) y vinculala con el código. Con el agente caído, los trabajos quedan en cola; nunca se pierden.
        Ver <b className="text-fore">docs/IMPRESION.md</b>.
      </p>
    </Card>
  )
}

export { ETIQUETA_ESTADO }
