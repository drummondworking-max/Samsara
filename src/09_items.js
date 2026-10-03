/* ================= item generation ================= */
let UID = Date.now() % 100000;
const JEWEL_SLOTS = new Set(['neck', 'ring']);
function baseList() { return Object.values(BASES).filter(b => !b.uniqueOnly); }
function pickBase(ilvl, slot) {
  const cand = baseList().filter(b => b.q <= ilvl + 1 && (!slot || b.slot === slot));
  if (!cand.length) return BASES['r_ring'];
  return wpick(cand, b => { let w = 1 + (b.q / Math.max(1, ilvl)) * 3; if (JEWEL_SLOTS.has(b.slot)) w *= 0.45; if (b.slot === 'weapon') w *= 0.9; if (ilvl - b.q > 20) w *= 0.3; return w; });
}
function newItem(base, ilvl) {
  const b = typeof base === 'string' ? BASES[base] : base;
  const it = { uid: UID++, base: b.id, slot: b.slot, rar: 0, ilvl, mods: {}, sockets: 0, gems: [], name: b.name };
  if (b.def) it.def = randi(b.def[0], b.def[1]);
  it.req = Object.assign({ lvl: Math.max(1, b.q - 2) }, b.req || {});
  return it;
}
function mfFactor(mf, k) { const eff = mf * k / (mf + k); return 1 + eff / 100; }
function rollRarity(mf, bonus = 0) {
  const r = Math.random();
  const u = 0.011 * mfFactor(mf, 250) * (1 + bonus * 2), ra = 0.065 * mfFactor(mf, 500) * (1 + bonus), m = 0.33 * mfFactor(mf, 800) * (1 + bonus * 0.5);
  if (r < u) return 3; if (r < u + ra) return 2; if (r < u + ra + m) return 1; return 0;
}
function eligibleAffixes(slot, ilvl, pre) { const s = slot === 'ring' ? 'ring' : slot; return AFFIX.filter(a => a.pre === pre && a.s.includes(s) && a.t[0][0] <= ilvl && (!a.rare || Math.random() < 0.35)); }
function rollAffix(it, a, cls) {
  const tiers = a.t.filter(t => t[0] <= it.ilvl); const ti = wpick(tiers.map((t, i) => i), i => i + 1); const [mlv, lo, hi, nm] = tiers[ti];
  const v = randi(lo, hi); let key = a.k; let name = nm;
  if (a.k === 'sk_cls') { const c = Math.random() < 0.55 && cls ? cls : pick(CLASS_IDS); key = 'sk_cls:' + c; name = CLS_ADJ[c][Math.min(1, ti)]; }
  if (a.k === 'sk_tree') { const c = Math.random() < 0.6 && cls ? cls : pick(CLASS_IDS); const t = randi(0, 2); key = `sk_tree:${c}:${t}`; name = TREE_ADJ[c][t]; }
  it.mods[key] = (it.mods[key] || 0) + v; it.req.lvl = Math.max(it.req.lvl, Math.floor(mlv * 0.9));
  return { key, name, pre: a.pre };
}
function genItem(ilvl, o = {}) {
  ilvl = Math.max(1, Math.round(ilvl));
  let rar = o.rar != null ? o.rar : rollRarity(o.mf || 0, o.bonus || 0);
  let base = o.base ? BASES[o.base] : pickBase(ilvl, o.slot);
  if (rar === 3) {
    const cand = UNIQUES.filter(u => !u.noDrop && u.q <= ilvl + 2 && (!o.slot || BASES[u.base].slot === o.slot));
    if (cand.length) { const u = wpick(cand, u => 1 + u.q / ilvl * 2); return makeUnique(u.id, ilvl); }
    rar = 2;
  }
  const it = newItem(base, ilvl); it.rar = rar;
  if (rar === 0) { if (['weapon', 'body', 'head', 'offhand'].includes(it.slot) && Math.random() < 0.18) { it.sockets = randi(1, it.slot === 'body' || it.slot === 'weapon' ? 3 : 2); it.rar = 5; } }
  else {
    const cls = o.cls; const used = new Set(); const names = [];
    const take = pre => { const el = eligibleAffixes(base.slot, ilvl, pre).filter(a => !used.has(a.k)); if (!el.length) return null; const a = pick(el); used.add(a.k); const r = rollAffix(it, a, cls); names.push(r); return r; };
    if (rar === 1) { const mode = Math.random(); let p = null, s = null; if (mode < 0.4) p = take(1); else if (mode < 0.7) s = take(0); else { p = take(1); s = take(0); } if (!p && !s) p = take(1) || take(0);
      it.name = [p && p.name, base.name, s && s.name].filter(Boolean).join(' '); if (Math.random() < 0.08 && ['weapon', 'body', 'head', 'offhand'].includes(it.slot)) it.sockets = 1; }
    else { const n = randi(3, ilvl > 30 ? 6 : 5); let np = 0, ns = 0; for (let i = 0; i < n; i++) { const pre = np >= 3 ? 0 : ns >= 3 ? 1 : (Math.random() < 0.5 ? 1 : 0); if (take(pre)) { if (pre) np++; else ns++; } }
      const sb = base.slot === 'ring' ? 'ring' : base.slot; it.name = `${pick(RARE_A)} ${pick(RARE_B[sb] || RARE_B.neck)}`; if (Math.random() < 0.1 && ['weapon', 'body', 'head', 'offhand'].includes(it.slot)) it.sockets = 1; }
  }
  return it;
}
function makeUnique(uid, ilvl) { const U = UMAP[uid]; const it = newItem(U.base, Math.max(ilvl, U.q)); it.rar = 3; it.uq = uid; it.name = U.name; it.mods = Object.assign({}, U.mods); it.req.lvl = Math.max(1, U.q); if (U.procs) it.procs = U.procs; if (it.def) it.def = BASES[U.base].def[1]; return it; }
function genGem(ilvl, type, grade) { if (grade == null) { grade = 0; if (ilvl >= 18 && Math.random() < 0.45) grade = 1; if (ilvl >= 34 && Math.random() < 0.35) grade = 2; } type = type || pick(Object.keys(GEMS)); return { uid: UID++, gem: type, grade, slot: 'gem', rar: 0, name: `${GEM_GRADE[grade]} ${GEMS[type].name}`, ilvl, mods: {}, req: { lvl: GEM_Q[grade] } }; }
function itemDef(it) { if (!it.def) return 0; let ed = it.mods.edef || 0; for (const g of it.gems || []) if (GEMS[g.gem].a.edef) ed += GEMS[g.gem].a.edef[g.grade]; return Math.round(it.def * (1 + ed / 100)); }
function itemDmg(it) { const b = BASES[it.base]; if (!b.dmg) return null; const ed = it.mods.ed || 0; return [Math.round(b.dmg[0] * (1 + ed / 100)), Math.round(b.dmg[1] * (1 + ed / 100))]; }
function gemMods(it) { const out = {}; for (const g of it.gems || []) { const tbl = it.slot === 'weapon' ? GEMS[g.gem].w : GEMS[g.gem].a; for (const k in tbl) if (k !== 'edef') out[k] = (out[k] || 0) + tbl[k][g.grade]; } return out; }
function itemValue(it) {
  if (it.gem) return Math.round(40 * Math.pow(4, it.grade));
  if (it.qitem) return 0;
  const nm = Object.keys(it.mods).length; const base = 12 + it.ilvl * it.ilvl * 0.55 + (BASES[it.base].q || 1) * 6;
  return Math.round(base * [1, 2.2, 4.5, 10, 1, 1.4, 9][it.rar] * (1 + nm * 0.15) * (1 + it.sockets * 0.25));
}
const sellPrice = it => Math.max(1, Math.round(itemValue(it) / 4));
const buyPrice = it => Math.round(itemValue(it) * 1.6);
function rarClass(it) { return it.qitem ? 'cg' : 'c' + (it.rar === 5 ? 5 : it.rar); }

