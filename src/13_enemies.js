/* ================= enemy AI, director, hazards ================= */
function maxEnemies() { return OPT.quality === 'low' ? 150 : 240; }
function updateEnemies(dt) {
  const A = G.A, P = G.P; const L = A.enemies; let near = 0, anyDead = false;
  if (!A.flow || A.flowX !== Math.floor(P.x) || A.flowY !== Math.floor(P.y) || (A.flowT = (A.flowT || 0) - dt) <= 0) { computeFlow(A, P.x, P.y); A.flowT = 0.35; }
  const freeze = G.buffs.freezeAura;
  for (let i = 0; i < L.length; i++) {
    const e = L[i]; if (e.dead) { anyDead = true; continue; }
    const dxp = P.x - e.x, dyp = P.y - e.y; const dP2 = dxp * dxp + dyp * dyp;
    if (e.sleep) { if (dP2 < 169) { e.sleep = 0; } else continue; }
    if (dP2 < 256) near++;
    e.t += dt; e.hitT -= dt; e.atkAnim -= dt; if (e.sparkT) e.sparkT -= dt;
    if (!e.fly && !e.boss && !walkable(A, e.x, e.y)) snapWalkable(A, e);
    if (e.boss) { updateBoss(e, dt); continue; }
    if (e.inv && e.reviveT != null) { e.reviveT -= dt; if (e.reviveT <= 0) { e.inv = 0; e.reviveT = null; addFx({ type: 'pillar', x: e.x, y: e.y, life: 0.5, col: '#ff5a1a' }); } continue; }
    if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slowAmt = 0; }
    if (e.curseT > 0) { e.curseT -= dt; if (e.curseT <= 0) e.curseAmt = 0; }
    if (e.burnT > 0) { e.burnT -= dt; e.hp -= e.burnDps * dt; if (e.hp <= 0) { killEnemy(e); continue; } }
    if (e.stunT > 0) e.stunT -= dt; if (e.rootT > 0) e.rootT -= dt; if (e.fearT > 0) e.fearT -= dt;
    // knockback
    if (e.kx || e.ky) { const kx = e.kx * dt, ky = e.ky * dt; if (e.fly) { e.x += kx; e.y += ky; } else moveCircle(A, e, kx, ky, e.r * 0.8); const damp = Math.exp(-9 * dt); e.kx *= damp; e.ky *= damp; if (Math.abs(e.kx) + Math.abs(e.ky) < 0.05) e.kx = e.ky = 0; }
    // target (player or guardian)
    e.tgtT -= dt; if (e.tgtT <= 0) { e.tgtT = 0.5; e.tgt = P; if (G.minions.length) { let bd = dP2 * 0.7; for (const m of G.minions) { const d = dist2(m.x, m.y, e.x, e.y); if (d < bd && d < 36) { bd = d; e.tgt = m; } } } }
    const T = (e.tgt && (e.tgt === P || G.minions.includes(e.tgt))) ? e.tgt : P; const tr = T === P ? 0.35 : T.r;
    const dx = T.x - e.x, dy = T.y - e.y; const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
    if (e.mods.includes('teleport')) { e.tpT = (e.tpT || rand(3, 6)) - dt; if (e.tpT <= 0) { e.tpT = rand(4, 7); for (let k = 0; k < 8; k++) { const a = Math.random() * TAU; const x = P.x + Math.cos(a) * 3, y = P.y + Math.sin(a) * 3; if (walkable(A, x, y)) { addFx({ type: 'pillar', x: e.x, y: e.y, life: 0.4, col: '#b77dff' }); e.x = x; e.y = y; break; } } } }
    if (e.mods.includes('aura_freeze') && dP2 < 25) P.chillT = Math.max(P.chillT || 0, 0.3);
    let spd = e.spd * (1 - e.slowAmt / 100) * (freeze ? 0.5 : 1); if (e.stunT > 0 || e.rootT > 0) spd = 0;
    let mx = 0, my = 0; const ai = e.ai;
    if (e.fearT > 0) { mx = -dx / dist; my = -dy / dist; }
    else if (ai === 'charger' && (e.windT > 0 || e.chargeT > 0)) {
      if (e.windT > 0) { e.windT -= dt; spd = 0; if (e.windT <= 0) { e.chargeT = 0.6; e.cdir = Math.atan2(dy, dx); e.chargeHit = 0; } }
      else { e.chargeT -= dt; mx = Math.cos(e.cdir); my = Math.sin(e.cdir); spd = e.spd * 3.4; if (!e.chargeHit && dist < e.r + tr + 0.35) { e.chargeHit = 1; damageTarget(e, T, e.dmg * 1.4); } }
    }
    else if (ai === 'ranged' || ai === 'caster' || ai === 'tree') {
      const rng = e.atk ? e.atk.range : 6; if (dist > rng * 0.85) { const f = pathDir(e, T, dist); mx = f[0]; my = f[1]; } else if (dist < rng * 0.45) { mx = -dx / dist; my = -dy / dist; } else { const s = (e.uid % 2 ? 1 : -1); mx = -dy / dist * s * 0.5; my = dx / dist * s * 0.5; }
      if (e.atkCd <= 0 && dist < rng + 0.5 && dist < 11) {
        if (ai === 'caster') { const lead = 0.5; tele(T.x + (T === P ? (P.vx || 0) * lead : 0), T.y + (T === P ? (P.vy || 0) * lead : 0), e.atk.aoe, e.atk.delay, e.dmg * 1.3, e.atk.elem, ELEM_COL[e.atk.elem]); e.atkCd = e.atk.cd * rand(0.85, 1.2); e.atkAnim = 0.35; }
        else if (losClear(A, e.x, e.y, T.x, T.y)) { const n = e.atk.n || 1, sp = e.atk.spread || 0.3; const a0 = Math.atan2(dy, dx); for (let k = 0; k < n; k++) { const a = a0 + (n > 1 ? -sp / 2 + sp * k / (n - 1) : 0); enemyShot(e, a, e.atk.speed, e.dmg, e.atk.elem, { note: 'note', arrow: 'arrow', rock: 'rock', venom: 'venom', fireball: 'fireball', swordleaf: 'swordleaf' }[e.atk.proj] || 'fireball', 0.3, e.atk.range / e.atk.speed + 0.4); } e.atkCd = e.atk.cd * rand(0.85, 1.2) * (e.mods.includes('fast') ? 0.7 : 1); e.atkAnim = 0.3; AU.play('eshot', 0.3); }
      }
      if (ai === 'tree') spd *= 0.6;
    }
    else {
      const f = pathDir(e, T, dist); mx = f[0]; my = f[1];
      if (ai === 'charger') { e.chargeCd -= dt; if (dist < 6.5 && dist > 1.6 && e.chargeCd <= 0 && losClear(A, e.x, e.y, T.x, T.y)) { e.windT = 0.55; e.chargeCd = rand(3.5, 5.5); } }
      if (ai === 'exploder' && dist < 1.2) { tele(e.x, e.y, 1.8, 0.2, e.dmg * 1.3, e.elem, ELEM_COL[e.elem], { exp: 1 }); e.dead = 1; A.killed++; G.C.kills++; dropOrb(e.x, e.y, e.xp * 0.5); deathFx(e); anyDead = true; continue; }
    }
    // melee contact
    if (ai !== 'ranged' && ai !== 'caster' && ai !== 'tree' && e.atkCd <= 0 && dist < e.r + tr + 0.28 && e.stunT <= 0) { damageTarget(e, T, e.dmg); e.atkCd = (e.mods.includes('fast') ? 0.85 : 1.2) * rand(0.9, 1.1); e.atkAnim = 0.25; }
    e.atkCd -= dt;
    if (spd > 0 && (mx || my)) {
      const vx = mx * spd * dt, vy = my * spd * dt;
      if (e.fly) { e.x += vx; e.y += vy; e.x = clamp(e.x, 1, A.w - 1); e.y = clamp(e.y, 1, A.h - 1); } else moveCircle(A, e, vx, vy, e.r * 0.8);
      const sx = (mx - my); if (Math.abs(sx) > 0.05) e.face = sx > 0 ? 1 : -1; e.moving = 1;
    } else e.moving = 0;
    // separation
    if (OPT.quality !== 'low' || (e.uid + (G.frame | 0)) % 2 === 0) {
      let pushed = 0; const sx0 = e.x, sy0 = e.y;
      hashQuery(e.x, e.y, e.r, o => { if (o === e || o.boss) return; const ddx = e.x - o.x, ddy = e.y - o.y; const dd = Math.sqrt(ddx * ddx + ddy * ddy) || 0.01; const ov = e.r + o.r - dd; if (ov > 0) { const k = ov * 0.5 / dd; e.x += ddx * k; e.y += ddy * k; if (!o.boss) { o.x -= ddx * k * 0.5; o.y -= ddy * k * 0.5; } if (++pushed > 5) return true; } });
      if (!e.fly && !walkable(A, e.x, e.y)) { e.x = sx0; e.y = sy0; }
    }
    const pd = Math.sqrt(dist2(e.x, e.y, P.x, P.y)); const minD = e.r + 0.3; if (pd < minD && pd > 0.001) { const k = (minD - pd) / pd; const nx = e.x + (e.x - P.x) * k, ny = e.y + (e.y - P.y) * k; if (e.fly || walkable(A, nx, ny)) { e.x = nx; e.y = ny; } }
  }
  if (anyDead) A.enemies = L.filter(e => !e.dead);
  A.nearCount = near;
}
function snapWalkable(A, e) { const tx = Math.floor(e.x), ty = Math.floor(e.y); for (let r = 1; r <= 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; if (tileAt(A, tx + dx, ty + dy) === T_FLOOR) { e.x = tx + dx + 0.5; e.y = ty + dy + 0.5; e.kx = e.ky = 0; return; } } }
function pathDir(e, T, dist) {
  if (e.fly || dist < 2.2 || T !== G.P) return [(T.x - e.x) / dist, (T.y - e.y) / dist];
  const f = flowDir(G.A, e.x, e.y); if (f) return f; return [(T.x - e.x) / dist, (T.y - e.y) / dist];
}
function damageTarget(e, T, dmg) {
  if (T === G.P) hurtPlayer(dmg * rand(0.85, 1.15), e.elem === 'phys' ? 'phys' : e.elem, e, e.lvl);
  else { T.hp -= dmg * 0.7; addPart(T.x, T.y, 20, rand(-1, 1), rand(-1, 1), 20, '#ff5a4a', 0.3); }
  if (e.mods.includes('vampiric')) e.hp = Math.min(e.maxHp, e.hp + dmg);
}

