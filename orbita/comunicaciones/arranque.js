// Antes del primer fotograma (dueño, 29 Oct 2026, 08:38: «cuando la actualizo… arriba me aparece durante un momento desconectado
// y como que se mueve la parte de arriba. Vigila eso para que no pase»). Va en <head>, antes de pintar nada:
// - la app instalada se ve como app desde el principio (sin «‹ Inicio», con el candado y «GUARDIANA»);
// - mientras app.js decide qué pantalla enseñar (el chat al que se vuelve tras recargar, los contactos o el inicio), no se ve nada a
//   medias: solo el fondo. app.js la descubre en cuanto está lista y, si no llegara, a los 3 segundos se ve igual.
(function () {
  var raiz = document.documentElement, app = false, vuelve = false;
  try { app = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; } catch (e) {}
  try { vuelve = !!sessionStorage.getItem('gcom-volver'); } catch (e) {}
  if (app) raiz.classList.add('como-app');
  if (app || vuelve) {
    raiz.classList.add('arrancando');
    setTimeout(function () { raiz.classList.remove('arrancando'); }, 3000);
  }
})();
