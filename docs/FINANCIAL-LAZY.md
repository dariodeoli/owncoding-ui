# Logos financieros diferidos (opt-in)

La entrada `owncoding-ui/financial-lazy` permite pintar tablas y formularios antes
de descargar sus imágenes. No cambia `BancoLogo`, `BancoCombobox`, los resolvers
síncronos ni sus data URI. No necesita un CDN, hosting de imágenes ni otro
proveedor: los imports ESM usan los chunks locales de la aplicación y los
recursos originales autorizados que ya distribuye el paquete.

```jsx
import {BancoLogoLazy, BancoComboboxLazy} from 'owncoding-ui/financial-lazy'

<BancoLogoLazy banco="Banco Continental" variante="compacto" />
<BancoComboboxLazy value={banco} onChange={setBanco} />
```

Se usa el CSS compartido y la configuración Tailwind existentes. BancoCombobox
comparte la misma instancia compilada de BancoComboboxBase/Input y sus contextos
con root; sólo se sustituye el renderer del logo. No hay otro motor de selección.
Las props y callbacks anteriores, identidad de banco, búsqueda, valores manuales
y navegación por teclado se conservan.

## Unidad de carga y origen

La unidad diferida es una institución/marca y sus variantes originales, por
ejemplo Continental compacto + horizontal. Se eligió esta unidad para evitar el
costo de wrappers por cada archivo y respetar los límites gzip históricos sin
aumentarlos. Ningún grupo incluye archivos de otra institución/marca. El mapa
de loaders se deriva durante build del registro canónico de assets; no hay
catálogo alternativo en Scale. Los bytes no se recortan, recomprimen ni redibujan.
Los recursos físicos se comparten también con el grafo legacy.

El primer render SSR y el de hidratación muestran texto/monograma estable y no
emiten URLs relativas de imágenes. Cuando el slot es visible, IntersectionObserver
carga el grupo; en navegadores sin esta API se carga al montar. Una lista
scrollable no descarga automáticamente sus opciones fuera de vista. El estado
`data-logo-carga` distingue pendiente/cargando/listo/error/no-disponible; un
error termina en fallback y no bloquea contenido ni deja un skeleton permanente.
Los cambios de banco/variante y desmontaje descartan resultados obsoletos.

LogoFinanciero conserva el recorte óptico, dimensiones originales, contraste de
placas, nombre accesible y modo decorativo. La CSP sigue necesitando los scripts
locales de la app y `img-src data:` como la API inline anterior; no se introduce
otro dominio.

## Precarga explícita y SSR Node

`cargarAssetFinanciero(clave)` devuelve Promise<string|null>. Una clave ausente
devuelve null; un fallo de importación rechaza la promesa. Las solicitudes
simultáneas de una clave comparten promesa. No reintenta automáticamente.

```jsx
const clave = 'bancos/continental-compacto.png'
const asset = await cargarAssetFinanciero(clave)
<BancoLogoLazy banco="Banco Continental" variante="compacto"
  recursoInicial={asset ? {clave, asset} : undefined} />
```

Si se precarga para SSR Node, la misma prop serializable debe llegar al primer
render de hidratación. La clave debe coincidir con la variante actual; un
recurso inicial de otro banco no se aplica. El entry visual es cliente en Next:
no se llama su función desde un Server Component; las apps pueden conservar el
fallback SSR o precargar en una frontera cliente.

## Pruebas

El baseline de v0.68.18 captura hashes de las 89 claves originales y 108
renderizados SSR legacy (son métricas distintas de las 90 URI encontradas en el
bundle histórico). Las pruebas verifican igualdad exacta y ausencia de imágenes
en la clausura inicial sin depender del tree shaking. El harness Chromium local
`scripts/financial-lazy-browser.mjs` acepta PUPPETEER_REQUIRE_FROM apuntando a una
herramienta QA instalada; usa únicamente localhost y recursos sintéticos.
