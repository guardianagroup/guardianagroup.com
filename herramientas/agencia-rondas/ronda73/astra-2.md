# Ronda 73 · Astra 6 (gpt-6-astra, Cheaper Inference) · parte 2 (preguntas 9–11)

29 oct 2026, ~21:52. Texto copiado entre «ASSISTANT OUTPUT» y «Response headers». Se volvió a cortar por el tope de 4.096 tokens
del playground, a mitad de la tabla de amenazas (pregunta 10); la 11 (web frente a app nativa) no llegó: va en la parte 3.

## 1. Cifras: qué sabemos y qué no se debe publicar todavía

No conozco un recuento mundial fiable que reúna llamadas, SMS y mensajes de aplicaciones procedentes de desconocidos, distinguiendo publicidad, extorsión y estafas, sin duplicaciones. Tampoco conozco una cifra mundial comparable de personas mayores afectadas. No lo sé; sumar informes diferentes no resolvería ese vacío.

No tengo navegación en tiempo real en esta conversación. Estas son referencias conocidas para contrastar, no una certificación documental de actualidad ni de doble confirmación.

| Ámbito | Cifra y significado real | Fuente, año y enlace |
|---|---|---|
| Mundo: pérdidas por estafas | 1,03 billones de dólares estadounidenses estimados para el período anual estudiado. Es una extrapolación mediante encuesta, no dinero contabilizado denuncia por denuncia. Incluye estafas por distintos canales; no exclusivamente comunicaciones de desconocidos. | GASA, 2024, Global State of Scams Report. [Repositorio de investigaciones](https://www.gasa.org/research). |
| Estados Unidos: fraude | Más de 10.000 millones de dólares en pérdidas declaradas durante 2023. No representa todas las pérdidas reales ni exclusivamente llamadas o mensajes. | FTC, 2024, datos correspondientes a 2023. [Comunicado e informe](https://www.ftc.gov/news-events/news/press-releases/2024/02/nationwide-fraud-losses-top-10-billion-2023-ftc-steps-efforts-protect-public). |
| Estados Unidos: personas mayores | 101.068 denunciantes de 60 años o más, con más de 3.400 millones de dólares en pérdidas declaradas durante 2023. Son denuncias recibidas, no prevalencia en toda la población mayor ni exclusivamente estafas telefónicas. | FBI IC3, 2024, 2023 Elder Fraud Report. [Informe](https://www.ic3.gov/AnnualReport/Reports/2023_IC3ElderFraudReport.pdf). |
| Latinoamérica: ejemplo de llamadas publicitarias/molestas | Brasil: 32,9 llamadas de spam por usuario y mes, según la muestra y clasificación del proveedor. No permite calcular el total nacional ni regional multiplicándolo por la población. | Truecaller, 2021, Top Countries Affected by Spam Calls. [Informe](https://www.truecaller.com/blog/insights/truecaller-insights-2021-top-20-countries-affected-by-spam-calls). |
| Colombia | No dispongo de una cifra verificable y comparable que reúna comunicaciones no deseadas, pérdidas y mayores afectados, incluyendo WhatsApp. No lo sé. Las denuncias de extorsión o delitos informáticos no equivalen a ese universo. | Habría que contrastar publicaciones y metodología de Fiscalía, Policía y autoridades estadísticas colombianas. |

Criterio de publicación con dos fuentes:

- Ninguna fila anterior queda aquí aprobada bajo vuestro requisito: he identificado una fuente primaria por cifra.
- Una noticia que repite un informe aporta confirmación documental, no una medición independiente.
- FTC e IC3 no se confirman mutuamente: tienen universos distintos y pueden compartir denunciantes. No se suman.
- Si exigís dos mediciones independientes coincidentes, posiblemente debáis renunciar a publicar algunas cifras.

Para la web, mientras tanto: «Las autoridades documentan pérdidas por fraude y daños importantes a personas mayores. GUARDIANA impide que alguien abra una conversación contigo solamente por conocer tu número». Esta última afirmación exige que el consentimiento mutuo esté correctamente implementado, no solamente dibujado en la interfaz.

## 2. Número permanente: separar dirección, claves y recuperación

El número puede permanecer; las claves deben poder cambiar. Vincularlo irreversiblemente a una única clave no exportable convertiría la pérdida del dispositivo en pérdida de la identidad.

Hay que separar:

- Número público: dirección para encontrarse; no contraseña ni prueba de identidad.
- Identidad criptográfica: claves actuales, historial verificable y dispositivos autorizados.
- Recuperación: procedimiento para recuperar el mismo número sin permitir una apropiación silenciosa.

El control Damm detecta determinados errores de escritura; no autentica al titular. Y «no exportable» en Web Crypto significa que la API impide exportar la clave: no garantiza almacenamiento hardware ni impide que código malicioso la utilice dentro del navegador.

El sistema «añadirse los dos» reduce el contacto no solicitado, pero no elimina el engaño: un estafador puede convencer previamente a la persona para que lo añada.

## 3. Amenazas, mitigación y detección, ordenadas por prioridad

El impacto indicado considera tanto exposición del contenido como apropiación de identidad. El esfuerzo depende de la implementación; es una valoración técnica, no una cifra estadística.

| Prioridad / amenaza | Mitigación real | Qué puede detectarse y qué no | Esfuerzo |
|---|---|---|---|
| Crítica: teléfono, navegador o código web comprometidos | Actualizaciones; bloqueo del dispositivo; política CSP estricta; Trusted Types donde exista; evitar scripts externos; dependencias controladas; aislamiento del despliegue; revisión independiente. No guardar secretos de recuperación junto al dispositivo. | Integridad de despliegues, anomalías y sesiones desconocidas pueden dar señales. Un espía con control del dispositivo o del JavaScript ejecutado puede no ser detectable por la propia PWA. | Alto y continuo. |
| Crítica: servidor que sustituye claves | Verificación presencial o por canal independiente mediante QR/número de seguridad; fijación local de claves verificadas; historial de cambios; transparencia de claves con testigos externos. | Detectar cambios, inconsistencias o versiones incompatibles del historial. Sin verificación inicial, puede pasar inadvertida una sustitución desde el primer contacto. Un cliente web malicioso puede falsificar la pantalla de verificación. | Medio para verificación manual; alto para transparencia robusta. |
| Crítica: robo y recuperación fraudulenta | Bloqueo local, autenticación reforzada para cambios de identidad, credencial de recuperación independiente, revocación de dispositivos y política explícita de recuperación. No depender solamente de SMS. | Avisos a dispositivos existentes y contactos; historial de altas, revocaciones y cambios. El uso de un dispositivo robado ya desbloqueado puede parecer legítimo. | Medio–alto. |
| Alta: número permanente y servidor como punto de vigilancia | Minimizar registros, separar servicios y accesos, cifrar almacenamiento, limitar conservación y usar identificadores distintos por relación cuando sea posible. No mantener directorios públicos ni respuestas que revelen si un número existe. | Auditorías de acceso y alertas por consultas masivas. No garantizan descubrir a un administrador malicioso ni una copia clandestina. El servidor de emparejamiento conoce relaciones por diseño. | Medio–alto. |
| Alta: avisos push y análisis de tráfico | Avisos genéricos sin texto, número ni nombre; obtener el contenido cifrado después. Reducir frecuencia y registros; estudiar agrupación, relleno y tráfico de cobertura. Para llamadas, usar TURN cuando se quiera ocultar la IP al interlocutor. | Se pueden observar conexiones y registros propios, no demostrar qué correlacionan Apple, Google, el alojamiento o un observador de red. El cifrado no oculta horarios, tamaños ni duración por sí solo. | Bajo para avisos vacíos; alto para resistencia al análisis de tráfico. |
| Alta: relé y metadatos del remitente | Diseños tipo sealed sender, separación de funciones y credenciales que prueben autorización sin revelar información innecesaria

(cortado aquí por el tope de tokens)
