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
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', ua.slice(13, 40), String(e.stack || e).split('\n').slice(0, 4).join(' | ').slice(0, 400)); fallos.push('pageerror'); });
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
// iPhone en Safari (dueño, 29 Oct 2026, 16:05): el enlace lleva primero a la pantalla del iPhone; aquí se sigue en Safari
async function acepta(P, url) { await P.goto(url); await espera(1500); if (await P.$('#aceptar-si:visible')) await P.click('#aceptar-si'); }
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });

  // 1. Android (dueño, 29 Oct 2026, 20:02–20:53): la invitación abre el chat directamente, sin «¿Aceptas?»; al empezar el chat, una
  //    vez, «¿Añadir GUARDIANA a tu pantalla de inicio?»; «Sí, añadir» abre la ventana del sistema. Instalada, el chat deja de ser
  //    temporal (Chrome y la app guardan juntos)
  const B = await equipo(browser, ANDROID, { aviso: true });
  await B.goto(await invitacion(browser)); await espera(1500);
  comprueba(!(await visible(B, '#aceptar-si')), 'Android: sin «¿Aceptas?», el chat se abre directamente');
  let vio = false; for (let k = 0; k < 60 && !vio; k++) { vio = await hojaAbierta(B); if (!vio) await espera(300); }
  comprueba(vio, 'Android: al empezar el chat, «¿Añadir GUARDIANA a tu pantalla de inicio?» (como antes; dueño, 20:53)');
  comprueba(!(await B.$('#tira-anadir')), 'Android: sin barra azul');
  comprueba(await B.evaluate(() => /Chat temporal/.test(document.querySelector('#mensajes').textContent)), 'Android: dentro del chat, la línea del chat temporal');
  await B.screenshot({ path: path.join(OUT, '1-android.png') });
  await B.click('#instalar-si'); await espera(500);
  comprueba(await B.evaluate(() => window.__instalar) === 1 && !(await hojaAbierta(B)), '«Sí, añadir»: la ventana del sistema, y la pregunta se cierra');
  await B.evaluate(() => dispatchEvent(new Event('appinstalled'))); await espera(600);
  comprueba(await B.evaluate(() => localStorage.getItem('gcom-app-instalada') === '1' && !window.gcomPruebaTemporal.estado().convs.some((c) => c.temporal)), 'Android: instalada, el chat ya no es temporal');

  // 2. «Ahora no»: no se vuelve a preguntar (ni al recargar)
  const C = await equipo(browser, ANDROID, { aviso: true });
  await C.goto(await invitacion(browser)); await espera(1500);
  vio = false; for (let k = 0; k < 60 && !vio; k++) { vio = await hojaAbierta(C); if (!vio) await espera(300); }
  comprueba(vio, 'otro Android: la pregunta');
  await C.click('#instalar-no'); await espera(400);
  comprueba(!(await hojaAbierta(C)) && await C.evaluate(() => window.__instalar) === 0, '«Ahora no» la cierra sin instalar');
  await C.reload(); await espera(5000);
  comprueba(!(await hojaAbierta(C)), 'al volver a abrir, no se repite la pregunta');

  // 3. Android sin el aviso del navegador (lo abre dentro de otra app): pregunta igual y «Sí» enseña los pasos (⋮ y «Instalar app»)
  const D = await equipo(browser, ANDROID, {});
  await D.goto(await invitacion(browser)); await espera(1500);
  vio = false; for (let k = 0; k < 60 && !vio; k++) { vio = await hojaAbierta(D); if (!vio) await espera(300); }
  comprueba(vio, 'Android sin aviso del navegador: la pregunta llega igual');
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