/* tooltip html */
function itemTipHTML(it, C, cmpWith) {
  const P = C ? charStats(C) : null; const b = it.base ? BASES[it.base] : null; const lines = [];
  const nameLine = it.rar === 6 ? `<div class="nm c6">${esc(it.name)}</div><div class="c5">${esc(b.name)}</div><div class="c6" style="font-size:13px">'${it.gems.map(g => GEMS[g.gem].name).join(' · ')}'</div>` : it.rar === 2 ? `<div class="nm c2">${esc(it.name)}</div><div class="c2">${esc(b.name)}</div>` : `<div class="nm ${rarClass(it)}">${esc(it.name)}${it.rar === 5 ? ' <span class="c5">(Socketed)</span>' : ''}</div>${it.rar === 3 ? `<div class="c3">${esc(b.name)}</div>` : ''}`;
  lines.push(nameLine);
  if (it.gem) { const G = GEMS[it.gem]; lines.push(`<div class="base">Can be inserted into socketed items</div>`); lines.push(`<div class="base">Weapons: <span class="stat">${Object.entries(G.w).map(([k, v]) => modText(k, v[it.grade])).join(', ')}</span></div>`); lines.push(`<div class="base">Armour: <span class="stat">${Object.entries(G.a).map(([k, v]) => modText(k, v[it.grade])).join(', ')}</span></div>`); }
  else if (it.qitem) lines.push(`<div class="base">Quest item</div>`);
  else {
    const dmg = itemDmg(it); if (dmg) lines.push(`<div class="base">Damage: <b style="color:${it.mods.ed ? 'var(--magic)' : 'inherit'}">${dmg[0]} to ${dmg[1]}</b></div>`);
    if (it.def) lines.push(`<div class="base">Defense: <b style="color:${it.mods.edef ? 'var(--magic)' : 'inherit'}">${itemDef(it)}</b></div>`);
    const rq = []; if (it.req.lvl > 1) rq.push(['Level', it.req.lvl, P ? C.level >= it.req.lvl : 1]); if (it.req.str) rq.push(['Strength', it.req.str, P ? P.str >= it.req.str : 1]); if (it.req.dex) rq.push(['Dexterity', it.req.dex, P ? P.dex >= it.req.dex : 1]); if (it.req.spi) rq.push(['Spirit', it.req.spi, P ? P.spi >= it.req.spi : 1]);
    for (const [k, v, ok] of rq) lines.push(`<div class="req ${ok ? '' : 'no'}">Required ${k}: ${v}</div>`);
    for (const k in b.imp) lines.push(`<div class="stat">${modText(k, b.imp[k])}</div>`);
    for (const k in it.mods) if (k !== 'ed' && k !== 'edef') lines.push(`<div class="stat">${modText(k, it.mods[k])}</div>`);
    if (it.mods.ed) lines.push(`<div class="stat">${modText('ed', it.mods.ed)}</div>`); if (it.mods.edef) lines.push(`<div class="stat">${modText('edef', it.mods.edef)}</div>`);
    if (it.procs) for (const p of it.procs) lines.push(`<div class="stat">${p.chance}% chance to release ${p.fx === 'chain' ? 'chain lightning' : ELEM_NAME[p.elem].toLowerCase() + ' nova'} ${p.on === 'hit' ? 'on hit' : p.on === 'kill' ? 'on kill' : 'when struck'}</div>`);
    if (it.sockets) { lines.push(`<div class="c5">Sockets: ${it.gems.length}/${it.sockets}</div>`); const gm = gemMods(it); for (const k in gm) lines.push(`<div class="stat">${modText(k, gm[k])}</div>`); }
    if (it.rar === 3 && UMAP[it.uq]) lines.push(`<div class="lore">${esc(UMAP[it.uq].lore)}</div>`);
    if (it.dharani) lines.push(`<div class="lore">${esc(DHMAP[it.dharani].lore)}</div>`);
  }
  if (cmpWith !== undefined && C) {
    const d = compareItem(C, it, cmpWith); if (d) lines.push(`<div class="cmp">${d}</div>`);
  }
  return lines.join('');
}
function compareItem(C, it, slot) {
  if (!slot || it.gem || it.qitem) return '';
  const before = charStats(C); const save = C.equip[slot]; C.equip[slot] = it; C._dirty = 1; const after = charStats(C); C.equip[slot] = save; C._dirty = 1; charStats(C);
  const rows = [['Life', 'lifeMax'], ['Mana', 'manaMax'], ['Defense', 'def'], ['Main damage', 'mainDps']];
  const out = [];
  for (const [n, k] of rows) { const dv = Math.round((after[k] || 0) - (before[k] || 0)); if (dv) out.push(`<span class="${dv > 0 ? 'up' : 'dn'}">${n} ${dv > 0 ? '+' : ''}${dv}</span>`); }
  return out.length ? 'Compared to equipped: ' + out.join(' · ') : '';
}
