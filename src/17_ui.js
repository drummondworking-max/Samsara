/* ================= user interface ================= */
const UI = { panel: null, arg: null, sel: null, tab: 0, skSel: null, lore: 0 };
MOD_TXT.minionRegen = v => `Guardians regenerate ${v} life per second`;
MOD_TXT.lifeRegen = MOD_TXT.lifeRegen; MOD_TXT.resPierce = v => `-${v}% to Enemy Resistances`;

/* ---------- HUD ---------- */
UI.buildHUD = function () {
  const sb = $('skillbar'); sb.innerHTML = ''; for (let i = 0; i < 6; i++) { const d = document.createElement('div'); d.className = 'sk'; d.innerHTML = '<canvas width="64" height="64"></canvas><div class="cd"></div><div class="lv"></div>'; sb.appendChild(d); }
  for (const [id, kind] of [['potHP', 'hp'], ['potMP', 'mp']]) { const c = $(id).querySelector('canvas'); const g = c.getContext('2d'); g.clearRect(0, 0, 48, 48); g.drawImage(itemIconCanvas({ pot: kind }, 48), 0, 0); }
  UI.skillbarKey = ''; UI.points();
  document.querySelectorAll('#hud [aria-label]').forEach(b => { if (!b.title) b.title = b.getAttribute('aria-label'); });
};
UI.refreshSkillbar = function () {
  const C = G.C, S = G.P ? G.P.S : charStats(C); const key = C.slots.join(',') + '|' + C.slots.map(id => S.lv[id]).join(',');
  if (key === UI.skillbarKey) return; UI.skillbarKey = key;
  const els = $('skillbar').children;
  for (let i = 0; i < 6; i++) { const el = els[i]; const id = C.slots[i]; const cv = el.querySelector('canvas'); const g = cv.getContext('2d'); g.clearRect(0, 0, 64, 64); el.querySelector('.lv').textContent = ''; if (id) { g.drawImage(skillIconCanvas(SKILLS[id], 64), 0, 0); el.querySelector('.lv').textContent = S.lv[id] || ''; el.title = SKILLS[id].name; } else el.title = 'Empty skill slot'; }
};
UI.hud = function () {
  const C = G.C, P = G.P; if (!P) return; const S = P.S;
  drawOrb($('orbL'), P.hp / S.lifeMax, '#c0281c', '#5a0a06', G.t);
  drawOrb($('orbR'), P.mp / S.manaMax, '#2a55d8', '#0a1446', G.t + 3);
  const lv = Math.max(0, Math.ceil(P.hp)), mv = Math.floor(P.mp); if (UI._lv !== lv + '/' + S.lifeMax) { UI._lv = lv + '/' + S.lifeMax; $('lifeVal').textContent = UI._lv; } if (UI._mv !== mv + '/' + S.manaMax) { UI._mv = mv + '/' + S.manaMax; $('manaVal').textContent = UI._mv; }
  $('xpbar').firstElementChild.style.width = (C.xp / xpNext(C.level) * 100).toFixed(1) + '%';
  $('potHP').querySelector('b').textContent = C.pots.hp; $('potMP').querySelector('b').textContent = C.pots.mp;
  UI.refreshSkillbar();
  const els = $('skillbar').children;
  for (let i = 0; i < 6; i++) { const id = C.slots[i]; const el = els[i]; if (!id) { el.querySelector('.cd').style.setProperty('--p', '0%'); continue; } const s = SKILLS[id]; const cd = P.cd[id] || 0, mx = P.cdMax[id] || (s.cd ? s.cd(S.lv[id] || 1) : 1); const pct = s.type === 'aura' || s.type === 'curse' ? 0 : clamp(cd / mx, 0, 1) * 100; el.querySelector('.cd').style.setProperty('--p', pct.toFixed(0) + '%'); el.classList.toggle('nomana', !!P.noMana[id]); }
  // mantra
  const mb = $('mantra'); const mc = mb.querySelector('canvas'); const g = mc.getContext('2d'); const f = C.mantra / 100;
  if (UI._mf !== Math.round(f * 100) || f >= 1) { UI._mf = Math.round(f * 100); g.clearRect(0, 0, 96, 96); g.fillStyle = rgrad(g, 48, 48, 4, 48, [[0, '#2a1a0a'], [1, '#0a0604']]); g.fillRect(0, 0, 96, 96); g.strokeStyle = '#ffd060'; g.lineWidth = 7; g.beginPath(); g.arc(48, 48, 40, -Math.PI / 2, -Math.PI / 2 + TAU * f); g.stroke(); g.save(); g.translate(16, 16); g.scale(1, 1); drawSymbol(g, 'lotus', f >= 1 ? '#ffe08a' : '#8a7040'); g.restore(); }
  mb.classList.toggle('ready', f >= 1);
  // boss
  if (G.boss) { const hp = G.boss.ents.reduce((s, e) => s + Math.max(0, e.dead ? 0 : e.hp), 0); $('bossbar').querySelector('i').style.width = (hp / G.boss.maxHp * 100).toFixed(1) + '%'; }
  drawMinimap();
};
function drawOrb(cv, frac, col, dark, t) {
  const g = cv.getContext('2d'); const W = cv.width, c = W / 2, R = W * 0.4; frac = clamp(frac, 0, 1);
  g.clearRect(0, 0, W, W);
  g.fillStyle = rgrad(g, c, c, R * 0.8, R * 1.25, [[0, '#2a2016'], [1, '#050302']]); g.beginPath(); g.arc(c, c, R * 1.22, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.arc(c, c, R, 0, TAU); g.clip();
  g.fillStyle = rgrad(g, c, c, 0, R, [[0, '#120c0a'], [1, '#050303']]); g.fillRect(0, 0, W, W);
  const top = c + R - frac * R * 2;
  g.beginPath(); g.moveTo(0, W); g.lineTo(0, top); for (let x = 0; x <= W; x += 4) g.lineTo(x, top + Math.sin(x * 0.08 + t * 3) * 2.2 + Math.sin(x * 0.03 - t * 2) * 1.5); g.lineTo(W, W); g.closePath();
  g.fillStyle = lgrad(g, 0, c - R, 0, c + R, [[0, shade(col, 0.35)], [0.5, col], [1, dark]]); g.fill();
  g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const bx = c + Math.sin(t * 0.7 + i * 2.1) * R * 0.6, by = c + R - ((t * 18 + i * 37) % (R * 2 * Math.max(0.05, frac))); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(bx, by, 2.5, 0, TAU); g.fill(); } g.globalCompositeOperation = 'source-over';
  g.fillStyle = rgrad(g, c - R * 0.35, c - R * 0.45, 2, R * 0.9, [[0, 'rgba(255,255,255,.35)'], [0.4, 'rgba(255,255,255,.06)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(0, 0, W, W);
  g.restore();
  g.strokeStyle = lgrad(g, 0, 0, W, W, [[0, '#d8b870'], [0.5, '#6a5028'], [1, '#2a1c0a']]); g.lineWidth = W * 0.05; g.beginPath(); g.arc(c, c, R * 1.06, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 2; g.beginPath(); g.arc(c, c, R, 0, TAU); g.stroke();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.PI / 8; g.fillStyle = '#b89a5a'; g.beginPath(); g.arc(c + Math.cos(a) * R * 1.14, c + Math.sin(a) * R * 1.14, W * 0.018, 0, TAU); g.fill(); }
}
UI.areaName = function () { const A = G.A; $('areaName').innerHTML = `${esc(A.def.name)}<small>${esc(REALMS[A.r].name)}${A.kind === 'town' ? '' : ' · Level ' + A.lvl}</small>`; };
UI.points = function () {
  const C = G.C; if (!C) return; const dot = (id, on) => { const b = $(id); if (!b) return; let d = b.querySelector('.dot'); if (on && !d) { d = document.createElement('span'); d.className = 'dot'; b.appendChild(d); } if (!on && d) d.remove(); };
  dot('bChar', C.statPts > 0); dot('bSkill', C.skillPts > 0); dot('bQuest', QUESTS.some(q => C.quests[q.id] === 2));
};
UI.interact = function (best) {
  const box = $('interact'); if (!best || G.state !== 'play') { if (!box.hidden) box.hidden = true; return; }
  const label = best.kind === 'wp' ? 'Use Waypoint' : best.n.role === 'stash' ? 'Open Stash' : 'Talk to ' + best.n.name.split(/[ ,]/)[0];
  if (box.hidden || UI._il !== label) { box.hidden = false; $('bInteract').textContent = label + (matchMedia('(pointer:fine)').matches ? '  (E)' : ''); UI._il = label; }
};
UI.invDirty = function () { if (UI.panel === 'inv' || UI.panel === 'vendor' || UI.panel === 'stash') UI.render(); };
UI.death = function (lose) {
  const L = $('layer'); L.hidden = false; UI.panel = 'death';
  L.innerHTML = `<div class="panel narrow stone"><div class="pb" style="text-align:center;padding:26px 20px"><h2 class="screen-title" style="color:#ff8a7a">You have been slain</h2><p class="lore" style="margin:0 auto 18px">The body you walk in is made of mind. It falls, and the mind sits on, beneath the tree.</p><p style="color:var(--gold-hi);font-family:var(--f-ui)">You lose ${fmtFull(lose)} gold.</p><button class="btn wide" id="bRespawn">Return to the Sanctuary</button></div></div>`;
  $('bRespawn').onclick = () => { AU.play('click'); respawn(); };
};

/* ---------- panels ---------- */
UI.open = function (name, arg) {
  if (G.state === 'dead') return; if (UI.panel === name && name !== 'npc') { UI.close(); return; }
  UI.panel = name; UI.arg = arg; UI.sel = null; UI.msg = ''; UI.askQ = null; UI.gemCombine = 0; if (name === 'skills') UI.skSel = UI.skSel || null;
  if (G.state === 'play' || G.state === 'panel') G.state = 'panel';
  $('layer').hidden = false; AU.play('open', 0.6); UI.render();
};
UI.close = function () { if (UI.panel === 'death') return; UI.panel = null; $('layer').hidden = true; $('layer').innerHTML = ''; if (G.state === 'panel') G.state = 'play'; AU.play('close', 0.5); if (G.C) { refreshStats(); UI.points(); } G.keys = {}; };
function ph(title) { return `<div class="ph"><h2>${title}</h2><button class="x" data-a="close" aria-label="Close">&times;</button></div>`; }
function slotHTML(it, attrs, extra = '') { if (!it) return `<button class="slot" ${attrs}>${extra}</button>`; const cls = it.rar === 5 ? 'r5' : it.rar === 6 ? 'r6' : it.rar ? 'r' + Math.min(3, it.rar) : ''; const bad = G.C && !it.gem && !it.qitem && !canEquip(G.C, it) ? ' bad' : ''; const sel = UI.sel && UI.sel.it === it ? ' sel' : ''; return `<button class="slot ${cls}${bad}${sel}" ${attrs}><img alt="" src="${iconURL(itemIconCanvas(it, 64))}"></button>`; }
UI.render = function () {
  const L = $('layer'); const C = G.C; const p = UI.panel; if (!p) return;
  let html = '';
  if (p === 'inv') html = invPanelHTML();
  else if (p === 'char') html = charPanelHTML();
  else if (p === 'skills') html = skillPanelHTML();
  else if (p === 'quests') html = questPanelHTML();
  else if (p === 'map') html = `<div class="panel wide stone" style="height:100%">${ph('Map · ' + esc(G.A.def.name))}<div class="pb" style="flex:1;display:flex"><canvas id="fullmap" style="width:100%;height:100%;min-height:260px"></canvas></div></div>`;
  else if (p === 'waypoint') html = wpPanelHTML();
  else if (p === 'npc') html = npcPanelHTML(UI.arg);
  else if (p === 'vendor') html = vendorPanelHTML(UI.arg);
  else if (p === 'gamble') html = gamblePanelHTML();
  else if (p === 'stash') html = stashPanelHTML();
  else if (p === 'menu') html = menuPanelHTML();
  else if (p === 'options') html = `<div class="panel narrow stone">${ph('Options')}<div class="pb">${optionsHTML()}</div></div>`;
  else if (p === 'help') html = helpHTML();
  else if (p === 'socket') html = servicePanelHTML('socket');
  else if (p === 'imbue') html = servicePanelHTML('imbue');
  const sc = L.querySelector('.pb') ? L.querySelector('.pb').scrollTop : 0;
  L.innerHTML = html; const pb = L.querySelector('.pb'); if (pb && UI._keepScroll) pb.scrollTop = sc; UI._keepScroll = 0;
  if (p === 'map') { const cv = $('fullmap'); const r = cv.getBoundingClientRect(); cv.width = r.width * (devicePixelRatio || 1); cv.height = r.height * (devicePixelRatio || 1); drawFullMap(cv); }
  if (p === 'skills') L.querySelectorAll('canvas[data-sk]').forEach(cv => { const s = SKILLS[cv.dataset.sk]; const g = cv.getContext('2d'); g.drawImage(skillIconCanvas(s, 64), 0, 0); });
  if (p === 'npc') { const cv = L.querySelector('canvas.port'); if (cv) { const n = UI.arg; const look = n.role === 'stash' ? null : NPC_LOOK[n.role](G.realmIdx); const pc = portraitCanvas(look); cv.width = pc.width; cv.height = pc.height; cv.getContext('2d').drawImage(pc, 0, 0); } }
  if (p === 'options') bindOptions(L);
};
$('layer') && 0;
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t || !$('layer').contains(t)) return; e.preventDefault();
  const a = t.dataset.a, v = t.dataset.v; const C = G.C; AU.init();
  switch (a) {
    case 'close': UI.close(); break;
    case 'inv': selectItem('inv', +v); break;
    case 'eq': selectItem('eq', v); break;
    case 'st': selectItem('stash', +v); break;
    case 'vd': selectItem('vendor', +v); break;
    case 'equip': doEquip(v); break;
    case 'unequip': doUnequip(); break;
    case 'drop': doDrop(); break;
    case 'sell': doSell(); break;
    case 'buy': doBuy(); break;
    case 'tostash': doStashMove(); break;
    case 'socketin': doSocket(v); break;
    case 'stat': if (C.statPts > 0) { const n = e.shiftKey ? Math.min(5, C.statPts) : 1; C.stats[v] += n; C.statPts -= n; C._dirty = 1; refreshStats(); AU.play('click'); UI._keepScroll = 1; UI.render(); UI.points(); saveChar(C); } break;
    case 'sknode': UI.skSel = v; AU.play('click'); UI._keepScroll = 1; UI.render(); break;
    case 'learn': { const err = learnSkill(C, v); if (err) { UI.msg = err; AU.play('error'); } else { AU.play('bell', 0.6); refreshStats(); UI.msg = ''; saveChar(C); } UI._keepScroll = 1; UI.render(); UI.points(); break; }
    case 'skeq': { const i = C.slots.indexOf(v); if (i >= 0) C.slots.splice(i, 1); else if (C.slots.length < 6) C.slots.push(v); else { UI.msg = 'All six skill slots are in use. Unequip one first.'; AU.play('error'); } C._dirty = 1; refreshStats(); UI._keepScroll = 1; UI.render(); saveChar(C); break; }
    case 'tab': UI.tab = +v; UI.render(); break;
    case 'quest': UI.qSel = v; UI.render(); break;
    case 'claim': claimQuest(QMAP[v]); UI.render(); break;
    case 'wp': { const [r, i] = v.split(',').map(Number); travelWP(r, i); break; }
    case 'npcopt': npcOption(v); break;
    case 'potbuy': { const pr = potPrice(v); const S = G.P.S; if (C.gold < pr) { AU.play('error'); UI.msg = 'Not enough gold.'; } else if (C.pots[v] >= S.potMax) { UI.msg = 'You cannot carry more.'; AU.play('error'); } else { C.gold -= pr; C.pots[v]++; AU.play('coin'); } UI._keepScroll = 1; UI.render(); break; }
    case 'potfill': { const S = G.P.S; let n = 0; for (const k of ['hp', 'mp']) while (C.pots[k] < S.potMax && C.gold >= potPrice(k)) { C.gold -= potPrice(k); C.pots[k]++; n++; } AU.play(n ? 'coin' : 'error'); UI._keepScroll = 1; UI.render(); break; }
    case 'gamble': { const it = gamble(v); if (it) UI.sel = { src: 'inv', idx: C.inv.indexOf(it), it }; UI._keepScroll = 1; UI.render(); break; }
    case 'svc': doService(v); break;
    case 'menu': if (v === 'resume') UI.close(); else if (v === 'options') UI.open('options'); else if (v === 'help') UI.open('help'); else if (v === 'exit') { saveChar(C); UI.panel = null; $('layer').hidden = true; G.state = 'title'; $('hud').hidden = true; AU.setMusic('title'); showTitle(); } break;
    case 'respec': { const cost = respecCost(); if (C.gold < cost) { AU.play('error'); UI.msg = 'You need ' + fmtFull(cost) + ' gold.'; UI.render(); break; } C.gold -= cost; respec(C); refreshStats(); UI.skillbarKey = ''; AU.play('gong'); UI.msg = 'Your vows are renewed. All attribute and skill points have been returned.'; UI.points(); saveChar(C); UI.render(); break; }
    case 'lore': UI.lore++; UI.askQ = null; UI.render(); break;
    case 'gemmenu': UI.gemCombine = 1; UI.render(); break;
    case 'gemback': UI.gemCombine = 0; UI.render(); break;
    case 'gemfuse': { const [g, gr] = v.split(':'); let n = 0; for (let i = 0; i < C.inv.length && n < 3; i++) { const it = C.inv[i]; if (it && it.gem === g && it.grade === +gr) { C.inv[i] = null; n++; } } if (n === 3) { invAdd(C, genGem(C.level, g, +gr + 1)); AU.play('drop_rare', 1); UI.msg = `The gems fuse into a ${GEM_GRADE[+gr + 1]} ${GEMS[g].name}.`; saveChar(C); } UI.render(); break; }
    case 'askq': UI.askQ = v; AU.play('click'); UI.render(); break;
  }
});
document.addEventListener('contextmenu', e => { const t = e.target.closest('[data-a="inv"],[data-a="eq"]'); if (!t) return; e.preventDefault(); const C = G.C; if (t.dataset.a === 'inv') { const it = C.inv[+t.dataset.v]; if (!it) return; if (UI.panel === 'vendor') { UI.sel = { src: 'inv', idx: +t.dataset.v, it }; doSell(); return; } if (UI.panel === 'stash') { UI.sel = { src: 'inv', idx: +t.dataset.v, it }; doStashMove(); return; } UI.sel = { src: 'inv', idx: +t.dataset.v, it }; doEquip(); } else { const it = C.equip[t.dataset.v]; if (!it) return; UI.sel = { src: 'eq', slot: t.dataset.v, it }; doUnequip(); } });
document.addEventListener('dblclick', e => { const t = e.target.closest('[data-a="inv"]'); if (!t || UI.panel !== 'inv') return; const C = G.C; const it = C.inv[+t.dataset.v]; if (!it) return; UI.sel = { src: 'inv', idx: +t.dataset.v, it }; doEquip(); });

