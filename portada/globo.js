/* GUARDIANA · the front page's planet (23 Oct 2026).
   The owner: «el planeta se tiene que mover, y la persona tiene que poder moverlo con los dedos, ver otros continentes,
   los cables submarinos». A real Earth drawn by the graphics card (the same day texture as Órbita), turning slowly; a
   finger or the mouse turns it. On it, the submarine cables and land fibre of Órbita's map (real, simplified for this
   page), light running along them, the geostationary belt with its satellites (they turn with the Earth, as they do),
   a few low satellites, and now and then a signal from Colombia up to the satellite over 72°W and down in another
   country. The light, the satellites and the hop are illustrations, not traffic: the page says so beside the planet.
   Without WebGL 2 the picture stays as it is. With «reduce motion» nothing moves by itself; a drag still turns it. */
(() => {
  'use strict';
  const D = Math.PI / 180;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TACTIL = matchMedia('(pointer: coarse)').matches;
  const MOVIL = TACTIL || matchMedia('(max-width: 700px)').matches;
  const AZUL = '156,195,228';

  const v3 = (lo, la, h = 1) => { const a = lo * D, b = la * D, c = Math.cos(b); return [h * c * Math.cos(a), h * c * Math.sin(a), h * Math.sin(b)]; };
  let datos = null;
  const cargaDatos = () => datos || (datos = fetch('/portada/cables.json').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((j) => {
    const plano = (lineas) => lineas.map((l) => { const n = l.length / 2, p = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const q = v3(l[2 * i] / 10, l[2 * i + 1] / 10, 1.002); p[3 * i] = q[0]; p[3 * i + 1] = q[1]; p[3 * i + 2] = q[2]; }
      let L = 0; for (let i = 1; i < n; i++) L += Math.hypot(p[3 * i] - p[3 * i - 3], p[3 * i + 1] - p[3 * i - 2], p[3 * i + 2] - p[3 * i - 1]);
      return { p, l, L }; });
    return { sub: plano(j.sub), tie: plano(j.tie) };
  }));
  const imagenes = {};
  const cargaImagen = (url) => imagenes[url] || (imagenes[url] = new Promise((ok, mal) => { const im = new Image(); im.decoding = 'async'; im.onload = () => ok(im); im.onerror = mal; im.src = url; }));

  // a track for the light: a line resampled every ~0.7° along great circles (or a straight segment in space)
  const pista = (pts) => { const s = [0]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; s.push(s[i - 1] + Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])); } return { p: pts, s, L: s[s.length - 1] }; };
  const curva = (l, h) => { const out = [];
    for (let i = 0; i < l.length / 2; i++) { const b = v3(l[2 * i] / 10, l[2 * i + 1] / 10, 1);
      if (i) { const a = v3(l[2 * i - 2] / 10, l[2 * i - 1] / 10, 1), ang = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))), n = Math.floor(ang / (0.7 * D));
        for (let j = 1; j <= n; j++) { const t = j / (n + 1), sn = Math.sin(ang), f0 = Math.sin((1 - t) * ang) / sn, f1 = Math.sin(t * ang) / sn; out.push([(a[0] * f0 + b[0] * f1) * h, (a[1] * f0 + b[1] * f1) * h, (a[2] * f0 + b[2] * f1) * h]); } }
      out.push([b[0] * h, b[1] * h, b[2] * h]); }
    return pista(out); };
  const recta = (a, b) => { const out = []; for (let i = 0; i <= 48; i++) { const t = i / 48; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]); } return pista(out); };
  const punto = (t, u) => { const s = t.s; if (u <= 0) return t.p[0]; if (u >= t.L) return t.p[t.p.length - 1];
    let lo = 0, hi = s.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (s[m] < u) lo = m; else hi = m; }
    const f = (u - s[lo]) / ((s[hi] - s[lo]) || 1), a = t.p[lo], b = t.p[hi]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; };

  // ---------- the Earth, on the graphics card ----------
  const VS = '#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `#version 300 es
