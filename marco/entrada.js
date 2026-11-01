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
