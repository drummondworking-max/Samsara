/* ================= combat core ================= */
const G = {
  state: 'title', C: null, P: null, A: null, areas: {}, realmIdx: 0, t: 0, paused: 0, speed: 1,
  proj: [], eproj: [], fx: [], parts: [], texts: [], zones: [], orbits: [], minions: [], sentries: [], mines: [], teles: [], rains: [], beams: [],
  buffs: {}, keys: {}, joy: null, mouse: { down: 0, x: 0, y: 0 }, cam: { x: 0, y: 0, shake: 0 }, seed: 1, portal: null, labelRects: [], boss: null, flashT: 0, flashCol: '#fff'
};
const OPT = Object.assign({ music: 0.55, sfx: 0.8, dmgNums: 1, autoPot: 1, pickup: 'magic', quality: 'high', shake: 1, minimap: 1 }, Store.get('wos_opt', {}));
function saveOpt() { Store.set('wos_opt', OPT); }

/* ---------- spatial hash ---------- */
const HASH = { cs: 2, w: 0, h: 0, head: null, next: null };
function hashBuild(A) {
  const cs = HASH.cs, w = Math.ceil(A.w / cs), h = Math.ceil(A.h / cs);
  if (HASH.w !== w || HASH.h !== h || !HASH.head) { HASH.w = w; HASH.h = h; HASH.head = new Int32Array(w * h); }
  HASH.head.fill(-1); const L = A.enemies; if (!HASH.next || HASH.next.length < L.length) HASH.next = new Int32Array(Math.max(1024, L.length * 2));
  for (let i = 0; i < L.length; i++) { const e = L[i]; if (e.dead || e.sleep) continue; const cx = clamp((e.x / cs) | 0, 0, w - 1), cy = clamp((e.y / cs) | 0, 0, h - 1); const c = cy * w + cx; HASH.next[i] = HASH.head[c]; HASH.head[c] = i; }
}
function hashQuery(x, y, r, fn) {
  const cs = HASH.cs, w = HASH.w, h = HASH.h; if (!HASH.head) return; const L = G.A.enemies; const pad = r + 1.5;
  const x0 = clamp(((x - pad) / cs) | 0, 0, w - 1), x1 = clamp(((x + pad) / cs) | 0, 0, w - 1), y0 = clamp(((y - pad) / cs) | 0, 0, h - 1), y1 = clamp(((y + pad) / cs) | 0, 0, h - 1);
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { let i = HASH.head[cy * w + cx]; while (i >= 0) { const e = L[i]; if (e && !e.dead) { const dx = e.x - x, dy = e.y - y, rr = r + e.r; if (dx * dx + dy * dy <= rr * rr) { if (fn(e) === true) return; } } i = HASH.next[i]; } }
}
function nearestEnemy(x, y, range, exclude) { let best = null, bd = 1e9; hashQuery(x, y, range, e => { if (exclude && exclude.includes(e)) return; if (e.inv) return; const d = dist2(x, y, e.x, e.y); if (d < bd) { bd = d; best = e; } }); return best; }
function enemiesNear(x, y, r) { const out = []; hashQuery(x, y, r, e => { if (!e.inv) out.push(e); }); return out; }
function clusterTarget(x, y, range) {
  const list = enemiesNear(x, y, range); if (!list.length) return null; if (list.length === 1) return list[0];
  list.sort((a, b) => dist2(x, y, a.x, a.y) - dist2(x, y, b.x, b.y)); const cand = list.slice(0, 14); let best = cand[0], bn = -1;
  for (const c of cand) { let n = 0; for (const o of list) if (dist2(c.x, c.y, o.x, o.y) < 5) n++; if (n > bn) { bn = n; best = c; } } return best;
}

