// GUARDIANA · Comunicaciones · relé (26 Oct 2026).
//
// Pasa tramas entre los miembros de una «sala» y no guarda nada: ni mensajes, ni nombres, ni claves. Todo lo que
// cruza por aquí viene sellado por las páginas (AES-256-GCM con claves que el relé nunca ve); el relé solo sabe
// qué conexiones comparten una sala y cuántos bytes mueven. Cuando la última conexión se va, la sala deja de existir.
//
// También reparte las credenciales del servicio de llamadas (TURN, coturn en este mismo servidor) para que una llamada
// vaya siempre por el relé y ninguno de los dos extremos vea la dirección del otro. Las credenciales caducan solas.
//
// Protocolo (WebSocket en /com):
//   texto  → JSON: {t:'hola'} · {t:'entra', sala, yo} · {t:'sale', sala} · {t:'ping'}
//   binario → [0x01][32 bytes sala][8 bytes destinatario o ceros = todos][carga]  (del cliente al relé)
//             [0x02][32 bytes sala][8 bytes remitente][carga]                     (del relé a los demás)
//   sala: 64 hexadecimales (la página la deriva de la invitación; la clave no viaja); yo: 16 hexadecimales.
'use strict';
const crypto = require('crypto');

const MAX_MIEMBROS = 8;          // personas por sala (conversaciones pequeñas; nada de canales)
const MAX_SALAS_CONEXION = 64;   // salas abiertas por una misma conexión
const MAX_SALAS = 20000;         // salas vivas en el relé
const MAX_CONEXIONES = 4000;
const RITMO_BPS = 8 * 1024 * 1024;        // bytes por segundo sostenidos por conexión
const RAFAGA = 32 * 1024 * 1024;          // y de golpe
const ATASCO = 16 * 1024 * 1024;          // bytes aún por entregar a un destinatario a partir de los cuales se le descarta la trama
const SIN_VIDA_MS = 95 * 1000;            // la página hace ping cada 25 s
const TURN_HORAS = 12;

const esHex = (s, n) => typeof s === 'string' && s.length === n && /^[0-9a-f]+$/.test(s);

class Rele {
  constructor(o) {
    o = o || {};
    this.turnHost = o.turnHost || '';
    this.turnSecreto = o.turnSecreto || '';
    this.turnPuerto = o.turnPuerto || 3478;
    this.region = o.region || '';
    this.salas = new Map();       // id hex → Map(yo hex → cliente)
    this.conexiones = new Set();
    this.vigila = setInterval(() => this.barre(), 30 * 1000);
    if (this.vigila.unref) this.vigila.unref();
  }

  get llamadas() { return !!(this.turnHost && this.turnSecreto); }

  estado() { return { salas: this.salas.size, conexiones: this.conexiones.size, llamadas: this.llamadas }; }

  // Credenciales TURN de vida corta (RFC 8489 + «TURN REST API»: usuario «caducidad:etiqueta», clave HMAC-SHA1 del secreto)
  ice() {
    if (!this.llamadas) return { ice: [], caduca: 0 };
    const caduca = Math.floor(Date.now() / 1000) + TURN_HORAS * 3600;
    const username = caduca + ':' + crypto.randomBytes(4).toString('hex');
    const credential = crypto.createHmac('sha1', this.turnSecreto).update(username).digest('base64');
    const h = this.turnHost + ':' + this.turnPuerto;
    return { ice: [{ urls: ['turn:' + h + '?transport=udp', 'turn:' + h + '?transport=tcp'], username, credential }], caduca };
  }

  acepta(ws) {
    if (this.conexiones.size >= MAX_CONEXIONES) { ws.cierra(); return; }
    const c = { ws, salas: new Set(), yo: new Map(), cupo: RAFAGA, ultimo: Date.now(), vivo: Date.now(), bytes: 0 };
    this.conexiones.add(c);
    ws.on('message', (m, bin) => { c.vivo = Date.now(); if (bin) this.trama(c, m); else this.texto(c, m); });
    ws.on('close', () => this.despide(c));
  }

  texto(c, s) {
    if (typeof s !== 'string' || s.length > 4096) return;
    let m; try { m = JSON.parse(s); } catch (_) { return; }
    if (!m || typeof m !== 'object') return;
    switch (m.t) {
      case 'hola': {
        const t = this.ice();
        c.ws.json({ t: 'hola', v: 1, region: this.region, llamadas: this.llamadas, ice: t.ice, caduca: t.caduca });
        return;
      }
      case 'ice': { const t = this.ice(); c.ws.json({ t: 'ice', ice: t.ice, caduca: t.caduca }); return; }
      case 'entra': return this.entra(c, m.sala, m.yo);
      case 'sale': return this.sale(c, m.sala, true);
      case 'ping': c.ws.json({ t: 'pong' }); return;
      default: return;
    }
  }

