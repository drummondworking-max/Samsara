/* ================= world generation ================= */
const T_FLOOR = 0, T_WALL = 1, T_PROP = 2, T_VOID = 3, T_LIQ = 4;
function newGrid(W, H, v) { const a = new Uint8Array(W * H); if (v) a.fill(v); return a; }
function inb(A, x, y) { return x >= 0 && y >= 0 && x < A.w && y < A.h; }
function tileAt(A, x, y) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= A.w || y >= A.h) return T_VOID; return A.t[y * A.w + x]; }
function walkable(A, x, y) { return tileAt(A, x, y) === T_FLOOR; }
function carveDisc(A, cx, cy, r, v = T_FLOOR) { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) { if (x < 2 || y < 2 || x >= A.w - 2 || y >= A.h - 2) continue; if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r) A.t[y * A.w + x] = v; } }
function carveLine(A, x0, y0, x1, y1, r, rnd) { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2); for (let i = 0; i <= n; i++) { const t = i / n; carveDisc(A, lerp(x0, x1, t) + (rnd() - 0.5) * 1.2, lerp(y0, y1, t) + (rnd() - 0.5) * 1.2, r + (rnd() - 0.5) * 1.2); } }
function bfs(A, sx, sy, maxD = 1e9) {
  const W = A.w, H = A.h; const d = new Int32Array(W * H).fill(-1); const q = new Int32Array(W * H); let qh = 0, qt = 0;
  sx = Math.floor(sx); sy = Math.floor(sy); if (!inb(A, sx, sy) || A.t[sy * W + sx] !== T_FLOOR) return d;
  d[sy * W + sx] = 0; q[qt++] = sy * W + sx;
  while (qh < qt) { const i = q[qh++]; const x = i % W, y = (i / W) | 0; const nd = d[i] + 1; if (nd > maxD) continue;
    if (x > 0 && A.t[i - 1] === 0 && d[i - 1] < 0) { d[i - 1] = nd; q[qt++] = i - 1; }
    if (x < W - 1 && A.t[i + 1] === 0 && d[i + 1] < 0) { d[i + 1] = nd; q[qt++] = i + 1; }
    if (y > 0 && A.t[i - W] === 0 && d[i - W] < 0) { d[i - W] = nd; q[qt++] = i - W; }
    if (y < H - 1 && A.t[i + W] === 0 && d[i + W] < 0) { d[i + W] = nd; q[qt++] = i + W; } }
  return d;
}
function floorTiles(A) { const out = []; for (let i = 0; i < A.t.length; i++) if (A.t[i] === T_FLOOR) out.push(i); return out; }
function randomFloor(A, rnd, minFrom, minDist) {
  for (let tries = 0; tries < 400; tries++) { const x = 3 + Math.floor(rnd() * (A.w - 6)), y = 3 + Math.floor(rnd() * (A.h - 6)); if (A.t[y * A.w + x] !== T_FLOOR) continue; if (minFrom && Math.hypot(x - minFrom.x, y - minFrom.y) < minDist) continue; if (A.dist0 && A.dist0[y * A.w + x] < 0) continue; return { x: x + 0.5, y: y + 0.5 }; }
  return null;
}
function clearAround(A, x, y, r) { for (let yy = Math.floor(y - r); yy <= y + r; yy++) for (let xx = Math.floor(x - r); xx <= x + r; xx++) if (inb(A, xx, yy) && (A.t[yy * A.w + xx] === T_PROP || A.t[yy * A.w + xx] === T_LIQ)) A.t[yy * A.w + xx] = T_FLOOR; }

