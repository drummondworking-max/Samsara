/* ================= game flow: areas, player, pickups, interaction ================= */
G.hazards = []; G.frame = 0; G.vendor = {}; G.eclipse = 0;
function makePlayer(x, y) {
  const S = charStats(G.C);
  G.P = { x, y, r: 0.35, hp: S.lifeMax, mp: S.manaMax, S, face: 1, anim: 0, moving: 0, cd: {}, cdMax: {}, noMana: {}, auraT: {}, invT: 1.5, hurtT: 0, castT: 0, vx: 0, vy: 0, potCd: 0, exitArmed: 0, chillT: 0 };
}
function refreshStats() { const C = G.C; if (!C) return; C._dirty = 1; const S = charStats(C); if (G.P) { G.P.S = S; G.P.hp = Math.min(G.P.hp, S.lifeMax); G.P.mp = Math.min(G.P.mp, S.manaMax); announceSynergies(S); } }
function gainXP(amt) {
  const C = G.C; if (C.level >= 70) return; C.xp += amt;
  while (C.level < 70 && C.xp >= xpNext(C.level)) { C.xp -= xpNext(C.level); C.level++; C.statPts += 5; C.skillPts++; onLevelUp(); }
}
function onLevelUp() {
  const C = G.C, P = G.P; AU.play('levelup', 1); toast('Level ' + C.level, 'You have new attribute and skill points', 3.5);
  addFx({ type: 'pillar', x: P.x, y: P.y, life: 1.2, col: '#ffe08a', big: 1 }); for (let i = 0; i < 30; i++) addPart(P.x + rand(-0.6, 0.6), P.y + rand(-0.6, 0.6), rand(0, 30), 0, 0, rand(40, 90), '#ffe8a0', rand(1, 1.8), 'mote');
  refreshStats(); P.hp = P.S.lifeMax; P.mp = P.S.manaMax; UI.points(); saveChar(C);
}

