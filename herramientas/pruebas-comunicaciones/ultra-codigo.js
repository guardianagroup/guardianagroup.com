// Ultra también con un código (6 nov 2026; el dueño lo eligió así). Además del enlace «#b=», una invitación Ultra se puede compartir con
// un código de 16 caracteres (Crockford base32, 80 bits) que el relé no recibe: al relé va un buzón de 9 cifras que sale del código con
// HKDF y el sobre, la semilla cerrada con AES-GCM y una clave que también sale del código (cripto.js: nuevoCodigoU, normalizaCodigoU,
// derivaCodigoU, cierraSobreU, abreSobreU). El diseño, para la revisión: ULTRA-CODIGO.md, en esta carpeta.
//
// La prueba levanta su propio relé (zero-motor/comunicaciones.js, en este mismo proceso, en el puerto 8795 o RELE_PUERTO) para ver lo
// que guarda y todo lo que recibe, y abre las páginas con «?rele=ws://127.0.0.1:8795». Solo hace falta la web, desde la raíz:
//     python3 -m http.server 8080 --bind 127.0.0.1
// y, desde esta carpeta: node ultra-codigo.js [carpeta de capturas]
//   1. A crea Ultra (enlace y QR) y pulsa «Usar un código»: 4 grupos de 4 del alfabeto. El relé guarda un buzón de 9 cifras distinto
//      del código: el mismo que sale en Node con HKDF-SHA256, y su sobre, abierto en Node con el código, es la semilla del enlace «#b=»
//      (y con otro buzón no abre). «Cancelar el código» lo quita del relé. El código no aparece en nada de lo que recibe el relé, ni en
//      lo que mandan las páginas, ni en las direcciones que piden.
//   2. B lo escribe con minúsculas, espacios y una O en lugar de 0 (y una l en lugar de 1, si la hay): las 16 casillas, la sesión Ultra,
//      las cuatro palabras iguales en los dos y mensajes en los dos sentidos; A vio el aviso de código usado y el relé ya no guarda nada.
//   3. C escribe el mismo código otra vez: «Código erróneo, caducado o ya usado.» y no entra en nada.
//   4. C escribe un código Ultra inventado: el mismo mensaje y nada se rompe. Con una U (que no está en el alfabeto) no llega a 16 ni se
//      pide nada al relé; pegado dentro de un mensaje, se toma el código. Y normalizaCodigoU, en la página.
//   5. El código de 9 cifras de la Blindada sigue funcionando: D lo crea (el relé lo recibe, como siempre) y C entra con él.
//   6. Sin la capa postcuántica (sin ML-KEM-1024 ni ML-DSA-87): el mismo aviso que con un enlace «#b=», y el código no se gasta.
//   7. Solo con el enlace, el relé no recibe ningún «invita», tampoco si quien invita se reconecta (antes del 6 nov 2026 se colaba uno).
//   8. A los 10 minutos (aquí, adelantado): el aviso de caducado, «Nuevo código» y fuera del relé; al cancelar la invitación, fuera del
//      relé; y tras un corte con el relé, el código se da por perdido y se pide otro (no se vuelve a dejar solo).
'use strict';
process.env.COM_PRUEBAS = '1';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const RAIZ = path.join(__dirname, '..', '..');
const { WS } = require(path.join(RAIZ, 'zero-motor', 'ws'));
const { Rele } = require(path.join(RAIZ, 'zero-motor', 'comunicaciones'));
const OUT = process.argv[2] || path.join(__dirname, 'ultra-codigo');
fs.mkdirSync(OUT, { recursive: true });
const PUERTO = +(process.env.RELE_PUERTO || 8795);
const URL0 = 'http://127.0.0.1:8080/orbita/comunicaciones/?rele=ws://127.0.0.1:' + PUERTO;
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const comprueba = (ok, txt, extra) => { console.log((ok ? 'OK   ' : 'FALLO') + ' ' + txt + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); if (!ok) fallos.push(txt); };
const hasta = async (fn, ms) => { const h = Date.now() + (ms || 8000); while (Date.now() < h) { if (await fn()) return true; await espera(150); } return false; };

