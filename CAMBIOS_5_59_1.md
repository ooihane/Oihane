# Oihane 5.59.1 — persistencia e interfaz

- Corregida la causa identificada de Estudio vacío: la rutina retirePastEntries archivaba y retiraba cursos y guardias anteriores a hoy.
- Desactivada la retirada automática de eventos históricos y elementos de Estudio/Planes.
- Recuperación aditiva, por ID, de elementos aún guardados en `oihane_expired_archive_v1` (sin duplicados). Si un registro no está en almacenamiento local, no puede recuperarse mediante este cambio.
- Calendario: vista Todos incluye eventos pasados; las vistas semanales y mensuales mantienen su filtro temporal.
- Compras: verificación y reparación de lista visible al volver al primer plano y cambiar de tienda; no borra productos.
- Avisos: se elimina el chequeo inmediato que podía crear avisos fugaces al arrancar; recordatorios programados continúan con el temporizador.
- Cuadrícula Home: restricciones de tamaño de iconos y celdas para evitar desalineación transitoria en iOS.
- Se renovó versión de recursos y caché del service worker.

**Precaución:** No se han ensayado sesiones reales en un iPhone ni sincronización remota. Conserva una copia JSON de Oihane antes de instalar. No se ha publicado en GitHub ni Supabase.