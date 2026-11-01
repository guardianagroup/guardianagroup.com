// GUARDIANA · el sello de las publicaciones (1 Nov 2026). Dueño, 16:21: «darle mucha seguridad a nuestra página web…
// hay que intentar sellar la página web»; 16:30: «tiene que ser de primer nivel… del máximo nivel posible».
//
// Cada publicación lleva un documento (sello/publicaciones/<n>.doc.json) con la huella SHA-256 del manifiesto de todo lo
// que se publica (sello/manifiestos/<n>.json: cada archivo con su SHA-256) y lo firma el dueño con su llave de acceso
// (Face ID en el iPhone o Windows Hello en el PC), en la página /firma/. La llave privada no sale nunca de su aparato:
// ni GitHub ni quien tenga acceso al repositorio puede firmar por él. Esta pieza comprueba esas firmas (WebAuthn, ES256 o
// RS256) sin dependencias: la usan los servidores antes de actualizarse, el vigilante y las pruebas.
//
// Qué se comprueba de una firma (WebAuthn, «get»): que el reto sea el SHA-256 de los bytes exactos del documento; que la
// firma se hiciera en https://guardianagroup.com (o el origen que se pase en pruebas) y para el dominio guardianagroup.com;
// que el dueño estuviera presente y verificado (Face ID, huella o PIN: banderas UP y UV); y que la firma cuadre con una de
// las llaves públicas del dueño (sello/llaves.json). Además, que el número de publicación coincida con el del documento.
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ORIGEN = 'https://guardianagroup.com';
const RP = 'guardianagroup.com';

const b64u = (s) => Buffer.from(String(s || ''), 'base64url');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest();

// docBytes: Buffer con el documento tal cual se publicó; firma: { seq, id, authData, clientDataJSON, signature } en
// base64url; llaves: [{ id, alg, spki }] (spki en base64). Devuelve { ok, motivo, llave }.
function verificaFirma(docBytes, firma, llaves, opciones) {
  const o = Object.assign({ origen: ORIGEN, rp: RP }, opciones || {});
  try {
    if (!firma || typeof firma !== 'object') return { ok: false, motivo: 'sin firma' };
    let doc;
    try { doc = JSON.parse(docBytes.toString('utf8')); } catch (_) { return { ok: false, motivo: 'documento ilegible' }; }
    if (!doc || doc.v !== 1 || !Number.isInteger(doc.seq) || doc.seq < 1) return { ok: false, motivo: 'documento sin número' };
    if (firma.seq !== doc.seq) return { ok: false, motivo: 'la firma es de otra publicación' };
    const cd = b64u(firma.clientDataJSON);
    let c;
    try { c = JSON.parse(cd.toString('utf8')); } catch (_) { return { ok: false, motivo: 'clientDataJSON ilegible' }; }
    if (c.type !== 'webauthn.get') return { ok: false, motivo: 'no es una firma (webauthn.get)' };
    if (c.origin !== o.origen) return { ok: false, motivo: 'firmada en otro sitio: ' + String(c.origin).slice(0, 80) };
    if (c.crossOrigin === true) return { ok: false, motivo: 'firmada dentro de otra web' };
    if (!b64u(c.challenge).equals(sha256(docBytes))) return { ok: false, motivo: 'el reto no es este documento' };
    const ad = b64u(firma.authData);
    if (ad.length < 37) return { ok: false, motivo: 'authenticatorData corta' };
    if (!ad.subarray(0, 32).equals(sha256(Buffer.from(o.rp)))) return { ok: false, motivo: 'firmada para otro dominio' };
    const banderas = ad[32];
    if (!(banderas & 0x01)) return { ok: false, motivo: 'sin presencia del dueño (UP)' };
    if (!(banderas & 0x04)) return { ok: false, motivo: 'sin verificación del dueño (UV)' };
    const llave = (Array.isArray(llaves) ? llaves : []).find((k) => k && k.id === firma.id);
    if (!llave) return { ok: false, motivo: 'llave desconocida' };
    const pub = crypto.createPublicKey({ key: Buffer.from(llave.spki, 'base64'), format: 'der', type: 'spki' });
    const datos = Buffer.concat([ad, sha256(cd)]);
    const sig = b64u(firma.signature);
    let bien = false;
    if (llave.alg === -7) bien = crypto.verify('sha256', datos, { key: pub, dsaEncoding: 'der' }, sig);
    else if (llave.alg === -257) bien = crypto.verify('sha256', datos, { key: pub, padding: crypto.constants.RSA_PKCS1_PADDING }, sig);
    else return { ok: false, motivo: 'algoritmo no admitido' };
    return bien ? { ok: true, motivo: 'firma válida', llave: llave.nombre || llave.id.slice(0, 8), doc } : { ok: false, motivo: 'la firma no cuadra con la llave' };
  } catch (e) {
    return { ok: false, motivo: 'error: ' + String(e && e.message).slice(0, 120) };
  }
}

