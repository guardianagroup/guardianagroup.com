// iPhone: primero se chatea en Safari y después el chat se muda solo a la app de la pantalla de inicio (dueño, 29 Oct 2026,
// 18:56–19:04: «primero un chat y después… añadir a pantalla de inicio… que automáticamente el chat de fuera pase a la aplicación…
// para que la persona no se pierda»). Comprueba: la invitación se acepta sola en Safari (sin «¿Aceptas?»); el manifiesto de Safari
// lleva la llave del traspaso solo en el fragmento; Safari se la manda a quien invitó, que abre una sala oculta; la guía con la
// guía sale una vez, en una ventanita; la app que se añade arranca con «#t=», entra en esa sala y el chat se funde en uno (mismo nombre, todo lo
// hablado); Safari se despide; los mensajes nuevos llegan a la app.
// Usage: node traspaso.js <outdir>
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
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(200); } return false; };
const visible = async (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return !!e && !e.hidden && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; }, s);
const foto = async (p, n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); };

async function telefono(browser, nombre, app) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: IPHONE, locale: 'es-ES' });
  await ctx.addInitScript((esApp) => { try { Object.defineProperty(navigator, 'standalone', { get: () => esApp }); } catch (_) {} window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 200)); }; }, !!app);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}

(async () => {
  const browser = await chromium.launch();
  const A = await telefono(browser, 'Fran', true);       // quien invita, con la app
  const S = await telefono(browser, 'Safari', false);    // Nathalie, abriendo el enlace en Safari
  const N = await telefono(browser, 'App', true);        // Nathalie, en la app que acaba de añadir

  await A.goto(URL0 + '?app=1&numero=0'); await espera(1600);
  await A.click('#nueva-blindada'); await espera(400);
  if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra');
  await espera(1800);
  const enlace = (await A.evaluate(() => window.gcomPrueba.enlace())).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');

  // 1. Safari: el enlace abre el chat directamente, sin «¿Aceptas?»
  await S.goto(enlace); await espera(1500);
  comprueba(!(await visible(S, '#aceptar-si')), 'Safari: sin «¿Aceptas?», el chat se abre directamente');
  comprueba(await hasta(S, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella && c.sesion); }, 14000), 'Safari: chateando con quien invitó');
  const man = await S.evaluate(() => ({ href: document.querySelector('link[rel="manifest"]').getAttribute('href'), m: window.gcomManifiestoInv || null, n: document.querySelectorAll('link[rel="manifest"]').length, llave: window.gcomTraspaso || '' }));
  comprueba(man.n === 1 && /^blob:/.test(man.href) && man.m && man.m.start_url === 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1#t=' + man.llave && /^[A-Za-z0-9_-]{43}$/.test(man.llave), 'Safari: la app que se añada lleva la llave del traspaso, solo en el fragmento', man);
  // en el chat de Fran: la sala oculta que espera a la app
  comprueba(await hasta(A, () => window.gcomPrueba.traspaso().ocultas === 1, 8000), 'Fran: recibió la llave y espera a la app (sala oculta)', await A.evaluate(() => window.gcomPrueba.traspaso()));
  comprueba(await A.evaluate(() => window.gcomPrueba.traspaso().vivas === 1), 'Fran: en su lista sigue habiendo un solo chat');
  // Fran le pone nombre y se hablan en Safari
  if (await A.$('#ccontacto:not([hidden])')) { await A.evaluate(() => document.querySelector('#ccontacto-si').click()); await espera(400); await A.fill('#nombre-conv', 'Nathalie'); await A.click('#nombre-guardar'); await espera(600); }
  await A.fill('#texto', 'Hola, ¿me lees?'); await A.click('#enviar'); await espera(1500);
  comprueba(await S.evaluate(() => /me lees/.test(document.querySelector('#mensajes').textContent)), 'Safari: le llega el primer mensaje');

  // 2. la guía, una sola vez al empezar el chat: la ventanita con los dos pasos y «Entendido» (dueño, 20:53); no vuelve a salir
  comprueba(await hasta(S, () => document.querySelector('#h-anadir').classList.contains('gc-abierta'), 6000), 'Safari: al empezar el chat, la ventanita «Añade GUARDIANA a tu pantalla de inicio»');
  comprueba(await S.evaluate(() => [...document.querySelectorAll('#h-anadir .anadir-pasos > li')].filter((l) => getComputedStyle(l).display !== 'none').length === 2), 'dos pasos, con los símbolos del iPhone: Compartir y «Añadir a pantalla de inicio» (dueño, 20:07 y 20:26)');
  comprueba(!(await S.$('.flecha-salta')) && !(await S.$('#tira-anadir')), 'sin flechas amarillas ni barra azul (dueño, 20:27 y 20:53)');
  comprueba(await S.evaluate(() => /Chat temporal/.test(document.querySelector('#mensajes').textContent)), 'Safari: dentro del chat, una línea: «Chat temporal… se borra a los 10 minutos sin usarlo» (19:46)');
  comprueba(await hasta(A, () => /Chat temporal: la otra persona/.test(document.querySelector('#mensajes').textContent), 6000), 'Fran: en su chat, que el de la otra persona es temporal');
  await foto(S, '90-safari-chat-guia');
  await S.click('#anadir-ok'); await espera(400);
  comprueba(await S.evaluate(() => !document.querySelector('#h-anadir').classList.contains('gc-abierta')), 'Safari: «Entendido» la cierra');
  await S.reload(); await espera(2500);
  comprueba(await hasta(S, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella && c.sesion); }, 14000), 'Safari: tras recargar, sigue en el chat');
  await espera(1800);
  comprueba(await S.evaluate(() => !document.querySelector('#h-anadir').classList.contains('gc-abierta')), 'Safari: la guía no vuelve a salir para este chat (20:53)');
  await foto(S, '91-safari-chat');

  // 3. la app añadida arranca con la llave: el chat se muda solo
  await N.goto(man.m.start_url); await espera(2500);
  comprueba(await hasta(N, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella && c.sesion); }, 15000), 'App: entra sola en el chat, sin preguntar nada');
  comprueba(await hasta(A, () => window.gcomPrueba.traspaso().ocultas === 0 && window.gcomPrueba.traspaso().vivas === 1, 8000), 'Fran: los dos chats se funden en uno', await A.evaluate(() => window.gcomPrueba.traspaso()));
  comprueba(await A.evaluate(() => window.gcomPrueba.traspaso().nombres.join() === 'Nathalie'), 'Fran: sigue llamándose «Nathalie»', await A.evaluate(() => window.gcomPrueba.traspaso().nombres));
  comprueba(await A.evaluate(() => /me lees/.test(document.querySelector('#mensajes').textContent)), 'Fran: lo hablado antes sigue en el chat');
  comprueba(await A.evaluate(() => /ya tiene GUARDIANA: este chat se queda guardado/.test(document.querySelector('#mensajes').textContent)), 'Fran: «La otra persona ya tiene GUARDIANA: este chat se queda guardado»');
  comprueba(await A.evaluate(() => !window.gcomPrueba.conv().suTemporal), 'Fran: el chat ya no es temporal');
  comprueba(await hasta(S, () => !document.querySelector('#paso-traspasado').hidden, 8000), 'Safari: «Tu chat ya está en la app»');
  await foto(S, '93-safari-traspasado');
  await A.fill('#texto', 'Ahora ya en la app 😊'); await A.click('#enviar');
  comprueba(await hasta(N, () => /ya en la app/.test(document.querySelector('#mensajes').textContent), 8000), 'App: le llegan los mensajes nuevos');
  await N.fill('#texto', 'Te leo desde la app'); await N.click('#enviar');
  comprueba(await hasta(A, () => /desde la app/.test(document.querySelector('#mensajes').textContent), 8000), 'Fran: le llega la respuesta desde la app');
  await foto(N, '92-app-chat');

  // 4. Chrome del iPhone (dueño, 19:18): Compartir arriba a la derecha
  {
    const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1', locale: 'es-ES' });
    const A2 = await telefono(browser, 'Otro', true);
    await A2.goto(URL0 + '?app=1&numero=0'); await espera(1500);
    await A2.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(400);
    if (await A2.$('#h-invitar.gc-abierta')) await A2.evaluate(() => document.querySelector('#invitar-otra').click());
    await espera(1800);
    const enlace2 = (await A2.evaluate(() => window.gcomPrueba.enlace())).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
    const C = await ctx.newPage();
    await C.goto(enlace2); await espera(1500);
    const vio = await hasta(C, () => document.querySelector('#h-anadir').classList.contains('gc-abierta'), 14000);
    if (!vio) console.log('Chrome:', JSON.stringify(await C.evaluate(() => { const c = window.gcomPrueba.conv(); return { conv: !!c, huella: !!(c && c.huella), sesion: !!(c && c.sesion), t: window.gcomPrueba.traspaso(), href: location.href }; })));
    comprueba(vio, 'Chrome del iPhone: la misma ventanita al empezar el chat');
    comprueba(await C.evaluate(() => [...document.querySelectorAll('#h-anadir .anadir-pasos > li')].filter((l) => getComputedStyle(l).display !== 'none').length === 2), 'Chrome: dos pasos (Compartir, Añadir a pantalla de inicio)');
    await foto(C, '94-chrome-guia');
  }

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
