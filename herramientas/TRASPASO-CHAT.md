# GUARDIANA · Traspaso para un chat nuevo de Claude

Actualizado el viernes 23 de octubre de 2026 a las 23:50, hora de Bogotá. Lo escribe la sesión anterior (Claude Opus 5.5) para que la siguiente siga el trabajo sin perder nada. **Pega este documento entero en el chat nuevo.**

## 0. Antes de empezar (para el Claude que lee esto)

**El dueño**
- Es Fran, de GUARDIANA GROUP S.A.S. (Cartagena, Colombia).
- Escríbele **siempre en español**, en pocas líneas y sin pegar código en el chat.
- Enséñale una captura de cada cambio y avísale cuando esté publicado.

**Permisos**
- El dueño dijo el 23 de octubre a las 23:29: «Ya te digo que sí de antemano a todos los permisos, entonces no me preguntes».
- El mandato general es «todo lo que te parezca bien y a la agencia… adelante».
- Aun así, propón antes de hacer un cambio grande.

**Uso de la cuenta**
- El dueño mira el porcentaje de uso semanal; Claude no puede verlo.
- Cuando él avise de que se acaba (alrededor del 92 %), guarda todo en el repositorio y actualiza este documento.

**Repositorio**
- Es `guardianagroup/guardianagroup.com` en GitHub, y es **público**.
- Para publicar hace falta permiso de escritura: conecta GitHub en esta cuenta con acceso a ese repositorio. Sin él solo se puede leer.
- Ramas: **`web-idiomas`** es la de trabajo; **`main`** es la web en vivo, servida por GitHub Pages.

**Qué leer después**
- `herramientas/TRASPASO.md`, en la rama `web-idiomas`: la historia completa del 22 y el 23 de octubre (§1 a §20), con reglas, datos y decisiones.
- `herramientas/agencia-rondas/`: las consultas a la agencia (rondas 9 a 16), los borradores de términos y las notas de la ley colombiana (`terminos-ley/ley.md`).

## 1. Qué es GUARDIANA hoy

**El programa de escritorio ya no existe como producto**
- El programa para Windows y Mac ya no se vende ni se descarga (decisión del dueño, 23 de octubre, 22:54).
- Todo funcionará desde la web, con una suscripción web cobrada por **Dodo Payments**, cuando la empresa tenga el **NIT**.
- **Hoy no se cobra nada y no queda ningún enlace de pago en la web**:
  - `comprar.html`, `instalar.html`, `activar.html` y sus versiones en `en/` (buy, install, activate) y `pt/` (comprar, instalar, ativar) son páginas «muy pronto desde la web».
  - Esas páginas ofrecen tres tarjetas: Radiografías (gratis), Órbita (gratis) y ZERO (en demostración).
  - Los botones de planes y descarga de la portada antigua (`es/index.html`, `pt/index.html`) dicen «Próximamente» / «Em breve», con la nota «En construcción… no se cobra nada».
  - El dueño insiste: «no quiero que se le pueda cobrar a nadie porque no está terminado».

**Portada**
- La portada en vivo es `index.html` de `main`, que redirige a `/orbita/`.
- La portada nueva está lista en `/nueva/`, en 42 idiomas. Pasa a ser la portada **solo cuando el dueño diga «publícala»**.

**Órbita** (`/orbita/`, no indexada)
- Es un planeta 3D con cuatro capas: Cables submarinos, Cables por tierra, Centros de datos y Satélites.
- También tiene:
  - ciudades que aparecen al acercar;
  - **Mi conexión**, que mide 33 centros de datos;
  - **El viaje de tus datos**, un informe solo para PC;
  - Radiografías;
  - ESPEJO «Con / Sin GUARDIANA»;
  - **ZERO**, el navegador, en demostración.

**Radiografías** (`/radiografias/`): informes sobre qué ve de ti cada web y a quién habla.

## 2. Reglas fijas del dueño (no negociables)

