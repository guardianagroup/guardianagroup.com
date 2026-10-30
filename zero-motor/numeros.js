// GUARDIANA · Comunicaciones · Número GUARDIANA (29 Oct 2026).
//
// Dueño, 29 Oct 2026, 20:56–21:55: «cada persona se le asigna un número para siempre… la otra persona siempre llama a ese
// número»; «no quiero que ninguna persona pueda escribir un número al azar y que se pueda comunicar con alguien»; «para que
// nosotros no veamos nada… absolutamente nada del cliente». Agencia, ronda 73 (Astra y una voz independiente): «añadirse los dos».
//
//   · El número (12 cifras: 11 al azar y una de control Damm) nace en el teléfono y aquí nunca llega. Llega su huella
//     idn = PBKDF2-SHA256(número, «GUARDIANA número v1», 300.000 vueltas), ligada a las dos claves públicas de esa app (firma y
//     acuerdo, P-256) con una firma sobre un reto de esta conexión: prueba que la app tiene la clave privada. Una huella, un
//     juego de claves; un juego de claves, una huella. Una huella ya dada no se vuelve a dar nunca.
//   · Para hablar, los dos tienen que añadir el número del otro. Cada uno deja en una «cita» (T: 32 bytes que el teléfono saca
//     de los dos números; sin los dos no se puede calcular) un sobre cerrado con una clave que también sale de los dos números.
//     Aquí no se sabe de quién es la otra mitad de una cita hasta que esa persona deja la suya: entonces se entrega a cada uno el
//     sobre del otro y las claves públicas con las que el otro se dio de alta, y cada teléfono comprueba que esas claves son las
//     del número que escribió. Escribir un número al azar no produce nada: ni aviso, ni mensaje, ni una respuesta distinta de la
//     de un número que exista.
//   · Se guarda en disco: la huella de cada número con sus dos claves públicas y el mes de alta (sin nombre, teléfono, correo ni
//     IP) y, como mucho 30 días, las citas (huella de quien dejó cada mitad y su sobre cerrado). Una cita completa se borra en
//     cuanto los dos la han recogido. Lo que se ve mientras dura la conexión (dirección IP y hora) sirve solo para los límites de
//     abuso, en memoria, con la IP resumida con una clave que cambia en cada arranque; no se escribe en ningún sitio.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_NUMEROS = 200000;        // con más, este almacén (un archivo JSON) se cambia por una base de datos
const MAX_CITAS = 200000;
const CITA_MS = 30 * 24 * 3600 * 1000; // una cita sin pareja espera 30 días (Astra: 7, «quizá 30»; voz independiente: 30)
// límites de la agencia (ronda 73, para el piloto; se revisan con datos): números nuevos añadidos por hora y por día, y citas
// sin pareja a la vez, por número
const NUEVAS_HORA = 10, NUEVAS_DIA = 30, PENDIENTES = 100;
// intentos de alta por conexión y minuto, y por dirección y hora. En el relé de pruebas (todas las pruebas salen de 127.0.0.1) el
// límite por dirección se sube con COM_PRUEBAS=1; en el servidor real no se toca
const ALTAS_MIN = 5, ALTAS_HORA_IP = process.env.COM_PRUEBAS === '1' ? 100000 : 30;
const MAX_DEPOSITOS = 4;           // mitades de distinta huella en una misma cita (las dos buenas y, si se cuela alguien que sabe los dos números, no bloquea)
const SOBRE = /^[A-Za-z0-9_-]{60,2000}$/;
const PUB = /^[A-Za-z0-9_-]{87}$/; // 65 bytes en base64url sin relleno
const FIRMA = /^[A-Za-z0-9_-]{86}$/; // 64 bytes (P1363)
const esHex = (s, n) => typeof s === 'string' && s.length === n && /^[0-9a-f]+$/.test(s);
const deB64u = (s) => Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
const SPKI_P256 = Buffer.from('3059301306072a8648ce3d020106082a8648ce3d030107034200', 'hex');
const clavePublica = (b64) => { try { const raw = deB64u(b64); if (raw.length !== 65 || raw[0] !== 4) return null; return crypto.createPublicKey({ key: Buffer.concat([SPKI_P256, raw]), format: 'der', type: 'spki' }); } catch (_) { return null; } };
const mes = () => new Date().toISOString().slice(0, 7);

