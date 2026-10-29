// GUARDIANA · Comunicaciones · baúl de contactos (28 Oct 2026).
//
// Dueño, 28 Oct 2026, 20:51–20:54: los contactos guardados tienen que estar también en la app de la pantalla de inicio («llamar a
// mis contactos… sin tener que enviarles nuevamente una invitación»), y eligió la opción automática: la llave de acceso del
// teléfono (Face ID, en el llavero de iCloud o el gestor de contraseñas de Google). En el iPhone, Safari y la app de la pantalla de
// inicio no comparten nada salvo esa llave.
//
// Aquí se guarda, por cada llave de acceso, un solo bloque encriptado en el teléfono (AES-256-GCM con una clave que sale de la llave
// de acceso y nunca llega aquí). El relé no puede abrirlo ni sabe de quién es: el nombre del bloque (id) también sale de la llave.
//   · Leer: cualquiera que sepa el id (256 bits al azar: solo el dueño de la llave).
//   · Escribir: además, la «llave de escritura» del primer guardado (aquí solo su SHA-256) y la versión que se leyó (si otro
//     equipo guardó entre medias, se rechaza y el teléfono vuelve a leer y mezclar).
//   · Fuera del repositorio (la actualización automática lo sobrescribe), un archivo por id, escrito de golpe (temporal + rename).
//   · Se borra solo si nadie lo lee ni lo escribe en 400 días.
'use strict';
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const MAX_BYTES = 512 * 1024;      // un bloque: decenas de contactos con sus claves postcuánticas caben de sobra
const MAX_ENTRADAS = 200000;
const DIAS = 400;
const esHex = (s, n) => typeof s === 'string' && s.length === n && /^[0-9a-f]+$/.test(s);

class Baul {
  constructor(dir) {
    this.dir = dir || process.env.COM_BAUL_DIR || path.join(__dirname, '..', '..', 'datos-com', 'baul');
    this.colas = new Map(); // id → promesa: las operaciones de un mismo id, de una en una
    this.listo = fsp.mkdir(this.dir, { recursive: true, mode: 0o700 }).then(() => true, (e) => { console.error('baúl: sin carpeta', this.dir, e.message); return false; });
    this.n = 0;
    this.listo.then((ok) => { if (ok) this.barre(); });
    const t = setInterval(() => this.barre(), 24 * 3600 * 1000); if (t.unref) t.unref();
  }
  archivo(id) { return path.join(this.dir, id + '.json'); }
  enCola(id, f) {
    const antes = this.colas.get(id) || Promise.resolve();
    const p = antes.then(f, f);
    const fin = p.then(() => {}, () => {});
    this.colas.set(id, fin);
    fin.then(() => { if (this.colas.get(id) === fin) this.colas.delete(id); });
    return p;
  }
  async abre(id) {
    try { return JSON.parse(await fsp.readFile(this.archivo(id), 'utf8')); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
  }
  // → { ok, version, datos: Buffer | null }
  lee(id) {
    if (!esHex(id, 64)) return Promise.resolve({ ok: false, por: 'formato' });
    return this.enCola(id, async () => {
      if (!(await this.listo)) return { ok: false, por: 'sin baúl' };
      const r = await this.abre(id);
      if (!r) return { ok: true, version: 0, datos: null };
      const ahora = new Date(); fsp.utimes(this.archivo(id), ahora, ahora).catch(() => {}); // leído: no caduca
      return { ok: true, version: r.version, datos: Buffer.from(r.datos, 'base64') };
    });
  }
  // llave: Buffer de 32 bytes; version: la que se leyó (0 si no había nada); datos: Buffer
  pon(id, llave, version, datos) {
    if (!esHex(id, 64) || !Buffer.isBuffer(llave) || llave.length !== 32 || !Number.isInteger(version) || version < 0 || !Buffer.isBuffer(datos) || !datos.length) return Promise.resolve({ ok: false, por: 'formato' });
    if (datos.length > MAX_BYTES) return Promise.resolve({ ok: false, por: 'demasiado grande' });
    return this.enCola(id, async () => {
      if (!(await this.listo)) return { ok: false, por: 'sin baúl' };
      const h = crypto.createHash('sha256').update(llave).digest('hex');
      const r = await this.abre(id);
      if (r && r.llave !== h) return { ok: false, por: 'llave' };
      const actual = r ? r.version : 0;
      if (version !== actual) return { ok: false, por: 'version', version: actual };
      if (!r && this.n >= MAX_ENTRADAS) return { ok: false, por: 'baúl lleno' };
      const nueva = { v: 1, llave: h, version: actual + 1, cambio: Date.now(), datos: datos.toString('base64') };
      const tmp = this.archivo(id) + '.' + crypto.randomBytes(6).toString('hex') + '.tmp';
      await fsp.writeFile(tmp, JSON.stringify(nueva), { mode: 0o600 });
      await fsp.rename(tmp, this.archivo(id));
      if (!r) this.n++;
      return { ok: true, version: nueva.version };
    });
  }
  async barre() {
    try {
      const xs = await fsp.readdir(this.dir); let n = 0; const tope = Date.now() - DIAS * 24 * 3600 * 1000;
      for (const x of xs) {
        const f = path.join(this.dir, x);
        try {
          const st = await fsp.stat(f);
          if (x.endsWith('.tmp') && st.mtimeMs < Date.now() - 3600 * 1000) { await fsp.unlink(f); continue; }
          if (!/^[0-9a-f]{64}\.json$/.test(x)) continue;
          if (st.mtimeMs < tope) { await fsp.unlink(f); continue; }
          n++;
        } catch (_) {}
      }
      this.n = n;
    } catch (_) {}
  }
}

module.exports = { Baul, MAX_BYTES };
