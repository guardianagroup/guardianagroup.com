// Dos versiones (dueño, 30 Oct 2026: «la blindada, que será gratis, y la ultra… de pago por horas… ahí es donde entrará la opción de
// mosaico, cambiar voz, archivos de 1 TB»). Comprueba, en el iPhone (393 × 793) y en el PC (1280 × 800):
// - la hoja de invitar: «Blindada» (gratis) elegida de entrada y «Ultra» próximamente, que solo abre su hoja y nunca crea un chat;
// - la hoja de Ultra, «¿Cómo funciona?» con las dos versiones y el cuadro en dos columnas, sin «fuerte» y sin «4 GB»;
// - en la videollamada de la Blindada, el cambio de voz y el mosaico a la vista, cerrados con «ULTRA»: abren la hoja y la llamada
//   sigue con la voz natural y la imagen tal cual;
// - el tope por archivo de 2 GB.
// Uso: node ultra.js <carpeta de capturas>
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'ultra');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://127.0.0.1:8080';
const URL0 = BASE + '/orbita/comunicaciones/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, ua) {
  const pc = ua === PC;
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: !pc, hasTouch: !pc, userAgent: ua || UA, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  await ctx.addInitScript((esPC) => {
    window.__compartidos = []; window.__pistas = [];
    if (!esPC) { navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} }
    // qué pistas salen hacia la otra persona: con la voz natural y la imagen tal cual, el micrófono y la cámara, sin cambios
    const at = RTCPeerConnection.prototype.addTrack;
    RTCPeerConnection.prototype.addTrack = function (tr, ...r) { window.__pistas.push(tr.kind + ':' + tr.label); return at.call(this, tr, ...r); };
    const rt = RTCRtpSender.prototype.replaceTrack;
    RTCRtpSender.prototype.replaceTrack = function (tr) { window.__pistas.push('cambio ' + (tr ? tr.kind + ':' + tr.label : 'null')); return rt.call(this, tr); };
  }, pc);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
