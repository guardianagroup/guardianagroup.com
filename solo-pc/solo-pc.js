/* GUARDIANA · solo en el PC (1 Nov 2026): el aviso en el idioma de la página de la que se vino (?l=), en los 42 idiomas desde
   el 15 Nov 2026; en un PC, a la portada.
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

  // (15 Nov 2026) el aviso en los 42 idiomas; las páginas legales solo existen en español, inglés y portugués: los demás
  // idiomas llevan sus nombres en su idioma y enlazan a las inglesas
  var EN = ['/en/privacy.html', '/en/terms.html', '/en/contact.html'];
  var TXT = {
    es: ['GUARDIANA solamente está disponible en versión PC.', ['Privacidad', 'Términos', 'Contacto'], ['/privacidad.html', '/terminos.html', '/contacto.html']],
    en: ['GUARDIANA is only available as a PC version.', ['Privacy', 'Terms', 'Contact']],
    pt: ['A GUARDIANA só está disponível na versão para PC.', ['Privacidade', 'Termos', 'Contato'], ['/pt/privacidade.html', '/pt/termos.html', '/pt/contato.html']],
    'pt-pt': ['A GUARDIANA só está disponível na versão para computador.', ['Privacidade', 'Termos', 'Contacto'], ['/pt/privacidade.html', '/pt/termos.html', '/pt/contato.html']],
    ar: ['GUARDIANA متاحة فقط بنسخة الحاسوب.', ['الخصوصية', 'الشروط', 'اتصل بنا']],
    bg: ['GUARDIANA се предлага само във версия за компютър.', ['Поверителност', 'Условия', 'Контакт']],
    bn: ['GUARDIANA শুধু কম্পিউটার সংস্করণে পাওয়া যায়।', ['গোপনীয়তা', 'শর্তাবলি', 'যোগাযোগ']],
    cs: ['GUARDIANA je k dispozici pouze ve verzi pro počítač.', ['Soukromí', 'Podmínky', 'Kontakt']],
    da: ['GUARDIANA findes kun som version til computer.', ['Privatliv', 'Vilkår', 'Kontakt']],
    de: ['GUARDIANA gibt es nur als Version für den Computer.', ['Datenschutz', 'Bedingungen', 'Kontakt']],
    el: ['Η GUARDIANA διατίθεται μόνο σε έκδοση για υπολογιστή.', ['Απόρρητο', 'Όροι', 'Επικοινωνία']],
    fa: ['GUARDIANA فقط در نسخهٔ رایانه در دسترس است.', ['حریم خصوصی', 'شرایط', 'تماس']],
    fi: ['GUARDIANA on saatavilla vain tietokoneversiona.', ['Tietosuoja', 'Ehdot', 'Yhteystiedot']],
    fil: ['Available lang ang GUARDIANA sa bersyon para sa PC.', ['Privacy', 'Mga Tuntunin', 'Makipag-ugnayan']],
    fr: ['GUARDIANA n’est disponible qu’en version pour ordinateur.', ['Confidentialité', 'Conditions', 'Contact']],
    he: ['GUARDIANA זמינה רק בגרסה למחשב.', ['פרטיות', 'תנאים', 'יצירת קשר']],
    hi: ['GUARDIANA केवल कंप्यूटर संस्करण में उपलब्ध है।', ['गोपनीयता', 'शर्तें', 'संपर्क']],
    hr: ['GUARDIANA je dostupna samo u verziji za računalo.', ['Privatnost', 'Uvjeti', 'Kontakt']],
    hu: ['A GUARDIANA csak számítógépes változatban érhető el.', ['Adatvédelem', 'Feltételek', 'Kapcsolat']],
    id: ['GUARDIANA hanya tersedia dalam versi PC.', ['Privasi', 'Ketentuan', 'Kontak']],
    is: ['GUARDIANA er aðeins í boði sem tölvuútgáfa.', ['Persónuvernd', 'Skilmálar', 'Hafa samband']],
    it: ['GUARDIANA è disponibile solo nella versione per computer.', ['Privacy', 'Termini', 'Contatti']],
    ja: ['GUARDIANA は PC 版でのみご利用いただけます。', ['プライバシー', '利用規約', 'お問い合わせ']],
    ko: ['GUARDIANA는 PC 버전으로만 이용할 수 있습니다.', ['개인정보', '약관', '문의']],
    ms: ['GUARDIANA hanya tersedia dalam versi komputer.', ['Privasi', 'Terma', 'Hubungi']],
    nb: ['GUARDIANA finnes bare som versjon for datamaskin.', ['Personvern', 'Vilkår', 'Kontakt']],
    nl: ['GUARDIANA is alleen beschikbaar als computerversie.', ['Privacy', 'Voorwaarden', 'Contact']],
    pl: ['GUARDIANA jest dostępna tylko w wersji na komputer.', ['Prywatność', 'Warunki', 'Kontakt']],
    ro: ['GUARDIANA este disponibilă doar în versiunea pentru computer.', ['Confidențialitate', 'Termeni', 'Contact']],
    ru: ['GUARDIANA доступна только в версии для компьютера.', ['Конфиденциальность', 'Условия', 'Контакты']],
    sk: ['GUARDIANA je dostupná iba vo verzii pre počítač.', ['Súkromie', 'Podmienky', 'Kontakt']],
    sv: ['GUARDIANA finns bara som version för dator.', ['Integritet', 'Villkor', 'Kontakt']],
    sw: ['GUARDIANA inapatikana tu kwa toleo la kompyuta.', ['Faragha', 'Masharti', 'Wasiliana nasi']],
    ta: ['GUARDIANA கணினிப் பதிப்பில் மட்டுமே கிடைக்கிறது.', ['தனியுரிமை', 'விதிமுறைகள்', 'தொடர்பு']],
    te: ['GUARDIANA కంప్యూటర్ వెర్షన్‌లో మాత్రమే అందుబాటులో ఉంది.', ['గోప్యత', 'నిబంధనలు', 'సంప్రదించండి']],
    th: ['GUARDIANA ใช้งานได้เฉพาะเวอร์ชันสำหรับพีซีเท่านั้น', ['ความเป็นส่วนตัว', 'ข้อกำหนด', 'ติดต่อ']],
    tr: ['GUARDIANA yalnızca bilgisayar sürümü olarak kullanılabilir.', ['Gizlilik', 'Koşullar', 'İletişim']],
    uk: ['GUARDIANA доступна лише у версії для комп’ютера.', ['Конфіденційність', 'Умови', 'Контакти']],
    ur: ['GUARDIANA صرف کمپیوٹر ورژن میں دستیاب ہے۔', ['رازداری', 'شرائط', 'رابطہ']],
    vi: ['GUARDIANA chỉ có phiên bản dành cho PC.', ['Quyền riêng tư', 'Điều khoản', 'Liên hệ']],
    'zh-tw': ['GUARDIANA 僅提供電腦版。', ['隱私', '條款', '聯絡我們']],
    zh: ['GUARDIANA 仅提供电脑版。', ['隐私', '条款', '联系我们']]
  };
  var RTL = { ar: 1, fa: 1, he: 1, ur: 1 };
  var l = 'es';
  try { l = (new URLSearchParams(location.search).get('l') || 'es').toLowerCase(); } catch (_) {}
  if (l === 'pt-pt' || l === 'pt-ao' || l === 'pt-mz') l = 'pt-pt';
  else if (l.indexOf('pt') === 0) l = 'pt';
  if (l === 'zh-hant' || l === 'zh-hk' || l === 'zh-mo') l = 'zh-tw';
  if (l === 'no' || l === 'nn') l = 'nb';
  if (l === 'iw') l = 'he';
  if (l === 'tl') l = 'fil';
  var clave = TXT[l] ? l : (TXT[l.split('-')[0]] ? l.split('-')[0] : 'en');
  var t = TXT[clave], nombres = t[1], rutas = t[2] || EN;
  addEventListener('DOMContentLoaded', function () {
    document.documentElement.lang = clave;
    if (RTL[clave]) document.documentElement.dir = 'rtl';
    document.getElementById('t1').textContent = t[0];
    for (var i = 0; i < 3; i++) { var a = document.getElementById('a' + (i + 1)); a.textContent = nombres[i]; a.href = rutas[i]; }
  });
})();
