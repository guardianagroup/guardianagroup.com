// «Pantalla» (dueño, 2 Nov 2026, 14:22–14:23; ronda 90). Hecha a partir de recupera.js.
//   1. B comparte su pantalla y A la recibe.
//   2. B deja de compartir: vuelve la cámara y A sigue recibiendo imagen.
//   3. En A, el navegador dice que no al instante (como Chrome en Android, que tiene la función pero no deja usarla): el botón se
//      quita y sale el aviso; la llamada sigue con la cámara.
//   4. Con la identidad de un teléfono Android, «Pantalla» no sale.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'pantalla');
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
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--auto-select-desktop-capture-source=Entire screen', '--enable-usermedia-screen-capturing'] });
  const A = await equipo(browser, 'A'), B = await equipo(browser, 'B');
  await B.goto(URL0); await espera(1500);
  await B.evaluate(() => { window.__copiados = []; try { navigator.clipboard.writeText = (x) => { window.__copiados.push(String(x)); return Promise.resolve(); }; } catch (_) {} });
  await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
  const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2500);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada');
  await espera(3000);
  const pista = () => B.evaluate(() => { const v = document.querySelector('#v-local'); const t = v && v.srcObject && v.srcObject.getVideoTracks()[0]; return t ? { label: t.label, surf: (t.getSettings && t.getSettings().displaySurface) || '' } : null; });
  comprueba(await visible(B, '#ll-pantalla'), '1. en la llamada de B sale «Pantalla»');
  await B.evaluate(() => document.querySelector('#ll-pantalla').click()); await espera(2500);
  const p1 = await pista();
  comprueba(!!p1 && !!p1.surf, '1. B comparte la pantalla (lo que se envía y su propia imagen)', p1);
  comprueba(await B.evaluate(() => document.querySelector('#ll-pantalla').getAttribute('aria-pressed') === 'true'), '1. el botón dice que se está compartiendo');
  const a1 = await llega(A); await espera(2500); const a2 = await llega(A);
  comprueba(a2.v > a1.v, '1. A recibe la imagen', { a1, a2 });
  await B.screenshot({ path: path.join(OUT, '1-b-comparte.png') });
  await B.evaluate(() => document.querySelector('#ll-pantalla').click()); await espera(2000);
  const p2 = await pista();
  comprueba(!!p2 && !p2.surf, '2. al dejar de compartir vuelve la cámara', p2);
  const a3 = await llega(A); await espera(2500); const a4 = await llega(A);
  comprueba(a4.v > a3.v, '2. A sigue recibiendo imagen', { a3, a4 });
  // 3. en A, un navegador que tiene la función pero dice que no al instante
  comprueba(await visible(A, '#ll-pantalla'), '3. en la llamada de A sale «Pantalla»');
  await A.evaluate(() => { navigator.mediaDevices.getDisplayMedia = () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError')); document.querySelector('#ll-pantalla').click(); });
  await espera(800);
  const av = await A.evaluate(() => { const e = document.querySelector('#aviso'); return e && !e.hidden ? e.textContent.trim() : ''; });
  comprueba(av === 'Este navegador no deja compartir la pantalla.', '3. sale el aviso', av);
  comprueba(!(await visible(A, '#ll-pantalla')), '3. y el botón «Pantalla» se quita');
  await A.screenshot({ path: path.join(OUT, '3-a-no-deja.png') });
  comprueba((await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', '3. la llamada sigue');
  // 4. con la identidad de un teléfono Android no sale (la página del teléfono es la de «Pasar al teléfono»: se mira la regla)
  const ctxAnd = await browser.newContext({ userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', isMobile: true, hasTouch: true, viewport: { width: 393, height: 852 } });
  const pAnd = await ctxAnd.newPage(); await pAnd.goto('http://127.0.0.1:8080/solo-pc/');
  const regla = (fs.readFileSync(path.join(__dirname, '../../orbita/comunicaciones/llamada.js'), 'utf8').match(/const PANTALLA = (.+);\n/) || [])[1];
  const enAndroid = regla ? await pAnd.evaluate('!!(' + regla + ')') : null, enPC = regla ? await A.evaluate('!!(' + regla + ')') : null;
  comprueba(enAndroid === false && enPC === true, '4. en Android, «Pantalla» no sale (en el PC, sí)', { enAndroid, enPC });
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
