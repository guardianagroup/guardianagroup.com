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
  const VIDEO = { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30, max: 30 }, facingMode: 'user' };
  const MAX_BPS_VIDEO = 6000000;
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
    let cam = null, video = false, suCamara = true, remotoV = null; // videollamada: mi cámara, si la llamada es con imagen, si la otra persona tiene la cámara encendida y su imagen
    let imagen = 'natural'; try { imagen = localStorage.getItem('gcom-imagen') || 'natural'; } catch (_) {} if (!(imagen in IMAGENES)) imagen = 'natural';
    let proc = null; // la imagen procesada (lienzo): protegida, o aclarada si hay poca luz
    // «Mejorar la luz»: de entrada, en el ordenador sí y en el teléfono no (su cámara ya ajusta la luz y así gasta menos batería)
    let luz = !COMPATIBLE; try { const v = localStorage.getItem('gcom-luz'); if (v !== null) luz = v !== '0'; } catch (_) {}
    let ganancia = 1, medidor = null, vCam = null, ajustes = false;
    let voz = 'natural'; try { voz = localStorage.getItem('gcom-voz') || 'natural'; } catch (_) {} if (!VOCES[voz]) voz = 'natural';
    const ocupado = () => estado !== 'libre';
    // dueño, 28 Oct 2026, 10:28: las opciones de imagen (Difuminada, Mosaico y «Mejorar la luz») solo en la sesión
    // blindada; en la normal, la básica, la imagen va tal cual
    const blindada = () => !!(o.blindada && o.blindada());

    function pinta() {
      caja.classList.toggle('gc-abierta', estado !== 'libre');
      // una llamada que entra se ve siempre en grande; al terminar, la próxima empieza en grande
      if (estado === 'entrante' || estado === 'libre') pequena(false);
      if (estado !== 'hablando' || ajustes) { caja.classList.remove('reposo'); clearTimeout(reposo); }
      $('#ll-entrante').hidden = estado !== 'entrante';
      $('#ll-botones').hidden = estado === 'entrante';
      // dueño, 28 Oct 2026, 12:49 («que sea profesional… como hacen las otras aplicaciones»): el nombre que la otra persona se puso
      // y, si no se puso ninguno, «Llamada encriptada» o «Videollamada encriptada» (antes, «La otra persona»)
      $('#ll-nombre').textContent = o.nombre() || (video ? t('Videollamada encriptada') : t('Llamada encriptada'));
      $('#ll-avatar').textContent = o.inicial();
      caja.setAttribute('aria-label', video ? t('Videollamada') : t('Llamada de voz'));
      $('#ll-camara-caja').hidden = !(video && cam);
      $('#ll-imagenes').hidden = !(video && blindada());
      $('#ll-ajustes-caja').hidden = !video;
      const etq = blindada() ? t('Voz e imagen') : t('Tu voz');
      $('#ll-ajustes-b').setAttribute('aria-label', etq); const se = $('#ll-ajustes-caja span'); if (se) se.textContent = etq;
      caja.classList.toggle('ajustes', ajustes);
      $('#ll-ajustes-b').setAttribute('aria-pressed', String(ajustes));
      document.body.classList.toggle('en-llamada', estado !== 'libre');
      pintaVoces(); pintaImagenes(); pintaVideo(); fondo(); if (estado !== 'libre') requestAnimationFrame(escala);
    }
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
    function pequena(si) {
      caja.classList.toggle('mini', !!si);
      caja.setAttribute('aria-modal', si ? 'false' : 'true');
      fondo();
      if (si) { const x = document.querySelector('#texto'); if (x && !x.closest('[hidden]')) { try { x.focus({ preventScroll: true }); } catch (_) {} } }
    }
    const camaraOn = () => !!(cam && cam.getVideoTracks().some((x) => x.enabled && x.readyState === 'live'));
    // Tonos (dueño, 28 Oct 2026, 10:37): quien llama oye el tono de llamada y a quien llaman le suena un timbre, hasta que
    // contesta, rechaza o cuelga. Se hacen aquí con el audio del navegador, sin archivos. Sin respuesta en 45 s, se cancela.
    // 11:31 (dueño: «que se escuche»): un solo contexto de audio para los tonos, que se desbloquea con el primer toque o tecla
    // en la página (el iPhone solo deja arrancar el audio desde un gesto; así el timbre suena aunque la llamada llegue sin
    // tocar nada), más volumen, 425 Hz para el tono de llamada (el de España y buena parte de América) y vibración en Android.
    const SIN_RESPUESTA_MS = 45000;
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
    function paraTono() {
      clearInterval(tonoReloj); tonoReloj = null; tonoSuena = false;
      for (const n of tonoNodos) { try { n.stop(); } catch (_) {} }
      tonoNodos.clear();
      try { if (raiz.navigator.vibrate) raiz.navigator.vibrate(0); } catch (_) {}
      if (tonoCtx && tonoCtx.state === 'running') tonoCtx.suspend().catch(() => {});
    }
    function tono(tipo) {
      paraTono();
      const ctx = ctxTonos(); if (!ctx) return;
      tonoSuena = true;
      const pita = (frecs, ini, dur, vol) => {
        for (const [f, v] of frecs) {
          const os = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + ini;
          os.type = 'sine'; os.frequency.value = f;
          g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol * v, t0 + 0.015); g.gain.setValueAtTime(vol * v, t0 + dur - 0.04); g.gain.linearRampToValueAtTime(0, t0 + dur);
          os.connect(g).connect(tonoSalida); os.start(t0); os.stop(t0 + dur + 0.05);
          tonoNodos.add(os); os.onended = () => tonoNodos.delete(os);
        }
      };
      const vibra = (patron) => { try { if (raiz.navigator.vibrate) raiz.navigator.vibrate(patron); } catch (_) {} };
      // tono de llamada: 425 Hz durante 1,2 s cada 4 s; timbre: dos notas con un armónico suave, dos veces, cada 2,6 s
      const nota = (f) => [[f, 1], [f * 2, 0.25]];
      const ciclo = tipo === 'saliente' ? () => pita([[425, 1]], 0, 1.2, 0.16)
        : () => { pita(nota(880), 0, 0.2, 0.22); pita(nota(660), 0.24, 0.2, 0.22); pita(nota(880), 0.62, 0.2, 0.22); pita(nota(660), 0.86, 0.2, 0.22); vibra([350, 150, 350]); };
      // si el contexto aún no puede sonar (sin ningún gesto en la página), el ciclo sigue y suena en cuanto la persona toque algo
      ciclo(); tonoReloj = setInterval(() => { if (tonoCtx && tonoCtx.state === 'suspended') tonoCtx.resume().catch(() => {}); ciclo(); }, tipo === 'saliente' ? 4000 : 2600);
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
      if (estado === 'hablando') { reproduce($('#a-remoto')); if (remotoV) reproduce($('#v-remoto')); }
      caja.classList.remove('reposo'); clearTimeout(reposo);
      reposo = setTimeout(() => {
        const foco = document.activeElement && caja.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
        if (estado === 'hablando' && caja.classList.contains('con-video') && !ajustes && !caja.classList.contains('mini') && !foco) caja.classList.add('reposo');
      }, 3000);
    }
    for (const ev of ['pointermove', 'pointerdown', 'keydown', 'touchstart']) caja.addEventListener(ev, despierta, { passive: true });
    function pintaVideo() {
      const veoSuyo = !!(video && remotoV && suCamara), veoMio = !!(video && camaraOn());
      $('#ll-videos').hidden = !(veoSuyo || veoMio);
      $('#v-remoto').hidden = !veoSuyo; $('#v-local').hidden = !veoMio;
      const antes = caja.classList.contains('con-video');
      caja.classList.toggle('con-video', veoSuyo);
      if (veoSuyo && !antes) despierta(); else if (!veoSuyo) { caja.classList.remove('reposo'); clearTimeout(reposo); }
      caja.classList.toggle('solo-mia', !veoSuyo && veoMio);
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
    const mmss = (ms) => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

    function aplicaVoz() {
      if (!nodo || !ctx) return;
      const v = VOCES[voz] || VOCES.natural;
      nodo.parameters.get('proporcion').setValueAtTime(v.k, ctx.currentTime);
      nodo.parameters.get('robot').setValueAtTime(v.robot, ctx.currentTime);
    }
    function eligeVoz(v) {
      if (!VOCES[v]) return; voz = v; try { localStorage.setItem('gcom-voz', v); } catch (_) {}
      aplicaVoz(); pintaVoces();
    }
    // Micrófono → cambio de voz (AudioWorklet) → lo que se envía. Sin AudioWorklet, la voz va tal cual y se dice.
    // Cámara y micrófono en un solo permiso (en el iPhone, pedirlos por separado puede dejar mudo el primero); si la cámara
    // no se puede usar, la llamada sigue solo con voz.
    async function medios(conVideo) {
      if (conVideo) {
        try { const s = await navigator.mediaDevices.getUserMedia({ audio: AUDIO, video: VIDEO }); mic = new MediaStream(s.getAudioTracks()); cam = new MediaStream(s.getVideoTracks()); }
        catch (_) { cam = null; }
        if (cam) { preparaCamara(); return microfono(); }
        o.aviso && o.aviso(t('Sin permiso para la cámara: la llamada sigue solo con voz.'));
      }
      return microfono();
    }
    async function microfono() {
      if (!mic) mic = await navigator.mediaDevices.getUserMedia({ audio: AUDIO });
      try {
        // a 48 kHz, como Opus: sin pasos de remuestreo de más (si el navegador no lo admite, a su frecuencia)
        const AC = raiz.AudioContext || raiz.webkitAudioContext;
        try { ctx = new AC({ latencyHint: 'interactive', sampleRate: 48000 }); } catch (_) { ctx = new AC({ latencyHint: 'interactive' }); }
        await ctx.audioWorklet.addModule(VOZ_JS);
        const src = ctx.createMediaStreamSource(mic);
        nodo = new AudioWorkletNode(ctx, 'guardiana-voz', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
        const dst = ctx.createMediaStreamDestination();
        src.connect(nodo).connect(dst);
        aplicaVoz();
        if (ctx.state === 'suspended') await ctx.resume();
        envio = dst.stream;
      } catch (_) {
        nodo = null; if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
        envio = mic; if (voz !== 'natural') o.aviso && o.aviso(t('Este navegador no permite cambiar la voz: la llamada sigue con tu voz natural.'));
      }
      return envio;
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
      if (modoImagen() === 'cruda' && proc) { const viejo = proc; proc = null; setTimeout(() => viejo.parar(), 400); }
      const vl = $('#v-local'); if (!vl.srcObject || vl.srcObject.getVideoTracks()[0] !== salida) { vl.srcObject = new MediaStream([salida]); reproduce(vl); } // te ves como te ve la otra persona
    }
    function eligeLuz() {
      luz = !luz; try { localStorage.setItem('gcom-luz', luz ? '1' : '0'); } catch (_) {}
      if (!luz) { ganancia = 1; aplicaImagen(); }
      pintaImagenes();
    }
    function eligeImagen(m) {
      if (!(m in IMAGENES)) return; imagen = m; try { localStorage.setItem('gcom-imagen', m); } catch (_) {}
      aplicaImagen(); pintaImagenes();
    }
    // el audio (con el cambio de voz) y la imagen, en el mismo flujo para que vayan sincronizados
    function agregaPistas() {
      const pi = pistaImagen(); if (pi) { const vl = $('#v-local'); vl.srcObject = new MediaStream([pi]); reproduce(vl); }
      const flujo = new MediaStream(envio.getAudioTracks().concat(pi ? [pi] : []));
      flujo.getTracks().forEach((x) => pc.addTrack(x, flujo));
      if (video && !cam) { try { pc.addTransceiver('video', { direction: 'recvonly' }); } catch (_) {} } // sin cámara propia, pero sí la imagen de la otra persona
    }
    // Códecs de imagen por orden de calidad para el mismo caudal: VP9, H.264, VP8 y AV1 (este, el último: exige mucho al procesador)
    function prefiereCodecs(perfil) {
      try {
        const caps = raiz.RTCRtpReceiver && RTCRtpReceiver.getCapabilities && RTCRtpReceiver.getCapabilities('video'); if (!caps || !caps.codecs) return;
        // solo códecs que este equipo sabe también enviar (algunos Android reciben H.264 pero no lo codifican)
        const env = raiz.RTCRtpSender && RTCRtpSender.getCapabilities && RTCRtpSender.getCapabilities('video');
        const tipo = (c) => String(c.mimeType).toLowerCase(), auxiliar = /\/(rtx|red|ulpfec|flexfec)$/i;
        const envia = env && env.codecs ? new Set(env.codecs.map(tipo)) : null;
        if (envia) { const f = caps.codecs.filter((c) => auxiliar.test(c.mimeType) || envia.has(tipo(c))); if (f.some((c) => !auxiliar.test(c.mimeType))) caps.codecs = f; }
        const pesos = perfil === 'escritorio' ? { 'video/vp9': 0, 'video/h264': 1, 'video/vp8': 2, 'video/av1': 3 } : { 'video/h264': 0, 'video/vp8': 1, 'video/vp9': 2, 'video/av1': 3 };
        const peso = (c) => pesos[String(c.mimeType).toLowerCase()] ?? 4;
        const orden = caps.codecs.slice().sort((a, b) => peso(a) - peso(b));
        for (const tr of pc.getTransceivers()) { const k = (tr.sender.track && tr.sender.track.kind) || (tr.receiver.track && tr.receiver.track.kind); if (k === 'video' && tr.setCodecPreferences) tr.setCodecPreferences(orden); }
      } catch (_) {}
    }
    // Opus a 48 kHz, mono, hasta 96 kb/s (antes, unos 32), con corrección de errores (FEC) para los paquetes que se pierden y
    // sin cortes en los silencios (DTX). Cada lado lo pide en su descripción, así vale para los dos sentidos.
    function altaFidelidad(sdp) {
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
      const remoto = new MediaStream();
      pc.ontrack = (e) => {
        if (e.track.kind === 'video') { remotoV = new MediaStream([e.track]); const vr = $('#v-remoto'); vr.srcObject = remotoV; reproduce(vr); e.track.onunmute = () => { reproduce(vr); pintaVideo(); }; pintaVideo(); return; }
        remoto.addTrack(e.track); const ar = $('#a-remoto'); if (ar.srcObject !== remoto) ar.srcObject = remoto; reproduce(ar);
        e.track.onunmute = () => reproduce(ar);
      };
      pc.onicecandidate = (e) => { if (e.candidate) o.manda({ acto: 'ice', id: idLlamada, cand: e.candidate.toJSON() }); };
      pc.onconnectionstatechange = () => {
        if (!pc) return;
        if (pc.connectionState === 'connected') { paraTono(); if (estado !== 'hablando') { estado = 'hablando'; iniciada = Date.now(); di(''); clearInterval(reloj); reloj = setInterval(() => { tiempo.textContent = mmss(Date.now() - iniciada); }, 500); mideCalidad(); topeAudio(); if (video) topeVideo(); pinta(); } }
        else if (pc.connectionState === 'failed') termina('fallo');
        else if (pc.connectionState === 'disconnected') di(t('Conexión interrumpida, intentando recuperarla…'), true);
      };
    }
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
            if (r.type === 'outbound-rtp' && r.kind === 'video') { diag.envia = (r.frameWidth || 0) + 'x' + (r.frameHeight || 0) + '@' + Math.round(r.framesPerSecond || 0); diag.limite = r.qualityLimitationReason; diag.codec = (st.get(r.codecId) || {}).mimeType; }
            if (r.type === 'inbound-rtp' && r.kind === 'video') diag.recibe = (r.frameWidth || 0) + 'x' + (r.frameHeight || 0) + '@' + Math.round(r.framesPerSecond || 0);
          });
          diag.luz = Math.round(ganancia * 100) / 100; diag.modo = modoImagen();
          calidad.dataset.diag = JSON.stringify(diag);
          st.forEach((r) => { if (r.type === 'candidate-pair' && r.state === 'succeeded' && r.currentRoundTripTime != null) rtt = Math.round(r.currentRoundTripTime * 1000); if (r.type === 'inbound-rtp' && r.kind === 'audio') { perd += r.packetsLost || 0; rec += r.packetsReceived || 0; } if (r.type === 'inbound-rtp' && r.kind === 'video') { vw = r.frameWidth || vw; vh = r.frameHeight || vh; fps = r.framesPerSecond || fps; } });
          const p = rec + perd ? perd / (rec + perd) : 0, nivel = p < 0.01 && (rtt == null || rtt < 250) ? t('excelente') : p < 0.05 ? t('buena') : t('débil');
          // con imagen, la resolución y las imágenes por segundo que llegan de verdad
          // si la imagen de la otra persona no llega, se dice (antes, en el teléfono, solo se veía su inicial o negro)
          const vr = $('#v-remoto'), NO_LLEGA = t('La imagen de la otra persona no llega.');
          if (video && suCamara && iniciada && Date.now() - iniciada > 8000 && !(vr && vr.videoWidth)) di(NO_LLEGA, true); else if (paso.textContent === NO_LLEGA) di('');
          calidad.textContent = t('Calidad estimada') + ': ' + nivel + (rtt != null ? ' · ' + rtt + ' ms' : '') + (video && vw && suCamara ? ' · ' + t('imagen') + ' ' + vw + '×' + vh + (fps ? ' · ' + Math.round(fps) + ' fps' : '') : '');
        } catch (_) {}
      }, 2000);
    }
    // dentro del toque de la persona (llamar o contestar): el iPhone deja después arrancar el sonido y la imagen solos
    function desbloquea() { for (const id of ['#a-remoto', '#v-remoto']) { const el = $(id); if (el) reproduce(el); } }
    async function llamar(conVideo) {
      if (ocupado()) return;
      if (!o.puede()) { o.aviso && o.aviso(t('Para llamar, la otra persona tiene que estar conectada y la sesión, verificada.')); return; }
      if (!(o.ice() || []).length && !LOCAL) { o.aviso && o.aviso(t('El servicio de llamadas no está disponible ahora mismo.')); return; }
      video = !!conVideo && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); suCamara = true; remotoV = null;
      desbloquea();
      estado = 'saliente'; idLlamada = Math.random().toString(36).slice(2, 10); colgoYo = false; tiempo.textContent = '00:00'; calidad.textContent = ''; pinta();
      di(video ? t('Pidiendo la cámara y el micrófono…') : t('Pidiendo el micrófono…'));
      try { await medios(video); } catch (_) { di(t('Sin permiso para el micrófono.'), true); return termina('sin-medios', 1800); }
      nuevaPc();
      agregaPistas(); if (video) prefiereCodecs(EQUIPO);
      di(t('Llamando…'));
      const of = await pc.createOffer(); await pc.setLocalDescription({ type: of.type, sdp: altaFidelidad(of.sdp) });
      o.manda({ acto: 'oferta', id: idLlamada, sdp: pc.localDescription.sdp, video: video ? 1 : undefined, equipo: EQUIPO });
      if (estado === 'saliente') { tono('saliente'); esperaRespuesta(true); }
      pinta();
    }
    async function recibe(m) {
      if (!m || !m.acto) return;
      if (m.acto === 'oferta') {
        if (typeof m.sdp !== 'string' || m.sdp.length > 20000) return;
        if (ocupado()) { if (m.id !== idLlamada) o.manda({ acto: 'ocupado', id: m.id }); return; }
        ofertaEntrante = m; idLlamada = String(m.id || '').slice(0, 16); estado = 'entrante'; colgoYo = false; tiempo.textContent = '00:00'; calidad.textContent = '';
        video = m.video === 1 || /\nm=video /.test(m.sdp); suCamara = true; remotoV = null;
        di(video ? t('Videollamada entrante') : t('Llamada entrante')); pinta(); tono('entrante'); esperaRespuesta(false);
        return;
      }
      if (m.id && idLlamada && m.id !== idLlamada) return;
      if (m.acto === 'respuesta' && pc && typeof m.sdp === 'string') { paraTono(); clearTimeout(sinRespuesta); await pc.setRemoteDescription({ type: 'answer', sdp: m.sdp }); for (const c of pendientes) { try { await pc.addIceCandidate(c); } catch (_) {} } pendientes = []; di(t('Conectando…')); if (video) topeVideo(); return; }
      if (m.acto === 'camara') { suCamara = !!m.on; pintaVideo(); return; }
      if (m.acto === 'ice' && m.cand && typeof m.cand === 'object') { if (pc && pc.remoteDescription) { try { await pc.addIceCandidate(m.cand); } catch (_) {} } else if (pendientes.length < 64) pendientes.push(m.cand); return; }
      if (m.acto === 'colgar') { if (estado !== 'libre') termina(estado === 'hablando' ? 'fin' : 'rechazada'); return; }
      if (m.acto === 'ocupado') { di(t('Ocupado: la otra persona está en otra llamada.'), true); termina('ocupado', 1800); }
    }
    async function contestar() {
      if (estado !== 'entrante' || !ofertaEntrante) return;
      const m = ofertaEntrante; ofertaEntrante = null; estado = 'conectando'; paraTono(); clearTimeout(sinRespuesta); desbloquea(); pinta();
      di(video ? t('Pidiendo la cámara y el micrófono…') : t('Pidiendo el micrófono…'));
      try { await medios(video); } catch (_) { di(t('Sin permiso para el micrófono.'), true); o.manda({ acto: 'colgar', id: idLlamada }); return termina('sin-medios', 1800); }
      nuevaPc();
      const pi = pistaImagen(); if (pi) { const vl = $('#v-local'); vl.srcObject = new MediaStream([pi]); reproduce(vl); }
      const flujo = new MediaStream(envio.getAudioTracks().concat(pi ? [pi] : []));
      flujo.getTracks().forEach((x) => pc.addTrack(x, flujo));
      await pc.setRemoteDescription({ type: 'offer', sdp: m.sdp });
      // la respuesta decide el códec de los dos sentidos: si cualquiera de los dos es teléfono o Safari, los compatibles
      if (video) prefiereCodecs(EQUIPO === 'compatible' || m.equipo === 'compatible' ? 'compatible' : 'escritorio');
      for (const c of pendientes) { try { await pc.addIceCandidate(c); } catch (_) {} } pendientes = [];
      const an = await pc.createAnswer(); await pc.setLocalDescription({ type: an.type, sdp: altaFidelidad(an.sdp) });
      o.manda({ acto: 'respuesta', id: idLlamada, sdp: pc.localDescription.sdp });
      if (video) { topeVideo(); if (!cam) o.manda({ acto: 'camara', id: idLlamada, on: false }); }
      pinta();
      di(t('Conectando…'));
    }
    function colgar() { if (estado === 'libre') return; colgoYo = true; o.manda({ acto: 'colgar', id: idLlamada }); termina(estado === 'hablando' ? 'fin' : estado === 'entrante' ? 'rechazada' : 'cancelada'); }
    function termina(por, espera) {
      const dur = iniciada ? Date.now() - iniciada : 0, era = estado, conImagen = video;
      paraTono(); clearTimeout(sinRespuesta);
      clearInterval(reloj); reloj = null; clearInterval(sondeo); sondeo = null;
      if (pc) { try { pc.close(); } catch (_) {} pc = null; }
      for (const s of [mic, envio, cam]) if (s) s.getTracks().forEach((x) => x.stop());
      if (proc) { proc.parar(); proc = null; }
      clearInterval(medidor); medidor = null; if (vCam) { vCam.srcObject = null; vCam.remove(); vCam = null; } ganancia = 1; ajustes = false;
      mic = null; envio = null; cam = null; nodo = null; if (ctx) { try { ctx.close(); } catch (_) {} ctx = null; }
      $('#a-remoto').srcObject = null; $('#v-remoto').srcObject = null; $('#v-local').srcObject = null; remotoV = null; suCamara = true; video = false;
      const bc = $('#ll-camara'); if (bc) bc.setAttribute('aria-pressed', 'false');
      pendientes = []; ofertaEntrante = null; iniciada = 0;
      const silencio = $('#ll-silenciar'); if (silencio) silencio.setAttribute('aria-pressed', 'false');
      if (por === 'fin') di(t('Llamada terminada'));
      else if (por === 'fallo') di(t('No se pudo mantener la conexión.'), true);
      else if (por === 'rechazada' && !colgoYo) di(t('La otra persona no ha contestado.'));
      estado = 'cerrando'; pinta();
      setTimeout(() => { estado = 'libre'; idLlamada = null; pinta(); }, espera || (por === 'fin' || por === 'cancelada' ? 600 : 1500));
      if (o.fin && era !== 'libre') o.fin({ por, duracion: dur, saliente: era === 'saliente' || (era === 'hablando' && colgoYo), voz: voz !== 'natural', video: conImagen });
    }
    $('#ll-colgar').addEventListener('click', colgar);
    $('#ll-rechazar').addEventListener('click', colgar);
    $('#ll-contestar').addEventListener('click', () => { contestar().catch(() => termina('fallo')); });
    $('#ll-silenciar').addEventListener('click', (e) => { const b = e.currentTarget; const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); for (const s of [envio, mic]) if (s) s.getAudioTracks().forEach((x) => { x.enabled = !on; }); });
    for (const b of document.querySelectorAll('#ll-voces [data-voz]')) b.addEventListener('click', () => eligeVoz(b.dataset.voz));
    for (const b of document.querySelectorAll('#ll-imagenes [data-imagen]')) b.addEventListener('click', () => eligeImagen(b.dataset.imagen));
    $('#ll-luz').addEventListener('click', eligeLuz);
    $('#ll-ajustes-b').addEventListener('click', () => { ajustes = !ajustes; pinta(); });
    // cámara encendida o apagada durante la videollamada; la otra persona lo sabe por el canal encriptado
    $('#ll-camara').addEventListener('click', () => { if (!cam) return; const on = !camaraOn(); cam.getVideoTracks().forEach((x) => { x.enabled = on; }); o.manda({ acto: 'camara', id: idLlamada, on }); pintaVideo(); });
    $('#ll-mini').addEventListener('click', () => pequena(true));
    $('#ll-volver').addEventListener('click', () => pequena(false));
    $('#ll-videos').addEventListener('click', () => { if (caja.classList.contains('mini')) pequena(false); });
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
    const MI_IMG = 'gcom-mi-imagen', MARGEN = 10, DIVIDE = 0.45;
    let arrastre = null, ultimoToque = 0;
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
      if (mi.div && CW) { const hz = CW >= CH, mapa = hz ? { arriba: 'izq', abajo: 'der' } : { izq: 'arriba', der: 'abajo' }; ponDividida(mapa[mi.div] || mi.div); }
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
      if (e.button > 0 || e.target.closest('button, a, input, label, .ll-ajustes')) return;
      const p = enLienzo(e), enAsa = sobreAsa(p);
      if (!enAsa && !sobreMiImagen(p)) return;
      // doble clic o doble toque sobre tu imagen: pantalla dividida, o vuelta a la imagen pequeña
      const ahora = Date.now(); if (!enAsa && ahora - ultimoToque < 320) { ultimoToque = 0; alternaDividida(); e.preventDefault(); return; } ultimoToque = ahora;
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
    return { llamar, recibe, colgar, eligeVoz, get estado() { return estado; }, get ocupado() { return ocupado(); }, get voz() { return voz; }, get cambioActivo() { return !!nodo; }, get video() { return video; }, get imagen() { return imagen; } };
  }
  raiz.GuardianaLlamada = { crea, VOCES };
})(typeof window !== 'undefined' ? window : globalThis);
