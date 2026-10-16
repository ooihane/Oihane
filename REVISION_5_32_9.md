# Revisión técnica — Oihane 5.32.9

Origen: Oihane 5.32.8 completa, sin cambios en el intérprete `oihane-ai`.

## Cambios
- `DISPATCH-PUSH`: notificaciones de tareas y calendario muestran un único título de acción «Quedan X minutos/horas para…»; menos de 60 min = minutos, a partir de 60 min = horas, redondeadas al alza con «aproximadamente» para fracciones. A la hora exacta «Es la hora de…». No se añade «Oihane» como título de la notificación, pero iOS identifica obligatoriamente la app emisora.
- `sw.js`: no añade el texto por defecto «Tienes un recordatorio» cuando el cuerpo viene vacío. Se cambia la versión de caché.
- Avisos locales: idéntico formato, con comprobación de vencimiento real y no simplemente de tarea pendiente a lo largo del día. En usuarios suscritos a push, mantiene la preferencia por notificación remota para evitar duplicados.
- Voz: sin controles de preferencias en la barra. Misma voz española detectada por el dispositivo y recordada localmente; los avisos hablados siguen sujetos a Safari.
- Colaboración: documento de diseño únicamente. No se ha implementado ni modificado sincronización, permisos, tablas o RLS.

## Pruebas realizadas
- Todos los bloques JavaScript incrustados: 31 con sintaxis válida, revisados con Node.js `--check`.
- Service Worker: sintaxis válida.
- `DISPATCH-PUSH` y `oihane-ai`: TypeScript transpilado sin errores de sintaxis.
- Formato: 8 casos frontera para notificación push y 8 casos equivalentes de aviso local (0, 1, 15, 59, 60, 90, 120 y 1440 minutos).
- No se detecta creación del botón opcional de respuesta hablada en la barra.
- Integridad de ZIP y lista de archivos verificada tras empaquetar.

## Pendiente de validar
- Prueba real de Web Push desde Supabase y despliegue en el iPhone.
- Voz real en iOS; el navegador puede suspender reproducción.
- El código de `DISPATCH-PUSH` procede del último archivo recuperado de la biblioteca de Oihane; no se pudo inspeccionar el código desplegado en Supabase directamente. Antes de sustituirlo, comparar con cambios que hayas hecho manualmente en el dashboard.
