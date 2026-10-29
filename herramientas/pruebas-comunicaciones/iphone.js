// iPhone: la invitación tiene que acabar DENTRO de la app, no en Safari (dueño, 29 Oct 2026, 16:05 y 16:11: «a mi mujer… en la
// aplicación no le aparecen y le aparece una página abierta en Safari»; «le aparece duplicado, le aparece en Safari y en la
// aplicación»). En el iPhone, Safari y la app de la pantalla de inicio guardan cada uno sus cosas por separado y Safari no puede
// avisar con la app cerrada: por eso, en Safari, el enlace ya no abre el chat; se elige añadir la app (la invitación entra dentro)
// (y la app nace con el chat). Se comprueba además el puntito verde/rojo y la pantalla de Ajustes.
// Usage: node iphone.js <outdir>
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt, extra) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined && !cond ? '  ' + JSON.stringify(extra) : '')); if (!cond) fallos.push(txt); };
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(150); } return false; };
const visible = async (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return !!e && !e.hidden && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; }, s);
const foto = async (p, n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); };

// «app»: como la GUARDIANA de la pantalla de inicio (navigator.standalone); si no, Safari
async function telefono(browser, nombre, app) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: IPHONE, locale: 'es-ES', permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.addInitScript((esApp) => {
    try { Object.defineProperty(navigator, 'standalone', { get: () => esApp }); } catch (_) {}
    window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 200)); };
    // el portapapeles del iPhone, imitado (Playwright no da el de verdad en este contexto)
    window.__porta = '';
    try { Object.defineProperty(navigator, 'clipboard', { get: () => ({ writeText: (t) => { window.__porta = String(t); return Promise.resolve(); }, readText: () => Promise.resolve(window.__porta) }) }); } catch (_) {}
  }, !!app);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}

