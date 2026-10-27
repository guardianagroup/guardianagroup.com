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
      const corto = (x, n) => (x == null ? null : String(x).slice(0, n || 60));
      const lista = (xs, n) => (Array.isArray(xs) ? xs : []).slice(0, n || 12);
      // Configuración de Prebid que afecta a la subasta: se lee una vez por subasta (sin claves ni valores privados).
      const configura = () => {
        try {
          const c = (typeof p.getConfig === 'function' && p.getConfig()) || {};
          const s2s = (Array.isArray(c.s2sConfig) ? c.s2sConfig : [c.s2sConfig]).filter(Boolean);
          const sync = c.userSync || {};
          const schain = (c.schain && c.schain.config && c.schain.config.nodes) || [];
          const cm = c.consentManagement || {};
          return {
            version: corto(p.version, 20), limite: c.bidderTimeout || null, granularidad: typeof c.priceGranularity === 'string' ? c.priceGranularity : (c.priceGranularity ? 'personalizada' : null),
            moneda: c.currency && c.currency.adServerCurrency || null, todasLasPujas: !!c.enableSendAllBids,
            servidor: lista(s2s.flatMap((x) => x.bidders || []), 20).map((x) => corto(x, 30)), servidorHost: s2s.map((x) => { try { return new URL((x.endpoint && (x.endpoint.p1Consent || x.endpoint)) || '').hostname; } catch (_) { return null; } }).filter(Boolean).slice(0, 3),
            sync: { pixel: !!sync.pixelEnabled, iframe: !!sync.iframeEnabled, porPujador: sync.syncsPerBidder != null ? sync.syncsPerBidder : null, espera: sync.syncDelay != null ? sync.syncDelay : null },
            cadena: lista(schain, 10).map((n) => ({ asi: corto(n.asi, 40), sid: corto(n.sid, 40), hp: n.hp })),
            cmp: corto((cm.gdpr && cm.gdpr.cmpApi) || cm.cmpApi, 20),
            modulosId: lista(Object.keys((typeof p.getUserIds === 'function' && p.getUserIds()) || {}), 12).map((x) => corto(x, 30)),
          };
        } catch (_) { return null; }
      };
      // Consentimiento TCF (lo que la web dice que has consentido): fines y nº de proveedores con consentimiento.
      const leeTcf = (s) => {
        try {
          if (typeof window.__tcfapi !== 'function') return;
          window.__tcfapi('getTCData', 2, (d, ok) => {
            if (!ok || !d) return;
            const fines = Object.entries((d.purpose && d.purpose.consents) || {}).filter(([, v]) => v).map(([k]) => +k);
            const vend = Object.values((d.vendor && d.vendor.consents) || {}).filter(Boolean).length;
            s.tcf = { aplica: d.gdprApplies === true, cmp: d.cmpId || null, fines: fines.slice(0, 12), proveedores: vend, pais: corto(d.publisherCC, 4) };
          });
        } catch (_) {}
      };
      ev('auctionInit', (a) => { const s = { inicio: Date.now(), limite: a.timeout || null, unidades: (a.adUnitCodes || []).length, pujadores: new Set(), tarde: new Set(), config: configura() }; subastas[a.auctionId] = s; leeTcf(s); });
      // Qué llevaba cada petición de puja (dueño, 26 Oct 2026: «qué información, el máximo que podamos saber»). Se lee del
      // propio objeto de Prebid: dirección de la página y referente, tamaños y tipo del hueco, consentimiento, identificadores
      // de usuario (módulos userId / eids), datos de primera parte (palabras clave, segmentos, año de nacimiento, género,
      // categorías del sitio), idioma, ubicación y datos del navegador (ortb2), y si la petición salió por cliente o por servidor.
      const llevaba = (b) => {
        const o = b.ortb2 || {}; const ids = new Set(); const tams = new Set(); const tipos = new Set(); const params = new Set();
        const ri = b.refererInfo || {}; const u = o.user || {}; const si = o.site || {}; const dv = o.device || {};
        const pet = {
          pagina: !!(ri.page || ri.topmostLocation || ri.referer || si.page), referente: !!(ri.ref || si.ref),
          consent: !!((b.gdprConsent && b.gdprConsent.consentString) || b.uspConsent || (b.gppConsent && b.gppConsent.gppString)),
          gdpr: b.gdprConsent ? b.gdprConsent.gdprApplies === true : null, usp: corto(b.uspConsent, 8), gpp: !!(b.gppConsent && b.gppConsent.gppString),
          geo: !!(dv.geo || u.geo), coordenadas: !!((dv.geo && (dv.geo.lat != null)) || (u.geo && (u.geo.lat != null))),
          navegador: !!(dv.ua || dv.sua), idioma: corto(dv.language || (si.content && si.content.language), 8),
          palabrasSitio: !!(si.keywords || (si.content && si.content.keywords)), categoriasSitio: lista(si.cat || si.sectioncat || si.pagecat, 6).map((x) => corto(x, 20)),
          palabrasUsuario: !!u.keywords, segmentos: lista(u.data, 8).map((d) => corto(d.name || (d.ext && d.ext.segtax), 30)).filter(Boolean), nSegmentos: lista(u.data, 50).reduce((n, d) => n + ((d.segment || []).length), 0),
          nacimiento: u.yob != null, genero: !!u.gender,
          via: b.src === 's2s' ? 'servidor' : 'cliente',
        };
        for (const e of ((u.ext && u.ext.eids) || [])) if (e && e.source) ids.add(e.source);
        for (const bid of (b.bids || [])) {
          for (const e of (bid.userIdAsEids || [])) if (e && e.source) ids.add(e.source);
          for (const [k, v] of Object.entries(bid.userId || {})) if (v != null && v !== '' && !(typeof v === 'object' && !Object.keys(v).length)) ids.add(k);
          const mt = bid.mediaTypes || {};
          for (const k of Object.keys(mt)) tipos.add(k);
          const sz = (mt.banner && mt.banner.sizes) || bid.sizes || [];
          for (const t of sz) if (Array.isArray(t) && t.length === 2) tams.add(t.join('x'));
          if (mt.video && mt.video.playerSize) for (const t of (Array.isArray(mt.video.playerSize[0]) ? mt.video.playerSize : [mt.video.playerSize])) if (Array.isArray(t) && t.length === 2) tams.add(t.join('x') + ' vídeo');
          for (const [k, v] of Object.entries(bid.params || {})) if (['string', 'number', 'boolean'].includes(typeof v)) params.add(k + '=' + corto(v, 24));
        }
        pet.ids = [...ids].slice(0, 12); pet.tam = [...tams].slice(0, 8); pet.tipos = [...tipos].slice(0, 4); pet.cuenta = [...params].slice(0, 6);
        return pet;
      };
      ev('bidRequested', (b) => { const s = subastas[b.auctionId]; if (s) { s.pujadores.add(b.bidderCode); try { (s.peticiones = s.peticiones || {})[b.bidderCode] = llevaba(b); } catch (_) {} } });
      ev('bidTimeout', (xs) => { for (const x of (Array.isArray(xs) ? xs : [xs])) { const s = x && subastas[x.auctionId]; if (s) s.tarde.add(x.bidder || x.bidderCode); } });
      const puja = (b) => {
        const m = b.meta || {};
        return { pujador: b.bidderCode || b.bidder, cpm: b.cpm, moneda: b.currency, original: b.originalCpm != null && b.originalCurrency && b.originalCurrency !== b.currency ? { cpm: b.originalCpm, moneda: b.originalCurrency } : null, neto: b.netRevenue === true ? true : b.netRevenue === false ? false : null,
          ms: b.timeToRespond, tam: b.size, tipo: corto(b.mediaType, 10), unidad: b.adUnitCode, acuerdo: corto(b.dealId, 40), creatividad: corto(b.creativeId, 40), ttl: b.ttl || null, via: b.source === 's2s' ? 'servidor' : 'cliente',
          anunciante: lista(m.advertiserDomains, 6).map((x) => corto(x, 60)).join(','), anuncianteNombre: corto(m.advertiserName, 60), marca: corto(m.brandName, 60), agencia: corto(m.agencyName, 60), red: corto(m.networkName, 60), categoria: corto(m.primaryCatId, 20), dcadena: m.dchain && Array.isArray(m.dchain.nodes) ? m.dchain.nodes.length : null,
          tramo: b.adserverTargeting && corto(b.adserverTargeting.hb_pb, 12) };
      };
      ev('auctionEnd', (a) => {
        const s = subastas[a.auctionId] || {};
        const pujas = (a.bidsReceived || []).map(puja);
        const sinPuja = (a.noBids || []).map((b) => b.bidderCode || b.bidder);
        cuenta({ clase: 'subasta', fase: 'fin', id: a.auctionId, ms: s.inicio ? Date.now() - s.inicio : (a.auctionEnd && a.timestamp ? a.auctionEnd - a.timestamp : null), limite: s.limite || a.timeout || null, unidades: s.unidades || (a.adUnitCodes || []).length, pedidos: [...(s.pujadores || [])], pujas, sinPuja, tarde: [...(s.tarde || [])], peticiones: s.peticiones || {}, config: s.config || null, tcf: s.tcf || null });
      });
      ev('bidWon', (b) => { const x = puja(b); cuenta({ clase: 'subasta', fase: 'ganada', id: b.auctionId, ...x, objetivo: b.adserverTargeting ? { pujador: corto(b.adserverTargeting.hb_bidder, 30), tramo: corto(b.adserverTargeting.hb_pb, 12), tam: corto(b.adserverTargeting.hb_size, 12) } : null }); });
    };
    try {
      if (Array.isArray(p.que)) p.que.unshift(listo); else if (p.que && typeof p.que.push === 'function') p.que.push(listo); else p.que = [listo];
    } catch (_) {}
  };
  const enganchaGoogle = (g) => {
    if (!g || g.__zero) return; g.__zero = true;
    const listo = () => { try { g.pubads().addEventListener('slotRenderEnded', (e) => {
      let hb = null; try { const m = e.slot && e.slot.getTargetingMap ? e.slot.getTargetingMap() : {}; if (m && (m.hb_bidder || m.hb_pb)) hb = { pujador: String((m.hb_bidder || [])[0] || '').slice(0, 30), tramo: String((m.hb_pb || [])[0] || '').slice(0, 12), tam: String((m.hb_size || [])[0] || '').slice(0, 12) }; } catch (_) {}
      cuenta({ clase: 'subasta', fase: 'google', unidad: e.slot && e.slot.getAdUnitPath && e.slot.getAdUnitPath(), vacio: e.isEmpty, anunciante: e.advertiserId, campana: e.campaignId, linea: e.lineItemId, creatividad: e.creativeId || e.sourceAgnosticCreativeId || null, relleno: e.isBackfill, grupos: Array.isArray(e.yieldGroupIds) ? e.yieldGroupIds.length : null, empresas: Array.isArray(e.companyIds) ? e.companyIds.length : null, tam: Array.isArray(e.size) ? e.size.join('x') : e.size, objetivo: hb });
    }); } catch (_) {} };
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
  // 27 Oct 2026 (dueño: «detectar el máximo»): muchas webs compilan Prebid con otro nombre global (p. ej. «ue_pbjs»).
  // Prebid apunta cada nombre en window._pbjsGlobals: se vigila esa lista y se engancha cada uno.
  const nombresPrebid = new Set(['pbjs']);
  const apuntaNombre = (n) => { n = String(n || ''); if (!n || nombresPrebid.has(n) || !/^[A-Za-z_$][\w$]{0,40}$/.test(n)) return; nombresPrebid.add(n); vigila(n, enganchaPrebid); };
  const vigilaLista = (arr) => {
    if (!Array.isArray(arr) || arr.__zero) return; arr.__zero = true;
    arr.forEach(apuntaNombre);
    const push = arr.push; try { arr.push = function () { const r = push.apply(this, arguments); for (const n of arguments) apuntaNombre(n); return r; }; } catch (_) {}
  };
  vigila('_pbjsGlobals', vigilaLista);
  vigila('googletag', enganchaGoogle);

  // 26 Oct 2026 (dueño: «no aparecía la mano»): el cursor que pediría la web (mano en enlaces, barra en texto) se cuenta al
  // motor cuando cambia, y la página lo pinta sobre la pantalla. Solo observación; no toca la web.
  let ultimoCursor = '';
  const cursorDe = (el) => {
    try {
      while (el && el.nodeType !== 1) el = el.parentNode;
      if (!el) return 'default';
      let c = getComputedStyle(el).cursor;
      if (c === 'auto') {
        const t = el.closest && el.closest('a[href],button,[role=button],input,textarea,select,summary,label,[contenteditable]');
        if (!t) c = 'default';
        else if (t.isContentEditable || (/^(input|textarea)$/i.test(t.tagName) && !/^(button|submit|reset|checkbox|radio|range|color|file|image)$/i.test(t.type || ''))) c = 'text';
        else c = 'pointer';
      }
      return c;
    } catch (_) { return 'default'; }
  };
  let ultimoHref = '';
  const hrefDe = (el) => { try { while (el && el.nodeType !== 1) el = el.parentNode; const a = el && el.closest && el.closest('a[href]'); const h = a ? String(a.href || '') : ''; return /^https?:/.test(h) ? h.slice(0, 500) : ''; } catch (_) { return ''; } };
  addEventListener('mousemove', (e) => { const c = cursorDe(e.target), h = hrefDe(e.target); if (c !== ultimoCursor || h !== ultimoHref) { ultimoCursor = c; ultimoHref = h; avisa(JSON.stringify({ clase: 'cursor', cursor: c, href: h })); } }, { capture: true, passive: true });
})();`;