/* ---------- areas ---------- */
function loadArea(r, idx, arrive, pos, silent) {
  const C = G.C; const key = areaKey(r, idx);
  if (!G.built) G.built = {}; if (G.builtRealm !== r) { for (const k in ART.cre) if (!k.startsWith('hero_') && !k.startsWith('m_')) delete ART.cre[k]; G.built = {}; G.builtRealm = r; }
  if (!G.built[r]) { G.built[r] = 1; prebuildRealm(r); }
  creSet('hero_' + C.cls, HERO_LOOK[C.cls]);
  let A = G.areas[key]; if (!A) { A = makeArea(r, idx, hashStr(G.seed + ':' + key)); G.areas[key] = A; }
  if (G.A && G.A !== A) { G.A.chunks.clear(); }
  G.A = A; G.realmIdx = r; C.realm = r; C.area = idx;
  G.proj.length = G.eproj.length = G.fx.length = G.zones.length = G.orbits.length = G.teles.length = G.rains.length = G.beams.length = G.mines.length = G.sentries.length = G.hazards.length = 0;
  G.boss = null; $('bossbar').hidden = true; G.eclipse = 0; A.flow = null;
  if (A.kind === 'boss' && A.bossState === 1) { A.enemies = A.enemies.filter(e => !e.boss); A.bossState = 0; }
  // arrival point
  let p = null;
  if (arrive === 'pos' && pos) p = pos;
  else if (arrive === 'wp' && A.wp) p = nearFloor(A, A.wp.x, A.wp.y + 1.6);
  else if (arrive === 'portal' && A.portalSpot) p = nearFloor(A, A.portalSpot.x + 1.5, A.portalSpot.y + 0.5);
  else if (arrive && arrive.from) { const ex = A.exits.find(e => e.to && e.to[0] === arrive.from[0] && e.to[1] === arrive.from[1]); if (ex) p = nearFloor(A, ex.x, ex.y, 2); }
  else if (arrive) { const ex = A.exits.find(e => e.role === arrive); if (ex) p = nearFloor(A, ex.x, ex.y, 2); }
  if (!p) p = { x: A.start.x, y: A.start.y };
  if (!G.P) makePlayer(p.x, p.y); else { G.P.x = p.x; G.P.y = p.y; G.P.invT = 1.2; G.P.exitArmed = 0; G.P.pull = null; G.P.moveTo = null; }
  for (const m of G.minions) { m.x = p.x + rand(-1, 1); m.y = p.y + rand(-1, 1); if (!walkable(A, m.x, m.y)) { m.x = p.x; m.y = p.y; } m.tgt = null; }
  refreshStats();
  if (A.kind === 'town') { G.P.hp = G.P.S.lifeMax; G.P.mp = G.P.S.manaMax; genVendors(); }
  if (A.wp) C.wps[key] = C.wps[key] || (A.kind === 'town' ? 1 : C.wps[key]);
  AU.setMusic(A.kind === 'town' ? 'town' : REALMS[r].id);
  G.cam.x = isoX(G.P.x, G.P.y); G.cam.y = isoY(G.P.x, G.P.y);
  hashBuild(A); computeFlow(A, G.P.x, G.P.y);
  UI.areaName(); if (!silent) { toast(A.def.name, A.kind === 'town' ? REALMS[r].name + ' · Sanctuary' : `${REALMS[r].name} · Monster level ${A.lvl}`, 3, 'area'); }
  RENDER.minimapDirty = 1; saveChar(C);
}
function nearFloor(A, x, y, rad = 1.8) {
  if (walkable(A, x, y) && rad < 0.1) return { x, y };
  for (let r = rad; r < rad + 4; r += 0.5) for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + r; const xx = x + Math.cos(a) * r, yy = y + Math.sin(a) * r; if (walkable(A, xx, yy) && walkable(A, xx + 0.3, yy) && walkable(A, xx, yy + 0.3) && walkable(A, xx - 0.3, yy) && walkable(A, xx, yy - 0.3)) return { x: xx, y: yy }; }
  return walkable(A, x, y) ? { x, y } : null;
}
function useExit(ex) {
  const C = G.C; AU.play('portal', 0.6);
  if (ex.type === 'realm') { const [r] = ex.to; C.realmSeen[r] = 1; fadeTo(() => { showRealmIntro(r, () => { loadArea(r, 0, 'wp'); }); }); return; }
  if (ex.type === 'portalBack') { const pt = G.portal; G.portal = null; fadeTo(() => loadArea(pt.r, pt.idx, 'pos', { x: pt.x, y: pt.y })); return; }
  const [r, idx] = ex.to; const from = [G.A.r, G.A.idx];
  fadeTo(() => loadArea(r, idx, { from }));
}
function fadeTo(fn) { const f = $('fade'); f.classList.add('on'); G.state = 'fading'; setTimeout(() => { try { fn(); } catch (err) { console.error(err); } if (G.state === 'fading') G.state = 'play'; setTimeout(() => f.classList.remove('on'), 60); }, 320); }
function usePortal() {
  const A = G.A; if (!A || G.state !== 'play') return;
  if (A.kind === 'town') { if (G.portal && G.portal.r === A.r) useExit({ type: 'portalBack' }); else toast('There is no portal to return through'); return; }
  if (G.boss) { toast('No portal opens while a realm lord stands before you', null, 2.5); AU.play('error', 0.6); return; }
  G.portal = { r: A.r, idx: A.idx, x: G.P.x, y: G.P.y }; AU.play('portal', 1); addFx({ type: 'pillar', x: G.P.x, y: G.P.y, life: 0.6, col: '#6aa8ff' });
  fadeTo(() => loadArea(A.r, 0, 'portal'));
}
function travelWP(r, idx) { UI.close(); fadeTo(() => loadArea(r, idx, 'wp')); }