// ---- el relé, aquí mismo: lo que guarda (RELE.codigos) y todo lo que recibe, por conexión ----
const RELE = new Rele({ region: 'pruebas', avisos: null, numeros: null, buzones: null });
const RECIBIDO = []; let nCon = 0;
{
  const acepta0 = RELE.acepta.bind(RELE), texto0 = RELE.texto.bind(RELE), trama0 = RELE.trama.bind(RELE);
  RELE.acepta = (ws, ip) => { ws.__n = ++nCon; return acepta0(ws, ip); };
  RELE.texto = (c, s) => { RECIBIDO.push({ n: c.ws.__n, txt: String(s) }); return texto0(c, s); };
  RELE.trama = (c, b) => { RECIBIDO.push({ n: c.ws.__n, bin: Buffer.from(b) }); return trama0(c, b); };
}
const mensajes = (t, desde) => RECIBIDO.slice(desde || 0).filter((x) => x.txt).map((x) => { try { return Object.assign(JSON.parse(x.txt), { _n: x.n }); } catch (_) { return null; } }).filter((m) => m && (!t || m.t === t));
const SERVIDOR = http.createServer((q, r) => { r.writeHead(404); r.end(); });
SERVIDOR.on('upgrade', (req, socket) => { if (!req.url.startsWith('/com')) return socket.destroy(); const ws = WS.acepta(req, socket); if (ws) RELE.acepta(ws, ''); });

// ---- la derivación, calculada aparte con node:crypto (no con cripto.js) ----
const ALF = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const FORMATO = /^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/;
const ikmU = (k) => Buffer.from('GUARDIANA código Ultra\n' + k, 'utf8');
const buzonNode = (k) => { const b = Buffer.from(crypto.hkdfSync('sha256', ikmU(k), Buffer.alloc(32), Buffer.from('GUARDIANA Ultra · buzón', 'utf8'), 8)); let n = 0n; for (const x of b) n = n * 256n + BigInt(x); return (n % 1000000000n).toString().padStart(9, '0'); };
function abreNode(k, buzon, sobre, sal) {
  const clave = Buffer.from(crypto.hkdfSync('sha256', ikmU(k), Buffer.from(sal, 'base64url'), Buffer.from('GUARDIANA Ultra · sobre', 'utf8'), 32));
  const b = Buffer.from(sobre, 'base64url'); if (b.length !== 60) throw new Error('largo ' + b.length);
  const d = crypto.createDecipheriv('aes-256-gcm', clave, b.subarray(0, 12)); d.setAAD(Buffer.from('GUARDIANA Ultra sobre\n' + buzon, 'utf8')); d.setAuthTag(b.subarray(44));
  return Buffer.concat([d.update(b.subarray(12, 44)), d.final()]);
}
const inventa = () => { let s = ''; for (const x of crypto.randomBytes(16)) s += ALF[x & 31]; return s; };

