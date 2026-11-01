// GUARDIANA · el vigilante del sello (1 Nov 2026). Dueño, 16:30: «el tema de sellar la web tiene que ser de primer nivel…
// del máximo nivel posible». Agencia (ronda 87, Gemini): «el vigilante, fuera de GitHub».
//
// Corre en cada servidor de GUARDIANA cada 15 minutos (zero-vigilante.timer), no en GitHub: si alguien tomara GitHub, no
// podría apagarlo. Comprueba tres cosas y deja el resultado en un archivo que el motor sirve en /vigilante:
//   1. La web: que la publicación vigente de https://guardianagroup.com/sello/ lleve la firma del dueño (con las llaves
//      instaladas en el servidor, no con las de la web) y que cada archivo publicado sea el del manifiesto firmado.
//      Cada vez: el sello y el código (HTML, JS, CSS) con petición condicional; cada 3 horas, el código entero; una vez al
//      día (un servidor distinto cada día), todo, instaladores incluidos.
//   2. Los certificados: los nuevos del dominio en los registros públicos de transparencia (crt.sh); solo se esperan
//      los de Let's Encrypt y, de reserva para los servidores, ZeroSSL/Sectigo; y solo para nombres conocidos.
//   3. El DNS, preguntado a dos resolutores públicos (Cloudflare y Google): las direcciones de la web y de los servidores,
//      DNSSEC (registro DS) y CAA.
// No envía nada de las personas: solo descarga la web pública y consulta datos públicos.
'use strict';
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sello = require('./sello');

const SITIO = process.env.VIGILANTE_SITIO || 'https://guardianagroup.com';
const LLAVES = process.env.SELLO_LLAVES || '/etc/guardiana/sello-llaves.json';
const SALIDA = process.env.VIGILANTE_SALIDA || '/opt/guardiana/vigilante.json';
const MEMORIA = process.env.VIGILANTE_MEMORIA || '/opt/guardiana/vigilante-memoria.json';
const CODIGO = /\.(html?|m?js|css|webmanifest|json)$/i;
const NOMBRES = new Set(['guardianagroup.com', 'www.guardianagroup.com', 'motor.guardianagroup.com', 'motor-am.guardianagroup.com',
  'motor-hel.guardianagroup.com', 'rele.guardianagroup.com', 'rele-am.guardianagroup.com', 'ru.guardianagroup.com']);
const EMISORES = /Let's Encrypt|ZeroSSL|Sectigo/i;
const PAGES = new Set(['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153']);
const SERVIDORES = { 'motor.guardianagroup.com': '168.119.225.147', 'motor-am.guardianagroup.com': '144.202.36.32', 'motor-hel.guardianagroup.com': '62.238.17.121' };

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const ahora = () => new Date().toISOString();

function trae(url, opciones) {
  const o = Object.assign({ max: 400 * 1024 * 1024, ms: 30000, cabeceras: {} }, opciones || {});
  return new Promise((ok, mal) => {
    const req = https.get(url, { headers: Object.assign({ 'user-agent': 'GUARDIANA-vigilante/1 (+https://guardianagroup.com/sello/)', 'cache-control': 'no-cache' }, o.cabeceras), timeout: o.ms }, (res) => {
      if (res.statusCode === 304) { res.resume(); return ok({ estado: 304, cuerpo: null, etag: res.headers.etag || '' }); }
      if (res.statusCode !== 200) { res.resume(); return ok({ estado: res.statusCode, cuerpo: null, etag: '' }); }
      const trozos = []; let n = 0;
      res.on('data', (d) => { n += d.length; if (n > o.max) { req.destroy(new Error('demasiado grande')); return; } trozos.push(d); });
      res.on('end', () => ok({ estado: 200, cuerpo: Buffer.concat(trozos), etag: res.headers.etag || '' }));
      res.on('error', mal);
    });
    req.on('timeout', () => req.destroy(new Error('tiempo agotado')));
    req.on('error', mal);
  });
}
async function json(url) { const r = await trae(url, { max: 8 * 1024 * 1024 }); if (r.estado !== 200) throw new Error(url + ' → ' + r.estado); return JSON.parse(r.cuerpo.toString('utf8')); }

function lee(p, d) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return d; } }
function escribe(p, o) { const t = p + '.tmp'; fs.writeFileSync(t, JSON.stringify(o, null, 1)); fs.renameSync(t, p); }

