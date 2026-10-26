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
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const { WS } = require('./ws');
const { Cortes } = require('./cortes');
const { Empresas, baseDominio } = require('./empresas');
const SENSORES = require('./sensores');
const { Senuelos } = require('./senuelos');

const RAIZ = path.join(__dirname, '..');
const PUERTO = +process.argv[2] || 8792;
const MOCK = !!process.env.ZERO_MOCK;
const SESIONES = new Map(); // token de señuelo → sesión (para el colector /s/<token>)
const VERSION = 'prototipo 0.1 · 26 Oct 2026';
const CLAVE_SESION = crypto.randomBytes(32); // efímera: con ella se sella el comprobante de cada sesión

const cortes = new Cortes();
const nListas = cortes.cargaCarpeta(path.join(__dirname, 'listas'));
const empresas = new Empresas(RAIZ);
let navegador = null;

const hostDe = (u) => { try { return new URL(u).hostname; } catch (_) { return ''; } };
const ahora = () => new Date().toISOString();
const esLocal = (h) => h === '127.0.0.1' || h === 'localhost' || h === '::1';

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

class Sesion {
  constructor(ws) {
    this.ws = ws; this.id = crypto.randomBytes(6).toString('hex'); this.creada = Date.now();
    this.ctx = null; this.page = null; this.cdp = null; this.w = 1100; this.h = 760; this.mirando = true;
    this.sucesos = []; this.n = { cortes: 0, limpiezas: 0, huella: 0, permisos: 0, cookies: 0, subastas: 0, bloqueos: 0 };
    this.empresas = new Map(); this.paises = new Map(); this.porque = {}; this.cookiesVistas = new Set(); this.webActual = '';
    this.destruida = false; this.operaciones = [];
    this.senuelos = new Senuelos('http://127.0.0.1:' + PUERTO); SESIONES.set(this.senuelos.token, this);
    this.alerta = 0; this.puntos = 0; this.motivos = []; this.sellada = false; this.ultimos = [];
    ws.on('message', (m, bin) => { if (!bin) this.mensaje(m).catch(() => {}); });
    ws.on('close', () => this.destruye('conexión cerrada'));
  }

  env(o) { this.ws.json(o); }

