// GUARDIANA · NÚCLEO · «Resumen de tus datos» en vídeo (27 Oct 2026).
// Dueño: el resumen de mis datos también en vídeo, para un periodo elegido («La última web», «La última hora», «Las últimas
// 24 horas»), y «simplificar al máximo, que 24 horas va a ir muy lleno». Se hace entero en el navegador de la persona con lo
// que el navegador ZERO guarda aquí (localStorage: zeroRegistroCortes, zeroRadiografia, zeroTotal). No se envía nada: lo
// único que se pide a la red son las fuentes de letra de esta misma web (/fonts/).
//
// window.GuardianaResumen
//   .datos(periodo, T, loc) -> números y listas cortas del periodo, o null si en él no hay nada.
//       periodo: 'web' (la última web, desde que se abrió en su última visita), 'hora' (60 min) o '24h' (24 horas).
//       Para el PDF lleva también .todas (empresas, países y webs enteras) y .registros (cada conexión {t, w, e, p, m, s}).
//   .video(datos, { T, loc, lienzo, onProgreso, signal, origen, rutaFuentes }) -> Promise<{ blob, tipo, ext, codec, duracion, nombre }>
//       Anima en `lienzo` (la persona lo ve hacerse) mientras MediaRecorder graba lienzo.captureStream(30): MP4/H.264 si el
//       navegador lo graba; si no, WebM VP9 y después VP8. 1280×720, 21,4 s, 4 Mbps, sin sonido. onProgreso(0…1, escena).
//       Si la pestaña se oculta, la grabación se pausa y sigue al volver (el vídeo sale seguido). Sin MediaRecorder o sin
//       formato: Error con .codigo 'sin-grabadora' o 'sin-formato'. `signal` (AbortSignal) lo cancela ('cancelado').
//       `origen`: [lat, lon] o false; si no se da, la zona aproximada sale de la zona horaria (sin ella, no hay arcos).
//   .cartel(datos, t, { T, loc, lienzo, origen }) -> Promise: dibuja solo el cuadro del segundo t (vista previa o cartel).
//   .formato() -> { tipo, ext } que se usaría aquí, o null.   .duracion -> segundos del vídeo.
// Con prefers-reduced-motion el vídeo se hace igual: es un archivo.
//
// Textos que pasan por T (en español; {1} es el número o el nombre que se pone en su sitio):
//   'Resumen de tus datos'   'La última web'   'La última hora'   'Las últimas 24 horas'   'La última web: {1}'
//   'En una web: {1}'   'En {1} webs'
//   'Países'   'De qué países eran las empresas'   'conexión'   'conexiones'   '{1} cortada'   '{1} cortadas'
//   '{1} sin país identificado'   'No hay conexiones registradas en este periodo.'
//   'Ninguna conexión tiene un país identificado.'
//   'Empresas'   'Las que más se conectaron'   'y {1} empresa más'   'y {1} empresas más'
//   'En cifras'   'Lo más destacado'   'Cortes'   'Subastas'   'Lecturas del equipo'   'Cookies'
//   'de {1} conexión'   'de {1} conexiones'   '{1} permitida'   '{1} permitidas'   '{1} empresa pujó'   '{1} empresas pujaron'
//   'Puja más alta (CPM)'   'intentos de reconocer el equipo sin cookies'   'de otras empresas'
//   'CPM: lo que una empresa ofrecía por mostrar su anuncio mil veces, según la propia página. No es el precio de tus datos.'
//   'Se guarda solo en este navegador'   'GUARDIANA · NÚCLEO'
//   'País no identificado'   'No identificada'
//   Errores: 'Este navegador no puede grabar vídeo.'   'No hay datos en este periodo.'   'Ya se está haciendo un vídeo.'
//            'No se ha podido grabar el vídeo.'   'Se ha cancelado el vídeo.'
// También pasan por T los textos que ZERO escribe en los datos: los países ('Estados Unidos', 'Países Bajos'…; los que
// llegan como código ISO, p. ej. 'LV', se nombran con Intl.DisplayNames) y los tipos ('Publicidad', 'Rastreador',
// 'Seguimiento', 'Aviso de cookies', 'Otra empresa', 'Web peligrosa', 'Red local').
'use strict';
(function (raiz) {
  const W = 1280, H = 720, FPS = 30, BITS = 4000000;
  const COL = { fondo: '#06080C', acero: '#9CC3E4', texto: '#F4F6F8', claro: '#dce5ed', sec: '#c9d6e2', sec2: '#a9bccd', panel: 'rgba(12,18,26,.82)', borde: 'rgba(156,195,228,.22)', coral: '#E07A6C', ambar: '#F0C77F', verde: '#5CC98A' };
  const SANS = "'GRV Plex Sans','IBM Plex Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
  const MONO = "'GRV Plex Mono','IBM Plex Mono',ui-monospace,Consolas,monospace";
  const NO_PAIS = 'País no identificado', NO_EMP = 'No identificada', PAUSA_VISITA = 30 * 60000;
  const ETIQUETA = { web: 'La última web', hora: 'La última hora', '24h': 'Las últimas 24 horas' };
  const ESCENAS = [['titulo', 3.2], ['mapa', 6], ['empresas', 5], ['cifras', 4.2], ['cierre', 3]];
  const DUR = ESCENAS.reduce((s, e) => s + e[1], 0);
  // MP4/H.264 primero (móviles y WhatsApp); «video/mp4» a secas, al final: en Chrome puede ser VP9 dentro de MP4, en Safari es H.264
  const FORMATOS = [['video/mp4;codecs=avc1.42E01F', 'mp4'], ['video/mp4;codecs=avc1.4D401F', 'mp4'], ['video/mp4;codecs=avc1', 'mp4'],
    ['video/webm;codecs=vp9', 'webm'], ['video/webm;codecs=vp8', 'webm'], ['video/webm', 'webm'], ['video/mp4', 'mp4']];

  // <datos-mapa> (generado por genera-datos-mapa.py: Natural Earth 1:10m, dominio público, y tzdata, dominio público)
  const MASCARA = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf+Af/AAAAAAAAAAAAAAAAAAAAAAAA///////AAAAADAADgAAAAAAAAAAAAN/+////4AB/gAAAAB8AAAAAAAAAAB9G/4////4AAYAAAEAAPwAAAAAAAAAAfivwAf//4AAAAADgAf/4AHAAAAAAAH/338AP//gAAAAAOBD///+DAAAgDwACfw3/gP//gAAB4AMH///////wAgf////79n4H//AAAf/gL//////////8f//////h+H/gAAAf/7///////////M///////n8D8A+AB+/f///////////Af/////5k8D8AAAH//////////////Af/////gHgA4AAAP7///////////P4AH4P///gH2AAAAAH5//////////2MAADQD///8H+AAAAGCz/////////8A8AAEAB////v/gAAAPDr/////////4A4AAAAAf///v/wAAAbv///////////AwAAAAAP/////wAAAH////////////AgAAAAAH////8YAAAD///////////9AAAAAAAD////8MAAAB///////////9AAAAAAAD////+AAAAB//7ff//////5AAAAAAAD////gAAAAf5vwPP//////jgAAAAAAD////AAAAAfi///v/////+CAAAAAAAD///+AAAAAfCLf/n/////MCAAAAAAAB///8AAAAAOeRf///////mOAAAAAAAB///8AAAAAH/AA///////G8AAAAAAAAf//4AAAAAf/iB///////hgAAAAAAAAP//wAAAAAf/7////////gAAAAAAAAAP/owAAAAA/////f/////gAAAAAAAAAF/AQAAAAB///+/v/////AAAAAAAAAAC+AAAAAAD/////2/////gAAAAAAAAAAeAwAAAAD////f/D///+gAAAAAAAAAAfGOAAAAH//////B/z/wAAAAAAAAAAAPMBwAAAD////v+A/h+gAAAAAAAAAAAH8AAAAAD////38A/B/AgAAAAAAAAAAAfAAAAAH/////wAcAfggAAAAAAAAAAAHAAAAAH////+AAcAfgwAAAAAAAAAAABD4AAAD/////wAMAXAYAAAAAAAAAAAA//AAAB/////gAOASAYAAAAAAAAAAAAH/gAAA/////gACAICIAAAAAAAAAAAAH/8AAAfH///AAAAsHAAAAAAAAAAAAAH/+AAAAB///AAAA8OAAAAAAAAAAAAAP/+AAAAB//8AAAAc+gAAAAAAAAAAAAf//gAAAD//4AAAAMexgAAAAAAAAAAAP//8AAAB//wAAAAOdg/AAAAAAAAAAAf///AAAA//wAAAACAQPkAAAAAAAAAAP///gAAA//wAAAAB4AHwAAAAAAAAAAP///gAAA//wAAAAADoDYAAAAAAAAAAH///AAAAf/wAAAAAAAAAAAAAAAAAAAD//+AAAA//wgAAAAABxAAAAAAAAAAAD//+AAAA//5gAAAAAPxgAAAAAAAAAAA//+AAAA//zgAAAAAf/gAAAAAAAAAAAf/8AAAA//DgAAAAA//wAAAAAAAAAAAf/8AAAAf/DAAAAAD//4AAAAAAAAAAAf/4AAAAf/DAAAAAH//8AAAAAAAAAAAf/AAAAAf+DAAAAAH//+AAAAAAAAAAA//AAAAAf+AAAAAAH//+AAAAAAAAAAA//AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAH4AAAAAAH//+AAAAAAAAAAA/8AAAAAHwAAAAAAD4f8AAAAAAAAAAA/4AAAAAAAAAAAAACAP8AAAAAAAAAAB/wAAAAAAAAAAAAAAAD4AEAAAAAAAAB/gAAAAAAAAAAAAAAABAAGAAAAAAAAB+AAAAAAAAAAAAAAAAAwAMAAAAAAAAB8AAAAAAAAAAAAAAAAAQAYAAAAAAAAB4AAAAAAAAAAAAAAAAAABwAAAAAAAAD4AAAAAAAAAAAAAAAAAAAgAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'; // 180 x 90 celdas de 2°, 1 bit cada una, de norte a sur y de oeste a este
  const CENTROS = 'AD42.5 1.6|AE23.9 54.3|AF33.8 66|AG17.1 -61.8|AI18.2 -63.1|AL41.1 20|AM40.3 45|AO-12.3 17.6|AR-34.5 -65|AS-14.3 -170.7|AT47.6 14.1|AU-25.2 134.3|AW12.5 -70|AX60.2 20.1|AZ40.3 47.7|BA44.2 17.8|BB13.2 -59.6|BD23.8 90.3|BE50.6 4.7|BF12.3 -1.8|BG42.8 25.2|BH26.1 50.5|BI-3.4 29.9|BJ9.6 2.4|BL17.9 -62.8|BM32.3 -64.8|BN4.5 114.8|BO-16.7 -64.7|BR-10.5 -53.1|BS24.5 -77.9|BT27.4 90.4|BW-22.2 23.8|BY53.5 28.1|BZ17.2 -88.7|CA57.3 -98.2|CD-2.8 23.6|CF6.5 20.5|CG-0.8 15.2|CH46.8 8.2|CI7.6 -5.6|CK-21.2 -159.8|CL-36.9 -71.3|CM5.7 12.7|CN35.9 103.6|CO3.9 -73.1|CR10 -84.2|CU21.6 -79|CV15.1 -23.6|CW12.2 -69|CY34.9 32.9|CZ49.7 15.2|DE51.1 10.4|DJ11.7 42.6|DK56.1 9.5|DM15.4 -61.4|DO18.9 -70.5|DZ28 2.6|EC-1.5 -78.4|EE58.7 25.4|EG26.4 29.9|EH24.2 -12.3|ER15.3 38.9|ES40.3 -3.5|ET8.6 39.6|FI64.2 26.2|FJ-17.8 178|FK-51.8 -58.8|FM6.9 158.2|FO62.1 -6.8|FR46.5 2.4|GA-0.6 11.8|GB53.9 -2.6|GD12.1 -61.7|GE42.2 43.4|GG49.5 -2.6|GH7.9 -1.2|GI36.1 -5.3|GL72.8 -41.5|GM13.4 -15.4|GN10.4 -11|GQ1.6 10.5|GR39.3 22.6|GS-54.3 -36.7|GT15.7 -90.4|GU13.4 144.8|GW12 -15|GY4.8 -59|HK22.4 114.1|HM-53.1 73.5|HN14.8 -86.6|HR45.1 16.3|HT19 -72.8|HU47.2 19.4|ID-0.2 114|IE53.2 -8.2|IL31.3 35|IM54.2 -4.5|IN22.6 79.5|IO-7.3 72.4|IQ33 43.7|IR32.4 54.3|IS65 -18.7|IT42.8 12.5|JE49.2 -2.1|JM18.2 -77.3|JO31.2 36.8|JP35.8 136.5|KE0.6 37.9|KG41.4 74.5|KH12.7 104.9|KI1.9 -157.4|KM-11.7 43.3|KN17.3 -62.7|KP40.1 127.2|KR36.3 127.8|KW29.3 47.6|KY19.3 -81.2|KZ47.9 67.3|LA18.5 103.8|LB33.9 35.8|LC13.9 -61|LI47.2 9.5|LK7.6 80.7|LR6.5 -9.4|LS-29.6 28.2|LT55.3 23.9|LU49.7 6.1|LV56.8 24.9|LY27 18|MA29.7 -8.6|MC43.7 7.4|MD47.2 28.5|ME42.8 19.3|MF18.1 -63|MG-19.3 46.7|MH7.1 171.2|MK41.6 21.7|ML17.3 -3.5|MM21 96.5|MN46.7 103.1|MO22.2 113.6|MP15.1 145.7|MR20.2 -10.3|MS16.7 -62.2|MT35.9 14.4|MU-20.3 57.6|MV6.8 73.1|MW-13.2 34.3|MX23.8 -102.4|MY3.6 114.7|MZ-17.2 35.6|NA-22.1 17.2|NC-21.3 165.5|NE17.4 9.4|NF-29 167.9|NG9.6 8.1|NI12.8 -85|NL52.3 5.6|NO64.1 13.2|NP28.2 83.9|NR-0.5 166.9|NU-19.1 -169.9|NZ-43.9 170.6|OM20.5 56.1|PA8.5 -80.1|PE-9.2 -74.4|PF-17.7 -149.4|PG-6.6 144.3|PH15.6 121.5|PK29.8 69.3|PL52.1 19.4|PM47 -56.3|PN-24.4 -128.3|PR18.2 -66.4|PS31.9 35.2|PT39.7 -8|PW7.4 134.5|PY-23.2 -58.4|QA25.3 51.2|RO45.8 25|RS44.2 20.8|RU60.1 97.4|RW-2 29.9|SA24 44.6|SB-9.6 160.2|SC-9.4 46.4|SD15.9 29.9|SE62.3 16.5|SG1.4 103.8|SH-7.9 -14.4|SI46.1 14.8|SK48.7 19.5|SL8.5 -11.8|SM43.9 12.4|SN14.4 -14.5|SO6.1 46|SR4.1 -55.9|SS7.3 30.3|ST0.2 6.6|SV13.7 -88.9|SX18 -63.1|SY35 38.5|SZ-26.6 31.5|TC21.8 -71.9|TD15.3 18.7|TF-49.3 69.5|TG8.5 1|TH15 101|TJ38.5 71|TL-8.8 125.9|TM39.1 59.4|TN34.1 9.6|TO-21.2 -175.2|TR39 35.1|TT10.4 -61.3|TV-8.5 179.2|TW23.7 121|TZ-6.3 34.8|UA49.1 31.3|UG1.3 32.4|UM19.3 166.6|US39.1 -98.9|UY-32.8 -56|UZ41.7 63.2|VA41.9 12.5|VC13.2 -61.2|VE7.1 -66.2|VG18.4 -64.6|VI17.7 -64.7|VN16.7 106.6|VU-15.2 166.9|WF-14.3 -178.1|WS-13.6 -172.4|XK42.5 20.9|YE15.9 47.5|ZA-28.9 25.1|ZM-13.4 27.8|ZW-19 29.8';
  const NOMBRES = 'Estados Unidos:US|Reino Unido:GB|Alemania:DE|Francia:FR|España:ES|Italia:IT|Países Bajos:NL|Irlanda:IE|Suiza:CH|Suecia:SE|Noruega:NO|Dinamarca:DK|Finlandia:FI|Polonia:PL|Chequia:CZ|Austria:AT|Bélgica:BE|Portugal:PT|Israel:IL|India:IN|China:CN|Japón:JP|Corea del Sur:KR|Singapur:SG|Australia:AU|Canadá:CA|Brasil:BR|México:MX|Argentina:AR|Colombia:CO|Chile:CL|Rusia:RU|Turquía:TR|Luxemburgo:LU|Eslovenia:SI|Estonia:EE|Lituania:LT|Chipre:CY|Hong Kong:HK|Taiwán:TW|Emiratos Árabes Unidos:AE|Sudáfrica:ZA|Nueva Zelanda:NZ|Ucrania:UA|Hungría:HU|Rumanía:RO|Bulgaria:BG|Grecia:GR|República Checa:CZ|Estados Unidos de América:US|EE. UU.:US|EEUU:US|Holanda:NL|Corea:KR|Rumania:RO|Vietnam:VN|Irán:IR|Arabia Saudita:SA|Arabia Saudí:SA|Catar:QA|Taiwan:TW|Macao:MO';
  const ZONAS = {"Africa":"Abidjan 5 -4,Accra 6 0,Addis_Ababa 9 39,Algiers 37 3,Asmara 15 39,Asmera 15 39,Bamako 13 -8,Bangui 4 19,Banjul 13 -17,Bissau 12 -16,Blantyre -16 35,Brazzaville -4 15,Bujumbura -3 29,Cairo 30 31,Casablanca 34 -8,Ceuta 36 -5,Conakry 10 -14,Dakar 15 -17,Dar_es_Salaam -7 39,Djibouti 12 43,Douala 4 10,El_Aaiun 27 -13,Freetown 8 -13,Gaborone -25 26,Harare -18 31,Johannesburg -26 28,Juba 5 32,Kampala 0 32,Khartoum 16 33,Kigali -2 30,Kinshasa -4 15,Lagos 6 3,Libreville 0 9,Lome 6 1,Luanda -9 13,Lubumbashi -12 27,Lusaka -15 28,Malabo 4 9,Maputo -26 33,Maseru -29 28,Mbabane -26 31,Mogadishu 2 45,Monrovia 6 -11,Nairobi -1 37,Ndjamena 12 15,Niamey 14 2,Nouakchott 18 -16,Ouagadougou 12 -2,Porto-Novo 6 3,Sao_Tome 0 7,Timbuktu 13 -8,Tripoli 33 13,Tunis 37 10,Windhoek -23 17","America":"Adak 52 -177,Anchorage 61 -150,Anguilla 18 -63,Antigua 17 -62,Araguaina -7 -48,Argentina/Buenos_Aires -35 -58,Argentina/Catamarca -28 -66,Argentina/ComodRivadavia -28 -66,Argentina/Cordoba -31 -64,Argentina/Jujuy -24 -65,Argentina/La_Rioja -29 -67,Argentina/Mendoza -33 -69,Argentina/Rio_Gallegos -52 -69,Argentina/Salta -25 -65,Argentina/San_Juan -32 -69,Argentina/San_Luis -33 -66,Argentina/Tucuman -27 -65,Argentina/Ushuaia -55 -68,Aruba 12 -70,Asuncion -25 -58,Atikokan 49 -92,Atka 52 -177,Bahia -13 -39,Bahia_Banderas 21 -105,Barbados 13 -60,Belem -1 -48,Belize 18 -88,Blanc-Sablon 51 -57,Boa_Vista 3 -61,Bogota 5 -74,Boise 44 -116,Buenos_Aires -35 -58,Cambridge_Bay 69 -105,Campo_Grande -20 -55,Cancun 21 -87,Caracas 10 -67,Catamarca -28 -66,Cayenne 5 -52,Cayman 19 -81,Chicago 42 -88,Chihuahua 29 -106,Ciudad_Juarez 32 -106,Coral_Harbour 49 -92,Cordoba -31 -64,Costa_Rica 10 -84,Coyhaique -46 -72,Creston 49 -117,Cuiaba -16 -56,Curacao 12 -69,Danmarkshavn 77 -19,Dawson 64 -139,Dawson_Creek 56 -120,Denver 40 -105,Detroit 42 -83,Dominica 15 -61,Edmonton 54 -113,Eirunepe -7 -70,El_Salvador 14 -89,Ensenada 33 -117,Fort_Nelson 59 -123,Fort_Wayne 40 -86,Fortaleza -4 -38,Glace_Bay 46 -60,Godthab 64 -52,Goose_Bay 53 -60,Grand_Turk 21 -71,Grenada 12 -62,Guadeloupe 16 -62,Guatemala 15 -91,Guayaquil -2 -80,Guyana 7 -58,Halifax 45 -64,Havana 23 -82,Hermosillo 29 -111,Indiana/Indianapolis 40 -86,Indiana/Knox 41 -87,Indiana/Marengo 38 -86,Indiana/Petersburg 38 -87,Indiana/Tell_City 38 -87,Indiana/Vevay 39 -85,Indiana/Vincennes 39 -88,Indiana/Winamac 41 -87,Indianapolis 40 -86,Inuvik 68 -134,Iqaluit 64 -68,Jamaica 18 -77,Jujuy -24 -65,Juneau 58 -134,Kentucky/Louisville 38 -86,Kentucky/Monticello 37 -85,Knox_IN 41 -87,Kralendijk 12 -68,La_Paz -16 -68,Lima -12 -77,Los_Angeles 34 -118,Louisville 38 -86,Lower_Princes 18 -63,Maceio -10 -36,Managua 12 -86,Manaus -3 -60,Marigot 18 -63,Martinique 15 -61,Matamoros 26 -98,Mazatlan 23 -106,Mendoza -33 -69,Menominee 45 -88,Merida 21 -90,Metlakatla 55 -132,Mexico_City 19 -99,Miquelon 47 -56,Moncton 46 -65,Monterrey 26 -100,Montevideo -35 -56,Montreal 44 -79,Montserrat 17 -62,Nassau 25 -77,New_York 41 -74,Nipigon 44 -79,Nome 65 -165,Noronha -4 -32,North_Dakota/Beulah 47 -102,North_Dakota/Center 47 -101,North_Dakota/New_Salem 47 -101,Nuuk 64 -52,Ojinaga 30 -104,Panama 9 -80,Pangnirtung 64 -68,Paramaribo 6 -55,Phoenix 33 -112,Port-au-Prince 19 -72,Port_of_Spain 11 -62,Porto_Acre -10 -68,Porto_Velho -9 -64,Puerto_Rico 18 -66,Punta_Arenas -53 -71,Rainy_River 50 -97,Rankin_Inlet 63 -92,Recife -8 -35,Regina 50 -105,Resolute 75 -95,Rio_Branco -10 -68,Rosario -31 -64,Santa_Isabel 33 -117,Santarem -2 -55,Santiago -33 -71,Santo_Domingo 18 -70,Sao_Paulo -24 -47,Scoresbysund 70 -22,Shiprock 40 -105,Sitka 57 -135,St_Barthelemy 18 -63,St_Johns 48 -53,St_Kitts 17 -63,St_Lucia 14 -61,St_Thomas 18 -65,St_Vincent 13 -61,Swift_Current 50 -108,Tegucigalpa 14 -87,Thule 77 -69,Thunder_Bay 44 -79,Tijuana 33 -117,Toronto 44 -79,Tortola 18 -65,Vancouver 49 -123,Virgin 18 -65,Whitehorse 61 -135,Winnipeg 50 -97,Yakutat 60 -140,Yellowknife 54 -113","Arctic":"Longyearbyen 78 16","Asia":"Aden 13 45,Almaty 43 77,Amman 32 36,Anadyr 65 177,Aqtau 45 50,Aqtobe 50 57,Ashgabat 38 58,Ashkhabad 38 58,Atyrau 47 52,Baghdad 33 44,Bahrain 26 51,Baku 40 50,Bangkok 14 101,Barnaul 53 84,Beirut 34 36,Bishkek 43 75,Brunei 5 115,Calcutta 23 88,Chita 52 113,Choibalsan 48 107,Chongqing 31 121,Chungking 31 121,Colombo 7 80,Dacca 24 90,Damascus 34 36,Dhaka 24 90,Dili -9 126,Dubai 25 55,Dushanbe 39 69,Famagusta 35 34,Gaza 32 34,Harbin 31 121,Hebron 32 35,Ho_Chi_Minh 11 107,Hong_Kong 22 114,Hovd 48 92,Irkutsk 52 104,Istanbul 41 29,Jakarta -6 107,Jayapura -3 141,Jerusalem 32 35,Kabul 35 69,Kamchatka 53 159,Karachi 25 67,Kashgar 44 88,Kathmandu 28 85,Katmandu 28 85,Khandyga 63 136,Kolkata 23 88,Krasnoyarsk 56 93,Kuala_Lumpur 3 102,Kuching 2 110,Kuwait 29 48,Macao 22 114,Macau 22 114,Magadan 60 151,Makassar -5 119,Manila 15 121,Muscat 24 59,Nicosia 35 33,Novokuznetsk 54 87,Novosibirsk 55 83,Omsk 55 73,Oral 51 51,Phnom_Penh 12 105,Pontianak 0 109,Pyongyang 39 126,Qatar 25 52,Qostanay 53 64,Qyzylorda 45 65,Rangoon 17 96,Riyadh 25 47,Saigon 11 107,Sakhalin 47 143,Samarkand 40 67,Seoul 38 127,Shanghai 31 121,Singapore 1 104,Srednekolymsk 67 154,Taipei 25 122,Tashkent 41 69,Tbilisi 42 45,Tehran 36 51,Tel_Aviv 32 35,Thimbu 27 90,Thimphu 27 90,Tokyo 36 140,Tomsk 56 85,Ujung_Pandang -5 119,Ulaanbaatar 48 107,Ulan_Bator 48 107,Urumqi 44 88,Ust-Nera 65 143,Vientiane 18 103,Vladivostok 43 132,Yakutsk 62 130,Yangon 17 96,Yekaterinburg 57 61,Yerevan 40 44","Atlantic":"Azores 38 -26,Bermuda 32 -65,Canary 28 -15,Cape_Verde 15 -24,Faeroe 62 -7,Faroe 62 -7,Jan_Mayen 60 11,Madeira 33 -17,Reykjavik 64 -22,South_Georgia -54 -37,St_Helena -16 -6,Stanley -52 -58","Australia":"ACT -34 151,Adelaide -35 139,Brisbane -27 153,Broken_Hill -32 141,Canberra -34 151,Currie -43 147,Darwin -12 131,Eucla -32 129,Hobart -43 147,LHI -32 159,Lindeman -20 149,Lord_Howe -32 159,Melbourne -38 145,NSW -34 151,North -12 131,Perth -32 116,Queensland -27 153,South -35 139,Sydney -34 151,Tasmania -43 147,Victoria -38 145,West -32 116,Yancowinna -32 141","Brazil":"Acre -10 -68,DeNoronha -4 -32,East -24 -47,West -3 -60","Canada":"Atlantic 45 -64,Central 50 -97,Eastern 44 -79,Mountain 54 -113,Newfoundland 48 -53,Pacific 49 -123,Saskatchewan 50 -105,Yukon 61 -135","Chile":"Continental -33 -71,EasterIsland -27 -109","Europe":"Amsterdam 52 5,Andorra 42 2,Astrakhan 46 48,Athens 38 24,Belfast 52 0,Belgrade 45 20,Berlin 52 13,Bratislava 48 17,Brussels 51 4,Bucharest 44 26,Budapest 48 19,Busingen 48 9,Chisinau 47 29,Copenhagen 56 13,Dublin 53 -6,Gibraltar 36 -5,Guernsey 49 -3,Helsinki 60 25,Isle_of_Man 54 -4,Istanbul 41 29,Jersey 49 -2,Kaliningrad 55 20,Kiev 50 31,Kirov 59 50,Kyiv 50 31,Lisbon 39 -9,Ljubljana 46 15,London 52 0,Luxembourg 50 6,Madrid 40 -4,Malta 36 15,Mariehamn 60 20,Minsk 54 28,Monaco 44 7,Moscow 56 38,Nicosia 35 33,Oslo 60 11,Paris 49 2,Podgorica 42 19,Prague 50 14,Riga 57 24,Rome 42 12,Samara 53 50,San_Marino 44 12,Sarajevo 44 18,Saratov 52 46,Simferopol 45 34,Skopje 42 21,Sofia 43 23,Stockholm 59 18,Tallinn 59 25,Tirane 41 20,Tiraspol 47 29,Ulyanovsk 54 48,Uzhgorod 50 31,Vaduz 47 10,Vatican 42 12,Vienna 48 16,Vilnius 55 25,Volgograd 49 44,Warsaw 52 21,Zagreb 46 16,Zaporozhye 50 31,Zurich 47 9","Indian":"Antananarivo -19 48,Chagos -7 72,Christmas -10 106,Cocos -12 97,Comoro -12 43,Kerguelen -49 70,Mahe -5 55,Maldives 4 74,Mauritius -20 58,Mayotte -13 45,Reunion -21 55","Mexico":"BajaNorte 33 -117,BajaSur 23 -106,General 19 -99","Pacific":"Apia -14 -172,Auckland -37 175,Bougainville -6 156,Chatham -44 -177,Chuuk 7 152,Easter -27 -109,Efate -18 168,Enderbury -3 -172,Fakaofo -9 -171,Fiji -18 178,Funafuti -9 179,Galapagos -1 -90,Gambier -23 -135,Guadalcanal -10 160,Guam 13 145,Honolulu 21 -158,Johnston 21 -158,Kanton -3 -172,Kiritimati 2 -157,Kosrae 5 163,Kwajalein 9 167,Majuro 7 171,Marquesas -9 -140,Midway 28 -177,Nauru -1 167,Niue -19 -170,Norfolk -29 168,Noumea -22 166,Pago_Pago -14 -171,Palau 7 134,Pitcairn -25 -130,Pohnpei 7 158,Ponape 7 158,Port_Moresby -10 147,Rarotonga -21 -160,Saipan 15 146,Samoa -14 -171,Tahiti -18 -150,Tarawa 1 173,Tongatapu -21 -175,Truk 7 152,Wake 19 167,Wallis -13 -176,Yap 7 152","US":"Alaska 61 -150,Aleutian 52 -177,Arizona 33 -112,Central 42 -88,East-Indiana 40 -86,Eastern 41 -74,Hawaii 21 -158,Indiana-Starke 41 -87,Michigan 42 -83,Mountain 40 -105,Pacific 34 -118,Samoa -14 -171"};
  // </datos-mapa>

  const yo = (s) => s;
  const pon = (T, tpl, ...xs) => xs.reduce((s, x, i) => s.split('{' + (i + 1) + '}').join(x), T(tpl));
  const lim = (x) => Math.min(1, Math.max(0, x));
  const ease = (x) => 1 - Math.pow(1 - lim(x), 3);
  const ap = (u, d, l) => ease((u - d) / (l || .5));
  const sinTildes = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,()'’]/g, ' ').replace(/\s+/g, ' ').trim();
  const esWeb = (w) => typeof w === 'string' && w.trim() !== '' && w.trim() !== '—';
  const cuenta = (m, k, n) => m.set(k, (m.get(k) || 0) + (n || 1));
  const masVeces = (m) => { let k = null, n = -1; for (const [a, b] of m) if (b > n) { k = a; n = b; } return k; };

  // ---------- países ----------
  let CENT = null, NOMB = null;
  function centros() {
    if (CENT) return CENT;
    CENT = {};
    for (const x of CENTROS.split('|')) { const p = x.slice(2).split(' '); CENT[x.slice(0, 2)] = [+p[0], +p[1]]; }
    return CENT;
  }
  // código ISO2 de un país como lo escribe ZERO ('Estados Unidos', 'Países Bajos'… o el código mismo, 'LV')
  function codigoPais(p) {
    if (!p || p === NO_PAIS) return null;
    const s = String(p).trim(), C = centros();
    if (/^[A-Z]{2}$/.test(s)) return C[s] ? s : null;
    if (!NOMB) {
      NOMB = new Map();
      for (const x of NOMBRES.split('|')) { const i = x.lastIndexOf(':'); NOMB.set(sinTildes(x.slice(0, i)), x.slice(i + 1)); }
      try {
        const dn = new Intl.DisplayNames(['es'], { type: 'region' });
        for (const c in C) { const n = dn.of(c); if (n && n !== c && !NOMB.has(sinTildes(n))) NOMB.set(sinTildes(n), c); }
      } catch (_) {}
    }
    return NOMB.get(sinTildes(s)) || null;
  }
  function nombrePais(p, T, loc) {
    if (!p || p === NO_PAIS) return T(NO_PAIS);
    if (/^[A-Z]{2}$/.test(p)) { try { const n = new Intl.DisplayNames([loc], { type: 'region' }).of(p); if (n && n !== p) return n; } catch (_) {} return p; }
    return T(p);
  }
  // zona aproximada de la persona por su zona horaria (la ciudad de la zona, en grados enteros); sin zona conocida, null
  function zonaAprox() {
    let z = '';
    try { z = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) { return null; }
    const i = z.indexOf('/'), L = i > 0 ? ZONAS[z.slice(0, i)] : null;
    if (!L) return null;
    const c = z.slice(i + 1) + ' ';
    for (const x of L.split(',')) if (x.startsWith(c)) { const p = x.split(' '); return [+p[1], +p[2]]; }
    return null;
  }

  // ---------- formatos con Intl ----------
  function formatos(loc) {
    let nf, df;
    try { nf = new Intl.NumberFormat(loc); } catch (_) { nf = new Intl.NumberFormat('es'); }
    try { df = new Intl.DateTimeFormat(loc, { dateStyle: 'medium', timeStyle: 'short' }); } catch (_) {
      try { df = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (__) { df = new Intl.DateTimeFormat('es'); }
    }
    const n = (x) => nf.format(Math.round(x));
    const rango = (a, b) => {
      if (!(b - a >= 60000)) return df.format(a);
      try { if (typeof df.formatRange === 'function') return df.formatRange(a, b); } catch (_) {}
      return df.format(a) + ' – ' + df.format(b);
    };
    const dinero = (v, mo) => {
      const m = String(mo || '').toUpperCase(), dec = { minimumFractionDigits: 2, maximumFractionDigits: v < .1 ? 3 : 2 };
      if (/^[A-Z]{3}$/.test(m)) { try { return new Intl.NumberFormat(loc, Object.assign({ style: 'currency', currency: m }, dec)).format(v); } catch (_) {} }
      let s; try { s = new Intl.NumberFormat(loc, dec).format(v); } catch (_) { s = String(v); }
      return m ? s + ' ' + m : s;
    };
    return { n, rango, dinero };
  }

  // ---------- los datos del periodo ----------
  const lee = (k) => { try { return JSON.parse(raiz.localStorage.getItem(k)); } catch (_) { return null; } };
  const lista = (x) => (Array.isArray(x) ? x.filter((r) => r && typeof r === 'object' && Number.isFinite(r.t)) : []);
  function datos(periodo, T, loc) {
    T = typeof T === 'function' ? T : yo; loc = loc || 'es';
    if (!ETIQUETA[periodo]) throw new TypeError("GuardianaResumen.datos: el periodo es 'web', 'hora' o '24h'");
    const REG = lista(lee('zeroRegistroCortes')), rx = lee('zeroRadiografia') || {}, tot = lee('zeroTotal');
    const RX = { c: lista(rx.c), s: lista(rx.s), h: lista(rx.h), k: lista(rx.k) };
    const ahora = Date.now();
    let filtro, desde, hasta, web = null;
    if (periodo === 'web') {
      // la última web con algo apuntado y su última visita: hacia atrás mientras sea la misma web y sin pausas de más de 30 min
      const todos = [];
      for (const L of [REG, RX.c, RX.s, RX.h, RX.k]) for (const r of L) if (esWeb(r.w)) todos.push(r);
      if (!todos.length) return null;
      todos.sort((a, b) => a.t - b.t);
      const ult = todos[todos.length - 1];
      web = ult.w.trim();
      let ini = ult.t;
      for (let i = todos.length - 2; i >= 0; i--) { const r = todos[i]; if (r.w.trim() !== web || ini - r.t > PAUSA_VISITA) break; ini = r.t; }
      desde = ini; hasta = ult.t;
      filtro = (r) => typeof r.w === 'string' && r.w.trim() === web && r.t >= desde && r.t <= hasta;
    } else {
      desde = ahora - (periodo === 'hora' ? 3600e3 : 86400e3); hasta = ahora;
      filtro = (r) => r.t >= desde;
    }
    const F = { c: RX.c.filter(filtro), s: RX.s.filter(filtro), h: RX.h.filter(filtro), k: RX.k.filter(filtro) };
    // Las conexiones salen de la Radiografía (cortadas, permitidas y vistas). Los cortes apuntados antes de que existiera la
    // Radiografía en este navegador (zeroRegistroCortes) se suman como cortes; los de después ya están en ella.
    let rxDesde = Infinity;
    for (const r of RX.c) if (r.t < rxDesde) rxDesde = r.t;
    const C = [];
    for (const r of F.c) C.push({ t: r.t, w: r.w, e: r.e, p: r.p, m: r.m, s: r.s === 'c' ? 'c' : r.s === 'p' ? 'p' : 'v' });
    for (const r of REG) if (r.t < rxDesde && filtro(r)) C.push({ t: r.t, w: r.w, e: r.e, p: r.p, m: r.m, s: 'c' });
    if (!C.length && !F.s.length && !F.h.length && !F.k.length) return null;

    let cortes = 0, permitidas = 0, sinPais = 0;
    const emp = new Map(), pai = new Map(), tip = new Map(), webs = new Map();
    for (const x of C) {
      const corte = x.s === 'c' ? 1 : 0;
      cortes += corte; if (x.s === 'p') permitidas++;
      const e = String(x.e || NO_EMP).slice(0, 80);
      let g = emp.get(e); if (!g) emp.set(e, g = { empresa: e, conexiones: 0, cortes: 0, p: new Map(), m: new Map() });
      g.conexiones++; g.cortes += corte;
      const p = typeof x.p === 'string' && x.p.trim() && x.p !== NO_PAIS ? x.p.trim() : null;
      if (p) { cuenta(g.p, p); let q = pai.get(p); if (!q) pai.set(p, q = { pais: p, conexiones: 0, cortes: 0 }); q.conexiones++; q.cortes += corte; } else sinPais++;
      if (x.m) { cuenta(g.m, String(x.m)); let q = tip.get(String(x.m)); if (!q) tip.set(String(x.m), q = { tipo: String(x.m), conexiones: 0, cortes: 0 }); q.conexiones++; q.cortes += corte; }
      if (esWeb(x.w)) cuenta(webs, x.w.trim());
    }
    for (const L of [F.s, F.h, F.k]) for (const r of L) if (esWeb(r.w) && !webs.has(r.w.trim())) webs.set(r.w.trim(), 0);
    const orden = (a, b) => b.conexiones - a.conexiones || b.cortes - a.cortes || String(a.empresa || a.pais || a.tipo).localeCompare(String(b.empresa || b.pais || b.tipo));
    const empresas = [...emp.values()].sort(orden), paises = [...pai.values()].sort(orden);

    // subastas: quién pujó y la puja más alta declarada (CPM), en la moneda con más pujas para no comparar monedas distintas
    const pujaron = new Set(), llamadas = new Set(), monedas = new Map();
    for (const s of F.s) for (const b of Array.isArray(s.pj) ? s.pj : []) {
      if (!b || !b.n) continue;
      llamadas.add(String(b.n));
      const c = typeof b.c === 'number' && Number.isFinite(b.c) && b.c > 0 ? b.c : 0;
      if (b.e === 'ganó' || b.e === 'pujó' || c || b.ci) pujaron.add(String(b.n));
      if (c) { const mo = String(b.mo || '').toUpperCase().slice(0, 8); let g = monedas.get(mo); if (!g) monedas.set(mo, g = { n: 0, valor: 0, moneda: mo, empresa: '' }); g.n++; if (c > g.valor) { g.valor = c; g.empresa = String(b.n); } }
    }
    const mon = [...monedas.values()].sort((a, b) => b.n - a.n || b.valor - a.valor)[0] || null;

    let t0 = Infinity, t1 = -Infinity;
    for (const L of [F.c, F.s, F.h, F.k]) for (const r of L) { if (r.t < t0) t0 = r.t; if (r.t > t1) t1 = r.t; }
    for (const r of REG) if (r.t < rxDesde && filtro(r)) { if (r.t < t0) t0 = r.t; if (r.t > t1) t1 = r.t; }
    const f = formatos(loc), dom = (L) => new Set(L.map((x) => x.d).filter(Boolean)).size;
    const ficha = (g) => { const p = masVeces(g.p), m = masVeces(g.m); return { empresa: g.empresa, nombre: g.empresa === NO_EMP ? T(NO_EMP) : g.empresa, pais: p || NO_PAIS, paisNombre: nombrePais(p, T, loc), tipo: m || '', tipoNombre: m ? T(m) : '', conexiones: g.conexiones, cortes: g.cortes }; };
    const fichaPais = (q) => ({ pais: q.pais, nombre: nombrePais(q.pais, T, loc), codigo: codigoPais(q.pais), conexiones: q.conexiones, cortes: q.cortes });
    return {
      periodo, web, etiqueta: T(ETIQUETA[periodo]), titulo: web ? pon(T, 'La última web: {1}', web) : T(ETIQUETA[periodo]),
      ventana: { desde, hasta }, primero: t0, ultimo: t1,
      rango: periodo === 'web' ? f.rango(t0, t1) : f.rango(desde, hasta), generado: ahora,
      conexiones: C.length, cortes, permitidas, vistas: C.length - cortes - permitidas,
      empresas: { total: empresas.length, top: empresas.slice(0, 6).map(ficha) },
      paises: { total: paises.length, sinPais, top: paises.slice(0, 8).map(fichaPais) },
      tipos: [...tip.values()].sort(orden).map((q) => ({ tipo: q.tipo, nombre: T(q.tipo), conexiones: q.conexiones, cortes: q.cortes })),
      subastas: { total: F.s.length, pujadores: pujaron.size, empresas: llamadas.size, cpmMax: mon ? { valor: mon.valor, moneda: mon.moneda, empresa: mon.empresa, texto: f.dinero(mon.valor, mon.moneda) } : null },
      lecturas: { total: F.h.length, dominios: dom(F.h) },
      cookies: { total: F.k.length, dominios: dom(F.k) },
      webs: { total: webs.size, top: [...webs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w, n]) => ({ web: w, conexiones: n })) },
      desdeSiempre: tot && typeof tot.c === 'number' ? { cortes: tot.c, desde: tot.d || null } : null,
      // para el resumen en PDF de NÚCLEO: las listas enteras y cada conexión del periodo, la más reciente primero
      todas: { empresas: empresas.map(ficha), paises: paises.map(fichaPais), webs: [...webs.entries()].sort((a, b) => b[1] - a[1]).map(([w, n]) => ({ web: w, conexiones: n })) },
      registros: C.slice().sort((a, b) => b.t - a.t),
    };
  }

  // ---------- fuentes (las de NÚCLEO, con un nombre propio para no tocar las de la página) ----------
  let fuentes = null;
  function cargaFuentes(ruta) {
    if (fuentes) return fuentes;
    ruta = ruta || '/fonts/';
    const L = [['GRV Plex Sans', 'IBMPlexSans-400-latin.woff2', '400'], ['GRV Plex Sans', 'IBMPlexSans-500-latin.woff2', '500'], ['GRV Plex Sans', 'IBMPlexSans-600-latin.woff2', '600'],
      ['GRV Plex Mono', 'IBMPlexMono-400-latin.woff2', '400'], ['GRV Plex Mono', 'IBMPlexMono-500-latin.woff2', '500']];
    const todas = Promise.all(L.map(([fam, f, peso]) => {
      try {
        const ff = new FontFace(fam, 'url("' + ruta + f + '") format("woff2")', { weight: peso, style: 'normal' });
        return ff.load().then((x) => { try { document.fonts.add(x); } catch (_) {} return true; }, () => false);
      } catch (_) { return Promise.resolve(false); }
    })).then((r) => r.every(Boolean));
    fuentes = Promise.race([todas, new Promise((r) => setTimeout(() => r(false), 6000))]);
    fuentes.then((ok) => { if (!ok) fuentes = null; });
    return fuentes;
  }

  function eligeFormato(MR) {
    for (const [tipo, ext] of FORMATOS) { try { if (MR.isTypeSupported(tipo)) return { tipo, ext }; } catch (_) {} }
    return null;
  }

  // ---------- la red de NÚCLEO (como red-nucleo.js: 300 puntos en una esfera, cada uno unido a sus 3 vecinos) ----------
  function creaRed() {
    let s = 20261027;
    const azar = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const N = 300, P = [];
    for (let i = 0; i < N; i++) { const y = 1 - (i + .5) * 2 / N, r = Math.sqrt(1 - y * y), a = i * 2.39996323, k = .86 + azar() * .2; P.push([Math.cos(a) * r * k, y * k, Math.sin(a) * r * k, azar() * Math.PI * 2]); }
    const V = P.map((p, i) => P.map((o, j) => [j, (p[0] - o[0]) ** 2 + (p[1] - o[1]) ** 2 + (p[2] - o[2]) ** 2]).filter((x) => x[0] !== i).sort((a, b) => a[1] - b[1]).slice(0, 3).map((x) => x[0]));
    const E = []; for (let i = 0; i < N; i++) for (const j of V[i]) if (j > i || !V[j].includes(i)) E.push([i, j]);
    return { P, E };
  }

  // ---------- el pintor: dibuja el cuadro del segundo t ----------
  const CACHE = { fondo: null, mapa: null, red: null };
  function creaPintor(cx, d, T, loc, origenOp) {
    const f = formatos(loc);
    const up = (s) => { try { return s.toLocaleUpperCase(loc); } catch (_) { return s.toUpperCase(); } };
    const pl = (n, uno, varios) => pon(T, n === 1 ? uno : varios, f.n(n));
    const HAY_LS = 'letterSpacing' in cx;
    const letra = (o) => (o.peso || 400) + ' ' + (o.tam || 20) + 'px ' + (o.mono ? MONO : SANS);
    const esp = (e) => { if (HAY_LS) cx.letterSpacing = (e || 0) + 'px'; };
    function ancho(s, o) {
      cx.font = letra(o); esp(o.esp);
      const w = cx.measureText(s).width + (o.esp && !HAY_LS ? o.esp * Math.max(0, Array.from(s).length - 1) : 0);
      esp(0); return w;
    }
    function corta(s, max, o) {
      if (ancho(s, o) <= max) return s;
      const ch = Array.from(s); let a = 0, b = ch.length;
      while (a < b) { const m = (a + b + 1) >> 1; if (ancho(ch.slice(0, m).join('').trimEnd() + '…', o) <= max) a = m; else b = m - 1; }
      return ch.slice(0, a).join('').trimEnd() + '…';
    }
    // recorta por el medio (para dominios: se ve el principio y el final, «www.periodico-…-largo.co.uk»)
    function cortaMedio(s, max, o) {
      if (ancho(s, o) <= max) return s;
      const ch = Array.from(s), une = (k) => { const i = Math.ceil(k * .45); return ch.slice(0, i).join('') + '…' + ch.slice(ch.length - (k - i)).join(''); };
      let a = 1, b = ch.length - 1;
      while (a < b) { const k = (a + b + 1) >> 1; if (ancho(une(k), o) <= max) a = k; else b = k - 1; }
      return une(a);
    }
    function envuelve(s, max, o, maxLin) {
      const L = []; let cur = '';
      for (const p of String(s).split(/\s+/).filter(Boolean)) { const q = cur ? cur + ' ' + p : p; if (!cur || ancho(q, o) <= max) cur = q; else { L.push(cur); cur = p; } }
      if (cur) L.push(cur);
      const out = [];
      for (const l of L) {
        if (ancho(l, o) <= max) { out.push(l); continue; }
        let c = ''; for (const ch of Array.from(l)) { if (c && ancho(c + ch, o) > max) { out.push(c); c = ch; } else c += ch; }
        if (c) out.push(c);
      }
      if (maxLin && out.length > maxLin) { const r = out.slice(0, maxLin); r[maxLin - 1] = corta(r[maxLin - 1] + ' ' + out.slice(maxLin).join(' '), max, o); return r; }
      return out;
    }
    function txt(s, x, y, o) {
      s = String(s);
      if (o.max) s = corta(s, o.max, o);
      const a = lim(o.a == null ? 1 : o.a); if (a <= .003) return;
      cx.globalAlpha = a; cx.font = letra(o); cx.fillStyle = o.color || COL.texto; cx.textBaseline = 'alphabetic';
      const al = o.alin || 'left', e = o.esp || 0;
      if (!e) { cx.textAlign = al; cx.fillText(s, x, y); return; }
      if (HAY_LS) { esp(e); cx.textAlign = al; cx.fillText(s, x + (al === 'center' ? e / 2 : al === 'right' ? e : 0), y); esp(0); return; }
      const ch = Array.from(s), ws = ch.map((c) => cx.measureText(c).width), tot = ws.reduce((p, q) => p + q, 0) + e * (ch.length - 1);
      let x0 = al === 'center' ? x - tot / 2 : al === 'right' ? x - tot : x;
      cx.textAlign = 'left'; ch.forEach((c, i) => { cx.fillText(c, x0, y); x0 += ws[i] + e; });
    }
    function redondo(x, y, w, h, r) {
      r = Math.min(r, h / 2, w / 2); cx.beginPath();
      if (cx.roundRect) { cx.roundRect(x, y, w, h, r); return; }
      cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath();
    }
    function panel(x, y, w, h, a) {
      if (a <= .003) return;
      cx.globalAlpha = a; redondo(x, y, w, h, 16); cx.fillStyle = COL.panel; cx.fill();
      cx.lineWidth = 1; cx.strokeStyle = COL.borde; redondo(x + .5, y + .5, w - 1, h - 1, 16); cx.stroke();
    }
    function circulo(x, y, r, color, a) { if (a <= .003 || r <= 0) return; cx.globalAlpha = lim(a); cx.fillStyle = color; cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill(); }
    function brillo(x, y, r, a, nucleo) {
      if (a <= .003 || r <= 0) return;
      const g = cx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, nucleo || 'rgba(244,246,248,.9)'); g.addColorStop(.22, 'rgba(156,195,228,.5)'); g.addColorStop(1, 'rgba(156,195,228,0)');
      cx.globalAlpha = lim(a); cx.fillStyle = g; cx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const env = (u, dur) => ap(u, 0, .45) * (1 - ease((u - (dur - .4)) / .4));

    // fondo de NÚCLEO: #06080C y el brillo suave rgba(156,195,228,.10) (radial-gradient(60% 50% at 50% 38%)). Se calcula
    // punto a punto y se redondea con un grano casi invisible: en el lienzo sale sin escalones y en el vídeo comprimido los
    // escalones (anillos de un nivel de gris) se notan menos. Fondo, mapa y red no dependen de los datos: se hacen una vez.
    if (!CACHE.fondo) {
      const fondo = CACHE.fondo = document.createElement('canvas'); fondo.width = W; fondo.height = H;
      const g = fondo.getContext('2d');
      try {
        const im = g.createImageData(W, H), px = im.data;
        let s = 9301;
        const azar = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
        for (let y = 0, i = 0; y < H; y++) {
          const dy = (y + .5 - H * .38) / (H * .5);
          for (let x = 0; x < W; x++, i += 4) {
            const dx = (x + .5 - W / 2) / (W * .6), a = .10 * Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / .7), n = azar() + azar() - 1;
            px[i] = 6 + 150 * a + n; px[i + 1] = 8 + 187 * a + n; px[i + 2] = 12 + 216 * a + n; px[i + 3] = 255;
          }
        }
        g.putImageData(im, 0, 0);
      } catch (_) {
        g.fillStyle = COL.fondo; g.fillRect(0, 0, W, H);
        g.save(); g.translate(W / 2, H * .38); g.scale((W * .6) / (H * .5), 1);
        const rg = g.createRadialGradient(0, 0, 0, 0, 0, H * .5); rg.addColorStop(0, 'rgba(156,195,228,.10)'); rg.addColorStop(.7, 'rgba(156,195,228,0)');
        g.fillStyle = rg; g.fillRect(-W, -H, W * 2, H * 2); g.restore();
      }
    }
    const fondo = CACHE.fondo;

    // textos del periodo
    const VENT = d.ventana || { desde: d.primero, hasta: d.ultimo };
    const RANGO = d.periodo === 'web' ? f.rango(d.primero, d.ultimo) : f.rango(VENT.desde, VENT.hasta);
    const WEB = d.periodo === 'web' && d.web ? String(d.web) : '', SUFIJO = ' · ' + RANGO;
    const PERIODO = WEB ? cortaMedio(WEB, Math.max(140, 620 - ancho(SUFIJO, { tam: 16 })), { tam: 16 }) + SUFIJO : T(ETIQUETA[d.periodo]) + SUFIJO;
    // título: «La última web: marca.com» en una línea; si no cabe, «La última web» y debajo la web, más pequeña
    const TIT = { texto: WEB ? pon(T, 'La última web: {1}', WEB) : T(ETIQUETA[d.periodo]), tam: 56, dom: null };
    while (TIT.tam > 44 && ancho(TIT.texto, TIT) > 1100) TIT.tam -= 2;
    if (ancho(TIT.texto, TIT) > 1100 && WEB) {
      TIT.texto = T(ETIQUETA.web); TIT.tam = 52;
      let tam = 40; while (tam > 28 && ancho(WEB, { tam }) > 1100) tam -= 2;
      TIT.dom = { texto: cortaMedio(WEB, 1100, { tam }), tam };
    }
    const nw = d.webs ? d.webs.total : 0;
    const LINEA3 = d.periodo === 'web' || !nw ? '' : nw === 1 ? pon(T, 'En una web: {1}', cortaMedio(String(d.webs.top[0].web), 860, { tam: 18 })) : pon(T, 'En {1} webs', f.n(nw));

    // la red
    const RED = CACHE.red || (CACHE.red = creaRed());
    function red(x0, y0, R, t, nace, alfa) {
      if (alfa <= .003) return;
      const a1 = t * .42, a2 = .42 + .3 * Math.sin(t * .29), a3 = .2 * Math.sin(t * .21 + 1.3);
      const c1 = Math.cos(a1), s1 = Math.sin(a1), c2 = Math.cos(a2), s2 = Math.sin(a2), c3 = Math.cos(a3), s3 = Math.sin(a3);
      // M = Rz(a3) · Rx(a2) · Ry(a1)
      const A = [[c1, 0, s1], [s2 * s1, c2, -s2 * c1], [-c2 * s1, s2, c2 * c1]];
      const M = [[c3 * A[0][0] - s3 * A[1][0], c3 * A[0][1] - s3 * A[1][1], c3 * A[0][2] - s3 * A[1][2]], [s3 * A[0][0] + c3 * A[1][0], s3 * A[0][1] + c3 * A[1][1], s3 * A[0][2] + c3 * A[1][2]], A[2]];
      const r = R * (.04 + .96 * nace), es = Math.max(.7, R / 120);
      if (nace < 1) {
        const rl = 40 + 60 * nace, g = cx.createRadialGradient(x0, y0, 0, x0, y0, rl);
        g.addColorStop(0, 'rgba(244,246,248,' + (.9 * (1 - nace * .7)) + ')'); g.addColorStop(.3, 'rgba(156,195,228,' + (.55 * (1 - nace * .5)) + ')'); g.addColorStop(1, 'rgba(156,195,228,0)');
        cx.globalAlpha = alfa; cx.fillStyle = g; cx.fillRect(x0 - rl, y0 - rl, rl * 2, rl * 2);
      }
      const Q = RED.P.map((p) => { const pul = 1 + .04 * Math.sin(t * 1.7 + p[3]); return [x0 + (M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2]) * r * pul, y0 + (M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2]) * r * pul, M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2]]; });
      const lin = lim((nace - .25) / .6);
      if (lin > 0) {
        const B = 6, cubos = Array.from({ length: B }, () => []);
        for (const [i, j] of RED.E) { const z = (Q[i][2] + Q[j][2] + 2) / 4; cubos[Math.min(B - 1, Math.max(0, Math.floor(z * B)))].push(i, j); }
        cx.lineWidth = es; cx.strokeStyle = 'rgb(156,195,228)';
        cubos.forEach((L, k) => {
          if (!L.length) return;
          cx.globalAlpha = lim((.08 + .26 * (k + .5) / B) * lin * alfa); cx.beginPath();
          for (let q = 0; q < L.length; q += 2) { const a = Q[L[q]], b = Q[L[q + 1]]; cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); }
          cx.stroke();
        });
      }
      const pa = Math.min(1, nace * 1.4) * alfa;
      for (const q of Q) { const fz = lim((q[2] + 1) / 2); cx.globalAlpha = lim((.25 + .7 * fz) * pa); cx.fillStyle = 'rgb(' + Math.round(210 + 34 * fz) + ',' + Math.round(228 + 18 * fz) + ',248)'; cx.beginPath(); cx.arc(q[0], q[1], (.7 + 1.5 * fz) * es, 0, Math.PI * 2); cx.fill(); }
      const g2 = cx.createRadialGradient(x0, y0, 0, x0, y0, R * 1.25); g2.addColorStop(0, 'rgba(156,195,228,.10)'); g2.addColorStop(1, 'rgba(156,195,228,0)');
      cx.globalAlpha = alfa; cx.fillStyle = g2; cx.fillRect(x0 - R * 1.25, y0 - R * 1.25, R * 2.5, R * 2.5);
    }

    // el mapa de puntos: tierra de la máscara, de 80° N a 56° S, en una rejilla de 2°
    const MP = { x: 80, y: 146, w: 1120, lat0: 80, lat1: -56 };
    const celda = MP.w / 180, fila0 = (90 - MP.lat0) / 2, fila1 = (90 - MP.lat1) / 2;
    MP.h = (fila1 - fila0) * celda;
    const proy = (la, lo) => [MP.x + (lo + 180) / 360 * MP.w, MP.y + (MP.lat0 - la) / 2 * celda];
    if (!CACHE.mapa) {
      const mapa = CACHE.mapa = document.createElement('canvas'); mapa.width = W; mapa.height = H;
      const g = mapa.getContext('2d'), bits = atob(MASCARA);
      g.fillStyle = 'rgba(156,195,228,.24)'; g.beginPath();
      for (let i = fila0; i < fila1; i++) for (let j = 0; j < 180; j++) {
        const k = i * 180 + j;
        if ((bits.charCodeAt(k >> 3) >> (7 - (k & 7))) & 1) { const x = MP.x + (j + .5) * celda, y = MP.y + (i - fila0 + .5) * celda; g.moveTo(x + 1.5, y); g.arc(x, y, 1.5, 0, Math.PI * 2); }
      }
      g.fill();
    }
    const mapa = CACHE.mapa;
    let O = null;
    if (origenOp !== false) { const ll = Array.isArray(origenOp) && origenOp.length === 2 ? origenOp : zonaAprox(); if (ll && Number.isFinite(+ll[0]) && Number.isFinite(+ll[1])) O = proy(+ll[0], +ll[1]); }
    const topP = (d.paises && d.paises.top ? d.paises.top : []).slice(0, 8);
    const pMax = Math.max(1, ...topP.map((p) => p.conexiones));
    const LUCES = topP.map((p, i) => { const c = codigoPais(p.pais), ll = c ? centros()[c] : null; return { i, conexiones: p.conexiones, cortes: p.cortes, nombre: nombrePais(p.pais, T, loc), xy: ll ? proy(ll[0], ll[1]) : null, r: 7 + 17 * Math.sqrt(p.conexiones / pMax) }; });
    const pasoL = LUCES.length ? Math.min(.42, 2.8 / LUCES.length) : 0;
    LUCES.forEach((L) => {
      L.t0 = .9 + L.i * pasoL;
      L.vuelo = O && L.xy && Math.hypot(L.xy[0] - O[0], L.xy[1] - O[1]) > 14 ? .55 : 0;
      L.llega = L.t0 + L.vuelo;
      L.n = f.n(L.conexiones);
      const o = { tam: 18 };
      L.etq = corta(L.nombre, 288 - 16 - 30 - ancho(L.n, { tam: 18, peso: 600 }) - 12, o);
    });
    function arco(A, B, p, a) {
      const dx = B[0] - A[0], dy = B[1] - A[1], dist = Math.hypot(dx, dy), h = Math.min(dist * .3, 170);
      const cx0 = (A[0] + B[0]) / 2, cy0 = Math.max(MP.y - 6, (A[1] + B[1]) / 2 - h);
      const pt = (s) => [(1 - s) * (1 - s) * A[0] + 2 * (1 - s) * s * cx0 + s * s * B[0], (1 - s) * (1 - s) * A[1] + 2 * (1 - s) * s * cy0 + s * s * B[1]];
      const n = Math.max(8, Math.ceil(40 * p));
      cx.globalAlpha = lim(a); cx.strokeStyle = COL.acero; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(A[0], A[1]);
      for (let k = 1; k <= n; k++) { const q = pt(p * k / n); cx.lineTo(q[0], q[1]); }
      cx.stroke();
      return pt(p);
    }
    function luz(L, u, a) {
      if (!L.xy) return;
      const [x, y] = L.xy;
      if (O && L.vuelo) {
        const p = lim((u - L.t0) / L.vuelo);
        if (p > 0) { const c = arco(O, L.xy, p, a * (p < 1 ? .62 : .3)); if (p < 1) { brillo(c[0], c[1], 9, a); circulo(c[0], c[1], 2, COL.texto, a); } }
      }
      const k = u - L.llega; if (k <= 0) return;
      const e = ease(k / .5), r = L.r * (.55 + .45 * e) * (1 + .06 * Math.sin(u * 2.4 + L.i));
      brillo(x, y, r * 1.9, a * e * .9);
      circulo(x, y, 2.6, COL.texto, a * e);
      if (k < 1) { cx.globalAlpha = lim(a * .6 * (1 - k)); cx.strokeStyle = COL.acero; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(x, y, L.r * (.8 + 1.8 * k), 0, Math.PI * 2); cx.stroke(); }
    }
    function leyenda(L, u, a) {
      const x = 64 + (L.i % 4) * 288, y = 618 + (L.i >> 2) * 44, e = a * ap(u, L.llega - .15, .45);
      if (e <= .003) return;
      circulo(x + 4, y - 6, 3.4, L.xy ? COL.texto : COL.sec2, e);
      txt(L.etq, x + 16, y, { tam: 18, color: COL.texto, a: e });
      txt(L.n, x + 288 - 30, y, { tam: 18, peso: 600, color: COL.texto, alin: 'right', a: e });
      const bw = (288 - 30 - 16) * (L.conexiones / pMax) * ease((u - L.llega) / .7);
      cx.globalAlpha = e; cx.fillStyle = 'rgba(156,195,228,.5)'; cx.fillRect(x + 16, y + 11, bw, 3);
      if (L.cortes) { cx.fillStyle = COL.coral; cx.fillRect(x + 16, y + 11, bw * L.cortes / L.conexiones, 3); }
    }

    // empresas
    const EMP = (d.empresas && d.empresas.top ? d.empresas.top : []).slice(0, 6).map((e) => {
      const nombre = e.empresa === NO_EMP ? T(NO_EMP) : e.empresa;
      const sub = [nombrePais(e.pais, T, loc), e.tipo ? T(e.tipo) : ''].filter(Boolean).join(' · ');
      return { nombre: corta(nombre, 350, { tam: 22, peso: 600 }), sub: corta(sub, 350, { tam: 16 }), conexiones: e.conexiones, cortes: e.cortes };
    });
    const eMax = Math.max(1, ...EMP.map((e) => e.conexiones)), MAS = Math.max(0, ((d.empresas && d.empresas.total) || 0) - EMP.length);
    function barra(x, y, w, h, fc, a) {
      cx.globalAlpha = a; cx.fillStyle = 'rgba(156,195,228,.07)'; redondo(x, y, 600, h, h / 2); cx.fill();
      if (w <= 0) return;
      cx.save(); redondo(x, y, w, h, h / 2); cx.clip();
      cx.fillStyle = 'rgba(156,195,228,.62)'; cx.fillRect(x, y, w, h);
      if (fc > 0) { cx.fillStyle = COL.coral; cx.fillRect(x, y, w * fc, h); }
      cx.restore();
    }

    // las cuatro tarjetas
    const S = d.subastas || {}, CPM = S.cpmMax && S.cpmMax.valor > 0 ? f.dinero(S.cpmMax.valor, S.cpmMax.moneda) : '';
    const CARD = [
      { k: 'Cortes', n: d.cortes || 0, color: d.cortes ? COL.coral : COL.sec2, sub: pl(d.conexiones || 0, 'de {1} conexión', 'de {1} conexiones'), extra: d.permitidas ? [pl(d.permitidas, '{1} permitida', '{1} permitidas'), COL.verde] : null },
      { k: 'Subastas', n: S.total || 0, sub: S.pujadores ? pl(S.pujadores, '{1} empresa pujó', '{1} empresas pujaron') : '', dinero: CPM },
      { k: 'Lecturas del equipo', n: (d.lecturas && d.lecturas.total) || 0, sub: T('intentos de reconocer el equipo sin cookies') },
      { k: 'Cookies', n: (d.cookies && d.cookies.total) || 0, sub: T('de otras empresas') },
    ].map((c) => Object.assign(c, {
      color: c.color || (c.n ? COL.texto : COL.sec2),
      tamN: (() => { let t = 72; while (t > 32 && ancho(f.n(c.n), { tam: t }) > 222) t -= 4; return t; })(), // las cifras no se recortan: se achican
      kLin: envuelve(up(T(c.k)), 222, { mono: 1, peso: 500, tam: 14, esp: 2.8 }, 2),
      subLin: c.sub ? envuelve(c.sub, 222, { tam: 17 }, 3) : [],
      extra: c.extra ? [corta(c.extra[0], 222, { tam: 17, peso: 600 }), c.extra[1]] : null,
      dinero: c.dinero ? corta(c.dinero, 222, { tam: 24, peso: 600 }) : '',
    }));
    const NOTA = CPM ? envuelve(T('CPM: lo que una empresa ofrecía por mostrar su anuncio mil veces, según la propia página. No es el precio de tus datos.'), 1000, { tam: 16 }, 2) : [];

    function cabecera(k, tit, u, a) {
      const e = a * ap(u, .05, .5);
      txt(up(T(k)), 64, 66, { mono: 1, peso: 500, tam: 15, esp: 4.2, color: COL.acero, a: e, max: 480 });
      txt(PERIODO, 1216, 66, { tam: 16, color: COL.sec2, alin: 'right', a: e, max: 620 });
      txt(T(tit), 64, 114 + (1 - ap(u, .15, .7)) * 8, { tam: 36, color: COL.claro, a: a * ap(u, .15, .5), max: 1152 });
    }
    function vacio(s, y, a) {
      const lineas = envuelve(s, 760, { tam: 22 }, 2), h = 40 + lineas.length * 30;
      panel(640 - 420, y - h / 2, 840, h, a);
      lineas.forEach((l, i) => txt(l, 640, y - h / 2 + 46 + i * 30, { tam: 22, color: COL.sec, alin: 'center', a }));
    }

    const ESC = {
      titulo(u, dur, t) {
        const sale = 1 - ease((u - (dur - .45)) / .45), k = (dl) => ap(u, dl, .55) * sale, dy = (dl) => (1 - ap(u, dl, .7)) * 10;
        const b = TIT.dom ? -14 : 0, y2 = TIT.dom ? 46 : 0;
        red(640, 232 + b, 112, t, ease((u - .1) / 1.3), sale);
        txt(up(T('Resumen de tus datos')), 640, 422 + b + dy(.5), { mono: 1, peso: 500, tam: 16, esp: 5.1, color: COL.acero, alin: 'center', a: k(.5), max: 1100 });
        txt(TIT.texto, 640, 490 + b + dy(.75), { tam: TIT.tam, color: COL.claro, alin: 'center', a: k(.75), max: 1100 });
        if (TIT.dom) txt(TIT.dom.texto, 640, 490 + b + y2 + dy(.85), { tam: TIT.dom.tam, color: COL.claro, alin: 'center', a: k(.85) });
        txt(RANGO, 640, 536 + b + y2 + dy(1), { tam: 22, color: COL.sec, alin: 'center', a: k(1), max: 1100 });
        if (LINEA3) txt(LINEA3, 640, 574 + b + y2 + dy(1.2), { tam: 18, color: COL.sec2, alin: 'center', a: k(1.2), max: 1100 });
      },
      mapa(u, dur) {
        const a = env(u, dur);
        cabecera('Países', 'De qué países eran las empresas', u, a);
        cx.globalAlpha = a * ap(u, .1, .7); cx.drawImage(mapa, 0, 0);
        if (O) { const e = a * ap(u, .45, .5); brillo(O[0], O[1], 20, e * .7); cx.globalAlpha = lim(e * .85); cx.strokeStyle = COL.acero; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(O[0], O[1], 6.5, 0, Math.PI * 2); cx.stroke(); circulo(O[0], O[1], 2.4, COL.texto, e); }
        for (const L of LUCES) luz(L, u, a);
        const c = d.conexiones || 0;
        txt(f.n(c * ease((u - .8) / 2.9)), 64, 478, { tam: 58, color: COL.texto, a: a * ap(u, .6) });
        txt(c === 1 ? T('conexión') : T('conexiones'), 66, 507, { tam: 18, color: COL.sec2, a: a * ap(u, .7) });
        if (d.cortes) txt(pl(Math.round(d.cortes * ease((u - 1.2) / 2.8)), '{1} cortada', '{1} cortadas'), 66, 540, { tam: 22, peso: 600, color: COL.coral, a: a * ap(u, 1.1) });
        if (d.paises && d.paises.sinPais && LUCES.length) txt(pon(T, '{1} sin país identificado', f.n(d.paises.sinPais)), 66, 567, { tam: 15, color: COL.sec2, a: a * ap(u, 1.4), max: 290 });
        for (const L of LUCES) leyenda(L, u, a);
        if (!LUCES.length) vacio(c ? T('Ninguna conexión tiene un país identificado.') : T('No hay conexiones registradas en este periodo.'), 640, a * ap(u, .6));
      },
      empresas(u, dur) {
        const a = env(u, dur);
        cabecera('Empresas', 'Las que más se conectaron', u, a);
        if (!EMP.length) { vacio(T('No hay conexiones registradas en este periodo.'), 380, a * ap(u, .4)); return; }
        EMP.forEach((E, i) => {
          const y = 160 + i * 74, dl = .35 + i * .14, e = a * ap(u, dl), dy = (1 - ap(u, dl, .7)) * 10, g = ease((u - dl - .1) / .9);
          txt(E.nombre, 64, y + 28 + dy, { tam: 22, peso: 600, color: COL.texto, a: e });
          if (E.sub) txt(E.sub, 64, y + 52 + dy, { tam: 16, color: COL.sec2, a: e });
          barra(440, y + 22 + dy, Math.max(10, 600 * E.conexiones / eMax) * g, 14, E.cortes / E.conexiones, e);
          txt(f.n(E.conexiones * g), 1216, y + 31 + dy, { tam: 24, peso: 600, color: COL.texto, alin: 'right', a: e });
          if (E.cortes) txt(pl(Math.round(E.cortes * g), '{1} cortada', '{1} cortadas'), 1216, y + 54 + dy, { tam: 15, color: COL.coral, alin: 'right', a: e });
          if (i < EMP.length - 1) { cx.globalAlpha = e; cx.fillStyle = 'rgba(156,195,228,.10)'; cx.fillRect(64, y + 70 + dy, 1152, 1); }
        });
        if (MAS) txt(pl(MAS, 'y {1} empresa más', 'y {1} empresas más'), 64, 160 + EMP.length * 74 + 34, { tam: 18, color: COL.sec2, a: a * ap(u, .35 + EMP.length * .14 + .3) });
      },
      cifras(u, dur) {
        const a = env(u, dur), y0 = 216, cw = 270, ch = 282;
        cabecera('En cifras', 'Lo más destacado', u, a);
        CARD.forEach((C, i) => {
          const x = 64 + i * (cw + 24), dl = .25 + i * .13, e = a * ap(u, dl), y = y0 + (1 - ap(u, dl, .7)) * 16;
          panel(x, y, cw, ch, e);
          C.kLin.forEach((l, j) => txt(l, x + 24, y + 44 + j * 20, { mono: 1, peso: 500, tam: 14, esp: 2.8, color: COL.acero, a: e }));
          const ky = y + 44 + (C.kLin.length - 1) * 20;
          txt(f.n(C.n * ease((u - dl - .1) / 1)), x + 22, ky + 88, { tam: C.tamN, color: C.color, a: e });
          let yy = ky + 126;
          for (const l of C.subLin) { txt(l, x + 24, yy, { tam: 17, color: COL.sec, a: e }); yy += 24; }
          if (C.extra) { txt(C.extra[0], x + 24, yy + 4, { tam: 17, peso: 600, color: C.extra[1], a: e }); yy += 28; }
          if (C.dinero) { txt(T('Puja más alta (CPM)'), x + 24, yy + 8, { tam: 15, color: COL.ambar, a: e, max: 222 }); txt(C.dinero, x + 24, yy + 38, { tam: 24, peso: 600, color: COL.ambar, a: e }); }
        });
        NOTA.forEach((l, j) => txt(l, 640, y0 + ch + 58 + j * 24, { tam: 16, color: COL.sec2, alin: 'center', a: a * ap(u, 1.1, .6) }));
      },
      cierre(u, dur, t) {
        const sale = 1 - ease((u - (dur - .7)) / .7), dy = (dl) => (1 - ap(u, dl, .7)) * 10;
        red(640, 278, 118, t, 1, ap(u, 0, .6) * sale);
        txt(T('Se guarda solo en este navegador'), 640, 500 + dy(.35), { tam: 38, color: COL.claro, alin: 'center', a: ap(u, .35, .6) * sale, max: 1100 });
        txt(up(T('GUARDIANA · NÚCLEO')), 640, 552 + dy(.6), { mono: 1, peso: 500, tam: 15, esp: 4.8, color: COL.acero, alin: 'center', a: ap(u, .6, .6) * sale, max: 1100 });
      },
    };

    return function pinta(t) {
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1; cx.drawImage(fondo, 0, 0);
      let t0 = 0;
      for (let i = 0; i < ESCENAS.length; i++) {
        const [nom, dur] = ESCENAS[i];
        if (t < t0 + dur || i === ESCENAS.length - 1) { ESC[nom](Math.min(t - t0, dur), dur, t); cx.globalAlpha = 1; return nom; }
        t0 += dur;
      }
      return '';
    };
  }

  // ---------- WebM: MediaRecorder no escribe la duración; se añade a Info para que los reproductores la sepan ----------
  async function ponDuracion(blob, ms) {
    try {
      const b = new Uint8Array(await blob.slice(0, Math.min(blob.size, 65536)).arrayBuffer());
      const id = (p) => { const x = b[p], n = x & 0x80 ? 1 : x & 0x40 ? 2 : x & 0x20 ? 3 : x & 0x10 ? 4 : 0; if (!n || p + n > b.length) throw 0; let v = 0; for (let i = 0; i < n; i++) v = v * 256 + b[p + i]; return [v, n]; };
      const tam = (p) => { const x = b[p]; let n = 1, m = 0x80; while (n <= 8 && !(x & m)) { n++; m >>= 1; } if (n > 8 || p + n > b.length) throw 0; let v = x & (m - 1), uno = v === m - 1; for (let i = 1; i < n; i++) { v = v * 256 + b[p + i]; if (b[p + i] !== 255) uno = false; } return [uno ? -1 : v, n]; };
      let [i, n] = id(0); if (i !== 0x1A45DFA3) return blob;
      let [t, m] = tam(n); let p = n + m + t;
      [i, n] = id(p); if (i !== 0x18538067) return blob;
      [t, m] = tam(p + n); if (t !== -1) return blob; // Chrome y Firefox escriben el Segment de tamaño desconocido
      p += n + m;
      while (p < b.length - 12) {
        [i, n] = id(p); [t, m] = tam(p + n);
        if (i === 0x114D9B74 || i === 0x1C53BB6B || i === 0x1F43B675 || t < 0) return blob; // SeekHead, Cues o Cluster antes de Info
        if (i === 0x1549A966) {
          const ini = p + n + m, fin = ini + t; if (fin > b.length) return blob;
          let q = ini, escala = 1e6;
          while (q < fin) { const [i2, n2] = id(q), [t2, m2] = tam(q + n2); if (t2 < 0) return blob; if (i2 === 0x4489) return blob; if (i2 === 0x2AD7B1) { let v = 0; for (let k = 0; k < t2; k++) v = v * 256 + b[q + n2 + m2 + k]; escala = v || 1e6; } q += n2 + m2 + t2; }
          const dur = new Uint8Array(11); dur.set([0x44, 0x89, 0x88]); new DataView(dur.buffer).setFloat64(3, ms * 1e6 / escala);
          const cab = new Uint8Array(12); cab.set([0x15, 0x49, 0xA9, 0x66, 0x01]); let v = t + 11; for (let k = 11; k >= 5; k--) { cab[k] = v % 256; v = Math.floor(v / 256); }
          return new Blob([blob.slice(0, p), cab, b.slice(ini, fin), dur, blob.slice(fin)], { type: blob.type });
        }
        p += n + m + t;
      }
    } catch (_) {}
    return blob;
  }

  // ---------- el vídeo ----------
  const error = (T, msg, codigo) => { const e = new Error(T(msg)); e.codigo = codigo; return e; };
  const cancelado = (T) => { const e = error(T, 'Se ha cancelado el vídeo.', 'cancelado'); e.name = 'AbortError'; return e; };
  let ocupado = false;
  async function video(d, op) {
    op = op || {};
    const T = typeof op.T === 'function' ? op.T : yo, loc = op.loc || 'es';
    const avisa = (p, esc) => { try { if (typeof op.onProgreso === 'function') op.onProgreso(p, esc); } catch (_) {} };
    if (!d || typeof d !== 'object' || !ETIQUETA[d.periodo]) throw error(T, 'No hay datos en este periodo.', 'sin-datos');
    const MR = raiz.MediaRecorder, CV = raiz.HTMLCanvasElement;
    const graba = op.lienzo ? typeof op.lienzo.captureStream === 'function' : !!(CV && typeof CV.prototype.captureStream === 'function');
    if (typeof MR !== 'function' || typeof MR.isTypeSupported !== 'function' || !graba) throw error(T, 'Este navegador no puede grabar vídeo.', 'sin-grabadora');
    const fmt = eligeFormato(MR);
    if (!fmt) throw error(T, 'Este navegador no puede grabar vídeo.', 'sin-formato');
    if (ocupado) throw error(T, 'Ya se está haciendo un vídeo.', 'ocupado');
    if (op.signal && op.signal.aborted) throw cancelado(T);
    ocupado = true;
    let lienzo = op.lienzo, propio = false;
    try {
      await cargaFuentes(op.rutaFuentes);
      if (op.signal && op.signal.aborted) throw cancelado(T);
      if (!lienzo) {
        lienzo = document.createElement('canvas'); lienzo.setAttribute('aria-hidden', 'true');
        lienzo.style.cssText = 'position:fixed;left:0;bottom:0;width:4px;height:3px;opacity:.01;pointer-events:none';
        document.body.appendChild(lienzo); propio = true;
      }
      lienzo.width = W; lienzo.height = H;
      const cx = lienzo.getContext('2d', { alpha: false });
      if (!cx) throw error(T, 'Este navegador no puede grabar vídeo.', 'sin-grabadora');
      const pinta = creaPintor(cx, d, T, loc, op.origen);
      pinta(0);
      const r = await grabar(lienzo, pinta, fmt, T, op.signal, avisa);
      const hoy = new Date(), dd = (x) => String(x).padStart(2, '0');
      r.nombre = 'GUARDIANA-resumen-' + d.periodo + '-' + hoy.getFullYear() + '-' + dd(hoy.getMonth() + 1) + '-' + dd(hoy.getDate()) + '.' + r.ext;
      return r;
    } finally {
      ocupado = false;
      if (propio && lienzo && lienzo.parentNode) lienzo.parentNode.removeChild(lienzo);
    }
  }
  function grabar(lienzo, pinta, fmt, T, signal, avisa) {
    return new Promise((resolve, reject) => {
      let flujo = null, rec = null;
      try { flujo = lienzo.captureStream(FPS); rec = new raiz.MediaRecorder(flujo, { mimeType: fmt.tipo, videoBitsPerSecond: BITS }); } catch (_) {
        try { if (flujo) flujo.getTracks().forEach((x) => x.stop()); } catch (__) {}
        reject(error(T, 'Este navegador no puede grabar vídeo.', 'sin-grabadora')); return;
      }
      const trozos = [];
      let t = 0, antes = 0, real0 = 0, pausado = 0, desdePausa = 0, ultimo = 0, durReal = 0, pct = -1;
      let oculto = false, fin = false, cerrado = false, fallo = null, raf = 0, reloj = 0;
      const limpia = () => {
        cerrado = true; if (raf) cancelAnimationFrame(raf); raf = 0; clearInterval(reloj);
        document.removeEventListener('visibilitychange', vis); if (signal) signal.removeEventListener('abort', aborta);
        try { flujo.getTracks().forEach((x) => x.stop()); } catch (_) {}
      };
      const falla = (e) => {
        if (fallo || cerrado) return; fallo = e;
        if (rec.state !== 'inactive') { try { rec.stop(); return; } catch (_) {} }
        limpia(); reject(e);
      };
      const aborta = () => falla(cancelado(T));
      const pide = () => { if (!raf && !cerrado && !fin && !oculto) raf = requestAnimationFrame(cuadro); };
      function vis() {
        if (cerrado || fin) return;
        if (document.hidden) {
          if (!oculto) { oculto = true; desdePausa = performance.now(); try { if (rec.state === 'recording') rec.pause(); } catch (_) {} }
        } else if (oculto) {
          oculto = false; pausado += performance.now() - desdePausa; antes = performance.now();
          try { if (rec.state === 'paused') rec.resume(); } catch (_) {}
          pide();
        }
      }
      function cuadro(ahora) {
        raf = 0; if (cerrado || fin || oculto) return;
        ahora = Math.max(ahora || 0, antes);
        t = Math.min(DUR, t + Math.min(.1, (ahora - antes) / 1000)); antes = ahora; ultimo = performance.now();
        const esc = pinta(t), p = Math.floor(t / DUR * 100);
        if (p !== pct) { pct = p; avisa(Math.min(.99, t / DUR), esc); }
        if (t >= DUR) {
          fin = true; durReal = performance.now() - real0 - pausado + 1000 / FPS;
          setTimeout(() => { try { rec.stop(); } catch (e) { falla(error(T, 'No se ha podido grabar el vídeo.', 'grabacion')); } }, 300);
          return;
        }
        pide();
      }
      rec.ondataavailable = (e) => { if (e.data && e.data.size) trozos.push(e.data); };
      rec.onerror = () => falla(error(T, 'No se ha podido grabar el vídeo.', 'grabacion'));
      rec.onstop = () => {
        limpia();
        if (fallo) { reject(fallo); return; }
        const tipo = fmt.ext === 'mp4' ? 'video/mp4' : 'video/webm', crudo = new Blob(trozos, { type: tipo });
        if (!crudo.size) { reject(error(T, 'No se ha podido grabar el vídeo.', 'grabacion')); return; }
        const ms = durReal || performance.now() - real0 - pausado;
        (fmt.ext === 'webm' ? ponDuracion(crudo, ms) : Promise.resolve(crudo)).then((blob) => {
          avisa(1, 'listo');
          resolve({ blob, tipo, ext: fmt.ext, codec: rec.mimeType || fmt.tipo, duracion: Math.round(ms) / 1000 });
        });
      };
      document.addEventListener('visibilitychange', vis);
      if (signal) signal.addEventListener('abort', aborta);
      try { rec.start(1000); } catch (_) { limpia(); reject(error(T, 'Este navegador no puede grabar vídeo.', 'sin-grabadora')); return; }
      real0 = antes = ultimo = performance.now();
      if (document.hidden) vis();
      pide();
      // si requestAnimationFrame no llega (marco oculto, ahorro de energía) con la pestaña visible, el reloj sigue dibujando
      reloj = setInterval(() => { if (!cerrado && !fin && !oculto && performance.now() - ultimo > 250) cuadro(performance.now()); }, 120);
    });
  }

  // un cuadro suelto del vídeo en `lienzo` (cartel o vista previa antes de grabar); t en segundos, 2,4 = el título entero
  async function cartel(d, t, op) {
    op = op || {};
    const T = typeof op.T === 'function' ? op.T : yo;
    if (!d || typeof d !== 'object' || !ETIQUETA[d.periodo]) throw error(T, 'No hay datos en este periodo.', 'sin-datos');
    if (!op.lienzo || typeof op.lienzo.getContext !== 'function') throw new TypeError('GuardianaResumen.cartel: falta el lienzo');
    await cargaFuentes(op.rutaFuentes);
    op.lienzo.width = W; op.lienzo.height = H;
    const pinta = creaPintor(op.lienzo.getContext('2d', { alpha: false }), d, T, op.loc || 'es', op.origen);
    return pinta(t == null ? 2.4 : Math.max(0, Math.min(DUR, +t || 0)));
  }

  raiz.GuardianaResumen = {
    datos, video, cartel, duracion: DUR,
    pais: (p, T, loc) => nombrePais(p, typeof T === 'function' ? T : yo, loc || 'es'),
    formato:() => (typeof raiz.MediaRecorder === 'function' && typeof raiz.MediaRecorder.isTypeSupported === 'function' ? eligeFormato(raiz.MediaRecorder) : null),
  };
})(window);
