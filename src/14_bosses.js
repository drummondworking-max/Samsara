/* ================= realm bosses ================= */
function spawnBoss(A) {
  const id = A.def.boss; const B = BOSSES[id]; const L = A.lvl + 1; const sc = monScale(L); const cx = A.center.x, cy = A.center.y;
  const mk = (sub, x, y, hpMul, look) => {
    const e = { uid: EUID++, id: sub, boss: sub, d: { look: look || { col: '#fff' } }, x, y, lvl: L, hp: B.hp * sc.hp * hpMul * (1 + B.realm * 0.6), dmg: B.dmg * sc.dmg, spd: 2.2, r: B.r, xp: 600 * sc.xp, ai: 'boss', elite: 4, mods: [], name: B.name, res: {},
      atkCd: 2, t: 0, face: 1, hitT: 0, slowT: 0, slowAmt: 0, burnDps: 0, burnT: 0, stunT: 0, rootT: 0, fearT: 0, curseT: 0, curseAmt: 0, kx: 0, ky: 0, cool: 2.2, cur: null, phase: 0, step: 0, big: 1, scale: 1, contactT: 0 };
    e.maxHp = e.hp; A.enemies.push(e); return e;
  };
  let ents = [];
  if (id === 'three_poisons') {
    const parts = [['rooster', 'The Rooster of Greed'], ['snake', 'The Serpent of Hatred'], ['pig', 'The Boar of Delusion']];
    parts.forEach(([sub, nm], i) => { const e = mk(sub, cx + Math.cos(i * TAU / 3) * 6, cy + Math.sin(i * TAU / 3) * 6, 1); e.name = nm; e.orbA = i * TAU / 3; e.r = 0.95; ents.push(e); buildBoss(sub); });
  } else { const e = mk(id, cx, cy - 2, 1); ents.push(e); buildBoss(id); if (id === 'mara') buildBoss('daughter'); }
  G.boss = { ents, name: B.name, title: B.title, maxHp: ents.reduce((s, e) => s + e.maxHp, 0), id };
  A.bossState = 1; AU.play('roar', 1); AU.setMusic('boss'); shake(8);
  toast(B.name, B.title, 4);
  const bb = $('bossbar'); bb.hidden = false; bb.querySelector('.nm').textContent = B.name;
}
function bFan(e, ang, n, spread, spd, dmg, elem, spr, r = 0.35) { for (let i = 0; i < n; i++) { const a = ang + (n > 1 ? -spread / 2 + spread * i / (n - 1) : 0); enemyShot(e, a, spd, dmg, elem, spr, r, 5, { ghost: 1 }); } }
function bRing(e, n, spd, dmg, elem, spr, off = 0, r = 0.35) { for (let i = 0; i < n; i++) enemyShot(e, off + i / n * TAU, spd, dmg, elem, spr, r, 6, { ghost: 1 }); }
function bSummon(e, ids, n, rad = 3) { const A = G.A; for (let i = 0; i < n; i++) { const id = pick(ids); for (let k = 0; k < 6; k++) { const a = Math.random() * TAU; const x = e.x + Math.cos(a) * rad, y = e.y + Math.sin(a) * rad; if (walkable(A, x, y)) { const m = spawnEnemy(A, id, x, y, { spawned: 1, lvl: e.lvl - 1 }); m.xp *= 0.5; addFx({ type: 'pillar', x, y, life: 0.5, col: '#ff8a5a' }); break; } } } }
function bMove(e, tx, ty, spd, dt, keep = 0) { const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy); if (d > keep + 0.1) { const s = Math.min(d - keep, spd * dt); e.x += dx / d * s; e.y += dy / d * s; e.face = (dx - dy) >= 0 ? 1 : -1; e.moving = 1; } else e.moving = 0; }
function aimP(e) { return angTo(e.x, e.y, G.P.x, G.P.y); }

