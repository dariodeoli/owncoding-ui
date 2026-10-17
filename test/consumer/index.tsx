import { createRef, useState } from 'react'
import {
  BancoCombobox,
  Button,
  CityAutocomplete,
  CurrencyConversion,
  FormField,
  Input,
  Money,
  MoneyInput,
  PercentField,
  ProductFooter,
  ProductPrefooter,
  Select,
  Textarea,
  crearIdentidadApp,
} from 'owncoding-ui'
import { resolveInstitution, resolveLocality, INSTITUTIONS_PARAGUAY, LOCALITIES_PARAGUAY, formatGs } from 'owncoding-ui/utils'
import { IAError, motorIA } from 'owncoding-ui/ia'
import { PhoneField, telefonoE164 } from 'owncoding-ui/phone'
import { BancoLogo, MedioPagoLogo } from 'owncoding-ui/financial'
import {
  LOGOS_BANCOS,
  logoDeBanco,
  relacionFinancieraDe,
  sugerenciasDeMarcaPago,
  type RelacionFinanciera,
} from 'owncoding-ui/financial-metadata'
import { compararVersiones } from 'owncoding-ui/app-identity'
import { crearCorreoTransaccional, renderCorreoHtml } from 'owncoding-ui/email'

const identidad = crearIdentidadApp({ nombre: 'Consumer', version: '1.2.3' })
const correo = crearCorreoTransaccional({ identidad, asunto: 'Aviso', motivo: 'Contenido' })
resolveInstitution(INSTITUTIONS_PARAGUAY[0].id).record?.name
resolveLocality(LOCALITIES_PARAGUAY[0].id).record?.department
formatGs(1_000)
telefonoE164('+595981123456', 'PY')
compararVersiones('1.0.0', '1.0.1')
renderCorreoHtml(correo)
logoDeBanco('ueno bank')
LOGOS_BANCOS['ueno bank']
const relacion: RelacionFinanciera | null = relacionFinancieraDe('Mango')
relacion?.operador.nombreLegal
sugerenciasDeMarcaPago('Banco Familiar')
IAError
motorIA({ esquema: { tipos: [] } })

export function ConsumerFixture() {
  const [valor, setValor] = useState('')
  const ref = createRef<HTMLInputElement>()
  const selectRef = createRef<HTMLSelectElement>()
  return (
    <>
      <CurrencyConversion originalAmount="1.25" originalCurrency="EUR" convertedAmount={6.75} convertedCurrency="BRL" rate={5.4} source="Fixture" asOf="2026-10-07T12:00:00Z" status="stale" locale="de-DE" labels={{ stale: 'Veraltet' }} />
      <Money value={null} currency="BRL" locale="pt-BR" numberFormatOptions={{ maximumFractionDigits: 4 }} />
      <MoneyInput ref={ref} value={1000} onValueChange={(monto) => String(monto)} />
      <Select ref={selectRef} cargando estado="ok" motion={false}><option>a</option></Select>
      <Input inicio="https://" fin={<span>.com</span>} cargando estado="ok" />
      <Textarea autoCrecer contador maxLength={100} />
      <FormField etiquetaFlotante requerido label="Usuario" htmlFor="usuario"><Input id="usuario" /></FormField>
      <Button cargando exito motion={false}>Guardar</Button>
      <PercentField value={valor} onChange={setValor} onValueChange={setValor} />
      <BancoCombobox value={valor} onChange={setValor} onSelect={setValor} onIdentitySelect={result => setValor(result.record?.id || '')} />
      <CityAutocomplete value={valor} onChange={setValor} onSelect={(ciudad, departamento) => setValor(`${ciudad}${departamento || ''}`)} onIdentitySelect={result => setValor(result.record?.id || '')} />
      <PhoneField onChange={setValor} onInternationalChange={(e164, meta) => setValor(e164 || meta.phone)} />
      <BancoLogo banco="ueno bank" variante="compacto" />
      <MedioPagoLogo marca="upay" variante="horizontal" />
      <ProductPrefooter modelo="accion" accion={{ titulo: 'Ayuda', enlace: { href: '/ayuda', etiqueta: 'Abrir' } }} />
      <ProductFooter identidad={identidad} enlaces={[{ href: '/legal', etiqueta: 'Legal' }]} />
    </>
  )
}

