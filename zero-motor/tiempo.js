// 1718 (house1718.com) · el tiempo de conversación, contado en el servidor (dueño, 25 nov 2026, 08:30–08:31: «2 minutos de cortesía…
// luego que tengan que hacer el pago para llamar… que nadie pueda hackear ni pasar la cuenta… ni con VPN… que no haya ningún hackeo de
// que la gente pueda utilizarlo gratis»; 08:33: «Sí, cámbialo» y «2 minutos»).
//
//  · Solo para las conexiones de la web de 1718. Comunicaciones de GUARDIANA sigue exactamente igual.
//  · Cuenta el tiempo en que hay dos personas (o más) en la misma conversación, por minutos empezados y por adelantado: el relé cobra
//    el minuto siguiente antes de que se acabe el que corre. Lo que diga la página no cambia nada: el relé lo ve solo.
//  · Paga primero un código de compra (Dodo Payments): cada código vale 60 minutos y cada minuto es una ACTIVACIÓN del código en Dodo
//    (el límite de activaciones del producto es 60). Así la cuenta la lleva Dodo, es la misma para todos los servidores, sobrevive a
//    los reinicios y nadie puede borrarla: para liberar una activación hace falta su identificador, que solo conoce este servidor.
//    Los códigos de quien llegó antes a la conversación pagan primero (paga quien invita); si no tiene, los de la otra persona.
//  · Si nadie tiene código, la cortesía: 2 minutos al día por dirección de internet (IPv6: por su /64), y un minuto gratis gasta la
//    cortesía de todos los que están. Recargar, otro navegador, otra conversación o el modo privado no dan más; otra dirección (VPN)
//    da otros 2 minutos como mucho, y la llamada se vuelve a cortar.
//  · Sin tiempo, el relé no pasa nada de esa conversación (ni chat, ni llamada, ni archivos) y no da credenciales de llamada (TURN);
//    las que dio caducan cuando se acaba lo cubierto, y coturn deja de renovar la llamada.
//  · No guarda quién es nadie: en disco, solo un resumen (SHA-256) de cada código con sus minutos usados (para enseñar el saldo); la
//    cortesía vive en memoria, con la dirección resumida con una clave de este arranque, y se olvida a las 24 horas.
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// (en las pruebas, COM_TIEMPO_MINUTO_MS acorta «el minuto» para no esperar minutos de verdad)
const MIN_MS = +process.env.COM_TIEMPO_MINUTO_MS || 60 * 1000;
const CORTESIA_MIN = +process.env.COM_TIEMPO_CORTESIA_MIN || 2;   // 2 minutos (dueño, 25 nov 2026, 08:33)
const MINUTOS_CODIGO = +process.env.COM_TIEMPO_MINUTOS || 60;    // cada código, 1 hora
const DIA_MS = 24 * 3600 * 1000;
const ANTES_MS = Math.min(8000, MIN_MS / 4);   // el minuto siguiente se cobra 8 s antes de que se acabe el que corre
const PROVISIONAL_MS = 15000;       // mientras Dodo contesta el primer cobro, la conversación puede empezar
const GRACIA_MAX = 3;               // si Dodo no contesta, como mucho tres minutos fiados seguidos
const MAX_CODIGOS_CONEXION = 20;
const VALIDACIONES_MIN = 8;         // códigos nuevos que una conexión puede pedir comprobar por minuto
const PAR_MS = 120 * 1000;          // la sala de «Pasar al teléfono» (dos aparatos de la misma persona): 2 minutos y 16 MB, gratis
const PAR_BYTES = 16 * 1024 * 1024;
const esCodigo = (s) => typeof s === 'string' && s.length >= 8 && s.length <= 100 && /^[A-Za-z0-9_-]+$/.test(s);