const abierta = (P, id) => P.evaluate((id) => document.querySelector('#' + id).classList.contains('gc-abierta'), id);
const foto = (P, n) => P.screenshot({ path: path.join(OUT, n + '.png') });
async function acepta(P, url) { await P.goto(url.replace('https://guardianagroup.com', BASE)); await espera(1500); if (await P.$('#aceptar-si:visible')) await P.click('#aceptar-si'); await espera(5000); }
async function videollamada(A, B) {
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  const sonando = await visible(A, '#ll-ultra');
  if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar');
  await espera(5000);
  return sonando;
}
// con imagen, los mandos se apagan solos al rato (reposo): se despiertan como lo haría la persona, con el ratón o un toque
// (con 3 s sin tocar nada se apagan: en el PC se mueve siempre el ratón justo antes de cada clic)
async function despierta(P, tactil) {
  if (!tactil) { await P.mouse.move(640, 300); await P.mouse.move(660, 330); await espera(250); return; }
  if (!(await P.evaluate(() => document.querySelector('#llamada').classList.contains('reposo')))) return;
  await P.touchscreen.tap(196, 200).catch(() => {}); await espera(450);
}
async function enLlamada(P, nombre, tactil) {
  await despierta(P, tactil);
  const ver = { fila: await visible(P, '#ll-ultra'), voz: await visible(P, '#ll-voz-ultra'), mosaico: await visible(P, '#ll-mosaico-ultra'), grave: await visible(P, '#ll-grave'), mosaicoViejo: await visible(P, '#ll-mosaico'), sello: await P.evaluate(() => [...document.querySelectorAll('#ll-ultra em')].map((e) => e.textContent).join(',')) };
  comprueba(ver.fila && ver.voz && ver.mosaico && ver.sello === 'ULTRA,ULTRA' && !ver.grave && !ver.mosaicoViejo, nombre + ': en la Blindada, «Cambio de voz» y «Mosaico» a la vista, cerrados con «ULTRA» (sin los de antes)', ver);
  const antes = await P.evaluate(() => window.__pistas.length);
  await despierta(P, tactil);
  await P.click('#ll-voz-ultra'); await espera(500);
  comprueba(await abierta(P, 'h-ultra') && await visible(P, '#ultra-llamada'), nombre + ': «Cambio de voz» abre la hoja de Ultra, que dice que la llamada sigue igual');
  await foto(P, nombre + '-hoja-ultra-en-llamada');
  await P.click('#ultra-ok'); await espera(300);
  await despierta(P, tactil);
  await P.click('#ll-mosaico-ultra'); await espera(500);
  comprueba(await abierta(P, 'h-ultra'), nombre + ': «Mosaico» también abre la hoja de Ultra');
  await P.click('#ultra-ok'); await espera(800);
  const tras = await P.evaluate(() => ({ estado: window.gcomPrueba.llamada(), cambios: window.__pistas.slice(0) }));
  comprueba(tras.estado === 'hablando' && tras.cambios.length === antes && !tras.cambios.some((x) => /destination|canvas/i.test(x)), nombre + ': la llamada sigue, con la voz natural y la imagen tal cual (ninguna pista cambiada)', tras);
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });

  // 1. iPhone: la hoja de invitar
  const A = await equipo(browser), B = await equipo(browser);
  await A.goto(URL0); await espera(1500);
  await A.click('#nueva-blindada'); await espera(600);
  const hoja = await A.evaluate(() => { const n = document.querySelector('#tipo-normal'), u = document.querySelector('#tipo-ultra'); return { n: n.textContent.trim(), nSi: n.getAttribute('aria-checked'), u: u && u.textContent.trim(), uSi: u && u.getAttribute('aria-checked'), uNo: u && u.getAttribute('aria-disabled'), viejo: !!document.querySelector('#tipo-blindado') }; });
  comprueba(hoja.n === 'BlindadaGratis' && hoja.nSi === 'true' && /^Ultra/.test(hoja.u) && hoja.uSi === 'false' && hoja.uNo === 'true' && !hoja.viejo, 'invitar: «Blindada · Gratis» elegida y «Ultra» próximamente, deshabilitada (sin el antiguo «Chat blindado»)', hoja);
  await foto(A, 'iphone-1-invitar');
  await A.click('#tipo-ultra', { force: true }); await espera(600); // aria-disabled: no se elige, pero un toque abre la hoja
  comprueba(await abierta(A, 'h-ultra') && await abierta(A, 'h-invitar') && await A.evaluate(() => document.querySelector('#tipo-normal').getAttribute('aria-checked') === 'true' && document.querySelector('#tipo-ultra').getAttribute('aria-checked') === 'false') && !(await visible(A, '#ultra-llamada')), 'invitar: «Ultra» abre su hoja encima y la elegida sigue siendo la Blindada');
  await foto(A, 'iphone-2-hoja-ultra');
  await A.click('#ultra-ok'); await espera(400);
  comprueba(!(await abierta(A, 'h-ultra')) && await abierta(A, 'h-invitar'), 'invitar: al cerrar la hoja de Ultra se sigue en la de invitar');
  await A.click('#invitar-otra'); await espera(1500);
  const inv = await A.evaluate(() => window.__compartidos[window.__compartidos.length - 1]);
  comprueba(inv && /#i=[A-Za-z0-9_-]{43}$/.test(inv.url), 'invitar: sale la invitación de siempre («#i=»), nunca una blindada ni Ultra', inv);

  // 2. el chat (Blindada) y la videollamada
  await acepta(B, inv.url);
  comprueba(await A.evaluate(() => !document.querySelector('#conv').classList.contains('blindada')), 'chat: la Blindada es el chat de siempre (sin el marco del antiguo blindado)');
  // tope por archivo: 2 GB (un archivo de 3 GB, de mentira, no sale)
  await A.evaluate(() => { const ev = new Event('drop', { bubbles: true, cancelable: true }); Object.defineProperty(ev, 'dataTransfer', { value: { files: [{ name: 'expediente.zip', size: 3 * 1024 * 1024 * 1024, type: 'application/zip' }] } }); document.querySelector('#conv').dispatchEvent(ev); });
  await espera(600);
  const tope = await A.evaluate(() => document.querySelector('#aviso').textContent);
  comprueba(/2\s?GB/.test(tope) && !/4\s?GB/.test(tope), 'archivos: el tope por archivo es de 2 GB', tope);
  await A.evaluate(() => { const a = document.querySelector('#aviso'); if (a) a.hidden = true; });
  const sonando = await videollamada(A, B);
  comprueba(!sonando, 'videollamada: mientras suena, sin la fila de Ultra');
  await A.touchscreen.tap(196, 200).catch(() => {}); await espera(400);
  await foto(A, 'iphone-3-videollamada');
  await enLlamada(A, 'iphone', true);
  await A.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500);

  // 3. iPhone: «¿Cómo funciona?» con las dos versiones
  await A.goto(URL0); await espera(1500);
  await A.evaluate(() => { for (const id of ['h-invitar', 'h-ultra']) document.querySelector('#' + id).classList.remove('gc-abierta'); });
  if (!(await visible(A, '#ver-como'))) { await A.evaluate(() => { const b = document.querySelector('#cvolver'); if (b && b.offsetParent) b.click(); }); await espera(600); }
  await A.evaluate(() => document.querySelector('#ver-como').click()); await espera(600);
  const como = await A.evaluate(() => { const t = document.querySelector('#como').textContent; const filas = [...document.querySelectorAll('#como .comp-fila')].map((f) => f.querySelectorAll('.comp-v').length); return { dos: /Dos versiones/.test(t), tres: /Tres versiones/.test(t), fuerte: /fuerte/i.test(t), g4: /4\s?GB/.test(t), g2: /2\s?GB/.test(t), tb: /1\s?TB/.test(t), filas, cab: [...document.querySelectorAll('#como .comp-cab span')].map((s) => s.textContent) }; });
  comprueba(como.dos && !como.tres && !como.fuerte && !como.g4 && como.g2 && como.tb && como.filas.length > 5 && como.filas.every((n) => n === 2) && como.cab.join('|') === '|Blindada|Ultra', '«¿Cómo funciona?»: dos versiones, cuadro de dos columnas (Blindada y Ultra), 2 GB y 1 TB, sin «fuerte» ni «4 GB»', como);
  await A.evaluate(() => { const h = [...document.querySelectorAll('#como h3')].find((x) => /Dos versiones/.test(x.textContent)); h.scrollIntoView({ block: 'start' }); });
  await espera(300); await foto(A, 'iphone-4-como-versiones');
  await A.evaluate(() => document.querySelector('#como .comp-2').scrollIntoView({ block: 'start' }));
  await espera(300); await foto(A, 'iphone-5-comparativa');
  // en toda la página, nada de «fuerte» a la vista
  comprueba(!(await A.evaluate(() => /\bfuerte\b/i.test(document.body.innerText + [...document.querySelectorAll('[aria-label],[title]')].map((e) => e.getAttribute('aria-label') + ' ' + (e.getAttribute('title') || '')).join(' ')))), 'ninguna «fuerte» en la página');
  // Ajustes: tu versión y la puerta a Ultra
  await A.evaluate(() => { const b = document.querySelector('#ajustes-btn') || document.querySelector('#tab-ajustes'); b.click(); }); await espera(500);
  comprueba(await visible(A, '#aj-ultra') && /Tu versión: Blindada/.test(await A.evaluate(() => document.querySelector('#aj-ultra').textContent)), 'Ajustes: «Tu versión: Blindada» con «ULTRA»');
  await foto(A, 'iphone-6-ajustes');
  await A.click('#aj-ultra'); await espera(500);
  comprueba(await abierta(A, 'h-ultra'), 'Ajustes: abre la hoja de Ultra');
  await A.click('#ultra-ok'); await espera(300);

  // 4. PC: el inicio, la hoja de Ultra, la de invitar, la comparativa y una videollamada
  const E = await equipo(browser, PC), F = await equipo(browser);
  await E.goto(URL0); await espera(1800);
  comprueba(/Ultra · próximamente/.test(await E.evaluate(() => document.querySelector('#nueva-blindada').innerText)), 'PC: en el inicio, «Ultra · próximamente» (ya no «Sesión blindada»)');
  await foto(E, 'pc-1-inicio');
  await E.click('#nueva-blindada'); await espera(600);
  comprueba(await abierta(E, 'h-ultra') && !(await abierta(E, 'h-invitar')), 'PC: el botón de Ultra abre su hoja y no crea nada');
  await foto(E, 'pc-2-hoja-ultra');
  await E.click('#ultra-ok'); await espera(300);
  // en el PC la invitación es «Crear invitación»; la hoja de invitar del teléfono, abierta a mano para ver cómo queda
  await E.evaluate(() => document.querySelector('#h-invitar').classList.add('gc-abierta')); await espera(400);
  await foto(E, 'pc-3-invitar');
  await E.evaluate(() => document.querySelector('#h-invitar').classList.remove('gc-abierta'));
  // en el ordenador, «¿Cómo funciona?» es el desplegable «Cómo funciona Comunicaciones»: lleva el mismo cuadro de dos columnas
  await E.click('#como-btn'); await espera(700);
  const pcComp = await E.evaluate(() => { const t = document.querySelector('#pro').textContent; return { visible: !!document.querySelector('#pro .comp-2').getClientRects().length, filas: [...document.querySelectorAll('#pro .comp-2 .comp-fila')].map((f) => f.querySelectorAll('.comp-v').length), viejo: /Sesión blindada|sesión normal/.test(t), g4: /4\s?GB/.test(t) }; });
  comprueba(pcComp.visible && pcComp.filas.length > 5 && pcComp.filas.every((n) => n === 2) && !pcComp.viejo && !pcComp.g4, 'PC: «Cómo funciona Comunicaciones» con el cuadro de dos columnas y sin la «sesión blindada» de antes', pcComp);
  await E.evaluate(() => document.querySelector('#pro-t-versiones').scrollIntoView({ block: 'start' })); await espera(400);
  await foto(E, 'pc-4-comparativa');
  await E.evaluate(() => document.querySelector('#pro-t1').scrollIntoView({ block: 'start' })); await espera(300);
  await foto(E, 'pc-5-ultra-tecnico');
  await E.click('#como-btn'); await espera(400);
  // videollamada del PC con un teléfono
  await F.goto(URL0); await espera(1500);
  await F.click('#nueva-blindada'); await espera(500); await F.click('#invitar-otra'); await espera(1500);
  const invF = await F.evaluate(() => window.__compartidos[window.__compartidos.length - 1]);
  await acepta(E, invF.url);
  await videollamada(E, F);
  await E.mouse.move(640, 300); await E.mouse.move(660, 330); await espera(400);
  await foto(E, 'pc-6-videollamada');
  await enLlamada(E, 'pc', false);
  await E.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1200);

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + ' · ' + fallos.join(' · ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
