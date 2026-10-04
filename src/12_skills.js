/* ================= skill engine ================= */
const ELEM_SPR = { phys: 'arrow', fire: 'fireball', cold: 'frostball', light: 'lightball', void: 'voidball', spirit: 'orb' };
function areaMul() { return G.P.S.areaMul + (G.buffs.wrathful ? G.buffs.wrathful.area / 100 : 0); }
function buffDmg() { return (G.buffs.wrathful ? G.buffs.wrathful.dmg : 0) + (G.buffs.skydance ? G.buffs.skydance.dmg : 0) + (G.buffs.wrath ? 60 : 0); }
function skDmg(s, L) { return skillDamage(G.C, G.P.S, s, L, buffDmg()); }
function makeProj(o) { if (G.proj.length > 420) return null; const p = Object.assign({ t: 0, life: 1, pierce: 0, hits: [], r: 0.35, rot: Math.atan2(o.vy, o.vx) }, o); G.proj.push(p); return p; }
function angTo(x0, y0, x1, y1) { return Math.atan2(y1 - y0, x1 - x0); }

function updatePlayerSkills(dt) {
  const P = G.P, C = G.C, S = P.S;
  const spd = S.speedMul * (G.buffs.wind ? 1.3 : 1) * (G.buffs.skydance ? 1 + G.buffs.skydance.cs / 100 : 1);
  if (G.echoes && G.echoes.length) for (let i = G.echoes.length - 1; i >= 0; i--) { const e = G.echoes[i]; e.t -= dt; if (e.t <= 0) { G.echoes.splice(i, 1); G.castMul = e.m; G.inEcho = 1; try { castSkill(e.s, e.L); } finally { G.inEcho = 0; G.castMul = 1; } } }
  for (const id of C.slots) {
    const s = SKILLS[id]; const L = S.lv[id]; if (!L || s.type === 'passive') continue;
    if (s.type === 'aura' || s.type === 'curse') { updateAura(s, L, dt); continue; }
    P.cd[id] = (P.cd[id] || 0) - dt * spd; if (P.cd[id] > 0) continue;
    const cost = s.cost(L) * (1 - S.costRed / 100);
    if (P.mp < cost) { P.noMana[id] = 1; P.cd[id] = 0.1; continue; } P.noMana[id] = 0;
    if (castSkill(s, L)) { P.mp -= cost; P.cd[id] = s.cd(L); P.castT = 0.22; P.cdMax[id] = s.cd(L); runRiders(s, L); } else P.cd[id] = 0.12;
  }
}
function castSkill(s, L) {
  const P = G.P, S = P.S; const p = skP(s, L); const am = areaMul();
  switch (s.type) {
    case 'bolt': case 'five': {
      const tgt = nearestEnemy(P.x, P.y, 10.5); if (!tgt) return false;
      const base = angTo(P.x, P.y, tgt.x, tgt.y); const n = (p.n || 1) + S.projCount; const spread = n > 1 ? (p.spread || 0.3) * Math.min(1.6, 0.6 + n * 0.12) : 0;
      const d = skDmg(s, L); const speed = (p.speed || 10) * S.projMul;
      const five = s.type === 'five' ? ['spirit', 'cold', 'light', 'fire', 'void'] : null;
      for (let i = 0; i < n; i++) {
        const a = base + (n > 1 ? -spread / 2 + spread * i / (n - 1) : 0); const el = five ? five[i % 5] : s.elem;
        makeProj({ x: P.x, y: P.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 11 / speed * (p.homing ? 1.6 : 1), dmg: d, elem: el, pierce: p.pierce || 0, r: p.radius || 0.35,
          sprite: five ? { spirit: 'arrows', cold: 'arrowc', light: 'arrowl', fire: 'arrowf', void: 'arrowv' }[el] : p.sprite || ELEM_SPR[s.elem], explode: p.explode ? p.explode * am : 0, chain: p.chain || 0, chill: p.chill || 0, knock: p.knock || 0, homing: p.homing || 0, target: tgt, burn: 0 });
      }
      AU.play(s.stat === 'dex' ? 'arrow' : { spirit: 'bolt', void: 'void', fire: 'fire', cold: 'cold', light: 'lightning', phys: 'swing' }[s.elem], 0.7);
      return true;
    }
    case 'strike': {
      const range = p.range * am; const tgt = nearestEnemy(P.x, P.y, range + 0.3); if (!tgt) return false;
      const a = angTo(P.x, P.y, tgt.x, tgt.y); const d = skDmg(s, L); P.face = Math.cos(a - Math.PI / 4) >= 0 ? 1 : -1;
      let nh = 0; hashQuery(P.x, P.y, range, e => { let da = Math.abs(((angTo(P.x, P.y, e.x, e.y) - a + Math.PI * 3) % TAU) - Math.PI); if (da <= p.arc / 2 || dist2(P.x, P.y, e.x, e.y) < 0.8) { const [v, c] = rollDmg(d, S); hitEnemy(e, v, s.elem, { crit: c, knock: p.knock, burn: p.burn }); nh++; } });
      if (p.lifeHit && nh) P.hp = Math.min(S.lifeMax, P.hp + S.lifeMax * p.lifeHit / 100 * Math.min(5, nh));
      addFx({ type: 'slash', x: P.x, y: P.y, a, r: range, arc: p.arc, life: 0.22, col: ELEM_COL[s.elem] === '#e8e0d0' ? '#fff4d0' : ELEM_COL[s.elem] });
      AU.play(s.elem === 'fire' ? 'fire' : 'swing', 0.7); return true;
    }
    case 'sweep': {
      const R = p.radius * am; if (!nearestEnemy(P.x, P.y, R)) return false;
      addFx({ type: 'sweep', x: P.x, y: P.y, r: R, life: p.dur, dmg: skDmg(s, L), elem: s.elem, hit: new Set(), follow: 1 }); AU.play('swing', 1); AU.play('fire', 0.6); return true;
    }
    case 'nova': {
      const R = p.radius * am; if (!p.heal && !nearestEnemy(P.x, P.y, R * 0.85)) return false;
      addNova(P.x, P.y, R, skDmg(s, L), s.elem, { stun: p.stun, fear: p.fear, curse: p.curse, curseDur: p.curseDur, execute: p.execute, speed: p.speed, color: p.color });
      if (p.heal) { healAll(p.heal); }
      AU.play('nova', 0.8); shake(3); return true;
    }
    case 'chain': { const tgt = nearestEnemy(P.x, P.y, p.range); if (!tgt) return false; castChainFrom(P.x, P.y, skDmg(s, L), s.elem, p.jumps, p.hop, tgt); AU.play('lightning', 0.8); return true; }
    case 'zone': {
      const tgt = p.place === 'cluster' ? clusterTarget(P.x, P.y, 9) : nearestEnemy(P.x, P.y, 9); if (!tgt) return false;
      const d = skDmg(s, L); const z = { x: tgt.x, y: tgt.y, r: p.radius * am, dur: p.dur * P.S.durMul, tick: p.tick, tt: 0, t: 0, dmg: d, elem: s.elem, slow: p.slow || 0, pull: p.pull || 0, root: p.root || 0, fx: p.fx, burst: p.burst || 0 };
      G.zones.push(z); if (p.fx === 'fire') { addNova(tgt.x, tgt.y, z.r, [d[0] * p.burst, d[1] * p.burst], 'fire', { speed: 14 }); z.burst = 0; }
      AU.play({ fire: 'fire', cold: 'cold', void: 'void' }[s.elem] || 'void', 0.7); return true;
    }
    case 'rain': {
      const c = p.cluster ? clusterTarget(P.x, P.y, 9) : nearestEnemy(P.x, P.y, p.area + 2); if (!c) return false;
      const cx = p.cluster ? c.x : P.x, cy = p.cluster ? c.y : P.y; const area = p.area * am; const list = enemiesNear(cx, cy, area); const d = skDmg(s, L);
      const R = { impacts: [], dmg: d, elem: s.elem, r: p.impact * am, stun: p.stun || 0, fx: p.fx, burnGround: p.burnGround || 0, heal: p.heal || 0 };
      for (let i = 0; i < p.n; i++) { let x, y; if (list.length && Math.random() < 0.75) { const e = pick(list); x = e.x + rand(-0.6, 0.6); y = e.y + rand(-0.6, 0.6); } else { const a = Math.random() * TAU, rr = Math.sqrt(Math.random()) * area; x = cx + Math.cos(a) * rr; y = cy + Math.sin(a) * rr; } R.impacts.push({ x, y, t: -(Math.random() * p.dur) - (p.delay || 0.3), delay: p.delay || 0.3 }); }
      G.rains.push(R); if (p.fx === 'lightning') AU.play('lightning', 1); else if (p.fx === 'meteor') AU.play('fire', 0.8); else AU.play('arrow', 0.8); return true;
    }
    case 'orbit': {
      if (!nearestEnemy(P.x, P.y, 7)) return false;
      const n = p.n; const d = skDmg(s, L); const dur = p.dur * P.S.durMul;
      for (let i = 0; i < n; i++) G.orbits.push({ sid: s.id, a: i / n * TAU, R: p.orbitR * am, size: p.size * Math.sqrt(am), spin: p.spin, t: 0, life: dur, dmg: d, elem: s.elem, hitCd: p.hitCd, hits: new Map(), sprite: p.sprite, knock: p.knock || 0, burn: p.burn || 0, wheel: p.wheel, n });
      AU.play('summon', 0.5); return true;
    }
    case 'boomerang': {
      const tgt = nearestEnemy(P.x, P.y, p.range + 1); if (!tgt) return false; const d = skDmg(s, L); const base = angTo(P.x, P.y, tgt.x, tgt.y);
      for (let i = 0; i < p.n + S.projCount; i++) { const a = base + (i - (p.n - 1) / 2) * 0.35; const sp = p.speed * S.projMul; makeProj({ x: P.x, y: P.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 5, dmg: d, elem: s.elem, pierce: 999, r: p.radius, sprite: 'vajra', boom: { out: p.range, trav: 0, back: 0 }, spin: 1, hitCd: 0.35, hmap: new Map() }); }
      AU.play('swing', 0.8); return true;
    }
    case 'beam': { const tgt = nearestEnemy(P.x, P.y, p.range); if (!tgt) return false; G.beams.push({ tgt, a: angTo(P.x, P.y, tgt.x, tgt.y), len: p.range, w: p.width, t: 0, dur: p.dur, tick: p.tick, tt: 0, dmg: skDmg(s, L), elem: s.elem }); AU.play('bolt', 1, 0.6); return true; }
    case 'summon': {
      const have = G.minions.filter(m => m.kind === p.kind).length; if (have >= p.max) return false;
      if (p.kind === 'mahakala' && !nearestEnemy(P.x, P.y, 9)) return false;
      summonMinion(s, L, p); return true;
    }
    case 'sentry': { if (G.sentries.length >= p.max || !nearestEnemy(P.x, P.y, 9)) return false; const a = Math.random() * TAU; let x = P.x + Math.cos(a) * 1.4, y = P.y + Math.sin(a) * 1.4; if (!walkable(G.A, x, y)) { x = P.x; y = P.y; } G.sentries.push({ x, y, t: 0, life: p.dur * P.S.durMul, cd: 0.3, rate: p.rate, sid: s.id, L, speed: p.speed, spin: 0 }); AU.play('bell', 0.5); return true; }
    case 'mines': { const c = clusterTarget(P.x, P.y, 8); if (!c) return false; const d = skDmg(s, L); for (let i = 0; i < p.n; i++) { const a = i / p.n * TAU; const x = c.x + Math.cos(a) * rand(0.6, 1.8), y = c.y + Math.sin(a) * rand(0.6, 1.8); G.mines.push({ x, y, sx: P.x, sy: P.y, t: 0, arm: p.arm + i * 0.05, life: p.life, r: p.radius * am, dmg: d, elem: s.elem }); } AU.play('swing', 0.6); return true; }
    case 'buff': {
      if (!nearestEnemy(P.x, P.y, 6)) return false; const dur = p.dur * P.S.durMul;
      if (s.id === 'adamantine') { G.buffs.adamant = { t: dur }; addNova(P.x, P.y, p.radius * am, skDmg(s, L), 'phys', { knock: p.knock, speed: 12, color: '#e8f0ff' }); AU.play('gong', 0.7); flash('#e8f0ff', 0.25); }
      if (s.id === 'sky_dancer') { const b = s.bmods(L); G.buffs.skydance = { t: dur, dmg: b.dmgPct, cs: b.castSpeed, move: b.moveSpeed }; AU.play('bell', 0.8); flash('#ff6ab0', 0.2); }
      if (s.id === 'wrathful_form') { const b = s.bmods(L); G.buffs.wrathful = { t: dur, dmg: b.dmgPct, area: b.area, move: b.moveSpeed, trailT: 0, d: skDmg(s, L) }; AU.play('roar', 0.6); flash('#ff4a1a', 0.2); }
      return true;
    }
    case 'heal': {
      const hurt = P.hp < P.S.lifeMax * 0.9 || G.minions.some(m => m.hp < m.maxHp * 0.8) || nearestEnemy(P.x, P.y, 3.5); if (!hurt) return false;
      healAll(p.heal); addNova(P.x, P.y, p.radius * am, skDmg(s, L), s.elem, { speed: p.speed, color: '#4fd38f' }); AU.play('heal', 0.8); return true;
    }
  }
  return false;
}
function healAll(pct) { const P = G.P; P.hp = Math.min(P.S.lifeMax, P.hp + P.S.lifeMax * pct / 100); for (const m of G.minions) m.hp = Math.min(m.maxHp, m.hp + m.maxHp * pct / 100); for (let i = 0; i < 14; i++) addPart(P.x + rand(-0.6, 0.6), P.y + rand(-0.6, 0.6), rand(0, 20), 0, 0, rand(30, 60), '#8affb0', 1, 'mote'); }
function addNova(x, y, R, dmg, elem, o = {}) { G.fx.push({ type: 'nova', x, y, r: 0.2, R, t: 0, life: R / (o.speed || 10) + 0.25, speed: o.speed || 10, dmg, elem, hit: new Set(), o, col: o.color || ELEM_COL[elem] }); }
function castChainFrom(x, y, dmg, elem, jumps, hop, first) {
  const S = G.P.S; const pts = [[x, y]]; const hit = []; let cur = first || nearestEnemy(x, y, hop + 2); let cx = x, cy = y;
  for (let j = 0; j <= jumps && cur; j++) { hit.push(cur); pts.push([cur.x, cur.y]); const [v, c] = rollDmg(dmg, S); hitEnemy(cur, v * (1 - j * 0.04), elem, { crit: c, stun: 0.1, proc: false }); cx = cur.x; cy = cur.y; cur = nearestEnemy(cx, cy, hop, hit); }
  addFx({ type: 'chain', pts, life: 0.28, col: ELEM_COL[elem] });
}
function updateAura(s, L, dt) {
  const P = G.P; const p = s.p(L); const k = s.id; P.auraT[k] = (P.auraT[k] || 0) - dt; if (P.auraT[k] > 0) return; P.auraT[k] = p.tick || 0.5;
  const R = (p.radius || 3) * areaMul();
  if (s.type === 'curse') { hashQuery(P.x, P.y, R, e => { e.curseAmt = Math.max(e.curseAmt, p.curse); e.curseT = Math.max(e.curseT, 0.7); e.slowAmt = Math.max(e.slowAmt, p.slow); e.slowT = Math.max(e.slowT, 0.7); }); return; }
  if (s.id === 'om_mani') { for (const m of G.minions) if (dist2(m.x, m.y, P.x, P.y) < R * R) m.hp = Math.min(m.maxHp, m.hp + (P.S.minionRegen || 0) * (p.tick || 1)); return; }
  if (s.dmg) { const d = skDmg(s, L); hashQuery(P.x, P.y, R, e => { const [v, c] = rollDmg(d, P.S); hitEnemy(e, v, s.elem, { crit: c, proc: false }); }); }
}
function summonMinion(s, L, p) {
  const P = G.P, S = P.S; const def = MINIONS[p.kind]; const hp = p.hp * (1 + S.minionLife / 100) * (1 + G.C.level * 0.06);
  const a = Math.random() * TAU; let x = P.x + Math.cos(a) * 1.2, y = P.y + Math.sin(a) * 1.2; if (!walkable(G.A, x, y)) { x = P.x; y = P.y; }
  G.minions.push({ kind: p.kind, def, sid: s.id, x, y, hp, maxHp: hp, elem: s.elem, atkCd: 0.4, t: 0, life: p.dur || 0, r: def.r, face: 1, tgt: null, retT: 0, idx: G.minions.length, anim: 0 });
  addFx({ type: 'pillar', x, y, life: 0.6, col: ELEM_COL[s.elem] === '#e8e0d0' ? '#e8f0ff' : ELEM_COL[s.elem] }); AU.play('summon', 0.7);
}
function mantraUlt() {
  const C = G.C, P = G.P, S = P.S; if (C.mantra < 100 || P.dead) return; C.mantra = 0;
  const lv = C.level; const st = S[CLASSES[C.cls].stat]; const m = 1 + (st + S.dmgPct) / 100; const base = [(14 + lv * 7) * m, (24 + lv * 11) * m];
  AU.play('mantra', 1); flash('#fff4d0', 0.5); shake(10); toast(CLASSES[C.cls].mantra);
  G.fx.push({ type: 'mantraText', x: P.x, y: P.y, t: 0, life: 2.4, cls: C.cls });
  if (C.cls === 'vajra') { const list = enemiesNear(P.x, P.y, 11); for (const e of list) { const [v, c] = rollDmg([base[0] * 2.4, base[1] * 2.4], S); hitEnemy(e, v, 'light', { crit: c, stun: 1.5 }); } for (let i = 0; i < 18; i++) { const e = list[i % Math.max(1, list.length)]; const x = e ? e.x : P.x + rand(-6, 6), y = e ? e.y : P.y + rand(-6, 6); addFx({ type: 'bolt', x, y, life: 0.4 + i * 0.02, col: '#fff7a0' }); } }
  if (C.cls === 'sage') { addFx({ type: 'sweep', x: P.x, y: P.y, r: 7.5, life: 1.1, dmg: [base[0] * 3, base[1] * 3], elem: 'spirit', hit: new Set(), follow: 1, big: 1, turns: 2 }); }
  if (C.cls === 'chod') { healAll(50); addNova(P.x, P.y, 8, [base[0] * 1.9, base[1] * 1.9], 'void', { speed: 9, fear: 2, curse: 50, curseDur: 6, color: '#ff3a4a' }); for (let i = 0; i < 24; i++) addFx({ type: 'impact', x: P.x + rand(-6, 6), y: P.y + rand(-6, 6), r: 1.2, life: 0.5 + i * 0.03, col: '#ff3a2a', kind: 'feast' }); }
  if (C.cls === 'archer') { const R = { impacts: [], dmg: [base[0] * 0.55, base[1] * 0.55], elem: 'phys', r: 1.0, fx: 'arrow' }; const list = enemiesNear(P.x, P.y, 9); for (let i = 0; i < 90; i++) { let x, y; if (list.length && Math.random() < 0.7) { const e = pick(list); x = e.x + rand(-0.5, 0.5); y = e.y + rand(-0.5, 0.5); } else { const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * 8.5; x = P.x + Math.cos(a) * r; y = P.y + Math.sin(a) * r; } R.impacts.push({ x, y, t: -rand(0, 3) - 0.3, delay: 0.3 }); } G.rains.push(R); }
}

