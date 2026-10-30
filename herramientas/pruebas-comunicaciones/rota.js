// La llave que cambia cada minuto y el código en las dos pantallas (dueño, 30 Oct 2026, 14:49: «cada minuto, cada dos minutos,
// aparezca un código en pantalla de cada uno y los dos deban de ser el mismo código»). En la prueba la llave cambia cada 5 s.
//   1. PC ↔ PC: las dos pantallas enseñan el mismo código de 6 cifras; al cambiar la llave cambia el código, sigue siendo el mismo
//      en las dos, y el sonido y la imagen siguen llegando sin fragmentos perdidos; el panel «Seguridad» lo dice.
//   2. Teléfono Android ↔ PC (sesión blindada): igual.
//   3. Un lado sin la capa post-cuántica: no hay código (no se enseña nada que no sea verdad).
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'rota');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, pc, nombre, sinCapa, ua) {
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 852 }, deviceScaleFactor: pc ? 1 : 2, isMobile: !pc, hasTouch: !pc, userAgent: ua || PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((sin) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); sessionStorage.setItem('gcom-rota-ms', '5000'); } catch (_) {}
    window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); };
    try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {}
    window.__copiados = []; try { navigator.clipboard.writeText = (x) => { window.__copiados.push(String(x)); return Promise.resolve(); }; } catch (_) {}
    if (sin) { try { delete window.RTCRtpScriptTransform; window.RTCRtpScriptTransform = undefined; } catch (_) {} }
  }, !!sinCapa);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(250); } return false; };
const codigo = (P) => P.evaluate(() => GuardianaCom.llamada.codigo || '');
const enPantalla = (P) => P.evaluate(() => { const e = document.querySelector('#ll-codigo'); return e && !e.hidden && e.getClientRects().length ? e.textContent.trim() : ''; });
const cuenta = (P) => P.evaluate(() => GuardianaCom.llamada.pqCuenta());
const fotogramas = (P) => P.evaluate(() => { const v = document.querySelector('#v-remoto'); return v && v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality().totalVideoFrames : -1; });
async function llamada(nombre, A, B, conCapa) {
  await B.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(async () => !!(await A.$('#ll-contestar:visible')), 15000)) await A.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), nombre + ': hablan');
  if (!conCapa) {
    await espera(7000);
    comprueba(!(await codigo(A)) && !(await codigo(B)) && !(await enPantalla(A)) && !(await enPantalla(B)), nombre + ': sin la capa, no hay código');
    await B.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(2500);
    return;
  }
  const igual = async () => { const a = await codigo(A), b = await codigo(B); return /^\d{6}$/.test(a) && a === b ? a : ''; };
  let c0 = ''; await hasta(async () => !!(c0 = await igual()), 12000);
  comprueba(!!c0, nombre + ': el mismo código de 6 cifras en las dos pantallas', { A: await codigo(A), B: await codigo(B) });
  const pa = await enPantalla(A), pb = await enPantalla(B);
  comprueba(pa && pa === pb && pa.replace(/\D/g, '') === c0, nombre + ': y se ve en la pantalla', { A: pa, B: pb });
  await A.screenshot({ path: path.join(OUT, nombre + '-1-a.png') }); await B.screenshot({ path: path.join(OUT, nombre + '-1-b.png') });
  const f0 = await cuenta(A), g0 = await cuenta(B), va0 = await fotogramas(A), vb0 = await fotogramas(B);
  // dos cambios de llave
  const vistos = new Set([c0]);
  for (let i = 0; i < 2; i++) {
    let c = ''; await hasta(async () => { c = await igual(); return !!c && !vistos.has(c); }, 9000);
    comprueba(!!c && !vistos.has(c), nombre + ': la llave cambia (' + (i + 1) + ') y el código cambia, el mismo en los dos', { A: await codigo(A), B: await codigo(B), antes: [...vistos] });
    if (c) vistos.add(c);
  }
  await espera(1500);
  const f1 = await cuenta(A), g1 = await cuenta(B), va1 = await fotogramas(A), vb1 = await fotogramas(B);
  comprueba(va1 > va0 + 20 && vb1 > vb0 + 20, nombre + ': la imagen sigue llegando en los dos', { A: [va0, va1], B: [vb0, vb1] });
  comprueba(f1.descifrados - f0.descifrados > 300 && g1.descifrados - g0.descifrados > 300, nombre + ': se sigue descifrando', { A: f1.descifrados - f0.descifrados, B: g1.descifrados - g0.descifrados });
  comprueba(f1.fallos - f0.fallos < 10 && g1.fallos - g0.fallos < 10, nombre + ': casi ningún fragmento perdido al cambiar de llave', { A: f1.fallos - f0.fallos, B: g1.fallos - g0.fallos });
  // el panel «Seguridad de esta llamada»
  await A.evaluate(() => document.querySelector('#llamada').dispatchEvent(new PointerEvent('pointermove')));
  await A.click('.gc-llamada-cifrado'); await espera(500);
  const filas = await A.evaluate(() => [...document.querySelectorAll('#ll-seg li')].map((l) => l.textContent));
  const ca = await codigo(A);
  comprueba(filas.some((x) => /cambia cada minuto/.test(x) && x.replace(/\D/g, '').includes(ca)), nombre + ': el panel de seguridad dice que la llave cambia y su código', filas);
  await A.screenshot({ path: path.join(OUT, nombre + '-2-seguridad.png') });
  await A.keyboard.press('Escape');
  await B.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(2500);
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const pcpc = async (nombre, sinCapa) => {
    const B = await equipo(browser, true, 'B' + nombre), C = await equipo(browser, true, 'C' + nombre, sinCapa);
    await B.goto(URL0); await espera(1500);
    await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
    const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    await C.goto(url); await espera(1500); if (await C.$('#aceptar-si:visible')) await C.click('#aceptar-si'); await espera(5000);
    await llamada(nombre, C, B, !sinCapa);
  };
  await pcpc('1-pc-pc', false);
  {
    const A = await equipo(browser, false, 'A', false, ANDROID), P = await equipo(browser, true, 'P');
    await A.goto(URL0 + '?app=1'); await espera(1500);
    await A.click('#nueva-blindada'); await espera(400); await A.click('#invitar-otra'); await espera(1200);
    const url = String((await A.evaluate(() => window.__compartidos[window.__compartidos.length - 1])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    await P.goto(url); await espera(1500); if (await P.$('#aceptar-si:visible')) await P.click('#aceptar-si'); await espera(5000);
    await llamada('2-android-pc', A, P, true);
  }
  await pcpc('3-sin-capa', true);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
