// Llamada a tres (dueño, 30 Oct 2026, 08:33: «que podamos hablar los tres a la vez»; 09:16: «es muy importante»).
// Tres teléfonos con la app (A, B y C) contra el relé de pruebas. A tiene de contacto a B y a C; B y C no se conocen.
//   1. A y B en videollamada: a A le sale «Añadir».
//   2. A añade a C: a C le suena una llamada de A que dice que también está B; C contesta.
//   3. Los tres se ven: A ve a B y a C; B ve a A y, en la otra mitad, a C; C ve a A y a B (las imágenes llegan de verdad).
//   4. Los tres se oyen: con A en silencio, B sigue oyendo a C y C sigue oyendo a B (la voz pasa mezclada por A).
//   5. C cuelga: B deja de ver a C y A y B siguen hablando.
//   6. A vuelve a añadir a C y cuelga B: la llamada sigue entre A y C.
//   7. A cuelga: a C se le termina.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'tres');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const foto = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return !e.closest('[hidden]') && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && r.width > 0 && r.height > 0; }, s);
const marca = async (p, n) => { for (const d of n) await p.click('#teclado button[data-d="' + d + '"]'); };
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
const suena = (p, ms) => hasta(() => visible(p, '#ll-contestar'), ms);
// ¿llegan imágenes nuevas a ese vídeo? (dos medidas separadas)
const imagenes = async (p, sel) => {
  const n = () => p.evaluate((s) => { const v = document.querySelector(s); if (!v || v.hidden || !v.srcObject) return -1; const q = v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality().totalVideoFrames : 0; return v.videoWidth > 0 ? q : -1; }, sel);
  const a = await n(); await espera(1500); const b = await n();
  return a >= 0 && b > a;
};
// cuánto suena lo que llega por un elemento de audio (media de la señal en 1,2 s)
const nivel = (p, sel) => p.evaluate(async (s) => {
  const el = document.querySelector(s); if (!el || !el.srcObject || !el.srcObject.getAudioTracks().length) return 0;
  const c = new AudioContext(); const src = c.createMediaStreamSource(el.srcObject); const an = c.createAnalyser(); an.fftSize = 2048; src.connect(an);
  const buf = new Float32Array(an.fftSize); let max = 0; const fin = Date.now() + 1200;
  while (Date.now() < fin) { await new Promise((r) => setTimeout(r, 60)); an.getFloatTimeDomainData(buf); let s2 = 0; for (const x of buf) s2 += x * x; max = Math.max(max, Math.sqrt(s2 / buf.length)); }
  try { c.close(); } catch (_) {} return max;
}, sel);
const salaDe = (p, nombre) => p.evaluate((n) => { for (const c of GuardianaCom.convs.values()) if ((c.alias || c.nombre) === n) return c.id; return null; }, nombre);
async function seAnaden(X, numX, Y, numY, nomY, nomX) {
  for (const [P, num, nom] of [[X, numY, nomY], [Y, numX, nomX]]) {
    await P.evaluate(() => { const b = document.querySelector('#cvolver'); if (b && b.offsetParent) b.click(); }); await espera(500);
    if (await visible(P, '#contactos-atras')) { await P.click('#contactos-atras'); await espera(300); }
    await P.click('#llamar-num'); await espera(300); await marca(P, num); await P.click('#marcar-llamar'); await espera(500);
    await P.fill('#num-nombre', nom); await P.click('#num-anadir'); await espera(2000);
    if (await visible(P, '#num-espera-ok')) { await P.click('#num-espera-ok'); await espera(300); }
  }
  await espera(6000);
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B'), C = await telefono(browser, 'C');
  for (const P of [A, B, C]) await P.goto(URL0);
  await espera(2500);
  for (const P of [A, B, C]) await P.click('#num-usar');
  await espera(2500);
  const num = {}; for (const [k, P] of [['A', A], ['B', B], ['C', C]]) num[k] = await P.evaluate(() => window.gcomPruebaNumero.mio());
  await seAnaden(A, num.A, B, num.B, 'Bruno', 'Ana');
  await seAnaden(A, num.A, C, num.C, 'Carla', 'Ana');
  const salaB = await salaDe(A, 'Bruno'), salaC = await salaDe(A, 'Carla');
  comprueba(!!salaB && !!salaC, 'A tiene a B y a C de contacto');
  // 1. videollamada A–B
  await A.evaluate((s) => window.gcomPrueba.abre(s), salaB); await espera(1500);
  await A.click('#videollamar');
  const s1 = await suena(B, 15000); comprueba(s1, '1. A llama a B: a B le suena');
  if (s1) await B.click('#ll-contestar');
  await hasta(async () => /^\d\d:\d\d$/.test(((await A.textContent('#ll-tiempo')) || '').trim()) && await visible(A, '#ll-anadir'), 15000);
  comprueba(await visible(A, '#ll-anadir'), '1. hablando: a A le sale «Añadir»');
  comprueba(!(await visible(B, '#ll-anadir')) || true, '1. (a B también le puede salir: es una llamada normal)');
  await foto(A, '01-A-con-anadir');
  // 2. A añade a C
  await A.evaluate(() => document.querySelector('#ll-anadir').click()); await espera(700);
  comprueba(await visible(A, '#h-tercero .reenviar-a[data-id="' + salaC + '"]'), '2. en la hoja «Añadir a la llamada» está C (y no B)');
  comprueba(!(await A.$('#h-tercero .reenviar-a[data-id="' + salaB + '"]')), '2. la persona de la llamada no sale en la lista');
  await foto(A, '02-A-hoja');
  await A.click('#h-tercero .reenviar-a[data-id="' + salaC + '"]');
  const s2 = await suena(C, 15000); comprueba(s2, '2. a C le suena la llamada de A');
  const nomC = ((await C.textContent('#ll-nombre')) || '').trim();
  comprueba(/·/.test(nomC), '2. C ve que es una llamada a tres: «' + nomC + '»');
  await foto(C, '02-C-suena');
  if (s2) await C.click('#ll-contestar');
  await hasta(async () => await A.evaluate(() => document.querySelector('#llamada').classList.contains('tres')), 20000);
  await espera(3000);
  // 3. los tres se ven
  comprueba(await imagenes(A, '#v-remoto') && await imagenes(A, '#v-tercero'), '3. A ve a B y a C');
  comprueba(await imagenes(B, '#v-remoto') && await imagenes(B, '#v-tercero'), '3. B ve a A y a C (la imagen de C llega por A)');
  comprueba(await imagenes(C, '#v-remoto') && await imagenes(C, '#v-tercero'), '3. C ve a A y a B (la imagen de B llega por A)');
  for (const [k, P] of [['A', A], ['B', B], ['C', C]]) comprueba(await P.evaluate(() => document.querySelector('#llamada').classList.contains('tres')), '3. ' + k + ': pantalla a tres');
  const nB = ((await B.textContent('#ll-nombre')) || '').trim();
  comprueba(/·/.test(nB), '3. B ve los dos nombres arriba: «' + nB + '»');
  await foto(A, '03-A-tres'); await foto(B, '03-B-tres'); await foto(C, '03-C-tres');
  // 4. los tres se oyen: A en silencio, B oye a C y C oye a B
  const antesB = await nivel(B, '#a-remoto');
  await A.evaluate(() => document.querySelector('#ll-silenciar').click()); await espera(1500);
  const nivB = await nivel(B, '#a-remoto'), nivC = await nivel(C, '#a-remoto');
  comprueba(nivB > 0.003, '4. con A en silencio, B oye a C (nivel ' + nivB.toFixed(4) + '; con A hablando, ' + antesB.toFixed(4) + ')');
  comprueba(nivC > 0.003, '4. con A en silencio, C oye a B (nivel ' + nivC.toFixed(4) + ')');
  const nivA3 = await nivel(A, '#a-tercero');
  comprueba(nivA3 > 0.003, '4. A oye a C (nivel ' + nivA3.toFixed(4) + ')');
  await A.evaluate(() => document.querySelector('#ll-silenciar').click()); await espera(500);
  // 5. C cuelga
  await C.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(3500);
  comprueba(!(await B.evaluate(() => document.querySelector('#llamada').classList.contains('tres'))), '5. C cuelga: B deja de ver la tercera imagen');
  comprueba(!(await A.evaluate(() => document.querySelector('#llamada').classList.contains('tres'))), '5. A también');
  comprueba(await imagenes(B, '#v-remoto') && await imagenes(A, '#v-remoto'), '5. A y B siguen viéndose');
  comprueba(await visible(A, '#ll-anadir'), '5. a A le vuelve a salir «Añadir»');
  await foto(B, '05-B-sin-C');
  // 6. A vuelve a añadir a C; cuelga B: sigue A con C
  await espera(2000);
  await A.evaluate(() => document.querySelector('#ll-anadir').click()); await espera(700); await A.click('#h-tercero .reenviar-a[data-id="' + salaC + '"]');
  const s6 = await suena(C, 15000); comprueba(s6, '6. a C le vuelve a sonar'); if (s6) await C.click('#ll-contestar');
  await hasta(async () => await C.evaluate(() => document.querySelector('#llamada').classList.contains('tres')), 20000);
  await B.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(4000);
  const aSigue = /^\d\d:\d\d$/.test(((await A.textContent('#ll-tiempo')) || '').trim()) && await visible(A, '#ll-colgar');
  comprueba(aSigue, '6. B cuelga: A sigue en la llamada');
  comprueba(await visible(C, '#ll-colgar'), '6. C sigue en la llamada');
  comprueba(await imagenes(A, '#v-remoto'), '6. A ve a C (ahora en grande)');
  comprueba(!(await C.evaluate(() => document.querySelector('#llamada').classList.contains('tres'))), '6. C deja de ver a B');
  const nivCA = await nivel(C, '#a-remoto'); comprueba(nivCA > 0.003, '6. C oye a A (nivel ' + nivCA.toFixed(4) + ')');
  await foto(A, '06-A-con-C'); await foto(C, '06-C-con-A');
  // 7. A cuelga
  await A.evaluate(() => document.querySelector('#ll-colgar').click());
  const fin = await hasta(async () => !(await visible(C, '#ll-colgar')), 8000);
  comprueba(fin, '7. A cuelga: a C se le termina');
  await espera(1500);
  await foto(A, '07-A-chat'); await foto(C, '07-C-chat');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
})();
