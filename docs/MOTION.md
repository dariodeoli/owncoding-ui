# Movimiento reutilizable

Objetos originales, sin dependencias de animación ni material externo. La app
controla estados y resultados; la biblioteca no sube archivos, verifica
identidades ni acredita pagos. Importar `styles.css` o `tokens.css` + `base.css`
junto al preset Tailwind. Sin `base.css`, texto e iconos siguen siendo estáticos.

## AnimatedStatus

| Prop | Tipo | Default | Contrato |
| --- | --- | --- | --- |
| `state` | `idle / loading / success / error` | `idle` | Estado aportado por la app |
| `children` | `ReactNode` | requerido | Mensaje visible y accesible |
| `motion` | `boolean` | `true` | Permite apagar movimiento |
| `className` | `string` | — | Composición visual |

Región estable `role="status"`, `aria-live="polite"`, `aria-atomic="true"`.
Iconos compartidos decorativos: reloj, giro de carga, trazo de confirmación y
transición al error. No reemplaza `Aviso` ni validación de `FormField`. Pasar
siempre texto; no comunicar resultados solo con color o iconos.

## MotionSurface

Un único `children: ReactElement`; `hover`, `press`, `elevation` defaults `false`;
`motion` default `true`; `className` se combina con la clase existente.
Compone sin wrappers ni handlers; conserva props, callbacks y ref del hijo.
El hijo debe reenviar `className` y `data-*` a su raíz (`Card`/`Button` lo hacen).
No convierte tarjetas en acciones; usar controles nativos. No usar fragmentos,
múltiples hijos ni otra transformación en la misma raíz.

```jsx
<AnimatedStatus state={saving ? 'loading' : resultState}>{resultMessage}</AnimatedStatus>
<MotionSurface hover elevation><Card>Detalle</Card></MotionSurface>
<MotionSurface press><Button disabled={saving} onClick={save}>Guardar</Button></MotionSurface>
```

## Campos de formulario

**Activación (segunda ola «pro»).** Los movimientos de la tabla siguiente que
no son opt-in por prop (label, mensaje de error, sacudida, Select, Checkbox,
Switch, SegmentedField, Esc de SearchField) solo corren dentro de
`<FormulariosPro>` (atributo `data-oc-formularios="pro"` para el CSS + contexto
para el JS; ver `docs/REGLAS.md` §1). Sin él la app queda como en la primera
ola. `motion={false}` en el componente gana sobre el interruptor, y apagar el
movimiento nunca congela un spinner de `cargando`.

Mismos tokens (`--oc-motion-fast` 160 ms, `--oc-motion-feedback` 240 ms,
`--oc-motion-ease`) y mismo interruptor: `data-motion="on|off"` en el control
(prop `motion`, default `true`). Los keyframes viven en `base.css` (opt-in);
sin ese archivo los estados siguen funcionando, solo sin animación.

| Pieza | Movimiento | Se apaga con |
| --- | --- | --- |
| Input, Select, Textarea, PinInput | borde y anillo de foco con transición; hover de borde | `motion={false}`, reduced-motion |
| `FormField` | el label toma el tono de marca con `:focus-within` (en error, `bad`); el mensaje de error entra con fundido + 4 px | `motion={false}` del FormField |
| `FormField etiquetaFlotante` | el label sube de reposo a flotado con `transform` + color (`--oc-motion-fast`); opt-in por prop | `motion={false}` del FormField, reduced-motion |
| Campo inválido | una sacudida de ±6 px / 300 ms **solo** al pasar de válido a inválido (no al montar ni en cada render) | `motion={false}`, reduced-motion |
| `estado="ok"` | check dibujado con `oc-status-draw` | `motion={false}`, reduced-motion |
| `cargando` | spinner al final + `aria-busy` | reduced-motion lo deja estático |
| SearchField | el × aparece con fundido y escala | `motion={false}` |
| Select | el chevron gira 180° con foco; hover de fondo | `motion={false}` |
| Checkbox | trazo del check que se dibuja, escala al presionar | `motion={false}` |
| Switch | pulgar con curva de rebote leve, pista que cambia de color, pulgar que se ensancha presionado | `motion={false}` |
| SegmentedField | indicador único que se desliza (`transform`, medido con ref y recalculado al redimensionar); la primera posición no «viaja» | `motion={false}` |
| Button `cargando`/`exito` | spinner que conserva el ancho; destello `ok` y check dibujado | `motion={false}` |

Reglas: ninguna animación retrasa foco, callbacks, `onChange` ni el envío;
`cargando` bloquea el clic sin deshabilitar (el foco se conserva) y el
resultado se anuncia con texto, no solo con color o ícono. Verificación:
`test/campos-premium.test.jsx` (reglas de `base.css` bajo reduced-motion y
`data-motion="off"`) y estilos computados en Chromium con
`reducedMotion: 'reduce'` (transiciones y animaciones a 0).

Movimiento reducido: mismos iconos/texto, sin giro, trazo ni transformaciones.
La etiqueta flotante cambia de posición al instante, sin transición.

**Spinners con movimiento reducido (#30, medido 2026-10-14).** El bloque global
de `prefers-reduced-motion` pone `animation-duration: .01ms` y una sola
iteración: el `Spinner` (`[data-oc-spinner]`, `animate-spin`) termina enseguida y
queda un anillo de 16 px con el cuarto superior transparente, quieto, en `mute`
(≥3:1). Verificado en Chromium y WebKit con `reducedMotion: 'reduce'`: el
cálculo da `animation-iteration-count: 1`, `transform: none` y borde superior
transparente. Sigue leyéndose como «cargando» porque el anillo abierto es el
glifo de carga y porque el estado no depende del giro: el control lleva
`aria-busy="true"` (el spinner es `aria-hidden`) y los flujos de guardado dicen
«Guardando…» con `AnimatedStatus`. Quien use `cargando` sin texto cerca debe
agregar uno (hint o estado).
Hover exige puntero fino; foco visible y disabled no se transforman. Nunca
esperar animación para ejecutar callbacks, foco o navegación. Tokens:
`--oc-motion-fast`, `--oc-motion-feedback`, `--oc-motion-ease`; sombra sin animar.
Las vistas diferidas tienen flujos demo subida/verificación/pago, inicio
bloqueado al cargar y resultados explícitos; no son prueba de backend.
Pendiente: indicador `Subtabs` con wrap, OTP, carrito y adopción por aplicación.
