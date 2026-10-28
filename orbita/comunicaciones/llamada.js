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

  function crea(o) {
    // o: { ice(), manda(m), puede(), nombre(), inicial(), fin(info), t(s), aviso(s) }
    const t = (s) => (o.t ? o.t(s) : s);
    const caja = $('#llamada'), paso = $('#ll-paso'), tiempo = $('#ll-tiempo'), calidad = $('#ll-calidad');
    let pc = null, mic = null, envio = null, ctx = null, nodo = null, estado = 'libre', iniciada = 0, reloj = null, pendientes = [], ofertaEntrante = null, idLlamada = null, colgoYo = false, sondeo = null;
    let voz = 'natural'; try { voz = localStorage.getItem('gcom-voz') || 'natural'; } catch (_) {} if (!VOCES[voz]) voz = 'natural';
    const ocupado = () => estado !== 'libre';

    function pinta() {
      caja.classList.toggle('gc-abierta', estado !== 'libre');
      $('#ll-entrante').hidden = estado !== 'entrante';
      $('#ll-botones').hidden = estado === 'entrante';
      $('#ll-nombre').textContent = o.nombre();
      $('#ll-avatar').textContent = o.inicial();
      document.body.classList.toggle('en-llamada', estado !== 'libre');
      pintaVoces();
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
    function nuevaPc() {
      const ice = o.ice() || [];
      const tieneTurn = ice.some((s) => [].concat(s.urls).some((u) => /^turns?:/.test(u)));
      // fuera de las pruebas locales, solo por el relé: sin TURN la llamada no conecta, nunca va directa (las IP quedarían a la vista)
      pc = new RTCPeerConnection({ iceServers: ice, iceTransportPolicy: (tieneTurn || !LOCAL) ? 'relay' : 'all', bundlePolicy: 'max-bundle', rtcpMuxPolicy: 'require' });
      const remoto = new MediaStream();
      pc.ontrack = (e) => { remoto.addTrack(e.track); $('#a-remoto').srcObject = remoto; };
      pc.onicecandidate = (e) => { if (e.candidate) o.manda({ acto: 'ice', id: idLlamada, cand: e.candidate.toJSON() }); };
      pc.onconnectionstatechange = () => {
        if (!pc) return;
        if (pc.connectionState === 'connected') { if (estado !== 'hablando') { estado = 'hablando'; iniciada = Date.now(); di(''); clearInterval(reloj); reloj = setInterval(() => { tiempo.textContent = mmss(Date.now() - iniciada); }, 500); mideCalidad(); pinta(); } }
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
          let rtt = null, perd = 0, rec = 0;
          (await pc.getStats()).forEach((r) => { if (r.type === 'candidate-pair' && r.state === 'succeeded' && r.currentRoundTripTime != null) rtt = Math.round(r.currentRoundTripTime * 1000); if (r.type === 'inbound-rtp' && r.kind === 'audio') { perd += r.packetsLost || 0; rec += r.packetsReceived || 0; } });
          const p = rec + perd ? perd / (rec + perd) : 0, nivel = p < 0.01 && (rtt == null || rtt < 250) ? t('excelente') : p < 0.05 ? t('buena') : t('débil');
          calidad.textContent = t('Calidad estimada') + ': ' + nivel + (rtt != null ? ' · ' + rtt + ' ms' : '');
        } catch (_) {}
      }, 2000);
    }
    async function llamar() {
      if (ocupado()) return;
      if (!o.puede()) { o.aviso && o.aviso(t('Para llamar, la otra persona tiene que estar conectada y la sesión, verificada.')); return; }
      if (!(o.ice() || []).length && !LOCAL) { o.aviso && o.aviso(t('El servicio de llamadas no está disponible ahora mismo.')); return; }
      estado = 'saliente'; idLlamada = Math.random().toString(36).slice(2, 10); colgoYo = false; tiempo.textContent = '00:00'; calidad.textContent = ''; pinta();
      di(t('Pidiendo el micrófono…'));
      try { await microfono(); } catch (_) { di(t('Sin permiso para el micrófono.'), true); return termina('sin-medios', 1800); }
      nuevaPc();
      envio.getAudioTracks().forEach((x) => pc.addTrack(x, envio));
      di(t('Llamando…'));
      const of = await pc.createOffer(); await pc.setLocalDescription(of);
      o.manda({ acto: 'oferta', id: idLlamada, sdp: pc.localDescription.sdp });
      pinta();
    }
    async function recibe(m) {
      if (!m || !m.acto) return;
      if (m.acto === 'oferta') {
        if (typeof m.sdp !== 'string' || m.sdp.length > 20000) return;
        if (ocupado()) { if (m.id !== idLlamada) o.manda({ acto: 'ocupado', id: m.id }); return; }
        ofertaEntrante = m; idLlamada = String(m.id || '').slice(0, 16); estado = 'entrante'; colgoYo = false; tiempo.textContent = '00:00'; calidad.textContent = '';
        di(t('Llamada entrante')); pinta(); o.suena && o.suena();
        return;
      }
      if (m.id && idLlamada && m.id !== idLlamada) return;
      if (m.acto === 'respuesta' && pc && typeof m.sdp === 'string') { await pc.setRemoteDescription({ type: 'answer', sdp: m.sdp }); for (const c of pendientes) { try { await pc.addIceCandidate(c); } catch (_) {} } pendientes = []; di(t('Conectando…')); return; }
      if (m.acto === 'ice' && m.cand && typeof m.cand === 'object') { if (pc && pc.remoteDescription) { try { await pc.addIceCandidate(m.cand); } catch (_) {} } else if (pendientes.length < 64) pendientes.push(m.cand); return; }
      if (m.acto === 'colgar') { if (estado !== 'libre') termina(estado === 'hablando' ? 'fin' : 'rechazada'); return; }
      if (m.acto === 'ocupado') { di(t('Comunicando: la otra persona está en otra llamada.'), true); termina('ocupado', 1800); }
    }
    async function contestar() {
      if (estado !== 'entrante' || !ofertaEntrante) return;
      const m = ofertaEntrante; ofertaEntrante = null; estado = 'conectando'; pinta();
      di(t('Pidiendo el micrófono…'));
      try { await microfono(); } catch (_) { di(t('Sin permiso para el micrófono.'), true); o.manda({ acto: 'colgar', id: idLlamada }); return termina('sin-medios', 1800); }
      nuevaPc();
      envio.getAudioTracks().forEach((x) => pc.addTrack(x, envio));
      await pc.setRemoteDescription({ type: 'offer', sdp: m.sdp });
      for (const c of pendientes) { try { await pc.addIceCandidate(c); } catch (_) {} } pendientes = [];
      const an = await pc.createAnswer(); await pc.setLocalDescription(an);
      o.manda({ acto: 'respuesta', id: idLlamada, sdp: pc.localDescription.sdp });
      di(t('Conectando…'));
    }
    function colgar() { if (estado === 'libre') return; colgoYo = true; o.manda({ acto: 'colgar', id: idLlamada }); termina(estado === 'hablando' ? 'fin' : estado === 'entrante' ? 'rechazada' : 'cancelada'); }
    function termina(por, espera) {
      const dur = iniciada ? Date.now() - iniciada : 0, era = estado;
      clearInterval(reloj); reloj = null; clearInterval(sondeo); sondeo = null;
      if (pc) { try { pc.close(); } catch (_) {} pc = null; }
      for (const s of [mic, envio]) if (s) s.getTracks().forEach((x) => x.stop());
      mic = null; envio = null; nodo = null; if (ctx) { try { ctx.close(); } catch (_) {} ctx = null; }
      $('#a-remoto').srcObject = null;
      pendientes = []; ofertaEntrante = null; iniciada = 0;
      const silencio = $('#ll-silenciar'); if (silencio) silencio.setAttribute('aria-pressed', 'false');
      if (por === 'fin') di(t('Llamada terminada'));
      else if (por === 'fallo') di(t('No se pudo mantener la conexión.'), true);
      else if (por === 'rechazada' && !colgoYo) di(t('La otra persona no ha contestado.'));
      estado = 'cerrando'; pinta();
      setTimeout(() => { estado = 'libre'; idLlamada = null; pinta(); }, espera || (por === 'fin' || por === 'cancelada' ? 600 : 1500));
      if (o.fin && era !== 'libre') o.fin({ por, duracion: dur, saliente: era === 'saliente' || (era === 'hablando' && colgoYo), voz: voz !== 'natural' });
    }
    $('#ll-colgar').addEventListener('click', colgar);
    $('#ll-rechazar').addEventListener('click', colgar);
    $('#ll-contestar').addEventListener('click', () => { contestar().catch(() => termina('fallo')); });
    $('#ll-silenciar').addEventListener('click', (e) => { const b = e.currentTarget; const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); for (const s of [envio, mic]) if (s) s.getAudioTracks().forEach((x) => { x.enabled = !on; }); });
    for (const b of document.querySelectorAll('#ll-voces [data-voz]')) b.addEventListener('click', () => eligeVoz(b.dataset.voz));
    addEventListener('beforeunload', () => { if (estado !== 'libre') { try { o.manda({ acto: 'colgar', id: idLlamada }); } catch (_) {} } });
    pintaVoces();
    return { llamar, recibe, colgar, eligeVoz, get estado() { return estado; }, get ocupado() { return ocupado(); }, get voz() { return voz; }, get cambioActivo() { return !!nodo; } };
  }
  raiz.GuardianaLlamada = { crea, VOCES };
})(typeof window !== 'undefined' ? window : globalThis);
