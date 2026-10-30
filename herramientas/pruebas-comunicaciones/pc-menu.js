// El menú de un mensaje en el PC, con ratón (dueño, 30 Oct 2026, 07:57: «la versión PC… se toca con mouse»): un teléfono
// invita por enlace y un PC (Windows, Chrome) lo abre. En el PC:
//   1. sin pasar el ratón, ninguna flechita; al pasar por un mensaje, la flechita en su esquina;
//   2. clic en la flechita → el menú (Responder · Información · Borrar); Esc lo cierra;
//   3. clic derecho sobre un mensaje → el mismo menú; «Responder» → la barra de respuesta; Intro envía con la cita.
//   4. en el PC no hay pestañas abajo ni botón rojo «Terminar» en la cabecera.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'pc-menu');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && r.width > 0 && r.height > 0; }, s);
async function equipo(browser, pc) {
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 793 }, deviceScaleFactor: pc ? 1 : 2, isMobile: !pc, hasTouch: !pc, userAgent: pc ? PC : UA, locale: 'es-CO' });
  await ctx.addInitScript(() => { window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; try { Object.defineProperty(navigator, 'standalone', { get: () => true }); sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
(async () => {
  const browser = await chromium.launch();
  const A = await equipo(browser, false), P = await equipo(browser, true);
  await A.goto(URL0 + '?app=1'); await espera(1500);
  await A.click('#nueva-blindada'); await espera(400); if (await A.$('#invitar-otra:visible')) await A.click('#invitar-otra'); await espera(1200);
  const url = String((await A.evaluate(() => window.__compartidos[window.__compartidos.length - 1])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await P.goto(url); await espera(1500); if (await P.$('#aceptar-si:visible')) await P.click('#aceptar-si'); await espera(5000);
  comprueba(await visible(P, '#conv'), 'el PC entra en el chat por el enlace');
  await A.fill('#texto', 'Hola desde el teléfono'); await A.click('#enviar'); await espera(1500);
  await A.fill('#texto', 'Segundo mensaje'); await A.click('#enviar'); await espera(1500);
  const li = '#mensajes > li[data-id]:has(.gc-suya)';
  await P.mouse.move(5, 5); await espera(200);
  comprueba(!(await visible(P, li + ' .gc-mas-msg')), 'sin pasar el ratón, ninguna flechita');
  await P.hover(li + ' .gc-texto'); await espera(250);
  comprueba(await visible(P, li + ' .gc-mas-msg'), 'al pasar el ratón por el mensaje, la flechita en su esquina');
  await P.screenshot({ path: path.join(OUT, '1-pc-flechita.png') });
  await P.click(li + ' .gc-mas-msg'); await espera(300);
  const items = await P.evaluate(() => [...document.querySelectorAll('#mmenu button')].filter((b) => !b.hidden).map((b) => b.textContent.trim()));
  comprueba(await visible(P, '#mmenu') && items.join('·') === 'Responder·Información·Borrar', 'clic en la flechita: el menú (' + items.join(' · ') + ')');
  await P.screenshot({ path: path.join(OUT, '2-pc-menu.png') });
  await P.keyboard.press('Escape'); await espera(200);
  comprueba(!(await visible(P, '#mmenu')), 'Esc lo cierra');
  await P.click(li + ' .gc-texto', { button: 'right' }); await espera(300);
  comprueba(await visible(P, '#mmenu'), 'clic derecho sobre un mensaje: el mismo menú');
  await P.click('#mm-responder'); await espera(200);
  comprueba(await visible(P, '#responde'), '«Responder»: la barra de respuesta');
  await P.fill('#texto', 'Respondo desde el PC'); await P.keyboard.press('Enter'); await espera(1500);
  comprueba(await A.evaluate(() => { const q = document.querySelector('#mensajes .gc-suya .gc-cita'); return !!q && /Tú/.test(q.textContent); }), 'Intro envía y al teléfono le llega con la cita');
  comprueba(!(await visible(P, '#pestanas')) && !(await visible(P, '#terminar')), 'en el PC: sin pestañas abajo ni «Terminar» rojo en la cabecera');
  await P.screenshot({ path: path.join(OUT, '3-pc-respuesta.png') });
  // la barra de escribir: clip, papelera y micrófono con el centro a la misma altura (dueño, 30 Oct 2026, 08:17)
  const cz = await P.evaluate(() => { const c = (s) => { const e = document.querySelector(s); if (!e || getComputedStyle(e.closest('button') || e).display === 'none') return null; if (e.tagName.toLowerCase() === 'svg') { let a = Infinity, b = -Infinity; for (const k of e.querySelectorAll('path, rect, circle, line, polyline')) { const r = k.getBoundingClientRect(); a = Math.min(a, r.top); b = Math.max(b, r.bottom); } return Math.round((a + b) / 2 * 10) / 10; } const r = e.getBoundingClientRect(); return Math.round((r.top + r.height / 2) * 10) / 10; }; /* el centro del dibujo, no de la caja */ return { clip: c('#adjuntar svg'), papelera: c('#vaciar svg'), micro: c('#grabar svg'), campo: c('#texto') }; });
  comprueba(cz.papelera !== null && cz.micro !== null && Math.abs(cz.papelera - cz.micro) <= 0.5 && Math.abs(cz.clip - cz.micro) <= 0.5 && Math.abs(cz.campo - cz.micro) <= 1, 'PC: clip, papelera, micrófono y campo, con el centro a la misma altura: ' + JSON.stringify(cz));
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
