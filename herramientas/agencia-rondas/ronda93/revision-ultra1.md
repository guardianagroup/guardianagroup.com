# Ultra 1: independent security review (stopped early at the coordinator's request; read-only, nothing changed)
**Verdict: NO-GO.** The cryptographic core is sound. Two claims on screen are false: the chat words, and metadata that "no delata".
**Must-fix**
1. **The 4 chat words can be forged.** cripto.js:305-309 and app.js:2641 build them from SHA-384 of the two fingerprints, with 44 bits and no commitment. Scenario: a MITM has the link and controls the relay or the channel the link travels on. It waits for the presentations with hA and hB, then grinds its own two P-384 identities until words(hA,x)=words(y,hB). The birthday bound is about 2^22 identities per side, roughly a minute on one core. This makes three claims false: "si coinciden… nadie se ha puesto en medio" (app.js:594, app.js:3268) and "las mismas… si nadie está en medio" (index.html:274). Fix: a ZRTP-style commit-reveal (initiator sends H(identity‖ephemeral) first), or derive the words from a committed transcript. Until then, tell users to compare the 60-digit number.
2. **Message timing leaks to the relay.** (a) app.js:866 sends every Ultra message and file announcement with avisa=true, so rele.js:200 marks it 0x11 and zero-motor/comunicaciones.js:297-298 tells it apart from the 0x01 heartbeat and controls. (b) The heartbeat (app.js:4637) is added on top of real traffic and does not replace it. Messages, acks, «leído» and «escribiendo…» go out immediately as extra 1 KB frames. Claims that are false: "el relé no distingue… ni cuándo escribes" (app.js:2671), the comment at app.js:4634, and the index.html row «Tamaño y ritmo que no delatan». Fix: never send 0x11 in Ultra (Ultra has no push anyway). Use a constant-rate sender: one 1 KB frame per tick, real if queued and dummy if not, with acks and typing folded into ticks. Or drop "cuándo escribes" from the claims.
**Should-fix**
3. Calls can fall back to clear (DTLS-SRTP only) in Ultra:
   - pqAClaro (llamada.js:256-261, triggered by 'pq-claro' at :1411 and :1883) sets both directions to 'claro' when estado≠'hablando' or on a leg.
   - The receiver starts in 'auto' and accepts unencrypted frames until the first one decrypts (llamada.js:186; medios-pq.js:156-160, :176).
   - The caller's tx stays 'claro' until after setRemoteDescription (llamada.js:316).
   - Fix: in Ultra, set tx to 'cifra' and rx to 'estricto' in pqNueva (the caller already has the key), and make pqAClaro always hang up.
4. llamada.js:1394: if the offer has no `sas`, the callee sets sas=null and shows no words and no warning, so a MITM can strip the call words. In Ultra, treat this as 'roto' and hang up.
5. The invitation secret stays in browser history. chat/index.html:38-40 and app.js:5677: replaceState only cleans the tab's entry. The global history (and omnibox) likely keeps …/chat/#b=<256-bit secret>; I did not test this in a browser. Fix: say so in «Límites», recommend a private window, or accept by paste.
6. Gate: the LOCAL-only `?plan=plus` cannot be turned on on the real site (app.js:32, :83). ZERO loads https://guardianagroup.com (zero paginas.rs:406). But the gate is only advisory: aceptaSemilla (app.js:359-371) has no plan check and roles come from the fingerprints (app.js:414). A hand-made #b= link (32 random bytes) should open Ultra between two free browsers; I concluded this from the code and did not run it. Enforce on the server if it matters.
7. Metadata in files: every non-SVG image is re-encoded, and one that cannot be is not sent (correct). But SVG, video (MP4/MOV keep GPS ©xyz and creation_time), audio (ID3) and ZIP timestamps go out untouched. The warning at app.js:4430 covers only PDF and Office. Fix: warn for every non-image file, including video and SVG.
8. The "nivel" of each side is declared by the peer itself (app.js:620, :910). The chat bar and the call show it without saying so; only the escudo carries the caveat. Fix: label it as what the other device says.
9. YO.nombre goes in every Ultra presentation (app.js:553). That links sessions that are meant to have a "new identity" each. Fix: off by default in Ultra, or say so.
10. app.js:614 says «suite CNSA 2.0 (ML-KEM-1024 y ECDH P-384)», but P-384 belongs to CNSA 1.0. The call layer also uses HKDF-SHA-256 (llamada.js:217) and its SAS uses P-256 with SHA-256. Reword.
11. palabras.js:4-5 says no word is one letter from another, but 23 pairs are: cesta/costa, gema/goma, caja/ceja, ocho/ocio, and others.
12. Panic does nothing during a call (app.js:4680). «nadie puede» appears in index.html:120, 128, 219, 303 (Número GUARDIANA, not Ultra).
13. The signed receipt is opt-in and both sides see the seal (correct). The receiver signs automatically and cannot decline; I did not finish checking this.
**Checked and correct**
- Key agreement: ikm = DH(efA,efB)‖DH(idA,efB)‖DH(efA,idB)‖ML-KEM-1024 ss‖psk48, salt = sala, info = label plus hA, efA, hB, efB, SHA-384(ek), SHA-384(ct). HKDF-SHA-384 gives 48/48/32/48 bytes (cripto.js:255-270).
- Both signatures, ECDSA P-384 and ML-DSA-87 with ctx, sign the identical bytes. Both are required at fixed lengths with v:4/b:1, and there is no session without ML-KEM (app.js:552, :568-582; cripto.js:246-256). The relay has no path to downgrade the chat. The mode comes from #b=, and rewriting it to #i= leads to another room.
- A new identity for each conversation. The ML-DSA secret is sealed, opened only to sign, then zeroed (app.js:175-184). The zeroing claims are hedged.
- AES-GCM nonces:
  - one HMAC-SHA-384 chain key per message, with nonce = n;
  - a random key per file, with nonce = chunk index (a resend reuses the same plaintext);
  - random IVs for presentations and media frames.
- The call key rotates every 60 s in Ultra (llamada.js:148), as a hash chain from the session's `medios`. The claims do not overstate this.
- The call words: 44 bits with ZRTP-style commit-reveal, and the callee verifies the reveal (llamada.js:1287-1308, :1409). No-downgrade: Ultra refuses a call without the PQ layer at offer, answer and receipt.
- cbr=1 and usedtx=0 are set on every audio m-line, and ssrc-audio-level is removed, in every local SDP including re-offers (llamada.js:1116-1141).
- No mailbox or push for Ultra rooms (app.js:773, salasAvisos, despierta).
- No Ultra data in IndexedDB, localStorage or sessionStorage. Old Ultra conversations are purged (app.js:214). sw.js has no fetch handler and no cache.
- The fragment never reaches the relay. index.html sets no-referrer, and marco.js drops the fragment.
- The default receipt has no signature (app.js:1255).
**Not checked yet:** the voz-ultra.js DSP; the comprobante path in viaje.js; discreet reading and the blur cover on desktop; ultra.js and the other tests were not run.