**Privacidad y cuentas**
- Nunca muestres el nombre real de la fundadora; en los mockups se usa «Marta Ortega».
- Las cuentas de ChatGPT, Grok, Gemini y Cheaper Inference muestran el nombre o el correo real del dueño: **nunca los repitas**. Nunca envíes su correo a servicios ajenos.
- Nunca copies ni repitas claves de API; la de Cheaper Inference empieza por «ci_live_».
- Nunca escribas claves ni contraseñas, y no inicies sesión ni crees cuentas: eso lo hace el dueño.
- Cheaper Inference y los modelos DeepSeek pueden guardar datos en China: comparte con ellos solo información del producto, nunca datos personales.

**Contenido**
- Sin código en el chat.
- No inventes cifras. Los datos de demostración van etiquetados como tal.
- No prometas protección absoluta.
- Sin marcas reales de terceros en los mockups; usa dominios `.example`.
- Colores: fondo #06080C, acento #9CC3E4, texto #F4F6F8. El coral #E07A6C es solo para cortes y el ámbar #F0C77F para dinero.

**Datos y fuentes**
- Nada «no verificado» a la vista. Las fichas dicen «Datos verificados»; las fuentes y licencias van **solo** en `terminos.html` (sección 6). Si un dato no se sabe, se omite la fila.
- **Prohibido usar submarinecablemap.com o TeleGeography** como fuente. **PeeringDB no se puede usar.**
- En Mi conexión y el informe, los arcos no son nunca la ruta real de los paquetes: se presentan como «conexiones medidas, trayectorias ilustrativas». **Nunca conviertas ms en km.**

**Agencia y publicación**
- **Regla de la agencia:** solo se publica lo que confirman al menos dos voces. Claude, comprobando contra textos oficiales, cuenta como una.
- Publica cada cambio en las **dos ramas**, `web-idiomas` y `main`.
- **Nunca copies `index.html`, `instalar.html`, `en/`, `pt/` ni `descargas/` de `web-idiomas` a `main`**: allí tienen descargas activas.

**Producto**
- Todo lo nuevo, en 42 idiomas.
- Todo lo del mapa, a máxima resolución, también al hacer zoom. El nivel que pide es «calidad tipo Apple».
- «El viaje de tus datos» es solo para PC.
- **El móvil nuevo (M1), la tablet nueva (T1) y la app instalable siguen en prueba hasta que el dueño diga lo contrario** (23:27).
- **El futuro motor de búsqueda «para el navegador y para el hardware»** se hará con **Astra 6** (modelo `gpt-6-astra` en platform.cheaperinference.com) además de la agencia, porque «es de lo más potente».

## 3. Cómo publicar (el procedimiento que funciona)

**Pasos**
1. Haz commit en `web-idiomas` y `git push origin web-idiomas`.
2. Usa un worktree aparte para `main`, por ejemplo `git worktree add ../wt-main --detach origin/main`. Antes de cada publicación: `git -C ../wt-main fetch origin && git -C ../wt-main checkout --detach origin/main`.
3. Comprueba que `main` tiene la base: `git diff --quiet origin/main <commit>^ -- <ficheros>`.
4. Copia los ficheros: `git checkout <commit> -- <ficheros>`. Después haz commit y `git push origin HEAD:main`.
5. Comprueba el despliegue con `gh run list -R guardianagroup/guardianagroup.com -L 1` (unos 30 s) y mira la web en el navegador. Desde la consola no se llega a guardianagroup.com.

**Cuidados**
- Cuando cambies un `.js` o un `.css` de Órbita, sube su `?v=` en `orbita/index.html`. Hoy van en `20261025k`, salvo `idioma.js`, `conexion.js` y `viaje.js`, que van en `20261025l`.
- Haz siempre commit antes de cambiar de rama: se perdió trabajo dos veces con un `reset --hard`.
- El workflow `datos-orbita.yml` regenera `orbita/datos` en `main`. Después de cada ejecución, trae esos datos a `web-idiomas` con `git checkout origin/main -- orbita/datos`.

