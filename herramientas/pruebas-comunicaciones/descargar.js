// «Descargar GUARDIANA» desde la web (dueño, 29 Oct 2026, 19:36: «desde el principio de todo arriba y desde donde ya está, que es
// entrar… otro botón… descargar guardiana… para que pueda instalar la app en el móvil»; «si no le llega el chat, no tiene opción») y la
// app del ordenador, GUARDIANA entera (19:41–19:52: «se ha eliminado todo»; «tendría que abrirme la página web entera… todo»).
// Comprueba: los botones de la portada (cabecera, portada y cierre) y adónde llevan en el móvil; en el iPhone, la pantalla de
// descarga con la guía de su navegador (Safari: el botón de abajo; Chrome: Compartir arriba a la derecha); en el ordenador, el
// manifiesto de GUARDIANA entera, la ventana de instalar del navegador y, ya instalada, dónde queda el icono.
// Usage: node descargar.js <outdir>
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const WEB = 'http://127.0.0.1:8080/';
const URL0 = WEB + 'orbita/comunicaciones/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const CRIOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt, extra) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined && !cond ? '  ' + JSON.stringify(extra) : '')); if (!cond) fallos.push(txt); };

async function equipo(browser, nombre, ua, o) {
  o = o || {};
  const movil = ua !== PC;
  const ctx = await browser.newContext({ viewport: movil ? { width: 393, height: 793 } : { width: 1280, height: 800 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil, userAgent: ua, locale: 'es-ES' });
  await ctx.addInitScript((o) => {
    window.__instalar = 0;
    if (o.aviso) addEventListener('load', () => setTimeout(() => { const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = () => { window.__instalar++; return Promise.resolve(); }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); dispatchEvent(e); }, 300));
  }, o);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const manifiesto = (p) => p.evaluate(() => [...document.querySelectorAll('link[rel="manifest"]')].map((l) => l.getAttribute('href')));
const pasosVisibles = (p, sel) => p.evaluate((sel) => [...document.querySelectorAll(sel + ' .anadir-pasos > li')].filter((l) => getComputedStyle(l).display !== 'none').length, sel);

(async () => {
  const browser = await chromium.launch();

  // 1. la portada en el ordenador: arriba, junto a «Entrar» y en el cierre; el manifiesto de GUARDIANA entera
  const W = await equipo(browser, 'portada-PC', PC);
  await W.goto(WEB); await espera(1200);
  const botones = await W.evaluate(() => [...document.querySelectorAll('[data-bajar]')].map((a) => ({ txt: a.textContent.replace(/\s+/g, ' ').trim(), en: a.closest('header') ? 'cabecera' : a.closest('#final') ? 'cierre' : a.closest('.hero') ? 'portada' : '?' })));
  comprueba(botones.length === 3 && ['cabecera', 'portada', 'cierre'].every((x) => botones.some((b) => b.en === x)), 'portada: «Descargar GUARDIANA» arriba, junto a «Entrar» y en el cierre', botones);
  comprueba(botones.every((b) => /Descargar/.test(b.txt) && /GUARDIANA/.test(b.txt)), 'el botón dice «Descargar GUARDIANA»', botones);
  comprueba((await manifiesto(W)).join() === '/manifest.webmanifest', 'portada en el ordenador: el manifiesto de GUARDIANA entera', await manifiesto(W));
  await W.screenshot({ path: path.join(OUT, '96-portada-pc.png') });
  await W.click('header [data-bajar]'); await espera(1400);
  comprueba(await W.evaluate(() => { const h = document.querySelector('.bajar-hoja'); return !!h && /Instalar GUARDIANA en este ordenador/.test(h.textContent) && /icono de instalar/.test(h.textContent); }), 'ordenador sin la ventana del navegador: cómo instalarla (el icono de instalar de la barra)');
  await W.screenshot({ path: path.join(OUT, '97-portada-pc-pasos.png') });
  await W.keyboard.press('Escape'); await espera(200);
  comprueba(await W.evaluate(() => !document.querySelector('.bajar-hoja')), 'se cierra con Escape');
  const W2 = await equipo(browser, 'portada-PC-aviso', PC, { aviso: true });
  await W2.goto(WEB); await espera(1200);
  await W2.click('header [data-bajar]'); await espera(400);
  comprueba(await W2.evaluate(() => window.__instalar) === 1, 'ordenador con la ventana del navegador: un clic, «Instalar»');
  await W2.evaluate(() => dispatchEvent(new Event('appinstalled'))); await espera(900);
  comprueba(await W2.evaluate(() => { const h = document.querySelector('.bajar-hoja'); return !!h && /ya está en tu ordenador/.test(h.textContent) && /escritorio/.test(h.textContent); }), 'instalada: «Listo: GUARDIANA ya está en tu ordenador… el icono en el escritorio…»');
  await W2.screenshot({ path: path.join(OUT, '98-portada-pc-lista.png') });

  // 2. la portada en el iPhone: ya no es el relato largo sino Inicio, la pantalla de la app (dueño, 30 Oct 2026, 15:16: «que no
  //    le aparezca el descargar, solamente que le aparezca entrar»; 15:27 y 18:37: la web en el teléfono, como una app)
  const M = await equipo(browser, 'portada-iPhone', IPHONE);
  await M.goto(WEB); await espera(1500);
  comprueba(await M.evaluate(() => location.pathname === '/inicio/'), 'portada en el iPhone: abre Inicio', await M.evaluate(() => location.pathname));
  comprueba(await M.evaluate(() => !document.querySelector('[data-bajar]') && !!document.querySelector('.mc-pestanas a[aria-current=page][data-pestana=inicio]')), 'Inicio: sin «Descargar» y con la barra de pestañas');
  comprueba((await manifiesto(M)).length === 0, 'portada en el móvil: sin manifiesto (no ofrece instalar la web)');
  comprueba(await M.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'portada en el iPhone: nada se sale por los lados');
  await M.screenshot({ path: path.join(OUT, '99-portada-iphone.png') });

  // 3. iPhone en Safari: la pantalla de descarga con el botón de abajo
  const I = await equipo(browser, 'iPhone-Safari', IPHONE);
  await I.goto(URL0 + '?instalar'); await espera(1600);
  comprueba(await I.evaluate(() => { const p = document.querySelector('#paso-descargar'); return !!p && !p.hidden; }), 'iPhone: «Descarga GUARDIANA», en una pantalla sola');
  comprueba(!(await I.$('.flecha-salta')), 'sin flechas amarillas (dueño, 20:27)');
  comprueba(await pasosVisibles(I, '#paso-descargar') === 2, 'Safari: dos pasos (Compartir, Añadir a pantalla de inicio; dueño, 20:26)');
  comprueba((await manifiesto(I)).join() === '/orbita/comunicaciones/comunicaciones.webmanifest', 'iPhone: el manifiesto de Comunicaciones (la app del móvil es el chat)', await manifiesto(I));
  await I.screenshot({ path: path.join(OUT, '100-descarga-safari.png') });
  await I.click('#desc-cerrar'); await espera(300);
  comprueba(await I.evaluate(() => document.querySelector('#paso-descargar').hidden && !document.querySelector('#paso-inicio').hidden), '«Ahora no»: al inicio de Comunicaciones');

  // 4. iPhone en Chrome: Compartir arriba a la derecha, dos pasos
  const IC = await equipo(browser, 'iPhone-Chrome', CRIOS);
  await IC.goto(URL0 + '?instalar'); await espera(1600);
  comprueba(await pasosVisibles(IC, '#paso-descargar') === 2, 'Chrome del iPhone: dos pasos (Compartir, Añadir a pantalla de inicio)');
  await IC.screenshot({ path: path.join(OUT, '101-descarga-chrome.png') });

  // 5. Android: el manifiesto de Comunicaciones; ?instalar abre la instalación de un toque
  const A = await equipo(browser, 'Android', ANDROID, { aviso: true });
  await A.goto(URL0 + '?instalar'); await espera(1600);
  comprueba((await manifiesto(A)).join() === '/orbita/comunicaciones/comunicaciones.webmanifest', 'Android: el manifiesto de Comunicaciones');
  comprueba(await A.evaluate(() => document.querySelector('#h-completa').classList.contains('gc-abierta')), 'Android: «Añade GUARDIANA a tu pantalla de inicio» con «Instalar»');
  await A.click('#guia-instalar'); await espera(300);
  comprueba(await A.evaluate(() => window.__instalar) === 1, 'Android: «Instalar», la ventana del sistema');

  // 6. ordenador en Comunicaciones: GUARDIANA entera; instalada, dónde está el icono
  const P = await equipo(browser, 'PC', PC, { aviso: true });
  await P.goto(URL0); await espera(1500);
  comprueba((await manifiesto(P)).join() === '/manifest.webmanifest', 'ordenador: el manifiesto de GUARDIANA entera (abre NÚCLEO)', await manifiesto(P));
  await P.click('#anadir-app'); await espera(300);
  comprueba(await P.evaluate(() => window.__instalar) === 1, 'ordenador: «Instalar en este ordenador», la ventana del navegador');
  await P.evaluate(() => dispatchEvent(new Event('appinstalled'))); await espera(900);
  comprueba(await P.evaluate(() => document.querySelector('#h-instalada').classList.contains('gc-abierta') && /menú Inicio y anclada en la barra de tareas/.test(document.querySelector('#h-instalada').innerText)), 'ordenador: «GUARDIANA ya está en tu ordenador · en el menú Inicio y anclada en la barra de tareas (texto del 29 Oct, 22:52)»');
  await P.screenshot({ path: path.join(OUT, '102-pc-instalada.png') });
  const NU = await equipo(browser, 'NUCLEO', PC);
  await NU.goto(WEB + 'orbita/'); await espera(1000);
  comprueba((await manifiesto(NU)).includes('/manifest.webmanifest'), 'NÚCLEO en el ordenador: también se puede instalar desde ahí');
  const manRaiz = JSON.parse(await NU.evaluate(() => fetch('/manifest.webmanifest').then((r) => r.text())));
  comprueba(manRaiz.scope === '/' && /^\/orbita\//.test(manRaiz.start_url), 'la app del ordenador abre NÚCLEO y abarca toda la web', { scope: manRaiz.scope, start: manRaiz.start_url });

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
