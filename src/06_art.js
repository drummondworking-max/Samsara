/* ================= art: primitives, textures, props, effects, icons ================= */
const ART = { S: 2, spr: {}, fx: {}, glow: {}, icons: {}, iconCv: {}, tex: {}, walls: {}, props: {}, cre: {} };

function ellipse(g, x, y, rx, ry, fill, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); if (fill) { g.fillStyle = fill; g.fill(); } }
function ball(g, x, y, rx, ry, col, hl = 0.4, sh = -0.5) {
  const gr = g.createRadialGradient(x - rx * 0.35, y - ry * 0.4, Math.min(rx, ry) * 0.08, x, y, Math.max(rx, ry) * 1.08);
  gr.addColorStop(0, shade(col, hl)); gr.addColorStop(0.5, col); gr.addColorStop(1, shade(col, sh)); ellipse(g, x, y, rx, ry, gr);
}
function limb(g, x1, y1, x2, y2, w, col) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = shade(col, -0.45); g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  g.strokeStyle = col; g.lineWidth = w * 0.7; g.beginPath(); g.moveTo(x1 - w * 0.1, y1 - w * 0.08); g.lineTo(x2 - w * 0.1, y2 - w * 0.08); g.stroke();
  g.globalAlpha = 0.45; g.strokeStyle = shade(col, 0.4); g.lineWidth = w * 0.22; g.beginPath(); g.moveTo(x1 - w * 0.22, y1 - w * 0.16); g.lineTo(x2 - w * 0.22, y2 - w * 0.16); g.stroke(); g.globalAlpha = 1;
}
function poly(g, pts, fill, stroke, lw) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1; g.stroke(); } }
function lgrad(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => gr.addColorStop(s[0], s[1])); return gr; }
function rgrad(g, x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(s => gr.addColorStop(s[0], s[1])); return gr; }
function line(g, x1, y1, x2, y2, col, w) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
function curve(g, pts, col, w) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 4) g.quadraticCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]); g.stroke(); }

