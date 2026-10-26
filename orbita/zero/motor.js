// ZERO · cliente del motor (26 Oct 2026, ronda 40).
// Conecta la pantalla de ZERO con el motor (zero-motor/servidor.js): recibe la imagen de la web que corre en la celda
// remota, manda ratón y teclado, y alimenta el panel «Lo que ZERO corta» con sucesos reales. Si no hay motor
// configurado (?motor=ws://… o la clave guardada), la página sigue siendo la demostración de siempre.
(() => {
  'use strict';
  const P = new URLSearchParams(location.search);
  let URL_MOTOR = P.get('motor');
  try { if (URL_MOTOR) localStorage.setItem('zeroMotor', URL_MOTOR); else if (P.get('motor') === '') localStorage.removeItem('zeroMotor'); else URL_MOTOR = localStorage.getItem('zeroMotor'); } catch (_) {}
  const M = (window.ZeroMotor = { activo: !!URL_MOTOR, url: URL_MOTOR, estado: 'apagado', lista: null, sucesos: [], observatorio: false });
  if (!URL_MOTOR) return;

  const $ = (s) => document.querySelector(s);
  const stage = $('#stage'), web = $('#web');
  const cv = document.createElement('canvas'); cv.id = 'pantalla'; cv.tabIndex = 0; cv.setAttribute('aria-label', 'Web abierta en la celda remota de ZERO'); cv.width = 1064; cv.height = 800;
  const ctx = cv.getContext('2d');
  const est = document.createElement('div'); est.className = 'estadomotor'; est.setAttribute('aria-live', 'polite');
  web.append(cv, est);
  const ponEstado = (txt, clase) => { est.textContent = txt || ''; est.className = 'estadomotor' + (clase ? ' ' + clase : '') + (txt ? ' on' : ''); };

  let ws = null, abierto = false, pendiente = null, ultimoCuadro = 0, cuadros = 0, moviendo = 0;
  const env = (o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };
  const tam = () => ({ w: Math.round(web.offsetWidth) || 1064, h: Math.round(web.offsetHeight) || 800 });

  function conecta() {
    if (ws && (ws.readyState === 0 || ws.readyState === 1)) return;
    M.estado = 'conectando'; ponEstado('Conectando con la celda remota…');
    ws = new WebSocket(URL_MOTOR + (URL_MOTOR.includes('/sesion') ? '' : '/sesion'));
    ws.binaryType = 'blob';
    ws.onopen = () => { const t = tam(); env({ t: 'hola', w: t.w, h: t.h }); };
    ws.onmessage = (ev) => { if (typeof ev.data === 'string') despacha(JSON.parse(ev.data)); else cuadro(ev.data); };
    ws.onclose = () => { M.estado = 'cerrado'; abierto = false; if (!M.acta) ponEstado('Sin conexión con el motor', 'mal'); };
    ws.onerror = () => { M.estado = 'error'; ponEstado('No se pudo conectar con el motor en ' + URL_MOTOR, 'mal'); };
  }

  async function cuadro(blob) {
    try {
      const bm = await createImageBitmap(blob);
      if (cv.width !== bm.width || cv.height !== bm.height) { cv.width = bm.width; cv.height = bm.height; }
      ctx.drawImage(bm, 0, 0); bm.close();
      cuadros++; ultimoCuadro = Date.now();
      if (est.classList.contains('on') && !est.classList.contains('mal') && M.estado === 'lista') ponEstado('');
    } catch (_) {}
  }

  function despacha(m) {
    if (m.t === 'lista') {
      M.lista = m; M.estado = 'lista'; M.sesion = m.sesion; M.acta = null;
      ponEstado('Celda lista · ' + Object.keys(m.listas || {}).length + ' listas · cookies de terceros ' + (m.cookiesBloqueadas ? 'bloqueadas' : 'efímeras'));
      try { const n = localStorage.getItem('zeroNivel'); if (n && n !== '"normal"') env({ t: 'modo', nivel: JSON.parse(n) }); } catch (_) {}
      if (pendiente) { env({ t: 'abrir', url: pendiente }); pendiente = null; }
      return;
    }
    if (m.t === 'suceso') { M.sucesos.push(m); if (window.zeroSuceso) window.zeroSuceso(m); return; }
    if (m.t === 'resumen') { if (window.zeroResumen) window.zeroResumen(m); return; }
    if (m.t === 'nav') { M.host = m.host; M.urlActual = m.url; if (window.zeroNav) window.zeroNav(m); return; }
    if (m.t === 'titulo') { if (window.zeroTitulo) window.zeroTitulo(m.titulo); return; }
    if (m.t === 'ia') { if (window.zeroIA) window.zeroIA(m); return; }
    if (m.t === 'alerta') { M.alertaNivel = m.nivel; M.sellada = !!m.sellada; if (window.zeroAlerta) window.zeroAlerta(m); return; }
    if (m.t === 'acta') { M.acta = m.acta; abierto = false; ponEstado(''); if (window.zeroActa) window.zeroActa(m.acta); return; }
  }

  // ---- lo que el motor recibe de la persona ----
  const coords = (e) => { const r = cv.getBoundingClientRect(); return { x: Math.max(0, Math.min(cv.width, (e.clientX - r.left) * cv.width / (r.width || 1))), y: Math.max(0, Math.min(cv.height, (e.clientY - r.top) * cv.height / (r.height || 1))) }; };
  const BOTON = ['left', 'middle', 'right'];
  cv.addEventListener('mousemove', (e) => { const n = Date.now(); if (n - moviendo < 28) return; moviendo = n; const c = coords(e); env({ t: 'raton', tipo: 'move', x: c.x, y: c.y }); });
  cv.addEventListener('mousedown', (e) => { cv.focus(); e.preventDefault(); const c = coords(e); env({ t: 'raton', tipo: 'move', x: c.x, y: c.y }); env({ t: 'raton', tipo: 'down', x: c.x, y: c.y, boton: BOTON[e.button] || 'left', clicks: e.detail || 1 }); });
  cv.addEventListener('mouseup', (e) => { e.preventDefault(); const c = coords(e); env({ t: 'raton', tipo: 'up', x: c.x, y: c.y, boton: BOTON[e.button] || 'left', clicks: e.detail || 1 }); });
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  cv.addEventListener('wheel', (e) => { e.preventDefault(); const c = coords(e); env({ t: 'rueda', x: c.x, y: c.y, dx: e.deltaX, dy: e.deltaY }); }, { passive: false });
  const LOCALES = new Set(['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']);
  cv.addEventListener('keydown', (e) => { if (LOCALES.has(e.key) || e.key === 'Dead' || (e.ctrlKey && /^[lLtTwWnN]$/.test(e.key))) return; e.preventDefault(); e.stopPropagation(); env({ t: 'tecla', tipo: 'down', key: e.key }); }, true);
  cv.addEventListener('keyup', (e) => { if (LOCALES.has(e.key) || e.key === 'Dead') return; e.preventDefault(); e.stopPropagation(); env({ t: 'tecla', tipo: 'up', key: e.key }); }, true);
  document.addEventListener('visibilitychange', () => env({ t: 'mira', si: !document.hidden }));
  let tTam = 0;
  const avisaTam = () => { clearTimeout(tTam); tTam = setTimeout(() => { if (!abierto) return; const t = tam(); env({ t: 'tam', w: t.w, h: t.h }); }, 320); };
  new ResizeObserver(avisaTam).observe(web);

  // ---- lo que la página de ZERO puede pedir ----
  const esDir = (v) => /^https?:\/\//i.test(v) || /^[^\s/]+\.[a-z]{2,}(\/\S*)?$/i.test(v) || /^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(v);
  M.abre = (texto, urlBuscador) => {
    texto = String(texto || '').trim();
    let u;
    if (!texto) u = 'about:blank';
    else if (esDir(texto)) u = /^https?:\/\//i.test(texto) ? texto : (/^(localhost|127\.0\.0\.1)/i.test(texto) ? 'http://' : 'https://') + texto;
    else u = urlBuscador + encodeURIComponent(texto);
    if (M.sellada) { ponEstado('Celda sellada: reanuda o destruye la celda antes de abrir otra web', 'mal'); if (window.zeroNav) window.zeroNav({ host: M.host, url: M.urlActual }); return; }
    stage.classList.add('real'); abierto = true; M.acta = null; ponEstado('Abriendo en la celda…');
    try { const h = new URL(u).host; if (window.zeroNav) window.zeroNav({ host: h, url: u }); } catch (_) {}
    if (M.estado === 'lista' && ws && ws.readyState === 1) env({ t: 'abrir', url: u }); else { pendiente = u; conecta(); }
    setTimeout(() => cv.focus(), 50);
  };
  M.atras = () => env({ t: 'atras' }); M.adelante = () => env({ t: 'adelante' }); M.recargar = () => env({ t: 'recargar' });
  M.modo = (observatorio) => { M.observatorio = !!observatorio; env({ t: 'modo', observatorio: M.observatorio }); };
  M.nivel = (n) => { M.nivelActual = n; env({ t: 'modo', nivel: n }); };
  M.destruir = () => { ponEstado('Sellando y destruyendo la celda…'); env({ t: 'destruir' }); };
  M.ia = (o) => { if (M.estado !== 'lista' || !ws || ws.readyState !== 1) { conecta(); return false; } env({ t: 'ia', ...o }); return true; };
  M.sellar = () => env({ t: 'alerta', accion: 'sellar' });
  M.reanudar = () => env({ t: 'alerta', accion: 'reanudar' });
  M.enfoca = () => cv.focus();
  conecta();
})();
