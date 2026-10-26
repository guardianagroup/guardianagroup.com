// ZERO · quién está detrás de cada dominio (26 Oct 2026, ronda 40).
// Solo fuentes propias o con licencia de uso comercial: la base de ESPEJO (orbita/datos/espejo.json: 172 dominios y
// 100 empresas confirmadas por dos voces de la agencia), las fichas de empresa (orbita/datos/empresas.json: sede,
// país, Wikidata) y, cuando se construya, dominios-wikidata.json (Wikidata, CC0). Si no hay dato: «empresa no
// identificada». Nunca se completa por intuición (Astra, ronda 40). Ronda 42 (26 Oct 2026): datos/dominios-agencia.json,
// 107 dominios más (dos voces de tres + país de Wikidata).
'use strict';
const fs = require('fs');
const path = require('path');

const PAISES = { US: 'Estados Unidos', GB: 'Reino Unido', DE: 'Alemania', FR: 'Francia', ES: 'España', IT: 'Italia', NL: 'Países Bajos', IE: 'Irlanda', CH: 'Suiza', SE: 'Suecia', NO: 'Noruega', DK: 'Dinamarca', FI: 'Finlandia', PL: 'Polonia', CZ: 'Chequia', AT: 'Austria', BE: 'Bélgica', PT: 'Portugal', IL: 'Israel', IN: 'India', CN: 'China', JP: 'Japón', KR: 'Corea del Sur', SG: 'Singapur', AU: 'Australia', CA: 'Canadá', BR: 'Brasil', MX: 'México', AR: 'Argentina', CO: 'Colombia', CL: 'Chile', RU: 'Rusia', TR: 'Turquía', LU: 'Luxemburgo', SI: 'Eslovenia', EE: 'Estonia', LT: 'Lituania', CY: 'Chipre', HK: 'Hong Kong', TW: 'Taiwán', AE: 'Emiratos Árabes Unidos', ZA: 'Sudáfrica', NZ: 'Nueva Zelanda', UA: 'Ucrania', HU: 'Hungría', RO: 'Rumanía', BG: 'Bulgaria', GR: 'Grecia' };

// dominios de dos niveles más corrientes (para saber si una petición es de otra empresa que la web visitada)
const DOS_NIVELES = new Set(['co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'com.au', 'net.au', 'org.au', 'com.br', 'com.mx', 'com.ar', 'com.co', 'com.pe', 'com.ve', 'com.ec', 'com.uy', 'com.py', 'com.bo', 'com.do', 'com.gt', 'com.sv', 'com.hn', 'com.ni', 'com.pa', 'com.cu', 'co.jp', 'ne.jp', 'or.jp', 'co.kr', 'com.cn', 'com.hk', 'com.tw', 'com.sg', 'co.in', 'co.za', 'co.nz', 'com.tr', 'com.ua', 'com.ru', 'com.pl', 'com.pt', 'com.es', 'com.it', 'com.de', 'co.il', 'com.eg', 'com.sa', 'com.ng', 'com.ph', 'com.my', 'com.vn', 'co.th', 'com.pk', 'com.bd']);

function baseDominio(host) {
  host = (host || '').toLowerCase().replace(/\.$/, '');
  const p = host.split('.');
  if (p.length <= 2) return host;
  const dos = p.slice(-2).join('.');
  return DOS_NIVELES.has(dos) ? p.slice(-3).join('.') : dos;
}

class Empresas {
  constructor(raiz) {
    this.dominios = {}; this.paisEmpresa = {}; this.fichas = {};
    const e = path.join(raiz, 'orbita', 'datos', 'espejo.json');
    if (fs.existsSync(e)) {
      const d = JSON.parse(fs.readFileSync(e, 'utf8'));
      this.dominios = d.dominios || {}; this.paisEmpresa = d.empresas || {}; this.fecha = d.fecha;
    }
    const f = path.join(raiz, 'orbita', 'datos', 'empresas.json');
    if (fs.existsSync(f)) this.fichas = (JSON.parse(fs.readFileSync(f, 'utf8')).empresas) || {};
    const w = path.join(__dirname, 'datos', 'dominios-wikidata.json');
    this.wikidata = fs.existsSync(w) ? JSON.parse(fs.readFileSync(w, 'utf8')) : {};
    // ronda 42 (26 Oct 2026): 107 dominios más, dos voces de la agencia + país de Wikidata
    const a = path.join(__dirname, 'datos', 'dominios-agencia.json');
    this.agencia = fs.existsSync(a) ? JSON.parse(fs.readFileSync(a, 'utf8')) : { dominios: {}, empresas: {}, detalle: {} };
  }

  /** { empresa, pais (código), paisNombre, categoria, fuente, certeza } o { empresa: null } */
  atribuye(host) {
    host = (host || '').toLowerCase();
    const partes = host.split('.');
    for (let i = 0; i < partes.length - 1; i++) {
      const d = partes.slice(i).join('.');
      const x = this.dominios[d];
      if (x && x.empresa) {
        const cc = this.paisEmpresa[x.empresa] || (this.fichas[x.empresa] || {}).cc || null;
        return { empresa: x.empresa, pais: cc, paisNombre: PAISES[cc] || cc, categoria: x.categoria || null, fuente: 'agencia GUARDIANA, dos voces', certeza: 'comprobado', ficha: this.fichas[x.empresa] || null };
      }
      const ag = this.agencia.dominios[d];
      if (ag && ag.empresa) {
        const det = this.agencia.detalle[ag.empresa] || {};
        const cc = this.agencia.empresas[ag.empresa] || det.cc || null;
        return { empresa: ag.empresa, pais: cc, paisNombre: PAISES[cc] || cc, categoria: ag.categoria || null, fuente: det.pais_fuente === 'Wikidata (CC0)' ? 'agencia GUARDIANA, dos voces · país: Wikidata (CC0)' : 'agencia GUARDIANA, dos voces', certeza: 'comprobado', ficha: this.fichas[ag.empresa] || (det.sede ? { sede: det.sede, wikidata: det.wikidata } : null) };
      }
      const wd = this.wikidata[d];
      if (wd && wd.empresa) return { empresa: wd.empresa, pais: wd.pais || null, paisNombre: PAISES[wd.pais] || wd.pais, categoria: null, fuente: 'Wikidata (CC0)', certeza: 'comprobado', ficha: this.fichas[wd.empresa] || null };
    }
    return { empresa: null, pais: null, paisNombre: null, categoria: null, fuente: null, certeza: null, ficha: null };
  }
}

module.exports = { Empresas, baseDominio, PAISES };
