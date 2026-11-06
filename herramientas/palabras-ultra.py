#!/usr/bin/env python3
"""Las 2048 palabras de verificación de Ultra (3 Nov 2026; agencia, ronda 93: «4 palabras para leer en voz alta en cada llamada…
lista de 2.048 palabras en español sin ambigüedad»).

Escribe orbita/comunicaciones/palabras.js a partir del POOL de abajo, aplicando estas reglas, y falla si no quedan exactamente 2048:
  - solo letras (con tildes y ñ), de 4 a 8 letras, en minúsculas; sustantivos comunes, adjetivos y verbos del español corriente;
  - sin nombres propios, marcas, palabrotas ni palabras cargadas (enfermedad, muerte, armas, religión, sexo, política);
  - y sin nada que incomode al leerlo en voz alta en un despacho o una clínica (FUERA_LECTURA, coordinación, 5 nov 2026: revisadas
    una a una, también con los sentidos de Colombia, México, el Caribe, el Cono Sur y España), ni términos de la propia pantalla
    (número, código, nivel, firma…), ni palabras extranjeras de pronunciación rara;
  - sin ambigüedad al oído: se calcula una «clave fonética» (sin tildes; b = v; z, ce, ci = s; c, qu = k; ll = y; sin h; ge, gi = je, ji;
    gue, gui = ge, gi; y final = i) y no entran dos palabras con la misma clave ni con claves que difieran en una sola letra
    (casa / caza, gato / pato, hola / ola, callo / cayo…), ni dos con la misma raíz de 4 letras y el mismo largo (gato / gata);
  - y tampoco escritas a una letra de otra (sin tildes: cesta / costa, gema / goma, ocho / ocio; revisión independiente, 3 nov 2026);
  - si sobran, se quedan las más cortas; la lista sale en orden alfabético.
La lista es nuestra (no es la de BIP-39: aquí no hay acceso a ella) y va con la licencia del resto del código (AGPL-3.0).

    python3 herramientas/palabras-ultra.py            # regenera orbita/comunicaciones/palabras.js
"""
import os, re, sys, unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'orbita', 'comunicaciones', 'palabras.js')

