/* GUARDIANA · el globo de la portada (17 Oct 2026).
 *
 * The same Earth as the program's «Por dentro» view: NASA textures (Blue Marble by day, Black
 * Marble city lights by night), the Sun where it is right now (so night on the page is night on
 * the planet), the ocean glint and the edge of the atmosphere. Nothing on it is invented: no
 * connections, no figures. Nothing about the visitor leaves the browser; the globe only turns to
 * face the visitor's side of the world, guessed from the clock's time zone.
 *
 * Calm on purpose (the owner, 17 Oct 2026: «más lento para que haya más control»): it turns by
 * itself very slowly until someone takes it in hand, then it stays where they leave it. It stops
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
    solAhora(); setInterval(solAhora, 30000);

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
      ' vec3 col=mix(dia*vec3(0.30,0.36,0.50), dia*(0.62+0.68*max(mu,0.0)), diaF);\n' +
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
      im.onload = function () { gl.deleteTexture(tex[clave]); tex[clave] = textura(im); listas++; if (listas === 3 && op.lista) op.lista(); pide(); };
      im.src = url;
    }
    carga('dia', ruta + 'dia' + tam + '.jpg'); carga('luces', ruta + 'luces' + tam + '.jpg'); carga('agua', ruta + (movil ? 'agua-1k.png' : 'agua.png'));

    // Facing the visitor's side of the world: the time zone's offset gives a longitude.
    var lon0 = -new Date().getTimezoneOffset() / 60 * 15;
    var rot = -lon0 * RAD + 0.35, tilt = 0.32, vr = 0, vt = 0, tocado = false;

    function dibuja() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
      if (!W || !H) return;
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      var asp = W / H, dist = 1 / Math.sin(Math.atan(0.9 * tanH * Math.min(1, asp)));
      var M = mul(rotX(tilt), rotY(rot)), PV = mul(persp(asp), trasl(0, 0, -dist));
      gl.useProgram(P); gl.bindVertexArray(vao);
      gl.uniformMatrix4fv(U.uPV, false, PV); gl.uniformMatrix4fv(U.uM, false, M);
      gl.uniformMatrix3fv(U.uM3, false, new Float32Array([M[0], M[1], M[2], M[4], M[5], M[6], M[8], M[9], M[10]]));
      gl.uniform3fv(U.uSol, sol); gl.uniform3fv(U.uCam, [0, 0, dist]);
      [['uDia', tex.dia], ['uLuces', tex.luces], ['uAgua', tex.agua]].forEach(function (p, n) { gl.activeTexture(gl.TEXTURE0 + n); gl.bindTexture(gl.TEXTURE_2D, p[1]); gl.uniform1i(U[p[0]], n); });
      gl.drawElements(gl.TRIANGLES, ix.length, gl.UNSIGNED_INT, 0);
      gl.bindVertexArray(null);
    }

    // --- the loop: only while visible, only while something moves ---
    var visible = true, pedido = false, antes = 0, arrastre = null;
    function pide() { if (!pedido) { pedido = true; requestAnimationFrame(bucle); } }
    function bucle(t) {
      pedido = false;
      var dt = antes ? Math.min(0.05, (t - antes) / 1000) : 0; antes = t;
      if (!visible || document.hidden) { antes = 0; return; }
      var sigue = false;
      if (!tocado && !reducido) { rot += dt * (2 * Math.PI / 360); sigue = true; } // one turn every six minutes
      if (!arrastre && (Math.abs(vr) > 0.002 || Math.abs(vt) > 0.002)) {
        rot += vr * dt; tilt = Math.max(-1.2, Math.min(1.2, tilt + vt * dt));
        var f = Math.exp(-9 * dt); vr *= f; vt *= f; sigue = true;
      }
      dibuja();
      if (sigue || arrastre) pide();
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = !!(e[0] && e[0].isIntersecting); if (visible) pide(); }, { threshold: 0.01 }).observe(cv);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) pide(); });
    window.addEventListener('resize', pide);

    // --- dragging: calm, a heavy globe on a desk ---
    cv.style.touchAction = 'pan-y';
    cv.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      tocado = true; vr = vt = 0;
      arrastre = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, mov: 0 };
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      cv.classList.add('arrastrando'); pide();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!arrastre || e.pointerId !== arrastre.id) return;
      var dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
      var s = 0.33 * Math.PI / Math.max(500, cv.clientWidth), dt = Math.max(8, Math.min(80, e.timeStamp - arrastre.t));
      rot += dx * s; tilt = Math.max(-1.2, Math.min(1.2, tilt + dy * s * 0.8));
      vr = dx * s * 1000 / dt * 0.3; vt = dy * s * 0.8 * 1000 / dt * 0.3;
      arrastre.x = e.clientX; arrastre.y = e.clientY; arrastre.t = e.timeStamp;
    });
    function suelta(e) { if (arrastre && e.pointerId === arrastre.id) { arrastre = null; cv.classList.remove('arrastrando'); pide(); } }
    cv.addEventListener('pointerup', suelta); cv.addEventListener('pointercancel', suelta);
    // Keyboard: the arrow keys turn it a little.
    cv.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d) return; e.preventDefault(); tocado = true; rot += d[0] * 8 * RAD; tilt = Math.max(-1.2, Math.min(1.2, tilt + d[1] * 6 * RAD)); pide();
    });

    pide();
    return true;
  }
  window.GuardianaGlobo = { iniciar: iniciar };
})();
