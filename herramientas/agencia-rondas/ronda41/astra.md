# Ronda 41 · Astra 6 (gpt-6-astra) · cómo cobrar

## A) Alta e identidad

Recomendación: passkey + código de recuperación; correo de recuperación opcional. El correo de facturación se introduce en Dodo, no tiene que convertirse en identificador de navegación.

| Opción | Ventaja | Coste o riesgo |
|---|---|---|
| Correo + enlace mágico | Familiar; sin contraseña | Dependencia del buzón, entregabilidad y enlaces fraudulentos; correo obligatorio |
| Passkey + correo de recuperación | Entrada sencilla con huella, rostro o desbloqueo del dispositivo | Recuperar por correo hace depender la seguridad del buzón |
| Número de cuenta, estilo Mullvad | Sin correo de acceso | Perderlo puede significar perder la cuenta; poco familiar y susceptible de compartirse |
| Híbrido recomendado | Passkey, recuperación mediante código y correo opcional | Requiere explicar y probar bien la recuperación entre dispositivos |

La biometría de una passkey no se entrega a GUARDIANA. Explicar que algunas passkeys se sincronizan mediante el proveedor del dispositivo.

Frase de alta: «Crea tu acceso con la huella, el rostro o el desbloqueo de tu dispositivo. No necesitas contraseña. Guarda tu código de recuperación; añadir un correo es opcional».

Dodo puede pedir correo de factura y otros datos necesarios para cobro, fiscalidad o prevención de fraude. No anunciar “sin correo” para todo el servicio ni copiar esos datos al sistema de navegación.

## B) Pago y derecho de uso

Flujo: checkout alojado → webhook validado → servidor actualiza derechos → pasarela comprueba el permiso al iniciar ZERO.

- El servidor crea el checkout asociado a un identificador interno opaco. Nunca aceptar desde el navegador un identificador de cliente arbitrario.
- La página «pago completado» no concede acceso: esperar confirmación verificable del proveedor.
- Guardar el derecho como vigente_hasta, usando el período confirmado por Dodo, no sumando días por cada webhook. Separar estado financiero y estado de acceso.
- Comprobar también al renovar la sesión: una sesión abierta no debe sobrevivir indefinidamente al vencimiento.

Mínimo a guardar: identificador aleatorio de cuenta; claves públicas de passkeys; recuperación protegida; referencias Dodo de cliente/suscripción; estado, fechas de prueba y cobertura; cancelación programada; eventos procesados y emisión de credenciales. Conservar únicamente documentación contable/legal necesaria, con acceso separado.

Nunca guardar: tarjeta completa, CVV, credenciales bancarias, biometría, enlaces mágicos o códigos de recuperación en claro; tampoco URLs visitadas dentro del expediente de facturación. Evitar archivar íntegramente todos los webhooks.

Casos: renovación pagada → ampliar hasta el nuevo fin de período; impago → no ampliar, mantener lo ya cubierto, gracia definida (Dodo gestiona los reintentos; GUARDIANA, el acceso); cancelación a mitad de mes → desactivar renovación y conservar acceso hasta el vencimiento; reembolso → regla publicada según alcance y período; cambio de tarjeta → portal alojado de Dodo; prueba → siete días sin tarjeta, sin conversión automática; al terminar, ZERO se pausa hasta contratar.

Para pruebas repetidas: fecha de prueba por cuenta, límites de altas/emisión, controles de velocidad y CAPTCHA solo ante riesgo. Una passkey no demuestra ser una persona distinta; una IP tampoco. Sin identificación invasiva no existe prevención perfecta. Evitar huellas persistentes del dispositivo y aceptar cierto abuso residual.

## C) Separar pago y navegación

Objetivo alcanzable: que la credencial presentada a ZERO no revele la cuenta pagadora. Eso no equivale a impedir toda correlación por parte de GUARDIANA.

Diseño de segunda fase: 1) el cliente genera material aleatorio y solicita su firma de forma cegada; 2) el emisor comprueba el derecho y la cuota de emisión del período; 3) firma sin conocer el valor que luego verá la pasarela; 4) el cliente presenta la credencial; la pasarela verifica firma, vencimiento y uso permitido, sin consultar la cuenta. Usar protocolos e implementaciones revisados (RSA ciego estandarizado, arquitectura tipo Privacy Pass), no criptografía propia. Privacy Pass no resuelve por sí solo una suscripción.

