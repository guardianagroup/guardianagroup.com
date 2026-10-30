// La videollamada en el PC (dueño, 30 Oct 2026, 11:33–11:34): la raya del medio de la pantalla partida se arrastra a izquierda o a
// derecha y tocarla no cambia nada; «Cambiar vista» va abajo con los demás botones; «Conexión: excelente», a la izquierda.
//   1. El PC llama a un teléfono: la pantalla sale partida, con la raya en el medio.
//   2. Un clic en la raya no cambia nada.
//   3. Arrastrar la raya reparte la pantalla (y se recuerda).
//   4. «Cambiar vista» quita y vuelve a poner la pantalla partida, con el reparto elegido.
//   5. «Conexión» va a la izquierda, junto a «Encriptada de extremo a extremo».
//   6. En el teléfono no hay raya.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'pc-vista');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, pc) {
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 793 }, deviceScaleFactor: pc ? 1 : 2, isMobile: !pc, hasTouch: !pc, userAgent: pc ? PC : UA, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  await ctx.addInitScript(() => { window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]')); }, s);
const caja = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, s);
const partida = (P) => P.evaluate(() => document.querySelector('#llamada').classList.contains('dividida'));
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await equipo(browser, false), P = await equipo(browser, true);
  await A.goto(URL0 + '?app=1'); await espera(1500);
  await A.click('#nueva-blindada'); await espera(400); await A.click('#invitar-otra'); await espera(1200);
  const url = String((await A.evaluate(() => window.__compartidos[window.__compartidos.length - 1])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await P.goto(url); await espera(1500); if (await P.$('#aceptar-si:visible')) await P.click('#aceptar-si'); await espera(5000);
  // 1. el PC llama
  await P.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await A.$('#ll-contestar:visible')) await A.click('#ll-contestar');
  await espera(6000);
  const W = 1280;
  comprueba(await partida(P), '1. la videollamada en el PC sale partida');
  comprueba(await visible(P, '#ll-raya'), '1. la raya del medio está');
  const r0 = await caja(P, '#ll-raya');
  comprueba(r0 && Math.abs(r0.x + r0.w / 2 - W / 2) <= 3, '1. en el medio', r0);
  await P.mouse.move(400, 300); await espera(300);
  await P.screenshot({ path: path.join(OUT, '1-pc-partida.png') });
  // 2. un clic en la raya no cambia nada
  const l0 = await caja(P, '#v-local');
  await P.mouse.move(W / 2, 420); await espera(150);
  comprueba(await P.evaluate(() => getComputedStyle(document.querySelector('#llamada')).cursor) === 'col-resize', '2. sobre la raya, el cursor de arrastrar');
  await P.mouse.down(); await P.mouse.up(); await espera(500);
  const l1 = await caja(P, '#v-local');
  comprueba(await partida(P) && l1 && Math.abs(l1.w - l0.w) < 2, '2. un clic en la raya no cambia nada', { antes: l0 && l0.w, despues: l1 && l1.w });
  // 3. arrastrar la raya hasta el 10 %: no pasa del 30 % (11:47: «se mueve demasiado»); la otra persona, el 30 %; tú, el 70 %
  await P.mouse.move(W / 2, 420); await P.mouse.down();
  for (let i = 1; i <= 10; i++) { await P.mouse.move(W / 2 - (W * 0.4) * i / 10, 420); await espera(20); } // hasta el 10 %: se queda en el 30 % (11:47)
  await P.mouse.up(); await espera(500);
  const rem = await caja(P, '#v-remoto'), loc = await caja(P, '#v-local'), r1 = await caja(P, '#ll-raya');
  comprueba(rem && loc && Math.abs(rem.w - W * 0.3) <= 6 && Math.abs(loc.w - W * 0.7) <= 6 && Math.abs(loc.x - W * 0.3) <= 6, '3. arrastrar la raya reparte la pantalla (30 / 70)', { remoto: rem, local: loc });
  comprueba(r1 && Math.abs(r1.x + r1.w / 2 - W * 0.3) <= 4, '3. la raya queda donde se suelta', r1);
  const guardado = await P.evaluate(() => { try { return JSON.parse(localStorage.getItem('gcom-mi-imagen') || '{}').p; } catch (_) { return null; } });
  comprueba(Math.abs(guardado - 0.7) < 0.02, '3. se recuerda (' + guardado + ')');
  await P.mouse.move(400, 300); await espera(300);
  await P.screenshot({ path: path.join(OUT, '3-pc-raya-movida.png') });
  // 4. «Cambiar vista», abajo con los demás botones
  const txt = ((await P.textContent('#ll-vista-caja > span')) || '').trim();
  comprueba(await visible(P, '#ll-vista') && txt === 'Cambiar vista', '4. el botón «' + txt + '» está abajo');
  const bv = await caja(P, '#ll-vista'), bc = await caja(P, '#ll-colgar');
  comprueba(bv && bc && Math.abs((bv.y + bv.h / 2) - (bc.y + bc.h / 2)) < 4, '4. en la fila de los botones (con «Colgar»)');
  await P.evaluate(() => document.querySelector('#ll-vista').click()); await espera(500);
  comprueba(!(await partida(P)) && !(await visible(P, '#ll-raya')), '4. «Cambiar vista»: ya no está partida, ni la raya');
  { const v = await caja(P, '#v-local'); let flecha = false; for (const [dx, dy] of [[2, 2], [v.w - 2, 2], [2, v.h - 2], [v.w - 2, v.h - 2]]) { await P.mouse.move(v.x + dx, v.y + dy); await espera(120); if (await P.evaluate(() => document.querySelector('#llamada').classList.contains('mi-tam'))) flecha = true; } comprueba(!flecha, '4. en pequeño, sin la flecha de cambiar el tamaño en ninguna esquina (13:43)'); }
  await P.mouse.move(420, 320); await espera(300);
  await P.screenshot({ path: path.join(OUT, '4-pc-pequena.png') });
  await P.evaluate(() => document.querySelector('#ll-vista').click()); await espera(500);
  const loc2 = await caja(P, '#v-local');
  comprueba(await partida(P) && loc2 && Math.abs(loc2.w - W * 0.7) <= 6, '4. otra vez: partida, con el reparto elegido', loc2);
  // 5. «Conexión», a la izquierda
  const ci = await caja(P, '.gc-llamada-arriba .gc-llamada-cifrado'), ca = await caja(P, '#ll-calidad');
  const tc = ((await P.textContent('#ll-calidad')) || '').trim();
  comprueba(ci && ca && ca.w > 0 && ca.x >= ci.x + ci.w && ca.x - (ci.x + ci.w) < 40 && ca.x + ca.w < W * 0.45, '5. «' + tc + '», a la izquierda, junto a «Encriptada»', { cifrado: ci, calidad: ca });
  await P.screenshot({ path: path.join(OUT, '5-pc-arriba.png'), clip: { x: 0, y: 0, width: W, height: 90 } });
  // 6. en el teléfono, sin raya
  comprueba(!(await visible(A, '#ll-raya')), '6. en el teléfono no hay raya');
  await A.screenshot({ path: path.join(OUT, '6-telefono.png') });
  await P.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
