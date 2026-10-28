# Ronda 70 · Astra 6 (Cheaper Inference, Playground, `gpt-6-astra`, 4.096 tokens) · 27 Oct 2026, 22:07–22:20

Solo información del producto. Registro fiel y ordenado del texto entre «ASSISTANT OUTPUT» y «Response headers» (sin claves). La respuesta se cortó en el punto 18 (DORA); se le pidió la continuación (18–21) a las 22:25.

Aviso de Astra: no tiene navegación en directo; las tarifas, certificaciones y normas vigentes son «no lo sé» si no constan en los hechos; los plazos son estimaciones de planificación.

## 1. Decisión
- Sí, si vende **garantías adicionales verificables**, no más relés y un comprobante más largo: identidad comprobada y software controlado; infraestructura aislada, rutas elegidas y política de metadatos explícita; entrega verificada con evidencia exportable; operación auditable, soporte y compromisos contractuales. Nada de «máxima seguridad del mundo», «anónima» ni «sin límite de velocidad».

## 2. Cuatro fundamentos que revisar antes de añadir funciones
- Acuerdo híbrido (cómo se combinan ECDH, ML-KEM y el secreto; autenticación; separación de dominios; transcripción; resistencia a la degradación).
- Cifrado (unicidad de nonces AES-GCM, repetición, orden, duplicados, truncamiento, archivos incompletos, límites por clave).
- Evolución de claves: una cadena HMAC no recupera la seguridad tras un compromiso.
- Invitaciones: 9 cifras ≈ 30 bits; hace falta límite global de intentos y, si el código entra como secreto, ver si una transcripción permite probar códigos fuera de línea: puede convenir un PAKE estandarizado (SPAKE2, RFC 9382) o un secreto largo. El número de seguridad, por un canal independiente.

## 3. Medidas (aporta / cuesta / no permite prometer)
Revisión criptográfica independiente; ML-DSA en comprobantes; firmas clásicas + ML-DSA (exigir las dos); passkeys/WebAuthn (pueden sincronizarse: no siempre son hardware); claves en hardware; **cliente firmado y distribución controlada**; tráfico de cobertura y relleno; sello de tiempo externo; eliminación criptográfica (no borrado físico demostrable en una nube ajena); auditoría externa recurrente. Prioridad: protocolo, extremos y distribución del código: «añadir ML-DSA a una página que un atacante puede modificar no arregla el problema principal». Fuentes: NIST FIPS 203 y 204, W3C WebAuthn.

## 4. El navegador es parte del perímetro
«No exportable» limita la exportación, no prueba hardware ni impide que código autorizado use la clave o lea el texto. Sin scripts de terceros en el origen criptográfico, CSP estricta, Trusted Types, dependencias fijadas, separación entre web comercial, administración y aplicación, compilaciones reproducibles, SBOM, firma de artefactos, actualizaciones con doble aprobación y protección de DNS y CI/CD. SRI y CSP no bastan si el atacante controla el documento principal. Para alto riesgo: cliente firmado y administrable.

## 5. Sobre los cinco puntos de Claude
- Relé dedicado: aislamiento y capacidad reservada; una VM no es un servidor físico exclusivo; destruirla no prueba que el proveedor no tenga registros.
- Doble salto: topología real A → entrada → salida → B; si los dos relés son de GUARDIANA, GUARDIANA podría correlacionarlos: **dos países no son dos dominios de confianza**.
- Relleno: decir qué oculta (un bloque fijo no oculta la duración ni el total aproximado).
- Identidad obligatoria: sí, con bloqueo ante cambios de clave y verificación fuera de banda; una contraseña no es necesariamente un segundo factor.
- Comprobante: que acredite exactamente lo ocurrido, sin sugerir una custodia que GUARDIANA no ejerce.
- Su mejora central: **perfiles separados** de rendimiento, privacidad de metadatos y evidencia empresarial, con sus costes y tensiones a la vista.

