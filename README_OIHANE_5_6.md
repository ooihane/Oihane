# Oihane 5.6 — diseño orgánico editorial

## Cambios visuales
- Fondo crema con textura sutil tipo papel/lino, realizada con CSS.
- Tipografía editorial Playfair Display para títulos y DM Sans para el texto, con alternativas del sistema si no hay conexión.
- Cabecera fotográfica en inicio y cabeceras interiores, usando imágenes remotas de Unsplash; con fondo de color si no se cargan.
- Iconos de módulos con contenedores ilustrados, redondeados y tonos salvia.
- Tarjetas, campos y botones refinados para una interfaz equilibrada en móvil.

## Conservación de datos y funciones
Este paquete parte de la aplicación Oihane 5.5 y conserva su `index.html` funcional, sus claves de almacenamiento y el resto de archivos de la versión completa. Los cambios de esta versión son de presentación. No se ejecutan `localStorage.clear()`, borrados de IndexedDB ni migraciones de datos. El service worker pasa a `oihane-v16` para actualizar los archivos de interfaz.

## Publicación en GitHub Pages
1. Antes de actualizar, descarga una copia desde Más → Descargar copia JSON.
2. Descomprime el ZIP y copia **todos** los archivos a la raíz del repositorio.
3. Haz commit y espera a que GitHub Pages termine de publicar.
4. Abre Oihane con conexión para cargar la nueva versión.

Las fotografías y fuentes requieren conexión a internet; la aplicación mantiene tipografías alternativas y colores de respaldo si no están disponibles.
