// El código de la llave, en grande, en rojo y en el centro (dueño, 2 Nov 2026, 14:43: «Quiero que se vea en grande y en color rojo
// en el medio de la pantalla… dile este número… en voz alta para ver si coincide. En caso de que no coincida, cortar la llamada… Y que
// también se pueda hacer desde el móvil»), y la vuelta al cifrado de siempre si un lado no descifra (14:45–14:48, el iPhone).
// En la prueba la llave cambia cada 8 s.
//   1. PC ↔ PC: en las dos pantallas, en el centro, el mismo código de 6 cifras con «Léelo en voz alta y comprueba…» y
//      «Coinciden» / «No coinciden»; arriba ya no sale. «Coinciden» lo pliega en una píldora con ✓. Al cambiar la llave vuelve a salir, «El código
//      ha cambiado», el mismo en los dos. «No coinciden» cuelga a los dos y lo explica.
//   2. Pasada al teléfono: el teléfono y el PC de la otra persona enseñan el mismo código (sin número de seguridad: va atado a la
//      llave de la sala) y, al cambiar la llave, otra vez el mismo.
//   3. Un lado con otra llave (como un navegador que no cuadra): a los pocos segundos, los dos vuelven al cifrado de siempre, se
//      ven y se oyen, el título no dice «postcuántica» y no sale ningún código.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'codigo-grande');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, pc, nombre, extra) {
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 852 }, deviceScaleFactor: pc ? 1 : 2, isMobile: !pc, hasTouch: !pc, userAgent: pc ? PC : IPHONE, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((x) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); sessionStorage.setItem('gcom-rota-ms', '8000'); if (x.roto) sessionStorage.setItem('gcom-pq-roto', '1'); } catch (_) {}
    window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); };
    window.__copiados = []; try { navigator.clipboard.writeText = (y) => { window.__copiados.push(String(y)); return Promise.resolve(); }; } catch (_) {}
  }, extra || {});
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(250); } return false; };
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
// lo que se ve: la tarjeta (con su título, el número y el texto) o la píldora
const vista = (P) => P.evaluate(() => {
  const c = document.querySelector('#ll-cod'), ch = document.querySelector('#ll-cod-chip'), arriba = document.querySelector('#ll-codigo');
  const ve = (e) => !!(e && !e.hidden && e.getClientRects().length);
  return { tarjeta: ve(c), titulo: c ? c.querySelector('#ll-cod-t').textContent : '', num: c ? c.querySelector('#ll-cod-num').textContent.replace(/\D/g, '') : '', texto: c ? c.querySelector('#ll-cod-texto').textContent : '', color: c ? getComputedStyle(c.querySelector('#ll-cod-num')).color : '', pildora: ve(ch) ? ch.textContent : '', arriba: ve(arriba), codigo: GuardianaCom.llamada.codigo || '' };
});
async function pcpc(browser, extra) {
  const B = await equipo(browser, true, 'B'), A = await equipo(browser, true, 'A', extra);
  await B.goto(URL0); await espera(1500);
  await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
  const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  return { A, B };
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  // 1. PC ↔ PC
  {
    const { A, B } = await pcpc(browser);
    comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '1. A y B en videollamada');
    await hasta(async () => (await vista(A)).tarjeta && (await vista(B)).tarjeta, 15000);
    const a = await vista(A), b = await vista(B);
    comprueba(a.tarjeta && b.tarjeta && /^\d{6}$/.test(a.num) && a.num === b.num && a.num === a.codigo, '1. el mismo código, en grande en el centro, en las dos pantallas', { A: a.num, B: b.num });
    comprueba(/rgb\(255, 7\d, 6\d\)/.test(a.color), '1. en rojo', a.color);
    comprueba(/^Léelo en voz alta y comprueba con la otra persona que los números coinciden\./.test(a.texto) && /Si no coinciden, cuelga/.test(a.texto), '1. «Léelo en voz alta y comprueba con la otra persona…»', a.texto);
    comprueba(!a.arriba && !b.arriba, '1. arriba, en pequeño, ya no sale');
    await A.screenshot({ path: path.join(OUT, '1-a-codigo.png') });
    await A.click('#ll-cod-si'); await espera(400);
    const a2 = await vista(A), b2 = await vista(B);
    comprueba(!a2.tarjeta && /^✓ Código \d{3} \d{3}$/.test(a2.pildora) && b2.tarjeta, '1. «Coinciden» en A: la pliega en la píldora con ✓ (en B sigue)', { A: a2.pildora, B: b2.tarjeta });
    await A.screenshot({ path: path.join(OUT, '1-a-coincide.png') });
    await B.click('#ll-cod-si'); await espera(300);
    // cambia la llave: vuelve a salir, el mismo en los dos
    const ok = await hasta(async () => { const x = await vista(A), y = await vista(B); return x.tarjeta && y.tarjeta && x.num !== a.num && x.num === y.num; }, 16000);
    const a3 = await vista(A), b3 = await vista(B);
    comprueba(ok && a3.titulo === 'El código ha cambiado', '1. al cambiar la llave: «El código ha cambiado», otra vez en grande y el mismo en los dos', { A: [a3.titulo, a3.num], B: [b3.titulo, b3.num] });
    await B.screenshot({ path: path.join(OUT, '1-b-cambio.png') });
    // «No coincide»: cuelga a los dos y lo dice
    await B.click('#ll-cod-no');
    const fin = await hasta(async () => (await estado(A)) !== 'hablando' && (await estado(B)) !== 'hablando', 8000);
    const av = await B.evaluate(() => { const e = document.querySelector('#aviso'); return e && !e.hidden ? e.textContent : ''; });
    comprueba(fin && /los números no coincidían/.test(av), '1. «No coinciden»: se cuelga a los dos y lo explica', { av });
    await B.screenshot({ path: path.join(OUT, '1-b-no-coincide.png') });
    await A.context().close(); await B.context().close();
  }
  // 2. pasada al teléfono
  {
    const { A, B } = await pcpc(browser);
    comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '2. A y B en videollamada');
    await espera(2500);
    const T = await equipo(browser, false, 'T');
    await A.evaluate(() => document.querySelector('#ll-llevar').click()); await espera(2500);
    const url = await A.evaluate(() => (window.GuardianaCom && GuardianaCom.llevarUrl) || (document.querySelector('#llevar-qr') && document.querySelector('#llevar-qr').dataset.url) || '');
    const dir = String(url || '').replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    comprueba(/#llevar=/.test(dir), '2. sale el código QR', dir.slice(0, 60));
    await T.goto(dir);
    comprueba(await hasta(async () => (await estado(T)) === 'hablando' && (await estado(B)) === 'hablando' && (await estado(A)) !== 'hablando', 30000), '2. el teléfono habla con B');
    const ok = await hasta(async () => { const x = await vista(T), y = await vista(B); return /^\d{6}$/.test(x.codigo) && x.codigo === y.codigo && x.tarjeta && y.tarjeta && x.num === x.codigo && y.num === x.codigo; }, 20000);
    const t1 = await vista(T), b1 = await vista(B);
    comprueba(ok, '2. el teléfono y el PC enseñan el mismo código en grande', { T: [t1.tarjeta, t1.num], B: [b1.tarjeta, b1.num] });
    await T.screenshot({ path: path.join(OUT, '2-tel-codigo.png') });
    const ok2 = await hasta(async () => { const x = await vista(T), y = await vista(B); return x.codigo && x.codigo !== t1.codigo && x.codigo === y.codigo; }, 16000);
    comprueba(ok2, '2. al cambiar la llave, otra vez el mismo en los dos', { T: (await vista(T)).codigo, B: (await vista(B)).codigo, antes: t1.codigo });
    await T.context().close(); await A.context().close(); await B.context().close();
  }
  // 3. un lado que no cuadra: vuelta al cifrado de siempre
  {
    const { A, B } = await pcpc(browser, { roto: true });
    comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '3. A (con otra llave) y B en videollamada');
    // la vuelta: los dos dejan de cifrar (el número de fragmentos cifrados deja de subir)
    const cifrados = async () => [(await A.evaluate(() => GuardianaCom.llamada.pqCuenta())).cifrados, (await B.evaluate(() => GuardianaCom.llamada.pqCuenta())).cifrados];
    let antes = await cifrados(), vuelta = false;
    for (let i = 0; i < 20 && !vuelta; i++) { await espera(1500); const ahora = await cifrados(); vuelta = ahora[0] > 0 && ahora[1] > 0 && ahora[0] === antes[0] && ahora[1] === antes[1]; antes = ahora; }
    await espera(2500);
    const fr = async (P) => P.evaluate(() => { const v = document.querySelector('#v-remoto'); return v && v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality().totalVideoFrames : -1; });
    const a0 = await fr(A), b0 = await fr(B); await espera(2500); const a1 = await fr(A), b1 = await fr(B);
    const titA = await A.evaluate(() => document.querySelector('#ll-nombre').textContent), vA = await vista(A), vB = await vista(B);
    comprueba(vuelta && a1 > a0 + 5 && b1 > b0 + 5, '3. a los pocos segundos vuelven al cifrado de siempre y se ven', { a: [a0, a1], b: [b0, b1] });
    comprueba(!/postcuántica/.test(titA) && !vA.tarjeta && !vB.tarjeta && !vA.pildora, '3. el título no dice «postcuántica» y no sale ningún código', { titA });
    await A.screenshot({ path: path.join(OUT, '3-a-vuelta.png') });
  }
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
