# Oihane 5.23 — auditoría acumulada de 5.16 a 5.22

## Resultado

Se revisó la evolución acumulada de la aplicación desde la 5.16 hasta la 5.22 y se corrigieron errores detectados. Esta versión mantiene las claves de almacenamiento existentes; no se ha cambiado el esquema general ni se han eliminado datos intencionadamente.

## Correcciones de la auditoría

- **Inicio:** al arrancar, la aplicación pintaba la pantalla de inicio antes de instalar las mejoras visuales de las versiones posteriores. Ahora vuelve a renderizar Inicio al terminar de cargar todos los parches.
- **Edición de módulos:** se había perdido el enlace al editor genérico anterior al sustituir los editores de Recetas/Estudio, Viajes/Cultura y Planes. Se restaura la cadena de edición para los módulos que siguen usando el editor general.
- **Viajes:** al añadir o quitar destinos o transportes, los campos ya escritos en las otras etapas se perdían al reconstruir el formulario. Ahora se guardan temporalmente antes de redibujarlo. Se normalizan estados antiguos y se elimina el botón separado de «Editar viaje / estado»; se cambia la categoría/estado al pulsar el viaje.
- **Cultura:** el formulario podía fallar al intentar ocultar los campos Museo/Plataforma, porque las etiquetas no envolvían los controles. Se corrige la estructura y la visibilidad por tipo. La búsqueda ya no selecciona automáticamente resultados sin coincidencia suficiente, intenta también catálogos de series y aprovecha metadatos de Wikimedia para obras de arte. Se añade acceso a JustWatch España para comprobar dónde ver una película o serie.
- **Estudio y calendario:** si se quitaba la fecha de un curso, el evento anterior podía permanecer en el calendario. Ahora se elimina el vínculo obsoleto.
- **Tareas:** las tareas recurrentes atrasadas calculaban el retraso a partir de la última realización incluso cuando la fecha de vencimiento ya había pasado. Ahora se usa la fecha debida para medir el retraso, se programa la siguiente repetición desde la fecha real de realización y se admite deshacer una finalización sin dejar la siguiente ocurrencia pendiente duplicada.
- **Recurrencia:** se normalizan valores antiguos equivalentes a «No recurrente», se conservan las prioridades existentes como prioridad nueva, se muestran intervalos personalizados como «Cada N días» y se admiten intervalos mensuales de 2 a 11 meses.
- **Planes:** se normalizan categorías antiguas a «Próximos» o «Ideas». En las tarjetas, el propio plan abre la edición; se han quitado los botones inferiores de las ideas y la eliminación está dentro del formulario de edición.
- **Formularios:** los campos con dos columnas agrupan correctamente cada etiqueta con su control, evitando que se desalineen los campos.
- **Caché:** service worker actualizado a `oihane-v32`; versión visible `5.23.0`.

## Resumen de cambios conservados

- **5.16:** navegación visual, cabeceras, calendario compacto y reorganización inicial de Cultura, Planes, Tareas, Viajes, Plantas, Estudio y Wishlist.
- **5.17:** listas de compra compactas y calendario Día/Semana/Mes/Año.
- **5.18:** ajustes de Inicio y tareas, asistente de voz, Wishlist y Regalos.
- **5.19:** formularios editables de Hogar y Plantas y mejoras de edición al pulsar elementos.
- **5.20:** formularios y listas compactas para Recetas y Estudio.
- **5.21:** viajes con etapas y transportes encadenados; Cultura con libros, arte y películas/series.
- **5.22:** Planes e Ideas; tareas separadas por recurrencia y prioridad.

## Verificaciones realizadas

- Integridad de los ZIP históricos 5.16–5.22.
- Comprobación sintáctica de todos los scripts inline disponibles en los ZIP 5.16–5.22.
- Comprobación sintáctica de los cinco scripts inline de la versión 5.23 y del service worker.
- Pruebas lógicas específicas para categorías antiguas, búsqueda cultural, retraso de tareas recurrentes, etiquetas de intervalos y repetición mensual de siete meses.
- Comprobación de que la cadena de edición genérica sigue disponible.

**Limitación:** el entorno de auditoría bloqueó la navegación del navegador de pruebas, por lo que no fue posible completar una prueba interactiva real de todas las pantallas. Tras publicar, conviene comprobar en tu dispositivo el alta/edición de un viaje con varios tramos, la búsqueda de Cultura, la sincronización de un curso con Calendario y la finalización/deshacer de una tarea recurrente.

## Publicación segura

1. Descarga primero una copia desde **Más → Descargar copia JSON** y guárdala fuera de Oihane.
2. Sustituye en la raíz del repositorio los archivos `index.html`, `sw.js`, `manifest.json` e `icon.svg` por los del ZIP.
3. Conserva `LEEME_SINCRONIZACION_V5.md` y `supabase_oihane.sql` si usas o quieres configurar la sincronización.
4. No borres los datos del sitio ni el almacenamiento local del navegador.
