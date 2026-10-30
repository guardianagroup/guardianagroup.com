// El chat temporal del navegador del móvil (dueño, 29 Oct 2026, 19:46: «…la persona pueda chatear y que a lo mejor esa persona pues
// no quiera agregarlo a la pantalla de inicio… será solamente ese chat… y luego desaparecerá… si no lo utiliza en los siguientes 10
// minutos, que desaparezca. O la persona también lo desaparece… lo quita y fuera»). Comprueba: en Safari del iPhone el chat es temporal
// y quien invitó lo sabe; pasados 10 minutos sin usarlo se borra en los dos lados, con su despedida y «Descargar GUARDIANA»; si quien
// estaba en el navegador lo cerró, en el lado de quien invitó se borra igual; al volver a abrir Safari tarde, se borra antes de
// enseñar nada; con una invitación nueva, el chat viejo se va en silencio y el nuevo se abre; en el ordenador nada es temporal.
// Usage: node temporal.js <outdir>
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt, extra) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined && !cond ? '  ' + JSON.stringify(extra) : '')); if (!cond) fallos.push(txt); };
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(200); } return false; };
const MIN11 = 11 * 60 * 1000;

async function telefono(browser, nombre, ua, app) {
  const movil = ua !== PC;
  const ctx = await browser.newContext({ viewport: movil ? { width: 393, height: 793 } : { width: 1280, height: 800 }, deviceScaleFactor: 2, isMobile: movil, hasTouch: movil, userAgent: ua, locale: 'es-ES' });
  await ctx.addInitScript((esApp) => { try { Object.defineProperty(navigator, 'standalone', { get: () => esApp }); } catch (_) {} window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 200)); }; }, !!app);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e.stack || e).split('\n').slice(0, 3).join(' | ').slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
async function invita(browser, nombre) {
  const A = await telefono(browser, nombre, IPHONE, true);
  await A.goto(URL0 + '?app=1&numero=0'); await espera(1500);
  await A.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(400);
  if (await A.$('#h-invitar.gc-abierta')) await A.evaluate(() => document.querySelector('#invitar-otra').click());
  await espera(1500);
  return { A, enlace: (await A.evaluate(() => window.gcomPrueba.enlace())).replace('https://guardianagroup.com', 'http://127.0.0.1:8080') };
}
const conectados = (p) => hasta(p, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella && c.sesion); }, 15000);