// ---- los navegadores ----
const SIN_PQ = 'Este navegador no puede abrir una sesión Ultra: hace falta uno actual con ML-KEM-1024 y ML-DSA-87. Pide a la otra persona una invitación Blindada.';
const MAL_U = 'Código erróneo, caducado o ya usado.';
const contextos = [];
async function equipo(browser, nombre, x) {
  x = x || {};
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 820 }, userAgent: PC, locale: 'es-CO' });
  contextos.push(ctx);
  await ctx.addInitScript((x) => {
    try { sessionStorage.setItem('gcom-sin-numero', '1'); } catch (_) {}
    // sin la capa postcuántica: pq-cnsa.js no consigue dejar ML-KEM-1024 ni ML-DSA-87 (C.B.hayBlindada() es false)
    if (x.sinPQ) for (const k of ['GuardianaMLKEM1024', 'GuardianaMLDSA87']) Object.defineProperty(globalThis, k, { get() { return undefined; }, set(_) {}, configurable: false });
    // los avisos (#aviso) y los estados del código Ultra (#ucod-estado), según salen
    window.__av = []; window.__estU = [];
    setInterval(() => { const a = document.querySelector('#aviso'); if (a && !a.hidden && a.textContent && window.__av[window.__av.length - 1] !== a.textContent) window.__av.push(a.textContent); const u = document.querySelector('#ucod-estado'); if (u && !u.hidden && u.textContent && window.__estU[window.__estU.length - 1] !== u.textContent) window.__estU.push(u.textContent); }, 40);
    window.__copiados = []; try { navigator.clipboard.writeText = (y) => { window.__copiados.push(String(y)); return Promise.resolve(); }; navigator.clipboard.write = (items) => Promise.all(items.map(async (it) => { const b = await it.getType('text/plain'); window.__copiados.push(await b.text()); })); } catch (_) {}
  }, x);
  const p = await ctx.newPage(); p.nombre = nombre; p.tramas = []; p.pedidas = [];
  p.on('websocket', (ws) => ws.on('framesent', (f) => p.tramas.push(typeof f.payload === 'string' ? { txt: f.payload } : { bin: Buffer.from(f.payload) })));
  p.on('request', (r) => p.pedidas.push(r.url()));
  p.on('pageerror', (e) => { console.log('[' + nombre + '] pageerror', String(e).slice(0, 300)); fallos.push('pageerror ' + nombre); });
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) console.log('[' + nombre + '] error: ' + m.text().slice(0, 200)); });
  await p.goto(URL0); await hasta(() => p.evaluate(() => !!(window.GuardianaCom && GuardianaCom.rele && GuardianaCom.rele.abierto)), 8000); await espera(400);
  return p;
}
const visible = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]')); }, s);
const texto = (P, s) => P.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ''; }, s);
const foto = (P, n) => P.screenshot({ path: path.join(OUT, n + '.png') });
// el chat Ultra va velado hasta mantenerlo pulsado: la captura, con el botón del ratón abajo sobre el chat (como en ultra.js)
async function fotoDestapada(P, n) { await P.evaluate(() => { document.activeElement && document.activeElement.blur(); }); await P.mouse.move(600, 450); await P.mouse.down(); await espera(300); await foto(P, n); await P.mouse.up(); }
const pulsa = (P, s) => P.evaluate((s) => document.querySelector(s).click(), s);
const enUltra = (P) => hasta(() => P.evaluate(() => [...GuardianaCom.convs.values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada && c.sesion.pq)), 20000);
const enBlindada = (P) => hasta(() => P.evaluate(() => [...GuardianaCom.convs.values()].some((c) => c.modo === 'normal' && c.huella && c.sesion && c.sesion.confirmada)), 20000);
const palabras = (P) => P.evaluate(() => { const e = document.querySelector('#cpalabras'); return e && !e.hidden ? document.querySelector('#cpalabras-txt').textContent : ''; });
async function creaUltra(P) {
  await pulsa(P, '#nueva-blindada');
  await hasta(() => visible(P, '#paso-enlace'), 8000); await espera(300);
  return P.evaluate(() => window.gcomPrueba.enlace() || '');
}
async function pideCodigo(P) {
  const antes = await texto(P, '#ucod-codigo');
  await P.click('#ucod-pide');
  await hasta(async () => { const t = await texto(P, '#ucod-codigo'); return t !== antes && FORMATO.test(t) && await visible(P, '#ucod-caja'); }, 8000);
  return texto(P, '#ucod-codigo');
}
async function abreEntrar(P) {
  if (!(await visible(P, '#paso-entrar'))) { await pulsa(P, '#unir'); await hasta(() => visible(P, '#paso-entrar'), 4000); }
  await P.fill('#unir-codigo', ''); await P.focus('#unir-codigo');
}
// escribe el código tecla a tecla (entra solo al completarlo) y espera al final: 'ok' (dentro) o el aviso del campo
async function escribeCodigo(P, txt) {
  await abreEntrar(P);
  await P.keyboard.type(txt, { delay: 25 });
  await hasta(() => P.evaluate(() => !document.querySelector('#unir-ok').disabled && document.querySelector('#unir-espera').hidden && (!document.querySelector('#unir-mal').hidden || document.querySelector('#paso-entrar').hidden)), 15000);
  await espera(200);
  return P.evaluate(() => (document.querySelector('#paso-entrar').hidden ? 'ok' : document.querySelector('#unir-mal').textContent));
}
// ¿lleva algo de lo recibido o mandado alguna forma del código? (normalizado, en grupos, en minúsculas o como se escribió)
const formas = (k, extra) => [...new Set([k, k.replace(/(.{4})(?=.)/g, '$1-'), k.toLowerCase(), k.replace(/(.{4})(?=.)/g, '$1-').toLowerCase(), k.replace(/(.{4})(?=.)/g, '$1 ').toLowerCase()].concat(extra || []))];
const decodifica = (u) => { try { return decodeURIComponent(u); } catch (_) { return u; } };
const llevaAlgo = (lista, fs) => lista.some((x) => fs.some((f) => (x.txt !== undefined ? x.txt.includes(f) : x.bin.includes(Buffer.from(f, 'utf8')))));