(async () => {
  const browser = await chromium.launch();
  const A = await telefono(browser, 'A', true);        // quien invita, con la app instalada
  const Saf = await telefono(browser, 'Safari', false); // la otra persona, abriendo el enlace en Safari
  const App = await telefono(browser, 'App', true);     // …y la misma persona, ya en su app

  await A.goto(URL0 + '?app=1'); await espera(1600);
  await A.click('#nueva-blindada'); await espera(400);
  if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra');
  await espera(1800);
  const enlace = (await A.evaluate(() => window.gcomPrueba.enlace())).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');

  // 1. En Safari, el enlace NO abre el chat: sale sola la guía de añadir a la pantalla de inicio, con la invitación dentro
  //    (dueño, 17:04: «tiene que ser de una vez… que quede añadida la aplicación y que no se vea en Safari»)
  await Saf.goto(enlace); await espera(2500);
  comprueba(await visible(Saf, '#paso-ios') && !(await visible(Saf, '#paso-aceptar')), 'Safari: la invitación no se acepta aquí');
  comprueba(await Saf.evaluate(() => window.gcomPrueba.cuantas() === 0), 'Safari: no se ha creado ningún chat');
  comprueba(await Saf.evaluate(() => document.querySelector('#h-completa').classList.contains('gc-abierta')), 'Safari: la guía de la pantalla de inicio sale sola, sin elegir nada');
  comprueba(!(await visible(Saf, '#guia-safari')) && !(await visible(Saf, '#completa-ok')), 'Safari: en la guía no hay «Seguir en Safari» ni «Entendido», solo los pasos');
  const man = await Saf.evaluate(() => decodeURIComponent(document.querySelector('link[rel="manifest"]').getAttribute('href') || ''));
  comprueba(/"start_url":"\/orbita\/comunicaciones\/\?app=1&inv=i=[A-Za-z0-9_-]{43}#i=[A-Za-z0-9_-]{43}"/.test(man), 'Safari: la app que se añade arranca con la invitación dentro (dirección de inicio)', man.slice(0, 160));
  comprueba(/\?app=1&inv=i=[A-Za-z0-9_-]{43}#i=/.test(await Saf.evaluate(() => location.href)), 'Safari: y la dirección de la página también la lleva (por si el iPhone toma esa)');
  await foto(Saf, '80-safari-guia');
  // cerrando la guía queda la pantalla que la vuelve a abrir, y, discreto, «Usar en Safari»
  await Saf.evaluate(() => { const h = document.querySelector('#h-completa'); h.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await espera(500);
  comprueba(!(await Saf.evaluate(() => document.querySelector('#h-completa').classList.contains('gc-abierta'))) && await visible(Saf, '#ios-anadir'), 'Safari: tocando fuera se cierra la guía y queda «Ver cómo se añade»');
  await Saf.click('#ios-anadir'); await espera(500);
  comprueba(await Saf.evaluate(() => document.querySelector('#h-completa').classList.contains('gc-abierta')), 'Safari: «Ver cómo se añade» la vuelve a abrir');
  await Saf.evaluate(() => { const h = document.querySelector('#h-completa'); h.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await espera(400);

  // 2. La app añadida arranca con esa dirección: el chat nace dentro de la app
  await App.goto(await Saf.evaluate(() => location.href)); await espera(2200);
  comprueba(await visible(App, '#aceptar-si'), 'app: arranca con la invitación («¿Aceptas?»)');
  await App.click('#aceptar-si'); await espera(1500);
  comprueba(await App.evaluate(() => window.gcomPrueba.cuantas() === 1), 'app: el chat nace dentro de la app');
  comprueba(await hasta(A, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella && c.sesion); }, 14000), 'los dos conectados por el chat de la app');
  await foto(App, '82-app-chat');

  // 3. (dueño, 17:28): nada de «Tengo una invitación» ni de modo día; el inicio, con sus tres botones y nada más
  comprueba(!(await App.$('#pegar-inv')) && !(await App.$('#tema-btn')), 'app: sin «Tengo una invitación» ni botón del sol');

  // 4. El puntito: verde con la otra persona dentro, sin ninguna palabra
  await espera(900);
  const cab = await App.evaluate(() => { const p = document.querySelector('#cpunto'), c = document.querySelector('#cconfianza'); return { punto: p && !p.hidden ? (p.classList.contains('en') ? 'verde' : 'rojo') : 'no', txt: (c && c.textContent.trim()) || '' }; });
  comprueba(cab.punto === 'verde' && !/En línea|No conectado/.test(cab.txt), 'cabecera: puntito verde y ninguna palabra', cab);
  await A.close();
  const rojo = await hasta(App, () => { const p = document.querySelector('#cpunto'); return !!p && !p.hidden && !p.classList.contains('en'); }, 15000);
  comprueba(rojo, 'cabecera: al irse la otra persona, el puntito se pone rojo');
  await foto(App, '83-app-punto');

  // 5. Ajustes: se abre y el sonido se apaga y se enciende
  await App.click('#cvolver').catch(() => {});
  await espera(500);
  await App.click('#ajustes-btn'); await espera(600);
  comprueba(await App.evaluate(() => document.querySelector('#h-ajustes').classList.contains('gc-abierta')), 'Ajustes: se abre desde el engranaje');
  comprueba(await visible(App, '#aj-avisos') && await visible(App, '#aj-sonido'), 'Ajustes: notificaciones y sonido');
  await foto(App, '84-ajustes');
  const son0 = await App.evaluate(() => document.querySelector('#aj-sonido').getAttribute('aria-checked'));
  await App.click('#aj-sonido'); await espera(400);
  const son1 = await App.evaluate(() => document.querySelector('#aj-sonido').getAttribute('aria-checked'));
  comprueba(son0 === 'true' && son1 === 'false' && (await App.evaluate(() => localStorage.getItem('gcom-sonido'))) === '0', 'Ajustes: el sonido se apaga y se recuerda', [son0, son1]);
  await App.click('#aj-sonido'); await espera(400);
  comprueba((await App.evaluate(() => document.querySelector('#aj-sonido').getAttribute('aria-checked'))) === 'true', 'Ajustes: y se vuelve a encender');
  await App.click('#ajustes-ok'); await espera(400);
  comprueba(!(await App.evaluate(() => document.querySelector('#h-ajustes').classList.contains('gc-abierta'))), 'Ajustes: «Listo» la cierra');

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
