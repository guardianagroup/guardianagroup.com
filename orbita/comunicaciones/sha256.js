// GUARDIANA · Comunicaciones · SHA-256 por partes (27 Oct 2026). Web Crypto no permite calcular la huella de un archivo
// por trozos, y un archivo grande nunca se carga entero en memoria: esto la calcula a medida que pasan los fragmentos,
// en el mismo orden en los dos equipos. Es el algoritmo de FIPS 180-4, sin dependencias; da el mismo resultado que
// `sha256sum` o `Get-FileHash`, así que cualquiera puede comprobar la huella de un comprobante con sus propias herramientas.
'use strict';
(function (raiz) {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
  function crea() {
    const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    const W = new Uint32Array(64), resto = new Uint8Array(64);
    let enResto = 0, total = 0, cerrado = false;
    function bloque(b, o) {
      for (let i = 0; i < 16; i++, o += 4) W[i] = (b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3];
      for (let i = 16; i < 64; i++) {
        const x = W[i - 15], y = W[i - 2];
        const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
      }
      let a = H[0], b2 = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (let i = 0; i < 64; i++) {
        const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
        const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        const t2 = (S0 + ((a & b2) ^ (a & c) ^ (b2 & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b2; b2 = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b2) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    function pon(datos) {
      if (cerrado) throw new Error('huella ya cerrada');
      const d = datos instanceof Uint8Array ? datos : new Uint8Array(datos);
      let i = 0; total += d.length;
      if (enResto) {
        const n = Math.min(64 - enResto, d.length);
        resto.set(d.subarray(0, n), enResto); enResto += n; i = n;
        if (enResto === 64) { bloque(resto, 0); enResto = 0; }
      }
      for (; i + 64 <= d.length; i += 64) bloque(d, i);
      if (i < d.length) { resto.set(d.subarray(i), 0); enResto = d.length - i; }
      return this;
    }
    function cierra() {
      if (cerrado) throw new Error('huella ya cerrada');
      cerrado = true;
      const bits = total * 8, alto = Math.floor(bits / 4294967296), bajo = bits >>> 0;
      const fin = new Uint8Array(enResto < 56 ? 64 : 128);
      fin.set(resto.subarray(0, enResto)); fin[enResto] = 0x80;
      const n = fin.length;
      fin[n - 8] = alto >>> 24; fin[n - 7] = alto >>> 16; fin[n - 6] = alto >>> 8; fin[n - 5] = alto;
      fin[n - 4] = bajo >>> 24; fin[n - 3] = bajo >>> 16; fin[n - 2] = bajo >>> 8; fin[n - 1] = bajo;
      for (let o = 0; o < n; o += 64) bloque(fin, o);
      const out = new Uint8Array(32);
      for (let i = 0; i < 8; i++) { out[i * 4] = H[i] >>> 24; out[i * 4 + 1] = H[i] >>> 16; out[i * 4 + 2] = H[i] >>> 8; out[i * 4 + 3] = H[i]; }
      return out;
    }
    return { pon, cierra, get bytes() { return total; } };
  }
  const hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  raiz.GuardianaSHA256 = { crea, hex };
})(typeof window !== 'undefined' ? window : globalThis);
