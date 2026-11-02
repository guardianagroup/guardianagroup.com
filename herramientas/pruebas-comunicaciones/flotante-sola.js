// La ventana flotante sola en el ordenador (dueño, 2 Nov 2026, 13:43–13:53; ronda 90). Hecha a partir de pantalla.js.
// A y B (PC) en videollamada. El navegador de la prueba no abre ventanas flotantes de verdad: se anota lo que la página le pide.
//   1. Durante la videollamada, la página le da al navegador las cuatro acciones: abrir la ventana flotante sola al cambiar de
//      pestaña, y en esa ventana, micrófono, cámara y colgar.
//   2. «Al cambiar de pestaña» (la acción del navegador): sale la otra persona en la ventana flotante.
//   3. Al volver a la pestaña, la ventana que se abrió sola se cierra.
//   4. El micrófono y la cámara desde la ventana flotante: la llamada y la ventana dicen lo mismo. En el PC no sale «Flotante».
//   5. Colgar desde la ventana flotante: se termina para los dos y las acciones se quitan.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'flotante-sola');
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
    // lo que la página le pide al navegador: acciones de Media Session, estado del micrófono y la cámara, ventana flotante
    window.__acciones = {}; window.__mic = []; window.__cam = []; window.__pip = []; window.__pipFuera = 0; let enPip = null;
    const ms = navigator.mediaSession;
    if (ms) {
      ms.setActionHandler = (a, f) => { window.__acciones[a] = f || null; };
      ms.setMicrophoneActive = (x) => { window.__mic.push(!!x); return Promise.resolve(); };
      ms.setCameraActive = (x) => { window.__cam.push(!!x); return Promise.resolve(); };
    }
    Object.defineProperty(Document.prototype, 'pictureInPictureElement', { configurable: true, get: () => enPip });
    Object.defineProperty(Document.prototype, 'pictureInPictureEnabled', { configurable: true, get: () => true });
    HTMLVideoElement.prototype.requestPictureInPicture = function () { window.__pip.push(this.id); enPip = this; return Promise.resolve({ width: 320, height: 180 }); };
    Document.prototype.exitPictureInPicture = function () { window.__pipFuera++; enPip = null; return Promise.resolve(); };
    // para poder decir «la pestaña está a la vista otra vez»
    window.__vista = 'visible';
    Object.defineProperty(Document.prototype, 'visibilityState', { configurable: true, get: () => window.__vista });
    Object.defineProperty(Document.prototype, 'hidden', { configurable: true, get: () => window.__vista !== 'visible' });
  });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await equipo(browser, 'A'), B = await equipo(browser, 'B');
  await B.goto(URL0); await espera(1500);
  await B.evaluate(() => { window.__copiados = []; try { navigator.clipboard.writeText = (x) => { window.__copiados.push(String(x)); return Promise.resolve(); }; } catch (_) {} });
  await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
  const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
  const antes = await A.evaluate(() => Object.keys(window.__acciones).filter((k) => window.__acciones[k]));
  comprueba(!antes.includes('enterpictureinpicture'), '0. sin llamada, la página no pide la ventana flotante', antes);
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2500);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada');
  await espera(3000);
  // 1. las cuatro acciones
  const acc = await A.evaluate(() => Object.keys(window.__acciones).filter((k) => typeof window.__acciones[k] === 'function').sort());
  comprueba(['enterpictureinpicture', 'hangup', 'togglecamera', 'togglemicrophone'].every((k) => acc.includes(k)), '1. la página da al navegador: ventana flotante sola, micrófono, cámara y colgar', acc);
  const ini = await A.evaluate(() => ({ mic: window.__mic[window.__mic.length - 1], cam: window.__cam[window.__cam.length - 1] }));
  comprueba(ini.mic === true && ini.cam === true, '1. y le dice que el micrófono y la cámara están encendidos', ini);
  // 2. cambia de pestaña: el navegador llama a la acción
  await A.evaluate(() => { window.__vista = 'hidden'; document.dispatchEvent(new Event('visibilitychange')); window.__acciones.enterpictureinpicture({ action: 'enterpictureinpicture' }); });
  await espera(500);
  const pip = await A.evaluate(() => window.__pip.slice());
  comprueba(pip.length === 1 && pip[0] === 'v-remoto', '2. al cambiar de pestaña, la otra persona en la ventana flotante', pip);
  // 3. vuelve a la pestaña
  await A.evaluate(() => { window.__vista = 'visible'; document.dispatchEvent(new Event('visibilitychange')); });
  await espera(600);
  const fuera = await A.evaluate(() => ({ cerrada: window.__pipFuera, el: !!document.pictureInPictureElement }));
  comprueba(fuera.cerrada === 1 && !fuera.el, '3. al volver a la pestaña, la ventana que se abrió sola se cierra', fuera);
  comprueba((await estado(A)) === 'hablando', '3. y la llamada sigue');
  // 4. micrófono y cámara desde la ventana flotante
  await A.evaluate(() => window.__acciones.togglemicrophone({ action: 'togglemicrophone' })); await espera(300);
  const m1 = await A.evaluate(() => ({ boton: document.querySelector('#ll-silenciar').getAttribute('aria-pressed'), dice: window.__mic[window.__mic.length - 1] }));
  comprueba(m1.boton === 'true' && m1.dice === false, '4. «micrófono» en la ventana: silenciado, y la ventana lo sabe', m1);
  await A.evaluate(() => window.__acciones.togglemicrophone({ action: 'togglemicrophone' })); await espera(300);
  const m2 = await A.evaluate(() => ({ boton: document.querySelector('#ll-silenciar').getAttribute('aria-pressed'), dice: window.__mic[window.__mic.length - 1] }));
  comprueba(m2.boton === 'false' && m2.dice === true, '4. otra vez: vuelve el micrófono', m2);
  await A.evaluate(() => window.__acciones.togglecamera({ action: 'togglecamera' })); await espera(500);
  const c1 = await A.evaluate(() => ({ boton: document.querySelector('#ll-camara').getAttribute('aria-pressed'), dice: window.__cam[window.__cam.length - 1] }));
  comprueba(c1.boton === 'true' && c1.dice === false, '4. «cámara» en la ventana: apagada, y la ventana lo sabe', c1);
  await A.evaluate(() => window.__acciones.togglecamera({ action: 'togglecamera' })); await espera(500);
  const c2 = await A.evaluate(() => ({ boton: document.querySelector('#ll-camara').getAttribute('aria-pressed'), dice: window.__cam[window.__cam.length - 1] }));
  comprueba(c2.boton === 'false' && c2.dice === true, '4. otra vez: vuelve la cámara', c2);
  // 4b. en el PC no sale «Flotante» (la ventana sale sola al cambiar de pestaña; el botón dejaba la llamada en negro)
  comprueba(!(await visible(A, '#ll-flotante')), '4. en el PC no sale el botón «Flotante»');
  // 5. colgar desde la ventana flotante
  await A.screenshot({ path: path.join(OUT, '5-a-antes-de-colgar.png') });
  await A.evaluate(() => window.__acciones.hangup({ action: 'hangup' }));
  const fin = await hasta(async () => (await estado(A)) !== 'hablando' && (await estado(B)) !== 'hablando', 10000);
  comprueba(fin, '5. «colgar» en la ventana: se termina para los dos', { A: await estado(A), B: await estado(B) });
  await espera(2500);
  const quedan = await A.evaluate(() => Object.keys(window.__acciones).filter((k) => typeof window.__acciones[k] === 'function'));
  comprueba(!quedan.some((k) => ['enterpictureinpicture', 'togglemicrophone', 'togglecamera', 'hangup'].includes(k)), '5. y la página quita las acciones', quedan);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