**Pruebas en local**
- `python3 -m http.server`.
- Playwright con Chromium en modo swiftshader, un solo navegador a la vez.
- El aviso de ubicación se cierra esperando a que se vea «Ahora no» y pulsándolo.

## 4. Qué está en vivo (`main` 05e3005, 23 de octubre, 23:45)

**Portada nueva `/nueva/`** (commit 13b3e09)
- Más satélites trabajando a distintas alturas, igual en móvil, tablet y ordenador.
- El planeta de la sección Órbita es igual que el de arriba.
- Titular: «¿Sabes a dónde **viajan** tus datos y quién los compra?».
- Frase dorada: «Tú pones los datos. Otros comercian con ellos.».
- Textos: «Abrimos once diarios digitales» y «La infraestructura de internet, en un solo mapa.».
- En 42 idiomas, con una imagen nueva para compartir.

**Órbita** (commits 0b9296b y 63a7f03)
- **Cables**
  - Los submarinos van por colores de capacidad, los mismos que los cables por tierra: dorado y grueso con halo, más de 100 Tbit/s; lavanda, de 20 a 100; verde agua, menos de 20; gris, no publicada. El grosor se mantiene.
  - Los tramos que acaban en el mar se difuminan; es un hueco de OpenStreetMap. Su ficha dice: «En los datos abiertos (OpenStreetMap) este cable está trazado solo hasta donde se apaga la línea».
  - El botón se llama «Cables por tierra».
- **Ciudades al acercar** (ronda 16; ChatGPT, Gemini, Grok y Astra a favor)
  - Datos: Natural Earth (dominio público), 7.295 lugares, en `orbita/datos/ciudades.json` y `orbita/static/ciudades.js`.
  - Niveles: capitales y ciudades de más de 5 millones al ver un continente, de más de 1 millón al ver una región, y más pequeñas al acercarse.
  - Como máximo 60 nombres en ordenador y 25 en móvil.
- **Informe «El viaje de tus datos» rehecho**
  - Planeta realista.
  - Brújula profesional.
  - Gráfica «A qué velocidad viajaron tus datos», en porcentaje de la luz. El dueño: «Enhorabuena… se ve mucho mejor».
  - «El más lejano» se elige ya por km.
- **Mi conexión**
  - Las líneas crecen despacio y llevan datos de ida y vuelta.
  - Los 33 centros medidos, con su nombre en el idioma de la página.
- **Arreglos**
  - La X ya no saca de Órbita a la portada.
  - «Medir desde fuera» funciona.
  - La ficha de cable o país ya no se corta en el móvil.
  - El planeta gira hacia la derecha.
  - La rueda del ratón baja el informe.
  - Las X van en una caja.

**Compra y descarga** (commits 6993ec8 y 05e3005): todo en «muy pronto» / «Próximamente», como se describe en el §1.

## 5. En prueba (no activarlo para todos hasta que lo diga el dueño)

- Se ve con `guardianagroup.com/orbita/?movil=nuevo`, y se quita con `?movil=antes`.
- **Qué incluye**
  - El móvil M1 y la tablet T1.
  - La app instalable: `manifest.webmanifest`, `sw.js` (red primero, con `offline.html` sin conexión), `orbita/static/app.js` y los iconos.
- **La app**
  - En Android la instala Chrome.
  - En iPhone y iPad hay una guía de dos pasos.
  - En Windows, con Chrome o Edge, sale el botón «Instalar app».
  - Dentro de la app instalada siempre se ve lo nuevo.
- El interruptor está en el script del principio de `orbita/index.html`, con sessionStorage `guardiana-m2`.
- Cuando el dueño diga «actívalo para todos»:
  - pon lo nuevo por defecto y deja `?movil=antes` para volver a lo anterior;
  - añade el manifest y el registro del service worker también a la portada;
  - sube versiones y publica.

## 6. LO PRIMERO AHORA (orden del dueño, 23 de octubre, 23:29–23:32)

> «Lo primero que tienes que hacer es acabar la página web modo ordenador… Hasta que no esté al 100 % con el tema de cables submarinos, cables troncales, cables terrestres, absolutamente todo lo que falta… Ponte a trabajar.»

