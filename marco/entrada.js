/* GUARDIANA · en el teléfono, la portada larga (el relato del planeta) deja paso a Inicio, la pantalla de la app (dueño, 30 Oct
   2026, 15:27 y 18:37; ronda 85). Se carga en el <head> de la portada, antes de que se pinte nada. En el PC no hace nada.
   ?marco=0 enseña la web de siempre en esta visita. */
(function () {
  try {
    var q = new URLSearchParams(location.search), m = q.get('marco');
    if (m === '0' || m === '1') sessionStorage.setItem('guardiana-marco', m);
    var pide = sessionStorage.getItem('guardiana-marco');
    if (pide === '0') return;
    var UA = navigator.userAgent || '', corto = Math.min(screen.width, screen.height) < 600;
    var tactil = false; try { tactil = matchMedia('(pointer: coarse)').matches; } catch (_) {}
    var movil = /iPhone|iPod|Android.+Mobile|Mobile.+Firefox/i.test(UA) || (/Android|iPad/i.test(UA) && corto) || (tactil && corto);
    if (!movil && pide !== '1') return;
    var l = q.get('lang') || document.documentElement.getAttribute('data-marco-lang') || '';
    location.replace('/inicio/' + (l ? '?lang=' + encodeURIComponent(l) : ''));
  } catch (e) {}
})();
