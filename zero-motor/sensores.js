// ZERO · sensores dentro de la celda (26 Oct 2026, ronda 40).
// Este código se inyecta en cada marco ANTES de que corra el de la web (addInitScript). Observa lo que la web intenta
// (huella digital, permisos, WebRTC, formularios sin cifrar, subasta de anuncios) y lo cuenta al motor por
// window.__zeroSuceso. Lo que es solo observación (huella) no se bloquea: se cuenta. Lo que da acceso al equipo
// (micrófono, cámara, ubicación, portapapeles, WebRTC) se deniega siempre: en la celda no hay nada del cliente.
'use strict';

module.exports = String.raw`(() => {
  const avisa = window.__zeroSuceso;
  if (typeof avisa !== 'function') return;
  const origen = location.origin;
  const vistos = new Set();
  const unaVez = (clave, dato) => { if (vistos.has(clave)) return; vistos.add(clave); try { avisa(JSON.stringify({ origen, ...dato })); } catch (_) {} };
  const cuenta = (dato) => { try { avisa(JSON.stringify({ origen, ...dato })); } catch (_) {} };
  const deniega = (nombre) => { const e = new DOMException('Permiso denegado por ZERO', 'NotAllowedError'); return Promise.reject(e); };
  const envuelve = (obj, prop, f) => {
    if (!obj) return;
    const d = Object.getOwnPropertyDescriptor(obj, prop);
    if (!d || typeof d.value !== 'function') return;
    const orig = d.value;
    try { Object.defineProperty(obj, prop, { ...d, value: function (...a) { return f.call(this, orig, a); } }); } catch (_) {}
  };

  // ---- huella digital (se observa, no se rompe la web) ----
  envuelve(HTMLCanvasElement.prototype, 'toDataURL', function (orig, a) { unaVez('canvas', { clase: 'huella', via: 'canvas' }); return orig.apply(this, a); });
  envuelve(HTMLCanvasElement.prototype, 'toBlob', function (orig, a) { unaVez('canvas', { clase: 'huella', via: 'canvas' }); return orig.apply(this, a); });
  envuelve(CanvasRenderingContext2D.prototype, 'getImageData', function (orig, a) { unaVez('canvas', { clase: 'huella', via: 'canvas' }); return orig.apply(this, a); });
  for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    envuelve(C && C.prototype, 'getParameter', function (orig, a) { if (a[0] === 37445 || a[0] === 37446) unaVez('webgl', { clase: 'huella', via: 'webgl' }); return orig.apply(this, a); });
  }
  envuelve(window.OfflineAudioContext && OfflineAudioContext.prototype, 'startRendering', function (orig, a) { unaVez('audio', { clase: 'huella', via: 'audio' }); return orig.apply(this, a); });
  envuelve(window.AnalyserNode && AnalyserNode.prototype, 'getFloatFrequencyData', function (orig, a) { unaVez('audio', { clase: 'huella', via: 'audio' }); return orig.apply(this, a); });
  // muchas medidas de texto seguidas = sondeo de tipos de letra
  let medidas = 0, t0 = 0;
  envuelve(CanvasRenderingContext2D.prototype, 'measureText', function (orig, a) {
    const t = Date.now(); if (t - t0 > 2000) { medidas = 0; t0 = t; }
    if (++medidas === 40) unaVez('fuentes', { clase: 'huella', via: 'fuentes' });
    return orig.apply(this, a);
  });
  try {
    const dp = Object.getOwnPropertyDescriptor(Navigator.prototype, 'plugins');
    if (dp && dp.get) Object.defineProperty(Navigator.prototype, 'plugins', { ...dp, get: function () { unaVez('plugins', { clase: 'huella', via: 'plugins' }); return dp.get.call(this); } });
  } catch (_) {}

  // ---- permisos: en la celda no hay micrófono, cámara, ubicación ni portapapeles del cliente ----
  if (navigator.mediaDevices) {
    envuelve(MediaDevices.prototype, 'getUserMedia', function (orig, a) { const c = a[0] || {}; cuenta({ clase: 'permiso', que: c.audio && c.video ? 'micrófono y cámara' : c.video ? 'cámara' : 'micrófono' }); return deniega(); });
    envuelve(MediaDevices.prototype, 'getDisplayMedia', function () { cuenta({ clase: 'permiso', que: 'pantalla' }); return deniega(); });
  }
  if (navigator.geolocation) {
    const err = (cb) => { try { cb && cb({ code: 1, message: 'Permiso denegado por ZERO', PERMISSION_DENIED: 1 }); } catch (_) {} };
    envuelve(Geolocation.prototype, 'getCurrentPosition', function (orig, a) { cuenta({ clase: 'permiso', que: 'ubicación' }); err(a[1]); });
    envuelve(Geolocation.prototype, 'watchPosition', function (orig, a) { cuenta({ clase: 'permiso', que: 'ubicación' }); err(a[1]); return 0; });
  }
  if (navigator.clipboard) {
    envuelve(Clipboard.prototype, 'readText', function () { cuenta({ clase: 'permiso', que: 'portapapeles' }); return deniega(); });
    envuelve(Clipboard.prototype, 'read', function () { cuenta({ clase: 'permiso', que: 'portapapeles' }); return deniega(); });
  }
  if (window.Notification) {
    try { Notification.requestPermission = function () { cuenta({ clase: 'permiso', que: 'notificaciones' }); return Promise.resolve('denied'); }; } catch (_) {}
  }
  // lectura furtiva del portapapeles por el evento paste sin acción del usuario no es posible; «copy» con datos
  // inyectados sí: se observa
  document.addEventListener('copy', (e) => { if (!e.isTrusted) cuenta({ clase: 'permiso', que: 'portapapeles (escritura)' }); }, true);

  // ---- conexiones directas (WebRTC) ----
  for (const n of ['RTCPeerConnection', 'webkitRTCPeerConnection', 'RTCDataChannel']) {
    if (!window[n]) continue;
    try {
      const Orig = window[n];
      const Falso = function () { cuenta({ clase: 'webrtc' }); throw new DOMException('WebRTC desactivado por ZERO', 'NotSupportedError'); };
      Falso.prototype = Orig.prototype;
      Object.defineProperty(window, n, { value: Falso, configurable: true, writable: true });
    } catch (_) {}
  }

  // ---- formularios que enviarían datos sin cifrar ----
  const sinCifrar = (f) => {
    try {
      const accion = f.getAttribute('action');
      const u = new URL(accion || location.href, location.href);
      return u.protocol === 'http:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1';
    } catch (_) { return false; }
  };
  document.addEventListener('submit', (e) => {
    const f = e.target; if (!(f instanceof HTMLFormElement)) return;
    if (sinCifrar(f)) { e.preventDefault(); e.stopImmediatePropagation(); cuenta({ clase: 'formulario', accion: f.getAttribute('action') || location.href, detenido: true }); }
  }, true);
  document.addEventListener('focusin', (e) => {
    const el = e.target; if (!el || !el.form) return;
    if (sinCifrar(el.form) && (el.type === 'password' || /tarjeta|card|iban|dni|pass/i.test(el.name + ' ' + el.id + ' ' + el.autocomplete))) unaVez('form-' + (el.form.action || ''), { clase: 'formulario', accion: el.form.getAttribute('action') || location.href, detenido: false, aviso: true });
  }, true);

  // ---- subasta de anuncios: si la web la monta con Prebid o Google Publisher Tag, se lee entera ----
  // Las dos bibliotecas ejecutan una cola de funciones (pbjs.que / googletag.cmd). Se vigila el momento en que la web
  // crea el objeto y se cuela la primera función de la cola: así los oyentes quedan puestos antes de la primera subasta.
  const enganchaPrebid = (p) => {
    if (!p || p.__zero) return; p.__zero = true;
    const listo = () => {
      if (typeof p.onEvent !== 'function') return;
      const ev = (nombre, f) => { try { p.onEvent(nombre, f); } catch (_) {} };
      const subastas = {};
      ev('auctionInit', (a) => { subastas[a.auctionId] = { inicio: Date.now(), unidades: (a.adUnitCodes || []).length, pujadores: new Set() }; });
      ev('bidRequested', (b) => { const s = subastas[b.auctionId]; if (s) s.pujadores.add(b.bidderCode); });
      ev('auctionEnd', (a) => {
        const s = subastas[a.auctionId] || {};
        const pujas = (a.bidsReceived || []).map((b) => ({ pujador: b.bidderCode || b.bidder, cpm: b.cpm, moneda: b.currency, ms: b.timeToRespond, tam: b.size, unidad: b.adUnitCode, anunciante: b.meta && (b.meta.advertiserDomains || []).join(',') }));
        const sinPuja = (a.noBids || []).map((b) => b.bidderCode || b.bidder);
        cuenta({ clase: 'subasta', fase: 'fin', id: a.auctionId, ms: s.inicio ? Date.now() - s.inicio : (a.auctionEnd && a.timestamp ? a.auctionEnd - a.timestamp : null), unidades: s.unidades || (a.adUnitCodes || []).length, pedidos: [...(s.pujadores || [])], pujas, sinPuja });
      });
      ev('bidWon', (b) => cuenta({ clase: 'subasta', fase: 'ganada', id: b.auctionId, pujador: b.bidderCode || b.bidder, cpm: b.cpm, moneda: b.currency, tam: b.size, unidad: b.adUnitCode, anunciante: b.meta && (b.meta.advertiserDomains || []).join(',') }));
    };
    try {
      if (Array.isArray(p.que)) p.que.unshift(listo); else if (p.que && typeof p.que.push === 'function') p.que.push(listo); else p.que = [listo];
    } catch (_) {}
  };
  const enganchaGoogle = (g) => {
    if (!g || g.__zero) return; g.__zero = true;
    const listo = () => { try { g.pubads().addEventListener('slotRenderEnded', (e) => cuenta({ clase: 'subasta', fase: 'google', unidad: e.slot && e.slot.getAdUnitPath && e.slot.getAdUnitPath(), vacio: e.isEmpty, anunciante: e.advertiserId, campana: e.campaignId, linea: e.lineItemId, relleno: e.isBackfill, tam: Array.isArray(e.size) ? e.size.join('x') : e.size })); } catch (_) {} };
    try { if (Array.isArray(g.cmd)) g.cmd.unshift(listo); else if (g.cmd && typeof g.cmd.push === 'function') g.cmd.push(listo); else g.cmd = [listo]; } catch (_) {}
  };
  const vigila = (nombre, f) => {
    let valor = window[nombre];
    if (valor) { f(valor); return; }
    try {
      Object.defineProperty(window, nombre, { configurable: true, enumerable: true, get: () => valor, set: (v) => { valor = v; try { f(v); } catch (_) {} } });
    } catch (_) {}
  };
  vigila('pbjs', enganchaPrebid);
  vigila('googletag', enganchaGoogle);
})();`;
