// Prueba de extremo a extremo del motor: se conecta como lo haría la página de ZERO, abre la web de pruebas, hace
// clic en las pruebas y guarda lo que el cliente recibiría (sucesos, resumen, último cuadro, acta).
// Uso: node zero-motor/pruebas/prueba.js [ws://127.0.0.1:8792/sesion] [http://127.0.0.1:8793/] [carpeta de salida]
'use strict';
const fs = require('fs');
const path = require('path');

const WSURL = process.argv[2] || 'ws://127.0.0.1:8792/sesion';
const URL0 = process.argv[3] || 'http://127.0.0.1:8793/';
const OUT = process.argv[4] || path.join(__dirname, 'salida');
fs.mkdirSync(OUT, { recursive: true });

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const ws = new WebSocket(WSURL, { headers: { origin: 'http://127.0.0.1:8791' } }); // el motor solo acepta orígenes de GUARDIANA (o locales en pruebas)
ws.binaryType = 'arraybuffer';
const sucesos = []; let resumen = null, cuadros = 0, ultimo = null, acta = null, lista = null;
const env = (o) => ws.send(JSON.stringify(o));

ws.onmessage = (ev) => {
  if (typeof ev.data !== 'string') { cuadros++; ultimo = Buffer.from(ev.data); return; }
  const m = JSON.parse(ev.data);
  if (m.t === 'suceso') { sucesos.push(m); console.log(`${m.hora.slice(11, 19)} ${m.clase.padEnd(12)} ${m.certeza.padEnd(10)} ${m.texto}`); }
  else if (m.t === 'resumen') resumen = m;
  else if (m.t === 'acta') acta = m.acta;
  else if (m.t === 'lista') lista = m;
  else if (m.t === 'nav' || m.t === 'titulo') console.log('  →', m.t, m.host || m.titulo || '');
};

const clic = async (x, y) => { env({ t: 'raton', tipo: 'move', x, y }); await espera(60); env({ t: 'raton', tipo: 'down', x, y }); await espera(60); env({ t: 'raton', tipo: 'up', x, y }); await espera(900); };

ws.onopen = async () => {
  env({ t: 'hola', w: 1100, h: 760 });
  await espera(1500);
  console.log('listas:', lista && Object.keys(lista.listas).join(', '), '· cookies de terceros bloqueadas:', lista && lista.cookiesBloqueadas);
  env({ t: 'abrir', url: URL0 });
  await espera(5000);
  if (ultimo) fs.writeFileSync(path.join(OUT, 'portada.jpg'), ultimo);
  // los enlaces de prueba (posiciones en la maqueta a 1100×760): descarga, emergente, aviso, portapapeles, micrófono
  for (const [x, y] of [[112, 712], [293, 712], [449, 712], [593, 712], [85, 753]]) await clic(x, y);
  // el formulario sin cifrar: escribir una contraseña y enviar
  await clic(903, 252);
  for (const k of ['s', 'e', 'c', 'r', 'e', 't', 'o']) { env({ t: 'tecla', tipo: 'down', key: k }); await espera(30); env({ t: 'tecla', tipo: 'up', key: k }); await espera(30); }
  await clic(790, 302);
  await espera(1500);
  if (ultimo) fs.writeFileSync(path.join(OUT, 'tras-clics.jpg'), ultimo);
  // enlace con identificadores de seguimiento, cadena de saltos, web peligrosa y certificado roto
  env({ t: 'modo', observatorio: true }); await espera(200);
  env({ t: 'abrir', url: 'http://127.0.0.1:8793/?seccion=economia&utm_source=newsletter&utm_campaign=lunes&fbclid=IwAR0prueba' }); await espera(3000);
  env({ t: 'abrir', url: 'http://127.0.0.1:8793/salto1' }); await espera(3000);
  if (ultimo) fs.writeFileSync(path.join(OUT, 'deportes.jpg'), ultimo);
  env({ t: 'abrir', url: 'https://flexytalk.net/' }); await espera(3000);
  if (ultimo) fs.writeFileSync(path.join(OUT, 'peligrosa.jpg'), ultimo);
  env({ t: 'abrir', url: 'https://127.0.0.1:8794/' }); await espera(4000);
  if (ultimo) fs.writeFileSync(path.join(OUT, 'certificado.jpg'), ultimo);
  env({ t: 'destruir' });
  await espera(1500);
  fs.writeFileSync(path.join(OUT, 'sucesos.json'), JSON.stringify({ lista, sucesos, resumen, acta, cuadros }, null, 1));
  console.log('\ncuadros recibidos:', cuadros, '· sucesos:', sucesos.length, '· por clase:', JSON.stringify(sucesos.reduce((a, s) => (a[s.clase] = (a[s.clase] || 0) + 1, a), {})));
  console.log('acta:', acta && JSON.stringify({ sesion: acta.sesion, duracion_s: acta.duracion_s, operaciones: acta.operaciones.length, sello: acta.sello }));
  process.exit(0);
};
ws.onerror = (e) => { console.error('error ws', e.message || e); process.exit(1); };
