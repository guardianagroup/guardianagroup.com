// ZERO · servidor del prototipo del motor (26 Oct 2026, ronda 40).
//
// Una sesión = un contexto de Chromium aislado controlado por Playwright (en producción, una microVM por sesión). El
// cliente (orbita/zero/) recibe la pantalla por WebSocket (CDP Page.startScreencast, JPEG) y manda ratón y teclado.
// Cada petición de la web pasa por el motor de cortes (cortes.js); los sensores (sensores.js) cuentan lo que la web
// intenta dentro de la burbuja. Todo suceso se manda al cliente con su certeza (comprobado / probable / estimado) y, si
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
const VERSION = 'prototipo 0.2 · 27 Oct 2026 (ZERO entra antes que tú; con riesgo grave no se entra; qué archivo y todo lo que sabe; textos profesionales)';
const CLAVE_SESION = crypto.randomBytes(32); // efímera: con ella se sella el comprobante de cada sesión
// Blindaje del motor (26 Oct 2026, ronda 40 punto 11): solo las páginas de GUARDIANA pueden abrir sesiones; hay un tope
// de burbujas vivas; una burbuja que nadie mira se cierra sola; ningún mensaje puede ser enorme; en la burbuja solo se abren
// direcciones http(s).
const ORIGENES = (process.env.ZERO_ORIGENES || 'https://guardianagroup.com,https://www.guardianagroup.com,http://127.0.0.1,http://localhost').split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean);
const MAX_SESIONES = +process.env.ZERO_MAX_SESIONES || 8;
const TOR_PROXY = process.env.ZERO_TOR_PROXY || ''; // p. ej. socks5://127.0.0.1:9050 en el servidor con Tor; sin él, ULTRA no se ofrece
// Burbuja sellada hacia dentro y ULTRA capado (26 Oct 2026, dueño; ronda 50b): cada burbuja sale por su propio filtro SOCKS
// (filtro-red.js). Ninguna web abierta en ZERO puede conectar con este servidor, con redes privadas ni con los metadatos del
// proveedor; y con ULTRA, Tor solo sirve para la web normal: toda .onion fuera, salvo servicios oficiales verificados.
// ZERO_FILTRO_RED=0 quita el filtro de las burbujas normales (ULTRA lo lleva siempre). En pruebas locales (sin ZERO_PUBLICO,
// o con ZERO_PERMITE_LOCAL=1) se deja llegar a 127.0.0.1 para los sitios de prueba.
const FILTRO_RED = process.env.ZERO_FILTRO_RED !== '0';
const PERMITE_LOCAL = process.env.ZERO_PERMITE_LOCAL === '1' || !process.env.ZERO_PUBLICO;
const TXT_LOCAL = 'Conexión con una dirección interna bloqueada. Las webs abiertas en ZERO no pueden llegar a este servidor, a redes privadas ni a los datos internos del proveedor.';
const TXT_ONION = 'Dirección .onion bloqueada. Con Tor solo se navega por la web normal: ZERO no abre la parte oculta de Tor, salvo servicios oficiales verificados (como el buscador de Brave).';
const TXT_ONION_SIN_ULTRA = 'Las direcciones .onion solo se abren con Tor, y solo las de servicios oficiales verificados (como el buscador de Brave).';
const MAX_MENSAJE = 64 * 1024;
const MIN_SIN_MIRAR = +process.env.ZERO_MIN_SIN_MIRAR || 30; // minutos con la pantalla dormida antes de destruir la burbuja
const MAX_HORAS = +process.env.ZERO_MAX_HORAS || 12; // vida máxima de una burbuja
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
const TOR_CORTA = { publicidad: 'publicidad', rastreo: 'rastreo', 'medición': 'rastreo', consentimiento: 'avisos-cookies' }; // con Tor, además de las listas
const PROPOSITO = { publicidad: 'Publicidad', rastreo: 'Rastreador', malware: 'Web peligrosa', 'avisos-cookies': 'Aviso de cookies', 'red-local': 'Red local', excepciones: '', parametros: 'Seguimiento', 'otra-empresa': 'Otra empresa' };

// «ZERO entra antes que tú» (27 Oct 2026, dueño, 17:25–17:39; ronda 67): ZERO entra primero en cada web, la comprueba dentro
// de la burbuja y solo entonces la enseña; mientras, la persona ve «Chequeando la web…» con los pasos reales. Va incorporado:
// siempre activo, para todos, sin interruptor. «Lo más rápido posible»: la comprobación corre mientras la web carga (nada de
// esperas de adorno); se suelta la imagen al cargar la web y observarla un instante, o poco después del documento si la carga
// completa se alarga, y nunca más tarde del tope.
// Tiempos (ronda 67, Gemini: «domcontentloaded + 400 ms, tope de 2,5 s»; Nielsen: a partir de 1 s se nota la espera): las listas y el
// certificado se comprueban antes de conectar y en el saludo TLS, así que al tope ya están; lo que se recorta es la observación.
const CHEQUEO_CALMA_MS = +process.env.ZERO_CHEQUEO_CALMA || 300; // observación tras el evento load
const CHEQUEO_DOC_MS = +process.env.ZERO_CHEQUEO_DOC || 400; // tras DOMContentLoaded, si load no llega antes
const CHEQUEO_TOPE_MS = +process.env.ZERO_CHEQUEO_TOPE || 2500; // tope desde que se pide la web: después se ve cargar, vigilada
const CHEQUEO_RECUERDA_MS = process.env.ZERO_CHEQUEO_RECUERDA != null ? +process.env.ZERO_CHEQUEO_RECUERDA : 10 * 60000; // una web comprobada limpia en esta burbuja no vuelve a retener la imagen en 10 min
// Desafíos antirrobot (Cloudflare «Just a moment…», captchas): esperan a una persona, así que se suelta la imagen enseguida
const RE_DESAFIO = /just a moment|un momento|attention required|checking your browser|verify(ing)? (that )?you are (a )?human|comprueba que eres humano|captcha|ddos-guard|access denied/i;
// Dirección que imita a otra con letras de otro alfabeto (homógrafos, p. ej. «аррӏе.com» en cirílico): una etiqueta en punycode
// que mezcla alfabetos, o que usa griego, cirílico, armenio o cheroqui bajo un dominio de letras latinas. Las letras latinas con
// tilde (ñ, á, ü) no cuentan. Devuelve el nombre tal como se lee, o null.
function imitaLetras(host) {
  const h = String(host || '').toLowerCase();
  if (!h.includes('xn--')) return null;
  let uni = ''; try { uni = require('url').domainToUnicode(h); } catch (_) { return null; }
  if (!uni) return null;
  const et = uni.split('.'); const tld = et[et.length - 1] || '';
  const otro = /[Ͱ-ϿЀ-ԯ԰-֏Ꭰ-᏿]/;
  for (const e of et.slice(0, -1)) if (otro.test(e) && (/[a-z]/.test(e) || /^[a-z]+$/.test(tld))) return uni;
  return null;
}

// Archivos que baja una web (dueño 18:56: «decirle qué archivo ha sido… el máximo de información»). El nombre se enseña tal cual,
// salvo los caracteres invisibles que dan la vuelta al texto («factura‮fdp.exe» se lee «factura exe.pdf»), que se muestran a la
// vista. Qué es por dentro se sabe por sus primeros bytes, no por el nombre; si el nombre dice otra cosa que un programa y por
// dentro es un programa, se avisa. Solo lo que se comprueba en el archivo: no se ejecuta ni se abre.
const RE_INVISIBLE = /[‎‏‪-‮⁦-⁩]/g;
const nombreVisible = (n) => String(n || '').replace(RE_INVISIBLE, (ch) => '[U+' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0') + ']');
function tipoPorDentro(b) {
  if (!b || b.length < 4) return null;
  const hx = b.subarray(0, 8).toString('hex');
  if (hx.startsWith('4d5a')) return 'windows';
  if (hx.startsWith('7f454c46')) return 'linux';
  if (/^(feedface|feedfacf|cefaedfe|cffaedfe)/.test(hx)) return 'mac';
  if (/^(504b0304|52617221|377abcaf271c|1f8b)/.test(hx)) return 'comprimido';
  if (hx.startsWith('25504446')) return 'pdf';
  if (hx.startsWith('d0cf11e0a1b11ae1')) return 'office';
  if (/^(89504e47|ffd8ff|47494638)/.test(hx) || (hx.startsWith('52494646') && b.subarray(8, 12).toString('latin1') === 'WEBP')) return 'imagen';
  return null;
}

