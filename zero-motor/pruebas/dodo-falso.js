// Dodo de mentira para las pruebas de 1718 (tiempo.js): /licenses/validate y /licenses/activate, como los públicos de Dodo.
// Códigos: «prueba-60-…» valen 60 activaciones; «prueba-2-…», 2; «prueba-devuelto-…», ninguno (devuelto). /estado los enseña;
// /caido?on=1 imita que Dodo no contesta.  Uso: node zero-motor/pruebas/dodo-falso.js [puerto=8795]
'use strict';
const http = require('http');
const PUERTO = +process.argv[2] || 8795;
const activaciones = new Map(); let caido = false; const llamadas = [];
const limite = (k) => { const m = /^prueba-(\d+)-/.exec(k); return m ? +m[1] : null; };
http.createServer((req, res) => {
  const fin = (st, j) => { res.writeHead(st, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(JSON.stringify(j)); };
  if (req.url.startsWith('/estado')) return fin(200, { activaciones: Object.fromEntries(activaciones), llamadas: llamadas.slice(-50) });
  if (req.url.startsWith('/caido')) { caido = /on=1/.test(req.url); return fin(200, { caido }); }
  let b = ''; req.on('data', (d) => { b += d; if (b.length > 10000) req.destroy(); });
  req.on('end', () => {
    let j = {}; try { j = JSON.parse(b || '{}'); } catch (_) {}
    const k = String(j.license_key || ''); llamadas.push({ ruta: req.url, k: k.slice(0, 20), t: Date.now() });
    if (caido) { res.destroy(); return; }
    const lim = /^prueba-devuelto-/.test(k) ? -1 : limite(k);
    // «prueba-60-lento…»: Dodo tarda 2,5 s en contestar la comprobación (como en la vida real, a veces)
    if (req.url === '/licenses/validate') { const r = () => fin(200, { valid: lim !== null && lim >= 0 }); return /-lento/.test(k) ? setTimeout(r, 2500) : r(); }
    if (req.url === '/licenses/activate') {
      if (lim === null) return fin(404, { message: 'not found' });
      if (lim < 0) return fin(403, { message: 'not active' });
      const n = activaciones.get(k) || 0; if (n >= lim) return fin(422, { message: 'limit reached' });
      activaciones.set(k, n + 1); return fin(201, { id: 'lki_' + Math.random().toString(36).slice(2), name: j.name });
    }
    fin(404, {});
  });
}).listen(PUERTO, '127.0.0.1', () => console.log('Dodo de mentira en http://127.0.0.1:' + PUERTO));
