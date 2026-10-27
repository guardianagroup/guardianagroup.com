// ZERO · servidor del prototipo del motor (26 Oct 2026, ronda 40).
//
// Una sesión = un contexto de Chromium aislado controlado por Playwright (en producción, una microVM por sesión). El
// cliente (orbita/zero/) recibe la pantalla por WebSocket (CDP Page.startScreencast, JPEG) y manda ratón y teclado.
// Cada petición de la web pasa por el motor de cortes (cortes.js); los sensores (sensores.js) cuentan lo que la web
// intenta dentro de la celda. Todo suceso se manda al cliente con su certeza (comprobado / probable / estimado) y, si
// se conoce, la empresa y el país de su sede (empresas.js).
//
// Uso: node zero-motor/servidor.js [puerto=8792]
//   ZERO_MOCK=1  → las conexiones permitidas a terceros se responden con un simulacro local (pruebas sin internet)
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const { WS } = require('./ws');
const { Cortes } = require('./cortes');
const { Empresas, baseDominio } = require('./empresas');
const SENSORES = require('./sensores');
const { Senuelos } = require('./senuelos');
const { Rele } = require('./comunicaciones');
const { FiltroRed, onionVetada, esOnion, ipProhibida, nombreLocal } = require('./filtro-red');

const RAIZ = path.join(__dirname, '..');
const PUERTO = +process.argv[2] || 8792;
const MOCK = !!process.env.ZERO_MOCK;
const SESIONES = new Map(); // token de señuelo → sesión (para el colector /s/<token>)
const VERSION = 'prototipo 0.1 · 26 Oct 2026';
const CLAVE_SESION = crypto.randomBytes(32); // efímera: con ella se sella el comprobante de cada sesión
// Blindaje del motor (26 Oct 2026, ronda 40 punto 11): solo las páginas de GUARDIANA pueden abrir sesiones; hay un tope
// de celdas vivas; una celda que nadie mira se cierra sola; ningún mensaje puede ser enorme; en la celda solo se abren
// direcciones http(s).
const ORIGENES = (process.env.ZERO_ORIGENES || 'https://guardianagroup.com,https://www.guardianagroup.com,http://127.0.0.1,http://localhost').split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean);
const MAX_SESIONES = +process.env.ZERO_MAX_SESIONES || 8;
const TOR_PROXY = process.env.ZERO_TOR_PROXY || ''; // p. ej. socks5://127.0.0.1:9050 en el servidor con Tor; sin él, ULTRA no se ofrece
// Celda sellada hacia dentro y ULTRA capado (26 Oct 2026, dueño; ronda 50b): cada celda sale por su propio filtro SOCKS
// (filtro-red.js). Ninguna web abierta en ZERO puede conectar con este servidor, con redes privadas ni con los metadatos del
// proveedor; y con ULTRA, Tor solo sirve para la web normal: toda .onion fuera, salvo servicios oficiales verificados.
// ZERO_FILTRO_RED=0 quita el filtro de las celdas normales (ULTRA lo lleva siempre). En pruebas locales (sin ZERO_PUBLICO,
// o con ZERO_PERMITE_LOCAL=1) se deja llegar a 127.0.0.1 para los sitios de prueba.
const FILTRO_RED = process.env.ZERO_FILTRO_RED !== '0';
const PERMITE_LOCAL = process.env.ZERO_PERMITE_LOCAL === '1' || !process.env.ZERO_PUBLICO;
const TXT_LOCAL = 'Conexión con una dirección interna bloqueada. Las webs abiertas en ZERO no pueden llegar a este servidor, a redes privadas ni a los datos internos del proveedor.';
const TXT_ONION = 'Dirección .onion bloqueada. ULTRA navega solo por la web normal: ZERO no abre la parte oculta de Tor, salvo servicios oficiales verificados (como el buscador de Brave).';
const TXT_ONION_SIN_ULTRA = 'Las direcciones .onion solo se abren con ULTRA activado, y solo las de servicios oficiales verificados (como el buscador de Brave).';
const MAX_MENSAJE = 64 * 1024;
const MIN_SIN_MIRAR = +process.env.ZERO_MIN_SIN_MIRAR || 30; // minutos con la pantalla dormida antes de destruir la celda
const MAX_HORAS = +process.env.ZERO_MAX_HORAS || 12; // vida máxima de una celda
// Dirección pública del motor (detrás del proxy TLS): con ella se construye el enlace oculto del señuelo, que debe ser
// alcanzable desde fuera para que una visita al enlace llegue al colector /s/<token>. Sin ella, el propio puerto local.
const PUBLICO = String(process.env.ZERO_PUBLICO || '').replace(/\/$/, '') || ('http://127.0.0.1:' + PUERTO);
// Comunicaciones (26 Oct 2026): el relé de chat, llamadas y archivos vive en este mismo proceso, en /com. No guarda nada.
const RELE = new Rele({ turnHost: process.env.TURN_HOST || (() => { try { return new URL(PUBLICO).hostname; } catch (_) { return ''; } })(), turnSecreto: process.env.TURN_SECRETO || '', turnPuerto: +(process.env.TURN_PUERTO || 3478), region: process.env.ZERO_REGION || '' });
const VIVAS = new Set();
function origenPermitido(req) {
  const o = String(req.headers.origin || '').replace(/\/$/, '');
  if (!o) return false;
  return ORIGENES.some((p) => o === p || (p.startsWith('http://127.0.0.1') && /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(o)) || (p.startsWith('http://localhost') && /^http:\/\/localhost(:\d+)?$/.test(o)));
}

const cortes = new Cortes();
const nListas = cortes.cargaCarpeta(path.join(__dirname, 'listas'));
const empresas = new Empresas(RAIZ);
let navegador = null;

const hostDe = (u) => { try { return new URL(u).hostname; } catch (_) { return ''; } };
const ahora = () => new Date().toISOString();
const esLocal = (h) => h === '127.0.0.1' || h === 'localhost' || h === '::1';

const ATRASO_MAX = 192 * 1024; // bytes en cola hacia la persona a partir de los cuales no se mandan cuadros atrasados
const TIPO_ABP = { stylesheet: 'stylesheet', image: 'image', media: 'media', font: 'font', script: 'script', texttrack: 'other', xhr: 'xmlhttprequest', fetch: 'xmlhttprequest', eventsource: 'other', websocket: 'websocket', manifest: 'other', ping: 'ping', other: 'other' };
const PROPOSITO = { publicidad: 'Publicidad', rastreo: 'Rastreador', malware: 'Web peligrosa', 'avisos-cookies': 'Aviso de cookies', 'red-local': 'Red local', excepciones: '', parametros: 'Seguimiento', 'otra-empresa': 'Otra empresa' };

// Página que ve la persona dentro de la celda cuando ZERO detiene una web peligrosa o un certificado roto
function paginaBloqueo(titulo, texto, detalle) {
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return `<!doctype html><html lang="es"><meta charset="utf-8"><title>ZERO</title><style>
  html,body{margin:0;height:100%;background:#06080C;color:#F4F6F8;font:16px/1.5 "Segoe UI",Inter,Arial,sans-serif}
  main{max-width:560px;margin:0 auto;padding:12vh 24px}.k{font:12px/1 Consolas,monospace;letter-spacing:.22em;color:#9CC3E4}
  h1{font-size:26px;font-weight:600;margin:14px 0 10px}p{color:#cfe1ee;margin:0 0 12px}small{display:block;color:#7f97aa;font-size:12.5px;margin-top:18px;word-break:break-all}
  .l{height:2px;width:56px;background:#E07A6C;margin:18px 0}</style><main><div class="k">ZERO · DETENIDO AQUÍ</div><h1>${esc(titulo)}</h1><div class="l"></div><p>${esc(texto)}</p><small>${esc(detalle)}</small></main></html>`;
}

// Poda lo que cuenta el sensor de la subasta antes de enseñarlo: solo banderas, números y nombres cortos (nunca valores
// largos ni claves); profundidad, tamaño de listas y longitud de textos acotados.
function poda(x, prof) {
  prof = prof || 0;
  if (x == null) return null;
  if (typeof x === 'string') return x.slice(0, 80);
  if (typeof x === 'number' || typeof x === 'boolean') return x;
  if (prof >= 4) return null;
  if (Array.isArray(x)) return x.slice(0, 20).map((y) => poda(y, prof + 1));
  if (typeof x === 'object') { const o = {}; for (const [k, v] of Object.entries(x).slice(0, 40)) o[String(k).slice(0, 40)] = poda(v, prof + 1); return o; }
  return null;
}