## 6–8. Velocidad y coste
- Miami no acelera Comunicaciones hasta que haya selección de relé o interconexión. R ≤ mín(subida del emisor, bajada del receptor, capacidad de la ruta, proceso de los extremos).
- Tabla de cuándo ayuda y cuándo no: retirar los 8 MB/s, elegir región (no por cercanía a un solo extremo), relés interconectados, varias conexiones, multicamino real, capacidad reservada. «No prometería ninguna multiplicación de velocidad sin medirla»; no eludir el límite abriendo conexiones.
- Multicamino: prototipo controlado (asignación adaptativa, índices, duplicados, reintentos, contrapresión, memoria, caída de un relé, verificación final); medir primer byte, rendimiento útil, finalización p50/p95, CPU, memoria, bytes facturados y fallos; decidir por coste por transferencia completada.
- No sabe las tarifas vigentes de Hetzner y Vultr. 8 MB/s ≈ 28,8 GB/h; 100 Mbit/s ≈ 45 GB/h; 1 Gbit/s ≈ 450 GB/h. Fórmula de coste por hora (cómputo + salidas facturables + sellos + evidencia + operación); dos relés en serie pueden facturar dos salidas. 20 USD − 5 USD = 15 USD antes de personal, auditorías, soporte, pagos, seguros e impuestos. Producto: precio por hora con capacidad reservada y transferencia incluida publicada; no «velocidad ilimitada».

## 9–10. Metadatos
- Tabla: relé actual, proveedor de nube, proveedor de internet, código de la aplicación, sistema y extensiones, receptor, facturación y soporte; con mitigaciones. «El relé no guarda nada» hay que delimitarlo (sistema, balanceador, anti-DDoS, proveedor). El mapa: distinguir lo observado de lo inferido.
- Tor: opción aparte para quien priorice ocultar su IP frente al rendimiento; no obligatoria. Redes de mezcla: no como transporte principal de chat y archivos grandes. Tres perfiles: rendimiento, metadatos (doble salto bien diseñado con cobertura configurable) y acceso por Tor.

## 11–13. El comprobante
- Separar estados: enviado; recibido completo y verificado; guardado o exportado (si se puede sostener); leído o aceptado (solo con una acción explícita).
- Paquete probatorio: versión del esquema y forma canónica firmada; identificador aleatorio; SHA-256, tamaño y manifiesto; huellas de claves y su relación con identidades verificadas; declaración firmada de cada extremo; tiempos locales separados del externo; sello sobre la evidencia final; versiones de cliente y protocolo (sin presentarlas como atestación del equipo); resultados, incidencias y reintentos; historial posterior.
- El tipo por contenido es orientativo (formatos ambiguos y políglotas) y no certifica que el archivo sea seguro. El JSON firmado es la evidencia; el PDF, su representación; verificar sin subir nada a GUARDIANA.
- **Más datos no siempre es mejor prueba:** comprobante mínimo (integridad, declaraciones, firmas, tiempo), anexo empresarial restringido (identidad corporativa, datos operativos, retención) e informe de rendimiento aparte. Las huellas pueden revelar coincidencias con archivos conocidos: no publicar un buscador de huellas. Nombre más preciso: «comprobante de entrega e integridad»; «custodia» solo con cadena de conservación documentada.
- RFC 3161 no es sello cualificado eIDAS; sello cualificado de tiempo y sello cualificado de persona jurídica son figuras distintas. Colombia (Ley 527), UE (eIDAS) y EE. UU. (FRE 901, 902(13)/(14)): qué aportan y qué no afirmar (un JSON firmado no es automáticamente admisible ni prueba autoría humana). E-discovery: exportación, conservación, legal hold y responsables.

## 14. Producto
- «Una sala temporal de transferencia confidencial, con identidad comprobada, infraestructura aislada, entrega verificable, política de metadatos seleccionable y evidencia portable.» «No sé si sería única en el mundo»: sin comparación documentada, afirmarlo es humo.
- Humo: «imposible de interceptar», «borrado universal certificado», «postcuántico» como seguridad completa, «dos países garantizan anonimato», «certificado judicial válido en todo el mundo», «más relés siempre más velocidad», «residencia garantizada» por un mapa ilustrativo.
- Primeros: despachos, fusiones y adquisiciones, auditorías, investigaciones internas, propiedad intelectual. No empezar prometiendo sanidad regulada, brókers, defensa o finanzas críticas.

