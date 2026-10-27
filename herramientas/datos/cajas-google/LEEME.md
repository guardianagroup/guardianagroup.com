# Cajas de Google por país (Programmable Search)

Una caja por país, con 50 webs principales como máximo (límite de Google), **sin bancos**, Búsqueda Segura, región del país y diseño «Solo resultados». ZERO elige la caja por la zona horaria del navegador (o su idioma) y la persona puede cambiar el país en la cabecera de los resultados (`GCAJAS` en `orbita/zero/index.html`).

- `listas.json`: país → nombre, región, sitios (patrones `*.dominio/*`), `cx` y estado.
- Crear una caja exige marcar «No soy un robot»: lo hace el dueño. Las listas de Argentina, Chile, Perú y Estados Unidos están preparadas, sin crear.
- `rellena_XX.js`: script que rellena el formulario de creación (nombre, sitios, Búsqueda Segura) en el navegador integrado.
