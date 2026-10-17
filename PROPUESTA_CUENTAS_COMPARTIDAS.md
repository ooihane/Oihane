# Oihane — cuentas compartidas

**Estado actual: Oihane 5.36.8.** Vinculación activa mediante enlace/código; la primera fase de compartición está conectada en **Compras**. Esta documentación sustituye a la propuesta antigua, que todavía indicaba que no se había implementado.

## Acordado

- Dos cuentas independientes, nombres de saludo Oihane y Rubén según el usuario autenticado.
- **Completamente compartidos y editables por ambos:** Compras, Hogar, Plantas, Recetas, Viajes y Cultura (solo películas/series).
- **Compartidos por elemento; solo el creador modifica:** Tareas, Calendario y Planes. Nuevos elementos compartidos por defecto, los antiguos requieren revisión individual.
- **Pedidos:** compartidos por defecto con opción de ocultar cada uno; aún **no activado**.
- **Wishlist:** los deseos que cada cual decida compartir aparecerán en Regalos de la pareja, sin exponer anotaciones de compras secretas. Regalos sigue privado.
- **Estudio:** solo en la cuenta Oihane; debe ocultarse en la de Rubén.
- Papelera recuperable 30 días; conflictos de edición hasta 90 días; sin historial general.
- Desvinculación: ambos conservan copia independiente de módulos completamente compartidos; los personales permanecen exclusivos.
- Avisos por usuario, independientes; no transferir suscripciones push entre cuentas.

## Primera fase activada

- La migración de Compras tomó los productos de la copia personal original de la cuenta invitadora, conservando ambos backups privados sin alterar.
- Los productos se guardan individualmente en `public.oihane_shared_records`, con vínculo activo, autor y RLS por pareja.
- Cliente: `shared.js` en la raíz. Carga Compras por cuenta, compara versiones y conserva cambios de campos distintos; ante el mismo campo modificado pide elegir, con cola de sincronización y revisión periódica.
- Un producto eliminado pasa a la papelera mediante `deleted_at`; la vista de papelera y purga automática a 30 días **no están implementadas todavía**.
- Verificados mediante pruebas con rollback: ambas cuentas leen los productos compartidos, la otra puede editarlos, un tercero no puede y el invitado no accede a `oihane_backups` del invitador.
- Las pruebas no sustituyen la comprobación presencial con dos móviles.

## Pendiente y no activado

Hogar, Plantas, Recetas, Viajes, películas y series, módulos mixtos, Pedidos y Wishlist-Regalos. Es necesario completar la adaptación de sus respectivas altas, modificaciones, bajas y revisión inicial antes de migrarlos. **Nunca compartir por completo `oihane_backups` ni añadir acceso general a él.** Antes de activar cada fase, contrastar los permisos y conservar copias de seguridad.

La versión operativa anterior puede restaurarse mediante el historial de `main` de GitHub.