class Numeros {
  constructor(o) {
    o = o || {};
    this.dir = o.dir || process.env.COM_NUMEROS_DIR || path.join(__dirname, '..', '..', 'datos-com', 'numeros');
    this.numeros = new Map();      // idn → { f, a, alta: 'AAAA-MM' }
    this.porFirma = new Map();     // f → idn
    this.citas = new Map();        // T → { deps: Map(idn → { s, t }), casada: ms|0, fin: Set(idn), t: ms }
    this.pendientesDe = new Map(); // idn → Set(T) sin pareja
    this.nuevasDe = new Map();     // idn → [ms] (memoria)
    this.altasIp = new Map();      // IP resumida → [ms] (memoria)
    this.conexiones = new Map();   // idn → Set(conexión)
    this.clave = crypto.randomBytes(32);
    this.guardando = null; this.pendienteGuardar = false;
    try { fs.mkdirSync(this.dir, { recursive: true, mode: 0o700 }); } catch (e) { console.error('números: sin carpeta', this.dir, e.message); }
    // el «buzón» de cada número (la sala de avisos por la que llega «alguien que añadiste también te ha añadido») sale de la huella
    // con un secreto de este servidor: quien sepa el número de otra persona no puede calcularlo ni suscribirse a él (voz
    // independiente, ronda 73). Se guarda fuera del repositorio, como la clave VAPID
    this.secretoBuzon = this.cargaSecreto();
    this.buzones = new Map();      // buzón → idn (para que solo su dueño se suscriba)
    this.carga();
    this.barredor = setInterval(() => this.barre(), 3600 * 1000); if (this.barredor.unref) this.barredor.unref();
  }

  // ---------- disco ----------
  cargaSecreto() {
    const f = path.join(this.dir, 'secreto-buzon');
    try { const h = fs.readFileSync(f, 'utf8').trim(); if (/^[0-9a-f]{64}$/.test(h)) return Buffer.from(h, 'hex'); } catch (_) {}
    const b = crypto.randomBytes(32);
    try { fs.writeFileSync(f, b.toString('hex'), { mode: 0o600 }); } catch (e) { console.error('números: no se pudo guardar el secreto del buzón', e.message); }
    return b;
  }
  buzon(idn) {
    let b = null; for (const [k, v] of this.buzones) if (v === idn) { b = k; break; }
    if (!b) { b = crypto.createHmac('sha256', this.secretoBuzon).update('GUARDIANA buzón v1\n' + idn).digest('hex'); this.buzones.set(b, idn); }
    return b;
  }
  // ¿puede esta conexión suscribirse a esa sala? Un buzón, solo su dueño; las demás salas, como siempre
  salaPermitida(c, sala) { const d = this.buzones.get(sala); return !d || d === c.idn; }
  carga() {
    try {
      for (const x of JSON.parse(fs.readFileSync(path.join(this.dir, 'numeros.json'), 'utf8')) || []) {
        if (!x || !esHex(x.i, 64) || !PUB.test(x.f || '') || !PUB.test(x.a || '')) continue;
        this.numeros.set(x.i, { f: x.f, a: x.a, alta: String(x.m || '') }); this.porFirma.set(x.f, x.i);
      }
    } catch (_) {}
    try {
      for (const x of JSON.parse(fs.readFileSync(path.join(this.dir, 'citas.json'), 'utf8')) || []) {
        if (!x || !esHex(x.T, 64) || !Array.isArray(x.d)) continue;
        const e = { deps: new Map(), casada: +x.c || 0, fin: new Set((x.f || []).filter((i) => esHex(i, 64))), t: +x.t || Date.now() };
        for (const d of x.d) if (d && esHex(d.i, 64) && SOBRE.test(d.s || '')) e.deps.set(d.i, { s: d.s, t: +d.t || e.t });
        if (!e.deps.size) continue;
        this.citas.set(x.T, e);
        if (!e.casada) for (const i of e.deps.keys()) this.pendientes(i).add(x.T);
      }
    } catch (_) {}
    this.barre();
  }
  guarda() {
    this.pendienteGuardar = true;
    if (this.guardando) return;
    this.guardando = setTimeout(() => {
      this.guardando = null; if (!this.pendienteGuardar) return; this.pendienteGuardar = false;
      const escribe = (nombre, datos) => { const f = path.join(this.dir, nombre), tmp = f + '.tmp'; try { fs.writeFileSync(tmp, JSON.stringify(datos), { mode: 0o600 }); fs.renameSync(tmp, f); } catch (e) { console.error('números: no se pudo guardar', nombre, e.message); } };
      escribe('numeros.json', [...this.numeros].map(([i, n]) => ({ i, f: n.f, a: n.a, m: n.alta })));
      escribe('citas.json', [...this.citas].map(([T, e]) => ({ T, d: [...e.deps].map(([i, d]) => ({ i, s: d.s, t: d.t })), c: e.casada || undefined, f: e.fin.size ? [...e.fin] : undefined, t: e.t })));
    }, 800);
    if (this.guardando.unref) this.guardando.unref();
  }
  pendientes(idn) { let s = this.pendientesDe.get(idn); if (!s) { s = new Set(); this.pendientesDe.set(idn, s); } return s; }
  barre() {
    const ahora = Date.now(); let cambio = false;
    for (const [T, e] of this.citas) {
      if (ahora - (e.casada || e.t) > CITA_MS) { for (const i of e.deps.keys()) { const p = this.pendientesDe.get(i); if (p) { p.delete(T); if (!p.size) this.pendientesDe.delete(i); } } this.citas.delete(T); cambio = true; }
    }
    for (const m of [this.nuevasDe, this.altasIp]) for (const [k, xs] of m) { const v = xs.filter((t) => ahora - t < 24 * 3600 * 1000); if (v.length) m.set(k, v); else m.delete(k); }
    if (cambio) this.guarda();
  }
  estado() { return { numeros: this.numeros.size, citas: this.citas.size }; }
  resumeIp(ip) { return ip ? crypto.createHmac('sha256', this.clave).update(String(ip)).digest('hex').slice(0, 24) : ''; }
  sale(c) { if (c.idn) { const s = this.conexiones.get(c.idn); if (s) { s.delete(c); if (!s.size) this.conexiones.delete(c.idn); } } }
  vivas(idn) { return this.conexiones.get(idn) || new Set(); }

