// «Continuar en el móvil» without a gap, the phone's side (18 Oct 2026, the committee's spec:
// make before break). The computer keeps its own leg to the other person for the whole call;
// this phone opens a second WebRTC leg to the computer's page — relay only, like every call of
// GUARDIANA, so neither end ever sees an address — and the computer moves the voice to it only
// once it hears this phone's packets. Until then nothing on the computer changed. Going back
// («Volver al PC») is the same in reverse: this leg stays up until the computer says its own
// microphone carries the voice again (or 3 s pass), so the other person hears no hole.
// What the offer, the answer and the candidates say travels sealed through the computer
// (the phone's link to it), never in the clear. The decision lives in the program
// (crates/zero/src/relevo.rs in the GUARDIANA repository); this file only carries sound.
'use strict';
(function (raiz) {
  // `o`: { manda(m), salida (the <audio>/<video> that plays the other person), microfono()
  // (a stream for the voice, as the page wants it), alSonar() and alCerrar() }.
  function crea(o) {
    let p = null, arrancando = false, silenciado = false;
    const dice = (d) => o.manda({ t: 'puente', d });
    const cierra = (avisar) => {
      if (!p) return;
      const fue = p; p = null;
      clearTimeout(fue.suelta);
      try { fue.pc.close(); } catch (_) {}
      if (fue.mic) fue.mic.getTracks().forEach((x) => x.stop());
      if (fue.calidad) fue.calidad.para();
      try { if (o.salida.srcObject === fue.remoto) o.salida.srcObject = null; } catch (_) {}
      if (o.alCerrar) o.alCerrar();
      if (avisar) dice({ t: 'fin', s: fue.s });
    };
    const empieza = async (l) => {
      if (arrancando || p) return;
      arrancando = true;
      let mic = null;
      try { mic = await o.microfono(); } catch (_) { mic = null; }
      arrancando = false;
      if (!mic) return;
      if (p) { mic.getTracks().forEach((x) => x.stop()); return; }
      const pc = new RTCPeerConnection({ iceServers: l.rtc.ice, iceTransportPolicy: 'relay', bundlePolicy: 'max-bundle' });
      p = { pc, s: Math.random().toString(36).slice(2, 10), mic, remoto: null, pendientes: [], suelta: null, calidad: null };
      const mio = p;
      mic.getAudioTracks().forEach((x) => { x.enabled = !silenciado; pc.addTrack(x, mic); });
      pc.onicecandidate = (e) => { if (e.candidate && p === mio) dice({ t: 'ice', s: mio.s, c: e.candidate.toJSON() }); };
      pc.ontrack = (e) => {
        if (p !== mio) return;
        mio.remoto = e.streams[0] || new MediaStream([e.track]);
        o.salida.removeAttribute('src');
        o.salida.srcObject = mio.remoto;
        o.salida.play().catch(() => {});
        if (o.alSonar) o.alSonar();
      };
      pc.onconnectionstatechange = () => { if (p === mio && pc.connectionState === 'failed') cierra(true); };
      // The same voice settings as every call (opus.js): RED first, Opus' limits, the estimate.
      if (raiz.GuardianaOpus) { try { mio.calidad = raiz.GuardianaOpus.prepara(pc); } catch (_) {} }
      try {
        const of = await pc.createOffer();
        if (raiz.GuardianaOpus) of.sdp = raiz.GuardianaOpus.sdp(of.sdp);
        await pc.setLocalDescription(of);
        if (p === mio) dice({ t: 'offer', s: mio.s, sdp: pc.localDescription.sdp });
      } catch (_) { if (p === mio) cierra(true); }
    };
    // After every state from the computer: whether this leg should be up.
    const estado = (E) => {
      const l = E && E.llamada, x = ((E && E.movil) || {}).paso || {};
      const quiere = !!(l && x.puente && x.relevo !== 'pc' && l.rtc && l.rtc.ice && raiz.RTCPeerConnection);
      if (quiere) { if (p && p.suelta) { clearTimeout(p.suelta); p.suelta = null; } if (!p) empieza(l); return; }
      if (!p) return;
      // The call ended, or the bridge is no longer the way: close now.
      if (!l || !x.puente) { cierra(true); return; }
      // Back to the computer: keep sounding until it says its microphone took over.
      if (!p.suelta) p.suelta = setTimeout(() => cierra(true), 3000);
    };
    const recibe = async (d) => {
      if (!d || !p || (d.s && d.s !== p.s)) return;
      if (d.t === 'fin') { cierra(false); return; }
      try {
        if (d.t === 'answer' && p.pc.signalingState === 'have-local-offer') {
          await p.pc.setRemoteDescription({ type: 'answer', sdp: d.sdp });
          p.pendientes.splice(0).forEach((c) => p.pc.addIceCandidate(c).catch(() => {}));
        } else if (d.t === 'ice' && d.c) {
          if (p.pc.remoteDescription) await p.pc.addIceCandidate(d.c).catch(() => {});
          else if (p.pendientes.length < 200) p.pendientes.push(d.c);
        }
      } catch (_) { cierra(true); }
    };
    const silencia = (si) => { silenciado = !!si; if (p && p.mic) p.mic.getAudioTracks().forEach((x) => { x.enabled = !silenciado; }); };
    return { estado, recibe, silencia, para: () => cierra(true), activo: () => !!p, pc: () => (p ? p.pc : null) };
  }
  raiz.GuardianaRelevoMovil = { crea };
})(typeof window !== 'undefined' ? window : globalThis);
