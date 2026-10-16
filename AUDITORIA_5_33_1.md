# Auditoría Oihane 5.33.1 — dos revisiones

## Cambios implementados

- Flechas de plegar/desplegar unificadas con las de Mi agenda: `⌃` abierta y `⌄` plegada. Los botones de ordenar elementos (↑ / ↓) conservan su función y aspecto diferenciado. Se retiraron los signos `+` usados erróneamente como flecha de algunas secciones.
- Estilos de botones concentrados en un solo bloque canónico: verde claro `#E6ECDD` y borde `#C8D4BB`, igual al indicador de día actual en Calendario > Semana, que ahora lleva ese mismo borde. Incluye supermercados, añadir, buscar, historial, fechas importantes, tienda, calendario, paneles y formularios emergentes. Los iconos de borrar no se colorean como botones de acción.
- Fondos de subapartados con una sola tonalidad blanco cálido `#FFFEFA` en módulos, paneles y contenedores. Se conservan los encabezados específicos por familia de alimentos y las imágenes de cuadros.
- Recetas: nombre de todas las recetas a 11 px, DM Sans 400, tanto en Esta semana y Quiero aprender como en Habituales; encabezados de los apartados a 17 px.
- Estudio: botón **Añadir** y flecha alineados a la derecha del título en una única fila; el formulario se coloca tras esa fila antes de los elementos. Se conserva la distinción Guardias / Cursos / Temas.
- Mi agenda: 12 px a izquierda y derecha, incluido su estado plegado; no se modifica la fecha/hora de la columna izquierda.
- Hogar: título Compras pendientes a 17 px y nombres de las estancias a 14 px, con tipografía Playfair Display.
- Estilos retirados: regla 5.32.7 de botones oscuros, selector parcial 5.33.0 de botones, declaraciones obsoletas de flechas y variables huérfanas. No se ha reescrito la lógica general de módulos ni el guardado.
- Encabezado HTML y SW actualizados a 5.33.1; caché `oihane-v5331`.

## Primera revisión (estructura y sintaxis)

- 32 bloques JS verificados por Node `--check`, sin errores de sintaxis.
- 22 hojas `<style>` verificadas por el parser CSS, sin errores de análisis.
- Recursos `SUPABASE_oihane-ai_index.ts`, `icon.png` y `manifest.json` comparados byte a byte contra la versión 5.33.0: idénticos.
- Verificados cambios de cache PWA y reglas de persistencia, sin modificar las funciones de Supabase.

## Segunda revisión (regresiones y estilos calculados)

- 22+ invariantes programáticos comprobados: flechas, posiciones de botones, prioridad de reglas, tipografías, esquema de colores, protección de fecha/hora y lógica de siete días.
- Comprobaciones de `getComputedStyle` de Chromium con elementos representativos: Mi agenda 19 px, títulos de Recetas y Compras pendientes 17 px, salón-comedor 14 px, recetas 11 px uniformes, márgenes de Mi agenda 12 px en ambos laterales, coincidencia exacta de fondo/borde del día actual y botones generales.
- Detectado y corregido en esta segunda fase un conflicto de especificidad que imponía 19 px a un subtítulo de Hogar; revalidado a 14 px.

## Limitaciones

No se ha podido abrir ni probar de extremo a extremo el HTML completo como aplicación: las URLs locales y el servidor local de Chromium reciben `ERR_BLOCKED_BY_ADMINISTRATOR`; la ejecución del HTML completo mediante `set_content` supera el tiempo máximo, como en la versión anterior. Se pudieron comprobar estilos reales sobre elementos representativos sin ejecutar la aplicación entera. Por ello, **no se garantiza** el comportamiento en producción en un iPhone ni las llamadas reales a los servicios externos. Es necesaria una prueba manual antes de sustituir definitivamente la versión instalada.