class Tiempo {
  constructor(o) {
    o = o || {};
    this.api = String(o.api || process.env.COM_TIEMPO_API || 'https://live.dodopayments.com').replace(/\/$/, '');
    this.cortesiaMin = o.cortesia || CORTESIA_MIN;
    this.minutoMs = MIN_MS;
    this.minutos = o.minutos || MINUTOS_CODIGO;
    this.dir = o.dir || process.env.COM_TIEMPO_DIR || path.join(__dirname, '..', '..', 'datos-com', 'tiempo');
    this.salt = crypto.randomBytes(32);                 // de este arranque: las direcciones no se pueden reconstruir
    this.ips = new Map();                               // dirección resumida → { usado (s), desde }
    this.codigos = new Map();                           // código → { h, estado: '?'|'ok'|'mal', u (minutos usados), fin, visto }
    this.usos = new Map();                              // resumen → { u, f } (lo que hay en disco)
    this.salas = new Map();                             // sala → { hasta, provisional, de, cobrando, agotado, avisado, gracia, par, creada, bytes }
    this.alAgotar = null; this.alCubrir = null;         // los pone el relé (avisar a la conversación)
    try { fs.mkdirSync(this.dir, { recursive: true, mode: 0o700 }); } catch (e) { console.error('tiempo: sin carpeta', this.dir, e.message); }
    try { const j = JSON.parse(fs.readFileSync(path.join(this.dir, 'codigos.json'), 'utf8')); for (const [h, x] of Object.entries(j || {})) if (/^[0-9a-f]{64}$/.test(h)) this.usos.set(h, { u: Math.max(0, +x.u || 0), f: x.f ? 1 : 0 }); } catch (_) {}
  }

  // ---------- quién es «la misma dirección» ----------
  clave(ip) {
    let s = String(ip || '').trim().toLowerCase().replace(/^::ffff:/, '');
    if (s.includes(':')) {                                  // IPv6: los cuatro primeros grupos (/64), que es lo que tiene una casa o un móvil
      const partes = s.split('::'); const izq = partes[0] ? partes[0].split(':') : []; const der = partes[1] ? partes[1].split(':') : [];
      const todo = partes.length > 1 ? izq.concat(Array(Math.max(0, 8 - izq.length - der.length)).fill('0'), der) : izq;
      s = todo.slice(0, 4).map((x) => (parseInt(x || '0', 16) || 0).toString(16)).join(':') + '::/64';
    }
    return crypto.createHmac('sha256', this.salt).update(s).digest('hex').slice(0, 32);
  }
  // minutos de cortesía que le quedan hoy a esta dirección
  cortesiaResto(k) {
    const x = this.ips.get(k); if (!x || Date.now() - x.desde > DIA_MS) return this.cortesiaMin;
    return Math.max(0, this.cortesiaMin - x.usado);
  }
  gastaCortesia(k) {
    let x = this.ips.get(k); if (!x || Date.now() - x.desde > DIA_MS) { x = { usado: 0, desde: Date.now() }; this.ips.set(k, x); }
    x.usado += 1;
  }

  // ---------- los códigos ----------
  h(k) { return crypto.createHash('sha256').update(k).digest('hex'); }
  entrada(k) {
    let e = this.codigos.get(k);
    if (!e) { const h = this.h(k), d = this.usos.get(h) || { u: 0, f: 0 }; e = { h, estado: '?', u: d.u, fin: !!d.f, visto: 0 }; this.codigos.set(k, e); }
    return e;
  }
  restoCodigo(e) { return !e || e.estado === 'mal' || e.fin ? 0 : Math.max(0, this.minutos - e.u); }
  guarda() {
    if (this.guardando) { this.otraVez = true; return; }
    this.guardando = true;
    setTimeout(() => {
      const datos = {}; for (const [h, x] of this.usos) datos[h] = x;
      const f = path.join(this.dir, 'codigos.json'), tmp = f + '.tmp';
      fs.writeFile(tmp, JSON.stringify(datos), { mode: 0o600 }, (e) => {
        if (!e) fs.rename(tmp, f, () => {}); else console.error('tiempo: no se pudo guardar', e.message);
        this.guardando = false; if (this.otraVez) { this.otraVez = false; this.guarda(); }
      });
    }, 500);
  }
  apunta(e) { this.usos.set(e.h, { u: e.u, f: e.fin ? 1 : 0 }); this.guarda(); }

