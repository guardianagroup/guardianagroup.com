// La llamada aguanta los cortes de la conexión con el relé (dueño, 29 Oct 2026, 14:49: «la llamada y la videollamada… que nada
// falle»). Antes, si la conexión de la otra persona con el relé se cortaba un momento (el teléfono la duerme, cambia de wifi a datos),
// la llamada se colgaba aunque la voz siguiera pasando. Ahora: hablando, sigue; sonando, la llamada se vuelve a mandar cuando la otra
// persona vuelve; y si quien llama desaparece, el que recibe deja de sonar a los 12 s.
// Usage: node llamada-corte.js <outdir>
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1&numero=0';
const UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt, extra) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined && !cond ? '  ' + JSON.stringify(extra) : '')); if (!cond) fallos.push(txt); };
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(200); } return false; };

async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estadoLl = (p) => p.evaluate(() => window.gcomPrueba.llamada());

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B');
  await A.goto(URL0); await espera(1500);
  await A.click('#nueva-blindada'); await espera(400); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(2000);
  const enlace = await A.evaluate(() => window.gcomPrueba.enlace());
  await B.goto(enlace.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(1500);
  if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si');
  await hasta(A, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella && c.sesion); }, 12000);
  await espera(1500);

  // 1. hablando: la conexión de B con el relé se corta y vuelve → la llamada sigue
  await A.click('#llamar'); await espera(2500);
  comprueba(await hasta(B, () => !!document.querySelector('#ll-contestar') && getComputedStyle(document.querySelector('#ll-contestar')).display !== 'none', 6000), 'a B le suena la llamada');
  await B.click('#ll-contestar');
  comprueba(await hasta(A, () => window.gcomPrueba.llamada() === 'hablando', 10000), 'hablando');
  await espera(1500);
  await B.evaluate(() => window.gcomPrueba.corta()); await espera(6000);
  comprueba(await estadoLl(A) === 'hablando' && await estadoLl(B) === 'hablando', 'tras un corte de la conexión de B con el relé, los dos siguen hablando', [await estadoLl(A), await estadoLl(B)]);
  const t1 = await A.evaluate(() => document.querySelector('#ll-tiempo').textContent);
  await espera(2500);
  const t2 = await A.evaluate(() => document.querySelector('#ll-tiempo').textContent);
  comprueba(t1 !== t2, 'el tiempo de la llamada sigue corriendo (' + t1 + ' → ' + t2 + ')');
  await A.evaluate(() => document.querySelector('#ll-colgar').click());
  comprueba(await hasta(B, () => window.gcomPrueba.llamada() === 'libre', 8000), 'al colgar A, B también cuelga (la sesión volvió)');
  await espera(2500);

  // 2. llamando: B se va un momento justo al empezar a sonar y vuelve → le vuelve a sonar
  await B.evaluate(() => window.gcomPrueba.corta());
  await espera(300);
  await A.click('#llamar'); await espera(500);
  const a0 = await estadoLl(A);
  comprueba(await hasta(B, () => window.gcomPrueba.llamada() === 'entrante', 15000), 'B vuelve y le suena la llamada (A: ' + a0 + ')');
  if (await estadoLl(B) === 'entrante') { await B.click('#ll-contestar'); comprueba(await hasta(A, () => window.gcomPrueba.llamada() === 'hablando', 12000), 'y se habla'); }
  await A.evaluate(() => { const b = document.querySelector('#ll-colgar'); if (b) b.click(); });
  await hasta(B, () => window.gcomPrueba.llamada() === 'libre', 8000); await espera(2500);

  // 3. quien llama desaparece (cierra la app) mientras suena: a B deja de sonarle en unos segundos
  await A.click('#llamar');
  comprueba(await hasta(B, () => window.gcomPrueba.llamada() === 'entrante', 8000), 'suena otra vez');
  await A.close();
  comprueba(await hasta(B, () => window.gcomPrueba.llamada() === 'libre', 20000), 'quien llamaba se fue: a B deja de sonarle en ≤ 20 s');

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