// Controlled reusable patterns: selection setters must remain type-safe.
import { Combobox, AsyncButton, Popover, Tooltip, NotificationCenter, FooterPreset, CopyButton, ActionToolbar, CloseButton, AppHeader, PublicHeader, ProfileCard, UserMenu, AccountSwitcher, useToast } from 'owncoding-ui'
export function ReusableConsumer() {
  const [team, setTeam] = useState<string | null>(null)
  const [teams, setTeams] = useState<string[]>([])
  const toast = useToast()
  const items = [{ id: 'demo', label: 'Demo' }]
  return <>
    <Combobox items={items} value={team} onChange={setTeam} />
    <Combobox multiple items={items} value={teams} onChange={setTeams} />
    <AsyncButton action={async () => toast.promise(Promise.resolve('demo'), { success: result => result })}>Guardar</AsyncButton>
    <Popover label="Ayuda" trigger="Abrir"><CloseButton /></Popover>
    <Tooltip trigger="Info">Ayuda</Tooltip>
    <NotificationCenter items={[{ id: '1', title: 'Demo', read: false }]} onMarkAllRead={() => {}} />
    <FooterPreset name="Demo" variant="public" links={[{ href: '/help', etiqueta: 'Ayuda' }]} />
    <ActionToolbar><CopyButton text="demo" /></ActionToolbar>
    <AppHeader title="Demo" /><PublicHeader title="Demo" />
    <ProfileCard name="Demo" /><UserMenu name="Demo" items={[{ label: 'Perfil', onClick: () => {} }]} />
    <AccountSwitcher accounts={items} value={team ?? undefined} onChange={setTeam} />
  </>
}

import { AnimatedStatus, MotionSurface } from 'owncoding-ui'
const motionContracts = <><AnimatedStatus state="loading" motion={false}>Saving</AnimatedStatus><MotionSurface hover press elevation><button disabled>Save</button></MotionSurface></>
void motionContracts

import { OtpVerification } from 'owncoding-ui'
const otpContract = <OtpVerification value="123456" onChange={() => {}} onVerify={code => { void code }} secondsRemaining={30} motion={false} />
void otpContract

import { Carousel } from 'owncoding-ui'
const carouselContract = <Carousel slides={[{ id: 'first', label: 'First', content: <p>Content</p> }]} index={0} onIndexChange={() => {}} motion={false} />
void carouselContract
import { CartSummary } from 'owncoding-ui'
const cartContract = <CartSummary items={[{ id: 'sample', label: 'Sample', quantity: 1, amount: 10 }]} total={10} onQuantityChange={(id: string, quantity: number) => {}} />
void cartContract

import { ProductVariantSelector } from 'owncoding-ui'
const variantContract = <ProductVariantSelector groups={[]} variants={[]} value={{}} onChange={(value: Record<string, string>) => {}} />
void variantContract

import { PricingCard } from 'owncoding-ui'
const pricingContract = <PricingCard title="Sample" price={100} features={[{ id: 'reports', label: 'Reports', included: true }]} onSelect={() => {}} />
void pricingContract
import { RucField, createOwnDataRucProvider, mapOwnDataRucResponse, mapOwnDataRucError } from 'owncoding-ui'
import { createOwnDataRucProvider as serverOwnDataProvider } from 'owncoding-ui/utils'
const ownDataProvider = createOwnDataRucProvider({ lookup: async () => ({}) })
const ownDataField = <RucField maxBaseDigits={9} value="80012345-6" onChange={() => {}} consultar={ownDataProvider} onAplicar={result => { const source: string = result.ownData.provenance.source; void source }} />
void ownDataField; void serverOwnDataProvider; void mapOwnDataRucResponse; void mapOwnDataRucError

// Shell para paneles: enlaces en NavLateral, SelectorEspacio y paleta sobria.
import { Avatar, NavLateral, SelectorEspacio, colorDeNombre } from 'owncoding-ui'
const EnlaceDemo = (props: { href: string; children?: React.ReactNode }) => <a {...props} />
const shellPanelContract = <>
  <NavLateral items={[{ id: 'a', label: 'Inicio', href: '/', chip: 'Próximamente' }]} componenteEnlace={EnlaceDemo} tactil activeId="a" />
  <SelectorEspacio espacios={[{ id: 'a', nombre: 'Acme', detalle: 'Propietario', avatar: null }]} valor="a" onCambiar={(id: string) => { void id }} acciones={[{ label: 'Crear empresa', onClick: () => {} }]} estado="listo" onReintentar={() => {}} cambiando={false} />
  <SelectorEspacio espacios={[{ id: 'p', nombre: 'Ana', detalle: 'Personal', forma: 'redondo' }]} valor="p" locale="en" textos={{ reintentar: 'Try again' }} mostrarDetalle formaAvatar="redondo" lado="arriba" />
  <NavLateral items={[{ id: 'a', label: 'Home' }]} locale="en" textos={{ expandir: 'Open', mostrarGrupo: 'Show {titulo}' }} />
  <Avatar nombre="Acme" paleta="sobria" />
