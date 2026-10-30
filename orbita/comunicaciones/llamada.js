// GUARDIANA · Comunicaciones · llamadas de voz, con cambio de voz opcional (27 Oct 2026, dueño: «llamadas de voz con
// opción de cambio de voz, para la sesión blindada y la normal»; «añadir audio sin perder privacidad»).
//
// WebRTC del propio navegador entre las dos páginas. La oferta, la respuesta y los candidatos viajan dentro del canal
// encriptado de la conversación, así que la huella DTLS que el navegador comprueba viene de la otra persona y de nadie
// más: el audio va encriptado de extremo a extremo (DTLS-SRTP). Con el servicio de llamadas del relé (TURN) el tráfico va
// siempre por el relé (iceTransportPolicy «relay»): ninguno de los dos ve la dirección IP del otro.
// El cambio de voz (voz.js) se hace aquí, antes de encriptar: la voz original no sale del equipo.
'use strict';
(function (raiz) {
  const $ = (s) => document.querySelector(s);
  const LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname); // en pruebas locales no hay TURN: candidatos directos
  // Voces: proporción de tono (2^(semitonos/12)) y mezcla «robot»
  const VOCES = { natural: { k: 1, robot: 0 }, grave: { k: Math.pow(2, -5 / 12), robot: 0 }, aguda: { k: Math.pow(2, 5 / 12), robot: 0 }, anonima: { k: Math.pow(2, -3 / 12), robot: 0.28 }, robot: { k: 1, robot: 1 } };
  const VOZ_JS = 'voz.js?v=20261027a';
  // Videollamada (dueño, 28 Oct 2026: «máxima calidad de imagen»): hasta 1080p a 30 imágenes por segundo, con un tope
  // de 6 Mb/s para la imagen (el servicio de llamadas admite unos 12 Mb/s por sentido). Si falta red, se conserva la
  // fluidez y baja la resolución, que vuelve a subir en cuanto hay red (10:15: con la resolución fija, entre Colombia y
  // Chequia la imagen llegaba a menos de una imagen por segundo). La imagen va como el audio: DTLS-SRTP y por el relé.
  // Hasta 4K cuando la cámara y la red lo dan (dueño, 29 Oct 2026, 09:48: «cuando la conexión sea muy buena… incluso a 4K»): se
  // pide la máxima resolución de la cámara y el navegador baja sola (resolución antes que fluidez) cuando la red o el procesador
  // no llegan; el tope de caudal es el de una 4K a 30 imágenes. El relé de llamadas (coturn) deja 32 Mb/s por sentido.
  // (en el teléfono, hasta 1080p: la 4K no la decodifican muchos Android y calienta el teléfono; ver TEL más abajo)
  const TEL_UA = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform || ''));
  const VIDEO = TEL_UA ? { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30, max: 30 }, facingMode: 'user' } : { width: { ideal: 3840 }, height: { ideal: 2160 }, frameRate: { ideal: 30, max: 30 }, facingMode: 'user' };
  const MAX_BPS_VIDEO = 20000000;
  // «Tu imagen» (dueño, 28 Oct 2026: que no puedan tener «nuestro rostro, ni el iris, ni el reconocimiento facial»).
  // Como el cambio de voz, se hace aquí, antes de encriptar: cada imagen de la cámara se reduce a una cuadrícula de pocos
  // puntos (32 o 24 de ancho) y solo eso se amplía y se envía. El detalle de la cara no sale nunca del equipo, y no
  // depende de detectar la cara (una máscara que siga la cara puede fallar un instante y dejarla a la vista).
  const IMAGENES = { natural: null, difuminada: { w: 32, suave: true }, mosaico: { w: 24, suave: false } };
  const SALIDA_W = 640; // la imagen protegida no necesita más: menos caudal, más fluida
  // «Mejorar la luz» (dueño, 28 Oct 2026, 10:24: «los tonos, por ejemplo, de brillo»): la cámara en automático (exposición,
  // balance de blancos y enfoque, si los admite) y, con poca luz, se aclara la imagen en el equipo antes de encriptarla.
  // Con buena luz la cámara va tal cual, sin procesar.
  const LUZ_OSCURA = 0.40, LUZ_META = 0.47, LUZ_MAX = 1.6;
  const LUZ_PRUEBA = LOCAL && new URLSearchParams(location.search).has('luz'); // en pruebas locales, como si hubiera poca luz
  // ¿El lienzo sabe aplicar filtros (brillo)? Safari, por ejemplo, no: allí «Mejorar la luz» se queda en la cámara automática.
  const FILTRO_OK = (() => { try { const c = document.createElement('canvas'); c.width = c.height = 1; const g = c.getContext('2d'); g.filter = 'brightness(2)'; g.fillStyle = '#404040'; g.fillRect(0, 0, 1, 1); return g.getImageData(0, 0, 1, 1).data[0] > 0x60; } catch (_) { return false; } })();
  // una imagen casi negra no es «poca luz»: es que el navegador no deja leer la cámara (28 Oct 2026, 10:41, en teléfonos)
  const LUZ_NEGRA = 0.03;
  const reproduce = (v) => { try { const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {} };
  // Teléfono o Safari: códecs que funcionan entre iPhone y Android (H.264 y VP8). VP9 primero solo entre ordenadores
  // (28 Oct 2026, 10:45: entre un iPhone y un Android, con VP9 la imagen llegaba en negro en los dos sentidos).
  const UA = navigator.userAgent || '';
  const COMPATIBLE = /Android|iPhone|iPad|iPod/i.test(UA) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform || '')) || (/Safari\//.test(UA) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/.test(UA));
  const EQUIPO = COMPATIBLE ? 'compatible' : 'escritorio';
  // el sistema de cada lado viaja en la oferta: entre iPhone y Android, VP8 (dueño, 29 Oct 2026, 13:09 y 14:13: del iPhone al Android
  // la imagen llegaba en negro con H.264; el H.264 de Safari y el decodificador de algunos Android no se entienden). Entre iPhones, H.264.
  const PLAT = /iPhone|iPad|iPod/i.test(UA) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform || '')) ? 'ios' : /Android/i.test(UA) ? 'android' : 'otro';
  // Sonido (dueño, 28 Oct 2026, 12:12: «al máximo nivel… reducción de ruido o alta fidelidad»): micrófono a 48 kHz con la
  // cancelación de eco, la reducción de ruido y el control de volumen del navegador, y su aislamiento de voz donde lo tenga
  // (si no lo tiene, se ignora). En la llamada, Opus de banda completa hasta 96 kb/s con corrección de errores: ver altaFidelidad.
  const AUDIO = { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1, sampleRate: { ideal: 48000 }, sampleSize: { ideal: 16 }, voiceIsolation: { ideal: true } };
  const MAX_BPS_AUDIO = 96000;

  function crea(o) {
    // o: { ice(), manda(m), puede(), nombre(), inicial(), fin(info), t(s), aviso(s) }
    const t = (s) => (o.t ? o.t(s) : s);
    const caja = $('#llamada'), paso = $('#ll-paso'), tiempo = $('#ll-tiempo'), calidad = $('#ll-calidad');
    let pc = null, mic = null, envio = null, ctx = null, nodo = null, estado = 'libre', iniciada = 0, reloj = null, pendientes = [], ofertaEntrante = null, idLlamada = null, colgoYo = false, sondeo = null;
    let envioVoz = null; // la voz cambiada (solo si se elige una voz que no es la natural)
    let altavoz = true, salidas = null; // por dónde suena la llamada en el teléfono: altavoz o auricular
    let ruta = null, refuerzos = []; // el silencio que fija esa salida en el iPhone (ver preparaRuta)
    let muda = null; // la segunda pista de audio, en silencio (ver agregaMuda)
    let inicioYo = false; // quién llamó: el resumen del chat va a mi lado o al suyo (dueño, 28 Oct 2026, 13:29)
    let pantallaEncendida = null; // Wake Lock: la pantalla no se apaga mientras dura la llamada (agencia, ronda 74)
    let cam = null, video = false, suCamara = true, remotoV = null; // videollamada: mi cámara, si la llamada es con imagen, si la otra persona tiene la cámara encendida y su imagen
    // El número de seguridad de la llamada (dueño, 29 Oct 2026, 10:16: «un número grande en el medio de la pantalla… el otro tiene
    // que ver el mismo número»). Es el esquema de ZRTP (Zimmermann; RFC 6189): cada llamada estrena un acuerdo de claves P-256 con
    // compromiso previo (quien llama manda primero la huella de su clave y la revela cuando ya tiene la de la otra persona), y el
    // número sale de ese secreto compartido más las huellas DTLS de los dos equipos. Quien esté en medio no puede fabricar el
    // mismo número en las dos pantallas (una entre diez mil por llamada), y la comparación la hacen las dos personas con su voz y
    // su cara: no hay que mandar nada por ningún sitio.
    let sas = null; // { clave, pub, compromiso, suCompromiso, suPub, numero, estado: 'pendiente' | 'coinciden' | 'no' | 'roto' }
    let sasPlegadoT = null;
    // la voz y la imagen empiezan siempre naturales: se cambian en la llamada con «Voz grave» y «Mosaico» (29 Oct 2026, 07:51)
    let imagen = 'natural'; try { localStorage.removeItem('gcom-imagen'); } catch (_) {}
    let proc = null; // la imagen procesada (lienzo): protegida, o aclarada si hay poca luz
    // «Mejorar la luz»: de entrada, en el ordenador sí y en el teléfono no (su cámara ya ajusta la luz y así gasta menos batería)
    let luz = !COMPATIBLE; try { const v = localStorage.getItem('gcom-luz'); if (v !== null) luz = v !== '0'; } catch (_) {}
    let ganancia = 1, medidor = null, vCam = null, ajustes = false;
    let voz = 'natural'; try { localStorage.removeItem('gcom-voz'); } catch (_) {}
    // Llamada en grupo: la versión que entiende este equipo, si la otra persona también la entiende, la mezcla de voces y la voz que
    // llega de la otra persona (para mezclarla)
    const TRES = 1;
    let suTres = false, mezcla = null, vozSuya = null;
    // la llamada en grupo (ver «Llamada en grupo» más abajo): los tramos que añadí yo y el estado de grupo del tramo principal
    let patas = [], PR = null;
    const MAX_GRUPO = 4;
    let alEstadoPc = null, alIcePc = null, alNegociarPc = null; // los manejadores de la conexión principal (también para la ascendida)
    const ocupado = () => estado !== 'libre';
    // dueño, 28 Oct 2026, 10:28: las opciones de imagen (Difuminada, Mosaico y «Mejorar la luz») solo en la sesión
    // blindada; en la normal, la básica, la imagen va tal cual
    const blindada = () => !!(o.blindada && o.blindada());

    function pinta() {
      caja.classList.toggle('gc-abierta', estado !== 'libre');
      if (estado !== 'cerrando') caja.classList.remove('gc-saliendo');
      // una llamada que entra se ve siempre en grande; al terminar, la próxima empieza en grande
      if (estado === 'entrante' || estado === 'libre') pequena(false);
      if (estado !== 'hablando' || ajustes) { caja.classList.remove('reposo'); clearTimeout(reposo); }
      $('#ll-entrante').hidden = estado !== 'entrante';
      $('#ll-botones').hidden = estado === 'entrante';
      if (video && (estado === 'hablando' || estado === 'conectando' || estado === 'llamando')) raiz.requestAnimationFrame(() => miImagen());
      giro(estado !== 'libre' && estado !== 'cerrando');
      // dueño, 28 Oct 2026, 12:49 («que sea profesional… como hacen las otras aplicaciones»): el nombre que la otra persona se puso
      // y, si no se puso ninguno, «Llamada encriptada» o «Videollamada encriptada» (antes, «La otra persona»)
      { const base = o.nombre() || (video ? t('Videollamada encriptada') : t('Llamada encriptada'));
        // al sonar, si llaman desde un grupo, también cuántos son ya (para saber que se entra en una llamada en grupo)
        const tot = estado === 'hablando' ? totalGrupo() : estado === 'entrante' && PR ? 1 + Math.max(1, PR.n | 0) : 0;
        const g = t('Llamada en grupo · {n} personas').replace('{n}', tot);
        $('#ll-nombre').textContent = tot > 2 ? (estado === 'entrante' ? base + ' · ' + g : g) : base; }
      // «Añadir» (llamada en grupo, hasta 4; cualquiera de la llamada): mientras suena la persona añadida, el mismo botón cancela
      { const ad = $('#ll-anadir-caja'), b = $('#ll-anadir');
        const llamandoT = patas.some((L) => L.estado === 'saliente');
        if (ad) ad.hidden = !(estado === 'hablando' && !blindada() && !!o.eligeTercero && (llamandoT || puedeAnadir()));
        if (b) { b.classList.toggle('cancela', llamandoT); b.setAttribute('aria-label', llamandoT ? t('Cancelar') : t('Añadir a la llamada')); const sp = $('#ll-anadir-caja > span'); if (sp) sp.textContent = llamandoT ? t('Cancelar') : t('Añadir'); } }
      pintaGrupo();
      $('#ll-avatar').textContent = o.inicial();
      caja.setAttribute('aria-label', video ? t('Videollamada') : t('Llamada de voz'));
      $('#ll-camara-caja').hidden = !(video && cam);
      { const g = $('#ll-girar-caja'); if (g) g.hidden = !(video && cam && TEL_UA && camaraOn()); }
      // «Pantalla completa», solo en el ordenador y con imagen (dueño, 30 Oct 2026, 09:02: «toda la pantalla del PC»)
      { const f = $('#ll-completa-caja'); if (f) f.hidden = !(video && completaPC()); }
      // «Vista» (dueño, 30 Oct 2026, 11:04: el simbolito sobre la imagen «se hace muy raro… cámbialo de sitio… más profesional»):
      // en el ordenador, partir la pantalla o dejarte en pequeño se hace con un botón con su nombre, abajo con los demás
      { const v = $('#ll-vista-caja'), fino = !!(raiz.matchMedia && raiz.matchMedia('(hover: hover) and (pointer: fine)').matches); if (v) v.hidden = !(fino && video && cam && remotoV && suCamara && estado === 'hablando' && !caja.classList.contains('tres')); }
      $('#ll-imagenes').hidden = !(video && blindada());
      // 29 Oct 2026, 07:51 (dueño): «La opción… mosaico y… la voz, en el chat normal no quiero que esté. Solamente… en el blindado dos
      // opciones… la voz en modo grave y el mosaico… dos botones… muy profesionales cuando se abra… Antes no quiero que se vean»:
      // sin «Voz e imagen» ni la píldora «Tu voz»; en el blindado, «Voz grave» y, con imagen, «Mosaico», solo con la llamada en marcha
      $('#ll-ajustes-caja').hidden = true; ajustes = false;
      const efectos = blindada() && estado === 'hablando';
      $('#ll-grave-caja').hidden = !efectos;
      $('#ll-mosaico-caja').hidden = !(efectos && video && !!cam);
      $('#ll-grave').setAttribute('aria-pressed', String(voz === 'grave'));
      $('#ll-mosaico').setAttribute('aria-pressed', String(imagen === 'mosaico'));
      // cada botón dice en qué estado está y qué hace el toque (dueño, 29 Oct 2026, 09:23: «súper fácil de utilizar en pantalla»)
      for (const [id, on] of [['grave', voz === 'grave'], ['mosaico', imagen === 'mosaico']]) {
        const sp = $('#ll-' + id + '-caja > span'); if (!sp) continue;
        const nombre = id === 'grave' ? t('Voz grave') : t('Mosaico'), est = on ? t('activado') : t('desactivado');
        sp.innerHTML = ''; const b1 = document.createElement('b'); b1.textContent = nombre; const b2 = document.createElement('i'); b2.textContent = est; sp.append(b1, b2);
        $('#ll-' + id).setAttribute('aria-label', nombre + ': ' + est + ' · ' + (on ? t('tocar para quitarlo') : t('tocar para ponerlo')));
      }
      const etq = blindada() ? t('Voz e imagen') : t('Tu voz');
      $('#ll-ajustes-b').setAttribute('aria-label', etq); const se = $('#ll-ajustes-caja span'); if (se) se.textContent = etq;
      caja.classList.toggle('ajustes', ajustes);
      $('#ll-ajustes-b').setAttribute('aria-pressed', String(ajustes));
      document.body.classList.toggle('en-llamada', estado !== 'libre');
      // agencia, ronda 74 (ChatGPT y Gemini): el tiempo, solo con la llamada contestada (antes se veía «00:00» mientras sonaba);
      // al recibir, solo quién llama y «Rechazar» / «Contestar»: «Tu voz» queda en una píldora que se abre si se toca
      tiempo.hidden = estado !== 'hablando';
      // en la sesión blindada, la voz y la imagen siguen a la vista al recibir: ahí se elige proteger la cara antes de contestar
      // en el teléfono, al recibir, también en la blindada: solo quién llama y los dos botones, como FaceTime (recorrido del
      // 28 Oct, 16:40); la voz y la imagen, en la píldora
      // y en el teléfono, también durante la llamada de voz (dueño, 28 Oct 2026, 17:17: «minimalista»): la pantalla limpia, como
      // WhatsApp o FaceTime (quién, el tiempo y los botones); las voces, en la misma píldora «Tu voz»
      const movil = !!(raiz.matchMedia && raiz.matchMedia('(max-width: 760px)').matches);
      const plegar = (estado === 'entrante' && (!blindada() || movil)) || (movil && !video && estado !== 'libre');
      caja.classList.toggle('entrando', plegar);
      if (!plegar) caja.classList.remove('voz-abierta');
      const pi = $('#ll-voz-pill');
      if (pi) { pi.hidden = true; pi.setAttribute('aria-expanded', String(caja.classList.contains('voz-abierta'))); const b = $('#ll-voces [data-voz="' + voz + '"]'), s = pi.querySelector('span'); if (s) s.textContent = t('Tu voz') + ': ' + (b ? b.textContent : t('Natural')); }
      mantenPantalla(estado !== 'libre' && estado !== 'cerrando');
      pintaVoces(); pintaImagenes(); pintaVideo(); pintaAltavoz(); fondo(); if (estado !== 'libre') requestAnimationFrame(escala);
      if (o.estado) { try { o.estado(estado, video); } catch (_) {} }
    }
    // La pantalla no se apaga sola mientras dura la llamada (Wake Lock; agencia, ronda 74). Si el navegador no lo permite o lo
    // retira, la llamada sigue igual; al volver a la pestaña se pide otra vez.
    async function mantenPantalla(si) {
      try {
        if (si && !pantallaEncendida && navigator.wakeLock && document.visibilityState === 'visible') {
          pantallaEncendida = 'pidiendo';
          const w = await navigator.wakeLock.request('screen');
          if (estado === 'libre' || estado === 'cerrando') { w.release().catch(() => {}); pantallaEncendida = null; return; }
          pantallaEncendida = w; w.addEventListener('release', () => { if (pantallaEncendida === w) pantallaEncendida = null; });
        } else if (!si && pantallaEncendida && pantallaEncendida !== 'pidiendo') { const w = pantallaEncendida; pantallaEncendida = null; await w.release(); }
      } catch (_) { if (pantallaEncendida === 'pidiendo') pantallaEncendida = null; }
    }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && estado !== 'libre' && estado !== 'cerrando') mantenPantalla(true); });
    // Con la llamada en grande, el chat de detrás no se puede tocar ni recibe el foco (dueño, 28 Oct 2026, 12:06: «me aparece
    // la L esa para empezar a escribir»: el cursor del campo de texto parpadeaba detrás de la llamada). En pequeño, vuelve.
    function fondo() {
      const app = document.querySelector('#app'); if (!app) return;
      if (estado !== 'libre' && !caja.classList.contains('mini')) {
        const f = document.activeElement; if (f && app.contains(f)) { try { f.blur(); } catch (_) {} }
        app.setAttribute('inert', '');
      } else app.removeAttribute('inert');
    }
    // La llamada en pequeño (dueño, 28 Oct 2026: «seguir en llamada y que aparezca el chat»): una tarjeta en una esquina
    // con la imagen, el tiempo y los botones, y el chat libre debajo para escribir y mandar archivos.
    // Pantalla completa en el ordenador (dueño, 30 Oct 2026, 09:02): la pide el botón de la llamada; se sale con el mismo botón
    // o con Esc, y al colgar, si la pidió la llamada
    var completaPorLlamada = false; // (var y function: se usan desde «pinta», que puede correr antes de llegar aquí)
    function completaPC() { try { return !!(document.fullscreenEnabled && document.documentElement.requestFullscreen) && !!(raiz.matchMedia && raiz.matchMedia('(hover: hover) and (pointer: fine)').matches); } catch (_) { return false; } }
    function alternaCompleta() {
      try {
        if (document.fullscreenElement) { completaPorLlamada = false; document.exitFullscreen().catch(() => {}); }
        else { completaPorLlamada = true; document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => { completaPorLlamada = false; }); }
      } catch (_) {}
    }
    function sueltaCompleta() { if (completaPorLlamada && document.fullscreenElement) { try { document.exitFullscreen().catch(() => {}); } catch (_) {} } completaPorLlamada = false; }
    function pequena(si) {
      caja.classList.toggle('mini', !!si);
      if (si) recolocaMini(); else caja.classList.remove('mini-movida');
      caja.setAttribute('aria-modal', si ? 'false' : 'true');
      fondo();
      // en el ordenador, listo para escribir; en el teléfono no se abre el teclado solo (se toca el campo, como en cualquier app)
      const fino = !!(raiz.matchMedia && raiz.matchMedia('(hover: hover) and (pointer: fine)').matches);
      if (si && fino) { const x = document.querySelector('#texto'); if (x && !x.closest('[hidden]')) { try { x.focus({ preventScroll: true }); } catch (_) {} } }
    }
    const camaraOn = () => !!(cam && cam.getVideoTracks().some((x) => x.enabled && x.readyState === 'live'));
    // Tonos (dueño, 28 Oct 2026, 10:37): quien llama oye el tono de llamada y a quien llaman le suena un timbre, hasta que
    // contesta, rechaza o cuelga. Se hacen aquí con el audio del navegador, sin archivos. Sin respuesta en 45 s, se cancela.
    // 11:31 (dueño: «que se escuche»): un solo contexto de audio para los tonos, que se desbloquea con el primer toque o tecla
    // en la página (el iPhone solo deja arrancar el audio desde un gesto; así el timbre suena aunque la llamada llegue sin
    // tocar nada), más volumen, 425 Hz para el tono de llamada (el de España y buena parte de América) y vibración en Android.
    const SIN_RESPUESTA_MS = 60000; // 60 s sonando (WhatsApp y Telegram dejan sonar más de 45 s; estudio del 29 Oct 2026)
    let tonoCtx = null, tonoSalida = null, tonoReloj = null, sinRespuesta = null, tonoSuena = false;
    const tonoNodos = new Set();
    function ctxTonos() {
      if (!tonoCtx) {
        try { tonoCtx = new (raiz.AudioContext || raiz.webkitAudioContext)(); } catch (_) { return null; }
        try { tonoSalida = tonoCtx.createDynamicsCompressor(); tonoSalida.connect(tonoCtx.destination); } catch (_) { tonoSalida = tonoCtx.destination; }
      }
      if (tonoCtx.state === 'suspended') tonoCtx.resume().catch(() => {});
      return tonoCtx;
    }
    // primer gesto en la página: se crea y se arranca el contexto (queda permitido) y, si no suena nada, se duerme
    const GESTOS = ['pointerdown', 'keydown', 'touchend'];
    function desbloqueaTonos() {
      const c = ctxTonos(); if (!c) return;
      for (const g of GESTOS) raiz.document.removeEventListener(g, desbloqueaTonos, true);
      setTimeout(() => { if (!tonoSuena && tonoCtx && tonoCtx.state === 'running') tonoCtx.suspend().catch(() => {}); }, 1500);
    }
    for (const g of GESTOS) raiz.document.addEventListener(g, desbloqueaTonos, { capture: true, passive: true });
    // Tono de llamada para los dos (dueño, 28 Oct 2026, 19:05: «tiene que haber tono de llamada, tanto para el que la recibe como
    // el que la está escuchando»). En el iPhone, el audio del navegador (el contexto de audio de arriba) se calla con el
    // interruptor de silencio y se puede quedar parado al empezar la llamada; por eso los tonos suenan con un <audio> (un sonido
    // como el de un vídeo), que suena con el volumen del teléfono. Se prepara con el primer toque en la página (el iPhone lo
    // exige) y, si aun así no deja, suena el de antes.
    const TONO_URL = {};
    // Timbres (dueño, 29 Oct 2026, 17:42: «los pitidos cuando estoy recibiendo una llamada no me gustan, no los veo profesionales»):
    // a 44,1 kHz, con timbre de campana (parciales ligeramente inarmónicos que se apagan a distinta velocidad), de marimba (golpe de
    // mazo y armónicos) o el doble timbre clásico de teléfono (dos tonos que baten y el badajo), y un poco de eco de sala. El que
    // suena lo elige TIMBRE. El tono de llamada (saliente) sigue siendo el 425 Hz de la red, limpio.
    const TIMBRE = 'clasico'; // el doble timbre clásico de teléfono: elegido por el dueño (29 Oct 2026, 17:46)
    function urlTono(tipo) {
      if (TONO_URL[tipo]) return TONO_URL[tipo];
      const sr = 44100, dur = tipo === 'saliente' ? 4 : tipo === 'silencio' ? 0.25 : TIMBRE === 'clasico' ? 3 : 3.6, n = Math.round(sr * dur), pcm = new Float32Array(n);
      const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5 };
      const pon = (frecs, ini, d, vol) => {
        const i0 = Math.round(ini * sr), i1 = Math.min(n, Math.round((ini + d) * sr));
        for (let i = i0; i < i1; i++) { const t = (i - i0) / sr, env = Math.max(0, Math.min(1, t / 0.015, (d - t) / 0.04)); let v = 0; for (const [f, w] of frecs) v += w * Math.sin(2 * Math.PI * f * t); pcm[i] += v * vol * env; }
      };
      const campana = (f, ini, d, vol) => {
        const i0 = Math.round(ini * sr), i1 = Math.min(n, Math.round((ini + d) * sr)), P = [[1, 1, 2.2], [2, 0.45, 3.5], [2.42, 0.22, 5], [3, 0.18, 6], [4.2, 0.08, 9], [0.5, 0.12, 2]];
        for (let i = i0; i < i1; i++) { const t = (i - i0) / sr; let v = 0; for (const [k, w, c] of P) v += w * Math.exp(-t * c) * Math.sin(2 * Math.PI * f * k * t + 0.3 * k); pcm[i] += v * vol * Math.min(1, t / 0.003); }
      };
      const marimba = (f, ini, d, vol) => {
        const i0 = Math.round(ini * sr), i1 = Math.min(n, Math.round((ini + d) * sr));
        for (let i = i0; i < i1; i++) { const t = (i - i0) / sr; let v = Math.exp(-t * 5.5) * Math.sin(2 * Math.PI * f * t) + 0.5 * Math.exp(-t * 9) * Math.sin(2 * Math.PI * f * 4 * t) + 0.25 * Math.exp(-t * 14) * Math.sin(2 * Math.PI * f * 10 * t); v += (Math.random() * 2 - 1) * Math.exp(-t * 220) * 0.08; pcm[i] += v * vol * Math.min(1, t / 0.004); }
      };
      const timbre = (ini, d) => {
        const i0 = Math.round(ini * sr), i1 = Math.min(n, Math.round((ini + d) * sr));
        for (let i = i0; i < i1; i++) { const t = (i - i0) / sr; const v = (0.5 * Math.sin(2 * Math.PI * 1200 * t) + 0.45 * Math.sin(2 * Math.PI * 1545 * t) + 0.15 * Math.sin(2 * Math.PI * 2400 * t)) * (1 + 0.6 * Math.sin(2 * Math.PI * 22 * t)) / 1.6; pcm[i] += v * 0.55 * Math.min(1, t / 0.01, (d - t) / 0.05); }
      };
      if (tipo === 'silencio') { /* nada: un cuarto de segundo de silencio de verdad, para desbloquear el <audio> */ }
      else if (tipo === 'saliente') pon([[425, 1], [850, 0.1]], 0, 1.2, 0.4);
      else if (TIMBRE === 'campana') { [['E5', 0], ['G5', 0.19], ['C6', 0.38], ['G5', 0.57], ['E5', 0.95], ['G5', 1.14], ['C6', 1.33], ['E6', 1.52]].forEach(([k, ini], i) => campana(N[k], ini, 1.6, i < 4 ? 0.55 : 0.6)); }
      else if (TIMBRE === 'clasico') { timbre(0, 0.4); timbre(0.6, 0.4); }
      else { for (const [k, ini, v] of [['C5', 0, 0.9], ['E5', 0.22, 0.9], ['G5', 0.44, 0.95], ['E5', 0.66, 0.8], ['C5', 0.88, 0.85], ['G5', 1.1, 0.9], ['A5', 1.54, 0.95], ['G5', 1.76, 0.9], ['E5', 1.98, 0.85], ['C5', 2.2, 0.9]]) marimba(N[k], ini, 1.2, v * 0.7); }
      if (tipo !== 'silencio' && tipo !== 'saliente') {
        // eco de sala (cuatro repeticiones cortas que se apagan) y un límite suave para que no sature
        const eco = Float32Array.from(pcm);
        for (const [dd, g] of [[0.071, 0.28], [0.113, 0.18], [0.197, 0.12], [0.331, 0.07]]) { const k = Math.round(dd * sr); for (let i = k; i < n; i++) pcm[i] += g * eco[i - k]; }
        for (let i = 0; i < n; i++) pcm[i] = Math.tanh(pcm[i] * 1.1) * 0.85;
      }
      const buf = new ArrayBuffer(44 + n * 2), dv = new DataView(buf), txt = (o, x) => { for (let i = 0; i < x.length; i++) dv.setUint8(o + i, x.charCodeAt(i)); };
      txt(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); txt(8, 'WAVE'); txt(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
      dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); txt(36, 'data'); dv.setUint32(40, n * 2, true);
      for (let i = 0; i < n; i++) dv.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, Math.round(pcm[i] * 32767))), true);
      return (TONO_URL[tipo] = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
    }
    const tonoEl = document.createElement('audio'); tonoEl.loop = true; tonoEl.preload = 'auto'; tonoEl.setAttribute('playsinline', ''); tonoEl.setAttribute('aria-hidden', 'true');
    let tonoElListo = false;
    // los timbres se preparan con calma al arrancar (unos 100–300 ms en un teléfono): así la primera llamada suena al instante
    setTimeout(() => { try { urlTono('entrante'); urlTono('saliente'); } catch (_) {} }, 3500);
    function desbloqueaTonoEl() {
      if (tonoElListo) return; tonoElListo = true;
      try {
        // con un silencio de verdad (dueño, 28 Oct 2026, 20:24: «cuando actualizo la aplicación, sale como un pitido. Pip, pip, pip,
        // pip»): antes se desbloqueaba con el propio timbre «en mudo», y el iPhone dejaba oír sus cuatro notas al primer toque
        tonoEl.src = urlTono('silencio'); tonoEl.muted = true; tonoEl.loop = false;
        const p = tonoEl.play();
        const listo = () => { if (!tonoSuena) tonoEl.pause(); tonoEl.muted = false; for (const g of GESTOS) raiz.document.removeEventListener(g, desbloqueaTonoEl, true); };
        if (p && p.then) p.then(listo).catch(() => { tonoEl.muted = false; tonoElListo = false; }); else listo();
      } catch (_) { tonoElListo = false; }
    }
    for (const g of GESTOS) raiz.document.addEventListener(g, desbloqueaTonoEl, { capture: true, passive: true });
    const vibra = (patron) => { try { if (raiz.navigator.vibrate) raiz.navigator.vibrate(patron); } catch (_) {} };
    function paraTono() {
      clearInterval(tonoReloj); tonoReloj = null; tonoSuena = false;
      try { tonoEl.pause(); } catch (_) {}
      // el iPhone enseñaba el tono como si fuera música, con barra y botones de ±10 s en la pantalla bloqueada (dueño, 29 Oct 2026,
      // 12:22: «una cosa rara de avanzar como si fuera un vídeo»): al parar, el <audio> se vacía y la sesión de medios se cierra
      try { tonoEl.removeAttribute('src'); tonoEl.load(); } catch (_) {}
      try { if (navigator.mediaSession) { navigator.mediaSession.playbackState = 'none'; navigator.mediaSession.metadata = null; } } catch (_) {}
      for (const n of tonoNodos) { try { n.stop(); } catch (_) {} }
      tonoNodos.clear();
      vibra(0);
      if (tonoCtx && tonoCtx.state === 'running') tonoCtx.suspend().catch(() => {});
    }
    function tono(tipo) {
      paraTono();
      tonoSuena = true;
      // el tono de llamada (saliente), con el audio del navegador y no con un <audio>: en el iPhone, el <audio> de 4 s se quedaba en
      // la pantalla bloqueada como «GUARDIANA 0:00 / −0:04» con ▶ y ±10 s (dueño, 29 Oct 2026, 23:31: «una notificación rara… como
      // un audio de 4 segundos»), y además, al arrancar el último, se llevaba la llamada al altavoz. Con la llamada en marcha, la
      // sesión de audio ya está en «play-and-record»: suena aunque el teléfono esté en silencio. Al parar, el contexto se duerme.
      if (tipo === 'saliente') { tonoWeb(tipo); return; }
      let p = null;
      try { tonoEl.src = urlTono(tipo); tonoEl.muted = false; tonoEl.loop = true; p = tonoEl.play(); } catch (_) { p = Promise.reject(); }
      try { if (navigator.mediaSession && raiz.MediaMetadata) { navigator.mediaSession.metadata = new MediaMetadata({ title: tipo === 'saliente' ? t('Llamando…') : t('Llamada entrante'), artist: 'GUARDIANA' }); for (const a of ['play', 'pause', 'seekbackward', 'seekforward', 'seekto', 'previoustrack', 'nexttrack']) { try { navigator.mediaSession.setActionHandler(a, null); } catch (_) {} } } } catch (_) {}
      Promise.resolve(p).then(() => {
        // con el <audio> sonando, en Android además vibra al recibir
        if (tipo === 'entrante' && tonoSuena) { vibra([350, 150, 350]); tonoReloj = setInterval(() => vibra([350, 150, 350]), 2600); }
      }).catch(() => { if (tonoSuena) tonoWeb(tipo); });
    }
    // el de antes, con el audio del navegador, por si el teléfono no deja sonar el <audio>
    function tonoWeb(tipo) {
      const ctx = ctxTonos(); if (!ctx) return;
      const pita = (frecs, ini, dur, vol) => {
        for (const [f, v] of frecs) {
          const os = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + ini;
          os.type = 'sine'; os.frequency.value = f;
          g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol * v, t0 + 0.015); g.gain.setValueAtTime(vol * v, t0 + dur - 0.04); g.gain.linearRampToValueAtTime(0, t0 + dur);
          os.connect(g).connect(tonoSalida); os.start(t0); os.stop(t0 + dur + 0.05);
          tonoNodos.add(os); os.onended = () => tonoNodos.delete(os);
        }
      };
      // el mismo timbre de madera que el <audio>, con osciladores: nota con cola que se apaga sola
      const madera = (f, ini, vol) => {
        for (const [k, w, caida] of [[1, 1, 4.2], [2, 0.35, 7], [3.01, 0.12, 11]]) {
          const os = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + ini;
          os.type = 'sine'; os.frequency.value = f * k;
          g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol * w, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 4 / caida);
          os.connect(g).connect(tonoSalida); os.start(t0); os.stop(t0 + 4 / caida + 0.05);
          tonoNodos.add(os); os.onended = () => tonoNodos.delete(os);
        }
      };
      const ciclo = tipo === 'saliente' ? () => pita([[425, 1], [850, 0.12]], 0, 1.2, 0.16)
        : () => { madera(740, 0, 0.26); madera(587, 0.42, 0.26); madera(740, 1.1, 0.24); madera(587, 1.52, 0.24); vibra([350, 150, 350]); };
      // si el contexto aún no puede sonar (sin ningún gesto en la página), el ciclo sigue y suena en cuanto la persona toque algo
      ciclo(); clearInterval(tonoReloj); tonoReloj = setInterval(() => { if (tonoCtx && tonoCtx.state !== 'running') tonoCtx.resume().catch(() => {}); ciclo(); }, tipo === 'saliente' ? 4000 : 2600);
    }
    function esperaRespuesta(saliente) {
      clearTimeout(sinRespuesta);
      sinRespuesta = setTimeout(() => {
        if (saliente && estado === 'saliente') { o.manda({ acto: 'colgar', id: idLlamada }); termina('rechazada'); }
        else if (!saliente && estado === 'entrante') termina('rechazada');
      }, SIN_RESPUESTA_MS);
    }
    // En la videollamada, la barra de arriba, el nombre y los botones se esconden solos a los 3 s sin tocar nada, para
    // ver la imagen entera (dueño, 28 Oct 2026, 10:36: «la botonería me corta la zona del pecho»); vuelven al mover el
    // ratón, al tocar la pantalla o con el teclado. Nunca con la tarjeta abierta, en pequeño o con un botón enfocado.
    let reposo = null;
    function despierta() {
      // cualquier toque vuelve a arrancar el sonido y la imagen que llegan (el iPhone a veces los deja parados)
      if (estado === 'hablando') { suenaRemoto(); if (remotoV) reproduce($('#v-remoto')); if (ctx && ctx.state !== 'running' && ctx.state !== 'closed') ctx.resume().catch(() => {}); if (mezcla && mezcla.ctx.state !== 'running' && mezcla.ctx.state !== 'closed') mezcla.ctx.resume().catch(() => {}); for (const L of patas) if (L.el && L.el.srcObject && L.el.paused) reproduce(L.el); }
      caja.classList.remove('reposo'); clearTimeout(reposo);
      reposo = setTimeout(() => {
        const foco = document.activeElement && caja.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
        if (estado === 'hablando' && caja.classList.contains('con-video') && !ajustes && !caja.classList.contains('mini') && !foco) caja.classList.add('reposo');
      }, 3000);
    }
    for (const ev of ['pointermove', 'pointerdown', 'keydown', 'touchstart']) caja.addEventListener(ev, despierta, { passive: true });
    function pintaVideo() {
      const veoSuyo = !!(video && remotoV && suCamara), veoMio = !!(video && camaraOn());
      $('#ll-videos').hidden = !(veoSuyo || veoMio || TILES.size > 0);
      $('#v-remoto').hidden = !veoSuyo; $('#v-local').hidden = !veoMio;
      const antes = caja.classList.contains('con-video');
      caja.classList.toggle('con-video', veoSuyo);
      if (veoSuyo && !antes) despierta(); else if (!veoSuyo) { caja.classList.remove('reposo'); clearTimeout(reposo); }
      caja.classList.toggle('solo-mia', !veoSuyo && veoMio);
      pintaBotonTam(); // al llegar su imagen, sale «Pantalla completa»
      const b = $('#ll-camara'); if (b) { const on = camaraOn(); b.setAttribute('aria-pressed', String(!on)); b.setAttribute('aria-label', on ? t('Apagar la cámara') : t('Encender la cámara')); }
    }
    function pintaImagenes() {
      for (const b of document.querySelectorAll('#ll-imagenes [data-imagen]')) b.setAttribute('aria-pressed', String(b.dataset.imagen === imagen));
      const n = $('#ll-imagen-nota'); if (n) n.hidden = imagen === 'natural';
      const l = $('#ll-luz'); if (l) l.setAttribute('aria-pressed', String(luz));
    }
    function pintaVoces() {
      for (const b of document.querySelectorAll('#ll-voces [data-voz]')) b.setAttribute('aria-pressed', String(b.dataset.voz === voz));
      const n = $('#ll-voz-nota'); if (n) n.hidden = voz === 'natural';
    }
    const di = (s, mal) => { paso.textContent = s; paso.classList.toggle('gc-fallo', !!mal); };
    // En el iPhone y el iPad, la llamada de voz suena por el altavoz: Safari no deja a una web elegir el auricular (dueño, 29 Oct 2026,
    // 09:13: «que avise en pantalla del iPhone una vez iniciada la conversación»). Con auriculares o AirPods, el teléfono los usa.
    const IOS = /iPhone|iPad|iPod/i.test(UA) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform || ''));
    function avisaSalida() {
      if (!IOS || video || salidas) return;
      di(t('Suena por el altavoz. Si conectas auriculares, suena por ellos.'));
      setTimeout(() => { if (estado === 'hablando' && paso.textContent === t('Suena por el altavoz. Si conectas auriculares, suena por ellos.')) di(''); }, 9000);
    }
    const mmss = (ms) => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

    function aplicaVoz() {
      if (!nodo || !ctx) return;
      const v = VOCES[voz] || VOCES.natural;
      nodo.parameters.get('proporcion').setValueAtTime(v.k, ctx.currentTime);
      nodo.parameters.get('robot').setValueAtTime(v.robot, ctx.currentTime);
    }
    function eligeVoz(v) {
      if (!VOCES[v]) return; voz = v;
      aplicaVoz(); pintaVoces();
      if (pc && mic && estado !== 'libre' && estado !== 'cerrando') cambiaEnvio();
    }
    // Altavoz o auricular (dueño, 28 Oct 2026, 17:26: «de móvil a móvil la llamada sale automáticamente en altavoz… configúralo»).
    // En el teléfono, la llamada de voz suena por el auricular, como una llamada normal, y la videollamada por el altavoz, como
    // FaceTime; el botón «Altavoz» lo cambia en cualquier momento. Solo donde el navegador deja elegir la salida (setSinkId; el
    // iPhone con iOS 26 enseña el altavoz y el auricular): si no, el botón no sale y suena como decida el teléfono. Con auriculares,
    // AirPods o el coche conectados, manda el teléfono. Al colgar, la salida vuelve a la de siempre (las notas de voz, por el altavoz).
    const TACTIL = !!(raiz.matchMedia && raiz.matchMedia('(pointer: coarse)').matches);
    const EXTERNA = /airpods|bluetooth|beats|head ?phone|head ?set|auriculares|cascos|casque|kopfh|cuffie|fones|carplay|airplay|usb|hdmi|\btv\b/i;
    const ES_ALTAVOZ = /speaker|altavoz|alto-?falante|haut-?parleur|lautsprecher|altoparlante|luidspreker|h[øö]gtalare|h[øo]jttaler|h[øo]yttaler|kaiutin|g[łl]o[śs]nik|reproduktor|hangsz[óo]r[óo]|difuzor|hoparl[öo]r|динамик|гучномовець|ηχείο|רמקול|مكبر|スピーカー|扬声器|揚聲器|스피커|ลำโพง|loa ngoài|pembesar suara/i;
    // El botón «Altavoz» se quitó el 28 Oct 2026 (21:49: «No funciona»; 21:50: «Déjalo solamente con videollamada»). Vuelve el 29 Oct
    // (13:06: «se me pone en altavoz directo, pero no hay tecla para cambiar de altavoz a normal»). En Safari (WebKit), elegir el
    // auricular como salida (setSinkId) quita la opción «altavoz por defecto» de la sesión de audio y pone el modo de voz; el botón
    // solo sale si el iPhone enseña las dos salidas (iOS 26). Si en su teléfono no cambia, se vuelve a apagar aquí.
    const ELIGE_SALIDA = true;
    // La videollamada, siempre por el altavoz y sin botón (dueño, 29 Oct 2026, 15:21: «en la videollamada tienes que quitar la opción
    // del altavoz y ya tiene que venir automáticamente en altavoz… la escucho muy flojito»). El auricular elegido en una llamada de voz
    // se quedaba como salida (WebKit lo recuerda) y la videollamada siguiente sonaba por el auricular, muy bajo: al empezar cada
    // videollamada y al colgar cualquier llamada, la salida vuelve a la de siempre (sinkId vacío: el altavoz del iPhone).
    // La llamada de voz, por el auricular desde el principio (dueño, 29 Oct 2026, 15:23: «sale en altavoz directamente… aunque lo cambie a
    // normal sigue en altavoz»). En el iPhone (WebKit), la salida elegida solo cuenta cuando arranca el audio de la llamada: se elige el
    // auricular de la llamada anterior ANTES de abrir el micrófono. La primera vez no se conoce: se aprende y vale desde la siguiente.
    async function auricularPrevio() {
      let id = null; try { id = localStorage.getItem('gcom-auricular'); } catch (_) {}
      if (!id || !TACTIL || !ELIGE_SALIDA) return;
      for (const el of [$('#a-remoto'), elRuta]) {
        try { if (el && typeof el.setSinkId === 'function' && el.sinkId !== id) await el.setSinkId(id); }
        catch (e) { if (e && e.name === 'NotFoundError') { try { localStorage.removeItem('gcom-auricular'); } catch (_) {} } return; }
      }
    }
    async function salidaDeSiempre() {
      for (const el of [$('#a-remoto'), elRuta]) { try { if (el && typeof el.setSinkId === 'function' && el.sinkId) await el.setSinkId(''); } catch (_) {} }
    }
    async function buscaSalidas() {
      salidas = null;
      if (!ELIGE_SALIDA || video) { if (video) await salidaDeSiempre(); return; }
      try {
        const ar = $('#a-remoto');
        if (!TACTIL || !ar || typeof ar.setSinkId !== 'function' || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        const ds = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audiooutput' && d.deviceId && d.deviceId !== 'default' && d.deviceId !== 'communications' && d.label);
        if (ds.some((d) => EXTERNA.test(d.label))) return;
        const alt = ds.filter((d) => ES_ALTAVOZ.test(d.label)), aur = ds.filter((d) => !ES_ALTAVOZ.test(d.label));
        if (alt.length === 1 && aur.length === 1) { salidas = { altavoz: alt[0].deviceId, auricular: aur[0].deviceId }; try { localStorage.setItem('gcom-auricular', salidas.auricular); } catch (_) {} }
      } catch (_) { salidas = null; }
    }
    // El botón no cambiaba nada y la llamada de voz empezaba en altavoz (dueño, 28 Oct 2026, 20:21 y 20:31: «Tienes que arreglarla,
    // si no… deberemos quitarla»). Leído en el código de Safari (WebKit): en el iPhone toda la página suena por una sola salida, la
    // que pide el último sonido que empieza a sonar. En las versiones sin el arreglo 318149@main de WebKit (29 Jul 2026, fallo 320087),
    // la mezcla de la llamada pide siempre «la de siempre», que es el altavoz, cada vez que arranca: al empezar la llamada y, con una
    // sola pista de voz, en cada cambio. Arreglo: unos silencios que piden la salida elegida y vuelven a empezar justo después de que
    // suene la otra persona y tras cada cambio, para ser siempre los últimos:
    //  · la segunda pista, muda, que manda la otra persona (agregaMuda): suena en el mismo <audio> que su voz;
    //  · un silencio propio (WebAudio, que no pasa por esa mezcla) en otro <audio> con la misma salida, por si la otra persona tiene
    //    una versión anterior sin pista muda.
    // Ninguno se oye. Cambiar la salida exige un toque: se hace dentro del toque de «Llamar», «Contestar» o «Altavoz» (o en los
    // 5 segundos siguientes). La salida elegida se queda para la próxima llamada; si no se puede aplicar, el botón dice la verdad.
    const elRuta = document.createElement('audio');
    elRuta.autoplay = true; elRuta.setAttribute('playsinline', ''); elRuta.setAttribute('aria-hidden', 'true'); elRuta.hidden = true;
    { const ar = $('#a-remoto'); if (ar && ar.parentNode) ar.parentNode.insertBefore(elRuta, ar.nextSibling); else document.body.appendChild(elRuta); }
    let mudasRemotas = []; // las pistas mudas que llegan de la otra persona
    // el silencio propio: solo con la llamada en marcha (con el micrófono abierto, el iPhone deja arrancar el audio sin un toque)
    function preparaRuta() {
      if (ruta || !salidas) return;
      try {
        const AC = raiz.AudioContext || raiz.webkitAudioContext; if (!AC) return;
        const c = new AC(), dst = c.createMediaStreamDestination();
        try { const f = c.createConstantSource(); f.offset.value = 0; f.connect(dst); f.start(); } catch (_) {}
        c.onstatechange = () => { if (ruta && ruta.ctx === c && c.state !== 'running' && c.state !== 'closed' && estado !== 'libre' && estado !== 'cerrando') c.resume().catch(() => {}); };
        if (c.state !== 'running') c.resume().catch(() => {});
        ruta = { ctx: c, flujo: dst.stream, pista: dst.stream.getAudioTracks()[0] || null };
      } catch (_) { quitaRuta(); }
    }
    // suena solo si va por la misma salida que la voz de la otra persona: si no, pediría otra y estorbaría
    function sincronizaRuta() {
      const ar = $('#a-remoto');
      const igual = !!(ruta && ruta.pista && ar && typeof elRuta.setSinkId === 'function' && (elRuta.sinkId || '') === (ar.sinkId || ''));
      if (!igual) { if (elRuta.srcObject) { elRuta.pause(); elRuta.srcObject = null; } return; }
      if (elRuta.srcObject !== ruta.flujo) elRuta.srcObject = ruta.flujo;
      if (elRuta.paused) reproduce(elRuta);
    }
    // «empiezan otra vez»: un momento apagados y vuelven, y así piden su salida los últimos
    function registraRuta() {
      if (!salidas || estado === 'libre' || estado === 'cerrando') return;
      const pistas = mudasRemotas.filter((p) => p.readyState === 'live');
      if (ruta && ruta.pista && elRuta.srcObject === ruta.flujo) {
        try { if (ruta.ctx.state !== 'running') ruta.ctx.resume().catch(() => {}); } catch (_) {}
        if (elRuta.paused) reproduce(elRuta);
        pistas.push(ruta.pista);
      }
      for (const p of pistas) { if (!p.enabled) continue; p.enabled = false; setTimeout(() => { p.enabled = true; }, 60); }
    }
    function refuerzaRuta() {
      for (const x of refuerzos) clearTimeout(x);
      refuerzos = [];
      if (!salidas) return;
      for (const ms of [80, 450, 1300, 3000]) refuerzos.push(setTimeout(registraRuta, ms));
    }
    function quitaRuta() {
      for (const x of refuerzos) clearTimeout(x);
      refuerzos = [];
      const r = ruta; ruta = null;
      try { elRuta.pause(); elRuta.srcObject = null; } catch (_) {}
      if (!r) return;
      try { if (r.pista) r.pista.stop(); } catch (_) {}
      try { r.ctx.close(); } catch (_) {}
    }
    // por dónde suena de verdad: sin salida elegida, por el altavoz
    const suenaAltavoz = () => { const s = ($('#a-remoto') || {}).sinkId || ''; return !(salidas && s && s === salidas.auricular); };
    async function aplicaSalida() {
      const ar = $('#a-remoto');
      if (ar && salidas && typeof ar.setSinkId === 'function') {
        const id = altavoz ? salidas.altavoz : salidas.auricular;
        // las dos a la vez, dentro del mismo toque (sin salida elegida ya suena por el altavoz: no hace falta pedirlo)
        const falta = (el) => { const a = el.sinkId || ''; return a !== id && !(a === '' && id === salidas.altavoz); };
        const cambios = [ar, elRuta].filter((el) => typeof el.setSinkId === 'function' && falta(el)).map((el) => el.setSinkId(id));
        try { await Promise.all(cambios); }
        catch (e) {
          // sin un toque reciente (el permiso del micrófono tardó, por ejemplo): sigue por donde iba y el botón lo dice; un toque lo cambia
          if (e && e.name === 'NotAllowedError') altavoz = suenaAltavoz();
          else { salidas = null; quitaRuta(); }
        }
        sincronizaRuta(); refuerzaRuta();
      }
      pintaAltavoz();
    }
    // al colgar o al conectar unos auriculares: fuera el botón y el silencio. La salida elegida se queda para la próxima llamada
    // (la de voz, por el auricular, sin depender de un toque); las notas de voz y el timbre no la usan.
    function restableceSalida() {
      salidas = null; pintaAltavoz(); quitaRuta(); salidaDeSiempre();
    }
    function pintaAltavoz() {
      const c = $('#ll-altavoz-caja'), b = $('#ll-altavoz'); if (!c || !b) return;
      c.hidden = !salidas;
      b.setAttribute('aria-pressed', String(!!altavoz));
      b.setAttribute('aria-label', altavoz ? t('Quitar el altavoz') : t('Poner el altavoz'));
    }
    // se conectan o se quitan unos auriculares en plena llamada: se vuelve a mirar. Al conectarlos ya no se vuelve a «la de siempre»
    // (dueño, 29 Oct 2026, 23:25: «momentos que me iba en altavoz, momentos sin altavoz; ella ha puesto el auricular, lo ha quitado»):
    // con el auricular elegido, el iPhone pasa solo a los auriculares y, al quitarlos, vuelve al auricular, como una llamada normal.
    // Antes se ponía «la de siempre» (el altavoz) al conectarlos y, al quitarlos, la llamada se quedaba en altavoz: cambiar la salida
    // exige un toque y en ese momento no lo hay. Ahora la salida elegida se queda y, al quitarlos, se lee de nuevo por dónde va.
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) navigator.mediaDevices.addEventListener('devicechange', async () => {
      if (estado === 'libre' || estado === 'cerrando' || !mic) return;
      const habia = !!salidas; await buscaSalidas();
      if (salidas) { if (!habia) altavoz = suenaAltavoz(); preparaRuta(); aplicaSalida(); }
      else if (habia) { pintaAltavoz(); quitaRuta(); }
    });
    // Micrófono → cambio de voz (AudioWorklet) → lo que se envía. Sin AudioWorklet, la voz va tal cual y se dice.
    // Cámara y micrófono en un solo permiso (en el iPhone, pedirlos por separado puede dejar mudo el primero); si la cámara
    // no se puede usar, la llamada sigue solo con voz.
    async function medios(conVideo) {
      // iPhone: la sesión de audio en «play-and-record» durante la llamada (al colgar vuelve a «auto», ver termina)
      try { if (navigator.audioSession) navigator.audioSession.type = 'play-and-record'; } catch (_) {}
      if (conVideo) {
        try { const s = await navigator.mediaDevices.getUserMedia({ audio: AUDIO, video: VIDEO }); mic = new MediaStream(s.getAudioTracks()); cam = new MediaStream(s.getVideoTracks()); }
        catch (_) { cam = null; }
        if (cam) { preparaCamara(); return microfono(); }
        o.aviso && o.aviso(t('Sin permiso para la cámara: la llamada sigue solo con voz.'));
      }
      return microfono();
    }
    // Con la voz natural, el micrófono va directo a la llamada, sin pasar por el audio del navegador (dueño, 28 Oct 2026, 17:27:
    // «por llamada normal de micro, ella me escuchaba… pero yo no la escuchaba a ella»). En el iPhone, el contexto de audio del
    // cambio de voz se podía quedar parado al pasar el teléfono a modo llamada y entonces se mandaba silencio. Solo se usa si se
    // elige otra voz, y se puede cambiar en plena llamada (se sustituye la pista que se envía, sin cortar).
    async function microfono() {
      if (!mic) mic = await navigator.mediaDevices.getUserMedia({ audio: AUDIO });
      envio = mic;
      if (voz !== 'natural') { const v = await cadenaVoz(); if (v) envio = v; }
      return envio;
    }
    async function cadenaVoz() {
      if (envioVoz && ctx && nodo) { if (ctx.state !== 'running') ctx.resume().catch(() => {}); return envioVoz; }
      try {
        // a 48 kHz, como Opus: sin pasos de remuestreo de más (si el navegador no lo admite, a su frecuencia)
        const AC = raiz.AudioContext || raiz.webkitAudioContext;
        try { ctx = new AC({ latencyHint: 'interactive', sampleRate: 48000 }); } catch (_) { ctx = new AC({ latencyHint: 'interactive' }); }
        const c = ctx;
        // si el teléfono lo para (otra app, una llamada de verdad, el cambio a modo llamada), se vuelve a arrancar
        c.onstatechange = () => { if (ctx === c && c.state !== 'running' && c.state !== 'closed' && estado !== 'libre') c.resume().catch(() => {}); };
        await c.audioWorklet.addModule(VOZ_JS);
        const src = c.createMediaStreamSource(mic);
        nodo = new AudioWorkletNode(c, 'guardiana-voz', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
        const dst = c.createMediaStreamDestination();
        src.connect(nodo).connect(dst);
        aplicaVoz();
        // sin esperar para siempre: en el iPhone, fuera de un toque, resume() puede no contestar nunca
        if (c.state !== 'running') await Promise.race([c.resume().catch(() => {}), new Promise((r) => setTimeout(r, 1500))]);
        envioVoz = dst.stream;
        return envioVoz;
      } catch (_) {
        nodo = null; envioVoz = null; if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
        o.aviso && o.aviso(t('Este navegador no permite cambiar la voz: la llamada sigue con tu voz natural.'));
        return null;
      }
    }
    // en plena llamada: la voz elegida pasa a ser lo que se envía (la natural, el micrófono tal cual)
    async function cambiaEnvio() {
      if (!pc || !mic) return;
      let nueva = mic;
      if (voz !== 'natural') { const v = await cadenaVoz(); if (v) nueva = v; }
      if (!pc) return;
      envio = nueva;
      const pista = nueva.getAudioTracks()[0]; if (!pista) return;
      const callado = $('#ll-silenciar').getAttribute('aria-pressed') === 'true';
      pista.enabled = !callado;
      const s = pc.getSenders().find((x) => x.track && x.track.kind === 'audio' && x.track !== muda);
      if (s && s.track !== pista) { try { await s.replaceTrack(pista); } catch (_) {} }
    }
    // El botón «Altavoz» no cambiaba nada en el iPhone (dueño, 28 Oct 2026, 19:21: «me salía otra vez en altavoz. Y cuando le doy
    // altavoz, sigue en altavoz»). Es un fallo de Safari en iOS 26 (WebKit 320087, que Apple arregla en versiones posteriores):
    // elegir el auricular o el altavoz (setSinkId) dice que sí, pero el sonido sigue por donde iba si la llamada trae una sola pista
    // de audio; con dos, cambia de verdad. Así que cada lado manda, además de su voz, una segunda pista de audio muda: una copia
    // del micrófono, apagada (el navegador manda silencio, unos pocos kb/s). En su propio flujo, para no tocar la sincronía de la
    // voz con la imagen. Si la otra persona tiene una versión anterior, la llamada funciona igual.
    // (20:21 y 20:31: no bastaba. Solo ayuda si los dos la mandan y no cambia el arranque de la llamada; lo que lo arregla es el
    // silencio de preparaRuta. Se deja: no estorba y, con ella, el cambio es inmediato.)
    function agregaMuda() {
      muda = null;
      try { const a = mic && mic.getAudioTracks()[0]; if (!a || !pc) return; const m = a.clone(); m.enabled = false; pc.addTrack(m, new MediaStream([m])); muda = m; } catch (_) { muda = null; }
    }
    // Cámara: la de mayor resolución que dé el equipo, hasta 1080p a 30 imágenes por segundo, y el codificador avisado de
    // que importa el detalle de la imagen.
    function preparaCamara() {
      for (const x of cam.getVideoTracks()) {
        try { x.contentHint = 'motion'; } catch (_) {}
        // exposición, balance de blancos y enfoque automáticos, si la cámara los admite
        try {
          const cap = x.getCapabilities ? x.getCapabilities() : {}, adv = [];
          for (const k of ['exposureMode', 'whiteBalanceMode', 'focusMode']) if ((cap[k] || []).includes('continuous')) adv.push({ [k]: 'continuous' });
          if (adv.length) x.applyConstraints({ advanced: adv }).catch(() => {});
        } catch (_) {}
      }
      vCam = document.createElement('video'); vCam.muted = true; vCam.playsInline = true; vCam.setAttribute('playsinline', ''); vCam.setAttribute('aria-hidden', 'true');
      vCam.style.cssText = 'position:fixed;left:0;top:0;width:4px;height:4px;opacity:0;pointer-events:none;z-index:-1';
      document.body.append(vCam); vCam.srcObject = new MediaStream(cam.getVideoTracks()); reproduce(vCam);
      arrancaMedidor();
    }
    // Cada 0,8 s, la luz media de la cámara (en una copia de 32 × 18 puntos, aquí): si falta, se sube el brillo poco a
    // poco hasta que la imagen se ve bien, con un máximo; si sobra, se vuelve a la cámara tal cual.
    function arrancaMedidor() {
      clearInterval(medidor);
      const c = document.createElement('canvas'); c.width = 32; c.height = 18; const g = c.getContext('2d', { willReadFrequently: true });
      medidor = setInterval(() => {
        if (!vCam || vCam.readyState < 2) return;
        let y = 0.5;
        try { g.drawImage(vCam, 0, 0, 32, 18); const d = g.getImageData(0, 0, 32, 18).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; y = s / (d.length / 4) / 255; } catch (_) { return; }
        if (LUZ_PRUEBA) y = 0.25;
        const oscura = y >= LUZ_NEGRA && (y < LUZ_OSCURA || (ganancia > 1.01 && y < LUZ_META));
        const quiere = FILTRO_OK && luz && oscura && blindada() ? Math.min(LUZ_MAX, Math.max(1, LUZ_META / Math.max(y, 0.05))) : 1;
        ganancia += (quiere - ganancia) * 0.4; if (Math.abs(ganancia - 1) < 0.02) ganancia = 1;
        aplicaImagen(); // solo cambia la pista si hace falta (y la aclarada, cuando ya tiene imágenes)
      }, 800);
    }
    const filtroLuz = () => (ganancia > 1.001 ? 'brightness(' + ganancia.toFixed(3) + ') contrast(1.05) saturate(1.06)' : 'none');
    // La imagen procesada en un lienzo. «protegida»: la cámara pasa por un lienzo diminuto (32 × 18 o 24 × 14 puntos) y
    // se amplía a 640 de ancho. «aclarada»: la cámara tal cual (hasta 1280 de ancho) con más brillo. Las dos, con el
    // brillo de «Mejorar la luz» si hace falta.
    function lienzo(modo) {
      const crudo = cam.getVideoTracks()[0], s = crudo.getSettings ? crudo.getSettings() : {};
      const sw = s.width || 1280, sh = s.height || 720;
      const W = modo === 'protegida' ? SALIDA_W : Math.min(1280, sw), H = Math.round(W * sh / sw);
      const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d', { alpha: false });
      const p = document.createElement('canvas'), gp = p.getContext('2d', { alpha: false });
      let vivo = true;
      const r = { modo, track: null, listo: false, parar() { vivo = false; clearInterval(reloj); try { salida.stop(); } catch (_) {} } };
      const dibuja = () => {
        if (!vivo || !vCam || vCam.readyState < 2 || !vCam.videoWidth) return;
        r.listo = true;
        if (modo === 'protegida') {
          const m = IMAGENES[imagen] || IMAGENES.mosaico, pw = m.w, ph = Math.max(1, Math.round(m.w * H / W));
          if (p.width !== pw || p.height !== ph) { p.width = pw; p.height = ph; }
          gp.filter = filtroLuz(); gp.imageSmoothingEnabled = true; gp.imageSmoothingQuality = 'high'; gp.drawImage(vCam, 0, 0, pw, ph); // aquí se pierde el detalle
          g.imageSmoothingEnabled = m.suave; g.imageSmoothingQuality = 'high'; g.drawImage(p, 0, 0, W, H);
        } else {
          g.filter = filtroLuz(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(vCam, 0, 0, W, H);
        }
      };
      g.fillStyle = '#06080C'; g.fillRect(0, 0, W, H); // hasta la primera imagen, negro: nunca la cámara tal cual
      const reloj = setInterval(dibuja, 1000 / 30);
      const salida = c.captureStream(30).getVideoTracks()[0];
      try { salida.contentHint = 'motion'; } catch (_) {}
      r.track = salida; return r;
    }
    // la pista de imagen que sale: protegida («Tu imagen»), aclarada (poca luz) o la cámara tal cual
    const modoImagen = () => (!blindada() ? 'cruda' : imagen !== 'natural' ? 'protegida' : ganancia > 1.001 ? 'aclarada' : 'cruda');
    function pistaImagen() {
      if (!cam) return null;
      const m = modoImagen();
      if (m === 'cruda') return cam.getVideoTracks()[0] || null;
      if (!proc || proc.modo !== m) { const viejo = proc; proc = lienzo(m); if (viejo) setTimeout(() => viejo.parar(), 400); }
      // la aclarada solo sale cuando ya tiene imágenes; hasta entonces, la cámara tal cual (nunca negro por un fallo)
      if (m === 'aclarada' && !proc.listo) return cam.getVideoTracks()[0] || null;
      return proc.track;
    }
    async function aplicaImagen() {
      if (!cam) return;
      const salida = pistaImagen(); if (!salida) return;
      const s = pc && pc.getSenders().find((x) => x.track && x.track.kind === 'video');
      if (s && s.track !== salida) { try { await s.replaceTrack(salida); } catch (_) {} }
      for (const L of patas) if (L.miCam && L.miCam.track !== salida) { try { await L.miCam.replaceTrack(salida); } catch (_) {} }
      if (modoImagen() === 'cruda' && proc) { const viejo = proc; proc = null; setTimeout(() => viejo.parar(), 400); }
      const vl = $('#v-local'); if (!vl.srcObject || vl.srcObject.getVideoTracks()[0] !== salida) { vl.srcObject = new MediaStream([salida]); reproduce(vl); } // te ves como te ve la otra persona
    }
    function eligeLuz() {
      luz = !luz; try { localStorage.setItem('gcom-luz', luz ? '1' : '0'); } catch (_) {}
      if (!luz) { ganancia = 1; aplicaImagen(); }
      pintaImagenes();
    }
    // En la sesión blindada, cada llamada empieza con la voz grave y, con imagen, el mosaico (dueño, 29 Oct 2026, 09:23: «el modo
    // blindado ya por defecto quiero que salga con la opción de mosaico y la voz cambiada, que luego la persona la pueda cambiar»):
    // la cara y la voz se protegen desde el primer fotograma, antes de que salga nada del equipo. Se quitan con sus dos botones.
    function efectosPorDefecto() {
      if (!blindada()) { voz = 'natural'; imagen = 'natural'; return; }
      voz = 'grave'; imagen = video ? 'mosaico' : 'natural';
    }
    function eligeImagen(m) {
      if (!(m in IMAGENES)) return; imagen = m;
      aplicaImagen(); pintaImagenes();
    }
    // el audio (con el cambio de voz) y la imagen, en el mismo flujo para que vayan sincronizados
    function agregaPistas() {
      const pi = pistaImagen(); if (pi) { const vl = $('#v-local'); vl.srcObject = new MediaStream([pi]); reproduce(vl); }
      const flujo = new MediaStream(envio.getAudioTracks().concat(pi ? [pi] : []));
      flujo.getTracks().forEach((x) => pc.addTrack(x, flujo));
      if (video && !cam) { try { pc.addTransceiver('video', { direction: 'recvonly' }); } catch (_) {} } // sin cámara propia, pero sí la imagen de la otra persona
      agregaMuda();
    }
    // Códecs de imagen por orden de calidad para el mismo caudal: VP9, H.264, VP8 y AV1 (este, el último: exige mucho al procesador)
    function prefiereCodecs(perfil, vp8, p, solo) { // vp8: VP8 el primero (entre sistemas distintos o con Android); p: otra conexión; solo: un transceptor
      try {
        const caps = raiz.RTCRtpReceiver && RTCRtpReceiver.getCapabilities && RTCRtpReceiver.getCapabilities('video'); if (!caps || !caps.codecs) return;
        // solo códecs que este equipo sabe también enviar (algunos Android reciben H.264 pero no lo codifican)
        const env = raiz.RTCRtpSender && RTCRtpSender.getCapabilities && RTCRtpSender.getCapabilities('video');
        const tipo = (c) => String(c.mimeType).toLowerCase(), auxiliar = /\/(rtx|red|ulpfec|flexfec)$/i;
        const envia = env && env.codecs ? new Set(env.codecs.map(tipo)) : null;
        if (envia) { const f = caps.codecs.filter((c) => auxiliar.test(c.mimeType) || envia.has(tipo(c))); if (f.some((c) => !auxiliar.test(c.mimeType))) caps.codecs = f; }
        const pesos = perfil === 'escritorio' ? { 'video/vp9': 0, 'video/h264': 1, 'video/vp8': 2, 'video/av1': 3 } : vp8 ? { 'video/vp8': 0, 'video/h264': 1, 'video/vp9': 2, 'video/av1': 3 } : { 'video/h264': 0, 'video/vp8': 1, 'video/vp9': 2, 'video/av1': 3 };
        // Entre teléfonos, primero el H.264 «constrained baseline» (42e0…, packetization-mode=1), el que todo WebRTC sabe codificar y
        // decodificar; después VP8; los demás perfiles de H.264 (High, Main), después. Dueño, 29 Oct 2026, 13:09: del iPhone al
        // Android la imagen llegaba en negro (el iPhone ofrecía primero H.264 High, que ese Android no decodifica); al revés sí.
        const perfilH264 = (c) => { const m = /profile-level-id=([0-9a-f]{6})/i.exec(c.sdpFmtpLine || ''); return m ? m[1].toLowerCase() : ''; };
        const peso = (c) => {
          const t = tipo(c), base = pesos[t] ?? 4;
          if (perfil === 'escritorio' || t !== 'video/h264' || vp8) return base * 10;
          const pl = perfilH264(c), pm1 = /packetization-mode=1/i.test(c.sdpFmtpLine || '');
          return /^42e0/.test(pl) && pm1 ? 0 : /^42/.test(pl) ? 1 : 10 * pesos['video/vp8'] + 5; // los otros perfiles, detrás de VP8
        };
        const orden = caps.codecs.slice().sort((a, b) => peso(a) - peso(b));
        for (const tr of (solo ? [solo] : (p || pc).getTransceivers())) { const k = (tr.sender.track && tr.sender.track.kind) || (tr.receiver.track && tr.receiver.track.kind); if (k === 'video' && tr.setCodecPreferences) tr.setCodecPreferences(orden); }
      } catch (_) {}
    }
    // Opus a 48 kHz, mono, hasta 96 kb/s (antes, unos 32), con corrección de errores (FEC) para los paquetes que se pierden y
    // sin cortes en los silencios (DTX). Cada lado lo pide en su descripción, así vale para los dos sentidos.
    // Imagen nítida desde el primer segundo (dueño, 28 Oct 2026, 15:52: «la máxima calidad… que no se note diferencia con WhatsApp o
    // FaceTime»): Chrome y Android empiezan la imagen a unos 300 kb/s y suben poco a poco; aquí arrancan a 1,5 Mb/s y el control de
    // congestión baja si la red no da. Safari ignora esta indicación.
    function arranqueVideo(sdp) {
      try {
        const pts = [...String(sdp).matchAll(/a=rtpmap:(\d+) (H264|VP8|VP9|AV1)\/90000/gi)].map((m) => m[1]);
        for (const pt of pts) {
          const re = new RegExp('a=fmtp:' + pt + ' ([^\\r\\n]*)');
          if (re.test(sdp)) sdp = sdp.replace(re, (l, ps) => (/x-google-start-bitrate/.test(ps) ? l : l + ';x-google-start-bitrate=1500'));
          else sdp = sdp.replace(new RegExp('(a=rtpmap:' + pt + ' [^\\r\\n]*)'), '$1\r\na=fmtp:' + pt + ' x-google-start-bitrate=1500');
        }
      } catch (_) {}
      return sdp;
    }
    function altaFidelidad(sdp) { return arranqueVideo(altaFidelidadAudio(sdp)); }
    function altaFidelidadAudio(sdp) {
      const r = /a=rtpmap:(\d+) opus\/48000\/2/i.exec(sdp || ''); if (!r) return sdp;
      const pt = r[1], quiero = { maxaveragebitrate: String(MAX_BPS_AUDIO), useinbandfec: '1', usedtx: '0', stereo: '0', 'sprop-stereo': '0', maxplaybackrate: '48000', 'sprop-maxcapturerate': '48000' };
      const linea = (o) => 'a=fmtp:' + pt + ' ' + Object.entries(o).map(([k, v]) => k + '=' + v).join(';');
      const re = new RegExp('a=fmtp:' + pt + ' ([^\\r\\n]*)');
      if (re.test(sdp)) return sdp.replace(re, (_, ps) => { const o = {}; for (const kv of ps.split(';')) { const i = kv.indexOf('='); const k = (i < 0 ? kv : kv.slice(0, i)).trim(); if (k) o[k] = i < 0 ? '' : kv.slice(i + 1).trim(); } return linea(Object.assign(o, quiero)); });
      return sdp.replace(r[0], r[0] + '\r\n' + linea(quiero));
    }
    // y el audio va por delante de la imagen cuando la red se aprieta
    async function topeAudio() {
      if (!pc) return;
      for (const s of pc.getSenders()) {
        if (!s.track || s.track.kind !== 'audio') continue;
        try { const p = s.getParameters(); if (!p.encodings || !p.encodings.length) p.encodings = [{}]; p.encodings[0].maxBitrate = MAX_BPS_AUDIO; p.encodings[0].priority = 'high'; p.encodings[0].networkPriority = 'high'; await s.setParameters(p); } catch (_) {}
      }
    }
    async function topeVideo() {
      if (!pc) return;
      for (const s of pc.getSenders()) {
        if (!s.track || s.track.kind !== 'video') continue;
        try {
          const p = s.getParameters(); if (!p.encodings || !p.encodings.length) p.encodings = [{}];
          p.encodings[0].maxBitrate = MAX_BPS_VIDEO; p.encodings[0].maxFramerate = 30; p.encodings[0].scaleResolutionDownBy = 1;
          p.degradationPreference = 'maintain-framerate';
          await s.setParameters(p);
        } catch (_) {}
      }
    }
    function nuevaPc() {
      const ice = o.ice() || [];
      const tieneTurn = ice.some((s) => [].concat(s.urls).some((u) => /^turns?:/.test(u)));
      // fuera de las pruebas locales, solo por el relé: sin TURN la llamada no conecta, nunca va directa (las IP quedarían a la vista)
      pc = new RTCPeerConnection({ iceServers: ice, iceTransportPolicy: (tieneTurn || !LOCAL) ? 'relay' : 'all', bundlePolicy: 'max-bundle', rtcpMuxPolicy: 'require' });
      const remoto = new MediaStream(); mudasRemotas = [];
      pc.ontrack = (e) => {
        // llamada a tres: una segunda imagen que llega por la misma llamada es la de la tercera persona (la trae el puente)
        if (e.track.kind === 'video') {
          const vids = pc ? pc.getTransceivers().filter((x) => x.receiver && x.receiver.track && x.receiver.track.kind === 'video') : [];
          if (vids.length > 1 && e.transceiver && vids[0] !== e.transceiver) { const K = tramoPrincipal(), avisa = () => { pintaGrupo(); reenviaImagenes(); }; K.videos.set(e.transceiver.mid || ('v' + K.videos.size), { pista: e.track }); e.track.onunmute = avisa; e.track.onmute = avisa; e.track.onended = avisa; avisa(); return; }
        }
        if (e.track.kind === 'audio' && !remoto.getAudioTracks().length) vozSuya = e.track;
        if (e.track.kind === 'video') { remotoV = new MediaStream([e.track]); setTimeout(() => reenviaImagenes(), 0); const vr = $('#v-remoto'); vr.srcObject = remotoV; reproduce(vr); e.track.onunmute = () => { reproduce(vr); pintaVideo(); }; pintaVideo(); return; }
        if (remoto.getAudioTracks().length) mudasRemotas.push(e.track); // la primera es su voz; las demás, su pista muda
        remoto.addTrack(e.track); const ar = $('#a-remoto'); if (ar.srcObject !== remoto) ar.srcObject = remoto; suenaRemoto();
        if (salidas) aplicaSalida();
        e.track.onunmute = () => { suenaRemoto(); refuerzaRuta(); };
      };
      pc.onicecandidate = (e) => { if (e.candidate) o.manda({ acto: 'ice', id: idLlamada, cand: e.candidate.toJSON() }); };
      alEstadoPc = () => {
        if (!pc) return;
        if (pc.connectionState === 'connected') { paraTono(); refuerzaRuta(); recuperada(); if (estado !== 'hablando') { estado = 'hablando'; iniciada = Date.now(); di(''); avisaSalida(); clearInterval(reloj); reloj = setInterval(() => { tiempo.textContent = mmss(Date.now() - iniciada); }, 500); mideCalidad(); topeAudio(); if (video) topeVideo(); pinta(); suenaRemoto(); sasCalcula(); pintaSas(); pideWake(); } }
        else if (pc.connectionState === 'failed') { di(t('Conexión interrumpida, intentando recuperarla…'), true); reconecta('fallo'); }
        else if (pc.connectionState === 'disconnected') { di(t('Conexión interrumpida, intentando recuperarla…'), true); reconecta('corte'); }
      };
      alIcePc = () => { if (pc && pc.iceConnectionState === 'failed') reconecta('fallo'); };
      // quien llamó manda la oferta nueva al reiniciar la conexión (la otra persona se lo pide con «reinicia»)
      alNegociarPc = async () => {
        if (!pc || !inicioYo || estado !== 'hablando' || !reiniciando) return;
        try { const of = await pc.createOffer({ iceRestart: true }); await pc.setLocalDescription({ type: of.type, sdp: altaFidelidad(of.sdp) }); o.manda({ acto: 'reoferta', id: idLlamada, sdp: pc.localDescription.sdp }); } catch (_) {}
      };
      pc.onconnectionstatechange = alEstadoPc; pc.oniceconnectionstatechange = alIcePc; pc.onnegotiationneeded = alNegociarPc;
    }
    // La llamada no se cae al cambiar de wifi a datos ni en un corte corto (dueño, 29 Oct 2026, 09:18: «para que se estabilice, pero no
    // cuelgue la llamada»): se reinicia la negociación de la ruta (ICE) sin tocar el audio ni el vídeo. Quien llamó hace la oferta
    // nueva; quien contestó se la pide. Solo si en 20 segundos no vuelve, la llamada termina.
    let reiniciando = false, reinicioT = null, reinicioFin = null, ultimoReinicio = 0;
    function reconecta(por) {
      if (!pc || estado !== 'hablando') return;
      if (!reinicioFin) reinicioFin = setTimeout(() => { reinicioFin = null; if (pc && estado === 'hablando' && pc.connectionState !== 'connected') termina('fallo'); }, 30000); // 30 s intentándolo
      // en un corte, un par de segundos por si la red vuelve sola; en un fallo, ya
      clearTimeout(reinicioT);
      reinicioT = setTimeout(() => reiniciaIce(), por === 'fallo' ? 0 : 2500);
    }
    function reiniciaIce() {
      if (!pc || estado !== 'hablando' || pc.connectionState === 'connected') return; // ya volvió sola
      if (Date.now() - ultimoReinicio < 3000) return; // no más de uno cada 3 s
      ultimoReinicio = Date.now();
      if (inicioYo) { reiniciando = true; try { pc.restartIce(); } catch (_) { reiniciando = false; } }
      else o.manda({ acto: 'reinicia', id: idLlamada });
    }
    // Con imagen, la pantalla no se apaga sola mientras dura la videollamada (Screen Wake Lock); al volver a la app se pide otra vez
    let wake = null;
    async function pideWake() { try { if (!video || estado !== 'hablando' || wake || !navigator.wakeLock) return; wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } catch (_) { wake = null; } }
    function sueltaWake() { try { if (wake) wake.release(); } catch (_) {} wake = null; }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pideWake(); });
    function recuperada() { reiniciando = false; clearTimeout(reinicioT); reinicioT = null; clearTimeout(reinicioFin); reinicioFin = null; if (paso.textContent === t('Conexión interrumpida, intentando recuperarla…')) di(''); }
    // al volver la red o cambiar de wifi a datos, la ruta se renegocia enseguida
    addEventListener('online', () => { if (estado === 'hablando') reconecta('fallo'); });
    try { if (navigator.connection && navigator.connection.addEventListener) navigator.connection.addEventListener('change', () => { if (estado === 'hablando' && pc && pc.connectionState !== 'connected') reconecta('fallo'); }); } catch (_) {}
    // «H.264 42e01f», «VP8»… a partir de la entrada codec de las estadísticas
    const codecCorto = (c) => { if (!c || !c.mimeType) return ''; const m = String(c.mimeType).replace(/^video\//i, '').toUpperCase().replace('H264', 'H.264'); const pl = /profile-level-id=([0-9a-f]{6})/i.exec(c.sdpFmtpLine || ''); return m + (pl ? ' ' + pl[1].toLowerCase() : ''); };
    // calidad estimada cada 2 s (ida y vuelta y pérdidas del audio que llega)
    function mideCalidad() {
      clearInterval(sondeo);
      sondeo = setInterval(async () => {
        if (!pc || estado !== 'hablando') return;
        try {
          let rtt = null, perd = 0, rec = 0, vw = 0, vh = 0, fps = 0;
          const st = await pc.getStats(), diag = {};
          st.forEach((r) => {
            if (r.type === 'candidate-pair' && r.nominated && r.state === 'succeeded') { diag.salidaBps = r.availableOutgoingBitrate; const lc = st.get(r.localCandidateId); if (lc) diag.ruta = (lc.candidateType || '') + '/' + (lc.relayProtocol || lc.protocol || ''); }
            if (r.type === 'outbound-rtp' && r.kind === 'video') { diag.envia = (r.frameWidth || 0) + 'x' + (r.frameHeight || 0) + '@' + Math.round(r.framesPerSecond || 0); diag.limite = r.qualityLimitationReason; diag.codec = codecCorto(st.get(r.codecId)); }
            if (r.type === 'inbound-rtp' && r.kind === 'video') { diag.recibe = (r.frameWidth || 0) + 'x' + (r.frameHeight || 0) + '@' + Math.round(r.framesPerSecond || 0); diag.codecRecibe = codecCorto(st.get(r.codecId)); diag.llegan = r.framesDecoded || 0; }
          });
          diag.luz = Math.round(ganancia * 100) / 100; diag.modo = modoImagen();
          calidad.dataset.diag = JSON.stringify(diag);
          st.forEach((r) => { if (r.type === 'candidate-pair' && r.state === 'succeeded' && r.currentRoundTripTime != null) rtt = Math.round(r.currentRoundTripTime * 1000); if (r.type === 'inbound-rtp' && r.kind === 'audio') { perd += r.packetsLost || 0; rec += r.packetsReceived || 0; } if (r.type === 'inbound-rtp' && r.kind === 'video') { vw = r.frameWidth || vw; vh = r.frameHeight || vh; fps = r.framesPerSecond || fps; } });
          const p = rec + perd ? perd / (rec + perd) : 0, nivel = p < 0.01 && (rtt == null || rtt < 250) ? t('excelente') : p < 0.05 ? t('buena') : t('débil');
          // con imagen, la resolución y las imágenes por segundo que llegan de verdad
          // si la imagen de la otra persona no llega, se dice (antes, en el teléfono, solo se veía su inicial o negro)
          const vr = $('#v-remoto'), NO_LLEGA = t('La imagen de la otra persona no llega.');
          if (video && suCamara && iniciada && Date.now() - iniciada > 8000 && !(vr && vr.videoWidth)) di(NO_LLEGA, true); else if (paso.textContent === NO_LLEGA) di('');
          // agencia, ronda 74: en la pantalla, solo «Conexión: excelente» con un punto de color; los milisegundos, la resolución y
          // las imágenes por segundo, al tocarlo (o al pasar el ratón), para quien quiera verlos
          const serv = o.servidor ? o.servidor() : '';
          // con imagen, al tocar el indicador se ve también qué formato va y viene (dueño, 29 Oct 2026, 13:09 y 14:13: del iPhone al Android, imagen en negro)
          const largo = t('Calidad estimada') + ': ' + nivel + (rtt != null ? ' · ' + rtt + ' ms' : '') + (video && vw && suCamara ? ' · ' + t('imagen') + ' ' + vw + '×' + vh + (fps ? ' · ' + Math.round(fps) + ' fps' : '') : '') + (video ? ' · ' + t('envío') + ' ' + (diag.envia || '–') + (diag.codec ? ' ' + diag.codec : '') + ' · ' + t('recibo') + ' ' + (diag.recibe || '–') + (diag.codecRecibe ? ' ' + diag.codecRecibe : '') : '') + (serv ? ' · ' + t('servidor de llamadas') + ': ' + serv : '');
          calidad.dataset.nivel = p < 0.01 && (rtt == null || rtt < 250) ? 'alta' : p < 0.05 ? 'media' : 'baja';
          const corto = t('Conexión') + ': ' + nivel;
          calidad.dataset.largo = largo; calidad.dataset.corto = corto; calidad.title = largo;
          calidad.textContent = calidad.classList.contains('ver') ? largo : corto;
        } catch (_) {}
      }, 2000);
    }
    // dentro del toque de la persona (llamar o contestar): el iPhone deja después arrancar el sonido y la imagen solos
    function desbloquea() { for (const id of ['#a-remoto', '#v-remoto']) { const el = $(id); if (el) reproduce(el); } reproduce(elRuta); }
    // El sonido de la otra persona: si el teléfono no lo deja arrancar solo, se dice y arranca con el siguiente toque
    // (antes el fallo era silencioso: la llamada seguía y no se oía nada).
    const TOCA = () => t('Toca la pantalla para oír a la otra persona.');
    function suenaRemoto() {
      const ar = $('#a-remoto'); if (!ar || !ar.srcObject) return;
      let p; try { p = ar.play(); } catch (_) { return; }
      if (p && p.then) p.then(() => { if (paso.textContent === TOCA()) di(''); }).catch(() => { if (estado === 'hablando' || estado === 'conectando') di(TOCA(), true); });
    }
    const b64u = (b) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const deB64u = (t) => { const x = atob(String(t).replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(x.length); for (let i = 0; i < x.length; i++) u[i] = x.charCodeAt(i); return u; };
    const sha256 = async (b) => new Uint8Array(await crypto.subtle.digest('SHA-256', b));
    const huellaDtls = (sdp) => { const m = /a=fingerprint:sha-256 ([0-9A-Fa-f:]+)/.exec(sdp || ''); return m ? m[1].toUpperCase() : ''; };
    async function sasNuevo() {
      try {
        const k = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
        const pub = new Uint8Array(await crypto.subtle.exportKey('raw', k.publicKey));
        sas = { clave: k, pub, compromiso: await sha256(pub), suCompromiso: null, suPub: null, numero: '', estado: 'pendiente' };
      } catch (_) { sas = null; }
    }
    // el número: 4 cifras de SHA-256(secreto compartido ‖ compromiso ‖ huella DTLS de quien llama ‖ huella DTLS de quien contesta)
    async function sasCalcula() {
      if (!sas || sas.numero || !sas.suPub || !pc || !pc.localDescription || !pc.remoteDescription) return;
      try {
        const suya = await crypto.subtle.importKey('raw', sas.suPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
        const secreto = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: suya }, sas.clave.privateKey, 256));
        const fl = huellaDtls(pc.localDescription.sdp), fr = huellaDtls(pc.remoteDescription.sdp);
        const comp = inicioYo ? sas.compromiso : sas.suCompromiso;
        const texto = new TextEncoder().encode('GUARDIANA SAS v1\0' + (inicioYo ? fl + '\0' + fr : fr + '\0' + fl));
        const todo = new Uint8Array(16 + secreto.length + comp.length + texto.length); todo.set(new TextEncoder().encode('GUARDIANA SAS v1'), 0); todo.set(secreto, 16); todo.set(comp, 16 + secreto.length); todo.set(texto, 16 + secreto.length + comp.length);
        const h = await sha256(todo), n = ((h[0] << 24 | h[1] << 16 | h[2] << 8 | h[3]) >>> 0) % 10000;
        sas.numero = String(n).padStart(4, '0');
      } catch (_) { sas.estado = 'roto'; }
      pintaSas();
    }
    function pintaSas() {
      const caja2 = $('#ll-sas'), mini = $('#ll-sas-mini'); if (!caja2 || !mini) return;
      // el número solo se enseña donde toca (app.js, o.sas: blindado y Ultra; dueño, 29 Oct 2026, 12:55: «en el modo normal no»)
      const hay = !!(sas && (sas.numero || sas.estado === 'roto') && estado === 'hablando' && (!o.sas || o.sas()));
      const grande = hay && sas.estado === 'pendiente' && !caja.classList.contains('sas-plegado');
      caja2.hidden = !grande; mini.hidden = !(hay && !grande); caja.classList.toggle('sas-grande', grande);
      if (!hay) { caja.classList.remove('sas-plegado'); clearTimeout(sasPlegadoT); return; }
      const num = sas.numero ? sas.numero.slice(0, 2) + ' ' + sas.numero.slice(2) : '— —';
      $('#ll-sas-num').textContent = num; $('#ll-sas-num').setAttribute('aria-label', t('Número de seguridad') + ': ' + num);
      $('#ll-sas-texto').textContent = sas.estado === 'roto' ? t('No se pudo calcular el número de seguridad de esta llamada: no hables de nada delicado y vuelve a llamar.') : t('La otra persona debe ver este mismo número en su pantalla. Decidlo en voz alta: si no coincide, hay alguien en medio.');
      $('#ll-sas-si').hidden = sas.estado === 'roto';
      mini.textContent = (sas.estado === 'coinciden' ? '✓ ' : sas.estado === 'roto' ? '! ' : '') + num;
      mini.classList.toggle('bien', sas.estado === 'coinciden'); mini.classList.toggle('mal', sas.estado === 'roto');
      mini.setAttribute('aria-label', t('Número de seguridad') + ': ' + num + (sas.estado === 'coinciden' ? ' · ' + t('coinciden') : ''));
      // en grande 40 s; si nadie toca, se pliega a la píldora de arriba (se vuelve a abrir tocándola)
      clearTimeout(sasPlegadoT); if (grande) sasPlegadoT = setTimeout(() => { caja.classList.add('sas-plegado'); pintaSas(); }, 40000);
    }
    function sasCoinciden() { if (!sas || sas.estado !== 'pendiente') return; sas.estado = 'coinciden'; caja.classList.add('sas-plegado'); pintaSas(); if (o.sasOk) { try { o.sasOk(); } catch (_) {} } }
    function sasNoCoinciden() { if (!sas || sas.estado !== 'pendiente') return; sas.estado = 'no'; pintaSas(); const f = o.sasMal; colgar(); if (f) { try { f(); } catch (_) {} } }
    async function llamar(conVideo) {
      if (ocupado()) return;
      if (!o.puede()) { o.aviso && o.aviso(t('Para llamar, la otra persona tiene que estar conectada y la sesión, verificada.')); return; }
      if (!(o.ice() || []).length && !LOCAL) { o.aviso && o.aviso(t('El servicio de llamadas no está disponible ahora mismo.')); return; }
      video = !!conVideo && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); suCamara = true; remotoV = null;
      efectosPorDefecto();
      desbloquea();
      PR = null; patas = []; estado = 'saliente'; inicioYo = true; idLlamada = Math.random().toString(36).slice(2, 10); colgoYo = false; tiempo.textContent = '00:00'; calidad.textContent = ''; calidad.classList.remove('ver'); pinta();
      di(video ? t('Pidiendo la cámara y el micrófono…') : t('Pidiendo el micrófono…'));
      if (video) await salidaDeSiempre(); else await auricularPrevio(); // la salida, antes de que arranque el audio de la llamada
      try { await medios(video); } catch (_) { di(t('Sin permiso para el micrófono.'), true); return termina('sin-medios', 1800); }
      altavoz = !!video; await buscaSalidas(); preparaRuta(); await aplicaSalida();
      nuevaPc();
      agregaPistas(); if (video) prefiereCodecs(EQUIPO);
      di(t('Llamando…'));
      const of = await pc.createOffer(); await pc.setLocalDescription({ type: of.type, sdp: altaFidelidad(of.sdp) });
      await sasNuevo();
      ultimaOferta = { acto: 'oferta', id: idLlamada, video: video ? 1 : undefined, equipo: EQUIPO, plat: PLAT, sas: sas ? b64u(sas.compromiso) : undefined, tres: TRES };
      o.manda({ acto: 'oferta', id: idLlamada, sdp: pc.localDescription.sdp, video: video ? 1 : undefined, equipo: EQUIPO, plat: PLAT, sas: sas ? b64u(sas.compromiso) : undefined, tres: TRES });
      if (estado === 'saliente') { tono('saliente'); esperaRespuesta(true); }
      pinta();
    }
    // La otra persona sale de la sala del relé (su conexión se cortó un momento o el teléfono durmió la app): la llamada no se corta por
    // eso (dueño, 29 Oct 2026, 14:49: «la llamada y la videollamada… que nada falle»). Hablando, la voz y la imagen van por su propio
    // camino: siguen, y si de verdad se cortan, reconecta() lo intenta. Llamando, se sigue llamando y, en cuanto vuelve, se le manda la
    // llamada otra vez (con todas las rutas ya reunidas). Sonando aquí o conectando, 12 s de margen; si no vuelve, se da por terminada.
    let ultimaOferta = null, ausenteT = null;
    function seFue() {
      clearTimeout(ausenteT); ausenteT = null;
      // llamando: ya no está sonando en su teléfono, así que vuelve a decir «Llamando…» hasta que regrese (revisión, 29 Oct 2026)
      if (estado === 'saliente') di(t('Llamando…'));
      if (estado === 'entrante' || estado === 'conectando') ausenteT = setTimeout(() => { ausenteT = null; if (estado === 'entrante') termina('rechazada'); else if (estado === 'conectando') termina('fallo'); }, 12000);
    }
    function volvio() {
      clearTimeout(ausenteT); ausenteT = null;
      if (estado === 'saliente' && ultimaOferta && pc && pc.localDescription) o.manda(Object.assign({}, ultimaOferta, { sdp: pc.localDescription.sdp }));
    }
    async function recibe(m) {
      if (!m || !m.acto) return;
      if (m.acto === 'oferta') {
        if (typeof m.sdp !== 'string' || m.sdp.length > 20000) return;
        // la misma llamada que vuelve a mandar su oferta porque la otra persona perdió un momento el relé: se queda la nueva, que
        // trae las rutas (ICE) que no llegaron; si no, la llamada sonaba pero no conectaba (revisión, 29 Oct 2026)
        if (m.id && m.id === idLlamada && estado === 'entrante' && ofertaEntrante) { ofertaEntrante = m; return; }
        // recién colgada: una llamada nueva entra (antes salía «Ocupado» si se devolvía la llamada en el acto)
        if (estado === 'cerrando') { estado = 'libre'; idLlamada = null; caja.classList.remove('gc-saliendo'); }
        if (ocupado()) { if (m.id !== idLlamada) o.manda({ acto: 'ocupado', id: m.id }); return; }
        // llamada a tres: ¿entiende la otra persona la llamada a tres? ¿Llama desde una llamada a tres (es el puente)?
        // llamada en grupo: ¿la entiende la otra persona? Si llama desde un grupo, cuántos son ya
        PR = null; patas = []; suTres = (m.tres | 0) >= 1; tramoPrincipal().n = Math.max(1, Math.min(8, (m.n | 0) || 1));
        ofertaEntrante = m; idLlamada = String(m.id || '').slice(0, 16); estado = 'entrante'; inicioYo = false; colgoYo = false; tiempo.textContent = '00:00'; calidad.textContent = ''; calidad.classList.remove('ver');
        sas = null; await sasNuevo(); if (sas) { try { sas.suCompromiso = typeof m.sas === 'string' && m.sas.length < 64 ? deB64u(m.sas) : null; } catch (_) { sas.suCompromiso = null; } if (!sas.suCompromiso || sas.suCompromiso.length !== 32) sas = null; }
        video = m.video === 1 || /\nm=video /.test(m.sdp); suCamara = true; remotoV = null;
        di(video ? t('Videollamada entrante') : t('Llamada entrante')); pinta(); tono('entrante'); esperaRespuesta(false);
        o.manda({ acto: 'sonando', id: idLlamada }); // a quien llama: «Sonando…» (ya ha llegado a este teléfono), como Telegram y WhatsApp
        return;
      }
      if (m.id && idLlamada && m.id !== idLlamada) return;
      if (m.acto === 'sonando') { if (estado === 'saliente') di(t('Sonando…')); return; }
      if (m.acto === 'respuesta' && pc && typeof m.sdp === 'string') { suTres = (m.tres | 0) >= 1; paraTono(); clearTimeout(sinRespuesta); await pc.setRemoteDescription({ type: 'answer', sdp: m.sdp }); for (const c of pendientes) { try { await pc.addIceCandidate(c); } catch (_) {} } pendientes = []; di(t('Conectando…')); if (video) topeVideo();
        if (sas && inicioYo) { try { sas.suPub = typeof m.sas === 'string' && m.sas.length < 120 ? deB64u(m.sas) : null; } catch (_) { sas.suPub = null; } if (sas.suPub && sas.suPub.length === 65) { o.manda({ acto: 'sas', id: idLlamada, p: b64u(sas.pub) }); sasCalcula(); } else { sas.estado = 'roto'; pintaSas(); } }
        return; }
      // la clave revelada de quien llama: tiene que ser la del compromiso de la oferta; si no, la comprobación queda rota
      if (m.acto === 'sas' && sas && !inicioYo) { let p = null; try { p = typeof m.p === 'string' && m.p.length < 120 ? deB64u(m.p) : null; } catch (_) {} if (p && p.length === 65) { const h = await sha256(p); if (sas.suCompromiso && h.length === 32 && h.every((x, i) => x === sas.suCompromiso[i])) { sas.suPub = p; sasCalcula(); return; } } sas.estado = 'roto'; pintaSas(); return; }
      if (m.acto === 'camara') { suCamara = !!m.on; pintaVideo(); reenviaImagenes(); return; }
      // llamada en grupo: ofertas para una imagen más, quién es cada imagen y cuántos somos
      if (/^tres/.test(m.acto)) { if (pc) await recibeGrupo(tramoPrincipal(), m); return; }
      // reinicio de la ruta en mitad de la llamada (ver reconecta)
      if (m.acto === 'reinicia') { if (pc && estado === 'hablando' && inicioYo) { reiniciando = true; try { pc.restartIce(); } catch (_) { reiniciando = false; } } return; }
      if (m.acto === 'reoferta' && pc && typeof m.sdp === 'string' && m.sdp.length <= 40000 && !inicioYo) { try { await pc.setRemoteDescription({ type: 'offer', sdp: m.sdp }); const an = await pc.createAnswer(); await pc.setLocalDescription({ type: an.type, sdp: altaFidelidad(an.sdp) }); o.manda({ acto: 'rerespuesta', id: idLlamada, sdp: pc.localDescription.sdp }); if (video) topeVideo(); topeAudio(); } catch (_) {} return; }
      if (m.acto === 'rerespuesta' && pc && typeof m.sdp === 'string' && m.sdp.length <= 40000 && inicioYo) { try { await pc.setRemoteDescription({ type: 'answer', sdp: m.sdp }); if (video) topeVideo(); topeAudio(); } catch (_) {} return; }
      if (m.acto === 'ice' && m.cand && typeof m.cand === 'object') { if (pc && pc.remoteDescription) { try { await pc.addIceCandidate(m.cand); } catch (_) {} } else if (pendientes.length < 64) pendientes.push(m.cand); return; }
      if (m.acto === 'colgar') { if (estado !== 'libre') termina(estado === 'hablando' ? 'fin' : 'rechazada'); return; }
      if (m.acto === 'ocupado') { di(t('Ocupado: la otra persona está en otra llamada.'), true); termina('ocupado', 1800); }
    }
    async function contestar() {
      if (estado !== 'entrante' || !ofertaEntrante) return;
      const m = ofertaEntrante; ofertaEntrante = null; estado = 'conectando'; paraTono(); clearTimeout(sinRespuesta); efectosPorDefecto(); desbloquea(); pinta();
      di(video ? t('Pidiendo la cámara y el micrófono…') : t('Pidiendo el micrófono…'));
      if (video) await salidaDeSiempre(); else await auricularPrevio();
      try { await medios(video); } catch (_) { di(t('Sin permiso para el micrófono.'), true); o.manda({ acto: 'colgar', id: idLlamada }); return termina('sin-medios', 1800); }
      altavoz = !!video; await buscaSalidas(); preparaRuta(); await aplicaSalida();
      nuevaPc();
      const pi = pistaImagen(); if (pi) { const vl = $('#v-local'); vl.srcObject = new MediaStream([pi]); reproduce(vl); }
      const flujo = new MediaStream(envio.getAudioTracks().concat(pi ? [pi] : []));
      flujo.getTracks().forEach((x) => pc.addTrack(x, flujo));
      agregaMuda();
      await pc.setRemoteDescription({ type: 'offer', sdp: m.sdp });
      // la respuesta decide el códec de los dos sentidos: si cualquiera de los dos es teléfono o Safari, los compatibles
      // quien contesta decide el códec de los dos sentidos: con un Android en la llamada (o de quien llama no se sabe el sistema y aquí
      // es Android), VP8; entre iPhones, H.264
      const suPlat = typeof m.plat === 'string' ? m.plat : '', vp8 = PLAT === 'android' || suPlat === 'android' || (!!suPlat && suPlat !== PLAT);
      if (video) prefiereCodecs(EQUIPO === 'compatible' || m.equipo === 'compatible' ? 'compatible' : 'escritorio', vp8);
      for (const c of pendientes) { try { await pc.addIceCandidate(c); } catch (_) {} } pendientes = [];
      const an = await pc.createAnswer(); await pc.setLocalDescription({ type: an.type, sdp: altaFidelidad(an.sdp) });
      o.manda({ acto: 'respuesta', id: idLlamada, sdp: pc.localDescription.sdp, sas: sas ? b64u(sas.pub) : undefined, tres: TRES });
      if (video) { topeVideo(); if (!cam) o.manda({ acto: 'camara', id: idLlamada, on: false }); }
      pinta();
      di(t('Conectando…'));
    }
    // ---------- Llamada en grupo, hasta 4 (dueño, 30 Oct 2026: 08:33 «que podamos hablar los tres a la vez»; 10:43 «podíamos ser
    // cuatro… cualquier participante… pueda añadir… a otra persona»; 10:53 «haz… lo de la llamada 4») ----------
    // Quien añade a alguien lo une con una llamada nueva (un «tramo»), así que la llamada es un árbol de tramos. Cada equipo manda
    // por cada tramo su voz mezclada con la que le llega por los demás tramos y, además de su imagen, las imágenes que le llegan
    // por los demás. Cada tramo es una llamada normal: encriptada de extremo a extremo (DTLS-SRTP), por el relé y con la oferta
    // dentro del canal encriptado de su conversación; nadie necesita conocer a los demás ni ver su IP. Si alguien cuelga, siguen
    // los demás; quien estaba unido solo a través de esa persona se queda fuera. A cada uno se le dice solo el nombre que los
    // demás se pusieron a sí mismos (nunca el nombre con el que los guarda quien los añadió).
    // (funciones con nombre, no flechas: «pinta» las usa y puede correr antes de llegar aquí)
    function tramoPrincipal() { if (!PR) PR = { principal: true, clave: 'p', videos: new Map(), quien: null, reenvios: new Map(), dest: null, n: 1, nEnviado: 0, quienEnviado: '', renegPendiente: false }; return PR; }
    function tpc(L) { return L.principal ? pc : L.pc; }
    function tid(L) { return L.principal ? idLlamada : L.id; }
    function tmanda(L, m) { if (L.principal) o.manda(m); else if (o.mandaA) o.mandaA(L.sala, m); }
    function tvoz(L) { return L.principal ? vozSuya : L.voz; }
    function tcam(L) { return L.principal ? ((remotoV && remotoV.getVideoTracks()[0]) || null) : L.cam; }
    function tcamOn(L) { return L.principal ? suCamara : L.camOn !== false; }
    function tsabe(L) { return L.principal ? suTres : !!L.sabe; }
    function tnombre(L) { return (L.principal ? o.nombre() : L.nombre) || t('Persona invitada'); }
    function tcompartido(L) { return String((L.principal ? (o.nombrePropio ? o.nombrePropio() : '') : L.compartido) || '').slice(0, 40); }
    function teducado(L) { return L.principal ? !inicioYo : false; } // en un choque de ofertas, cede quien contestó la llamada de ese tramo
    // los tramos en marcha (el principal y los añadidos que ya hablan); con «todos», también los que están sonando
    function tramos(todos) { const r = []; if (pc && (estado === 'hablando' || todos)) r.push(tramoPrincipal()); for (const L of patas) if (L.estado === 'hablando' || todos) r.push(L); return r; }
    function totalGrupo() { return 1 + tramos().reduce((s, L) => s + Math.max(1, L.n | 0), 0); }
    function enGrupo() { return estado === 'hablando' && totalGrupo() > 2; }
    function puedeAnadir() { return estado === 'hablando' && !!pc && !blindada() && !!o.eligeTercero && !patas.some((L) => L.estado === 'saliente') && totalGrupo() < MAX_GRUPO; }
    function vozMia() { return (envio && envio.getAudioTracks()[0]) || null; }
    function emisorVoz(p) { return p && p.getSenders().find((x) => x.track && x.track.kind === 'audio' && x.track !== muda); }
    function emisorCam(L) {
      const p = tpc(L); if (!p) return null; if (L.miCam) return L.miCam;
      const otros = new Set([...L.reenvios.values()].map((r) => r.tr.sender));
      return p.getSenders().find((x) => x.track && x.track.kind === 'video' && !otros.has(x)) || null;
    }
    // ---- la mezcla de voces: por cada tramo, mi voz y las de los demás tramos (nunca la suya) ----
    function mezclaCrea() {
      if (mezcla) return mezcla;
      const AC = raiz.AudioContext || raiz.webkitAudioContext; if (!AC) return null;
      let c = null; try { c = new AC({ latencyHint: 'interactive', sampleRate: 48000 }); } catch (_) { try { c = new AC({ latencyHint: 'interactive' }); } catch (_) { return null; } }
      c.onstatechange = () => { if (mezcla && mezcla.ctx === c && c.state !== 'running' && c.state !== 'closed' && estado !== 'libre') c.resume().catch(() => {}); };
      if (c.state !== 'running') c.resume().catch(() => {});
      mezcla = { ctx: c, nodos: new Map() };
      return mezcla;
    }
    function destDe(L) { if (!mezcla) return null; if (!L.dest) L.dest = mezcla.ctx.createMediaStreamDestination(); return L.dest; }
    function mezclaAlDia() {
      const ts = tramos(true).filter((L) => tpc(L));
      if (ts.length < 2) {
        // un solo tramo: mi voz tal cual, sin pasar por la mezcla
        for (const L of ts) { const s = emisorVoz(tpc(L)), yo = vozMia(); if (s && yo && s.track !== yo) s.replaceTrack(yo).catch(() => {}); }
        mezclaFin(); return;
      }
      const mz = mezclaCrea(); if (!mz) return;
      if (mz.ctx.state !== 'running') mz.ctx.resume().catch(() => {});
      const fuentes = [{ pista: vozMia(), de: null }];
      for (const L of ts) { const v = tvoz(L); if (v) fuentes.push({ pista: v, de: L }); }
      const vivas = new Set();
      for (const f of fuentes) {
        if (!f.pista) continue; vivas.add(f.pista);
        let n = mz.nodos.get(f.pista);
        if (!n) { try { n = mz.ctx.createMediaStreamSource(new MediaStream([f.pista])); mz.nodos.set(f.pista, n); } catch (_) { continue; } }
        try { n.disconnect(); } catch (_) {}
        for (const L of ts) if (L !== f.de) { const d = destDe(L); if (d) { try { n.connect(d); } catch (_) {} } }
      }
      for (const [p, n] of mz.nodos) if (!vivas.has(p)) { try { n.disconnect(); } catch (_) {} mz.nodos.delete(p); }
      for (const L of ts) { const s = emisorVoz(tpc(L)), d = destDe(L), a = d && d.stream.getAudioTracks()[0]; if (s && a && s.track !== a) s.replaceTrack(a).catch(() => {}); }
    }
    function mezclaFin() {
      const m = mezcla; mezcla = null; if (PR) PR.dest = null; for (const L of patas) L.dest = null;
      if (!m) return;
      for (const n of m.nodos.values()) { try { n.disconnect(); } catch (_) {} }
      try { m.ctx.close(); } catch (_) {}
    }
    // ---- las imágenes: cada tramo recibe las de los demás tramos (la cámara de su persona y las que esa persona reenvía) ----
    const activa = (L, mid) => !L.quien || Object.prototype.hasOwnProperty.call(L.quien, mid);
    function limpiaQuien(q) { const r = {}; let n = 0; for (const [k, v] of Object.entries(q || {})) { if (n >= 8 || !/^[\w-]{1,8}$/.test(k)) continue; r[k] = String(v || '').slice(0, 40); n++; } return r; }
    function fuentesImagen(K) {
      const out = [];
      const c = tcam(K); if (c && c.readyState === 'live' && tcamOn(K)) out.push({ clave: K.clave + ':cam', pista: c, nombre: tcompartido(K) });
      for (const [mid, v] of K.videos) if (v.pista && v.pista.readyState === 'live' && activa(K, mid)) out.push({ clave: K.clave + ':' + mid, pista: v.pista, nombre: (K.quien && K.quien[mid]) || '' });
      return out;
    }
    function quienDe(L) { const q = {}; for (const r of L.reenvios.values()) if (r.tr.mid && r.tr.sender.track) q[r.tr.mid] = String(r.nombre || '').slice(0, 40); return q; }
    function mandaQuien(L) { const q = quienDe(L), s = JSON.stringify(q); if (L.quienEnviado === s) return; L.quienEnviado = s; tmanda(L, { acto: 'tres-quien', id: tid(L), quien: q }); }
    // una oferta nueva por un tramo ya en marcha (para mandar una imagen más); si está a mitad de otra negociación, espera
    async function renegocia(L, intento) {
      const p = tpc(L); if (!p || p.signalingState === 'closed') return;
      L.renegPendiente = true;
      if (p.signalingState !== 'stable') { if ((intento | 0) < 30) setTimeout(() => renegocia(L, (intento | 0) + 1), 300); return; }
      try {
        const of = await p.createOffer();
        if (p.signalingState !== 'stable') { if ((intento | 0) < 30) setTimeout(() => renegocia(L, (intento | 0) + 1), 300); return; }
        await p.setLocalDescription({ type: of.type, sdp: altaFidelidad(of.sdp) });
        const q = quienDe(L); L.quienEnviado = JSON.stringify(q);
        tmanda(L, { acto: 'tres-oferta', id: tid(L), sdp: p.localDescription.sdp, quien: q });
      } catch (_) {}
    }
    function reenviaImagenes() {
      if (!video) return;
      const ts = tramos();
      for (const L of ts) {
        const p = tpc(L); if (!p || !tsabe(L)) continue;
        const quiero = new Map(); for (const K of ts) if (K !== L) for (const f of fuentesImagen(K)) quiero.set(f.clave, f);
        let nuevo = false;
        for (const [clave, f] of quiero) {
          const r = L.reenvios.get(clave);
          if (r) { if (r.tr.sender.track !== f.pista) r.tr.sender.replaceTrack(f.pista).catch(() => {}); r.nombre = f.nombre; continue; }
          // primero, un hueco libre (una imagen que ya no se manda); si no hay, uno nuevo (y una oferta nueva)
          const libre = [...L.reenvios.entries()].find(([k, x]) => !quiero.has(k));
          if (libre) { L.reenvios.delete(libre[0]); libre[1].tr.sender.replaceTrack(f.pista).catch(() => {}); libre[1].nombre = f.nombre; L.reenvios.set(clave, libre[1]); continue; }
          try {
            // reenviada: a la mitad de resolución y con un tope de caudal (cada imagen reenviada se vuelve a codificar en este equipo;
            // en un teléfono, tres a 1080p lo calentarían y le quitarían fluidez a todas)
            const tr = p.addTransceiver(f.pista, { direction: 'sendonly', streams: [new MediaStream([f.pista])], sendEncodings: [{ maxBitrate: 1500000, scaleResolutionDownBy: 2, maxFramerate: 30 }] });
            prefiereCodecs('compatible', true, p, tr); L.reenvios.set(clave, { tr, nombre: f.nombre }); nuevo = true;
          } catch (_) {}
        }
        for (const [clave, r] of L.reenvios) if (!quiero.has(clave) && r.tr.sender.track) r.tr.sender.replaceTrack(null).catch(() => {});
        if (nuevo) renegocia(L); else mandaQuien(L);
      }
    }
    // ---- cuántos somos: cada tramo dice cuántas personas hay detrás de él ----
    function mandaCuentas() {
      const ts = tramos();
      for (const L of ts) {
        if (!tsabe(L)) continue;
        const n = 1 + ts.filter((K) => K !== L).reduce((s, K) => s + Math.max(1, K.n | 0), 0);
        if (L.nEnviado !== n) { L.nEnviado = n; tmanda(L, { acto: 'tres-n', id: tid(L), n }); }
      }
    }
    // ---- la pantalla: una imagen por persona; tocando una, en grande; tocando la grande, otra vez todas ----
    const TILES = new Map(); // clave → { v: <video>, n: nombre }
    function vistas() {
      const r = [];
      for (const K of tramos()) {
        const c = tcam(K);
        if (c && c.readyState === 'live' && tcamOn(K) && (!K.principal || remotoV)) r.push({ clave: K.clave + ':cam', pista: c, nombre: tnombre(K), principal: !!K.principal });
        for (const [mid, v] of K.videos) if (v.pista && v.pista.readyState === 'live' && !v.pista.muted && activa(K, mid)) r.push({ clave: K.clave + ':' + mid, pista: v.pista, nombre: (K.quien && K.quien[mid]) || t('Persona invitada') });
      }
      return r;
    }
    function quitaTiles() { for (const el of TILES.values()) { try { el.v.srcObject = null; el.v.remove(); el.n.remove(); } catch (_) {} } TILES.clear(); }
    function pintaGrupo() {
      const cont = $('#ll-videos'); if (!cont) return;
      const lista = (video && estado !== 'libre' && estado !== 'cerrando') ? vistas() : [];
      const quiero = new Set(lista.filter((x) => !x.principal).map((x) => x.clave));
      for (const [k, el] of TILES) if (!quiero.has(k)) { try { el.v.srcObject = null; el.v.remove(); el.n.remove(); } catch (_) {} TILES.delete(k); }
      for (const x of lista) {
        if (x.principal) { const n1 = $('#ll-remoto-n'); if (n1) n1.textContent = x.nombre; continue; }
        let el = TILES.get(x.clave);
        if (!el) {
          const v = document.createElement('video'); v.className = 'll-tile'; v.autoplay = true; v.playsInline = true; v.muted = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
          const clave = x.clave; v.addEventListener('click', () => tocaVista(clave));
          const n = document.createElement('span'); n.className = 'll-tile-n'; n.setAttribute('translate', 'no');
          const vl = $('#v-local'); if (vl && vl.parentNode === cont) cont.insertBefore(v, vl); else cont.append(v);
          cont.append(n); el = { v, n }; TILES.set(x.clave, el);
        }
        if (!el.v.srcObject || el.v.srcObject.getVideoTracks()[0] !== x.pista) { el.v.srcObject = new MediaStream([x.pista]); reproduce(el.v); }
        el.n.textContent = x.nombre;
      }
      const grupo = lista.length >= 2;
      const antes = caja.classList.contains('tres');
      caja.classList.toggle('tres', grupo);
      caja.classList.toggle('a-tres', enGrupo());
      if (grupo !== antes) { if (grupo) caja.dataset.foco = ''; else delete caja.dataset.foco; if (video) raiz.requestAnimationFrame(() => miImagen()); }
      if (grupo && caja.dataset.foco && !lista.some((x) => x.clave === caja.dataset.foco)) caja.dataset.foco = '';
      const vs = $('#ll-videos'); if (vs && TILES.size) vs.hidden = false;
      colocaTiles(lista);
    }
    const PROPS = ['position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'max-width', 'aspect-ratio', 'border', 'border-radius', 'object-fit', 'z-index', 'box-shadow', 'transform'];
    function colocaTiles(lista) {
      const grupo = caja.classList.contains('tres') && !caja.classList.contains('mini');
      const els = lista.map((x) => (x.principal ? { x, v: $('#v-remoto'), n: $('#ll-remoto-n') } : { x, v: TILES.get(x.clave).v, n: TILES.get(x.clave).n })).filter((e) => e.v);
      const limpia = (el) => { for (const p of PROPS) el.style.removeProperty(p); };
      const pon = (el, ob) => { for (const [k, v] of Object.entries(ob)) el.style.setProperty(k, v, 'important'); };
      const nombre = (n, ob) => { if (!n) return; n.hidden = false; for (const k of ['left', 'top', 'bottom', 'max-width']) n.style.removeProperty(k); for (const [k, v] of Object.entries(ob)) n.style.setProperty(k, v, 'important'); };
      { const v1 = $('#v-remoto'); if (v1 && !els.some((e) => e.v === v1)) limpia(v1); const n1 = $('#ll-remoto-n'); if (n1 && !els.some((e) => e.n === n1)) n1.hidden = true; }
      if (!grupo) { for (const e of els) { limpia(e.v); if (e.n) e.n.hidden = true; } return; }
      const cont = $('#ll-videos'), W = cont.clientWidth || innerWidth, H = cont.clientHeight || innerHeight, horiz = W >= H, n = els.length, foco = caja.dataset.foco || '';
      let k = 0;
      els.forEach((e, i) => {
        limpia(e.v);
        const base = { position: 'absolute', right: 'auto', bottom: 'auto', 'max-width': 'none', 'object-fit': 'cover', transform: 'none', border: '0', 'border-radius': '0', 'aspect-ratio': 'auto', 'z-index': '0' };
        if (foco && e.x.clave === foco) {
          pon(e.v, Object.assign(base, { left: '0', top: '0', width: '100%', height: '100%' }));
          nombre(e.n, { left: '16px', top: 'auto', bottom: 'calc(140px + env(safe-area-inset-bottom, 0px))', 'max-width': 'calc(100% - 200px)' });
        } else if (foco) {
          pon(e.v, Object.assign(base, { left: '16px', top: 'calc(env(safe-area-inset-top, 0px) + ' + (116 + k * 172) + 'px)', width: '120px', height: '160px', border: '1px solid rgba(218,236,250,.22)', 'border-radius': '12px', 'z-index': '2', 'box-shadow': '0 8px 24px -10px rgba(0,0,0,.7)' }));
          k++; if (e.n) e.n.hidden = true;
        } else {
          const f = 100 / n;
          pon(e.v, Object.assign(base, horiz ? { left: (f * i) + '%', top: '0', width: f + '%', height: '100%' } : { left: '0', top: (f * i) + '%', width: '100%', height: f + '%' }));
          nombre(e.n, horiz ? { left: 'calc(' + (f * i) + '% + 16px)', top: 'auto', bottom: 'calc(140px + env(safe-area-inset-bottom, 0px))', 'max-width': 'calc(' + f + '% - 32px)' }
            : { left: '12px', bottom: 'auto', top: 'min(calc(' + (f * (i + 1)) + '% - 44px), calc(100% - 190px - env(safe-area-inset-bottom, 0px)))', 'max-width': 'calc(100% - 24px)' });
        }
      });
      // la raya entre imágenes solo cuando son dos (con tres no cae en la mitad)
      caja.classList.toggle('tres-n3', n >= 3);
    }
    function tocaVista(clave) {
      if (!caja.classList.contains('tres') || caja.classList.contains('mini')) return;
      const f = caja.dataset.foco || '';
      caja.dataset.foco = f === clave ? '' : clave;
      colocaTiles(video ? vistas() : []);
    }
    { const v1 = $('#v-remoto'); if (v1) v1.addEventListener('click', () => tocaVista('p:cam')); }
    addEventListener('resize', () => { if (caja.classList.contains('tres')) colocaTiles(video ? vistas() : []); }, { passive: true });
    // ---- añadir a alguien (cualquiera de la llamada): un tramo nuevo con esa persona ----
    async function anade(sala, d) {
      d = d || {};
      if (!puedeAnadir() || !sala || patas.some((L) => L.sala === String(sala))) return false;
      const ice = o.ice() || [];
      if (!ice.length && !LOCAL) { o.aviso && o.aviso(t('El servicio de llamadas no está disponible ahora mismo.')); return false; }
      const mz = mezclaCrea(); if (!mz) return false;
      if (mz.ctx.state !== 'running') mz.ctx.resume().catch(() => {});
      const id = Math.random().toString(36).slice(2, 10);
      const L = { sala: String(sala), clave: 'x' + id, nombre: String(d.nombre || '').slice(0, 40), compartido: String(d.suNombre || '').slice(0, 40), id, pc: null, estado: 'saliente', pendientes: [], voz: null, cam: null, camOn: true, sabe: false, videos: new Map(), quien: null, reenvios: new Map(), dest: null, n: 1, nEnviado: 0, quienEnviado: '', renegPendiente: false, el: null, miCam: null, sinRespuesta: null, inicio: 0, corte: null };
      patas.push(L);
      const tieneTurn = ice.some((s) => [].concat(s.urls).some((u) => /^turns?:/.test(u)));
      const p = L.pc = new RTCPeerConnection({ iceServers: ice, iceTransportPolicy: (tieneTurn || !LOCAL) ? 'relay' : 'all', bundlePolicy: 'max-bundle', rtcpMuxPolicy: 'require' });
      cablea(L);
      mezclaAlDia();
      const d3 = destDe(L), voz3 = d3 && d3.stream.getAudioTracks()[0];
      const es = video ? emisorCam(tramoPrincipal()) : null, pi = es && es.track ? es.track : null;
      const flujo = new MediaStream([voz3 || vozMia()].concat(pi ? [pi] : []).filter(Boolean));
      flujo.getTracks().forEach((x) => { const s = p.addTrack(x, flujo); if (x.kind === 'video') L.miCam = s; });
      if (video && !pi) { try { p.addTransceiver('video', { direction: 'recvonly' }); } catch (_) {} }
      if (video) prefiereCodecs('compatible', true, p);
      di(t('Llamando a {n}…').replace('{n}', L.nombre || t('Persona invitada')));
      pinta();
      try {
        const of = await p.createOffer(); await p.setLocalDescription({ type: of.type, sdp: altaFidelidad(of.sdp) });
        if (!patas.includes(L)) return false;
        tmanda(L, { acto: 'oferta', id, sdp: p.localDescription.sdp, video: video ? 1 : undefined, equipo: 'compatible', plat: PLAT, tres: TRES, puente: 1, n: totalGrupo() });
      } catch (_) { quitaPata(L, 'fallo'); return false; }
      L.sinRespuesta = setTimeout(() => { if (patas.includes(L) && L.estado === 'saliente') { tmanda(L, { acto: 'colgar', id }); quitaPata(L, 'sin-respuesta'); } }, SIN_RESPUESTA_MS);
      return true;
    }
    function cablea(L) {
      const p = L.pc, id = L.id;
      p.ontrack = (e) => {
        // ya es el tramo principal (la otra persona colgó y este pasó a principal): las imágenes nuevas, al principal
        const K = pc === p ? tramoPrincipal() : (patas.includes(L) ? L : null); if (!K) return;
        if (e.track.kind === 'video') {
          const vids = p.getTransceivers().filter((x) => x.receiver && x.receiver.track && x.receiver.track.kind === 'video');
          const avisa = () => { pintaGrupo(); reenviaImagenes(); };
          if (vids[0] === e.transceiver) { if (!K.principal) { K.cam = e.track; e.track.onunmute = avisa; e.track.onmute = avisa; e.track.onended = avisa; avisa(); } return; }
          K.videos.set(e.transceiver.mid || ('v' + K.videos.size), { pista: e.track }); e.track.onunmute = avisa; e.track.onmute = avisa; e.track.onended = avisa; avisa(); return;
        }
        if (!K.principal && !K.voz) {
          K.voz = e.track;
          const a = document.createElement('audio'); a.autoplay = true; a.setAttribute('aria-hidden', 'true'); a.style.display = 'none'; document.body.append(a);
          a.srcObject = new MediaStream([e.track]); K.el = a; reproduce(a);
          try { const ar = $('#a-remoto'); if (ar && ar.sinkId && typeof a.setSinkId === 'function') a.setSinkId(ar.sinkId).catch(() => {}); } catch (_) {}
          mezclaAlDia();
        }
      };
      p.onicecandidate = (e) => { if (!e.candidate) return; const m = { acto: 'ice', id: pc === p ? idLlamada : id, cand: e.candidate.toJSON() }; if (pc === p) o.manda(m); else if (patas.includes(L)) tmanda(L, m); };
      p.onconnectionstatechange = () => {
        if (pc === p) { if (alEstadoPc) alEstadoPc(); return; }
        if (!patas.includes(L)) return;
        const st = p.connectionState;
        if (st === 'connected') { clearTimeout(L.corte); L.corte = null; dentro(L); }
        else if (st === 'failed') { tmanda(L, { acto: 'colgar', id }); quitaPata(L, 'fallo'); }
        else if (st === 'disconnected' && L.estado === 'hablando' && !L.corte) {
          // un corte corto: se renegocia la ruta (quien añadió hizo la oferta); si en 25 s no vuelve, esa persona sale
          L.corte = setTimeout(async () => { if (!patas.includes(L) || p.connectionState === 'connected') return; try { const of = await p.createOffer({ iceRestart: true }); await p.setLocalDescription({ type: of.type, sdp: altaFidelidad(of.sdp) }); tmanda(L, { acto: 'reoferta', id, sdp: p.localDescription.sdp }); } catch (_) {} L.corte = setTimeout(() => { if (patas.includes(L) && p.connectionState !== 'connected') { tmanda(L, { acto: 'colgar', id }); quitaPata(L, 'fallo'); } }, 25000); }, 2500);
        }
      };
    }
    function dentro(L) {
      if (!L || L.estado === 'hablando') return;
      L.estado = 'hablando'; L.inicio = Date.now(); clearTimeout(L.sinRespuesta);
      mezclaAlDia();
      if (mezcla && mezcla.ctx.state !== 'running') mezcla.ctx.resume().catch(() => {});
      if (video && !camaraOn()) tmanda(L, { acto: 'camara', id: L.id, on: false });
      const x = t('{n} se ha unido a la llamada.').replace('{n}', L.nombre || t('Persona invitada')); di(x); setTimeout(() => { if (paso.textContent === x) di(''); }, 5000);
      mandaCuentas(); reenviaImagenes(); pinta();
    }
    // una persona añadida por mí sale (colgó, no contestó, estaba ocupada, falló) o la quito yo; «final»: termina toda la llamada
    function quitaPata(L, por, final) {
      const i = patas.indexOf(L); if (i < 0) return; patas.splice(i, 1);
      clearTimeout(L.sinRespuesta); clearTimeout(L.corte);
      try { L.pc.close(); } catch (_) {}
      if (L.el) { try { L.el.srcObject = null; L.el.remove(); } catch (_) {} }
      if (!final) {
        mezclaAlDia(); reenviaImagenes(); mandaCuentas();
        if (estado === 'hablando') {
          const n = L.nombre || t('Persona invitada');
          const txt = L.estado === 'hablando' ? t('{n} ha salido de la llamada.') : por === 'ocupado' ? t('{n} está en otra llamada.') : por === 'yo' ? '' : por === 'fallo' ? t('No se pudo mantener la conexión.') : t('{n} no ha contestado.');
          if (txt) { const x = txt.replace('{n}', n); di(x, por === 'fallo'); setTimeout(() => { if (paso.textContent === x) di(''); }, 5000); } else di('');
        }
      }
      // en el chat con esa persona queda la llamada, como cualquier otra
      if (o.finA) o.finA(L.sala, L.estado === 'hablando' ? { por: 'fin', duracion: L.inicio ? Date.now() - L.inicio : 0, mia: true, yoColgue: por === 'yo', saliente: false, voz: false, video } : { por: por === 'ocupado' ? 'ocupado' : por === 'yo' ? 'cancelada' : 'rechazada', duracion: 0, mia: true, yoColgue: por === 'yo', saliente: true, voz: false, video });
      pinta();
    }
    // la persona de mi tramo principal colgó (o se cortó) con otras dentro: la llamada sigue; la primera añadida pasa a principal
    function asciende() {
      const P1 = patas.find((L) => L.estado === 'hablando'); if (!P1) return;
      patas.splice(patas.indexOf(P1), 1);
      clearTimeout(P1.sinRespuesta); clearTimeout(P1.corte);
      const nB = tnombre(tramoPrincipal());
      // la llamada con la otra persona queda en su chat
      if (o.fin) o.fin({ por: 'fin', duracion: iniciada ? Date.now() - iniciada : 0, mia: inicioYo, yoColgue: false, saliente: false, voz: voz !== 'natural', video });
      if (o.cambia) o.cambia(P1.sala);
      try { pc.close(); } catch (_) {}
      reiniciando = false; clearTimeout(reinicioT); reinicioT = null; clearTimeout(reinicioFin); reinicioFin = null;
      pc = P1.pc; idLlamada = P1.id; inicioYo = true; suTres = P1.sabe; mudasRemotas = []; pendientes = [];
      pc.oniceconnectionstatechange = alIcePc; pc.onnegotiationneeded = alNegociarPc;
      vozSuya = P1.voz;
      const ar = $('#a-remoto'); ar.srcObject = P1.voz ? new MediaStream([P1.voz]) : null; suenaRemoto(); if (salidas) aplicaSalida();
      if (P1.el) { try { P1.el.srcObject = null; P1.el.remove(); } catch (_) {} }
      remotoV = P1.cam ? new MediaStream([P1.cam]) : null; suCamara = P1.camOn !== false;
      const vr = $('#v-remoto'); vr.srcObject = remotoV; if (remotoV) reproduce(vr);
      PR = { principal: true, clave: 'p', videos: P1.videos, quien: P1.quien, reenvios: P1.reenvios, dest: P1.dest, n: P1.n, nEnviado: P1.nEnviado, quienEnviado: P1.quienEnviado, renegPendiente: false, miCam: P1.miCam };
      quitaTiles();
      mezclaAlDia(); reenviaImagenes(); mandaCuentas();
      const x = t('{n} ha salido de la llamada.').replace('{n}', nB); di(x); setTimeout(() => { if (paso.textContent === x) di(''); }, 5000);
      pintaVideo(); pinta(); topeAudio(); if (video) topeVideo();
    }
    // lo que llega de cualquier tramo sobre el grupo: ofertas para una imagen más, quién es cada imagen y cuántos somos
    async function recibeGrupo(L, m) {
      const p = tpc(L); if (!p) return;
      if (m.acto === 'tres-oferta' && typeof m.sdp === 'string' && m.sdp.length <= 60000) {
        if (m.quien && typeof m.quien === 'object') L.quien = limpiaQuien(m.quien);
        try {
          if (p.signalingState !== 'stable') { if (!teducado(L)) return; await p.setLocalDescription({ type: 'rollback' }); }
          await p.setRemoteDescription({ type: 'offer', sdp: m.sdp }); const an = await p.createAnswer(); await p.setLocalDescription({ type: an.type, sdp: altaFidelidad(an.sdp) });
          tmanda(L, { acto: 'tres-respuesta', id: tid(L), sdp: p.localDescription.sdp });
          if (L.principal) { if (video) topeVideo(); topeAudio(); }
          if (L.renegPendiente) { L.renegPendiente = false; setTimeout(() => renegocia(L), 250); }
        } catch (_) {}
        pintaGrupo(); reenviaImagenes(); return;
      }
      if (m.acto === 'tres-respuesta' && typeof m.sdp === 'string' && m.sdp.length <= 60000) {
        if (p.signalingState === 'have-local-offer') { try { await p.setRemoteDescription({ type: 'answer', sdp: m.sdp }); L.renegPendiente = false; if (L.principal && video) topeVideo(); } catch (_) {} }
        mandaQuien(L); return;
      }
      if (m.acto === 'tres-quien' && m.quien && typeof m.quien === 'object') { L.quien = limpiaQuien(m.quien); pintaGrupo(); reenviaImagenes(); return; }
      if (m.acto === 'tres-n') { L.n = Math.max(1, Math.min(8, m.n | 0)); mandaCuentas(); pinta(); return; }
      // un puente de la versión anterior avisa de que el tercero sale
      if (m.acto === 'tres' && !m.on) { L.quien = {}; L.n = 1; pinta(); }
    }
    // lo que manda una persona añadida por mí, por su conversación
    async function recibeTercero(sala, m) {
      const L = patas.find((x) => x.sala === String(sala));
      if (!m || !m.acto || !L) return false;
      if (m.acto === 'oferta') { if (o.mandaA) o.mandaA(sala, { acto: 'ocupado', id: m.id }); return true; }
      if (m.id !== L.id) return true;
      const p = L.pc;
      if (/^tres/.test(m.acto)) { await recibeGrupo(L, m); return true; }
      if (m.acto === 'sonando') { if (L.estado === 'saliente') di(t('Llamando a {n}…').replace('{n}', L.nombre || t('Persona invitada')) + ' · ' + t('Sonando…')); return true; }
      if (m.acto === 'respuesta') {
        if (typeof m.sdp !== 'string' || m.sdp.length > 60000) return true;
        L.sabe = (m.tres | 0) >= 1;
        try { await p.setRemoteDescription({ type: 'answer', sdp: m.sdp }); for (const c of L.pendientes) { try { await p.addIceCandidate(c); } catch (_) {} } L.pendientes = []; } catch (_) { tmanda(L, { acto: 'colgar', id: L.id }); quitaPata(L, 'fallo'); }
        return true;
      }
      if (m.acto === 'ice' && m.cand && typeof m.cand === 'object') { if (p.remoteDescription) { try { await p.addIceCandidate(m.cand); } catch (_) {} } else if (L.pendientes.length < 64) L.pendientes.push(m.cand); return true; }
      if (m.acto === 'rerespuesta' && typeof m.sdp === 'string' && m.sdp.length <= 60000) { try { await p.setRemoteDescription({ type: 'answer', sdp: m.sdp }); } catch (_) {} return true; }
      if (m.acto === 'reinicia') { try { const of = await p.createOffer({ iceRestart: true }); await p.setLocalDescription({ type: of.type, sdp: altaFidelidad(of.sdp) }); tmanda(L, { acto: 'reoferta', id: L.id, sdp: p.localDescription.sdp }); } catch (_) {} return true; }
      if (m.acto === 'camara') { L.camOn = !!m.on; pintaGrupo(); reenviaImagenes(); return true; }
      if (m.acto === 'colgar') { quitaPata(L, 'colgo'); return true; }
      if (m.acto === 'ocupado') { quitaPata(L, 'ocupado'); return true; }
      return true;
    }
    function botonAnadir() {
      const sonando = patas.find((L) => L.estado === 'saliente');
      if (sonando) { tmanda(sonando, { acto: 'colgar', id: sonando.id }); quitaPata(sonando, 'yo'); return; }
      // el audio de la mezcla se arranca aquí, dentro del toque: el navegador (sobre todo el iPhone) deja parado un contexto de
      // audio creado fuera de un gesto, y entonces los demás oirían silencio (prueba tres.js, 30 Oct 2026)
      const mz = mezclaCrea(); if (mz && mz.ctx.state !== 'running') mz.ctx.resume().catch(() => {});
      if (o.eligeTercero) o.eligeTercero();
    }
    // ya colgada (o colgándose): un segundo toque, o que el otro cuelgue a la vez, no vuelve a terminarla (si no, dos tarjetas de
    // llamada en el chat y «Llamada perdida» por duplicado; revisión, 29 Oct 2026)
    function colgar() { if (estado === 'libre' || estado === 'cerrando') return; colgoYo = true; o.manda({ acto: 'colgar', id: idLlamada }); termina(estado === 'hablando' ? 'fin' : estado === 'entrante' ? 'rechazada' : 'cancelada'); }
    function termina(por, espera) {
      if (estado === 'libre' || estado === 'cerrando') return;
      if (patas.some((L) => L.estado === 'hablando') && !colgoYo && (por === 'fin' || por === 'fallo')) { asciende(); return; }
      for (const L of patas.slice()) { tmanda(L, { acto: 'colgar', id: L.id }); quitaPata(L, 'yo', true); }
      suTres = false; vozSuya = null; mezclaFin(); PR = null; quitaTiles();
      const dur = iniciada ? Date.now() - iniciada : 0, era = estado, conImagen = video;
      paraTono(); clearTimeout(sinRespuesta); clearTimeout(ausenteT); ausenteT = null; ultimaOferta = null; sueltaWake(); sueltaCompleta();
      clearInterval(reloj); reloj = null; clearInterval(sondeo); sondeo = null;
      reiniciando = false; clearTimeout(reinicioT); reinicioT = null; clearTimeout(reinicioFin); reinicioFin = null;
      if (pc) { try { pc.close(); } catch (_) {} pc = null; }
      for (const s of [mic, envio, envioVoz, cam]) if (s) s.getTracks().forEach((x) => x.stop());
      if (muda) { try { muda.stop(); } catch (_) {} muda = null; }
      envioVoz = null; restableceSalida();
      try { if (navigator.audioSession) navigator.audioSession.type = 'auto'; } catch (_) {}
      if (proc) { proc.parar(); proc = null; }
      clearInterval(medidor); medidor = null; if (vCam) { vCam.srcObject = null; vCam.remove(); vCam = null; } ganancia = 1; ajustes = false;
      mic = null; envio = null; cam = null; nodo = null; if (ctx) { try { ctx.close(); } catch (_) {} ctx = null; }
      $('#a-remoto').srcObject = null; $('#v-remoto').srcObject = null; $('#v-local').srcObject = null; $('#v-local').classList.remove('trasera'); try { mirando = 'user'; } catch (_) {} remotoV = null; suCamara = true; video = false;
      const bc = $('#ll-camara'); if (bc) bc.setAttribute('aria-pressed', 'false');
      pendientes = []; ofertaEntrante = null; iniciada = 0; partidaPorDefecto = true;
      sas = null; caja.classList.remove('sas-plegado', 'sas-grande'); clearTimeout(sasPlegadoT); pintaSas();
      voz = 'natural'; imagen = 'natural'; // la próxima llamada empieza con la voz y la imagen naturales
      mudasRemotas = [];
      const silencio = $('#ll-silenciar'); if (silencio) silencio.setAttribute('aria-pressed', 'false');
      if (por === 'fin') di(t('Llamada terminada'));
      else if (por === 'fallo') di(t('No se pudo mantener la conexión.'), true);
      else if (por === 'rechazada' && !colgoYo) di(t('La otra persona no ha contestado.'));
      estado = 'cerrando'; pinta();
      // al colgar, «Llamada terminada» un momento y la llamada se desvanece sobre el chat, sin salto (dueño, 28 Oct 2026, 17:10:
      // «al cortar la llamada… tienes que profesionalizar más esto»)
      const dura = espera || (por === 'fin' || por === 'cancelada' ? 700 : 1500);
      setTimeout(() => { if (estado === 'cerrando') caja.classList.add('gc-saliendo'); }, Math.max(0, dura - 280));
      setTimeout(() => { if (estado !== 'cerrando') return; estado = 'libre'; idLlamada = null; pinta(); }, dura);
      if (o.fin && era !== 'libre') o.fin({ por, duracion: dur, mia: inicioYo, yoColgue: colgoYo, saliente: era === 'saliente' || (era === 'hablando' && colgoYo), voz: voz !== 'natural', video: conImagen });
    }
    $('#ll-colgar').addEventListener('click', colgar);
    { const b = $('#ll-vista'); if (b) b.addEventListener('click', () => { alternaDividida(); pinta(); }); }
    { const b = $('#ll-anadir'); if (b) b.addEventListener('click', botonAnadir); }
    { const si = $('#ll-sas-si'), no = $('#ll-sas-no'), mini = $('#ll-sas-mini'); if (si) si.addEventListener('click', sasCoinciden); if (no) no.addEventListener('click', sasNoCoinciden); if (mini) mini.addEventListener('click', () => { if (sas && sas.estado === 'pendiente') { caja.classList.remove('sas-plegado'); pintaSas(); } }); }
    $('#ll-rechazar').addEventListener('click', colgar);
    $('#ll-contestar').addEventListener('click', () => { contestar().catch(() => termina('fallo')); });
    $('#ll-silenciar').addEventListener('click', (e) => { const b = e.currentTarget; const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); for (const s of [envio, mic]) if (s) s.getAudioTracks().forEach((x) => { x.enabled = !on; }); });
    { const b = $('#ll-altavoz'); if (b) b.addEventListener('click', () => { altavoz = !altavoz; aplicaSalida(); }); }
    // cada vez que la voz de la otra persona vuelve a sonar (al empezar, tras una interrupción o al volver a la app), el silencio
    // vuelve a pedir la salida elegida
    { const ar = $('#a-remoto'); if (ar) ar.addEventListener('playing', () => { if (estado !== 'libre' && estado !== 'cerrando') refuerzaRuta(); }); }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && estado !== 'libre' && estado !== 'cerrando') refuerzaRuta(); });
    for (const b of document.querySelectorAll('#ll-voces [data-voz]')) b.addEventListener('click', () => eligeVoz(b.dataset.voz));
    for (const b of document.querySelectorAll('#ll-imagenes [data-imagen]')) b.addEventListener('click', () => eligeImagen(b.dataset.imagen));
    $('#ll-luz').addEventListener('click', eligeLuz);
    $('#ll-grave').addEventListener('click', () => { eligeVoz(voz === 'grave' ? 'natural' : 'grave'); pinta(); });
    $('#ll-mosaico').addEventListener('click', () => { eligeImagen(imagen === 'mosaico' ? 'natural' : 'mosaico'); pinta(); });
    $('#ll-ajustes-b').addEventListener('click', () => { ajustes = !ajustes; pinta(); });
    // cerrar «Voz e imagen»: con «Atrás», con el mismo botón o tocando la imagen fuera del panel
    const cierraAjustes = () => { ajustes = false; caja.classList.remove('voz-abierta'); pinta(); };
    { const at = $('#ll-ajustes-atras'); if (at) at.addEventListener('click', (e) => { e.stopPropagation(); cierraAjustes(); }); }
    caja.addEventListener('click', (e) => { if (!(ajustes || caja.classList.contains('voz-abierta')) || estado === 'entrante') return; if (e.target.closest('#ll-ajustes, #ll-botones, #ll-voz-pill, .gc-llamada-arriba, #ll-tam, button, a, input, label')) return; cierraAjustes(); });
    // al recibir: «Tu voz: Natural ▾» abre y cierra las voces; al elegir una, la píldora lo dice
    const pill = $('#ll-voz-pill');
    if (pill) pill.addEventListener('click', () => { caja.classList.toggle('voz-abierta'); pinta(); });
    for (const b of document.querySelectorAll('#ll-voces [data-voz]')) b.addEventListener('click', () => { if (estado === 'entrante') pinta(); });
    // la calidad: corta en pantalla («Conexión: excelente»); al tocarla, los datos técnicos
    calidad.addEventListener('click', () => { calidad.classList.toggle('ver'); if (calidad.dataset.largo) calidad.textContent = calidad.classList.contains('ver') ? calidad.dataset.largo : (calidad.dataset.corto || ''); });
    // en el teléfono la calidad solo sale si la conexión es débil; tocando «Encriptada de extremo a extremo» se ve el detalle (la
    // resolución y el formato de la imagen que va y viene), para mandar una captura si algo falla (29 Oct 2026, 15:20)
    { const ci = document.querySelector('#gc-llamada .gc-llamada-cifrado') || document.querySelector('.gc-llamada-cifrado'); if (ci) { ci.style.cursor = 'pointer'; ci.addEventListener('click', () => { const on = !caja.classList.contains('ver-calidad'); caja.classList.toggle('ver-calidad', on); calidad.classList.toggle('ver', on); if (calidad.dataset.largo) calidad.textContent = on ? calidad.dataset.largo : (calidad.dataset.corto || ''); }); } }
    // cámara encendida o apagada durante la videollamada; la otra persona lo sabe por el canal encriptado
    // Girar la cámara (dueño, 29 Oct 2026, 14:49: «como WhatsApp»): la delantera o la trasera, sin cortar la llamada. Primero se suelta
    // la que hay (muchos teléfonos no abren dos a la vez) y se pide la otra; si no se puede, se vuelve a la de antes.
    let mirando = 'user', girando = false;
    async function giraCamara() {
      if (!cam || !video || girando || estado === 'libre') return;
      girando = true;
      const quiero = mirando === 'user' ? 'environment' : 'user';
      const pide = async (cara) => { try { return await navigator.mediaDevices.getUserMedia({ video: Object.assign({}, VIDEO, { facingMode: { exact: cara } }) }); } catch (_) { return navigator.mediaDevices.getUserMedia({ video: Object.assign({}, VIDEO, { facingMode: cara }) }); } };
      const viejo = cam.getVideoTracks()[0], encendida = !viejo || viejo.enabled;
      // primero se pide la otra cámara y solo entonces se para la actual: si la nueva no llega, se sigue con la de antes (antes se
      // paraba primero y, si fallaban las dos peticiones, la otra persona se quedaba viendo negro; revisión, 29 Oct 2026). Algunos
      // teléfonos no dan la segunda cámara mientras la primera está abierta: entonces se para la actual y se vuelve a pedir.
      let s = null, cara = quiero;
      try { s = await pide(quiero); } catch (_) { s = null; }
      if (!s) { try { if (viejo) viejo.stop(); } catch (_) {} try { s = await pide(quiero); } catch (_) { try { s = await pide(mirando); cara = mirando; } catch (e) { s = null; } } }
      else { try { if (viejo) viejo.stop(); } catch (_) {} }
      const nueva = s && s.getVideoTracks()[0];
      if (!nueva && estado !== 'libre' && viejo && viejo.readyState === 'ended') { o.aviso && o.aviso(t('No se pudo cambiar de cámara.')); o.manda({ acto: 'camara', id: idLlamada, on: false }); }
      if (nueva && estado !== 'libre') {
        nueva.enabled = encendida; try { nueva.contentHint = 'motion'; } catch (_) {}
        cam = new MediaStream([nueva]); mirando = cara;
        if (vCam) { vCam.srcObject = new MediaStream([nueva]); reproduce(vCam); }
        await aplicaImagen();
        const vl = $('#v-local'); if (vl) vl.classList.toggle('trasera', mirando === 'environment');
      } else if (s) s.getTracks().forEach((x) => x.stop());
      girando = false; pinta();
    }
    { const b = $('#ll-girar'); if (b) b.addEventListener('click', () => { giraCamara(); }); }
    $('#ll-camara').addEventListener('click', () => { if (!cam) return; const on = !camaraOn(); cam.getVideoTracks().forEach((x) => { x.enabled = on; }); o.manda({ acto: 'camara', id: idLlamada, on }); for (const L of patas) tmanda(L, { acto: 'camara', id: L.id, on }); pintaVideo(); });
    $('#ll-mini').addEventListener('click', () => pequena(true));
    { const b = $('#ll-completa'); if (b) {
      b.addEventListener('click', () => alternaCompleta());
      document.addEventListener('fullscreenchange', () => { b.setAttribute('aria-pressed', document.fullscreenElement ? 'true' : 'false'); });
    } }
    $('#ll-volver').addEventListener('click', () => pequena(false));
    $('#ll-videos').addEventListener('click', () => { if (sinClicMini) return; if (caja.classList.contains('mini')) pequena(false); });
    // En pequeño, sobre el chat, la llamada se lleva a cualquier sitio con el ratón (dueño, 30 Oct 2026, 10:59: «esa pantalla la quiero
    // poder mover porque me está tapando unas zonas»). Se recuerda dónde se dejó (en proporción a la ventana).
    var arrMini = null, sinClicMini = false; // (var: «pequena» puede correr antes de llegar aquí)
    const MINI_POS = 'gcom-mini-pos';
    const finoAhora = () => !!(raiz.matchMedia && raiz.matchMedia('(hover: hover) and (pointer: fine)').matches);
    function ponMini(x, y) {
      const W = caja.offsetWidth || 340, H = caja.offsetHeight || 240;
      x = Math.max(8, Math.min(innerWidth - W - 8, x)); y = Math.max(8, Math.min(innerHeight - H - 8, y));
      caja.style.setProperty('--mini-x', Math.round(x) + 'px'); caja.style.setProperty('--mini-y', Math.round(y) + 'px'); caja.classList.add('mini-movida');
    }
    function recolocaMini() {
      if (!caja.classList.contains('mini') || !finoAhora()) { caja.classList.remove('mini-movida'); return; }
      let p = null; try { p = JSON.parse(localStorage.getItem(MINI_POS) || 'null'); } catch (_) {}
      if (p && Number.isFinite(p.fx) && Number.isFinite(p.fy)) ponMini(p.fx * innerWidth, p.fy * innerHeight); else caja.classList.remove('mini-movida');
    }
    caja.addEventListener('pointerdown', (e) => {
      if (!caja.classList.contains('mini') || !finoAhora() || e.button > 0 || e.target.closest('button, a, input, label')) return;
      const r = caja.getBoundingClientRect();
      arrMini = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, movido: false };
      try { caja.setPointerCapture(e.pointerId); } catch (_) {}
    });
    caja.addEventListener('pointermove', (e) => {
      if (!arrMini || e.pointerId !== arrMini.id) return;
      if (!arrMini.movido && Math.hypot(e.clientX - arrMini.x0, e.clientY - arrMini.y0) < 5) return;
      arrMini.movido = true; caja.classList.add('mini-arrastrando');
      ponMini(e.clientX - arrMini.dx, e.clientY - arrMini.dy);
    });
    const sueltaMini = (e) => {
      if (!arrMini || e.pointerId !== arrMini.id) return;
      const a = arrMini; arrMini = null; caja.classList.remove('mini-arrastrando');
      try { caja.releasePointerCapture(e.pointerId); } catch (_) {}
      if (!a.movido) return;
      sinClicMini = true; setTimeout(() => { sinClicMini = false; }, 350);
      const r = caja.getBoundingClientRect(); try { localStorage.setItem(MINI_POS, JSON.stringify({ fx: r.left / innerWidth, fy: r.top / innerHeight })); } catch (_) {}
    };
    caja.addEventListener('pointerup', sueltaMini); caja.addEventListener('pointercancel', sueltaMini);
    addEventListener('resize', () => recolocaMini(), { passive: true });
    addEventListener('beforeunload', () => { if (estado !== 'libre') { try { o.manda({ acto: 'colgar', id: idLlamada }); } catch (_) {} } });
    pintaVoces(); pintaImagenes();
    // Zoom y ventanas pequeñas (dueño, 28 Oct 2026, 12:22–12:24: «que no se vuelva todo loco… que no cambien las cosas de
    // sitio»). En el ordenador la llamada nunca se dibuja en menos de 640 × 480: con menos sitio (un zoom del 300 %, una
    // ventana pequeña) se reduce entera, como una imagen. En el teléfono, su diseño de teléfono.
    const FINO = raiz.matchMedia ? raiz.matchMedia('(hover: hover) and (pointer: fine)') : { matches: false };
    const MIN_W = 640, MIN_H = 480;
    let escalaYa = 1;
    function escala() {
      const s = FINO.matches ? Math.min(1, innerWidth / MIN_W, innerHeight / MIN_H) : 1;
      escalaYa = s > 0 ? s : 1;
      caja.classList.toggle('escalada', escalaYa < 1);
      caja.style.setProperty('--escala', String(escalaYa));
      caja.style.setProperty('--ancho', (innerWidth / escalaYa) + 'px');
      caja.style.setProperty('--alto', (innerHeight / escalaYa) + 'px');
      miImagen();
    }
    // Tu imagen pequeña (dueño, 12:22: «quiero clicarla y arrastrarla y ponerla donde yo quiera»; 12:55: «también quiero que se
    // pueda modificar el tamaño… hasta un máximo de pantalla dividida de mitad a mitad»): se arrastra para moverla y, desde
    // el asa de la esquina que mira al centro, se agranda o se achica. Al llegar a media pantalla queda la pantalla dividida
    // (tú en una mitad y la otra persona en la otra); doble clic o doble toque la abre y la cierra. Todo se recuerda en este
    // navegador, en proporción a la pantalla. En la llamada en pequeño va en su esquina.
    // En el teléfono, la llamada se queda en vertical (dueño, 28 Oct 2026, 16:12: «no quiero que la llamada se pueda girar»). Android
    // lo permite a pantalla completa o como app; el iPhone no deja bloquear el giro desde una web (sí desde su Centro de control).
    var giroFijo = false; // var: pinta() puede llamar a giro() antes de llegar aquí
    function giro(fijar) {
      try {
        const tel = raiz.matchMedia && raiz.matchMedia('(max-width: 760px), (pointer: coarse) and (max-height: 500px)').matches;
        const so = raiz.screen && raiz.screen.orientation;
        if (!so || !so.lock) return;
        // 29 Oct 2026, 14:25 (dueño): en el teléfono, vertical siempre, también fuera de la llamada: se fija y no se suelta al colgar
        if (tel && !giroFijo) { so.lock('portrait').then(() => { giroFijo = true; }).catch(() => {}); }
      } catch (_) {}
    }
    const MI_IMG = 'gcom-mi-imagen', MARGEN = 10, DIVIDE = 0.45;
    let arrastre = null, ultimoToque = 0;
    // Cada videollamada empieza con la pantalla partida, mitad y mitad (dueño, 28 Oct 2026, 15:12: «que saliera así por defecto,
    // mitad-mitad. Y ya si uno la quiere minimizar, que haya como un botoncito muy profesional para hacerla más pequeña»).
    // En cuanto la persona la cambia (botón, doble clic o arrastre), manda lo suyo hasta que cuelga.
    let partidaPorDefecto = true;
    const SVG_REDUCIR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 10l6-6M14 10V5.5M14 10h4.5M10 14l-6 6M10 14v4.5M10 14H5.5"/></svg>';
    const SVG_PARTIR = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 5v14"/></svg>';
    const SVG_COMPLETA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/></svg>';
    const botonTam = () => { let b = $('#ll-tam'); if (!b) { const c = lienzoVid(); if (!c) return null; b = document.createElement('button'); b.type = 'button'; b.id = 'll-tam'; b.className = 'mi-tam-boton'; b.hidden = true; b.addEventListener('click', (e) => { e.stopPropagation(); partidaPorDefecto = false; alternaDividida(); }); c.append(b); } return b; };
    function pintaBotonTam() {
      const b = botonTam(); if (!b) return; const vl = vidLocal();
      // mientras suena no hay imagen de la otra persona: «Pantalla completa» no sale hasta que llega (dueño, 28 Oct 2026, 20:28:
      // «Corrige ese fallo»: quedaba en la raya del medio, encima del nombre)
      b.hidden = !visible() || !vl || caja.classList.contains('solo-mia');
      if (b.hidden) return;
      // En el teléfono, con la pantalla partida, el botón lleva su nombre y va en la raya del medio, a la derecha: «Pantalla
      // completa» deja a la otra persona a toda la pantalla y a ti en pequeño, como WhatsApp o FaceTime; tocando tu imagen pequeña
      // (o su botón) se vuelve a partir (dueño, 28 Oct 2026, 17:24: «ponlo muy fácil, algún botoncito ahí en algún sitio»).
      const div = caja.classList.contains('dividida'), tel = !FINO.matches, conNombre = tel && div;
      const txt = div ? (tel ? t('Pantalla completa') : t('Hacer pequeña tu imagen')) : t('Pantalla dividida');
      const modo = (div ? 'div' : 'peq') + (conNombre ? '-n' : '');
      if (b.dataset.modo !== modo) { b.dataset.modo = modo; b.innerHTML = div ? (conNombre ? SVG_COMPLETA + '<span></span>' : SVG_REDUCIR) : SVG_PARTIR; }
      const sp = b.querySelector('span'); if (sp && sp.textContent !== txt) sp.textContent = txt;
      b.classList.toggle('con-nombre', conNombre);
      b.setAttribute('aria-label', txt); b.title = txt;
      // dónde: lejos de la barra de arriba («Ver el chat», el nombre) y de los botones de abajo. Partida: en el borde de fuera de
      // tu mitad, a media altura. Pequeña: en la esquina que mira al centro en vertical, al otro lado del asa.
      const cont = lienzoVid(), CW = cont ? cont.clientWidth : 0, CH = cont ? cont.clientHeight : 0; let x, y;
      const l = div ? ['izq', 'der', 'arriba', 'abajo'].find((z) => caja.classList.contains('lado-' + z)) : null;
      if (conNombre) { const W = b.offsetWidth || 180, H = b.offsetHeight || 40; if (l === 'arriba' || l === 'abajo') { x = CW - W - 12; y = CH / 2 - H / 2; } else { x = CW / 2 - W / 2; y = CH - H - 150; } }
      else if (div) { x = l === 'izq' ? 14 : CW - 52; y = l === 'arriba' ? CH * 0.25 - 19 : l === 'abajo' ? CH * 0.75 - 19 : CH / 2 - 19; }
      else { const e = esquinaAsa(vl, CW, CH); x = e.izq ? vl.offsetLeft + vl.offsetWidth - 44 : vl.offsetLeft + 6; y = e.arriba ? vl.offsetTop + 6 : vl.offsetTop + vl.offsetHeight - 44; }
      caja.style.setProperty('--tam-x', Math.round(x) + 'px'); caja.style.setProperty('--tam-y', Math.round(y) + 'px');
    }
    // en el teléfono, las imágenes que vienen en vertical llenan su sitio (como FaceTime) en vez de quedar con franjas negras
    function orientaVideos() { for (const v of [$('#v-remoto'), $('#v-local')]) if (v) v.classList.toggle('vertical', !!(v.videoWidth && v.videoHeight && v.videoHeight > v.videoWidth * 1.05)); }
    for (const v of [$('#v-remoto'), $('#v-local')]) if (v) { v.addEventListener('loadedmetadata', orientaVideos); v.addEventListener('resize', orientaVideos); }

    const vidLocal = () => $('#v-local');
    const lienzoVid = () => $('#ll-videos');
    const leeMi = () => { try { const x = JSON.parse(localStorage.getItem(MI_IMG) || 'null'); return x && typeof x === 'object' ? x : {}; } catch (_) { return {}; } };
    const guardaMi = (o) => { try { localStorage.setItem(MI_IMG, JSON.stringify(Object.assign(leeMi(), o))); } catch (_) {} };
    const asa = () => { let a = $('#ll-asa'); if (!a) { a = document.createElement('span'); a.id = 'll-asa'; a.className = 'mi-asa'; a.setAttribute('aria-hidden', 'true'); const c = lienzoVid(); if (c) c.append(a); } return a; };
    // lado de la pantalla dividida: en horizontal, izquierda o derecha; en vertical (teléfono), arriba o abajo
    function ladoDe(cx, cy, CW, CH) { return CW >= CH ? (cx > CW / 2 ? 'der' : 'izq') : (cy > CH / 2 ? 'abajo' : 'arriba'); }
    function ponDividida(lado) {
      for (const l of ['izq', 'der', 'arriba', 'abajo']) caja.classList.toggle('lado-' + l, lado === l);
      caja.classList.toggle('dividida', !!lado);
    }
    function miImagen() {
      const vl = vidLocal(), cont = lienzoVid(); if (!vl || !cont) return;
      const mi = leeMi(), CW = cont.clientWidth, CH = cont.clientHeight;
      // partida por defecto en el ordenador y también en el teléfono, tú abajo (dueño, 28 Oct 2026, 17:24: «que salga directamente a
      // pantalla dividida… y luego la persona, si quiere… algún botoncito… y que entonces se ponga como si fuera una llamada de
      // WhatsApp o de FaceTime»); antes, en el teléfono, empezaba como FaceTime (15:36)
      // a tres, nunca partida contigo: la pantalla es de las otras dos personas y tu imagen va en pequeño, y se puede mover
      if (caja.classList.contains('tres')) ponDividida(null);
      else if (partidaPorDefecto && video && cam && CW) ponDividida(CW >= CH ? 'der' : 'abajo');
      else if (mi.div && CW) { const hz = CW >= CH, mapa = hz ? { arriba: 'izq', abajo: 'der' } : { izq: 'arriba', der: 'abajo' }; ponDividida(mapa[mi.div] || mi.div); }
      else ponDividida(null);
      // tamaño elegido (proporción del ancho), con su mínimo y su máximo
      if (Number.isFinite(mi.w) && CW) { caja.style.setProperty('--mi-w', Math.round(limitaAncho(mi.w * CW, CW, CH, vl)) + 'px'); caja.classList.add('con-tam'); }
      else caja.classList.remove('con-tam');
      if (Number.isFinite(mi.x) && Number.isFinite(mi.y) && CW) {
        const W = vl.offsetWidth, H = vl.offsetHeight;
        const x = MARGEN + Math.max(0, Math.min(1, mi.x)) * Math.max(0, CW - W - 2 * MARGEN), y = MARGEN + Math.max(0, Math.min(1, mi.y)) * Math.max(0, CH - H - 2 * MARGEN);
        caja.style.setProperty('--mi-x', Math.round(x) + 'px'); caja.style.setProperty('--mi-y', Math.round(y) + 'px'); caja.classList.add('movida');
      } else caja.classList.remove('movida');
      colocaAsa();
    }
    // ancho entre un mínimo y la mitad de la pantalla (sin salirse por arriba ni por abajo)
    function limitaAncho(w, CW, CH, vl) {
      const asp = (vl.offsetWidth && vl.offsetHeight) ? vl.offsetWidth / vl.offsetHeight : (FINO.matches ? 16 / 9 : 3 / 4);
      const min = Math.min(FINO.matches ? 120 : 84, CW / 3), max = Math.max(min, Math.min(CW / 2, (CH - 2 * MARGEN) * asp));
      return Math.max(min, Math.min(max, w));
    }
    // el asa, en la esquina de tu imagen que mira al centro de la pantalla
    function esquinaAsa(vl, CW, CH) {
      const cx = vl.offsetLeft + vl.offsetWidth / 2, cy = vl.offsetTop + vl.offsetHeight / 2;
      return { izq: cx > CW / 2, arriba: cy > CH / 2 };
    }
    function colocaAsa() {
      pintaBotonTam();
      const a = asa(), vl = vidLocal(), cont = lienzoVid(); if (!a || !vl || !cont) return;
      if (caja.classList.contains('dividida')) {
        // en la pantalla dividida, el asa va en el borde que separa las dos mitades
        const CW = cont.clientWidth, CH = cont.clientHeight, l = ['izq', 'der', 'arriba', 'abajo'].find((x) => caja.classList.contains('lado-' + x));
        const x = CW / 2, y = CH / 2; void l;
        caja.style.setProperty('--asa-x', Math.round(x - 11) + 'px'); caja.style.setProperty('--asa-y', Math.round(y - 11) + 'px'); return;
      }
      const e = esquinaAsa(vl, cont.clientWidth, cont.clientHeight);
      const x = vl.offsetLeft + (e.izq ? 0 : vl.offsetWidth), y = vl.offsetTop + (e.arriba ? 0 : vl.offsetHeight);
      caja.style.setProperty('--asa-x', Math.round(x - 11) + 'px'); caja.style.setProperty('--asa-y', Math.round(y - 11) + 'px');
    }
    // dónde cae el puntero, en las medidas de la llamada (con la llamada reducida, se deshace la escala)
    const enLienzo = (e) => ({ x: e.clientX / escalaYa, y: e.clientY / escalaYa });
    const visible = () => { const vl = vidLocal(); return !!(vl && video && !caja.classList.contains('mini') && vl.offsetWidth && cam && !$('#ll-videos').hidden); };
    const sobreMiImagen = (p) => { if (!visible()) return false; const vl = vidLocal(); return p.x >= vl.offsetLeft && p.x <= vl.offsetLeft + vl.offsetWidth && p.y >= vl.offsetTop && p.y <= vl.offsetTop + vl.offsetHeight; };
    const sobreAsa = (p) => { if (!visible()) return false; const cs = getComputedStyle(caja); const x = parseFloat(cs.getPropertyValue('--asa-x')) + 11, y = parseFloat(cs.getPropertyValue('--asa-y')) + 11; return Number.isFinite(x) && Math.hypot(p.x - x, p.y - y) <= 18; };
    // de la pantalla dividida a la imagen flotante del mismo tamaño (para seguir agrandando o achicando desde ahí)
    function sueltaDividida() {
      partidaPorDefecto = false;
      const vl = vidLocal(), cont = lienzoVid(), CW = cont.clientWidth, CH = cont.clientHeight, l = ['izq', 'der', 'arriba', 'abajo'].find((x) => caja.classList.contains('lado-' + x));
      ponDividida(null);
      const w = limitaAncho(CW / 2, CW, CH, vl); caja.style.setProperty('--mi-w', Math.round(w) + 'px'); caja.classList.add('con-tam');
      const W = vl.offsetWidth, H = vl.offsetHeight;
      const x = l === 'izq' ? MARGEN : l === 'der' ? CW - W - MARGEN : (CW - W) / 2, y = l === 'arriba' ? MARGEN : l === 'abajo' ? CH - H - MARGEN : (CH - H) / 2;
      caja.style.setProperty('--mi-x', Math.round(x) + 'px'); caja.style.setProperty('--mi-y', Math.round(y) + 'px'); caja.classList.add('movida');
    }
    function guardaSitio() {
      const vl = vidLocal(), cont = lienzoVid(); if (!vl || !cont) return;
      const CW = cont.clientWidth, CH = cont.clientHeight, W = vl.offsetWidth, H = vl.offsetHeight;
      const div = caja.classList.contains('dividida') ? ['izq', 'der', 'arriba', 'abajo'].find((x) => caja.classList.contains('lado-' + x)) : null;
      if (div) return guardaMi({ div });
      // el tamaño solo se guarda si la persona lo cambió; con cinco decimales, para que al volver no baile ni un píxel
      const r5 = (v) => Math.round(v * 1e5) / 1e5;
      guardaMi({ div: null, w: caja.classList.contains('con-tam') ? r5(W / CW) : null, x: r5((vl.offsetLeft - MARGEN) / Math.max(1, CW - W - 2 * MARGEN)), y: r5((vl.offsetTop - MARGEN) / Math.max(1, CH - H - 2 * MARGEN)) });
    }
    function alternaDividida() {
      partidaPorDefecto = false;
      const vl = vidLocal(), cont = lienzoVid(); if (!vl || !cont) return;
      if (caja.classList.contains('dividida')) {
        // vuelve a la imagen pequeña de antes (o a la de siempre)
        ponDividida(null); const mi = leeMi(); guardaMi({ div: null });
        if (!(Number.isFinite(mi.w) && mi.w < DIVIDE)) { caja.classList.remove('con-tam', 'movida'); guardaMi({ w: null, x: null, y: null }); }
        miImagen(); return;
      }
      const CW = cont.clientWidth, CH = cont.clientHeight, lado = ladoDe(vl.offsetLeft + vl.offsetWidth / 2, vl.offsetTop + vl.offsetHeight / 2, CW, CH);
      guardaSitio(); ponDividida(lado); guardaMi({ div: lado }); colocaAsa();
    }
    caja.addEventListener('pointerdown', (e) => {
      if (caja.classList.contains('mini')) return;
      if (e.button > 0 || e.target.closest('button, a, input, label, .ll-ajustes')) return;
      // en el teléfono no hay asa (se mueve con el dedo; el tamaño, con el botón de la pantalla partida)
      const p = enLienzo(e), enAsa = FINO.matches && sobreAsa(p);
      if (!enAsa && !sobreMiImagen(p)) return;
      // doble clic sobre tu imagen en el ordenador: pantalla dividida, o vuelta a la imagen pequeña (en el teléfono, un toque: suelta)
      const ahora = Date.now(); if (FINO.matches && !enAsa && ahora - ultimoToque < 320 && !caja.classList.contains('tres')) { ultimoToque = 0; alternaDividida(); e.preventDefault(); return; } ultimoToque = ahora;
      if (caja.classList.contains('dividida')) { if (!enAsa) return; sueltaDividida(); }
      const vl = vidLocal(), cont = lienzoVid(), CW = cont.clientWidth, CH = cont.clientHeight;
      const W = vl.offsetWidth, H = vl.offsetHeight, L = vl.offsetLeft, T = vl.offsetTop, es = esquinaAsa(vl, CW, CH);
      arrastre = { id: e.pointerId, modo: enAsa ? 'tam' : 'mover', dx: p.x - L, dy: p.y - T, x0: p.x, y0: p.y, movido: false, asp: W / H,
        // en el cambio de tamaño, la esquina contraria al asa no se mueve
        ancX: es.izq ? L + W : L, ancY: es.arriba ? T + H : T, izq: es.izq, arriba: es.arriba };
      try { caja.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    caja.addEventListener('pointermove', (e) => {
      const p = enLienzo(e);
      if (!arrastre || e.pointerId !== arrastre.id) { if (e.pointerType === 'mouse') { const a = sobreAsa(p); caja.classList.toggle('mi-tam', a); caja.classList.toggle('mi-agarre', !a && sobreMiImagen(p) && !caja.classList.contains('dividida')); } return; }
      if (!arrastre.movido && Math.hypot(p.x - arrastre.x0, p.y - arrastre.y0) < 4) return;
      arrastre.movido = true; ultimoToque = 0; caja.classList.add('arrastrando', 'movida');
      const vl = vidLocal(), cont = lienzoVid(), CW = cont.clientWidth, CH = cont.clientHeight;
      if (arrastre.modo === 'tam') {
        const a = arrastre, porX = Math.abs(p.x - a.ancX), porY = Math.abs(p.y - a.ancY) * a.asp;
        let W = limitaAncho(Math.max(porX, porY), CW, CH, vl), H = W / a.asp;
        // que quepa entero desde la esquina fija
        const cabeX = a.izq ? a.ancX - MARGEN : CW - MARGEN - a.ancX, cabeY = (a.arriba ? a.ancY - MARGEN : CH - MARGEN - a.ancY) * a.asp;
        W = Math.max(Math.min(FINO.matches ? 120 : 84, CW / 3), Math.min(W, cabeX, cabeY)); H = W / a.asp;
        caja.style.setProperty('--mi-w', Math.round(W) + 'px'); caja.classList.add('con-tam');
        caja.style.setProperty('--mi-x', Math.round(a.izq ? a.ancX - W : a.ancX) + 'px'); caja.style.setProperty('--mi-y', Math.round(a.arriba ? a.ancY - H : a.ancY) + 'px');
        a.W = W;
      } else {
        const W = vl.offsetWidth, H = vl.offsetHeight;
        const x = Math.max(MARGEN, Math.min(CW - W - MARGEN, p.x - arrastre.dx)), y = Math.max(MARGEN, Math.min(CH - H - MARGEN, p.y - arrastre.dy));
        caja.style.setProperty('--mi-x', Math.round(x) + 'px'); caja.style.setProperty('--mi-y', Math.round(y) + 'px');
      }
      colocaAsa();
    });
    const suelta = (e) => {
      if (!arrastre || e.pointerId !== arrastre.id) return;
      const a = arrastre; arrastre = null; caja.classList.remove('arrastrando');
      try { caja.releasePointerCapture(e.pointerId); } catch (_) {}
      // en el teléfono, un toque en tu imagen pequeña vuelve a partir la pantalla (como el botón de su esquina)
      if (!a.movido && !FINO.matches && a.modo === 'mover' && !caja.classList.contains('dividida') && !caja.classList.contains('tres') && e.type === 'pointerup') { alternaDividida(); return; }
      if (!a.movido) { colocaAsa(); return; }
      const vl = vidLocal(), cont = lienzoVid(), CW = cont.clientWidth, CH = cont.clientHeight;
      // agrandada hasta casi media pantalla: queda la pantalla dividida
      if (a.modo === 'tam' && vl.offsetWidth >= DIVIDE * CW) { const lado = ladoDe(vl.offsetLeft + vl.offsetWidth / 2, vl.offsetTop + vl.offsetHeight / 2, CW, CH); ponDividida(lado); guardaMi({ div: lado }); colocaAsa(); return; }
      guardaSitio(); colocaAsa();
    };
    caja.addEventListener('pointerup', suelta); caja.addEventListener('pointercancel', suelta);
    addEventListener('resize', escala, { passive: true });
    if (FINO.addEventListener) FINO.addEventListener('change', escala);
    escala();
    { const vlx = vidLocal(); if (vlx) { vlx.addEventListener('loadedmetadata', () => miImagen()); vlx.addEventListener('resize', () => colocaAsa()); } }
    return { llamar, recibe, colgar, eligeVoz, seFue, volvio, anade, recibeTercero, esTramo: (sala) => patas.some((L) => L.sala === String(sala)), get terceroSala() { return patas[0] ? patas[0].sala : null; }, get aTres() { return enGrupo(); }, get total() { return estado === 'hablando' ? totalGrupo() : 0; }, get puedeAnadir() { return puedeAnadir(); }, get mezclaEstado() { return mezcla ? mezcla.ctx.state : null; }, get depura() { const r = (L) => ({ clave: L.clave, n: L.n, estado: L.estado || 'principal', sabe: tsabe(L), cam: !!tcam(L), camOn: tcamOn(L), videos: [...L.videos].map(([k, v]) => k + (v.pista ? ':' + v.pista.readyState + (v.pista.muted ? ':muda' : '') : '')), quien: L.quien, reenvios: [...L.reenvios].map(([k, x]) => k + '→' + x.tr.mid + (x.tr.sender.track ? '' : ':vacio')), sig: tpc(L) ? tpc(L).signalingState : '' }); return { tramos: tramos(true).map(r), tiles: [...TILES.keys()] }; }, get estado() { return estado; }, get ocupado() { return ocupado(); }, get voz() { return voz; }, get cambioActivo() { return !!nodo; }, get video() { return video; }, get imagen() { return imagen; } };
  }
  raiz.GuardianaLlamada = { crea, VOCES };
})(typeof window !== 'undefined' ? window : globalThis);
