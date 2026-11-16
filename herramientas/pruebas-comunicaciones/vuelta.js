// Ir a Órbita en mitad de una videollamada Ultra y volver (dueño, 16 Nov 2026, 10:32: «nos llegamos a conectar, pero después le
// damos a ver mis datos en Órbita y la llamada sigue, pero se pierde todo. Volvemos al chat y ya no nos vemos»). El navegador de la
// prueba no cambia de pestaña de verdad: aquí se dan, en su orden, las mismas señales que da cada uno al irse y al volver.
//   · Chrome (B): la pestaña nueva de Órbita, la ventana pierde el foco, la pestaña queda oculta y Chrome pide la ventana flotante
//     (Document Picture-in-Picture); al volver, la pestaña se ve y recupera el foco.
//   · El programa (A, la página marcada data-en-programa, sin la ventana de Chrome): la pestaña nueva, la vista pierde el foco y
//     queda oculta; al volver, se ve, pero el programa no siempre le devuelve el foco hasta que se toca.
// En los dos, después de volver: la llamada se ve (nada la tapa en el centro), la imagen de la otra persona se mueve, y la otra
// persona ve la mía moverse. Y mientras se está fuera, la otra persona sigue viendo moverse la imagen (más de 3 imágenes por
// segundo con la cámara de la prueba y Órbita abierta: congelada sería una o ninguna).
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'vuelta');
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
    if (window.top !== window || window.opener || !/comunicaciones/.test(location.pathname)) return;
    window.__acciones = {};
    const ms = navigator.mediaSession;
    if (ms) { ms.setActionHandler = (a, f) => { window.__acciones[a] = f || null; }; ms.setMicrophoneActive = () => Promise.resolve(); ms.setCameraActive = () => Promise.resolve(); }
    window.__vista = 'visible'; window.__fondo = false; window.__foco = true;
    Object.defineProperty(Document.prototype, 'visibilityState', { configurable: true, get: () => window.__vista });
    Object.defineProperty(Document.prototype, 'hidden', { configurable: true, get: () => window.__vista !== 'visible' });
    Document.prototype.hasFocus = function () { return window.__foco; };
    const si = window.setInterval;
    window.setInterval = function (fn, ms, ...args) {
      if (typeof fn !== 'function') return si.call(window, fn, ms, ...args);
      let ult = 0;
      return si.call(window, function () { if (window.__fondo) { const n = performance.now(); if (n - ult < 1000) return; ult = n; } return fn.apply(this, arguments); }, ms, ...args);
    };
    if (programa) {
      try { Object.defineProperty(window, 'documentPictureInPicture', { configurable: true, value: undefined }); } catch (_) {}
      new MutationObserver((_, o) => { if (document.documentElement) { document.documentElement.dataset.enPrograma = '1'; o.disconnect(); } }).observe(document, { childList: true });
    } else {
      const dpip = { window: null, requestWindow(op) {
        const f = document.createElement('iframe'); f.id = '__vf';
        f.style.cssText = 'position:fixed;right:20px;bottom:20px;width:400px;height:260px;border:0;z-index:2147483647;background:#000';
        document.documentElement.append(f);
        const w = f.contentWindow;
        w.close = () => { if (!f.isConnected) return; try { w.dispatchEvent(new Event('pagehide')); } catch (_) {} f.remove(); dpip.window = null; };
        dpip.window = w; return Promise.resolve(w);
      } };
      Object.defineProperty(window, 'documentPictureInPicture', { configurable: true, value: dpip });
    }
  }, !!programa);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return { p, ctx };
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(250); } return false; };
const enSesion = (P) => P.evaluate(() => [...((window.GuardianaCom && GuardianaCom.convs) || new Map()).values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada));
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
const fotogramas = (P, ms) => P.evaluate(async (ms) => {
  const v = document.querySelector('#v-remoto'); if (!v || !v.getVideoPlaybackQuality) return -1;
  const a = v.getVideoPlaybackQuality().totalVideoFrames; await new Promise((r) => setTimeout(r, ms));
  return +((v.getVideoPlaybackQuality().totalVideoFrames - a) / (ms / 1000)).toFixed(1);
}, ms);
// lo que se ve en el centro de la imagen de la otra persona: la llamada, o lo que la tape
const centro = (P) => P.evaluate(() => {
  const v = document.querySelector('#v-remoto'); const r = v && v.getBoundingClientRect();
  if (!r || !r.width) return { que: 'sin imagen' };
  const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { que: e ? (e.id || e.className || e.tagName).toString().slice(0, 40) : 'nada', llamada: !!(e && e.closest('#llamada')), pausado: v.paused, oculto: v.hidden };
});
async function vete(P, chrome) {
  // la pestaña de Órbita (de verdad: el botón del monitor la abre)
  await P.evaluate((chrome) => {
    const b = document.querySelector('#ll-mon-orbita'); if (b) b.click(); else window.open('/orbita/#llamada', '_blank', 'noopener');
    window.__foco = false; dispatchEvent(new Event('blur'));
    window.__vista = 'hidden'; window.__fondo = true; document.dispatchEvent(new Event('visibilitychange'));
    if (chrome && window.__acciones.enterpictureinpicture) window.__acciones.enterpictureinpicture({ action: 'enterpictureinpicture' });
  }, chrome);
}
async function vuelve(P, foco) {
  await P.evaluate((foco) => {
    window.__vista = 'visible'; window.__fondo = false; document.dispatchEvent(new Event('visibilitychange'));
    if (foco) { window.__foco = true; dispatchEvent(new Event('focus')); }
  }, foco);
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--disable-popup-blocking'] });
  const { p: B, ctx: cB } = await equipo(browser, 'B', false), { p: A, ctx: cA } = await equipo(browser, 'A', true);
  await A.goto(URL0 + '?plan=plus'); await espera(1500);
  await A.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
  const url = String(await A.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await B.goto(url); await espera(1500); if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si');
  comprueba(await hasta(async () => (await enSesion(A)) && (await enSesion(B)), 20000), '0. conversación Ultra entre A (programa) y B (Chrome)');
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada Ultra');
  await espera(3500);
  comprueba((await fotogramas(A, 2000)) >= 3 && (await fotogramas(B, 2000)) >= 3, '0. se ven los dos');

  // B (Chrome) se va a Órbita
  await vete(B, true); await espera(6000);
  const aVeB = await fotogramas(A, 3000);
  comprueba(aVeB >= 3, '1. B en Órbita: A sigue viendo moverse a B', aVeB);
  const vfB = await B.evaluate(() => { const w = window.documentPictureInPicture.window; const r = w && w.document.querySelector('.vf-rem'); return { abierta: !!w, ancho: r ? r.videoWidth : 0 }; });
  comprueba(vfB.abierta && vfB.ancho > 0, '1. y B ve a A en la ventana flotante', vfB);
  await vuelve(B, true); await espera(2500);
  let cB2 = await centro(B); const bVeA = await fotogramas(B, 3000);
  await B.screenshot({ path: path.join(OUT, '2-b-vuelve.png') });
  comprueba(cB2.llamada && !cB2.pausado && !cB2.oculto, '2. B vuelve de Órbita: la llamada se ve, nada la tapa', cB2);
  comprueba(bVeA >= 3, '2. y la imagen de A se mueve en B', bVeA);

  // A (el programa) se va a Órbita y vuelve sin que el programa le devuelva el foco
  await vete(A, false); await espera(6000);
  const bVeA2 = await fotogramas(B, 3000);
  comprueba(bVeA2 >= 3, '3. A en Órbita: B sigue viendo moverse a A', bVeA2);
  await vuelve(A, false); await espera(2500);
  let cA2 = await centro(A); const aVeB2 = await fotogramas(A, 3000);
  await A.screenshot({ path: path.join(OUT, '4-a-vuelve-sin-foco.png') });
  comprueba(cA2.llamada && !cA2.pausado && !cA2.oculto, '4. A vuelve de Órbita (sin foco): la llamada se ve, nada la tapa', cA2);
  comprueba(aVeB2 >= 3, '4. y la imagen de B se mueve en A', aVeB2);
  comprueba((await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', '5. la llamada sigue en los dos');
  for (const c of [cA, cB]) for (const p of c.pages()) if (p !== A && p !== B) await p.close().catch(() => {});
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