function updateBoss(e, dt) {
  const P = G.P, A = G.A; e.t += dt;
  if (e.stunT > 0) e.stunT -= dt; if (e.burnT > 0) { e.burnT -= dt; e.hp -= e.burnDps * dt * 0.5; if (e.hp <= 0) { killEnemy(e); return; } }
  if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slowAmt = 0; } if (e.curseT > 0) { e.curseT -= dt; if (e.curseT <= 0) e.curseAmt = 0; }
  e.contactT -= dt; const dP = Math.hypot(P.x - e.x, P.y - e.y);
  if (!e.inv && dP < e.r + 0.35 && e.contactT <= 0) { hurtPlayer(e.dmg * 0.6, 'phys', e, e.lvl); e.contactT = 0.9; }
  if (dP < e.r + 0.35 && dP > 0.01) { const k = (e.r + 0.35 - dP) / dP; P.x += (P.x - e.x) * k * 0.5; P.y += (P.y - e.y) * k * 0.5; if (!walkable(A, P.x, P.y)) { P.x -= (P.x - e.x) * k * 0.5; P.y -= (P.y - e.y) * k * 0.5; } }
  const hpF = e.hp / e.maxHp; const enr = e.enraged ? 0.7 : 1;
  if (e.dash) { e.dash.t -= dt; const s = e.dash.spd * dt; const nx = e.x + Math.cos(e.dash.a) * s, ny = e.y + Math.sin(e.dash.a) * s; if (walkable(A, nx, ny)) { e.x = nx; e.y = ny; } if (Math.random() < 0.6) addPart(e.x, e.y, 20, 0, 0, 10, '#ffffff', 0.3, 'smoke'); if (e.dash.t <= 0) e.dash = null; return; }
  if (e.cur) { e.cur.t += dt; runBossAttack(e, dt); if (e.cur && e.cur.t >= e.cur.dur) { e.cur = null; e.cool = rand(1.1, 1.8) * enr; } return; }
  e.cool -= dt;
  switch (e.boss) {
    case 'mahabrahma': {
      if (e.phase === 0 && hpF < 0.5) { e.phase = 1; e.shield = 1; toast('Mahabrahma is shielded by his pride', 'Destroy the Radiant Devas who sustain him'); const guards = []; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; const g = spawnEnemy(A, 'radiant_deva', A.center.x + Math.cos(a) * 9, A.center.y + Math.sin(a) * 9, { elite: 2, hpMul: 3, dmgMul: 1.2, name: 'Pillar of Pride', mods: ['stone'], scale: 1.3, lvl: e.lvl }); g.shieldOf = e; guards.push(g); } e.guards = guards; AU.play('gong', 1); }
      if (e.shield && e.guards && e.guards.every(g => g.dead)) { e.shield = 0; toast('The shield of pride shatters'); AU.play('explode', 1); shake(8); flash('#fff0b0', 0.4); }
      bMove(e, P.x, P.y, 1.2, dt, 4.5);
      if (e.cool <= 0) e.cur = { type: ['spiral', 'rain', 'ring', 'summon', 'rain', 'spiral'][e.step++ % 6], t: 0, dur: 0 };
      break; }
    case 'angulimala': {
      if (!e.enraged && hpF < 0.35) { e.enraged = 1; toast('Angulimala flies into a frenzy'); AU.play('roar', 0.8); }
      bMove(e, P.x, P.y, e.enraged ? 3.2 : 2.5, dt, 1.8);
      if (e.cool <= 0) e.cur = { type: ['dash', 'knives', 'garland', 'dash', 'summon', 'knives'][e.step++ % 6], t: 0, dur: 0 };
      break; }
    case 'rahu': {
      if (e.phase === 0 && hpF < 0.6) { e.phase = 1; e.cur = { type: 'eclipse', t: 0, dur: 0 }; return; }
      bMove(e, P.x, P.y, 1.4, dt, 4.5);
      if (e.cool <= 0) e.cur = { type: e.phase ? ['bite', 'voidrings', 'meteors', 'eclipse', 'bite', 'summon'][e.step++ % 6] : ['bite', 'meteors', 'voidrings', 'summon'][e.step++ % 4], t: 0, dur: 0 };
      break; }
    case 'rooster': case 'snake': case 'pig': {
      const c = A.center; const alive = G.boss.ents.filter(x => !x.dead).length; const w = 0.45 * (1 + (3 - alive) * 0.35);
      e.orbA += w * dt; const tx = c.x + Math.cos(e.orbA) * 6.5, ty = c.y + Math.sin(e.orbA) * 6.5;
      if (!e.cur) bMove(e, tx, ty, 5, dt, 0);
      e.cool -= dt * (1 + (3 - alive) * 0.3) - dt;
      if (e.boss === 'snake') { e.poolT = (e.poolT || 0) - dt; if (e.poolT <= 0) { e.poolT = 0.7; G.hazards.push({ x: e.x, y: e.y, r: 1.2, t: 0, life: 5, dps: e.dmg * 0.5, elem: 'void', col: '#6aff5a', tick: 0 }); } }
      if (e.cool <= 0) { e.cool = e.boss === 'pig' ? 4.5 : 2.4; if (e.boss === 'rooster') { bFan(e, aimP(e), 5, 0.9, 6.5, e.dmg * 0.6, 'fire', 'feathr'); AU.play('fire', 0.5); } if (e.boss === 'snake') { for (let k = 0; k < 3; k++) setTimeout(() => { if (!e.dead) enemyShot(e, aimP(e), 7, e.dmg * 0.6, 'void', 'venom', 0.35, 4, { ghost: 1 }); }, k * 180); } if (e.boss === 'pig') { e.cur = { type: 'charge', t: 0, dur: 0 }; } }
      break; }
    case 'ulkamukha': {
      if (e.phase === 0 && hpF < 0.5) { e.phase = 1; toast('The Flaming Mouth howls with hunger'); AU.play('roar', 1); }
      bMove(e, P.x, P.y, 1.1, dt, 4);
      if (e.cool <= 0) e.cur = { type: ['breath', 'firerain', 'pull', 'summon', 'breath', 'firerain'][e.step++ % 6], t: 0, dur: 0 };
      break; }
    case 'mara': {
      if (e.phase === 0 && hpF < 0.66) { e.phase = 1; e.inv = 1; e.cur = null; toast('The Daughters of Mara', 'Craving, Aversion and Passion dance before you'); AU.play('gong', 1); const names = ['Tanha, Craving', 'Arati, Aversion', 'Raga, Passion']; e.daughters = names.map((n, i) => { const a = i / 3 * TAU; const d = { uid: EUID++, id: 'daughter', boss: 'daughter', d: { look: { col: '#ff6ab0' } }, x: A.center.x + Math.cos(a) * 5, y: A.center.y + Math.sin(a) * 5, lvl: e.lvl, hp: e.maxHp * 0.13, dmg: e.dmg * 0.8, spd: 3.4, r: 0.6, xp: 200, ai: 'boss', elite: 4, mods: [], name: n, res: {}, t: 0, face: 1, hitT: 0, slowT: 0, slowAmt: 0, burnDps: 0, burnT: 0, stunT: 0, rootT: 0, fearT: 0, curseT: 0, curseAmt: 0, kx: 0, ky: 0, cool: 1 + i, contactT: 0, orbA: a, big: 1, scale: 1 }; d.maxHp = d.hp; A.enemies.push(d); return d; }); G.boss.ents.push(...e.daughters); }
      if (e.phase === 1) { if (e.daughters.every(d => d.dead)) { e.phase = 2; e.inv = 0; toast('Mara rises in wrath', 'Nothing he shows you is real'); AU.play('roar', 1); flash('#6a0a3a', 0.5); shake(10); G.eclipse = 1; } return; }
      bMove(e, A.center.x + Math.cos(e.t * 0.3) * 3, A.center.y - 3 + Math.sin(e.t * 0.4) * 2, 1.5, dt, 0);
      if (e.cool <= 0) e.cur = { type: e.phase === 2 ? ['spiral5', 'eyebeams', 'weapons', 'summon', 'spiral5', 'eyebeams'][e.step++ % 6] : ['army', 'weapons', 'ring', 'weapons'][e.step++ % 4], t: 0, dur: 0 };
      break; }
    case 'daughter': {
      e.orbA += 0.9 * dt; bMove(e, P.x + Math.cos(e.orbA) * 4.5, P.y + Math.sin(e.orbA) * 4.5, e.spd, dt, 0);
      e.cool -= dt; if (e.cool <= 0) { e.cool = rand(1.8, 2.8); if (Math.random() < 0.3) { P.pull = { x: e.x, y: e.y, t: 1.2, f: 2.4 }; addFx({ type: 'chain', pts: [[e.x, e.y], [P.x, P.y]], life: 1.2, col: '#ff6ab0' }); AU.play('void', 0.6); } else { bFan(e, aimP(e), 6, 1.0, 6, e.dmg * 0.6, 'void', 'petal', 0.3); AU.play('eshot', 0.5); } }
      break; }
  }
}
function runBossAttack(e, dt) {
  const c = e.cur, P = G.P, A = G.A; const first = !c.init; c.init = 1;
  switch (c.type) {
    case 'spiral': c.dur = 3.6; c.acc = (c.acc || 0) + dt; while (c.acc > 0.12) { c.acc -= 0.12; c.a = (c.a || 0) + 0.24; for (let k = 0; k < 4; k++) enemyShot(e, c.a + k * Math.PI / 2, 5.2, e.dmg * 0.45, 'light', 'lightball', 0.35, 6, { ghost: 1 }); } if (first) AU.play('bolt', 1, 0.5); break;
    case 'rain': c.dur = 1.4; if (first) { for (let i = 0; i < (e.phase ? 11 : 8); i++) tele(P.x + rand(-3.5, 3.5), P.y + rand(-3.5, 3.5), 1.4, 1.1 + i * 0.04, e.dmg * 2, 'light', '#ffe890', { fall: 'pillar' }); tele(P.x, P.y, 1.4, 1.2, e.dmg * 2, 'light', '#ffe890', { fall: 'pillar' }); AU.play('warn', 0.6); } break;
    case 'ring': c.dur = 1.6; c.acc = (c.acc || 0) + dt; if (first || c.acc > 0.5) { c.acc = 0; c.n = (c.n || 0) + 1; if (c.n <= 3) bRing(e, 18, 4.6, e.dmg * 0.5, e.boss === 'mara' ? 'void' : 'light', e.boss === 'mara' ? 'voidball' : 'lightball', c.n * 0.17); } break;
    case 'summon': c.dur = 1; if (first) { const ids = { mahabrahma: ['radiant_deva', 'bliss_wisp', 'bliss_wisp'], angulimala: ['bandit', 'bandit', 'bandit_archer'], rahu: ['rahu_spawn'], ulkamukha: ['pin_throat', 'pin_throat', 'preta'], mara: ['burning_soul', 'hell_crow', 'damned'] }[e.boss]; bSummon(e, ids, e.boss === 'ulkamukha' ? 8 : 4); AU.play('summon', 0.8); } break;
    case 'dash': c.dur = 2.4; if (first) c.k = 0; c.acc = (c.acc || 0) + dt; if (c.k < 3 && c.acc > 0.75) { c.acc = 0; c.k++; const a = aimP(e); teleLine(e.x, e.y, a, 9, 1.4, 0.5, e.dmg * 1.6, 'phys', '#ff4a3a'); setTimeout(() => { if (!e.dead) e.dash = { a, t: 0.3, spd: 28 }; }, 500); AU.play('warn', 0.4); } break;
    case 'knives': c.dur = 1.3; c.acc = (c.acc || 0) + dt; if (first || (c.acc > 0.55 && !c.two)) { if (!first) c.two = 1; c.acc = 0; bFan(e, aimP(e), 7, 1.1, 8, e.dmg * 0.6, 'phys', 'knife', 0.3); AU.play('swing', 0.8); } break;
    case 'garland': c.dur = 2.2; if (first) { for (let i = 0; i < 14; i++) G.eproj.push({ x: e.x, y: e.y, vx: 0, vy: 0, dmg: e.dmg * 0.6, elem: 'phys', sprite: 'bone', r: 0.35, life: 4.5, lvl: e.lvl, spiral: { cx: e.x, cy: e.y, a: i / 14 * TAU, r: 0.8, vr: 2.2, va: 1.6 }, ghost: 1 }); AU.play('swing', 1); } break;
    case 'bite': c.dur = 1.8; if (first) { const a = aimP(e); teleLine(e.x, e.y, a, 11, 2.6, 0.8, e.dmg * 2.2, 'phys', '#ff3a3a'); setTimeout(() => { if (!e.dead) e.dash = { a, t: 0.38, spd: 28 }; }, 800); AU.play('roar', 0.5); } break;
    case 'meteors': c.dur = 1.6; if (first) { for (let i = 0; i < 11; i++) tele(P.x + rand(-4, 4), P.y + rand(-4, 4), 1.6, 1.1 + i * 0.06, e.dmg * 2, 'fire', '#ff6a1a', { fall: 'meteor' }); AU.play('warn', 0.6); } break;
    case 'voidrings': c.dur = 1.4; c.acc = (c.acc || 0) + dt; if (first || (c.acc > 0.6 && !c.two)) { if (!first) c.two = 1; c.acc = 0; bRing(e, 22, 4.4, e.dmg * 0.55, 'void', 'voidball', c.two ? 0.14 : 0); AU.play('void', 0.8); } break;
    case 'eclipse': c.dur = 2; if (first) { G.eclipse = 7; toast('Eclipse', 'Rahu swallows the light'); AU.play('gong', 1); bSummon(e, ['rahu_spawn'], 3, 4); bRing(e, 26, 3.4, e.dmg * 0.55, 'cold', 'moon', 0, 0.45); } break;
    case 'charge': c.dur = 1.6; if (first) { const a = aimP(e); teleLine(e.x, e.y, a, 12, 2, 0.7, e.dmg * 2, 'phys', '#b8b8ff'); setTimeout(() => { if (!e.dead) e.dash = { a, t: 0.42, spd: 28 }; }, 700); AU.play('roar', 0.4); } break;
    case 'breath': { c.dur = 2.4; if (first) { c.a = aimP(e); AU.play('warn', 0.8); addFx({ type: 'glow', x: e.x, y: e.y, life: 0.7, col: '#ff8a2a', z: 110 }); } if (c.t > 0.7) { c.acc = (c.acc || 0) + dt; if (e.phase) c.a += dt * 0.9 * (e.uid % 2 ? 1 : -1); while (c.acc > 0.06) { c.acc -= 0.06; enemyShot(e, c.a + rand(-0.45, 0.45), rand(6, 8), e.dmg * 0.4, 'fire', 'fireball', 0.4, 2, { ghost: 1 }); } if (Math.random() < 0.2) AU.play('fire', 0.4); } break; }
    case 'firerain': c.dur = 1.5; if (first) { for (let i = 0; i < 10; i++) tele(P.x + rand(-4, 4), P.y + rand(-4, 4), 1.5, 1.0 + i * 0.07, e.dmg * 1.8, 'fire', '#ff6a1a', { fall: 'meteor', pool: 3 }); AU.play('warn', 0.6); } break;
    case 'pull': c.dur = 2.8; if (first) { P.pull = { x: e.x, y: e.y, t: 2.6, f: 2.1 }; toast('The hunger pulls at you'); AU.play('void', 1); } c.acc = (c.acc || 0) + dt; if (c.acc > 0.8) { c.acc = 0; bRing(e, 16, 4, e.dmg * 0.5, 'fire', 'fireball', Math.random()); } break;
    case 'army': c.dur = 1.2; if (first) { bSummon(e, ['damned', 'hell_hound', 'ox_head', 'burning_soul'], 6, 5); AU.play('roar', 0.6); } break;
    case 'weapons': c.dur = 1.8; if (first) { for (let i = 0; i < (e.phase ? 16 : 12); i++) tele(P.x + rand(-4.5, 4.5), P.y + rand(-4.5, 4.5), 1.1, 0.9 + i * 0.05, e.dmg * 1.6, 'phys', '#d8c8ff', { fall: 'spear' }); tele(P.x, P.y, 1.2, 1.0, e.dmg * 1.6, 'phys', '#d8c8ff', { fall: 'spear' }); AU.play('warn', 0.6); } break;
    case 'spiral5': c.dur = 3.2; c.acc = (c.acc || 0) + dt; while (c.acc > 0.13) { c.acc -= 0.13; c.a = (c.a || 0) + 0.2; for (let k = 0; k < 5; k++) enemyShot(e, c.a + k * TAU / 5, 4.8, e.dmg * 0.45, 'void', 'voidball', 0.35, 6, { ghost: 1 }); } break;
    case 'eyebeams': c.dur = 1.8; if (first) { const a = aimP(e); for (const d of [-0.5, 0, 0.5]) teleLine(e.x, e.y, a + d, 14, 1.3, 0.9, e.dmg * 2, 'void', '#ff3a8a'); AU.play('warn', 0.8); } break;
  }
}
function bossDefeated(e) {
  const A = G.A, C = G.C; if (e.dead) return; e.dead = 1; e.hp = 0;
  const grp = G.boss; if (grp && grp.ents.some(x => !x.dead && x.boss !== 'daughter')) {
    deathFxAt(e.x, e.y, '#fff'); AU.play('die_big', 1); shake(6); dropOrb(e.x, e.y, e.xp * 0.3); for (let i = 0; i < 2; i++) spawnGroundItem(genItem(e.lvl, { mf: G.P.S.mf, bonus: 1, cls: C.cls }), e.x, e.y);
    if (e.boss !== 'daughter') for (const o of grp.ents) if (!o.dead) { o.enraged = 1; o.spd *= 1.3; }
    if (e.boss === 'daughter') toast(e.name.split(',')[0] + ' fades');
    return;
  }
  G.boss = null; $('bossbar').hidden = true; A.bossState = 2; G.eclipse = 0;
  for (const o of A.enemies) if (!o.dead && o !== e) { o.dead = 1; deathFx(o); }
  G.eproj.length = 0; G.teles.length = 0; G.hazards.length = 0;
  AU.play('die_big', 1); shake(14); flash('#fff8e0', 0.8);
  for (let i = 0; i < 60; i++) addPart(e.x + rand(-1, 1), e.y + rand(-1, 1), rand(20, 120), rand(-2, 2), rand(-2, 2), rand(40, 120), pick(['#fff4d0', '#ffd060', '#ffffff']), rand(1, 2.2), 'mote');
  dropOrb(e.x, e.y, e.xp);
  const mf = G.P.S.mf; for (let i = 0; i < 5; i++) spawnGroundItem(genItem(e.lvl + 2, { mf, bonus: 1.4, cls: C.cls }), e.x, e.y);
  spawnGroundItem(genItem(e.lvl + 2, { rar: Math.random() < 0.5 ? 3 : 2, cls: C.cls }), e.x, e.y);
  if (e.boss === 'angulimala') spawnGroundItem(makeUnique('u_garland', e.lvl), e.x, e.y);
  spawnGroundItem(genGem(e.lvl), e.x, e.y);
  for (let i = 0; i < 8; i++) A.golds.push({ x: e.x + rand(-1.5, 1.5), y: e.y + rand(-1.5, 1.5), amt: Math.round(e.lvl * rand(8, 14)), t: 0 });
  const r = A.r; C.quests['q' + r + 'c'] = 3;
  const lines = { mahabrahma: ['Mahabrahma lowers his four heads.', '"I thought I had made all of this."'], angulimala: ['"I have stopped," says Angulimala.', 'He lays down his sword, and his garland.'], rahu: ['The eclipse passes.', 'The sun was never swallowed at all.'], rooster: ['The three animals stop running.', 'The hub of the wheel is still.'], snake: ['The three animals stop running.', 'The hub of the wheel is still.'], pig: ['The three animals stop running.', 'The hub of the wheel is still.'], ulkamukha: ['The fire in its mouth goes out.', 'At last, it can swallow.'], mara: ['The monk touches the earth.', 'The earth answers.'] }[e.boss] || ['Victory', ''];
  toast(lines[0], lines[1], 6); AU.setMusic('town');
  if (r < 5) { A.exits.push({ x: A.center.x + 0.5, y: A.center.y + 1.5, type: 'realm', to: [r + 1, 0], label: REALMS[r + 1].name, role: 'realm' }); C.maxRealm = Math.max(C.maxRealm, r + 1); C.wps[areaKey(r + 1, 0)] = 1; for (const q of ['a', 'b', 'c']) if (!C.quests['q' + (r + 1) + q]) C.quests['q' + (r + 1) + q] = 1; setTimeout(() => toast('The Wheel turns', 'A path opens to the ' + REALMS[r + 1].name), 3500); }
  else { C.done = 1; setTimeout(() => startEnding(), 3800); addFx({ type: 'earth', x: A.center.x, y: A.center.y, life: 4 }); }
  saveChar(C);
}
