// Relé de Comunicaciones suelto, para pruebas en local (sin Chromium ni listas): node zero-motor/pruebas/rele.js [puerto=8794]
// Sirve ws://127.0.0.1:<puerto>/com y /salud; admite cualquier origen. Con TURN_SECRETO y TURN_HOST en el entorno
// reparte credenciales (para probar contra un coturn local).
'use strict';
const http = require('http');
const { WS } = require('../ws');
const { Rele } = require('../comunicaciones');

const PUERTO = +process.argv[2] || 8794;
// el baúl de contactos, en una carpeta temporal (COM_BAUL_DIR para otra)
const BAUL_DIR = process.env.COM_BAUL_DIR || require('path').join(require('os').tmpdir(), 'guardiana-baul-pruebas-' + PUERTO);
const RELE = new Rele({ turnHost: process.env.TURN_HOST || '', turnSecreto: process.env.TURN_SECRETO || '', turnPuerto: +(process.env.TURN_PUERTO || 3478), region: 'pruebas', baulDir: BAUL_DIR });
const srv = http.createServer((req, res) => {
  if (req.url === '/salud') {
    const cab = { 'content-type': 'application/json', 'cache-control': 'no-store', 'access-control-allow-origin': req.headers.origin || '*' };
    res.writeHead(200, cab); return res.end(JSON.stringify({ ok: true, version: 'pruebas', region: 'pruebas', com: RELE.estado() }));
  }
  res.writeHead(404); res.end();
});
srv.on('upgrade', (req, socket) => {
  if (!req.url.startsWith('/com')) return socket.destroy();
  const ws = WS.acepta(req, socket);
  if (ws) RELE.acepta(ws);
});
srv.listen(PUERTO, '127.0.0.1', () => console.log('relé de pruebas en ws://127.0.0.1:' + PUERTO + '/com'));