**1. Fichas al pasar el ratón por los cuatro botones de capas** (23:32)
- Hoy sale el aviso nativo del navegador, muy largo y rectangular.
- El dueño quiere «un cuadrado bien diseñado, y los cuatro… más o menos el mismo tamaño».
- El texto está en `orbita/static/capas.js`: la función que monta los textos de las capas pone `b.title = txt` en `#capas [data-capa]`, y en `orbita/index.html` hay un `title` fijo.
- Sustitúyelo por una ficha propia de unos 300 × 300 px:
  - nombre de la capa;
  - la cifra grande (cables con nombre, km de fibra y países, centros de datos, satélites);
  - una frase;
  - la leyenda de colores o de clases con sus cuentas (las del panel de clases: `#sub-vista`, `#fibra-vista`, `#puntos-vista`, `#sat-vista`);
  - «Datos verificados» y un dato curioso.
- Solo con ratón; en pantallas táctiles, nada.
- **Estado:** ver el final de este documento.

**2. Cables al 100 %**
- **Errata «Souh America-1» → «South America-1»**
  - Está en `orbita/datos/cables.json` y en `orbita/datos/lugares-capas.json`.
  - Corrígela también en el generador (`herramientas/lugares_capas.py` o la clave de `herramientas/cables_agencia.py`) para que el workflow no la devuelva.
- **Dos extremos difuminados** que probablemente son plataformas petrolíferas: revisa `herramientas/agencia-rondas/cables-sueltos.md`.
- **El gris** de «capacidad no publicada» parece casi blanco al resaltarlo; ajústalo.
- **Revisión sistemática de Órbita en ordenador**:
  - cada capa, cada clase, cada ficha, cada X y cada «volver»;
  - los enlaces de entrada (`#mi-conexion`, puertas);
  - los cables sueltos;
  - que no haya errores en la consola.
- **Qué falta en los datos**
  - Hay que listarlo y cerrarlo con la agencia: cables submarinos que falten o estén incompletos en OpenStreetMap, fibra por tierra en países sin datos, y troncales.
  - Las clases de «Cables por tierra» son:
    - «Grandes troncales»: 800 km o más, o compartidas por varias compañías;
    - «Rutas largas»: de 400 a 800 km;
    - «Rutas entre ciudades»: de 150 a 400 km;
    - «Enlaces cortos»: menos de 150 km.
  - Los generadores están en `herramientas/` (`fibra_tierra.py`, `fibra_agencia.py`, `cables_agencia.py`, `capacidad_cables.py`, `datos_orbita.py`).

## 7. Pendientes, por orden

**1. Términos y condiciones nuevos** (decisiones del dueño, 23 de octubre, 22:49–22:57)
- NIT: la empresa todavía no lo tiene; llega con el registro en la Cámara de Comercio. Deja el marcador **[NIT]**, sin «en trámite».
- **Teléfono obligatorio: +57 323 921 8906.**
- **Formulario de reclamaciones con número de caso: sí.** La web es estática, así que hay que decidir dónde se guarda (propón opciones).
- Pasarela: **Dodo Payments**. Los precios se quedan como están en Dodo.
- El programa ya no se descarga; el servicio de pago será desde la web («tenemos que ver cómo lo haremos»). **No se cobra nada hasta tener NIT y la suscripción web.**
- **Borrador de Astra:** `herramientas/agencia-rondas/ronda15/terminos-nuevos-astra.md` (18 secciones, unas 1.880 palabras).
- **Siguiente paso**
  - Comprobarlo contra los textos oficiales colombianos; las notas están en `terminos-ley/ley.md`.
  - Montarlo en `terminos.html`, conservando la sección 6 de fuentes y licencias.
  - Enseñárselo al dueño y publicarlo en las dos ramas.

**2. Páginas antiguas que todavía hablan del programa**
- Botones «Activar licencia» y «Descargar» en la cabecera de muchas páginas.
- `verificar.html`, `politica-firma.html`, `zero.html` (descarga desactivada) y `gracias-*.html`, con sus versiones en `en/` y `pt/`.
- Los textos de «programa» en `orbita/static/conexion.js`.