/* ---------- player update ---------- */
function inputVector() {
  let ix = 0, iy = 0; const K = G.keys;
  if (K.KeyW || K.ArrowUp) iy -= 1; if (K.KeyS || K.ArrowDown) iy += 1; if (K.KeyA || K.ArrowLeft) ix -= 1; if (K.KeyD || K.ArrowRight) ix += 1;
  if (ix || iy) { G.P.moveTo = null; const l = Math.hypot(ix, iy); return [ix / l, iy / l, 1]; }
  if (G.joy && G.joy.active) { const l = Math.hypot(G.joy.vx, G.joy.vy); if (l > 0.12) { G.P.moveTo = null; return [G.joy.vx / l, G.joy.vy / l, Math.min(1, l)]; } }
  if (G.mouse.down && G.mouse.hold) { const sx = G.mouse.x - innerWidth / 2, sy = G.mouse.y - (innerHeight / 2 - 20 * RENDER.zoom); const l = Math.hypot(sx, sy); if (l > 14) { G.P.moveTo = null; return [sx / l, sy / l, 1]; } }
  return null;
}
function updatePlayer(dt) {
  const P = G.P, S = P.S, A = G.A, C = G.C;
  P.anim += dt; P.invT -= dt; P.hurtT -= dt; P.castT -= dt; P.potCd -= dt; if (P.chillT > 0) P.chillT -= dt;
  leechBudget = Math.min(S.lifeMax * 0.2, leechBudget + S.lifeMax * 0.2 * dt);
  let v = inputVector(); let wx = 0, wy = 0;
  if (v) { const w = screenToWorldVec(v[0], v[1]); const l = Math.hypot(w[0], w[1]); wx = w[0] / l * v[2]; wy = w[1] / l * v[2]; }
  else if (P.moveTo) { const dx = P.moveTo.x - P.x, dy = P.moveTo.y - P.y; const d = Math.hypot(dx, dy); if (d < 0.5) { const mt = P.moveTo; P.moveTo = null; if (mt.onArrive) mt.onArrive(); } else { wx = dx / d; wy = dy / d; } }
  let spd = 4.3 * S.moveMul * (G.buffs.wrathful ? 1 + G.buffs.wrathful.move / 100 : 1) * (G.buffs.skydance ? 1 + G.buffs.skydance.move / 100 : 1) * (G.buffs.wind ? 1.25 : 1) * (P.chillT > 0 ? 0.6 : 1);
  if (A.kind === 'town') spd *= 1.15;
  P.vx = wx * spd; P.vy = wy * spd;
  let mx = P.vx * dt, my = P.vy * dt;
  if (P.pull) { P.pull.t -= dt; const a = angTo(P.x, P.y, P.pull.x, P.pull.y); mx += Math.cos(a) * P.pull.f * dt; my += Math.sin(a) * P.pull.f * dt; if (P.pull.t <= 0) P.pull = null; }
  if (mx || my) { moveCircle(A, P, mx, my, P.r); const sx = wx - wy; if (Math.abs(sx) > 0.05) P.face = sx > 0 ? 1 : -1; P.moving = !!(wx || wy); } else P.moving = 0;
  // regen
  P.hp = Math.min(S.lifeMax, P.hp + S.lifeRegenPS * dt); P.mp = Math.min(S.manaMax, P.mp + S.manaRegenPS * dt);
  if (P.healOT) { P.hp = Math.min(S.lifeMax, P.hp + P.healOT.rate * dt); P.healOT.t -= dt; if (P.healOT.t <= 0) P.healOT = null; }
  if (P.manaOT) { P.mp = Math.min(S.manaMax, P.mp + P.manaOT.rate * dt); P.manaOT.t -= dt; if (P.manaOT.t <= 0) P.manaOT = null; }
  // explore reveal
  P.revT = (P.revT || 0) - dt; if (P.revT <= 0) { P.revT = 0.25; const R = 10; const px = Math.floor(P.x), py = Math.floor(P.y); for (let y = py - R; y <= py + R; y++) for (let x = px - R; x <= px + R; x++) if (inb(A, x, y) && (x - px) * (x - px) + (y - py) * (y - py) <= R * R && !A.explored[y * A.w + x]) { A.explored[y * A.w + x] = 1; RENDER.minimapDirty = 1; } }
  updatePickups(dt); updateInteract();
}
function pickFilter(it) { const m = OPT.pickup; if (it.gem || it.qitem) return m !== 'none'; if (m === 'all') return true; if (m === 'magic') return it.rar >= 1; if (m === 'rare') return it.rar === 2 || it.rar === 3; return false; }
function pickUp(gi) {
  const C = G.C, A = G.A; if (!invAdd(C, gi.it)) { if ((G.fullT || 0) < G.t) { toast('Your inventory is full', null, 1.5); G.fullT = G.t + 3; AU.play('error', 0.5); } return false; }
  A.items.splice(A.items.indexOf(gi), 1); AU.play('pickup', 0.6); addText(G.P.x, G.P.y, gi.it.name, { 0: '#e6e0d4', 1: '#7b86ff', 2: '#f0dc5a', 3: '#cfae6c', 5: '#aaa' }[gi.it.rar] || '#fff', 11); UI.invDirty(); return true;
}
function updatePickups(dt) {
  const P = G.P, S = P.S, A = G.A, C = G.C; const R2 = S.pickR * S.pickR;
  for (let i = A.orbs.length - 1; i >= 0; i--) { const o = A.orbs[i]; o.t += dt; const d2 = dist2(o.x, o.y, P.x, P.y); if (d2 < R2 || o.mag) { o.mag = 1; const d = Math.sqrt(d2) || 0.01; const sp = (6 + o.t * 6) * dt; o.x += (P.x - o.x) / d * Math.min(d, sp); o.y += (P.y - o.y) / d * Math.min(d, sp); if (d < 0.35) { gainXP(o.xp); A.orbs.splice(i, 1); AU.play('orb', 0.6); } } }
  for (let i = A.golds.length - 1; i >= 0; i--) { const o = A.golds[i]; o.t += dt; const d2 = dist2(o.x, o.y, P.x, P.y); if (d2 < R2 * 0.8 || o.mag) { o.mag = 1; const d = Math.sqrt(d2) || 0.01; const sp = (5 + o.t * 3) * dt; o.x += (P.x - o.x) / d * Math.min(d, sp); o.y += (P.y - o.y) / d * Math.min(d, sp); if (d < 0.4) { C.gold += o.amt; A.golds.splice(i, 1); AU.play('coin', 0.6); addText(P.x, P.y, '+' + o.amt, '#f0c040', 11); } } }
  for (let i = A.pots.length - 1; i >= 0; i--) { const o = A.pots[i]; o.t += dt; if (dist2(o.x, o.y, P.x, P.y) < 0.8 && C.pots[o.kind] < S.potMax) { C.pots[o.kind]++; A.pots.splice(i, 1); AU.play('pickup', 0.6); } }
  for (let i = A.items.length - 1; i >= 0; i--) { const gi = A.items[i]; gi.t += dt; if (gi.t < 0.5) continue; if (dist2(gi.x, gi.y, P.x, P.y) < 0.64 && (pickFilter(gi.it) || (P.moveTo && P.moveTo.item === gi))) pickUp(gi); }
  for (const c of A.chests) if (!c.open && dist2(c.x, c.y, P.x, P.y) < 0.8) openChest(c);
  for (const s of A.shrines) if (!s.used && dist2(s.x, s.y, P.x, P.y) < 0.8) useShrine(s);
  // exits
  let minD = 99; for (const ex of A.exits) { const d = Math.sqrt(dist2(ex.x, ex.y, P.x, P.y)); minD = Math.min(minD, d); if (d < 0.85 && P.exitArmed && G.state === 'play') { useExit(ex); return; } }
  if (A.kind === 'town' && G.portal && G.portal.r === A.r) { const d = Math.sqrt(dist2(A.portalSpot.x, A.portalSpot.y, P.x, P.y)); minD = Math.min(minD, d); if (d < 0.8 && P.exitArmed) { useExit({ type: 'portalBack' }); return; } }
  if (minD > 1.3) P.exitArmed = 1;
  if (A.kind === 'boss' && A.bossState === 0 && dist2(P.x, P.y, A.center.x, A.center.y) < 121) spawnBoss(A);
}
function openChest(c) {
  const A = G.A, C = G.C, S = G.P.S; c.open = 1; AU.play('drop_magic', 1); AU.play('coin', 0.8);
  /* chests hold gold and potions only; gear comes from bosses and vendors */
  for (let i = 0; i < (c.big ? 5 : 2); i++) A.golds.push({ x: c.x + rand(-1, 1), y: c.y + rand(-1, 1), amt: Math.round(A.lvl * rand(6, 13) * (1 + S.gf / 100)), t: 0 });
  if (Math.random() < 0.5) A.pots.push({ x: c.x + rand(-1, 1), y: c.y + rand(-1, 1), kind: pick(['hp', 'mp', 'hp']), t: 0 });
}
function useShrine(s) {
  const P = G.P, S = P.S; s.used = 1; const D = SHRINES[s.type]; AU.play('shrine', 1); toast(D.name, D.desc, 3);
  addFx({ type: 'pillar', x: s.x, y: s.y, life: 1, col: D.col, big: 1 });
  if (s.type === 'tara') { P.hp = S.lifeMax; P.mp = S.manaMax; healAll(100); } else G.buffs[s.type] = { t: D.dur };
}