/* ---------- per-frame updates of player-side effects ---------- */
function updateEffects(dt) {
  const P = G.P, S = P.S, A = G.A;
  // projectiles
  for (let i = G.proj.length - 1; i >= 0; i--) {
    const p = G.proj[i]; p.t += dt;
    if (p.homing && p.target) { if (p.target.dead) p.target = nearestEnemy(p.x, p.y, 7); if (p.target) { const want = angTo(p.x, p.y, p.target.x, p.target.y); const cur = Math.atan2(p.vy, p.vx); let da = ((want - cur + Math.PI * 3) % TAU) - Math.PI; const turn = clamp(da, -p.homing * dt, p.homing * dt); const sp = Math.hypot(p.vx, p.vy); p.vx = Math.cos(cur + turn) * sp; p.vy = Math.sin(cur + turn) * sp; } }
    if (p.boom) { const sp = Math.hypot(p.vx, p.vy); p.boom.trav += sp * dt; if (!p.boom.back && p.boom.trav > p.boom.out) p.boom.back = 1; if (p.boom.back) { const a = angTo(p.x, p.y, P.x, P.y); p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp; if (dist2(p.x, p.y, P.x, P.y) < 0.5) { G.proj.splice(i, 1); continue; } } }
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot = p.spin ? p.t * 14 : Math.atan2(p.vy, p.vx);
    if (p.t > p.life || (!p.boom && tileAt(A, p.x, p.y) === T_WALL)) { if (p.explode) explodeProj(p); G.proj.splice(i, 1); continue; }
    let dead = false;
    hashQuery(p.x, p.y, p.r, e => {
      if (p.hmap) { const last = p.hmap.get(e.uid); if (last && G.t - last < p.hitCd) return; p.hmap.set(e.uid, G.t); }
      else if (p.hits.includes(e.uid)) return; else p.hits.push(e.uid);
      const [v, c] = rollDmg(p.dmg, S); hitEnemy(e, v, p.elem, { crit: c, knock: p.knock, chill: p.chill, fx: p.x, fy: p.y });
      if (p.chain) castChainFrom(e.x, e.y, [p.dmg[0] * 0.6, p.dmg[1] * 0.6], 'light', p.chain, 3.5, nearestEnemy(e.x, e.y, 3.5, [e]));
      if (p.explode) { explodeProj(p); dead = true; return true; }
      if (p.pierce > 0) { p.pierce--; return; }
      if (Math.random() * 100 < S.pierce) return;
      dead = true; return true;
    });
    if (dead) { addPart(p.x, p.y, 16, rand(-1, 1), rand(-1, 1), rand(10, 30), ELEM_COL[p.elem], 0.3); G.proj.splice(i, 1); }
  }
  // fx: novas, sweeps
  for (let i = G.fx.length - 1; i >= 0; i--) {
    const f = G.fx[i]; f.t += dt;
    if (f.type === 'nova') { f.r = Math.min(f.R, f.r + f.speed * dt); hashQuery(f.x, f.y, f.r, e => { if (f.hit.has(e.uid)) return; f.hit.add(e.uid); const [v, c] = rollDmg(f.dmg, S); if (f.o.execute && e.elite < 2 && !e.boss && e.hp / e.maxHp < f.o.execute / 100) { hitEnemy(e, e.hp + 1, 'phys', { noLeech: 1 }); return; } hitEnemy(e, v, f.elem, { crit: c, stun: f.o.stun, fear: f.o.fear, curse: f.o.curse, curseDur: f.o.curseDur, knock: f.o.knock || 0.3, fx: f.x, fy: f.y, proc: false }); }); }
    if (f.type === 'sweep') { if (f.follow) { f.x = P.x; f.y = P.y; } const turns = f.turns || 1; const ang = f.t / f.life * TAU * turns; f.ang = ang; hashQuery(f.x, f.y, f.r, e => { const key = e.uid + ':' + Math.floor(f.t / f.life * turns); if (f.hit.has(key)) return; let ea = angTo(f.x, f.y, e.x, e.y); let da = ((ang % TAU) - ((ea + TAU) % TAU) + TAU * 2) % TAU; if (da < 0.9 || dist2(f.x, f.y, e.x, e.y) < 1) { f.hit.add(key); const [v, c] = rollDmg(f.dmg, S); hitEnemy(e, v, f.elem, { crit: c, knock: 0.6 }); } }); }
    if (f.t > f.life) G.fx.splice(i, 1);
  }
  // zones
  for (let i = G.zones.length - 1; i >= 0; i--) {
    const z = G.zones[i]; z.t += dt; z.tt -= dt;
    if (z.pull) hashQuery(z.x, z.y, z.r, e => { if (e.boss || e.big) return; const a = angTo(e.x, e.y, z.x, z.y); const d = Math.sqrt(dist2(e.x, e.y, z.x, z.y)); if (d > 0.4) { e.kx += Math.cos(a) * z.pull * dt * 6; e.ky += Math.sin(a) * z.pull * dt * 6; } });
    if (z.tt <= 0) { z.tt = z.tick; hashQuery(z.x, z.y, z.r, e => { const [v, c] = rollDmg(z.dmg, S); hitEnemy(e, v, z.elem, { crit: c, chill: z.slow, root: z.root ? 0.6 : 0, proc: false }); }); }
    if (z.t >= z.dur) { if (z.burst) { addNova(z.x, z.y, z.r * 1.1, [z.dmg[0] * z.burst, z.dmg[1] * z.burst], z.elem, { speed: 14 }); AU.play('boom', 0.6); shake(3); } G.zones.splice(i, 1); }
  }
  // rains
  for (let i = G.rains.length - 1; i >= 0; i--) {
    const R = G.rains[i]; let left = 0;
    for (const im of R.impacts) { if (im.done) continue; left++; im.t += dt; if (im.t >= 0) { im.done = 1; hashQuery(im.x, im.y, R.r, e => { const [v, c] = rollDmg(R.dmg, S); hitEnemy(e, v, R.elem, { crit: c, stun: R.stun, proc: false }); if (R.heal) G.P.hp = Math.min(S.lifeMax, G.P.hp + S.lifeMax * 0.008); });
        if (R.fx === 'bones') for (let k = 0; k < 7; k++) addPart(im.x, im.y, 4, rand(-1.5, 1.5), rand(-1.5, 1.5), rand(60, 140), '#f0e8d0', 0.6, 'spark');
        if (R.fx === 'feast') for (let k = 0; k < 6; k++) addPart(im.x, im.y, 10, rand(-1, 1), rand(-1, 1), rand(30, 80), '#ff3a2a', 0.6, 'spark');
        addFx({ type: R.fx === 'lightning' ? 'bolt' : 'impact', x: im.x, y: im.y, life: R.fx === 'lightning' ? 0.3 : 0.35, col: ELEM_COL[R.elem], r: R.r, kind: R.fx });
        if (R.fx === 'meteor') { AU.play('boom', 0.5); shake(2); if (R.burnGround) G.zones.push({ x: im.x, y: im.y, r: R.r * 0.8, dur: R.burnGround, tick: 0.5, tt: 0.5, t: 0, dmg: [R.dmg[0] * 0.12, R.dmg[1] * 0.12], elem: 'fire', fx: 'fire' }); }
        if (R.fx === 'lightning') AU.play('lightning', 0.5); if (R.fx === 'palm') { AU.play('hit', 0.6); shake(1.5); } } }
    if (!left) G.rains.splice(i, 1);
  }
  // orbits
  for (let i = G.orbits.length - 1; i >= 0; i--) {
    const o = G.orbits[i]; o.t += dt; if (o.t > o.life) { G.orbits.splice(i, 1); continue; }
    o.a += o.spin * dt; o.x = P.x + Math.cos(o.a) * o.R; o.y = P.y + Math.sin(o.a) * o.R;
    hashQuery(o.x, o.y, o.size, e => { const last = o.hits.get(e.uid); if (last != null && G.t - last < o.hitCd) return; o.hits.set(e.uid, G.t); const [v, c] = rollDmg(o.dmg, S); hitEnemy(e, v, o.elem, { crit: c, knock: o.knock, burn: o.burn, fx: P.x, fy: P.y, proc: false }); });
  }
  // beams
  for (let i = G.beams.length - 1; i >= 0; i--) {
    const b = G.beams[i]; b.t += dt; b.tt -= dt; if (b.tgt && !b.tgt.dead) b.a = angTo(P.x, P.y, b.tgt.x, b.tgt.y);
    if (b.tt <= 0) { b.tt = b.tick; const cx = Math.cos(b.a), cy = Math.sin(b.a); hashQuery(P.x + cx * b.len / 2, P.y + cy * b.len / 2, b.len / 2 + 0.5, e => { const rx = e.x - P.x, ry = e.y - P.y; const along = rx * cx + ry * cy; const perp = Math.abs(rx * -cy + ry * cx); if (along > 0 && along < b.len && perp < b.w / 2 + e.r) { const [v, c] = rollDmg(b.dmg, S); hitEnemy(e, v, b.elem, { crit: c, proc: false }); } }); }
    if (b.t > b.dur) G.beams.splice(i, 1);
  }
  // sentries
  for (let i = G.sentries.length - 1; i >= 0; i--) {
    const s = G.sentries[i]; s.t += dt; s.cd -= dt; s.spin += dt * 6; if (s.t > s.life) { G.sentries.splice(i, 1); continue; }
    if (s.cd <= 0) { const tgt = nearestEnemy(s.x, s.y, 9); if (tgt) { s.cd = s.rate / P.S.speedMul; const sk = SKILLS[s.sid]; const d = skDmg(sk, P.S.lv[s.sid] || s.L); const a = angTo(s.x, s.y, tgt.x, tgt.y); const sp = s.speed * P.S.projMul; makeProj({ x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 10 / sp, dmg: d, elem: 'phys', pierce: 0, r: 0.3, sprite: 'arrow' }); AU.play('arrow', 0.35); } else s.cd = 0.2; }
  }
  // mines
  for (let i = G.mines.length - 1; i >= 0; i--) {
    const m = G.mines[i]; m.t += dt; if (m.t < m.arm) continue; let boom = m.t > m.life;
    if (!boom) hashQuery(m.x, m.y, 1.1, () => { boom = true; return true; });
    if (boom) { hashQuery(m.x, m.y, m.r, e => { const [v, c] = rollDmg(m.dmg, S); hitEnemy(e, v, m.elem, { crit: c, knock: 0.5, fx: m.x, fy: m.y, proc: false }); }); addFx({ type: 'impact', x: m.x, y: m.y, r: m.r, life: 0.4, col: '#ff8a5a', kind: 'lotus' }); AU.play('explode', 0.5); shake(2); G.mines.splice(i, 1); }
  }
  // buffs
  for (const k in G.buffs) { const b = G.buffs[k]; b.t -= dt; if (k === 'wrathful') { b.trailT -= dt; if (b.trailT <= 0) { b.trailT = 0.3; G.zones.push({ x: P.x, y: P.y, r: 0.9, dur: 2, tick: 0.4, tt: 0.2, t: 0, dmg: b.d, elem: 'fire', fx: 'fire' }); } } if (b.t <= 0) { delete G.buffs[k]; if (k === 'merit' || k === 'fortune' || k === 'wrath' || k === 'vajra' || k === 'wind') refreshStats(); } }
}
function explodeProj(p) { const S = G.P.S; hashQuery(p.x, p.y, p.explode, e => { if (p.hits.includes(e.uid)) return; const [v, c] = rollDmg([p.dmg[0] * 0.6, p.dmg[1] * 0.6], S); hitEnemy(e, v, p.elem, { crit: c, proc: false }); }); addFx({ type: 'impact', x: p.x, y: p.y, r: p.explode, life: 0.3, col: ELEM_COL[p.elem] }); AU.play(p.elem === 'void' ? 'void' : 'explode', 0.4); }

