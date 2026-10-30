// El botón de enviar del chat (dueño, 29 Oct 2026, 07:53: «me sale el botón nuestro, pero luego me sale como un símbolo de OK… que
// eso… hace como que se lía… Fíjate en la interfaz de otro… para que quede fácil y se mueva lo mínimo posible y al tocarlo sepa uno
// que lo ha tocado… Para que no se mezcle con el teclado»). Capturas del campo con texto, con el teclado simulado, y comprobaciones:
// el botón no se mueve al pasar de micrófono a enviar, es redondo y de color, y al tocarlo se nota.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'enviar');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function telefono(browser) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
const caja = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), vis: cs.display !== 'none' && r.width > 0, fondo: cs.backgroundColor, tr: cs.transform }; }, s);
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const A = await telefono(browser), B = await telefono(browser);
  await A.goto(URL0); await espera(1500);
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(900);
  const url = String((await A.evaluate(() => window.__compartidos[0])).url);
  await B.goto(url); await espera(1500); if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si'); await espera(5000);
  // el teclado: la página se queda con la mitad de alto (como en revision2.js)
  await A.tap('#texto'); await A.setViewportSize({ width: 393, height: 793 - 336 }); await espera(700);
  const mic = await caja(A, '#grabar');
  await A.screenshot({ path: path.join(OUT, '1-sin-texto.png'), clip: { x: 0, y: 457 - 120, width: 393, height: 120 } });
  await A.keyboard.type('Hola, ¿qué tal?'); await espera(300);
  const env = await caja(A, '#enviar');
  await A.screenshot({ path: path.join(OUT, '2-con-texto.png'), clip: { x: 0, y: 457 - 120, width: 393, height: 120 } });
  console.log('     micrófono', JSON.stringify(mic), '· enviar', JSON.stringify(env));
  comprueba(env.vis && mic && Math.abs(env.x - mic.x) <= 1 && Math.abs(env.y - mic.y) <= 1 && env.w === mic.w, 'enviar sale en el mismo sitio y tamaño que el micrófono (no se mueve)');
  comprueba(env.w >= 44 && env.h >= 44, 'enviar: al menos 44 px');
  comprueba(env.fondo !== 'rgba(0, 0, 0, 0)', 'enviar: círculo de color', env.fondo);
  comprueba(env.y + env.h <= 457 - 8, 'enviar: separado del borde del teclado (8 px o más)', 457 - (env.y + env.h));
  // al tocarlo se nota: mientras se pulsa, se hunde
  await A.evaluate(() => document.querySelector('#enviar').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' })));
  await espera(120);
  const pulsado = await caja(A, '#enviar');
  await A.screenshot({ path: path.join(OUT, '3-pulsado.png'), clip: { x: 0, y: 457 - 120, width: 393, height: 120 } });
  comprueba(pulsado.tr !== 'none' || pulsado.fondo !== env.fondo, 'al pulsar, se nota (se hunde o cambia de color)', pulsado.tr);
  await A.evaluate(() => document.querySelector('#enviar').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' })));
  await A.tap('#enviar'); await espera(600);
  const ultimo = await B.evaluate(() => { const xs = [...document.querySelectorAll('.gc-burbuja.gc-suya')]; return xs.length ? xs[xs.length - 1].textContent : ''; });
  comprueba(/Hola, ¿qué tal\?/.test(ultimo), 'el mensaje llega', ultimo.slice(0, 40));
  comprueba(await A.evaluate(() => document.activeElement === document.querySelector('#texto')), 'tras enviar, el teclado sigue abierto para seguir escribiendo');
  await A.screenshot({ path: path.join(OUT, '4-enviado.png') });
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
