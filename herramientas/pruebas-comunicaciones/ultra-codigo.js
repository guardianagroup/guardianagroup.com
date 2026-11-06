// Ultra también con un código (6 nov 2026; el dueño lo eligió así). Además del enlace «#b=», una invitación Ultra se puede compartir con
// un código de 16 caracteres (Crockford base32, 80 bits) que el relé no recibe: al relé va un buzón de 9 cifras que sale del código y el
// sobre, la semilla cerrada con AES-GCM y una clave que también sale del código. Del código, M = PBKDF2-SHA256 (300 000 vueltas) y de M,
// con HKDF, el buzón y la clave (cripto.js: nuevoCodigoU, normalizaCodigoU, derivaCodigoU, cierraSobreU, abreSobreU, preparaCodigoU).
// El diseño, para la revisión: ULTRA-CODIGO.md, en esta carpeta.
//
// La prueba levanta su propio relé (zero-motor/comunicaciones.js, en este mismo proceso, en el puerto 8795 o RELE_PUERTO) para ver lo
// que guarda y todo lo que recibe, y abre las páginas con «?rele=ws://127.0.0.1:8795». Solo hace falta la web, desde la raíz:
//     python3 -m http.server 8080 --bind 127.0.0.1
// y, desde esta carpeta: node ultra-codigo.js [carpeta de capturas]
//   1. A crea Ultra (enlace y QR); tras «Copiar enlace», en la espera, sigue «Usar un código» (revisión, M2). El código: 4 grupos de 4
//      del alfabeto. El relé guarda un buzón de 9 cifras distinto del código, el que sale en Node con PBKDF2 y HKDF, y su sobre, abierto
//      en Node con el código, es la semilla del enlace «#b=» (y con otro buzón no abre). «Cancelar el código» lo quita del relé. El
//      código no aparece en nada de lo que recibe el relé, ni en lo que mandan las páginas, ni en las direcciones que piden.
//   2. B lo escribe con minúsculas, espacios y una O en lugar de 0 (y una l en lugar de 1, si la hay): las 16 casillas, la sesión Ultra,
//      las cuatro palabras iguales en los dos y mensajes en los dos sentidos; A vio «Alguien ha escrito el código» y el relé ya no
//      guarda nada.
//   3. C escribe el mismo código otra vez: «Código erróneo, caducado o ya usado.» y no entra en nada.
//   4. C escribe un código Ultra inventado: el mismo mensaje y nada se rompe. Con una U no llega a 16 ni se pide nada al relé; pegado
//      dentro de un mensaje, se toma el código; un mensaje sin código pegado no toca la casilla (revisión, B1); en ancho completo, vale
//      (S3). Y normalizaCodigoU, en la página.
//   5. La Blindada de 9 cifras: un solo «invita» al crearla (revisión, E2); tras un corte con el relé, un código nuevo en pantalla y en
//      el relé (E3); y C entra con él.
//   6. Sin la capa postcuántica: el aviso, en la casilla y sin el flotante (B2), como el que da el enlace «#b=», y el código no se gasta.
//   7. Un código Ultra que empieza por 9 cifras (forzado: nuevoCodigoU ya no los da) no manda esas 9 cifras al relé, se escriba
//      despacio o deprisa (revisión, M1); y lo que se escribe mientras se comprueba no se pierde: un error corregido entonces entra solo.
//   8. A los 10 minutos (aquí, adelantado): caducado, «Nuevo código» y fuera del relé; al cancelar la invitación, fuera del relé; tras un
//      corte, perdido («crea uno nuevo») y no se vuelve a dejar solo; si alguien recoge el sobre y no entra, a los 30 s (adelantados)
//      «Nuevo código» (B3); y dos invitaciones que piden código a la vez tienen las dos el suyo (B4).
//   9. Solo con el enlace, el relé no recibe ningún «invita», tampoco si quien invita se reconecta (antes del 6 nov 2026 se colaba uno).
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
const maestro = (k) => crypto.pbkdf2Sync(Buffer.from(k, 'utf8'), Buffer.from('GUARDIANA código Ultra v1', 'utf8'), 300000, 32, 'sha256');
const buzonNode = (k) => { const b = Buffer.from(crypto.hkdfSync('sha256', maestro(k), Buffer.alloc(32), Buffer.from('GUARDIANA Ultra · buzón', 'utf8'), 8)); let n = 0n; for (const x of b) n = n * 256n + BigInt(x); return (n % 1000000000n).toString().padStart(9, '0'); };
function abreNode(k, buzon, sobre, sal) {
  const clave = Buffer.from(crypto.hkdfSync('sha256', maestro(k), Buffer.from(sal, 'base64url'), Buffer.from('GUARDIANA Ultra · sobre', 'utf8'), 32));
  const b = Buffer.from(sobre, 'base64url'); if (b.length !== 60) throw new Error('largo ' + b.length);
  const d = crypto.createDecipheriv('aes-256-gcm', clave, b.subarray(0, 12)); d.setAAD(Buffer.from('GUARDIANA Ultra sobre\n' + buzon, 'utf8')); d.setAuthTag(b.subarray(44));
  return Buffer.concat([d.update(b.subarray(12, 44)), d.final()]);
}
const inventa = () => { for (;;) { let s = ''; for (const x of crypto.randomBytes(16)) s += ALF[x & 31]; if (!/^\d{9}/.test(s)) return s; } };
const bonito = (k) => k.replace(/(.{4})(?=.)/g, '$1-');

