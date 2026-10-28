// GUARDIANA · Comunicaciones · el viaje del archivo y el comprobante de entrega e integridad, antes «de custodia digital» (dueño, 27 Oct 2026, 20:39: «ver
// mientras se envía el camino real en pantalla, el seguimiento en modo vídeo para que el cliente vea la protección real
// hasta la llegada a destino, y ambas partes reciben al terminar el resumen firmado»).
//
// Solo se enseña lo que se mide o se sabe, y se dice qué es cada cosa:
// - MEDIDO: lo que ha salido del equipo, lo que confirma el equipo del destinatario, la velocidad, la latencia de cada
//   equipo con el relé, los fragmentos autenticados, la salida y la llegada, y la huella SHA-256 calculada en los dos lados.
// - CONOCIDO: dónde está el relé de GUARDIANA (es nuestro).
// - ESTIMADO: el país de cada equipo (por la zona horaria del navegador; solo se comparte el país) y el tiempo restante.
// - ILUSTRATIVO: el trazado y las partículas: internet no deja ver el cable exacto ni los países por los que pasa.
// El comprobante es un registro que firman los dos equipos con su clave de identidad (ECDSA P-256 sobre SHA-256). Se
// comprueba en /orbita/comunicaciones/verificar/, en el navegador y sin enviar nada; la huella del archivo, también con
// sha256sum, shasum -a 256 o Get-FileHash.
'use strict';
(function (raiz) {
  const T = (s) => (raiz.GuardianaIdioma ? raiz.GuardianaIdioma.t(s) : s);
  const LOC = () => (raiz.GuardianaIdioma && raiz.GuardianaIdioma.locale) || 'es';
  const D = () => raiz.GuardianaViajeDatos;
  const te = new TextEncoder();
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  // ---------- formatos ----------
  const num = (n, d) => Number(n).toLocaleString(LOC(), { maximumFractionDigits: d == null ? 1 : d, minimumFractionDigits: 0 });
  const bytes = (n) => (n < 1024 ? num(n, 0) + ' B' : n < 1048576 ? num(n / 1024, 0) + ' KB' : n < 1073741824 ? num(n / 1048576, 1) + ' MB' : num(n / 1073741824, 2) + ' GB');
  const vel = (bps) => (bps >= 1048576 ? num(bps / 1048576, 1) + ' MB/s' : num(bps / 1024, 0) + ' KB/s');
  const dur = (s) => (s < 60 ? num(s, s < 10 ? 1 : 0) + ' s' : Math.floor(s / 60) + ' min ' + Math.round(s % 60) + ' s');
  const pais = (cc) => { if (!cc) return ''; try { return new Intl.DisplayNames([LOC()], { type: 'region' }).of(cc) || cc; } catch (_) { return cc; } };
  const fechaHora = (iso) => { const d = new Date(iso); if (!iso || isNaN(d)) return '—'; try { return d.toLocaleString(LOC(), { dateStyle: 'long', timeStyle: 'medium' }); } catch (_) { return d.toISOString(); } };
  const hms = (t) => new Date(t).toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  // latencia con el relé: la mínima de las últimas medidas (la del camino; el resto es la cola del propio envío)
  const minima = (xs) => { const a = (xs || []).filter((x) => Number.isFinite(x)).slice(-15); return a.length ? Math.min(...a) : null; };
  const b64u = (b) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const deB64u = (s) => { s = String(s || '').replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); };
  const hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  const agrupa = (h, n) => String(h || '').slice(0, n || 16).replace(/(.{4})(?=.)/g, '$1 ');

  // ---------- medidas de un envío ----------
  // v (lo rellena app.js) = { rol: 'envia'|'recibe', nombre, tam, trozos, estado, confirmados, enCamino, verificados,
  //   muestras: [[t, bytes confirmados]], t0, tFin, latMia, latSuya, paisMio, paisSuyo, rele, pq, verificada, otro,
  //   coincide, custodia ('si'|'no'|undefined), comprobante, comprobanteValido, eventos }
  function velocidad(v) {
    if (v.tFin && v.t0) return v.tam / Math.max(0.001, (v.tFin - v.t0) / 1000);
    const m = v.muestras || []; if (!m.length) return null;
    const ahora = Date.now();
    let i = m.length - 1; while (i > 0 && m[i - 1][0] >= ahora - 3000) i--;
    const a = m[Math.max(0, i - 1)], b = m[m.length - 1];
    // hasta «ahora»: si deja de llegar nada, la velocidad baja en vez de quedarse en la última
    if (ahora - a[0] >= 600 && b[1] > a[1]) return (b[1] - a[1]) / ((ahora - a[0]) / 1000);
    if (ahora - a[0] >= 600 && v.t0) return b[1] / Math.max(0.001, (ahora - v.t0) / 1000);
    return null;
  }
  function restante(v) { const bps = velocidad(v); if (!bps || !v.tam) return null; return Math.max(0, (v.tam - (v.confirmados || 0)) / bps); }
  function muestra(v, b) {
    const t = Date.now(); v.muestras = v.muestras || []; v.muestras.push([t, b]);
    // la velocidad máxima: la mayor medida sobre un tramo de al menos 1 s
    for (let i = v.muestras.length - 2; i >= 0; i--) { const [t0, b0] = v.muestras[i]; if (t - t0 >= 1000) { const r = (b - b0) / ((t - t0) / 1000); if (r > (v.velMax || 0)) v.velMax = r; break; } }
    while (v.muestras.length > 3 && v.muestras[1][0] < t - 20000) v.muestras.shift();
  }
  // latencias: mínima, mediana, máxima y número de medidas (en milisegundos, enteros)
  function estad(xs) {
    const a = (xs || []).filter((x) => Number.isFinite(x)).map((x) => Math.round(x)).sort((p, q) => p - q);
    return a.length ? { min: a[0], mediana: a[Math.floor((a.length - 1) / 2)], max: a[a.length - 1], n: a.length } : null;
  }
  // El tipo real del archivo por sus primeros bytes (no por su nombre): lo calculan los dos equipos y entra en el comprobante.
  function tipoPorContenido(b) {
    if (!b || !b.length) return null;
    const h = (i, n) => Array.from(b.subarray(i, i + n), (x) => x.toString(16).padStart(2, '0')).join('');
    const s = (i, n) => String.fromCharCode(...b.subarray(i, i + n));
    if (s(0, 5) === '%PDF-') return 'PDF';
    if (h(0, 4) === '504b0304') {
      const t = new TextDecoder('latin1').decode(b.subarray(0, Math.min(b.length, 65536)));
      if (/mimetypeapplication\/vnd\.oasis\.opendocument\.text/.test(t)) return 'ODT';
      if (/mimetypeapplication\/vnd\.oasis\.opendocument\.spreadsheet/.test(t)) return 'ODS';
      if (/word\//.test(t)) return 'DOCX'; if (/xl\//.test(t)) return 'XLSX'; if (/ppt\//.test(t)) return 'PPTX';
      return 'ZIP';
    }
    if (h(0, 3) === 'ffd8ff') return 'JPEG';
    if (h(0, 8) === '89504e470d0a1a0a') return 'PNG';
    if (s(0, 6) === 'GIF87a' || s(0, 6) === 'GIF89a') return 'GIF';
    if (s(0, 4) === 'RIFF' && s(8, 4) === 'WEBP') return 'WEBP';
    if (s(0, 4) === 'RIFF' && s(8, 4) === 'WAVE') return 'WAV';
    if (s(4, 4) === 'ftyp') { const m = s(8, 4); return m === 'qt  ' ? 'MOV' : /^M4A/.test(m) ? 'M4A' : /^(heic|heix|mif1|msf1)/.test(m) ? 'HEIC' : 'MP4'; }
    if (h(0, 4) === '1a45dfa3') return 'WEBM';
    if (s(0, 4) === 'OggS') return 'OGG';
    if (s(0, 3) === 'ID3') return 'MP3';
    if (h(0, 6) === '526172211a07') return 'RAR';
    if (h(0, 6) === '377abcaf271c') return '7Z';
    if (h(0, 2) === '1f8b') return 'GZIP';
    if (h(0, 8) === 'd0cf11e0a1b11ae1') return 'OLE';
    if (s(0, 5) === '{\\rtf') return 'RTF';
    if (s(0, 2) === 'MZ') return 'EXE';
    if (h(0, 4) === '7f454c46') return 'ELF';
    if (s(0, 4) === '8BPS') return 'PSD';
    const n = Math.min(b.length, 4096); let nul = false; for (let i = 0; i < n; i++) if (b[i] === 0) { nul = true; break; }
    if (!nul) { try { new TextDecoder('utf-8', { fatal: true }).decode(b.subarray(0, n - (n === 4096 ? 4 : 0))); return 'TXT'; } catch (_) {} }
    return null;
  }

  // ---------- el comprobante: registro canónico y firmas ----------
  const FORMATO = 'GUARDIANA comprobante de custodia v1'; // nombre interno del formato, sin cambios: así siguen siendo válidos los comprobantes ya emitidos y los de versiones anteriores
  const ETIQUETA = FORMATO + '\n';
  // JSON canónico: claves ordenadas, sin espacios; es exactamente lo que firman los dos equipos
  function canon(x) {
    if (x === null || typeof x !== 'object') return JSON.stringify(x === undefined ? null : x);
    if (Array.isArray(x)) return '[' + x.map(canon).join(',') + ']';
    return '{' + Object.keys(x).filter((k) => x[k] !== undefined).sort().map((k) => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}';
  }
  const aFirmar = (textoCanon) => te.encode(ETIQUETA + textoCanon);
  async function verificaFirma(claveB64, firmaB64, textoCanon) {
    try {
      const k = await crypto.subtle.importKey('raw', deB64u(claveB64), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, deB64u(firmaB64), aFirmar(textoCanon));
    } catch (_) { return false; }
  }
  const sha256 = async (b) => new Uint8Array(await crypto.subtle.digest('SHA-256', b));
  // el número de seguridad de Comunicaciones (cripto.js): 60 cifras a partir de las dos huellas ordenadas
  async function numeroSeguridad(hA, hB) {
    const [x, y] = hA < hB ? [hA, hB] : [hB, hA];
    const h = await sha256(te.encode('GUARDIANA número de seguridad\n' + x + '\n' + y));
    let s = ''; for (let i = 0; i < 12; i++) { const n = ((h[i * 2] << 8) | h[i * 2 + 1]) % 100000; s += String(n).padStart(5, '0') + (i % 4 === 3 ? '\n' : ' '); }
    return s.trim();
  }
  // ---- comprobante de la sesión blindada (suite CNSA 2.0): ECDSA P-384 sobre SHA-384 y ML-DSA-87, las dos obligatorias ----
  const FORMATO_B = 'GUARDIANA comprobante de entrega e integridad v2 blindada';
  const ETIQUETA_B = FORMATO_B + '\n';
  const CTX_B = te.encode('GUARDIANA comprobante v2'); // contexto de la firma ML-DSA-87 (FIPS 204)
  const aFirmarB = (textoCanon) => te.encode(ETIQUETA_B + textoCanon);
  async function verificaFirmaB(claveB64, firmaB64, textoCanon) {
    try {
      const k = await crypto.subtle.importKey('raw', deB64u(claveB64), { name: 'ECDSA', namedCurve: 'P-384' }, false, ['verify']);
      return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-384' }, k, deB64u(firmaB64), aFirmarB(textoCanon));
    } catch (_) { return false; }
  }
  function verificaFirmaPQ(claveB64, firmaB64, textoCanon) {
    try { const d = raiz.GuardianaMLDSA87; if (!d || typeof claveB64 !== 'string' || typeof firmaB64 !== 'string') return false; return !!d.verify(deB64u(firmaB64), aFirmarB(textoCanon), deB64u(claveB64), CTX_B); } catch (_) { return false; }
  }
  const sha384 = async (b) => new Uint8Array(await crypto.subtle.digest('SHA-384', b));
  async function numeroSeguridadB(hA, hB) {
    const [x, y] = hA < hB ? [hA, hB] : [hB, hA];
    const h = await sha384(te.encode('GUARDIANA número de seguridad blindada v1\n' + x + '\n' + y));
    let s = ''; for (let i = 0; i < 12; i++) { const n = ((h[i * 2] << 8) | h[i * 2 + 1]) % 100000; s += String(n).padStart(5, '0') + (i % 4 === 3 ? '\n' : ' '); }
    return s.trim();
  }
  async function verificaB(comp) {
    const r = { formato: true, blindada: true, emisor: false, receptor: false, emisorPQ: false, receptorPQ: false, huellas: false, coherente: false, numero: '' };
    try {
      const reg = comp.registro, texto = canon(reg), f = comp.firmas || {}, fq = comp.firmas_pq || {};
      const e = reg.emisor || {}, rc = reg.receptor || {};
      r.emisor = await verificaFirmaB(e.clave, f.emisor, texto) && verificaFirmaPQ(e.clave_pq, fq.emisor, texto);
      r.emisorPQ = verificaFirmaPQ(e.clave_pq, fq.emisor, texto);
      r.receptorPQ = fq.receptor ? verificaFirmaPQ(rc.clave_pq, fq.receptor, texto) : false;
      r.receptor = f.receptor ? (await verificaFirmaB(rc.clave, f.receptor, texto)) && r.receptorPQ : false;
      const hue = async (p) => hex(await sha384(new Uint8Array([...te.encode('GUARDIANA huella blindada v1\n'), ...deB64u(p.clave), ...deB64u(p.acuerdo), ...deB64u(p.clave_pq)])));
      r.huellas = (await hue(e)) === e.huella && (await hue(rc)) === rc.huella;
      const a = reg.archivo || {}, i = reg.integridad || {};
      r.coherente = reg.modo === 'blindada' && /^[0-9a-f]{64}$/.test(a.sha256 || '') && i.sha256_emisor === a.sha256 && i.sha256_receptor === a.sha256 && i.coincide === true && Number.isFinite(a.bytes);
      r.numero = await numeroSeguridadB(e.huella, rc.huella);
    } catch (_) {}
    r.valido = r.emisor && r.receptor && r.huellas && r.coherente;
    r.pendiente = r.emisor && r.huellas && !(comp.firmas || {}).receptor;
    return r;
  }
  // Comprueba un comprobante entero: las dos firmas, que cada clave corresponde a la huella que dice el registro y que
  // la huella del archivo es la misma en los dos lados.
  async function verifica(comp) {
    const r = { formato: false, emisor: false, receptor: false, huellas: false, coherente: false, numero: '' };
    try {
      if (comp && comp.formato === FORMATO_B && comp.registro && typeof comp.registro === 'object') return await verificaB(comp);
      if (!comp || comp.formato !== FORMATO || !comp.registro || typeof comp.registro !== 'object') return r;
      r.formato = true;
      const reg = comp.registro, texto = canon(reg), f = comp.firmas || {};
      r.emisor = await verificaFirma(reg.emisor && reg.emisor.clave, f.emisor, texto);
      r.receptor = f.receptor ? await verificaFirma(reg.receptor && reg.receptor.clave, f.receptor, texto) : false;
      const hue = async (p) => hex(await sha256(new Uint8Array([...deB64u(p.clave), ...deB64u(p.acuerdo)])));
      r.huellas = (await hue(reg.emisor)) === reg.emisor.huella && (await hue(reg.receptor)) === reg.receptor.huella;
      const a = reg.archivo || {}, i = reg.integridad || {};
      r.coherente = /^[0-9a-f]{64}$/.test(a.sha256 || '') && i.sha256_emisor === a.sha256 && i.sha256_receptor === a.sha256 && i.coincide === true && Number.isFinite(a.bytes);
      r.numero = await numeroSeguridad(reg.emisor.huella, reg.receptor.huella);
    } catch (_) {}
    r.valido = r.formato && r.emisor && r.receptor && r.huellas && r.coherente;
    r.pendiente = r.formato && r.emisor && r.huellas && !(comp.firmas || {}).receptor;
    return r;
  }
  function nombreDescarga(comp) {
    const reg = comp.registro || {}, a = reg.archivo || {}, d = new Date((reg.transporte && reg.transporte.llegada) || reg.emitido || Date.now());
    const dia = isNaN(d) ? '' : d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); // fecha local
    // \p{M}: las marcas combinantes (devanagari, tamil, tailandés…) son parte de la palabra
    return String(T('comprobante-entrega-integridad')).replace(/[^\p{L}\p{M}\p{N}._-]+/gu, '-') + '-' + dia + '-' + String(a.nombre || 'archivo').replace(/[^\p{L}\p{M}\p{N}._-]+/gu, '_').slice(0, 60) + '.json';
  }
  function descarga(comp) {
    const blob = new Blob([JSON.stringify(comp, null, 2) + '\n'], { type: 'application/json' });
    const u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = nombreDescarga(comp); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 60000);
  }

  // ---------- el comprobante como documento: en pantalla, en la página de verificación y para guardarlo en PDF ----------
  const ESCUDO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>';
  const AVISO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/></svg>';
  const cifrado = (pq) => (pq ? T('AES-256-GCM en cada fragmento; la clave del archivo viaja en la sesión ML-KEM-768 + ECDH P-256.') : T('AES-256-GCM en cada fragmento; la clave del archivo viaja en la sesión ECDH P-256.'));
  // la cronología y las incidencias se guardan como códigos; aquí se dicen en el idioma de quien lee
  const HITOS = {
    preparado: 'Archivo preparado', anuncio: 'Anuncio enviado al destinatario', aceptado: 'El destinatario acepta el archivo',
    salida: 'Primer fragmento enviado al relé de GUARDIANA', ultimo: 'Último fragmento enviado',
    confirmado: 'El equipo del destinatario confirma la llegada completa', firma: 'Comprobante firmado por el remitente',
    anuncio_recibido: 'Anuncio recibido', primero: 'Primer fragmento recibido y autenticado', llegada: 'Último fragmento autenticado: archivo completo.',
  };
  const INCIDENCIAS = { rele_lento: 'El relé limitó la velocidad del envío.', rele_atasco: 'El relé retuvo fragmentos por saturación del destinatario.' };
  // el tipo declarado (MIME) frente al tipo por el contenido: true si encajan, false si no, null si no se puede saber
  const TIPOS = { PDF: /pdf/, DOCX: /wordprocessingml|msword/, XLSX: /spreadsheetml|ms-excel/, PPTX: /presentationml|ms-powerpoint/, ODT: /opendocument\.text/, ODS: /opendocument\.spreadsheet/, ZIP: /zip|compressed/, JPEG: /jpe?g/, PNG: /png/, GIF: /gif/, WEBP: /webp/, WAV: /wav/, MOV: /quicktime/, M4A: /mp4|m4a|aac/, HEIC: /heic|heif/, MP4: /mp4/, WEBM: /webm/, OGG: /ogg/, MP3: /mpeg|mp3/, RAR: /rar/, '7Z': /7z/, GZIP: /gzip/, OLE: /msword|ms-excel|ms-powerpoint|x-ole|x-msi/, RTF: /rtf/, EXE: /x-msdownload|x-msdos|x-dosexec|x-ms-installer|x-executable/, ELF: /x-executable|x-elf|x-sharedlib/, PSD: /photoshop|psd/, TXT: /^text\/|json|xml|csv|javascript|x-sh|x-python|yaml/ };
  const encajaTipo = (mime, tipo) => (!tipo || !mime || /octet-stream/.test(mime) || !TIPOS[tipo] ? null : TIPOS[tipo].test(String(mime).toLowerCase()));
  // número del comprobante: los 16 primeros caracteres de la huella SHA-256 del registro firmado (el mismo en los dos equipos)
  // «GC-» en la sesión normal; «GB-» en la blindada (con su propia etiqueta de firma)
  async function referencia(comp) { const b = comp && comp.formato === FORMATO_B; return (b ? 'GB-' : 'GC-') + hex(await sha256((b ? aFirmarB : aFirmar)(canon((comp && comp.registro) || {})))).slice(0, 16).toUpperCase().replace(/(.{4})(?=.)/g, '$1-'); }
  const grupos = (x, n) => String(x || '').replace(new RegExp('(.{' + n + '})(?=.)', 'g'), '$1 ');
  const fechaHoraCorta = (iso) => { const d = new Date(iso); if (!iso || isNaN(d)) return '—'; try { return d.toLocaleString(LOC(), { dateStyle: 'short', timeStyle: 'medium' }); } catch (_) { return d.toISOString(); } };
  const latTexto = (o) => (o && Number.isFinite(o.min) ? T('mínima') + ' ' + o.min + ' ms · ' + T('mediana') + ' ' + o.mediana + ' ms · ' + T('máxima') + ' ' + o.max + ' ms · ' + o.n + ' ' + T('medidas') : '—');
  function documento(comp, res, ref) {
    const reg = comp.registro || {}, a = reg.archivo || {}, e = reg.emisor || {}, r = reg.receptor || {}, se = reg.sesion || {}, tr = reg.transporte || {}, ig = reg.integridad || {}, f = comp.firmas || {}, fq = comp.firmas_pq || {};
    const BL = comp.formato === FORMATO_B;
    const doc = el('article', 'cu-doc' + (BL ? ' cu-blindada' : ''));
    const mono = (x, n) => { const s = el('span', n ? 'cu-mono cu-agr' : 'cu-mono', n ? grupos(x, n) : String(x || '—')); s.setAttribute('translate', 'no'); return s; };
    // cabecera: marca, título, número y fecha de emisión
    const cab = el('header', 'cu-doc-cab'), marca = el('div', 'cu-marca'), mt = el('div');
    marca.innerHTML = ESCUDO; const g = el('b', null, 'GUARDIANA'); g.setAttribute('translate', 'no'); mt.append(g, el('span', null, BL ? T('Sesión blindada') + ' · ' + T('Entrega e integridad') : T('Entrega e integridad'))); marca.append(mt);
    const ti = el('div', 'cu-doc-ti'); ti.append(el('h2', null, T('Comprobante de entrega e integridad')));
    const n1 = el('p', 'cu-ref'); n1.append(el('span', null, T('Nº de comprobante')), mono(ref || '—'));
    const n2 = el('p', 'cu-ref'); n2.append(el('span', null, T('Emitido')), el('b', null, fechaHora(reg.emitido)));
    ti.append(n1, n2); cab.append(marca, ti); doc.append(cab);
    // estado de las firmas
    const clase = res.valido ? 'bien' : res.pendiente ? 'aviso' : 'mal';
    const est = el('div', 'cu-estado ' + clase), ico = el('span', 'cu-ico'); ico.innerHTML = res.valido ? ESCUDO : AVISO;
    const tx = el('div');
    tx.append(el('b', null, res.valido ? T('Firmado por los dos equipos') : res.pendiente ? T('Pendiente de la firma del destinatario') : T('Comprobante no válido')),
      el('span', null, res.valido ? T('Las dos firmas son válidas y el registro no se ha modificado desde que se firmó.') : res.pendiente ? T('El remitente ya lo ha firmado; falta la firma del equipo del destinatario.') : T('Las firmas no corresponden a este registro: se ha modificado o no procede de estos equipos.')));
    est.append(ico, tx); doc.append(est);
    const seccion = (titulo) => {
      const s = el('section', 'cu-sec'), dl = el('dl', 'cu-datos'); s.append(el('h3', null, titulo), dl); doc.append(s);
      return (k, v, cls, sinTraducir) => { const dd = el('dd', cls || null); if (v instanceof Node) dd.append(v); else dd.textContent = v; if (sinTraducir) dd.setAttribute('translate', 'no'); dl.append(el('dt', null, k), dd); return dd; };
    };
    let fila = seccion(T('Archivo'));
    fila(T('Nombre'), a.nombre || '—', 'cu-nombre', true);
    fila(T('Tamaño'), bytes(a.bytes || 0) + ' · ' + Number(a.bytes || 0).toLocaleString(LOC()) + ' bytes');
    const enc = encajaTipo(a.tipo_declarado, a.tipo_real);
    fila(T('Tipo'), [a.tipo_declarado ? T('declarado') + ': ' + a.tipo_declarado : '', T('por su contenido') + ': ' + (a.tipo_real || T('no reconocido'))].filter(Boolean).join(' · ') + (enc === false ? ' · ' + T('el contenido no corresponde al tipo declarado') : ''), enc === false ? 'cu-mal' : null);
    fila(T('Huella SHA-256'), a.sha256 || '—', 'cu-mono', true);
    fila(T('Fragmentos'), Number(a.fragmentos || 0).toLocaleString(LOC()) + ' × ' + bytes(a.tam_fragmento || 0));
    fila = seccion(T('Partes'));
    const parte = (p) => {
      const d = el('div', 'cu-parte');
      d.append(el('b', null, p.nombre || T('Sin nombre declarado')), el('small', null, BL ? T('Huella de identidad (SHA-384)') : T('Huella de identidad (SHA-256)')), mono(p.huella, 4));
      d.append(el('span', null, [p.region ? pais(p.region) + ' (' + T('país estimado') + ')' : '', p.verifico_al_otro ? T('número de seguridad comprobado') : T('número de seguridad sin comprobar'), p.version || ''].filter(Boolean).join(' · ')));
      return d;
    };
    fila(T('Remitente'), parte(e)); fila(T('Destinatario'), parte(r));
    if (res.numero) fila(T('Número de seguridad'), res.numero, 'cu-numero', true);
    if (BL) fila(T('Verificación mutua'), reg.verificacion_mutua ? T('Los dos equipos comprobaron el número de seguridad antes de enviar nada.') : T('No consta la comprobación mutua del número de seguridad.'), reg.verificacion_mutua ? 'cu-bien' : 'cu-mal');
    fila = seccion(T('Envío'));
    fila(T('Salida del remitente'), fechaHora(tr.salida) + ' · ' + T('según el reloj de su equipo'));
    fila(T('Llegada al destinatario'), fechaHora(tr.llegada) + ' · ' + T('según el reloj de su equipo'));
    if (Number.isFinite(tr.duracion_s)) fila(T('Duración'), dur(tr.duracion_s));
    if (Number.isFinite(tr.espera_s)) fila(T('Espera hasta la aceptación'), dur(tr.espera_s));
    fila(T('Velocidad'), [tr.velocidad_media_bps ? T('media') + ' ' + vel(tr.velocidad_media_bps) : '', tr.velocidad_maxima_bps ? T('máxima') + ' ' + vel(tr.velocidad_maxima_bps) : ''].filter(Boolean).join(' · ') || '—');
    const lm = tr.latencia_ms || {}, lat = el('div', 'cu-lineas');
    for (const [k, o] of [[T('Remitente'), lm.emisor], [T('Destinatario'), lm.receptor]]) { const l = el('span'); l.append(el('small', null, k), document.createTextNode(' ' + latTexto(o))); lat.append(l); }
    fila(T('Latencia con el relé'), lat);
    fila(T('Relé de GUARDIANA'), [[tr.rele_ciudad, pais(tr.rele_pais)].filter(Boolean).join(', '), tr.rele, tr.rele_region].filter(Boolean).join(' · ') + ' · ' + (tr.conexion === 'wss' ? T('conexión TLS') : T('conexión sin TLS (prueba local)')) + ' · ' + T('transporta fragmentos encriptados que no puede leer'));
    fila = seccion(T('Protección'));
    fila(T('Encriptación del archivo'), T('AES-256-GCM en cada fragmento, con una clave propia del archivo y una etiqueta de autenticación de 128 bits.'));
    if (BL) fila(T('Suite'), T('Sesión blindada con los algoritmos de la suite CNSA 2.0, en híbrido con criptografía clásica.'));
    fila(T('Acuerdo de claves'), BL ? T('Híbrido postcuántico: ML-KEM-1024 y ECDH P-384, combinados con HKDF-SHA-384.') : se.pq ? T('Híbrido postcuántico: ML-KEM-768 y ECDH P-256, combinados con HKDF-SHA-256.') : T('ECDH P-256, combinado con HKDF-SHA-256 (sin la capa postcuántica).'));
    if (se.id) { const d = el('div', 'cu-lineas'); d.append(mono(se.id, 4)); if (se.establecida) d.append(el('span', null, T('establecida') + ' ' + fechaHora(se.establecida))); fila(T('Sesión'), d); }
    fila(T('Firma del comprobante'), BL ? T('Doble firma de cada equipo: ECDSA P-384 sobre SHA-384 y ML-DSA-87 (FIPS 204). Las dos tienen que ser válidas.') : T('ECDSA P-256 sobre SHA-256, con la clave de identidad de cada equipo.'));
    fila = seccion(T('Integridad'));
    fila(T('Resultado'), ig.coincide ? T('La huella SHA-256 coincide en los dos equipos') : T('La huella SHA-256 no coincide'), ig.coincide ? 'cu-bien' : 'cu-mal');
    fila(T('Fragmentos autenticados'), Number(tr.fragmentos_verificados || 0).toLocaleString(LOC()) + ' / ' + Number(a.fragmentos || 0).toLocaleString(LOC()) + ' · ' + T('rechazados') + ': ' + Number(tr.fragmentos_rechazados || 0).toLocaleString(LOC()));
    const cro = Array.isArray(reg.cronologia) ? reg.cronologia.slice(0, 40) : [];
    if (cro.length) {
      const s = el('section', 'cu-sec'), t = el('table', 'cu-cro'); s.append(el('h3', null, T('Cronología')), t);
      for (const x of cro) { const fi = el('tr'); fi.append(el('td', 'cu-t', fechaHoraCorta(x.t)), el('td', 'cu-lado', x.lado === 'receptor' ? T('Destinatario') : T('Remitente')), el('td', null, T(HITOS[x.que] || String(x.que || '')))); t.append(fi); }
      doc.append(s);
    }
    fila = seccion(T('Incidencias'));
    const inc = Array.isArray(reg.incidencias) ? reg.incidencias.slice(0, 20) : [];
    fila(T('Durante el envío'), inc.length ? inc.map((x) => hms(x.t) + ' · ' + T(INCIDENCIAS[x.que] || String(x.que || ''))).join(' · ') : T('Ninguna.'));
    fila = seccion(T('Firmas digitales'));
    const firma = (p, sig, sigpq) => {
      const d = el('div', 'cu-firma');
      d.append(el('small', null, BL ? T('Clave pública (ECDSA P-384)') : T('Clave pública (ECDSA P-256)')), mono(p.clave), el('small', null, T('Firma')), sig ? mono(sig) : el('span', 'cu-mal', T('Falta la firma.')));
      // ML-DSA-87: la clave (2.592 bytes) y la firma (4.627) van enteras en el .json; aquí, su huella SHA-256 y su estado
      if (BL) d.append(el('small', null, T('Firma postcuántica (ML-DSA-87)')), el('span', sigpq ? null : 'cu-mal', sigpq ? T('presente en el archivo .json; se comprueba al verificar') : T('Falta la firma.')));
      return d;
    };
    fila(T('Remitente'), firma(e, f.emisor, fq.emisor)); fila(T('Destinatario'), firma(r, f.receptor, fq.receptor));
    fila(T('Cómo verificarlo'), BL ? T('Con el archivo .json de este comprobante en guardianagroup.com/orbita/comunicaciones/verificar/, que comprueba las dos firmas de cada equipo.') : T('Con el archivo .json de este comprobante en guardianagroup.com/orbita/comunicaciones/verificar/, o con cualquier herramienta de ECDSA P-256.'));
    doc.append(el('p', 'cu-nota', T('Este comprobante acredita que estos dos equipos firmaron este registro: el archivo con esta huella salió de uno y llegó íntegro al otro. No acredita la identidad legal de las personas ni el contenido del archivo.')));
    return doc;
  }
  async function pintaComprobante(caja, comp, res) {
    const ref = await referencia(comp);
    caja.textContent = ''; caja.append(documento(comp, res || (await verifica(comp)), ref));
  }
  // Guardar en PDF: el documento en claro, en A4, con el diálogo de impresión del navegador (cualquier idioma y alfabeto
  // sale con sus letras); el nombre propuesto es el del comprobante.
  async function preparaImpresion(comp) {
    const res = await verifica(comp), ref = await referencia(comp);
    let zona = document.getElementById('cu-imprime'); if (zona) zona.remove();
    zona = el('div'); zona.id = 'cu-imprime'; zona.append(documento(comp, res, ref)); document.body.append(zona);
    const titulo = document.title; document.title = nombreDescarga(comp).replace(/\.json$/, '');
    document.documentElement.classList.add('cu-imprimiendo');
    return () => { document.documentElement.classList.remove('cu-imprimiendo'); document.title = titulo; zona.remove(); };
  }
  async function imprime(comp) {
    const fin = await preparaImpresion(comp);
    const listo = () => { removeEventListener('afterprint', listo); fin(); };
    addEventListener('afterprint', listo);
    setTimeout(() => { try { window.print(); } catch (_) { listo(); } }, 80);
  }

  // ---------- el mapa ----------
  const RAD = Math.PI / 180;
  const vec = (p) => [Math.cos(p.lat * RAD) * Math.cos(p.lon * RAD), Math.cos(p.lat * RAD) * Math.sin(p.lon * RAD), Math.sin(p.lat * RAD)];
  // el arco de círculo máximo entre dos puntos (n tramos), con longitudes seguidas (sin saltos de ±360)
  function gran(a, b, n) {
    const A = vec(a), B = vec(b), w = Math.acos(Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]))), s = Math.sin(w);
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n; let x = A[0], y = A[1], z = A[2];
      if (s > 1e-6) { const p = Math.sin((1 - t) * w) / s, q = Math.sin(t * w) / s; x = p * A[0] + q * B[0]; y = p * A[1] + q * B[1]; z = p * A[2] + q * B[2]; }
      out.push({ lat: Math.atan2(z, Math.hypot(x, y)) / RAD, lon: Math.atan2(y, x) / RAD });
    }
    out[0].lon = a.lon;
    for (let i = 1; i < out.length; i++) { while (out[i].lon - out[i - 1].lon > 180) out[i].lon -= 360; while (out[i].lon - out[i - 1].lon < -180) out[i].lon += 360; }
    return out;
  }
  // La foto de la Tierra: NASA Blue Marble Next Generation (con relieve y batimetría, dominio público), la misma de Órbita:
  // 4096 × 2048 (dia.jpg), 8192 × 4096 (dia-8k.jpg) y 16384 × 8192 en 32 teselas de 45° (dia-16k/).
  const TIERRA = '/orbita/static/tierra/';
  const IMGS = new Map();
  const imagen = (url) => { let p = IMGS.get(url); if (!p) { p = new Promise((ok) => { const im = new Image(); im.decoding = 'async'; im.onload = () => ok(im); im.onerror = () => { IMGS.delete(url); ok(null); }; im.src = url; }); IMGS.set(url, p); } return p; };
  function Mapa(lienzo, capa) {
    const ctx = lienzo.getContext('2d');
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, fondo = null, foto = null, fotoT0 = 0, vista = null, clave = '', puntos = [], rutas = [], parts = [], emision = 0, ultimo = 0, flujo = 0, entregado = false, anim = 0;
    const proy = (p) => ({ x: ((p.lon - vista.lon0) / (vista.lon1 - vista.lon0)) * w, y: ((vista.lat1 - p.lat) / (vista.lat1 - vista.lat0)) * h });
    function vistaPara(ps) {
      if (!ps.length) return { lon0: -170, lon1: 190, lat0: -58, lat1: 80 };
      let lons = ps.map((p) => p.lon); const lats = ps.map((p) => p.lat);
      if (Math.max(...lons) - Math.min(...lons) > 180) lons = lons.map((x) => (x < 0 ? x + 360 : x));
      let lon0 = Math.min(...lons), lon1 = Math.max(...lons), lat0 = Math.min(...lats), lat1 = Math.max(...lats);
      const pl = Math.max(20, (lon1 - lon0) * 0.28), pa = Math.max(12, (lat1 - lat0) * 0.35);
      lon0 -= pl; lon1 += pl; lat0 -= pa; lat1 += pa;
      // nunca más cerca de 110° de ancho: el mapa conserva el contexto del mundo y el dibujo de puntos su densidad
      if (lon1 - lon0 < 110) { const m = (110 - (lon1 - lon0)) / 2; lon0 -= m; lon1 += m; }
      const asp = w / Math.max(1, h), ls = lon1 - lon0, as = lat1 - lat0;
      if (ls / as < asp) { const e = as * asp - ls; lon0 -= e / 2; lon1 += e / 2; } else { const e = ls / asp - as; lat0 -= e / 2; lat1 += e / 2; }
      if (lat1 > 84) { lat0 -= lat1 - 84; lat1 = 84; }
      if (lat0 < -64) { lat1 += -64 - lat0; lat0 = -64; }
      return { lon0, lon1, lat0, lat1 };
    }
    function pintaFondo() {
      fondo = document.createElement('canvas'); fondo.width = Math.round(w * dpr); fondo.height = Math.round(h * dpr);
      const c = fondo.getContext('2d'); c.scale(dpr, dpr);
      const t = D().tierra(), paso = t.paso, px = (paso / (vista.lon1 - vista.lon0)) * w, salto = px < 2.6 ? Math.ceil(2.6 / px) : 1;
      const r = Math.max(0.6, Math.min(1.5, px * salto * 0.2));
      c.fillStyle = 'rgba(156,195,228,.3)';
      for (let gy = 0; gy < t.h; gy += salto) {
        const lat = 90 - (gy + 0.5) * paso; if (lat < vista.lat0 - 2 || lat > vista.lat1 + 2) continue;
        for (let gx = 0; gx < t.w; gx += salto) {
          if (!t.hay(gx, gy)) continue;
          let lon = -180 + (gx + 0.5) * paso;
          if (lon < vista.lon0 - 2) lon += 360; else if (lon > vista.lon1 + 2) lon -= 360;
          if (lon < vista.lon0 - 2 || lon > vista.lon1 + 2) continue;
          const q = proy({ lat, lon }); c.beginPath(); c.arc(q.x, q.y, r, 0, 6.2832); c.fill();
        }
      }
    }
    // La foto a la resolución que pide la pantalla (píxeles reales por grado, con 1,6× de margen para que la reducción
    // quede nítida): el mapa de 4K, el de 8K o, si no basta, las teselas de 16K de la zona. En el móvil, el de 4K
    // mientras alcance. Encima, el tono de la página (más oscuro, con viñeta) para que la ruta y las etiquetas se lean.
    async function pideFoto() {
      const k = clave, v = vista, ppg = ((w * dpr) / (v.lon1 - v.lon0)) * 1.6, movil = matchMedia('(pointer: coarse)').matches;
      const nivel = ppg <= 4096 / 360 || (movil && ppg <= 1.6 * (4096 / 360)) ? 4 : ppg <= 8192 / 360 || movil ? 8 : 16;
      const c = document.createElement('canvas'); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      const g = c.getContext('2d'), W = c.width, H = c.height;
      const X = (lon) => ((lon - v.lon0) / (v.lon1 - v.lon0)) * W, Y = (lat) => ((v.lat1 - lat) / (v.lat1 - v.lat0)) * H;
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      if ('filter' in g) g.filter = 'saturate(0.86) contrast(1.05)';
      if (nivel < 16) {
        const im = await imagen(TIERRA + (nivel === 4 ? 'dia.jpg' : 'dia-8k.jpg'));
        if (!im || k !== clave) return;
        const pl = im.width / 360, pa = im.height / 180, la1 = Math.min(90, v.lat1), la0 = Math.max(-90, v.lat0);
        for (let r = -1; r <= 1; r++) {
          const a = Math.max(v.lon0, -180 + 360 * r), b = Math.min(v.lon1, 180 + 360 * r); if (b <= a) continue;
          g.drawImage(im, (a + 180 - 360 * r) * pl, (90 - la1) * pa, (b - a) * pl, (la1 - la0) * pa, X(a) - 0.5, Y(la1), X(b) - X(a) + 1, Y(la0) - Y(la1));
        }
      } else {
        const lista = [];
        for (let r = -1; r <= 1; r++) for (let col = 0; col < 8; col++) for (let fil = 0; fil < 4; fil++) {
          const a = -180 + 45 * col + 360 * r, b = a + 45, la1 = 90 - 45 * fil, la0 = la1 - 45;
          if (b > v.lon0 && a < v.lon1 && la0 < v.lat1 && la1 > v.lat0) lista.push({ url: TIERRA + 'dia-16k/' + col + '_' + fil + '.jpg', a, b, la1, la0 });
        }
        const ims = await Promise.all(lista.map((t) => imagen(t.url)));
        if (k !== clave) return;
        lista.forEach((t, i) => { if (ims[i]) g.drawImage(ims[i], X(t.a) - 0.5, Y(t.la1) - 0.5, X(t.b) - X(t.a) + 1, Y(t.la0) - Y(t.la1) + 1); });
        for (const t of lista) IMGS.delete(t.url); // las teselas de 16K no se guardan: ocupan mucha memoria
      }
      if ('filter' in g) g.filter = 'none';
      g.fillStyle = 'rgba(6,10,16,.34)'; g.fillRect(0, 0, W, H);
      const vi = g.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.72);
      vi.addColorStop(0, 'rgba(6,8,12,0)'); vi.addColorStop(1, 'rgba(6,8,12,.6)'); g.fillStyle = vi; g.fillRect(0, 0, W, H);
      foto = c; fotoT0 = performance.now();
    }
    function mide() {
      const b = lienzo.getBoundingClientRect(), nw = Math.max(1, Math.round(b.width)), nh = Math.max(1, Math.round(b.height)), nd = Math.min(3, window.devicePixelRatio || 1);
      if (nw === w && nh === h && nd === dpr) return false;
      w = nw; h = nh; dpr = nd; lienzo.width = Math.round(w * dpr); lienzo.height = Math.round(h * dpr); return true;
    }
    // Las etiquetas, sin taparse entre sí ni tapar los puntos: el relé primero; para cada una, la primera posición libre
    // (arriba, abajo, a un lado o en diagonal) dentro del mapa.
    const solape = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    function etiquetas() {
      capa.textContent = '';
      const cajas = [], marcas = puntos.map((p) => { const q = proy(p); return { x: q.x - 11, y: q.y - 11, w: 22, h: 22 }; });
      for (const p of [...puntos].sort((a, b) => (b.tipo === 'rele') - (a.tipo === 'rele'))) {
        const q = proy(p), e = el('div', 'vj-pin ' + p.lado);
        e.append(el('b', null, p.rotulo), el('span', null, p.sub)); capa.append(e);
        const ew = e.offsetWidth, eh = e.offsetHeight, d = 14;
        const cand = [[q.x - ew / 2, q.y - eh - d], [q.x - ew / 2, q.y + d], [q.x + d, q.y - eh / 2], [q.x - ew - d, q.y - eh / 2], [q.x + d - 4, q.y - eh - d + 4], [q.x - ew - d + 4, q.y - eh - d + 4], [q.x + d - 4, q.y + d - 4], [q.x - ew - d + 4, q.y + d - 4]];
        let mejor = null, coste = Infinity;
        for (const [x, y] of cand) {
          const r = { x: Math.max(6, Math.min(w - ew - 6, x)), y: Math.max(6, Math.min(h - eh - 6, y)), w: ew, h: eh };
          let k = Math.abs(r.x - x) + Math.abs(r.y - y);
          for (const o of cajas) k += solape(r, o) * 4;
          for (const o of marcas) k += solape(r, o) * 8;
          if (k < coste) { coste = k; mejor = r; }
          if (k === 0) break;
        }
        cajas.push(mejor); e.style.left = Math.round(mejor.x) + 'px'; e.style.top = Math.round(mejor.y) + 'px';
      }
    }
    // o = { origen, rele, destino } con { lat, lon, rotulo, sub, tipo: 'equipo'|'rele', lado }; flujo (bytes/s); entregado
    function pon(o) {
      const cambia = mide();
      const ps = [o.origen, o.rele, o.destino].filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lon)).map((p) => Object.assign({}, p));
      // los dos equipos en el mismo país: se separan un poco para que se vean los dos (los dos son estimados)
      const eq = ps.filter((p) => p.tipo === 'equipo');
      if (eq.length === 2 && Math.abs(eq[0].lat - eq[1].lat) < 2 && Math.abs(eq[0].lon - eq[1].lon) < 2) { eq[0].lon -= 2.2; eq[1].lon += 2.2; }
      const k = JSON.stringify([ps.map((p) => [p.lado, p.lat, p.lon, p.rotulo, p.sub]), w, h, dpr]);
      if (cambia || !vista || k !== clave) {
        clave = k; vista = vistaPara(ps);
        for (const p of ps) { while (p.lon < vista.lon0 - 10) p.lon += 360; while (p.lon > vista.lon1 + 10) p.lon -= 360; }
        puntos = ps;
        const de = ps.find((p) => p.lado === 'origen'), re = ps.find((p) => p.lado === 'rele'), a = ps.find((p) => p.lado === 'destino');
        rutas = [];
        if (de && re) rutas.push(gran(de, re, 72));
        if (re && a) rutas.push(gran(re, a, 72));
        if (!re && de && a) rutas.push(gran(de, a, 72));
        pintaFondo(); etiquetas(); parts = []; foto = null; pideFoto();
      }
      flujo = o.flujo || 0; entregado = !!o.entregado;
    }
    function tramo2d(g, k) {
      const pts = g.map(proy), n = pts.length - 1, largo = Math.hypot(pts[n].x - pts[0].x, pts[n].y - pts[0].y);
      const alto = Math.min(30, largo * 0.09) * (k % 2 ? 0.8 : 1);
      return pts.map((p, i) => ({ x: p.x, y: p.y - Math.sin((i / n) * Math.PI) * alto }));
    }
    const en = (pts, u) => { const f = u * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), t = f - i; return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * t, y: pts[i].y + (pts[i + 1].y - pts[i].y) * t }; };
    function cuadro(ts) {
      anim = requestAnimationFrame(cuadro);
      if (!vista) return;
      const dt = Math.min(0.1, (ts - (ultimo || ts)) / 1000); ultimo = ts;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      if (fondo) ctx.drawImage(fondo, 0, 0, w, h);
      if (foto) { const a = quieto ? 1 : Math.min(1, (ts - fotoT0) / 600); ctx.globalAlpha = Math.max(0, a); ctx.drawImage(foto, 0, 0, w, h); ctx.globalAlpha = 1; }
      const tramos = rutas.map(tramo2d);
      for (const pts of tramos) {
        ctx.save(); ctx.lineWidth = 1.6; ctx.lineCap = 'round';
        ctx.strokeStyle = entregado ? 'rgba(108,203,165,.8)' : 'rgba(156,195,228,.55)'; ctx.setLineDash(entregado ? [] : [5, 6]);
        if (!entregado && !quieto) ctx.lineDashOffset = -(ts / 60) % 11;
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (const q of pts) ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.restore();
      }
      // partículas (ilustrativas): más y más rápidas cuanto mayor es la velocidad medida
      if (!quieto && flujo > 0 && !entregado && tramos.length) {
        const fuerza = Math.min(1, Math.log10(1 + flujo / 20000) / 2.6), cada = 0.5 - fuerza * 0.42;
        emision += dt; while (emision > cada) { emision -= cada; parts.push({ u: 0, v: 0.2 + fuerza * 0.55 }); }
      }
      const total = tramos.length;
      for (let k = parts.length - 1; k >= 0; k--) {
        const p = parts[k]; p.u += p.v * dt; if (p.u >= total || entregado) { parts.splice(k, 1); continue; }
        const tr = tramos[Math.min(total - 1, Math.floor(p.u))], u = p.u - Math.floor(p.u);
        for (let c = 0; c < 4; c++) { const q = en(tr, Math.max(0, u - c * 0.012)); ctx.fillStyle = 'rgba(244,246,248,' + (0.9 - c * 0.21) + ')'; ctx.beginPath(); ctx.arc(q.x, q.y, 2 - c * 0.38, 0, 6.2832); ctx.fill(); }
      }
      const latido = quieto ? 0.5 : 0.5 + 0.5 * Math.sin(ts / 420);
      for (const p of puntos) {
        const q = proy(p);
        if (p.tipo === 'rele') {
          ctx.fillStyle = 'rgba(156,195,228,' + (0.14 + 0.12 * latido) + ')'; ctx.beginPath(); ctx.arc(q.x, q.y, 11 + 4 * latido, 0, 6.2832); ctx.fill();
          ctx.fillStyle = '#9CC3E4'; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, 6.2832); ctx.fill();
        } else {
          const verde = entregado && p.lado === 'destino';
          ctx.strokeStyle = verde ? '#6CCBA5' : '#F4F6F8'; ctx.lineWidth = 1.8; ctx.setLineDash([2.6, 2.6]);
          ctx.beginPath(); ctx.arc(q.x, q.y, 7, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = verde ? '#6CCBA5' : 'rgba(244,246,248,.92)'; ctx.beginPath(); ctx.arc(q.x, q.y, 2.8, 0, 6.2832); ctx.fill();
        }
      }
    }
    return {
      pon,
      arranca() { if (!anim) anim = requestAnimationFrame(cuadro); },
      para() { if (anim) cancelAnimationFrame(anim); anim = 0; ultimo = 0; },
    };
  }

  // ---------- la hoja «El viaje del archivo» ----------
  let hoja = null, mapa = null, actual = null, reloj = 0;
  function construye() {
    if (hoja) return hoja;
    hoja = el('div', 'gc-hoja vj-hoja'); hoja.id = 'h-viaje';
    hoja.setAttribute('role', 'dialog'); hoja.setAttribute('aria-modal', 'true'); hoja.setAttribute('aria-labelledby', 'vj-t');
    // textos en español: idioma.js los traduce al añadirse (y al cambiar de idioma)
    hoja.innerHTML = '<div class="vj-caja">'
      + '<header class="vj-cab"><div><p class="vj-k">El viaje del archivo</p><h2 id="vj-t" class="vj-nombre" translate="no"></h2><p class="vj-sub"></p></div>'
      + '<span class="vj-estado"><i></i><b></b></span>'
      + '<button type="button" class="vj-x" aria-label="Cerrar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>'
      + '<div class="vj-centro"><div class="vj-mapa"><canvas aria-hidden="true"></canvas><div class="vj-etq"></div></div>'
      + '<div class="vj-datos">'
      + '<div class="vj-dato"><span class="vj-et">Velocidad</span><small class="vj-tag med">Medido</small><b class="vj-vel">—</b></div>'
      + '<div class="vj-dato"><span class="vj-et vj-et-t">Tiempo restante</span><small class="vj-tag est vj-tag-t">Estimado</small><b class="vj-rest">—</b></div>'
      + '<div class="vj-dato"><span class="vj-et">Latencia con el relé</span><small class="vj-tag med">Medido</small><b class="vj-lat"></b></div>'
      + '<div class="vj-dato"><span class="vj-et">Fragmentos autenticados</span><small class="vj-tag med">Medido</small><b class="vj-frag">—</b></div>'
      + '</div></div>'
      + '<ul class="vj-leyenda"><li class="m"><i></i><span>Conocido o medido</span></li><li class="e"><i></i><span>Estimado</span></li><li class="il"><i></i><span>Trazado ilustrativo</span></li></ul>'
      + '<div class="vj-avance"><div class="vj-barra"><i></i></div><p><b class="vj-pct">0 %</b><span class="vj-conf"></span></p></div>'
      + '<div class="vj-dos"><section class="vj-eventos"><h3><i></i><span>En directo</span></h3><ol></ol></section>'
      + '<section class="vj-prot"><h3><span>Protección</span></h3><ul class="gc-escudo"></ul></section></div>'
      + '<footer class="vj-pie"><p class="vj-nota">El trazado es ilustrativo: internet no permite ver el cable exacto ni los países por los que pasa. Medido: tiempos, velocidad, latencias, relé y la autenticación de cada fragmento.</p>'
      + '<div class="vj-botones"><button type="button" class="boton" id="vj-fondo">Seguir en segundo plano</button><button type="button" class="boton principal" id="vj-comp" hidden>Ver comprobante</button></div></footer>'
      + '</div>';
    document.body.append(hoja);
    mapa = Mapa(hoja.querySelector('canvas'), hoja.querySelector('.vj-etq'));
    hoja.querySelector('.vj-x').addEventListener('click', cierra);
    hoja.querySelector('#vj-fondo').addEventListener('click', cierra);
    hoja.addEventListener('click', (e) => { if (e.target === hoja) cierra(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && actual) cierra(); });
    addEventListener('resize', () => { if (actual) pinta(actual); });
    hoja.querySelector('#vj-comp').addEventListener('click', () => { if (actual && actual.comprobante) muestraComprobante(actual.comprobante); });
    return hoja;
  }
  function abre(v) {
    construye(); actual = v; v.visto = true;
    hoja.querySelector('.vj-eventos ol').dataset.n = '';
    hoja.classList.add('gc-abierta');
    requestAnimationFrame(() => { if (actual === v) { pinta(v); mapa.arranca(); } });
    clearInterval(reloj); reloj = setInterval(() => { if (actual) pinta(actual); }, 500);
    if (raiz.GuardianaViaje.alAbrir) raiz.GuardianaViaje.alAbrir(v);
  }
  function cierra() {
    if (!hoja) return;
    hoja.classList.remove('gc-abierta');
    if (mapa) mapa.para(); clearInterval(reloj); reloj = 0;
    if (actual && raiz.GuardianaViaje.alCerrar) raiz.GuardianaViaje.alCerrar(actual);
    actual = null;
  }
  const abierto = (v) => !!(hoja && actual && (!v || actual === v) && hoja.classList.contains('gc-abierta'));
  function estadoDe(v) {
    if (v.estado === 'fallo') return ['mal', T('No completado')];
    if (v.estado === 'entregado') return ['bien', v.rol === 'envia' ? T('Entregado y verificado') : T('Recibido y verificado')];
    if (v.estado === 'verificando') return ['viaje', T('Comprobando la integridad…')];
    if (v.estado === 'espera') return ['espera', v.rol === 'envia' ? T('Esperando al destinatario') : T('Elige dónde guardarlo')];
    return ['viaje', v.rol === 'envia' ? T('Enviando') : T('Recibiendo')];
  }
  function pinta(v) {
    if (!hoja || actual !== v || !hoja.classList.contains('gc-abierta')) return;
    const q = (s) => hoja.querySelector(s);
    const fin = v.estado === 'entregado' || v.estado === 'fallo';
    q('.vj-nombre').textContent = v.nombre || '';
    const otro = v.rol === 'envia' ? T('Destinatario') : T('Remitente');
    q('.vj-sub').textContent = [bytes(v.tam || 0), v.rol === 'envia' ? T('Lo envías tú') : T('Lo recibes tú'), v.otro ? otro + ': ' + v.otro : ''].filter(Boolean).join(' · ');
    const [cls, txt] = estadoDe(v), es = q('.vj-estado'); es.className = 'vj-estado ' + cls; es.querySelector('b').textContent = txt;
    hoja.classList.toggle('vj-quieta', v.estado !== 'viaje');
    // el mapa: los dos equipos (estimados) y el relé (conocido)
    const datos = D(), r = v.rele || {}, yo = datos.punto(v.paisMio), suyo = datos.punto(v.paisSuyo);
    const nodo = (p, rot, cc) => p && { lat: p.lat, lon: p.lon, tipo: 'equipo', rotulo: rot, sub: [pais(cc), T('estimado')].filter(Boolean).join(' · ') };
    const mio = nodo(yo, T('Tu equipo'), v.paisMio), del = nodo(suyo, otro, v.paisSuyo);
    const rele = Number.isFinite(r.lat) ? { lat: r.lat, lon: r.lon, tipo: 'rele', lado: 'rele', rotulo: T('Relé de GUARDIANA'), sub: [[r.ciudad, pais(r.cc)].filter(Boolean).join(', '), r.prueba ? T('prueba local') : ''].filter(Boolean).join(' · ') } : null;
    const origen = v.rol === 'envia' ? mio : del, destino = v.rol === 'envia' ? del : mio;
    if (origen) origen.lado = 'origen'; if (destino) destino.lado = 'destino';
    const bps = velocidad(v);
    mapa.pon({ origen, rele, destino, flujo: v.estado === 'viaje' ? Math.max(bps || 0, 1) : 0, entregado: v.estado === 'entregado' });
    // el avance (lo confirmado por el equipo del destinatario) y lo que va de camino
    const tam = v.tam || 0, conf = Math.min(tam, v.confirmados || 0), pct = tam ? (conf / tam) * 100 : 0;
    q('.vj-barra i').style.width = pct.toFixed(2) + '%'; q('.vj-barra').classList.toggle('lista', v.estado === 'entregado');
    q('.vj-pct').textContent = num(pct, pct > 0 && pct < 10 ? 1 : 0) + ' %';
    const camino = !fin && v.enCamino > 0 ? ' · ' + bytes(v.enCamino) + ' ' + T('de camino') : '';
    q('.vj-conf').textContent = bytes(conf) + ' / ' + bytes(tam) + ' · ' + (v.rol === 'envia' ? T('confirmado por el equipo del destinatario') : T('recibido y autenticado en tu equipo')) + camino;
    // las cuatro medidas
    q('.vj-vel').textContent = bps ? vel(bps) : v.estado === 'viaje' ? T('Calculando…') : '—';
    q('.vj-et-t').textContent = fin ? T('Duración') : T('Tiempo restante');
    const tg = q('.vj-tag-t'); tg.textContent = fin ? T('Medido') : T('Estimado'); tg.className = 'vj-tag vj-tag-t ' + (fin ? 'med' : 'est');
    const rs = restante(v);
    q('.vj-rest').textContent = fin ? (v.tFin && v.t0 ? dur((v.tFin - v.t0) / 1000) : '—') : rs != null ? dur(rs) : v.estado === 'viaje' ? T('Calculando…') : '—';
    const lm = minima(v.latMia), ls = minima(v.latSuya), lat = q('.vj-lat'); lat.textContent = '';
    const linea = (k, x) => { const s = el('span'); s.append(el('small', null, k), document.createTextNode(x != null ? x + ' ms' : '—')); return s; };
    lat.append(linea(T('Tu equipo'), lm), linea(otro, ls));
    q('.vj-frag').textContent = num(v.verificados || 0, 0) + ' / ' + num(v.trozos || 0, 0);
    // protección
    const ul = q('.vj-prot ul'); ul.textContent = '';
    const fila = (c, b, s) => { const li = el('li', c); li.append(el('i'), el('b', null, b), el('span', null, s)); ul.append(li); };
    fila('gc-ok', T('Encriptación'), cifrado(v.pq));
    fila(v.verificada ? 'gc-ok' : 'gc-aviso', T('Identidad'), v.verificada ? T('Verificada con el número de seguridad.') : T('Sin verificar: comparad el número de seguridad (escudo).'));
    fila('gc-info', T('Relé de GUARDIANA'), (rele && rele.sub ? rele.sub + ' · ' : '') + T('transporta fragmentos encriptados que no puede leer'));
    if (v.estado === 'entregado' && v.coincide != null) fila(v.coincide ? 'gc-ok' : 'gc-alerta', T('Integridad'), v.coincide ? T('La huella SHA-256 coincide en los dos equipos') : T('La huella SHA-256 no coincide'));
    else fila(v.estado === 'fallo' ? 'gc-alerta' : 'gc-ok', T('Integridad'), T('Cada fragmento se autentica al llegar; uno alterado detiene el envío.'));
    if (v.custodia === 'no') fila('gc-info', T('Comprobante de entrega'), T('No disponible: el otro equipo usa una versión anterior de Comunicaciones.'));
    else if (v.comprobante) fila(v.comprobanteValido ? 'gc-ok' : 'gc-aviso', T('Comprobante de entrega'), v.comprobanteValido ? T('Firmado por los dos equipos') : T('Pendiente de la firma del destinatario'));
    else if (v.custodia === 'si') fila('gc-info', T('Comprobante de entrega'), T('Se emitirá al llegar el archivo, firmado por los dos equipos.'));
    // en directo (solo hechos reales, el más reciente arriba)
    const ol = q('.vj-eventos ol'), n = String((v.eventos || []).length);
    if (ol.dataset.n !== n) {
      ol.dataset.n = n; ol.textContent = '';
      for (const e of [...(v.eventos || [])].reverse().slice(0, 40)) { const li = el('li', e.nivel || ''); li.append(el('time', null, hms(e.t)), el('span', null, e.texto)); ol.append(li); }
    }
    q('#vj-comp').hidden = !v.comprobante;
  }
  function evento(v, texto, nivel) {
    v.eventos = v.eventos || []; v.eventos.push({ t: Date.now(), texto, nivel: nivel || '' });
    if (v.eventos.length > 80) v.eventos.shift();
    if (abierto(v)) pinta(v);
  }

  // ---------- la hoja del comprobante ----------
  let hojaComp = null;
  function muestraComprobante(comp) {
    if (!hojaComp) {
      hojaComp = el('div', 'gc-hoja cu-hoja'); hojaComp.id = 'h-custodia';
      hojaComp.setAttribute('role', 'dialog'); hojaComp.setAttribute('aria-modal', 'true'); hojaComp.setAttribute('aria-labelledby', 'cu-t');
      hojaComp.innerHTML = '<div class="cu-caja"><header class="cu-cab"><div><p class="vj-k"><span translate="no">GUARDIANA</span> · <span>Entrega e integridad</span></p><h2 id="cu-t">Comprobante de entrega e integridad</h2></div>'
        + '<button type="button" class="vj-x" aria-label="Cerrar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>'
        + '<div class="cu-cuerpo"></div>'
        + '<footer class="cu-pie"><a class="boton" id="cu-verificar" href="/orbita/comunicaciones/verificar/" target="_blank" rel="noopener">Verificar en guardianagroup.com</a>'
        + '<button type="button" class="boton" id="cu-json">Descargar .json</button><button type="button" class="boton principal" id="cu-pdf">Descargar PDF</button></footer></div>';
      document.body.append(hojaComp);
      const cerrar = () => hojaComp.classList.remove('gc-abierta');
      hojaComp.querySelector('.vj-x').addEventListener('click', cerrar);
      hojaComp.addEventListener('click', (e) => { if (e.target === hojaComp) cerrar(); });
      hojaComp.querySelector('#cu-json').addEventListener('click', () => { if (hojaComp.comp) descarga(hojaComp.comp); });
      hojaComp.querySelector('#cu-pdf').addEventListener('click', () => { if (hojaComp.comp) imprime(hojaComp.comp); });
    }
    hojaComp.comp = comp;
    const firmado = !!(comp.firmas && comp.firmas.emisor && comp.firmas.receptor);
    hojaComp.querySelector('#cu-json').hidden = !firmado; hojaComp.querySelector('#cu-pdf').hidden = !firmado;
    const caja = hojaComp.querySelector('.cu-cuerpo'); caja.textContent = T('Comprobando las firmas…');
    hojaComp.classList.add('gc-abierta');
    verifica(comp).then((res) => { if (hojaComp.comp === comp) return pintaComprobante(caja, comp, res); });
  }

  raiz.GuardianaViaje = { abre, cierra, abierto, pinta, evento, muestra, velocidad, minima, estad, tipoPorContenido, referencia, documento, imprime, preparaImpresion, canon, verifica, verificaFirma, aFirmar, aFirmarB, FORMATO_B, CTX_B, descarga, nombreDescarga, muestraComprobante, pintaComprobante, numeroSeguridad, bytes, vel, dur, pais, b64u, deB64u, hex, agrupa, FORMATO, ESCUDO, AVISO, get actual() { return actual; } };
})(typeof window !== 'undefined' ? window : globalThis);
