/* ================= renderer ================= */
const RENDER = { cv: null, ctx: null, W: 0, H: 0, px: 1, zoom: 1, k: 1, CH: 12, minimapDirty: 1, lastMini: 0, clouds: [] };
const ISO_RX = 45.25, ISO_RY = 22.63;
function resizeCanvas() {
  const R = RENDER; const vv = window.visualViewport; const cw = Math.round(vv && vv.width ? vv.width : innerWidth), ch = Math.round(vv && vv.height ? vv.height : innerHeight); const coarse = matchMedia('(pointer:coarse)').matches; const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
  const cap = OPT.quality === 'low' ? 1.1e6 : coarse ? 1.5e6 : 2.6e6; let px = dpr; if (cw * ch * px * px > cap) px = Math.sqrt(cap / (cw * ch));
  R.px = px; R.W = Math.round(cw * px); R.H = Math.round(ch * px); R.cv.width = R.W; R.cv.height = R.H;
  R.zoom = clamp(Math.sqrt(cw * ch / (900 * 580)), 0.9, 2.3); if (Math.min(cw, ch) < 500) R.zoom = Math.max(R.zoom, 0.85);
  if (ch > cw * 1.15) R.zoom = clamp(cw / 520, 0.74, 1.25);
  R.k = R.zoom * px; R.mobile = matchMedia('(pointer:coarse)').matches || Math.min(cw, ch) < 560;
  R.light = mkCanvas(Math.ceil(R.W / 4), Math.ceil(R.H / 4)); R.lctx = R.light.getContext('2d');
  R.vig = mkCanvas(256, 256); const g = R.vig.getContext('2d'); g.fillStyle = rgrad(g, 128, 128, 60, 182, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.75)']]); g.fillRect(0, 0, 256, 256);
  if (!R.hole) { R.hole = mkCanvas(128, 128); const h = R.hole.getContext('2d'); h.fillStyle = rgrad(h, 64, 64, 0, 64, [[0, 'rgba(0,0,0,1)'], [0.45, 'rgba(0,0,0,0.85)'], [0.75, 'rgba(0,0,0,0.35)'], [1, 'rgba(0,0,0,0)']]); h.fillRect(0, 0, 128, 128); }
  const s = clamp(Math.min(cw / 760, ch / 560) * (ch < 460 ? 0.85 : 1), 0.5, 1.5); document.documentElement.style.setProperty('--s', s.toFixed(3));
  const mm = $('minimap'); if (mm) { mm.width = Math.round(150 * s * dpr); mm.height = Math.round(110 * s * dpr); }
  RENDER.minimapDirty = 1;
}
function w2s(x, y) { const R = RENDER; return [(isoX(x, y) - G.cam.x) * R.k + R.W / 2 + (R.shx || 0), (isoY(x, y) - G.cam.y) * R.k + R.H / 2 + (R.shy || 0)]; }

