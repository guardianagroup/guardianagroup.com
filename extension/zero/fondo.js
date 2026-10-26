// GUARDIANA ZERO · motor dentro del navegador (26 Oct 2026, ronda 47).
// La web la abre el propio navegador de la persona, desde su conexión. ZERO observa cada conexión (webRequest, solo
// lectura), la clasifica con las mismas listas y la misma base de empresas que el motor de la celda, y lo enseña en el
// panel lateral. No corta nada por su cuenta: en «Observar» (por defecto) solo mira; la persona elige qué cortar
// (por empresa) o sube el nivel (Normal: listas públicas; Estricto: toda otra empresa). Los cortes los aplica el
// navegador con reglas declarativas (declarativeNetRequest). Nada sale del equipo: ni historial, ni búsquedas, ni datos.
import { Cortes } from './motor/cortes.js';
import { Empresas, baseDominio } from './motor/empresas.js';

const TIPO = { main_frame: 'document', sub_frame: 'subdocument', stylesheet: 'stylesheet', script: 'script', image: 'image', font: 'font', object: 'object', xmlhttprequest: 'xmlhttprequest', ping: 'ping', csp_report: 'csp_report', media: 'media', websocket: 'websocket', webtransport: 'other', webbundle: 'other', other: 'other' };
const PROPOSITO = { publicidad: 'Publicidad', rastreo: 'Rastreador', malware: 'Web peligrosa', 'avisos-cookies': 'Aviso de cookies', 'red-local': 'Red local', excepciones: '', parametros: 'Seguimiento', 'otra-empresa': 'Otra empresa' };
const QUE = { script: 'un programa', image: 'una imagen', stylesheet: 'una hoja de estilo', font: 'un tipo de letra', xmlhttprequest: 'una petición de datos', subdocument: 'un marco incrustado', ping: 'una baliza', websocket: 'una conexión abierta', media: 'un vídeo o audio', other: 'una conexión' };
const hostDe = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch (_) { return ''; } };
const ahora = () => new Date().toISOString();

let cortes = null, empresas = null, preparando = null;
const T = new Map(); // tabId → estado
let nivel = 'observar';
let permitidas = new Set(), cortadas = new Set(); // claves 'e:<empresa>' o dominio base, decididas por la persona
const pendientes = [];

async function json(ruta) { return (await fetch(chrome.runtime.getURL(ruta))).json(); }
async function texto(ruta) { return (await fetch(chrome.runtime.getURL(ruta))).text(); }

function prepara() {
  if (preparando) return preparando;
  preparando = (async () => {
    const c = new Cortes();
    const reg = await json('listas/fuentes.json');
    for (const [clave, f] of Object.entries(reg.listas)) {
      try { c.cargaTexto(await texto('listas/' + f.archivo), clave, f.proposito); c.listas[clave] = { nombre: f.nombre, licencia: f.licencia, proposito: f.proposito, url: f.url }; } catch (_) {}
    }
    c.aplicaBadfilter();
    const [espejo, fichas, agencia] = await Promise.all([json('datos/espejo.json').catch(() => ({})), json('datos/empresas.json').catch(() => ({})), json('datos/dominios-agencia.json').catch(() => ({}))]);
    empresas = new Empresas({ espejo, fichas, agencia });
    cortes = c;
    const g = await chrome.storage.local.get(['nivel', 'permitidas', 'cortadas']);
    nivel = ['observar', 'normal', 'estricto'].includes(g.nivel) ? g.nivel : 'observar';
    permitidas = new Set(Array.isArray(g.permitidas) ? g.permitidas : []);
    cortadas = new Set(Array.isArray(g.cortadas) ? g.cortadas : []);
    await aplicaNivel(); await aplicaReglasEmpresas();
    while (pendientes.length) clasificaPeticion(pendientes.shift());
  })();
  return preparando;
}

function estadoNuevo(host, url) {
  return { host: host || '', url: url || '', desde: ahora(), n: { vistos: 0, cortes: 0, huella: 0, permisos: 0, subastas: 0, cookies: 0 }, porque: {}, empresas: new Map(), sucesos: [], paises: new Set(), reqs: new Map() };
}
function estadoDe(tabId) { if (!T.has(tabId)) T.set(tabId, estadoNuevo()); return T.get(tabId); }

function suceso(st, s) { s.hora = ahora(); st.sucesos.push(s); if (st.sucesos.length > 300) st.sucesos.splice(0, st.sucesos.length - 300); avisaPanel(); }

let avisoPendiente = false;
function avisaPanel() { if (avisoPendiente) return; avisoPendiente = true; setTimeout(() => { avisoPendiente = false; chrome.runtime.sendMessage({ t: 'cambio' }).catch(() => {}); }, 150); }

