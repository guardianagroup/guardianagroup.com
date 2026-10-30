// Avisos al teléfono con precisión (dueño, 30 Oct 2026, 08:27: «deben ser perfectas… cuando el cliente está en línea y
// desconectado, máxima precisión y detalle»). Dos teléfonos (Android, push simulado); el relé de pruebas deja ver en /avisos lo
// que manda. A escribe a B en cada situación y se mira si B recibe aviso o no:
//   1. B en ese chat, a la vista          → ningún aviso (lo está viendo).
//   2. B en la app, en la lista de chats  → ningún aviso del sistema; dentro de la app, el aviso de «Mensaje nuevo en …».
//   3. B con la app en segundo plano      → un aviso por mensaje, enseguida (≤ 3 s).
//   4. B con el teléfono congelado (pantalla bloqueada sin decir «fuera») → aviso en ≤ 7 s (sin acuse a los 4 s).
//   5. B con la app cerrada               → aviso.
//   6. El aviso que enseña el teléfono: el nombre que B le puso a A y «Mensaje nuevo» / «3 mensajes nuevos» / «Te está llamando».
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');
const OUT = process.argv[2] || path.join(__dirname, 'avisos-precision');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1&numero=0';
const UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(150); } return false; };
const avisos = (borra) => new Promise((res) => { http.get('http://127.0.0.1:8794/avisos' + (borra ? '?borra=1' : ''), (r) => { let d = ''; r.on('data', (x) => { d += x; }); r.on('end', () => { try { res(JSON.parse(d)); } catch (_) { res([]); } }); }).on('error', () => res([])); });
const paraB = (xs, sala, idB) => xs.filter((x) => x.sala === sala && x.id === idB);

