// GUARDIANA · Comunicaciones · verificar un comprobante de custodia digital (27 Oct 2026). Lee el comprobante elegido,
// comprueba las dos firmas y las huellas de identidad (viaje.js) y, si se elige el archivo, calcula su SHA-256 por partes
// (sha256.js) y lo compara. Nada sale del navegador.
'use strict';
(() => {
  const V = window.GuardianaViaje, T = (s) => (window.GuardianaIdioma ? GuardianaIdioma.t(s) : s), $ = (s) => document.querySelector(s);
  let comp = null;
  const error = (txt) => { const e = $('#error'); e.textContent = txt || ''; e.hidden = !txt; };
  async function cargaComprobante(f) {
    error('');
    if (!f) return;
    let j = null;
    try { if (f.size <= 256 * 1024) j = JSON.parse(await f.text()); } catch (_) { j = null; }
    if (!j || j.formato !== V.FORMATO || !j.registro) { $('#resultado').hidden = true; return error(T('Ese archivo no es un comprobante de custodia de GUARDIANA.')); }
    comp = j;
    const res = await V.verifica(j);
    await V.pintaComprobante($('#cuerpo'), j, res);
    $('#resultado').hidden = false;
    $('#zona-arch').hidden = !(res.valido || res.pendiente);
    $('#acciones').hidden = !res.valido;
    $('#arch-res').hidden = true;
    $('#resultado').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  async function compruebaArchivo(f) {
    if (!f || !comp) return;
    const a = comp.registro.archivo || {}, res = $('#arch-res'), barra = $('#arch-barra'), i = barra.querySelector('i');
    res.hidden = true; barra.hidden = false; i.style.width = '0%'; $('#elige-arch').disabled = true;
    try {
      const h = GuardianaSHA256.crea(), PASO = 4 * 1024 * 1024;
      for (let o = 0; o < f.size; o += PASO) {
        h.pon(new Uint8Array(await f.slice(o, o + PASO).arrayBuffer()));
        i.style.width = ((Math.min(f.size, o + PASO) / f.size) * 100).toFixed(1) + '%';
        await new Promise((r) => setTimeout(r, 0));
      }
      const sha = GuardianaSHA256.hex(h.cierra()), ok = sha === a.sha256 && f.size === a.bytes;
      res.className = 'vf-arch-res ' + (ok ? 'bien' : 'mal'); res.textContent = '';
      const b = document.createElement('b'); b.textContent = ok ? T('El archivo coincide con el comprobante: es exactamente el que se envió.') : T('El archivo no coincide con el comprobante: no es el que se envió o se ha modificado.');
      const s = document.createElement('span'); s.setAttribute('translate', 'no'); s.textContent = 'SHA-256 ' + sha;
      res.append(b, s); res.hidden = false;
    } catch (_) { error(T('No se ha podido leer el archivo.')); }
    finally { barra.hidden = true; $('#elige-arch').disabled = false; }
  }
  const fc = $('#f-comp'), fa = $('#f-arch'), zona = $('#zona-comp');
  $('#pdf').addEventListener('click', () => { if (comp) V.imprime(comp); });
  $('#elige-comp').addEventListener('click', () => fc.click());
  fc.addEventListener('change', () => { const f = fc.files[0]; fc.value = ''; cargaComprobante(f); });
  $('#elige-arch').addEventListener('click', () => fa.click());
  fa.addEventListener('change', () => { const f = fa.files[0]; fa.value = ''; compruebaArchivo(f); });
  for (const ev of ['dragenter', 'dragover']) zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add('encima'); });
  for (const ev of ['dragleave', 'drop']) zona.addEventListener(ev, () => zona.classList.remove('encima'));
  zona.addEventListener('drop', (e) => { e.preventDefault(); const f = e.dataTransfer && e.dataTransfer.files[0]; cargaComprobante(f); });
  // soltar un archivo fuera de la zona no debe abrirlo en la pestaña
  addEventListener('dragover', (e) => e.preventDefault()); addEventListener('drop', (e) => e.preventDefault());
})();