## 15–18. Empresas de primer nivel
- Hoy hay capacidades declaradas, no acreditadas. Expediente de seguridad (2–4 semanas), prueba de intrusión (4–8 semanas de ventana), programa de vulnerabilidades (1–3 semanas), bug bounty después de auditar, SOC 2 tipo II (meses de operación; es un informe de atestiguamiento, no una certificación de invulnerabilidad), ISO 27001 (proyecto de meses; alcance limitado), SSO y administración (6–12 semanas), contratos (DPA, SLA, incidentes, continuidad, seguro).
- FIPS 140-3: usar Web Crypto, AES o P-256 no demuestra cumplimiento; se valida un módulo concreto en un entorno concreto; ML-KEM en JavaScript no es un módulo validado y **un híbrido no hereda automáticamente la validación de uno de sus componentes** (discrepa de Gemini). Para quien lo exija por contrato: configuración empresarial con módulos comprobables, quizá un cliente nativo.
- EE. UU.: HIPAA (no tener la clave no excluye ser «business associate»; la excepción de mero conducto es limitada), FINRA y SEC 17a-4 (un chat efímero no basta: archivo controlado por el cliente como perfil aparte), GLBA, CCPA/CPRA, FRE 901/902.
- UE y Reino Unido: el cifrado no anonimiza IP, cuentas y pagos; contrato del art. 28; UK GDPR aparte; NIS2 (transposición nacional); DORA (cláusulas, subcontratación, pruebas, auditoría, continuidad y salida).

## Continuación (22:25, puntos 18–21)
- **DORA** (se aplica desde el 17 de enero de 2025): ser proveedor no es estar designado como tercero esencial (lo deciden las Autoridades Europeas de Supervisión, art. 31); el contrato debe decir dónde se presta el servicio y se tratan los datos, y avisar de cambios (arts. 28, 30, 31 y 64).
- **Relés por país:** controlan un componente del recorrido, no la residencia integral. Separar contenido, metadatos e IP, registros y copias, claves y soporte, subproveedores. Se puede garantizar, con alcance verificado: relés solo en ubicaciones autorizadas, **sin conmutación automática a otra región** y que la sesión **falle antes de usar una ubicación no permitida**. No se puede prometer que todos los paquetes queden en un territorio. Un relé europeo no resuelve por sí solo el capítulo V del RGPD (arts. 44–49). Propone una **matriz de localización por categoría de dato**.
- **Empresas:** «Estado actual: no lo sé»; nada como disponible sin inventario y evidencias. Ventanas orientativas: SSO (SAML/OIDC) y SCIM, semanas 2–6 (dar de baja una cuenta corporativa no debe dejar sesiones vivas); consola y auditoría exportable, semanas 2–8 (actor, acción, fecha y resultado; sin contenido; no llamar «inmutable» a lo que no se ha demostrado); BYOK/HYOK, semanas 4–12 (una clave del cliente para almacenamiento no es cifrado de extremo a extremo); SLA, borrador ya y firma en semanas 2–6, sin cifra de disponibilidad sin evidencias; SIG y CAIQ, semanas 1–4, distinguiendo implementado, parcial, previsto y no aplicable; seguro, pedir ofertas ya, plazo «no lo sé».
- **Fases:** días 1–5 inventario, flujos, amenazas y requisitos del primer cliente; días 6–10 alcance del piloto (una región, pocos usuarios); semanas 3–4 piloto controlado; semanas 5–8 endurecimiento y evaluación externa (los hallazgos críticos bloquean producción); semanas 9–12 producción limitada para ese cliente; expansión internacional con calendario aparte, por jurisdicción y caso de uso.
- **Cinco decisiones:** vender evidencia, no invulnerabilidad; alcance estrecho (un perfil, un caso de uso, una región; con residencia obligatoria, detener antes que desviar); separar lo disponible de la hoja de ruta; no asumir garantías ajenas sin respaldo; reservar una decisión real de no lanzar si no se demuestra lo prometido.