Simultaneidad: fichas totalmente no vinculables no permiten contar las sesiones de un abonado. Solución: una credencial anónima por período que gestione un cupo de sesiones mediante un arrendamiento atómico. La pasarela relacionará esas sesiones entre sí, pero no criptográficamente con la cuenta. Debe declararse esa vinculabilidad temporal.

Problemas reales: reposición al perder dispositivos, credenciales compartidas, doble canje, revocación y reembolsos. Una credencial mensual ya emitida puede seguir válida tras cancelar el derecho; acortar su vigencia reduce ese problema, pero aumenta contactos y posibilidades de correlación.

Límites: IP, horarios y patrones pueden correlacionar emisión y uso. Además, el Chromium remoto procesa páginas y contenido: GUARDIANA no queda técnicamente incapacitada para observarlos solo por usar fichas.

Comparación: Mullvad, cuenta numerada sin correo obligatorio, sin desvinculación criptográfica universal; Private Relay divide la información entre intermediarios, no es un navegador remoto; Tor distribuye confianza entre saltos, tampoco elimina la correlación temporal.

Promesa: «Separamos facturación y navegación y minimizamos los registros. No prometemos anonimato absoluto». Primera versión con separación operativa honesta; fichas después de revisión especializada.

## D) «Todo el mes», sin contador de horas

Publicar límites técnicos antes del pago: una sesión simultánea por suscripción (propuesta inicial); tope explícito de pestañas activas y recursos, elegido con pruebas; suspender sin interacción tras aviso claro, con excepciones (descargas en curso); límites de tamaño y conservación de descargas; prohibir automatización abusiva, minería, ataques y reventa; procedimiento de suspensión y reclamación. Frase: «Usa ZERO durante todo tu período contratado, sin cobrar por horas. Se aplican límites de sesiones, recursos y descargas; las sesiones inactivas se suspenden». No sustituir estos límites por un ambiguo «uso razonable».

## E) Web estática y servidor

GitHub Pages: presentación, documentos, traducciones, interfaz de alta, área de cuenta y cliente de pantalla remota. Sin secretos ni decisiones de autorización. Servicio pequeño con base de datos: autenticación WebAuthn, recuperación, creación de checkout/portal, webhooks, derechos, prueba y permisos breves para ZERO; después, emisión de fichas. Pasarela y microVM: verifican permisos, controlan concurrencia y ejecutan/transmiten ZERO; es infraestructura aparte. Protecciones mínimas: firmas y antirrepetición según Dodo; idempotencia, transacciones, eventos fuera de orden y conciliación con su API; secretos solo en servidor, rotación, TLS, cookies seguras, CSRF y orígenes permitidos; registros mínimos, retención definida, copias protegidas, acceso administrativo restringido.

## F) Obligaciones: mapa

Dodo como merchant of record: cobro, documentación de venta y gestión de impuestos indirectos, según contrato y cobertura; confirmar admisión de la empresa colombiana. GUARDIANA conserva: seguridad, funcionamiento, soporte, términos, publicidad veraz, cancelación, privacidad, encargados, transferencias internacionales, derechos de titulares e incidentes. Revisar datos personales de Colombia y RGPD, menores y capacidad contractual, obligaciones fiscales propias. En la UE, definir el desistimiento para el servicio digital; no usar una renuncia genérica automática.

## G) Veredicto: diez pasos

1. NIT y habilitación contractual: hasta entonces, no cobrar. 2. Términos, privacidad y límites comprensibles. 3. Radiografías y Órbita gratuitas, sin cuenta salvo necesidad. 4. Acceso a ZERO con passkey y recuperación. 5. Siete días de prueba sin tarjeta. 6. Al contratar, checkout alojado de Dodo. 7. Confirmar el pago por webhook y registrar cobertura. 8. Permiso breve; la pasarela abre ZERO y controla concurrencia. 9. Renovaciones, impagos, cancelación y tarjeta por webhooks y portal. 10. Después, credenciales ciegas revisadas, explicitando correlación, revocación y vinculabilidad temporal.