// La publicación vigente de un repositorio (o una carpeta con sello/): el número, el documento, la firma comprobada y el
// manifiesto (comprobado contra la huella del documento).
function publicacion(raiz, opciones) {
  const S = path.join(raiz, 'sello');
  const lee = (p) => fs.readFileSync(path.join(S, p));
  let actual, llaves;
  try { actual = JSON.parse(lee('actual.json')); } catch (_) { return { ok: false, motivo: 'sin sello/actual.json' }; }
  try { llaves = (opciones && opciones.llaves) || JSON.parse(lee('llaves.json')).llaves; } catch (_) { return { ok: false, motivo: 'sin llaves' }; }
  const n = actual && actual.seq;
  if (!Number.isInteger(n) || n < 1) return { ok: false, motivo: 'número de publicación inválido' };
  let doc, firma, man;
  try { doc = lee(`publicaciones/${n}.doc.json`); firma = JSON.parse(lee(`publicaciones/${n}.firma.json`)); man = lee(`manifiestos/${n}.json`); } catch (_) { return { ok: false, motivo: 'faltan archivos de la publicación ' + n }; }
  const v = verificaFirma(doc, firma, llaves, opciones);
  if (!v.ok) return v;
  if (sha256(man).toString('hex') !== v.doc.manifiesto) return { ok: false, motivo: 'el manifiesto no es el firmado' };
  let m;
  try { m = JSON.parse(man.toString('utf8')); } catch (_) { return { ok: false, motivo: 'manifiesto ilegible' }; }
  return Object.assign(v, { seq: n, manifiesto: m.archivos || {} });
}

// Comprueba que los archivos de una carpeta del repositorio (por ejemplo zero-motor/) son exactamente los del manifiesto
// firmado: ninguno cambiado, ninguno de más y ninguno de menos. En modo estricto (los servidores, sobre una copia sacada
// del repositorio) no se salta ninguna carpeta y cualquier cosa que no sea un archivo normal cuenta como de más.
function compruebaCarpeta(raiz, carpeta, manifiesto, estricto) {
  const pref = carpeta.replace(/\/?$/, '/');
  const esperados = Object.keys(manifiesto).filter((p) => p.startsWith(pref));
  const malos = [];
  const vistos = new Set();
  const recorre = (rel) => {
    for (const e of fs.readdirSync(path.join(raiz, rel), { withFileTypes: true })) {
      const r = rel + '/' + e.name;
      if (e.isDirectory()) { if (estricto || (e.name !== 'node_modules' && e.name !== '.git')) recorre(r); continue; }
      if (!e.isFile()) { if (estricto) malos.push('no es un archivo: ' + r); continue; }
      vistos.add(r);
      const h = sha256(fs.readFileSync(path.join(raiz, r))).toString('hex');
      if (manifiesto[r] !== h) malos.push(manifiesto[r] ? 'cambiado: ' + r : 'de más: ' + r);
    }
  };
  recorre(pref.slice(0, -1));
  for (const p of esperados) if (!vistos.has(p)) malos.push('falta: ' + p);
  return { ok: malos.length === 0, malos };
}