// ---- los navegadores ----
const SIN_PQ = 'Este navegador no puede abrir una sesión Ultra: hace falta uno actual con ML-KEM-1024 y ML-DSA-87. Pide a la otra persona una invitación Blindada.';
const MAL_U = 'Código erróneo, caducado o ya usado.';
const ALGUIEN = 'Alguien ha escrito el código: conectando…';
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
const enUltra = (P, ms) => hasta(() => P.evaluate(() => [...GuardianaCom.convs.values()].some((c) => c.modo === 'blindada' && c.huella && c.sesion && c.sesion.confirmada && c.sesion.pq)), ms || 20000);
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
// escribe el código tecla a tecla (entra solo al completarlo; 9 cifras, a los 800 ms) y espera al final: 'ok' (dentro) o el aviso del campo
async function escribeCodigo(P, txt, retardo) {
  await abreEntrar(P);
  await P.keyboard.type(txt, { delay: retardo || 25 });
  await espera(1000);
  await hasta(() => P.evaluate(() => !document.querySelector('#unir-ok').disabled && document.querySelector('#unir-espera').hidden && (!document.querySelector('#unir-mal').hidden || document.querySelector('#paso-entrar').hidden)), 15000);
  await espera(200);
  return P.evaluate(() => (document.querySelector('#paso-entrar').hidden ? 'ok' : document.querySelector('#unir-mal').textContent));
}
const pega = (P, t) => P.evaluate((t) => { const dt = new DataTransfer(); dt.setData('text/plain', t); document.querySelector('#unir-codigo').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); }, t);
// ¿lleva algo de lo recibido o mandado alguna forma del código? (normalizado, en grupos, en minúsculas o como se escribió)
const formas = (k, extra) => [...new Set([k, bonito(k), k.toLowerCase(), bonito(k).toLowerCase(), k.replace(/(.{4})(?=.)/g, '$1 ').toLowerCase()].concat(extra || []))];
const decodifica = (u) => { try { return decodeURIComponent(u); } catch (_) { return u; } };
const llevaAlgo = (lista, fs) => lista.some((x) => fs.some((f) => (x.txt !== undefined ? x.txt.includes(f) : x.bin.includes(Buffer.from(f, 'utf8')))));

