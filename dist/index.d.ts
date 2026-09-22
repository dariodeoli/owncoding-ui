// Tipos de OwnCoding UI (declaraciones escritas a mano, sin TypeScript en el
// paquete). Cubren la superficie que las apps usan de verdad: los objetos de
// los lotes LedBox/lote 2, los campos, los estados, las tablas y el dinero.
// Un objeto sin props documentadas se declara con índices abiertos: se puede
// usar igual y las props se van tipando cuando la app las adopta.
//
// Los `.d.ts` son solo del consumidor: el paquete sigue distribuyéndose en
// JS/JSX. Build: `scripts/build.mjs` copia este archivo a `dist/index.d.ts`.

import type {
  ButtonHTMLAttributes,
  ForwardRefExoticComponent,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
  RefAttributes,
  SelectHTMLAttributes,
  SVGProps,
  TextareaHTMLAttributes,
} from 'react'

/** Tono semántico canónico del mapa compartido (`utils/tonos.js`). */
export type TonoCanonico = 'ok' | 'warn' | 'bad' | 'mute' | 'info' | 'pass' | 'fono'
/** Tono aceptado por los objetos: canónico o alias de otras apps. */
export type Tono = TonoCanonico | 'neutral' | 'neutro' | 'accent' | 'acento' | 'danger' | 'error' | 'success' | 'warning' | (string & {})
/** Moneda de los montos del sistema. */
export type Moneda = 'PYG' | 'USD' | 'BRL' | 'EUR' | 'USDT' | (string & {})
/** Vistas de tablero/lista. */
export type Vista = 'lista' | 'tablero' | (string & {})

// ── Primitivas y contenedores ───────────────────────────────────────────────

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'success' | 'danger' | 'outline' | 'ghost'
}
export function Button(props: ButtonProps): ReactElement

export type InputProps = InputHTMLAttributes<HTMLInputElement>
export const Input: ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>

export function PasswordInput(props: InputProps): ReactElement

export function PinInput(props: {
  value: string
  onChange: (value: string) => void
  onComplete?: () => void
  length?: number
  autoFocus?: boolean
  disabled?: boolean
  inputRef?: Ref<HTMLInputElement>
  ariaLabel?: string
  className?: string
  id?: string
}): ReactElement

export const MoneyInput: ForwardRefExoticComponent<
  Omit<InputProps, 'value' | 'onChange'> & {
    currency?: Moneda
    /** Pisa el prefijo del campo (por defecto el de `SIMBOLOS_MONEDA`). */
    symbol?: string
    value: number | string | null
    onValueChange?: (value: number | '' | string) => void
    max?: number
    maxLength?: number
  } & RefAttributes<HTMLInputElement>
>

export function Money(props: { value: number | string | null | undefined; currency?: Moneda; simbolo?: string; className?: string }): ReactElement

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>
export function Select(props: SelectProps): ReactElement
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>
export function Textarea(props: TextareaProps): ReactElement
export type LabelProps = HTMLAttributes<HTMLLabelElement>
export function Label(props: LabelProps): ReactElement
export function Eyebrow(props: HTMLAttributes<HTMLDivElement>): ReactElement
export function Card(props: HTMLAttributes<HTMLDivElement>): ReactElement

export type TamanoModal = 'corto' | 'formulario' | 'amplio' | 'completo'
export function Modal(props: { open: boolean; onClose?: () => void; title?: ReactNode; children?: ReactNode; size?: TamanoModal; className?: string }): ReactElement | null
export function ConfirmDialog(props: {
  open: boolean
  onCancel?: () => void
  onConfirm?: () => void
  title?: string
  description?: ReactNode
  confirmLabel?: string
  variant?: 'primary' | 'danger' | 'success' | 'outline' | 'ghost'
  busy?: boolean
}): ReactElement

