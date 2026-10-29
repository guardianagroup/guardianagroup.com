// La videollamada mientras suena («Llamando…»), con la pantalla partida: el nombre no puede quedar en la raya ni debajo del botón
// «Pantalla completa» (dueño, 28 Oct 2026, 20:28: «Corrige ese fallo»).
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'llamando');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt); if (!ok) fallos.push(txt); };
async function telefono(browser, alto) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: alto || 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  // Safari con sus barras: la parte visible es más baja (como en la captura del dueño)
  const A = await telefono(browser, 660), B = await telefono(browser);
  await A.goto(URL0); await B.goto(URL0); await espera(1800);
  await A.click('#nueva-blindada'); await espera(900);
  const url = String((await A.evaluate(() => window.__compartidos[0])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await B.goto(url); await espera(1500); await B.click('#aceptar-si'); await espera(5000);
  await A.click('#ccontacto-si'); await A.fill('#nombre-conv', 'Nathalie ❤️'); await A.click('#nombre-guardar'); await espera(500);
  await A.click('#videollamar'); await espera(2200);
  await A.screenshot({ path: path.join(OUT, '1-llamando.png') });
  const m = await A.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e || !e.offsetParent && getComputedStyle(e).position !== 'fixed') return null; const b = e.getBoundingClientRect(); return b.width ? { t: Math.round(b.top), b: Math.round(b.bottom), l: Math.round(b.left), r: Math.round(b.right) } : null; };
    return { clases: document.querySelector('#llamada').className, nombre: r('#ll-nombre'), paso: r('#ll-paso'), avatar: r('#ll-avatar'), tam: r('#ll-tam'), local: r('#v-local'), alto: innerHeight };
  });
  console.log(JSON.stringify(m));
  const choca = (a, b) => a && b && !(a.b <= b.t || b.b <= a.t || a.r <= b.l || b.r <= a.l);
  comprueba(!choca(m.nombre, m.tam), 'el nombre no queda debajo de «Pantalla completa»');
  comprueba(!m.local || !m.nombre || m.nombre.b <= m.local.t, 'el nombre y «Llamando…» quedan en la mitad de arriba, no sobre tu imagen');
  comprueba(!m.local || !m.paso || m.paso.b <= m.local.t, '«Llamando…» en la mitad de arriba');
  if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar'); await espera(4000);
  await A.screenshot({ path: path.join(OUT, '2-hablando.png') });
  await A.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(800);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
