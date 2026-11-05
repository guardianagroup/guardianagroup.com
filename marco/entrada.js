/* GUARDIANA · solo en el PC (1 Nov 2026). Dueño, 17:30–17:33: «la versión de móvil no quiero que esté disponible… Solamente
   quiero que guardiana funcione en el PC… desde el móvil no se pueda abrir, o desde la tablet… Que aparezca una pantalla y
   diga, guardiana solamente está disponible en versión PC». «No quiero versión móvil. Quiero que se utilice solo en el PC.»

   5 Nov 2026, «leer sí, usar no» (decisión del dueño tras la auditoría SEO, PLAN.md decisión 1, opción A). El rastreador de
   Google es el de teléfono, y hasta hoy este archivo lo mandaba, como a cualquier teléfono, al aviso /solo-pc/ (que lleva
   noindex): ninguna página de la web podía entrar en los buscadores. Desde hoy:
   - La APLICACIÓN sigue siendo solo del PC: Órbita (/orbita/ y sus pantallas, ZERO, Comunicaciones y su verificación), /m/,
     /e/, /chat/ e /inicio/. En un teléfono o una tableta, estas páginas paran su carga y van al aviso, como antes.
   - Las páginas de LECTURA (portada, conocer, cómo funciona, casos, radiografías, empresas, el negocio de tus datos, instalar,
     zero.html, las multas de Órbita, guías, legales, gracias… y sus versiones en/ y pt/) se pueden leer en el teléfono. Arriba
     aparece una franja fija y discreta, en el idioma de la página: «GUARDIANA se usa en el PC. Aquí puedes leer qué hace.» con
     el enlace «Ver cómo instalarla». No tapa nada (la página baja lo que mide la franja), no es una pantalla intersticial
     (Google penaliza las que cubren el contenido en el móvil) y se cierra con una × que se recuerda durante la sesión.
   - Nunca se distingue a Googlebot de las personas: el buscador ve exactamente lo que ve quien pulsa el resultado (lo contrario
     sería «redirección engañosa», que Google sanciona).

   Se carga en el <head> de cada página, antes de que se pinte nada. En un PC (Windows, Mac o Linux, también los portátiles y
   tabletas con Windows, donde corre el programa) no hace nada. Nada sale del aparato.
   (Antes, desde el 30 Oct 2026, este archivo era el «marco de app» del teléfono; marco/entrada.js es una copia de este.) */
