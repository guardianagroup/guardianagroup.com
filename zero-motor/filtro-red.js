// ZERO · filtro de red de cada celda (26 Oct 2026).
//
// Dueño: «Tor solo para la web normal, la comercial; que esté capado y no se pueda entrar en zonas prohibidas o
// ilegales. Eso es importantísimo» y «que ninguna web pueda infectar nada; que quede sellada ahí dentro».
// Ronda 50b (agencia): un SOCKS propio delante de la salida es una capa válida, pero hay que cerrar también localhost,
// redes privadas, metadatos del proveedor y servicios administrativos del propio servidor.
//
// Un SOCKS5 mínimo por celda, en 127.0.0.1 con puerto efímero. Chromium le manda el nombre de cada destino (con SOCKS5 la
// resolución es remota) y, con «<-loopback>» en la lista de excepciones, también lo que vaya a localhost. Así se ve el
// nombre de toda conexión de la celda: navegaciones, redirecciones, marcos, imágenes, scripts y WebSockets.
//  · Con Tor (ULTRA): las .onion solo pasan si están en ONION_PERMITIDAS; el resto de la web normal sigue a Tor tal cual
//    (Tor resuelve el nombre en el repetidor de salida, que por defecto no conecta con redes privadas).
//  · Sin Tor: el filtro resuelve el nombre y no conecta nunca con direcciones de este equipo, de redes privadas, enlace
//    local (metadatos del proveedor), multidifusión o reservadas; tampoco con .onion (no hay Tor). Mirar la dirección
//    después de resolver cierra también el «DNS rebinding» (un nombre público que de pronto apunta a 127.0.0.1).
// Solo CONNECT (ni BIND ni UDP), sin usuario ni contraseña. No guarda nada: solo cuenta lo rechazado para avisar.
'use strict';
const net = require('net');
const dns = require('dns');

// Servicios .onion oficiales verificados (dominio base; se admiten sus subdominios). Cada uno, con su fuente oficial.
const ONION_PERMITIDAS = [
  // Brave (web y buscador, search.<base>): https://community.brave.app/t/update-new-onion-addresses-for-brave-website-and-brave-search/271955
  'brave4u7jddbv7cyviptqjc7jusxh72uik7zt6adtckl5f4nwy2v72qd.onion',
];

const limpia = (h) => String(h || '').toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
const esOnion = (h) => /\.onion$/.test(limpia(h));
const onionPermitida = (h) => { h = limpia(h); return ONION_PERMITIDAS.some((b) => h === b || h.endsWith('.' + b)); };
const onionVetada = (h) => esOnion(h) && !onionPermitida(h); // ULTRA no debe conectar con ese nombre

// Direcciones a las que una celda no conecta nunca (RFC 6890 y compañía).
const PROHIBIDAS = new net.BlockList();
for (const [ip, n] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12],
  ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4]]) PROHIBIDAS.addSubnet(ip, n, 'ipv4');
