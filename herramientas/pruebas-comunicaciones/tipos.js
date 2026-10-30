// Chat normal y chat blindado (dueño, 29 Oct 2026, 07:49–08:02): al invitar se elige; el normal, sobrio y sin efectos; el blindado,
// en champán con el marco de espejo, el chat velado hasta mantenerlo pulsado, lo que se escribe en números, y en la llamada solo
// «Voz grave» y «Mosaico», con la llamada en marcha. En el ordenador, la tecla de captura tapa la pantalla.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'tipos');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, ua) {
  const pc = ua === PC;
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: !pc, hasTouch: !pc, userAgent: ua || UA, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]')); }, s);
const estado = (P) => P.evaluate(() => {
  const conv = document.querySelector('#conv'), lz = document.querySelector('#lienzo');
  return { nombre: document.querySelector('#cnombre').textContent, blindada: conv.classList.contains('blindada'), discreta: conv.classList.contains('discreta'), velado: lz.classList.contains('velado'), linea: document.querySelector('#cconfianza').textContent };
});
async function invita(A, blindado) {
  await A.click('#nueva-blindada'); await espera(400);
  if (blindado) await A.click('#tipo-blindado');
  await A.click('#invitar-otra'); await espera(1200);
  return A.evaluate(() => window.__compartidos[window.__compartidos.length - 1]);
}
async function videollamada(A, B) {
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  const sonando = { grave: await visible(A, '#ll-grave'), mosaico: await visible(A, '#ll-mosaico'), ajustes: await visible(A, '#ll-ajustes-caja'), pildora: await visible(A, '#ll-voz-pill') };
  if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar');
  await espera(5000);
  await A.touchscreen.tap(196, 200).catch(() => {}); await espera(400); // los botones, a la vista
  const hablando = { grave: await visible(A, '#ll-grave'), mosaico: await visible(A, '#ll-mosaico'), ajustes: await visible(A, '#ll-ajustes-caja'), pildora: await visible(A, '#ll-voz-pill') };
  return { sonando, hablando };
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });

  // 1. la hoja: el normal elegido de entrada
  const A = await equipo(browser), B = await equipo(browser);
  await A.goto(URL0); await espera(1500);
  // 29 Oct 2026, 12:55–12:59 (dueño): el blindado va «próximamente» (no se puede elegir); esta prueba queda para cuando vuelva
  if (await A.evaluate(() => { document.querySelector('#nueva-blindada').click(); const b = document.querySelector('#tipo-blindado'); return !!b && b.getAttribute('aria-disabled') === 'true'; })) { console.log('El chat blindado está en «próximamente»: prueba omitida (se retoma cuando se active).'); await browser.close(); process.exit(0); }
  await A.click('#invitar-no').catch(() => {}); await espera(300);
  await A.click('#nueva-blindada'); await espera(500);
  comprueba(await A.evaluate(() => document.querySelector('#tipo-normal').getAttribute('aria-checked') === 'true' && document.querySelector('#tipo-blindado').getAttribute('aria-checked') === 'false'), 'la hoja: «Chat normal» elegido de entrada');
  await A.screenshot({ path: path.join(OUT, '1-hoja-normal.png') });
  await A.click('#tipo-blindado'); await espera(700);
  comprueba(await A.evaluate(() => document.querySelector('#tipo-blindado').getAttribute('aria-checked') === 'true'), 'un toque elige «Chat blindado»');
  await A.screenshot({ path: path.join(OUT, '2-hoja-blindado.png') });
  await A.click('#invitar-no'); await espera(300);

  // 2. chat normal
  const dn = await invita(A, false);
  comprueba(/#i=[A-Za-z0-9_-]{43}$/.test(dn.url) && dn.text === 'Invitación a un chat de GUARDIANA', 'normal: el enlace «#i=» y «Invitación a un chat de GUARDIANA»', [dn.text]);
  let ea = await estado(A);
  comprueba(ea.nombre === 'Chat' && !ea.blindada && /Invitación enviada/.test(ea.linea), 'normal: quien invita, ya en «Chat», esperando', ea);
  await B.goto(dn.url.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(1500); if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si'); await espera(5000);
  ea = await estado(A); const eb = await estado(B);
  comprueba(!ea.blindada && !ea.discreta && !eb.blindada && !eb.discreta, 'normal: sin marco ni velo en los dos', [ea, eb]);
  for (const [p, t] of [[A, 'Hola'], [B, '¿Qué tal?']]) { await p.tap('#texto'); await p.fill('#texto', t); await p.click('#enviar'); await espera(700); }
  comprueba(await B.evaluate(() => [...document.querySelectorAll('.gc-burbuja.gc-suya')].some((b) => /Hola/.test(b.textContent))), 'normal: los mensajes llegan');
  await A.evaluate(() => document.activeElement && document.activeElement.blur()); await espera(300);
  await A.screenshot({ path: path.join(OUT, '3-chat-normal.png') });
  const vn = await videollamada(A, B);
  comprueba(!vn.sonando.grave && !vn.hablando.grave && !vn.hablando.mosaico && !vn.hablando.ajustes && !vn.hablando.pildora, 'normal: la videollamada sin efectos de voz ni de imagen', vn);
  await A.screenshot({ path: path.join(OUT, '4-video-normal.png') });
  await A.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500);

  // 3. chat blindado
  const C = await equipo(browser), D = await equipo(browser);
  await C.goto(URL0); await espera(1500);
  const db = await invita(C, true);
  comprueba(/#b=[A-Za-z0-9_-]{43}$/.test(db.url) && db.text === 'Invitación a un chat blindado de GUARDIANA', 'blindado: el enlace «#b=» y «Invitación a un chat blindado de GUARDIANA»', [db.text]);
  await D.goto(db.url.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(1500); if (await D.$('#aceptar-si:visible')) await D.click('#aceptar-si'); await espera(6000);
  const ec = await estado(C), ed = await estado(D);
  comprueba(ec.nombre === 'Chat blindado' && ec.blindada && ec.discreta && ec.velado && ed.blindada && ed.discreta, 'blindado: «Chat blindado», marco de espejo y velo en los dos', [ec, ed]);
  await C.tap('#texto'); await C.fill('#texto', 'Secreto'); await espera(200);
  const mascara = await C.evaluate(() => document.querySelector('#texto-mascara').textContent);
  comprueba(/^\d{7}$/.test(mascara), 'blindado: lo que se escribe se ve en números', mascara);
  await C.click('#enviar'); await espera(800);
  await C.evaluate(() => document.activeElement && document.activeElement.blur()); await espera(1600);
  await C.screenshot({ path: path.join(OUT, '5-chat-blindado.png') });
  // al salir de la app, el velo al momento
  await C.evaluate(() => { document.querySelector('#lienzo').classList.remove('velado'); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  comprueba(await C.evaluate(() => document.querySelector('#lienzo').classList.contains('velado')), 'blindado: al salir de la app, velado al momento');
  await C.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); });
  const vb = await videollamada(C, D);
  comprueba(!vb.sonando.grave && !vb.sonando.mosaico, 'blindado: mientras suena, sin los botones', vb.sonando);
  comprueba(vb.hablando.grave && vb.hablando.mosaico && !vb.hablando.ajustes && !vb.hablando.pildora, 'blindado: con la llamada en marcha, «Voz grave» y «Mosaico» (y nada más)', vb.hablando);
  // desde el 29 Oct 2026 (dueño, 09:23) la llamada blindada empieza con los dos puestos; un toque los quita
  comprueba(await C.evaluate(() => document.querySelector('#ll-grave').getAttribute('aria-pressed') === 'true' && document.querySelector('#ll-mosaico').getAttribute('aria-pressed') === 'true'), 'blindado: empieza con «Voz grave» y «Mosaico» puestos');
  await C.click('#ll-grave'); await C.click('#ll-mosaico'); await espera(1500);
  comprueba(await C.evaluate(() => document.querySelector('#ll-grave').getAttribute('aria-pressed') === 'false' && document.querySelector('#ll-mosaico').getAttribute('aria-pressed') === 'false'), 'blindado: los dos se quitan con un toque');
  await C.touchscreen.tap(196, 200).catch(() => {}); await espera(300);
  await C.screenshot({ path: path.join(OUT, '6-video-blindado.png') });
  await C.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500);
  // la siguiente llamada vuelve a empezar con los dos puestos
  const vb2 = await videollamada(C, D);
  comprueba(await C.evaluate(() => document.querySelector('#ll-grave').getAttribute('aria-pressed') === 'true' && document.querySelector('#ll-mosaico').getAttribute('aria-pressed') === 'true') && vb2.hablando.grave, 'blindado: la siguiente llamada también empieza con la voz grave y el mosaico');
  await C.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1200);

  // 4. ordenador: la tecla de captura tapa el chat blindado
  const E = await equipo(browser, PC), F = await equipo(browser);
  await F.goto(URL0); await espera(1500);
  const de = await invita(F, true);
  await E.goto(de.url.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(1500); if (await E.$('#aceptar-si:visible')) await E.click('#aceptar-si'); await espera(6000);
  await E.keyboard.press('PrintScreen'); await espera(200);
  comprueba(await visible(E, '#captura-velo'), 'ordenador: con la tecla de captura, «Modo blindado · No se puede capturar»');
  await E.screenshot({ path: path.join(OUT, '7-pc-captura.png') });

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
