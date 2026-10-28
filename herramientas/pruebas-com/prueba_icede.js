// iceDe con cuatro medidas, contra un servidor de prueba que tarda 90, 30, 60 y 45 ms en contestar a cada ping
globalThis.location = { search: '', hostname: 'guardianagroup.com' };
require('/home/claude/guardianagroup.com/orbita/comunicaciones/rele.js');
const http = require('http');
const { WS } = require('/home/claude/guardianagroup.com/zero-motor/ws');
const retrasos = [90, 30, 60, 45];
let corte = false;
const srv = http.createServer().on('upgrade', (req, socket) => {
  const ws = WS.acepta(req, socket); if (!ws) return;
  let n = 0;
  ws.on('message', (d) => {
    let m; try { m = JSON.parse(String(d)); } catch (_) { return; }
    if (m.t === 'hola') ws.json({ t: 'hola', region: 'prueba', llamadas: true, ice: [{ urls: ['turn:x:3478'], username: 'u', credential: 'c' }], caduca: Math.floor(Date.now() / 1000) + 3600 });
    if (m.t === 'ping') { const r = retrasos[n++ % 4]; if (corte && n === 3) { socket.destroy(); return; } setTimeout(() => ws.json({ t: 'pong' }), r); }
  });
});
srv.listen(8796, '127.0.0.1', async () => {
  let r = await GuardianaRele.iceDe('ws://127.0.0.1:8796', 3000);
  console.log('cuatro medidas:', r && r.ms, r && r.ms >= 30 && r.ms < 45 ? 'OK (la mejor, ~30)' : 'FALLA');
  corte = true;
  r = await GuardianaRele.iceDe('ws://127.0.0.1:8796', 3000);
  console.log('se corta tras dos medidas:', r && r.ms, r && r.ms >= 30 && r.ms < 60 ? 'OK (vale la mejor de las dos)' : 'FALLA');
  r = await GuardianaRele.iceDe('ws://127.0.0.1:8799', 1500);
  console.log('sin servidor:', r === null ? 'OK (null)' : 'FALLA');
  process.exit(0);
});