  // ---------- alta y presentación del número de esta conexión ----------
  // m: { idn, f, a, sig, alta: 1 } · la firma cubre «GUARDIANA yo v1», el reto de esta conexión, la huella y las dos claves.
  // Sin «alta», solo presenta un número ya dado de alta (y un número de otro, o que no existe, recibe la misma respuesta: «no»).
  num(c, m) {
    const idn = String(m.idn || ''), f = String(m.f || ''), a = String(m.a || ''), sig = String(m.sig || ''), alta = m.alta === 1;
    if (!esHex(idn, 64) || !PUB.test(f) || !PUB.test(a) || !FIRMA.test(sig) || !esHex(c.reto, 32)) return { ok: false, por: 'formato' };
    if (alta) {
      const ahora = Date.now();
      c.altas = (c.altas || []).filter((t) => ahora - t < 60 * 1000);
      if (c.altas.length >= ALTAS_MIN) return { ok: false, por: 'espera' };
      if (c.ipk) { const xs = (this.altasIp.get(c.ipk) || []).filter((t) => ahora - t < 3600 * 1000); if (xs.length >= ALTAS_HORA_IP) return { ok: false, por: 'espera' }; xs.push(ahora); this.altasIp.set(c.ipk, xs); }
      c.altas.push(ahora);
    }
    const kf = clavePublica(f); if (!kf || !clavePublica(a)) return { ok: false, por: 'formato' };
    const datos = Buffer.from('GUARDIANA yo v1\n' + c.reto + '\n' + idn + '\n' + f + '\n' + a, 'utf8');
    let bien = false; try { bien = crypto.verify('sha256', datos, { key: kf, dsaEncoding: 'ieee-p1363' }, deB64u(sig)); } catch (_) { bien = false; }
    if (!bien) return { ok: false, por: 'firma' };
    const n = this.numeros.get(idn);
    if (n) {
      if (n.f !== f || n.a !== a) return { ok: false, por: alta ? 'ocupado' : 'no' };
    } else {
      if (!alta) return { ok: false, por: 'no' };
      if (this.porFirma.has(f)) return { ok: false, por: 'ya tienes' };
      if (this.numeros.size >= MAX_NUMEROS) return { ok: false, por: 'lleno' };
      this.numeros.set(idn, { f, a, alta: mes() }); this.porFirma.set(f, idn); this.guarda();
    }
    if (c.idn && c.idn !== idn) this.sale(c);
    c.idn = idn; let s = this.conexiones.get(idn); if (!s) { s = new Set(); this.conexiones.set(idn, s); } s.add(c);
    return { ok: true, nuevo: n ? undefined : 1, buzon: this.buzon(idn) };
  }

