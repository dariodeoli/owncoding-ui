# TimeInput (opt-in)

Compone el `Input` existente: conserva tokens, temas, adornos, foco y movimiento reducido. No sustituye los campos `date`/`datetime-local` ni activa cambios en otros controles.

```jsx
<FormField label="Hora" htmlFor="hora">
  <TimeInput id="hora" name="hora" value={hora} onValueChange={setHora}
    min="09:00" max="18:00" stepMinutes={15} required />
</FormField>
```

- Valor público: `HH:mm` o cadena vacía. Acepta escritura `8`, `830`, `8:30`, `08:30`; confirma al salir, Enter o enviar. No usa fechas ni convierte zonas horarias.
- `value` presente activa modo controlado: la app acepta el cambio actualizando el prop. `defaultValue` inicia el modo no controlado y se restaura con reset del formulario.
- `onValueChange(hora)` entrega el valor canónico confirmado; `onChange(event)` permite observar el texto en edición, sin reinterpretarlo como valor confirmado.
- ↑/↓ incrementa `stepMinutes` (default **1**; entero 1–1440), con límite del día y `min`/`max` opcionales `HH:mm`. No redondea la escritura ni inventa una política de quince minutos. Los rangos son del mismo día; intervalos nocturnos requieren lógica de la app.
- El borrador inválido queda visible, con `customValidity`, error en español, `aria-invalid` y descripción enlazada. Se bloquea el envío incluso con `noValidate`, se enfoca el campo y no se envía el valor previo. Con `name`, un input oculto transporta el valor canónico; durante un borrador inválido transporta vacío.
- El guard también confirma atajos antes de `onSubmitCapture` y `onSubmit` de React. La app debe usar el envío normal del formulario (`requestSubmit`); `form.submit()` nativo omite los eventos y toda validación del navegador.
- `ref` apunta al input visible; conserva `id`, `form`, `required`, `disabled`, `readOnly`, `aria-*`, `onBlur`, adornos y `motion` de Input. `onKeyDown` corre primero y `preventDefault()` cancela el comportamiento propio.
- `required` y errores son de interfaz; el servidor siempre revalida. No hace consultas, no persiste datos y no contiene reglas de entrevistas ni de otra aplicación.

Galería: buscar `TimeInput`. Incluye campo editable, rango con incremento explícito y disabled. El error se prueba escribiendo `25:99` y saliendo; el mismo fixture admite los temas claro/oscuro y ancho móvil.
