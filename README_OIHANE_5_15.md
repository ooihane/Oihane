# Oihane 5.15 — correcciones de calendario, recetas y compra

## Correcciones incluidas

- **Calendario:** botón para editar cualquier evento guardado; permite modificar nombre, fecha, hora, duración, ubicación, personas, notas y avisos. Se conservan los vínculos con Planes/Estudio.
- **Recetas:** nueva acción «Editar receta e ingredientes» para cambiar nombre, ingredientes, pasos y raciones sin borrar la receta.
- **Recetas → Compras:** el botón añade los ingredientes reconocidos a la tienda seleccionada (Lidl, Eroski o Mercadona; si estás en General, usa Lidl), evita duplicados, informa de cuántos se añadieron y abre la lista de compra.
- **Lista General:** se reconstruye como resumen común de Lidl, Eroski y Mercadona. La migración normaliza los elementos existentes y no borra productos.
- **Categorías:** los productos se agrupan por categoría tanto en General como en cada supermercado, también en la vista de comprados.
- **Clasificación:** se corrigen coincidencias parciales como «aguacate» → Fruta y verdura (no Bebidas) y «aceite de oliva» → Despensa (no Bebidas). También se separan productos de despensa como tomate frito, atún en lata y pan rallado.
- **Caché:** versión de interfaz 5.15.0 y service worker `oihane-v25` para forzar la actualización.

## Actualización segura

Antes de sustituir archivos, descarga una copia desde **Más → Descargar copia JSON**. Sustituye los archivos del repositorio por el contenido de este ZIP, manteniendo los archivos en la raíz del repositorio.

## Revisión realizada

- Comprobación sintáctica de JavaScript de la aplicación y del service worker.
- Pruebas de clasificación de productos habituales y casos que antes se confundían.
- Prueba de migración de productos antiguos para verificar la relación General + supermercado.
- Prueba del flujo de ingredientes de una receta a la compra.
- Prueba de edición de un evento guardado, comprobando que conserva su vínculo de origen.

No se ha podido probar directamente en tu iPhone ni con tus datos reales; después de publicar, abre Oihane y comprueba que la nueva versión se carga. No se cambian las claves de almacenamiento de tus datos.