// 1. la web contra el manifiesto firmado
async function web(memoria, problemas) {
  const llaves = lee(LLAVES, {}).llaves;
  if (!Array.isArray(llaves) || !llaves.length) { problemas.push('el servidor no tiene las llaves del dueño (' + LLAVES + ')'); return null; }
  const actual = await json(SITIO + '/sello/actual.json?' + Date.now());
  const n = actual && actual.seq;
  if (!Number.isInteger(n)) { problemas.push('la web no tiene publicación sellada'); return null; }
  const doc = (await trae(`${SITIO}/sello/publicaciones/${n}.doc.json?${Date.now()}`)).cuerpo;
  const firma = await json(`${SITIO}/sello/publicaciones/${n}.firma.json?${Date.now()}`);
  const man = (await trae(`${SITIO}/sello/manifiestos/${n}.json?${Date.now()}`)).cuerpo;
  const v = sello.verificaFirma(doc || Buffer.alloc(0), firma, llaves);
  if (!v.ok) { problemas.push(`la publicación ${n} de la web NO lleva una firma válida del dueño: ${v.motivo}`); return { seq: n, firma: false }; }
  if (!man || sha(man) !== v.doc.manifiesto) { problemas.push(`el manifiesto de la publicación ${n} no es el firmado`); return { seq: n, firma: true, manifiesto: false }; }
  if (n < (memoria.seq || 0)) problemas.push(`la web ha vuelto a una publicación anterior (${n} < ${memoria.seq})`);
  memoria.seq = Math.max(memoria.seq || 0, n);
  const caduca = Date.parse(v.doc.expira);
  if (caduca < Date.now()) problemas.push(`la firma de la publicación ${n} caducó el ${v.doc.expira}: hay que firmar una nueva`);
  const archivos = JSON.parse(man.toString('utf8')).archivos || {};
  // qué toca revisar en esta vuelta
  const h = new Date();
  const todo = process.env.VIGILANTE_TODO === '1' || (h.getUTCHours() === 3 && h.getUTCMinutes() < 15 && (Math.floor(Date.now() / 864e5) % 3) === (parseInt(sha(os.hostname()).slice(0, 2), 16) % 3));
  const completo = todo || !memoria.completo || Date.now() - memoria.completo > 3 * 3600e3;
  const lista = Object.keys(archivos).filter((p) => todo || CODIGO.test(p));
  memoria.etag = memoria.etag || {};
  const distintos = []; let revisados = 0, condicionales = 0;
  for (let i = 0; i < lista.length; i += 6) {
    await Promise.all(lista.slice(i, i + 6).map(async (p) => {
      const url = SITIO + '/' + p.split('/').map(encodeURIComponent).join('/');
      const e = memoria.etag[p];
      const cab = !completo && e && e.h === archivos[p] ? { 'if-none-match': e.etag } : {};
      let r;
      try { r = await trae(url, { cabeceras: cab }); } catch (err) { distintos.push(p + ' (no responde: ' + err.message + ')'); return; }
      revisados++;
      if (r.estado === 304) { condicionales++; return; }
      if (r.estado !== 200) { distintos.push(p + ' (' + r.estado + ')'); return; }
      const hh = sha(r.cuerpo);
      if (hh !== archivos[p]) { distintos.push(p); delete memoria.etag[p]; return; }
      if (r.etag) memoria.etag[p] = { etag: r.etag, h: hh };
    }));
  }
  if (completo) memoria.completo = Date.now();
  if (distintos.length) problemas.push(`${distintos.length} archivos de la web no son los firmados: ${distintos.slice(0, 12).join(', ')}${distintos.length > 12 ? '…' : ''}`);
  return { seq: n, firma: true, llave: v.llave, caduca: v.doc.expira, archivos: Object.keys(archivos).length, revisados, condicionales, completo, todo, distintos: distintos.length };
}

