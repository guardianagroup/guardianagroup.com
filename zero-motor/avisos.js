// GUARDIANA · Comunicaciones · avisos fuera de la app (29 Oct 2026).
//
// Dueño, 29 Oct 2026, 09:14: «cuando te están llamando, las notificaciones fuera de la aplicación… intentar hacer que suene o que
// haga algo cuando está fuera de la aplicación». Web Push (RFC 8030, 8291 y 8292), sin ninguna dependencia:
//   · El teléfono se suscribe en su navegador (Apple, Google o Mozilla le dan una dirección opaca) y la manda aquí con las salas
//     en las que quiere que se le avise. Aquí solo se guarda esa dirección, sus dos claves públicas y las salas: nunca un nombre,
//     un mensaje ni una clave de la conversación.
//   · Cuando alguien escribe o llama a una sala en la que la otra persona no está conectada, se le manda un aviso mínimo, cifrado
//     para su navegador (aes128gcm), que solo dice «mensaje» o «llamada» y la sala. El texto del mensaje nunca viaja: no hay buzón.
//   · El servidor firma cada envío con su par de claves VAPID (P-256), creado aquí la primera vez y guardado fuera del repositorio.
//   · Una dirección que el servicio de push da por muerta (404 o 410) se borra. Nadie recibe más de un aviso del mismo tipo por sala
//     cada 20 segundos, y las suscripciones sin uso se borran a los 180 días.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const MAX_SUBS = 50000;
const MAX_POR_SALA = 8;
const DIAS = 180;
const SILENCIO_MS = 20 * 1000;
const SILENCIO_MENSAJE_MS = 2 * 1000; // cada mensaje, su aviso: el teléfono cuenta 1, 2, 3… (29 Oct 2026, 23:41)
const b64u = (b) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deB64u = (s) => Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
const esHex = (s, n) => typeof s === 'string' && s.length === n && /^[0-9a-f]+$/.test(s);

class Avisos {
  constructor(o) {
    o = o || {};
    this.dir = o.dir || process.env.COM_AVISOS_DIR || path.join(__dirname, '..', '..', 'datos-com', 'avisos');
    this.remitente = o.remitente || 'https://guardianagroup.com';
    this.subs = new Map();      // endpoint → { endpoint, p256dh, auth, salas: Set, id, creado, usado }
    this.porSala = new Map();   // sala → Set(endpoint)
    this.ultimos = new Map();   // endpoint + '|' + sala + '|' + tipo → cuándo se avisó
    this.guardando = null; this.pendienteGuardar = false;
    try { fs.mkdirSync(this.dir, { recursive: true, mode: 0o700 }); } catch (e) { console.error('avisos: sin carpeta', this.dir, e.message); }
    this.claves = this.cargaClaves();
    // el «topic» de cada aviso (RFC 8030: lo ve el servicio de push de Apple, Google o Mozilla) se deriva por suscripción con este
    // secreto: dos teléfonos que comparten un chat ya no llevan la misma etiqueta, y el servicio de push no puede emparejarlos
    // (voz independiente, ronda 73, 29 Oct 2026). Antes era «gcom-m-» + 16 caracteres de la sala
    this.secretoTema = this.cargaSecretoTema();
    this.carga();
    this.barredor = setInterval(() => this.barre(), 6 * 3600 * 1000); if (this.barredor.unref) this.barredor.unref();
  }

  // ---------- claves VAPID (P-256), una vez ----------
  cargaClaves() {
    const f = path.join(this.dir, 'vapid.json');
    try { const j = JSON.parse(fs.readFileSync(f, 'utf8')); if (j && j.privada && j.publica) return j; } catch (_) {}
    const k = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    const jwk = k.privateKey.export({ format: 'jwk' });
    const j = { publica: b64u(Buffer.concat([Buffer.from([4]), deB64u(jwk.x), deB64u(jwk.y)])), privada: k.privateKey.export({ format: 'pem', type: 'pkcs8' }), creado: new Date().toISOString() };
    try { fs.writeFileSync(f, JSON.stringify(j), { mode: 0o600 }); } catch (e) { console.error('avisos: no se pudo guardar la clave VAPID', e.message); }
    return j;
  }
  get clavePublica() { return this.claves ? this.claves.publica : ''; }
  cargaSecretoTema() {
    const f = path.join(this.dir, 'secreto-tema');
    try { const h = fs.readFileSync(f, 'utf8').trim(); if (/^[0-9a-f]{64}$/.test(h)) return Buffer.from(h, 'hex'); } catch (_) {}
    const b = crypto.randomBytes(32);
    try { fs.writeFileSync(f, b.toString('hex'), { mode: 0o600 }); } catch (e) { console.error('avisos: no se pudo guardar el secreto de los temas', e.message); }
    return b;
  }
  // un tema distinto por suscripción, sala y tipo (32 caracteres URL-safe, el máximo del RFC 8030)
  tema(s, sala, tipoTema) { return b64u(crypto.createHmac('sha256', this.secretoTema).update(s.endpoint + '\n' + (sala || '') + '\n' + (tipoTema || '')).digest()).slice(0, 32); }