/* ---------- enemies ---------- */
let EUID = 1;
function lookFor(id) { return E[id].look; }
function spawnEnemy(A, id, x, y, o = {}) {
  const d = E[id]; const L = o.lvl || A.lvl; const sc = monScale(L);
  const e = { uid: EUID++, id, d, x, y, lvl: L, hp: d.hp * sc.hp * (o.hpMul || 1), dmg: d.dmg * sc.dmg * (o.dmgMul || 1), spd: d.spd * (0.92 + Math.random() * 0.16), r: d.r * (o.scale || 1), xp: d.xp * sc.xp,
    ai: o.ai || d.ai, fly: d.fly, atk: o.atk || d.atk, elite: o.elite || 0, mods: o.mods || [], name: o.name || d.name, res: Object.assign({}, d.res), atkCd: rand(0.6, 1.8), t: rand(0, 10),
    face: 1, frame: 0, hitT: 0, slowT: 0, slowAmt: 0, burnDps: 0, burnT: 0, stunT: 0, rootT: 0, fearT: 0, curseT: 0, curseAmt: 0, kx: 0, ky: 0, sleep: o.sleep || 0, spawned: o.spawned || 0,
    scale: o.scale || 1, lookKey: o.lookKey || id, elem: d.elem || 'phys', chargeT: 0, chargeCd: rand(1, 3), atkAnim: 0, tgtT: 0 };
  if (e.elite === 1) { e.hp *= 3; e.dmg *= 1.4; e.spd *= 1.12; e.xp *= 3; e.name = 'Champion ' + d.name; }
  if (e.elite === 3) { e.hp *= 1.6; e.xp *= 1.5; }
  for (const m of e.mods) applyEliteMod(e, m);
  e.maxHp = e.hp; A.enemies.push(e); return e;
}
function applyEliteMod(e, m) {
  if (m === 'strong') e.dmg *= 1.6; if (m === 'fast') { e.spd *= 1.4; } if (m === 'fire_ench') { e.res.fire = 75; } if (m === 'cold_ench') { e.res.cold = 75; }
  if (m === 'light_ench') e.res.light = 75; if (m === 'multishot' && e.atk) e.atk = Object.assign({}, e.atk, { n: (e.atk.n || 1) + 2, spread: 0.5 });
}
function spawnUnique(A, baseId, x, y, uk) {
  const U = uk ? UNIQ[uk] : null; const d = E[baseId];
  let mods = U ? U.mods.slice() : shuffle(Object.keys(ELITE_MODS).filter(m => m !== 'multishot' || d.atk)).slice(0, 2);
  const name = U ? U.name : `${pick(UNAME_A)} ${pick(UNAME_B)}`;
  const e = spawnEnemy(A, baseId, x, y, { elite: 2, hpMul: U ? U.hpMul : 4.5, dmgMul: 1.45, name, mods, scale: U ? U.scale : 1.3, sleep: 1, atk: U && U.atk ? U.atk : undefined, lookKey: U && U.look ? 'u_' + uk : baseId });
  if (U && U.look) { buildCreature('u_' + uk, U.look); }
  e.xp *= U ? 14 : 7; e.uniq = uk || null;
  const mid = U ? U.minions : baseId; const n = U ? (U.minions ? 5 : 0) : randi(3, 5);
  for (let i = 0; i < n; i++) { const q = snapReach(A, x + rand(-2, 2), y + rand(-2, 2)); const m = spawnEnemy(A, mid, q.x, q.y, { elite: 3, sleep: 1, dmgMul: mods.includes('aura_might') ? 1.5 : 1 }); m.leader = e; }
  return e;
}
function wakeAround(x, y, r) { for (const e of G.A.enemies) if (e.sleep && dist2(x, y, e.x, e.y) < r * r) e.sleep = 0; }

