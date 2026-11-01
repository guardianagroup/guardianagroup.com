/* GUARDIANA · solo en el PC (1 Nov 2026): el aviso en el idioma de la página de la que se vino (?l=); en un PC, a la portada.
   Dueño, 18:53: sin la frase de «ábrela desde un ordenador con Windows». */
(function () {
  'use strict';
  var UA = navigator.userAgent || '';
  var windows = /Windows NT/.test(UA) && !/Windows Phone/i.test(UA);
  var movilUA = /iPhone|iPod|iPad|Android|Mobile|Tablet|Silk|Kindle|KF[A-Z]{2,4}\b|PlayBook|BlackBerry|BB10|webOS|Opera Mini|IEMobile|Windows Phone/i.test(UA);
  var ipad = /Macintosh/.test(UA) && (navigator.maxTouchPoints || 0) > 1;
  var soloTactil = false;
  try { soloTactil = matchMedia('(any-pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches; } catch (_) {}
  if (windows || !(movilUA || ipad || soloTactil)) { location.replace('/'); return; }

  var TXT = {
    es: ['GUARDIANA solamente está disponible en versión PC.', ['Privacidad', '/privacidad.html'], ['Términos', '/terminos.html'], ['Contacto', '/contacto.html']],
    en: ['GUARDIANA is only available as a PC version.', ['Privacy', '/en/privacy.html'], ['Terms', '/en/terms.html'], ['Contact', '/en/contact.html']],
    pt: ['A GUARDIANA só está disponível na versão para PC.', ['Privacidade', '/pt/privacidade.html'], ['Termos', '/pt/termos.html'], ['Contato', '/pt/contato.html']],
    ja: ['GUARDIANA は PC 版でのみご利用いただけます。'],
    ko: ['GUARDIANA는 PC 버전으로만 이용할 수 있습니다.'],
    'zh-tw': ['GUARDIANA 僅提供電腦版。'],
    vi: ['GUARDIANA chỉ có phiên bản dành cho PC.'],
    id: ['GUARDIANA hanya tersedia dalam versi PC.'],
    th: ['GUARDIANA ใช้งานได้เฉพาะเวอร์ชันสำหรับพีซีเท่านั้น']
  };
  var l = 'es';
  try { l = (new URLSearchParams(location.search).get('l') || 'es').toLowerCase(); } catch (_) {}
  if (l.indexOf('pt') === 0) l = 'pt';
  if (l === 'zh-hant' || l === 'zh-hk') l = 'zh-tw';
  var clave = TXT[l] ? l : (TXT[l.split('-')[0]] ? l.split('-')[0] : 'en');
  var t = TXT[clave], enlaces = t[1] ? t.slice(1) : TXT.en.slice(1);
  addEventListener('DOMContentLoaded', function () {
    document.documentElement.lang = clave;
    document.getElementById('t1').textContent = t[0];
    for (var i = 0; i < 3; i++) { var a = document.getElementById('a' + (i + 1)); a.textContent = enlaces[i][0]; a.href = enlaces[i][1]; }
  });
})();
