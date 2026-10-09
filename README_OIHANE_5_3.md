# Oihane 5.3 — clasificación automática y navegación compacta

## Cambios incluidos

- **Clasificación automática de productos:** al escribir un artículo de compra, Oihane infiere su categoría con un clasificador local por palabras clave. No requiere internet ni envía los nombres de los productos a servicios externos.
- **Migración de productos existentes:** al abrir esta versión, se vuelven a clasificar los artículos guardados según su nombre, conservando identificadores, tiendas, listas, estado de compra y demás datos.
- **Clasificación coherente desde todas las entradas:** los artículos nuevos, los añadidos por voz y los ingredientes enviados desde Recetas utilizan el mismo clasificador.
- **Botones de módulos solo con iconos:** desaparecen los títulos visibles dentro de los botones de la pantalla de inicio; se conserva el nombre accesible y el texto emergente.
- **Cuatro módulos por fila** en móvil y escritorio.
- **Sin textos introductorios al abrir módulos:** se ocultan los títulos y descripciones promocionales iniciales. Se conservan contadores, controles, listas, secciones y herramientas.
- **Caché actualizada** para solicitar los nuevos archivos.

## Cómo implantarla

1. Antes de sustituir archivos, abre la versión actual de Oihane y descarga una copia JSON desde **Más → Copias de seguridad y recuperación**.
2. Descomprime `Oihane_5_3_CLASIFICACION_Y_DISENO.zip`.
3. Sustituye en la raíz del repositorio de GitHub Pages los archivos incluidos: `index.html`, `sw.js`, `manifest.json`, `icon.svg`, `supabase_oihane.sql`, `LEEME_SINCRONIZACION_V5.md`, `README_CULTURA_5_1.md` y este README.
4. Haz commit de los cambios y espera a que GitHub Pages termine de publicar.
5. En el iPhone, abre Oihane con conexión, recarga la página y, si sigue apareciendo la versión anterior, cierra la app instalada y vuelve a abrirla.

## Alcance y limitaciones

La clasificación es automática y local, mediante reglas y vocabulario en español; no es un modelo de IA. Los productos conocidos se clasifican por su nombre y los no reconocidos quedan en **Otros**. Si un nombre es ambiguo o muy específico, la categoría puede no ser perfecta; ampliar el vocabulario permite mejorarla sin configurar Supabase.

La versión conserva los datos locales existentes y no configura ni activa la sincronización en la nube. Se recomienda guardar la copia JSON antes de actualizar.