POOL = """
ábaco abajo abanico abeja abierto abogado abono aborto abrazo abrigo abril abrir abuelo abundar aburrir acabar academia acampar acceso aceite
acelga acento aceptar acera acero acertar ácido aclarar acoger acordar acortar actor actriz actual acuario acudir acuerdo adelante adiós
adivino admitir adobe adoptar adorno adulto aéreo afán afecto afilar afinar aflojar agenda agente ágil agitar agosto agotar agrado agrio agua
aguja agujero ahorro ahumado aire aislar ajedrez ajeno ajuste alacena alambre álamo alarde albañil alberca álbum alcalde alcoba aldea alegre
alerta aleta alfil alfombra alga álgebra algo algodón aliado alianza aliento alivio allá almacén almeja almendra almohada almuerzo alojar
alquiler altar alteza altura alumno alzar amable amanecer amapola amargo amarillo amasar ámbar ámbito ambos amigo amistad amparo amplio
ancho anciano ancla andar andén anfibio ángulo anillo animal aniversario anotar ansia antena antes antiguo anual anuncio añadir añil año
apagar aparato apenas apetito apio aplauso aplicar apodo aportar apoyo aprender apretar aprobar apuesta apunte arado araña arar árbol arbusto
arcilla arco ardilla arena argolla arista arma armario armonía aroma arpa arquero arraigo arreglo arriba arroyo arroz arruga arte artesano
artista asado asalto ascensor aseo asesor asiento asilo asno asombro áspero aspirar astilla astro astuto asumir asunto atajo ataque atar atardecer
atento aterrizar ático atlas atleta átomo atraer atrás atún audaz audio aula aumento aurora ausente auto autor avance avaro avellana avena
avenida aventura avestruz avión aviso avispa ayer ayuda ayuno azafrán azahar azar azotea azúcar azufre azul
babor bache bahía bailar bajar balanza balcón balde ballena balón bambú banco banda bandeja bandera baño barato barba barco barniz barra
barrer barril barrio barro base bastante bastón basura batalla batería batido batir baúl bautizo bebé beber beca bellota berenjena berro beso
bestia biblioteca bicho bigote billar billete biombo bisagra bisonte blanco bloque blusa bobina boca bocina boda bodega boina bola boleto
bolígrafo bolsa bolsillo bomba bombilla bondad bonito boquilla borde borrador bosque bota bote botella botín botón bóveda bravo brazo brecha
breve brillo brindis brisa broche broma bronce brote bruja brújula bruma brusco buceo bueno buey búfalo bufanda búho buitre bujía bulto buque
burbuja burla burro buscar butaca buzón
caballo cabaña cabello caber cabeza cabina cable cabo cabra cacao cacerola cacto cadena cadera caer café caída caja cajón calabaza calamar
calcio cálculo caldera caldo calendario calidad caliente calle calma calor caluroso calvo calzado cama cámara cambio camello camino camión
camisa campana campeón campo canal canasta cancha canción candado canela cangrejo canguro canica canoa cansado cantar cántaro cantidad caña
cañón caoba caos capa capaz capilla capital capítulo capricho captar capucha cara caracol carácter carbón cárcel careta carga caricia cariño
carne carpeta carrera carreta carro carta cartel cartón casa cascada casco casero casi caso castaña castillo castor catálogo catarata catorce
cauce caudal causa cautela cavar caverna cazuela cebolla cebra ceder cedro ceja celda celebrar celeste célula cemento cena ceniza censo centeno
centro cepillo cera cerca cerdo cereal cerebro cereza cero cerrar cerro certeza césped cesta chaleco champú chapa charco charla chico chimenea
chispa chiste chocolate choque choza chuleta ciclo ciego cielo ciencia ciervo cifra cigüeña cima cimiento cinco cine cinta cintura ciprés circo
círculo ciruela cisne cita ciudad clamor claro clase clave clavel clavo cliente clima cloro cobarde cobre cocer coche cocina codo codorniz
cofre coger cohete cojín cola colcha colegio colgar colibrí colina collar colmena colmillo color columna comadreja combate comedia comer cometa
cómico comida cómodo compás comprar común conde conejo confiar conjunto conocer consejo contar contento copa copia coral corazón corbata corcho
cordel cordero cordón corona correo correr cortar cortés corteza cortina corto cosa cosecha coser costa costumbre coyote cráter crear crecer
creer crema cresta criar crisol cristal crudo cruz cuaderno cuadro cuarto cuatro cubo cubrir cuchara cuchillo cuello cuenta cuento cuerda cuerno
cuero cuerpo cuervo cuesta cueva cuidar culebra culpa cultivo cumbre cumplir cuna cuña cuota cúpula cura curioso curso curva
dado dama danza dañar dardo dátil dato debajo deber débil decena decidir decir dedal dedo defensa dejar delfín delgado delito demanda demora
denso dentro deporte depósito derecho derivar desafío desayuno descanso desear desfile desierto deslizar desnudo despacho destino desván detalle
detener deuda devolver diamante diario dibujo diciembre dieta diente diestro dificultad digno dilema dinero dinosaurio dios diploma dique directo
dirigir disco diseño disfraz distancia diverso dividir doblar doble doce docena dócil doctor dolor domingo dominó donar dorado dormir dorso
dosis dragón drama ducha duda duelo dueño dulce duna duque durar duro
ébano echar eclipse edad edificio educar efecto eficaz eje ejemplo ejercer elección elefante elegir elogio elote embajada embudo emoción
empeño empezar empleo empresa encaje encender enchufe encía encina encontrar enero enfado enfoque engaño enigma enlace enorme ensalada ensayo
enseñar entender entero entrar entrega enviar envidia envío época equipaje equipo erizo error escalera escama escapar escarabajo escena escoba
escolar esconder escribir escudo escuela esfera esfuerzo esmalte espacio espada espalda espárrago espejo espera espeso espiga espina espíritu
esponja esposa espuma esquema esquí esquina estable estación estado estante estatua este estilo estómago estrecho estrella estudio estufa
eterno ética etiqueta evento evitar exacto examen exceso excusa éxito éxodo experto explicar exponer extraño
fábrica fácil facha faja falda fallo falso falta fama familia famoso fango fantasma faro farol farsa fase fatiga favor fecha feliz feo feria
feroz férreo festín fiar fibra ficha fideo fiebre fiel fiera fiesta figura fijar fila filete filo filtro final fingir fino firma firme físico
flaco flama flan flauta flecha flor flota flujo foca fogata folleto fondo forma fortuna fosa fósforo foto fracaso frágil fraile frase fregar
freír freno frente fresa fresco frijol frío frito fruta fuego fuente fuera fuerte fuga fulgor fumar función funda furia fusil fútbol futuro
gacela gafas gaita galaxia galería galleta gallina gallo galopar ganado ganar gancho ganga ganso garaje garbanzo garganta garra garza gasa
gastar gato gaveta gaviota gemelo gemir general genio gente geranio germen gesto gigante gimnasio girar girasol gitano globo gloria glosario
gnomo gol golfo golondrina golpe goma gordo gorila gorra gota gozar grabar gracia grada grado gráfico grano grapa grasa gratis grava grave
grieta grillo gripe gris gritar grosor grúa grueso grumo grupo guante guapo guardar guerrero guía guijarro guinda guiño guion guisante
guiso guitarra gusano gusto
haba haber hábil hacer hacha hacia hada halcón hallar hamaca hambre harina hasta haya hazaña hebilla hebra hechizo hecho helado hélice
hembra heno herencia herida hermano héroe herrero hervir hidalgo hiedra hielo hiena hierba hierro hígado higo hija hilo himno hinchar hipo
historia hocico hogar hoguera hoja hola hombre hombro honor hora horizonte hormiga horno hostal hoyo hueco huella huerta hueso huevo huir
humano húmedo humilde humo hundir huracán hurón
ibérico iceberg ícono idea ideal idioma ídolo iglesia igual ilusión imagen imán imitar impar imperio impulso incluir indio índice infancia
inferior informe ingenio inicio injerto inmenso insecto insignia instante intenso intentar interés íntimo intuir inútil invento invierno invitar
inyectar ira iris irónico isla islote itinerario izar izquierda
jabalí jabón jaguar jalea jamón jarabe jardín jarra jaula jazmín jefe jengibre jerez jersey jinete jirafa jornada joroba joven joya juego
jueves juez jugar jugo juguete juicio julio junco junio juntar jurar justo juvenil
kilo kiosco kiwi koala
labio labor labrar lacio lado ladrillo lagarto lago lágrima laguna lamer lámina lámpara lana lancha langosta lanza lápiz largo larva lástima
lata látigo laurel lavar lazo leal lección leche lector leer legumbre lejano lema lengua lento leña león leopardo lesión letra levantar leve
ley leyenda libélula libertad libre libro licor líder liebre lienzo liga ligero lima limón limpio linaje lince lindo línea lino linterna lío
líquido liso lista listo litro llama llano llave llegar llenar llevar llorar lluvia lobo loco locura lodo lógica lograr loma lombriz lomo lona
loro losa lote lotería loza lucha luego lugar lujo lumbre luna lunes lupa lustre luto luz
macarrón maceta machete macizo madera madre madurar maestro magia magnolia mago maíz majestad maleta malla mamá mamífero manada manantial
mancha mandar mandíbula manejar manga mango manivela mano manojo manta manteca mantel manzana mañana mapa máquina mar maraca marca marcha
marea marfil margen marido marino mariposa mármol marrón martes martillo marzo masa máscara mástil matiz matorral mayo mayor mecha medalla
media médico medida medio médula mejilla mejor melena melocotón melodía melón membrana memoria menor mensaje menta mente menú mercado merecer
merienda mérito mermelada mesa meseta meta metal método metro mezcla miedo miel miembro mientras miércoles miga mil milagro militar millón
mimbre mina mineral minuto mirada mirlo misa misión mismo mitad mito mochila moda modelo moderno modo mojar molde moler molino momento
moneda monje mono montaña monte montón morado morder moreno morsa mortero mosca mosquito mostaza mostrar motivo moto motor mover móvil
mozo muchacho mucho mudanza mueble muela muelle muestra mujer mula multa mundo muñeca muralla murciélago museo musgo música muslo
nabo nácar nacer nación nadar nadie naipe nalga naranja nariz narrar nata natural nave navidad neblina necesitar negar negocio negro nervio
neto neutro nevar nido niebla nieto nieve ninguno niño níquel nivel noble noche nómada nombre norma norte nota noticia novato novela noveno
noviembre novio nube nuca núcleo nudo nuera nueve nuevo nuez número nunca nutria nutrir
oasis obedecer obispo objeto oblea obra obrero obtener ocasión océano ochenta ocho ocio octavo octubre oculto ocupar odio oeste oferta oficio
ofrecer oído oír ojal ojo ola oler olivo olla olmo olor olvido ombligo onda ópera opinar oponer optar oración orden oreja orgullo origen
orilla oro orquesta ortiga oruga osadía oscuro oso ostra otoño otro oval oveja óvalo oxidar oxígeno oyente ozono
paciencia pacto padre paella página pago país paisaje pájaro pala palabra palacio paladar palco pálido palma palo paloma pan panal pandero
panel pánico pantalla pañuelo papel paquete parada paraguas parar parcela pared pareja pariente parque párpado parra parte partir pasa pasaje
pasar paseo pasillo paso pasta pastel pastor pata patio pato patria patrón pausa pavo payaso peatón pecho pedal pedir pegar peinar pelar
peldaño pelea película peligro pelo pelota peluca pena pensar pepino pequeño pera percha perder perdiz perejil pereza perfil perfume perico
perla permiso perro persona pesa pesar pescado peso pestaña pétalo petróleo pez piano picar pico pie piedra piel pierna pieza pijama pila
pilar píldora piloto pimienta pincel pino pintar pinza piña piñón pionero pipa pirata pisar piso pista pizarra placa placer plan plancha planeta
plano planta plata plátano plato playa plaza plazo pleno pliego plomo pluma pobre poco poder poema poeta polen policía pollo polvo pomada
pompa poner popa poquito portal postre potro pozo pradera precio pregunta premio prensa preso primo princesa prisa prisma probar producto
profundo promesa pronto propio prosa provecho proyecto prueba público pueblo puente puerco puerta puerto pulga pulgar pulir pulmón pulpo pulso
punta punto puñado puño pupila puré puro
quedar quejar quemar querer queso quieto química quince quinto quitar quizá
rábano rabo ración radio ráfaga raíz rama ramo rana rancho rango rápido raqueta raro rasgo rastro rato ratón raya rayo raza razón reacción real
rebaño recado receta recibo recio recto recuerdo red redondo reducir refrán refugio regalo regar regla regreso reina reír reja relato reloj
remar remedio remo renglón reno renta repasar reposo reptil rescate residir resina respeto resto retar retrato reunir revés revista rey rezar
rico riego rienda riesgo rifa rincón riñón río risa ritmo rito rival rizo robar roble robusto roca rocío rodar rodilla roer rojo rollo
romero romper ronda ropa rosa rostro roto rubí rubio rueda rugir ruido ruina ruiseñor rumbo rumor rural ruta rutina
sábado sábana saber sabio sabor sacar saco sagrado sal sala salado salario salida salir salmón salón salsa saltar salud saludo salvar sandalia
sandía sangre sano santo sapo saque sardina sartén sastre satélite sauce sazón secar seco secreto seda sede seguir segundo seis sello selva
semana semilla senda sendero sentir seña señal señor sépalo septiembre sequía ser sereno serie serio serpiente servir sesenta seta setenta
siempre siesta siete siglo signo sílaba silbar silencio silla símbolo simple sincero sirena sistema sitio sobre sobrino sofá sol solapa soldado
soledad sólido solo soltar sombra sombrero sonar sonido sonrisa soñar sopa soplar sordo sorpresa sortija sosiego sótano suave subir suceso suelo
sueño suerte sufrir sujeto suma superar surco sureño surgir suspiro sustento susto sutil
tabaco tabla taburete taco tacto tajo talar talento talla taller tallo talón tamaño tambor tango tanque tanto tapa tapia tapiz tapón taquilla
tarde tarea tarifa tarjeta tarro tarta taza teatro techo tecla técnica tedio teja tejado tejer tejido tela teléfono tema temblar temer temor
templo temprano tenaz tender tener tenis tenue teñir teoría tercero terco término ternura terraza terreno tesoro testigo tetera texto tez tía
tibio tiburón tiempo tienda tierno tierra tieso tigre tijera timbre tímido timón tinta tinte tío tirar titán título tiza toalla tobillo tocar
tocino todo toldo tomar tomate tonel tono tonto topo toque tórax torcer tordo tormenta tornillo toro torre tortuga tos tostada total trabajo
traer tráfico tragar traje trama trampa trance tranquilo trapo tras trato trazo trébol trece tregua treinta tren trenza trepar tres tribu trigo
trineo tripa triste triunfo trofeo trompa tronco trono tropa trote trozo trucha trueno trufa tubo tuerca tulipán tumba tumbo tumulto túnel
túnica turbio turno turrón tutor
ubicar ubre último umbral unidad unir uno untar uña urbano urgente urna usar útil uva
vaca vacío vagón vaina vajilla vale valiente valle valor vals válvula vapor vaquero vara variar varón vaso vecino vega vejez vela velo
veloz vena vencer venda vender veneno venir venta ventana ver verano verbo verdad verde vereda verja verso vestido veterano vía viaje vibrar
vicio vida vidrio viejo viento viernes viga vigor villa vinagre vino viña violín virtud visera visita vista viudo vivaz vivir vivo volar volcán
volumen volver voto voz vuelo vuelta
yacer yate yegua yema yerno yeso yodo yogur yuca yunque
zafiro zaguán zambullir zanahoria zapato zarza zodíaco zona zorro zumbido zumo zurdo
abalorio abedul abertura abeto abismo abonar abordar abrasar abrumar absurdo abuso acacia acaso acatar accidente acechar aceituna acelerar
acicate acogedor acomodar acoplar acortar acrobacia actitud acuático acusar adaptar adelgazar adentro adherir adjunto admirar adoquín adornar
adquirir aduana advertir afable afeitar afición afirmar aflicción afluente aforo afrontar agarrar agasajo agradar agravar agredir agricultor
agrupar aguacate aguantar aguardar agudo águila ahogar ahondar ahorrar ahuyentar airoso ajetreo ajustado alabanza alacrán alado alargar alboroto
alcanzar alcohol aldaba alegría alejar alentar alfabeto alfarero algarabía alguien alhaja alianza alicate aliviar almendro almíbar alondra alpaca
alpiste altavoz altivo alucinar alumbrar alunizar amanecer amante amarrar ambiente amenaza amígdala amoldar amontonar amparar ampliar amuleto
analizar anaquel anchura andamio anécdota anestesia anexo anfiteatro anguila angosto anhelo animar anochecer anónimo ansiedad antesala antifaz
antojo anzuelo apacible apagado aparecer apartar apasionar apegar apellido apenar apilar aplanar aplastar aplazar apodar apogeo aposento apostar
apoyar apreciar apremiar aprendiz apresar apropiar aproximar apuntar arándano arbitrar arcángel archivo arder ardor arenal argumento aristocracia
armadura armazón arrancar arrasar arrastrar arrebato arrecife arriesgar arrimar arrodillar arrojar arrullo arsenal artefacto artículo asador
asamblea ascender ascua asear asegurar asemejar asentar asignar asistir asomar asombrar aspa aspecto astronauta astucia atacar atalaya
atardecer atascar ataúd atender aterrar atesorar atizar atmósfera atónito atracar atraco atrapar atravesar atreverse atrio atrofia atropello
atuendo aturdir auge augurio aullido aupar auricular ausencia autopista auxilio avalancha avanzar avaricia aventar avergonzar averiguar avisar
avivar axila ayudante azotar azucena azulejo
bagaje bailarín bajeza balada balanceo balbucear balneario balsa bálsamo bambalina banquete baraja barandilla barbilla barbero barómetro barquillo
barranco barrena barrote barullo báscula bastidor bastión batallón batea batuta baya bayeta bazar beato becerro bedel beige béisbol belleza
bendecir benigno berbiquí bermellón besugo betún biberón bicicleta bienestar bifurcar bimestre biografía bisiesto bizcocho blandir blando
blanquear blindar bloquear bocado bocadillo bocanada bochorno bodegón bofetada bogar bohemio boicot bolera bollo bombero bonanza bono boreal
borrar borrego bosquejo bostezo botánica botar botica bramar brasa bravura brazalete brigada brincar brioso brocha brocheta broncear brotar
bucle bufete bulevar bullicio buñuelo burócrata buscador butano
cabalgar cabecera cabestro cabezal cabildo cabizbajo cabriola cacahuete cachorro cacique cadencia caducar cafetera caimán calabozo calamidad
calcetín calcular calidez cálido califa caligrafía cáliz callado callejón calzar camarote camerino caminante camioneta campana campanario
campesino camuflar canalla canario canasto candela candelabro candil canica canilla canjear canoso cansancio cantante cantera cantimplora
cantina canto capataz capitán capote capullo caqui carabela caramelo caravana carbunclo carcajada cardenal cardo carecer carga cargo caridad
carmesí carnaval carpintero carroza carruaje cartero cartucho casar cascabel cáscara casete casillero casona castaño castigo casualidad
catalejo cátedra catre caucho caverna cazador cazo cebada ceguera celador celeridad celo celosía cencerro ceniciento cenit censurar centella
centinela centímetro céntimo cepa cerámica cercano cerilla cerradura cerrojo cerveza cesar cetro chabola chaflán chamarra chancla chaparrón
chaqueta charanga charol chasis chato chicharra chillar chinchón chirriar chivo chófer chorizo chorro chubasco chupar churro cicatriz
ciclismo cicuta cien cieno cigarra cilindro cincel cinturón ciudadano cizaña clan clarear clarín clarinete clasificar claustro cláusula clavija
clemencia clérigo clip cobijar cobijo cobrar cocodrilo codicia código codiciar cogollo cohesión coincidir cojera colador colapso colchón colección
colegial cólera coleta colgante colindar colisión collado colmado colocar colonia coloso columpio comadre comarca combinar comenzar comercio
comisaría cómoda compañero comparar compartir compasión complejo cómplice componer comprender compuesto conceder concejo concha concierto
concluir concurso condena condimento conducir conejera confesar confín confiar conforme confuso congelar conmover conocido conquista consagrar
consejero consola constante construir consumo contagio contener contorno contrato convenio convento convidar convoy copla coraje corcel cordial
cornisa coro corral corregir corriente corromper corsario cortejo cortijo corzo cosmos costal costilla costura cotorra cráneo creciente crédito
cresta criado criatura crin crisis cristiano criterio crítica crónica croqueta crucero crujir cuajar cualidad cuartel cubierta cubierto cucaracha
cuchicheo cuclillas cucurucho cuestión culminar culto cumplido cuneta cúspide custodia cutis
dádiva dalia damasco danzar dársena debatir década decano decente decorar decreto dedicar deducir defender deglutir degustar dehesa delantal
deleite deletrear deliberar delicado delirio demás demoler densidad dental dentista denuncia depender deplorar deprimir derecha derramar derribar
derrota desalojo desatar descolgar describir descubrir desdén desecho desembocar desenlace deseo desgaste deshacer desliz desorden despertar
despedir despejar despensa desplazar destacar destello destreza destruir desvelo desviar detective detener determinar devorar diagonal diálogo
diana dibujante dictar diferir difundir difuso digerir dignidad diluir dimensión diminuto dinamo dintel diputado directriz discutir disfrutar
disolver disparo dispersar disponer distraer diurno divertir divino divisa divulgar doblez docente doctrina documento dogma doler dominar
domicilio donaire doncella dormitorio dosel dotar duelo duende duradero
ebrio ecuador edición edicto edredón eficiente efigie efusivo ejecutar elástico electo elevar eludir embarcar embestir emblema embrión embuste
emerger emigrar eminente emisario emitir empalme empapar empaste empatar empeorar empinar empleado empujar enagua enano encaminar encantar
encargo encender encerrar enchufar encierro encogido encomendar encrucijada encuesta enderezar endulzar enemigo energía enfermero enfrentar
enfriar enfurecer enganchar engordar engranaje engullir enjambre enjuagar enlazar enmendar enojo enredar enriquecer ensamblar ensanchar ensuciar
entablar entierro entonar entrañas entrenar entretener entrever entusiasmo envejecer envoltorio envolver épico epílogo equilibrio equivocar erguir
ermita erosión errante escabeche escalar escalofrío escándalo escaparate escarcha escarola escasez escayola escéptico esclusa escolta escombro
escotilla escribano escritorio escrúpulo escuadra escuálido escultor escupir esfinge esforzar eslabón esmeralda esmero espacial espantar esparcir
espátula especia espectro espeso espía espiral esplendor espolón esquela esquivar estallar estampa estanque estatura estera estiércol estimar
estirar estorbar estornudo estrategia estremecer estribo estruendo estuche estupor etapa eufórico evadir evaluar evocar exagerar exaltar excavar
excelente excursión exhalar exhibir exigir exilio existir exprimir extender exterior extinguir extraer
fachada faena faisán falange falsear fanfarria fanático fardo faringe fármaco farmacia fastidio favorito fealdad fecundo felino felpa fémur
fenómeno feraz fermentar ferretería fértil fervor festejo fiambre fiasco fidelidad fieltro filamento filosofía finca fingido firmeza fiscal
fisura flacidez flamenco flanco flaqueza flexible flojo florecer floresta florero flotar fluir fogón folclore follaje fomentar fonda fontanero
forastero forjar forraje fortaleza forzar fósil fotógrafo fracción fragancia fragua franela franja frasco fraterno frecuente fregona frenar
fresno friso frontera frotar fruncir frustrar fuelle fugaz fugitivo fulminar fundar fundir fúnebre furgón furor fusión fustigar
gabán gabinete gaceta gafe galán galardón galeón galopar galvanizar gamba gamuza ganadero gandul ganglio gangrena garabato garantía garbo
garfio gargajo gárgola garito garrafa garrapata garrote gasolina gastado gatillo gaucho gazapo gelatina gema generoso géneros gentil geografía
geometría gerente gestionar gigantesco gimotear ginebra girándula glacial glándula gleba gobierno golosina golpear gomina góndola gorjeo
gorrión gotera gozne grabado gradual graduar gramo granada granero granito granizo granja grapadora gratitud gravilla gremio greña grieta
grifo grosella grotesco grulla gruñir gruta guadaña guarida guarnición guateque guayaba gubia guerra guijarro guirnalda guisado gula gurú
habitar habitual hábito hablar hacienda halagar hallazgo halo hamburguesa haragán harapo hartar hastío hebreo hectárea hechura helecho hélice
hemisferio herbívoro heredar herir hermoso herradura herramienta hervidero hiato hidratar hígado higiene hilera hincapié hincha hinojo hipoteca
hirsuto hispano hogaza hojalata hojear holgado holgazán hollín homenaje hondo hongo honesto horario horca horchata hormigón horóscopo horquilla
hortaliza hortensia hospedar hostil hotel hoz huelga huésped huevera humareda humedad humor hurgar husmear
idear idéntico ideología idílico idóneo ignorar iluminar ilustre impacto impedir imperar implorar imponer importar impostor imprenta imprimir
improvisar impuesto inaugurar incendio incienso incisivo inclinar incómodo incordio incubar indagar indeciso indemne indicio índigo indulto
industria inédito inercia inerte infame infantil infarto infinito inflar influir infusión ingenuo ingrato ingrediente inhalar iniciar injuria
inmóvil innato inocente inquieto insinuar insistir insólito inspirar instalar instinto insular íntegro intemperie intercalar interior intérprete
intervalo intrépido intriga inundar inusual invadir inventar invertir investigar invisible involucrar irrigar isleño izquierdo
jabalina jaca jacinto jadear jaleo jaqueca jarcia jaspe jauría jazz jerarquía jeringa jeroglífico jilguero jirón jocoso jolgorio jornal
jovial jubilar júbilo judía juerga jugoso juglar junta jurado juramento juventud juzgar
labrador lacayo lacónico lacre ladear ladera ladrar lamento laminar lanzar lápida lapso largar lastre latente latido látex latir latitud lavabo
lavanda laxo lazada lealtad lecho lechuga lechuza legado legal legión legítimo legua lejía lencería lentejas lentitud lesionar letargo letrero
levadura léxico leyes liberar libra librería libreta liceo licuar lidiar lienzo ligar lija lila limar limbo limitar limosna limpiar linaza lingote
linterna lirio lisonja litera litoral liturgia llamar llamarada llanta llanura lleno llovizna lluvioso loable lóbulo locomotora locuaz lodazal
logro lombarda longitud losa lozano lubricar lucero lúcido lucir lucro lúgubre lujoso lumbar luminoso lunar lustrar luxación
macabro macizo macuto madeja madriguera madrugada madurez magistral magnate magno magullar majestuoso maldad maleza malgastar malicia maltrecho
mamar mampara manantial manar manchar mandato mandil mandolina manejo manglar maniobra manojo manosear mansión manso mantener manubrio manuscrito
máquina maquinista marabunta maravilla marchar marchitar marcial marejada marginal marisco marítimo marmota marqués martirio masaje mascar
masticar mástil matar maternal matrícula matriz maullar mazapán mazmorra mecánico mecer mediano medir meditar medusa mejorar melancolía
melena membrete menear menester mengua menudo mercader mercurio merced merendar meridiano mesón mestizo metáfora meteoro meticuloso mezquino
microbio miga migrar milenio milla mimar mímica mimo minar minucia miope mirador miserable misterio mitigar mobiliario mocasín modales modesto
modificar módulo mofarse mohín moho mojado molestar molécula molusco monarca monasterio monótono montura monumento moraleja morar mordaz
mordisco morral mortal mosaico mostacho motín mozalbete mudar mudo muestrario mugido mugre multitud mundial municipio muñeco murmullo musa
muscular mutuo
nacarado nacimiento nadador nalgada naranjo narciso nardo nasal natación nativo naufragio náusea náutico navaja navegar necio néctar negativo
negligente negociar negrura nenúfar nervioso nevada nevera nicho nidal nimbo nítido nitrógeno nobleza nocivo nocturno nodriza nogal nómina
nordeste noria nostalgia notario notorio novedad noviazgo nublado nudillo nulo nupcias nutritivo
obelisco obertura obeso objetar oblicuo obligar oboe obsequio observar obstáculo obtuso obviar occidente ocultar ocurrir odiar odisea
oficina ofrenda ojera ojeada ojiva olfato oligarca olivar olvidar omitir ondear ondular onza opaco operar opíparo oportuno oprimir óptica
optimista opulento oráculo orador orangután oratorio orbe órbita ordenar ordeñar orégano orfebre organismo orgánico oriente orificio ornato
orondo oropel ortografía osamenta osar oscilar ostentar otear otorgar ovación ovillo oxidación oyente
pabellón pacer pacífico padecer padrino paja pajar pajarita palanca paleta paliza palpar palpitar pancarta pandilla panorama pantano pantera
pañal papagayo papaya papelera paradero paradoja paraíso paraje paralelo parásito parcial pardo parentesco paridad parlamento parodia paroxismo
parpadear párrafo parroquia parsimonia particular partida pasado pasarela pasatiempo pasmar pastar pastilla pastizal patada patente paterno
patín patinar patología patrulla paulatino pecera pechera pedazo pedestal pedregal pegajoso peinado pelaje peldaño pelícano pellejo pellizco
peluquero pelusa penal pendiente pensión penumbra peñasco peonza pepita percibir percusión perdurar perecer peregrino perenne perezoso perfecto
perforar pericia perímetro periódico perjuicio perjurar permitir perpetuo perplejo perseguir persiana persistir pertenecer pesadilla pescador
pesebre pestillo petaca petirrojo pétreo piadoso piar picante picardía pichón picotazo pifia pigmento pilotar pimiento pináculo pinchar pingüino
pinocho pintoresco piquete pirámide piropo pirueta pisada pistacho pistón pitar pivote placenta plagar plancton planear plantilla plasmar
plasta plátano platillo plebe plegar plenitud pletórico plomizo pluvial poblado podar podio podrido polea polémica polilla polvoriento
ponderar poniente pontífice popular porcelana porche porfiar poroso portada portátil portavoz portería porvenir posada poseer posible postal
poste postergar postizo postura potable potencia potestad práctica pradera precaución preciso precoz predecir predio pregón prejuicio preludio
prematuro prender preocupar preparar presagio presidir presión prestar presumir pretexto prevenir prever primavera primicia principio prior
prisión privado proa probable proceder proclamar prodigio proeza profesor profeta prólogo prolongar promedio promover pronóstico propagar
propicio propina proponer prórroga prosperar proteger protesta provincia provocar próximo prudente puchero pudor pueril pujar pulcro pulido
pulpa pulsera puntal puntería puntilla puñal pupitre puridad púrpura
quebrar quehacer quejido quema quieto quijada quilla quimera quinqué quiosco quirúrgico quisquilloso
rabia rabieta racimo racional radiante radical ráfaga raído rallar rampa ranura rapaz rapidez rapiña raposa rareza rasante rascar rasgar
raspar rastrillo rastrojo ratonera raudal realce reanudar rebajar rebanada rebelde reblandecer rebosar rebotar recalcar recaudar recelo
rechazar rechinar recinto recipiente recitar reclamar recluir recobrar recoger recompensa reconocer recorrer recortar recrear recubrir recular
recurso redactar redil redimir reembolso reflejo reflexión reforma refrescar refrigerio refuerzo regañar regata regazo régimen regio registro
regocijo regordete rehén reinar reiterar rejilla rejuvenecer relámpago relevo relieve relinchar relleno remanso remedar remendar remitir remolacha
remolino remolque remover renacer rencor rendir renovar reñir reparar repartir repente repisa replicar reportaje reposar reprender reprimir
reptar repudiar repuesto requerir resbalar rescoldo resentir reservar resfriado residuo resistir resolver resonar respaldo respirar resplandor
respuesta restar restaurar resuelto resumen retablo retener retirar retoño retorcer retozar retumbar reunión revelar reventar reverencia revisar
revolver rezagar rezumar ribera ribete ridículo rigor rimar rinoceronte riqueza rizar robusto rociar rodear rodeo roedor rogar romance
roncar ronco ronronear roñoso rosal rosario rosquilla rotonda rótulo rotundo rozar rubor rudeza rudo rugoso rumiar rupestre rústico
sabana sabiduría sabroso sacerdote saciar sacudir saeta sagaz sahumerio salamandra salero salina saliva salpicar saltamontes salvaje salvia
sanar sandalia sanear sanguijuela sarcasmo sardónico sarmiento sarna sastrería saturar saúco savia sazonar sebo secuela secundar seducir
segar seglar seguridad selecto sellar semáforo semejante sembrar semestre senado sencillo seno sensato sentado sentencia señuelo sequedad
serenata serrano serrín sesgo severo sidra siega siembra sien sierra sigilo silbato silueta silvestre simiente simpatía simular sinfonía
singular siniestro sinuoso sirope sobaco sobornar sobrar sobresalto sobrio socavar socio socorro sofocar soga solanera solar solemne solera
solícito solitario sollozo solsticio soltero soluble solvente someter sonaja sonajero sondear sonoro soñoliento soportar sorber sorbo
sordina sortear sosegar sospecha sostén sotana suavizar súbdito subrayar subsuelo suburbio suculento sudar suegra sueldo sugerir sujetar sulfuro
sumar sumergir suministro sumo suntuoso superficie súplica suplir suponer suprimir surtidor susurro sutura
tabaquera tabique tablero tacaño tachar tahúr tajada taladro talismán tamiz tanteo tapadera tapete tapicero taquigrafía tararear tardanza
tarima tartamudo tasca tatuaje taxista tazón tecleado tediosos tejón telar telaraña telescopio telón temario temerario temperar tempestad
templar temporal tenacidad tenaza tenedor tenor tentación tentar tenue teñido terapia terciopelo termita termómetro ternero terraplén terruño
tertulia tesón testarudo tétrico tibieza tiesto tilde tilo timar tímpano tinaja tinglado tintero tintorero tiovivo tirante tiritar tirón
titubear tiznar tocadiscos tocayo toldo tolerar tomillo tonada tonel tonificar topacio tope tópico toronja torpe torrente tórrido tórtola
tortilla torvo tosco tostar trabar tradición traducir tragedia traición trailla trajín tramar trámite tramo trampolín tranvía trapecio
trascender trasero trasladar trasnochar traspasar trastero trasto tratado travesía travieso trayecto trazar trémulo trepidar triángulo
tributo tricolor trigal trillar trinar trinchera trío tripulación trisca triturar trivial trombón trompeta tropel tropezar tropical trovador
truco trufa tuétano tufo tugurio tumbar tumor tumulto tunda tupido turbante turbina turista turquesa tutela
ubérrimo ufano ulcerar ulterior ultraje umbrío unánime ungüento único uniforme unísono universo untuoso urdir urraca usual usura utensilio
vacante vacilar vacuna vado vagar vaho vaivén valija valorar vampiro vanguardia vanidad vaquilla vaqueta varilla varonil vasija vástago vasto
vaticinar vedar vegetal vehículo veinte velar velero vello vellón velorio venado vendaje vendaval venerar venganza venial ventaja ventilar
ventisca ventura veraz verbena verdor verdugo vergel verídico verja verruga versátil vértebra vertical vértigo vestíbulo vestigio vetusto
viajero víbora vicario vidente vidriera vigente vigilar vigoroso vileza vinculo viñedo violeta virar viril virtual viruela visado viscoso
visible visón víspera vistazo vitalicio vítores vitrina vivaracho vivero vocablo vociferar volante volátil voltear voluntad vorágine voraz
vulgar
yacimiento yantar yarda yedra yelmo yerba yermo yesca yunta yuxtaponer
zafarrancho zafar zaga zagal zalamero zamarra zampar zancada zancadilla zángano zanja zapatero zarandear zarpar zarzamora zigzag zócalo
zoológico zozobra zumbar zurcir zurrón
"""

