# Propuesta de Oihane compartida — fase de diseño

No está implementada en 5.32.9. Hay que crear tablas y políticas RLS antes de mostrar datos compartidos.

- Cada usuario mantiene su cuenta Supabase y su copia privada.
- En Ajustes → Compartir se crearía un espacio «Nuestra casa» con invitación individual a la pareja. La invitación exige que el destinatario inicie sesión con su propia cuenta.
- Por defecto solo se comparten tres módulos independientes: Tareas, Calendario y Hogar. Compras y Planes serían optativos. Regalos, Wishlist, preferencias, claves y toda la copia privada jamás se comparten por defecto.
- Cada ítem de esos módulos será «Privado» o «Compartido». El permiso no se hereda automáticamente de otros elementos ni de enlaces entre módulos.
- Tablas distintas para workspaces, memberships, invites y shared_records; filas vinculadas a un espacio. Row-Level Security debe comprobar miembro activo y permiso read/write por módulo y registro.
- Invitaciones con caducidad, revocación de miembros y registro de cambios. Nunca incluir service_role ni secretos privados en la app.
- Sincronización con reconciliación de conflictos por versión/timestamp; no sobreescribir a ciegas copias completas de localStorage de un usuario con las del otro.
- Notificaciones compartidas se generan solo para destinatarios autorizados, respetando sus preferencias.
- Empezar con prueba aislada en Tareas usando cuentas de prueba y no compartir datos existentes hasta comprobar las políticas RLS.
