# Oihane 5.35.0 — Home y Cultura

Versión derivada de 5.34.0, mantiene archivos, estructura y Supabase.

- Home genera en el primer render saludo y fecha en la misma fila, sin esperar una transformación posterior del DOM.
- Las tareas de la agenda se dibujan con casilla visual vacía «□», y la lógica de completar sigue funcionando.
- Cultura comienza con categoría, título/nombre, autor/director y año. En películas/series aparece además «Formato audiovisual».
- Catálogos: libros (Google Books, Open Library), películas (Apple/iTunes, con enlace externo IMDb), series (TVMaze, con enlace externo IMDb), arte (Art Institute of Chicago y The Met), artistas (Wikipedia). Disponibilidad en España: consulta externa JustWatch; no se inventan plataformas.
- Los resultados hallados requieren pulsar «Usar esta ficha» antes de sustituir los campos.
- Service worker actualizado a oihane-v5350 para renovar el caché.

Limitaciones: algunas fuentes pueden carecer de una obra, de una imagen utilizable o impedir peticiones desde Safari. El catálogo IMDb no ofrece aquí una API pública sin credenciales. No hay pruebas interactivas reales en un iPhone ni comprobación en línea desde el navegador ejecutando el HTML.
