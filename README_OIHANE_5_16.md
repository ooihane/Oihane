# Oihane 5.16 — rediseño de navegación y módulos

## Cambios
- Inicio: saludo compacto junto a la fecha, elimina «Tu espacio personal», icono del asistente y etiqueta «Tu agenda»; agenda sigue siendo plegable.
- Accesos de módulos: fondos ilustrados diferentes y más artísticos; icono de Planes sustituido por paisaje. Cabeceras de módulos uniformes.
- Compras abre en General; las pestañas siguen permitiendo entrar en Lidl, Eroski y Mercadona. Se conservan las listas y sus datos.
- Calendario: tira de los siete días de la semana y eventos más compactos.
- Wishlist: «Cosas que quiero» agrupa ideas y búsquedas; «Comprados» queda separado.
- Regalos: próximos dos meses y listas por persona (padre, madre, novio, parejas de los padres, hermano y resto), con estado visible.
- Plantas: evolución registrada dentro de la ficha de cada planta.
- Estudio: «Temas pendientes».
- Cultura: libros, arte y películas/series, sin apartado independiente de museos ni historial. Se intentan recuperar portadas de Open Library y se añaden búsquedas externas manuales cuando la identificación no funciona. Los datos previos se conservan.
- Planes: dos listas visibles (próximos y pendientes sin fecha), con acciones explícitas para próximos, sin fecha e historial/realizado.
- Tareas: se elimina la etiqueta «Pendientes» de la barra.

## Instalación
Antes de sustituir archivos, exporta una copia JSON desde Más. Sustituye los archivos del repositorio por el contenido del ZIP en la raíz. Service worker actualizado a `oihane-v26`.

Nota: la identificación cultural y la recuperación de portadas requieren conexión y dependen de catálogos externos. No se han borrado los registros guardados.
