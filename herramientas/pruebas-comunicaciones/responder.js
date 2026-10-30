// Responder, reenviar, información, borrar y «↓ nuevos» (agencia, ronda 76, fase 3; dueño, 30 Oct 2026, 00:34: «aplica todo a
// vuestro gusto»). Tres teléfonos con Número GUARDIANA (A, B y C) contra el relé de pruebas:
//   1. B escribe a A; A mantiene pulsado el mensaje → el menú (Responder · Reenviar · Información · Borrar; sin «Copiar»).
//   2. «Responder»: la barra de respuesta, y el mensaje sale con la cita cifrada; B lo ve con «Tú» y el texto citado.
//   3. Deslizar un mensaje a la derecha también responde; tocar la cita salta al original.
//   4. «Reenviar» a C: a C le llega con la marca «Reenviado». «Información»: la hoja con hora y estado.
//   5. «Borrar para mí» lo quita aquí; «Borrar para todos» (un mensaje propio) lo quita en los dos.
//   6. Con el chat desplazado hacia arriba, lo que llega enseña «↓ nuevos»; al tocarlo, baja y desaparece.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'responder');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };
async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['microphone'] });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  await p.goto(URL0); await espera(2500); await p.click('#num-usar'); await espera(2500);
  return p;
}
const foto = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
const visible = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && r.width > 0 && r.height > 0; }, s);
const texto = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ''; }, s);
const marca = async (p, n) => { for (const d of n) await p.click('#teclado button[data-d="' + d + '"]'); };
const di = async (p, t) => { await p.fill('#texto', t); await p.click('#enviar'); await espera(900); };
// eventos de puntero sintéticos sobre la burbuja de un mensaje (por su texto)
const burbuja = (p, t) => p.evaluate((t) => { const li = [...document.querySelectorAll('#mensajes > li[data-id]')].find((l) => l.textContent.includes(t)); if (!li) return null; const b = li.querySelector('.gc-burbuja'); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, id: li.dataset.id }; }, t);
const pe = (p, tipo, x, y, extra, id) => p.evaluate(([tipo, x, y, extra, id]) => { const el = (id && document.querySelector('#mensajes li[data-id="' + id + '"] .gc-burbuja')) || document.elementFromPoint(x, y) || document.querySelector('#mensajes'); el.dispatchEvent(new PointerEvent(tipo, Object.assign({ bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, button: 0, buttons: tipo === 'pointerup' ? 0 : 1 }, extra || {}))); }, [tipo, x, y, extra, id]);
const mantiene = async (p, t) => { const b = await burbuja(p, t); if (!b) return false; await pe(p, 'pointerdown', b.x, b.y, null, b.id); await espera(650); await pe(p, 'pointerup', b.x, b.y, null, b.id); await espera(300); return true; };
const desliza = async (p, t) => { const b = await burbuja(p, t); if (!b) return false; await pe(p, 'pointerdown', b.x, b.y, null, b.id); for (let i = 1; i <= 6; i++) { await pe(p, 'pointermove', b.x + i * 16, b.y + 1, null, b.id); await espera(30); } await pe(p, 'pointerup', b.x + 96, b.y + 1, null, b.id); await espera(400); return true; };
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B'), C = await telefono(browser, 'C');
  const nA = await A.evaluate(() => window.gcomPruebaNumero.mio()), nB = await B.evaluate(() => window.gcomPruebaNumero.mio()), nC = await C.evaluate(() => window.gcomPruebaNumero.mio());
  const enlaza = async (X, Y, nY, nombreY, nX, nombreX) => {
    await X.click('#llamar-num'); await marca(X, nY); await X.click('#marcar-llamar'); await espera(400); await X.fill('#num-nombre', nombreY); await X.click('#num-anadir'); await espera(1500); await X.click('#num-espera-ok');
    await Y.click('#llamar-num'); await marca(Y, nX); await Y.click('#marcar-llamar'); await espera(400); await Y.fill('#num-nombre', nombreX); await Y.click('#num-anadir'); await espera(7000);
  };
  await enlaza(A, B, nB, 'Nathalie', nA, 'Fran');
  comprueba(await visible(A, '#conv') && await visible(B, '#conv'), 'A y B: el chat se abre en los dos');
  comprueba((await texto(A, '#cavatar-ini')) === 'N' && await visible(A, '#cavatar-ini'), 'cabecera: la inicial del nombre en el avatar (' + (await texto(A, '#cavatar-ini')) + ')');
  // 1. B escribe; A mantiene pulsado
  await di(B, 'Hola, ¿vienes a comer?'); await di(B, 'Hoy hay arroz'); await espera(1200);
  comprueba(await mantiene(A, '¿vienes a comer?') && await visible(A, '#mmenu'), 'mantener pulsado: se abre el menú del mensaje');
  const items = await A.evaluate(() => [...document.querySelectorAll('#mmenu button')].filter((b) => !b.hidden).map((b) => b.textContent.trim()));
  comprueba(items.join('·') === 'Responder·Información·Borrar', 'menú: Responder · Información · Borrar, sin «Copiar» (sin otro chat, sin «Reenviar»): ' + items.join(' · '));
  await foto(A, '01-A-menu');
  const sitio = await A.evaluate(() => { const m = document.querySelector('#mmenu').getBoundingClientRect(), l = document.querySelector('#lienzo').getBoundingClientRect(); return m.left >= l.left && m.right <= l.right && m.top >= l.top && m.bottom <= l.bottom; });
  comprueba(sitio, 'el menú cabe dentro del chat');
  // 2. Responder
  await A.click('#mm-responder'); await espera(300);
  comprueba(await visible(A, '#responde') && (await texto(A, '#responde-a')) === 'Nathalie' && /vienes a comer/.test(await texto(A, '#responde-t')), 'Responder: la barra con «Nathalie» y el texto citado');
  comprueba(await A.evaluate(() => document.querySelector('#mmenu').hidden), 'al elegir, el menú se cierra');
  await foto(A, '02-A-respondiendo');
  await di(A, 'Sí, llego a las dos'); await espera(1500);
  comprueba(await A.evaluate(() => document.querySelector('#responde').hidden), 'al enviar, la barra de respuesta se retira');
  const citaA = await A.evaluate(() => { const q = document.querySelector('#mensajes .gc-mia .gc-cita'); return q ? { de: q.querySelector('b').textContent, t: q.querySelector('span').textContent } : null; });
  comprueba(citaA && citaA.de === 'Nathalie' && /vienes a comer/.test(citaA.t), 'A ve su mensaje con la cita de Nathalie: ' + JSON.stringify(citaA));
  const citaB = await B.evaluate(() => { const q = document.querySelector('#mensajes .gc-suya .gc-cita'); return q ? { de: q.querySelector('b').textContent, t: q.querySelector('span').textContent } : null; });
  comprueba(citaB && citaB.de === 'Tú' && /vienes a comer/.test(citaB.t), 'B ve la respuesta con la cita «Tú» y su texto: ' + JSON.stringify(citaB));
  await foto(A, '03-A-cita'); await foto(B, '03-B-cita');
  // 3. deslizar para responder, y tocar la cita salta al original
  comprueba(await desliza(A, 'Hoy hay arroz') && await visible(A, '#responde') && /arroz/.test(await texto(A, '#responde-t')), 'deslizar el mensaje a la derecha: responde');
  await A.click('#responde-x'); await espera(200);
  comprueba(await A.evaluate(() => document.querySelector('#responde').hidden), 'la ✕ de la barra cancela la respuesta');
  await A.evaluate(() => document.querySelector('#mensajes .gc-cita').click()); await espera(500);
  comprueba(await A.evaluate(() => !!document.querySelector('#mensajes .gc-burbuja.gc-brilla')), 'tocar la cita: el original brilla un momento');
  // 4. Reenviar a C e Información
  await A.evaluate(() => document.querySelector('#cvolver').click()); await espera(600);
  await enlaza(A, C, nC, 'Carla', nA, 'Fran');
  comprueba(await visible(A, '#conv') && (await texto(A, '#cnombre')) === 'Carla', 'A abre el chat con Carla');
  await A.evaluate(() => document.querySelector('#cvolver').click()); await espera(600);
  await A.evaluate(() => { const b = [...document.querySelectorAll('#contactos-filas .contacto-abre')].find((x) => /Nathalie/.test(x.textContent)); b.click(); }); await espera(1200);
  comprueba((await texto(A, '#cnombre')) === 'Nathalie', 'A vuelve al chat con Nathalie');
  comprueba(await mantiene(A, 'Hoy hay arroz') && await visible(A, '#mm-reenviar'), 'con otro chat, el menú ofrece «Reenviar»');
  await A.click('#mm-reenviar'); await espera(400);
  comprueba(await visible(A, '#h-reenviar .gc-hoja-caja') && (await A.evaluate(() => [...document.querySelectorAll('#reenviar-lista .reenviar-a')].map((b) => b.textContent.trim()))).join() === 'CCarla', 'Reenviar: la hoja con el otro chat (Carla)');
  await foto(A, '04-A-reenviar');
  await A.click('#reenviar-lista .reenviar-a'); await espera(2500);
  const enC = await C.evaluate(() => { const li = [...document.querySelectorAll('#mensajes > li[data-id]')].find((l) => /arroz/.test(l.textContent)); return li ? { rv: !!li.querySelector('.gc-reenviado'), t: li.querySelector('.gc-texto').textContent } : null; });
  comprueba(enC && enC.rv && enC.t === 'Hoy hay arroz', 'a Carla le llega el mensaje con la marca «Reenviado»: ' + JSON.stringify(enC));
  await foto(C, '05-C-reenviado');
  comprueba(await mantiene(A, 'llego a las dos') && await visible(A, '#mmenu'), 'menú sobre un mensaje propio');
  await A.click('#mm-info'); await espera(400);
  const info = await A.evaluate(() => [...document.querySelectorAll('#info-msg dt, #info-msg dd')].map((e) => e.textContent.trim()));
  comprueba(await visible(A, '#h-info-msg .gc-hoja-caja') && info.includes('Tipo') && info.includes('Mensaje') && info.includes('Enviado') && info.includes('Estado') && (info.includes('Leído') || info.includes('Entregado')) && info.includes('Protección'), 'Información: tipo, hora, estado y protección: ' + info.join(' | '));
  await foto(A, '06-A-informacion');
  await A.click('#info-msg-ok'); await espera(300);
  // 5. Borrar
  comprueba(await mantiene(A, '¿vienes a comer?'), 'menú sobre el mensaje de Nathalie');
  await A.click('#mm-borrar'); await espera(400);
  comprueba(await visible(A, '#h-borrar-msg .gc-hoja-caja') && !(await visible(A, '#borrar-msg-todos')), 'Borrar (mensaje ajeno): solo «Borrar para mí»');
  await A.click('#borrar-msg-mi'); await espera(600);
  comprueba(!(await A.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].some((e) => /vienes a comer/.test(e.textContent)))), '«Borrar para mí»: desaparece de A');
  comprueba(await B.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].some((e) => /vienes a comer/.test(e.textContent))), '…y sigue en B');
  comprueba(await mantiene(A, 'llego a las dos'), 'menú sobre un mensaje propio (para borrar en los dos)');
  await A.click('#mm-borrar'); await espera(400);
  comprueba(await visible(A, '#borrar-msg-todos'), 'Borrar (mensaje propio): también «Borrar para todos»');
  await foto(A, '07-A-borrar');
  await A.click('#borrar-msg-todos'); await espera(1500);
  comprueba(!(await A.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].some((e) => /llego a las dos/.test(e.textContent)))) && !(await B.evaluate(() => [...document.querySelectorAll('#mensajes .gc-texto')].some((e) => /llego a las dos/.test(e.textContent)))), '«Borrar para todos»: desaparece en A y en B');
  comprueba(await B.evaluate(() => [...document.querySelectorAll('#mensajes .gc-nota-sistema')].some((e) => /borrado un mensaje/.test(e.textContent))), 'B ve la nota «ha borrado un mensaje en los dos equipos»');
  // 6. «↓ nuevos»
  for (let i = 1; i <= 24; i++) await di(B, 'Línea ' + i + ' de relleno para que el chat se desplace');
  await espera(1500);
  await A.evaluate(() => { document.querySelector('#mensajes').scrollTop = 0; }); await espera(400);
  comprueba(await A.evaluate(() => document.querySelector('#nuevos-abajo').hidden), 'desplazado arriba sin nada nuevo: sin «↓ nuevos»');
  await di(B, 'Esto llega con el chat arriba'); await di(B, 'Y esto también'); await espera(1200);
  comprueba(await visible(A, '#nuevos-abajo') && (await texto(A, '#nuevos-n')) === '2', '«↓ nuevos» con el 2 (' + (await texto(A, '#nuevos-n')) + ')');
  await foto(A, '08-A-nuevos');
  await A.click('#nuevos-abajo'); await espera(900);
  comprueba(await A.evaluate(() => { const u = document.querySelector('#mensajes'); return document.querySelector('#nuevos-abajo').hidden && u.scrollHeight - u.scrollTop - u.clientHeight < 40; }), 'al tocarlo, baja al final y desaparece');
  // una respuesta más (la anterior se borró en los dos) y, tras recargar, la cita y la marca de reenviado se conservan
  comprueba(await mantiene(A, 'Y esto también') && await visible(A, '#mmenu'), 'menú sobre el último mensaje');
  await A.click('#mm-responder'); await espera(300); await di(A, 'Vale, lo veo'); await espera(1500);
  comprueba(await B.evaluate(() => { const q = document.querySelector('#mensajes .gc-suya .gc-cita'); return !!q && /esto también/.test(q.textContent); }), 'B recibe la segunda respuesta con su cita');
  await C.reload(); await espera(4000);
  comprueba(await C.evaluate(() => !!document.querySelector('#mensajes .gc-reenviado')), 'tras recargar, C conserva la marca «Reenviado»');
  await B.reload(); await espera(4000);
  comprueba(await B.evaluate(() => !!document.querySelector('#mensajes .gc-cita')), 'tras recargar, B conserva la cita');
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