# ---- reglas ----
def sin_tildes(w):
    return ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn' or c == '̃')  # la ñ se queda

def clave(w):
    k = unicodedata.normalize('NFC', sin_tildes(w.lower()))
    k = k.replace('ñ', 'N')
    k = re.sub(r'ch', 'C', k)             # ch, aparte de la c
    k = re.sub(r'qu(?=[ei])', 'k', k)
    k = re.sub(r'gu(?=[ei])', 'g', k)
    k = re.sub(r'gü', 'gu', k)
    k = re.sub(r'c(?=[ei])', 's', k)
    k = re.sub(r'g(?=[ei])', 'j', k)
    k = k.replace('c', 'k').replace('z', 's').replace('v', 'b').replace('ll', 'y').replace('h', '').replace('x', 'ks').replace('w', 'u')
    k = re.sub(r'y$', 'i', k)
    k = k.replace('C', 'ch').replace('N', 'ñ')
    return k

def lev1(a, b):
    """¿difieren en una sola letra (cambio, alta o baja)?"""
    if a == b: return False
    if abs(len(a) - len(b)) > 1: return False
    if len(a) == len(b):
        return sum(1 for x, y in zip(a, b) if x != y) == 1
    if len(a) > len(b): a, b = b, a
    i = 0
    while i < len(a) and a[i] == b[i]: i += 1
    return a[i:] == b[i + 1:]

