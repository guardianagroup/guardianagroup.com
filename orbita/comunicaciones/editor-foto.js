// GUARDIANA Comunicaciones · editor de fotos (dueño, 15 nov 2026, 17:12: «cuando uno envía la foto, o pueda tocar la foto que le
// han enviado, pueda escribir encima o enviar la foto con el texto abajo, como hacen otras aplicaciones de mensajería, tipo WhatsApp»).
//
// Pantalla completa, como en las apps de mensajería: la foto grande; arriba «Texto» (Aa), «Dibujar», «Tapar» (solo en el chat blindado,
// como antes) y «Deshacer»; abajo el comentario y «Enviar». Con varias fotos, una tira para pasar de una a otra, cada una con lo suyo.
// Un vídeo se ve y lleva su comentario, sin herramientas.
// Lo escrito, lo dibujado y lo tapado se funden en la foto al enviarla: una foto nueva, JPEG, sin datos ocultos (como la de «Tapar»);
// si no se toca, sale la de siempre. El comentario va aparte, encriptado con el anuncio del archivo, y se ve debajo de la foto.
// Todo pasa en este equipo: nada sale hasta pulsar «Enviar».
//
// Uso: GuardianaEditorFoto.abre({ archivos, modo: 'envio' | 'listo', tapar, textoListo, alEnviar(files), alListo(file), alCancelar() })
//   - «envio»: comentario y «Enviar»; alEnviar recibe los archivos (cada uno con su comentario en f.__pie).
//   - «listo»: una foto, sin comentario, y «Listo» (o textoListo); alListo recibe la foto editada.
(() => {
  'use strict';
  const T = (s) => (window.GuardianaIdioma ? GuardianaIdioma.t(s) : s);
  const $ = (s) => document.querySelector(s);
  // la paleta de GUARDIANA: blanco, negro, azul acero, verde, ámbar y coral
  const COLORES = [['#F4F6F8', 'Blanco'], ['#06080C', 'Negro'], ['#9CC3E4', 'Azul'], ['#5CC98A', 'Verde'], ['#F0C77F', 'Ámbar'], ['#E07A6C', 'Coral']];
  const FUENTE = "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  const LADO_MAX = 2560;   // la foto editada, como mucho 2560 px por su lado largo (como «Tapar»)
  const TEXTO = 0.085;     // el tamaño del texto, sobre el lado corto de la foto
  const TRAZO = 0.012;     // el grosor del trazo, sobre el lado corto
  const TAPA = 0.075;      // el radio del pincel de «Tapar», sobre el lado corto
  const BLOQUES = 36;      // el mosaico: unos 36 bloques en el lado largo de la foto final, nunca de menos de 14 px
  const PIE_MAX = 1024, TEXTO_MAX = 300;
  const editable = (f) => !!f && /^image\/(jpeg|png|webp|bmp|avif)$/i.test(f.type || '') && f.size <= 50 * 1024 * 1024;
  const admite = (f) => !!f && ((/^image\//.test(f.type || '') && f.size <= 50 * 1024 * 1024) || /^video\//.test(f.type || ''));
  const luz = (hex) => { const n = parseInt(String(hex).slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  const limita = (x, a, b) => Math.max(a, Math.min(b, x));
  const fino = () => { try { return matchMedia('(pointer: fine)').matches; } catch (_) { return false; } };
  let E = null, iniciado = false, rafPinta = 0;

  // ---------- abrir y cerrar ----------
  async function abre(opc) {
    if (E) cierra();
    const fe = $('#fe'); if (!fe) return false;
    inicia();
    const items = (opc.archivos || []).filter(Boolean).map((f) => ({
      f, url: URL.createObjectURL(f), tipo: editable(f) ? 'foto' : /^image\//.test(f.type || '') ? 'imagen' : /^video\//.test(f.type || '') ? 'video' : 'archivo',
      acciones: [], textos: [], hist: [], pie: typeof f.__pie === 'string' ? f.__pie : '', w: 0, h: 0,
    }));
    if (!items.length) return false;
    E = { opc, items, i: -1, herr: null, color: COLORES[0][0], colorTexto: COLORES[0][0], gesto: null, trazo: null, escribe: null, ocupado: false, mos: null, cw: 0, ch: 0, n: 0 };
    fe.classList.toggle('modo-listo', opc.modo === 'listo');
    $('#fe-listo').textContent = opc.textoListo || T('Listo');
    $('#fe-enviar').disabled = false; $('#fe-listo').disabled = false; fe.removeAttribute('aria-busy');
    fe.hidden = false; document.body.classList.add('con-editor');
    await muestra(0);
    if (fino()) setTimeout(() => { try { (opc.modo === 'listo' ? $('#fe-listo') : $('#fe-comentario')).focus({ preventScroll: true }); } catch (_) {} }, 60);
    return true;
  }
  function cierra() {
    if (!E) return;
    const fe = $('#fe');
    fe.hidden = true; fe.removeAttribute('aria-busy'); fe.classList.remove('con-herramienta', 'modo-listo'); document.body.classList.remove('con-editor');
    $('#fe-escribe').hidden = true; $('#fe-papelera').hidden = true; $('#fe-colores').hidden = true;
    try { const v = $('#fe-video'); v.pause(); v.removeAttribute('src'); v.load(); } catch (_) {}
    $('#fe-img').removeAttribute('src'); $('#fe-textos').textContent = ''; $('#fe-tira').textContent = '';
    for (const it of E.items) { try { URL.revokeObjectURL(it.url); } catch (_) {} }
    $('#fe-comentario').value = '';
    E = null;
  }
  function cancela() { const o = E && E.opc; cierra(); if (o && o.alCancelar) { try { o.alCancelar(); } catch (_) {} } }

  // ---------- una foto en pantalla ----------
  const actual = () => (E && E.items[E.i]) || null;
  function guardaPie() { const it = actual(); if (it) it.pie = $('#fe-comentario').value.slice(0, PIE_MAX); }
  async function muestra(i) {
    if (!E) return;
    if (E.escribe) cierraEscribe(true);
    guardaPie();
    E.i = i; const it = actual(); if (!it) return;
    const img = $('#fe-img'), vid = $('#fe-video'), ficha = $('#fe-ficha'), marco = $('#fe-marco');
    herramienta(null);
    $('#fe-comentario').value = it.pie; ajustaComentario();
    vid.hidden = it.tipo !== 'video'; marco.hidden = !(it.tipo === 'foto' || it.tipo === 'imagen'); ficha.hidden = it.tipo !== 'archivo';
    if (it.tipo === 'video') vid.src = it.url; else { try { vid.pause(); } catch (_) {} vid.removeAttribute('src'); }
    $('#fe-textos').textContent = '';
    if (it.tipo === 'foto' || it.tipo === 'imagen') {
      img.src = it.url;
      try { await img.decode(); } catch (_) { if (actual() === it) { it.tipo = 'archivo'; marco.hidden = true; ficha.hidden = false; } }
      if (actual() !== it) return;
      if (it.tipo !== 'archivo') { it.w = img.naturalWidth; it.h = img.naturalHeight; }
    }
    if (it.tipo === 'archivo') { $('#fe-ficha-nombre').textContent = it.f.name || ''; }
    pintaHerramientas(); pintaTira(); coloca();
  }
  // el marco a la medida de la foto, dentro de lo que se ve (y un poco más grande si la foto es pequeña)
  function coloca() {
    const it = actual(); if (!it || !(it.tipo === 'foto' || it.tipo === 'imagen') || !it.w || !it.h) return;
    const lz = $('#fe-lienzo'), cs = getComputedStyle(lz);
    const aw = lz.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), ah = lz.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (aw <= 4 || ah <= 4) return;
    const k = Math.min(aw / it.w, ah / it.h, 3), w = Math.max(1, Math.floor(it.w * k)), h = Math.max(1, Math.floor(it.h * k));
    const marco = $('#fe-marco'); marco.style.width = w + 'px'; marco.style.height = h + 'px';
    E.cw = w; E.ch = h;
    const cv = $('#fe-cv'), dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
    E.mos = null;
    redibuja(); pintaTextos();
  }

  // ---------- dibujar y tapar ----------
  function mosaico(fuente, W, H, natW, natH) {
    const largo = Math.max(natW, natH) * Math.min(1, LADO_MAX / Math.max(natW, natH));
    const n = Math.max(1, Math.min(BLOQUES, Math.floor(largo / 14)));
    const sw = Math.max(1, Math.round(n * W / Math.max(W, H))), sh = Math.max(1, Math.round(n * H / Math.max(W, H)));
    const peq = document.createElement('canvas'); peq.width = sw; peq.height = sh; peq.getContext('2d').drawImage(fuente, 0, 0, sw, sh);
    const m = document.createElement('canvas'); m.width = W; m.height = H;
    const x = m.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(peq, 0, 0, W, H);
    return m;
  }
  function traza(ctx, p, W, H, ancho, estilo) {
    if (!p.length) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = ancho; ctx.strokeStyle = estilo; ctx.fillStyle = estilo;
    if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0][0] * W, p[0][1] * H, ancho / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
    ctx.beginPath(); ctx.moveTo(p[0][0] * W, p[0][1] * H);
    for (let j = 1; j < p.length - 1; j++) ctx.quadraticCurveTo(p[j][0] * W, p[j][1] * H, (p[j][0] + p[j + 1][0]) / 2 * W, (p[j][1] + p[j + 1][1]) / 2 * H);
    const u = p[p.length - 1]; ctx.lineTo(u[0] * W, u[1] * H); ctx.stroke(); ctx.restore();
  }
  // primero lo tapado (sobre la foto) y después los trazos: lo dibujado se ve siempre nítido
  function pintaAcciones(ctx, it, W, H, mos) {
    const corto = Math.min(W, H);
    if (mos) { const pat = ctx.createPattern(mos, 'no-repeat'); for (const a of it.acciones) if (a.tipo === 'tapa') traza(ctx, a.p, W, H, TAPA * 2 * corto, pat); }
    for (const a of it.acciones) if (a.tipo === 'trazo') traza(ctx, a.p, W, H, TRAZO * corto, a.color);
  }
  function redibuja() {
    rafPinta = 0;
    const cv = $('#fe-cv'), ctx = cv.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    const it = actual(); if (!it || it.tipo !== 'foto') return;
    let mos = null;
    if (it.acciones.some((a) => a.tipo === 'tapa')) { if (!E.mos || E.mos.width !== cv.width || E.mos.height !== cv.height) E.mos = mosaico($('#fe-img'), cv.width, cv.height, it.w, it.h); mos = E.mos; }
    pintaAcciones(ctx, it, cv.width, cv.height, mos);
  }
  const pideRedibujo = () => { if (!rafPinta) rafPinta = requestAnimationFrame(redibuja); };
  function punto(e) { const r = $('#fe-marco').getBoundingClientRect(); return [limita((e.clientX - r.left) / Math.max(1, r.width), 0, 1), limita((e.clientY - r.top) / Math.max(1, r.height), 0, 1)]; }
  function herramienta(h) {
    if (!E) return;
    E.herr = h;
    $('#fe-dibujar').setAttribute('aria-pressed', String(h === 'dibujar'));
    $('#fe-tapar').setAttribute('aria-pressed', String(h === 'tapar'));
    $('#fe').classList.toggle('con-herramienta', !!h);
    $('#fe-colores').hidden = h !== 'dibujar';
    $('#fe-pista').hidden = h !== 'tapar';
    pintaColores($('#fe-colores'), E.color);
  }
  function pintaHerramientas() {
    const it = actual(), foto = !!it && it.tipo === 'foto';
    $('#fe-dibujar').hidden = !foto; $('#fe-texto').hidden = !foto; $('#fe-deshacer').hidden = !foto;
    $('#fe-tapar').hidden = !foto || !E.opc.tapar;
    $('#fe-deshacer').disabled = !(it && it.hist.length);
    if (!foto && E.herr) herramienta(null);
    const ul = $('#fe-tira'), b = ul.querySelector('[aria-current="true"]'); if (b) b.classList.toggle('editada', !!(it && (it.textos.length || it.acciones.length)));
  }
  function pintaColores(cont, actualHex) {
    if (!cont.childElementCount) {
      for (const [hex, nombre] of COLORES) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'fe-color'; b.setAttribute('role', 'radio'); b.dataset.c = hex;
        b.setAttribute('aria-label', T(nombre)); b.title = T(nombre); b.style.setProperty('--c', hex);
        cont.append(b);
      }
    }
    for (const b of cont.children) b.setAttribute('aria-checked', String(b.dataset.c === actualHex));
  }
  function deshace() {
    const it = actual(); if (!it || E.escribe) return;
    const h = it.hist.pop(); if (!h) return;
    if (h.tipo === 'accion') it.acciones = it.acciones.filter((a) => a !== h.a);
    else if (h.tipo === 'texto') it.textos = it.textos.filter((t) => t !== h.t);
    redibuja(); pintaTextos(); pintaHerramientas();
  }

  // ---------- el texto sobre la foto ----------
  function estiloTexto(el, t, px) {
    if (px) el.style.fontSize = px + 'px';
    const claro = luz(t.color) > 0.5;
    if (t.fondo) { el.style.background = t.color; el.style.color = claro ? '#06080C' : '#F4F6F8'; el.style.textShadow = 'none'; }
    else { el.style.background = 'transparent'; el.style.color = t.color; el.style.textShadow = claro ? '0 .04em .14em rgba(6,8,12,.6)' : '0 .04em .14em rgba(244,246,248,.45)'; }
  }
  function colocaTexto(el, t) {
    estiloTexto(el, t, TEXTO * Math.min(E.cw, E.ch) * t.s);
    el.style.left = (t.x * 100) + '%'; el.style.top = (t.y * 100) + '%';
    el.style.transform = 'translate(-50%,-50%) rotate(' + t.r + 'rad)';
  }
  function pintaTextos() {
    const capa = $('#fe-textos'); capa.textContent = '';
    const it = actual(); if (!it || it.tipo !== 'foto' || !E.cw) return;
    for (const t of it.textos) {
      const el = document.createElement('div'); el.className = 'fe-t'; el.dataset.id = t.id; el.textContent = t.texto;
      el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-label', T('Texto sobre la foto') + ': ' + t.texto);
      if (E.escribe && E.escribe.t === t) el.hidden = true;
      colocaTexto(el, t); capa.append(el);
    }
  }
  const textoDe = (el) => String(el.innerText || el.textContent || '').replace(/\r/g, '').replace(/ /g, ' ').replace(/\n{4,}/g, '\n\n\n').replace(/^\n+/, '').replace(/\s+$/, '');
  function abreEscribe(t) {
    if (!E) return;
    herramienta(null);
    E.escribe = { t: t || null, color: t ? t.color : E.colorTexto, fondo: t ? !!t.fondo : false };
    const inp = $('#fe-escribe-in'); inp.textContent = t ? t.texto : '';
    pintaTextos(); pintaEscribe(); $('#fe-escribe').hidden = false;
    requestAnimationFrame(() => { try { inp.focus(); const s = getSelection(), r = document.createRange(); r.selectNodeContents(inp); r.collapse(false); s.removeAllRanges(); s.addRange(r); } catch (_) {} });
  }
  function pintaEscribe() {
    const s = E.escribe; if (!s) return;
    estiloTexto($('#fe-escribe-in'), s, 0);
    pintaColores($('#fe-colores-t'), s.color);
    $('#fe-fondo').setAttribute('aria-pressed', String(!!s.fondo));
  }
  function cierraEscribe(guardar) {
    if (!E || !E.escribe) return;
    const s = E.escribe; E.escribe = null;
    const inp = $('#fe-escribe-in'), texto = textoDe(inp).slice(0, TEXTO_MAX);
    $('#fe-escribe').hidden = true; try { inp.blur(); } catch (_) {}
    const it = actual();
    if (guardar && it) {
      if (texto.trim()) {
        if (s.t) { s.t.texto = texto; s.t.color = s.color; s.t.fondo = s.fondo; }
        else { const t = { id: 't' + (++E.n), texto, color: s.color, fondo: s.fondo, x: 0.5, y: 0.42, s: 1, r: 0 }; it.textos.push(t); it.hist.push({ tipo: 'texto', t }); }
        E.colorTexto = s.color;
      } else if (s.t) quitaTexto(s.t);
    }
    inp.textContent = '';
    pintaTextos(); pintaHerramientas();
  }
  function quitaTexto(t) {
    const it = actual(); if (!it) return;
    it.textos = it.textos.filter((x) => x !== t); it.hist = it.hist.filter((h) => h.t !== t);
    pintaTextos(); pintaHerramientas();
  }
  const textoPorId = (id) => { const it = actual(); return it ? it.textos.find((t) => t.id === id) : null; };
  // mover con un dedo; con dos, agrandar, achicar y girar; soltar sobre la papelera, quitar; un toque, volver a escribir
  function base(g) {
    const ps = [...g.ptr.values()], t = g.t;
    g.x0 = t.x; g.y0 = t.y; g.s0 = t.s; g.r0 = t.r;
    if (ps.length === 1) g.p0 = ps[0];
    else if (ps.length >= 2) { const [a, b] = ps; g.d0 = Math.max(8, Math.hypot(b[0] - a[0], b[1] - a[1])); g.a0 = Math.atan2(b[1] - a[1], b[0] - a[0]); g.c0 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
  }
  function sobrePapelera(x, y) { const p = $('#fe-papelera'); if (p.hidden) return false; const r = p.getBoundingClientRect(); return x >= r.left - 18 && x <= r.right + 18 && y >= r.top - 18 && y <= r.bottom + 18; }
  function papelera(ver, sobre) { const p = $('#fe-papelera'); p.hidden = !ver; p.classList.toggle('sobre', !!sobre); }

  // ---------- comentario, tira y envío ----------
  function ajustaComentario() { const ta = $('#fe-comentario'); ta.style.height = 'auto'; ta.style.height = Math.min(132, Math.max(46, ta.scrollHeight + 2)) + 'px'; }
  function pintaTira() {
    const ul = $('#fe-tira'); ul.textContent = ''; ul.hidden = !E || E.items.length < 2; if (ul.hidden) return;
    E.items.forEach((it, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button'); b.type = 'button'; b.className = 'fe-mini'; b.setAttribute('aria-label', T('Foto') + ' ' + (i + 1));
      if (i === E.i) b.setAttribute('aria-current', 'true');
      if (it.tipo === 'video') { b.classList.add('es-video'); b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7l9 5-9 5z"/></svg>'; }
      else if (it.tipo === 'archivo') b.classList.add('es-archivo');
      else { const im = document.createElement('img'); im.alt = ''; im.src = it.url; im.decoding = 'async'; b.append(im); }
      if (it.textos.length || it.acciones.length) b.classList.add('editada');
      b.addEventListener('click', () => { if (E && i !== E.i) muestra(i); });
      li.append(b);
      if (i === E.i) {
        const q = document.createElement('button'); q.type = 'button'; q.className = 'fe-mini-quita'; q.setAttribute('aria-label', T('Quitar de la selección')); q.title = T('Quitar de la selección');
        q.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>';
        q.addEventListener('click', () => quitaItem(i)); li.append(q);
      }
      ul.append(li);
    });
  }
  function quitaItem(i) {
    if (!E) return;
    guardaPie();
    const it = E.items.splice(i, 1)[0]; try { URL.revokeObjectURL(it.url); } catch (_) {}
    if (!E.items.length) { cancela(); return; }
    E.i = -1; muestra(Math.min(i, E.items.length - 1));
  }
  async function exporta(it) {
    let bmp = null;
    try { bmp = await createImageBitmap(it.f, { imageOrientation: 'from-image' }); } catch (_) { try { bmp = await createImageBitmap(it.f); } catch (_) { return null; } }
    const k = Math.min(1, LADO_MAX / Math.max(bmp.width, bmp.height)), W = Math.max(1, Math.round(bmp.width * k)), H = Math.max(1, Math.round(bmp.height * k));
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
    if (!/jpeg/i.test(it.f.type || '')) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); } // lo transparente de un PNG, en blanco
    ctx.drawImage(bmp, 0, 0, W, H);
    const mos = it.acciones.some((a) => a.tipo === 'tapa') ? mosaico(bmp, W, H, bmp.width, bmp.height) : null;
    try { if (bmp.close) bmp.close(); } catch (_) {}
    pintaAcciones(ctx, it, W, H, mos);
    if (it.textos.length) {
      try { await document.fonts.load('600 48px "IBM Plex Sans"', it.textos.map((t) => t.texto).join(' ')); } catch (_) {}
      for (const t of it.textos) pintaTexto(ctx, t, W, H);
    }
    const blob = await new Promise((r) => { try { cv.toBlob(r, 'image/jpeg', 0.92); } catch (_) { r(null); } });
    if (!blob) return null;
    const nombre = (String(it.f.name || 'foto').replace(/\.[a-z0-9]{2,5}$/i, '') || 'foto') + '.jpg';
    const nf = new File([blob], nombre, { type: 'image/jpeg', lastModified: Date.now() });
    try { nf.__limpia = true; nf.__editada = true; } catch (_) {}
    return nf;
  }
  function redondo(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  // el mismo texto que se ve en pantalla, a la medida de la foto final
  function pintaTexto(ctx, t, W, H) {
    const px = TEXTO * Math.min(W, H) * t.s, lineas = String(t.texto).split('\n'), lh = px * 1.2;
    ctx.save(); ctx.translate(t.x * W, t.y * H); ctx.rotate(t.r);
    ctx.font = '600 ' + px + 'px ' + FUENTE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const ancho = Math.max(1, ...lineas.map((l) => ctx.measureText(l).width)), alto = lineas.length * lh, claro = luz(t.color) > 0.5;
    if (t.fondo) { const pw = ancho + 0.64 * px, ph = alto + 0.36 * px; ctx.fillStyle = t.color; redondo(ctx, -pw / 2, -ph / 2, pw, ph, 0.3 * px); ctx.fill(); ctx.fillStyle = claro ? '#06080C' : '#F4F6F8'; }
    else { ctx.fillStyle = t.color; ctx.shadowColor = claro ? 'rgba(6,8,12,.6)' : 'rgba(244,246,248,.45)'; ctx.shadowBlur = 0.14 * px; ctx.shadowOffsetY = 0.04 * px; }
    lineas.forEach((l, i) => ctx.fillText(l, 0, -alto / 2 + lh * (i + 0.5)));
    ctx.restore();
  }
  async function termina() {
    if (!E || E.ocupado) return;
    if (E.escribe) cierraEscribe(true);
    guardaPie();
    E.ocupado = true;
    const fe = $('#fe'); fe.setAttribute('aria-busy', 'true'); $('#fe-enviar').disabled = true; $('#fe-listo').disabled = true;
    const opc = E.opc, items = E.opc.modo === 'listo' ? E.items.slice(0, 1) : E.items.slice(), salen = [];
    for (const it of items) {
      let f = it.f;
      if (it.tipo === 'foto' && (it.textos.length || it.acciones.length)) { try { const nf = await exporta(it); if (nf) f = nf; } catch (e) { console.warn('editor de fotos', e); } }
      const pie = String(it.pie || '').replace(/\s+$/, '').slice(0, PIE_MAX);
      try { f.__pie = pie || undefined; } catch (_) {}
      salen.push(f);
    }
    cierra();
    try { if (opc.modo === 'listo') { if (opc.alListo && salen[0]) opc.alListo(salen[0]); } else if (opc.alEnviar && salen.length) opc.alEnviar(salen); }
    catch (e) { console.warn('editor de fotos', e); }
  }

  // ---------- eventos (una sola vez) ----------
  function inicia() {
    if (iniciado) return; iniciado = true;
    const fe = $('#fe'), lienzo = $('#fe-lienzo'), marco = $('#fe-marco'), capa = $('#fe-textos');
    $('#fe-x').addEventListener('click', cancela); $('#fe-cancelar-2').addEventListener('click', cancela);
    $('#fe-deshacer').addEventListener('click', deshace);
    $('#fe-dibujar').addEventListener('click', () => herramienta(E && E.herr === 'dibujar' ? null : 'dibujar'));
    $('#fe-tapar').addEventListener('click', () => herramienta(E && E.herr === 'tapar' ? null : 'tapar'));
    $('#fe-texto').addEventListener('click', () => abreEscribe(null));
    $('#fe-colores').addEventListener('click', (e) => { const b = e.target.closest('.fe-color'); if (!b || !E) return; E.color = b.dataset.c; pintaColores($('#fe-colores'), E.color); });
    $('#fe-colores-t').addEventListener('click', (e) => { const b = e.target.closest('.fe-color'); if (!b || !E || !E.escribe) return; E.escribe.color = b.dataset.c; pintaEscribe(); try { $('#fe-escribe-in').focus(); } catch (_) {} });
    $('#fe-fondo').addEventListener('click', () => { if (!E || !E.escribe) return; E.escribe.fondo = !E.escribe.fondo; pintaEscribe(); try { $('#fe-escribe-in').focus(); } catch (_) {} });
    $('#fe-escribe-ok').addEventListener('click', () => cierraEscribe(true));
    // tocar fuera del texto que se escribe es «Listo»
    $('#fe-escribe').addEventListener('pointerdown', (e) => { if (e.target === e.currentTarget || e.target.classList.contains('fe-escribe-zona')) { e.preventDefault(); cierraEscribe(true); } });
    const inp = $('#fe-escribe-in');
    inp.addEventListener('paste', (e) => { e.preventDefault(); const s = (e.clipboardData && e.clipboardData.getData('text/plain')) || ''; try { document.execCommand('insertText', false, s.slice(0, TEXTO_MAX)); } catch (_) {} });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && fino()) { e.preventDefault(); cierraEscribe(true); } });
    inp.addEventListener('input', () => { if (textoDe(inp).length > TEXTO_MAX) inp.textContent = textoDe(inp).slice(0, TEXTO_MAX); });
    const ta = $('#fe-comentario');
    ta.addEventListener('input', ajustaComentario);
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); termina(); } });
    $('#fe-enviar').addEventListener('click', termina);
    $('#fe-listo').addEventListener('click', termina);
    // trazos («Dibujar» y «Tapar»)
    marco.addEventListener('pointerdown', (e) => {
      if (!E || !E.herr || E.trazo || E.escribe) return; const it = actual(); if (!it || it.tipo !== 'foto') return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault(); try { marco.setPointerCapture(e.pointerId); } catch (_) {}
      const a = { tipo: E.herr === 'tapar' ? 'tapa' : 'trazo', color: E.color, p: [punto(e)] };
      it.acciones.push(a); it.hist.push({ tipo: 'accion', a }); E.trazo = { id: e.pointerId, a };
      redibuja(); pintaHerramientas();
    });
    marco.addEventListener('pointermove', (e) => {
      if (!E || !E.trazo || e.pointerId !== E.trazo.id) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of (evs.length ? evs : [e])) { const p = punto(ev), u = E.trazo.a.p[E.trazo.a.p.length - 1]; if (Math.hypot((p[0] - u[0]) * E.cw, (p[1] - u[1]) * E.ch) >= 1.5) E.trazo.a.p.push(p); }
      pideRedibujo();
    });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) marco.addEventListener(ev, (e) => { if (E && E.trazo && e.pointerId === E.trazo.id) { E.trazo = null; redibuja(); } });
    // los textos: arrastrar, pellizcar, girar y tocar
    capa.addEventListener('pointerdown', (e) => {
      if (!E || E.herr || E.escribe) return;
      const el = e.target.closest('.fe-t'), t = el && textoPorId(el.dataset.id); if (!t) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      if (!E.gesto) E.gesto = { t, el, ptr: new Map(), movido: false, t0: Date.now(), papelera: false };
      if (E.gesto.t !== t) return;
      E.gesto.ptr.set(e.pointerId, [e.clientX, e.clientY]);
      try { lienzo.setPointerCapture(e.pointerId); } catch (_) {}
      base(E.gesto);
    });
    // el segundo dedo puede caer fuera del texto
    lienzo.addEventListener('pointerdown', (e) => {
      const g = E && E.gesto; if (!g || g.ptr.size !== 1 || g.ptr.has(e.pointerId)) return;
      e.preventDefault(); g.ptr.set(e.pointerId, [e.clientX, e.clientY]); try { lienzo.setPointerCapture(e.pointerId); } catch (_) {} g.movido = true; base(g);
    });
    lienzo.addEventListener('pointermove', (e) => {
      const g = E && E.gesto; if (!g || !g.ptr.has(e.pointerId)) return;
      g.ptr.set(e.pointerId, [e.clientX, e.clientY]);
      const ps = [...g.ptr.values()], t = g.t;
      if (ps.length === 1) {
        const dx = ps[0][0] - g.p0[0], dy = ps[0][1] - g.p0[1];
        if (!g.movido && Math.hypot(dx, dy) > 6) g.movido = true;
        if (!g.movido) return;
        t.x = limita(g.x0 + dx / Math.max(1, E.cw), 0, 1); t.y = limita(g.y0 + dy / Math.max(1, E.ch), 0, 1);
        papelera(true, g.papelera = sobrePapelera(ps[0][0], ps[0][1]));
      } else {
        const [a, b] = ps, d = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        t.s = limita(g.s0 * d / g.d0, 0.25, 8); t.r = g.r0 + (ang - g.a0);
        t.x = limita(g.x0 + (c[0] - g.c0[0]) / Math.max(1, E.cw), 0, 1); t.y = limita(g.y0 + (c[1] - g.c0[1]) / Math.max(1, E.ch), 0, 1);
        papelera(false); g.papelera = false;
      }
      g.el.classList.add('moviendo'); colocaTexto(g.el, t);
    });
    const suelta = (e) => {
      const g = E && E.gesto; if (!g || !g.ptr.has(e.pointerId)) return;
      g.ptr.delete(e.pointerId);
      if (g.ptr.size) { base(g); return; }
      E.gesto = null; g.el.classList.remove('moviendo');
      const quitar = g.papelera && e.type === 'pointerup'; papelera(false);
      if (quitar) { quitaTexto(g.t); return; }
      if (!g.movido && e.type === 'pointerup' && Date.now() - g.t0 < 500) abreEscribe(g.t);
    };
    lienzo.addEventListener('pointerup', suelta); lienzo.addEventListener('pointercancel', suelta);
    // con el ratón: la rueda agranda o achica el texto y, con Mayús, lo gira
    capa.addEventListener('wheel', (e) => {
      if (!E || E.herr) return; const el = e.target.closest('.fe-t'), t = el && textoPorId(el.dataset.id); if (!t) return;
      e.preventDefault(); if (e.shiftKey) t.r += (e.deltaY || e.deltaX) * 0.003; else t.s = limita(t.s * Math.exp(-e.deltaY * 0.0015), 0.25, 8); colocaTexto(el, t);
    }, { passive: false });
    // con el teclado: Intro vuelve a escribir, Supr lo quita, las flechas lo mueven, + y − cambian el tamaño
    capa.addEventListener('keydown', (e) => {
      const el = e.target.closest('.fe-t'), t = el && textoPorId(el.dataset.id); if (!t) return;
      const paso = e.shiftKey ? 0.05 : 0.01;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abreEscribe(t); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); quitaTexto(t); }
      else if (/^Arrow/.test(e.key)) { e.preventDefault(); if (e.key === 'ArrowLeft') t.x = limita(t.x - paso, 0, 1); if (e.key === 'ArrowRight') t.x = limita(t.x + paso, 0, 1); if (e.key === 'ArrowUp') t.y = limita(t.y - paso, 0, 1); if (e.key === 'ArrowDown') t.y = limita(t.y + paso, 0, 1); colocaTexto(el, t); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); t.s = limita(t.s * 1.1, 0.25, 8); colocaTexto(el, t); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); t.s = limita(t.s / 1.1, 0.25, 8); colocaTexto(el, t); }
    });
    // Escape: primero cierra lo que se escribe; si no, cancela. Ctrl/Cmd+Z deshace. Nada de esto llega a lo que hay debajo
    document.addEventListener('keydown', (e) => {
      if (!E || fe.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); if (E.escribe) cierraEscribe(false); else if (E.herr) herramienta(null); else cancela(); return; }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z') && !E.escribe && document.activeElement !== ta) { e.preventDefault(); e.stopImmediatePropagation(); deshace(); }
    }, true);
    fe.addEventListener('contextmenu', (e) => { if (e.target.closest('#fe-marco')) e.preventDefault(); });
    try { new ResizeObserver(() => { if (E) coloca(); }).observe(lienzo); } catch (_) { addEventListener('resize', () => { if (E) coloca(); }); }
  }

  window.GuardianaEditorFoto = { abre, admite, editable, abierto: () => !!E, cierra: cancela };
})();
