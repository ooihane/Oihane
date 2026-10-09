# Oihane 5.9 — Cultura visual e identificación automática

## Cambios
- **Añadir desde cada subapartado:** cada sección de Cultura tiene su propio botón «＋ Añadir», que abre el formulario con el tipo y el estado adecuados.
- **Una sola categoría Libros:** los libros pendientes y leídos comparten el apartado «Libros», con filtros Pendientes / Leídos / Todos. Los registros anteriores se muestran ahí sin necesidad de migrar ni borrar datos.
- **Identificación por título:** al salir del campo de título se consultan catálogos externos para intentar reconocer libros, películas, series, obras de arte o museos. Si hay una coincidencia clara, se rellenan tipo, título, autor/artista/director, año, enlace e imagen cuando estén disponibles. Si aparecen varias coincidencias, Oihane muestra opciones para que elijas la correcta.
- **Portadas y galería:** libros y cine/series usan las portadas disponibles; las obras de arte se muestran en una galería visual con imágenes de Wikimedia Commons cuando hay resultados adecuados.
- La identificación necesita conexión a Internet y depende de la disponibilidad de los catálogos consultados. Si no hay coincidencias fiables, se puede completar la ficha manualmente. No se requiere API key.
- Caché del service worker actualizada a `oihane-v19`; versión de interfaz 5.9.

## Actualizar
1. Descarga una copia JSON desde **Más → Descargar copia JSON**.
2. Descomprime el ZIP y sustituye los archivos de la raíz del repositorio GitHub Pages.
3. Publica los cambios y abre Oihane con conexión para que se descargue la versión nueva.

Esta actualización mantiene las claves de almacenamiento de la aplicación y no borra los datos existentes.