/* ---------- damage to enemies ---------- */
function rollDmg(d, S, crit) { let v = d[0] + Math.random() * (d[1] - d[0]); let c = false; if (Math.random() * 100 < (crit != null ? crit : S.critC)) { v *= S.critM; c = true; } return [v, c]; }
let leechBudget = 0;
function hitEnemy(e, amt, elem, o = {}) {
  if (e.dead || e.inv) return 0; const S = G.P.S;
  let res = (e.res[elem] || 0); if (res >= 100) { if (Math.random() < 0.15) addText(e.x, e.y, 'Immune', '#aaa', 11); return 0; }
  res = Math.max(-50, res - (S.resPierce || 0));
  let d = amt * (1 - res / 100); if (e.curseT > 0) d *= 1 + e.curseAmt / 100; if (e.mods.includes('stone')) d *= 0.6; if (e.shield) d *= 0.1;
  e.hp -= d; e.hitT = 0.12; if (e.sleep) e.sleep = 0;
  if (o.knock && !e.boss && !e.big) { const a = Math.atan2(e.y - (o.fy ?? G.P.y), e.x - (o.fx ?? G.P.x)); e.kx += Math.cos(a) * o.knock * 6; e.ky += Math.sin(a) * o.knock * 6; }
  if (o.stun && !e.boss) e.stunT = Math.max(e.stunT, o.stun * (e.elite ? 0.5 : 1));
  if (o.chill) { e.slowAmt = Math.max(e.slowAmt, o.chill); e.slowT = Math.max(e.slowT, 2); }
  if (o.burn) { e.burnDps = Math.max(e.burnDps, d * o.burn); e.burnT = 2.5; }
  if (o.fear && !e.boss && e.elite < 2) e.fearT = Math.max(e.fearT, o.fear);
  if (o.curse) { e.curseAmt = Math.max(e.curseAmt, o.curse); e.curseT = Math.max(e.curseT, o.curseDur || 1); }
  if (o.root && !e.boss) e.rootT = Math.max(e.rootT, o.root);
  if (!o.noLeech && d > 0) { const ll = d * (S.lifeLeech || 0) / 100; if (ll > 0 && leechBudget > 0) { const v = Math.min(ll, leechBudget); G.P.hp = Math.min(S.lifeMax, G.P.hp + v); leechBudget -= v; } if (S.manaLeech) G.P.mp = Math.min(S.manaMax, G.P.mp + d * S.manaLeech / 100); }
  if (OPT.dmgNums && d >= 1) addText(e.x, e.y, fmt(d), o.crit ? '#ffd24a' : ELEM_COL[elem], o.crit ? 16 : 12, o.crit);
  if (e.mods.includes('light_ench') && (e.sparkT || 0) <= 0) { e.sparkT = 0.5; for (let i = 0; i < 4; i++) enemyShot(e, Math.random() * TAU, 5, e.dmg * 0.4, 'light', 'lightball', 0.3, 1.2); }
  if (o.proc !== false && S.procs.length) for (const p of S.procs) if (p.on === 'hit' && Math.random() * 100 < p.chance) doProc(p, e.x, e.y);
  if (e.hp <= 0) killEnemy(e);
  return d;
}
function killEnemy(e) {
  if (e.dead) return; const A = G.A; const P = G.P; const C = G.C;
  if (e.boss) { bossDefeated(e); return; }
  if (e.ai === 'reviver' && !e.revived && Math.random() < 0.5) { e.revived = 1; e.inv = 1; e.reviveT = 2.4; e.hp = e.maxHp * 0.6; return; }
  e.dead = 1; A.killed++; C.kills++;
  const S = P.S; if (S.lifeOnKill) P.hp = Math.min(S.lifeMax, P.hp + S.lifeOnKill); if (S.manaOnKill) P.mp = Math.min(S.manaMax, P.mp + S.manaOnKill);
  for (const p of S.procs) if (p.on === 'kill' && Math.random() * 100 < p.chance) doProc(p, e.x, e.y);
  C.mantra = Math.min(100, C.mantra + (e.elite === 2 ? 20 : e.elite === 1 ? 5 : 0.9));
  // merit
  let xp = e.xp; const diff = C.level - e.lvl; if (diff > 5) xp *= Math.max(0.15, 1 - 0.12 * (diff - 5)); xp *= 1 + (S.xpPct + (G.buffs.merit ? 50 : 0)) / 100;
  if (e.spawned) xp *= 0.8;
  dropOrb(e.x, e.y, xp);
  dropLoot(e);
  deathFx(e);
  if (e.mods.includes('fire_ench')) { tele(e.x, e.y, 2, 0.45, e.dmg * 1.2, 'fire', '#ff6a1a'); }
  if (e.mods.includes('cold_ench')) { for (let i = 0; i < 10; i++) enemyShot(e, i / 10 * TAU, 4, e.dmg * 0.6, 'cold', 'frostball', 0.35, 1.6); }
  if (e.uniq) questKill(e.uniq);
  if (e.elite === 2) AU.play('die_big', 0.8);
}
function deathFx(e) {
  const col = e.d.look.col || e.d.look.cloth || '#fff';
  const n = OPT.quality === 'low' ? 4 : e.elite ? 16 : 8;
  for (let i = 0; i < n; i++) addPart(e.x + rand(-0.3, 0.3), e.y + rand(-0.3, 0.3), rand(10, 40), rand(-0.6, 0.6), rand(-0.6, 0.6), rand(30, 70), i % 3 ? col : '#fff4d0', rand(0.6, 1.2), 'mote');
  AU.play('die', 0.6, rand(0.8, 1.3));
}
function doProc(p, x, y) {
  const P = G.P; const d = [P.S.lifeMax * 0.15 * p.mul, P.S.lifeMax * 0.25 * p.mul]; const lv = G.C.level; const base = [4 + lv * 1.6, 8 + lv * 2.6].map(v => v * p.mul);
  if (p.fx === 'nova') addNova(p.on === 'hurt' ? P.x : x, p.on === 'hurt' ? P.y : y, 3.2, base, p.elem, {});
  if (p.fx === 'chain') castChainFrom(x, y, base, p.elem, 4, 4, null);
}

