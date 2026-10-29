// «Invitar a chat» en el iPhone: «WhatsApp» abre la app entera con la invitación ya escrita (el mensaje sale al momento) u «Otra app»
// (el menú de compartir). Dueño, 28 Oct 2026, 20:52–20:56: «las invitaciones llegan como 5 minutos tarde… si yo entro a WhatsApp,
// llega al momento. Esto hay que arreglarlo». Chromium no tiene WhatsApp: el enlace whatsapp:// se lee de la petición que intenta, y la
// ida y vuelta a WhatsApp se simula con visibilitychange. Como la app instalada en la pantalla de inicio.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'whatsapp');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function telefono(browser, ua) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: ua, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => { window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage(); p.__wa = [];
  p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  p.on('request', (r) => { if (r.url().startsWith('whatsapp:')) p.__wa.push(r.url()); }); // Chromium intenta abrir whatsapp:// y lo deja ver aquí
  return p;
}
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden'); }, s);
const aviso = (P) => P.evaluate(() => { const a = document.querySelector('#aviso'); return a && !a.hidden ? a.textContent : ''; });
// ir a WhatsApp y volver
const sale = (P) => P.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
const vuelve = (P) => P.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser, IPHONE);
  await A.goto(URL0); await espera(1800);

  // 1. la hoja: WhatsApp, Otras apps y Cancelar
  await A.click('#nueva-blindada'); await espera(500);
  comprueba(await visible(A, '#h-invitar'), 'iPhone: «Invitar a chat» abre la hoja');
  comprueba(await A.evaluate(() => window.__compartidos.length === 0), 'el menú de compartir aún no se abre');
  await A.screenshot({ path: path.join(OUT, '1-hoja.png') });
  await A.click('#invitar-no'); await espera(400);
  comprueba(!(await visible(A, '#h-invitar')), '«Cancelar» cierra la hoja');

  // 2. «WhatsApp»: se abre con la invitación ya escrita
  await A.click('#nueva-blindada'); await espera(400);
  await A.click('#invitar-wa'); await espera(900);
  const wa = A.__wa[A.__wa.length - 1] || '';
  const texto = decodeURIComponent((/text=([^&]*)/.exec(wa) || [])[1] || '');
  console.log('     whatsapp:', texto.replace(/#b=.*/, '#b=…'));
  comprueba(/^whatsapp:\/\/send\?text=/.test(wa), 'abre whatsapp://send con el texto');
  comprueba(/^Invitación a un chat de GUARDIANA\n(https:\/\/guardianagroup\.com|http:\/\/127\.0\.0\.1:8080)\/orbita\/comunicaciones\/#i=[A-Za-z0-9_-]{43}$/.test(texto), 'el texto: la frase y el enlace del chat normal (el de entrada)');
  comprueba(await visible(A, '#h-invitar'), 'mientras WhatsApp no se abre, la hoja sigue');
  // otro toque en «WhatsApp»: la misma invitación (no se crea otra que dejaría el primer enlace sin valor)
  await A.click('#invitar-wa'); await espera(900);
  comprueba(A.__wa[A.__wa.length - 1] === wa, 'un segundo toque repite el mismo enlace');
  // se va a WhatsApp y vuelve
  await sale(A); await espera(300);
  comprueba(!(await visible(A, '#h-invitar')), 'al irse a WhatsApp, la hoja se cierra');
  await vuelve(A); await espera(400);
  // 29 Oct 2026, 10:38 (dueño): al volver de WhatsApp NO se abre el chat (desde WhatsApp no se sabe si se envió o se canceló): el
  // inicio tal cual, con la invitación en la lista como «Invitación enviada»; el chat se abre cuando la otra persona entra
  const fila = await A.evaluate(() => { const f = document.querySelector('#lista-filas .fila-conv small'); return f ? f.textContent : ''; });
  comprueba(!(await visible(A, '#texto')) && /Invitación enviada|esperando a la otra persona/.test(fila), 'al volver: el inicio, sin abrir el chat; la invitación en la lista, esperando (10:38)', fila);
  await A.screenshot({ path: path.join(OUT, '2-vuelta.png') });

  // 3. la otra persona abre el enlace que le llegó por WhatsApp: el chat se abre en los dos
  const B = await telefono(browser, IPHONE);
  await B.goto(texto.split('\n')[1].replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(1500);
  await B.click('#aceptar-si'); await espera(5000);
  const chatA = await visible(A, '#texto'), chatB = await visible(B, '#texto');
  comprueba(chatA && chatB, 'con el enlace de WhatsApp, el chat se abre en los dos', [chatA, chatB]);
  await A.screenshot({ path: path.join(OUT, '3-chat.png') });

  // 4. si WhatsApp no se abre (no está instalado, o se cancela): se dice, sin dejar nada a medias
  const C = await telefono(browser, IPHONE);
  await C.goto(URL0); await espera(1500);
  await C.click('#nueva-blindada'); await espera(400); await C.click('#invitar-wa');
  await espera(6800);
  comprueba(/No se pudo abrir WhatsApp/.test(await aviso(C)), 'sin WhatsApp: «No se pudo abrir WhatsApp.»', await aviso(C));
  comprueba(await visible(C, '#h-invitar'), 'y la hoja sigue para elegir «Otras apps»');
  await C.click('#invitar-otra'); await espera(900);
  comprueba(await C.evaluate(() => window.__compartidos.length === 1), '«Otras apps»: el menú de compartir del teléfono');
  comprueba(!(await visible(C, '#h-invitar')), 'y la hoja se cierra');

  // 5. Android: la misma hoja (29 Oct 2026, 07:49: normal o blindado, y WhatsApp u «Otras apps»)
  const D = await telefono(browser, ANDROID);
  await D.goto(URL0); await espera(1500);
  await D.click('#nueva-blindada'); await espera(600);
  comprueba(await visible(D, '#h-invitar'), 'Android: la misma hoja, con el tipo de chat');
  await D.click('#tipo-blindado'); await D.click('#invitar-wa'); await espera(900);
  const waD = decodeURIComponent((/text=([^&]*)/.exec(D.__wa[D.__wa.length - 1] || '') || [])[1] || '');
  comprueba(/^Invitación a un chat blindado de GUARDIANA\n.*#b=[A-Za-z0-9_-]{43}$/.test(waD), 'Android, blindado por WhatsApp: la frase y el enlace «#b=»', waD.split('\n')[0]);

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
