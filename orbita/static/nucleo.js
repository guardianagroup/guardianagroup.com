// GUARDIANA · NÚCLEO (27 Oct 2026). La puerta de entrada de GUARDIANA y su guía en toda la web.
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
  const PUERTA_EN_URL = /^#(zero|radiografias|comunicaciones|mi-conexion)$/.test(location.hash);
  const red = (lienzo, op) => (window.RedNucleo ? window.RedNucleo(lienzo, op) : { habla() {}, para() {} });

  // ---------- acciones reales ----------
  function marcoZero() { try { const m = document.getElementById('marco'); if (m && !m.hidden && m.contentWindow && /\/zero\//.test(m.contentWindow.location.pathname)) return m.contentWindow; } catch (_) {} return null; }
  const hayWeb = () => { try { const w = marcoZero(); return !!(w && w.document.querySelector('#stage.open')); } catch (_) { return false; } };
  function cierraTodo() { cierraSala(); ocultaInicio(); }
  function abreZero(web) {
    cierraTodo();
    if (!marcoZero() && window.OrbitaPuertas) OrbitaPuertas.abre('zero');
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
  const irComunicaciones = () => { location.href = 'comunicaciones/'; };
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
    if (!hoy.length && !total) return T('Todavía no hay datos: en cuanto abras una web con ZERO y cortes algo, aquí te cuento qué empresas eran y de qué países. Se guarda solo en este navegador.');
    let s = hoy.length ? pon('Hoy, en este equipo: cortes {1} · empresas {2} · países {3}.', fmt(hoy.length), fmt(emp.size), fmt(pai.size)) : T('Hoy todavía no se ha cortado nada en este equipo.');
    if (total) s += ' ' + pon('Desde que usas ZERO, cortes en total: {1}.', fmt(total));
    if (hoy.length) { const c = new Map(); hoy.forEach((r) => c.set(r.e, (c.get(r.e) || 0) + 1)); const top = [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e).filter(Boolean); if (top.length) s += ' ' + pon('Las que más lo han intentado: {1}.', top.join(', ')); }
    return s + ' ' + T('Se guarda solo en este navegador.');
  }
  function borraDatos() {
    for (const k of ['zeroRegistroCortes', 'zeroTotal', 'zeroRadiografia']) { try { localStorage.removeItem(k); } catch (_) {} }
    // ZERO lleva su registro también en memoria: si está abierto, se recarga para que no lo vuelva a escribir
    try { const m = document.getElementById('marco'); if (m && m.contentWindow && /\/zero\//.test(m.contentWindow.location.pathname)) m.contentWindow.location.reload(); } catch (_) {}
  }
  // «Resumen de mis datos» en PDF (ronda 54: título y alcance, total, por tipo, empresas, países, webs, el registro y la nota
  // de alcance). Se hace aquí, con lo que hay en este navegador, y se abre la ventana de imprimir para guardarlo como PDF.
  function resumenPdf() {
    const REG = registros(), total = totalCortes(), tot = lee('zeroTotal', null);
    if (!REG.length && !total) return false;
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fecha = (t) => { try { return new Date(t).toLocaleString(loc(), { dateStyle: 'medium', timeStyle: 'short' }); } catch (_) { return new Date(t).toISOString(); } };
    const cuenta = (f) => { const m = new Map(); for (const r of REG) { const k = f(r); if (!k) continue; m.set(k, (m.get(k) || 0) + 1); } return [...m.entries()].sort((a, b) => b[1] - a[1]); };
    const tabla = (titulo, col, filas) => (filas.length ? `<h2>${esc(T(titulo))}</h2><table><thead><tr><th>${esc(T(col))}</th><th class="n">${esc(T('Cortes'))}</th></tr></thead><tbody>${filas.slice(0, 25).map(([k, n]) => `<tr><td>${esc(k)}</td><td class="n">${fmt(n)}</td></tr>`).join('')}</tbody></table>` : '');
    const det = [...REG].sort((a, b) => b.t - a.t).slice(0, 1500);
    const empresas = cuenta((r) => r.e), paises = cuenta((r) => (r.p && r.p !== 'País no identificado' ? T(r.p) : null));
    const html = `<!doctype html><html lang="${esc((window.GuardianaIdioma && GuardianaIdioma.lang) || 'es')}"><head><meta charset="utf-8"><title>GUARDIANA · ${esc(T('Resumen de mis datos'))}</title><style>
@page{size:A4;margin:16mm 14mm}*{box-sizing:border-box}body{font:10.5pt/1.45 'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#0B0F14;margin:0}
.k{font:600 8.5pt/1 'IBM Plex Mono',Consolas,monospace;letter-spacing:.28em;color:#3a6b93;text-transform:uppercase;margin:0}
h1{font-weight:400;font-size:22pt;margin:6pt 0 2pt}.sub{color:#45505c;margin:0 0 10pt}
.cifras{display:flex;gap:22pt;margin:8pt 0 4pt;padding:10pt 12pt;border:1px solid #d6dde4;border-radius:8pt}.cifras b{display:block;font-size:20pt;font-weight:500}.cifras span{font-size:8pt;color:#45505c;text-transform:uppercase;letter-spacing:.08em}
h2{font-size:12pt;margin:16pt 0 6pt;padding-bottom:3pt;border-bottom:1px solid #d6dde4}
table{width:100%;border-collapse:collapse;font-size:9pt}th,td{text-align:start;padding:3pt 4pt;border-bottom:1px solid #eef1f4;vertical-align:top}th{font-weight:600;color:#45505c}.n{text-align:end;white-space:nowrap}tr{break-inside:avoid}
.nota{margin-top:16pt;padding:8pt 10pt;background:#f3f6f9;border-radius:6pt;font-size:8.5pt;color:#45505c}
</style></head><body>
<p class="k">GUARDIANA · NÚCLEO</p><h1>${esc(T('Resumen de mis datos'))}</h1>
<p class="sub">${esc(T('Cortes de ZERO guardados en este navegador'))} · ${esc(pon('Generado: {1}', fecha(Date.now())))}${tot && tot.d ? ' · ' + esc(pon('Desde el {1}', fecha(tot.d))) : ''}</p>
<div class="cifras"><div><b>${fmt(total)}</b><span>${esc(T('Cortes desde el primer día'))}</span></div><div><b>${fmt(empresas.length)}</b><span>${esc(T('Empresas'))}</span></div><div><b>${fmt(paises.length)}</b><span>${esc(T('Países'))}</span></div></div>
${tabla('Por tipo', 'Tipo', cuenta((r) => (r.m ? T(r.m) : null)))}${tabla('Empresas', 'Empresa', empresas)}${tabla('Países', 'País', paises)}${tabla('Webs donde pasó', 'Web', cuenta((r) => r.w))}
${det.length ? `<h2>${esc(T('Cortes registrados'))}</h2><table><thead><tr><th>${esc(T('Fecha y hora'))}</th><th>${esc(T('Web'))}</th><th>${esc(T('Empresa'))}</th><th>${esc(T('País'))}</th><th>${esc(T('Tipo'))}</th></tr></thead><tbody>${det.map((r) => `<tr><td>${esc(fecha(r.t))}</td><td>${esc(r.w)}</td><td>${esc(r.e)}</td><td>${esc(r.p ? T(r.p) : '')}</td><td>${esc(r.m ? T(r.m) : '')}</td></tr>`).join('')}</tbody></table>` : ''}
<p class="nota">${esc(T('Este resumen muestra los cortes registrados por ZERO en este navegador. No es un inventario de todos tus datos personales ni de toda tu actividad en internet.'))} ${esc(T('Estos registros se guardan solo en este navegador y puedes borrarlos desde NÚCLEO.'))}</p>
</body></html>`;
    const f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1;
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.append(f);
    const d = f.contentDocument; d.open(); d.write(html); d.close();
    setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (_) {} setTimeout(() => f.remove(), 120000); }, 250);
    return true;
  }

  // ---------- textos ----------
  const AYUDA = {
    zero: 'ZERO es el navegador de GUARDIANA: la web se abre en una burbuja aislada en un servidor de GUARDIANA y a tu equipo solo llegan imágenes. A la derecha, la Radiografía te enseña quién intenta conectarse, las subastas de tus datos y lo que puedes cortar.',
    orbita: 'Órbita es el planeta de GUARDIANA: cables submarinos, cables terrestres, centros de datos y satélites, y cada corte en directo.',
    com: 'Comunicaciones es el chat y el envío de archivos de GUARDIANA, encriptados de un equipo al otro con un código de 9 cifras. El servidor no puede leer tus mensajes ni tus archivos, y yo tampoco.',
  };
  const ETQ = {
    zero: 'Navegar con NÚCLEO', planeta: 'Explorar el planeta', com: 'Chat encriptado', datos: 'Mis datos', 'que-es-guardiana': '¿Qué es GUARDIANA?',
    'z-web': 'Abrir una web', 'z-buscar': 'Buscar en internet', 'z-radio': 'Ver la Radiografía', 'z-pdf': 'PDF de la web abierta', resumen: 'Resumen de mis datos en PDF', 'z-que': '¿Cómo funciona ZERO?', 'z-tor': 'Navegar con Tor',
    'p-sub': 'Cables submarinos', 'p-fibra': 'Cables terrestres', 'p-puntos': 'Centros de datos', 'p-sat': 'Satélites', 'p-pais': 'Ir a un país', 'p-directo': 'Cortes en directo', 'p-que': '¿Qué es Órbita?',
    'c-crear': 'Crear una invitación', 'c-codigo': 'Tengo un código', 'c-que': 'Cómo funciona Comunicaciones',
    'd-corte': '¿Qué es un corte?', borrar: 'Borrar mis datos de este navegador', privacidad: 'Privacidad', seguridad: '¿Es seguro?', vpn: '¿Es una VPN?', precio: 'Precio', cuenta: '¿Necesito una cuenta?', idioma: 'Idioma', contacto: 'Hablar con una persona',
  };
  const RAPIDAS = [['z-web', 'Abrir una web'], ['z-radio', 'Ver la Radiografía'], ['datos', 'Mis datos'], ['resumen', 'Resumen en PDF'], ['planeta', 'Explorar el planeta'], ['com', 'Chat encriptado']];
  const GRUPOS = [
    ['Navegar y buscar', ['z-web', 'z-buscar', 'z-tor', 'z-que']],
    ['Radiografía e informes', ['z-radio', 'z-pdf', 'resumen']],
    ['Mis datos', ['datos', 'd-corte', 'borrar']],
    ['Órbita', ['p-sub', 'p-fibra', 'p-puntos', 'p-sat', 'p-pais', 'p-directo']],
    ['Comunicaciones', ['c-crear', 'c-codigo', 'c-que']],
    ['GUARDIANA', ['que-es-guardiana', 'privacidad', 'seguridad', 'vpn', 'precio', 'cuenta', 'idioma', 'contacto']],
  ];
  const CAPA_TXT = { 'p-sub': 'los cables submarinos', 'p-fibra': 'los cables terrestres', 'p-puntos': 'los centros de datos', 'p-sat': 'los satélites' };
  const nombrePais = (k) => { try { return new Intl.DisplayNames([loc()], { type: 'region' }).of(k); } catch (_) { return k; } };
  const corta = (s) => (s.length > 40 ? s.slice(0, 38) + '…' : s);

  // Lo que responde y hace NÚCLEO a cada intención (rondas 53 y 54: solo lo que confirman al menos dos voces).
  // t: texto · x: filas de explicación · c: opciones (ids o {l, f}) · a: acción · va: la acción lleva a otro sitio · modo: qué espera
  function respuesta(r, frase) {
    const id = r.id, capa = CAPA_TXT[id];
    if (capa) return r.pais ? { t: pon('Te llevo al planeta: {1} en {2}.', T(capa), nombrePais(r.pais)), a: () => alPlaneta(id.slice(2), r.pais), va: true } : { t: pon('Te llevo al planeta y enciendo {1}.', T(capa)), a: () => alPlaneta(id.slice(2)), va: true };
    switch (id) {
      case 'saludo': return { t: 'Hola, soy NÚCLEO. ¿Quieres navegar, explorar el planeta o chatear encriptado?', c: ['zero', 'planeta', 'com'] };
      case 'despedida': return { t: 'Hasta luego. Puedes volver cuando quieras.' };
      case 'gracias': return { t: 'De nada. ¿Quieres hacer algo más?' };
      case 'menu': case 'atras': return { t: 'Te llevo al inicio.', a: () => { cierraSala(); muestraInicio(true); }, va: true };
      case 'ayuda': return { t: 'Esto es lo que puedes pedirme. Pulsa una opción o escríbelo a tu manera.', a: () => panel(true) };
      case 'quien-eres': return { t: 'Soy NÚCLEO, la guía de GUARDIANA: entiendo peticiones concretas y te llevo a cada parte. No soy una IA generativa y no guardo lo que me pides.' };
      case 'que-es-guardiana': return { x: [['ZERO', 'Navegar viendo quién intenta llevarse tus datos.'], ['Órbita', 'Ver por dónde viajan tus datos en el planeta.'], ['Comunicaciones', 'Hablar y enviar archivos encriptados con otra persona.']], t: '¿Por dónde empezamos?', c: ['zero', 'planeta', 'com'] };
      case 'zero': return { t: 'Abro ZERO: escribe una dirección o lo que quieras buscar.', a: () => abreZero(), va: true };
      case 'z-web': return r.web ? { t: pon('Abro {1} en ZERO, dentro de la burbuja.', r.web), a: () => abreZero(r.web), va: true } : { t: 'Escribe la dirección de la web, por ejemplo eltiempo.com, y la abro en ZERO.', modo: 'web' };
      case 'z-buscar': return r.q ? { t: pon('Busco «{1}» con ZERO.', r.q), a: () => abreZero(r.q), va: true } : { t: '¿Qué quieres buscar?', modo: 'buscar' };
      case 'z-radio': return hayWeb() ? { t: 'La Radiografía está a la derecha de ZERO: quién intenta conectarse, qué se ha cortado y quién puja por tus datos.', a: () => abreZero(), va: true } : { t: 'Para ver la Radiografía necesito una web abierta en ZERO. ¿Cuál abro?', modo: 'web' };
      case 'z-pdf': return hayWeb() ? { t: 'Preparo el PDF con lo que ZERO ha visto en esta web.', a: pdfWeb, va: true } : { t: 'Para el PDF de una web necesito una web abierta en ZERO. ¿Cuál abro?', modo: 'web', c: ['resumen'] };
      case 'resumen': return hayDatos() ? { t: 'Preparo el resumen de tus datos en PDF: se abre la ventana de imprimir y eliges «Guardar como PDF».', a: resumenPdf } : { t: 'Todavía no hay cortes registrados en este navegador. Abre una web con ZERO y vuelve a pedirme el resumen.', c: ['z-web'] };
      case 'z-que': return { t: AYUDA.zero, c: ['z-web', 'z-radio'] };
      case 'z-tor': return { t: 'Abro ZERO: en el selector del buscador, elige Tor. Con Tor se corta más.', a: () => abreZero(), va: true };
      case 'planeta': return { t: 'Te llevo al planeta: cables submarinos, cables terrestres, centros de datos, satélites y cortes en directo.', a: () => alPlaneta(), va: true };
      case 'p-pais': return r.pais ? { t: pon('Te llevo al planeta, a {1}.', nombrePais(r.pais)), a: () => alPlaneta(null, r.pais), va: true } : { t: '¿Qué país? Escríbelo y te llevo.', modo: 'pais' };
      case 'p-directo': return { t: 'Te llevo al planeta: a la derecha, en EN DIRECTO, aparece cada corte.', a: () => alPlaneta(), va: true };
      case 'p-caidas': return { t: 'No sigo caídas de internet. En Órbita, los cortes en directo son las conexiones que GUARDIANA corta mientras navegas. ¿Te los enseño?', c: ['p-directo'] };
      case 'p-que': return { t: AYUDA.orbita, c: ['p-sub', 'p-sat', 'p-pais'] };
      case 'com': return { t: 'Abro Comunicaciones: chat y archivos encriptados de PC a PC.', a: irComunicaciones, va: true };
      case 'c-crear': return { t: 'Abro Comunicaciones: pulsa «Crear invitación» y dale el código a la otra persona.', a: irComunicaciones, va: true };
      case 'c-codigo': return { t: 'Abro Comunicaciones: pulsa «Tengo un código» y escribe las 9 cifras.', a: irComunicaciones, va: true };
      case 'c-que': return { t: AYUDA.com, c: ['c-crear', 'c-codigo'] };
      case 'datos': return { x: [['Qué es', 'Lo que ZERO ha cortado mientras navegabas: qué empresas y de qué países.'], ['Dónde está', 'Solo en este navegador.']], t: misDatos(), c: hayDatos() ? ['resumen', 'borrar'] : ['z-web'] };
      case 'd-corte': return { t: 'Un corte es una conexión de otra empresa que ZERO no deja pasar. En ZERO, por defecto, todo pasa y tú decides qué cortar; con Tor, ZERO corta más.', c: ['datos'] };
      case 'borrar': return hayDatos() ? { t: '¿Borro lo que ZERO ha guardado en este navegador: cortes, empresas, países y Radiografías? No borra nada de otras webs ni de otros equipos.', c: [{ l: 'Sí, borrar', id: 'borrar-si' }, { l: 'No', id: 'borrar-no' }], modo: 'confirma-borrar' } : { t: 'No hay nada que borrar: ZERO todavía no ha guardado cortes en este navegador.' };
      case 'borrar-si': borraDatos(); return { t: 'Hecho: he borrado «Mis datos» de este navegador.' };
      case 'borrar-no': return { t: 'De acuerdo, no borro nada.' };
      case 'privacidad': return { t: 'NÚCLEO no guarda lo que le pides. Lo que ZERO corta («Mis datos») se guarda solo en este navegador, y puedes borrarlo cuando quieras.', c: ['datos', 'borrar'] };
      case 'seguridad': return { t: 'ZERO abre la web lejos de tu equipo: a tu equipo solo llegan imágenes. Eso reduce riesgos, pero ninguna herramienta protege de todo.', c: ['z-que'] };
      case 'vpn': return { t: 'ZERO no es una VPN: es un navegador aislado. La web se abre en un servidor de GUARDIANA y a tu equipo solo llegan imágenes.', c: ['zero'] };
      case 'precio': return { t: 'Hoy GUARDIANA no cobra nada.' };
      case 'idioma': return { t: 'Ahora GUARDIANA está en español e inglés; hay 40 idiomas más en preparación. ¿Cuál prefieres?', c: [{ l: 'Español', f: () => idioma('es'), nt: true }, { l: 'English', f: () => idioma('en'), nt: true }] };
      case 'cuenta': return { t: 'No necesitas crear una cuenta para usar ZERO, Órbita ni Comunicaciones. ¿A cuál quieres entrar?', c: ['zero', 'planeta', 'com'] };
      case 'contacto': return { t: 'Puedes escribir a hola@guardianagroup.com: lo lee una persona.', enlace: ['mailto:hola@guardianagroup.com', 'hola@guardianagroup.com'] };
      // lo delicado (rondas 53 y 54)
      case 'clave': return { t: 'No escribas contraseñas aquí: NÚCLEO no las necesita y no guarda lo que escribes.' };
      case 'banco': return { t: 'No compartas datos del banco ni de tarjetas aquí. Hoy GUARDIANA no cobra nada.' };
      case 'hackear': return { t: 'No ayudo a entrar en cuentas, redes o equipos ajenos. Puedo ayudarte a navegar aislado con ZERO o a chatear encriptado.', c: ['zero', 'com'] };
      case 'robada': return { t: 'Usa la recuperación oficial de ese servicio y cambia tus contraseñas desde su web. Si quieres, abro su web en ZERO.', c: ['z-web'] };
      case 'peligro': return { t: 'Si estás en peligro, llama ya a emergencias o a la policía de tu país. NÚCLEO no puede hacer esa llamada.' };
      case 'autolesion': return { t: 'Siento que estés pasando por esto. Si piensas en hacerte daño, llama ahora a emergencias o a una línea de ayuda de tu país; hablar con alguien ayuda.' };
      case 'espian': return { t: 'No puedo revisar tu equipo. Con ZERO, las webs se abren fuera de tu equipo y en la Radiografía ves quién intenta seguirte.', c: ['z-que', 'z-web'] };
      case 'insulto': return { t: 'Perdona si no te he entendido. Dime si quieres navegar, ver el planeta o chatear encriptado.', c: ['zero', 'planeta', 'com'] };
      case 'estafa': return { t: 'Entiendo tu desconfianza. Hoy GUARDIANA no cobra nada, no necesitas cuenta y NÚCLEO no guarda lo que le escribes.', c: ['privacidad', 'contacto'] };
      case 'salud': return { t: 'No doy consejos de salud: un profesional sanitario puede orientarte. Si quieres, lo busco con ZERO.', c: frase ? [{ l: 'Buscar con ZERO', f: () => abreZero(frase) }] : [] };
      default: return null;
    }
  }
  function idioma(l) { try { if (window.GuardianaIdioma) GuardianaIdioma.pon(l); } catch (_) {} }

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
      + '<button type="button" class="nuc-op" data-n="zero"><i>ZERO</i><b>Navegar con NÚCLEO</b><small>Entra en cualquier web y mira quién intenta llevarse tus datos.</small></button>'
      + '<button type="button" class="nuc-op" data-n="planeta"><i>ÓRBITA</i><b>Explorar el planeta</b><small>Cables submarinos, cables terrestres, centros de datos, satélites y cortes en directo.</small></button>'
      + '<button type="button" class="nuc-op" data-n="com"><i>COMUNICACIONES</i><b>Chat y archivos encriptados</b><small>Chatea y envía archivos encriptados de PC a PC.</small></button>'
      // dueño, 10:00: «añade uno más: pedir las cosas»; ronda 54 (ChatGPT y Astra): «Pídeselo a NÚCLEO»
      + '<button type="button" class="nuc-op nuc-op-n" data-n="nucleo"><i translate="no">NÚCLEO</i><b>Pídeselo a NÚCLEO</b><small>Pídele que abra webs, consulte tus datos o prepare informes en PDF.</small></button>'
      + '</div>';
    document.body.append(d);
    d.querySelectorAll('.nuc-op').forEach((b) => b.addEventListener('click', () => entra(b.dataset.n)));
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') alPlaneta(); });
    return d;
  }
  function entra(id) { if (id === 'zero') abreZero(); else if (id === 'planeta') alPlaneta(); else if (id === 'com') irComunicaciones(); else if (id === 'nucleo') abreSala(); }
  function revela(d, todo) {
    const pasos = [...d.querySelectorAll('.nuc-paso')];
    if (todo || matchMedia('(prefers-reduced-motion: reduce)').matches) { pasos.forEach((p) => p.classList.add('ve')); return; }
    const tiempos = [900, 2100, 2700, 3300];
    pasos.forEach((p, i) => setTimeout(() => p.classList.add('ve'), tiempos[Math.min(i, tiempos.length - 1)]));
  }
  function muestraInicio(rapido) {
    if (!ini) ini = construyeInicio();
    ini.hidden = false; ini.classList.remove('sale');
    if (laRed) laRed.para(); laRed = red(ini.querySelector('.nuc-lienzo'), { nace: !rapido });
    revela(ini, !!rapido);
    barra.hidden = true;
  }
  function ocultaInicio() {
    if (!sala || sala.hidden) barra.hidden = false;
    if (!ini || ini.hidden) return;
    ini.classList.add('sale');
    setTimeout(() => { if (!ini.classList.contains('sale')) return; ini.hidden = true; if (laRed) { laRed.para(); laRed = null; } }, 750);
  }

  // ---------- la sección de NÚCLEO: pedirle las cosas (ronda 54) ----------
  let sala = null, salaRed = null, modo = null;
  function construyeSala() {
    const s = document.createElement('section');
    s.className = 'nuc-sala'; s.id = 'nuc-sala'; s.hidden = true; s.setAttribute('aria-label', 'NÚCLEO');
    s.innerHTML = '<header class="ns-cab"><button type="button" class="ns-boton" id="ns-inicio"><span aria-hidden="true">←</span> Inicio</button>'
      + '<span class="ns-marca" translate="no">NÚCLEO</span>'
      + '<button type="button" class="ns-boton ns-ayuda" id="ns-ayuda" aria-expanded="false" aria-controls="ns-panel">¿Qué puedo pedir?</button></header>'
      + '<div class="ns-panel" id="ns-panel" role="region" aria-label="Qué puedo pedir" hidden></div>'
      + '<div class="ns-cuerpo" id="ns-cuerpo"><div class="ns-col">'
      + '<div class="ns-hola"><canvas class="ns-red" aria-hidden="true"></canvas><h2>Pídeselo a NÚCLEO</h2>'
      + '<p>Hola, soy NÚCLEO. Puedo abrir webs, enseñarte qué se ha cortado, llevarte al planeta y preparar informes en PDF. ¿Qué deseas hacer?</p></div>'
      + '<div class="ns-charla" id="ns-charla" aria-live="polite"></div></div></div>'
      + '<div class="ns-pie"><div class="ns-rapidas" id="ns-rapidas" role="group" aria-label="Acciones rápidas"></div>'
      + '<form class="ns-form" id="ns-form" autocomplete="off"><input id="ns-q" type="text" maxlength="200" placeholder="Escribe qué quieres hacer…" aria-label="Pídeselo a NÚCLEO" enterkeyhint="send"><button type="submit">Enviar</button></form>'
      + '<p class="ns-nota">NÚCLEO entiende peticiones concretas y no guarda lo que le pides.</p></div>';
    document.body.append(s);
    const rap = s.querySelector('#ns-rapidas');
    for (const [id, l] of RAPIDAS) { const b = document.createElement('button'); b.type = 'button'; b.className = 'nuc-chip'; b.textContent = l; b.addEventListener('click', () => elige(id, b.textContent)); rap.append(b); }
    const p = s.querySelector('#ns-panel');
    for (const [g, ids] of GRUPOS) {
      const sec = document.createElement('div'); sec.className = 'ns-grupo';
      const h = document.createElement('h3'); h.textContent = g; sec.append(h);
      const fila = document.createElement('div'); fila.className = 'ns-fila';
      for (const id of ids) { const b = document.createElement('button'); b.type = 'button'; b.className = 'nuc-chip'; b.textContent = ETQ[id] || id; b.addEventListener('click', () => { panel(false); elige(id, b.textContent); }); fila.append(b); }
      sec.append(fila); p.append(sec);
    }
    const cont = document.createElement('p'); cont.className = 'ns-contacto'; cont.innerHTML = '<a href="mailto:hola@guardianagroup.com" translate="no">hola@guardianagroup.com</a> · <span>Responde una persona.</span>'; p.append(cont);
    s.querySelector('#ns-inicio').addEventListener('click', () => { cierraSala(); muestraInicio(true); });
    s.querySelector('#ns-ayuda').addEventListener('click', () => panel(p.hidden));
    s.querySelector('#ns-form').addEventListener('submit', (e) => { e.preventDefault(); const i = s.querySelector('#ns-q'); const f = i.value; i.value = ''; escribe(f); });
    s.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!p.hidden) panel(false); else { cierraSala(); muestraInicio(true); } } });
    return s;
  }
  function panel(abre) {
    if (!sala) return; const p = sala.querySelector('#ns-panel'), b = sala.querySelector('#ns-ayuda');
    p.hidden = !abre; b.setAttribute('aria-expanded', String(!!abre));
    if (abre) { const x = p.querySelector('button'); if (x) x.focus({ preventScroll: true }); }
  }
  function abreSala() {
    if (!sala) sala = construyeSala();
    if (ini && !ini.hidden) ocultaInicio();
    sala.hidden = false; barra.hidden = true;
    if (salaRed) salaRed.para(); salaRed = red(sala.querySelector('.ns-red'), { nace: false });
    setTimeout(() => { const i = sala.querySelector('#ns-q'); if (i) i.focus({ preventScroll: true }); }, 60);
  }
  function cierraSala() {
    if (!sala || sala.hidden) return;
    sala.hidden = true; panel(false); modo = null;
    if (salaRed) { salaRed.para(); salaRed = null; }
    if (!ini || ini.hidden) barra.hidden = false;
  }
  function burbuja(quien, texto, op) {
    op = op || {};
    const c = sala.querySelector('#ns-charla'); const p = document.createElement('div'); p.className = 'nuc-b ' + quien;
    if (quien === 'el') { const k = document.createElement('span'); k.className = 'nq'; k.setAttribute('translate', 'no'); k.textContent = 'NÚCLEO'; p.append(k); }
    if (op.x && op.x.length) { const dl = document.createElement('dl'); dl.className = 'nuc-x'; for (const [k, v] of op.x) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); } p.append(dl); }
    const tx = document.createElement('p'); tx.className = 'nuc-bt'; tx.textContent = texto; if (quien === 'tu') tx.setAttribute('translate', 'no'); p.append(tx);
    if (op.enlace) { const a = document.createElement('a'); a.href = op.enlace[0]; a.textContent = op.enlace[1]; a.className = 'ns-enlace'; a.setAttribute('translate', 'no'); p.append(a); }
    if (op.c && op.c.length) {
      const f = document.createElement('div'); f.className = 'ns-opciones';
      for (const o of op.c) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'nuc-chip';
        if (typeof o === 'string') { b.textContent = ETQ[o] || o; b.addEventListener('click', () => elige(o, b.textContent)); }
        else { b.textContent = o.l; if (o.nt) b.setAttribute('translate', 'no'); b.addEventListener('click', () => (o.id ? elige(o.id, b.textContent) : (burbuja('tu', b.textContent), o.f()))); }
        f.append(b);
      }
      p.append(f);
    }
    c.append(p); while (c.children.length > 40) c.firstChild.remove();
    const cu = sala.querySelector('#ns-cuerpo'); requestAnimationFrame(() => { cu.scrollTop = cu.scrollHeight; });
  }
  const ctx = () => ({ modo, pais: paisEn, hayWeb: hayWeb() });
  function responde(r, frase) {
    if (!r) return;
    if (!sala || sala.hidden) abreSala();
    if (salaRed) salaRed.habla();
    modo = null;
    let o;
    if (r.quiza) o = { t: '¿Quisiste decir…?', c: r.quiza };
    else if (r.nada) o = { t: 'No he reconocido esa petición. Si quieres, lo busco con ZERO, o mira qué puedes pedirme.', c: [...(r.sensible || !frase ? [] : [{ l: pon('Buscar «{1}» con ZERO', corta(frase)), f: () => abreZero(frase) }]), { l: '¿Qué puedo pedir?', f: () => panel(true) }] };
    else o = respuesta(r, frase);
    if (!o) o = { t: 'No he reconocido esa petición.', c: [{ l: '¿Qué puedo pedir?', f: () => panel(true) }] };
    burbuja('el', T(o.t), o);
    modo = o.modo || null;
    const i = sala.querySelector('#ns-q');
    if (i) i.placeholder = T(modo === 'web' ? 'Escribe la dirección, por ejemplo eltiempo.com' : modo === 'pais' ? 'Escribe el país' : modo === 'buscar' ? 'Escribe lo que quieres buscar' : 'Escribe qué quieres hacer…');
    if (o.a) { if (o.va) setTimeout(o.a, 1100); else o.a(); }
  }
  function elige(id, etiqueta) { burbuja('tu', etiqueta || T(ETQ[id] || id)); responde({ id }); }
  function escribe(frase) {
    const f = String(frase || '').trim(); if (!f) return;
    if (!sala || sala.hidden) abreSala();
    burbuja('tu', f);
    let r = null; try { r = window.NucleoMotor ? NucleoMotor.entiende(f, ctx()) : null; } catch (_) {}
    responde(r || { nada: true }, f);
  }

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

  // ---------- el botón «NÚCLEO», abajo a la izquierda en el planeta y en las secciones: abre su sección ----------
  const barra = document.createElement('div');
  barra.className = 'nuc-barra mini'; barra.id = 'nuc-barra'; barra.hidden = true;
  barra.innerHTML = '<button type="button" class="nuc-orbe" id="nuc-orbe" aria-label="Pídeselo a NÚCLEO" title="NÚCLEO"></button>';
  barra.addEventListener('click', () => abreSala());
  document.body.append(barra);

  // ---------- dueño, 10:02 («que se vea todo limpio»): al cerrar una sección se vuelve a la portada, salvo con «Verme en
  // Órbita» (lleva al planeta con tu ficha) o cuando es NÚCLEO quien lleva al planeta. El botón de volver dice «Inicio». ----------
  let verme = 0, volviendo = 0, estabaDentro = document.body.classList.contains('dentro');
  addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.tipo === 'orbita-verme') verme = Date.now(); });
  new MutationObserver(() => {
    const d = document.body.classList.contains('dentro');
    if (estabaDentro && !d) setTimeout(() => { if (Date.now() - verme > 1500 && Date.now() - volviendo > 1500 && !document.body.classList.contains('dentro')) muestraInicio(true); }, 60);
    estabaDentro = d;
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  { const vb = document.getElementById('volver'); if (vb) for (const n of vb.childNodes) if (n.nodeType === 3 && n.data.trim() === 'Órbita') n.data = 'Inicio'; }

  // ---------- arranque: la primera vez en esta visita, con su nacimiento; al volver en la misma visita, al momento ----------
  let visto = false; try { visto = sessionStorage.getItem('guardiana-nucleo') === '1'; sessionStorage.setItem('guardiana-nucleo', '1'); } catch (_) {}
  if (q.get('nucleo') === 'pide') abreSala();
  else if (q.get('nucleo') === '0' || PUERTA_EN_URL) barra.hidden = false;
  else muestraInicio(visto);
  window.GuardianaNucleo = { inicio: () => muestraInicio(true), sala: abreSala, pide: escribe };
})();
