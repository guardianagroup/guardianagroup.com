// GUARDIANA Comunicaciones on the phone — the behaviour of the named components in
// componentes.css (18 Oct 2026, the committee's spec), small and with no state of the
// conversation: each piece takes what to draw and gives back markup or wires one element.
// The native apps copy the same pieces: GC.burbuja, GC.archivo, GC.nota, GC.gestos, GC.hoja,
// GC.escudo, GC.calidad, GC.teclado; the call screen is markup with the gc-llamada classes.
'use strict';
(function (raiz) {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg = (d, caja) => `<svg viewBox="${caja || '0 0 24 24'}" aria-hidden="true">${d}</svg>`;
  const ICONO = {
    atras: svg('<path d="M15 5l-7 7 7 7"/>'),
    llamar: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    escudo: svg('<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z"/>'),
    candado: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    mas: svg('<path d="M12 5v14M5 12h14"/>'),
    mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
    enviar: svg('<path d="M5 12h13M13 6l6 6-6 6"/>'),
    colgar: svg('<path d="M3.5 13.5c4.7-4.7 12.3-4.7 17 0l-2.4 2.4a2 2 0 0 1-2.4.3l-2-1.3a2 2 0 0 1-.9-1.7v-1.3a11 11 0 0 0-5.6 0v1.3a2 2 0 0 1-.9 1.7l-2 1.3a2 2 0 0 1-2.4-.3z"/>'),
    silencio: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M4 4l16 16"/>'),
    altavoz: svg('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'),
    documento: svg('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'),
    responder: svg('<path d="M10 8 5 12l5 4"/><path d="M5 12h9a5 5 0 0 1 5 5v1"/>'),
    copiar: svg('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
    editar: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
    borrar: svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    abajo: svg('<path d="m6 9 6 6 6-6"/>'),
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  };
  // One tick sent, two delivered, two seen (thicker): always steel, a clock while pending.
  const TICKS = {
    pendiente: '<span class="gc-ticks gc-pendiente">' + svg('<circle cx="8" cy="5.5" r="4"/><path d="M8 3.5v2l1.5 1"/>', '0 0 16 11') + '</span>',
    enviado: '<span class="gc-ticks">' + svg('<path d="m2 6 3 3 6-7"/>', '0 0 16 11') + '</span>',
    entregado: '<span class="gc-ticks">' + svg('<path d="m1 6 3 3 6-7M7 8l1 1 6-7"/>', '0 0 16 11') + '</span>',
    visto: '<span class="gc-ticks gc-visto">' + svg('<path d="m1 6 3 3 6-7M7 8l1 1 6-7" stroke-width="2.4"/>', '0 0 16 11') + '</span>',
  };
  const tamano = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : b >= 1024 ? Math.round(b / 1024) + ' KB' : (b || 0) + ' B');
  const tiempo = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  // A bubble. `x`: { mia, sigue, i, id, de, cita, cuerpo (markup already escaped), hora, editado, estado }.
  function burbuja(x) {
    const meta = `<span class="gc-meta">${x.editado ? esc(x.editado) + ' · ' : ''}${esc(x.hora || '')}${x.mia && x.estado ? ' ' + (TICKS[x.estado] || '') : ''}</span>`;
    return `<li class="gc-burbuja ${x.mia ? 'gc-mia' : 'gc-suya'}${x.sigue ? ' gc-sigue' : ''}" data-i="${esc(x.i)}" data-id="${esc(x.id || '')}">`
      + `<span class="gc-flecha-respuesta">${ICONO.responder}</span>`
      + (x.de ? `<b class="gc-de">${esc(x.de)}</b>` : '') + (x.cita ? `<span class="gc-cita">${esc(x.cita)}</span>` : '')
      + `${x.cuerpo || ''}${meta}</li>`;
  }
  // A file: its name, its size and, while it travels, a thin line of how much is done (0-1).
  function archivo(x) {
    const p = typeof x.progreso === 'number' ? Math.max(0, Math.min(1, x.progreso)) : null;
    return `<span class="gc-archivo"><span class="gc-archivo-icono">${ICONO.documento}</span><b>${esc(x.nombre || '')}</b>`
      + `<small>${esc(x.detalle != null ? x.detalle : x.bytes ? tamano(x.bytes) : '')}</small>`
      + (p !== null && p < 1 ? `<span class="gc-progreso"><i style="width:${(p * 100).toFixed(1)}%"></i></span>` : '') + '</span>';
  }
  // A voice note: play and a waveform. The bars come from the sound itself once it is here
  // (decoded on this phone, nothing leaves); until then, a flat line.
  function nota(x) {
    const barras = Array.from({ length: 32 }, () => '<i style="height:18%"></i>').join('');
    return `<span class="gc-nota" data-url="${esc(x.url || '')}"><button type="button" class="gc-nota-play" aria-label="${esc(x.etiquetaPlay || 'Play')}" ${x.url ? '' : 'disabled'}>${ICONO.play}</button>`
      + `<span class="gc-onda">${barras}</span><span class="gc-nota-tiempo">${esc(x.duracion ? tiempo(x.duracion) : '')}</span></span>`
      + (x.etiqueta ? `<span class="gc-nota-etiqueta">${esc(x.etiqueta)}</span>` : '');
  }
  // The real waveform of each note on screen (cached per address), and one player for all.
  const ondas = new Map();
  let sonando = null;
  const audio = new (raiz.Audio || function () {})();
  async function ondaDe(url) {
    if (ondas.has(url)) return ondas.get(url);
    const C = raiz.AudioContext || raiz.webkitAudioContext;
    if (!C || !raiz.fetch) return null;
    try {
      const datos = await (await fetch(url)).arrayBuffer();
      const ac = new C();
      const b = await ac.decodeAudioData(datos);
      try { ac.close(); } catch (_) {}
      const c = b.getChannelData(0), n = 32, paso = Math.floor(c.length / n) || 1, picos = [];
      for (let i = 0; i < n; i++) { let m = 0; for (let j = i * paso; j < Math.min(c.length, (i + 1) * paso); j += 16) m = Math.max(m, Math.abs(c[j])); picos.push(m); }
      const max = Math.max(0.01, ...picos);
      const r = { picos: picos.map((v) => 0.15 + 0.85 * (v / max)), duracion: b.duration };
      ondas.set(url, r);
      return r;
    } catch (_) { return null; }
  }
  function activaNotas(raizDom) {
    raizDom.querySelectorAll('.gc-nota[data-url]').forEach(async (el) => {
      const url = el.dataset.url; if (!url || el.dataset.lista) return;
      el.dataset.lista = '1';
      const o = await ondaDe(url);
      if (!o) return;
      el.querySelectorAll('.gc-onda i').forEach((b, i) => { b.style.height = Math.round(o.picos[i] * 100) + '%'; });
      const tt = el.querySelector('.gc-nota-tiempo'); if (tt && !tt.textContent) tt.textContent = tiempo(o.duracion);
      if (sonando && sonando.url === url) pintaAvance(el, sonando.avance);
    });
  }
  const pintaAvance = (el, f) => { const bs = el.querySelectorAll('.gc-onda i'); bs.forEach((b, i) => b.classList.toggle('gc-oido', i / bs.length < f)); };
  if (typeof document !== 'undefined') document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.gc-nota-play'); if (!b) return;
    const el = b.closest('.gc-nota'), url = el && el.dataset.url; if (!url) return;
    e.preventDefault(); e.stopPropagation();
    if (sonando && sonando.url === url && !audio.paused) { audio.pause(); return; }
    audio.src = url; audio.play().catch(() => {});
    sonando = { url, avance: 0 };
  }, true);
  const todas = () => (typeof document !== 'undefined' ? document.querySelectorAll('.gc-nota') : []);
  if (audio.addEventListener) {
    audio.addEventListener('timeupdate', () => { if (!sonando || !audio.duration) return; sonando.avance = audio.currentTime / audio.duration; todas().forEach((el) => { if (el.dataset.url === sonando.url) pintaAvance(el, sonando.avance); }); });
    const icono = () => todas().forEach((el) => { const b = el.querySelector('.gc-nota-play'); if (b) b.innerHTML = sonando && el.dataset.url === sonando.url && !audio.paused ? ICONO.pausa : ICONO.play; });
    audio.addEventListener('play', icono); audio.addEventListener('pause', icono);
    audio.addEventListener('ended', () => { if (sonando) sonando.avance = 0; todas().forEach((el) => pintaAvance(el, 0)); icono(); });
  }

  // Swipe right to reply, or press and hold for the choices (shown as a sheet with words, so
  // the swipe is never the only way). `fns`: { responder(li), menu(li) }.
  function gestos(lista, fns) {
    let t = null, x0 = 0, y0 = 0, li = null, dx = 0, mueve = false;
    const suelta = () => { if (li) { li.style.transform = ''; const f = li.querySelector('.gc-flecha-respuesta'); if (f) f.style.opacity = '0'; } li = null; mueve = false; clearTimeout(t); };
    lista.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.gc-burbuja'); if (!b || e.target.closest('a, button, audio, video')) return;
      li = b; x0 = e.clientX; y0 = e.clientY; dx = 0; mueve = false;
      clearTimeout(t); t = setTimeout(() => { if (li && !mueve) { const x = li; suelta(); try { navigator.vibrate && navigator.vibrate(15); } catch (_) {} fns.menu(x); } }, 450);
    });
    lista.addEventListener('pointermove', (e) => {
      if (!li) return;
      const ddx = e.clientX - x0, ddy = e.clientY - y0;
      if (!mueve && (Math.abs(ddx) > 8 || Math.abs(ddy) > 8)) { mueve = true; clearTimeout(t); if (Math.abs(ddy) > Math.abs(ddx)) { suelta(); return; } }
      if (!mueve) return;
      dx = Math.max(0, Math.min(80, ddx));
      li.style.transform = `translateX(${dx}px)`;
      const f = li.querySelector('.gc-flecha-respuesta'); if (f) f.style.opacity = String(Math.min(1, dx / 56));
    });
    const fin = () => { if (li && mueve && dx >= 56) { const x = li; suelta(); try { navigator.vibrate && navigator.vibrate(10); } catch (_) {} fns.responder(x); return; } suelta(); };
    lista.addEventListener('pointerup', fin); lista.addEventListener('pointercancel', suelta);
    lista.addEventListener('contextmenu', (e) => { const b = e.target.closest('.gc-burbuja'); if (b) { e.preventDefault(); suelta(); fns.menu(b); } });
  }

  // A bottom sheet: opens over the page, closes on the backdrop or with Escape.
  function hoja(el) {
    const cierra = () => { el.classList.remove('gc-abierta'); if (el._alCerrar) el._alCerrar(); };
    el.addEventListener('click', (e) => { if (e.target === el) cierra(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.classList.contains('gc-abierta')) cierra(); });
    return { abre: (alCerrar) => { el._alCerrar = alCerrar || null; el.classList.add('gc-abierta'); }, cierra, abierta: () => el.classList.contains('gc-abierta') };
  }

  // The shield's rows: [estado ('ok' | 'aviso' | 'alerta' | 'info' | ''), title, text, time].
  function escudo(filas) {
    return '<ul class="gc-escudo">' + filas.map(([e, a, b, c]) => `<li class="${e ? 'gc-' + e : ''}"><i></i><b>${esc(a)}</b><time>${esc(c || '')}</time><span>${esc(b)}</span></li>`).join('') + '</ul>';
  }

  // The worse of two quality words (the phone's leg and the computer's), or the one there is.
  const ORDEN = { excelente: 2, buena: 1, debil: 0 };
  function calidad(a, b) {
    if (!(a in ORDEN)) return b in ORDEN ? b : null;
    if (!(b in ORDEN)) return a;
    return ORDEN[a] <= ORDEN[b] ? a : b;
  }

  // The keyboard (iPhone: the page is not resized, the composer would hide behind it): the
  // visible height is measured and the composer is lifted by what the keyboard covers.
  function teclado() {
    const vv = raiz.visualViewport; if (!vv) return;
    const ajusta = () => {
      const cubre = Math.max(0, raiz.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--gc-teclado', (cubre > 60 ? cubre : 0) + 'px');
    };
    vv.addEventListener('resize', ajusta); vv.addEventListener('scroll', ajusta); ajusta();
  }

  raiz.GC = { esc, ICONO, TICKS, tamano, tiempo, burbuja, archivo, nota, activaNotas, gestos, hoja, escudo, calidad, teclado };
  if (typeof module !== 'undefined' && module.exports) module.exports = raiz.GC;
})(typeof window !== 'undefined' ? window : globalThis);