function makeArea(r, idx, seed) {
  const def = REALMS[r].areas[idx]; const rnd = mulberry(seed);
  const A = { key: areaKey(r, idx), r, idx, def, kind: def.kind, cave: def.kind === 'cave', lvl: realmLvl(r, def.d || 0), seed, rnd,
    enemies: [], items: [], golds: [], orbs: [], pots: [], chests: [], shrines: [], npcs: [], exits: [], objs: [], decals: [],
    time: 0, spawnT: 3, surgeT: 80, killed: 0, bossState: 0, paved: def.paved || (def.kind === 'town') || (REALMS[r].pal.paved && def.kind !== 'cave') };
  const cold = !!def.cold; A.pal = realmPal(r, A.cave, cold); A.texMode = realmTexMode(r, A.cave, cold); A.props = A.cave ? (REALMS[r].id === 'naraka' && !cold ? ['obsidian', 'spikes', 'brazier'] : REALMS[r].caveProps) : REALMS[r].props; A.wallStyle = wallStyle(r, A.cave, cold);
  const voidRealm = ['deva', 'asura', 'preta', 'naraka'].includes(REALMS[r].id);
  A.edge = !A.cave && !def.paved && voidRealm ? 'void' : 'wall';
  if (def.kind === 'town') genTown(A); else if (def.kind === 'field') genField(A); else if (def.kind === 'cave') genCave(A); else genBoss(A);
  A.pv = new Uint8Array(A.w * A.h); A.dec = new Uint8Array(A.w * A.h); A.explored = new Uint8Array(A.w * A.h);
  for (let i = 0; i < A.pv.length; i++) { A.pv[i] = Math.floor(rnd() * 250); A.dec[i] = Math.floor(rnd() * 256); }
  reconnect(A);
  A.dist0 = bfs(A, A.start.x, A.start.y);
  // remove unreachable floor
  for (let i = 0; i < A.t.length; i++) if (A.t[i] === T_FLOOR && A.dist0[i] < 0) A.t[i] = A.edge === 'void' ? T_VOID : T_WALL;
  finalizeEdges(A);
  if (def.kind === 'field' || def.kind === 'cave') populate(A);
  A.chunks = new Map();
  return A;
}
function reconnect(A) {
  // props (rocks, trees) must never cut the map apart: open any prop or liquid tile that separates reachable floor from unreachable floor
  const W = A.w, H = A.h;
  for (let it = 0; it < 60; it++) {
    const d = bfs(A, A.start.x, A.start.y); let changed = 0;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; const v = A.t[i]; if (v !== T_PROP && v !== T_LIQ) continue;
      let reach = 0, lost = 0; for (const o of [1, -1, W, -W]) { if (A.t[i + o] !== T_FLOOR) continue; if (d[i + o] >= 0) reach = 1; else lost = 1; }
      if (reach && lost) { A.t[i] = T_FLOOR; changed++; } }
    if (!changed) break;
  }
  // guarantee key points stay on reachable floor
  const d = bfs(A, A.start.x, A.start.y); const pts = [A.end, A.wp, A.center, ...A.exits].filter(Boolean);
  for (const p of pts) { const tx = Math.floor(p.x), ty = Math.floor(p.y); if (inb(A, tx, ty) && d[ty * W + tx] >= 0) continue; let best = null, bd = 1e9; for (let i = 0; i < d.length; i++) if (d[i] >= 0) { const x = i % W, y = (i / W) | 0; const dd = (x - tx) * (x - tx) + (y - ty) * (y - ty); if (dd < bd) { bd = dd; best = [x, y]; } } if (best) carveLine(A, tx + 0.5, ty + 0.5, best[0] + 0.5, best[1] + 0.5, 1.2, A.rnd); }
}
function finalizeEdges(A) {
  const W = A.w, H = A.h;
  // walls/props adjacent to floor keep; far non-floor -> void (not drawn) to save draw work
  const near = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (A.t[y * W + x] !== T_FLOOR && A.t[y * W + x] !== T_LIQ) continue; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (inb(A, xx, yy)) near[yy * W + xx] = 1; } }
  for (let i = 0; i < W * H; i++) if (!near[i] && (A.t[i] === T_WALL || A.t[i] === T_PROP)) A.t[i] = T_VOID;
}
function genField(A) {
  const rnd = A.rnd; const W = A.w = 86 + Math.floor(rnd() * 10), H = A.h = W; A.t = newGrid(W, H, T_VOID);
  const corners = [[8, 8], [W - 9, H - 9], [8, H - 9], [W - 9, 8]];
  const pair = Math.floor(rnd() * 2) ? [0, 1] : [2, 3]; const flip = rnd() < 0.5;
  const s = corners[flip ? pair[1] : pair[0]], e = corners[flip ? pair[0] : pair[1]];
  // meandering main path
  const pts = [s]; const n = 6;
  for (let i = 1; i < n; i++) { const t = i / n; pts.push([clamp(lerp(s[0], e[0], t) + (rnd() - 0.5) * W * 0.55, 8, W - 9), clamp(lerp(s[1], e[1], t) + (rnd() - 0.5) * H * 0.55, 8, H - 9)]); }
  pts.push(e);
  for (let i = 0; i < pts.length - 1; i++) carveLine(A, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 3.2 + rnd() * 1.8, rnd);
  for (const p of pts) carveDisc(A, p[0], p[1], 5 + rnd() * 4);
  // branches with clearings
  A.clearings = [];
  for (let i = 0; i < 7; i++) { const p = pts[1 + Math.floor(rnd() * (pts.length - 2))]; const a = rnd() * TAU, L = 12 + rnd() * 16; const ex = clamp(p[0] + Math.cos(a) * L, 7, W - 8), ey = clamp(p[1] + Math.sin(a) * L, 7, H - 8); carveLine(A, p[0], p[1], ex, ey, 2.2 + rnd() * 1.4, rnd); carveDisc(A, ex, ey, 4 + rnd() * 3); A.clearings.push({ x: ex, y: ey }); }
  // organic widening by noise
  const N = makeNoise(A.seed);
  for (let y = 3; y < H - 3; y++) for (let x = 3; x < W - 3; x++) { if (A.t[y * W + x] === T_FLOOR) continue; let nb = 0; for (let d = 1; d <= 3; d++) { if (A.t[y * W + x - d] === T_FLOOR || A.t[y * W + x + d] === T_FLOOR || A.t[(y - d) * W + x] === T_FLOOR || A.t[(y + d) * W + x] === T_FLOOR) { nb = d; break; } } if (nb && N.fbm(x / 9, y / 9, 3) > 0.45 + nb * 0.04) A.t[y * W + x] = 9; }
  for (let i = 0; i < W * H; i++) if (A.t[i] === 9) A.t[i] = T_FLOOR;
  // obstacles
  const pathMask = new Uint8Array(W * H); for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const m = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let k = 0; k <= m; k++) { const x = Math.round(lerp(x0, x1, k / m)), y = Math.round(lerp(y0, y1, k / m)); for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (inb(A, x + dx, y + dy)) pathMask[(y + dy) * W + x + dx] = 1; } }
  const N2 = makeNoise(A.seed + 5); const liqRealm = { deva: 0.03, human: 0, asura: 0.02, animal: A.def.name === 'Serpent Marsh' ? 0.2 : 0.05, preta: 0, naraka: 0.06 }[REALMS[A.r].id];
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    const i = y * W + x; if (A.t[i] !== T_FLOOR || pathMask[i]) continue;
    const nv = N2.fbm(x / 6, y / 6, 3);
    /* interior obstacles removed: free walking */
  }
  // boundary
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (A.t[i] !== T_VOID) continue; let adj = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (A.t[i + dy * W + dx] === T_FLOOR || A.t[i + dy * W + dx] === T_LIQ) adj = 1; if (adj && A.edge === 'wall') A.t[i] = (A.paved || REALMS[A.r].id === 'animal') ? T_WALL : T_PROP; }
  if (A.edge === 'wall') for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (A.t[i] !== T_VOID) continue; let adj = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const v = A.t[i + dy * W + dx]; if (v === T_WALL || v === T_PROP) adj++; } if (adj >= 2 && rnd() < 0.7) A.t[i] = A.paved ? T_WALL : T_PROP; }
  A.start = { x: s[0] + 0.5, y: s[1] + 0.5 }; A.end = { x: e[0] + 0.5, y: e[1] + 0.5 };
  clearAround(A, s[0], s[1], 3); clearAround(A, e[0], e[1], 3);
  // exits
  const [r, idx] = [A.r, A.idx];
  const back = idx === 1 ? [r, 0] : [r, idx - 1];
  A.exits.push({ x: A.start.x - 1.2, y: A.start.y - 1.2, type: 'gate', to: back, label: REALMS[r].areas[back[1]].name, role: 'back' });
  const nxt = idx === 4 ? [r, 5] : [r, idx + 1];
  A.exits.push({ x: A.end.x + 0.8, y: A.end.y + 0.8, type: idx === 4 ? 'gateBoss' : 'gate', to: nxt, label: REALMS[r].areas[nxt[1]].name, role: 'next' });
  const cl = shuffle(A.clearings.slice());
  for (const key of ['cave', 'cave2']) { if (!A.def[key]) continue; const c = cl.pop() || A.clearings[0]; clearAround(A, c.x, c.y, 2); A.exits.push({ x: Math.floor(c.x) + 0.5, y: Math.floor(c.y) + 0.5, type: 'cave', to: [r, A.def[key]], label: REALMS[r].areas[A.def[key]].name, role: key }); }
  if (A.def.wp) { const c = pts[3]; clearAround(A, c[0], c[1], 2); A.wp = { x: Math.floor(c[0]) + 0.5, y: Math.floor(c[1]) + 0.5 }; }
  for (const ex of A.exits) { const tx = Math.floor(ex.x), ty = Math.floor(ex.y); if (A.t[ty * W + tx] !== T_FLOOR) { carveDisc(A, tx, ty, 1.6); } }
}
function genCave(A) {
  const rnd = A.rnd; const W = A.w = 64, H = A.h = 64; let t;
  for (let attempt = 0; attempt < 12; attempt++) {
    t = newGrid(W, H, T_WALL);
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) t[y * W + x] = rnd() < 0.44 ? T_WALL : T_FLOOR;
    for (let it = 0; it < 5; it++) { const n = t.slice(); for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) { let c = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (t[(y + dy) * W + x + dx] === T_WALL) c++; n[y * W + x] = c >= 5 ? T_WALL : T_FLOOR; } t = n; }
    A.t = t; // largest region
    let best = null, bestN = 0; const seen = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) { if (t[i] !== T_FLOOR || seen[i]) continue; const d = bfs(A, i % W, (i / W) | 0); let c = 0; for (let k = 0; k < W * H; k++) if (d[k] >= 0) { seen[k] = 1; c++; } if (c > bestN) { bestN = c; best = d; } }
    if (bestN > 1100) { for (let k = 0; k < W * H; k++) if (t[k] === T_FLOOR && best[k] < 0) t[k] = T_WALL; break; }
  }
  const fl = floorTiles(A); const s = fl[Math.floor(rnd() * fl.length)];
  let d = bfs(A, s % W, (s / W) | 0); let far = s; for (let i = 0; i < d.length; i++) if (d[i] > d[far]) far = i;
  d = bfs(A, far % W, (far / W) | 0); let far2 = far; for (let i = 0; i < d.length; i++) if (d[i] > d[far2]) far2 = i;
  A.start = { x: far % W + 0.5, y: ((far / W) | 0) + 0.5 }; A.end = { x: far2 % W + 0.5, y: ((far2 / W) | 0) + 0.5 };
  carveDisc(A, A.start.x, A.start.y, 2.5); carveDisc(A, A.end.x, A.end.y, 4);
  /* no cave props */
  clearAround(A, A.start.x, A.start.y, 3); clearAround(A, A.end.x, A.end.y, 4);
  A.exits.push({ x: A.start.x - 0.8, y: A.start.y - 0.8, type: 'stairs', to: [A.r, A.def.back], label: REALMS[A.r].areas[A.def.back].name, role: 'up' });
  A.clearings = []; A.dist0 = bfs(A, A.start.x, A.start.y); for (let i = 0; i < 10; i++) { const q = pickFarFloor(A, 0.25 + i * 0.07); A.clearings.push(q); } A.dist0 = null;
}
function genBoss(A) {
  const rnd = A.rnd; const W = A.w = 46, H = A.h = 46; A.t = newGrid(W, H, T_VOID); const cx = 24, cy = 22;
  carveDisc(A, cx, cy, 16.5); carveLine(A, cx, cy, cx - 16, cy + 18, 2.5, rnd); carveDisc(A, cx - 16, cy + 18, 3.5);
  const wallish = A.edge === 'wall'; if (wallish) for (let i = 0; i < W * H; i++) { if (A.t[i] !== T_VOID) continue; const x = i % W, y = (i / W) | 0; let adj = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inb(A, x + dx, y + dy) && A.t[(y + dy) * W + x + dx] === T_FLOOR) adj = 1; if (adj) A.t[i] = T_WALL; }
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; const x = Math.floor(cx + Math.cos(a) * 14.5), y = Math.floor(cy + Math.sin(a) * 14.5); if (A.t[y * W + x] === T_FLOOR && Math.hypot(x - (cx - 16), y - (cy + 18)) > 6 && Math.abs(a - 2.3) > 0.4 && false) A.t[y * W + x] = T_PROP; }
  A.start = { x: cx - 16 + 0.5, y: cy + 18 + 0.5 }; A.center = { x: cx + 0.5, y: cy + 0.5 };
  A.exits.push({ x: A.start.x - 1.4, y: A.start.y + 0.6, type: 'gate', to: [A.r, 4], label: REALMS[A.r].areas[4].name, role: 'back' });
  A.clearings = [];
}
function genTown(A) {
  const rnd = A.rnd; const W = A.w = 40, H = A.h = 40; A.t = newGrid(W, H, T_VOID); const cx = 20, cy = 20;
  carveDisc(A, cx, cy, 13.5);
  for (let i = 0; i < 5; i++) { const a = rnd() * TAU; carveDisc(A, cx + Math.cos(a) * 9, cy + Math.sin(a) * 9, 5 + rnd() * 2); }
  for (let i = 0; i < W * H; i++) { if (A.t[i] !== T_VOID) continue; const x = i % W, y = (i / W) | 0; let adj = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inb(A, x + dx, y + dy) && A.t[(y + dy) * W + x + dx] === T_FLOOR) adj = 1; if (adj && A.edge === 'wall') A.t[i] = rnd() < 0.5 ? T_PROP : T_WALL; }
  // decorative props around the plaza
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + rnd() * 0.2; const rr = 10.5 + rnd() * 2; const x = Math.floor(cx + Math.cos(a) * rr), y = Math.floor(cy + Math.sin(a) * rr); if (false) A.t[y * W + x] = T_PROP; }
  A.start = { x: cx + 0.5, y: cy + 3.5 }; A.wp = { x: cx + 0.5, y: cy + 0.5 };
  const npcs = [['guide', -3.5, -3], ['merchant', 5, -2], ['smith', -5, 3.5], ['gambler', 3.5, 5.5], ['stash', 1.5, -5.5]];
  for (const [role, dx, dy] of npcs) { clearAround(A, cx + dx, cy + dy, 1); A.t[Math.floor(cy + dy) * W + Math.floor(cx + dx)] = T_FLOOR; A.npcs.push({ role, x: cx + dx + 0.5, y: cy + dy + 0.5, name: role === 'guide' ? REALMS[A.r].guide.name : role === 'stash' ? 'Stash' : REALMS[A.r].npcs[role], t: rnd() * 10 }); }
  // exit gate toward field 1
  const ex = { x: cx + 11.5, y: cy + 11.5 }; carveLine(A, cx, cy, ex.x, ex.y, 2, rnd); clearAround(A, ex.x, ex.y, 2);
  A.exits.push({ x: ex.x + 0.5, y: ex.y + 0.5, type: 'gate', to: [A.r, 1], label: REALMS[A.r].areas[1].name, role: 'next' });
  A.portalSpot = { x: cx - 2.5, y: cy + 3.5 };
  A.clearings = [];
}

