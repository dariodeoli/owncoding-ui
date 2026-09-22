# Alimentar la biblioteca (y cosechar de otras apps)

La biblioteca crece con lo que ya funciona en las apps. Dos direcciones:

## 1. Alimentar (app → biblioteca)

Cuando una app resuelve algo que puede repetirse en otra:

1. **Buscar antes de crear** (`docs/REGLAS.md`): si ya existe un objeto, se usa;
   si no, se crea acá.
2. **Extraer sin acoplar**: el objeto no hace `fetch`, no lee sesión ni conoce
   la marca; recibe props y avisa por callbacks. Los datos de la app (logo,
   nombre, versión, catálogos) entran por props.
3. **Traer nombre, props y reglas** documentados en `docs/REGLAS.md` (o
   `docs/IMPRESION.md` si es impresión).
4. **Tests**: render con `renderToStaticMarkup` y, si hay lógica, test puro.
5. **Release**: bump del `package.json`, entrada en `CHANGELOG.md`, tag
   (`vX.Y.Z`) y push con tags.
6. **Adoptar en la app** (fase 2 de esa app): cambiar la dependencia a la
   versión nueva y reemplazar la copia local por el import; correr los checks de
   la app en el mismo cambio.

## 2. Cosechar (otra app → biblioteca)

El mismo camino, al revés: cuando en ScaleOS, LedBox o PagaYa aparece un
componente o patrón que resolvió bien un problema, se propone traerlo:

1. **Candidato**: componente o regla que (a) ya se repite o se va a repetir,
   (b) no depende del dominio de esa app, (c) tiene valor visual o de lógica.
2. **Portar con el mismo criterio** (props, sin API, tests, docs) y anotar en el
   CHANGELOG de dónde vino.
3. **Unificar, no duplicar**: si en la biblioteca ya hay algo parecido, se
   generaliza el objeto existente (nueva prop o variante) en vez de sumar un
   segundo objeto. Los alias de compatibilidad no entran.
4. **Avisar** en el issue de la app de origen y en el de la biblioteca para que
   la otra app sepa que su componente ahora vive acá.

## Cuándo NO traerlo

- Si es una pantalla completa de negocio (POS, caja): eso vive en la app; lo que
  se extrae son sus piezas reutilizables (campos, celdas, avisos, estados).
- Si depende de la API, la sesión o el router de la app: primero se separa la
  lógica (props/callbacks), después se trae.
- Si es una marca o un asset de terceros: va como prop o dato, no hardcodeado.
