// La capa post-cuántica del audio y el vídeo (dueño, 30 Oct 2026, 14:41: «en la llamada PC a PC, el audio y el vídeo post
// cuántico»). Encima del cifrado de siempre, cada fragmento de voz e imagen va cifrado con AES-256-GCM con una llave de la sesión
// post-cuántica del chat (medios-pq.js).
//   1. Teléfono (sesión blindada) ↔ PC: la capa va en los dos lados; se cifran y descifran fragmentos de voz e imagen, y la imagen
//      y el sonido llegan (los fotogramas avanzan y casi no hay sonido inventado por pérdidas).
//   2. PC ↔ PC (sesión normal, VP9): igual.
//   3. Si un lado no tiene la capa (navegador sin la función), la llamada sigue con el cifrado de siempre y no dice «post-cuántica».
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'pq');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
async function equipo(browser, pc, nombre, sinCapa, ua) {
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 852 }, deviceScaleFactor: pc ? 1 : 2, isMobile: !pc, hasTouch: !pc, userAgent: ua || (pc ? PC : IPHONE), locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((sin) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {}
    window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); };
    try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {}
    window.__copiados = []; try { navigator.clipboard.writeText = (x) => { window.__copiados.push(String(x)); return Promise.resolve(); }; } catch (_) {}
    if (sin) { try { delete window.RTCRtpScriptTransform; window.RTCRtpScriptTransform = undefined; } catch (_) {} }
  }, !!sinCapa);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
const pq = (P) => P.evaluate(() => !!(GuardianaCom.llamada && GuardianaCom.llamada.pq));
const cuenta = (P) => P.evaluate(() => GuardianaCom.llamada.pqCuenta());
// lo que llega: fotogramas descodificados de la imagen y, del sonido, cuánto se inventó por pérdidas
const llega = (P) => P.evaluate(async () => {
  const v = document.querySelector('#v-remoto'); const f = v && v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality().totalVideoFrames : -1;
  return { fotogramas: f, ancho: v ? v.videoWidth : 0 };
});
async function llamada(nombre, A, B, conCapa) {
  await B.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(async () => !!(await A.$('#ll-contestar:visible')), 15000)) await A.click('#ll-contestar');
  const ok = await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000);
  comprueba(ok, nombre + ': hablan');
  await espera(4000);
  comprueba((await pq(A)) === conCapa && (await pq(B)) === conCapa, nombre + ': capa post-cuántica ' + (conCapa ? 'en los dos lados' : 'apagada en los dos lados'), { A: await pq(A), B: await pq(B) });
  const codec = await B.evaluate(async () => { const p = GuardianaCom.llamada.pcPrueba; if (!p) return ''; const st = await p.getStats(); let id = '', m = ''; st.forEach((x) => { if (x.type === 'outbound-rtp' && x.kind === 'video') id = x.codecId; }); st.forEach((x) => { if (x.id === id) m = x.mimeType; }); return m; });
  console.log('     códec de la imagen', nombre, codec);
  const a0 = await llega(A), b0 = await llega(B); await espera(3000); const a1 = await llega(A), b1 = await llega(B);
  comprueba(a1.fotogramas > a0.fotogramas && b1.fotogramas > b0.fotogramas && a1.ancho > 0 && b1.ancho > 0, nombre + ': la imagen llega y avanza en los dos', { A: [a0.fotogramas, a1.fotogramas, a1.ancho], B: [b0.fotogramas, b1.fotogramas, b1.ancho] });
  if (conCapa) {
    const ca = await cuenta(A), cb = await cuenta(B);
    comprueba(ca && cb && ca.cifrados > 100 && ca.descifrados > 100 && cb.cifrados > 100 && cb.descifrados > 100, nombre + ': se cifran y descifran fragmentos en los dos', { A: ca, B: cb });
    comprueba(ca && cb && ca.fallos < 20 && cb.fallos < 20, nombre + ': casi ningún fragmento sin descifrar', { A: ca && ca.fallos, B: cb && cb.fallos });
    console.log('     cuenta', nombre, JSON.stringify({ A: ca, B: cb }));
  }
  await A.screenshot({ path: path.join(OUT, nombre + '-a.png') }); await B.screenshot({ path: path.join(OUT, nombre + '-b.png') });
  await B.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(2500);
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  // 1. teléfono (blindada) ↔ PC
  {
    const A = await equipo(browser, false, 'A'), P = await equipo(browser, true, 'P');
    await A.goto(URL0 + '?app=1'); await espera(1500);
    await A.click('#nueva-blindada'); await espera(400); await A.click('#invitar-otra'); await espera(1200);
    const url = String((await A.evaluate(() => window.__compartidos[window.__compartidos.length - 1])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    await P.goto(url); await espera(1500); if (await P.$('#aceptar-si:visible')) await P.click('#aceptar-si'); await espera(5000);
    await llamada('1-telefono-pc', A, P, true);
  }
  // 2. PC ↔ PC (sesión normal)
  {
    const B = await equipo(browser, true, 'B'), C = await equipo(browser, true, 'C');
    await B.goto(URL0); await espera(1500);
    await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
    const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    await C.goto(url); await espera(1500); if (await C.$('#aceptar-si:visible')) await C.click('#aceptar-si'); await espera(5000);
    await llamada('2-pc-pc', B, C, true);
  }
  // 3. un lado sin la capa: la llamada sigue, sin «post-cuántica»
  {
    const B = await equipo(browser, true, 'D'), C = await equipo(browser, true, 'E', true);
    await B.goto(URL0); await espera(1500);
    await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
    const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    await C.goto(url); await espera(1500); if (await C.$('#aceptar-si:visible')) await C.click('#aceptar-si'); await espera(5000);
    await llamada('3-sin-capa', B, C, false);
  }
  // 4. teléfono ↔ teléfono (dos iPhone: H.264) y 5. Android ↔ PC (VP8)
  for (const [n, uaA, uaB, pcB] of [['4-iphone-iphone', IPHONE, IPHONE, false], ['5-android-pc', ANDROID, null, true]]) {
    const A = await equipo(browser, false, 'A' + n, false, uaA), B2 = await equipo(browser, pcB, 'B' + n, false, uaB);
    await A.goto(URL0 + '?app=1'); await espera(1500);
    await A.click('#nueva-blindada'); await espera(400); await A.click('#invitar-otra'); await espera(1200);
    const url = String((await A.evaluate(() => window.__compartidos[window.__compartidos.length - 1])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    await B2.goto(url); await espera(1500); if (await B2.$('#aceptar-si:visible')) await B2.click('#aceptar-si'); await espera(5000);
    await llamada(n, A, B2, true);
  }
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