precision highp float;
uniform sampler2D uT;uniform vec2 uC;uniform float uR;uniform vec3 uE,uN,uF,uL;
out vec4 o;
void main(){
  vec2 p=(gl_FragCoord.xy-uC)/uR;float r2=dot(p,p),rr=sqrt(r2);
  vec2 pc=rr<0.9999?p:p/rr*0.9999;float z=sqrt(max(0.,1.-dot(pc,pc)));
  vec3 q=pc.x*uE+pc.y*uN+z*uF;
  float lat=asin(clamp(q.z,-1.,1.)),lon=atan(q.y,q.x);
  vec2 uv=vec2(lon/6.2831853+.5,.5-lat/3.1415927);
  vec2 dx=dFdx(uv),dy=dFdy(uv);dx.x-=floor(dx.x+.5);dy.x-=floor(dy.x+.5);
  vec3 c=textureGrad(uT,uv,dx,dy).rgb;
  vec3 azul=vec3(.6118,.7647,.8941);
  float lam=clamp(dot(vec3(pc,z),uL),0.,1.);
  c*=.30+.85*pow(lam,.9);
  float b=pow(1.-z,2.2);c=c*(1.-.42*b)+azul*(.42*b);
  float dentro=clamp((1.-rr)*uR+.5,0.,1.);
  float h=clamp(1.-(rr-1.)/.06,0.,1.);h=h*h*h;
  o=vec4(c,1.)*dentro+vec4(azul*.30*h,.30*h)*(1.-dentro);
}`;
  function tierra(cv, img) {
    const gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) return null;
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
    const pg = gl.createProgram(); gl.attachShader(pg, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pg);
    if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pg));
    gl.useProgram(pg);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const la = gl.getAttribLocation(pg, 'a'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const an = gl.getExtension('EXT_texture_filter_anisotropic'); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    const u = (n) => gl.getUniformLocation(pg, n), U = { C: u('uC'), R: u('uR'), E: u('uE'), N: u('uN'), F: u('uF'), L: u('uL') };
    const L = [-0.55, 0.50, 0.67], m = Math.hypot(...L); gl.uniform3f(U.L, L[0] / m, L[1] / m, L[2] / m);
    return { gl, pinta(cx, cy, r, E, N, F) { gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.C, cx, cv.height - cy); gl.uniform1f(U.R, r); gl.uniform3fv(U.E, E); gl.uniform3fv(U.N, N); gl.uniform3fv(U.F, F); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); } };
  }

  // the satellite as drawn in the picture (planeta.py): two panels, a body and a dish
  let SPR = null;
  function sprite() {
    if (SPR) return SPR;
    const k = 3, W = 46 * k, c = document.createElement('canvas'); c.width = W; c.height = 16 * k; const g = c.getContext('2d'), sx = W / 2, sy = 7 * k;
    g.strokeStyle = 'rgba(244,246,248,.9)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(sx - 7 * k, sy); g.lineTo(sx + 7 * k, sy); g.stroke();
    for (const s of [-1, 1]) { const x0 = s < 0 ? sx - 19 * k : sx + 7 * k; g.fillStyle = 'rgba(156,195,228,.95)'; g.fillRect(x0, sy - 3.5 * k, 12 * k, 7 * k);
      g.strokeStyle = 'rgba(6,8,12,.6)'; g.lineWidth = 0.8; for (const kk of [4, 8]) { g.beginPath(); g.moveTo(x0 + kk * k, sy - 3.5 * k); g.lineTo(x0 + kk * k, sy + 3.5 * k); g.stroke(); }
      g.beginPath(); g.moveTo(x0, sy); g.lineTo(x0 + 12 * k, sy); g.stroke(); }
    g.fillStyle = '#F4F6F8'; g.fillRect(sx - 3.5 * k, sy - 3.5 * k, 7 * k, 7 * k);
    g.strokeStyle = 'rgba(244,246,248,.9)'; g.lineWidth = 1; g.beginPath(); g.arc(sx, sy + 6.5 * k, 3 * k, 200 * D, 340 * D); g.stroke();
    return (SPR = { c, w: W, h: 16 * k, ax: sx, ay: sy, k });
  }

  // where the view leans as the planet turns on a touch screen (a finger turns it sideways; the page keeps the
  // vertical swipe): the Americas from the south, as the picture, Europe, Africa and Asia from a little north
  const INCL = [[-180, -12], [-130, -22], [-95, -36], [-72, -42], [-45, -36], [-20, 8], [10, 24], [40, 24], [80, 24], [115, 18], [140, 2], [165, -14], [180, -12]];
  const inclinacion = (lon) => { let l = ((lon + 180) % 360 + 360) % 360 - 180; for (let i = 1; i < INCL.length; i++) if (l <= INCL[i][0]) { const [a, la] = INCL[i - 1], [b, lb] = INCL[i], t = (l - a) / (b - a), s = t * t * (3 - 2 * t); return la + (lb - la) * s; } return INCL[0][1]; };

  window.GuardianaGlobo = function (fig, op) {
    const o = Object.assign({ lon: -72, lat: -42, auto: 5, cx: 0.5, cy: 0.5, r: 0.3, salto: false, etiquetas: false, alListo: null, antes: 0 }, op || {});
    const ov = document.createElement('canvas'), gc = document.createElement('canvas');
    ov.className = 'globo-ov'; gc.className = 'globo-gl'; ov.setAttribute('aria-hidden', 'true'); gc.setAttribute('aria-hidden', 'true');
    const encima = fig.querySelector('.rotulo, .velo'); // captions and the fade into the text stay above the planet
    if (encima) { fig.insertBefore(gc, encima); fig.insertBefore(ov, encima); } else fig.append(gc, ov);
    const ctx = ov.getContext('2d');
    let T = null, DAT = null;
    let lon = o.lon, lat = o.lat, vLon = 0, auto = 0, arrastra = false, tocoLat = -1e9, reloj = 0, W = 0, H = 0, dpr = 1, dprGl = 1, cx = 0, cy = 0, R = 0;
    let E = [0, 0, 0], N = [0, 0, 0], F = [0, 0, 0];
    const base = () => { const l = lon * D, p = lat * D; F = [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]; E = [-Math.sin(l), Math.cos(l), 0];
      N = [F[1] * E[2] - F[2] * E[1], F[2] * E[0] - F[0] * E[2], F[0] * E[1] - F[1] * E[0]]; };
    const pr = (q) => { const x = q[0] * E[0] + q[1] * E[1] + q[2] * E[2], y = q[0] * N[0] + q[1] * N[1] + q[2] * N[2], z = q[0] * F[0] + q[1] * F[1] + q[2] * F[2];
      return [cx + x * R, cy - y * R, z > 0.03 || x * x + y * y > 1.0004, z]; };
    const mide = () => { W = fig.clientWidth; H = fig.clientHeight; dpr = Math.min(devicePixelRatio || 1, MOVIL ? 1.75 : 2); dprGl = Math.min(devicePixelRatio || 1, MOVIL ? 1.5 : 1.5);
      cx = W * o.cx; cy = H * o.cy; R = W * o.r;
      ov.width = Math.round(W * dpr); ov.height = Math.round(H * dpr);
      const lado = 2.16 * R; gc.style.left = (cx - lado / 2) + 'px'; gc.style.top = (cy - lado / 2) + 'px'; gc.style.width = gc.style.height = lado + 'px';
      gc.width = gc.height = Math.round(lado * dprGl); };

    // ---------- the light on the cables ----------
    const LOTES = { sub: { max: MOVIL ? 4 : 10, vel: 0.17, cola: 0.10, rgb: '214,232,248', ancho: MOVIL ? 1.2 : 1.5 }, tie: { max: MOVIL ? 2 : 5, vel: 0.08, cola: 0.05, rgb: AZUL, ancho: MOVIL ? 1.0 : 1.2 } };
    const activos = [], cache = { sub: new Map(), tie: new Map() };
    const elige = (tipo) => { const lista = DAT[tipo]; for (let n = 0; n < 40; n++) { const i = Math.floor(Math.random() * lista.length), c = lista[i];
        if (c.L < (tipo === 'sub' ? 0.12 : 0.05) || activos.some((a) => a.tipo === tipo && a.i === i)) continue;
        // a line facing the viewer now, so the light is seen
        const m = c.p.length / 3 >> 1, z = c.p[3 * m] * F[0] + c.p[3 * m + 1] * F[1] + c.p[3 * m + 2] * F[2]; if (z < 0.15) continue; return i; } return -1; };
    const lanza = (tipo, espera) => { const i = elige(tipo); if (i < 0) { activos.push({ tipo, i: -1, t0: reloj + 0.5 }); return; }
      let t = cache[tipo].get(i); if (!t) { t = curva(DAT[tipo][i].l, tipo === 'sub' ? 1.004 : 1.003); cache[tipo].set(i, t); }
      activos.push({ tipo, i, t, t0: reloj + espera, sentido: Math.random() < 0.5 ? 1 : -1 }); };
    const cometa = (t, u, cola, rgb, ancho, alfa, sentido) => {
      const at = (x) => (sentido > 0 ? x : t.L - x); let prev = null;
      for (let i = 12; i >= 0; i--) { const uu = u - cola * i / 12; if (uu < 0 || uu > t.L) { prev = null; continue; }
        const q = pr(punto(t, at(uu))); if (!q[2]) { prev = null; continue; }
        if (prev) { const f = 1 - i / 12; ctx.globalAlpha = alfa * f * f; ctx.strokeStyle = 'rgb(' + rgb + ')'; ctx.lineWidth = ancho * (0.35 + 0.9 * f); ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
        prev = q; }
      if (u < 0 || u > t.L) return; const h = pr(punto(t, at(u))); if (!h[2]) return;
      const r = ancho * 3.4, g = ctx.createRadialGradient(h[0], h[1], 0, h[0], h[1], r);
      g.addColorStop(0, 'rgba(255,255,255,' + alfa + ')'); g.addColorStop(0.25, 'rgba(' + rgb + ',' + alfa * 0.85 + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h[0], h[1], r, 0, 6.2832); ctx.fill(); };

    // ---------- the hop: Colombia, up to the satellite over 72°W, down in another country ----------
    const CTG = v3(-75.51, 10.39, 1.004), SAT = v3(-72, 0, 1.7);
    const DESTINOS = [['BR', -47.88, -15.79], ['MX', -99.13, 19.43], ['US', -80.19, 25.76], ['SN', -17.45, 14.69], ['PE', -77.04, -12.05]];
    const SUBIDA = recta(CTG, SAT), BAJADAS = DESTINOS.map((d) => recta(SAT, v3(d[1], d[2], 1.004)));
    const lang = document.documentElement.lang || 'es';
    let nombres = null; try { nombres = new Intl.DisplayNames([lang], { type: 'region' }); } catch (e) {}
    const nombre = (cc) => { let n = cc; try { n = nombres ? nombres.of(cc) : cc; } catch (e) {} return n.toLocaleUpperCase(lang); };
    let salto = { d: 0, t0: 2.5 };
    const GEO = [-72, -25, 20, 64, 110, 157, -150, -115];
    const LEO = [{ i: 53, o: -40, f: 0.4, w: 2 * Math.PI / 66 }, { i: 97, o: -105, f: 2.4, w: 2 * Math.PI / 78 }, { i: 70, o: 10, f: 4.1, w: 2 * Math.PI / 60 }].slice(0, MOVIL ? 2 : 3);
    const leo = (s, t) => { const th = s.f + s.w * t, ci = Math.cos(s.i * D), si = Math.sin(s.i * D), co = Math.cos(s.o * D), so = Math.sin(s.o * D), c = Math.cos(th), sn = Math.sin(th), r = 1.09;
      return [r * (co * c - so * ci * sn), r * (so * c + co * ci * sn), r * si * sn]; };
    const etiqueta = (txt, p, alfa, lado) => { if (!o.etiquetas || alfa <= 0.01 || W < 560) return; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = alfa;
      ctx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'; ctx.fillStyle = '#C9D7E6'; ctx.textAlign = lado < 0 ? 'right' : 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(txt, p[0] + lado * 12, p[1]); ctx.globalCompositeOperation = 'lighter'; };
    const onda = (p, q, rgb, alfa, tam) => { if (q <= 0 || q >= 1) return; ctx.globalAlpha = alfa * (1 - q) * (1 - q); ctx.strokeStyle = 'rgb(' + rgb + ')'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(p[0], p[1], tam * (0.3 + q * 2.2), 0, 6.2832); ctx.stroke(); };
    const haz = (t, u, alfa) => { if (alfa <= 0.01) return; const a = pr(t.p[0]), b = pr(punto(t, u)); ctx.globalAlpha = alfa; ctx.strokeStyle = 'rgb(' + AZUL + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };

    // ---------- one frame ----------
    const anillo = (cerca) => { // the geostationary belt, 1.7 radii (not to scale), dashed; the far half behind the planet is hidden
      ctx.lineWidth = Math.max(0.8, R / 360); ctx.strokeStyle = 'rgb(' + AZUL + ')'; ctx.globalAlpha = cerca ? 0.59 : 0.27; ctx.beginPath();
      for (let i = 0; i < 288; i += 2) { const a = pr([1.7 * Math.cos(i * 1.25 * D), 1.7 * Math.sin(i * 1.25 * D), 0]), b = pr([1.7 * Math.cos((i + 1) * 1.25 * D), 1.7 * Math.sin((i + 1) * 1.25 * D), 0]);
        if ((a[3] >= 0) !== cerca || !a[2] || !b[2]) continue; ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke(); };
    const lineas = (lista, rgb, ancho, base, extra) => { // the map's lines on the visible half, brighter where they face you
      ctx.lineWidth = ancho; ctx.strokeStyle = 'rgb(' + rgb + ')';
      const cubos = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (const c of lista) { const p = c.p, n = p.length / 3; let px = 0, py = 0, pz = -1;
        for (let i = 0; i < n; i++) { const X = p[3 * i], Y = p[3 * i + 1], Z = p[3 * i + 2], z = X * F[0] + Y * F[1] + Z * F[2];
          const x = cx + (X * E[0] + Y * E[1] + Z * E[2]) * R, y = cy - (X * N[0] + Y * N[1] + Z * N[2]) * R;
          if (i && z > 0.04 && pz > 0.04) { const k = Math.min(3, Math.floor((z + pz) * 2)); cubos[k].moveTo(px, py); cubos[k].lineTo(x, y); }
          px = x; py = y; pz = z; } }
      for (let k = 0; k < 4; k++) { ctx.globalAlpha = base + extra * (k + 0.5) / 4; ctx.stroke(cubos[k]); } };
    function pinta(dt) {
      base();
      if (T) T.pinta(gc.width / 2, gc.height / 2, R * dprGl, E, N, F);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'source-over';
      anillo(false);
      if (DAT) { lineas(DAT.sub, '226,238,250', Math.max(0.55, R / 380), 0.16, 0.44); lineas(DAT.tie, AZUL, Math.max(0.5, R / 520), 0.10, 0.26); }
      ctx.globalCompositeOperation = 'lighter';
      if (DAT && !RM) for (let j = activos.length - 1; j >= 0; j--) { const a = activos[j];
        if (a.i < 0) { if (reloj > a.t0) { activos.splice(j, 1); lanza(a.tipo, 0.2); } continue; }
        const l = LOTES[a.tipo], t = a.t, u = (reloj - a.t0) * l.vel; if (u < 0) continue;
        if (u > t.L + l.cola) { activos.splice(j, 1); lanza(a.tipo, 0.6 + Math.random() * 2.2); continue; }
        cometa(t, u, l.cola, l.rgb, l.ancho, 0.95 * Math.min(1, u / 0.06, (t.L + l.cola - u) / 0.06), a.sentido); }
      ctx.globalCompositeOperation = 'source-over'; anillo(true); ctx.globalCompositeOperation = 'lighter';
      // geostationary satellites: fixed over the equator, so they turn with the Earth
      const sp = sprite();
      for (const g of GEO) { const q = pr(v3(g, 0, 1.7)); if (!q[2]) continue;
        if (g === -72) { const gl0 = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 34 * R / 470 * 1.6); gl0.addColorStop(0, 'rgba(156,195,228,.22)'); gl0.addColorStop(1, 'rgba(156,195,228,0)'); ctx.globalAlpha = 1; ctx.fillStyle = gl0; ctx.beginPath(); ctx.arc(q[0], q[1], 34 * R / 470 * 1.6, 0, 6.2832); ctx.fill();
          const e = (R / 470) * 1.0 / (sp.k / 3) * 0.5; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.95; ctx.drawImage(sp.c, q[0] - sp.ax * e, q[1] - sp.ay * e, sp.w * e, sp.h * e); ctx.globalCompositeOperation = 'lighter';
          onda(q, (reloj * 0.42) % 1, AZUL, 0.45, 7); }
        else { ctx.globalAlpha = q[3] >= 0 ? 0.9 : 0.45; ctx.fillStyle = '#DCEBFA'; const z = MOVIL ? 2.2 : 2.6; ctx.fillRect(q[0] - z / 2, q[1] - z / 2, z, z); } }
      // low satellites passing (orbits drawn 1.09 radii out and sped up: illustration)
      if (!RM) for (const s of LEO) { let prev = null;
        for (let i = 10; i >= 0; i--) { const q = pr(leo(s, reloj - i * 0.16)); if (!q[2]) { prev = null; continue; }
          if (prev) { const f = 1 - i / 10; ctx.globalAlpha = 0.5 * f * f; ctx.strokeStyle = 'rgb(' + AZUL + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
          prev = q; }
        const q = pr(leo(s, reloj)); if (q[2]) { ctx.globalAlpha = 0.95; ctx.fillStyle = '#DCEBFA'; const z = MOVIL ? 2.2 : 2.6; ctx.fillRect(q[0] - z / 2, q[1] - z / 2, z, z); } }
      // Cartagena, breathing, and the hop when Colombia faces you
      if (o.salto) {
        const c = pr(CTG), vis = c[3] > 0.2;
        if (vis) { const ph = (reloj * 0.35) % 1; ctx.globalAlpha = 0.55 * (1 - ph); ctx.strokeStyle = '#F4F6F8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(c[0], c[1], 3 + ph * 14, 0, 6.2832); ctx.stroke();
          ctx.globalAlpha = 0.95; ctx.fillStyle = '#F4F6F8'; ctx.beginPath(); ctx.arc(c[0], c[1], 2.1, 0, 6.2832); ctx.fill(); }
        const dt0 = reloj - salto.t0, baja = BAJADAS[salto.d], dest = pr(punto(baja, baja.L)), s = pr(SAT);
        const T1 = 1.05, T2 = 1.3, T3 = 2.35, T4 = 3.5, PAUSA = MOVIL ? 5.5 : 3.2;
        if (dt0 >= 0 && !RM) {
          if (dt0 < 0.05 && (!vis || s[3] < 0 || dest[3] < 0.12)) { // not facing you now: try the next country a little later
            salto = { d: (salto.d + 1) % DESTINOS.length, t0: reloj + 0.8 }; }
          else {
            const alfaEt = Math.min(1, dt0 / 0.4) * (dt0 < T4 ? 1 : Math.max(0, 1 - (dt0 - T4) / 0.6));
            etiqueta(nombre('CO'), c, 0.9 * alfaEt, -1);
            if (dt0 < T1) { const u = SUBIDA.L * (dt0 / T1); haz(SUBIDA, u, 0.22); cometa(SUBIDA, u, 0.22, '244,246,248', MOVIL ? 1.4 : 1.8, 1, 1); }
            else if (dt0 < T3 + 0.3) haz(SUBIDA, SUBIDA.L, 0.22 * Math.max(0, 1 - (dt0 - T1) / 1.6));
            if (dt0 >= T1 - 0.05 && dt0 < T2 + 0.5) { const q = Math.min(1, (dt0 - T1 + 0.05) / 0.75), rr = 26 * Math.max(0.7, R / 300), g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], rr);
              g.addColorStop(0, 'rgba(255,255,255,' + 0.9 * (1 - q) + ')'); g.addColorStop(1, 'rgba(156,195,228,0)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s[0], s[1], rr, 0, 6.2832); ctx.fill(); }
            if (dt0 >= T2 && dt0 < T3) { const u = baja.L * ((dt0 - T2) / (T3 - T2)); haz(baja, u, 0.22); cometa(baja, u, 0.22, '244,246,248', MOVIL ? 1.4 : 1.8, 1, 1); }
            else if (dt0 >= T3) haz(baja, baja.L, 0.22 * Math.max(0, 1 - (dt0 - T3) / 1.6));
            if (dt0 >= T3) { onda(dest, (dt0 - T3) / 1.2, '244,246,248', 0.9, 6); etiqueta(nombre(DESTINOS[salto.d][0]), dest, 0.9 * Math.min(1, (dt0 - T3) / 0.3) * Math.max(0, 1 - Math.max(0, dt0 - T4) / 0.6), dest[0] < c[0] ? -1 : 1); }
            if (dt0 > T4 + 0.6 + PAUSA) salto = { d: (salto.d + 1) % DESTINOS.length, t0: reloj + 0.2 };
          }
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }

    // ---------- a finger or the mouse turns it ----------
    let px = 0, py = 0, pt = 0, esRaton = false, idPtr = null;
    ov.style.touchAction = 'pan-y';
    ov.addEventListener('pointerdown', (e) => { if (e.button > 0) return; arrastra = true; idPtr = e.pointerId; esRaton = e.pointerType === 'mouse' || e.pointerType === 'pen'; px = e.clientX; py = e.clientY; pt = performance.now(); vLon = 0;
      try { ov.setPointerCapture(e.pointerId); } catch (_) {} fig.classList.add('girando'); anda(); });
    ov.addEventListener('pointermove', (e) => { if (!arrastra || e.pointerId !== idPtr) return; const now = performance.now(), dx = e.clientX - px, dy = e.clientY - py, dtm = Math.max(8, now - pt);
      const g = 57.3 / Math.max(80, R); lon -= dx * g; vLon = -dx * g / dtm * 1000;
      if (esRaton) { lat = Math.max(-65, Math.min(65, lat + dy * g)); tocoLat = reloj; }
      px = e.clientX; py = e.clientY; pt = now; if (RM) pintaYa(); });
    const suelta = (e) => { if (!arrastra || (e && e.pointerId !== idPtr)) return; arrastra = false; fig.classList.remove('girando'); if (performance.now() - pt > 120) vLon = 0; };
    ov.addEventListener('pointerup', suelta); ov.addEventListener('pointercancel', suelta); ov.addEventListener('lostpointercapture', suelta);

    // ---------- the loop: only while it is on screen and the tab is visible ----------
    let corre = false, visto = false, listo = false, antes = 0, salta = false, ultimoPinta = 0;
    function cuadro(ms) {
      if (!corre) return; requestAnimationFrame(cuadro);
      if (MOVIL && !arrastra && (salta = !salta)) return; // phones: 30 frames a second unless a finger is on it
      const dt = antes ? Math.min(0.1, (ms - antes) / 1000) : 0; antes = ms; reloj += dt;
      if (!arrastra) {
        auto = Math.min(o.auto, auto + o.auto * dt / 2.5);      // it starts turning gently
        vLon += (-auto - vLon) * (1 - Math.pow(0.12, dt));       // inertia after a flick, then back to its own pace
        if (!RM) lon += vLon * dt;
        if (reloj - tocoLat > 5) lat += (inclinacion(lon) - lat) * (1 - Math.pow(0.35, dt)); // after a while, it leans to show the land
      }
      pinta(dt); ultimoPinta = ms;
    }
    const pintaYa = () => { if (!listo) return; requestAnimationFrame(() => pinta(0)); };
    function anda() { const debe = listo && (visto || arrastra) && !document.hidden && (!RM || arrastra); if (debe && !corre) { corre = true; antes = 0; requestAnimationFrame(cuadro); } else if (!debe) corre = false; }
    new IntersectionObserver(([e]) => { visto = e.isIntersecting; anda(); }, { rootMargin: '120px 0px' }).observe(fig);
    document.addEventListener('visibilitychange', anda);
    new ResizeObserver(() => { mide(); if (listo && !corre) pintaYa(); }).observe(fig); mide();

    // ---------- start: the texture and the cables, then a cross-fade from the picture ----------
    const listoP = Promise.all([cargaImagen(MOVIL ? '/portada/tierra-1k.jpg' : '/portada/tierra-2k.jpg'), cargaDatos()]).then(([img, d]) => {
      DAT = d;
      try { T = tierra(gc, img); } catch (e) { T = null; }
      if (!T) { fig.classList.add('sin-gl'); return false; }
      for (const tipo in LOTES) for (let j = 0; j < LOTES[tipo].max; j++) lanza(tipo, 0.4 + j * 0.9 + Math.random() * 1.2);
      gc.addEventListener('webglcontextlost', (e) => { e.preventDefault(); corre = false; listo = false; fig.classList.remove('vivo'); });
      const espera = Math.max(0, o.antes - performance.now());
      return new Promise((ok) => setTimeout(() => { listo = true; pinta(0); fig.classList.add('vivo'); if (o.alListo) o.alListo(); anda(); ok(true); }, espera));
    }).catch(() => { fig.classList.add('sin-gl'); return false; });
    return { listo: listoP };
  };
})();