/* ---------- population ---------- */
function rollElitePack(A, rnd) { return rnd() < 0.12; }
function populate(A) {
  const rnd = A.rnd; const fl = floorTiles(A); const roster = A.def.roster;
  const nPacks = Math.floor(fl.length / (A.cave ? 95 : 125));
  for (let p = 0; p < nPacks; p++) {
    const pos = randomFloor(A, rnd, A.start, 12); if (!pos) continue;
    const id = roster[Math.floor(rnd() * roster.length)]; const d = E[id];
    const champ = rnd() < 0.1;
    const n = champ ? 3 + Math.floor(rnd() * 2) : d.ai === 'swarm' ? 5 + Math.floor(rnd() * 5) : d.hp > 60 ? 1 + Math.floor(rnd() * 2) : 3 + Math.floor(rnd() * 3);
    for (let k = 0; k < n; k++) spawnEnemy(A, id, pos.x + (rnd() - 0.5) * 2.5, pos.y + (rnd() - 0.5) * 2.5, { elite: champ ? 1 : 0, sleep: 1 });
  }
  // random unique monsters
  const nU = A.cave ? 1 : 1 + Math.floor(rnd() * 2);
  for (let u = 0; u < nU; u++) { const pos = randomFloor(A, rnd, A.start, 20); if (!pos) continue; const id = roster[Math.floor(rnd() * roster.length)]; spawnUnique(A, id, pos.x, pos.y, null); }
  // quest unique / cave boss
  const far = farthestFloor(A);
  if (A.def.quest) { const pos = snapReach(A, ...Object.values(pickFarFloor(A, 0.6))); const U = UNIQ[A.def.quest]; spawnUnique(A, U.base, pos.x, pos.y, A.def.quest); }
  A.end = snapReach(A, A.end.x, A.end.y);
  if (A.def.treasure) { const keeper = spawnUnique(A, pick(roster), A.end.x, A.end.y, null); keeper.name = 'Keeper of ' + A.def.name.replace(/^The /, ''); keeper.hp *= 1.5; keeper.maxHp = keeper.hp; keeper.treasure = 1; for (let i = 0; i < 3; i++) { const q = snapReach(A, A.end.x + rand(-2.5, 2.5), A.end.y + rand(-2.5, 2.5)); A.chests.push({ x: q.x, y: q.y, open: 0, big: 1 }); } for (let i = 0; i < 2; i++) { const pos = randomFloor(A, rnd, A.start, 14); if (pos) spawnUnique(A, pick(roster), pos.x, pos.y, null); } }
  if (A.def.mini) { const U = UNIQ[A.def.mini]; spawnUnique(A, U.base, A.end.x, A.end.y, A.def.mini); if (U.partner) { const q = snapReach(A, A.end.x + 1.5, A.end.y + 1); spawnUnique(A, UNIQ[U.partner].base, q.x, q.y, U.partner); } const q2 = snapReach(A, A.end.x + 2, A.end.y - 1.5); A.chests.push({ x: q2.x, y: q2.y, open: 0, big: 1 }); }
  // chests & shrines in clearings or random spots
  const nChest = A.def.treasure ? 7 + Math.floor(rnd() * 3) : A.cave ? 3 + Math.floor(rnd() * 2) : 2 + Math.floor(rnd() * 3);
  const spots = (A.clearings || []).slice(); shuffle(spots);
  for (let i = 0; i < nChest; i++) { let s = spots.pop() || randomFloor(A, rnd, A.start, 10); if (!s) continue; s = snapReach(A, s.x, s.y); const x = Math.floor(s.x) + 0.5, y = Math.floor(s.y) + 0.5; A.chests.push({ x, y, open: 0, big: rnd() < 0.2 ? 1 : 0 }); }
  const nShr = A.cave ? 1 : 1 + Math.floor(rnd() * 2);
  for (let i = 0; i < nShr; i++) { let s = spots.pop() || randomFloor(A, rnd, A.start, 10); if (!s) continue; s = snapReach(A, s.x, s.y); const x = Math.floor(s.x) + 0.5, y = Math.floor(s.y) + 0.5; A.shrines.push({ x, y, type: pick(Object.keys(SHRINES)), used: 0 }); }
}
function snapReach(A, x, y) {
  const tx = Math.floor(x), ty = Math.floor(y); const ok = (xx, yy) => inb(A, xx, yy) && A.t[yy * A.w + xx] === T_FLOOR && (!A.dist0 || A.dist0[yy * A.w + xx] >= 0);
  if (ok(tx, ty)) return { x, y };
  for (let r = 1; r < 20; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; if (ok(tx + dx, ty + dy)) return { x: tx + dx + 0.5, y: ty + dy + 0.5 }; }
  return { x: A.start.x, y: A.start.y };
}
function farthestFloor(A) { let b = 0; for (let i = 0; i < A.dist0.length; i++) if (A.dist0[i] > A.dist0[b]) b = i; return { x: b % A.w + 0.5, y: ((b / A.w) | 0) + 0.5, d: A.dist0[b] }; }
function pickFarFloor(A, frac) { const far = farthestFloor(A); const cand = []; for (let i = 0; i < A.dist0.length; i++) if (A.dist0[i] >= far.d * frac && A.t[i] === T_FLOOR) cand.push(i); const i = cand[Math.floor(A.rnd() * cand.length)] || 0; return { x: i % A.w + 0.5, y: ((i / A.w) | 0) + 0.5 }; }
const SHRINES = {
  merit: { name: 'Stupa of Merit', col: '#ffd060', desc: 'Experience gained increased', dur: 90 },
  tara: { name: 'Shrine of Tara', col: '#4fd38f', desc: 'Life and mana restored', dur: 0 },
  wrath: { name: 'Shrine of Wrath', col: '#ff5a3a', desc: 'Damage greatly increased', dur: 60 },
  vajra: { name: 'Vajra Shrine', col: '#b8d0ff', desc: 'Damage taken greatly reduced', dur: 60 },
  wind: { name: 'Shrine of Wind', col: '#a8f0e0', desc: 'Movement and casting quickened', dur: 60 },
  fortune: { name: 'Shrine of Fortune', col: '#e8b0ff', desc: 'Magic find greatly increased', dur: 90 }
};

