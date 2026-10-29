// «¿Añadir GUARDIANA a tu pantalla de inicio?» tras aceptar una invitación (dueño, 29 Oct 2026, 07:44: «le saldrá la pregunta en
// pantalla, ¿quiere añadir esto… sí o no? Ya está… Imagínate que es una persona mayor, debe ser muy, muy fácil»; «la versión de
// escritorio para el PC también»). Chromium sin cabeza no ofrece instalar: el aviso del navegador (beforeinstallprompt) se simula.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'instalar');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, ua, o) {
  o = o || {};
  const movil = ua !== PC;
  const ctx = await browser.newContext({ viewport: movil ? { width: 393, height: 793 } : { width: 1280, height: 800 }, deviceScaleFactor: 2, isMobile: movil, hasTouch: movil, userAgent: ua, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((o) => {
    window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); };
    if (o.app) { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} }
    // el aviso del navegador «se puede instalar», como lo da Chrome, y si se llamó a prompt()
    window.__instalar = 0;
    if (o.aviso) addEventListener('load', () => setTimeout(() => { const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = () => { window.__instalar++; return Promise.resolve(); }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); dispatchEvent(e); }, 300));
  }, o);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden'); }, s);
const hojaAbierta = (P) => P.evaluate(() => document.querySelector('#h-instalar').classList.contains('gc-abierta'));
async function invitacion(browser) {
  const A = await equipo(browser, IPHONE, { app: true });
  await A.goto(URL0); await espera(1500);
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(900);
  return String((await A.evaluate(() => window.__compartidos[0])).url);
}
async function acepta(P, url) { await P.goto(url); await espera(1500); await P.click('#aceptar-si'); }
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });

  // 1. Android: tras aceptar, la pregunta; «Sí, añadir» abre la ventana del sistema
  const B = await equipo(browser, ANDROID, { aviso: true });
  await acepta(B, await invitacion(browser)); await espera(4500);
  comprueba(await hojaAbierta(B), 'Android: tras aceptar, «¿Añadir GUARDIANA a tu pantalla de inicio?»');
  comprueba(await B.evaluate(() => document.querySelector('#h-instalar-t').innerText.trim()) === '¿Añadir GUARDIANA a tu pantalla de inicio?', 'la pregunta, en el teléfono');
  await B.screenshot({ path: path.join(OUT, '1-android.png') });
  await B.click('#instalar-si'); await espera(500);
  comprueba(await B.evaluate(() => window.__instalar) === 1 && !(await hojaAbierta(B)), '«Sí, añadir»: la ventana del sistema, y la pregunta se cierra');
  comprueba(await visible(B, '#texto'), 'el chat sigue debajo');

  // 2. «Ahora no»: no se vuelve a preguntar
  const C = await equipo(browser, ANDROID, { aviso: true });
  await acepta(C, await invitacion(browser)); await espera(4500);
  comprueba(await hojaAbierta(C), 'otro Android: la pregunta');
  await C.click('#instalar-no'); await espera(400);
  comprueba(!(await hojaAbierta(C)) && await C.evaluate(() => window.__instalar) === 0, '«Ahora no» la cierra sin instalar');
  comprueba(await C.evaluate(() => localStorage.getItem('gcom-instalar')) === 'no', '«Ahora no» queda anotado en este teléfono');
  await C.reload(); await espera(5000);
  comprueba(!(await hojaAbierta(C)), 'al volver a abrir, no se repite la pregunta');
  // (quien entró con un enlace en el navegador y termina su conversación no deja rastro: se borran sus ajustes, también este; si
  // vuelve a recibir una invitación, se le pregunta otra vez. Es lo de «Invitado», 28 Oct 2026, 15:50)

  // 3. Android sin el aviso del navegador (lo abre dentro de otra app): pregunta igual y «Sí» enseña los pasos
  const D = await equipo(browser, ANDROID, {});
  await acepta(D, await invitacion(browser)); await espera(13000);
  comprueba(await hojaAbierta(D), 'Android sin aviso del navegador: la pregunta llega igual');
  await D.click('#instalar-si'); await espera(500);
  comprueba(await D.evaluate(() => document.querySelector('#h-completa').classList.contains('gc-abierta')), '«Sí»: los pasos (⋮ y «Instalar app»)');

  // 4. Ordenador (Chrome o Edge): «¿Instalar GUARDIANA en este ordenador?» y el botón del inicio
  const E = await equipo(browser, PC, { aviso: true });
  await E.goto(URL0); await espera(1500);
  comprueba(await E.evaluate(() => { const b = document.querySelector('#anadir-app'); return !b.hidden && b.innerText.trim(); }) === 'Instalar en este ordenador', 'ordenador: «Instalar en este ordenador» en el inicio');
  await acepta(E, await invitacion(browser)); await espera(4500);
  comprueba(await hojaAbierta(E) && await E.evaluate(() => document.querySelector('#h-instalar-t').innerText.trim()) === '¿Instalar GUARDIANA en este ordenador?', 'ordenador: tras aceptar, «¿Instalar GUARDIANA en este ordenador?»');
  await E.screenshot({ path: path.join(OUT, '2-ordenador.png') });

  // 5. iPhone en Safari y la app ya instalada: sin pregunta
  const F = await equipo(browser, IPHONE, {});
  await acepta(F, await invitacion(browser)); await espera(4500);
  comprueba(!(await hojaAbierta(F)), 'iPhone en Safari: sin la pregunta (la conversación no pasaría a la app todavía)');
  const G = await equipo(browser, ANDROID, { aviso: true, app: true });
  await acepta(G, await invitacion(browser)); await espera(4500);
  comprueba(!(await hojaAbierta(G)), 'ya instalada: sin la pregunta');

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
