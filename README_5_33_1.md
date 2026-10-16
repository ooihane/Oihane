# Oihane 5.33.1 — entrega completa

Partimos de la versión 5.33.0. Para instalar esta actualización, conserva una exportación JSON de tus datos, publica `index.html`, `sw.js`, `manifest.json`, `icon.png` y la carpeta `icons/` en la misma estructura del despliegue anterior. No es necesario volver a desplegar `SUPABASE_oihane-ai_index.ts`; se incluye por integridad pero no se ha modificado. Revisa la versión instalada tras cerrar y reabrir la PWA (su caché cambia a `oihane-v5331`).

La hoja de estilos nueva se encuentra integrada en el `index.html`, en el bloque identificado como `oihane-5330-finish`; no hay que cargar CSS externo. Se han eliminado declaraciones históricas obsoletas de botones y flechas que contradecían la paleta nueva, sin borrar los módulos antiguos ni su lógica de persistencia.

**Atención:** las pruebas de Chromium completas de la aplicación están bloqueadas en este entorno. Se han revisado los 32 scripts, los 22 bloques CSS y se ha probado el estilo calculado en elementos de muestra con Chromium. Comprueba manualmente la funcionalidad en Safari/iPhone tras el despliegue, especialmente el plegado de Estudio, el botón Añadir, los formularios y Supabase.
