// ZERO · motor de cortes (26 Oct 2026, ronda 40).
// Lee listas en sintaxis Adblock Plus / uBlock Origin (EasyList, EasyPrivacy, uAssets) y decide, para cada petición
// que hace la web dentro de la celda remota, si se corta y por qué. Sin dependencias: índice por fichas (tokens) como
// hacen los bloqueadores de verdad, y expresiones regulares solo para confirmar.
//
// Lo que entiende: reglas de red («||dominio^», «|http…», subcadenas, comodines *, separador ^, anclas |, /regex/),
// excepciones «@@», opciones third-party/3p/1p, domain=, from=, to=, tipos de recurso (script, image, …), important,
// badfilter, removeparam=, denyallow=, match-case. Lo que no entiende se salta (nunca se corta por una regla que no se
// ha entendido). Las reglas cosméticas (##) no van aquí.
'use strict';
const fs = require('fs');
const path = require('path');

const TIPOS = new Set(['script', 'image', 'stylesheet', 'object', 'xmlhttprequest', 'subdocument', 'document', 'ping',
  'websocket', 'font', 'media', 'other', 'popup', 'webrtc', 'beacon', 'csp_report', 'manifest', 'texttrack', 'eventsource', 'prefetch', 'signedexchange', 'fetch', 'preflight']);
const ALIAS = { xhr: 'xmlhttprequest', frame: 'subdocument', doc: 'document', css: 'stylesheet', '3p': 'third-party', '1p': 'first-party', ghide: 'generichide', ehide: 'elemhide', shide: 'specifichide' };
// opciones que, si aparecen, hacen que la regla no se aplique en red (cosméticas o no soportadas)
const SALTAR = new Set(['elemhide', 'generichide', 'specifichide', 'genericblock', 'csp', 'redirect', 'redirect-rule', 'header', 'replace', 'urltransform', 'permissions', 'uritransform', 'cname', 'ipaddress', 'strict1p', 'strict3p', 'method', 'inline-script', 'inline-font', 'empty', 'mp4', 'object-subrequest', 'webrtc', 'ping', 'popunder']);

const tokensDe = (s) => s.toLowerCase().match(/[a-z0-9]{3,}/g) || [];

function escapaRegex(s) { return s.replace(/[.+?${}()[\]\\]/g, '\\$&'); }

function patronARegex(p, matchCase) {
  if (p.length > 1 && p[0] === '/' && p[p.length - 1] === '/') {
    try { return new RegExp(p.slice(1, -1), matchCase ? '' : 'i'); } catch (_) { return null; }
  }
  let ini = '', fin = '';
  if (p.startsWith('||')) { ini = '^[a-z][a-z0-9+.-]*://(?:[^/?#]*\\.)?'; p = p.slice(2); }
  else if (p.startsWith('|')) { ini = '^'; p = p.slice(1); }
  if (p.endsWith('|')) { fin = '$'; p = p.slice(0, -1); }
  let r = escapaRegex(p).replace(/\*/g, '.*').replace(/\^/g, '(?:[^\\w\\-.%]|$)');
  try { return new RegExp(ini + r + fin, matchCase ? '' : 'i'); } catch (_) { return null; }
}

// ficha (token) más útil de un patrón: la más larga que no toque un comodín
function fichaDe(p) {
  if (p.length > 1 && p[0] === '/' && p[p.length - 1] === '/') return null;
  let q = p.replace(/^\|\|/, '').replace(/^\|/, '').replace(/\|$/, '');
  const partes = q.split('*');
  let mejor = null;
  partes.forEach((parte, i) => {
    const ts = parte.toLowerCase().match(/[a-z0-9]{3,}/g) || [];
    ts.forEach((t, j) => {
      // una ficha pegada a un * (al principio del trozo que sigue a un * o al final del trozo que precede a un *) puede
      // estar cortada: no sirve de índice
      const alInicio = j === 0 && i > 0 && parte.toLowerCase().startsWith(t);
      const alFinal = j === ts.length - 1 && i < partes.length - 1 && parte.toLowerCase().endsWith(t);
      if (alInicio || alFinal) return;
      if (!mejor || t.length > mejor.length) mejor = t;
    });
  });
  return mejor;
}