/* ---------- interaction (NPCs & waypoints) ---------- */
function updateInteract() {
  const P = G.P, A = G.A; let best = null, bd = 2.6;
  for (const n of A.npcs) { const d = Math.sqrt(dist2(n.x, n.y, P.x, P.y)); if (d < bd) { bd = d; best = { kind: 'npc', n }; } }
  if (A.wp) { const d = Math.sqrt(dist2(A.wp.x, A.wp.y, P.x, P.y)); if (d < 1.8 && d < bd) { best = { kind: 'wp' }; if (!G.C.wps[A.key]) { G.C.wps[A.key] = 1; toast('Waypoint discovered', A.def.name, 2.5); AU.play('bell', 1); saveChar(G.C); } } }
  G.interact = best; UI.interact(best);
}
function doInteract() {
  const it = G.interact; if (!it || G.state !== 'play') return;
  if (it.kind === 'wp') UI.open('waypoint');
  else if (it.n.role === 'stash') UI.open('stash'); else UI.open('npc', it.n);
}

/* ---------- quests ---------- */
function questKill(uk) {
  const U = UNIQ[uk]; if (!U || !U.quest) return; const C = G.C; const q = QMAP[U.quest]; if ((C.quests[q.id] || 0) >= 2) return;
  C.quests[q.id] = 2; AU.play('quest', 1); toast('Quest complete: ' + q.name, 'Return to ' + REALMS[q.realm].guide.name, 5);
  if (U.drop) setTimeout(() => toast('You have taken ' + U.drop, null, 3), 1200);
  UI.points(); saveChar(C);
}
function claimQuest(q) {
  const C = G.C; const R = q.reward; if (C.quests[q.id] !== 2) return;
  C.quests[q.id] = 3; AU.play('quest', 1);
  if (R.skill) { C.skillPts += R.skill; C.qSkill += R.skill; } if (R.stat) { C.statPts += R.stat; C.qStat += R.stat; }
  if (R.life) C.bonus.life += R.life; if (R.res) C.bonus.res += R.res; if (R.imbue) C.imbue = 1;
  if (R.item) { const it = genItem(C.level + 3, { rar: 3, cls: C.cls }); if (!invAdd(C, it)) spawnGroundItem(it, G.P.x, G.P.y); toast('Received: ' + it.name); }
  refreshStats(); UI.points(); saveChar(C);
}

