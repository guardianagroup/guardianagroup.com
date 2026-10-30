// Two "phones" (Chromium, phone emulation) talk through the local relay: invitation, accept, chat, keyboard, calls.
// Usage: node dos.js <outdir> [paso...]   pasos: teclado | voz | video | colgar
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'capturas');
const PASOS = new Set(process.argv.slice(3).length ? process.argv.slice(3) : ['teclado', 'voz', 'video', 'colgar']);
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?app=1&numero=0';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (cond, txt) => { console.log((cond ? 'OK   ' : 'FALLO') + ' ' + txt); if (!cond) fallos.push(txt); };

async function telefono(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-ES', permissions: ['microphone', 'camera'] });
  // el Número GUARDIANA, apagado en esta prueba (invitaciones; 29 Oct 2026, 23:07: en el móvil sin la app, el inicio es «Añadir a la pantalla de inicio»)
  await ctx.addInitScript(() => { try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {} });
  await ctx.addInitScript(() => {
    try { Object.defineProperty(navigator, 'standalone', { get: () => true }); } catch (_) {}
    // qué pista de audio sale hacia la otra persona
    window.__pistas = []; window.__tonos = [];
    const pl = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { if (this.loop && String(this.src).startsWith('blob:')) window.__tonos.push((this.muted ? 'mudo ' : '') + 'suena'); return pl.call(this); };
    // el tono de «Llamando…» suena con el audio del navegador desde el 30 Oct 2026 (para no quedarse en la pantalla bloqueada): cuenta un oscilador que arranca
    { const AC = window.AudioContext || window.webkitAudioContext; if (AC) { const co = AC.prototype.createOscillator; AC.prototype.createOscillator = function () { const o = co.call(this); const st = o.start.bind(o); o.start = (...a) => { window.__tonos.push('suena'); return st(...a); }; return o; }; } }
    const at = RTCPeerConnection.prototype.addTrack;
    RTCPeerConnection.prototype.addTrack = function (tr, ...r) { window.__pistas.push(tr.kind + ':' + tr.label); return at.call(this, tr, ...r); };
    const rt = RTCRtpSender.prototype.replaceTrack;
    RTCRtpSender.prototype.replaceTrack = function (tr) { window.__pistas.push('cambio ' + (tr ? tr.kind + ':' + tr.label : 'null')); return rt.call(this, tr); };
  });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') console.log('[' + nombre + '] ' + m.type() + ': ' + m.text().slice(0, 300)); });
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror: ' + String(e).slice(0, 400)); fallos.push('pageerror ' + nombre); });
  return p;
}
const foto = async (p, n) => { await p.screenshot({ path: path.join(OUT, n + '.png') }); };
const caja = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, vis: cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 }; }, sel);

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser, 'A'), B = await telefono(browser, 'B');
  await A.goto(URL0); await espera(1500);
  await foto(A, '01-A-inicio');
  // inicio de la app instalada
  comprueba(!(await caja(A, '#volver')).vis, 'app: sin «‹ Inicio»');
  comprueba((await caja(A, '.barra-t')).vis, 'app: el nombre arriba a la izquierda');
  const lg = await caja(A, '.barra-logo'), nt = await caja(A, '.barra-app > span'); // el nombre va en .barra-app desde que el título vive en el HTML (29 Oct, 08:55)
  comprueba(lg.vis && lg.w >= 20 && lg.x < nt.x && Math.abs((lg.y + lg.h / 2) - (nt.y + nt.h / 2)) < 2, 'app: el logotipo delante de GUARDIANA, centrado con el nombre (29 Oct, 07:38)');
  const id = await caja(A, '.idiomas'); comprueba(id.vis && id.x > 250, 'app: el idioma arriba a la derecha');
  const bar = await caja(A, '.barra'); comprueba(id.y >= bar.y && id.b <= bar.b + 0.5, 'app: el idioma cabe dentro de la barra');
  // 29 Oct 2026, 07:36–07:37: «Invitar a chat» sin el escudo y, debajo, «Contactos»
  const bs = await caja(A, '#nueva-blindada svg'), bb = await caja(A, '#nueva-blindada b'), bt = await caja(A, '#nueva-blindada'), bc = await caja(A, '#ver-contactos-inicio');
  comprueba(!bs.vis && Math.abs((bt.y + bt.h / 2) - (bb.y + bb.h / 2)) < 2 && Math.abs((bt.x + bt.w / 2) - (bb.x + bb.w / 2)) < 2, 'inicio: «Invitar a chat» sin escudo, con el texto centrado');
  comprueba(bc.vis && bc.y >= bt.b && bc.w === bt.w, 'inicio: «Contactos» debajo, del mismo ancho');
  // invitación blindada (en el móvil, un solo botón)
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(2500);
  await foto(A, '02-A-invitacion');
  const enlace = await A.evaluate(() => { return window.gcomPrueba.enlace(); });
  if (!enlace) { console.log('sin enlace'); await browser.close(); return; }
  await B.goto(enlace.replace('https://guardianagroup.com', 'http://127.0.0.1:8080')); await espera(2000);
  await foto(B, '03-B-aceptar');
  if (await B.$('#aceptar-si:visible')) { await B.click('#aceptar-si'); }
  await espera(5000);
  for (const [p, t] of [[A, 'Qué tal estás'], [B, 'Good'], [A, 'Ahora a ve como una app']]) {
    await p.tap('#texto'); await p.fill('#texto', t); await p.click('#enviar'); await espera(700);
  }
  await A.evaluate(() => document.activeElement && document.activeElement.blur()); await espera(600);
  await foto(A, '05-A-mensajes'); await foto(B, '05-B-mensajes');
  const comp0 = await caja(A, '.gc-compositor');
  comprueba(Math.abs(comp0.b - 793) < 1, 'chat: el campo abajo del todo (' + comp0.b + ')');
  if (PASOS.has('clip')) {
    await A.tap('#texto'); await espera(200);
    await A.tap('#adjuntar'); await espera(500);
    const m = await caja(A, '#adjuntos');
    comprueba(m && m.vis && m.x <= 9 && Math.abs(m.b - (793 - 8)) < 2, 'clip: hoja abajo, a lo ancho (' + JSON.stringify(m) + ')');
    comprueba(await A.evaluate(() => document.activeElement.id !== 'texto'), 'clip: se cierra el teclado');
    await foto(A, '05c-A-clip');
    await A.mouse.click(200, 100); await espera(300);
    comprueba(!(await caja(A, '#adjuntos')).vis, 'clip: tocando fuera se cierra');
  }
  if (PASOS.has('teclado')) {
    // el teclado como en el iPhone instalado: innerHeight y visualViewport bajan juntos
    await A.tap('#texto'); await A.setViewportSize({ width: 393, height: 793 - 336 }); await espera(800);
    const m = await A.evaluate(() => ({ clase: document.documentElement.className, alto: getComputedStyle(document.body).height, vv: visualViewport.height, sy: scrollY, cab: document.querySelector('.gc-cabecera').getBoundingClientRect().top, comp: document.querySelector('.gc-compositor').getBoundingClientRect().bottom, pb: getComputedStyle(document.querySelector('.gc-compositor')).paddingBottom }));
    console.log('     teclado A:', JSON.stringify(m));
    comprueba(/con-teclado/.test(m.clase), 'teclado: se detecta aunque innerHeight baje también');
    comprueba(m.cab === 0 && Math.abs(m.comp - m.vv) < 1 && m.sy === 0, 'teclado: cabecera arriba y campo justo encima del teclado');
    await foto(A, '06-A-teclado');
    await A.evaluate(() => document.activeElement && document.activeElement.blur()); await A.setViewportSize({ width: 393, height: 793 }); await espera(800);
    const m2 = await A.evaluate(() => ({ clase: document.documentElement.className, comp: document.querySelector('.gc-compositor').getBoundingClientRect().bottom, sy: scrollY }));
    comprueba(!/con-teclado/.test(m2.clase) && Math.abs(m2.comp - 793) < 1 && m2.sy === 0, 'teclado: al cerrarlo, todo vuelve a su sitio');
    // y como en Safari: el visualViewport baja pero innerHeight no (ventana del mismo alto, se simula con un panel)
  }
  if (PASOS.has('voz')) {
    // la llamada de voz no tiene botón desde el 28 Oct 2026, 21:50 (solo videollamada); se prueba igual, por si llega de una versión anterior
    await A.evaluate(() => document.querySelector('#llamar').click()); await espera(2500);
    await foto(A, '08-A-llamando'); await foto(B, '08-B-entrante');
    const ta = await A.evaluate(() => window.__tonos.slice()), tb = await B.evaluate(() => window.__tonos.slice());
    comprueba(ta.includes('suena') && tb.includes('suena'), 'tono: suena al que llama y al que recibe (' + ta.join(',') + ' | ' + tb.join(',') + ')');
    if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar');
    await espera(4000);
    await foto(A, '09-A-hablando'); await foto(B, '09-B-hablando');
    for (const [p, n] of [[A, 'A'], [B, 'B']]) {
      const pistas = await p.evaluate(() => window.__pistas.slice());
      comprueba(pistas.some((x) => /^audio:.*(fake|default|audio)/i.test(x) && !/destination/i.test(x)), 'voz ' + n + ': con la voz natural sale el micrófono tal cual (' + pistas.join(' | ') + ')');
      const au = await p.evaluate(() => { const a = document.querySelector('#a-remoto'); return { paused: a.paused, pistas: a.srcObject ? a.srcObject.getAudioTracks().length : 0 }; });
      comprueba(!au.paused && au.pistas === 2, 'voz ' + n + ': suena la otra persona (voz y pista muda: ' + au.pistas + ' pistas)');
      // 29 Oct 2026, 07:51: sin «Tu voz» ni «Voz e imagen»; en el chat normal, ningún efecto (los del blindado, en tipos.js)
      const ef = { pildora: (await caja(p, '#ll-voz-pill')).vis, ajustes: (await caja(p, '#ll-ajustes')).vis, grave: (await caja(p, '#ll-grave')).vis };
      // (aquí el chat es blindado: sin navigator.share, «Invitar a chat» crea la blindada de siempre con el enlace en pantalla)
      // 29 Oct 2026, 12:55–12:59: el blindado va «próximamente» y sus efectos de voz e imagen no se ofrecen: pantalla limpia del todo
      comprueba(!ef.pildora && !ef.ajustes && !ef.grave, 'voz ' + n + ': pantalla limpia, sin efectos (el blindado, próximamente) ' + JSON.stringify(ef));
    }
    console.log('     pistas A:', JSON.stringify(await A.evaluate(() => window.__pistas.slice())));
    if (PASOS.has('colgar')) {
      await A.click('#ll-colgar'); await espera(560);
      comprueba(await A.evaluate(() => document.querySelector('#llamada').classList.contains('gc-saliendo')), 'colgar: la llamada se desvanece');
      await espera(900);
      comprueba(!(await caja(A, '#llamada')).vis, 'colgar: vuelve el chat');
      await foto(A, '11-A-colgada');
    }
  }
  if (PASOS.has('video')) {
    await espera(1500);
    await A.click('#videollamar'); await espera(2500);
    if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar');
    await espera(5000);
    await foto(A, '12-A-video'); await foto(B, '12-B-video');
    for (const [p, n] of [[A, 'A'], [B, 'B']]) {
      const cl = await p.evaluate(() => document.querySelector('#llamada').className);
      comprueba(/dividida/.test(cl) && /lado-abajo/.test(cl), 'video ' + n + ': empieza con la pantalla partida, tú abajo (' + cl + ')');
    }
    const ajuste = await A.evaluate(() => [getComputedStyle(document.querySelector('#v-remoto')).objectFit, getComputedStyle(document.querySelector('#v-local')).objectFit]);
    comprueba(ajuste[0] === 'cover' && ajuste[1] === 'cover', 'video: partida, las dos mitades llenas (' + ajuste.join(', ') + ')');
    const tb = await caja(A, '#ll-tam'); const txt = await A.evaluate(() => { const b = document.querySelector('#ll-tam'); return b && b.textContent; });
    comprueba(tb && tb.vis && /Pantalla completa/.test(txt), 'video: botón «Pantalla completa» a la vista (' + JSON.stringify(tb) + ')');
    await A.click('#ll-tam'); await espera(800);
    comprueba(!/dividida/.test(await A.evaluate(() => document.querySelector('#llamada').className)), 'video: con el botón, como FaceTime');
    await foto(A, '13-A-video-facetime');
    const vl = await caja(A, '#v-local');
    await A.touchscreen.tap(vl.x + vl.w / 2, vl.y + vl.h / 2); await espera(800);
    comprueba(/dividida/.test(await A.evaluate(() => document.querySelector('#llamada').className)), 'video: tocando tu imagen pequeña, vuelve a partirse');
    await foto(A, '13b-A-video-partida');
    if (PASOS.has('colgar')) { await A.evaluate(() => document.querySelector('#ll-colgar').click()); await espera(1500); await foto(A, '14-A-tras-video'); }
  }
  await browser.close();
  console.log(fallos.length ? '\n' + fallos.length + ' FALLOS: ' + fallos.join(' · ') : '\nTODO BIEN');
})().catch((e) => { console.error(e); process.exit(1); });