/* ---------- floor chunks ---------- */
function chunkCanvas(A, cx, cy) {
  const key = cx + ',' + cy; let c = A.chunks.get(key); if (c) return c;
  const CH = RENDER.CH; const x0 = cx * CH, y0 = cy * CH; const FS = OPT.quality === 'low' ? 1 : clamp(RENDER.k * 0.8, 1, RENDER.mobile ? 1.25 : 1.45);
  const ox = (x0 - y0 - CH) * HTW, oy = (x0 + y0) * HTH; const w = CH * 2 * HTW, h = CH * 2 * HTH + 64;
  const cv = mkCanvas(w * FS, h * FS); const g = cv.getContext('2d'); g.scale(FS, FS); g.translate(-ox, -oy);
  const texKey = A.r + A.texMode + A.cave + (A.pal.floor); let tex = ART.tex[texKey]; if (!tex) { tex = ART.tex[texKey] = floorTexture(A.pal, A.texMode); }
  const pat = g.createPattern(tex, 'repeat');
  const pal = A.pal; const W = A.w;
  const dia = (x, y) => { const sx = isoX(x, y), sy = isoY(x, y); g.moveTo(sx, sy); g.lineTo(sx + HTW, sy + HTH); g.lineTo(sx, sy + TH); g.lineTo(sx - HTW, sy + HTH); g.closePath(); };
  // cliffs for void edges
  for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) {
    if (!inb(A, x, y)) continue; const v = A.t[y * W + x]; if (v === T_VOID || v === T_WALL) continue;
    const sx = isoX(x, y), sy = isoY(x, y); const dep = A.edge === 'void' ? 48 : 0; if (!dep) break;
    if (tileAt(A, x + 1, y) === T_VOID) { g.beginPath(); g.moveTo(sx + HTW, sy + HTH); g.lineTo(sx, sy + TH); g.lineTo(sx, sy + TH + dep); g.lineTo(sx + HTW, sy + HTH + dep * 0.7); g.closePath(); g.fillStyle = lgrad(g, 0, sy, 0, sy + TH + dep, [[0, shade(pal.floor, -0.35)], [1, rgba(shade(pal.floor, -0.8), 0)]]); g.fill(); }
    if (tileAt(A, x, y + 1) === T_VOID) { g.beginPath(); g.moveTo(sx - HTW, sy + HTH); g.lineTo(sx, sy + TH); g.lineTo(sx, sy + TH + dep); g.lineTo(sx - HTW, sy + HTH + dep * 0.7); g.closePath(); g.fillStyle = lgrad(g, 0, sy, 0, sy + TH + dep, [[0, shade(pal.floor, -0.55)], [1, rgba(shade(pal.floor, -0.85), 0)]]); g.fill(); }
  }
  g.beginPath(); let any = false;
  for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) { if (!inb(A, x, y)) continue; const v = A.t[y * W + x]; if (v === T_VOID) continue; if (v === T_WALL && A.edge === 'void') continue; dia(x, y); any = true; }
  if (any) { g.save(); g.fillStyle = pat; g.fill(); g.restore(); }
  const N = makeNoise(A.seed + 99);
  const rid = REALMS[A.r].id; const lc = { deva: '#6a8ad8', human: '#3a5a6a', asura: '#5a0806', animal: '#1e3a30', preta: '#2e2c22', naraka: '#ff4a0a' }[rid];
  for (let y = y0 - 1; y < y0 + CH + 1; y++) for (let x = x0 - 1; x < x0 + CH + 1; x++) {
    if (tileAt(A, x, y) !== T_LIQ) continue; const sx = isoX(x + 0.5, y + 0.5), sy = isoY(x + 0.5, y + 0.5);
    g.fillStyle = rgrad(g, sx, sy, 2, 40, [[0, rgba(shade(lc, -0.1), 0.95)], [0.55, rgba(lc, 0.85)], [1, rgba(lc, 0)]]); g.save(); g.translate(sx, sy); g.scale(1, 0.55); g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.fill(); g.restore();
  }
  for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) {
    if (!inb(A, x, y) || A.t[y * W + x] !== T_LIQ) continue; const sx = isoX(x + 0.5, y + 0.5), sy = isoY(x + 0.5, y + 0.5); const dv = A.dec[y * W + x];
    if (rid === 'naraka') { g.fillStyle = rgrad(g, sx, sy, 1, 22, [[0, 'rgba(255,230,120,.8)'], [1, 'rgba(255,120,20,0)']]); g.fillRect(sx - 24, sy - 14, 48, 28); }
    else { g.strokeStyle = rgba(shade(lc, 0.6), 0.3); g.lineWidth = 1; g.beginPath(); g.moveTo(sx - 12 + dv % 7, sy + 2); g.quadraticCurveTo(sx, sy - 2, sx + 12, sy + 2); g.stroke(); }
    if (rid === 'deva' && dv < 70) { ellipse(g, sx + (dv % 13) - 6, sy + 2, 7, 3.5, '#3a8a4a'); ball(g, sx + (dv % 13) - 6, sy, 3.2, 2.8, '#ffb0d0'); }
    if (rid === 'animal' && dv < 60) { for (let k = 0; k < 3; k++) line(g, sx + k * 4 - 4, sy + 4, sx + k * 4 - 5, sy - 10, '#4a7a3a', 1.4); }
  }
  for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) {
    if (!inb(A, x, y)) continue; const i = y * W + x; const v = A.t[i]; if (v === T_VOID) continue;
    const sx = isoX(x, y), sy = isoY(x, y); const dv = A.dec[i];
    const nv = N.fbm(x / 7, y / 7, 2); g.beginPath(); dia(x, y); g.fillStyle = nv > 0.5 ? `rgba(255,240,210,${(nv - 0.5) * 0.18})` : `rgba(0,0,0,${(0.5 - nv) * 0.35})`; g.fill();
    if (A.paved) { g.beginPath(); dia(x, y); g.strokeStyle = rgba(pal.grout, 0.55); g.lineWidth = 1.2; g.stroke(); g.beginPath(); g.moveTo(sx - HTW + 3, sy + HTH); g.lineTo(sx, sy + 2); g.lineTo(sx + HTW - 3, sy + HTH); g.strokeStyle = 'rgba(255,255,255,0.08)'; g.stroke();
      if (dv < 10 && A.r === 0) { g.save(); g.translate(sx, sy + HTH); g.scale(1, 0.5); for (let k = 0; k < 8; k++) { g.rotate(TAU / 8); ellipse(g, 0, -8, 3, 6, rgba(pal.trim, 0.55)); } ellipse(g, 0, 0, 3.4, 3.4, rgba(pal.trim, 0.8)); g.restore(); } }
    if (v === T_LIQ) { continue; }
    // decals
    if (v === T_FLOOR && dv > 200 && !A.paved) { const cols = pal.decal; const c2 = cols[dv % cols.length]; const n = 2 + (dv % 4); for (let k = 0; k < n; k++) { const ddx = ((dv * (k + 3) * 7) % 40) - 20, ddy = ((dv * (k + 5) * 11) % 20) - 10; if (REALMS[A.r].id === 'human' || REALMS[A.r].id === 'animal') { line(g, sx + ddx, sy + HTH + ddy, sx + ddx + 1, sy + HTH + ddy - 5, c2, 1.2); line(g, sx + ddx + 2, sy + HTH + ddy, sx + ddx + 3, sy + HTH + ddy - 4, c2, 1); } else ellipse(g, sx + ddx, sy + HTH + ddy, 2.2, 1.1, rgba(c2, 0.7)); } }
    if (v === T_FLOOR && dv > 246) { const bx = sx + (dv % 20) - 10, by = sy + HTH; if (REALMS[A.r].id === 'naraka' || REALMS[A.r].id === 'preta' || REALMS[A.r].id === 'asura') { line(g, bx - 5, by, bx + 5, by + 2, '#d8d0bc', 1.6); ball(g, bx + 6, by + 2, 2, 1.8, '#e0d8c4'); } else { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; ellipse(g, bx + Math.cos(a) * 2.4, by + Math.sin(a) * 1.2, 1.6, 1, pal.decal[0]); } } }
    // ambient occlusion around walls/props
    if (v === T_WALL || v === T_PROP) { g.fillStyle = rgrad(g, sx, sy + HTH, 4, 44, [[0, 'rgba(0,0,0,0.42)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(sx - 48, sy - 16, 96, 64); }
  }
  c = { cv, x: ox, y: oy, w, h, FS }; A.chunks.set(key, c);
  c.used = RENDER.frame || 0; if (A.chunks.size > (RENDER.mobile ? 40 : 64)) { let ok = null, ou = Infinity; for (const [k2, v] of A.chunks) if (v !== c && (v.used || 0) < ou && (v.used || 0) < (RENDER.frame || 0) - 2) { ou = v.used || 0; ok = k2; } if (ok) A.chunks.delete(ok); }
  return c;
}

/* ---------- sprite lookups ---------- */
function creSet(key, look) { return ART.cre[key] || buildCreature(key, look); }
function enemySet(e) { if (e.boss) return buildBoss(e.boss); if (e.lookKey && e.lookKey.startsWith('u_')) return ART.cre[e.lookKey] || buildCreature(e.lookKey, UNIQ[e.lookKey.slice(2)].look); return creSet(e.lookKey || e.id, E[e.id].look); }
function wallSpr(A, v) { const key = A.r + ':' + A.wallStyle + ':' + (v % 3); let s = ART.walls[key]; if (!s) s = ART.walls[key] = buildWall(A.pal, A.wallStyle, v % 3 + A.r * 7); return s; }
const PROP_W = [7, 4, 2, 1, 1]; function propKind(kinds, v) { let tot = 0; for (let i = 0; i < kinds.length; i++) tot += PROP_W[i] || 1; let r = v % tot; for (let i = 0; i < kinds.length; i++) { r -= PROP_W[i] || 1; if (r < 0) return kinds[i]; } return kinds[0]; }
function propSprA(A, v) { const kinds = A.kind === 'town' ? townProps(A.r) : A.props; const kind = propKind(kinds, v); const key = A.r + ':' + A.cave + ':' + kind + ':' + (v % 3); let s = ART.props[key]; if (!s) s = ART.props[key] = propSpr(kind, A.pal, v % 3 + 1); return s; }
function townProps(r) { return [['stupa_w', 'bliss_tree', 'pillar', 'lotus_pool'], ['stupa_s', 'sal_tree', 'hut', 'boulder'], ['banner', 'spire', 'spears', 'stupa_s'], ['banyan', 'fern', 'mossrock', 'bamboo'], ['lantern', 'dead_tree', 'shrine_ruin', 'urns'], ['brazier', 'obsidian', 'lantern', 'stupa_s']][r]; }
function prebuildRealm(r) {
  const ids = new Set(); for (const a of REALMS[r].areas) (a.roster || []).forEach(id => ids.add(id));
  for (const id of ids) creSet(id, E[id].look);
  for (const k in UNIQ) { const U = UNIQ[k]; if (ids.has(U.base) || REALMS[r].areas.some(a => a.quest === k || a.mini === k)) { creSet(U.base, E[U.base].look); if (U.look) creSet('u_' + k, U.look); if (U.minions) creSet(U.minions, E[U.minions].look); } }
  for (const role of ['guide', 'merchant', 'smith', 'gambler']) creSet('npc_' + role + r, NPC_LOOK[role](r));
}

/* ---------- main draw ---------- */
function drawBackground(ctx, A) {
  const R = RENDER; const pal = A.pal;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = lgrad(ctx, 0, 0, 0, R.H, [[0, pal.voidTop], [1, pal.voidBot]]); ctx.fillRect(0, 0, R.W, R.H);
  const id = REALMS[A.r].id;
  if (A.edge === 'void' && !A.cave) {
    if (id === 'deva') { if (!R.cloudSpr) R.cloudSpr = propSpr('cloud', pal, 7); for (let i = 0; i < 14; i++) { const px = ((i * 397 - G.cam.x * 0.35 * R.k + G.t * 6 * R.k) % (R.W + 400) + R.W + 400) % (R.W + 400) - 200; const py = ((i * 211 - G.cam.y * 0.35 * R.k) % (R.H + 300) + R.H + 300) % (R.H + 300) - 150; ctx.globalAlpha = 0.35 + (i % 3) * 0.12; drawSprScaled(ctx, R.cloudSpr, px, py, R.k * (1.6 + (i % 4) * 0.5)); } ctx.globalAlpha = 1; }
    if (id === 'naraka') { const t = G.t; ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const px = ((i * 331 - G.cam.x * 0.2 * R.k) % (R.W + 300) + R.W + 300) % (R.W + 300) - 150, py = ((i * 173 - G.cam.y * 0.2 * R.k) % (R.H + 300) + R.H + 300) % (R.H + 300) - 150; const rr = (180 + Math.sin(t * 0.7 + i) * 40) * R.k; ctx.drawImage(glowSpr('#ff3a0a', 64), px - rr, py - rr, rr * 2, rr * 2); } ctx.globalCompositeOperation = 'source-over'; }
    if (id === 'asura') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5; for (let i = 0; i < 6; i++) { const px = ((i * 431 - G.cam.x * 0.2 * R.k) % (R.W + 300) + R.W + 300) % (R.W + 300) - 150, py = ((i * 257 - G.cam.y * 0.2 * R.k) % (R.H + 300) + R.H + 300) % (R.H + 300) - 150; const rr = 220 * R.k; ctx.drawImage(glowSpr('#6a0a04', 64), px - rr, py - rr, rr * 2, rr * 2); } ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  }
}
function render(dt) {
  const R = RENDER, ctx = R.ctx, A = G.A, P = G.P; if (!A || !P) return;
  const k = R.k;
  // camera
  const tx = isoX(P.x, P.y), ty = isoY(P.x, P.y) - 20; const f = Math.min(1, dt * 9); G.cam.x += (tx - G.cam.x) * f; G.cam.y += (ty - G.cam.y) * f;
  const sh = G.cam.shake; R.shx = sh ? rand(-sh, sh) * R.px : 0; R.shy = sh ? rand(-sh, sh) * R.px : 0;
  drawBackground(ctx, A);
  const ox = R.W / 2 - G.cam.x * k + R.shx, oy = R.H / 2 - G.cam.y * k + R.shy;
  ctx.setTransform(k, 0, 0, k, ox, oy);
  const vw = R.W / k, vh = R.H / k; const left = G.cam.x - vw / 2, right = G.cam.x + vw / 2, top = G.cam.y - vh / 2, bot = G.cam.y + vh / 2;
  // chunks
  R.frame = (R.frame || 0) + 1; const CH = R.CH; const corners = [[left, top - 64], [right, top - 64], [left, bot + 64], [right, bot + 64]].map(([sx, sy]) => [(sx / HTW + sy / HTH) / 2, (sy / HTH - sx / HTW) / 2]);
  const txMin = Math.floor(Math.min(...corners.map(c => c[0]))) - 1, txMax = Math.ceil(Math.max(...corners.map(c => c[0]))) + 1, tyMin = Math.floor(Math.min(...corners.map(c => c[1]))) - 1, tyMax = Math.ceil(Math.max(...corners.map(c => c[1]))) + 1;
  const cxMin = Math.max(0, Math.floor(txMin / CH)), cxMax = Math.min(Math.ceil(A.w / CH) - 1, Math.floor(txMax / CH)), cyMin = Math.max(0, Math.floor(tyMin / CH)), cyMax = Math.min(Math.ceil(A.h / CH) - 1, Math.floor(tyMax / CH));
  let built = 0; const list = [];
  for (let cy = cyMin; cy <= cyMax; cy++) for (let cx = cxMin; cx <= cxMax; cx++) list.push([cx, cy]);
  list.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
  for (const [cx, cy] of list) { const key = cx + ',' + cy; if (!A.chunks.has(key)) { built++; } const c = chunkCanvas(A, cx, cy); c.used = R.frame; if (c.x > right || c.x + c.w < left || c.y > bot || c.y + c.h < top) continue; ctx.drawImage(c.cv, c.x, c.y, c.w, c.h); }
  // ground layer
  drawGround(ctx, A);
  // sorted sprites
  const D = []; const W = A.w; const pdep = P.x + P.y; const psx = isoX(P.x, P.y), psy = isoY(P.x, P.y);
  for (let y = Math.max(0, tyMin); y <= Math.min(A.h - 1, tyMax); y++) for (let x = Math.max(0, txMin); x <= Math.min(W - 1, txMax); x++) {
    const v = A.t[y * W + x]; if (v !== T_WALL && v !== T_PROP) continue; const sx = isoX(x + 0.5, y + 0.5), sy = isoY(x + 0.5, y + 0.5); if (sx < left - 64 || sx > right + 64 || sy < top - 20 || sy > bot + 140) continue;
    D.push({ d: x + y + 1, k: v, x: sx, y: sy, v: A.pv[y * W + x] });
  }
  for (const e of A.enemies) { if (e.dead) continue; const sx = isoX(e.x, e.y), sy = isoY(e.x, e.y); if (sx < left - 120 || sx > right + 120 || sy < top - 40 || sy > bot + 240) continue; D.push({ d: e.x + e.y, k: 'e', o: e, x: sx, y: sy }); }
  for (const m of G.minions) D.push({ d: m.x + m.y, k: 'm', o: m, x: isoX(m.x, m.y), y: isoY(m.x, m.y) });
  for (const n of A.npcs) D.push({ d: n.x + n.y, k: 'n', o: n, x: isoX(n.x, n.y), y: isoY(n.x, n.y) });
  for (const ex of A.exits) D.push({ d: ex.x + ex.y - 0.5, k: 'x', o: ex, x: isoX(ex.x, ex.y), y: isoY(ex.x, ex.y) });
  if (A.kind === 'town' && G.portal && G.portal.r === A.r) D.push({ d: A.portalSpot.x + A.portalSpot.y, k: 'tp', x: isoX(A.portalSpot.x, A.portalSpot.y), y: isoY(A.portalSpot.x, A.portalSpot.y) });
  if (A.wp) D.push({ d: A.wp.x + A.wp.y, k: 'w', x: isoX(A.wp.x, A.wp.y), y: isoY(A.wp.x, A.wp.y) });
  for (const c of A.chests) D.push({ d: c.x + c.y, k: 'c', o: c, x: isoX(c.x, c.y), y: isoY(c.x, c.y) });
  for (const s of A.shrines) D.push({ d: s.x + s.y, k: 's', o: s, x: isoX(s.x, s.y), y: isoY(s.x, s.y) });
  for (const s of G.sentries) D.push({ d: s.x + s.y, k: 'y', o: s, x: isoX(s.x, s.y), y: isoY(s.x, s.y) });
  if (!P.dead) D.push({ d: pdep, k: 'p', x: psx, y: psy });
  D.sort((a, b) => a.d - b.d);
  const heroSet = creSet('hero_' + G.C.cls, HERO_LOOK[G.C.cls]);
  for (const o of D) {
    switch (o.k) {
      case T_WALL: { const sp = wallSpr(A, o.v); const fade = o.d > pdep + 0.5 && Math.abs(o.x - psx) < 70 && o.y - psy > -10 && o.y - psy < 110; drawSpr(ctx, sp, o.x, o.y, fade ? 0.35 : null); break; }
      case T_PROP: { const sp = propSprA(A, o.v); const fade = o.d > pdep + 0.5 && Math.abs(o.x - psx) < 50 && o.y - psy > -6 && o.y - psy < 90; drawSpr(ctx, sp, o.x, o.y, fade ? 0.4 : null); if (sp.glow) { ctx.globalCompositeOperation = 'lighter'; const r = 26 + Math.sin(G.t * 5 + o.v) * 3; ctx.drawImage(glowSpr(sp.glow, 32), o.x - r, o.y + sp.glowY - r, r * 2, r * 2); ctx.globalCompositeOperation = 'source-over'; } break; }
      case 'e': drawEnemy(ctx, o.o, o.x, o.y); break;
      case 'm': drawMinion(ctx, o.o, o.x, o.y); break;
      case 'n': { const n = o.o; const set = n.role === 'stash' ? null : creSet('npc_' + n.role + A.r, NPC_LOOK[n.role](A.r)); ellipse(ctx, o.x, o.y, 14, 6, 'rgba(0,0,0,.35)'); if (n.role === 'stash') drawSpr(ctx, ART.spr.stash, o.x, o.y); else { if (n.role === 'guide') { ctx.globalCompositeOperation = 'lighter'; const r = 40 + Math.sin(G.t * 2) * 4; ctx.drawImage(glowSpr('#ffe8a0', 32), o.x - r, o.y - 50 - r, r * 2, r * 2); ctx.globalCompositeOperation = 'source-over'; } drawSpr(ctx, set.frames[0], o.x, o.y + Math.sin(n.t * 1.5) * 0.6); } break; }
      case 'x': { const fade = o.d > pdep + 0.3 && Math.abs(o.x - psx) < 60 && o.y - psy > -8 && o.y - psy < 120; if (fade) ctx.globalAlpha = 0.4; drawExit(ctx, o.o, o.x, o.y); ctx.globalAlpha = 1; break; }
      case 'tp': drawPortal(ctx, o.x, o.y, '#6aa8ff'); break;
      case 'w': { const lit = G.C.wps[A.key]; drawSpr(ctx, ART.spr['wp' + (lit ? 1 : 0)], o.x, o.y); if (lit) { ctx.globalCompositeOperation = 'lighter'; const r = 40 + Math.sin(G.t * 3) * 5; ctx.drawImage(glowSpr('#ffd87a', 32), o.x - r, o.y - 36 - r, r * 2, r * 2); ctx.globalCompositeOperation = 'source-over'; } break; }
      case 'c': drawSpr(ctx, ART.spr['chest' + (o.o.open ? 1 : 0)], o.x, o.y); if (o.o.big && !o.o.open) { ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glowSpr('#ffd060', 32), o.x - 20, o.y - 30, 40, 40); ctx.globalCompositeOperation = 'source-over'; } break;
      case 's': { const S2 = SHRINES[o.o.type]; drawSpr(ctx, ART.spr.shrine, o.x, o.y); if (!o.o.used) { ctx.globalCompositeOperation = 'lighter'; const r = 22 + Math.sin(G.t * 4) * 3; ctx.drawImage(glowSpr(S2.col, 32), o.x - r, o.y - 44 - r, r * 2, r * 2); ctx.drawImage(glowSpr(S2.col, 32), o.x - 6, o.y - 50, 12, 12); ctx.globalCompositeOperation = 'source-over'; } break; }
      case 'y': { const sp = ART.sentry[Math.floor(o.o.spin) % 4]; drawSpr(ctx, sp, o.x, o.y); break; }
      case 'p': drawHero(ctx, heroSet, psx, psy); break;
    }
  }
  drawAir(ctx, A);
  drawParticles(ctx);
  // lighting
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawLighting(ctx, A);
  drawOverlayText(ctx, A);
  // flash & low life
  if (G.flashT > 0) { ctx.globalAlpha = Math.min(0.28, G.flashT * 0.4); ctx.fillStyle = G.flashCol; ctx.fillRect(0, 0, R.W, R.H); ctx.globalAlpha = 1; }
  const lf = P.hp / P.S.lifeMax; if (lf < 0.35 && !P.dead) { ctx.globalAlpha = (0.35 - lf) * 2 * (0.6 + Math.sin(G.t * 6) * 0.4); ctx.fillStyle = rgrad(ctx, R.W / 2, R.H / 2, Math.min(R.W, R.H) * 0.3, Math.max(R.W, R.H) * 0.7, [[0, 'rgba(120,0,0,0)'], [1, 'rgba(160,0,0,0.9)']]); ctx.fillRect(0, 0, R.W, R.H); ctx.globalAlpha = 1; }
  if (P.hurtT > 0) { ctx.globalAlpha = P.hurtT * 0.6; ctx.drawImage(R.vig, 0, 0, R.W, R.H); ctx.globalAlpha = 1; }
}
function drawShadow(ctx, x, y, r, a = 0.35) { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.ellipse(x, y, r * 38, r * 19, 0, 0, TAU); ctx.fill(); }
function drawEnemy(ctx, e, sx, sy) {
  const set = enemySet(e); let fr = 0; if (e.atkAnim > 0 && set.frames.length > 4) fr = 4; else if (e.moving || e.fly) fr = Math.floor(e.t * (e.fly ? 7 : 8) + e.uid) % 4;
  if (e.windT > 0) fr = 4;
  const sp = (e.face < 0 ? set.mframes : set.frames)[fr] || set.frames[0];
  const fy = e.fly ? -8 - Math.sin(e.t * 3 + e.uid) * 3 : 0; const sc = e.scale || 1;
  if (e.inv && e.reviveT != null) { ctx.globalAlpha = 0.35; }
  drawShadow(ctx, sx, sy, e.r * (e.boss ? 1.1 : 1), e.fly ? 0.22 : 0.35);
  if (e.elite === 2 || e.elite === 1 || e.boss) { ctx.globalCompositeOperation = 'lighter'; const col = e.elite === 1 ? '#3a5aff' : e.boss ? '#ff6a2a' : '#c8902a'; const r = (e.boss ? 90 : 34) * sc; ctx.globalAlpha = 0.35 + Math.sin(G.t * 4) * 0.1; ctx.drawImage(glowSpr(col, 32), sx - r, sy - r * 0.8 + fy, r * 2, r * 1.6); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (e.shield) { ctx.globalCompositeOperation = 'lighter'; const r = 110; ctx.globalAlpha = 0.5 + Math.sin(G.t * 5) * 0.15; ctx.drawImage(glowSpr('#ffe8a0', 32), sx - r, sy - 120 - r * 0.2, r * 2, r * 1.6); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (e.inv && e.boss) ctx.globalAlpha = 0.3;
  if (sc !== 1) drawSprScaled(ctx, sp, sx, sy + fy, sc); else drawSpr(ctx, sp, sx, sy + fy);
  if (e.hitT > 0 || (e.windT > 0 && Math.floor(G.t * 20) % 2)) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = e.windT > 0 ? 0.6 : Math.min(1, e.hitT * 6); if (sc !== 1) drawSprScaled(ctx, sp, sx, sy + fy, sc); else drawSpr(ctx, sp, sx, sy + fy); ctx.globalCompositeOperation = 'source-over'; }
  ctx.globalAlpha = 1;
  if (e.slowAmt > 0 || e.curseT > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35; ctx.drawImage(glowSpr(e.curseT > 0 ? '#b77dff' : '#7fc8ff', 32), sx - 16, sy - 30 + fy, 32, 32); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (e.burnT > 0 && Math.random() < 0.3) addPart(e.x + rand(-0.2, 0.2), e.y + rand(-0.2, 0.2), rand(10, 30), 0, 0, 30, '#ff8a2a', 0.5, 'mote');
}
function drawHero(ctx, set, sx, sy) {
  const P = G.P; let fr = 0; if (P.castT > 0) fr = 4; else if (P.moving) fr = Math.floor(P.anim * 9) % 4;
  const sp = (P.face < 0 ? set.mframes : set.frames)[fr];
  drawShadow(ctx, sx, sy, 0.42);
  if (G.buffs.wrathful || G.buffs.skydance) { ctx.globalCompositeOperation = 'lighter'; const r = 46 + Math.sin(G.t * 12) * 4; ctx.drawImage(glowSpr(G.buffs.skydance ? '#ff6ab0' : '#ff4a1a', 32), sx - r, sy - 30 - r, r * 2, r * 2); ctx.globalCompositeOperation = 'source-over'; }
  const blink = P.invT > 0 && P.invT < 1 && Math.floor(G.t * 12) % 2;
  drawSpr(ctx, sp, sx, sy, blink ? 0.55 : null);
  if (G.buffs.adamant) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.6; ctx.strokeStyle = '#e8f0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(sx, sy - 22, 26, 34, 0, 0, TAU); ctx.stroke(); ctx.drawImage(glowSpr('#c8d8ff', 32), sx - 34, sy - 60, 68, 76); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (P.hurtT > 0.12) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5; drawSpr(ctx, sp, sx, sy); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
}
function drawMinion(ctx, m, sx, sy) {
  const look = MINION_LOOK[m.def.sprite]; const set = creSet(m.def.sprite, look); let fr = m.atkAnim > 0 ? 4 : m.moving || m.def.fly ? Math.floor(m.anim * 8) % 4 : 0;
  const sp = (m.face < 0 ? set.mframes : set.frames)[fr]; const fy = m.def.fly ? -16 - Math.sin(m.anim * 3) * 4 : 0;
  drawShadow(ctx, sx, sy, m.r, 0.3); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.3; const r = m.def.big ? 60 : 28; ctx.drawImage(glowSpr(m.def.big ? '#4a5aff' : '#8ad8ff', 32), sx - r, sy - r + fy - 10, r * 2, r * 2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (m.life && m.life < 1.5) ctx.globalAlpha = m.life / 1.5;
  drawSpr(ctx, sp, sx, sy + fy); ctx.globalAlpha = 1;
  if (m.hp < m.maxHp) { ctx.fillStyle = '#000'; ctx.fillRect(sx - 12, sy - (m.def.big ? 100 : 44) + fy, 24, 3); ctx.fillStyle = '#4fd34f'; ctx.fillRect(sx - 12, sy - (m.def.big ? 100 : 44) + fy, 24 * Math.max(0, m.hp / m.maxHp), 3); }
}
function drawPortal(ctx, x, y, col) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const t = G.t;
  ctx.drawImage(glowSpr(col, 32), x - 44, y - 90, 88, 110);
  ctx.translate(x, y - 34); for (let i = 0; i < 3; i++) { ctx.rotate(t * (1 + i * 0.3)); ctx.strokeStyle = rgba(col, 0.6 - i * 0.15); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 18 - i * 4, 30 - i * 6, 0, i, i + 4.5); ctx.stroke(); }
  ctx.restore();
}
function drawExit(ctx, ex, x, y) {
  const spr = { gate: 'gate', gateBoss: 'gateBoss', cave: 'cave', stairs: 'stairs', realm: 'gateRealm' }[ex.type];
  if (spr) drawSpr(ctx, ART.spr[spr], x, y);
  if (ex.type === 'realm') drawPortal(ctx, x, y + 4, '#ffd87a');
  else if (ex.type === 'gate' || ex.type === 'gateBoss') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 + Math.sin(G.t * 2) * 0.15; ctx.drawImage(glowSpr(ex.type === 'gateBoss' ? '#ff5a3a' : '#8ab8ff', 32), x - 30, y - 70, 60, 70); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
}
function iso(ctx, sx, sy) { ctx.translate(sx, sy); ctx.scale(ISO_RX, ISO_RY); ctx.rotate(Math.PI / 4); }
function drawGround(ctx, A) {
  const P = G.P; const t = G.t;
  // hazards & zones
  for (const h of G.hazards) { const [sx, sy] = [isoX(h.x, h.y), isoY(h.x, h.y)]; const a = Math.min(1, (h.life - h.t) * 2) * 0.55; ctx.globalAlpha = a; ctx.fillStyle = rgrad(ctx, sx, sy, 2, h.r * ISO_RX, [[0, rgba(h.col, 0.9)], [1, rgba(h.col, 0)]]); ctx.beginPath(); ctx.ellipse(sx, sy, h.r * ISO_RX, h.r * ISO_RY, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  for (const z of G.zones) {
    const sx = isoX(z.x, z.y), sy = isoY(z.x, z.y); const a = Math.min(1, z.t * 5, (z.dur - z.t) * 3); const rx = z.r * ISO_RX, ry = z.r * ISO_RY;
    ctx.globalAlpha = a;
    if (z.fx === 'frost') { ctx.fillStyle = rgrad(ctx, sx, sy, 2, rx, [[0, 'rgba(210,240,255,.55)'], [0.8, 'rgba(120,190,255,.35)'], [1, 'rgba(120,190,255,0)']]); ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(230,248,255,.5)'; ctx.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const aa = i / 6 * TAU + z.t * 0.3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(aa) * rx * 0.8, sy + Math.sin(aa) * ry * 0.8); ctx.stroke(); } }
    else if (z.fx === 'well') { ctx.save(); iso(ctx, sx, sy); ctx.lineWidth = 0.06; for (let i = 0; i < 4; i++) { ctx.strokeStyle = `rgba(183,125,255,${0.5 - i * 0.1})`; ctx.beginPath(); for (let j = 0; j < 40; j++) { const aa = j * 0.3 - z.t * 5 + i * 1.6, rr = z.r * (1 - j / 40); ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.stroke(); } ctx.restore(); ctx.fillStyle = rgrad(ctx, sx, sy, 0, rx * 0.5, [[0, 'rgba(0,0,0,.8)'], [1, 'rgba(60,0,120,0)']]); ctx.beginPath(); ctx.ellipse(sx, sy, rx * 0.5, ry * 0.5, 0, 0, TAU); ctx.fill(); }
    else if (z.fx === 'feast') { ctx.fillStyle = rgrad(ctx, sx, sy, 2, rx, [[0, 'rgba(20,0,0,.85)'], [0.55, 'rgba(160,10,20,.55)'], [1, 'rgba(160,10,20,0)']]); ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, 0, 0, TAU); ctx.fill(); for (let i = 0; i < 10; i++) { const aa = i / 10 * TAU + z.t * 0.8; const hx = sx + Math.cos(aa) * rx * 0.7, hy = sy + Math.sin(aa) * ry * 0.7; poly(ctx, [hx - 3, hy, hx, hy - 9 - Math.sin(t * 8 + i) * 3, hx + 3, hy], '#f0e6d0'); } }
    else if (z.fx === 'spark') { ctx.fillStyle = rgrad(ctx, sx, sy, 2, rx, [[0, 'rgba(255,255,200,.55)'], [0.6, 'rgba(255,230,90,.3)'], [1, 'rgba(255,230,90,0)']]); ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,248,170,.8)'; ctx.lineWidth = 1.5; for (let i = 0; i < 5; i++) { const aa = (i / 5) * TAU + z.t * 3; const r0 = rx * (0.2 + 0.6 * ((i * 37 + z.t * 90) % 100) / 100); ctx.beginPath(); ctx.moveTo(sx + Math.cos(aa) * r0, sy + Math.sin(aa) * r0 * 0.5); ctx.lineTo(sx + Math.cos(aa + 0.3) * (r0 + 9), sy + Math.sin(aa + 0.3) * (r0 + 9) * 0.5); ctx.stroke(); } }
    else if (z.fx === 'hands') { ctx.fillStyle = 'rgba(80,30,120,.35)'; ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, 0, 0, TAU); ctx.fill(); for (let i = 0; i < 7; i++) { const aa = i / 7 * TAU; const hx = sx + Math.cos(aa) * rx * 0.6, hy = sy + Math.sin(aa) * ry * 0.6; const h = 10 + Math.sin(t * 6 + i) * 3; line(ctx, hx, hy, hx + Math.sin(t * 3 + i) * 3, hy - h, '#c8a8ff', 3); ctx.fillStyle = '#e0d0ff'; ctx.fillRect(hx - 3, hy - h - 5, 6, 5); } }
    else { ctx.fillStyle = rgrad(ctx, sx, sy, 2, rx, [[0, 'rgba(255,200,80,.6)'], [0.6, 'rgba(255,90,20,.35)'], [1, 'rgba(255,60,10,0)']]); ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, 0, 0, TAU); ctx.fill(); if (Math.random() < 0.5) addPart(z.x + rand(-z.r, z.r) * 0.7, z.y + rand(-z.r, z.r) * 0.7, 2, 0, 0, rand(20, 50), Math.random() < 0.5 ? '#ffb040' : '#ff6a1a', 0.6, 'mote'); }
    ctx.globalAlpha = 1;
  }
  // mines
  for (const m of G.mines) { const k = Math.min(1, m.t / 0.3); const x = lerp(m.sx, m.x, k), y = lerp(m.sy, m.y, k); const sx = isoX(x, y), sy = isoY(x, y) - Math.sin(k * Math.PI) * 30; ctx.save(); ctx.translate(sx, sy); for (let i = 0; i < 6; i++) { ctx.rotate(TAU / 6); ctx.fillStyle = i % 2 ? '#ff9ab0' : '#ffd0d8'; ctx.beginPath(); ctx.ellipse(0, -4, 2.5, 5, 0, 0, TAU); ctx.fill(); } ctx.restore(); if (m.t > m.arm) { ctx.globalCompositeOperation = 'lighter'; const r = 10 + Math.sin(t * 10) * 3; ctx.drawImage(glowSpr('#ff8a5a', 32), sx - r, sy - r, r * 2, r * 2); ctx.globalCompositeOperation = 'source-over'; } }
  // telegraphs
  for (const T of G.teles) {
    const p = Math.min(1, T.t / T.delay); ctx.save(); const sx = isoX(T.x, T.y), sy = isoY(T.x, T.y);
    if (T.line) { iso(ctx, sx, sy); ctx.rotate(T.ang); ctx.fillStyle = rgba(T.col, 0.15 + p * 0.25); ctx.fillRect(0, -T.w / 2, T.len, T.w); ctx.fillStyle = rgba(T.col, 0.45); ctx.fillRect(0, -T.w / 2, T.len * p, T.w); ctx.strokeStyle = rgba(T.col, 0.8); ctx.lineWidth = 0.05; ctx.strokeRect(0, -T.w / 2, T.len, T.w); }
    else { ctx.fillStyle = rgba(T.col, 0.12 + p * 0.2); ctx.beginPath(); ctx.ellipse(sx, sy, T.r * ISO_RX, T.r * ISO_RY, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = rgba(T.col, 0.85); ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = rgba(T.col, 0.35); ctx.beginPath(); ctx.ellipse(sx, sy, T.r * ISO_RX * p, T.r * ISO_RY * p, 0, 0, TAU); ctx.fill();
      if (T.fall && p > 0.3) { const fz = (1 - p) * 260; const spr = T.fall === 'meteor' ? ART.fx.fireball : T.fall === 'spear' ? ART.fx.knife : ART.fx.lightball; ctx.globalCompositeOperation = 'lighter'; drawSprScaled(ctx, spr, sx, sy - fz, T.fall === 'spear' ? 1.6 : 2); ctx.globalCompositeOperation = 'source-over'; } }
    ctx.restore();
  }
  // pickups
  ctx.globalCompositeOperation = 'lighter';
  for (const o of A.orbs) { const sx = isoX(o.x, o.y), sy = isoY(o.x, o.y) - 8 - Math.sin(G.t * 4 + o.x * 3) * 2; const s = o.big ? 1.5 : 1; drawSprScaled(ctx, o.big ? ART.spr.merit2 : ART.spr.merit, sx, sy, s); }
  ctx.globalCompositeOperation = 'source-over';
  for (const o of A.golds) { const sx = isoX(o.x, o.y), sy = isoY(o.x, o.y); drawSpr(ctx, ART.spr.gold, sx, sy); }
  for (const o of A.pots) { const sx = isoX(o.x, o.y), sy = isoY(o.x, o.y); ctx.drawImage(itemIconCanvas({ pot: o.kind }, 32), sx - 8, sy - 14, 16, 16); }
  for (const gi of A.items) {
    const k = Math.min(1, gi.t / 0.45); const x = lerp(gi.sx, gi.x, k), y = lerp(gi.sy, gi.y, k); const sx = isoX(x, y), sy = isoY(x, y) - Math.sin(k * Math.PI) * 26;
    if (gi.it.rar === 3 || gi.it.rar === 2) { ctx.globalCompositeOperation = 'lighter'; const col = gi.it.rar === 3 ? '#e8b060' : '#f0dc5a'; ctx.fillStyle = lgrad(ctx, 0, sy - 120, 0, sy, [[0, rgba(col, 0)], [1, rgba(col, 0.35)]]); ctx.fillRect(sx - 5, sy - 120, 10, 120); ctx.globalCompositeOperation = 'source-over'; }
    ctx.drawImage(itemIconCanvas(gi.it, 48), sx - 11, sy - 18, 22, 22);
  }
  // waypoint & portal ground glows
  if (A.kind === 'boss' && A.bossState === 0 && A.center) { const sx = isoX(A.center.x, A.center.y), sy = isoY(A.center.x, A.center.y); ctx.save(); iso(ctx, sx, sy); ctx.strokeStyle = 'rgba(255,90,40,.25)'; ctx.lineWidth = 0.08; ctx.beginPath(); ctx.arc(0, 0, 10.5, 0, TAU); ctx.stroke(); ctx.restore(); }
}
function drawAir(ctx, A) {
  const t = G.t; const P = G.P;
  ctx.globalCompositeOperation = 'lighter';
  // falling rain (arrows, palms, meteors) before they land
  for (const R of G.rains) { if (R.fx === 'lightning') continue; for (const im of R.impacts) { if (im.done || im.t < -0.45) continue; const k = (im.t + 0.45) / 0.45; const sx = isoX(im.x, im.y), sy = isoY(im.x, im.y); const z = (1 - k) * 220;
      if (R.fx === 'arrow') { ctx.globalCompositeOperation = 'source-over'; line(ctx, sx + (1 - k) * 30, sy - z - 22, sx + (1 - k) * 30 - 3, sy - z, '#d8c8a0', 1.6); poly(ctx, [sx + (1 - k) * 30 - 3, sy - z + 4, sx + (1 - k) * 30 - 6, sy - z - 2, sx + (1 - k) * 30, sy - z - 2], '#f0f0f8'); ctx.globalCompositeOperation = 'lighter'; }
      else if (R.fx === 'meteor') { drawSprScaled(ctx, ART.fx.fireball, sx + (1 - k) * 60, sy - z, 1.8); }
      else if (R.fx === 'feast') { ctx.drawImage(glowSpr('#ff2a1a', 16), sx - 7, sy - z - 7, 14, 14); ctx.globalCompositeOperation = 'source-over'; ellipse(ctx, sx, sy - z, 2.4, 4, '#c81a1a'); ctx.globalCompositeOperation = 'lighter'; }
      else if (R.fx === 'palm') { ctx.globalAlpha = k; ctx.drawImage(glowSpr('#ffe8a0', 32), sx - 18, sy - z - 30, 36, 36); ctx.globalAlpha = 1; } } }
  // orbits
  for (const o of G.orbits) { const sx = isoX(o.x, o.y), sy = isoY(o.x, o.y) - 18; const spr = ART.fx[o.sprite] || ART.fx.chakra; const s = o.size / 0.45; ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 8); ctx.drawImage(glowSpr(ELEM_COL[o.elem], 32), -16 * s, -16 * s, 32 * s, 32 * s); ctx.drawImage(spr.c, -spr.w / 2 * s, -spr.h / 2 * s, spr.w * s, spr.h * s); ctx.restore();
    if (o.wheel) { const psx = isoX(P.x, P.y), psy = isoY(P.x, P.y) - 18; ctx.strokeStyle = 'rgba(255,190,80,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(psx, psy); ctx.lineTo(sx, sy); ctx.stroke(); } }
  if (G.orbits.some(o => o.wheel)) { const o = G.orbits.find(o => o.wheel); const sx = isoX(P.x, P.y), sy = isoY(P.x, P.y) - 18; ctx.strokeStyle = 'rgba(255,200,80,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sx, sy, o.R * ISO_RX, o.R * ISO_RY, 0, 0, TAU); ctx.stroke(); }
  // projectiles
  const drawP = (p, isE) => { const sx = isoX(p.x, p.y), sy = isoY(p.x, p.y) - (isE ? 16 : 20); const spr = ART.fx[p.sprite] || ART.fx.orb; const ang = p.spin ? t * 14 : Math.atan2((Math.sin(p.rot) + Math.cos(p.rot)) * 16, (Math.cos(p.rot) - Math.sin(p.rot)) * 32);
    const gc = isE ? ELEM_COL[p.elem] || '#ff6a1a' : ELEM_COL[p.elem]; const gr = isE ? 16 : 18; ctx.drawImage(glowSpr(gc, 32), sx - gr, sy - gr, gr * 2, gr * 2);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang); if (isE) ctx.globalCompositeOperation = 'source-over'; const s = isE ? 1.1 : 1; ctx.drawImage(spr.c, -spr.w / 2 * s, -spr.h / 2 * s, spr.w * s, spr.h * s); ctx.restore(); ctx.globalCompositeOperation = 'lighter'; };
  for (const p of G.proj) { if (p.sprite === 'vajra') { const sx = isoX(p.x, p.y), sy = isoY(p.x, p.y) - 20; ctx.drawImage(glowSpr('#ffe066', 32), sx - 22, sy - 22, 44, 44); ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 16); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(skillIconVajra(), -12, -12, 24, 24); ctx.restore(); ctx.globalCompositeOperation = 'lighter'; continue; } drawP(p, false); }
  for (const p of G.eproj) drawP(p, true);
  // beams
  for (const b of G.beams) { const x1 = P.x + Math.cos(b.a) * b.len, y1 = P.y + Math.sin(b.a) * b.len; const [ax, ay] = [isoX(P.x, P.y), isoY(P.x, P.y) - 22], [bx, by] = [isoX(x1, y1), isoY(x1, y1) - 22]; const a = Math.min(1, b.t * 8, (b.dur - b.t) * 6); ctx.globalAlpha = a; line(ctx, ax, ay, bx, by, 'rgba(255,230,160,.35)', 18); line(ctx, ax, ay, bx, by, 'rgba(255,245,210,.7)', 7); line(ctx, ax, ay, bx, by, '#ffffff', 2.4); ctx.globalAlpha = 1; }
  // fx
  for (const f of G.fx) {
    const p = f.t / f.life; const sx = isoX(f.x || 0, f.y || 0), sy = isoY(f.x || 0, f.y || 0);
    switch (f.type) {
      case 'nova': { const a = 1 - p; ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.strokeStyle = f.col; ctx.lineWidth = 6 * (1 - p) + 1.5; ctx.beginPath(); ctx.ellipse(sx, sy, f.r * ISO_RX, f.r * ISO_RY, 0, 0, TAU); ctx.stroke(); ctx.fillStyle = rgrad(ctx, sx, sy, f.r * ISO_RX * 0.5, f.r * ISO_RX, [[0, rgba(f.col, 0)], [1, rgba(f.col, 0.25)]]); ctx.beginPath(); ctx.ellipse(sx, sy, f.r * ISO_RX, f.r * ISO_RY, 0, 0, TAU); ctx.fill(); ctx.restore(); break; }
      case 'slash': { ctx.save(); iso(ctx, sx, sy); ctx.globalAlpha = 1 - p; ctx.strokeStyle = f.col; ctx.lineWidth = 0.35 * (1 - p) + 0.05; ctx.beginPath(); ctx.arc(0, 0, f.r * (0.7 + p * 0.3), f.a - f.arc / 2, f.a + f.arc / 2); ctx.stroke(); ctx.lineWidth = 0.08; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, f.r * (0.75 + p * 0.3), f.a - f.arc / 2 * p, f.a + f.arc / 2 * p); ctx.stroke(); ctx.restore(); break; }
      case 'sweep': { ctx.save(); const cx = isoX(f.x, f.y), cy = isoY(f.x, f.y); iso(ctx, cx, cy - 10); ctx.rotate(f.ang || 0); const L = f.r; ctx.globalAlpha = Math.min(1, (1 - p) * 3); ctx.fillStyle = lgrad(ctx, 0, 0, L, 0, [[0, 'rgba(255,240,200,.2)'], [1, 'rgba(255,200,100,.9)']]); ctx.beginPath(); ctx.moveTo(0.3, -0.12); ctx.lineTo(L, 0); ctx.lineTo(0.3, 0.12); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,140,40,.25)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, L, -0.9, 0); ctx.closePath(); ctx.fill(); ctx.restore(); break; }
      case 'chain': { if (!f.pts || f.pts.length < 2) break; ctx.globalAlpha = 1 - p; for (const w of [[f.col, 7, 0.35], ['#ffffff', 2, 1]]) { ctx.strokeStyle = w[0]; ctx.lineWidth = w[1]; ctx.globalAlpha = (1 - p) * w[2]; ctx.beginPath(); for (let i = 0; i < f.pts.length; i++) { const [x, y] = f.pts[i]; const X = isoX(x, y), Y = isoY(x, y) - 20; if (!i) ctx.moveTo(X, Y); else { const [px, py] = f.pts[i - 1]; const PX = isoX(px, py), PY = isoY(px, py) - 20; for (let s = 1; s <= 4; s++) ctx.lineTo(lerp(PX, X, s / 4) + (s < 4 ? rand(-6, 6) : 0), lerp(PY, Y, s / 4) + (s < 4 ? rand(-6, 6) : 0)); } } ctx.stroke(); } ctx.globalAlpha = 1; break; }
      case 'bolt': { ctx.globalAlpha = 1 - p; ctx.strokeStyle = f.col; for (const [w, a] of [[8, 0.3], [2.5, 1]]) { ctx.lineWidth = w; ctx.globalAlpha = (1 - p) * a; ctx.beginPath(); let x = sx + rand(-10, 10), y = sy - 260; ctx.moveTo(x, y); while (y < sy) { y += rand(20, 40); x += rand(-16, 16); ctx.lineTo(y > sy ? sx : x, Math.min(y, sy)); } ctx.stroke(); } ctx.drawImage(glowSpr(f.col, 32), sx - 40, sy - 20, 80, 40); ctx.globalAlpha = 1; break; }
      case 'impact': { const r = (f.r || 1) * (0.5 + p * 0.6) * (f.kind === 'arrow' ? 0.5 : 1); ctx.globalAlpha = (1 - p) * (f.kind === 'arrow' ? 0.45 : 1); ctx.drawImage(glowSpr(f.col, 32), sx - r * ISO_RX, sy - r * ISO_RY * 1.4, r * ISO_RX * 2, r * ISO_RY * 2.8); ctx.strokeStyle = f.col; ctx.lineWidth = 3 * (1 - p); ctx.beginPath(); ctx.ellipse(sx, sy, r * ISO_RX, r * ISO_RY, 0, 0, TAU); ctx.stroke();
        if (f.kind === 'palm' && p < 0.6) { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1 - p / 0.6; ctx.fillStyle = '#ffe8a0'; ctx.beginPath(); ctx.ellipse(sx, sy - 6, 12, 8, 0, 0, TAU); ctx.fill(); for (let i = 0; i < 4; i++) ctx.fillRect(sx - 11 + i * 6, sy - 26, 4.5, 18); ctx.globalCompositeOperation = 'lighter'; }
        if (f.kind === 'arrow') { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1 - p * 0.6; line(ctx, sx + 3, sy - 16, sx, sy - 2, '#c8b890', 1.6); ctx.globalCompositeOperation = 'lighter'; }
        ctx.globalAlpha = 1; break; }
      case 'pillar': { const a = Math.sin(p * Math.PI); const w = f.big ? 44 : 26; ctx.globalAlpha = a; ctx.fillStyle = lgrad(ctx, 0, sy - 240, 0, sy, [[0, rgba(f.col, 0)], [0.6, rgba(f.col, 0.5)], [1, rgba(f.col, 0.9)]]); ctx.fillRect(sx - w / 2, sy - 240, w, 240); ctx.drawImage(glowSpr(f.col, 32), sx - w * 1.4, sy - w * 0.7, w * 2.8, w * 1.4); ctx.globalAlpha = 1; break; }
      case 'glow': { ctx.globalAlpha = 1 - p; const r = 80; ctx.drawImage(glowSpr(f.col, 32), sx - r, sy - (f.z || 0) - r, r * 2, r * 2); ctx.globalAlpha = 1; break; }
      case 'earth': { for (let i = 0; i < 4; i++) { const q = (p * 2 + i * 0.25) % 1; ctx.globalAlpha = (1 - q) * 0.8; ctx.strokeStyle = '#ffe8a0'; ctx.lineWidth = 6 * (1 - q); ctx.beginPath(); ctx.ellipse(sx, sy, q * 20 * ISO_RX, q * 20 * ISO_RY, 0, 0, TAU); ctx.stroke(); } ctx.globalAlpha = 1; break; }
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}
let _vajraIcon = null; function skillIconVajra() { if (_vajraIcon) return _vajraIcon; const c = mkCanvas(48, 48); const g = c.getContext('2d'); g.scale(0.75, 0.75); drawSymbol(g, 'vajra', '#f0c040'); _vajraIcon = c; return c; }
function drawParticles(ctx) {
  ctx.globalCompositeOperation = 'lighter';
  for (const p of G.parts) { const sx = isoX(p.x, p.y), sy = isoY(p.x, p.y) - p.z; const a = 1 - p.t / p.life; if (p.type === 'smoke') { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a * 0.3; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(sx, sy, 6 + p.t * 20, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; continue; } ctx.globalAlpha = a; const r = (p.type === 'mote' ? 5 : 3.5) * p.size; ctx.drawImage(glowSpr(p.col, 16), sx - r, sy - r, r * 2, r * 2); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
function drawLighting(ctx, A) {
  const R = RENDER; const L = R.lctx; const lw = R.light.width, lh = R.light.height; const pal = A.pal;
  let dark = pal.dark; let lr = pal.light; if (G.eclipse > 0 || (G.boss && G.boss.id === 'mara' && G.eclipse)) { dark = Math.min(0.92, dark + 0.35); lr *= 0.5; }
  if (A.kind === 'town') dark *= 0.6;
  if (dark < 0.05) return;
  L.globalCompositeOperation = 'source-over'; L.clearRect(0, 0, lw, lh); L.fillStyle = rgba(mix(pal.fog || '#000', '#000000', 0.6), dark); L.fillRect(0, 0, lw, lh);
  L.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, a = 1) => { const [sx, sy] = w2s(x, y); const X = sx / 4, Y = (sy - 20 * R.k) / 4, rr = r * ISO_RX * R.k / 4; L.globalAlpha = a; L.drawImage(R.hole, X - rr, Y - rr * 0.8, rr * 2, rr * 1.6); };
  const P = G.P; hole(P.x, P.y, lr, 1); hole(P.x, P.y, lr * 0.55, 1);
  for (const p of G.proj) hole(p.x, p.y, 1.8, 0.6);
  for (const p of G.eproj) hole(p.x, p.y, 1.4, 0.5);
  for (const f of G.fx) if (f.type === 'nova' || f.type === 'impact' || f.type === 'pillar' || f.type === 'bolt') hole(f.x, f.y, (f.r || 2) + 2, 0.7 * (1 - f.t / f.life));
  for (const z of G.zones) if (z.elem === 'fire') hole(z.x, z.y, z.r + 1, 0.5);
  for (const o of G.orbits) hole(o.x, o.y, 1.6, 0.6);
  for (const e of A.exits) hole(e.x, e.y, 3, 0.7);
  if (A.wp) hole(A.wp.x, A.wp.y, 3, 0.6);
  for (const s of A.shrines) if (!s.used) hole(s.x, s.y, 2.5, 0.6);
  for (const n of A.npcs) hole(n.x, n.y, 3, 0.5);
  for (const m of G.minions) hole(m.x, m.y, m.def.big ? 3 : 1.6, 0.5);
  if (G.boss) for (const e of G.boss.ents) if (!e.dead) hole(e.x, e.y, 3, 0.4);
  L.globalAlpha = 1;
  ctx.imageSmoothingEnabled = true; ctx.drawImage(R.light, 0, 0, R.W, R.H);
  ctx.globalAlpha = 0.55; ctx.drawImage(R.vig, 0, 0, R.W, R.H); ctx.globalAlpha = 1;
}
function drawOverlayText(ctx, A) {
  const R = RENDER; const s = R.px * clamp(0.75 + R.zoom * 0.25, 0.9, 1.3); G.labelRects.length = 0;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // item labels
  const placed = [];
  const P = G.P;
  for (const gi of A.items) {
    if (dist2(gi.x, gi.y, P.x, P.y) > 196) continue; const [sx, sy0] = w2s(gi.x, gi.y); let sy = sy0 - 26 * R.k;
    const it = gi.it; const col = it.qitem ? '#e39a3c' : { 0: '#e6e0d4', 1: '#8a94ff', 2: '#f0dc5a', 3: '#d8b474', 5: '#b0b0b0', 6: '#f0a030' }[it.rar] || '#fff'; const txt = it.gem ? it.name : it.name;
    ctx.font = `600 ${Math.round(11 * s)}px Cinzel, Georgia, serif`; const w = ctx.measureText(txt).width + 10 * s, h = 16 * s;
    for (let tries = 0; tries < 8; tries++) { if (!placed.some(r => Math.abs(r.x - sx) < (r.w + w) / 2 && Math.abs(r.y - sy) < h)) break; sy -= h + 1; }
    placed.push({ x: sx, y: sy, w }); ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(sx - w / 2, sy - h / 2, w, h); ctx.fillStyle = col; ctx.fillText(txt, sx, sy + 1);
    G.labelRects.push({ x: (sx - w / 2) / R.px, y: (sy - h / 2) / R.px, w: w / R.px, h: h / R.px, gi });
  }
  // names over elites, NPCs, exits
  ctx.font = `700 ${Math.round(11 * s)}px Cinzel, Georgia, serif`;
  for (const e of A.enemies) { if (e.dead || e.sleep || !(e.elite === 1 || e.elite === 2)) continue; if (dist2(e.x, e.y, P.x, P.y) > 100) continue; const [sx, sy] = w2s(e.x, e.y); const ty = sy - (enemySet(e).H * (e.scale || 1) + 14) * R.k; ctx.fillStyle = e.elite === 2 ? '#e8c070' : '#8a9aff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3 * R.px; ctx.strokeText(e.name, sx, ty); ctx.fillText(e.name, sx, ty); const bw = 44 * s; ctx.fillStyle = '#000'; ctx.fillRect(sx - bw / 2, ty + 8 * s, bw, 4 * s); ctx.fillStyle = '#c8302a'; ctx.fillRect(sx - bw / 2, ty + 8 * s, bw * Math.max(0, e.hp / e.maxHp), 4 * s); }
  for (const n of A.npcs) { if (dist2(n.x, n.y, P.x, P.y) > 30) continue; const [sx, sy] = w2s(n.x, n.y); const ty = sy - 70 * R.k; ctx.fillStyle = n.role === 'guide' ? '#ffe8a0' : '#e6e0d4'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3 * R.px; ctx.strokeText(n.name, sx, ty); ctx.fillText(n.name, sx, ty); }
  for (const ex of A.exits) { if (dist2(ex.x, ex.y, P.x, P.y) > 42) continue; const [sx, sy] = w2s(ex.x, ex.y); const ty = sy - 96 * R.k; const lbl = (ex.type === 'cave' ? 'Enter ' : ex.type === 'stairs' ? 'Up to ' : ex.type === 'realm' ? 'Descend to the ' : 'To ') + ex.label; ctx.fillStyle = ex.type === 'realm' ? '#ffe08a' : '#b8d0ff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3 * R.px; ctx.strokeText(lbl, sx, ty); ctx.fillText(lbl, sx, ty); }
  if (A.kind === 'town' && G.portal && G.portal.r === A.r && dist2(A.portalSpot.x, A.portalSpot.y, P.x, P.y) < 30) { const [sx, sy] = w2s(A.portalSpot.x, A.portalSpot.y); ctx.fillStyle = '#b8d0ff'; ctx.strokeText('Portal to ' + REALMS[G.portal.r].areas[G.portal.idx].name, sx, sy - 80 * R.k); ctx.fillText('Portal to ' + REALMS[G.portal.r].areas[G.portal.idx].name, sx, sy - 80 * R.k); }
  // damage numbers
  for (const t of G.texts) { const [sx, sy] = w2s(t.x, t.y); const a = 1 - t.t / (t.big ? 1.1 : 0.8); ctx.globalAlpha = Math.max(0, Math.min(1, a * 1.6)); ctx.font = `700 ${Math.round(t.size * s * (t.big ? 1.1 : 1))}px Cinzel, Georgia, serif`; ctx.lineWidth = 3 * R.px; ctx.strokeStyle = '#000'; ctx.strokeText(t.str, sx, sy - t.z * R.k); ctx.fillStyle = t.col; ctx.fillText(t.str, sx, sy - t.z * R.k); }
  ctx.globalAlpha = 1;
}

/* ---------- minimap & full map ---------- */
function ensureMapCanvas(A) {
  if (A.mapCv && A.mapCv._w === A.w) return; const W = A.w, H = A.h; const c = mkCanvas((W + H) * 2 + 8, (W + H) + 8); c._w = W; A.mapCv = c; A.mapDone = new Uint8Array(W * H);
}
function updateMapCanvas(A) {
  ensureMapCanvas(A); const g = A.mapCv.getContext('2d'); const W = A.w; const ox = A.h * 2 + 4;
  for (let i = 0; i < A.explored.length; i++) { if (!A.explored[i] || A.mapDone[i]) continue; A.mapDone[i] = 1; const x = i % W, y = (i / W) | 0; const v = A.t[i]; if (v === T_VOID) continue; const X = ox + (x - y) * 2, Y = (x + y) + 4;
    if (v === T_FLOOR) { let edge = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const w = tileAt(A, x + dx, y + dy); if (w === T_WALL || w === T_VOID || w === T_PROP) edge = true; } g.fillStyle = edge ? 'rgba(210,190,150,.9)' : 'rgba(120,100,70,.35)'; g.fillRect(X - 1, Y, 2, 1); } else if (v === T_LIQ) { g.fillStyle = 'rgba(80,120,200,.5)'; g.fillRect(X - 1, Y, 2, 1); } }
}
function drawMinimap() {
  const A = G.A, P = G.P; const cv = $('minimap'); if (!cv || !A) return; if (!OPT.minimap) { cv.style.display = 'none'; return; } cv.style.display = '';
  const now = performance.now(); if (now - RENDER.lastMini < 200) return; RENDER.lastMini = now;
  updateMapCanvas(A); const g = cv.getContext('2d'); const W = cv.width, H = cv.height; g.clearRect(0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
  const sc = W / 150 * 1.1; const ox = A.h * 2 + 4; const px = ox + (P.x - P.y) * 2, py = (P.x + P.y) + 4;
  g.save(); g.translate(W / 2, H / 2); g.scale(sc, sc); g.translate(-px, -py); g.imageSmoothingEnabled = false; g.drawImage(A.mapCv, 0, 0);
  const mark = (x, y, col, r) => { g.fillStyle = col; g.beginPath(); g.arc(ox + (x - y) * 2, (x + y) + 4, r, 0, TAU); g.fill(); };
  for (const ex of A.exits) if (A.explored[Math.floor(ex.y) * A.w + Math.floor(ex.x)]) mark(ex.x, ex.y, ex.type === 'gateBoss' ? '#ff5a3a' : ex.type === 'realm' ? '#ffe08a' : '#8ab8ff', 2.4);
  if (A.wp && A.explored[Math.floor(A.wp.y) * A.w + Math.floor(A.wp.x)]) mark(A.wp.x, A.wp.y, '#ffd060', 2.2);
  for (const n of A.npcs) mark(n.x, n.y, '#e8e0c8', 1.6);
  for (const e of A.enemies) if (!e.dead && !e.sleep && (e.elite === 2 || e.boss)) mark(e.x, e.y, '#e8b050', 1.6);
  mark(P.x, P.y, '#ffffff', 2); g.restore();
  g.strokeStyle = 'rgba(140,112,80,.8)'; g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2);
}
function drawFullMap(cv) {
  const A = G.A, P = G.P; updateMapCanvas(A); const g = cv.getContext('2d'); const W = cv.width, H = cv.height; g.clearRect(0, 0, W, H);
  const mw = A.mapCv.width, mh = A.mapCv.height; const sc = Math.min(W / mw, H / mh) * 0.92; g.save(); g.translate(W / 2 - mw * sc / 2, H / 2 - mh * sc / 2); g.scale(sc, sc); g.imageSmoothingEnabled = false; g.drawImage(A.mapCv, 0, 0);
  const ox = A.h * 2 + 4; const mark = (x, y, col, r) => { g.fillStyle = col; g.beginPath(); g.arc(ox + (x - y) * 2, (x + y) + 4, r / sc * 3, 0, TAU); g.fill(); };
  for (const ex of A.exits) if (A.explored[Math.floor(ex.y) * A.w + Math.floor(ex.x)]) mark(ex.x, ex.y, ex.type === 'gateBoss' ? '#ff5a3a' : ex.type === 'realm' ? '#ffe08a' : '#8ab8ff', 2.4);
  if (A.wp && A.explored[Math.floor(A.wp.y) * A.w + Math.floor(A.wp.x)]) mark(A.wp.x, A.wp.y, '#ffd060', 2.2);
  mark(P.x, P.y, '#ffffff', 2.4); g.restore();
}
