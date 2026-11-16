// La ventana de la llamada en el programa GUARDIANA (1.0.60; dueño, 16 Nov 2026, 09:44: «tenemos que poder movernos por toda la
// web… y el programa de GUARDIANA, y nos tenemos que seguir viendo… por toda la zona de la pantalla»). En el programa no hay la
// ventana del sistema de Chrome: la página pide una ventana con el nombre «guardiana-flotante» y el programa la hace pequeña,
// siempre delante y movible (zero/navegador/src/app.rs, abre_ventana_llamada); la página la llena. Aquí, A es el programa (la marca
// data-ventana-llamada, sin Document Picture-in-Picture) y la ventana que pide es una ventana de verdad del navegador de la prueba.
//   1. Al dejar la pestaña de la llamada, la ventana con la llamada: el nombre, la otra persona, tu imagen, el tiempo y los botones.
//   2. Al volver a la pestaña, se cierra.
//   3. «Ver el chat»: la ventana se abre y el chat queda libre; al dejar y volver a la pestaña sigue; al cerrarla con su ×, vuelve la
//      tarjeta pequeña.
//   4. Colgar desde la ventana: se termina para los dos y la ventana se cierra.
//   5. Sin la marca (un programa anterior), la página no pide ninguna ventana: no saldría una pestaña de más.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'ventana-programa');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, nombre, programa) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((programa) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {}
    if (window.top !== window || window.opener) return; // la ventana de la llamada no lleva nada de esto
    try { Object.defineProperty(window, 'documentPictureInPicture', { configurable: true, value: undefined }); } catch (_) {} // como el programa
    window.__vista = 'visible';
    Object.defineProperty(Document.prototype, 'visibilityState', { configurable: true, get: () => window.__vista });
    Object.defineProperty(Document.prototype, 'hidden', { configurable: true, get: () => window.__vista !== 'visible' });
    // la marca del programa (crates/zero/src/paginas.rs, 1.0.60), como la pone su guion al crearse la página
    if (programa) new MutationObserver((_, o) => { if (document.documentElement) { document.documentElement.dataset.ventanaLlamada = '1'; o.disconnect(); } }).observe(document, { childList: true });
    window.__abiertas = [];
    const abre = window.open;
    window.open = function (u, n, f) { window.__abiertas.push(String(n || '')); return abre.call(window, u, n, f); };
  }, !!programa);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return { p, ctx };
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(250); } return false; };
const enSesion = (P) => P.evaluate(() => [...((window.GuardianaCom && GuardianaCom.convs) || new Map()).values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada));
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
const oculta = (P, si) => P.evaluate((si) => { window.__vista = si ? 'hidden' : 'visible'; document.dispatchEvent(new Event('visibilitychange')); }, si);
const lee = (V) => V.evaluate(() => {
  const q = (s) => document.querySelector(s), ve = (e) => !!(e && !e.hidden && e.getClientRects().length);
  const rem = q('.vf-rem'), yo = q('.vf-yo');
  return { nombre: window.name, rem: ve(rem), remAncho: rem ? rem.videoWidth : 0, yo: ve(yo), yoAncho: yo ? yo.videoWidth : 0, tiempo: (q('.vf-tiempo') || {}).textContent || '',
    botones: [...document.querySelectorAll('.vf-b')].filter(ve).map((b) => b.className.replace('vf-b ', '')) };
});
async function llamada(browser, programa) {
  const { p: B } = await equipo(browser, 'B', false), { p: A, ctx } = await equipo(browser, 'A', programa);
  await B.goto(URL0 + '?plan=plus'); await espera(1500);
  await B.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
  const url = String(await B.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si');
  comprueba(await hasta(async () => (await enSesion(A)) && (await enSesion(B)), 20000), '0. conversación Ultra entre A' + (programa ? ' (en el programa)' : ' (programa anterior)') + ' y B');
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada');
  await espera(3000);
  return { A, B, ctx };
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--disable-popup-blocking'] });
  const { A, B, ctx } = await llamada(browser, true);
  comprueba(await A.evaluate(() => document.documentElement.dataset.ventanaLlamada === '1' && !window.documentPictureInPicture), '0. A lleva la marca del programa y no tiene la ventana de Chrome');

  // 1. deja la pestaña de la llamada
  let [V] = await Promise.all([ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null), oculta(A, true)]);
  await espera(2500);
  let v = V ? await lee(V) : null;
  comprueba(!!v && v.nombre === 'guardiana-flotante', '1. al dejar la pestaña, la página pide la ventana de la llamada por su nombre', v && v.nombre);
  comprueba(!!v && v.rem && v.remAncho > 0 && v.yo && v.yoAncho > 0, '1. con la otra persona y tu imagen, en movimiento', v);
  comprueba(!!v && /^\d\d:\d\d$/.test(v.tiempo) && v.botones.join(',') === 'vf-mic,vf-cam,vf-colgar', '1. con el tiempo y micrófono, cámara y colgar', v && { tiempo: v.tiempo, botones: v.botones });
  if (V) { await V.setViewportSize({ width: 400, height: 260 }).catch(() => {}); await espera(400); await V.mouse.move(200, 130); await espera(400); await V.screenshot({ path: path.join(OUT, '1-ventana-de-la-llamada.png') }); }
  if (V) { await V.evaluate(() => document.querySelector('.vf-mic').click()); await espera(500); }
  const mic = await A.evaluate(() => document.querySelector('#ll-silenciar').getAttribute('aria-pressed'));
  comprueba(mic === 'true', '1. sus botones mandan en la llamada (micrófono)', mic);
  if (V) { await V.evaluate(() => document.querySelector('.vf-mic').click()); await espera(400); }
  // 2. vuelve
  await oculta(A, false); await espera(1500);
  comprueba(!V || V.isClosed(), '2. al volver a la pestaña, la ventana se cierra');
  comprueba((await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', '2. y la llamada sigue');

  // 3. «Ver el chat»
  [V] = await Promise.all([ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null), A.evaluate(() => document.querySelector('#ll-mini').click())]);
  await espera(2000);
  v = V ? await lee(V) : null;
  const chat = await A.evaluate(() => { const e = document.querySelector('#llamada'); return { tarjeta: !!(e.getClientRects().length && getComputedStyle(e).display !== 'none'), inerte: document.querySelector('#app').hasAttribute('inert') }; });
  comprueba(!!v && v.rem && v.remAncho > 0 && !chat.tarjeta && !chat.inerte, '3. «Ver el chat»: la llamada en su ventana y el chat libre', { v: v && { rem: v.rem, ancho: v.remAncho }, chat });
  await oculta(A, true); await espera(800); await oculta(A, false); await espera(1200);
  comprueba(!!V && !V.isClosed(), '3. al dejar y volver a la pestaña, la ventana de «Ver el chat» sigue');
  if (V) await V.close();
  await espera(2500);
  const vuelta = await A.evaluate(() => { const e = document.querySelector('#llamada'); return { tarjeta: !!(e.getClientRects().length && getComputedStyle(e).display !== 'none'), mini: e.classList.contains('mini') }; });
  comprueba(vuelta.tarjeta && vuelta.mini, '3. al cerrarla con su ×, vuelve la tarjeta pequeña', vuelta);
  comprueba((await estado(A)) === 'hablando', '3. y la llamada sigue');
  await A.evaluate(() => document.querySelector('#ll-videos').click()); await espera(600);

  // 4. colgar desde la ventana
  [V] = await Promise.all([ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null), oculta(A, true)]);
  await espera(2000);
  if (V) await V.evaluate(() => document.querySelector('.vf-colgar').click()).catch(() => {});
  const fin = await hasta(async () => (await estado(A)) !== 'hablando' && (await estado(B)) !== 'hablando', 10000);
  await espera(1500);
  comprueba(fin && (!V || V.isClosed()), '4. «colgar» en la ventana: se termina para los dos y la ventana se cierra', { A: await estado(A), B: await estado(B), cerrada: !V || V.isClosed() });
  await oculta(A, false);

  // 5. un programa anterior, sin la marca
  const s = await llamada(browser, false);
  await oculta(s.A, true); await espera(2500);
  const pedidas = await s.A.evaluate(() => window.__abiertas.slice());
  comprueba(!pedidas.includes('guardiana-flotante') && s.ctx.pages().length === 1, '5. sin la marca (un programa anterior), la página no pide ninguna ventana', { pedidas, paginas: s.ctx.pages().length });
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
