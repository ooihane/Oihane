# Oihane — actualización de conexiones e integraciones

## Archivos
- `index.html`: aplicación y módulos.
- `sw.js`: service worker con caché `oihane-v7`.
- `manifest.json` e `icon.svg`: metadatos e icono instalable de la PWA.

## Conexiones implementadas
- **Receta → Compras:** añade ingredientes a General y Lidl, evita duplicados por nombre normalizado y guarda el nombre/ID de la receta de origen.
- **Plan → Calendario:** los planes con fecha crean o actualizan un evento vinculado; al eliminar el plan se pregunta si se elimina también el evento.
- **Curso → Calendario:** los cursos con fecha crean/actualizan un evento vinculado con hora, duración y ubicación disponibles.
- **Wishlist → Regalos:** permite copiar una idea a Regalos preguntando para quién es; la idea original se conserva.
- **Hogar → Compras:** las compras fijas se pueden enviar a General y Lidl; el vínculo se conserva y al marcar el producto como comprado se refleja en Hogar.

## Integraciones que sí están disponibles en esta versión
- **Precios:** botones para abrir Google Shopping o Idealo desde Wishlist, Regalos y compras fijas de Hogar. La comparación final se hace en el buscador; la app no puede leer precios de esas webs ni vigilar cambios automáticamente.
- **Notificaciones:** solicita permiso y comprueba recordatorios de tareas, eventos y hora de salida mientras Oihane está abierta y activa.
- **Calendario:** exportación `.ics` e importación `.ics` manual, con omisión de duplicados básicos.
- **Voz:** intenta usar Web Speech API si el navegador la soporta. En iPhone/Safari, si no está disponible, se puede usar el dictado del teclado de iOS.
- **Automatizaciones:** conexiones entre módulos descritas arriba y recordatorios en primer plano.

## Límites reales
La web estática de GitHub Pages no tiene backend. Por tanto, esta versión **no ofrece** sincronización bidireccional continua con Apple Calendar, sincronización entre dispositivos, notificaciones push fiables cuando la app está cerrada, IA conversacional/voz avanzada ni alertas automáticas de bajadas de precio. Para ello hace falta configurar un backend/servicio push y las credenciales/permisos correspondientes; no se han incrustado claves privadas en el código.

## Protección de datos existentes
- Se conservan las claves de almacenamiento local actuales: `oihane_tasks`, `oihane_products`, `oihane_events` y las claves `oihane_<módulo>`.
- La actualización no borra ni migra los arrays guardados; solo añade dos metadatos de versión (`oihane_last_version` y `oihane_last_upgrade_at`).
- **Antes de actualizar**, abre Oihane → Más → Copia de seguridad y guarda el JSON. No borres los datos de Safari ni desinstales la app durante la actualización.
- Sustituye los archivos de la raíz del repositorio por los del ZIP y publica en GitHub Pages. Espera a que termine la publicación y abre Oihane con conexión para que el service worker nuevo se instale.

## Pruebas ejecutadas
- Sintaxis JavaScript (`node --check`).
- Sintaxis del service worker (`node --check`).
- Validación de `manifest.json`.
- Pruebas automatizadas de los flujos receta→compra, plan/curso→calendario, Wishlist→Regalos, Hogar→Compras y conservación de las claves locales.
- No se ha completado una prueba interactiva integral en un iPhone real; revisa los permisos y la importación/exportación de calendario después de publicar.
