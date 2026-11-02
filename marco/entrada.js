/* GUARDIANA · solo en el PC (1 Nov 2026). Dueño, 17:30–17:33: «la versión de móvil no quiero que esté disponible… Solamente
   quiero que guardiana funcione en el PC… desde el móvil no se pueda abrir, o desde la tablet… Que aparezca una pantalla y
   diga, guardiana solamente está disponible en versión PC». «No quiero versión móvil. Quiero que se utilice solo en el PC.»

   Se carga en el <head> de cada página, antes de que se pinte nada. En un teléfono o una tableta para la carga de la página
   (no llega a ejecutarse nada más: ni Comunicaciones, ni Órbita, ni ZERO) y lleva al aviso (/solo-pc/). En un PC (Windows,
   Mac o Linux, también los portátiles y tabletas con Windows, donde corre el programa) no hace nada.
   Quedan abiertos en el teléfono los textos legales (privacidad, términos, contacto y política de firma), a los que lleva el
   propio aviso, y la página de firma del dueño (/firma/, que no carga este archivo). Nada sale del aparato.

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
  if (/^\/((en|pt)\/)?(privacidad|terminos|contacto|politica-firma|privacy|terms|contact|code-signing-policy|privacidade|termos|contato|politica-assinatura)(\.html)?$/.test(ruta)) return;
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
    var llave = (location.hash.match(/^#llevar=([A-Za-z0-9_-]{43})$/) || [])[1] || '';
    if (!llave) { try { llave = sessionStorage.getItem('gcom-llevar') || ''; } catch (_) {} }
    if (/^[A-Za-z0-9_-]{43}$/.test(llave)) { window.GuardianaMarco.llevar = true; return; }
  }

  // el idioma del aviso: el de la página; en las de la app, el que se eligió en GUARDIANA o el del aparato
  var l = (document.documentElement.getAttribute('lang') || 'es').toLowerCase();
  var m = ruta.match(/^\/(en|pt|ja|ko|th|vi|zh-tw|id)\//);
  if (m) l = m[1];
  else if (/^\/(orbita|inicio|m|e|chat)\//.test(ruta)) {
    var g = ''; try { g = localStorage.getItem('guardiana-lang') || ''; } catch (_) {}
    l = (g || navigator.language || l).toLowerCase();
  }
  // que no se cargue ni se ejecute nada más de esta página, y al aviso (sin dejar esta página en el historial)
  try { window.stop(); } catch (_) {}
  location.replace('/solo-pc/?l=' + encodeURIComponent(l));
})();