function newSpr(w, h, ax, ay, sc) { const s = sc || ART.S; const c = mkCanvas(w * s, h * s); const g = c.getContext('2d'); g.scale(s, s); return { c, g, w, h, ax, ay, s }; }
function finishSpr(sp, o = {}) {
  const c = sp.c, W = c.width, H = c.height; const g = c.getContext('2d');
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
  if (o.shade !== 0) { g.fillStyle = lgrad(g, 0, 0, W * 0.8, H, [[0, 'rgba(255,236,200,0.16)'], [0.45, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,' + (o.dark || 0.38) + ')']]); g.fillRect(0, 0, W, H); }
  if (o.grit !== 0 && ART.gritPat) { g.globalAlpha = o.grit || 0.16; g.fillStyle = ART.gritPat; g.fillRect(0, 0, W, H); }
  g.restore();
  if (o.outline !== 0) {
    const out = mkCanvas(W, H); const og = out.getContext('2d');
    const sil = mkCanvas(W, H); const sg = sil.getContext('2d'); sg.drawImage(c, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = o.ocol || 'rgba(10,5,2,0.9)'; sg.fillRect(0, 0, W, H);
    const d = Math.max(1, Math.round(sp.s * (o.ow || 0.8)));
    for (const [dx, dy] of [[-d, 0], [d, 0], [0, -d], [0, d]]) og.drawImage(sil, dx, dy);
    og.drawImage(c, 0, 0); sp.c = out;
  }
  return sp;
}
function mirrorSpr(sp) { const c = mkCanvas(sp.c.width, sp.c.height); const g = c.getContext('2d'); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(sp.c, 0, 0); return { c, w: sp.w, h: sp.h, ax: sp.w - sp.ax, ay: sp.ay, s: sp.s }; }
function drawSpr(ctx, sp, x, y, alpha) { if (alpha != null) { const a = ctx.globalAlpha; ctx.globalAlpha = alpha * a; ctx.drawImage(sp.c, x - sp.ax, y - sp.ay, sp.w, sp.h); ctx.globalAlpha = a; } else ctx.drawImage(sp.c, x - sp.ax, y - sp.ay, sp.w, sp.h); }
function drawSprScaled(ctx, sp, x, y, k) { ctx.drawImage(sp.c, x - sp.ax * k, y - sp.ay * k, sp.w * k, sp.h * k); }

/* grit & glow */
function buildGrit() {
  const c = mkCanvas(96, 96); const g = c.getContext('2d'); const id = g.createImageData(96, 96);
  for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() < 0.5 ? 0 : 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = Math.random() * 90; }
  g.putImageData(id, 0, 0); ART.grit = c; ART.gritPat = g.createPattern(c, 'repeat');
}
function glowSpr(col, r = 32) {
  const key = col + r; if (ART.glow[key]) return ART.glow[key];
  const c = mkCanvas(r * 2, r * 2); const g = c.getContext('2d');
  g.fillStyle = rgrad(g, r, r, 0, r, [[0, rgba(col, 1)], [0.25, rgba(col, 0.55)], [0.6, rgba(col, 0.15)], [1, rgba(col, 0)]]); g.fillRect(0, 0, r * 2, r * 2);
  return (ART.glow[key] = c);
}

/* ---------- effect sprites ---------- */
function buildFx() {
  const F = ART.fx;
  const mk = (name, w, h, fn, o) => { const sp = newSpr(w, h, w / 2, h / 2); fn(sp.g, w, h); F[name] = o && o.fin ? finishSpr(sp, o.fin) : sp; };
  const arrow = (col, head, glowc) => (g, w, h) => {
    if (glowc) { g.fillStyle = rgrad(g, w * 0.6, h / 2, 0, h / 2, [[0, rgba(glowc, 0.8)], [1, rgba(glowc, 0)]]); g.fillRect(0, 0, w, h); }
    line(g, 4, h / 2, w - 8, h / 2, col, 1.8); poly(g, [w - 2, h / 2, w - 10, h / 2 - 3.5, w - 9, h / 2, w - 10, h / 2 + 3.5], head);
    poly(g, [4, h / 2, 10, h / 2 - 3, 12, h / 2, 10, h / 2 + 3], '#e8e0d0');
  };
  mk('arrow', 32, 12, arrow('#8a6a40', '#c8c8d0'));
  mk('arrowf', 32, 14, arrow('#8a4a20', '#ffb050', '#ff6a1a'));
  mk('arrowc', 32, 14, arrow('#6a8aa0', '#e0f4ff', '#7fc8ff'));
  mk('arrowl', 32, 14, arrow('#8a8040', '#fff4a0', '#ffe066'));
  mk('arrowg', 32, 14, arrow('#a08a50', '#fff0c0', '#fff2c8'));
  mk('arrowv', 32, 14, arrow('#5a3a80', '#e0c0ff', '#b77dff'));
  mk('arrows', 32, 14, arrow('#e0e0e0', '#ffffff', '#ffffff'));
  mk('orb', 20, 20, (g, w, h) => { g.fillStyle = rgrad(g, 10, 10, 0, 10, [[0, '#ffffff'], [0.35, '#fff2c8'], [0.7, 'rgba(255,220,150,.5)'], [1, 'rgba(255,200,120,0)']]); g.fillRect(0, 0, w, h); });
  mk('void', 24, 24, (g, w, h) => { g.fillStyle = rgrad(g, 12, 12, 0, 12, [[0, '#000'], [0.45, '#2a0a4a'], [0.7, 'rgba(183,125,255,.9)'], [1, 'rgba(183,125,255,0)']]); g.fillRect(0, 0, w, h); });
  mk('blade', 28, 16, (g, w, h) => { g.fillStyle = rgrad(g, 14, 8, 0, 14, [[0, 'rgba(255,240,200,.9)'], [1, 'rgba(255,240,200,0)']]); g.fillRect(0, 0, w, h); g.beginPath(); g.moveTo(26, 8); g.quadraticCurveTo(12, -2, 2, 4); g.quadraticCurveTo(12, 4, 26, 8); g.quadraticCurveTo(12, 12, 2, 12); g.quadraticCurveTo(12, 18, 26, 8); g.fillStyle = '#fffbe8'; g.fill(); });
  mk('hand', 22, 22, (g) => { g.save(); g.translate(11, 11); g.rotate(Math.PI / 2); g.fillStyle = 'rgba(255,240,190,.35)'; g.beginPath(); g.arc(0, 0, 11, 0, TAU); g.fill(); g.fillStyle = '#ffeebb'; g.beginPath(); g.ellipse(0, 3, 5, 6, 0, 0, TAU); g.fill(); for (let i = 0; i < 4; i++) { g.fillRect(-4.5 + i * 2.6, -8, 2, 8); } g.fillRect(4, -1, 5, 2); g.restore(); });
  mk('feather', 22, 10, (g) => { g.fillStyle = rgrad(g, 11, 5, 0, 11, [[0, 'rgba(255,160,60,.8)'], [1, 'rgba(255,100,20,0)']]); g.fillRect(0, 0, 22, 10); ellipse(g, 11, 5, 9, 2.6, '#ffcf5a'); line(g, 2, 5, 20, 5, '#a8401a', 0.8); });
  mk('venom', 14, 14, (g) => { g.fillStyle = rgrad(g, 7, 7, 0, 7, [[0, '#e8ffb0'], [0.5, '#6ad83a'], [1, 'rgba(60,160,40,0)']]); g.fillRect(0, 0, 14, 14); });
  mk('note', 16, 16, (g) => { g.fillStyle = rgrad(g, 8, 8, 0, 8, [[0, 'rgba(255,240,150,.8)'], [1, 'rgba(255,240,150,0)']]); g.fillRect(0, 0, 16, 16); ellipse(g, 6, 11, 3, 2.2, '#fff6c0', -0.4); line(g, 8.6, 10.5, 8.6, 3, '#fff6c0', 1.2); line(g, 8.6, 3, 12, 5, '#fff6c0', 1.2); });
  mk('rock', 14, 14, (g) => { ball(g, 7, 7, 5, 4.4, '#7a7064'); });
  mk('fireball', 22, 22, (g) => { g.fillStyle = rgrad(g, 11, 11, 0, 11, [[0, '#fff8d0'], [0.3, '#ffb040'], [0.65, 'rgba(255,90,20,.7)'], [1, 'rgba(255,60,10,0)']]); g.fillRect(0, 0, 22, 22); });
  mk('frostball', 22, 22, (g) => { g.fillStyle = rgrad(g, 11, 11, 0, 11, [[0, '#ffffff'], [0.3, '#b8e8ff'], [0.65, 'rgba(100,180,255,.7)'], [1, 'rgba(100,180,255,0)']]); g.fillRect(0, 0, 22, 22); });
  mk('lightball', 22, 22, (g) => { g.fillStyle = rgrad(g, 11, 11, 0, 11, [[0, '#ffffff'], [0.3, '#fff4a0'], [0.65, 'rgba(255,220,60,.7)'], [1, 'rgba(255,220,60,0)']]); g.fillRect(0, 0, 22, 22); });
  mk('voidball', 22, 22, (g) => { g.fillStyle = rgrad(g, 11, 11, 0, 11, [[0, '#f0d0ff'], [0.3, '#9a4aff'], [0.65, 'rgba(90,20,160,.7)'], [1, 'rgba(60,10,120,0)']]); g.fillRect(0, 0, 22, 22); });
  mk('swordleaf', 20, 8, (g) => { g.beginPath(); g.moveTo(1, 4); g.quadraticCurveTo(10, -1, 19, 4); g.quadraticCurveTo(10, 9, 1, 4); g.fillStyle = lgrad(g, 0, 0, 0, 8, [[0, '#f0f0ff'], [1, '#6a6a80']]); g.fill(); line(g, 2, 4, 18, 4, '#3a3a4a', 0.6); });
  mk('chakra', 26, 26, (g) => { g.fillStyle = rgrad(g, 13, 13, 0, 13, [[0, 'rgba(255,200,80,.9)'], [0.6, 'rgba(255,90,20,.5)'], [1, 'rgba(255,60,10,0)']]); g.fillRect(0, 0, 26, 26); g.strokeStyle = '#fff0a0'; g.lineWidth = 2; g.beginPath(); g.arc(13, 13, 7, 0, TAU); g.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; line(g, 13, 13, 13 + Math.cos(a) * 9.5, 13 + Math.sin(a) * 9.5, '#ffd060', 1.4); } });
  mk('sunfire', 34, 34, (g) => { g.fillStyle = rgrad(g, 17, 17, 0, 17, [[0, '#fffbe0'], [0.3, '#ffcf4a'], [0.6, 'rgba(255,110,20,.6)'], [1, 'rgba(255,60,0,0)']]); g.fillRect(0, 0, 34, 34); });
  mk('leaf', 18, 12, (g) => { g.beginPath(); g.moveTo(2, 6); g.quadraticCurveTo(9, -2, 16, 6); g.quadraticCurveTo(9, 14, 2, 6); g.fillStyle = lgrad(g, 0, 0, 16, 12, [[0, '#c8f0a0'], [1, '#3a8a2a']]); g.fill(); line(g, 2, 6, 16, 6, '#2a5a1a', 0.7); });
  mk('spark', 10, 10, (g) => { g.fillStyle = rgrad(g, 5, 5, 0, 5, [[0, '#fff'], [1, 'rgba(255,255,255,0)']]); g.fillRect(0, 0, 10, 10); });
  mk('petal', 12, 12, (g) => { g.beginPath(); g.moveTo(6, 1); g.quadraticCurveTo(11, 6, 6, 11); g.quadraticCurveTo(1, 6, 6, 1); g.fillStyle = lgrad(g, 0, 0, 12, 12, [[0, '#fff0f4'], [1, '#ff8ab0']]); g.fill(); });
  mk('knife', 18, 8, (g) => { poly(g, [1, 4, 12, 1.5, 17, 4, 12, 6.5], '#d8dce8'); line(g, 1, 4, 5, 4, '#5a3a20', 3); });
  mk('bone', 16, 8, (g) => { line(g, 3, 4, 13, 4, '#e8e0c8', 2.5); ball(g, 3, 3, 2, 2, '#f0e8d0'); ball(g, 3, 5.5, 2, 2, '#f0e8d0'); ball(g, 13, 3, 2, 2, '#f0e8d0'); ball(g, 13, 5.5, 2, 2, '#f0e8d0'); });
  mk('feathr', 22, 10, (g) => { ellipse(g, 11, 5, 9, 2.4, '#ff5a3a'); line(g, 2, 5, 20, 5, '#6a1a0a', 0.8); });
  mk('moon', 26, 26, (g) => { g.fillStyle = rgrad(g, 13, 13, 0, 13, [[0, '#ffffff'], [0.5, '#e8ecff'], [0.8, 'rgba(200,210,255,.4)'], [1, 'rgba(200,210,255,0)']]); g.fillRect(0, 0, 26, 26); });
  mk('skull', 18, 18, (g) => { g.fillStyle = rgrad(g, 9, 9, 1, 9, [[0, 'rgba(190,130,255,.6)'], [1, 'rgba(190,130,255,0)']]); g.fillRect(0, 0, 18, 18); ball(g, 9, 8, 5.5, 5.5, '#f4ecd8'); g.fillRect(6.5, 11, 5, 3.5); ellipse(g, 7, 8, 1.4, 1.7, '#2a0a3a'); ellipse(g, 11, 8, 1.4, 1.7, '#2a0a3a'); });
  mk('eye', 18, 12, (g) => { ellipse(g, 9, 6, 8, 4.5, '#ffe8d0'); ball(g, 9, 6, 3.4, 3.4, '#8a1a8a'); ellipse(g, 9, 6, 1.5, 1.5, '#000'); });
}

/* ---------- floor textures ---------- */
function floorTexture(pal, mode) {
  const W = 256, H = 128; const c = mkCanvas(W, H); const g = c.getContext('2d'); const id = g.createImageData(W, H); const d = id.data;
  const A = hexRgb(pal.floor), B = hexRgb(pal.floor2), Gr = hexRgb(pal.grout), Ac = hexRgb(pal.accent);
  const N = makeNoise(hashStr(pal.floor + mode));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / 64, v = y / 32;
    const n1 = N.tfbm(u, v, 4, 4), n2 = N.tfbm(u * 4, v * 4, 16, 3), n3 = N.tfbm(u * 2 + 7.3, v * 2 + 3.1, 8, 3);
    let t = clamp((n1 - 0.38) * 2.4, 0, 1);
    let r = lerp(A[0], B[0], t), gg = lerp(A[1], B[1], t), b = lerp(A[2], B[2], t);
    let k = 0.78 + n2 * 0.45;
    const ridge = 1 - Math.abs(n3 * 2 - 1);
    if (mode === 'marble') { const vein = Math.abs(Math.sin(u * 5 + n1 * 9 + v * 2)); if (vein < 0.06) k *= 1.12; k = 0.9 + n2 * 0.2; }
    if (mode === 'cracks' && ridge > 0.93) { k *= 0.55; }
    if (mode === 'lava' && ridge > 0.9) { const e = (ridge - 0.9) / 0.1; r = lerp(r, 255, e); gg = lerp(gg, 110 + 80 * e, e); b = lerp(b, 20, e); k = 1 + e * 0.4; }
    if (mode === 'ice') { k = 0.85 + n2 * 0.3; if (ridge > 0.94) { r = 230; gg = 245; b = 255; } }
    if (mode === 'dry' && ridge > 0.9) { k *= 0.6; }
    if (mode === 'moss') { const m = N.tfbm(u * 3 + 11, v * 3, 12, 3); if (m > 0.55) { r = lerp(r, Ac[0], 0.5); gg = lerp(gg, Ac[1], 0.5); b = lerp(b, Ac[2], 0.5); } }
    if (Math.random() < 0.04) k *= Math.random() < 0.5 ? 0.8 : 1.15;
    const i = (y * W + x) * 4; d[i] = clamp(r * k, 0, 255); d[i + 1] = clamp(gg * k, 0, 255); d[i + 2] = clamp(b * k, 0, 255); d[i + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  return c;
}
function realmTexMode(r, cave, cold) { const id = REALMS[r].id; if (cave) return id === 'naraka' ? (cold ? 'ice' : 'lava') : id === 'deva' ? 'marble' : 'cracks'; return { deva: 'marble', human: 'plain', asura: 'cracks', animal: 'moss', preta: 'dry', naraka: 'lava' }[id]; }
function realmPal(r, cave, cold) {
  const P = REALMS[r].pal; if (!cave) return P;
  const q = Object.assign({}, P);
  if (REALMS[r].id === 'naraka' && cold) Object.assign(q, { floor: '#6a8aa8', floor2: '#8ab0c8', grout: '#3a4a5a', wall: '#8ab0d0', wall2: '#4a6a8a', trim: '#c8f0ff', dark: 0.6, amb: '#c8e8ff', lava: 0, fog: '#0a1a2a' });
  else if (REALMS[r].id === 'deva') Object.assign(q, { floor: '#9a8ab8', floor2: '#c0a8d0', grout: '#6a5a88', wall: '#a898c8', wall2: '#6a5a8a', trim: '#f0c8ff', dark: 0.45, light: 9, voidTop: '#0a0612', voidBot: '#050308', paved: 0 });
  else { q.floor = shade(P.floor, -0.25); q.floor2 = shade(P.floor2, -0.3); q.wall = shade(P.wall, -0.15); q.dark = Math.min(0.78, P.dark + 0.15); q.light = P.light - 1; q.voidTop = '#050403'; q.voidBot = '#020101'; q.paved = 0; }
  return q;
}

/* ---------- wall blocks ---------- */
function buildWall(pal, style, variant) {
  const WH = 44; const sp = newSpr(64, 32 + WH + 2, 32, 16 + WH + 1);
  const g = sp.g; const top = 1, cx = 32; const N = makeNoise(variant * 97 + 3);
  const tx = (y) => y;
  // faces
  const L = [0, WH + 16, 32, WH + 32, 32, 32, 0, 16].map((v, i) => i % 2 ? v + top : v);
  const Rr = [32, WH + 32, 64, WH + 16, 64, 16, 32, 32].map((v, i) => i % 2 ? v + top : v);
  const T = [32, 0, 64, 16, 32, 32, 0, 16].map((v, i) => i % 2 ? v + top : v);
  const wc = pal.wall, w2 = pal.wall2;
  poly(g, L, lgrad(g, 0, 16, 32, WH + 32, [[0, shade(wc, -0.28)], [1, shade(w2, -0.45)]]));
  poly(g, Rr, lgrad(g, 32, 16, 64, WH + 32, [[0, shade(wc, -0.05)], [1, shade(w2, -0.25)]]));
  poly(g, T, lgrad(g, 0, 0, 64, 32, [[0, shade(wc, 0.2)], [1, wc]]));
  g.save();
  // texture
  g.globalAlpha = 0.5;
  for (let i = 0; i < 70; i++) { const x = Math.random() * 64, y = Math.random() * (WH + 30) + 4; g.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.12)'; g.fillRect(x, y, 1.2, 1.2); }
  g.globalAlpha = 1;
  if (style === 'brick' || style === 'marble') {
    g.strokeStyle = style === 'marble' ? 'rgba(120,100,60,.35)' : 'rgba(0,0,0,.35)'; g.lineWidth = 0.8;
    for (let k = 1; k < 4; k++) { const y = 16 + k * WH / 4; g.beginPath(); g.moveTo(0, y); g.lineTo(32, y + 16); g.lineTo(64, y); g.stroke(); }
    for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) { const off = (k % 2) * 5; const x = 5 + j * 10 + off; const y0 = 16 + k * WH / 4 + x / 2; g.beginPath(); g.moveTo(x, y0 + 16 - 16 + 0); g.lineTo(x, y0 + WH / 4); g.stroke(); const x2 = 64 - x; g.beginPath(); g.moveTo(x2, y0); g.lineTo(x2, y0 + WH / 4); g.stroke(); }
  }
  if (style === 'hedge') { for (let i = 0; i < 40; i++) { const x = Math.random() * 64, y = Math.random() * (WH + 20) + 2; ball(g, x, y, rand(3, 6), rand(2.5, 4.5), Math.random() < 0.5 ? pal.trim : pal.wall, 0.3, -0.5); } }
  if (style === 'rock') { for (let i = 0; i < 9; i++) { const x = rand(4, 60), y = rand(20, WH + 22); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rand(-6, 6), y + rand(3, 9)); g.lineTo(x + rand(-4, 4), y + rand(9, 14)); g.stroke(); } }
  if (style === 'ice') { g.globalAlpha = 0.5; for (let i = 0; i < 6; i++) { line(g, rand(2, 62), rand(18, 40), rand(2, 62), rand(40, WH + 26), '#ffffff', 0.8); } g.globalAlpha = 1; }
  if (style === 'obsidian') { g.globalAlpha = 0.8; for (let i = 0; i < 4; i++) { const x = rand(6, 58); curve(g, [x, 30 + rand(0, 10), x + rand(-6, 6), 40, x + rand(-3, 3), WH + 20], '#ff5a1a', 1); } g.globalAlpha = 1; }
  // trim band on top edge
  g.strokeStyle = pal.trim; g.lineWidth = style === 'marble' ? 2.2 : 1.2; g.globalAlpha = style === 'marble' ? 0.95 : 0.5;
  g.beginPath(); g.moveTo(0, 16 + top + 3); g.lineTo(32, 32 + top + 3); g.lineTo(64, 16 + top + 3); g.stroke(); g.globalAlpha = 1;
  // edge highlights
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 16 + top); g.lineTo(32, top); g.lineTo(64, 16 + top); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(32, 32 + top); g.lineTo(32, WH + 32 + top); g.stroke();
  g.restore();
  return finishSpr(sp, { outline: 0, grit: 0.12, dark: 0.2 });
}
function wallStyle(r, cave, cold) { const id = REALMS[r].id; if (cave) return id === 'naraka' ? (cold ? 'ice' : 'obsidian') : 'rock'; return { deva: 'marble', human: 'brick', asura: 'rock', animal: 'hedge', preta: 'brick', naraka: 'obsidian' }[id]; }