PROHIBIDAS = set('aborto arma armadura armas asalto ataque atacar ataúd batalla batallón bomba bombero cáncer cárcel celda condena crucifijo'
                 ' delito denuncia desnudo dios diablo droga enfermedad entierro fusil guerra guerrero gangrena hígado infarto iglesia judía judío'
                 ' matar mortal muerte muerto nalga nalgada negro policía preso prisión religión sangre sexo soldado tumba tumor veneno vicio'
                 ' viuda viudo violación cadáver suicidio asesino ladrón pistola rifle misa obispo santo sagrado clérigo monje rezar misión'
                 ' bautizo cristiano hebreo pecho ubre teta culo muslo gitano indio hispano sepulcro velorio difunto herida lesión lesionar'
                 ' tortura esclavo esclusa sarna viruela hostia catarata cura gripe fiebre vacuna embrión mamar abuso odio odiar venganza'
                 ' traición injuria agredir puñal navaja machete verdugo rehén robar ladrón mazmorra ebrio maldad malicia garito chabola'
                 ' mordaz infame vileza negrura mortero fosa calabozo ataud degollar cuchillo espada lanza dardo arco flecha cañón balazo'
                 ' crimen castigo pelea golpe golpear azotar paliza bofetada tunda zurra látigo garrote horca lúgubre ceguera desdén pifia sordo'
                 ' ciego mudo cojo cojera gordo flaco feo tonto necio loco locura vago zafio grotesco ridículo miserable pena llorar triste'
                 ' tristeza dolor doler fracaso culpa deuda pobre ruina hambre defecto fealdad pereza perezoso haragán holgazán gandul tacaño'
                 ' avaro usura mentira engaño fraude estafa burla fastidio asco náusea sucio mugre roñoso miedo pánico terror horror temor'
                 ' angustia ansia ansiedad lamento sollozo quejido gemir agonía pesadilla amenaza odioso rencor cobarde traidor hostil'
                 ' impostor secuestro tortura veneno envenenar deprimir deplorar atrofia luto fúnebre tétrico macabro difunto'.split())