module.exports = { verificaFirma, publicacion, compruebaCarpeta, ORIGEN, RP };

// Uso: node zero-motor/sello.js publicacion <raíz del repositorio> [carpeta a comprobar]
//      node zero-motor/sello.js verifica <doc.json> <firma.json> <llaves.json>
if (require.main === module) {
  const [orden, a, b, c] = process.argv.slice(2);
  let r;
  if (orden === 'verifica') {
    r = verificaFirma(fs.readFileSync(a), JSON.parse(fs.readFileSync(b, 'utf8')), JSON.parse(fs.readFileSync(c, 'utf8')).llaves, process.env.SELLO_ORIGEN ? { origen: process.env.SELLO_ORIGEN, rp: process.env.SELLO_RP } : undefined);
  } else if (orden === 'servidor') {
    // Antes de que un servidor pase a otra versión (zero-motor/instalar.sh, actualizar-motor.sh y aplica.sh): la publicación
    // vigente de esa versión, firmada con las llaves INSTALADAS en el servidor (nunca con las que trae la versión nueva), no
    // anterior a la última aplicada, y su zero-motor/ exactamente el del manifiesto firmado.
    let llaves = [];
    try { llaves = JSON.parse(fs.readFileSync(process.env.SELLO_LLAVES || '/etc/guardiana/sello-llaves.json', 'utf8')).llaves || []; } catch (_) {}
    const minimo = parseInt(process.env.SELLO_MINIMO || '0', 10) || 0;
    if (!llaves.length) r = { ok: false, motivo: 'el servidor no tiene las llaves del dueño' };
    else {
      r = publicacion(a || '.', Object.assign({ llaves }, process.env.SELLO_ORIGEN ? { origen: process.env.SELLO_ORIGEN, rp: process.env.SELLO_RP } : {}));
      if (r.ok && r.seq < minimo) r = { ok: false, motivo: `la publicación ${r.seq} es anterior a la aplicada (${minimo})` };
      if (r.ok) { const k = compruebaCarpeta(a || '.', b || 'zero-motor', r.manifiesto, true); if (!k.ok) r = { ok: false, motivo: 'zero-motor no es el firmado: ' + k.malos.slice(0, 6).join(', ') }; }
      if (r.ok) {
        // las llaves que trae esta versión tienen que ser las firmadas (el servidor las instala solo así)
        const ll = path.join(a || '.', 'sello', 'llaves.json');
        const h = fs.existsSync(ll) ? sha256(fs.readFileSync(ll)).toString('hex') : null;
        if (!h || r.manifiesto['sello/llaves.json'] !== h) r = { ok: false, motivo: 'las llaves de esta versión no son las firmadas' };
      }
      if (r.ok) r = { ok: true, seq: r.seq, llave: r.llave, caduca: r.doc && r.doc.expira };
    }
  } else if (orden === 'publicacion') {
    r = publicacion(a || '.', process.env.SELLO_ORIGEN ? { origen: process.env.SELLO_ORIGEN, rp: process.env.SELLO_RP } : undefined);
    if (r.ok && b) { const k = compruebaCarpeta(a || '.', b, r.manifiesto); r = Object.assign({}, r, { carpeta: k }); if (!k.ok) r.ok = false; }
    if (r.manifiesto) r = Object.assign({}, r, { manifiesto: Object.keys(r.manifiesto).length + ' archivos' });
  } else {
    console.error('uso: sello.js verifica <doc> <firma> <llaves> | publicacion <raíz> [carpeta]');
    process.exit(2);
  }
  const salida = Object.assign({}, r); delete salida.doc;
  if (r.doc) salida.seq = r.doc.seq;
  console.log(JSON.stringify(salida));
  process.exit(r.ok ? 0 : 1);
}
