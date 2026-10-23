/* GUARDIANA · Órbita · «Descargar» (owner, 23 Oct 2026, 15:50: «todas las métricas, todo lo que vemos en pantalla, tiene
   que poder ser descargable… para que la persona pueda… reclamar sus derechos sobre sus datos»; approved 15:58).
   One small menu on every panel that shows measurements: a PDF report to read or to present, and the data as CSV (opens in
   any spreadsheet) and JSON (to check it). Every file says when and how it was measured, which version of GUARDIANA made
   it, and carries a SHA-256 fingerprint of its data: if anyone changes a single value, the fingerprint no longer matches.
   Everything is made in this browser and sent nowhere.
   The PDF is real text (selectable and searchable, a few kilobytes), written by the small writer below with the PDF
   standard fonts (Helvetica) in WinAnsi encoding; characters that encoding lacks become «?» rather than breaking the file. */
(function () {
  'use strict';
  const T = (s) => (window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s);
  const loc = () => (window.GuardianaIdioma ? window.GuardianaIdioma.locale : undefined);
  // the version is the one this script was loaded with (every file of the page shares it)
  const VERSION = (() => { try { const s = document.currentScript || document.querySelector('script[src*="descargas.js"]'); const m = s && s.src.match(/[?&]v=([^&#]+)/); return m ? m[1] : ''; } catch (_) { return ''; } })();

  // ---------- the document every panel hands over ----------
  // { archivo, titulo, subtitulo?, lineas: [texto], totales: [[clave, valor]], columnas: [..], filas: [[..]], notas: [texto], datos }
  // `datos` is what the JSON carries and what the fingerprint covers (the rows are derived from it).
  async function huella(datos) {
    try {
      const b = new TextEncoder().encode(JSON.stringify(datos));
      const h = await crypto.subtle.digest('SHA-256', b);
      return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, '0')).join('');
    } catch (_) { return ''; }
  }
  function sello() {
    const d = new Date();
    let local = d.toISOString();
    try { local = d.toLocaleString(loc(), { dateStyle: 'long', timeStyle: 'short' }); } catch (_) {}
    return { iso: d.toISOString(), local };
  }
  function nombre(base, ext) {
    const limpio = String(base || 'GUARDIANA').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
    return limpio + '-' + new Date().toISOString().slice(0, 10) + '.' + ext;
  }
  function baja(blob, archivo) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = archivo; a.rel = 'noopener';
    document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 60000);
  }

  // ---------- CSV and JSON ----------
  function aCSV(doc, h, s) {
    const c = (v) => { const t = v == null ? '' : String(v); return /[",\n;]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
    const out = [];
    out.push([doc.titulo].map(c).join(','));
    for (const l of doc.lineas || []) out.push(c(l));
    out.push(c(T('Generado en tu navegador el') + ' ' + s.local + ' · GUARDIANA ' + VERSION));
    out.push(c(T('Huella SHA-256 de los datos') + ': ' + h));
    out.push('');
    out.push(doc.columnas.map(c).join(','));
    for (const f of doc.filas) out.push(f.map(c).join(','));
    // a byte-order mark so spreadsheets open the accents right
    return new Blob(['﻿' + out.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
  }
  function aJSON(doc, h, s) {
    const o = {
      titulo: doc.titulo, generado: s.iso, version_guardiana: VERSION, lineas: doc.lineas || [], datos: doc.datos,
      huella_sha256: h, como_comprobar: 'SHA-256 de JSON.stringify(datos), sin espacios: si coincide con huella_sha256, nadie ha cambiado los datos.',
    };
    return new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' });
  }

  // ---------- the PDF: text, A4, Helvetica ----------
  const ANCHO = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
  const W1252 = { 0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f };
  const limpia = (t) => String(t == null ? '' : t).replace(/→/g, '->').replace(/[  ]/g, ' ');
  function bytes1252(t) {
    const out = [];
    for (const ch of limpia(t)) { const c = ch.codePointAt(0); out.push(c < 0x80 || (c >= 0xa0 && c <= 0xff) ? c : (W1252[c] || 0x3f)); }
    return out;
  }
  function anchoTexto(t, cuerpo, negrita) {
    let w = 0;
    for (const ch of limpia(t)) {
      const base = ch.normalize('NFD')[0], c = base.codePointAt(0);
      w += c >= 32 && c <= 126 ? ANCHO[c - 32] : 556;
    }
    return w / 1000 * cuerpo * (negrita ? 1.06 : 1);
  }
  function parte(t, max, cuerpo, negrita) {
    const palabras = limpia(t).split(/\s+/).filter(Boolean), lineas = [];
    let l = '';
    for (const p of palabras) {
      const prueba = l ? l + ' ' + p : p;
      if (anchoTexto(prueba, cuerpo, negrita) <= max || !l) l = prueba;
      else { lineas.push(l); l = p; }
    }
    if (l) lineas.push(l);
    // a single word wider than the column is cut to fit
    return lineas.flatMap((x) => { if (anchoTexto(x, cuerpo, negrita) <= max) return [x]; const r = []; let s = ''; for (const ch of x) { if (anchoTexto(s + ch, cuerpo, negrita) > max) { r.push(s); s = ch; } else s += ch; } if (s) r.push(s); return r; });
  }
  const hex = (t) => '<' + bytes1252(t).map((b) => b.toString(16).padStart(2, '0')).join('') + '>';
  function aPDF(doc, h, s) {
    const PW = 595.28, PH = 841.89, M = 48, ANCHO_UTIL = PW - 2 * M, PIE = 36;
    const paginas = [];
    let ops = [], y = PH - M;
    const nueva = () => { ops = []; paginas.push(ops); y = PH - M; };
    const color = (r, g, b) => ops.push((r / 255).toFixed(3) + ' ' + (g / 255).toFixed(3) + ' ' + (b / 255).toFixed(3) + ' rg');
    const texto = (t, x, yy, cuerpo, negrita) => ops.push('BT /' + (negrita ? 'F2' : 'F1') + ' ' + cuerpo + ' Tf ' + x.toFixed(2) + ' ' + yy.toFixed(2) + ' Td ' + hex(t) + ' Tj ET');
    const linea = (x1, y1, x2, y2) => ops.push('0.75 0.80 0.86 RG 0.5 w ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' m ' + x2.toFixed(2) + ' ' + y2.toFixed(2) + ' l S');
    const sitio = (alto) => { if (y - alto < M + PIE) nueva(); };
    const parrafo = (t, cuerpo, negrita, rgb, despues) => {
      const ls = parte(t, ANCHO_UTIL, cuerpo, negrita);
      for (const l of ls) { sitio(cuerpo * 1.35); color(...rgb); texto(l, M, y - cuerpo, cuerpo, negrita); y -= cuerpo * 1.35; }
      y -= despues || 0;
    };
    nueva();
    parrafo('GUARDIANA', 9, true, [90, 120, 150], 4);
    parrafo(doc.titulo, 18, true, [12, 16, 22], 4);
    if (doc.subtitulo) parrafo(doc.subtitulo, 11, false, [70, 80, 92], 6);
    for (const l of doc.lineas || []) parrafo(l, 9.5, false, [45, 52, 60], 3);
    parrafo(T('Generado en tu navegador el') + ' ' + s.local + ' · GUARDIANA ' + VERSION + ' · ' + T('Nada se ha enviado a ningún sitio.'), 8.5, false, [95, 105, 118], 8);
    if (doc.totales && doc.totales.length) {
      sitio(30);
      const col = ANCHO_UTIL / doc.totales.length;
      doc.totales.forEach(([k, v], i) => { color(12, 16, 22); texto(String(v), M + i * col, y - 18, 18, true); color(95, 105, 118); texto(k, M + i * col, y - 30, 8, false); });
      y -= 42;
    }
    // the table: the widths follow how much each column holds
    const nc = doc.columnas.length;
    const peso = doc.columnas.map((c, i) => Math.max(anchoTexto(c, 8, true), ...doc.filas.slice(0, 200).map((f) => Math.min(anchoTexto(f[i], 8), 220))));
    const suma = peso.reduce((a, b) => a + b, 0) || 1;
    const anchos = peso.map((p) => Math.max(40, p / suma * ANCHO_UTIL));
    const k = ANCHO_UTIL / anchos.reduce((a, b) => a + b, 0); for (let i = 0; i < nc; i++) anchos[i] *= k;
    const cabecera = () => { sitio(20); let x = M; doc.columnas.forEach((c, i) => { color(90, 120, 150); texto(c.toUpperCase(), x, y - 9, 7, true); x += anchos[i]; }); y -= 14; linea(M, y, PW - M, y); y -= 4; };
    cabecera();
    for (const f of doc.filas) {
      const celdas = f.map((v, i) => parte(v, anchos[i] - 6, 8, false));
      const alto = Math.max(...celdas.map((c) => c.length)) * 10.4 + 5;
      if (y - alto < M + PIE) { nueva(); cabecera(); }
      let x = M;
      celdas.forEach((c, i) => { c.forEach((l, j) => { color(30, 36, 44); texto(l, x, y - 9 - j * 10.4, 8, i === 0); }); x += anchos[i]; });
      y -= alto; linea(M, y + 2, PW - M, y + 2);
    }
    y -= 8;
    for (const n of doc.notas || []) parrafo(n, 8.5, false, [70, 80, 92], 3);
    parrafo(T('Huella SHA-256 de los datos') + ': ' + h, 7.5, false, [95, 105, 118], 2);
    parrafo(T('Si alguien cambia un solo dato de este archivo, la huella deja de coincidir.'), 7.5, false, [95, 105, 118], 0);
    // footers, once the page count is known
    paginas.forEach((p, i) => { p.push('0.373 0.412 0.463 rg'); p.push('BT /F1 7.5 Tf ' + M + ' ' + (M - 14) + ' Td ' + hex('GUARDIANA · guardianagroup.com · ' + T('página {n} de {m}').replace('{n}', i + 1).replace('{m}', paginas.length)) + ' Tj ET'); });
    // the file
    const enc = new TextEncoder(), partes = [], ofs = []; let pos = 0;
    const pon = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; partes.push(b); pos += b.length; };
    const obj = (id, cuerpo) => { ofs[id] = pos; pon(id + ' 0 obj\n'); pon(cuerpo); pon('\nendobj\n'); };
    const n = paginas.length, F1 = 3, F2 = 4, base = 5;
    pon('%PDF-1.4\n%âãÏÓ\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [' + paginas.map((_, i) => (base + 2 * i) + ' 0 R').join(' ') + '] /Count ' + n + ' >>');
    obj(F1, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    obj(F2, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    paginas.forEach((p, i) => {
      const flujo = p.join('\n'), Pg = base + 2 * i, Cn = base + 2 * i + 1;
      obj(Pg, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /Font << /F1 ' + F1 + ' 0 R /F2 ' + F2 + ' 0 R >> >> /Contents ' + Cn + ' 0 R >>');
      obj(Cn, '<< /Length ' + enc.encode(flujo).length + ' >>\nstream\n' + flujo + '\nendstream');
    });
    const total = base + 2 * n, xref = pos;
    pon('xref\n0 ' + total + '\n0000000000 65535 f \n');
    for (let i = 1; i < total; i++) pon(String(ofs[i]).padStart(10, '0') + ' 00000 n \n');
    pon('trailer\n<< /Size ' + total + ' /Root 1 0 R /Info << /Title ' + hex(doc.titulo) + ' /Producer (GUARDIANA) >> >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(partes, { type: 'application/pdf' });
  }

  async function descarga(tipo, obtener) {
    const doc = obtener(); if (!doc) return;
    const s = sello(), h = await huella(doc.datos);
    if (tipo === 'pdf') baja(aPDF(doc, h, s), nombre(doc.archivo, 'pdf'));
    else if (tipo === 'csv') baja(aCSV(doc, h, s), nombre(doc.archivo, 'csv'));
    else baja(aJSON(doc, h, s), nombre(doc.archivo, 'json'));
  }

  // ---------- the button and its little menu ----------
  const FLECHA = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2.5v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10"/></svg>';
  let abierto = null;
  function cierraMenu() { if (abierto) { if (abierto.__de) abierto.__de.setAttribute('aria-expanded', 'false'); abierto.remove(); abierto = null; } }
  document.addEventListener('pointerdown', (e) => { if (abierto && !abierto.contains(e.target) && !e.target.closest('.descargar')) cierraMenu(); }, true);
  // Escape closes only the menu: the panel under it (registered later, also on keydown) must not close as well
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierto) { const de = abierto.__de; e.preventDefault(); e.stopImmediatePropagation(); cierraMenu(); if (de) de.focus({ preventScroll: true }); } }, true);
  function boton(obtener, clase) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'descargar' + (clase ? ' ' + clase : '');
    b.innerHTML = FLECHA + '<span></span>'; const sp = b.querySelector('span'); sp.textContent = T('Descargar'); sp.dataset.es = 'Descargar';
    b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (abierto) { const era = abierto.__de === b; cierraMenu(); if (era) return; }
      const m = document.createElement('div'); m.className = 'descargar-menu'; m.setAttribute('role', 'menu'); m.__de = b;
      [['pdf', 'Informe (PDF)', 'Para leerlo o presentarlo'], ['csv', 'Datos (CSV)', 'Para una hoja de cálculo'], ['json', 'Datos (JSON)', 'Para comprobarlo']].forEach(([tipo, n, d]) => {
        const o = document.createElement('button'); o.type = 'button'; o.setAttribute('role', 'menuitem');
        const bn = document.createElement('b'); bn.textContent = T(n); const sm = document.createElement('small'); sm.textContent = T(d);
        o.append(bn, sm);
        o.addEventListener('click', async () => { o.disabled = true; try { await descarga(tipo, obtener); } finally { cierraMenu(); } });
        m.append(o);
      });
      const pie = document.createElement('p'); pie.textContent = T('Se hace en tu navegador: no se envía nada.'); m.append(pie);
      document.body.append(m); abierto = m; b.setAttribute('aria-expanded', 'true');
      const r = b.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight;
      let x = Math.min(innerWidth - mw - 12, Math.max(12, r.left)), yy = r.bottom + 6;
      if (yy + mh > innerHeight - 12) yy = Math.max(12, r.top - mh - 6);
      m.style.left = x + 'px'; m.style.top = yy + 'px';
      const pri = m.querySelector('button'); if (pri) pri.focus({ preventScroll: true });
    });
    return b;
  }
  addEventListener('guardiana-idioma', () => document.querySelectorAll('.descargar span[data-es]').forEach((s) => { s.textContent = T(s.dataset.es); }));
  window.GuardianaDescargas = { boton, descarga, cierraMenu };
})();
