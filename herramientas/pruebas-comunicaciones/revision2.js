// Recorre todas las pantallas del teléfono tras la revisión de diseño (393 × 793, como un iPhone 16 con la barra de estado opaca).
// navigator.share se simula como en el iPhone: guarda el enlace y responde «compartido» (o «cancelado» si se pide).
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'revision2');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt); if (!ok) fallos.push(txt); };
async function telefono(browser, app = true) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((app) => {
    if (app) { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} }
    window.__compartidos = []; window.__cancelaCompartir = false;
    navigator.share = (d) => { window.__compartidos.push(d); return new Promise((res, rej) => setTimeout(() => (window.__cancelaCompartir ? rej(new DOMException('cancelado', 'AbortError')) : res()), 400)); };
  }, app);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + String(e).slice(0, 80)); });
  return p;
}
const foto = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
const visible = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return !!(r.width && r.height) && getComputedStyle(e).visibility !== 'hidden'; }, sel);
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser), B = await telefono(browser);
  await A.goto(URL0); await B.goto(URL0); await espera(1800);
  await foto(A, '01-inicio');
  comprueba((await A.textContent('#nueva-blindada b')).includes('Invitar a chat'), 'el botón dice «Invitar a chat»');
  // el menú de idiomas
  await A.click('.idiomas .idioma-actual'); await espera(350); await foto(A, '01b-idiomas');
  const anchoMenu = await A.evaluate(() => document.querySelector('.idioma-menu').getBoundingClientRect().width);
  comprueba(anchoMenu < 280, 'el menú de idiomas es compacto (' + Math.round(anchoMenu) + ' px)');
  await A.mouse.click(200, 600); await espera(300);
  // cancelar el menú de compartir: no queda nada a medias
  await A.evaluate(() => { window.__cancelaCompartir = true; });
  await A.click('#nueva-blindada'); await espera(1500);
  comprueba(!(await visible(A, '#paso-enlace')), 'al cancelar compartir, sigue el inicio (sin segunda pantalla)');
  comprueba(await A.evaluate(() => !document.querySelector('#inicio').hidden), 'al cancelar, el inicio a la vista');
  // invitar de verdad
  await A.evaluate(() => { window.__cancelaCompartir = false; });
  await A.click('#nueva-blindada'); await espera(900);
  await foto(A, '02-tras-compartir');
  comprueba(!(await visible(A, '#paso-enlace')), 'tras compartir, sin pantalla de espera');
  const avisoTxt = await A.evaluate(() => { const a = document.querySelector('#aviso'); return a && !a.hidden ? a.textContent : ''; });
  comprueba(/Invitación enviada/.test(avisoTxt), 'aviso «Invitación enviada» (' + avisoTxt + ')');
  const datos = await A.evaluate(() => window.__compartidos[window.__compartidos.length - 1]);
  const enlace = String(datos.url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  comprueba(/#b=/.test(enlace), 'se compartió el enlace');
  await B.goto(enlace); await espera(1500); await foto(B, '04-aceptar');
  await B.click('#aceptar-si'); await espera(5000);
  comprueba(await A.evaluate(() => !document.querySelector('#conv').hidden), 'el chat se abrió solo al entrar la otra persona');
  for (const [p, t] of [[A, 'Hola, ¿qué tal?'], [B, 'Muy bien, ¿y tú?'], [A, 'Te mando el contrato ahora'], [B, 'Perfecto, gracias']]) { await p.tap('#texto'); await p.fill('#texto', t); await p.click('#enviar'); await espera(600); }
  await A.evaluate(() => document.activeElement && document.activeElement.blur()); await espera(500);
  await foto(A, '05-chat');
  comprueba(!(await visible(A, '#vaciar')), 'sin papelera en la barra de escribir');
  await A.tap('#texto'); await A.setViewportSize({ width: 393, height: 793 - 336 }); await espera(700); await foto(A, '06-chat-teclado');
  await A.evaluate(() => document.activeElement && document.activeElement.blur()); await A.setViewportSize({ width: 393, height: 793 }); await espera(600);
  await A.click('#cmas'); await espera(400); await foto(A, '07-menu');
  comprueba(await visible(A, '#cm-vaciar'), '«Borrar el chat» en el menú ⋯');
  await A.mouse.click(200, 500); await espera(300);
  await A.tap('#adjuntar'); await espera(500); await foto(A, '08-clip');
  comprueba(await visible(A, '#adj-cancelar'), '«Cancelar» en el clip');
  await A.click('#adj-cancelar'); await espera(300);
  comprueba(await A.evaluate(() => document.querySelector('#adjuntos').hidden), '«Cancelar» cierra el clip');
  // contactos
  await A.click('#ccontacto-si'); await A.fill('#nombre-conv', 'Mi mujer'); await A.click('#nombre-guardar'); await espera(400);
  await foto(A, '08b-contacto-guardado');
  await B.click('#ccontacto-si'); await B.fill('#nombre-conv', 'Mi marido'); await B.click('#nombre-guardar'); await espera(400);
  await A.click('#cvolver'); await espera(900); await foto(A, '09-contactos');
  // llamada de voz
  await A.click('#contactos-filas .contacto-b[data-acto="voz"]'); await espera(2500);
  await foto(B, '10-llamada-entrante');
  comprueba(await B.evaluate(() => document.querySelector('#aviso').hidden), 'ningún aviso tapa la llamada que entra');
  await B.click('#ll-contestar'); await espera(4000);
  await foto(A, '11-llamada-voz');
  const pistas = await A.evaluate(() => { const s = document.querySelector('#a-remoto').srcObject; return s ? s.getAudioTracks().length : 0; });
  const pistasB = await B.evaluate(() => { const s = document.querySelector('#a-remoto').srcObject; return s ? s.getAudioTracks().length : 0; });
  comprueba(pistas === 2 && pistasB === 2, 'el sonido que llega trae dos pistas de audio (voz y muda) en los dos lados: ' + pistas + ' y ' + pistasB);
  await A.click('#ll-colgar'); await espera(1600);
  // videollamada, con el botón «Altavoz» a la vista (como en el iPhone) para ver cinco botones
  await A.click('#videollamar').catch(async () => { await A.click('#contactos-filas .contacto-b[data-acto="video"]'); }); await espera(2500);
  if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar'); await espera(5000);
  await A.evaluate(() => { document.querySelector('#ll-altavoz-caja').hidden = false; });
  await A.mouse.move(200, 300); await A.touchscreen.tap(30, 420).catch(() => {}); await espera(400);
  await foto(A, '12-video-partida');
  const dentro = await A.evaluate(() => [...document.querySelectorAll('#ll-botones .gc-llamada-boton')].filter((b) => b.offsetWidth).every((b) => { const r = b.querySelector('button').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }));
  comprueba(dentro, 'los cinco botones de la videollamada caben en la pantalla');
  await A.click('#ll-tam').catch(() => {}); await espera(900); await foto(A, '13-video-completa');
  await A.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500);
  // la guía, en Safari (sin instalar)
  const S = await telefono(browser, false); await S.goto('http://127.0.0.1:8080/orbita/comunicaciones/?instalar'); await espera(1800); await foto(S, '14-guia-instalar');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'todo bien', '·', fs.readdirSync(OUT).length, 'capturas en', OUT);
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
