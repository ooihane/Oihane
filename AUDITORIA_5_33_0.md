# Oihane 5.33.0 — auditoría de código y segunda revisión

**Origen:** Oihane_5_32_8_COMPLETO(1).zip, facilitado por el usuario. La función `SUPABASE_oihane-ai_index.ts` y los recursos gráficos originales se conservan sin cambios. Las modificaciones se concentran en `index.html` y la revisión de caché en `sw.js`.

## Hallazgos y correcciones

### HOME
- Mi agenda: próximo intervalo de **siete días contando hoy**; los eventos y planes con fecha de ese periodo, y las tareas pendientes de prioridad alta y media con fecha comprendida en ese intervalo.
- Desaparece la lista adicional indefinida de eventos posteriores y se muestra la prioridad de las tareas.
- Etiqueta `Mañana`; encabezado `Mi agenda`; lugar `Vitoria`; fila de saludo/fecha con presentación horizontal desde la carga.
- Ajustada tipografía; sin barra azul izquierda. **Se mantiene la definición original 5.32.6 de fecha y hora en la columna izquierda.**

### COMPRAS Y CALENDARIO
- Editor de compra con selector del supermercado destino; cambio conservado en el registro.
- Categorías de supermercado con ocho familias de colores, menor altura y menos líneas separadoras.
- Calendario: primera pestaña `Todos`, vista predeterminada con todos los eventos guardados ordenados cronológicamente.
- Mes: solo registros de eventos (incluye elementos vinculados de Planes/Estudio mediante eventos), sin tareas; texto centrado en los días.

### TAREAS Y PLANES
- Ocultos subtítulos Alta / Media / Baja, conservando las etiquetas de prioridad y líneas divisorias entre grupos; menor espaciado.
- Recurrencias: frecuencia en columna izquierda; `Previsto` y `Fecha de última realización`. Si la fecha quedó vencida sin marcarse, la etiqueta `Previsto` avanza a mañana en la presentación, sin falsificar una realización.
- Tercera sección habitual: `Completadas`.
- Planes sin fecha: las ideas no reservan columna izquierda para fecha/hora.

### HOGAR, WISHLIST, REGALOS
- Estancias ordenadas: General, Salón-comedor, Cocina, Dormitorio, Habitación de invitados, Despacho vestidor, Baño principal, Baño de invitados y Terraza. Conversión de denominaciones anteriores conocidas y asignación `General` a elementos sin estancia.
- Compras pendientes: precio objetivo, notas, foto, web, búsqueda de precios y casilla Black Friday (visible solo marcada). Se ocultan mensajes `Sin compras pendientes`.
- `Mis tiendas favoritas` con campo web y botón `Ir`.
- Wishlist: web, casilla de conseguido que persiste; botones buscar y borrar a su izquierda. Nueva sección `Mis compras favoritas`, con `Ir` en vez de buscar.
- Regalos: precio, notas, foto, web y búsqueda de precios; botón `+ Persona` reubicado; solo próxima fecha visible y Navidad como ocasión anual para todas las personas; sin textos vacíos redundantes.

### ESTUDIO, CULTURA Y RESTO DE MÓDULOS
- Guardias: categoría Urgencias/Planta/Tarde, con fecha, hora, ubicación, fin, avisos y notas; modalidad oculta para guardias. Se usa título interno descriptivo para mantener compatibilidad con los datos y calendario actuales.
- Cultura: seis categorías, incluyendo películas y series pendientes y vistas, con información persistente para registros nuevos. Compatibilidad con registros anteriores.
- Búsqueda Cultura: mantiene Google Books y Open Library; incorpora consulta de TVMaze para series y de Wikidata para arte/artistas, además de las fuentes previas. Los resultados son coincidencias probables y se deben revisar antes de guardar.
- Ajustados estilos, tamaños de texto y controles en Plantas, Recetas, Viajes y resto de secciones; flechas verdes de plegado uniformadas.

### ASISTENTE
- Consultas para las tareas de hoy/mañana: solo tareas no completadas de prioridad media o alta, correspondientes exactamente a la fecha pedida; las respuestas no contienen fecha ISO ni fechas completas, solo la hora si existe.
- Se conserva la ruta de síntesis de voz centralizada, con reanudación de síntesis pausada cuando es posible. **Safari/iOS puede impedir determinadas reproducciones mediante sus restricciones de audio y es imprescindible comprobarlo en el dispositivo.**

## Verificación efectuada

- 32 bloques de script presentes; cada bloque JavaScript comprobado con `node --check`: correcto.
- Validaciones estáticas específicas de las modificaciones funcionales: 19/19 correctas.
- Comparación SHA-256 del archivo de función Supabase con el ZIP original: idéntico.
- Actualización de la versión a 5.33.0 y del cache de PWA a `oihane-v5330`.
- Empaquetado ZIP y comprobación de integridad.

## Límites de las pruebas

No se ha podido completar la prueba visual/interactiva del navegador: Chromium en este entorno bloquea, con `ERR_BLOCKED_BY_ADMINISTRATOR`, la navegación a archivos locales y al servidor de prueba; el ZIP de origen tampoco consigue cargarse mediante la alternativa de HTML incrustado. Por tanto, la prueba estática **no equivale** a confirmar todos los flujos reales de la PWA, su sincronización en producción, las búsquedas externas o la respuesta de voz en un iPhone. La edición de guardias y la reproducción de voz son las verificaciones manuales prioritarias.

## Instalación segura

1. **Exportar una copia JSON de los datos desde Ajustes** en la app instalada.
2. Sustituir `index.html` y `sw.js` en la raíz del despliegue GitHub Pages, o publicar el ZIP completo si se desea desplegar desde cero.
3. Dejar intactos los datos de Supabase, sus tablas y las funciones Edge; no hace falta volver a desplegar el `.ts` incluido.
4. Recargar Oihane y comprobar en la pestaña principal que aparezca la versión 5.33.0. Puede ser necesario cerrar y reabrir la PWA para renovar su caché.
5. Probar el guardado/edición en Hogar, Wishlist, Regalos, Guardias y Cultura, y comprobar una respuesta del asistente con el altavoz activado.
