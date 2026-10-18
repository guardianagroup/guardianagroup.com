/* GUARDIANA · el globo de la portada (17 Oct 2026).
 *
 * The same Earth as the program's «Por dentro» view: NASA textures (Blue Marble by day, Black
 * Marble city lights by night), the Sun where it is right now (so night on the page is night on
 * the planet), the ocean glint and the edge of the atmosphere. Nothing about the visitor leaves
 * the browser.
 *
 * Routes (op.rutas, 17 Oct 2026, the owner: «una simulación… desde Barranquilla… que se muevan
 * los datos de ida y venida… sutil… que no parezca un juego»): an ILLUSTRATIVE example, said so
 * under the globe. A computer in one city and the cities of a few well-known data-centre regions;
 * hair-thin steel arcs and small points of light that go out and come back, at a calm pace. The
 * committee (Claude, ChatGPT, Grok): city names only, never «AI» or «antivirus» on a made-up
 * route; no pulses, no counters, no alert colours.
 *
 * Calm on purpose (the owner, 17 Oct 2026: «más lento para que haya más control»): it turns by
 * itself, one turn every two minutes; taken in hand it stays put, and resumes after a few seconds. It stops
 * drawing when it is off screen or the tab is hidden, and draws one still frame when the system
 * asks for reduced motion. Without WebGL 2 the page keeps its still picture.
 */