async function telefono(browser, nombre, n) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['notifications'] });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  await ctx.addInitScript((n) => {
    try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {}
    try { Object.defineProperty(Notification, 'permission', { get: () => 'granted' }); Notification.requestPermission = async () => 'granted'; } catch (_) {}
    const b64u = (k) => { let s = ''; for (let i = 0; i < k; i++) s += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'[(i * 7 + n * 13) % 64]; return s; };
    const sub = { endpoint: 'https://push.example.invalid/envio/' + n + '/' + b64u(60), options: { applicationServerKey: null }, toJSON() { return { endpoint: this.endpoint, keys: { p256dh: b64u(87), auth: b64u(22) } }; }, unsubscribe: async () => true };
    const orig = window.PushManager && PushManager.prototype;
    if (orig) { orig.subscribe = async function (o) { sub.options.applicationServerKey = o && o.applicationServerKey; window.__sub = sub; return sub; }; orig.getSubscription = async function () { return window.__sub || null; }; }
  }, n);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return { ctx, p };
}
// la app en segundo plano (o de vuelta): lo que dice el navegador al cambiar de app
const visibilidad = (p, oculta) => p.evaluate((oculta) => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (oculta ? 'hidden' : 'visible') }); Object.defineProperty(document, 'hidden', { configurable: true, get: () => oculta }); document.dispatchEvent(new Event('visibilitychange')); }, oculta);
const escribe = async (P, t) => { await P.fill('#texto', t); await P.click('#enviar'); };

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const A = await telefono(browser, 'A', 11), B = await telefono(browser, 'B', 12);
  await A.p.goto(URL0); await espera(1800);
  await A.p.click('#nueva-blindada'); if (await A.p.$('#h-invitar.gc-abierta')) await A.p.click('#invitar-otra'); await espera(2500);
  const enlace = await A.p.evaluate(() => window.gcomPrueba.enlace());
  await B.p.goto(enlace.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(2000);
  if (await B.p.$('#aceptar-si:visible')) await B.p.click('#aceptar-si');
  await espera(5000);
  comprueba(await hasta(B.p, () => { const a = window.gcomPrueba.avisos(); return !!(a.ultimo && a.ultimo.ok); }, 10000) && await hasta(A.p, () => { const a = window.gcomPrueba.avisos(); return !!(a.ultimo && a.ultimo.ok); }, 10000), 'A y B: suscritos a los avisos');
  const sala = await B.p.evaluate(() => window.gcomPrueba.conv().id);
  const idB = await B.p.evaluate(() => window.gcomPrueba.avisos().id || (window.gcomPrueba.avisos().ultimo || {}).id);
  // B le pone nombre a A: «Fran»
  await B.p.evaluate((sala) => window.gcomPrueba.ponNombre ? window.gcomPrueba.ponNombre(sala, 'Fran') : null, sala);
  await espera(800); await avisos(true);

  // 1. B en ese chat, a la vista
  await escribe(A.p, 'Uno: me ves'); await espera(6000);
  let xs = paraB(await avisos(true), sala, idB);
  comprueba(xs.length === 0, '1. B en ese chat, a la vista: ningún aviso (' + xs.length + ')');
  // 2. B en la lista de chats
  await B.p.evaluate(() => document.querySelector('#cvolver').click()); await espera(800);
  await escribe(A.p, 'Dos: estás en la lista'); await espera(6000);
  xs = paraB(await avisos(true), sala, idB);
  comprueba(xs.length === 0, '2. B en la app, fuera de ese chat: ningún aviso del sistema (' + xs.length + ')');
  comprueba(await B.p.evaluate(() => { const a = document.querySelector('#aviso'); return !a.hidden || /nuevo/i.test(a.textContent) || !!document.querySelector('#contactos-filas .contacto.nueva, #lista .nueva'); }), '2. …y dentro de la app se ve que hay un mensaje nuevo');
  await B.p.evaluate((sala) => window.gcomPrueba.abre && window.gcomPrueba.abre(sala), sala); await espera(800);
  // 3. B con la app en segundo plano
  await visibilidad(B.p, true); await espera(1200); await avisos(true);
  const t3 = Date.now();
  await escribe(A.p, 'Tres: segundo plano'); await espera(400); await escribe(A.p, 'Tres bis'); await espera(2600); await escribe(A.p, 'Tres ter');
  let ok3 = false; const suma = (xs) => xs.reduce((a, x) => a + (x.n || 1), 0); while (Date.now() - t3 < 9000) { xs = paraB(await avisos(), sala, idB); if (suma(xs) >= 3) { ok3 = true; break; } await espera(250); }
  const primero = xs.length ? xs[0].t - t3 : -1;
  comprueba(ok3 && suma(xs) === 3 && primero >= 0 && primero <= 1500, '3. B en segundo plano: los avisos cuentan los 3 mensajes (' + suma(xs) + ' en ' + xs.length + ' avisos), el primero a los ' + primero + ' ms');
  await visibilidad(B.p, false); await espera(1500); await avisos(true);
  // 4. B congelado: la página deja de correr sin decir «fuera»
  await B.p.evaluate(() => { setTimeout(() => { const t = Date.now(); while (Date.now() - t < 9000) {} }, 50); }); await espera(300); await avisos(true);
  const t4 = Date.now();
  await escribe(A.p, 'Cuatro: teléfono congelado');
  let ok4 = false; while (Date.now() - t4 < 12000) { xs = paraB(await avisos(), sala, idB); if (xs.length) { ok4 = true; break; } await espera(250); }
  console.log('     depuración 4:', JSON.stringify(await A.p.evaluate(() => { const c = window.gcomPrueba.conv(); const m = c.mensajes.filter((x) => x.dir === 'mia').pop(); return { estado: m && m.estado, porBuzon: m && m.porBuzon, avisado: m && m.avisadoSinAcuse, despierta: window.gcomPrueba.avisos().despierta, enLinea: !!(c.miembros && c.miembros.size) }; })));
  comprueba(ok4 && xs[0].t - t4 <= 7000, '4. B congelado (pantalla bloqueada sin avisar): aviso a los ' + (xs.length ? xs[0].t - t4 : '—') + ' ms');
  await espera(6000);
  comprueba(await hasta(B.p, () => [...document.querySelectorAll('#mensajes .gc-texto')].some((e) => /Cuatro/.test(e.textContent)), 15000), '4. …y al volver, el mensaje está');
  // 6. el aviso que enseña el teléfono (el push se entrega al service worker de B)
  const reg = await B.p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration('/orbita/comunicaciones/'); return !!r; });
  if (reg) {
    const cdp2 = await B.ctx.newCDPSession(B.p);
    await cdp2.send('ServiceWorker.enable');
    const regs = await new Promise((res) => { cdp2.once('ServiceWorker.workerRegistrationUpdated', (e) => res(e.registrations)); setTimeout(() => res([]), 3000); });
    const r0 = (regs || []).find((x) => /comunicaciones/.test(x.scopeURL));
    if (r0) {
      await B.p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration('/orbita/comunicaciones/'); for (const n of await r.getNotifications()) n.close(); });
      await B.p.evaluate(() => { window.__sw = []; navigator.serviceWorker.addEventListener('message', (e) => window.__sw.push(e.data)); });
      for (let i = 0; i < 3; i++) { await cdp2.send('ServiceWorker.deliverPushMessage', { origin: 'http://127.0.0.1:8080', registrationId: r0.registrationId, data: JSON.stringify({ tipo: 'mensaje', sala, t: Date.now() }) }); await espera(600); }
      console.log('     depuración 6:', JSON.stringify(await B.p.evaluate(() => window.__sw)), JSON.stringify(r0).slice(0, 200));
      const txt = await B.p.evaluate(() => window.__sw.filter((x) => x.t === 'aviso-texto'));
      comprueba(txt.length === 3 && txt.every((x) => x.titulo === 'Fran') && txt[0].cuerpo === 'Mensaje nuevo', '6. el aviso dice quién y qué: «Fran · Mensaje nuevo» (' + JSON.stringify(txt[0]) + ')');
      await B.p.evaluate(() => { window.__sw = []; });
      await cdp2.send('ServiceWorker.deliverPushMessage', { origin: 'http://127.0.0.1:8080', registrationId: r0.registrationId, data: JSON.stringify({ tipo: 'mensaje', sala, t: Date.now(), n: 3 }) }); await espera(800);
      const t3m = await B.p.evaluate(() => window.__sw.filter((x) => x.t === 'aviso-texto'));
      comprueba(t3m.length === 1 && t3m[0].titulo === 'Fran' && /3 mensajes nuevos/.test(t3m[0].cuerpo), '6. un aviso que junta 3 mensajes: «Fran · 3 mensajes nuevos» (' + JSON.stringify(t3m[0]) + ')');
      await B.p.evaluate(() => { window.__sw = []; });
      await cdp2.send('ServiceWorker.deliverPushMessage', { origin: 'http://127.0.0.1:8080', registrationId: r0.registrationId, data: JSON.stringify({ tipo: 'llamada', sala, t: Date.now() }) }); await espera(800);
      const tl = await B.p.evaluate(() => window.__sw.filter((x) => x.t === 'aviso-texto'));
      comprueba(tl.length === 1 && tl[0].titulo === 'Fran' && tl[0].cuerpo === 'Te está llamando', '6. la llamada: «Fran · Te está llamando» (' + JSON.stringify(tl[0]) + ')');
    } else comprueba(false, '6. sin registro del service worker por CDP');
  } else comprueba(false, '6. B sin service worker');
  // 5. B con la app cerrada
  await B.p.close(); await espera(2500); await avisos(true);
  await escribe(A.p, 'Cinco: app cerrada');
  let ok5 = false; const t5 = Date.now(); while (Date.now() - t5 < 8000) { xs = paraB(await avisos(), sala, idB); if (xs.length) { ok5 = true; break; } await espera(250); }
  comprueba(ok5, '5. B con la app cerrada: aviso (' + (xs.length ? (xs[0].t - t5) + ' ms' : 'ninguno') + ')');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
