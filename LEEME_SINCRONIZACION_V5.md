# Oihane v5 — sincronización y servicios

## Qué incluye

- Instantáneas locales de recuperación en IndexedDB (mantiene hasta 5 copias recientes en el mismo navegador/dispositivo).
- Copia JSON que incluye las claves de datos `oihane_*` de los módulos. La restauración permite **fusionar** (no borra los datos actuales) o **reemplazar** los módulos incluidos.
- Sincronización opcional entre dispositivos mediante una cuenta Supabase propia. No se activa hasta configurar el proyecto, crear la tabla y autenticarse. Tras conectar la cuenta, los cambios se suben con una pequeña demora y la sincronización manual también está disponible.
- Importación/exportación `.ics` para Apple Calendar y prueba/activación de notificaciones del navegador.
- Asistente local con más órdenes en español; dictado por voz si el navegador lo admite.

## Límite importante

GitHub Pages solo aloja archivos estáticos. No puede ejecutar de forma segura un servidor privado, sincronizar directamente con EventKit/Apple Calendar ni enviar notificaciones push por sí solo. Por eso la sincronización de Oihane requiere que la persona propietaria cree y configure Supabase; Apple Calendar se intercambia mediante `.ics`; y los avisos de navegador **no son fiables cuando Oihane está cerrada**. El asistente interpreta órdenes locales, pero no es un modelo generativo de IA. Para IA conversacional avanzada y notificaciones push fiables hace falta un backend con credenciales protegidas.

## Configurar Supabase para sincronizar

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor** y ejecuta el contenido de `supabase_oihane.sql`.
3. En **Project Settings / API**, copia la URL del proyecto y la clave pública `anon`/`publishable`. **No uses ni pegues nunca una clave `service_role`**.
4. Abre Oihane → **Más**. Introduce URL, clave pública, correo y contraseña; guarda la configuración.
5. Pulsa **Crear cuenta**. Si Supabase exige verificar el correo, abre el correo de confirmación y vuelve a Oihane para **Iniciar sesión**.
6. En el primer dispositivo, pulsa **Sincronizar ahora**. En el segundo dispositivo, abre la misma URL de Oihane, configura el mismo proyecto y entra con la misma cuenta. Pulsa **Sincronizar ahora** una primera vez.
7. Después, los cambios locales se sincronizan automáticamente con una breve demora cuando la conexión y la sesión estén disponibles.

### Reglas de fusión actuales

- Se incorporan los elementos con ID que falten en el dispositivo.
- Si un elemento con el mismo ID existe en ambos, prevalece la copia del dispositivo que inicia la sincronización.
- **Las eliminaciones no se propagan todavía**; borrar un elemento en un dispositivo puede hacer que vuelva a aparecer si sigue en la nube. Por eso no uses esto como sincronización definitiva de datos que se borran con frecuencia.
- La cuenta debe ser privada y las políticas RLS del SQL son obligatorias. Cada usuario solo puede leer o escribir su propia fila.
- La contraseña no se guarda. La URL, clave pública y sesión de acceso sí quedan en el almacenamiento local de ese navegador. Usa un dispositivo de confianza y cierra sesión si es compartido.

## Copias de seguridad

- Descarga una copia JSON desde **Más → Descargar copia JSON** antes de publicar actualizaciones importantes y guárdala fuera del teléfono, por ejemplo en iCloud Drive o el ordenador.
- Las instantáneas IndexedDB son una recuperación adicional **en ese mismo navegador**, no sustituyen a una copia externa ni se sincronizan solas.
- No borres los datos de Safari ni desinstales la app para intentar actualizarla.

## Apple Calendar y avisos

- En **Más → Exportar calendario para Apple** se descarga un `.ics` que se puede abrir/importar en Calendario de Apple.
- Para llevar cambios de Apple Calendar a Oihane, exporta un `.ics` desde Calendario y usa **Importar archivo .ics** en Oihane. Esto es intercambio manual, no sincronización bidireccional automática.
- **Activar avisos** solicita permiso y **Probar aviso** comprueba el permiso actual. Los recordatorios de la web requieren que Oihane esté abierta/activa; para avisos push fiables con la app cerrada se necesita un servicio push/backend y configurar permisos en el iPhone.

## Asistente

Ejemplos de órdenes locales:

- `Añade leche a la compra`
- `Crea una tarea para mañana: llamar al dentista`
- `He limpiado el baño`
- `He regado la monstera`
- `Añade una cita mañana a las 18 en Vitoria`
- `Qué tengo mañana`

La interpretación es intencionadamente limitada y local. Revisa los datos creados por órdenes ambiguas. No se envían órdenes a un proveedor de IA externo.
