# Oihane 5.31.8 — Revisión técnica y condiciones de instalación

## Fuentes

- Base: Oihane 5.31.7, paquete completo disponible en la biblioteca del usuario.
- Iconos de referencia: *Infografía mediterránea de 13 iconos.png* (13 de octubre), la lámina final aprobada.
- Secret/modelo Gemini y autenticación: configuración ya existente de `oihane-ai` y `GEMINI_MODEL`; no se incluyen claves privadas.

## 1. Iconos — reparación estructural

- Eliminados los 13 SVG anteriores del mapa de iconos y los estilos/observadores de iconos de 5.31.6/5.31.7 que añadían una capa pictórica entre icono y fondo.
- 13 imágenes independientes `icons/*.png`, recortadas de la lámina aprobada; se han conservado símbolos botánicos, colores, flor de Más y avión blanco de Viajes.
- Un único generador `moduleIcon(name)` para Home, encabezados y navegación. Los recursos están centrados con flexbox, sin desplazamientos/transformaciones heredados en estos contenedores.
- Pintura de fondo: URL original de la cabecera, a `opacity:.30` (70 % de transparencia). El dibujo principal conserva 100 % de opacidad.
- El Service Worker precarga los 13 iconos usando caché `oihane-v5318`.

## 2. Motor de acciones común

- Operaciones: `create`, `update`, `delete`, `move`, `complete`, `water`, `note`, `query`.
- Destinos: Compras, Calendario, Wishlist, Regalos, Hogar, Plantas, Recetas, Estudio, Viajes, Cultura, Planes, Tareas, Más.
- Campos por módulo permitidos explícitamente; comprobación de fecha/hora, estancia, supermercado, destinatario y prioridades.
- Notas en el campo `notes`. En Tareas se sincroniza también el campo antiguo `context`.
- Confirmación antes de eliminar; si no existe coincidencia o hay varias, no se elimina nada.
- Se pueden distinguir coincidencias mediante `selector` (fecha/persona/tienda/estancia).
- El último elemento se mantiene como contexto de sesión limitado a 20 minutos, sin subir listas completas a Gemini.
- Se calculan los cambios en copias de los arrays antes de guardarlos; si alguna acción del grupo falla la validación o no encuentra el elemento, no se guardan las otras acciones.
- Las acciones rápidas locales no consumen Gemini; las órdenes complejas se interpretan en `oihane-ai`.
- Planes y cursos/guardias fechados producen un evento enlazado en Calendario; se elimina el enlace al borrar el elemento de origen.
- Se conserva la cuota interna de 90 por día por usuario y el aviso de límite, sin contador visible.

## 3. Comprobaciones ejecutadas

- Comprobación de sintaxis de 23 bloques JavaScript: correcta.
- Transpilación TypeScript de `SUPABASE_oihane-ai_index.ts`: sin errores de sintaxis.
- Test de motor sin red: creación en los 13 módulos, modificación de categoría y prioridad, mover compra, nota, riego, borrado, completar, eventos vinculados, ambigüedad y rechazo completo de acciones agrupadas parcialmente inválidas: correcto.
- Archivo Service Worker: sintaxis válida, una declaración de iconos.
- Archivos ZIP: integridad y presencia de 13 PNG: correctas.
- No se ha realizado prueba end-to-end contra Supabase/Gemini real, ni test visual satisfactorio de Chromium o prueba en iPhone. Esto requiere una instalación controlada.

## 4. Límites y precauciones

- Interpretación espontánea: puede haber respuestas dudosas de Gemini, que Oihane rechazará si no encajan en el esquema. Las órdenes ambiguas requieren más detalles.
- El módulo Más permite guardar preferencias como elementos informativos; no cambia ajustes privados/credenciales mediante voz.
- Cultura tiene secciones nuevas de artistas y pintores favoritos, pero los editores antiguos no conservan necesariamente la clasificación al editar; hay que probarlo en dispositivo.
- Notas en campos que los formularios antiguos no muestran seguirán guardándose, pero pueden no ser visibles en todas las pantallas.
- La interfaz de Oihane contiene lógica anterior; esta actualización la envuelve y no sustituye todos sus formularios. No afirmar paridad total hasta pruebas reales.
- Borrado de un evento enlazado desde Calendario deja el elemento de origen en su módulo. Borrar el origen sí elimina el evento enlazado.
- Los iconos son recortes independientes de una maqueta generada (no vectores editables originales); están muy próximos a la lámina de referencia, pero la extracción puede conservar bordes pictóricos suaves dentro del recorte.
- Google/Gemini debe seguir utilizando el secreto `GEMINI_MODEL` ya funcional; no se cambia `DISPATCH-PUSH`.
- No borrar ni reinicializar el almacenamiento local; hacer backup JSON y pruebas con elementos de ejemplo.
