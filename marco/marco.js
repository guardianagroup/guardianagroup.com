/* GUARDIANA · el marco de app en el teléfono (dueño, 30 Oct 2026, 18:37; ronda 85 de la agencia). Se carga en el <head> de cada
   página (bloqueante y pequeño): decide si es un teléfono, pone html.marco antes de pintar nada y, al tener el cuerpo, añade la
   barra de pestañas «Inicio · Comunicaciones · Radiografías · Órbita» y la cabecera compacta. Entre páginas, las transiciones de
   una app (View Transitions entre documentos: hacia delante entra por la derecha; hacia atrás, al revés; entre pestañas, un
   fundido). En el PC no hace nada. Cada página dice qué es en <html>:
     data-marco-pestana="inicio|comunicaciones|radiografias|orbita"   la pestaña que se marca
     data-marco-titulo="…"                                             el título de la cabecera (si no, el de la página)
     data-marco-atras="/ruta/"                                         página de segundo nivel: «‹» que vuelve aquí
   Nada sale del teléfono: no hay medición ni cookies. */
(() => {
  'use strict';
  const H = document.documentElement;
  const UA = navigator.userAgent || '';
  const tactil = (() => { try { return matchMedia('(pointer: coarse)').matches; } catch (_) { return false; } })();
  const movil = /iPhone|iPod|Android.+Mobile|Mobile.+Firefox/i.test(UA) || (/Android|iPad/i.test(UA) && Math.min(screen.width, screen.height) < 600) || (tactil && Math.min(screen.width, screen.height) < 600);
  // ?marco=0 lo apaga en esta visita (para ver la web de siempre); ?marco=1 lo enciende (pruebas en un ordenador)
  let pide = null; try { const q = new URLSearchParams(location.search).get('marco'); if (q === '0' || q === '1') sessionStorage.setItem('guardiana-marco', q); pide = sessionStorage.getItem('guardiana-marco'); } catch (_) {}
  const encendido = pide === '1' || (pide !== '0' && movil);
  window.GuardianaMarco = { activo: encendido };
  if (!encendido) return;
  H.classList.add('marco');
  // Órbita en el teléfono: directa al planeta (NÚCLEO solo en el PC; dueño, 15:27) y con su versión móvil («m2»), antes de que
  // se pinte la página
  if (H.dataset.marcoPestana === 'orbita') {
    try { sessionStorage.setItem('guardiana-m2', '1'); } catch (_) {}
    try { const q = new URLSearchParams(location.search); if (!q.has('nucleo') && !/^#(zero|radiografias|comunicaciones|mi-conexion)$/.test(location.hash)) { q.set('nucleo', '0'); history.replaceState(history.state, '', location.pathname + '?' + q + location.hash); } } catch (_) {}
  }

  // ---------- las etiquetas en los 42 idiomas (las mismas que la web) ----------
  const ETQ = {"ar":["البداية", "الاتصالات", "الأشعة", "المدار", "رجوع", "الأقسام"],"bg":["Начало", "Комуникации", "Рентгенови снимки", "Орбита", "Назад", "Раздели"],"bn":["শুরু", "যোগাযোগ", "এক্স-রে", "অরবিট", "পিছনে", "বিভাগ"],"cs":["Úvod", "Komunikace", "Rentgeny", "Orbita", "Zpět", "Sekce"],"da":["Start", "Kommunikation", "Røntgen", "Kredsløb", "Tilbage", "Sektioner"],"de":["Start", "Kommunikation", "Röntgenbilder", "Orbit", "Zurück", "Bereiche"],"el":["Αρχή", "Επικοινωνίες", "Ακτινογραφίες", "Τροχιά", "Πίσω", "Ενότητες"],"en":["Home", "Communications", "X-Rays", "Orbit", "Back", "Sections"],"es":["Inicio", "Comunicaciones", "Radiografías", "Órbita", "Atrás", "Secciones"],"fa":["خانه", "ارتباطات", "پرتونگاری‌ها", "مدار", "بازگشت", "بخش‌ها"],"fi":["Alkuun", "Viestintä", "Röntgenkuvat", "Kiertorata", "Takaisin", "Osiot"],"fil":["Simula", "Komunikasyon", "X-Ray", "Orbit", "Bumalik", "Mga seksyon"],"fr":["Accueil", "Communications", "Radiographies", "Orbite", "Retour", "Sections"],"he":["התחלה", "תקשורת", "צילומי רנטגן", "מסלול", "חזרה", "מדורים"],"hi":["शुरुआत", "संचार", "एक्स-रे", "ऑर्बिट", "पीछे", "अनुभाग"],"hr":["Početak", "Komunikacije", "Rendgenske snimke", "Orbita", "Natrag", "Odjeljci"],"hu":["Kezdőlap", "Kommunikáció", "Röntgenképek", "Pálya", "Vissza", "Szakaszok"],"id":["Beranda", "Komunikasi", "Rontgen", "Orbit", "Kembali", "Bagian"],"is":["Upphaf", "Samskipti", "Röntgenmyndir", "Sporbraut", "Til baka", "Hlutar"],"it":["Inizio", "Comunicazioni", "Radiografie", "Orbita", "Indietro", "Sezioni"],"ja":["ホーム", "コミュニケーション", "レントゲン", "軌道", "戻る", "セクション"],"ko":["처음으로", "커뮤니케이션", "엑스레이", "궤도", "뒤로", "섹션"],"ms":["Utama", "Komunikasi", "X-Ray", "Orbit", "Kembali", "Bahagian"],"nb":["Start", "Kommunikasjon", "Røntgen", "Bane", "Tilbake", "Seksjoner"],"nl":["Start", "Communicatie", "Röntgenfoto's", "Orbit", "Terug", "Onderdelen"],"pl":["Start", "Komunikacja", "Prześwietlenia", "Orbita", "Wstecz", "Sekcje"],"pt":["Início", "Comunicações", "Radiografias", "Órbita", "Voltar", "Seções"],"pt-pt":["Início", "Comunicações", "Radiografias", "Órbita", "Anterior", "Secções"],"ro":["Acasă", "Comunicații", "Radiografii", "Orbita", "Înapoi", "Secțiuni"],"ru":["Начало", "Коммуникации", "Рентген", "Орбита", "Назад", "Разделы"],"sk":["Úvod", "Komunikácia", "Röntgeny", "Orbita", "Späť", "Sekcie"],"sv":["Start", "Kommunikation", "Röntgen", "Omloppsbana", "Tillbaka", "Avsnitt"],"sw":["Mwanzo", "Mawasiliano", "Eksirei", "Obiti", "Nyuma", "Sehemu"],"ta":["தொடக்கம்", "தகவல்தொடர்புகள்", "எக்ஸ்-ரே", "ஆர்பிட்", "பின்", "பிரிவுகள்"],"te":["ప్రారంభం", "కమ్యూనికేషన్స్", "ఎక్స్-రే", "ఆర్బిట్", "వెనుకకు", "విభాగాలు"],"th":["หน้าแรก", "การสื่อสาร", "เอกซเรย์", "วงโคจร", "ย้อนกลับ", "ส่วนต่าง ๆ"],"tr":["Başlangıç", "İletişim", "Röntgenler", "Yörünge", "Geri", "Bölümler"],"uk":["Початок", "Комунікації", "Рентген", "Орбіта", "Назад", "Розділи"],"ur":["شروع", "مواصلات", "ایکس رے", "آربٹ", "پیچھے", "حصے"],"vi":["Trang đầu", "Liên lạc", "Chụp X-quang", "Quỹ đạo", "Quay lại", "Các mục"],"zh":["首页", "通讯", "透视", "轨道", "返回", "栏目"],"zh-tw":["首頁", "通訊", "透視", "軌道", "返回", "單元"]};
  const idioma = () => { let l = ''; try { l = (window.GuardianaIdioma && GuardianaIdioma.lang) || localStorage.getItem('guardiana-lang') || ''; } catch (_) {} if (!ETQ[l]) l = (H.lang || 'es').toLowerCase(); if (l === 'pt-br') l = 'pt'; if (l === 'zh-hant' || l === 'zh-tw') l = 'zh-tw'; if (l === 'zh-hans') l = 'zh'; if (!ETQ[l]) l = l.split('-')[0]; return ETQ[l] ? l : 'es'; };
  const et = (i) => ETQ[idioma()][i];
  // Radiografías está escrita en español, inglés y portugués
  const rutaRx = () => { const l = idioma(); return l === 'es' ? '/radiografias/' : (l === 'pt' || l === 'pt-pt') ? '/pt/radiografias/' : '/en/x-rays/'; };
  const PEST = [
    // iconos de línea de 24 px (ronda 85: la voz de diseño dibujó Inicio, Comunicaciones y Radiografías; Órbita, el anillo de Astra)
    ['inicio', () => '/inicio/', 0, '<path d="M4 10 12 3.8 20 10v10.2h-5.2v-6h-5.6v6H4z"/>'],
    ['comunicaciones', () => '/orbita/comunicaciones/', 1, '<path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5v-3.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"/>'],
    ['radiografias', rutaRx, 2, '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16"/>'],
    ['orbita', () => '/orbita/', 3, '<circle cx="12" cy="12" r="5.6"/><ellipse cx="12" cy="12" rx="10" ry="3.4" transform="rotate(-24 12 12)"/>'],
  ];
  const SVG = (d) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';

  // ---------- transiciones: hacia delante, hacia atrás o entre pestañas ----------
  const IR = 'guardiana-marco-ir';
  const marca = (t) => { try { sessionStorage.setItem(IR, t); } catch (_) {} };
  addEventListener('pagereveal', (e) => {
    if (!e.viewTransition) return;
    let tipo = 'pestana';
    try { const v = sessionStorage.getItem(IR); if (v) { tipo = v; sessionStorage.removeItem(IR); } } catch (_) {}
    // atrás y adelante con el gesto o el botón del sistema: sin animación propia (el teléfono ya anima el gesto)
    try { const a = window.navigation && navigation.activation; if (a && a.navigationType === 'traverse') { e.viewTransition.skipTransition(); return; } } catch (_) {}
    try { e.viewTransition.types.add(tipo); } catch (_) {}
  });

  const listo = (f) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', f, { once: true }) : f());
  listo(() => {
    const B = document.body; if (!B) return;
    const actual = H.dataset.marcoPestana || '';
    // la barra de pestañas
    const nav = document.createElement('nav'); nav.className = 'mc-pestanas'; nav.setAttribute('translate', 'no');
    const pinta = () => {
      nav.setAttribute('aria-label', et(5)); nav.textContent = '';
      for (const [id, ruta, i, d] of PEST) {
        const a = document.createElement('a'); a.href = ruta(); a.dataset.pestana = id; a.innerHTML = SVG(d) + '<span></span>'; a.querySelector('span').textContent = et(i);
        if (id === actual) a.setAttribute('aria-current', 'page');
        a.addEventListener('click', (ev) => {
          // en la raíz de la pestaña en la que ya estás, sube arriba (como en una app); si no, va a su raíz
          if (id === actual && !H.dataset.marcoAtras) { ev.preventDefault(); const pr = document.querySelector('[data-marco-desplaza]') || document.scrollingElement; try { pr.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { pr.scrollTop = 0; } return; }
          marca('pestana');
        });
        nav.appendChild(a);
      }
    };
    pinta(); B.appendChild(nav);
    addEventListener('guardiana-idioma', pinta);
    // idioma.js elige el idioma al terminar de leerse la página (después de este momento) y, en inglés y portugués, no avisa:
    // se vuelve a pintar justo después
    setTimeout(() => { pinta(); dispatchEvent(new CustomEvent('guardiana-marco-idioma')); }, 0);
    // la cabecera compacta
    const tit = H.dataset.marcoTitulo || '';
    let grande = null; try { grande = document.querySelector(H.dataset.marcoGrande || '.mc-grande, [data-mc-grande]'); } catch (_) {}
    if (grande) grande.classList.add('mc-titulo-pagina');
    const atras = H.dataset.marcoAtras || '';
    if (H.dataset.marcoCabecera !== 'no') {
      const cab = document.createElement('header'); cab.className = 'mc-cabecera' + (grande ? '' : ' siempre'); cab.setAttribute('translate', 'no');
      if (atras) {
        // «‹ Inicio» o «‹ Radiografías»: el nombre de donde se vuelve
        const pi = PEST.findIndex((x) => x[0] === actual);
        const b = document.createElement('a'); b.className = 'mc-atras'; b.href = atras; b.innerHTML = SVG('<path d="M15 5l-7 7 7 7"/>') + '<span></span>';
        const nombreAtras = () => { b.querySelector('span').textContent = pi >= 0 ? et(PEST[pi][2]) : et(4); b.setAttribute('aria-label', et(4) + ' · ' + b.querySelector('span').textContent); };
        nombreAtras(); addEventListener('guardiana-idioma', nombreAtras); addEventListener('guardiana-marco-idioma', nombreAtras);
        b.addEventListener('click', (ev) => { marca('atras'); let ref = ''; try { ref = document.referrer ? new URL(document.referrer).origin : ''; } catch (_) {} if (ref === location.origin && history.length > 1) { ev.preventDefault(); history.back(); } });
        cab.appendChild(b);
      }
      const t = document.createElement('div'); t.className = 'mc-t'; t.textContent = tit ? (window.GuardianaIdioma ? GuardianaIdioma.t(tit) : tit) : (grande ? grande.textContent.trim() : document.title.split('·')[0].trim());
      cab.appendChild(t);
      const der = document.createElement('div'); der.className = 'mc-der'; cab.appendChild(der);
      B.insertBefore(cab, B.firstChild);
      if (!H.dataset.marcoSinHueco) { const hueco = document.createElement('div'); hueco.className = 'mc-hueco-cab'; hueco.setAttribute('aria-hidden', 'true'); cab.after(hueco); }
      // con título grande, la cabecera se llena (y dice el título) cuando el grande se va; sin él, en cuanto se desplaza
      if (grande && 'IntersectionObserver' in window) new IntersectionObserver(([x]) => cab.classList.toggle('llena', !x.isIntersecting), { rootMargin: '-' + (cab.offsetHeight || 48) + 'px 0px 0px 0px' }).observe(grande);
      else { const mira = () => cab.classList.toggle('llena', (document.scrollingElement || H).scrollTop > 4); addEventListener('scroll', mira, { passive: true }); mira(); }
      window.GuardianaMarco.cabecera = cab;
    }
    // con el teclado abierto, la barra de pestañas se esconde (como en una app)
    if (window.visualViewport) { const vv = visualViewport, base = () => Math.max(innerHeight, vv.height); let alto = base(); const mira = () => { const t = vv.height < alto - 150 && /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || ''); H.classList.toggle('mc-teclado', t); if (!t) alto = base(); }; vv.addEventListener('resize', mira); }
    if (H.dataset.marcoPestanas === 'no') { H.classList.add('mc-sin-pestanas'); nav.remove(); }
    // Comunicaciones: «‹ Inicio» lleva a Inicio
    if (actual === 'comunicaciones') { const v = document.getElementById('volver'); if (v && v.tagName === 'A') v.href = '/inicio/'; }
    // Órbita: arriba a la izquierda, «Órbita» (en vez de la marca, que choca con «Capas»)
    if (actual === 'orbita') { const t = document.createElement('div'); t.className = 'mc-orbita-t'; t.setAttribute('translate', 'no'); t.textContent = et(3); B.appendChild(t); const pt = () => { t.textContent = et(3); }; addEventListener('guardiana-idioma', pt); addEventListener('guardiana-marco-idioma', pt); }
    // los enlaces de la propia web llevan la transición «hacia delante»
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest && ev.target.closest('a[href]'); if (!a || a.closest('.mc-pestanas, .mc-cabecera') || a.target === '_blank' || ev.defaultPrevented) return;
      try { const u = new URL(a.href, location.href); if (u.origin === location.origin && (u.pathname !== location.pathname || u.search !== location.search)) marca('adelante'); } catch (_) {}
    }, true);
  });
})();