  async pide(ruta, cuerpo) {
    const r = await fetch(this.api + ruta, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo), signal: AbortSignal.timeout(8000) });
    let j = null; try { j = await r.json(); } catch (_) {}
    return { status: r.status, j };
  }
  // ¿es un código de verdad, activo y sin caducar? (endpoint público de Dodo: no hace falta ninguna clave secreta)
  async valida(k) {
    const e = this.entrada(k);
    if (e.estado !== '?' && Date.now() - e.visto < 10 * MIN_MS) return e;
    try { const r = await this.pide('/licenses/validate', { license_key: k }); if (r.status === 200 && r.j) { e.estado = r.j.valid ? 'ok' : 'mal'; e.visto = Date.now(); } else if (r.status === 404 || r.status === 422 || r.status === 400) { e.estado = 'mal'; e.visto = Date.now(); } }
    catch (_) { /* sin respuesta: se queda como estaba y se vuelve a mirar al cobrar */ }
    return e;
  }
  // un minuto: una activación. 'ok' · 'fin' (ya no le quedan) · 'mal' (no vale: no existe, devuelto, caducado) · 'red' (no contesta)
  async activa(k) {
    try {
      const r = await this.pide('/licenses/activate', { license_key: k, name: '1718' });
      if (r.status >= 200 && r.status < 300) return 'ok';
      if (r.status === 422) return 'fin';
      if (r.status === 403 || r.status === 404 || r.status === 400) return 'mal';
      return 'red';
    } catch (_) { return 'red'; }
  }

  // la página dice qué códigos tiene en este aparato; se comprueban (con un tope) y se apuntan a la conexión
  async ponCodigos(c, lista) {
    const ahora = Date.now();
    if (!c.validaciones || ahora - c.validaciones.desde > MIN_MS) c.validaciones = { desde: ahora, n: 0 };
    const nuevos = [...new Set((Array.isArray(lista) ? lista : []).map(String).filter(esCodigo))].slice(0, MAX_CODIGOS_CONEXION);
    // (los que no valen o no se han podido mirar no se apuntan, pero la respuesta lo dice: así la página avisa y los borra)
    const buenos = [], otros = {};
    for (const k of nuevos) {
      const e = this.codigos.get(k);
      if (!e || e.estado === '?') { if (++c.validaciones.n > VALIDACIONES_MIN) { otros[k] = 'espera'; continue; } }
      const x = await this.valida(k);
      if (x.estado !== 'mal') buenos.push(k); else otros[k] = 'mal';
    }
    c.codigos = buenos;
    const r = this.saldo(c); Object.assign(r.estados, otros); return r;
  }
  saldo(c) {
    let min = 0, validos = 0; const estados = {};
    for (const k of c.codigos || []) { const e = this.codigos.get(k); const r = this.restoCodigo(e); if (e && e.estado !== 'mal') validos++; if (e && e.estado === 'ok') min += r; estados[k] = !e || e.estado === '?' ? '?' : e.estado === 'mal' ? 'mal' : r > 0 ? r : 0; } // ('?': Dodo aún no lo ha confirmado)
    return { validos, minutos: min, estados };
  }

  // ---------- la conversación ----------
  sala(id) { let t = this.salas.get(id); if (!t) { t = { hasta: 0, provisional: 0, de: '', cobrando: false, agotado: false, avisado: false, gracia: 0, par: false, creada: Date.now(), bytes: 0 }; this.salas.set(id, t); } return t; }
  cubierta(id) {
    const t = this.salas.get(id); if (!t) return false;
    const ahora = Date.now();
    if (t.par) return ahora - t.creada < PAR_MS && t.bytes < PAR_BYTES;
    return ahora < Math.max(t.hasta, t.provisional) + 3000;
  }
  // lo que queda, contando lo ya cobrado y lo que se podría cobrar con lo que hay (para el contador de la página y la caducidad del TURN)
  resto(id, miembros) {
    const t = this.salas.get(id); if (!t) return 0;
    const ahora = Date.now(), cubierto = Math.max(0, t.hasta - ahora);
    if (t.de === 'codigo') { let m = 0; const vistos = new Set(); for (const c of miembros) for (const k of c.codigos || []) { if (vistos.has(k)) continue; vistos.add(k); m += this.restoCodigo(this.codigos.get(k)); } return cubierto + m * MIN_MS; }
    if (t.de === 'cortesia') { let m = Infinity; for (const k of new Set(miembros.map((c) => c.ipc).filter(Boolean))) m = Math.min(m, this.cortesiaResto(k)); return cubierto + (m === Infinity ? 0 : m) * MIN_MS; }
    return cubierto;
  }

  // cobra el minuto siguiente (o el primero). miembros: las conexiones de la sala, por orden de llegada
  async cobra(id, miembros) {
    const t = this.sala(id);
    if (t.cobrando || t.par) return;
    t.cobrando = true;
    try {
      const desde = () => Math.max(Date.now(), t.hasta);
      // 1) los códigos, por orden de llegada
      const vistos = new Set();
      for (const c of miembros) for (const k of c.codigos || []) {
        if (vistos.has(k)) continue; vistos.add(k);
        const e = this.codigos.get(k); if (!e || e.estado === 'mal' || e.fin || this.restoCodigo(e) <= 0) continue;
        const r = await this.activa(k);
        if (r === 'ok') { e.u += 1; if (e.u >= this.minutos) e.fin = true; e.estado = 'ok'; this.apunta(e); t.hasta = desde() + MIN_MS; t.de = 'codigo'; t.gracia = 0; t.agotado = false; t.avisado = false; return this.cubre(id); }
        if (r === 'fin') { e.fin = true; e.u = Math.max(e.u, this.minutos); this.apunta(e); continue; }
        if (r === 'mal') { e.estado = 'mal'; e.visto = Date.now(); continue; }
        // Dodo no contesta: el minuto se fía (como mucho tres seguidos); si sigue sin contestar, se corta
        if (t.gracia < GRACIA_MAX) { t.gracia++; t.hasta = desde() + MIN_MS; t.de = 'codigo'; t.agotado = false; t.avisado = false; return this.cubre(id); }
      }
      // 2) la cortesía: la de todas las direcciones que están en la conversación
      const ks = [...new Set(miembros.map((c) => c.ipc).filter(Boolean))];
      if (ks.length && ks.every((k) => this.cortesiaResto(k) >= 1)) {
        for (const k of ks) this.gastaCortesia(k);
        t.hasta = desde() + MIN_MS; t.de = 'cortesia'; t.agotado = false; t.avisado = false;
        return this.cubre(id);
      }
      // 3) sin tiempo
      t.agotado = true; t.provisional = 0;
      if (Date.now() >= t.hasta && !t.avisado) { t.avisado = true; if (this.alAgotar) this.alAgotar(id, t); }
    } finally { t.cobrando = false; }
  }
  cubre(id) { const t = this.salas.get(id); if (t) t.provisional = 0; if (this.alCubrir) this.alCubrir(id, t); }

  // cada 2 s, desde el relé: las conversaciones con dos o más personas
  vigila(id, miembros) {
    const t = this.sala(id); if (t.par || t.cobrando) return;
    const ahora = Date.now();
    if (!t.agotado && ahora >= t.hasta - ANTES_MS) { if (!t.hasta && !t.provisional) t.provisional = ahora + PROVISIONAL_MS; this.cobra(id, miembros); return; }
    if (t.agotado && ahora >= t.hasta && !t.avisado) { t.avisado = true; if (this.alAgotar) this.alAgotar(id, t); }
  }
  // códigos nuevos en una conversación sin tiempo: se vuelve a intentar al momento
  reintenta(id, miembros) { const t = this.salas.get(id); if (!t || t.par) return; if (t.agotado || Date.now() >= t.hasta - ANTES_MS) { t.agotado = false; t.avisado = false; this.cobra(id, miembros); } }

  barre(vivas) {
    const ahora = Date.now();
    for (const [id, t] of this.salas) if (!vivas.has(id) && ahora - Math.max(t.hasta, t.creada) > 10 * MIN_MS) this.salas.delete(id);
    for (const [k, x] of this.ips) if (ahora - x.desde > DIA_MS) this.ips.delete(k);
    // los códigos en memoria: solo mientras alguna conexión los tenga (la clave en claro no se guarda en ningún sitio)
    if (this.codigos.size > 5000) for (const [k, e] of this.codigos) if (ahora - e.visto > 60 * MIN_MS) this.codigos.delete(k);
  }
  estado() { return { salas: this.salas.size, direcciones: this.ips.size, codigos: this.usos.size, api: this.api.replace(/^https?:\/\//, '') }; }
}

module.exports = { Tiempo, CORTESIA_MIN, MINUTOS_CODIGO };
