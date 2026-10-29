// Notas de voz (dueño, 29 Oct 2026, 12:03: «los segundos van como raros y la barra… a tirones… y no me escucho»): la nota viaja con
// su duración, el reproductor propio muestra el tiempo correcto, la barra avanza suave y se puede saltar tocando; quien la envió
// también la puede oír.
// Usage: node voz.js <outdir>
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1';
const UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(150); } return false; };

async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['microphone'] });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const foto = async (p, n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); };
// en el blindado el chat va borroso (modo discreto): la captura, con el dedo puesto
const fotoDestapada = async (p, n) => { await p.mouse.move(196, 300); await p.mouse.down(); await espera(250); await foto(p, n); await p.mouse.up(); await espera(200); };
const estadoVoz = (p, sel) => p.evaluate((s) => { const d = document.querySelector(s); if (!d) return null; const au = d.querySelector('audio'); return { t: d.querySelector('.gc-voz-t').textContent, w: d.querySelector('.gc-voz-prog').style.width, sonando: d.classList.contains('sonando'), paused: au.paused, cur: au.currentTime, dur: au.duration }; }, sel);

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B');
  await A.goto(URL0); await espera(1500);
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(2500);
  const enlace = await A.evaluate(() => { const i = document.querySelector('#enlace-b'); return i && i.value; });
  if (!enlace) { console.log('sin enlace'); await browser.close(); process.exit(1); }
  await B.goto(enlace.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(2000);
  if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si');
  await espera(5000);
  // A graba 3 segundos y envía
  await A.click('#grabar'); await espera(3200); await A.click('#grabar');
  comprueba(await hasta(A, () => !!document.querySelector('.gc-mia .gc-voz'), 8000), 'A: la nota de voz enviada tiene el reproductor propio');
  comprueba(await hasta(A, () => { const t = document.querySelector('.gc-mia .gc-voz .gc-voz-t'); return !!t && /^0:00 \/ 0:0[2-4]$/.test(t.textContent); }, 8000), 'A: el tiempo total es el de la grabación (' + (await A.evaluate(() => { const t = document.querySelector('.gc-mia .gc-voz .gc-voz-t'); return t && t.textContent; })) + ')');
  // B la recibe velada (blindado) → Mostrar
  comprueba(await hasta(B, () => !!document.querySelector('.gc-velada') || !!document.querySelector('.gc-suya .gc-voz'), 8000), 'B: la nota llega');
  if (await B.$('.gc-velada')) { await B.evaluate(() => document.querySelector('.gc-velada .gc-velo-botones .boton.principal').click()); await espera(800); }
  comprueba(await hasta(B, () => !!document.querySelector('.gc-suya .gc-voz'), 8000), 'B: reproductor propio en la nota recibida');
  comprueba(await hasta(B, () => { const t = document.querySelector('.gc-suya .gc-voz .gc-voz-t'); return !!t && /^0:00 \/ 0:0[2-4]$/.test(t.textContent); }, 8000), 'B: duración conocida sin esperar al navegador (' + (await B.evaluate(() => { const t = document.querySelector('.gc-suya .gc-voz .gc-voz-t'); return t && t.textContent; })) + ')');
  await espera(1500); // la tarjeta se vuelve a pintar al cambiar de estado (entregado, leído): se espera a que se asiente
  // B reproduce: la barra avanza y el tiempo corre; al acabar vuelve a 0:00
  await B.click('.gc-suya .gc-voz-play'); await espera(1200);
  const b1 = await estadoVoz(B, '.gc-suya .gc-voz');
  comprueba(b1 && b1.sonando && !b1.paused && parseFloat(b1.w) > 10, 'B: al reproducir, la barra avanza suave (' + (b1 && b1.w) + ', ' + (b1 && b1.t) + ')');
  // tocar en la barra salta a ese punto
  const r = await B.evaluate(() => { const b = document.querySelector('.gc-suya .gc-voz-barra').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
  await B.mouse.click(r.x + r.w * 0.2, r.y + r.h / 2); await espera(300);
  const b2 = await estadoVoz(B, '.gc-suya .gc-voz');
  comprueba(b2 && parseFloat(b2.w) < 45, 'B: tocar la barra salta a ese punto (' + (b2 && b2.w) + ')');
  comprueba(await hasta(B, () => { const d = document.querySelector('.gc-suya .gc-voz'); return !d.classList.contains('sonando') && d.querySelector('.gc-voz-t').textContent.startsWith('0:00'); }, 8000), 'B: al terminar, vuelve al principio');
  await B.click('.gc-suya .gc-voz-play'); await espera(700); await fotoDestapada(B, '40-B-voz-sonando'); await B.click('.gc-suya .gc-voz-play');
  // A se oye a sí misma: su propia nota también se reproduce
  await A.click('.gc-mia .gc-voz-play'); await espera(900);
  const a1 = await estadoVoz(A, '.gc-mia .gc-voz');
  comprueba(a1 && a1.sonando && !a1.paused && a1.cur > 0.3, 'A: quien la envió también la oye (' + (a1 && a1.t) + ')');
  await fotoDestapada(A, '41-A-voz-propia');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