  // las otras mitades de una cita, con las claves con las que cada una se dio de alta
  otros(e, idn) {
    const xs = [];
    for (const [i, d] of e.deps) { if (i === idn) continue; const n = this.numeros.get(i); if (n) xs.push({ i, f: n.f, a: n.a, s: d.s }); }
    return xs;
  }

  // ---------- cita: «he añadido este número» ----------
  // Devuelve { r: respuesta, casadas: [idn de quien estaba esperando] }. La respuesta sin pareja es siempre la misma.
  cita(c, m) {
    const T = String(m.T || ''), s = String(m.s || '');
    if (!c.idn) return { r: { ok: false, por: 'sin número' } };
    if (!esHex(T, 64) || !SOBRE.test(s)) return { r: { ok: false, por: 'formato' } };
    const ahora = Date.now();
    let e = this.citas.get(T);
    if (e && e.deps.has(c.idn)) {
      // la misma persona otra vez: con pareja, lo que ya había (una cita completa no se cambia); sin ella, el sobre nuevo, sin
      // alargar su vida (agencia: «repetirla no amplía automáticamente su vida»)
      if (e.casada) return { r: { ok: true, T, otros: this.otros(e, c.idn) } };
      e.deps.get(c.idn).s = s; this.guarda();
      return { r: { ok: true, T, espera: 1 } };
    }
    const hechas = (this.nuevasDe.get(c.idn) || []).filter((t) => ahora - t < 24 * 3600 * 1000);
    if (hechas.filter((t) => ahora - t < 3600 * 1000).length >= NUEVAS_HORA || hechas.length >= NUEVAS_DIA) return { r: { ok: false, por: 'demasiadas' } };
    if ((this.pendientesDe.get(c.idn) || new Set()).size >= PENDIENTES) return { r: { ok: false, por: 'demasiadas pendientes' } };
    if (!e) {
      if (this.citas.size >= MAX_CITAS) return { r: { ok: false, por: 'lleno' } };
      e = { deps: new Map(), casada: 0, fin: new Set(), t: ahora }; this.citas.set(T, e);
    }
    hechas.push(ahora); this.nuevasDe.set(c.idn, hechas);
    if (e.deps.size >= MAX_DEPOSITOS) return { r: { ok: true, T, espera: 1 } };
    e.deps.set(c.idn, { s, t: ahora });
    const otros = this.otros(e, c.idn);
    if (!otros.length) { this.pendientes(c.idn).add(T); this.guarda(); return { r: { ok: true, T, espera: 1 } }; }
    if (!e.casada) e.casada = ahora;
    const casadas = [];
    for (const i of e.deps.keys()) { const p = this.pendientesDe.get(i); if (p) { p.delete(T); if (!p.size) this.pendientesDe.delete(i); } if (i !== c.idn) casadas.push(i); }
    this.guarda();
    return { r: { ok: true, T, otros }, casadas, e, T };
  }

  // las citas que esta persona dejó: las que ya tienen pareja (con la otra mitad) y las que ya no existen (caducadas)
  citasDe(c, m) {
    if (!c.idn) return { ok: false, por: 'sin número' };
    const ts = Array.isArray(m.ts) ? m.ts.filter((x) => esHex(x, 64)).slice(0, PENDIENTES) : [];
    const listas = [], perdidas = [];
    for (const T of ts) {
      const e = this.citas.get(T);
      if (!e || !e.deps.has(c.idn)) { perdidas.push(T); continue; }
      if (e.casada) { const otros = this.otros(e, c.idn); if (otros.length) listas.push({ T, otros }); }
    }
    return { ok: true, listas, perdidas };
  }

  // «ya está»: quien recogió la otra mitad lo dice; con los dos, la cita se borra. Sin pareja, «cancela» la retira.
  citaFin(c, m) {
    const T = String(m.T || '');
    if (!c.idn || !esHex(T, 64)) return { ok: false, por: 'formato' };
    const e = this.citas.get(T);
    if (!e || !e.deps.has(c.idn)) return { ok: true };
    if (!e.casada) {
      e.deps.delete(c.idn);
      const p = this.pendientesDe.get(c.idn); if (p) { p.delete(T); if (!p.size) this.pendientesDe.delete(c.idn); }
      if (!e.deps.size) this.citas.delete(T);
    } else {
      e.fin.add(c.idn);
      // con las dos mitades buenas recogidas (las de quien lo dice y la de cualquier otro que también lo haya dicho), fuera
      if (e.fin.size >= 2) this.citas.delete(T);
    }
    this.guarda();
    return { ok: true };
  }
}

module.exports = { Numeros };
