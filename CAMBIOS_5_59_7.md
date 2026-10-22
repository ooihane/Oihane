# Oihane 5.59.7 — almacenamiento de fotografías

- Fotos nuevas de Plantas: compresión adaptativa y límite aproximado de tamaño por imagen.
- Fotos existentes: herramienta **Optimizar fotos** bajo control del usuario, tras exportación JSON. Los demás campos, registros de riego y observaciones del suelo no se alteran.
- Base de comparación de Supabase: traslado seguro de `localStorage` a IndexedDB por cuenta con escritura y lectura verificadas antes de eliminar la copia duplicada del almacenamiento local.
- Mantiene el mismo formato de copia JSON y la misma sincronización con Supabase.
- Ningún archivo se publica automáticamente en GitHub ni Supabase.

## Recomendaciones

1. Descarga primero una copia JSON y verifica que está disponible en Archivos.
2. En Plantas selecciona **Optimizar fotos** y confirma tras guardar la copia.
3. No limpies los datos de Safari ni desinstales la PWA.

Nota: las miniaturas antiguas optimizadas reducen calidad visual y quedan preservadas en la copia JSON original. La optimización no elimina elementos.