function parseaDominios(v) {
  const si = [], no = [];
  for (const d of v.split('|')) {
    if (!d) continue;
    if (d[0] === '~') no.push(d.slice(1).toLowerCase()); else si.push(d.toLowerCase());
  }
  return { si, no };
}

const dominioEn = (host, lista) => lista.some((d) => host === d || host.endsWith('.' + d));

class Cortes {
  constructor() {
    this.indice = new Map();   // ficha -> [reglas]
    this.siempre = [];         // reglas sin ficha
    this.excIndice = new Map();
    this.excSiempre = [];
    this.badfilter = new Set();
    this.removeparam = [];     // {regex|null, params:Set|null (null = todos), dominios}
    this.n = { reglas: 0, excepciones: 0, saltadas: 0, removeparam: 0, cosmeticas: 0 };
    this.listas = {};
  }

  cargaCarpeta(carpeta) {
    const reg = JSON.parse(fs.readFileSync(path.join(carpeta, 'fuentes.json'), 'utf8'));
    for (const [clave, f] of Object.entries(reg.listas)) {
      const ruta = path.join(carpeta, f.archivo);
      if (!fs.existsSync(ruta)) continue;
      this.listas[clave] = { nombre: f.nombre, licencia: f.licencia, proposito: f.proposito, url: f.url, commit: (f.commit || '').slice(0, 10), fecha: f.fecha_commit };
      this.cargaTexto(fs.readFileSync(ruta, 'utf8'), clave, f.proposito);
    }
    // segunda pasada: quitar las reglas marcadas con $badfilter
    if (this.badfilter.size) {
      const quita = (arr) => arr.filter((r) => !this.badfilter.has(r.texto));
      for (const [k, v] of this.indice) this.indice.set(k, quita(v));
      for (const [k, v] of this.excIndice) this.excIndice.set(k, quita(v));
      this.siempre = quita(this.siempre); this.excSiempre = quita(this.excSiempre);
    }
    return this.n;
  }

