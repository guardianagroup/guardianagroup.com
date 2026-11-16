// La llamada por toda la web y en la ventana flotante (dueño, 16 Nov 2026, 09:44: «hemos ido los dos a ver los datos de la llamada
// en Órbita y no seguía y no nos veíamos… tenemos que poder movernos por toda la web… y nos tenemos que seguir viendo… el cuadradito…
// lo tenemos que poder mover… por toda la zona de la pantalla»). A y B (PC), en videollamada Ultra (con el mosaico de serie).
// El navegador de la prueba no abre ventanas del sistema: la ventana flotante (Document Picture-in-Picture) se hace aquí con un
// marco en la esquina, que tiene lo mismo que la de verdad (su documento, su reloj, cerrarla).
//   1. Con la pestaña de A «detrás» (los relojes de la página a una vez por segundo, como hace el navegador), la imagen de A sigue
//      llegando a B con fluidez: la imagen protegida va fotograma a fotograma, no con un reloj.
//   2. Con la cámara de A apagada, lo que sale es negro; al encenderla, vuelve la imagen.
//   3. Al cambiar de pestaña (la acción del navegador), la ventana flotante con la llamada: la otra persona, tu imagen, el tiempo y
//      micrófono, cámara y colgar. Sus botones mandan en la llamada y la llamada en ellos. Al volver a la pestaña, se cierra.
//   4. «Ver el chat»: la llamada pasa a la ventana flotante y el chat queda libre (la tarjeta pequeña se aparta); al volver a la
//      pestaña sigue abierta; al cerrarla, vuelve la tarjeta pequeña.
//   5. En mitad de la llamada, «Inicio» se abre en otra pestaña y la llamada sigue; salir de la página lo pregunta antes, sin colgar.
//   6. Colgar desde la ventana flotante: se termina para los dos, la ventana se cierra y no queda ninguna copia de la cámara abierta.
//   3b. (dueño, 16 nov 2026, 12:20: «él la pantalla no la puede hacer más grande ni nada») «Agrandar», arriba a la derecha: la ventana
//      pasa a media pantalla y el botón dice «Reducir»; otra vez, vuelve a su tamaño.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'ventana-flotante');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function equipo(browser, nombre) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, userAgent: PC, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {}
    // Media Session: lo que la página le da al navegador
    window.__acciones = {};
    const ms = navigator.mediaSession;
    if (ms) { ms.setActionHandler = (a, f) => { window.__acciones[a] = f || null; }; ms.setMicrophoneActive = () => Promise.resolve(); ms.setCameraActive = () => Promise.resolve(); }
    // la pestaña «detrás»: visibilityState y los relojes de la página a una vez por segundo, como en el navegador
    window.__vista = 'visible'; window.__fondo = false;
    Object.defineProperty(Document.prototype, 'visibilityState', { configurable: true, get: () => window.__vista });
    Object.defineProperty(Document.prototype, 'hidden', { configurable: true, get: () => window.__vista !== 'visible' });
    const si = window.setInterval;
    window.setInterval = function (fn, ms, ...args) {
      if (typeof fn !== 'function') return si.call(window, fn, ms, ...args);
      let ult = 0;
      return si.call(window, function () { if (window.__fondo) { const n = performance.now(); if (n - ult < 1000) return; ult = n; } return fn.apply(this, arguments); }, ms, ...args);
    };
    // las copias de la cámara, para ver que se sueltan
    window.__copias = [];
    const clona = MediaStreamTrack.prototype.clone;
    MediaStreamTrack.prototype.clone = function () { const c = clona.call(this); if (this.kind === 'video') window.__copias.push(c); return c; };
    // la ventana flotante del sistema, hecha con un marco en la esquina
    window.__vfPedidas = 0; window.__vfCerradas = 0;
    const dpip = {
      window: null,
      requestWindow(op) {
        window.__vfPedidas++;
        const f = document.createElement('iframe'); f.id = '__vf';
        f.style.cssText = 'position:fixed;right:20px;bottom:20px;width:' + ((op && op.width) || 400) + 'px;height:' + ((op && op.height) || 260) + 'px;border:0;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.6);z-index:2147483647;background:#000';
        document.documentElement.append(f);
        const w = f.contentWindow;
        w.close = () => { if (!f.isConnected) return; try { w.dispatchEvent(new Event('pagehide')); } catch (_) {} f.remove(); dpip.window = null; window.__vfCerradas++; };
        // como la ventana de verdad: se agranda con resizeTo (aquí, sin marco alrededor)
        try { Object.defineProperty(w, 'outerWidth', { configurable: true, get: () => w.innerWidth }); Object.defineProperty(w, 'outerHeight', { configurable: true, get: () => w.innerHeight }); } catch (_) {}
        w.resizeTo = (W, H) => { f.style.width = W + 'px'; f.style.height = H + 'px'; window.__vfTam = [W, H]; };
        dpip.window = w;
        return Promise.resolve(w);
      },
    };
    Object.defineProperty(window, 'documentPictureInPicture', { configurable: true, value: dpip });
  });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  return { p, ctx };
}
const estado = (P) => P.evaluate(() => (window.GuardianaCom && GuardianaCom.llamada ? GuardianaCom.llamada.estado : ''));
const hasta = async (fn, ms) => { const h = Date.now() + ms; while (Date.now() < h) { if (await fn()) return true; await espera(250); } return false; };
const enSesion = (P) => P.evaluate(() => [...((window.GuardianaCom && GuardianaCom.convs) || new Map()).values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada));
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]')); }, s);
// los fotogramas que B pinta de A en un rato
const fotogramas = (P, ms) => P.evaluate(async (ms) => {
  const v = document.querySelector('#v-remoto'); if (!v || !v.getVideoPlaybackQuality) return -1;
  const a = v.getVideoPlaybackQuality().totalVideoFrames; await new Promise((r) => setTimeout(r, ms));
  return (v.getVideoPlaybackQuality().totalVideoFrames - a) / (ms / 1000);
}, ms);
// la luz media de lo que sale de A (su recuadro propio enseña lo mismo que ve B)
const luzSale = (P) => P.evaluate(async () => {
  const v = document.querySelector('#v-local'); const t = v && v.srcObject && v.srcObject.getVideoTracks()[0]; if (!t) return -1;
  const x = document.createElement('video'); x.muted = true; x.srcObject = new MediaStream([t]); await x.play().catch(() => {});
  await new Promise((r) => setTimeout(r, 500));
  const c = document.createElement('canvas'); c.width = 32; c.height = 18; const g = c.getContext('2d'); g.drawImage(x, 0, 0, 32, 18);
  const d = g.getImageData(0, 0, 32, 18).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3; x.srcObject = null;
  return s / (d.length / 4) / 255;
});
const ventana = (P) => P.evaluate(() => {
  const w = window.documentPictureInPicture && window.documentPictureInPicture.window; if (!w) return null;
  const d = w.document, q = (s) => d.querySelector(s), ve = (e) => !!(e && !e.hidden && e.getClientRects().length);
  const rem = q('.vf-rem'), yo = q('.vf-yo');
  return {
    rem: ve(rem), remFlujo: !!(rem && rem.srcObject && rem.srcObject === document.querySelector('#v-remoto').srcObject), remAncho: rem ? rem.videoWidth : 0,
    yo: ve(yo), yoFlujo: !!(yo && yo.srcObject && yo.srcObject === document.querySelector('#v-local').srcObject),
    tiempo: (q('.vf-tiempo') || {}).textContent || '',
    botones: [...d.querySelectorAll('.vf-b')].filter(ve).map((b) => [b.className.replace('vf-b ', ''), b.getAttribute('aria-pressed'), b.getAttribute('aria-label')]),
  };
});
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const { p: B } = await equipo(browser, 'B'), { p: A, ctx: ctxA } = await equipo(browser, 'A');
  await B.goto(URL0 + '?plan=plus'); await espera(1500);
  await B.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
  const url = String(await B.evaluate(() => (window.gcomPrueba && window.gcomPrueba.enlace()) || '')).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await A.goto(url); await espera(1500); if (await A.$('#aceptar-si:visible')) await A.click('#aceptar-si');
  comprueba(await hasta(async () => (await enSesion(A)) && (await enSesion(B)), 20000), '0. conversación Ultra entre A y B');
  await A.evaluate(() => document.querySelector('#videollamar').click()); await espera(2200);
  if (await hasta(() => visible(B, '#ll-contestar'), 15000)) await B.click('#ll-contestar');
  comprueba(await hasta(async () => (await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', 20000), '0. A y B en videollamada Ultra');
  await espera(3500);
  const mos = await A.evaluate(() => document.querySelector('#ll-ef-mosaico') && document.querySelector('#ll-ef-mosaico').getAttribute('aria-pressed'));
  comprueba(mos === 'true', '0. A sale con el mosaico puesto (la imagen protegida)', mos);
  const pista = await A.evaluate(() => { const v = document.querySelector('#v-local'); const t = v && v.srcObject && v.srcObject.getVideoTracks()[0]; return t ? t.constructor.name : ''; });
  comprueba(pista === 'MediaStreamTrackGenerator', '1. la imagen protegida de A sale fotograma a fotograma', pista);

  // 1. A «detrás»: los relojes, a una vez por segundo
  const antes = await fotogramas(B, 3000);
  await A.evaluate(() => { window.__fondo = true; window.__vista = 'hidden'; document.dispatchEvent(new Event('visibilitychange')); });
  await espera(1500);
  const detras = await fotogramas(B, 4000);
  // (con el reloj de antes, detrás llegaba 1 imagen por segundo; en esta máquina de prueba, de dos núcleos y con las dos llamadas, la
  // cámara de prueba da unas 8 delante: detrás tiene que dar casi lo mismo)
  comprueba(antes >= 4 && detras >= Math.max(4, antes * 0.75), '1. con la pestaña de A detrás, su imagen sigue llegando a B con fluidez (fotogramas por segundo)', { antes: +antes.toFixed(1), detras: +detras.toFixed(1) });
  await A.evaluate(() => { window.__fondo = false; window.__vista = 'visible'; document.dispatchEvent(new Event('visibilitychange')); });
  await espera(800);

  // 2. la cámara apagada: negro
  const conImagen = await luzSale(A);
  await A.evaluate(() => document.querySelector('#ll-camara').click()); await espera(900);
  const apagada = await luzSale(A);
  await A.evaluate(() => document.querySelector('#ll-camara').click()); await espera(900);
  const otraVez = await luzSale(A);
  comprueba(conImagen > 0.08 && apagada >= 0 && apagada < 0.05 && otraVez > 0.08, '2. con la cámara de A apagada sale negro, y al encenderla vuelve la imagen (luz media)', { conImagen: +conImagen.toFixed(3), apagada: +apagada.toFixed(3), otraVez: +otraVez.toFixed(3) });

  // 3. cambia de pestaña: la ventana flotante con la llamada
  comprueba(typeof (await A.evaluate(() => typeof window.__acciones.enterpictureinpicture)) === 'string' && (await A.evaluate(() => typeof window.__acciones.enterpictureinpicture)) === 'function', '3. la página le da al navegador la ventana flotante sola');
  await A.evaluate(() => { window.__vista = 'hidden'; document.dispatchEvent(new Event('visibilitychange')); window.__acciones.enterpictureinpicture({ action: 'enterpictureinpicture' }); });
  await espera(1500);
  let w = await ventana(A);
  comprueba(!!w && w.rem && w.remFlujo && w.remAncho > 0 && w.yo && w.yoFlujo, '3. al cambiar de pestaña, la ventana flotante con la otra persona y tu imagen', w);
  comprueba(!!w && /^\d\d:\d\d$/.test(w.tiempo) && w.botones.map((b) => b[0]).join(',') === 'vf-mic,vf-cam,vf-colgar,vf-volver,vf-tam', '3. con el tiempo y micrófono, cámara, colgar y «Volver a la llamada»', w && { tiempo: w.tiempo, botones: w.botones });
  await A.screenshot({ path: path.join(OUT, '3-a-ventana-flotante.png') });
  { const el = await A.$('#__vf'); if (el) { await el.screenshot({ path: path.join(OUT, '3-ventana-sola.png') }); const r = await el.boundingBox(); await A.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await espera(400); await el.screenshot({ path: path.join(OUT, '3-ventana-con-raton.png') }); await A.mouse.move(5, 5); } }
  // 3b. «Agrandar» y «Reducir»
  {
    const tam = () => A.evaluate(() => { const w = window.documentPictureInPicture.window; const b = w && w.document.querySelector('.vf-tam'); return w ? { ancho: w.innerWidth, alto: w.innerHeight, boton: !!b, etiqueta: b ? b.getAttribute('aria-label') : '', titulo: b ? b.title : '' } : null; });
    const t0 = await tam();
    comprueba(!!t0 && t0.boton && t0.etiqueta === 'Agrandar' && t0.ancho <= 420, '3b. arriba a la derecha, «Agrandar»', t0);
    await A.evaluate(() => window.documentPictureInPicture.window.document.querySelector('.vf-tam').click()); await espera(900);
    const t1 = await tam();
    comprueba(!!t1 && t1.ancho > 560 && t1.alto > 300 && t1.etiqueta === 'Reducir' && t1.titulo === 'Reducir', '3b. la ventana pasa a media pantalla y el botón dice «Reducir»', t1);
    { const el = await A.$('#__vf'); if (el) { const r = await el.boundingBox(); await A.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await espera(400); await el.screenshot({ path: path.join(OUT, '3b-ventana-grande.png') }); await A.mouse.move(5, 5); } }
    await A.evaluate(() => window.documentPictureInPicture.window.document.querySelector('.vf-tam').click()); await espera(900);
    const t2 = await tam();
    comprueba(!!t2 && t2.ancho <= 420 && t2.etiqueta === 'Agrandar', '3b. otra vez: vuelve a su tamaño', t2);
  }
  // sus botones mandan en la llamada
  await A.evaluate(() => window.documentPictureInPicture.window.document.querySelector('.vf-mic').click()); await espera(600);
  let m = await A.evaluate(() => ({ llamada: document.querySelector('#ll-silenciar').getAttribute('aria-pressed'), ventana: window.documentPictureInPicture.window.document.querySelector('.vf-mic').getAttribute('aria-pressed') }));
  comprueba(m.llamada === 'true' && m.ventana === 'true', '3. «micrófono» en la ventana: silenciado, en la llamada y en la ventana', m);
  await A.evaluate(() => document.querySelector('#ll-silenciar').click()); await espera(700);
  m = await A.evaluate(() => ({ llamada: document.querySelector('#ll-silenciar').getAttribute('aria-pressed'), ventana: window.documentPictureInPicture.window.document.querySelector('.vf-mic').getAttribute('aria-pressed') }));
  comprueba(m.llamada === 'false' && m.ventana === 'false', '3. y desde la llamada: la ventana se pone al día', m);
  await A.evaluate(() => window.documentPictureInPicture.window.document.querySelector('.vf-cam').click()); await espera(900);
  let c = await A.evaluate(() => ({ llamada: document.querySelector('#ll-camara').getAttribute('aria-pressed'), ventana: window.documentPictureInPicture.window.document.querySelector('.vf-cam').getAttribute('aria-pressed'), yo: !window.documentPictureInPicture.window.document.querySelector('.vf-yo').hidden }));
  comprueba(c.llamada === 'true' && c.ventana === 'true' && !c.yo, '3. «cámara» en la ventana: apagada, y tu imagen se quita de la ventana', c);
  await A.evaluate(() => window.documentPictureInPicture.window.document.querySelector('.vf-cam').click()); await espera(900);
  c = await A.evaluate(() => ({ llamada: document.querySelector('#ll-camara').getAttribute('aria-pressed'), yo: !window.documentPictureInPicture.window.document.querySelector('.vf-yo').hidden }));
  comprueba(c.llamada === 'false' && c.yo, '3. otra vez: vuelve la cámara', c);
  // vuelve a la pestaña
  await A.evaluate(() => { window.__vista = 'visible'; document.dispatchEvent(new Event('visibilitychange')); });
  await espera(600);
  const cerrada = await A.evaluate(() => ({ abierta: !!window.documentPictureInPicture.window, cerradas: window.__vfCerradas, flotando: document.querySelector('#llamada').classList.contains('flotando') }));
  comprueba(!cerrada.abierta && cerrada.cerradas === 1 && !cerrada.flotando, '3. al volver a la pestaña, la ventana que se abrió sola se cierra', cerrada);
  comprueba((await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', '3. y la llamada sigue');

  // 4. «Ver el chat»
  await A.evaluate(() => document.querySelector('#ll-mini').click()); await espera(1500);
  w = await ventana(A);
  const chat = await A.evaluate(() => ({ tarjeta: (() => { const e = document.querySelector('#llamada'); return !!(e.getClientRects().length && getComputedStyle(e).display !== 'none'); })(), inerte: document.querySelector('#app').hasAttribute('inert') }));
  comprueba(!!w && w.rem && w.remFlujo, '4. «Ver el chat»: la llamada pasa a la ventana flotante', w && { rem: w.rem, flujo: w.remFlujo });
  comprueba(!chat.tarjeta && !chat.inerte, '4. y el chat queda libre (la tarjeta pequeña se aparta)', chat);
  await A.screenshot({ path: path.join(OUT, '4-a-chat-y-ventana.png') });
  await A.evaluate(() => { window.__vista = 'hidden'; document.dispatchEvent(new Event('visibilitychange')); window.__vista = 'visible'; document.dispatchEvent(new Event('visibilitychange')); });
  await espera(600);
  comprueba(!!(await ventana(A)), '4. al volver a la pestaña, la ventana de «Ver el chat» sigue abierta');
  await A.evaluate(() => window.documentPictureInPicture.window.close()); await espera(700);
  const vuelta = await A.evaluate(() => { const e = document.querySelector('#llamada'); return { tarjeta: !!(e.getClientRects().length && getComputedStyle(e).display !== 'none'), mini: e.classList.contains('mini') }; });
  comprueba(vuelta.tarjeta && vuelta.mini, '4. al cerrarla, vuelve la tarjeta pequeña de siempre', vuelta);
  comprueba((await estado(A)) === 'hablando', '4. y la llamada sigue');
  await A.evaluate(() => document.querySelector('#ll-videos').click()); await espera(600);

  // 5. por la web sin colgar
  const [nueva] = await Promise.all([ctxA.waitForEvent('page', { timeout: 8000 }).catch(() => null), A.evaluate(() => { const a = document.querySelector('#volver'); a.click(); })]);
  await espera(1200);
  comprueba(!!nueva && /\/orbita\//.test(nueva.url()) && /\/orbita\/comunicaciones\//.test(A.url()), '5. en mitad de la llamada, «Inicio» se abre en otra pestaña', { nueva: nueva && nueva.url(), aqui: A.url() });
  comprueba((await estado(A)) === 'hablando' && (await estado(B)) === 'hablando', '5. y la llamada sigue en las dos');
  if (nueva) await nueva.close();
  const pregunta = await A.evaluate(() => { const e = new Event('beforeunload', { cancelable: true }); dispatchEvent(e); return e.defaultPrevented; });
  await espera(1500);
  comprueba(pregunta && (await estado(B)) === 'hablando', '5. salir de la página en mitad de la llamada lo pregunta antes, sin colgar', { pregunta, B: await estado(B) });

  // 6. colgar desde la ventana flotante
  await A.evaluate(() => { window.__vista = 'hidden'; document.dispatchEvent(new Event('visibilitychange')); window.__acciones.enterpictureinpicture({ action: 'enterpictureinpicture' }); });
  await espera(1000);
  await A.evaluate(() => window.documentPictureInPicture.window.document.querySelector('.vf-colgar').click());
  const fin = await hasta(async () => (await estado(A)) !== 'hablando' && (await estado(B)) !== 'hablando', 10000);
  comprueba(fin, '6. «colgar» en la ventana: se termina para los dos', { A: await estado(A), B: await estado(B) });
  await espera(1500);
  const final = await A.evaluate(() => ({ abierta: !!window.documentPictureInPicture.window, copias: window.__copias.length, vivas: window.__copias.filter((t) => t.readyState !== 'ended').length }));
  comprueba(!final.abierta, '6. la ventana se cierra', final);
  comprueba(final.copias > 0 && final.vivas === 0, '6. y no queda ninguna copia de la cámara abierta', final);
  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})();
