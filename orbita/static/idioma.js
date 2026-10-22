/* GUARDIANA · languages for Órbita and ZERO (20 Oct 2026, owner: «the languages go next to Precisar ubicación»).
   The pages are written in Spanish. This file translates what is on screen into English or Portuguese and keeps
   doing it as the pages change; switching back restores the original. It shares the choice with the website
   (guardiana-lang), so a visitor who picked a language there finds it here. Nothing leaves this computer. */
(() => {
  'use strict';
  const IDIOMAS = ['es', 'en', 'pt'];
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
    'Origen': ['From', 'Origem'], 'Destino': ['To', 'Destino'], 'Paradas': ['Stops', 'Paradas'],
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
    'Satélites bajos a su altura real; los de órbita media y geoestacionaria, en los anillos exteriores (distancia no a escala). Más tenues, los que están ahora en la sombra de la Tierra.': ['Low satellites at their real height; medium and geostationary ones on the outer rings (distance not to scale). Dimmer: those now in the Earth\'s shadow.', 'Satélites baixos na altura real; os de órbita média e geoestacionária, nos anéis externos (distância fora de escala). Mais tênues: os que estão agora na sombra da Terra.'],
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
    const e = N.get(k) || UP.get(k); if (e) return e[ix()];
    const p = pais(k); if (p) return p;
    return null;
  }
  const PATRONES = [
    [/^La que más lo intentó hoy: (.+), (\d+) (vez|veces)\.$/, (m) => (cur === 'en' ? 'Tried hardest today: ' + t(m[1]) + ', ' + m[2] + (m[2] === '1' ? ' time.' : ' times.') : 'A que mais tentou hoje: ' + t(m[1]) + ', ' + m[2] + (m[2] === '1' ? ' vez.' : ' vezes.'))],
    [/^Se subastó (.+)$/, (m) => (cur === 'en' ? 'Auctioned: ' : 'Leiloado: ') + t(m[1])],
    [/^(\d+) empresas pujaron por mostrarte (.+)$/, (m) => m[1] + (cur === 'en' ? ' companies bid to show you ' : ' empresas deram lances para mostrar a você ') + t(m[2])],
    [/^(\d+) empresas pujaron$/, (m) => m[1] + (cur === 'en' ? ' companies bid' : ' empresas deram lances')],
    [/^Ganó (.+): ofreció (.+) por mostrar el anuncio mil veces\.$/, (m) => (cur === 'en' ? 'Won by ' + t(m[1]) + ': offered ' + m[2] + ' to show the ad a thousand times.' : 'Venceu ' + t(m[1]) + ': ofereceu ' + m[2] + ' para mostrar o anúncio mil vezes.')],
    [/^(\d+) empresas$/, (m) => m[1] + (cur === 'en' ? ' companies' : ' empresas')],
    [/^(\d+) empresas querían tu visita$/, (m) => m[1] + (cur === 'en' ? ' companies wanted your visit' : ' empresas queriam sua visita')],
    [/^(\d+) ofertas?$/, (m) => m[1] + (cur === 'en' ? (m[1] === '1' ? ' offer' : ' offers') : (m[1] === '1' ? ' oferta' : ' ofertas'))],
    [/^(\d+) cortadas? por ZERO$/, (m) => m[1] + (cur === 'en' ? ' cut by ZERO' : (m[1] === '1' ? ' cortada pelo ZERO' : ' cortadas pelo ZERO'))],
    [/^se decidió en (.+) s$/, (m) => (cur === 'en' ? 'decided in ' : 'decidido em ') + m[1] + ' s'],
    [/^ganó (.+)$/, (m) => (cur === 'en' ? 'won by ' : 'venceu ') + t(m[1])],
    [/^Ganó (.+)$/, (m) => (cur === 'en' ? 'Won by ' : 'Venceu ') + t(m[1])],
    [/^(\d+) en esta web$/, (m) => m[1] + (cur === 'en' ? ' on this site' : ' neste site')],
    [/^(\d+) en total$/, (m) => m[1] + (cur === 'en' ? ' in total' : ' no total')],
    [/^Primera (.+)$/, (m) => (cur === 'en' ? 'First ' : 'Primeira ') + m[1]],
    [/^Última (.+)$/, (m) => (cur === 'en' ? 'Last ' : 'Última ') + m[1]],
    [/^Abrir (.+)$/, (m) => ({ en: 'Open ', pt: 'Abrir ' })[cur] + t(m[1])],
    [/^(\d+) cortes?$/, (m) => m[1] + ' ' + (cur === 'en' ? (m[1] === '1' ? 'cut' : 'cuts') : (m[1] === '1' ? 'corte' : 'cortes'))],
    [/^Cortado: (.+), (.+)\. Ver en el planeta$/, (m) => t('Cortado') + ': ' + t(m[1]) + ', ' + t(m[2]) + '. ' + t('Ver en el planeta')],
    [/^Dirección de ejemplo: «(.*)» · ZERO abriría (.+)$/, (m) => (cur === 'en' ? 'Example address: «' + m[1] + '» · ZERO would open ' : 'Endereço de exemplo: «' + m[1] + '» · O ZERO abriria ') + m[2]],
    [/^Tu consulta de ejemplo: «(.*)» · Se buscaría en ([^:]+): (.+)$/, (m) => (cur === 'en' ? 'Your example query: «' + m[1] + '» · It would be searched on ' + m[2] + ': ' : 'Sua consulta de exemplo: «' + m[1] + '» · Seria buscada no ' + m[2] + ': ') + m[3]],
    [/^del (.+) al (.+)$/, (m) => (cur === 'en' ? 'from ' + m[1] + ' to ' + m[2] : 'de ' + m[1] + ' a ' + m[2])],
    [/^Generado el (.+) en este equipo\. ZERO no envía este informe a nadie\.$/, (m) => (cur === 'en' ? 'Generated on ' + m[1] + ' on this computer. ZERO sends this report to no one.' : 'Gerado em ' + m[1] + ' neste computador. O ZERO não envia este relatório a ninguém.')],
    [/^NIVEL (.+)$/, (m) => t('NIVEL') + ' ' + t(m[1])],
    [/^Este equipo está en (.+?)(\. Cambiar)?$/, (m) => (cur === 'en' ? 'This computer is in ' + m[1] + (m[2] ? '. Change' : '') : 'Este computador está em ' + m[1] + (m[2] ? '. Mudar' : ''))],
    [/^Parece que este equipo está ahora en (.+)$/, (m) => (cur === 'en' ? 'This computer seems to be in ' + m[1] + ' now' : 'Parece que este computador está agora em ' + m[1])],
    [/^Tu punto está a (\d+) km de (.+), la población más cercana que conoce el programa\. Si tu municipio es otro, elígelo\.$/, (m) => (cur === 'en' ? 'Your point is ' + m[1] + ' km from ' + m[2] + ', the nearest town the program knows. If your town is another, choose it.' : 'Seu ponto está a ' + m[1] + ' km de ' + m[2] + ', a localidade mais próxima que o programa conhece. Se o seu município for outro, escolha-o.')],
    [/^precisión (.+)$/, (m) => (cur === 'en' ? 'accuracy ' : 'precisão ') + m[1]],
    [/^(Medido con la ubicación de tu sistema(?: \(precisión ([^)]+)\))?|Elegido por ti) y confirmado por ti\. Se guarda solo en este equipo\.$/, (m) => (m[1].startsWith('Elegido') ? t('Elegido por ti') : (cur === 'en' ? 'Measured with your system\'s location' : 'Medido com a localização do seu sistema') + (m[2] ? (cur === 'en' ? ' (accuracy ' : ' (precisão ') + m[2] + ')' : '')) + (cur === 'en' ? ' and confirmed by you. It is stored only on this computer.' : ' e confirmado por você. Fica guardado só neste computador.')],
  ];
  // Translate one string: whole, by pattern, or piece by piece around « · » and « → ».
  function t(s) {
    if (cur === 'es' || s == null) return s;
    s = String(s);
    const lead = s.match(/^\s*/)[0], tail = s.match(/\s*$/)[0], k = norm(s);
    if (!k) return s;
    let r = una(k);
    if (r == null) for (const [re, f] of PATRONES) { const m = k.match(re); if (m) { r = f(m); break; } }
    if (r == null && /( · | → |\s\/\s)/.test(k)) {
      let algo = false;
      r = k.split(/( · | → | \/ )/).map((p, i) => { if (i % 2) return p; const x = una(p); if (x != null) { algo = true; return x; } const y = PATRONES.find(([re]) => re.test(p)); if (y) { algo = true; return y[1](p.match(y[0])); } return p; }).join('');
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
    document.documentElement.lang = cur;
    document.querySelectorAll('.idiomas button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.l === cur)));
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
      const nav = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).map((x) => String(x).slice(0, 2).toLowerCase()).find((x) => IDIOMAS.includes(x));
      return nav || 'en';
    } catch (_) { return 'es'; }
  }
  window.GuardianaIdioma = { t, pon: (l) => pon(l), get lang() { return cur; }, get locale() { return cur === 'en' ? 'en-GB' : cur === 'pt' ? 'pt-BR' : 'es-ES'; } };
  addEventListener('storage', (e) => { if (e.key === 'guardiana-lang' && IDIOMAS.includes(e.newValue) && e.newValue !== cur) pon(e.newValue); });
  const arranca = () => {
    cur = inicial(); todo();
    obs.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATR });
    new MutationObserver(() => { if (cur !== 'es' && document.title !== (titulo0 && titulo0.v)) todo(); }).observe(document.querySelector('title') || document.head, { childList: true, characterData: true, subtree: true });
    document.querySelectorAll('.idiomas button').forEach((b) => b.addEventListener('click', () => pon(b.dataset.l, true)));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();
