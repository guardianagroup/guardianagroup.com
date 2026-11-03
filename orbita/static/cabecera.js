/* GUARDIANA · Órbita · la cabecera y el desplazamiento (PROPUESTA, rama orbita-cabecera; 2 Nov 2026, dueño, 16:55: «cuando abro
   el programa… con el ratón puedo subir y bajar la página, pero la parte de arriba se queda igual. Quiero que reorganices la
   parte de arriba y cómo funciona el bajado o subido de la página para que sea profesional… como lo hacen las demás de primer
   nivel»). Lo que hacen las aplicaciones de escritorio y los paneles de primer nivel, sin copiar a ninguna:
     · una barra de arriba compacta que se queda siempre, con lo esencial (volver, la marca, la sección, las acciones);
     · el contenido pasa por debajo de ella, y la barra lo dice con una sombra y una línea fina en cuanto hay algo debajo;
     · la barra de desplazamiento, fina y en los colores de GUARDIANA, solo en la zona que se desplaza (nunca sobre la barra);
     · en las páginas largas, el apartado que se está leyendo, a la vista (el informe del Antivirus ya tiene su índice a la
       izquierda, con el apartado encendido; la variante B lo repite en la barra).
   Dos variantes para elegir (data-cabecera en <html>, o ?cabecera=a|b para verlas):
     A · «Barra fija»: la barra es siempre la misma; al bajar, sombra y línea.
     B · «Barra que se recoge»: arriba del todo, la barra es más alta y sin línea; al bajar, se recoge a la compacta y recibe el
         título de la página o el apartado que se lee.
   Se aplica a la portada («Toma el control de tus datos») y a las secciones de pantalla completa (Antivirus y VPN). Nada se
   mide en cada desplazamiento: IntersectionObserver para «hay algo debajo» y para el apartado que se lee. */
(() => {
  'use strict';
  const RAIZ = document.documentElement;
  const q = new URLSearchParams(location.search).get('cabecera');
  if (q === 'a' || q === 'b') RAIZ.dataset.cabecera = q;
  // elegida la B (2 nov 2026): la barra se recoge al bajar y dice en qué apartado estás, como las mejores aplicaciones
  if (!RAIZ.dataset.cabecera) RAIZ.dataset.cabecera = 'b';
  const limpia = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  // «hay algo debajo de la barra»: una marca de 1 px al principio de lo que se desplaza
  function vigilaDebajo(zona, barra, donde) {
    const marca = document.createElement('div'); marca.className = 'cab-marca'; marca.setAttribute('aria-hidden', 'true');
    zona.prepend(marca);
    new IntersectionObserver(([e]) => { const abajo = !e.isIntersecting; barra.classList.toggle('cab-debajo', abajo); donde.classList.toggle('cab-desplazada', abajo); }, { root: zona, threshold: 0 }).observe(marca);
  }

  // ---------- la portada ----------
  function portada(ini) {
    if (ini.dataset.cab) return; ini.dataset.cab = '1';
    const barra = document.createElement('div'); barra.className = 'cab-barra cab-portada';
    const izq = document.createElement('div'); izq.className = 'cab-izq';
    const der = document.createElement('div'); der.className = 'cab-der';
    const marca = document.createElement('span'); marca.className = 'cab-marca-txt'; marca.setAttribute('translate', 'no'); marca.textContent = 'GUARDIANA';
    const titulo = document.createElement('span'); titulo.className = 'cab-titulo'; titulo.setAttribute('aria-hidden', 'true');
    const h1 = ini.querySelector('h1'), pon = () => { titulo.textContent = h1 ? limpia(h1.textContent) : ''; };
    const volver = ini.querySelector('.nuc-volver'), multas = ini.querySelector('.nuc-multas-b');
    if (volver) izq.append(volver);
    izq.append(marca, titulo);
    if (multas) der.append(multas);
    barra.append(izq, der);
    const cuerpo = document.createElement('div'); cuerpo.className = 'cab-cuerpo';
    while (ini.firstChild) cuerpo.append(ini.firstChild);
    ini.append(barra, cuerpo);
    ini.classList.add('con-cabecera');
    pon(); addEventListener('guardiana-idioma', () => setTimeout(pon, 0));
    vigilaDebajo(cuerpo, barra, ini);
  }

  // ---------- Antivirus y VPN ----------
  function seccion(raiz) {
    if (raiz.dataset.cab) return; raiz.dataset.cab = '1';
    const barra = raiz.querySelector('.esc-barra'), cuerpo = raiz.querySelector('.esc-cuerpo'); if (!barra || !cuerpo) return;
    barra.classList.add('cab-barra');
    const titulo = document.createElement('span'); titulo.className = 'cab-titulo'; titulo.setAttribute('aria-hidden', 'true');
    const logo = barra.querySelector('.esc-logo'); if (logo) logo.after(titulo); else barra.append(titulo);
    vigilaDebajo(cuerpo, barra, raiz);
    // B: en la barra, el título de la página en cuanto su h1 sale por arriba; en el informe, el apartado que se lee (el último
    // cuyo título ha pasado del 40 % de arriba): se mira cuando un título cruza esa línea y al acabar cada desplazamiento
    let ioT = null, ioA = null, h1 = null, hs = [];
    const pinta = () => {
      const tope = cuerpo.getBoundingClientRect().top + cuerpo.clientHeight * 0.4;
      const actual = hs.filter((x) => x.getBoundingClientRect().top < tope).pop() || null;
      const cab = actual && actual.closest('.esc-sec-cab'), num = cab && cab.querySelector('.esc-num');
      titulo.textContent = actual ? (num ? limpia(num.textContent) + ' · ' : '') + limpia(actual.textContent) : h1 ? limpia(h1.textContent) : '';
    };
    const mira = () => {
      if (ioT) ioT.disconnect(); if (ioA) ioA.disconnect();
      h1 = [...cuerpo.querySelectorAll('h1')].find((x) => x.offsetParent !== null) || null;
      if (h1) { ioT = new IntersectionObserver(([e]) => barra.classList.toggle('cab-con-titulo', !e.isIntersecting && e.boundingClientRect.top < e.rootBounds.top), { root: cuerpo, threshold: 0 }); ioT.observe(h1); }
      hs = [...cuerpo.querySelectorAll('h2[id^="esc-h-"]')].filter((x) => x.offsetParent !== null);
      if (hs.length) { ioA = new IntersectionObserver(pinta, { root: cuerpo, rootMargin: '0px 0px -60% 0px', threshold: 0 }); hs.forEach((x) => ioA.observe(x)); }
      pinta();
    };
    cuerpo.addEventListener('scrollend', pinta, { passive: true });
    mira();
    let t = 0; new MutationObserver(() => { clearTimeout(t); t = setTimeout(mira, 400); }).observe(cuerpo, { childList: true, subtree: true });
  }
  const busca = () => {
    const ini = document.getElementById('nuc-ini'); if (ini) portada(ini);
    for (const id of ['escaner', 'vpn']) { const s = document.getElementById(id); if (s) seccion(s); }
  };
  new MutationObserver(busca).observe(document.body, { childList: true });
  busca();
})();
