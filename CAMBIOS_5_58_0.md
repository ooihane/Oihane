# Oihane 5.58.0 — estabilidad de Plantas, nombres y Trabajo

- Plantas: el umbral de atención depende del estado de riego seleccionado, 6 días (Suelo mojado), 4 (Húmeda), 2 (Ligeramente húmeda). Si no se escoge estado, 5 días desde el último riego.
- Plantas: historial individual acumulativo `wateringHistory` con fecha, instante y estado opcional, incluido botón `Registrar riego hoy` para registrar varios riegos en un mismo día. Se preserva el último riego conocido cuando comienza un historial nuevo; los riegos anteriores no registrados no se pueden reconstruir.
- Plantas: renderizar no llama a `saveExtra` ni fuerza sincronización de la nube; formularios abiertos protegidos frente al repintado por sincronizaciones de módulos compartidos. Edición de planta restaurada.
- Cuentas y saludos: comillas tipográficas, angulares y rectas exteriores eliminadas al mostrar nombres, también al mostrar el campo en Ajustes. El nombre guardado durante una actualización de perfil se normaliza en el dispositivo.
- Trabajo: incluido y probado el calendario **unificado** creado en 5.54: una sola pestaña Trabajo, un calendario por mes con verde Rubén/rosa Oihane, Rotación y Añadir arriba, sin doble calendario o lista semanal inferior; los cambios de Trabajo de 5.54 a 5.57 ahora sí están dentro de ESTE ZIP. La versión que GitHub Pages cargaba previamente conservaba un script antiguo de dos calendarios: publicar un parche parcial no es suficiente.
- Recetas: mismo espaciado entre apartados que el resto de módulos, sin recortar el tamaño de las recetas habituales.
- Conservadas todas las demás funciones de 5.57, sin cambios en Supabase.

## Comprobaciones

- Validación de sintaxis de todos los JavaScript (Node.js).
- Smoke test de 14 módulos en Chromium sin errores de JavaScript.
- Prueba de edición de Plantas, cambio de estado y registro de dos riegos con acumulación histórica.
- Un solo botón Trabajo y un solo calendario mensual unificado.
- Pruebas unitarias de umbrales de 2, 4, 5 y 6 días.
- Campo de nombre de cuenta sin comillas exteriores.

**No sustituye una prueba real en iOS y sincronización entre dos cuentas.**
