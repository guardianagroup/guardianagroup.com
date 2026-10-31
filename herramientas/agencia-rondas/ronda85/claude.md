Ámbito: `@media (max-width:768px) and (pointer:coarse)`.

**1. Inicio, de arriba abajo**
1. Barra: candado 20 px + «GUARDIANA» (Plex Mono 13/600, espaciado .18em). Sin «Entrar» ni «ES».
2. Antetítulo mono 11 px #A9B3BE: «EN TU NAVEGADOR · SIN INSTALAR · SIN CUENTA».
3. Titular Plex Sans 300, 30/1.12: «Mira las conexiones. Decide qué cortar.» (segunda frase en acero).
4. Carrusel del relato.
5. Tarjeta «ÚLTIMA RADIOGRAFÍA · fecha»: cifra 44 px tabular, una línea de qué mide, «Ver todas ›». Datos del mismo origen que /radiografias/, nunca a mano.
6. Lista agrupada «Más» (filas 52 px, chevron): «Navegador ZERO · Programa para Windows», «Cómo funciona», «Multas», «Idioma · Español», «Términos», «Privacidad».
7. Pie mono 11 px: «En construcción · Hoy no se cobra nada».

Márgenes 20 px; 32 px entre bloques.

**2. Cabecera: barra pequeña fija**
(El título grande parece iOS impostado en Android.) 44 px + `env(safe-area-inset-top)`; transparente arriba; tras 8 px de desplazamiento, #06080C al 92 % y línea 0,5 px #1E2631. En subpáginas el H1 (28 px) va en el contenido; al quedar bajo la barra (IntersectionObserver) aparece el título centrado 17/600, fundido 150 ms. Izquierda «‹ Inicio» / «‹ Radiografías», toque 44×44.

**3. Barra de pestañas**
- 52 px + `max(env(safe-area-inset-bottom),8px)`; exige `viewport-fit=cover`.
- Icono 24 px; etiqueta Plex Sans 11/500 a 2 px, una línea.
- Activa: acero #9CC3E4, etiqueta 600. Inactiva: #6F7A86 (token nuevo; #A9B3BE se confunde con el acero).
- Sólida #080B10, línea superior 0,5 px #1E2631. Sin cristal: sobre negro no se aprecia y cuesta GPU sobre el WebGL.
- `padding-bottom` y `scroll-padding-bottom` del contenido = barra + 24 px.
- Tocar la pestaña activa sube al principio.

Iconos (fill none, stroke-width 1.6, uniones redondas; comprobados en render):
- Inicio: `M4 10 12 3.8 20 10v10.2h-5.2v-6h-5.6v6H4z`
- Comunicaciones: `M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5v-3.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z`
- Radiografías: `M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16`
- Órbita: `M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17zM3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5z`

**4. Relato: 5 tarjetas**
1. «¿Sabes a dónde van tus datos?» — «Al abrir una página, tus datos pueden salir hacia empresas que no ves.»
2. «Viajan por el fondo del mar.» — «Casi todo lo que envías a otro continente cruza por cables de fibra submarinos.»
3. «Y también por el espacio.» — «Si tu conexión sale por satélite, tus datos suben a la órbita y vuelven.»
4. «Se subastan mientras la página carga.» — «Si la web tiene anuncios, lo que se sabe de ti sale a subasta y gana quien más paga.» Nota: «Fuente: Irish Council for Civil Liberties, 2022.»
5. «Tú decides qué se corta.» — «El navegador ZERO te enseña a qué empresa y a qué país va cada conexión.» Botón «Cómo funciona ZERO».

Desplazamiento nativo (`scroll-snap-type:x mandatory`); ancho 100 % − 40 px, hueco 8 px, asoma la siguiente; alto `min(64dvh,520px)`. Fondo: imagen fija del planeta (AVIF, capa distinta por tarjeta); cero WebGL en Inicio. Indicador: 5 puntos de 6 px, el activo se alarga a 18 px en acero; son botones («Tarjeta 2 de 5»). Sin avance automático.

**5. Ocho detalles**
1. Transición y «atrás»: `@view-transition{navigation:auto}`; barras con `view-transition-name` para que no se muevan. Entre pestañas fundido 150 ms; hacia subpágina deslizamiento 24 px + fundido 220 ms. En `pagereveal`, si es atrás/adelante, `skipTransition()`: el gesto del sistema ya anima. Sin `unload` ni `no-store`, para que el bfcache vuelva al instante.
2. Toque: `-webkit-tap-highlight-color:transparent`, `:active` propio (#121924, 80 ms), `touch-action:manipulation`. Speculation Rules: prerender de Inicio y Radiografías; Órbita solo prefetch.
3. Rebote: `html{overscroll-behavior-y:contain}` quita «arrastrar para recargar» en Android y conserva el rebote de iOS. Órbita: `none` y `touch-action:none` en el lienzo.
4. Selección: `user-select:none` y `-webkit-touch-callout:none` en barras, botones y carrusel; textos y cifras sí se copian.
5. Zoom: nunca `user-scalable=no`; campos ≥ 16 px (evita el zoom de iOS); `-webkit-text-size-adjust:100%`.
6. Teclado: `interactive-widget=resizes-content`; `visualViewport` en iOS para el compositor; `enterkeyhint="send"`; barra oculta con teclado abierto.
7. Foco: solo `:focus-visible`, anillo 2 px acero; nada queda bajo las barras.
8. Sin blanco: CSS crítico en línea con fondo #06080C, `theme-color`, `color-scheme:dark`; barras en el HTML de cada página, no inyectadas por JS; Plex precargada con fallback `size-adjust`; sw.js guarda el armazón; alto reservado para datos tardíos.

**6. Encaje**
- Radiografías: fuera logo, globo, «Empezar» y subnavegación. Filtros como control segmentado fijo; cada tarjeta abre su detalle. La serif actual pasa a Plex.
- Órbita: directo al planeta (hoy muestra NÚCLEO). Barra transparente: «Órbita» y botón de capas. Hojas m2 apoyadas sobre la barra de pestañas: 120 px / 50dvh / 92dvh. Render en pausa con `visibilitychange`.
- Cómo funciona: subpágina de Inicio («‹ Inicio»), sin cabecera ni subnavegación.
- Comunicaciones: fuera «Añadir a la pantalla de inicio»; ¿Por qué?, engranaje y ES van a Ajustes.

**7. Evitar**
Hamburguesa o doble navegación; pantallas de carga con logo; animaciones > 300 ms; `100vh`; rojo en la navegación («Multas»); dos botones primarios (acero y blanco); adjetivos indemostrables («grado gubernamental»); cifras sin fuente («30 milisegundos» de la portada).

**Referencias**
1. Signal: tono sobrio, barra opaca, ajustes en lista; patrón de Comunicaciones.
2. Apple Buscar: mapa a pantalla completa con hojas sobre la barra de pestañas; modelo de Órbita.
3. Proton VPN: privacidad con mapa de conexiones, listas agrupadas, cero adorno.
