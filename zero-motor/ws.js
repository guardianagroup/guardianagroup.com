// WebSocket mínimo de servidor (RFC 6455) sin dependencias: lo justo para ZERO (texto JSON y binario).
'use strict';
const crypto = require('crypto');
const { EventEmitter } = require('events');

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

class WS extends EventEmitter {
  constructor(socket) {
    super();
    this.s = socket; this.buf = Buffer.alloc(0); this.abierto = true; this.trozos = []; this.opTrozo = 0;
    socket.on('data', (d) => this.lee(d));
    socket.on('close', () => { this.abierto = false; this.emit('close'); });
    socket.on('error', () => { this.abierto = false; this.emit('close'); });
  }

  static acepta(req, socket) {
    const k = req.headers['sec-websocket-key'];
    if (!k || (req.headers.upgrade || '').toLowerCase() !== 'websocket') { socket.destroy(); return null; }
    const acc = crypto.createHash('sha1').update(k + GUID).digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
    socket.setNoDelay(true);
    return new WS(socket);
  }

  lee(d) {
    this.buf = this.buf.length ? Buffer.concat([this.buf, d]) : d;
    for (;;) {
      if (this.buf.length < 2) return;
      const b0 = this.buf[0], b1 = this.buf[1];
      const fin = !!(b0 & 0x80), op = b0 & 0x0f, mask = !!(b1 & 0x80);
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      if (this.buf.length < off + (mask ? 4 : 0) + len) return;
      let carga;
      if (mask) {
        const m = this.buf.subarray(off, off + 4); off += 4;
        carga = Buffer.allocUnsafe(len);
        for (let i = 0; i < len; i++) carga[i] = this.buf[off + i] ^ m[i & 3];
      } else carga = Buffer.from(this.buf.subarray(off, off + len));
      this.buf = this.buf.subarray(off + len);
      if (op === 8) { this.cierra(); return; }
      if (op === 9) { this.manda(carga, 10); continue; }
      if (op === 10) continue;
      if (op === 0) { this.trozos.push(carga); if (!fin) continue; carga = Buffer.concat(this.trozos); this.trozos = []; }
      else if (!fin) { this.opTrozo = op; this.trozos = [carga]; continue; }
      const opReal = op === 0 ? this.opTrozo : op;
      this.emit('message', opReal === 1 ? carga.toString('utf8') : carga, opReal === 2);
    }
  }

  manda(carga, op) {
    if (!this.abierto) return;
    const len = carga.length;
    let cab;
    if (len < 126) { cab = Buffer.from([0x80 | op, len]); }
    else if (len < 65536) { cab = Buffer.alloc(4); cab[0] = 0x80 | op; cab[1] = 126; cab.writeUInt16BE(len, 2); }
    else { cab = Buffer.alloc(10); cab[0] = 0x80 | op; cab[1] = 127; cab.writeBigUInt64BE(BigInt(len), 2); }
    try { this.s.write(Buffer.concat([cab, carga])); } catch (_) { this.cierra(); }
  }

  send(x) { if (typeof x === 'string') this.manda(Buffer.from(x, 'utf8'), 1); else this.manda(x, 2); }
  json(o) { this.send(JSON.stringify(o)); }
  cierra() { if (!this.abierto) return; this.abierto = false; try { this.s.end(Buffer.from([0x88, 0])); } catch (_) {} this.emit('close'); }
}

module.exports = { WS };