/* ---------- enemy projectiles, telegraphs, hazards ---------- */
function updateEnemyStuff(dt) {
  const P = G.P, A = G.A;
  for (let i = G.eproj.length - 1; i >= 0; i--) {
    const p = G.eproj[i]; p.life -= dt;
    if (p.spiral) { p.spiral.a += p.spiral.va * dt; p.spiral.r += p.spiral.vr * dt; const nx = p.spiral.cx + Math.cos(p.spiral.a) * p.spiral.r, ny = p.spiral.cy + Math.sin(p.spiral.a) * p.spiral.r; p.rot = Math.atan2(ny - p.y, nx - p.x); p.x = nx; p.y = ny; }
    else { p.x += p.vx * dt; p.y += p.vy * dt; }
    if (p.life <= 0 || (!p.ghost && tileAt(A, p.x, p.y) === T_WALL)) { G.eproj.splice(i, 1); continue; }
    if (dist2(p.x, p.y, P.x, P.y) < (p.r + 0.3) * (p.r + 0.3)) { hurtPlayer(p.dmg, p.elem, null, p.lvl); if (p.elem === 'cold') P.chillT = 1; G.eproj.splice(i, 1); AU.play('ehit', 0.4); continue; }
    let hitM = false; for (const m of G.minions) { if (dist2(p.x, p.y, m.x, m.y) < (p.r + m.r) * (p.r + m.r)) { m.hp -= p.dmg * 0.6; hitM = true; break; } } if (hitM) { G.eproj.splice(i, 1); continue; }
  }
  for (let i = G.teles.length - 1; i >= 0; i--) {
    const t = G.teles[i]; t.t += dt; if (t.t < t.delay) continue;
    let hit = false;
    if (t.line) { const cx = Math.cos(t.ang), cy = Math.sin(t.ang); const rx = P.x - t.x, ry = P.y - t.y; const al = rx * cx + ry * cy, pe = Math.abs(-rx * cy + ry * cx); hit = al > -0.3 && al < t.len && pe < t.w / 2 + 0.25; for (const m of G.minions) { const mx = m.x - t.x, my = m.y - t.y; const a2 = mx * cx + my * cy, p2 = Math.abs(-mx * cy + my * cx); if (a2 > 0 && a2 < t.len && p2 < t.w / 2) m.hp -= t.dmg * 0.6; } }
    else { hit = dist2(P.x, P.y, t.x, t.y) < (t.r + 0.2) * (t.r + 0.2); for (const m of G.minions) if (dist2(m.x, m.y, t.x, t.y) < t.r * t.r) m.hp -= t.dmg * 0.6; }
    if (hit) hurtPlayer(t.dmg, t.elem, null, t.lvl);
    if (t.pool) G.hazards.push({ x: t.x, y: t.y, r: t.r * 0.9, t: 0, life: t.pool, dps: t.dmg * 0.3, elem: t.elem, col: t.col, tick: 0 });
    if (!t.line) { addFx({ type: 'impact', x: t.x, y: t.y, r: t.r, life: 0.35, col: t.col, kind: t.fall || 'enemy' }); if (t.r > 1.2) shake(2); }
    AU.play(t.elem === 'fire' ? 'explode' : t.elem === 'light' ? 'lightning' : 'void', 0.35);
    G.teles.splice(i, 1);
  }
  for (let i = G.hazards.length - 1; i >= 0; i--) {
    const h = G.hazards[i]; h.t += dt; h.tick -= dt; if (h.t > h.life) { G.hazards.splice(i, 1); continue; }
    if (h.tick <= 0 && dist2(P.x, P.y, h.x, h.y) < h.r * h.r) { h.tick = 0.5; hurtPlayer(h.dps * 0.5, h.elem, null); }
  }
}