(async () => {
  const browser = await chromium.launch();

  // 1. Safari: chat temporal; quien invitó lo sabe
  const { A, enlace } = await invita(browser, 'Fran');
  const S = await telefono(browser, 'Safari', IPHONE, false);
  await S.goto(enlace);
  comprueba(await conectados(S), 'Safari: el chat se abre y se conecta');
  comprueba(await hasta(S, () => window.gcomPruebaTemporal.estado().convs.some((c) => c.temporal), 6000), 'Safari: el chat es temporal');
  comprueba(await hasta(A, () => !!(window.gcomPrueba.conv() && window.gcomPrueba.conv().suTemporal), 8000), 'Fran: sabe que el de la otra persona es temporal');
  await A.fill('#texto', 'Hola'); await A.click('#enviar');
  comprueba(await hasta(S, () => /Hola/.test(document.querySelector('#mensajes').textContent), 8000), 'Safari: le llega el mensaje');
  // usarlo cuenta: un toque renueva los 10 minutos
  await S.evaluate(() => window.gcomPruebaTemporal.envejece(9 * 60 * 1000));
  await S.mouse.click(200, 300); await espera(200);
  comprueba(await S.evaluate(() => Date.now() - window.gcomPruebaTemporal.estado().uso < 5000), 'Safari: un toque cuenta como uso (se renuevan los 10 minutos)');
  comprueba(!(await S.evaluate(() => window.gcomPruebaTemporal.caduca())), 'Safari: con uso reciente, no se borra');

  // 2. diez minutos sin usarlo: se borra en los dos lados
  await S.evaluate(() => window.gcomPruebaTemporal.envejece(11 * 60 * 1000));
  comprueba(await S.evaluate(() => window.gcomPruebaTemporal.caduca()), 'Safari: pasados 10 minutos sin usarlo, se borra');
  comprueba(await hasta(S, () => { const f = document.querySelector('#fin-invitado'); return !!f && !f.hidden && f.classList.contains('temporal') && f.dataset.por === 'tiempo'; }, 3000), 'Safari: «Chat borrado · Pasaron 10 minutos sin usarlo…»');
  comprueba(await S.evaluate(() => { const b = document.querySelector('#fin-descargar'); return !!b && b.getBoundingClientRect().height > 0; }), 'Safari: y el botón «Descargar GUARDIANA»');
  comprueba(await S.evaluate(() => window.gcomPrueba.cuantas() === 0 && !localStorage.getItem('gcom-traspaso') && !localStorage.getItem('gcom-temporal-uso')), 'Safari: no queda nada guardado del chat');
  await S.screenshot({ path: path.join(OUT, '95-safari-borrado.png') });
  comprueba(await hasta(A, () => window.gcomPrueba.cuantas() === 0, 6000), 'Fran: el chat temporal también se borra en su app', await A.evaluate(() => window.gcomPrueba.cuantas()));
  comprueba(await A.evaluate(() => window.gcomPrueba.traspaso().ocultas === 0), 'Fran: y la sala que esperaba a la app, también');
  await S.click('#fin-descargar'); await espera(1800);
  comprueba(await S.evaluate(() => { const p = document.querySelector('#paso-descargar'); return !!p && !p.hidden; }), 'Safari: «Descargar GUARDIANA» lleva a la guía');

  // 3. quien estaba en Safari se fue (cerró la página): en el lado de quien invitó se borra igual a los 10 minutos
  const b = await invita(browser, 'Fran2');
  const S2 = await telefono(browser, 'Safari2', IPHONE, false);
  await S2.goto(b.enlace); comprueba(await conectados(S2), 'otro Safari: conectado');
  comprueba(await hasta(b.A, () => !!(window.gcomPrueba.conv() && window.gcomPrueba.conv().suTemporal), 8000), 'Fran2: sabe que es temporal');
  await S2.context().close(); await espera(2500);
  await b.A.evaluate(() => window.gcomPruebaTemporal.envejeceSuyos(11 * 60 * 1000));
  await b.A.evaluate(() => window.gcomPruebaTemporal.caducaSuyos()); await espera(800);
  comprueba(await b.A.evaluate(() => window.gcomPrueba.cuantas() === 0), 'Fran2: diez minutos sin la otra persona, el chat temporal se borra');

  // 4. Safari vuelve a abrirse tarde: se borra antes de enseñar nada
  const c = await invita(browser, 'Fran3');
  const S3 = await telefono(browser, 'Safari3', IPHONE, false);
  await S3.goto(c.enlace); comprueba(await conectados(S3), 'tercer Safari: conectado');
  await S3.evaluate(() => window.gcomPruebaTemporal.envejece(11 * 60 * 1000));
  await S3.goto(URL0); await espera(2500);
  comprueba(await S3.evaluate(() => window.gcomPrueba.cuantas() === 0 && !document.querySelector('#fin-invitado').hidden), 'Safari abierto tarde: el chat ya no está y sale la despedida');

  // 5. con una invitación nueva, el viejo se va en silencio y el nuevo se abre
  const d = await invita(browser, 'Fran4');
  const S4 = await telefono(browser, 'Safari4', IPHONE, false);
  await S4.goto(d.enlace); comprueba(await conectados(S4), 'cuarto Safari: conectado');
  const viejo = await S4.evaluate(() => window.gcomPrueba.conv().id);
  await S4.evaluate(() => window.gcomPruebaTemporal.envejece(11 * 60 * 1000));
  const e = await invita(browser, 'Fran5');
  await S4.goto(e.enlace); await espera(500);
  comprueba(await conectados(S4), 'Safari: la invitación nueva se abre');
  comprueba(await S4.evaluate((v) => window.gcomPrueba.conv().id !== v && window.gcomPrueba.cuantas() === 1 && document.querySelector('#fin-invitado').hidden, viejo), 'Safari: el chat viejo se fue en silencio, sin despedida por medio');
  comprueba(await hasta(e.A, () => window.gcomPrueba.traspaso().ocultas === 1, 8000), 'Safari: el chat nuevo trae su llave para mudarse a la app');

  // 6. en el ordenador, nada es temporal (dueño, 19:48: «la versión del PC seguirá igual»)
  const f = await invita(browser, 'Fran6');
  const P = await telefono(browser, 'PC', PC, false);
  await P.goto(f.enlace); await espera(1500);
  if (await P.$('#aceptar-si:visible')) await P.click('#aceptar-si');
  comprueba(await conectados(P), 'ordenador: conectado');
  await espera(800);
  comprueba(await P.evaluate(() => !window.gcomPruebaTemporal.estado().en && !window.gcomPruebaTemporal.estado().convs.some((c) => c.temporal)), 'ordenador: el chat no es temporal');
  comprueba(await f.A.evaluate(() => !window.gcomPrueba.conv().suTemporal), 'ordenador: quien invitó no lo ve como temporal');

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