// 2. certificados nuevos del dominio (registros de transparencia, vía crt.sh)
async function certificados(memoria, problemas) {
  let lista;
  try { lista = await json('https://crt.sh/?q=%25.guardianagroup.com&output=json&exclude=expired'); } catch (e) { return { error: 'crt.sh no responde: ' + e.message }; }
  memoria.ct = memoria.ct || [];
  const vistos = new Set(memoria.ct);
  const nuevos = [];
  for (const c of lista) {
    if (!c || vistos.has(c.id)) continue;
    vistos.add(c.id);
    const nombres = String(c.name_value || '').split(/\s+/).filter(Boolean);
    const raros = nombres.filter((x) => !NOMBRES.has(x.toLowerCase()));
    const emisor = String(c.issuer_name || '');
    const malo = !EMISORES.test(emisor) || raros.length;
    nuevos.push({ id: c.id, nombres, emisor: emisor.slice(0, 120), desde: c.not_before, malo: !!malo });
    if (malo && memoria.ct.length) problemas.push(`certificado nuevo inesperado (${emisor.replace(/.*O=/, '').slice(0, 60)}) para ${nombres.join(', ')}`);
  }
  memoria.ct = [...vistos].slice(-5000);
  return { conocidos: memoria.ct.length, nuevos: nuevos.length, raros: nuevos.filter((x) => x.malo).length };
}

// 3. DNS por dos resolutores públicos (DNS sobre HTTPS)
async function dns(problemas) {
  const RES = { cloudflare: 'https://cloudflare-dns.com/dns-query', google: 'https://dns.google/resolve' };
  const pregunta = async (base, nombre, tipo) => {
    const r = await trae(`${base}?name=${encodeURIComponent(nombre)}&type=${tipo}`, { cabeceras: { accept: 'application/dns-json' }, max: 1 << 20 });
    if (r.estado !== 200) throw new Error(base + ' ' + r.estado);
    return JSON.parse(r.cuerpo.toString('utf8'));
  };
  const out = {};
  for (const [quien, base] of Object.entries(RES)) {
    try {
      const a = await pregunta(base, 'guardianagroup.com', 'A');
      const ips = (a.Answer || []).filter((x) => x.type === 1).map((x) => x.data);
      if (!ips.length || ips.some((x) => !PAGES.has(x))) problemas.push(`${quien}: guardianagroup.com apunta a ${ips.join(', ') || 'nada'} (se esperan las de GitHub Pages)`);
      if (!a.AD) problemas.push(`${quien}: la respuesta de guardianagroup.com no viene validada con DNSSEC`);
      const ds = await pregunta(base, 'guardianagroup.com', 'DS');
      if (!(ds.Answer || []).some((x) => x.type === 43)) problemas.push(`${quien}: guardianagroup.com sin registro DS (DNSSEC)`);
      const caa = await pregunta(base, 'guardianagroup.com', 'CAA');
      const v = (caa.Answer || []).filter((x) => x.type === 257).map((x) => String(x.data));
      if (!v.some((x) => /letsencrypt\.org/.test(x))) problemas.push(`${quien}: falta el CAA de Let's Encrypt`);
      for (const [n, ip] of Object.entries(SERVIDORES)) {
        const r = await pregunta(base, n, 'A');
        const got = (r.Answer || []).filter((x) => x.type === 1).map((x) => x.data);
        if (!got.includes(ip)) problemas.push(`${quien}: ${n} apunta a ${got.join(', ') || 'nada'} (se espera ${ip})`);
      }
      out[quien] = { ips, dnssec: !!a.AD, caa: v.length };
    } catch (e) { out[quien] = { error: e.message }; }
  }
  return out;
}

async function vuelta() {
  const memoria = lee(MEMORIA, {});
  const problemas = [];
  let dominio = ''; try { dominio = fs.readFileSync('/etc/guardiana/dominio', 'utf8').trim(); } catch (_) {}
  const r = { v: 1, servidor: dominio, revisado: ahora() };
  try { r.web = await web(memoria, problemas); } catch (e) { r.web = { error: e.message }; problemas.push('no se pudo revisar la web: ' + e.message); }
  try { r.certificados = await certificados(memoria, problemas); } catch (e) { r.certificados = { error: e.message }; }
  try { r.dns = await dns(problemas); } catch (e) { r.dns = { error: e.message }; }
  r.ok = problemas.length === 0;
  r.problemas = problemas;
  const antes = lee(SALIDA, {});
  if (JSON.stringify(antes.problemas || []) !== JSON.stringify(problemas)) r.cambio = ahora(); else r.cambio = antes.cambio || ahora();
  escribe(MEMORIA, memoria);
  escribe(SALIDA, r);
  console.log(r.ok ? 'vigilante: todo en orden' : 'vigilante: ' + problemas.length + ' problemas · ' + problemas.join(' | '));
  return r;
}

module.exports = { vuelta };
if (require.main === module) vuelta().then((r) => process.exit(r.ok ? 0 : 1)).catch((e) => { console.error('vigilante:', e); process.exit(2); });
