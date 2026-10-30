// Pasar la videollamada del PC al teléfono (dueño, 30 Oct 2026, 12:56–13:14; agencia, ronda 79).
// A (PC) en videollamada con B (teléfono). A pulsa «Pasar al teléfono»: sale un código. T (el teléfono de A) abre la dirección
// del código (lo que hace la cámara del teléfono):
//   1. T contesta solo, sin cuenta ni número; B sigue la llamada con T; A sale de la llamada y se queda en el chat.
//   2. En T: una sola pantalla con «Colgar» y el aviso de cierre; nada guardado (ni base de datos ni conversaciones).
//   3. Si la llamada se corta, en T sale «Volver a llamar» y la llamada vuelve (B contesta).
//   4. T cuelga: a B se le termina; en T queda «Llamada terminada» y la llave se borra de la pestaña.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'llevar');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, pc, nombre, standalone) {
  const ctx = await browser.newContext({ viewport: pc ? { width: 1280, height: 800 } : { width: 393, height: 852 }, deviceScaleFactor: pc ? 1 : 2, isMobile: !pc, hasTouch: !pc, userAgent: pc ? PC : IPHONE, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript((sa) => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); }; if (sa) { try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {} }
    // para la prueba 3: poder cortar la conexión de la llamada desde fuera
    const Orig = window.RTCPeerConnection; window.__pcs = []; window.RTCPeerConnection = function (...a) { const p = new Orig(...a); window.__pcs.push(p); return p; }; window.RTCPeerConnection.prototype = Orig.prototype; Object.setPrototypeOf(window.RTCPeerConnection, Orig);
  }, standalone !== false);
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 200)); fallos.push('pageerror ' + nombre); });
  return { p, ctx };
}
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]')); }, s);
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(400); } return false; };
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const BPC = process.env.B_PC === '1';
  const { p: A } = await equipo(browser, true, 'A'), { p: B } = await equipo(browser, BPC, 'B');
  const { p: T, ctx: ctxT } = await equipo(browser, false, 'T', false);
  // B invita, A acepta en el PC
  let url;
  if (BPC) {
    await B.goto(URL0); await espera(1500);
    // en el PC: «Crear invitación» y «Copiar el enlace» (la sesión blindada del PC está en «próximamente»)
    await B.evaluate(() => { window.__copiados = []; try { navigator.clipboard.writeText = (x) => { window.__copiados.push(String(x)); return Promise.resolve(); }; } catch (_) {} });
    await B.click('#nueva'); await espera(2500); await B.click('#codigo-enlace'); await espera(600);
    url = await B.evaluate(() => window.__copiados[window.__copiados.length - 1] || '');
    url = String(url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  } else {
    await B.goto(URL0 + '?app=1'); await espera(1500);
    await B.click('#nueva-blindada'); await espera(400); await B.click('#invitar-otra'); await espera(1200);
    url = String((await B.evaluate(() => window.__compartidos[window.__compartidos.length - 1])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  }
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si'); await espera(5000);
  // A llama con vídeo; B contesta
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2500);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000);
  await espera(2500);
  comprueba(await visible(A, '#ll-llevar'), '0. en el PC, en la videollamada: «Pasar al teléfono»');
  if (!BPC) comprueba(!(await visible(B, '#ll-llevar')), '0. en el teléfono de B no sale');
  await A.evaluate(() => document.querySelector('#ll-llevar').click()); await espera(800);
  comprueba(await visible(A, '#h-llevar .llevar-qr svg'), '0. sale el código QR', await A.textContent('#llevar-estado'));
  comprueba(await A.evaluate(() => { const p = document.querySelector('#llevar-qr svg path'); const c = getComputedStyle(p); return c.fill === 'rgb(0, 0, 0)' && c.stroke === 'none'; }), '0. el código se ve negro sobre blanco (se puede leer)');
  comprueba(await A.evaluate(() => { const r = document.querySelector('#llevar-qr').getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(e && e.closest('#h-llevar')); }), '0. el código está por encima de la videollamada');
  await A.screenshot({ path: path.join(OUT, '0-pc-codigo.png') });
  const dir = await A.evaluate(() => document.querySelector('#llevar-qr').dataset.url);
  comprueba(/#llevar=[A-Za-z0-9_-]{43}$/.test(dir || ''), '0. la llave va solo en el fragmento de la dirección', dir);
  // 1. el teléfono abre la dirección del código
  await T.goto(dir.replace('https://guardianagroup.com', 'http://127.0.0.1:8080'));
  await espera(600);
  comprueba(!/#llevar/.test(T.url()), '1. el teléfono quita la llave de la dirección (no queda en el historial)', T.url());
  await T.screenshot({ path: path.join(OUT, '1-tel-conectando.png') });
  const t0 = Date.now();
  const paso = await hasta(async () => (await estado(T)) === 'hablando' && (await estado(A)) === 'libre' && (await estado(B)) === 'hablando', 30000);
  comprueba(paso, '1. traspaso hecho: T habla con B y A ha salido (' + Math.round((Date.now() - t0) / 1000) + ' s)', { A: await estado(A), B: await estado(B), T: await estado(T) });
  // los dos avisos salen al empezar a hablar (y se van solos a los pocos segundos)
  comprueba(await hasta(() => visible(T, '#llevar-nota'), 3000), '2. el aviso de cierre se ve al empezar');
  comprueba(/No molestar/.test(await T.textContent('#llevar-aviso')), '2. «No molestar», en la pantalla de «Conectando…»');
  await T.screenshot({ path: path.join(OUT, '2-tel-avisos.png') });
  await espera(3000);
  const vB = await B.evaluate(() => { const v = document.querySelector('#v-remoto'); return v && v.srcObject && v.videoWidth > 0 ? v.getVideoPlaybackQuality().totalVideoFrames : -1; });
  await espera(2000);
  const vB2 = await B.evaluate(() => { const v = document.querySelector('#v-remoto'); return v && v.srcObject && v.videoWidth > 0 ? v.getVideoPlaybackQuality().totalVideoFrames : -1; });
  comprueba(vB2 > vB && vB >= 0, '1. B ve la imagen del teléfono', { vB, vB2 });
  const vT = await T.evaluate(() => { const v = document.querySelector('#v-remoto'); return v && v.srcObject && v.videoWidth > 0; });
  comprueba(vT, '1. el teléfono ve a B');
  comprueba(await visible(A, '#conv') && !(await visible(A, '#llamada')), '1. el PC se queda en el chat de origen');
  comprueba(!(await visible(A, '#h-llevar')), '1. en el PC se cierra el código');
  const nB = ((await B.textContent('#ll-nombre')) || '').trim();
  comprueba(!/grupo/i.test(nB), '1. B no ve «llamada en grupo»: «' + nB + '»');
  // 6. (AMBOS=1, con B en el PC) los dos pasan la llamada a su teléfono: B también la pasa al suyo (U) y hablan T y U
  if (BPC && process.env.AMBOS === '1') {
    const { p: U } = await equipo(browser, false, 'U', false);
    await espera(1500);
    comprueba(await visible(B, '#ll-llevar'), '6. en el PC de B también sale «Pasar al teléfono»');
    await B.evaluate(() => document.querySelector('#ll-llevar').click()); await espera(800);
    const dirB = await B.evaluate(() => document.querySelector('#llevar-qr').dataset.url);
    await U.goto(String(dirB).replace('https://guardianagroup.com', 'http://127.0.0.1:8080'));
    const ok6 = await hasta(async () => (await estado(T)) === 'hablando' && (await estado(U)) === 'hablando' && (await estado(B)) === 'libre', 30000);
    comprueba(ok6, '6. los dos en el teléfono: T habla con U y el PC de B sale', { B: await estado(B), T: await estado(T), U: await estado(U) });
    await espera(3000);
    const vU = await U.evaluate(() => { const v = document.querySelector('#v-remoto'); return v && v.srcObject && v.videoWidth > 0; });
    const vT = await T.evaluate(() => { const v = document.querySelector('#v-remoto'); return v && v.srcObject && v.videoWidth > 0; });
    comprueba(vU && vT, '6. y se ven los dos', { vU, vT });
    await T.screenshot({ path: path.join(OUT, '6-tel-T.png') }); await U.screenshot({ path: path.join(OUT, '6-tel-U.png') });
    await U.evaluate(() => document.querySelector('#ll-colgar').click());
    comprueba(await hasta(async () => (await T.textContent('#llevar-t')) === 'Llamada terminada', 15000), '6. U cuelga: en T, «Llamada terminada»');
    await browser.close();
    console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
    process.exit(fallos.length ? 1 : 0);
  }
  // 2. la pantalla del teléfono: solo «Colgar» y nada guardado
  const botones = await T.evaluate(() => [...document.querySelectorAll('#ll-botones .gc-llamada-boton')].filter((b) => getComputedStyle(b).display !== 'none' && !b.hidden).map((b) => (b.querySelector('span') || b).textContent.trim()));
  comprueba(botones.length === 1, '2. en el teléfono, un solo botón: ' + botones.join(' · '));
  // un solo título arriba, con el tiempo de llamada; la otra persona a toda pantalla (sin partir); en horizontal, «gira el teléfono»
  const cab = { capsula: await visible(T, '.gc-llamada-arriba .gc-llamada-cifrado'), nombre: await visible(T, '#ll-nombre') && (await T.textContent('#ll-nombre')).trim(), tiempo: await visible(T, '#ll-tiempo') && (await T.textContent('#ll-tiempo')).trim() };
  comprueba(!cab.capsula && cab.nombre === 'Videollamada encriptada' && /^\d\d:\d\d$/.test(cab.tiempo), '2. un solo título arriba: «Videollamada encriptada» y el tiempo', cab);
  comprueba(!(await T.evaluate(() => document.querySelector('#llamada').classList.contains('dividida'))), '2. la otra persona a toda pantalla (sin partir)');
  await T.setViewportSize({ width: 852, height: 393 }); await espera(700);
  comprueba(await T.evaluate(() => [...document.querySelectorAll('body > .gira')].some((g) => getComputedStyle(g).display !== 'none')), '2. en horizontal: «gira el teléfono»');
  await T.screenshot({ path: path.join(OUT, '2-tel-horizontal.png') });
  await T.setViewportSize({ width: 393, height: 852 }); await espera(700);
  comprueba(!(await T.evaluate(() => document.querySelector('#llamada').classList.contains('dividida'))) && !(await T.evaluate(() => [...document.querySelectorAll('body > .gira')].some((g) => getComputedStyle(g).display !== 'none'))), '2. y al volver a vertical, igual que antes');
  await T.screenshot({ path: path.join(OUT, '2-tel-llamada.png') });
  await B.screenshot({ path: path.join(OUT, '2-b-llamada.png') });
  const bd = await T.evaluate(async () => { try { const l = await indexedDB.databases(); return l.map((x) => x.name); } catch (_) { return ['?']; } });
  comprueba(!bd.length, '2. el teléfono no abre ninguna base de datos', bd);
  const ls = await T.evaluate(() => Object.keys(localStorage).filter((k) => /gcom|guardiana/i.test(k)));
  comprueba(!ls.length, '2. ni guarda nada en el almacenamiento del navegador', ls);
  // 3. la conexión se corta: «Volver a llamar»
  // (en el navegador de pruebas no se puede quitar la red a una conexión: se cierra y se le dice a la llamada que ha fallado, que es
  // lo que el navegador avisa cuando de verdad se pierde la ruta)
  const cae = (P) => P.evaluate(() => { for (const p of window.__pcs) { if (p.connectionState !== 'connected') continue; try { p.close(); } catch (_) {} Object.defineProperty(p, 'connectionState', { get: () => 'failed' }); Object.defineProperty(p, 'iceConnectionState', { get: () => 'failed' }); p.dispatchEvent(new Event('iceconnectionstatechange')); p.dispatchEvent(new Event('connectionstatechange')); } });
  await cae(T); await cae(B);
  const corta = await hasta(() => visible(T, '#llevar-volver'), 60000);
  comprueba(corta, '3. cortada: en el teléfono sale «Volver a llamar»', await T.textContent('#llevar-t'));
  await T.screenshot({ path: path.join(OUT, '3-tel-cortada.png') });
  comprueba(await hasta(() => visible(B, '#llevar-cortada'), 15000), '3. y en B, la tarjeta «Llamada cortada» con «Volver a llamar»');
  await B.screenshot({ path: path.join(OUT, '3-b-cortada.png') });
  if (corta) {
    await T.click('#llevar-volver');
    if (await hasta(() => visible(B, '#ll-contestar'), 20000)) await B.click('#ll-contestar');
    comprueba(await hasta(async () => (await estado(T)) === 'hablando' && (await estado(B)) === 'hablando', 25000), '3. «Volver a llamar»: la llamada vuelve');
    await espera(1500);
  }
  // 4. el teléfono cuelga
  await T.evaluate(() => document.querySelector('#ll-colgar').click());
  comprueba(await hasta(async () => (await estado(B)) === 'libre' || (await estado(B)) === 'cerrando', 15000), '4. T cuelga: a B se le termina');
  comprueba(await hasta(async () => (await T.textContent('#llevar-t')) === 'Llamada terminada' && await visible(T, '#llevar'), 10000), '4. en T: «Llamada terminada»');
  const queda = await T.evaluate(() => [sessionStorage.getItem('gcom-llevar'), sessionStorage.getItem('gcom-llevar-yo')]);
  comprueba(!queda[0] && !queda[1], '4. la llave se borra de la pestaña', queda);
  await T.screenshot({ path: path.join(OUT, '4-tel-terminada.png') });
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
