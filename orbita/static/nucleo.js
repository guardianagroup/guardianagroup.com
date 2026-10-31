// GUARDIANA · NÚCLEO (27 Oct 2026). La puerta de entrada de GUARDIANA y su guía en toda la web.
// Dueño, 10:38: en el chat de NÚCLEO, «navegador ZERO» y no «ZERO» a secas, para que se entienda.
// Dueño, 08:42: «pantalla negra y en el medio nace el navegador con el cerebro neuronal… ella te va derivando»; 09:03: «si
// Núcleo está muy bien estructurado y va guiando al cliente, a lo mejor no hace falta la IA». Ronda 52 de la agencia.
// 09:53: fuera la caja de escribir de la portada («el chat aquí dentro lo hace todo más pequeño»); 10:00: una cuarta tarjeta
// para «pedir las cosas», con su propia sección (rondas 53 y 54 de la agencia: las frases, la sección y el resumen en PDF).
// - La portada: NÚCLEO, «Toma el control de tus datos» y cuatro tarjetas que llevan directas a cada sitio.
// - La sección de NÚCLEO (cuarta tarjeta y botón «NÚCLEO» abajo a la izquierda): se le pide por escrito; entiende unas 500
//   frases de ejemplo (nucleo-frases.js) con el motor de nucleo-motor.js, hace las cosas de verdad, pregunta «¿Quisiste
//   decir…?» cuando duda y enseña «¿Qué puedo pedir?» cuando no entiende. Hace el «Resumen de mis datos» en PDF.
// Todo corre en el navegador de cada persona: NÚCLEO no guarda ni envía lo que se le pide.
'use strict';
(() => {
  const T = (s) => { try { return window.GuardianaIdioma ? GuardianaIdioma.t(s) : s; } catch (_) { return s; } };
  const loc = () => { try { return (window.GuardianaIdioma && GuardianaIdioma.locale) || 'es'; } catch (_) { return 'es'; } };
  const fmt = (n) => { try { return Number(n).toLocaleString(loc()); } catch (_) { return String(n); } };
  const sinTildes = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  const pon = (tpl, ...xs) => xs.reduce((s, x, i) => s.split('{' + (i + 1) + '}').join(x), T(tpl));
  const q = new URLSearchParams(location.search);
  const PUERTA_EN_URL = /^#(zero|radiografias|comunicaciones|mi-conexion|escaner)$/.test(location.hash); // 31 Oct 2026: y el Escáner PC
  const red = (lienzo, op) => (window.RedNucleo ? window.RedNucleo(lienzo, op) : { habla() {}, para() {} });
  // dueño, 10:53: «todas las páginas que se abren tienen que tener un botón de volver a donde estás»: se recuerda de dónde se
  // salió (la portada o la sección de NÚCLEO) y los botones de volver lo dicen («Inicio» o «Regresar a NÚCLEO»).
  const VUELTA = 'guardiana-vuelta';
  const vuelta = () => { try { return sessionStorage.getItem(VUELTA) || 'portada'; } catch (_) { return 'portada'; } };
  const ponVuelta = (v) => { try { sessionStorage.setItem(VUELTA, v); } catch (_) {} pintaVuelta(); };

  // ---------- acciones reales ----------
  function marcoZero() { try { const m = document.getElementById('marco'); if (m && !m.hidden && m.contentWindow && /\/zero\//.test(m.contentWindow.location.pathname)) return m.contentWindow; } catch (_) {} return null; }
  const hayWeb = () => { try { const w = marcoZero(); return !!(w && w.document.querySelector('#stage.open')); } catch (_) { return false; } };
  function cierraTodo() { cierraSala(); ocultaInicio(); }
  function abreZero(web, op) {
    cierraTodo();
    if (!marcoZero() && window.OrbitaPuertas) OrbitaPuertas.abre('zero');
    let k = 0; const etiqueta = () => { pintaVuelta(); const w = marcoZero(); if ((!w || !w.document.querySelector('#volverZ span')) && ++k < 40) setTimeout(etiqueta, 250); };
    etiqueta();
    // «Navegar con Tor» (ronda 63: que nadie tenga que buscarlo): ZERO se abre con Tor ya puesto, con su explicación
    if (op && op.tor) { let n = 0; const tor = () => { const w = marcoZero(), u = w && w.document.getElementById('ultra'); if (u) { if (u.getAttribute('aria-pressed') !== 'true') u.click(); return; } if (++n < 40) setTimeout(tor, 250); }; setTimeout(tor, 600); }
    if (!web) return;
    let n = 0; const intenta = () => {
      const w = marcoZero(); const f = w && w.document.getElementById('lens'); const i = f && f.querySelector('input');
      if (i) { i.value = web; i.dispatchEvent(new w.Event('input', { bubbles: true })); try { f.requestSubmit(); } catch (_) { f.dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true })); } return; }
      if (++n < 40) setTimeout(intenta, 250);
    };
    setTimeout(intenta, 600);
  }
  function alPlaneta(capa, pais) {
    cierraTodo();
    const v = document.getElementById('volver'); if (document.body.classList.contains('dentro') && v && !v.hidden) { volviendo = Date.now(); v.click(); }
    setTimeout(() => {
      try { if (capa && window.OrbitaCapas && typeof OrbitaCapas.pon === 'function') OrbitaCapas.pon(capa, true); } catch (_) {}
      try { const C = window.OrbitaPlaneta && OrbitaPlaneta.centros; if (pais && C && C[pais]) OrbitaPlaneta.ir(C[pais].lon, C[pais].lat, 2.2); } catch (_) {}
    }, 500);
  }
  // ronda 63: «Crear una invitación» y «Tengo un código» llegan directos a ese paso de Comunicaciones (?paso=…)
  // 31 Oct 2026: dentro del programa para Windows (data-en-programa), Comunicaciones es su propia pestaña, que sigue abierta por
  // detrás para que lleguen las llamadas y los mensajes: el clic lleva data-producto="secure", el programa lo coge y enseña esa
  // pestaña sin sacar a Órbita de la suya. Si nada lo coge, el enlace va a Comunicaciones como en la web.
  const enPrograma = () => document.documentElement.dataset.enPrograma === '1';
  const irComunicaciones = (paso) => {
    const url = 'comunicaciones/' + (paso === 'crear' || paso === 'codigo' ? '?paso=' + paso : '');
    if (!enPrograma()) { location.href = url; return; }
    const a = document.createElement('a'); a.href = url; a.dataset.producto = 'secure'; a.hidden = true;
    document.body.append(a); a.click(); a.remove();
  };
  // la tarjeta de la portada, marcada para que el programa coja su clic (también si marca la página un momento después)
  function marcaPortada() {
    const b = ini && ini.querySelector('.nuc-op[data-n="com"]'); if (!b) return;
    if (enPrograma()) b.dataset.producto = 'secure'; else delete b.dataset.producto;
    // 31 Oct 2026 (coordinación: «en modo programa, añade una tarjeta Escáner PC a ese inicio»): solo dentro del programa
    const e = ini.querySelector('.nuc-op[data-n="escaner"]'); if (e) { e.hidden = !enPrograma(); e.parentNode.classList.toggle('con-escaner', enPrograma()); }
  }
  try { new MutationObserver(marcaPortada).observe(document.documentElement, { attributes: true, attributeFilter: ['data-en-programa'] }); } catch (_) {}
  // El PDF de una web lo hace ZERO con lo que ha visto en la web abierta.
  function pdfWeb() { const w = marcoZero(); if (w && hayWeb() && typeof w.zeroInforme === 'function') { cierraTodo(); w.zeroInforme(); return true; } return false; }

  // ---------- tus datos (lo que ZERO guarda en este navegador; nada sale de aquí) ----------
  const lee = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (_) { return d; } };
  const registros = () => { const R = lee('zeroRegistroCortes', []); return Array.isArray(R) ? R.filter((r) => r && r.t) : []; };
  const totalCortes = () => { const tot = lee('zeroTotal', null); return tot && typeof tot.c === 'number' ? tot.c : registros().length; };
  const hayDatos = () => registros().length > 0 || totalCortes() > 0;
  function misDatos() {
    const REG = registros(), total = totalCortes();
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    const hoy = REG.filter((r) => r.t >= +d0);
    const emp = new Set(hoy.map((r) => r.e).filter(Boolean)), pai = new Set(hoy.map((r) => r.p).filter((x) => x && x !== 'País no identificado'));
    if (!hoy.length && !total) return T('Todavía no hay datos: en cuanto abras una web con el navegador ZERO y cortes algo, aquí te cuento qué empresas eran y de qué países. Se guarda solo en este navegador.');
    let s = hoy.length ? pon('Hoy, en este equipo: cortes {1} · empresas {2} · países {3}.', fmt(hoy.length), fmt(emp.size), fmt(pai.size)) : T('Hoy todavía no se ha cortado nada en este equipo.');
    if (total) s += ' ' + pon('Desde que usas el navegador ZERO, cortes en total: {1}.', fmt(total));
    if (hoy.length) { const c = new Map(); hoy.forEach((r) => c.set(r.e, (c.get(r.e) || 0) + 1)); const top = [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e).filter(Boolean); if (top.length) s += ' ' + pon('Las que más lo han intentado: {1}.', top.join(', ')); }
    return s + ' ' + T('Se guarda solo en este navegador.');
  }
  function borraDatos() {
    // 28 Oct 2026: también las subastas de hoy, que guardan qué webs se visitaron
    for (const k of ['zeroRegistroCortes', 'zeroTotal', 'zeroRadiografia', 'zeroSubastasHoy']) { try { localStorage.removeItem(k); } catch (_) {} }
    // ZERO lleva su registro también en memoria: si está abierto, se recarga para que no lo vuelva a escribir
    try { const m = document.getElementById('marco'); if (m && m.contentWindow && /\/zero\//.test(m.contentWindow.location.pathname)) m.contentWindow.location.reload(); } catch (_) {}
  }
  // «Resumen de mis datos» (ronda 54: título y alcance, totales, empresas, países, por tipo, webs, el registro y la nota de alcance).
  // Dueño, 10:56: «el resumen de los datos puede ser en PDF, pero también en vídeo… de la última web, de la última hora o del
  // último día… lo que más se simplifica». Se elige el periodo y el formato; los dos salen de lo mismo: GuardianaResumen.datos
  // (resumen-video.js, que solo se carga cuando se pide un resumen). El PDF lo escribe el escritor de ZERO (orbita/zero/pdf.js);
  // si el idioma no cabe en ese PDF, se abre la ventana de imprimir con el mismo contenido. Nada sale de este navegador.
  const hayRadiografia = () => { const rx = lee('zeroRadiografia', null); return !!(rx && ['c', 's', 'h', 'k'].some((k) => Array.isArray(rx[k]) && rx[k].length)); };
  const hayAlgo = () => hayDatos() || hayRadiografia();
  const PERIODOS = [['web', 'La última web'], ['hora', 'La última hora'], ['24h', 'Las últimas 24 horas']];
  const ESTADO = { c: 'Cortada', p: 'Permitida', v: 'Sin cortar' };
  let cargaRes = null;
  function moduloResumen() {
    if (window.GuardianaResumen) return Promise.resolve(window.GuardianaResumen);
    if (!cargaRes) cargaRes = new Promise((ok, mal) => {
      const s = document.createElement('script'); s.src = '/orbita/static/resumen-video.js?v=20261027a'; s.async = true;
      s.onload = () => (window.GuardianaResumen ? ok(window.GuardianaResumen) : mal(new Error('resumen')));
      s.onerror = () => { cargaRes = null; s.remove(); mal(new Error('resumen')); };
      document.head.append(s);
    });
    return cargaRes;
  }
  function docResumen(d, G) {
    const fecha = (t) => { try { return new Date(t).toLocaleString(loc(), { dateStyle: 'medium', timeStyle: 'short' }); } catch (_) { return new Date(t).toISOString(); } };
    const A = d.todas || {}, cifras = [], S = d.subastas || {};
    const tres = (q) => [q.nombre, fmt(q.conexiones), fmt(q.cortes)];
    if (S.total) cifras.push([T('Subastas'), fmt(S.total), pon(S.pujadores === 1 ? '{1} empresa pujó' : '{1} empresas pujaron', fmt(S.pujadores || 0)) + (S.cpmMax ? ' · ' + T('Puja más alta (CPM)') + ': ' + S.cpmMax.texto : '')]);
    if (d.lecturas && d.lecturas.total) cifras.push([T('Lecturas del equipo'), fmt(d.lecturas.total), T('intentos de reconocer el equipo sin cookies')]);
    if (d.cookies && d.cookies.total) cifras.push([T('Cookies'), fmt(d.cookies.total), T('de otras empresas')]);
    const pais = (p) => (p ? (G && G.pais ? G.pais(p, T, loc()) : T(p)) : '');
    const secciones = [
      { titulo: T('Empresas'), cols: [{ t: 'Empresa', w: 40 }, { t: 'País', w: 24 }, { t: 'Conexiones', w: 18, der: 1 }, { t: 'Cortes', w: 18, der: 1, rojo: 1 }], filas: (A.empresas || []).slice(0, 80).map((e) => [e.nombre, e.paisNombre, fmt(e.conexiones), fmt(e.cortes)]) },
      { titulo: T('Países'), cols: [{ t: 'País', w: 60 }, { t: 'Conexiones', w: 20, der: 1 }, { t: 'Cortes', w: 20, der: 1, rojo: 1 }], filas: (A.paises || []).slice(0, 60).map(tres) },
      { titulo: T('Por tipo'), cols: [{ t: 'Tipo', w: 60 }, { t: 'Conexiones', w: 20, der: 1 }, { t: 'Cortes', w: 20, der: 1, rojo: 1 }], filas: (d.tipos || []).map(tres) },
    ];
    if (d.periodo !== 'web') secciones.push({ titulo: T('Webs donde pasó'), cols: [{ t: 'Web', w: 80 }, { t: 'Conexiones', w: 20, der: 1 }], filas: (A.webs || []).slice(0, 60).map((x) => [x.web, fmt(x.conexiones)]) });
    if (cifras.length) secciones.push({ titulo: T('En cifras'), nota: S.cpmMax ? T('CPM: lo que una empresa ofrecía por mostrar su anuncio mil veces, según la propia página. No es el precio de tus datos.') : '', cols: [{ t: '', w: 26 }, { t: '', w: 12, der: 1 }, { t: '', w: 62, wrap: 1 }], filas: cifras });
    secciones.push({ titulo: T('Conexiones registradas'), cols: [{ t: 'Fecha y hora', w: 19 }, { t: 'Web', w: 20 }, { t: 'Empresa', w: 21 }, { t: 'País', w: 15 }, { t: 'Tipo', w: 14 }, { t: 'Estado', w: 11 }],
      filas: (d.registros || []).slice(0, 1500).map((r) => [fecha(r.t), r.w || '', r.e || T('No identificada'), pais(r.p), r.m ? T(r.m) : '', T(ESTADO[r.s] || 'Sin cortar')]) });
    return {
      marca: '/ NÚCLEO', titulo: T('Resumen de mis datos'),
      subtitulo: d.titulo + ' · ' + d.rango + ' · ' + pon('Generado: {1}', fecha(d.generado || Date.now())),
      resumen: [[fmt(d.conexiones), T('Conexiones')], [fmt(d.cortes), T('Cortes'), 1], [fmt(d.empresas.total), T('Empresas')], [fmt(d.paises.total), T('Países')]],
      secciones,
      final: T('Este resumen muestra lo que el navegador ZERO ha registrado en este navegador durante ese periodo. No es un inventario de todos tus datos personales ni de toda tu actividad en internet.') + ' ' + T('Estos registros se guardan solo en este navegador y puedes borrarlos desde NÚCLEO.'),
      pie: 'GUARDIANA · NÚCLEO · ' + T('Resumen de mis datos'), archivo: 'GUARDIANA-resumen-' + d.periodo + '.pdf',
    };
  }
  // todo el texto del documento, para saber si el idioma cabe en el PDF de verdad (si no, la ventana de imprimir)
  const textoDe = (doc) => [doc.titulo, doc.subtitulo, doc.final, ...doc.resumen.map((x) => x[1]), ...doc.secciones.flatMap((x) => [x.titulo, x.nota || '', ...x.cols.map((c) => T(c.t)), ...x.filas.flat()])].join(' ');
  function imprimeResumen(doc) {
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const tabla = (x) => {
      if (!x.filas.length) return '';
      const cab = x.cols.some((c) => c.t) ? `<thead><tr>${x.cols.map((c) => `<th${c.der ? ' class="n"' : ''}>${esc(T(c.t))}</th>`).join('')}</tr></thead>` : '';
      return `<h2>${esc(x.titulo)}</h2>${x.nota ? `<p class="sub">${esc(x.nota)}</p>` : ''}<table>${cab}<tbody>${x.filas.map((f) => `<tr>${f.map((v, i) => `<td${x.cols[i].der ? ' class="n"' : ''}>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    };
    const lang = (window.GuardianaIdioma && GuardianaIdioma.lang) || 'es', dir = /^(ar|fa|he|ur)$/.test(lang) ? 'rtl' : 'ltr';
    const html = `<!doctype html><html lang="${esc(lang)}" dir="${dir}"><head><meta charset="utf-8"><title>GUARDIANA · ${esc(doc.titulo)}</title><style>
@page{size:A4;margin:16mm 14mm}*{box-sizing:border-box}body{font:10.5pt/1.45 'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#0B0F14;margin:0}
.k{font:600 8.5pt/1 'IBM Plex Mono',Consolas,monospace;letter-spacing:.28em;color:#3a6b93;text-transform:uppercase;margin:0}
h1{font-weight:400;font-size:22pt;margin:14pt 0 8pt}.sub{color:#45505c;margin:0 0 18pt}
.cifras{display:flex;gap:22pt;margin:0 0 8pt;padding:12pt 14pt;border:1px solid #d6dde4;border-radius:8pt}.cifras b{display:block;font-size:20pt;font-weight:500}.cifras b.r{color:#c0503f}.cifras span{font-size:8pt;color:#45505c;text-transform:uppercase;letter-spacing:.08em}
h2{font-size:12pt;margin:16pt 0 6pt;padding-bottom:3pt;border-bottom:1px solid #d6dde4}
table{width:100%;border-collapse:collapse;font-size:9pt}th,td{text-align:start;padding:3pt 4pt;border-bottom:1px solid #eef1f4;vertical-align:top}th{font-weight:600;color:#45505c}.n{text-align:end;white-space:nowrap}tr{break-inside:avoid}
.nota{margin-top:16pt;padding:8pt 10pt;background:#f3f6f9;border-radius:6pt;font-size:8.5pt;color:#45505c}
</style></head><body>
<p class="k">GUARDIANA · NÚCLEO</p><h1>${esc(doc.titulo)}</h1><p class="sub">${esc(doc.subtitulo)}</p>
<div class="cifras">${doc.resumen.map(([n, et, r]) => `<div><b${r ? ' class="r"' : ''}>${esc(n)}</b><span>${esc(et)}</span></div>`).join('')}</div>
${doc.secciones.map(tabla).join('')}<p class="nota">${esc(doc.final)}</p></body></html>`;
    const f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1;
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.append(f);
    const dd = f.contentDocument; dd.open(); dd.write(html); dd.close();
    setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (_) {} setTimeout(() => f.remove(), 120000); }, 250);
    return true;
  }
  const sinPeriodo = (periodo, formato) => ({ t: 'No hay nada registrado en ese periodo. Prueba con otro.', c: PERIODOS.filter(([p]) => p !== periodo).map(([p, l]) => ({ l, id: 'res-' + p, extra: { formato } })) });
  // ---------- el resultado (PDF o vídeo): siempre la misma tarjeta, con su nombre, su periodo y sus botones ----------
  // Dueño, 14:42: «cuando le das a PDF, a vídeo, cómo guardarlo, dónde aparece… todo en orden, milimétrico». El resultado
  // aparece aquí, en la conversación; nada se descarga solo: «Descargar» lo guarda en la carpeta de descargas del equipo.
  const URLS = new Set();
  const ICO_RES = { pdf: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>', video: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M10.5 9.6v4.8l4.2-2.4z"/>' };
  const etiquetaPeriodo = (periodo) => { const x = PERIODOS.find(([p]) => p === periodo); return x ? T(x[1]) : ''; };
  const metaDe = (periodo, ...xs) => [etiquetaPeriodo(periodo), ...xs].filter(Boolean).join(' · ');
  function boton(texto, op) {
    op = op || {};
    const b = document.createElement(op.href ? 'a' : 'button'); b.className = 'nr-b' + (op.prim ? ' nr-prim' : ''); b.textContent = T(texto);
    if (op.href) { b.href = op.href; if (op.archivo) b.download = op.archivo; if (op.nueva) { b.target = '_blank'; b.rel = 'noopener'; } } else b.type = 'button';
    return b;
  }
  // ronda 63: la tarjeta ocupa el sitio del paso que la pidió (el «Un momento…» de la espera) y es un paso más de la guía
  function tarjeta(tipo, periodo, paso) {
    const b = document.createElement('div');
    b.className = 'nuc-b el ns-paso nuc-res'; b.dataset.tipo = tipo;
    b.innerHTML = '<span class="nq" translate="no">NÚCLEO</span><p class="nuc-bt ns-foco" tabindex="-1"></p>'
      + '<div class="nr-ficha"><span class="nr-ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICO_RES[tipo] + '</svg></span><span class="nr-txt"><b></b><small></small></span></div>'
      + '<div class="nr-cuerpo"></div><div class="nr-acc"></div><p class="nr-nota" hidden></p>';
    b.querySelector('.nr-txt b').textContent = T('Resumen de mis datos');
    b.querySelector('.nr-txt small').textContent = metaDe(periodo, tipo === 'pdf' ? 'PDF' : T('Vídeo'));
    cambiaNodo(paso, b);
    return { b, txt: b.querySelector('.nuc-bt'), meta: b.querySelector('.nr-txt small'), cuerpo: b.querySelector('.nr-cuerpo'), acc: b.querySelector('.nr-acc'), nota: b.querySelector('.nr-nota') };
  }
  const notaDescarga = (k) => { k.nota.textContent = T('Al descargarlo, se guarda en la carpeta de descargas de tu equipo.'); k.nota.hidden = false; };
  const NO_RESUMEN = { t: 'No he podido preparar el resumen. Inténtalo de nuevo.', c: [{ l: 'Hacer otro resumen', id: 'resumen' }] };
  async function resumenPdf(periodo, t, paso) {
    let G; try { G = await moduloResumen(); } catch (_) { return NO_RESUMEN; }
    if (t !== turno) return null; // la persona ya está en otro paso
    const d = G.datos(periodo, T, loc());
    if (!d) return sinPeriodo(periodo, 'pdf');
    const doc = docResumen(d, G);
    if (window.ZeroPdf && ZeroPdf.crea && ZeroPdf.cabe(textoDe(doc))) {
      try {
        const { blob, paginas } = ZeroPdf.crea(doc, T), url = URL.createObjectURL(blob); URLS.add(url);
        const k = tarjeta('pdf', periodo, paso); k.b.dataset.url = url;
        k.txt.textContent = T('Listo: aquí tienes el resumen en PDF.');
        k.meta.textContent = metaDe(periodo, 'PDF', pon(paginas === 1 ? '{1} página' : '{1} páginas', fmt(paginas)));
        k.acc.append(boton('Abrir', { href: url, nueva: true, prim: true }), boton('Descargar', { href: url, archivo: doc.archivo }));
        notaDescarga(k); pasoResultado(k.b);
        return null;
      } catch (e) { console.warn('PDF', e); }
    }
    // el idioma no cabe en el PDF de verdad: el mismo documento, por la ventana de imprimir
    const k = tarjeta('pdf', periodo, paso);
    k.txt.textContent = T('Listo: aquí tienes el resumen en PDF.');
    const b = boton('Imprimir o guardar como PDF', { prim: true }); b.addEventListener('click', () => imprimeResumen(doc)); k.acc.append(b);
    k.nota.textContent = T('En la ventana de imprimir, elige «Guardar como PDF».'); k.nota.hidden = false; pasoResultado(k.b);
    return null;
  }
  // el vídeo: se ve hacerse en su tarjeta (unos 20 s) y queda en ella para verlo y descargarlo; uno a la vez (irse de su
  // paso lo cancela)
  let grabando = null;
  async function resumenVideo(periodo, t, paso) {
    let G; try { G = await moduloResumen(); } catch (_) { return NO_RESUMEN; }
    if (t !== turno) return null;
    if (grabando) { try { grabando.ab.abort(); } catch (_) {} grabando = null; }
    const d = G.datos(periodo, T, loc());
    if (!d) return sinPeriodo(periodo, 'video');
    if (!G.formato()) return { t: 'Este navegador no puede grabar vídeo.', c: [{ l: 'Resumen de mis datos en PDF', id: 'res-' + periodo, extra: { formato: 'pdf' } }] };
    const k = tarjeta('video', periodo, paso);
    k.txt.textContent = T('Preparo el vídeo. Tarda unos 20 segundos.');
    k.cuerpo.innerHTML = '<div class="nv-marco"><canvas class="nv-lienzo" width="1280" height="720" aria-hidden="true"></canvas>'
      + '<div class="nv-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></div>';
    const marco = k.cuerpo.querySelector('.nv-marco'), barra = k.cuerpo.querySelector('.nv-barra');
    const cancela = boton('Cancelar'); k.acc.append(cancela);
    const ab = new AbortController(); grabando = { ab, b: k.b, periodo };
    cancela.addEventListener('click', () => ab.abort());
    try {
      const r = await G.video(d, { T, loc: loc(), lienzo: k.cuerpo.querySelector('canvas'), signal: ab.signal, onProgreso: (x) => { const n = Math.round(x * 100); barra.firstChild.style.width = n + '%'; barra.setAttribute('aria-valuenow', String(n)); } });
      const url = URL.createObjectURL(r.blob); URLS.add(url); k.b.dataset.url = url;
      const v = document.createElement('video'); v.className = 'nv-video'; v.controls = true; v.playsInline = true; v.preload = 'metadata'; v.src = url;
      // la portada del vídeo: el cuadro del título, no el primer cuadro (casi negro)
      try { const pc = document.createElement('canvas'); await G.cartel(d, 2.6, { T, loc: loc(), lienzo: pc }); v.poster = pc.toDataURL('image/jpeg', 0.86); } catch (_) {}
      marco.replaceChildren(v);
      k.txt.textContent = T('Listo: aquí tienes el vídeo. También puedes descargarlo.');
      const seg = Math.round(r.duracion || G.duracion || 0);
      k.meta.textContent = metaDe(periodo, T('Vídeo'), seg ? pon('{1} s', fmt(seg)) : '');
      k.acc.replaceChildren(boton('Descargar', { href: url, archivo: r.nombre, prim: true }));
      notaDescarga(k); pasoResultado(k.b);
      return null;
    } catch (e) {
      // si se canceló por irse de este paso, la guía ya está en otro y esto no se enseña (el turno ha cambiado)
      if (e && e.codigo === 'cancelado') return { t: 'Se ha cancelado el vídeo.', c: [{ l: 'Hacer otro resumen', id: 'resumen' }] };
      if (e && (e.codigo === 'sin-grabadora' || e.codigo === 'sin-formato')) return { t: 'Este navegador no puede grabar vídeo.', c: [{ l: 'Resumen de mis datos en PDF', id: 'res-' + periodo, extra: { formato: 'pdf' } }] };
      return { t: 'No se ha podido grabar el vídeo.', c: [{ l: 'Resumen de mis datos en PDF', id: 'res-' + periodo, extra: { formato: 'pdf' } }] };
    } finally { if (grabando && grabando.ab === ab) grabando = null; }
  }

  // ---------- textos ----------
  const AYUDA = {
    zero: 'ZERO es el navegador de GUARDIANA: la web se abre en una burbuja aislada en un servidor de GUARDIANA y a tu equipo solo llegan imágenes. A la derecha, la Radiografía te enseña quién intenta conectarse, las subastas de tus datos y lo que puedes cortar.',
    orbita: 'Órbita es el planeta de GUARDIANA: cables submarinos, cables terrestres, centros de datos y satélites, y cada corte en directo.',
    com: 'Comunicaciones es el chat y el envío de archivos de GUARDIANA, encriptados de un equipo al otro con un código de 9 cifras. Está pensado para particulares y para profesionales que envían a sus clientes datos y documentación sensible. El servidor no puede leer tus mensajes ni tus archivos, y yo tampoco.',
  };
  const ETQ = {
    zero: 'Ir al navegador ZERO', planeta: 'Explorar el planeta', com: 'Chat encriptado', datos: 'Ver lo que se ha cortado', 'que-es-guardiana': '¿Qué es GUARDIANA?',
    'z-web': 'Ir a una web con el navegador ZERO', 'z-buscar': 'Buscar en internet', 'z-radio': 'Ver la Radiografía de una web', 'z-pdf': 'PDF de la web abierta', 'r-que': '¿Qué es la Radiografía?', resumen: 'Resumen de mis datos', 'res-pdf': 'Resumen de mis datos en PDF', 'res-video': 'Resumen de mis datos en vídeo', 'z-que': '¿Cómo funciona el navegador ZERO?', 'z-tor': 'Navegar con Tor',
    'p-sub': 'Cables submarinos', 'p-fibra': 'Cables terrestres', 'p-puntos': 'Centros de datos', 'p-sat': 'Satélites', 'p-capas': 'Cables, centros de datos o satélites', 'p-pais': 'Ir a un país', 'p-directo': 'Cortes en directo', 'p-que': '¿Qué es Órbita?',
    'c-crear': 'Crear una invitación', 'c-codigo': 'Tengo un código', 'c-que': 'Cómo funciona Comunicaciones',
    'd-corte': '¿Qué es un corte?', borrar: 'Borrar mis datos de este navegador', privacidad: 'Privacidad', seguridad: '¿Es seguro?', vpn: '¿Es una VPN?', precio: 'Precio', cuenta: '¿Necesito una cuenta?', idioma: 'Idioma', contacto: 'Hablar con una persona',
  };
  // El menú principal de la guía (dueño, 15:35–15:38: «guiado al 100 %, sin opción de escribir») y «¿Qué puedo pedir?» salen
  // de aquí: el mismo árbol (ronda 63: nunca dos menús que se contradigan). Seis opciones con palabras de la calle, primero
  // lo que se viene a hacer y al final descubrir y la ayuda; después, como mucho cuatro opciones por pregunta.
  const GRUPOS = [
    ['nav', 'Navegar por internet', 'Abre webs y busca con el navegador ZERO, y decide qué rastreo se corta.', 'buscar', ['z-web', 'z-buscar', 'z-tor', 'z-que']],
    ['rad', 'Ver quién me rastrea', 'En cada web, qué empresas reciben datos de tu visita y de qué países.', 'ojo', ['z-radio', 'z-pdf', 'r-que', 'd-corte']],
    ['dat', 'Ver mis datos', 'Lo que el navegador ZERO ha cortado. Se guarda solo en este navegador.', 'datos', ['datos', 'res-pdf', 'res-video', 'borrar']],
    ['com', 'Hablar y enviar archivos', 'Chatea y manda archivos encriptados a otra persona.', 'chat', ['c-crear', 'c-codigo', 'c-que']],
    ['orb', 'Explorar el planeta', 'Mira por dónde viaja internet: cables, centros de datos y satélites.', 'planeta', ['p-pais', 'p-capas', 'p-directo']],
    ['gua', 'Ayuda y dudas', 'Qué es GUARDIANA, si es seguro, el precio o hablar con una persona.', 'ayuda', ['que-es-guardiana', 'seguridad', 'precio', 'contacto']],
  ];
  const ICONOS = {
    ojo: '<path d="M2.8 12s3.4-6 9.2-6 9.2 6 9.2 6-3.4 6-9.2 6-9.2-6-9.2-6z"/><circle cx="12" cy="12" r="2.8"/>',
    ayuda: '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.6a2.4 2.4 0 1 1 3.3 2.2c-.6.3-1 .8-1 1.5v.6"/><path d="M12 16.6v.2"/>',
    buscar: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L20 20"/>',
    informe: '<path d="M6.5 3h8l4 4v14h-12z"/><path d="M14.5 3v4h4M9.5 12h6M9.5 16h6"/>',
    datos: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20c1.3-3.6 4-5.3 7.2-5.3s5.9 1.7 7.2 5.3"/>',
    chat: '<path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v8a1.5 1.5 0 0 1-1.5 1.5H11l-4.5 3.5V16h-1A1.5 1.5 0 0 1 4 14.5z"/><path d="M10 10.5h4"/>',
    planeta: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.5 3.5 5.3 3.5 8.5s-1.1 6-3.5 8.5c-2.4-2.5-3.5-5.3-3.5-8.5s1.1-6 3.5-8.5z"/>',
    escudo: '<path d="M12 3l7 2.8v5.6c0 4.3-2.9 7.9-7 9.6-4.1-1.7-7-5.3-7-9.6V5.8z"/><path d="M9 12l2.1 2.1L15.2 10"/>',
  };
  const CAPA_TXT = { 'p-sub': 'los cables submarinos', 'p-fibra': 'los cables terrestres', 'p-puntos': 'los centros de datos', 'p-sat': 'los satélites' };
  const nombrePais = (k) => { try { return new Intl.DisplayNames([loc()], { type: 'region' }).of(k); } catch (_) { return k; } };
  const corta = (s) => (s.length > 40 ? s.slice(0, 38) + '…' : s);

  // Lo que responde y hace NÚCLEO a cada intención (rondas 53 y 54: solo lo que confirman al menos dos voces).
  // t: texto · x: filas de explicación · c: opciones (ids o {l, f}) · a: acción · va: la acción lleva a otro sitio · modo: qué espera
  function respuesta(r, frase) {
    const id = r.id, capa = CAPA_TXT[id];
    if (capa) return r.pais ? { t: pon('Te llevo al planeta: {1} en {2}.', T(capa), nombrePais(r.pais)), a: () => alPlaneta(id.slice(2), r.pais), va: true } : { t: pon('Te llevo al planeta y enciendo {1}.', T(capa)), a: () => alPlaneta(id.slice(2)), va: true };
    // cada grupo del menú: su línea de explicación y sus opciones
    if (/^m-/.test(id)) { const g = GRUPOS.find((x) => x[0] === id.slice(2)); if (g) return { intro: g[2], t: '¿Qué quieres hacer?', c: g[4] }; }
    switch (id) {
      case 'saludo': return { t: 'Hola, soy NÚCLEO. ¿Quieres navegar, explorar el planeta o usar el chat encriptado?', c: ['zero', 'planeta', 'com'] };
      case 'despedida': return { t: 'Hasta luego. Puedes volver cuando quieras.' };
      case 'gracias': return { t: 'De nada. ¿Quieres hacer algo más?' };
      case 'menu': case 'atras': return { t: 'Te llevo al inicio.', a: () => { cierraSala(); muestraInicio(true); }, va: true };
      case 'ayuda': return { t: 'Esto es lo que puedes pedirme. Pulsa una opción o escríbelo a tu manera.', a: () => panel(true) };
      case 'quien-eres': return { t: 'Soy NÚCLEO, la guía de GUARDIANA: entiendo peticiones concretas y te llevo a cada parte. No soy una IA generativa y no guardo lo que me pides.' };
      case 'que-es-guardiana': return { x: [['Navegador ZERO', 'Navegar viendo qué empresas reciben datos de tu visita.'], ['Órbita', 'Ver por dónde viajan tus datos en el planeta.'], ['Comunicaciones', 'Hablar y enviar archivos encriptados con otra persona.']], t: '¿Por dónde empezamos?', c: ['zero', 'planeta', 'com'] };
      case 'zero': return { t: 'Abro el navegador ZERO: escribe una dirección o lo que quieras buscar.', a: () => abreZero(), va: true };
      // dueño, 10:55: «cuando pregunta para abrir una web, mejor que no la abras tú: llévalo al navegador y él decide con qué
      // buscador (Google, Brave, Tor). Lo justo y sencillo.» Abrir una web, buscar y la Radiografía llevan al navegador ZERO.
      case 'z-web': case 'z-buscar': case 'z-radio': return { t: 'Abro el navegador ZERO.', a: () => abreZero(), va: true };
      case 'z-pdf': return hayWeb() ? { t: 'Preparo el PDF con lo que el navegador ZERO ha visto en esta web.', a: pdfWeb, va: true } : { t: 'Para el PDF de una web, ábrela primero en el navegador ZERO. Si quieres el de tus datos, pídeme el resumen.', c: ['zero', 'resumen'] };
      case 'resumen': case 'res-pdf': case 'res-video': case 'res-web': case 'res-hora': case 'res-24h': return pideResumen(r);
      case 'z-que': return { t: AYUDA.zero, c: ['z-web', 'z-radio'] };
      case 'z-tor': return { t: 'Abro el navegador ZERO: en el selector del buscador, elige Tor. Con Tor se corta más.', a: () => abreZero(null, { tor: true }), va: true };
      case 'r-que': return { t: 'La Radiografía está a la derecha del navegador ZERO: te enseña quién intenta conectarse, las subastas de tus datos y lo que puedes cortar.', c: ['z-radio', 'd-corte'] };
      case 'planeta': return { t: 'Te llevo al planeta: cables submarinos, cables terrestres, centros de datos, satélites y cortes en directo.', a: () => alPlaneta(), va: true };
      case 'p-pais': return r.pais ? { t: pon('Te llevo al planeta, a {1}.', nombrePais(r.pais)), a: () => alPlaneta(null, r.pais), va: true } : { t: '¿A qué país te llevo?', c: paisesGuia().map((k) => ({ l: nombrePais(k), id: 'p-pais', extra: { pais: k }, nt: true })), paises: true, modo: 'pais' };
      case 'p-capas': return { t: '¿Qué quieres ver?', c: ['p-sub', 'p-fibra', 'p-puntos', 'p-sat'] };
      case 'p-directo': return { t: 'Te llevo al planeta: a la derecha, en EN DIRECTO, aparece cada corte.', a: () => alPlaneta(), va: true };
      case 'p-caidas': return { t: 'No sigo caídas de internet. En Órbita, los cortes en directo son las conexiones que GUARDIANA corta mientras navegas. ¿Te los enseño?', c: ['p-directo'] };
      case 'p-que': return { t: AYUDA.orbita, c: ['p-sub', 'p-sat', 'p-pais'] };
      case 'com': return { t: 'Abro Comunicaciones: chat y archivos encriptados de extremo a extremo.', a: irComunicaciones, va: true };
      case 'c-crear': return { t: 'Abro Comunicaciones: pulsa «Crear invitación» y dale el código a la otra persona.', a: () => irComunicaciones('crear'), va: true };
      case 'c-codigo': return { t: 'Abro Comunicaciones: pulsa «Tengo un código» y escribe las 9 cifras.', a: () => irComunicaciones('codigo'), va: true };
      case 'c-que': return { t: AYUDA.com, c: ['c-crear', 'c-codigo'] };
      case 'datos': return { x: [['Qué es', 'Lo que el navegador ZERO ha cortado mientras navegabas: qué empresas y de qué países.'], ['Dónde está', 'Solo en este navegador.']], t: misDatos(), c: hayAlgo() ? ['resumen', 'borrar'] : ['z-web'] };
      case 'd-corte': return { t: 'Un corte es una conexión de otra empresa que el navegador ZERO no deja pasar. Por defecto, todo pasa y tú decides qué cortar; con Tor, se corta más.', c: ['datos'] };
      case 'borrar': return hayAlgo() ? { t: '¿Borro lo que el navegador ZERO ha guardado aquí: cortes, empresas, países y Radiografías? No borra nada de otras webs ni de otros equipos.', c: [{ l: 'Sí, borrar', id: 'borrar-si' }, { l: 'No', id: 'borrar-no' }], modo: 'confirma-borrar' } : { t: 'No hay nada que borrar: el navegador ZERO todavía no ha guardado cortes aquí.' };
      case 'borrar-si': borraDatos(); return { t: 'Hecho: he borrado «Mis datos» de este navegador.', fin: true };
      case 'borrar-no': return { t: 'De acuerdo, no borro nada.', fin: true };
      case 'privacidad': return { t: 'NÚCLEO no guarda lo que le pides. Lo que corta el navegador ZERO («Mis datos») se guarda solo en este navegador, y puedes borrarlo cuando quieras.', c: ['datos', 'borrar'] };
      // ronda 63: como mucho cuatro opciones en «Ayuda y dudas»: la seguridad y la privacidad van juntas; el precio y la cuenta, también
      case 'seguridad': return { x: [['¿Es seguro?', 'El navegador ZERO abre la web lejos de tu equipo: a tu equipo solo llegan imágenes. Eso reduce riesgos, pero ninguna herramienta protege de todo.'], ['Privacidad', 'NÚCLEO no guarda lo que le pides. Lo que corta el navegador ZERO («Mis datos») se guarda solo en este navegador, y puedes borrarlo cuando quieras.']], t: '¿Qué quieres hacer?', c: ['vpn', 'z-que'] };
      case 'vpn': return { t: 'ZERO no es una VPN: es un navegador aislado. La web se abre en un servidor de GUARDIANA y a tu equipo solo llegan imágenes.', c: ['zero'] };
      case 'precio': return { x: [['Precio', 'Hoy GUARDIANA no cobra nada.']], t: 'No necesitas crear una cuenta para usar el navegador ZERO, Órbita ni Comunicaciones. ¿A cuál quieres entrar?', c: ['zero', 'planeta', 'com'] };
      case 'idioma': return { t: 'GUARDIANA está en 42 idiomas; las páginas de información, en español, inglés y portugués. ¿Cuál prefieres?', c: [{ l: 'Español', id: 'idioma-es', nt: true }, { l: 'English', id: 'idioma-en', nt: true }, { l: 'Português', id: 'idioma-pt', nt: true }] };
      // tras cambiar de idioma, la guía sigue en el idioma nuevo, desde el menú principal
      case 'idioma-es': case 'idioma-en': case 'idioma-pt': idioma(id.slice(-2)); return { t: '¿Qué quieres hacer?', menu: true };
      case 'cuenta': return { t: 'No necesitas crear una cuenta para usar el navegador ZERO, Órbita ni Comunicaciones. ¿A cuál quieres entrar?', c: ['zero', 'planeta', 'com'] };
      case 'contacto': return { t: 'Puedes escribir a hola@guardianagroup.com: lo lee una persona.', enlace: ['mailto:hola@guardianagroup.com', 'hola@guardianagroup.com'] };
      // lo delicado (rondas 53 y 54)
      case 'clave': return { t: 'No escribas contraseñas aquí: NÚCLEO no las necesita y no guarda lo que escribes.' };
      case 'banco': return { t: 'No compartas datos del banco ni de tarjetas aquí. Hoy GUARDIANA no cobra nada.' };
      case 'hackear': return { t: 'No ayudo a entrar en cuentas, redes o equipos ajenos. Puedo ayudarte a navegar aislado con el navegador ZERO o a usar el chat encriptado.', c: ['zero', 'com'] };
      case 'robada': return { t: 'Usa la recuperación oficial de ese servicio y cambia tus contraseñas desde su web. Si quieres, te llevo al navegador ZERO.', c: ['zero'] };
      case 'peligro': return { t: 'Si estás en peligro, llama ya a emergencias o a la policía de tu país. NÚCLEO no puede hacer esa llamada.' };
      case 'autolesion': return { t: 'Siento que estés pasando por esto. Si piensas en hacerte daño, llama ahora a emergencias o a una línea de ayuda de tu país; hablar con alguien ayuda.' };
      case 'espian': return { t: 'No puedo revisar tu equipo. Con el navegador ZERO, las webs se abren fuera de tu equipo y en la Radiografía ves quién intenta seguirte.', c: ['z-que', 'z-web'] };
      case 'insulto': return { t: 'Perdona si no te he entendido. Dime si quieres navegar, ver el planeta o usar el chat encriptado.', c: ['zero', 'planeta', 'com'] };
      case 'estafa': return { t: 'Entiendo tu desconfianza. Hoy GUARDIANA no cobra nada, no necesitas cuenta y NÚCLEO no guarda lo que le escribes.', c: ['privacidad', 'contacto'] };
      case 'salud': return { t: 'No doy consejos de salud: un profesional sanitario puede orientarte.' };
      default: return null;
    }
  }
  function idioma(l) { try { if (window.GuardianaIdioma) GuardianaIdioma.pon(l); } catch (_) {} }
  // el resumen: primero el periodo, luego PDF o vídeo (lo que ya venga en la frase no se vuelve a preguntar)
  let pedido = { periodo: null, formato: null };
  function pideResumen(r) {
    const id = r.id;
    if (id === 'resumen') pedido = { periodo: r.periodo || null, formato: r.formato || null };
    else if (id === 'res-pdf' || id === 'res-video') { pedido.formato = id === 'res-pdf' ? 'pdf' : 'video'; if (r.periodo) pedido.periodo = r.periodo; }
    else { pedido.periodo = id.slice(4); if (r.formato) pedido.formato = r.formato; }
    if (!hayAlgo()) { pedido = { periodo: null, formato: null }; return { t: 'Todavía no hay nada registrado en este navegador. Abre una web con el navegador ZERO y vuelve a pedirme el resumen.', c: ['z-web'] }; }
    if (!pedido.periodo) return { t: '¿De qué periodo quieres el resumen?', c: PERIODOS.map(([p, l]) => ({ l, id: 'res-' + p })), modo: 'res-periodo' };
    if (!pedido.formato) return { t: '¿En PDF o en vídeo?', c: [{ l: 'PDF', id: 'res-pdf', nt: true }, { l: 'Vídeo', id: 'res-video' }], modo: 'res-formato' };
    const { periodo, formato } = pedido; pedido = { periodo: null, formato: null };
    return { luego: (t, paso) => (formato === 'video' ? resumenVideo(periodo, t, paso) : resumenPdf(periodo, t, paso)), formato, periodo };
  }

  // NÚCLEO tapa la pantalla entera (fondo opaco): mientras tanto el planeta de Órbita no se dibuja (menos batería y el vídeo
  // del resumen se graba fluido); orbita.js mira window.OrbitaTapada en cada cuadro.
  function tapa(si) { window.OrbitaTapada = si === undefined ? true : !!si; }

  // ---------- la portada ----------
  let ini = null, laRed = null;
  function construyeInicio() {
    const d = document.createElement('section');
    d.className = 'nuc-ini'; d.id = 'nuc-ini'; d.setAttribute('aria-label', 'NÚCLEO, la entrada de GUARDIANA');
    d.innerHTML = '<canvas class="nuc-lienzo" aria-hidden="true"></canvas>'
      + '<p class="nuc-k nuc-paso" translate="no">NÚCLEO</p>'
      + '<h1 class="nuc-paso" id="nuc-saludo">Toma el control de tus datos</h1>' // dueño, 09:42 y 09:49
      + '<p class="nuc-sub nuc-paso" id="nuc-sub"><b>¿Qué deseas hacer?</b></p>'
      + '<div class="nuc-ops nuc-paso" id="nuc-ops" role="group" aria-label="Qué deseas hacer">'
      + '<button type="button" class="nuc-op" data-n="zero"><i>ZERO</i><b>Navegar con ZERO</b><small>Entra en cualquier web y mira qué empresas reciben datos de tu visita.</small></button>'
      + '<button type="button" class="nuc-op" data-n="planeta"><i>ÓRBITA</i><b>Explorar el planeta</b><small>Cables submarinos, cables terrestres, centros de datos, satélites y cortes en directo.</small></button>'
      + '<button type="button" class="nuc-op" data-n="com"><i>COMUNICACIONES</i><b>Chat y archivos encriptados</b><small>Para particulares y profesionales: datos y documentación sensible, encriptados de extremo a extremo.</small></button>'
      // 31 Oct 2026: el Escáner PC (static/escaner.js), solo dentro del programa para Windows (marcaPortada la enseña)
      + '<button type="button" class="nuc-op" data-n="escaner" hidden><i>ESCÁNER PC</i><b>Escanear este equipo</b><small>Revisa a fondo antivirus, cámara, micrófono, control remoto y lo que este equipo envía fuera.</small></button>'
      // dueño, 10:00: «añade uno más: pedir las cosas»; ronda 54: «Pídeselo a NÚCLEO»; dueño, 14:08: «Habla con NÚCLEO»
      + '<button type="button" class="nuc-op nuc-op-n" data-n="nucleo"><i translate="no">NÚCLEO</i><b>Habla con NÚCLEO</b><small>Pídele que te lleve al navegador ZERO, que consulte tus datos o que prepare resúmenes en PDF o en vídeo.</small></button>'
      + '</div>'
      // dueño, 12:23: la página del planeta es la portada de la web y su «Empezar» trae aquí; fuera «¿Qué es GUARDIANA?».
      // Arriba a la izquierda, «Volver» a esa portada (dueño, 10:53: «tienes que poder ir y volver»).
      + '<a class="nuc-volver nuc-paso" id="nuc-volver" href="/"><span aria-hidden="true">←</span> Volver</a>'
      // dueño, 13:30: arriba a la derecha, «Multas» en rojo: las multas a las grandes empresas por usar nuestros datos
      + '<a class="nuc-multas-b nuc-paso" id="nuc-multas-b" href="/orbita/multas/?desde=nucleo">Multas</a>'; // 14:02: su propia página
    document.body.append(d);
    d.querySelectorAll('.nuc-op').forEach((b) => b.addEventListener('click', () => entra(b.dataset.n)));
    // si se vino de la portada, se vuelve atrás en el historial: la página del planeta queda donde estaba
    const vv = d.querySelector('#nuc-volver');
    vv.addEventListener('click', (e) => { try { const r = document.referrer ? new URL(document.referrer) : null; if (r && r.origin === location.origin && (r.pathname === '/' || r.pathname === '/index.html') && history.length > 1) { e.preventDefault(); history.back(); } } catch (_) {} });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') alPlaneta(); });
    return d;
  }
  function entra(id) { if (id !== 'nucleo') ponVuelta('portada'); if (id === 'zero') abreZero(); else if (id === 'planeta') alPlaneta(); else if (id === 'com') irComunicaciones(); else if (id === 'nucleo') abreSala(); else if (id === 'escaner') { cierraTodo(); if (window.OrbitaEscaner) window.OrbitaEscaner.abre({ volver: 'nucleo' }); } }
  function revela(d, todo) {
    const pasos = [...d.querySelectorAll('.nuc-paso')];
    if (todo || matchMedia('(prefers-reduced-motion: reduce)').matches) { pasos.forEach((p) => p.classList.add('ve')); return; }
    const tiempos = [900, 2100, 2700, 3300];
    pasos.forEach((p, i) => setTimeout(() => p.classList.add('ve'), tiempos[Math.min(i, tiempos.length - 1)]));
  }
  function muestraInicio(rapido) {
    if (!ini) { ini = construyeInicio(); marcaPortada(); }
    ini.hidden = false; ini.classList.remove('sale'); tapa();
    if (laRed) laRed.para(); laRed = red(ini.querySelector('.nuc-lienzo'), { nace: !rapido });
    revela(ini, !!rapido);
    botonInicio(false);
  }
  function ocultaInicio() {
    if (!sala || sala.hidden) botonInicio(true);
    if (!ini || ini.hidden) return;
    ini.classList.add('sale'); tapa(sala && !sala.hidden);
    setTimeout(() => { if (!ini.classList.contains('sale')) return; ini.hidden = true; if (laRed) { laRed.para(); laRed = null; } }, 750);
  }

  // ---------- la sección de NÚCLEO: pedirle las cosas (ronda 54) ----------
  let sala = null, salaRed = null, modo = null;
  function construyeSala() {
    const s = document.createElement('section');
    s.className = 'nuc-sala vacia'; s.id = 'nuc-sala'; s.hidden = true; s.setAttribute('aria-label', 'NÚCLEO');
    // dueño, 11:00–11:01: fuera «Pídeselo a NÚCLEO» y el «NÚCLEO» de arriba; NÚCLEO no abre webs, te lleva al navegador ZERO
    s.innerHTML = '<header class="ns-cab"><button type="button" class="ns-boton" id="ns-inicio"><span aria-hidden="true">←</span> Inicio</button>'
      // dueño, 14:12: «¿Qué puedo pedir?» «muy desordenado; más profesional»: ocupa el sitio de la conversación, con seis
      // tarjetas iguales en dos columnas y una fila por opción; abierto, el botón dice «Cerrar». Ronda 63: el idioma, arriba
      // (donde se busca siempre), en vez de una opción de la guía; fuera «Nueva conversación» (lo hace «Menú principal»).
      + '<div class="ns-der"><button type="button" class="ns-boton ns-idioma" id="ns-idioma" translate="no"></button>'
      + '<button type="button" class="ns-boton ns-ayuda" id="ns-ayuda" aria-expanded="false" aria-controls="ns-panel"><span class="na-abre">¿Qué puedo pedir?</span>'
      + '<span class="na-cierra"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>Cerrar</span></button></div></header>'
      + '<div class="ns-panel" id="ns-panel" role="region" aria-labelledby="np-t" hidden><div class="np-in"><div class="np-cab"><h2 id="np-t">¿Qué puedo pedir?</h2>'
      + '<p>Toca una opción y NÚCLEO te guía paso a paso.</p></div><div class="np-grid"></div>'
      + '<p class="ns-contacto"><a href="mailto:hola@guardianagroup.com" translate="no">hola@guardianagroup.com</a> · <span>Responde una persona.</span></p></div></div>'
      // ronda 63: una sola pregunta a la vez; encima, el camino («Estás aquí»); debajo, «← Atrás» y «Menú principal»
      + '<div class="ns-cuerpo" id="ns-cuerpo"><div class="ns-col">'
      + '<div class="ns-hola"><canvas class="ns-red" aria-hidden="true"></canvas>'
      + '<p>Hola, soy NÚCLEO. Te guío paso a paso: toca una opción y siempre podrás volver atrás.</p></div>'
      + '<nav class="ns-migas" id="ns-migas" aria-label="Estás aquí" hidden></nav>'
      + '<p class="ns-aviso" id="ns-aviso" role="status" hidden></p>'
      + '<div class="ns-charla" id="ns-charla"></div>'
      + '<div class="ns-guia" id="ns-guia" hidden><button type="button" class="ns-atras" id="ns-atras"><span aria-hidden="true">←</span> Atrás</button>'
      + '<button type="button" class="ns-menu-b" id="ns-menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.4 12 5l8 6.4"/><path d="M6.5 9.6V19h11V9.6"/></svg>Menú principal</button></div>'
      + '</div></div>'
      // dueño, 16:47: «dejamos hablar a quien ya sabe lo que quiere» (las dos voces de la ronda 63 lo pedían): la caja de
      // escribir vuelve, abajo; la guía sigue siendo lo primero
      + '<div class="ns-pie"><form class="ns-form" id="ns-form" autocomplete="off"><input id="ns-q" type="text" maxlength="200" placeholder="Escribe qué quieres hacer…" aria-label="Habla con NÚCLEO" enterkeyhint="send"><button type="submit">Enviar</button></form>'
      + '<p class="ns-nota">NÚCLEO entiende peticiones concretas y no guarda lo que le pides.</p></div>';
    document.body.append(s);
    const p = s.querySelector('#ns-panel'), rejilla = p.querySelector('.np-grid');
    for (const [k, g, , ico, ids0] of GRUPOS) {
      const ids = ids0.filter((x) => x !== 'contacto'); // el contacto va al pie del panel
      const sec = document.createElement('section'); sec.className = 'np-grupo';
      const h = document.createElement('h3'); h.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[ico] + '</svg>';
      const ht = document.createElement('span'); ht.textContent = g; h.append(ht); sec.append(h);
      const ul = document.createElement('ul'); ul.className = 'np-lista';
      for (const id of ids) {
        const li = document.createElement('li'), b = document.createElement('button'), t = document.createElement('span');
        b.type = 'button'; b.className = 'np-op'; b.dataset.op = id; t.textContent = ETQ[id] || id; b.append(t);
        b.addEventListener('click', () => { panel(false); desdePanel(k, id); }); li.append(b); ul.append(li);
      }
      sec.append(ul); rejilla.append(sec);
    }
    s.querySelector('#ns-inicio').addEventListener('click', alInicio);
    s.querySelector('#ns-atras').addEventListener('click', atras);
    s.querySelector('#ns-menu').addEventListener('click', () => menu());
    s.querySelector('#ns-idioma').addEventListener('click', cambiaIdioma);
    s.querySelector('#ns-ayuda').addEventListener('click', () => panel(p.hidden));
    p.addEventListener('scroll', () => bordes(p), { passive: true });
    // escrito y no entendido, el texto se queda (seleccionado) para cambiarlo; entendido, se borra
    s.querySelector('#ns-form').addEventListener('submit', (e) => { e.preventDefault(); const i = s.querySelector('#ns-q'); panel(false); if (escribe(i.value)) i.value = ''; else if (i.value.trim()) { i.focus(); i.select(); } });
    s.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (e.target && e.target.id === 'ns-q' && e.target.value) { e.target.value = ''; return; } // Escape en la caja: primero la vacía
      if (!p.hidden) panel(false); else if (pasos.length > 1) atras(); else alInicio();
    });
    return s;
  }
  // elegir en «¿Qué puedo pedir?» deja el mismo camino que la guía: Menú principal › el grupo › la opción
  function desdePanel(k, id) {
    const g = GRUPOS.find((x) => x[0] === k); if (!g) return;
    menu(); elige('m-' + k, T(g[1])); elige(id, T(ETQ[id] || id));
  }
  // el idioma (ronda 63: arriba): español ↔ inglés, y la guía vuelve a empezar en el idioma nuevo
  const idiomaAhora = () => { try { return (window.GuardianaIdioma && GuardianaIdioma.lang) || 'es'; } catch (_) { return 'es'; } };
  function pintaIdioma() { const b = sala && sala.querySelector('#ns-idioma'); if (!b) return; const en = idiomaAhora() === 'en'; b.textContent = en ? 'Español' : 'English'; b.lang = en ? 'es' : 'en'; }
  function cambiaIdioma() { idioma(idiomaAhora() === 'en' ? 'es' : 'en'); pintaIdioma(); limpia(); }
  // el idioma de la página puede ponerse después de abrir NÚCLEO (al cargar): el botón y el camino, al día
  addEventListener('guardiana-idioma', () => { pintaIdioma(); if (sala && pasos.length > 1) migas(); });
  // al desplazar el panel, sus bordes se funden: arriba si hay algo encima; abajo si queda más por ver
  function bordes(p) { p.classList.toggle('np-sube', p.scrollTop > 2); p.classList.toggle('np-baja', p.scrollTop + p.clientHeight < p.scrollHeight - 2); }
  function panel(abre) {
    if (!sala) return; const p = sala.querySelector('#ns-panel'), b = sala.querySelector('#ns-ayuda');
    p.hidden = !abre; b.setAttribute('aria-expanded', String(!!abre)); sala.classList.toggle('con-panel', !!abre);
    if (abre) { p.scrollTop = 0; bordes(p); const x = p.querySelector('.np-op'); if (x) x.focus({ preventScroll: true }); }
    else if (pasos.length) foco();
  }
  // dueño, 14:42: «quieres volver atrás…»: la sección de NÚCLEO tiene su paso en el historial (?nucleo=pide), así que la
  // flecha de atrás del navegador vuelve a la portada de NÚCLEO en vez de salir de GUARDIANA; «Inicio» hace lo mismo
  let apilada = false;
  const enHistoria = () => !!(history.state && history.state.nucleo === 'sala');
  function ponEnHistoria() {
    if (enHistoria()) return;
    try { const u = new URL(location.href); u.searchParams.set('nucleo', 'pide'); u.hash = ''; history.pushState(Object.assign({}, history.state || {}, { nucleo: 'sala' }), '', u.pathname + u.search); apilada = true; } catch (_) {}
  }
  function quitaDeHistoria() {
    try { const u = new URL(location.href); if (!enHistoria() && !u.searchParams.has('nucleo')) return; u.searchParams.delete('nucleo'); const st = Object.assign({}, history.state || {}); delete st.nucleo; history.replaceState(st, '', u.pathname + u.search + u.hash); } catch (_) {}
  }
  function alInicio() {
    if (apilada && enHistoria()) { history.back(); return; } // el «popstate» de abajo cierra la sección
    cierraSala(); quitaDeHistoria(); muestraInicio(true);
  }
  addEventListener('popstate', () => {
    if (document.body.classList.contains('dentro')) return; // una sección de Órbita abierta: la lleva orbita.js
    if (enHistoria()) { if ((!sala || sala.hidden) && ini && !ini.hidden) abreSala(false); }
    else if (sala && !sala.hidden) { apilada = false; cierraSala(); muestraInicio(true); }
  });
  // camino: el de la guía antes de irse a otra página (Comunicaciones), para volver al mismo paso
  function abreSala(apila, camino) {
    if (!sala) sala = construyeSala();
    if (!sala.hidden) return;
    if (apila !== false && !PUERTA_EN_URL) ponEnHistoria();
    if (ini && !ini.hidden) ocultaInicio();
    sala.hidden = false; botonInicio(false); tapa();
    if (salaRed) salaRed.para(); salaRed = red(sala.querySelector('.ns-red'), { nace: false });
    pintaIdioma();
    try { sessionStorage.removeItem(CAMINO); } catch (_) {}
    if (!pasos.length) { menu(true); if (camino) reconstruye(camino); }
    // ronda 63: al volver, el mismo paso y una línea que lo dice
    if (pasos.length > 1) aviso('Has vuelto a NÚCLEO. Sigue donde lo dejaste.');
    fuera = false;
    setTimeout(foco, 60);
  }
  function cierraSala() {
    if (!sala || sala.hidden) return;
    sala.hidden = true; panel(false); modo = null; tapa(!!(ini && !ini.hidden && !ini.classList.contains('sale')));
    if (salaRed) { salaRed.para(); salaRed = null; }
    if (!ini || ini.hidden) botonInicio(true);
  }
  // ---------- la guía (dueño, 14:42: «el chat sigue multiplicando chat… ordénalo milimétrico»; 14:55: «ultra fácil»; 15:35–15:38:
  // «guiado al 100 %, para que la persona no se pierda en ningún momento; una guía perfecta», «sin opción de escribir»).
  // Ronda 63 (las dos voces): no es un chat que se alarga, sino una sola pregunta a la vez que cambia en el mismo sitio, como la
  // pantalla de un cajero:
  // 1. Encima, el camino («Menú principal › Ver mis datos › Resumen en PDF»); cada paso anterior se puede tocar para volver.
  // 2. Debajo, siempre a mano, «← Atrás» (deshace el último paso y recuerda lo elegido) y «Menú principal».
  // 3. Como mucho cuatro opciones por pregunta después del menú; una pregunta por paso (el periodo y el formato, por separado).
  // 4. Lo que lleva a otro sitio (navegador ZERO, el planeta, Comunicaciones) va directo; al volver, el mismo paso y «Has
  //    vuelto a NÚCLEO». 5. El PDF y el vídeo salen en su tarjeta, que es un paso más. 6. Lo que no se puede deshacer
  //    (borrar) se confirma, y «Sí» o «No» devuelven a la lista de la que se vino, diciendo lo que ha pasado.
  let pasos = [];    // la pila de la guía: [{ id, l: lo que dice el camino, extra, o: lo que enseña, b: su tarjeta, pedido }]
  let turno = 0;     // cambia con cada paso: lo que llega tarde (un PDF, un vídeo) no pisa la pregunta nueva
  let fuera = false; // la persona se fue a otro sitio desde la guía
  const CAMINO = 'nucleo-camino';
  const charla = () => sala.querySelector('#ns-charla');
  const actual = () => pasos[pasos.length - 1] || null;
  const suelta = (x) => {
    if (!x || !x.dataset) return;
    if (x.dataset.url) { URL.revokeObjectURL(x.dataset.url); URLS.delete(x.dataset.url); delete x.dataset.url; }
    if (grabando && grabando.b === x) { try { grabando.ab.abort(); } catch (_) {} grabando = null; }
  };
  function aviso(txt) { const a = sala.querySelector('#ns-aviso'); a.textContent = T(txt); a.hidden = false; }
  function quitaAviso() { const a = sala && sala.querySelector('#ns-aviso'); if (a && !a.hidden) { a.hidden = true; a.textContent = ''; } }
  // el foco va a la pregunta nueva: quien usa lector de pantalla la oye; con teclado, el siguiente Tab es la primera opción
  function foco() { const p = actual(), h = p && p.b && p.b.querySelector('.ns-foco'); if (h && sala && !sala.hidden && !sala.classList.contains('con-panel') && h.isConnected) h.focus({ preventScroll: true }); }
  // ensena: enseña una tarjeta en el sitio de la pregunta (las demás quedan guardadas en la pila, fuera de la página)
  function ensena(b) {
    const c = charla();
    for (const x of [...c.children]) if (x !== b) x.remove();
    if (b.parentNode !== c) c.append(b);
    sala.classList.toggle('vacia', pasos.length <= 1);
    migas(); guia();
    // la caja de escribir dice qué se espera en este paso (el país, si lo pregunta)
    const q = sala.querySelector('#ns-q'); if (q) q.placeholder = T(modo === 'pais' ? 'Escribe el país' : 'Escribe qué quieres hacer…');
    sala.querySelector('#ns-cuerpo').scrollTop = 0;
    if (!sala.hidden) foco();
  }
  // «Estás aquí»: con más de cuatro pasos, el principio, «…» y los dos últimos
  function migas() {
    const n = sala.querySelector('#ns-migas');
    n.replaceChildren(); n.hidden = pasos.length <= 1;
    if (n.hidden) return;
    const ol = document.createElement('ol'), todos = pasos.map((p, i) => ({ i, l: i === 0 ? T('Menú principal') : p.l }));
    const ver = todos.length > 4 ? [todos[0], null, ...todos.slice(-2)] : todos;
    for (const it of ver) {
      const li = document.createElement('li');
      if (!it) { li.textContent = '…'; li.setAttribute('aria-hidden', 'true'); }
      else if (it.i === pasos.length - 1) { const s = document.createElement('span'); s.textContent = it.l; s.setAttribute('aria-current', 'step'); li.append(s); }
      else { const b = document.createElement('button'); b.type = 'button'; b.textContent = it.l; b.addEventListener('click', () => vuelveA(it.i)); li.append(b); }
      ol.append(li);
    }
    n.append(ol);
  }
  // «← Atrás» y «Menú principal»: en cada paso menos en el menú; «Atrás» no sale tras lo que no se puede deshacer
  function guia() {
    const raiz = pasos.length <= 1, p = actual();
    sala.querySelector('#ns-guia').hidden = raiz;
    sala.querySelector('#ns-atras').hidden = raiz || !!(p && p.o && p.o.fin);
  }
  const PAISES_GUIA = { es: ['CO', 'MX', 'ES', 'AR', 'PE', 'US'], en: ['US', 'GB', 'CA', 'AU', 'IN', 'IE'], pt: ['BR', 'PT', 'US', 'ES', 'AR', 'MX'] };
  function paisesGuia() {
    const C = (window.OrbitaPlaneta && OrbitaPlaneta.centros) || {}, l = idiomaAhora().slice(0, 2);
    let L = (PAISES_GUIA[l] || ['US', 'GB', 'DE', 'FR', 'ES', 'BR']).slice();
    try { const r = (navigator.language || '').split('-')[1]; if (r && /^[A-Z]{2}$/.test(r)) L = [r, ...L.filter((x) => x !== r)]; } catch (_) {}
    return L.filter((k) => !Object.keys(C).length || C[k]).slice(0, 6);
  }
  // las opciones de un paso: filas grandes, una debajo de otra; lo elegido queda marcado para cuando se vuelva atrás
  function ponOpciones(p, o) {
    const f = document.createElement('div'); f.className = 'ns-opciones';
    const marca = (b) => { f.querySelectorAll('.ns-elegida').forEach((x) => x.classList.remove('ns-elegida')); b.classList.add('ns-elegida'); };
    if (o.menu) {
      // el menú principal: seis tarjetas (icono, título y una línea), en dos columnas
      f.classList.add('ns-menu-ops');
      for (const [k, g, linea, ico] of GRUPOS) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'ns-gran'; b.dataset.op = 'm-' + k;
        b.innerHTML = '<span class="ng-ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[ico] + '</svg></span><span class="ng-txt"><b></b><small></small></span>';
        b.querySelector('b').textContent = T(g); b.querySelector('small').textContent = T(linea);
        b.addEventListener('click', () => { marca(b); elige('m-' + k, T(g)); });
        f.append(b);
      }
      p.append(f); return;
    }
    const filas = document.createElement('div'); filas.className = 'ns-filas';
    for (const x of o.c || []) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ns-fila-op';
      const t = document.createElement('span'), cadena = typeof x === 'string';
      const id = cadena ? x : x.id, l = cadena ? T(ETQ[x] || x) : (x.nt ? x.l : T(x.l));
      t.textContent = l; if (!cadena && x.nt) t.setAttribute('translate', 'no');
      if (id) b.dataset.op = id;
      b.addEventListener('click', () => { marca(b); if (id) elige(id, l, cadena ? null : x.extra); else if (x.f) x.f(); });
      b.append(t); filas.append(b);
    }
    if (o.paises) {
      // «Ir a un país»: seis países habituales y, para los demás, una lista (sin escribir)
      const sel = document.createElement('select'); sel.className = 'ns-sel'; sel.setAttribute('aria-label', T('Otro país'));
      const op0 = document.createElement('option'); op0.value = ''; op0.textContent = T('Otro país…'); sel.append(op0);
      const C = (window.OrbitaPlaneta && OrbitaPlaneta.centros) || {};
      Object.keys(C).filter((k) => /^[A-Z]{2}$/.test(k)).map((k) => [k, nombrePais(k)]).sort((a, b) => a[1].localeCompare(b[1], loc()))
        .forEach(([k, n]) => { const o2 = document.createElement('option'); o2.value = k; o2.textContent = n; sel.append(o2); });
      sel.setAttribute('translate', 'no');
      sel.addEventListener('change', () => { if (sel.value) elige('p-pais', sel.options[sel.selectedIndex].textContent, { pais: sel.value }); });
      filas.append(sel);
    }
    if (filas.children.length) f.append(filas);
    p.append(f);
  }
  // la tarjeta de un paso: lo que explica NÚCLEO y su pregunta (si solo explica y hay opciones, «¿Qué quieres hacer?»)
  function pinta(o) {
    const p = document.createElement('div'); p.className = 'nuc-b el ns-paso' + (o.menu ? ' ns-menu' : '') + (o.espera ? ' ns-espera' : '');
    if (o.menu) {
      const h = document.createElement('h2'); h.className = 'nuc-bt ns-preg ns-foco'; h.tabIndex = -1; h.textContent = T(o.t); p.append(h);
      ponOpciones(p, o); return p;
    }
    const k = document.createElement('span'); k.className = 'nq'; k.setAttribute('translate', 'no'); k.textContent = 'NÚCLEO'; p.append(k);
    if (o.intro) { const i = document.createElement('p'); i.className = 'ns-intro'; i.textContent = T(o.intro); p.append(i); }
    if (o.x && o.x.length) { const dl = document.createElement('dl'); dl.className = 'nuc-x'; for (const [a, v] of o.x) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = T(a); dd.textContent = T(v); dl.append(dt, dd); } p.append(dl); }
    const pregunta = /[¿?]/.test(o.t || ''), hay = !!((o.c && o.c.length) || o.paises);
    const tx = document.createElement(pregunta ? 'h2' : 'p'); tx.className = 'nuc-bt ns-foco' + (pregunta ? ' ns-preg' : ''); tx.tabIndex = -1; tx.textContent = T(o.t || ''); p.append(tx);
    if (o.enlace) { const a = document.createElement('a'); a.href = o.enlace[0]; a.textContent = o.enlace[1]; a.className = 'ns-enlace'; a.setAttribute('translate', 'no'); p.append(a); }
    if (!pregunta && hay) { const h = document.createElement('h2'); h.className = 'nuc-bt ns-preg'; h.textContent = T('¿Qué quieres hacer?'); p.append(h); }
    if (hay) ponOpciones(p, o);
    return p;
  }
  const ctx = () => ({ modo, pais: paisEn, hayWeb: hayWeb() });
  function calcula(r, frase) {
    if (r.quiza) return { t: '¿Quisiste decir…?', c: r.quiza };
    if (r.nada) return { t: 'Elige una de estas opciones.', menu: true };
    return respuesta(r, frase) || { t: 'Elige una de estas opciones.', menu: true };
  }
  // un paso nuevo: su tarjeta, apuntada en la pila de la guía
  function muestra(o, entrada) {
    if (o.menu) { pasos.forEach((q) => suelta(q.b)); pasos = []; }
    const b = pinta(o);
    pasos.push(Object.assign({}, entrada || {}, { o, b, pedido: Object.assign({}, pedido) }));
    modo = o.modo || null;
    ensena(b);
    if (o.a) o.a();
    return b;
  }
  // lo de un paso cambia (el resumen ya está, o no se pudo): la misma posición en la pila, otra tarjeta
  function cambiaNodo(paso, b) { const viejo = paso.b; paso.b = b; if (viejo !== b) { const enPantalla = !!(viejo && viejo.isConnected); suelta(viejo); if (enPantalla) ensena(b); } }
  function cambia(paso, x) { paso.o = x; modo = x.modo || null; cambiaNodo(paso, pinta(x)); }
  function ejecuta(o, entrada) {
    if (salaRed) salaRed.habla();
    if (o.luego) {
      // el resumen: mientras se prepara, «Un momento…» en su sitio; luego, su tarjeta
      const t = ++turno; modo = null;
      const paso = Object.assign({}, entrada || {}, { o: { resultado: true }, b: pinta({ t: 'Un momento: preparo el resumen.', espera: true }), pedido: { periodo: null, formato: null } });
      pasos.push(paso); ensena(paso.b);
      o.luego(t, paso).then((x) => { if (t === turno && x) cambia(paso, x); }, () => { if (t === turno) cambia(paso, NO_RESUMEN); });
      return;
    }
    turno++; muestra(o, entrada);
  }
  // tras un resultado (PDF o vídeo), su siguiente paso dentro de la misma tarjeta
  function pasoResultado(b) {
    const o = { c: [{ l: 'Hacer otro resumen', id: 'resumen' }] };
    ponOpciones(b, o); const x = b.querySelector('.ns-opciones'); if (x) x.classList.add('ns-en-tarjeta');
    const p = pasos.find((q) => q.b === b); if (p) p.o = Object.assign({}, p.o, o);
  }
  // «Menú principal»: las seis opciones (la misma tarjeta, con lo último elegido marcado); al entrar, se crea
  function menu(primero) {
    quitaAviso(); turno++;
    if (!primero && salaRed) salaRed.habla();
    pedido = { periodo: null, formato: null }; modo = null;
    if (!primero && pasos.length && pasos[0].o.menu) { while (pasos.length > 1) suelta(pasos.pop().b); ensena(pasos[0].b); return; }
    muestra({ t: '¿Qué quieres hacer?', menu: true });
  }
  // volver a un paso anterior (el camino de arriba o «← Atrás»): se descarta lo que vino después y se recupera lo elegido
  function vuelveA(i) {
    if (i <= 0) { menu(); return; }
    quitaAviso(); turno++;
    while (pasos.length > i + 1) suelta(pasos.pop().b);
    const p = actual(); pedido = Object.assign({}, p.pedido); modo = p.o.modo || null;
    ensena(p.b);
  }
  function atras() { vuelveA(pasos.length - 2); }
  // ir a otro sitio: directo, sin mensajes; se guarda el camino por si es otra página (Comunicaciones), para volver al mismo paso
  function vaAOtroSitio(o) {
    modo = null; ponVuelta('nucleo'); fuera = true;
    try { sessionStorage.setItem(CAMINO, JSON.stringify({ t: Date.now(), c: pasos.slice(1).filter((p) => p.id && !(p.o && p.o.resultado)).map((p) => ({ id: p.id, l: p.l, extra: p.extra || null })) })); } catch (_) {}
    o.a();
  }
  // al volver de otra página: se rehace el camino, paso a paso, sin repetir nada que haga algo (ni resúmenes ni borrar)
  function reconstruye(cam) {
    if (!cam || !Array.isArray(cam.c) || !(Date.now() - (cam.t || 0) < 3600e3)) return;
    const NO = new Set(['borrar-si', 'borrar-no', 'idioma-es', 'idioma-en', 'idioma-pt']);
    for (const e of cam.c) {
      if (!e || typeof e.id !== 'string' || NO.has(e.id)) break;
      const ex = e.extra && typeof e.extra === 'object' ? e.extra : null;
      const o = calcula(Object.assign({ id: e.id }, ex || {}));
      if (!o || o.va || o.luego || o.menu || o.a) break;
      muestra(o, { id: e.id, l: String(e.l || ''), extra: ex });
    }
  }
  // un botón (de la guía o de «¿Qué puedo pedir?»)
  function elige(id, etiqueta, extra) {
    if (!sala || sala.hidden) abreSala();
    quitaAviso();
    // «No» al borrar: nada cambia y se vuelve a donde se estaba, diciéndolo
    if (id === 'borrar-no') { atras(); aviso('De acuerdo, no borro nada.'); return; }
    const o = calcula(Object.assign({ id }, extra || {}));
    if (o.va && o.a) { vaAOtroSitio(o); return; }
    // «Sí, borrar»: hecho (no se puede deshacer), y de vuelta a la lista de la que se vino, con lo que ha pasado
    if (id === 'borrar-si') { atras(); const p = actual(); if (p && p.id === 'datos') cambia(p, calcula({ id: 'datos' })); aviso(o.t); return; }
    ejecuta(o, { id, l: etiqueta || T(ETQ[id] || id), extra: extra || null });
  }
  // escribir (dueño, 16:47: «dejamos hablar a quien ya sabe lo que quiere»; ronda 63, las dos voces): la misma guía, por otro
  // camino. Lo que contesta a la pregunta abierta es como tocar su botón; lo demás va a su sitio del árbol, como desde «¿Qué
  // puedo pedir?» (Menú principal › el grupo › lo pedido); si duda, «¿Quisiste decir…?»; si no lo entiende, no se pierde nada:
  // una línea lo dice y la pregunta sigue ahí. Devuelve si lo ha entendido (la caja se vacía o no).
  const GRUPO_DE = { resumen: 'dat', 'res-web': 'dat', 'res-hora': 'dat', 'res-24h': 'dat', privacidad: 'gua', cuenta: 'gua', vpn: 'gua', zero: 'nav', planeta: 'orb', com: 'com', 'p-que': 'orb', 'p-sub': 'orb', 'p-fibra': 'orb', 'p-puntos': 'orb', 'p-sat': 'orb', 'p-caidas': 'orb' };
  const grupoDe = (id) => GRUPOS.find((x) => x[4].includes(id)) || GRUPOS.find((x) => x[0] === GRUPO_DE[id]) || null;
  function escribe(frase) {
    const f = String(frase || '').trim(); if (!f) return false;
    if (!sala || sala.hidden) abreSala();
    quitaAviso();
    let r = null; try { r = window.NucleoMotor ? NucleoMotor.entiende(f, ctx()) : null; } catch (_) {}
    if (!r || r.nada || (!r.id && !r.quiza)) { aviso('No te he entendido. Prueba a escribirlo de otra manera o toca una opción.'); return false; }
    // en el camino de arriba, lo escrito (nunca si parece un dato: correo, tarjeta, número largo)
    const dicho = '«' + (/@|\d{4,}/.test(f) ? '…' : corta(f)) + '»';
    if (r.quiza) { turno++; muestra({ t: '¿Quisiste decir…?', c: r.quiza.slice(0, 4) }, { id: null, l: dicho, extra: null }); return true; }
    if (r.id === 'atras') { atras(); return true; }
    if (r.id === 'menu') { menu(); return true; }
    if (r.id === 'ayuda') { panel(true); return true; }
    if (r.id === 'gracias' || r.id === 'despedida') { aviso(respuesta(r).t); return true; }
    const ex = Object.assign({}, r); delete ex.id; delete ex.s;
    const extra = Object.keys(ex).length ? ex : null, etq = ETQ[r.id] ? T(ETQ[r.id]) : dicho;
    // contesta a la pregunta abierta (el periodo, el país, «sí» al borrar…): como tocar su botón
    const p = actual(), boton = p && p.b ? p.b.querySelector(`[data-op="${r.id}"]`) : null;
    if (boton) {
      // queda marcado como si se hubiera tocado (para cuando se vuelva atrás) y el camino dice lo mismo que el botón
      p.b.querySelectorAll('.ns-elegida').forEach((x) => x.classList.remove('ns-elegida')); if (!r.pais) boton.classList.add('ns-elegida');
      elige(r.id, r.pais ? nombrePais(r.pais) : boton.textContent, extra); return true;
    }
    // si no, a su sitio del árbol
    const g = grupoDe(r.id);
    menu(); if (g) elige('m-' + g[0], T(g[1]));
    elige(r.id, etq, extra);
    return true;
  }
  // todo como al entrar (el vídeo en marcha se cancela y los archivos hechos se sueltan)
  function limpia() {
    turno++; if (grabando) { try { grabando.ab.abort(); } catch (_) {} grabando = null; }
    pasos.forEach((q) => suelta(q.b)); pasos = [];
    for (const u of URLS) URL.revokeObjectURL(u); URLS.clear();
    charla().replaceChildren(); pedido = { periodo: null, formato: null }; modo = null;
    panel(false); quitaAviso(); menu(true);
  }
  // de vuelta con la flecha del navegador desde otra página (la página se recupera tal cual): la línea de «Has vuelto»
  addEventListener('pageshow', (e) => { if (e.persisted && fuera && sala && !sala.hidden && pasos.length > 1) { fuera = false; aviso('Has vuelto a NÚCLEO. Sigue donde lo dejaste.'); try { sessionStorage.removeItem(CAMINO); } catch (_) {} } });

  // ---------- los países que conoce el planeta, en español, inglés, portugués y el idioma de la página ----------
  let PAISES = null;
  function paises() {
    if (PAISES) return PAISES;
    const C = (window.OrbitaPlaneta && OrbitaPlaneta.centros) || {};
    if (!Object.keys(C).length) return [];
    PAISES = [];
    const dns = ['es', 'en', 'pt', loc()].map((l) => { try { return new Intl.DisplayNames([l], { type: 'region' }); } catch (_) { return null; } }).filter(Boolean);
    for (const k of Object.keys(C)) { if (!/^[A-Z]{2}$/.test(k)) continue; const vistos = new Set(); for (const d of dns) { let n = ''; try { n = d.of(k); } catch (_) {} n = sinTildes(n); if (n && n.length > 2 && !vistos.has(n)) { vistos.add(n); PAISES.push([n, k]); } } }
    PAISES.push(['eeuu', 'US'], ['ee uu', 'US'], ['usa', 'US'], ['reino unido', 'GB'], ['inglaterra', 'GB']);
    PAISES.sort((a, b) => b[0].length - a[0].length);
    return PAISES;
  }
  function paisEn(t) { for (const [n, k] of paises()) { if (n.length < 3) continue; const i = t.indexOf(n); if (i >= 0 && !/[a-z]/.test(t[i - 1] || ' ') && !/[a-z]/.test(t[i + n.length] || ' ')) return k; } return null; }
  try { if (window.NucleoMotor && window.NUCLEO_FRASES) NucleoMotor.prepara(window.NUCLEO_FRASES, window.NUCLEO_CLAVES); } catch (_) {}

  // ---------- dueño, 13:28: fuera el botón «NÚCLEO» de abajo a la izquierda del planeta. Para volver queda, arriba a la
  // izquierda, el mismo botón de las secciones («Inicio» o «Regresar a NÚCLEO»); en el planeta lleva a NÚCLEO. ----------
  function botonInicio(ver) { const v = document.getElementById('volver'); if (v && !document.body.classList.contains('dentro')) v.hidden = !ver; }
  document.addEventListener('click', (e) => {
    const v = e.target && e.target.closest ? e.target.closest('#volver') : null;
    if (!v || document.body.classList.contains('dentro')) return; // dentro de una sección, vuelve al planeta como siempre
    e.preventDefault(); e.stopImmediatePropagation();
    if (vuelta() === 'nucleo') abreSala(); else muestraInicio(true);
  }, true);

  // ---------- dueño, 10:02 («que se vea todo limpio»): al cerrar una sección se vuelve a la portada, salvo con «Verme en
  // Órbita» (lleva al planeta con tu ficha) o cuando es NÚCLEO quien lleva al planeta. El botón de volver dice «Inicio». ----------
  let verme = 0, volviendo = 0, estabaDentro = document.body.classList.contains('dentro');
  addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.tipo === 'orbita-verme') verme = Date.now(); });
  new MutationObserver(() => {
    const d = document.body.classList.contains('dentro');
    if (estabaDentro && !d) setTimeout(() => { if (document.body.classList.contains('dentro')) return; if (Date.now() - verme > 1500 && Date.now() - volviendo > 1500) { if (vuelta() === 'nucleo') abreSala(); else muestraInicio(true); } else botonInicio(true); }, 60);
    estabaDentro = d;
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  function pintaVuelta() {
    // dueño, 28 Oct 2026, 13:35: «Regresar a NÚCLEO… es demasiado grande. Solamente con que sea atrás es suficiente»
    const nuc = vuelta() === 'nucleo', txt = nuc ? 'Atrás' : 'Inicio';
    const vb = document.getElementById('volver'); if (vb) for (const n of vb.childNodes) if (n.nodeType === 3 && n.data.trim()) n.data = txt;
    try { const w = marcoZero(); const s = w && w.document.querySelector('#volverZ span'); if (s && s.textContent !== txt) s.textContent = txt; } catch (_) {}
  }
  pintaVuelta();

  // ---------- arranque: la primera vez en esta visita, con su nacimiento; al volver en la misma visita, al momento ----------
  let visto = false; try { visto = sessionStorage.getItem('guardiana-nucleo') === '1'; sessionStorage.setItem('guardiana-nucleo', '1'); } catch (_) {}
  // el camino de la guía, si se volvió de otra página (Comunicaciones): se lee una vez y se borra
  let camino = null; try { camino = JSON.parse(sessionStorage.getItem(CAMINO) || 'null'); sessionStorage.removeItem(CAMINO); } catch (_) {}
  if (q.get('nucleo') === 'pide') { try { history.replaceState(Object.assign({}, history.state || {}, { nucleo: 'sala' }), ''); } catch (_) {} abreSala(false, vuelta() === 'nucleo' ? camino : null); }
  else if (q.get('nucleo') === '0' || PUERTA_EN_URL) botonInicio(true);
  else muestraInicio(visto);
  window.GuardianaNucleo = { inicio: () => muestraInicio(true), sala: () => abreSala(), pide: escribe };
})();
