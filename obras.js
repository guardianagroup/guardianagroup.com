/* GUARDIANA · la web, en construcción. Dueño, 27 Oct 2026, 09:29: «Pon toda la web que nadie la pueda utilizar, ponla en
   construcción». Va la primera en cada página: en un navegador sin la marca del dueño, la página se para y se va a
   /obras.html. La marca la pone GUARDIANA en el navegador del dueño. Es un cierre para quien visita la web: las páginas son
   públicas en GitHub, así que no sustituye a cerrar los servidores.
   28 Oct 2026 (dueño: «enlace de acceso para él»): un enlace con ?pase=invitado deja entrar a quien lo abre (su navegador
   recuerda la marca «invitado»), para probar Comunicaciones con personas de confianza mientras la web sigue cerrada.
   Para abrir la web otra vez a todo el mundo: python3 herramientas/obras.py quita (o vaciar este archivo). */
(function () {
  var ok = false;
  try {
    if (/[?&]pase=invitado(?:[&#]|$)/.test(location.search)) {
      localStorage.setItem('guardiana-acceso', 'invitado');
      var q = location.search.replace(/([?&])pase=invitado(&|$)/, function (_, a, b) { return b ? a : ''; });
      history.replaceState(history.state, '', location.pathname + (q === '?' ? '' : q) + location.hash);
    }
  } catch (e) {}
  try { var v = localStorage.getItem('guardiana-acceso'); ok = v === 'dueno' || v === 'invitado'; } catch (e) {}
  if (ok) return;
  try { window.stop(); } catch (e) {}
  try { location.replace('/obras.html'); } catch (e) { location.href = '/obras.html'; }
})();