// Página que ve la persona dentro de la burbuja cuando ZERO detiene una web peligrosa o un certificado roto
function paginaBloqueo(titulo, texto, detalle) {
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return `<!doctype html><html lang="es"><meta charset="utf-8"><title>ZERO</title><style>
  html,body{margin:0;height:100%;background:#06080C;color:#F4F6F8;font:16px/1.5 "Segoe UI",Inter,Arial,sans-serif}
  main{max-width:560px;margin:0 auto;padding:12vh 24px}.k{font:12px/1 Consolas,monospace;letter-spacing:.22em;color:#9CC3E4}
  h1{font-size:26px;font-weight:600;margin:14px 0 10px}p{color:#cfe1ee;margin:0 0 12px}small{display:block;color:#7f97aa;font-size:12.5px;margin-top:18px;word-break:break-all}
  .l{height:2px;width:56px;background:#E07A6C;margin:18px 0}</style><main><div class="k">ZERO · ACCESO DETENIDO</div><h1>${esc(titulo)}</h1><div class="l"></div><p>${esc(texto)}</p><small>${esc(detalle)}</small></main></html>`;
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
    // Vigilancia de la burbuja (26 Oct 2026, dueño: «que el cliente sienta con hechos que no hay malware ni intrusión; si la hay, se bloquea
    // y se borra todo»; ronda 50, punto G): solo cuentas reales de lo que ZERO ha visto y hecho en esta sesión.
    this.vig = { local: 0, onion: 0, peligrosas: 0, muros: 0, senFuera: 0, senCortados: 0, senPropios: 0, descargas: 0 };
    this.autoDestruye = null;
    this.permitidas = new Set(); // dominios base, 'e:<empresa>' o 'p:<grupo>' (Publicidad, Rastreador…) que la persona ha permitido en esta sesión
    this.vetadas = new Set(); // empresas o dominios que la persona volvió a cortar a mano: mandan sobre un grupo permitido
    this.nCuadros = { enviados: 0, descartados: 0 }; this.cuadroPendiente = null;
    this.chequeo = null; this.nCheq = 0; // «ZERO entra antes que tú»: la comprobación en curso (una a la vez, la de la pestaña que se ve)
    this.comprobadas = new Map(); // web → hora de su última comprobación limpia, solo en esta burbuja (nadie más la ve; se borra con ella)
    // dueño (18:40), con la agencia (ronda 67: ChatGPT y Astra): ante un riesgo grave (lista de webs peligrosas, certificado que no
    // pasa, algo peligroso dentro, dirección interna) ZERO no deja entrar; no hay «entrar igualmente». Ante una señal, avisa y decide la persona.
    ws.on('drain', () => { if (this.cuadroPendiente && this.ws.abierto && this.ws.atraso <= ATRASO_MAX) { const d = this.cuadroPendiente; this.cuadroPendiente = null; this.ws.send(Buffer.from(d, 'base64')); this.nCuadros.enviados++; } });
    this.nivel = process.env.ZERO_NIVEL_INICIAL || 'normal'; // dueño (26 Oct 2026, 22:42): un solo modo, Normal; cada empresa se corta o se deja pasar con su interruptor // 26 Oct 2026: por defecto se abre todo y la persona elige qué cortar
    VIVAS.add(this); this.ultimaMirada = Date.now();
    ws.on('message', (m, bin) => { if (bin) return; if (m.length > MAX_MENSAJE) { this.op('mensaje demasiado grande: descartado'); return; } this.mensaje(m).catch(() => {}); });
    ws.on('close', () => this.destruye('conexión cerrada'));
    this.vigilante = setInterval(() => {
      const t = Date.now();
      if (!this.mirando && t - this.ultimaMirada > MIN_SIN_MIRAR * 60000) this.destruye('burbuja sin nadie mirando durante ' + MIN_SIN_MIRAR + ' min').catch(() => {});
      else if (t - this.creada > MAX_HORAS * 3600000) this.destruye('vida máxima de la burbuja (' + MAX_HORAS + ' h)').catch(() => {});
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
    // 26 Oct 2026: la burbuja habla el idioma de la persona (Accept-Language y navigator.language); antes siempre es-ES.
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
    this.op((tor ? 'burbuja creada con salida por Tor, solo web normal: .onion bloqueadas salvo servicios oficiales verificados' : 'burbuja creada') + (this.filtro && !PERMITE_LOCAL ? '; sin acceso a este servidor ni a redes privadas' : ''));
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
    this.env({ t: 'lista', sesion: this.id, version: VERSION, listas: cortes.listas, cookiesBloqueadas: this.cookiesBloqueadas, w: this.w, h: this.h, ultraDisponible: !!TOR_PROXY, ultra: !!(this.ultra && TOR_PROXY), dejaPorDefecto: this.dejaPorDefecto(), nivel: this.nivel, region: process.env.ZERO_REGION || '', chequeo: true });
    this.envVigilancia();
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
    // ZERO entra antes que tú: un documento nuevo en la pestaña (no un cambio dentro de la misma página ni una descarga) vuelve a
    // contar sus eventos de carga dentro de la comprobación en curso
    try { await cdp.send('Page.enable'); } catch (_) {}
    cdp.on('Page.frameNavigated', (ev) => { if (ev && ev.frame && !ev.frame.parentId) this.reiniciaCargaChequeo(p); });
    try { p.frameId = (await cdp.send('Page.getFrameTree')).frameTree.frame.id; } catch (_) { p.frameId = null; }
    cdp.on('Network.requestWillBeSent', (ev) => { if (!this.intercepta) this.observaRed(p, ev); });
    cdp.on('Fetch.requestPaused', (ev) => { this.filtraDoc(p, ev); });
    if (!this.intercepta) { try { await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*', resourceType: 'Document', requestStage: 'Request' }] }); } catch (_) {} }
    cdp.on('Page.screencastFrame', (f) => {
      // 26 Oct 2026 (ronda 46): se confirma el cuadro a Chromium al instante y «el último cuadro gana»: si el enlace con la
      // persona va atrasado, el cuadro se guarda y se manda solo el más reciente cuando el enlace se vacía; nunca el pasado.
      cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
      if (this.act !== p || !this.ws.abierto) return;
      // ZERO entra antes que tú: mientras se comprueba la web, la imagen no sale; se guarda solo el último cuadro
      { const c = this.chequeo; if (c && c.p === p && !c.listo && !c.rapida) { c.cuadro = f.data; return; } }
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
    page.on('dialog', (d) => { let tx = ''; try { tx = String(d.message() || '').replace(RE_INVISIBLE, '').replace(/\s+/g, ' ').trim().slice(0, 160); } catch (_) {} this.suceso({ clase: 'dialogo', certeza: 'comprobado', texto: 'La web intentó mostrar un aviso emergente. ZERO lo cerró.', dominio: hostDe(page.url()), detalle: { tipo: d.type(), texto: tx } }); d.dismiss().catch(() => {}); });
    page.on('framenavigated', (f) => { if (f === page.mainFrame()) { p.url = page.url(); if (this.act === p) this.nav(); else this.env(this.listaPestanas()); } });
    page.on('domcontentloaded', () => this.hitoChequeo(p, 'documento'));
    page.on('load', () => { this.hitoChequeo(p, 'carga'); page.title().then((tt) => { p.titulo = tt; if (this.act === p) this.nav(true); this.env(this.listaPestanas()); }).catch(() => {}); this.miraMuro(page).catch(() => {}); });
    page.on('close', () => { { const c = this.chequeo; if (c && c.p === p) this.sueltaChequeo(c, 'pestaña cerrada', false); } const i = this.pestanas.indexOf(p); if (i >= 0) this.pestanas.splice(i, 1); if (this.act === p && !this.destruida) { this.act = null; const q = this.pestanas[Math.max(0, i - 1)]; if (q) this.activaPestana(q).catch(() => {}); else this.nuevaPestana().catch(() => {}); } else this.env(this.listaPestanas()); });
  }

  async activaPestana(p) {
    if (!p || this.destruida) return;
    { const c = this.chequeo; if (c && c.p !== p) this.sueltaChequeo(c, 'otra pestaña', false); } // la comprobación es de la pestaña que se ve
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
    if (this.sellada) return route.abort('blockedbyclient').catch(() => {}); // burbuja sellada: ninguna conexión sale
    const url = req.url();
    if (!/^https?:/.test(url)) return route.continue().catch(() => {});
    const host = hostDe(url);
    const tipo = this.tipoDe(req);
    if (tipo === 'popup') { if (process.env.ZERO_DEBUG) console.log('popup abortado:', url.slice(0, 80)); return route.abort('blockedbyclient').catch(() => {}); } // las ventanas nuevas no se abren en la burbuja
    const principal = tipo === 'document';
    const pest = this.pestanaDeReq(req) || this.act; let st = pest ? pest.stats : Sesion.statsNuevo(); // let: se reasigna al cambiar de web (antes era const y la segunda web de cada pestaña fallaba con ERR_FAILED)
    const origen = principal ? host : hostDe(pest ? pest.page.url() : '') || host;
    const tercero = baseDominio(host) !== baseDominio(origen);
    let postData = null; try { postData = req.postData(); } catch (_) {}
    const fugas = this.senuelos.inspecciona({ url, postData, headers: req.headers(), tercero });
    if (fugas.length) { const dcheck = cortes.decide({ url, tipo, origen, host, tercero }); fugas.forEach((f) => this.senuelo(f, host, url, tercero, (!!dcheck.bloquear && (dcheck.proposito === 'malware' || !this.permiso(host, PROPOSITO[dcheck.proposito] || 'Rastreador'))) || (this.nivel && this.nivel !== 'normal' && tercero && !esLocal(host)))); }
    if (principal) {
      // ZERO entra antes que tú: una web nueva en la pestaña que se ve (escrita en la barra o alcanzada por un enlace o un salto)
      // se comprueba antes de enseñarla. Un documento nuevo dentro de la misma comprobación (saltos, redirecciones) la alarga.
      if (pest && this.act === pest) {
        const c = this.chequeo;
        if (c && c.p === pest && !c.listo) { if (host !== c.host) this.empiezaChequeo(pest, url, 'salto'); }
        else if (st.webActual && baseDominio(st.webActual) !== baseDominio(host)) this.empiezaChequeo(pest, url, 'enlace');
      }
      if (st.webActual && baseDominio(st.webActual) !== baseDominio(host) && pest) {
        // la pestaña cambia de web por un enlace: cuentas nuevas «en esta web» (las de la sesión se conservan en EN VIVO)
        pest.stats = Sesion.statsNuevo(); st = pest.stats;
        if (this.act === pest) { this.env({ t: 'resumen', cortes: 0, empresas: 0, paises: 0, porque: {}, n: st.n, web: host, alerta: this.alerta }); this.env({ t: 'cortes', lista: [] }); }
      }
      st.webActual = host;
      // 1) web peligrosa conocida (listas de malware/phishing) → se detiene dentro de la burbuja
      const d = cortes.decide({ url, tipo: 'document', origen, host, tercero: false });
      if (d.bloquear && d.proposito === 'malware') { // riesgo grave: no se abre, y no hay forma de «entrar igualmente»
        st.n.bloqueos++;
        this.suceso({ clase: 'bloqueo', certeza: 'comprobado', dominio: host, texto: 'Esta dirección figura en una lista pública de webs peligrosas. ZERO no la ha abierto.', detalle: { regla: d.regla, lista: d.lista } });
        this.hitoChequeo(pest, 'listas', { peligrosa: true, lista: (cortes.listas[d.lista] || {}).nombre || null });
        return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: paginaBloqueo('Esta web figura en una lista de webs peligrosas', 'ZERO ha detenido el acceso antes de cargar ningún contenido. La dirección coincide con una regla de una lista pública de malware o fraude. Aunque una lista puede contener errores, por tu seguridad ZERO no abre esta web.', host + ' · regla ' + d.regla + ' · ' + (cortes.listas[d.lista] || {}).nombre) }).catch(() => {});
      }
      this.hitoChequeo(pest, 'listas', { peligrosa: false });
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
      // modo observatorio: la librería de la subasta corre en la burbuja (sin cookies ni identidad) para poder leerla;
      // las pujas, los anuncios y el seguimiento siguen cortados
      this.suceso({ clase: 'observatorio', certeza: 'comprobado', dominio: host, texto: 'Modo observatorio: ZERO deja correr el programa de la subasta en la burbuja, sin tu identidad, para enseñarte quién puja; los anuncios y el seguimiento siguen cortados.', detalle: { regla: d.regla } });
      if (MOCK && !esLocal(host)) return this.simula(route, req, tipo);
      return route.continue().catch(() => {});
    }
    const permitida = this.permiso(host, d.bloquear ? PROPOSITO[d.proposito] || 'Rastreador' : 'Otra empresa');
    if (d.bloquear) {
      if (this.nivel === 'observar' && d.proposito !== 'malware') { this.corte(host, tipo, origen, tercero, d, st, 'visto'); return route.continue().catch(() => {}); }
      if (permitida && d.proposito !== 'malware') { this.corte(host, tipo, origen, tercero, d, st, permitida === 2 ? 'permitido' : 'visto'); return route.continue().catch(() => {}); }
      this.corte(host, tipo, origen, tercero, d, st);
      return route.abort('blockedbyclient').catch(() => {});
    }
    // 27 Oct 2026 (dueño: «Tor tiene que cortar bastante más»): con Tor se cortan además las empresas de publicidad, rastreo,
    // medición y avisos de cookies de la base de GUARDIANA aunque no estén en las listas, y los avisos (ping) a otras webs.
    // Las de servicio (vídeo, imágenes, CDN) y las del propio grupo editorial no se tocan: la web sigue funcionando.
    if (this.ultra && TOR_PROXY && tercero && !esLocal(host)) {
      const cat = empresas.atribuye(host).categoria;
      const prop = TOR_CORTA[cat] || (tipo === 'ping' ? 'rastreo' : null);
      if (prop) {
        const dd = { regla: 'Tor: ' + (cat ? 'empresa de ' + cat + ' (base de GUARDIANA)' : 'aviso (ping) a otra web'), lista: null, proposito: prop };
        const pp = this.permiso(host, PROPOSITO[prop]); if (pp) { this.corte(host, tipo, origen, tercero, dd, st, pp === 2 ? 'permitido' : 'visto'); return route.continue().catch(() => {}); }
        this.corte(host, tipo, origen, tercero, dd, st);
        return route.abort('blockedbyclient').catch(() => {});
      }
    }
    if (((this.nivel && this.nivel !== 'normal' && this.nivel !== 'observar') || (this.alerta >= 2 && !this.dejaPorDefecto())) && tercero && !esLocal(host) && permitida !== 2) {
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

  // 27 Oct 2026 (dueño): «al abrir la web, de forma predeterminada, que no se corte nada, para que se vean las subastas, todo; y
  // cuando el cliente decide cortar, ahí empiezan los cortes». Con Google y Brave todo pasa (y se enseña) salvo las webs
  // peligrosas; con Tor se corta por defecto. Lo que la persona decide manda: primero empresa o dominio, luego el grupo entero.
  dejaPorDefecto() { return !(this.ultra && TOR_PROXY); }
  // 0: se corta · 1: pasa por defecto · 2: pasa porque la persona lo permitió
  permiso(host, grupo) {
    const ks = [baseDominio(host)]; const emp = empresas.atribuye(host).empresa; if (emp) ks.push('e:' + emp);
    if (ks.some((k) => this.vetadas.has(k))) return 0;
    if (ks.some((k) => this.permitidas.has(k))) return 2;
    if (grupo && this.vetadas.has('p:' + grupo)) return 0;
    if (grupo && this.permitidas.has('p:' + grupo)) return 2;
    return this.dejaPorDefecto() ? 1 : 0;
  }

  corte(host, tipo, origen, tercero, d, st, estado) {
    st = st || this.act.stats;
    estado = estado || 'cortado';
    if (d && d.proposito === 'malware' && estado === 'cortado') { this.vig.peligrosas++; this.envVigilancia(); this.autoSella('la web intentó cargar algo de una web peligrosa (' + host + ')'); }
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
      texto: (estado === 'cortado' ? 'ZERO ha cortado ' : estado === 'visto' ? 'ZERO ha visto ' : 'ZERO ha permitido, por decisión tuya, ') + que + (e.empresa ? ', de ' + quien : ' hacia ' + host) + '.',
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
      return this.suceso({ clase: 'huella', certeza: 'probable', dominio, texto: 'Un programa de ' + dominio + ' ha consultado ' + via + ', un dato que permite reconocer un equipo. En ZERO, ese dato corresponde a la burbuja remota, no a tu equipo.', detalle: { via: s.via } });
    }
    if (s.clase === 'permiso') { st.n.permisos++; return this.suceso({ clase: 'permiso', certeza: 'comprobado', dominio, texto: 'La web ha solicitado acceso a ' + s.que + '. ZERO lo ha denegado: la burbuja remota no contiene ningún dato tuyo.', detalle: { que: s.que } }); }
    if (s.clase === 'webrtc') { st.n.permisos++; return this.suceso({ clase: 'webrtc', certeza: 'comprobado', dominio, texto: 'La web ha intentado abrir una conexión directa (WebRTC), la vía habitual para averiguar la dirección de red real. ZERO la mantiene desactivada.' }); }
    if (s.clase === 'formulario') return this.suceso({ clase: 'formulario', certeza: 'comprobado', dominio, texto: s.detenido ? 'Este formulario enviaría tus datos sin encriptar. ZERO ha detenido el envío.' : 'Atención: este formulario enviaría lo que escribas sin encriptar.', detalle: { accion: s.accion, detenido: s.detenido } });
    if (s.clase === 'subasta') {
      st.n.subastas++;
      if (s.fase === 'fin') {
        const pujas = (s.pujas || []).map((p) => ({ ...poda(p), ...empresaDe(p.pujador) }));
        const n = new Set([...(s.pedidos || []), ...pujas.map((p) => p.pujador)]).size;
        return this.suceso({ clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Esta página ha subastado sus espacios publicitarios: ' + n + (n === 1 ? ' empresa pujó' : ' empresas pujaron') + ' por ' + (s.unidades || 1) + ((s.unidades || 1) === 1 ? ' espacio' : ' espacios') + ' en ' + (s.ms != null ? s.ms + ' ms' : 'milisegundos') + '. Los precios son los declarados por cada pujador.', detalle: { id: s.id, ms: s.ms, limite: s.limite || null, unidades: s.unidades, pedidos: poda(s.pedidos), pujas, sinPuja: poda(s.sinPuja), tarde: poda(s.tarde), peticiones: poda(s.peticiones), config: poda(s.config), tcf: poda(s.tcf) } });
      }
      if (s.fase === 'amazon') {
        const n = (s.pujas || []).length;
        return this.suceso({ clase: 'subasta', certeza: 'comprobado', dominio, texto: n ? 'Amazon ha pujado por ' + n + (n === 1 ? ' espacio publicitario' : ' espacios publicitarios') + ' de esta página. Su precio va encriptado: solo lo lee el servidor de anuncios.' : 'Amazon ha recibido los datos de tu visita para pujar, pero no ha pujado.', detalle: { fase: 'amazon', huecos: s.huecos || 0, pujas: (s.pujas || []).map(poda) } });
      }
      if (s.fase === 'ganada') return this.suceso({ clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Ganó la puja ' + s.pujador + (s.cpm != null ? ' declarando ' + s.cpm + ' ' + (s.moneda || '') + ' por mil impresiones' : '') + (s.anunciante ? ' para el anunciante ' + s.anunciante : '') + '.', detalle: { ...poda(s), ...empresaDe(s.pujador) } });
      return this.suceso({ clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Espacio publicitario servido por Google' + (s.vacio ? ' (vacío)' : '') + (s.anunciante ? ' · anunciante n.º ' + s.anunciante : '') + '.', detalle: poda(s) });
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
      // 26 Oct 2026: muro antirrobot (as.com/PRISA, Cloudflare, DataDome…): la web rechaza a la burbuja por salir de un servidor.
      // Se dice con honestidad en la página; no se reintenta ni se esquiva.
      if ((st === 403 || st === 429 || st === 503) && (p || this.act) === this.act) this.env({ t: 'muro', host: hostDe(r.url()), estado: st });
      const cadena = []; let q = req.redirectedFrom();
      while (q) { cadena.unshift(hostDe(q.url())); q = q.redirectedFrom(); }
      { // ZERO entra antes que tú: la web respondió; conexión cifrada o no, protocolo y quién firmó el certificado (lo que dice Chromium)
        const pp = p || this.act; const c = this.chequeo;
        if (c && c.p === pp && !c.listo) r.securityDetails().catch(() => null).then((sd) => this.hitoChequeo(pp, 'conexion', { cifrada: r.url().startsWith('https:'), estado: st, saltos: cadena.length, cadena: cadena.slice(-8), protocolo: (sd && sd.protocol) || null, emisor: (sd && sd.issuer) || null }));
      }
      if (cadena.length >= 2) {
        const inter = [...new Set(cadena)];
        this.suceso({ clase: 'redireccion', certeza: 'comprobado', dominio: hostDe(req.url()), texto: 'Antes de llegar a ' + hostDe(req.url()) + ', el enlace pasó por ' + cadena.length + ' redirecciones (' + inter.join(' → ') + '). Este tipo de redirecciones suele utilizarse para registrar tu clic.', detalle: { cadena } });
      }
    } catch (_) {}
  }

  // Descargas en cuarentena (ronda 40, punto 11/fase 5): el archivo se guarda dentro de la burbuja, se inspecciona (tamaño,
  // tipo por extensión, huella SHA-256, si la dirección está en las listas de webs peligrosas) y solo llega al equipo de
  // la persona si ella lo pide después de ver la inspección. Nada se abre ni se ejecuta en la burbuja.
  async descarga(d) {
    const crudo = String(d.suggestedFilename() || 'archivo').slice(0, 200), url = d.url(), host = hostDe(url);
    const nombre = nombreVisible(crudo), limpio = crudo.replace(RE_INVISIBLE, '');
    const id = ++this.nDesc;
    const ext = (limpio.includes('.') ? limpio.split('.').pop() : '').toLowerCase();
    const engano = [];
    if (/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/.test(crudo)) engano.push('invisible');
    if (/\.(pdf|docx?|xlsx?|pptx?|odt|rtf|txt|csv|jpe?g|png|gif|webp|mp3|mp4|zip|rar)\.(exe|scr|com|pif|bat|cmd|js|jse|vbs|vbe|wsf|hta|msi|lnk|jar|ps1|reg|iso)$/i.test(limpio)) engano.push('doble');
    const EJEC = new Set(['exe', 'msi', 'bat', 'cmd', 'ps1', 'scr', 'com', 'pif', 'js', 'jse', 'vbs', 'vbe', 'wsf', 'hta', 'jar', 'dmg', 'pkg', 'app', 'sh', 'apk', 'lnk', 'reg', 'iso', 'msix', 'appx']);
    const riesgo = EJEC.has(ext) ? 'programa' : /^(zip|rar|7z|gz|tgz|tar|bz2|xz)$/.test(ext) ? 'comprimido' : /^(pdf|docx?|xlsx?|pptx?|odt|ods|odp|rtf)$/.test(ext) ? 'documento' : /^(jpe?g|png|gif|webp|svg|heic|mp4|mp3|wav|webm)$/.test(ext) ? 'multimedia' : 'archivo';
    const lista = cortes.decide({ url, tipo: 'other', origen: this.webActual || host, host, tercero: baseDominio(host) !== baseDominio(this.webActual || host) });
    const malo = !!(lista.bloquear && lista.proposito === 'malware');
    const reg = { id, nombre, url: url.slice(0, 300), host, bytes: 0, sha256: null, riesgo, malo, estado: 'descargando', hora: ahora(), ruta: null, porDentro: null, engano };
    this.descargas.set(id, reg);
    this.suceso({ clase: 'descarga', certeza: 'comprobado', dominio: host, texto: 'La web ha iniciado la descarga de «' + nombre + '». ZERO la ha retenido en la burbuja para analizarla: tu equipo no ha recibido nada.', detalle: { id, nombre, riesgo, malo } });
    try {
      const ruta = await d.path();
      const st = fs.statSync(ruta); reg.bytes = st.size; reg.ruta = ruta;
      try { const fd = fs.openSync(ruta, 'r'); const b = Buffer.alloc(16); const n = fs.readSync(fd, b, 0, 16, 0); fs.closeSync(fd); reg.porDentro = tipoPorDentro(b.subarray(0, n)); } catch (_) {}
      // por dentro es un programa y el nombre dice otra cosa (un .pdf, una foto…): engaño clásico
      if (['windows', 'linux', 'mac'].includes(reg.porDentro) && riesgo !== 'programa' && !engano.includes('distinto')) engano.push('distinto');
      if (st.size <= 25 * 1024 * 1024) { const h = crypto.createHash('sha256'); h.update(fs.readFileSync(ruta)); reg.sha256 = h.digest('hex'); reg.estado = 'retenida'; }
      else { reg.estado = 'retenida (demasiado grande para traerla: más de 25 MB)'; reg.grande = true; }
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
      this.suceso({ clase: 'descarga', certeza: 'comprobado', dominio: reg.host, texto: 'A petición tuya, ZERO ha transferido «' + reg.nombre + '» a tu equipo (' + reg.bytes + ' bytes, SHA-256 ' + (reg.sha256 || '').slice(0, 12) + '…). Ábrelo solo si confías en el remitente.', detalle: { nombre: reg.nombre, sha256: reg.sha256, riesgo: reg.riesgo } });
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
    this.cuentaVigilancia(x);
    this.env({ t: 'resumen', cortes: this.n.cortes, empresas: this.empresas.size, paises: this.paises.size, porque: this.porque, n: this.n, web: this.webActual, alerta: this.alerta });
    if (x.clase !== 'alerta') this.vigila(x);
  }

  cuentaVigilancia(x) {
    const v = this.vig, d = x.detalle || {};
    if (x.clase === 'local') v.local++;
    else if (x.clase === 'onion') v.onion++;
    else if (x.clase === 'bloqueo') v.peligrosas++;
    else if (x.clase === 'muro') v.muros++;
    else if (x.clase === 'descarga' && !d.sha256) { v.descargas++; if (d.malo) { v.peligrosas++; this.autoSella('descarga de una web peligrosa'); } }
    else if (x.clase === 'señuelo') {
      if (d.tipo === 'visita' || (d.tercero && !d.cortada)) { v.senFuera++; this.fuga(x); }
      else if (d.tercero && d.cortada) v.senCortados++;
      else v.senPropios++;
    } else return;
    this.envVigilancia();
  }

  envVigilancia() {
    this.env({ t: 'vigilancia', ...this.vig, senPlantados: 4, salida: this.ultra && TOR_PROXY ? 'tor' : 'directa', region: process.env.ZERO_REGION || '',
      filtro: !!this.filtro, alerta: this.alerta, sellada: !!this.sellada, nivel: this.nivel || 'normal',
      destruyeEn: this.autoDestruye ? Math.max(0, Math.round((this.autoDestruye.hasta - Date.now()) / 1000)) : 0 });
  }

  // Señales fuertes (ronda 50 G, ChatGPT y Astra; Gemini): una web peligrosa conocida dentro de la página o en una descarga → sellar.
  autoSella(motivo) { if (!this.destruida && this.alerta < 3) this.ponAlerta(3, 'automático: ' + motivo).catch(() => {}); }

  // Un señuelo que sale de la burbuja hacia otra empresa (o alguien que sigue el enlace oculto) es una fuga: se sella al momento y, si la
  // persona no reanuda en 20 s, la burbuja se destruye y se borra todo. En Observar (la persona eligió no cortar nada) solo se avisa.
  fuga(x) {
    if (this.destruida || (this.nivel || 'normal') === 'observar' || this.dejaPorDefecto()) return;
    this.autoSella('un dato de la burbuja salió hacia ' + (x.empresa || x.dominio || 'otra empresa'));
    if (this.autoDestruye) return;
    const hasta = Date.now() + 20000;
    this.autoDestruye = { hasta, t: setTimeout(() => { const a = this.autoDestruye; this.autoDestruye = null; if (a && this.sellada && !this.destruida) this.destruye('fuga detectada: destrucción automática a los 20 s').catch(() => {}); }, 20000) };
    this.op('fuga detectada: la burbuja se destruirá sola en 20 s salvo que la persona la reanude');
  }

  // Respuesta gradual (ronda 40, punto 11, las tres voces): cada suceso suma puntos en esta web; al pasar un umbral la burbuja
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
    let nivel = this.puntos >= 12 && grave ? 3 : this.puntos >= 6 ? 2 : this.puntos >= 2 ? 1 : 0;
    if (nivel >= 2 && this.dejaPorDefecto() && !this.motivos.some((m) => ['bloqueo', 'certificado'].includes(m.clase))) nivel = 1; // sin cortes por defecto: se vigila y se avisa
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
      0: 'La burbuja vuelve a la calma.',
      1: 'ZERO vigila esta web de cerca: ha visto varios intentos (huella, permisos o ventanas) que juntos merecen atención.',
      2: 'Alerta en esta web: ZERO corta ahora toda conexión con otras empresas mientras dure la visita. La web sigue abierta.',
      3: 'Burbuja sellada: ZERO ha cortado toda la red de la burbuja y ha parado sus programas. Lo que ves queda congelado; nada entra ni sale. Puedes reanudar o destruir la burbuja.',
    };
    this.suceso({ clase: 'alerta', certeza: 'comprobado', dominio: this.webActual, texto: TEXTO[nivel] || '', detalle: { nivel, nombre: NOMBRE[nivel], antes, motivo, puntos: this.puntos, motivos: this.motivos.slice(-12) } });
    this.env({ t: 'alerta', nivel, nombre: NOMBRE[nivel], motivo, puntos: this.puntos, sellada: this.sellada });
    this.envVigilancia();
  }

  nav(cargada) {
    try {
      const u = this.page.url(); if (this.act) this.act.url = u;
      const rs = this.act && this.act.respondio; const ok = !!(rs && rs.ok && hostDe(rs.url) === hostDe(u));
      this.env({ t: 'nav', url: u, host: hostDe(u), segura: u.startsWith('https:'), cargada: !!cargada, ok });
      if (cargada) this.page.title().then((tt) => this.env({ t: 'titulo', titulo: tt })).catch(() => {});
    } catch (_) {}
  }

  // ---- «ZERO entra antes que tú» (27 Oct 2026, dueño; ronda 67) ----
  // Una comprobación por apertura, en la pestaña que se ve. Hitos reales que se cuentan a la persona según ocurren: «listas» (la
  // dirección pasó, o no, las listas de webs peligrosas antes de conectar), «conexion» (la web respondió: cifrada o no, protocolo y
  // emisor del certificado), «documento» y «carga» (eventos de la página). Se cierra tras la carga y un instante de observación,
  // poco después del documento si la carga completa se alarga, o al tope; entonces se manda el resultado con lo visto y se suelta
  // la imagen. Solo se afirma lo que ZERO ha comprobado en esta burbuja.
  empiezaChequeo(p, url, motivo) {
    if (!p || this.destruida) return null;
    const host = hostDe(url); if (!host) return null;
    const c0 = this.chequeo;
    const reciente = (h) => Date.now() - (this.comprobadas.get(h) || 0) < CHEQUEO_RECUERDA_MS;
    if (c0 && c0.p === p && !c0.listo && motivo === 'salto') { // un salto dentro de la misma apertura: sigue la misma comprobación
      if (host !== c0.host) {
        c0.saltos.push(host); c0.host = host;
        // el salto lleva a una web no comprobada: desde aquí se retiene la imagen (y la página enseña la capa)
        if (c0.rapida && !reciente(host)) { c0.rapida = false; this.env({ t: 'chequeo', fase: 'empieza', id: c0.id, host, motivo: 'salto' }); }
        else this.env({ t: 'chequeo', fase: 'salto', id: c0.id, host });
      }
      return c0;
    }
    if (c0) this.sueltaChequeo(c0, 'otra web', false); // otra apertura antes de terminar: la anterior se descarta sin enseñarla
    p.grave = null; // la pestaña va a otra web: lo grave de la anterior ya no está a la vista
    const c = { id: ++this.nCheq, p, host, url: String(url).slice(0, 300), motivo: motivo || 'abrir', t0: Date.now(), iSuc: this.sucesos.length, vig0: { ...this.vig }, saltos: [], hitos: {}, cuadro: null, listo: false, tope: null, doc: null, calma: null, fallo: null, rapida: reciente(host) };
    this.chequeo = c;
    c.tope = setTimeout(() => this.cierraChequeo(c, 'tope'), CHEQUEO_TOPE_MS);
    // comprobada limpia hace poco en esta burbuja: se vuelve a comprobar, pero sin retener la imagen (la página no enseña la capa)
    this.env({ t: 'chequeo', fase: 'empieza', id: c.id, host, motivo: c.motivo, rapida: c.rapida });
    return c;
  }

  hitoChequeo(p, hito, datos) {
    const c = this.chequeo;
    if (!c || c.listo || c.p !== p) return;
    if (hito === 'conexion' && c.hitos.listas && c.hitos.listas.peligrosa) return; // lo que «responde» es la página de ZERO que la detuvo
    const nuevo = !c.hitos[hito];
    c.hitos[hito] = { ms: Date.now() - c.t0, ...(datos || {}) };
    if (nuevo || hito === 'listas' || hito === 'conexion') this.env({ t: 'chequeo', fase: 'paso', id: c.id, paso: hito, ...(datos || {}) });
    if (hito === 'carga') { clearTimeout(c.doc); clearTimeout(c.calma); c.calma = setTimeout(() => this.cierraChequeo(c, 'carga'), CHEQUEO_CALMA_MS); }
    else if (hito === 'documento' && nuevo && !c.hitos.carga) {
      clearTimeout(c.doc); c.doc = setTimeout(() => this.cierraChequeo(c, 'documento'), CHEQUEO_DOC_MS);
      // un desafío antirrobot espera a una persona: se suelta ya y se dice
      p.page.title().then((tt) => { if (RE_DESAFIO.test(String(tt || ''))) { c.desafio = true; this.cierraChequeo(c, 'desafío'); } }).catch(() => {});
    }
  }

  // un documento nuevo dentro de la comprobación (salto, redirección por programa): sus eventos de carga vuelven a contar
  reiniciaCargaChequeo(p) {
    const c = this.chequeo;
    if (!c || c.listo || c.p !== p) return;
    clearTimeout(c.doc); clearTimeout(c.calma); c.doc = c.calma = null;
    delete c.hitos.documento; delete c.hitos.carga;
  }

  cierraChequeo(c, porque) {
    if (!c || c.listo || this.chequeo !== c) return;
    c.listo = true; clearTimeout(c.tope); clearTimeout(c.doc); clearTimeout(c.calma);
    this.chequeo = null;
    let r; try { r = this.resultadoChequeo(c, porque); } catch (e) { r = { resultado: 'limpia', motivos: [], hechos: {}, ms: Date.now() - c.t0, porque }; }
    if (r.resultado === 'limpia') { this.comprobadas.set(c.host, Date.now()); if (this.comprobadas.size > 300) this.comprobadas.delete(this.comprobadas.keys().next().value); }
    else this.comprobadas.delete(c.host);
    if (c.p) c.p.grave = r.resultado === 'peligro'; // ante un riesgo grave no se entra: tampoco reanudando la burbuja con esta web delante
    this.env({ t: 'chequeo', fase: 'listo', id: c.id, host: c.host, rapida: !!c.rapida, ...r });
    this.op('ZERO entró antes: ' + c.host + ' → ' + r.resultado + (r.motivos.length ? ' (' + r.motivos.join(', ') + ')' : '') + ' en ' + r.ms + ' ms, por ' + porque);
    this.sueltaCuadro(c);
  }

  // comprobación descartada sin resultado (otra web, otra pestaña, pestaña cerrada)
  sueltaChequeo(c, porque, suelta) {
    if (!c || c.listo) return;
    c.listo = true; clearTimeout(c.tope); clearTimeout(c.doc); clearTimeout(c.calma);
    if (this.chequeo === c) this.chequeo = null;
    this.env({ t: 'chequeo', fase: 'cancelado', id: c.id, motivo: porque });
    if (suelta !== false) this.sueltaCuadro(c); else c.cuadro = null;
  }

  // la imagen retenida sale ya; las siguientes, como siempre
  sueltaCuadro(c) {
    const d = c.cuadro; c.cuadro = null;
    if (d && this.act === c.p && this.ws.abierto) { this.ws.send(Buffer.from(d, 'base64')); this.nCuadros.enviados++; }
  }

  resultadoChequeo(c, porque) {
    const nuevos = this.sucesos.slice(c.iSuc);
    const cuenta = (f) => nuevos.filter(f).length;
    const det = (x) => x.detalle || {};
    const st = (c.p && c.p.stats) || Sesion.statsNuevo();
    const con = c.hitos.conexion || null;
    const idn = imitaLetras(c.host);
    const h = {
      listas: Object.values(cortes.listas).filter((l) => l.proposito === 'malware').map((l) => l.nombre),
      enLista: cuenta((x) => x.clase === 'bloqueo') > 0,
      certificado: cuenta((x) => x.clase === 'certificado') > 0,
      interna: cuenta((x) => x.clase === 'local' || x.clase === 'onion') > 0,
      peligrosas: Math.max(0, this.vig.peligrosas - c.vig0.peligrosas - cuenta((x) => x.clase === 'bloqueo')), // dentro de la web (la propia web en lista no cuenta aquí)
      respondio: !!con, cifrada: con ? !!con.cifrada : /^https:/i.test(c.url), estado: con ? con.estado : null, protocolo: con ? con.protocolo : null, emisor: con ? con.emisor : null,
      saltos: Math.max(c.saltos.length, con && con.saltos ? con.saltos : 0),
      descargas: cuenta((x) => x.clase === 'descarga' && !det(x).sha256),
      descargaPeligrosa: cuenta((x) => x.clase === 'descarga' && !det(x).sha256 && det(x).malo) > 0,
      ventanas: cuenta((x) => x.clase === 'popup'),
      avisos: cuenta((x) => x.clase === 'dialogo'),
      permisos: cuenta((x) => x.clase === 'permiso' || x.clase === 'webrtc'),
      huella: cuenta((x) => x.clase === 'huella'),
      formulario: cuenta((x) => x.clase === 'formulario'),
      fugas: cuenta((x) => x.clase === 'señuelo' && (det(x).tipo === 'visita' || (det(x).tercero && !det(x).cortada))),
      empresas: st.empresas.size, cortes: st.n.cortes || 0, limpiezas: st.n.limpiezas || 0,
      idn: idn || null,
      sellada: !!this.sellada,
      fallo: c.fallo || (cuenta((x) => x.clase === 'fallo') > 0 && !con ? 'no cargó' : null),
      cargada: !!c.hitos.carga, lenta: porque === 'tope' && !c.hitos.carga, desafio: !!c.desafio,
    };
    // Lo que ZERO sabe de esta apertura, con nombres y datos concretos (dueño 18:56: «tenemos que darle el máximo de información
    // que podamos saber»): qué archivo, qué lista y qué regla, qué falla en el certificado, a qué empresa salió el señuelo, a dónde
    // enviaría el formulario, qué empresas, saltos, ventanas, avisos, permisos, huella y parámetros. Listas cortas; nada inventado.
    const solo = (arr, max) => { const u = [...new Set(arr.filter((x) => x != null && x !== '').map(String))]; return u.length ? { n: u.length, v: u.slice(0, max || 8) } : null; };
    const ficha = (r) => r && { id: r.id, nombre: r.nombre, riesgo: r.riesgo, malo: !!r.malo, host: r.host, url: r.url, bytes: r.bytes || 0, sha256: r.sha256 || null, estado: r.estado, grande: !!r.grande, porDentro: r.porDentro || null, engano: r.engano || [] };
    const blq = nuevos.find((x) => x.clase === 'bloqueo'), cer = nuevos.find((x) => x.clase === 'certificado');
    const emp = [...st.empresas.values()].sort((a, b) => b.n - a.n);
    const cadena = con && con.cadena && con.cadena.length ? con.cadena.concat(c.host) : c.saltos.length ? [hostDe(c.url)].concat(c.saltos) : [];
    h.detalle = {
      archivos: nuevos.filter((x) => x.clase === 'descarga' && !det(x).sha256 && det(x).id).slice(0, 5).map((x) => ficha(this.descargas.get(det(x).id)) || { id: det(x).id, nombre: det(x).nombre, riesgo: det(x).riesgo, malo: !!det(x).malo, host: x.dominio, estado: 'descartada', engano: [] }),
      lista: blq ? { nombre: (cortes.listas[det(blq).lista] || {}).nombre || det(blq).lista || null, regla: det(blq).regla || null } : null,
      certificado: cer ? { motivo: det(cer).motivo || null, codigo: (String(det(cer).error || '').match(/ERR_[A-Z_]+/) || [])[0] || null } : null,
      dentro: solo(nuevos.filter((x) => x.clase === 'corte' && x.estado === 'cortado' && x.proposito === PROPOSITO.malware).map((x) => x.dominio)),
      fugas: solo(nuevos.filter((x) => x.clase === 'señuelo' && (det(x).tipo === 'visita' || (det(x).tercero && !det(x).cortada))).map((x) => [x.empresa, x.dominio].filter(Boolean).join(' · '))),
      formularios: solo(nuevos.filter((x) => x.clase === 'formulario').map((x) => String(det(x).accion || '').slice(0, 200))),
      empresas: emp.length ? { n: emp.length, v: emp.slice(0, 12).map((r) => ({ e: r.empresa || r.dominio, p: r.proposito })) } : null,
      saltos: cadena.length > 1 ? { n: cadena.length - 1, v: cadena.slice(0, 10) } : null,
      ventanas: solo(nuevos.filter((x) => x.clase === 'popup').map((x) => x.dominio)),
      avisos: solo(nuevos.filter((x) => x.clase === 'dialogo').map((x) => det(x).texto), 5),
      permisos: solo(nuevos.filter((x) => x.clase === 'permiso').map((x) => det(x).que).concat(nuevos.some((x) => x.clase === 'webrtc') ? ['webrtc'] : [])),
      huella: solo(nuevos.filter((x) => x.clase === 'huella').map((x) => det(x).via)),
      limpiezas: solo([].concat(...nuevos.filter((x) => x.clase === 'limpieza').map((x) => det(x).quitados || [])), 12),
    };
    const motivos = [];
    if (h.enLista) motivos.push('lista');
    if (h.certificado) motivos.push('certificado');
    if (h.interna) motivos.push('interna');
    if (h.peligrosas > 0 || h.descargaPeligrosa) motivos.push('peligrosa-dentro');
    if (h.sellada && !motivos.length) motivos.push('sellada');
    let resultado = motivos.length ? 'peligro' : '';
    if (!resultado) {
      if (h.idn) motivos.push('idn');
      if (h.descargas) motivos.push('descarga');
      if (h.fugas) motivos.push('fuga');
      if (h.formulario) motivos.push('formulario');
      // un aviso emergente nada más abrir (así empiezan las estafas de falso soporte técnico): se dice lo que ponía
      if (nuevos.some((x) => x.clase === 'dialogo' && x.dominio === c.host && det(x).tipo !== 'beforeunload' && det(x).texto)) motivos.push('dialogo');
      if (h.respondio && !h.cifrada && !esLocal(c.host)) motivos.push('sin-cifrar'); // en el propio equipo (pruebas) no viaja por ninguna red
      resultado = motivos.length ? 'aviso' : h.fallo ? 'fallo' : 'limpia';
    }
    return { resultado, motivos, hechos: h, ms: Date.now() - c.t0, porque };
  }

  async ve(url) {
    if (process.env.ZERO_DEBUG) console.log('ve():', String(url).slice(0, 80), 'sellada', this.sellada, 'act', this.act && this.act.id);
    url = String(url || '').trim().slice(0, 4096);
    if (!/^[a-z]+:\/\//i.test(url)) url = 'https://' + url;
    if (!/^https?:\/\//i.test(url)) { this.op('dirección rechazada: solo http y https'); return; } // nada de file://, chrome://, javascript:…
    // ZERO entra antes que tú: desde aquí, la persona no ve la web hasta que ZERO la ha comprobado (con la burbuja sellada no se abre nada)
    const cq = this.sellada ? null : this.empiezaChequeo(this.act, url, 'abrir');
    const cierraLuego = () => { if (cq) setTimeout(() => this.cierraChequeo(cq, 'detenida'), 200); }; // tras pintar la página de ZERO
    { // ULTRA capado: .onion fuera de la lista, nunca; y sin ULTRA, ninguna (no hay salida por Tor)
      const h = hostDe(url).toLowerCase();
      if (esOnion(h) && (onionVetada(h) || !(this.ultra && TOR_PROXY))) {
        const vetada = onionVetada(h);
        this.op('dirección .onion rechazada: ' + h);
        this.suceso({ clase: 'onion', certeza: 'comprobado', dominio: h, texto: vetada ? TXT_ONION : TXT_ONION_SIN_ULTRA });
        await this.page.setContent(paginaBloqueo(vetada ? 'Dirección .onion bloqueada' : 'Esta dirección solo se abre con Tor', vetada ? TXT_ONION : TXT_ONION_SIN_ULTRA, h)).catch(() => {});
        cierraLuego();
        return;
      }
      if (this.filtro && !PERMITE_LOCAL && (ipProhibida(h) || nombreLocal(h))) {
        this.op('dirección interna rechazada: ' + h);
        this.suceso({ clase: 'local', certeza: 'comprobado', dominio: h, texto: TXT_LOCAL });
        await this.page.setContent(paginaBloqueo('Dirección interna bloqueada', TXT_LOCAL, h)).catch(() => {});
        cierraLuego();
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
      if (cert) this.suceso({ clase: 'certificado', certeza: 'comprobado', dominio: hostDe(url), texto: 'No ha sido posible verificar la identidad de ' + hostDe(url) + ' (' + motivo + '). ZERO no ha establecido la conexión.', detalle: { error: m.split('\n')[0], motivo } });
      else if (cq && !cq.listo) cq.fallo = motivo;
      if (cq && this.chequeo && this.chequeo !== cq) return; // la persona ya pidió otra web: no se pisa con el aviso de esta
      await this.page.setContent(paginaBloqueo(cert ? 'No es posible verificar la identidad de esta web' : 'No ha sido posible abrir esta web', cert ? 'Su certificado de seguridad no supera la verificación: ' + motivo + '. Puede deberse a un error técnico de la web o a un intento de suplantación. ZERO no ha intercambiado ningún dato con ella.' : 'Motivo: ' + motivo + '. ZERO no ha enviado ningún dato.', hostDe(url) + ' · ' + m.split('\n')[0].slice(0, 120))).catch(() => {});
      cierraLuego();
    }
  }

  async mensaje(m) {
    let o; try { o = JSON.parse(m); } catch (_) { return; }
    try {
      if (o.t === 'hola') return await this.abre(o.w, o.h, o.idioma);
      // 27 Oct 2026 (dueño: «Tor ULTRA tiene que permitir navegar»): lo que llega mientras la burbuja cambia a Tor o vuelve
      // (abrir una web, pestañas, destruir…) espera a la burbuja nueva en vez de perderse. Ratón y teclado no esperan.
      if (this.cambiaUltra && !['raton', 'rueda', 'tecla', 'texto'].includes(o.t)) while (this.cambiaUltra) await this.cambiaUltra;
      if (!this.page || this.destruida) return;
      if (o.t === 'abrir') return await this.ve(String(o.url || '').trim());
      if (this.sellada && (o.t === 'raton' || o.t === 'rueda' || o.t === 'tecla' || o.t === 'texto')) return; // sellada: la burbuja no recibe nada
      // ZERO entra antes que tú: mientras se comprueba, la persona no ve la web, así que tampoco la toca
      if (this.chequeo && !this.chequeo.listo && !this.chequeo.rapida && this.chequeo.p === this.act && (o.t === 'raton' || o.t === 'rueda' || o.t === 'tecla' || o.t === 'texto')) return;
      if (o.t === 'chequeo') {
        // ante un riesgo grave no se entra (dueño 18:40): una página antigua que aún pida «entrar» no abre nada
        if (o.accion === 'entrar') { this.op('petición de entrar en una web detenida por riesgo grave: rechazada'); return; }
        if (o.accion === 'salir') { // «Volver»: a la web anterior o, si no la hay, fuera (portada de ZERO)
          const antes = this.page.url();
          this.op('la persona eligió volver desde ' + hostDe(antes));
          if (this.sellada) { // la web selló la burbuja: primero se sale de ella, sin red
            let previa = null;
            try { const hh = await this.act.cdp.send('Page.getNavigationHistory'); const e = hh.entries[hh.currentIndex - 1]; if (e && /^https?:/i.test(e.url)) previa = e.url; } catch (_) {}
            if (this.act) this.act.grave = null;
            await this.page.goto('about:blank').catch(() => {});
            // una fuga (un dato de la burbuja salió fuera) sigue su curso: sellada y destrucción a los 20 s salvo que la persona reanude
            if (this.autoDestruye) { this.env({ t: 'chequeo', fase: 'fuera' }); return; }
            // lo peligroso se quedó en aquella web: fuera de ella, la burbuja vuelve a la calma y se vuelve a la web anterior (otra vez comprobada)
            this.puntos = 0; this.motivos = []; await this.ponAlerta(0, 'la persona volvió desde una web con riesgo grave');
            if (previa) return await this.ve(previa);
            this.env({ t: 'chequeo', fase: 'fuera' });
            return;
          }
          await this.page.goBack({ waitUntil: 'commit', timeout: 8000 }).catch(() => null);
          const u = this.page.url();
          if (u === antes || !/^https?:/i.test(u)) { await this.page.goto('about:blank').catch(() => {}); this.env({ t: 'chequeo', fase: 'fuera' }); }
        }
        return;
      }
      if (o.t === 'raton') {
        if (o.tipo === 'move') return await this.page.mouse.move(o.x, o.y);
        if (o.tipo === 'down') return await this.page.mouse.down({ button: o.boton || 'left', clickCount: o.clicks || 1 });
        if (o.tipo === 'up') return await this.page.mouse.up({ button: o.boton || 'left', clickCount: o.clicks || 1 });
      }
      if (o.t === 'rueda') { await this.page.mouse.move(o.x, o.y); return await this.page.mouse.wheel(o.dx || 0, o.dy || 0); }
      if (o.t === 'tecla') return await (o.tipo === 'down' ? this.page.keyboard.down(o.key) : this.page.keyboard.up(o.key));
      if (o.t === 'texto') return await this.page.keyboard.insertText(String(o.s || '').slice(0, 20000));
      // Copiar: el texto seleccionado en la burbuja viaja al portapapeles de la persona (solo cuando ella pulsa Ctrl+C o «Copiar»).
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
        // ULTRA: la burbuja entera sale por Tor. Hace falta una burbuja nueva (el proxy se fija al crearla): se cierra la actual.
        const quiere = !!o.ultra;
        if (!TOR_PROXY) { this.suceso({ clase: 'ultra', certeza: 'comprobado', dominio: this.webActual, texto: 'Tor no está disponible en este motor: no tiene salida por Tor configurada. ZERO sigue como hasta ahora.', detalle: { disponible: false } }); return this.env({ t: 'ultra', disponible: false, activo: false }); }
        while (this.cambiaUltra) await this.cambiaUltra; // de uno en uno
        if (quiere === !!this.ultra) return;
        let listo; this.cambiaUltra = new Promise((r) => { listo = r; });
        try {
          this.ultra = quiere; this.op('Tor ' + (quiere ? 'activado' : 'desactivado') + ': burbuja nueva');
          try { if (this.ctx) await this.ctx.close(); } catch (_) {}
          this.pestanas = []; this.act = null; this.alerta = 0; this.puntos = 0; this.motivos = []; this.sellada = false; this.descargas = new Map();
          await this.abre(this.w, this.h, this.idioma); // con el idioma de la persona (antes volvía a es-ES)
          this.suceso({ clase: 'ultra', certeza: 'comprobado', dominio: '', texto: quiere ? 'Tor activado: esta burbuja nueva sale a internet por la red Tor (tres repetidores). Las webs ven la salida de Tor, no la de GUARDIANA.' : 'Tor desactivado: burbuja nueva con la salida normal de GUARDIANA.', detalle: { disponible: true, activo: quiere } });
          this.env({ t: 'ultra', disponible: true, activo: quiere });
        } finally { this.cambiaUltra = null; listo(); }
        return;
      }
      if (o.t === 'modo') { if ('observatorio' in o) { this.observatorio = !!o.observatorio; this.op('modo observatorio ' + (this.observatorio ? 'activado' : 'desactivado')); } if (o.nivel) await this.ponNivel(o.nivel); return; }
      if (o.t === 'permitir') {
        const k = String(o.clave || '').slice(0, 120); if (!k) return;
        const grupo = k.startsWith('p:') ? k.slice(2) : '';
        if (grupo) {
          // un grupo entero (Publicidad, Rastreadores…): quita lo hecho a mano con sus empresas para que valga para todas
          if (o.on) { this.permitidas.add(k); this.vetadas.delete(k); } else { this.permitidas.delete(k); this.vetadas.add(k); }
          for (const x of (Array.isArray(o.limpia) ? o.limpia : []).slice(0, 500)) { const c = String(x).slice(0, 120); this.permitidas.delete(c); this.vetadas.delete(c); }
        } else if (o.on) { this.permitidas.add(k); this.vetadas.delete(k); } else { this.permitidas.delete(k); this.vetadas.add(k); }
        this.op((o.on ? 'permitida ' : 'vuelve a cortarse ') + k);
        const nombre = grupo ? ({ Rastreador: 'Rastreadores', 'Aviso de cookies': 'Avisos de cookies', 'Otra empresa': 'Otras empresas', 'Web peligrosa': 'Webs peligrosas' }[grupo] || grupo) : '';
        this.suceso({ clase: 'permiso-empresa', certeza: 'comprobado', dominio: this.webActual, texto: grupo ? (o.on ? 'Has permitido todo el grupo «' + nombre + '» en esta sesión.' : 'Has cortado todo el grupo «' + nombre + '» en esta sesión.') : (o.on ? 'Has permitido las conexiones de ' : 'Has cortado las conexiones de ') + k.replace(/^e:/, '') + ' en esta sesión.', detalle: { clave: k, on: !!o.on } });
        return;
      }
      if (o.t === 'destruir') return await this.destruye('a petición de la persona');
      if (o.t === 'descarga') { if (o.accion === 'traer') return await this.traeDescarga(+o.id); if (o.accion === 'descartar') return this.descartaDescarga(+o.id); return; }
      if (o.t === 'pestana') {
        if (this.sellada) return;
        if (o.accion === 'nueva') return await this.nuevaPestana(o.url ? String(o.url).slice(0, 4096) : '');
        if (o.accion === 'cambiar') { const p = this.pestanas.find((x) => x.id === +o.id); if (p) await this.activaPestana(p); return; }
        if (o.accion === 'cerrar') return await this.cierraPestana(+o.id);
        return;
      }
      if (o.t === 'alerta') { if (o.accion === 'sellar') return await this.ponAlerta(3, 'a petición de la persona'); if (o.accion === 'reanudar') { if (this.autoDestruye) { clearTimeout(this.autoDestruye.t); this.autoDestruye = null; this.op('destrucción automática cancelada: la persona reanudó la burbuja'); }
        // ante un riesgo grave no se entra (dueño 18:40): si la web a la vista es la que ZERO detuvo, primero se sale de ella, sin red
        const a = this.act; if (a && a.grave && a.page) { a.grave = null; await a.page.goto('about:blank').catch(() => {}); this.op('reanudar: antes se sale de la web con riesgo grave'); this.env({ t: 'chequeo', fase: 'fuera' }); }
        this.puntos = 0; this.motivos = []; return await this.ponAlerta(0, 'reanudada por la persona'); } return; }
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

  // Una marca que solo existe en la burbuja ha salido (o ha intentado salir) hacia alguien. Se afirma solo lo visto.
  senuelo(f, host, url, tercero, cortada) {
    const clave = f.tipo + '|' + f.donde + '|' + host;
    if (this.senuelos.alertas.some((a) => a.clave === clave)) return;
    this.senuelos.apunta({ clave, tipo: f.tipo, donde: f.donde, host, url: String(url).slice(0, 300), tercero, cortada, hora: ahora() });
    const e = empresas.atribuye(host);
    const que = Senuelos.nombre(f.tipo);
    const texto = f.tipo === 'visita'
      ? 'Se ha visitado el enlace oculto que ZERO colocó como señuelo en la página (desde ' + host + '; ' + f.donde + '). Solo un programa que lee la página completa y sigue sus enlaces llega a él: un indexador, un generador de vistas previas o un rastreador.'
      : tercero
      ? 'Un dato que solo existe en tu burbuja (' + que + ', colocado por ZERO como señuelo) ' + (cortada ? 'iba a salir' : 'ha salido') + ' hacia ' + (e.empresa ? e.empresa + ' (' + host + ')' : host) + ' en ' + f.donde + '. Un programa de esta web lo leyó y lo envió' + (cortada ? '; ZERO cortó esa conexión.' : '.')
      : 'La propia web ha enviado a sus servidores un dato que solo existe en tu burbuja (' + que + ', colocado por ZERO como señuelo) en ' + f.donde + ': copia el contenido de la página o sus cookies.';
    this.n.senuelos = (this.n.senuelos || 0) + 1;
    this.suceso({ clase: 'señuelo', certeza: 'comprobado', dominio: host, empresa: e.empresa || null, paisNombre: e.paisNombre || null, texto, detalle: { tipo: f.tipo, que, donde: f.donde, tercero, cortada, url: String(url).slice(0, 200) } });
  }

  // Muros antirrobot por red (26 Oct 2026; p. ej. as.com: «El acceso está restringido temporalmente… un robot se encuentra en
  // la misma red»). El título no lo dice, así que se mira el texto de la página y de sus marcos, solo si es corta (las páginas de
  // bloqueo lo son). Si lo es, se avisa a la persona: desde la burbuja no se puede entrar; en su navegador de siempre, sí.
  async miraMuro(page) {
    if (this.destruida || !page || page.isClosed()) return;
    const RE = /acceso est[áa] restringido|access (is )?(temporarily )?restricted|robot se encuentra en la misma red|a robot is on the same network|you have been blocked|has sido bloquead|ha sido bloquead|request (was )?blocked|access denied|acceso denegado|unusual traffic|tr[áa]fico inusual|verify (that )?you are (a )?human|comprueba que eres humano|are you a robot|eres un robot/i;
    for (const f of page.frames()) {
      let t = '';
      try { t = await f.evaluate(() => { const b = document.body; const s = b ? b.innerText || '' : ''; return s.length > 6000 ? '' : s.slice(0, 3000); }); } catch (_) { continue; }
      if (t && RE.test(t)) {
        const host = hostDe(page.url());
        if (this.murosVistos && this.murosVistos.has(host)) return;
        (this.murosVistos = this.murosVistos || new Set()).add(host);
        this.suceso({ clase: 'muro', certeza: 'comprobado', dominio: host, texto: 'Esta web no admite navegadores que se conectan desde un servidor (protección antirrobot). No es posible abrirla desde la burbuja, pero sí desde tu navegador habitual.', detalle: { url: page.url().slice(0, 300) } });
        return;
      }
    }
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
    if (this.autoDestruye) { clearTimeout(this.autoDestruye.t); this.autoDestruye = null; }
    if (this.chequeo) { const c = this.chequeo; c.listo = true; clearTimeout(c.tope); clearTimeout(c.doc); clearTimeout(c.calma); c.cuadro = null; this.chequeo = null; }
    const t0 = Date.now();
    this.op('cierre pedido: ' + motivo);
    try { if (this.cdp) await this.cdp.send('Page.stopScreencast').catch(() => {}); } catch (_) {}
    try { if (this.ctx) await this.ctx.close(); this.op('burbuja cerrada: cookies, caché, almacenamiento y pestañas de la sesión eliminados con el contexto'); } catch (_) { this.op('burbuja cerrada con error'); }
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

// 27 Oct 2026 (dueño: un vídeo de Marca decía «navegador no compatible»): Google Chrome trae los códecs de vídeo H.264/AAC que
// el Chromium libre de Playwright no tiene. instalar.sh lo instala; si no está o no arranca, el motor sigue con Chromium.
// ZERO_CANAL=chromium obliga a usar Chromium.
async function lanzaNavegador() {
  const opciones = { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-networking', '--no-first-run', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp', '--disable-features=MediaRouter,Translate,OptimizationHints', '--autoplay-policy=user-gesture-required'] };
  if (process.env.ZERO_CANAL !== 'chromium') {
    try { const n = await chromium.launch({ ...opciones, channel: 'chrome' }); console.log('navegador: Google Chrome ' + n.version() + ' (con códecs de vídeo H.264/AAC)'); return n; }
    catch (e) { console.log('navegador: Google Chrome no disponible (' + String((e && e.message) || e).split('\n')[0].slice(0, 140) + '); sigo con Chromium'); }
  }
  return chromium.launch(opciones);
}

async function main() {
  navegador = await lanzaNavegador();
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
    if (VIVAS.size >= MAX_SESIONES) { console.log('sesión rechazada: tope de burbujas (' + MAX_SESIONES + ')'); return socket.destroy(); }
    const ws = WS.acepta(req, socket);
    if (ws) new Sesion(ws);
  });
  srv.listen(PUERTO, '127.0.0.1', () => console.log('ZERO motor', VERSION, 'en ws://127.0.0.1:' + PUERTO + '/sesion ·', nListas.reglas, 'reglas ·', MOCK ? 'simulacro de terceros activo' : 'internet real'));
  process.on('SIGINT', async () => { try { await navegador.close(); } catch (_) {} process.exit(0); });
}

main().catch((e) => { console.error(e); process.exit(1); });
