# Oihane 5.59.2

- Estudio: la mera visualización ya no escribe ni sincroniza cambios de clasificaciones.
- Recuperación local: botón para fusionar la instantánea guardada anteriormente (con confirmación).
- Recuperación de archivo: función `oihaneRestoreArchivedItems()` manual; no se ejecuta en el inicio.
- Calendario Mes: muestra todos los eventos que existan en cada fecha, sin límite de dos y con navegación histórica.
- Calendario Todos: mantiene eventos pasados y futuros que permanezcan en los datos.

IMPORTANTE: esta actualización NO recupera elementos ya eliminados si no están en la copia local, el archivo o la nube. No se han cambiado los datos de Supabase. Antes de importar o recuperar, exportar copia JSON actual.