// Llamada en grupo de cuatro, y cualquiera añade (dueño, 30 Oct 2026, 10:43: «podíamos ser cuatro… cualquier participante… pueda
// añadir… a otra persona»; 10:53: «haz… lo de la llamada 4»). Cuatro teléfonos contra el relé de pruebas.
// Contactos: A con B y con C; B con D. C y D no conocen a nadie más.
//   1. A llama a B (videollamada); A añade a C; B (que no llamó) añade a D.
//   2. Los cuatro son «4 personas» y cada uno ve a los otros tres (llegan imágenes de verdad, también de dos saltos: D en C).
//   3. Con cuatro, a nadie le sale «Añadir».
//   4. Los cuatro se oyen: con A, B y C en silencio, A y C oyen a D (la voz de D llega a C pasando por B y por A).
//   5. D cuelga: quedan tres, cada uno ve a los otros dos y vuelve «Añadir».
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'cuatro');
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
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return !e.closest('[hidden]') && getComputedStyle(e).display !== 'none' && r.width > 0 && r.height > 0; }, s);
const marca = async (p, n) => { for (const d of n) await p.click('#teclado button[data-d="' + d + '"]'); };
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
const suena = (p, ms) => hasta(() => visible(p, '#ll-contestar'), ms);
// cuántas imágenes de otras personas recibe imágenes nuevas de verdad
// (cuatro navegadores en una sola máquina van justos de procesador: se mide durante 4 s y se repite hasta 3 veces)
const imagenesVivas = async (p, quiero) => {
  const cuenta = () => p.evaluate(() => [...document.querySelectorAll('#v-remoto, .ll-tile')].map((v) => (v.srcObject && v.videoWidth > 0 && getComputedStyle(v).display !== 'none' && !v.hidden && v.getVideoPlaybackQuality) ? v.getVideoPlaybackQuality().totalVideoFrames : -1));
  let n = 0;
  for (let i = 0; i < 3; i++) { const a = await cuenta(); await espera(4000); const b = await cuenta(); n = b.filter((x, j) => x >= 0 && a[j] >= 0 && x > a[j]).length; if (n >= quiero) break; }
  return n;
};
// el sonido que llega por un elemento de audio (cada pista por separado)
const nivel = (p, sel) => p.evaluate(async (s) => {
  const el = document.querySelector(s); if (!el || !el.srcObject || !el.srcObject.getAudioTracks().length) return 0;
  const c = new AudioContext(); const ans = el.srcObject.getAudioTracks().map((x) => { const an = c.createAnalyser(); an.fftSize = 2048; c.createMediaStreamSource(new MediaStream([x])).connect(an); return an; });
  const buf = new Float32Array(2048); let max = 0; const fin = Date.now() + 1500;
  while (Date.now() < fin) { await new Promise((r) => setTimeout(r, 60)); for (const an of ans) { an.getFloatTimeDomainData(buf); let s2 = 0; for (const v of buf) s2 += v * v; max = Math.max(max, Math.sqrt(s2 / buf.length)); } }
  try { c.close(); } catch (_) {} return max;
}, sel);
const salaDe = (p, nombre) => p.evaluate((n) => { for (const c of GuardianaCom.convs.values()) if ((c.alias || c.nombre) === n) return c.id; return null; }, nombre);
const total = (p) => p.evaluate(() => GuardianaCom.llamada.total);
const silencia = (p) => p.evaluate(() => { const b = document.querySelector('#ll-silenciar'); if (b.getAttribute('aria-pressed') !== 'true') b.click(); });
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
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B'), C = await telefono(browser, 'C'), D = await telefono(browser, 'D');
  const todos = [['A', A], ['B', B], ['C', C], ['D', D]];
  for (const [, P] of todos) await P.goto(URL0);
  await espera(2500);
  for (const [, P] of todos) await P.click('#num-usar');
  await espera(2500);
  const num = {}; for (const [k, P] of todos) num[k] = await P.evaluate(() => window.gcomPruebaNumero.mio());
  await seAnaden(A, num.A, B, num.B, 'Bruno', 'Ana');
  await seAnaden(A, num.A, C, num.C, 'Carla', 'Ana');
  await seAnaden(B, num.B, D, num.D, 'Diego', 'Bruno');
  const salaB = await salaDe(A, 'Bruno'), salaC = await salaDe(A, 'Carla'), salaD = await salaDe(B, 'Diego');
  comprueba(!!salaB && !!salaC && !!salaD, 'contactos: A con B y C; B con D');
  // 1. A llama a B; A añade a C; B añade a D
  await A.evaluate((s) => window.gcomPrueba.abre(s), salaB); await espera(1500);
  await A.click('#videollamar');
  if (await suena(B, 15000)) await B.click('#ll-contestar');
  await hasta(async () => await visible(A, '#ll-anadir'), 15000);
  await A.evaluate(() => document.querySelector('#ll-anadir').click()); await espera(700);
  await A.click('#h-tercero .reenviar-a[data-id="' + salaC + '"]');
  if (await suena(C, 15000)) await C.click('#ll-contestar');
  await hasta(async () => (await total(B)) === 3, 20000);
  comprueba(await visible(B, '#ll-anadir'), '1. a B (que no llamó ni añadió) también le sale «Añadir»');
  await B.evaluate(() => document.querySelector('#ll-anadir').click()); await espera(700);
  comprueba(await visible(B, '#h-tercero .reenviar-a[data-id="' + salaD + '"]'), '1. en la hoja de B está D');
  await B.click('#h-tercero .reenviar-a[data-id="' + salaD + '"]');
  const s4 = await suena(D, 15000); comprueba(s4, '1. a D le suena la llamada de B');
  const nomD = ((await D.textContent('#ll-nombre')) || '').trim();
  comprueba(/4 personas/.test(nomD), '1. D sabe que entra en un grupo: «' + nomD + '»');
  if (s4) await D.click('#ll-contestar');
  await hasta(async () => (await total(C)) === 4 && (await total(D)) === 4, 25000);
  await espera(4000);
  // 2. cuatro, y cada uno ve a los otros tres
  for (const [k, P] of todos) comprueba((await total(P)) === 4, '2. ' + k + ': 4 personas (' + (await total(P)) + ')');
  for (const [k, P] of todos) { const n = await imagenesVivas(P, 3); comprueba(n === 3, '2. ' + k + ' ve a los otros tres (' + n + ' imágenes con vídeo)'); }
  for (const [k, P] of todos) await foto(P, '02-' + k);
  if (process.env.DEPURA) for (const [k, P] of todos) console.log(k, JSON.stringify(await P.evaluate(() => GuardianaCom.llamada.depura)));
  if (process.env.DEPURA) for (const [k, P] of todos) { const f = () => P.evaluate(() => [...document.querySelectorAll('#v-remoto, .ll-tile')].map((v) => (v.id || v.className) + ' w' + v.videoWidth + ' f' + (v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality().totalVideoFrames : -1) + ' ' + getComputedStyle(v).display + (v.paused ? ' PAUSA' : '') + ' ' + (v.srcObject ? v.srcObject.getVideoTracks().map((x) => x.readyState + (x.muted ? '/muda' : '')).join() : 'sin'))); console.log(k, JSON.stringify(await f())); await espera(2500); console.log(k, JSON.stringify(await f())); }
  // 3. con cuatro, nadie puede añadir
  for (const [k, P] of todos) comprueba(!(await visible(P, '#ll-anadir')), '3. ' + k + ': sin «Añadir» (somos cuatro)');
  // 4. con A, B y C en silencio, A y C oyen a D
  for (const P of [A, B, C]) await silencia(P);
  await espera(1500);
  // (con la capa post-cuántica, la voz de dos saltos tarda un momento más en llegar la primera vez: se espera hasta 8 s)
  let nA = 0, nC = 0; for (let i = 0; i < 5 && !(nA > 0.003 && nC > 0.003); i++) { if (!(nA > 0.003)) nA = await nivel(A, '#a-remoto'); if (!(nC > 0.003)) nC = await nivel(C, '#a-remoto'); }
  comprueba(nA > 0.003, '4. A oye a D a través de B (nivel ' + nA.toFixed(4) + ')');
  comprueba(nC > 0.003, '4. C oye a D a través de B y de A (nivel ' + nC.toFixed(4) + ')');
  for (const P of [A, B, C]) await P.evaluate(() => document.querySelector('#ll-silenciar').click());
  // 5. D cuelga: quedan tres
  await D.evaluate(() => document.querySelector('#ll-colgar').click());
  await hasta(async () => (await total(A)) === 3 && (await total(C)) === 3, 15000);
  await espera(3000);
  for (const [k, P] of [['A', A], ['B', B], ['C', C]]) comprueba((await total(P)) === 3, '5. D cuelga: ' + k + ' son 3 (' + (await total(P)) + ')');
  for (const [k, P] of [['A', A], ['B', B], ['C', C]]) { const n = await imagenesVivas(P, 2); comprueba(n === 2, '5. ' + k + ' ve a los otros dos (' + n + ')'); }
  comprueba(await visible(C, '#ll-anadir'), '5. vuelve «Añadir»');
  await foto(C, '05-C');
  await A.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(2000);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
})();