**3. Idiomas de Órbita**
- Hay 40 idiomas preparados en `orbita/static/i18n/*.json`, pero solo están abiertos `es` y `en` (constante `ABIERTOS` en `orbita/static/idioma.js`).
- Falta traducir las claves más nuevas y abrirlos.
- La columna portuguesa del diccionario `D` de `idioma.js` debe pasar de portugués europeo a brasileño.

**4. Otros**
- Género gramatical de GUARDIANA en griego.
- Elegir la demostración de CNN.
- Botón «Compartir».
- Auditoría SEO.
- «Reclamar mis datos».
- Borrador de consulta a la SIC.
- Facturación, cuando haya NIT.
- Más detalle de cada uno en `TRASPASO.md`.

**5. Lo que espera una orden del dueño**
- Portada nueva como portada: «publícala».
- Móvil, tablet y app para todos.

## 8. La agencia (cómo se trabaja)

**Las voces**
- ChatGPT, Gemini y Grok se consultan desde el navegador integrado de la app de escritorio del dueño, con sus sesiones abiertas.
- **Astra 6** (`gpt-6-astra`) se consulta en platform.cheaperinference.com → Playground. Quedan unos 12,80 USD; el dueño quiere que se use para «las cosas más difíciles… lo más complejo».
- Si una sesión no está abierta, pide al dueño que inicie sesión. Tú no lo haces.

**Cómo se consulta**
- Pide «máximo razonamiento» y propuestas numeradas.
- Guarda cada respuesta en `herramientas/agencia-rondas/rondaN/`, con un archivo consolidado.
- Publica solo lo que confirman dos voces o más.
- Las respuestas largas de Astra se cortan en 4.096 tokens: pide «continúa exactamente donde lo dejaste».

## 9. Mapa del código (Órbita)

**Archivos**
- `orbita/index.html`: botones de capas (`#capas [data-capa=sub|fibra|puntos|sat]`) y el interruptor del móvil nuevo.
- `orbita/static/orbita.js`: el planeta, `window.OrbitaPlaneta`.
- `orbita/static/capas.js`: capas, clases, fichas y uniones de cables.
- `orbita/static/ciudades.js`: ciudades al acercar.
- `orbita/static/conexion.js`: Mi conexión.
- `orbita/static/viaje.js`: el informe.
- `orbita/static/idioma.js`: diccionario `D` y `GuardianaIdioma.t`.
- `orbita/static/movil.js` y `movil.css`: M1 y T1.
- `orbita/static/app.js`: la app instalable.
- `orbita/static/orbita.css`: estilos.

**Detalles importantes**
- `OrbitaPlaneta`
  - `{aVista, pantalla, vec, ctx, lienzos, vista, geo:{W,H,CX,CY,R,R0,U,DPR}, ir(lon,lat,z), lugar}`.
  - El zoom es `R/R0`.
  - El tiempo que reciben las capas va en **segundos**.
- `OrbitaCapas`
  - `{pinta, pon(k,on), soloTu, enSoloTu, cajasPaises, estado, satelites, lugares, fibra, uniones, red, cargaRed}`.
- Otras APIs: `OrbitaConexion`, `OrbitaViaje`, `OrbitaCiudades`, `GuardianaApp`.
- El traductor de la página solo traduce nodos de texto. El texto que se dibuja en el lienzo, y los atributos, necesitan `T()` y una entrada en `D` (es → [en, pt-BR]).
- Portada nueva:
  - `nueva/index.html` y `portada/globo.js` (los satélites);
  - textos en `i18n/nueva/<idioma>.json`;
  - versión de caché `?v=20261023e`.

**Datos**
- Cables: OpenStreetMap (ODbL), unas 1.473 piezas.
- Ciudades y fronteras: Natural Earth.
- Nombres cerca de cables y centros: GeoNames (CC BY 4.0).
- Todo está atribuido en `terminos.html`.