class Sesion {
  constructor(ws) {
    this.ws = ws; this.id = crypto.randomBytes(6).toString('hex'); this.creada = Date.now();
    this.ctx = null; this.w = 1100; this.h = 760; this.mirando = true;
    // pestañas: cada una con su página, su sesión CDP y sus cuentas «en esta web»; this.act es la que se ve
    this.pestanas = []; this.act = null; this.nPest = 0; this.esperadas = 0;
    this.sucesos = [];
    this.destruida = false; this.operaciones = [];
    this.senuelos = new Senuelos(PUBLICO); SESIONES.set(this.senuelos.token, this);
    this.alerta = 0; this.puntos = 0; this.motivos = []; this.sellada = false; this.ultimos = [];
    this.descargas = new Map(); this.nDesc = 0;
    this.permitidas = new Set(); // dominios base o 'e:<empresa>' que la persona ha permitido en esta sesión
    this.nCuadros = { enviados: 0, descartados: 0 }; this.cuadroPendiente = null;
    ws.on('drain', () => { if (this.cuadroPendiente && this.ws.abierto && this.ws.atraso <= ATRASO_MAX) { const d = this.cuadroPendiente; this.cuadroPendiente = null; this.ws.send(Buffer.from(d, 'base64')); this.nCuadros.enviados++; } });
    this.nivel = process.env.ZERO_NIVEL_INICIAL || 'observar'; // 26 Oct 2026: por defecto se abre todo y la persona elige qué cortar
    VIVAS.add(this); this.ultimaMirada = Date.now();
    ws.on('message', (m, bin) => { if (bin) return; if (m.length > MAX_MENSAJE) { this.op('mensaje demasiado grande: descartado'); return; } this.mensaje(m).catch(() => {}); });
    ws.on('close', () => this.destruye('conexión cerrada'));
    this.vigilante = setInterval(() => {
      const t = Date.now();
      if (!this.mirando && t - this.ultimaMirada > MIN_SIN_MIRAR * 60000) this.destruye('celda sin nadie mirando durante ' + MIN_SIN_MIRAR + ' min').catch(() => {});
      else if (t - this.creada > MAX_HORAS * 3600000) this.destruye('vida máxima de la celda (' + MAX_HORAS + ' h)').catch(() => {});
    }, 60000);
  }

  env(o) { this.ws.json(o); }

  // las cuentas «en esta web» viven en la pestaña activa (las de otras pestañas, en la suya)
  static statsNuevo() { return { n: { cortes: 0, limpiezas: 0, huella: 0, permisos: 0, cookies: 0, subastas: 0, bloqueos: 0 }, empresas: new Map(), paises: new Map(), porque: {}, cookiesVistas: new Set(), webActual: '' }; }
  get page() { return this.act ? this.act.page : null; }
  get cdp() { return this.act ? this.act.cdp : null; }
  get n() { return (this.act || { stats: Sesion.statsNuevo() }).stats.n; } set n(v) { if (this.act) this.act.stats.n = v; }
  get empresas() { return this.act ? this.act.stats.empresas : new Map(); } set empresas(v) { if (this.act) this.act.stats.empresas = v; }
  get paises() { return this.act ? this.act.stats.paises : new Map(); } set paises(v) { if (this.act) this.act.stats.paises = v; }
  get porque() { return this.act ? this.act.stats.porque : {}; } set porque(v) { if (this.act) this.act.stats.porque = v; }
  get cookiesVistas() { return this.act ? this.act.stats.cookiesVistas : new Set(); } set cookiesVistas(v) { if (this.act) this.act.stats.cookiesVistas = v; }
  get webActual() { return this.act ? this.act.stats.webActual : ''; } set webActual(v) { if (this.act) this.act.stats.webActual = v; }
  pestanaDe(page) { return this.pestanas.find((p) => p.page === page) || null; }
  pestanaDeReq(req) { try { const f = req.frame(); return f ? this.pestanaDe(f.page()) : null; } catch (_) { return null; } }
  listaPestanas() { return { t: 'pestanas', activa: this.act ? this.act.id : null, lista: this.pestanas.map((p) => ({ id: p.id, titulo: p.titulo || '', url: p.url || '', host: hostDe(p.url || '') })) }; }

  async abre(w, h, idioma) {
    this.w = Math.max(320, Math.min(1920, w | 0 || 1100)); this.h = Math.max(240, Math.min(1200, h | 0 || 760));
    // 26 Oct 2026: la celda habla el idioma de la persona (Accept-Language y navigator.language); antes siempre es-ES.
    const loc = /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(String(idioma || '')) ? String(idioma) : 'es-ES';
    this.idioma = loc;
    if (this.filtro) { this.filtro.cierra(); this.filtro = null; }
    const tor = this.ultra && TOR_PROXY ? TOR_PROXY : '';
    if (tor || FILTRO_RED) { this.filtro = new FiltroRed({ tor, permiteLocal: PERMITE_LOCAL, alVetar: (h, motivo) => this.vetada(h, motivo) }); await this.filtro.abre(); }
    this.ctx = await navegador.newContext({
      viewport: { width: this.w, height: this.h }, deviceScaleFactor: 1, locale: loc, timezoneId: 'UTC', permissions: [],
      acceptDownloads: true, serviceWorkers: 'block', extraHTTPHeaders: { 'Sec-GPC': '1', DNT: '1' }, colorScheme: 'light',
      ...(this.filtro ? { proxy: { server: this.filtro.url, bypass: '<-loopback>' } } : {}),
    });
    this.op((tor ? 'celda creada con salida por Tor (ULTRA), solo web normal: .onion bloqueadas salvo servicios oficiales verificados' : 'celda creada') + (this.filtro && !PERMITE_LOCAL ? '; sin acceso a este servidor ni a redes privadas' : ''));
    await this.ctx.exposeBinding('__zeroSuceso', (src, json) => this.sucesoPagina(src, json));
    await this.ctx.addInitScript(SENSORES);
    await this.ctx.addInitScript(this.senuelos.initScript());
    this.op('señuelos plantados: texto escondido, cookie propia, almacén local, enlace oculto');
    // 26 Oct 2026 (ronda 46): interceptar cada petición con Playwright apaga la caché de Chromium y mete a Node en el camino
    // de todas las conexiones. En Observar (no se corta nada) solo se interceptan las navegaciones (webs peligrosas y limpieza
    // de la dirección) por CDP Fetch, y el resto se observa por Network.requestWillBeSent sin tocarlo.
    this.intercepta = false;
    await this.ponIntercepcion(this.nivel !== 'observar');
    this.ctx.on('page', (p) => { if (this.esperadas > 0) { this.esperadas--; return; } this.suceso({ clase: 'popup', certeza: 'comprobado', texto: 'La web intentó abrir una ventana nueva. ZERO la cerró.', dominio: hostDe(p.url()) }); p.close().catch(() => {}); });
    await this.nuevaPestana();
    this.env({ t: 'lista', sesion: this.id, version: VERSION, listas: cortes.listas, cookiesBloqueadas: this.cookiesBloqueadas, w: this.w, h: this.h, ultraDisponible: !!TOR_PROXY, ultra: !!(this.ultra && TOR_PROXY), nivel: this.nivel, region: process.env.ZERO_REGION || '' });
  }