/* ---------- props (anchored at tile centre) ---------- */
function propSpr(kind, pal, seed) {
  const rnd = mulberry(seed * 7919 + hashStr(kind)); const R2 = (a, b) => a + rnd() * (b - a);
  let sp;
  const tree = (h, trunk, leaves, style) => {
    sp = newSpr(96, h + 20, 48, h + 12); const g = sp.g; const bx = 48, by = h + 12;
    ellipse(g, bx, by, 18, 7, 'rgba(0,0,0,.35)');
    if (style === 'banyan') { for (let i = 0; i < 7; i++) { const x = bx + R2(-26, 26); line(g, x, by - h * 0.55, x + R2(-3, 3), by, shade(trunk, -0.2), 1.6); } }
    limb(g, bx, by, bx + R2(-4, 4), by - h * 0.55, style === 'banyan' ? 12 : 8, trunk);
    for (let i = 0; i < 3; i++) limb(g, bx, by - h * 0.45, bx + R2(-22, 22), by - h * R2(0.6, 0.8), 3.5, trunk);
    if (style === 'dead') { for (let i = 0; i < 7; i++) { const a = R2(-2.6, -0.5); const sx = bx + R2(-3, 3), sy = by - h * R2(0.4, 0.62); const l = R2(14, 26); line(g, sx, sy, sx + Math.cos(a) * l, sy + Math.sin(a) * l, trunk, R2(1.2, 2.4)); line(g, sx + Math.cos(a) * l, sy + Math.sin(a) * l, sx + Math.cos(a) * l + R2(-6, 6), sy + Math.sin(a) * l - R2(3, 8), trunk, 1); } return; }
    if (style === 'sword') { for (let i = 0; i < 16; i++) { const a = R2(-3, 0); const sx = bx + R2(-16, 16), sy = by - h * R2(0.5, 0.95); g.save(); g.translate(sx, sy); g.rotate(a); g.fillStyle = lgrad(g, 0, -2, 0, 2, [[0, '#f0f0ff'], [1, '#6a6a7a']]); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(7, -3, 14, 0); g.quadraticCurveTo(7, 3, 0, 0); g.fill(); g.restore(); } return; }
    if (style === 'bamboo') { return; }
    const blobs = style === 'banyan' ? 14 : 10; const cw = style === 'banyan' ? 40 : 28;
    for (let i = 0; i < blobs; i++) { const x = bx + R2(-cw, cw), y = by - h * R2(0.62, 1.0); ball(g, x, y, R2(10, 17), R2(8, 13), mix(leaves[0], leaves[1], rnd()), 0.35, -0.55); }
    if (leaves[2]) for (let i = 0; i < 26; i++) ball(g, bx + R2(-cw, cw), by - h * R2(0.62, 1.0), 2, 2, leaves[2], 0.5, -0.2);
  };
  const rock = (w, h, col, style) => {
    sp = newSpr(w + 16, h + 18, (w + 16) / 2, h + 10); const g = sp.g; const bx = (w + 16) / 2, by = h + 10;
    ellipse(g, bx, by, w * 0.55, w * 0.22, 'rgba(0,0,0,.35)');
    const n = 7; const pts = []; for (let i = 0; i < n; i++) { const a = Math.PI + i / (n - 1) * Math.PI; const rr = R2(0.75, 1); pts.push(bx + Math.cos(a) * w * 0.5 * rr, by + Math.sin(a) * h * rr * (style === 'spire' ? 1 : 0.9)); }
    pts.push(bx + w * 0.5, by, bx - w * 0.5, by);
    if (style === 'spire') { const pts2 = [bx - w * 0.4, by, bx - w * 0.15, by - h * 0.6, bx - w * 0.05, by - h, bx + w * 0.12, by - h * 0.5, bx + w * 0.4, by]; poly(g, pts2, lgrad(g, bx - w / 2, 0, bx + w / 2, 0, [[0, shade(col, 0.2)], [1, shade(col, -0.5)]])); }
    else poly(g, pts, lgrad(g, bx - w / 2, by - h, bx + w / 2, by, [[0, shade(col, 0.25)], [0.5, col], [1, shade(col, -0.5)]]));
    if (style === 'crystal' || style === 'ice') { for (let i = 0; i < 4; i++) { const x = bx + R2(-w * 0.35, w * 0.35); const hh = R2(h * 0.6, h * 1.2); poly(g, [x - 4, by - 2, x, by - hh, x + 4, by - 2], lgrad(g, x - 4, 0, x + 4, 0, [[0, shade(col, 0.5)], [1, shade(col, -0.2)]])); } }
    if (style === 'moss') for (let i = 0; i < 12; i++) ball(g, bx + R2(-w * 0.4, w * 0.4), by - R2(h * 0.4, h * 0.9), R2(2, 4), R2(1.5, 3), '#5a8a3a', 0.3, -0.3);
    if (style === 'obsidian') { g.globalAlpha = 0.8; curve(g, [bx - 5, by - h * 0.8, bx, by - h * 0.5, bx + 3, by - 4], '#ff6a2a', 1.2); g.globalAlpha = 1; }
  };
  const P = pal;
  switch (kind) {
    case 'pillar': { sp = newSpr(40, 100, 20, 92); const g = sp.g; ellipse(g, 20, 92, 14, 6, 'rgba(0,0,0,.3)'); poly(g, [8, 90, 32, 90, 30, 84, 10, 84], P.trim); g.fillStyle = lgrad(g, 10, 0, 30, 0, [[0, '#fffaf0'], [0.5, '#e8dcc0'], [1, '#a8987a']]); g.fillRect(11, 16, 18, 70); for (let i = 0; i < 4; i++) line(g, 14 + i * 4, 18, 14 + i * 4, 84, 'rgba(120,100,60,.25)', 0.8); poly(g, [6, 18, 34, 18, 30, 10, 10, 10], P.trim); ball(g, 20, 8, 5, 4, '#ffe890'); break; }
    case 'bliss_tree': tree(R2(60, 76), '#8a6a5a', ['#ffc0d8', '#ff8ab8', '#fff0f6'], 'round'); break;
    case 'sal_tree': tree(R2(62, 80), '#5a4030', ['#4a6a2a', '#7a8a3a', null], 'round'); break;
    case 'banyan': tree(R2(66, 84), '#6a5438', ['#2a5a2a', '#4a7a2a', '#8ab04a'], 'banyan'); break;
    case 'dead_tree': tree(R2(56, 72), P === REALMS[5].pal ? '#1a1010' : '#4a4034', [], 'dead'); break;
    case 'swordtree': tree(R2(62, 78), '#2a2224', [], 'sword'); break;
    case 'bamboo': { sp = newSpr(48, 110, 24, 102); const g = sp.g; ellipse(g, 24, 102, 14, 5, 'rgba(0,0,0,.3)'); for (let i = 0; i < 5; i++) { const x = 12 + i * 6 + R2(-2, 2); const h = R2(70, 98); line(g, x, 102, x + R2(-4, 4), 102 - h, '#6a9a3a', 3); for (let k = 1; k < 6; k++) line(g, x - 2, 102 - k * h / 6, x + 2, 102 - k * h / 6, '#3a5a1a', 1); for (let k = 0; k < 3; k++) { const y = 102 - h * R2(0.5, 1); ball(g, x + R2(-8, 8), y, 6, 2.5, '#7aba4a'); } } break; }
    case 'fern': { sp = newSpr(56, 40, 28, 34); const g = sp.g; ellipse(g, 28, 34, 18, 6, 'rgba(0,0,0,.3)'); for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + R2(-1.3, 1.3); curve(g, [28, 34, 28 + Math.cos(a) * 12, 34 + Math.sin(a) * 18, 28 + Math.cos(a) * 24, 34 + Math.sin(a) * 22], mix('#3a7a2a', '#8ac04a', rnd()), 4); } break; }
    case 'stupa_w': case 'stupa_s': { const col = kind === 'stupa_w' ? '#f4efe4' : '#c8b898'; sp = newSpr(64, 110, 32, 100); const g = sp.g; ellipse(g, 32, 100, 28, 10, 'rgba(0,0,0,.3)'); poly(g, [6, 100, 58, 100, 54, 88, 10, 88], shade(col, -0.2)); ball(g, 32, 72, 22, 20, col, 0.25, -0.4); g.fillStyle = shade(col, -0.1); g.fillRect(24, 44, 16, 9); for (let i = 0; i < 6; i++) ellipse(g, 32, 40 - i * 5, 6 - i * 0.7, 2.2, i % 2 ? P.trim : shade(P.trim, -0.2)); ball(g, 32, 8, 3, 3, '#ffe890'); ellipse(g, 32, 70, 3, 4, '#3a3a3a'); break; }
    case 'lotus_pool': { sp = newSpr(64, 36, 32, 18); const g = sp.g; ellipse(g, 32, 18, 28, 13, '#5a7ab8'); ellipse(g, 32, 18, 24, 10, lgrad(g, 0, 8, 0, 28, [[0, '#8ab0e8'], [1, '#3a5a98']])); for (let i = 0; i < 4; i++) { const x = R2(16, 48), y = R2(12, 24); ellipse(g, x, y, 5, 2.4, '#4a8a4a'); ball(g, x, y - 2, 2.2, 2, '#ffb0d0'); } break; }
    case 'cloud': { sp = newSpr(80, 40, 40, 26); const g = sp.g; for (let i = 0; i < 7; i++) ball(g, 40 + R2(-24, 24), 24 + R2(-8, 4), R2(10, 16), R2(7, 11), '#ffffff', 0.1, -0.12); break; }
    case 'hut': { sp = newSpr(80, 80, 40, 66); const g = sp.g; ellipse(g, 40, 66, 34, 12, 'rgba(0,0,0,.35)'); poly(g, [12, 64, 40, 74, 40, 42, 12, 34], '#7a6044'); poly(g, [40, 74, 68, 64, 68, 34, 40, 42], '#5a4430'); poly(g, [6, 36, 40, 44, 40, 10], '#b89a5a'); poly(g, [40, 44, 74, 36, 40, 10], '#8a7040'); g.fillStyle = '#1a120a'; g.fillRect(48, 50, 10, 20); for (let i = 0; i < 10; i++) line(g, 8 + i * 3.2, 36 + i * 0.5, 40, 12, 'rgba(90,60,20,.4)', 0.6); break; }
    case 'boulder': rock(R2(26, 36), R2(18, 26), '#7a7064', 'round'); break;
    case 'mossrock': rock(R2(26, 36), R2(18, 26), '#4a5a44', 'moss'); break;
    case 'obsidian': rock(R2(24, 34), R2(22, 30), '#1e1818', 'obsidian'); break;
    case 'spire': rock(R2(22, 30), R2(50, 70), '#6a3024', 'spire'); break;
    case 'crystal': rock(R2(22, 30), R2(22, 30), '#c8a0ff', 'crystal'); break;
    case 'icespike': rock(R2(22, 30), R2(26, 36), '#a8d8ff', 'ice'); break;
    case 'banner': { sp = newSpr(40, 100, 14, 94); const g = sp.g; ellipse(g, 14, 94, 10, 4, 'rgba(0,0,0,.3)'); line(g, 14, 94, 14, 8, '#3a2a1a', 3); poly(g, [15, 12, 36, 16, 32, 30, 36, 44, 15, 40], '#8a1a12'); ball(g, 25, 27, 4, 4, '#d8a030'); ball(g, 14, 7, 2.4, 2.4, '#d8a030'); break; }
    case 'spears': { sp = newSpr(48, 70, 24, 62); const g = sp.g; ellipse(g, 24, 62, 16, 5, 'rgba(0,0,0,.3)'); for (let i = 0; i < 5; i++) { const x = 12 + i * 6; line(g, x, 62, x + R2(-6, 6), 12, '#5a4028', 2); poly(g, [x + 0, 16, x + 3, 6, x + 6, 16], '#b8b8c0'); } line(g, 8, 44, 40, 44, '#3a2a1a', 2.5); break; }
    case 'chariot': { sp = newSpr(64, 48, 32, 40); const g = sp.g; ellipse(g, 32, 40, 26, 8, 'rgba(0,0,0,.3)'); g.strokeStyle = '#6a4a2a'; g.lineWidth = 3; g.beginPath(); g.ellipse(22, 28, 12, 14, 0.3, 0, TAU); g.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; line(g, 22, 28, 22 + Math.cos(a) * 11, 28 + Math.sin(a) * 13, '#6a4a2a', 1.4); } poly(g, [30, 22, 58, 26, 56, 38, 32, 36], '#7a3a22'); break; }
    case 'bonepile': case 'bones': { sp = newSpr(48, 28, 24, 20); const g = sp.g; for (let i = 0; i < 9; i++) { const x = R2(8, 40), y = R2(10, 22), a = R2(0, TAU); line(g, x, y, x + Math.cos(a) * 8, y + Math.sin(a) * 4, '#e8e0c8', 2); } ball(g, 24, 14, 5, 4.5, '#efe6d0'); ellipse(g, 22, 14, 1.3, 1.5, '#1a1410'); ellipse(g, 26, 14, 1.3, 1.5, '#1a1410'); break; }
    case 'mound': { sp = newSpr(44, 64, 22, 58); const g = sp.g; ellipse(g, 22, 58, 16, 5, 'rgba(0,0,0,.3)'); poly(g, [6, 58, 14, 30, 20, 8, 26, 20, 32, 34, 38, 58], lgrad(g, 6, 0, 38, 0, [[0, '#a8804a'], [1, '#5a4024']])); break; }
    case 'eggs': { sp = newSpr(44, 32, 22, 24); const g = sp.g; for (let i = 0; i < 5; i++) ball(g, R2(10, 34), R2(12, 22), 6, 7.5, '#b8d8a0', 0.5, -0.4); break; }
    case 'lantern': { sp = newSpr(32, 90, 16, 84); const g = sp.g; ellipse(g, 16, 84, 9, 4, 'rgba(0,0,0,.3)'); line(g, 16, 84, 16, 30, '#3a3226', 3); line(g, 16, 30, 26, 26, '#3a3226', 2); poly(g, [20, 30, 32, 30, 30, 46, 22, 46], 'rgba(160,255,200,.85)'); poly(g, [20, 30, 32, 30, 26, 26], '#3a3226'); sp.glow = '#8affc0'; sp.glowY = -46; break; }
    case 'urns': { sp = newSpr(52, 40, 26, 32); const g = sp.g; for (let i = 0; i < 3; i++) { const x = 12 + i * 13, h = R2(14, 22); ball(g, x, 32 - h / 2, 6, h / 2, '#8a6a4a', 0.3, -0.5); ellipse(g, x, 32 - h, 3.5, 1.5, '#1a1410'); } break; }
    case 'shrine_ruin': { sp = newSpr(64, 60, 32, 50); const g = sp.g; ellipse(g, 32, 50, 26, 8, 'rgba(0,0,0,.3)'); poly(g, [8, 50, 24, 56, 24, 26, 8, 22], '#6a604e'); poly(g, [24, 56, 40, 50, 40, 20, 24, 26], '#4a4234'); poly(g, [44, 50, 58, 46, 56, 36, 44, 40], '#5a5040'); break; }
    case 'cauldron': { sp = newSpr(56, 50, 28, 42); const g = sp.g; ellipse(g, 28, 42, 22, 7, 'rgba(0,0,0,.4)'); ball(g, 28, 30, 20, 13, '#2a2626', 0.25, -0.5); ellipse(g, 28, 20, 18, 5.5, '#1a1414'); ellipse(g, 28, 20, 15, 4.2, '#ff6a1a'); ellipse(g, 26, 19, 7, 2, '#ffd060'); sp.glow = '#ff6a1a'; sp.glowY = -22; break; }
    case 'brazier': case 'pyre': { sp = newSpr(40, 56, 20, 50); const g = sp.g; ellipse(g, 20, 50, 12, 4, 'rgba(0,0,0,.35)'); if (kind === 'pyre') { for (let i = 0; i < 5; i++) line(g, 6, 44 - i * 3, 34, 40 - i * 3 + R2(-2, 2), '#5a3a1a', 3); } else { line(g, 12, 50, 16, 34, '#2a2222', 2); line(g, 28, 50, 24, 34, '#2a2222', 2); ellipse(g, 20, 32, 11, 4, '#3a3030'); }
      for (let i = 0; i < 5; i++) { const x = 20 + R2(-6, 6); poly(g, [x - 4, 32, x, 32 - R2(10, 20), x + 4, 32], i % 2 ? '#ffb040' : '#ff6a1a'); } sp.glow = '#ff8a2a'; sp.glowY = -26; break; }
    case 'spikes': { sp = newSpr(48, 44, 24, 36); const g = sp.g; ellipse(g, 24, 36, 16, 5, 'rgba(0,0,0,.35)'); for (let i = 0; i < 7; i++) { const x = R2(8, 40), h = R2(14, 30); poly(g, [x - 3, 36, x, 36 - h, x + 3, 36], lgrad(g, x - 3, 0, x + 3, 0, [[0, '#8a8a92'], [1, '#2a2a30']])); } break; }
    case 'anvil': { sp = newSpr(48, 36, 24, 30); const g = sp.g; ellipse(g, 24, 30, 16, 5, 'rgba(0,0,0,.35)'); poly(g, [16, 30, 32, 30, 28, 20, 20, 20], '#3a3434'); poly(g, [8, 20, 40, 20, 38, 14, 12, 14], '#5a5454'); ellipse(g, 24, 17, 5, 1.5, '#ff8a3a'); break; }
    case 'frozen': { sp = newSpr(44, 64, 22, 56); const g = sp.g; ellipse(g, 22, 56, 16, 5, 'rgba(0,0,0,.3)'); g.globalAlpha = 0.9; poly(g, [6, 56, 8, 14, 22, 6, 36, 14, 38, 56], lgrad(g, 6, 0, 38, 0, [[0, 'rgba(210,240,255,.9)'], [1, 'rgba(90,140,200,.8)']])); g.globalAlpha = 0.6; ball(g, 22, 22, 5, 5, '#6a5a5a'); limb(g, 22, 28, 22, 46, 6, '#5a4a4a'); g.globalAlpha = 1; break; }
    default: rock(28, 22, '#6a6a6a', 'round');
  }
  return finishSpr(sp, { grit: 0.12, ow: 0.6, dark: 0.3 });
}

