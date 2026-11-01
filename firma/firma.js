/* GUARDIANA · Firma de publicaciones (1 Nov 2026). Dueño, 16:21–16:30: «sellar la página web… del máximo nivel posible».
   Aquí el dueño firma cada publicación con su llave de acceso (Face ID en el iPhone, Windows Hello en el PC). La llave
   privada vive en su aparato y no sale nunca de él: ni GitHub ni quien tenga acceso al repositorio puede firmar por él.
   Lo que se firma es el documento de la publicación (sello/publicaciones/<n>.doc.json): sus bytes exactos son el reto.
   La página no envía nada a ningún sitio: la firma se copia y se pega en la conversación con quien publica. */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const PROD = location.hostname === 'guardianagroup.com';
  const RP = PROD ? 'guardianagroup.com' : location.hostname; // en pruebas, «localhost»
  const enc = new TextEncoder();
  const aB64 = (buf) => { const b = new Uint8Array(buf); let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); };
  const aB64u = (buf) => aB64(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const deB64u = (s) => { s = String(s || '').replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const t = atob(s); const b = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i); return b; };
  const deB64 = (s) => deB64u(String(s || '').replace(/\+/g, '-').replace(/\//g, '_'));
  const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
  const sha = (datos) => crypto.subtle.digest('SHA-256', datos);
  const texto = (el, t) => { el.textContent = t; return el; };
  const nuevo = (tag, clase, t) => { const e = document.createElement(tag); if (clase) e.className = clase; if (t != null) e.textContent = t; return e; };
  const fecha = (iso) => { try { return new Date(iso).toLocaleString('es', { dateStyle: 'long', timeStyle: 'short' }); } catch (_) { return iso; } };

  async function trae(ruta, binario) {
    const r = await fetch(ruta, { cache: 'no-store' });
    if (!r.ok) throw new Error(ruta + ': ' + r.status);
    return binario ? new Uint8Array(await r.arrayBuffer()) : r.json();
  }

  // ---------- comprobar una firma aquí mismo, antes de copiarla ----------
  function derARaw(der) {
    // SEQUENCE { INTEGER r, INTEGER s } → r||s de 32 bytes cada uno (lo que pide WebCrypto)
    let i = 2; if (der[1] & 0x80) i = 2 + (der[1] & 0x7f);
    const lee = () => { if (der[i++] !== 0x02) throw new Error('DER'); const n = der[i++]; let v = der.slice(i, i + n); i += n; while (v.length > 32 && v[0] === 0) v = v.slice(1); const o = new Uint8Array(32); o.set(v, 32 - v.length); return o; };
    const r = lee(), s = lee(); const out = new Uint8Array(64); out.set(r, 0); out.set(s, 32); return out;
  }
  async function compruebaAqui(docBytes, f, llave) {
    const cd = deB64u(f.clientDataJSON), ad = deB64u(f.authData);
    const c = JSON.parse(new TextDecoder().decode(cd));
    if (c.type !== 'webauthn.get' || c.origin !== location.origin) return false;
    if (aB64u(await sha(docBytes)) !== c.challenge.replace(/=+$/, '')) return false;
    if (!(ad[32] & 0x01) || !(ad[32] & 0x04)) return false;
    const datos = new Uint8Array(ad.length + 32); datos.set(ad, 0); datos.set(new Uint8Array(await sha(cd)), ad.length);
    const sig = deB64u(f.signature);
    if (llave.alg === -7) {
      const k = await crypto.subtle.importKey('spki', deB64(llave.spki), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, derARaw(sig), datos);
    }
    const k = await crypto.subtle.importKey('spki', deB64(llave.spki), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    return crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, k, sig, datos);
  }

  // ---------- copiar ----------
  function caja(titulo, json, explica) {
    const c = $('#resultado'); c.hidden = false; c.textContent = '';
    c.append(nuevo('h2', null, titulo), nuevo('p', 'explica', explica));
    const t = nuevo('textarea', 'json'); t.readOnly = true; t.value = json; t.rows = 6; c.append(t);
    const b = nuevo('button', 'boton principal', 'Copiar'); b.type = 'button';
    b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(json); texto(b, 'Copiado ✓'); } catch (_) { t.select(); document.execCommand('copy'); texto(b, 'Copiado ✓'); } });
    c.append(b);
    c.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- registrar una llave (una vez por aparato) ----------
  async function registra() {
    const nombre = ($('#nombre').value || '').trim().slice(0, 40) || (/iPhone|iPad/.test(navigator.userAgent) ? 'iPhone' : 'Ordenador');
    try {
      const cred = await navigator.credentials.create({ publicKey: {
        rp: { id: RP, name: 'GUARDIANA' },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'firma-guardiana', displayName: 'GUARDIANA · firma de publicaciones' },
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
        attestation: 'none', timeout: 120000,
      } });
      const r = cred.response;
      const spki = r.getPublicKey && r.getPublicKey();
      if (!spki) throw new Error('Este navegador no da la llave pública: prueba con Safari o Chrome actualizados.');
      const llave = { id: aB64u(cred.rawId), alg: r.getPublicKeyAlgorithm(), spki: aB64(spki), nombre, alta: new Date().toISOString().slice(0, 10) };
      caja('Llave creada', JSON.stringify(llave), 'Copia este texto y pégalo en la conversación con Claude. No es secreto: es la parte pública de tu llave, la que sirve para comprobar tus firmas.');
    } catch (e) {
      aviso(e && e.name === 'NotAllowedError' ? 'Cancelado o sin permiso. Vuelve a intentarlo.' : 'No se pudo crear la llave: ' + (e && e.message));
    }
  }

  // ---------- firmar la publicación pendiente ----------
  let PEND = null;
  async function firma() {
    if (!PEND) return;
    try {
      const reto = new Uint8Array(await sha(PEND.bytes));
      const a = await navigator.credentials.get({ publicKey: {
        challenge: reto, rpId: RP, userVerification: 'required', timeout: 120000,
        allowCredentials: PEND.llaves.map((k) => ({ type: 'public-key', id: deB64u(k.id) })),
      } });
      const f = { seq: PEND.doc.seq, id: aB64u(a.rawId), authData: aB64u(a.response.authenticatorData), clientDataJSON: aB64u(a.response.clientDataJSON), signature: aB64u(a.response.signature) };
      const llave = PEND.llaves.find((k) => k.id === f.id);
      const bien = llave ? await compruebaAqui(PEND.bytes, f, llave) : false;
      if (!bien) { aviso('La firma no se ha podido comprobar aquí. No la copies; avisa a Claude.'); return; }
      caja('Firma lista ✓', JSON.stringify(f), 'Copia este texto y pégalo en la conversación con Claude. Con él, la publicación nº ' + PEND.doc.seq + ' queda sellada.');
    } catch (e) {
      aviso(e && e.name === 'NotAllowedError' ? 'Cancelado. No se ha firmado nada.' : 'No se pudo firmar: ' + (e && e.message));
    }
  }

  function aviso(t) { const a = $('#aviso'); a.hidden = !t; texto(a, t || ''); }

  async function pinta() {
    let llaves = [];
    try { llaves = (await trae('/sello/llaves.json')).llaves || []; } catch (_) {}
    $('#sin-llaves').hidden = llaves.length > 0;
    $('#otra-llave').hidden = llaves.length === 0;
    let p = null;
    try { p = await trae('/sello/pendiente.json'); } catch (_) {}
    const sec = $('#pendiente');
    if (!p || !Number.isInteger(p.seq)) { sec.hidden = true; $('#nada').hidden = false; return; }
    const bytes = await trae(`/sello/publicaciones/${p.seq}.doc.json`, true);
    const doc = JSON.parse(new TextDecoder().decode(bytes));
    PEND = { bytes, doc, llaves };
    sec.hidden = false; $('#nada').hidden = true;
    texto($('#p-num'), 'Publicación nº ' + doc.seq);
    texto($('#p-nota'), doc.nota || '');
    texto($('#p-fecha'), fecha(doc.fecha));
    texto($('#p-caduca'), fecha(doc.expira));
    texto($('#p-servidores'), doc.servidores ? 'Sí: también los servidores' : 'No: solo la web');
    // el manifiesto: que su huella sea la del documento, y qué cambia respecto a la publicación anterior
    const lista = $('#p-cambios'); lista.textContent = '';
    try {
      const man = await trae(`/sello/manifiestos/${doc.seq}.json`, true);
      const ok = hex(await sha(man)) === doc.manifiesto;
      texto($('#p-man'), ok ? '✓ El manifiesto es el de este documento (' + doc.archivos + ' archivos)' : '✗ El manifiesto NO es el de este documento: no firmes');
      $('#p-man').className = ok ? 'bien' : 'mal';
      $('#firmar').disabled = !ok || !llaves.length;
      const ahora = JSON.parse(new TextDecoder().decode(man)).archivos || {};
      let antes = {};
      if (doc.base) { try { antes = JSON.parse(new TextDecoder().decode(await trae(`/sello/manifiestos/${doc.base}.json`, true))).archivos || {}; } catch (_) {} }
      const cambios = [];
      for (const k of Object.keys(ahora)) if (antes[k] !== ahora[k]) cambios.push((antes[k] ? '✎ ' : '+ ') + k);
      for (const k of Object.keys(antes)) if (!(k in ahora)) cambios.push('− ' + k);
      texto($('#p-ncambios'), doc.base ? cambios.length + ' archivos cambian respecto a la nº ' + doc.base : 'Primera publicación sellada: entra todo');
      for (const c of (doc.base ? cambios : []).slice(0, 60)) lista.append(nuevo('li', null, c));
      if (doc.base && cambios.length > 60) lista.append(nuevo('li', 'mas', '… y ' + (cambios.length - 60) + ' más'));
    } catch (e) { texto($('#p-man'), '✗ No se pudo leer el manifiesto: no firmes'); $('#p-man').className = 'mal'; $('#firmar').disabled = true; }
  }

  addEventListener('DOMContentLoaded', () => {
    if (!window.PublicKeyCredential) aviso('Este navegador no admite llaves de acceso. Ábrela en Safari (iPhone) o en Chrome o Edge (PC).');
    $('#crear').addEventListener('click', registra);
    $('#crear2').addEventListener('click', () => { $('#sin-llaves').hidden = false; $('#otra-llave').hidden = true; $('#nombre').focus(); });
    $('#firmar').addEventListener('click', firma);
    pinta().catch((e) => aviso('No se pudo leer el sello: ' + e.message));
  });
})();
