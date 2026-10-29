// GUARDIANA · Comunicaciones · la aplicación (26 Oct 2026). Identidad, invitaciones, sesiones, mensajes, archivos,
// llamadas y la pantalla. Lo que se guarda (IndexedDB «guardiana-com») queda en este navegador y se cifra en reposo con
// una clave que también vive aquí; «Destruir» lo borra en los dos lados. El relé nunca recibe nada legible.
'use strict';
(() => {
  const C = window.GuardianaCripto, $ = (s) => document.querySelector(s), T = (s) => (window.GuardianaIdioma ? GuardianaIdioma.t(s) : s);
  const LOC = () => (window.GuardianaIdioma && GuardianaIdioma.locale) || 'es';
  const TROZO = 192 * 1024, VENTANA = 12, VENTANA_B = 32;
  // Sesión blindada (dueño, 27 Oct 2026, 22:01–23:12): suite CNSA 2.0, invitación por enlace de 256 bits, verificación mutua
  // obligatoria, identidad nueva en cada sesión, renovación de claves cada 5 minutos, relleno e informe de cierre.
  const esB = (c) => !!(c && c.modo === 'blindada');
  const RENUEVA_B_MS = 5 * 60 * 1000;
  // en pruebas locales, «?renueva=N» acorta la renovación a N segundos
  const renuevaMs = () => (LOCAL && +new URLSearchParams(location.search).get('renueva') * 1000) || RENUEVA_B_MS;
  const ORIGEN = location.origin + location.pathname.replace(/[^/]*$/, '');
  const LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);

  // ---------- almacén ----------
  const BD = (() => {
    let db = null;
    const abre = () => new Promise((res, rej) => {
      const r = indexedDB.open('guardiana-com', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        d.createObjectStore('yo', { keyPath: 'id' });
        d.createObjectStore('conv', { keyPath: 'id' });
        d.createObjectStore('msg', { keyPath: 'id' }).createIndex('conv', 'conv');
        d.createObjectStore('arch', { keyPath: 'id' }).createIndex('conv', 'conv');
      };
      r.onsuccess = () => { db = r.result; res(db); }; r.onerror = () => rej(r.error);
    });
    const tx = (st, modo, f) => new Promise((res, rej) => { const t = db.transaction(st, modo); const o = t.objectStore(st); const q = f(o); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
    const pon = (st, v) => tx(st, 'readwrite', (o) => o.put(v));
    const saca = (st, k) => tx(st, 'readonly', (o) => o.get(k));
    const todos = (st) => tx(st, 'readonly', (o) => o.getAll());
    const porConv = (st, c) => tx(st, 'readonly', (o) => o.index('conv').getAll(c));
    const borra = (st, k) => tx(st, 'readwrite', (o) => o.delete(k));
    const borraConv = async (st, c) => { const xs = await porConv(st, c); for (const x of xs) await borra(st, x.id); };
    return { abre, pon, saca, todos, porConv, borra, borraConv };
  })();

  // ---------- estado ----------
  let YO = null;            // { firma, acuerdo, firmaPub, acuerdoPub, nombre, reposo, huella }
  const CONVS = new Map();  // sala → conv
  let ACTUAL = null;        // sala abierta
  let R = null;
  let LL = null; // llamadas de voz (llamada.js)
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : C.hex(C.azar(16)));
  // El viaje del archivo y el comprobante de custodia (dueño, 27 Oct 2026, 20:39): el estado de cada envío vive aquí,
  // solo en memoria; el comprobante firmado por los dos equipos se guarda como un mensaje más («custodia»).
  const VIAJES = new Map();
  const VJ = () => window.GuardianaViaje;
  const VERSION_APP = 'GUARDIANA Comunicaciones 2026-10-27'; // entra en el comprobante: qué versión midió y firmó
  const iso = (t) => (Number.isFinite(t) ? new Date(t).toISOString() : null);
  // latencias recibidas del otro equipo: { min, mediana, max, n } en enteros, o null
  const estadValida = (o) => (o && typeof o === 'object' && ['min', 'mediana', 'max', 'n'].every((k) => Number.isInteger(o[k]) && o[k] >= 0 && o[k] < 600000) ? { min: o.min, mediana: o.mediana, max: o.max, n: o.n } : null);
  const MI_PAIS = (() => { try { return (window.GuardianaViajeDatos && GuardianaViajeDatos.miPais()) || ''; } catch (_) { return ''; } })();
  const regionValida = (x) => (typeof x === 'string' && /^[A-Z]{2}$/.test(x) ? x : '');
  const latValida = (x) => (typeof x === 'number' && isFinite(x) && x >= 0 && x < 60000 ? Math.round(x) : null);
  const limpiaNombre = (n) => String(n || 'archivo').slice(0, 180).replace(/[\\/:*?"<>|]/g, '_');
  const inicial = (n) => ((n || '').trim()[0] || '·').toUpperCase();

  // cifrado en reposo (clave local no exportable; nonce aleatorio por registro)
  async function guardaSellado(obj) { const iv = C.azar(12); const datos = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, YO.reposo, C.te.encode(JSON.stringify(obj)))); return { iv, datos }; }
  async function leeSellado(r) { try { return JSON.parse(C.td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: r.iv }, YO.reposo, r.datos))); } catch (_) { return null; } }

  // ---------- identidad ----------
  async function cargaIdentidad() {
    let y = await BD.saca('yo', 'yo');
    if (!y) {
      const id = await C.creaIdentidad();
      const reposo = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      y = { id: 'yo', firma: id.firma, acuerdo: id.acuerdo, firmaPub: id.firmaPub, acuerdoPub: id.acuerdoPub, nombre: '', reposo, creado: Date.now() };
      await BD.pon('yo', y);
      y.nueva = true;
    }
    YO = y; YO.huella = await C.huella(y.firmaPub, y.acuerdoPub);
  }
  async function guardaNombre(n) {
    YO.nombre = String(n || '').trim().slice(0, 40);
    try { const y = await BD.saca('yo', 'yo'); y.nombre = YO.nombre; await BD.pon('yo', y); } catch (e) { console.warn('nombre', e); }
    for (const c of CONVS.values()) if (c.sesion) enviaControl(c, { tipo: 'nombre', nombre: YO.nombre });
  }

  // ---------- conversaciones ----------
  // En la blindada, cada sesión tiene su propia identidad (ECDSA y ECDH P-384 + ML-DSA-87): nada enlaza una sesión con
  // la siguiente, y al terminar se borra con todo lo demás. La clave ML-DSA-87 se guarda encriptada con la clave local.
  const miHuella = (c) => (esB(c) ? c.miHuellaB : YO.huella);
  async function preparaIdentidadB(c) {
    if (!C.B.hayBlindada()) throw new Error('sin blindada');
    if (!c.idB) { const n = await C.B.creaIdentidad(YO.reposo); c.idB = n.guardar; c.idBDsaSec = n.dsaSec; }
    else if (!c.idBDsaSec) c.idBDsaSec = await C.B.abreDsa(c.idB, YO.reposo);
    c.miHuellaB = await C.B.huella(c.idB.firmaPub, c.idB.acuerdoPub, c.idB.dsaPub);
  }
  async function yoId(sala, c) { return C.hex(await C.sha256(C.te.encode('GUARDIANA miembro\n' + sala + '\n' + C.hex(c ? miHuella(c) : YO.huella)))).slice(0, 16); }
  function convNueva(sala, semilla, rol, modo) {
    return { id: sala, semilla, rol, modo: modo === 'blindada' ? 'blindada' : 'normal', suVerificada: false, estado: 'invitacion', nombre: '', firmaPub: null, acuerdoPub: null, huella: null, verificada: false, creado: Date.now(), ultimo: Date.now(), ultimoTexto: null, noLeidos: 0 };
  }
  const guardable = (c) => ({ id: c.id, tumba: c.tumba, vaciarPendiente: c.vaciarPendiente || undefined, semilla: c.semilla, rol: c.rol, estado: c.estado, nombre: c.nombre, firmaPub: c.firmaPub, acuerdoPub: c.acuerdoPub, huella: c.huella, verificada: c.verificada, creado: c.creado, ultimo: c.ultimo, ultimoTexto: c.ultimoTexto, noLeidos: c.noLeidos, pqVisto: !!c.pqVisto, clasicaAceptada: !!c.clasicaAceptada, modo: c.modo || 'normal', suVerificada: !!c.suVerificada, dsaPub: c.dsaPub || null, idB: c.idB || null, alias: c.alias || '', num: c.num || 0, contacto: !!c.contacto, sinContacto: !!c.sinContacto });
  const guardaConv = (c) => BD.pon('conv', guardable(c));
  async function preparaConv(c) {
    if (esB(c)) await preparaIdentidadB(c);
    const d = esB(c) ? await C.B.deSemilla(c.semilla) : await C.deSemilla(c.semilla);
    c.presentacion = d.presentacion; c.psk = d.psk; c.yo = await yoId(c.id, c);
    c.miembros = new Set(); c.sesion = null; c.sesiones = new Map(); c.ef = null; c.epoca = null; c.mensajes = []; c.cola = []; c.enviando = false; c.archivos = new Map();
    c.suId = c.huella ? C.hex(await C.sha256(C.te.encode('GUARDIANA miembro\n' + c.id + '\n' + C.hex(c.huella)))).slice(0, 16) : null;
    CONVS.set(c.id, c);
    R.entra(c.id, c.yo, esB(c) ? { b: 1 } : undefined);
  }
  // Al abrir la página se recuperan todas las conversaciones empezadas (varias a la vez desde el 28 Oct 2026; antes solo la
  // más reciente). Las invitaciones normales sin usar no se guardan; las marcas de borrado pendiente caducan a las 24 horas.
  async function cargaConvs() {
    const xs = (await BD.todos('conv')).sort((a, b) => (a.creado || 0) - (b.creado || 0));
    let n = Math.max(0, ...xs.map((x) => x.num || 0));
    for (const x of xs) {
      if (x.estado === 'destruida_pendiente' && Date.now() - (x.tumba || x.creado || 0) > 24 * 3600 * 1000) { await BD.borra('conv', x.id); continue; }
      if (x.estado !== 'destruida_pendiente' && !x.huella && !(x.modo === 'blindada' && x.rol === 'invita')) { await BD.borraConv('msg', x.id); await BD.borraConv('arch', x.id); await BD.borra('conv', x.id); continue; }
      if (!x.num && x.estado !== 'destruida_pendiente') { x.num = ++n; await BD.pon('conv', x); }
      await preparaConv(x);
      if (x.estado !== 'destruida_pendiente') await cargaMensajes(x);
    }
    pintaLista();
  }
  // Invitación por código (dueño, 26 Oct 20:00: «un número en pantalla, la otra persona lo pone; sencillísimo»). El secreto
  // de la conversación (32 bytes) se cierra con una clave derivada del código (PBKDF2) y ese «sobre» se deja en el relé
  // durante 10 minutos, una sola vez; el relé no puede abrirlo sin el código y limita los intentos de búsqueda.
  // una invitación sin usar se sustituye por la nueva; las conversaciones ya empezadas no se tocan (varias a la vez)
  async function limpiaInvitaciones() { for (const x of [...CONVS.values()]) if (x.estado === 'invitacion' && x.rol === 'invita' && !x.huella && !esB(x)) await destruye(x, true); }
  const caben = () => { if (vivas().filter((x) => !(x.estado === 'invitacion' && x.rol === 'invita' && !x.huella && !esB(x))).length < MAX_CONVS) return true; aviso(T('Ya tienes {n} conversaciones abiertas: termina alguna para empezar otra.').replace('{n}', MAX_CONVS)); return false; };
  async function creaInvitacion() {
    if (!R.abierto) { aviso(T('Sin conexión: espera un momento.')); return; }
    if (!caben()) return;
    await limpiaInvitaciones();
    const semilla = C.nuevaSemilla();
    const d = await C.deSemilla(semilla);
    const c = convNueva(d.sala, semilla, 'invita'); c.num = siguienteNum();
    await preparaConv(c); // no se guarda hasta que la otra persona entra: recargar la página la deja atrás
    abreConv(c.id);
    muestraInvitacion(c); await publicaCodigo(c);
  }
  async function publicaCodigo(c) {
    for (let intento = 0; intento < 3; intento++) {
      const codigo = C.nuevoCodigo(), sal = C.azar(16), iv = C.azar(12);
      const k = await C.claveDeCodigo(codigo, sal);
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: C.te.encode('GUARDIANA sobre') }, k, c.semilla));
      const r = await R.invita(codigo, C.b64u(C.cat(iv, ct)), C.b64u(sal));
      if (r && r.ok) { c.codigo = codigo; c.codigoCaduca = r.caduca || (Date.now() + 10 * 60 * 1000); pintaCodigo(c); pintaLista(); return true; }
      if (!r || r.por !== 'repetido') break;
    }
    c.codigo = null; pintaCodigo(c); aviso(T('No se pudo crear el código: inténtalo otra vez.')); return false;
  }
  // Invitación blindada: solo por enlace o QR, con la semilla entera (256 bits) en el fragmento «#b=»: el navegador no la
  // manda a ningún servidor y el relé no guarda ningún sobre. Se guarda aquí hasta que la otra persona entre o se termine.
  const esMovil = () => matchMedia('(max-width: 760px)').matches;
  // Pantalla completa en el móvil (dueño, 16:03: «una interfaz que ocupe toda la pantalla… que no se vea nada del móvil»). Android
  // la da desde la web; el iPhone no (solo como app desde la pantalla de inicio)
  const comoApp = () => { try { return matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true; } catch (_) { return false; } };
  // instalada en la pantalla de inicio: sin «‹ Inicio» (app.css), también donde el navegador no entiende display-mode; arriba,
  // el mismo nombre que lleva el icono (dueño, 17:06: «en vez de poner comunicaciones… guardiana»)
  document.documentElement.classList.toggle('como-app', comoApp());
  if (comoApp()) { const bt = document.querySelector('.barra .barra-t'); if (bt) { bt.textContent = 'GUARDIANA'; bt.setAttribute('translate', 'no'); } }
  const puedeCompleta = () => !!(document.fullscreenEnabled && document.documentElement.requestFullscreen) && !/iPhone|iPad|iPod/i.test(navigator.userAgent);
  function pantallaCompleta() { try { if (!document.fullscreenElement && !comoApp()) document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {}); } catch (_) {} }
  // en el móvil, una conversación nueva borra las anteriores… salvo los contactos guardados (dueño, 28 Oct 2026, 17:33)
  async function borraAnteriores(salvo) { for (const x of [...CONVS.values()]) if (x.id !== salvo && !x.contacto) { try { await destruye(x, true); } catch (_) {} } }
  async function creaInvitacionB(semillaDada) {
    if (!R.abierto) { aviso(T('Sin conexión: espera un momento.')); return; }
    if (esMovil()) await borraAnteriores();
    if (!C.B.hayBlindada()) { aviso(T('Este navegador no puede abrir una sesión blindada: hace falta uno actual.')); return; }
    if (!caben()) return;
    await limpiaInvitaciones();
    const semilla = semillaDada || C.nuevaSemilla();
    const d = await C.B.deSemilla(semilla);
    const c = convNueva(d.sala, semilla, 'invita', 'blindada'); c.num = siguienteNum();
    await preparaConv(c); await guardaConv(c);
    abreConv(c.id);
    return c;
  }
  const enlaceB = (c) => ORIGEN + '#b=' + C.b64u(c.semilla);
  function muestraEnlace(c) {
    const u = enlaceB(c); $('#enlace-b').value = u;
    const q = $('#enlace-qr'); if (q && window.qrSvg && q.dataset.u !== u) { q.innerHTML = window.qrSvg(u); q.dataset.u = u; }
    const est = $('#enlace-estado'); est.textContent = c.ocupada ? T('Esta invitación ya la usó otra persona.') : ''; est.hidden = !c.ocupada; est.classList.toggle('mal', !!c.ocupada);
    // en el móvil, solo «Compartir enlace» (el enlace ya está copiado); al compartir, la pantalla de espera
    const movil = matchMedia('(pointer: coarse)').matches, comparte = !!navigator.share;
    $('#enlace-copiar').hidden = movil && comparte; $('#enlace-compartir').hidden = !comparte; $('#enlace-compartir').classList.toggle('principal', movil && comparte);
    $('#enlace-copiado').hidden = !c.copiado;
    $('#enlace-vista').hidden = !!c.compartido; $('#enlace-espera').hidden = !c.compartido;
    document.body.classList.toggle('esperando-enlace', !!c.compartido && ACTUAL === c.id);
  }
  const codigoBonito = (k) => k ? k.replace(/(\d{3})(?=\d)/g, '$1-') : '···-···-···';
  async function aceptaCodigo(texto) {
    const codigo = String(texto || '').replace(/\D/g, '');
    if (codigo.length !== 9) return 'formato';
    const r = await R.busca(codigo);
    if (!r || !r.ok) return (r && r.por) || 'no vale';
    let semilla = null;
    try {
      const sobre = C.deB64u(r.sobre), sal = C.deB64u(r.sal);
      const k = await C.claveDeCodigo(codigo, sal);
      semilla = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: sobre.subarray(0, 12), additionalData: C.te.encode('GUARDIANA sobre') }, k, sobre.subarray(12)));
    } catch (_) { return 'no vale'; }
    if (semilla.length !== 32) return 'no vale';
    return (await aceptaSemilla(semilla)) ? 'ok' : 'no vale';
  }
  async function aceptaSemilla(semilla, modo) {
    const B = modo === 'blindada';
    if (B && !C.B.hayBlindada()) { aviso(T('Este navegador no puede abrir una sesión blindada: hace falta uno actual.')); return false; }
    const d = B ? await C.B.deSemilla(semilla) : await C.deSemilla(semilla);
    if (CONVS.has(d.sala)) { abreConv(d.sala); return true; }
    if (esMovil()) await borraAnteriores(d.sala);
    if (!caben()) return false;
    const c = convNueva(d.sala, semilla, 'acepta', modo); c.num = siguienteNum();
    await preparaConv(c); await guardaConv(c);
    pintaLista(); abreConv(c.id);
    return true;
  }
  // Antes de entrar, «¿Aceptas?» (dueño, 15:42). Si el enlace es una invitación de este mismo navegador, se abre sin preguntar.
  let invitacionPendiente = null;
  async function preguntaInvitacion(enlace) {
    const m = String(enlace).match(/#([ib])=([A-Za-z0-9_-]{43})/); if (!m) return false;
    let semilla = null; try { semilla = C.deB64u(m[2]); } catch (_) { return false; } if (!semilla || semilla.length !== 32) return false;
    try { const d = m[1] === 'b' ? await C.B.deSemilla(semilla) : await C.deSemilla(semilla); if (CONVS.has(d.sala)) { abreConv(d.sala); return true; } } catch (_) {}
    invitacionPendiente = enlace; muestraAceptar(true); return true;
  }
  function muestraAceptar(ver) {
    $('#paso-aceptar').hidden = !ver; $('#inicio').classList.toggle('con-invitacion', ver); document.body.classList.toggle('aceptando', ver);
    if (ver) { for (const id of ['paso-inicio', 'paso-codigo', 'paso-enlace', 'paso-entrar']) { const e = $('#' + id); if (e) e.hidden = true; } $('#inicio').hidden = false; $('#conv').hidden = true; }
    else $('#paso-inicio').hidden = false;
  }
  // enlaces: «#b=» abre una sesión blindada; «#i=» (antiguos, ya no se muestran) sigue abriendo su conversación normal
  async function aceptaInvitacion(enlace) {
    let semilla = null, modo = 'normal';
    try { const m = String(enlace).match(/#([ib])=([A-Za-z0-9_-]{43})/); if (m) { semilla = C.deB64u(m[2]); modo = m[1] === 'b' ? 'blindada' : 'normal'; } } catch (_) {}
    if (!semilla || semilla.length !== 32) return false;
    return aceptaSemilla(semilla, modo);
  }

  // ---------- presentación y sesión ----------
  // Quién inicia: de las dos huellas, la menor. Quien inicia se presenta cuando llega o ve llegar; quien responde solo
  // contesta a una presentación (con «resp» = la época a la que contesta) y deriva la sesión en ese momento; quien
  // inicia deriva al recibir la respuesta a su época vigente. Así los dos usan el mismo par de efímeras.
  const soyInicio = (c) => !c.huella || C.hex(miHuella(c)) < C.hex(c.huella);
  const presentaX = (c, resp, forzar) => (esB(c) ? presentaB(c, resp, forzar) : presenta(c, resp, forzar));
  // presentarse va por la misma cola que las tramas de la conversación: nunca dos efímeras a medio camino
  const enCola = (c, f) => { c.proc = (c.proc || Promise.resolve()).then(f).catch((e) => console.warn(e)); return c.proc; };
  const reintenta = (c, ms) => { clearTimeout(c.reintento); c.reintento = setTimeout(() => { if (!c.sesion && c.suId && c.miembros.has(c.suId) && R.abierto) enCola(c, () => presentaX(c, null, true)); }, ms); };
  // Devuelve, cuando responde con ML-KEM, el secreto híbrido { ss, ek, ct } para derivar la sesión v3; si no, null.
  async function presenta(c, resp, forzar) {
    if (c.estado === 'destruida' || !R.abierto) return null;
    // una presentación espontánea en reacción a otra espontánea no se repite en ráfaga: si hace falta, el reintento la manda
    if (!resp && !forzar && c.presentadoEn && Date.now() - c.presentadoEn < 1200) { reintenta(c, 1400); return null; }
    c.ef = await C.efimera(); c.epoca = C.azar(16);
    // híbrido poscuántico (v3): quien inicia lleva una clave ML-KEM-768 nueva en cada presentación; quien responde
    // encapsula a la clave de la presentación que contesta. Sin la librería, o con una versión anterior, queda en v2.
    if (!resp && soyInicio(c) && C.hayPQ()) { try { c.ef.kem = C.kemPar(); } catch (e) { console.warn('ML-KEM', e); c.ef.kem = null; } }
    let pq = null;
    if (resp && resp.ek && C.hayPQ()) { try { const k = C.kemEncapsula(resp.ek); pq = { ss: k.ss, ek: resp.ek, ct: k.ct }; } catch (e) { console.warn('ML-KEM', e); pq = null; } }
    // las últimas efímeras propias, por época: una respuesta a cualquiera de ellas vale para derivar sesión
    c.efs = c.efs || new Map(); c.efs.set(C.hex(c.epoca), c.ef); for (const k of [...c.efs.keys()].slice(0, -4)) { const v = c.efs.get(k); if (v && v.kem) { v.kem.dk.fill(0); v.kem = null; } c.efs.delete(k); }
    // ronda 48: la firma ata la transcripción. Quien responde firma también la huella y la efímera de quien inicia.
    const datos = resp ? await C.datosResponde(c.id, YO.firmaPub, YO.acuerdoPub, c.ef.pub, c.epoca, resp.epoca, c.huella, resp.ef) : C.datosInicia(c.id, YO.firmaPub, YO.acuerdoPub, c.ef.pub, c.epoca);
    const sig = await C.firma(YO, datos);
    const j = { v: 2, firmaPub: C.b64u(YO.firmaPub), acuerdoPub: C.b64u(YO.acuerdoPub), ef: C.b64u(c.ef.pub), epoca: C.b64u(c.epoca), resp: resp ? C.b64u(resp.epoca) : '', nombre: YO.nombre, sig: C.b64u(sig) };
    // la segunda firma (v3) cubre además los campos ML-KEM; las versiones anteriores la ignoran y usan «sig»
    if (c.ef.kem) { j.kem = C.b64u(c.ef.kem.ek); j.sig3 = C.b64u(await C.firma(YO, C.datosInicia(c.id, YO.firmaPub, YO.acuerdoPub, c.ef.pub, c.epoca, c.ef.kem.ek))); }
    if (pq) { j.kemct = C.b64u(pq.ct); j.sig3 = C.b64u(await C.firma(YO, await C.datosResponde(c.id, YO.firmaPub, YO.acuerdoPub, c.ef.pub, c.epoca, resp.epoca, c.huella, resp.ef, pq))); }
    const iv = C.azar(12);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new Uint8Array([1]) }, c.presentacion, C.te.encode(JSON.stringify(j))));
    R.manda(c.id, c.suId || null, C.cat(new Uint8Array([1]), iv, ct));
    c.presentadoEn = Date.now();
    if (!resp) reintenta(c, 4000 + Math.random() * 1500);
    return pq;
  }
  async function recibePresentacion(c, de, b) {
    if (b.length < 30) return;
    let j;
    try { j = JSON.parse(C.td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.subarray(1, 13), additionalData: new Uint8Array([1]) }, c.presentacion, b.subarray(13)))); } catch (_) { return; }
    try {
      if (j.v !== 2) return;
      const firmaPub = C.deB64u(j.firmaPub), acuerdoPub = C.deB64u(j.acuerdoPub), ef = C.deB64u(j.ef), epoca = C.deB64u(j.epoca), sig = C.deB64u(j.sig), resp = j.resp ? C.deB64u(j.resp) : null;
      if (firmaPub.length !== 65 || acuerdoPub.length !== 65 || ef.length !== 65 || epoca.length !== 16 || (resp && resp.length !== 16)) return;
      // campos del híbrido (v3): la clave ML-KEM solo en una presentación que inicia, el texto cifrado solo en una
      // respuesta, y cualquiera de los dos solo con su segunda firma
      const kemEk = j.kem ? C.deB64u(j.kem) : null, kemCt = j.kemct ? C.deB64u(j.kemct) : null, sig3 = j.sig3 ? C.deB64u(j.sig3) : null;
      if ((kemEk && (resp || kemEk.length !== C.KEM_EK)) || (kemCt && (!resp || kemCt.length !== C.KEM_CT)) || ((kemEk || kemCt) && !sig3)) return;
      const huella = await C.huella(firmaPub, acuerdoPub);
      if (C.hex(huella) === C.hex(YO.huella)) return; // yo mismo desde otra pestaña
      if (c.huella && C.hex(c.huella) !== C.hex(huella)) { R.manda(c.id, de, new Uint8Array([5])); c.intrusos = (c.intrusos || 0) + 1; vigila(c, T('Intento de entrada con otra identidad: rechazado; la conversación sigue intacta.'), 'mal'); if (!c.intrusoAvisado) { c.intrusoAvisado = true; await anotaSistema(c, 'Alguien con otra identidad intentó entrar en esta conversación: rechazado.'); } pintaRadio(c); return; } // la invitación ya es de otra persona
      // una época nunca se acepta dos veces (repetición)
      c.epocasVistas = c.epocasVistas || new Set(); const eh = C.hex(epoca); if (c.epocasVistas.has(eh)) return; c.epocasVistas.add(eh); if (c.epocasVistas.size > 64) c.epocasVistas.delete(c.epocasVistas.values().next().value);
      const efMia = resp && c.efs ? c.efs.get(C.hex(resp)) : null;
      const datos = resp ? (efMia ? await C.datosResponde(c.id, firmaPub, acuerdoPub, ef, epoca, resp, YO.huella, efMia.pub) : null) : C.datosInicia(c.id, firmaPub, acuerdoPub, ef, epoca);
      if (!datos) return; // respuesta a una época que no es de las últimas mías: fuera
      if (!(await C.verifica(firmaPub, sig, datos))) return;
      // la segunda firma ata los campos ML-KEM a esta presentación; si no cuadra, la presentación entera se descarta
      if (kemEk && !(await C.verifica(firmaPub, sig3, C.datosInicia(c.id, firmaPub, acuerdoPub, ef, epoca, kemEk)))) return;
      if (kemCt) {
        if (!efMia.kem) return; // un texto cifrado para una clave ML-KEM que no mandé (o que ya se usó)
        if (!(await C.verifica(firmaPub, sig3, await C.datosResponde(c.id, firmaPub, acuerdoPub, ef, epoca, resp, YO.huella, efMia.pub, { ek: efMia.kem.ek, ct: kemCt })))) return;
      }
      const nueva = !c.huella;
      if (nueva) { c.firmaPub = firmaPub; c.acuerdoPub = acuerdoPub; c.huella = huella; c.estado = 'activa'; if (!c.nombre) c.nombre = String(j.nombre || '').slice(0, 40); }
      else if (!c.nombre && j.nombre) c.nombre = String(j.nombre).slice(0, 40);
      c.suId = de; c.miembros.add(de);
      if (nueva || j.nombre !== c.nombreVisto) { c.nombreVisto = j.nombre; await guardaConv(c); }
      const esResp = !!efMia;
      if (!soyInicio(c)) { const pq = await presenta(c, { epoca, ef, ek: kemEk }); await derivaSesion(c, ef, c.ef, pq); }
      else if (esResp) {
        // con texto cifrado ML-KEM, sesión híbrida; sin él (versión anterior al otro lado), la v2 de siempre (pq: false)
        const pq = kemCt ? { ss: C.kemAbre(kemCt, efMia.kem.dk), ek: efMia.kem.ek, ct: kemCt } : null;
        if (efMia.kem) { efMia.kem.dk.fill(0); efMia.kem = null; } // la clave privada ML-KEM de esa presentación ya no sirve
        await derivaSesion(c, ef, efMia, pq);
      }
      else if (!resp) await presenta(c, null);
      if (nueva) { if (c.codigo) R.retira(c.codigo); c.codigo = null; clearInterval(muestraInvitacion.reloj); await anotaSistema(c, 'Conversación establecida: encriptada de extremo a extremo. Comprueba el número de seguridad con la otra persona cuando puedas.'); if (ACTUAL === c.id) abreConv(c.id); else avisoConv(c, T('«{n}» ya está lista: la otra persona ha entrado.')); }
      if (c.estado === 'destruida_pendiente') { enviaControl(c, { tipo: 'destruir' }); setTimeout(() => destruyeLocal(c, false, true), 300); return; }
      mandaVaciar(c);
      pintaLista(); if (ACTUAL === c.id) pintaCabecera(c);
    } catch (e) { console.warn('presentación', e); }
  }
  async function derivaSesion(c, suEf, efMia, pq, acepta) {
    if (!efMia || !suEf || !c.acuerdoPub) { if (pq && pq.ss) pq.ss.fill(0); return; }
    // 27 Oct 2026, ronda 55 (ChatGPT y Astra): una conversación que ya tuvo sesión postcuántica no vuelve a solo ECDH sin que
    // la persona lo acepte expresamente; mientras, no hay sesión (no sale nada) y se explica arriba.
    // Ronda 56: lo publicado dice «no seguimos sin tu permiso», así que también la primera vez: si la otra persona tiene una
    // versión sin la capa postcuántica, la sesión se para hasta que se acepte. En una conversación que nunca la tuvo, el
    // permiso vale para esa conversación; en una que ya la tuvo, cada vuelta atrás se pregunta de nuevo.
    if (!pq && !acepta && (c.pqVisto || !c.clasicaAceptada)) {
      const yaParada = !!c.clasicaPendiente; c.clasicaPendiente = { suEf, efMia }; c.sesion = null;
      if (!yaParada) vigila(c, c.pqVisto ? T('Sesión sin protección postcuántica parada: esta conversación ya la tenía. Solo sigue si tú lo aceptas.') : T('Sesión sin protección postcuántica parada: la otra persona usa una versión anterior. Solo sigue si tú lo aceptas.'), 'mal');
      pintaCabecera(c); return;
    }
    c.clasicaPendiente = null;
    const inicio = soyInicio(c);
    const s = await C.sesion(YO, efMia, { ef: suEf, acuerdoPub: c.acuerdoPub }, c.id, inicio, c.psk, YO.huella, c.huella, pq || null);
    if (pq && pq.ss) pq.ss.fill(0);
    const sid = C.hex(s.hash.subarray(0, 8));
    // pq: true solo si esta sesión mezcla ML-KEM-768 con el ECDH (los dos lados con la versión nueva)
    const ses = { sid, hash: s.hash, envio: C.cadena(s.envio), recibo: C.cadena(s.recibo), desde: Date.now(), confirmada: false, pq: !!s.pq };
    c.sesiones.set(sid, ses); c.sesion = ses; clearTimeout(c.reintento); c.encuentros = (c.encuentros || 0) + 1;
    // 27 Oct 2026: el registro dice si la sesión lleva la capa poscuántica; si una conversación que ya la tuvo vuelve a una
    // sesión sin ella (la otra persona con una versión anterior, o alguien con la invitación quitándola), se avisa en rojo.
    if (ses.pq) { vigila(c, T('Claves nuevas acordadas con la otra persona (encriptación renovada, con protección postcuántica ML-KEM-768).'), 'info'); if (!c.pqVisto) { c.pqVisto = true; guardaConv(c); } }
    else if (c.pqVisto) vigila(c, T('Sesión sin la capa postcuántica: el otro equipo no la ha usado esta vez. La conversación sigue encriptada de extremo a extremo.'), 'mal');
    else vigila(c, T('Claves nuevas acordadas con la otra persona (encriptación renovada).'), 'info');
    for (const k of [...c.sesiones.keys()].slice(0, -3)) c.sesiones.delete(k);
    pintaCabecera(c); pintaLista();
    enviaControl(c, { tipo: 'ok' });
    if (YO.nombre) enviaControl(c, { tipo: 'nombre', nombre: YO.nombre });
    enviaCola(c);
    reenviaCustodias(c);
    if (ACTUAL === c.id && document.visibilityState === 'visible') marcaLeidos(c);
  }

  // ---------- sesión blindada (suite CNSA 2.0) ----------
  // La misma coreografía que la normal (quien tiene la huella menor inicia; quien responde contesta a una época concreta),
  // con P-384, ML-KEM-1024 obligatorio y dos firmas (ECDSA P-384 y ML-DSA-87) sobre exactamente los mismos bytes. Una
  // presentación a la que le falte cualquiera de las dos firmas, o el ML-KEM, se descarta sin más.
  async function presentaB(c, resp, forzar) {
    if (c.estado === 'destruida' || !R.abierto || !c.idB) return null;
    if (!resp && !forzar && c.presentadoEn && Date.now() - c.presentadoEn < 1200) { reintenta(c, 1400); return null; }
    if (resp && !resp.ek) return null; // sin la clave ML-KEM de quien inicia no hay respuesta posible
    c.ef = await C.B.efimera(); c.epoca = C.azar(16);
    if (!resp && soyInicio(c)) c.ef.kem = C.B.kemPar();
    let pq = null;
    if (resp) { const k = C.B.kemEncapsula(resp.ek); pq = { ss: k.ss, ek: resp.ek, ct: k.ct }; }
    c.efs = c.efs || new Map(); c.efs.set(C.hex(c.epoca), c.ef); for (const k of [...c.efs.keys()].slice(0, -4)) { const v = c.efs.get(k); if (v && v.kem) { v.kem.dk.fill(0); v.kem = null; } c.efs.delete(k); }
    const id = c.idB;
    const datos = resp
      ? await C.B.datosResponde(c.id, id.firmaPub, id.acuerdoPub, id.dsaPub, c.ef.pub, c.epoca, resp.epoca, c.huella, resp.ef, pq.ek, pq.ct)
      : await C.B.datosInicia(c.id, id.firmaPub, id.acuerdoPub, id.dsaPub, c.ef.pub, c.epoca, c.ef.kem ? c.ef.kem.ek : new Uint8Array(0));
    const sig = await C.B.firma(id, datos), sigpq = C.B.firmaPQ(c.idBDsaSec, datos);
    const j = { v: 4, b: 1, firmaPub: C.b64u(id.firmaPub), acuerdoPub: C.b64u(id.acuerdoPub), dsaPub: C.b64u(id.dsaPub), ef: C.b64u(c.ef.pub), epoca: C.b64u(c.epoca), resp: resp ? C.b64u(resp.epoca) : '', nombre: YO.nombre, sig: C.b64u(sig), sigpq: C.b64u(sigpq) };
    if (c.ef.kem) j.kem = C.b64u(c.ef.kem.ek);
    if (pq) j.kemct = C.b64u(pq.ct);
    const iv = C.azar(12);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new Uint8Array([1]) }, c.presentacion, C.B.rellena(C.te.encode(JSON.stringify(j)))));
    R.manda(c.id, c.suId || null, C.cat(new Uint8Array([1]), iv, ct));
    c.presentadoEn = Date.now();
    if (!resp) reintenta(c, 4000 + Math.random() * 1500);
    return pq;
  }
  async function recibePresentacionB(c, de, b) {
    if (b.length < 30 || !c.idB) return;
    let j;
    try { j = JSON.parse(C.td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.subarray(1, 13), additionalData: new Uint8Array([1]) }, c.presentacion, b.subarray(13)))); } catch (_) { return; }
    try {
      if (!j || j.v !== 4 || j.b !== 1) return;
      const firmaPub = C.deB64u(j.firmaPub), acuerdoPub = C.deB64u(j.acuerdoPub), dsaPub = C.deB64u(j.dsaPub), ef = C.deB64u(j.ef), epoca = C.deB64u(j.epoca), sig = C.deB64u(j.sig), sigpq = C.deB64u(j.sigpq), resp = j.resp ? C.deB64u(j.resp) : null;
      const kemEk = j.kem ? C.deB64u(j.kem) : null, kemCt = j.kemct ? C.deB64u(j.kemct) : null;
      if (firmaPub.length !== C.B.EC || acuerdoPub.length !== C.B.EC || ef.length !== C.B.EC || dsaPub.length !== C.B.DSA_PUB || epoca.length !== 16 || (resp && resp.length !== 16) || sigpq.length !== C.B.DSA_FIRMA) return;
      if ((kemEk && (resp || kemEk.length !== C.B.EK)) || (kemCt && kemCt.length !== C.B.CT) || (!!resp !== !!kemCt)) return;
      const huella = await C.B.huella(firmaPub, acuerdoPub, dsaPub);
      if (C.hex(huella) === C.hex(c.miHuellaB)) return; // yo mismo desde otra pestaña
      if (c.huella && C.hex(c.huella) !== C.hex(huella)) { R.manda(c.id, de, new Uint8Array([5])); c.intrusos = (c.intrusos || 0) + 1; vigila(c, T('Intento de entrada con otra identidad: rechazado; la conversación sigue intacta.'), 'mal'); if (!c.intrusoAvisado) { c.intrusoAvisado = true; await anotaSistema(c, 'Alguien con otra identidad intentó entrar en esta conversación: rechazado.'); } pintaRadio(c); return; }
      c.epocasVistas = c.epocasVistas || new Set(); const eh = C.hex(epoca); if (c.epocasVistas.has(eh)) return; c.epocasVistas.add(eh); if (c.epocasVistas.size > 64) c.epocasVistas.delete(c.epocasVistas.values().next().value);
      const efMia = resp && c.efs ? c.efs.get(C.hex(resp)) : null;
      if (resp && (!efMia || !efMia.kem)) return; // respuesta a una época que no es de las últimas mías (o ya usada): fuera
      const datos = resp
        ? await C.B.datosResponde(c.id, firmaPub, acuerdoPub, dsaPub, ef, epoca, resp, c.miHuellaB, efMia.pub, efMia.kem.ek, kemCt)
        : await C.B.datosInicia(c.id, firmaPub, acuerdoPub, dsaPub, ef, epoca, kemEk || new Uint8Array(0));
      if (!(await C.B.verifica(firmaPub, sig, datos)) || !C.B.verificaPQ(dsaPub, sigpq, datos)) return; // las dos firmas, o nada
      const nueva = !c.huella;
      if (nueva) { c.firmaPub = firmaPub; c.acuerdoPub = acuerdoPub; c.dsaPub = dsaPub; c.huella = huella; c.estado = 'activa'; if (!c.nombre) c.nombre = String(j.nombre || '').slice(0, 40); }
      else if (!c.nombre && j.nombre) c.nombre = String(j.nombre).slice(0, 40);
      c.suId = de; c.miembros.add(de);
      if (nueva || j.nombre !== c.nombreVisto) { c.nombreVisto = j.nombre; await guardaConv(c); }
      if (!soyInicio(c)) { if (kemEk && !resp) { const pq = await presentaB(c, { epoca, ef, ek: kemEk }); await derivaSesionB(c, ef, c.ef, pq); } }
      else if (resp) { const pq = { ss: C.B.kemAbre(kemCt, efMia.kem.dk), ek: efMia.kem.ek, ct: kemCt }; efMia.kem.dk.fill(0); efMia.kem = null; await derivaSesionB(c, ef, efMia, pq); }
      else await presentaB(c, null);
      if (nueva) { clearInterval(muestraInvitacion.reloj); await anotaSistema(c, 'Sesión blindada establecida. Si queréis, comparad el número de seguridad en «⋯» → «Seguridad y verificación».'); if (ACTUAL === c.id) abreConv(c.id); }
      if (c.estado === 'destruida_pendiente') { enviaControl(c, { tipo: 'destruir' }); setTimeout(() => destruyeLocal(c, false, true), 300); return; }
      mandaVaciar(c);
      pintaLista(); if (ACTUAL === c.id) pintaCabecera(c);
    } catch (e) { console.warn('presentación blindada', e); }
  }
  async function derivaSesionB(c, suEf, efMia, pq) {
    if (!efMia || !suEf || !c.acuerdoPub || !pq || !pq.ss) { if (pq && pq.ss) pq.ss.fill(0); return; }
    const inicio = soyInicio(c);
    const s = await C.B.sesion(c.idB, efMia, { ef: suEf, acuerdoPub: c.acuerdoPub }, c.id, inicio, c.psk, c.miHuellaB, c.huella, pq);
    pq.ss.fill(0);
    const sid = C.hex(s.hash.subarray(0, 8)), renovada = !!c.sesion;
    const ses = { sid, hash: s.hash, envio: C.B.cadena(s.envio), recibo: C.B.cadena(s.recibo), desde: Date.now(), confirmada: false, pq: true, blindada: true };
    c.sesiones.set(sid, ses); c.sesion = ses; clearTimeout(c.reintento); c.encuentros = (c.encuentros || 0) + 1;
    if (!c.pqVisto) { c.pqVisto = true; guardaConv(c); }
    vigila(c, renovada ? T('Claves renovadas (algoritmos de la suite CNSA 2.0): lo anterior ya no se puede leer con las claves nuevas.') : T('Claves acordadas con la otra persona: algoritmos de la suite CNSA 2.0 (ML-KEM-1024 y ECDH P-384).'), 'info');
    // de las sesiones anteriores quedan las dos últimas (por los mensajes en vuelo); las demás se borran de la memoria
    for (const k of [...c.sesiones.keys()].slice(0, -3)) { const x = c.sesiones.get(k); try { x.envio.borra(); x.recibo.borra(); } catch (_) {} c.sesiones.delete(k); }
    pintaCabecera(c); pintaLista();
    enviaControl(c, { tipo: 'ok' });
    if (YO.nombre) enviaControl(c, { tipo: 'nombre', nombre: YO.nombre });
    if (c.verificada) enviaControl(c, { tipo: 'verificada', si: 1, n: await hNumero(c) });
    enviaCola(c);
    reenviaCustodias(c);
    if (ACTUAL === c.id && document.visibilityState === 'visible') marcaLeidos(c);
  }
  // ---------- número de seguridad y verificación mutua ----------
  const numeroDe = (c) => (esB(c) ? C.B.numeroSeguridad(c.miHuellaB, c.huella) : C.numeroSeguridad(YO.huella, c.huella));
  const hNumero = async (c) => C.hex(await C.sha256(C.te.encode('GUARDIANA número comprobado\n' + (await numeroDe(c)))));
  async function marcaVerificada(c, si) {
    c.verificada = !!si; await guardaConv(c);
    if (esB(c) && c.huella) {
      enviaControl(c, { tipo: 'verificada', si: c.verificada ? 1 : 0, n: await hNumero(c) });
      await anotaSistema(c, c.verificada ? 'Has comprobado el número de seguridad.' : 'Has retirado tu comprobación del número de seguridad.');
      vigila(c, c.verificada ? T('Has comprobado el número de seguridad.') : T('Has retirado tu comprobación del número de seguridad.'), c.verificada ? 'bien' : 'info');
    }
    pintaCabecera(c); pintaRadio(c); enviaCola(c);
  }
  async function recibeVerificada(c, j) {
    if (!esB(c) || !c.huella) return;
    const antes = !!c.suVerificada;
    if (j.si === 1 && j.n === (await hNumero(c))) {
      c.suVerificada = true;
      if (!antes) { await anotaSistema(c, 'La otra persona ha comprobado el número de seguridad.'); vigila(c, T('La otra persona ha comprobado el número de seguridad.'), 'bien'); }
    } else if (j.si === 1) {
      // el otro equipo ve otro número: no son las mismas identidades en los dos lados (o alguien en medio)
      c.suVerificada = false;
      await anotaSistema(c, 'El número de seguridad no coincide en los dos equipos: no envíes nada y compruébalo de nuevo con la otra persona por otro canal.');
      vigila(c, T('El número de seguridad no coincide en los dos equipos: no envíes nada y compruébalo de nuevo con la otra persona por otro canal.'), 'mal');
      c.incidencias = (c.incidencias || 0) + 1;
    } else {
      c.suVerificada = false;
      if (antes) { await anotaSistema(c, 'La otra persona ha retirado su comprobación del número de seguridad.'); vigila(c, T('La otra persona ha retirado su comprobación del número de seguridad.'), 'info'); }
    }
    await guardaConv(c); pintaCabecera(c); pintaRadio(c); enviaCola(c);
  }
  // La puerta de la blindada: encima del campo de escribir, con el número a la vista, hasta que los dos lo comprueban
  async function pintaPuerta(c) {
    const p = $('#bl-puerta'); if (!p) return;
    const ver = false; void c; // la puerta ya no se enseña (15:30): el número sigue en «Seguridad y verificación»
    p.hidden = !ver; $('#conv').classList.toggle('bl-cerrada', ver);
    if (!ver) return;
    const n = await numeroDe(c); if ($('#bl-numero').textContent !== n) $('#bl-numero').textContent = n;
    const yo = $('#bl-yo'), otro = $('#bl-otro');
    yo.textContent = c.verificada ? T('Tú: comprobado') : T('Tú: pendiente'); yo.className = c.verificada ? 'si' : '';
    otro.textContent = c.suVerificada ? T('La otra persona: comprobado') : T('La otra persona: pendiente'); otro.className = c.suVerificada ? 'si' : '';
    const bt = $('#bl-coincide'); bt.textContent = c.verificada ? T('Retirar mi comprobación') : T('He comprobado que coincide'); bt.classList.toggle('principal', !c.verificada);
  }
  // ---------- informe de cierre (blindada) ----------
  function muestraCierre(c) {
    const n = c.mensajes.filter((m) => m.tipo === 'texto').length, a = c.mensajes.filter((m) => m.tipo === 'archivo').length, k = c.mensajes.filter((m) => m.tipo === 'custodia').length;
    $('#cierre-cuenta').textContent = n + ' ' + (n === 1 ? T('mensaje') : T('mensajes')) + ' · ' + a + ' ' + (a === 1 ? T('archivo') : T('archivos')) + ' · ' + k + ' ' + (k === 1 ? T('comprobante') : T('comprobantes'));
    $('#cierre-aviso-comp').hidden = !k;
    // en la sesión normal la identidad no es de la conversación: se queda en el navegador (28 Oct 2026, sin prometer de más)
    $('#cierre-este').textContent = esB(c)
      ? T('En este equipo: el secreto de la invitación, la identidad de esta sesión, todas sus claves, los mensajes, los archivos guardados en este navegador y los comprobantes.')
      : T('En este equipo: el secreto de la invitación, las claves de esta conversación, los mensajes, los archivos guardados en este navegador y los comprobantes. Tu identidad y tu nombre se quedan para la próxima conversación.');
    abreHoja('h-cierre');
  }
  // borrado criptográfico de lo que vive en memoria: claves de cadena, secreto de la invitación, psk e identidad de la sesión
  function borraClavesB(c) {
    try { for (const x of c.sesiones.values()) { if (x.envio.borra) x.envio.borra(); if (x.recibo.borra) x.recibo.borra(); } } catch (_) {}
    try { if (c.psk) c.psk.fill(0); if (c.semilla) c.semilla.fill(0); if (c.idBDsaSec) c.idBDsaSec.fill(0); if (c.efs) for (const v of c.efs.values()) if (v && v.kem) v.kem.dk.fill(0); } catch (_) {}
    c.sesion = null; c.sesiones = new Map(); c.idB = null; c.idBDsaSec = null; c.efs = null;
  }

  // ---------- mensajes ----------
  async function sella(c, obj) {
    const ses = c.sesion; if (!ses) return null;
    const { n, clave } = await ses.envio.siguiente();
    const cab = new Uint8Array(13); cab[0] = 2; cab.set(C.deHex(ses.sid), 1); new DataView(cab.buffer).setUint32(9, n);
    const claro = C.te.encode(JSON.stringify(obj));
    const ct = await C.sella(clave, n, esB(c) ? C.B.rellena(claro) : claro, C.cat(cab, ses.hash)); // AAD: cabecera + hash de sesión entero
    if (esB(c)) clave.fill(0); // la clave de este mensaje ya no sirve: fuera de la memoria
    return C.cat(cab, ct);
  }
  function enviaControl(c, obj) { if (!c.sesion || !R.abierto || !c.miembros.has(c.suId)) return false; sella(c, obj).then((b) => b && R.manda(c.id, c.suId, b)); return true; }
  const enLinea = (c) => !!(c.suId && c.miembros.has(c.suId) && c.sesion && R.abierto);
  // blindada: nada de contenido (mensajes, archivos, llamadas) hasta que los dos han comprobado el número de seguridad
  // dueño, 28 Oct 2026, 15:30: «ya no quiero que aparezcan los números… con el grado que tenemos de seguridad, creo que ya es
  // suficiente… tiene que ser una experiencia muy fácil»: la blindada ya no espera a la comprobación; compararlo es opcional
  const puedeEnviar = (c) => !!c;

  async function enviaTexto(c, texto) {
    const m = { id: uuid(), conv: c.id, t: Date.now(), dir: 'mia', estado: 'pendiente', tipo: 'texto', texto };
    await guardaMensaje(c, m); c.mensajes.push(m); c.cola.push(m);
    pintaMensaje(c, m); actualizaUltimo(c, m);
    enviaCola(c);
  }
  // «Borrar el chat» pendiente: sale en cuanto la sesión con la otra persona está lista (si no se pudo mandar, se queda pendiente)
  function mandaVaciar(c) { if (c && c.vaciarPendiente && enLinea(c) && enviaControl(c, { tipo: 'vaciar' })) { c.vaciarPendiente = false; guardaConv(c); } }
  async function enviaCola(c) {
    mandaVaciar(c);
    if (c.enviando) return; c.enviando = true;
    try {
      while (c.cola.length && enLinea(c) && puedeEnviar(c)) {
        const m = c.cola[0];
        const carga = m.tipo === 'texto' ? { tipo: 'texto', id: m.id, t: m.t, texto: m.texto } : m.tipo === 'archivo' ? { tipo: 'archivo', id: m.id, t: m.t, nombre: m.archivo.nombre, tam: m.archivo.tam, mime: m.archivo.mime, clave: m.archivo.clave, trozos: m.archivo.trozos, v: 1, region: MI_PAIS || undefined, voz: m.archivo.voz ? 1 : undefined } : null;
        if (!carga) { c.cola.shift(); continue; }
        const vj = m.tipo === 'archivo' && VIAJES.get(m.id), sesU = c.sesion; // la clave del archivo viaja en esta sesión
        const b = await sella(c, carga); if (!b || !R.manda(c.id, c.suId, b)) break;
        if (vj && sesU) { vj.pq = !!sesU.pq; vj.sid = sesU.sid; vj.sesionDesde = sesU.desde; vj.tAnuncio = Date.now(); }
        if (vj) evento(vj, T('Anuncio enviado al destinatario, encriptado de extremo a extremo; se espera su confirmación.')); // antes de cualquier espera: va antes que la respuesta
        c.cola.shift(); m.estado = 'enviado'; await guardaMensaje(c, m); pintaEstado(m);
        if (m.tipo === 'archivo') mandaArchivo(c, m);
      }
    } finally { c.enviando = false; }
  }
  async function recibeMensaje(c, de, b) {
    if (b.length < 13 + 16) return;
    const sid = C.hex(b.subarray(1, 9)), n = new DataView(b.buffer, b.byteOffset).getUint32(9);
    const ses = c.sesiones.get(sid);
    if (!ses) { if (!c.clasicaPendiente) R.manda(c.id, de, new Uint8Array([4])); return; } // no conozco esa sesión: que se presente otra vez (salvo con la sesión sin capa postcuántica parada: no se vuelve a negociar en bucle)
    let j;
    try { const k = await ses.recibo.para(n); j = JSON.parse(C.td.decode(await C.abre(k, n, b.subarray(13), C.cat(b.subarray(0, 13), ses.hash)))); } catch (e) { if (!/repetido|saltados/.test(e.message)) { c.incidencias = (c.incidencias || 0) + 1; await anotaSistema(c, 'Un mensaje no superó la comprobación de integridad y se ha descartado.'); vigila(c, T('Un mensaje no superó la autenticación: descartado.'), 'mal'); pintaRadio(c); } return; }
    if (c.suId !== de) return;
    c.ultimaVerificacion = Date.now();
    if (!ses.confirmada) { ses.confirmada = true; if (c.sesion === ses) pintaCabecera(c); vigila(c, T('Confirmación de clave recibida: la otra persona tiene la misma clave.'), 'bien'); } // la otra persona tiene la misma clave: sesión confirmada
    switch (j.tipo) {
      case 'texto': {
        if (c.mensajes.some((x) => x.id === j.id)) { enviaControl(c, { tipo: 'ack', ids: [j.id] }); return; }
        const m = { id: String(j.id).slice(0, 64), conv: c.id, t: Math.min(Date.now(), +j.t || Date.now()), dir: 'suya', estado: 'recibido', tipo: 'texto', texto: String(j.texto || '').slice(0, 20000) };
        await guardaMensaje(c, m); c.mensajes.push(m); pintaMensaje(c, m); actualizaUltimo(c, m, true); vigila(c, T('Mensaje recibido: superó la verificación criptográfica.'), 'ok'); pintaRadio(c);
        enviaControl(c, { tipo: 'ack', ids: [m.id] });
        const aLaVista = ACTUAL === c.id && document.visibilityState === 'visible';
        if (aLaVista) marcaLeidos(c);
        avisaFuera(c, 'mensaje'); if (!aLaVista) avisaSonido(); // el pip siempre; el aviso del sistema va en silencio para no sonar dos veces
        return;
      }
      case 'ok': return;
      // «escribiendo…» o «grabando audio…» de la otra persona (dueño, 28 Oct 2026, 13:29)
      case 'escribe': { if (ACTUAL === c.id && pref('escribe')) muestraEscribe(c, j.que === 'audio' ? 'audio' : j.que === 'texto' ? 'texto' : ''); return; }
      case 'ack': case 'leido': {
        const est = j.tipo === 'ack' || !pref('leido') ? 'entregado' : 'leido';
        for (const id of j.ids || []) { const m = c.mensajes.find((x) => x.id === id && x.dir === 'mia'); if (m && (est === 'leido' || m.estado === 'enviado' || m.estado === 'pendiente')) { if (!(m.estado === 'leido')) { m.estado = est; await guardaMensaje(c, m); pintaEstado(m); if (est === 'entregado' && m.tipo === 'texto') vigila(c, T('Mensaje entregado: acuse del otro equipo.'), 'ok'); } } }
        return;
      }
      case 'verificada': return recibeVerificada(c, j);
      case 'nombre': { const n = String(j.nombre || '').trim().slice(0, 40); if (!c.nombreFijado && n && n !== c.nombre) { c.nombre = n; await guardaConv(c); pintaLista(); pintaCabecera(c); } return; }
      case 'archivo': return recibeAnuncioArchivo(c, j, ses);
      case 'archivo-ack': { const a = c.archivos.get(j.id); if (a && a.envio) { a.ack = Math.max(a.ack, +j.hasta || 0); a.sigue && a.sigue(); acuseViaje(j, a); } return; }
      case 'archivo-listo': { const a = c.archivos.get(j.id); if (a && a.envio) { a.listo = true; a.sigue && a.sigue(); listoViaje(c, j); } return; }
      case 'viaje': { const v = VIAJES.get(j.id); if (v) { const l = latValida(j.lat); if (l != null) v.latSuya.push(l); if (v.rol === 'recibe' && typeof j.bytes === 'number' && isFinite(j.bytes)) v.enCamino = Math.max(0, Math.min(v.tam, j.bytes) - (v.confirmados || 0)); } return; }
      case 'custodia': return recibeCustodia(c, j);
      case 'custodia-firma': return firmaCustodia(c, j);
      case 'custodia-no': return rechazoCustodia(c, j);
      case 'archivo-fin': { const a = c.archivos.get(j.id); const m = c.mensajes.find((x) => x.id === j.id); const v = VIAJES.get(j.id); if (a) c.archivos.delete(j.id); if (m) { m.estado = j.ok ? 'entregado' : 'fallo'; m.archivo.progreso = j.ok ? 1 : m.archivo.progreso; await guardaMensaje(c, m); pintaMensaje(c, m, true); vigila(c, (j.ok ? T('Archivo entregado') : T('Archivo no completado')) + ': ' + m.archivo.nombre + (j.ok ? ' · ' + T('acuse del otro equipo: completo y autenticado.') : ''), j.ok ? 'bien' : 'mal'); pintaRadio(c); if (j.ok && v && v.custodia === 'si' && j.v === 1 && a && a.sha256) await entregaViaje(c, m, a, v, j); else { if (v) finViaje(v, j.ok, j); if (j.ok) await recibo(c, m, +j.seg || 0, +j.trozos || m.archivo.trozos, true); } } return; }
      case 'archivo-cancel': { const a = c.archivos.get(j.id); if (a) { a.cancelado = true; if (a.escritor) { try { await a.escritor.abort(); } catch (_) {} } c.archivos.delete(j.id); } const m = c.mensajes.find((x) => x.id === j.id); const vc = VIAJES.get(j.id); if (vc && vc.estado !== 'entregado') { vc.estado = 'fallo'; vc.tFin = Date.now(); evento(vc, j.por === 'integridad' ? T('El otro equipo ha detenido el envío: un fragmento no superó la autenticación.') : j.por === 'persona' ? T('La otra persona ha cortado el envío.') : T('El otro equipo ha cancelado el envío.'), 'mal'); } if (m && m.estado !== 'recibido') { m.estado = 'fallo'; if (j.por === 'persona') m.archivo.motivo = T('cortado por la otra persona'); if (j.por === 'integridad') { m.archivo.motivo = T('cortado en el otro lado: datos alterados'); c.incidencias = (c.incidencias || 0) + 1; await anotaSistema(c, 'La otra persona cortó un envío porque no superó la comprobación de integridad.'); } await guardaMensaje(c, m); pintaMensaje(c, m, true); pintaRadio(c); } return; }
      // llamadas (dueño, 27 Oct 2026, 23:05). Con varias conversaciones: una llamada de otra conversación también suena; si ya
      // hay una llamada en curso con otra, se le dice «ocupado» sin decir nada más (agencia, ronda 74, bloque J)
      case 'llamada': {
        if (!LL) return;
        if (j.acto === 'oferta') {
          if (LL.ocupado && LLAMADA_CONV && LLAMADA_CONV !== c.id) { enviaControl(c, { tipo: 'llamada', acto: 'ocupado', id: j.id }); return; }
          if (!LL.ocupado) LLAMADA_CONV = c.id;
          await LL.recibe(j); pintaLista(); return;
        }
        if (LLAMADA_CONV ? LLAMADA_CONV === c.id : c.id === ACTUAL) await LL.recibe(j);
        return;
      }
      case 'vaciar': return vaciaLocal(c, true);
      case 'destruir': return destruyeLocal(c, true);
      default: return;
    }
  }
  async function guardaMensaje(c, m) {
    const cuerpo = m.tipo === 'texto' ? { tipo: 'texto', texto: m.texto } : m.tipo === 'archivo' ? { tipo: 'archivo', archivo: m.archivo } : m.tipo === 'custodia' ? { tipo: 'custodia', custodia: m.custodia, texto: m.texto } : { tipo: m.tipo, texto: m.texto, llamada: m.llamada };
    const s = await guardaSellado(cuerpo);
    await BD.pon('msg', { id: m.id, conv: c.id, t: m.t, dir: m.dir, estado: m.estado, iv: s.iv, datos: s.datos });
  }
  async function cargaMensajes(c) {
    if (c.cargados) return;
    const xs = (await BD.porConv('msg', c.id)).sort((a, b) => a.t - b.t);
    c.mensajes = [];
    for (const x of xs) { const cu = await leeSellado(x); if (!cu) continue; const m = { id: x.id, conv: c.id, t: x.t, dir: x.dir, estado: x.estado, tipo: cu.tipo, texto: cu.texto, archivo: cu.archivo, llamada: cu.llamada, custodia: cu.custodia }; if (m.dir === 'mia' && m.estado === 'pendiente') c.cola.push(m); if (m.tipo === 'archivo' && m.dir === 'mia' && m.estado !== 'entregado' && m.estado !== 'leido' && m.archivo && (m.archivo.progreso || 0) < 1) { m.estado = 'fallo'; c.cola = c.cola.filter((q) => q !== m); } if (m.tipo === 'archivo' && m.dir === 'suya' && m.estado === 'recibiendo') m.estado = 'fallo'; c.mensajes.push(m); }
    c.cargados = true;
  }
  async function anotaSistema(c, texto) {
    const m = { id: uuid(), conv: c.id, t: Date.now(), dir: 'sistema', estado: 'ok', tipo: 'sistema', texto };
    await guardaMensaje(c, m); c.mensajes.push(m); pintaMensaje(c, m);
  }
  async function actualizaUltimo(c, m, suyo) {
    c.ultimo = m.t; c.ultimoTexto = await guardaSellado({ texto: m.tipo === 'texto' ? m.texto : m.tipo === 'archivo' ? '📎 ' + m.archivo.nombre : m.texto || '' });
    if (suyo && !(ACTUAL === c.id && document.visibilityState === 'visible')) c.noLeidos = (c.noLeidos || 0) + 1;
    if (suyo && ACTUAL !== c.id && document.visibilityState === 'visible') avisoConv(c, m.tipo === 'archivo' ? T('Archivo nuevo en «{n}»') : T('Mensaje nuevo en «{n}»'));
    await guardaConv(c); pintaLista();
  }
  // «Leído» solo cuando de verdad se ve (agencia, ronda 74, ChatGPT y Gemini): la pestaña a la vista y con el foco, sin la
  // llamada en grande ni una hoja encima, y el mensaje dentro de la zona visible del chat. Una vez leído, no vuelve atrás.
  const seVeElChat = () => { if (document.visibilityState !== 'visible' || !document.hasFocus() || document.querySelector('.gc-hoja.gc-abierta')) return false; const ll = $('#llamada'); return !(ll && ll.classList.contains('gc-abierta') && !ll.classList.contains('mini')); };
  function enPantalla(id) {
    const ul = $('#mensajes'), li = ul && ul.querySelector('[data-id="' + id + '"]'); if (!li) return false;
    const a = ul.getBoundingClientRect(), b = li.getBoundingClientRect(), vis = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return vis > 0 && vis >= Math.min(b.height * 0.5, 120);
  }
  // privacidad (agencia, ronda 74; recíproca, como Signal): sin «leído» o sin «escribiendo…», ni se envía ni se ve
  const pref = (k) => { try { return localStorage.getItem('gcom-' + k) !== '0'; } catch (_) { return true; } };
  async function marcaLeidos(c) {
    if (!c || ACTUAL !== c.id || !seVeElChat()) return;
    const ids = c.mensajes.filter((m) => m.dir === 'suya' && m.estado === 'recibido' && enPantalla(m.id)).map((m) => m.id);
    // sin «confirmaciones de lectura» se apunta aquí como leído, pero no se envía (y al reactivarlas no se mandan las antiguas)
    if (ids.length && (!pref('leido') || enviaControl(c, { tipo: 'leido', ids }))) { for (const m of c.mensajes) if (ids.includes(m.id)) { m.estado = 'leido'; await guardaMensaje(c, m); } }
    if (c.noLeidos) { c.noLeidos = 0; await guardaConv(c); pintaLista(); }
  }

  // ---------- archivos ----------
  // Cualquier archivo, del tamaño que sea: quien manda lo lee por trozos de 192 KB (nunca entero en memoria), cada trozo
  // va sellado con AES-256-GCM bajo la clave del archivo y con su número en los datos asociados, así que un trozo
  // falso o fuera de sitio no abre; el relé solo ve bytes. Quien recibe lo escribe directo al disco si el navegador
  // lo permite (Chrome, Edge: «Guardar en…») o lo junta en memoria hasta MAX_MEMORIA (los demás). Quien manda espera a
  // «archivo-listo» y luego avanza con ventana (acuses cada 4 trozos) sin pasarse del cupo del relé.
  const MAX_MEMORIA = 300 * 1024 * 1024;
  const conDisco = () => typeof window.showSaveFilePicker === 'function';
  const fidDe = (id) => C.deHex(id.replace(/-/g, '').slice(0, 32).padEnd(32, '0'));
  async function enviaArchivos(c, archivos, opc) {
    const voz = !!(opc && opc.voz);
    for (const f of archivos) {
      if (!f || !f.size) continue;
      const clave = C.azar(32), trozos = Math.ceil(f.size / TROZO) || 1;
      const m = { id: uuid(), conv: c.id, t: Date.now(), dir: 'mia', estado: 'pendiente', tipo: 'archivo', archivo: { nombre: (f.name || 'archivo').slice(0, 180), tam: f.size, mime: f.type || 'application/octet-stream', clave: C.b64u(clave), trozos, progreso: 0, voz: voz || undefined } };
      c.archivos.set(m.id, { envio: true, f, clave: await C.aes(clave), ack: 0, trozos, listo: false, enviados: 0 });
      if (f.size <= MAX_MEMORIA && /^(image|audio)\//.test(m.archivo.mime)) await BD.pon('arch', { id: m.id, conv: c.id, blob: f, nombre: m.archivo.nombre, mime: m.archivo.mime, tam: f.size });
      const v = viajeNuevo(c, m, 'envia'); v.voz = voz;
      evento(v, T('Archivo preparado') + ': ' + trozos.toLocaleString(LOC()) + ' ' + T('fragmentos de 192 KB, cada uno encriptado y autenticado por separado (AES-256-GCM).'));
      await guardaMensaje(c, m); c.mensajes.push(m); c.cola.push(m); pintaMensaje(c, m); actualizaUltimo(c, m);
      abreSiToca(v);
    }
    enviaCola(c);
  }
  async function falla(c, m, texto) {
    m.estado = 'fallo'; await guardaMensaje(c, m); pintaMensaje(c, m, true); if (texto) aviso(texto);
    const v = VIAJES.get(m.id); if (v && v.estado !== 'entregado' && v.estado !== 'fallo') { v.estado = 'fallo'; v.tFin = Date.now(); evento(v, T('Envío interrumpido.') + (texto ? ' ' + texto : ''), 'mal'); }
  }
  async function mandaArchivo(c, m) {
    const a = c.archivos.get(m.id);
    if (!a || !a.f) return falla(c, m, T('Ese archivo ya no está disponible para enviarlo: elígelo otra vez.'));
    // espera «archivo-listo» (la otra persona ha elegido dónde guardarlo o lo recibe en memoria)
    const t0 = Date.now();
    while (!a.listo) { if (a.cancelado || c.estado === 'destruida') return; if (!enLinea(c) || Date.now() - t0 > 10 * 60 * 1000) return falla(c, m); await new Promise((r) => { a.sigue = r; setTimeout(r, 500); }); }
    const fid = fidDe(m.id); a.t0 = Date.now();
    const v = VIAJES.get(m.id), huella = window.GuardianaSHA256 ? GuardianaSHA256.crea() : null;
    if (v) { v.estado = 'viaje'; v.t0 = a.t0; VJ() && VJ().muestra(v, 0); vigilaViajes(); abreSiToca(v, true); }
    for (let i = 0; i < a.trozos; i++) {
      if (a.cancelado || c.estado === 'destruida') return;
      while (i - a.ack >= (esB(c) ? VENTANA_B : VENTANA) || R.atraso > (esB(c) ? 8 : 3) * 1024 * 1024) { if (!enLinea(c)) return falla(c, m, T('Se perdió la conexión.')); await new Promise((r) => { a.sigue = r; setTimeout(r, 300); }); if (a.cancelado) return; }
      let claro; try { claro = new Uint8Array(await a.f.slice(i * TROZO, (i + 1) * TROZO).arrayBuffer()); } catch (_) { return falla(c, m, T('No se pudo leer el archivo: ¿sigue en el mismo sitio?')); }
      if (huella) huella.pon(claro); // la huella del archivo entero, en orden: la misma que calcula el equipo del destinatario
      const cab = new Uint8Array(21); cab[0] = 3; cab.set(fid, 1); new DataView(cab.buffer).setUint32(17, i);
      // blindada: el último trozo sale completo (192 KB), así el relé no ve el tamaño exacto del archivo
      const carga = esB(c) && claro.length < TROZO ? (() => { const x = new Uint8Array(TROZO); x.set(claro); return x; })() : claro;
      const ct = await C.sella(a.clave, i, carga, cab);
      if (!R.manda(c.id, c.suId, C.cat(cab, ct))) return falla(c, m, T('Se perdió la conexión.'));
      a.enviados += claro.length;
      if (v && i === 0) { v.salida = new Date().toISOString(); v.tipoReal = VJ().tipoPorContenido(claro); evento(v, T('Primer fragmento enviado al relé de GUARDIANA') + (v.rele && v.rele.ciudad && !v.rele.prueba ? ' · ' + v.rele.ciudad + ', ' + VJ().pais(v.rele.cc) : '') + '.'); }
      m.archivo.progreso = (i + 1) / a.trozos; pintaProgreso(m);
    }
    if (huella) a.sha256 = C.hex(huella.cierra());
    if (v) v.tUltimo = Date.now();
    if (v) evento(v, T('Último fragmento enviado: se espera la confirmación del destinatario.'));
  }
  async function recibeAnuncioArchivo(c, j, ses) {
    if (c.mensajes.some((x) => x.id === j.id)) return;
    const tam = +j.tam || 0, trozos = +j.trozos || 0;
    if (!tam || trozos !== (Math.ceil(tam / TROZO) || 1) || !j.clave) { enviaControl(c, { tipo: 'archivo-cancel', id: j.id }); return; }
    const voz = j.voz === 1, custodia = j.v === 1 && !voz;
    const m = { id: String(j.id).slice(0, 64), conv: c.id, t: Math.min(Date.now(), +j.t || Date.now()), dir: 'suya', estado: 'recibiendo', tipo: 'archivo', archivo: { nombre: limpiaNombre(j.nombre), tam, mime: String(j.mime || 'application/octet-stream').slice(0, 100), trozos, progreso: 0, aDisco: tam > MAX_MEMORIA || (conDisco() && tam > 32 * 1024 * 1024), custodia: custodia ? 1 : undefined } };
    const a = { envio: false, clave: await C.aes(C.deB64u(j.clave)), partes: null, escritor: null, siguiente: 0, tengo: 0, trozos, m, pendientes: new Map(), huella: window.GuardianaSHA256 ? GuardianaSHA256.crea() : null, hPtr: 0 };
    c.archivos.set(m.id, a);
    const v = viajeNuevo(c, m, 'recibe'); v.voz = voz; v.custodia = voz ? 'voz' : custodia ? 'si' : 'no'; v.paisSuyo = regionValida(j.region); v.pq = !!(ses && ses.pq); v.sid = ses ? ses.sid : ''; v.sesionDesde = ses ? ses.desde : null;
    evento(v, T('Anuncio del archivo recibido, encriptado de extremo a extremo') + ': ' + trozos.toLocaleString(LOC()) + ' ' + T('fragmentos') + '.');
    if (!m.archivo.aDisco) { a.partes = new Array(trozos); a.listo = true; }
    else if (!conDisco()) { enviaControl(c, { tipo: 'archivo-cancel', id: m.id }); c.archivos.delete(m.id); m.estado = 'fallo'; m.archivo.motivo = T('Pasa de 300 MB y este navegador no puede escribirlo al disco según llega (Chrome o Edge sí).'); v.estado = 'fallo'; evento(v, m.archivo.motivo, 'mal'); }
    await guardaMensaje(c, m); c.mensajes.push(m); pintaMensaje(c, m); actualizaUltimo(c, m, true);
    avisaFuera(c, voz ? 'voz' : 'archivo');
    if (a.listo) { enviaControl(c, listoCarga(m.id, v)); evento(v, T('Listo para recibir: aviso enviado al remitente.')); }
    else if (m.estado !== 'fallo') { v.eligeDestino = true; evento(v, T('Elige dónde guardarlo para empezar la recepción.')); avisaSonido(); if (ACTUAL !== c.id) aviso(T('Te están mandando un archivo grande: elige dónde guardarlo.')); }
  }
  const listoCarga = (id, v) => ({ tipo: 'archivo-listo', id, v: 1, region: MI_PAIS || undefined, lat: v ? VJ() && VJ().minima(v.latMia) : undefined });
  // «Guardar en…» (archivos grandes): la persona elige el destino y, desde ahí, cada trozo se escribe según llega.
  async function eligeDestino(c, m) {
    const a = c.archivos.get(m.id); if (!a || a.listo) return;
    try {
      const h = await window.showSaveFilePicker({ suggestedName: m.archivo.nombre });
      a.escritor = await h.createWritable(); a.listo = true; a.nombreDisco = h.name;
      const v = VIAJES.get(m.id); if (v) v.eligeDestino = false;
      enviaControl(c, listoCarga(m.id, v)); if (v) evento(v, T('Destino elegido en tu disco: aviso enviado al remitente.'));
      m.archivo.enDisco = true; pintaMensaje(c, m, true);
    } catch (_) { /* canceló el diálogo: el botón sigue ahí */ }
  }
  async function recibeTrozo(c, de, b) {
    if (b.length < 21 + 16 || c.suId !== de) return;
    const fid = C.hex(b.subarray(1, 17)), i = new DataView(b.buffer, b.byteOffset).getUint32(17);
    const m = c.mensajes.find((x) => x.tipo === 'archivo' && x.dir === 'suya' && C.hex(fidDe(x.id)) === fid);
    const a = m && c.archivos.get(m.id); if (!a || a.envio || !a.listo || i >= a.trozos) return;
    let claro; try { claro = await C.abre(a.clave, i, b.subarray(21), b.subarray(0, 21)); } catch (_) { return incidencia(c, m, a, 'Un trozo del archivo no superó la comprobación de integridad: envío cortado.'); }
    const esperado = i < a.trozos - 1 ? TROZO : m.archivo.tam - (a.trozos - 1) * TROZO;
    if (esB(c) && claro.length === TROZO && esperado < TROZO) claro = claro.subarray(0, esperado); // el relleno del último trozo
    if (claro.length !== esperado) return incidencia(c, m, a, 'Un trozo del archivo no coincide con lo anunciado: envío cortado.');
    const v = VIAJES.get(m.id);
    if (v && i === 0 && !v.tipoReal) v.tipoReal = VJ().tipoPorContenido(claro);
    if (!a.t0) { a.t0 = Date.now(); if (v) { v.estado = 'viaje'; v.t0 = a.t0; VJ() && VJ().muestra(v, 0); evento(v, T('Primer fragmento recibido y autenticado en tu equipo.')); vigilaViajes(); abreSiToca(v, true); } }
    c.ultimaVerificacion = Date.now();
    if (a.partes) {
      if (a.partes[i]) return; a.partes[i] = claro; a.tengo++;
      // la huella, en orden: los fragmentos llegan en orden y, si no, esperan a los anteriores
      if (a.huella) while (a.hPtr < a.trozos && a.partes[a.hPtr]) { a.huella.pon(a.partes[a.hPtr]); a.hPtr++; }
    }
    else {
      // al disco, en orden: lo que llega adelantado espera en memoria (como mucho la ventana)
      if (i < a.siguiente || a.pendientes.has(i)) return;
      a.pendientes.set(i, claro);
      while (a.pendientes.has(a.siguiente)) { const x = a.pendientes.get(a.siguiente); a.pendientes.delete(a.siguiente); if (a.huella) a.huella.pon(x); try { await a.escritor.write(x); } catch (_) { c.archivos.delete(m.id); enviaControl(c, { tipo: 'archivo-cancel', id: m.id }); return falla(c, m, T('No se pudo escribir el archivo en el disco.')); } a.siguiente++; a.tengo++; a.hPtr++; }
    }
    m.archivo.progreso = a.tengo / a.trozos; pintaProgreso(m);
    if (v) { v.verificados = a.tengo; v.confirmados = a.tengo === a.trozos ? v.tam : Math.min(v.tam, a.tengo * TROZO); VJ() && VJ().muestra(v, v.confirmados); hito(v, T('Recibido y autenticado en tu equipo')); }
    if (a.tengo % 4 === 0 || a.tengo === a.trozos) enviaControl(c, { tipo: 'archivo-ack', id: m.id, hasta: a.tengo, lat: v && VJ() ? VJ().minima(v.latMia) : undefined });
    if (a.tengo === a.trozos) {
      c.archivos.delete(m.id);
      let ok = true;
      if (a.partes) { const blob = new Blob(a.partes, { type: m.archivo.mime }); ok = blob.size === m.archivo.tam; if (ok) await BD.pon('arch', { id: m.id, conv: c.id, blob, nombre: m.archivo.nombre, mime: m.archivo.mime, tam: blob.size }); }
      else { try { await a.escritor.close(); } catch (_) { ok = false; } }
      m.estado = ok ? 'recibido' : 'fallo'; m.archivo.progreso = 1;
      const seg = Math.max(0.1, (Date.now() - (a.t0 || Date.now())) / 1000);
      vigila(c, ok ? T('Archivo recibido') + ': ' + m.archivo.nombre + ' · ' + a.trozos + ' ' + T('trozos autenticados, completo.') : T('Archivo incompleto: ') + m.archivo.nombre, ok ? 'bien' : 'mal');
      // lo que este equipo ha medido: entra en el comprobante y se comprueba antes de firmarlo (se guarda con el mensaje)
      const sha = ok && a.huella && a.hPtr === a.trozos ? C.hex(a.huella.cierra()) : null;
      const obs = sha ? { sha256: sha, llegada: new Date().toISOString(), primero: iso(a.t0), anuncio: v ? iso(v.tCreado) : null, lat: v && VJ() ? VJ().estad(v.latMia) : null, verificada: !!c.verificada, nombre: YO.nombre || '', region: MI_PAIS || '', version: VERSION_APP, tipo: (v && v.tipoReal) || null, mutua: esB(c) ? !!(c.verificada && c.suVerificada) : undefined, pq: !!(v && v.pq), sid: (v && v.sid) || '', rele: v && v.rele ? v.rele.host || '' : '', rele_region: R.region || '' } : null;
      if (obs && m.archivo.custodia) m.archivo.obs = obs;
      await guardaMensaje(c, m); pintaMensaje(c, m, true); pintaRadio(c);
      const fin = { tipo: 'archivo-fin', id: m.id, ok, seg: Math.round(seg * 10) / 10, trozos: a.trozos };
      if (obs) Object.assign(fin, { v: 1, sha256: obs.sha256, llegada: obs.llegada, primero: obs.primero, anuncio: obs.anuncio, lat: obs.lat, verificada: obs.verificada, nombre: obs.nombre, region: obs.region || undefined, version: obs.version, tipoReal: obs.tipo, mutua: obs.mutua }); // «tipo» es el del mensaje: el del archivo va en «tipoReal»
      enviaControl(c, fin);
      if (v) { finViaje(v, ok); if (ok) { v.coincide = undefined; evento(v, T('Último fragmento autenticado: archivo completo.'), 'bien'); if (sha) evento(v, T('Huella SHA-256 calculada en tu equipo') + ': ' + VJ().agrupa(sha, 16) + '…'); } }
      // con comprobante, la tarjeta firmada sustituye al recibo; si no llega en 30 s, queda el recibo de siempre
      if (ok && !(m.archivo.custodia && obs)) await recibo(c, m, seg, a.trozos, false);
      else if (ok) setTimeout(() => { if (!c.mensajes.some((x) => x.id === 'cu-' + m.id) && c.estado !== 'destruida') recibo(c, m, seg, a.trozos, false); }, 30000);
      if (ok && !(ACTUAL === c.id && document.visibilityState === 'visible')) avisaSonido();
    }
  }
  // Manipulación detectada (ronda del dueño, 26 Oct 20:03): se corta el envío al instante, queda marcado en coral y anotado.
  async function incidencia(c, m, a, texto) {
    c.incidencias = (c.incidencias || 0) + 1;
    if (a) { a.cancelado = true; if (a.escritor) { try { await a.escritor.abort(); } catch (_) {} } c.archivos.delete(m.id); }
    enviaControl(c, { tipo: 'archivo-cancel', id: m.id, por: 'integridad' });
    m.estado = 'fallo'; m.archivo.motivo = T('detenido: no superó la autenticación'); await guardaMensaje(c, m); pintaMensaje(c, m, true);
    const v = VIAJES.get(m.id); if (v) { v.estado = 'fallo'; v.tFin = Date.now(); evento(v, T(texto), 'mal'); }
    await anotaSistema(c, texto); aviso(T(texto)); vigila(c, T(texto), 'mal'); pintaRadio(c);
  }
  // Recibo de entrega (dueño, 26 Oct 20:25): aparece solo en el chat cuando el archivo ha llegado entero al otro equipo.
  const segundos = (x) => (x < 60 ? x.toLocaleString(LOC(), { maximumFractionDigits: 1 }) + ' s' : Math.floor(x / 60) + ' min ' + Math.round(x % 60) + ' s');
  async function recibo(c, m, seg, trozos, entregado) {
    const texto = (entregado ? T('Recibo de entrega') : T('Recibo de recepción')) + ' · ' + m.archivo.nombre + ' · ' + tamano(m.archivo.tam) + ' · ' + T('en') + ' ' + segundos(seg) + ' · ' + trozos + ' ' + T('trozos comprobados') + ' · ' + T('encriptado de extremo a extremo; cada trozo superó la autenticación') + ' · ' + T('contenido no analizado: viaja encriptado');
    const r = { id: uuid(), conv: c.id, t: Date.now(), dir: 'sistema', estado: 'ok', tipo: 'recibo', texto };
    await guardaMensaje(c, r); c.mensajes.push(r); pintaMensaje(c, r);
  }
  // ---------- el viaje del archivo y el comprobante de custodia digital ----------
  const MIN_VIAJE = 1024 * 1024; // el viaje se abre solo a partir de 1 MB (nunca con notas de voz)
  function viajeNuevo(c, m, rol) {
    const r = window.GuardianaViajeDatos ? GuardianaViajeDatos.rele(R.url || '') : {};
    const v = { id: m.id, conv: c.id, rol, tCreado: Date.now(), mime: m.archivo.mime, nombre: m.archivo.nombre, tam: m.archivo.tam, trozos: m.archivo.trozos, estado: 'espera', confirmados: 0, enCamino: 0, verificados: 0, muestras: [], latMia: R.latencia != null ? [R.latencia] : [], latSuya: [], paisMio: MI_PAIS, paisSuyo: '', rele: r, pq: !!(c.sesion && c.sesion.pq), verificada: !!c.verificada, otro: c.nombre || '', eventos: [], incidencias: [] };
    VIAJES.set(m.id, v);
    return v;
  }
  function evento(v, texto, nivel) { if (VJ()) VJ().evento(v, texto, nivel); else { v.eventos.push({ t: Date.now(), texto, nivel: nivel || '' }); } }
  // hitos del 25, 50 y 75 % (solo en archivos de 4 MB o más: en los pequeños serían ruido)
  function hito(v, texto) {
    if (v.tam < 4 * 1024 * 1024) return;
    const n = Math.min(3, Math.floor((v.confirmados / v.tam) * 4));
    while ((v.hito || 0) < n) { v.hito = (v.hito || 0) + 1; evento(v, texto + ': ' + v.hito * 25 + ' %'); }
  }
  let viajeCerradoEn = 0, relojViajes = 0;
  // Se abre solo: al elegir el archivo (quien envía) o al llegar el primer fragmento (quien recibe). Nunca encima de otro
  // envío en curso, ni si la persona acaba de cerrarlo; si está abierto en uno ya terminado, pasa al nuevo.
  function abreSiToca(v, empieza) {
    if (!VJ() || v.voz || v.tam < MIN_VIAJE || ACTUAL !== v.conv) return;
    const act = VJ().actual;
    if (act === v) return;
    if (act) { if (empieza && (act.estado === 'entregado' || act.estado === 'fallo')) VJ().abre(v); return; }
    if (v.visto || Date.now() - viajeCerradoEn < 30000) return;
    VJ().abre(v);
  }
  // cada 2 s, mientras haya un envío en curso: latencia con el relé (ping) y, a la otra parte, la latencia propia y lo enviado
  function vigilaViajes() {
    if (relojViajes) return;
    relojViajes = setInterval(() => {
      const activos = [...VIAJES.values()].filter((v) => v.estado === 'viaje');
      if (!activos.length) { clearInterval(relojViajes); relojViajes = 0; return; }
      R.mide();
      const enviando = activos.filter((v) => v.rol === 'envia');
      for (const v of activos) {
        const c = CONVS.get(v.conv); if (!c) continue;
        if (v.rol === 'envia') { const a = c.archivos.get(v.id); if (a) { v.salidos = Math.max(v.confirmados || 0, a.enviados - (enviando.length === 1 ? R.atraso : 0)); v.enCamino = enviando.length === 1 ? Math.max(0, v.salidos - (v.confirmados || 0)) : 0; } }
        if (v.custodia === 'si') enviaControl(c, { tipo: 'viaje', id: v.id, lat: VJ() ? VJ().minima(v.latMia) : null, bytes: v.rol === 'envia' ? v.salidos || 0 : v.confirmados || 0 });
      }
    }, 2000);
  }
  function listoViaje(c, j) {
    const v = VIAJES.get(j.id); if (!v) return;
    v.custodia = v.voz ? 'voz' : j.v === 1 ? 'si' : 'no'; v.tListo = Date.now();
    v.paisSuyo = regionValida(j.region) || v.paisSuyo; const l = latValida(j.lat); if (l != null) v.latSuya.push(l);
    evento(v, T('El equipo del destinatario está listo: empieza el envío.'));
    if (v.custodia === 'no') evento(v, T('El otro equipo usa una versión anterior de Comunicaciones: el envío sigue, sin comprobante de entrega e integridad.'), 'info');
  }
  function acuseViaje(j, a) {
    const v = VIAJES.get(j.id); if (!v) return;
    const hasta = Math.min(a.trozos, Math.max(0, +j.hasta || 0));
    v.verificados = Math.max(v.verificados || 0, hasta); v.confirmados = hasta === a.trozos ? v.tam : Math.min(v.tam, v.verificados * TROZO);
    if (VJ()) VJ().muestra(v, v.confirmados);
    const l = latValida(j.lat); if (l != null) v.latSuya.push(l);
    hito(v, T('Confirmado por el equipo del destinatario'));
  }
  function finViaje(v, ok) {
    if (!v || v.estado === 'entregado' || v.estado === 'fallo') return;
    v.tFin = Date.now(); v.enCamino = 0;
    if (ok) { v.estado = 'entregado'; v.confirmados = v.tam; v.verificados = v.trozos; if (v.rol === 'envia') evento(v, T('El equipo del destinatario confirma la llegada completa') + ': ' + v.trozos.toLocaleString(LOC()) + ' ' + T('fragmentos autenticados') + '.', 'bien'); }
    else { v.estado = 'fallo'; evento(v, T('El otro equipo no ha podido completar el archivo.'), 'mal'); }
  }
  // Quien envía, al recibir «archivo-fin»: compara la huella, escribe el registro, lo firma y lo manda a firmar.
  async function entregaViaje(c, m, a, v, j) {
    v.tFin = Date.now(); v.enCamino = 0; v.confirmados = v.tam; v.verificados = m.archivo.trozos;
    const l = latValida(j.lat); if (l != null) v.latSuya.push(l);
    const suSha = String(j.sha256 || ''); v.coincide = suSha === a.sha256; v.estado = 'entregado';
    evento(v, T('El equipo del destinatario confirma la llegada completa') + ': ' + (+j.trozos || m.archivo.trozos).toLocaleString(LOC()) + ' ' + T('fragmentos autenticados') + '.', 'bien');
    if (!v.coincide) { evento(v, T('La huella SHA-256 no coincide: no se emite comprobante.'), 'mal'); c.incidencias = (c.incidencias || 0) + 1; await anotaSistema(c, 'La huella SHA-256 del archivo no coincide en los dos equipos: no se emite comprobante.'); pintaRadio(c); return; }
    evento(v, T('Huella SHA-256 idéntica en los dos equipos') + ': ' + VJ().agrupa(a.sha256, 16) + '…', 'bien');
    const dura = Math.max(0.001, (v.tFin - v.t0) / 1000), rel = v.rele || {}, emitido = new Date().toISOString();
    const suTipo = typeof j.tipoReal === 'string' && /^[A-Z0-9]{2,5}$/.test(j.tipoReal) ? j.tipoReal : null;
    const cro = [
      ['emisor', 'preparado', iso(v.tCreado)], ['emisor', 'anuncio', iso(v.tAnuncio)], ['emisor', 'aceptado', iso(v.tListo)],
      ['emisor', 'salida', v.salida || iso(v.t0)], ['emisor', 'ultimo', iso(v.tUltimo)], ['emisor', 'confirmado', iso(v.tFin)], ['emisor', 'firma', emitido],
      ['receptor', 'anuncio_recibido', typeof j.anuncio === 'string' ? j.anuncio.slice(0, 40) : null], ['receptor', 'primero', typeof j.primero === 'string' ? j.primero.slice(0, 40) : null], ['receptor', 'llegada', typeof j.llegada === 'string' ? j.llegada.slice(0, 40) : null],
    ].filter((x) => x[2]).map(([lado, que, t]) => ({ t, lado, que })).sort((p, q) => (p.t < q.t ? -1 : p.t > q.t ? 1 : 0));
    const B = esB(c);
    const mio = B ? { clave: C.b64u(c.idB.firmaPub), acuerdo: C.b64u(c.idB.acuerdoPub), clave_pq: C.b64u(c.idB.dsaPub), huella: C.hex(c.miHuellaB) } : { clave: C.b64u(YO.firmaPub), acuerdo: C.b64u(YO.acuerdoPub), huella: C.hex(YO.huella) };
    const suyo = B ? { clave: C.b64u(c.firmaPub), acuerdo: C.b64u(c.acuerdoPub), clave_pq: C.b64u(c.dsaPub), huella: C.hex(c.huella) } : { clave: C.b64u(c.firmaPub), acuerdo: C.b64u(c.acuerdoPub), huella: C.hex(c.huella) };
    const reg = {
      v: B ? 2 : 1, tipo: B ? 'entrega-integridad-blindada' : 'custodia-digital', id: m.id, emitido,
      modo: B ? 'blindada' : undefined, suite: B ? 'CNSA 2.0: ECDSA y ECDH P-384, ML-KEM-1024, ML-DSA-87, AES-256-GCM, SHA-384' : undefined,
      verificacion_mutua: B ? !!(c.verificada && c.suVerificada && j.mutua === true) : undefined,
      archivo: { nombre: m.archivo.nombre, bytes: m.archivo.tam, sha256: a.sha256, tipo_declarado: m.archivo.mime || null, tipo_real: v.tipoReal || null, fragmentos: m.archivo.trozos, tam_fragmento: TROZO },
      emisor: { ...mio, nombre: YO.nombre || '', region: MI_PAIS || '', verifico_al_otro: !!c.verificada, version: VERSION_APP },
      receptor: { ...suyo, nombre: String(j.nombre || '').slice(0, 40), region: regionValida(j.region), verifico_al_otro: j.verificada === true, version: typeof j.version === 'string' ? j.version.slice(0, 60) : null },
      sesion: { id: v.sid || null, pq: !!v.pq, establecida: iso(v.sesionDesde), blindada: B || undefined },
      transporte: {
        rele: rel.host || '', rele_ciudad: rel.prueba ? '' : rel.ciudad || '', rele_pais: rel.prueba ? '' : rel.cc || '', rele_region: R.region || '', conexion: /^wss:/.test(R.url || '') ? 'wss' : 'ws',
        salida: v.salida || iso(v.t0), llegada: typeof j.llegada === 'string' ? j.llegada.slice(0, 40) : null,
        duracion_s: Math.round(dura * 1000) / 1000, espera_s: v.tListo && v.tAnuncio ? Math.round(v.tListo - v.tAnuncio) / 1000 : null,
        velocidad_media_bps: Math.round(m.archivo.tam / dura), velocidad_maxima_bps: v.velMax ? Math.round(Math.max(v.velMax, m.archivo.tam / dura)) : Math.round(m.archivo.tam / dura),
        latencia_ms: { emisor: VJ().estad(v.latMia), receptor: estadValida(j.lat) },
        fragmentos_verificados: +j.trozos || m.archivo.trozos, fragmentos_rechazados: 0,
      },
      integridad: { sha256_emisor: a.sha256, sha256_receptor: suSha, coincide: true, tipo_receptor: suTipo },
      cronologia: cro,
      incidencias: v.incidencias.slice(0, 20),
    };
    const texto = VJ().canon(reg);
    const firma = B ? C.b64u(await C.B.firma(c.idB, VJ().aFirmarB(texto))) : C.b64u(await C.firma(YO, VJ().aFirmar(texto)));
    const firmapq = B ? C.b64u(C.B.firmaPQ(c.idBDsaSec, VJ().aFirmarB(texto), VJ().CTX_B)) : undefined;
    const comp = { formato: B ? VJ().FORMATO_B : VJ().FORMATO, registro: JSON.parse(texto), firmas: { emisor: firma } }; // en orden canónico: el mismo archivo en los dos equipos
    if (B) comp.firmas_pq = { emisor: firmapq };
    v.comprobante = comp; v.comprobanteValido = false;
    await guardaCustodia(c, m.id, comp, 'pendiente');
    enviaControl(c, { tipo: 'custodia', id: m.id, reg: texto, firma, firmapq });
    evento(v, T('Comprobante firmado por tu equipo: enviado al destinatario para su firma.'), 'info');
  }
  async function guardaCustodia(c, fid, comp, estado, motivo) {
    const id = 'cu-' + fid;
    let m = c.mensajes.find((x) => x.id === id);
    if (!m) { m = { id, conv: c.id, t: Date.now(), dir: 'sistema', estado, tipo: 'custodia', custodia: comp, texto: motivo || '' }; c.mensajes.push(m); }
    else { m.estado = estado; m.custodia = comp; if (motivo != null) m.texto = motivo; }
    await guardaMensaje(c, m); pintaMensaje(c, m, true);
    return m;
  }
  // Quien recibe: comprueba que el registro dice exactamente lo que ha medido su equipo y, solo entonces, lo firma.
  async function recibeCustodia(c, j) {
    if (!VJ()) return;
    if (!c.cargados) await cargaMensajes(c);
    const v = VIAJES.get(j.id), no = (por) => { enviaControl(c, { tipo: 'custodia-no', id: String(j.id || '').slice(0, 64), por }); if (v) evento(v, T('El comprobante del remitente no coincide con lo medido en tu equipo: no se firma.'), 'mal'); };
    const m = c.mensajes.find((x) => x.id === j.id && x.tipo === 'archivo' && x.dir === 'suya');
    if (!m || !m.archivo || !m.archivo.obs || typeof j.reg !== 'string' || j.reg.length > (esB(c) ? 24000 : 16000) || typeof j.firma !== 'string') return no('datos');
    const ya = c.mensajes.find((x) => x.id === 'cu-' + m.id);
    if (ya && ya.estado === 'firmado' && ya.custodia && ya.custodia.firmas && ya.custodia.firmas.receptor) { enviaControl(c, { tipo: 'custodia-firma', id: m.id, firma: ya.custodia.firmas.receptor, firmapq: ya.custodia.firmas_pq ? ya.custodia.firmas_pq.receptor : undefined }); return; } // ya firmado: la firma otra vez, por si no llegó
    const B = esB(c);
    if (B && (typeof j.firmapq !== 'string' || j.reg.length > 20000)) return no('firma');
    let reg; try { reg = JSON.parse(j.reg); } catch (_) { return no('formato'); }
    if (!reg || VJ().canon(reg) !== j.reg) return no('formato');
    if (B ? !((await C.B.verifica(c.firmaPub, C.deB64u(j.firma), VJ().aFirmarB(j.reg))) && C.B.verificaPQ(c.dsaPub, C.deB64u(j.firmapq), VJ().aFirmarB(j.reg), VJ().CTX_B)) : !(await C.verifica(c.firmaPub, C.deB64u(j.firma), VJ().aFirmar(j.reg)))) return no('firma');
    const o = m.archivo.obs, ar = reg.archivo || {}, e = reg.emisor || {}, r = reg.receptor || {}, se = reg.sesion || {}, t = reg.transporte || {}, ig = reg.integridad || {};
    const mios = (Array.isArray(reg.cronologia) ? reg.cronologia : []).filter((x) => x && x.lado === 'receptor');
    const esperados = [['anuncio_recibido', o.anuncio], ['primero', o.primero], ['llegada', o.llegada]].filter((x) => x[1]);
    const mioB = B ? { clave: C.b64u(c.idB.firmaPub), acuerdo: C.b64u(c.idB.acuerdoPub), huella: C.hex(c.miHuellaB), pq: C.b64u(c.idB.dsaPub) } : { clave: C.b64u(YO.firmaPub), acuerdo: C.b64u(YO.acuerdoPub), huella: C.hex(YO.huella) };
    const okModo = B ? reg.v === 2 && reg.tipo === 'entrega-integridad-blindada' && reg.modo === 'blindada' && r.clave_pq === mioB.pq && e.clave_pq === C.b64u(c.dsaPub) && reg.verificacion_mutua === (o.mutua === true) : reg.v === 1 && reg.tipo === 'custodia-digital';
    const ok = okModo && reg.id === m.id
      && limpiaNombre(ar.nombre) === m.archivo.nombre && ar.bytes === m.archivo.tam && ar.fragmentos === m.archivo.trozos && ar.tam_fragmento === TROZO && ar.sha256 === o.sha256 && (ar.tipo_declarado || '') === (m.archivo.mime || '')
      && ig.sha256_emisor === o.sha256 && ig.sha256_receptor === o.sha256 && ig.coincide === true && (ig.tipo_receptor || null) === (o.tipo || null)
      && r.clave === mioB.clave && r.acuerdo === mioB.acuerdo && r.huella === mioB.huella && r.region === o.region && r.verifico_al_otro === o.verificada && r.nombre === o.nombre && r.version === o.version
      && e.clave === C.b64u(c.firmaPub) && e.acuerdo === C.b64u(c.acuerdoPub) && e.huella === C.hex(c.huella)
      && se.pq === o.pq && (se.id || '') === (o.sid || '')
      && t.llegada === o.llegada && t.rele === o.rele && t.rele_region === o.rele_region && t.fragmentos_verificados === m.archivo.trozos && t.fragmentos_rechazados === 0
      && VJ().canon((t.latencia_ms || {}).receptor || null) === VJ().canon(o.lat || null)
      && mios.length === esperados.length && esperados.every(([que, hora]) => mios.some((x) => x.que === que && x.t === hora))
      && typeof t.salida === 'string' && Number.isFinite(t.duracion_s) && t.duracion_s > 0;
    if (!ok) return no('no coincide');
    if (v) evento(v, T('Comprobante recibido del remitente: coincide con lo medido en tu equipo.'));
    const firma = B ? C.b64u(await C.B.firma(c.idB, VJ().aFirmarB(j.reg))) : C.b64u(await C.firma(YO, VJ().aFirmar(j.reg)));
    const firmapq = B ? C.b64u(C.B.firmaPQ(c.idBDsaSec, VJ().aFirmarB(j.reg), VJ().CTX_B)) : undefined;
    const comp = { formato: B ? VJ().FORMATO_B : VJ().FORMATO, registro: reg, firmas: { emisor: j.firma, receptor: firma } };
    if (B) comp.firmas_pq = { emisor: j.firmapq, receptor: firmapq };
    enviaControl(c, { tipo: 'custodia-firma', id: m.id, firma, firmapq });
    await guardaCustodia(c, m.id, comp, 'firmado');
    if (v) { v.comprobante = comp; v.comprobanteValido = true; v.coincide = true; evento(v, T('Comprobante firmado por tu equipo: firmado por los dos equipos.'), 'bien'); }
    vigila(c, T('Comprobante de entrega e integridad firmado por los dos equipos') + ': ' + m.archivo.nombre, 'bien');
  }
  // Quien envía: la firma del destinatario, comprobada con su clave de identidad
  async function firmaCustodia(c, j) {
    if (!VJ()) return;
    if (!c.cargados) await cargaMensajes(c);
    const cm = c.mensajes.find((x) => x.id === 'cu-' + j.id && x.tipo === 'custodia'); if (!cm || !cm.custodia || typeof j.firma !== 'string') return;
    const comp = cm.custodia, v = VIAJES.get(j.id);
    if (comp.firmas && comp.firmas.receptor === j.firma) return;
    const B = comp.formato === VJ().FORMATO_B, tx = VJ().canon(comp.registro);
    const valida = B ? (typeof j.firmapq === 'string' && (await C.B.verifica(c.firmaPub, C.deB64u(j.firma), VJ().aFirmarB(tx))) && C.B.verificaPQ(c.dsaPub, C.deB64u(j.firmapq), VJ().aFirmarB(tx), VJ().CTX_B)) : await C.verifica(c.firmaPub, C.deB64u(j.firma), VJ().aFirmar(tx));
    if (!valida) { if (v) evento(v, T('La firma del destinatario no es válida: el comprobante sigue pendiente.'), 'mal'); return; }
    comp.firmas = Object.assign({}, comp.firmas, { receptor: j.firma });
    if (B) comp.firmas_pq = Object.assign({}, comp.firmas_pq, { receptor: j.firmapq });
    await guardaCustodia(c, j.id, comp, 'firmado', '');
    if (v) { v.comprobante = comp; v.comprobanteValido = true; evento(v, T('El destinatario ha firmado el comprobante: firmado por los dos equipos.'), 'bien'); }
    vigila(c, T('Comprobante de entrega e integridad firmado por los dos equipos') + ': ' + ((comp.registro && comp.registro.archivo && comp.registro.archivo.nombre) || ''), 'bien');
  }
  async function rechazoCustodia(c, j) {
    if (!c.cargados) await cargaMensajes(c);
    const cm = c.mensajes.find((x) => x.id === 'cu-' + j.id && x.tipo === 'custodia'); if (!cm || cm.estado === 'firmado') return;
    await guardaCustodia(c, j.id, cm.custodia, 'rechazado', 'Su equipo no ha podido comprobar el registro.');
    const v = VIAJES.get(j.id); if (v) evento(v, T('El destinatario no ha firmado el comprobante: su equipo no ha podido comprobar el registro.'), 'mal');
    const m = c.mensajes.find((x) => x.id === j.id && x.tipo === 'archivo'); if (m) await recibo(c, m, v && v.tFin && v.t0 ? (v.tFin - v.t0) / 1000 : 0, m.archivo.trozos, true);
  }
  // en cada sesión nueva, los comprobantes aún sin la firma del destinatario se le vuelven a mandar
  async function reenviaCustodias(c) {
    if (!VJ()) return;
    if (!c.cargados) await cargaMensajes(c);
    for (const x of c.mensajes) if (x.tipo === 'custodia' && x.estado === 'pendiente' && x.custodia && x.custodia.registro && x.custodia.firmas) enviaControl(c, { tipo: 'custodia', id: x.custodia.registro.id, reg: VJ().canon(x.custodia.registro), firma: x.custodia.firmas.emisor, firmapq: x.custodia.firmas_pq ? x.custodia.firmas_pq.emisor : undefined });
  }
  function tarjetaCustodia(m) {
    const comp = m.custodia || {}, reg = comp.registro || {}, ar = reg.archivo || {}, est = m.estado;
    const d = document.createElement('div'); d.className = 'custodia' + (est === 'pendiente' ? ' pendiente' : est === 'rechazado' ? ' mal' : '');
    const ico = document.createElement('span'); ico.className = 'cu-ico'; ico.innerHTML = VJ() ? (est === 'firmado' ? VJ().ESCUDO : VJ().AVISO) : '';
    const k = document.createElement('span'); k.className = 'cu-k'; k.textContent = est === 'firmado' ? T('Comprobante de entrega e integridad') : est === 'pendiente' ? T('Comprobante pendiente de firma') : T('Comprobante no emitido');
    const t = document.createElement('span'); t.className = 'cu-t'; t.setAttribute('translate', 'no'); t.textContent = (ar.nombre || '') + ' · ' + tamano(ar.bytes || 0);
    const s = document.createElement('span'); s.className = 'cu-s';
    s.textContent = est === 'firmado' ? T('Firmado por los dos equipos') + ' · SHA-256 ' + (VJ() ? VJ().agrupa(ar.sha256, 16) : '') + '…' : est === 'pendiente' ? T('Firmado por tu equipo; falta la firma del destinatario.') : T('El destinatario no lo ha firmado: su equipo no ha podido comprobar el registro.');
    d.append(ico, k, t, s);
    if (reg.archivo && VJ()) {
      const fila = document.createElement('div'); fila.className = 'fila';
      const ver = document.createElement('button'); ver.type = 'button'; ver.className = 'boton'; ver.textContent = T('Ver comprobante'); ver.addEventListener('click', () => VJ().muestraComprobante(comp));
      const baja = document.createElement('button'); baja.type = 'button'; baja.className = 'boton'; baja.textContent = T('Descargar PDF'); baja.addEventListener('click', () => VJ().imprime(comp));
      fila.append(ver); if (est === 'firmado') fila.append(baja); d.append(fila);
    }
    return d;
  }
  const RUTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="6" r="2.2"/><path d="M7 17c5-1 3-8 8-9.5" stroke-dasharray="2.4 2.6"/></svg>';
  async function abreArchivo(m, guardar) {
    const r = await BD.saca('arch', m.id); if (!r) return aviso(m.archivo.enDisco ? T('Ese archivo se guardó directamente en tu disco, en la carpeta que elegiste.') : T('Este archivo ya no está en este navegador.'));
    const u = URL.createObjectURL(r.blob);
    const a = document.createElement('a'); a.href = u; if (guardar) a.download = r.nombre; else { a.target = '_blank'; a.rel = 'noopener'; }
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
  }

  // ---------- llamadas ----------
  const mmss = (ms) => { const x = Math.round(ms / 1000); return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };
  // dueño, 28 Oct 2026, 13:29 («lo que he hecho yo a un lado, lo que ha hecho él… como WhatsApp, Signal, Telegram»): cada
  // llamada queda en el chat al lado de quien llamó (la mía a la derecha, la suya a la izquierda), con el resultado, la
  // duración y un botón para volver a llamar. Cada equipo apunta la suya; no viaja nada más por la red.
  // con varias conversaciones, la llamada va atada a la suya (puede no ser la que está en pantalla)
  let LLAMADA_CONV = null;
  const convLl = () => CONVS.get(LLAMADA_CONV || ACTUAL);
  async function anotaLlamada(info) {
    const c = convLl(); LLAMADA_CONV = null; if (!c || !info) return;
    const l = { por: info.por, duracion: info.duracion || 0, video: !!info.video, voz: !!info.voz, yoColgue: !!info.yoColgue };
    const m = { id: uuid(), conv: c.id, t: Date.now(), dir: info.mia ? 'mia' : 'suya', estado: 'ok', tipo: 'llamada', texto: resumenLlamada({ dir: info.mia ? 'mia' : 'suya', llamada: l }).titulo, llamada: l };
    await guardaMensaje(c, m); c.mensajes.push(m); pintaMensaje(c, m);
    c.ultimo = m.t; await guardaConv(c);
    if (m.dir === 'suya' && l.por !== 'fin' && !l.yoColgue) { if (ACTUAL !== c.id) { c.perdida = true; avisoConv(c, l.video ? T('Videollamada perdida en «{n}»') : T('Llamada perdida en «{n}»')); } avisaFuera(c, 'perdida', l.video); }
    pintaLista();
  }
  // 72 s → «01:12»; más de una hora → «1:02:05»
  const duracionLlamada = (ms) => { const x = Math.round((ms || 0) / 1000); if (x < 3600) return mmss(x * 1000); return Math.floor(x / 3600) + ':' + mmss((x % 3600) * 1000); };
  function resumenLlamada(m) {
    const l = m.llamada || {}, mia = m.dir === 'mia', v = !!l.video;
    let titulo, sub = '', clase = '';
    if (l.por === 'fin') { titulo = mia ? (v ? T('Videollamada saliente') : T('Llamada saliente')) : (v ? T('Videollamada entrante') : T('Llamada entrante')); sub = duracionLlamada(l.duracion) + (l.voz ? ' · ' + T('con cambio de voz') : ''); clase = 'hecha'; }
    else if (l.por === 'ocupado') { titulo = T('Comunicando'); sub = T('Estaba en otra llamada'); clase = 'aviso'; }
    else if (l.por === 'fallo') { titulo = v ? T('Videollamada interrumpida') : T('Llamada interrumpida'); sub = l.duracion ? duracionLlamada(l.duracion) : T('No se pudo conectar'); clase = 'aviso'; }
    else if (l.por === 'sin-medios') { titulo = v ? T('Videollamada sin cámara') : T('Llamada sin micrófono'); sub = T('Falta el permiso del navegador'); clase = 'aviso'; }
    else if (mia) { titulo = l.yoColgue ? (v ? T('Videollamada cancelada') : T('Llamada cancelada')) : (v ? T('Videollamada sin respuesta') : T('Llamada sin respuesta')); clase = 'gris'; }
    else if (l.yoColgue) { titulo = v ? T('Videollamada rechazada') : T('Llamada rechazada'); clase = 'rechazada'; }
    else { titulo = v ? T('Videollamada perdida') : T('Llamada perdida'); sub = T('Toca el botón para devolverla'); clase = 'perdida'; }
    return { titulo, sub, clase };
  }
  const ICO_TEL = '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>';
  const ICO_VID = '<rect x="2.5" y="6.5" width="13" height="11" rx="2.5"/><path d="M15.5 10.5l6-3.5v10l-6-3.5z"/>';
  function burbujaLlamada(m) {
    const l = m.llamada || {}, v = !!l.video, r = resumenLlamada(m);
    const bur = document.createElement('div'); bur.className = 'gc-burbuja gc-llam ' + (m.dir === 'mia' ? 'gc-mia' : 'gc-suya') + (r.clase ? ' ' + r.clase : '');
    const ic = document.createElement('span'); ic.className = 'gc-llam-ico'; ic.setAttribute('aria-hidden', 'true');
    ic.innerHTML = '<svg viewBox="0 0 24 24">' + (v ? ICO_VID : ICO_TEL) + '</svg><svg class="flecha" viewBox="0 0 12 12">' + (m.dir === 'mia' ? '<path d="M3 9l6-6M4.5 3H9v4.5"/>' : '<path d="M9 3L3 9M7.5 9H3V4.5"/>') + '</svg>';
    const tx = document.createElement('span'); tx.className = 'gc-llam-txt';
    const b = document.createElement('b'); b.textContent = r.titulo; tx.append(b);
    if (r.sub) { const s = document.createElement('small'); s.textContent = r.sub; tx.append(s); }
    const otra = document.createElement('button'); otra.type = 'button'; otra.className = 'gc-llam-otra';
    const et = v ? T('Volver a hacer una videollamada') : T('Volver a llamar'); otra.setAttribute('aria-label', et); otra.title = et;
    otra.innerHTML = '<svg viewBox="0 0 24 24">' + (v ? ICO_VID : ICO_TEL) + '</svg>';
    otra.addEventListener('click', () => { const bt = $(v ? '#videollamar' : '#llamar'); if (bt && !bt.hidden) bt.click(); });
    const meta = document.createElement('span'); meta.className = 'gc-meta'; const tm = document.createElement('time'); tm.textContent = hora(m.t); meta.append(tm);
    bur.append(ic, tx, otra, meta);
    return bur;
  }
  // ---------- el servidor de llamadas más cercano (dueño, 28 Oct 2026, 14:17: «que las llamadas sean todas buenas,
  // independientemente de si la persona está en Sudamérica, en Europa, en América») ----------
  // Las conversaciones siguen en el relé principal (Núremberg). El audio y el vídeo de cada persona pasan por el servidor de
  // llamadas que tiene más cerca: Miami para América, Núremberg para Europa (la otra persona elige el suyo desde su lado; los
  // dos servidores se pasan la llamada entre ellos). Se mide al abrir la página y cada hora; si Miami no responde, no tiene
  // llamadas o no está claramente más cerca, todo sigue por Núremberg, como hasta ahora.
  let iceAm = null, reintentoAm = null;
  async function eligeServidorLlamadas() {
    try {
      if (LOCAL || !window.GuardianaRele || !GuardianaRele.iceDe || GuardianaRele.PROPIO) return;
      const am = (GuardianaRele.MOTORES || [])[1]; if (!am) return;
      const r = await GuardianaRele.iceDe(am, 8000);
      iceAm = r && r.ms > 0 ? r : null;
    } catch (_) { iceAm = null; }
    // si no respondió (red ocupada al abrir, el móvil cambiando de red…), otra vez a los 3 minutos, no a la hora
    if (!iceAm && !reintentoAm) reintentoAm = setTimeout(() => { reintentoAm = null; eligeServidorLlamadas(); }, 180000);
  }
  // el servidor que lleva la llamada se dice en VIGILANCIA y al tocar «Conexión» (dueño, 14:17: miraba si iba por Alemania)
  let iceUsado = '';
  const iceCercano = () => {
    const prin = R ? (R.latenciaMin != null ? R.latenciaMin : R.latencia) : null;
    if (iceAm && iceAm.caduca * 1000 > Date.now() + 120000 && prin != null && iceAm.ms + 25 < prin) { iceUsado = 'am'; return iceAm.ice; }
    iceUsado = LOCAL || (window.GuardianaRele && GuardianaRele.PROPIO) ? '' : 'eu';
    return R ? R.ice : [];
  };
  const servidorLlamada = () => (iceUsado === 'am' ? T('Miami (Estados Unidos)') : iceUsado === 'eu' ? T('Núremberg (Alemania)') : '');
  const puedeLlamar = () => { const c = CONVS.get(ACTUAL); return !!(c && enLinea(c) && c.sesion && c.sesion.confirmada && puedeEnviar(c)); };
  function arrancaLlamadas() {
    if (!window.GuardianaLlamada || !window.RTCPeerConnection) { for (const id of ['#llamar', '#videollamar']) { const b = $(id); if (b) b.hidden = true; } return; }
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) { const b = $('#videollamar'); if (b) b.hidden = true; }
    LL = GuardianaLlamada.crea({
      ice: iceCercano, servidor: servidorLlamada, puede: puedeLlamar, t: T, aviso, suena: avisaSonido, fin: anotaLlamada, estado: avisaLlamada,
      blindada: () => { const c = convLl(); return !!(c && esB(c)); }, // las opciones de imagen, solo en la sesión blindada
      manda: (m) => { const c = convLl(); if (c) enviaControl(c, Object.assign({ tipo: 'llamada' }, m)); },
      // el nombre que la otra persona se puso o el que le pusiste tú; sin ninguno, «Llamada encriptada» o «Videollamada encriptada»
      nombre: () => { const c = convLl(); return (c && (c.alias || c.nombre)) || (c && vivas().length > 1 ? nombreConv(c, true) : ''); },
      inicial: () => { const c = convLl(); return inicial(c && (c.alias || c.nombre)); },
    });
    const llama = (video) => { if (LL.ocupado) { aviso(T('Ya tienes una llamada en curso.')); return; } LLAMADA_CONV = ACTUAL; LL.llamar(video); };
    $('#llamar').addEventListener('click', () => llama(false));
    // videollamada (dueño, 28 Oct 2026): la misma llamada, con imagen
    $('#videollamar').addEventListener('click', () => llama(true));
  }

  // ---------- destruir ----------
  // «Borrar el chat» (dueño, 15:13): todo lo de la conversación, aquí y en el otro equipo; la conversación sigue abierta. Con la
  // otra persona sin conectar, se borra aquí y la orden sale en cuanto se conecte (como «Terminar»).
  async function vaciaLocal(c, porElla) {
    for (const m of c.mensajes || []) { try { VIAJES.delete(m.id); } catch (_) {} }
    c.mensajes = []; c.cola = []; c.ultimoTexto = null; c.noLeidos = 0; c.perdida = false;
    await BD.borraConv('msg', c.id); await BD.borraConv('arch', c.id); await guardaConv(c);
    if (ACTUAL === c.id) { pintaTodos(c); pintaCabecera(c); pintaRadio(c); }
    pintaLista();
    if (porElla) aviso(T('La otra persona ha borrado el chat: se ha borrado también aquí.'));
  }
  async function vacia(c) {
    if (!c) return;
    if (enLinea(c)) { enviaControl(c, { tipo: 'vaciar' }); await vaciaLocal(c, false); aviso(T('Chat borrado aquí y en el equipo de la otra persona.')); return; }
    c.vaciarPendiente = true; await vaciaLocal(c, false); aviso(T('Chat borrado aquí; en el otro equipo, en cuanto esa persona se conecte.'));
  }
  // Invitado: quien entró por un enlace en esta pestaña. Sin la barra de la web y, al terminar, solo «Conversación terminada»;
  // si en este navegador no queda ninguna otra conversación, también fuera su identidad y sus ajustes (dueño, 15:50)
  const esInvitado = () => { try { return sessionStorage.getItem('gcom-invitado') === '1'; } catch (_) { return false; } };
  // (en la app instalada nadie es invitado: es su propia app, con sus contactos)
  function marcaInvitado() { if (comoApp()) return; try { sessionStorage.setItem('gcom-invitado', '1'); } catch (_) {} document.body.classList.add('modo-invitado'); }
  function muestraFin() { document.body.classList.add('modo-invitado', 'invitado-fin'); const f = $('#fin-invitado'); if (f) f.hidden = false; }
  async function finInvitado() {
    try { sessionStorage.setItem('gcom-fin', '1'); } catch (_) {}
    if (!CONVS.size) {
      try { for (const y of await BD.todos('yo')) await BD.borra('yo', y.id); } catch (_) {}
      try { for (const k of Object.keys(localStorage)) if (/^gcom-/.test(k)) localStorage.removeItem(k); } catch (_) {}
    }
    muestraFin();
  }
  async function destruyeLocal(c, porElla, silencio) {
    if (c.estado === 'destruida') return;
    c.estado = 'destruida';
    if (LL && LL.ocupado && (LLAMADA_CONV || ACTUAL) === c.id) LL.colgar();
    if (esB(c)) borraClavesB(c);
    R.sale(c.id); CONVS.delete(c.id);
    await BD.borraConv('msg', c.id); await BD.borraConv('arch', c.id); await BD.borra('conv', c.id);
    if (ACTUAL === c.id) { cierraConv(); }
    pintaLista();
    if (!silencio) aviso(porElla ? T('La otra persona ha terminado la conversación: se ha borrado también aquí.') : T('Conversación terminada y borrada; el otro equipo ha recibido la orden de borrado.'));
    if (esInvitado() && c.rol === 'acepta') await finInvitado();
  }
  // Destruir con la otra persona ausente: se borra todo aquí y queda una lápida (sin mensajes) que, en cuanto la otra
  // persona entre, le manda «destruir» y desaparece.
  async function destruye(c, silencio) {
    if (c.codigo) R.retira(c.codigo);
    if (enLinea(c)) { enviaControl(c, { tipo: 'destruir' }); await new Promise((r) => setTimeout(r, 250)); await destruyeLocal(c, false, silencio); return; }
    if (!c.huella) { await destruyeLocal(c, false, true); return; }
    c.estado = 'destruida_pendiente'; c.tumba = Date.now(); c.mensajes = []; c.cola = []; c.ultimoTexto = null; c.noLeidos = 0;
    await BD.borraConv('msg', c.id); await BD.borraConv('arch', c.id); await guardaConv(c);
    if (ACTUAL === c.id) cierraConv();
    pintaLista(); aviso(T('Conversación terminada y borrada aquí; en el otro equipo, en cuanto esa persona entre.'));
  }

  // ---------- relé ----------
  function arrancaRele() {
    R = GuardianaRele.crea();
    const estadoRele = (txt, cls) => { const e = $('#rele'); e.className = 'rele ' + (cls || ''); $('#reletxt').textContent = txt; };
    window.pintaBarra = () => { const c = CONVS.get(ACTUAL); const on = !!(c && c.huella && enLinea(c) && c.sesion && c.sesion.confirmada); estadoRele(on ? T('Conectado') : T('Desconectado'), on ? 'si' : ''); { const r = $('#rele'); if (r) r.hidden = !(c && c.huella); } /* sin conversación, nada que decir (agencia, ronda 75: «Desconectado» en el inicio asustaba) */ };
    // arriba: «Desconectado» hasta que la conversación con la otra persona está establecida; entonces «Conectado» (dueño, 20:21)
    R.on('abierto', () => { pintaBarra(); });
    R.on('hola', () => { for (const c of CONVS.values()) pintaCabecera(c); pintaBarra(); });
    R.on('cerrado', () => { pintaBarra(); for (const c of CONVS.values()) { c.miembros.clear(); c.sesion = null; pintaCabecera(c); } pintaLista(); });
    setInterval(() => { if (R.abierto && R.caduca && R.caduca * 1000 - Date.now() < 2 * 3600 * 1000) R.pideIce(); }, 10 * 60 * 1000);
    R.on('sala', (sala, miembros) => { const c = CONVS.get(sala); if (!c) return; c.miembros = new Set(miembros); c.sesion = null; if (miembros.length && (!c.suId || miembros.includes(c.suId))) enCola(c, () => presentaX(c, null, true)); pintaCabecera(c); pintaLista(); });
    R.on('llega', (sala, quien) => { const c = CONVS.get(sala); if (!c) return; c.miembros.add(quien); if (!c.suId || c.suId === quien) { c.sesion = null; enCola(c, () => presentaX(c, null, true)); } pintaCabecera(c); pintaLista(); });
    R.on('sale', (sala, quien) => { const c = CONVS.get(sala); if (!c) return; c.miembros.delete(quien); if (c.suId === quien) { c.sesion = null; vigila(c, T('La otra persona se ha desconectado.'), 'info'); if (LL && LL.ocupado && ACTUAL === c.id) LL.recibe({ acto: 'colgar' }); } pintaCabecera(c); pintaLista(); });
    R.on('sustituido', (sala) => { const c = CONVS.get(sala); if (c) { c.miembros.clear(); c.sesion = null; } aviso(T('Esta conversación se ha abierto en otra pestaña: sigue allí.')); });
    // Las tramas de una conversación se procesan en orden (una detrás de otra): así un trozo de archivo nunca
    // adelanta al anuncio del archivo, ni un mensaje a la presentación que abre su sesión.
    R.on('trama', (sala, de, b) => {
      const c = CONVS.get(sala); if (!c || !b.length) return;
      c.proc = (c.proc || Promise.resolve()).then(async () => {
        try {
          if (b[0] === 1) await (esB(c) ? recibePresentacionB(c, de, b) : recibePresentacion(c, de, b));
          else if (b[0] === 2) await recibeMensaje(c, de, b);
          else if (b[0] === 3) await recibeTrozo(c, de, b);
          else if (b[0] === 4) { if (c.suId === de) await presentaX(c, null); }
          else if (b[0] === 5) { if (!c.huella) { c.ocupada = true; pintaCabecera(c); $('#invita-estado').textContent = T('Esta invitación ya la usó otra persona.'); } }
        } catch (e) { console.warn('trama', e); }
      });
    });
    R.on('aviso', (m) => { /* incidencias: códigos (el comprobante los dice en el idioma de quien lo lee) */
      if (m.t === 'lento') aviso(T('El relé está limitando la velocidad: el envío sigue más despacio.'));
      if (m.t === 'lento' || m.t === 'atasco') for (const v of VIAJES.values()) if (v.estado === 'viaje' && !v['inc_' + m.t]) { v['inc_' + m.t] = true; const que = m.t === 'lento' ? 'El relé limitó la velocidad del envío.' : 'El relé retuvo fragmentos por saturación del destinatario.'; v.incidencias.push({ t: new Date().toISOString(), que: m.t === 'lento' ? 'rele_lento' : 'rele_atasco', lado: v.rol === 'envia' ? 'emisor' : 'receptor' }); evento(v, T(que), 'info'); }
    });
    R.on('pong', (ms) => { if (!Number.isFinite(ms)) return; for (const v of VIAJES.values()) if (v.estado === 'viaje' || v.estado === 'espera') { v.latMia.push(ms); if (v.latMia.length > 1000) v.latMia.shift(); } });
    // sin relé, un envío en curso no sigue (no hay reanudación): queda como no completado en los dos lados
    R.on('cerrado', () => { for (const v of VIAJES.values()) if (v.estado === 'viaje') { v.estado = 'fallo'; v.tFin = Date.now(); v.enCamino = 0; evento(v, T('Se perdió la conexión con el relé: el envío no se ha completado.'), 'mal'); } });
  }

  // ---------- pantalla: lista ----------
  const hora = (t) => new Date(t).toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' });
  const fecha = (t) => { const d = new Date(t), h = new Date(); return d.toDateString() === h.toDateString() ? T('Hoy') : d.toLocaleDateString(LOC(), { weekday: 'long', day: 'numeric', month: 'long' }); };
  const diaDe = (t) => new Date(t).toDateString();
  // ---------- varias conversaciones (dueño, 28 Oct 2026, 13:56: «que se puedan tener varias en el mismo navegador… y varias
  // conversaciones también, sin tener que salir… que quede todo en la interfaz»; agencia, ronda 74, bloque J) ----------
  // Antes (dueño, 26 Oct 20:04) había una sola: crear o aceptar otra borraba la anterior. Ahora cada conversación vive por su
  // cuenta (su sala, sus claves, su historial) y una nueva no toca las demás. En el ordenador, la lista va a la izquierda; en
  // el móvil es una pantalla propia y «‹» vuelve a ella. Sin vista previa del texto: el nombre, la hora y lo que hay de nuevo.
  const MAX_CONVS = 8;
  let quiereNueva = false; // la persona pulsó «Nueva»: se queda en el inicio aunque haya conversaciones
  const vivas = () => [...CONVS.values()].filter((c) => c.estado !== 'destruida_pendiente' && c.estado !== 'destruida');
  const siguienteNum = () => 1 + Math.max(0, ...[...CONVS.values()].map((c) => c.num || 0));
  function nombreConv(c, corto) {
    if (!c) return '';
    if (c.alias) return c.alias;
    if (c.nombre) return c.nombre;
    const base = esB(c) ? T('Sesión blindada') : corto ? T('Conversación') : T('Conversación encriptada');
    return (c.num || 1) > 1 ? (esB(c) ? base : T('Conversación')) + ' ' + c.num : base;
  }
  const horaLista = (t) => { const d = new Date(t || Date.now()), h = new Date(); return d.toDateString() === h.toDateString() ? hora(t) : d.toLocaleDateString(LOC(), { day: 'numeric', month: 'short' }); };
  function estadoLista(c) {
    if (c.estado === 'invitacion' && !c.huella) return esB(c) ? T('Invitación blindada · esperando') : T('Invitación · esperando a la otra persona');
    if (LL && LL.ocupado && LLAMADA_CONV === c.id) return T('En llamada');
    if (c.noLeidos) return c.noLeidos === 1 ? T('Mensaje nuevo') : T('{n} mensajes nuevos').replace('{n}', c.noLeidos);
    if (c.perdida) return T('Llamada perdida');
    if (!enLinea(c)) return T('No está conectada');
    return esB(c) ? T('Sesión blindada') : T('Encriptada de extremo a extremo');
  }
  async function pintaLista() {
    const xs = vivas().sort((a, b) => (b.ultimo || b.creado || 0) - (a.ultimo || a.creado || 0));
    const app = $('#app'), lista = $('#lista'), ul = $('#lista-filas');
    app.classList.toggle('con-lista', xs.length > 0); if (lista) lista.hidden = !xs.length;
    const vl = $('#volver-lista'); if (vl) vl.hidden = !xs.length;
    pintaContactos();
    if (!xs.length) { document.body.classList.remove('ver-lista'); if (ACTUAL) cierraConv(); return; }
    if (ul) {
      ul.textContent = '';
      for (const c of xs) {
        const li = document.createElement('li');
        const b = document.createElement('button'); b.type = 'button'; b.className = 'fila-conv' + (c.id === ACTUAL ? ' actual' : '') + (esB(c) ? ' blindada' : '') + (c.noLeidos ? ' nueva' : '') + (c.perdida && !c.noLeidos ? ' perdida' : '');
        b.dataset.id = c.id; if (c.id === ACTUAL) b.setAttribute('aria-current', 'true');
        const av = document.createElement('span'); av.className = 'fila-av' + (enLinea(c) ? ' en-linea' : ''); av.setAttribute('aria-hidden', 'true');
        if (esB(c)) av.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/></svg>'; else av.textContent = inicial(nombreConv(c, true));
        const tx = document.createElement('span'); tx.className = 'fila-txt';
        const nb = document.createElement('b'); nb.textContent = nombreConv(c, true); nb.translate = false;
        const es = document.createElement('small'); es.textContent = estadoLista(c);
        tx.append(nb, es);
        const de = document.createElement('span'); de.className = 'fila-der';
        const tm = document.createElement('time'); tm.textContent = horaLista(c.ultimo || c.creado); de.append(tm);
        if (c.noLeidos) { const n = document.createElement('i'); n.className = 'fila-n'; n.textContent = c.noLeidos > 99 ? '99+' : String(c.noLeidos); n.setAttribute('aria-label', T('{n} mensajes nuevos').replace('{n}', c.noLeidos)); de.append(n); }
        b.append(av, tx, de); li.append(b); ul.append(li);
      }
    }
    // con contactos guardados, el teléfono se queda en el inicio (los contactos) en vez de entrar solo en una conversación
    if ((!ACTUAL || !CONVS.has(ACTUAL)) && !quiereNueva && !hayContactos()) abreConv(xs[0].id);
  }

  // ---------- contactos (dueño, 28 Oct 2026, 17:29–17:33: «una llamada directa sin tener que quedar la invitación… que uno
  // guarde el contacto como quiera… el nombre que quiera… simplificado y lo más fácil posible») ----------
  // Una conversación guardada como contacto se queda: no la borra una invitación nueva ni el arranque del teléfono. Sale en el
  // inicio con el nombre que le puso cada uno (solo en este equipo): un toque en la fila abre el chat y los botones llaman o
  // videollaman, sin enlace. Para que suene, la otra persona tiene que tener GUARDIANA abierta (sin servidor de avisos, 17:33).
  const SVG_TEL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>';
  const SVG_VID = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/></svg>';
  const contactos = () => vivas().filter((x) => x.contacto && x.huella).sort((a, b) => nombreConv(a, true).localeCompare(nombreConv(b, true), 'es'));
  const hayContactos = () => esMovil() && contactos().length > 0;
  function pintaContactos() {
    const sec = $('#contactos'), ul = $('#contactos-filas'); if (!sec || !ul) return;
    // con contactos, también la conversación empezada que aún no se guardó (si no, al volver a la lista no habría cómo llegar a ella)
    const xs = esMovil() && contactos().length ? contactos().concat(vivas().filter((x) => x.huella && !x.contacto)) : [];
    sec.hidden = !xs.length;
    $('#inicio').classList.toggle('con-contactos', xs.length > 0);
    document.body.classList.toggle('con-contactos', xs.length > 0);
    ul.textContent = '';
    for (const c of xs) {
      const nombre = nombreConv(c, true), vivo = enLinea(c);
      const li = document.createElement('li'); li.className = 'contacto' + (c.noLeidos ? ' nueva' : '');
      const ab = document.createElement('button'); ab.type = 'button'; ab.className = 'contacto-abre'; ab.dataset.id = c.id;
      const av = document.createElement('span'); av.className = 'contacto-av' + (vivo ? ' en-linea' : ''); av.textContent = inicial(nombre); av.setAttribute('aria-hidden', 'true');
      const tx = document.createElement('span'); tx.className = 'contacto-txt';
      const nb = document.createElement('b'); nb.textContent = nombre; nb.translate = false;
      const es = document.createElement('small'); es.textContent = c.noLeidos ? T('{n} mensajes nuevos').replace('{n}', c.noLeidos) : (c.contacto ? '' : T('Sin guardar') + ' · ') + (vivo ? T('En línea') : T('No conectado'));
      tx.append(nb, es); ab.append(av, tx);
      if (c.noLeidos) { const n = document.createElement('i'); n.className = 'contacto-n'; n.textContent = c.noLeidos > 99 ? '99+' : String(c.noLeidos); ab.append(n); }
      li.append(ab);
      for (const [acto, etq, svg] of [['voz', T('Llamar a {n}'), SVG_TEL], ['video', T('Videollamada con {n}'), SVG_VID]]) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'contacto-b'; b.dataset.id = c.id; b.dataset.acto = acto; b.innerHTML = svg;
        b.setAttribute('aria-label', etq.replace('{n}', nombre)); b.title = etq.replace('{n}', nombre); li.append(b);
      }
      ul.append(li);
    }
  }
  // llamar desde el inicio: se abre su chat (debajo de la llamada) y se llama dentro del mismo toque (el iPhone lo necesita)
  function llamaContacto(c, video) {
    if (!LL) return;
    if (LL.ocupado) { aviso(T('Ya tienes una llamada en curso.')); return; }
    abreConv(c.id);
    if (!enLinea(c) || !(c.sesion && c.sesion.confirmada)) { aviso(T('{n} no tiene GUARDIANA abierta ahora: cuando la abra, podréis hablar.').replace('{n}', nombreConv(c, true))); return; }
    LLAMADA_CONV = c.id; LL.llamar(video);
  }
  // del chat al inicio (con contactos, en el teléfono, «‹» vuelve a ellos sin terminar nada)
  function alInicio() { paraEscribe(); guardaBorrador(); quiereNueva = true; cierraConv(); pintaContactos(); }
  // el borrador de cada conversación se queda en la suya al cambiar de una a otra
  function guardaBorrador() { const c = CONVS.get(ACTUAL), ta = $('#texto'); if (c && ta) c.borrador = ta.value; }
  function ponBorrador(c) {
    const ta = $('#texto'); if (!ta) return;
    ta.value = (c && c.borrador) || '';
    ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px';
    const comp = document.querySelector('.gc-compositor'); if (comp) comp.classList.toggle('con-texto', !!ta.value.trim());
    ta.dispatchEvent(new CustomEvent('guardiana-borrador'));
  }
  function nuevaConversacion() {
    paraEscribe(); guardaBorrador();
    quiereNueva = true; cierraConv(); document.body.classList.remove('ver-lista'); pintaLista();
  }


  // ---------- pantalla: conversación ----------
  // hasta que la otra persona ha estado conectada al menos una vez (se conoce su huella), quien entró por un enlace no ve el
  // campo de escribir: «Conectando con la otra persona…» (dueño, 15:33: «ya me deja escribir aunque él no esté… es un fallo»)
  function pintaEspera(c) { if (!c || ACTUAL !== c.id) return; $('#conv').classList.toggle('sin-sesion', c.rol === 'acepta' && !c.huella); }
  async function abreConv(id) {
    const c = CONVS.get(id); if (!c) return;
    if (ACTUAL && ACTUAL !== id) { paraEscribe(); guardaBorrador(); }
    const cambia = ACTUAL !== id;
    quiereNueva = false; document.body.classList.remove('ver-lista');
    ACTUAL = id; await cargaMensajes(c);
    if (cambia) ponBorrador(c);
    if (c.perdida) { c.perdida = false; }
    const inv = c.estado === 'invitacion' && c.rol === 'invita' && !c.huella;
    $('#inicio').hidden = !inv; $('#conv').hidden = inv; $('#app').classList.toggle('en-conv', !inv); document.body.classList.toggle('en-conv', !inv);
    $('#inicio').classList.toggle('con-invitacion', inv); // sin la presentación de la página: solo la invitación (15:32)
    if (inv) { $('#paso-inicio').hidden = true; $('#paso-entrar').hidden = true; $('#paso-codigo').hidden = esB(c); $('#paso-enlace').hidden = !esB(c); }
    pintaCabecera(c); pintaTodos(c); pintaRadio(c); pintaLista();
    if (c.estado === 'invitacion' && c.rol === 'invita') { if (esB(c)) muestraEnlace(c); else { muestraInvitacion(c); if (!c.huella && (!c.codigo || Date.now() > c.codigoCaduca)) publicaCodigo(c); } }
    $('#conv').classList.toggle('blindada', esB(c));
    pintaEspera(c);
    marcaLeidos(c);
    if (matchMedia('(min-width: 761px)').matches) $('#texto').focus();
  }
  function cierraConv() { $('#inicio').classList.remove('con-invitacion'); document.body.classList.remove('esperando-enlace'); ACTUAL = null; if (window.pintaBarra) pintaBarra(); $('#conv').hidden = true; $('#inicio').hidden = false; $('#app').classList.remove('en-conv'); document.body.classList.remove('en-conv'); $('#paso-inicio').hidden = false; $('#paso-codigo').hidden = true; $('#paso-entrar').hidden = true; $('#paso-enlace').hidden = true; }
  function pintaCabecera(c) {
    pintaEspera(c);
    if (window.pintaBarra) pintaBarra();
    if (ACTUAL !== c.id) return;
    // en el móvil, el nombre y la línea de confianza, cortos y en una fila (agencia, ronda 74: antes «Convers…» y tres líneas)
    const movil = matchMedia('(max-width: 760px)').matches;
    $('#cnombre').textContent = nombreConv(c, movil);
    const conf = $('#cconfianza'); conf.classList.remove('gc-sin-verificar');
    let txt;
    if (c.ocupada && !c.huella) txt = T('Esta invitación ya la usó otra persona.');
    else if (!c.huella) txt = c.miembros.size ? T('Estableciendo la encriptación…') : c.rol === 'acepta' ? T('Conectando con la otra persona…') : esB(c) ? T('Esperando a que la otra persona abra el enlace…') : T('Esperando a que la otra persona escriba el código…');
    else if (!R.abierto) txt = T('Sin conexión con el relé');
    else if (!c.miembros.has(c.suId)) txt = T('No está conectada ahora: lo que escribas saldrá cuando entre');
    else if (!c.sesion || !c.sesion.confirmada) txt = T('Estableciendo la encriptación…');
    else if (esB(c)) txt = (movil ? T('Postcuántica') : T('Algoritmos de la suite CNSA 2.0') + ' · ' + T('postcuántica')) + ' · ' + (c.verificada && c.suVerificada ? T('verificada por los dos') : movil ? T('pendiente de verificar') : T('pendiente de la verificación mutua'));
    else txt = (movil ? T('Encriptada') : T('Encriptada de extremo a extremo')) + ' · ' + (c.sesion.pq ? T('postcuántica') + ' · ' : T('sin protección postcuántica') + ' · ') + (c.verificada ? T('verificada') : T('sin verificar'));
    const pqa = $('#cpq');
    if (pqa) {
      pqa.hidden = !c.clasicaPendiente;
      const sp = pqa.querySelector('span');
      if (sp && c.clasicaPendiente) sp.textContent = c.pqVisto ? T('La otra persona no ha usado la protección postcuántica. Como esta conversación ya la tenía, se ha detenido.') : T('La otra persona usa una versión sin protección postcuántica. La conversación no continuará sin tu permiso.');
    }
    if (c.huella && !(c.verificada && (!esB(c) || c.suVerificada))) conf.classList.add('gc-sin-verificar');
    conf.textContent = txt;
    pintaPuerta(c); pintaAvisos(c);
    const ll = $('#llamar'); if (ll) { const si = puedeLlamar() && (R.llamadas || LOCAL); ll.classList.toggle('apagado', !si); ll.title = si ? T('Llamada de voz') : esB(c) && !(c.verificada && c.suVerificada) ? T('Las llamadas se activan cuando los dos hayan comprobado el número de seguridad.') : !R.llamadas && !LOCAL ? T('El servicio de llamadas no está disponible ahora mismo.') : T('La otra persona tiene que estar conectada.'); }
    const vl = $('#videollamar'); if (vl && ll) { vl.classList.toggle('apagado', ll.classList.contains('apagado')); vl.title = ll.classList.contains('apagado') ? ll.title : T('Videollamada'); }
    // contactos (17:33): «Guardar contacto» en «⋯» y, en el teléfono, una tira una vez al empezar
    { const k = $('#cm-contacto'); if (k) k.hidden = !(c.huella && !c.contacto); const s = $('#ccontacto'); if (s) s.hidden = !(esMovil() && c.huella && !c.contacto && !c.sinContacto); $('#conv').classList.toggle('es-contacto', !!c.contacto); }
  }
  // Vigilancia a la derecha (dueño, 26 Oct 20:22): anota cada comprobación real según ocurre y mantiene la última a la vista.
  const hms = (t) => new Date(t || Date.now()).toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  function vigila(c, texto, nivel) {
    c.vigilancia = c.vigilancia || []; c.vigilancia.push({ t: Date.now(), texto, nivel: nivel || 'ok' }); if (c.vigilancia.length > 80) c.vigilancia.shift();
    if (ACTUAL === c.id) pintaVigila(c);
  }
  function pintaVigila(c) {
    if (ACTUAL !== c.id) return;
    const inc = c.incidencias || 0, rech = c.intrusos || 0;
    $('#vigila').classList.toggle('alerta', inc > 0);
    const ul = $('#vigila-filas'); ul.textContent = '';
    const fila = (cls, b, sp) => { const li = document.createElement('li'); li.className = cls; const i = document.createElement('i'); const bb = document.createElement('b'); bb.textContent = b; const ss = document.createElement('span'); ss.textContent = sp; li.append(i, bb, ss); ul.append(li); };
    const ses = c.sesion && c.sesion.confirmada;
    const hm = (t) => new Date(t).toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' });
    fila(ses ? 'gc-ok' : 'gc-aviso', T('Encriptado'), ses ? T('De extremo a extremo; confirmación de clave recibida.') + ' ' + T('Claves de este encuentro') + ': ' + hm(c.sesion.desde) + ' · ' + T('encuentro') + ' ' + (c.encuentros || 1) : T('Acordando claves…'));
    const verOk = esB(c) ? !!(c.verificada && c.suVerificada) : !!c.verificada;
    fila(verOk ? 'gc-ok' : 'gc-aviso', T('Identidad'), verOk ? T('Verificada por las dos personas.') : esB(c) ? T('Pendiente de la verificación mutua: no sale nada hasta que los dos comprueben el número.') : T('Sin verificar: compara el número de seguridad con la otra persona (escudo).'));
    const presente = !!(c.suId && c.miembros.has(c.suId));
    fila(presente ? 'gc-ok' : 'gc-aviso', T('Otro extremo'), presente ? T('La otra pestaña está conectada a la sala.') : T('La otra pestaña está desconectada; lo pendiente espera en tu equipo.'));
    const lat = R.latencia, hace = R.ultimoPong ? Math.round((Date.now() - R.ultimoPong) / 1000) : null;
    fila(R.abierto && hace != null && hace < 40 ? 'gc-ok' : 'gc-aviso', T('Servidor'), (R.abierto ? T('responde') + (lat != null ? ' · ' + lat + ' ms' : '') + (hace != null ? ' · ' + T('hace') + ' ' + hace + ' s' : '') : T('sin respuesta · reconectando')) + ' · ' + T('transporta contenido encriptado; sin almacenamiento de mensajes'));
    const msgs = c.mensajes.filter((m) => m.tipo === 'texto' && m.dir === 'suya').length, arch = c.mensajes.filter((m) => m.tipo === 'archivo' && (m.estado === 'recibido' || m.estado === 'entregado' || m.estado === 'leido')).length, incompletos = c.mensajes.filter((m) => m.tipo === 'archivo' && m.estado === 'fallo').length;
    fila(inc ? 'gc-alerta' : 'gc-ok', T('Verificación'), (inc ? inc + ' ' + (inc === 1 ? T('dato que no superó la autenticación: descartado') : T('datos que no superaron la autenticación: descartados')) + ' · ' : '') + msgs + ' ' + (msgs === 1 ? T('mensaje recibido autenticado') : T('mensajes recibidos autenticados')) + ' · ' + arch + ' ' + (arch === 1 ? T('archivo completo') : T('archivos completos')) + (incompletos ? ' · ' + incompletos + ' ' + T('incompletos') : ''));
    fila(rech ? 'gc-aviso' : 'gc-ok', T('Entradas rechazadas'), rech ? rech + ' · ' + T('intento de entrada con otra identidad: rechazado; la conversación sigue intacta') : T('Ninguna.'));
    fila(location.protocol === 'https:' || LOCAL ? 'gc-ok' : 'gc-alerta', 'HTTPS', location.protocol === 'https:' || LOCAL ? T('Conexión de esta página: HTTPS.') : T('Esta página no usa HTTPS.'));
    const vv = $('#vigila-vivo'); vv.textContent = '';
    for (const e of [...(c.vigilancia || [])].reverse().slice(0, 40)) { const li = document.createElement('li'); li.className = e.nivel; const tm = document.createElement('time'); tm.textContent = hms(e.t); const sp = document.createElement('span'); sp.textContent = e.texto; li.append(tm, sp); vv.append(li); }
    $('#vigila-ultima').textContent = c.ultimaVerificacion ? T('última verificación') + ' ' + hms(c.ultimaVerificacion) : '';
    // sellada: cifrado confirmado y la otra persona presente (aura, dueño 20:31)
    const sellada = !!(ses && presente);
    $('#conv').classList.toggle('sellada', sellada); $('#sello-insignia').hidden = !sellada;
  }
  // «hace N s» del servidor se mueve cada segundo; la hora de verificación solo cuando ocurre una de verdad
  setInterval(() => { const c = CONVS.get(ACTUAL); if (!c || $('#conv').hidden) return; pintaVigila(c); }, 1000);
  // «Radiografía» permanente (dueño, 26 Oct 20:03): solo lo verificable, en todo momento
  function pintaRadio(c) {
    pintaVigila(c);
    if (ACTUAL !== c.id) return;
    const r = $('#radio'); if (!c.huella) { r.hidden = true; return; }
    const msgs = c.mensajes.filter((m) => m.tipo === 'texto').length, arch = c.mensajes.filter((m) => m.tipo === 'archivo' && (m.estado === 'recibido' || m.estado === 'entregado' || m.estado === 'leido')).length, inc = c.incidencias || 0;
    r.hidden = false; r.className = 'radio' + (inc ? ' mal' : '');
    $('#radiotxt').textContent = inc
      ? inc + ' ' + (inc === 1 ? T('incidencia') : T('incidencias')) + ' · ' + T('envío detenido y anotado')
      : T('Encriptación de extremo a extremo') + ' · ' + msgs + ' ' + (msgs === 1 ? T('mensaje') : T('mensajes')) + ' · ' + arch + ' ' + (arch === 1 ? T('archivo') : T('archivos')) + ' · ' + T('verificación criptográfica superada') + (c.verificada ? ' · ' + T('identidad verificada') : '');
  }
  function pintaTodos(c) {
    const ul = $('#mensajes'); ul.textContent = ''; ul.dataset.dia = '';
    for (const m of c.mensajes) pintaMensaje(c, m, false, true);
    ul.scrollTop = ul.scrollHeight;
  }
  function pintaMensaje(c, m, reemplaza, sinScroll) {
    if (ACTUAL !== c.id) return;
    const ul = $('#mensajes');
    const abajo = ul.scrollHeight - ul.scrollTop - ul.clientHeight < 80;
    let li = ul.querySelector('[data-id="' + m.id + '"]');
    if (li && !reemplaza) return;
    if (!li) {
      // el «escribiendo…» va siempre el último: se aparta mientras entra el mensaje y vuelve detrás; si el mensaje es suyo, se quita
      const esc = ul.querySelector('li.gc-escribiendo'); if (esc) esc.remove();
      if (ul.dataset.dia !== diaDe(m.t)) { ul.dataset.dia = diaDe(m.t); const f = document.createElement('li'); f.className = 'gc-fecha'; f.textContent = fecha(m.t); ul.append(f); }
      li = document.createElement('li'); li.dataset.id = m.id; ul.append(li);
      if (esc) { if (m.dir === 'suya') clearTimeout(escribeT); else ul.append(esc); }
      const prev = li.previousElementSibling; if (prev && prev.dataset.dir === m.dir && m.dir !== 'sistema' && m.tipo !== 'llamada' && !prev.classList.contains('gc-llam-li') && m.t - (+prev.dataset.t || 0) < 300000) li.classList.add('gc-sigue');
    }
    li.dataset.dir = m.dir; li.dataset.t = m.t; li.textContent = '';
    if (m.tipo === 'llamada' && m.dir !== 'sistema') { li.className = 'gc-llam-li'; li.append(burbujaLlamada(m)); if (!sinScroll && (abajo || m.dir === 'mia')) ul.scrollTop = ul.scrollHeight; return; }
    if (m.tipo === 'llamada') { li.className = 'gc-centro'; const l = document.createElement('span'); l.className = 'gc-linea-llamada'; l.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>'; l.append(document.createTextNode(m.texto)); li.append(l); if (!sinScroll && abajo) ul.scrollTop = ul.scrollHeight; return; }
    if (m.tipo === 'recibo') { li.className = 'gc-centro'; const d = document.createElement('div'); d.className = 'recibo'; const partes = String(m.texto).split(' · '); const h = document.createElement('b'); h.textContent = '✓ ' + partes[0]; d.append(h); for (const x of partes.slice(1)) { const sp = document.createElement('span'); sp.textContent = x; d.append(sp); } li.append(d); if (!sinScroll && abajo) ul.scrollTop = ul.scrollHeight; return; }
    if (m.tipo === 'custodia') { li.className = 'gc-centro'; li.append(tarjetaCustodia(m)); if (!sinScroll && abajo) ul.scrollTop = ul.scrollHeight; return; }
    if (m.dir === 'sistema') { li.className = 'gc-nota-sistema'; li.textContent = T(m.texto); if (!sinScroll && abajo) ul.scrollTop = ul.scrollHeight; return; }
    const bur = document.createElement('div'); bur.className = 'gc-burbuja ' + (m.dir === 'mia' ? 'gc-mia' : 'gc-suya') + (li.classList.contains('gc-sigue') ? ' gc-sigue' : '');
    if (m.tipo === 'texto') { const s = document.createElement('span'); s.className = 'gc-texto'; s.append(...enlaza(m.texto)); bur.append(s);
      // la ubicación, con su botón «Abrir en el mapa»
      const u = /^📍 [^:]+: (-?\d{1,2}\.\d{2,6}), (-?\d{1,3}\.\d{2,6}) \(([^)]*)\)\n(https:\/\/www\.openstreetmap\.org\/\S+)$/.exec(m.texto || '');
      if (u) { s.textContent = ''; s.classList.add('gc-ubicacion'); const t = document.createElement('b'); t.textContent = '📍 ' + T('Ubicación'); const k = document.createElement('small'); k.textContent = u[1] + ', ' + u[2] + ' · ' + u[3]; const a = document.createElement('a'); a.href = u[4]; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'gc-ubi-abrir'; a.textContent = T('Abrir en el mapa'); s.append(t, k, a); } }
    else if (m.tipo === 'archivo') bur.append(tarjetaArchivo(m));
    const meta = document.createElement('span'); meta.className = 'gc-meta'; const tm = document.createElement('time'); tm.textContent = hora(m.t); meta.append(tm);
    if (m.dir === 'mia') { const tk = document.createElement('span'); tk.className = 'gc-ticks'; meta.append(tk); }
    bur.append(meta); li.append(bur); pintaEstado(m);
    if (!sinScroll && (abajo || m.dir === 'mia')) ul.scrollTop = ul.scrollHeight;
  }
  const TICK1 = '<svg viewBox="0 0 16 11"><path d="M1 6l3.5 3.5L11 2"/></svg>', TICK2 = '<svg viewBox="0 0 16 11"><path d="M1 6l3.5 3.5L11 2M6 9.5L15 2"/></svg>', RELOJ = '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.6"/><path d="M6 3.3V6l1.9 1.2"/></svg>';
  function pintaEstado(m) {
    const li = $('#mensajes [data-id="' + m.id + '"]'); if (!li) return;
    const tk = li.querySelector('.gc-ticks'); if (!tk) return;
    // reloj = pendiente · ✓ gris = enviado · ✓✓ gris = entregado · ✓✓ verde = leído (dueño, 28 Oct 2026, 13:30: «cuando él lo
    // abra quiero que los tics se pongan en azul o en verde, para que yo sepa que él lo ha leído»; antes, el azul acero de
    // leído casi no se distinguía del gris sobre la burbuja azulada)
    tk.classList.toggle('gc-pendiente', m.estado === 'pendiente');
    tk.classList.toggle('gc-leido', m.estado === 'leido');
    tk.classList.toggle('gc-fallo', m.estado === 'fallo');
    tk.innerHTML = m.estado === 'pendiente' ? RELOJ : m.estado === 'enviado' ? TICK1 : m.estado === 'fallo' ? '' : TICK2;
    tk.style.color = ''; tk.style.opacity = '';
    tk.title = m.estado === 'pendiente' ? T('Pendiente: saldrá cuando la otra persona entre') : m.estado === 'enviado' ? T('Enviado') : m.estado === 'entregado' ? T('Entregado') : m.estado === 'leido' ? T('Leído') : m.estado === 'fallo' ? T('No se pudo enviar') : '';
    tk.setAttribute('aria-label', tk.title);
    if (m.estado === 'fallo') tk.textContent = '!';
  }
  function pintaProgreso(m) { const li = $('#mensajes [data-id="' + m.id + '"]'); if (!li) return; if (!li.querySelector('.gc-progreso')) { const c = CONVS.get(m.conv); if (c) pintaMensaje(c, m, true); return; } const i = li.querySelector('.gc-progreso i'); if (i) i.style.width = Math.round((m.archivo.progreso || 0) * 100) + '%'; const s = li.querySelector('.gc-archivo small'); if (s) s.textContent = tamano(m.archivo.tam) + (m.archivo.progreso < 1 ? ' · ' + Math.round(m.archivo.progreso * 100) + ' %' : ''); }
  const tamano = (n) => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
  function tarjetaArchivo(m) {
    const d = document.createElement('div'); d.className = 'gc-archivo';
    const ic = document.createElement('span'); ic.className = 'gc-archivo-icono'; ic.innerHTML = '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';
    const b = document.createElement('b'); b.textContent = m.archivo.nombre; b.setAttribute('translate', 'no');
    const s = document.createElement('small');
    const pr = m.archivo.progreso || 0;
    s.textContent = tamano(m.archivo.tam) + (m.estado === 'fallo' ? ' · ' + (m.archivo.motivo || T('no se completó')) : pr < 1 && (m.estado === 'recibiendo' || m.estado === 'enviado') ? ' · ' + Math.round(pr * 100) + ' %' : m.estado === 'pendiente' ? ' · ' + T('pendiente') : m.archivo.enDisco ? ' · ' + T('guardado en tu disco') : '');
    d.append(ic, b, s);
    const enCurso = m.estado !== 'fallo' && pr < 1 && m.estado !== 'pendiente';
    if (enCurso) { const p = document.createElement('span'); p.className = 'gc-progreso'; const i = document.createElement('i'); i.style.width = Math.round(pr * 100) + '%'; p.append(i); d.append(p); }
    if (m.estado === 'recibido' || m.estado === 'entregado' || m.estado === 'leido') { const se = document.createElement('span'); se.className = 'sello'; se.textContent = '✓ ' + T('Completo y autenticado: encriptado de extremo a extremo'); d.append(se); }
    else if (m.estado === 'fallo' && /alterados/.test(m.archivo.motivo || '')) { const se = document.createElement('span'); se.className = 'sello mal'; se.textContent = '✕ ' + T('Detenido: no superó la autenticación'); d.append(se); }
    const fila = document.createElement('div'); fila.className = 'fila';
    if (m.dir === 'suya' && m.estado === 'recibiendo' && m.archivo.aDisco && !m.archivo.enDisco) { const g = document.createElement('button'); g.type = 'button'; g.className = 'boton principal'; g.textContent = T('Guardar en…'); g.addEventListener('click', () => { const c = CONVS.get(m.conv); if (c) eligeDestino(c, m); }); fila.append(g); }
    if ((m.dir === 'suya' && m.estado === 'recibido' && !m.archivo.enDisco) || (m.dir === 'mia' && /^(image|audio)\//.test(m.archivo.mime))) {
      if (/^audio\//.test(m.archivo.mime)) { BD.saca('arch', m.id).then((r) => { if (!r) return; const au = document.createElement('audio'); au.controls = true; au.preload = 'metadata'; au.src = URL.createObjectURL(r.blob); au.style.gridColumn = '1 / -1'; d.prepend(au); }); }
      if (/^image\//.test(m.archivo.mime) && m.archivo.tam < 24 * 1024 * 1024) { BD.saca('arch', m.id).then((r) => { if (!r) return; const img = document.createElement('img'); img.className = 'imagen'; img.alt = m.archivo.nombre; img.src = URL.createObjectURL(r.blob); img.style.gridColumn = '1 / -1'; img.addEventListener('click', () => abreArchivo(m, false)); d.prepend(img); }); }
      if (m.dir === 'suya') { const g = document.createElement('button'); g.type = 'button'; g.className = 'boton'; g.textContent = T('Guardar'); g.addEventListener('click', () => abreArchivo(m, true)); fila.append(g); }
    }
    if (VIAJES.has(m.id) && VJ()) { const b = document.createElement('button'); b.type = 'button'; b.className = 'boton vj-ver'; b.innerHTML = RUTA; b.append(document.createTextNode(T('Ver el viaje'))); b.addEventListener('click', () => { const v = VIAJES.get(m.id); if (v) VJ().abre(v); }); fila.append(b); }
    if (sePuedeCortar(m)) { const x = document.createElement('button'); x.type = 'button'; x.className = 'boton peligro'; x.textContent = T('Cortar el envío'); x.addEventListener('click', () => { const c = CONVS.get(m.conv); if (c) cortaArchivo(c, m); }); fila.append(x); }
    if (fila.childNodes.length) d.append(fila);
    return d;
  }
  // Cortar un archivo a medias (dueño, 28 Oct 2026: «por si alguien quiere cortar, que lo pueda cortar»): desde los dos
  // lados, mientras se envía, se recibe o espera. El otro equipo recibe la orden al momento y deja de llegar nada.
  function sePuedeCortar(m) {
    if (m.tipo !== 'archivo' || m.archivo.voz) return false;
    const c = CONVS.get(m.conv); if (!c || !c.archivos.has(m.id)) return false;
    return m.dir === 'mia' ? (m.estado === 'pendiente' || (m.estado === 'enviado' && (m.archivo.progreso || 0) < 1)) : m.estado === 'recibiendo';
  }
  async function cortaArchivo(c, m) {
    if (!sePuedeCortar(m)) return;
    const a = c.archivos.get(m.id);
    if (a) { a.cancelado = true; if (a.escritor) { try { await a.escritor.abort(); } catch (_) {} } if (typeof a.sigue === 'function') { try { a.sigue(); } catch (_) {} } c.archivos.delete(m.id); }
    if (Array.isArray(c.cola)) c.cola = c.cola.filter((x) => x.id !== m.id);
    enviaControl(c, { tipo: 'archivo-cancel', id: m.id, por: 'persona' });
    m.estado = 'fallo'; m.archivo.motivo = T('cortado por ti'); await guardaMensaje(c, m); pintaMensaje(c, m, true);
    const v = VIAJES.get(m.id); if (v && v.estado !== 'entregado' && v.estado !== 'fallo') { v.estado = 'fallo'; v.tFin = Date.now(); evento(v, T('Has cortado el envío.'), 'mal'); }
  }
  // Fotos sin datos ocultos: se vuelven a dibujar antes de encriptar, así no salen la ubicación GPS, el modelo del teléfono ni la
  // fecha que lleva el archivo. Los vídeos van como están (sus datos no se pueden limpiar aquí).
  async function sinDatosOcultos(f) {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(f.type || '')) return f;
    try {
      const bmp = await createImageBitmap(f, { imageOrientation: 'from-image' });
      const k = Math.min(1, 4096 / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(bmp, 0, 0, w, h); if (bmp.close) bmp.close();
      const tipo = /png/i.test(f.type) ? 'image/png' : 'image/jpeg';
      const blob = await new Promise((r) => cv.toBlob(r, tipo, 0.92)); if (!blob) return f;
      const base = String(f.name || 'foto').replace(/\.[a-z0-9]{2,5}$/i, '') || 'foto';
      return new File([blob], base + (tipo === 'image/png' ? '.png' : '.jpg'), { type: tipo, lastModified: Date.now() });
    } catch (_) { return f; }
  }
  // La ubicación, solo al pulsar: exacta (5 decimales) o aproximada (2 decimales, unos 1 km). Va como un mensaje encriptado más,
  // con el enlace al mapa; el mapa solo se abre si la otra persona lo toca.
  function mandaUbicacion(aprox) {
    if (!navigator.geolocation) { aviso(T('Este navegador no puede dar la ubicación.')); return; }
    navigator.geolocation.getCurrentPosition((p) => {
      const d = aprox ? 2 : 5, la = p.coords.latitude.toFixed(d), lo = p.coords.longitude.toFixed(d), z = aprox ? 14 : 17;
      const precision = aprox ? T('aproximada, unos 1 km') : '±' + Math.max(1, Math.round(p.coords.accuracy || 0)) + ' m';
      const texto = '📍 ' + T('Ubicación') + ': ' + la + ', ' + lo + ' (' + precision + ')\nhttps://www.openstreetmap.org/?mlat=' + la + '&mlon=' + lo + '#map=' + z + '/' + la + '/' + lo;
      const ta = $('#texto'); ta.value = texto; ta.dispatchEvent(new Event('input')); $('#enviar').click();
    }, () => aviso(T('No se ha podido obtener la ubicación: revisa el permiso del navegador.')), { enableHighAccuracy: !aprox, timeout: 15000, maximumAge: 30000 });
  }
  if (LOCAL) window.__gcomPruebas = { sinDatosOcultos };
  function enlaza(texto) {
    const out = []; const re = /https?:\/\/[^\s<>"']+/g; let i = 0, m;
    while ((m = re.exec(texto))) { if (m.index > i) out.push(document.createTextNode(texto.slice(i, m.index))); const a = document.createElement('a'); a.href = m[0]; a.textContent = m[0]; a.target = '_blank'; a.rel = 'noopener noreferrer'; out.push(a); i = m.index + m[0].length; }
    if (i < texto.length) out.push(document.createTextNode(texto.slice(i)));
    return out;
  }

  // ---------- hojas ----------
  const abreHoja = (id) => { $('#' + id).classList.add('gc-abierta'); };
  const cierraHoja = (id) => { $('#' + id).classList.remove('gc-abierta'); const c = CONVS.get(ACTUAL); if (c) setTimeout(() => marcaLeidos(c), 60); };
  function pintaCodigo(c) {
    const e = $('#codigo'); e.textContent = codigoBonito(c.codigo); e.className = 'codigo' + (c.codigoUsado ? ' usado' : (c.codigo && Date.now() > c.codigoCaduca ? ' caducado' : ''));
    const caducado = c.codigo && Date.now() > c.codigoCaduca;
    const est = c.ocupada ? T('Esta invitación ya la usó otra persona.') : c.codigoUsado ? T('La otra persona ha escrito el código: conectando…') : caducado ? T('Este código ha caducado (10 minutos). Pide uno nuevo.') : '';
    $('#invita-estado').textContent = est; $('#invita-estado').hidden = !est;
    const v = $('#validez'); v.hidden = !c.codigo || caducado || c.codigoUsado;
    if (c.codigo && !caducado) { const q = Math.max(0, Math.round((c.codigoCaduca - Date.now()) / 1000)); v.textContent = ''; v.append(document.createTextNode(T('Es válido durante 10 minutos y para un solo uso; después deja de funcionar.') + ' ' + T('Le quedan') + ' ')); const b = document.createElement('b'); b.textContent = Math.floor(q / 60) + ':' + String(q % 60).padStart(2, '0'); v.append(b); v.append(document.createTextNode('.')); }
    $('#invita-nuevo').hidden = !(caducado && !c.huella);
  }
  function muestraInvitacion(c) {
    pintaCodigo(c);
    clearInterval(muestraInvitacion.reloj); muestraInvitacion.reloj = setInterval(() => { if ($('#paso-codigo').hidden) return clearInterval(muestraInvitacion.reloj); pintaCodigo(c); }, 1000);
  }
  async function muestraEscudo(c) {
    const ul = $('#escudo-lista'); ul.textContent = '';
    const fila = (cls, b, s) => { const li = document.createElement('li'); li.className = cls; const i = document.createElement('i'); const bb = document.createElement('b'); bb.textContent = b; const ss = document.createElement('span'); ss.textContent = s; li.append(i, bb, ss); ul.append(li); };
    if (esB(c)) {
      fila(c.sesion ? 'gc-ok' : 'gc-info', T('Sesión blindada'), T('Algoritmos de la suite CNSA 2.0: ML-KEM-1024 y ECDH P-384 para las claves, ML-DSA-87 y ECDSA P-384 para las firmas, AES-256-GCM y SHA-384.'));
      fila('gc-ok', T('Renovación de claves'), T('Claves nuevas cada 5 minutos y en cada reconexión: lo anterior deja de poder leerse con lo nuevo.'));
      fila(c.verificada && c.suVerificada ? 'gc-ok' : 'gc-aviso', T('Verificación mutua'), c.verificada && c.suVerificada ? T('Los dos han comprobado el número de seguridad.') : T('Hasta que los dos comprueben el número de seguridad, no se envía nada.'));
    } else fila(c.sesion ? 'gc-ok' : 'gc-info', T('Encriptación de extremo a extremo'), T('AES-256-GCM con una clave distinta por mensaje; la sesión se renueva en cada conexión (ECDH P-256 con firma ECDSA).'));
    fila('gc-info', T('Servidor de GUARDIANA'), T('encamina tramas encriptadas que no puede leer; ve conexión y volumen, no contenido; no guarda historial'));
    fila(c.incidencias ? 'gc-alerta' : 'gc-ok', T('Verificación'), c.incidencias ? (c.incidencias + ' ' + (c.incidencias === 1 ? T('incidencia') : T('incidencias')) + ': ' + T('datos que no superaron la autenticación, descartados y anotados en la conversación.')) : T('Cada mensaje y cada trozo de archivo se autentica al llegar; hasta ahora, todos superaron la verificación.'));
    fila(c.verificada ? 'gc-ok' : 'gc-aviso', c.verificada ? T('Identidad verificada') : T('Identidad sin verificar'), c.verificada ? T('Los dos comprobaron el número de seguridad.') : T('Hasta que los dos comprueben el número, confías en que el enlace llegó a la persona correcta.'));
    fila('gc-aviso', T('Límites'), T('No es anonimato: el relé ve tu dirección IP, la sala y el volumen de tráfico, no el contenido.') + ' ' + T('Tu identidad vive en este navegador: se pierde si borras los datos del sitio o cambias de equipo.') + ' ' + T('Los archivos recibidos quedan en este navegador sin nuestra encriptación; «Destruir» no alcanza lo ya guardado en un disco.') + ' ' + T('Ninguna encriptación protege un equipo o navegador comprometido.') + ' ' + T('El viaje de cada archivo y su comprobante muestran a la otra persona el país de tu equipo, estimado por la zona horaria del navegador; nunca la zona horaria ni la dirección IP.'));
    $('#numero').textContent = c.huella ? await numeroDe(c) : T('Aparecerá cuando la otra persona entre.');
    $('#verificada').checked = !!c.verificada; $('#verificada').disabled = !c.huella;
    $('#destruir-nota').hidden = true;
    abreHoja('h-escudo');
  }

  // ---------- avisos ----------
  let avisoT = null;
  let avisoConvId = null;
  function aviso(txt) { const e = $('#aviso'); e.textContent = txt; e.hidden = false; e.classList.remove('con-conv'); avisoConvId = null; clearTimeout(avisoT); avisoT = setTimeout(() => { e.hidden = true; }, 4200); }
  // lo que pasa en otra conversación: un aviso de unos segundos, sin el contenido; al tocarlo se abre esa conversación
  function avisoConv(c, plantilla) { if (!c || ACTUAL === c.id) return; aviso(plantilla.replace('{n}', nombreConv(c, true))); avisoConvId = c.id; $('#aviso').classList.add('con-conv'); }
  let ctxAudio = null;
  // El «pip» de mensaje nuevo (dueño, 28 Oct 2026, 15:03: «un pequeño pip si le escribo un mensaje»): dos notas cortas y suaves.
  // El contexto de sonido se desbloquea con el primer toque o tecla en la página, para que el pip suene también con
  // GUARDIANA minimizada o en otra pestaña (los navegadores no dejan sonar nada antes de un gesto de la persona).
  function avisaSonido() {
    try {
      ctxAudio = ctxAudio || new (window.AudioContext || window.webkitAudioContext)();
      if (ctxAudio.state === 'suspended') ctxAudio.resume().catch(() => {});
      const t = ctxAudio.currentTime + 0.01;
      for (const [f, d] of [[988, 0], [1319, 0.09]]) {
        const o = ctxAudio.createOscillator(), g = ctxAudio.createGain(); o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.11, t + d + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.16);
        o.connect(g).connect(ctxAudio.destination); o.start(t + d); o.stop(t + d + 0.18);
      }
    } catch (_) {}
  }
  const desbloqueaSonido = () => { try { ctxAudio = ctxAudio || new (window.AudioContext || window.webkitAudioContext)(); if (ctxAudio.state === 'suspended') ctxAudio.resume().catch(() => {}); } catch (_) {} };
  for (const ev of ['pointerdown', 'keydown', 'touchstart']) addEventListener(ev, desbloqueaSonido, { once: true, capture: true, passive: true });
  // El teclado del iPhone (dueño, 28 Oct 2026, 15:26: «cuando se me abre el teclado, se me sube para arriba todo el chat… se ve
  // como la mitad de la pantalla»). Safari no encoge la página con el teclado: la sube entera y la cabecera se va. Aquí la página
  // mide lo que de verdad se ve (visualViewport) y se coloca donde se ve: cabecera arriba, campo justo encima del teclado y la
  // conversación en medio, con lo último a la vista. En Android ya lo hace el navegador (interactive-widget=resizes-content).
  // Nada de conversaciones viejas en pantalla (dueño, 28 Oct 2026, 15:41: «cuando se termina un chat… que se borre todo, que no
  // aparezca»): al salir de la página se vacía lo que se ve, para que la copia que guarda el navegador para «Atrás» no lleve
  // mensajes; y si el navegador la saca de esa copia, se vuelve a cargar desde cero (lo terminado ya no existe).
  addEventListener('pagehide', () => { try { const m = document.querySelector('#mensajes'); if (m) m.textContent = ''; } catch (_) {} });
  addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });
  // Tirar hacia abajo para actualizar, como en las apps (dueño, 28 Oct 2026, 18:30: «cuando la persona toca la pantalla de arriba
  // para abajo, tiene que moverse y hacer como que está actualizando, que se ha actualizado»). En el teléfono, en el inicio y en
  // los mensajes, estando arriba del todo: lo de dentro baja con el dedo (con resistencia) y aparece un círculo que gira con él;
  // pasado el punto, al soltar, gira solo, la app se vuelve a cargar (así coge también la última versión publicada) y al volver
  // dice «Actualizado». Nunca durante una llamada, con el teclado abierto, una hoja abierta o la invitación en pantalla.
  (function tiraParaActualizar() {
    if (!matchMedia('(pointer: coarse)').matches) return;
    const UMBRAL = 70, MAX = 110, MARCA = 'gcom-actualizado';
    const ind = document.createElement('div'); ind.className = 'tirar'; ind.setAttribute('aria-hidden', 'true');
    ind.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.2v4.6h-4.6"/></svg><svg class="tirar-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg><span></span>';
    document.body.append(ind);
    let y0 = null, x0 = 0, tira = 0, activo = null, ocupado = false, arriba = 0;
    const puede = () => !ocupado && !document.body.classList.contains('en-llamada') && !document.documentElement.classList.contains('con-teclado')
      && !document.querySelector('.gc-hoja.gc-abierta') && !($('#inicio') && $('#inicio').classList.contains('con-invitacion')) && !($('#adjuntos') && !$('#adjuntos').hidden);
    const pinta = (d) => {
      ind.style.setProperty('--tirar-y', (arriba + d - 46) + 'px'); ind.style.setProperty('--tirar-giro', (d / UMBRAL * 300) + 'deg');
      ind.classList.toggle('ver', d > 4); ind.classList.toggle('listo', d >= UMBRAL);
      if (activo) activo.style.transform = d ? 'translateY(' + d + 'px)' : '';
    };
    const vuelve = () => {
      ind.classList.add('suelta'); if (activo) { activo.style.transition = 'transform .25s ease'; }
      pinta(0); const a = activo; setTimeout(() => { ind.classList.remove('suelta'); if (a) { a.style.transition = ''; a.style.transform = ''; } }, 260);
      activo = null; tira = 0;
    };
    const actualiza = () => {
      ocupado = true; ind.classList.add('suelta', 'girando'); if (activo) activo.style.transition = 'transform .25s ease';
      pinta(UMBRAL * 0.8);
      try { sessionStorage.setItem(MARCA, '1'); } catch (_) {}
      setTimeout(() => location.reload(), 650);
    };
    document.addEventListener('touchstart', (e) => {
      y0 = null; if (e.touches.length !== 1 || !puede()) return;
      const c = e.target.closest && e.target.closest('#inicio, #mensajes'); if (!c || c.scrollTop > 0 || c.closest('[hidden]')) return;
      activo = c; y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; tira = 0; arriba = Math.max(0, c.getBoundingClientRect().top);
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (y0 === null || !activo) return;
      const dy = e.touches[0].clientY - y0, dx = Math.abs(e.touches[0].clientX - x0);
      if (tira === 0 && (dy <= 0 || dx > dy || activo.scrollTop > 0)) { y0 = null; activo = null; return; }
      e.preventDefault();
      tira = Math.max(0, Math.min(MAX, dy * 0.55)); pinta(tira);
    }, { passive: false });
    const fin = () => { if (y0 === null) return; y0 = null; if (tira >= UMBRAL) actualiza(); else vuelve(); };
    document.addEventListener('touchend', fin); document.addEventListener('touchcancel', () => { if (y0 !== null) { y0 = null; vuelve(); } });
    // al volver de actualizar: «Actualizado», un momento, debajo de lo de arriba
    let vino = false; try { vino = sessionStorage.getItem(MARCA) === '1'; sessionStorage.removeItem(MARCA); } catch (_) {}
    if (vino) {
      const sp = ind.querySelector('span'); if (sp) sp.textContent = T('Actualizado');
      const cab = document.querySelector('#barra:not([hidden])'); arriba = cab && cab.offsetHeight ? cab.getBoundingClientRect().bottom : 0;
      ind.classList.add('hecho'); pinta(58); ind.classList.add('ver');
      setTimeout(() => { ind.classList.add('suelta'); ind.classList.remove('ver'); setTimeout(() => { ind.classList.remove('hecho', 'suelta'); pinta(0); }, 300); }, 1300);
    }
  })();
  // (28 Oct 2026, 17:10–17:17: «cuando se implementa el teclado, sube, baja… que se quede fijado en pantalla») El teclado se
  // detectaba comparando lo que se ve con innerHeight; pero en el iPhone, con la app en la pantalla de inicio (iOS 26), innerHeight
  // también baja con el teclado, así que no se notaba nada y el iPhone subía la página entera: la cabecera se iba arriba y quedaba
  // el chat a media pantalla. Ahora se compara con lo más alto que se ha visto con este ancho y la página, en el teléfono, va fija
  // (app.css): no hay nada que el iPhone pueda subir. Si aun así algo la desplaza, vuelve arriba.
  (function tecladoMovil() {
    const vv = window.visualViewport; if (!vv) return;
    const tactil = matchMedia('(pointer: coarse)');
    const raizDoc = document.documentElement;
    let raf = 0, abierto = false, ancho = 0, maximo = 0;
    const escribe = () => {
      const a = document.activeElement; if (!a || a === document.body) return false;
      if (a.isContentEditable || a.tagName === 'TEXTAREA') return true;
      return a.tagName === 'INPUT' && !/^(button|checkbox|radio|range|file|submit|reset|color|image|hidden)$/i.test(a.type || '');
    };
    const ajusta = () => {
      raf = 0;
      if (!tactil.matches || vv.scale > 1.01) return; // con el zoom de dos dedos, como está
      const w = Math.round(vv.width), h = Math.round(vv.height);
      if (Math.abs(w - ancho) > 2) { ancho = w; maximo = 0; } // al girar, se vuelve a medir
      maximo = Math.max(maximo, h);
      // abierto: lo que se ve es mucho menos que lo más alto visto; para abrirse hace falta un campo de escribir con el foco
      const ahora = maximo - h > 140 && (abierto || escribe());
      if (ahora) { raizDoc.style.setProperty('--alto-vv', h + 'px'); raizDoc.style.setProperty('--arriba-vv', Math.max(0, Math.round(vv.offsetTop)) + 'px'); }
      if (ahora !== abierto) {
        abierto = ahora; raizDoc.classList.toggle('con-teclado', ahora);
        if (!ahora) { raizDoc.style.removeProperty('--alto-vv'); raizDoc.style.removeProperty('--arriba-vv'); }
        else { const m = document.querySelector('#mensajes'); if (m) requestAnimationFrame(() => { m.scrollTop = m.scrollHeight; }); }
      }
      if (window.scrollY || window.scrollX) window.scrollTo(0, 0);
    };
    const pide = () => { if (!raf) raf = requestAnimationFrame(ajusta); };
    vv.addEventListener('resize', pide); vv.addEventListener('scroll', pide);
    addEventListener('scroll', pide, { passive: true });
    document.addEventListener('focusin', pide); document.addEventListener('focusout', () => setTimeout(pide, 80));
    ajusta();
  })();


  // ---------- con GUARDIANA minimizada (dueño, 28 Oct 2026, 13:34: «que en la pantalla minimizada aparezca algún salto…
  // una especie de notificación») ----------
  // Sin servidor de avisos: lo hace esta misma página mientras está abierta. Lo nuevo se cuenta en el título de la pestaña
  // («(2) Comunicaciones · GUARDIANA») con un punto en el icono; con el permiso del navegador, además, el aviso del sistema,
  // que nunca lleva el texto del mensaje ni el nombre. Al volver a la página, todo se borra.
  const TITULO = document.title;
  let nuevos = 0, avisoSis = null, avisoLlam = null, iconoOriginal = null, iconoPunto = null;
  const fuera = () => document.visibilityState !== 'visible' || !document.hasFocus();
  const avisosSistema = () => { try { return 'Notification' in window && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent); } catch (_) { return false; } };
  const permisoAvisos = () => { try { return avisosSistema() ? Notification.permission : 'no'; } catch (_) { return 'no'; } };
  function iconoConPunto() {
    if (iconoPunto) return Promise.resolve(iconoPunto);
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => { try { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); x.drawImage(im, 0, 0, 64, 64); x.beginPath(); x.arc(49, 15, 14, 0, 2 * Math.PI); x.fillStyle = '#06080C'; x.fill(); x.beginPath(); x.arc(49, 15, 11, 0, 2 * Math.PI); x.fillStyle = '#E07A6C'; x.fill(); iconoPunto = cv.toDataURL('image/png'); res(iconoPunto); } catch (_) { res(null); } };
      im.onerror = () => res(null); im.src = '/icon-192.png';
    });
  }
  let parpadeo = null, fase = false;
  function pintaTitulo(llamada) {
    clearInterval(parpadeo); parpadeo = null;
    const base = llamada ? llamada + ' · ' + TITULO : (nuevos ? '(' + nuevos + ') ' : '') + TITULO;
    document.title = base;
    // el título alterna para que la pestaña y el botón de la barra de tareas «salten» (Gemini, ronda 74)
    if ((nuevos || llamada) && fuera()) { const alt = llamada ? '📞 ' + llamada : '💬 ' + (nuevos === 1 ? T('Mensaje nuevo') : T('{n} mensajes nuevos').replace('{n}', nuevos)); parpadeo = setInterval(() => { fase = !fase; document.title = fase ? alt : base; }, llamada ? 700 : 1000); }
    try { if (navigator.setAppBadge) { if (nuevos) navigator.setAppBadge(nuevos).catch(() => {}); else navigator.clearAppBadge().catch(() => {}); } } catch (_) {}
    const l = document.querySelector('link[rel="icon"]'); if (!l) return;
    if (iconoOriginal === null) iconoOriginal = l.getAttribute('href');
    if (!nuevos && !llamada) { if (l.getAttribute('href') !== iconoOriginal) l.setAttribute('href', iconoOriginal); return; }
    iconoConPunto().then((u) => { if (u && (nuevos || llamada)) l.setAttribute('href', u); });
  }
  // devuelve true si ha salido el aviso del sistema (entonces no hace falta el pitido de la página)
  function avisaFuera(c, que, video) {
    if (!fuera()) return false;
    nuevos++; pintaTitulo();
    if (permisoAvisos() !== 'granted') return false;
    try {
      if (avisoSis) avisoSis.close();
      const cuerpo = que === 'perdida' ? (video ? T('Videollamada perdida.') : T('Llamada perdida.')) : nuevos === 1 ? T('Tienes un mensaje nuevo.') : T('Tienes {n} mensajes nuevos.').replace('{n}', nuevos);
      const n = new Notification('GUARDIANA', { body: cuerpo, tag: 'gcom-nuevo', icon: '/icon-192.png', silent: true }); // silent y renotify no pueden ir juntos: el anterior ya se cerró arriba
      n.onclick = () => { try { window.focus(); } catch (_) {} n.close(); };
      avisoSis = n; return true;
    } catch (_) { return false; }
  }
  // la llamada que entra con la página minimizada: aviso que se queda hasta contestar o colgar, y el título lo dice
  let tituloLlamada = false;
  let servidorDicho = false;
  function avisaLlamada(est, video) {
    if ((est === 'conectando' || est === 'hablando') && LLAMADA_CONV && ACTUAL !== LLAMADA_CONV && CONVS.has(LLAMADA_CONV)) abreConv(LLAMADA_CONV);
    if (est === 'libre') servidorDicho = false;
    if (est === 'hablando' && !servidorDicho && servidorLlamada()) { servidorDicho = true; const c = convLl(); if (c) vigila(c, T('Tu llamada pasa por el servidor de llamadas de {s}.').replace('{s}', servidorLlamada()), 'ok'); }
    if (est === 'libre' || est === 'entrante') setTimeout(pintaLista, 0);
    if (est === 'entrante') {
      if (!fuera()) return;
      const tit = video ? T('Videollamada entrante') : T('Llamada entrante');
      tituloLlamada = true; pintaTitulo(tit);
      if (!avisoLlam && permisoAvisos() === 'granted') { try { const n = new Notification(tit, { body: T('GUARDIANA · Toca para contestar.'), tag: 'gcom-llamada', icon: '/icon-192.png', requireInteraction: true, silent: true /* suena nuestro timbre */ }); n.onclick = () => { try { window.focus(); } catch (_) {} n.close(); }; avisoLlam = n; } catch (_) {} }
      return;
    }
    if (avisoLlam) { try { avisoLlam.close(); } catch (_) {} avisoLlam = null; }
    if (tituloLlamada) { tituloLlamada = false; pintaTitulo(); }
  }
  function vuelve() { if (fuera()) return; if (nuevos || parpadeo) { nuevos = 0; pintaTitulo(); } if (avisoSis) { try { avisoSis.close(); } catch (_) {} avisoSis = null; } const c = CONVS.get(ACTUAL); if (c) marcaLeidos(c); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { const c = CONVS.get(ACTUAL); if (c) marcaLeidos(c); } vuelve(); });
  addEventListener('focus', vuelve);
  // la tira para pedir el permiso: solo en el ordenador, con la conversación ya establecida, y una sola vez
  function pintaAvisos(c) {
    const b = $('#cavisos'); if (!b) return;
    let no = false; try { no = localStorage.getItem('gcom-avisos') === 'no'; } catch (_) {}
    b.hidden = true; // dueño, 28 Oct 2026, 15:10: fuera la tira de la campanita; los avisos se activan desde «⋯» → «Activar avisos»
    void no; void c;
  }

  // ---------- «escribiendo…» propio: el aviso va solo a la conversación donde se escribe ----------
  let escribeUlt = 0, escribeQue = '', escribeConv = null;
  function avisaEscribe(que) {
    const ahora = Date.now();
    if (que === 'no') {
      const cc = escribeConv && CONVS.get(escribeConv);
      if (cc && escribeQue && ahora - escribeUlt < 8000 && enLinea(cc)) enviaControl(cc, { tipo: 'escribe', que: 'no' });
      escribeQue = ''; escribeUlt = 0; escribeConv = null; return;
    }
    const c = CONVS.get(ACTUAL); if (!c || !enLinea(c) || !c.sesion.confirmada || !puedeEnviar(c)) return;
    if (!pref('escribe')) { escribeQue = ''; return; }
    if (escribeConv && escribeConv !== c.id) avisaEscribe('no');
    if (que === escribeQue && escribeConv === c.id && ahora - escribeUlt < 3000) return;
    escribeQue = que; escribeUlt = ahora; escribeConv = c.id; enviaControl(c, { tipo: 'escribe', que });
  }
  const paraEscribe = () => { if (escribeQue) avisaEscribe('no'); };

  // ---------- «escribiendo…» de la otra persona (dueño, 28 Oct 2026, 13:29) ----------
  // Una burbuja suya con tres puntos al final del chat (o «Grabando audio…»); se va al llegar su mensaje, con su aviso de
  // que ha borrado el texto o, si deja de llegar, a los 7 segundos.
  let escribeT = null;
  function muestraEscribe(c, que) {
    const ul = $('#mensajes'); if (!ul) return;
    let li = ul.querySelector('li.gc-escribiendo');
    clearTimeout(escribeT);
    if (!que || ACTUAL !== c.id) { if (li) li.remove(); return; }
    const abajo = ul.scrollHeight - ul.scrollTop - ul.clientHeight < 80;
    if (!li || li.dataset.que !== que) {
      if (!li) { li = document.createElement('li'); li.className = 'gc-escribiendo'; }
      li.dataset.que = que; li.textContent = '';
      const bur = document.createElement('div'); bur.className = 'gc-burbuja gc-suya'; bur.setAttribute('role', 'status');
      if (que === 'audio') { bur.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>'; const s = document.createElement('small'); s.textContent = T('Grabando audio…'); bur.append(s); }
      else { const p = document.createElement('span'); p.className = 'gc-puntos'; p.setAttribute('aria-hidden', 'true'); p.innerHTML = '<i></i><i></i><i></i>'; bur.setAttribute('aria-label', T('Escribiendo…')); bur.append(p); }
      li.append(bur);
    }
    if (li.parentNode !== ul || li !== ul.lastElementChild) ul.append(li);
    if (abajo) ul.scrollTop = ul.scrollHeight;
    escribeT = setTimeout(() => { const x = ul.querySelector('li.gc-escribiendo'); if (x) x.remove(); }, 6000);
  }

  // ---------- eventos ----------
  function eventos() {
    // la lista de conversaciones y la navegación entre ellas (agencia, ronda 74, bloque J)
    $('#lista-filas').addEventListener('click', (e) => { const b = e.target.closest('.fila-conv'); if (b && b.dataset.id) abreConv(b.dataset.id); });
    $('#lista-nueva').addEventListener('click', nuevaConversacion);
    const verLista = () => { paraEscribe(); guardaBorrador(); document.body.classList.add('ver-lista'); pintaLista(); };
    $('#cvolver').addEventListener('click', () => { if (esMovil()) { alInicio(); return; } verLista(); });
    // el inicio con los contactos: la fila abre el chat; los botones llaman o videollaman
    $('#contactos-filas').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-id]'); if (!b) return;
      const c = CONVS.get(b.dataset.id); if (!c) return;
      if (b.dataset.acto) llamaContacto(c, b.dataset.acto === 'video'); else abreConv(c.id);
    });
    $('#volver-lista').addEventListener('click', () => { if (vivas().length) { quiereNueva = false; if (matchMedia('(max-width: 760px)').matches) verLista(); else pintaLista(); } });
    $('#aviso').addEventListener('click', () => { if (avisoConvId && CONVS.has(avisoConvId)) { const id = avisoConvId; $('#aviso').hidden = true; abreConv(id); } });
    // el nombre de la conversación: un alias que solo se ve aquí
    // (la misma hoja sirve para «Guardar contacto», 17:33: con el nombre que quiera cada uno)
    let paraContacto = false;
    const textosHoja = (contacto) => {
      paraContacto = contacto;
      $('#h-nombre-t').textContent = contacto ? T('Guardar contacto') : T('Nombre de la conversación');
      const p = document.querySelector('#h-nombre .t'); if (p) p.textContent = contacto ? T('Ponle el nombre que quieras. Solo lo ves tú: no se envía a la otra persona ni al servidor.') : T('Solo lo ves tú, en este navegador: no se envía a la otra persona ni al servidor.');
    };
    const hojaNombre = () => { const c = CONVS.get(ACTUAL); if (!c) return; textosHoja(false); const x = $('#nombre-conv'); x.value = c.alias || ''; x.placeholder = nombreConv(c, true); abreHoja('h-nombre'); setTimeout(() => { try { x.focus(); x.select(); } catch (_) {} }, 60); };
    const hojaContacto = () => { const c = CONVS.get(ACTUAL); if (!c) return; textosHoja(true); const x = $('#nombre-conv'); x.value = c.alias || ''; x.placeholder = T('Por ejemplo: Mi mujer'); abreHoja('h-nombre'); setTimeout(() => { try { x.focus(); } catch (_) {} }, 60); };
    const guardaAlias = async () => {
      const c = CONVS.get(ACTUAL); if (!c) return;
      c.alias = String($('#nombre-conv').value || '').trim().slice(0, 40);
      if (paraContacto) { c.contacto = true; c.sinContacto = false; if (!c.alias) c.alias = nombreConv(c, true); }
      await guardaConv(c); cierraHoja('h-nombre'); pintaCabecera(c); pintaLista();
      if (paraContacto) aviso(esMovil() ? T('Contacto guardado: lo tienes en el inicio para llamar o escribir sin enlace.') : T('Contacto guardado.'));
    };
    $('#cm-contacto').addEventListener('click', () => { $('#cmenu').hidden = true; $('#cmas').setAttribute('aria-expanded', 'false'); hojaContacto(); });
    $('#ccontacto-si').addEventListener('click', hojaContacto);
    $('#ccontacto-no').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (!c) return; c.sinContacto = true; await guardaConv(c); pintaCabecera(c); });
    $('#cm-nombre').addEventListener('click', () => { $('#cmenu').hidden = true; $('#cmas').setAttribute('aria-expanded', 'false'); hojaNombre(); });
    $('#nombre-guardar').addEventListener('click', guardaAlias);
    $('#nombre-cancelar').addEventListener('click', () => cierraHoja('h-nombre'));
    $('#nombre-conv').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); guardaAlias(); } if (e.key === 'Escape') cierraHoja('h-nombre'); });
    // menú «⋯» de la cabecera en el móvil (agencia, ronda 74): seguridad, modo discreto, avisos y terminar
    const menu = $('#cmenu'), mas = $('#cmas');
    const cierraMenu = () => { if (menu.hidden) return; menu.hidden = true; mas.setAttribute('aria-expanded', 'false'); };
    const pideAvisos = async () => { try { const r = await Notification.requestPermission(); if (r === 'granted') aviso(T('Listo: te avisaremos aunque GUARDIANA esté minimizada.')); } catch (_) {} pintaAvisos(CONVS.get(ACTUAL)); };
    mas.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!menu.hidden) return cierraMenu();
      $('#cm-discreto').setAttribute('aria-checked', String($('#discreto').getAttribute('aria-pressed') === 'true'));
      $('#cm-avisos').hidden = permisoAvisos() !== 'default';
      menu.hidden = false; mas.setAttribute('aria-expanded', 'true');
      const p = menu.querySelector('button:not([hidden])'); if (p) p.focus({ preventScroll: true });
    });
    let dentroMenu = false; // el clic que el menú reenvía a «Modo discreto» no lo cierra: se ve el interruptor cambiar
    document.addEventListener('click', (e) => { if (!dentroMenu && !menu.hidden && !menu.contains(e.target) && !mas.contains(e.target)) cierraMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { cierraMenu(); mas.focus(); } });
    $('#cm-seguridad').addEventListener('click', () => { cierraMenu(); $('#escudo').click(); });
    $('#cm-discreto').addEventListener('click', () => { dentroMenu = true; try { $('#discreto').click(); } finally { dentroMenu = false; } $('#cm-discreto').setAttribute('aria-checked', String($('#discreto').getAttribute('aria-pressed') === 'true')); });
    $('#cm-avisos').addEventListener('click', () => { cierraMenu(); pideAvisos(); });
    $('#cm-terminar').addEventListener('click', () => { cierraMenu(); $('#terminar').click(); });
    $('#cm-completa').hidden = !esMovil() || comoApp();
    $('#cm-completa').addEventListener('click', () => { cierraMenu(); if (puedeCompleta()) pantallaCompleta(); else abreGuia(); });
    $('#completa-ok').addEventListener('click', () => cierraHoja('h-completa'));
    // «Añadir a la pantalla de inicio»: en Android, la ventana del propio sistema; en el iPhone, los pasos (no deja hacerlo desde la web)
    let avisoInstalar = null;
    // La guía con los mismos botones que verá cada persona (dueño, 28 Oct 2026, 17:02): qué teléfono, qué navegador y qué
    // versión. En Safari manda su «Version/»; en Chrome y los demás del iPhone, iOS 26 se reconoce por lo que estrenó su
    // motor (el anclaje de CSS), porque el número del sistema puede venir congelado.
    const UA = navigator.userAgent;
    const esIPad = /iPad/.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1);
    const esIOS = /iPhone|iPod/.test(UA) || esIPad;
    const esAndroid = /Android/i.test(UA);
    const ios26 = () => { const v = UA.match(/Version\/(\d+)/), o = UA.match(/OS (\d+)_\d/); if (v) return +v[1] >= 26; if (o && +o[1] >= 26) return true; try { return CSS.supports('anchor-name', '--g'); } catch (_) { return false; } };
    const dentroDeApp = () => /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|TikTok|musical_ly|BytedanceWebview|Snapchat|Pinterest|Twitter|Line\//i.test(UA) || (esAndroid && /; wv\)/.test(UA));
    const plataformaGuia = () => {
      if (esIOS) {
        if (dentroDeApp()) return 'app';
        const n = ios26();
        if (/CriOS/.test(UA)) return n ? 'crios26' : 'crios';
        if (/FxiOS|EdgiOS|OPiOS|OPT\/|DuckDuckGo|Brave|GSA\/|YaBrowser/.test(UA)) return n ? 'otro26' : 'otro';
        return n ? 'ios26' : esIPad ? 'ipad' : 'ios';
      }
      if (esAndroid) { if (avisoInstalar) return 'android'; if (dentroDeApp()) return 'appand'; return /SamsungBrowser|Firefox|EdgA|OPR|YaBrowser|UCBrowser|MiuiBrowser|HuaweiBrowser|DuckDuckGo/.test(UA) ? 'androidotro' : 'androidmenu'; }
      return avisoInstalar ? 'pc' : 'pcno';
    };
    function pintaGuia() {
      const h = $('#h-completa'); if (!h) return;
      const p = plataformaGuia(); h.dataset.plat = p; h.classList.toggle('es-ipad', esIPad);
      h.querySelectorAll('[data-p]').forEach((el) => el.toggleAttribute('hidden', !el.dataset.p.split(' ').includes(p)));
      const vis = [...h.querySelectorAll('.guia-pasos > li')].filter((li) => !li.hidden);
      vis.forEach((li, i) => li.classList.toggle('fin', i === vis.length - 1));
      // en España los teléfonos dicen «Añadir»; en Latinoamérica, «Agregar» (en inglés y portugués lo pone idioma.js)
      const espana = (!window.GuardianaIdioma || window.GuardianaIdioma.lang === 'es') && /^es-es\b/i.test(navigator.language || '');
      if (espana) h.querySelectorAll('[data-es-es]').forEach((el) => { if (el.textContent !== el.dataset.esEs) el.textContent = el.dataset.esEs; });
      $('#completa-ok').classList.toggle('principal', p !== 'android' && p !== 'pc');
    }
    function abreGuia() { pintaGuia(); abreHoja('h-completa'); }
    const instala = async () => { const e = avisoInstalar; if (!e) { abreGuia(); return; } avisoInstalar = null; try { e.prompt(); await e.userChoice; } catch (_) {} cierraHoja('h-completa'); pintaAnadir(); };
    // también en el ordenador: Chrome y Edge la ponen en el escritorio y en las aplicaciones (dueño, 16:20)
    const pintaAnadir = () => { const b = $('#anadir-app'); if (b) b.hidden = comoApp() || !(avisoInstalar || esIOS || esAndroid); };
    const guiaAbierta = () => { const h = $('#h-completa'); return !!h && h.classList.contains('gc-abierta'); };
    addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); avisoInstalar = e; pintaAnadir(); if (guiaAbierta()) pintaGuia(); });
    addEventListener('appinstalled', () => { avisoInstalar = null; pintaAnadir(); if (guiaAbierta()) cierraHoja('h-completa'); });
    // en Android, un toque: la ventana del sistema; si todavía no la da (o en el iPhone), la guía
    $('#anadir-app').addEventListener('click', () => { if (avisoInstalar) instala(); else abreGuia(); });
    $('#guia-instalar').addEventListener('click', instala);
    // tocar el dibujo del aviso también lo abre (quien lo toca quiere instalar)
    { const d = document.querySelector('#h-completa .ui-dlg'); if (d) d.addEventListener('click', () => { if (avisoInstalar) instala(); }); }
    pintaAnadir();
    // enlace para mandar: guardianagroup.com/orbita/comunicaciones/?instalar abre directamente la guía
    if (new URLSearchParams(location.search).has('instalar') && !comoApp()) setTimeout(abreGuia, 600);
    // en Android, la pantalla completa entra sola con el primer toque importante: crear, aceptar, llamar o contestar
    for (const id of ['#nueva-blindada', '#aceptar-si', '#llamar', '#videollamar', '#ll-contestar']) { const b = $(id); if (b) b.addEventListener('click', () => { if (esMovil() && puedeCompleta()) pantallaCompleta(); }, { capture: true }); }
    // tocar el nombre o el candado abre la seguridad de la conversación, como en las aplicaciones de mensajería
    for (const el of [document.querySelector('.conv .gc-quien'), document.querySelector('.conv .gc-avatar')]) if (el) el.addEventListener('click', () => $('#escudo').click());
    $('#cavisos-si').addEventListener('click', pideAvisos);
    for (const [id, k] of [['#pref-leido', 'leido'], ['#pref-escribe', 'escribe']]) {
      const x = $(id); if (!x) continue;
      x.checked = pref(k);
      x.addEventListener('change', () => { try { localStorage.setItem('gcom-' + k, x.checked ? '1' : '0'); } catch (_) {} const c = CONVS.get(ACTUAL); if (k === 'escribe' && !x.checked && c) muestraEscribe(c, ''); });
    }
    $('#cavisos-no').addEventListener('click', () => { try { localStorage.setItem('gcom-avisos', 'no'); } catch (_) {} pintaAvisos(CONVS.get(ACTUAL)); });
    // «leído» al desplazarse hasta el mensaje y al pasar la llamada a pequeño o terminarla
    let leidoT = null; $('#mensajes').addEventListener('scroll', () => { clearTimeout(leidoT); leidoT = setTimeout(() => { const c = CONVS.get(ACTUAL); if (c) marcaLeidos(c); }, 250); }, { passive: true });
    try { new MutationObserver(() => { const c = CONVS.get(ACTUAL); if (c) setTimeout(() => marcaLeidos(c), 80); }).observe($('#llamada'), { attributes: true, attributeFilter: ['class'] }); } catch (_) {}
    // al girar el teléfono o cambiar el tamaño, la cabecera elige su versión corta o larga
    try { matchMedia('(max-width: 760px)').addEventListener('change', () => { const c = CONVS.get(ACTUAL); if (c) pintaCabecera(c); }); } catch (_) {}
    $('#nueva').addEventListener('click', creaInvitacion);
    // «Crear invitación» al final del bloque para profesionales: sube al principio y hace lo mismo que el botón grande.
    const proEmpezar = $('#pro-empezar');
    // en el móvil, la misma invitación que el botón de arriba (con el enlace y el menú de compartir), nunca la del código de 9 cifras
    // (dueño, 28 Oct 2026, 19:10: «abajo del todo sale compartir enlace y aparecen números… tienes que quitarlo»)
    if (proEmpezar) proEmpezar.addEventListener('click', () => { const ini = $('#inicio'); if (ini) ini.scrollTo({ top: 0, behavior: 'smooth' }); (esMovil() ? $('#nueva-blindada') : $('#nueva')).click(); });
    // ronda 55: la persona acepta, a sabiendas, una sesión sin protección postcuántica (la otra persona tiene una versión anterior)
    const pqSi = $('#cpq-si');
    if (pqSi) pqSi.addEventListener('click', () => {
      const c = CONVS.get(ACTUAL); if (!c || !c.clasicaPendiente) return; const p = c.clasicaPendiente;
      // en una conversación que nunca tuvo la capa postcuántica, el permiso queda para esa conversación
      if (!c.pqVisto) { c.clasicaAceptada = true; guardaConv(c); vigila(c, T('Has aceptado seguir sin protección postcuántica en esta conversación.'), 'info'); }
      else vigila(c, T('Has aceptado seguir sin protección postcuántica en esta sesión.'), 'info');
      enCola(c, () => derivaSesion(c, p.suEf, p.efMia, null, true));
    });
    // dueño, 10:53: «todas las páginas tienen que tener un botón de volver a donde estás»: a NÚCLEO si se vino desde NÚCLEO,
    // si no, al inicio (la portada). Dueño, 28 Oct 2026, 13:35: «Regresar a NÚCLEO» era demasiado grande: «Atrás», como en las
    // demás webs (el lector de pantalla sigue diciendo adónde lleva)
    try { const v = sessionStorage.getItem('guardiana-vuelta') === 'nucleo', a = $('#volver'); if (a) { a.href = v ? '/orbita/?nucleo=pide' : '/orbita/'; const sp = a.querySelector('span'); if (sp) sp.textContent = v ? T('Atrás') : T('Inicio'); a.setAttribute('aria-label', v ? T('Volver a NÚCLEO') : T('Volver al inicio')); } } catch (_) {}
    // dueño, 10:20: arriba, la red neuronal de NÚCLEO (la misma firma que la portada)
    try { const l = $('.inicio .red-nucleo'); if (l && window.RedNucleo) window.RedNucleo(l, { nace: false }); } catch (_) {}
    // dueño, 10:10: la explicación, en un desplegable bajo los dos botones
    const como = $('#como-btn');
    if (como) como.addEventListener('click', () => { const pro = $('#pro'); if (!pro) return; const abre = pro.hidden; pro.hidden = !abre; como.setAttribute('aria-expanded', String(abre)); if (abre) setTimeout(() => pro.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); });
    $('#unir').addEventListener('click', () => { $('#unir-mal').hidden = true; $('#unir-espera').hidden = true; $('#unir-codigo').value = ''; $('#paso-inicio').hidden = true; $('#paso-entrar').hidden = false; setTimeout(() => $('#unir-codigo').focus(), 50); });
    $('#unir-cerrar').addEventListener('click', () => { $('#paso-entrar').hidden = true; $('#paso-inicio').hidden = false; });
    // Campo del código: solo cifras, nueve como mucho (lo que pase de nueve no entra), guiones automáticos y sin selección azul
    const campoCod = $('#unir-codigo');
    campoCod.addEventListener('beforeinput', (e) => {
      if (!e.inputType || !e.inputType.startsWith('insert')) return;
      const nuevas = String(e.data || '').replace(/\D/g, '');
      const sel = campoCod.selectionEnd - campoCod.selectionStart;
      const ya = campoCod.value.replace(/\D/g, '').length - (sel > 0 ? campoCod.value.slice(campoCod.selectionStart, campoCod.selectionEnd).replace(/\D/g, '').length : 0);
      if (campoCod.readOnly || (e.inputType !== 'insertFromPaste' && (!nuevas || ya >= 9))) e.preventDefault();
    });
    campoCod.addEventListener('input', (e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 9); e.target.value = d.replace(/(\d{3})(?=\d)/g, '$1-'); try { e.target.setSelectionRange(e.target.value.length, e.target.value.length); } catch (_) {} $('#unir-mal').hidden = true; if (d.length === 9) $('#unir-ok').click(); });
    $('#unir-ok').addEventListener('click', async () => {
      const b = $('#unir-ok'); if (b.disabled) return; b.disabled = true; campoCod.readOnly = true; $('#unir-mal').hidden = true; $('#unir-espera').hidden = false;
      const r = await aceptaCodigo($('#unir-codigo').value);
      b.disabled = false; campoCod.readOnly = false; $('#unir-espera').hidden = true;
      if (r === 'ok') { $('#paso-entrar').hidden = true; $('#paso-inicio').hidden = false; return; }
      $('#unir-mal').textContent = r === 'demasiados intentos' ? T('Demasiados intentos: espera un minuto.') : r === 'sin relé' || r === 'sin respuesta' ? T('Sin conexión con el relé: espera un momento.') : T('Código erróneo o caducado.');
      $('#unir-mal').hidden = false; campoCod.focus(); try { campoCod.setSelectionRange(campoCod.value.length, campoCod.value.length); } catch (_) {}
    });
    $('#unir-codigo').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#unir-ok').click(); });
    // 28 Oct 2026: «Terminar» abre siempre la hoja de la página (la de la sesión blindada). La ventana confirm() del
    // navegador no sale en algunos navegadores integrados (el de la app de Claude, vistas web de otras apps) y el botón no hacía nada.
    $('#terminar').addEventListener('click', () => { const c = CONVS.get(ACTUAL); if (c) muestraCierre(c); });
    $('#invita-nuevo').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (c) { c.codigoUsado = false; await publicaCodigo(c); } });
    R.on('codigo-usado', (codigo) => { for (const c of CONVS.values()) if (c.codigo === codigo) { c.codigoUsado = true; pintaCodigo(c); } });
    R.on('abierto', () => { for (const c of CONVS.values()) if (c.estado === 'invitacion' && c.rol === 'invita' && !c.huella && (!c.codigo || Date.now() > c.codigoCaduca)) publicaCodigo(c); });
    $('#escudo').addEventListener('click', () => { const c = CONVS.get(ACTUAL); if (c) muestraEscudo(c); });
    $('#escudo-cerrar').addEventListener('click', () => cierraHoja('h-escudo'));
    $('#verificada').addEventListener('change', async (e) => { const c = CONVS.get(ACTUAL); if (!c) return; await marcaVerificada(c, e.target.checked); muestraEscudo(c); });
    $('#destruir').addEventListener('click', async (e) => { const c = CONVS.get(ACTUAL); if (!c) return; if ($('#destruir-nota').hidden) { $('#destruir-nota').hidden = false; e.currentTarget.textContent = T('Sí, destruir'); return; } cierraHoja('h-escudo'); e.currentTarget.textContent = T('Destruir conversación'); await destruye(c); });
    const ta = $('#texto');
    const ajusta = () => { ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px'; document.querySelector('.gc-compositor').classList.toggle('con-texto', !!ta.value.trim()); };
    ta.addEventListener('input', ajusta);
    // «escribiendo…» (dueño, 28 Oct 2026, 13:29: «que salgan los puntitos esos como que se está escribiendo»): mientras se escribe
    // o se graba una nota de voz, un aviso como mucho cada 3 s, dentro del canal encriptado; al borrar el texto o al enviar, se
    // retira. En la sesión blindada, solo con la verificación mutua hecha, como el resto del contenido.
    let escribeParaT = null;
    ta.addEventListener('input', () => { if (grab) return; clearTimeout(escribeParaT); const hay = !!ta.value.trim(); avisaEscribe(hay ? 'texto' : 'no'); if (hay) escribeParaT = setTimeout(() => { if (!grab) avisaEscribe('no'); }, 3500); });
    // mientras se graba una nota de voz, «Enviar» la termina y la envía, igual que el botón del micrófono (dueño, 28 Oct 2026:
    // «después de grabar, el botón de enviar no me dejaba»)
    const envia = async () => { if (grab) { paraGrabacion(true); return; } const c = CONVS.get(ACTUAL); const t = ta.value.replace(/\s+$/, ''); if (!c || !t) return; ta.value = ''; ajusta(); ta.dispatchEvent(new Event('input')); await enviaTexto(c, t); ta.focus(); };
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); envia(); } });
    $('#enviar').addEventListener('click', envia);
    // el clip abre el menú; cada opción, su selector
    const menuAdj = $('#adjuntos');
    const cierraAdj = () => { menuAdj.hidden = true; $('#adjuntar').setAttribute('aria-expanded', 'false'); };
    $('#adjuntar').setAttribute('aria-haspopup', 'menu');
    $('#adjuntar').addEventListener('click', (e) => {
      e.stopPropagation(); if (!menuAdj.hidden) { cierraAdj(); return; }
      $('#adj-camara').hidden = !esMovil();
      // en el teléfono, como WhatsApp: se cierra el teclado y el menú sale abajo, como una hoja (app.css)
      if (esMovil() && document.activeElement && document.activeElement.id === 'texto') { try { document.activeElement.blur(); } catch (_) {} }
      menuAdj.hidden = false; $('#adjuntar').setAttribute('aria-expanded', 'true');
      const r = $('#adjuntar').getBoundingClientRect(); menuAdj.style.left = Math.max(8, Math.min(r.left, innerWidth - menuAdj.offsetWidth - 8)) + 'px'; menuAdj.style.bottom = Math.max(8, innerHeight - r.top + 8) + 'px';
    });
    document.addEventListener('click', (e) => { if (!menuAdj.hidden && !e.target.closest('#adjuntos')) cierraAdj(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menuAdj.hidden) cierraAdj(); });
    $('#adj-doc').addEventListener('click', () => { cierraAdj(); $('#archivo').click(); });
    $('#adj-foto').addEventListener('click', () => { cierraAdj(); $('#archivo-foto').click(); });
    $('#adj-camara').addEventListener('click', () => { cierraAdj(); $('#archivo-camara').click(); });
    for (const id of ['#archivo-foto', '#archivo-camara']) $(id).addEventListener('change', async (e) => { const c = CONVS.get(ACTUAL); const fs = [...e.target.files]; e.target.value = ''; if (!c || !fs.length) return; const limpios = []; for (const f of fs) limpios.push(await sinDatosOcultos(f)); revisaEnvio(c, limpios); });
    $('#adj-ubicacion').addEventListener('click', () => { cierraAdj(); abreHoja('h-ubicacion'); });
    $('#ubi-no').addEventListener('click', () => cierraHoja('h-ubicacion'));
    for (const [id, aprox] of [['#ubi-exacta', false], ['#ubi-aprox', true]]) $(id).addEventListener('click', () => { cierraHoja('h-ubicacion'); mandaUbicacion(aprox); });
    // Modo discreto: un interruptor (recordado en este equipo) que activa el velo del chat y los números al escribir.
    // 28 Oct 2026 (dueño): de entrada, el modo normal; el discreto solo si la persona lo elige. Clave nueva, para que nadie
    // se quede en discreto por el valor que la versión anterior guardaba sola al abrir la página.
    const conv = $('#conv'), mascara = $('#texto-mascara');
    let discreto = false; try { discreto = localStorage.getItem('gcom-discreto2') === '1'; localStorage.removeItem('gcom-discreto'); } catch (_) {}
    let cifras = [];
    const pintaMascara = () => {
      if (!discreto) { mascara.textContent = ''; return; }
      const v = ta.value; const n = [...v].length;
      if (cifras.length > n) cifras.length = n;
      while (cifras.length < n) { const b = C.azar(1)[0]; cifras.push(String(b % 10)); }
      let i = 0; mascara.textContent = [...v].map((ch) => { const d = cifras[i++]; return ch === '\n' || ch === ' ' ? ch : d; }).join('') + (v.endsWith('\n') ? ' ' : '');
      mascara.scrollTop = ta.scrollTop;
    };
    const ponDiscreto = (on, elegido) => {
      discreto = !!on; if (elegido) { try { localStorage.setItem('gcom-discreto2', discreto ? '1' : '0'); } catch (_) {} }
      conv.classList.toggle('discreta', discreto); $('#discreto').setAttribute('aria-pressed', String(discreto));
      $('#discreto').title = discreto ? T('Modo discreto: el chat se ve borroso hasta que lo mantienes pulsado y lo que escribes se ve como números. Púlsalo para verlo todo normal.') : T('Modo discreto: el chat se ve borroso hasta que lo mantienes pulsado y lo que escribes se ve como números. Púlsalo para activarlo.');
      ta.placeholder = discreto ? T('Modo discreto: lo que escribas se verá como números') : T('Escribe un mensaje');
      lienzo.classList.toggle('velado', discreto); pintaMascara();
    };
    $('#discreto').addEventListener('click', () => ponDiscreto(!discreto, true));
    ta.addEventListener('input', pintaMascara); ta.addEventListener('scroll', () => { mascara.scrollTop = ta.scrollTop; });
    // Velo: se descubre solo mientras se mantiene pulsado (ratón o dedo) sobre los mensajes o sobre la pista
    const lienzo = $('#lienzo');
    const descubre = (e) => { if (e.type === 'pointerdown' && e.button != null && e.button !== 0) return; lienzo.classList.remove('velado'); };
    // al soltar, un segundo de margen para poder pulsar un botón dentro del chat (Guardar, reproducir)
    let veloT = null; const cubre = () => { clearTimeout(veloT); if (!discreto) return; veloT = setTimeout(() => { if (discreto) lienzo.classList.add('velado'); }, 1200); };
    const descubreYa = (e) => { clearTimeout(veloT); descubre(e); };
    for (const el of [lienzo, $('#velo-pista')]) { el.addEventListener('pointerdown', descubreYa); el.addEventListener('contextmenu', (e) => e.preventDefault()); }
    addEventListener('pointerup', cubre); addEventListener('pointercancel', cubre); addEventListener('blur', cubre); document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') cubre(); });
    $('#velo-pista').addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); descubre(e); } });
    $('#velo-pista').addEventListener('keyup', cubre);
    ponDiscreto(discreto);
    // Notas de voz (dueño, 26 Oct 20:05): se graban aquí, se cifran y viajan como un archivo más; con la voz tal cual.
    let grab = null;
    const compositor = document.querySelector('.gc-compositor');
    const paraGrabacion = (enviar) => {
      if (!grab) return; const g = grab; grab = null; clearInterval(g.reloj);
      g.enviar = enviar; try { g.rec.stop(); } catch (_) {} setTimeout(() => g.stream.getTracks().forEach((x) => x.stop()), 300);
      compositor.classList.remove('grabando-ya'); $('#grabando').hidden = true; $('#grabar').setAttribute('aria-pressed', 'false');
      avisaEscribe(ta.value.trim() ? 'texto' : 'no');
    };
    $('#grabar').addEventListener('click', async () => {
      const c = CONVS.get(ACTUAL); if (!c) return;
      if (grab) return paraGrabacion(true);
      if (!navigator.mediaDevices || !window.MediaRecorder) return aviso(T('Este navegador no puede grabar audio.'));
      let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch (_) { return aviso(T('Sin permiso para el micrófono.')); }
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((m) => MediaRecorder.isTypeSupported(m)) || '';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 64000 } : undefined);
      const trozos = []; const t0 = Date.now();
      rec.ondataavailable = (e) => { if (e.data && e.data.size) trozos.push(e.data); };
      rec.onstop = () => { const g = este; if (!g.enviar || !trozos.length) return; const tipo = rec.mimeType || mime || 'audio/webm'; const ext = /mp4/.test(tipo) ? 'm4a' : /ogg/.test(tipo) ? 'ogg' : 'webm'; const dur = Math.round((Date.now() - t0) / 1000); const f = new File(trozos, T('Nota de voz') + ' ' + new Date().toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' }).replace(':', '.') + ' (' + Math.floor(dur / 60) + ':' + String(dur % 60).padStart(2, '0') + ').' + ext, { type: tipo }); const cc = CONVS.get(ACTUAL) || c; if (cc) enviaArchivos(cc, [f], { voz: true }); };
      const este = { rec, stream, enviar: false, reloj: null };
      grab = este; rec.start(250);
      compositor.classList.add('grabando-ya'); $('#grabando').hidden = false; $('#grabar').setAttribute('aria-pressed', 'true');
      este.reloj = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('#grabando-t').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); avisaEscribe('audio'); if (s >= 600) paraGrabacion(true); }, 250);
      avisaEscribe('audio');
    });
    $('#grabar-cancelar').addEventListener('click', () => paraGrabacion(false));
    // Revisar antes de enviar (dueño, 28 Oct 2026: «la quiero ver en pantalla y darle yo al OK»): lo que se elige, se pega o
    // se suelta ya no sale solo. Primero se ve aquí (la imagen, o el nombre y el tamaño) y se envía al pulsar «Enviar».
    // Las notas de voz no pasan por aquí: ya se envían con su propio botón.
    let porEnviar = null; // { conv, fs, urls }
    const sueltaEnvio = () => { if (porEnviar) porEnviar.urls.forEach((u) => URL.revokeObjectURL(u)); porEnviar = null; $('#envio-lista').textContent = ''; };
    const revisaEnvio = (c, fs) => {
      fs = fs.filter((f) => f && f.size);
      if (!c || !fs.length) return;
      sueltaEnvio();
      const urls = [], lista = $('#envio-lista');
      for (const f of fs) {
        const li = document.createElement('li');
        if (/^image\//.test(f.type) && f.size <= 50 * 1024 * 1024) {
          const u = URL.createObjectURL(f); urls.push(u);
          const img = document.createElement('img'); img.alt = ''; img.decoding = 'async'; img.src = u;
          img.addEventListener('error', () => { img.remove(); li.classList.remove('foto'); });
          // en modo discreto, la imagen sale borrosa y se ve mientras se mantiene pulsada
          img.addEventListener('pointerdown', () => img.classList.add('ver'));
          for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) img.addEventListener(ev, () => img.classList.remove('ver'));
          img.addEventListener('contextmenu', (e) => e.preventDefault());
          li.classList.add('foto'); li.append(img);
          { const i = fs.indexOf(f), bt = document.createElement('button'); bt.type = 'button'; bt.className = 'tapar-b'; bt.textContent = T('Tapar'); bt.title = T('Tapar partes de la foto'); bt.addEventListener('click', (e) => { e.stopPropagation(); abreTapar(i, img); }); li.append(bt); }
        } else {
          const ico = document.createElement('span'); ico.className = 'ico'; ico.setAttribute('aria-hidden', 'true');
          const ext = /\.([A-Za-z0-9]{1,5})$/.exec(f.name || ''); ico.textContent = ext ? ext[1].toUpperCase() : '•';
          li.append(ico);
        }
        const txt = document.createElement('div'), b = document.createElement('b'), s = document.createElement('small');
        b.textContent = f.name || T('archivo'); s.textContent = tamano(f.size); txt.append(b, s); li.append(txt);
        lista.append(li);
      }
      porEnviar = { conv: c.id, fs, urls };
      if (VJ() && VJ().abierto()) VJ().cierra(); // la hoja del viaje quedaría encima y taparía «Enviar»
      $('#h-envio').classList.toggle('discreta', discreto);
      abreHoja('h-envio');
      setTimeout(() => { try { $('#envio-si').focus(); } catch (_) {} }, 60);
    };
    $('#envio-si').addEventListener('click', () => {
      const p = porEnviar; cierraHoja('h-envio'); if (!p) return;
      const fs = p.fs; sueltaEnvio();
      const c = CONVS.get(p.conv); if (c && c.id === ACTUAL) enviaArchivos(c, fs);
    });
    $('#envio-no').addEventListener('click', () => { cierraHoja('h-envio'); sueltaEnvio(); });
    // «Tapar»: un mosaico de bloques grandes donde pasa el dedo (no se puede deshacer en la foto que se envía)
    let taparIdx = -1, taparImg = null, taparOrig = null, taparMos = null, dibuja = null;
    async function abreTapar(i, img) {
      const f = porEnviar && porEnviar.fs[i]; if (!f) return;
      let bmp; try { bmp = await createImageBitmap(f, { imageOrientation: 'from-image' }); } catch (_) { aviso(T('Esta foto no se puede editar aquí.')); return; }
      const k = Math.min(1, 2560 / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
      const cv = $('#tapar-cv'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(bmp, 0, 0, w, h);
      taparOrig = document.createElement('canvas'); taparOrig.width = w; taparOrig.height = h; taparOrig.getContext('2d').drawImage(bmp, 0, 0, w, h);
      const b = Math.max(14, Math.round(Math.max(w, h) / 36)), peq = document.createElement('canvas'); peq.width = Math.max(1, Math.round(w / b)); peq.height = Math.max(1, Math.round(h / b)); peq.getContext('2d').drawImage(bmp, 0, 0, peq.width, peq.height);
      taparMos = document.createElement('canvas'); taparMos.width = w; taparMos.height = h; const m = taparMos.getContext('2d'); m.imageSmoothingEnabled = false; m.drawImage(peq, 0, 0, w, h);
      if (bmp.close) bmp.close();
      taparIdx = i; taparImg = img; $('#tapar').hidden = false;
    }
    const cierraTapar = () => { $('#tapar').hidden = true; taparIdx = -1; taparOrig = null; taparMos = null; dibuja = null; };
    const puntoTapar = (e) => { const cv = $('#tapar-cv'), r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; };
    const tapaEn = (p) => { const cv = $('#tapar-cv'), R = Math.max(22, Math.round(Math.max(cv.width, cv.height) / 16)), ctx = cv.getContext('2d'); ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(taparMos, 0, 0); ctx.restore(); return R; };
    $('#tapar-cv').addEventListener('pointerdown', (e) => { if (!taparMos) return; e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {} const p = puntoTapar(e); tapaEn(p); dibuja = p; });
    $('#tapar-cv').addEventListener('pointermove', (e) => { if (!dibuja || !taparMos) return; const p = puntoTapar(e), d = Math.hypot(p.x - dibuja.x, p.y - dibuja.y), R = tapaEn(p), n = Math.ceil(d / (R / 2)); for (let j = 1; j < n; j++) tapaEn({ x: dibuja.x + (p.x - dibuja.x) * j / n, y: dibuja.y + (p.y - dibuja.y) * j / n }); dibuja = p; });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) $('#tapar-cv').addEventListener(ev, () => { dibuja = null; });
    $('#tapar-otra').addEventListener('click', () => { if (taparOrig) $('#tapar-cv').getContext('2d').drawImage(taparOrig, 0, 0); });
    $('#tapar-no').addEventListener('click', cierraTapar);
    $('#tapar-si').addEventListener('click', async () => {
      const i = taparIdx, img = taparImg; if (i < 0 || !porEnviar) { cierraTapar(); return; }
      const blob = await new Promise((r) => $('#tapar-cv').toBlob(r, 'image/jpeg', 0.92)); if (!blob) { cierraTapar(); return; }
      const viejo = porEnviar.fs[i], base = String((viejo && viejo.name) || 'foto').replace(/\.[a-z0-9]{2,5}$/i, '') || 'foto';
      porEnviar.fs[i] = new File([blob], base + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });
      if (img) { const u = URL.createObjectURL(porEnviar.fs[i]); porEnviar.urls.push(u); img.src = u; const s = img.parentElement && img.parentElement.querySelector('small'); if (s) s.textContent = tamano(blob.size) + ' · ' + T('tapada'); }
      cierraTapar();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#tapar').hidden) { e.stopImmediatePropagation(); cierraTapar(); } }, true);
    $('#h-envio').addEventListener('click', (e) => { if (e.target === e.currentTarget) sueltaEnvio(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && porEnviar) { cierraHoja('h-envio'); sueltaEnvio(); } });
    ta.addEventListener('paste', (e) => { const fs = [...((e.clipboardData && e.clipboardData.files) || [])]; const c = CONVS.get(ACTUAL); if (c && fs.length) { e.preventDefault(); revisaEnvio(c, fs.map((f, i) => (f.name && f.name !== 'image.png') ? f : new File([f], 'imagen-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + (i ? '-' + i : '') + '.' + ((f.type || '').split('/')[1] || 'png'), { type: f.type }))); } });
    $('#archivo').addEventListener('change', async (e) => { const c = CONVS.get(ACTUAL); const fs = [...e.target.files]; e.target.value = ''; if (c && fs.length) revisaEnvio(c, fs); });
    const zona = $('#conv');
    zona.addEventListener('dragover', (e) => { e.preventDefault(); });
    zona.addEventListener('drop', (e) => { e.preventDefault(); const c = CONVS.get(ACTUAL); const fs = [...(e.dataTransfer && e.dataTransfer.files) || []]; if (c && fs.length) revisaEnvio(c, fs); });
    document.querySelectorAll('.gc-hoja').forEach((h) => h.addEventListener('click', (e) => { if (e.target === h) h.classList.remove('gc-abierta'); }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.gc-hoja.gc-abierta').forEach((h) => h.classList.remove('gc-abierta')); });
    addEventListener('hashchange', () => { if (/#[ib]=/.test(location.hash)) { preguntaInvitacion(location.href); history.replaceState(null, '', location.pathname + location.search); } });
    addEventListener('guardiana-idioma', () => { pintaLista(); const c = CONVS.get(ACTUAL); if (c) pintaCabecera(c); });
    // sesión blindada
    // el enlace se copia solo al crear la invitación: se pide el portapapeles dentro del mismo toque, con el enlace por llegar
    // En el móvil, una sola conversación: crear otra borra la anterior (en los dos equipos), con una pregunta antes si ya había
    // una conversación de verdad (dueño, 28 Oct 2026, 15:58: «en el móvil estas sesiones antiguas no tienen que aparecer para
    // nada… siempre lo nuevo; lo anterior se borra todo»)
    $('#nueva-blindada').addEventListener('click', () => { if (esMovil() && vivas().some((x) => x.huella && !x.contacto)) { abreHoja('h-nueva'); return; } nuevaBlindadaConCopia(); });
    $('#nueva-no').addEventListener('click', () => cierraHoja('h-nueva'));
    $('#nueva-si').addEventListener('click', () => { cierraHoja('h-nueva'); nuevaBlindadaConCopia(); });
    // En el móvil, un solo toque: «Crear y compartir invitación» abre ya el menú de compartir del teléfono (dueño, 28 Oct 2026, 16:40:
    // «me lleva otra vez a darle otra vez a compartir enlace… mejor un solo botón… de un solo viaje»). El enlace sale de una semilla
    // preparada de antemano, así el menú se abre dentro del mismo toque (los teléfonos no lo dejan abrir después); la invitación se
    // crea a la vez. Si se cierra el menú sin compartir, queda la página con «Compartir enlace».
    let semillaLista = null;
    const preparaSemilla = () => { try { if (!semillaLista) semillaLista = C.nuevaSemilla(); } catch (_) {} };
    preparaSemilla();
    function nuevaBlindadaConCopia() {
      if (esMovil() && navigator.share && R.abierto && C.B.hayBlindada()) {
        const semilla = semillaLista || C.nuevaSemilla(); semillaLista = null; setTimeout(preparaSemilla, 0);
        const url = ORIGEN + '#b=' + C.b64u(semilla);
        const hecha = creaInvitacionB(semilla);
        let compartido = null; try { compartido = navigator.share({ title: 'GUARDIANA', text: T('Invitación a una sesión blindada de GUARDIANA Comunicaciones'), url }); } catch (_) { compartido = Promise.reject(); }
        Promise.resolve(compartido).then(async () => { const c = await hecha; if (c) { c.compartido = true; if (ACTUAL === c.id) muestraEnlace(c); } }).catch(() => {});
        return;
      }
      let dale = null; const listo = new Promise((r) => { dale = r; });
      try { if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) navigator.clipboard.write([new ClipboardItem({ 'text/plain': listo.then((c) => { if (!c) throw new Error('sin enlace'); return new Blob([enlaceB(c)], { type: 'text/plain' }); }) })]).then(() => listo.then((c) => { if (c) { c.copiado = true; if (ACTUAL === c.id) muestraEnlace(c); } })).catch(() => {}); } catch (_) {}
      creaInvitacionB().then((c) => dale(c || null)).catch(() => dale(null));
    }
    $('#vaciar').addEventListener('click', () => { const c = CONVS.get(ACTUAL); if (!c) return; $('#vaciar-nota').hidden = false; abreHoja('h-vaciar'); });
    $('#vaciar-no').addEventListener('click', () => cierraHoja('h-vaciar'));
    $('#vaciar-si').addEventListener('click', async () => { cierraHoja('h-vaciar'); await vacia(CONVS.get(ACTUAL)); });
    $('#codigo-enlace').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (!c || !c.semilla) return; const u = ORIGEN + '#i=' + C.b64u(c.semilla); $('#codigo-enlace').dataset.enlace = u; try { await navigator.clipboard.writeText(u); aviso(T('Enlace copiado: envíalo por un canal de confianza.')); } catch (_) { aviso(u); } });
    $('#aceptar-si').addEventListener('click', async () => { const e = invitacionPendiente; invitacionPendiente = null; muestraAceptar(false); if (!e) return; marcaInvitado(); const ok = await aceptaInvitacion(e); if (!ok) aviso(T('Ese enlace no es una invitación de GUARDIANA.')); });
    $('#aceptar-no').addEventListener('click', () => { invitacionPendiente = null; muestraAceptar(false); aviso(T('Invitación rechazada.')); });
    $('#enlace-cancelar-2').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (c) await destruye(c, true); });
    $('#enlace-copiar').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (!c || !esB(c)) return; try { await navigator.clipboard.writeText(enlaceB(c)); c.copiado = true; c.compartido = true; muestraEnlace(c); aviso(T('Enlace copiado: envíalo por un canal de confianza.')); } catch (_) { $('#enlace-b').select(); } });
    const comparte = $('#enlace-compartir'); comparte.hidden = !navigator.share;
    comparte.addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (!c || !esB(c)) return; try { await navigator.share({ title: 'GUARDIANA', text: T('Invitación a una sesión blindada de GUARDIANA Comunicaciones'), url: enlaceB(c) }); c.compartido = true; if (ACTUAL === c.id) muestraEnlace(c); } catch (_) {} });
    $('#enlace-cancelar').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (c) await destruye(c, true); });
    $('#bl-coincide').addEventListener('click', async () => { const c = CONVS.get(ACTUAL); if (c) await marcaVerificada(c, !c.verificada); });
    $('#cierre-si').addEventListener('click', async () => { cierraHoja('h-cierre'); const c = CONVS.get(ACTUAL); if (c) await destruye(c); });
    $('#cierre-no').addEventListener('click', () => cierraHoja('h-cierre'));
    // un enlace blindado pegado en el campo del código también vale
    campoCod.addEventListener('paste', async (e) => { const t = (e.clipboardData && e.clipboardData.getData('text')) || ''; if (!/#[ib]=[A-Za-z0-9_-]{43}/.test(t)) return; e.preventDefault(); const ok = await aceptaInvitacion(t); if (ok) $('#paso-entrar').hidden = true; else { $('#unir-mal').textContent = T('Ese enlace no es una invitación de GUARDIANA.'); $('#unir-mal').hidden = false; } });
    // renovación de claves de la blindada: cada 5 minutos, quien inicia se presenta otra vez (efímeras y ML-KEM nuevos)
    setInterval(() => { for (const c of CONVS.values()) { if (!esB(c) || c.renovando || !c.sesion || !c.sesion.confirmada || !enLinea(c) || !soyInicio(c) || Date.now() - c.sesion.desde < renuevaMs()) continue; c.renovando = true; enCola(c, () => presentaB(c, null, true)).finally(() => setTimeout(() => { c.renovando = false; }, 20000)); } }, 15000);
  }

  // ---------- navegadores de dentro de otras apps (agencia, ronda 74) ----------
  // Quien llega desde un anuncio de Instagram, Facebook o TikTok abre la web dentro de esa app, donde la cámara, el micrófono
  // y las descargas pueden fallar. Se avisa una vez por visita, sin bloquear: copiar el enlace, cómo abrirlo fuera y seguir aquí.
  function avisoInterno() {
    const ua = navigator.userAgent || '', b = $('#interno');
    if (!b || !/Instagram|FBAN|FBAV|FB_IAB|FBIOS|TikTok|BytedanceWebview|musical_ly|Snapchat|Pinterest|LinkedInApp|\bLine\//i.test(ua)) return;
    try { if (sessionStorage.getItem('gcom-interno') === 'no') return; } catch (_) {}
    const android = /Android/i.test(ua);
    $('#interno-chrome').hidden = !android;
    $('#interno-como').textContent = android ? T('O abre el menú ⋮ de la aplicación y elige «Abrir en el navegador».') : T('Toca ⋯ (arriba a la derecha) y elige «Abrir en el navegador» o «Abrir en Safari».');
    b.hidden = false;
    const enlace = location.origin + '/orbita/comunicaciones/';
    $('#interno-copiar').addEventListener('click', async () => {
      let ok = false; try { await navigator.clipboard.writeText(enlace); ok = true; } catch (_) {}
      if (!ok) { try { const x = document.createElement('textarea'); x.value = enlace; x.setAttribute('readonly', ''); x.style.position = 'fixed'; x.style.opacity = '0'; document.body.append(x); x.select(); ok = document.execCommand('copy'); x.remove(); } catch (_) {} }
      aviso(ok ? T('Enlace copiado: pégalo en Safari o en Chrome.') : enlace);
    });
    $('#interno-no').addEventListener('click', () => { b.hidden = true; try { sessionStorage.setItem('gcom-interno', 'no'); } catch (_) {} });
  }

  // ---------- arranque ----------
  async function arranca() {
    if (!window.isSecureContext || !crypto.subtle || !window.indexedDB) { $('#inicio').innerHTML = '<p>' + T('Este navegador no puede abrir Comunicaciones: hace falta una conexión segura (https) y un navegador actual.') + '</p>'; return; }
    await BD.abre();
    await cargaIdentidad();
    arrancaRele();
    eventos();
    arrancaLlamadas();
    avisoInterno();
    setTimeout(eligeServidorLlamadas, 4000); setInterval(eligeServidorLlamadas, 3600 * 1000);
    await cargaConvs();
    // en el móvil, de antes solo queda la más reciente (15:58)
    // (los contactos guardados se quedan siempre, 17:33)
    if (esMovil() && vivas().filter((x) => !x.contacto).length > 1) { const xs = vivas().filter((x) => !x.contacto).sort((a, b) => (b.ultimo || b.creado || 0) - (a.ultimo || a.creado || 0)); for (const x of xs.slice(1)) { try { await destruye(x, true); } catch (_) {} } pintaLista(); }
    try { if (sessionStorage.getItem('gcom-fin') === '1') { muestraFin(); return; } } catch (_) {}
    if (esInvitado()) document.body.classList.add('modo-invitado');
    if (/#[ib]=/.test(location.hash)) { const ok = await preguntaInvitacion(location.href); history.replaceState(null, '', location.pathname + location.search); if (!ok) aviso(T('Ese enlace no es una invitación de GUARDIANA.')); }
    // NÚCLEO guiado (ronda 63): «Tengo un código» llega con el campo del código abierto; «Crear una invitación», con la invitación
    // hecha en cuanto hay conexión (si ya hay una conversación en marcha, no se toca: solo se señala el botón). Una sola vez.
    try {
      const paso = new URLSearchParams(location.search).get('paso');
      if (paso === 'codigo' || paso === 'crear') {
        history.replaceState(history.state, '', location.pathname + location.hash);
        // en el móvil no hay código de 9 cifras: se queda en el inicio, con «Crear y compartir invitación» (19:10)
        if (esMovil()) { /* nada */ }
        else if (paso === 'codigo') $('#unir').click();
        else if ([...CONVS.values()].some((c) => c.estado === 'activa')) $('#nueva').focus();
        else { let n = 0; const espera = () => { if (R.abierto) $('#nueva').click(); else if (++n < 40) setTimeout(espera, 250); else $('#nueva').focus(); }; espera(); }
      }
    } catch (_) {}
  }
  if (window.GuardianaViaje) GuardianaViaje.alCerrar = () => { viajeCerradoEn = Date.now(); };
  // «Guardar en…» desde la pantalla del viaje (28 Oct 2026): lo mismo que el botón del mensaje
  if (window.GuardianaViaje) GuardianaViaje.alGuardar = (v) => { const c = CONVS.get(v.conv); const m = c && c.mensajes.find((x) => x.id === v.id); if (c && m) eligeDestino(c, m); };
  // «Cortar el envío» desde la pantalla del viaje: lo mismo que el botón del mensaje
  if (window.GuardianaViaje) {
    const msgDe = (v) => { const c = CONVS.get(v.conv); return [c, c && c.mensajes.find((x) => x.id === v.id)]; };
    GuardianaViaje.alCortar = (v) => { const [c, m] = msgDe(v); if (c && m) cortaArchivo(c, m); };
    GuardianaViaje.puedeCortar = (v) => { const [, m] = msgDe(v); return !!(m && sePuedeCortar(m)); };
  }
  arranca().catch((e) => { console.error(e); aviso(T('Algo falló al arrancar: recarga la página.')); });
  window.GuardianaCom = { get convs() { return CONVS; }, get yo() { return YO; }, get rele() { return R; }, get viajes() { return VIAJES; }, get llamada() { return LL; }, abreConv, creaInvitacion, aceptaInvitacion };
})();