export function Badge(props: HTMLAttributes<HTMLSpanElement> & { color?: 'blue' | 'green' | 'red' | 'orange' | 'yellow' | 'slate' }): ReactElement
export function Dot(props: { color?: 'green' | 'red' | 'blue' | 'slate' | 'orange'; pulse?: boolean; className?: string }): ReactElement
export function IconAction(props: { icon: string; label: string; tone?: Tono; onClick?: () => void; disabled?: boolean }): ReactElement
export function Drawer(props: { open: boolean; onClose?: () => void; title?: ReactNode; children?: ReactNode; side?: 'left' | 'right'; className?: string }): ReactElement | null
export function ToastProvider(props: { children?: ReactNode; demo?: boolean }): ReactElement
export function useToast(): { success: (title: string, description?: string) => void; error: (title: string, description?: string) => void; info: (title: string, description?: string) => void }
export function Skeleton(props: { className?: string }): ReactElement
export function EmptyState(props: { icon?: string; title?: ReactNode; description?: ReactNode; action?: ReactNode; compact?: boolean; className?: string }): ReactElement
export function ErrorState(props: { title?: string; description?: ReactNode; onRetry?: () => void }): ReactElement
export function Aviso(props: HTMLAttributes<HTMLElement> & { tono?: 'error' | 'ok' | 'warn'; como?: 'p' | 'div'; compact?: boolean }): ReactElement
export function Nota(props: HTMLAttributes<HTMLElement> & { tono?: 'warn' | 'info' | 'neutro'; como?: 'p' | 'div'; compact?: boolean }): ReactElement
export function PageHeader(props: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; backTo?: () => void; eyebrow?: ReactNode }): ReactElement
export function FormField(props: { label?: ReactNode; hint?: ReactNode; error?: ReactNode; children?: ReactNode; htmlFor?: string }): ReactElement

export type DataTableColumn<Row = Record<string, unknown>> = {
  key: string
  label: ReactNode
  align?: 'left' | 'right' | 'center'
  render?: (row: Row) => ReactNode
}
export function DataTable<Row = Record<string, unknown>>(props: {
  columns: DataTableColumn<Row>[]
  rows: Row[]
  emptyLabel?: string
  loading?: boolean
  mobileCard?: (row: Row) => ReactNode
  className?: string
}): ReactElement

export function Stat(props: { label?: ReactNode; valor?: ReactNode; delta?: number; sub?: ReactNode; nota?: ReactNode; tono?: Tono; destacado?: boolean; className?: string }): ReactElement
export function Subtabs(props: { value: string; onChange: (id: string) => void; items?: Array<[string, ReactNode]>; className?: string }): ReactElement | null
export function FilaDato(props: {
  etiqueta?: ReactNode
  valor?: ReactNode
  tono?: '' | Tono
  etiquetaComo?: 'span' | 'dt'
  valorComo?: 'span' | 'dd'
  className?: string
  valorClassName?: string
  children?: ReactNode
}): ReactElement
export function CeldaMoneda(props: { valor?: number | string | null; tono?: '' | Tono; currency?: Moneda; simbolo?: string; className?: string; children?: ReactNode }): ReactElement
export function BarraProgreso(props: {
  valor?: number
  max?: number
  tono?: 'fono' | 'ok' | 'warn' | 'bad' | 'mute' | 'onbrand'
  alto?: 'sm' | 'md' | 'lg'
  etiqueta?: string
  pista?: string
  relleno?: string
  className?: string
}): ReactElement

// ── Íconos ─────────────────────────────────────────────────────────────────

export const ICONOS: string[]
export function Icon(props: { name: string; className?: string } & SVGProps<SVGSVGElement>): ReactElement | null

// ── Campos ─────────────────────────────────────────────────────────────────

export function Switch(props: { checked?: boolean; onChange?: (event: any) => void; disabled?: boolean; id?: string; ariaLabel?: string; className?: string }): ReactElement
export const SearchField: ForwardRefExoticComponent<
  Omit<InputProps, 'value' | 'onChange'> & { value?: string; onChange?: (event: any) => void; onClear?: () => void; ariaLabel?: string } & RefAttributes<HTMLInputElement>
>
export function BotonDentroCampo(props: { etiqueta: string; onClick?: () => void; icono?: string; ocupado?: boolean; disabled?: boolean; className?: string }): ReactElement
export function SegmentedField(props: { value: string; onChange: (id: string) => void; options?: Array<[string, ReactNode, string?, number?]>; ariaLabel?: string; className?: string }): ReactElement | null
export function PercentField(props: Omit<InputProps, 'value' | 'onChange'> & { value?: string; onValueChange?: (value: string) => void; className?: string }): ReactElement
export function parsePercent(valor: unknown): number | null
export function formatPercent(numero: unknown): string
export function limpiarPercent(valor: unknown): string
export function CurrencySelect(props: SelectProps & { excluir?: string[] }): ReactElement
export function ListGridToggle(props: { value: 'list' | 'grid' | (string & {}); onChange: (value: string) => void; className?: string }): ReactElement
export function EmailField(props: Omit<InputProps, 'onChange'> & { value?: string; onChange?: (event: any) => void; dominios?: string[]; sugerir?: boolean }): ReactElement
export const DOMINIOS_EMAIL: string[]
export function sugerenciasDe(valor: string, dominios?: string[]): string[]
export function PhoneField(props: Record<string, any> & { value?: string; onChange?: (valor: string) => void; className?: string }): ReactElement
export function parseTelefono(valor: string): { codigo: string; numero: string; local?: string }
export function componerTelefono(codigo: string, numero: string): string
export const CODIGOS_PAIS: Array<{ codigo: string; pais: string; bandera?: string }>
export function SerialField(props: Omit<InputProps, 'onChange'> & { value?: string; onChange?: (event: any) => void; normalizar?: (valor: string) => string }): ReactElement
export function normalizarSerial(valor: string): string
export function InstagramField(props: Omit<InputProps, 'onChange'> & { value?: string; onChange?: (event: any) => void }): ReactElement
export function normalizarInstagram(valor: string): string

