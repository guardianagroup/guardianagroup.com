// GUARDIANA · Comunicaciones · buzón cifrado (30 Oct 2026).
//
// Dueño, 29 Oct 2026, 23:49–00:05: los mensajes se quedaban con el reloj hasta que los dos estaban conectados a la vez; elige
// el «buzón cifrado», como WhatsApp, Signal o Threema: el relé guarda el mensaje cerrado hasta entregarlo.
//
//   · Lo que se guarda es un sobre que solo el teléfono de quien recibe puede abrir (acuerdo híbrido ECDH P-256 + ML-KEM-768,
//     AES-256-GCM, firmado por quien envía; ver cripto.js, «Buzón cifrado»). Aquí no hay ninguna clave: el relé no puede leerlo,
//     ni cambiarlo sin que se note, ni saber si es un texto, una nota de voz, una foto o un acuse de «leído».
//   · Cada sobre lleva: la sala (64 hex), quién lo deja y para quién (los identificadores de 16 hex que cada teléfono usa en esa
//     sala, sin nombre ni número), un identificador al azar, la hora y su tamaño. Nada más.
//   · Se borra en cuanto el destinatario lo recoge y confirma, o a los 7 días sin recoger. Va a disco (cada sobre, un archivo;
//     un índice) para que una actualización o un reinicio del relé no pierda mensajes.
//   · Límites: 4 MB por sobre (en trozos de 960 KB), 300 sobres y 40 MB por sala, 2 GB en total.
'use strict';
const fs = require('fs');
const path = require('path');

const TTL_MS = 7 * 24 * 3600 * 1000;
const MAX_SOBRE = 6 * 1024 * 1024;         // un sobre entero (4 MB de archivo en base64 + cabecera, con margen)
const MAX_PARTES = 8;
const MAX_POR_SALA = 300;
const MAX_BYTES_SALA = 40 * 1024 * 1024;
const MAX_BYTES_TOTAL = 2 * 1024 * 1024 * 1024;
const PARCIAL_MS = 2 * 60 * 1000;          // un sobre a medias (faltan trozos) se tira a los 2 minutos
const esHex = (s, n) => typeof s === 'string' && s.length === n && /^[0-9a-f]+$/.test(s);