## 10. Errores que ya pasaron (no repetir)

- Una `//` a mitad de línea dentro del objeto `window.OrbitaCapas` desactivaba los getters. Dentro de objetos de una línea, usa `/* */`.
- En Mi conexión no se veían los datos porque el planeta pasa segundos y el código esperaba milisegundos. `pintaMio` usa `performance.now()`.
- Al entrar desde un enlace de la portada, la X volvía a la portada. Se arregló con el marcador `llegada` en `history.state`.
- La ficha del móvil medía 34 px de más: usa `width:auto` con `box-sizing:border-box`.
- Elementos del móvil nuevo salían sin estilo en el ordenador. Esas clases van ocultas por defecto fuera de su media query.
- Cuidado con la CPU: solo 2 núcleos, un navegador de pruebas a la vez y esperas largas.

## 11. Estado al cerrar (se actualiza al final de cada tanda)

- 23 Oct 2026, 23:50: fichas de los cuatro botones de capas, **en curso**. El dueño pidió (23:36) usar **Astra 6** también para los cables, «para todo lo que se pueda».
- Revisión automática de Órbita (navegación, X, «volver», paneles) en marcha; su informe, cuando llegue, irá a `herramientas/agencia-rondas/qa/`.

**24 Oct 2026, 00:15 — hecho y publicado en las dos ramas**
- **Fichas de los cuatro botones de capas:** cuadradas de 312 × 312 px e iguales, en `capas.js` (`fichaCapa`) y `orbita.css` (`.capa-ficha`). Solo con ratón.
- **Nombres de los pueblos donde llega o sale cada cable** (orden del dueño, 23:39: «todo cable que… empiece o termine en un pueblo, tiene que aparecer el nombre»):
  - En el mapa: `pintaNombresLlegadas` en `capas.js` los muestra desde unos 4.200 km de ancho de pantalla; las ciudades de `ciudades.js` les ceden el sitio y no repiten el nombre.
  - Los datos salen de un workflow nuevo, `.github/workflows/pueblos-cables.yml` (a mano y cada lunes), que descarga GeoNames cities500, escribe `orbita/static/tierra/pueblos-cables.tsv` y vuelve a generar `lugares-capas.json` con `herramientas/lugares_capas.py` (función `lugar_cable`).
  - Resultado: 1.138 de 1.330 llegadas con nombre, 518 de ellas con el pueblo real.
- **Correcciones:** «Souh America-1» pasa a South America-1 (errata de OpenStreetMap, corregida en `datos_orbita.py`), «Marseille 02/08» pasa a Marseille, y el gris de «capacidad no publicada» ya no parece blanco al resaltarlo.
- **Compra y descarga:** las páginas en «muy pronto desde la web» y los planes en «Próximamente». No queda ningún enlace de pago.

**En marcha**
- **Fibra por tierra de los países que faltan.** Hay datos de 93 países; faltan unos 85 con red troncal propia.
  - Astra 6 y ChatGPT responden en tandas. Sus respuestas van a `herramientas/fibra-agencia/astra-troncales-N.json` y `chatgpt-troncales-N.json`, y el texto bruto a `herramientas/agencia-rondas/ronda17/`.
  - Después hay que seguir estos pasos:
    1. `python3 herramientas/fibra_agencia.py`: solo se quedan los tramos que confirman las dos voces. Si falta alguna ciudad, añade su ALIAS.
    2. `python3 herramientas/fibra_tierra.py --sin-ofds`: funciona en local, porque clona AfTerFibre desde GitHub.
    3. Revisa `orbita/datos/fibra-tierra.json` (países y km).
    4. Publica en las dos ramas.
- **Al terminar el mapa**, el dueño pidió (23:49) **poner su ordenador en hibernación**. Hay permiso de clic sobre el escritorio de Windows («Explorador de archivos», nivel «click»): Inicio, después el botón de apagado y después «Hibernar». Si «Hibernar» no aparece en el menú, avísale; no cambies la configuración de energía.
