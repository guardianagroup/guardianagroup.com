// The same page as a website: desktop (fine pointer) and a phone browser tab (not installed).
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'web');
require('fs').mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
(async () => {
  const browser = await chromium.launch();
  // ordenador
  const pc = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  pc.on('pageerror', (e) => { console.log('pageerror pc', String(e)); fallos.push('pageerror pc'); });
  await pc.goto(URL0); await new Promise((r) => setTimeout(r, 1500));
  await pc.screenshot({ path: path.join(OUT, 'pc-inicio.png') });
  const d = await pc.evaluate(() => ({ pos: getComputedStyle(document.body).position, volver: getComputedStyle(document.querySelector('#volver')).display, app: document.documentElement.classList.contains('como-app'), multas: document.querySelector('.multas-b').getBoundingClientRect().x }));
  comprueba(d.pos === 'static' && d.volver !== 'none' && !d.app, 'ordenador: como antes (página normal, con «‹ Inicio»)');
  comprueba(d.multas > 900, 'ordenador: «Multas» a la derecha (' + Math.round(d.multas) + ')');
  // teléfono, en el navegador (sin instalar)
  const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
  const tel = await (await browser.newContext({ viewport: { width: 393, height: 680 }, isMobile: true, hasTouch: true, userAgent: UA, deviceScaleFactor: 2 })).newPage();
  tel.on('pageerror', (e) => { console.log('pageerror tel', String(e)); fallos.push('pageerror tel'); });
  await tel.goto(URL0); await new Promise((r) => setTimeout(r, 1500));
  await tel.screenshot({ path: path.join(OUT, 'tel-web-inicio.png') });
  const t = await tel.evaluate(() => ({ pos: getComputedStyle(document.body).position, volver: getComputedStyle(document.querySelector('#volver')).display, idx: document.querySelector('.idiomas').getBoundingClientRect().x }));
  comprueba(t.pos === 'fixed' && t.volver !== 'none' && t.idx > 250, 'teléfono en el navegador: página fija, con «‹ Inicio» y el idioma a la derecha');
  // «Cómo funciona» se abre y se puede desplazar dentro
  // en el teléfono, «¿Cómo funciona?» es su propia pantalla, con «‹» (dueño, 29 Oct 2026, 08:24)
  await tel.click('#ver-como'); await new Promise((r) => setTimeout(r, 500));
  const s = await tel.evaluate(() => { const i = document.querySelector('#inicio'); i.scrollTop = 600; return { st: i.scrollTop, sy: scrollY }; });
  comprueba(s.st > 0 && s.sy === 0, 'teléfono: «Cómo funciona» se desplaza por dentro, la página no');
  await tel.screenshot({ path: path.join(OUT, 'tel-web-como.png') });
  await browser.close();
  console.log(fallos.length ? fallos.length + ' FALLOS' : 'TODO BIEN');
})();