</>
const claseSobria: string = colorDeNombre('Acme', 'sobria')
void shellPanelContract
void claseSobria

// Callbacks de impresión con el mismo constructor en root y utils.
import { paginaDePrueba } from 'owncoding-ui'
import { paginaDePruebaSimple } from 'owncoding-ui/utils'
paginaDePrueba({ encabezado: t => t.negrita().centrado('MobOS').negrita(false), pie: t => t.texto('Gracias') })
paginaDePruebaSimple({ pie: t => t.imagenRaster(new Uint8Array(8), { ancho: 8, alto: 8 }) })
// @ts-expect-error El callback recibe el constructor ESC/POS, no una cadena.
paginaDePrueba({ encabezado: (ticket: string) => ticket.toUpperCase() })

import { BuscadorProveedor } from 'owncoding-ui'
const supplierContracts = <BuscadorProveedor value="Libre" onLibre={(texto: string) => void texto} confirmarAlSalir confirmarAlTipear />
const compactRucContract = <RucField value="80012345-6" onChange={() => {}} variante="compacta" onDescartar={() => {}} />
void supplierContracts; void compactRucContract

const supplierFormattedContract = <BuscadorProveedor selectedId="p1" value="p1" formatearValor={proveedor => [proveedor.code, proveedor.name || proveedor.nombre].filter(Boolean).join(' · ')} onSelect={proveedor => void proveedor.id} confirmarAlSalir onLibre={texto => void texto} />
void supplierFormattedContract

import { Modal, Drawer, DialogMobileSafety, useDialogMobileSafety } from 'owncoding-ui'
export function MobileSafeConsumer() {
  const ref = createRef<HTMLDivElement>()
  const enabled = useDialogMobileSafety(false, ref, { enabled: true, topmost: true })
  return <DialogMobileSafety><Modal open={false} mobileSafe title="Formulario" /><Drawer open={false} mobileSafe={false} /><div ref={ref} role="dialog" data-oc-mobile-safety={String(enabled)} /></DialogMobileSafety>
}

// Piloto RAW: refs nativos/eventos originales y subpaths tipados reales.
import {InputBase, TextareaBase, NumericControl, NumberInput, PercentageInput} from 'owncoding-ui'
import {NumericControl as NumericSubpath, type NumberInputProps} from 'owncoding-ui/numeric'
import {numberInputProblem, numberInputValid, nativeNumberSettings, type NumberRules} from 'owncoding-ui/number-utils'
export function NumericConsumer() {
  const [value, setValue] = useState('')
  const input = createRef<HTMLInputElement>()
  const textarea = createRef<HTMLTextAreaElement>()
  const rules: NumberRules = {min: '-1.25', step: '0.01', precision: 2}
  const props: NumberInputProps = {value, onChange: setValue, policy: 'decimal'}
  numberInputProblem(value, 'decimal')
  numberInputValid(value, 'decimal', rules)
  return <>
    <InputBase ref={input} onChange={event => setValue(event.currentTarget.value)} pending describedBy="hint" />
    <TextareaBase ref={textarea} onChange={event => setValue(event.currentTarget.value)} invalid />
    <NumericControl ref={input} policy="integer" defaultValue="10" onChange={event => setValue(event.currentTarget.value)} />
    <NumericSubpath {...nativeNumberSettings({min: '0.2'})} ref={input} notation="native" />
    <NumberInput {...props} ref={input} />
    <PercentageInput ref={input} policy="ratio" value={value} onChange={setValue} />
  </>
}
// @ts-expect-error El facade string no fabrica eventos nativos.
const invalidNumericCallback = <NumberInput policy="decimal" value="" onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}} />
// @ts-expect-error El ref apunta a un input, no a un contenedor.
const invalidNumericRef = <NumericControl policy="integer" ref={createRef<HTMLDivElement>()} />
void invalidNumericCallback; void invalidNumericRef

// The opt-in surface preserves every existing root signature.
import * as core from 'owncoding-ui/core'
import * as compatibleRoot from 'owncoding-ui'
import type {ButtonProps as CoreButtonProps} from 'owncoding-ui/core'
const coreCompatibility: Pick<typeof compatibleRoot, keyof typeof core> = core
const coreButtonProps: CoreButtonProps = {children: 'Guardar', type: 'button'}
coreCompatibility.Button(coreButtonProps)
// @ts-expect-error Financial artwork is deliberately absent from the opt-in entry.
core.BancoLogo
