// GUARDIANA · Comunicaciones · criptografía de la página (26 Oct 2026). Web Crypto del navegador para todo lo clásico;
// ML-KEM-768 (FIPS 203) con @noble/post-quantum 0.7.1, vendida en pq-mlkem.js y servida desde este mismo sitio.
//
// - Identidad: un par ECDSA P-256 (firma) y un par ECDH P-256 (acuerdo), creados aquí y guardados en IndexedDB
//   como claves no exportables. Su huella (SHA-256 de las dos públicas) es el «número de seguridad».
// - Invitación: 32 bytes aleatorios que viajan solo tras «#» en el enlace (el navegador no los manda a ningún
//   servidor). De ellos salen la sala del relé (SHA-256, el relé la ve) y la clave de presentación (HKDF, el relé no).
// - Sesión: con la otra persona presente, cada lado manda su presentación firmada (identidad + efímera) sellada con la
//   clave de presentación; el secreto de sesión mezcla tres acuerdos ECDH (efímera–efímera, identidad–efímera y
//   efímera–identidad) con HKDF-SHA256. De ahí salen dos cadenas (una por sentido) que avanzan con cada mensaje
//   (HMAC-SHA256): una clave distinta por mensaje, y la anterior se olvida. Cada sesión nueva renueva todo.
// - Híbrido poscuántico (v3, 27 Oct 2026): quien inicia añade a su presentación una clave ML-KEM-768 nueva; quien
//   responde encapsula a esa clave y devuelve el texto cifrado en su respuesta. Las dos presentaciones llevan además
//   una segunda firma ECDSA que cubre esos campos. El secreto ML-KEM entra en el HKDF junto a los tres ECDH (etiqueta
//   «sesión v3»): para leer una sesión hay que romper a la vez el ECDH P-256 y ML-KEM-768. Con una versión anterior
//   (sin esos campos) la sesión es la v2 de siempre y queda marcada como no poscuántica (pq: false).
// - Mensajes y trozos de archivo: AES-256-GCM, nonce de 12 bytes (número de mensaje), datos asociados = cabecera.
'use strict';
(function (raiz) {
  const te = new TextEncoder(), td = new TextDecoder();
  const sub = crypto.subtle;
  const u8 = (x) => (x instanceof Uint8Array ? x : new Uint8Array(x));
  const cat = (...xs) => { const n = xs.reduce((a, b) => a + b.length, 0); const o = new Uint8Array(n); let i = 0; for (const x of xs) { o.set(x, i); i += x.length; } return o; };
  const b64u = (b) => btoa(String.fromCharCode(...u8(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const deB64u = (s) => { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); };
  const hex = (b) => [...u8(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
  const deHex = (s) => Uint8Array.from(String(s).match(/../g) || [], (h) => parseInt(h, 16));
  const azar = (n) => crypto.getRandomValues(new Uint8Array(n));
  const sha256 = async (b) => new Uint8Array(await sub.digest('SHA-256', u8(b)));
  const nonce = (n) => { const o = new Uint8Array(12); new DataView(o.buffer).setUint32(8, n >>> 0); new DataView(o.buffer).setUint32(4, Math.floor(n / 4294967296) >>> 0); return o; };

  async function hkdf(ikm, sal, info, n) {
    const k = await sub.importKey('raw', u8(ikm), 'HKDF', false, ['deriveBits']);
    return new Uint8Array(await sub.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: u8(sal || new Uint8Array(32)), info: te.encode(info) }, k, (n || 32) * 8));
  }
  async function hmac(clave, datos) {
    const k = await sub.importKey('raw', u8(clave), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return new Uint8Array(await sub.sign('HMAC', k, u8(datos)));
  }
  const aes = (bytes) => sub.importKey('raw', u8(bytes), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  async function sella(clave, n, datos, ad) {
    const k = clave instanceof CryptoKey ? clave : await aes(clave);
    return new Uint8Array(await sub.encrypt({ name: 'AES-GCM', iv: nonce(n), additionalData: ad ? u8(ad) : undefined }, k, u8(datos)));
  }
  async function abre(clave, n, datos, ad) {
    const k = clave instanceof CryptoKey ? clave : await aes(clave);
    return new Uint8Array(await sub.decrypt({ name: 'AES-GCM', iv: nonce(n), additionalData: ad ? u8(ad) : undefined }, k, u8(datos)));
  }

  // ---- identidad ----
  async function creaIdentidad() {
    const firma = await sub.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
    const acuerdo = await sub.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    return { firma, acuerdo, firmaPub: new Uint8Array(await sub.exportKey('raw', firma.publicKey)), acuerdoPub: new Uint8Array(await sub.exportKey('raw', acuerdo.publicKey)) };
  }
  const huella = async (firmaPub, acuerdoPub) => sha256(cat(u8(firmaPub), u8(acuerdoPub)));
  // Número de seguridad de una conversación: 60 cifras de las dos huellas ordenadas (igual en los dos lados)
  async function numeroSeguridad(huellaA, huellaB) {
    const a = hex(huellaA), b = hex(huellaB);
    const [x, y] = a < b ? [a, b] : [b, a];
    const h = await sha256(te.encode('GUARDIANA número de seguridad\n' + x + '\n' + y));
    let s = '';
    for (let i = 0; i < 12; i++) { const v = (h[i * 2] << 8 | h[i * 2 + 1]) % 100000; s += String(v).padStart(5, '0') + (i % 4 === 3 ? '\n' : ' '); }
    return s.trim();
  }
  async function firma(id, datos) { return new Uint8Array(await sub.sign({ name: 'ECDSA', hash: 'SHA-256' }, id.firma.privateKey, u8(datos))); }
  async function verifica(pub, sig, datos) {
    try { const k = await sub.importKey('raw', u8(pub), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']); return await sub.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, u8(sig), u8(datos)); } catch (_) { return false; }
  }

  // ---- invitación ----
  async function deSemilla(semilla) {
    const sala = hex(await sha256(cat(te.encode('GUARDIANA sala\n'), u8(semilla))));
    const presentacion = await hkdf(semilla, null, 'GUARDIANA presentación', 32);
    // ronda 48: el secreto de la invitación también entra en cada sesión (PSK): sin el enlace nadie se pone en medio
    const psk = await hkdf(semilla, null, 'GUARDIANA psk de sesión', 32);
    return { sala, presentacion: await aes(presentacion), psk };
  }
  const nuevaSemilla = () => azar(32);

  // ---- código de invitación (9 cifras): clave derivada con PBKDF2-SHA256 (300.000 vueltas) y sal aleatoria ----
  async function claveDeCodigo(codigo, sal) {
    const k = await sub.importKey('raw', te.encode('GUARDIANA código ' + codigo), 'PBKDF2', false, ['deriveBits']);
    return aes(new Uint8Array(await sub.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: u8(sal), iterations: 300000 }, k, 256)));
  }
  // 9 cifras totalmente aleatorias (crypto.getRandomValues), sin sesgo: solo se usan bytes < 250 (25 por cifra)
  const nuevoCodigo = () => { let s = ''; while (s.length < 9) { for (const x of azar(16)) { if (x < 250 && s.length < 9) s += String(x % 10); } } return s; };

  // ---- sesión ----
  async function efimera() {
    const k = await sub.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    return { k, pub: new Uint8Array(await sub.exportKey('raw', k.publicKey)) };
  }
  async function dh(priv, pubRaw) {
    const pub = await sub.importKey('raw', u8(pubRaw), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    return new Uint8Array(await sub.deriveBits({ name: 'ECDH', public: pub }, priv, 256));
  }
  // Secreto de sesión (ronda 48, v2). A = quien inicia (huella menor), B = quien responde. Los dos calculan en el mismo
  // orden DH(ef_A, ef_B) ‖ DH(id_A, ef_B) ‖ DH(ef_A, id_B) ‖ psk (secreto de la invitación), sal = sala, e info = la
  // transcripción (versión, huellas y efímeras de A y de B). Salen 96 bytes: cadena A→B, cadena B→A y el hash de sesión
  // (32 bytes, va entero en los datos asociados de cada mensaje; 8 en la cabecera de red).
  // v3 (híbrida, con pq = { ss, ek, ct }): la misma mezcla con el secreto ML-KEM-768 entre los ECDH y el psk, y la info
  // con su etiqueta y las huellas SHA-256 de la clave ML-KEM de A y del texto cifrado de B.
  async function sesion(id, ef, suyo, sala, inicio, psk, miHuella, suHuella, pq) {
    const efef = await dh(ef.k.privateKey, suyo.ef);
    const idA_efB = inicio ? await dh(id.acuerdo.privateKey, suyo.ef) : await dh(ef.k.privateKey, suyo.acuerdoPub);
    const efA_idB = inicio ? await dh(ef.k.privateKey, suyo.acuerdoPub) : await dh(id.acuerdo.privateKey, suyo.ef);
    const ikm = pq ? cat(efef, idA_efB, efA_idB, u8(pq.ss), u8(psk || new Uint8Array(32))) : cat(efef, idA_efB, efA_idB, u8(psk || new Uint8Array(32)));
    const hA = inicio ? u8(miHuella) : u8(suHuella), hB = inicio ? u8(suHuella) : u8(miHuella);
    const efA = inicio ? ef.pub : u8(suyo.ef), efB = inicio ? u8(suyo.ef) : ef.pub;
    const info = pq
      ? 'GUARDIANA sesión v3 ECDH-P256+ML-KEM-768\n' + hex(hA) + '\n' + hex(efA) + '\n' + hex(hB) + '\n' + hex(efB) + '\n' + hex(await sha256(pq.ek)) + '\n' + hex(await sha256(pq.ct))
      : 'GUARDIANA sesión v2\n' + hex(hA) + '\n' + hex(efA) + '\n' + hex(hB) + '\n' + hex(efB);
    const r = await hkdf(ikm, deHex(sala), info, 96);
    ikm.fill(0); efef.fill(0); idA_efB.fill(0); efA_idB.fill(0);
    const ab = new Uint8Array(r.subarray(0, 32)), ba = new Uint8Array(r.subarray(32, 64)), hash = new Uint8Array(r.subarray(64, 96));
    r.fill(0);
    return { envio: inicio ? ab : ba, recibo: inicio ? ba : ab, hash, pq: !!pq };
  }

  // ---- ML-KEM-768 (FIPS 203), en híbrido con el ECDH ----
  // pq-mlkem.js deja window.GuardianaMLKEM768; si no ha cargado, todo sigue como v2 (solo ECDH) y la sesión no es pq.
  const KEM_EK = 1184, KEM_DK = 2400, KEM_CT = 1088;
  const kem = () => { const k = raiz.GuardianaMLKEM768; return k && typeof k.keygen === 'function' && typeof k.encapsulate === 'function' && typeof k.decapsulate === 'function' ? k : null; };
  const hayPQ = () => !!kem();
  // un par nuevo por presentación de quien inicia: { ek (pública, 1184 bytes), dk (privada, 2400 bytes) }
  function kemPar() { const k = kem(); if (!k) return null; const { publicKey, secretKey } = k.keygen(); return { ek: new Uint8Array(publicKey), dk: new Uint8Array(secretKey) }; }
  // quien responde: encapsula a la clave de quien inicia (la librería comprueba longitud y módulo, FIPS 203 §7.2)
  function kemEncapsula(ek) { const k = kem(); if (!k || u8(ek).length !== KEM_EK) throw new Error('ML-KEM no disponible'); const { cipherText, sharedSecret } = k.encapsulate(u8(ek)); return { ct: new Uint8Array(cipherText), ss: new Uint8Array(sharedSecret) }; }
  // quien inicia: abre el texto cifrado con su clave privada de esa presentación (rechazo implícito si no es válido)
  function kemAbre(ct, dk) { const k = kem(); if (!k || u8(ct).length !== KEM_CT || u8(dk).length !== KEM_DK) throw new Error('ML-KEM no disponible'); return new Uint8Array(k.decapsulate(u8(ct), u8(dk))); }

  // ---- lo que firma cada presentación ----
  // v2: exactamente los bytes de siempre (los que comprueban las versiones anteriores). v3: otra etiqueta y, además, la
  // clave ML-KEM de quien inicia o, en la respuesta, la huella de la clave a la que contesta y su texto cifrado.
  // Una presentación nueva lleva las dos firmas: la v2 («sig») para quien aún no sabe de ML-KEM y la v3 («sig3»).
  function datosInicia(sala, firmaPub, acuerdoPub, ef, epoca, ek) {
    return ek ? cat(te.encode('GUARDIANA v3 INICIA\n' + sala + '\n'), u8(firmaPub), u8(acuerdoPub), u8(ef), u8(epoca), u8(ek))
      : cat(te.encode('GUARDIANA v2 INICIA\n' + sala + '\n'), u8(firmaPub), u8(acuerdoPub), u8(ef), u8(epoca));
  }
  async function datosResponde(sala, firmaPub, acuerdoPub, ef, epoca, respEpoca, suHuella, suEf, pq) {
    const base = [u8(firmaPub), u8(acuerdoPub), u8(ef), u8(epoca), u8(respEpoca), u8(suHuella), u8(suEf)];
    return pq ? cat(te.encode('GUARDIANA v3 RESPONDE\n' + sala + '\n'), ...base, await sha256(pq.ek), u8(pq.ct))
      : cat(te.encode('GUARDIANA v2 RESPONDE\n' + sala + '\n'), ...base);
  }
  // Una cadena: avanza con cada mensaje; guarda hasta 256 claves saltadas (mensajes que llegan desordenados).
  // Los pasos van uno detrás de otro (cola de promesas): dos mensajes sellados a la vez nunca comparten clave.
  function cadena(ck) {
    let n = 0, clave = u8(ck), turno = Promise.resolve(); const saltadas = new Map();
    const paso = async () => { const mk = await hmac(clave, [1]); clave = await hmac(clave, [2]); return mk; };
    const enTurno = (f) => { const p = turno.then(f); turno = p.catch(() => {}); return p; };
    return {
      get n() { return n; },
      siguiente() { return enTurno(async () => { const mk = await paso(); return { n: n++, clave: mk }; }); },
      para(m) {
        return enTurno(async () => {
          if (saltadas.has(m)) { const k = saltadas.get(m); saltadas.delete(m); return k; }
          if (m < n) throw new Error('mensaje repetido');
          if (m - n > 256) throw new Error('demasiados mensajes saltados');
          while (n < m) { saltadas.set(n++, await paso()); }
          n++; return paso();
        });
      },
    };
  }

  // ======================================================================================================================
  // SESIÓN BLINDADA (27 Oct 2026, dueño: «la blindada debe ser de la máxima»; «tecnología de grado militar»).
  // Los algoritmos y tamaños de la suite CNSA 2.0 de la NSA, en híbrido con criptografía clásica:
  //   identidad: ECDSA P-384 + ECDH P-384 (Web Crypto, no exportables) + ML-DSA-87 (FIPS 204; su clave privada se guarda
  //   encriptada con la clave local no exportable); huella SHA-384 de las tres públicas.
  //   sesión: tres ECDH P-384 + ML-KEM-1024 (FIPS 203) + el secreto de la invitación, con HKDF-SHA-384.
  //   presentaciones: dos firmas obligatorias (ECDSA P-384 y ML-DSA-87); sin ML-KEM no hay sesión.
  //   mensajes: AES-256-GCM con una clave por mensaje (cadenas HMAC-SHA-384).
  // Nada de esto es una certificación: son los algoritmos que la suite especifica, en el navegador.
  // ======================================================================================================================
  const sha384 = async (b) => new Uint8Array(await sub.digest('SHA-384', u8(b)));
  async function hkdf384(ikm, sal, info, n) {
    const k = await sub.importKey('raw', u8(ikm), 'HKDF', false, ['deriveBits']);
    return new Uint8Array(await sub.deriveBits({ name: 'HKDF', hash: 'SHA-384', salt: u8(sal || new Uint8Array(48)), info: te.encode(info) }, k, n * 8));
  }
  async function hmac384(clave, datos) {
    const k = await sub.importKey('raw', u8(clave), { name: 'HMAC', hash: 'SHA-384' }, false, ['sign']);
    return new Uint8Array(await sub.sign('HMAC', k, u8(datos)));
  }
  const kem1024 = () => { const k = raiz.GuardianaMLKEM1024; return k && typeof k.keygen === 'function' ? k : null; };
  const dsa87 = () => { const k = raiz.GuardianaMLDSA87; return k && typeof k.sign === 'function' ? k : null; };
  const B_EK = 1568, B_DK = 3168, B_CT = 1568, B_DSA_PUB = 2592, B_DSA_FIRMA = 4627, B_EC = 97;
  const B_CTX = te.encode('GUARDIANA blindada v1'); // contexto de las firmas ML-DSA (FIPS 204 §5.2): separa sus usos
  const hayBlindada = () => !!(kem1024() && dsa87() && raiz.isSecureContext !== false);

  // Identidad blindada del equipo. La clave privada ML-DSA-87 sale de aquí solo encriptada con «reposo» (AES-256-GCM,
  // no exportable); en memoria vive mientras la página está abierta.
  async function creaIdentidadB(reposo) {
    const firma = await sub.generateKey({ name: 'ECDSA', namedCurve: 'P-384' }, false, ['sign', 'verify']);
    const acuerdo = await sub.generateKey({ name: 'ECDH', namedCurve: 'P-384' }, false, ['deriveBits']);
    const d = dsa87(); if (!d) throw new Error('ML-DSA-87 no disponible');
    const { publicKey, secretKey } = d.keygen();
    const iv = azar(12), dsaSecSellada = new Uint8Array(await sub.encrypt({ name: 'AES-GCM', iv, additionalData: te.encode('GUARDIANA ML-DSA-87') }, reposo, secretKey));
    const id = { firma, acuerdo, firmaPub: new Uint8Array(await sub.exportKey('raw', firma.publicKey)), acuerdoPub: new Uint8Array(await sub.exportKey('raw', acuerdo.publicKey)), dsaPub: new Uint8Array(publicKey), dsaIv: iv, dsaSecSellada, creado: Date.now() };
    return { guardar: id, dsaSec: new Uint8Array(secretKey) };
  }
  async function abreDsaB(idB, reposo) {
    return new Uint8Array(await sub.decrypt({ name: 'AES-GCM', iv: u8(idB.dsaIv), additionalData: te.encode('GUARDIANA ML-DSA-87') }, reposo, u8(idB.dsaSecSellada)));
  }
  const huellaB = async (firmaPub, acuerdoPub, dsaPub) => sha384(cat(te.encode('GUARDIANA huella blindada v1\n'), u8(firmaPub), u8(acuerdoPub), u8(dsaPub)));
  async function numeroSeguridadB(huellaA, huellaB2) {
    const a = hex(huellaA), b = hex(huellaB2);
    const [x, y] = a < b ? [a, b] : [b, a];
    const h = await sha384(te.encode('GUARDIANA número de seguridad blindada v1\n' + x + '\n' + y));
    let s = '';
    for (let i = 0; i < 12; i++) { const v = (h[i * 2] << 8 | h[i * 2 + 1]) % 100000; s += String(v).padStart(5, '0') + (i % 4 === 3 ? '\n' : ' '); }
    return s.trim();
  }
  async function firmaB(idB, datos) { return new Uint8Array(await sub.sign({ name: 'ECDSA', hash: 'SHA-384' }, idB.firma.privateKey, u8(datos))); }
  async function verificaB(pub, sig, datos) {
    try { const k = await sub.importKey('raw', u8(pub), { name: 'ECDSA', namedCurve: 'P-384' }, false, ['verify']); return await sub.verify({ name: 'ECDSA', hash: 'SHA-384' }, k, u8(sig), u8(datos)); } catch (_) { return false; }
  }
  function firmaPQ(dsaSec, datos, ctx) { const d = dsa87(); if (!d) throw new Error('ML-DSA-87 no disponible'); return new Uint8Array(d.sign(u8(datos), u8(dsaSec), ctx || B_CTX)); }
  function verificaPQ(dsaPub, sig, datos, ctx) { const d = dsa87(); if (!d || u8(dsaPub).length !== B_DSA_PUB || u8(sig).length !== B_DSA_FIRMA) return false; return !!d.verify(u8(sig), u8(datos), u8(dsaPub), ctx || B_CTX); }
  async function deSemillaB(semilla) {
    const sala = hex(await sha256(cat(te.encode('GUARDIANA sala blindada v1\n'), u8(semilla))));
    const presentacion = await hkdf384(semilla, null, 'GUARDIANA presentación blindada v1', 32);
    const psk = await hkdf384(semilla, null, 'GUARDIANA psk blindada v1', 48);
    return { sala, presentacion: await aes(presentacion), psk };
  }
  async function efimeraB() {
    const k = await sub.generateKey({ name: 'ECDH', namedCurve: 'P-384' }, false, ['deriveBits']);
    return { k, pub: new Uint8Array(await sub.exportKey('raw', k.publicKey)) };
  }
  async function dhB(priv, pubRaw) {
    const pub = await sub.importKey('raw', u8(pubRaw), { name: 'ECDH', namedCurve: 'P-384' }, false, []);
    return new Uint8Array(await sub.deriveBits({ name: 'ECDH', public: pub }, priv, 384));
  }
  function kemParB() { const k = kem1024(); if (!k) throw new Error('ML-KEM-1024 no disponible'); const { publicKey, secretKey } = k.keygen(); return { ek: new Uint8Array(publicKey), dk: new Uint8Array(secretKey) }; }
  function kemEncapsulaB(ek) { const k = kem1024(); if (!k || u8(ek).length !== B_EK) throw new Error('ML-KEM-1024 no disponible'); const { cipherText, sharedSecret } = k.encapsulate(u8(ek)); return { ct: new Uint8Array(cipherText), ss: new Uint8Array(sharedSecret) }; }
  function kemAbreB(ct, dk) { const k = kem1024(); if (!k || u8(ct).length !== B_CT || u8(dk).length !== B_DK) throw new Error('ML-KEM-1024 no disponible'); return new Uint8Array(k.decapsulate(u8(ct), u8(dk))); }
  // Lo que firman las presentaciones blindadas (las dos firmas sobre los mismos bytes): quien inicia, su identidad, su
  // efímera, su época y la huella de su clave ML-KEM; quien responde, además, la época, la huella y la efímera de quien
  // inicia y el texto cifrado ML-KEM entero.
  async function datosIniciaB(sala, firmaPub, acuerdoPub, dsaPub, ef, epoca, ek) {
    return cat(te.encode('GUARDIANA v4 BLINDADA INICIA\n' + sala + '\n'), u8(firmaPub), u8(acuerdoPub), await sha384(dsaPub), u8(ef), u8(epoca), await sha384(ek));
  }
  async function datosRespondeB(sala, firmaPub, acuerdoPub, dsaPub, ef, epoca, respEpoca, suHuella, suEf, ek, ct) {
    return cat(te.encode('GUARDIANA v4 BLINDADA RESPONDE\n' + sala + '\n'), u8(firmaPub), u8(acuerdoPub), await sha384(dsaPub), u8(ef), u8(epoca), u8(respEpoca), u8(suHuella), u8(suEf), await sha384(ek), u8(ct));
  }
  // Secreto de la sesión blindada: DH(efA,efB) ‖ DH(idA,efB) ‖ DH(efA,idB) ‖ ss ML-KEM-1024 ‖ psk, sal = sala, info = la
  // transcripción (huellas SHA-384, efímeras, huellas de ek y ct). Salen 128 bytes: cadena A→B (48), cadena B→A (48) y el
  // hash de sesión (32, en los datos asociados de cada mensaje).
  async function sesionB(idB, ef, suyo, sala, inicio, psk, miHuella, suHuella, pq) {
    if (!pq || !pq.ss) throw new Error('sin ML-KEM-1024 no hay sesión blindada');
    const efef = await dhB(ef.k.privateKey, suyo.ef);
    const idA_efB = inicio ? await dhB(idB.acuerdo.privateKey, suyo.ef) : await dhB(ef.k.privateKey, suyo.acuerdoPub);
    const efA_idB = inicio ? await dhB(ef.k.privateKey, suyo.acuerdoPub) : await dhB(idB.acuerdo.privateKey, suyo.ef);
    const ikm = cat(efef, idA_efB, efA_idB, u8(pq.ss), u8(psk));
    const hA = inicio ? u8(miHuella) : u8(suHuella), hB = inicio ? u8(suHuella) : u8(miHuella);
    const efA = inicio ? ef.pub : u8(suyo.ef), efB = inicio ? u8(suyo.ef) : ef.pub;
    const info = 'GUARDIANA sesión v4 blindada P-384+ML-KEM-1024 SHA-384\n' + hex(hA) + '\n' + hex(efA) + '\n' + hex(hB) + '\n' + hex(efB) + '\n' + hex(await sha384(pq.ek)) + '\n' + hex(await sha384(pq.ct));
    const r = await hkdf384(ikm, deHex(sala), info, 128);
    ikm.fill(0); efef.fill(0); idA_efB.fill(0); efA_idB.fill(0);
    const ab = new Uint8Array(r.subarray(0, 48)), ba = new Uint8Array(r.subarray(48, 96)), hash = new Uint8Array(r.subarray(96, 128));
    r.fill(0);
    return { envio: inicio ? ab : ba, recibo: inicio ? ba : ab, hash, pq: true, blindada: true };
  }
  // Cadena blindada: como «cadena», con HMAC-SHA-384; la clave de mensaje son los 32 primeros bytes (AES-256).
  function cadenaB(ck) {
    let n = 0, clave = u8(ck), turno = Promise.resolve(); const saltadas = new Map();
    const paso = async () => { const mk = await hmac384(clave, [1]); const sig = await hmac384(clave, [2]); clave.fill(0); clave = sig; const k = new Uint8Array(mk.subarray(0, 32)); mk.fill(0); return k; };
    const enTurno = (f) => { const p = turno.then(f); turno = p.catch(() => {}); return p; };
    return {
      get n() { return n; },
      siguiente() { return enTurno(async () => { const mk = await paso(); return { n: n++, clave: mk }; }); },
      para(m) {
        return enTurno(async () => {
          if (saltadas.has(m)) { const k = saltadas.get(m); saltadas.delete(m); return k; }
          if (m < n) throw new Error('mensaje repetido');
          if (m - n > 256) throw new Error('demasiados mensajes saltados');
          while (n < m) { saltadas.set(n++, await paso()); }
          n++; return paso();
        });
      },
      borra() { clave.fill(0); for (const k of saltadas.values()) k.fill(0); saltadas.clear(); },
    };
  }
  // Relleno de la blindada: el texto de cada mensaje sale a un múltiplo de 1 KB (espacios al final; JSON los ignora),
  // así el relé no distingue un «ok» de un párrafo.
  const RELLENO = 1024;
  function rellena(bytes) { const n = Math.ceil((bytes.length + 1) / RELLENO) * RELLENO; const o = new Uint8Array(n).fill(0x20); o.set(bytes, 0); return o; }

  // ---------- Número GUARDIANA (29 Oct 2026; dueño, 20:56–21:55; agencia, ronda 73) ----------
  // 12 cifras: 11 al azar y una de control Damm, que detecta cualquier cifra cambiada y cualquier par de cifras vecinas
  // intercambiado. El número no sale del teléfono: al relé va su huella (idn, PBKDF2 de 300.000 vueltas) y, para hablar con
  // alguien, una «cita» que sale de los dos números (sin los dos no se puede calcular) con un sobre cerrado con otra clave
  // que también sale de los dos. Ver zero-motor/numeros.js.
  const DAMM = [[0, 3, 1, 7, 5, 9, 8, 6, 4, 2], [7, 0, 9, 2, 1, 5, 4, 8, 6, 3], [4, 2, 0, 6, 8, 7, 1, 3, 5, 9], [1, 7, 5, 0, 9, 8, 3, 4, 2, 6], [6, 1, 2, 3, 0, 4, 5, 9, 7, 8], [3, 6, 7, 4, 2, 0, 9, 5, 8, 1], [5, 8, 6, 9, 7, 2, 0, 1, 3, 4], [8, 9, 4, 5, 3, 6, 2, 0, 1, 7], [9, 4, 3, 8, 6, 1, 7, 2, 0, 5], [2, 5, 8, 1, 4, 3, 6, 7, 9, 0]];
  const damm = (s) => { let i = 0; for (const ch of String(s)) i = DAMM[i][ch.charCodeAt(0) - 48]; return i; };
  const numeroValido = (s) => /^\d{12}$/.test(String(s)) && damm(s) === 0;
  const conControl = (once) => String(once) + String(damm(once));
  const nuevoNumero = () => { let s = ''; while (s.length < 11) { for (const x of azar(16)) { if (x < 250 && s.length < 11) s += String(x % 10); } } return conControl(s); };
  const numeroBonito = (s) => String(s || '').replace(/(\d{3})(?=\d)/g, '$1 ');
  async function pbkdf2(texto, sal, vueltas, bits) {
    const k = await sub.importKey('raw', te.encode(texto), 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await sub.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: te.encode(sal), iterations: vueltas }, k, bits));
  }
  const idnDe = async (n) => hex(await pbkdf2(String(n), 'GUARDIANA número v1', 300000, 256));
  // la cita de dos números (la misma desde los dos lados): T, que ve el relé, y la clave del sobre, que no ve
  async function citaDe(a, b) {
    a = String(a); b = String(b);
    const p = await pbkdf2(a < b ? a + ':' + b : b + ':' + a, 'GUARDIANA cita v1', 100000, 512);
    const T = hex(await sha256(cat(te.encode('GUARDIANA cita T v1\n'), p)));
    const k = await hkdf(p, null, 'GUARDIANA cita clave v1', 32); p.fill(0);
    const clave = await aes(k); k.fill(0);
    return { T, clave };
  }
  const buzonDe = async (idn) => hex(await sha256(te.encode('GUARDIANA buzón v1\n' + idn)));
  const ADC = (T) => te.encode('GUARDIANA cita v1\n' + T);
  async function cierraSobre(clave, T, obj) { const iv = azar(12); const ct = new Uint8Array(await sub.encrypt({ name: 'AES-GCM', iv, additionalData: ADC(T) }, clave, te.encode(JSON.stringify(obj)))); return b64u(cat(iv, ct)); }
  async function abreSobre(clave, T, s) { try { const b = deB64u(s); if (b.length < 29) return null; return JSON.parse(td.decode(await sub.decrypt({ name: 'AES-GCM', iv: b.subarray(0, 12), additionalData: ADC(T) }, clave, b.subarray(12)))); } catch (_) { return null; } }
  // lo que firma cada uno en su sobre: la cita, su número, sus dos claves, su valor al azar y la hora
  const datosCita = (T, n, f, a, r, t) => te.encode('GUARDIANA cita firma v1\n' + T + '\n' + n + '\n' + f + '\n' + a + '\n' + r + '\n' + t);
  // lo que firma la app al presentar su número en una conexión (el reto lo pone el relé)
  const datosYo = (reto, idn, f, a) => te.encode('GUARDIANA yo v1\n' + reto + '\n' + idn + '\n' + f + '\n' + a);
  // La semilla de la conversación entre dos números (agencia, ronda 73: «ECDH estático solo para proteger un intercambio firmado
  // de valores aleatorios nuevos; vinculen la derivación a ambas identidades»): el acuerdo entre las dos identidades (solo lo
  // pueden calcular ellas) con los dos valores al azar de los sobres y las dos huellas. Cada emparejamiento, una semilla distinta.
  async function semillaNumeros(yo, suAcuerdoPub, miIdn, suIdn, miR, suR) {
    const s = await dh(yo.acuerdo.privateKey, suAcuerdoPub);
    const [i1, i2, r1, r2] = miIdn < suIdn ? [miIdn, suIdn, u8(miR), u8(suR)] : [suIdn, miIdn, u8(suR), u8(miR)];
    const sal = await sha256(cat(te.encode('GUARDIANA semilla número v1\n'), r1, r2));
    const semilla = await hkdf(s, sal, 'GUARDIANA semilla número v1\n' + i1 + '\n' + i2, 32);
    s.fill(0); return semilla;
  }
  const N = { damm, numeroValido, conControl, nuevoNumero, numeroBonito, idnDe, citaDe, buzonDe, cierraSobre, abreSobre, datosCita, datosYo, semillaNumeros };

  const B = { sha384, hkdf384, hmac384, hayBlindada, creaIdentidad: creaIdentidadB, abreDsa: abreDsaB, huella: huellaB, numeroSeguridad: numeroSeguridadB, firma: firmaB, verifica: verificaB, firmaPQ, verificaPQ, deSemilla: deSemillaB, efimera: efimeraB, kemPar: kemParB, kemEncapsula: kemEncapsulaB, kemAbre: kemAbreB, datosInicia: datosIniciaB, datosResponde: datosRespondeB, sesion: sesionB, cadena: cadenaB, rellena, RELLENO, EK: B_EK, DK: B_DK, CT: B_CT, DSA_PUB: B_DSA_PUB, DSA_FIRMA: B_DSA_FIRMA, EC: B_EC, CTX: B_CTX };

  raiz.GuardianaCripto = { te, td, u8, cat, b64u, deB64u, hex, deHex, azar, sha256, hkdf, hmac, aes, sella, abre, nonce, creaIdentidad, huella, numeroSeguridad, firma, verifica, deSemilla, nuevaSemilla, efimera, sesion, cadena, claveDeCodigo, nuevoCodigo, hayPQ, kemPar, kemEncapsula, kemAbre, datosInicia, datosResponde, KEM_EK, KEM_DK, KEM_CT, B, N };
})(typeof window !== 'undefined' ? window : globalThis);