// ── Acceso y shell ─────────────────────────────────────────────────────────

export function GoogleButton(props: Record<string, any> & { onClick?: () => void; texto?: string; className?: string }): ReactElement
export function GoogleMark(props: { className?: string }): ReactElement
export function OAuthDivider(props: { texto?: string; className?: string }): ReactElement
export function AuthLayout(props: Record<string, any> & { children?: ReactNode; className?: string }): ReactElement
export function ProductFooter(props: Record<string, any> & { className?: string }): ReactElement
export function LoadingScreen(props: { label?: string; logo?: ReactNode; className?: string }): ReactElement
export function PegarEnlaceToken(props: Record<string, any> & { onToken?: (token: string) => void }): ReactElement
export const NavLateral: ForwardRefExoticComponent<
  {
    items?: Array<{ id: string; label?: ReactNode; etiqueta?: ReactNode; icono?: string; contador?: number; href?: string; roles?: string[]; [clave: string]: any }>
    activo?: string
    colapsado?: boolean
    onNavegar?: (item: any) => void
    onToggle?: (colapsado: boolean) => void
    logo?: ReactNode
    className?: string
  } & Record<string, any>
>
export function MenuDesplegable(props: Record<string, any> & { etiqueta?: ReactNode; items?: any[]; className?: string }): ReactElement

// ── Ajustes, impresión y bancos ────────────────────────────────────────────

export function PanelDerecho(props: Record<string, any> & { children?: ReactNode; formulario?: ReactNode; className?: string }): ReactElement
export function TarjetaAjuste(props: Record<string, any> & { titulo?: ReactNode; descripcion?: ReactNode; accion?: ReactNode; children?: ReactNode }): ReactElement
export function AjustesImpresion(props: Record<string, any> & { impresoras?: any[]; onGuardar?: (ajustes: any) => void }): ReactElement
export function BotonImprimir(props: Record<string, any> & { onImprimir?: () => void; etiqueta?: string }): ReactElement
export function BancoCombobox(props: Record<string, any> & { value?: string; onChange?: (valor: string) => void; onSelect?: (banco: any) => void }): ReactElement
export function BancoLogo(props: Record<string, any> & { banco?: string; logo?: string | null; className?: string }): ReactElement
export function CityAutocomplete(props: Record<string, any> & { value?: string; onSelect?: (ciudad: string, departamento?: string) => void; onChange?: (valor: string) => void }): ReactElement

// ── Clases de tabla ────────────────────────────────────────────────────────

export const ROTULO_DATO: string
export const CELDA_ENCABEZADO: string
export const ROTULO_SECCION: string
export const CELDA_DATO: string
export const CELDA_NUMERO: string
export const CELDA_IDENTIDAD: string
export const CELDA_IDENTIDAD_GRANDE: string

// ── Estados de equipos ─────────────────────────────────────────────────────

export type EstadoChipConfig = { etiqueta: string; tono: TonoCanonico; icono: string }
export const ESTADOS_ITEM: Record<string, EstadoChipConfig>
export const ESTADOS_CHIP: Record<string, EstadoChipConfig>
export const ESTADOS_LOCK: Record<string, EstadoChipConfig>
export const LOCKS_DISPOSITIVO: Record<string, string>
export const GRADOS_CONDICION: Record<string, { etiqueta: string; tono: TonoCanonico; descripcion: string }>
export const COLOR_BADGE: Record<string, string>
export const UMBRAL_BATERIA_OK: number
export const UMBRAL_BATERIA_ATENCION: number
export function estadoItem(clave: string): EstadoChipConfig
export function estadoChip(clave: string): EstadoChipConfig
export function estadoLock(clave: string): EstadoChipConfig
export function gradoCondicion(clave: string): { etiqueta: string; tono: TonoCanonico; descripcion: string } | null
export function colorBadge(tono: string): string
export function tonoBateria(porcentaje: number | string | null | undefined): TonoCanonico

