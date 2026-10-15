# Oihane 5.32.7 — Guía de tipografía de todos los módulos

Esta actualización añade una sola guía tipográfica para los apartados de los 13 módulos. No modifica datos ni la función Supabase `oihane-ai`.

## Tipos de texto

| Elemento | Fuente | Tamaño | Peso | Color |
|---|---|---:|---:|---|
| Encabezado de apartado | Playfair Display | 19 px | 600 | Según su número en el módulo |
| Subtítulo | Playfair Display | 16 px | 500 | Negro `#000000` |
| Elemento de lista | DM Sans | 12 px | 500 | Negro `#000000` |
| Metadatos / ayudas | DM Sans | 10 px | 400 | Gris salvia `#777D70` |
| Microetiquetas / notas | DM Sans cursiva | 9 px | 500 | Gris salvia `#777D70` |
| Etiquetas / controles | DM Sans | 11 px | 600 | Verde oliva oscuro `#3D4B3B` |
| Fondo de botones | — | — | — | Salvia `#77876C` |
| Borde de botones | — | — | — | Verde oliva oscuro `#3D4B3B`; 10 px de radio |

### Colores por posición del apartado

1. Azul pizarra — `#496A7B`
2. Musgo — `#64775A`
3. Lavanda antigua — `#766487`
4. Terracota — `#985F4B`
5. Rosa arcilla — `#A46C72`
6. Gris salvia — `#777D70`
7. Cacao — `#7C5E53`
8. Ocre dorado — `#8B7445`

A partir del noveno apartado se repite la secuencia, sin contar los apartados de otro módulo. El orden se obtiene del contenido que presenta Oihane, no de la base de datos.

### Excepciones conservadas

- Etiquetas y colores de prioridad sin cambios.
- Fechas y horas a la izquierda: DM Sans 10 px (fecha musgo, peso 500; hora cacao, peso 400), separación horizontal 4 px.
- Botones de eliminar, flechas y controles solo con icono: no se cambian de tamaño ni de color con esta regla.
- Campos de texto para editar (inputs): mantienen al menos 16 px para evitar el zoom involuntario en iPhone.

## Dónde cambiar la apariencia

Abre `index.html`, busca `oihane-5327-tipografia-global` y modifica los valores `--oihane-titulo-1` ... `--oihane-titulo-8` y las reglas CSS inmediatamente siguientes.

Por ejemplo, para cambiar el cuarto encabezado de terracota a azul, cambia:

```css
--oihane-titulo-4: #985F4B;
```

por:

```css
--oihane-titulo-4: #496A7B;
```

El archivo `sw.js` lleva la nueva versión de caché para que el iPhone pueda recuperar el CSS nuevo.

## Instalación

1. Exporta una copia de seguridad JSON de Oihane.
2. Sustituye `index.html` y `sw.js` en GitHub por los del ZIP.
3. Vuelve a abrir Oihane en el iPhone y comprueba los estilos en módulos con varios apartados.
4. No cambies Supabase, los iconos ni otras carpetas.

**Validación:** sintaxis revisada; las pruebas visuales en iPhone y navegación real siguen pendientes.

## Borde del apartado y Mi agenda

Los apartados tienen `border-left: 3px solid var(--oihane-color-apartado)`; el color se hereda de la misma variable usada por el título, según su posición dentro del módulo. No se crean bordes adicionales en cada elemento de la lista.

En **Mi agenda** se han ocultado los metadatos de categoría de las tareas («Personal», «Recados», etc.). No se cambian los valores guardados ni la vista de Tareas.
