// Las dos versiones de Comunicaciones al invitar (dueño, 2 Nov 2026, 17:01: «Solo hay dos modelos, el blindado y el ultra. El blindado
// es el gratis… La ultra ya tiene que ser con la suscripción»). El chat de siempre se llama «Chat blindado» (gratis); el del espejo
// (antes «chat blindado», 29 Oct 2026, 07:49–08:02: en champán con el marco de espejo, el chat velado hasta mantenerlo pulsado, lo que
// se escribe en números y, en la llamada, la voz cambiada y el mosaico), Ultra, con la suscripción Plus.
// Desde el 3 Nov 2026 (Ultra 1) Ultra se crea solo desde el programa GUARDIANA para Windows con Plus (GET /api/plan por la pasarela);
// quien recibe la invitación entra gratis desde su navegador. En local, «?plan=plus» hace de programa con Plus.
// Desde el 1 Nov 2026 el teléfono va a /solo-pc/ (marco.js): la prueba usa el ordenador; «estrecho» es una ventana de 393 px, táctil,
// donde la hoja de invitar se abre como en el teléfono.
//   0. Fuera del programa: en la hoja, «Chat blindado · Gratis» elegido de entrada y «Ultra · Solo desde el programa GUARDIANA, con
//      Plus», sin poder elegirlo; al tocarlo, el motivo y sigue el blindado. En el PC ancho, el botón del inicio dice «Ultra» y el
//      motivo, y lo repite al tocarlo.
//   1–4. Con «?plan=plus»: elegir Ultra, el chat blindado (sin efectos), el chat Ultra (espejo, velo, números, voz cambiada y mosaico)
//      y, en el ordenador, la tecla de captura.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'tipos');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
const FUERA = 'Ultra se crea desde el programa GUARDIANA para Windows, con la suscripción Plus; quien recibe la invitación entra gratis desde su navegador. Aquí puedes usar la Blindada.';
async function equipo(browser, ancho) {
  const ctx = await browser.newContext({ viewport: ancho ? { width: 1280, height: 800 } : { width: 393, height: 793 }, deviceScaleFactor: 2, hasTouch: !ancho, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  // el Número GUARDIANA, apagado en esta prueba (invitaciones)
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  await ctx.addInitScript(() => { window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} })
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
const aviso = (P) => P.evaluate(() => { const e = document.querySelector('#aviso'); return e && !e.hidden ? e.textContent : ''; });
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]')); }, s);
const estado = (P) => P.evaluate(() => {
  const conv = document.querySelector('#conv'), lz = document.querySelector('#lienzo');
  // (quien invita espera dentro del chat, con la nota «Invitación enviada…» arriba: app.js, pintaTodos)
  return { nombre: document.querySelector('#cnombre').textContent, blindada: conv.classList.contains('blindada'), discreta: conv.classList.contains('discreta'), velado: lz.classList.contains('velado'), linea: document.querySelector('#cconfianza').textContent, espera: (document.querySelector('.gc-espera') || {}).textContent || '' };
});
async function invita(A, blindado) {
  await A.click('#nueva-blindada'); await espera(400);
  if (blindado) await A.click('#tipo-blindado');
  await A.click('#invitar-otra'); await espera(1200);
  return A.evaluate(() => window.__compartidos[window.__compartidos.length - 1]);
}
// lo que la llamada ofrece: en la barra o, desde la ronda 83, dentro del menú «Más» (⋯); el menú se abre para mirarlo
const ofrece = (P) => P.evaluate(() => { const si = (s) => { const e = document.querySelector(s); return !!(e && !e.hidden); }; return { grave: si('#ll-grave-caja'), mosaico: si('#ll-mosaico-caja'), ajustes: si('#ll-ajustes-caja'), pildora: si('#ll-voz-pill') }; });
async function videollamada(A, B) {
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  const sonando = await ofrece(A);
  if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar');
  await espera(5000);
  await A.touchscreen.tap(196, 200).catch(() => {}); await espera(400); // los botones, a la vista
  const hablando = await ofrece(A);
  if (hablando.grave || hablando.mosaico) { await A.evaluate(() => { const b = document.querySelector('#ll-mas'); if (b) b.click(); }); await espera(400); hablando.enMenu = await visible(A, '#ll-grave') && await visible(A, '#ll-mosaico'); }
  return { sonando, hablando };
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });

  // 0. fuera del programa: la hoja de invitar y el botón del inicio
  const A = await equipo(browser), B = await equipo(browser);
  await A.goto(URL0); await espera(1500);
  await A.click('#nueva-blindada'); await espera(500);
  const hoja = await A.evaluate(() => {
    const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; };
    return { abierta: document.querySelector('#h-invitar').classList.contains('gc-abierta'), blindado: t('#tipo-normal b') + ' · ' + t('#tipo-normal small'), ultra: t('#tipo-blindado b') + ' · ' + t('#tipo-blindado small'), elegido: document.querySelector('#tipo-normal').getAttribute('aria-checked'), apagado: document.querySelector('#tipo-blindado').getAttribute('aria-disabled') };
  });
  comprueba(hoja.abierta && hoja.blindado === 'Chat blindado · Gratis' && hoja.elegido === 'true', '0. la hoja: «Chat blindado · Gratis», elegido de entrada', hoja);
  comprueba(hoja.ultra === 'Ultra · Solo desde el programa GUARDIANA, con Plus' && hoja.apagado === 'true', '0. y «Ultra · Solo desde el programa GUARDIANA, con Plus», sin poder elegirla', hoja.ultra);
  await A.screenshot({ path: path.join(OUT, '0-hoja.png') });
  // (aria-disabled: Playwright no lo pulsa; el toque de la persona sí llega, y la app responde con el motivo)
  await A.evaluate(() => document.querySelector('#tipo-blindado').click()); await espera(400);
  const av = await aviso(A);
  comprueba(av === FUERA && await A.evaluate(() => document.querySelector('#tipo-normal').getAttribute('aria-checked') === 'true'), '0. al tocar Ultra, el motivo en una línea, y sigue el chat blindado', av);
  await A.screenshot({ path: path.join(OUT, '0-hoja-aviso.png') });
  const P = await equipo(browser, true); await P.goto(URL0); await espera(1500);
  const boton = await P.evaluate(() => { const ve = (e) => !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none'); return [...document.querySelectorAll('#nueva-blindada span')].filter(ve).map((x) => x.textContent.trim()); });
  comprueba(boton[0] === 'Ultra' && boton[1] === FUERA, '0. en el PC, el botón del inicio: «Ultra» y el motivo', boton);
  await P.click('#nueva-blindada'); await espera(400);
  const av2 = await aviso(P);
  comprueba(av2 === FUERA && (await P.evaluate(() => window.gcomPrueba.cuantas())) === 0, '0. y, al tocarlo, el motivo, sin crear nada', av2);
  await P.screenshot({ path: path.join(OUT, '0-pc-boton.png') });
  await P.context().close();

  // 1. con «?plan=plus» (en local, el programa con Plus): Ultra se puede elegir y un toque la elige
  await A.goto(URL0 + '?plan=plus'); await espera(1500);
  await A.click('#nueva-blindada'); await espera(600);
  const hoja1 = await A.evaluate(() => ({ sub: document.querySelector('#tipo-blindado small').textContent, apagado: document.querySelector('#tipo-blindado').getAttribute('aria-disabled') }));
  comprueba(hoja1.sub === 'Con la suscripción Plus' && hoja1.apagado === 'false', '1. con Plus, «Ultra · Con la suscripción Plus», elegible', hoja1);
  await A.click('#tipo-blindado'); await espera(700);
  comprueba(await A.evaluate(() => document.querySelector('#tipo-blindado').getAttribute('aria-checked') === 'true'), '1. un toque elige Ultra');
  await A.screenshot({ path: path.join(OUT, '1-hoja-ultra.png') });
  await A.click('#invitar-no'); await espera(300);

  // 2. el chat blindado (el de siempre)
  const dn = await invita(A, false);
  comprueba(/#i=[A-Za-z0-9_-]{43}$/.test(dn.url) && dn.text === 'Invitación a GUARDIANA', 'blindado: el enlace «#i=» y «Invitación a GUARDIANA»', [dn.text]);
  let ea = await estado(A);
  comprueba(ea.nombre === 'Chat' && !ea.blindada && /Invitación enviada/.test(ea.linea + ea.espera), 'blindado: quien invita, ya en «Chat», esperando', ea);
  await B.goto(dn.url.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(1500); if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si'); await espera(5000);
  ea = await estado(A); const eb = await estado(B);
  comprueba(!ea.blindada && !ea.discreta && !eb.blindada && !eb.discreta, 'blindado: sin marco ni velo en los dos', [ea, eb]);
  for (const [p, t] of [[A, 'Hola'], [B, '¿Qué tal?']]) { await p.tap('#texto'); await p.fill('#texto', t); await p.click('#enviar'); await espera(700); }
  comprueba(await B.evaluate(() => [...document.querySelectorAll('.gc-burbuja.gc-suya')].some((b) => /Hola/.test(b.textContent))), 'blindado: los mensajes llegan');
  await A.evaluate(() => document.activeElement && document.activeElement.blur()); await espera(300);
  await A.screenshot({ path: path.join(OUT, '3-chat-blindado.png') });
  const vn = await videollamada(A, B);
  comprueba(!vn.sonando.grave && !vn.hablando.grave && !vn.hablando.mosaico && !vn.hablando.ajustes && !vn.hablando.pildora, 'blindado: la videollamada sin efectos de voz ni de imagen', vn);
  await A.screenshot({ path: path.join(OUT, '4-video-blindado.png') });
  await A.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500);

  // 3. el chat Ultra
  const C = await equipo(browser), D = await equipo(browser);
  await C.goto(URL0 + '?plan=plus'); await espera(1500);
  const db = await invita(C, true);
  comprueba(/#b=[A-Za-z0-9_-]{43}$/.test(db.url) && db.text === 'Invitación a un chat Ultra de GUARDIANA', 'Ultra: el enlace «#b=» y «Invitación a un chat Ultra de GUARDIANA»', [db.text]);
  await D.goto(db.url.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(1500); if (await D.$('#aceptar-si:visible')) await D.click('#aceptar-si'); await espera(6000);
  const ec = await estado(C), ed = await estado(D);
  comprueba(ec.nombre === 'Chat Ultra' && ec.blindada && ec.discreta && ec.velado && ed.blindada && ed.discreta, 'Ultra: «Chat Ultra», marco de espejo y velo en los dos', [ec, ed]);
  await C.tap('#texto'); await C.fill('#texto', 'Secreto'); await espera(200);
  const mascara = await C.evaluate(() => document.querySelector('#texto-mascara').textContent);
  comprueba(/^\d{7}$/.test(mascara), 'Ultra: lo que se escribe se ve en números', mascara);
  await C.click('#enviar'); await espera(800);
  await C.evaluate(() => document.activeElement && document.activeElement.blur()); await espera(1600);
  await C.screenshot({ path: path.join(OUT, '5-chat-ultra.png') });
  // al salir de la app, el velo al momento
  await C.evaluate(() => { document.querySelector('#lienzo').classList.remove('velado'); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  comprueba(await C.evaluate(() => document.querySelector('#lienzo').classList.contains('velado')), 'Ultra: al salir de la app, velado al momento');
  await C.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); });
  const vb = await videollamada(C, D);
  comprueba(!vb.sonando.grave && !vb.sonando.mosaico, 'Ultra: mientras suena, sin los botones', vb.sonando);
  comprueba(vb.hablando.grave && vb.hablando.mosaico && vb.hablando.enMenu && !vb.hablando.ajustes && !vb.hablando.pildora, 'Ultra: con la llamada en marcha, «Voz cambiada» y «Mosaico» en el menú «Más» (y nada más)', vb.hablando);
  await C.screenshot({ path: path.join(OUT, '6-video-ultra-mas.png') });
  await C.evaluate(() => { const b = document.querySelector('#ll-mas'); if (b && b.getAttribute('aria-expanded') === 'true') b.click(); }); await espera(300);
  // desde el 29 Oct 2026 (dueño, 09:23) la llamada blindada empieza con los dos puestos; un toque los quita
  comprueba(await C.evaluate(() => document.querySelector('#ll-grave').getAttribute('aria-pressed') === 'true' && document.querySelector('#ll-mosaico').getAttribute('aria-pressed') === 'true'), 'Ultra: empieza con «Voz cambiada» y «Mosaico» puestos');
  await C.evaluate(() => { document.querySelector('#ll-grave').click(); document.querySelector('#ll-mosaico').click(); }); await espera(1500);
  comprueba(await C.evaluate(() => document.querySelector('#ll-grave').getAttribute('aria-pressed') === 'false' && document.querySelector('#ll-mosaico').getAttribute('aria-pressed') === 'false'), 'Ultra: los dos se quitan con un toque');
  await C.touchscreen.tap(196, 200).catch(() => {}); await espera(300);
  await C.screenshot({ path: path.join(OUT, '6-video-ultra.png') });
  await C.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500);
  // la siguiente llamada vuelve a empezar con los dos puestos
  const vb2 = await videollamada(C, D);
  comprueba(await C.evaluate(() => document.querySelector('#ll-grave').getAttribute('aria-pressed') === 'true' && document.querySelector('#ll-mosaico').getAttribute('aria-pressed') === 'true') && vb2.hablando.grave, 'Ultra: la siguiente llamada también empieza con la voz cambiada y el mosaico');
  await C.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1200);

  // 4. ordenador: la tecla de captura tapa el chat Ultra
  const E = await equipo(browser, true), F = await equipo(browser);
  await F.goto(URL0 + '?plan=plus'); await espera(1500);
  const de = await invita(F, true);
  await E.goto(de.url.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(1500); if (await E.$('#aceptar-si:visible')) await E.click('#aceptar-si'); await espera(6000);
  await E.keyboard.press('PrintScreen'); await espera(200);
  comprueba(await visible(E, '#captura-velo'), 'ordenador: con la tecla de captura, «Modo Ultra · Pantalla tapada durante la captura»');
  await E.screenshot({ path: path.join(OUT, '7-pc-captura.png') });

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