# Fuera también (coordinación, 5 nov 2026: «fuera "canalla", "cerdo", "basura" y cualquier otra palabra insultante, vulgar, violenta,
# sexual, de enfermedad o muerte, política, religiosa, de marca o que pueda incomodar a un abogado o una clínica al leerla en voz alta:
# solo palabras neutras y fáciles de pronunciar y de distinguir por teléfono»). Revisadas una a una, también con los sentidos de
# Colombia, México, el Caribe, el Cono Sur y España; y las que se confunden con la propia pantalla (número, código, nivel, firma…),
# las extranjeras de pronunciación rara y las que son sobre todo nombres propios.
FUERA_LECTURA = set("""
canalla cerdo puerco basura bestia besugo bicho borrego bruja buitre cabra camello ganso golfo gorila gusano flojo foca gallina inútil
ingrato lacayo melón morsa obtuso orondo payaso pellejo pelota plebe pluma terco vulgar chato chorizo víbora madre criado novio pareja
almeja amante beso caricia celo chupar cola conejo desear deseo desliz dominar empinar enagua encaje follaje fregar gozar íntimo jadear
lamer leche macizo masaje menear miembro mojar mojado pájaro palpar pandero papaya paquete pepino pico picante piropo polvo poseer
precoz pudor sostén tentar tocar tragar vibrar viril tetera labio agujero humedad húmedo alcoba adulto higo nupcias
abrasar acechar afilar apresar arsenal atizar atracar atraco aturdir blandir botín brigada cartel combate convoy coyote dañar defensa
detener disparo escolta espía fuga gatillo granada herir impacto invadir legión marcial mecha mina morder ojiva plomo ráfaga rapiña
reja rendir saeta tajo tanque tregua acusar demanda decreto edicto fiscal indulto juez juicio jurado junta leyes multa notario objetar
penal tutela sujeto prueba indagar eludir evadir falsear falso fingido fingir pirata tahúr truco urdir trama ocultar oculto turbio
husmear pinchar fuego choque colgar garfio clan untar lucro capote faena lidiar celador
benigno bulto caída cicuta colapso cráneo crónica delirio duelo fármaco faringe fatiga fémur fiambre ganglio gasa germen gota grave
guadaña hongo incubar inerte injerto inmóvil jaqueca jarabe jeringa lápida legado lejía letargo lombriz lóbulo lumbar lunar lúcido
matriz médula miope moho muestra muela nasal nervio nocivo nodriza ojera operar padecer pálido pañal píldora plagar pulga pulmón
rabia regla rigor sufrir sutura tieso tórax torcer tripa trompa urna vejez cerebro ceniza cortejo encía ayuno fumar alcohol licor
ginebra jerez tasca juerga sobrio látex eterno susto aterrar sequía inundar huracán oxígeno axila sobaco gargajo grano hincha
alcalde alianza altar alteza amuleto beato boicot cabildo cacique califa cáliz capilla cruz derecha divino dogma electo ermita éxodo
exilio facha falange fraile gloria gurú hechizo himno huelga ídolo imán limbo limosna mandato mestizo migrar milagro militar monarca
moreno nación nativo navidad oráculo oprimir orgullo pacto padrino paraíso patria pesebre piadoso prior reina rito rojo seglar senado
sotana templo trance tribu trono venial general liberar líder fervor oblea
adobe jaguar corona clarín pinocho diana ecuador damasco jacinto narciso iceberg beige jazz jersey kiwi clip
absurdo abrumar aburrir altivo apenar apuesta bajeza banda caos cizaña codicia crisis crítica débil demoler derrota desecho embuste
enemigo enfado enojo envidia error exceso farsa fiasco gritar chillar huir lástima lágrima lodazal mofarse negar recelo rifa lotería
tedio suceso cogollo colocar perico yerba grabar
nadie ninguno nulo número mensaje llamar palabra código firma nivel núcleo órbita mosaico escudo blindar cifra orden
adivino alabanza alucinar alumbrar amígdala aplastar apropiar arcángel arrebato asamblea avaricia bastión bendecir berbiquí bloquear
camuflar cero colonia concejo cuartel culto derecho emigrar erguir hacha hembra hierba hinchar huella lecho minar nicho obeso padre
patrón pegar piquete podrido popular presión profeta pulso quinqué rabieta radical raza rebajar rebelde receta recluir redimir
reforma refugio regañar régimen relleno renacer rescate retablo retener romance rosario salvaje secreto secuela señuelo sesenta sidra
simular socavar socorro sofocar soledad soltero someter súbdito súplica tacto temblar terapia testigo tímpano tiritar trailla trasero
tratado tributo tropa tuétano tumbar tumulto ulcerar ultraje untuoso urgente vampiro vanidad varonil vello venado venda vendaje venerar
verruga vértigo vicario vidente vigilar viscoso zángano zodíaco zozobra
cardenal cartucho censurar chinchón cicatriz claustro codiciar colegial colmillo conejera confesar contagio corsario costilla custodia
defender deglutir dentista derramar desalojo diputado discutir divulgar doctrina doncella quemar sebo
cláusula conforme ejecutar embajada embestir emisario empeorar encierro encuesta engordar enmendar sello
ensuciar entrañas escombro escuadra esconder ácido anónimo auxilio célula esposa fecundo fértil indemne intriga jauría joroba latente
liga manchar peligro géneros asilo espectro espíritu estómago estrecho eufórico ligar fanático fantasma farmacia flacidez flaqueza
""".split())