(function () {
  'use strict';
  window.GuardianaMarco = { activo: false };
  var UA = navigator.userAgent || '';
  var windows = /Windows NT/.test(UA) && !/Windows Phone/i.test(UA);
  var movilUA = /iPhone|iPod|iPad|Android|Mobile|Tablet|Silk|Kindle|KF[A-Z]{2,4}\b|PlayBook|BlackBerry|BB10|webOS|Opera Mini|IEMobile|Windows Phone/i.test(UA);
  var ipad = /Macintosh/.test(UA) && (navigator.maxTouchPoints || 0) > 1;
  var soloTactil = false;
  try { soloTactil = matchMedia('(any-pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches; } catch (_) {}
  if (windows || !(movilUA || ipad || soloTactil)) return;

  var ruta = location.pathname;
  // La aplicación: lo que se USA. Todo lo demás se LEE. Las multas de Órbita (/orbita/multas/) son una página de lectura.
  var APP = /^\/(orbita\/(?!multas\/|zero\/privacidad-extension\.html)|m\/|e\/|chat\/|inicio\/)/;
  if (!APP.test(ruta)) { lectura(); return; }

  // 2 Nov 2026 (dueño: «Sí, solo desde el QR»; 09:16: «solamente es pasar la llamada»): la página del teléfono (/m/) se abre
  // solo con el código QR que el programa enseña para pasar al teléfono la llamada del PC (versión 1, viaja en el fragmento;
  // al recargar, la pestaña lo guarda solo para sí). Las invitaciones y la sala de casa (versión 2) siguen siendo solo del PC.
  if (/^\/m\/(index\.html)?$/.test(ruta)) {
    var codigo = location.hash.slice(1);
    if (!codigo) { try { codigo = sessionStorage.getItem('guardiana-codigo') || ''; } catch (_) {} }
    var datos = null;
    try { datos = JSON.parse(atob(codigo.replace(/-/g, '+').replace(/_/g, '/'))); } catch (_) {}
    if (datos && datos.v === 1 && !datos.sala) return;
  }

  // 2 Nov 2026, 13:27 (dueño: «hay una opción que es pasar la llamada al teléfono… con un código QR… lo leemos y la videollamada
  // se pasa directamente al teléfono… Esto quiero que lo actives»): el código QR de «Pasar al teléfono» de una videollamada de
  // Comunicaciones lleva a /orbita/comunicaciones/#llevar=<llave>. Esa página, con esa llave, solo enseña la llamada (app.js,
  // arrancaLlevar: ni chats, ni invitaciones, ni nada guardado). Al recargar, la pestaña guarda la llave solo para sí.
  if (/^\/orbita\/comunicaciones\/(index\.html)?$/.test(ruta)) {
    var llave = (location.hash.match(/^#llevar=([A-Za-z0-9_-]{43})(?:\.[A-Za-z0-9_-]{43})?$/) || [])[1] || '';
    if (!llave) { try { llave = sessionStorage.getItem('gcom-llevar') || ''; } catch (_) {} }
    if (/^[A-Za-z0-9_-]{43}$/.test(llave)) { window.GuardianaMarco.llevar = true; return; }
  }

  // el idioma del aviso: el que se eligió en GUARDIANA o el del aparato
  var l = (document.documentElement.getAttribute('lang') || 'es').toLowerCase();
  var g = ''; try { g = localStorage.getItem('guardiana-lang') || ''; } catch (_) {}
  l = (g || navigator.language || l).toLowerCase();
  // que no se cargue ni se ejecute nada más de esta página, y al aviso (sin dejar esta página en el historial)
  try { window.stop(); } catch (_) {}
  location.replace('/solo-pc/?l=' + encodeURIComponent(l));

  /* ---------- la franja de las páginas de lectura ---------- */
  function lectura() {
    window.GuardianaMarco.lectura = true;
    var cerrada = false;
    try { cerrada = sessionStorage.getItem('guardiana-franja') === 'cerrada'; } catch (_) {}
    if (cerrada) return;
    var V = '20261105c';
    // texto · enlace · destino del enlace · nombre de la × (para el lector de pantalla)
    var T = {
      es: ['GUARDIANA se usa en el PC. Aquí puedes leer qué hace.', 'Ver cómo instalarla', '/instalar.html', 'Cerrar este aviso'],
      en: ['GUARDIANA is used on the PC. Here you can read what it does.', 'See how to install it', '/en/install.html', 'Close this notice'],
      pt: ['A GUARDIANA se usa no PC. Aqui você pode ler o que ela faz.', 'Veja como instalá-la', '/pt/instalar.html', 'Fechar este aviso']
    };
    var css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = '/marco/lectura.css?v=' + V;
    (document.head || document.documentElement).appendChild(css);

    var html = document.documentElement, franja = null, texto, enlace, boton;
    // el idioma de la página: es, en o pt (lo que la página declare en <html lang>, también cuando la portada o las páginas
    // de Órbita lo cambian al traducirse); en cualquier otro idioma de la web, en inglés
    function idioma() {
      var c = (html.getAttribute('lang') || 'es').toLowerCase().slice(0, 2);
      return T[c] ? c : 'en';
    }
    function escribe() {
      if (!franja) return;
      var c = idioma(), t = T[c];
      franja.setAttribute('lang', c);
      texto.textContent = t[0];
      // en la propia página de instalar no hace falta el enlace
      if (ruta === t[2] || ruta === t[2].replace(/\.html$/, '')) { enlace.hidden = true; enlace.removeAttribute('href'); }
      else { enlace.hidden = false; enlace.href = t[2]; }
      enlace.textContent = t[1];
      boton.setAttribute('aria-label', t[3]);
      mide();
    }
    function mide() {
      if (!franja) return;
      html.style.setProperty('--gf-alto', franja.offsetHeight + 'px');
    }
    function cierra() {
      try { sessionStorage.setItem('guardiana-franja', 'cerrada'); } catch (_) {}
      if (franja && franja.parentNode) franja.parentNode.removeChild(franja);
      franja = null;
      html.classList.remove('gf-lectura');
      html.style.removeProperty('--gf-alto');
    }
    function pon() {
      if (franja || !document.body) return;
      franja = document.createElement('div');
      franja.className = 'gf-franja';
      franja.setAttribute('role', 'note');
      var p = document.createElement('p');
      texto = document.createElement('span');
      enlace = document.createElement('a');
      p.appendChild(texto); p.appendChild(document.createTextNode(' ')); p.appendChild(enlace);
      boton = document.createElement('button');
      boton.type = 'button';
      boton.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>';
      boton.addEventListener('click', cierra);
      franja.appendChild(p); franja.appendChild(boton);
      document.body.insertBefore(franja, document.body.firstChild);
      html.classList.add('gf-lectura');
      escribe();
      // cuando llega la hoja de estilos cambia la altura; y también al girar el aparato
      css.addEventListener('load', mide);
      addEventListener('resize', mide);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(mide, function () {});
      // la portada y las páginas de Órbita cambian <html lang> al traducirse: la franja cambia con ellas
      try { new MutationObserver(escribe).observe(html, { attributes: true, attributeFilter: ['lang'] }); } catch (_) {}
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pon); else pon();
  }
})();