/* ---------- loot ---------- */
function dropOrb(x, y, xp) { const A = G.A; if (A.orbs.length > 260) { const o = A.orbs[Math.floor(Math.random() * A.orbs.length)]; o.xp += xp; return; } A.orbs.push({ x: x + rand(-0.2, 0.2), y: y + rand(-0.2, 0.2), xp, t: 0, big: xp > 60 }); }
function dropLoot(e) {
  const A = G.A, C = G.C, S = G.P.S; const L = e.lvl; const mf = S.mf + (G.buffs.fortune ? 100 : 0);
  let n = 0, bonus = 0;
  if (e.boss) { n = 4; bonus = 1.2; } else if (e.treasure) { n = 3; bonus = 1.2; } else if (e.elite === 2) { n = 1 + (Math.random() < 0.4 ? 1 : 0) + (e.uniq ? 1 : 0); bonus = 0.6; } else if (e.elite === 1) { n = Math.random() < 0.35 ? 1 : 0; bonus = 0.3; } else if (Math.random() < (e.spawned ? 0.012 : 0.028)) n = 1;
  for (let i = 0; i < n; i++) spawnGroundItem(genItem(L + (e.boss ? 2 : 0), { mf, bonus, cls: C.cls }), e.x, e.y);
  if (Math.random() < (e.elite ? 0.1 : 0.005)) spawnGroundItem(genGem(L), e.x, e.y);
  if (Math.random() < (e.elite ? 1 : e.spawned ? 0.12 : 0.22)) { const amt = Math.round(L * rand(2, 5) * (1 + S.gf / 100) * (e.elite ? 3 : 1)); A.golds.push({ x: e.x + rand(-0.4, 0.4), y: e.y + rand(-0.4, 0.4), amt, t: 0 }); }
  if (Math.random() < (e.elite ? 0.3 : 0.03)) A.pots.push({ x: e.x + rand(-0.4, 0.4), y: e.y + rand(-0.4, 0.4), kind: Math.random() < 0.1 ? 'rej' : Math.random() < 0.55 ? 'hp' : 'mp', t: 0 });
}
function spawnGroundItem(it, x, y) {
  const A = G.A; const a = Math.random() * TAU, d = rand(0.3, 1.2); let tx = x + Math.cos(a) * d, ty = y + Math.sin(a) * d; if (!walkable(A, tx, ty)) { tx = x; ty = y; }
  A.items.push({ it, x: tx, y: ty, sx: x, sy: y, t: 0 });
  AU.play(it.rar === 3 ? 'drop_unique' : it.rar === 2 ? 'drop_rare' : it.rar === 1 ? 'drop_magic' : 'drop', 0.7);
  if (it.rar === 3) toast(`${it.name}`, 'A unique item has fallen');
}

/* ---------- enemy projectiles & telegraphs ---------- */
function enemyShot(e, ang, spd, dmg, elem, sprite, r = 0.32, life = 4, o = {}) { if (G.eproj.length > 500) return; G.eproj.push({ x: e.x, y: e.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, dmg, elem, sprite: sprite || 'fireball', r, life, lvl: e.lvl, src: e, rot: ang, ...o }); }
function tele(x, y, r, delay, dmg, elem, col, o = {}) { G.teles.push({ x, y, r, t: 0, delay, dmg, elem, col, lvl: G.A.lvl, ...o }); }
function teleLine(x, y, ang, len, w, delay, dmg, elem, col, o = {}) { G.teles.push({ x, y, ang, len, w, line: 1, t: 0, delay, dmg, elem, col, lvl: G.A.lvl, ...o }); }

