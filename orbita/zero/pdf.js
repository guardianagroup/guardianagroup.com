// GUARDIANA · ZERO — informe de cortes en PDF, hecho en el propio navegador: sin librerías, sin servidor, sin enviar nada.
// 26 Oct 2026 (dueño): «cuando le doy a PDF… sale como para imprimir. Eso está mal» → el botón descarga un archivo .pdf.
// Texto de verdad (se puede buscar y copiar) con las fuentes estándar de PDF (Helvetica) en codificación WinAnsi:
// vale para el español, el inglés, el portugués y los demás idiomas de alfabeto latino occidental. Para el resto, la
// página sigue usando la impresión del navegador (ZeroPdf.cabe dice si un texto se puede escribir así).
(function () {
  'use strict';
  const W = 595.28, H = 841.89, M = 40; // A4 en puntos
  const ANSI = { 0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f };
  const ESPACIOS = new Set([0x2009, 0x202f, 0x200a, 0x2007]);
  const byteDe = (c) => (c < 0x80 || (c >= 0xa0 && c <= 0xff) ? c : ANSI[c] || (ESPACIOS.has(c) ? 0x20 : null));
  const cabe = (s) => { for (const ch of String(s)) { const c = ch.codePointAt(0); if (c === 0x200e || c === 0x200f) continue; if (byteDe(c) == null) return false; } return true; };
  // literal de PDF en WinAnsi (lo que no cabe se escribe «?»)
  const lit = (s) => {
    let o = '';
    for (const ch of String(s)) {
      const c = ch.codePointAt(0); if (c === 0x200e || c === 0x200f) continue;
      let b = byteDe(c); if (b == null) b = 0x3f; if (b < 0x20) b = 0x20;
      o += (b === 0x28 || b === 0x29 || b === 0x5c ? '\\' : '') + String.fromCharCode(b);
    }
    return '(' + o + ')';
  };
  // medidas: Arial y Liberation Sans tienen las mismas anchuras que Helvetica
  const cv = document.createElement('canvas').getContext('2d');
  const ancho = (s, tam, negrita) => { cv.font = (negrita ? 'bold ' : '') + '100px Arial, "Liberation Sans", Helvetica, sans-serif'; return (cv.measureText(String(s)).width * tam) / 100; };
  const ajusta = (s, tam, negrita, max) => {
    s = String(s == null ? '' : s); if (ancho(s, tam, negrita) <= max) return s;
    let a = 0, b = s.length;
    while (a < b) { const m = (a + b + 1) >> 1; if (ancho(s.slice(0, m) + '…', tam, negrita) <= max) a = m; else b = m - 1; }
    return s.slice(0, a).trimEnd() + '…';
  };
  // reparte un texto en líneas que caben en «max» puntos (por palabras); como mucho «tope» líneas
  const parte = (s, tam, max, tope) => {
    const ps = String(s == null ? '' : s).split(/\s+/).filter(Boolean); const out = []; let l = '';
    for (const p of ps) { const t = l ? l + ' ' + p : p; if (ancho(t, tam, false) <= max) l = t; else { if (l) out.push(l); l = ancho(p, tam, false) <= max ? p : ajusta(p, tam, false, max); } }
    if (l) out.push(l);
    if (out.length > tope) { const r = out.slice(0, tope); r[tope - 1] = ajusta(r[tope - 1] + ' …', tam, false, max); return r; }
    return out.length ? out : [''];
  };
  const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((x) => x.toFixed(3)).join(' '); };
  const n2 = (x) => (Math.round(x * 100) / 100).toString();

  function documento() {
    const pags = []; let ops = null, y = 0;
    const nueva = () => { ops = []; pags.push(ops); y = M; };
    const texto = (x, yy, s, tam, negrita, color, alinDer) => {
      const w = alinDer ? ancho(s, tam, negrita) : 0;
      ops.push('BT /' + (negrita ? 'F2' : 'F1') + ' ' + n2(tam) + ' Tf ' + rgb(color || '#1d2733') + ' rg ' + n2(x - w) + ' ' + n2(H - yy) + ' Td ' + lit(s) + ' Tj ET');
    };
    const raya = (x1, yy, x2, color, g) => ops.push(rgb(color) + ' RG ' + n2(g || 0.5) + ' w ' + n2(x1) + ' ' + n2(H - yy) + ' m ' + n2(x2) + ' ' + n2(H - yy) + ' l S');
    const caja = (x, yy, w, h, color) => ops.push(rgb(color) + ' rg ' + n2(x) + ' ' + n2(H - yy - h) + ' ' + n2(w) + ' ' + n2(h) + ' re f');
    nueva();
    return {
      pags, texto, raya, caja, nueva,
      get y() { return y; }, set y(v) { y = v; },
      sitio(h) { if (y + h > H - M - 18) { nueva(); return true; } return false; },
    };
  }

  // tabla con cabecera que se repite en cada página; columnas {t, w (proporción), der}
  function tabla(d, cols, filas, T) {
    const util = W - 2 * M, total = cols.reduce((a, c) => a + c.w, 0), xs = []; let x = M;
    for (const c of cols) { xs.push(x); c.px = (c.w / total) * util; x += c.px; }
    const TAM = 7.6, ALTO = 13.5;
    const cabecera = () => {
      d.caja(M, d.y, util, ALTO + 1, '#edf2f6');
      cols.forEach((c, i) => d.texto(c.der ? xs[i] + c.px - 4 : xs[i] + 4, d.y + 9.6, ajusta(T(c.t).toUpperCase(), 6.6, true, c.px - 8), 6.6, true, '#4d6274', c.der));
      d.y += ALTO + 1;
    };
    cabecera();
    const LIN = 9.6;
    for (const f of filas) {
      // columnas con «wrap»: el texto se reparte en varias líneas (hasta 6) en vez de cortarse
      const lineas = cols.map((c, i) => (c.wrap ? parte(f[i], TAM, c.px - 8, 6) : [ajusta(f[i], TAM, false, c.px - 8)]));
      const n = Math.max(1, ...lineas.map((l) => l.length)), alto = ALTO + (n - 1) * LIN;
      if (d.sitio(alto)) cabecera();
      cols.forEach((c, i) => lineas[i].forEach((t, k) => d.texto(c.der ? xs[i] + c.px - 4 : xs[i] + 4, d.y + 9.4 + k * LIN, t, TAM, false, c.rojo ? '#c0503f' : c.ambar && t ? '#9a6b12' : '#1d2733', c.der)));
      d.y += alto; d.raya(M, d.y, M + util, '#e2e8ee', 0.4);
    }
  }

  function serializa(pags, pie) {
    const objs = [];
    const add = (s) => { objs.push(s); return objs.length; };
    const cat = add(''), pagsId = add('');
    const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const kids = [];
    pags.forEach((ops, i) => {
      const extra = pie(i + 1, pags.length);
      const cuerpo = ops.concat(extra).join('\n');
      const c = add('<< /Length ' + cuerpo.length + ' >>\nstream\n' + cuerpo + '\nendstream');
      kids.push(add('<< /Type /Page /Parent ' + pagsId + ' 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /Font << /F1 ' + f1 + ' 0 R /F2 ' + f2 + ' 0 R >> >> /Contents ' + c + ' 0 R >>'));
    });
    objs[cat - 1] = '<< /Type /Catalog /Pages ' + pagsId + ' 0 R >>';
    objs[pagsId - 1] = '<< /Type /Pages /Kids [' + kids.map((k) => k + ' 0 R').join(' ') + '] /Count ' + kids.length + ' >>';
    let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'; const off = [];
    objs.forEach((o, i) => { off.push(out.length); out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
    const xref = out.length;
    out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + off.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
    out += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root ' + cat + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
    const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
    return new Blob([bytes], { type: 'application/pdf' });
  }

  // datos: {titulo, subtitulo, resumen:[[número, etiqueta, rojo?]…], secciones:[{titulo, cols, filas}], pie, archivo}; T traduce
  function descarga(datos, T) {
    T = T || ((s) => s);
    const d = documento();
    d.texto(M, d.y + 9, 'GUARDIANA', 8.5, true, '#1d2733'); d.texto(M + ancho('GUARDIANA ', 8.5, true), d.y + 9, '/ ZERO', 8.5, false, '#7d8f9e');
    d.y += 30; d.texto(M, d.y, datos.titulo, 21, true, '#0f1720');
    d.y += 17; d.texto(M, d.y, ajusta(datos.subtitulo, 9, false, W - 2 * M), 9, false, '#5c6f7f');
    d.y += 18; d.raya(M, d.y, W - M, '#cfd9e2', 0.8);
    const anchoR = (W - 2 * M) / datos.resumen.length;
    datos.resumen.forEach(([n, et, rojo], i) => { const x = M + i * anchoR; d.texto(x, d.y + 30, String(n), 22, true, rojo ? '#c0503f' : '#0f1720'); d.texto(x, d.y + 44, ajusta(et, 8, false, anchoR - 8), 8, false, '#5c6f7f'); });
    d.y += 58;
    for (const s of datos.secciones) {
      if (!s.filas || !s.filas.length) continue;
      d.sitio(70); d.y += 16; d.texto(M, d.y, s.titulo, 12, true, '#0f1720'); d.y += 6;
      if (s.nota) { for (const l of parte(s.nota, 8, W - 2 * M, 4)) { d.y += 10; d.texto(M, d.y, l, 8, false, '#5c6f7f'); } d.y += 4; }
      d.y += 2; tabla(d, s.cols, s.filas, T);
    }
    if (datos.final) { d.sitio(40); d.y += 16; for (const l of parte(datos.final, 8.5, W - 2 * M, 6)) { d.texto(M, d.y, l, 8.5, false, '#2f7a52'); d.y += 11; } }
    const blob = serializa(d.pags, (p, n) => {
      const ops = []; const yy = H - M + 10;
      ops.push(rgb('#cfd9e2') + ' RG 0.5 w ' + n2(M) + ' ' + n2(H - yy + 8) + ' m ' + n2(W - M) + ' ' + n2(H - yy + 8) + ' l S');
      ops.push('BT /F1 7 Tf ' + rgb('#7d8f9e') + ' rg ' + n2(M) + ' ' + n2(H - yy) + ' Td ' + lit(ajusta(datos.pie, 7, false, W - 2 * M - 40)) + ' Tj ET');
      const pn = p + ' / ' + n; ops.push('BT /F1 7 Tf ' + rgb('#7d8f9e') + ' rg ' + n2(W - M - ancho(pn, 7)) + ' ' + n2(H - yy) + ' Td ' + lit(pn) + ' Tj ET');
      return ops;
    });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = datos.archivo || 'ZERO-informe.pdf'; a.rel = 'noopener'; a.style.display = 'none';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return blob;
  }

  window.ZeroPdf = { cabe, descarga };
})();