/* ---------- flow field toward the player ---------- */
function computeFlow(A, px, py) {
  const W = A.w, H = A.h; const sx = Math.floor(px), sy = Math.floor(py);
  if (!A.flow) { A.flow = new Int16Array(W * H); A.fq = new Int32Array(W * H); }
  const d = A.flow; d.fill(-1); const q = A.fq; let qh = 0, qt = 0;
  if (!inb(A, sx, sy)) return; const s = sy * W + sx; d[s] = 0; q[qt++] = s; const maxD = 44;
  while (qh < qt) { const i = q[qh++]; const nd = d[i] + 1; if (nd > maxD) continue; const x = i % W;
    if (x > 0 && A.t[i - 1] === 0 && d[i - 1] < 0) { d[i - 1] = nd; q[qt++] = i - 1; }
    if (x < W - 1 && A.t[i + 1] === 0 && d[i + 1] < 0) { d[i + 1] = nd; q[qt++] = i + 1; }
    if (i >= W && A.t[i - W] === 0 && d[i - W] < 0) { d[i - W] = nd; q[qt++] = i - W; }
    if (i < W * (H - 1) && A.t[i + W] === 0 && d[i + W] < 0) { d[i + W] = nd; q[qt++] = i + W; } }
  A.flowX = sx; A.flowY = sy;
}
function flowDir(A, x, y) {
  const W = A.w, d = A.flow; const tx = Math.floor(x), ty = Math.floor(y); if (!inb(A, tx, ty)) return null;
  const i = ty * W + tx; const cur = d[i]; if (cur < 0) return null;
  let best = cur, bx = 0, by = 0;
  const cand = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const [dx, dy] of cand) { const xx = tx + dx, yy = ty + dy; if (!inb(A, xx, yy)) continue; const v = d[yy * W + xx]; if (v < 0) continue; if (dx && dy) { if (A.t[ty * W + xx] !== 0 || A.t[yy * W + tx] !== 0) continue; } if (v < best) { best = v; bx = dx; by = dy; } }
  if (!bx && !by) return null; const tgx = tx + bx + 0.5 - x, tgy = ty + by + 0.5 - y; const l = Math.hypot(tgx, tgy) || 1; return [tgx / l, tgy / l];
}

/* ---------- movement with tile collision ---------- */
function moveCircle(A, e, dx, dy, r) {
  const solid = (x, y) => { const v = tileAt(A, x, y); return v !== T_FLOOR; };
  let nx = e.x + dx; if (solid(nx + Math.sign(dx) * r, e.y - r * 0.7) || solid(nx + Math.sign(dx) * r, e.y + r * 0.7)) nx = e.x;
  let ny = e.y + dy; if (solid(nx - r * 0.7, ny + Math.sign(dy) * r) || solid(nx + r * 0.7, ny + Math.sign(dy) * r)) ny = e.y;
  e.x = nx; e.y = ny;
}
function losClear(A, x0, y0, x1, y1) { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2); for (let i = 1; i < n; i++) { const t = i / n; const v = tileAt(A, lerp(x0, x1, t), lerp(y0, y1, t)); if (v === T_WALL) return false; } return true; }