export function SemaforoItem(props: { estado?: 'ok' | 'aviso' | 'falla' | 'sinVerificar' | (string & {}); etiqueta: string; detalle?: ReactNode; como?: 'li' | 'div'; className?: string }): ReactElement
export function FilaChecklist(props: { etiqueta: ReactNode; estado?: string; nota?: ReactNode; accion?: ReactNode; className?: string }): ReactElement
export function ConteoChecklist(props: { pasan?: number; total?: number; fallas?: number; sustantivo?: string; className?: string }): ReactElement
export function ChipEstado(props: { estado?: string; etiqueta?: ReactNode; icono?: string; tono?: Tono; title?: string; className?: string }): ReactElement
export function ChipsLocks(props: { locks?: Array<{ clave: string; estado: string; etiqueta?: string; detalle?: string }>; conEstado?: boolean; className?: string }): ReactElement
export function MedidorBateria(props: { porcentaje?: number | null; ciclos?: number | null; etiqueta?: string; variante?: 'barra' | 'chip'; compact?: boolean; className?: string }): ReactElement
export function GradoBadge(props: { grado: string; conDescripcion?: boolean; className?: string }): ReactElement
export function TileEquipo(props: Record<string, any> & { modelo?: string; imei?: string; detalle?: ReactNode; foto?: string; estado?: string; grado?: string; bateria?: number | null; ciclos?: number | null; locks?: any[]; acciones?: ReactNode; onOpen?: () => void }): ReactElement
export function Stepper(props: { pasos?: Array<{ id: string; etiqueta: ReactNode; detalle?: ReactNode }>; actual?: string; hechos?: string[]; className?: string }): ReactElement
export function CodigoQr(props: { valor?: string; ancho?: number; nivel?: string; margen?: number; alt?: string; className?: string }): ReactElement | null
export const QR_OPCIONES: { ancho: number; nivel: string; margen: number }
export function qrDataUrl(valor: string, opciones?: { ancho?: number; nivel?: string; margen?: number }): Promise<string>
export function FichaCertificado(props: Record<string, any> & {
  empresa?: string
  modelo?: string
  imei?: string
  grado?: string
  bateria?: number | null
  ciclos?: number | null
  locks?: any[]
  aprobados?: number
  total?: number
  verificadoPor?: string
  verificadoAt?: string
  enlace?: string
  etiquetaQr?: string
  acciones?: ReactNode
  className?: string
}): ReactElement

// ── Categorías de producto ─────────────────────────────────────────────────

export function IconoCategoria(props: { categoria?: string; icono?: string; className?: string }): ReactElement | null
export const GLIFOS_CATEGORIA: Record<string, string>
export const CATEGORIAS_PRODUCTO: Array<{ id?: string; etiqueta: string; icono: string; alias?: string[] }>
export const ICONO_CATEGORIA: Record<string, string>
export function normalizarCategoria(texto: string): string
export function categoriaDe(texto: string): string
export function iconoDeCategoria(texto: string): string
export function etiquetaDeCategoria(texto: string): string

// ── Agenda, filtros, shell e identidad (lote 2) ────────────────────────────

export type ItemCalendario = { id: string; fecha: string; titulo: ReactNode; hora?: string; detalle?: ReactNode; tono?: Tono; href?: string }
export function Calendario(props: {
  items?: ItemCalendario[]
  vistas?: Array<'mes' | 'semana' | (string & {})>
  vista?: string
  vistaPorDefecto?: string
  onCambiarVista?: (vista: string) => void
  ancla?: string
  anclaPorDefecto?: string
  onCambiarPeriodo?: (ancla: string, rango: { desde: string; hasta: string }) => void
  diaSeleccionado?: string
  onSeleccionarDia?: (dia: string) => void
  onElegirItem?: (item: ItemCalendario) => void
  renderItem?: (item: ItemCalendario, contexto: { vista: string; dia: string }) => ReactNode
  maxPorDia?: number
  cargando?: boolean
  mostrarDetalle?: boolean
  hoy?: string
  className?: string
}): ReactElement
export const DIAS_SEMANA: string[]
export function esClaveDia(valor: unknown): boolean
export function claveDia(fecha: Date | string): string
export function fechaDeClave(clave: string): Date | null
export function hoyClave(): string
export function sumarDias(clave: string, dias: number): string
export function sumarMeses(clave: string, meses: number): string
export function indiceSemana(clave: string): number
export function rangoSemana(clave: string): { desde: string; hasta: string; dias: string[] }
export function rangoMes(clave: string): { desde: string; hasta: string; dias: string[] }
export function mismoMes(a: string, b: string): boolean
export function etiquetaMes(clave: string): string
export function etiquetaDia(clave: string): string
export function etiquetaDiaCorta(clave: string): string
export function agruparPorDia(items: ItemCalendario[], claveDe?: (item: ItemCalendario) => string): Map<string, ItemCalendario[]>

