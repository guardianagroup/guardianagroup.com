// Llamar con el Número GUARDIANA (dueño, 29 Oct 2026, 23:22: «he probado de llamarme con mi mujer y no llama»).
// Dos teléfonos con la app (A y B) contra el relé de pruebas: se añaden los dos, el chat se abre solo y luego:
//   1. A llama desde el chat → a B le suena («Contestar») y hablan.
//   2. A vuelve al inicio, «Llamar», teclea el número de B (ya contacto) → a B le suena.
//   3. B sale del chat al inicio (sigue con la app abierta) y A llama desde «Mis chats» → a B le suena igual.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'numero-llamada');
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
  return p;
}
const foto = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && r.width > 0 && r.height > 0; }, s);
const marca = async (p, n) => { for (const d of n) await p.click('#teclado button[data-d="' + d + '"]'); };
const suena = async (p, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await visible(p, '#ll-contestar')) return true; await espera(300); } return false; };
const cuelga = async (p) => { await p.evaluate(() => { const b = document.querySelector('#ll-colgar'); if (b) b.click(); }); await espera(1500); };
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B');
  await A.goto(URL0); await B.goto(URL0); await espera(2500);
  await A.click('#num-usar'); await B.click('#num-usar'); await espera(2500);
  const numA = await A.evaluate(() => window.gcomPruebaNumero.mio()), numB = await B.evaluate(() => window.gcomPruebaNumero.mio());
  await A.click('#llamar-num'); await espera(300); await marca(A, numB); await A.click('#marcar-llamar'); await espera(400);
  await A.fill('#num-nombre', 'Mi mujer'); await A.click('#num-anadir'); await espera(2000); await A.click('#num-espera-ok'); await espera(300);
  await B.click('#llamar-num'); await espera(300); await marca(B, numA); await B.click('#marcar-llamar'); await espera(400);
  await B.fill('#num-nombre', 'Mi marido'); await B.click('#num-anadir'); await espera(7000);
  comprueba(await visible(A, '#conv') && await visible(B, '#conv'), 'se añaden los dos: el chat se abre en los dos');
  // 1. desde el chat
  await A.click('#llamar'); const s1 = await suena(B, 15000);
  comprueba(s1, '1. A llama desde el chat: a B le suena');
  await foto(A, '01-A-llamando'); await foto(B, '01-B-suena');
  if (s1) { await B.click('#ll-contestar'); await espera(5000); comprueba(/^\d\d:\d\d$/.test((await A.textContent('#ll-tiempo')).trim()) && (await A.textContent('#ll-tiempo')).trim() !== '00:00', '1. contestan: la llamada está en curso (' + (await A.textContent('#ll-tiempo')).trim() + ')'); await foto(A, '02-A-en-curso'); }
  await cuelga(A); await espera(1500);
  // 2. desde «Llamar», tecleando el número de B
  await A.evaluate(() => { const b = document.querySelector('#cvolver'); if (b) b.click(); }); await espera(800);
  if (await visible(A, '#contactos-atras')) { await A.click('#contactos-atras'); await espera(400); }
  await A.click('#llamar-num'); await espera(300); await marca(A, numB); await A.click('#marcar-llamar');
  const s2 = await suena(B, 20000);
  comprueba(s2, '2. A teclea el número de B en «Llamar»: a B le suena');
  await foto(A, '03-A-desde-llamar'); await foto(B, '03-B-suena');
  await cuelga(A); if (await visible(B, '#ll-colgar')) await cuelga(B); await espera(1500);
  // 3. B sale al inicio (app abierta); A llama desde «Mis chats»
  await B.evaluate(() => { const b = document.querySelector('#cvolver'); if (b) b.click(); }); await espera(800);
  await A.evaluate(() => { const b = document.querySelector('#cvolver'); if (b) b.click(); }); await espera(800);
  if (!(await visible(A, '#contactos-filas'))) { await A.click('#ver-contactos').catch(() => {}); await espera(500); }
  const boton = await A.$('#contactos-filas button[data-acto="voz"], #contactos-filas button[data-acto]:not([data-acto="video"]):not([data-acto="quita"])');
  if (boton) await boton.click(); else { if (await visible(A, '#contactos-atras')) await A.click('#contactos-atras'); await A.click('#llamar-num'); await espera(300); await marca(A, numB); await A.click('#marcar-llamar'); }
  const s3 = await suena(B, 25000);
  comprueba(s3, '3. con B en el inicio, A llama: a B le suena');
  await foto(A, '04-A'); await foto(B, '04-B');
  await cuelga(A); if (await visible(B, '#ll-colgar')) await cuelga(B); await espera(1500);
  // 3b. con B en el inicio, A escribe dos mensajes: «Mis chats» de B dice 2 (dueño, 29 Oct 2026, 23:41)
  if (await visible(B, '#contactos-atras')) { await B.click('#contactos-atras'); await espera(400); }
  if (!(await visible(A, '#texto'))) { await A.evaluate(() => { const b = document.querySelector('#contactos-filas .contacto button[data-id]:not([data-acto])') || document.querySelector('#contactos-filas .contacto'); if (b) b.click(); }); await espera(800); }
  await A.fill('#texto', 'Hola'); await A.click('#enviar'); await espera(800); await A.fill('#texto', '¿Me oyes?'); await A.click('#enviar'); await espera(2500);
  const misN = await B.evaluate(() => { const i = document.querySelector('#ver-contactos .mis-n'); return i && !i.hidden ? i.textContent : ''; });
  comprueba(misN === '2', '3b. B en el inicio: «Mis chats» con el número de mensajes nuevos (' + misN + ')');
  await foto(B, '04b-B-mis-chats-2');
  // 4. B cierra la app: desde «Llamar», A avisa a B en su teléfono (no solo un mensaje en pantalla)
  await B.close(); await espera(3000);
  await A.evaluate(() => { const b = document.querySelector('#cvolver'); if (b) b.click(); }); await espera(600);
  if (await visible(A, '#contactos-atras')) { await A.click('#contactos-atras'); await espera(400); }
  await A.click('#llamar-num'); await espera(300); await marca(A, numB); await A.click('#marcar-llamar'); await espera(1200);
  const txt = await A.evaluate(() => document.body.innerText);
  comprueba(/Avisando a la otra persona|no tiene los avisos/.test(txt), '4. con la app de B cerrada, «Llamar» avisa a B y espera a que abra');
  await foto(A, '05-A-avisando');
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  await browser.close();
})();
