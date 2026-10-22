# Oihane 5.59.6 — Registro del suelo y previsión de riego

## Corrección
- Una comprobación del suelo es un evento propio (`soilHistory`) con fecha local, hora (`at`), estado, espera y próxima fecha de revisión; no modifica `lastWatered` ni `wateringHistory`.
- Suelo mojado: 6 días; húmeda: 4; ligeramente húmeda: 2; sin especificar: 5.
- La siguiente revisión se calcula desde la **última comprobación válida**, no desde el último riego anterior. Si hay un riego posterior, prevalece el nuevo riego.
- Los riegos posteriores conservan todo el historial de comprobaciones, pero cancelan la previsión de suelo previa.
- Al cambiar el estado y pulsar Guardar, se crea la observación; también hay un botón explícito «Registrar estado del suelo hoy» para repetir la misma observación otro día sin cambiar de opción.
- Los registros anteriores no se alteran ni se rellenan con fechas inventadas.
- Se muestran fecha del estado, siguiente revisión y ambos historiales en el formulario y tarjeta de cada planta.
- Un riego nuevo queda registrado desde los botones de la interfaz y las rutas existentes del asistente.

## Verificación
- `node --check` para JavaScript de la aplicación.
- `TZ=Europe/Madrid node tests/test_soil_observations_5596.cjs`: pruebas con riego previo, humedad 6/4/2 días, fechas sin estado, nuevos riegos y cierre de año.
- Se ha construido sobre el ZIP íntegro 5.59.5; no se han modificado datos reales ni Supabase.

## Límite
- Los avisos de Plantas son la fecha y el estado de atención en la aplicación. No se ha implementado un sistema nuevo de notificaciones push de Plantas con la app cerrada.
- La nueva versión todavía necesita comprobación en un iPhone real y una copia JSON previa a la instalación.
