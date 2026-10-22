# Auditoría Oihane 5.59.5 (22/10/2026)

Comparación base: edición 5.59.1 (21 de octubre) y paquete 5.59.4.

## Causas verificadas en código
- 07-local-assistant crea 🔊 solo al entrar en Home y lo vuelve a crear mediante wrapper `window.home`; el redibujado directo `home()` elimina el nodo sin llamar necesariamente al wrapper.
- El botón original lleva `onclick=startVoiceInput()`, que puede resolver la versión antigua; los nuevos manejadores no siempre se invocaban.
- La oreja se crea dinámicamente desde 17; si Home cambia, debe reinstalarse. Se recupera la implementación del 21/10.
- 12-ai-actions parseQuick exige literalmente «en Mercadona» para una compra local; hay 3 capas que sustituyen `handleAssistantCommand`, causando rutas incongruentes.
- 17 5.59.4 añade un segundo observador de respuestas que puede duplicar/cancelar la voz central de 13. Se restaura el 17 anterior y se ajusta deduplicación de voz.
- El mensaje genérico de permisos viene del dictado antiguo en foundation, cuya función todavía está presente; no demuestra que el permiso esté denegado.

## Solución
- Control final 19 reinyecta 🔊 y llama a `oihaneEnsureWakeControl` en cada reconstrucción Home.
- Vincula el clic del micrófono explícitamente a `window.startVoiceInput`, eliminando el `onclick` antiguo.
- Solicitud de permiso opt-in visible en el primer Home de cada carga; `getUserMedia` solamente en clic y cierre inmediato de pistas. iOS decide si muestra ventana nativa de permisos.
- `parseLocal` determina comandos inequívocos de Compras y Tareas sin fecha/hora. Llama al motor validado `oihaneActionEngine.execute`, no a Gemini; no toca órdenes complejas.
- Se restaura la escucha de 17 en versión del 21 de octubre y se elimina segundo observador de voz; 13 central mantiene voz dependiente de 🔊.
- No se alteran datos, claves ni funciones de Supabase.

## Pruebas de regresión recomendadas
- Recargar y volver a Home varias veces; verificar 🎙️ 🔊 👂.
- Apagar 🔊, crear tarea; no debe hablar; encender y repetir con otra tarea; debe hablar.
- Con Gemini apagado: «añade leche a la compra», «añade pan a Mercadona», «crea una tarea llamar al dentista».
- Activar permisos por botón; dictar una frase con 🎙️; activar 👂 y decir «Oye, Oihane, qué tareas tengo pendientes».
- Una orden ambigua no debe crear nada de manera especulativa.
- Pruebas reales de micrófono y voz en iOS siguen siendo necesarias.
