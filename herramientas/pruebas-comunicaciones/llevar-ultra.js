// Pasar una llamada Ultra al teléfono (dueño, 15 nov 2026, 21:42: «en el modo ultra, cuando la persona pasa la conversación al móvil
// y se cuelga, tiene que poder volver a llamar, al igual que en la sesión blindada… En ambas»). A (PC con Plus, en local «?plan=plus»)
// crea la conversación Ultra y B (PC) la acepta; A llama con vídeo a B y pasa la llamada a su teléfono T:
//   0. en la videollamada Ultra sale «Pasar al teléfono»; el código QR lleva la llave, el secreto de «Volver al PC» y «.u».
//   1. T contesta solo y sigue con B; A sale. En T y en B la llamada sigue siendo Ultra: «Voz cambiada» y «Mosaico» puestos y a la
//      vista, la tarjeta roja del código con el mismo código en los dos, el Monitor de seguridad (plegado en T) y la capa postcuántica.
//   2. T cuelga: en T, «Llamada terminada» con «Volver a llamar»; en B, la tarjeta con «Volver a llamar».
//   3. «Volver a llamar» desde T: B contesta y vuelven a hablar, otra vez en Ultra (voz cambiada, mosaico y código).
//   4. B cuelga y T pulsa «Cerrar»: la llave (y la marca de Ultra) se borran de la pestaña.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'llevar-ultra');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, pc, nombre) {
  const ctx = await browser.newContext({ viewport: pc ? { width: 1366, height: 820 } : { width: 393, height: 852 }, deviceScaleFactor: pc ? 1 : 2, isMobile: !pc, hasTouch: !pc, userAgent: pc ? PC : IPHONE, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); sessionStorage.setItem('gcom-rota-ms', '8000'); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  if (process.env.DEP === '1') p.on('console', (m) => { const x = m.text(); if (!/Download the React DevTools|favicon/.test(x)) console.log('   [' + nombre + ' ' + m.type() + '] ' + x.slice(0, 220)); });
  return p;
}
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]')); }, s);
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
const enSesion = (P) => P.evaluate(() => [...((window.GuardianaCom && GuardianaCom.convs) || new Map()).values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada));
const ultraEn = (P) => P.evaluate(() => {
  const ve = (e) => !!(e && !e.hidden && e.getClientRects().length && !e.closest('[hidden]'));
  const ef = (id) => { const b = document.querySelector(id); return b ? { ve: ve(b), on: b.getAttribute('aria-pressed') === 'true' } : null; };
  const L = window.GuardianaCom && GuardianaCom.llamada;
  return { voz: ef('#ll-ef-voz'), mosaico: ef('#ll-ef-mosaico'), tarjeta: ve(document.querySelector('#ll-cod')), num: (document.querySelector('#ll-cod-num') || {}).textContent || '', codigo: L ? L.codigo : '', monitor: ve(document.querySelector('#ll-mon')), pq: L ? L.pq : false, vozModo: L ? L.voz : '', imagen: L ? L.imagen : '' };
});
async function codigoIgual(X, Y, ms) { let x, y; const ok = await hasta(async () => { x = await ultraEn(X); y = await ultraEn(Y); return x.tarjeta && y.tarjeta && /^\d{3} \d{3}$/.test(x.num) && x.num === y.num; }, ms || 15000); return { ok, x, y }; }
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await equipo(browser, true, 'A'), B = await equipo(browser, true, 'B'), T = await equipo(browser, false, 'T');
  await A.goto(URL0 + '?plan=plus'); await espera(1500);
  await A.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
  const url = String(await A.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await B.goto(url); await espera(1500); if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si');
  comprueba(await hasta(async () => (await enSesion(A)) && (await enSesion(B)), 20000), '0. conversación Ultra entre A y B');
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada Ultra');
  await espera(2500);
  await A.evaluate(() => document.querySelector('#llamada').dispatchEvent(new PointerEvent('pointermove'))); await espera(200);
  comprueba(await visible(A, '#ll-llevar'), '0. en la videollamada Ultra sale «Pasar al teléfono»');
  await A.evaluate(() => document.querySelector('#ll-llevar').click()); await espera(800);
  const dir = await A.evaluate(() => document.querySelector('#llevar-qr').dataset.url);
  comprueba(/#llevar=[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}\.u$/.test(dir || ''), '0. el código lleva la llave, el secreto de «Volver al PC» y «.u» (Ultra)', String(dir).slice(-12));
  await A.screenshot({ path: path.join(OUT, '0-pc-codigo.png') });
  // 1. el teléfono
  await T.goto(String(dir).replace('https://guardianagroup.com', 'http://127.0.0.1:8080'));
  const paso = await hasta(async () => (await estado(T)) === 'hablando' && (await estado(A)) === 'libre' && (await estado(B)) === 'hablando', 35000);
  comprueba(paso, '1. traspaso hecho: T habla con B y A ha salido', { A: await estado(A), B: await estado(B), T: await estado(T) });
  await espera(2000);
  let t = await ultraEn(T), b = await ultraEn(B);
  comprueba(t.voz && t.voz.ve && t.voz.on && t.mosaico && t.mosaico.ve && t.mosaico.on && t.vozModo === 'ultra' && t.imagen === 'mosaico', '1. en el teléfono, «Voz cambiada» y «Mosaico» puestos y a la vista', { voz: t.voz, mosaico: t.mosaico, modo: t.vozModo, imagen: t.imagen });
  comprueba(b.voz && b.voz.ve && b.mosaico && b.mosaico.ve, '1. y en B siguen a la vista', { voz: b.voz, mosaico: b.mosaico });
  comprueba(t.pq && b.pq, '1. con la capa postcuántica en los dos (llave del código QR)', { T: t.pq, B: b.pq });
  const c1 = await codigoIgual(T, B);
  comprueba(c1.ok, '1. la tarjeta roja del código, el mismo en el teléfono y en B', { T: c1.x && c1.x.num, B: c1.y && c1.y.num });
  t = await ultraEn(T);
  comprueba(t.monitor && await visible(B, '#ll-mon'), '1. el Monitor de seguridad, en el teléfono y en B');
  await T.screenshot({ path: path.join(OUT, '1-tel-ultra.png') }); await B.screenshot({ path: path.join(OUT, '1-b-ultra.png') });
  // 2. T cuelga
  await T.evaluate(() => document.querySelector('#ll-colgar').click());
  comprueba(await hasta(async () => (await estado(B)) === 'libre' || (await estado(B)) === 'cerrando', 15000), '2. T cuelga: a B se le termina');
  comprueba(await hasta(async () => (await T.textContent('#llevar-t')) === 'Llamada terminada' && await visible(T, '#llevar-volver'), 10000), '2. en T: «Llamada terminada» con «Volver a llamar»');
  comprueba(await hasta(() => visible(B, '#llevar-cortada'), 10000), '2. y en B, la tarjeta con «Volver a llamar»');
  await T.screenshot({ path: path.join(OUT, '2-tel-colgada.png') });
  // 3. «Volver a llamar» desde el teléfono
  await T.click('#llevar-volver');
  if (await hasta(() => visible(B, '#ll-contestar'), 20000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(T)) === 'hablando' && (await estado(B)) === 'hablando', 25000), '3. «Volver a llamar» desde el teléfono: vuelven a hablar');
  await espera(2000);
  t = await ultraEn(T); b = await ultraEn(B);
  comprueba(t.voz && t.voz.ve && t.voz.on && t.vozModo === 'ultra' && b.voz && b.voz.ve && b.voz.on && b.vozModo === 'ultra', '3. otra vez en Ultra: la voz cambiada puesta en los dos', { T: [t.voz, t.vozModo], B: [b.voz, b.vozModo] });
  const c3 = await codigoIgual(T, B);
  comprueba(c3.ok && (await ultraEn(T)).pq, '3. con la capa postcuántica y la tarjeta roja, el mismo código en los dos', { T: c3.x && c3.x.num, B: c3.y && c3.y.num });
  await T.screenshot({ path: path.join(OUT, '3-tel-otra-vez.png') });
  // 4. B cuelga y «Cerrar» en el teléfono
  await B.evaluate(() => document.querySelector('#ll-colgar').click());
  comprueba(await hasta(() => visible(T, '#llevar-cerrar'), 15000), '4. B cuelga: en T, «Volver a llamar» y «Cerrar»');
  await T.click('#llevar-cerrar'); await espera(800);
  const queda = await T.evaluate(() => ['gcom-llevar', 'gcom-llevar-yo', 'gcom-llevar-u'].map((k) => sessionStorage.getItem(k)));
  comprueba(queda.every((x) => !x), '4. «Cerrar»: la llave y la marca de Ultra se borran de la pestaña', queda);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
