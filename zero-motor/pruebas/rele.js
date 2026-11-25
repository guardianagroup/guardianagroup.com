// Relé de Comunicaciones suelto, para pruebas en local (sin Chromium ni listas): node zero-motor/pruebas/rele.js [puerto=8794]
// Sirve ws://127.0.0.1:<puerto>/com y /salud; admite cualquier origen. Con TURN_SECRETO y TURN_HOST en el entorno
// reparte credenciales (para probar contra un coturn local).
'use strict';
// sin el límite de altas por dirección: aquí todo sale de 127.0.0.1 (ver numeros.js). Tiene que ir antes de cargar el relé:
// numeros.js lee la variable al cargarse (30 Oct 2026: puesta después, no servía, y la suite completa se quedaba sin números)
process.env.COM_PRUEBAS = '1';
const http = require('http');
const { WS } = require('../ws');
const { Rele } = require('../comunicaciones');
const { Tiempo } = require('../tiempo');

const PUERTO = +process.argv[2] || 8794;
// 1718: con COM_TIEMPO_ORIGENES (p. ej. http://127.0.0.1:8090) esas páginas cuentan tiempo, como house1718.com en los motores;
// COM_TIEMPO_API apunta a un Dodo de mentira (pruebas/dodo-falso.js) y COM_TIEMPO_CORTESIA acorta la cortesía
const ORIGENES_1718 = String(process.env.COM_TIEMPO_ORIGENES || '').split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean);
const TIEMPO = ORIGENES_1718.length ? new Tiempo({ dir: process.env.COM_TIEMPO_DIR || require('path').join(require('os').tmpdir(), 'tiempo-pruebas') }) : null;
const RELE = new Rele({ turnHost: process.env.TURN_HOST || '', turnSecreto: process.env.TURN_SECRETO || '', turnPuerto: +(process.env.TURN_PUERTO || 3478), region: 'pruebas', tiempo: TIEMPO, esPago: (o) => ORIGENES_1718.includes(o) });
// COM_PRUEBAS_TURN=1: hace como si coturn estuviera en marcha (reparte credenciales de mentira) para probar cuándo se dan y cuándo no
if (process.env.COM_PRUEBAS_TURN === '1') { RELE.turnHost = '127.0.0.1'; RELE.turnSecreto = 'secreto-de-pruebas'; Object.defineProperty(RELE, 'llamadas', { get: () => true }); }
// los avisos que manda el relé (las pruebas los leen en /avisos; /avisos?borra=1 los vacía)
const AVISOS = [];
let ESTRANGULA = false;
if (RELE.avisos) RELE.avisos.alAvisar = (x) => { AVISOS.push(x); if (AVISOS.length > 500) AVISOS.shift(); };
const srv = http.createServer((req, res) => {
  if (req.url.startsWith('/avisos')) {
    const cab = { 'content-type': 'application/json', 'cache-control': 'no-store', 'access-control-allow-origin': '*' };
    res.writeHead(200, cab); res.end(JSON.stringify(AVISOS)); if (/borra=1/.test(req.url)) AVISOS.length = 0; return;
  }
  // la prueba de la ruta (64 KB); con /estrangula?on=1 se imita una red que corta a 16 KB (manda 16 KB y se queda parada)
  if (req.url.startsWith('/estrangula')) { ESTRANGULA = /on=1/.test(req.url); res.writeHead(200, { 'access-control-allow-origin': '*' }); return res.end(String(ESTRANGULA)); }
  if (req.url.startsWith('/prueba')) {
    res.writeHead(200, { 'content-type': 'application/octet-stream', 'cache-control': 'no-store', 'content-length': 65536, 'access-control-allow-origin': req.headers.origin || '*' });
    if (ESTRANGULA) { res.write(Buffer.alloc(16384)); return; }
    return res.end(Buffer.alloc(65536));
  }
  if (req.url === '/salud') {
    const cab = { 'content-type': 'application/json', 'cache-control': 'no-store', 'access-control-allow-origin': req.headers.origin || '*' };
    res.writeHead(200, cab); return res.end(JSON.stringify({ ok: true, version: 'pruebas', region: 'pruebas', com: RELE.estado() }));
  }
  res.writeHead(404); res.end();
});
srv.on('upgrade', (req, socket) => {
  if (!req.url.startsWith('/com')) return socket.destroy();
  const ws = WS.acepta(req, socket);
  // la dirección: la de verdad o, en las pruebas, la que diga x-forwarded-for (para imitar otra red, «VPN»)
  if (ws) RELE.acepta(ws, String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '', req.headers.origin);
});
srv.listen(PUERTO, '127.0.0.1', () => console.log('relé de pruebas en ws://127.0.0.1:' + PUERTO + '/com'));