  async nuevaPestana(url) {
    if (this.destruida || !this.ctx) return null;
    if (this.pestanas.length >= 8) { this.op('tope de pestañas (8)'); this.env(this.listaPestanas()); return null; }
    this.esperadas++;
    const page = await this.ctx.newPage();
    const cdp = await this.ctx.newCDPSession(page);
    const p = { id: ++this.nPest, page, cdp, url: '', titulo: '', stats: Sesion.statsNuevo(), pantalla: false };
    this.pestanas.push(p);
    try { await cdp.send('Network.setCookieControls', { enableThirdPartyCookieRestriction: true, disableThirdPartyCookieMetadata: true, disableThirdPartyCookieHeuristics: true }); this.cookiesBloqueadas = true; } catch (_) { this.cookiesBloqueadas = false; }
    if (this.nivel === 'maximo' || this.sellada) { try { await cdp.send('Emulation.setScriptExecutionDisabled', { value: true }); } catch (_) {} }
    try { await cdp.send('Network.enable'); } catch (_) {}
    try { p.frameId = (await cdp.send('Page.getFrameTree')).frameTree.frame.id; } catch (_) { p.frameId = null; }
    cdp.on('Network.requestWillBeSent', (ev) => { if (!this.intercepta) this.observaRed(p, ev); });
    cdp.on('Fetch.requestPaused', (ev) => { this.filtraDoc(p, ev); });
    if (!this.intercepta) { try { await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*', resourceType: 'Document', requestStage: 'Request' }] }); } catch (_) {} }
    cdp.on('Page.screencastFrame', (f) => {
      // 26 Oct 2026 (ronda 46): se confirma el cuadro a Chromium al instante y «el último cuadro gana»: si el enlace con la
      // persona va atrasado, el cuadro se guarda y se manda solo el más reciente cuando el enlace se vacía; nunca el pasado.
      cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
      if (this.act !== p || !this.ws.abierto) return;
      if (this.ws.atraso > ATRASO_MAX) { this.cuadroPendiente = f.data; this.nCuadros.descartados++; return; }
      this.cuadroPendiente = null; this.ws.send(Buffer.from(f.data, 'base64')); this.nCuadros.enviados++;
    });
    this.enganchaPagina(p);
    this.op('pestaña ' + p.id + ' abierta');
    await this.activaPestana(p);
    if (url) await this.ve(url);
    return p;
  }

  enganchaPagina(p) {
    const page = p.page;
    page.on('response', (r) => { this.respuestaNav(r, p); this.respuesta(r, p).catch(() => {}); });
    page.on('request', (r) => this.peticion(r));
    // si la propia página (o un salto de ella) no llega a cargar, se dice el motivo real de Chromium en vez de dejar una pantalla de error muda
    page.on('requestfailed', (r) => { try { if (!r.isNavigationRequest() || r.frame() !== page.mainFrame()) return; const e = (r.failure() || {}).errorText || 'error'; if (!/^https?:\/\//.test(r.url())) return; { const hh = hostDe(r.url()); if (onionVetada(hh)) { page.setContent(paginaBloqueo('Dirección .onion bloqueada', TXT_ONION, hh)).catch(() => {}); return; } if (this.filtro && !PERMITE_LOCAL && (ipProhibida(hh) || nombreLocal(hh) || (this.filtro.vetadas.has(hh.toLowerCase()) && !esOnion(hh)))) { page.setContent(paginaBloqueo('Dirección interna bloqueada', TXT_LOCAL, hh)).catch(() => {}); return; } } this.suceso({ clase: 'fallo', certeza: 'comprobado', dominio: hostDe(r.url()), texto: 'La web ' + hostDe(r.url()) + ' no llegó a cargar: ' + e + '.', detalle: { url: r.url().slice(0, 200), error: e, redirigida: !!r.redirectedFrom() } }); } catch (_) {} });
    page.on('websocket', (w) => { const host = hostDe(w.url()); w.on('framesent', (f) => { try { const h = this.senuelos.busca(typeof f.payload === 'string' ? f.payload : f.payload.toString('latin1')); h.forEach((tipo) => this.senuelo({ tipo, donde: 'trama de WebSocket' }, host, w.url(), baseDominio(host) !== baseDominio(p.stats.webActual), false)); } catch (_) {} }); });
    page.on('download', (d) => this.descarga(d));
    page.on('dialog', (d) => { this.suceso({ clase: 'dialogo', certeza: 'comprobado', texto: 'La web intentó mostrar un aviso emergente. ZERO lo cerró.', dominio: hostDe(page.url()) }); d.dismiss().catch(() => {}); });
    page.on('framenavigated', (f) => { if (f === page.mainFrame()) { p.url = page.url(); if (this.act === p) this.nav(); else this.env(this.listaPestanas()); } });
    page.on('load', () => { page.title().then((tt) => { p.titulo = tt; if (this.act === p) this.nav(true); this.env(this.listaPestanas()); }).catch(() => {}); });
    page.on('close', () => { const i = this.pestanas.indexOf(p); if (i >= 0) this.pestanas.splice(i, 1); if (this.act === p && !this.destruida) { this.act = null; const q = this.pestanas[Math.max(0, i - 1)]; if (q) this.activaPestana(q).catch(() => {}); else this.nuevaPestana().catch(() => {}); } else this.env(this.listaPestanas()); });
  }

  async activaPestana(p) {
    if (!p || this.destruida) return;
    const antes = this.act;
    if (antes && antes !== p && antes.pantalla) { antes.pantalla = false; await antes.cdp.send('Page.stopScreencast').catch(() => {}); }
    this.act = p;
    try { await p.page.setViewportSize({ width: this.w, height: this.h }); } catch (_) {}
    try { await p.page.bringToFront(); } catch (_) {}
    // 26 Oct 2026 (dueño: «no sale el palito para escribir»): sin ventana real, la página no se cree enfocada y no pinta el
    // cursor de texto; la emulación de foco hace que el campo pulsado muestre el cursor parpadeando.
    try { await p.cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true }); } catch (_) {}
    if (this.mirando) await this.arrancaPantalla();
    this.env(this.listaPestanas());
    this.env({ t: 'resumen', cortes: this.n.cortes, empresas: this.empresas.size, paises: this.paises.size, porque: this.porque, n: this.n, web: this.webActual, alerta: this.alerta });
    this.env({ t: 'cortes', lista: [...this.empresas.values()] });
    this.nav(true);
  }

  async cierraPestana(id) {
    const p = this.pestanas.find((x) => x.id === id);
    if (!p) return;
    this.op('pestaña ' + id + ' cerrada');
    await p.page.close().catch(() => {});
  }

  async arrancaPantalla() {
    if (!this.act) return;
    try { await this.cdp.send('Page.startScreencast', { format: 'jpeg', quality: 55, maxWidth: this.w, maxHeight: this.h, everyNthFrame: 1 }); this.act.pantalla = true; this.pantalla = true; } catch (_) {}
  }

  op(que) { this.operaciones.push([ahora(), que]); }

  // Interceptación completa (Playwright, apaga la caché) solo cuando el nivel corta; en Observar, Fetch solo para navegaciones.
  async ponIntercepcion(on) {
    on = !!on;
    if (on === this.intercepta) return;
    this.intercepta = on;
    if (on) {
      for (const p of this.pestanas) { try { await p.cdp.send('Fetch.disable'); } catch (_) {} }
      await this.ctx.route('**/*', (route, req) => this.filtra(route, req));
    } else {
      await this.ctx.unroute('**/*').catch(() => {});
      for (const p of this.pestanas) { try { await p.cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*', resourceType: 'Document', requestStage: 'Request' }] }); } catch (_) {} }
    }
    this.op(on ? 'interceptación completa' : 'solo observación (caché activa)');
  }

  // Navegación interceptada por CDP Fetch (Observar): pasa por el mismo filtro que Playwright, con un adaptador mínimo.
  filtraDoc(p, ev) {
    const cdp = p.cdp, id = ev.requestId, r = ev.request || {};
    const hecho = { v: false };
    const una = (fn) => { if (hecho.v) return Promise.resolve(); hecho.v = true; return fn().catch(() => {}); };
    const route = {
      continue: (o) => una(() => cdp.send('Fetch.continueRequest', { requestId: id, ...(o && o.url ? { url: o.url } : {}), ...(o && o.headers ? { headers: Object.entries(o.headers).map(([name, value]) => ({ name, value: String(value) })) } : {}) })),
      abort: (razon) => una(() => cdp.send('Fetch.failRequest', { requestId: id, errorReason: razon === 'blockedbyclient' ? 'BlockedByClient' : 'Failed' })),
      fulfill: (o) => una(() => cdp.send('Fetch.fulfillRequest', { requestId: id, responseCode: (o && o.status) || 200, responseHeaders: [{ name: 'content-type', value: (o && o.contentType) || 'text/html; charset=utf-8' }], body: Buffer.from(String((o && o.body) || ''), 'utf8').toString('base64') })),
    };
    const esPrincipal = !ev.frameId || ev.frameId === this.frameIdDe(p);
    const req = {
      url: () => r.url || '', postData: () => (r.hasPostData ? r.postData || null : null), headers: () => r.headers || {},
      isNavigationRequest: () => true, resourceType: () => 'document',
      frame: () => ({ page: () => p.page, _principal: esPrincipal }),
    };
    this.filtra(route, req);
  }
  frameIdDe(p) { return p.frameId || null; }

  // Observación sin interceptar (Observar): cada petición se clasifica y se anota como vista; nada se detiene.
  observaRed(p, ev) {
    try {
      const r = ev.request || {}; const url = r.url || '';
      if (!/^https?:/.test(url)) return;
      const tipoCdp = String(ev.type || 'Other').toLowerCase();
      if (tipoCdp === 'document' && (!ev.frameId || ev.frameId === this.frameIdDe(p))) return; // la navegación principal ya pasa por filtraDoc
      const tipo = tipoCdp === 'document' ? 'subdocument' : (TIPO_ABP[tipoCdp] || 'other');
      const host = hostDe(url);
      const st = p.stats;
      const origen = hostDe(p.page.url()) || st.webActual || host;
      const tercero = baseDominio(host) !== baseDominio(origen);
      const fugas = this.senuelos.inspecciona({ url, postData: r.hasPostData ? r.postData || null : null, headers: r.headers || {}, tercero });
      const d = cortes.decide({ url, tipo, origen, host, tercero });
      if (fugas.length) fugas.forEach((f) => this.senuelo(f, host, url, tercero, false));
      if (d.bloquear) this.corte(host, tipo, origen, tercero, d, st, 'visto');
    } catch (_) {}
  }

  tipoDe(req) {
    let f = null; try { f = req.frame(); } catch (_) {}
    if (req.isNavigationRequest()) {
      if (!f) return 'popup';
      let pg = null; try { pg = f.page(); } catch (_) {}
      if (!pg || !this.pestanaDe(pg)) return 'popup';
      if (f._principal !== undefined) return f._principal ? 'document' : 'subdocument';
      return f === pg.mainFrame() ? 'document' : 'subdocument';
    }
    return TIPO_ABP[req.resourceType()] || 'other';
  }

  async filtra(route, req) {
    try { return await this.filtra2(route, req); } catch (_) { return route.abort('failed').catch(() => {}); }
  }

  async filtra2(route, req) {
    if (this.destruida) return route.abort('aborted').catch(() => {});
    if (this.sellada) return route.abort('blockedbyclient').catch(() => {}); // celda sellada: ninguna conexión sale
    const url = req.url();
    if (!/^https?:/.test(url)) return route.continue().catch(() => {});
    const host = hostDe(url);
    const tipo = this.tipoDe(req);
    if (tipo === 'popup') { if (process.env.ZERO_DEBUG) console.log('popup abortado:', url.slice(0, 80)); return route.abort('blockedbyclient').catch(() => {}); } // las ventanas nuevas no se abren en la celda
    const principal = tipo === 'document';
    const pest = this.pestanaDeReq(req) || this.act; let st = pest ? pest.stats : Sesion.statsNuevo(); // let: se reasigna al cambiar de web (antes era const y la segunda web de cada pestaña fallaba con ERR_FAILED)
    const origen = principal ? host : hostDe(pest ? pest.page.url() : '') || host;
    const tercero = baseDominio(host) !== baseDominio(origen);
    let postData = null; try { postData = req.postData(); } catch (_) {}
    const fugas = this.senuelos.inspecciona({ url, postData, headers: req.headers(), tercero });
    if (fugas.length) { const dcheck = cortes.decide({ url, tipo, origen, host, tercero }); fugas.forEach((f) => this.senuelo(f, host, url, tercero, !!dcheck.bloquear || (this.nivel && this.nivel !== 'normal' && tercero && !esLocal(host)))); }
    if (principal) {
      if (st.webActual && baseDominio(st.webActual) !== baseDominio(host) && pest) {
        // la pestaña cambia de web por un enlace: cuentas nuevas «en esta web» (las de la sesión se conservan en EN VIVO)
        pest.stats = Sesion.statsNuevo(); st = pest.stats;
        if (this.act === pest) { this.env({ t: 'resumen', cortes: 0, empresas: 0, paises: 0, porque: {}, n: st.n, web: host, alerta: this.alerta }); this.env({ t: 'cortes', lista: [] }); }
      }
      st.webActual = host;
      // 1) web peligrosa conocida (listas de malware/phishing) → se detiene dentro de la celda
      const d = cortes.decide({ url, tipo: 'document', origen, host, tercero: false });
      if (d.bloquear && d.proposito === 'malware') {
        st.n.bloqueos++;
        this.suceso({ clase: 'bloqueo', certeza: 'comprobado', dominio: host, texto: 'Esta dirección figura en una lista pública de webs peligrosas. ZERO no la ha abierto.', detalle: { regla: d.regla, lista: d.lista } });
        return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: paginaBloqueo('Esta web está en una lista de webs peligrosas', 'ZERO ha detenido la apertura antes de cargar nada. La dirección coincide con una regla de una lista pública de malware o fraude; la lista puede equivocarse, pero no merece la pena arriesgarse.', host + ' · regla ' + d.regla + ' · ' + (cortes.listas[d.lista] || {}).nombre) }).catch(() => {});
      }
      // 2) limpiar la dirección de identificadores de seguimiento
      const lim = cortes.limpiaUrl(url, origen);
      if (lim.quitados.length) {
        st.n.limpiezas++;
        this.suceso({ clase: 'limpieza', certeza: 'comprobado', dominio: host, texto: 'ZERO ha quitado de este enlace ' + (lim.quitados.length === 1 ? 'un identificador de seguimiento' : lim.quitados.length + ' identificadores de seguimiento') + ' (' + lim.quitados.slice(0, 4).join(', ') + ').', detalle: { quitados: lim.quitados } });
        return route.continue({ url: lim.url }).catch(() => route.continue().catch(() => {}));
      }
      return route.continue().catch(() => {});
    }
    const d = cortes.decide({ url, tipo, origen, host, tercero });
    if (d.bloquear && this.observatorio && tipo === 'script' && /prebid|\/gpt\.js|pbjs|apstag/i.test(url)) {
      // modo observatorio: la librería de la subasta corre en la celda (sin cookies ni identidad) para poder leerla;
      // las pujas, los anuncios y el seguimiento siguen cortados
      this.suceso({ clase: 'observatorio', certeza: 'comprobado', dominio: host, texto: 'Modo observatorio: ZERO deja correr el programa de la subasta en la celda, sin tu identidad, para enseñarte quién puja; los anuncios y el seguimiento siguen cortados.', detalle: { regla: d.regla } });
      if (MOCK && !esLocal(host)) return this.simula(route, req, tipo);
      return route.continue().catch(() => {});
    }
    const permitida = this.permitidas.has(baseDominio(host)) || (empresas.atribuye(host).empresa && this.permitidas.has('e:' + empresas.atribuye(host).empresa));
    if (d.bloquear) {
      if (this.nivel === 'observar' && d.proposito !== 'malware') { this.corte(host, tipo, origen, tercero, d, st, 'visto'); return route.continue().catch(() => {}); }
      if (permitida && d.proposito !== 'malware') { this.corte(host, tipo, origen, tercero, d, st, 'permitido'); return route.continue().catch(() => {}); }
      this.corte(host, tipo, origen, tercero, d, st);
      return route.abort('blockedbyclient').catch(() => {});
    }
    if (((this.nivel && this.nivel !== 'normal' && this.nivel !== 'observar') || this.alerta >= 2) && tercero && !esLocal(host) && !permitida) {
      this.corte(host, tipo, origen, tercero, { regla: this.alerta >= 2 && !(this.nivel && this.nivel !== 'normal') ? 'alerta: toda conexión con otra empresa' : 'nivel ' + this.nivel + ': toda conexión con otra empresa', lista: null, proposito: 'otra-empresa' }, st);
      return route.abort('blockedbyclient').catch(() => {});
    }
    const headers = { ...req.headers() };
    if (tercero && headers.referer) { try { headers.referer = new URL(headers.referer).origin + '/'; } catch (_) { delete headers.referer; } }
    if (MOCK && !esLocal(host)) return this.simula(route, req, tipo);
    return route.continue({ headers }).catch(() => {});
  }

  // sin internet (pruebas): lo permitido a terceros se responde con un simulacro inocuo
  simula(route, req, tipo) {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    if (tipo === 'script') return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* simulacro ZERO */' }).catch(() => {});
    if (tipo === 'image') return route.fulfill({ status: 200, contentType: 'image/png', body: png }).catch(() => {});
    if (tipo === 'stylesheet') return route.fulfill({ status: 200, contentType: 'text/css', body: '' }).catch(() => {});
    if (tipo === 'subdocument') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>simulacro</title>' }).catch(() => {});
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }).catch(() => {});
  }

  corte(host, tipo, origen, tercero, d, st, estado) {
    st = st || this.act.stats;
    estado = estado || 'cortado';
    if (estado === 'cortado') st.n.cortes++; else st.n.vistos = (st.n.vistos || 0) + 1;
    const e = empresas.atribuye(host);
    const prop = PROPOSITO[d.proposito] || 'Rastreador';
    st.porque[prop] = (st.porque[prop] || 0) + 1;
    const clave = e.empresa || host;
    const reg = st.empresas.get(clave) || { empresa: e.empresa, dominio: host, pais: e.pais, paisNombre: e.paisNombre, proposito: prop, n: 0, primera: ahora(), fuente: e.fuente, certeza: e.certeza };
    reg.n++; reg.ultima = ahora(); if (estado !== 'cortado') reg.vistos = (reg.vistos || 0) + 1; else reg.cortados = (reg.cortados || 0) + 1; st.empresas.set(clave, reg);
    if (e.pais) st.paises.set(e.pais, (st.paises.get(e.pais) || 0) + 1);
    const quien = e.empresa ? e.empresa + (e.paisNombre ? ' (' + e.paisNombre + ')' : '') : host;
    const que = { Publicidad: 'una conexión publicitaria', Rastreador: 'una conexión con un rastreador conocido', 'Web peligrosa': 'una conexión con una web peligrosa conocida', 'Aviso de cookies': 'el aviso de cookies', 'Red local': 'una conexión hacia la red local', 'Otra empresa': 'una conexión con otra empresa' }[prop] || 'una conexión';
    this.suceso({ clase: 'corte', certeza: 'comprobado', dominio: host, empresa: e.empresa, pais: e.pais, paisNombre: e.paisNombre, proposito: prop, tipo, tercero, estado,
      texto: (estado === 'cortado' ? 'ZERO ha cortado ' : estado === 'visto' ? 'ZERO ha visto (y dejado pasar, nivel observar) ' : 'ZERO ha dejado pasar (lo permitiste) ') + que + (e.empresa ? ', de ' + quien : ' hacia ' + host) + '.',
      detalle: { regla: d.regla, lista: d.lista ? (cortes.listas[d.lista] || {}).nombre : null, listaClave: d.lista, fuenteEmpresa: e.fuente, categoria: e.categoria } });
  }

  sucesoPagina(src, json) {
    let s; try { s = JSON.parse(json); } catch (_) { return; }
    let st = this.act ? this.act.stats : Sesion.statsNuevo(); try { const pp = this.pestanaDe(src.page); if (pp) st = pp.stats; } catch (_) {}
    const dominio = hostDe(s.origen || '') || st.webActual;
    if (s.clase === 'cursor') { try { if (this.act && this.pestanaDe(src.page) === this.act) this.env({ t: 'cursor', cursor: String(s.cursor || 'default').slice(0, 24), href: String(s.href || '').slice(0, 500) }); } catch (_) {} return; }
    if (s.clase === 'huella') {
      st.n.huella++;
      const via = { canvas: 'el lienzo gráfico (canvas)', webgl: 'la tarjeta gráfica (WebGL)', audio: 'el sistema de audio', fuentes: 'los tipos de letra instalados', plugins: 'los complementos del navegador' }[s.via] || s.via;
      st.porque['Huella digital'] = (st.porque['Huella digital'] || 0) + 1;
      return this.suceso({ clase: 'huella', certeza: 'probable', dominio, texto: 'Un programa de ' + dominio + ' ha consultado ' + via + ', un dato que sirve para reconocer un equipo. En ZERO ve la celda remota, no tu ordenador.', detalle: { via: s.via } });
    }
    if (s.clase === 'permiso') { st.n.permisos++; return this.suceso({ clase: 'permiso', certeza: 'comprobado', dominio, texto: 'La web ha pedido acceso a ' + s.que + '. ZERO lo ha denegado: en la celda remota no hay nada tuyo.', detalle: { que: s.que } }); }
    if (s.clase === 'webrtc') { st.n.permisos++; return this.suceso({ clase: 'webrtc', certeza: 'comprobado', dominio, texto: 'La web ha intentado abrir una conexión directa (WebRTC), la vía habitual para averiguar la dirección de red real. ZERO la mantiene desactivada.' }); }
    if (s.clase === 'formulario') return this.suceso({ clase: 'formulario', certeza: 'comprobado', dominio, texto: s.detenido ? 'Este formulario enviaría tus datos sin cifrar. ZERO ha detenido el envío.' : 'Atención: este formulario enviaría lo que escribas sin cifrar.', detalle: { accion: s.accion, detenido: s.detenido } });
    if (s.clase === 'subasta') {
      st.n.subastas++;
      if (s.fase === 'fin') {
        const pujas = (s.pujas || []).map((p) => ({ ...poda(p), ...empresaDe(p.pujador) }));
        const n = new Set([...(s.pedidos || []), ...pujas.map((p) => p.pujador)]).size;
        return this.suceso({ clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Esta página ha subastado tu atención: ' + n + (n === 1 ? ' empresa pujó' : ' empresas pujaron') + ' por ' + (s.unidades || 1) + (s.unidades === 1 ? ' hueco' : ' huecos') + ' de anuncio en ' + (s.ms != null ? s.ms + ' ms' : 'milisegundos') + '. Los precios son los que declara cada pujador.', detalle: { id: s.id, ms: s.ms, limite: s.limite || null, unidades: s.unidades, pedidos: poda(s.pedidos), pujas, sinPuja: poda(s.sinPuja), tarde: poda(s.tarde), peticiones: poda(s.peticiones), config: poda(s.config), tcf: poda(s.tcf) } });
      }
      if (s.fase === 'ganada') return this.suceso({ clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Ganó la puja ' + s.pujador + (s.cpm != null ? ' declarando ' + s.cpm + ' ' + (s.moneda || '') + ' por mil impresiones' : '') + (s.anunciante ? ' para el anunciante ' + s.anunciante : '') + '.', detalle: { ...poda(s), ...empresaDe(s.pujador) } });
      return this.suceso({ clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Hueco de anuncio servido por Google' + (s.vacio ? ' (vacío)' : '') + (s.anunciante ? ' · anunciante nº ' + s.anunciante : '') + '.', detalle: poda(s) });
    }
  }

  async respuesta(r, p) {
    const st = (p || this.act || { stats: Sesion.statsNuevo() }).stats;
    try {
      const req = r.request(); const host = hostDe(r.url()); const origen = hostDe((p || this.act).page.url());
      if (!origen || baseDominio(host) === baseDominio(origen)) return;
      const sc = (await r.allHeaders())['set-cookie'];
      if (!sc) return;
      const clave = baseDominio(host);
      if (st.cookiesVistas.has(clave)) return;
      st.cookiesVistas.add(clave); st.n.cookies++;
      const e = empresas.atribuye(host);
      this.suceso({ clase: 'cookie', certeza: this.cookiesBloqueadas ? 'comprobado' : 'probable', dominio: host, empresa: e.empresa, pais: e.pais, paisNombre: e.paisNombre,
        texto: (e.empresa ? e.empresa : host) + ' intentó dejar una cookie de otra empresa para reconocerte en más webs. ' + (this.cookiesBloqueadas ? 'ZERO la ha rechazado.' : 'ZERO la borra al cerrar la sesión.'), detalle: { tipo: req.resourceType() } });
    } catch (_) {}
  }

  peticion(req) { /* las cadenas de redirección se miran al llegar la respuesta final (respuestaNav) */ }

  respuestaNav(r, p) {
    try {
      const req = r.request();
      if (!req.isNavigationRequest() || req.frame() !== (p || this.act).page.mainFrame()) return;
      const st = r.status(); if (st >= 300 && st < 400) return;
      { const pp = p || this.act; if (pp) { pp.respondio = { url: r.url(), ok: st >= 200 && st < 300 }; } } // la web real respondió (para «Estás en … comprobado»)
      // 26 Oct 2026: muro antirrobot (as.com/PRISA, Cloudflare, DataDome…): la web rechaza a la celda por salir de un servidor.
      // Se dice con honestidad en la página; no se reintenta ni se esquiva.
      if ((st === 403 || st === 429 || st === 503) && (p || this.act) === this.act) this.env({ t: 'muro', host: hostDe(r.url()), estado: st });
      const cadena = []; let q = req.redirectedFrom();
      while (q) { cadena.unshift(hostDe(q.url())); q = q.redirectedFrom(); }
      if (cadena.length >= 2) {
        const inter = [...new Set(cadena)];
        this.suceso({ clase: 'redireccion', certeza: 'comprobado', dominio: hostDe(req.url()), texto: 'Antes de llegar a ' + hostDe(req.url()) + ', el enlace dio ' + cadena.length + ' saltos (' + inter.join(' → ') + '). Algunos saltos así sirven para anotar tu clic.', detalle: { cadena } });
      }
    } catch (_) {}
  }

  // Descargas en cuarentena (ronda 40, punto 11/fase 5): el archivo se guarda dentro de la celda, se inspecciona (tamaño,
  // tipo por extensión, huella SHA-256, si la dirección está en las listas de webs peligrosas) y solo llega al equipo de
  // la persona si ella lo pide después de ver la inspección. Nada se abre ni se ejecuta en la celda.
  async descarga(d) {
    const nombre = String(d.suggestedFilename() || 'archivo').slice(0, 200), url = d.url(), host = hostDe(url);
    const id = ++this.nDesc;
    const ext = (nombre.includes('.') ? nombre.split('.').pop() : '').toLowerCase();
    const EJEC = new Set(['exe', 'msi', 'bat', 'cmd', 'ps1', 'scr', 'com', 'pif', 'js', 'jse', 'vbs', 'vbe', 'wsf', 'hta', 'jar', 'dmg', 'pkg', 'app', 'sh', 'apk', 'lnk', 'reg', 'iso', 'msix', 'appx']);
    const riesgo = EJEC.has(ext) ? 'programa' : /^(zip|rar|7z|gz|tgz|tar|bz2|xz)$/.test(ext) ? 'comprimido' : /^(pdf|docx?|xlsx?|pptx?|odt|ods|odp|rtf)$/.test(ext) ? 'documento' : /^(jpe?g|png|gif|webp|svg|heic|mp4|mp3|wav|webm)$/.test(ext) ? 'multimedia' : 'archivo';
    const lista = cortes.decide({ url, tipo: 'other', origen: this.webActual || host, host, tercero: baseDominio(host) !== baseDominio(this.webActual || host) });
    const malo = !!(lista.bloquear && lista.proposito === 'malware');
    const reg = { id, nombre, url: url.slice(0, 300), host, bytes: 0, sha256: null, riesgo, malo, estado: 'descargando', hora: ahora(), ruta: null };
    this.descargas.set(id, reg);
    this.suceso({ clase: 'descarga', certeza: 'comprobado', dominio: host, texto: 'La web ha iniciado la descarga de «' + nombre + '». ZERO la ha retenido en la celda para inspeccionarla: no ha tocado tu ordenador.', detalle: { nombre, riesgo, malo } });
    try {
      const ruta = await d.path();
      const st = fs.statSync(ruta); reg.bytes = st.size; reg.ruta = ruta;
      if (st.size <= 25 * 1024 * 1024) { const h = crypto.createHash('sha256'); h.update(fs.readFileSync(ruta)); reg.sha256 = h.digest('hex'); reg.estado = 'retenida'; }
      else { reg.estado = 'retenida (demasiado grande para traerla: más de 25 MB)'; }
    } catch (e) { reg.estado = 'fallida'; }
    this.op('descarga retenida: ' + nombre + ' (' + reg.bytes + ' bytes, ' + riesgo + (malo ? ', en lista de webs peligrosas' : '') + ')');
    this.env({ t: 'descarga', ...reg, ruta: undefined });
  }

  async traeDescarga(id) {
    const reg = this.descargas.get(id);
    if (!reg || !reg.ruta || reg.estado !== 'retenida') return this.env({ t: 'archivo', id, error: 'no disponible' });
    if (reg.malo) return this.env({ t: 'archivo', id, error: 'en lista de webs peligrosas: ZERO no la entrega' });
    try {
      const datos = fs.readFileSync(reg.ruta);
      this.op('descarga entregada a petición de la persona: ' + reg.nombre);
      this.suceso({ clase: 'descarga', certeza: 'comprobado', dominio: reg.host, texto: 'A petición tuya, ZERO te ha traído «' + reg.nombre + '» (' + reg.bytes + ' bytes, SHA-256 ' + (reg.sha256 || '').slice(0, 12) + '…). Ábrela solo si confías en quien la mandó.', detalle: { nombre: reg.nombre, sha256: reg.sha256, riesgo: reg.riesgo } });
      this.env({ t: 'archivo', id, nombre: reg.nombre, bytes: reg.bytes, sha256: reg.sha256, b64: datos.toString('base64') });
    } catch (e) { this.env({ t: 'archivo', id, error: 'no se pudo leer' }); }
  }

  descartaDescarga(id) {
    const reg = this.descargas.get(id);
    if (!reg) return;
    try { if (reg.ruta) fs.unlinkSync(reg.ruta); } catch (_) {}
    this.descargas.delete(id); this.op('descarga descartada: ' + reg.nombre);
    this.env({ t: 'descarga', id, estado: 'descartada' });
  }

  suceso(s) {
    const x = { t: 'suceso', id: this.sucesos.length + 1, hora: ahora(), ...s };
    this.sucesos.push(x);
    this.env(x);
    this.env({ t: 'resumen', cortes: this.n.cortes, empresas: this.empresas.size, paises: this.paises.size, porque: this.porque, n: this.n, web: this.webActual, alerta: this.alerta });
    if (x.clase !== 'alerta') this.vigila(x);
  }

  // Respuesta gradual (ronda 40, punto 11, las tres voces): cada suceso suma puntos en esta web; al pasar un umbral la celda
  // sube de nivel: 0 en calma · 1 vigilando · 2 alerta (toda conexión con otras empresas cortada) · 3 sellada (sin red y
  // sin programas; la persona decide) · 4 destruida (solo a petición de la persona). Los puntos se reinician al cambiar de web.
  vigila(x) {
    const PESO = { huella: 1, permiso: 1, webrtc: 1, popup: 1, dialogo: 1, descarga: 2, formulario: 2, redireccion: 1, certificado: 3, bloqueo: 4 };
    let p = PESO[x.clase] || 0;
    const d = x.detalle || {};
    if (x.clase === 'huella' && this.motivos.filter((m) => m.clase === 'huella').length >= 3) p = 0; // la huella cuenta hasta 3
    if (x.clase === 'señuelo') { // salida real hacia otra empresa: 2 por empresa (hasta 4); cortada: 1 (hasta 2); hacia la propia web: 0
      const ya = this.motivos.filter((m) => m.clase === 'señuelo');
      if (!d.tercero) p = 0;
      else if (!d.cortada) p = ya.some((m) => m.dominio === x.dominio) ? 0 : (ya.filter((m) => m.puntos === 2).length >= 2 ? 0 : 2);
      else p = ya.filter((m) => m.puntos === 1).length >= 2 ? 0 : 1;
    }
    if (!p) return;
    this.puntos += p;
    this.motivos.push({ clase: x.clase, puntos: p, hora: x.hora, dominio: x.dominio || null });
    if (this.motivos.length > 60) this.motivos.shift();
    // tormenta: muchos avisos en pocos segundos
    const t = Date.now(); this.ultimos.push(t); this.ultimos = this.ultimos.filter((u) => t - u < 10000);
    if (this.ultimos.length === 25) { this.puntos += 2; this.motivos.push({ clase: 'tormenta', puntos: 2, hora: ahora(), dominio: this.webActual }); }
    // sellar en automático solo con una señal grave (web peligrosa, identidad no comprobada, descarga, tormenta) además de los puntos
    const grave = this.motivos.some((m) => ['bloqueo', 'certificado', 'descarga', 'tormenta'].includes(m.clase));
    const nivel = this.puntos >= 12 && grave ? 3 : this.puntos >= 6 ? 2 : this.puntos >= 2 ? 1 : 0;
    if (nivel > this.alerta) this.ponAlerta(nivel, 'automático: ' + x.clase).catch(() => {});
  }

  async ponAlerta(nivel, motivo) {
    if (this.destruida || nivel === this.alerta) return;
    const NOMBRE = ['en calma', 'vigilando', 'alerta', 'sellada', 'destruida'];
    const antes = this.alerta; this.alerta = nivel; this.op('alerta ' + NOMBRE[nivel] + ' (' + motivo + ')');
    if (nivel >= 3 && !this.sellada) {
      this.sellada = true;
      try { await this.ctx.setOffline(true); } catch (_) {}
      for (const p of this.pestanas) { try { await p.cdp.send('Emulation.setScriptExecutionDisabled', { value: true }); } catch (_) {} }
    }
    if (nivel < 3 && this.sellada) {
      this.sellada = false;
      try { await this.ctx.setOffline(false); } catch (_) {}
      for (const p of this.pestanas) { try { await p.cdp.send('Emulation.setScriptExecutionDisabled', { value: this.nivel === 'maximo' }); } catch (_) {} }
    }
    const TEXTO = {
      0: 'La celda vuelve a la calma.',
      1: 'ZERO vigila esta web de cerca: ha visto varios intentos (huella, permisos o ventanas) que juntos merecen atención.',
      2: 'Alerta en esta web: ZERO corta ahora toda conexión con otras empresas mientras dure la visita. La web sigue abierta.',
      3: 'Celda sellada: ZERO ha cortado toda la red de la celda y ha parado sus programas. Lo que ves queda congelado; nada entra ni sale. Puedes reanudar o destruir la celda.',
    };
    this.suceso({ clase: 'alerta', certeza: 'comprobado', dominio: this.webActual, texto: TEXTO[nivel] || '', detalle: { nivel, nombre: NOMBRE[nivel], antes, motivo, puntos: this.puntos, motivos: this.motivos.slice(-12) } });
    this.env({ t: 'alerta', nivel, nombre: NOMBRE[nivel], motivo, puntos: this.puntos, sellada: this.sellada });
  }

  nav(cargada) {
    try {
      const u = this.page.url(); if (this.act) this.act.url = u;
      const rs = this.act && this.act.respondio; const ok = !!(rs && rs.ok && hostDe(rs.url) === hostDe(u));
      this.env({ t: 'nav', url: u, host: hostDe(u), segura: u.startsWith('https:'), cargada: !!cargada, ok });
      if (cargada) this.page.title().then((tt) => this.env({ t: 'titulo', titulo: tt })).catch(() => {});
    } catch (_) {}
  }

  async ve(url) {
    if (process.env.ZERO_DEBUG) console.log('ve():', String(url).slice(0, 80), 'sellada', this.sellada, 'act', this.act && this.act.id);
    url = String(url || '').trim().slice(0, 4096);
    if (!/^[a-z]+:\/\//i.test(url)) url = 'https://' + url;
    if (!/^https?:\/\//i.test(url)) { this.op('dirección rechazada: solo http y https'); return; } // nada de file://, chrome://, javascript:…
    { // ULTRA capado: .onion fuera de la lista, nunca; y sin ULTRA, ninguna (no hay salida por Tor)
      const h = hostDe(url).toLowerCase();
      if (esOnion(h) && (onionVetada(h) || !(this.ultra && TOR_PROXY))) {
        const vetada = onionVetada(h);
        this.op('dirección .onion rechazada: ' + h);
        this.suceso({ clase: 'onion', certeza: 'comprobado', dominio: h, texto: vetada ? TXT_ONION : TXT_ONION_SIN_ULTRA });
        await this.page.setContent(paginaBloqueo(vetada ? 'Dirección .onion bloqueada' : 'Esta dirección solo se abre con ULTRA', vetada ? TXT_ONION : TXT_ONION_SIN_ULTRA, h)).catch(() => {});
        return;
      }
      if (this.filtro && !PERMITE_LOCAL && (ipProhibida(h) || nombreLocal(h))) {
        this.op('dirección interna rechazada: ' + h);
        this.suceso({ clase: 'local', certeza: 'comprobado', dominio: h, texto: TXT_LOCAL });
        await this.page.setContent(paginaBloqueo('Dirección interna bloqueada', TXT_LOCAL, h)).catch(() => {});
        return;
      }
    }
    if (this.sellada) return; // sellada: primero reanudar o destruir
    this.puntos = 0; this.motivos = []; this.ultimos = []; if (this.alerta > 0 && this.alerta < 3) await this.ponAlerta(0, 'nueva web');
    // nueva web: nuevo contador «en esta web» (los totales de la sesión se conservan)
    this.n = { cortes: 0, limpiezas: 0, huella: 0, permisos: 0, cookies: 0, subastas: 0, bloqueos: 0 }; this.empresas = new Map(); this.paises = new Map(); this.porque = {}; this.cookiesVistas = new Set();
    this.env({ t: 'resumen', cortes: 0, empresas: 0, paises: 0, porque: {}, n: this.n, web: hostDe(url) });
    try {
      await this.page.goto(url, { waitUntil: 'commit', timeout: 30000 });
    } catch (e) {
      const m = String(e.message || e);
      if (process.env.ZERO_DEBUG) console.log('goto falló:', url.slice(0, 80), m.split('\n')[0]);
      const cert = /ERR_CERT|SSL|certificate/i.test(m);
      const motivo = /ERR_CERT_DATE_INVALID/.test(m) ? 'certificado caducado o con fecha no válida' : /ERR_CERT_COMMON_NAME_INVALID/.test(m) ? 'el certificado no coincide con el nombre de la web' : /ERR_CERT_AUTHORITY_INVALID/.test(m) ? 'el certificado no está firmado por una autoridad reconocida' : cert ? 'no se pudo verificar el certificado' : /ERR_NAME_NOT_RESOLVED|ERR_SOCKS_CONNECTION_HOST_UNREACHABLE/.test(m) ? 'la dirección no existe' : /ERR_CONNECTION|ERR_TIMED_OUT|ERR_INTERNET|ERR_TUNNEL|ERR_PROXY|ERR_SOCKS/.test(m) ? 'no se pudo conectar' : 'no se pudo abrir';
      if (cert) this.suceso({ clase: 'certificado', certeza: 'comprobado', dominio: hostDe(url), texto: 'No se ha podido comprobar la identidad cifrada de ' + hostDe(url) + ' (' + motivo + '). ZERO no ha abierto la conexión.', detalle: { error: m.split('\n')[0] } });
      await this.page.setContent(paginaBloqueo(cert ? 'La identidad de esta web no se pudo comprobar' : 'No se pudo abrir esta web', cert ? 'Su certificado de seguridad no supera la comprobación: ' + motivo + '. Puede ser un fallo técnico de la web o una suplantación; ZERO no ha enviado ni recibido nada.' : 'Motivo: ' + motivo + '. ZERO no ha enviado nada.', hostDe(url) + ' · ' + m.split('\n')[0].slice(0, 120))).catch(() => {});
    }
  }

  async mensaje(m) {
    let o; try { o = JSON.parse(m); } catch (_) { return; }
    try {
      if (o.t === 'hola') return await this.abre(o.w, o.h, o.idioma);
      if (!this.page || this.destruida) return;
      if (o.t === 'abrir') return await this.ve(String(o.url || '').trim());
      if (this.sellada && (o.t === 'raton' || o.t === 'rueda' || o.t === 'tecla' || o.t === 'texto')) return; // sellada: la celda no recibe nada
      if (o.t === 'raton') {
        if (o.tipo === 'move') return await this.page.mouse.move(o.x, o.y);
        if (o.tipo === 'down') return await this.page.mouse.down({ button: o.boton || 'left', clickCount: o.clicks || 1 });
        if (o.tipo === 'up') return await this.page.mouse.up({ button: o.boton || 'left', clickCount: o.clicks || 1 });
      }
      if (o.t === 'rueda') { await this.page.mouse.move(o.x, o.y); return await this.page.mouse.wheel(o.dx || 0, o.dy || 0); }
      if (o.t === 'tecla') return await (o.tipo === 'down' ? this.page.keyboard.down(o.key) : this.page.keyboard.up(o.key));
      if (o.t === 'texto') return await this.page.keyboard.insertText(String(o.s || '').slice(0, 20000));
      // Copiar: el texto seleccionado en la celda viaja al portapapeles de la persona (solo cuando ella pulsa Ctrl+C o «Copiar»).
      if (o.t === 'copiar') { let txt = ''; try { txt = await this.page.evaluate(() => String(window.getSelection ? window.getSelection() : '')); } catch (_) {} if (process.env.ZERO_DEBUG) console.log('copiar:', String(txt || '').length, 'caracteres'); this.env({ t: 'portapapeles', texto: String(txt || '').slice(0, 20000) }); return; }
      if (o.t === 'atras') return this.page.goBack({ waitUntil: 'commit' }).catch(() => {});
      if (o.t === 'adelante') return this.page.goForward({ waitUntil: 'commit' }).catch(() => {});
      if (o.t === 'recargar') return this.page.reload({ waitUntil: 'commit' }).catch(() => {});
      if (o.t === 'tam') {
        this.w = Math.max(320, Math.min(1920, o.w | 0)); this.h = Math.max(240, Math.min(1200, o.h | 0));
        for (const p of this.pestanas) await p.page.setViewportSize({ width: this.w, height: this.h }).catch(() => {});
        await this.cdp.send('Page.stopScreencast').catch(() => {});
        return await this.arrancaPantalla();
      }
      if (o.t === 'mira') {
        // cuando nadie mira, la pantalla deja de transmitirse (uso de todo el mes sin gastar en vacío)
        this.mirando = !!o.si; this.ultimaMirada = Date.now();
        if (!this.mirando && this.pantalla) { this.pantalla = false; await this.cdp.send('Page.stopScreencast').catch(() => {}); this.op('pantalla dormida'); }
        else if (this.mirando && !this.pantalla) { await this.arrancaPantalla(); this.op('pantalla despierta'); }
        return;
      }
      if (o.t === 'modo' && 'ultra' in o) {
        // ULTRA: la celda entera sale por Tor. Hace falta una celda nueva (el proxy se fija al crearla): se cierra la actual.
        const quiere = !!o.ultra;
        if (!TOR_PROXY) { this.suceso({ clase: 'ultra', certeza: 'comprobado', dominio: this.webActual, texto: 'ULTRA no está disponible en este motor: no tiene salida por Tor configurada. ZERO sigue como hasta ahora.', detalle: { disponible: false } }); return this.env({ t: 'ultra', disponible: false, activo: false }); }
        if (quiere === !!this.ultra) return;
        this.ultra = quiere; this.op('ultra ' + (quiere ? 'activado' : 'desactivado') + ': celda nueva');
        try { if (this.ctx) await this.ctx.close(); } catch (_) {}
        this.pestanas = []; this.act = null; this.alerta = 0; this.puntos = 0; this.motivos = []; this.sellada = false; this.descargas = new Map();
        await this.abre(this.w, this.h);
        this.suceso({ clase: 'ultra', certeza: 'comprobado', dominio: '', texto: quiere ? 'ULTRA activado: esta celda nueva sale a internet por la red Tor (tres repetidores). Las webs ven la salida de Tor, no la de GUARDIANA. Es más lento.' : 'ULTRA desactivado: celda nueva con la salida normal de GUARDIANA.', detalle: { disponible: true, activo: quiere } });
        return this.env({ t: 'ultra', disponible: true, activo: quiere });
      }
      if (o.t === 'modo') { if ('observatorio' in o) { this.observatorio = !!o.observatorio; this.op('modo observatorio ' + (this.observatorio ? 'activado' : 'desactivado')); } if (o.nivel) await this.ponNivel(o.nivel); return; }
      if (o.t === 'permitir') { const k = String(o.clave || '').slice(0, 120); if (!k) return; if (o.on) this.permitidas.add(k); else this.permitidas.delete(k); this.op((o.on ? 'permitida ' : 'vuelve a cortarse ') + k); this.suceso({ clase: 'permiso-empresa', certeza: 'comprobado', dominio: this.webActual, texto: (o.on ? 'Has permitido las conexiones de ' : 'Vuelves a cortar las conexiones de ') + k.replace(/^e:/, '') + ' en esta sesión.', detalle: { clave: k, on: !!o.on } }); return; }
      if (o.t === 'destruir') return await this.destruye('a petición de la persona');
      if (o.t === 'descarga') { if (o.accion === 'traer') return await this.traeDescarga(+o.id); if (o.accion === 'descartar') return this.descartaDescarga(+o.id); return; }
      if (o.t === 'pestana') {
        if (this.sellada) return;
        if (o.accion === 'nueva') return await this.nuevaPestana(o.url ? String(o.url).slice(0, 4096) : '');
        if (o.accion === 'cambiar') { const p = this.pestanas.find((x) => x.id === +o.id); if (p) await this.activaPestana(p); return; }
        if (o.accion === 'cerrar') return await this.cierraPestana(+o.id);
        return;
      }
      if (o.t === 'alerta') { if (o.accion === 'sellar') return await this.ponAlerta(3, 'a petición de la persona'); if (o.accion === 'reanudar') { this.puntos = 0; this.motivos = []; return await this.ponAlerta(0, 'reanudada por la persona'); } return; }
    } catch (e) { if (process.env.ZERO_DEBUG) console.log('mensaje', o && o.t, 'error:', e && e.message); /* una orden que falla no tumba la sesión */ }
  }

  async ponNivel(n) {
    if (!['observar', 'normal', 'estricto', 'maximo'].includes(n)) return;
    const antes = this.nivel || 'normal'; this.nivel = n; this.op('nivel de protección: ' + n);
    if (this.ctx) await this.ponIntercepcion(n !== 'observar');
    const sinJs = n === 'maximo';
    if (sinJs !== (antes === 'maximo')) { for (const p of this.pestanas) { try { await p.cdp.send('Emulation.setScriptExecutionDisabled', { value: sinJs }); } catch (_) {} } if (this.page.url() && this.page.url() !== 'about:blank') this.page.reload({ waitUntil: 'commit' }).catch(() => {}); }
    this.suceso({ clase: 'nivel', certeza: 'comprobado', dominio: this.webActual, texto: n === 'observar' ? 'Nivel observar: ZERO deja pasar todo (menos webs peligrosas), lo detecta y te lo enseña; tú eliges qué cortar.' : n === 'normal' ? 'Nivel normal: ZERO corta la publicidad y el rastreo de las listas públicas.' : n === 'estricto' ? 'Nivel estricto: además, ZERO corta toda conexión con otras empresas; solo pasa lo propio de la web.' : 'Nivel máximo: además, la web corre sin programas (JavaScript).' });
  }

  // Una marca que solo existe en la celda ha salido (o ha intentado salir) hacia alguien. Se afirma solo lo visto.
  senuelo(f, host, url, tercero, cortada) {
    const clave = f.tipo + '|' + f.donde + '|' + host;
    if (this.senuelos.alertas.some((a) => a.clave === clave)) return;
    this.senuelos.apunta({ clave, tipo: f.tipo, donde: f.donde, host, url: String(url).slice(0, 300), tercero, cortada, hora: ahora() });
    const e = empresas.atribuye(host);
    const que = Senuelos.nombre(f.tipo);
    const texto = f.tipo === 'visita'
      ? 'Alguien ha visitado el enlace oculto que ZERO puso como señuelo en la página (desde ' + host + '; ' + f.donde + '). Solo un programa que lea la página entera y siga sus enlaces llega a él: un indexador, un previsualizador o un rastreador.'
      : tercero
      ? 'Un dato que solo existe en tu celda (' + que + ', puesto por ZERO como señuelo) ' + (cortada ? 'iba a salir' : 'ha salido') + ' hacia ' + (e.empresa ? e.empresa + ' (' + host + ')' : host) + ' en ' + f.donde + '. Algo en esta web lo leyó y lo envió' + (cortada ? '; ZERO cortó esa conexión.' : '.')
      : 'La propia web se ha enviado un dato que solo existe en tu celda (' + que + ', puesto por ZERO como señuelo) en ' + f.donde + ': copia el contenido de la página o sus cookies hacia sus servidores.';
    this.n.senuelos = (this.n.senuelos || 0) + 1;
    this.suceso({ clase: 'señuelo', certeza: 'comprobado', dominio: host, empresa: e.empresa || null, paisNombre: e.paisNombre || null, texto, detalle: { tipo: f.tipo, que, donde: f.donde, tercero, cortada, url: String(url).slice(0, 200) } });
  }

  vetada(host, motivo) {
    if (this.destruida) return;
    this.op((motivo === 'onion' ? 'conexión .onion rechazada (' : 'conexión con dirección interna rechazada (') + host + ')');
    this.suceso({ clase: motivo === 'onion' ? 'onion' : 'local', certeza: 'comprobado', dominio: host, texto: motivo === 'onion' ? TXT_ONION : TXT_LOCAL });
  }

  async destruye(motivo) {
    this.op('cuadros enviados ' + this.nCuadros.enviados + ', descartados por atraso ' + this.nCuadros.descartados);
    if (this.destruida) return;
    this.destruida = true;
    SESIONES.delete(this.senuelos.token); VIVAS.delete(this); clearInterval(this.vigilante);
    const t0 = Date.now();
    this.op('cierre pedido: ' + motivo);
    try { if (this.cdp) await this.cdp.send('Page.stopScreencast').catch(() => {}); } catch (_) {}
    try { if (this.ctx) await this.ctx.close(); this.op('celda cerrada: cookies, caché, almacenamiento y pestañas de la sesión eliminados con el contexto'); } catch (_) { this.op('celda cerrada con error'); }
    if (this.filtro) { this.filtro.cierra(); this.filtro = null; }
    const acta = { sesion: this.id, version: VERSION, inicio: new Date(this.creada).toISOString(), fin: ahora(), motivo, duracion_s: Math.round((Date.now() - this.creada) / 1000), cierre_ms: Date.now() - t0,
      operaciones: this.operaciones, sucesos: this.sucesos.length, cortes: this.sucesos.filter((s) => s.clase === 'corte').length, senuelos: this.senuelos.alertas.length, alerta_final: this.alerta, descargas_retenidas: this.descargas.size,
      nota: 'Prototipo: el contexto de Chromium se destruye y con él todo su estado; en producción se destruye la microVM entera y se invalidan sus claves. Este comprobante lo sella el propio servidor: acredita lo que ZERO hizo, no sustituye una auditoría externa.' };
    acta.sello = crypto.createHmac('sha256', CLAVE_SESION).update(JSON.stringify(acta)).digest('hex').slice(0, 32);
    if (this.ws.abierto) { this.env({ t: 'acta', acta }); setTimeout(() => this.ws.cierra(), 200); }
  }
}

function empresaDe(pujador) {
  // nombres de pujador de Prebid → dominio conocido de nuestra base (solo los que están en ella; el resto queda sin empresa)
  const MAPA = { appnexus: 'adnxs.com', xandr: 'adnxs.com', rubicon: 'rubiconproject.com', magnite: 'rubiconproject.com', pubmatic: 'pubmatic.com', criteo: 'criteo.com', ix: 'casalemedia.com', indexexchange: 'casalemedia.com', openx: 'openx.net', triplelift: '3lift.com', improvedigital: '360yield.com', adform: 'adform.net', smartadserver: 'smartadserver.com', ttd: 'adsrvr.org', amazon: 'amazon-adsystem.com', medianet: 'media.net', sovrn: 'lijit.com', sharethrough: 'sharethrough.com', teads: 'teads.tv', onetag: 'onetag-sys.com', seedtag: 'seedtag.com', richaudience: 'richaudience.com', adagio: 'adagio.io', taboola: 'taboola.com', outbrain: 'outbrain.com' };
  const d = MAPA[String(pujador || '').toLowerCase()];
  if (!d) return { empresa: null };
  const e = empresas.atribuye(d);
  return { empresa: e.empresa, pais: e.pais, paisNombre: e.paisNombre };
}

async function main() {
  navegador = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-networking', '--no-first-run', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp', '--disable-features=MediaRouter,Translate,OptimizationHints', '--autoplay-policy=user-gesture-required'] });
  const srv = http.createServer((req, res) => {
    const ms = req.url.match(/^\/s\/([0-9a-f]{12})(?:[/?#].*)?$/);
    if (ms) {
      const ses = SESIONES.get(ms[1]);
      // el motor escucha solo en 127.0.0.1: quien llega es el proxy TLS, que pone la dirección real en X-Forwarded-For
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '?';
      if (ses && !ses.destruida) ses.senuelo({ tipo: 'visita', donde: 'visita al enlace oculto (' + (req.headers['user-agent'] || 'sin agente').slice(0, 80) + ')' }, ip, req.url, true, false);
      res.writeHead(204); return res.end();
    }
    if (/^\/google(\?|$)/.test(req.url)) {
      // Caja oficial de Google (Programmable Search Element) para la página de ZERO, servida desde el dominio del motor para que
      // el código de Google no corra en la página de ZERO. Solo se deja enmarcar desde las páginas de GUARDIANA.
      let html = ''; try { html = fs.readFileSync(path.join(__dirname, 'publico', 'google.html'), 'utf8'); } catch (_) {}
      if (!html) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff',
        'content-security-policy': "frame-ancestors https://guardianagroup.com https://www.guardianagroup.com http://127.0.0.1:* http://localhost:*" });
      return res.end(html);
    }
    if (req.url === '/salud') {
      // la página de ZERO (otro origen) pregunta aquí antes de usar este motor: CORS solo para los orígenes permitidos
      const cab = { 'content-type': 'application/json', 'cache-control': 'no-store' };
      if (origenPermitido(req)) { cab['access-control-allow-origin'] = String(req.headers.origin).replace(/\/$/, ''); cab.vary = 'Origin'; }
      res.writeHead(200, cab); return res.end(JSON.stringify({ ok: true, version: VERSION, listas: nListas, mock: MOCK, celdas: VIVAS.size, tope: MAX_SESIONES, region: process.env.ZERO_REGION || '', com: RELE.estado() }));
    }
    res.writeHead(404); res.end();
  });
  srv.on('upgrade', (req, socket) => {
    if (req.url.startsWith('/com')) {
      if (!origenPermitido(req)) { console.log('relé: origen rechazado', req.headers.origin || '(ninguno)'); return socket.destroy(); }
      const ws = WS.acepta(req, socket);
      if (ws) RELE.acepta(ws);
      return;
    }
    if (!req.url.startsWith('/sesion')) return socket.destroy();
    if (!origenPermitido(req)) { console.log('sesión rechazada: origen', req.headers.origin || '(ninguno)'); return socket.destroy(); }
    if (VIVAS.size >= MAX_SESIONES) { console.log('sesión rechazada: tope de celdas (' + MAX_SESIONES + ')'); return socket.destroy(); }
    const ws = WS.acepta(req, socket);
    if (ws) new Sesion(ws);
  });
  srv.listen(PUERTO, '127.0.0.1', () => console.log('ZERO motor', VERSION, 'en ws://127.0.0.1:' + PUERTO + '/sesion ·', nListas.reglas, 'reglas ·', MOCK ? 'simulacro de terceros activo' : 'internet real'));
  process.on('SIGINT', async () => { try { await navegador.close(); } catch (_) {} process.exit(0); });
}

main().catch((e) => { console.error(e); process.exit(1); });