export function RangoFecha(props: {
  desde?: string
  hasta?: string
  onCambio?: (desde: string, hasta: string) => void
  desdePorDefecto?: string
  hastaPorDefecto?: string
  periodoPorDefecto?: string
  atajos?: string[]
  hoy?: string
  mostrarCampos?: boolean
  className?: string
}): ReactElement
export const PERIODOS_FECHA: string[]
export const ETIQUETA_PERIODO: Record<string, string>
export function esAtajo(periodo: string): boolean
export function rangoDePeriodo(periodo: string, hoy?: string): { desde: string; hasta: string }
export function periodoDeRango(desde: string, hasta: string, hoy?: string): string | null
export function rangoInvertido(desde: string, hasta: string): boolean

export function PaletaComandos(props: {
  abierta?: boolean
  onAbrir?: () => void
  onCerrar?: () => void
  buscar?: (consulta: string) => Promise<any[]> | any[]
  onElegir?: (resultado: any) => void
  etiquetasTipo?: Record<string, string>
  iconosTipo?: Record<string, string>
  atajo?: string
  atajoTexto?: string
  conAtajo?: boolean
  minimo?: number
  espera?: number
  boton?: boolean
  textoBoton?: string
  className?: string
}): ReactElement
export function agruparResultados(resultados: any[]): Array<{ tipo: string; resultados: any[] }>
export function estadoPaleta(props: { consulta?: string; cargando?: boolean; error?: unknown; resultados?: any[]; minimo?: number }): string
export function AyudaModulo(props: { titulo?: ReactNode; resumen?: ReactNode; puntos?: ReactNode[]; enlaces?: Array<{ href: string; etiqueta: ReactNode; onClick?: () => void }>; abierta?: boolean; onAbrir?: () => void; onCerrar?: () => void; className?: string }): ReactElement | null
export function BarraInferior(props: { items?: Array<{ id: string; etiqueta: ReactNode; icono?: string; href?: string }>; activo?: string; onSelect?: (item: any) => void; onMas?: () => void; masEtiqueta?: string; menuAbierto?: boolean; menuId?: string; maxItems?: number; className?: string }): ReactElement | null
export const ESPACIO_BARRA_INFERIOR: string
export function Avatar(props: { nombre?: string; src?: string | null; tamano?: 'sm' | 'md' | 'lg'; forma?: 'redondo' | 'cuadrado'; empresa?: boolean | string; title?: string; ariaLabel?: string; decorativo?: boolean; className?: string }): ReactElement
export const TAMANOS_AVATAR: Record<string, string>
export const COLORES_AVATAR: Record<string, string>
export function inicialesDeNombre(nombre: string): string
export function claveColorDeNombre(nombre: string): string
export function colorDeNombre(nombre: string): string

export function ImporteDelta(props: { valor?: number | string | null; moneda?: Moneda; formato?: 'moneda' | 'porcentaje'; invertir?: boolean; vacio?: string; simbolo?: string; className?: string }): ReactElement
export function tonoDelta(valor: unknown, opciones?: { invertir?: boolean }): TonoCanonico
export function IndicadorConexion(props: { enLinea?: boolean; pendientes?: number; sincronizando?: boolean; onSincronizar?: () => void; className?: string }): ReactElement
export function CampanaAvisos(props: Record<string, any> & { avisos?: any[]; onAbrir?: (abierta: boolean) => void; onElegir?: (aviso: any) => void; pie?: ReactNode; anclaje?: string; className?: string }): ReactElement
export function contarSinLeer(avisos?: any[]): number
export function textoContador(total: number): string
export function GraficoBarras(props: { datos?: Array<{ etiqueta: ReactNode; valor: number; tono?: Tono }>; max?: number; orientacion?: 'vertical' | 'horizontal'; altura?: number; tono?: Tono; formatoValor?: (valor: number) => ReactNode; etiqueta?: string; mostrarValores?: boolean; className?: string }): ReactElement
export function maximoDeBarras(datos: Array<{ valor: number }>, max?: number): number
export function porcentajeBarra(valor: number, max: number): number

// ── Pipeline, documentos y avance (lote LedBox) ────────────────────────────

