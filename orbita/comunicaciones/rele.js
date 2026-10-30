// GUARDIANA · Comunicaciones · cliente del relé (26 Oct 2026).
// Se conecta al relé de GUARDIANA (el principal: ver «elige»), mantiene la conexión viva (ping cada 10 s, reconexión
// con espera creciente), vuelve a entrar en las salas tras una caída y pasa tramas binarias ya selladas.
// El relé solo ve la sala y los bytes; nunca una clave ni un nombre.
'use strict';
(function (raiz) {
  const MOTORES = ['wss://motor.guardianagroup.com', 'wss://motor-am.guardianagroup.com'];
  const q = new URLSearchParams(location.search);
  const LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  // Instalación propia (dueño, 27 Oct 2026, 23:21: «mejora este modelo», Threema OnPrem): si la página no la sirve
  // guardianagroup.com, el relé es el mismo servidor que la sirve. Nada pasa por GUARDIANA.
  const PROPIO = !LOCAL && !/(^|\.)guardianagroup\.com$/.test(location.hostname);
  // Puente en Rusia (dueño, 30 Oct 2026, 09:10–09:23: con su hijo en Moscú el chat va, pero las fotos y la videollamada no).
  // Desde junio de 2025 las redes rusas cortan a unos 16 KB las conexiones hacia los grandes alojamientos extranjeros: entran
  // los mensajes cortos y se quedan a medias las fotos, el audio y el vídeo. Quien está en Rusia entra por un servidor de paso
  // dentro de Rusia que reenvía al relé principal sin abrir nada (todo va ya cifrado de extremo a extremo; el relé y la sala
  // son los mismos para las dos personas). Se usa si la zona horaria del equipo es rusa, o a mano con ?puente=ru (y ?puente=no
  // para quitarlo), y solo si el puente responde; si no, todo sigue como hasta ahora.
  const PUENTE_RU = 'wss://ru.guardianagroup.com';
  const ZONAS_RU = /^(Europe\/(Moscow|Kaliningrad|Kirov|Volgograd|Astrakhan|Saratov|Ulyanovsk|Samara|Simferopol)|Asia\/(Yekaterinburg|Omsk|Novosibirsk|Barnaul|Tomsk|Novokuznetsk|Krasnoyarsk|Irkutsk|Chita|Yakutsk|Khandyga|Vladivostok|Ust-Nera|Magadan|Sakhalin|Srednekolymsk|Kamchatka|Anadyr)|W-SU)$/;
  function quierePuente() {
    let f = q.get('puente');
    try { if (f === 'ru' || f === 'no') localStorage.setItem('gcom-puente', f); else f = localStorage.getItem('gcom-puente'); } catch (_) {}
    if (f === 'ru') return true;
    if (f === 'no') return false;
    try { return ZONAS_RU.test(Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (_) { return false; }
  }
  async function puenteVivo() {
    const c = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = setTimeout(() => { try { c && c.abort(); } catch (_) {} }, 3500);
    try { await fetch(PUENTE_RU.replace(/^wss:/, 'https:') + '/salud', { mode: 'no-cors', cache: 'no-store', signal: c ? c.signal : undefined }); return true; }
    catch (_) { return false; } finally { clearTimeout(t); }
  }
  // por el puente, las credenciales de llamada del relé principal valen igual: solo cambia la puerta (el puente reenvía el
  // puerto 3478 al relé de llamadas). La ruta TLS (turns:) se quita: su certificado es el del servidor principal.
  function icePorPuente(lista) {
    return (lista || []).map((sv) => {
      const urls = [].concat(sv.urls || []).filter((u) => /^turn:/.test(u)).map((u) => u.replace(/^turn:[^:?]+/, 'turn:' + PUENTE_RU.replace(/^wss:\/\//, '')));
      return Object.assign({}, sv, { urls });
    }).filter((sv) => sv.urls.length);
  }

  function crea(o) {
    o = o || {};
    const esc = {}; const on = (t, f) => { (esc[t] = esc[t] || []).push(f); };
    const emite = (t, ...a) => { for (const f of esc[t] || []) { try { f(...a); } catch (e) { console.error(e); } } };
    let ws = null, url = null, abierto = false, intentos = 0, ping = null, cerrando = false;
    const salas = new Map(); // sala → { yo, b } (b: sala de una sesión blindada)
    let ice = [], caduca = 0, region = '', llamadas = false, ultimoPong = 0, pingEn = 0, latencia = null, avisos = '', marca = false; const hist = [];
    const esperas = {}; // respuestas pendientes (invita, busca)
    // Número GUARDIANA (29 Oct 2026): preguntas con número («q») para casar cada respuesta; el reto de esta conexión lo firma la app
    const esperasQ = new Map(); let qn = 0, reto = '', conNumeros = false;
    // la app en segundo plano (presencia): si la página nace oculta (el teléfono la abre en segundo plano), ya cuenta como fuera
    let fueraAhora = typeof document !== 'undefined' && document.visibilityState !== 'visible';
    let subUlt = null, salasUlt = []; // la última suscripción de avisos, para reenviarla nada más abrir (si no, el relé no sabe
    // todavía que esta conexión es la de este teléfono y un aviso suyo podría volver a él mismo)

    // 27 Oct 2026, 21:25: las dos personas de una conversación tienen que estar en el mismo relé (los relés no se enlazan
    // entre sí: la sala y el código de invitación viven en uno solo). Con el relé de Miami ya en marcha, elegir «el más
    // cercano» separaría a una persona de América de otra de Europa. Mientras los relés no se enlacen, Comunicaciones usa
    // siempre el principal (Núremberg); el de Miami sirve a ZERO.
    async function elige() {
      if (q.get('rele')) return q.get('rele');
      if (LOCAL) return 'ws://127.0.0.1:8794';
      if (PROPIO) return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host;
      if (quierePuente() && await puenteVivo()) return PUENTE_RU;
      return MOTORES[0];
    }

    async function conecta() {
      if (cerrando) return;
      if (!url) url = await elige();
      try { ws = new WebSocket(url.replace(/\/$/, '') + '/com'); } catch (_) { return reintenta(); }
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        abierto = true; intentos = 0;
        // «marca: 1»: esta página marca las tramas que merecen aviso, así que el relé no tiene que avisar por todas
        ws.send(JSON.stringify({ t: 'hola', marca: 1 }));
        for (const [sala, x] of salas) ws.send(JSON.stringify({ t: 'entra', sala, yo: x.yo, b: x.b || undefined }));
        if (subUlt) { try { ws.send(JSON.stringify({ t: 'avisos', sub: subUlt, salas: salasUlt })); } catch (_) {} }
        if (fueraAhora) { try { ws.send(JSON.stringify({ t: 'presencia', fuera: 1 })); } catch (_) {} }
        clearInterval(ping); pingEn = 0; ping = setInterval(mide, 10000); setTimeout(mide, 300);
        emite('abierto', { url });
      };
      ws.onmessage = (e) => {
        if (typeof e.data === 'string') {
          let m; try { m = JSON.parse(e.data); } catch (_) { return; }
          switch (m.t) {
            case 'hola': region = m.region || ''; llamadas = !!m.llamadas; ice = url === PUENTE_RU ? icePorPuente(m.ice) : m.ice || []; caduca = m.caduca || 0; avisos = typeof m.avisos === 'string' ? m.avisos : ''; marca = m.marca === 1; reto = /^[0-9a-f]{32}$/.test(m.reto || '') ? m.reto : ''; conNumeros = m.num === 1; emite('hola', { region, llamadas, ice, avisos, reto, num: conNumeros });  conBuzon = m.buzon === 1; break;
            case 'ice': ice = url === PUENTE_RU ? icePorPuente(m.ice) : m.ice || []; caduca = m.caduca || 0; emite('ice', ice); break;
            case 'sala': emite('sala', m.sala, m.miembros || []); break;
            case 'llega': emite('llega', m.sala, m.quien); break;
            case 'sale': emite('sale', m.sala, m.quien); break;
            case 'fuera': break;
            case 'pong': ultimoPong = Date.now(); if (pingEn) { latencia = Date.now() - pingEn; hist.push(latencia); if (hist.length > 6) hist.shift(); } pingEn = 0; emite('pong', latencia); break;
            case 'sustituido': salas.delete(m.sala); emite('sustituido', m.sala); break;
            case 'ausente': case 'atasco': case 'lento': emite('aviso', m); break;
            case 'error': emite('error', m); break;
            case 'invita': { const f = esperas.invita; delete esperas.invita; if (f) f(m); break; }
            case 'busca': { const f = esperas.busca; delete esperas.busca; if (f) f(m); break; }
            case 'codigo-usado': emite('codigo-usado', m.codigo); break;
            // avisos fuera de la app (29 Oct 2026)
            case 'avisos': emite('avisos', m); break;
            case 'despierta': emite('despierta', m); break;
            case 'presencia': emite('presencia', m); break;
            // Número GUARDIANA: respuestas a preguntas con número, y la otra mitad de una cita que acaba de llegar
            case 'num': case 'cita': case 'citas': case 'cita-fin': { const f = m.q && esperasQ.get(m.q); if (f) { esperasQ.delete(m.q); f(m); } break; }
            case 'cita-lista': emite('cita-lista', m); break;
            // buzón cifrado (30 Oct 2026): el relé confirma que guardó el sobre entero
            case 'buzon-ok': { const f = esperasBz.get(m.sala + '|' + m.id); if (f) { esperasBz.delete(m.sala + '|' + m.id); f(m); } break; }
            default: break;
          }
          return;
        }
        const b = new Uint8Array(e.data);
        // un sobre del buzón cifrado (por trozos): [0x04][32 sala][8 de][16 id][1 trozo][1 de cuántos][carga]
        if (b[0] === 4 && b.length >= 59) {
          const sala = hex(b.subarray(1, 33)), de = hex(b.subarray(33, 41)), id = hex(b.subarray(41, 57)), parte = b[57], total = b[58];
          const k = sala + '|' + id; let p = sobresParciales.get(k);
          if (!p || p.total !== total) { p = { total, partes: new Array(total).fill(null), t: Date.now() }; sobresParciales.set(k, p); }
          p.partes[parte] = b.slice(59);
          if (p.partes.every(Boolean)) { sobresParciales.delete(k); let n = 0; for (const x of p.partes) n += x.length; const todo = new Uint8Array(n); let o = 0; for (const x of p.partes) { todo.set(x, o); o += x.length; } emite('buzon', sala, de, id, todo); }
          for (const [kk, pp] of sobresParciales) if (Date.now() - pp.t > 120000) sobresParciales.delete(kk);
          return;
        }
        if (b.length < 41 || b[0] !== 2) return;
        const sala = hex(b.subarray(1, 33)), de = hex(b.subarray(33, 41));
        emite('trama', sala, de, b.subarray(41));
      };
      ws.onclose = () => { const estaba = abierto; abierto = false; marca = false; reto = ''; clearInterval(ping); ws = null; for (const [q, f] of esperasQ) { esperasQ.delete(q); try { f({ ok: false, por: 'sin relé' }); } catch (_) {} } if (estaba) emite('cerrado'); reintenta(); };
      ws.onerror = () => {};
    }
    function reintenta() {
      if (cerrando) return;
      intentos++;
      const espera = Math.min(20000, 800 * Math.pow(1.7, Math.min(intentos, 8))) + Math.random() * 400;
      setTimeout(() => { if (!ws) { if (intentos % 4 === 0) url = null; conecta(); } }, espera);
    }
    // Al volver a la página (el iPhone duerme la pestaña al compartir por WhatsApp), conexión enseguida y no a la espera
    // creciente; si parece abierta pero no contesta a un ping en 3 s, se cierra y se abre otra (dueño, 28 Oct 2026, 15:33: «me
    // tiene que entrar automático en cuanto mi amigo acepta»).
    function despierta() {
      if (cerrando) return;
      if (!ws) { intentos = 0; conecta(); return; }
      if (!abierto) return;
      const antes = ultimoPong; try { pingEn = Date.now(); ws.send(JSON.stringify({ t: 'ping' })); } catch (_) {}
      setTimeout(() => { if (ws && abierto && ultimoPong === antes) { intentos = 0; try { ws.close(); } catch (_) {} } }, 3000);
    }
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') despierta(); });
    if (typeof addEventListener === 'function') { addEventListener('pageshow', despierta); addEventListener('online', despierta); addEventListener('focus', despierta); }
    const hex = (b) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    const deHex = (s) => Uint8Array.from(String(s).match(/../g) || [], (h) => parseInt(h, 16));

    // Un ping al relé (cada 10 s, y cada 2 s mientras hay un envío: el viaje del archivo enseña la latencia medida).
    // Nunca dos a la vez: el «pong» no lleva número, así que uno nuevo espera a la respuesta del anterior (o a 4 s).
    function mide() {
      if (!abierto || !ws || (pingEn && Date.now() - pingEn < 4000)) return false;
      try { pingEn = Date.now(); ws.send(JSON.stringify({ t: 'ping' })); return true; } catch (_) { return false; }
    }
    function entra(sala, yo, opc) { const b = opc && opc.b ? 1 : 0; salas.set(sala, { yo, b }); if (abierto) ws.send(JSON.stringify({ t: 'entra', sala, yo, b: b || undefined })); }
    function sale(sala) { salas.delete(sala); if (abierto) ws.send(JSON.stringify({ t: 'sale', sala })); }
    // avisa: esta trama es un mensaje o un archivo y merece aviso en el teléfono de la otra persona si la tiene cerrada (0x11).
    // Las demás (acuses, «leído», «escribiendo…», presentaciones, señalización de llamada) van como siempre (0x01) y no avisan.
    function manda(sala, para, carga, avisa) {
      if (!abierto) return false;
      const c = carga instanceof Uint8Array ? carga : new Uint8Array(carga);
      const b = new Uint8Array(41 + c.length);
      // solo con un relé que entienda la marca: uno anterior descartaría la trama y el mensaje se perdería
      b[0] = avisa && marca ? 0x11 : 1; b.set(deHex(sala), 1); if (para) b.set(deHex(para), 33); b.set(c, 41);
      try { ws.send(b); return true; } catch (_) { return false; }
    }
    function pideIce() { if (abierto) ws.send(JSON.stringify({ t: 'ice' })); }
    const pregunta = (t, m) => new Promise((res) => { if (!abierto) return res({ ok: false, por: 'sin relé' }); esperas[t] = res; ws.send(JSON.stringify(Object.assign({ t }, m))); setTimeout(() => { if (esperas[t] === res) { delete esperas[t]; res({ ok: false, por: 'sin respuesta' }); } }, 8000); });
    const invita = (codigo, sobre, sal) => pregunta('invita', { codigo, sobre, sal });
    const busca = (codigo) => pregunta('busca', { codigo });
    const retira = (codigo) => { if (abierto) ws.send(JSON.stringify({ t: 'retira', codigo })); };
    // la suscripción del navegador (endpoint y claves públicas) con las salas en las que avisar; quitar=1 la borra del relé
    const suscribe = (sub, salas, quitar) => {
      if (!sub) return false;
      const s = { endpoint: sub.endpoint, keys: sub.keys };
      if (quitar) { subUlt = null; salasUlt = []; } else { subUlt = s; salasUlt = salas || []; }
      if (!abierto) return false;
      try { ws.send(JSON.stringify({ t: 'avisos', sub: s, salas: salas || [], quitar: quitar ? 1 : undefined })); return true; } catch (_) { return false; }
    };
    // «despierta» a quien no está en la sala: un aviso en su teléfono de mensaje o de llamada
    const despiertaA = (sala, tipo) => { if (!abierto) return false; try { ws.send(JSON.stringify({ t: 'despierta', sala, tipo })); return true; } catch (_) { return false; } };
    // la app en segundo plano o de vuelta (29 Oct 2026, 14:38): lo que llegue mientras está fuera se avisa también en el teléfono
    const presencia = (fuera) => { fueraAhora = !!fuera; if (!abierto) return false; try { ws.send(JSON.stringify({ t: 'presencia', fuera: fuera ? 1 : 0 })); return true; } catch (_) { return false; } };
    // Número GUARDIANA: alta o presentación del número, citas y su final (ver zero-motor/numeros.js)
    const pideQ = (t, m, ms) => new Promise((res) => {
      if (!abierto || !ws) return res({ ok: false, por: 'sin relé' });
      const q = ++qn; esperasQ.set(q, res);
      try { ws.send(JSON.stringify(Object.assign({}, m, { t, q }))); } catch (_) { esperasQ.delete(q); return res({ ok: false, por: 'sin relé' }); }
      setTimeout(() => { if (esperasQ.get(q) === res) { esperasQ.delete(q); res({ ok: false, por: 'sin respuesta' }); } }, ms || 12000);
    });
    const num = (m) => pideQ('num', m);
    const cita = (T, s) => pideQ('cita', { T, s });
    const citas = (ts) => pideQ('citas', { ts });
    const citaFin = (T, cancela) => pideQ('cita-fin', { T, cancela: cancela ? 1 : undefined });
    // Buzón cifrado (30 Oct 2026): deja un sobre (ya cerrado en la página) para «para» en esa sala; por trozos de 960 KB.
    // Responde cuando el relé lo tiene entero: { ok, por }.
    const esperasBz = new Map(), sobresParciales = new Map();
    let conBuzon = false;
    function buzonDeja(sala, para, id, sobre, avisa) {
      return new Promise((res) => {
        if (!abierto || !ws || !conBuzon) return res({ ok: false, por: 'sin relé' });
        const TROZO = 960 * 1024, total = Math.max(1, Math.ceil(sobre.length / TROZO));
        if (total > 8) return res({ ok: false, por: 'demasiado grande' });
        const k = sala + '|' + id; esperasBz.set(k, res);
        try {
          for (let i = 0; i < total; i++) {
            const c = sobre.subarray(i * TROZO, (i + 1) * TROZO), f = new Uint8Array(60 + c.length);
            f[0] = 3; f.set(deHex(sala), 1); f.set(deHex(para), 33); f.set(deHex(id), 41); f[57] = i; f[58] = total; f[59] = avisa ? 1 : 0; f.set(c, 60);
            ws.send(f);
          }
        } catch (_) { esperasBz.delete(k); return res({ ok: false, por: 'sin relé' }); }
        setTimeout(() => { if (esperasBz.get(k) === res) { esperasBz.delete(k); res({ ok: false, por: 'sin respuesta' }); } }, 30000);
      });
    }
    const buzonBorra = (sala, ids) => { if (!abierto || !ws || !ids || !ids.length) return false; try { ws.send(JSON.stringify({ t: 'buzon-borra', sala, ids })); return true; } catch (_) { return false; } };
    function cierra() { cerrando = true; clearInterval(ping); try { ws && ws.close(); } catch (_) {} }

    conecta();
    // para las pruebas: un corte de la conexión como los del teléfono (se vuelve a conectar sola)
    const corta = () => { try { if (ws) ws.close(); } catch (_) {} };
    return { on, entra, sale, manda, pideIce, cierra, invita, busca, retira, mide, suscribe, despiertaA, presencia, corta, num, cita, citas, citaFin, buzonDeja, buzonBorra, get conBuzon() { return conBuzon && abierto; }, get reto() { return reto; }, get conNumeros() { return conNumeros; }, get avisos() { return avisos; }, get abierto() { return abierto; }, get atraso() { return ws ? ws.bufferedAmount : 0; }, get region() { return region; }, get llamadas() { return llamadas; }, get ice() { return ice; }, get caduca() { return caduca; }, get url() { return url; }, get latencia() { return latencia; }, get latenciaMin() { return hist.length ? Math.min(...hist) : null; }, get ultimoPong() { return ultimoPong; } };
  }
  // Otro servidor de llamadas (dueño, 28 Oct 2026, 14:17: «que las llamadas sean todas buenas, independientemente de si la
  // persona está en Sudamérica, en Europa…»): una conexión corta para medir su tiempo de ida y vuelta y pedirle sus
  // credenciales de llamada (TURN, de vida corta). No entra en ninguna sala ni manda nada más; se cierra en cuanto responde.
  function iceDe(base, espera) {
    return new Promise((res) => {
      let ws = null, fin = false, t0 = 0, ice = null, caduca = 0, region = ''; const ms = [];
      const acaba = (r) => { if (fin) return; fin = true; clearTimeout(tm); try { if (ws) ws.close(); } catch (_) {} res(r); };
      const tm = setTimeout(() => acaba(ice && ms.length ? { ice, caduca, region, ms: Math.round(Math.min(...ms)) } : null), espera || 5000);
      try { ws = new WebSocket(String(base).replace(/\/$/, '') + '/com'); } catch (_) { acaba(null); return; }
      ws.onopen = () => { try { ws.send(JSON.stringify({ t: 'hola' })); } catch (_) { acaba(null); } };
      ws.onmessage = (e) => {
        if (typeof e.data !== 'string') return;
        let m; try { m = JSON.parse(e.data); } catch (_) { return; }
        if (m.t === 'hola') { if (!m.llamadas || !Array.isArray(m.ice) || !m.ice.length) { acaba(null); return; } ice = m.ice; caduca = +m.caduca || 0; region = m.region || ''; t0 = performance.now(); try { ws.send(JSON.stringify({ t: 'ping' })); } catch (_) { acaba(null); } }
        else if (m.t === 'pong' && ice) {
          // cuatro medidas seguidas y la mejor: una sola puede dar un pico (desde Barranquilla, Miami dio 156 ms una vez y 47 ms después)
          ms.push(performance.now() - t0);
          if (ms.length >= 4) acaba({ ice, caduca, region, ms: Math.round(Math.min(...ms)) });
          else { t0 = performance.now(); try { ws.send(JSON.stringify({ t: 'ping' })); } catch (_) { acaba({ ice, caduca, region, ms: Math.round(Math.min(...ms)) }); } }
        }
      };
      ws.onerror = () => acaba(null); ws.onclose = () => acaba(ice && ms.length ? { ice, caduca, region, ms: Math.round(Math.min(...ms)) } : null);
    });
  }
  raiz.GuardianaRele = { crea, MOTORES, PROPIO, PUENTE_RU, iceDe, icePorPuente };
})(typeof window !== 'undefined' ? window : globalThis);
