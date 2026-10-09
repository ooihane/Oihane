# Oihane 5.1 — mejora visual de Cultura

## Cambios
- Libros pendientes y leídos en cuadrícula de tarjetas verticales, con portada fotográfica si se añade una imagen y portada tipográfica si no.
- Arte en composición tipo mosaico/masonry, con imagen, título, artista, año, museo/estilo, ciudad, valoración, notas y enlace.
- Nueva sección de Museos con fichas propias, ciudad/ubicación, notas y enlace a web o entradas.
- Películas y series en tarjetas; al cambiar su estado a «Leído / visto» pasan al Historial.
- Acciones para cambiar estado y editar la ficha cultural.
- Acción «Añadir a viaje» en obras de arte: permite añadir el lugar a un viaje pendiente o crear una idea de destino cultural.
- Las obras de arte y las fichas de museos pueden vincularse a viajes. Se conservan las claves de almacenamiento existentes (`oihane_culture` y `oihane_trips`); no se borran ni se migran los registros guardados.

## Publicación
1. Haz una copia JSON desde Más → Copia de seguridad.
2. Sustituye `index.html` y `sw.js` en la raíz del repositorio.
3. Publica mediante Commit changes y espera a GitHub Pages.
4. Abre Oihane con conexión a internet. El caché del service worker cambia a `oihane-v10` para pedir los nuevos archivos.

El caché del service worker se actualiza a `oihane-v10`. No se ha realizado una prueba interactiva completa en iPhone.