function claveDe(host, e) { return e && e.empresa ? 'e:' + e.empresa : baseDominio(host); }

function registra(st, host, tipo, origen, tercero, d, estado) {
  const e = empresas.atribuye(host);
  const clave = claveDe(host, e);
  const prop = PROPOSITO[d.proposito] || 'Rastreador';
  const reg = st.empresas.get(clave) || { clave, empresa: e.empresa || host, esEmpresa: !!e.empresa, pais: e.pais, paisNombre: e.paisNombre || 'País no identificado', fuente: e.fuente, motivo: prop, n: 0, vistos: 0, cortados: 0, dominios: new Set(), primera: ahora(), ultima: '' };
  reg.n++; reg.ultima = ahora(); reg.dominios.add(host); if (estado === 'cortado') reg.cortados++; else reg.vistos++;
  st.empresas.set(clave, reg);
  if (e.pais) st.paises.add(e.pais);
  if (estado === 'cortado') st.n.cortes++; else st.n.vistos++;
  st.porque[prop] = (st.porque[prop] || 0) + 1;
  const que = QUE[tipo] || 'una conexión', quien = (e.empresa ? e.empresa + ' (' + host + ')' : host);
  suceso(st, { clase: 'corte', estado, certeza: 'comprobado', dominio: host, empresa: e.empresa, pais: e.pais, paisNombre: e.paisNombre, proposito: prop, tipo, tercero, regla: d.regla, lista: d.lista,
    texto: (estado === 'cortado' ? 'Cortado ' : estado === 'permitido' ? 'Dejado pasar (lo permitiste) ' : 'Visto ') + que + (e.empresa ? ', de ' + quien : ' hacia ' + host) + '.' });
}

function clasificaPeticion(d) {
  try {
    const st = estadoDe(d.tabId);
    const url = d.url, host = hostDe(url), tipo = TIPO[d.type] || 'other';
    const origen = st.host || hostDe(d.initiator || d.documentUrl || '') || host;
    const tercero = baseDominio(host) !== baseDominio(origen);
    const dec = cortes.decide({ url, tipo, origen, host, tercero });
    const e = empresas.atribuye(host);
    const clave = claveDe(host, e);
    // qué habría pasado y qué pasará: la evidencia del corte llega en onErrorOccurred (ERR_BLOCKED_BY_CLIENT)
    st.reqs.set(d.requestId, { host, tipo, origen, tercero, dec, t: Date.now() });
    if (st.reqs.size > 2000) { const k = st.reqs.keys().next().value; st.reqs.delete(k); }
    if (dec.bloquear) {
      const permitida = permitidas.has(clave) || permitidas.has(baseDominio(host));
      registra(st, host, tipo, origen, tercero, dec, permitida ? 'permitido' : 'visto');
    } else if (tercero && (cortadas.has(clave) || cortadas.has(baseDominio(host)))) {
      registra(st, host, tipo, origen, tercero, { proposito: 'otra-empresa', regla: 'cortada por ti', lista: 'persona' }, 'visto');
    } else if (tercero && nivel === 'estricto') {
      registra(st, host, tipo, origen, tercero, { proposito: 'otra-empresa', regla: 'nivel estricto: toda conexión con otra empresa', lista: 'nivel' }, 'visto');
    }
  } catch (_) {}
}

chrome.webRequest.onBeforeRequest.addListener((d) => {
  if (d.tabId < 0 || !/^https?:/.test(d.url)) return;
  if (d.type === 'main_frame') { const h = hostDe(d.url); const st = estadoNuevo(h, d.url); T.set(d.tabId, st); avisaPanel(); return; }
  if (!cortes) { pendientes.push(d); if (pendientes.length > 3000) pendientes.shift(); prepara(); return; }
  clasificaPeticion(d);
}, { urls: ['<all_urls>'] });

// Evidencia del corte: el navegador no dejó salir la conexión (regla de ZERO o de otra extensión).
chrome.webRequest.onErrorOccurred.addListener((d) => {
  if (d.tabId < 0 || d.type === 'main_frame') return;
  const st = T.get(d.tabId); if (!st) return;
  const r = st.reqs.get(d.requestId); if (!r) return;
  if (d.error === 'net::ERR_BLOCKED_BY_CLIENT') {
    // el último suceso de ese host pasa de «visto» a «cortado»
    for (let i = st.sucesos.length - 1; i >= 0 && i > st.sucesos.length - 40; i--) {
      const s = st.sucesos[i];
      if (s.clase === 'corte' && s.dominio === r.host && s.estado === 'visto') { s.estado = 'cortado'; s.texto = s.texto.replace(/^Visto /, 'Cortado '); st.n.vistos--; st.n.cortes++; const e = empresas.atribuye(r.host); const reg = st.empresas.get(claveDe(r.host, e)); if (reg) { reg.vistos--; reg.cortados++; } break; }
    }
    avisaPanel();
  }
}, { urls: ['<all_urls>'] });