  entra(c, sala, yo) {
    if (!esHex(sala, 64) || !esHex(yo, 16)) return c.ws.json({ t: 'error', sala, por: 'formato' });
    if (c.salas.has(sala)) return c.ws.json({ t: 'sala', sala, miembros: this.otros(sala, yo) });
    if (c.salas.size >= MAX_SALAS_CONEXION) return c.ws.json({ t: 'error', sala, por: 'demasiadas salas' });
    let s = this.salas.get(sala);
    if (!s) {
      if (this.salas.size >= MAX_SALAS) return c.ws.json({ t: 'error', sala, por: 'relé lleno' });
      s = new Map(); this.salas.set(sala, s);
    }
    if (s.has(yo)) {
      // la misma identidad vuelve (otra pestaña o reconexión): la nueva conexión sustituye a la vieja
      const vieja = s.get(yo);
      if (vieja !== c) { vieja.salas.delete(sala); vieja.yo.delete(sala); try { vieja.ws.json({ t: 'sustituido', sala }); } catch (_) {} }
    } else if (s.size >= MAX_MIEMBROS) return c.ws.json({ t: 'error', sala, por: 'sala llena' });
    s.set(yo, c); c.salas.add(sala); c.yo.set(sala, yo);
    c.ws.json({ t: 'sala', sala, miembros: this.otros(sala, yo) });
    for (const [id, otro] of s) if (id !== yo && otro !== c) { try { otro.ws.json({ t: 'llega', sala, quien: yo }); } catch (_) {} }
  }

  otros(sala, yo) { const s = this.salas.get(sala); return s ? [...s.keys()].filter((k) => k !== yo) : []; }

  sale(c, sala, avisa) {
    if (!c.salas.has(sala)) return;
    const yo = c.yo.get(sala);
    c.salas.delete(sala); c.yo.delete(sala);
    const s = this.salas.get(sala);
    if (!s) return;
    if (s.get(yo) === c) s.delete(yo);
    if (!s.size) this.salas.delete(sala);
    else for (const otro of s.values()) { try { otro.ws.json({ t: 'sale', sala, quien: yo }); } catch (_) {} }
    if (avisa) { try { c.ws.json({ t: 'fuera', sala }); } catch (_) {} }
  }

  despide(c) {
    if (!this.conexiones.has(c)) return;
    this.conexiones.delete(c);
    for (const sala of [...c.salas]) this.sale(c, sala, false);
  }

  // Cupo de bytes por conexión (cubo de fichas): quien pasa del ritmo ve descartadas sus tramas y recibe «lento»
  cabe(c, n) {
    const ahora = Date.now();
    c.cupo = Math.min(RAFAGA, c.cupo + (ahora - c.ultimo) * RITMO_BPS / 1000); c.ultimo = ahora;
    if (c.cupo < n) return false;
    c.cupo -= n; return true;
  }

  trama(c, b) {
    if (!Buffer.isBuffer(b) || b.length < 41 || b[0] !== 0x01) return;
    const sala = b.subarray(1, 33).toString('hex');
    if (!c.salas.has(sala)) return c.ws.json({ t: 'error', sala, por: 'no estás en la sala' });
    if (!this.cabe(c, b.length)) return c.ws.json({ t: 'lento', sala });
    const s = this.salas.get(sala); if (!s) return;
    const yo = c.yo.get(sala);
    const para = b.subarray(33, 41);
    const todos = para.every((x) => x === 0);
    const salida = Buffer.allocUnsafe(b.length);
    salida[0] = 0x02; b.copy(salida, 1, 1, 33); Buffer.from(yo, 'hex').copy(salida, 33); b.copy(salida, 41, 41);
    c.bytes += b.length;
    if (todos) {
      for (const [id, otro] of s) if (id !== yo) this.entrega(c, otro, sala, id, salida);
    } else {
      const id = para.toString('hex');
      const otro = s.get(id);
      if (!otro || id === yo) return c.ws.json({ t: 'ausente', sala, quien: id });
      this.entrega(c, otro, sala, id, salida);
    }
  }

  entrega(de, a, sala, id, salida) {
    if (!a.ws.abierto) return;
    if (a.ws.atraso > ATASCO) { try { de.ws.json({ t: 'atasco', sala, quien: id }); } catch (_) {} return; }
    try { a.ws.send(salida); } catch (_) {}
  }

  barre() {
    const ahora = Date.now();
    for (const c of this.conexiones) if (ahora - c.vivo > SIN_VIDA_MS) { try { c.ws.cierra(); } catch (_) {} this.despide(c); }
  }
}

module.exports = { Rele };