(async () => {
  await new Promise((r, m) => { SERVIDOR.once('error', m); SERVIDOR.listen(PUERTO, '127.0.0.1', r); });
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const codigos = []; // todos los códigos Ultra que salen en la prueba (y cómo se escribieron), para buscarlos al final
  const paginas = [];
  const nuevo = async (nombre, x) => { const p = await equipo(browser, nombre, x); paginas.push(p); return p; };
  try {
    // ---- 1. A: la invitación Ultra, «Copiar enlace» y el código ----
    const A = await nuevo('A');
    const enlace = await creaUltra(A);
    const semillaA = Buffer.from((enlace.split('#b=')[1] || ''), 'base64url');
    comprueba(/\/chat\/#b=[A-Za-z0-9_-]{43}$/.test(enlace) && semillaA.length === 32, '1. A crea Ultra: el enlace «#b=» con la semilla de 256 bits', enlace.slice(-50));
    comprueba(await visible(A, '#ucod-pide') && !(await visible(A, '#ucod-caja')) && (await texto(A, '#ucod-pide')) === 'Usar un código', '1. en la pantalla de la invitación Ultra (enlace y QR), «Usar un código»; ningún código hasta pulsarlo');
    comprueba(mensajes('invita').length === 0 && RELE.codigos.size === 0, '9. hasta pulsarlo, el relé no ha recibido ningún «invita» ni guarda nada');
    await foto(A, '01-a-invitacion-ultra');
    await A.click('#enlace-copiar'); await espera(500);
    comprueba(await visible(A, '#enlace-espera') && !(await visible(A, '#enlace-vista')) && await visible(A, '#ucod-pide'), '1. tras «Copiar enlace», en la espera, sigue «Usar un código» (revisión, M2)');
    await foto(A, '02-a-espera-con-usar-un-codigo');
    // el código; hasta que tenga un 0 (para escribirlo con una O): los que no lo tienen se cancelan (así se prueba «Cancelar el código»,
    // que vuelve a la espera con «Usar un código»)
    let codigo = '', cancelados = 0, cancelOk = true, desdeEspera = null;
    for (let i = 0; i < 24; i++) {
      codigo = await pideCodigo(A); codigos.push(codigo);
      if (desdeEspera === null) desdeEspera = await visible(A, '#enlace-vista') && await visible(A, '#ucod-caja');
      if (codigo.includes('0')) break;
      await A.click('#ucod-quita');
      cancelOk = cancelOk && await hasta(async () => RELE.codigos.size === 0 && await visible(A, '#ucod-pide') && !(await visible(A, '#ucod-caja')), 4000);
      cancelados++;
    }
    comprueba(desdeEspera, '1. pedido desde la espera, la invitación vuelve a verse entera: el enlace y el código');
    const k = codigo.replace(/-/g, '');
    comprueba(FORMATO.test(codigo) && k.length === 16 && [...k].every((ch) => ALF.includes(ch)) && !/^\d{9}/.test(k), '1. el código: 16 símbolos del alfabeto Crockford base32, en 4 grupos de 4 (y no empieza por 9 cifras)', codigo);
    if (cancelados) comprueba(cancelOk, '1. «Cancelar el código» lo quita del relé y vuelve «Usar un código» (' + cancelados + ' veces)');
    const caja = await texto(A, '#ucod-caja');
    comprueba(/Vale 10 minutos y una sola vez\. Le quedan (10:00|[0-9]:[0-5][0-9])\./.test(caja) && caja.includes('Código Ultra') && caja.includes('Con el código, la llave de la conversación viaja cerrada con ese código, que el servidor de GUARDIANA no conoce.') && await visible(A, '#ucod-quita'), '1. en grande, con «Vale 10 minutos y una sola vez.», la cuenta atrás, la línea del servidor y «Cancelar el código»', caja.slice(0, 60));
    const guardados = [...RELE.codigos.entries()];
    const [buzon, reg] = guardados[0] || [];
    comprueba(guardados.length === 1 && /^\d{9}$/.test(buzon) && !k.includes(buzon), '1. el relé guarda un solo sobre, bajo un buzón de 9 cifras distinto del código', buzon);
    comprueba(buzon === buzonNode(k), '1. el buzón: HKDF-SHA256 (sin sal, «GUARDIANA Ultra · buzón», 8 bytes mod 10^9) de M = PBKDF2-SHA256(código, «GUARDIANA código Ultra v1», 300 000), calculado aparte en Node');
    let abierta = null; try { abierta = abreNode(k, buzon, reg.sobre, reg.sal); } catch (e) { abierta = null; }
    comprueba(!!abierta && Buffer.compare(abierta, semillaA) === 0 && /^[A-Za-z0-9_-]{80}$/.test(reg.sobre) && /^[A-Za-z0-9_-]{22}$/.test(reg.sal), '1. el sobre (iv ‖ AES-256-GCM ‖ etiqueta, 60 bytes; sal de 16), abierto en Node con el código, es la semilla del enlace «#b=»');
    let conOtro = true; try { abreNode(k, String((+buzon + 1) % 1e9).padStart(9, '0'), reg.sobre, reg.sal); } catch (_) { conOtro = false; }
    let conOtroCodigo = true; try { abreNode(inventa(), buzon, reg.sobre, reg.sal); } catch (_) { conOtroCodigo = false; }
    comprueba(!conOtro && !conOtroCodigo, '1. el sobre va atado a su buzón (datos asociados) y no abre con otro código');
    const invs = mensajes('invita');
    comprueba(invs.length === cancelados + 1 && invs.every((m) => /^\d{9}$/.test(m.codigo)) && invs[invs.length - 1].codigo === buzon && mensajes('retira').length === cancelados, '1. A mandó un «invita» por código pedido (buzón de 9 cifras) y un «retira» por cada uno cancelado', invs.map((m) => m.codigo));
    await foto(A, '03-a-codigo-ultra');

    // ---- 2. B lo escribe con minúsculas, espacios y una O en lugar de 0 ----
    const B = await nuevo('B');
    let escrito = k.replace(/(.{4})(?=.)/g, '$1 ').toLowerCase().replace('0', 'O');
    if (escrito.includes('1')) escrito = escrito.replace('1', 'l');
    codigos[codigos.length - 1] = { codigo, escrito };
    await abreEntrar(B);
    await B.keyboard.type(escrito.slice(0, -1), { delay: 30 }); await espera(300);
    const casillas = await B.evaluate(() => ({ ultra: document.querySelector('#unir-celdas').classList.contains('ultra'), llenas: document.querySelectorAll('.cc-u .cc.llena').length, valor: document.querySelector('#unir-codigo').value, falta: document.querySelector('#unir-ok').classList.contains('falta') }));
    comprueba(casillas.ultra && casillas.llenas === 15 && casillas.valor === codigo.slice(0, -1) && casillas.falta, '2. con letras, las 16 casillas del código Ultra; lo escrito ya sale en mayúsculas, sin espacios y con 0 (y 1)', [escrito, casillas]);
    comprueba((await texto(B, '#paso-entrar > h2')) === 'Escribe el código que te han enviado' && (await texto(B, '#unir-pista')) === '9 cifras, o el código Ultra de 16 caracteres' && await B.evaluate(() => { const c = document.querySelector('#unir-codigo'); return c.inputMode === 'text' && c.maxLength === 19 && !c.hasAttribute('pattern'); }), '2. la casilla: «9 cifras, o el código Ultra de 16 caracteres»; inputmode text, maxlength 19, sin pattern');
    await foto(B, '04-b-escribe-codigo-ultra');
    await B.keyboard.type(escrito.slice(-1));
    comprueba(await enUltra(A) && await enUltra(B), '2. con el código escrito así, los dos en la sesión Ultra', escrito);
    comprueba((await A.evaluate(() => window.__estU)).includes(ALGUIEN), '2. A vio «' + ALGUIEN + '» (codigo-usado)', await A.evaluate(() => window.__estU));
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
    await espera(600); await fotoDestapada(B, '05-b-chat-ultra');

    // ---- 3. C escribe el mismo código otra vez ----
    const C = await nuevo('C');
    const r3 = await escribeCodigo(C, codigo);
    comprueba(r3 === MAL_U && (await C.evaluate(() => window.gcomPrueba.cuantas())) === 0, '3. el mismo código otra vez: «' + MAL_U + '», y no entra en nada', r3);
    await foto(C, '06-c-codigo-ya-usado');

    // ---- 4. inventado, una U, pegados y normalizaCodigoU ----
    const inventado = inventa();
    const r4 = await escribeCodigo(C, inventado);
    const sano = await C.evaluate(() => ({ rele: GuardianaCom.rele.abierto, ro: document.querySelector('#unir-codigo').readOnly, des: document.querySelector('#unir-ok').disabled, valor: document.querySelector('#unir-codigo').value, convs: window.gcomPrueba.cuantas() }));
    comprueba(r4 === MAL_U && sano.rele && !sano.ro && !sano.des && sano.valor === bonito(inventado) && sano.convs === 0, '4. un código Ultra inventado: el mismo mensaje; el campo sigue listo, con el código para corregirlo, y el relé conectado', [r4, sano]);
    let n4 = RECIBIDO.length;
    await abreEntrar(C); await C.keyboard.type('K7QM2XRP9DTAH4WU', { delay: 20 }); await espera(800);
    const conU = await C.evaluate(() => ({ valor: document.querySelector('#unir-codigo').value, falta: document.querySelector('#unir-ok').classList.contains('falta'), mal: !document.querySelector('#unir-mal').hidden }));
    comprueba(conU.valor === 'K7QM-2XRP-9DTA-H4W' && conU.falta && !conU.mal && mensajes('busca', n4).length === 0, '4. con una U (fuera del alfabeto) no llega a 16: «Entrar» espera y no se pide nada al relé', conU);
    await abreEntrar(C);
    await pega(C, 'Este es tu código Ultra: ' + bonito(inventado).toLowerCase() + ' (vale 10 minutos)');
    await hasta(() => C.evaluate(() => !document.querySelector('#unir-mal').hidden), 10000);
    const pegado = await C.evaluate(() => ({ valor: document.querySelector('#unir-codigo').value, mal: document.querySelector('#unir-mal').textContent }));
    comprueba(pegado.valor === bonito(inventado) && pegado.mal === MAL_U, '4. pegado dentro de un mensaje, se toma el código (y, inventado, el mismo mensaje)', pegado);
    const sinCodigo = [];
    for (const t of ['hola, ¿qué tal? te llamo luego para darte el código', 'Mi número es 300 123 4567, llámame', 'ABCDEFGHJKMNPQRSTVWXYZ']) {
      n4 = RECIBIDO.length; await abreEntrar(C); await pega(C, t); await espera(1300);
      sinCodigo.push({ t: t.slice(0, 20), valor: await C.evaluate(() => document.querySelector('#unir-codigo').value), busca: mensajes('busca', n4).length });
    }
    comprueba(sinCodigo.every((x) => x.valor === '' && x.busca === 0), '4. un mensaje pegado sin código no toca la casilla ni pide nada al relé (revisión, B1)', sinCodigo);
    n4 = RECIBIDO.length; await abreEntrar(C);
    const ancho = [...bonito(inventado)].map((ch) => String.fromCharCode(ch === '-' ? 0xff0d : ch.charCodeAt(0) + 0xfee0)).join('');
    await pega(C, ancho); await hasta(() => C.evaluate(() => !document.querySelector('#unir-mal').hidden), 10000);
    const anchoR = await C.evaluate(() => ({ valor: document.querySelector('#unir-codigo').value, mal: document.querySelector('#unir-mal').textContent }));
    comprueba(anchoR.valor === bonito(inventado) && anchoR.mal === MAL_U && mensajes('busca', n4).length === 1, '4. en ancho completo (NFKC), el mismo código (revisión, S3)', [ancho, anchoR]);
    const norm = await C.evaluate(() => { const N = window.GuardianaCripto.normalizaCodigoU, f = String.fromCharCode; return [N(' k7qm-2xrp 9dta.h4wn '), N('kOqm-2xrp-9dta-h4wl'), N('KIQM' + f(0x2013) + '2XRP' + f(0xa0) + '9DTA' + f(0xb7) + 'H4WN'), N('Ｋ７ＱＭ２ＸＲＰ９ＤＴＡＨ４ＷＮ'), N('K7QM2XRP9DTAH4WU'), N('K7QM2XRP9DTAH4W'), N('K7QM2XRP9DTAH4WNN'), N('123456789'), N('K7QM_2XRP9DTAH4WN')]; });
    comprueba(JSON.stringify(norm) === JSON.stringify(['K7QM2XRP9DTAH4WN', 'K0QM2XRP9DTAH4W1', 'K1QM2XRP9DTAH4WN', 'K7QM2XRP9DTAH4WN', null, null, null, null, null]), '4. normalizaCodigoU: NFKC, mayúsculas, sin espacios, guiones ni puntos, O→0, I/L→1; con una U, 15 o 17 símbolos, 9 cifras u otro signo, no es un código Ultra', norm);
    await foto(C, '07-c-codigo-inventado');

    // ---- 5. la Blindada de 9 cifras: un solo código, uno nuevo tras un corte, y se entra ----
    const D = await nuevo('D');
    let n5 = RECIBIDO.length;
    await pulsa(D, '#nueva');
    await hasta(async () => /^\d{3}-\d{3}-\d{3}$/.test(await texto(D, '#codigo')), 10000); await espera(1500);
    const cod9a = await texto(D, '#codigo');
    await foto(D, '08-d-codigo-blindada');
    const invD = mensajes('invita', n5);
    comprueba(/^\d{3}-\d{3}-\d{3}$/.test(cod9a) && invD.length === 1 && invD[0].codigo === cod9a.replace(/-/g, '') && RELE.codigos.has(cod9a.replace(/-/g, '')) && await visible(D, '#paso-codigo') && !(await visible(D, '#ucod')), '5. la Blindada: su pantalla de siempre y un solo «invita», el del código que enseña (revisión, E2)', [cod9a, invD.map((m) => m.codigo)]);
    n5 = RECIBIDO.length;
    await D.evaluate(() => window.gcomPrueba.corta());
    await hasta(() => D.evaluate(() => GuardianaCom.rele.abierto), 10000);
    await hasta(async () => { const t = await texto(D, '#codigo'); return /^\d{3}-\d{3}-\d{3}$/.test(t) && t !== cod9a; }, 10000);
    const cod9 = await texto(D, '#codigo'), inv5 = mensajes('invita', n5);
    comprueba(cod9 !== cod9a && inv5.length === 1 && inv5[0].codigo === cod9.replace(/-/g, '') && RELE.codigos.has(cod9.replace(/-/g, '')) && await hasta(() => !RELE.codigos.has(cod9a.replace(/-/g, '')), 4000), '5. tras un corte con el relé, la Blindada enseña un código nuevo, que está en el relé; el viejo, ya no (revisión, E3)', [cod9a, cod9]);
    const r5 = await escribeCodigo(C, cod9);
    comprueba(r5 === 'ok' && await enBlindada(C) && await enBlindada(D), '5. el código de 9 cifras de la Blindada sigue funcionando (escrito a mano, entra a los 800 ms): los dos en la Blindada', r5);
    await C.fill('#texto', 'Hola por la Blindada'); await C.click('#enviar');
    comprueba(await hasta(() => D.evaluate(() => document.querySelector('#mensajes').textContent.includes('Hola por la Blindada')), 10000), '5. y el mensaje llega');
    await foto(C, '09-c-chat-blindada');

    // ---- 6. sin la capa postcuántica ----
    const F = await nuevo('F');
    const enlaceF = await creaUltra(F);
    const codF = await pideCodigo(F); codigos.push(codF);
    const kF = codF.replace(/-/g, ''), buzonF = buzonNode(kF);
    const E = await nuevo('E', { sinPQ: true });
    comprueba(await E.evaluate(() => !window.GuardianaCripto.B.hayBlindada()), '6. E, un navegador sin ML-KEM-1024 ni ML-DSA-87');
    const nE = RECIBIDO.length;
    const r6 = await escribeCodigo(E, codF.toLowerCase());
    const avE = await E.evaluate(() => window.__av), ambar = await E.evaluate(() => document.querySelector('#unir-mal').classList.contains('sin-red'));
    comprueba(r6 === SIN_PQ && ambar && !avE.includes(SIN_PQ), '6. con el código Ultra: el aviso, en la casilla y en ámbar, sin el flotante que tapaba los botones (revisión, B2)', [r6, ambar, avE]);
    comprueba(mensajes('busca', nE).length === 0 && RELE.codigos.has(buzonF) && !(await F.evaluate(() => window.__estU)).includes(ALGUIEN), '6. y el código no se gasta: no se pidió el sobre, el relé lo sigue guardando y F no ve «usado»');
    await foto(E, '10-e-sin-capa-codigo');
    await E.evaluate(() => { window.__av = []; });
    await E.goto(URL0 + '#b=' + enlaceF.split('#b=')[1]); await hasta(() => visible(E, '#aceptar-si'), 6000);
    await E.click('#aceptar-si'); await espera(1200);
    const avEnlace = await E.evaluate(() => window.__av);
    comprueba(avEnlace.length >= 1 && avEnlace.every((a) => a === SIN_PQ), '6. con el enlace «#b=», el mismo texto, en el aviso de siempre (ya no lo tapa «Ese enlace no es una invitación de GUARDIANA.»)', avEnlace);
    await foto(E, '11-e-sin-capa-enlace');

    // ---- 7. un código Ultra que empieza por 9 cifras (forzado) y lo que se escribe mientras se comprueba ----
    const G = await nuevo('G');
    await creaUltra(G);
    await G.evaluate(() => { window.GuardianaCripto.nuevoCodigoU = () => '123456789ABCDEFG'; });
    const codG = await pideCodigo(G); codigos.push(codG);
    comprueba(codG === '1234-5678-9ABC-DEFG', '7. G tiene, forzado, un código que empieza por 9 cifras', codG);
    const H = await nuevo('H');
    const n7 = RECIBIDO.length;
    const r7 = await escribeCodigo(H, '123456789ABCDEFG', 300);
    const bus7 = mensajes('busca', n7).map((m) => m.codigo);
    comprueba(r7 === 'ok' && await enUltra(H) && !bus7.includes('123456789') && bus7.length === 1 && bus7[0] === buzonNode('123456789ABCDEFG'), '7. escrito despacio (300 ms por tecla): ningún «busca» con esas 9 cifras; solo el buzón, y entra (revisión, M1)', bus7);
    const G2 = await nuevo('G2');
    await creaUltra(G2);
    await G2.evaluate(() => { window.GuardianaCripto.nuevoCodigoU = () => '987654321KMNPQRS'; });
    const codG2 = await pideCodigo(G2); codigos.push(codG2);
    const busca0 = RELE.busca.bind(RELE); RELE.busca = (c, m) => setTimeout(() => busca0(c, m), 1500); // un relé lento
    const H2 = await nuevo('H2');
    const n7b = RECIBIDO.length;
    await abreEntrar(H2);
    await H2.keyboard.type('987654321KMNPQRT', { delay: 25 }); // la última, mal
    await espera(300);
    const comprobando = await visible(H2, '#unir-espera');
    await H2.keyboard.press('Backspace'); await H2.keyboard.type('S'); // corregida mientras se comprueba
    const valorCorregido = await H2.evaluate(() => document.querySelector('#unir-codigo').value);
    const dentro7 = await enUltra(H2, 15000);
    RELE.busca = busca0;
    const bus7b = mensajes('busca', n7b).map((m) => m.codigo);
    const fin7 = await H2.evaluate(() => ({ mal: document.querySelector('#unir-mal').hidden ? '' : document.querySelector('#unir-mal').textContent }));
    comprueba(comprobando && valorCorregido === '9876-5432-1KMN-PQRS' && dentro7 && !bus7b.includes('987654321') && JSON.stringify(bus7b) === JSON.stringify([buzonNode('987654321KMNPQRT'), buzonNode('987654321KMNPQRS')]) && !fin7.mal, '7. escrito deprisa con el relé lento: ninguna tecla perdida mientras se comprueba; el error corregido entonces entra solo, sin mensaje de lo anterior, y nunca esas 9 cifras al relé', { comprobando, valorCorregido, bus7b, fin7 });
    await foto(H2, '12-h2-dentro-tras-corregir');

    // ---- 8. caducado, cancelar la invitación, un corte, sobre recogido por otro y dos a la vez (F) ----
    await F.evaluate(() => { const c = window.gcomPrueba.conv(); c.ucod.caduca = Date.now() - 1000; });
    await hasta(async () => (await texto(F, '#ucod-estado')) === 'Este código ha caducado (10 minutos). Pide uno nuevo.', 4000);
    comprueba((await texto(F, '#ucod-estado')) === 'Este código ha caducado (10 minutos). Pide uno nuevo.' && await visible(F, '#ucod-nuevo') && !(await visible(F, '#ucod-quita')) && await hasta(() => !RELE.codigos.has(buzonF), 3000), '8. a los 10 minutos (adelantados): el aviso de la Blindada, «Nuevo código», y fuera del relé');
    await foto(F, '13-f-codigo-caducado');
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
    const PERDIDO = 'Se cortó la conexión con el relé: crea uno nuevo.';
    await hasta(async () => (await texto(F, '#ucod-estado')) === PERDIDO, 6000);
    comprueba((await texto(F, '#ucod-estado')) === PERDIDO && await visible(F, '#ucod-nuevo') && await hasta(() => !RELE.codigos.has(buzonF3), 4000) && mensajes('invita', nCorte).length === 0, '8. tras un corte con el relé: «' + PERDIDO + '», el relé lo borra con la conexión vieja y no se vuelve a dejar solo');
    await foto(F, '14-f-codigo-perdido');
    // B3: alguien recoge el sobre con el buzón (sin poder abrirlo) y no entra
    await F.click('#ucod-nuevo');
    await hasta(async () => FORMATO.test(await texto(F, '#ucod-codigo')) && (await texto(F, '#ucod-codigo')) !== codF3 && !(await visible(F, '#ucod-nuevo')), 8000);
    const codF4 = await texto(F, '#ucod-codigo'); codigos.push(codF4);
    const buzonF4 = buzonNode(codF4.replace(/-/g, ''));
    const X = await nuevo('X');
    const robo = await X.evaluate((b) => GuardianaCom.rele.busca(b), buzonF4);
    await hasta(async () => (await texto(F, '#ucod-estado')) === ALGUIEN, 4000);
    const antes30 = { estado: await texto(F, '#ucod-estado'), nuevo: await visible(F, '#ucod-nuevo'), quita: await visible(F, '#ucod-quita') };
    await F.evaluate(() => { const c = window.gcomPrueba.conv(); c.ucod.usadoEn = Date.now() - 31000; });
    const a30 = await hasta(() => visible(F, '#ucod-nuevo'), 3000);
    comprueba(robo.ok && antes30.estado === ALGUIEN && !antes30.nuevo && !antes30.quita && a30, '8. si alguien recoge el sobre y no entra: «' + ALGUIEN + '» y, a los 30 s (adelantados), «Nuevo código» (revisión, B3)', antes30);
    await foto(F, '15-f-recogido-sin-entrar');
    await F.click('#ucod-nuevo');
    await hasta(async () => FORMATO.test(await texto(F, '#ucod-codigo')) && (await texto(F, '#ucod-codigo')) !== codF4, 8000);
    const codF5 = await texto(F, '#ucod-codigo'); codigos.push(codF5);
    comprueba(codF5 !== codF4 && RELE.codigos.has(buzonNode(codF5.replace(/-/g, ''))), '8. y con él, otro código en el relé');
    // B4: dos invitaciones Ultra piden código a la vez (la primera, sin el suyo: «Cancelar el código»)
    await F.click('#ucod-quita');
    await hasta(async () => !RELE.codigos.has(buzonNode(codF5.replace(/-/g, ''))) && await visible(F, '#ucod-pide'), 4000);
    const c1 = await F.evaluate(() => window.gcomPrueba.conv().id);
    await F.evaluate(() => document.querySelector('#nueva-blindada').click()); await espera(2500);
    const c2 = await F.evaluate(() => window.gcomPrueba.conv().id);
    await F.evaluate(async ([a, b]) => { await window.gcomPrueba.abre(a); document.querySelector('#ucod-pide').click(); await window.gcomPrueba.abre(b); document.querySelector('#ucod-pide').click(); }, [c1, c2]);
    await hasta(() => F.evaluate(([a, b]) => [a, b].every((id) => { const c = GuardianaCom.convs.get(id); return c && c.ucod && !c.ucodPidiendo; }), [c1, c2]), 10000);
    const dos = await F.evaluate(([a, b]) => [a, b].map((id) => { const c = GuardianaCom.convs.get(id); return c && c.ucod ? { codigo: c.ucod.codigo, buzon: c.ucod.buzon } : null; }), [c1, c2]);
    for (const x of dos) if (x) codigos.push(x.codigo);
    comprueba(c1 !== c2 && dos.every((x) => x && RELE.codigos.has(x.buzon)) && dos[0].buzon !== dos[1].buzon, '8. dos invitaciones que piden código a la vez: las dos tienen el suyo, en el relé (revisión, B4)', dos.map((x) => x && x.buzon));

    // ---- 9. solo con el enlace ----
    for (const P of paginas.splice(0)) { try { await P.context().close(); } catch (_) {} }
    await espera(800);
    const n9 = RECIBIDO.length, guardados9 = RELE.codigos.size;
    const G3 = await nuevo('G3'), H3 = await nuevo('H3');
    const enlaceG = await creaUltra(G3);
    await G3.evaluate(() => window.gcomPrueba.corta());
    await hasta(() => G3.evaluate(() => GuardianaCom.rele.abierto), 10000); await espera(1500);
    comprueba(mensajes('invita', n9).length === 0 && RELE.codigos.size === guardados9, '9. invitación Ultra por enlace: ningún «invita», tampoco tras reconectarse quien invita');
    await H3.goto(URL0 + '#b=' + enlaceG.split('#b=')[1]); await hasta(() => visible(H3, '#aceptar-si'), 6000); await H3.click('#aceptar-si');
    comprueba(await enUltra(G3) && await enUltra(H3), '9. con el enlace, los dos en la sesión Ultra, como siempre');
    comprueba(mensajes('invita', n9).length === 0 && RELE.codigos.size === guardados9, '9. y el relé sigue sin recibir ningún «invita» ni guardar nada');
    paginas.push(A, B, C, D, E, F, G, H, G2, H2, X);

    // ---- el código, en nada de lo que recibió el relé ni de lo que mandaron o pidieron las páginas ----
    const todas = codigos.flatMap((x) => (typeof x === 'string' ? formas(x.replace(/-/g, '')) : formas(x.codigo.replace(/-/g, ''), [x.escrito])));
    comprueba(!llevaAlgo(RECIBIDO, todas), '1. ningún código Ultra (' + codigos.length + ') aparece en lo que recibió el relé: ' + RECIBIDO.length + ' mensajes y tramas');
    comprueba(!paginas.some((P) => llevaAlgo(P.tramas, todas)) && !paginas.some((P) => P.pedidas.some((u) => todas.some((f) => decodifica(u).includes(f)))), '1. ni en lo que mandaron las páginas por el WebSocket, ni en ninguna dirección que pidieron');
  } catch (e) { console.log('ERROR', e && e.stack || e); fallos.push('excepción'); }
  for (const c of contextos) { try { await c.close(); } catch (_) {} }
  await browser.close(); SERVIDOR.close();
  console.log(fallos.length ? 'FALLOS: ' + fallos.length + '\n - ' + fallos.join('\n - ') : 'TODO OK');
  process.exit(fallos.length ? 1 : 0);
})();
