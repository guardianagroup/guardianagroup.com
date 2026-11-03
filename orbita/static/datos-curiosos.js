/* GUARDIANA · Órbita · «Datos curiosos» (owner, 22 Oct 2026: «datos curiosos e interesantes, que el cliente diga wow, pero
   que sean ciertos; del exterior y del propio PC»). Since 2 Nov 2026, a strip along the bottom of Órbita that keeps them
   passing, as the news crawls on television; a click opens the whole fact (the strip is at the end of this file).
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
      k: { ant: 'Anterior', sig: 'Siguiente', mundo: 'EL MUNDO, AHORA', equipo: 'TU EQUIPO', ejemplo: 'EJEMPLO', sabias: '¿SABÍAS QUE…?', noticia: 'NOTICIA', fijar: 'Toca los puntos para que se quede fijo y pasarlos tú', seguir: 'Fijo · toca los puntos para que siga solo' }, noticiaF: 'Noticia verificada · dos fuentes', sabiaF: 'Datos verificados · dos fuentes',
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
      rankCab: (n, resto) => `es el país con más cables submarinos del mapa: ${n}. Le siguen ${resto}.`, rankCabEmp: (n, resto) => `son los países con más cables submarinos del mapa: ${n} cada uno. Les siguen ${resto}.`, rankF: 'Datos verificados · ranking calculado ahora',
      rankCen: (n, resto) => `tiene más centros de datos que ningún otro país del mapa: ${n}. Después, ${resto}.`, rankCenEmp: (n, resto) => `tienen más centros de datos que ningún otro país del mapa: ${n} cada uno. Después, ${resto}.`,
      menosCab: (paises) => `es todo lo que une por mar a ${paises} con el resto del mundo: un solo cable submarino cada uno.`, menosF: 'Datos verificados · cobertura parcial',
      potente: (c, ab) => `puede llevar ${c}, el cable más potente del mapa${ab ? ', entre ' + ab : ''}: tanto como millones de conexiones de fibra doméstica a la vez.`, potenteF: 'Datos verificados · capacidad de diseño',
      hondo: (c) => `de profundidad alcanza el fondo bajo ${c}, el tramo de cable más hondo del mapa: más que la altura del Everest… hacia abajo.`, hondoF: 'Datos verificados · relieve del fondo marino',
      largo: (c, ab) => `mide ${c}, el cable submarino más largo del mapa${ab ? ', de ' + ab : ''}.`,
      diez: (paises) => `países del mapa ofrecen ya fibra de 10 Gbit/s al hogar: ${paises}.`, diezF: 'Datos verificados · fichas de país',
      antiguo: (c, ab) => `es el año en que entró en servicio ${c}${ab ? ' (' + ab + ')' : ''}, el cable más veterano del mapa que sigue en uso.`,
      reciben: (p, n, resto) => `es el país que más datos recibe de tu equipo: ${n} conexiones. Después, ${resto}.`, recibenF: 'Medido en este equipo por GUARDIANA',
      y: ' y ',
      dueno: (e, n, resto) => `es la empresa que opera más cables submarinos del mapa: ${n}. Le siguen ${resto}.`, duenoEmp: (n, resto) => `operan más cables submarinos que ninguna otra empresa del mapa: ${n} cada una. Les siguen ${resto}.`, duenoF: 'Datos verificados · operadores declarados',
      nuevo: (c, ab) => `es el año de ${c}${ab ? ' (' + ab + ')' : ''}, el cable más moderno del mapa ya en servicio.`,
    },
    en: {
      k: { ant: 'Previous', sig: 'Next', mundo: 'THE WORLD, NOW', equipo: 'YOUR COMPUTER', ejemplo: 'EXAMPLE', sabias: 'DID YOU KNOW…?', noticia: 'NEWS', fijar: 'Tap the dots to hold it and move through yourself', seguir: 'Held · tap the dots to let it run again' }, noticiaF: 'Verified news · two sources', sabiaF: 'Verified data · two sources',
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
      rankCab: (n, resto) => `is the country with the most submarine cables on the map: ${n}. Then ${resto}.`, rankCabEmp: (n, resto) => `are the countries with the most submarine cables on the map: ${n} each. Then ${resto}.`, rankF: 'Verified data · ranking computed now',
      rankCen: (n, resto) => `has more data centres than any other country on the map: ${n}. Then ${resto}.`, rankCenEmp: (n, resto) => `have more data centres than any other country on the map: ${n} each. Then ${resto}.`,
      menosCab: (paises) => `is all that links ${paises} to the rest of the world by sea: a single submarine cable each.`, menosF: 'Verified data · partial coverage',
      potente: (c, ab) => `can be carried by ${c}, the most powerful cable on the map${ab ? ', between ' + ab : ''}: as much as millions of home fibre connections at once.`, potenteF: 'Verified data · design capacity',
      hondo: (c) => `is the depth of the seabed under ${c}, the deepest cable stretch on the map: more than the height of Everest… downwards.`, hondoF: 'Verified data · seabed relief',
      largo: (c, ab) => `is the length of ${c}, the longest submarine cable on the map${ab ? ', from ' + ab : ''}.`,
      diez: (paises) => `countries on the map already offer 10 Gbit/s home fibre: ${paises}.`, diezF: 'Verified data · country cards',
      antiguo: (c, ab) => `is the year ${c}${ab ? ' (' + ab + ')' : ''} came into service, the oldest cable on the map still in use.`,
      reciben: (p, n, resto) => `is the country that receives the most data from your computer: ${n} connections. Then ${resto}.`, recibenF: 'Measured on this computer by GUARDIANA',
      y: ' and ',
      dueno: (e, n, resto) => `is the company operating the most submarine cables on the map: ${n}. Then ${resto}.`, duenoEmp: (n, resto) => `operate more submarine cables than any other company on the map: ${n} each. Then ${resto}.`, duenoF: 'Verified data · declared operators',
      nuevo: (c, ab) => `is the year of ${c}${ab ? ' (' + ab + ')' : ''}, the newest cable on the map already in service.`,
    },
    pt: {
      k: { ant: 'Anterior', sig: 'Seguinte', mundo: 'O MUNDO, AGORA', equipo: 'SEU COMPUTADOR', ejemplo: 'EXEMPLO', sabias: 'SABIA QUE…?', noticia: 'NOTÍCIA', fijar: 'Toca nos pontos para fixar e passar você mesmo', seguir: 'Fixo · toca nos pontos para voltar a correr' }, noticiaF: 'Notícia verificada · duas fontes', sabiaF: 'Dados verificados · duas fontes',
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
      rankCab: (n, resto) => `é o país com mais cabos submarinos do mapa: ${n}. Depois, ${resto}.`, rankCabEmp: (n, resto) => `são os países com mais cabos submarinos do mapa: ${n} cada um. Depois, ${resto}.`, rankF: 'Dados verificados · ranking calculado agora',
      rankCen: (n, resto) => `tem mais centros de dados do que qualquer outro país do mapa: ${n}. Depois, ${resto}.`, rankCenEmp: (n, resto) => `têm mais centros de dados do que qualquer outro país do mapa: ${n} cada um. Depois, ${resto}.`,
      menosCab: (paises) => `é tudo o que liga ${paises} ao resto do mundo pelo mar: um único cabo submarino cada um.`, menosF: 'Dados verificados · cobertura parcial',
      potente: (c, ab) => `pode levar o ${c}, o cabo mais potente do mapa${ab ? ', entre ' + ab : ''}: tanto quanto milhões de ligações de fibra doméstica ao mesmo tempo.`, potenteF: 'Dados verificados · capacidade de projeto',
      hondo: (c) => `de profundidade alcança o fundo sob o ${c}, o troço de cabo mais fundo do mapa: mais do que a altura do Evereste… para baixo.`, hondoF: 'Dados verificados · relevo do fundo do mar',
      largo: (c, ab) => `mede o ${c}, o cabo submarino mais longo do mapa${ab ? ', de ' + ab : ''}.`,
      diez: (paises) => `países do mapa já oferecem fibra de 10 Gbit/s em casa: ${paises}.`, diezF: 'Dados verificados · fichas de país',
      antiguo: (c, ab) => `é o ano em que o ${c}${ab ? ' (' + ab + ')' : ''} entrou em serviço, o cabo mais veterano do mapa ainda em uso.`,
      reciben: (p, n, resto) => `é o país que mais dados recebe do seu computador: ${n} ligações. Depois, ${resto}.`, recibenF: 'Medido neste computador pela GUARDIANA',
      y: ' e ',
      dueno: (e, n, resto) => `é a empresa que opera mais cabos submarinos do mapa: ${n}. Depois, ${resto}.`, duenoEmp: (n, resto) => `operam mais cabos submarinos do que qualquer outra empresa do mapa: ${n} cada uma. Depois, ${resto}.`, duenoF: 'Dados verificados · operadores declarados',
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
  // a shared first place is told as shared, never as one winner (23 Oct 2026: BT and Arelion both operate 11 cables)
  const podio = (por, n) => { const todo = [...por.entries()].sort((a, b) => b[1] - a[1]); let k = 1; while (k < todo.length && todo[k][1] === todo[0][1]) k++; const top = todo.slice(0, Math.max(n, k + 2)); return top.length < n || k >= top.length ? null : { k, top, primeros: top.slice(0, k).map((e) => e[0]), resto: top.slice(k) }; };
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
      if (!st || !st.n || !tot) return null; // a download that came back empty is not «0 satellites» (22 Oct 2026, 22:55Z)
      return { k: 'mundo', v: num(st.n), t: tx().star(num(100 * st.n / tot)), f: tx().starF + ', ' + new Date(st.descargado || S.d.descargado).toLocaleDateString(loc()) };
    },
    // rankings from the map itself (owner, 22 Oct 2026: «un ranking de los que más y los que menos… que se vayan renovando»)
    async function rankingCables() {
      const G = await lugaresCapas(); if (!G || !G.grupos) return null;
      const por = new Map();
      for (const g of G.grupos) for (const cc of new Set(g[1].map((q) => q[1]))) por.set(cc, (por.get(cc) || 0) + 1);
      const P = podio(por, 5); if (!P) return null;
      const resto = lista(P.resto.map(([cc, n]) => pais(cc) + ' (' + num(n) + ')')), n = num(P.top[0][1]);
      return { k: 'mundo', v: lista(P.primeros.map(pais)), t: P.k > 1 ? tx().rankCabEmp(n, resto) : tx().rankCab(n, resto), f: tx().rankF };
    },
    async function rankingCentros() {
      const G = await lugaresCapas(); if (!G || !G.centros) return null;
      const por = new Map();
      for (const c of G.centros) por.set(c[3], (por.get(c[3]) || 0) + (c[4] || 1));
      const P = podio(por, 5); if (!P) return null;
      const resto = lista(P.resto.map(([cc, n]) => pais(cc) + ' (' + num(n) + ')')), n = num(P.top[0][1]);
      return { k: 'mundo', v: lista(P.primeros.map(pais)), t: P.k > 1 ? tx().rankCenEmp(n, resto) : tx().rankCen(n, resto), f: tx().rankF };
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
      const P = podio(por, 4); if (!P || P.top[0][1] < 3) return null;
      const resto = lista(P.resto.map(([o, n]) => o + ' (' + num(n) + ')')), n = num(P.top[0][1]);
      return { k: 'mundo', v: lista(P.primeros), t: P.k > 1 ? tx().duenoEmp(n, resto) : tx().dueno(P.primeros[0], n, resto), f: tx().duenoF };
    },
  ];
  // the agency's verified «did you know» facts (datos/sabias.json): owners, leases, costs, projects…
  async function sabia() {
    const S = await sabias(); if (!S || !S.sabias || !S.sabias.length) return null;
    const l = lang(), vivas = S.sabias.filter((n) => n[l] || n.es);
    // 22 Oct 2026, 22:09 (owner): the big curious numbers (km of cable, weight, thickness…) come up often, not 1 in 120
    const top = vivas.filter((n) => n.destacado), de = top.length && Math.random() < 0.4 ? top : vivas;
    const n = de[Math.floor(Math.random() * de.length)]; if (!n) return null;
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

  // ---------- the deck: every fact of a pass, worked out once ----------
  let cola = [], ultimo = null;
  // each pass is a fresh shuffle of the world's facts with this computer's facts woven in, so the strip never repeats
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
    cola = orden;
  }
  let mazo = [], preparando = null;
  async function preparaMazo() {
    if (preparando) return preparando;
    preparando = (async () => {
      rellena();
      const hechos = await Promise.all(cola.map(async (f) => { try { return typeof f === 'function' ? await f() : f; } catch (_) { return null; } }));
      const t = tx(), nuevo = hechos.filter(Boolean);
      // the label of each fact is chosen once, so the strip and the open fact say the same
      for (const d of nuevo) d.kk = d.k === 'noticia' ? t.k.noticia + ' · ' + t.k.sabias : (d.fijo || (d.k === 'mundo' && Math.random() < 0.5) ? t.k.sabias : t.k[d.k]);
      if (nuevo.length) { mazo = nuevo; ultimo = cola[cola.length - 1]; }
      cola = []; preparando = null;
      return mazo;
    })();
    return preparando;
  }

  // ---------- the strip (2 Nov 2026, owner, 16:53: «esos datos curiosos tienen que aparecer en la parte de abajo… como una
  // cinta pequeña… y van pasando. Y si yo con el ratón me paro en uno y le clico, entonces me aparece la información en
  // pantalla… el botón de cerrar y volver. Y cuando dejo de ponerme encima de esa cinta… él sigue pasando») ----------
  // A thin strip along the bottom of Órbita, as the news crawls on television: the facts come in from the right and travel
  // left. The movement is one transform animation that the graphics card runs by itself (Web Animations), so a busy page
  // never makes it stutter; the facts are written twice in a row and it slides exactly one copy, so the loop has no seam.
  // The pointer over it (or the keyboard on one of its facts) stops it, gently; leaving lets it go on. A click (or Enter)
  // opens the whole fact over the planet, with «Volver» and ×, and Esc. With «reduce motion» it does not move: two
  // arrows step through the facts. It stops while the window is hidden, while something covers the planet, and in the
  // views that clear the planet (a section, the journey, the mirror, the X-rays). The space it takes is kept for it from
  // the start (static/orbita.css, --cinta), so nothing on the page moves when it arrives.
  const T = (s) => { try { return window.GuardianaIdioma ? window.GuardianaIdioma.t(s) : s; } catch (_) { return s; } };
  const QUIETO = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const VEL = 62; // px a second: a long line of text reads comfortably at this pace
  const SVG = (d, w) => '<svg width="' + w + '" height="' + w + '" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
  const cinta = document.createElement('section');
  cinta.id = 'cinta'; cinta.className = 'cinta vacia'; cinta.setAttribute('translate', 'no');
  cinta.innerHTML = '<div class="cinta-k"><i aria-hidden="true"></i><span></span></div>'
    + '<div class="cinta-ventana"><div class="cinta-pista" role="list"></div></div>'
    + '<div class="cinta-mando"' + (QUIETO ? '' : ' hidden') + '><button type="button" class="cinta-flecha" data-d="-1">' + SVG('M10 3.5 5.5 8l4.5 4.5', 15) + '</button><button type="button" class="cinta-flecha" data-d="1">' + SVG('M6 3.5 10.5 8 6 12.5', 15) + '</button></div>';
  document.body.append(cinta);
  const ventana = cinta.querySelector('.cinta-ventana'), pista = cinta.querySelector('.cinta-pista');
  let anim = null, ancho = 0, paso = 0, rampa = 0, rate = 1;
  const motivos = new Set(); // why it is stopped: raton, foco, dialogo, fuera

  // the facts, as buttons: kicker, figure and the first sentence (the whole fact opens on click)
  const corta = (t) => { if (t.length <= 130) return t; const p = t.indexOf('. ', 50); if (p > 0 && p < 150) return t.slice(0, p + 1); const c = t.lastIndexOf(' ', 125); return t.slice(0, c > 60 ? c : 125) + '…'; };
  function boton(d, i) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cinta-dato'; b.dataset.i = i;
    const k = document.createElement('span'); k.className = 'ck'; k.textContent = d.kk || '';
    b.append(k, ' ');
    if (d.v) { const v = document.createElement('b'); v.className = 'cv'; v.textContent = d.v; b.append(v, ' '); }
    const t = document.createElement('span'); t.className = 'ct'; t.textContent = corta(String(d.t || '')); b.append(t);
    if (d.e) { const e = document.createElement('span'); e.className = 'ce'; e.textContent = tx().k.ejemplo; b.append(' ', e); }
    const li = document.createElement('div'); li.className = 'cinta-li'; li.setAttribute('role', 'listitem'); li.append(b);
    return li;
  }
  function pintaRotulo() { cinta.setAttribute('aria-label', T('Datos curiosos')); cinta.querySelector('.cinta-k span').textContent = T('Datos curiosos'); for (const b of cinta.querySelectorAll('.cinta-flecha')) { const et = T(b.dataset.d === '1' ? 'Siguiente' : 'Anterior'); b.setAttribute('aria-label', et); b.title = et; } }
  function monta() {
    if (anim) { anim.cancel(); anim = null; }
    cancelAnimationFrame(rampa); rate = 1;
    pista.textContent = ''; pista.style.transform = '';
    if (!mazo.length) { cinta.classList.add('vacia'); return; }
    const a = document.createElement('div'); a.className = 'cinta-copia';
    mazo.forEach((d, i) => a.append(boton(d, i)));
    pista.append(a);
    cinta.classList.remove('vacia');
    if (QUIETO) { paso = Math.min(paso, mazo.length - 1); colocaPaso(); return; }
    ancho = a.getBoundingClientRect().width;
    if (!(ancho > 0)) return;
    // the repeats are for the eye (and the pointer): hidden from the screen reader and out of the keyboard's way
    const veces = Math.max(1, Math.ceil(ventana.clientWidth / ancho));
    for (let r = 0; r < veces; r++) { const c = a.cloneNode(true); c.setAttribute('aria-hidden', 'true'); for (const x of c.querySelectorAll('button')) x.tabIndex = -1; pista.append(c); }
    anim = pista.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(' + (-ancho) + 'px,0,0)' }], { duration: ancho / VEL * 1000, iterations: Infinity });
    aplica(true);
  }
  // reduced motion: the strip shows one fact at its start; the arrows move to the one before or after
  function colocaPaso() { const li = pista.querySelectorAll('.cinta-li')[paso]; pista.style.transform = li ? 'translate3d(' + (-li.offsetLeft) + 'px,0,0)' : ''; }
  cinta.querySelector('.cinta-mando').addEventListener('click', (e) => { const b = e.target.closest('.cinta-flecha'); if (!b || !mazo.length) return; paso = (paso + (+b.dataset.d) + mazo.length) % mazo.length; colocaPaso(); });
  // stopping and going on, with a short ease so the fact under the pointer does not jump away
  function velocidad(meta, ya) {
    cancelAnimationFrame(rampa);
    if (!anim) return;
    if (ya) { rate = meta; if (meta) { anim.updatePlaybackRate(1); anim.play(); } else anim.pause(); return; }
    if (meta > 0 && anim.playState === 'paused') { rate = 0; anim.updatePlaybackRate(0.001); anim.play(); }
    const r0 = rate, t0 = performance.now(), D = meta > r0 ? 450 : 140;
    const f = (now) => {
      const k = Math.min(1, (now - t0) / D), e = meta > r0 ? k * k * (3 - 2 * k) : 1 - (1 - k) * (1 - k);
      rate = r0 + (meta - r0) * e;
      if (k >= 1) { rate = meta; if (meta) anim.updatePlaybackRate(1); else anim.pause(); return; }
      anim.updatePlaybackRate(Math.max(0.001, rate)); rampa = requestAnimationFrame(f);
    };
    rampa = requestAnimationFrame(f);
  }
  const fuera = () => document.hidden || !!window.OrbitaTapada || /\b(dentro|viaje|en-espejo|en-radio|en-escaner|pantalla|imprime-ficha|con-informe)\b/.test(document.body.className);
  function aplica(ya) {
    const oculta = /\b(dentro|viaje|en-espejo|en-radio|en-escaner|pantalla|imprime-ficha|con-informe)\b/.test(document.body.className);
    cinta.classList.toggle('apartada', oculta);
    if (fuera()) motivos.add('fuera'); else motivos.delete('fuera');
    velocidad(motivos.size ? 0 : 1, ya || motivos.has('fuera') || motivos.has('dialogo'));
  }
  cinta.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { motivos.add('raton'); aplica(); } });
  cinta.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { motivos.delete('raton'); aplica(); } });
  cinta.addEventListener('focusin', (e) => {
    const b = e.target.closest && e.target.closest('.cinta-dato');
    if (!b || !b.matches(':focus-visible')) return;
    motivos.add('foco'); aplica(true);
    // the keyboard on a fact: the strip brings it into view (it may be off the window's edge)
    const li = b.parentNode;
    if (QUIETO) { paso = +b.dataset.i || 0; colocaPaso(); return; }
    if (anim && ancho) anim.currentTime = Math.max(0, li.offsetLeft - 28) / VEL * 1000; // the first copy's own button, near the left edge
  });
  cinta.addEventListener('focusout', (e) => { if (!cinta.contains(e.relatedTarget)) { motivos.delete('foco'); aplica(); } });
  addEventListener('visibilitychange', () => aplica(true));
  addEventListener('orbita-tapada', () => { aplica(true); if (window.OrbitaTapada) renueva(); });
  new MutationObserver(() => aplica(true)).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', () => { clearTimeout(cinta._r); cinta._r = setTimeout(monta, 250); });

  // ---------- the whole fact, over the page ----------
  const capa = document.createElement('div');
  capa.className = 'cinta-capa'; capa.hidden = true; capa.setAttribute('translate', 'no');
  capa.innerHTML = '<div class="cinta-dialogo" role="dialog" aria-modal="true" aria-labelledby="cinta-dv" aria-describedby="cinta-dt">'
    + '<div class="cd-cab"><span class="cd-k"></span><span class="cd-e" hidden></span><button type="button" class="cd-x">' + SVG('M4 4l8 8M12 4l-8 8', 16) + '</button></div>'
    + '<div class="cd-v" id="cinta-dv"></div><p class="cd-t" id="cinta-dt"></p><p class="cd-f"></p>'
    + '<div class="cd-pie"><button type="button" class="cd-volver">' + SVG('M10 3.5 5.5 8l4.5 4.5', 16) + '<span></span></button></div></div>';
  document.body.append(capa);
  const dialogo = capa.querySelector('.cinta-dialogo');
  let origen = null, cierreT = 0;
  function abre(i, desde) {
    const d = mazo[i]; if (!d) return;
    clearTimeout(cierreT);
    origen = desde || null;
    capa.querySelector('.cd-k').textContent = d.kk || '';
    const e = capa.querySelector('.cd-e'); e.hidden = !d.e; e.textContent = tx().k.ejemplo;
    capa.querySelector('.cd-v').textContent = d.v || '';
    capa.querySelector('.cd-v').hidden = !d.v;
    capa.querySelector('.cd-t').textContent = d.t || '';
    capa.querySelector('.cd-f').textContent = d.f || '';
    const x = capa.querySelector('.cd-x'); x.setAttribute('aria-label', T('Cerrar')); x.title = T('Cerrar');
    capa.querySelector('.cd-volver span').textContent = T('Volver');
    capa.hidden = false; capa.classList.remove('sale');
    motivos.add('dialogo'); aplica(true);
    capa.querySelector('.cd-volver').focus({ preventScroll: true });
  }
  function cierra() {
    if (capa.hidden || capa.classList.contains('sale')) return;
    capa.classList.add('sale');
    cierreT = setTimeout(() => { capa.hidden = true; capa.classList.remove('sale'); }, QUIETO ? 0 : 160);
    const vuelta = origen && origen.isConnected ? origen : null; origen = null;
    if (vuelta) vuelta.focus({ preventScroll: true });
    motivos.delete('dialogo');
    if (!cinta.matches(':hover')) motivos.delete('raton');
    aplica();
  }
  // a fact of a repeat opens the same fact; the focus comes back to the first copy's, the one the keyboard knows
  pista.addEventListener('click', (e) => { const b = e.target.closest('.cinta-dato'); if (!b) return; const i = +b.dataset.i; abre(i, pista.querySelector('.cinta-copia:not([aria-hidden]) .cinta-dato[data-i="' + i + '"]') || b); });
  capa.querySelector('.cd-x').addEventListener('click', cierra);
  capa.querySelector('.cd-volver').addEventListener('click', cierra);
  capa.addEventListener('click', (e) => { if (e.target === capa) cierra(); });
  capa.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cierra(); return; }
    if (e.key === 'Tab') { // the focus stays inside the open fact
      const fs = [...dialogo.querySelectorAll('button')]; const i = fs.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); fs[fs.length - 1].focus(); } else if (!e.shiftKey && i === fs.length - 1) { e.preventDefault(); fs[0].focus(); }
    }
  });

  // ---------- when the facts are worked out ----------
  // Some of them are heavy (the position of every data satellite, now): they wait until the cover of GUARDIANA has
  // finished being born, or until the planet is uncovered, so they never stall an entrance (static/nucleo.js).
  let primera = true, renovada = Date.now(), idiomaMazo = null;
  async function llena() { await preparaMazo(); idiomaMazo = lang(); monta(); renovada = Date.now(); }
  // a new pass, at most every ten minutes, worked out while the cover of GUARDIANA has been still for a while (never
  // during a section, nor while the strip is in sight: changing it in sight would make it jump)
  const enPortada = () => { const p = document.getElementById('nuc-ini'); return !!(p && !p.hidden && !p.classList.contains('sale')); };
  function renueva() {
    if (primera || preparando || Date.now() - renovada < 6e5) return;
    setTimeout(async () => { if (!window.OrbitaTapada || !enPortada() || preparando) return; await preparaMazo(); if (window.OrbitaTapada) { monta(); renovada = Date.now(); } }, 3000);
  }
  function empieza() { if (!primera) return; primera = false; llena(); }
  pintaRotulo();
  // static/idioma.js takes the visit's language when the document has been read: the strip's own words, then
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(pintaRotulo, 0));
  // another language: the facts are worked out again in it (the strip keeps the old ones in sight until they are ready);
  // the same language told again (the event comes with every choice) changes nothing
  addEventListener('guardiana-idioma', async () => { pintaRotulo(); if (primera || lang() === idiomaMazo) return; await llena(); });
  if (!RAIZ.classList.contains('con-portada') || !window.OrbitaTapada) setTimeout(empieza, 1200);
  else {
    addEventListener('guardiana-portada-quieta', () => setTimeout(empieza, 2500), { once: true });
    addEventListener('orbita-tapada', () => requestAnimationFrame(() => { if (!window.OrbitaTapada) empieza(); })); // not for a section opened from the cover
    setTimeout(empieza, 16000);
  }
  aplica(true);
})();
