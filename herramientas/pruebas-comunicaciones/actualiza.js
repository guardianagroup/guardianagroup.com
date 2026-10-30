// Actualización sola (dueño, 29 Oct 2026, 08:09: «si hacemos actualizaciones, quiero que se actualice automáticamente… o cuando la
// abra»). Se simula una versión nueva de la página (otra «?v=» de app.js) y se comprueba: no se recarga con texto a medias; en
// cuanto se puede, se recarga sola y vuelve al mismo chat; y no entra en bucle si la copia nueva no llega.
'use strict';
const { chromium } = require('playwright');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function telefono(browser) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; try { Object.defineProperty(navigator, 'standalone', { get: () => true }); sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
// volver a la app: lo que hace el teléfono al traerla al frente
const vuelve = (P) => P.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const A = await telefono(browser), B = await telefono(browser);
  await A.goto(URL0); await espera(1500);
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(900);
  const url = String((await A.evaluate(() => window.__compartidos[0])).url);
  await B.goto(url); await espera(1500); if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si'); await espera(5000);
  comprueba(await A.evaluate(() => !document.querySelector('#conv').hidden), 'A está en el chat');
  // la versión nueva: la misma página con otra «?v=» de app.js (solo para la comprobación de la versión)
  let nueva = null;
  await A.route('**/orbita/comunicaciones/?version=*', async (r) => {
    if (!nueva) { const res = await r.fetch({ url: URL0 }); nueva = (await res.text()).replace(/app\.js\?v=[\w-]+/, 'app.js?v=prueba-nueva'); }
    await r.fulfill({ status: 200, contentType: 'text/html', body: nueva });
  });
  let cargas = 0; A.on('load', () => { cargas++; });
  // con texto a medias, no se recarga
  await A.tap('#texto'); await A.fill('#texto', 'Estoy escribiendo…'); await A.evaluate(() => document.activeElement.blur());
  await vuelve(A); await espera(3500);
  comprueba(cargas === 0, 'con texto a medias, no se recarga');
  // al borrar el texto, en el siguiente intento (cada 20 s) se recarga
  await A.fill('#texto', ''); await espera(23000);
  comprueba(cargas === 1, 'sin nada a medias, se recarga sola', cargas);
  await espera(2500);
  const despues = await A.evaluate(() => ({ chat: !document.querySelector('#conv').hidden, texto: !!document.querySelector('#texto') }));
  comprueba(despues.chat, 'y vuelve al mismo chat');
  // sin bucles: la copia que llegó sigue siendo la vieja (la ruta solo cambia la comprobación) y no se recarga otra vez
  await vuelve(A); await espera(4000); await vuelve(A); await espera(4000);
  comprueba(cargas === 1, 'no entra en bucle si la versión nueva aún no llega', cargas);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