/* ---------- player hurt ---------- */
function hurtPlayer(amt, elem, src, lvl) {
  const P = G.P, S = P.S; if (P.dead || P.invT > 0 || G.buffs.adamant || G.state !== 'play') return;
  if (Math.random() * 100 < S.dodge) { addText(P.x, P.y, 'Evade', '#a8e0ff', 12); return; }
  if (Math.random() * 100 < S.block) { addText(P.x, P.y, 'Block', '#e8e0d0', 12); AU.play('block', 0.5); return; }
  let d = amt; lvl = lvl || G.A.lvl;
  if (elem === 'phys') { const red = Math.min(0.6, S.def / (S.def + 60 + 15 * lvl)); d *= (1 - red) * (1 - S.dr / 100); }
  else if (elem === 'spirit') d *= 1; else d *= 1 - (S['R_' + elem] || 0) / 100;
  if (G.buffs.vajra) d *= 0.5;
  P.hp -= d; P.hurtT = 0.25; P.hurtAcc = (P.hurtAcc || 0) + d;
  AU.play('hurt', 0.5);
  if (src && S.thorns && dist2(src.x, src.y, P.x, P.y) < 9) hitEnemy(src, S.thorns, 'phys', { noLeech: 1, proc: false });
  if (src && src.mods) { if (src.mods.includes('cold_ench')) { P.chillT = 1.5; } if (src.mods.includes('mana_burn')) P.mp = Math.max(0, P.mp - d); if (src.mods.includes('vampiric')) src.hp = Math.min(src.maxHp, src.hp + d * 2); }
  for (const p of S.procs) if (p.on === 'hurt' && Math.random() * 100 < p.chance) doProc(p, P.x, P.y);
  if (OPT.autoPot && P.hp < S.lifeMax * 0.32 && (P.potCd || 0) <= 0) quaff(G.C.pots.rej > 0 && P.hp < S.lifeMax * 0.2 ? 'rej' : 'hp', true);
  if (P.hp <= 0) playerDie();
}
function quaff(kind, auto) {
  const C = G.C, P = G.P, S = P.S; if (!P || P.dead) return;
  if (C.pots[kind] <= 0) { if (!auto) { AU.play('error', 0.5); } return; }
  if (kind === 'hp' && P.hp >= S.lifeMax) return; if (kind === 'mp' && P.mp >= S.manaMax) return;
  C.pots[kind]--; P.potCd = 0.8; AU.play('potion', 0.8);
  if (kind === 'hp') P.healOT = { t: 1.2, rate: S.lifeMax * 0.45 / 1.2 };
  if (kind === 'mp') P.manaOT = { t: 1.2, rate: S.manaMax * 0.5 / 1.2 };
  if (kind === 'rej') { P.hp = Math.min(S.lifeMax, P.hp + S.lifeMax * 0.6); P.mp = Math.min(S.manaMax, P.mp + S.manaMax * 0.6); }
  for (let i = 0; i < 10; i++) addPart(P.x, P.y, rand(5, 40), rand(-0.4, 0.4), rand(-0.4, 0.4), rand(20, 50), kind === 'hp' ? '#ff4a3a' : kind === 'mp' ? '#4a7aff' : '#c84aff', 0.8, 'mote');
}

/* ---------- visuals helpers ---------- */
function addText(x, y, str, col, size, big) { if (G.texts.length > 90) G.texts.shift(); G.texts.push({ x: x + rand(-0.2, 0.2), y: y + rand(-0.2, 0.2), z: 30, vz: big ? 44 : 34, t: 0, str, col, size: size || 12, big }); }
function addPart(x, y, z, vx, vy, vz, col, life, type, size) { if (G.parts.length > (OPT.quality === 'low' ? 250 : 700)) return; G.parts.push({ x, y, z, vx, vy, vz, col, t: 0, life, type: type || 'spark', size: size || 1 }); }
function addFx(o) { G.fx.push(Object.assign({ t: 0 }, o)); }
function shake(v) { if (OPT.shake) G.cam.shake = Math.max(G.cam.shake, v); }
function flash(col, v) { G.flashCol = col; G.flashT = Math.max(G.flashT, v); }
function toast(a, b, dur = 3, key) { const T = $('toast'); if (!T) return; if (key) T.querySelectorAll('[data-k="' + key + '"]').forEach(n => n.remove()); const d = document.createElement('div'); d.textContent = a; if (key) d.dataset.k = key; T.appendChild(d); let s; if (b) { s = document.createElement('div'); s.className = 'sub'; s.textContent = b; if (key) s.dataset.k = key; T.appendChild(s); } setTimeout(() => { d.remove(); s && s.remove(); }, dur * 1000); while (T.children.length > 6) T.firstChild.remove(); }
