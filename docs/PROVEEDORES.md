# Proveedor con texto libre

`BuscadorProveedor` conserva su contrato `selectedId`, `onSelect`, `onCreate` y
`onQueryChange`. El texto libre y la confirmación al salir/tipear son opt-in:

```jsx
<BuscadorProveedor
  proveedores={proveedores}
  value={proveedorIdONombre}
  onSelect={proveedor => setProveedor(proveedor.id)}
  onLibre={setProveedor}
  confirmarAlSalir
  confirmarAlTipear
/>
```

- `value` acepta un id o texto y prevalece sobre `selectedId`. `value=""`
  limpia el campo. Si se omite, `selectedId` conserva su comportamiento previo.
- `onLibre(texto)` recibe el nombre confirmado desde la fila «Usar» o Enter;
  los nombres se recortan al confirmar. Los ids, nombres o abreviaturas exactos
  se resuelven por `onSelect`, sin alta implícita.
- `confirmarAlSalir` (false por defecto) confirma al perder el foco. El clic en
  una opción conserva el foco para que gane la selección y no confirma dos veces.
- `confirmarAlTipear` (false por defecto) emite cada cambio de texto, incluido
  el vacío, mediante `onLibre`. Es útil cuando la pantalla guarda el nombre tal
  como se escribió. `onQueryChange` sigue recibiendo todos los cambios.
- Si hay `onCreate`, la fila nueva conserva la acción de crear y su umbral de
  dos caracteres. Sin `onCreate`, `onLibre` habilita la fila «Usar» desde un
  carácter. La confirmación al salir no crea proveedores automáticamente.

Las flechas, Enter y Escape mantienen la navegación del combobox. Las opciones
recientes y el filtro sin acentos por nombre/abreviatura siguen disponibles.

`inputProps={{ readOnly: true }}` permite revisar el valor sin abrir sugerencias,
confirmar texto, crear ni seleccionar proveedores. El eco de `value` después de
una confirmación no vuelve a llamar `onLibre` al perder el foco.
