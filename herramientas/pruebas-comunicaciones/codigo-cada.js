// El código de seguridad de Ultra (dueño, 16 Nov 2026, 11:04: «el código, una vez que lo decimos, ya no quiero que aparezca más en
// pantalla y que tampoco aparezcan las letras de arriba. Es más, las palabras quítalas… y luego que aparezca cada 2 minutos, cada 5, o
// incluso que lo podamos nosotros decir… cada una vez, cada 5 minutos, cada hora, cada 15, 30 minutos»). A y B en videollamada Ultra
// (aquí la llave cambia cada 8 s; en la de verdad, cada 2 minutos).
//   1. Al empezar, la tarjeta del código en los dos, el mismo; arriba, ni las palabras ni la línea de cada lado; en la tarjeta,
//      «Volver a comprobar: Cada 2 minutos».
//   2. «Coinciden»: fuera la tarjeta, y tampoco queda la píldora del código: nada en pantalla.
//   3. Con «Cada 2 minutos», al cambiar la llave, la tarjeta vuelve («El código ha cambiado»).
//   4. Lo que elige uno lo tiene el otro: «Solo al empezar» en A pasa a B; dicho el código, ya no vuelve aunque cambie la llave.
//   5. «Cada 5 minutos» también pasa al otro, y queda para la próxima llamada.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'codigo-cada');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); sessionStorage.setItem('gcom-rota-ms', '8000'); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(250); } return false; };
const enSesion = (P) => P.evaluate(() => [...((window.GuardianaCom && GuardianaCom.convs) || new Map()).values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada));
const vista = (P) => P.evaluate(() => {
  const ve = (e) => !!(e && !e.hidden && e.getClientRects().length && !e.closest('[hidden]') && getComputedStyle(e).display !== 'none');
  const card = document.querySelector('#ll-cod'), sel = document.querySelector('#ll-cod-cada');
  return { tarjeta: ve(card), num: card ? card.querySelector('#ll-cod-num').textContent.replace(/\D/g, '') : '', titulo: card ? card.querySelector('#ll-cod-t').textContent : '',
    pildora: ve(document.querySelector('#ll-cod-chip')), palabras: ve(document.querySelector('#ll-sas-mini')) || ve(document.querySelector('#ll-sas')), nivel: ve(document.querySelector('#ll-nivel')),
    cada: sel ? sel.value : null, cadaVe: ve(sel), cadaTexto: sel ? sel.options[sel.selectedIndex].textContent : '', etiqueta: (document.querySelector('#ll-cod-cada-t') || {}).textContent || '',
    guardado: localStorage.getItem('gcom-verifica-cada') };
});
async function llamada(A, B) {
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(() => B.evaluate(() => { const b = document.querySelector('#ll-contestar'); return !!(b && b.getClientRects().length); }), 15000)) await B.click('#ll-contestar');
  return hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000);
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const B = await equipo(browser, 'B'), A = await equipo(browser, 'A');
  await B.goto(URL0 + '?plan=plus'); await espera(1500);
  await B.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
  const url = String(await B.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si');
  comprueba(await hasta(async () => (await enSesion(A)) && (await enSesion(B)), 20000), '0. conversación Ultra entre A y B');
  comprueba(await llamada(A, B), '0. A y B en videollamada Ultra');

  // 1. al empezar
  comprueba(await hasta(async () => (await vista(A)).tarjeta && (await vista(B)).tarjeta, 15000), '1. la tarjeta del código sale en los dos');
  let a = await vista(A), b = await vista(B);
  comprueba(a.num.length === 6 && a.num === b.num, '1. con el mismo código', { A: a.num, B: b.num });
  comprueba(!a.palabras && !b.palabras && !a.nivel && !b.nivel, '1. arriba, ni las palabras ni la línea de cada lado', { A: [a.palabras, a.nivel], B: [b.palabras, b.nivel] });
  comprueba(a.cadaVe && a.cada === '2' && a.cadaTexto === 'Cada 2 minutos' && a.etiqueta === 'Volver a comprobar', '1. en la tarjeta, «Volver a comprobar: Cada 2 minutos»', { cada: a.cada, texto: a.cadaTexto, etiqueta: a.etiqueta });
  await A.screenshot({ path: path.join(OUT, '1-a-tarjeta.png') });

  // 2. «Coinciden»: nada en pantalla
  await A.click('#ll-cod-si'); await B.click('#ll-cod-si'); await espera(700);
  a = await vista(A); b = await vista(B);
  comprueba(!a.tarjeta && !a.pildora && !a.palabras && !b.tarjeta && !b.pildora && !b.palabras, '2. «Coinciden»: ni tarjeta ni píldora ni palabras en los dos', { A: a, B: b });
  await A.screenshot({ path: path.join(OUT, '2-a-dicho.png') });

  // 3. cambia la llave: vuelve
  const antes = a.num;
  comprueba(await hasta(async () => { const x = await vista(A); return x.tarjeta && x.num !== antes; }, 14000), '3. con «Cada 2 minutos», al cambiar la llave vuelve la tarjeta');
  a = await vista(A);
  comprueba(a.titulo === 'El código ha cambiado', '3. «El código ha cambiado»', a.titulo);
  await A.click('#ll-cod-si'); await B.click('#ll-cod-si').catch(() => {}); await espera(500);

  // 4. «Solo al empezar» pasa a B; ya no vuelve
  const abierta = await hasta(async () => (await vista(A)).tarjeta, 14000);
  if (abierta) { await A.selectOption('#ll-cod-cada', '0'); await espera(800); }
  b = await vista(B); a = await vista(A);
  comprueba(abierta && a.cada === '0' && b.cada === '0' && a.guardado === '0' && b.guardado === '0', '4. «Solo al empezar» en A pasa a B (y se guarda en los dos)', { A: a.cada, B: b.cada, gA: a.guardado, gB: b.guardado });
  await A.click('#ll-cod-si').catch(() => {}); await B.click('#ll-cod-si').catch(() => {}); await espera(600);
  const n0 = (await vista(A)).num;
  let volvio = false; const fin = Date.now() + 20000;
  while (Date.now() < fin) { const x = await vista(A), y = await vista(B); if (x.tarjeta || x.pildora || y.tarjeta || y.pildora) { volvio = true; break; } await espera(500); }
  const cambio = await A.evaluate(() => GuardianaCom.llamada.codigo);
  comprueba(!volvio && cambio && cambio !== n0, '4. dicho el código, ya no vuelve aunque cambie la llave (dos cambios)', { volvio, antes: n0, ahora: cambio });

  // 5. «Cada 5 minutos» desde B, y para la próxima
  await B.evaluate(() => { const c = document.querySelector('#ll-cod'); c.hidden = false; const s = document.querySelector('#ll-cod-cada'); s.value = '5'; s.dispatchEvent(new Event('change')); c.hidden = true; });
  await espera(800);
  a = await vista(A); b = await vista(B);
  comprueba(a.cada === '5' && b.cada === '5' && a.guardado === '5', '5. «Cada 5 minutos» en B pasa a A', { A: a.cada, B: b.cada });
  await A.evaluate(() => document.querySelector('#ll-colgar').click());
  await hasta(async () => (await estado(A)) === 'libre' && (await estado(B)) === 'libre', 15000); await espera(1500);
  comprueba(await llamada(A, B), '5. otra llamada');
  comprueba(await hasta(async () => (await vista(A)).tarjeta, 15000), '5. su tarjeta, al empezar');
  a = await vista(A);
  comprueba(a.cada === '5', '5. y ya con «Cada 5 minutos»', a.cada);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