/* ---------- guardians ---------- */
function updateMinions(dt) {
  const P = G.P, S = P.S, A = G.A;
  for (let i = G.minions.length - 1; i >= 0; i--) {
    const m = G.minions[i]; m.t += dt; m.atkCd -= dt; m.retT -= dt; m.anim += dt;
    if (m.life) { m.life -= dt; if (m.life <= 0) { addFx({ type: 'pillar', x: m.x, y: m.y, life: 0.5, col: '#8a8aff' }); G.minions.splice(i, 1); continue; } }
    if (m.hp <= 0) { deathFxAt(m.x, m.y, '#e8f0ff'); G.minions.splice(i, 1); continue; }
    m.hp = Math.min(m.maxHp, m.hp + m.maxHp * 0.01 * dt);
    if (dist2(m.x, m.y, P.x, P.y) > 196) { m.x = P.x + rand(-1, 1); m.y = P.y + rand(-1, 1); }
    if (m.retT <= 0 || (m.tgt && m.tgt.dead)) { m.retT = 0.4; m.tgt = nearestEnemy(m.x, m.y, 8); if (m.tgt && dist2(m.tgt.x, m.tgt.y, P.x, P.y) > 144) m.tgt = null; }
    const d = m.def; let tx, ty, wantDist;
    if (m.tgt) { tx = m.tgt.x; ty = m.tgt.y; wantDist = d.ai === 'ranged' ? d.range * 0.7 : d.range * 0.8 + m.tgt.r; }
    else { const k = m.idx % 6; const a = k / 6 * TAU + 0.5; tx = P.x + Math.cos(a) * 1.8; ty = P.y + Math.sin(a) * 1.8; wantDist = 0.5; }
    const dd = Math.sqrt(dist2(m.x, m.y, tx, ty));
    if (dd > wantDist) { const a = angTo(m.x, m.y, tx, ty); const sp = d.speed * dt * (m.tgt ? 1 : dd > 4 ? 1.4 : 0.8); if (d.fly) { m.x += Math.cos(a) * sp; m.y += Math.sin(a) * sp; } else moveCircle(A, m, Math.cos(a) * sp, Math.sin(a) * sp, m.r * 0.8); m.face = Math.cos(a - Math.PI / 4) >= 0 ? 1 : -1; m.moving = 1; } else m.moving = 0;
    if (m.tgt && m.atkCd <= 0) {
      const sk = SKILLS[m.sid]; const dmg = skDmg(sk, S.lv[m.sid] || 1); const dT = Math.sqrt(dist2(m.x, m.y, m.tgt.x, m.tgt.y));
      if (d.ai === 'melee' && dT < d.range + m.tgt.r + 0.2) { const [v, c] = rollDmg(dmg, S); hitEnemy(m.tgt, v, m.elem, { crit: c, knock: 0.2, fx: m.x, fy: m.y, noLeech: 1 }); m.atkCd = d.atkCd; m.atkAnim = 0.2; AU.play('hit', 0.3); }
      else if (d.ai === 'smash' && dT < d.range) { hashQuery(m.x, m.y, d.range, e => { const [v, c] = rollDmg(dmg, S); hitEnemy(e, v, 'phys', { crit: c, knock: 0.6, stun: 0.3, fx: m.x, fy: m.y, noLeech: 1 }); }); addFx({ type: 'impact', x: m.x + (m.tgt.x - m.x) * 0.3, y: m.y + (m.tgt.y - m.y) * 0.3, r: d.range, life: 0.35, col: '#6a7aff', kind: 'smash' }); m.atkCd = d.atkCd; shake(3); AU.play('boom', 0.4); }
      else if (d.ai === 'ranged' && dT < d.range + 0.5) { const a = angTo(m.x, m.y, m.tgt.x, m.tgt.y); const sp = 9; makeProj({ x: m.x, y: m.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.2, dmg, elem: m.elem, pierce: 0, r: 0.35, sprite: d.proj === 'feather' ? 'feather' : 'venom', chill: d.proj === 'venom' ? 30 : 0, homing: 3, target: m.tgt }); m.atkCd = d.atkCd; }
    }
  }
}
function deathFxAt(x, y, col) { for (let i = 0; i < 10; i++) addPart(x, y, rand(10, 30), rand(-0.6, 0.6), rand(-0.6, 0.6), rand(20, 60), col, 0.8, 'mote'); }

