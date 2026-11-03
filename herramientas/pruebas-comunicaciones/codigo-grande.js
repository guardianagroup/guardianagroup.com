// El código de la llave en las dos versiones de la llamada (dueño, 2 Nov 2026, 17:01: «Esto de los números… quiero que lo dejes para
// la versión ultra. En la versión… blindada… no quiero que esté ese servicio… Solo hay dos modelos, el blindado y el ultra»; ronda 92).
// Antes (14:43): «Quiero que se vea en grande y en color rojo en el medio de la pantalla… dile este número… en voz alta para ver si
// coincide. En caso de que no coincida, cortar la llamada… Y que también se pueda hacer desde el móvil»: eso queda para Ultra.
// En la prueba la llave cambia cada 8 s. Desde el 3 Nov 2026 (Ultra 1) Ultra se crea desde el programa GUARDIANA para Windows con Plus
// (en local, «?plan=plus» hace de programa) y en su llamada salen las 4 palabras de verificación en vez de la tarjeta roja del código:
// el código de la llave queda en «Seguridad de esta llamada», y una llamada Ultra no se pasa al teléfono.
//   1. Blindada (la de hoy), PC ↔ PC: con la capa postcuántica y su código, en la pantalla no sale ni la tarjeta roja ni la píldora,
//      y arriba no dice «Los números coinciden.»; tampoco hay «Voz grave», «Mosaico» ni «Voz e imagen». Tocando «Encriptada de extremo
//      a extremo», «Seguridad de esta llamada» enseña el mismo código en las dos pantallas con «Coinciden» / «No coinciden». «Coinciden»
//      dice arriba «Los números coinciden.» y lo marca; al cambiar la llave el panel enseña el nuevo, el mismo en los dos, y la tarjeta
//      sigue sin salir. «No coinciden» cuelga a los dos y lo explica.
//   2. Ultra, PC ↔ PC: en las dos pantallas, en el centro, las mismas 4 palabras («Palabras de verificación»); la tarjeta roja del
//      código no sale. «Sí, coinciden» las pliega con ✓. En «Seguridad de esta llamada», el código de la llave, el mismo en los dos;
//      al cambiar la llave, otro, y las palabras no cambian (salen del acuerdo de la llamada). «No coinciden» cuelga a los dos y la
//      conversación Ultra se borra en los dos equipos.
//   3. Pasada al teléfono. Blindada: ni el teléfono ni el PC de la otra persona enseñan la tarjeta; en el teléfono no hay cápsula
//      arriba, así que el título abre «Seguridad de esta llamada», debajo de él, con el mismo código que el PC. Ultra: «Pasar al
//      teléfono» no se ofrece (la llamada perdería el mosaico, la voz cambiada y el ritmo constante).
//   4. Un lado con otra llave (como un navegador que no cuadra): a los pocos segundos, los dos vuelven al encriptado de siempre, se ven y
//      se oyen, el título no dice «postcuántica» y no sale ningún código; la pantalla y el panel dicen que la capa no pudo mantenerse.
//   5. Un lado sin la capa (navegador sin la función; dueño, 18:31: un teléfono la admite y el otro no), llamando cada uno una vez: ese
//      lado dice «Este navegador no admite la capa postcuántica…» y el otro, «El teléfono o navegador de la otra persona no admite…», en
//      la pantalla y en el panel; en el panel de los dos, el mismo número de seguridad para comparar.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'codigo-grande');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const AQUI = 'Este navegador no admite la capa postcuántica: la llamada va encriptada de extremo a extremo.';
const SUYO = 'El teléfono o navegador de la otra persona no admite la capa postcuántica; si lo actualiza, la tendréis.';
const CAIDA = 'La capa postcuántica no pudo mantenerse; la llamada sigue encriptada de extremo a extremo.';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
// x: { roto, sinCapa }
async function equipo(browser, pc, nombre, x) {
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 852 }, deviceScaleFactor: pc ? 1 : 2, isMobile: !pc, hasTouch: !pc, userAgent: pc ? PC : IPHONE, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((x) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); sessionStorage.setItem('gcom-rota-ms', '8000'); if (x.roto) sessionStorage.setItem('gcom-pq-roto', '1'); } catch (_) {}
    if (x.sinCapa) { try { delete window.RTCRtpScriptTransform; window.RTCRtpScriptTransform = undefined; } catch (_) {} }
    window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); };
    window.__copiados = []; try { navigator.clipboard.writeText = (y) => { window.__copiados.push(String(y)); return Promise.resolve(); }; } catch (_) {}
  }, x || {});
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
  return { tarjeta: ve(c), titulo: c ? c.querySelector('#ll-cod-t').textContent : '', num: c ? c.querySelector('#ll-cod-num').textContent.replace(/\D/g, '') : '', texto: c ? c.querySelector('#ll-cod-texto').textContent : '', color: c ? getComputedStyle(c.querySelector('#ll-cod-num')).color : '', pildora: ve(ch) ? ch.textContent : '', arriba: ve(arriba), codigo: GuardianaCom.llamada.codigo || '', paso: (document.querySelector('#ll-paso') || {}).textContent || '' };
});
// «Seguridad de esta llamada»: sus filas y el código para comparar
const panel = (P) => P.evaluate(() => {
  const s = document.querySelector('#ll-seg'), b = document.querySelector('#ll-seg-cod');
  const ve = (e) => !!(e && !e.hidden && e.getClientRects().length && !e.closest('[hidden]'));
  return { abierto: ve(s), filas: s ? [...s.querySelectorAll('#ll-seg-l li')].map((l) => l.textContent) : [], caja: ve(b), titulo: b ? b.querySelector('#ll-seg-cod-t').textContent : '', num: b ? b.querySelector('#ll-seg-cod-num').textContent.replace(/\D/g, '') : '', texto: b ? b.querySelector('#ll-seg-cod-texto').textContent : '', botones: ve(document.querySelector('#ll-seg-cod-botones')), bien: !!(b && b.classList.contains('bien')) };
});
// (en la videollamada la barra de arriba se esconde a los 3 s: primero se despierta, como al mover el ratón)
async function abrePanel(P) {
  await P.evaluate(() => document.querySelector('#llamada').dispatchEvent(new PointerEvent('pointermove'))); await espera(150);
  if (!(await panel(P)).abierto) await P.click('.gc-llamada-cifrado'); await espera(400);
}
const sinEfectos = (P) => P.evaluate(() => ['#ll-grave-caja', '#ll-mosaico-caja', '#ll-ajustes-caja', '#ll-voz-pill', '#ll-imagenes'].filter((s) => { const e = document.querySelector(s); return e && !e.hidden && e.getClientRects().length && !e.closest('[hidden]'); }));
// la línea de arriba dice «s» en algún momento (sale 8 s)
const diceArriba = (P, s, ms) => hasta(async () => (await P.evaluate(() => (document.querySelector('#ll-paso') || {}).textContent || '')) === s, ms);
// B crea la invitación y A la acepta; A llama a B (videollamada) y B contesta
async function pcpc(browser, xA, xB) {
  const B = await equipo(browser, true, 'B', xB), A = await equipo(browser, true, 'A', xA);
  await B.goto(URL0); await espera(1500);
  await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
  const url = String(await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
  await videollama(A, B);
  return { A, B };
}
// Ultra: B la crea (con «?plan=plus», el programa con Plus simulado) y A la acepta; A llama a B (videollamada) y B contesta
const enSesion = (P) => P.evaluate(() => { const c = window.gcomPrueba && window.gcomPrueba.conv(); return !!(c && c.modo === 'blindada' && c.sesion && c.sesion.confirmada); });
async function pcpcUltra(browser) {
  const B = await equipo(browser, true, 'B'), A = await equipo(browser, true, 'A');
  await B.goto(URL0 + '?plan=plus'); await espera(1500);
  await B.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
  const url = String(await B.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si');
  await hasta(async () => (await enSesion(A)) && (await enSesion(B)), 15000);
  await videollama(A, B);
  return { A, B };
}
// las 4 palabras de la llamada (en el centro) o, plegadas, la píldora
const palabras = (P) => P.evaluate(() => { const ve = (e) => !!(e && !e.hidden && e.getClientRects().length && !e.closest('[hidden]')); const s = document.querySelector('#ll-sas'), m = document.querySelector('#ll-sas-mini'); return { caja: ve(s), t: (document.querySelector('#ll-sas-t') || {}).textContent || '', num: (document.querySelector('#ll-sas-num') || {}).textContent || '', mini: ve(m) ? m.textContent : '' }; });
async function videollama(X, Y) {
  await X.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(() => visible(Y, '#ll-contestar'), 15000)) await Y.click('#ll-contestar');
}
const hablan = (A, B, ms) => hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', ms || 20000);
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  // 1. Blindada, PC ↔ PC
  {
    const { A, B } = await pcpc(browser);
    comprueba(await hablan(A, B), '1. Blindada: A y B en videollamada');
    const hay = await hasta(async () => { const a = await vista(A), b = await vista(B); return /^\d{6}$/.test(a.codigo) && a.codigo === b.codigo; }, 15000);
    await espera(2500); // más que lo que espera la tarjeta (1,5 s) antes de salir
    const a = await vista(A), b = await vista(B);
    comprueba(hay && !a.tarjeta && !b.tarjeta && !a.pildora && !b.pildora && !a.arriba && !b.arriba, '1. con la capa y su código, en la pantalla no sale ni la tarjeta roja ni la píldora', { A: [a.codigo, a.tarjeta, a.pildora], B: [b.codigo, b.tarjeta, b.pildora] });
    comprueba(!/números coinciden/.test(a.paso + b.paso), '1. arriba no dice «Los números coinciden.»', { A: a.paso, B: b.paso });
    const ef = await sinEfectos(A);
    comprueba(!ef.length, '1. sin «Voz grave», «Mosaico» ni «Voz e imagen» (eso, en Ultra)', ef);
    await A.screenshot({ path: path.join(OUT, '1-a-sin-tarjeta.png') });
    // (justo después de un cambio de llave, para tener unos segundos por delante con el mismo código; tampoco entonces sale la tarjeta)
    { const c = (await vista(A)).codigo; await hasta(async () => { const x = (await vista(A)).codigo; return !!x && x !== c; }, 10000); await espera(2000); }
    { const x = await vista(A), y = await vista(B); comprueba(!x.tarjeta && !y.tarjeta && !x.pildora && !y.pildora, '1. al cambiar la llave, tampoco sale la tarjeta'); }
    await abrePanel(A); await abrePanel(B);
    let pa, pb, c0;
    await hasta(async () => { pa = await panel(A); pb = await panel(B); c0 = (await vista(A)).codigo; return pa.caja && pb.caja && pa.num === c0 && pb.num === c0 && pa.botones && pb.botones; }, 4000);
    comprueba(pa.abierto && pb.abierto && pa.caja && pb.caja && pa.num === c0 && pb.num === c0 && pa.botones && pb.botones, '1. en «Seguridad de esta llamada», el mismo código en los dos, con «Coinciden» y «No coinciden»', { A: [pa.num, pa.botones], B: [pb.num, pb.botones], c0 });
    comprueba(pa.titulo === 'Código de seguridad' && /^Léelo en voz alta y comprueba con la otra persona que los números coinciden\./.test(pa.texto) && pa.filas.some((x) => /^La clave de la capa postcuántica cambia cada/.test(x)) && pa.filas.some((x) => /^Capa postcuántica activa/.test(x)), '1. el panel lo explica: la capa va, la clave cambia y cómo comparar', pa);
    comprueba(!(await vista(A)).tarjeta && !(await vista(B)).tarjeta, '1. con el panel abierto, la tarjeta tampoco sale');
    await A.screenshot({ path: path.join(OUT, '1-a-panel.png') });
    await A.click('#ll-seg-si'); await espera(400);
    const pa2 = await panel(A), a2 = await vista(A);
    comprueba(pa2.bien && !pa2.botones && /^Los números coinciden\./.test(pa2.texto) && a2.paso === 'Los números coinciden.' && !a2.tarjeta && !a2.pildora, '1. «Coinciden» en el panel: arriba «Los números coinciden.» y el panel lo marca, sin tarjeta ni píldora', { panel: pa2, paso: a2.paso });
    await A.screenshot({ path: path.join(OUT, '1-a-panel-coinciden.png') });
    // la llave cambia: el panel enseña el nuevo, el mismo en los dos; en la pantalla, nada
    const ok = await hasta(async () => { const x = await panel(A), y = await panel(B); return x.caja && y.caja && /^\d{6}$/.test(x.num) && x.num !== c0 && x.num === y.num && x.num === (await vista(A)).codigo; }, 16000);
    const pa3 = await panel(A), pb3 = await panel(B), a3 = await vista(A), b3 = await vista(B);
    comprueba(ok && pa3.titulo === 'El código ha cambiado' && pa3.botones && !a3.tarjeta && !b3.tarjeta && !a3.pildora && !b3.pildora, '1. al cambiar la llave: en el panel, «El código ha cambiado» y el nuevo, el mismo en los dos; en la pantalla, nada', { A: [pa3.titulo, pa3.num], B: [pb3.titulo, pb3.num], antes: c0 });
    await B.click('#ll-seg-no');
    const fin = await hasta(async () => (await estado(A)) !== 'hablando' && (await estado(B)) !== 'hablando', 8000);
    await espera(600);
    const av = await B.evaluate(() => { const e = document.querySelector('#aviso'); return e && !e.hidden ? e.textContent : ''; });
    comprueba(fin && /no coincid/.test(av), '1. «No coinciden» en el panel: se cuelga a los dos y lo explica', { av });
    await A.context().close(); await B.context().close();
  }
  // 2. Ultra, PC ↔ PC
  {
    const { A, B } = await pcpcUltra(browser);
    comprueba(await hablan(A, B), '2. Ultra: A y B en videollamada');
    let pa = {}, pb = {}; await hasta(async () => { pa = await palabras(A); pb = await palabras(B); return pa.caja && pb.caja && pa.num.split(' · ').length === 4 && pa.num === pb.num; }, 15000);
    comprueba(pa.caja && pb.caja && pa.t === 'Palabras de verificación' && pa.num.split(' · ').length === 4 && pa.num === pb.num, '2. en el centro, las mismas 4 palabras en las dos pantallas', { A: pa.num, B: pb.num });
    await espera(2500); // más que lo que esperaba la tarjeta (1,5 s) antes de salir
    const a = await vista(A), b = await vista(B);
    comprueba(/^\d{6}$/.test(a.codigo) && a.codigo === b.codigo && !a.tarjeta && !b.tarjeta && !a.pildora && !b.pildora && !a.arriba && !b.arriba, '2. con la capa y su código, la tarjeta roja del código no sale', { A: [a.codigo, a.tarjeta, a.pildora], B: [b.codigo, b.tarjeta, b.pildora] });
    await A.screenshot({ path: path.join(OUT, '2-a-palabras.png') });
    await A.click('#ll-sas-si'); await espera(500);
    const a2 = await palabras(A), b2 = await palabras(B);
    comprueba(!a2.caja && /^✓/.test(a2.mini) && b2.caja, '2. «Sí, coinciden» en A: las pliega con ✓ (en B siguen)', { A: a2.mini, B: b2.caja });
    await A.screenshot({ path: path.join(OUT, '2-a-coinciden.png') });
    // el código de la llave, en «Seguridad de esta llamada»: el mismo en los dos; al cambiar la llave, otro, y las palabras siguen
    await abrePanel(A); await abrePanel(B);
    let qa = {}, qb = {}, c0 = ''; await hasta(async () => { qa = await panel(A); qb = await panel(B); c0 = (await vista(A)).codigo; return qa.caja && qb.caja && qa.num === c0 && qb.num === c0; }, 6000);
    comprueba(qa.caja && qb.caja && /^\d{6}$/.test(c0) && qa.num === c0 && qb.num === c0 && qa.filas.some((x) => /^La clave de la capa postcuántica cambia cada minuto/.test(x)), '2. en «Seguridad de esta llamada», el código de la llave, el mismo en los dos, y que cambia cada minuto', { A: qa.num, B: qb.num, c0, filas: qa.filas });
    const ok = await hasta(async () => { const x = await panel(A), y = await panel(B); return /^\d{6}$/.test(x.num) && x.num !== c0 && x.num === y.num; }, 16000);
    const pb3 = await palabras(B);
    comprueba(ok && pb3.num === pb.num, '2. al cambiar la llave: otro código en el panel, el mismo en los dos; las palabras no cambian', { panel: (await panel(A)).num, antes: c0, palabras: pb3.num });
    await B.keyboard.press('Escape'); await espera(300);
    await B.click('#ll-sas-no');
    const fin = await hasta(async () => (await estado(A)) !== 'hablando' && (await estado(B)) !== 'hablando', 8000);
    const borrada = await hasta(async () => (await A.evaluate(() => window.gcomPrueba.cuantas())) === 0 && (await B.evaluate(() => window.gcomPrueba.cuantas())) === 0, 10000);
    comprueba(fin && borrada, '2. «No coinciden»: se cuelga a los dos y la conversación Ultra se borra en los dos equipos', { fin, borrada });
    await B.screenshot({ path: path.join(OUT, '2-b-no-coinciden.png') });
    await A.context().close(); await B.context().close();
  }
  // 3. pasada al teléfono: en la Blindada, sin tarjeta y con el código en el panel, que en el teléfono abre el título (allí no hay
  //    cápsula); en Ultra no se ofrece
  {
    const { A, B } = await pcpcUltra(browser);
    comprueba(await hablan(A, B), '3. Ultra: A y B en videollamada');
    await espera(2500);
    await A.evaluate(() => document.querySelector('#llamada').dispatchEvent(new PointerEvent('pointermove'))); await espera(200);
    comprueba(!(await visible(A, '#ll-llevar')) && !(await visible(B, '#ll-llevar')), '3. Ultra: «Pasar al teléfono» no se ofrece en ninguno de los dos');
    await A.context().close(); await B.context().close();
  }
  {
    const n = '3. Blindada', x = {};
    const { A, B } = await pcpc(browser, x, x);
    comprueba(await hablan(A, B), n + ': A y B en videollamada');
    await espera(2500);
    const T = await equipo(browser, false, 'T', x);
    await A.evaluate(() => document.querySelector('#ll-llevar').click()); await espera(2500);
    const url = await A.evaluate(() => (window.GuardianaCom && GuardianaCom.llevarUrl) || (document.querySelector('#llevar-qr') && document.querySelector('#llevar-qr').dataset.url) || '');
    const dir = String(url || '').replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    comprueba(/#llevar=/.test(dir), n + ': sale el código QR', dir.slice(0, 60));
    await T.goto(dir);
    comprueba(await hasta(async () => (await estado(T)) === 'hablando' && (await estado(B)) === 'hablando' && (await estado(A)) !== 'hablando', 30000), n + ': el teléfono habla con B');
    const hay = await hasta(async () => { const x = await vista(T), y = await vista(B); return /^\d{6}$/.test(x.codigo) && x.codigo === y.codigo; }, 20000);
    await espera(2500);
    const t0 = await vista(T), b0 = await vista(B);
    comprueba(hay && !t0.tarjeta && !t0.pildora && !b0.tarjeta && !b0.pildora, n + ': con código, pero sin tarjeta ni píldora en el teléfono ni en el PC', { T: [t0.codigo, t0.tarjeta], B: [b0.codigo, b0.tarjeta] });
    const capsula = await visible(T, '.gc-llamada-cifrado');
    await T.evaluate(() => document.querySelector('#llamada').dispatchEvent(new PointerEvent('pointermove'))); await espera(150);
    await T.tap('#ll-centro'); await espera(400);
    let pt = await panel(T);
    await hasta(async () => { pt = await panel(T); const c = (await vista(T)).codigo; return pt.caja && pt.num === c && c === (await vista(B)).codigo; }, 6000);
    comprueba(!capsula && pt.abierto && pt.caja && /^\d{6}$/.test(pt.num) && pt.num === (await vista(B)).codigo && pt.botones, n + ': en el teléfono (sin cápsula), el título abre «Seguridad de esta llamada» con el mismo código que el PC', { capsula, panel: [pt.abierto, pt.num], B: (await vista(B)).codigo });
    const sitio = await T.evaluate(() => [document.querySelector('#ll-centro').getBoundingClientRect().bottom, document.querySelector('#ll-seg').getBoundingClientRect().top]);
    comprueba(sitio[1] >= sitio[0], n + ': el panel sale debajo del título, sin taparlo', sitio);
    await T.screenshot({ path: path.join(OUT, '3-tel-blindada-panel.png') });
    await T.context().close(); await A.context().close(); await B.context().close();
  }
  // 4. un lado que no cuadra: vuelta al encriptado de siempre
  {
    const { A, B } = await pcpc(browser, { roto: true });
    comprueba(await hablan(A, B), '4. A (con otra llave) y B en videollamada');
    // la línea de arriba lo dice un momento, en los dos (se mira mientras se espera la vuelta)
    const linea = Promise.all([diceArriba(A, CAIDA, 30000), diceArriba(B, CAIDA, 30000)]);
    // la vuelta: los dos dejan de cifrar (el número de fragmentos cifrados deja de subir)
    const cifrados = async () => [(await A.evaluate(() => GuardianaCom.llamada.pqCuenta())).cifrados, (await B.evaluate(() => GuardianaCom.llamada.pqCuenta())).cifrados];
    let antes = await cifrados(), vuelta = false;
    for (let i = 0; i < 20 && !vuelta; i++) { await espera(1500); const ahora = await cifrados(); vuelta = ahora[0] > 0 && ahora[1] > 0 && ahora[0] === antes[0] && ahora[1] === antes[1]; antes = ahora; }
    await espera(2500);
    const fr = async (P) => P.evaluate(() => { const v = document.querySelector('#v-remoto'); return v && v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality().totalVideoFrames : -1; });
    const a0 = await fr(A), b0 = await fr(B); await espera(2500); const a1 = await fr(A), b1 = await fr(B);
    const titA = await A.evaluate(() => document.querySelector('#ll-nombre').textContent), vA = await vista(A), vB = await vista(B);
    comprueba(vuelta && a1 > a0 + 5 && b1 > b0 + 5, '4. a los pocos segundos vuelven al encriptado de siempre y se ven', { a: [a0, a1], b: [b0, b1] });
    comprueba(!/postcuántica/.test(titA) && !vA.tarjeta && !vB.tarjeta && !vA.pildora, '4. el título no dice «postcuántica» y no sale ningún código', { titA });
    const [la, lb] = await linea;
    comprueba(la && lb, '4. la pantalla dice, un momento, «La capa postcuántica no pudo mantenerse…» en los dos');
    await abrePanel(A);
    const pa = await panel(A);
    comprueba(pa.filas.includes(CAIDA), '4. y el panel también', pa.filas);
    await A.screenshot({ path: path.join(OUT, '4-a-vuelta.png') });
    await A.context().close(); await B.context().close();
  }
  // 5. un lado sin la capa: lo dice cada uno a su manera (A llama primero y luego B)
  {
    const { A, B } = await pcpc(browser, { sinCapa: true });
    for (const [n, X, Y] of [['A llama', A, B], ['B llama', B, A]]) {
      if (n === 'B llama') { await videollama(X, Y); }
      comprueba(await hablan(A, B), '5. ' + n + ': A (sin la capa) y B en videollamada');
      const [la, lb] = await Promise.all([diceArriba(A, AQUI, 15000), diceArriba(B, SUYO, 15000)]);
      comprueba(la && lb, '5. ' + n + ': en la pantalla, A «Este navegador no admite…» y B «El teléfono o navegador de la otra persona no admite…»', { A: (await vista(A)).paso, B: (await vista(B)).paso });
      await abrePanel(A); await abrePanel(B);
      let pa = await panel(A), pb = await panel(B);
      await hasta(async () => { pa = await panel(A); pb = await panel(B); return pa.caja && pb.caja && /^\d{4}$/.test(pa.num) && pa.num === pb.num; }, 8000);
      comprueba(pa.filas.includes(AQUI) && pb.filas.includes(SUYO), '5. ' + n + ': y en el panel', { A: pa.filas, B: pb.filas });
      comprueba(pa.caja && pb.caja && /^\d{4}$/.test(pa.num) && pa.num === pb.num && pa.titulo === 'Número de seguridad' && pa.botones, '5. ' + n + ': sin la capa, en el panel de los dos, el mismo número de seguridad para comparar', { A: [pa.titulo, pa.num], B: [pb.titulo, pb.num] });
      const vA = await vista(A), vB = await vista(B);
      comprueba(!vA.codigo && !vB.codigo && !vA.tarjeta && !vB.tarjeta, '5. ' + n + ': sin la capa no hay código de la llave');
      await B.screenshot({ path: path.join(OUT, '5-b-' + (n === 'A llama' ? 'contesta' : 'llama') + '.png') });
      await B.evaluate(() => document.querySelector('#ll-colgar').click());
      await hasta(async () => (await estado(A)) === 'libre' && (await estado(B)) === 'libre', 8000); await espera(1500);
    }
    await A.context().close(); await B.context().close();
  }
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
