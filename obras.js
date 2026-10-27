/* GUARDIANA · la web, en construcción. Dueño, 27 Oct 2026, 09:29: «Pon toda la web que nadie la pueda utilizar, ponla en
   construcción». Va la primera en cada página: sin la llave del dueño, la página se para y se va a /obras.html. La llave se
   guarda en el navegador del dueño al abrir una vez un enlace con ?acceso=…; aquí solo está su huella SHA-256.
   Para abrir la web otra vez a todo el mundo, basta con quitar esta línea de las páginas (o vaciar este archivo). */
(function () {
  var H = 'ff2d13a700df10e599dd29b2ee8eaed384063541b4fa6325e2792fad7789fb2d', K = 'guardiana-acceso';
  function fuera() {
    try { window.stop(); } catch (e) {}
    try { location.replace('/obras.html'); } catch (e) { location.href = '/obras.html'; }
  }
  function huella(s) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  var u = null, a = null, k = null;
  try { u = new URL(location.href); a = u.searchParams.get('acceso'); } catch (e) {}
  try { k = localStorage.getItem(K); } catch (e) {}
  if (!(window.crypto && crypto.subtle && window.TextEncoder)) { fuera(); return; }
  if (a && u) { // la primera vez en este navegador: comprueba la llave, la guarda y la quita de la dirección
    try { document.documentElement.style.visibility = 'hidden'; window.stop(); } catch (e) {}
    huella(a).then(function (h) {
      if (h !== H) { fuera(); return; }
      try { localStorage.setItem(K, a); } catch (e) {}
      u.searchParams.delete('acceso'); location.replace(u.href);
    }, fuera);
    return;
  }
  if (!k || !/^[0-9a-f]{32}$/.test(k)) { fuera(); return; }
  huella(k).then(function (h) { if (h !== H) { try { localStorage.removeItem(K); } catch (e) {} fuera(); } }, fuera);
})();
