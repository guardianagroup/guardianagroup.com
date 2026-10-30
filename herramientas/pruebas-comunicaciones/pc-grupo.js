// La llamada en grupo en el PC (dueño, 30 Oct 2026, 12:10: «al añadirlo, la función… de dividir ya no funciona… tampoco le funciona
// la barra del medio… me sale el botón para ampliar, pero no hace nada, simplemente la mueve»).
// Un PC (P) y dos teléfonos (A y C). P llama a A y añade a C. En P:
//   1. Las dos personas, mitad y mitad, con una raya en medio que se arrastra (y tocarla no cambia la vista).
//   2. «Cambiar vista» también en grupo: tú en una columna más (tres columnas, dos rayas) y vuelta a pequeño.
//   3. Tu imagen pequeña: sin la flecha de cambiar el tamaño (13:43, «borra ese símbolo»); se mueve con el ratón.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'pc-grupo');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, pc, nombre) {
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 793 }, deviceScaleFactor: 1, isMobile: !pc, hasTouch: !pc, userAgent: pc ? PC : UA, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  await ctx.addInitScript(() => { window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  return p;
}
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]')); }, s);
const caja = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }, s);
const columnas = (P) => P.evaluate(() => [...document.querySelectorAll('#v-remoto, .ll-tile, #v-local')].filter((v) => getComputedStyle(v).display !== 'none').map((v) => { const r = v.getBoundingClientRect(); return { id: v.id || 'tile', x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((c) => c.h >= 700).sort((a, b) => a.x - b.x));
const rayas = (P) => P.evaluate(() => [...document.querySelectorAll('.ll-graya')].filter((r) => getComputedStyle(r).display !== 'none').map((r) => { const b = r.getBoundingClientRect(); return Math.round(b.left + b.width / 2); }));
async function invita(X) {
  await X.goto(URL0 + '?app=1'); await espera(1500);
  await X.click('#nueva-blindada'); await espera(400); await X.click('#invitar-otra'); await espera(1200);
  return String((await X.evaluate(() => window.__compartidos[window.__compartidos.length - 1])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
}
const salas = (X) => X.evaluate(() => [...GuardianaCom.convs.keys()]);
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const P = await equipo(browser, true, 'P'), A = await equipo(browser, false, 'A'), C = await equipo(browser, false, 'C');
  const W = 1280;
  const uA = await invita(A), uC = await invita(C);
  for (const u of [uA, uC]) { await P.goto('about:blank'); await P.goto(u); await espera(1500); if (await P.$('#aceptar-si:visible')) await P.click('#aceptar-si'); await espera(5000); }
  const [salaA] = await salas(A), [salaC] = await salas(C);
  comprueba((await salas(P)).length >= 2 && !!salaA && !!salaC, 'el PC tiene a los dos (' + (await salas(P)).length + ' chats)');
  await P.evaluate((s) => window.gcomPrueba.abre(s), salaA); await espera(1500);
  await P.evaluate(() => document.querySelector('#videollamar').click()); await espera(2500);
  if (await A.$('#ll-contestar:visible')) await A.click('#ll-contestar');
  await espera(6000);
  await P.evaluate(() => document.querySelector('#ll-anadir').click()); await espera(800);
  await P.click('#h-tercero .reenviar-a[data-id="' + salaC + '"]'); await espera(2500);
  if (await C.$('#ll-contestar:visible')) await C.click('#ll-contestar');
  for (let i = 0; i < 40; i++) { if ((await columnas(P)).length >= 2) break; await espera(500); }
  await espera(3000);
  // 1. dos columnas y una raya que se arrastra
  let col = await columnas(P), ry = await rayas(P);
  comprueba(col.length === 2 && Math.abs(col[0].w - W / 2) <= 4, '1. en grupo: las dos personas, mitad y mitad', col);
  comprueba(ry.length === 1 && Math.abs(ry[0] - W / 2) <= 3, '1. una raya en medio', ry);
  await P.mouse.move(400, 300); await espera(300);
  await P.screenshot({ path: path.join(OUT, '1-grupo.png') });
  await P.mouse.move(W / 2, 400); await espera(150);
  comprueba(await P.evaluate(() => getComputedStyle(document.querySelector('#llamada')).cursor) === 'col-resize', '1. sobre la raya, el cursor de arrastrar');
  await P.mouse.down(); await P.mouse.up(); await espera(500);
  comprueba(!(await P.evaluate(() => document.querySelector('#llamada').dataset.foco)) && (await columnas(P)).length === 2, '1. un clic en la raya no cambia la vista');
  await P.mouse.move(W / 2, 400); await P.mouse.down();
  for (let i = 1; i <= 10; i++) { await P.mouse.move(W / 2 - (W * 0.15) * i / 10, 400); await espera(20); }
  await P.mouse.up(); await espera(500);
  col = await columnas(P); ry = await rayas(P);
  comprueba(col.length === 2 && Math.abs(col[0].w - W * 0.35) <= 6 && Math.abs(col[1].w - W * 0.65) <= 6, '1. arrastrar la raya reparte (35 / 65)', col);
  comprueba(!(await P.evaluate(() => document.querySelector('#llamada').dataset.foco)), '1. soltar la raya no cambia la vista');
  await P.mouse.move(W * 0.35, 400); await P.mouse.down();
  for (let i = 1; i <= 10; i++) { await P.mouse.move(W * 0.35 - (W * 0.3) * i / 10, 400); await espera(20); }
  await P.mouse.up(); await espera(400);
  col = await columnas(P);
  comprueba(Math.abs(col[0].w - W * 0.3) <= 6, '1. no baja del 30 %', col);
  await P.mouse.move(400, 300); await espera(300);
  await P.screenshot({ path: path.join(OUT, '1b-grupo-raya.png') });
  // 2. «Cambiar vista» en grupo
  const txt = ((await P.textContent('#ll-vista-caja > span')) || '').trim();
  comprueba(await visible(P, '#ll-vista') && txt === 'Cambiar vista', '2. «Cambiar vista» también en grupo');
  await P.evaluate(() => document.querySelector('#ll-vista').click()); await espera(800);
  col = await columnas(P); ry = await rayas(P);
  comprueba(col.length === 3 && col.some((c) => c.id === 'v-local') && col.every((c) => Math.abs(c.w - W / 3) <= 6), '2. tú en una columna más: tres a partes iguales', col);
  comprueba(ry.length === 2, '2. dos rayas', ry);
  await P.mouse.move(400, 300); await espera(300);
  await P.screenshot({ path: path.join(OUT, '2-grupo-tres-columnas.png') });
  await P.mouse.move(ry[1], 400); await P.mouse.down();
  for (let i = 1; i <= 10; i++) { await P.mouse.move(ry[1] + (W * 0.1) * i / 10, 400); await espera(20); }
  await P.mouse.up(); await espera(400);
  col = await columnas(P);
  comprueba(col.length === 3 && Math.abs(col[2].w - (W / 3 - W * 0.1)) <= 8, '2. la segunda raya también se arrastra', col);
  await P.evaluate(() => document.querySelector('#ll-vista').click()); await espera(800);
  col = await columnas(P);
  const vl = await caja(P, '#v-local');
  comprueba(col.length === 2 && vl && vl.w < W * 0.2, '2. otra vez: tú en pequeño', { col, vl });
  // 3. tu imagen pequeña se agranda desde su esquina (la que mira al centro)
  const a = await caja(P, '#v-local');
  const esq = { x: a.x + 2, y: a.y + 2 }; // abajo a la derecha: la esquina que mira al centro es la de arriba a la izquierda
  await P.mouse.move(esq.x, esq.y); await espera(150);
  const cursor = await P.evaluate(() => document.querySelector('#llamada').classList.contains('mi-tam'));
  await P.mouse.down();
  for (let i = 1; i <= 10; i++) { await P.mouse.move(esq.x - 200 * i / 10, esq.y - 150 * i / 10); await espera(20); }
  await P.mouse.up(); await espera(500);
  const b = await caja(P, '#v-local');
  // 13:43 (dueño, con la foto de la flecha doble): «borra ese símbolo»: en el PC, sin flecha de cambiar el tamaño; la imagen solo se mueve
  comprueba(!cursor && Math.abs(b.w - a.w) < 2 && (b.x !== a.x || b.y !== a.y), '3. sin flecha de cambiar el tamaño: tu imagen pequeña solo se mueve', { antes: a, despues: b });
  await P.mouse.move(esq.x - 400, esq.y - 300); await P.mouse.down(); await P.mouse.up(); await espera(300);
  await P.mouse.move(400, 300); await espera(300);
  await P.screenshot({ path: path.join(OUT, '3-grupo-mi-imagen.png') });
  await P.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