export type ColumnaTablero = { valor: string; titulo: ReactNode; tono?: Tono }
export type TarjetaTablero = {
  id: string
  estado: string
  titulo: ReactNode
  subtitulo?: ReactNode
  chips?: Array<{ etiqueta: ReactNode; tono?: Tono }>
  monto?: number | string | null
  montoNota?: ReactNode
  fecha?: string | Date | null
  detalle?: ReactNode
  acciones?: ReactNode
  destinos?: string[]
}
export function TableroKanban(props: {
  etiqueta?: string
  columnas?: ColumnaTablero[]
  tarjetas?: TarjetaTablero[]
  puedeMover?: boolean
  etiquetaMover?: string
  textoVacio?: string
  onMover?: (id: string, destino: string) => { ok: boolean } | Promise<{ ok: boolean }> | void
  onError?: (mensaje: string) => void
  className?: string
}): ReactElement
export function useTableroOptimista(props: { tarjetas?: TarjetaTablero[]; onMover?: (id: string, destino: string) => any; onError?: (mensaje: string) => void }): {
  tarjetas: TarjetaTablero[]
  moviendo: string | null
  mover: (id: string, destino: string) => Promise<void>
}
export function columnasDelTablero(columnas: ColumnaTablero[], tarjetas: TarjetaTablero[]): Array<ColumnaTablero & { tarjetas: TarjetaTablero[] }>
export function agruparTarjetas(columnas: ColumnaTablero[], tarjetas: TarjetaTablero[]): Record<string, TarjetaTablero[]>
export function destinosDeTarjeta(tarjeta: TarjetaTablero): string[]

export type Hito = { id: string; fecha: string | Date; tipo: string; titulo: ReactNode; detalle?: ReactNode; actor?: string; tono?: Tono; icono?: string }
export function Cronologia(props: {
  hitos?: Hito[]
  iconos?: Record<string, string>
  tonos?: Record<string, Tono>
  etiquetas?: Record<string, string>
  agrupar?: boolean
  mostrarTipo?: boolean
  etiqueta?: string
  vacioTitulo?: string
  vacioDetalle?: string
  className?: string
}): ReactElement
export const ICONOS_HITO: Record<string, string>
export const TONOS_HITO: Record<string, Tono>
export const ETIQUETAS_HITO: Record<string, string>
export function etiquetaDeHito(tipo: string, etiquetas?: Record<string, string>): string
export function agruparHitos(hitos: Hito[]): Array<{ clave: string; etiqueta: string; hitos: Hito[] }>

export function PlanPagos(props: {
  anticipo?: number
  anticipoEtiqueta?: string
  anticipoVence?: string | Date | null
  cuotas?: Array<{ id?: string; etiqueta: ReactNode; monto: number; vence?: string | Date | null; estado?: string; nota?: ReactNode }>
  aTransferir?: { id?: string; etiqueta: ReactNode; monto: number } | null
  total?: number | null
  totalEtiqueta?: string
  saldoSinCuota?: number
  saldoEtiqueta?: string
  condiciones?: ReactNode
  moneda?: Moneda
  simbolo?: string
  estados?: Record<string, { chip: string; etiqueta: string; icono: string; tono?: Tono }>
  vacio?: string
  className?: string
}): ReactElement
export const ESTADOS_CUOTA: Record<string, { chip: string; etiqueta: string; icono: string; tono?: Tono }>

export type ItemDocumento = { id?: string; cantidad: number; concepto: ReactNode; unitario: number; subtotal: number; nota?: ReactNode }
export function DocumentoImpresion(props: {
  titulo?: string
  numero?: string | null
  etiquetaNumero?: string
  emisor?: { nombre?: string; documento?: string; etiquetaDocumento?: string; direccion?: string; telefono?: string; correo?: string; logo?: string } | null
  receptor?: { nombre?: string; documento?: string; etiquetaDocumento?: string; direccion?: string; telefono?: string; correo?: string; logo?: string } | null
  meta?: Array<{ etiqueta: ReactNode; valor: ReactNode }>
  estado?: ReactNode
  estadoTono?: Tono
  detalle?: ItemDocumento[]
  liquidacion?: {
    subtotal?: number
    descuento?: number
    descuentoEtiqueta?: string
    iva?: Array<{ tasa: number; base?: number; monto: number }>
    otros?: Array<{ etiqueta: ReactNode; monto: number }>
    total?: number
  } | null
  notas?: ReactNode
  notasEtiqueta?: string
  pie?: ReactNode
  onImprimir?: () => void
  etiquetaImprimir?: string
  moneda?: Moneda
  simbolo?: string
  etiquetaDetalle?: string
  etiquetaEmisor?: string
  etiquetaReceptor?: string
  etiquetaLiquidacion?: string
  etiquetaMeta?: string
  vacioDetalle?: string
  className?: string
}): ReactElement

