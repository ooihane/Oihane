# Cuentas compartidas — Oihane (especificación acordada, sin despliegue)

## Usuarios e invitación
Dos cuentas Supabase independientes: Oihane (existente) y Rubén (nueva). Sin tercer espacio visible. Invitación mediante enlace y código temporal de un solo uso, 24 h y aceptación autenticada. Ninguna cuenta enlazada todavía.

## Compartición y permisos
- Compartidos íntegros y editables por ambos: Compras, Hogar, Plantas, Recetas, Viajes; Cultura: Películas y Series (vistas y pendientes).
- Mixtos: Tareas, Calendario, Planes: casilla «Compartir con Rubén/Oihane» activada por defecto **solo para elementos nuevos**. Solo el creador puede modificar, completar, eliminar y recuperar; el destinatario puede leerlos y configurar sus recordatorios personales sin modificar el elemento.
- Pedidos: compartidos y editables por ambos por defecto; casilla para mantener pedidos privados.
- Wishlist: privado por elemento; casilla de compartir activada por defecto. Los deseos compartidos se presentan como sugerencias en Regalos de la pareja, **sin compartir** notas, estado de compra ni otros metadatos secretos. El dueño es el único que edita el deseo.
- Regalos: privados por cuenta; Estudio: oculto en cuenta Rubén; resto de Cultura privado.
- Notificaciones: personales para cada usuario; la suscripción push corresponde a su cuenta, y se revoca al cerrar sesión.
- Migración: preservar todas las copias privadas; compartir antiguos datos de módulos íntegramente compartidos y revisar uno a uno los antiguos elementos mixtos **antes** de compartir. Crear exportación JSON verificable antes de comenzar.
- Papelera: 30 días, recuperable con los mismos permisos; no se muestran borrados privados de la otra cuenta.
- Sin historial general de actividad. Solo registros de **conflictos** de edición para resolver cambios simultáneos; retención máxima de 90 días.
- Ediciones concurrentes: fusión de cambios en campos distintos; conflicto del mismo campo requiere elegir versión. Versiones/etiquetas de concurrencia y cola local de operaciones offline (no copiar el JSON completo para sincronización compartida).
- Desvinculación: ambos conservan copia independiente de módulos íntegramente compartidos, datos personales permanecen exclusivos de su autor; envíos push y acceso compartido se revocan.

## Arquitectura y seguridad pendiente de implantar
El Supabase actual contiene `oihane_backups` por usuario y tablas de push; no proporciona tablas de registros compartidos. **Nunca otorgar acceso de pareja a `oihane_backups` ni usar permisos a nivel de cliente exclusivamente**.

Fases propuestas:
1. Esquema nuevo aislado: parejas, invitaciones con hash de código, registros por módulo con autor y visibilidad, permisos RLS, papelera `deleted_at`, cambios con `revision` / `field_version`, conflictos y avisos personales.
2. Políticas RLS de lectura según relación activa y visibilidad; modificaciones solo por autor en mixtos y ambos en completos; evitar reatribución de autor y escalada de permisos.
3. Pruebas automatizadas con dos cuentas de prueba para detectar lecturas/escrituras indebidas, secretos Wishlist-Regalos, desvinculación, cambios simultáneos y borrado.
4. Integrar invitaciones y migración con revisión; después incorporar módulos de uno en uno, sin tocar el sistema push actualmente funcionando hasta verificar.

**Situación:** documentación únicamente. Ninguna migración SQL aplicada y ningún usuario invitado.