  cargaTexto(texto, lista, proposito) {
    for (let linea of texto.split('\n')) {
      linea = linea.trim();
      if (!linea || linea[0] === '!' || linea[0] === '[' || linea.startsWith('# ')) continue;
      if (/#[@?$%]?#|\$\$/.test(linea) && !/^\/.*\/$/.test(linea)) { this.n.cosmeticas++; continue; }
      this.anade(linea, lista, proposito);
    }
  }

  anade(linea, lista, proposito) {
    let texto = linea, excepcion = false;
    if (texto.startsWith('@@')) { excepcion = true; texto = texto.slice(2); }
    let patron = texto, opciones = '';
    // las opciones van tras el último $ que no esté dentro de una regex /…/
    const esRegex = patron.length > 1 && patron[0] === '/' && patron.lastIndexOf('/') > 0;
    const iDolar = patron.lastIndexOf('$');
    if (iDolar >= 0 && (!esRegex || iDolar > patron.lastIndexOf('/'))) { opciones = patron.slice(iDolar + 1); patron = patron.slice(0, iDolar); }
    const r = { texto: linea, patron, lista, proposito, tipos: null, noTipos: null, tercero: null, dominios: null, destinos: null, important: false, matchCase: false, denyallow: null };
    let removeparam = null, badfilter = false, soloRemove = false;
    if (opciones) {
      for (let op of opciones.split(',')) {
        op = op.trim(); if (!op) continue;
        let neg = false; if (op[0] === '~') { neg = true; op = op.slice(1); }
        let [nombre, valor] = op.split(/=(.*)/s);
        nombre = nombre.toLowerCase(); nombre = ALIAS[nombre] || nombre;
        if (nombre === 'third-party') { r.tercero = !neg; continue; }
        if (nombre === 'first-party') { r.tercero = neg; continue; }
        if (nombre === 'domain' || nombre === 'from') { r.dominios = parseaDominios(valor || ''); continue; }
        if (nombre === 'to') { r.destinos = parseaDominios(valor || ''); continue; }
        if (nombre === 'important') { r.important = true; continue; }
        if (nombre === 'match-case') { r.matchCase = true; continue; }
        if (nombre === 'badfilter') { badfilter = true; continue; }
        if (nombre === 'denyallow') { r.denyallow = parseaDominios(valor || '').si; continue; }
        if (nombre === 'removeparam' || nombre === 'queryprune') { removeparam = valor === undefined ? '' : valor; soloRemove = true; continue; }
        if (nombre === 'all') { r.tipos = null; continue; }
        if (nombre === 'document' && !neg) { r.tipos = r.tipos || new Set(); r.tipos.add('document'); continue; }
        if (TIPOS.has(nombre)) {
          if (neg) { r.noTipos = r.noTipos || new Set(); r.noTipos.add(nombre); }
          else { r.tipos = r.tipos || new Set(); r.tipos.add(nombre); }
          continue;
        }
        this.n.saltadas++; return; // opción cosmética o no soportada: la regla no se aplica
      }
    }
    if (badfilter) { this.badfilter.add(linea.replace(/\$badfilter$|,badfilter/, '')); return; }
    const regex = patron && patron !== '*' ? patronARegex(patron, r.matchCase) : null;
    if (patron && patron !== '*' && !regex) { this.n.saltadas++; return; }
    r.regex = regex;
    if (soloRemove) {
      if (excepcion) return; // excepciones de removeparam: fuera por ahora
      let params = null;
      if (removeparam) {
        if (removeparam[0] === '~' || removeparam[0] === '/') { this.n.saltadas++; return; } // negaciones y regex: no
        params = new Set([removeparam]);
      }
      this.removeparam.push({ regex, params, dominios: r.dominios, lista });
      this.n.removeparam++;
      return;
    }
    const ficha = patron ? fichaDe(patron) : null;
    const mapa = excepcion ? this.excIndice : this.indice;
    const resto = excepcion ? this.excSiempre : this.siempre;
    if (ficha) { if (!mapa.has(ficha)) mapa.set(ficha, []); mapa.get(ficha).push(r); } else resto.push(r);
    if (excepcion) this.n.excepciones++; else this.n.reglas++;
  }

  // ¿Coincide la regla con la petición?
  static aplica(r, q) {
    if (r.regex && !r.regex.test(q.url)) return false;
    if (r.tercero !== null && r.tercero !== q.tercero) return false;
    if (r.tipos && !r.tipos.has(q.tipo)) return false;
    if (r.noTipos && r.noTipos.has(q.tipo)) return false;
    if (r.dominios) {
      if (r.dominios.si.length && !dominioEn(q.origen, r.dominios.si)) return false;
      if (r.dominios.no.length && dominioEn(q.origen, r.dominios.no)) return false;
    }
    if (r.destinos) {
      if (r.destinos.si.length && !dominioEn(q.host, r.destinos.si)) return false;
      if (r.destinos.no.length && dominioEn(q.host, r.destinos.no)) return false;
    }
    if (r.denyallow && dominioEn(q.host, r.denyallow)) return false;
    return true;
  }

  candidatas(mapa, resto, fichas) {
    const out = [];
    const vistas = new Set();
    for (const f of fichas) {
      const rs = mapa.get(f);
      if (!rs) continue;
      for (const r of rs) if (!vistas.has(r)) { vistas.add(r); out.push(r); }
    }
    for (const r of resto) out.push(r);
    return out;
  }

  /** q = { url, tipo, origen (host del documento principal), host (host de la petición), tercero (bool) } */
  decide(q) {
    const fichas = tokensDe(q.url);
    let bloquea = null;
    for (const r of this.candidatas(this.indice, this.siempre, fichas)) {
      if (!Cortes.aplica(r, q)) continue;
      if (r.important) { bloquea = r; break; }
      if (!bloquea) bloquea = r;
    }
    if (!bloquea) return { bloquear: false };
    if (!bloquea.important) {
      for (const e of this.candidatas(this.excIndice, this.excSiempre, fichas)) {
        if (Cortes.aplica(e, q)) return { bloquear: false, excepcion: e.texto, lista: e.lista };
      }
    }
    return { bloquear: true, regla: bloquea.texto, lista: bloquea.lista, proposito: bloquea.proposito };
  }

  /** Quita de una URL de navegación los parámetros de seguimiento. Devuelve { url, quitados: [...] } */
  limpiaUrl(url, origen) {
    let u; try { u = new URL(url); } catch (_) { return { url, quitados: [] }; }
    if (!u.search) return { url, quitados: [] };
    const q = { url, tipo: 'document', origen: origen || u.hostname, host: u.hostname, tercero: false };
    const quitados = [];
    for (const r of this.removeparam) {
      if (r.regex && !r.regex.test(url)) continue;
      if (r.dominios) {
        if (r.dominios.si.length && !dominioEn(q.origen, r.dominios.si) && !dominioEn(u.hostname, r.dominios.si)) continue;
        if (r.dominios.no.length && dominioEn(q.origen, r.dominios.no)) continue;
      }
      if (!r.params) { for (const k of [...u.searchParams.keys()]) { quitados.push(k); u.searchParams.delete(k); } continue; }
      for (const p of r.params) if (u.searchParams.has(p)) { quitados.push(p); u.searchParams.delete(p); }
    }
    if (!quitados.length) return { url, quitados };
    let s = u.toString();
    if (s.endsWith('?')) s = s.slice(0, -1);
    return { url: s, quitados };
  }
}

module.exports = { Cortes };

if (require.main === module) {
  const t0 = Date.now();
  const c = new Cortes();
  const n = c.cargaCarpeta(path.join(__dirname, 'listas'));
  console.log('cargadas en', Date.now() - t0, 'ms', n, 'fichas', c.indice.size, 'sin ficha', c.siempre.length, 'exc sin ficha', c.excSiempre.length);
  const pruebas = [
    ['https://www.google-analytics.com/analytics.js', 'script', 'elpais.com'],
    ['https://securepubads.g.doubleclick.net/tag/js/gpt.js', 'script', 'elpais.com'],
    ['https://connect.facebook.net/en_US/fbevents.js', 'script', 'elpais.com'],
    ['https://static.criteo.net/js/ld/publishertag.js', 'script', 'marca.com'],
    ['https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js', 'script', 'ejemplo.com'],
    ['https://elpais.com/estaticos/js/app.js', 'script', 'elpais.com'],
    ['https://www.youtube.com/embed/abc', 'subdocument', 'ejemplo.com'],
    ['https://ib.adnxs.com/ut/v3/prebid', 'xmlhttprequest', 'marca.com'],
    ['https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', 'script', 'ejemplo.com'],
    ['https://script.hotjar.com/modules.js', 'script', 'ejemplo.com'],
  ];
  for (const [url, tipo, origen] of pruebas) {
    const host = new URL(url).hostname;
    const t1 = process.hrtime.bigint();
    const d = c.decide({ url, tipo, origen, host, tercero: !host.endsWith(origen) });
    const us = Number(process.hrtime.bigint() - t1) / 1000;
    console.log(d.bloquear ? 'CORTA  ' : 'deja   ', url.slice(0, 60).padEnd(60), d.regla || d.excepcion || '', d.lista || '', us.toFixed(0) + ' µs');
  }
  console.log(c.limpiaUrl('https://tienda.com/p?id=5&utm_source=x&fbclid=abc&gclid=1', 'tienda.com'));
}
