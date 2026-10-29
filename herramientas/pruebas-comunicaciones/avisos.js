// Avisos con la app cerrada (dueño, 29 Oct 2026, 09:14 y 10:02): el service worker se registra, el permiso se pide desde la
// hoja, la suscripción llega al relé con las salas, y a quien no está conectado se le «despierta» al escribirle o llamarle.
// Sin servicio de push en las pruebas (hace falta Google/Apple): la suscripción del navegador se simula.
// Usage: node avisos.js <outdir>
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1';
const UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(150); } return false; };

async function telefono(browser, nombre, n) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['notifications', 'microphone', 'camera'] });
  await ctx.addInitScript((n) => {
    try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {}
    // el permiso de avisos, concedido (Chromium sin cabeza lo da por denegado aunque se conceda)
    try { Object.defineProperty(Notification, 'permission', { get: () => 'granted' }); Notification.requestPermission = async () => 'granted'; } catch (_) {}
    // el servicio de push del navegador, simulado: una dirección y dos claves con la forma real
    const b64u = (k) => { let s = ''; for (let i = 0; i < k; i++) s += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'[(i * 7 + n * 13) % 64]; return s; };
    const sub = { endpoint: 'https://push.example.invalid/envio/' + n + '/' + b64u(60), options: { applicationServerKey: null }, toJSON() { return { endpoint: this.endpoint, keys: { p256dh: b64u(87), auth: b64u(22) } }; }, unsubscribe: async () => true };
    const orig = window.PushManager && PushManager.prototype;
    if (orig) { orig.subscribe = async function (o) { sub.options.applicationServerKey = o && o.applicationServerKey; window.__sub = sub; return sub; }; orig.getSubscription = async function () { return window.__sub || null; }; }
  }, n);
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') console.log('[' + nombre + '] ' + m.type() + ': ' + m.text().slice(0, 300)); });
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 400)); fallos.push('pageerror ' + nombre); });
  return { ctx, p };
}
const foto = async (p, n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); };

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const A = await telefono(browser, 'A', 1), B = await telefono(browser, 'B', 2);
  await A.p.goto(URL0); await espera(1800);
  comprueba(await hasta(A.p, () => window.gcomPrueba && window.gcomPrueba.avisos().sw, 6000), 'A: el service worker se registra (CSP con worker-src self)');
  const est = await A.p.evaluate(() => window.gcomPrueba.avisos());
  comprueba(est.puede && est.permiso === 'granted', 'A: push posible y permiso concedido ' + JSON.stringify({ puede: est.puede, permiso: est.permiso }));
  // invitación y entrada de B
  await A.p.click('#nueva-blindada'); if (await A.p.$('#h-invitar.gc-abierta')) await A.p.click('#invitar-otra'); await espera(2500);
  const enlace = await A.p.evaluate(() => { return window.gcomPrueba.enlace(); });
  if (!enlace) { console.log('sin enlace'); await browser.close(); process.exit(1); }
  await B.p.goto(enlace.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(2000);
  if (await B.p.$('#aceptar-si:visible')) await B.p.click('#aceptar-si');
  await espera(5000);
  // con la conversación establecida y permiso ya dado, la suscripción sale sola hacia el relé con la sala
  comprueba(await hasta(A.p, () => { const a = window.gcomPrueba.avisos(); return !!(a.ultimo && a.ultimo.ok && a.ultimo.salas === 1); }, 8000), 'A: suscripción aceptada por el relé con 1 sala (' + JSON.stringify((await A.p.evaluate(() => window.gcomPrueba.avisos())).ultimo) + ')');
  comprueba(await hasta(B.p, () => { const a = window.gcomPrueba.avisos(); return !!(a.ultimo && a.ultimo.ok && a.ultimo.salas === 1); }, 8000), 'B: suscripción aceptada por el relé con 1 sala');
  await foto(A.p, '30-A-chat');
  // B se cierra del todo; A le escribe: se le despierta por el relé (1 avisado)
  const salaB = await B.p.evaluate(() => window.gcomPrueba.conv().id);
  await B.p.close(); await espera(2500); // la página se cierra; el perfil (sus conversaciones) sigue
  comprueba(await hasta(A.p, () => !/En línea/.test(document.querySelector('#cconfianza').textContent), 10000), 'A: ve a B desconectada');
  await A.p.tap('#texto'); await A.p.fill('#texto', 'Te escribo con la app cerrada'); await A.p.click('#enviar'); await espera(1500);
  const d1 = await A.p.evaluate(() => window.gcomPrueba.avisos().despierta);
  comprueba(d1 && d1.tipo === 'mensaje' && d1.avisados === 1, 'A: el relé despierta a B por «mensaje» (' + JSON.stringify(d1) + ')');
  // llamar con B cerrada: se le despierta por «llamada» y se espera a que abra
  await A.p.evaluate(() => document.querySelector('#llamar').click()); await espera(1200);
  const d2 = await A.p.evaluate(() => window.gcomPrueba.avisos().despierta);
  comprueba(d2 && d2.tipo === 'llamada' && d2.avisados === 1, 'A: el relé despierta a B por «llamada» (' + JSON.stringify(d2) + ')');
  comprueba(await A.p.evaluate(() => /Avisando a la otra persona/.test(document.querySelector('#aviso').textContent)), 'A: «Avisando a la otra persona: la llamada empieza en cuanto abra GUARDIANA.»');
  await foto(A.p, '31-A-avisando');
  // B vuelve «desde el aviso»: la conversación se abre sola y la llamada de A entra
  const B2 = { p: await B.ctx.newPage() };
  await B2.p.goto('http://127.0.0.1:8080/orbita/comunicaciones/?app=1&desde=aviso&sala=' + salaB + '&tipo=llamada'); await espera(2500);
  comprueba(await hasta(B2.p, () => !document.querySelector('#conv').hidden, 6000), 'B: al volver desde el aviso, se abre esa conversación');
  comprueba(await hasta(B2.p, () => !document.querySelector('#ll-entrante').hidden, 20000), 'B: la llamada de A entra sola al conectarse');
  await foto(B2.p, '32-B-llamada-entra');
  comprueba(await B2.p.evaluate(() => !/desde=aviso/.test(location.href)), 'B: la dirección queda limpia (sin desde=aviso)');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
