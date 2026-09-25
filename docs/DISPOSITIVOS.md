# Buscador dependiente de dispositivos — guía de adopción

Un solo objeto para elegir un equipo: **primero el modelo** (por nombre o
código) y después sus dependientes —capacidad, color, conectividad, marca o
categoría—. Es el patrón de `CityAutocomplete` (ciudad → departamento) aplicado
a equipos: **el modelo manda** y las variantes se despliegan solo cuando hay
modelo, con las opciones que correspondan a ese modelo.

Publicado en `owncoding-ui` **v0.24.0**. Props y reglas resumidas:
`docs/REGLAS.md` §1.

## 1. Quick start

```jsx
import { useState } from 'react'
import { BuscadorDispositivo, etiquetaDispositivo } from 'owncoding-ui'

export function RecepcionEquipo() {
  const [dispositivo, setDispositivo] = useState({})
  return (
    <>
      <BuscadorDispositivo valor={dispositivo} onCambio={setDispositivo} tipo="mobile" />
      <p>{etiquetaDispositivo(dispositivo)}</p> {/* iPhone 17 · 256 GB · Azul · 5G */}
    </>
  )
}
```

- `valor` es **controlado** (`{ modelo, capacidad, color, conectividad, marca, categoria }`).
- `onCambio(valor, { campo })` avisa el valor completo y qué campo cambió.
- Cambiar de modelo **limpia** los dependientes que ya no aplican (nunca queda
  una variante apuntando a otro equipo).

## 2. Perfiles por tipo de tienda

`tipo` elige un perfil predeterminado (`PERFILES_DISPOSITIVO`):

| `tipo` | Campos que despliega | Catálogo por defecto |
| --- | --- | --- |
| `mobile` | modelo → capacidad, color, conectividad | `MODELOS_IPHONE`, `CAPACIDADES_IPHONE`, `COLORES_IPHONE`, `CONECTIVIDADES_MOVIL` |
| `accesorios` | producto/modelo compatible → marca, categoría | texto libre, `MARCAS_ACCESORIOS`, `CATEGORIAS_ACCESORIOS` |
| `servicio` | modelo → capacidad, color | `MODELOS_IPHONE`, `CAPACIDADES_IPHONE`, `COLORES_IPHONE` |

Un perfil propio se pasa por `perfil` (`{ campos, etiquetas, catalogo }`) y pisa
al predeterminado; `etiquetas` permite renombrar cada campo sin tocar el perfil.

## 3. Catálogo propio (códigos y dependientes por modelo)

El catálogo acepta textos o entradas con **código** y listas propias:

```jsx
<BuscadorDispositivo
  valor={dispositivo}
  onCambio={setDispositivo}
  catalogo={{
    modelos: [
      { nombre: 'iPhone 17 Pro', codigo: 'IP17P', capacidades: ['256 GB', '512 GB'], colores: ['Titanio azul'] },
      { nombre: 'iPhone 17', codigo: 'IP17' },
    ],
  }}
/>
```

- La búsqueda matchea **nombre o código** (`buscarPorCodigo`, por defecto `true`),
  tolerando acentos y mayúsculas.
- Si el modelo trae `capacidades`/`colores`/`conectividades`/`marcas`/
  `categorias`, esas mandan; si no, se usa el catálogo del perfil.
- `permitirLibre` (por defecto `true`): un modelo que no está en el catálogo se
  guarda tal cual, y los dependientes salen del catálogo del perfil.

## 4. Helpers (los mismos que usa el objeto)

| Helper | Para qué |
| --- | --- |
| `etiquetaDispositivo(valor)` | «iPhone 17 · 256 GB · Azul · 5G» (listas, impresos, chips) |
| `buscarDispositivo(modelos, texto, { porCodigo, limite })` | Sugerencias por nombre/código |
| `opcionesDependiente(modelo, campo, perfil)` | Opciones de un dependiente para ese modelo |
| `limpiarDependientes(valor, modelo, perfil)` | Aplica la limpieza al cambiar de modelo (si la app maneja el estado por fuera) |
| `PERFILES_DISPOSITIVO`, `CAMPOS_DISPOSITIVO`, `DISPOSITIVOS_MOBILE`, `CONECTIVIDADES_MOVIL` | Configuración y catálogos por defecto |
| `normalizarBusqueda(texto)` | Normalización sin acentos ni mayúsculas, para catálogos propios |

## 5. Adopción sugerida

| Pantalla | Cómo se usa |
| --- | --- |
| **Asistencia / POS** | Al cargar un equipo al carrito o registrar una reserva: `tipo="mobile"`, y la etiqueta del dispositivo va en la línea del carrito |
| **Stock / recepción** | Recepción de unidades y ajustes: `tipo="mobile"` (o `"servicio"` si no se pide conectividad) con `permitirLibre` para modelos nuevos |
| **Compras / abastecimiento** | En la necesidad o la compra: la **variante exacta** que pide #250 (modelo + capacidad + color + condición) sale del mismo objeto |

Checklist de adopción:

- [ ] Elegir el `tipo` (o pasar un `perfil`) que corresponda a la pantalla.
- [ ] Guardar el valor completo (`modelo`, `capacidad`, `color`, …) en el
      formulario; mostrar con `etiquetaDispositivo` donde se lea.
- [ ] Si la pantalla tenía texto libre de modelo, dejar `permitirLibre` mientras
      convive con el catálogo y migrar de a poco.
- [ ] No repetir la lógica de dependientes: para limpiar valores viejos al
      cambiar de modelo, usar `limpiarDependientes` (o el propio objeto).

## 6. Verificación

`test/dispositivos.test.jsx` cubre: búsqueda por nombre/código con acentos,
catálogo propio por modelo, limpieza de dependientes y los tres perfiles. La
guarda de contrato de la app (`estadoEquipo.test.js` en MobOS) no cambia: el
objeto es aditivo.
