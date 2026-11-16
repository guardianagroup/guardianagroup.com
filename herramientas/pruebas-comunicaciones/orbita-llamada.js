// «Tu llamada en Órbita» (15 nov 2026; dueño, 22:57 y 23:23: «SÍ»). Una videollamada Ultra entre dos PC (A y B); en A,
// «Ver en Órbita» del Monitor de seguridad abre Órbita en otra pestaña con #llamada: sin la portada, el planeta solo con la
// llamada y el panel con el monitor en directo, que le llega de la pestaña de la llamada (BroadcastChannel) una vez por
// segundo. Al colgar, «La llamada ha terminado.». En el teléfono el botón no sale (allí no hay Órbita).
// Uso: node orbita-llamada.js [carpeta de capturas]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'orbita-llamada');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, nombre, vp) {
  const ctx = await browser.newContext({ viewport: vp || { width: 1440, height: 900 }, userAgent: PC, locale: 'es-CO', timezoneId: 'America/Bogota', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); localStorage.setItem('guardiana-acceso', 'dueno'); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(250); } return false; };
const enSesion = (P) => P.evaluate(() => [...((window.GuardianaCom && GuardianaCom.convs) || new Map()).values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada));
const panel = (O) => O.evaluate(() => {
  const h = document.querySelector('#llorb'); if (!h) return null;
  const ve = (e) => !!(e && !e.hidden && e.getClientRects().length);
  return {
    titulo: (h.querySelector('.t') || {}).textContent, nivel: (h.querySelector('.llorb-nivel') || {}).textContent, hace: (h.querySelector('.llorb-hace') || {}).textContent,
    ruta: [...h.querySelectorAll('.llorb-ruta li')].map((l) => l.querySelector('b').textContent + ' · ' + l.querySelector('span').textContent),
    cifras: ve(h.querySelector('.llorb-cifras')) ? [...h.querySelectorAll('.llorb-cifras div')].map((d) => d.textContent) : [],
    filas: [...h.querySelectorAll('.llorb-l li')].map((l) => l.className + ' ' + l.querySelector('b').textContent),
    boton: (h.querySelector('.llorb-volver') || {}).textContent, portada: document.documentElement.classList.contains('con-portada'),
    soloTu: document.body.classList.contains('solo-tu'), clase: document.body.classList.contains('en-llamada-orbita'),
    // segunda voz: «Inicio» y «Ver mi PC en directo» no se ven en la vista de la llamada; sin opener hacia la llamada
    inicio: ve(document.querySelector('#volver')), tupc: ve(document.querySelector('#tupc-btn')), opener: window.opener !== null,
    directo: ve(h.querySelector('.llorb-directo')), vivoSr: (h.querySelector('.llorb-sr[role="status"]') || {}).textContent || '',
  };
});
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const B = await equipo(browser, 'B'), A = await equipo(browser, 'A');
  await B.goto(URL0 + '?plan=plus'); await espera(1500);
  await B.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
  const url = String(await B.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si');
  comprueba(await hasta(async () => (await enSesion(A)) && (await enSesion(B)), 20000), '0. conversación Ultra entre A y B');
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(() => B.evaluate(() => { const b = document.querySelector('#ll-contestar'); return !!(b && b.getClientRects().length); }), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada Ultra');
  // el monitor abierto en el PC, con el recorrido: el botón está
  await hasta(() => A.evaluate(() => { const r = document.querySelector('#ll-mon-ruta'); return !!(r && r.dataset.ruta); }), 12000);
  const boton = await A.evaluate(() => { const b = document.querySelector('#ll-mon-orbita'); return !!(b && b.getClientRects().length) && b.textContent.trim(); });
  comprueba(boton === 'Ver en Órbita', '1. «Ver en Órbita» en el monitor de la llamada', boton);
  // 2. Órbita, en otra pestaña
  const nueva = A.context().waitForEvent('page');
  await A.evaluate(() => document.querySelector('#ll-mon-orbita').click());
  const O = await nueva; O.on('pageerror', (e) => { console.log('[Órbita] pageerror', String(e).slice(0, 300)); fallos.push('pageerror Órbita'); });
  await O.waitForLoadState('load');
  comprueba(/\/orbita\/#llamada$/.test(O.url()), '2. se abre Órbita con #llamada', O.url());
  let p = null; const llega = await hasta(async () => { p = await panel(O); return p && p.cifras.length === 2 && /bit\/s/.test(p.cifras[0]) && /bit\/s/.test(p.cifras[1]) && /^Todo en orden$/.test(p.nivel); }, 25000);
  comprueba(llega && p.titulo === 'Tu llamada en Órbita' && !p.portada && p.soloTu && p.clase, '2. sin la portada, el planeta solo con la llamada y el panel «Tu llamada en Órbita»', p);
  comprueba(p && /comprobado hace \d s$/.test(p.hace), '2. «Todo en orden · comprobado hace N s», como el monitor', p && p.hace);
  comprueba(p && p.ruta.length === 2 && /^Tu dispositivo · Colombia, aproximado$/.test(p.ruta[0]) && p.ruta[1] === 'La otra persona · Su ubicación no se muestra', '2. la ruta (aquí, directa): tu dispositivo y la otra persona, sin su ubicación', p && p.ruta);
  // segunda voz, C1: sin «ida y vuelta» (recorre el camino hasta la otra persona y deja intuir la distancia)
  comprueba(p && p.cifras.length === 2 && /kbit\/s|Mbit\/s/.test(p.cifras[0]) && /Enviando$/.test(p.cifras[0]) && /Recibiendo$/.test(p.cifras[1]), '2. envío y recepción, medidos; sin «ida y vuelta»', p && p.cifras);
  comprueba(p && !p.inicio && !p.tupc && !p.opener, '2. sin «Inicio» ni «Ver mi PC en directo» en la vista, y sin acceso a la ventana de la llamada (noopener)', p && { inicio: p.inicio, tupc: p.tupc, opener: p.opener });
  comprueba(p && p.vivoSr === 'Todo en orden', '2. el lector de pantalla oye el estado, no el contador de segundos', p && p.vivoSr);
  // segunda voz, C4: un mensaje con «constructor» como servidor no se toma por un servidor (antes, la cámara en NaN)
  const raro = await O.evaluate(async () => {
    const c = new BroadcastChannel('guardiana-llamada');
    c.postMessage({ v: 1, tipo: 'estado', nivel: 'toString', estado: 'x', filas: [], ruta: 'mio', servidor: 'constructor', ciudad: 'X', guardiana: true, envio: '1 kbit/s', recep: '1 kbit/s' });
    await new Promise((r) => setTimeout(r, 400));
    const ruta = [...document.querySelectorAll('#llorb .llorb-ruta li')].map((l) => l.className);
    const nivel = document.querySelector('#llorb .llorb-nivel').className;
    c.close(); return { ruta, nivel };
  });
  comprueba(raro && !raro.ruta.includes('serv') && !/toString/.test(raro.nivel), '2. lo que no es un servidor ni un nivel de la lista no se dibuja', raro);
  comprueba(p && p.filas.length >= 7 && p.filas.some((f) => /Capa postcuántica$/.test(f)) && p.filas.some((f) => /Huella de la conexión$/.test(f)), '2. las comprobaciones del monitor, las mismas', p && p.filas);
  await espera(2500);
  await O.screenshot({ path: path.join(OUT, '1-orbita-llamada.png') });
  // sigue en directo: el «hace» se renueva
  const h1 = (await panel(O)).hace; await espera(2200); const h2 = (await panel(O)).hace;
  comprueba(/hace [0-4] s$/.test(h2), '2. en directo: el panel se renueva (la pestaña de la llamada, detrás, sondea cada 2 s)', [h1, h2]);
  // 3. al colgar
  await A.bringToFront();
  await A.evaluate(() => document.querySelector('#ll-colgar').click());
  const fin = await hasta(async () => { const x = await panel(O); return x && x.nivel === 'La llamada ha terminado.' && x.boton === 'Cerrar'; }, 6000);
  const pf = await panel(O);
  comprueba(fin && pf.cifras.length === 0 && !pf.directo, '3. al colgar, «La llamada ha terminado.» y «Cerrar», sin cifras ni «En directo»', pf);
  await O.screenshot({ path: path.join(OUT, '2-orbita-terminada.png') });
  // 4. en el teléfono (tamaño), el botón no sale
  await O.close();
  const T = await equipo(browser, 'T', { width: 390, height: 844 });
  await T.goto(URL0 + '?plan=plus'); await espera(1200);
  const enTel = await T.evaluate(() => { const b = document.querySelector('#ll-mon-orbita'); return b ? getComputedStyle(b).display : 'sin botón'; });
  comprueba(enTel === 'none', '4. a tamaño de teléfono, «Ver en Órbita» no se ve', enTel);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.log(e); process.exit(1); });