/* ---------- interactive objects ---------- */
function buildObjects() {
  const O = ART.spr;
  // waypoint: dharma wheel on a plinth
  for (const lit of [0, 1]) {
    const sp = newSpr(72, 90, 36, 72); const g = sp.g;
    ellipse(g, 36, 72, 30, 13, 'rgba(0,0,0,.4)'); poly(g, [6, 70, 36, 84, 66, 70, 36, 56], '#5a5040'); poly(g, [6, 70, 36, 84, 36, 88, 6, 74], '#3a3226'); poly(g, [36, 84, 66, 70, 66, 74, 36, 88], '#2a241c');
    const cx = 36, cy = 36, r = 22;
    g.lineWidth = 3.5; g.strokeStyle = lit ? '#ffe08a' : '#8a7040'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 6, 0, TAU); g.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; line(g, cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, cx + Math.cos(a) * r, cy + Math.sin(a) * r, lit ? '#ffe8a0' : '#8a7040', 2); ball(g, cx + Math.cos(a) * (r + 3), cy + Math.sin(a) * (r + 3), 2.4, 2.4, lit ? '#fff0b0' : '#8a7040'); }
    line(g, 36, 58, 36, 66, '#6a5a3a', 4);
    O['wp' + lit] = finishSpr(sp, { grit: 0.1 });
  }
  // gate (torana) & portals
  const torana = (glowc, stone) => {
    const sp = newSpr(96, 120, 48, 104); const g = sp.g;
    ellipse(g, 48, 104, 40, 14, 'rgba(0,0,0,.4)');
    g.fillStyle = rgrad(g, 48, 70, 4, 36, [[0, rgba('#ffffff', 0.9)], [0.3, rgba(glowc, 0.8)], [1, rgba(glowc, 0)]]); ellipse(g, 48, 70, 24, 36, g.fillStyle);
    for (const x of [18, 78]) { g.fillStyle = lgrad(g, x - 6, 0, x + 6, 0, [[0, shade(stone, 0.2)], [1, shade(stone, -0.4)]]); g.fillRect(x - 5, 24, 10, 80); }
    for (let k = 0; k < 3; k++) { const y = 18 + k * 11; poly(g, [6, y, 90, y, 88, y + 6, 8, y + 6], k === 1 ? shade(stone, -0.15) : stone); }
    for (let i = 0; i < 3; i++) ball(g, 30 + i * 18, 12, 3, 3, shade(stone, 0.3));
    return finishSpr(sp, { grit: 0.1 });
  };
  O.gate = torana('#8ab8ff', '#8a7a60');
  O.gateBoss = torana('#ff5a3a', '#5a3a2a');
  O.gateRealm = torana('#ffe08a', '#c8b080');
  { const sp = newSpr(96, 80, 48, 64); const g = sp.g; // cave mouth
    poly(g, [4, 64, 12, 30, 30, 10, 60, 6, 84, 20, 92, 64], lgrad(g, 0, 0, 96, 0, [[0, '#6a6054'], [1, '#2a241e']]));
    poly(g, [24, 64, 30, 34, 48, 22, 66, 34, 72, 64], '#050403'); g.fillStyle = rgrad(g, 48, 56, 2, 26, [[0, 'rgba(255,160,80,.35)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(20, 20, 56, 44);
    O.cave = finishSpr(sp, { grit: 0.15 }); }
  { const sp = newSpr(64, 64, 32, 56); const g = sp.g; // stairs up (cave exit)
    for (let i = 0; i < 5; i++) poly(g, [10 + i * 3, 56 - i * 7, 54 - i * 3, 56 - i * 7, 50 - i * 3, 50 - i * 7, 14 + i * 3, 50 - i * 7], shade('#8a7a60', -i * 0.08));
    g.fillStyle = rgrad(g, 32, 16, 2, 22, [[0, 'rgba(255,240,200,.6)'], [1, 'rgba(255,240,200,0)']]); g.fillRect(8, 0, 48, 40);
    O.stairs = finishSpr(sp, { grit: 0.1 }); }
  // chest
  for (const open of [0, 1]) {
    const sp = newSpr(44, 40, 22, 32); const g = sp.g; ellipse(g, 22, 32, 18, 6, 'rgba(0,0,0,.4)');
    poly(g, [4, 20, 22, 28, 22, 36, 4, 28], '#6a3a1a'); poly(g, [22, 28, 40, 20, 40, 28, 22, 36], '#4a2810');
    if (!open) { poly(g, [4, 20, 22, 28, 40, 20, 22, 12], '#8a4a22'); poly(g, [4, 20, 4, 14, 22, 6, 40, 14, 40, 20, 22, 12], '#9a5a2a'); line(g, 22, 6, 22, 28, '#d8a030', 2); ball(g, 22, 22, 2.4, 2.4, '#f0c040'); }
    else { poly(g, [4, 20, 22, 28, 40, 20, 22, 12], '#1a0e06'); poly(g, [4, 20, 22, 12, 22, 0, 4, 8], '#8a4a22'); g.fillStyle = rgrad(g, 22, 20, 1, 14, [[0, 'rgba(255,220,120,.9)'], [1, 'rgba(255,200,80,0)']]); g.fillRect(8, 8, 28, 20); }
    line(g, 4, 24, 22, 32, '#d8a030', 1.2); line(g, 22, 32, 40, 24, '#d8a030', 1.2);
    O['chest' + open] = finishSpr(sp, { grit: 0.12 });
  }
  // shrine (small stupa with glowing jewel) - tinted at draw time
  { const sp = newSpr(40, 64, 20, 56); const g = sp.g; ellipse(g, 20, 56, 16, 6, 'rgba(0,0,0,.35)'); poly(g, [6, 56, 34, 56, 32, 48, 8, 48], '#8a8070'); ball(g, 20, 40, 12, 10, '#d8d0c0', 0.3, -0.45); g.fillStyle = '#a89878'; g.fillRect(15, 24, 10, 6); for (let i = 0; i < 4; i++) ellipse(g, 20, 22 - i * 4, 4 - i * 0.6, 1.5, '#c8a050'); O.shrine = finishSpr(sp, { grit: 0.1 }); }
  // stash (lacquer cabinet)
  { const sp = newSpr(52, 56, 26, 46); const g = sp.g; ellipse(g, 26, 46, 22, 7, 'rgba(0,0,0,.4)'); poly(g, [6, 22, 26, 32, 26, 50, 6, 40], '#6a1a12'); poly(g, [26, 32, 46, 22, 46, 40, 26, 50], '#4a100a'); poly(g, [6, 22, 26, 12, 46, 22, 26, 32], '#8a2a1a'); line(g, 16, 30, 16, 42, '#d8a030', 1.5); line(g, 36, 30, 36, 42, '#d8a030', 1.5); ball(g, 26, 22, 3, 2, '#e8b040'); O.stash = finishSpr(sp, { grit: 0.1 }); }
  // merit orb (lotus petal glow), gold, potion bottles
  { const sp = newSpr(16, 16, 8, 8); const g = sp.g; g.fillStyle = rgrad(g, 8, 8, 0, 8, [[0, '#fff'], [0.3, '#ffd8e8'], [0.6, 'rgba(255,140,190,.6)'], [1, 'rgba(255,120,180,0)']]); g.fillRect(0, 0, 16, 16); O.merit = sp; }
  { const sp = newSpr(16, 16, 8, 8); const g = sp.g; g.fillStyle = rgrad(g, 8, 8, 0, 8, [[0, '#fff'], [0.3, '#fff0a0'], [0.6, 'rgba(255,200,80,.6)'], [1, 'rgba(255,180,60,0)']]); g.fillRect(0, 0, 16, 16); O.merit2 = sp; }
  { const sp = newSpr(20, 14, 10, 9); const g = sp.g; for (let i = 0; i < 5; i++) { const x = 5 + i * 2.5 + Math.random() * 2, y = 9 - (i % 2) * 2; ellipse(g, x, y, 3.6, 1.8, '#8a6010'); ellipse(g, x, y - 0.6, 3.2, 1.4, '#f0c040'); } O.gold = finishSpr(sp, { outline: 0, grit: 0 }); }
}

/* ---------- icons: skills ---------- */
function skillIconCanvas(s, size = 64) {
  const key = s.id + size; if (ART.iconCv[key]) return ART.iconCv[key];
  const c = mkCanvas(size, size); const g = c.getContext('2d'); const k = size / 64; g.scale(k, k);
  const [shape, col] = s.icon;
  g.fillStyle = rgrad(g, 32, 30, 2, 44, [[0, shade(col, -0.35)], [0.6, shade(col, -0.72)], [1, '#070504']]); g.fillRect(0, 0, 64, 64);
  g.save(); g.shadowColor = col; g.shadowBlur = 10;
  drawSymbol(g, shape, col);
  g.restore();
  // bevel frame
  g.strokeStyle = '#1a120a'; g.lineWidth = 4; g.strokeRect(2, 2, 60, 60); g.strokeStyle = '#8a7050'; g.lineWidth = 1.5; g.strokeRect(3.5, 3.5, 57, 57);
  g.globalAlpha = 0.18; g.fillStyle = ART.gritPat || '#000'; g.fillRect(0, 0, 64, 64);
  ART.iconCv[key] = c; return c;
}
function drawSymbol(g, shape, col) {
  const L = shade(col, 0.55), W = '#fffaf0';
  const star = (x, y, r, n, inner) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU - Math.PI / 2; const rr = i % 2 ? r * inner : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); };
  switch (shape) {
    case 'vajra': ball(g, 32, 32, 5, 5, L); for (const d of [-1, 1]) { g.strokeStyle = L; g.lineWidth = 3; for (const a of [-0.35, 0, 0.35]) { g.beginPath(); g.moveTo(32, 32 + d * 6); g.quadraticCurveTo(32 + Math.sin(a) * 26, 32 + d * 14, 32, 32 + d * 24); g.stroke(); } } break;
    case 'orb': ball(g, 32, 32, 13, 13, L, 0.6, -0.2); break;
    case 'burst': star(32, 32, 24, 10, 0.45); g.fillStyle = L; g.fill(); ball(g, 32, 32, 7, 7, W); break;
    case 'chain': g.strokeStyle = L; g.lineWidth = 3; g.beginPath(); g.moveTo(10, 20); g.lineTo(26, 36); g.lineTo(22, 26); g.lineTo(40, 44); g.lineTo(36, 32); g.lineTo(54, 48); g.stroke(); for (const [x, y] of [[10, 20], [54, 48], [32, 30]]) ball(g, x, y, 4, 4, W); break;
    case 'bolt': poly(g, [36, 6, 18, 36, 30, 36, 24, 58, 46, 26, 34, 26, 42, 6], L); break;
    case 'shield': poly(g, [32, 8, 52, 16, 50, 36, 32, 56, 14, 36, 12, 16], L); poly(g, [32, 14, 46, 20, 44, 34, 32, 48, 20, 34, 18, 20], shade(col, -0.3)); break;
    case 'eye': ellipse(g, 32, 32, 22, 11, L); ball(g, 32, 32, 8, 8, shade(col, -0.5)); ellipse(g, 32, 32, 3, 3, '#000'); break;
    case 'wheel': case 'pwheel': g.strokeStyle = L; g.lineWidth = 3.5; g.beginPath(); g.arc(32, 32, 18, 0, TAU); g.stroke(); g.beginPath(); g.arc(32, 32, 5, 0, TAU); g.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; line(g, 32 + Math.cos(a) * 5, 32 + Math.sin(a) * 5, 32 + Math.cos(a) * 18, 32 + Math.sin(a) * 18, L, 2); } if (shape === 'pwheel') line(g, 32, 50, 32, 60, L, 4); break;
    case 'mountain': poly(g, [6, 52, 26, 16, 34, 28, 42, 18, 58, 52], L); poly(g, [26, 16, 22, 26, 30, 24], W); break;
    case 'diamond': poly(g, [32, 8, 52, 26, 32, 56, 12, 26], L); poly(g, [32, 8, 40, 26, 32, 56, 24, 26], W); break;
    case 'fist': ball(g, 32, 34, 14, 12, L); for (let i = 0; i < 4; i++) ellipse(g, 22 + i * 7, 24, 3.6, 5, shade(col, 0.3)); poly(g, [20, 44, 44, 44, 40, 58, 24, 58], L); break;
    case 'deity': ball(g, 32, 22, 9, 10, L); poly(g, [18, 58, 22, 34, 42, 34, 46, 58], L); for (const s of [-1, 1]) { line(g, 32 + s * 10, 38, 32 + s * 24, 26, L, 3); line(g, 32 + s * 10, 42, 32 + s * 24, 50, L, 3); } poly(g, [24, 14, 28, 6, 32, 12, 36, 6, 40, 14], W); break;
    case 'roar': for (let i = 0; i < 3; i++) { g.strokeStyle = L; g.lineWidth = 3; g.beginPath(); g.arc(20, 32, 10 + i * 10, -0.7, 0.7); g.stroke(); } ball(g, 16, 32, 6, 6, W); break;
    case 'fan': for (let i = -2; i <= 2; i++) { const a = -Math.PI / 2 + i * 0.35; line(g, 32, 54, 32 + Math.cos(a) * 42, 54 + Math.sin(a) * 42, L, 3); } break;
    case 'beam': g.fillStyle = lgrad(g, 0, 26, 0, 38, [[0, 'rgba(0,0,0,0)'], [0.5, L], [1, 'rgba(0,0,0,0)']]); g.fillRect(8, 22, 50, 20); line(g, 8, 32, 58, 32, W, 3); ball(g, 10, 32, 6, 6, W); break;
    case 'sutra': poly(g, [12, 20, 52, 20, 52, 46, 12, 46], L); for (let i = 0; i < 4; i++) line(g, 17, 26 + i * 5, 47, 26 + i * 5, shade(col, -0.5), 1.4); ellipse(g, 12, 33, 3, 13, shade(col, 0.2)); ellipse(g, 52, 33, 3, 13, shade(col, 0.2)); break;
    case 'sword': poly(g, [30, 8, 34, 8, 36, 44, 28, 44], W); poly(g, [22, 44, 42, 44, 42, 48, 22, 48], L); line(g, 32, 48, 32, 58, L, 4); for (let i = 0; i < 5; i++) poly(g, [34, 10 + i * 7, 44, 6 + i * 7, 36, 16 + i * 7], '#ff9a3a'); break;
    case 'void': g.fillStyle = rgrad(g, 32, 32, 2, 22, [[0, '#000'], [0.6, shade(col, -0.2)], [1, L]]); ellipse(g, 32, 32, 20, 20, g.fillStyle); g.strokeStyle = W; g.lineWidth = 1.5; g.beginPath(); g.arc(32, 32, 20, 0, TAU); g.stroke(); break;
    case 'snow': for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; line(g, 32, 32, 32 + Math.cos(a) * 22, 32 + Math.sin(a) * 22, L, 3); line(g, 32 + Math.cos(a) * 14, 32 + Math.sin(a) * 14, 32 + Math.cos(a + 0.5) * 19, 32 + Math.sin(a + 0.5) * 19, L, 2); } break;
    case 'spiral': g.strokeStyle = L; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 60; i++) { const a = i * 0.28, r = 2 + i * 0.36; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.stroke(); break;
    case 'flame': g.beginPath(); g.moveTo(32, 6); g.quadraticCurveTo(52, 28, 44, 46); g.quadraticCurveTo(38, 58, 32, 58); g.quadraticCurveTo(20, 58, 18, 44); g.quadraticCurveTo(16, 30, 26, 22); g.quadraticCurveTo(26, 34, 32, 34); g.quadraticCurveTo(28, 20, 32, 6); g.fillStyle = L; g.fill(); ellipse(g, 32, 46, 6, 9, W); break;
    case 'mandala': g.strokeStyle = L; g.lineWidth = 2; for (const r of [8, 16, 23]) { g.beginPath(); g.arc(32, 32, r, 0, TAU); g.stroke(); } g.strokeRect(20, 20, 24, 24); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; ball(g, 32 + Math.cos(a) * 23, 32 + Math.sin(a) * 23, 3, 3, W); } break;
    case 'meteor': ball(g, 38, 38, 11, 11, L); for (let i = 0; i < 3; i++) line(g, 30 - i * 4, 30 - i * 2, 8 + i * 3, 8 + i * 5, shade(col, 0.2), 4 - i); break;
    case 'lion': ball(g, 32, 30, 18, 16, '#cfefff'); ball(g, 32, 32, 11, 10, W); ellipse(g, 27, 30, 2, 2, '#1a3a5a'); ellipse(g, 37, 30, 2, 2, '#1a3a5a'); ellipse(g, 32, 36, 3, 2, '#e08a8a'); break;
    case 'bird': g.beginPath(); g.moveTo(32, 34); g.quadraticCurveTo(14, 12, 4, 20); g.quadraticCurveTo(18, 26, 32, 42); g.quadraticCurveTo(46, 26, 60, 20); g.quadraticCurveTo(50, 12, 32, 34); g.fillStyle = L; g.fill(); ball(g, 32, 28, 5, 6, W); poly(g, [32, 30, 36, 36, 32, 34], '#e0a030'); break;
    case 'snake': g.strokeStyle = L; g.lineWidth = 6; g.beginPath(); g.moveTo(12, 52); g.bezierCurveTo(50, 50, 14, 30, 40, 18); g.stroke(); ball(g, 42, 16, 8, 6, L); ellipse(g, 44, 14, 1.4, 1.4, '#000'); break;
    case 'hand': case 'hands': { const dh = (x, y, s) => { ellipse(g, x, y + 6 * s, 9 * s, 10 * s, L); for (let i = 0; i < 4; i++) { g.fillStyle = L; g.fillRect(x - 8 * s + i * 4.4 * s, y - 12 * s, 3.4 * s, 14 * s); } g.fillRect(x + 7 * s, y + 2 * s, 7 * s, 3.5 * s); ellipse(g, x, y + 6 * s, 3 * s, 3 * s, W); }; if (shape === 'hand') dh(32, 32, 1.2); else { dh(20, 34, 0.8); dh(44, 34, 0.8); dh(32, 22, 0.7); } break; }
    case 'lotus': for (let i = -2; i <= 2; i++) { g.save(); g.translate(32, 46); g.rotate(i * 0.42); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(10, -16, 0, -30); g.quadraticCurveTo(-10, -16, 0, 0); g.fillStyle = i === 0 ? W : L; g.fill(); g.restore(); } ellipse(g, 32, 48, 18, 4, shade(col, -0.2)); break;
    case 'drop': g.beginPath(); g.moveTo(32, 8); g.quadraticCurveTo(50, 34, 44, 46); g.quadraticCurveTo(32, 62, 20, 46); g.quadraticCurveTo(14, 34, 32, 8); g.fillStyle = L; g.fill(); ellipse(g, 27, 40, 3, 6, W); break;
    case 'scale': line(g, 32, 12, 32, 52, L, 3); line(g, 12, 20, 52, 20, L, 3); ellipse(g, 16, 36, 8, 3, L); ellipse(g, 48, 30, 8, 3, L); line(g, 12, 20, 16, 36, L, 1.2); line(g, 52, 20, 48, 30, L, 1.2); line(g, 22, 52, 42, 52, L, 4); break;
    case 'heart': g.beginPath(); g.moveTo(32, 52); g.bezierCurveTo(4, 32, 16, 8, 32, 22); g.bezierCurveTo(48, 8, 60, 32, 32, 52); g.fillStyle = L; g.fill(); break;
    case 'arrow': line(g, 12, 52, 50, 14, L, 3); poly(g, [54, 10, 42, 14, 50, 22], W); line(g, 12, 52, 18, 42, L, 2); line(g, 12, 52, 22, 48, L, 2); break;
    case 'rain': for (let i = 0; i < 6; i++) { const x = 12 + i * 8, y = 10 + (i % 2) * 10; line(g, x, y, x - 6, y + 26, L, 2); poly(g, [x - 7, y + 30, x - 9, y + 24, x - 4, y + 25], W); } break;
    case 'five': { const cs = ['#ffffff', '#4a7aff', '#ffe066', '#ff4a2a', '#4fd35f']; cs.forEach((cc, i) => { const a = -Math.PI / 2 + i / 5 * TAU; ball(g, 32 + Math.cos(a) * 16, 32 + Math.sin(a) * 16, 7, 7, cc); }); ball(g, 32, 32, 5, 5, W); break; }
    case 'feet': ellipse(g, 24, 30, 7, 12, L); ellipse(g, 40, 38, 7, 12, L); for (let i = 0; i < 3; i++) { ball(g, 19 + i * 4, 16, 2, 2, L); ball(g, 35 + i * 4, 24, 2, 2, L); } break;
    case 'leaf': g.beginPath(); g.moveTo(10, 54); g.quadraticCurveTo(12, 12, 54, 10); g.quadraticCurveTo(52, 50, 10, 54); g.fillStyle = L; g.fill(); line(g, 12, 52, 50, 14, shade(col, -0.4), 1.5); break;
    case 'bone': g.save(); g.translate(32, 32); g.rotate(-0.7); line(g, -18, 0, 18, 0, L, 6); for (const x of [-20, 20]) { ball(g, x, -4, 5, 5, L); ball(g, x, 4, 5, 5, L); } g.restore(); break;
    case 'skull': ball(g, 32, 28, 16, 16, L, 0.35, -0.3); g.fillStyle = L; g.fillRect(24, 38, 16, 9); ellipse(g, 26, 28, 4.5, 5.5, '#140a1a'); ellipse(g, 38, 28, 4.5, 5.5, '#140a1a'); poly(g, [32, 33, 29, 38, 35, 38], '#140a1a'); for (let i = 0; i < 4; i++) line(g, 26 + i * 4, 40, 26 + i * 4, 46, '#140a1a', 1); break;
    default: ball(g, 32, 32, 14, 14, L);
  }
}

