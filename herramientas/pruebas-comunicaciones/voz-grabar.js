// Grabar como en WhatsApp (dueño, 29 Oct 2026, 20:51: «la forma de grabar hazla como en wassap o otras app de chat profesionales»;
// 20:54: «cuando ya un audio se ha escuchado… tiene que volver… a la barra de inicio… el botón de play otra vez»). Comprueba: mantener
// pulsado graba y soltar envía; un toque corto no envía (y lo explica); deslizar a la izquierda cancela; deslizar hacia arriba deja la
// grabación fija (papelera y «Enviar»); mientras se graba, el tiempo y la onda; con ratón, un clic empieza y «Enviar» manda. Y el
// reproductor: la caja tipo WhatsApp (play, barra, tiempo abajo a la izquierda y la hora a la derecha), la bolita avanza con transform,
// al acabar vuelve a 0:00 con «play». La nota viaja de una pieza (sin trozos).
// Usage: node voz-grabar.js <outdir>
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1&numero=0';
const UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt, extra) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined && !cond ? '  ' + JSON.stringify(extra) : '')); if (!cond) fallos.push(txt); };
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(150); } return false; };

async function equipo(browser, nombre, ua) {
  const movil = ua !== PC;
  const ctx = await browser.newContext({ viewport: movil ? { width: 393, height: 793 } : { width: 1100, height: 760 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil, userAgent: ua, locale: 'es-ES', permissions: ['microphone'] });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const foto = async (p, n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); };
const grabando = (p) => p.evaluate(() => ({ ya: document.querySelector('.gc-compositor').classList.contains('grabando-ya'), fija: document.querySelector('.gc-compositor').classList.contains('grab-fija'), t: document.querySelector('#grabando-t').textContent, candado: !document.querySelector('#grabando-candado').hidden, desliza: getComputedStyle(document.querySelector('#grabando-desliza')).display !== 'none', papelera: getComputedStyle(document.querySelector('#grabar-cancelar')).display !== 'none', enviar: getComputedStyle(document.querySelector('#enviar')).display !== 'none', mic: getComputedStyle(document.querySelector('#grabar')).display !== 'none' }));
const centro = async (p, sel) => { const r = await p.evaluate((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel); return r; };
const notas = (p, sel) => p.evaluate((s) => document.querySelectorAll(s + ' .gc-voz').length, sel);
// el dedo: bajar, mover (en pasos) y soltar, con eventos táctiles de verdad (pointer events del navegador)
async function dedo(p, desde, pasos, ms, soltar) {
  const cdp = await p.context().newCDPSession(p);
  const toca = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await toca('touchStart', desde.x, desde.y);
  let x = desde.x, y = desde.y;
  for (const [dx, dy, t] of pasos) { const n = 6; for (let k = 1; k <= n; k++) { await toca('touchMove', x + dx * k / n, y + dy * k / n); await espera(Math.max(8, t / n)); } x += dx; y += dy; }
  if (ms) await espera(ms);
  if (soltar !== false) await toca('touchEnd', x, y);
  await cdp.detach();
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await equipo(browser, 'A', UA), B = await equipo(browser, 'B', UA);
  await A.goto(URL0); await espera(1500);
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(2500);
  const enlace = await A.evaluate(() => window.gcomPrueba.enlace());
  await B.goto(enlace.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(2000);
  if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si');
  comprueba(await hasta(B, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella && c.sesion); }, 15000), 'los dos conectados');
  await espera(1500);
  for (const h of await A.$$('.gc-hoja.gc-abierta')) { try { await A.evaluate((e) => e.classList.remove('gc-abierta'), h); } catch (_) {} }
  const mic = await centro(A, '#grabar');

  // 1. toque corto: no se envía nada y se explica
  await dedo(A, mic, [], 150);
  await espera(900);
  comprueba(await A.evaluate(() => !document.querySelector('.gc-compositor').classList.contains('grabando-ya')), 'toque corto: no queda grabando');
  comprueba(await hasta(A, () => /Mantén pulsado el micrófono/.test(document.body.textContent), 3000), 'toque corto: «Mantén pulsado el micrófono para grabar y suelta para enviar»');
  comprueba(await notas(A, '.gc-mia') === 0, 'toque corto: no se envía nada');

  // 2. mantener pulsado graba (tiempo, onda, candado, «Desliza para cancelar») y soltar envía
  const cdp = await A.context().newCDPSession(A);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: mic.x, y: mic.y }] });
  await espera(1200);
  const g1 = await grabando(A);
  comprueba(g1.ya && !g1.fija && g1.candado && g1.desliza && !g1.papelera && !g1.enviar && g1.mic, 'mantener pulsado: grabando, con el candado arriba y «Desliza para cancelar»', g1);
  await espera(1400);
  comprueba(/^0:0[2-3]$/.test((await grabando(A)).t), 'el tiempo corre (' + (await grabando(A)).t + ')');
  comprueba(await A.evaluate(() => { const c = document.querySelector('#grabando-onda'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let k = 3; k < d.length; k += 4) if (d[k]) n++; return n > 20; }), 'la onda de la voz se dibuja');
  await foto(A, '50-grabando');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  comprueba(await hasta(A, () => !document.querySelector('.gc-compositor').classList.contains('grabando-ya'), 3000), 'soltar: termina la grabación');
  comprueba(await hasta(A, () => document.querySelectorAll('.gc-mia .gc-voz').length === 1, 10000), 'soltar: la nota se envía');
  comprueba(await hasta(A, () => { const t = document.querySelector('.gc-mia .gc-voz .gc-voz-t'); return !!t && /^0:00 \/ 0:0[2-4]$/.test(t.textContent); }, 8000), 'la nota dura lo grabado (' + (await A.evaluate(() => { const t = document.querySelector('.gc-mia .gc-voz .gc-voz-t'); return t ? t.textContent : ''; })) + ')');

  // 3. deslizar a la izquierda cancela
  await dedo(A, mic, [[-130, 0, 300]], 300);
  await espera(800);
  comprueba(await A.evaluate(() => !document.querySelector('.gc-compositor').classList.contains('grabando-ya')), 'deslizar a la izquierda: cancela');
  await espera(1500);
  comprueba(await notas(A, '.gc-mia') === 1, 'cancelar: no se envía nada');

  // 4. deslizar hacia arriba deja la grabación fija: papelera y «Enviar»; «Enviar» la manda
  await dedo(A, mic, [[0, -90, 300]], 200);
  await espera(600);
  const g2 = await grabando(A);
  comprueba(g2.ya && g2.fija && !g2.candado && !g2.desliza && g2.papelera && g2.enviar && !g2.mic, 'deslizar hacia arriba: grabación fija, con la papelera y «Enviar»', g2);
  await espera(1500);
  await foto(A, '51-grabando-fija');
  await A.click('#enviar');
  comprueba(await hasta(A, () => document.querySelectorAll('.gc-mia .gc-voz').length === 2, 10000), 'fija + «Enviar»: la nota se envía');
  // la papelera cancela
  await dedo(A, mic, [[0, -90, 300]], 200); await espera(1200);
  await A.click('#grabar-cancelar'); await espera(600);
  comprueba(await A.evaluate(() => !document.querySelector('.gc-compositor').classList.contains('grabando-ya')), 'fija + papelera: se cancela');
  await espera(1200);
  comprueba(await notas(A, '.gc-mia') === 2, 'papelera: no se envía nada');

  // 5. el reproductor: la caja tipo WhatsApp; al acabar, 0:00 y «play»
  comprueba(await hasta(B, () => document.querySelectorAll('.gc-suya .gc-voz').length === 2, 10000), 'B: recibe las dos notas');
  await espera(1500);
  const caja = await B.evaluate(() => { const bur = document.querySelector('.gc-suya.gc-burbuja-voz'); if (!bur) return null; const r = (s) => bur.querySelector(s).getBoundingClientRect(); const b = bur.getBoundingClientRect(), play = r('.gc-voz-play'), barra = r('.gc-voz-barra'), t = r('.gc-voz-t'), meta = r('.gc-meta'); return { playCentrado: Math.abs((play.top + play.bottom) / 2 - (b.top + b.bottom) / 2) < 4, barraDerechaDePlay: barra.left > play.right, tiempoAbajoIzq: t.top >= barra.bottom - 2 && t.left >= barra.left - 1, horaAbajoDer: meta.right <= b.right && meta.top >= barra.bottom - 2 && meta.left > t.left, margen: Math.round(b.right - meta.right) }; });
  comprueba(caja && caja.playCentrado && caja.barraDerechaDePlay && caja.tiempoAbajoIzq && caja.horaAbajoDer, 'B: la caja de la nota, como en WhatsApp: play centrado, tiempo abajo a la izquierda, hora a la derecha', caja);
  await B.click('.gc-suya .gc-voz-play'); await espera(900);
  const s1 = await B.evaluate(() => { const d = document.querySelector('.gc-suya .gc-voz'); return { sonando: d.classList.contains('sonando'), tr: d.querySelector('.gc-voz-prog').style.transform, punto: d.querySelector('.gc-voz-punto').style.transform }; });
  comprueba(s1.sonando && /scaleX\(0\.[1-9]/.test(s1.tr) && /translateX\([1-9]/.test(s1.punto), 'B: al reproducir, la barra y la bolita avanzan (con transform, suave)', s1);
  await foto(B, '52-B-sonando');
  comprueba(await hasta(B, () => { const d = document.querySelector('.gc-suya .gc-voz'); return !d.classList.contains('sonando') && d.querySelector('.gc-voz-t').textContent.startsWith('0:00') && d.querySelector('.gc-voz-prog').style.transform === 'scaleX(0)' && /Reproducir/.test(d.querySelector('.gc-voz-play').getAttribute('aria-label')); }, 9000), 'B: al acabar, vuelve a 0:00, la bolita al principio y el botón «play» otra vez (20:54)');
  await foto(B, '53-B-acabada');
  // parada muda al final (el iPhone a veces no avisa de «ended»): se vigila y se vuelve al principio igual
  await B.evaluate(() => { const d = document.querySelector('.gc-suya .gc-voz'); const au = d.querySelector('audio'); au.addEventListener('ended', (e) => e.stopImmediatePropagation(), true); });
  await B.click('.gc-suya .gc-voz-play');
  comprueba(await hasta(B, () => { const d = document.querySelector('.gc-suya .gc-voz'); return !d.classList.contains('sonando') && d.querySelector('.gc-voz-t').textContent.startsWith('0:00'); }, 9000), 'B: aunque el navegador no avise del final, vuelve al principio con «play»');

  // 6. con ratón (ordenador): un clic empieza (fija), «Enviar» la manda
  const P = await equipo(browser, 'PC', PC);
  await P.goto(enlace.replace('https://guardianagroup.com', 'http://127.0.0.1:8080').replace('#', '?x=1#')); await espera(1500);
  if (await P.$('#aceptar-si:visible')) await P.click('#aceptar-si');
  const P2 = await equipo(browser, 'PC2', PC);
  void P2;
  // (el PC entra en otro chat con A, para no mezclar)
  await A.click('#cvolver').catch(() => {});
  const PA = await equipo(browser, 'A2', UA);
  await PA.goto(URL0); await espera(1500);
  await PA.click('#nueva-blindada'); if (await PA.$('#h-invitar.gc-abierta')) await PA.click('#invitar-otra'); await espera(2500);
  const enlace2 = await PA.evaluate(() => window.gcomPrueba.enlace());
  await P.goto(enlace2.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(1500);
  if (await P.$('#aceptar-si:visible')) await P.click('#aceptar-si');
  comprueba(await hasta(P, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella && c.sesion); }, 15000), 'ordenador: conectado');
  await espera(1000);
  await P.click('#grabar'); await espera(1500);
  const g3 = await grabando(P);
  comprueba(g3.ya && g3.fija && g3.papelera && g3.enviar && !g3.mic, 'ordenador: un clic empieza a grabar, con la papelera y «Enviar»', g3);
  await P.click('#enviar');
  comprueba(await hasta(P, () => document.querySelectorAll('.gc-mia .gc-voz').length === 1, 10000), 'ordenador: «Enviar» manda la nota');
  comprueba(await hasta(PA, () => document.querySelectorAll('.gc-suya .gc-voz').length === 1, 10000), 'y llega al teléfono');

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
