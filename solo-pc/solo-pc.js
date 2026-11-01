/* GUARDIANA · solo en el PC (1 Nov 2026): el aviso en el idioma de la página de la que se vino (?l=); en un PC, a la portada. */
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
    es: ['GUARDIANA solamente está disponible en versión PC.', 'Ábrela desde un ordenador con Windows 10 u 11.', ['Privacidad', '/privacidad.html'], ['Términos', '/terminos.html'], ['Contacto', '/contacto.html']],
    en: ['GUARDIANA is only available as a PC version.', 'Open it on a computer with Windows 10 or 11.', ['Privacy', '/en/privacy.html'], ['Terms', '/en/terms.html'], ['Contact', '/en/contact.html']],
    pt: ['A GUARDIANA só está disponível na versão para PC.', 'Abra em um computador com Windows 10 ou 11.', ['Privacidade', '/pt/privacidade.html'], ['Termos', '/pt/termos.html'], ['Contato', '/pt/contato.html']],
    ja: ['GUARDIANA は PC 版でのみご利用いただけます。', 'Windows 10 または 11 のパソコンで開いてください。'],
    ko: ['GUARDIANA는 PC 버전으로만 이용할 수 있습니다.', 'Windows 10 또는 11 컴퓨터에서 열어 주세요.'],
    'zh-tw': ['GUARDIANA 僅提供電腦版。', '請在搭載 Windows 10 或 11 的電腦上開啟。'],
    vi: ['GUARDIANA chỉ có phiên bản dành cho PC.', 'Hãy mở trên máy tính chạy Windows 10 hoặc 11.'],
    id: ['GUARDIANA hanya tersedia dalam versi PC.', 'Buka di komputer dengan Windows 10 atau 11.'],
    th: ['GUARDIANA ใช้งานได้เฉพาะเวอร์ชันสำหรับพีซีเท่านั้น', 'โปรดเปิดบนคอมพิวเตอร์ที่ใช้ Windows 10 หรือ 11']
  };
  var l = 'es';
  try { l = (new URLSearchParams(location.search).get('l') || 'es').toLowerCase(); } catch (_) {}
  if (l.indexOf('pt') === 0) l = 'pt';
  if (l === 'zh-hant' || l === 'zh-hk') l = 'zh-tw';
  var clave = TXT[l] ? l : (TXT[l.split('-')[0]] ? l.split('-')[0] : 'en');
  var t = TXT[clave], enlaces = t[2] ? t.slice(2) : TXT.en.slice(2);
  addEventListener('DOMContentLoaded', function () {
    document.documentElement.lang = clave;
    document.getElementById('t1').textContent = t[0];
    document.getElementById('t2').textContent = t[1].replace(/Windows (\d+) (\S+) (\d+)/, 'Windows\u00a0$1\u00a0$2\u00a0$3');
    for (var i = 0; i < 3; i++) { var a = document.getElementById('a' + (i + 1)); a.textContent = enlaces[i][0]; a.href = enlaces[i][1]; }
  });
})();
