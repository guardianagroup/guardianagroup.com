// La llamada en pequeño (dueño, 15 nov 2026: «en esa pantalla pequeña me da varias opciones… a la derecha y a la izquierda los márgenes
// no están bien… se comen parte de los botones, hay que hacerlo un poco más grande»). Videollamada entre dos PCs (la Blindada, por
// enlace «#i=»), A pasa a pequeño y se mide: cada botón visible de la fila, entero dentro de la ventana y con su margen a los lados;
// lo mismo con voz sola y con la pantalla compartida; en una ventana de 1280 y en una de 1024 de ancho. Capturas en la carpeta dada.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'mini-llamada');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(300); } return false; };
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
async function equipo(browser, nombre, ancho) {
  const ctx = await browser.newContext({ viewport: { width: ancho || 1280, height: 800 }, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  // (16 nov 2026) donde hay ventana flotante del sistema (Chrome y Edge), «Ver el chat» lleva la llamada a ella: aquí se mide la
  // tarjeta pequeña de siempre, la de los navegadores sin esa ventana
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} try { Object.defineProperty(window, 'documentPictureInPicture', { value: undefined, configurable: true }); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  return p;
}
// la fila de botones de la llamada en pequeño: cada botón visible, su caja, y la de la ventana
const mide = (P) => P.evaluate(() => {
  const caja = document.querySelector('.gc-llamada.mini'); if (!caja) return null;
  const r = caja.getBoundingClientRect(), cs = getComputedStyle(caja);
  const bs = [...caja.querySelectorAll('#ll-botones .gc-llamada-boton')].filter((b) => !b.hidden && getComputedStyle(b).display !== 'none' && b.getClientRects().length).map((b) => { const x = b.querySelector('button').getBoundingClientRect(); return { id: b.querySelector('button').id, izq: Math.round(x.left - r.left), der: Math.round(r.right - x.right), ancho: Math.round(x.width), alto: Math.round(x.height) }; });
  const fila = document.querySelector('.gc-llamada.mini #ll-botones'), fr = fila.getBoundingClientRect();
  return { ancho: Math.round(r.width), borde: cs.overflow, botones: bs, fila: { izq: Math.round(fr.left - r.left), der: Math.round(r.right - fr.right), desborda: fila.scrollWidth > fila.clientWidth + 1 } };
});
const bien = (m, margen) => !!m && m.botones.length >= 4 && m.botones.every((b) => b.izq >= margen && b.der >= margen && b.ancho >= 36) && !m.fila.desborda;
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--auto-select-desktop-capture-source=Entire screen', '--enable-usermedia-screen-capturing'] });
  try {
    for (const ancho of [1280, 1024]) {
      const A = await equipo(browser, 'A', ancho), B = await equipo(browser, 'B', ancho);
      await B.goto(URL0); await espera(1500);
      await B.click('#modo-blindado'); await B.click('#nueva'); await espera(2500);
      const url = String(await B.evaluate(() => window.gcomPrueba.enlaceI())).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
      await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
      await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2500);
      if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
      comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), ancho + ': A y B en videollamada');
      await espera(2500);
      await A.evaluate(() => document.querySelector('#ll-mini').click()); await espera(1200);
      const m1 = await mide(A);
      await A.screenshot({ path: path.join(OUT, ancho + '-1-video-pequena.png') });
      comprueba(bien(m1, 12), ancho + ': videollamada en pequeño: todos los botones enteros, con al menos 12 px a cada lado', m1);
      // compartiendo pantalla (un botón más, «Compartir pantalla» pulsado)
      await A.evaluate(() => { const b = document.querySelector('#ll-pantalla'); if (b) b.click(); }); await espera(2500);
      const m2 = await mide(A);
      await A.screenshot({ path: path.join(OUT, ancho + '-2-pantalla-pequena.png') });
      comprueba(bien(m2, 12), ancho + ': compartiendo pantalla, en pequeño: lo mismo', m2);
      await A.evaluate(() => { const b = document.querySelector('#ll-pantalla'); if (b && b.getAttribute('aria-pressed') === 'true') b.click(); }); await espera(1500);
      // «Ampliar» la devuelve en grande
      await A.evaluate(() => document.querySelector('#ll-volver').click()); await espera(1000);
      comprueba(!(await A.evaluate(() => document.querySelector('.gc-llamada').classList.contains('mini'))), ancho + ': «Ampliar» devuelve la llamada en grande');
      await A.evaluate(() => { const b = document.querySelector('#ll-colgar'); if (b) b.click(); }); await espera(1500);
      await A.context().close(); await B.context().close();
    }
  } catch (e) { console.log('ERROR', e && e.stack || e); fallos.push('excepción'); }
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