export function SubidaImagen(props: {
  etiqueta?: ReactNode
  descripcion?: ReactNode
  valor?: string | null
  error?: ReactNode
  tipos?: string[]
  tamanoMaximo?: number
  comprimir?: boolean
  cuadrado?: boolean
  ladoMaximo?: number
  tamanoObjetivo?: number
  onImagen?: (imagen: { base64: string; tipo: string; ancho?: number; alto?: number }) => void
  onLimpiar?: () => void
  limpiarEtiqueta?: string
  subirEtiqueta?: string
  cambiarEtiqueta?: string
  disabled?: boolean
  ocupado?: boolean
  className?: string
}): ReactElement
export const MIMES_IMAGEN: string[]
export const EXTENSION_IMAGEN: Record<string, string>
export const TAMANO_MAXIMO_IMAGEN: number
export const TAMANO_OBJETIVO_IMAGEN: number
export function mimeDeImagen(bytes: Uint8Array): string | null
export function validarImagen(file: { type?: string; size?: number } | null, opciones?: { tipos?: string[]; tamanoMaximo?: number }): { ok: boolean; error?: string; tipo?: string }
export function prepararImagen(file: any, opciones?: { cuadrado?: boolean; ladoMaximo?: number; tamanoObjetivo?: number }): Promise<{ ok: boolean; error?: string; imagen?: any }>

export function ProgresoChecklist(props: { hechas?: number; total?: number; vencidas?: number; riesgo?: boolean; sustantivo?: string; porcentaje?: number; mostrarDetalle?: boolean; alto?: 'sm' | 'md' | 'lg'; textoVacio?: string; className?: string }): ReactElement
export function progresoChecklist(props: { hechas?: number; total?: number; vencidas?: number; riesgo?: boolean; sustantivo?: string }): { hechas: number; total: number; pendientes: number; vencidas: number; riesgo: boolean; completo: boolean; tono: TonoCanonico; porcentaje: number; etiqueta: string; detalle: string }

export const TONOS: { punto: Record<string, string>; chip: Record<string, string>; texto: Record<string, string> }
export const TONOS_ALIAS: Record<string, TonoCanonico>
export function tonoCanonico(valor: string | null | undefined): TonoCanonico
export function puntoDeTono(valor: string | null | undefined): string
export function chipDeTono(valor: string | null | undefined): string
export function textoDeTono(valor: string | null | undefined): string

// ── Lógica compartida ──────────────────────────────────────────────────────

export function cn(...inputs: any[]): string
export function primerNombre(nombre: string): string
export function normalizarNombre(nombre: string, opciones?: { apellidosPrimero?: 'sifen' | boolean }): string
export function nombrePartes(nombre: string): { nombres: string; apellidos: string }
export function esApellidosPrimero(nombre: string): boolean
export function esRazonSocial(nombre: string): boolean

export const BANCOS_PARAGUAY: Array<{ codigo?: string; nombre: string; [clave: string]: any }>
export const LOGOS_BANCOS: Record<string, string>
export const COLORES_BANCO_RESPALDO: string[]
export function normalizarBanco(nombre: string): string
export function inicialesDeBanco(nombre: string): string
export function colorDeBanco(nombre: string): string
export function logoDeBanco(nombre: string): string | null
export function sugerenciasDeBanco(consulta: string, bancos?: any[]): any[]

export const ESTADO_IMPRESORA: Record<string, string>
export const ETIQUETA_ESTADO: Record<string, string>
export const TONO_ESTADO: Record<string, Tono>
export const ETIQUETA_TRABAJO: Record<string, string>
export function etiquetaTrabajo(estado: string): string
export function colorTrabajo(estado: string): string
export function conexionDeDestino(destino: string): { tipo: string; direccion: string } | null
export function destinoDeConexion(conexion: { tipo: string; direccion: string }): string
export function estadoDeDiagnostico(resultado: unknown): string
export function motivoDeDiagnostico(resultado: unknown): string
export function textoVerificacion(estado: string): string
export function agregarEstado(estado: any, nuevo: any): any

export function crearTicket(datos: any, opciones?: any): string
export function columnasDeAncho(ancho: number): number
export function envolver(texto: string, ancho: number): string[]
export function repartirLinea(izquierda: string, derecha: string, ancho: number): string
export function bloqueFirma(opciones?: any): string
export const AVANCES_FIRMA: any
export const VARIANTES_CORTE: any
export function paginaDePrueba(opciones?: any): string
export function paginaDePruebaSimple(opciones?: any): string
export const TIPOS_PRUEBA: any
export const TIPOS_TICKET_PRUEBA: any