(async () => {
  await new Promise((r, m) => { SERVIDOR.once('error', m); SERVIDOR.listen(PUERTO, '127.0.0.1', r); });
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const codigos = []; // todos los códigos Ultra que salen en la prueba, con cómo se escribieron
  let semillaA = null;
  try {
    // ---- 1. A: la invitación Ultra y el código ----
    const A = await equipo(browser, 'A');
    const enlace = await creaUltra(A);
    semillaA = Buffer.from((enlace.split('#b=')[1] || ''), 'base64url');
    comprueba(/\/chat\/#b=[A-Za-z0-9_-]{43}$/.test(enlace) && semillaA.length === 32, '1. A crea Ultra: el enlace «#b=» con la semilla de 256 bits', enlace.slice(-50));
    comprueba(await visible(A, '#ucod-pide') && !(await visible(A, '#ucod-caja')) && (await texto(A, '#ucod-pide')) === 'Usar un código', '1. en la pantalla de la invitación Ultra (enlace y QR), «Usar un código»; ningún código hasta pulsarlo');
    comprueba(mensajes('invita').length === 0 && RELE.codigos.size === 0, '7. hasta pulsarlo, el relé no ha recibido ningún «invita» ni guarda nada');
    await foto(A, '01-a-invitacion-ultra');
    // el código; hasta que tenga un 0 (para escribirlo con una O): los que no lo tienen se cancelan (así se prueba «Cancelar el código»)
    let codigo = '', cancelados = 0, cancelOk = true;
    for (let i = 0; i < 24; i++) {
      codigo = await pideCodigo(A); codigos.push(codigo);
      if (codigo.includes('0')) break;
      await A.click('#ucod-quita');
      cancelOk = cancelOk && await hasta(async () => RELE.codigos.size === 0 && await visible(A, '#ucod-pide') && !(await visible(A, '#ucod-caja')), 4000);
      cancelados++;
    }
    const k = codigo.replace(/-/g, '');
    comprueba(FORMATO.test(codigo) && k.length === 16 && [...k].every((ch) => ALF.includes(ch)), '1. el código: 16 símbolos del alfabeto Crockford base32, en 4 grupos de 4', codigo);
    if (cancelados) comprueba(cancelOk, '1. «Cancelar el código» lo quita del relé y vuelve «Usar un código» (' + cancelados + ' veces)');
    const caja = await texto(A, '#ucod-caja');
    if (!/Vale 10 minutos/.test(caja)) console.log('caja:', caja);
    comprueba(/Vale 10 minutos y una sola vez\. Le quedan (10:00|[0-9]:[0-5][0-9])\./.test(caja) && caja.includes('Código Ultra') && caja.includes('Con el código, la llave de la conversación viaja cerrada con ese código, que el servidor de GUARDIANA no conoce.') && await visible(A, '#ucod-quita'), '1. en grande, con «Vale 10 minutos y una sola vez.», la cuenta atrás, la línea del servidor y «Cancelar el código»');
    const guardados = [...RELE.codigos.entries()];
    const [buzon, reg] = guardados[0] || [];
    comprueba(guardados.length === 1 && /^\d{9}$/.test(buzon) && buzon !== k && !k.includes(buzon), '1. el relé guarda un solo sobre, bajo un buzón de 9 cifras distinto del código', buzon);
    comprueba(buzon === buzonNode(k), '1. el buzón es HKDF-SHA256 del código (sin sal, «GUARDIANA Ultra · buzón», 8 bytes mod 10^9), calculado aparte en Node');
    let abierta = null; try { abierta = abreNode(k, buzon, reg.sobre, reg.sal); } catch (e) { abierta = null; }
    comprueba(!!abierta && Buffer.compare(abierta, semillaA) === 0 && /^[A-Za-z0-9_-]{80}$/.test(reg.sobre) && /^[A-Za-z0-9_-]{22}$/.test(reg.sal), '1. el sobre (iv ‖ AES-256-GCM ‖ etiqueta, 60 bytes; sal de 16), abierto en Node con el código, es la semilla del enlace «#b=»');
    let conOtro = true; try { abreNode(k, String((+buzon + 1) % 1e9).padStart(9, '0'), reg.sobre, reg.sal); } catch (_) { conOtro = false; }
    let conOtroCodigo = true; try { abreNode(inventa(), buzon, reg.sobre, reg.sal); } catch (_) { conOtroCodigo = false; }
    comprueba(!conOtro && !conOtroCodigo, '1. el sobre va atado a su buzón (datos asociados) y no abre con otro código');
    const invs = mensajes('invita');
    comprueba(invs.length === cancelados + 1 && invs.every((m) => /^\d{9}$/.test(m.codigo)) && invs[invs.length - 1].codigo === buzon && mensajes('retira').length === cancelados, '1. A mandó un «invita» por código pedido (buzón de 9 cifras) y un «retira» por cada uno cancelado', invs.map((m) => m.codigo));
    await foto(A, '02-a-codigo-ultra');

    // ---- 2. B lo escribe con minúsculas, espacios y una O en lugar de 0 ----
    const B = await equipo(browser, 'B');
    let escrito = k.replace(/(.{4})(?=.)/g, '$1 ').toLowerCase().replace('0', 'O');
    if (escrito.includes('1')) escrito = escrito.replace('1', 'l');
    codigos[codigos.length - 1] = { codigo, escrito };
    await abreEntrar(B);
    await B.keyboard.type(escrito.slice(0, -1), { delay: 30 }); await espera(300);
    const casillas = await B.evaluate(() => ({ ultra: document.querySelector('#unir-celdas').classList.contains('ultra'), llenas: document.querySelectorAll('.cc-u .cc.llena').length, valor: document.querySelector('#unir-codigo').value, falta: document.querySelector('#unir-ok').classList.contains('falta') }));
    comprueba(casillas.ultra && casillas.llenas === 15 && casillas.valor === codigo.slice(0, -1) && casillas.falta, '2. con letras, las 16 casillas del código Ultra; lo escrito ya sale en mayúsculas, sin espacios y con 0 (y 1)', [escrito, casillas]);
    comprueba((await texto(B, '#paso-entrar > h2')) === 'Escribe el código que te han enviado' && (await texto(B, '#unir-pista')) === '9 cifras, o el código Ultra de 16 caracteres' && await B.evaluate(() => { const c = document.querySelector('#unir-codigo'); return c.inputMode === 'text' && c.maxLength === 19 && !c.hasAttribute('pattern'); }), '2. la casilla: «9 cifras, o el código Ultra de 16 caracteres»; inputmode text, maxlength 19, sin pattern');
    await foto(B, '03-b-escribe-codigo-ultra');
    await B.keyboard.type(escrito.slice(-1));
    const dentro = await enUltra(A) && await enUltra(B);
    comprueba(dentro, '2. con el código escrito así, los dos en la sesión Ultra', escrito);
    comprueba((await A.evaluate(() => window.__estU)).includes('La otra persona ha escrito el código: conectando…'), '2. A vio el aviso de usado («codigo-usado»), el mismo que en la Blindada', await A.evaluate(() => window.__estU));
    comprueba(RELE.codigos.size === 0, '2. el relé ya no guarda nada: el sobre se dio una vez');
    const busB = mensajes('busca');
    comprueba(busB.length === 1 && busB[0].codigo === buzon, '2. lo que B pidió al relé fue el buzón de 9 cifras, no el código', busB.map((m) => m.codigo));
    await hasta(async () => (await palabras(A)).split(' · ').length === 4 && (await palabras(B)).split(' · ').length === 4, 20000);
    const pa = await palabras(A), pb = await palabras(B);
    comprueba(pa && pa === pb && pa.split(' · ').length === 4, '2. las cuatro palabras, las mismas en los dos', [pa, pb]);
    await A.fill('#texto', 'Hola desde A, con el código Ultra'); await A.click('#enviar');
    await B.fill('#texto', 'Y hola desde B'); await B.click('#enviar');
    const muestra = (P, t) => hasta(() => P.evaluate((t) => { document.querySelectorAll('.gc-velada .gc-velo-botones .boton.principal').forEach((b) => b.click()); return document.querySelector('#mensajes').textContent.includes(t); }, t), 15000);
    comprueba(await muestra(B, 'Hola desde A, con el código Ultra') && await muestra(A, 'Y hola desde B'), '2. mensajes en los dos sentidos');
    await espera(600); await fotoDestapada(B, '04-b-chat-ultra'); await fotoDestapada(A, '04-a-chat-ultra');

    // ---- 3. C escribe el mismo código otra vez ----
    const C = await equipo(browser, 'C');
    const r3 = await escribeCodigo(C, codigo);
    comprueba(r3 === MAL_U && (await C.evaluate(() => window.gcomPrueba.cuantas())) === 0, '3. el mismo código otra vez: «' + MAL_U + '», y no entra en nada', r3);
    await foto(C, '05-c-codigo-ya-usado');

    // ---- 4. un código Ultra inventado, una U, un mensaje pegado y normalizaCodigoU ----
    let inventado = inventa(); while (inventado === k) inventado = inventa();
    const r4 = await escribeCodigo(C, inventado);
    const sano = await C.evaluate(() => ({ rele: GuardianaCom.rele.abierto, ro: document.querySelector('#unir-codigo').readOnly, des: document.querySelector('#unir-ok').disabled, valor: document.querySelector('#unir-codigo').value, convs: window.gcomPrueba.cuantas() }));
    comprueba(r4 === MAL_U && sano.rele && !sano.ro && !sano.des && sano.valor === inventado.replace(/(.{4})(?=.)/g, '$1-') && sano.convs === 0, '4. un código Ultra inventado: el mismo mensaje; el campo sigue listo, con el código para corregirlo, y el relé conectado', [r4, sano]);
    const busAntes = mensajes('busca').length;
    await abreEntrar(C); await C.keyboard.type('K7QM2XRP9DTAH4WU', { delay: 20 }); await espera(800);
    const conU = await C.evaluate(() => ({ valor: document.querySelector('#unir-codigo').value, falta: document.querySelector('#unir-ok').classList.contains('falta'), mal: !document.querySelector('#unir-mal').hidden }));
    comprueba(conU.valor === 'K7QM-2XRP-9DTA-H4W' && conU.falta && !conU.mal && mensajes('busca').length === busAntes, '4. con una U (fuera del alfabeto) no llega a 16: «Entrar» espera y no se pide nada al relé', conU);
    await abreEntrar(C);
    await C.evaluate((t) => { const dt = new DataTransfer(); dt.setData('text/plain', t); document.querySelector('#unir-codigo').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); }, 'Este es tu código Ultra: ' + inventado.replace(/(.{4})(?=.)/g, '$1-').toLowerCase() + ' (vale 10 minutos)');
    await hasta(() => C.evaluate(() => !document.querySelector('#unir-mal').hidden), 10000);
    const pegado = await C.evaluate(() => ({ valor: document.querySelector('#unir-codigo').value, mal: document.querySelector('#unir-mal').textContent }));
    comprueba(pegado.valor === inventado.replace(/(.{4})(?=.)/g, '$1-') && pegado.mal === MAL_U, '4. pegado dentro de un mensaje, se toma el código (y, inventado, el mismo mensaje)', pegado);
    const norm = await C.evaluate(() => { const N = window.GuardianaCripto.normalizaCodigoU; return [N(' k7qm-2xrp 9dta.h4wn '), N('kOqm-2xrp-9dta-h4wl'), N('KIQM\u20132XRP\u00a09DTA\u00b7H4WN'), N('K7QM2XRP9DTAH4WU'), N('K7QM2XRP9DTAH4W'), N('K7QM2XRP9DTAH4WNN'), N('123456789'), N('K7QM_2XRP9DTAH4WN')]; });
    comprueba(JSON.stringify(norm) === JSON.stringify(['K7QM2XRP9DTAH4WN', 'K0QM2XRP9DTAH4W1', 'K1QM2XRP9DTAH4WN', null, null, null, null, null]), '4. normalizaCodigoU: mayúsculas, sin espacios, guiones ni puntos, O→0, I/L→1; con una U, 15 o 17 símbolos, 9 cifras u otro signo, no es un código Ultra', norm);
    await foto(C, '06-c-codigo-inventado');

    // ---- 5. el código de 9 cifras de la Blindada ----
    const D = await equipo(browser, 'D');
    const n0 = RECIBIDO.length;
    await pulsa(D, '#nueva');
    await hasta(async () => /^\d{3}-\d{3}-\d{3}$/.test(await texto(D, '#codigo')), 10000);
    const cod9 = await texto(D, '#codigo');
    await foto(D, '07-d-codigo-blindada');
    const invD = mensajes('invita', n0);
    // (al crearla, la Blindada pide el código dos veces, desde creaInvitacion y desde abreConv: así era antes; se ve el último)
    comprueba(/^\d{3}-\d{3}-\d{3}$/.test(cod9) && invD.some((m) => m.codigo === cod9.replace(/-/g, '')) && await visible(D, '#paso-codigo') && !(await visible(D, '#ucod')), '5. la Blindada: su código de 9 cifras y su pantalla de siempre, sin el bloque del código Ultra (el relé recibe ese código, como siempre)', [cod9, invD.map((m) => m.codigo)]);
    const r5 = await escribeCodigo(C, cod9);
    comprueba(r5 === 'ok' && await enBlindada(C) && await enBlindada(D), '5. el código de 9 cifras de la Blindada sigue funcionando: los dos en la Blindada', r5);
    await C.fill('#texto', 'Hola por la Blindada'); await C.click('#enviar');
    comprueba(await hasta(() => D.evaluate(() => document.querySelector('#mensajes').textContent.includes('Hola por la Blindada')), 10000), '5. y el mensaje llega');
    await foto(C, '08-c-chat-blindada');

    // ---- 6. sin la capa postcuántica ----
    const F = await equipo(browser, 'F');
    const enlaceF = await creaUltra(F);
    const codF = await pideCodigo(F); codigos.push(codF);
    const kF = codF.replace(/-/g, ''), buzonF = buzonNode(kF);
    const E = await equipo(browser, 'E', { sinPQ: true });
    comprueba(await E.evaluate(() => !window.GuardianaCripto.B.hayBlindada()), '6. E, un navegador sin ML-KEM-1024 ni ML-DSA-87');
    const nE = RECIBIDO.length;
    const r6 = await escribeCodigo(E, codF.toLowerCase());
    const avE = await E.evaluate(() => window.__av);
    comprueba(r6 === SIN_PQ && avE.includes(SIN_PQ), '6. con el código Ultra: el aviso de la capa postcuántica, en el campo y arriba', [r6, avE]);
    comprueba(mensajes('busca', nE).length === 0 && RELE.codigos.has(buzonF) && !(await F.evaluate(() => window.__estU)).includes('La otra persona ha escrito el código: conectando…'), '6. y el código no se gasta: no se pidió el sobre, el relé lo sigue guardando y F no ve «usado»');
    await foto(E, '09-e-sin-capa-codigo');
    await E.evaluate(() => { window.__av = []; });
    await E.goto(URL0 + '#b=' + enlaceF.split('#b=')[1]); await hasta(() => visible(E, '#aceptar-si'), 6000);
    await E.click('#aceptar-si'); await espera(1200);
    const avEnlace = await E.evaluate(() => window.__av);
    comprueba(avEnlace.length >= 1 && avEnlace[avEnlace.length - 1] === SIN_PQ && avEnlace.every((a) => a === SIN_PQ), '6. con el enlace «#b=», el mismo aviso (ya no lo tapa «Ese enlace no es una invitación de GUARDIANA.»)', avEnlace);
    await foto(E, '10-e-sin-capa-enlace');

    // ---- 8. caducado, cancelar la invitación y un corte con el relé (F) ----
    await F.evaluate(() => { const c = window.gcomPrueba.conv(); c.ucod.caduca = Date.now() - 1000; });
    await hasta(async () => (await texto(F, '#ucod-estado')) === 'Este código ha caducado (10 minutos). Pide uno nuevo.', 4000);
    comprueba((await texto(F, '#ucod-estado')) === 'Este código ha caducado (10 minutos). Pide uno nuevo.' && await visible(F, '#ucod-nuevo') && !(await visible(F, '#ucod-quita')) && await hasta(() => !RELE.codigos.has(buzonF), 3000), '8. a los 10 minutos (adelantados): el aviso de la Blindada, «Nuevo código», y fuera del relé');
    await foto(F, '11-f-codigo-caducado');
    await F.click('#ucod-nuevo');
    await hasta(async () => FORMATO.test(await texto(F, '#ucod-codigo')) && (await texto(F, '#ucod-codigo')) !== codF && !(await visible(F, '#ucod-nuevo')), 8000);
    const codF2 = await texto(F, '#ucod-codigo'); codigos.push(codF2);
    const buzonF2 = buzonNode(codF2.replace(/-/g, ''));
    comprueba(codF2 !== codF && RELE.codigos.has(buzonF2), '8. «Nuevo código»: otro código, en el relé');
    await pulsa(F, '#enlace-cancelar');
    comprueba(await hasta(() => !RELE.codigos.has(buzonF2), 4000) && (await F.evaluate(() => window.gcomPrueba.cuantas())) === 0, '8. al cancelar la invitación, su código sale del relé');
    await creaUltra(F); const codF3 = await pideCodigo(F); codigos.push(codF3);
    const buzonF3 = buzonNode(codF3.replace(/-/g, ''));
    const nCorte = RECIBIDO.length;
    await F.evaluate(() => window.gcomPrueba.corta());
    await hasta(() => F.evaluate(() => GuardianaCom.rele.abierto), 10000);
    await hasta(async () => (await texto(F, '#ucod-estado')) === 'Se cortó la conexión con el relé: pide un código nuevo.', 6000);
    comprueba((await texto(F, '#ucod-estado')) === 'Se cortó la conexión con el relé: pide un código nuevo.' && await visible(F, '#ucod-nuevo') && await hasta(() => !RELE.codigos.has(buzonF3), 4000) && mensajes('invita', nCorte).length === 0, '8. tras un corte con el relé: «Se cortó la conexión con el relé: pide un código nuevo.», el relé lo borra con la conexión vieja y no se vuelve a dejar solo');
    await foto(F, '12-f-codigo-perdido');

    // ---- 7. solo con el enlace ----
    for (const P of [A, B, C, D, E, F]) { try { await P.context().close(); } catch (_) {} }
    await espera(500);
    const n7 = RECIBIDO.length, guardados7 = RELE.codigos.size;
    const G = await equipo(browser, 'G'), H = await equipo(browser, 'H');
    const enlaceG = await creaUltra(G);
    await G.evaluate(() => window.gcomPrueba.corta());
    await hasta(() => G.evaluate(() => GuardianaCom.rele.abierto), 10000); await espera(1500);
    comprueba(mensajes('invita', n7).length === 0 && RELE.codigos.size === guardados7, '7. invitación Ultra por enlace: ningún «invita», tampoco tras reconectarse quien invita');
    await H.goto(URL0 + '#b=' + enlaceG.split('#b=')[1]); await hasta(() => visible(H, '#aceptar-si'), 6000); await H.click('#aceptar-si');
    comprueba(await enUltra(G) && await enUltra(H), '7. con el enlace, los dos en la sesión Ultra, como siempre');
    comprueba(mensajes('invita', n7).length === 0 && RELE.codigos.size === guardados7, '7. y el relé sigue sin recibir ningún «invita» ni guardar nada');

    // ---- el código, en nada de lo que recibió el relé ni de lo que mandaron o pidieron las páginas ----
    const todas = codigos.flatMap((x) => (typeof x === 'string' ? formas(x.replace(/-/g, '')) : formas(x.codigo.replace(/-/g, ''), [x.escrito])));
    const paginas = [A, B, C, D, E, F, G, H];
    comprueba(!llevaAlgo(RECIBIDO, todas), '1. ningún código Ultra (' + codigos.length + ') aparece en lo que recibió el relé: ' + RECIBIDO.length + ' mensajes y tramas');
    comprueba(!paginas.some((P) => llevaAlgo(P.tramas, todas)) && !paginas.some((P) => P.pedidas.some((u) => todas.some((f) => decodifica(u).includes(f)))), '1. ni en lo que mandaron las páginas por el WebSocket, ni en ninguna dirección que pidieron');
  } catch (e) { console.log('ERROR', e && e.stack || e); fallos.push('excepción'); }
  for (const c of contextos) { try { await c.close(); } catch (_) {} }
  await browser.close(); SERVIDOR.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO OK');
  process.exit(fallos.length ? 1 : 0);
})();
