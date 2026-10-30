// Eliminar chats y espera de quien invita (dueño, 29 Oct 2026, 14:33 y 14:47): «Tengo que poder eliminar chats»; «en vez de llevarla
// al chat a esperar, le aparece aquí una cosa de invitar». En Contactos, «Editar» pone «Eliminar» en cada fila y mantener pulsado un
// contacto pregunta lo mismo; se borra aquí y en el otro teléfono. Quien invita espera dentro del chat, también tras recargar, con
// «Volver a enviar».
// Usage: node eliminar.js <outdir>
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1&numero=0';
const UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt, extra) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined && !cond ? '  ' + JSON.stringify(extra) : '')); if (!cond) fallos.push(txt); };
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(150); } return false; };

async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES' });
  // el Número GUARDIANA, apagado en esta prueba (invitaciones; 29 Oct 2026, 23:07: en el móvil sin la app, el inicio es «Añadir a la pantalla de inicio»)
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const foto = async (p, n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); };
async function invita(A) {
  await A.click('#nueva-blindada'); await espera(400);
  if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra');
  await espera(2000);
  return A.evaluate(() => window.gcomPrueba.enlace());
}
async function conecta(A, B, nombreA, nombreB) {
  const enlace = await invita(A);
  await B.goto(enlace.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(1500);
  if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si');
  await hasta(A, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella); }, 12000);
  await hasta(B, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella); }, 12000);
  await espera(800);
  for (const [X, n] of [[A, nombreA], [B, nombreB]]) {
    if (await X.$('#ccontacto:not([hidden])')) { await X.evaluate(() => document.querySelector('#ccontacto-si').click()); await espera(400); await X.fill('#nombre-conv', n); await X.click('#nombre-guardar'); await espera(600); }
  }
}

(async () => {
  const browser = await chromium.launch();
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B');
  await A.goto(URL0); await espera(1500);

  // 1. quien invita espera dentro del chat, con «Volver a enviar», también tras recargar
  await invita(A);
  comprueba(await A.evaluate(() => !document.querySelector('#conv').hidden && !!document.querySelector('#mensajes .gc-espera-otra')), 'quien invita: dentro del chat, esperando, con «Volver a enviar»');
  await A.reload(); await espera(2500);
  comprueba(await A.evaluate(() => !document.querySelector('#conv').hidden && !!document.querySelector('#mensajes .gc-espera')) && await A.evaluate(() => document.querySelector('#paso-enlace').hidden), 'tras recargar: sigue en el chat esperando (sin la pantalla «Invitar · Compartir enlace»)');
  await foto(A, '70-A-espera');
  await A.click('.gc-espera-otra'); await espera(400);
  comprueba(await A.evaluate(() => document.querySelector('#h-invitar').classList.contains('gc-abierta')), '«Volver a enviar» abre WhatsApp / Otras apps');
  const antes = await A.evaluate(() => window.gcomPrueba.enlace());
  await A.click('#invitar-otra'); await espera(800);
  const otra = await A.evaluate(() => window.__compartidos[window.__compartidos.length - 1]);
  comprueba(!!otra && otra.url === antes, '«Volver a enviar»: la misma invitación, no una nueva', otra && otra.url);
  // se borra esta invitación pendiente y se empieza bien
  await A.evaluate(() => document.querySelector('#cmenu') && document.querySelector('#cmenu').click()); await espera(300);
  await A.evaluate(() => document.querySelector('#cm-eliminar').click()); await espera(300);
  comprueba(await A.evaluate(() => document.querySelector('#h-eliminar').classList.contains('gc-abierta')), 'en el chat, «⋯ → Eliminar chat» pregunta');
  await A.click('#eliminar-si'); await espera(800);
  comprueba(await A.evaluate(() => window.gcomPrueba.cuantas() === 0), 'la invitación pendiente se elimina');

  // 2. con un contacto: «Editar» → «Eliminar» → se borra aquí y en el otro teléfono
  await A.goto(URL0); await espera(1500);
  await conecta(A, B, 'Mamá', 'Francis');
  comprueba(await A.evaluate(() => window.gcomPrueba.cuantas() === 1) && await B.evaluate(() => window.gcomPrueba.cuantas() === 1), 'los dos con un chat');
  await B.click('#cvolver'); await espera(600);
  if (!(await B.$('#contactos:not([hidden])'))) { await B.click('#ver-contactos-inicio'); await espera(500); }
  comprueba(await B.evaluate(() => !document.querySelector('#contactos-editar').hidden), 'Contactos: «Editar» arriba');
  await B.click('#contactos-editar'); await espera(300);
  await foto(B, '71-B-editar');
  comprueba(await B.evaluate(() => document.querySelectorAll('#contactos-filas .contacto-quita').length === 1 && document.querySelector('#contactos-editar').textContent === 'Listo'), 'en «Editar», cada fila con «Eliminar» y arriba «Listo»');
  await B.click('#contactos-filas .contacto-quita'); await espera(300);
  comprueba(await B.evaluate(() => /Francis/.test(document.querySelector('#h-eliminar-t').textContent)), 'pregunta con el nombre: «¿Eliminar el chat con Francis?»', await B.evaluate(() => document.querySelector('#h-eliminar-t').textContent));
  await foto(B, '72-B-pregunta');
  await B.click('#eliminar-si'); await espera(1200);
  comprueba(await B.evaluate(() => window.gcomPrueba.cuantas() === 0), 'B: chat eliminado');
  comprueba(await hasta(A, () => window.gcomPrueba.cuantas() === 0, 6000), 'A: el chat se borra también en el otro teléfono');

  // 3. mantener pulsado un contacto: la misma pregunta
  await A.goto(URL0); await B.goto(URL0); await espera(1500);
  await conecta(A, B, 'Mamá', 'Francis');
  await B.click('#cvolver'); await espera(600);
  if (!(await B.$('#contactos:not([hidden])'))) { await B.click('#ver-contactos-inicio'); await espera(500); }
  const r = await B.evaluate(() => { const b = document.querySelector('#contactos-filas .contacto-abre').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
  await B.mouse.move(r.x, r.y); await B.mouse.down(); await espera(750); await B.mouse.up(); await espera(300);
  comprueba(await B.evaluate(() => document.querySelector('#h-eliminar').classList.contains('gc-abierta')) && await B.evaluate(() => document.querySelector('#conv').hidden), 'mantener pulsado: «¿Eliminar el chat?» (sin abrir el chat)');
  await B.click('#eliminar-no'); await espera(300);
  comprueba(await B.evaluate(() => window.gcomPrueba.cuantas() === 1), '«Cancelar» no borra nada');

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
