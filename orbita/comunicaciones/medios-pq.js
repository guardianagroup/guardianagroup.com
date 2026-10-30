// GUARDIANA · Comunicaciones · la capa post-cuántica del audio y el vídeo (30 Oct 2026; dueño, 14:41: «en la llamada PC a PC, el
// audio y el vídeo post cuántico»). Corre en un Worker con las transformaciones de WebRTC (RTCRtpScriptTransform): cada fragmento
// de voz o de imagen se cifra con AES-256-GCM antes de que el navegador lo meta en la llamada, y se descifra al llegar, antes de
// que el navegador lo descodifique. Va encima del cifrado de siempre de las llamadas (DTLS-SRTP, que es clásico); la llave de esta
// capa sale de la sesión post-cuántica del chat (ML-KEM-768, o ML-KEM-1024 en la blindada) o, en el traspaso al teléfono, de la
// llave del código QR, que nunca viajó por la red (llamada.js, preparaPq).
//
// Cada fragmento: [lo que el navegador necesita leer, en claro][cifrado][etiqueta GCM 16][IV 12][n 1][0xA7 1]
//   · el IV (12 bytes) es al azar en cada fragmento: la misma llave sirve para la voz y para cada imagen sin repetir nunca un IV;
//   · lo que va en claro es lo mínimo para que el navegador sepa empaquetarlo: el primer byte de Opus; en VP8, la cabecera (10
//     bytes en las imágenes clave, 3 en las demás); en H.264, hasta el principio del primer trozo de imagen (y lo cifrado se
//     «escapa» para que no aparezcan marcas de inicio); en VP9, nada. Lo que va en claro entra en la autenticación (AAD): si
//     alguien lo cambia, el fragmento no se descifra;
//   · si un fragmento no se descifra (llave distinta, manipulado), se tira: nunca se reproduce nada sin descifrar.
//
// El navegador solo deja poner estas transformaciones antes de negociar la llamada, y la capa solo se sabe si va cuando contesta la
// otra persona. Por eso se ponen siempre al crear la conexión, y cada sentido tiene su modo:
//   · al enviar: «claro» (pasa tal cual) hasta que la otra persona confirma la capa; entonces, «cifra»;
//   · al recibir: «auto» al principio (descifra lo que viene cifrado; lo demás pasa); en cuanto descifra el primer fragmento, pasa
//     a «estricto» (desde ahí, lo que no se descifre se tira); y «claro» si la otra persona no tiene la capa.
//
// La llave cambia cada minuto (dueño, 30 Oct 2026, 14:49: «cada minuto, cada dos minutos, aparezca un código en pantalla de cada
// uno y los dos deban de ser el mismo código»). Si los dos lo tienen, cada llave sale de la anterior (HKDF-SHA-256, en un solo
// sentido) y aquí las anteriores se borran a los 10 segundos (ojo: el secreto de la sesión del chat, del que salen todas, sigue en
// la página mientras dure el chat; esto no se promete en público). Quien llamó cambia su llave al minuto; la otra persona, al
// recibir el primer fragmento que descifra con la llave nueva, cambia la suya. Cada fragmento lleva el número de su llave (un
// byte, que da la vuelta a los 256), y nadie pasa de las llaves que le tocan por el tiempo que lleva la llamada (así, quien
// estuviera en medio no puede ir probando llaves hasta que el código coincida).
// El código de 6 cifras que se enseña en las dos pantallas sale de la llave de quien llamó y del número de seguridad de la llamada
// («lazo», con compromiso previo: nadie en medio puede elegirlo); sin ese número no hay código. Si coincide, los dos tienen la
// misma llave; justo al cambiar puede no coincidir unos segundos.
//   formato con cambio de llave: [en claro][cifrado][etiqueta 16][IV 12][llave nº 1][n 1][0xA8 1]
'use strict';
const MAGIA = 0xa7, MAGIA_R = 0xa8;
const te = new TextEncoder();
// id → { n: número de la llave de ahora, raw: Map(n → bytes), k: Map(n → Promise<CryptoKey>), rota, codigo, par, cola, t }
const cadenas = new Map();
const importa = (raw) => crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
async function hk(raw, etiqueta, info) {
  const k = await crypto.subtle.importKey('raw', raw, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: te.encode(etiqueta), info: info || new Uint8Array(0) }, k, 256));
}
// cuántas llaves más puede avanzar una cadena: las que tocan por el tiempo desde que empezó, más una
const tope = (c) => (c.inicio ? Math.floor((Date.now() - c.inicio) / c.cada) + 1 - c.abs : 3);
// el código de 6 cifras de la llave de ahora (sale de la llave en un solo sentido: no dice nada de ella)
async function codigo(id, c) {
  const n = c.n, r = c.raw.get(n); if (!r || !c.lazo) return;
  const b = await hk(r, 'GUARDIANA código de la llave', c.lazo);
  const v = (((b[0] << 24) >>> 0) + (b[1] << 16) + (b[2] << 8) + b[3]) % 1000000;
  postMessage({ tipo: 'codigo', id, n, codigo: String(v).padStart(6, '0') });
}
// pasar a la llave número «e» (hasta 3 por delante); las anteriores se borran a los 10 segundos (por si llega algún fragmento tarde)
function avanza(id, e) {
  const c = cadenas.get(id); if (!c) return Promise.resolve();
  c.cola = c.cola.then(async () => {
    let d = (e - c.n + 256) & 255; if (d === 0 || d > 16 || d > tope(c)) return;
    while (d-- > 0) { const sig = await hk(c.raw.get(c.n), 'GUARDIANA medios rota'); c.n = (c.n + 1) & 255; c.abs++; c.raw.set(c.n, sig); c.k.set(c.n, importa(sig)); }
    clearTimeout(c.borra);
    c.borra = setTimeout(() => { for (const x of [...c.k.keys()]) if (x !== c.n) { c.k.delete(x); const r = c.raw.get(x); if (r) r.fill(0); c.raw.delete(x); } }, 10000);
    if (c.codigo) codigo(id, c);
    if (c.par) avanza(c.par, c.n); // la llave de enviar sigue a la de recibir
  }).catch(() => {});
  return c.cola;
}
function suelta(id) { const c = cadenas.get(id); if (!c) return; clearInterval(c.t); clearTimeout(c.borra); for (const r of c.raw.values()) r.fill(0); cadenas.delete(id); }
const codecs = new Map(); // id → { tipo de carga (payload type) → códec }
const modos = new Map(); // id → 'claro' | 'cifra' | 'auto' | 'estricto'
const cuenta = { cifrados: 0, descifrados: 0, fallos: 0, seguidos: 0, claros: 0 };

