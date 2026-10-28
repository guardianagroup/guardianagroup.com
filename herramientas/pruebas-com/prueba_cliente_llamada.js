// «Modo cliente» de la videollamada (dueño, 12:06): ir adelante y atrás por todos los estados y comprobar que nada salta,
// que tu imagen pequeña no se mueve, que la tarjeta no la tapa en el ordenador, que los botones quedan centrados y que
// el chat de detrás no recibe el foco (sin cursor de escribir). Capturas de cada estado en ordenador y teléfono.
const { chromium } = require('playwright');
const S = '/tmp/pruebas-com/prueba-com/cliente-';
const URL = 'http://127.0.0.1:8802/orbita/comunicaciones/';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const res = []; const ok = (n, c, x) => res.push((c ? 'OK   ' : 'FALLA') + ' ' + n + (x ? ' · ' + x : ''));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  for (const [w, h] of [[1280, 800], [390, 844]]) {
    const mk = async (n) => { const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500, permissions: ['microphone', 'camera'], locale: 'es-ES' }); await c.addInitScript(() => { try { localStorage.setItem('guardiana-acceso', 'dueno'); } catch (e) {} }); const p = await c.newPage(); p.errores = []; p.on('pageerror', (e) => p.errores.push(n + ': ' + e.message)); await p.goto(URL); await p.waitForTimeout(1500); return p; };
    const A = await mk('A'), B = await mk('B');
    const vis = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.offsetParent !== null); }, s);
    const movilA = !(await vis(A, '#nueva'));
    if (movilA) { await A.click('#nueva-blindada'); await A.waitForTimeout(2500); } else { await A.click('#nueva'); await A.waitForTimeout(1500); }
    const codigo = movilA ? '' : (await A.textContent('#codigo')).replace(/\D/g, '');
    if (movilA) { const u = await A.inputValue('#enlace-b'); await B.goto(u); for (let k = 0; k < 30 && !(await vis(B, '#aceptar-si')); k++) await B.waitForTimeout(300); await B.click('#aceptar-si'); }
    else if (await vis(B, '#unir')) { await B.click('#unir'); await B.fill('#unir-codigo', codigo); await B.waitForTimeout(200); if (await vis(B, '#unir-ok')) await B.click('#unir-ok', { timeout: 3000 }).catch(() => {}); } else { void codigo; await A.click('#codigo-enlace'); const u = await A.evaluate(() => document.querySelector('#codigo-enlace').dataset.enlace); await B.goto(u); for (let k = 0; k < 30 && !(await vis(B, '#aceptar-si')); k++) await B.waitForTimeout(300); await B.click('#aceptar-si'); }
    for (let i = 0; i < 40 && !((await vis(A, '#conv')) && (await vis(B, '#conv'))); i++) await espera(500);
    await espera(2500);
    // A estaba escribiendo: el campo tiene el foco cuando llega la llamada
    if (w > 500) { await A.click('#texto'); await A.keyboard.type('hola'); }
    const mira = (p) => p.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e || e.offsetParent === null && getComputedStyle(e).position !== 'fixed') return null; const x = e.getBoundingClientRect(); return x.width ? [Math.round(x.left), Math.round(x.top), Math.round(x.width), Math.round(x.height)] : null; }; const caja = document.querySelector('#llamada'); return { local: r('#v-local'), tarjeta: getComputedStyle(document.querySelector('.ll-ajustes')).display !== 'none' ? r('.ll-ajustes') : null, botones: r('#ll-botones'), inert: document.querySelector('#app').hasAttribute('inert'), foco: (document.activeElement || {}).id || document.activeElement.tagName, mini: caja.classList.contains('mini'), vw: innerWidth }; });
    const toca = async (p, s) => { await p.mouse.move(w / 2, h / 2); await espera(100); await p.click(s); await espera(900); };
    await A.mouse.move(w / 2, h / 2); await A.click('#videollamar'); await espera(2500);
    const e0 = await mira(A); await A.screenshot({ path: S + w + '-1-llamando.png' });
    ok(w + ': al llamar, el chat de detrás queda bloqueado y sin foco', e0.inert && e0.foco !== 'texto', JSON.stringify({ inert: e0.inert, foco: e0.foco }));
    await B.mouse.move(w / 2, h / 2); await B.click('#ll-contestar'); await espera(6000);
    const e1 = await mira(A); await A.mouse.move(w / 2, h / 2 + 5); await espera(300); await A.screenshot({ path: S + w + '-2-hablando.png' });
    const centrado = (e) => e.botones && Math.abs(e.botones[0] - (e.vw - e.botones[0] - e.botones[2])) <= 2;
    ok(w + ': botones centrados', centrado(e1), JSON.stringify(e1.botones));
    await toca(A, '#ll-ajustes-b');
    const e2 = await mira(A); await A.screenshot({ path: S + w + '-3-ajustes.png' });
    ok(w + ': «Voz e imagen» abre la tarjeta y tu imagen NO se mueve', !!e2.tarjeta && JSON.stringify(e2.local) === JSON.stringify(e1.local), JSON.stringify({ antes: e1.local, ahora: e2.local }));
    if (w > 760) { const t = e2.tarjeta, l = e2.local; const choca = l && t && !(t[0] + t[2] <= l[0] || l[0] + l[2] <= t[0] || t[1] + t[3] <= l[1] || l[1] + l[3] <= t[1]); const partida = l && l[2] >= e2.vw / 2 - 4; const centrada = partida ? Math.abs((t[0] + t[2] / 2) - (l[0] >= e2.vw / 2 - 4 ? e2.vw / 4 : 3 * e2.vw / 4)) <= 4 : Math.abs(t[0] - (e2.vw - t[0] - t[2])) <= 2; ok(w + ': en el ordenador la tarjeta no tapa tu imagen (centrada, o en la otra mitad si está partida)', !choca && centrada, JSON.stringify({ tarjeta: t, local: l })); }
    await toca(A, '#ll-ajustes-b');
    const e3 = await mira(A);
    ok(w + ': al cerrarla, todo vuelve a su sitio', !e3.tarjeta && JSON.stringify(e3.local) === JSON.stringify(e1.local) && centrado(e3));
    await toca(A, '#ll-mini'); const e4 = await mira(A); await A.screenshot({ path: S + w + '-4-pequena.png' });
    ok(w + ': «Ver el chat»: llamada en pequeño y el chat se puede usar', e4.mini && !e4.inert, JSON.stringify({ mini: e4.mini, inert: e4.inert, foco: e4.foco }));
    await toca(A, '#ll-volver'); const e5 = await mira(A); await A.screenshot({ path: S + w + '-5-ampliada.png' });
    ok(w + ': «Ampliar»: vuelve igual que antes', !e5.mini && e5.inert && JSON.stringify(e5.local) === JSON.stringify(e1.local) && centrado(e5) && e5.foco !== 'texto', JSON.stringify({ local: e5.local, foco: e5.foco }));
    await toca(A, '#ll-colgar'); await espera(1500); const e6 = await mira(A);
    ok(w + ': al colgar, el chat vuelve a estar disponible', !e6.inert);
    for (const p of [A, B]) for (const e of p.errores) res.push('ERROR ' + e);
    await A.context().close(); await B.context().close();
  }
  console.log(res.join('\n')); await b.close();
})().catch((e) => { console.log(res.join('\n')); console.error('FALLO DEL GUION', e.message.slice(0, 500)); process.exit(1); });