// Cookies de otras empresas (solo se mira si hay Set-Cookie de un dominio ajeno; no se guarda el valor)
try {
  chrome.webRequest.onHeadersReceived.addListener((d) => {
    if (d.tabId < 0 || d.type === 'main_frame') return;
    const st = T.get(d.tabId); if (!st || !st.host) return;
    const host = hostDe(d.url); if (baseDominio(host) === baseDominio(st.host)) return;
    if (!(d.responseHeaders || []).some((h) => h.name.toLowerCase() === 'set-cookie')) return;
    const clave = baseDominio(host); st.cookiesVistas = st.cookiesVistas || new Set(); if (st.cookiesVistas.has(clave)) return; st.cookiesVistas.add(clave); st.n.cookies++;
    const e = empresas ? empresas.atribuye(host) : { empresa: null };
    suceso(st, { clase: 'cookie', certeza: 'comprobado', dominio: host, empresa: e.empresa, pais: e.pais, paisNombre: e.paisNombre, texto: (e.empresa || host) + ' intentó dejar una cookie de otra empresa para reconocerte en más webs.' });
  }, { urls: ['<all_urls>'] }, ['responseHeaders', 'extraHeaders']);
} catch (_) {}

chrome.tabs.onRemoved.addListener((id) => T.delete(id));
// La navegación principal también se anota aquí (si el motor despertó después de la primera petición)
chrome.webNavigation.onCommitted.addListener((d) => {
  if (d.frameId !== 0 || !/^https?:/.test(d.url)) return;
  const h = hostDe(d.url); const st = T.get(d.tabId);
  if (!st || (st.host && st.host !== h)) { T.set(d.tabId, estadoNuevo(h, d.url)); } else { st.host = h; st.url = d.url; }
  avisaPanel();
});

// ---- sensores (desde el mundo de la página, vía relevo.js) ----
function sucesoSensor(tabId, s, origen) {
  const st = estadoDe(tabId); const dominio = hostDe(origen || '') || st.host;
  if (s.clase === 'cursor') return;
  if (s.clase === 'huella') { st.n.huella++; const via = { canvas: 'el lienzo gráfico (canvas)', webgl: 'la tarjeta gráfica (WebGL)', audio: 'el sistema de audio', fuentes: 'los tipos de letra instalados', plugins: 'los complementos del navegador' }[s.via] || s.via; st.porque['Huella digital'] = (st.porque['Huella digital'] || 0) + 1; return suceso(st, { clase: 'huella', certeza: 'probable', dominio, texto: 'Un programa de ' + dominio + ' ha consultado ' + via + ', un dato que sirve para reconocer tu equipo.', detalle: { via: s.via } }); }
  if (s.clase === 'permiso') { st.n.permisos++; return suceso(st, { clase: 'permiso', certeza: 'comprobado', dominio, texto: 'La web ha pedido acceso a ' + s.que + '. Decide tú en el aviso del navegador.', detalle: { que: s.que } }); }
  if (s.clase === 'webrtc') { st.n.permisos++; return suceso(st, { clase: 'webrtc', certeza: 'comprobado', dominio, texto: 'La web ha intentado abrir una conexión directa (WebRTC), la vía habitual para averiguar la dirección de red real.' }); }
  if (s.clase === 'formulario') return suceso(st, { clase: 'formulario', certeza: 'comprobado', dominio, texto: 'Atención: este formulario enviaría lo que escribas sin cifrar.', detalle: { accion: s.accion } });
  if (s.clase === 'subasta') {
    st.n.subastas++;
    if (s.fase === 'fin') { const n = new Set([...(s.pedidos || []), ...((s.pujas || []).map((p) => p.pujador))]).size; return suceso(st, { clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Esta página ha subastado tu atención: ' + n + (n === 1 ? ' empresa pujó' : ' empresas pujaron') + ' por ' + (s.unidades || 1) + (s.unidades === 1 ? ' hueco' : ' huecos') + ' de anuncio' + (s.ms != null ? ' en ' + s.ms + ' ms' : '') + '.', detalle: s }); }
    if (s.fase === 'ganada') return suceso(st, { clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Ganó la puja ' + s.pujador + (s.cpm != null ? ' declarando ' + s.cpm + ' ' + (s.moneda || '') + ' por mil impresiones' : '') + '.', detalle: s });
    return suceso(st, { clase: 'subasta', certeza: 'comprobado', dominio, texto: 'Hueco de anuncio servido por Google' + (s.vacio ? ' (vacío)' : '') + '.', detalle: s });
  }
}

// ---- cortes: reglas declarativas que aplica el navegador ----
const ID_ESTRICTO = 900001;
async function aplicaNivel() {
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: nivel === 'normal' || nivel === 'estricto' ? ['normal'] : [], disableRulesetIds: nivel === 'observar' ? ['normal'] : [] });
    const quitar = [ID_ESTRICTO];
    const poner = nivel === 'estricto' ? [{ id: ID_ESTRICTO, priority: 1, action: { type: 'block' }, condition: { domainType: 'thirdParty', excludedResourceTypes: ['main_frame'] } }] : [];
    await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: quitar, addRules: poner });
  } catch (e) { console.warn('nivel:', e); }
}
// Cada empresa permitida o cortada por la persona es una regla de sesión sobre sus dominios conocidos.
function dominiosDe(clave) {
  const out = new Set();
  if (clave.startsWith('e:')) { const emp = clave.slice(2); for (const st of T.values()) for (const r of st.empresas.values()) if (r.empresa === emp) r.dominios.forEach((d) => out.add(d)); if (empresas) for (const d of empresas.dominiosDe(emp)) out.add(d); }
  else out.add(clave);
  return [...out].map((d) => d.replace(/^www\./, ''));
}
async function aplicaReglasEmpresas() {
  try {
    const actuales = await chrome.declarativeNetRequest.getSessionRules();
    const quitar = actuales.map((r) => r.id).filter((id) => id >= 100000 && id < 900000);
    const poner = []; let id = 100000;
    for (const k of permitidas) { const ds = dominiosDe(k); if (ds.length) poner.push({ id: id++, priority: 3, action: { type: 'allow' }, condition: { requestDomains: ds.slice(0, 500) } }); }
    for (const k of cortadas) { const ds = dominiosDe(k); if (ds.length) poner.push({ id: id++, priority: 2, action: { type: 'block' }, condition: { requestDomains: ds.slice(0, 500), excludedResourceTypes: ['main_frame'] } }); }
    await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: quitar, addRules: poner });
  } catch (e) { console.warn('reglas empresas:', e); }
}

