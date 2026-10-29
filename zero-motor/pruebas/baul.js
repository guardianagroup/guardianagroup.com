// Prueba del baúl de contactos del relé (28 Oct 2026): node zero-motor/pruebas/baul.js
// Leer vacío, primer guardado, versión vieja rechazada, llave de escritura ajena rechazada, tamaño máximo, ritmo y que sobreviva
// a un relé nuevo sobre la misma carpeta (como tras una actualización).
'use strict';
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { WS } = require('../ws');
const { Rele } = require('../comunicaciones');

const DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'baul-prueba-'));
const fallos = [];
const comprueba = (ok, txt, x) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!ok) fallos.push(txt); };

function relé() {
  const R = new Rele({ region: 'pruebas', baulDir: DIR });
  const srv = http.createServer((q, r) => { r.writeHead(404); r.end(); });
  srv.on('upgrade', (req, socket) => { const ws = WS.acepta(req, socket); if (ws) R.acepta(ws); });
  return new Promise((res) => srv.listen(0, '127.0.0.1', () => res({ srv, puerto: srv.address().port })));
}
function cliente(puerto) {
  return new Promise((res) => {
    const ws = new WebSocket('ws://127.0.0.1:' + puerto + '/com'); ws.binaryType = 'arraybuffer';
    const esperas = [];
    ws.onmessage = (e) => { const m = JSON.parse(e.data); const i = esperas.findIndex((x) => x.t === m.t); if (i >= 0) esperas.splice(i, 1)[0].f(m); };
    const espera = (t) => new Promise((f) => esperas.push({ t, f }));
    const lee = (id) => { const p = espera('baul'); ws.send(JSON.stringify({ t: 'baul-lee', id })); return p; };
    const pon = (id, llave, version, datos) => { const b = Buffer.alloc(69 + datos.length); b[0] = 3; Buffer.from(id, 'hex').copy(b, 1); llave.copy(b, 33); b.writeUInt32BE(version, 65); datos.copy(b, 69); const p = espera('baul-pon'); ws.send(b); return p; };
    ws.onopen = () => res({ ws, lee, pon });
  });
}
(async () => {
  const { srv, puerto } = await relé();
  const a = await cliente(puerto), b = await cliente(puerto);
  const id = crypto.randomBytes(32).toString('hex'), llave = crypto.randomBytes(32), otra = crypto.randomBytes(32);
  let r = await a.lee(id);
  comprueba(r.ok && r.version === 0 && r.datos === null, 'leer un id nuevo: vacío, versión 0', r);
  r = await a.pon(id, llave, 0, Buffer.from('bloque 1'));
  comprueba(r.ok && r.version === 1, 'primer guardado: versión 1', r);
  r = await b.lee(id);
  comprueba(r.ok && r.version === 1 && Buffer.from(r.datos, 'base64').toString() === 'bloque 1', 'otro equipo lo lee', r.version);
  r = await b.pon(id, llave, 0, Buffer.from('viejo'));
  comprueba(!r.ok && r.por === 'version' && r.version === 1, 'guardar sobre una versión vieja: rechazado (hay que volver a leer)', r);
  r = await b.pon(id, otra, 1, Buffer.from('intruso'));
  comprueba(!r.ok && r.por === 'llave', 'con otra llave de escritura: rechazado', r);
  r = await b.pon(id, llave, 1, Buffer.from('bloque 2'));
  comprueba(r.ok && r.version === 2, 'con la llave y la versión buenas: versión 2', r);
  r = await a.pon(id, llave, 2, Buffer.alloc(512 * 1024 + 1));
  comprueba(!r.ok && r.por === 'demasiado grande', 'más de 512 KB: rechazado', r.por);
  r = await a.lee('xyz');
  comprueba(!r.ok && r.por === 'formato', 'id mal formado: rechazado', r.por);
  // a la vez, dos equipos sobre la misma versión: solo uno gana
  const [x, y] = await Promise.all([a.pon(id, llave, 2, Buffer.from('A')), b.pon(id, llave, 2, Buffer.from('B'))]);
  comprueba([x, y].filter((z) => z.ok).length === 1, 'dos guardados a la vez sobre la misma versión: solo uno entra', [x.ok, y.ok]);
  // un relé nuevo sobre la misma carpeta (tras una actualización) lo sigue teniendo
  const { srv: srv2, puerto: p2 } = await relé();
  const c = await cliente(p2);
  r = await c.lee(id);
  comprueba(r.ok && r.version === 3, 'tras reiniciar el relé, el bloque sigue', r.version);
  // ritmo: más de 30 operaciones por minuto y conexión
  let n = 0; for (let i = 0; i < 32; i++) { const z = await c.lee(id); if (!z.ok && z.por === 'demasiadas') n++; }
  comprueba(n >= 1, 'más de 30 operaciones por minuto: se frena', n);
  for (const z of [a, b, c]) z.ws.close();
  srv.close(); srv2.close();
  fs.rmSync(DIR, { recursive: true, force: true });
  console.log(fallos.length ? 'FALLOS: ' + fallos.length : 'TODO BIEN');
  process.exit(fallos.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
