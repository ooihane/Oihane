# Propuesta: Espacios compartidos de Oihane (sin implementar)

**Decisión pendiente:** compartir por módulo completo o por elemento. Se recomienda **por elemento**, privado por defecto.

## Experiencia propuesta

- Cada persona entra a Oihane con su propia cuenta en Supabase.
- En Ajustes aparece «Espacios compartidos → Nueva casa / Invitar». Invitación mediante enlace o correo con vencimiento y aceptación expresa.
- En Tareas, Calendario y Hogar cada objeto tiene un campo «Visibilidad»: Solo yo / Nuestra casa. Nadie ve los elementos privados de la otra persona.
- Las tareas compartidas pueden asignarse a una persona concreta, ambas o dejarse sin asignar; cada usuario controla sus propios avisos.
- El calendario personal se mezcla visualmente con el compartido en la vista de cada cual, diferenciados por icono/etiqueta.
- Regalos no es compartible por defecto y no se incluye jamás mediante copia de seguridad completa en un espacio compartido.
- Historial de actividad de elementos compartidos: quién lo creó, completó o modificó, cuándo, qué cambió y cómo deshacer cambios permitidos.
- Si se elimina un miembro, se revocan lectura, escritura y notificaciones inmediatamente a nivel de base de datos.

## Arquitectura necesaria

Tablas independientes de la copia privada: `oihane_workspaces`, `oihane_workspace_members`, `oihane_workspace_invites`, `oihane_shared_tasks`, `oihane_shared_events`, `oihane_shared_home_items`, `oihane_activity_log`, `oihane_shared_notifications`. RLS para cada consulta y escritura. Roles propietario, editor y lector, y permisos de modificación/borrado por elemento. Versionado optimista (`revision`) para cambios concurrentes y mecanismo de recuperación para modificaciones simultáneas. IDs UUID para elementos compartidos.

## Orden de implantación

1. Crear datos de prueba y restaurar mecanismos de perfiles aislados en el mismo dispositivo; suscripciones Web Push asignadas a cuenta, desactivadas al salir.
2. Crear modelo SQL con RLS y pruebas de intento de lectura/escritura no autorizada.
3. Invitación y aceptación; compartir una tarea individual y sincronizarla con dos usuarios.
4. Añadir asignaciones, controles de edición y deduplicación de avisos por destinatario.
5. Ampliar a Calendario y después Hogar. Solo después considerar Compras, Planes, Pedidos, etc.
6. Probar offline, cambios simultáneos, expulsión, regalos privados y recuperación desde backup.

**No se deben compartir directamente las filas `oihane_backups` ni desactivar RLS para facilitar esta funcionalidad.**
