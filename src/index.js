// OwnCoding UI — puntos de entrada del paquete.
//
// Todo lo que exporta esta librería es portable: no hace fetch, no lee stores
// ni depende del router. Las apps aportan datos y manejan el estado.

// Primitivas y objetos de interfaz
export {
  Button,
  Input,
  PasswordInput,
  PinInput,
  MoneyInput,
  Money,
  Select,
  Textarea,
  Label,
  Eyebrow,
  Card,
  Modal,
  ConfirmDialog,
  Badge,
  Dot,
  IconAction,
  Drawer,
  ToastProvider,
  useToast,
  Skeleton,
  EmptyState,
  ErrorState,
  Aviso,
  PageHeader,
  DataTable,
  FormField,
  Stat,
  Toggle,
  Subtabs,
  FilaDato,
  CeldaMoneda,
  BarraProgreso,
} from './components/ui.jsx'

// Campos y objetos compartidos
export { default as Icon } from './components/Icon.jsx'
export { default as Switch } from './components/Switch.jsx'
export { default as SearchField } from './components/SearchField.jsx'
export { default as SegmentedField } from './components/SegmentedField.jsx'
export { default as PercentField, parsePercent, formatPercent, limpiarPercent } from './components/PercentField.jsx'
export { default as CurrencySelect } from './components/CurrencySelect.jsx'
export { default as ListGridToggle } from './components/ListGridToggle.jsx'

// Clases de tabla/listado
export { ROTULO_DATO, CELDA_ENCABEZADO, ROTULO_SECCION, CELDA_DATO, CELDA_NUMERO } from './utils/tabla.js'

// Lógica compartida
export { cn, primerNombre } from './utils/cn.js'
export {
  formatGs,
  formatGsInput,
  parseGsInput,
  formatUsd,
  formatUsdInput,
  parseUsdInput,
  formatMoney,
  montoGs,
  montoUsd,
  montoTexto,
  excedeMonto,
  LIMITE_MONTO_GENERAL,
  LIMITE_MONTO_VENTAS,
} from './utils/moneda.js'
export { fechaValida, fechaHora, fechaDia, fechaHoraCorta, fechaCorta } from './utils/fecha.js'
export {
  normalizarTelefono,
  internationalPhone,
  whatsappUrl,
  soloDigitos,
  codigoPais,
  telefonoVisible,
  telefonoValido,
  MENSAJE_TELEFONO,
} from './utils/telefono.js'
