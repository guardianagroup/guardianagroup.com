// GUARDIANA · Comunicaciones · llamadas de voz y vídeo (26 Oct 2026).
// WebRTC del propio navegador entre las dos páginas. La oferta, la respuesta y los candidatos viajan dentro del canal
// cifrado de la conversación (nunca en claro), así que la huella DTLS que el navegador comprueba viene de la otra
// persona y de nadie más: la llamada queda cifrada de extremo a extremo. El tráfico va siempre por el servicio de
// llamadas del relé (iceTransportPolicy «relay»): los dos extremos solo ven el relé, no la dirección del otro.
// El sonido va con los ajustes de opus.js (Opus a banda completa, FEC, RED); la calidad se estima cada 2 s.
'use strict';
(function (raiz) {
  const $ = (s) => document.querySelector(s);
  const LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname); // en pruebas locales no hay relé de llamadas: candidatos directos
  function crea(o) {
    // o: { ice(): [servidores], manda(m): envía {tipo:'llamada', ...m} sellado, nombre(): nombre de la otra persona,
    //      inicial(): letra del avatar, fin(info): la app anota la llamada, t(s): traducción }
    const t = (s) => (o.t ? o.t(s) : s);
    const caja = $('#llamada'), paso = $('#ll-paso'), tiempo = $('#ll-tiempo'), calidad = $('#ll-calidad');
    let pc = null, local = null, remoto = null, estado = 'libre', conVideo = false, iniciada = 0, reloj = null, pendientes = [], ofertaEntrante = null, calidadReloj = null, idLlamada = null, colgoYo = false;
    const ocupado = () => estado !== 'libre';

    function pinta() {
      caja.classList.toggle('gc-abierta', estado !== 'libre');
      caja.classList.toggle('con-video', conVideo && estado === 'hablando');
      $('#videos').hidden = !(conVideo && estado === 'hablando');
      $('#ll-entrante').hidden = estado !== 'entrante';
      $('#ll-botones').hidden = estado === 'entrante';
      $('#ll-camara-caja').hidden = !conVideo;
      $('#ll-nombre').textContent = o.nombre();
      $('#ll-avatar').textContent = o.inicial();
      document.body.classList.toggle('en-llamada', estado !== 'libre');
    }
    const di = (s, mal) => { paso.textContent = s; paso.classList.toggle('gc-fallo', !!mal); };
    const mmss = (ms) => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

    async function medios(video) {
      const r = { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }, video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false };
      return navigator.mediaDevices.getUserMedia(r);
    }
    function nuevaPc() {
      const ice = o.ice() || [];
      const tieneTurn = ice.some((s) => [].concat(s.urls).some((u) => /^turns?:/.test(u)));
      pc = new RTCPeerConnection({ iceServers: ice, iceTransportPolicy: tieneTurn ? 'relay' : 'all', bundlePolicy: 'max-bundle', rtcpMuxPolicy: 'require' });
      remoto = new MediaStream();
      pc.ontrack = (e) => { remoto.addTrack(e.track); $('#a-remoto').srcObject = remoto; if (conVideo) $('#v-remoto').srcObject = remoto; };
      pc.onicecandidate = (e) => { if (e.candidate) o.manda({ acto: 'ice', id: idLlamada, cand: e.candidate.toJSON() }); };
      pc.onconnectionstatechange = () => {
        if (!pc) return;
        if (pc.connectionState === 'connected') { if (estado !== 'hablando') { estado = 'hablando'; iniciada = Date.now(); di(''); clearInterval(reloj); reloj = setInterval(() => { tiempo.textContent = mmss(Date.now() - iniciada); }, 500); pinta(); } }
        else if (pc.connectionState === 'failed') termina('fallo');
        else if (pc.connectionState === 'disconnected') di(t('Conexión interrumpida, intentando recuperarla…'), true);
      };
      if (raiz.GuardianaOpus) calidadReloj = GuardianaOpus.prepara(pc);
      // vídeo: hasta 2,5 Mb/s por sentido y prioridad alta; el navegador baja solo si la red no da más
      pc.addEventListener('connectionstatechange', () => { if (pc.connectionState !== 'connected') return; pc.getSenders().forEach((s) => { if (!s.track || s.track.kind !== 'video') return; try { const p = s.getParameters(); p.encodings = p.encodings && p.encodings.length ? p.encodings : [{}]; p.encodings[0].maxBitrate = 2500000; p.encodings[0].networkPriority = 'high'; p.degradationPreference = 'balanced'; s.setParameters(p).catch(() => {}); } catch (_) {} }); });
      return tieneTurn;
    }
    const sdpOpus = (d) => (raiz.GuardianaOpus && d && d.sdp ? { type: d.type, sdp: GuardianaOpus.sdp(d.sdp) } : d);

    async function llamar(video) {
      if (ocupado()) return;
      if (!(o.ice() || []).length && !LOCAL) { o.aviso && o.aviso(t('El relé no ofrece llamadas ahora mismo.')); return; }
      conVideo = !!video; estado = 'saliente'; idLlamada = Math.random().toString(36).slice(2, 10); colgoYo = false; tiempo.textContent = '00:00'; calidad.textContent = ''; pinta();
      di(t('Pidiendo el micrófono…'));
      try { local = await medios(conVideo); } catch (_) { di(t('Sin permiso para el micrófono o la cámara.'), true); return termina('sin-medios', 1800); }
      if (conVideo) $('#v-local').srcObject = local;
      nuevaPc();
      local.getTracks().forEach((x) => pc.addTrack(x, local));
      di(t('Llamando…'));
      const of = await pc.createOffer(); await pc.setLocalDescription(sdpOpus(of));
      o.manda({ acto: 'oferta', id: idLlamada, video: conVideo, sdp: pc.localDescription.sdp });
      pinta();
    }
    async function recibe(m) {
      if (!m || !m.acto) return;
      if (m.acto === 'oferta') {
        if (ocupado()) { if (m.id !== idLlamada) o.manda({ acto: 'ocupado', id: m.id }); return; }
        ofertaEntrante = m; idLlamada = m.id; conVideo = !!m.video; estado = 'entrante'; colgoYo = false; tiempo.textContent = '00:00'; calidad.textContent = '';
        di(conVideo ? t('Videollamada entrante') : t('Llamada entrante')); pinta();
        return;
      }
      if (m.id && idLlamada && m.id !== idLlamada) return;
      if (m.acto === 'respuesta' && pc) { await pc.setRemoteDescription({ type: 'answer', sdp: m.sdp }); for (const c of pendientes) { try { await pc.addIceCandidate(c); } catch (_) {} } pendientes = []; di(t('Conectando…')); return; }
      if (m.acto === 'ice') { if (pc && pc.remoteDescription) { try { await pc.addIceCandidate(m.cand); } catch (_) {} } else pendientes.push(m.cand); return; }
      if (m.acto === 'colgar') { if (estado !== 'libre') termina(estado === 'hablando' ? 'fin' : 'rechazada'); return; }
      if (m.acto === 'ocupado') { di(t('Comunicando: la otra persona está en otra llamada.'), true); termina('ocupado', 1800); }
    }
    async function contestar() {
      if (estado !== 'entrante' || !ofertaEntrante) return;
      const m = ofertaEntrante; ofertaEntrante = null; estado = 'conectando'; pinta();
      di(t('Pidiendo el micrófono…'));
      try { local = await medios(conVideo); } catch (_) { di(t('Sin permiso para el micrófono o la cámara.'), true); o.manda({ acto: 'colgar', id: idLlamada }); return termina('sin-medios', 1800); }
      if (conVideo) $('#v-local').srcObject = local;
      nuevaPc();
      local.getTracks().forEach((x) => pc.addTrack(x, local));
      await pc.setRemoteDescription({ type: 'offer', sdp: m.sdp });
      for (const c of pendientes) { try { await pc.addIceCandidate(c); } catch (_) {} } pendientes = [];
      const an = await pc.createAnswer(); await pc.setLocalDescription(sdpOpus(an));
      o.manda({ acto: 'respuesta', id: idLlamada, sdp: pc.localDescription.sdp });
      di(t('Conectando…'));
    }
    function colgar() { if (estado === 'libre') return; colgoYo = true; o.manda({ acto: 'colgar', id: idLlamada }); termina(estado === 'hablando' ? 'fin' : (estado === 'entrante' ? 'rechazada' : 'cancelada')); }
    function termina(por, espera) {
      const dur = iniciada ? Date.now() - iniciada : 0, era = estado, video = conVideo;
      clearInterval(reloj); reloj = null; if (calidadReloj) { calidadReloj.para(); calidadReloj = null; }
      if (pc) { try { pc.close(); } catch (_) {} pc = null; }
      if (local) { local.getTracks().forEach((x) => x.stop()); local = null; }
      $('#a-remoto').srcObject = null; $('#v-remoto').srcObject = null; $('#v-local').srcObject = null;
      pendientes = []; ofertaEntrante = null; iniciada = 0;
      const cierra = () => { estado = 'libre'; idLlamada = null; pinta(); };
      if (por === 'fin') di(t('Llamada terminada'));
      else if (por === 'fallo') di(t('No se pudo mantener la conexión.'), true);
      else if (por === 'rechazada' && !colgoYo) di(t('La otra persona no ha contestado.'));
      estado = 'cerrando'; pinta();
      setTimeout(cierra, espera || (por === 'fin' || por === 'cancelada' ? 600 : 1500));
      if (o.fin && era !== 'libre') o.fin({ por, duracion: dur, video, saliente: era === 'saliente' || (era === 'hablando' && !ofertaEntrante && colgoYo !== undefined) });
    }
    $('#ll-colgar').addEventListener('click', colgar);
    $('#ll-rechazar').addEventListener('click', colgar);
    $('#ll-contestar').addEventListener('click', () => { contestar().catch(() => termina('fallo')); });
    $('#ll-silenciar').addEventListener('click', (e) => { const b = e.currentTarget; const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); if (local) local.getAudioTracks().forEach((x) => { x.enabled = !on; }); });
    $('#ll-camara').addEventListener('click', (e) => { const b = e.currentTarget; const off = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(off)); if (local) local.getVideoTracks().forEach((x) => { x.enabled = !off; }); });
    raiz.addEventListener('guardiana-calidad', (e) => { if (estado !== 'hablando') return; const d = e.detail || {}; const n = d.nivel === 'excelente' ? t('excelente') : d.nivel === 'buena' ? t('buena') : t('débil'); calidad.textContent = t('Calidad estimada') + ': ' + n + (d.rtt_ms != null ? ' · ' + d.rtt_ms + ' ms' : ''); });
    addEventListener('beforeunload', () => { if (estado !== 'libre') { try { o.manda({ acto: 'colgar', id: idLlamada }); } catch (_) {} } });
    return { llamar, recibe, colgar, get estado() { return estado; }, get ocupado() { return ocupado(); } };
  }
  raiz.GuardianaLlamada = { crea };
})(typeof window !== 'undefined' ? window : globalThis);
