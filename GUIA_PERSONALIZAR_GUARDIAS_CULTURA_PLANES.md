# Guía para personalizar Guardias, Cultura y Planes — Oihane 5.32.3

## Cómo se modifica

Abre **`index.html`** en GitHub y busca el texto **`OIHANE 5.32.3 — GUARDIAS / CULTURA / PLANES`**. Justo debajo encontrarás las variables y las reglas CSS que usa la app. **No necesitas saber programar**: modifica los valores que están a la derecha de los dos puntos y guarda los cambios en GitHub. En esta actualización también se adjunta una copia idéntica del bloque en `ESTILOS_EDITABLES_5323.css` para que puedas leerlo sin buscar en el HTML. **Ese CSS es una referencia; modificar solo su copia no cambia la app**, porque el bloque está integrado en `index.html`.

## Formato de los valores

| Propiedad | Qué significa | Ejemplo de cambio |
|---|---|---|
| `font-size` | Tamaño de texto en píxeles | `12px` a `14px` |
| `font-family` | Tipo de letra | `Georgia, serif` para estilo clásico; `system-ui, sans-serif` para moderno |
| `font-weight` | Grosor de la letra | `400` normal; `600` seminegrita; `700` negrita |
| `color` | Color del texto | `#3d4b3b` verde grisáceo |
| `background` | Color de fondo | `#fffefa` blanco crema |
| `gap` | Espacio entre elementos | `8px` a `12px` |
| `padding` | Espacio interior de la casilla | `10px` a `14px` |
| `margin-bottom` | Espacio bajo cada apartado | `8px` a `14px` |
| `border-radius` | Redondez de esquinas | `8px` a `14px` |
| `line-height` | Altura entre líneas de texto | `1.5` a `1.7` |

## Guardias dentro de Estudio

| Variable editable | Qué modifica | Valor actual |
|---|---|---|
| `--oihane-guardias-letra` | Nombre de la guardia | `12px` |
| `--oihane-guardias-fecha` | Día y hora de guardia | `10px` |
| `--oihane-guardias-espaciado` | Separación de columnas | `8px` |
| `--oihane-guardias-tinta` | Color de texto | `#3d4b3b` |
| `--oihane-guardias-fondo` | Fondo | `#fffefa` |

Las reglas usan los selectores `.v520-course-row`, `.v520-course-main strong` y `.v520-course-date` dentro de **Estudio**. Se aplican también a filas de cursos con el mismo formato, porque Guardias y Cursos comparten componente de lista. Si quieres separarlos por completo más adelante tendremos que asignarles clases diferentes.

## Cultura

| Variable editable | Qué modifica | Valor actual |
|---|---|---|
| `--oihane-cultura-letra` | Nombre de una obra/libro/serie | `12px` |
| `--oihane-cultura-titulo` | Encabezados de secciones | `16px` |
| `--oihane-cultura-espaciado` | Separación entre tarjetas y apartados | `8px` |
| `--oihane-cultura-tinta` | Texto general | `#3d4b3b` |
| `--oihane-cultura-fondo` | Fondo de las secciones | `#fffefa` |

Las reglas afectan a `.v521-section`, `.v521-section-head h2`, `.v521-culture-grid` y `.v521-culture-card strong`.

## Planes

| Variable editable | Qué modifica | Valor actual |
|---|---|---|
| `--oihane-planes-titulo` | Títulos de planes y apartados | `17px` |
| `--oihane-planes-texto` | Fecha, persona y ubicación | `11px` |
| `--oihane-planes-espaciado` | Relleno interior de tarjetas | `10px` |
| `--oihane-planes-tinta` | Color de texto | `#3d4b3b` |
| `--oihane-planes-fondo` | Fondo de las secciones | `#fffefa` |

Las reglas afectan a `.v522-plan-section`, `.v522-plan-head h2`, `.v522-plan-main strong`, `.v522-plan-meta` y `.v522-plan-location`.

## Código íntegro

Consulta `ESTILOS_EDITABLES_5323.css` para ver **todas** las reglas CSS del bloque, incluidas las correcciones del calendario y las flechas de plegado. Consulta `index.html` para ver el código completo de la aplicación. No cambies las funciones JavaScript si solo quieres modificar tamaños, colores, fuentes o espacios.

**Nota:** no hay cambios en `SUPABASE_oihane-ai_index.ts` en esta actualización; mantenemos la función y el modelo Gemini que ya están desplegados.
