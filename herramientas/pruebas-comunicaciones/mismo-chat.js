// Una persona ya guardada es «el mismo chat de siempre» (dueño, 29 Oct 2026, 12:53–12:56): si llega una invitación nueva de alguien
// que ya es contacto, no se pregunta otra vez «¿Guardar como contacto?», el chat hereda el nombre y lo hablado, y en la lista y en
// Contactos sigue habiendo una sola conversación con esa persona. También: el blindado va «próximamente» y la hoja de invitar
// solo deja el chat normal.
// Usage: node mismo-chat.js <outdir>
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
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
const hasta = async (p, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await p.evaluate(fn)) return true; await espera(150); } return false; };

async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES' });
  // el Número GUARDIANA, apagado en esta prueba (invitaciones; 29 Oct 2026, 23:07: en el móvil sin la app, el inicio es «Añadir a la pantalla de inicio»)
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  // como en el teléfono: hay menú de compartir (se simula: «compartido» a los 300 ms) y la app está en la pantalla de inicio
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} try { navigator.share = () => new Promise((r) => setTimeout(r, 300)); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return p;
}
const foto = async (p, n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); };
const estado = (p) => p.evaluate(() => { const c = window.gcomPrueba && window.gcomPrueba.conv(); return { convs: window.gcomPrueba ? window.gcomPrueba.cuantas() : -1, contacto: !!(c && c.contacto), alias: c ? c.alias : null, huella: !!(c && c.huella), textos: [...document.querySelectorAll('#mensajes .gc-burbuja, #mensajes .burbuja, #mensajes li')].map((x) => x.textContent.trim()).filter(Boolean), pregunta: !!document.querySelector('#ccontacto') && !document.querySelector('#ccontacto').hidden, titulo: document.querySelector('#cnombre') && document.querySelector('#cnombre').textContent.trim() }; });
async function invita(A) {
  await A.click('#nueva-blindada'); await espera(400);
  if (await A.$('#h-invitar.gc-abierta')) {
    // la hoja: el blindado, apagado y «próximamente»; se sigue con «Otras apps»
    const pronto = await A.evaluate(() => { const b = document.querySelector('#tipo-blindado'); return { texto: b.textContent, apagado: b.getAttribute('aria-disabled') === 'true' }; });
    comprueba(/Próximamente/.test(pronto.texto) && pronto.apagado, 'Hoja de invitar: «Chat blindado · Próximamente», sin poder elegirlo');
    await A.evaluate(() => document.querySelector('#tipo-blindado').click()); await espera(300);
    comprueba(await A.evaluate(() => document.querySelector('#tipo-normal').getAttribute('aria-checked') === 'true'), 'Al tocar el blindado sigue marcado el normal');
    await foto(A, '60-hoja-invitar');
    await A.click('#invitar-otra');
  }
  await espera(2500);
  // tras compartir, quien invita ya está en el chat, esperando (12:50)
  comprueba(await A.evaluate(() => !document.querySelector('#conv').hidden), 'Tras compartir, quien invita espera dentro del chat');
  const enlace = await A.evaluate(() => window.gcomPrueba.enlace());
  comprueba(!!enlace && /#i=/.test(enlace), 'La invitación es normal (#i=)');
  return enlace;
}

(async () => {
  const browser = await chromium.launch();
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B');
  await A.goto(URL0); await espera(1500);
  const enlace1 = await invita(A);
  if (!enlace1) { console.log('sin enlace'); await browser.close(); process.exit(1); }
  await B.goto(enlace1.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(2000);
  if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si');
  comprueba(await hasta(A, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella); }, 12000), 'A: conversación 1 establecida');
  comprueba(await hasta(B, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella); }, 12000), 'B: conversación 1 establecida');
  await espera(800);
  await A.fill('#texto', 'Hola, soy yo'); await A.click('#enviar');
  comprueba(await hasta(B, () => document.querySelector('#mensajes').textContent.includes('Hola, soy yo'), 8000), 'B recibe el primer mensaje');
  // los dos guardan el contacto
  for (const [X, n] of [[A, 'Mi mujer'], [B, 'Francis']]) {
    comprueba(await hasta(X, () => { const s = document.querySelector('#ccontacto'); return !!s && !s.hidden; }, 6000), n + ': se ofrece guardar el contacto la primera vez');
    await X.evaluate(() => document.querySelector('#ccontacto-si').click()); await espera(500);
    await X.fill('#nombre-conv', n); await X.click('#nombre-guardar'); await espera(800);
  }
  const a1 = await estado(A), b1 = await estado(B);
  comprueba(a1.contacto && a1.alias === 'Mi mujer' && b1.contacto && b1.alias === 'Francis', 'Contactos guardados en los dos (' + a1.alias + ' / ' + b1.alias + ')');
  // segunda invitación, de A a B, con los dos ya guardados
  await A.click('#cvolver'); await espera(600); if (await A.$('#contactos-atras:visible')) { await A.click('#contactos-atras'); await espera(500); }
  console.log('A tras volver:', JSON.stringify(await A.evaluate(() => ({ inicio: document.querySelector('#inicio').className, inicioHidden: document.querySelector('#inicio').hidden, paso: document.querySelector('#paso-inicio').hidden, body: document.body.className, lista: document.querySelector('#lista') && !document.querySelector('#lista').hidden }))));
  await foto(A, '60b-A-inicio');
  const enlace2 = await invita(A);
  comprueba(!!enlace2 && enlace2 !== enlace1, 'A crea una segunda invitación');
  await B.goto(enlace2.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(2000);
  if (await B.$('#aceptar-si:visible')) await B.click('#aceptar-si');
  comprueba(await hasta(A, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella) && window.gcomPrueba.cuantas() === 1; }, 15000), 'A: la invitación nueva es el mismo chat (una sola conversación)');
  comprueba(await hasta(B, () => { const c = window.gcomPrueba.conv(); return !!(c && c.huella) && window.gcomPrueba.cuantas() === 1; }, 15000), 'B: la invitación nueva es el mismo chat (una sola conversación)');
  await espera(1500);
  const a2 = await estado(A), b2 = await estado(B);
  comprueba(a2.contacto && a2.alias === 'Mi mujer' && !a2.pregunta, 'A: sigue siendo «Mi mujer», sin volver a preguntar si guardar (' + JSON.stringify({ alias: a2.alias, pregunta: a2.pregunta }) + ')');
  comprueba(b2.contacto && b2.alias === 'Francis' && !b2.pregunta, 'B: sigue siendo «Francis», sin volver a preguntar (' + JSON.stringify({ alias: b2.alias, pregunta: b2.pregunta }) + ')');
  comprueba(await A.evaluate(() => document.querySelector('#mensajes').textContent.includes('Hola, soy yo')), 'A: lo hablado antes sigue en el chat');
  comprueba(await B.evaluate(() => document.querySelector('#mensajes').textContent.includes('Hola, soy yo')), 'B: lo hablado antes sigue en el chat');
  await A.fill('#texto', 'Y seguimos aquí'); await A.click('#enviar');
  comprueba(await hasta(B, () => document.querySelector('#mensajes').textContent.includes('Y seguimos aquí'), 8000), 'B recibe el mensaje nuevo por el chat de siempre');
  await foto(A, '61-A-mismo-chat'); await foto(B, '62-B-mismo-chat');
  // Contactos: una sola fila
  await B.click('#cvolver'); await espera(600);
  if (!(await B.$('#contactos-filas')) || !(await B.$('#contactos-filas:visible'))) if (await B.$('#ver-contactos:visible')) { await B.click('#ver-contactos'); await espera(600); }
  const filas = await B.evaluate(() => document.querySelectorAll('#contactos-filas button[data-id]:not([data-acto])').length);
  comprueba(filas === 1, 'B: en Contactos hay una sola fila (' + filas + ')');
  await foto(B, '63-B-contactos');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN'); process.exit(fallos.length ? 1 : 0);
})();