def main():
    pool = []
    vistos = set()
    for w in POOL.split():
        w = w.strip().lower()
        if not w or w in vistos: continue
        vistos.add(w)
        if not re.fullmatch(r'[a-záéíóúñü]{4,8}', w): continue
        if w in PROHIBIDAS or w in FUERA_LECTURA: continue
        pool.append(w)
    # orden de preferencia: las más cortas primero (se leen mejor), luego alfabético
    pool.sort(key=lambda w: (len(w), sin_tildes(w)))
    elegidas, claves, raices, letras = [], [], set(), []
    for w in pool:
        k = clave(w)
        r = (sin_tildes(w)[:4], len(w))
        if k in claves or r in raices: continue
        if any(lev1(k, k2) for k2 in claves): continue
        # y tampoco por escrito (revisión independiente, 3 nov 2026: cesta/costa, gema/goma, caja/ceja u ocho/ocio pasaban porque
        # su clave fonética difiere en dos letras, pero escritas se quedan a una)
        e = sin_tildes(w)
        if e in letras or any(lev1(e, e2) for e2 in letras): continue
        elegidas.append(w); claves.append(k); raices.add(r); letras.append(e)
    print('candidatas', len(pool), '→ sin ambigüedad', len(elegidas))
    if len(elegidas) < 2048:
        print('FALTAN', 2048 - len(elegidas), 'palabras: amplía el POOL'); sys.exit(1)
    lista = sorted(elegidas[:2048], key=lambda w: (sin_tildes(w), w))
    assert len(lista) == 2048 and len(set(lista)) == 2048
    cuerpo = ',\n'.join('  ' + ', '.join("'" + w + "'" for w in lista[i:i + 12]) for i in range(0, 2048, 12))
    js = ("// GUARDIANA · Comunicaciones · las 2048 palabras de verificación de Ultra (3 Nov 2026; agencia, ronda 93). Cuatro de ellas, sacadas de\n"
          "// las claves de los dos equipos (cripto.js, palabrasDe: 11 bits cada una), se leen en voz alta en el chat y en cada llamada; si\n"
          "// coinciden en las dos pantallas, la conversación es directa entre los dos. Lista propia, generada por herramientas/palabras-ultra.py\n"
          "// con estas reglas: palabras neutras del español de 4 a 8 letras, sin nombres propios, sin palabras cargadas ni nada que incomode al\n"
          "// leerlo en voz alta (5 nov 2026), y sin ambigüedad al oído (ninguna\n"
          "// comparte su sonido con otra ni se queda a una letra de otra: casa/caza, gato/pato, hola/ola…). No cambiarla: cambiaría las\n"
          "// palabras de todas las conversaciones. Misma licencia que el resto del código (AGPL-3.0).\n"
          "'use strict';\n"
          "window.GuardianaPalabras = Object.freeze([\n" + cuerpo + "\n]);\n")
    open(SALIDA, 'w', encoding='utf-8').write(js)
    print('escrito', os.path.relpath(SALIDA, RAIZ), '·', len(lista), 'palabras · de', min(len(w) for w in lista), 'a', max(len(w) for w in lista), 'letras')

if __name__ == '__main__':
    main()
