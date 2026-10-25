# Revisión de Órbita · noche del 23 al 24 de octubre de 2026

Revisión automática de toda la navegación y los paneles de Órbita en tres tamaños: ordenador (1440 × 900), tablet (820 × 1180 y 1180 × 820) y móvil (390 × 844 y 360 × 780). Se hizo con y sin el móvil nuevo (`?movil=nuevo`), entre las 23:18 y las 02:37, sobre el código local. Las capturas quedaron en la máquina de la sesión y no se guardan aquí.

**Estado:**
- ✅ arreglado y publicado el 24 de octubre (commit 459d0c5 en main)
- ⬜ pendiente

## Hallazgos, del más grave al menos grave

1. ✅ **Mi conexión en el móvil y la tablet vertical, sin el interruptor.** Los botones «Volver» y «Descargar» no respondían porque la cabecera (z-index 50) estaba encima del panel (31).
   - Arreglo: el panel abierto va por encima, con z-index 56 hasta 1024 px.
2. ✅ **ZERO abierto por segunda vez dejaba la pantalla en blanco.** Volver a poner `src` al marco añadía un paso al historial, y «‹ Órbita» (`history.back`) solo deshacía ese paso.
   - Arreglo: `cargaMarco` y `vaciaMarco` en `orbita.js` usan `location.replace`. También arregla el atrás del navegador, que necesitaba una pulsación de más.
3. ✅ **La ficha de satélite se salía por la izquierda en el móvil.**
   - Arreglo: ahora se ajusta a los bordes de la pantalla.
4. ⬜ **ZERO en el móvil no se puede leer.** Es la página de escritorio reducida al 27 %.
5. Pregunta de ubicación:
   - ✅ Salía encima del panel por el que había entrado el visitante.
     - Arreglo: espera a que se cierre lo que está abierto, como mucho un minuto.
   - ✅ Salía debajo de otras capas.
     - Arreglo: `.lugar` pasa de z-index 5 a 90.
6. ⬜ **Tablet T1 en horizontal:** el panel «Capas» de la derecha tapa Mi conexión. Radiografías queda bajo «Ver mi conexión», y la ficha de cable se sale 12 px por arriba.
7. ⬜ **Móvil M1 y tablet T1 en vertical:** la barra de puertas y los botones fijos quedan encima de los paneles (Mi conexión, Radiografías, el informe).
   - El primer caso puede quedar resuelto con el arreglo del punto 1; hay que comprobarlo.
8. ✅ (commit 9feb951) **Lista «Empresas y países» del espejo:** se corta 30 px por la derecha hasta 960 px de ancho. Es el mismo fallo de `width: 100%` más padding que tenía la ficha de cable.
9. ✅ en parte (las fichas de cable, país y centro; commit 9ea4e9c) **El atrás del navegador sale de Órbita en vez de cerrar lo abierto.** Siguen pendientes la lista de cercanos, el espejo y la pregunta de ubicación. Pasa al llegar por un enlace de la portada, y con las fichas, la lista de cercanos, la pregunta de ubicación o el espejo abiertos. Durante el viaje, una pulsación cierra solo Mi conexión.
10. ✅ **La ficha de cable se salía 12 px por debajo de la ventana en el ordenador, y su × se iba con el scroll.**
    - Arreglo: `box-sizing: border-box`, y la fila de arriba queda fija en el ordenador.
11. ⬜ **GUARDIANA OS no tiene entrada en el móvil sin el interruptor.**
12. ✅ **Esc en el informe del final del viaje también terminaba el viaje.**
    - Arreglo: Esc solo cierra el informe.
13. ✅ en parte (commit da41ffa: la búsqueda de ubicación, la nota de rutas, la altura y el final del viaje) **En inglés queda texto en español:**
    - la búsqueda de ubicación y la nota de rutas de Mi conexión;
    - en Mi conexión, algunos nombres de centros (hay que comprobarlo tras 63a7f03);
    - «Verme en Órbita» y algunas etiquetas aria;
    - el final del viaje, «of 89 at 294 ms»;
    - el indicador de altura, «40.000 km»;
    - la descripción de los países.
14. ⬜ **Órbita no tiene portugués.** Solo hay ES y EN (pendiente desde antes).
15. ✅ **Las cifras se contradecían:** 506 cables con nombre, pero una clase con 861.
    - Arreglo: todas las cifras cuentan cables enteros (458).
16. ⬜ **M1, «Capas › Afinar»:** «Trazado aproximado» y «Cables en proyecto» pierden la muestra de línea.
17. ✅ **Consola: radio negativo en el anillo del punto del visitante al cargar despacio.**
    - Arreglo: el radio nunca es negativo. El aviso de `getImageData` durante el viaje sigue saliendo y es solo un aviso.
18. ✅ en parte (commit 5f308b5: con Mi conexión abierta se apartan la altura y el zoom, y con una ficha abierta, «¿Sabías que…?») **Detalles menores:**
    - en el ordenador, Mi conexión tapa el indicador de altura y el zoom;
    - la ficha de cable tapa «¿Sabías que…?»;
    - con 360 px, la tabla del informe mide 8 px más que la pantalla.

## Lo que funciona bien

- **Errores que había visto el dueño, arreglados:**
  - Ninguna X, «Volver», «‹ Órbita» ni Esc lleva a otra página. Después de entrar por un enlace se queda en `/orbita/` y se quita el `#`.
  - «Medir desde fuera» funciona.
  - La rueda del ratón mueve el panel que tiene debajo.
  - La ficha de cable ya no se corta en el móvil.
- **Puertas y enlaces:**
  - Las puertas abiertas desde dentro se cierran de todas las formas.
  - Los enlaces de la portada abren el panel correcto.
- **Mi conexión:**
  - Mide las 33 regiones.
  - El viaje funciona: 3D, «Saltar» y «Volver a Órbita».
  - El PDF y «Descargar» funcionan.
- **Capas:** encender y apagar, clases, «Minimizar», cuentas, muestras de color y fichas al pasar el ratón.
- **Móvil nuevo M1:** las hojas se cierran tocando el velo, arrastrando el asa, con el atrás o con Esc.
- **App instalable:**
  - la guía del iPhone;
  - la oferta de instalación;
  - el botón «Instalar app» en el ordenador.
