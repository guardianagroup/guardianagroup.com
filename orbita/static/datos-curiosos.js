/* GUARDIANA · Órbita · «Ahora mismo» (owner, 22 Oct 2026: «datos curiosos e interesantes, que el cliente diga wow, pero
   que sean ciertos; del exterior y del propio PC»). One true fact at a time, in the card at the bottom right.
   Facts about the world are computed here, now, from the same open data the planet draws: CelesTrak's orbital elements
   (SGP4, satellite.js), OpenStreetMap's cables and data centres, GeoNames' cities and the real Sun. Facts about this
   computer come from the panel's own measurements (/api/por-dentro, kept by orbita.js in window.__orbitaPD); outside the
   program they are examples and the card says «EJEMPLO». Nothing is invented and nothing leaves the page. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const RAIZ = document.documentElement, DEMO = RAIZ.dataset.demo === '1', TIERRA = RAIZ.dataset.tierra || '/static/tierra/';
  const RAD = Math.PI / 180, RT = 6371, STERLING = [39.006, -77.429];
  const lang = () => { const l = (window.GuardianaIdioma && window.GuardianaIdioma.lang) || 'es'; return X[l] ? l : 'en'; };
  const loc = () => (window.GuardianaIdioma && window.GuardianaIdioma.locale) || 'es-ES';
  const num = (n, d = 0) => Number(n).toLocaleString(loc(), { maximumFractionDigits: d, minimumFractionDigits: d });
  const pais = (cc) => { try { return new Intl.DisplayNames([lang()], { type: 'region' }).of(cc) || cc; } catch (_) { return cc; } };
  const lugar = () => (window.OrbitaPlaneta && window.OrbitaPlaneta.lugar) || null;
  const km = (a1, o1, a2, o2) => { const p1 = a1 * RAD, p2 = a2 * RAD, dp = p2 - p1, dl = (o2 - o1) * RAD; const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2; return 2 * RT * Math.asin(Math.min(1, Math.sqrt(h))); };

  const X = {
    es: {
      k: { mundo: 'EL MUNDO, AHORA', equipo: 'TU EQUIPO', ejemplo: 'EJEMPLO', sabias: '¿SABÍAS QUE…?', noticia: 'NOTICIA', fijar: 'Toca los puntos para que se quede fijo y pasarlos tú', seguir: 'Fijo · toca los puntos para que siga solo' }, noticiaF: 'Noticia verificada · dos fuentes', sabiaF: 'Datos verificados · dos fuentes',
      sat: (d) => `satélites de datos están ahora mismo sobre el horizonte de ${d}.`, satF: 'Datos verificados · posiciones calculadas ahora',
      noche: (p) => `ciudades de más de 15.000 habitantes están ahora de noche: el ${p} % del total.`, nocheF: 'GeoNames · el Sol, calculado ahora',
      cerca: (n, o, c) => `te separan del centro de datos más cercano del mapa: ${n}${o && o !== n ? ' (' + o + ')' : ''}${c ? ', en ' + c : ''}.`, cercaF: 'Datos verificados · cobertura parcial',
      luz: (d) => `es lo mínimo que tarda la luz por fibra desde ${d} hasta Sterling (Virginia, EE. UU.), la ciudad con más centros de datos del mapa.`, luzF: 'En línea recta; por los cables reales, algo más',
      cab: (v) => `de cable submarino en el mapa: darían ${v} vueltas a la Tierra.`, cabF: 'Datos verificados · pueden faltar algunos',
      star: (p) => `satélites Starlink en órbita: el ${p} % de todos los satélites de datos que sigue Órbita.`, starF: 'Datos verificados · calculado ahora',
      llegan: (p) => `cables submarinos llegan a tierra en ${p}. Por ellos viaja casi todo lo que tu equipo envía a otros continentes.`, lleganF: 'Datos verificados · puede faltar alguno',
      emp: (p) => `empresas recibieron datos de tu equipo en la última hora, desde ${p} ${p === 1 ? 'programa' : 'programas'}.`, empF: 'Medido en este equipo por GUARDIANA',
      top: (pr, k) => `conexiones ha hecho hoy ${pr}, el programa que más habla con internet, a ${k} ${k === 1 ? 'país' : 'países'}.`, topF: 'Medido en este equipo por GUARDIANA',
      tel: (k) => `conexiones de telemetría ha enviado hoy tu equipo, a ${k} ${k === 1 ? 'país' : 'países'}.`, telF: 'Medido en este equipo por GUARDIANA',
      ej: 'Ejemplo: en el programa, medido en tu equipo', tu: 'tu ciudad',
      rankCab: (n, resto) => `es el país con más cables submarinos del mapa: ${n}. Le siguen ${resto}.`, rankF: 'Datos verificados · ranking calculado ahora',
      rankCen: (n, resto) => `tiene más centros de datos que ningún otro país del mapa: ${n}. Después, ${resto}.`,
      menosCab: (paises) => `es todo lo que une por mar a ${paises} con el resto del mundo: un solo cable submarino cada uno.`, menosF: 'Datos verificados · cobertura parcial',
      potente: (c, ab) => `puede llevar ${c}, el cable más potente del mapa${ab ? ', entre ' + ab : ''}: tanto como millones de conexiones de fibra doméstica a la vez.`, potenteF: 'Datos verificados · capacidad de diseño',
      hondo: (c) => `de profundidad alcanza el fondo bajo ${c}, el tramo de cable más hondo del mapa: más que la altura del Everest… hacia abajo.`, hondoF: 'Datos verificados · relieve del fondo marino',
      largo: (c, ab) => `mide ${c}, el cable submarino más largo del mapa${ab ? ', de ' + ab : ''}.`,
      diez: (paises) => `países del mapa ofrecen ya fibra de 10 Gbit/s al hogar: ${paises}.`, diezF: 'Datos verificados · fichas de país',
      antiguo: (c, ab) => `es el año en que entró en servicio ${c}${ab ? ' (' + ab + ')' : ''}, el cable más veterano del mapa que sigue en uso.`,
      reciben: (p, n, resto) => `es el país que más datos recibe de tu equipo: ${n} conexiones. Después, ${resto}.`, recibenF: 'Medido en este equipo por GUARDIANA',
      y: ' y ',
      dueno: (e, n, resto) => `es la empresa que opera más cables submarinos del mapa: ${n}. Le siguen ${resto}.`, duenoF: 'Datos verificados · operadores declarados',
      nuevo: (c, ab) => `es el año de ${c}${ab ? ' (' + ab + ')' : ''}, el cable más moderno del mapa ya en servicio.`,
    },
    en: {
      k: { mundo: 'THE WORLD, NOW', equipo: 'YOUR COMPUTER', ejemplo: 'EXAMPLE', sabias: 'DID YOU KNOW…?', noticia: 'NEWS', fijar: 'Tap the dots to hold it and move through yourself', seguir: 'Held · tap the dots to let it run again' }, noticiaF: 'Verified news · two sources', sabiaF: 'Verified data · two sources',
      sat: (d) => `data satellites are above the horizon of ${d} right now.`, satF: 'Verified data · positions computed now',
      noche: (p) => `cities of more than 15,000 people are in night right now: ${p}% of them.`, nocheF: 'GeoNames · the Sun, computed now',
      cerca: (n, o, c) => `to the nearest data centre on the map: ${n}${o && o !== n ? ' (' + o + ')' : ''}${c ? ', in ' + c : ''}.`, cercaF: 'Verified data · partial coverage',
      luz: (d) => `is the least light needs, through fibre, from ${d} to Sterling (Virginia, USA), the city with the most data centres on the map.`, luzF: 'In a straight line; along the real cables, a little more',
      cab: (v) => `of submarine cable on the map: enough to go round the Earth ${v} times.`, cabF: 'Verified data · some may be missing',
      star: (p) => `Starlink satellites in orbit: ${p}% of all the data satellites Órbita follows.`, starF: 'Verified data · computed now',
      llegan: (p) => `submarine cables reach land in ${p}. Almost everything your computer sends to other continents travels through them.`, lleganF: 'Verified data · some may be missing',
      emp: (p) => `companies received data from your computer in the last hour, from ${p} ${p === 1 ? 'program' : 'programs'}.`, empF: 'Measured on this computer by GUARDIANA',
      top: (pr, k) => `connections today by ${pr}, the program that talks to the internet most, to ${k} ${k === 1 ? 'country' : 'countries'}.`, topF: 'Measured on this computer by GUARDIANA',
      tel: (k) => `telemetry connections sent by your computer today, to ${k} ${k === 1 ? 'country' : 'countries'}.`, telF: 'Measured on this computer by GUARDIANA',
      ej: 'Example: in the program, measured on your computer', tu: 'your city',
      rankCab: (n, resto) => `is the country with the most submarine cables on the map: ${n}. Then ${resto}.`, rankF: 'Verified data · ranking computed now',
      rankCen: (n, resto) => `has more data centres than any other country on the map: ${n}. Then ${resto}.`,
      menosCab: (paises) => `is all that links ${paises} to the rest of the world by sea: a single submarine cable each.`, menosF: 'Verified data · partial coverage',
      potente: (c, ab) => `can be carried by ${c}, the most powerful cable on the map${ab ? ', between ' + ab : ''}: as much as millions of home fibre connections at once.`, potenteF: 'Verified data · design capacity',
      hondo: (c) => `is the depth of the seabed under ${c}, the deepest cable stretch on the map: more than the height of Everest… downwards.`, hondoF: 'Verified data · seabed relief',
      largo: (c, ab) => `is the length of ${c}, the longest submarine cable on the map${ab ? ', from ' + ab : ''}.`,
      diez: (paises) => `countries on the map already offer 10 Gbit/s home fibre: ${paises}.`, diezF: 'Verified data · country cards',
      antiguo: (c, ab) => `is the year ${c}${ab ? ' (' + ab + ')' : ''} came into service, the oldest cable on the map still in use.`,
      reciben: (p, n, resto) => `is the country that receives the most data from your computer: ${n} connections. Then ${resto}.`, recibenF: 'Measured on this computer by GUARDIANA',
      y: ' and ',
      dueno: (e, n, resto) => `is the company operating the most submarine cables on the map: ${n}. Then ${resto}.`, duenoF: 'Verified data · declared operators',
      nuevo: (c, ab) => `is the year of ${c}${ab ? ' (' + ab + ')' : ''}, the newest cable on the map already in service.`,
    },
    pt: {
      k: { mundo: 'O MUNDO, AGORA', equipo: 'SEU COMPUTADOR', ejemplo: 'EXEMPLO', sabias: 'SABIA QUE…?', noticia: 'NOTÍCIA', fijar: 'Toca nos pontos para fixar e passar você mesmo', seguir: 'Fixo · toca nos pontos para voltar a correr' }, noticiaF: 'Notícia verificada · duas fontes', sabiaF: 'Dados verificados · duas fontes',
      sat: (d) => `satélites de dados estão agora acima do horizonte de ${d}.`, satF: 'Dados verificados · posições calculadas agora',
      noche: (p) => `cidades com mais de 15 mil habitantes estão agora à noite: ${p} % do total.`, nocheF: 'GeoNames · o Sol, calculado agora',
      cerca: (n, o, c) => `até o centro de dados mais próximo do mapa: ${n}${o && o !== n ? ' (' + o + ')' : ''}${c ? ', em ' + c : ''}.`, cercaF: 'Dados verificados · cobertura parcial',
      luz: (d) => `é o mínimo que a luz leva, pela fibra, de ${d} até Sterling (Virgínia, EUA), a cidade com mais centros de dados do mapa.`, luzF: 'Em linha reta; pelos cabos reais, um pouco mais',
      cab: (v) => `de cabo submarino no mapa: dariam ${v} voltas na Terra.`, cabF: 'Dados verificados · podem faltar alguns',
      star: (p) => `satélites Starlink em órbita: ${p} % de todos os satélites de dados que o Órbita acompanha.`, starF: 'Dados verificados · calculado agora',
      llegan: (p) => `cabos submarinos chegam à terra em ${p}. Por eles viaja quase tudo o que seu computador envia a outros continentes.`, lleganF: 'Dados verificados · pode faltar algum',
      emp: (p) => `empresas receberam dados do seu computador na última hora, de ${p} ${p === 1 ? 'programa' : 'programas'}.`, empF: 'Medido neste computador pela GUARDIANA',
      top: (pr, k) => `conexões hoje do ${pr}, o programa que mais fala com a internet, para ${k} ${k === 1 ? 'país' : 'países'}.`, topF: 'Medido neste computador pela GUARDIANA',
      tel: (k) => `conexões de telemetria enviadas hoje pelo seu computador, para ${k} ${k === 1 ? 'país' : 'países'}.`, telF: 'Medido neste computador pela GUARDIANA',
      ej: 'Exemplo: no programa, medido no seu computador', tu: 'sua cidade',
      rankCab: (n, resto) => `é o país com mais cabos submarinos do mapa: ${n}. Depois, ${resto}.`, rankF: 'Dados verificados · ranking calculado agora',
      rankCen: (n, resto) => `tem mais centros de dados do que qualquer outro país do mapa: ${n}. Depois, ${resto}.`,
      menosCab: (paises) => `é tudo o que liga ${paises} ao resto do mundo pelo mar: um único cabo submarino cada um.`, menosF: 'Dados verificados · cobertura parcial',
      potente: (c, ab) => `pode levar o ${c}, o cabo mais potente do mapa${ab ? ', entre ' + ab : ''}: tanto quanto milhões de ligações de fibra doméstica ao mesmo tempo.`, potenteF: 'Dados verificados · capacidade de projeto',
      hondo: (c) => `de profundidade alcança o fundo sob o ${c}, o troço de cabo mais fundo do mapa: mais do que a altura do Evereste… para baixo.`, hondoF: 'Dados verificados · relevo do fundo do mar',
      largo: (c, ab) => `mede o ${c}, o cabo submarino mais longo do mapa${ab ? ', de ' + ab : ''}.`,
      diez: (paises) => `países do mapa já oferecem fibra de 10 Gbit/s em casa: ${paises}.`, diezF: 'Dados verificados · fichas de país',
      antiguo: (c, ab) => `é o ano em que o ${c}${ab ? ' (' + ab + ')' : ''} entrou em serviço, o cabo mais veterano do mapa ainda em uso.`,
      reciben: (p, n, resto) => `é o país que mais dados recebe do seu computador: ${n} ligações. Depois, ${resto}.`, recibenF: 'Medido neste computador pela GUARDIANA',
      y: ' e ',
      dueno: (e, n, resto) => `é a empresa que opera mais cabos submarinos do mapa: ${n}. Depois, ${resto}.`, duenoF: 'Dados verificados · operadores declarados',
      nuevo: (c, ab) => `é o ano do ${c}${ab ? ' (' + ab + ')' : ''}, o cabo mais moderno do mapa já em serviço.`,
    },
  };
  const tx = () => X[lang()];

  // ---------- data, loaded once and only when needed ----------
  const memo = {};
  const una = (k, f) => memo[k] || (memo[k] = f().catch(() => null));
  const json = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
  const script = (src) => new Promise((ok, mal) => { if (window.satellite) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = mal; document.head.appendChild(s); });
  const pausa = () => new Promise((r) => setTimeout(r, 0));
  async function trozos(n, f) { let i = 0; while (i < n) { const t0 = performance.now(); while (i < n && performance.now() - t0 < 8) f(i++); await pausa(); } }
  const satelites = () => una('sat', async () => {
    await script('static/vendor/satellite.min.js');
    const d = await json('datos/satelites.json'), c = d.campos, ix = (k) => c.indexOf(k), rec = [];
    await trozos(d.sat.length, (j) => { const f = d.sat[j], o = { NORAD_CAT_ID: f[ix('norad')] }; for (const k of c.slice(3)) o[k] = f[ix(k)]; try { const r = window.satellite.json2satrec(o); if (r && !r.error) rec.push(r); } catch (_) {} });
    return { d, rec };
  });
  const ciudades = () => una('ciu', async () => {
    const t = await (await fetch(TIERRA + 'ciudades.tsv')).text(), v = [];
    for (const l of t.split('\n')) { if (!l || l[0] === '#') continue; const p = l.split('\t'); const la = +p[3] * RAD, lo = +p[4] * RAD; v.push(Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)); }
    return new Float32Array(v);
  });
  const puntos = () => una('pt', () => json('datos/puntos.json'));
  const lugaresCapas = () => una('lug', () => json('datos/lugares-capas.json'));
  const cables = () => una('cab', () => json('datos/cables.json'));
  const capacidad = () => una('cap', () => json('datos/cables-capacidad.json'));
  const relieve = () => una('rel', () => json('datos/cables-relieve.json'));
  const paises = () => una('pai', () => json('datos/paises.json'));
  const noticias = () => una('not', () => json('datos/noticias.json'));
  const sabias = () => una('sab', () => json('datos/sabias.json'));
  const lista = (arr) => { const t = tx(); return arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + t.y + arr[arr.length - 1]; };
  const extremos = (g) => { const ll = g && g[1]; if (!ll || ll.length < 2) return ''; const a = ll[0], b = ll[ll.length - 1]; return (a[0] || pais(a[1])) + ' (' + pais(a[1]) + ') – ' + (b[0] || pais(b[1])) + ' (' + pais(b[1]) + ')'; };
  const grupoDe = (G, nombre) => G && G.grupos ? G.grupos.find((g) => g[0] === nombre) : null;

  // ---------- the facts ----------
  const MUNDO = [
    async function satSobre() {
      const L = lugar(); if (!L) return null;
      const S = await satelites(); if (!S) return null;
      const ahora = new Date(), gm = window.satellite.gstime(ahora), a = L.lat * RAD, b = L.lon * RAD;
      const ux = Math.cos(a) * Math.cos(b), uy = Math.cos(a) * Math.sin(b), uz = Math.sin(a), ox = ux * 6378.137, oy = uy * 6378.137, oz = uz * 6378.137;
      let n = 0;
      await trozos(S.rec.length, (i) => {
        let pv = null; try { pv = window.satellite.propagate(S.rec[i], ahora); } catch (_) {}
        if (!pv || !pv.position || typeof pv.position === 'boolean') return;
        const p = pv.position, ex = p.x * Math.cos(gm) + p.y * Math.sin(gm), ey = -p.x * Math.sin(gm) + p.y * Math.cos(gm), ez = p.z;
        const dx = ex - ox, dy = ey - oy, dz = ez - oz, d = Math.hypot(dx, dy, dz);
        if ((dx * ux + dy * uy + dz * uz) / d > 0) n++;
      });
      return { k: 'mundo', v: num(n), t: tx().sat(L.aprox ? L.nombre : L.nombre || tx().tu), f: tx().satF };
    },
    async function noche() {
      const C = await ciudades(); if (!C || !window.OrbitaSol) return null;
      const s = window.OrbitaSol(), a = s.lat * RAD, b = s.lon * RAD, sx = Math.cos(a) * Math.cos(b), sy = Math.cos(a) * Math.sin(b), sz = Math.sin(a);
      let n = 0; const N = C.length / 3;
      for (let i = 0; i < C.length; i += 3) if (C[i] * sx + C[i + 1] * sy + C[i + 2] * sz < 0) n++;
      return { k: 'mundo', v: num(n), t: tx().noche(num(100 * n / N)), f: tx().nocheF };
    },
    async function centroCercano() {
      const L = lugar(); if (!L || L.aprox) return null;
      const [P, G] = await Promise.all([puntos(), lugaresCapas()]); if (!P) return null;
      const c = P.campos, il = c.indexOf('lon'), ia = c.indexOf('lat'), it = c.indexOf('tipo'), inm = c.indexOf('nombre'), iop = c.indexOf('operador');
      let mejor = null, dm = 1e9, j = -1;
      for (const p of P.puntos) { if (p[it] !== 'datos') continue; j++; const d = km(L.lat, L.lon, p[ia], p[il]); if (d < dm) { dm = d; mejor = { p, j }; } }
      if (!mejor) return null;
      const g = G && G.de && G.centros ? G.centros[G.de[mejor.j]] : null;
      const nombre = mejor.p[inm] || mejor.p[iop] || '—';
      return { k: 'mundo', v: num(dm < 10 ? dm : Math.round(dm), dm < 10 ? 1 : 0) + ' km', t: tx().cerca(nombre, mejor.p[iop], g && g[2] ? g[2] + ', ' + pais(g[3]) : ''), f: tx().cercaF };
    },
    async function luz() {
      const L = lugar(); if (!L) return null;
      const d = km(L.lat, L.lon, STERLING[0], STERLING[1]); if (d < 50) return null;
      return { k: 'mundo', v: num(d / 200, d < 2000 ? 1 : 0) + ' ms', t: tx().luz(L.nombre || tx().tu), f: tx().luzF };
    },
    async function cableVueltas() {
      const C = await cables(); if (!C || !C.medida) return null;
      return { k: 'mundo', v: num(C.medida.km) + ' km', t: tx().cab(num(C.medida.km / 40075, 1)), f: tx().cabF };
    },
    async function starlink() {
      const S = await satelites(); if (!S) return null;
      const g = S.d.grupos, st = g.find((x) => x.id === 'starlink'), tot = g.reduce((a, x) => a + x.n, 0);
      if (!st || !tot) return null;
      return { k: 'mundo', v: num(st.n), t: tx().star(num(100 * st.n / tot)), f: tx().starF + ', ' + new Date(S.d.descargado).toLocaleDateString(loc()) };
    },
    // rankings from the map itself (owner, 22 Oct 2026: «un ranking de los que más y los que menos… que se vayan renovando»)
    async function rankingCables() {
      const G = await lugaresCapas(); if (!G || !G.grupos) return null;
      const por = new Map();
      for (const g of G.grupos) for (const cc of new Set(g[1].map((q) => q[1]))) por.set(cc, (por.get(cc) || 0) + 1);
      const top = [...por.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5); if (top.length < 5) return null;
      return { k: 'mundo', v: pais(top[0][0]), t: tx().rankCab(num(top[0][1]), lista(top.slice(1).map(([cc, n]) => pais(cc) + ' (' + num(n) + ')'))), f: tx().rankF };
    },
    async function rankingCentros() {
      const G = await lugaresCapas(); if (!G || !G.centros) return null;
      const por = new Map();
      for (const c of G.centros) por.set(c[3], (por.get(c[3]) || 0) + (c[4] || 1));
      const top = [...por.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5); if (top.length < 5) return null;
      return { k: 'mundo', v: pais(top[0][0]), t: tx().rankCen(num(top[0][1]), lista(top.slice(1).map(([cc, n]) => pais(cc) + ' (' + num(n) + ')'))), f: tx().rankF };
    },
    async function menosCables() {
      const G = await lugaresCapas(); if (!G || !G.grupos) return null;
      const por = new Map();
      for (const g of G.grupos) for (const cc of new Set(g[1].map((q) => q[1]))) por.set(cc, (por.get(cc) || 0) + 1);
      const unos = [...por.entries()].filter(([, n]) => n === 1).map(([cc]) => cc); if (unos.length < 3) return null;
      for (let j = unos.length - 1; j > 0; j--) { const r = Math.floor(Math.random() * (j + 1)); [unos[j], unos[r]] = [unos[r], unos[j]]; }
      return { k: 'mundo', v: '1', t: tx().menosCab(lista(unos.slice(0, 3).map(pais))), f: tx().menosF };
    },
    async function masPotente() {
      const [C, G] = await Promise.all([capacidad(), lugaresCapas()]); if (!C || !C.cables) return null;
      const top = Object.entries(C.cables).sort((a, b) => b[1].tbps - a[1].tbps)[0]; if (!top) return null;
      return { k: 'mundo', v: num(top[1].tbps) + ' Tbit/s', t: tx().potente(top[0], extremos(grupoDe(G, top[0]))), f: tx().potenteF };
    },
    async function masHondo() {
      const [R, C] = await Promise.all([relieve(), cables()]); if (!R || !R.tramos || !C) return null;
      let mejor = null;
      for (const s of C.cables) { if (!s.n || !s.l || s.l.length < 2) continue; let suma = 0; for (const [lo, la] of s.l) suma += Math.round(lo * 1000) + Math.round(la * 1000); const r = R.tramos[s.l.length + ':' + suma]; if (r && (!mejor || r.max > mejor.max)) mejor = { max: r.max, n: s.n }; }
      if (!mejor || mejor.max < 8849) return null;
      return { k: 'mundo', v: num(mejor.max) + ' m', t: tx().hondo(mejor.n), f: tx().hondoF };
    },
    async function masLargo() {
      const G = await lugaresCapas(); if (!G || !G.grupos) return null;
      const top = G.grupos.filter((g) => g[2] && g[2].kmMapa).sort((a, b) => b[2].kmMapa - a[2].kmMapa)[0]; if (!top) return null;
      return { k: 'mundo', v: num(top[2].kmMapa) + ' km', t: tx().largo(top[0], extremos(top)), f: tx().cabF };
    },
    async function diezGiga() {
      const P = await paises(); if (!P || !P.paises) return null;
      const cc = Object.entries(P.paises).filter(([, v]) => v.diez && v.confirmado).map(([k]) => k); if (cc.length < 3) return null;
      for (let j = cc.length - 1; j > 0; j--) { const r = Math.floor(Math.random() * (j + 1)); [cc[j], cc[r]] = [cc[r], cc[j]]; }
      return { k: 'mundo', v: num(cc.length), t: tx().diez(lista(cc.slice(0, 6).map(pais)) + (cc.length > 6 ? '…' : '')), f: tx().diezF };
    },
    async function masAntiguo() {
      const G = await lugaresCapas(); if (!G || !G.grupos) return null;
      const top = G.grupos.filter((g) => g[2] && g[2].anio > 1980).sort((a, b) => a[2].anio - b[2].anio)[0]; if (!top) return null;
      return { k: 'mundo', v: String(top[2].anio), t: tx().antiguo(top[0], extremos(top)), f: tx().cabF };
    },
    async function masNuevo() {
      const G = await lugaresCapas(); if (!G || !G.grupos) return null;
      const top = G.grupos.filter((g) => g[2] && g[2].anio && g[2].anio <= new Date().getFullYear()).sort((a, b) => b[2].anio - a[2].anio)[0]; if (!top) return null;
      return { k: 'mundo', v: String(top[2].anio), t: tx().nuevo(top[0], extremos(top)), f: tx().cabF };
    },
    async function masDueno() {
      const G = await lugaresCapas(); if (!G || !G.grupos) return null;
      const por = new Map();
      for (const g of G.grupos) for (const o of new Set((g[2] && g[2].operan) || [])) por.set(o, (por.get(o) || 0) + 1);
      const top = [...por.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4); if (top.length < 4 || top[0][1] < 3) return null;
      return { k: 'mundo', v: top[0][0], t: tx().dueno(top[0][0], num(top[0][1]), lista(top.slice(1).map(([o, n]) => o + ' (' + num(n) + ')'))), f: tx().duenoF };
    },
  ];
  // the agency's verified «did you know» facts (datos/sabias.json): owners, leases, costs, projects…
  async function sabia() {
    const S = await sabias(); if (!S || !S.sabias || !S.sabias.length) return null;
    const l = lang(), vivas = S.sabias.filter((n) => n[l] || n.es); const n = vivas[Math.floor(Math.random() * vivas.length)]; if (!n) return null;
    return { k: 'mundo', v: n.cifra || '', t: (n[l] || n.es).replace(/\s*\?\s*$/, '.'), f: tx().sabiaF, s: true, fijo: true };
  }
  // This computer: in the program, from the panel's measurements; outside it, three labelled examples.
  function equipo() {
    const t = tx();
    if (DEMO) return [
      { k: 'equipo', e: true, v: pais('US'), t: t.reciben('US', num(2310), lista([pais('IE') + ' (' + num(412) + ')', pais('DE') + ' (' + num(180) + ')'])), f: t.ej },
      { k: 'equipo', e: true, v: num(37), t: t.emp(6), f: t.ej },
      { k: 'equipo', e: true, v: num(1204), t: t.tel(3), f: t.ej },
      { k: 'equipo', e: true, v: num(842), t: t.top('Navegador', 9), f: t.ej },
    ];
    const u = window.__orbitaPD; if (!u || !u.destinos) return [];
    const out = [], ahora = u.ahora || Date.now(), hora = u.destinos.filter((d) => ahora - (d.ultima || 0) < 3600e3);
    const emp = new Set(hora.map((d) => d.empresa || d.red || d.destino).filter(Boolean)), prog = new Set(hora.map((d) => d.programa).filter(Boolean));
    if (emp.size) out.push({ k: 'equipo', v: num(emp.size), t: t.emp(prog.size || 1), f: t.empF });
    const porProg = new Map();
    for (const d of u.destinos) { if (!d.programa) continue; const x = porProg.get(d.programa) || { n: 0, p: new Set() }; x.n += (d.enviados || 0) + (d.paradas || 0); if (d.pais) x.p.add(d.pais); porProg.set(d.programa, x); }
    const top = [...porProg.entries()].sort((a, b) => b[1].n - a[1].n)[0];
    if (top && top[1].n) out.push({ k: 'equipo', v: num(top[1].n), t: t.top(top[0], top[1].p.size), f: t.topF });
    const tel = u.destinos.filter((d) => d.categoria === 'telemetria'), nt = tel.reduce((a, d) => a + (d.enviados || 0) + (d.paradas || 0), 0);
    if (nt) out.push({ k: 'equipo', v: num(nt), t: t.tel(new Set(tel.map((d) => d.pais).filter(Boolean)).size), f: t.telF });
    const porPais = new Map();
    for (const d of u.destinos) { if (!d.pais) continue; porPais.set(d.pais, (porPais.get(d.pais) || 0) + (d.enviados || 0) + (d.paradas || 0)); }
    const pp = [...porPais.entries()].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    if (pp.length >= 2) out.push({ k: 'equipo', v: pais(pp[0][0]), t: t.reciben(pp[0][0], num(pp[0][1]), lista(pp.slice(1, 3).map(([cc, n]) => pais(cc) + ' (' + num(n) + ')'))), f: t.recibenF });
    return out;
  }

  // ---------- the card ----------
  const caja = $('dato'); if (!caja) return;
  let parado = false, temp = 0, cola = [], ultimo = null, vuelta = 0, pos = 0, fijo = false, vistos = [], cursor = -1;
  // each pass is a fresh shuffle of the world's facts with this computer's facts woven in, so the card never repeats
  // the same sequence (owner, 22 Oct 2026: «se tienen que ir renovando, que no sean siempre los mismos»)
  async function noticia() {
    const N = await noticias(); if (!N || !N.noticias || !N.noticias.length) return null;
    const l = lang(), vivas = N.noticias.filter((n) => n[l] || n.es).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
    const n = vivas[Math.min(vivas.length - 1, Math.floor(Math.pow(Math.random(), 2) * vivas.length))]; if (!n) return null;
    const f = n.fecha ? new Date(n.fecha + 'T12:00:00').toLocaleDateString(loc(), { day: 'numeric', month: 'short' }) : '';
    return { k: 'noticia', v: f, t: n[l] || n.es, f: tx().noticiaF, s: true };
  }
  function rellena() {
    const m = MUNDO.slice(); m.push(noticia, sabia, sabia); for (let j = m.length - 1; j > 0; j--) { const r = Math.floor(Math.random() * (j + 1)); [m[j], m[r]] = [m[r], m[j]]; }
    if (ultimo && m[0] === ultimo && m.length > 1) [m[0], m[1]] = [m[1], m[0]];
    const eq = equipo(), orden = [], paso = eq.length ? Math.max(1, Math.round(m.length / eq.length)) : 0;
    let e = 0; for (let k = 0; k < m.length; k++) { orden.push(m[k]); if (paso && (k + 1) % paso === 0 && e < eq.length) orden.push(eq[e++]); }
    while (e < eq.length) orden.push(eq[e++]);
    cola = orden; vuelta = orden.length; pos = 0;
  }
  async function siguiente() {
    clearTimeout(temp);
    for (let intento = 0; intento < 12; intento++) {
      if (!cola.length) rellena();
      const f = cola.shift(); pos++;
      const d = typeof f === 'function' ? await f() : f;
      if (d) { ultimo = f; vistos.push(d); if (vistos.length > 60) vistos.shift(); cursor = vistos.length - 1; pinta(d, (pos - 1) % Math.max(1, vuelta), vuelta); break; }
    }
    if (!fijo) temp = setTimeout(() => { if (!parado && !document.hidden) siguiente(); else temp = setTimeout(siguiente, 3000); }, 9000);
  }
  // fixed mode: the card stops by itself and the person moves it: tap the card for the next one, the «‹» for the previous
  function fija(on) { fijo = on; caja.classList.toggle('fijo', on); clearTimeout(temp); if (!on) temp = setTimeout(siguiente, 2500); }
  function anterior() { if (cursor > 0) { cursor--; const d = vistos[cursor]; pinta(d, cursor, vistos.length); } }
  function pinta(d, k, n) {
    const t = tx();
    caja.classList.remove('entra'); void caja.offsetWidth; caja.classList.add('entra');
    $('dato-k').textContent = d.k === 'noticia' ? t.k.noticia + ' · ' + t.k.sabias : (d.fijo || (d.k === 'mundo' && Math.random() < 0.5) ? t.k.sabias : t.k[d.k]);
    const e = $('dato-e'); e.hidden = !d.e; e.textContent = t.k.ejemplo;
    $('dato-v').textContent = d.v; $('dato-t').textContent = d.t; $('dato-f').textContent = d.f;
    const p = $('dato-p'); p.textContent = ''; p.title = fijo ? (t.k.seguir || '') : (t.k.fijar || '');
    if (fijo) { const a = document.createElement('b'); a.className = 'datras'; a.textContent = '‹'; p.append(a); }
    for (let j = 0; j < n; j++) { const b = document.createElement('i'); if (j === k) b.className = 'on'; p.append(b); }
    if (fijo) { const a = document.createElement('b'); a.className = 'dfijo'; a.textContent = '⏸'; p.append(a); }
    caja.hidden = false;
  }
  caja.addEventListener('mouseenter', () => { parado = true; });
  caja.addEventListener('mouseleave', () => { parado = false; });
  caja.addEventListener('click', (e) => {
    const p = e.target.closest('#dato-p'); const k = e.target.closest('#dato-k'); const atras = e.target.closest('.datras');
    if (p) { fija(!fijo); return; }            // the dots: stop here / let it run again
    if (atras) { anterior(); return; }         // «‹»: the previous one, when fixed
    if (k && fijo) { fija(false); return; }    // the label while fixed: let it run again
    if (fijo && cursor < vistos.length - 1) { cursor++; pinta(vistos[cursor], cursor, vistos.length); return; }
    siguiente();
  });
  addEventListener('guardiana-idioma', () => { cola = []; siguiente(); });
  setTimeout(siguiente, 3500);
})();
