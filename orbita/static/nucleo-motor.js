// GUARDIANA · NÚCLEO · el motor que entiende las frases (27 Oct 2026, rondas 53 y 54 de la agencia).
// No es una IA generativa: limpia la frase (minúsculas, sin tildes, erratas conocidas), saca aparte lo que no se puede
// adivinar (una dirección, una búsqueda, un código de 9 cifras, un país, una capa del planeta) y compara el resto, por
// trozos de tres letras, con las frases de ejemplo de cada intención (nucleo-frases.js). Así aguanta faltas de ortografía.
// Si está seguro, actúa; si duda entre dos o tres, pregunta «¿Quisiste decir…?»; si no reconoce nada, lo dice y enseña
// qué se le puede pedir. Las frases delicadas (contraseñas, banco, peligro…) van primero y nunca se buscan en internet.
// Se usa en la página y también en las pruebas de Node (por eso no toca el DOM).
'use strict';
(function (raiz) {
  const PARADA = new Set(('el la los las lo un una unos unas de del al a en y o u e por para con me mi mis te tu tus se su sus le les es son '
    + 'esto eso este esta estos estas ese esa aqui ahi alli ya pues bueno vale ok eh ah oye venga porfa porfis plis favor please pls '
    + 'the an to of in on at my i is it this that for and or be do can you your just quiero puedes podrias dime necesito').split(' '));
  const ERRATAS = { nabegador: 'navegador', navegdor: 'navegador', nvegador: 'navegador', grasias: 'gracias', grax: 'gracias', radografia: 'radiografia',
    raddiografia: 'radiografia', radiografa: 'radiografia', orvita: 'orbita', satelits: 'satelites', satelite: 'satelites', kiero: 'quiero', q: 'que', k: 'que',
    ke: 'que', xq: 'porque', porq: 'porque', pq: 'porque', tb: 'tambien', dnd: 'donde', komo: 'como', ola: 'hola', olaa: 'hola', holi: 'hola', cuanta: 'cuanto' };
  const tildes = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // «marca punto com», «w w w», «dot com» (voz) → marca.com
  const hablado = (s) => String(s || '').replace(/\s+(?:punto|dot)\s+(com|es|co|org|net|mx|ar|cl|pe|uy|ec|bo|py|ve|cr|gt|hn|sv|ni|pa|do|cu|io|info|gov|edu|tv|me|eu|fr|de|it|uk|br|pt)\b/gi, '.$1')
    .replace(/\b(?:w\s+w\s+w|triple\s+w)\s*(?:punto\s+)?/gi, 'www.');
  function limpia(s) {
    return tildes(s).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean).map((w) => (ERRATAS[w] != null ? ERRATAS[w] : w)).filter(Boolean).join(' ');
  }
  const sinParada = (s) => s.split(' ').filter((w) => w && !PARADA.has(w)).join(' ');
  function trig(s) { const o = new Set(); for (const w of s.split(' ')) { if (!w) continue; const p = ' ' + w + ' '; for (let i = 0; i + 3 <= p.length; i++) o.add(p.slice(i, i + 3)); } return o; }
  function dice(a, b) { if (!a.size || !b.size) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return 2 * n / (a.size + b.size); }

  let PREP = null, CL = {}, CLRE = {};
  function prepara(FR, CLAVES) {
    PREP = Object.entries(FR || {}).map(([id, xs]) => [id, xs.map((x) => { const l = limpia(x); return trig(sinParada(l) || l); })]);
    CL = CLAVES || {}; CLRE = {};
    for (const [id, ks] of Object.entries(CL)) CLRE[id] = ks.map((k) => (k.length <= 4 ? new RegExp('(^| )' + k + '( |$)') : null));
  }
  function puntua(t) {
    const l = sinParada(t) || t, g = trig(l), out = [];
    for (const [id, ps] of PREP) {
      let m = 0; for (const p of ps) { const d = dice(g, p); if (d > m) m = d; }
      const ks = CL[id] || [];
      if (ks.some((k, i) => (CLRE[id][i] ? CLRE[id][i].test(t) : t.includes(k)))) m = Math.min(1, m + 0.14);
      out.push([id, m]);
    }
    return out.sort((a, b) => b[1] - a[1]);
  }

  // Lo delicado, antes que nada (rondas 53 y 54): nunca se ofrece buscarlo en internet.
  const DELICADAS = [
    ['autolesion', /(suicid|quitarme la vida|me quiero morir|no quiero vivir|hacerme dano|matarme|kill myself)/],
    ['peligro', /(estoy en peligro|me quieren hacer dano|me estan siguiendo por la calle|alguien me sigue por la calle|llama a la policia|llama a emergencias|i am in danger)/],
    ['banco', /(\btarjeta\b|\biban\b|\bcvv\b|cuenta bancaria|numero de cuenta|clave del banco|claves del banco|banco con (mi|mis|estas)|credit card)/],
    ['clave', /(contrasen|password|\bpin\b|mi clave|mis claves|clave del correo|usuario y clave)/],
    ['robada', /(me han robado (la|mi) cuenta|me robaron (la|mi) cuenta|robaron mi cuenta|alguien esta usando mi (cuenta|contrasena)|me han robado el correo|me hackearon (la|mi) cuenta)/],
    ['hackear', /(hackea|hackear|hackeame|crackea|roba(r|me)? (la |una )?cuenta|espiar? (a |los mensajes|el movil|el whatsapp|a mi)|tirar un servidor|hacer un ataque|ddos|wifi de mi vecino|\bhack\b)/],
    ['espian', /(me espian|me estan espiando|me vigilan|me estan vigilando|tengo un virus|me han hackeado el (movil|ordenador|pc|telefono))/],
    ['estafa', /(estafa|estafador|\btimo\b|vendeis mis datos|venden mis datos|\bscam\b)/],
    ['insulto', /(\bmierda\b|\binutil\b|\bidiota\b|\bestupid|\bimbecil\b|\bgilipollas\b|\bpendejo\b|\bbasura\b|\buseless\b|\bfuck)/],
    ['salud', /(me duele|dolor de (cabeza|estomago|muelas|espalda)|medicamento|pastilla|sintoma|que tengo doctor)/],
  ];
  const CAPAS = [['p-sub', /submarin|undersea|submarine|bajo el mar|debajo del mar|fondo del mar|oceano/], ['p-fibra', /terrestre|por tierra|fibra|land cable|fiber|fibre/], ['p-puntos', /centros? de datos|data ?cent(er|re)s?|datacenter/], ['p-sat', /satelit|satellite/]];
  const capaDe = (t) => (CAPAS.find(([, re]) => re.test(t)) || [])[0] || null;
  function dominio(s) {
    if (/@/.test(s)) return null;
    const m = /(?:^|\s)((?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?)(?=\s|$)/i.exec(String(s).trim());
    if (!m) return null;
    const d = m[1].replace(/^https?:\/\//i, '').replace(/[.,;:!?)»]+$/, '');
    if (/^(?:www\.)?guardiana(group)?\./i.test(d)) return null;
    return d;
  }
  // «busca vuelos a Madrid», «buscar en internet recetas», «search for…»: lo que va detrás, tal cual lo escribió la persona
  function busqueda(s) {
    const m = /^\s*(?:(?:por favor|porfa)\s+)?(?:(?:quiero|necesito|puedes|podrias)\s+)?(?:busca(?:r|me)?|búsca(?:me)?|me buscas|buscame|pon en el buscador|search(?:\s+for)?|look\s+up|googlea)\b\s*(.*)$/i.exec(String(s));
    if (!m) return null;
    let r = m[1].replace(/^(en internet|en la web|en google|con zero|en zero|por internet)\s*/i, '').replace(/\s*(en internet|en la web|en google|con zero|en zero|por favor|porfa)\s*$/i, '').trim();
    r = r.replace(/^(algo|cosas)$/i, '');
    return r;
  }
  function codigo(s, t) {
    const m = /(?:^|\D)(\d{3})[\s.-]?(\d{3})[\s.-]?(\d{3})(?:\D|$)/.exec(String(s));
    if (!m) return null;
    if (/codigo|code|cifras|numeros|entrar|unirme|invitacion|sala/.test(t) || /^\s*[\d\s.-]+\s*$/.test(s)) return m[1] + m[2] + m[3];
    return null;
  }

  // Reglas fijas antes de comparar (ronda 53: «dar prioridad a las instrucciones concretas»): las preguntas de qué es o cómo
  // funciona una sección, y las palabras que solo pueden querer decir una cosa.
  const PREGUNTA = /(^| )(que es|que son|que significa|como funciona|como funcionas|para que sirve|para que sirven|explicame|explica|que hace|what is|how does|how do)( |$)/;
  const SECCIONES = [['z-que', /\b(zero|burbuja|navegador|navegar|remoto)\b/], ['c-que', /\b(comunicaciones|chat|mensajes?|archivos?|cifrad\w*|encript\w*|nueve cifras|9 cifras)\b/], ['p-que', /\b(orbita|orbit|planeta|globo|mapa)\b/], ['quien-eres', /\b(nucleo|tu|eres)\b/], ['que-es-guardiana', /\b(guardiana|esto|esta pagina|este proyecto|la web)\b/]];
  const FUERTES = [
    ['p-caidas', /(\bcaid[oa]s?\b|se cayo|se ha caido|\bapagon|\boutages?\b)/],
    ['c-codigo', /\b(unirme|unirse|me uno|join)\b|entrar con (el|un|mi) codigo|tengo (el|un) codigo/],
    ['c-crear', /\b(crea|crear|creame|genera|generar|create)\b.*\b(invitacion|codigo|sala|invitation)\b/],
    ['z-tor', /\b(tor|ultra)\b/],
    ['vpn', /\bvpn\b/],
    ['resumen', /\b(resumen|resumeme|resume|summary)\b/],
    ['borrar', /\b(borra|borrar|borralo|elimina|eliminar|limpia|limpiar|delete|clear)\b/],
    ['precio', /(\bprecio|\bcuesta\b|cuanto vale|\bgratis\b|\bpagar\b|\bcobra|suscripcion|\bfree\b|how much)/],
    ['idioma', /\b(idioma|idiomas|ingles|english|espanol|spanish|portugues|language)\b/],
    ['cuenta', /(\bcuenta\b|\bregistr|iniciar sesion|inicio sesion|\blogin\b|log in|sign up|darme de alta)/],
    ['contacto', /(persona real|hablar con una persona|hablar con alguien de|\bhumano\b|\bsoporte\b|atencion al cliente|\bcontacto\b|contactar|\bhuman\b|\bsupport\b)/],
  ];
  const UMBRAL_ACTUA = 0.45, MARGEN = 0.05, UMBRAL_SUGIERE = 0.34;
  const delDominio = (t) => Object.keys(CL).some((id) => (CL[id] || []).some((k, i) => (CLRE[id][i] ? CLRE[id][i].test(t) : t.includes(k)))) || SECCIONES.some(([, re]) => re.test(t));
  // ctx: { modo, pais(t) → ISO o null }
  function entiende(frase, ctx) {
    ctx = ctx || {};
    const crudo = String(frase || '').trim(); if (!crudo) return null;
    const h = hablado(crudo), t = limpia(h);
    if (!t) return null;
    if (ctx.modo === 'confirma-borrar') {
      if (/^(si|vale|ok|okey|de acuerdo|borra|borralo|borrar|yes|claro|dale|adelante)\b/.test(t)) return { id: 'borrar-si' };
      if (/^(no|nop|cancela|cancelar|mejor no|no gracias|nope)\b/.test(t)) return { id: 'borrar-no' };
    }
    for (const [id, re] of DELICADAS) if (re.test(t)) return { id };
    if (/\d{13,19}/.test(crudo.replace(/[\s-]/g, ''))) return { id: 'banco' };
    const dom = dominio(h);
    if (ctx.modo === 'web' && (dom || !/\s/.test(t))) return { id: 'z-web', web: dom || crudo.trim() };
    if (ctx.modo === 'pais') { const k = ctx.pais ? ctx.pais(t) : null; if (k) return { id: 'p-pais', pais: k }; }
    if (ctx.modo === 'buscar' && !/^(no|nada|cancela)\b/.test(t)) return { id: 'z-buscar', q: crudo };
    const bq = busqueda(crudo); if (bq != null) return { id: 'z-buscar', q: bq };
    if (dom) return { id: 'z-web', web: dom };
    const cod = codigo(crudo, t); if (cod) return { id: 'c-codigo', codigo: cod };
    if (FUERTES[0][1].test(t)) return { id: 'p-caidas' }; // «¿se ha caído internet en España?»: no es ir al país
    const pais = ctx.pais ? ctx.pais(t) : null;
    if (pais) { const capa = capaDe(t); return { id: capa || 'p-pais', pais }; }
    // «el pdf»: si hay una web abierta en ZERO, el de esa web; si no, el resumen de tus datos (y se dice el otro)
    if (/\b(pdf|informe|reporte|report)\b/.test(t)) return { id: /(mis datos|mis cortes|me han cortado|my data|resumen)/.test(t) ? 'resumen' : (/(esta web|esta pagina|la web|la pagina|this page|this website|radiografia)/.test(t) || ctx.hayWeb) ? 'z-pdf' : 'resumen' };
    if (PREGUNTA.test(t)) { const s = SECCIONES.find(([, re]) => re.test(t)); if (s && !/\b(corte|cortes|vpn|tor)\b/.test(t)) return { id: s[0] }; }
    for (const [id, re] of FUERTES) if (re.test(t)) return { id };
    if (/^((ver|muestrame|ensename|quiero ver|los|las) )*(cables|cable|cables de internet)$/.test(t)) return { quiza: ['p-sub', 'p-fibra'] }; // «cables» a secas: ¿submarinos o terrestres?
    const S = puntua(t), a = S[0] || ['', 0], b = S[1] || ['', 0], nuestro = delDominio(t);
    if (a[1] >= UMBRAL_ACTUA && a[1] - b[1] >= MARGEN && (nuestro || a[1] >= 0.62)) return { id: a[0], s: a[1] };
    if (a[1] >= UMBRAL_SUGIERE && (nuestro || a[1] >= 0.62)) return { quiza: S.filter((x) => x[1] >= Math.max(UMBRAL_SUGIERE, a[1] - 0.12)).slice(0, 3).map((x) => x[0]), s: a[1] };
    return { nada: true, sensible: /@|\d{6,}/.test(crudo) };
  }
  raiz.NucleoMotor = { prepara, entiende, puntua, limpia, hablado, dominio, busqueda, codigo };
})(typeof window !== 'undefined' ? window : globalThis);
