// Al volver a la página, lo que el sistema cortó se recupera sin cortar la llamada (ronda 90, 2 Nov 2026): en B (PC) se acaban la
// cámara y el micrófono (como cuando otra app los toma o entra una llamada de teléfono) y la página vuelve a estar visible: B pide
// otra vez los dos, A sigue viendo imagen que avanza y le sigue llegando sonido.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'recupera');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {}
    const Orig = window.RTCPeerConnection; window.__pcs = []; window.RTCPeerConnection = function (...a) { const p = new Orig(...a); window.__pcs.push(p); return p; }; window.RTCPeerConnection.prototype = Orig.prototype; Object.setPrototypeOf(window.RTCPeerConnection, Orig);
  });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
const llega = (P) => P.evaluate(async () => { let v = 0, a = 0; for (const p of window.__pcs) { try { (await p.getStats()).forEach((r) => { if (r.type === 'inbound-rtp' && r.kind === 'video') v += r.framesDecoded || 0; if (r.type === 'inbound-rtp' && r.kind === 'audio') a += r.bytesReceived || 0; }); } catch (_) {} } return { v, a }; });
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await equipo(browser, 'A'), B = await equipo(browser, 'B');
  await B.goto(URL0); await espera(1500);
  await B.evaluate(() => { window.__copiados = []; try { navigator.clipboard.writeText = (x) => { window.__copiados.push(String(x)); return Promise.resolve(); }; } catch (_) {} });
  await B.click('#nueva'); await espera(2500); await B.evaluate(() => window.__copiados.push(window.gcomPrueba.enlaceI())); await espera(600);
  const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2500);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada');
  await espera(3000);
  // B: el sistema acaba su cámara y su micrófono (stop() no avisa, así que se avisa a mano como lo haría el sistema)
  const antes = await B.evaluate(() => { const v = document.querySelector('#v-local'); const t = v && v.srcObject && v.srcObject.getVideoTracks()[0]; return t ? t.id : ''; });
  await B.evaluate(() => {
    for (const p of window.__pcs) for (const s of p.getSenders()) if (s.track && s.track.readyState === 'live') { const t = s.track; t.stop(); t.dispatchEvent(new Event('ended')); }
    const v = document.querySelector('#v-local'); if (v && v.srcObject) for (const t of v.srcObject.getTracks()) { t.stop(); t.dispatchEvent(new Event('ended')); }
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await espera(4000);
  const a1 = await llega(A); await espera(2500); const a2 = await llega(A);
  comprueba(a2.v > a1.v, '1. A sigue recibiendo imagen de B después del corte', { a1, a2 });
  comprueba(a2.a > a1.a, '1. y sonido', { a1, a2 });
  const despues = await B.evaluate(() => { const v = document.querySelector('#v-local'); const t = v && v.srcObject && v.srcObject.getVideoTracks()[0]; return t ? { id: t.id, estado: t.readyState } : null; });
  comprueba(!!despues && despues.estado === 'live' && despues.id !== antes, '1. B ve su propia imagen con la cámara nueva', despues);
  comprueba((await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', '1. la llamada no se cortó');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
