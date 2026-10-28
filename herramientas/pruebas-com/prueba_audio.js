// Sonido de alta fidelidad: la llamada negocia Opus con 96 kb/s, FEC y sin DTX en los dos sentidos, el audio sale con
// prioridad alta, y se mide lo que se envía de verdad. Llamada de voz y videollamada.
const { chromium } = require('playwright');
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = []; const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const mk = async (n) => { const c = await b.newContext({ viewport: { width: 1280, height: 800 }, permissions: ['microphone', 'camera'], locale: 'es-ES' }); await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} const O = window.RTCPeerConnection; window.__pcs = []; window.RTCPeerConnection = function (...a) { const p = new O(...a); window.__pcs.push(p); return p; }; window.RTCPeerConnection.prototype = O.prototype; Object.setPrototypeOf(window.RTCPeerConnection, O); const g = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices); navigator.mediaDevices.getUserMedia = async (c) => { const st = await g(c); const t = st.getAudioTracks()[0]; if (t) window.__mic = t.getSettings(); return st; }; }); const p = await c.newPage(); p.errores = []; p.on('pageerror', (e) => p.errores.push(n + ': ' + e.message)); await p.goto(URL); await p.waitForTimeout(1500); return p; };
  const A = await mk('A'), B = await mk('B');
  const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
  await A.click('#nueva'); await A.waitForTimeout(1500);
  const codigo = (await A.textContent('#codigo')).replace(/\D/g, '');
  await B.click('#unir'); await B.fill('#unir-codigo', codigo); await B.waitForTimeout(200); if (await vis(B, '#unir-ok')) await B.click('#unir-ok', { timeout: 3000 }).catch(() => {});
  for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
  await espera(2500);
  const mide = (p) => p.evaluate(async () => {
    const pc = window.__pcs[window.__pcs.length - 1]; if (!pc) return null;
    const fmtp = (sdp) => { const r = /a=rtpmap:(\d+) opus\/48000\/2/i.exec(sdp || ''); if (!r) return null; const m = new RegExp('a=fmtp:' + r[1] + ' ([^\\r\\n]*)').exec(sdp); return m ? m[1] : null; };
    const enviado = async () => { let x = 0; (await pc.getStats()).forEach((s) => { if (s.type === 'outbound-rtp' && s.kind === 'audio') x = s.bytesSent + (s.headerBytesSent || 0); }); return x; };
    const a = await enviado(); await new Promise((r) => setTimeout(r, 5000)); const z = await enviado();
    const s = pc.getSenders().find((x) => x.track && x.track.kind === 'audio'); const e = s && s.getParameters().encodings[0];
    const tr = Object.assign({}, window.__mic || {}, { envio: s && s.track.getSettings().sampleRate });
    return { local: fmtp(pc.localDescription && pc.localDescription.sdp), remoto: fmtp(pc.remoteDescription && pc.remoteDescription.sdp), kbps: Math.round((z - a) * 8 / 5 / 1000), maxBitrate: e && e.maxBitrate, prioridad: e && (e.priority + '/' + e.networkPriority), mic: tr && { micro: tr.sampleRate, envio: tr.envio, ns: tr.noiseSuppression, ec: tr.echoCancellation, agc: tr.autoGainControl, vi: tr.voiceIsolation } };
  });
  for (const [boton, nombre] of [['#llamar', 'llamada'], ['#videollamar', 'videollamada']]) {
    await A.mouse.move(600, 400); await A.click(boton); await espera(2500); await B.mouse.move(600, 400); await B.click('#ll-contestar'); await espera(7000);
    const ma = await mide(A), mb = await mide(B);
    ok(nombre + ': los dos piden Opus a 96 kb/s con FEC y sin DTX', [ma.local, ma.remoto, mb.local, mb.remoto].every((f) => /maxaveragebitrate=96000/.test(f || '') && /useinbandfec=1/.test(f) && /usedtx=0/.test(f)), ma.local);
    ok(nombre + ': el audio sale con prioridad alta y tope de 96 kb/s', ma.maxBitrate === 96000 && /high/.test(ma.prioridad || ''), ma.maxBitrate + ' · ' + ma.prioridad);
    ok(nombre + ': micrófono con reducción de ruido y cancelación de eco, y el audio sale a 48 kHz', ma.mic && ma.mic.ns === true && ma.mic.ec === true && ma.mic.envio === 48000, JSON.stringify(ma.mic));
    res.push('       ' + nombre + ': audio enviado medido: A ' + ma.kbps + ' kb/s · B ' + mb.kbps + ' kb/s (con el micrófono de prueba de Chromium, un pitido)');
    await A.mouse.move(600, 400); await A.click('#ll-colgar'); await espera(2500);
  }
  for (const p of [A, B]) for (const e of p.errores) res.push('ERROR ' + e);
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e.message.slice(0, 500)); process.exit(1); });
