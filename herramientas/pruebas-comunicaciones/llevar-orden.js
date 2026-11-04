// Pasar la llamada al teléfono, los dos, en el orden del 2 Nov 2026 (dueño, 13:51): primero el amigo (B, PC) la pasa a su Android
// (U) y después el dueño (A, PC) la pasa a su iPhone (T). El Android queda en medio: a él le llega la llamada del iPhone.
// Comprueba que los dos teléfonos se ven y se oyen (imagen que avanza y sonido que llega, en los dos sentidos).
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'llevar-orden');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, tipo, nombre) {
  const pc = tipo === 'pc';
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 852 }, deviceScaleFactor: pc ? 1 : 2, isMobile: !pc, hasTouch: !pc, userAgent: pc ? PC : tipo === 'iphone' ? IPHONE : ANDROID, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((safari) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {}
    // el iPhone de verdad es Safari: sin navigator.userAgentData y, por tanto, sin la capa post-cuántica de los medios
    if (safari) { try { Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => undefined }); } catch (_) {} }
    const Orig = window.RTCPeerConnection; window.__pcs = []; window.RTCPeerConnection = function (...a) { const p = new Orig(...a); window.__pcs.push(p); return p; }; window.RTCPeerConnection.prototype = Orig.prototype; Object.setPrototypeOf(window.RTCPeerConnection, Orig);
  }, tipo === 'iphone' && process.env.SAFARI === '1');
  // Brave en Android (2 Nov 2026): no deja arrancar ni la imagen muda sin un toque
  if (tipo === 'android' && process.env.BRAVE === '1') await ctx.addInitScript(() => {
    let activado = false;
    for (const g of ['click', 'touchend', 'pointerup', 'keydown']) window.addEventListener(g, (e) => { if (e.isTrusted) activado = true; }, true);
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { if (!activado) return Promise.reject(new DOMException('sin toque', 'NotAllowedError')); return orig.call(this); };
    // y nada arranca solo por el atributo «autoplay»
    try { Object.defineProperty(HTMLMediaElement.prototype, 'autoplay', { get: () => false, set: () => {} }); } catch (_) {}
    document.addEventListener('DOMContentLoaded', () => { for (const v of document.querySelectorAll('video,audio')) v.removeAttribute('autoplay'); });
  });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  p.on('console', (m) => { if (m.type() === 'error' && !/WebSocket|favicon/.test(m.text())) console.log('[' + nombre + '] ' + m.text().slice(0, 200)); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
// lo que llega de verdad: fotogramas de la imagen que se ve y bytes de sonido recibidos, en todas las conexiones de la página
const llega = (P) => P.evaluate(async () => {
  const v = document.querySelector('#v-remoto');
  const fr = v && v.srcObject && v.videoWidth > 0 ? v.getVideoPlaybackQuality().totalVideoFrames : -1;
  const vis = !!(v && !v.hidden && v.getClientRects().length && getComputedStyle(v).display !== 'none');
  const a = document.querySelector('#a-remoto');
  const au = a && a.srcObject ? { pistas: a.srcObject.getAudioTracks().map((t) => t.readyState + (t.muted ? ' muda' : '')), pausado: a.paused } : null;
  const llevar = document.querySelector('#llevar');
  return { fr, vis, au, llevar: llevar && !llevar.hidden ? (document.querySelector('#llevar-t') || {}).textContent : '' };
});
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await equipo(browser, 'pc', 'A'), B = await equipo(browser, 'pc', 'B');
  // B invita, A acepta
  await B.goto(URL0); await espera(1500);
  await B.evaluate(() => { window.__copiados = []; try { navigator.clipboard.writeText = (x) => { window.__copiados.push(String(x)); return Promise.resolve(); }; } catch (_) {} });
  await B.click('#nueva'); await espera(2500); await B.evaluate(() => window.__copiados.push(window.gcomPrueba.enlaceI())); await espera(600);
  const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2500);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada');
  await espera(2000);
  // 1. el amigo (B) la pasa a su Android (U)
  await B.evaluate(() => document.querySelector('#ll-llevar').click()); await espera(800);
  const dirB = await B.evaluate(() => document.querySelector('#llevar-qr').dataset.url);
  const U = await equipo(browser, process.env.U || 'android', 'U');
  await U.goto(String(dirB).replace('https://guardianagroup.com', 'http://127.0.0.1:8080'));
  comprueba(await hasta(async () => (await estado(U)) === 'hablando' && (await estado(A)) === 'hablando' && (await estado(B)) === 'libre', 30000), '1. B → U: A habla con U y B sale', { A: await estado(A), B: await estado(B), U: await estado(U) });
  await espera(3000);
  if (process.env.BRAVE === '1') {
    const sin = await llega(U);
    comprueba(await visible(U, '#ll-toca'), '1. Brave: sin un toque no arranca nada y sale «Toca para ver y oír la llamada»', sin);
    await U.screenshot({ path: path.join(OUT, '1-U-toca.png') });
    await U.click('#ll-toca'); await espera(1500);
    comprueba(!(await visible(U, '#ll-toca')), '1. Brave: al tocar, el aviso se va');
  }
  const u1 = await llega(U), a1 = await llega(A); await espera(2000); const u1b = await llega(U), a1b = await llega(A);
  comprueba(u1b.fr > u1.fr && u1.fr >= 0, '1. U ve a A (la imagen avanza)', { u1, u1b });
  comprueba(a1b.fr > a1.fr && a1.fr >= 0, '1. A ve a U', { a1, a1b });
  await U.screenshot({ path: path.join(OUT, '1-U.png') });
  // 2. el dueño (A) la pasa a su iPhone (T): el Android (U) queda en medio
  await A.evaluate(() => document.querySelector('#ll-llevar').click()); await espera(800);
  const dirA = await A.evaluate(() => document.querySelector('#llevar-qr').dataset.url);
  const T = await equipo(browser, process.env.T || 'iphone', 'T');
  await T.goto(String(dirA).replace('https://guardianagroup.com', 'http://127.0.0.1:8080'));
  comprueba(await hasta(async () => (await estado(U)) === 'hablando' && (await estado(T)) === 'hablando' && (await estado(A)) === 'libre', 30000), '2. A → T: U habla con T y A sale', { A: await estado(A), T: await estado(T), U: await estado(U) });
  await espera(3000);
  const u2 = await llega(U), t2 = await llega(T); await espera(2500); const u2b = await llega(U), t2b = await llega(T);
  comprueba(u2b.fr > u2.fr && u2.fr >= 0 && u2b.vis, '2. el Android (U) ve al iPhone (T)', { u2, u2b });
  comprueba(t2b.fr > t2.fr && t2.fr >= 0 && t2b.vis, '2. el iPhone (T) ve al Android (U)', { t2, t2b });
  comprueba(!!(u2b.au && u2b.au.pistas.length && /live/.test(u2b.au.pistas[0])), '2. al Android le llega sonido', u2b.au);
  comprueba(!!(t2b.au && t2b.au.pistas.length && /live/.test(t2b.au.pistas[0])), '2. al iPhone le llega sonido', t2b.au);
  comprueba(!u2b.llevar && !t2b.llevar, '2. ninguno se queda en «Conectando…»', { U: u2b.llevar, T: t2b.llevar });
  // los bytes de verdad, por si la imagen se ve pero no llega (o al revés)
  const bytes = async (P) => P.evaluate(async () => { const out = []; for (const p of (window.__pcs || [])) { try { const s = await p.getStats(); s.forEach((r) => { if (r.type === 'inbound-rtp') out.push(r.kind + ':' + r.bytesReceived); }); } catch (_) {} } return out; });
  console.log('bytes U', JSON.stringify(await bytes(U)), 'T', JSON.stringify(await bytes(T)));
  await U.screenshot({ path: path.join(OUT, '2-U.png') }); await T.screenshot({ path: path.join(OUT, '2-T.png') });
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
