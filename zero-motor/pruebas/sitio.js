// Web de pruebas para el motor de ZERO (26 Oct 2026). Imita lo que hace un periódico digital corriente: carga
// rastreadores y publicidad de terceros reales (por su dirección; aquí no hay internet y el motor los corta antes de
// pedirlos), mide la huella del equipo, pide permisos, monta una subasta de anuncios con la API de Prebid, intenta
// una conexión directa, tiene un formulario sin cifrar, enlaces con identificadores de seguimiento, una cadena de
// redirecciones, una descarga, una ventana emergente, una cookie de otra empresa y un enlace a una web peligrosa.
//
// Uso: node zero-motor/pruebas/sitio.js   → http://127.0.0.1:8793/ (y https://127.0.0.1:8794/ con certificado casero)
'use strict';
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORTADA = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>El Diario de Pruebas</title>
<style>body{margin:0;font:17px/1.55 Georgia,serif;color:#111;background:#fafaf7}header{padding:18px 28px;border-bottom:3px solid #111;font:700 34px Georgia,serif;letter-spacing:-.02em}
nav{padding:10px 28px;border-bottom:1px solid #ccc;font:13px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.12em}nav a{margin-right:18px;color:#333;text-decoration:none}
main{max-width:1100px;margin:0 auto;padding:24px 28px;display:grid;grid-template-columns:2fr 1fr;gap:32px}h1{font-size:40px;line-height:1.1;margin:0 0 10px}h2{font-size:22px;margin:26px 0 8px}
.anuncio{background:#eee;border:1px dashed #999;height:250px;display:flex;align-items:center;justify-content:center;color:#777;font:13px Arial,sans-serif;margin:0 0 20px}
aside form{background:#f1f1ec;padding:16px;border:1px solid #ddd}input{display:block;width:100%;margin:6px 0 12px;padding:8px;font:15px Arial,sans-serif;box-sizing:border-box}button{padding:9px 16px;font:15px Arial,sans-serif}
a.pruebas{display:inline-block;margin:6px 10px 6px 0;padding:6px 10px;border:1px solid #999;border-radius:6px;font:13px Arial,sans-serif;color:#222;text-decoration:none;background:#fff}
footer{padding:30px 28px;color:#777;font:12px Arial,sans-serif;border-top:1px solid #ccc;margin-top:40px}</style>
<!-- medición y publicidad como las de un periódico real -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PRUEBA"></script>
<script src="https://www.google-analytics.com/analytics.js"></script>
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
<script src="https://static.criteo.net/js/ld/publishertag.js"></script>
<script src="https://script.hotjar.com/modules.js"></script>
<script src="https://connect.facebook.net/es_ES/fbevents.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
<script src="/prebid.js"></script>
</head><body>
<header>El Diario de Pruebas</header>
<nav><a href="/">Portada</a><a href="/?seccion=economia&utm_source=newsletter&utm_campaign=lunes&fbclid=IwAR0prueba">Economía (enlace con seguimiento)</a><a href="/salto1">Deportes (3 saltos)</a><a href="https://flexytalk.net/">Web peligrosa</a><a href="https://127.0.0.1:8794/">Certificado roto</a></nav>
<main><article>
<h1>Una portada corriente, con todo lo que una web corriente intenta hacer</h1>
<p>Esta página existe para probar el motor de ZERO sin internet. Cada cosa que intenta es real: las direcciones de los rastreadores son las de verdad, la huella se mide con las mismas llamadas que usan los rastreadores, la subasta usa la interfaz de Prebid y el formulario de la derecha enviaría la contraseña sin cifrar.</p>
<div class="anuncio" id="hueco-1">hueco de anuncio 1 (300×250)</div>
<h2>Pruebas que se activan con un clic</h2>
<p>
<a class="pruebas" href="/descarga/informe.exe">Descargar «informe.exe»</a>
<a class="pruebas" href="#" onclick="window.open('/emergente','_blank','width=400,height=300');return false">Abrir ventana emergente</a>
<a class="pruebas" href="#" onclick="alert('Aviso de la web');return false">Aviso emergente</a>
<a class="pruebas" href="#" onclick="navigator.clipboard.readText().catch(()=>{});return false">Leer el portapapeles</a>
<a class="pruebas" href="#" onclick="navigator.mediaDevices.getUserMedia({audio:true}).catch(()=>{});return false">Pedir micrófono</a>
</p>
<h2>Texto de relleno</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.</p>
<div class="anuncio" id="hueco-2">hueco de anuncio 2 (728×90)</div>
</article>
<aside>
<form action="http://cuentas.ejemplo-inseguro.test/entrar" method="post"><strong>Acceso de suscriptores</strong><input name="usuario" placeholder="Correo"><input name="clave" type="password" placeholder="Contraseña"><button>Entrar</button></form>
<p style="font:13px Arial,sans-serif;color:#666">Este formulario envía a una dirección http:// sin cifrar.</p>
<img src="http://localhost:8793/pixel.gif" width="1" height="1" alt="">
<img src="https://www.facebook.com/tr?id=1&ev=PageView&noscript=1" width="1" height="1" alt="">
</aside></main>
<footer>El Diario de Pruebas · web ficticia para probar ZERO</footer>
<script>
// huella digital: lo mismo que hacen las bibliotecas de fingerprinting
(function(){try{var c=document.createElement('canvas');var x=c.getContext('2d');x.textBaseline='top';x.font='14px Arial';x.fillText('huella, ñ 😀',2,2);c.toDataURL();}catch(e){}
try{var g=document.createElement('canvas').getContext('webgl');if(g){var d=g.getExtension('WEBGL_debug_renderer_info');if(d){g.getParameter(d.UNMASKED_VENDOR_WEBGL);g.getParameter(d.UNMASKED_RENDERER_WEBGL);}}}catch(e){}
try{var A=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(A){var a=new A(1,44100,44100);var o=a.createOscillator();o.connect(a.destination);o.start();a.startRendering();}}catch(e){}
try{var m=document.createElement('canvas').getContext('2d');['Arial','Verdana','Georgia','Courier','Tahoma','Impact','Comic Sans MS','Garamond','Calibri','Cambria'].forEach(function(f){for(var i=0;i<6;i++){m.font='12px "'+f+'", monospace';m.measureText('mmmmmmmmmmlli');}});}catch(e){}
try{navigator.plugins.length}catch(e){}
try{navigator.geolocation.getCurrentPosition(function(){},function(){});}catch(e){}
try{new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]}).createDataChannel('x');}catch(e){}
})();
// la subasta de anuncios, con la API de Prebid (el /prebid.js local imita a pujadores reales)
window.pbjs=window.pbjs||{que:[]};
pbjs.que.push(function(){pbjs.addAdUnits([{code:'hueco-1',mediaTypes:{banner:{sizes:[[300,250]]}},bids:[{bidder:'appnexus'},{bidder:'rubicon'},{bidder:'criteo'},{bidder:'pubmatic'},{bidder:'ix'},{bidder:'openx'}]},{code:'hueco-2',mediaTypes:{banner:{sizes:[[728,90]]}},bids:[{bidder:'appnexus'},{bidder:'rubicon'},{bidder:'criteo'}]}]);pbjs.requestBids({timeout:1200});});
</script></body></html>`;

const PREBID = `// imitación mínima de Prebid.js para las pruebas: misma interfaz pública (que, onEvent, addAdUnits, requestBids)
(function(){var p=window.pbjs=window.pbjs||{que:[]};var oyentes={};p.onEvent=function(n,f){(oyentes[n]=oyentes[n]||[]).push(f)};var emite=function(n,d){(oyentes[n]||[]).forEach(function(f){try{f(d)}catch(e){}})};
var unidades=[];p.addAdUnits=function(u){unidades=unidades.concat(u)};
var PUJA={appnexus:[0.42,38],rubicon:[0.55,61],criteo:[0.91,44],pubmatic:[0.37,72],ix:[0.63,55],openx:[0,90]};
p.requestBids=function(o){var id='a-'+Date.now().toString(36);var t0=Date.now();var codes=unidades.map(function(u){return u.code});emite('auctionInit',{auctionId:id,adUnitCodes:codes,timestamp:t0});
var recibidas=[],sin=[];unidades.forEach(function(u){u.bids.forEach(function(b){emite('bidRequested',{auctionId:id,bidderCode:b.bidder});var q=PUJA[b.bidder]||[0,50];if(q[0]>0)recibidas.push({auctionId:id,bidderCode:b.bidder,cpm:q[0],currency:'USD',timeToRespond:q[1],size:u.mediaTypes.banner.sizes[0].join('x'),adUnitCode:u.code,meta:{advertiserDomains:[b.bidder==='criteo'?'tienda-ejemplo.test':'marca-ejemplo.test']}});else sin.push({auctionId:id,bidderCode:b.bidder});});});
setTimeout(function(){emite('auctionEnd',{auctionId:id,adUnitCodes:codes,bidsReceived:recibidas,noBids:sin,timestamp:t0,auctionEnd:Date.now()});var g={};recibidas.forEach(function(b){if(!g[b.adUnitCode]||g[b.adUnitCode].cpm<b.cpm)g[b.adUnitCode]=b});Object.keys(g).forEach(function(k){emite('bidWon',g[k])});},180);};
p.que.forEach(function(f){try{f()}catch(e){}});p.que={push:function(f){try{f()}catch(e){}}};})();`;

function sirve(req, res) {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;
  if (p === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(PORTADA); }
  if (p === '/prebid.js') { res.writeHead(200, { 'content-type': 'application/javascript' }); return res.end(PREBID); }
  if (p === '/pixel.gif') { res.writeHead(200, { 'content-type': 'image/gif', 'set-cookie': 'uid=abc123; Path=/; SameSite=None; Secure' }); return res.end(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')); }
  if (p === '/salto1') { res.writeHead(302, { location: 'http://localhost:8793/salto2?clic=1' }); return res.end(); }
  if (p === '/salto2') { res.writeHead(302, { location: 'http://127.0.0.1:8793/salto3' }); return res.end(); }
  if (p === '/salto3') { res.writeHead(302, { location: 'http://127.0.0.1:8793/deportes' }); return res.end(); }
  if (p === '/deportes') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end('<!doctype html><meta charset="utf-8"><title>Deportes</title><body style="font:18px Georgia;padding:40px"><h1>Deportes</h1><p>Has llegado tras tres saltos.</p><a href="/">Volver</a>'); }
  if (p === '/emergente') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end('<!doctype html><meta charset="utf-8"><title>Emergente</title><body>ventana emergente'); }
  if (p.startsWith('/descarga/')) { res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-disposition': 'attachment; filename="informe.exe"' }); return res.end(Buffer.alloc(2048, 0x4d)); }
  res.writeHead(404); res.end('no');
}

http.createServer(sirve).listen(8793, '0.0.0.0', () => console.log('web de pruebas en http://127.0.0.1:8793/'));

// servidor con certificado casero (autofirmado) para probar el aviso de certificado
const dir = path.join(__dirname, 'cert');
try {
  if (!fs.existsSync(path.join(dir, 'clave.pem'))) {
    fs.mkdirSync(dir, { recursive: true });
    execSync('openssl req -x509 -newkey rsa:2048 -nodes -keyout clave.pem -out cert.pem -days 30 -subj "/CN=127.0.0.1" 2>/dev/null', { cwd: dir });
  }
  https.createServer({ key: fs.readFileSync(path.join(dir, 'clave.pem')), cert: fs.readFileSync(path.join(dir, 'cert.pem')) }, sirve).listen(8794, '0.0.0.0', () => console.log('con certificado casero en https://127.0.0.1:8794/'));
} catch (e) { console.log('sin servidor https:', e.message); }