export const TAMANOS_CAMPO: Record<string, string>
export function anchoParaLargo(largo: number): string
export const TAMANOS_MODAL: Record<TamanoModal, string>
export const TAMANO_MODAL_PREDETERMINADO: TamanoModal
export const GRILLA_DOS_COLUMNAS: string
export const GRILLA_DOS_COLUMNAS_COMPACTA: string
export const PIE_ACCIONES: string
export const PIE_ACCIONES_REVERSO: string

export const CIUDADES_PARAGUAY: Array<{ ciudad: string; departamento: string; [clave: string]: any }>
export const DEPARTAMENTOS_PARAGUAY: string[]
export function departamentoDe(ciudad: string): string | null
export function buscarCiudad(consulta: string, limite?: number): any[]

export const MODELOS_IPHONE: string[]
export const CAPACIDADES_IPHONE: string[]
export const COLORES_IPHONE: string[]
export const CATEGORIAS_ACCESORIOS: string[]
export const MARCAS_ACCESORIOS: string[]
export function buscarEnCatalogo(consulta: string, catalogo?: any[]): any[]

// ── Dinero ─────────────────────────────────────────────────────────────────

export type OpcionesSimbolo = { simbolo?: string } | string
/** `opciones` puede ser un vacío (`string`) o `{ vacio, simbolo }`. */
export type OpcionesMonto = { vacio?: string; simbolo?: string }

export const SIMBOLO_PYG: string
export const SIMBOLOS_MONEDA: Record<string, string>
export const LIMITE_MONTO_GENERAL: number
export const LIMITE_MONTO_VENTAS: number
export function formatGs(value: unknown, opciones?: OpcionesSimbolo): string
export function formatGsInput(value: unknown): string
export function parseGsInput(value: unknown): number
export function formatUsd(value: unknown): string
export function formatUsdInput(value: unknown): string
export function parseUsdInput(value: unknown): string
export function formatMoney(value: unknown, currency?: Moneda, opciones?: OpcionesSimbolo): string
export function montoGs(value: unknown, vacio?: string | OpcionesMonto, opciones?: OpcionesMonto): string
export function montoUsd(value: unknown, vacio?: string | OpcionesMonto, opciones?: OpcionesMonto): string
export function montoTexto(value: unknown, currency?: Moneda, vacio?: string | OpcionesMonto, opciones?: OpcionesMonto): string
export function montoConSigno(value: unknown, currency?: Moneda, vacio?: string | OpcionesMonto, opciones?: OpcionesMonto): string
export function excedeMonto(value: unknown, limite?: number): boolean
export function largoMaximoMonto(max?: number, opciones?: { decimales?: boolean }): number
export function formatoNumero(value: unknown, opciones?: { decimales?: number; vacio?: string }): string
export function signoDe(value: unknown): '' | '+' | '−'

// ── Fechas ─────────────────────────────────────────────────────────────────

/** Opciones de formato: vacío y huso horario (`America/Asuncion`). */
export type OpcionesFecha = { timeZone?: string; vacio?: string }
export function fechaValida(value: unknown): Date | null
export function fechaHora(value: unknown, vacio?: string | OpcionesFecha, opciones?: OpcionesFecha): string
export function fechaDia(value: unknown, vacio?: string | OpcionesFecha, opciones?: OpcionesFecha): string
export function fechaHoraCorta(value: unknown, vacio?: string | OpcionesFecha, opciones?: OpcionesFecha): string
export function fechaCorta(value: unknown, vacio?: string | OpcionesFecha, opciones?: OpcionesFecha): string

// ── Seriales, tokens y teléfono ────────────────────────────────────────────

export function ultimos4(serial: string): string
export function partirSerial(serial: string): { prefijo: string; ultimos: string }
export function serialEnmascarado(serial: string): string
export function extractTokenFromUrl(url: string): string
export function esToken(valor: string): boolean
export function normalizarTelefono(valor: string): string
export function internationalPhone(valor: string): string
export function whatsappUrl(telefono: string, mensaje?: string): string
export function soloDigitos(valor: string): string
export function codigoPais(telefono: string): string
export function telefonoVisible(telefono: string): string
export function telefonoValido(telefono: string): boolean
export const MENSAJE_TELEFONO: string

/** Props de los objetos con superficie abierta (se tipan al adoptarse). */
export type PropsAbiertas = Record<string, any> & { className?: string; children?: ReactNode }