// (ojo: BlockList compara también las IPv4 con las reglas IPv6 de IPv4 mapeada; por eso esas formas se tratan aparte)
for (const [ip, n] of [['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['fec0::', 10], ['ff00::', 8], ['2001:db8::', 32], ['100::', 64]]) PROHIBIDAS.addSubnet(ip, n, 'ipv6');
function ipProhibida(ip) {
  ip = limpia(ip);
  const t = net.isIP(ip); if (!t) return false;
  if (t === 4) return PROHIBIDAS.check(ip, 'ipv4');
  const g = expande6(ip);
  // IPv4 dentro de IPv6 (mapeada ::ffff:a.b.c.d o NAT64 64:ff9b::a.b.c.d): se mira la IPv4
  if (g && ((g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) || (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)))) {
    return PROHIBIDAS.check([g[6] >> 8, g[6] & 255, g[7] >> 8, g[7] & 255].join('.'), 'ipv4');
  }
  return PROHIBIDAS.check(ip, 'ipv6');
}
// IPv6 en sus 8 grupos de 16 bits (admite «::» y una IPv4 al final)
function expande6(ip) {
  let s = ip; const m = s.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) s = s.slice(0, m.index) + ((+m[1] << 8) | +m[2]).toString(16) + ':' + ((+m[3] << 8) | +m[4]).toString(16);
  const [a, b] = s.split('::');
  const pa = a ? a.split(':') : [], pb = b !== undefined ? (b ? b.split(':') : []) : null;
  const g = pb === null ? pa : [...pa, ...Array(8 - pa.length - pb.length).fill('0'), ...pb];
  return g.length === 8 ? g.map((x) => parseInt(x || '0', 16)) : null;
}
// nombres que siempre son de este equipo o de una red local
const nombreLocal = (h) => { h = limpia(h); return h === 'localhost' || /\.(localhost|local|internal|lan|home\.arpa|localdomain)$/.test(h) || !h.includes('.') && !net.isIP(h); };

// DNS propio (c-ares, sin bloquear hilos), con caché corta
const resolutor = new dns.promises.Resolver({ timeout: 4000, tries: 2 });
const cacheDNS = new Map();
async function resuelve(host) {
  const c = cacheDNS.get(host); if (c && c.hasta > Date.now()) return c.ips;
  let ips = [];
  try { ips = await resolutor.resolve4(host); } catch (_) {}
  if (!ips.length) { try { ips = await resolutor.resolve6(host); } catch (_) {} }
  if (!ips.length) { try { ips = (await dns.promises.lookup(host, { all: true })).map((x) => x.address); } catch (_) {} }
  if (cacheDNS.size > 5000) cacheDNS.clear();
  cacheDNS.set(host, { ips, hasta: Date.now() + (ips.length ? 60000 : 5000) });
  return ips;
}

function destinoDe(proxy) {
  const u = new URL(String(proxy || '').replace(/^socks5h?:/i, 'http:'));
  return { host: u.hostname || '127.0.0.1', port: +u.port || 9050 };
}

class FiltroRed {
  // o.tor: 'socks5://127.0.0.1:9050' (ULTRA) o vacío (salida directa); o.permiteLocal: solo para pruebas en el propio equipo;
  // o.alVetar(host, motivo): una vez por nombre y celda; motivo 'onion' o 'local'
  constructor(o) {
    o = o || {};
    this.tor = o.tor ? destinoDe(o.tor) : null;
    this.permiteLocal = !!o.permiteLocal;
    this.alVetar = typeof o.alVetar === 'function' ? o.alVetar : () => {};
    this.vetadas = new Set();
    this.socks = new Set();
    this.servidor = net.createServer((c) => this.atiende(c));
    this.puerto = 0;
  }

  abre() {
    return new Promise((ok, mal) => {
      this.servidor.once('error', mal);
      this.servidor.listen(0, '127.0.0.1', () => { this.puerto = this.servidor.address().port; ok(this); });
    });
  }

  get url() { return 'socks5://127.0.0.1:' + this.puerto; }

  cierra() {
    try { this.servidor.close(); } catch (_) {}
    for (const s of this.socks) { try { s.destroy(); } catch (_) {} }
    this.socks.clear();
  }

  veta(host, motivo) {
    const h = limpia(host);
    if (!this.vetadas.has(h)) { this.vetadas.add(h); try { this.alVetar(h, motivo); } catch (_) {} }
  }

  atiende(c) {
    this.socks.add(c); c.on('close', () => this.socks.delete(c)); c.on('error', () => {});
    c.setTimeout(30000, () => c.destroy());
    let buf = Buffer.alloc(0), fase = 0;
    const responde = (cod) => { try { c.end(Buffer.from([5, cod, 0, 1, 0, 0, 0, 0, 0, 0])); } catch (_) {} };
    const lee = (d) => {
      buf = Buffer.concat([buf, d]);
      if (buf.length > 600) return c.destroy();
      if (fase === 0) { // saludo: VER NMETHODS METHODS…
        if (buf.length < 2) return;
        if (buf[0] !== 5) return c.destroy();
        const n = buf[1]; if (buf.length < 2 + n) return;
        const metodos = buf.subarray(2, 2 + n); buf = buf.subarray(2 + n);
        if (!metodos.includes(0)) { try { c.end(Buffer.from([5, 0xff])); } catch (_) {} return; }
        c.write(Buffer.from([5, 0])); fase = 1;
      }
      if (fase === 1) { // petición: VER CMD RSV ATYP DST.ADDR DST.PORT
        if (buf.length < 5) return;
        if (buf[0] !== 5) return c.destroy();
        const cmd = buf[1], atyp = buf[3];
        let largo, host;
        if (atyp === 1) { largo = 10; if (buf.length < largo) return; host = [...buf.subarray(4, 8)].join('.'); }
        else if (atyp === 3) { const n = buf[4]; largo = 7 + n; if (buf.length < largo) return; host = buf.subarray(5, 5 + n).toString('latin1'); }
        else if (atyp === 4) { largo = 22; if (buf.length < largo) return; host = buf.subarray(4, 20).toString('hex').match(/.{4}/g).join(':'); host = net.isIP(host) ? host : '::'; }
        else return responde(8); // tipo de dirección no admitido
        const puerto = buf.readUInt16BE(largo - 2);
        const peticion = buf.subarray(0, largo), resto = buf.subarray(largo);
        c.removeListener('data', lee); c.pause(); fase = 2; // lo que llegue después espera a la conexión
        if (cmd !== 1) return responde(7); // solo CONNECT: nada de BIND ni UDP
        const h = limpia(host);
        if (esOnion(h) && (!this.tor || onionVetada(h))) { this.veta(h, 'onion'); return responde(2); }
        if (!this.permiteLocal && (ipProhibida(h) || nombreLocal(h))) { this.veta(h, 'local'); return responde(2); }
        if (this.tor) return this.porTor(c, peticion, resto);
        this.directo(c, h, puerto, resto).catch(() => responde(1));
      }
    };
    c.on('data', lee);
  }

  // ULTRA: pasa la petición tal cual al SOCKS de Tor y, desde ahí, une los dos extremos sin mirar los datos.
  porTor(c, peticion, resto) {
    const t = net.connect(this.tor.port, this.tor.host);
    this.socks.add(t); t.on('close', () => { this.socks.delete(t); c.destroy(); }); t.on('error', () => c.destroy());
    c.on('close', () => t.destroy());
    let buf = Buffer.alloc(0);
    t.on('connect', () => t.write(Buffer.from([5, 1, 0])));
    const lee = (d) => {
      buf = Buffer.concat([buf, d]);
      if (buf.length < 2) return;
      t.removeListener('data', lee);
      if (buf[0] !== 5 || buf[1] !== 0) { try { c.end(Buffer.from([5, 1, 0, 1, 0, 0, 0, 0, 0, 0])); } catch (_) {} return t.destroy(); }
      t.write(peticion); if (resto.length) t.write(resto);
      if (buf.length > 2) c.write(buf.subarray(2));
      c.setTimeout(0);
      t.pipe(c); c.pipe(t);
    };
    t.on('data', lee);
  }

  // Salida directa: resolver aquí, descartar direcciones prohibidas y conectar con la primera permitida.
  async directo(c, host, puerto, resto) {
    const responde = (cod) => { try { c.end(Buffer.from([5, cod, 0, 1, 0, 0, 0, 0, 0, 0])); } catch (_) {} };
    let ips = net.isIP(host) ? [host] : await resuelve(host);
    if (c.destroyed) return;
    if (!ips.length) return responde(4); // no existe ese nombre
    const buenas = this.permiteLocal ? ips : ips.filter((ip) => !ipProhibida(ip));
    if (!buenas.length) { this.veta(host, 'local'); return responde(2); }
    const ip = buenas.find((x) => net.isIPv4(x)) || buenas[0];
    const t = net.connect({ host: ip, port: puerto });
    this.socks.add(t);
    let unido = false;
    t.setTimeout(20000, () => t.destroy(Object.assign(new Error('tiempo'), { code: 'ETIMEDOUT' })));
    t.on('connect', () => {
      unido = true; t.setTimeout(0); c.setTimeout(0);
      const b = Buffer.alloc(10); b[0] = 5; b[1] = 0; b[2] = 0; b[3] = 1; // dirección de enlace: 0.0.0.0:0
      c.write(b); if (resto.length) t.write(resto);
      t.pipe(c); c.pipe(t);
    });
    t.on('error', (e) => { if (unido) return c.destroy(); const k = String(e.code || ''); responde(k === 'ECONNREFUSED' ? 5 : /ENETUNREACH|EHOSTUNREACH/.test(k) ? 3 : k === 'ETIMEDOUT' ? 6 : 1); });
    t.on('close', () => { this.socks.delete(t); c.destroy(); });
    c.on('close', () => t.destroy());
  }
}

module.exports = { FiltroRed, onionVetada, onionPermitida, esOnion, ipProhibida, nombreLocal, ONION_PERMITIDAS };
