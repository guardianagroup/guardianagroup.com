// «Volver al PC» en el orden del dueño (2 Nov 2026, 16:36: «la he pasado al móvil y cuando desde el iPhone he querido volver al
// PC, no me ha dejado. La otra persona con Android sí que ha podido»): A (PC) y B (PC) en videollamada; A la pasa a su iPhone (T)
// y B a su Android (U); U vuelve primero al PC de B; después T vuelve al PC de A. Al final, A y B en el PC, viéndose.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'volver-ut');
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
    if (safari) { try { Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => undefined }); } catch (_) {} }
  }, tipo === 'iphone');
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
const imagen = async (P) => { const f = () => P.evaluate(() => { const v = document.querySelector('#v-remoto'); return v && v.srcObject && v.videoWidth > 0 ? v.getVideoPlaybackQuality().totalVideoFrames : -1; }); const a = await f(); await espera(1500); const b = await f(); return a >= 0 && b > a; };
async function pasa(P, Tel) {
  await P.evaluate(() => document.querySelector('#ll-llevar').click()); await espera(800);
  const dir = await P.evaluate(() => document.querySelector('#llevar-qr').dataset.url);
  await Tel.goto(String(dir).replace('https://guardianagroup.com', 'http://127.0.0.1:8080'));
  return dir;
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await equipo(browser, 'pc', 'A'), B = await equipo(browser, 'pc', 'B');
  await B.goto(URL0); await espera(1500);
  await B.evaluate(() => { window.__copiados = []; try { navigator.clipboard.writeText = (x) => { window.__copiados.push(String(x)); return Promise.resolve(); }; } catch (_) {} });
  await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
  const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2500);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada');
  await espera(2000);
  const T = await equipo(browser, 'iphone', 'T');
  await pasa(A, T);
  comprueba(await hasta(async () => (await estado(T)) === 'hablando' && (await estado(A)) === 'libre' && (await estado(B)) === 'hablando', 30000), '1. A la pasa a su iPhone (T)');
  await espera(2000);
  const U = await equipo(browser, 'android', 'U');
  await pasa(B, U);
  comprueba(await hasta(async () => (await estado(U)) === 'hablando' && (await estado(B)) === 'libre' && (await estado(T)) === 'hablando', 30000), '1. B la pasa a su Android (U): T y U hablan', { T: await estado(T), U: await estado(U), B: await estado(B) });
  await espera(2500);
  // 2. U vuelve primero al PC de B
  comprueba(await hasta(() => U.evaluate(() => { const c = document.querySelector('#ll-volver-pc-caja'); return !!c && !c.hidden && !c.classList.contains('apagado'); }), 10000), '2. en U, «Volver al PC» activo');
  await U.click('#ll-volver-pc');
  comprueba(await hasta(async () => (await estado(B)) === 'hablando' && (await estado(T)) === 'hablando' && (await estado(U)) !== 'hablando', 30000), '2. U vuelve al PC de B: B y T hablan', { B: await estado(B), T: await estado(T), U: await estado(U) });
  await espera(3000);
  // 3. después T vuelve al PC de A
  const activo = await hasta(() => T.evaluate(() => { const c = document.querySelector('#ll-volver-pc-caja'); return !!c && !c.hidden && !c.classList.contains('apagado'); }), 10000);
  comprueba(activo, '3. en T (iPhone), «Volver al PC» activo', await T.evaluate(() => { const c = document.querySelector('#ll-volver-pc-caja'); return c ? { oculto: c.hidden, apagado: c.classList.contains('apagado') } : null; }));
  await T.screenshot({ path: path.join(OUT, '3-T-antes.png') });
  await T.evaluate(() => document.querySelector('#ll-volver-pc').click());
  const t0 = Date.now();
  const vuelve = await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando' && (await estado(T)) !== 'hablando', 35000);
  const av = await T.evaluate(() => { const e = document.querySelector('#aviso'); return e && !e.hidden ? e.textContent : ''; });
  comprueba(vuelve, '3. T vuelve al PC de A (' + Math.round((Date.now() - t0) / 1000) + ' s): A y B en el PC', { A: await estado(A), B: await estado(B), T: await estado(T), avisoT: av });
  await T.screenshot({ path: path.join(OUT, '3-T.png') }); await A.screenshot({ path: path.join(OUT, '3-A.png') });
  if (vuelve) { await espera(2500); comprueba(await imagen(A) && await imagen(B), '3. A y B se ven'); }
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