class Buzones {
  constructor(o = {}) {
    this.dir = o.dir || process.env.COM_BUZONES_DIR || path.join(__dirname, '..', '..', 'datos-com', 'buzones');
    this.salas = new Map();     // sala → Map(id → { de, para, t, tam, avisa })
    this.parciales = new Map(); // sala|id → { de, para, t, total, partes: [], avisa }
    this.bytes = 0;
    this.disco = true;
    try { fs.mkdirSync(this.dir, { recursive: true, mode: 0o700 }); } catch (e) { this.disco = false; console.error('buzones: sin carpeta', this.dir, e.message); }
    this.carga();
  }
  archivo(sala, id) { return path.join(this.dir, sala + '_' + id + '.bin'); }
  carga() {
    if (!this.disco) return;
    let indice = {};
    try { indice = JSON.parse(fs.readFileSync(path.join(this.dir, 'indice.json'), 'utf8')) || {}; } catch (_) { indice = {}; }
    const ahora = Date.now();
    for (const [sala, xs] of Object.entries(indice)) {
      if (!esHex(sala, 64) || !xs || typeof xs !== 'object') continue;
      for (const [id, e] of Object.entries(xs)) {
        if (!esHex(id, 32) || !e || !esHex(e.de, 16) || !esHex(e.para, 16) || !(e.t > 0) || ahora - e.t > TTL_MS) { try { fs.unlinkSync(this.archivo(sala, id)); } catch (_) {} continue; }
        let tam = 0; try { tam = fs.statSync(this.archivo(sala, id)).size; } catch (_) { continue; }
        if (!this.salas.has(sala)) this.salas.set(sala, new Map());
        this.salas.get(sala).set(id, { de: e.de, para: e.para, t: e.t, tam, avisa: !!e.avisa });
        this.bytes += tam;
      }
    }
  }
  guardaIndice() {
    if (!this.disco) return;
    const o = {};
    for (const [sala, xs] of this.salas) { if (!xs.size) continue; o[sala] = {}; for (const [id, e] of xs) o[sala][id] = { de: e.de, para: e.para, t: e.t, avisa: e.avisa ? 1 : 0 }; }
    const f = path.join(this.dir, 'indice.json');
    try { fs.writeFileSync(f + '.nuevo', JSON.stringify(o), { mode: 0o600 }); fs.renameSync(f + '.nuevo', f); } catch (e) { console.error('buzones: índice', e.message); }
  }
  // un trozo de un sobre; devuelve { ok, completo } o { ok: false, por }
  deja(sala, de, para, id, parte, total, carga, avisa) {
    if (!esHex(sala, 64) || !esHex(de, 16) || !esHex(para, 16) || !esHex(id, 32) || de === para) return { ok: false, por: 'formato' };
    if (!(total >= 1 && total <= MAX_PARTES) || !(parte >= 0 && parte < total)) return { ok: false, por: 'formato' };
    const xs = this.salas.get(sala);
    if (xs && xs.has(id)) return { ok: true, completo: true, repetido: true }; // ya estaba entero (reintento)
    const k = sala + '|' + id;
    let p = this.parciales.get(k);
    if (!p) { p = { de, para, t: Date.now(), total, partes: new Array(total).fill(null), avisa: !!avisa }; this.parciales.set(k, p); }
    if (p.de !== de || p.para !== para || p.total !== total) return { ok: false, por: 'formato' };
    p.partes[parte] = Buffer.from(carga);
    if (p.partes.some((x) => !x)) return { ok: true, completo: false };
    this.parciales.delete(k);
    const todo = Buffer.concat(p.partes);
    if (todo.length > MAX_SOBRE) return { ok: false, por: 'demasiado grande' };
    const sx = xs || new Map();
    let enSala = 0; for (const e of sx.values()) enSala += e.tam;
    if (sx.size >= MAX_POR_SALA || enSala + todo.length > MAX_BYTES_SALA) return { ok: false, por: 'buzón lleno' };
    if (this.bytes + todo.length > MAX_BYTES_TOTAL) return { ok: false, por: 'relé lleno' };
    if (this.disco) { try { fs.writeFileSync(this.archivo(sala, id), todo, { mode: 0o600 }); } catch (e) { return { ok: false, por: 'disco' }; } }
    sx.set(id, { de, para, t: p.t, tam: todo.length, avisa: p.avisa, memoria: this.disco ? undefined : todo });
    this.salas.set(sala, sx); this.bytes += todo.length;
    this.guardaIndice();
    return { ok: true, completo: true };
  }
  // los sobres de una sala para un destinatario: [{ id, de, t, datos }]
  para(sala, para) {
    const xs = this.salas.get(sala); if (!xs) return [];
    const r = [];
    for (const [id, e] of xs) {
      if (e.para !== para) continue;
      let datos = e.memoria || null;
      if (!datos) { try { datos = fs.readFileSync(this.archivo(sala, id)); } catch (_) { continue; } }
      r.push({ id, de: e.de, t: e.t, datos });
    }
    return r.sort((a, b) => a.t - b.t);
  }
  hay(sala, id) { const xs = this.salas.get(sala); return !!(xs && xs.get(id)); }
  avisa(sala, id) { const xs = this.salas.get(sala); const e = xs && xs.get(id); return !!(e && e.avisa); }
  // solo el destinatario puede borrar lo suyo (al recogerlo)
  borra(sala, para, ids) {
    const xs = this.salas.get(sala); if (!xs) return 0;
    let n = 0;
    for (const id of ids || []) {
      const e = xs.get(id); if (!e || e.para !== para) continue;
      xs.delete(id); this.bytes -= e.tam; n++;
      if (this.disco) { try { fs.unlinkSync(this.archivo(sala, id)); } catch (_) {} }
    }
    if (!xs.size) this.salas.delete(sala);
    if (n) this.guardaIndice();
    return n;
  }
  barre() {
    const ahora = Date.now(); let cambio = false;
    for (const [k, p] of this.parciales) if (ahora - p.t > PARCIAL_MS) this.parciales.delete(k);
    for (const [sala, xs] of this.salas) {
      for (const [id, e] of xs) if (ahora - e.t > TTL_MS) { xs.delete(id); this.bytes -= e.tam; cambio = true; if (this.disco) { try { fs.unlinkSync(this.archivo(sala, id)); } catch (_) {} } }
      if (!xs.size) this.salas.delete(sala);
    }
    if (cambio) this.guardaIndice();
  }
  get cuantos() { let n = 0; for (const xs of this.salas.values()) n += xs.size; return n; }
}

module.exports = { Buzones, TTL_MS };