(function () {
  'use strict';
  var RAD = Math.PI / 180;

  function iniciar(cv, op) {
    op = op || {};
    var ruta = op.ruta || '/tierra/';
    var gl = cv.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
    if (!gl) return false;
    var reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var movil = Math.min(screen.width, screen.height) < 700;

    // --- matrices, column by column as WebGL wants them ---
    var tanH = Math.tan(15 * RAD);
    function mul(a, b) { var o = new Float32Array(16); for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
    function persp(asp) { var t = 1 / tanH, n = 0.1, f = 60, o = new Float32Array(16); o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o; }
    function trasl(x, y, z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }
    function rotX(t) { var c = Math.cos(t), s = Math.sin(t); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
    function rotY(t) { var c = Math.cos(t), s = Math.sin(t); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }

    // --- the Sun now: subsolar point (declination and equation of time) ---
    var sol = [0, 0, 1];
    function solAhora() {
      var d = new Date(), ini = Date.UTC(d.getUTCFullYear(), 0, 0), N = (d - ini) / 86400000;
      var h = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
      var dec = -23.44 * Math.cos(2 * Math.PI / 365 * (N + 10));
      var B = 2 * Math.PI * (N - 81) / 364, eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
      var lon = -15 * (h - 12 + eot / 60); lon = ((lon + 540) % 360) - 180;
      var cl = Math.cos(dec * RAD);
      sol = [cl * Math.sin(lon * RAD), Math.sin(dec * RAD), cl * Math.cos(lon * RAD)];
    }
    // A fixed sun for still pictures (posters, share images): op.sol = [lon, lat] of the subsolar point.
    if (op.sol) { var cl0 = Math.cos(op.sol[1] * RAD); sol = [cl0 * Math.sin(op.sol[0] * RAD), Math.sin(op.sol[1] * RAD), cl0 * Math.cos(op.sol[0] * RAD)]; }
    else { solAhora(); setInterval(function () { solAhora(); cambio = true; }, 30000); }

    var VS = '#version 300 es\n' +
      'in vec2 aLL; uniform mat4 uPV, uM; out vec2 vUv; out vec3 vN; out vec3 vW;\n' +
      'void main(){ float lon=aLL.x, lat=aLL.y; vec3 s=vec3(cos(lat)*sin(lon), sin(lat), cos(lat)*cos(lon));\n' +
      ' vec4 w=uM*vec4(s,1.0); vN=s; vW=w.xyz; vUv=vec2(lon/6.2831853+0.5, 0.5-lat/3.1415927); gl_Position=uPV*w; }';
    // The program's Earth shader, without the close-up tiles and the flat map.
    var FS = '#version 300 es\nprecision highp float;\n' +
      'uniform sampler2D uDia, uLuces, uAgua; uniform vec3 uSol, uCam; uniform mat3 uM3;\n' +
      'in vec2 vUv; in vec3 vN; in vec3 vW; out vec4 o;\n' +
      'vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }\n' +
      'void main(){ vec3 n=normalize(vN); float mu=dot(n,uSol);\n' +
      ' vec3 dia=pow(texture(uDia,vUv).rgb, vec3(2.2)); float luz=texture(uLuces,vUv).r; float agua=texture(uAgua,vUv).r;\n' +
      ' float lado=smoothstep(-0.08,0.22,mu); float diaF=smoothstep(-0.14,0.24,mu);\n' +
      ' vec3 col=mix(dia*vec3(0.74,0.80,0.96)+vec3(0.012,0.022,0.045), dia*(0.70+0.62*max(mu,0.0)), diaF);\n' +
      ' col+=dia*vec3(1.0,0.45,0.2)*0.22*exp(-pow((mu-0.03)*10.0,2.0));\n' +
      ' float noche=1.0-smoothstep(-0.20,0.05,mu); col+=vec3(1.0,0.70,0.38)*pow(luz,1.25)*1.5*noche;\n' +
      ' vec3 nw=normalize(uM3*n); vec3 V=normalize(uCam-vW); vec3 Lw=normalize(uM3*uSol);\n' +
      ' vec3 H=normalize(Lw+V); float nh=max(dot(nw,H),0.0);\n' +
      ' col+=vec3(1.0,0.86,0.66)*(pow(nh,900.0)*0.32+pow(nh,90.0)*0.05+pow(nh,12.0)*0.012)*agua*lado;\n' +
      ' col+=vec3(0.02,0.06,0.13)*agua*lado*0.6;\n' +
      ' float fres=pow(1.0-max(dot(nw,V),0.0),2.6); vec3 atm=vec3(0.28,0.55,1.0)*fres*(0.08+0.92*smoothstep(-0.3,0.45,mu));\n' +
      ' col=col*(1.0-fres*0.35)+atm*0.85; col=aces(col*1.3); o=vec4(pow(col,vec3(1.0/2.2)),1.0); }';

    function compila(tipo, src) { var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    var P = gl.createProgram();
    try { gl.attachShader(P, compila(gl.VERTEX_SHADER, VS)); gl.attachShader(P, compila(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(P); if (!gl.getProgramParameter(P, gl.LINK_STATUS)) throw new Error('link'); }
    catch (e) { return false; }
    var U = {}; ['uPV', 'uM', 'uM3', 'uSol', 'uCam', 'uDia', 'uLuces', 'uAgua'].forEach(function (n) { U[n] = gl.getUniformLocation(P, n); });

    // Mesh: a finer one on computers, a lighter one on phones.
    var NL = movil ? 180 : 360, NA = movil ? 90 : 180, v = new Float32Array((NL + 1) * (NA + 1) * 2), k = 0, i, j;
    for (j = 0; j <= NA; j++) for (i = 0; i <= NL; i++) { v[k++] = -Math.PI + 2 * Math.PI * i / NL; v[k++] = Math.PI / 2 - Math.PI * j / NA; }
    var ix = new Uint32Array(NL * NA * 6); k = 0;
    for (j = 0; j < NA; j++) for (i = 0; i < NL; i++) { var a = j * (NL + 1) + i, b = a + NL + 1; ix.set([a, b, a + 1, a + 1, b, b + 1], k); k += 6; }
    var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    var la = gl.getAttribLocation(P, 'aLL'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ix, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    function textura(im) {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      if (im) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 24, 44, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (im) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); var an = gl.getExtension('EXT_texture_filter_anisotropic'); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      return t;
    }
    var tex = { dia: textura(null), luces: textura(null), agua: textura(null) }, listas = 0;
    var tam = movil ? '-1k' : '-2k';
    function carga(clave, url) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { gl.deleteTexture(tex[clave]); tex[clave] = textura(im); cambio = true; listas++; if (listas === 3 && op.lista) op.lista(); pide(); };
      im.src = url;
    }
    carga('dia', ruta + 'dia' + tam + '.jpg'); carga('luces', ruta + 'luces' + tam + '.jpg'); carga('agua', ruta + (movil ? 'agua-1k.png' : 'agua.png'));


    // --- routes: drawn on a 2D layer over the globe, projected with the same matrices ---
    var R = op.rutas, capa = null, ctx = null, rutas = [], Mvista = null, PVvista = null, distV = 3, WV = 0, HV = 0;
    function v3(lon, lat) { var cl = Math.cos(lat * RAD); return [cl * Math.sin(lon * RAD), Math.sin(lat * RAD), cl * Math.cos(lon * RAD)]; }
    if (R && R.origen && R.destinos) {
      capa = document.createElement('canvas'); capa.className = 'globo-rutas'; capa.setAttribute('aria-hidden', 'true');
      cv.parentNode.insertBefore(capa, cv.nextSibling); ctx = capa.getContext('2d');
      var a = v3(R.origen.ll[0], R.origen.ll[1]);
      R.destinos.forEach(function (d, n) {
        var b = v3(d.ll[0], d.ll[1]), w = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))), pts = [], N = 64;
        var alto = 0.03 + 0.17 * (w / Math.PI);
        for (var q = 0; q <= N; q++) {
          var t = q / N, s1 = Math.sin((1 - t) * w) / Math.sin(w), s2 = Math.sin(t * w) / Math.sin(w), h = 1 + alto * Math.sin(Math.PI * t);
          pts.push([(a[0] * s1 + b[0] * s2) * h, (a[1] * s1 + b[1] * s2) * h, (a[2] * s1 + b[2] * s2) * h]);
        }
        // Each route keeps its own unhurried rhythm: a packet out every few seconds, an answer back.
        var dur = 3.2 + 3.4 * (w / Math.PI);
        rutas.push({ n: d.n, b: b, pts: pts, dur: dur, cada: 2.6 + (n * 1.37) % 3.1, prox: 0.4 + (n * 0.83) % 2.6, pq: [] });
      });
    }
    function proy(p) {
      var M = Mvista, x = M[0] * p[0] + M[4] * p[1] + M[8] * p[2], y = M[1] * p[0] + M[5] * p[1] + M[9] * p[2], z = M[2] * p[0] + M[6] * p[1] + M[10] * p[2];
      var P = PVvista, zc = z - distV, cx = P[0] * x, cy = P[5] * y, cw = -zc;
      // Hidden behind the Earth? The line from the eye to the point crosses the sphere first.
      var dx = x, dy = y, dz = z - distV, A = dx * dx + dy * dy + dz * dz, B = 2 * distV * dz, Cc = distV * distV - 1, disc = B * B - 4 * A * Cc, oculto = false;
      if (disc > 0) { var t1 = (-B - Math.sqrt(disc)) / (2 * A); oculto = t1 > 0 && t1 < 0.985; }
      // How square-on it faces the eye (fades labels and arcs near the edge).
      var r = Math.sqrt(x * x + y * y + z * z) || 1, cara = (x * 0 + y * 0 + z * 1) / r;
      return { x: (cx / cw * 0.5 + 0.5) * WV, y: (0.5 - cy / cw * 0.5) * HV, oculto: oculto, cara: cara };
    }
    function enArco(r, t) { var f = t * (r.pts.length - 1), i0 = Math.min(r.pts.length - 2, Math.floor(f)), u = f - i0, p = r.pts[i0], q = r.pts[i0 + 1]; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u]; }
    var tRutas = 0;
    function dibujaRutas(dt) {
      if (!ctx || !Mvista) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2), W = Math.round(capa.clientWidth * dpr), H = Math.round(capa.clientHeight * dpr);
      if (!W || !H) return;
      if (capa.width !== W || capa.height !== H) { capa.width = W; capa.height = H; }
      WV = W; HV = H; ctx.clearRect(0, 0, W, H); tRutas += dt;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      rutas.forEach(function (r) {
        // the arc, in visible runs
        ctx.lineWidth = 1 * dpr; ctx.strokeStyle = 'rgba(232,236,241,0.34)';
        ctx.beginPath(); var dentro = false;
        for (var q = 0; q < r.pts.length; q++) { var p = proy(r.pts[q]); if (p.oculto) { dentro = false; continue; } if (!dentro) { ctx.moveTo(p.x, p.y); dentro = true; } else ctx.lineTo(p.x, p.y); }
        ctx.stroke();
        // packets: out in light steel, answers back in soft white
        if (!reducido) {
          r.prox -= dt;
          if (r.prox <= 0) { r.pq.push({ t: 0, vuelta: false }); r.prox = r.cada + Math.random() * 1.6; }
          r.pq.forEach(function (k) { k.t += dt / r.dur; if (k.t >= 1 && !k.vuelta && !k.hecho) { k.hecho = true; if (Math.random() < 0.85) r.pq.push({ t: 0, vuelta: true, esp: 0.25 + Math.random() * 0.5 }); } });
          r.pq = r.pq.filter(function (k) { return k.t < 1; });
          r.pq.forEach(function (k) {
            if (k.esp > 0) { k.esp -= dt; k.t = 0; return; }
            var e = k.t * k.t * (3 - 2 * k.t), tt = k.vuelta ? 1 - e : e, cola = k.vuelta ? 0.05 : -0.05;
            var p = proy(enArco(r, tt)), pc = proy(enArco(r, Math.max(0, Math.min(1, tt + cola))));
            if (p.oculto) return;
            var luz = Math.sin(Math.PI * k.t), col = k.vuelta ? '232,236,241' : '201,223,242';
            var g = ctx.createLinearGradient(pc.x, pc.y, p.x, p.y); g.addColorStop(0, 'rgba(' + col + ',0)'); g.addColorStop(1, 'rgba(' + col + ',' + (0.55 * luz).toFixed(3) + ')');
            ctx.strokeStyle = g; ctx.lineWidth = 1.4 * dpr; ctx.beginPath(); ctx.moveTo(pc.x, pc.y); ctx.lineTo(p.x, p.y); ctx.stroke();
            ctx.fillStyle = 'rgba(' + col + ',' + (0.9 * luz).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.5 * dpr, 0, 2 * Math.PI); ctx.fill();
          });
        }
      });
      // the cities: a fine ring at each destination, a steady point at the origin, small names
      ctx.font = '500 ' + (11 * dpr).toFixed(1) + "px 'Hanken Grotesk', system-ui, sans-serif"; ctx.textBaseline = 'middle';
      var puestos = [];
      function libre(x, y, w) { for (var i = 0; i < puestos.length; i++) { var q = puestos[i]; if (x < q[0] + q[2] && x + w > q[0] && Math.abs(y - q[1]) < 13 * dpr) return false; } puestos.push([x, y, w]); return true; }
      var o = proy(v3(R.origen.ll[0], R.origen.ll[1]));
      if (!o.oculto) puestos.push([o.x - 8 * dpr, o.y, 90 * dpr]);
      rutas.forEach(function (r) {
        var p = proy(r.b); if (p.oculto || p.cara < 0.15) return;
        var al = Math.min(1, (p.cara - 0.15) / 0.3);
        ctx.strokeStyle = 'rgba(201,223,242,' + (0.75 * al).toFixed(3) + ')'; ctx.lineWidth = 1 * dpr; ctx.beginPath(); ctx.arc(p.x, p.y, 2.6 * dpr, 0, 2 * Math.PI); ctx.stroke();
        if (libre(p.x + 7 * dpr, p.y, ctx.measureText(r.n).width)) { ctx.fillStyle = 'rgba(190,200,210,' + (0.9 * al).toFixed(3) + ')'; ctx.fillText(r.n, p.x + 7 * dpr, p.y); }
      });
      if (!o.oculto && o.cara > 0.1) {
        ctx.fillStyle = 'rgba(232,236,241,0.95)'; ctx.beginPath(); ctx.arc(o.x, o.y, 3 * dpr, 0, 2 * Math.PI); ctx.fill();
        ctx.strokeStyle = 'rgba(232,236,241,0.28)'; ctx.lineWidth = 1 * dpr; ctx.beginPath(); ctx.arc(o.x, o.y, 7 * dpr, 0, 2 * Math.PI); ctx.stroke();
        ctx.font = '600 ' + (11 * dpr).toFixed(1) + "px 'Hanken Grotesk', system-ui, sans-serif"; ctx.fillStyle = 'rgba(232,236,241,0.92)'; ctx.fillText(R.origen.n, o.x + 11 * dpr, o.y);
      }
    }

    // Facing the visitor's side of the world: the time zone's offset gives a longitude.
    var lon0 = op.lon != null ? op.lon : -new Date().getTimezoneOffset() / 60 * 15;
    var rot = -lon0 * RAD + (R ? 0 : 0.35), tilt = op.tilt != null ? op.tilt : 0.32, vr = 0, vt = 0, tocado = false;

    function dibuja() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
      if (!W || !H) return;
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      var asp = W / H, dist = 1 / Math.sin(Math.atan(0.9 * tanH * Math.min(1, asp)));
      var M = mul(rotX(tilt), rotY(rot)), PV = mul(persp(asp), trasl(0, 0, -dist));
      Mvista = M; PVvista = persp(asp); distV = dist;
      gl.useProgram(P); gl.bindVertexArray(vao);
      gl.uniformMatrix4fv(U.uPV, false, PV); gl.uniformMatrix4fv(U.uM, false, M);
      gl.uniformMatrix3fv(U.uM3, false, new Float32Array([M[0], M[1], M[2], M[4], M[5], M[6], M[8], M[9], M[10]]));
      gl.uniform3fv(U.uSol, sol); gl.uniform3fv(U.uCam, [0, 0, dist]);
      [['uDia', tex.dia], ['uLuces', tex.luces], ['uAgua', tex.agua]].forEach(function (p, n) { gl.activeTexture(gl.TEXTURE0 + n); gl.bindTexture(gl.TEXTURE_2D, p[1]); gl.uniform1i(U[p[0]], n); });
      gl.drawElements(gl.TRIANGLES, ix.length, gl.UNSIGNED_INT, 0);
      gl.bindVertexArray(null);
    }

    // --- the loop: only while visible, only while something moves ---
    var visible = true, pedido = false, antes = 0, arrastre = null, cambio = true, quieto = 0;
    function pide() { if (!pedido) { pedido = true; requestAnimationFrame(bucle); } }
    function bucle(t) {
      pedido = false;
      var dt = antes ? Math.min(0.05, (t - antes) / 1000) : 0; antes = t;
      if (!visible || document.hidden) { antes = 0; return; }
      var sigue = false, cambia = !Mvista || cambio;
      cambio = false;
      // It turns all the time, one full turn every two minutes (the owner, 17 Oct 2026: «si no se
      // toca la pantalla, tiene que dar la vuelta completa todo el tiempo»). Taken in hand, it
      // stays where it is left; five seconds later it starts turning again, gently.
      if (!reducido) {
        quieto += dt;
        var arranque = arrastre ? 0 : Math.max(0, Math.min(1, (quieto - 5) / 3));
        if (!tocado) arranque = 1;
        if (arranque > 0) { rot += dt * (2 * Math.PI / 120) * arranque * arranque; sigue = true; cambia = true; }
      }
      if (!arrastre && (Math.abs(vr) > 0.002 || Math.abs(vt) > 0.002)) {
        rot += vr * dt; tilt = Math.max(-1.2, Math.min(1.2, tilt + vt * dt));
        var f = Math.exp(-9 * dt); vr *= f; vt *= f; sigue = true; cambia = true;
      }
      if (cambia || arrastre) dibuja();
      if (ctx) { dibujaRutas(dt); if (!reducido) sigue = true; }
      if (sigue || arrastre) pide();
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = !!(e[0] && e[0].isIntersecting); if (visible) pide(); }, { threshold: 0.01 }).observe(cv);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) pide(); });
    window.addEventListener('resize', function () { cambio = true; pide(); });

    // --- dragging: calm, a heavy globe on a desk ---
    cv.style.touchAction = 'pan-y';
    cv.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      tocado = true; quieto = 0; vr = vt = 0;
      arrastre = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, mov: 0 };
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      cv.classList.add('arrastrando'); pide();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!arrastre || e.pointerId !== arrastre.id) return;
      var dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
      var s = 0.33 * Math.PI / Math.max(500, cv.clientWidth), dt = Math.max(8, Math.min(80, e.timeStamp - arrastre.t));
      rot += dx * s; tilt = Math.max(-1.2, Math.min(1.2, tilt + dy * s * 0.8)); cambio = true; quieto = 0;
      vr = dx * s * 1000 / dt * 0.3; vt = dy * s * 0.8 * 1000 / dt * 0.3;
      arrastre.x = e.clientX; arrastre.y = e.clientY; arrastre.t = e.timeStamp;
    });
    function suelta(e) { if (arrastre && e.pointerId === arrastre.id) { arrastre = null; cv.classList.remove('arrastrando'); pide(); } }
    cv.addEventListener('pointerup', suelta); cv.addEventListener('pointercancel', suelta);
    // Keyboard: the arrow keys turn it a little.
    cv.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d) return; e.preventDefault(); tocado = true; quieto = 0; rot += d[0] * 8 * RAD; tilt = Math.max(-1.2, Math.min(1.2, tilt + d[1] * 6 * RAD)); cambio = true; pide();
    });

    pide();
    return true;
  }
  window.GuardianaGlobo = { iniciar: iniciar };
})();
