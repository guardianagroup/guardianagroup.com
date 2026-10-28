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

  function crea(o) {
    // o: { ice(), manda(m), puede(), nombre(), inicial(), fin(info), t(s), aviso(s) }
    const t = (s) => (o.t ? o.t(s) : s);
    const caja = $('#llamada'), paso = $('#ll-paso'), tiempo = $('#ll-tiempo'), calidad = $('#ll-calidad');
    let pc = null, mic = null, envio = null, ctx = null, nodo = null, estado = 'libre', iniciada = 0, reloj = null, pendientes = [], ofertaEntrante = null, idLlamada = null, colgoYo = false, sondeo = null;
    let cam = null, video = false, suCamara = true, remotoV = null; // videollamada: mi cámara, si la llamada es con imagen, si la otra persona tiene la cámara encendida y su imagen
    let imagen = 'natural'; try { imagen = localStorage.getItem('gcom-imagen') || 'natural'; } catch (_) {} if (!(imagen in IMAGENES)) imagen = 'natural';
    let proc = null; // la imagen procesada (lienzo): protegida, o aclarada si hay poca luz
    let luz = true; try { luz = localStorage.getItem('gcom-luz') !== '0'; } catch (_) {}
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
      $('#ll-entrante').hidden = estado !== 'entrante';
      $('#ll-botones').hidden = estado === 'entrante';
      $('#ll-nombre').textContent = o.nombre();
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
      pintaVoces(); pintaImagenes(); pintaVideo();
    }
    // La llamada en pequeño (dueño, 28 Oct 2026: «seguir en llamada y que aparezca el chat»): una tarjeta en una esquina
    // con la imagen, el tiempo y los botones, y el chat libre debajo para escribir y mandar archivos.
    function pequena(si) {
      caja.classList.toggle('mini', !!si);
      caja.setAttribute('aria-modal', si ? 'false' : 'true');
      if (si) { const x = document.querySelector('#texto'); if (x && !x.closest('[hidden]')) { try { x.focus({ preventScroll: true }); } catch (_) {} } }
    }
    const camaraOn = () => !!(cam && cam.getVideoTracks().some((x) => x.enabled && x.readyState === 'live'));
    function pintaVideo() {
      const veoSuyo = !!(video && remotoV && suCamara), veoMio = !!(video && camaraOn());
      $('#ll-videos').hidden = !(veoSuyo || veoMio);
      $('#v-remoto').hidden = !veoSuyo; $('#v-local').hidden = !veoMio;
      caja.classList.toggle('con-video', veoSuyo);
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
    async function microfono() {
      mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
      try {
        ctx = new (raiz.AudioContext || raiz.webkitAudioContext)({ latencyHint: 'interactive' });
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
    async function camara() {
      cam = await navigator.mediaDevices.getUserMedia({ video: VIDEO });
      for (const x of cam.getVideoTracks()) {
        try { x.contentHint = 'motion'; } catch (_) {}
        // exposición, balance de blancos y enfoque automáticos, si la cámara los admite
        try {
          const cap = x.getCapabilities ? x.getCapabilities() : {}, adv = [];
          for (const k of ['exposureMode', 'whiteBalanceMode', 'focusMode']) if ((cap[k] || []).includes('continuous')) adv.push({ [k]: 'continuous' });
          if (adv.length) x.applyConstraints({ advanced: adv }).catch(() => {});
        } catch (_) {}
      }
      vCam = document.createElement('video'); vCam.muted = true; vCam.playsInline = true; vCam.srcObject = new MediaStream(cam.getVideoTracks()); vCam.play().catch(() => {});
      arrancaMedidor();
      return cam;
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
        const oscura = y < LUZ_OSCURA || (ganancia > 1.01 && y < LUZ_META);
        const quiere = luz && oscura && blindada() ? Math.min(LUZ_MAX, Math.max(1, LUZ_META / Math.max(y, 0.05))) : 1;
        const antes = ganancia > 1.001;
        ganancia += (quiere - ganancia) * 0.4; if (Math.abs(ganancia - 1) < 0.02) ganancia = 1;
        if (antes !== (ganancia > 1.001)) aplicaImagen();
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
      const dibuja = () => {
        if (!vivo || !vCam || vCam.readyState < 2) return;
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
      return { modo, track: salida, parar() { vivo = false; clearInterval(reloj); try { salida.stop(); } catch (_) {} } };
    }
    // la pista de imagen que sale: protegida («Tu imagen»), aclarada (poca luz) o la cámara tal cual
    const modoImagen = () => (!blindada() ? 'cruda' : imagen !== 'natural' ? 'protegida' : ganancia > 1.001 ? 'aclarada' : 'cruda');
    function pistaImagen() {
      if (!cam) return null;
      const m = modoImagen();
      if (m === 'cruda') return cam.getVideoTracks()[0] || null;
      if (!proc || proc.modo !== m) { const viejo = proc; proc = lienzo(m); if (viejo) setTimeout(() => viejo.parar(), 400); }
      return proc.track;
    }
    async function aplicaImagen() {
      if (!cam) return;
      const salida = pistaImagen(); if (!salida) return;
      const s = pc && pc.getSenders().find((x) => x.track && x.track.kind === 'video');
      if (s && s.track !== salida) { try { await s.replaceTrack(salida); } catch (_) {} }
      if (modoImagen() === 'cruda' && proc) { const viejo = proc; proc = null; setTimeout(() => viejo.parar(), 400); }
      $('#v-local').srcObject = new MediaStream([salida]); // te ves como te ve la otra persona
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
      const pi = pistaImagen(); if (pi) $('#v-local').srcObject = new MediaStream([pi]);
      const flujo = new MediaStream(envio.getAudioTracks().concat(pi ? [pi] : []));
      flujo.getTracks().forEach((x) => pc.addTrack(x, flujo));
      if (video && !cam) { try { pc.addTransceiver('video', { direction: 'recvonly' }); } catch (_) {} } // sin cámara propia, pero sí la imagen de la otra persona
    }
    // Códecs de imagen por orden de calidad para el mismo caudal: VP9, H.264, VP8 y AV1 (este, el último: exige mucho al procesador)
    function prefiereCodecs() {
      try {
        const caps = raiz.RTCRtpReceiver && RTCRtpReceiver.getCapabilities && RTCRtpReceiver.getCapabilities('video'); if (!caps || !caps.codecs) return;
        const peso = (c) => ({ 'video/vp9': 0, 'video/h264': 1, 'video/vp8': 2, 'video/av1': 3 })[String(c.mimeType).toLowerCase()] ?? 4;
        const orden = caps.codecs.slice().sort((a, b) => peso(a) - peso(b));
        for (const tr of pc.getTransceivers()) { const k = (tr.sender.track && tr.sender.track.kind) || (tr.receiver.track && tr.receiver.track.kind); if (k === 'video' && tr.setCodecPreferences) tr.setCodecPreferences(orden); }
      } catch (_) {}
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
        if (e.track.kind === 'video') { remotoV = new MediaStream([e.track]); $('#v-remoto').srcObject = remotoV; e.track.onunmute = pintaVideo; pintaVideo(); return; }
        remoto.addTrack(e.track); $('#a-remoto').srcObject = remoto;
      };
      pc.onicecandidate = (e) => { if (e.candidate) o.manda({ acto: 'ice', id: idLlamada, cand: e.candidate.toJSON() }); };
      pc.onconnectionstatechange = () => {
        if (!pc) return;
        if (pc.connectionState === 'connected') { if (estado !== 'hablando') { estado = 'hablando'; iniciada = Date.now(); di(''); clearInterval(reloj); reloj = setInterval(() => { tiempo.textContent = mmss(Date.now() - iniciada); }, 500); mideCalidad(); if (video) topeVideo(); pinta(); } }
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
          calidad.textContent = t('Calidad estimada') + ': ' + nivel + (rtt != null ? ' · ' + rtt + ' ms' : '') + (video && vw && suCamara ? ' · ' + t('imagen') + ' ' + vw + '×' + vh + (fps ? ' · ' + Math.round(fps) + ' fps' : '') : '');
        } catch (_) {}
      }, 2000);
    }
    async function llamar(conVideo) {
      if (ocupado()) return;
      if (!o.puede()) { o.aviso && o.aviso(t('Para llamar, la otra persona tiene que estar conectada y la sesión, verificada.')); return; }
      if (!(o.ice() || []).length && !LOCAL) { o.aviso && o.aviso(t('El servicio de llamadas no está disponible ahora mismo.')); return; }
      video = !!conVideo && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); suCamara = true; remotoV = null;
      estado = 'saliente'; idLlamada = Math.random().toString(36).slice(2, 10); colgoYo = false; tiempo.textContent = '00:00'; calidad.textContent = ''; pinta();
      di(video ? t('Pidiendo la cámara y el micrófono…') : t('Pidiendo el micrófono…'));
      try { await microfono(); } catch (_) { di(t('Sin permiso para el micrófono.'), true); return termina('sin-medios', 1800); }
      if (video) { try { await camara(); } catch (_) { cam = null; o.aviso && o.aviso(t('Sin permiso para la cámara: la llamada sigue solo con voz.')); } }
      nuevaPc();
      agregaPistas(); if (video) prefiereCodecs();
      di(t('Llamando…'));
      const of = await pc.createOffer(); await pc.setLocalDescription(of);
      o.manda({ acto: 'oferta', id: idLlamada, sdp: pc.localDescription.sdp, video: video ? 1 : undefined });
      pinta();
    }
    async function recibe(m) {
      if (!m || !m.acto) return;
      if (m.acto === 'oferta') {
        if (typeof m.sdp !== 'string' || m.sdp.length > 20000) return;
        if (ocupado()) { if (m.id !== idLlamada) o.manda({ acto: 'ocupado', id: m.id }); return; }
        ofertaEntrante = m; idLlamada = String(m.id || '').slice(0, 16); estado = 'entrante'; colgoYo = false; tiempo.textContent = '00:00'; calidad.textContent = '';
        video = m.video === 1 || /\nm=video /.test(m.sdp); suCamara = true; remotoV = null;
        di(video ? t('Videollamada entrante') : t('Llamada entrante')); pinta(); o.suena && o.suena();
        return;
      }
      if (m.id && idLlamada && m.id !== idLlamada) return;
      if (m.acto === 'respuesta' && pc && typeof m.sdp === 'string') { await pc.setRemoteDescription({ type: 'answer', sdp: m.sdp }); for (const c of pendientes) { try { await pc.addIceCandidate(c); } catch (_) {} } pendientes = []; di(t('Conectando…')); if (video) topeVideo(); return; }
      if (m.acto === 'camara') { suCamara = !!m.on; pintaVideo(); return; }
      if (m.acto === 'ice' && m.cand && typeof m.cand === 'object') { if (pc && pc.remoteDescription) { try { await pc.addIceCandidate(m.cand); } catch (_) {} } else if (pendientes.length < 64) pendientes.push(m.cand); return; }
      if (m.acto === 'colgar') { if (estado !== 'libre') termina(estado === 'hablando' ? 'fin' : 'rechazada'); return; }
      if (m.acto === 'ocupado') { di(t('Ocupado: la otra persona está en otra llamada.'), true); termina('ocupado', 1800); }
    }
    async function contestar() {
      if (estado !== 'entrante' || !ofertaEntrante) return;
      const m = ofertaEntrante; ofertaEntrante = null; estado = 'conectando'; pinta();
      di(video ? t('Pidiendo la cámara y el micrófono…') : t('Pidiendo el micrófono…'));
      try { await microfono(); } catch (_) { di(t('Sin permiso para el micrófono.'), true); o.manda({ acto: 'colgar', id: idLlamada }); return termina('sin-medios', 1800); }
      if (video) { try { await camara(); } catch (_) { cam = null; o.aviso && o.aviso(t('Sin permiso para la cámara: la llamada sigue solo con voz.')); } }
      nuevaPc();
      const pi = pistaImagen(); if (pi) $('#v-local').srcObject = new MediaStream([pi]);
      const flujo = new MediaStream(envio.getAudioTracks().concat(pi ? [pi] : []));
      flujo.getTracks().forEach((x) => pc.addTrack(x, flujo));
      await pc.setRemoteDescription({ type: 'offer', sdp: m.sdp });
      if (video) prefiereCodecs();
      for (const c of pendientes) { try { await pc.addIceCandidate(c); } catch (_) {} } pendientes = [];
      const an = await pc.createAnswer(); await pc.setLocalDescription(an);
      o.manda({ acto: 'respuesta', id: idLlamada, sdp: pc.localDescription.sdp });
      if (video) { topeVideo(); if (!cam) o.manda({ acto: 'camara', id: idLlamada, on: false }); }
      pinta();
      di(t('Conectando…'));
    }
    function colgar() { if (estado === 'libre') return; colgoYo = true; o.manda({ acto: 'colgar', id: idLlamada }); termina(estado === 'hablando' ? 'fin' : estado === 'entrante' ? 'rechazada' : 'cancelada'); }
    function termina(por, espera) {
      const dur = iniciada ? Date.now() - iniciada : 0, era = estado, conImagen = video;
      clearInterval(reloj); reloj = null; clearInterval(sondeo); sondeo = null;
      if (pc) { try { pc.close(); } catch (_) {} pc = null; }
      for (const s of [mic, envio, cam]) if (s) s.getTracks().forEach((x) => x.stop());
      if (proc) { proc.parar(); proc = null; }
      clearInterval(medidor); medidor = null; if (vCam) { vCam.srcObject = null; vCam = null; } ganancia = 1; ajustes = false;
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
    return { llamar, recibe, colgar, eligeVoz, get estado() { return estado; }, get ocupado() { return ocupado(); }, get voz() { return voz; }, get cambioActivo() { return !!nodo; }, get video() { return video; }, get imagen() { return imagen; } };
  }
  raiz.GuardianaLlamada = { crea, VOCES };
})(typeof window !== 'undefined' ? window : globalThis);
