// GUARDIANA · Comunicaciones · verificar un comprobante de entrega e integridad (27 Oct 2026). Lee el comprobante elegido,
// comprueba las dos firmas y las huellas de identidad (viaje.js) y, si se elige el archivo, calcula su SHA-256 por partes
// (sha256.js) y lo compara. Nada sale del navegador.
'use strict';
(() => {
  const V = window.GuardianaViaje, T = (s) => (window.GuardianaIdioma ? GuardianaIdioma.t(s) : s), $ = (s) => document.querySelector(s);
  let comp = null;
  const error = (txt) => { const e = $('#error'); e.textContent = txt || ''; e.hidden = !txt; };
  // el PDF es la versión para leer e imprimir: no lleva las firmas completas, así que se explica qué archivo hace falta
  const esPdf = async (f) => { if (/\.pdf$/i.test(f.name || '') || f.type === 'application/pdf') return true; try { return new TextDecoder().decode(new Uint8Array(await f.slice(0, 5).arrayBuffer())) === '%PDF-'; } catch (_) { return false; } };
  async function cargaComprobante(f) {
    error('');
    if (!f) return;
    if (await esPdf(f)) { $('#resultado').hidden = true; $('#zona-comp').hidden = false; return error(T('Ese es el PDF del comprobante: sirve para leerlo, guardarlo o imprimirlo, pero no lleva las firmas completas. Para verificarlo, usa el archivo .json del mismo comprobante: en el chat, abre «Ver comprobante» y pulsa «Descargar .json».')); }
    let j = null;
    try { if (f.size <= 256 * 1024) j = JSON.parse(await f.text()); } catch (_) { j = null; }
    return muestra(j);
  }
  // los sellos del veredicto: ✓ válido, ! pendiente o el comprobante en lugar del archivo, ✕ no válido o no coincide
  const SELLO = { bien: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>', aviso: '<svg viewBox="0 0 24 24"><path d="M12 6.5v7"/><path d="M12 17.6v.2"/></svg>', mal: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>' };
  const sello = (clase) => { const x = document.createElement('span'); x.className = 'vf-sello'; x.setAttribute('aria-hidden', 'true'); x.innerHTML = SELLO[clase]; return x; };
  const elArchivo = () => (comp && comp.registro && comp.registro.archivo) || {};
  const nombreTam = (nombre, n) => '«' + (nombre || '—') + '» · ' + (Number.isFinite(n) ? V.bytes(n) : '—');
  async function muestra(j) {
    // el comprobante normal y el de la sesión blindada (doble firma ECDSA P-384 + ML-DSA-87)
    if (!j || (j.formato !== V.FORMATO && j.formato !== V.FORMATO_B) || !j.registro) { $('#resultado').hidden = true; $('#zona-comp').hidden = false; return error(T('Ese archivo no es un comprobante de entrega e integridad de GUARDIANA.')); }
    comp = j;
    const res = await V.verifica(j);
    await V.pintaComprobante($('#cuerpo'), j, res);
    // 28 Oct 2026 (dueño, 12:00): el veredicto, arriba y grande, con su sello; los textos son los de la tarjeta
    const clase = res.valido ? 'bien' : res.pendiente ? 'aviso' : 'mal', ve = $('#veredicto'), est = $('#cuerpo .cu-estado');
    ve.className = 'vf-veredicto ' + clase; ve.querySelector('.vf-sello').innerHTML = SELLO[clase];
    $('#ver-titulo').textContent = res.valido ? T('Comprobante válido') : ((est && est.querySelector('b')) || {}).textContent || T('Comprobante no válido');
    $('#ver-texto').textContent = ((est && est.querySelector(':scope > div > span')) || {}).textContent || '';
    const a = elArchivo(); $('#ver-archivo').textContent = a.nombre ? nombreTam(a.nombre, a.bytes) : '';
    $('#esperado').textContent = a.nombre ? nombreTam(a.nombre, a.bytes) : '';
    $('#zona-comp').hidden = true;
    $('#resultado').hidden = false;
    $('#zona-arch').hidden = !(res.valido || res.pendiente);
    $('#acciones').hidden = !res.valido;
    $('#arch-res').hidden = true;
    const y = $('#resultado').getBoundingClientRect().top + scrollY - 76;
    scrollTo({ top: Math.max(0, y), behavior: 'auto' });
  }
  function resultadoArchivo(clase, titulo, detalle, mono) {
    const res = $('#arch-res'); res.className = 'vf-arch-res ' + clase; res.textContent = '';
    const b = document.createElement('b'); b.textContent = titulo; res.append(sello(clase), b);
    if (detalle) { const d = document.createElement('span'); d.className = 'vf-det'; d.textContent = detalle; res.append(d); }
    if (mono) { const s = document.createElement('span'); s.setAttribute('translate', 'no'); s.textContent = mono; res.append(s); }
    res.hidden = false; res.scrollIntoView({ block: 'nearest' });
  }
  // ¿elegió el propio comprobante (el .json o su PDF) en lugar del archivo enviado? (dueño, 12:00: le pasó al probarlo)
  async function esComprobante(f, a) {
    if (/\.json$/i.test(f.name || '') && f.size <= 256 * 1024) { try { const j = JSON.parse(await f.text()); if (j && j.registro && (j.formato === V.FORMATO || j.formato === V.FORMATO_B)) return true; } catch (_) {} }
    return !/\.pdf$/i.test(a.nombre || '') && (await esPdf(f));
  }
  async function compruebaArchivo(f) {
    if (!f || !comp) return;
    const a = elArchivo(), barra = $('#arch-barra'), i = barra.querySelector('i');
    $('#arch-res').hidden = true; error('');
    if (await esComprobante(f, a)) return resultadoArchivo('aviso', T('Ese es el comprobante, no el archivo que se envió'), T('Elige el archivo que se envió:') + ' «' + (a.nombre || '—') + '»');
    // con otro tamaño ya no puede ser el mismo: se dice sin calcular nada
    if (Number.isFinite(a.bytes) && f.size !== a.bytes) return resultadoArchivo('mal', T('No es el mismo archivo'), T('Tiene otro tamaño: no es el archivo que se envió.'), nombreTam(f.name, f.size) + '  →  ' + T('Esperado') + ': ' + nombreTam(a.nombre, a.bytes));
    barra.hidden = false; i.style.width = '0%'; $('#elige-arch').disabled = true;
    try {
      const h = GuardianaSHA256.crea(), PASO = 4 * 1024 * 1024;
      for (let o = 0; o < f.size; o += PASO) {
        h.pon(new Uint8Array(await f.slice(o, o + PASO).arrayBuffer()));
        i.style.width = ((Math.min(f.size, o + PASO) / f.size) * 100).toFixed(1) + '%';
        await new Promise((r) => setTimeout(r, 0));
      }
      const sha = GuardianaSHA256.hex(h.cierra()), ok = sha === a.sha256 && f.size === a.bytes;
      if (ok) resultadoArchivo('bien', T('Es exactamente el archivo que se envió'), null, 'SHA-256 ' + sha);
      else resultadoArchivo('mal', T('No es el mismo archivo'), T('Tiene el mismo tamaño, pero el contenido es distinto: se ha modificado.'), 'SHA-256 ' + sha);
    } catch (_) { error(T('No se ha podido leer el archivo.')); }
    finally { barra.hidden = true; $('#elige-arch').disabled = false; }
  }
  const fc = $('#f-comp'), fa = $('#f-arch'), zona = $('#zona-comp');
  $('#pdf').addEventListener('click', () => { if (comp) V.imprime(comp); });
  $('#elige-comp').addEventListener('click', () => fc.click());
  $('#otro').addEventListener('click', () => fc.click());
  fc.addEventListener('change', () => { const f = fc.files[0]; fc.value = ''; cargaComprobante(f); });
  $('#elige-arch').addEventListener('click', () => fa.click());
  fa.addEventListener('change', () => { const f = fa.files[0]; fa.value = ''; compruebaArchivo(f); });
  for (const ev of ['dragenter', 'dragover']) zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add('encima'); });
  for (const ev of ['dragleave', 'drop']) zona.addEventListener(ev, () => zona.classList.remove('encima'));
  zona.addEventListener('drop', (e) => { e.preventDefault(); const f = e.dataTransfer && e.dataTransfer.files[0]; cargaComprobante(f); });
  // soltar un archivo fuera de la zona no debe abrirlo en la pestaña
  addEventListener('dragover', (e) => e.preventDefault()); addEventListener('drop', (e) => e.preventDefault());
  // desde el chat, «Verificar en guardianagroup.com» trae el comprobante en el fragmento (#c=…): se comprueba al abrir y
  // el fragmento se quita de la dirección
  if (/^#c=[A-Za-z0-9_-]+$/.test(location.hash)) {
    let j = null; try { j = JSON.parse(new TextDecoder().decode(V.deB64u(location.hash.slice(3)))); } catch (_) { j = null; }
    history.replaceState(null, '', location.pathname + location.search);
    const empieza = () => muestra(j);
    if (document.readyState === 'complete') empieza(); else addEventListener('load', empieza);
  }
})();
