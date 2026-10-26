// GUARDIANA ZERO · panel lateral: enseña lo que el motor (fondo.js) ve en la pestaña activa y manda las decisiones
// de la persona (nivel, permitir o cortar una empresa). Todo queda en el navegador.
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const NIVEL_TXT = {
    observar: 'No corta nada (salvo webs peligrosas): la web se abre tal cual, ZERO lo detecta todo y tú eliges qué cortar.',
    normal: 'Corta la publicidad y el rastreo de las listas públicas (EasyList, EasyPrivacy, uBlock Origin).',
    estricto: 'Corta toda conexión con otras empresas salvo las que tú permitas. Algunas webs pueden fallar.',
  };
  const TITULO = { corte: 'Conexión', huella: 'Consulta de huella digital', permiso: 'Petición de permiso', webrtc: 'Conexión directa (WebRTC)', formulario: 'Formulario sin cifrar', subasta: 'Subasta de anuncios', cookie: 'Cookie de otra empresa' };
  let tabId = null, nivel = 'observar', pestana = 'emp';

  async function pestanaActiva() { const [t] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }); return t ? t.id : null; }
  const hora = (iso) => { try { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch (_) { return ''; } };

  function pinta(e) {
    if (!e) return;
    nivel = e.nivel || nivel;
    $('#web').textContent = e.host || '—';
    const obs = nivel === 'observar';
    const total = obs ? e.n.vistos + e.n.cortes : e.n.cortes;
    $('#total').textContent = String(total); $('#total').classList.toggle('corta', !obs && e.n.cortes > 0);
    $('#totaltxt').textContent = obs ? 'Vistas' : 'Cortes';
    $('#nemp').textContent = String(e.empresas.length); $('#npais').textContent = String(e.paises.length);
    const pq = Object.entries(e.porque || {}).sort((a, b) => b[1] - a[1]);
    const P = $('#porque'); P.textContent = '';
    if (!pq.length) { const s = document.createElement('span'); s.className = 'vacio'; s.textContent = e.listo ? 'Aún no hay conexiones de otras empresas en esta web.' : 'Preparando las listas…'; if (!e.listo) s.classList.add('cargando'); P.append(s); }
    for (const [k, n] of pq) { const s = document.createElement('span'); s.textContent = k; const b = document.createElement('b'); b.textContent = String(n); s.append(b); P.append(s); }
    $('#niveltxt').textContent = NIVEL_TXT[nivel];
    document.querySelectorAll('#niveles button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.n === nivel)));
    $('#qemp').textContent = String(e.empresas.length); $('#qvivo').textContent = String(e.sucesos.length);
    // por empresa
    const R = $('#rows'); R.textContent = '';
    if (!e.empresas.length) { const p = document.createElement('p'); p.className = 'vacio'; p.textContent = 'Cuando la web se conecte con otras empresas, aquí verás quiénes son, de qué país y para qué; y podrás cortar a cada una.'; R.append(p); }
    for (const r of e.empresas) {
      const d = document.createElement('div'); d.className = 'emp';
      const l1 = document.createElement('div'); l1.className = 'l1'; const st = document.createElement('strong'); st.textContent = r.empresa; st.setAttribute('translate', 'no'); const x = document.createElement('span'); x.className = 'x'; x.textContent = '×' + r.n; l1.append(st, x);
      const l2 = document.createElement('div'); l2.className = 'l2'; l2.textContent = r.paisNombre + ' · ' + r.motivo + (r.cortados ? ' · ' : ''); if (r.cortados) { const i = document.createElement('i'); i.textContent = r.cortados + ' cortadas'; l2.append(i); }
      const acc = document.createElement('div'); acc.className = 'acc';
      const bp = document.createElement('button'); bp.type = 'button'; bp.textContent = r.permitida ? 'Permitida' : 'Permitir'; bp.className = r.permitida ? 'on' : ''; bp.title = 'Dejar pasar las conexiones de esta empresa';
      bp.addEventListener('click', () => chrome.runtime.sendMessage({ t: 'permitir', clave: r.clave, on: !r.permitida }).then(refresca));
      const bc = document.createElement('button'); bc.type = 'button'; bc.textContent = r.cortada ? 'Cortada' : 'Cortar'; bc.className = 'corta' + (r.cortada ? ' on' : ''); bc.title = 'Cortar las conexiones de esta empresa en todas las webs';
      bc.addEventListener('click', () => chrome.runtime.sendMessage({ t: 'cortar', clave: r.clave, on: !r.cortada }).then(refresca));
      acc.append(bp, bc); d.append(l1, l2, acc); R.append(d);
    }
    // en vivo
    const V = $('#vivos'); V.textContent = '';
    if (!e.sucesos.length) { const p = document.createElement('p'); p.className = 'vacio'; p.textContent = 'Aquí verás, en orden, cada cosa que intenta la web y lo que hace ZERO.'; V.append(p); }
    for (const s of [...e.sucesos].reverse()) {
      const d = document.createElement('div'); d.className = 'viv' + (s.estado === 'cortado' ? ' c' : (s.clase === 'huella' || s.clase === 'formulario' || s.clase === 'webrtc' ? ' a' : ''));
      const i = document.createElement('i'); const t = document.createElement('span'); t.textContent = s.texto; t.title = TITULO[s.clase] || s.clase; const tm = document.createElement('time'); tm.textContent = hora(s.hora);
      d.append(i, t, tm); V.append(d);
    }
  }

  async function refresca() {
    if (tabId == null) tabId = await pestanaActiva();
    if (tabId == null) return;
    try { pinta(await chrome.runtime.sendMessage({ t: 'estado', tabId })); } catch (_) {}
  }

  document.querySelectorAll('#niveles button').forEach((b) => b.addEventListener('click', async () => { nivel = b.dataset.n; await chrome.runtime.sendMessage({ t: 'nivel', nivel }); refresca(); }));
  $('#tabemp').addEventListener('click', () => { pestana = 'emp'; $('#tabemp').setAttribute('aria-selected', 'true'); $('#tabvivo').setAttribute('aria-selected', 'false'); $('#rows').hidden = false; $('#vivos').hidden = true; });
  $('#tabvivo').addEventListener('click', () => { pestana = 'vivo'; $('#tabvivo').setAttribute('aria-selected', 'true'); $('#tabemp').setAttribute('aria-selected', 'false'); $('#rows').hidden = true; $('#vivos').hidden = false; });
  $('#limpiar').addEventListener('click', async () => { await chrome.runtime.sendMessage({ t: 'limpiar', tabId }); refresca(); });
  chrome.runtime.onMessage.addListener((m) => { if (m && m.t === 'cambio') refresca(); });
  chrome.tabs.onActivated.addListener(async () => { tabId = await pestanaActiva(); refresca(); });
  chrome.tabs.onUpdated.addListener((id, info) => { if (id === tabId && (info.status || info.url)) refresca(); });
  refresca(); setInterval(refresca, 2000);
})();