onmessage = (e) => {
  const m = e.data || {};
  if (m.tipo === 'llave' && m.raw) { suelta(m.id); const raw = new Uint8Array(m.raw); cadenas.set(m.id, { n: 0, abs: 0, inicio: 0, cada: 60000, lazo: null, raw: new Map([[0, raw]]), k: new Map([[0, importa(raw)]]), rota: false, codigo: false, par: null, cola: Promise.resolve(), t: null, borra: null }); }
  // los dos tienen el cambio de llave: «tx» y «rx» van juntas; quien llamó («guia») cambia cada «cada» milisegundos
  else if (m.tipo === 'cadena') {
    const a = cadenas.get(m.tx), b = cadenas.get(m.rx), cada = Math.max(2000, m.cada || 60000), ya = Date.now();
    for (const x of [a, b]) if (x) { x.inicio = ya; x.cada = cada; x.abs = 0; }
    if (a) a.rota = true; if (b) b.par = m.tx;
    const c = cadenas.get(m.codigo); if (c) { c.codigo = true; codigo(m.codigo, c); }
    if (m.guia && a) { clearInterval(a.t); a.t = setInterval(() => { if (modos.get(m.tx) === 'cifra') avanza(m.tx, (a.n + 1) & 255); }, cada); }
  }
  // el número de seguridad de la llamada (llamada.js, sasCalcula): sin él no hay código
  else if (m.tipo === 'lazo' && m.lazo) { const c = cadenas.get(m.id); if (c) { c.lazo = new Uint8Array(m.lazo); if (c.codigo) codigo(m.id, c); } }
  else if (m.tipo === 'modo') { if (!(modos.get(m.id) === 'estricto' && m.modo === 'auto')) modos.set(m.id, m.modo); }
  else if (m.tipo === 'codecs') codecs.set(m.id, m.mapa || {});
  else if (m.tipo === 'olvida') { suelta(m.id); codecs.delete(m.id); modos.delete(m.id); }
  else if (m.tipo === 'cuenta') postMessage({ tipo: 'cuenta', cuenta });
};