/* ---------- the director: Vampire-Survivors style pressure ---------- */
function updateDirector(dt) {
  const A = G.A, P = G.P; if (A.kind !== 'field' && A.kind !== 'cave') return; if (G.state !== 'play') return;
  A.time += dt; A.spawnT -= dt; A.surgeT -= dt;
  const target = Math.floor(((A.cave ? 7 : 9) + A.r * 1.6 + Math.min(30, A.time / 8)) * (A.r === 0 ? 0.75 : 1) * (OPT.quality === 'low' ? 0.7 : 1));
  if (A.spawnT <= 0) {
    A.spawnT = rand(0.55, 1.1);
    if ((A.nearCount || 0) < target && A.enemies.length < maxEnemies()) {
      const id = pick(A.def.roster); const d = E[id]; const n = d.ai === 'swarm' ? randi(3, 6) : d.hp > 60 ? 1 : randi(1, 3);
      const pos = spawnSpot(A, P, 10.5, 14); if (pos) for (let k = 0; k < n; k++) spawnEnemy(A, id, pos.x + rand(-0.8, 0.8), pos.y + rand(-0.8, 0.8), { spawned: 1 });
    }
  }
  if (A.surgeT <= 0) {
    A.surgeT = rand(60, 85);
    const sw = A.def.roster.filter(id => E[id].ai === 'swarm'); const id = sw.length ? pick(sw) : pick(A.def.roster); const n = Math.round((E[id].ai === 'swarm' ? randi(20, 30) : randi(8, 12)) * (A.r === 0 ? 0.7 : 1));
    const a0 = Math.random() * TAU; let made = 0;
    for (let k = 0; k < n * 3 && made < n; k++) { const a = a0 + rand(-0.7, 0.7), r = rand(11, 14); const x = P.x + Math.cos(a) * r, y = P.y + Math.sin(a) * r; if (walkable(A, x, y) && (E[id].fly || (A.flow && A.flow[Math.floor(y) * A.w + Math.floor(x)] >= 0))) { spawnEnemy(A, id, x, y, { spawned: 1 }); made++; } }
    if (made) { toast(`A surge of ${E[id].name.replace(/ Swarm$/, '')}s approaches`, null, 2.5); AU.play('warn', 0.6); }
  }
}
function spawnSpot(A, P, r0, r1) { for (let k = 0; k < 14; k++) { const a = Math.random() * TAU, r = rand(r0, r1); const x = P.x + Math.cos(a) * r, y = P.y + Math.sin(a) * r; if (!walkable(A, x, y)) continue; if (A.flow && A.flow[Math.floor(y) * A.w + Math.floor(x)] < 0) continue; return { x, y }; } return null; }
