// El monitor de seguridad, donde lo deje la persona (dueño, 16 nov 2026, 12:42: «se puede minimizar, pero se queda en el mismo
// sitio… me está tapando un poco la cara de mi amigo. Pon para que se pueda poner donde la persona lo quiera poner, en cualquier
// parte de la pantalla»). En una videollamada Ultra de PC a PC:
//   1. Se arrastra por su cabecera a cualquier sitio y se queda ahí; arrastrar no lo pliega.
//   2. Un clic sin arrastrar lo sigue plegando y abriendo, sin moverlo de su sitio.
//   3. Nunca se sale de la pantalla: llevado más allá de una esquina, se queda dentro; abierto, si no cabe, sube lo justo.
//   4. Con el teclado: las flechas de la cabecera lo mueven (con Mayúsculas, más).
//   5. También se lleva por su línea de estado («Todo en orden · comprobado hace…»).
//   6. Con la ventana más pequeña, sigue dentro y en su proporción; con la llamada reducida (ventana de menos de 640 × 480),
//      sigue al ratón.
//   7. En la llamada siguiente sale donde se dejó. Lo de A no cambia el de B.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'monitor-mover');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, nombre, vp) {
  const ctx = await browser.newContext({ viewport: vp || { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(250); } return false; };
const enSesion = (P) => P.evaluate(() => [...((window.GuardianaCom && GuardianaCom.convs) || new Map()).values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada));
const mon = (P) => P.evaluate(() => {
  const m = document.querySelector('#ll-mon'); if (!m || m.hidden) return { ve: false };
  const r = m.getBoundingClientRect(), c = m.querySelector('#ll-mon-cab').getBoundingClientRect(), e = m.querySelector('.ll-mon-estado').getBoundingClientRect();
  let pos = null; try { pos = JSON.parse(localStorage.getItem('gcom-mon-pos') || 'null'); } catch (_) {}
  return { ve: true, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), der: Math.round(r.right), abajo: Math.round(r.bottom), W: innerWidth, H: innerHeight, plegado: m.classList.contains('plegado'), movido: m.classList.contains('movido'), arrastrando: m.classList.contains('arrastrando'), cab: { x: c.left + c.width / 2, y: c.top + c.height / 2 }, est: { x: e.left + Math.min(60, e.width / 2), y: e.top + e.height / 2 }, pos, escalada: document.querySelector('#llamada').classList.contains('escalada') };
});
async function arrastra(P, desde, dx, dy) {
  await P.mouse.move(desde.x, desde.y); await P.mouse.down();
  await P.mouse.move(desde.x + dx / 2, desde.y + dy / 2, { steps: 8 }); await P.mouse.move(desde.x + dx, desde.y + dy, { steps: 8 });
  await P.mouse.up(); await espera(250);
}
const cerca = (a, b, t) => Math.abs(a - b) <= (t || 3);
const dentro = (m) => m.x >= 7 && m.y >= 7 && m.der <= m.W - 7 && m.abajo <= m.H - 7;
async function llama(A, B) {
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
  comprueba(await llama(A, B), '0. A y B en videollamada Ultra');
  comprueba(await hasta(async () => (await mon(A)).ve, 8000), '0. A ve el monitor');
  // el código, dicho en voz alta y bien en los dos: fuera la tarjeta del centro (encima de todo)
  const tarjeta = (P) => P.evaluate(() => { const c = document.querySelector('#ll-cod'); return !!(c && !c.hidden && c.getClientRects().length); });
  await hasta(async () => (await tarjeta(A)) && (await tarjeta(B)), 15000);
  await A.click('#ll-cod-si').catch(() => {}); await B.click('#ll-cod-si').catch(() => {});
  comprueba(await hasta(async () => !(await tarjeta(A)) && !(await tarjeta(B)), 8000), '0. «Coinciden» en los dos: fuera la tarjeta');
  await espera(800);

  // 1. arrastrar por la cabecera
  let m0 = await mon(A);
  comprueba(!m0.movido && !m0.plegado, '1. de entrada, en su sitio de siempre y abierto', { x: m0.x, y: m0.y });
  await A.screenshot({ path: path.join(OUT, '1-antes.png') });
  await arrastra(A, m0.cab, 520, 150);
  let m1 = await mon(A);
  comprueba(m1.movido && cerca(m1.x, m0.x + 520) && cerca(m1.y, Math.min(m0.y + 150, m1.H - m1.h - 8)), '1. llevado por la cabecera, se queda donde se suelta', { antes: [m0.x, m0.y], ahora: [m1.x, m1.y], h: m1.h });
  comprueba(m1.plegado === m0.plegado, '1. arrastrar no lo pliega ni lo abre', { plegado: m1.plegado });
  comprueba(m1.pos && cerca(m1.pos.fx * m1.W, m1.x, 2) && cerca(m1.pos.fy * m1.H, m1.y, 2), '1. se apunta dónde quedó', m1.pos);
  await A.screenshot({ path: path.join(OUT, '1-movido.png') });

  // 2. un clic sin arrastrar
  await A.mouse.click(m1.cab.x, m1.cab.y); await espera(350);
  let m2 = await mon(A);
  comprueba(m2.plegado && cerca(m2.x, m1.x, 1) && cerca(m2.y, m1.y, 1), '2. un clic lo pliega, sin moverlo', { plegado: m2.plegado, x: m2.x, y: m2.y });
  await A.mouse.click(m2.cab.x, m2.cab.y); await espera(350);
  m2 = await mon(A);
  comprueba(!m2.plegado && cerca(m2.x, m1.x, 1), '2. otro clic lo abre', { plegado: m2.plegado, x: m2.x });

  // 3. nunca fuera de la pantalla
  await arrastra(A, m2.cab, 3000, 3000);
  let m3 = await mon(A);
  comprueba(dentro(m3) && cerca(m3.der, m3.W - 8) && cerca(m3.abajo, m3.H - 8), '3. llevado más allá de la esquina, se queda dentro', { der: m3.der, abajo: m3.abajo, W: m3.W, H: m3.H });
  await A.screenshot({ path: path.join(OUT, '3-esquina.png') });
  // plegado ahí abajo, y abierto otra vez: sube lo justo para caber
  await A.mouse.click(m3.cab.x, m3.cab.y); await espera(350);
  const m3p = await mon(A);
  await arrastra(A, m3p.cab, 0, 3000);
  const m3b = await mon(A);
  comprueba(m3b.plegado && cerca(m3b.abajo, m3b.H - 8), '3. plegado, baja hasta el borde de abajo', { abajo: m3b.abajo, H: m3b.H });
  await A.mouse.click(m3b.cab.x, m3b.cab.y); await espera(350);
  const m3c = await mon(A);
  comprueba(!m3c.plegado && dentro(m3c) && m3c.y < m3b.y, '3. abierto ahí, sube lo justo para caber entero', { y: m3c.y, abajo: m3c.abajo, H: m3c.H });
  await A.mouse.click(m3c.cab.x, m3c.cab.y); await espera(350);
  const m3d = await mon(A);
  comprueba(m3d.plegado && cerca(m3d.y, m3b.y, 1), '3. plegado otra vez, vuelve a su sitio', { y: m3d.y, antes: m3b.y });
  await A.mouse.click(m3d.cab.x, m3d.cab.y); await espera(350);

  // 4. con el teclado
  await arrastra(A, (await mon(A)).cab, -400, -300);
  const m4 = await mon(A);
  await A.focus('#ll-mon-cab');
  await A.keyboard.press('ArrowLeft'); await A.keyboard.press('ArrowLeft'); await espera(150);
  let m4b = await mon(A);
  comprueba(cerca(m4b.x, m4.x - 40, 1) && cerca(m4b.y, m4.y, 1), '4. dos veces la flecha izquierda: 40 px a la izquierda', { antes: m4.x, ahora: m4b.x });
  await A.keyboard.press('Shift+ArrowUp'); await espera(150);
  const m4c = await mon(A);
  comprueba(cerca(m4c.y, Math.max(8, m4b.y - 80), 1), '4. Mayúsculas y flecha arriba: 80 px arriba', { antes: m4b.y, ahora: m4c.y });
  comprueba(m4c.plegado === m4b.plegado, '4. las flechas no lo pliegan', { plegado: m4c.plegado });
  comprueba(m4c.pos && cerca(m4c.pos.fx * m4c.W, m4c.x, 2) && cerca(m4c.pos.fy * m4c.H, m4c.y, 2), '4. y se apunta', m4c.pos);

  // 5. por la línea de estado
  const m5a = await mon(A);
  await arrastra(A, m5a.est, 120, 90);
  const m5 = await mon(A);
  comprueba(cerca(m5.x, m5a.x + 120) && cerca(m5.y, Math.min(m5a.y + 90, m5.H - m5.h - 8)) && m5.plegado === m5a.plegado, '5. también se lleva por su línea de estado', { antes: [m5a.x, m5a.y], ahora: [m5.x, m5.y] });
  const sel = await A.evaluate(() => String(getSelection() || ''));
  comprueba(!sel, '5. arrastrar no selecciona texto', sel);

  // 6. otra ventana
  const fx = m5.pos.fx, fy = m5.pos.fy;
  await A.setViewportSize({ width: 1000, height: 700 }); await espera(700);
  const m6 = await mon(A);
  comprueba(dentro(m6) && cerca(m6.x, Math.min(fx * 1000, 1000 - m6.w - 8), 3) && cerca(m6.y, Math.min(fy * 700, 700 - m6.h - 8), 3), '6. con la ventana más pequeña, dentro y en su proporción', { x: m6.x, y: m6.y, w: m6.w, h: m6.h, fx, fy });
  await A.setViewportSize({ width: 560, height: 420 }); await espera(800);
  const m6b = await mon(A);
  comprueba(m6b.escalada && dentro(m6b), '6. con la llamada reducida (560 × 420), dentro', { escalada: m6b.escalada, x: m6b.x, y: m6b.y, der: m6b.der, abajo: m6b.abajo });
  const antesB = await mon(A);
  await arrastra(A, antesB.cab, -60, 40);
  const m6c = await mon(A);
  comprueba(dentro(m6c) && (cerca(m6c.x, antesB.x - 60, 3) || cerca(m6c.x, 7, 2)) && (cerca(m6c.y, antesB.y + 40, 3) || cerca(m6c.abajo, m6c.H - 7, 2)), '6. reducida, sigue al ratón', { antes: [antesB.x, antesB.y], ahora: [m6c.x, m6c.y] });
  await A.screenshot({ path: path.join(OUT, '6-reducida.png') });
  await A.setViewportSize({ width: 1280, height: 800 }); await espera(700);

  // 7. la llamada siguiente
  await arrastra(A, (await mon(A)).cab, 300, 60);
  const m7a = await mon(A);
  const guardado = m7a.pos;
  await A.evaluate(() => document.querySelector('#ll-colgar').click());
  comprueba(await hasta(async () => (await estado(A)) !== 'hablando' && (await estado(B)) !== 'hablando', 15000), '7. colgada');
  await espera(2500);
  comprueba(await llama(A, B), '7. otra videollamada');
  comprueba(await hasta(async () => (await mon(A)).ve, 8000), '7. el monitor otra vez');
  await espera(600);
  const m7 = await mon(A), mb = await mon(B);
  comprueba(m7.movido && cerca(m7.x, Math.min(guardado.fx * m7.W, m7.W - m7.w - 8), 3) && cerca(m7.y, Math.min(guardado.fy * m7.H, m7.H - m7.h - 8), 3), '7. sale donde se dejó', { x: m7.x, y: m7.y, guardado });
  comprueba(mb.ve && !mb.movido, '7. el de B, en su sitio de siempre', { x: mb.x, y: mb.y });
  await A.screenshot({ path: path.join(OUT, '7-siguiente.png') });

  await browser.close();
  console.log(fallos.length ? '\n' + fallos.length + ' FALLOS:\n- ' + fallos.join('\n- ') : '\nTODO OK');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
