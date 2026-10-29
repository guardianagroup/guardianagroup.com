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
  if (app || vuelve) {
    raiz.classList.add('arrancando');
    var arma = function (ms) { if (cancelado) return; clearTimeout(seguro); seguro = setTimeout(function () { raiz.classList.remove('arrancando'); }, ms); };
    arma(8000);
    addEventListener('load', function () { arma(1500); });
    window.gcomArranque = function () { cancelado = true; clearTimeout(seguro); };
  }
})();
