# GUARDIANA · Traspaso para un chat nuevo de Claude

Actualizado el sábado 24 de octubre de 2026 a las 12:00, hora de Bogotá, al cerrar la cuenta anterior al 97 % de su uso semanal. Lo escribe la sesión anterior (Claude Opus 5.5) para que la siguiente siga el trabajo sin perder nada. **Pega este documento entero en el chat nuevo.**

## Estado al cerrar la cuenta (24 Oct 2026, 12:00, al 97 % de uso)

**Ramas:** `main` (la web en vivo) y `web-idiomas` están al día. `web-idiomas` tiene además este documento y las preguntas de Kimi.

**En vivo en guardianagroup.com/orbita/**
- **Cables por tierra:** 169 países y 1.345.669 km, en `orbita/datos/fibra-tierra.json`. Al empezar la noche eran 93 países.
  - 421 tramos salen de la agencia, confirmados al menos por dos voces de siete: Astra 6, ChatGPT («Alta» e «Investigación avanzada»), Gemini, Grok, Kimi y Claude comprobando fuentes oficiales. El resto viene de OpenStreetMap y AfTerFibre.
  - En los países sin fuentes abiertas valen los tramos aproximados. El dueño, a las 9:00: «Lo más aproximado posible ok».
  - Siria, Yemen y Palestina entran con redes «en servicio parcial».
  - Corea del Norte se queda en el mapa. El dueño, a las 8:02: «Añádela si».
- **Países sin cables por tierra todavía**
  - Eritrea: usa radioenlaces, no fibra.
  - Guinea-Bisáu: su red troncal está en licitación.
  - Islas y territorios pequeños: HK, SG, MO, MC, AD, GU, VI, KY, AW, CW, GP, MQ, RE, YT, GF, EH, KM, PF, VU, SB, WS, TO, BS y otros.
- **Cables submarinos:** 518 cables enteros y 1.473 llegadas, cada una con el nombre de su pueblo (GeoNames cities500). Al empezar la noche eran 445.
  - `orbita/datos/cables-agencia.json` guarda los 349 cables de la agencia.
  - Hay 107 cables que solo nombra una voz y que ninguna fuente oficial confirma. No se muestran, a propósito; están en `herramientas/agencia-rondas/ronda19/`.
- **Antártida:** dos voces coinciden: la investigación profunda de ChatGPT y Astra 6 (`ronda23/astra-antartida.txt`).
  - No llega ningún cable submarino en servicio. Nueva Zelanda–McMurdo y Chile–isla Rey Jorge son proyectos o estudios.
  - Las bases salen a internet por satélite: Starlink en McMurdo y Rothera; ANARESAT y Starlink en Casey, Davis y Mawson; TDRSS, DSCS e Iridium en el Polo Sur.
  - Sobre la fibra entre bases, Astra no lo confirma ni lo descarta: hay redes locales, como la de IceCube en el Polo Sur. En la ficha no hay que decir que no existe.
  - Las fichas de país solo salen al pulsar el nombre del país, y los nombres solo se ven con el planeta gris («limpio»). La Antártida está entre los centros de país de `orbita.js` (constante `P`), así que su ficha se abre igual que las demás. En local no se pudo probar, porque la clase `limpio` la pone la propia página.
  - Ya está en su ficha (`orbita/datos/paises.json`, «AQ», con «Datos verificados»), solo con lo que dicen las dos voces: ningún cable submarino y salida por satélite, con Starlink en McMurdo y ANARESAT en las bases australianas.

**Cómo deciden los generadores (cambios de esta noche)**
- **`herramientas/fibra_agencia.py`** lee `herramientas/fibra-agencia/<voz>-troncales-*.json`; la voz es el prefijo del nombre. Un tramo entra por uno de tres niveles:
  - `ok`: dos voces con el mismo operador;
  - `ok2`: dos voces con operadores distintos; se dibuja sin nombre ni operador;
  - `ok3`: solo en los países de `APROX` (BH, BN, BZ, CU, DO, HT, JM, KP, KW, LB, LS, NP, PS, QA, RW, SY, TL, XK, YE, SR, TT, PR, GW, SZ, ER, CV, MU, MT, BS, GT, PA, SS), si el camino mide como mucho 2,5 veces la recta más 150 km. Se dibuja en recta y sin nombre.
- **Más reglas de `fibra_agencia.py`**
  - Las ciudades del otro lado de la frontera se buscan a menos de 800 km de la ciudad anterior de la ruta, o de la siguiente si la ruta empieza al otro lado (función `fuera`).
  - Los nombres se buscan en `ALIAS`, en `SITIOS` (coordenadas puestas a mano, como Nimule, en Sudán del Sur) y en `herramientas/fuentes/pueblos-fibra.tsv`.
  - Solo entran los estados que empiezan por «en servicio», «operativo» o «in service» y no dicen «no verificad».
- **`herramientas/cables_agencia.py`**
  - Voces: chatgpt, gemini, grok, claude, astra y kimi.
  - Junta cada llegada con el grupo más cercano a menos de 120 km.
  - Nunca une dos llegadas de una misma voz que estén a más de 5 km: así los cables cortos dentro de un país conservan sus dos extremos.
  - Si dos voces o más coinciden, ignora el desacuerdo sobre el país de frontera.
- **`herramientas/lugares_capas.py`** (función `lugar_cable`)
  - Elige el pueblo más cercano a menos de 20 km, salvo que una ciudad de más de 50.000 habitantes esté a menos de 1,5 veces esa distancia (como mínimo, 6 km): entonces gana la ciudad.
  - Si no hay pueblo, usa la ciudad de más de 15.000 habitantes más cercana a menos de 80 km.
  - Quita los números de distrito: «Marseille 02» queda en Marseille.
- **El workflow `.github/workflows/pueblos-cables.yml`** se lanza a mano y los lunes a las 05:41 UTC. Descarga GeoNames cities500 y guarda en `main` lo que escriben tres scripts:
  - `pueblos_cables.py` → `orbita/static/tierra/pueblos-cables.tsv`;
  - `lugares_capas.py` → `orbita/datos/lugares-capas.json`;
  - `pueblos_fibra.py` → `herramientas/fuentes/pueblos-fibra.tsv`.

**Proceso de los cables por tierra (después de cada respuesta)**
1. Guarda la respuesta en `herramientas/fibra-agencia/<voz>-troncales-<n>.json` y el texto bruto en la carpeta de su ronda.
2. Publica esos archivos en `main`, porque el workflow los lee de allí.
3. Lanza `gh workflow run pueblos-cables.yml --ref main` y espera a que acabe.
4. En `web-idiomas`: `git checkout origin/main -- herramientas/fuentes/pueblos-fibra.tsv orbita/datos/lugares-capas.json`.
5. Ejecuta `python3 herramientas/fibra_agencia.py`, que escribe `herramientas/fuentes/fibra-agencia.json`. Si falta una ciudad, añádela a `ALIAS` o a `SITIOS`.
6. Ejecuta `python3 herramientas/fibra_tierra.py --sin-ofds --fuentes <carpeta temporal>`, que clona AfTerFibre y escribe `orbita/datos/fibra-tierra.json`.
7. Revisa los países y los km, y publica `fibra-agencia.json` y `fibra-tierra.json` en las dos ramas.

**Proceso de los cables submarinos**
1. Guarda la respuesta en `herramientas/cables-agencia/<voz>-*.json`.
2. Ejecuta `python3 herramientas/cables_agencia.py`, que tarda unos 3 minutos y actualiza `orbita/datos/cables.json` y `cables-agencia.json`.
3. Publica `cables.json`, `cables-agencia.json` y la carpeta `herramientas/cables-agencia` en las dos ramas.
4. Lanza `gh workflow run pueblos-cables.yml --ref main`. Busca los pueblos de las llegadas nuevas y rehace `lugares-capas.json` en `main`.
5. Trae a `web-idiomas` `orbita/datos/lugares-capas.json`, `orbita/static/tierra/pueblos-cables.tsv` y `herramientas/fuentes/pueblos-fibra.tsv`.

**Lo que quedó a medias**
- **Revisión de Astra 6 por continentes (ronda 23): terminada** el 24 de octubre a las 11:41. Todas las tandas de `ronda23/tandas.md` están procesadas y publicadas (registro al final del §11). Resultado: 169 países (entró Nueva Caledonia), 1.345.645 km y 420 tramos de la agencia. Astra no dio rutas para MU, ST, SC, SB ni VU.
- **Kimi** (kimi.ai): la cuenta gratuita se satura en la hora punta de China. A las 12:30–12:45 seguía saturado: respondía «Muchas personas están chateando con Kimi en este momento» y ofrecía una suscripción de pago, que es decisión del dueño. Las 13 preguntas siguen sin hacer. Truco: pega el texto con un evento `paste` en el editor y vacía antes el borrador, que Kimi guarda. Sus preguntas están en `herramientas/agencia-rondas/kimi-pendientes/`. Quedan 13 por hacer:
  - `q-A3`: trazados aproximados de los países sin datos. La respuesta va a `herramientas/fibra-agencia/kimi-troncales-3.json`.
  - `q-B1` a `q-B5`: troncales en servicio. Las respuestas van a `kimi-troncales-4.json` hasta `-8.json`.
  - `q-C-<región>` (siete regiones): cables submarinos que faltan. Las respuestas van a `herramientas/cables-agencia/kimi-faltan-<región>.json`.
  - `q-A1` y `q-A2` ya están respondidas: `kimi-troncales-1.json` y `-2.json`.
  - `save.py` comprueba el hash del texto copiado y lo guarda como JSON.
- **Gemini:** tanda 9 hecha a las 12:44 (`gemini-troncales-10.json`, procesada y publicada). Respondió Nicaragua y Chad, pero no Corea del Norte ni Cabo Verde. La página tenía puesto el modelo Flash-Lite: para lo difícil, mejor uno más potente.
- **Grok:** le faltan las tandas 8 y 9. Su límite semanal se renueva el 27 de octubre.
- **Cables submarinos que solo nombra una voz:** 131. Son 64 de ChatGPT, 55 de Gemini, 9 de Claude, 2 de Astra y 1 de Grok; `cables_agencia.py` los lista con «solo lo nombra».
  - **Ronda 24, parada a las 12:30:** hechos los lotes 1–7. Astra solo confirmó 3 cables de 56, ya publicados (352 cables de la agencia). En los lotes 3–7 devolvió `[]`, quizá por prudencia, porque se le piden fuentes oficiales. Quedan los lotes 8–17 de `herramientas/agencia-rondas/ronda24/lotes.json`, mejor con otra voz (Gemini, Kimi o ChatGPT).
  - Sus respuestas van a `herramientas/cables-agencia/astra-confirma-<n>.json`. Mira cuáles existen y sigue por el primer lote que falte.
  - Después, el proceso de los cables submarinos.
  - Los 2 que propuso Astra necesitan otra voz.
  - **Ronda 24b, en marcha a las 13:15:** ChatGPT confirma los 67 cables de una sola voz que no propuso él, en 9 lotes (`ronda24/lotes-chatgpt.json`). Las respuestas van a `herramientas/cables-agencia/chatgpt-confirma-<n>.json`. Mira cuáles existen, procesa los que no estén publicados y sigue por el primer lote que falte. Los 64 que propuso ChatGPT necesitan otra voz, por ejemplo Gemini con un modelo potente o Kimi.

**Lo siguiente que pidió el dueño, por tramos**

> «Primero terminar todo el mapa de países completo con cables… Lo quiero al 100 % y después el resto de cosas. Así vamos cerrando por tramos todo.»

1. **Cerrar el mapa al 100 %** con lo de arriba.
2. **Captura de diseño para que el dueño la apruebe antes de programar** (respondió «Ok si»). El plan que aceptó:
   - un botón nuevo, **«Países»**, con tres vistas: Velocidad (Measurement Lab), Conectividad (Banco Mundial, CC BY 4.0) y Cortes;
   - la **línea del tiempo** dentro de la ficha de cada cable, para compartir en **foto y vídeo** (7:53: «Foto y video»);
   - un botón **«Verlo en Órbita»** en Radiografías;
   - la **ficha de país** ampliada.
3. **Comparativa de los 11 diarios** (la portada dice «Abrimos once diarios digitales»): con su metodología, el derecho de respuesta de cada diario antes de publicar y un paquete de prensa.
4. **Programar la ficha de país y la línea del tiempo**, y después el **mapa de calidad** (Measurement Lab).
5. **Fotos en las fichas** (dueño, 24 de octubre, 12:53: «Cuando toquemos centro de datos, quiero que en la información te aparezca una foto, si es que la hay. Y en los cables, en los satélites también, todo lo que podamos tener foto»). La foto sale en la ficha de cada centro de datos, cable (estación de llegada o barco cablero), satélite y, si se puede, base o estación terrestre. Solo cuando haya una foto real del elemento; si no la hay, la ficha queda como está.
   - **Fuentes posibles:**
     - Wikimedia Commons y Wikidata: la imagen P18 de cada elemento, buscando los satélites por su número NORAD (P377) y los cables y los centros por nombre y coordenadas;
     - NASA y ESA para satélites, de dominio público o con licencia abierta;
     - fotos que publiquen los propios operadores con licencia que permita reutilizarlas.
     Nada de submarinecablemap.com, TeleGeography ni PeeringDB.
   - **Comprobación:** la foto tiene que ser de ese elemento concreto. Hay que cruzarla por su identificador o su nombre y ubicación, con la regla de las dos voces cuando haya dudas.
   - **Privacidad, por coherencia con GUARDIANA:** copiar las miniaturas a `guardianagroup.com`, con su licencia, en vez de enlazarlas a Wikimedia u otros sitios. Así ninguna visita avisa a terceros.
   - **Licencias:** cada foto lleva autor y licencia en `terminos.html` (sección 6), y en la ficha un crédito pequeño.
   - **Cómo hacerlo:** un workflow de GitHub busca las fotos, porque desde la consola no hay acceso a esas webs. Guarda un `orbita/datos/fotos.json` (id del elemento, archivo, autor, licencia y enlace a la fuente) y las miniaturas comprimidas en `orbita/static/fotos/`. Las fichas de `capas.js` las muestran con carga diferida.
   - **Antes de programar:** captura del diseño de la ficha con foto, para que el dueño la apruebe.

**Lo que el dueño encargó a Astra 6** (todo en `herramientas/agencia-rondas/`)
- **Ronda 20**
  - El navegador con la calidad de Brave y Tor: `astra-navegador.md` y `astra-anonimato.md`.
  - La tecnología cuántica: `astra-cuantica.md`.
  - El hardware: `astra-hardware.md`.
  - El cifrado máximo para chat y voz: `astra-comunicaciones.md`.
  - GUARDIANA sin descargar nada: `astra-sin-descarga.md`.
  - ZERO: `astra-zero.md`.
  - El buscador: `astra-buscador.md`.
  - Ideas nuevas: `astra-ideas.md`.
  - Hoja de ruta: `astra-hoja-de-ruta.md`.
- **Ronda 21**
  - Publicidad viral para llegar a un millón de usuarios sin dinero: `astra-viral-estrategia.md` y `astra-viral-calendario.md`.
  - Qué añadir a Órbita: `astra-orbita.md`.
- **Ronda 22:** la investigación profunda de ChatGPT por continentes (`chatgpt-ip-*.md` y `.json`). Sus tramos, cruzados con otra voz, sumaron 31 (commit 232fcda).

## Primeros pasos de la cuenta nueva

1. **GitHub**
   - Conecta GitHub con permiso de escritura en `guardianagroup/guardianagroup.com`.
   - Clona el repositorio y trabaja en la rama `web-idiomas`.
   - Usa un worktree aparte para `main`: `git worktree add ../wt-main --detach origin/main` (ver §3).
2. **El ordenador del dueño**
   - Enlaza el chat con su ordenador desde la app de escritorio de Claude.
   - Las voces de la agencia (ChatGPT, Gemini, Grok, Kimi y Astra 6, en platform.cheaperinference.com) se usan desde el **navegador integrado** de esa app, con las sesiones del dueño.
   - Si alguna sesión no está abierta, pídele al dueño que la abra. Tú nunca escribes contraseñas ni claves.
3. **Lectura:** este documento entero; después, `herramientas/TRASPASO.md` y `herramientas/agencia-rondas/qa/revision-orbita-2026-10-24.md`.
4. **Primera tarea:** si hay respuestas `herramientas/fibra-agencia/astra-troncales-*.json` que no figuren como procesadas al final del §11, pásalas por el proceso de los cables por tierra y publícalo.
5. **La ronda 23 de Astra está terminada.** Si vuelves a preguntarle algo, hazlo en tandas pequeñas.
   - Astra corta a 4.096 tokens, contando el razonamiento.
   - El Playground no guarda la conversación: si una respuesta se corta, pregunta solo por los países que faltaron.
6. **Las demás voces**, y después de cada respuesta, el proceso de arriba:
   - Kimi: las preguntas de `kimi-pendientes`, fuera de la hora punta de China;
   - Grok: las tandas 8 y 9, desde el 27 de octubre.
7. **Cuando el mapa esté al 100 %**, avisa al dueño y sigue con «Lo siguiente», empezando por la captura de diseño.
8. **Revisión de Órbita:** quedan los ⬜ de `qa/revision-orbita-2026-10-24.md`:
   - ZERO en el móvil;
   - los solapes de T1 en horizontal y de M1;
   - la entrada a GUARDIANA OS en el móvil;
   - las muestras de «Afinar» en M1;
   - el atrás del navegador en la lista de cercanos, el espejo y la pregunta de ubicación;
   - el resto del texto en inglés, y el portugués.
9. **Términos nuevos:** ver §7, punto 1.
10. **Móvil, tablet y app instalable:** siguen en prueba hasta que el dueño diga lo contrario.
11. **Hibernación:** no pongas su ordenador en hibernación salvo que lo vuelva a pedir.
12. **Cada 10 minutos**, guarda, sube a GitHub y publica en la web (orden del dueño, 23:42).

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
- `herramientas/agencia-rondas/`: las consultas a la agencia (rondas 9 a 23), la revisión de Órbita (`qa/`), las preguntas pendientes de Kimi (`kimi-pendientes/`), los borradores de términos y las notas de la ley colombiana (`terminos-ley/ley.md`).

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
- Las cuentas de ChatGPT, Grok, Gemini, Kimi y Cheaper Inference muestran el nombre o el correo real del dueño: **nunca los repitas**. Nunca envíes su correo a servicios ajenos.
- Nunca copies ni repitas claves de API; la de Cheaper Inference empieza por «ci_live_».
- Nunca escribas claves ni contraseñas, y no inicies sesión ni crees cuentas: eso lo hace el dueño.
- Cheaper Inference, los modelos DeepSeek y Kimi (Moonshot) pueden guardar datos en China: comparte con ellos solo información del producto, nunca datos personales.

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
- Cuando cambies un `.js` o un `.css` de Órbita, sube su `?v=` en `orbita/index.html`. Hoy: `capas.js` y `orbita.css` en `20261025r`; `idioma.js`, `orbita.js` y `viaje.js` en `20261025q`; `ciudades.js` en `20261025n`; `conexion.js` en `20261025l`; el resto en `20261025k`.
- Haz siempre commit antes de cambiar de rama: se perdió trabajo dos veces con un `reset --hard`.
- El workflow `datos-orbita.yml` regenera `orbita/datos` en `main`. Después de cada ejecución, trae esos datos a `web-idiomas` con `git checkout origin/main -- orbita/datos`.
- El workflow `pueblos-cables.yml` escribe en `main` los pueblos (`orbita/static/tierra/pueblos-cables.tsv` y `herramientas/fuentes/pueblos-fibra.tsv`) y `orbita/datos/lugares-capas.json`. Tráelos igual.
- No dejes archivos sin guardar en git al acabar: los agentes escriben en `herramientas/agencia-rondas`, `fibra-agencia` y `cables-agencia`. Haz commit y push a menudo.

**Pruebas en local**
- `python3 -m http.server`.
- Playwright con Chromium en modo swiftshader, un solo navegador a la vez.
- El aviso de ubicación se cierra esperando a que se vea «Ahora no» y pulsándolo.

## 4. Lo publicado hasta el 23 de octubre (`main` 05e3005, 23:45; lo posterior está al principio y en el §11)

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

**Estado el 24 de octubre a las 10:05:** el punto 1 está hecho. Del punto 2 están hechos la errata, el gris y la revisión sistemática (quedan sus ⬜). Los datos siguen: ver el principio de este documento.

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
- ChatGPT, Gemini, Grok y Kimi se consultan desde el navegador integrado de la app de escritorio del dueño, con sus sesiones abiertas.
- **ChatGPT**
  - Usa el modo «Alta».
  - Para los países difíciles, «Investigación avanzada» (deep research). Admite 5 a la vez como mucho: la sexta sale en versión «mini» y no se usa.
  - El informe se lee en «⋯ › Ver archivos del chat».
  - Nunca uses Ctrl+A ni Ctrl+C en ese navegador: pisan el portapapeles del dueño.
- **Gemini:** tiene límite de uso; se renueva el 24 de octubre a las 12:47, hora de Colombia.
- **Grok:** tiene límite semanal, hasta el 27 de octubre.
- **Kimi** (kimi.ai): cuenta gratuita, que se satura en la hora punta de China.
- **Astra 6** (`gpt-6-astra`, en platform.cheaperinference.com → Playground)
  - Le quedaban unos 3,58 US$ a las 11:45, antes de la ronda 24. Cada petición cuesta unos 0,11 US$. El saldo de la barra lateral solo se actualiza al recargar. El dueño quiere usarla «para todo lo que se pueda» y para lo más difícil.
  - Corta en 4.096 tokens contando el razonamiento: pídele 4 o 5 países por petición, porque con 7 se cortó casi la mitad de las veces.
- Kimi y Cheaper Inference pueden guardar datos en China: dales solo información del producto.
- **Claude** cuenta como una voz cuando comprueba contra textos oficiales.
- Si una sesión no está abierta, pide al dueño que la abra. Tú no inicias sesión.

**Cómo se consulta**
- Pide «máximo razonamiento» y propuestas numeradas.
- Guarda cada respuesta en `herramientas/agencia-rondas/rondaN/`, con un archivo consolidado.
- Publica solo lo que confirman dos voces o más.
- Pide a Astra tandas pequeñas. Si una respuesta se corta, vuelve a preguntar solo por lo que faltó.

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
- Generadores, en `herramientas/`: `datos_orbita.py`, `fibra_tierra.py`, `fibra_agencia.py`, `cables_agencia.py`, `capacidad_cables.py`, `lugares_capas.py`, `pueblos_cables.py` y `pueblos_fibra.py`.
- Workflows: `datos-orbita.yml`, cada 6 horas en `main`, y `pueblos-cables.yml`, a mano y los lunes.

**Detalles importantes**
- `OrbitaPlaneta`
  - `{aVista, pantalla, vec, ctx, lienzos, vista, geo:{W,H,CX,CY,R,R0,U,DPR}, ir(lon,lat,z), lugar}`.
  - El zoom es `R/R0`.
  - El tiempo que reciben las capas va en **segundos**.
- `OrbitaCapas`
  - `{pinta, pon(k,on), soloTu, enSoloTu, cajasPaises, estado, satelites, lugares, fibra, uniones, red, cargaRed}`.
- Otras APIs: `OrbitaConexion`, `OrbitaViaje`, `OrbitaCiudades`, `GuardianaApp`.
- **Novedades del 24 de octubre en `capas.js`**
  - Fichas de los botones de capas: `FRASE_CAPA`, `NOMBRE_CAPA`, `datosFichaCapa`, `llenaFichaCapa`, `colocaFichaCapa` y `enganchaFichasCapa`. Solo con ratón.
  - Nombres de las llegadas: `pintaNombresLlegadas` los dibuja desde 4.200 km de ancho de pantalla, como mucho 56 en el ordenador y 22 en el móvil.
  - `OrbitaCapas.cajasPaises` incluye ya las cajas de esos nombres, y `OrbitaCapas.nombresLlegadas` se los pasa a `ciudades.js` para que no los repita.
  - `cuentaCables` cuenta cables enteros: cada grupo de piezas cuenta una vez.
  - El gris al resaltar es `GRIS_RESALTE`.
  - Cada ficha añade un paso al historial (`{ficha:1}`), y el atrás del navegador la cierra.
- **En `orbita.js`:** `cargaMarco` y `vaciaMarco` usan `location.replace` (ZERO y las puertas), y la pregunta de ubicación espera con `ocupado()` a que no haya nada abierto.
- **En `viaje.js`:** Esc cierra el informe sin terminar el viaje.
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
- Con el panel del navegador oculto, el navegador pausa `requestAnimationFrame` y el mapa en vivo no se mueve. Pide al dueño que muestre el panel.
- Los servidores locales de pruebas se cortan a las 2 horas.
- En las pruebas con Playwright, la ficha de cable se abre con `OrbitaPlaneta.ir(-46.565, 4.504, 8)` y un clic en (720, 450).

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

**24 Oct 2026, 02:30 — hecho y publicado**
- **Cables por tierra:** 112 países (93 al empezar la noche).
  - Hay 19 países nuevos: AL, AM, BD, BJ, BT, BY, CF, DJ, GM, KG, LR, MN, MW, PY, SL, SO, TJ, TM y VN.
  - Hay 88 tramos de la agencia confirmados por dos voces.
  - Cambio en `fibra_agencia.py`: un tramo vale si dos voces ponen fibra entre las mismas dos ciudades, aunque nombren operadores distintos. Esos tramos se dibujan sin nombre ni operador.
  - Las ciudades al otro lado de la frontera se buscan a menos de 800 km.
  - Los pueblos de las troncales salen de GeoNames cities500, en `herramientas/fuentes/pueblos-fibra.tsv`, que escribe el workflow de los pueblos.
- **Cables submarinos:** 8 más, confirmados por Astra 6 y ChatGPT en la ronda 18: Bahamas-2, Chuuk-Pohnpei, Danica North, Italy-Greece 1, Italy-Libya, Maldives Sri Lanka Cable, Melita-1 y Silphium. En total hay 453 cables enteros y 1.338 llegadas.
- **Respuestas de la agencia:** ChatGPT dio unos 145 cables «que faltan» que ninguna otra voz ha confirmado todavía. Están en `herramientas/cables-agencia/chatgpt-faltan-*.json`; entran solos en cuanto otra voz los nombre (vuelve a ejecutar `cables_agencia.py` y después `lugares_capas.py`).
- **Grok:** a su cuenta le quedan las tandas 8 y 9 de troncales, porque llegó a su límite semanal (se renueva el 27 de octubre).

**24 Oct 2026, 03:10 — hecho y publicado**
- **Cables por tierra:** **128 países** (93 al empezar la noche) y 1.266.628 km. Hay 142 tramos de la agencia confirmados por dos voces de cuatro: Astra 6, ChatGPT, Grok y Gemini.
- **Cables submarinos:** **480 cables enteros**, 1.383 llegadas con su pueblo. Esta noche se han sumado 35 de la agencia (ronda 18), entre ellos Alonso de Ojeda, BICS, PENCAN-7 y 8, SAIT, Scylla, CAM Ring, Deep Blue One y EAUFON.
- **Arreglos de la revisión de Órbita:** ver `herramientas/agencia-rondas/qa/revision-orbita-2026-10-24.md`, con lo arreglado (✅) y lo pendiente (⬜).

**Qué faltaba a las 03:10** (superado: lo vigente está al principio de este documento)
- **Gemini:** le faltan las tandas 5 a 9 de troncales por tierra (límite de uso hasta las 7:47 del 24 de octubre). Hay una tarea programada para las 7:52 que las lanza.
- **Grok:** le faltan las tandas 8 y 9 (límite semanal hasta el 27 de octubre).
- **Después de cada tanda:**
  1. Publica las respuestas en `main`.
  2. Lanza `gh workflow run pueblos-cables.yml --ref main`.
  3. Trae `herramientas/fuentes/pueblos-fibra.tsv`.
  4. Ejecuta `fibra_agencia.py` y luego `fibra_tierra.py --sin-ofds`.
  5. Publica en las dos ramas.
- **Hibernación:** ya no vale; solo si el dueño lo vuelve a pedir.

**En marcha a las 03:10** (superado)
- **Fibra por tierra de los países que faltan.** Hay datos de 93 países; faltan unos 85 con red troncal propia.
  - Astra 6 y ChatGPT responden en tandas. Sus respuestas van a `herramientas/fibra-agencia/astra-troncales-N.json` y `chatgpt-troncales-N.json`, y el texto bruto a `herramientas/agencia-rondas/ronda17/`.
  - Después hay que seguir estos pasos:
    1. `python3 herramientas/fibra_agencia.py`: solo se quedan los tramos que confirman las dos voces. Si falta alguna ciudad, añade su ALIAS.
    2. `python3 herramientas/fibra_tierra.py --sin-ofds`: funciona en local, porque clona AfTerFibre desde GitHub.
    3. Revisa `orbita/datos/fibra-tierra.json` (países y km).
    4. Publica en las dos ramas.
- *Ya no vale (al cerrar, el dueño estaba despierto); solo si lo vuelve a pedir:* al terminar el mapa, el dueño había pedido (23:49) **poner su ordenador en hibernación**. Hay permiso de clic sobre el escritorio de Windows («Explorador de archivos», nivel «click»): Inicio, después el botón de apagado y después «Hibernar». Si «Hibernar» no aparece en el menú, avísale; no cambies la configuración de energía.

**24 Oct 2026, 10:05 — hecho y publicado (cierre de esta cuenta, al 96 %)**
- **Cables por tierra:** de 128 a **168 países** y 1.295.144 km (1.295.161 tras África 1–3), con 277 tramos de la agencia. Entraron más respuestas de la agencia y la investigación profunda de ChatGPT (ronda 22).
- **Cables submarinos:** de 480 a **518 cables enteros** y 1.473 llegadas con su pueblo.
- **Lo pendiente** está al principio de este documento, en «Lo que quedó a medias» y «Primeros pasos de la cuenta nueva».

**Ronda 23 de Astra, tandas procesadas y publicadas**
- 10:21 · África 1–3: 168 países, 1.295.161 km, 277 tramos de la agencia.
- 10:22 · Arreglo en `fibra_agencia.py` para la ciudad de frontera que abre una ruta: 279 tramos, 1.296.013 km.
- 10:32 · África 4–5: 168 países, 1.298.289 km, 283 tramos de la agencia.
- 10:37 · África 6–7: 168 países, 1.302.357 km, 293 tramos de la agencia.
- 10:42 · África 8 y Asia 1: 168 países, 1.307.177 km, 308 tramos de la agencia.
- 10:56 · Asia 2–3: 168 países, 1.308.675 km, 317 tramos de la agencia.
- 10:59 · Asia 4: 168 países, 1.311.837 km, 328 tramos de la agencia.
- 11:05 · Asia 5: 168 países, 1.313.465 km, 335 tramos de la agencia.
- 11:06 · Asia 6: 168 países, 1.316.079 km, 342 tramos de la agencia.
- 11:08 · Asia 7: 168 países, 1.316.082 km, 342 tramos de la agencia.
- 11:11 · América 1: 168 países, 1.322.333 km, 361 tramos de la agencia.
- 11:14 · América 2: 168 países, 1.328.408 km, 374 tramos de la agencia.
- 11:15 · América 3: 168 países, 1.328.444 km, 374 tramos de la agencia.
- 11:19 · América 4: 168 países, 1.329.517 km, 378 tramos de la agencia.
- 11:23 · Europa 1: 168 países, 1.331.207 km, 386 tramos de la agencia.
- 11:27 · Europa 2: 168 países, 1.333.928 km, 394 tramos de la agencia.
- 11:30 · Europa 3: 168 países, 1.335.950 km, 404 tramos de la agencia.
- 11:34 · Europa 4: 168 países, 1.336.677 km, 406 tramos de la agencia.
- 11:38 · Europa 5: 168 países, 1.342.401 km, 413 tramos de la agencia.
- 11:40 · Europa 6: 168 países, 1.343.773 km, 416 tramos de la agencia.
- 11:41 · Oceanía 1: 169 países, 1.345.645 km, 420 tramos de la agencia.
- 12:25 · Ronda 24, lotes 1–2: cables de la agencia aceptados: 352 · tramos: 1058; lugares-capas: 521 grupos.
- 12:44 · Gemini, tanda 9: 169 países, 1.345.669 km, 421 tramos de la agencia.
- 13:00 · Arreglo del solape que vio el dueño (12:34): mientras está abierta la ficha de un botón de capas, los paneles de clases de debajo se apartan (`body.con-ficha-capa` en `orbita.css`; `capas.js?v=20261025t`, `orbita.css?v=20261025s`). Probado en local: la ficha sale, el panel se oculta y vuelve al quitar el ratón.
- 13:28 · Ronda 24, ChatGPT, lotes 1–2: cables de la agencia aceptados: 359 · tramos: 1079; lugares-capas: 528 grupos.
- 13:36 · Ronda 24, ChatGPT, lotes 3–4: cables de la agencia aceptados: 367 · tramos: 1117; lugares-capas: 536 grupos.
- 13:47 · Ronda 24, ChatGPT, lotes 5–6: cables de la agencia aceptados: 374 · tramos: 1144; lugares-capas: 543 grupos.