function itemAt(a, v) { const C = G.C; if (a === 'inv') return C.inv[+v]; if (a === 'eq') return C.equip[v]; if (a === 'st') return C.stash[+v]; if (a === 'vd') return UI.vstock()[+v]; return null; }
document.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse' || !UI.panel) return; const t = e.target.closest('[data-a]'); if (!t) return; const a = t.dataset.a;
  if (['inv', 'eq', 'st', 'vd'].includes(a)) { const tb = $('tipbox'); if (!tb) return; const it = itemAt(a, t.dataset.v); if (!it || (UI.sel && UI.sel.it === it)) return; const cmp = a !== 'eq' && it.slot && it.slot !== 'gem' ? (it.slot === 'ring' ? 'ring1' : it.slot) : undefined; let price = ''; if (UI.panel === 'vendor') price = a === 'vd' ? `<div class="gold" style="margin-top:6px">Price: ${fmtFull(it.gem ? itemValue(it) * 2 : buyPrice(it))}</div>` : !it.qitem ? `<div class="gold" style="margin-top:6px">Sells for: ${fmtFull(sellPrice(it))}</div>` : ''; tb.innerHTML = `<div class="itip">${itemTipHTML(it, G.C, cmp)}${price}<div class="cmp">Click to select${UI.panel === 'inv' ? ', right-click to equip' : UI.panel === 'vendor' ? ', right-click to sell' : ''}</div></div>`; UI._hover = 1; }
  if (a === 'sknode' && UI.panel === 'skills') { const box = $('skinfoBox'); if (!box || t.dataset.v === UI.skSel) return; box.innerHTML = skillInfoHTML(t.dataset.v, true); UI._hover = 1; }
});
document.addEventListener('pointerout', e => {
  if (e.pointerType !== 'mouse' || !UI._hover) return; const t = e.target.closest('[data-a]'); if (!t) return; if (e.relatedTarget && t.contains(e.relatedTarget)) return;
  UI._hover = 0; const tb = $('tipbox'); if (tb) tb.innerHTML = tipInner(); const box = $('skinfoBox'); if (box) box.innerHTML = skillInfoHTML(UI.skSel, false);
});
function selectItem(src, key) {
  const C = G.C; let it = null;
  if (src === 'inv') it = C.inv[key]; else if (src === 'eq') it = C.equip[key]; else if (src === 'stash') it = C.stash[key]; else if (src === 'vendor') it = UI.vstock()[key];
  if (!it) { UI.sel = null; UI._keepScroll = 1; UI.render(); return; }
  if (UI.sel && UI.sel.it === it) { UI.sel = null; } else UI.sel = { src, idx: key, slot: src === 'eq' ? key : null, it };
  AU.play('click', 0.6); UI._keepScroll = 1; UI.render();
}
function doEquip(slotPref) {
  const C = G.C, sel = UI.sel; if (!sel || sel.src !== 'inv') return; const it = sel.it;
  if (!canEquip(C, it)) { AU.play('error'); UI.msg = 'You do not meet the requirements.'; UI.render(); return; }
  let slot = it.slot; if (slot === 'ring') slot = slotPref || (!C.equip.ring1 ? 'ring1' : !C.equip.ring2 ? 'ring2' : 'ring1');
  const old = C.equip[slot]; C.equip[slot] = it; C.inv[sel.idx] = old || null; C._dirty = 1; refreshStats(); UI.skillbarKey = '';
  AU.play('pickup'); UI.sel = old ? { src: 'inv', idx: sel.idx, it: old } : null; UI.msg = ''; UI._keepScroll = 1; UI.render(); saveChar(C);
}
function doUnequip() { const C = G.C, sel = UI.sel; if (!sel || sel.src !== 'eq') return; const i = C.inv.indexOf(null); if (i < 0) { UI.msg = 'Your inventory is full.'; AU.play('error'); UI.render(); return; } C.inv[i] = C.equip[sel.slot]; C.equip[sel.slot] = null; C._dirty = 1; refreshStats(); UI.skillbarKey = ''; AU.play('pickup'); UI.sel = null; UI._keepScroll = 1; UI.render(); saveChar(C); }
function doDrop() { const C = G.C, sel = UI.sel; if (!sel) return; if (sel.src === 'inv') C.inv[sel.idx] = null; else if (sel.src === 'eq') { C.equip[sel.slot] = null; C._dirty = 1; refreshStats(); } else return; spawnGroundItem(sel.it, G.P.x, G.P.y); G.A.items[G.A.items.length - 1].t = -2; UI.sel = null; UI._keepScroll = 1; UI.render(); }
function doSell() { const C = G.C, sel = UI.sel; if (!sel || sel.src !== 'inv' || UI.panel !== 'vendor') return; if (sel.it.qitem) return; C.gold += sellPrice(sel.it); C.inv[sel.idx] = null; UI.vstock().push(sel.it); AU.play('coin'); UI.sel = null; UI._keepScroll = 1; UI.render(); saveChar(C); }
function doBuy() { const C = G.C, sel = UI.sel; if (!sel || sel.src !== 'vendor') return; const pr = sel.it.gem ? itemValue(sel.it) * 2 : buyPrice(sel.it); if (C.gold < pr) { UI.msg = 'Not enough gold.'; AU.play('error'); UI.render(); return; } const i = C.inv.indexOf(null); if (i < 0) { UI.msg = 'Your inventory is full.'; AU.play('error'); UI.render(); return; } C.gold -= pr; C.inv[i] = sel.it; const st = UI.vstock(); st.splice(st.indexOf(sel.it), 1); AU.play('coin'); UI.sel = { src: 'inv', idx: i, it: sel.it }; UI._keepScroll = 1; UI.render(); saveChar(C); }
function doStashMove() { const C = G.C, sel = UI.sel; if (!sel) return; if (sel.src === 'inv') { const j = C.stash.indexOf(null); if (j < 0) { UI.msg = 'Your stash is full.'; AU.play('error'); } else { C.stash[j] = sel.it; C.inv[sel.idx] = null; AU.play('click'); } } else if (sel.src === 'stash') { const j = C.inv.indexOf(null); if (j < 0) { UI.msg = 'Your inventory is full.'; AU.play('error'); } else { C.inv[j] = sel.it; C.stash[sel.idx] = null; AU.play('click'); } } UI.sel = null; UI._keepScroll = 1; UI.render(); saveChar(C); }
function doSocket(v) {
  const C = G.C, sel = UI.sel; if (!sel) return; const [kind, key] = v.split(':');
  let target, gem, gemRef;
  if (sel.it.gem) { gem = sel.it; gemRef = sel; target = kind === 'eq' ? C.equip[key] : C.inv[+key]; }
  else { target = sel.it; const gi = +key; gem = C.inv[gi]; gemRef = { src: 'inv', idx: gi }; }
  if (!target || !gem || !gem.gem || target.gems.length >= target.sockets) return;
  target.gems.push(gem); if (gemRef.src === 'inv') C.inv[gemRef.idx] = null; const dh = checkDharani(target); C._dirty = 1; refreshStats(); AU.play(dh ? 'drop_unique' : 'drop_magic', 1); UI.sel = null; UI.msg = dh ? `The gems resonate. ${BASES[target.base].name} becomes the Dharani '${dh.name}'.` : `${gem.name} set into ${target.name}.`; if (dh) toast(dh.name, 'A Dharani has formed', 3); UI._keepScroll = 1; UI.render(); saveChar(C);
}
function itemActions(sel) {
  const C = G.C, it = sel.it; const b = []; const P = UI.panel;
  if (P === 'vendor') { if (sel.src === 'vendor') b.push(`<button class="btn small" data-a="buy">Buy · ${fmtFull(it.gem ? itemValue(it) * 2 : buyPrice(it))}</button>`); if (sel.src === 'inv' && !it.qitem) b.push(`<button class="btn small" data-a="sell">Sell · ${fmtFull(sellPrice(it))}</button>`); }
  else if (P === 'stash') { b.push(`<button class="btn small" data-a="tostash">${sel.src === 'stash' ? 'Take' : 'Store'}</button>`); }
  else {
    if (sel.src === 'inv' && !it.gem && !it.qitem) { if (it.slot === 'ring') { b.push(`<button class="btn small" data-a="equip" data-v="ring1">Equip Left</button><button class="btn small" data-a="equip" data-v="ring2">Equip Right</button>`); } else b.push(`<button class="btn small" data-a="equip">Equip</button>`); }
    if (sel.src === 'eq') b.push(`<button class="btn small" data-a="unequip">Unequip</button>`);
    if (it.gem) { const targets = []; for (const s of SLOTS) { const t = C.equip[s]; if (t && t.sockets > t.gems.length) targets.push([`eq:${s}`, t]); } C.inv.forEach((t, i) => { if (t && t.sockets > (t.gems || []).length) targets.push([`inv:${i}`, t]); }); for (const [k, t] of targets.slice(0, 6)) b.push(`<button class="btn small" data-a="socketin" data-v="${k}">Insert into ${esc(t.name)}</button>`); }
    else if (it.sockets > (it.gems || []).length) { C.inv.forEach((g, i) => { if (g && g.gem) b.push(`<button class="btn small" data-a="socketin" data-v="gem:${i}">Insert ${esc(g.name)}</button>`); }); }
    if (sel.src !== 'vendor') b.push(`<button class="btn small red" data-a="drop">Drop</button>`);
  }
  return `<div class="actions">${b.join('')}</div>`;
}
function tipBox() { return `<div id="tipbox">${tipInner()}</div>`; }
function tipInner() { const sel = UI.sel; const C = G.C; if (!sel) return `<div class="itip" style="color:var(--dim);font-family:var(--f-body);font-style:italic">${UI.msg ? `<span style="color:var(--gold-hi);font-style:normal">${esc(UI.msg)}</span>` : 'Select an item to see its properties.'}</div>`; const cmpSlot = sel.src !== 'eq' && sel.it.slot && sel.it.slot !== 'gem' ? (sel.it.slot === 'ring' ? 'ring1' : sel.it.slot) : undefined; return `<div class="itip tipdock">${itemTipHTML(sel.it, C, cmpSlot)}${UI.msg ? `<div style="color:var(--gold-hi);margin-top:6px">${esc(UI.msg)}</div>` : ''}${itemActions(sel)}</div>`; }
function dollHTML() { const C = G.C; return `<div class="doll">${SLOTS.map(s => `<div style="grid-area:${s}">${slotHTML(C.equip[s], `data-a="eq" data-v="${s}" aria-label="${SLOT_NAME[s]}"`, `<span class="ghost">${SLOT_NAME[s]}</span>`)}</div>`).join('')}</div>`; }
function bagHTML(src = 'inv') { const C = G.C; return `<div class="grid">${C.inv.map((it, i) => slotHTML(it, `data-a="inv" data-v="${i}"`)).join('')}</div>`; }
function invPanelHTML() { const C = G.C; return `<div class="panel stone">${ph('Inventory')}<div class="pb"><div class="invwrap two"><div>${dollHTML()}<div class="goldline" style="justify-content:center;margin-top:10px"><span class="coin"></span>${fmtFull(C.gold)} gold</div></div><div><div class="sec">Bag</div>${bagHTML()}${tipBox()}</div></div></div></div>`; }
function charPanelHTML() {
  const C = G.C, S = charStats(C), K = CLASSES[C.cls]; const row = (k, v) => `<div class="k">${k}</div><div class="v">${v}</div>`;
  const res = e => { const v = S['R_' + e]; return `<span style="color:${v >= 75 ? 'var(--good)' : v < 0 ? 'var(--bad)' : 'inherit'}">${v}%</span>`; };
  const attr = (k, sub) => `<div class="nm">${STAT_NAME[k]}<small>${sub}</small></div><div class="v">${S[k]}</div><button class="plus" data-a="stat" data-v="${k}" ${C.statPts ? '' : 'disabled'} aria-label="Add a point to ${STAT_NAME[k]}">+</button>`;
  const main = C.slots.find(id => SKILLS[id] && (SKILLS[id].dmg || SKILLS[id].pct));
  let dmgLine = '—'; if (main) { const d = skillDamage(C, S, SKILLS[main], S.lv[main]); dmgLine = `${fmt(d[0])}–${fmt(d[1])} <span style="color:var(--dim)">(${SKILLS[main].name})</span>`; }
  return `<div class="panel stone">${ph('Character')}<div class="pb"><div style="display:flex;gap:14px;align-items:center;margin-bottom:10px"><div><div style="font-family:var(--f-ui);font-size:22px;color:var(--gold-hi);letter-spacing:.06em">${esc(C.name)}</div><div style="color:var(--dim)">Level ${C.level} ${K.name} · ${K.title}</div><div style="color:var(--dim);font-size:14px">Experience ${fmtFull(C.xp)} / ${fmtFull(xpNext(C.level))}</div></div></div>
  <div class="cs"><div><div class="pts">${C.statPts ? `${C.statPts} attribute point${C.statPts > 1 ? 's' : ''} to spend` : 'No unspent attribute points'}</div><div class="attr">${attr('str', 'Physical skill damage, gear requirements')}${attr('dex', 'Bow damage, speed, defense')}${attr('vit', 'Life')}${attr('spi', 'Mana, spell damage')}</div>
  <p style="color:var(--dim);font-size:13px;margin-top:10px">Each point in the attribute a skill draws on adds 1% to its damage. ${K.name} skills draw mostly on ${STAT_NAME[K.stat]}.</p></div>
  <div class="kv">${row('Life', S.lifeMax)}${row('Mana', S.manaMax)}${row('Main skill damage', dmgLine)}${row('Defense', S.def)}${row('Physical reduction', S.dr + '%')}${row('Fire resist', res('fire'))}${row('Cold resist', res('cold'))}${row('Lightning resist', res('light'))}${row('Void resist', res('void'))}${row('Critical chance', S.critC.toFixed(0) + '%')}${row('Casting speed', '+' + Math.round((S.speedMul - 1) * 100) + '%')}${row('Walking speed', '+' + Math.round((S.moveMul - 1) * 100) + '%')}${row('Life per second', S.lifeRegenPS.toFixed(1))}${row('Mana per second', S.manaRegenPS.toFixed(1))}${row('Magic find', S.mf + '%')}${row('Gold find', S.gf + '%')}${row('Kills', fmtFull(C.kills))}${row('Time on the path', Math.floor(C.time / 3600) + 'h ' + Math.floor(C.time % 3600 / 60) + 'm')}</div></div>
  ${realmResPenalty(G.realmIdx) ? `<p style="color:var(--dim);font-size:13px">Resistances are reduced by ${realmResPenalty(G.realmIdx)}% in the ${REALMS[G.realmIdx].name}.</p>` : ''}</div></div>`;
}
function skillLines(s, L, C, S) {
  const out = []; if (!L) return out;
  if (s.type === 'passive') { const m = s.mods(L); for (const k in m) out.push(modText(k, Math.round(m[k] * 10) / 10)); return out; }
  const p = s.p ? s.p(L) : {};
  if (s.dmg || s.pct) { const d = skillDamage(C, S, s, L); if (s.attack) out.push(`Damage: ${fmt(d[0])}–${fmt(d[1])} ${ELEM_NAME[s.elem]} <span style="color:var(--dim)">(${Math.round(s.pct(L))}% weapon damage)</span>`); else out.push(`${s.type === 'aura' || s.type === 'zone' || s.type === 'beam' ? 'Damage per tick' : 'Damage'}: ${fmt(d[0])}–${fmt(d[1])} ${ELEM_NAME[s.elem]}`); }
  if (s.mods && s.type !== 'passive') { const m = s.mods(L); for (const k in m) out.push(modText(k, Math.round(m[k] * 10) / 10)); }
  const lab = { n: 'Projectiles', pierce: 'Pierces', radius: 'Radius', jumps: 'Chain jumps', max: 'Maximum summoned', dur: 'Duration', heal: 'Heals %', curse: 'Damage taken +%', slow: 'Slow %', explode: 'Burst radius', chain: 'Lightning jumps', fear: 'Fear (s)', orbitR: 'Orbit radius', stun: 'Stun (s)', execute: 'Erases foes below % life', area: 'Area', impact: 'Impact radius' };
  for (const k in lab) if (p[k] != null && (typeof p[k] === 'number') && !(k === 'pierce' && p[k] > 90)) { let v = p[k]; if (k === 'n' && (s.type === 'bolt' || s.type === 'boomerang')) v += S.projCount; out.push(`${lab[k]}: ${Math.round(v * 10) / 10}`); }
  if (p.hp) out.push(`Guardian life: ${fmt(p.hp * (1 + S.minionLife / 100))}`);
  if (p.lifeHit) out.push(`Each foe struck restores ${p.lifeHit}% of your life (up to 5 foes)`);
  if (s.bmods) { const b = s.bmods(L); out.push(`+${b.dmgPct}% damage, +${b.area}% area, +${b.moveSpeed}% walking speed`); }
  if (s.cost) out.push(`Mana cost: ${Math.round(s.cost(L) * (1 - S.costRed / 100) * 10) / 10}`);
  if (s.cd && s.type !== 'aura' && s.type !== 'curse') out.push(`Cooldown: ${(s.cd(L) / S.speedMul).toFixed(2)}s`);
  return out;
}
function skillPanelHTML() {
  const C = G.C, S = charStats(C), K = CLASSES[C.cls];
  const cols = [0, 1, 2].map(t => { const list = treeSkills(C.cls, t); return `<div class="tree"><h4>${K.trees[t]}</h4>${list.map(s => { const h = C.skills[s.id] || 0; const lv = S.lv[s.id] || 0; const pre = prereqOf(s); const avail = C.skillPts > 0 && C.level >= TIER_REQ[s.tier] && (!pre || C.skills[pre.id]) && h < 20; const locked = !h && !avail; const eq = C.slots.includes(s.id); return `<button class="snode ${locked ? 'locked' : ''} ${avail ? 'avail' : ''} ${UI.skSel === s.id ? 'sel' : ''}" data-a="sknode" data-v="${s.id}" aria-label="${esc(s.name)}"><canvas width="64" height="64" data-sk="${s.id}"></canvas>${h || lv ? `<span class="lv">${lv}${lv !== h ? '' : ''}</span>` : ''}${eq ? '<span class="eq" title="Equipped"></span>' : ''}</button>`; }).join('')}</div>`; }).join('');
  const info = `<div id="skinfoBox">${skillInfoHTML(UI.skSel, false)}</div>`;
  const slots = `<div class="slotsbar">${[0, 1, 2, 3, 4, 5].map(i => { const sid = C.slots[i]; return sid ? `<button class="sk" data-a="sknode" data-v="${sid}" title="${esc(SKILLS[sid].name)}" style="padding:0"><canvas width="64" height="64" data-sk="${sid}"></canvas></button>` : '<div class="sk"></div>'; }).join('')}</div>`;
  return `<div class="panel wide stone">${ph('Skills')}<div class="pb"><div class="pts">${C.skillPts ? `${C.skillPts} skill point${C.skillPts > 1 ? 's' : ''} to spend` : 'No unspent skill points'}</div><div class="sec" style="text-align:center">Equipped · all six cast themselves</div>${slots}<div class="trees">${cols}</div>${info}</div></div>`;
}
function skillInfoHTML(id, preview) {
  const C = G.C, S = charStats(C), K = CLASSES[C.cls];
  let info = `<div class="skinfo" style="color:var(--dim);font-style:italic">Select a skill to read about it. Skills unlock at levels ${TIER_REQ.join(', ')}. Each needs a point in the skill above it.</div>`;
  if (id && SKILLS[id] && SKILLS[id].cls === C.cls) {
    const s = SKILLS[id]; const h = C.skills[id] || 0; const L = S.lv[id] || 0; const next = (L || 0) + 1; const pre = prereqOf(s);
    const cur = skillLines(s, L, C, S), nx = skillLines(s, next, C, S);
    const syn = (s.syn || []).map(([o, pct]) => `${SKILLS[o].name}: +${pct}% per point <span style="color:var(--dim)">(now +${(C.skills[o] || 0) * pct}%)</span>`);
    const reqs = []; if (C.level < TIER_REQ[s.tier]) reqs.push(`Requires level ${TIER_REQ[s.tier]}`); if (pre && !C.skills[pre.id]) reqs.push(`Requires ${pre.name}`);
    const active = s.type !== 'passive';
    info = `<div class="skinfo"><h3>${esc(s.name)}</h3><div class="tp">${K.trees[s.tree]} · ${s.type === 'passive' ? 'Passive' : s.type === 'aura' || s.type === 'curse' ? 'Aura' : 'Auto-cast'}${s.elem ? ' · ' + ELEM_NAME[s.elem] : ''} · Level ${L}${L !== h ? ` (${h} + ${L - h} from items)` : ''}</div><p style="margin:.4em 0">${esc(s.desc)}</p>
    ${cur.length ? `<div class="sec">Current level</div>${cur.map(l => `<div class="ln">${l}</div>`).join('')}` : ''}${h < 20 ? `<div class="sec">Next level</div>${nx.map(l => `<div class="nx">${l}</div>`).join('')}` : ''}
    ${syn.length ? `<div class="sec">Synergies</div>${syn.map(l => `<div class="syn">${l}</div>`).join('')}` : ''}${reqs.length ? `<div style="color:var(--bad);margin-top:6px">${reqs.join(' · ')}</div>` : ''}
    ${UI.msg ? `<div style="color:var(--gold-hi);margin-top:6px">${esc(UI.msg)}</div>` : ''}
    ${preview ? '<div class="cmp">Click to select this skill</div>' : `<div class="actions" style="justify-content:flex-start"><button class="btn small" data-a="learn" data-v="${id}" ${C.skillPts > 0 && h < 20 ? '' : 'disabled'}>Learn (+1)</button>${active && h ? `<button class="btn small" data-a="skeq" data-v="${id}">${C.slots.includes(id) ? 'Unequip' : 'Equip'}</button>` : ''}</div>`}</div>`;
  }
  return info;
}
function questPanelHTML() {
  const C = G.C; const state = q => C.quests[q.id] || 0;
  const rows = REALMS.map((R, r) => `<div class="rn">${R.name.replace(' Realm', '')}</div>${QUESTS.filter(q => q.realm === r).map(q => { const s = state(q); const cls = s === 3 ? 'd' : s === 2 ? 'r' : s === 1 ? 'a' : ''; return `<button class="qcell ${cls}" data-a="quest" data-v="${q.id}" ${r > C.maxRealm ? 'disabled' : ''}>${r > C.maxRealm ? '· · ·' : esc(q.name)}</button>`; }).join('')}`).join('');
  let info = ''; const q = QMAP[UI.qSel]; if (q && q.realm <= C.maxRealm) { const s = state(q); info = `<div class="skinfo"><h3>${esc(q.name)}</h3><div class="tp">${REALMS[q.realm].name} · ${['Not begun', 'In progress', 'Return to ' + REALMS[q.realm].guide.name, 'Complete'][s]}</div><p>${esc(q.obj)}</p><div class="syn">Reward: ${esc(q.rtext)}</div></div>`; }
  return `<div class="panel stone">${ph('Quests')}<div class="pb"><div class="qgrid">${rows}</div>${info}</div></div>`;
}
function wpPanelHTML() {
  const C = G.C; let html = ''; for (let r = 0; r <= C.maxRealm; r++) { const R = REALMS[r]; html += `<div class="rn">${R.name}</div>`; R.areas.forEach((a, i) => { if (a.kind !== 'town' && !a.wp) return; const key = areaKey(r, i); const ok = C.wps[key]; const here = G.A.key === key; html += `<button class="btn wide" data-a="wp" data-v="${r},${i}" ${ok && !here ? '' : 'disabled'} style="justify-content:space-between"><span>${esc(a.name)}</span><span style="font-size:11px;color:var(--dim)">${here ? 'You are here' : ok ? (a.kind === 'town' ? 'Sanctuary' : 'Level ' + realmLvl(r, a.d)) : 'Undiscovered'}</span></button>`; }); }
  return `<div class="panel narrow stone">${ph('Waypoints')}<div class="pb"><div class="wp">${html}</div></div></div>`;
}
function npcPanelHTML(n) {
  const C = G.C; const r = G.realmIdx; const R = REALMS[r]; let text = ''; const opts = [];
  if (n.role === 'guide') {
    const claim = QUESTS.filter(q => C.quests[q.id] === 2); const active = QUESTS.filter(q => q.realm === r && C.quests[q.id] === 1);
    const asked = UI.askQ && QMAP[UI.askQ];
    if (claim.length) { const q = claim[0]; text = q.done; for (const c of claim) opts.push(`<button class="btn" data-a="claim" data-v="${c.id}">Complete: ${esc(c.name)} · ${esc(c.rtext)}</button>`); }
    else if (asked) text = `<b style="font-family:var(--f-ui);color:var(--gold)">${esc(asked.name)}</b><br>${esc(asked.give)}<br><span style="color:var(--dim);font-size:15px">Reward: ${esc(asked.rtext)}</span>`;
    else text = GUIDE_LINES[r][UI.lore % GUIDE_LINES[r].length] + (active.length && !UI.lore ? `<br><br><span style="color:var(--dim)">There ${active.length > 1 ? 'are ' + active.length + ' tasks' : 'is a task'} for you in this realm.</span>` : '');
    for (const q of active) if (!asked || asked.id !== q.id) opts.push(`<button class="btn" data-a="askq" data-v="${q.id}">Ask about: ${esc(q.name)}</button>`);
    opts.push(`<button class="btn" data-a="lore">Hear counsel</button>`);
    opts.push(`<button class="btn" data-a="npcopt" data-v="respec">Renew your vows · ${fmtFull(respecCost())} gold</button>`);
  } else if (n.role === 'merchant') { text = ['Chitraratha plucks a string. "Even gods need potions, pilgrim. Especially gods."', '"Roads are long and bandits are many. Buy something."', '"Prices are fair. The war sees to that."', '"I trade what the jungle leaves behind."', '"I was fed once, at Ullambana. Now I feed others. For a price."', '"I warded the damned for a thousand years. Now I sell them water. It is a kind of penance."'][r]; opts.push(`<button class="btn" data-a="npcopt" data-v="trade">Trade</button>`); }
  else if (n.role === 'smith' && UI.gemCombine) {
    text = 'Three gems of one kind and quality can be fused into a single gem of the next quality.';
    const groups = {}; C.inv.forEach(it => { if (it && it.gem && it.grade < 2) { const k = it.gem + ':' + it.grade; groups[k] = (groups[k] || 0) + 1; } });
    const ks = Object.keys(groups).filter(k => groups[k] >= 3); if (!ks.length) text += '<br><br><span style="color:var(--dim)">You carry no three matching gems.</span>';
    for (const k of ks) { const [g, gr] = k.split(':'); opts.push(`<button class="btn" data-a="gemfuse" data-v="${k}">Fuse three ${GEM_GRADE[gr]} ${GEMS[g].name} (${groups[k]})</button>`); }
    opts.push(`<button class="btn" data-a="gemback">Back</button>`);
  }
  else if (n.role === 'smith') { text = ['"My master built the palaces of heaven. I mend their doorhinges."', '"Cunda, at your service. The Buddha ate his last meal at my house. I have been careful ever since."', '"Maya forges the asuras\' arms. For you, something that will not break."', 'The great elephant lifts a hammer in his trunk and nods.', '"Bronze is all that is left here. Bronze and hunger."', '"Every chain in this hell passed through my hands."'][r]; opts.push(`<button class="btn" data-a="npcopt" data-v="trade">Trade</button>`, `<button class="btn" data-a="npcopt" data-v="socket">Add a socket</button>`, `<button class="btn" data-a="gemmenu">Fuse gems</button>`); if (C.imbue) opts.push(`<button class="btn" data-a="npcopt" data-v="imbue">Imbue an item (quest reward)</button>`); }
  else if (n.role === 'gambler') { text = ['"Shake the fortune sticks, pilgrim. One of them always falls out."', '"The dice know nothing. That is their charm."', '"Spoils of war, sealed. Who knows what is inside?"', 'The jackal grins and nudges a covered basket toward you.', '"Every alms bowl is a gamble."', '"Yama keeps the ledger. I only keep the odds."'][r]; opts.push(`<button class="btn" data-a="npcopt" data-v="gamble">Gamble</button>`); }
  opts.push(`<button class="btn" data-a="close">Leave</button>`);
  return `<div class="panel stone">${ph(esc(n.name))}<div class="pb"><div class="dlg"><canvas class="port" width="180" height="220"></canvas><div class="txt">${text}${UI.msg ? `<p style="color:var(--gold-hi)">${esc(UI.msg)}</p>` : ''}</div></div><div class="opts">${opts.join('')}</div></div></div>`;
}
function npcOption(v) {
  const C = G.C; UI.msg = '';
  if (v === 'trade') { UI.open('vendor', UI.arg.role); return; }
  if (v === 'gamble') { UI.open('gamble'); return; }
  if (v === 'socket') { UI.open('socket'); return; }
  if (v === 'imbue') { UI.open('imbue'); return; }
  if (v === 'respec') { const cost = respecCost(); if (C.gold < cost) { UI.msg = `Renewing your vows costs ${fmtFull(cost)} gold.`; AU.play('error'); } else { C.gold -= cost; respec(C); refreshStats(); UI.skillbarKey = ''; AU.play('gong'); UI.msg = 'Your vows are renewed. All attribute and skill points have been returned to you.'; UI.points(); saveChar(C); } UI.render(); }
}
UI.vstock = function () { const role = UI.arg; return role === 'merchant' ? G.vendor.merchant : G.vendor.smith; };
function vendorPanelHTML(role) {
  const C = G.C, S = G.P.S; const stock = UI.vstock(); const name = REALMS[G.realmIdx].npcs[role];
  const pots = role === 'merchant' ? `<div class="sec">Potions · you carry at most ${S.potMax} of each</div><div class="row" style="justify-content:flex-start">${['hp', 'mp', 'rej'].map(k => `<button class="btn small" data-a="potbuy" data-v="${k}"><img alt="" src="${iconURL(itemIconCanvas({ pot: k }, 32))}" style="width:20px;height:20px">${{ hp: 'Healing', mp: 'Mana', rej: 'Rejuvenation' }[k]} (${C.pots[k]}) · ${potPrice(k)}</button>`).join('')}<button class="btn small" data-a="potfill">Fill up</button></div>` : '';
  const gems = role === 'merchant' ? G.vendor.gems : []; const all = stock;
  return `<div class="panel wide stone">${ph(esc(name))}<div class="pb">${pots}<div class="invwrap two"><div><div class="sec">For sale</div><div class="shopgrid">${all.map((it, i) => slotHTML(it, `data-a="vd" data-v="${i}"`)).join('')}</div></div><div><div class="sec">Your bag · <span class="coin"></span> ${fmtFull(C.gold)}</div>${bagHTML()}</div></div><div style="margin-top:10px">${tipBox()}</div></div></div>`;
}
function gamblePanelHTML() {
  const C = G.C; const types = [['weapon', 'Weapon'], ['offhand', 'Off-hand'], ['head', 'Headwear'], ['body', 'Robe'], ['hands', 'Gloves'], ['waist', 'Sash'], ['feet', 'Footwear'], ['neck', 'Amulet'], ['ring', 'Ring']];
  return `<div class="panel stone">${ph('Gamble')}<div class="pb"><p style="margin-top:0;color:var(--dim)">Pay for an unknown item. Most are magic, some are rare, and a very few are unique.</p><div class="goldline"><span class="coin"></span>${fmtFull(C.gold)} gold</div><div class="row" style="justify-content:flex-start;margin:10px 0">${types.map(([k, n]) => `<button class="btn small" data-a="gamble" data-v="${k}" ${C.gold >= gamblePrice(k) ? '' : 'disabled'}>${n} · ${fmtFull(gamblePrice(k))}</button>`).join('')}</div>${UI.sel ? tipBox() : ''}<div class="sec">Your bag</div>${bagHTML()}</div></div>`;
}
function stashPanelHTML() { const C = G.C; return `<div class="panel wide stone">${ph('Stash')}<div class="pb"><div class="invwrap two"><div><div class="sec">Stash</div><div class="grid">${C.stash.map((it, i) => slotHTML(it, `data-a="st" data-v="${i}"`)).join('')}</div></div><div><div class="sec">Bag</div>${bagHTML()}</div></div><div style="margin-top:10px">${tipBox()}</div></div></div>`; }
function servicePanelHTML(kind) {
  const C = G.C; const cands = []; const okSock = it => MAX_SOCK[it.slot] && (it.sockets || 0) < MAX_SOCK[it.slot]; const okImbue = it => it.rar === 0 || (it.rar === 5 && !it.gems.length);
  for (const s of SLOTS) { const it = C.equip[s]; if (it && (it.rar === 0 || it.rar === 5) && (kind === 'imbue' ? okImbue(it) : okSock(it))) cands.push(['eq:' + s, it]); }
  C.inv.forEach((it, i) => { if (it && !it.gem && !it.qitem && (it.rar === 0 || it.rar === 5) && (kind === 'imbue' ? okImbue(it) : okSock(it))) cands.push(['inv:' + i, it]); });
  const list = cands;
  return `<div class="panel narrow stone">${ph(kind === 'socket' ? 'Add a Socket' : 'Imbue')}<div class="pb"><p style="margin-top:0;color:var(--dim)">${kind === 'socket' ? 'The smith can cut sockets into plain (white or grey) items: up to three in a weapon or robe, two in headwear or an off-hand. Gems of the Seven Treasures can then be set into them, and certain gems in a certain order form a Dharani.' : 'Cunda will work one plain (white) item into a rare item of higher quality. This is a one-time reward.'}</p>${UI.msg ? `<p style="color:var(--gold-hi)">${esc(UI.msg)}</p>` : ''}<div class="wp">${list.length ? list.map(([k, it]) => `<button class="btn wide" data-a="svc" data-v="${kind}|${k}" style="justify-content:space-between"><span>${esc(it.name)}</span><span style="font-size:11px">${kind === 'socket' ? (it.sockets || 0) + ' → ' + ((it.sockets || 0) + 1) + ' sockets · ' + fmtFull(socketPrice(it)) + ' gold' : 'Imbue'}</span></button>`).join('') : '<p style="color:var(--dim)">You carry no suitable plain items.</p>'}</div></div></div>`;
}
function doService(v) {
  const C = G.C; const [kind, ref] = v.split('|'); const [src, key] = ref.split(':'); const it = src === 'eq' ? C.equip[key] : C.inv[+key]; if (!it) return;
  if (kind === 'socket') { const pr = socketPrice(it); if (C.gold < pr) { UI.msg = 'Not enough gold.'; AU.play('error'); UI.render(); return; } C.gold -= pr; it.sockets = (it.sockets || 0) + 1; it.rar = 5; it.gems = it.gems || []; AU.play('drop_magic'); UI.msg = 'A socket is cut into ' + it.name + '.'; saveChar(C); UI.render(); }
  else { if (imbueItem(it)) { refreshStats(); UI.close(); } }
}
function menuPanelHTML() { return `<div class="panel narrow stone">${ph('Paused')}<div class="pb"><div class="menu" style="margin:0 auto;width:100%"><button class="btn" data-a="menu" data-v="resume">Resume</button><button class="btn" data-a="menu" data-v="options">Options</button><button class="btn" data-a="menu" data-v="help">How to Play</button><button class="btn" data-a="menu" data-v="exit">Save and Exit</button></div></div></div>`; }
function helpHTML() {
  return `<div class="panel stone">${ph('How to Play')}<div class="pb" style="line-height:1.55;font-size:16px"><p style="margin-top:0">Walk. Your equipped skills cast themselves at nearby enemies, as long as you have the mana. Collect the glowing merit that fallen enemies leave behind to gain experience, and find better gear.</p>
  <div class="sec">Moving</div><p>Phone and tablet: touch and drag anywhere on the world to move. Desktop: WASD or the arrow keys, or hold the left mouse button. Tap or click an item's name on the ground to walk over and pick it up.</p>
  <div class="sec">Keys</div><div class="kv"><div class="k">Inventory</div><div class="v">I</div><div class="k">Character</div><div class="v">C</div><div class="k">Skills</div><div class="v">T</div><div class="k">Quests</div><div class="v">Q</div><div class="k">Map</div><div class="v">M or Tab</div><div class="k">Healing / Mana / Rejuvenation</div><div class="v">1 / 2 / 3</div><div class="k">Mantra (ultimate)</div><div class="v">Space</div><div class="k">Portal to sanctuary</div><div class="v">R</div><div class="k">Talk / use</div><div class="v">E</div><div class="k">Fullscreen</div><div class="v">F</div><div class="k">Menu / close</div><div class="v">Esc</div></div>
  <div class="sec">Building your monk</div><p>Each level gives 5 attribute points and 1 skill point. Skills in a tree unlock at levels 1, 6, 12, 18 and 26, and synergies let lower skills strengthen higher ones. Up to six active skills can be equipped at once; passives always work. The Mantra meter fills as you slay enemies; when it glows, release your ultimate.</p>
  <div class="sec">Items</div><p>Blue items are magic, yellow are rare, gold are unique, and grey items have sockets for gems. Right-click (or double-click) to equip on desktop. In the sanctuary you can trade, gamble, add sockets, fuse gems, store items and reset your points.</p>
  <div class="sec">Dharanis</div><p>Set the right gems, in the right order, into a plain socketed item with exactly that many sockets, and it becomes a Dharani with powers of its own.</p>
  <div class="kv">${DHARANIS.map(d => `<div class="k" style="color:#f0a030">${esc(d.name)}</div><div class="v" style="font-size:14px">${d.gems.map(g => GEMS[g].name).join(' + ')} · ${d.slots.map(s => SLOT_NAME[s]).join(', ')}</div>`).join('')}</div></div></div>`;
}
function optionsHTML() {
  const tg = (id, on, label) => `<label for="${id}">${label}</label><button class="toggle ${on ? 'on' : ''}" id="${id}" aria-pressed="${on ? 'true' : 'false'}" aria-label="${label}"></button>`;
  return `<div class="opt-grid" style="margin:0 auto"><label for="oMusic">Music</label><input type="range" id="oMusic" min="0" max="1" step="0.05" value="${OPT.music}"><label for="oSfx">Sound effects</label><input type="range" id="oSfx" min="0" max="1" step="0.05" value="${OPT.sfx}">
  ${tg('oNums', OPT.dmgNums, 'Damage numbers')}${tg('oPot', OPT.autoPot, 'Drink potions automatically')}${tg('oShake', OPT.shake, 'Screen shake')}${tg('oMini', OPT.minimap, 'Minimap')}
  <label for="oPick">Pick up automatically</label><select id="oPick">${[['all', 'Everything'], ['magic', 'Magic and better'], ['rare', 'Rare and unique'], ['none', 'Nothing']].map(([v, n]) => `<option value="${v}" ${OPT.pickup === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
  <label for="oQ">Graphics</label><select id="oQ"><option value="high" ${OPT.quality === 'high' ? 'selected' : ''}>High</option><option value="low" ${OPT.quality === 'low' ? 'selected' : ''}>Fast</option></select></div>`;
}
function bindOptions(root) {
  const q = s => root.querySelector(s);
  q('#oMusic').oninput = e => { OPT.music = +e.target.value; AU.vol.music = OPT.music; AU.setVol(); saveOpt(); };
  q('#oSfx').oninput = e => { OPT.sfx = +e.target.value; AU.vol.sfx = OPT.sfx; AU.setVol(); saveOpt(); AU.play('coin'); };
  const tog = (id, key) => { q(id).onclick = e => { OPT[key] = OPT[key] ? 0 : 1; e.currentTarget.classList.toggle('on', !!OPT[key]); e.currentTarget.setAttribute('aria-pressed', OPT[key] ? 'true' : 'false'); saveOpt(); AU.play('click'); }; };
  tog('#oNums', 'dmgNums'); tog('#oPot', 'autoPot'); tog('#oShake', 'shake'); tog('#oMini', 'minimap');
  q('#oPick').onchange = e => { OPT.pickup = e.target.value; saveOpt(); };
  q('#oQ').onchange = e => { OPT.quality = e.target.value; saveOpt(); resizeCanvas(); if (G.A) G.A.chunks.clear(); };
}

/* ---------- input ---------- */
function screenToWorld(cx, cy) { const R = RENDER; const sx = (cx * R.px - R.W / 2 - (R.shx || 0)) / R.k + G.cam.x, sy = (cy * R.px - R.H / 2 - (R.shy || 0)) / R.k + G.cam.y; return [(sx / HTW + sy / HTH) / 2, (sy / HTH - sx / HTW) / 2]; }
function tryWorldClick(cx, cy) {
  const lr = G.labelRects.find(r => cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h);
  if (lr) { const gi = lr.gi; G.P.moveTo = { x: gi.x, y: gi.y, item: gi, onArrive: () => { if (G.A.items.includes(gi)) pickUp(gi); } }; return true; }
  const [wx, wy] = screenToWorld(cx, cy + 20);
  for (const n of G.A.npcs) if (dist2(n.x, n.y, wx, wy) < 1.4) { G.P.moveTo = { x: n.x, y: n.y + 0.8, onArrive: () => { if (n.role === 'stash') UI.open('stash'); else UI.open('npc', n); } }; return true; }
  if (G.A.wp && dist2(G.A.wp.x, G.A.wp.y, wx, wy) < 1.6) { G.P.moveTo = { x: G.A.wp.x, y: G.A.wp.y + 1, onArrive: () => UI.open('waypoint') }; return true; }
  return false;
}
function setupInput() {
  const cv = RENDER.cv; const joyEl = $('joy'); const knob = joyEl.querySelector('.knob');
  cv.addEventListener('pointerdown', e => {
    AU.init(); if (G.state !== 'play') return; e.preventDefault();
    if (e.pointerType === 'mouse') { if (e.button !== 0) return; if (tryWorldClick(e.clientX, e.clientY)) return; G.mouse.down = 1; G.mouse.hold = 1; G.mouse.x = e.clientX; G.mouse.y = e.clientY; cv.setPointerCapture(e.pointerId); return; }
    if (G.joy && G.joy.active) return;
    if (tryWorldClick(e.clientX, e.clientY)) return;
    G.joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, vx: 0, vy: 0, active: true }; joyEl.hidden = false; joyEl.style.left = e.clientX + 'px'; joyEl.style.top = e.clientY + 'px'; knob.style.transform = ''; cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') { G.mouse.x = e.clientX; G.mouse.y = e.clientY; return; }
    const J = G.joy; if (!J || J.id !== e.pointerId) return; let dx = e.clientX - J.ox, dy = e.clientY - J.oy; const d = Math.hypot(dx, dy), max = 55;
    if (d > max * 1.6) { J.ox += dx / d * (d - max * 1.6); J.oy += dy / d * (d - max * 1.6); dx = e.clientX - J.ox; dy = e.clientY - J.oy; joyEl.style.left = J.ox + 'px'; joyEl.style.top = J.oy + 'px'; }
    const l = Math.min(1, Math.hypot(dx, dy) / max); const a = Math.atan2(dy, dx); J.vx = Math.cos(a) * l; J.vy = Math.sin(a) * l; knob.style.transform = `translate(${Math.cos(a) * l * max}px,${Math.sin(a) * l * max}px)`;
  });
  const up = e => { if (e.pointerType === 'mouse') { G.mouse.down = 0; G.mouse.hold = 0; return; } if (G.joy && G.joy.id === e.pointerId) { G.joy = null; joyEl.hidden = true; } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('lostpointercapture', up);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return; AU.init();
    const k = e.code; if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k) && G.state !== 'title') e.preventDefault();
    if (G.state === 'cine') { if (k === 'Escape' || k === 'Space' || k === 'Enter') CINE.skip(); return; }
    if (G.state === 'intro') { if (k === 'Escape' || k === 'Space' || k === 'Enter') UI.introDone && UI.introDone(); return; }
    if (k === 'KeyF') { toggleFullscreen(); return; }
    if (G.state === 'title') return;
    G.keys[k] = 1;
    if (k === 'Escape') { if (UI.panel && UI.panel !== 'death') UI.close(); else if (G.state === 'play') UI.open('menu'); return; }
    if (G.state === 'dead') return;
    const map = { KeyI: 'inv', KeyB: 'inv', KeyC: 'char', KeyT: 'skills', KeyK: 'skills', KeyQ: 'quests', KeyM: 'map', Tab: 'map' };
    if (map[k] && (G.state === 'play' || G.state === 'panel')) { if (UI.panel === map[k]) UI.close(); else UI.open(map[k]); return; }
    if (G.state !== 'play') return;
    if (k === 'Digit1') quaff('hp'); if (k === 'Digit2') quaff('mp'); if (k === 'Digit3') quaff('rej');
    if (k === 'Space') mantraUlt(); if (k === 'KeyR') usePortal(); if (k === 'KeyE' || k === 'Enter') doInteract();
  });
  window.addEventListener('keyup', e => { G.keys[e.code] = 0; });
  window.addEventListener('blur', () => { G.keys = {}; G.mouse.down = 0; G.joy = null; joyEl.hidden = true; });
  const bind = (id, fn) => { const b = $(id); b.addEventListener('click', e => { e.stopPropagation(); AU.init(); fn(); if (e.detail) b.blur(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); };
  bind('bChar', () => UI.open('char')); bind('bInv', () => UI.open('inv')); bind('bSkill', () => UI.open('skills')); bind('bQuest', () => UI.open('quests')); bind('bMap', () => UI.open('map'));
  bind('bMenu', () => UI.open('menu')); bind('bFull', toggleFullscreen); bind('bPortal', usePortal); bind('potHP', () => quaff('hp')); bind('potMP', () => quaff('mp'));
  bind('mantra', mantraUlt); bind('bInteract', doInteract);
  $('layer').addEventListener('pointerdown', e => { if (e.target === $('layer') && UI.panel && UI.panel !== 'death') UI.close(); });
}
function toggleFullscreen() {
  const d = document; try { if (!d.fullscreenElement && !d.webkitFullscreenElement) { const el = d.documentElement; const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el); if (p && p.catch) p.catch(() => toast('Fullscreen is not available here', null, 2)); } else { (d.exitFullscreen || d.webkitExitFullscreen).call(d); } } catch (e) { toast('Fullscreen is not available here', null, 2); }
}
