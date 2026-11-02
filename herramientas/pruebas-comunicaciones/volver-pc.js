// «Volver al PC» (dueño, 2 Nov 2026, 13:27: «Desde el móvil, volver a la llamada al PC»).
// A (PC) en videollamada con B (PC). A pasa la llamada a su teléfono (T). En T, «Volver al PC»: A contesta solo, B sigue la llamada
// con A y T sale con «La llamada sigue en el ordenador». Después, A puede volver a pasarla al teléfono (con un código nuevo).
// Con AMBOS=1, B ha pasado antes la suya a su Android (U): la llamada vuelve a A desde T y U sigue en ella.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'volver-pc');
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
  let U = null;
  if (process.env.AMBOS === '1' && process.env.ORDEN !== 'AB') {
    U = await equipo(browser, 'android', 'U');
    await pasa(B, U);
    comprueba(await hasta(async () => (await estado(U)) === 'hablando' && (await estado(B)) === 'libre', 30000), '0. B pasó la suya a su Android (U)');
    await espera(2000);
  }
  // 1. A pasa la llamada a su teléfono (T)
  const T = await equipo(browser, 'iphone', 'T');
  const dir = await pasa(A, T);
  comprueba(/#llevar=[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/.test(dir || ''), '1. el código lleva la llave y el secreto de «Volver al PC»', dir);
  comprueba(await hasta(async () => (await estado(T)) === 'hablando' && (await estado(A)) === 'libre' && (await estado(U || B)) === 'hablando', 30000), '1. la llamada está en el teléfono', { A: await estado(A), T: await estado(T), otro: await estado(U || B) });
  if (process.env.AMBOS === '1' && process.env.ORDEN === 'AB') {
    U = await equipo(browser, 'android', 'U');
    await pasa(B, U);
    comprueba(await hasta(async () => (await estado(U)) === 'hablando' && (await estado(B)) === 'libre' && (await estado(T)) === 'hablando', 30000), '1. después B pasa la suya a su Android (U): T y U hablan', { B: await estado(B), T: await estado(T), U: await estado(U) });
    await espera(2000);
  }
  comprueba(await hasta(() => visible(T, '#ll-volver-pc'), 8000), '1. en el teléfono sale «Volver al PC»');
  comprueba(await hasta(() => T.evaluate(() => { const c = document.querySelector('#ll-volver-pc-caja'); return !!c && !c.classList.contains('apagado'); }), 8000), '1. y está activo (el PC está conectado)');
  await T.screenshot({ path: path.join(OUT, '1-tel.png') });
  // 2. «Volver al PC»
  await T.click('#ll-volver-pc');
  const t0 = Date.now();
  const otro = U || B;
  const vuelve = await hasta(async () => (await estado(A)) === 'hablando' && (await estado(otro)) === 'hablando' && (await estado(T)) !== 'hablando', 30000);
  comprueba(vuelve, '2. la llamada vuelve al PC (' + Math.round((Date.now() - t0) / 1000) + ' s) y el teléfono sale', { A: await estado(A), T: await estado(T), otro: await estado(otro) });
  comprueba(await hasta(async () => (await T.textContent('#llevar-t')) === 'La llamada sigue en el ordenador' && await visible(T, '#llevar'), 10000), '2. en el teléfono: «La llamada sigue en el ordenador»', await T.textContent('#llevar-t'));
  await espera(2500);
  comprueba(await imagen(A), '2. A ve a la otra persona');
  comprueba(await imagen(otro), '2. la otra persona ve a A');
  await A.screenshot({ path: path.join(OUT, '2-pc.png') }); await T.screenshot({ path: path.join(OUT, '2-tel.png') });
  const queda = await T.evaluate(() => [sessionStorage.getItem('gcom-llevar'), sessionStorage.getItem('gcom-llevar-v')]);
  comprueba(!queda[0], '2. la llave se borra del teléfono', queda);
  // 3. (AMBOS) el Android de B también vuelve a su PC: los dos otra vez en el PC
  if (U) {
    comprueba(await hasta(() => U.evaluate(() => { const c = document.querySelector('#ll-volver-pc-caja'); return !!c && !c.hidden && !c.classList.contains('apagado'); }), 10000), '3. en el Android de B sigue «Volver al PC», activo');
    await U.screenshot({ path: path.join(OUT, '3-U.png') });
    await U.click('#ll-volver-pc');
    comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando' && (await estado(U)) !== 'hablando', 30000), '3. y la llamada vuelve al PC de B: A y B en el PC', { A: await estado(A), B: await estado(B), U: await estado(U) });
    await espera(2500);
    comprueba(await imagen(A) && await imagen(B), '3. A y B se ven');
  }
  // 4. A la vuelve a pasar al teléfono, con un código nuevo
  if (!U) {
    await espera(1500);
    const T2 = await equipo(browser, 'iphone', 'T2');
    const dir2 = await pasa(A, T2);
    comprueba(dir2 !== dir, '4. código nuevo');
    comprueba(await hasta(async () => (await estado(T2)) === 'hablando' && (await estado(A)) === 'libre', 30000), '4. y la llamada pasa otra vez al teléfono');
  }
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