/* ---------- vendors ---------- */
function vendorLvl() { return Math.max(1, Math.min(G.C.level + 1, realmLvl(G.realmIdx, 9))); }
function genVendors() {
  const L = vendorLvl(); const C = G.C; const mk = (n, slots, magicP) => { const out = []; for (let i = 0; i < n; i++) { const slot = pick(slots); const r = Math.random(); const rar = r < 0.14 ? 2 : r < magicP ? 1 : 0; out.push(genItem(L - randi(0, 3), { slot, rar, cls: C.cls })); } return out; };
  G.vendor.merchant = mk(14, ['neck', 'ring', 'offhand', 'waist', 'weapon'], 0.8);
  G.vendor.smith = mk(18, ['weapon', 'weapon', 'head', 'body', 'hands', 'feet', 'offhand', 'waist'], 0.65);
  G.vendor.gems = [genGem(L), genGem(L), genGem(L), genGem(L)]; G.vendor.merchant.push(...G.vendor.gems);
  for (let i = 0; i < 3; i++) { const it = genItem(L - randi(0, 3), { slot: pick(['weapon', 'body', 'head', 'offhand']), rar: 0 }); it.rar = 5; it.sockets = randi(1, MAX_SOCK[it.slot]); it.gems = []; G.vendor.smith.push(it); }
}
function potPrice(k) { const L = G.C.level; return k === 'rej' ? 150 + L * 20 : 18 + L * 5; }
function gamblePrice(slot) { const L = G.C.level; return Math.round((80 + L * L * 1.6) * (slot === 'neck' || slot === 'ring' ? 1.8 : 1)); }
function gamble(slot) {
  const C = G.C; const price = gamblePrice(slot); if (C.gold < price) { AU.play('error'); return null; } if (!invFree(C)) { toast('Your inventory is full'); return null; }
  const r = Math.random(); const rar = r < 0.035 ? 3 : r < 0.16 ? 2 : 1;
  const it = genItem(C.level + randi(-2, 4), { slot, rar, cls: C.cls }); C.gold -= price; invAdd(C, it); AU.play(it.rar === 3 ? 'drop_unique' : it.rar === 2 ? 'drop_rare' : 'coin', 1); saveChar(C); return it;
}
function socketPrice(it) { return Math.round(200 + it.ilvl * it.ilvl * 4); }
function imbueItem(it) {
  const C = G.C; if (!C.imbue || it.rar !== 0 && it.rar !== 5) return false; const b = BASES[it.base];
  const n = genItem(Math.max(it.ilvl, C.level + 4), { base: b.id, rar: 2, cls: C.cls }); n.def = it.def; Object.assign(it, { rar: 2, name: n.name, mods: n.mods, req: n.req, sockets: 0, gems: [] });
  C.imbue = 0; C._dirty = 1; AU.play('drop_rare', 1); toast('Cunda works the ' + b.name, 'It becomes ' + it.name); saveChar(C); return true;
}
function respecCost() { return 100 + G.C.level * G.C.level * 8; }