// el códec de un fragmento de imagen: el que dice el navegador o, si no lo dice, el de su tipo de carga en la negociación
function codecDe(f, k) {
  let md = {}; try { md = f.getMetadata ? f.getMetadata() : {}; } catch (_) {}
  if (md.mimeType) return String(md.mimeType).toLowerCase();
  const m = codecs.get(k) || {};
  return md.payloadType != null && m[md.payloadType] ? m[md.payloadType] : '';
}
// H.264: el principio del primer trozo de imagen (unidad NAL de tipo 1 o 5) y dos bytes más
function inicioH264(d) {
  for (let i = 0; i + 3 < d.length; i++) {
    if (d[i] === 0 && d[i + 1] === 0 && (d[i + 2] === 1 || (d[i + 2] === 0 && d[i + 3] === 1))) {
      const h = d[i + 2] === 1 ? i + 3 : i + 4; const t = d[h] & 0x1f;
      if (t === 1 || t === 5) return Math.min(d.length, h + 2);
      i = h;
    }
  }
  return -1;
}
function claros(d, audio, mime, clave) {
  if (audio) return Math.min(1, d.length);
  if (mime === 'video/vp8') return Math.min(clave ? 10 : 3, d.length);
  if (mime === 'video/h264') return inicioH264(d);
  return 0;
}
// H.264: que lo cifrado no contenga 00 00 0x (x ≤ 3), que el navegador tomaría por el inicio de otra unidad (como en el propio
// H.264: tras 00 00 se mete un 03). «ceros»: cuántos ceros seguidos hay justo antes (al final de lo que va en claro)
function escapa(d, ceros) {
  const o = new Uint8Array(d.length + (d.length >> 1) + 4); let j = 0, z = ceros;
  for (let i = 0; i < d.length; i++) { const b = d[i]; if (z >= 2 && b <= 3) { o[j++] = 3; z = 0; } o[j++] = b; z = b === 0 ? z + 1 : 0; }
  return o.subarray(0, j);
}
function desescapa(d, ceros) {
  const o = new Uint8Array(d.length); let j = 0, z = ceros;
  for (let i = 0; i < d.length; i++) { const b = d[i]; if (z >= 2 && b === 3) { z = 0; continue; } o[j++] = b; z = b === 0 ? z + 1 : 0; }
  return o.subarray(0, j);
}
// lo que va en claro y se autentica: todo, salvo en H.264, donde el navegador que recibe puede reescribir las marcas de inicio
// (de 3 o de 4 bytes): allí, solo la cabecera del trozo de imagen (los 2 últimos bytes en claro)
const aad = (d, n, mime) => (mime === 'video/h264' ? d.subarray(Math.max(0, n - 2), n) : d.subarray(0, n));
const cerosAlFinal = (d, n) => { let z = 0; for (let i = n - 1; i >= 0 && d[i] === 0 && z < 2; i--) z++; return z; };