/* ---------- synergies: evolved parameters and rider attacks ---------- */
G.echoes = []; G.castMul = 0;
function skP(s, L) { let p = s.p ? s.p(L) : {}; const e = G.P && G.P.S.evo && G.P.S.evo[s.id]; if (e && e.p) p = Object.assign({}, p, e.p(p, L)); return p; }
function runRiders(s, L) {
  const P = G.P, S = P.S, list = S.riders && S.riders[s.id]; if (!list || !list.length) return;
  const base = skDmg(s, L); const am = areaMul(); const dm = m => [base[0] * m, base[1] * m];
  for (const r of list) {
    const e = r.e || s.elem || 'phys';
    switch (r.k) {
      case 'nova': addNova(P.x, P.y, r.r * am, dm(r.m), e, { stun: r.stun, fear: r.fear, curse: r.curse, curseDur: r.curseDur, speed: 11, color: ELEM_COL[e] }); break;
      case 'echo': if (!G.inEcho) G.echoes.push({ s, L, t: r.d, m: r.m }); break;
      case 'bolts': { const l = enemiesNear(P.x, P.y, 9); if (!l.length) break; const R = { impacts: [], dmg: dm(r.m), elem: e, r: 1.1, stun: 0.2, fx: e === 'light' ? 'lightning' : undefined }; for (let i = 0; i < r.n; i++) { const t = pick(l); R.impacts.push({ x: t.x + rand(-0.4, 0.4), y: t.y + rand(-0.4, 0.4), t: -rand(0, 0.35) - 0.15, delay: 0.15 }); } G.rains.push(R); AU.play(e === 'light' ? 'lightning' : 'boom', 0.4); break; }
      case 'chain': { const t = nearestEnemy(P.x, P.y, 9); if (t) castChainFrom(P.x, P.y, dm(r.m), e, r.j, 3.8, t); break; }
      case 'zone': { if (G.zones.length > 60) break; const t = nearestEnemy(P.x, P.y, 9); const x = t ? t.x : P.x, y = t ? t.y : P.y; G.zones.push({ x, y, r: r.r * am, dur: r.dur * S.durMul, tick: 0.5, tt: 0.3, t: 0, dmg: dm(r.m), elem: e, slow: r.slow || 0, pull: r.pull || 0, root: 0, fx: r.fx, burst: 0 }); break; }
      case 'heal': P.hp = Math.min(S.lifeMax, P.hp + S.lifeMax * r.pct / 100); break;
      case 'mana': P.mp = Math.min(S.manaMax, P.mp + r.v); break;
      case 'arrows': { const l = enemiesNear(P.x, P.y, 10); if (!l.length) break; for (let i = 0; i < r.n; i++) { const t = pick(l); const a = angTo(P.x, P.y, t.x, t.y) + rand(-0.6, 0.6); makeProj({ x: P.x, y: P.y, vx: Math.cos(a) * 11, vy: Math.sin(a) * 11, life: 1.8, dmg: dm(r.m), elem: e, pierce: 0, r: 0.35, sprite: ELEM_SPR[e] || 'arrow', homing: 6, target: t }); } break; }
      case 'orbit': { if (G.orbits.length > 40) break; const dur = r.dur * S.durMul; for (let i = 0; i < r.n; i++) G.orbits.push({ sid: s.id, a: i / r.n * TAU + rand(0, 1), R: 1.7, size: 0.45, spin: 4, t: 0, life: dur, dmg: dm(r.m), elem: e, hitCd: 0.4, hits: new Map(), sprite: r.sprite, knock: 0, burn: 0 }); break; }
      case 'meteor': { const c = clusterTarget(P.x, P.y, 9); if (!c) break; const R = { impacts: [], dmg: dm(r.m), elem: 'fire', r: 1.6, stun: 0, fx: 'meteor', burnGround: 2 }; for (let i = 0; i < r.n; i++) R.impacts.push({ x: c.x + rand(-2, 2), y: c.y + rand(-2, 2), t: -rand(0, 0.8) - 0.5, delay: 0.5 }); G.rains.push(R); break; }
    }
  }
}
function skDisp(s) { const e = G.P && G.P.S.evo && G.P.S.evo[s.id]; return e ? Object.assign({}, s, { name: e.name, icon: e.icon, desc: e.desc, evolved: 1 }) : s; }
function announceSynergies(S) {
  const C = G.C; if (!C || !G.P) return; const seen = C.synSeen || (C.synSeen = {});
  const news = []; for (const id in S.evo) if (!seen['e:' + id]) news.push(['e:' + id, 'Evolution: ' + S.evo[id].name, SKILLS[id].name + ' has awakened into a new art']);
  for (const u of S.unions) if (!seen['u:' + u.id]) news.push(['u:' + u.id, 'Union: ' + u.name, u.desc]);
  for (const h of S.harm) if (!seen['h:' + h.id]) news.push(['h:' + h.id, 'Harmony: ' + h.name, h.desc]);
  if (!news.length) return;
  for (const n of news) seen[n[0]] = 1;
  if (G.state === 'play' || G.state === 'panel') { const n = news[0]; toast(n[1], n[2], 5); AU.play('bell', 0.9); flash('#ffe08a', 0.3); }
}
