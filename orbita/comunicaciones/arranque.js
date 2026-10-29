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
  try { app = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; } catch (e) {}
  try { vuelve = !!sessionStorage.getItem('gcom-volver'); } catch (e) {}
  // y si el teléfono cerró la app hace poco, también se vuelve a la última pantalla (app.js, guardaUltima)
  try { var u = JSON.parse(localStorage.getItem('gcom-ultima') || 'null'); if (u && Date.now() - u.t < 15 * 60 * 1000) vuelve = true; } catch (e) {}
  if (app) raiz.classList.add('como-app');
  // El manifiesto (29 Oct 2026, 17:58–18:01: en el iPhone, la app añadida desde una invitación nacía vacía). Se crea aquí, antes de
  // que Safari lea ninguno: normalmente el de siempre; en el iPhone, en Safari y con una invitación, uno propio cuya dirección de
  // inicio (absoluta) lleva la invitación dentro, y la dirección de la página también, por si el iPhone toma esa.
  try {
    var inv = (location.hash.match(/^#([ib]=[A-Za-z0-9_-]{43})$/) || [])[1];
    var ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    var l = document.createElement('link'); l.rel = 'manifest'; l.href = '/orbita/comunicaciones/comunicaciones.webmanifest';
    if (inv && ios && !app) {
      var O = location.origin, base = O + '/orbita/comunicaciones/';
      var man = { name: 'GUARDIANA', short_name: 'GUARDIANA', id: base, start_url: base + '?app=1&inv=' + inv + '#' + inv, scope: base, display: 'fullscreen', display_override: ['fullscreen', 'standalone'], orientation: 'portrait', background_color: '#06080C', theme_color: '#06080C', lang: 'es', dir: 'ltr', icons: [{ src: O + '/icon-192.png?v=2', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: O + '/icon-512.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: O + '/icon-maskable-192.png?v=2', sizes: '192x192', type: 'image/png', purpose: 'maskable' }, { src: O + '/icon-maskable-512.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] };
      var u = ''; try { u = URL.createObjectURL(new Blob([JSON.stringify(man)], { type: 'application/manifest+json' })); } catch (e) {}
      l.href = u || 'data:application/manifest+json,' + encodeURIComponent(JSON.stringify(man));
      history.replaceState(null, '', '/orbita/comunicaciones/?app=1&inv=' + inv + '#' + inv);
      window.gcomManifiestoInv = man;
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
