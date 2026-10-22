# Oihane 5.59.8 — solución de fotos y registro independiente de cuidados

## Fotografía de las plantas

- Las imágenes dejan de guardarse en `localStorage`: se almacenan en `IndexedDB` con un identificador SHA-256, guardado y lectura verificados antes de cambiar la ficha.
- Las fotografías anteriores se migran de manera segura al entrar en Plantas, al guardar una foto o al sincronizar. También se reducen duplicaciones en la base local de comparación de Plantas compartidas.
- No se borran fotografías ni se reduce la calidad de las ya existentes. Las fotos nuevas conservan una resolución de hasta 720 px.
- El botón **Liberar espacio de fotos** permite descargar una copia JSON completa y migrar las fotografías existentes bajo control del usuario.
- Las copias JSON, la sincronización general y la sincronización de Plantas compartidas convierten temporalmente las referencias a las imágenes completas. Otros dispositivos las descargan y las guardan en su propio IndexedDB.
- No se ha creado ningún bucket ni se ha modificado la base de datos de Supabase.

## Dos registros independientes

- **Registrar riego hoy**: añade fecha y período elegido al historial de riegos. No registra el estado del suelo.
- **Registrar estado del suelo**: añade fecha, etiqueta, período elegido y fecha de próxima atención al historial de comprobaciones. No altera el último riego.
- Ambos tienen su propio control de días de espera, entre 1 y 365. Para estados del suelo se proponen 6, 4, 2 o 5 días, pero se pueden cambiar.
- La fecha de próxima atención se cuenta desde la última acción registrada, sea riego o estado del suelo.
- Guardar la ficha, cambiar nombre, foto o notas no registra acciones ficticias.

## Seguridad y limitaciones

1. **Antes de usar Liberar espacio de fotos, exportar JSON y confirmar que está guardado en Archivos/iCloud.**
2. **No borrar datos de Safari, no desinstalar la PWA.** IndexedDB conserva las fotos en el mismo origen; si iOS elimina todo el almacenamiento del sitio, será necesaria una copia JSON o la recuperación desde Supabase.
3. Aunque se corrige el cuello de botella de las fotos de Plantas, otros módulos que todavía usan fotos Base64 podrían consumir el límite de `localStorage`. No se borra ningún dato de esos módulos automáticamente.
4. Las pruebas de lógica y sintaxis se han ejecutado fuera de iOS. Pendiente la prueba en el iPhone real.
5. La actualización se entrega como ZIP local. **No se publica sin la autorización expresa del usuario.**
