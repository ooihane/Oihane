# Auditoría técnica de Oihane 5.32.8

## Origen
Basado en Oihane 5.32.6 completo e integra la tipografía global preparada en el borrador de 5.32.7, antes de los cambios de voz y Mi agenda.

## Cambios verificados estáticamente
- Ocho colores por número de sección: azul pizarra, musgo, lavanda antigua, terracota, rosa arcilla, gris salvia, cacao y ocre dorado; se repiten tras el octavo.
- Títulos Playfair Display 19px 600; subtítulos Playfair Display 16px 500 negro; elementos DM Sans 12px 500 negro; metadatos DM Sans 10px 400 gris; notas DM Sans cursiva 9px 500 gris; controles DM Sans 11px 600.
- Botones habituales: color de texto verde oliva oscuro, fondo salvia, borde verde oliva oscuro y radios de 10px. Priorizaciones protegidas del cambio tipográfico.
- La fecha y hora izquierda en Mi agenda, Calendario, Tareas, Planes, Guardias y Cursos retiene la tipografía y el gap 4px de 5.32.6.
- Añadida barra izquierda de 3px del mismo color variable del encabezado del apartado.
- Mi agenda no muestra la categoría de las tareas, sin alterar la categoría subyacente.
- Una única ruta de voz controla la síntesis: se eliminan llamadas de cancelación incompatibles en el asistente local antiguo y se añade observación de #assistantResult como respaldo.
- Supabase Edge `oihane-ai` intacta; cuota de 90 y claves originales conservadas.
- Service Worker actualizado a caché `oihane-v5328`.

## Pruebas
- Análisis de sintaxis del JavaScript incrustado y código Supabase en TypeScript: sin errores sintácticos.
- Prueba de la ruta unificada de voz con simulación: una confirmación duplicada se pronuncia una sola vez; una segunda confirmación se pronuncia correctamente.
- Integridad ZIP comprobada, 13 iconos en paquete completo.

## Límites
- No se ha completado validación visual en iPhone; Chromium de este entorno devuelve ERR_BLOCKED_BY_ADMINISTRATOR al abrir la página.
- Safari/iOS puede bloquear la reproducción automática de voz tras operaciones asíncronas. Un gesto de usuario inicial mejora la compatibilidad, pero la reproducción no es garantizable sin probar el iPhone real.
- La asignación de color por sección usa selectores del DOM actual. Algunas subsecciones dinámicas no incluidas en los selectores podrían requerir adaptación tras prueba visual.
- Esto no es una auditoría funcional exhaustiva de todas las operaciones de los 13 módulos; se concentra en los cambios solicitados en esta ronda.
