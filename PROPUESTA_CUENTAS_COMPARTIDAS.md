# Oihane — módulos compartidos en 5.37.0

El vínculo entre las dos cuentas ya está activo. Supabase conserva cada copia privada bajo sus políticas RLS; no se comparten copias completas de oihane_backups.

## Integración actual

- Completamente compartidos: Compras, Hogar, Plantas, Recetas, Viajes y únicamente películas/series dentro de Cultura.
- Compartidos individualmente: Tareas, Calendario, Planes, Pedidos y Wishlist, mediante casilla al crear o editar. Los registros antiguos no se publican automáticamente.
- Tareas, Calendario, Planes y Wishlist: solo el creador modifica. Pedidos compartidos: ambos pueden editar.
- Regalos se mantienen personales, mostrando como sugerencias los deseos expresamente compartidos por la otra persona sin revelar notas ni estado de compras secretas.
- Estudio está oculto para Rubén.
- El nombre de saludo se guarda por cuenta en oihane_user_profiles mediante RLS.
- Al guardar se programa la sincronización automática; mientras la PWA está visible, se comprueba aproximadamente una vez por minuto y también al volver a primer plano.
- Si los dispositivos editan el mismo campo se solicita elegir una versión. Se conserva la última línea base local para poder reconciliar cambios sin conexión.

## Migración y restricciones

Se importaron de forma idempotente los registros del invitador de Compras, Hogar, Plantas, Recetas y películas/series. Viajes no contenía registros iniciales. Se conservaron las copias originales.
Libros, obras de arte, museos y todos los registros antiguos de módulos mixtos siguen privados.

## Pendiente

- Verificación manual en ambos móviles, especialmente al compartir y dejar de compartir un elemento.
- Papelera con pantalla de recuperación y purga real tras 30 días; actualmente solo existe borrado lógico en la base de datos.
- Automatización del proceso de desvinculación, con copias independientes de los módulos completamente compartidos.
- Recordatorios personales sincronizados entre dispositivos de la misma cuenta; ahora no se envían a la pareja.
- Refinar la gestión de conflictos y registros de conflicto con retención de hasta 90 días.

Archivos activos: index.html, sw.js, shared.js, shared-modules.js, mixed-shared.js y account-settings.js, todos en la raíz. Iconos en icons/.