  async abre(w, h) {
    this.w = Math.max(320, Math.min(1920, w | 0 || 1100)); this.h = Math.max(240, Math.min(1200, h | 0 || 760));
    this.ctx = await navegador.newContext({
      viewport: { width: this.w, height: this.h }, deviceScaleFactor: 1, locale: 'es-ES', timezoneId: 'UTC', permissions: [],
      acceptDownloads: true, serviceWorkers: 'block', extraHTTPHeaders: { 'Sec-GPC': '1', DNT: '1' }, colorScheme: 'light',
    });
    this.op('celda creada');
    await this.ctx.exposeBinding('__zeroSuceso', (src, json) => this.sucesoPagina(src, json));
    await this.ctx.addInitScript(SENSORES);
    await this.ctx.addInitScript(this.senuelos.initScript());
    this.op('señuelos plantados: texto escondido, cookie propia, almacén local, enlace oculto');
    await this.ctx.route('**/*', (route, req) => this.filtra(route, req));
    this.ctx.on('page', (p) => { if (this.page && p !== this.page) { this.suceso({ clase: 'popup', certeza: 'comprobado', texto: 'La web intentó abrir una ventana nueva. ZERO la cerró.', dominio: hostDe(p.url()) }); p.close().catch(() => {}); } });
    this.page = await this.ctx.newPage();
    this.cdp = await this.ctx.newCDPSession(this.page);
    try { await this.cdp.send('Network.setCookieControls', { enableThirdPartyCookieRestriction: true, disableThirdPartyCookieMetadata: true, disableThirdPartyCookieHeuristics: true }); this.cookiesBloqueadas = true; } catch (_) { this.cookiesBloqueadas = false; }
    this.cdp.on('Page.screencastFrame', (f) => {
      if (this.ws.abierto) this.ws.send(Buffer.from(f.data, 'base64'));
      this.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    await this.arrancaPantalla();
    this.page.on('response', (r) => { this.respuestaNav(r); this.respuesta(r).catch(() => {}); });
    this.page.on('request', (r) => this.peticion(r));
    this.page.on('websocket', (w) => { const host = hostDe(w.url()); w.on('framesent', (f) => { try { const h = this.senuelos.busca(typeof f.payload === 'string' ? f.payload : f.payload.toString('latin1')); h.forEach((tipo) => this.senuelo({ tipo, donde: 'trama de WebSocket' }, host, w.url(), baseDominio(host) !== baseDominio(this.webActual), false)); } catch (_) {} }); });
    this.page.on('download', (d) => this.descarga(d));
    this.page.on('dialog', (d) => { this.suceso({ clase: 'dialogo', certeza: 'comprobado', texto: 'La web intentó mostrar un aviso emergente. ZERO lo cerró.', dominio: hostDe(this.page.url()) }); d.dismiss().catch(() => {}); });
    this.page.on('framenavigated', (f) => { if (f === this.page.mainFrame()) this.nav(); });
    this.page.on('load', () => this.nav(true));
    this.env({ t: 'lista', sesion: this.id, version: VERSION, listas: cortes.listas, cookiesBloqueadas: this.cookiesBloqueadas, w: this.w, h: this.h });
  }

  async arrancaPantalla() {
    try { await this.cdp.send('Page.startScreencast', { format: 'jpeg', quality: 72, maxWidth: this.w, maxHeight: this.h, everyNthFrame: 1 }); this.pantalla = true; } catch (_) {}
  }

  op(que) { this.operaciones.push([ahora(), que]); }

  tipoDe(req) {
    let f = null; try { f = req.frame(); } catch (_) {}
    if (req.isNavigationRequest()) {
      if (!f) return 'popup';
      if (f === this.page.mainFrame()) return 'document';
      return f.page() === this.page ? 'subdocument' : 'popup';
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
    if (tipo === 'popup') return route.abort('blockedbyclient').catch(() => {}); // las ventanas nuevas no se abren en la celda
    const principal = tipo === 'document';
    const origen = principal ? host : hostDe(this.page.url()) || host;
    const tercero = baseDominio(host) !== baseDominio(origen);
    let postData = null; try { postData = req.postData(); } catch (_) {}
    const fugas = this.senuelos.inspecciona({ url, postData, headers: req.headers(), tercero });
    if (fugas.length) { const dcheck = cortes.decide({ url, tipo, origen, host, tercero }); fugas.forEach((f) => this.senuelo(f, host, url, tercero, !!dcheck.bloquear || (this.nivel && this.nivel !== 'normal' && tercero && !esLocal(host)))); }
    if (principal) {
      this.webActual = host;
      // 1) web peligrosa conocida (listas de malware/phishing) → se detiene dentro de la celda
      const d = cortes.decide({ url, tipo: 'document', origen, host, tercero: false });
      if (d.bloquear && d.proposito === 'malware') {
        this.n.bloqueos++;
        this.suceso({ clase: 'bloqueo', certeza: 'comprobado', dominio: host, texto: 'Esta dirección figura en una lista pública de webs peligrosas. ZERO no la ha abierto.', detalle: { regla: d.regla, lista: d.lista } });
        return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: paginaBloqueo('Esta web está en una lista de webs peligrosas', 'ZERO ha detenido la apertura antes de cargar nada. La dirección coincide con una regla de una lista pública de malware o fraude; la lista puede equivocarse, pero no merece la pena arriesgarse.', host + ' · regla ' + d.regla + ' · ' + (cortes.listas[d.lista] || {}).nombre) }).catch(() => {});
      }
      // 2) limpiar la dirección de identificadores de seguimiento
      const lim = cortes.limpiaUrl(url, origen);
      if (lim.quitados.length) {
        this.n.limpiezas++;
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
    if (d.bloquear) {
      this.corte(host, tipo, origen, tercero, d);
      return route.abort('blockedbyclient').catch(() => {});
    }
    if (((this.nivel && this.nivel !== 'normal') || this.alerta >= 2) && tercero && !esLocal(host)) {
      this.corte(host, tipo, origen, tercero, { regla: this.alerta >= 2 && !(this.nivel && this.nivel !== 'normal') ? 'alerta: toda conexión con otra empresa' : 'nivel ' + this.nivel + ': toda conexión con otra empresa', lista: null, proposito: 'otra-empresa' });
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

  corte(host, tipo, origen, tercero, d) {
    this.n.cortes++;
    const e = empresas.atribuye(host);
    const prop = PROPOSITO[d.proposito] || 'Rastreador';
    this.porque[prop] = (this.porque[prop] || 0) + 1;
    const clave = e.empresa || host;
    const reg = this.empresas.get(clave) || { empresa: e.empresa, dominio: host, pais: e.pais, paisNombre: e.paisNombre, proposito: prop, n: 0, primera: ahora(), fuente: e.fuente, certeza: e.certeza };
    reg.n++; reg.ultima = ahora(); this.empresas.set(clave, reg);
    if (e.pais) this.paises.set(e.pais, (this.paises.get(e.pais) || 0) + 1);
    const quien = e.empresa ? e.empresa + (e.paisNombre ? ' (' + e.paisNombre + ')' : '') : host;
    const que = { Publicidad: 'una conexión publicitaria', Rastreador: 'una conexión con un rastreador conocido', 'Web peligrosa': 'una conexión con una web peligrosa conocida', 'Aviso de cookies': 'el aviso de cookies', 'Red local': 'una conexión hacia la red local', 'Otra empresa': 'una conexión con otra empresa' }[prop] || 'una conexión';
    this.suceso({ clase: 'corte', certeza: 'comprobado', dominio: host, empresa: e.empresa, pais: e.pais, paisNombre: e.paisNombre, proposito: prop, tipo, tercero,
      texto: 'ZERO ha cortado ' + que + (e.empresa ? ', de ' + quien : ' hacia ' + host) + '.',
      detalle: { regla: d.regla, lista: d.lista ? (cortes.listas[d.lista] || {}).nombre : null, listaClave: d.lista, fuenteEmpresa: e.fuente, categoria: e.categoria } });
  }

  sucesoPagina(src, json) {
    let s; try { s = JSON.parse(json); } catch (_) { return; }
    const dominio = hostDe(s.origen || '') || this.webActual;
    if (s.clase === 'huella') {
      this.n.huella++;
      const via = { canvas: 'el lienzo gráfico (canvas)', webgl: 'la tarjeta gráfica (WebGL)', audio: 'el sistema de audio', fuentes: 'los tipos de letra instalados', plugins: 'los complementos del navegador' }[s.via] || s.via;
      this.porque['Huella digital'] = (this.porque['Huella digital'] || 0) + 1;
      return this.suceso({ clase: 'huella', certeza: 'probable', dominio, texto: 'Un programa de ' + dominio + ' ha consultado ' + via + ', un dato que sirve para reconocer un equipo. En ZERO ve la celda remota, no tu ordenador.', detalle: { via: s.via } });
    }
    if (s.clase === 'permiso') { this.n.permisos++; return this.suceso({ clase: 'permiso', certeza: 'comprobado', dominio, texto: 'La web ha pedido acceso a ' + s.que + '. ZERO lo ha denegado: en la celda remota no hay nada tuyo.', detalle: { que: s.que } }); }
    if (s.clase === 'webrtc') { this.n.permisos++; return this.suceso({ clase: 'webrtc', certeza: 'comprobado', dominio, texto: 'La web ha intentado abrir una conexión directa (WebRTC), la vía habitual para averiguar la dirección de red real. ZERO la mantiene desactivada.' }); }
    if (s.clase === 'formulario') return this.suceso({ clase: 'formulario', certeza: 'comprobado', dominio, texto: s.detenido ? 'Este formulario enviaría tus datos sin cifrar. ZERO ha detenido el envío.' : 'Atención: este formulario enviaría lo que escribas sin cifrar.', detalle: { accion: s.accion, detenido: s.detenido } });
    if (s.clase === 'subasta') {
      this.n.subastas++;
      if (s.fase === 'fin') {
        const pujas = (s.pujas || []).map((p) => ({ ...p, ...empresaDe(p.pujador) }));
        const n = new Set([...(s.pedidos || []), ...pujas.map((p) => p.pujador)]).size;
        return this.suceso({ clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Esta página ha subastado tu atención: ' + n + (n === 1 ? ' empresa pujó' : ' empresas pujaron') + ' por ' + (s.unidades || 1) + (s.unidades === 1 ? ' hueco' : ' huecos') + ' de anuncio en ' + (s.ms != null ? s.ms + ' ms' : 'milisegundos') + '. Los precios son los que declara cada pujador.', detalle: { id: s.id, ms: s.ms, unidades: s.unidades, pedidos: s.pedidos, pujas, sinPuja: s.sinPuja } });
      }
      if (s.fase === 'ganada') return this.suceso({ clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Ganó la puja ' + s.pujador + (s.cpm != null ? ' declarando ' + s.cpm + ' ' + (s.moneda || '') + ' por mil impresiones' : '') + (s.anunciante ? ' para el anunciante ' + s.anunciante : '') + '.', detalle: { ...s, ...empresaDe(s.pujador) } });
      return this.suceso({ clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Hueco de anuncio servido por Google' + (s.vacio ? ' (vacío)' : '') + (s.anunciante ? ' · anunciante nº ' + s.anunciante : '') + '.', detalle: s });
    }
  }

  async respuesta(r) {
    try {
      const req = r.request(); const host = hostDe(r.url()); const origen = hostDe(this.page.url());
      if (!origen || baseDominio(host) === baseDominio(origen)) return;
      const sc = (await r.allHeaders())['set-cookie'];
      if (!sc) return;
      const clave = baseDominio(host);
      if (this.cookiesVistas.has(clave)) return;
      this.cookiesVistas.add(clave); this.n.cookies++;
      const e = empresas.atribuye(host);
      this.suceso({ clase: 'cookie', certeza: this.cookiesBloqueadas ? 'comprobado' : 'probable', dominio: host, empresa: e.empresa, pais: e.pais, paisNombre: e.paisNombre,
        texto: (e.empresa ? e.empresa : host) + ' intentó dejar una cookie de otra empresa para reconocerte en más webs. ' + (this.cookiesBloqueadas ? 'ZERO la ha rechazado.' : 'ZERO la borra al cerrar la sesión.'), detalle: { tipo: req.resourceType() } });
    } catch (_) {}
  }

  peticion(req) { /* las cadenas de redirección se miran al llegar la respuesta final (respuestaNav) */ }

  respuestaNav(r) {
    try {
      const req = r.request();
      if (!req.isNavigationRequest() || req.frame() !== this.page.mainFrame()) return;
      const st = r.status(); if (st >= 300 && st < 400) return;
      const cadena = []; let q = req.redirectedFrom();
      while (q) { cadena.unshift(hostDe(q.url())); q = q.redirectedFrom(); }
      if (cadena.length >= 2) {
        const inter = [...new Set(cadena)];
        this.suceso({ clase: 'redireccion', certeza: 'comprobado', dominio: hostDe(req.url()), texto: 'Antes de llegar a ' + hostDe(req.url()) + ', el enlace dio ' + cadena.length + ' saltos (' + inter.join(' → ') + '). Algunos saltos así sirven para anotar tu clic.', detalle: { cadena } });
      }
    } catch (_) {}
  }

  async descarga(d) {
    const nombre = d.suggestedFilename();
    this.suceso({ clase: 'descarga', certeza: 'comprobado', dominio: hostDe(d.url()), texto: 'La web ha iniciado la descarga de «' + nombre + '». ZERO la ha retenido en la celda: no ha tocado tu ordenador.', detalle: { nombre } });
    try { await d.cancel(); } catch (_) {}
    this.op('descarga retenida y descartada: ' + nombre);
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
      try { await this.cdp.send('Emulation.setScriptExecutionDisabled', { value: true }); } catch (_) {}
    }
    if (nivel < 3 && this.sellada) {
      this.sellada = false;
      try { await this.ctx.setOffline(false); } catch (_) {}
      try { await this.cdp.send('Emulation.setScriptExecutionDisabled', { value: this.nivel === 'maximo' }); } catch (_) {}
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
      const u = this.page.url();
      this.env({ t: 'nav', url: u, host: hostDe(u), segura: u.startsWith('https:'), titulo: cargada ? undefined : undefined, cargada: !!cargada });
      if (cargada) this.page.title().then((tt) => this.env({ t: 'titulo', titulo: tt })).catch(() => {});
    } catch (_) {}
  }

  async ve(url) {
    if (!/^[a-z]+:\/\//i.test(url)) url = 'https://' + url;
    if (this.sellada) return; // sellada: primero reanudar o destruir
    this.puntos = 0; this.motivos = []; this.ultimos = []; if (this.alerta > 0 && this.alerta < 3) await this.ponAlerta(0, 'nueva web');
    // nueva web: nuevo contador «en esta web» (los totales de la sesión se conservan)
    this.n = { cortes: 0, limpiezas: 0, huella: 0, permisos: 0, cookies: 0, subastas: 0, bloqueos: 0 }; this.empresas = new Map(); this.paises = new Map(); this.porque = {}; this.cookiesVistas = new Set();
    this.env({ t: 'resumen', cortes: 0, empresas: 0, paises: 0, porque: {}, n: this.n, web: hostDe(url) });
    try {
      await this.page.goto(url, { waitUntil: 'commit', timeout: 30000 });
    } catch (e) {
      const m = String(e.message || e);
      const cert = /ERR_CERT|SSL|certificate/i.test(m);
      const motivo = /ERR_CERT_DATE_INVALID/.test(m) ? 'certificado caducado o con fecha no válida' : /ERR_CERT_COMMON_NAME_INVALID/.test(m) ? 'el certificado no coincide con el nombre de la web' : /ERR_CERT_AUTHORITY_INVALID/.test(m) ? 'el certificado no está firmado por una autoridad reconocida' : cert ? 'no se pudo verificar el certificado' : /ERR_NAME_NOT_RESOLVED/.test(m) ? 'la dirección no existe' : /ERR_CONNECTION|ERR_TIMED_OUT|ERR_INTERNET|ERR_TUNNEL|ERR_PROXY/.test(m) ? 'no se pudo conectar' : 'no se pudo abrir';
      if (cert) this.suceso({ clase: 'certificado', certeza: 'comprobado', dominio: hostDe(url), texto: 'No se ha podido comprobar la identidad cifrada de ' + hostDe(url) + ' (' + motivo + '). ZERO no ha abierto la conexión.', detalle: { error: m.split('\n')[0] } });
      await this.page.setContent(paginaBloqueo(cert ? 'La identidad de esta web no se pudo comprobar' : 'No se pudo abrir esta web', cert ? 'Su certificado de seguridad no supera la comprobación: ' + motivo + '. Puede ser un fallo técnico de la web o una suplantación; ZERO no ha enviado ni recibido nada.' : 'Motivo: ' + motivo + '. ZERO no ha enviado nada.', hostDe(url) + ' · ' + m.split('\n')[0].slice(0, 120))).catch(() => {});
    }
  }

  async mensaje(m) {
    let o; try { o = JSON.parse(m); } catch (_) { return; }
    try {
      if (o.t === 'hola') return await this.abre(o.w, o.h);
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
      if (o.t === 'texto') return await this.page.keyboard.insertText(String(o.s || ''));
      if (o.t === 'atras') return this.page.goBack({ waitUntil: 'commit' }).catch(() => {});
      if (o.t === 'adelante') return this.page.goForward({ waitUntil: 'commit' }).catch(() => {});
      if (o.t === 'recargar') return this.page.reload({ waitUntil: 'commit' }).catch(() => {});
      if (o.t === 'tam') {
        this.w = Math.max(320, Math.min(1920, o.w | 0)); this.h = Math.max(240, Math.min(1200, o.h | 0));
        await this.page.setViewportSize({ width: this.w, height: this.h });
        await this.cdp.send('Page.stopScreencast').catch(() => {});
        return await this.arrancaPantalla();
      }
      if (o.t === 'mira') {
        // cuando nadie mira, la pantalla deja de transmitirse (uso de todo el mes sin gastar en vacío)
        this.mirando = !!o.si;
        if (!this.mirando && this.pantalla) { this.pantalla = false; await this.cdp.send('Page.stopScreencast').catch(() => {}); this.op('pantalla dormida'); }
        else if (this.mirando && !this.pantalla) { await this.arrancaPantalla(); this.op('pantalla despierta'); }
        return;
      }
      if (o.t === 'modo') { if ('observatorio' in o) { this.observatorio = !!o.observatorio; this.op('modo observatorio ' + (this.observatorio ? 'activado' : 'desactivado')); } if (o.nivel) await this.ponNivel(o.nivel); return; }
      if (o.t === 'destruir') return await this.destruye('a petición de la persona');
      if (o.t === 'alerta') { if (o.accion === 'sellar') return await this.ponAlerta(3, 'a petición de la persona'); if (o.accion === 'reanudar') { this.puntos = 0; this.motivos = []; return await this.ponAlerta(0, 'reanudada por la persona'); } return; }
    } catch (e) { /* una orden que falla no tumba la sesión */ }
  }

  async ponNivel(n) {
    if (!['normal', 'estricto', 'maximo'].includes(n)) return;
    const antes = this.nivel || 'normal'; this.nivel = n; this.op('nivel de protección: ' + n);
    const sinJs = n === 'maximo';
    if (sinJs !== (antes === 'maximo')) { try { await this.cdp.send('Emulation.setScriptExecutionDisabled', { value: sinJs }); } catch (_) {} if (this.page.url() && this.page.url() !== 'about:blank') this.page.reload({ waitUntil: 'commit' }).catch(() => {}); }
    this.suceso({ clase: 'nivel', certeza: 'comprobado', dominio: this.webActual, texto: n === 'normal' ? 'Nivel normal: ZERO corta la publicidad y el rastreo de las listas públicas.' : n === 'estricto' ? 'Nivel estricto: además, ZERO corta toda conexión con otras empresas; solo pasa lo propio de la web.' : 'Nivel máximo: además, la web corre sin programas (JavaScript).' });
  }

  // Una marca que solo existe en la celda ha salido (o ha intentado salir) hacia alguien. Se afirma solo lo visto.
  senuelo(f, host, url, tercero, cortada) {
    const clave = f.tipo + '|' + f.donde + '|' + host;
    if (this.senuelos.alertas.some((a) => a.clave === clave)) return;
    this.senuelos.apunta({ clave, tipo: f.tipo, donde: f.donde, host, url: String(url).slice(0, 300), tercero, cortada, hora: ahora() });
    const e = empresas.atribuye(host);
    const que = Senuelos.nombre(f.tipo);
    const texto = f.tipo === 'enlace'
      ? 'Alguien ha visitado el enlace oculto que ZERO puso como señuelo en la página (desde ' + host + '; ' + f.donde + '). Solo un programa que lea la página entera y siga sus enlaces llega a él: un indexador, un previsualizador o un rastreador.'
      : tercero
      ? 'Un dato que solo existe en tu celda (' + que + ', puesto por ZERO como señuelo) ' + (cortada ? 'iba a salir' : 'ha salido') + ' hacia ' + (e.empresa ? e.empresa + ' (' + host + ')' : host) + ' en ' + f.donde + '. Algo en esta web lo leyó y lo envió' + (cortada ? '; ZERO cortó esa conexión.' : '.')
      : 'La propia web se ha enviado un dato que solo existe en tu celda (' + que + ', puesto por ZERO como señuelo) en ' + f.donde + ': copia el contenido de la página o sus cookies hacia sus servidores.';
    this.n.senuelos = (this.n.senuelos || 0) + 1;
    this.suceso({ clase: 'señuelo', certeza: 'comprobado', dominio: host, empresa: e.empresa || null, paisNombre: e.paisNombre || null, texto, detalle: { tipo: f.tipo, que, donde: f.donde, tercero, cortada, url: String(url).slice(0, 200) } });
  }

  async destruye(motivo) {
    if (this.destruida) return;
    this.destruida = true;
    SESIONES.delete(this.senuelos.token);
    const t0 = Date.now();
    this.op('cierre pedido: ' + motivo);
    try { if (this.cdp) await this.cdp.send('Page.stopScreencast').catch(() => {}); } catch (_) {}
    try { if (this.ctx) await this.ctx.close(); this.op('celda cerrada: cookies, caché, almacenamiento y pestañas de la sesión eliminados con el contexto'); } catch (_) { this.op('celda cerrada con error'); }
    const acta = { sesion: this.id, version: VERSION, inicio: new Date(this.creada).toISOString(), fin: ahora(), motivo, duracion_s: Math.round((Date.now() - this.creada) / 1000), cierre_ms: Date.now() - t0,
      operaciones: this.operaciones, sucesos: this.sucesos.length, cortes: this.sucesos.filter((s) => s.clase === 'corte').length, senuelos: this.senuelos.alertas.length, alerta_final: this.alerta,
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
      if (ses && !ses.destruida) ses.senuelo({ tipo: 'enlace', donde: 'visita al enlace oculto (' + (req.headers['user-agent'] || 'sin agente').slice(0, 80) + ')' }, req.socket.remoteAddress || '?', req.url, true, false);
      res.writeHead(204); return res.end();
    }
    if (req.url === '/salud') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify({ ok: true, version: VERSION, listas: nListas, mock: MOCK })); }
    res.writeHead(404); res.end();
  });
  srv.on('upgrade', (req, socket) => {
    if (!req.url.startsWith('/sesion')) return socket.destroy();
    const ws = WS.acepta(req, socket);
    if (ws) new Sesion(ws);
  });
  srv.listen(PUERTO, '127.0.0.1', () => console.log('ZERO motor', VERSION, 'en ws://127.0.0.1:' + PUERTO + '/sesion ·', nListas.reglas, 'reglas ·', MOCK ? 'simulacro de terceros activo' : 'internet real'));
  process.on('SIGINT', async () => { try { await navegador.close(); } catch (_) {} process.exit(0); });
}

main().catch((e) => { console.error(e); process.exit(1); });
