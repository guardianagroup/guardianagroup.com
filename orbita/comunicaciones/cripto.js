// GUARDIANA · Comunicaciones · criptografía de la página (26 Oct 2026). Solo Web Crypto del navegador; sin librerías.
//
// - Identidad: un par ECDSA P-256 (firma) y un par ECDH P-256 (acuerdo), creados aquí y guardados en IndexedDB
//   como claves no exportables. Su huella (SHA-256 de las dos públicas) es el «número de seguridad».
// - Invitación: 32 bytes aleatorios que viajan solo tras «#» en el enlace (el navegador no los manda a ningún
//   servidor). De ellos salen la sala del relé (SHA-256, el relé la ve) y la clave de presentación (HKDF, el relé no).
// - Sesión: con la otra persona presente, cada lado manda su presentación firmada (identidad + efímera) sellada con la
//   clave de presentación; el secreto de sesión mezcla tres acuerdos ECDH (efímera–efímera, identidad–efímera y
//   efímera–identidad) con HKDF-SHA256. De ahí salen dos cadenas (una por sentido) que avanzan con cada mensaje
//   (HMAC-SHA256): una clave distinta por mensaje, y la anterior se olvida. Cada sesión nueva renueva todo.
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
    return { sala, presentacion: await aes(presentacion) };
  }
  const nuevaSemilla = () => azar(32);

  // ---- sesión ----
  async function efimera() {
    const k = await sub.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    return { k, pub: new Uint8Array(await sub.exportKey('raw', k.publicKey)) };
  }
  async function dh(priv, pubRaw) {
    const pub = await sub.importKey('raw', u8(pubRaw), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    return new Uint8Array(await sub.deriveBits({ name: 'ECDH', public: pub }, priv, 256));
  }
  // Secreto de sesión: DH(ef mía, ef suya) ‖ DH(identidad mía, ef suya) ‖ DH(ef mía, identidad suya), ordenados igual en
  // los dos lados (quien «inicia» es quien tiene la huella menor), y la sala como sal.
  async function sesion(id, ef, suyo, sala, inicio) {
    const a = await dh(ef.k.privateKey, suyo.ef), b = await dh(id.acuerdo.privateKey, suyo.ef), c = await dh(ef.k.privateKey, suyo.acuerdoPub);
    const ikm = inicio ? cat(a, b, c) : cat(a, c, b);
    const raiz32 = await hkdf(ikm, deHex(sala), 'GUARDIANA sesión', 64);
    const envio = raiz32.subarray(inicio ? 0 : 32, inicio ? 32 : 64), recibo = raiz32.subarray(inicio ? 32 : 0, inicio ? 64 : 32);
    return { envio: new Uint8Array(envio), recibo: new Uint8Array(recibo) };
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

  raiz.GuardianaCripto = { te, td, u8, cat, b64u, deB64u, hex, deHex, azar, sha256, hkdf, hmac, aes, sella, abre, nonce, creaIdentidad, huella, numeroSeguridad, firma, verifica, deSemilla, nuevaSemilla, efimera, sesion, cadena };
})(typeof window !== 'undefined' ? window : globalThis);
