// Antes del primer fotograma (dueño, 29 Oct 2026, 08:38: «cuando la actualizo… arriba me aparece durante un momento desconectado
// y como que se mueve la parte de arriba. Vigila eso para que no pase»). Va en <head>, antes de pintar nada:
// - la app instalada se ve como app desde el principio (sin «‹ Inicio», con el candado y «GUARDIANA»);
// - mientras app.js decide qué pantalla enseñar (el chat al que se vuelve tras recargar, los contactos o el inicio), no se ve nada a
//   medias: solo el fondo. app.js la descubre en cuanto está lista. Si no llegara, se ve igual: un segundo y medio después de
//   que la página termine de cargar (con una red lenta los archivos tardan en llegar, y un seguro fijo de 3 s saltaba antes de
//   que app.js supiera qué pantalla enseñar) o, como mucho, a los 8 segundos. app.js cancela el seguro nada más empezar
//   (window.gcomArranque) y pone el suyo.
(function () {
  var raiz = document.documentElement, app = false, vuelve = false, seguro = null, cancelado = false;
  // El teléfono al que se pasa una videollamada (app.js, «Pasar al teléfono»): no deja nada en el almacenamiento del navegador ni
  // toca lo que ya hubiera en él (si esa persona usa GUARDIANA en este mismo navegador, lo suyo sigue igual).
  try {
    if (/^#llevar=[A-Za-z0-9_-]{43}$/.test(location.hash) || /^[A-Za-z0-9_-]{43}$/.test(sessionStorage.getItem('gcom-llevar') || '')) {
      var ls = window.localStorage, S = Storage.prototype, pon = S.setItem, quita = S.removeItem, vacia = S.clear;
      S.setItem = function (k, v) { if (this !== ls) return pon.call(this, k, v); };
      S.removeItem = function (k) { if (this !== ls) return quita.call(this, k); };
      S.clear = function () { if (this !== ls) return vacia.call(this); };
      window.gcomLlevando = true;
    }
  } catch (e) {}
  try { app = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; } catch (e) {}
  try { vuelve = !!sessionStorage.getItem('gcom-volver'); } catch (e) {}
  // y si el teléfono cerró la app hace poco, también se vuelve a la última pantalla (app.js, guardaUltima)
  try { var u = JSON.parse(localStorage.getItem('gcom-ultima') || 'null'); if (u && Date.now() - u.t < 15 * 60 * 1000) vuelve = true; } catch (e) {}
  if (app) raiz.classList.add('como-app');
  // El manifiesto (29 Oct 2026, 17:58–19:04). Se crea aquí, antes de que Safari lea ninguno (WebKit lee el primero y no lo vuelve a
  // leer): normalmente el de siempre; en Safari del iPhone, uno propio cuya dirección de inicio lleva la llave del traspaso
  // («#t=…», solo en el fragmento: nunca llega a ningún servidor). Esa llave se crea la primera vez que Safari abre una invitación y
  // se guarda en Safari; la app que se añade a la pantalla de inicio arranca con ella y recoge el chat (app.js, «traspaso»).
  // En el ordenador, la app que se instala es GUARDIANA entera (dueño, 29 Oct 2026, 19:52: «cuando lo abro me lleva directo a
  // comunicaciones y tendría que abrirme la página web entera… todo»): el manifiesto de la web, que abre NÚCLEO (ZERO, Órbita y
  // Comunicaciones). En el móvil, la app es el chat. Y el chat temporal del navegador del móvil (19:46): pasados 10 minutos sin
  // usarlo, la llave del traspaso ya no vale (app.js borra el chat al arrancar); una invitación nueva trae una llave nueva.
  try {
    var ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    var android = /Android/i.test(navigator.userAgent);
    var l = document.createElement('link'); l.rel = 'manifest'; l.href = (ios || android) ? '/orbita/comunicaciones/comunicaciones.webmanifest' : '/manifest.webmanifest';
    if (ios && !app) {
      var t = null; try { t = localStorage.getItem('gcom-traspaso'); } catch (e) {}
      try { var uso = +localStorage.getItem('gcom-temporal-uso') || 0; if (uso && Date.now() - uso > 10 * 60 * 1000) { t = null; localStorage.removeItem('gcom-traspaso'); } } catch (e) {}
      if (!/^[A-Za-z0-9_-]{43}$/.test(t || '') && /^#i=[A-Za-z0-9_-]{43}$/.test(location.hash)) {
        var b = new Uint8Array(32); crypto.getRandomValues(b); var x = ''; for (var k = 0; k < b.length; k++) x += String.fromCharCode(b[k]);
        t = btoa(x).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        try { localStorage.setItem('gcom-traspaso', t); } catch (e) {}
        window.gcomTraspasoNueva = true; // la de esta invitación (app.js no la borra al limpiar un chat temporal viejo)
      }
      if (/^[A-Za-z0-9_-]{43}$/.test(t || '')) {
        var O = location.origin, base = O + '/orbita/comunicaciones/';
        var man = { name: 'GUARDIANA', short_name: 'GUARDIANA', id: base, start_url: base + '?app=1#t=' + t, scope: base, display: 'fullscreen', display_override: ['fullscreen', 'standalone'], orientation: 'portrait', background_color: '#06080C', theme_color: '#06080C', lang: 'es', dir: 'ltr', icons: [{ src: O + '/icon-192.png?v=2', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: O + '/icon-512.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: O + '/icon-maskable-192.png?v=2', sizes: '192x192', type: 'image/png', purpose: 'maskable' }, { src: O + '/icon-maskable-512.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] };
        var u = ''; try { u = URL.createObjectURL(new Blob([JSON.stringify(man)], { type: 'application/manifest+json' })); } catch (e) {}
        l.href = u || 'data:application/manifest+json,' + encodeURIComponent(JSON.stringify(man));
        window.gcomTraspaso = t; window.gcomManifiestoInv = man;
      }
    }
    document.head.appendChild(l);
  } catch (e) {}
  if (app || vuelve) {
    raiz.classList.add('arrancando');
    var arma = function (ms) { if (cancelado) return; clearTimeout(seguro); seguro = setTimeout(function () { raiz.classList.remove('arrancando'); }, ms); };
    arma(8000);
    addEventListener('load', function () { arma(1500); });
    window.gcomArranque = function () { cancelado = true; clearTimeout(seguro); };
  }
})();
