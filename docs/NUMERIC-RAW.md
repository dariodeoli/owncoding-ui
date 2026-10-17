# Controles numéricos RAW compartidos (#55)

Piloto aditivo de [Scale #241](https://github.com/dariodeoli/scale-os/issues/241).
No reemplaza `Input`, `Textarea`, `PercentField` ni `MoneyInput`: estos mantienen
sus contratos. No agrega CSS, APIs, formatos de moneda ni reglas comerciales.

## API y uso

```tsx
import {InputBase, TextareaBase, NumericControl, NumberInput, PercentageInput} from 'owncoding-ui/numeric'
import {numberInputProblem, numberInputValid, nativeNumberSettings} from 'owncoding-ui/number-utils'

// Todos usan refs al elemento DOM real. NumericControl conserva el evento.
<NumericControl policy="decimal" value={raw} onChange={event => setRaw(event.target.value)} />
// Las fachadas controladas reciben/emiten strings; no fabrican eventos.
<NumberInput policy="integer" value={raw} onChange={setRaw} />
<PercentageInput policy="ratio" value={raw} onChange={setRaw} />
```

`InputBase` y `TextareaBase` son primitivas sin estilos y aceptan las props y
eventos nativos. Agregan `invalid`, `describedBy` (combina ambos identificadores
ARIA) y `pending` (disabled + aria-busy). No introducen límites ni adornos.
El integrador conserva las clases existentes de cada aplicación.

`NumericControl` usa un input **text** con inputMode numeric/decimal: no promete
spinbutton, incremento por flechas ni coerción del navegador. Conserva el
borrador RAW y el caret, incluidos `-`, `.`, `-.`, `1.`, exponentes parciales,
cero y negativos; estar incompleto puede producir customValidity, pero no
borra ni normaliza texto. Ref, evento original, name/form, controlled,
uncontrolled, defaultValue, required, readOnly, disabled y ARIA siguen nativos.
Un formulario debe aportar etiqueta accesible; estas bases no la inventan.

Políticas explícitas:

- `NumberPolicy`: integer / decimal. `NumberNotation`: plain / native.
- `PercentagePolicy`: integer-percent / decimal-percent / ratio. Sólo selecciona
  sintaxis entera/decimal; no convierte 25 en .25 ni impone rango 0–100.
- `NumberRules`: notation, min, max, precision, required, step y stepBase.
- `numberInputProblem(raw, policy, rules?)` devuelve mensaje o cadena vacía;
  `numberInputValid` devuelve boolean. Ambos aceptan omitir el tercer argumento.
- `nativeNumberSettings({step?, min?, defaultValue?})` preserva compatibilidad
  del antiguo input number: step por defecto 1, base min/defaultValue/0.
  No aplicar ese default silenciosamente a `NumberInput`, que sólo valida el
  step que recibe. `step="any"` permite decimales sin ajuste por incremento.

Comparación y step usan enteros BigInt escalados, incluidos enteros mayores que
MAX_SAFE_INTEGER; no convertir el RAW a Number para validar esas reglas. En
notation native se preserva la semántica heredada de exponentes, overflow y
underflow, sólo durante validación. No define rangos de negocio ni redondea.

El motor valida el valor DOM después de que una librería de formulario lo
inicializa por ref. Actualiza customValidity en montaje, render y cambio.
Un Editor con noValidate puede seguir usando su validación de dominio; no
se trasladan esas decisiones al paquete.

## Una implementación y frontera servidor

Los exports del root y `/numeric` son exactamente los mismos objetos y funciones.
`/number-utils` sólo tiene validadores/helpers puros y sus tipos: sin React,
ReactDOM, assets ni directiva use client. Los tres comparten el mismo módulo
ESM, también por igualdad estricta de referencias. React sigue siendo peer.

El build usa splitting en un grafo único. La clausura pura se deriva de imports
en el metafile, no de una lista de nombres de chunks. Sólo admite como origen
`src/numeric/number-utils.js`, sin dependencias externas ni bytes cliente/assets;
una contaminación aborta el build. El resto conserva use client, incluidos los
entrypoints root/financial/numeric. Los hashes de esbuild identifican el contenido
del módulo antes del prefijo constante, cuya clasificación está fijada por el
origen puro verificado; no hay alternancia de rol para una misma salida. Los
sourcemaps reciben una línea vacía en mappings al insertar el prefijo cliente.

## Evidencia y consumo coordinado

- `test/numeric-raw.test.jsx`: vectores exactos, props/eventos/refs DOM, RAW,
  FormData, customValidity, pending, ratio sin conversión y montaje por ref.
- `test/numeric-package.test.js`: identidad root/numeric/pure, clausuras mínimas,
  un cuerpo de funciones compartidas y sourcemaps después del prefijo.
- `test/numeric-build-boundaries.test.js`: contaminación por módulo ajeno, React,
  salida ausente, use client y assets debe fallar.
- Consumidor TypeScript estricto: refs nativos, eventos vs callbacks string y
  errores intencionales. `test:package` instala el pack en una carpeta temporal
  y comprueba identidad, exports/tipos, pureza y enteros exactos.
- La app consumidora verifica, por separado, vectores baseline y Chromium/RHF,
  caret, foco, estilos y compatibilidad Editor antes de publicar. No afirmar
  esos resultados sólo por pasar las pruebas de este repositorio.

Estado: fuente de piloto y pack local; sin release, tag ni deploy. El paquete
sigue privado y la versión base no se incrementa en la rama del escritor.
El integrador coordina versión/tag y sustitución de los wrappers locales por
reexports: no deben quedar fallback JSX, parser ni motor local duplicados.

## Validación de esta entrega

En Node 24.19 / React 18.3.1: build, test:types, test:package, check:bundle
y gallery:check PASS. La suite completa ejecutada una vez pasó 1414 pruebas
en 129 archivos. Después de agregar cinco contratos de las fichas nuevas,
el focal de galería pasó 27 pruebas en tres archivos.

Chromium sobre galería Vite local: 40 comprobaciones en 1280/375 px, claro y
oscuro; RAW/caret/Tab, control de 44px y cero overflow horizontal. Texto/borde
de las previews usan color heredado: contraste 18.91:1 claro y 15.89:1 oscuro.
Sin errores de página; proveedores externos bloqueados durante esta QA local.
Las bases permanecen sin estilos; las previews sólo usan utilities existentes.
Capturas y logs temporales se entregan al integrador y no se empaquetan.

Consumo Scale independiente sobre el primer pack de revisión: 1584 vectores
y 14 configuraciones native equivalentes al baseline, identidad estricta entre
root/subpaths/fachadas, bundles mínimo/puro y pruebas Chromium/RHF/Editor y
catálogo (39 checks) PASS, informado por el agente consumidor. El integrador
revalida el artefacto de release con versión/hash definitivos antes de fijarlo.
No se ha publicado ni desplegado esta rama.