/* ---------- death ---------- */
function playerDie() {
  const C = G.C, P = G.P; if (P.dead) return; P.dead = 1; P.hp = 0; C.deaths++;
  const lose = Math.floor(C.gold * 0.1); C.gold -= lose; G.state = 'dead'; AU.play('die_big', 1); AU.setMusic('cine');
  if (G.A.kind === 'boss' && G.A.bossState === 1) { delete G.areas[G.A.key]; }
  G.minions.length = 0; UI.death(lose); saveChar(C);
}
function respawn() {
  const P = G.P; P.dead = 0; G.state = 'play'; G.buffs = {}; UI.panel = null; $('layer').hidden = true; $('layer').innerHTML = '';
  const r = G.realmIdx; fadeTo(() => { loadArea(r, 0, 'wp'); P.hp = P.S.lifeMax; P.mp = P.S.manaMax; });
}

/* ---------- main update ---------- */
function update(dt) {
  if (G.state !== 'play' || !G.A) return;
  const C = G.C, A = G.A; G.t += dt; G.frame++; C.time += dt;
  if (G.eclipse > 0 && !(G.boss && G.boss.id === 'mara')) G.eclipse -= dt;
  A.time += 0; // tracked in director
  hashBuild(A);
  updatePlayer(dt); if (G.state !== 'play') return;
  updateEnemies(dt);
  hashBuild(A);
  updatePlayerSkills(dt); updateEffects(dt); updateMinions(dt); updateEnemyStuff(dt); updateDirector(dt);
  for (const n of A.npcs) n.t += dt;
  // particles & texts
  for (let i = G.parts.length - 1; i >= 0; i--) { const p = G.parts[i]; p.t += dt; if (p.t > p.life) { G.parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.type === 'spark') p.vz -= 160 * dt; else if (p.type === 'smoke') p.vz *= 0.98; if (p.z < 0) { p.z = 0; p.vz *= -0.3; } }
  for (let i = G.texts.length - 1; i >= 0; i--) { const t = G.texts[i]; t.t += dt; t.z += t.vz * dt; t.vz -= 50 * dt; if (t.t > (t.big ? 1.1 : 0.8)) G.texts.splice(i, 1); }
  if (G.flashT > 0) G.flashT -= dt; if (G.cam.shake > 0) G.cam.shake = Math.max(0, G.cam.shake - dt * 30);
  G.saveT = (G.saveT || 0) + dt; if (G.saveT > 20) { G.saveT = 0; saveChar(C); }
}

/* ---------- start / continue a game ---------- */
function startGame(C) {
  G.C = C; G.seed = randi(1, 1e9); G.areas = {}; G.minions = []; G.buffs = {}; G.portal = null; G.P = null; G.state = 'play';
  $('screen').hidden = true; $('screen').innerHTML = ''; $('hud').hidden = false;
  UI.buildHUD();
  const r = C.realm || 0; const idx = C.wps[areaKey(r, C.area)] ? C.area : 0;
  loadArea(r, idx, idx === 0 ? 'wp' : 'wp');
  if (!C.realmSeen[r]) { C.realmSeen[r] = 1; G.state = 'panel'; showRealmIntro(r, () => { G.state = 'play'; if (!C.seenTut) showTutorial(C, () => setTimeout(() => guideHint(), 400)); else setTimeout(() => guideHint(), 600); }); }
}
function guideHint() {
  const A = G.A; if (!(A.kind === 'town' && G.C.level <= 2 && G.realmIdx === 0)) return;
  const touch = matchMedia('(pointer:coarse)').matches;
  toast(touch ? 'Drag anywhere to walk' : 'Walk with WASD, the arrow keys, or by holding the mouse', 'Your skills cast themselves at nearby enemies', 5);
  setTimeout(() => toast('Speak with ' + REALMS[0].guide.name, touch ? 'Walk close and tap Talk' : 'Walk close and press E', 5), 5200);
}
