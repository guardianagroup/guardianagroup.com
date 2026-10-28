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
  // de 6 Mb/s para la imagen (el servicio de llamadas admite unos 12 Mb/s por sentido) y, si falta red, se conserva la
  // resolución antes que la fluidez. La imagen va como el audio: DTLS-SRTP y siempre por el relé.
  const VIDEO = { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30, max: 30 }, facingMode: 'user' };
  const MAX_BPS_VIDEO = 6000000;

  function crea(o) {
    // o: { ice(), manda(m), puede(), nombre(), inicial(), fin(info), t(s), aviso(s) }
    const t = (s) => (o.t ? o.t(s) : s);
    const caja = $('#llamada'), paso = $('#ll-paso'), tiempo = $('#ll-tiempo'), calidad = $('#ll-calidad');
    let pc = null, mic = null, envio = null, ctx = null, nodo = null, estado = 'libre', iniciada = 0, reloj = null, pendientes = [], ofertaEntrante = null, idLlamada = null, colgoYo = false, sondeo = null;
    let cam = null, video = false, suCamara = true, remotoV = null; // videollamada: mi cámara, si la llamada es con imagen, si la otra persona tiene la cámara encendida y su imagen
    let voz = 'natural'; try { voz = localStorage.getItem('gcom-voz') || 'natural'; } catch (_) {} if (!VOCES[voz]) voz = 'natural';
    const ocupado = () => estado !== 'libre';

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
      document.body.classList.toggle('en-llamada', estado !== 'libre');
      pintaVoces(); pintaVideo();
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
      for (const x of cam.getVideoTracks()) { try { x.contentHint = 'detail'; } catch (_) {} }
      $('#v-local').srcObject = cam;
      return cam;
    }
    // el audio (con el cambio de voz) y la imagen, en el mismo flujo para que vayan sincronizados
    function agregaPistas() {
      const flujo = new MediaStream(envio.getAudioTracks().concat(cam ? cam.getVideoTracks() : []));
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
          p.degradationPreference = 'maintain-resolution';
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
          (await pc.getStats()).forEach((r) => { if (r.type === 'candidate-pair' && r.state === 'succeeded' && r.currentRoundTripTime != null) rtt = Math.round(r.currentRoundTripTime * 1000); if (r.type === 'inbound-rtp' && r.kind === 'audio') { perd += r.packetsLost || 0; rec += r.packetsReceived || 0; } if (r.type === 'inbound-rtp' && r.kind === 'video') { vw = r.frameWidth || vw; vh = r.frameHeight || vh; fps = r.framesPerSecond || fps; } });
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
      const flujo = new MediaStream(envio.getAudioTracks().concat(cam ? cam.getVideoTracks() : []));
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
    // cámara encendida o apagada durante la videollamada; la otra persona lo sabe por el canal encriptado
    $('#ll-camara').addEventListener('click', () => { if (!cam) return; const on = !camaraOn(); cam.getVideoTracks().forEach((x) => { x.enabled = on; }); o.manda({ acto: 'camara', id: idLlamada, on }); pintaVideo(); });
    $('#ll-mini').addEventListener('click', () => pequena(true));
    $('#ll-volver').addEventListener('click', () => pequena(false));
    $('#ll-videos').addEventListener('click', () => { if (caja.classList.contains('mini')) pequena(false); });
    addEventListener('beforeunload', () => { if (estado !== 'libre') { try { o.manda({ acto: 'colgar', id: idLlamada }); } catch (_) {} } });
    pintaVoces();
    return { llamar, recibe, colgar, eligeVoz, get estado() { return estado; }, get ocupado() { return ocupado(); }, get voz() { return voz; }, get cambioActivo() { return !!nodo; }, get video() { return video; } };
  }
  raiz.GuardianaLlamada = { crea, VOCES };
})(typeof window !== 'undefined' ? window : globalThis);