/* ---------- icons: items ---------- */
function itemIconCanvas(it, size = 64) {
  const kind = it.gem ? 'gem_' + it.gem + it.grade : it.qitem ? 'q_' + it.qitem : it.pot ? 'pot_' + it.pot : BASES[it.base].kind + (BASES[it.base].tier || 0);
  const key = kind + (it.rar === 3 ? 'u' : '') + size; if (ART.iconCv[key]) return ART.iconCv[key];
  const c = mkCanvas(size, size); const g = c.getContext('2d'); g.scale(size / 64, size / 64);
  drawItem(g, it, kind);
  ART.iconCv[key] = c; return c;
}
function drawItem(g, it, kind) {
  const b = it.base ? BASES[it.base] : null; const t = b ? (b.tier || Math.floor((b.q || 1) / 10)) : 0;
  const metal = ['#b08040', '#9a9aa8', '#d8b050', '#c8d0e0', '#ffe080'][Math.min(4, t)];
  const wood = '#6a4424';
  if (it.gem) { const G = GEMS[it.gem]; const s = 8 + it.grade * 4; g.save(); g.translate(32, 32); poly(g, [0, -s - 4, s, -s * 0.2, s * 0.6, s, -s * 0.6, s, -s, -s * 0.2], lgrad(g, -s, -s, s, s, [[0, shade(G.col, 0.6)], [0.5, G.col], [1, shade(G.col, -0.5)]])); poly(g, [0, -s - 4, s * 0.4, -s * 0.2, 0, s * 0.4, -s * 0.4, -s * 0.2], 'rgba(255,255,255,.35)'); g.restore(); return; }
  if (it.pot) { const col = it.pot === 'hp' ? '#d8201a' : it.pot === 'mp' ? '#2a4ad8' : '#a020d0'; g.save(); g.translate(32, 36); ball(g, 0, 6, 13, 13, col, 0.5, -0.4); g.fillStyle = '#c8c0b0'; g.fillRect(-4, -16, 8, 10); ellipse(g, 0, -17, 5.5, 2, '#8a6a40'); ellipse(g, -4, 2, 3, 5, 'rgba(255,255,255,.5)'); g.restore(); return; }
  if (it.qitem) { if (it.qitem === 'urn') { ball(g, 32, 38, 14, 16, '#e0b040'); ellipse(g, 32, 22, 7, 3, '#8a6a20'); ellipse(g, 32, 38, 9, 3, '#fff0a0'); } else { ellipse(g, 32, 30, 16, 20, '#c8c8d8'); ellipse(g, 32, 30, 12, 16, '#2a2a4a'); line(g, 32, 50, 32, 60, '#8a6a30', 5); } return; }
  const k = b.kind;
  g.save();
  switch (k) {
    case 'vajra': g.translate(32, 32); g.rotate(-0.7); ball(g, 0, 0, 5, 5, metal); for (const d of [-1, 1]) { g.strokeStyle = metal; g.lineWidth = 3.2; for (const a of [-0.45, 0, 0.45]) { g.beginPath(); g.moveTo(0, d * 5); g.quadraticCurveTo(Math.sin(a) * 26, d * 14, 0, d * 25); g.stroke(); } } break;
    case 'bow': g.translate(32, 32); g.rotate(-0.75); g.strokeStyle = t >= 2 ? '#2a1a14' : wood; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, -28); g.quadraticCurveTo(-16, -8, -4, 6); g.quadraticCurveTo(-10, 18, 0, 28); g.stroke(); line(g, 0, -28, 0, 28, '#e8e0d0', 1); if (t >= 2) { line(g, -8, -4, -6, 4, '#d8b050', 3); } break;
    case 'sword': g.translate(32, 32); g.rotate(0.78); poly(g, [-2.5, -28, 2.5, -28, 3.5, 10, -3.5, 10], lgrad(g, -3, 0, 3, 0, [[0, '#f0f4ff'], [1, '#7a7a90']])); poly(g, [-11, 10, 11, 10, 9, 14, -9, 14], metal); line(g, 0, 14, 0, 26, '#4a2a1a', 4); ball(g, 0, 27, 3, 3, metal); if (t >= 3) for (let i = 0; i < 4; i++) poly(g, [3, -24 + i * 8, 9, -27 + i * 8, 4, -18 + i * 8], '#ff8a2a'); break;
    case 'staff': g.translate(32, 32); g.rotate(0.6); line(g, 0, -12, 0, 30, wood, 4); g.strokeStyle = metal; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, -20, 8, 11, 0, 0, TAU); g.stroke(); for (let i = 0; i < Math.min(6, 2 + t); i++) { const a = i / 6 * TAU; g.beginPath(); g.arc(Math.cos(a) * 9, -20 + Math.sin(a) * 12, 3, 0, TAU); g.stroke(); } break;
    case 'khatvanga': g.translate(32, 32); g.rotate(0.6); line(g, 0, -10, 0, 30, '#e8dcc0', 3.5); for (let i = 0; i < 3; i++) ball(g, 0, -12 - i * 6, 4 - i * 0.5, 3.4, i === 2 ? '#f0e8d0' : i === 1 ? '#c8a080' : '#a86a4a'); g.strokeStyle = metal; g.lineWidth = 2; g.beginPath(); g.moveTo(-6, -36); g.lineTo(-6, -30); g.quadraticCurveTo(0, -26, 6, -30); g.lineTo(6, -36); g.moveTo(0, -38); g.lineTo(0, -28); g.stroke(); break;
    case 'mala': for (let i = 0; i < 22; i++) { const a = i / 22 * TAU; ball(g, 32 + Math.cos(a) * 18, 30 + Math.sin(a) * 16, 3.4, 3.4, ['#8a5a30', '#b88a50', '#e8d0a0', '#e04030', '#e8f0ff'][t]); } ball(g, 32, 50, 4.5, 4.5, '#d8a030'); line(g, 32, 54, 32, 62, '#b02020', 2); break;
    case 'wheel': line(g, 32, 40, 32, 60, wood, 4); ball(g, 32, 26, 14, 16, metal); for (let i = 0; i < 3; i++) line(g, 20, 20 + i * 6, 44, 20 + i * 6, shade(metal, -0.4), 1.4); ball(g, 44, 16, 3, 3, metal); break;
    case 'bell': poly(g, [20, 44, 24, 24, 32, 18, 40, 24, 44, 44], lgrad(g, 20, 0, 44, 0, [[0, shade(metal, 0.3)], [1, shade(metal, -0.4)]])); ellipse(g, 32, 44, 12, 3, shade(metal, -0.3)); line(g, 32, 18, 32, 6, metal, 3); ball(g, 32, 6, 4, 4, metal); ball(g, 32, 48, 2.5, 2.5, metal); break;
    case 'quiver': g.translate(32, 32); g.rotate(0.5); poly(g, [-8, -16, 8, -16, 6, 26, -6, 26], lgrad(g, -8, 0, 8, 0, [[0, '#8a3a1a'], [1, '#3a1a0a']])); for (let i = 0; i < 4; i++) { line(g, -5 + i * 3.3, -16, -5 + i * 3.3, -26, '#c8b890', 1.4); poly(g, [-7 + i * 3.3, -26, -5 + i * 3.3, -31, -3 + i * 3.3, -26], '#e8e0d0'); } line(g, -8, -4, 6, -4, metal, 2); break;
    case 'bowl': ellipse(g, 32, 34, 22, 8, '#3a2a1a'); g.beginPath(); g.ellipse(32, 34, 22, 18, 0, 0, Math.PI); g.fillStyle = lgrad(g, 10, 0, 54, 0, [[0, '#6a4a2a'], [1, '#2a1a0a']]); g.fill(); ellipse(g, 32, 34, 18, 5.5, '#1a0e06'); break;
    case 'hood': poly(g, [14, 50, 18, 20, 32, 10, 46, 20, 50, 50, 40, 42, 24, 42], '#8a6a4a'); ellipse(g, 32, 32, 9, 11, '#1a120a'); break;
    case 'kasa': poly(g, [6, 40, 32, 14, 58, 40], lgrad(g, 6, 0, 58, 0, [[0, '#e8d090'], [1, '#8a6a30']])); for (let i = 0; i < 6; i++) line(g, 32, 14, 10 + i * 9, 40, 'rgba(90,60,20,.5)', 0.8); ellipse(g, 32, 40, 26, 4, '#7a5a2a'); break;
    case 'helm': ball(g, 32, 32, 18, 17, metal, 0.4, -0.5); poly(g, [14, 34, 50, 34, 50, 40, 14, 40], shade(metal, -0.3)); line(g, 32, 14, 32, 34, shade(metal, 0.3), 3); break;
    case 'crown': poly(g, [12, 46, 12, 26, 20, 34, 26, 18, 32, 30, 38, 18, 44, 34, 52, 26, 52, 46], lgrad(g, 0, 18, 0, 46, [[0, '#ffe890'], [1, '#a87a20']])); for (let i = 0; i < 5; i++) ball(g, 16 + i * 8, 40, 2.4, 2.4, ['#fff', '#4a7aff', '#ffe066', '#ff4a2a', '#4fd35f'][i]); break;
    case 'mask': ball(g, 32, 32, 20, 22, '#3a2a6a', 0.3, -0.5); ellipse(g, 24, 28, 5, 3.5, '#ffe060'); ellipse(g, 40, 28, 5, 3.5, '#ffe060'); ellipse(g, 24, 28, 2, 2, '#000'); ellipse(g, 40, 28, 2, 2, '#000'); poly(g, [20, 42, 44, 42, 40, 50, 24, 50], '#e8e0d0'); poly(g, [14, 14, 22, 6, 24, 16], '#ffe890'); poly(g, [50, 14, 42, 6, 40, 16], '#ffe890'); break;
    case 'robe': case 'kasaya': case 'padded': case 'lamellar': case 'diamond': {
      const col = { robe: '#b8742a', kasaya: '#c8601a', padded: '#7a2a1a', lamellar: '#5a5a62', diamond: '#e8ecff' }[k];
      poly(g, [20, 10, 44, 10, 54, 22, 48, 26, 48, 56, 16, 56, 16, 26, 10, 22], lgrad(g, 10, 0, 54, 0, [[0, shade(col, 0.25)], [1, shade(col, -0.4)]]));
      if (k === 'kasaya') for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.strokeRect(19 + i * 9, 24 + j * 10, 9, 10);
      if (k === 'lamellar') for (let j = 0; j < 7; j++) line(g, 17, 26 + j * 4.5, 47, 26 + j * 4.5, shade(col, 0.4), 1);
      if (k === 'diamond') for (let i = 0; i < 6; i++) poly(g, [24 + (i % 3) * 8, 28 + Math.floor(i / 3) * 12, 28 + (i % 3) * 8, 24 + Math.floor(i / 3) * 12, 32 + (i % 3) * 8, 28 + Math.floor(i / 3) * 12, 28 + (i % 3) * 8, 32 + Math.floor(i / 3) * 12], '#b8d8ff');
      line(g, 28, 10, 36, 28, shade(col, -0.5), 1.5); break; }
    case 'wraps': case 'gloves': case 'gauntlets': case 'mudra': { const col = { wraps: '#c8b898', gloves: '#6a4424', gauntlets: '#8a8a98', mudra: '#d8a040' }[k]; ellipse(g, 30, 36, 13, 15, col); for (let i = 0; i < 4; i++) { g.fillStyle = shade(col, -0.1 * i); g.fillRect(19 + i * 6, 12, 5, 20); } g.fillStyle = col; g.fillRect(40, 30, 10, 6); poly(g, [18, 48, 42, 48, 40, 60, 20, 60], shade(col, -0.3)); if (k === 'mudra') ball(g, 30, 36, 4, 4, '#ff4a2a'); break; }
    case 'rope': case 'belt': case 'silk': case 'plated': { const col = { rope: '#b8a070', belt: '#6a4424', silk: '#c82a3a', plated: '#8a8a98' }[k]; g.fillStyle = lgrad(g, 0, 26, 0, 38, [[0, shade(col, 0.3)], [1, shade(col, -0.4)]]); g.fillRect(6, 26, 52, 12); ball(g, 32, 32, 7, 7, k === 'silk' ? '#e8c040' : metal); if (k === 'silk') { line(g, 30, 36, 24, 58, col, 4); line(g, 34, 36, 40, 58, col, 4); } break; }
    case 'sandals': case 'geta': case 'boots': case 'cloud': { const col = { sandals: '#c8a860', geta: '#8a5a30', boots: '#5a3a1a', cloud: '#e8ecff' }[k]; if (k === 'boots' || k === 'cloud') { poly(g, [20, 10, 36, 10, 36, 40, 52, 44, 52, 54, 16, 54, 18, 40], lgrad(g, 16, 0, 52, 0, [[0, shade(col, 0.3)], [1, shade(col, -0.4)]])); if (k === 'cloud') for (let i = 0; i < 3; i++) ball(g, 22 + i * 12, 54, 6, 3, '#fff'); } else { ellipse(g, 32, 40, 22, 9, col); if (k === 'geta') { g.fillStyle = shade(col, -0.4); g.fillRect(16, 46, 6, 8); g.fillRect(42, 46, 6, 8); } line(g, 22, 38, 32, 30, '#a8201a', 2); line(g, 42, 38, 32, 30, '#a8201a', 2); } break; }
    case 'amulet': line(g, 14, 8, 32, 40, '#c8a050', 1.5); line(g, 50, 8, 32, 40, '#c8a050', 1.5); ball(g, 32, 44, 10, 12, it.rar === 3 ? '#e8c040' : '#a8683a', 0.5, -0.4); ball(g, 32, 44, 4.5, 5, '#e0f0ff'); break;
    case 'ring': g.strokeStyle = lgrad(g, 16, 0, 48, 0, [[0, '#ffe890'], [1, '#8a6a20']]); g.lineWidth = 6; g.beginPath(); g.ellipse(32, 36, 15, 12, 0, 0, TAU); g.stroke(); ball(g, 32, 22, 6, 5, it.rar === 3 ? '#ff4a6a' : '#6ad8a0'); break;
  }
  g.restore();
}
function iconURL(cv) { try { return cv.toDataURL(); } catch (e) { return ''; } }
