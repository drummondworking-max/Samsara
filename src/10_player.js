/* ================= character: stats, skills, progression, saves ================= */
const STAT_KEYS = ['str', 'dex', 'vit', 'spi'];
function newChar(cls, name) {
  const K = CLASSES[cls];
  const C = { v: 1, id: 'c' + Date.now().toString(36) + randi(100, 999), name, cls, level: 1, xp: 0, stats: Object.assign({}, K.base), statPts: 0, skillPts: 0, qSkill: 0, qStat: 0,
    skills: { [K.start]: 1 }, slots: [K.start], equip: {}, inv: new Array(40).fill(null), stash: new Array(48).fill(null), gold: 80,
    pots: { hp: 4, mp: 3, rej: 0 }, quests: {}, bonus: { life: 0, res: 0 }, maxRealm: 0, realm: 0, area: 0, wps: { r0a0: 1 },
    mantra: 0, time: 0, kills: 0, deaths: 0, created: Date.now(), imbue: 0, done: 0, seenIntro: 0, realmSeen: {} };
  for (const s of SLOTS) C.equip[s] = null;
  const w = newItem(K.weapon, 1); C.equip.weapon = w;
  C.equip.body = newItem('b_robe', 1); C.equip.feet = newItem('f_sandals', 1);
  C.quests.q0a = 1; C.quests.q0b = 1; C.quests.q0c = 1;
  return C;
}
function zeroStats() {
  return { str: 0, dex: 0, vit: 0, spi: 0, life: 0, lifePct: 0, mana: 0, lifeRegen: 0, manaRegen: 0, def: 0, defPct: 0, dr: 0, resAll: 0, res_fire: 0, res_cold: 0, res_light: 0, res_void: 0,
    el_phys: 0, el_fire: 0, el_cold: 0, el_light: 0, el_void: 0, el_spirit: 0, spellPct: 0, dmgPct: 0, castSpeed: 0, moveSpeed: 0, area: 0, duration: 0, projSpeed: 0, pierce: 0,
    crit: 0, critDmg: 0, lifeLeech: 0, manaLeech: 0, thorns: 0, mf: 0, gf: 0, xpPct: 0, pickup: 0, block: 0, dodge: 0, costRed: 0, projCount: 0, lifeOnKill: 0, manaOnKill: 0,
    minionDmg: 0, minionLife: 0, minionRegen: 0, sk_all: 0, potCap: 0, resPierce: 0, skCls: {}, skTree: {}, skOne: {}, procs: [] };
}
function addMods(S, mods) {
  for (const k in mods) {
    const v = mods[k];
    if (k.startsWith('sk_cls:')) { const c = k.split(':')[1]; S.skCls[c] = (S.skCls[c] || 0) + v; }
    else if (k.startsWith('sk_tree:')) { const [, c, t] = k.split(':'); const kk = c + ':' + t; S.skTree[kk] = (S.skTree[kk] || 0) + v; }
    else if (k.startsWith('sk_one:')) { const id = k.split(':')[1]; S.skOne[id] = (S.skOne[id] || 0) + v; }
    else if (k === 'ed' || k === 'edef') { }
    else S[k] = (S[k] || 0) + v;
  }
}
function canEquip(C, it, S) { S = S || charStats(C); if (it.gem || it.qitem) return false; if (C.level < (it.req.lvl || 1)) return false; if (it.req.str && S.baseStr < it.req.str) return false; if (it.req.dex && S.baseDex < it.req.dex) return false; if (it.req.spi && S.baseSpi < it.req.spi) return false; return true; }
function effLvl(C, id, S) {
  const h = C.skills[id] || 0; if (!h) return 0; const s = SKILLS[id];
  return h + (S.sk_all || 0) + (S.skCls[s.cls] || 0) + (S.skTree[s.cls + ':' + s.tree] || 0) + (S.skOne[id] || 0);
}
function realmResPenalty(r) { return [0, 5, 10, 15, 20, 30][r] || 0; }
function charStats(C) {
  if (C._S && !C._dirty) return C._S;
  const K = CLASSES[C.cls]; const S = zeroStats();
  let def = 0, wdmg = [2, 5];
  for (const slot of SLOTS) {
    const it = C.equip[slot]; if (!it) continue;
    addMods(S, it.mods); addMods(S, BASES[it.base].imp || {}); addMods(S, gemMods(it)); if (it.procs) S.procs.push(...it.procs);
    def += itemDef(it); if (slot === 'weapon') { wdmg = itemDmg(it) || wdmg; S.wkind = BASES[it.base].kind; }
  }
  S.baseStr = C.stats.str + S.str; S.baseDex = C.stats.dex + S.dex; S.baseSpi = C.stats.spi + S.spi;
  // passives & aura mods
  S.lv = {};
  for (const id in C.skills) { S.lv[id] = effLvl(C, id, S); }
  for (const id in C.skills) {
    const s = SKILLS[id]; const L = S.lv[id]; if (!L) continue;
    if (s.type === 'passive') addMods(S, s.mods(L));
    else if ((s.type === 'aura') && s.mods && C.slots.includes(id)) addMods(S, s.mods(L));
  }
  S.str += C.stats.str; S.dex += C.stats.dex; S.vit += C.stats.vit; S.spi += C.stats.spi;
  const lvl = C.level;
  S.lifeMax = Math.round((K.life[0] + S.vit * K.life[1] + (lvl - 1) * K.life[2] + S.life + C.bonus.life) * (1 + S.lifePct / 100));
  S.manaMax = Math.round(K.mana[0] + S.spi * K.mana[1] + (lvl - 1) * K.mana[2] + S.mana);
  S.def = Math.round((def + S.dex * 0.5 + S.def) * (1 + S.defPct / 100));
  const pen = realmResPenalty(G.realmIdx || 0);
  for (const e of ['fire', 'cold', 'light', 'void']) S['R_' + e] = clamp(S.resAll + S['res_' + e] + C.bonus.res - pen, -100, 75);
  S.dr = Math.min(50, S.dr); S.dodge = Math.min(40, S.dodge); S.block = Math.min(50, S.block); S.costRed = Math.min(50, S.costRed);
  S.speedMul = 1 + (S.castSpeed + S.dex * 0.2) / 100;
  S.moveMul = 1 + Math.min(70, S.moveSpeed) / 100;
  S.critC = Math.min(60, 5 + S.crit); S.critM = 1.5 + S.critDmg / 100;
  S.pickR = 2.3 * (1 + S.pickup / 100);
  S.manaRegenPS = (2 + S.manaMax * 0.042) * (1 + S.manaRegen / 100);
  S.lifeRegenPS = S.lifeRegen + S.lifeMax * 0.004;
  S.wdmg = wdmg; S.potMax = 5 + S.potCap;
  S.areaMul = 1 + S.area / 100; S.durMul = 1 + S.duration / 100; S.projMul = 1 + S.projSpeed / 100;
  // estimated damage of first equipped skill (for comparisons)
  let md = 0; const main = C.slots.find(id => SKILLS[id] && SKILLS[id].type !== 'passive');
  if (main) { const s = SKILLS[main]; const L = S.lv[main] || 1; if (s.dmg || s.pct) { const d = skillDamage(C, S, s, L); md = (d[0] + d[1]) / 2 / (s.cd(L) / S.speedMul); } }
  S.mainDps = md;
  C._S = S; C._dirty = 0; return S;
}
function synBonus(C, s) { let b = 0; for (const [id, p] of s.syn || []) b += (C.skills[id] || 0) * p; return b; }
function skillDamage(C, S, s, L, buffPct = 0) {
  let mn, mx;
  if (s.attack) { let pct = s.pct(L) / 100; if ((s.cls === 'archer') !== (S.wkind === 'bow')) pct *= 0.5; mn = S.wdmg[0] * pct; mx = S.wdmg[1] * pct; if (s.flat) { const f = s.flat(L); mn += f[0]; mx += f[1]; } }
  else if (s.dmg) { [mn, mx] = s.dmg(L); } else return [0, 0];
  const stat = s.stat ? S[s.stat] : 0;
  let pct = synBonus(C, s) + stat * 1.0 + (S['el_' + s.elem] || 0) + S.dmgPct + buffPct + (s.attack ? 0 : S.spellPct);
  if (s.type === 'summon') pct += S.minionDmg + C.level * 2;
  const m = 1 + pct / 100; return [mn * m, mx * m];
}
function xpNext(n) { return Math.round(62 * Math.pow(n, 1.85) + 50 * n); }
function monScale(L) { const eh = Math.min(1, 0.7 + L * 0.05), ed = Math.min(1, 0.62 + L * 0.063); return { hp: 0.8 * eh * (1 + (L - 1) * 0.2) * Math.pow(1.03, L - 1), dmg: 0.8 * ed * (1 + (L - 1) * 0.075) * Math.pow(1.006, L - 1), xp: (1 + (L - 1) * 0.3) * Math.pow(1.034, L - 1) }; }
function learnSkill(C, id) {
  const s = SKILLS[id]; if (!s || s.cls !== C.cls) return 'Not your skill';
  if (C.skillPts <= 0) return 'No skill points';
  if (C.level < TIER_REQ[s.tier]) return `Requires level ${TIER_REQ[s.tier]}`;
  const pre = prereqOf(s); if (pre && !(C.skills[pre.id] > 0)) return `Requires ${pre.name}`;
  if ((C.skills[id] || 0) >= 20) return 'Mastered';
  const first = !C.skills[id]; C.skills[id] = (C.skills[id] || 0) + 1; C.skillPts--; C._dirty = 1;
  if (first && s.type !== 'passive' && C.slots.length < 6) C.slots.push(id);
  return null;
}
function respec(C) {
  const K = CLASSES[C.cls]; C.stats = Object.assign({}, K.base); C.statPts = (C.level - 1) * 5 + C.qStat;
  C.skills = { [K.start]: 1 }; C.slots = [K.start]; C.skillPts = (C.level - 1) + C.qSkill; C._dirty = 1;
  for (const s of SLOTS) { const it = C.equip[s]; if (it && !canEquip(C, it)) { if (!invAdd(C, it)) C.stash[C.stash.indexOf(null)] = it; C.equip[s] = null; } }
  C._dirty = 1;
}
function invAdd(C, it) { const i = C.inv.indexOf(null); if (i < 0) return false; C.inv[i] = it; return true; }
function invFree(C) { return C.inv.filter(x => !x).length; }

/* saves */
function saveIndex() { return Store.get('wos_index', []); }
function saveChar(C) {
  if (!C) return;
  const data = JSON.stringify(C, (k, v) => k.startsWith('_') ? undefined : v);
  try { localStorage.setItem('wos_' + C.id, data); } catch (e) { }
  const idx = saveIndex().filter(x => x.id !== C.id); idx.unshift({ id: C.id, name: C.name, cls: C.cls, level: C.level, realm: C.maxRealm, done: C.done, t: Date.now() });
  Store.set('wos_index', idx);
}
function loadChar(id) { const C = Store.get('wos_' + id, null); if (!C) return null; for (const s of SLOTS) if (!(s in C.equip)) C.equip[s] = null; C._dirty = 1; return C; }
function deleteChar(id) { Store.del('wos_' + id); Store.set('wos_index', saveIndex().filter(x => x.id !== id)); }
