/* GUARDIANA · languages for Órbita and ZERO (20 Oct 2026, owner: «the languages go next to Precisar ubicación»).
   The pages are written in Spanish. This file translates what is on screen into English or Portuguese and keeps
   doing it as the pages change; switching back restores the original. It shares the choice with the website
   (guardiana-lang), so a visitor who picked a language there finds it here. Nothing leaves this computer. */
(() => {
  'use strict';
  // 22 Oct 2026 (owner: «dentro de Órbita tienen que aparecer todos los idiomas»): the 42 of the website.
  // code · own name · html lang · locale for numbers and dates · right-to-left
  const IDI = [['es', 'Español', 'es', 'es-CO'], ['en', 'English', 'en', 'en-US'], ['pt', 'Português (Brasil)', 'pt-BR', 'pt-BR'],
    ['fr', 'Français', 'fr', 'fr-FR'], ['de', 'Deutsch', 'de', 'de-DE'], ['it', 'Italiano', 'it', 'it-IT'], ['nl', 'Nederlands', 'nl', 'nl-NL'],
    ['sv', 'Svenska', 'sv', 'sv-SE'], ['da', 'Dansk', 'da', 'da-DK'], ['nb', 'Norsk', 'nb', 'nb-NO'], ['fi', 'Suomi', 'fi', 'fi-FI'], ['is', 'Íslenska', 'is', 'is-IS'], ['pl', 'Polski', 'pl', 'pl-PL'],
    ['uk', 'Українська', 'uk', 'uk-UA'], ['ru', 'Русский', 'ru', 'ru-RU'], ['tr', 'Türkçe', 'tr', 'tr-TR'],
    ['zh', '简体中文', 'zh-Hans', 'zh-CN'], ['ja', '日本語', 'ja', 'ja-JP'], ['ko', '한국어', 'ko', 'ko-KR'],
    ['hi', 'हिन्दी', 'hi', 'hi-IN'], ['bn', 'বাংলা', 'bn', 'bn-BD'], ['id', 'Bahasa Indonesia', 'id', 'id-ID'], ['vi', 'Tiếng Việt', 'vi', 'vi-VN'], ['th', 'ไทย', 'th', 'th-TH'],
    ['ar', 'العربية', 'ar', 'ar-u-nu-latn', 1], ['fa', 'فارسی', 'fa', 'fa-IR', 1], ['he', 'עברית', 'he', 'he-IL', 1], ['ur', 'اردو', 'ur', 'ur-PK', 1],
    ['zh-tw', '繁體中文', 'zh-Hant', 'zh-TW'], ['cs', 'Čeština', 'cs', 'cs-CZ'], ['ro', 'Română', 'ro', 'ro-RO'], ['hu', 'Magyar', 'hu', 'hu-HU'], ['el', 'Ελληνικά', 'el', 'el-GR'],
    ['sk', 'Slovenčina', 'sk', 'sk-SK'], ['bg', 'Български', 'bg', 'bg-BG'], ['hr', 'Hrvatski', 'hr', 'hr-HR'], ['ms', 'Bahasa Melayu', 'ms', 'ms-MY'], ['fil', 'Filipino', 'fil', 'fil-PH'],
    ['sw', 'Kiswahili', 'sw', 'sw-KE'], ['ta', 'தமிழ்', 'ta', 'ta-IN'], ['te', 'తెలుగు', 'te', 'te-IN'], ['pt-pt', 'Português (Portugal)', 'pt-PT', 'pt-PT']];
  // 22 Oct 2026 (owner): «42 idiomas es muy largo: publícala con español e inglés de momento». The other 40 stay
  // ready in the files; only these are offered and chosen until the owner opens the rest (data-idiomas="todos").
  const ABIERTOS = (document.documentElement.dataset.idiomas === 'todos') ? null : ['es', 'en'];
  const IDI_ABIERTOS = ABIERTOS ? IDI.filter((x) => ABIERTOS.includes(x[0])) : IDI;
  const IDIOMAS = IDI_ABIERTOS.map((x) => x[0]);
  const INFO = Object.fromEntries(IDI.map((x) => [x[0], { nombre: x[1], lang: x[2], locale: x[3], rtl: !!x[4] }]));
  // Spanish → [English, Portuguese]. Upper-case versions are found automatically.
  const D = {
    // Órbita
    'GUARDIANA · Órbita': ['GUARDIANA · Orbit', 'GUARDIANA · Órbita'],
    'Órbita': ['Orbit', 'Órbita'],
    'Navegador': ['Browser', 'Navegador'],
    'En construcción': ['Under construction', 'Em construção'],
    'En desarrollo': ['In development', 'Em desenvolvimento'],
    'Radiografías': ['X-Rays', 'Radiografias'],
    'Comunicaciones': ['Communications', 'Comunicações'],
    'El navegador que muestra cada corte, en directo.': ['The browser that shows every cut, live.', 'O navegador que mostra cada corte, ao vivo.'],
    'A qué empresas y países habla tu computador, tu IA y tu antivirus. Llegará cuando esté terminada y probada.': ['Which companies and countries your computer, your AI and your antivirus talk to. It will arrive when it is finished and tested.', 'Com quais empresas e países o seu computador, a sua IA e o seu antivírus falam. Chegará quando estiver pronta e testada.'],
    'Chat, llamadas y archivos cifrados de extremo a extremo. Llegará cuando esté terminada y probada.': ['End-to-end encrypted chat, calls and files. It will arrive when it is finished and tested.', 'Chat, chamadas e arquivos com criptografia de ponta a ponta. Chegará quando estiver pronta e testada.'],
    'Secciones': ['Sections', 'Seções'],
    'Sección': ['Section', 'Seção'],
    'Ajustes': ['Settings', 'Ajustes'],
    'Atrás': ['Back', 'Voltar'],
    'Volver': ['Back', 'Voltar'],
    'Volver a Órbita': ['Back to Orbit', 'Voltar à Órbita'],
    'Idioma': ['Language', 'Idioma'],
    'Vigilando este equipo y la casa': ['Watching this computer and the home', 'Vigiando este computador e a casa'],
    'Cortes de la demostración': ['Demo cuts', 'Cortes da demonstração'],
    'Cortes en 24 h': ['Cuts in 24 h', 'Cortes em 24 h'],
    'Demostración': ['Demo', 'Demonstração'],
    'En directo': ['Live', 'Ao vivo'],
    'Esperando el primer corte. Cada uno aparecerá aquí y sobre el planeta.': ['Waiting for the first cut. Each one will appear here and on the planet.', 'Esperando o primeiro corte. Cada um aparecerá aqui e sobre o planeta.'],
    'Cortado': ['Cut', 'Cortado'],
    'Ver en el planeta': ['See it on the planet', 'Ver no planeta'],
    'Precisar ubicación': ['Set location', 'Definir localização'],
    'Precisar la ubicación de este equipo': ['Set this computer\'s location', 'Definir a localização deste computador'],
    'Ubicación de este equipo': ['This computer\'s location', 'Localização deste computador'],
    '¿En qué ciudad está este equipo?': ['Which city is this computer in?', 'Em que cidade está este computador?'],
    'Para dibujarlo en su sitio. Se mide con la ubicación de tu sistema o lo eliges tú, y siempre lo confirmas. Se guarda solo en este equipo; GUARDIANA no lo envía a nadie.': ['So it is drawn in the right place. It is measured with your system\'s location or you choose it, and you always confirm it. It is stored only on this computer; GUARDIANA sends it to no one.', 'Para desenhá-lo no lugar certo. É medido com a localização do seu sistema ou você escolhe, e sempre confirma. Fica guardado só neste computador; a GUARDIANA não envia a ninguém.'],
    'Busca tu ciudad o municipio': ['Search for your city or town', 'Busque sua cidade ou município'],
    'Cartagena, Medellín, Madrid…': ['Cartagena, Medellín, Madrid…', 'Cartagena, Medellín, Madrid…'],
    'Ciudades': ['Cities', 'Cidades'],
    'Ahora no': ['Not now', 'Agora não'],
    'Detectar ubicación': ['Detect location', 'Detectar localização'],
    'Elegir ciudad': ['Choose city', 'Escolher cidade'],
    'Elegir otra': ['Choose another', 'Escolher outra'],
    'Cancelar': ['Cancel', 'Cancelar'],
    'Cerrar': ['Close', 'Fechar'],
    'Medir de nuevo': ['Measure again', 'Medir de novo'],
    'Olvidar': ['Forget', 'Esquecer'],
    'Sí, es aquí': ['Yes, it\'s here', 'Sim, é aqui'],
    '¿Es aquí?': ['Is it here?', 'É aqui?'],
    'Elige la ciudad de este equipo': ['Choose this computer\'s city', 'Escolha a cidade deste computador'],
    'Elegido por ti': ['Chosen by you', 'Escolhido por você'],
    'elegida por ti': ['chosen by you', 'escolhida por você'],
    'Confírmalo y el planeta lo dibujará en su sitio.': ['Confirm it and the planet will draw it in place.', 'Confirme e o planeta o desenhará no lugar.'],
    'La ubicación de tu sistema lo sitúa allí. ¿Lo cambiamos?': ['Your system\'s location puts it there. Shall we change it?', 'A localização do seu sistema o coloca lá. Mudamos?'],
    'Este navegador no da la ubicación del sistema. Elige la ciudad.': ['This browser does not give the system\'s location. Choose the city.', 'Este navegador não fornece a localização do sistema. Escolha a cidade.'],
    'El sistema no ha dado una ubicación. Elige la ciudad.': ['The system gave no location. Choose the city.', 'O sistema não deu uma localização. Escolha a cidade.'],
    'La ubicación está desactivada o no se ha permitido (en Windows: Configuración › Privacidad › Ubicación). Elige la ciudad, o actívala y vuelve a detectar.': ['Location is off or not allowed (on Windows: Settings › Privacy › Location). Choose the city, or turn it on and detect again.', 'A localização está desativada ou não foi permitida (no Windows: Configurações › Privacidade › Localização). Escolha a cidade, ou ative-a e detecte de novo.'],
    'No se pudo abrir la lista de ciudades.': ['The list of cities could not be opened.', 'Não foi possível abrir a lista de cidades.'],
    'Tu equipo': ['Your computer', 'Seu computador'],
    'Aprox.': ['Approx.', 'Aprox.'],
    'Cifras': ['Figures', 'Números'],
    'Forma de verlo': ['How to see it', 'Forma de ver'],
    'Busca o escribe una dirección': ['Search or type an address', 'Pesquise ou digite um endereço'],
    'Hoy': ['Today', 'Hoje'],
    'Web': ['Web', 'Web'],
    // the planet's layers
    'Capas del planeta': ['Planet layers', 'Camadas do planeta'],
    'Cables submarinos': ['Submarine cables', 'Cabos submarinos'],
    'Acercar el planeta': ['Zoom the planet', 'Aproximar o planeta'],
    'Acercar': ['Zoom in', 'Aproximar'],
    'Cables': ['Cables', 'Cabos'],
    'Centros de datos': ['Data centres', 'Centros de dados'],
    'centro de datos': ['data centre', 'centro de dados'],
    'Lejos de cualquier ciudad': ['Far from any city', 'Longe de qualquer cidade'],
    'Operador': ['Operator', 'Operador'],
    'Centro de datos sin nombre': ['Unnamed data centre', 'Centro de dados sem nome'],
    'centros de datos en esta ciudad': ['data centres in this city', 'centros de dados nesta cidade'],
    'Sin más datos en OpenStreetMap': ['No more details in OpenStreetMap', 'Sem mais dados no OpenStreetMap'],
    'Aquí llegan cables submarinos': ['Submarine cables land here', 'Aqui chegam cabos submarinos'],
    'sin nombre': ['unnamed', 'sem nome'], 'cable sin nombre': ['unnamed cable', 'cabo sem nome'], 'cables sin nombre': ['unnamed cables', 'cabos sem nome'],
    'Cable submarino sin nombre': ['Unnamed submarine cable', 'Cabo submarino sem nome'],
    'Llega a tierra en': ['Lands at', 'Chega à terra em'], 'y en': ['and at', 'e em'],
    'Une': ['Connects', 'Liga'], 'con': ['with', 'com'], 'lugares': ['places', 'lugares'],
    'Internet por satélite para hogares, barcos y aviones': ['Satellite internet for homes, ships and aircraft', 'Internet por satélite para casas, navios e aviões'],
    'Internet por satélite para empresas, gobiernos y aviones': ['Satellite internet for businesses, governments and aircraft', 'Internet por satélite para empresas, governos e aviões'],
    'Internet por satélite, en despliegue': ['Satellite internet, being deployed', 'Internet por satélite, em implantação'],
    'Red estatal china de internet por satélite, en despliegue': ['China\'s state satellite internet network, being deployed', 'Rede estatal chinesa de internet por satélite, em implantação'],
    'Teléfonos y datos por satélite en todo el planeta, también en los polos': ['Satellite phones and data anywhere on Earth, poles included', 'Telefones e dados por satélite em todo o planeta, inclusive nos polos'],
    'Teléfonos satelitales y mensajes de emergencia por satélite': ['Satellite phones and emergency messages via satellite', 'Telefones por satélite e mensagens de emergência via satélite'],
    'Datos de máquinas: seguimiento de barcos, camiones y contenedores': ['Machine data: tracking ships, trucks and containers', 'Dados de máquinas: rastreamento de navios, caminhões e contêineres'],
    'Televisión, internet y comunicaciones': ['Television, internet and communications', 'Televisão, internet e comunicações'],
    'Televisión e internet': ['Television and internet', 'Televisão e internet'],
    'Televisión y comunicaciones': ['Television and communications', 'Televisão e comunicações'],
    'Flota': ['Fleet', 'Frota'],
    'Altura': ['Altitude', 'Altitude'],
    'Velocidad': ['Speed', 'Velocidade'],
    'geoestacionaria: gira con la Tierra y parece quieto en el cielo': ['geostationary: it turns with the Earth and seems still in the sky', 'geoestacionária: gira com a Terra e parece parado no céu'],
    'Vuelta a la Tierra': ['One lap of the Earth', 'Volta à Terra'],
    'cada': ['every', 'a cada'],
    'al día': ['a day', 'por dia'],
    'Inclinación': ['Inclination', 'Inclinação'],
    'Ahora sobre': ['Now over', 'Agora sobre'],
    'una zona sin ciudades grandes cerca': ['an area with no large city nearby', 'uma zona sem cidades grandes por perto'],
    'Desde': ['From', 'De'],
    'sobre tu horizonte': ['above your horizon', 'acima do seu horizonte'],
    'bajo tu horizonte': ['below your horizon', 'abaixo do seu horizonte'],
    'Próximo paso alto': ['Next high pass', 'Próxima passagem alta'],
    'no en las próximas 24 h': ['not in the next 24 h', 'não nas próximas 24 h'],
    'Lanzado': ['Launched', 'Lançado'],
    'Catálogo': ['Catalogue', 'Catálogo'],
    'Posición calculada ahora con su órbita publicada': ['Position computed now from its published orbit', 'Posição calculada agora com a órbita publicada'],
    'Fibra troncal por tierra': ['Land backbone fibre', 'Fibra troncal terrestre'],
    'En construcción según la fuente': ['Under construction, according to the source', 'Em construção, segundo a fonte'],
    'Trazado aproximado': ['Approximate route', 'Traçado aproximado'],
    'Fuente': ['Source', 'Fonte'],
    'Sigue por tierra': ['Continues on land', 'Segue por terra'],
    'Su ruta por tierra no es pública': ['Its route on land is not public', 'A rota por terra não é pública'],
    'de fibra troncal por tierra en': ['of land backbone fibre in', 'de fibra troncal terrestre em'],
    'por confirmar': ['to be confirmed', 'a confirmar'],
    'satélites': ['satellites', 'satélites'],
    'a': ['at', 'a'],
    'a una media de': ['at an average of', 'a uma média de'],
    'giran con la Tierra y parecen quietos sobre el mismo punto': ['they turn with the Earth and seem still over the same spot', 'giram com a Terra e parecem parados sobre o mesmo ponto'],
    'dan la vuelta a la Tierra en unos': ['they go round the Earth in about', 'dão a volta à Terra em cerca de'],
    'la señal tarda al menos': ['the signal takes at least', 'o sinal leva pelo menos'],
    'en subir y bajar': ['to go up and down', 'para subir e descer'],
    'Capa: la órbita baja, por debajo de 2.000 km (Starlink, OneWeb, Iridium…); es la más poblada': ['Layer: low orbit, below 2,000 km (Starlink, OneWeb, Iridium…); the most crowded', 'Camada: a órbita baixa, abaixo de 2.000 km (Starlink, OneWeb, Iridium…); a mais povoada'],
    'Capa: la órbita media, entre 2.000 y 30.000 km (GPS, Galileo, O3b…)': ['Layer: medium orbit, 2,000 to 30,000 km (GPS, Galileo, O3b…)', 'Camada: a órbita média, entre 2.000 e 30.000 km (GPS, Galileo, O3b…)'],
    'Capa: la órbita geoestacionaria, a unos 35.786 km; parecen quietos sobre el mismo punto': ['Layer: geostationary orbit, about 35,786 km; they seem still over the same spot', 'Camada: a órbita geoestacionária, a cerca de 35.786 km; parecem parados sobre o mesmo ponto'],
    'fundada en': ['founded in', 'fundada em'],
    'del grupo': ['part of', 'do grupo'],
    'Del mismo operador': ['Same operator', 'Do mesmo operador'],
    'centros de datos en el mapa': ['data centres on the map', 'centros de dados no mapa'],
    'Dueño': ['Owner', 'Dono'],
    'Superficie': ['Floor area', 'Área'],
    'Potencia': ['Power', 'Potência'],
    'Plantas': ['Floors', 'Andares'],
    'Altura del edificio': ['Building height', 'Altura do prédio'],
    'Conexión': ['Connection', 'Conexão'],
    'Dónde': ['Where', 'Onde'],
    'llegan aquí mismo': ['land right here', 'chegam aqui mesmo'],
    'llegan a': ['land', 'chegam a'],
    'Intercambio de internet': ['Internet exchange', 'Ponto de troca de tráfego'],
    'en el mismo sitio': ['in the same place', 'no mesmo lugar'],
    'la luz por fibra tarda al menos': ['light in fibre takes at least', 'a luz pela fibra leva pelo menos'],
    'ida y vuelta': ['there and back', 'ida e volta'],
    'Nota': ['Note', 'Nota'],
    'Datos': ['Data', 'Dados'],
    'Sin más datos públicos sobre este edificio': ['No more public data on this building', 'Sem mais dados públicos sobre este prédio'],
    'Posición de este instante, calculada con su órbita': ['Position at this very moment, computed from its orbit', 'Posição deste instante, calculada com a órbita'],
    'datos del propio operador': ['the operator\'s own data', 'dados do próprio operador'],
    'órbita medida': ['orbit measured', 'órbita medida'],
    'Luz del Sol': ['Sunlight', 'Luz do Sol'],
    'en la sombra de la Tierra: funciona con sus baterías': ['in the Earth\'s shadow: running on its batteries', 'na sombra da Terra: funciona com as baterias'],
    'al sol: sus paneles generan energía': ['in sunlight: its panels are generating power', 'ao sol: os painéis geram energia'],
    'los más cercanos llegan a': ['the nearest land at', 'os mais próximos chegam a'],
    'Por tierra': ['Over land', 'Por terra'],
    'por fibra troncal conocida': ['along known backbone fibre', 'por fibra troncal conhecida'],
    'ruta exacta no pública; en el mapa, en línea recta': ['exact route not public; drawn as a straight line', 'rota exata não pública; no mapa, em linha reta'],
    'cable submarino': ['submarine cable', 'cabo submarino'],
    'cables submarinos': ['submarine cables', 'cabos submarinos'],
    'las llegadas de esta zona aún no están en nuestros datos': ['the landings in this area are not in our data yet', 'as chegadas desta zona ainda não estão nos nossos dados'],
    'estación de llegada más cercana': ['nearest landing station', 'estação de chegada mais próxima'],
    'Estación de llegada de cables': ['Cable landing station', 'Estação de chegada de cabos'],
    'Fibra por tierra': ['Land fibre', 'Fibra terrestre'],
    'Las grandes redes de fibra que llevan internet por tierra, de las llegadas de cables al interior': ['The big fibre networks that carry the internet over land, from the cable landings inland', 'As grandes redes de fibra que levam a internet por terra, das chegadas dos cabos ao interior'],
    'trazados aproximados de redes reales': ['approximate routes of real networks', 'traçados aproximados de redes reais'],
    'No se pudo cargar la fibra por tierra.': ['The land fibre could not be loaded.', 'Não foi possível carregar a fibra terrestre.'],
    'Cargando fibra por tierra…': ['Loading land fibre…', 'Carregando fibra terrestre…'],
    'Origen': ['From', 'Origem'], 'Destino': ['To', 'Destino'], 'Paradas': ['Stops', 'Paradas'],
    'Ver mi conexión': ['See my connection', 'Ver a minha ligação'],
    'Mi conexión': ['My connection', 'A minha ligação'],
    'Ver': ['Show', 'Ver'],
    'No ver': ['Hide', 'Não ver'],
    'Son tus datos y de nadie más. Nada se guarda fuera de este equipo.': ["These are your data and nobody else's. Nothing is stored outside this computer.", 'São os teus dados e de mais ninguém. Nada se guarda fora deste equipamento.'],
    'Ahora mismo': ['Right now', 'Agora mesmo'],
    'Medido en este navegador, sin consultar a nadie.': ['Measured in this browser, without asking anyone.', 'Medido neste navegador, sem consultar ninguém.'],
    'Cómo te ve internet': ['How the internet sees you', 'Como a internet te vê'],
    'Medido una vez, al pulsar tú. No se repite solo.': ['Measured once, when you pressed. It does not repeat by itself.', 'Medido uma vez, quando carregaste. Não se repete sozinho.'],
    'Para saberlo hay que preguntar fuera: una sola consulta, solo si tú pulsas. Hasta entonces, nada sale de aquí.': ['To know this we must ask outside: one single request, only if you press. Until then, nothing leaves this page.', 'Para o saber é preciso perguntar fora: uma única consulta, só se carregares. Até lá, nada sai daqui.'],
    'Volver a medir': ['Measure again', 'Medir de novo'],
    'Medir desde fuera': ['Measure from outside', 'Medir a partir de fora'],
    'Midiendo…': ['Measuring…', 'A medir…'],
    'Lo que cualquier web ve de ti': ['What any website sees of you', 'O que qualquer site vê de ti'],
    'Sin pedir permiso. Por eso existe GUARDIANA.': ['Without asking permission. That is why GUARDIANA exists.', 'Sem pedir licença. É por isso que a GUARDIANA existe.'],
    'Lo que solo ve el programa': ['What only the program sees', 'O que só o programa vê'],
    'Qué programas hablan con internet, con quién y cuánto, y la ruta real de tus datos: eso se mide dentro del equipo, con ZERO. Aquí no se inventa.': ['Which programs talk to the internet, with whom and how much, and the real route of your data: that is measured inside the computer, with ZERO. Nothing is invented here.', 'Que programas falam com a internet, com quem e quanto, e o percurso real dos teus dados: isso mede-se dentro do equipamento, com o ZERO. Aqui nada se inventa.'],
    'sin conexión ahora': ['offline right now', 'sem ligação agora'],
    'en línea': ['online', 'em linha'],
    'Tipo de red': ['Network type', 'Tipo de rede'],
    'móvil': ['mobile', 'móvel'],
    'cable de red': ['wired', 'cabo de rede'],
    'sin red': ['no network', 'sem rede'],
    'Calidad estimada': ['Estimated quality', 'Qualidade estimada'],
    'muy lenta': ['very slow', 'muito lenta'],
    'lenta': ['slow', 'lenta'],
    'media': ['average', 'média'],
    'buena': ['good', 'boa'],
    'Ida y vuelta estimada': ['Estimated round trip', 'Ida e volta estimada'],
    'Ida y vuelta real hasta GUARDIANA': ['Real round trip to GUARDIANA', 'Ida e volta real até à GUARDIANA'],
    'midiendo…': ['measuring…', 'a medir…'],
    'Esta página': ['This page', 'Esta página'],
    'cifrada (HTTPS)': ['encrypted (HTTPS)', 'cifrada (HTTPS)'],
    'sin cifrar': ['not encrypted', 'sem cifra'],
    'Ahorro de datos': ['Data saver', 'Poupança de dados'],
    'activado': ['on', 'ativado'],
    'Sistema': ['System', 'Sistema'],
    'Idioma del navegador': ['Browser language', 'Idioma do navegador'],
    'Zona horaria': ['Time zone', 'Fuso horário'],
    'Pantalla': ['Screen', 'Ecrã'],
    'Procesador': ['Processor', 'Processador'],
    'núcleos': ['cores', 'núcleos'],
    'Memoria': ['Memory', 'Memória'],
    'al menos': ['at least', 'pelo menos'],
    'Puntero': ['Pointer', 'Ponteiro'],
    'táctil': ['touch', 'tátil'],
    'ratón o panel táctil': ['mouse or trackpad', 'rato ou painel tátil'],
    'Señal «no me rastrees»': ['“Do not track me” signal', 'Sinal «não me rastreies»'],
    'enviada (GPC)': ['sent (GPC)', 'enviado (GPC)'],
    'enviada (DNT)': ['sent (DNT)', 'enviado (DNT)'],
    'no enviada': ['not sent', 'não enviado'],
    'Ubicación en Órbita': ['Location in Órbita', 'Localização no Órbita'],
    'aproximada': ['approximate', 'aproximada'],
    'sin precisar': ['not set', 'por definir'],
    'Estado': ['Status', 'Estado'],
    'No se pudo medir ahora. Vuelve a intentarlo.': ['Could not measure right now. Try again.', 'Não foi possível medir agora. Tenta de novo.'],
    'Dirección pública': ['Public address', 'Endereço público'],
    'Ciudad que ve internet': ['City the internet sees', 'Cidade que a internet vê'],
    'medido': ['measured', 'medido'],
    'verificado': ['verified', 'verificado'],
    'estimado': ['estimated', 'estimado'],
    'El navegador que muestra cada corte, en directo. Llegará cuando esté terminado y probado.': ['The browser that shows every cut, live. It will arrive when it is finished and tested.', 'O navegador que mostra cada corte, ao vivo. Chegará quando estiver terminado e testado.'],
    'De punto a punto, en línea recta': ['Point to point, as the crow flies', 'De ponto a ponto, em linha reta'],
    'aquí': ['here', 'aqui'], 'Elige uno para ver su ficha.': ['Choose one to see its card.', 'Escolhe um para ver a sua ficha.'], 'acerca más para verlos todos': ['zoom in to see them all', 'aproxima mais para os ver todos'],
    'Navegador · demostración': ['Browser · demo', 'Navegador · demonstração'], 'El navegador que muestra cada corte, en directo. Lo que ves aquí es una demostración.': ['The browser that shows every cut, live. What you see here is a demo.', 'O navegador que mostra cada corte, ao vivo. O que vês aqui é uma demonstração.'],
    'Según el mapa de la red de': ['According to the network map of', 'Segundo o mapa da rede de'],
    'Altura': ['Height', 'Altura'], 'Altura aproximada desde la que se ve el planeta': ['Approximate height the planet is seen from', 'Altura aproximada de onde se vê o planeta'],
    'Enlace': ['Link', 'Ligação'], 'Estación': ['Station', 'Estação'], 'Previsto': ['Planned', 'Previsto'], 'En construcción': ['Under construction', 'Em construção'], 'Propuesto': ['Proposed', 'Proposto'],
    'Todavía no existe: se dibuja en línea recta, como aviso.': ['It does not exist yet: drawn as a straight line, as a notice.', 'Ainda não existe: desenha-se em linha reta, como aviso.'],
    'Quién lo quiere hacer': ['Who wants to build it', 'Quem quer construir'],
    'Cómo se conecta': ['How it connects', 'Como se liga'],
    'Por dónde salen los datos': ['How the data gets out', 'Por onde saem os dados'],
    'Antenas': ['Antennas', 'Antenas'],
    'Enlaces locales': ['Local links', 'Ligações locais'],
    'Novedades': ['What is new', 'Novidades'],
    'Incidencias conocidas': ['Known incidents', 'Incidentes conhecidos'],
    'Personal': ['Staff', 'Pessoal'],
    'Desde': ['Since', 'Desde'],
    'Qué quieren hacer': ['What they want to do', 'O que querem fazer'],
    'Para cuándo': ['When', 'Para quando'],
    'Capacidad prevista': ['Planned capacity', 'Capacidade prevista'],
    'Coste': ['Cost', 'Custo'],
    'Estudio': ['Study', 'Estudo'],
    'Amarres previstos': ['Planned landings', 'Amarrações previstas'],
    'Tipo': ['Type', 'Tipo'], 'Base antártica': ['Antarctic station', 'Base antártica'], 'Estación terrena de satélites': ['Satellite ground station', 'Estação terrena de satélites'],
    'En servicio desde': ['In service since', 'Em serviço desde'], 'Longitud': ['Length', 'Comprimento'], 'Longitud en el mapa': ['Length on the map', 'Comprimento no mapa'], 'Trazado aproximado por mar': ['Approximate sea route', 'Traçado aproximado pelo mar'], 'Datos verificados': ['Verified data', 'Dados verificados'], 'Fuentes': ['Sources', 'Fontes'], 'Dueños': ['Owners', 'Donos'],
    'Desde el mar': ['From the sea', 'Desde o mar'],
    'Capas de satélites': ['Satellite layers', 'Camadas de satélites'], 'Plegar': ['Fold', 'Recolher'],
    'A 35.786 km; parecen quietos sobre el mismo punto (televisión, internet por satélite).': ['At 35,786 km; they seem still over the same spot (television, satellite internet).', 'A 35.786 km; parecem parados sobre o mesmo ponto (televisão, internet por satélite).'],
    'Entre 2.000 y 30.000 km: GPS, Galileo, O3b.': ['Between 2,000 and 30,000 km: GPS, Galileo, O3b.', 'Entre 2.000 e 30.000 km: GPS, Galileo, O3b.'],
    'Por debajo de 2.000 km: Starlink, OneWeb, Iridium. Es la más poblada.': ['Below 2,000 km: Starlink, OneWeb, Iridium. The most crowded.', 'Abaixo de 2.000 km: Starlink, OneWeb, Iridium. É a mais povoada.'],
    'De las llegadas de cables de esta zona aún no tenemos datos.': ['We have no data yet on the cable landings of this area.', 'Ainda não temos dados das chegadas de cabos desta zona.'],
    'La estación de cables submarinos más cercana es': ['The nearest submarine-cable station is', 'A estação de cabos submarinos mais próxima é'],
    'de este centro de datos': ['from this data centre', 'deste centro de dados'],
    'Los cables submarinos salen del mar aquí mismo, en': ['The submarine cables come ashore right here, in', 'Os cabos submarinos saem do mar aqui mesmo, em'],
    'El cable submarino más cercano sale del mar en': ['The nearest submarine cable comes ashore in', 'O cabo submarino mais próximo sai do mar em'],
    'Cables que llegan ahí': ['Cables landing there', 'Cabos que chegam ali'],
    'Desde esa llegada, unos': ['From that landing, about', 'A partir dessa chegada, uns'],
    'por una red de fibra conocida': ['over a known fibre network', 'por uma rede de fibra conhecida'],
    'La ruta exacta por tierra no es pública; en el mapa se dibuja en línea recta.': ['The exact land route is not public; the map draws it as a straight line.', 'A rota exata por terra não é pública; no mapa desenha-se em linha reta.'],
    'Los datos viajan por él en los dos sentidos.': ['Data travels through it both ways.', 'Os dados viajam por ele nos dois sentidos.'],
    'Según OpenStreetMap; puede faltar algún tramo.': ['According to OpenStreetMap; some sections may be missing.', 'Segundo o OpenStreetMap; pode faltar algum trecho.'],
    'Sus extremos no están cerca de ninguna ciudad': ['Its ends are not near any city', 'Suas pontas não estão perto de nenhuma cidade'],
    'Satélites': ['Satellites', 'Satélites'],
    'Los cables submarinos por donde viajan los datos entre continentes': ['The submarine cables that carry data between continents', 'Os cabos submarinos por onde os dados viajam entre continentes'],
    'Los centros de datos donde se guarda y se sirve internet': ['The data centres where the internet is stored and served', 'Os centros de dados onde a internet é guardada e servida'],
    'Los satélites que llevan datos, en tiempo real': ['The satellites that carry data, in real time', 'Os satélites que levam dados, em tempo real'],
    'Puntos de internet': ['Internet points', 'Pontos de internet'],
    'Dónde toca tierra internet: llegada de cables, centros de datos y puntos de intercambio': ['Where the internet touches land: cable landings, data centres and exchange points', 'Onde a internet toca a terra: chegada de cabos, centros de dados e pontos de troca'],
    'llegadas de cables': ['cable landings', 'chegadas de cabos'],
    'centros de datos': ['data centres', 'centros de dados'],
    'puntos de intercambio': ['exchange points', 'pontos de troca'],
    'cobertura parcial': ['partial coverage', 'cobertura parcial'],
    'No se pudieron cargar los puntos.': ['The points could not be loaded.', 'Não foi possível carregar os pontos.'],
    'Cargando puntos…': ['Loading points…', 'Carregando pontos…'],
    'Órbita baja': ['Low orbit', 'Órbita baixa'],
    'Órbita media': ['Medium orbit', 'Órbita média'],
    'Geoestacionaria': ['Geostationary', 'Geoestacionária'],
    'Sobre': ['Over', 'Sobre'],
    'Sobre ti': ['Over you', 'Sobre você'],
    'Órbita geoestacionaria, a unos 35.786 km: parecen quietos sobre el mismo punto': ['Geostationary orbit, about 35,786 km up: they seem fixed over the same spot', 'Órbita geoestacionária, a cerca de 35.786 km: parecem parados sobre o mesmo ponto'],
    'Qué satélites ver': ['Which satellites to show', 'Quais satélites ver'],
    'Vista': ['View', 'Vista'],
    'Equilibrada': ['Balanced', 'Equilibrada'],
    'Todos': ['All', 'Todos'],
    'Sobre tu cielo': ['Over your sky', 'Sobre o seu céu'],
    'Órbita': ['Orbit', 'Órbita'],
    'Baja': ['Low', 'Baixa'],
    'Media': ['Medium', 'Média'],
    'Geo': ['Geo', 'Geo'],
    'Todos menos Starlink, y una muestra fija de Starlink que crece al acercar': ['All but Starlink, plus a fixed sample of Starlink that grows as you zoom in', 'Todos menos Starlink, e uma amostra fixa de Starlink que cresce ao aproximar'],
    'Solo los que están ahora a más de 25° sobre tu horizonte': ['Only those more than 25° above your horizon right now', 'Só os que estão agora a mais de 25° acima do seu horizonte'],
    'Órbita baja, por debajo de 2.000 km': ['Low orbit, below 2,000 km', 'Órbita baixa, abaixo de 2.000 km'],
    'Órbita media': ['Medium orbit', 'Órbita média'],
    'Órbita geoestacionaria, a unos 35.786 km': ['Geostationary orbit, about 35,786 km up', 'Órbita geoestacionária, a cerca de 35.786 km'],
    'Mostrando': ['Showing', 'Mostrando'],
    'de': ['of', 'de'],
    'Starlink: 1 de cada': ['Starlink: 1 in every', 'Starlink: 1 a cada'],
    'a más de 25° sobre tu horizonte': ['more than 25° above your horizon', 'a mais de 25° acima do seu horizonte'],
    'en la sombra de la Tierra': ["in the Earth's shadow", 'na sombra da Terra'],
    'al sol': ['in sunlight', 'ao sol'],
    'la luz viaja en los dos sentidos a la vez, a cámara lenta: cruza el Atlántico en unos 30 ms': ['light travels both ways at once, in slow motion: it crosses the Atlantic in about 30 ms', 'a luz viaja nos dois sentidos ao mesmo tempo, em câmera lenta: cruza o Atlântico em cerca de 30 ms'],
    'Alejar': ['Zoom out', 'Afastar'],
    'Volver al tamaño base': ['Back to base size', 'Voltar ao tamanho base'],
    'Cables de tierra': ['Land cables', 'Cabos terrestres'],
    'Satélites de datos': ['Data satellites', 'Satélites de dados'],
    'Ver los cables submarinos por donde viajan los datos': ['See the submarine cables data travels through', 'Ver os cabos submarinos por onde viajam os dados'],
    'Ver los cables de fibra en tierra': ['See the fibre cables on land', 'Ver os cabos de fibra em terra'],
    'Ver los satélites que llevan datos, en tiempo real': ['See the satellites that carry data, in real time', 'Ver os satélites que levam dados, em tempo real'],
    'satélites de datos': ['data satellites', 'satélites de dados'],
    'posición calculada ahora': ['positions computed now', 'posição calculada agora'],
    'sobre': ['over', 'sobre'],
    'ahora': ['now', 'agora'],
    'aprox.': ['approx.', 'aprox.'],
    'de altura': ['high', 'de altitude'],
    'sobre tu cielo ahora': ['over your sky now', 'sobre o seu céu agora'],
    'cables submarinos con nombre': ['named submarine cables', 'cabos submarinos com nome'],
    'cables de tierra con nombre': ['named land cables', 'cabos terrestres com nome'],
    'puede faltar alguno': ['some may be missing', 'pode faltar algum'],
    'solo una parte de la fibra': ['only part of the fibre', 'só uma parte da fibra'],
    'Cargando satélites…': ['Loading satellites…', 'Carregando satélites…'],
    'Cargando cables…': ['Loading cables…', 'Carregando cabos…'],
    'Cargando cables de tierra…': ['Loading land cables…', 'Carregando cabos terrestres…'],
    'No se pudieron cargar los satélites.': ['The satellites could not be loaded.', 'Não foi possível carregar os satélites.'],
    'No se pudieron cargar los cables.': ['The cables could not be loaded.', 'Não foi possível carregar os cabos.'],
    'No se pudieron cargar los cables de tierra.': ['The land cables could not be loaded.', 'Não foi possível carregar os cabos terrestres.'],
    'Satélites bajos a su altura real; los de órbita media y geoestacionaria, en los anillos exteriores (distancia no a escala). Su brillo sigue al Sol de ahora: más tenues los que están en la sombra de la Tierra. Pase el ratón por uno para ver su próxima vuelta.': ['Low satellites at their real height; medium and geostationary ones on the outer rings (distance not to scale). Their brightness follows the Sun right now: dimmer, those in the Earth\'s shadow. Hover over one to see its next lap.', 'Satélites baixos na altura real; os de órbita média e geoestacionária, nos anéis externos (distância fora de escala). O brilho segue o Sol de agora: mais tênues os que estão na sombra da Terra. Passe o mouse sobre um para ver a próxima volta.'],
    // what is cut, Órbita and ZERO
    'Este PC': ['This PC', 'Este PC'],
    'Teléfono': ['Phone', 'Telefone'],
    'Televisor': ['TV', 'Televisor'],
    'Publicidad': ['Advertising', 'Publicidade'],
    'Rastreador': ['Tracker', 'Rastreador'],
    'Telemetría': ['Telemetry', 'Telemetria'],
    'Seguimiento': ['Tracking', 'Rastreamento'],
    'Huella digital': ['Fingerprinting', 'Impressão digital'],
    'Corredor de datos': ['Data broker', 'Corretor de dados'],
    'Rastreador publicitario': ['Ad tracker', 'Rastreador publicitário'],
    'Telemetría del televisor': ['TV telemetry', 'Telemetria da TV'],
    'Medición de audiencia': ['Audience measurement', 'Medição de audiência'],
    'Red publicitaria': ['Ad network', 'Rede publicitária'],
    'Telemetría de una app': ['App telemetry', 'Telemetria de um app'],
    'Perfilado para anuncios': ['Ad profiling', 'Perfilamento para anúncios'],
    'Huella del dispositivo': ['Device fingerprint', 'Impressão do dispositivo'],
    'Analítica de terceros': ['Third-party analytics', 'Análise de terceiros'],
    'Subasta de anuncios': ['Ad auction', 'Leilão de anúncios'],
    'Medición digital': ['Digital measurement', 'Medição digital'],
    'Agregador': ['Aggregator', 'Agregador'],
    'Analítica': ['Analytics', 'Análise'],
    'Anuncios': ['Ads', 'Anúncios'],
    'Botón social': ['Social button', 'Botão social'],
    'ejemplo': ['example', 'exemplo'],
    'Simulado': ['Simulated', 'Simulado'],
    'simulado': ['simulated', 'simulado'],
    'EE. UU.': ['USA', 'EUA'],
    // ZERO
    'GUARDIANA · ZERO': ['GUARDIANA · ZERO', 'GUARDIANA · ZERO'],
    'Buscar o escribir una dirección': ['Search or type an address', 'Pesquise ou digite um endereço'],
    'Ir': ['Go', 'Ir'],
    'Ir (Intro)': ['Go (Enter)', 'Ir (Enter)'],
    'Activar micrófono': ['Turn on microphone', 'Ativar microfone'],
    'Entrada de voz local': ['Local voice input', 'Entrada de voz local'],
    'Elegir buscador': ['Choose search engine', 'Escolher buscador'],
    'Seleccionar buscador': ['Select search engine', 'Selecionar buscador'],
    'Buscadores': ['Search engines', 'Buscadores'],
    'Ampliar la web': ['Enlarge the page', 'Ampliar a página'],
    'Ampliar la web (pantalla entera)': ['Enlarge the page (full screen)', 'Ampliar a página (tela inteira)'],
    'Reducir': ['Reduce', 'Reduzir'],
    'Reducir la web': ['Reduce the page', 'Reduzir a página'],
    'Reducir y ver el panel (Esc)': ['Reduce and see the panel (Esc)', 'Reduzir e ver o painel (Esc)'],
    'Ver los cortes en el panel': ['See the cuts in the panel', 'Ver os cortes no painel'],
    'Ver panel': ['See panel', 'Ver painel'],
    'cortes en esta web': ['cuts on this site', 'cortes neste site'],
    'Web en grande': ['Page enlarged', 'Página ampliada'],
    'Web de ejemplo': ['Example page', 'Página de exemplo'],
    'Intro para explorar': ['Enter to explore', 'Enter para explorar'],
    'Mueve el cursor': ['Move the cursor', 'Mova o cursor'],
    'Responde a tu voz': ['Responds to your voice', 'Responde à sua voz'],
    'Clic o cualquier tecla para saltar': ['Click or any key to skip', 'Clique ou qualquer tecla para pular'],
    'Lo que ZERO corta': ['What ZERO cuts', 'O que o ZERO corta'],
    'Lo que ZERO corta en esta web': ['What ZERO cuts on this site', 'O que o ZERO corta neste site'],
    'En esta web': ['On this site', 'Neste site'],
    'Cortes': ['Cuts', 'Cortes'],
    'Empresas': ['Companies', 'Empresas'],
    'Países': ['Countries', 'Países'],
    'Por empresa': ['By company', 'Por empresa'],
    'Al cargar la web, aquí aparece cada empresa que intenta conectarse y se corta.': ['When the page loads, every company that tries to connect and is cut appears here.', 'Ao carregar a página, aqui aparece cada empresa que tenta se conectar e é cortada.'],
    'Simular corte': ['Simulate a cut', 'Simular corte'],
    'Modo estricto': ['Strict mode', 'Modo estrito'],
    'Modo estricto: corta todo lo que no es de la propia web': ['Strict mode: cuts everything that is not the site\'s own', 'Modo estrito: corta tudo o que não é do próprio site'],
    'Corta los rastreadores conocidos.': ['Cuts known trackers.', 'Corta os rastreadores conhecidos.'],
    'Corta todo lo que no es de esta web. Alguna web puede fallar.': ['Cuts everything that is not this site\'s own. Some sites may break.', 'Corta tudo o que não é deste site. Algum site pode falhar.'],
    'Tercero': ['Third party', 'Terceiro'],
    'Contenido de terceros': ['Third-party content', 'Conteúdo de terceiros'],
    'Fuentes externas': ['External fonts', 'Fontes externas'],
    'Vídeo incrustado': ['Embedded video', 'Vídeo incorporado'],
    'Chat de soporte': ['Support chat', 'Chat de suporte'],
    'Guardar en PDF lo que ZERO ha cortado': ['Save what ZERO has cut as a PDF', 'Salvar em PDF o que o ZERO cortou'],
    'Informe de cortes en PDF': ['Cuts report as PDF', 'Relatório de cortes em PDF'],
    'Informe de cortes': ['Cuts report', 'Relatório de cortes'],
    'Esta web': ['This site', 'Este site'],
    'Última hora': ['Last hour', 'Última hora'],
    'Todo': ['Everything', 'Tudo'],
    'Se guarda en este equipo. ZERO no lo envía a nadie.': ['It is saved on this computer. ZERO sends it to no one.', 'Fica salvo neste computador. O ZERO não envia a ninguém.'],
    'Demostración · Datos de ejemplo generados por el prototipo de diseño. No son cortes reales.': ['Demo · Example data generated by the design prototype. These are not real cuts.', 'Demonstração · Dados de exemplo gerados pelo protótipo de design. Não são cortes reais.'],
    'Webs': ['Sites', 'Sites'],
    'Uno a uno': ['One by one', 'Um a um'],
    'Empresa': ['Company', 'Empresa'],
    'País': ['Country', 'País'],
    'Para qué': ['What for', 'Para quê'],
    'Veces': ['Times', 'Vezes'],
    'Primera': ['First', 'Primeira'],
    'Última': ['Last', 'Última'],
    'Hora': ['Time', 'Hora'],
    'Explorar / Número 001': ['Explore / Issue 001', 'Explorar / Número 001'],
    'El mundo empieza': ['The world begins', 'O mundo começa'],
    'con una pregunta.': ['with a question.', 'com uma pergunta.'],
    'La mejor interfaz deja sitio para tus ideas. Esta página es una demostración de diseño, no un sitio real cargado desde internet.': ['The best interface leaves room for your ideas. This page is a design demo, not a real site loaded from the internet.', 'A melhor interface deixa espaço para as suas ideias. Esta página é uma demonstração de design, não um site real carregado da internet.'],
    'Cuaderno / Página de demostración': ['Notebook / Demo page', 'Caderno / Página de demonstração'],
    'Pantalla máxima': ['Full screen', 'Tela máxima'],
    'Página de demostración · ZERO': ['Demo page · ZERO', 'Página de demonstração · ZERO'],
    'Restaurar': ['Restore', 'Restaurar'],
    // ULTRA
    'ULTRA: navegación reforzada mediante Tor': ['ULTRA: browsing reinforced through Tor', 'ULTRA: navegação reforçada via Tor'],
    'Navegación reforzada mediante Tor': ['Browsing reinforced through Tor', 'Navegação reforçada via Tor'],
    'Qué es ULTRA': ['What ULTRA is', 'O que é o ULTRA'],
    'Ruta Tor': ['Tor route', 'Rota Tor'],
    'Sesión separada': ['Separate session', 'Sessão separada'],
    'Nivel:': ['Level:', 'Nível:'],
    'Nivel': ['Level', 'Nível'],
    '¿Qué te protege?': ['What does it protect?', 'O que protege?'],
    'Nivel de seguridad': ['Security level', 'Nível de segurança'],
    'Estándar': ['Standard', 'Padrão'],
    'Más seguro': ['Safer', 'Mais seguro'],
    'Máxima seguridad': ['Safest', 'Segurança máxima'],
    'Tor y sesión aparte; JavaScript activo.': ['Tor and a separate session; JavaScript on.', 'Tor e sessão à parte; JavaScript ativo.'],
    'Sin JavaScript en webs sin cifrar y menos multimedia.': ['No JavaScript on unencrypted sites and less media.', 'Sem JavaScript em sites sem criptografia e menos multimídia.'],
    'Sin JavaScript: lo mínimo para identificarte.': ['No JavaScript: the least to identify you.', 'Sem JavaScript: o mínimo para identificar você.'],
    'Tus páginas viajan por la red Tor saltando por tres repetidores: la web ve el último, no a ti. Tu sesión va aparte y se borra al cerrar.': ['Your pages travel through the Tor network hopping across three relays: the site sees the last one, not you. Your session is kept apart and erased on closing.', 'Suas páginas viajam pela rede Tor saltando por três repetidores: o site vê o último, não você. Sua sessão fica à parte e é apagada ao fechar.'],
    'Lo que hace': ['What it does', 'O que faz'],
    'Lo que no puede hacer': ['What it cannot do', 'O que não pode fazer'],
    'Ruta Tor: tu dirección IP queda oculta para la web.': ['Tor route: your IP address is hidden from the site.', 'Rota Tor: seu endereço IP fica oculto para o site.'],
    'DNS por Tor: tu proveedor no ve qué direcciones consultas.': ['DNS over Tor: your provider does not see which addresses you look up.', 'DNS via Tor: seu provedor não vê quais endereços você consulta.'],
    'Sesión separada: sin historial, cookies ni caché compartidos; todo se borra al cerrar.': ['Separate session: no shared history, cookies or cache; everything is erased on closing.', 'Sessão separada: sem histórico, cookies nem cache compartilhados; tudo é apagado ao fechar.'],
    'Sin fugas: WebRTC y conexiones directas bloqueadas; si Tor falla, no se navega.': ['No leaks: WebRTC and direct connections blocked; if Tor fails, nothing loads.', 'Sem vazamentos: WebRTC e conexões diretas bloqueadas; se o Tor falhar, não se navega.'],
    'Huella uniforme: ventana por bloques, hora UTC, idioma y agente comunes.': ['Uniform fingerprint: window in steps, UTC time, common language and agent.', 'Impressão uniforme: janela em blocos, hora UTC, idioma e agente comuns.'],
    'Rastreadores, cookies de terceros y parámetros de seguimiento, fuera.': ['Trackers, third-party cookies and tracking parameters, out.', 'Rastreadores, cookies de terceiros e parâmetros de rastreamento, fora.'],
    'Buscador centrado en privacidad por defecto.': ['A privacy-focused search engine by default.', 'Buscador focado em privacidade por padrão.'],
    'Si inicias sesión en una cuenta, ese servicio sabe quién eres.': ['If you sign in to an account, that service knows who you are.', 'Se você entrar em uma conta, esse serviço sabe quem você é.'],
    'Lo que descargues y abras fuera de ZERO puede conectarse sin protección.': ['What you download and open outside ZERO can connect without protection.', 'O que você baixar e abrir fora do ZERO pode se conectar sem proteção.'],
    'Tu proveedor de internet puede ver que usas Tor, aunque no qué visitas.': ['Your internet provider can see that you use Tor, though not what you visit.', 'Seu provedor de internet pode ver que você usa Tor, mas não o que visita.'],
    'Ninguna herramienta garantiza el anonimato total.': ['No tool guarantees total anonymity.', 'Nenhuma ferramenta garante o anonimato total.'],
    'Diseño en prueba: aquí no hay conexión Tor real. ULTRA llegará a ZERO cuando supere pruebas independientes de fugas.': ['Design under test: there is no real Tor connection here. ULTRA will reach ZERO when it passes independent leak tests.', 'Design em teste: aqui não há conexão Tor real. O ULTRA chegará ao ZERO quando passar em testes independentes de vazamento.'],
    // ZERO, the card at the top of the panel (21 Oct 2026)
    'Ficha': ['Card', 'Ficha'],
    'Para qué': ['What for', 'Para quê'],
    'Pasa el ratón por una empresa para ver su ficha. Haz clic para fijarla.': ['Point at a company to see its card. Click to pin it.', 'Passe o mouse sobre uma empresa para ver a ficha. Clique para fixá-la.'],
    'Cortada': ['Cut', 'Cortada'],
    'FIJADA': ['PINNED', 'FIXADA'],
    'Volver al resumen': ['Back to the summary', 'Voltar ao resumo'],
    'Volver al resumen (Esc)': ['Back to the summary (Esc)', 'Voltar ao resumo (Esc)'],
    'Qué intentaba llevarse': ['What it tried to take', 'O que tentava levar'],
    'Desde dónde': ['From where', 'De onde'],
    'Intentos': ['Attempts', 'Tentativas'],
    'Cuándo': ['When', 'Quando'],
    'También en': ['Also seen on', 'Também em'],
    'Datos de ejemplo de la demostración.': ['Example data from the demo.', 'Dados de exemplo da demonstração.'],
    'Datos de ejemplo.': ['Example data.', 'Dados de exemplo.'],
    'Búsquedas con DuckDuckGo dentro de Tor (.onion).': ['Searches with DuckDuckGo inside Tor (.onion).', 'Buscas com o DuckDuckGo dentro do Tor (.onion).'],
    'Exportar ficha': ['Export card', 'Exportar ficha'],
    'Solo en esta web, por ahora.': ['Only on this site, so far.', 'Só neste site, por enquanto.'],
    'Aún no hay cortes en esta web.': ['No cuts on this site yet.', 'Ainda não há cortes neste site.'],
    'Sin descripción.': ['No description.', 'Sem descrição.'],
    'No identificado': ['Not identified', 'Não identificado'],
    'Ciudad no identificada': ['City not identified', 'Cidade não identificada'],
    'Nueva York': ['New York', 'Nova York'], 'Dublín': ['Dublin', 'Dublin'], 'Berlín': ['Berlin', 'Berlim'], 'París': ['Paris', 'Paris'],
    'Ámsterdam': ['Amsterdam', 'Amsterdã'], 'Londres': ['London', 'Londres'], 'Múnich': ['Munich', 'Munique'], 'San Francisco': ['San Francisco', 'São Francisco'],
    'Vende tu visita a anunciantes en una subasta que dura milisegundos.': ['Sells your visit to advertisers in an auction that lasts milliseconds.', 'Vende sua visita a anunciantes num leilão que dura milissegundos.'],
    'Mide audiencias y une tus visitas a distintas webs en un mismo perfil.': ['Measures audiences and joins your visits to different sites into one profile.', 'Mede audiências e junta suas visitas a vários sites num mesmo perfil.'],
    'Compra y vende perfiles de personas a otras empresas.': ['Buys and sells profiles of people to other companies.', 'Compra e vende perfis de pessoas para outras empresas.'],
    'Registra lo que haces en la página: clics, desplazamiento y de dónde vienes.': ['Records what you do on the page: clicks, scrolling and where you came from.', 'Registra o que você faz na página: cliques, rolagem e de onde você vem.'],
    'Muestra anuncios y comprueba si los has visto.': ['Shows ads and checks whether you saw them.', 'Mostra anúncios e verifica se você os viu.'],
    'Te reconoce sin cookies por cómo es tu equipo.': ['Recognises you without cookies by what your computer is like.', 'Reconhece você sem cookies pelo jeito do seu computador.'],
    'Avisa a una red social de que estás aquí, aunque no pulses nada.': ['Tells a social network you are here, even if you press nothing.', 'Avisa uma rede social de que você está aqui, mesmo sem clicar em nada.'],
    'Ofrece tu visita a varios compradores a la vez y se queda una comisión.': ['Offers your visit to several buyers at once and keeps a commission.', 'Oferece sua visita a vários compradores ao mesmo tempo e fica com uma comissão.'],
    'Código de otra empresa que la web carga sin que lo veas.': ['Another company\'s code that the site loads without you seeing it.', 'Código de outra empresa que o site carrega sem você ver.'],
    'Sirve tipos de letra y, al hacerlo, ve tu dirección y la web que visitas.': ['Serves fonts and, in doing so, sees your address and the site you visit.', 'Fornece fontes e, ao fazer isso, vê seu endereço e o site que você visita.'],
    'Un reproductor de vídeo de otra empresa, con sus propias cookies.': ['A video player from another company, with its own cookies.', 'Um player de vídeo de outra empresa, com seus próprios cookies.'],
    'Una ventana de chat de otra empresa que se carga aunque no la uses.': ['Another company\'s chat window that loads even if you never use it.', 'Uma janela de chat de outra empresa que carrega mesmo que você não a use.'],
    'Identificador de cookie': ['Cookie identifier', 'Identificador de cookie'], 'Web que visitas': ['Site you visit', 'Site que você visita'],
    'Ubicación aproximada': ['Approximate location', 'Localização aproximada'], 'Identificador del dispositivo': ['Device identifier', 'Identificador do dispositivo'],
    'Tiempo en la página': ['Time on the page', 'Tempo na página'], 'Pantalla y navegador': ['Screen and browser', 'Tela e navegador'],
    'Perfil de intereses': ['Interest profile', 'Perfil de interesses'], 'Correo cifrado': ['Hashed email', 'E-mail cifrado'],
    'Clics y desplazamiento': ['Clicks and scrolling', 'Cliques e rolagem'], 'Web de procedencia': ['Referring site', 'Site de origem'],
    'Identificador publicitario': ['Advertising identifier', 'Identificador publicitário'], 'Anuncios que has visto': ['Ads you have seen', 'Anúncios que você viu'],
    'Tipos de letra instalados': ['Installed fonts', 'Fontes instaladas'], 'Tarjeta gráfica': ['Graphics card', 'Placa de vídeo'],
    'Zona horaria e idioma': ['Time zone and language', 'Fuso horário e idioma'], 'Sesión de la red social': ['Social network session', 'Sessão da rede social'],
    'Tipo de dispositivo': ['Device type', 'Tipo de dispositivo'], 'Dirección IP': ['IP address', 'Endereço IP'],
    'Vídeos que ves': ['Videos you watch', 'Vídeos que você assiste'], 'Identificador de visitante': ['Visitor identifier', 'Identificador de visitante'],
    'Páginas que ves': ['Pages you view', 'Páginas que você vê'],
    // ZERO, Tor and black and white (21 Oct 2026)
    'Tor': ['Tor', 'Tor'],
    'Webs en color': ['Sites in colour', 'Sites em cores'],
    'ZERO se queda en blanco y negro; las webs se ven en color.': ['ZERO stays in black and white; sites show in colour.', 'O ZERO fica em preto e branco; os sites aparecem em cores.'],
    // ZERO, the auction (22 Oct 2026)
    'Subasta': ['Auction', 'Leilão'],
    'Minimizar': ['Minimise', 'Minimizar'], 'Minimizar el panel': ['Minimise the panel', 'Minimizar o painel'],
    'Ocultar el panel y ver la web en grande': ['Hide the panel and see the site full size', 'Ocultar o painel e ver o site grande'],
    'Tu privacidad hoy': ['Your privacy today', 'Sua privacidade hoje'],
    'empresas evitadas': ['companies kept out', 'empresas evitadas'], 'subastas vistas': ['auctions seen', 'leilões vistos'], 'países': ['countries', 'países'], 'cortes': ['cuts', 'cortes'],
    'Abre una web y ZERO te contará aquí lo que ha cortado.': ['Open a site and ZERO will tell you here what it cut.', 'Abra um site e o ZERO vai contar aqui o que cortou.'],
    'Ficha de la empresa': ['Company card', 'Ficha da empresa'],
    'Resumen de la subasta': ['Auction summary', 'Resumo do leilão'],
    'el anuncio de arriba': ['the top ad', 'o anúncio do topo'], 'el anuncio de al lado': ['the side ad', 'o anúncio lateral'],
    'el anuncio entre párrafos': ['the ad between paragraphs', 'o anúncio entre parágrafos'], 'el anuncio de abajo': ['the bottom ad', 'o anúncio de baixo'],
    'el anuncio de vídeo': ['the video ad', 'o anúncio em vídeo'],
    'Es la franja ancha de arriba del todo (728 × 90 píxeles).': ['It is the wide strip at the very top (728 × 90 pixels).', 'É a faixa larga bem no alto (728 × 90 pixels).'],
    'Es el recuadro de la columna de al lado del texto (300 × 250 píxeles).': ['It is the box in the column beside the text (300 × 250 pixels).', 'É o quadro na coluna ao lado do texto (300 × 250 pixels).'],
    'Es el recuadro entre dos párrafos del artículo (300 × 250 píxeles), el anuncio más común de internet.': ['It is the box between two paragraphs of the article (300 × 250 pixels), the most common ad on the internet.', 'É o quadro entre dois parágrafos do artigo (300 × 250 pixels), o anúncio mais comum da internet.'],
    'Es la franja fija al pie de la pantalla (320 × 50 píxeles).': ['It is the strip fixed to the bottom of the screen (320 × 50 pixels).', 'É a faixa fixa no pé da tela (320 × 50 pixels).'],
    'Es el vídeo publicitario que sale antes del vídeo que quieres ver (640 × 360 píxeles).': ['It is the advertising video that plays before the video you want to watch (640 × 360 pixels).', 'É o vídeo publicitário que aparece antes do vídeo que você quer ver (640 × 360 pixels).'],
    'Nadie ganó: ninguna oferta llegó a tiempo.': ['Nobody won: no offer arrived in time.', 'Ninguém venceu: nenhuma oferta chegou a tempo.'],
    'Qué ver': ['What to show', 'O que ver'],
    'Empresa': ['Company', 'Empresa'],
    'Ofreció': ['Offered', 'Ofereceu'],
    'Resultado': ['Result', 'Resultado'],
    'Ganó': ['Won', 'Venceu'], 'Perdió': ['Lost', 'Perdeu'], 'Llegó tarde': ['Too late', 'Chegou tarde'], 'No ofreció': ['No offer', 'Não ofereceu'],
    'Nadie ganó': ['Nobody won', 'Ninguém venceu'], 'nadie ganó': ['nobody won', 'ninguém venceu'],
    'Anunciante declarado:': ['Declared advertiser:', 'Anunciante declarado:'],
    'Cada oferta es lo que esa empresa pagaría por mostrar su anuncio mil veces (en publicidad se llama CPM). No es el precio de tus datos.': ['Each offer is what that company would pay to show its ad a thousand times (advertisers call it CPM). It is not the price of your data.', 'Cada oferta é o que essa empresa pagaria para mostrar o anúncio mil vezes (em publicidade se chama CPM). Não é o preço dos seus dados.'],
    'Cuando la web subaste un espacio de anuncios, aquí verás quién pujó por tu visita y cuánto ofreció.': ['When the site auctions an ad space, you will see here who bid for your visit and how much they offered.', 'Quando o site leiloar um espaço de anúncio, aqui você verá quem deu lance pela sua visita e quanto ofereceu.'],
    'Anuncio en lo alto de la página': ['Ad at the top of the page', 'Anúncio no topo da página'],
    'Anuncio al lado del texto': ['Ad beside the text', 'Anúncio ao lado do texto'],
    'Anuncio en medio del artículo': ['Ad in the middle of the article', 'Anúncio no meio do artigo'],
    'Anuncio pegado abajo': ['Ad stuck to the bottom', 'Anúncio fixo embaixo'],
    'Vídeo antes del contenido': ['Video before the content', 'Vídeo antes do conteúdo'],
    'Una franja ancha arriba del todo (728 × 90 píxeles).': ['A wide strip at the very top (728 × 90 pixels).', 'Uma faixa larga bem no alto (728 × 90 pixels).'],
    'Un recuadro en la columna de al lado (300 × 250 píxeles).': ['A box in the side column (300 × 250 pixels).', 'Um quadro na coluna ao lado (300 × 250 pixels).'],
    'Un recuadro entre dos párrafos (300 × 250 píxeles), el anuncio más común de internet.': ['A box between two paragraphs (300 × 250 pixels), the most common ad on the internet.', 'Um quadro entre dois parágrafos (300 × 250 pixels), o anúncio mais comum da internet.'],
    'Una franja fija al pie de la pantalla (320 × 50 píxeles).': ['A strip fixed to the bottom of the screen (320 × 50 pixels).', 'Uma faixa fixa no pé da tela (320 × 50 pixels).'],
    'Un anuncio de vídeo que sale antes del vídeo que quieres ver (640 × 360 píxeles).': ['A video ad that plays before the video you want to watch (640 × 360 pixels).', 'Um anúncio em vídeo que aparece antes do vídeo que você quer ver (640 × 360 pixels).'],
    // ZERO, design-review controls (outside Órbita)
    'Entradas de cine': ['Cinematic entrances', 'Entradas de cinema'],
    'Entrada': ['Entrance', 'Entrada'],
    'Repetir': ['Replay', 'Repetir'],
    'Final: solo barra viva': ['End: live bar only', 'Final: só a barra viva'],
    'La web, vista de otra manera': ['The web, seen another way', 'A web, vista de outro jeito'],
    'Una presencia que responde a ti': ['A presence that responds to you', 'Uma presença que responde a você'],
  };
  const PAISES_EXTRA = { 'Yahoo Japón': ['Yahoo Japan', 'Yahoo Japão'] };
  Object.assign(D, PAISES_EXTRA);

  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const N = new Map(), UP = new Map();
  for (const k in D) { N.set(norm(k), D[k]); UP.set(norm(k).toLocaleUpperCase('es'), D[k].map((v) => v.toLocaleUpperCase(v === D[k][0] ? 'en' : 'pt'))); }

  let cur = 'es';
  const ix = () => (cur === 'en' ? 0 : 1);
  // Countries: any name Spanish gives, in the language on screen.
  let paisCod = null, dnCache = {};
  function pais(s) {
    if (!paisCod) {
      paisCod = new Map();
      try {
        const es = new Intl.DisplayNames(['es'], { type: 'region' });
        for (let a = 65; a < 91; a++) for (let b = 65; b < 91; b++) { const c = String.fromCharCode(a, b); let n = null; try { n = es.of(c); } catch (_) {} if (n && n !== c) { paisCod.set(n, c); paisCod.set(n.toLocaleUpperCase('es'), c); } }
      } catch (_) {}
    }
    const c = paisCod.get(s); if (!c) return null;
    try { const dn = dnCache[cur] || (dnCache[cur] = new Intl.DisplayNames([cur], { type: 'region' })); const n = dn.of(c); return s === s.toLocaleUpperCase('es') ? n.toLocaleUpperCase(cur) : n; } catch (_) { return null; }
  }
  function una(s) {
    const k = norm(s); if (!k) return s;
    if (cur !== 'en' && cur !== 'pt') {
      const x = Xn[cur] && (Xn[cur].get(k) || Xup[cur].get(k)); if (x) return x;
      const p0 = pais(k); if (p0) return p0;
      const e0 = N.get(k) || UP.get(k); if (e0) return e0[0]; // not yet in that language: English, never Spanish
      return null;
    }
    const e = N.get(k) || UP.get(k); if (e) return e[ix()];
    const p = pais(k); if (p) return p;
    return null;
  }
  // Sentences with a number or a name inside. Each one is a Spanish pattern and a template per language:
  // {1} {2} are the captured pieces (those listed in «tr» are translated first), {2?vez|veces} picks by the number,
  // [ … {2} … ] is kept only when that piece exists, {t:Cortado} inserts a translated key. The other 39 languages
  // bring their templates in their own file, under the same ids.
  const PAT = [
    { id: 'intento', re: /^La que más lo intentó hoy: (.+), (\d+) (vez|veces)\.$/, tr: [1], es: 'La que más lo intentó hoy: {1}, {2} {2?vez|veces}.', en: 'Tried hardest today: {1}, {2} {2?time|times}.', pt: 'A que mais tentou hoje: {1}, {2} {2?vez|vezes}.' },
    { id: 'subasto', re: /^Se subastó (.+)$/, tr: [1], es: 'Se subastó {1}', en: 'Auctioned: {1}', pt: 'Leiloado: {1}' },
    { id: 'pujaronPor', re: /^(\d+) empresas pujaron por mostrarte (.+)$/, tr: [2], es: '{1} empresas pujaron por mostrarte {2}', en: '{1} companies bid to show you {2}', pt: '{1} empresas deram lances para mostrar a você {2}' },
    { id: 'pujaron', re: /^(\d+) empresas pujaron$/, es: '{1} empresas pujaron', en: '{1} companies bid', pt: '{1} empresas deram lances' },
    { id: 'ganoOfrecio', re: /^Ganó (.+): ofreció (.+) por mostrar el anuncio mil veces\.$/, tr: [1], es: 'Ganó {1}: ofreció {2} por mostrar el anuncio mil veces.', en: 'Won by {1}: offered {2} to show the ad a thousand times.', pt: 'Venceu {1}: ofereceu {2} para mostrar o anúncio mil vezes.' },
    { id: 'empresas', re: /^(\d+) empresas$/, es: '{1} empresas', en: '{1} companies', pt: '{1} empresas' },
    { id: 'querian', re: /^(\d+) empresas querían tu visita$/, es: '{1} empresas querían tu visita', en: '{1} companies wanted your visit', pt: '{1} empresas queriam sua visita' },
    { id: 'ofertas', re: /^(\d+) ofertas?$/, es: '{1} {1?oferta|ofertas}', en: '{1} {1?offer|offers}', pt: '{1} {1?oferta|ofertas}' },
    { id: 'cortadasZero', re: /^(\d+) cortadas? por ZERO$/, es: '{1} {1?cortada|cortadas} por ZERO', en: '{1} cut by ZERO', pt: '{1} {1?cortada|cortadas} pelo ZERO' },
    { id: 'decidio', re: /^se decidió en (.+) s$/, es: 'se decidió en {1} s', en: 'decided in {1} s', pt: 'decidido em {1} s' },
    { id: 'gano', re: /^ganó (.+)$/, tr: [1], es: 'ganó {1}', en: 'won by {1}', pt: 'venceu {1}' },
    { id: 'Gano', re: /^Ganó (.+)$/, tr: [1], es: 'Ganó {1}', en: 'Won by {1}', pt: 'Venceu {1}' },
    { id: 'enEstaWeb', re: /^(\d+) en esta web$/, es: '{1} en esta web', en: '{1} on this site', pt: '{1} neste site' },
    { id: 'enTotal', re: /^(\d+) en total$/, es: '{1} en total', en: '{1} in total', pt: '{1} no total' },
    { id: 'primera', re: /^Primera (.+)$/, es: 'Primera {1}', en: 'First {1}', pt: 'Primeira {1}' },
    { id: 'ultima', re: /^Última (.+)$/, es: 'Última {1}', en: 'Last {1}', pt: 'Última {1}' },
    { id: 'abrir', re: /^Abrir (.+)$/, tr: [1], es: 'Abrir {1}', en: 'Open {1}', pt: 'Abrir {1}' },
    { id: 'cortes', re: /^(\d+) cortes?$/, es: '{1} {1?corte|cortes}', en: '{1} {1?cut|cuts}', pt: '{1} {1?corte|cortes}' },
    { id: 'cortadoVer', re: /^Cortado: (.+), (.+)\. Ver en el planeta$/, tr: [1, 2], es: '{t:Cortado}: {1}, {2}. {t:Ver en el planeta}', en: '{t:Cortado}: {1}, {2}. {t:Ver en el planeta}', pt: '{t:Cortado}: {1}, {2}. {t:Ver en el planeta}' },
    { id: 'direccionEjemplo', re: /^Dirección de ejemplo: «(.*)» · ZERO abriría (.+)$/, es: 'Dirección de ejemplo: «{1}» · ZERO abriría {2}', en: 'Example address: «{1}» · ZERO would open {2}', pt: 'Endereço de exemplo: «{1}» · O ZERO abriria {2}' },
    { id: 'consultaEjemplo', re: /^Tu consulta de ejemplo: «(.*)» · Se buscaría en ([^:]+): (.+)$/, es: 'Tu consulta de ejemplo: «{1}» · Se buscaría en {2}: {3}', en: 'Your example query: «{1}» · It would be searched on {2}: {3}', pt: 'Sua consulta de exemplo: «{1}» · Seria buscada no {2}: {3}' },
    { id: 'delAl', re: /^del (.+) al (.+)$/, es: 'del {1} al {2}', en: 'from {1} to {2}', pt: 'de {1} a {2}' },
    { id: 'generado', re: /^Generado el (.+) en este equipo\. ZERO no envía este informe a nadie\.$/, es: 'Generado el {1} en este equipo. ZERO no envía este informe a nadie.', en: 'Generated on {1} on this computer. ZERO sends this report to no one.', pt: 'Gerado em {1} neste computador. O ZERO não envia este relatório a ninguém.' },
    { id: 'nivel', re: /^NIVEL (.+)$/, tr: [1], es: '{t:NIVEL} {1}', en: '{t:NIVEL} {1}', pt: '{t:NIVEL} {1}' },
    { id: 'equipoEn', re: /^Este equipo está en (.+?)(\. Cambiar)?$/, es: 'Este equipo está en {1}[. Cambiar{2}]', en: 'This computer is in {1}[. Change{2}]', pt: 'Este computador está em {1}[. Mudar{2}]' },
    { id: 'pareceEn', re: /^Parece que este equipo está ahora en (.+)$/, es: 'Parece que este equipo está ahora en {1}', en: 'This computer seems to be in {1} now', pt: 'Parece que este computador está agora em {1}' },
    { id: 'puntoKm', re: /^Tu punto está a (\d+) km de (.+), la población más cercana que conoce el programa\. Si tu municipio es otro, elígelo\.$/, es: 'Tu punto está a {1} km de {2}, la población más cercana que conoce el programa. Si tu municipio es otro, elígelo.', en: 'Your point is {1} km from {2}, the nearest town the program knows. If your town is another, choose it.', pt: 'Seu ponto está a {1} km de {2}, a localidade mais próxima que o programa conhece. Se o seu município for outro, escolha-o.' },
    { id: 'precision', re: /^precisión (.+)$/, es: 'precisión {1}', en: 'accuracy {1}', pt: 'precisão {1}' },
    { id: 'medidoConfirmado', re: /^Medido con la ubicación de tu sistema(?: \(precisión ([^)]+)\))? y confirmado por ti\. Se guarda solo en este equipo\.$/, es: 'Medido con la ubicación de tu sistema[ (precisión {1})] y confirmado por ti. Se guarda solo en este equipo.', en: "Measured with your system's location[ (accuracy {1})] and confirmed by you. It is stored only on this computer.", pt: 'Medido com a localização do seu sistema[ (precisão {1})] e confirmado por você. Fica guardado só neste computador.' },
    { id: 'elegidoConfirmado', re: /^Elegido por ti y confirmado por ti\. Se guarda solo en este equipo\.$/, es: '{t:Elegido por ti} y confirmado por ti. Se guarda solo en este equipo.', en: '{t:Elegido por ti} and confirmed by you. It is stored only on this computer.', pt: '{t:Elegido por ti} e confirmado por você. Fica guardado só neste computador.' },
  ];
  // Fill a template with the captured pieces.
  function plantilla(tpl, m, tr) {
    const piezas = {}; for (let i = 1; i < m.length; i++) piezas[i] = m[i];
    if (tr) for (const i of tr) if (piezas[i] != null) piezas[i] = t(piezas[i]);
    let out = tpl.replace(/\[([^\[\]]*)\]/g, (_, seg) => { const ids = [...seg.matchAll(/\{(\d+)\}/g)].map((x) => +x[1]); return ids.length && ids.every((i) => piezas[i] != null && piezas[i] !== '') ? seg : ''; });
    out = out.replace(/\{(\d+)\?([^|}]*)\|([^}]*)\}/g, (_, i, uno, varios) => (m[i] === '1' ? uno : varios));
    out = out.replace(/\{t:([^}]+)\}/g, (_, k) => t(k));
    out = out.replace(/\{(\d+)\}/g, (_, i) => (piezas[i] != null ? piezas[i] : ''));
    return out;
  }
  function porPatron(k) {
    for (const p of PAT) {
      const m = k.match(p.re); if (!m) continue;
      const tpl = cur === 'en' || cur === 'pt' ? p[cur] : (X[cur] && X[cur].p && X[cur].p[p.id]) || p.en;
      // {2} in «equipoEn» stands for the optional tail: present when captured, empty otherwise
      if (p.id === 'equipoEn') m[2] = m[2] ? '' : undefined;
      return plantilla(tpl, m, p.tr);
    }
    return null;
  }
  // The other languages: one small file each (static/i18n/<code>.json), with «t» (Spanish → that language),
  // «p» (the templates above, by id), «rtl» and «locale». Downloaded only by its readers.
  const X = {}, Xn = {}, Xup = {};
  const BASE = (() => { try { const u = document.currentScript && document.currentScript.src; return u ? u.replace(/[^\/]*$/, '') : 'static/'; } catch (_) { return 'static/'; } })();
  async function cargaIdioma(l) {
    if (X[l] || l === 'es' || l === 'en' || l === 'pt') return X[l];
    try {
      const r = await fetch(BASE + 'i18n/' + l + '.json', { cache: 'force-cache' });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      X[l] = d; Xn[l] = new Map(); Xup[l] = new Map();
      for (const k in d.t || {}) { const nk = norm(k); Xn[l].set(nk, d.t[k]); try { Xup[l].set(nk.toLocaleUpperCase('es'), String(d.t[k]).toLocaleUpperCase(l)); } catch (_) { Xup[l].set(nk.toLocaleUpperCase('es'), String(d.t[k]).toUpperCase()); } }
      return d;
    } catch (e) { X[l] = { error: true, t: {}, p: {} }; return X[l]; }
  }
  // Translate one string: whole, by pattern, or piece by piece around « · » and « → ».
  function t(s) {
    if (cur === 'es' || s == null) return s;
    s = String(s);
    const lead = s.match(/^\s*/)[0], tail = s.match(/\s*$/)[0], k = norm(s);
    if (!k) return s;
    let r = una(k);
    if (r == null) r = porPatron(k);
    if (r == null && /( · | → |\s\/\s)/.test(k)) {
      let algo = false;
      r = k.split(/( · | → | \/ )/).map((p, i) => { if (i % 2) return p; const x = una(p); if (x != null) { algo = true; return x; } const y = porPatron(p); if (y != null) { algo = true; return y; } return p; }).join('');
      if (!algo) r = null;
    }
    if (r == null) { const m = k.match(/^([●◎↙⛶✳↻♪]\s*)(.+)$/); if (m) { const x = t(m[2]); if (x !== m[2]) r = m[1] + x; } }
    return r == null ? s : lead + r + tail;
  }

  // The page: every text and a few attributes, remembering the Spanish original.
  const ATR = ['placeholder', 'title', 'aria-label'];
  const textos = new WeakMap();
  const salta = (el) => !el || /^(SCRIPT|STYLE|TEXTAREA|INPUT|CODE)$/.test(el.nodeName) || (el.closest && el.closest('[translate="no"]'));
  function texto(n) {
    if (salta(n.parentNode)) return;
    let r = textos.get(n);
    if (!r || n.data !== r.v) { r = { es: n.data }; textos.set(n, r); }
    const v = t(r.es); r.v = v; if (n.data !== v) n.data = v;
  }
  function atributos(el) {
    if (salta(el) && el.nodeName !== 'INPUT') return;
    const m = el.__idioma || (el.__idioma = {});
    for (const a of ATR) {
      if (!el.hasAttribute(a)) continue;
      const cur0 = el.getAttribute(a); let r = m[a];
      if (!r || cur0 !== r.v) { r = m[a] = { es: cur0 }; }
      const v = t(r.es); r.v = v; if (cur0 !== v) el.setAttribute(a, v);
    }
  }
  function recorre(n) {
    if (n.nodeType === 3) return texto(n);
    if (n.nodeType !== 1 || /^(SCRIPT|STYLE)$/.test(n.nodeName)) return;
    atributos(n);
    for (let c = n.firstChild; c; c = c.nextSibling) recorre(c);
  }
  let titulo0 = null;
  function todo() {
    if (titulo0 == null || (document.title !== titulo0.v)) titulo0 = { es: document.title };
    titulo0.v = t(titulo0.es); if (document.title !== titulo0.v) document.title = titulo0.v;
    if (document.body) recorre(document.body);
    document.documentElement.lang = (INFO[cur] && INFO[cur].lang) || cur;
    document.documentElement.dir = INFO[cur] && INFO[cur].rtl ? 'rtl' : 'ltr';
    document.querySelectorAll('.idiomas button[data-l]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.l === cur)));
    document.querySelectorAll('.idiomas .idioma-actual').forEach((b) => { b.textContent = cur.toUpperCase().replace('-', '·'); b.setAttribute('aria-label', (INFO[cur] && INFO[cur].nombre) || cur); });
  }
  const obs = new MutationObserver((ms) => {
    if (cur === 'es') return;
    for (const m of ms) {
      if (m.type === 'characterData') texto(m.target);
      else if (m.type === 'attributes') atributos(m.target);
      else m.addedNodes.forEach(recorre);
    }
  });

  function pon(l, recuerda) {
    if (!IDIOMAS.includes(l)) l = 'es';
    if (l !== 'es' && l !== 'en' && l !== 'pt' && !X[l]) { cargaIdioma(l).then(() => pon(l, recuerda)); return; }
    const antes = cur; cur = l;
    if (recuerda) { try { localStorage.setItem('guardiana-lang', l); localStorage.setItem('guardiana-lang-chosen', '1'); } catch (_) {} }
    if (antes !== l || recuerda !== undefined) todo();
    document.querySelectorAll('iframe').forEach((f) => { try { if (f.contentWindow && f.contentWindow.GuardianaIdioma) f.contentWindow.GuardianaIdioma.pon(l); } catch (_) {} });
    dispatchEvent(new CustomEvent('guardiana-idioma', { detail: l }));
  }
  function inicial() {
    try {
      const q = new URLSearchParams(location.search).get('lang');
      if (IDIOMAS.includes(q)) return q;
      try { if (window.parent !== window && window.parent.GuardianaIdioma) return window.parent.GuardianaIdioma.lang; } catch (_) {} // a parent from another site cannot be read
      const st = localStorage.getItem('guardiana-lang'), ch = localStorage.getItem('guardiana-lang-chosen');
      if (ch && IDIOMAS.includes(st)) return st;
      const navs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).map((x) => String(x).toLowerCase());
      const nav = navs.map((x) => (x.startsWith('zh') && /tw|hk|hant/.test(x) ? 'zh-tw' : x === 'pt-pt' ? 'pt-pt' : x.slice(0, 2))).find((x) => IDIOMAS.includes(x));
      return nav || 'en';
    } catch (_) { return 'es'; }
  }
  window.GuardianaIdioma = { t, pon: (l) => pon(l), get lang() { return cur; }, get locale() { return cur === 'en' ? 'en-GB' : cur === 'pt' ? 'pt-BR' : cur === 'es' ? 'es-ES' : (INFO[cur] && INFO[cur].locale) || cur; }, get idiomas() { return IDI_ABIERTOS; } };
  addEventListener('storage', (e) => { if (e.key === 'guardiana-lang' && IDIOMAS.includes(e.newValue) && e.newValue !== cur) pon(e.newValue); });
  // The selector: one small button with the current code; it unfolds a list of the 42 languages, each in its own
  // name, three columns on a computer and one on a phone. Esc or a click outside folds it.
  function selector() {
    document.querySelectorAll('.idiomas').forEach((caja) => {
      if (caja.dataset.listo) return; caja.dataset.listo = '1'; caja.setAttribute('translate', 'no');
      caja.innerHTML = '';
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'idioma-actual'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
      const menu = document.createElement('div'); menu.className = 'idioma-menu'; menu.setAttribute('role', 'listbox'); menu.hidden = true;
      for (const [c, n] of IDI_ABIERTOS) { const b = document.createElement('button'); b.type = 'button'; b.dataset.l = c; b.setAttribute('role', 'option'); b.lang = INFO[c].lang; b.innerHTML = '<span class="cod">' + c.toUpperCase().replace('-', '·') + '</span><span class="nom">' + n + '</span>'; b.addEventListener('click', () => { pon(c, true); cierra(); }); menu.appendChild(b); }
      const cierra = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
      btn.addEventListener('click', (e) => { e.stopPropagation(); const abre = menu.hidden; menu.hidden = !abre; btn.setAttribute('aria-expanded', String(abre)); if (abre) { const act = menu.querySelector('[aria-pressed="true"]'); if (act) act.focus(); } });
      document.addEventListener('click', (e) => { if (!caja.contains(e.target)) cierra(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { cierra(); btn.focus(); } });
      caja.appendChild(btn); caja.appendChild(menu);
    });
  }
  const arranca = () => {
    selector();
    cur = inicial();
    if (cur !== 'es' && cur !== 'en' && cur !== 'pt') { const l = cur; cur = 'es'; cargaIdioma(l).then(() => { cur = l; todo(); }); }
    todo();
    obs.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATR });
    new MutationObserver(() => { if (cur !== 'es' && document.title !== (titulo0 && titulo0.v)) todo(); }).observe(document.querySelector('title') || document.head, { childList: true, characterData: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();
