// Contacts: save each other with a name, go back to the list, call from the list, survive reloads and new invitations;
// «Pegar invitación» in the installed app.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'contactos');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['microphone', 'camera', 'clipboard-read', 'clipboard-write'] });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  p.on('console', (m) => { if (m.type() === 'error') console.log('[' + nombre + '] ' + m.text().slice(0, 200)); });
  return p;
}
const foto = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 0 && r.height > 0; }, s);
async function conecta(A, B) {
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(2500);
  const enlace = await A.evaluate(() => document.querySelector('#enlace-b').value);
  return enlace.replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
}
async function guarda(p, nombre) {
  comprueba(await visible(p, '#ccontacto'), 'la tira «Guárdalo como contacto» sale en el chat');
  await p.click('#ccontacto-si'); await espera(300);
  await p.fill('#nombre-conv', nombre); await p.click('#nombre-guardar'); await espera(500);
  comprueba(!(await visible(p, '#ccontacto')), 'guardado: la tira desaparece');
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B');
  await A.goto(URL0); await B.goto(URL0); await espera(1500);
  comprueba(!(await A.$('#pegar-inv')), 'app: sin «Pegar invitación»');
  // B entra pegando el enlace en la app (como haría la esposa)
  const enlace = await conecta(A, B);
  comprueba(!(await A.$('#enlace-whatsapp')) && !(await A.$('#enlace-copiar-2')), 'invitación: sin botones de más');
  await foto(A, '01-A-invitacion');
  await B.goto(enlace); await espera(1500); await B.click('#aceptar-si'); await espera(5000);
  comprueba(await visible(B, '#conv') && await visible(A, '#conv'), 'abriendo el enlace y aceptando, los dos dentro del chat');
  comprueba(!(await B.evaluate(() => document.body.classList.contains('modo-invitado'))), 'en la app nadie queda como invitado');
  await foto(A, '02-A-chat');
  await guarda(A, 'Mi mujer'); await guarda(B, 'Mi marido');
  await foto(A, '03-A-guardado');
  // volver a los contactos
  comprueba(await visible(A, '#cvolver'), 'con contactos, «‹» en la cabecera');
  await A.click('#cvolver'); await espera(600);
  comprueba(await visible(A, '#contactos') && !(await visible(A, '#conv')), '«‹» lleva a los contactos');
  const fila = await A.evaluate(() => [...document.querySelectorAll('#contactos-filas .contacto')].map((li) => li.textContent.trim()));
  comprueba(fila.length === 1 && /Mi mujer/.test(fila[0]) && /En línea/.test(fila[0]), 'la fila: «Mi mujer» · En línea (' + fila.join(' | ') + ')');
  await foto(A, '04-A-contactos');
  // llamar desde la lista
  // (28 Oct, 21:50, se quitó la llamada de voz; el 29 Oct vuelve: «la llamada normal sí que funciona» (12:54), con los dos botones)
  comprueba(!!(await A.$('#contactos-filas .contacto-b[data-acto="voz"]')) && !!(await A.$('#contactos-filas .contacto-b[data-acto="video"]')), 'en Contactos, llamada de voz y videollamada');
  await A.click('#contactos-filas .contacto-b[data-acto="video"]'); await espera(2500);
  comprueba(await visible(B, '#ll-contestar'), 'llamando desde la lista: a la otra persona le suena');
  const quien = await B.evaluate(() => document.querySelector('#ll-nombre').textContent);
  comprueba(quien === 'Mi marido', 'le sale el nombre que ella le puso (' + quien + ')');
  await B.click('#ll-contestar'); await espera(3500);
  comprueba(await A.evaluate(() => /\d\d:\d\d/.test(document.querySelector('#ll-tiempo').textContent) && !document.querySelector('#ll-tiempo').hidden), 'llamada en curso');
  await foto(A, '05-A-llamada');
  await A.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500); // en la videollamada los botones se esconden solos
  // recargar: los contactos se quedan; se arranca en el inicio con los dos botones y «Contactos» lleva a la lista (29 Oct, 07:37)
  await A.reload(); await espera(3500);
  comprueba(await visible(A, '#nueva-blindada') && await visible(A, '#ver-contactos') && !(await visible(A, '#contactos')) && !(await visible(A, '#conv')), 'al abrir la app: el inicio con «Invitar a chat» y «Contactos»');
  await A.click('#ver-contactos'); await espera(400);
  const fila2 = await A.evaluate(() => [...document.querySelectorAll('#contactos-filas .contacto')].map((li) => li.textContent.trim()));
  comprueba(await visible(A, '#contactos') && fila2.length === 1 && /Mi mujer/.test(fila2[0]) && !(await visible(A, '#nueva-blindada')), '«Contactos»: la lista, sin los botones del inicio');
  await foto(A, '05b-A-contactos');
  await A.click('#contactos-atras'); await espera(400);
  comprueba(await visible(A, '#nueva-blindada') && !(await visible(A, '#contactos')), '«‹» vuelve al inicio');
  // una invitación nueva no borra el contacto (ni pregunta)
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(2000);
  comprueba(!(await visible(A, '#h-nueva .gc-hoja-caja')), 'invitación nueva sin la pregunta de borrar');
  const n = await A.evaluate(() => [...window.GuardianaCom.convs.values()].filter((c) => c.contacto).length);
  comprueba(n === 1, 'el contacto sigue guardado tras una invitación nueva');
  await foto(A, '06-A-nueva');
  await browser.close();
  console.log(fallos.length ? fallos.length + ' FALLOS: ' + fallos.join(' · ') : 'TODO BIEN');
})().catch((e) => { console.error(e); process.exit(1); });
