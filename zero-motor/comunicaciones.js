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
const { Avisos } = require('./avisos');

const MAX_MIEMBROS = 8;          // personas por sala (conversaciones pequeñas; nada de canales)
const MAX_SALAS_CONEXION = 64;   // salas abiertas por una misma conexión
const MAX_SALAS = 20000;         // salas vivas en el relé
const MAX_CONEXIONES = 4000;
const RITMO_BPS = 8 * 1024 * 1024;        // bytes por segundo sostenidos por conexión
const RAFAGA = 32 * 1024 * 1024;          // y de golpe
// Sesión blindada (27 Oct 2026): sin el límite de 8 MB/s. Manda la línea de cada persona; el relé solo pone un techo
// alto para que una conexión no se quede con todo el servidor, y un máximo de conexiones blindadas a la vez.
const RITMO_B = 64 * 1024 * 1024;
const RAFAGA_B = 128 * 1024 * 1024;
const MAX_BLINDADAS = 64;
const ATASCO = 16 * 1024 * 1024;          // bytes aún por entregar a un destinatario a partir de los cuales se le descarta la trama
const SIN_VIDA_MS = 95 * 1000;            // la página hace ping cada 25 s
const TURN_HORAS = 12;
// Códigos de invitación (dueño, 26 Oct 19:59: «un número en pantalla y la otra persona lo pone»): 9 cifras, 10 minutos,
// una sola vez. El relé guarda solo un «sobre» (el secreto de la conversación cerrado con una clave derivada del código
// en el navegador de quien invita): el relé no puede abrirlo sin adivinar el código, y quien lo busca tiene pocos intentos.
const CODIGO_MIN = 10;
const BUSQUEDAS_MIN = 6;            // intentos de búsqueda por conexión y minuto
const MAX_CODIGOS = 50000;

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
    this.coturn = { activo: false, escucha: false, visto: null };
    this.codigos = new Map();     // código → { sobre, sal, de (conexión), creado }
    // avisos fuera de la app (29 Oct 2026): Web Push, sin contenido; ver avisos.js
    this.avisos = o.avisos === null ? null : (o.avisos || new Avisos({ dir: o.avisosDir, remitente: o.remitente }));
    if (this.turnHost && this.turnSecreto) { this.compruebaCoturn(); const t = setInterval(() => this.compruebaCoturn(), 60 * 1000); if (t.unref) t.unref(); }
    this.vigila = setInterval(() => this.barre(), 30 * 1000);
    if (this.vigila.unref) this.vigila.unref();
  }

  // Hay llamadas solo si hay secreto y coturn está de verdad activo en este servidor (se comprueba cada minuto)
  get llamadas() { return !!(this.turnHost && this.turnSecreto && this.coturn.activo); }

  estado() { let b = 0; for (const x of this.conexiones) if (x.blindada) b++; return { salas: this.salas.size, conexiones: this.conexiones.size, blindadas: b, codigos: this.codigos.size, llamadas: this.llamadas, coturn: this.coturn, avisos: this.avisos ? this.avisos.estado() : null }; }

  compruebaCoturn() {
    const { execFile } = require('child_process');
    const r = { activo: false, escucha: false, visto: new Date().toISOString() };
    execFile('systemctl', ['is-active', 'coturn'], { timeout: 4000 }, (e, out) => {
      r.activo = String(out || '').trim() === 'active';
      execFile('ss', ['-Hlnu', 'sport = :' + this.turnPuerto], { timeout: 4000 }, (e2, out2) => {
        r.escucha = /:(\d+)/.test(String(out2 || ''));
        // si no está activo, la última línea útil del registro de instalación o de estado (sin direcciones)
        if (!r.activo) { try { const fs = require('fs'); for (const f of ['/var/log/guardiana-coturn-estado.log', '/var/log/guardiana-coturn-instalacion.log']) { if (fs.existsSync(f)) { const l = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean); r.nota = (r.nota ? r.nota + ' | ' : '') + f.replace(/.*guardiana-coturn-/, '') + ': ' + l.slice(-2).join(' / ').slice(0, 300); } } } catch (_) {} }
        this.coturn = r;
      });
    });
  }

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
        c.ws.json({ t: 'hola', v: 1, region: this.region, llamadas: this.llamadas, ice: t.ice, caduca: t.caduca, avisos: this.avisos ? this.avisos.clavePublica : '' });
        return;
      }
      case 'ice': { const t = this.ice(); c.ws.json({ t: 'ice', ice: t.ice, caduca: t.caduca }); return; }
      case 'entra': return this.entra(c, m.sala, m.yo, m.b === 1);
      case 'sale': return this.sale(c, m.sala, true);
      case 'ping': c.ws.json({ t: 'pong' }); return;
      case 'invita': return this.invita(c, m);
      case 'retira': { const r = this.codigos.get(String(m.codigo)); if (r && r.de === c) this.codigos.delete(String(m.codigo)); return; }
      case 'busca': return this.busca(c, m);
      // avisos fuera de la app (29 Oct 2026): la suscripción del navegador con sus salas, y «despierta» a quien no está
      case 'avisos': return this.suscribe(c, m);
      case 'despierta': return this.despierta(c, m);
      default: return;
    }
  }

  entra(c, sala, yo, blindada) {
    if (!esHex(sala, 64) || !esHex(yo, 16)) return c.ws.json({ t: 'error', sala, por: 'formato' });
    if (blindada && !c.blindada) { let n = 0; for (const x of this.conexiones) if (x.blindada) n++; if (n < MAX_BLINDADAS) { c.blindada = true; c.cupo = RAFAGA_B; } }
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

  invita(c, m) {
    const codigo = String(m.codigo || ''), sobre = String(m.sobre || ''), sal = String(m.sal || '');
    if (!/^\d{9}$/.test(codigo) || !/^[A-Za-z0-9_-]{40,200}$/.test(sobre) || !/^[A-Za-z0-9_-]{16,64}$/.test(sal)) return c.ws.json({ t: 'invita', codigo, ok: false, por: 'formato' });
    if (this.codigos.has(codigo)) return c.ws.json({ t: 'invita', codigo, ok: false, por: 'repetido' });
    if (this.codigos.size >= MAX_CODIGOS) return c.ws.json({ t: 'invita', codigo, ok: false, por: 'relé lleno' });
    let mios = 0; for (const r of this.codigos.values()) if (r.de === c) mios++;
    if (mios >= 10) return c.ws.json({ t: 'invita', codigo, ok: false, por: 'demasiados códigos' });
    this.codigos.set(codigo, { sobre, sal, de: c, creado: Date.now() });
    c.ws.json({ t: 'invita', codigo, ok: true, caduca: Date.now() + CODIGO_MIN * 60 * 1000 });
  }
  busca(c, m) {
    const codigo = String(m.codigo || '').replace(/\D/g, '');
    const ahora = Date.now();
    if (!c.busquedas || ahora - c.busquedas.desde > 60 * 1000) c.busquedas = { desde: ahora, n: 0 };
    if (++c.busquedas.n > BUSQUEDAS_MIN) return c.ws.json({ t: 'busca', ok: false, por: 'demasiados intentos' });
    const r = this.codigos.get(codigo);
    if (!r || ahora - r.creado > CODIGO_MIN * 60 * 1000) { if (r) this.codigos.delete(codigo); return c.ws.json({ t: 'busca', ok: false, por: 'no vale' }); }
    this.codigos.delete(codigo); // una sola vez: quien lo busca primero se lo lleva
    c.ws.json({ t: 'busca', ok: true, sobre: r.sobre, sal: r.sal });
    try { r.de.ws.json({ t: 'codigo-usado', codigo }); } catch (_) {}
  }

  suscribe(c, m) {
    if (!this.avisos) return c.ws.json({ t: 'avisos', ok: false, por: 'sin avisos' });
    const sub = m && m.sub && typeof m.sub === 'object' ? m.sub : null;
    if (!sub) { if (c.avisoId) { c.avisoId = null; } return c.ws.json({ t: 'avisos', ok: false, por: 'formato' }); }
    if (m.quitar === 1) { this.avisos.quita(String(sub.endpoint || '')); c.avisoId = null; return c.ws.json({ t: 'avisos', ok: true, quitado: true }); }
    // solo salas en las que esta conexión está (o estará): las que manda la página, hasta 64
    const salas = Array.isArray(m.salas) ? m.salas.filter((x) => esHex(x, 64)).slice(0, 64) : [];
    const id = this.avisos.pon(String(sub.endpoint || ''), (sub.keys || {}).p256dh, (sub.keys || {}).auth, salas);
    if (!id) return c.ws.json({ t: 'avisos', ok: false, por: 'formato' });
    c.avisoId = id;
    c.ws.json({ t: 'avisos', ok: true, id, salas: salas.length });
  }
  // quien escribe o llama a una sala donde no está la otra persona pide que se le avise; como mucho uno cada 10 s por conexión
  despierta(c, m) {
    if (!this.avisos) return;
    const sala = String(m.sala || ''), tipo = m.tipo === 'llamada' ? 'llamada' : 'mensaje';
    if (!esHex(sala, 64) || !c.salas.has(sala)) return;
    const ahora = Date.now();
    if (c.despertoEn && ahora - c.despertoEn < 10 * 1000 && c.despertoTipo === tipo) return;
    c.despertoEn = ahora; c.despertoTipo = tipo;
    const n = this.avisos.avisa(sala, c.avisoId || null, tipo);
    c.ws.json({ t: 'despierta', sala, tipo, avisados: n });
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
    for (const [k, r] of this.codigos) if (r.de === c) this.codigos.delete(k); // sin la conexión de quien invita, el código no sirve
  }

  // Cupo de bytes por conexión (cubo de fichas): quien pasa del ritmo ve descartadas sus tramas y recibe «lento»
  cabe(c, n) {
    const ahora = Date.now();
    const ritmo = c.blindada ? RITMO_B : RITMO_BPS, rafaga = c.blindada ? RAFAGA_B : RAFAGA;
    c.cupo = Math.min(rafaga, c.cupo + (ahora - c.ultimo) * ritmo / 1000); c.ultimo = ahora;
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
    for (const [k, r] of this.codigos) if (ahora - r.creado > CODIGO_MIN * 60 * 1000) this.codigos.delete(k);
    for (const c of this.conexiones) if (ahora - c.vivo > SIN_VIDA_MS) { try { c.ws.cierra(); } catch (_) {} this.despide(c); }
  }
}

module.exports = { Rele };