  // ---------- suscripciones ----------
  carga() {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(this.dir, 'suscripciones.json'), 'utf8'));
      for (const s of j || []) if (s && s.endpoint) this.pon(s.endpoint, s.p256dh, s.auth, s.salas || [], s.creado, s.usado, true);
    } catch (_) {}
  }
  guarda() {
    this.pendienteGuardar = true;
    if (this.guardando) return;
    this.guardando = setTimeout(() => {
      this.guardando = null; if (!this.pendienteGuardar) return; this.pendienteGuardar = false;
      const f = path.join(this.dir, 'suscripciones.json'), tmp = f + '.tmp';
      const datos = [...this.subs.values()].map((s) => ({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth, salas: [...s.salas], creado: s.creado, usado: s.usado }));
      try { fs.writeFileSync(tmp, JSON.stringify(datos), { mode: 0o600 }); fs.renameSync(tmp, f); } catch (e) { console.error('avisos: no se pudo guardar', e.message); }
    }, 1500);
    if (this.guardando.unref) this.guardando.unref();
  }
  pon(endpoint, p256dh, auth, salas, creado, usado, cargando) {
    if (typeof endpoint !== 'string' || !/^https:\/\/[^\s]{10,1500}$/.test(endpoint)) return null;
    if (!/^[A-Za-z0-9_-]{80,120}$/.test(String(p256dh || '')) || !/^[A-Za-z0-9_-]{16,32}$/.test(String(auth || ''))) return null;
    let s = this.subs.get(endpoint);
    if (!s) {
      if (this.subs.size >= MAX_SUBS) return null;
      s = { endpoint, p256dh, auth, salas: new Set(), id: crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 16), creado: creado || Date.now(), usado: usado || Date.now() };
      this.subs.set(endpoint, s);
    } else { s.p256dh = p256dh; s.auth = auth; s.usado = Date.now(); }
    // las salas que se piden sustituyen a las anteriores de esta dirección
    for (const sala of s.salas) { const c = this.porSala.get(sala); if (c) { c.delete(endpoint); if (!c.size) this.porSala.delete(sala); } }
    s.salas = new Set();
    for (const sala of (salas || []).slice(0, 64)) {
      if (!esHex(sala, 64)) continue;
      let c = this.porSala.get(sala); if (!c) { c = new Set(); this.porSala.set(sala, c); }
      if (!c.has(endpoint) && c.size >= MAX_POR_SALA) continue;
      c.add(endpoint); s.salas.add(sala);
    }
    if (!cargando) this.guarda();
    return s.id;
  }
  quita(endpoint) {
    const s = this.subs.get(endpoint); if (!s) return;
    for (const sala of s.salas) { const c = this.porSala.get(sala); if (c) { c.delete(endpoint); if (!c.size) this.porSala.delete(sala); } }
    this.subs.delete(endpoint); this.guarda();
  }
  barre() {
    const limite = Date.now() - DIAS * 24 * 3600 * 1000;
    for (const [e, s] of this.subs) if (s.usado < limite) this.quita(e);
    for (const [k, t] of this.ultimos) if (Date.now() - t > 3600 * 1000) this.ultimos.delete(k);
  }
  estado() { return { suscripciones: this.subs.size, salas: this.porSala.size }; }

  // ---------- avisar ----------
  // a todos los suscritos a la sala menos a quien avisa (su id); como mucho uno del mismo tipo cada 20 s por dirección y sala
  avisa(sala, excepto, tipo) {
    if (!esHex(sala, 64)) return { avisados: 0, silenciados: 0 };
    const c = this.porSala.get(sala); if (!c) return { avisados: 0, silenciados: 0 };
    // «contacto» (29 Oct 2026): alguien a quien añadiste por su Número GUARDIANA también te ha añadido (al «buzón» de tu número)
    tipo = tipo === 'llamada' ? 'llamada' : tipo === 'fin' ? 'fin' : tipo === 'contacto' ? 'contacto' : 'mensaje';
    let n = 0, sil = 0;
    for (const endpoint of c) {
      const s = this.subs.get(endpoint); if (!s || (excepto && s.id === excepto)) continue;
      const k = endpoint + '|' + sala + '|' + tipo, ahora = Date.now();
      if (this.ultimos.get(k) && ahora - this.ultimos.get(k) < (tipo === 'mensaje' ? SILENCIO_MENSAJE_MS : SILENCIO_MS)) { sil++; continue; }
      this.ultimos.set(k, ahora); n++;
      // «fin» va con el mismo topic que «llamada»: si el aviso de la llamada aún no había llegado al teléfono, lo sustituye
      this.envia(s, JSON.stringify({ tipo, sala, t: ahora }), tipo === 'llamada' ? 40 : tipo === 'fin' ? 120 : tipo === 'contacto' ? 2 * 24 * 3600 : 900, tipo === 'llamada' ? 'high' : 'normal', sala, tipo === 'fin' ? 'llamada' : tipo).catch(() => {});
    }
    return { avisados: n, silenciados: sil };
  }

  // a una sola suscripción (la de quien tiene la app en segundo plano), con el mismo silencio entre avisos
  avisaA(sala, id, tipo) {
    if (!esHex(sala, 64) || !id) return 0;
    const c = this.porSala.get(sala); if (!c) return 0;
    tipo = tipo === 'llamada' ? 'llamada' : 'mensaje';
    for (const endpoint of c) {
      const s = this.subs.get(endpoint); if (!s || s.id !== id) continue;
      const k = endpoint + '|' + sala + '|' + tipo, ahora = Date.now();
      if (this.ultimos.get(k) && ahora - this.ultimos.get(k) < SILENCIO_MS) return 0;
      this.ultimos.set(k, ahora);
      this.envia(s, JSON.stringify({ tipo, sala, t: ahora }), 900, 'normal', sala).catch(() => {});
      return 1;
    }
    return 0;
  }

  // ---------- Web Push: VAPID (RFC 8292) y cifrado aes128gcm (RFC 8291) ----------
  firma(audiencia) {
    const cab = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
    const cuerpo = b64u(JSON.stringify({ aud: audiencia, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: this.remitente }));
    const datos = cab + '.' + cuerpo;
    const sig = crypto.sign('sha256', Buffer.from(datos), { key: this.claves.privada, dsaEncoding: 'ieee-p1363' });
    return datos + '.' + b64u(sig);
  }
  cifra(s, texto) {
    const uaPub = deB64u(s.p256dh), auth = deB64u(s.auth);
    const ecdh = crypto.createECDH('prime256v1'); const asPub = ecdh.generateKeys();
    const compartido = ecdh.computeSecret(uaPub);
    const info = Buffer.concat([Buffer.from('WebPush: info\0'), uaPub, asPub]);
    const ikm = Buffer.from(crypto.hkdfSync('sha256', compartido, auth, info, 32));
    const sal = crypto.randomBytes(16);
    const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, sal, Buffer.from('Content-Encoding: aes128gcm\0'), 16));
    const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, sal, Buffer.from('Content-Encoding: nonce\0'), 12));
    const claro = Buffer.concat([Buffer.from(texto, 'utf8'), Buffer.from([2])]); // el último registro acaba en 0x02
    const cf = crypto.createCipheriv('aes-128-gcm', cek, nonce);
    const cifrado = Buffer.concat([cf.update(claro), cf.final(), cf.getAuthTag()]);
    const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
    return Buffer.concat([sal, rs, Buffer.from([asPub.length]), asPub, cifrado]);
  }
  envia(s, texto, ttl, urgencia, sala, tipoTema) {
    return new Promise((res) => {
      let u; try { u = new URL(s.endpoint); } catch (_) { return res(false); }
      let cuerpo; try { cuerpo = this.cifra(s, texto); } catch (e) { return res(false); }
      // un «topic» por suscripción, sala y tipo: con el teléfono sin cobertura, el aviso de un chat no borra el de otro, y el
      // servicio de push no ve dos teléfonos con la misma etiqueta
      const tema = this.tema(s, sala, tipoTema);
      const cab = {
        'content-type': 'application/octet-stream', 'content-encoding': 'aes128gcm', 'content-length': cuerpo.length,
        ttl: String(ttl || 60), urgency: urgencia || 'normal', topic: tema,
        authorization: 'vapid t=' + this.firma(u.origin) + ', k=' + this.claves.publica,
      };
      const req = https.request({ method: 'POST', hostname: u.hostname, port: u.port || 443, path: u.pathname + u.search, headers: cab, timeout: 10000 }, (r) => {
        r.resume();
        r.on('end', () => {
          if (r.statusCode === 404 || r.statusCode === 410) this.quita(s.endpoint); // dirección muerta
          else if (r.statusCode >= 200 && r.statusCode < 300) { s.usado = Date.now(); }
          res(r.statusCode >= 200 && r.statusCode < 300);
        });
      });
      req.on('error', () => res(false)); req.on('timeout', () => { try { req.destroy(); } catch (_) {} res(false); });
      req.end(cuerpo);
    });
  }
}

module.exports = { Avisos };