// ---- lo que pide el panel ----
function serializa(tabId) {
  const st = T.get(tabId) || estadoNuevo();
  const emps = [...st.empresas.values()].map((r) => ({ ...r, dominios: [...r.dominios].slice(0, 30), permitida: permitidas.has(r.clave), cortada: cortadas.has(r.clave) })).sort((a, b) => b.n - a.n);
  return { host: st.host, url: st.url, desde: st.desde, n: st.n, porque: st.porque, empresas: emps, paises: [...st.paises], sucesos: st.sucesos.slice(-120), nivel, listo: !!cortes, listas: cortes ? cortes.listas : {} };
}
chrome.runtime.onMessage.addListener((m, sender, responde) => {
  (async () => {
    if (m && m.t === 'sensor' && sender.tab) { let s; try { s = JSON.parse(m.json); } catch (_) { return responde(null); } if (!empresas) await prepara(); sucesoSensor(sender.tab.id, s, m.origen); return responde(true); }
    if (m && m.t === 'estado') { if (!cortes) prepara(); return responde(serializa(m.tabId)); }
    if (m && m.t === 'nivel') { if (['observar', 'normal', 'estricto'].includes(m.nivel)) { nivel = m.nivel; await chrome.storage.local.set({ nivel }); await aplicaNivel(); } return responde(nivel); }
    if (m && m.t === 'permitir') { const k = String(m.clave || '').slice(0, 200); if (!k) return responde(false); if (m.on) { permitidas.add(k); cortadas.delete(k); } else permitidas.delete(k); await chrome.storage.local.set({ permitidas: [...permitidas], cortadas: [...cortadas] }); await aplicaReglasEmpresas(); avisaPanel(); return responde(true); }
    if (m && m.t === 'cortar') { const k = String(m.clave || '').slice(0, 200); if (!k) return responde(false); if (m.on) { cortadas.add(k); permitidas.delete(k); } else cortadas.delete(k); await chrome.storage.local.set({ permitidas: [...permitidas], cortadas: [...cortadas] }); await aplicaReglasEmpresas(); avisaPanel(); return responde(true); }
    if (m && m.t === 'limpiar') { T.delete(m.tabId); return responde(true); }
    responde(null);
  })();
  return true;
});

chrome.runtime.onInstalled.addListener(() => { chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {}); prepara(); });
chrome.runtime.onStartup.addListener(() => prepara());
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
prepara();
