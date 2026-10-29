// Altavoz o auricular en el iPhone (dueño, 28 Oct 2026, 20:21 y 20:31: «Tienes que arreglarla, si no… deberemos quitarla»).
// Chromium no tiene auricular: aquí se simulan las dos salidas del iPhone («Altavoz» e «iPhone») y que cambiar la salida exige
// un toque reciente, como en Safari. Se comprueba la lógica: la voz de la otra persona y el silencio que fija la salida van
// siempre por la misma salida; el silencio vuelve a empezar tras conectar y tras cada cambio; sin toque, el botón dice la verdad;
// la salida elegida se queda para la próxima llamada. Si de verdad suena por el auricular solo se ve en un iPhone.
'use strict';
const { chromium } = require('playwright');
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
async function telefono(browser) {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 793 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, locale: 'es-CO', permissions: ['microphone', 'camera'] });
  await ctx.addInitScript(() => {
    window.__compartidos = []; navigator.share = (d) => { window.__compartidos.push(d); return new Promise((r) => setTimeout(r, 300)); };
    // las dos salidas del iPhone y la regla del toque
    window.__sink = { llamadas: [], sinGesto: false, activa: [] };
    const real = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    const sal = (id, label) => ({ kind: 'audiooutput', deviceId: id, groupId: id, label, toJSON() { return { kind: this.kind, deviceId: this.deviceId, label: this.label }; } });
    navigator.mediaDevices.enumerateDevices = async () => (await real()).filter((d) => d.kind !== 'audiooutput').concat([sal('alt-1', 'Altavoz'), sal('aur-1', 'iPhone')]);
    const sinks = new WeakMap();
    Object.defineProperty(HTMLMediaElement.prototype, 'sinkId', { configurable: true, get() { return sinks.get(this) || ''; } });
    HTMLMediaElement.prototype.setSinkId = function (id) {
      const activo = navigator.userActivation ? navigator.userActivation.isActive : true;
      window.__sink.llamadas.push({ el: this.id || (this.getAttribute('aria-hidden') === 'true' ? 'ruta' : '?'), id, activo });
      if (window.__sink.sinGesto || !activo) return Promise.reject(new DOMException('A user gesture is required', 'NotAllowedError'));
      return new Promise((r) => setTimeout(() => { sinks.set(this, id); r(); }, 5));
    };
    // cada vez que el silencio «vuelve a empezar» (su pista se apaga y se enciende)
    const d = Object.getOwnPropertyDescriptor(MediaStreamTrack.prototype, 'enabled');
    Object.defineProperty(MediaStreamTrack.prototype, 'enabled', { configurable: true, get() { return d.get.call(this); }, set(v) { if (v && !d.get.call(this)) window.__sink.activa.push({ t: this, ms: Date.now() }); d.set.call(this, v); } });
  });
  const p = await ctx.newPage(); p.on('pageerror', (e) => { console.log('pageerror', String(e).slice(0, 200)); fallos.push('pageerror'); });
  return p;
}
const estadoSalida = (P) => P.evaluate(() => {
  const ar = document.querySelector('#a-remoto'), ru = document.querySelector('#a-remoto + audio[aria-hidden="true"]');
  const caja = document.querySelector('#ll-altavoz-caja'), b = document.querySelector('#ll-altavoz');
  const pista = ru && ru.srcObject && ru.srcObject.getAudioTracks()[0], muda = ar.srcObject && ar.srcObject.getAudioTracks()[1];
  return {
    voz: ar.sinkId, ruta: ru ? ru.sinkId : null, rutaSuena: !!(ru && ru.srcObject && !ru.paused),
    boton: caja ? !caja.hidden : null, pulsado: b ? b.getAttribute('aria-pressed') : null,
    vuelve: pista ? window.__sink.activa.filter((x) => x.t === pista).length : 0,
    mudaVuelve: muda ? window.__sink.activa.filter((x) => x.t === muda).length : 0, mudaActiva: muda ? muda.enabled : null,
    llamadas: window.__sink.llamadas.slice(-4),
  };
});
(async () => {
  // en pausa: desde el 28 Oct 2026, 21:50 no hay llamada de voz ni botón «Altavoz» (llamada.js, ELIGE_SALIDA = false)
  if (/const ELIGE_SALIDA = false/.test(require('fs').readFileSync(require('path').join(__dirname, '../../orbita/comunicaciones/llamada.js'), 'utf8'))) { console.log('EN PAUSA: sin llamada de voz ni botón «Altavoz» (ELIGE_SALIDA = false)'); process.exit(0); }
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const A = await telefono(browser), B = await telefono(browser);
  await A.goto(URL0); await B.goto(URL0); await espera(1800);
  await A.click('#nueva-blindada'); if (await A.$('#h-invitar.gc-abierta')) await A.click('#invitar-otra'); await espera(900);
  const url = String((await A.evaluate(() => window.__compartidos[0])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  await B.goto(url); await espera(1500); if (await B.$('#paso-ios:not([hidden]) #ios-safari')) { await B.evaluate(() => document.querySelector('#ios-safari').click()); await espera(900); } await B.click('#aceptar-si'); await espera(5000);
  await A.click('#ccontacto-si'); await A.fill('#nombre-conv', 'Nathalie'); await A.click('#nombre-guardar'); await espera(500);

  // 1. llamada de voz, con el toque de «Llamar»: auricular desde el principio, las dos por la misma salida
  await A.click('#llamar'); await espera(1500);
  if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar');
  await espera(4500);
  let s = await estadoSalida(A);
  comprueba(s.voz === 'aur-1' && s.ruta === 'aur-1', 'voz: la otra persona y el silencio, por el auricular', s);
  comprueba(s.rutaSuena, 'el silencio suena (fija la salida)');
  comprueba(s.boton && s.pulsado === 'false', 'botón «Altavoz» visible y apagado');
  comprueba(s.vuelve >= 2, 'el silencio vuelve a empezar tras conectar (para ser el último)', s.vuelve);
  comprueba(s.mudaVuelve >= 2 && s.mudaActiva === true, 'la pista muda de la otra persona también vuelve a empezar, y queda encendida', [s.mudaVuelve, s.mudaActiva]);
  const sB = await estadoSalida(B);
  comprueba(sB.voz === 'aur-1' && sB.ruta === 'aur-1' && sB.rutaSuena, 'quien contesta: también por el auricular', sB);

  // 2. el botón cambia las dos a la vez, y el silencio vuelve a empezar
  const antes = s.vuelve;
  await A.click('#ll-altavoz'); await espera(1800);
  s = await estadoSalida(A);
  comprueba(s.voz === 'alt-1' && s.ruta === 'alt-1' && s.pulsado === 'true', 'toque en «Altavoz»: las dos por el altavoz', s);
  comprueba(s.vuelve > antes, 'tras el cambio, el silencio vuelve a empezar', s.vuelve);
  await A.click('#ll-altavoz'); await espera(1800);
  s = await estadoSalida(A);
  comprueba(s.voz === 'aur-1' && s.ruta === 'aur-1' && s.pulsado === 'false', 'otro toque: las dos por el auricular', s);

  // 3. colgar: fuera el silencio; la salida elegida se queda
  await A.click('#ll-colgar'); await espera(1500);
  s = await estadoSalida(A);
  comprueba(!s.rutaSuena && s.voz === 'aur-1', 'al colgar: el silencio para y la salida se queda', s);

  // 4. otra llamada de voz sin toque válido (como si el permiso tardara): ya va por el auricular, sin pedir nada
  await A.evaluate(() => { window.__sink.sinGesto = true; window.__sink.llamadas = []; });
  await espera(800);
  await A.click('#llamar'); await espera(1500);
  if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar');
  await espera(4500);
  s = await estadoSalida(A);
  comprueba(s.voz === 'aur-1' && s.ruta === 'aur-1' && s.rutaSuena && s.pulsado === 'false', 'sin toque: la llamada de voz sigue por el auricular elegido antes', s);

  // 5. videollamada sin toque válido: no puede pasar al altavoz; el botón dice la verdad (apagado) y un toque lo cambia
  await A.click('#ll-colgar'); await espera(1500);
  await A.click('#videollamar'); await espera(1500);
  if (await B.$('#ll-contestar:visible')) await B.click('#ll-contestar');
  await espera(4500);
  s = await estadoSalida(A);
  comprueba(s.voz === 'aur-1' && s.pulsado === 'false' && s.boton, 'videollamada sin toque: el botón dice que va por el auricular', s);
  await A.evaluate(() => { window.__sink.sinGesto = false; });
  // en la videollamada los botones se esconden a los pocos segundos (como FaceTime): un toque en la imagen los devuelve
  await A.touchscreen.tap(196, 200); await espera(600);
  await A.click('#ll-altavoz'); await espera(1500);
  s = await estadoSalida(A);
  comprueba(s.voz === 'alt-1' && s.ruta === 'alt-1' && s.pulsado === 'true' && s.rutaSuena, 'un toque: las dos al altavoz', s);
  await A.click('#ll-colgar'); await espera(1200);

  // 6. primera vez en un teléfono sin salida guardada y sin toque: por el altavoz, y el botón lo dice
  const C = await telefono(browser);
  await C.goto(URL0); await espera(1500);
  await C.click('#nueva-blindada'); if (await C.$('#h-invitar.gc-abierta')) await C.click('#invitar-otra'); await espera(900);
  const url2 = String((await C.evaluate(() => window.__compartidos[0])).url).replace('https://guardianagroup.com', 'http://127.0.0.1:8080');
  const D = await telefono(browser);
  await D.goto(url2); await espera(1500); if (await D.$('#paso-ios:not([hidden]) #ios-safari')) { await D.evaluate(() => document.querySelector('#ios-safari').click()); await espera(900); } await D.click('#aceptar-si'); await espera(5000);
  await C.click('#ccontacto-si'); await C.fill('#nombre-conv', 'D'); await C.click('#nombre-guardar'); await espera(500);
  await C.evaluate(() => { window.__sink.sinGesto = true; });
  await C.click('#llamar'); await espera(1500);
  if (await D.$('#ll-contestar:visible')) await D.click('#ll-contestar');
  await espera(4500);
  s = await estadoSalida(C);
  comprueba(s.voz === '' && s.pulsado === 'true' && s.boton, 'sin toque y sin salida guardada: por el altavoz y el botón encendido', s);
  await C.evaluate(() => { window.__sink.sinGesto = false; });
  await C.click('#ll-altavoz'); await espera(1500);
  s = await estadoSalida(C);
  comprueba(s.voz === 'aur-1' && s.ruta === 'aur-1' && s.pulsado === 'false' && s.rutaSuena, 'un toque en «Altavoz»: al auricular', s);
  await C.click('#ll-colgar'); await espera(800);

  await browser.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
