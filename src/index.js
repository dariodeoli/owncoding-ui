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
export { default as EmailField, DOMINIOS_EMAIL, sugerenciasDe } from './components/EmailField.jsx'
export { default as PhoneField, parseTelefono, componerTelefono, CODIGOS_PAIS } from './components/PhoneField.jsx'
export { default as SerialField, normalizarSerial } from './components/SerialField.jsx'
export { default as InstagramField, normalizarInstagram } from './components/InstagramField.jsx'

// Acceso y shell (sin API: todo por props)
export { default as GoogleButton, GoogleMark, OAuthDivider } from './components/GoogleButton.jsx'
export { default as AuthLayout } from './components/AuthLayout.jsx'
export { default as ProductFooter } from './components/ProductFooter.jsx'
export { default as LoadingScreen } from './components/LoadingScreen.jsx'
export { default as PegarEnlaceToken } from './components/PegarEnlaceToken.jsx'
export { default as NavLateral } from './components/NavLateral.jsx'
export { default as MenuDesplegable } from './components/MenuDesplegable.jsx'

// Ajustes (modelo de configuración) e impresión LAN/USB
export { default as PanelDerecho } from './components/PanelDerecho.jsx'
export { default as TarjetaAjuste } from './components/TarjetaAjuste.jsx'
export { default as AjustesImpresion } from './components/AjustesImpresion.jsx'
export { default as BotonImprimir } from './components/BotonImprimir.jsx'
export { default as BancoCombobox } from './components/BancoCombobox.jsx'
export { default as BancoLogo } from './components/BancoLogo.jsx'
export { default as CityAutocomplete } from './components/CityAutocomplete.jsx'

// Clases de tabla/listado
export { ROTULO_DATO, CELDA_ENCABEZADO, ROTULO_SECCION, CELDA_DATO, CELDA_NUMERO, CELDA_IDENTIDAD } from './utils/tabla.js'

// Lógica compartida
export { cn, primerNombre } from './utils/cn.js'
export { normalizarNombre, nombrePartes, esApellidosPrimero } from './utils/nombre.js'
export {
  BANCOS_PARAGUAY,
  LOGOS_BANCOS,
  COLORES_BANCO_RESPALDO,
  normalizarBanco,
  inicialesDeBanco,
  colorDeBanco,
  logoDeBanco,
  sugerenciasDeBanco,
} from './utils/bancos.js'
export {
  ESTADO_IMPRESORA,
  ETIQUETA_ESTADO,
  TONO_ESTADO,
  ETIQUETA_TRABAJO,
  etiquetaTrabajo,
  colorTrabajo,
  conexionDeDestino,
  destinoDeConexion,
  estadoDeDiagnostico,
  motivoDeDiagnostico,
  textoVerificacion,
  agregarEstado,
} from './printing/estadoImpresoras.js'
export {
  crearTicket,
  columnasDeAncho,
  envolver,
  repartirLinea,
  bloqueFirma,
  AVANCES_FIRMA,
  VARIANTES_CORTE,
} from './printing/escpos.js'
export { paginaDePrueba, paginaDePruebaSimple, TIPOS_PRUEBA, TIPOS_TICKET_PRUEBA } from './printing/prueba.js'
export { TAMANOS_CAMPO, anchoParaLargo } from './utils/tamanos.js'
export { CIUDADES_PARAGUAY, DEPARTAMENTOS_PARAGUAY, departamentoDe, buscarCiudad } from './catalog/ciudades.js'
export {
  MODELOS_IPHONE,
  CAPACIDADES_IPHONE,
  COLORES_IPHONE,
  CATEGORIAS_ACCESORIOS,
  MARCAS_ACCESORIOS,
  buscarEnCatalogo,
} from './catalog/productos.js'
export {
  formatGs,
  formatGsInput,
  largoMaximoMonto,
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
export { ultimos4, partirSerial, serialEnmascarado } from './utils/serial.js'
export { extractTokenFromUrl, esToken } from './utils/token.js'
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