async function cifra(f, ctl, o) {
  if (modos.get(o.k) !== 'cifra') { cuenta.claros++; ctl.enqueue(f); return; }
  const c = cadenas.get(o.k); if (!c) return; // sin llave no sale nada
  const e = c.n, key = await c.k.get(e); if (!key) return;
  const audio = o.kind === 'audio', d = new Uint8Array(f.data);
  const mime = audio ? 'audio/opus' : codecDe(f, o.k);
  if (!audio && /av1/.test(mime)) return; // AV1 no se usa con esta capa (su empaquetado lee el contenido)
  const n = claros(d, audio, mime, f.type === 'key'); if (n < 0) return; // H.264 sin trozo de imagen: no se manda
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad(d, n, mime) }, key, d.subarray(n)));
  let cola;
  if (c.rota) { cola = new Uint8Array(ct.length + 15); cola.set(ct, 0); cola.set(iv, ct.length); cola[ct.length + 12] = e; cola[ct.length + 13] = n; cola[ct.length + 14] = MAGIA_R; }
  else { cola = new Uint8Array(ct.length + 14); cola.set(ct, 0); cola.set(iv, ct.length); cola[ct.length + 12] = n; cola[ct.length + 13] = MAGIA; }
  if (mime === 'video/h264') cola = escapa(cola, cerosAlFinal(d, n));
  const out = new Uint8Array(n + cola.length); out.set(d.subarray(0, n), 0); out.set(cola, n);
  f.data = out.buffer; cuenta.cifrados++; ctl.enqueue(f);
}
let avisado = 0;
const vistos = new Set();
function fallo() {
  cuenta.fallos++; cuenta.seguidos++;
  const ahora = Date.now(); if (ahora - avisado > 2000) { avisado = ahora; postMessage({ tipo: 'fallo', cuenta }); }
}
async function descifra(f, ctl, o) {
  const modo = modos.get(o.k) || 'auto';
  if (modo === 'claro') { cuenta.claros++; ctl.enqueue(f); return; }
  const estricto = modo === 'estricto';
  // en «auto», lo que no viene cifrado pasa tal cual; lo que viene cifrado sin llave todavía se tira (llega enseguida)
  const pasa = () => { if (estricto) return fallo(); cuenta.claros++; ctl.enqueue(f); };
  const audio = o.kind === 'audio', d = new Uint8Array(f.data);
  const mime = audio ? 'audio/opus' : codecDe(f, o.k);
  let n, cola;
  if (mime === 'video/h264') { n = inicioH264(d); if (n < 0) return pasa(); cola = desescapa(d.subarray(n), cerosAlFinal(d, n)); }
  else { const mg = d[d.length - 1]; if (d.length < 30 || (mg !== MAGIA && mg !== MAGIA_R)) return pasa(); n = d[d.length - 2]; if (n > d.length - 30) return pasa(); cola = d.subarray(n); }
  const mg = cola[cola.length - 1];
  if (cola.length < 30 || (mg !== MAGIA && mg !== MAGIA_R) || (mime !== 'video/h264' && cola[cola.length - 2] !== n)) return pasa();
  const conN = mg === MAGIA_R, fin = conN ? 15 : 14, e = conN ? cola[cola.length - 3] : 0;
  const c = cadenas.get(o.k); if (!c) return; // cifrado y aún sin llave: fuera
  // la otra persona ya cambió de llave: se prueba con la siguiente y, solo si descifra, la mía la sigue (el número de llave no va
  // autenticado: un número cambiado no hace avanzar nada)
  let kp = c.k.get(e), nueva = false;
  if (!kp && conN) { const d2 = (e - c.n + 256) & 255; if (d2 >= 1 && d2 <= 16 && d2 <= tope(c)) { let r = c.raw.get(c.n); for (let i = 0; i < d2 && r; i++) r = await hk(r, 'GUARDIANA medios rota'); if (r) { kp = importa(r); nueva = true; } } }
  const key = kp && await kp; if (!key) return estricto ? fallo() : undefined; // sin su llave: fuera
  const iv = cola.subarray(cola.length - fin, cola.length - fin + 12), ct = cola.subarray(0, cola.length - fin);
  let pt; try { pt = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: aad(d, n, mime) }, key, ct)); } catch (_) { return estricto ? fallo() : pasa(); }
  if (nueva) avanza(o.k, e);
  const out = new Uint8Array(n + pt.length); out.set(d.subarray(0, n), 0); out.set(pt, n);
  f.data = out.buffer; cuenta.descifrados++; cuenta.seguidos = 0; ctl.enqueue(f);
  if (!estricto) { modos.set(o.k, 'estricto'); if (!vistos.has(o.k)) { vistos.add(o.k); postMessage({ tipo: 'visto', id: o.k }); } }
}

onrtctransform = (e) => {
  const t = e.transformer, o = t.options || {};
  const paso = o.op === 'cifra' ? cifra : descifra;
  t.readable.pipeThrough(new TransformStream({ transform: (f, ctl) => paso(f, ctl, o).catch(() => { if (o.op !== 'cifra') fallo(); }) })).pipeTo(t.writable).catch(() => {});
};
