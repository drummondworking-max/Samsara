/* ================= title, character select/create, cinematics ================= */
const TITLE = { t: 0, sel: null, embers: [] };
const YAMA_CACHE = {};
function yamaLayer(R, front) {
  const key = Math.round(R) + (front ? 'f' : 'b'); if (YAMA_CACHE[key]) return YAMA_CACHE[key];
  const W = Math.ceil(R * 3.4), H = Math.ceil(R * 3.7); const c = mkCanvas(W, H); const g = c.getContext('2d'); const cx = W / 2, cy = R * 1.75;
  const skin = '#1b2346', skinHi = '#3a4a8a';
  if (!front) {
    // flaming aura
    for (let i = 0; i < 44; i++) { const a = -Math.PI + (i / 43) * TAU; const r0 = R * 1.08, r1 = R * (1.28 + 0.14 * Math.sin(i * 2.7) + 0.08 * Math.sin(i * 5.3)); const w = 0.09;
      g.beginPath(); g.moveTo(cx + Math.cos(a - w) * r0, cy + Math.sin(a - w) * r0); g.quadraticCurveTo(cx + Math.cos(a) * r1 * 1.05, cy + Math.sin(a) * r1 * 1.05, cx + Math.cos(a + w * 0.4) * r1, cy + Math.sin(a + w * 0.4) * r1); g.lineTo(cx + Math.cos(a + w) * r0, cy + Math.sin(a + w) * r0); g.closePath();
      g.fillStyle = i % 2 ? 'rgba(200,60,10,.55)' : 'rgba(255,140,30,.45)'; g.fill(); }
    // shoulders and arms behind the wheel
    g.fillStyle = lgrad(g, cx - R * 1.4, 0, cx + R * 1.4, 0, [[0, '#0c1024'], [0.5, skin], [1, '#0c1024']]);
    g.beginPath(); g.moveTo(cx - R * 0.5, cy - R * 1.0); g.quadraticCurveTo(cx - R * 1.35, cy - R * 0.95, cx - R * 1.3, cy - R * 0.2); g.lineTo(cx + R * 1.3, cy - R * 0.2); g.quadraticCurveTo(cx + R * 1.35, cy - R * 0.95, cx + R * 0.5, cy - R * 1.0); g.closePath(); g.fill();
    for (const s of [-1, 1]) { limb(g, cx + s * R * 1.22, cy - R * 0.55, cx + s * R * 1.12, cy - R * 0.12, R * 0.22, skin); limb(g, cx + s * R * 0.62, cy + R * 0.95, cx + s * R * 0.5, cy + R * 1.08, R * 0.2, skin); }
    return (YAMA_CACHE[key] = c);
  }
  // FRONT: head biting the rim, hands and feet gripping
  const hx = cx, hy = cy - R * 1.08, hr = R * 0.36;
  // flaming hair
  for (let i = 0; i < 13; i++) { const a = -Math.PI * 0.95 + i / 12 * Math.PI * 0.9; const bx = hx + Math.cos(a) * hr * 0.9, by = hy - hr * 0.2 + Math.sin(a) * hr * 0.9; g.beginPath(); g.moveTo(bx - hr * 0.12, by); g.quadraticCurveTo(bx + Math.cos(a) * hr * 0.5, by + Math.sin(a) * hr * 0.7 - hr * 0.2, bx + Math.cos(a) * hr * 0.35 + (i % 2 ? hr * 0.1 : -hr * 0.1), by + Math.sin(a) * hr * 0.9 - hr * 0.35); g.lineTo(bx + hr * 0.12, by); g.closePath(); g.fillStyle = lgrad(g, 0, by - hr, 0, by, [[0, '#ffd060'], [0.5, '#ff6a1a'], [1, '#8a1a06']]); g.fill(); }
  // face
  g.fillStyle = rgrad(g, hx - hr * 0.3, hy - hr * 0.3, hr * 0.1, hr * 1.2, [[0, skinHi], [0.6, skin], [1, '#070a18']]); g.beginPath(); g.ellipse(hx, hy, hr * 1.05, hr * 1.12, 0, 0, TAU); g.fill();
  // ears with rings
  for (const s of [-1, 1]) { g.fillStyle = skin; g.beginPath(); g.ellipse(hx + s * hr * 1.05, hy + hr * 0.05, hr * 0.18, hr * 0.32, 0, 0, TAU); g.fill(); g.strokeStyle = '#e8b040'; g.lineWidth = hr * 0.06; g.beginPath(); g.arc(hx + s * hr * 1.08, hy + hr * 0.45, hr * 0.13, 0, TAU); g.stroke(); }
  // crown of five skulls
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.36; const sx = hx + Math.cos(a) * hr * 0.98, sy = hy + Math.sin(a) * hr * 0.98 + hr * 0.08; g.fillStyle = rgrad(g, sx - hr * 0.05, sy - hr * 0.06, 1, hr * 0.2, [[0, '#fffaf0'], [1, '#bdb29a']]); g.beginPath(); g.ellipse(sx, sy, hr * 0.17, hr * 0.19, 0, 0, TAU); g.fill(); g.fillStyle = '#140a06'; g.beginPath(); g.ellipse(sx - hr * 0.06, sy, hr * 0.045, hr * 0.055, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(sx + hr * 0.06, sy, hr * 0.045, hr * 0.055, 0, 0, TAU); g.fill(); g.fillRect(sx - hr * 0.05, sy + hr * 0.1, hr * 0.1, hr * 0.03); }
  // brows of flame
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(hx + s * hr * 0.1, hy - hr * 0.3); g.quadraticCurveTo(hx + s * hr * 0.45, hy - hr * 0.62, hx + s * hr * 0.85, hy - hr * 0.42); g.quadraticCurveTo(hx + s * hr * 0.5, hy - hr * 0.42, hx + s * hr * 0.12, hy - hr * 0.2); g.closePath(); g.fillStyle = '#ff7a2a'; g.fill(); }
  // three eyes
  for (const s of [-1, 1]) { const ex = hx + s * hr * 0.42, ey = hy - hr * 0.1; g.fillStyle = '#fff4e0'; g.beginPath(); g.ellipse(ex, ey, hr * 0.2, hr * 0.17, 0, 0, TAU); g.fill(); g.fillStyle = rgrad(g, ex, ey, 1, hr * 0.12, [[0, '#ffd040'], [1, '#c81a0a']]); g.beginPath(); g.arc(ex + s * hr * 0.02, ey + hr * 0.01, hr * 0.11, 0, TAU); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(ex + s * hr * 0.02, ey + hr * 0.01, hr * 0.045, 0, TAU); g.fill(); g.strokeStyle = '#0a0612'; g.lineWidth = hr * 0.04; g.beginPath(); g.ellipse(ex, ey, hr * 0.2, hr * 0.17, 0, 0, TAU); g.stroke(); }
  g.fillStyle = '#fff4e0'; g.beginPath(); g.ellipse(hx, hy - hr * 0.5, hr * 0.07, hr * 0.14, 0, 0, TAU); g.fill(); g.fillStyle = '#c81a0a'; g.beginPath(); g.ellipse(hx, hy - hr * 0.5, hr * 0.04, hr * 0.09, 0, 0, TAU); g.fill();
  // nose
  g.fillStyle = '#0e1330'; g.beginPath(); g.ellipse(hx, hy + hr * 0.18, hr * 0.2, hr * 0.12, 0, 0, TAU); g.fill();
  // open mouth biting the rim
  const my = hy + hr * 0.55; g.fillStyle = '#3a0606'; g.beginPath(); g.moveTo(hx - hr * 0.62, my - hr * 0.08); g.quadraticCurveTo(hx, my - hr * 0.28, hx + hr * 0.62, my - hr * 0.08); g.quadraticCurveTo(hx + hr * 0.5, my + hr * 0.42, hx, my + hr * 0.44); g.quadraticCurveTo(hx - hr * 0.5, my + hr * 0.42, hx - hr * 0.62, my - hr * 0.08); g.fill();
  for (let i = 0; i < 7; i++) { const x = hx - hr * 0.48 + i * hr * 0.16; const big = i === 0 || i === 6; poly(g, [x - hr * 0.05, my - hr * 0.12, x, my + (big ? hr * 0.34 : hr * 0.08), x + hr * 0.05, my - hr * 0.12], '#f4ecd8'); }
  for (let i = 0; i < 6; i++) { const x = hx - hr * 0.4 + i * hr * 0.16; poly(g, [x - hr * 0.05, my + hr * 0.4, x, my + hr * 0.22, x + hr * 0.05, my + hr * 0.4], '#e8dcc0'); }
  // clawed hands over the rim
  for (const s of [-1, 1]) { const px = cx + s * R * 1.06, py = cy - R * 0.08; g.fillStyle = rgrad(g, px, py, 2, R * 0.2, [[0, skinHi], [1, skin]]); g.beginPath(); g.ellipse(px, py, R * 0.13, R * 0.17, 0, 0, TAU); g.fill();
    for (let k = 0; k < 4; k++) { const fy = py - R * 0.12 + k * R * 0.08; limb(g, px, fy, px - s * R * 0.2, fy + R * 0.02, R * 0.06, skin); poly(g, [px - s * R * 0.2, fy - R * 0.02, px - s * R * 0.27, fy + R * 0.03, px - s * R * 0.2, fy + R * 0.05], '#f0e0c0'); } }
  // feet gripping the bottom
  for (const s of [-1, 1]) { const fx = cx + s * R * 0.45, fy = cy + R * 0.98; g.fillStyle = skin; g.beginPath(); g.ellipse(fx, fy, R * 0.16, R * 0.08, 0, 0, TAU); g.fill(); for (let k = 0; k < 4; k++) { const tx = fx - R * 0.12 + k * R * 0.08; limb(g, tx, fy - R * 0.02, tx, fy - R * 0.1, R * 0.045, skin); poly(g, [tx - R * 0.02, fy - R * 0.1, tx, fy - R * 0.15, tx + R * 0.02, fy - R * 0.1], '#f0e0c0'); } }
  return (YAMA_CACHE[key] = c);
}
function drawBhavacakra(g, cx, cy, R, t, o = {}) {
  const rot = t * (o.spin != null ? o.spin : 0.04);
  if (!o.noYama) { const b = yamaLayer(R, 0); g.save(); g.globalAlpha = o.yamaA != null ? o.yamaA : 1; g.drawImage(b, cx - b.width / 2, cy - R * 1.75); g.restore(); }
  g.save(); g.translate(cx, cy);
  // outer rim: twelve links of dependent origination
  g.save(); g.rotate(rot * 0.5);
  g.fillStyle = rgrad(g, 0, 0, R * 0.84, R, [[0, '#2e2014'], [1, '#140c06']]); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.strokeStyle = 'rgba(214,176,100,.55)'; g.lineWidth = R * 0.008; g.beginPath(); g.moveTo(Math.cos(a) * R * 0.87, Math.sin(a) * R * 0.87); g.lineTo(Math.cos(a) * R * 0.99, Math.sin(a) * R * 0.99); g.stroke();
    const am = a + TAU / 24; const px = Math.cos(am) * R * 0.93, py = Math.sin(am) * R * 0.93; g.save(); g.translate(px, py); g.rotate(am + Math.PI / 2); g.fillStyle = `hsl(${24 + i * 6},45%,${32 + (i % 3) * 6}%)`; g.beginPath(); g.ellipse(0, 0, R * 0.05, R * 0.035, 0, 0, TAU); g.fill(); g.fillStyle = '#e8d8b0'; g.beginPath(); g.arc(0, -R * 0.006, R * 0.013, 0, TAU); g.fill(); g.fillRect(-R * 0.004, 0, R * 0.008, R * 0.02); g.restore(); }
  g.restore();
  g.save(); g.rotate(rot);
  // six realms, in traditional placement
  const cols = o.realmCols || ['#d8c89a', '#c8904a', '#a83a2a', '#3a7a3a', '#6a6a4a', '#5a1a14'];
  const order = [0, 2, 4, 5, 3, 1];
  for (let k = 0; k < 6; k++) { const r = order[k]; const a0 = -Math.PI / 2 - Math.PI / 6 + k * TAU / 6; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R * 0.86, a0, a0 + TAU / 6); g.closePath(); const hi = o.hi === r ? 0.35 : 0;
    g.fillStyle = rgrad(g, 0, 0, R * 0.35, R * 0.86, [[0, shade(cols[r], -0.28 + hi)], [1, shade(cols[r], -0.58 + hi)]]); g.fill(); g.strokeStyle = 'rgba(230,200,140,.65)'; g.lineWidth = R * 0.012; g.stroke();
    const am = a0 + TAU / 12; const mx = Math.cos(am) * R * 0.6, my = Math.sin(am) * R * 0.6; g.save(); g.translate(mx, my); g.rotate(-rot); g.scale(R / 280, R / 280); g.translate(-32, -32); g.globalAlpha = 0.8; drawSymbol(g, { 0: 'lotus', 1: 'fist', 2: 'sword', 3: 'lion', 4: 'drop', 5: 'flame' }[r], shade(cols[r], 0.3)); g.restore(); }
  // inner ring: rising (light) and falling (dark) beings
  g.beginPath(); g.arc(0, 0, R * 0.34, -Math.PI / 2, Math.PI / 2); g.arc(0, 0, R * 0.21, Math.PI / 2, -Math.PI / 2, true); g.fillStyle = '#d8c8a0'; g.fill();
  g.beginPath(); g.arc(0, 0, R * 0.34, Math.PI / 2, Math.PI * 1.5); g.arc(0, 0, R * 0.21, -Math.PI / 2, Math.PI / 2, true); g.fillStyle = '#1a1210'; g.fill();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i + 0.5) / 10 * Math.PI; const up = true; g.fillStyle = '#8a6a3a'; g.beginPath(); g.arc(Math.cos(a) * R * 0.275, Math.sin(a) * R * 0.275, R * 0.014, 0, TAU); g.fill(); const b = a + Math.PI; g.fillStyle = '#6a5a4a'; g.beginPath(); g.arc(Math.cos(b) * R * 0.275, Math.sin(b) * R * 0.275, R * 0.014, 0, TAU); g.fill(); }
  g.strokeStyle = '#c8a060'; g.lineWidth = R * 0.014; g.beginPath(); g.arc(0, 0, R * 0.34, 0, TAU); g.stroke();
  g.restore();
  // hub: rooster, snake and pig chase one another
  g.save(); g.rotate(-rot * 3);
  g.fillStyle = rgrad(g, 0, 0, 2, R * 0.21, [[0, '#3a6a8a'], [1, '#1a3048']]); g.beginPath(); g.arc(0, 0, R * 0.21, 0, TAU); g.fill();
  const ar = R * 0.11;
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; g.save(); g.rotate(a); g.translate(ar, 0); g.rotate(Math.PI / 2);
    if (i === 0) { ball(g, 0, 0, R * 0.05, R * 0.035, '#c8301a'); poly(g, [R * 0.04, -R * 0.02, R * 0.07, -R * 0.005, R * 0.04, R * 0.005], '#ffd060'); ball(g, R * 0.035, -R * 0.03, R * 0.012, R * 0.012, '#ff2a1a'); }
    else if (i === 1) { g.strokeStyle = '#3aa84a'; g.lineWidth = R * 0.022; g.beginPath(); g.moveTo(-R * 0.06, 0); g.bezierCurveTo(-R * 0.02, -R * 0.04, R * 0.02, R * 0.04, R * 0.06, 0); g.stroke(); ball(g, R * 0.065, 0, R * 0.016, R * 0.013, '#3aa84a'); }
    else { ball(g, 0, 0, R * 0.055, R * 0.036, '#2a2228'); ball(g, R * 0.05, 0, R * 0.02, R * 0.018, '#4a3a42'); }
    g.restore(); }
  g.strokeStyle = '#c8a060'; g.lineWidth = R * 0.012; g.beginPath(); g.arc(0, 0, R * 0.21, 0, TAU); g.stroke();
  g.restore();
  g.restore();
  g.strokeStyle = lgrad(g, cx - R, cy - R, cx + R, cy + R, [[0, '#f0d488'], [0.5, '#7a5a28'], [1, '#e8c878']]); g.lineWidth = R * 0.035; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke();
  if (!o.noYama) { const f = yamaLayer(R, 1); g.save(); g.globalAlpha = o.yamaA != null ? o.yamaA : 1; g.drawImage(f, cx - f.width / 2, cy - R * 1.75); g.restore(); }
}
function titleLoop(dt) {
  const R = RENDER, g = R.ctx; TITLE.t += dt; const t = TITLE.t; const W = R.W, H = R.H;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = rgrad(g, W / 2, H * 0.42, 10, Math.max(W, H) * 0.8, [[0, '#2a1608'], [0.5, '#0e0806'], [1, '#040202']]); g.fillRect(0, 0, W, H);
  const Rw = Math.min(W, H) * 0.3; g.globalAlpha = 0.42; drawBhavacakra(g, W / 2, H * 0.5, Rw, t, { yamaA: 0.9 }); g.globalAlpha = 1;
  g.fillStyle = rgrad(g, W / 2, H * 0.55, Rw * 0.2, Rw * 1.9, [[0, 'rgba(0,0,0,0.45)'], [0.5, 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0.8)']]); g.fillRect(0, 0, W, H);
  // embers
  if (TITLE.embers.length < 70) TITLE.embers.push({ x: Math.random() * W, y: H + 10, vy: rand(20, 60) * R.px, vx: rand(-10, 10) * R.px, life: rand(4, 9), t: 0, s: rand(1, 3) * R.px });
  g.globalCompositeOperation = 'lighter';
  for (let i = TITLE.embers.length - 1; i >= 0; i--) { const e = TITLE.embers[i]; e.t += dt; e.y -= e.vy * dt; e.x += e.vx * dt + Math.sin(t + i) * 0.3; if (e.t > e.life) { TITLE.embers.splice(i, 1); continue; } g.globalAlpha = Math.sin(e.t / e.life * Math.PI) * 0.8; g.drawImage(glowSpr('#ff9a3a', 16), e.x - e.s * 3, e.y - e.s * 3, e.s * 6, e.s * 6); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function showTitle() {
  G.state = 'title'; AU.setMusic('title'); $('hud').hidden = true; $('cine').hidden = true;
  const sc = $('screen'); sc.hidden = false; const hasChars = saveIndex().length > 0;
  sc.innerHTML = `<h1 class="logo">Wheel of Samsara<small>A Descent Through the Six Realms</small></h1>
  <div class="menu"><button class="btn" id="mSingle">Single Player</button><button class="btn" id="mCine">Cinematics</button><button class="btn" id="mOpt">Options</button><button class="btn" id="mCred">Credits</button>${document.fullscreenEnabled || document.webkitFullscreenEnabled ? '<button class="btn" id="mFull">Fullscreen</button>' : ''}</div>
  <div class="foot">Tap anywhere to wake the sound · ${hasChars ? 'Your monks await' : 'Begin a new monk'}</div>`;
  $('mSingle').onclick = () => { AU.init(); AU.play('click'); showCharSelect(); };
  $('mCine').onclick = () => { AU.init(); AU.play('click'); showCineMenu(); };
  $('mOpt').onclick = () => { AU.init(); AU.play('click'); showTitleOptions(); };
  $('mCred').onclick = () => { AU.init(); AU.play('click'); showCredits(); };
  if ($('mFull')) $('mFull').onclick = () => { AU.init(); toggleFullscreen(); };
}
function screenBack(fn) { return `<div class="row" style="margin-top:16px"><button class="btn" id="bBack">Back</button></div>`; }
function showTitleOptions() { const sc = $('screen'); sc.innerHTML = `<h2 class="screen-title">Options</h2><div class="stone" style="padding:18px 20px;max-width:92vw">${optionsHTML()}</div>${screenBack()}`; bindOptions(sc); $('bBack').onclick = () => { AU.play('click'); showTitle(); }; }
function showCredits() { const sc = $('screen'); sc.innerHTML = `<h2 class="screen-title">Credits</h2><div class="lore" style="font-style:normal">Wheel of Samsara was designed, drawn, scored and written with Claude, from a request by its first player.<br><br>Every sprite, texture and note is generated in your browser when the game starts. The Six Realms, the Roku Jizo, Angulimala, Rahu, Ulkamukha and Mara come from the Buddhist sutras and their commentaries; any errors in retelling them are ours.<br><br>May all beings be free from suffering.</div>${screenBack()}`; $('bBack').onclick = () => { AU.play('click'); showTitle(); }; }
function showCineMenu() { const sc = $('screen'); const seenEnd = saveIndex().some(x => x.done); sc.innerHTML = `<h2 class="screen-title">Cinematics</h2><div class="menu"><button class="btn" id="cIntro">The Monk Sits Down</button><button class="btn" id="cEnd" ${seenEnd ? '' : 'disabled'}>${seenEnd ? 'A Single Moment' : 'Locked until the end of the path'}</button></div>${screenBack()}`; const last = saveIndex()[0]; const lastC = last ? loadChar(last.id) : null; const doneC = saveIndex().find(x => x.done); const dc = doneC ? loadChar(doneC.id) : null; $('cIntro').onclick = () => { AU.play('click'); CINE.play(INTRO_SCRIPT, () => showTitle(), cineVars(lastC)); }; if (seenEnd) $('cEnd').onclick = () => { AU.play('click'); CINE.play(END_SCRIPT, () => showTitle(), cineVars(dc)); }; $('bBack').onclick = () => { AU.play('click'); showTitle(); }; }
function showCharSelect() {
  const sc = $('screen'); const list = saveIndex(); TITLE.sel = list[0] ? list[0].id : null;
  const cards = list.map(c => `<div class="char-card ${c.id === TITLE.sel ? 'sel' : ''}" data-id="${c.id}" tabindex="0" role="button"><canvas width="112" height="128" data-cls="${c.cls}"></canvas><div><div class="nm">${esc(c.name)}</div><div class="sub">Level ${c.level} ${CLASSES[c.cls].name}</div><div class="sub">${c.done ? 'Awakened' : REALMS[c.realm || 0].name}</div></div></div>`).join('');
  sc.innerHTML = `<h2 class="screen-title">Select Your Monk</h2><div class="card-list">${cards || '<p class="lore">No monk has yet sat down beneath the tree.</p>'}</div>
  <div id="delConfirm"></div>
  <div class="row" style="margin-top:16px"><button class="btn" id="bNew">New Monk</button>${list.length ? '<button class="btn" id="bPlay">Begin</button><button class="btn red" id="bDel">Delete</button>' : ''}<button class="btn" id="bBack">Back</button></div>`;
  sc.querySelectorAll('canvas[data-cls]').forEach(cv => { const pc = portraitCanvas(HERO_LOOK[cv.dataset.cls], 56, 64); cv.getContext('2d').drawImage(pc, 0, 0); });
  sc.querySelectorAll('.char-card').forEach(el => { const pickIt = () => { TITLE.sel = el.dataset.id; sc.querySelectorAll('.char-card').forEach(x => x.classList.toggle('sel', x === el)); AU.play('click'); }; el.onclick = pickIt; el.ondblclick = () => { pickIt(); beginSelected(); }; el.onkeydown = e => { if (e.key === 'Enter') { pickIt(); beginSelected(); } }; });
  $('bNew').onclick = () => { AU.play('click'); showCreate(); };
  $('bBack').onclick = () => { AU.play('click'); showTitle(); };
  if ($('bPlay')) $('bPlay').onclick = () => beginSelected();
  if ($('bDel')) $('bDel').onclick = () => { if (!TITLE.sel) return; const c = list.find(x => x.id === TITLE.sel); $('delConfirm').innerHTML = `<div class="stone" style="padding:12px 16px;margin-top:10px;text-align:center"><p style="margin:0 0 10px">Delete ${esc(c.name)} forever?</p><div class="row"><button class="btn red small" id="bDelYes">Delete</button><button class="btn small" id="bDelNo">Keep</button></div></div>`; $('bDelYes').onclick = () => { deleteChar(TITLE.sel); AU.play('gong'); showCharSelect(); }; $('bDelNo').onclick = () => { $('delConfirm').innerHTML = ''; }; };
}
function beginSelected() { if (!TITLE.sel) return; const C = loadChar(TITLE.sel); if (!C) { toast('That save could not be read'); return; } AU.play('portal'); startGame(C); }
const CREATE = { cls: null, t: 0, fig: [] };
function showCreate() {
  G.state = 'create'; CREATE.cls = null; const sc = $('screen'); sc.hidden = false;
  sc.innerHTML = `<h2 class="screen-title" style="position:absolute;top:max(16px,env(safe-area-inset-top));left:0;right:0">Choose Your Path</h2>
  <div class="create-ui stone" id="createUI"><div class="row" id="clsRow">${CLASS_IDS.map(c => `<button class="btn small" data-c="${c}">${CLASSES[c].name}</button>`).join('')}</div><div id="clsInfo"><p class="lore" style="font-size:16px;margin:0 auto">Four monks sit around the sacred fire. Choose the one whose path you will walk.</p></div>
  <div class="row" style="flex-wrap:nowrap"><input class="name-in" id="nameIn" maxlength="16" placeholder="Name your pilgrim" aria-label="Monk name" autocomplete="off"><button class="btn" id="bBegin" disabled>Begin</button></div><div class="row"><button class="btn small" id="bBack">Back</button></div></div>`;
  sc.style.justifyContent = 'flex-start';
  sc.querySelectorAll('[data-c]').forEach(b => b.onclick = () => pickClass(b.dataset.c));
  $('bBack').onclick = () => { sc.style.justifyContent = ''; G.state = 'title'; showCharSelect(); };
  $('nameIn').oninput = () => { $('bBegin').disabled = !CREATE.cls || !$('nameIn').value.trim(); };
  $('bBegin').onclick = () => { const name = $('nameIn').value.trim().slice(0, 16); if (!name || !CREATE.cls) return; sc.style.justifyContent = ''; const C = newChar(CREATE.cls, name); saveChar(C); AU.play('gong'); CINE.play(INTRO_SCRIPT, () => { C.seenIntro = 1; startGame(C); }, cineVars(C)); };
  $('nameIn').onkeydown = e => { if (e.key === 'Enter') $('bBegin').click(); };
  RENDER.cv.onclick = e => { if (G.state !== 'create') return; for (const f of CREATE.fig) if (Math.abs(e.clientX * RENDER.px - f.x) < f.w / 2 && e.clientY * RENDER.px > f.y - f.h && e.clientY * RENDER.px < f.y) { pickClass(f.cls); break; } };
}
function pickClass(c) {
  CREATE.cls = c; AU.play('bell', 0.6); const K = CLASSES[c];
  $('clsInfo').innerHTML = `<h3>${K.name} <span style="font-size:14px;color:var(--dim);letter-spacing:.04em">· ${K.title}</span></h3><p>${K.desc}</p><div class="treelist">Skill trees: ${K.trees.join(' · ')} · Main attribute: ${STAT_NAME[K.stat]}</div>`;
  document.querySelectorAll('#clsRow [data-c]').forEach(b => b.style.color = b.dataset.c === c ? 'var(--gold-hi)' : '');
  $('bBegin').disabled = !$('nameIn').value.trim();
}
function createLoop(dt) {
  const R = RENDER, g = R.ctx; CREATE.t += dt; const t = CREATE.t; const W = R.W, H = R.H;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#050302'; g.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H * 0.56; const s = Math.min(W / 900, H / 620) * 1.3;
  g.fillStyle = rgrad(g, cx, cy, 10, 520 * s, [[0, 'rgba(120,60,20,.55)'], [0.5, 'rgba(40,18,6,.4)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(30,20,14,.9)'; g.beginPath(); g.ellipse(cx, cy + 30 * s, 360 * s, 100 * s, 0, 0, TAU); g.fill();
  CREATE.fig = [];
  const pos = [[-220, -20], [-75, -72], [75, -72], [220, -20]];
  const orderI = [0, 1, 2, 3].sort((a, b) => pos[a][1] - pos[b][1]); orderI.forEach(i => { const c = CLASS_IDS[i]; const set = creSet('hero_' + c, HERO_LOOK[c]); const sel = CREATE.cls === c; const [px, py] = pos[i]; const x = cx + px * s, y = cy + py * s + (sel ? 14 * s : 0); const k = s * 2.3 * (sel ? 1.12 : 1); const sp = (px < 0 ? set.frames : set.mframes)[0];
    g.globalAlpha = CREATE.cls && !sel ? 0.55 : 1; g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(x, y, 30 * s, 10 * s, 0, 0, TAU); g.fill(); drawSprScaled(g, sp, x, y + Math.sin(t * 1.5 + i) * s, k);
    if (sel) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; g.drawImage(glowSpr('#ffb050', 32), x - 70 * s, y - 150 * s, 140 * s, 170 * s); g.globalCompositeOperation = 'source-over'; }
    g.globalAlpha = 1; CREATE.fig.push({ cls: c, x, y, w: 70 * s, h: 130 * s }); });
  // firelight falls off into darkness
  g.fillStyle = rgrad(g, cx, cy + 20 * s, 60 * s, 460 * s, [[0, 'rgba(0,0,0,0)'], [0.45, 'rgba(0,0,0,0.12)'], [1, 'rgba(0,0,0,0.78)']]); g.fillRect(0, 0, W, H);
  // homa fire
  const fx = cx, fy = cy + 40 * s; poly(g, [fx - 50 * s, fy, fx + 50 * s, fy, fx + 40 * s, fy + 16 * s, fx - 40 * s, fy + 16 * s], '#3a2a1e');
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) { const ph = (t * 1.4 + i * 0.37) % 1; const x = fx + Math.sin(i * 7.3 + t * 3) * 26 * s * (1 - ph); const y = fy - ph * 110 * s; const r = (1 - ph) * 30 * s + 6 * s; g.globalAlpha = (1 - ph) * 0.7; g.drawImage(glowSpr(ph < 0.3 ? '#fff0a0' : ph < 0.6 ? '#ff9a2a' : '#ff4a0a', 32), x - r, y - r, r * 2, r * 2); }
  g.globalAlpha = 0.5; g.drawImage(glowSpr('#ff7a2a', 64), fx - 260 * s, fy - 220 * s, 520 * s, 360 * s); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

/* ---------- cinematics ---------- */
const CINE = {
  script: null, t: 0, i: 0, done: null, ctx: null, vars: {},
  play(script, done, vars = {}) {
    this.script = script; this.t = 0; this.i = 0; this.done = done; this.vars = vars; this.prevState = G.state; G.state = 'cine';
    $('cine').hidden = false; $('screen').hidden = true; $('hud').hidden = true; const cv = $('cineCv'); this.ctx = cv.getContext('2d'); this.resize(); AU.setMusic(script === END_SCRIPT ? 'end' : 'cine');
    $('cineSkip').onclick = () => this.skip(); $('cineText').style.opacity = 0; this.lastText = null;
    cv.onclick = () => this.next();
  },
  resize() { const cv = $('cineCv'); cv.width = RENDER.W; cv.height = RENDER.H; },
  next() { const sc = this.script[this.i]; if (!sc) return; if (this.t > 1.5) { this.t = sc.dur; } },
  skip() { if (G.state !== 'cine') return; this.end(); },
  end() { $('cine').hidden = true; $('cineText').style.opacity = 0; const d = this.done; this.done = null; this.script = null; G.state = 'title'; if (d) d(); },
  update(dt) {
    if (!this.script) return; const sc = this.script[this.i]; if (!sc) { this.end(); return; }
    this.t += dt; const g = this.ctx; const W = g.canvas.width, H = g.canvas.height;
    g.setTransform(1, 0, 0, 1, 0, 0); sc.draw(g, this.t, W, H, this.vars);
    const fadeIn = Math.min(1, this.t / 0.8), fadeOut = Math.min(1, (sc.dur - this.t) / 0.8); g.fillStyle = `rgba(0,0,0,${1 - Math.min(fadeIn, fadeOut)})`; g.fillRect(0, 0, W, H);
    const txt = typeof sc.text === 'function' ? sc.text(this.vars) : sc.text; const tEl = $('cineText');
    if (txt !== this.lastText) { this.lastText = txt; tEl.style.opacity = 0; setTimeout(() => { tEl.textContent = txt || ''; tEl.style.opacity = txt ? 1 : 0; }, 400); }
    if (this.t > sc.dur - 1.1) tEl.style.opacity = 0;
    if (sc.sfx && !sc._played) { sc._played = 1; AU.play(sc.sfx, 1); }
    if (this.t >= sc.dur) { this.i++; this.t = 0; if (this.script && this.script[this.i]) this.script[this.i]._played = 0; }
  }
};
const CINE_CACHE = {};
function drawNight(g, W, H, t, dawn = 0) {
  const top = mix('#03040e', '#4a5a8a', dawn), mid = mix('#0b1026', '#d89a6a', dawn), bot = mix('#10091a', '#f4c890', dawn);
  g.fillStyle = lgrad(g, 0, 0, 0, H, [[0, top], [0.55, mid], [1, bot]]); g.fillRect(0, 0, W, H);
  // milky way
  const rnd = mulberry(11);
  g.save(); g.globalAlpha = 0.5 * (1 - dawn); for (let i = 0; i < 260; i++) { const u = rnd(); const x = u * W, y = H * (0.05 + u * 0.35) + (rnd() - 0.5) * H * 0.14; g.fillStyle = `rgba(200,210,255,${rnd() * 0.25})`; g.beginPath(); g.arc(x, y, rnd() * 2.2 + 0.4, 0, TAU); g.fill(); } g.restore();
  for (let i = 0; i < 220; i++) { const x = rnd() * W, y = rnd() * H * 0.62; const tw = 0.5 + Math.sin(t * (1 + rnd() * 2) + i) * 0.5; const big = i % 9 === 0; g.fillStyle = `rgba(255,250,235,${(0.25 + tw * 0.7) * (1 - dawn * 0.95)})`; g.beginPath(); g.arc(x, y, big ? 1.6 : 0.9, 0, TAU); g.fill(); }
  // moon
  const mx = W * 0.74, my = H * (0.2 + dawn * 0.25), mr = Math.min(W, H) * 0.06; g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - dawn * 0.8; g.drawImage(glowSpr('#b8c8ff', 64), mx - mr * 5, my - mr * 5, mr * 10, mr * 10); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = rgrad(g, mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mr, [[0, mix('#fbfaf2', '#fff4e0', dawn)], [1, mix('#c8cce0', '#f0d8b0', dawn)]]); g.globalAlpha = 1 - dawn * 0.6; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
  g.fillStyle = 'rgba(120,130,160,.25)'; for (const [dx, dy, r] of [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.16], [-0.05, 0.35, 0.12]]) { g.beginPath(); g.arc(mx + dx * mr, my + dy * mr, r * mr, 0, TAU); g.fill(); } g.globalAlpha = 1;
  // morning star
  if (dawn > 0.25) { const sy = H * (0.5 - dawn * 0.2); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, (dawn - 0.25) * 3); g.drawImage(glowSpr('#fff4d0', 32), W * 0.2 - 30, sy - 30, 60, 60); g.fillStyle = '#fff'; g.beginPath(); g.arc(W * 0.2, sy, 2.5, 0, TAU); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  // distant hills and a stupa
  g.fillStyle = mix('#0a0d1e', '#5a4a52', dawn); g.beginPath(); g.moveTo(0, H * 0.68); for (let x = 0; x <= W; x += W / 24) g.lineTo(x, H * (0.6 + Math.sin(x / W * 7 + 1) * 0.04 + Math.sin(x / W * 19) * 0.015)); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  const stx = W * 0.14, sty = H * 0.605; g.fillStyle = mix('#070914', '#3a2e34', dawn); g.beginPath(); g.arc(stx, sty, H * 0.03, Math.PI, 0); g.fill(); g.fillRect(stx - H * 0.004, sty - H * 0.075, H * 0.008, H * 0.05); g.beginPath(); g.moveTo(stx - H * 0.012, sty - H * 0.04); g.lineTo(stx, sty - H * 0.085); g.lineTo(stx + H * 0.012, sty - H * 0.04); g.fill();
  g.fillStyle = mix('#050610', '#2a1e1e', dawn); g.beginPath(); g.moveTo(0, H * 0.76); for (let x = 0; x <= W; x += W / 16) g.lineTo(x, H * (0.72 + Math.sin(x / W * 5 + 3) * 0.025)); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = lgrad(g, 0, H * 0.8, 0, H, [[0, mix('#07060c', '#3a2a22', dawn)], [1, mix('#020203', '#1a120c', dawn)]]); g.fillRect(0, H * 0.8, W, H * 0.2);
  // fireflies
  if (dawn < 0.7) { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const x = W * (0.2 + 0.6 * ((i * 0.37 + Math.sin(t * 0.3 + i) * 0.05) % 1)), y = H * (0.55 + 0.25 * ((i * 0.61) % 1)) + Math.sin(t * 0.8 + i * 2) * 12; const a = (0.5 + 0.5 * Math.sin(t * 2 + i * 3)) * (1 - dawn); g.globalAlpha = a; g.drawImage(glowSpr('#d8ff8a', 16), x - 6, y - 6, 12, 12); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
}
function bodhiCanvas(s, dawn) {
  const key = Math.round(s * 100) + ':' + Math.round(dawn * 10); if (CINE_CACHE[key]) return CINE_CACHE[key];
  const W = Math.ceil(620 * s), H = Math.ceil(520 * s); const c = mkCanvas(W, H); const g = c.getContext('2d'); const x = W / 2, y = H - 10 * s;
  const bark = mix('#0b0a0e', '#4a3828', dawn), barkHi = mix('#2a2a3a', '#8a6a4a', dawn);
  const rnd = mulberry(5);
  // aerial roots
  for (let i = 0; i < 14; i++) { const rx = x + (rnd() - 0.5) * 360 * s; line(g, rx, y - 250 * s - rnd() * 40 * s, rx + (rnd() - 0.5) * 20 * s, y - rnd() * 60 * s, mix('#0a090c', '#3a2a1e', dawn), 1.5 * s); }
  // trunk with buttress roots
  g.fillStyle = lgrad(g, x - 50 * s, 0, x + 50 * s, 0, [[0, barkHi], [0.4, bark], [1, '#000']]);
  g.beginPath(); g.moveTo(x - 80 * s, y); g.quadraticCurveTo(x - 30 * s, y - 40 * s, x - 30 * s, y - 120 * s); g.quadraticCurveTo(x - 40 * s, y - 200 * s, x - 20 * s, y - 250 * s); g.lineTo(x + 24 * s, y - 250 * s); g.quadraticCurveTo(x + 40 * s, y - 180 * s, x + 30 * s, y - 110 * s); g.quadraticCurveTo(x + 36 * s, y - 40 * s, x + 90 * s, y); g.closePath(); g.fill();
  for (const [ax, ay, bx, by, w] of [[-10, -220, -190, -330, 22], [0, -230, 170, -350, 22], [-5, -240, -40, -420, 18], [10, -235, 90, -430, 16], [-60, -290, -260, -300, 10], [60, -300, 250, -320, 10]]) limb(g, x + ax * s, y + ay * s, x + bx * s, y + by * s, w * s, bark);
  // canopy: three layers of heart-shaped leaves
  const leaf = (lx, ly, sz, rot, col) => { g.save(); g.translate(lx, ly); g.rotate(rot); g.beginPath(); g.moveTo(0, -sz); g.bezierCurveTo(sz * 0.9, -sz * 1.1, sz * 1.1, sz * 0.2, 0, sz * 1.4); g.bezierCurveTo(-sz * 1.1, sz * 0.2, -sz * 0.9, -sz * 1.1, 0, -sz); g.fillStyle = col; g.fill(); g.restore(); };
  const layers = [[520, 0.55, 5.5, '#050a08', '#1e3a1e'], [460, 0.75, 6.5, '#07120c', '#2e5a2a'], [360, 1.0, 7.5, '#0a1a10', '#4a7a36']];
  for (const [n, br, sz, cn, cd] of layers) for (let i = 0; i < n; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()); const lx = x + Math.cos(a) * r * 280 * s, ly = y - 360 * s + Math.sin(a) * r * 150 * s - Math.max(0, Math.cos(a)) * 0; const lit = Math.max(0, (-(lx - x) / (280 * s) * 0.5 - (ly - (y - 360 * s)) / (150 * s) * 0.6)); leaf(lx, ly, sz * s * (0.8 + rnd() * 0.5), rnd() * TAU, mix(mix(cn, cd, dawn * 0.9 + 0.05), '#6a7ab0', lit * 0.25 * (1 - dawn) * br)); }
  CINE_CACHE[key] = c; return c;
}
function drawBodhiTree(g, x, y, s, t, dawn = 0) { const c = bodhiCanvas(s, Math.round(dawn * 10) / 10); const sway = Math.sin(t * 0.6) * 0.004; g.save(); g.translate(x, y); g.transform(1, 0, sway, 1, 0, 0); g.drawImage(c, -c.width / 2, -c.height + 10 * s); g.restore(); }
function cineVars(C) { const f = C && C.cls === 'chod'; return { name: C ? C.name : 'the monk', cls: C ? C.cls : 'vajra', who: f ? 'a yogini' : 'a monk', He: f ? 'She' : 'He', he: f ? 'she' : 'he', his: f ? 'her' : 'his' }; }
function drawSeatedMonk(g, x, y, s, t, eyes = 0, glow = 0, dawn = 0) {
  const K = CLASSES[(CINE.vars && CINE.vars.cls) || 'vajra'] || CLASSES.vajra; const night = '#140a06';
  const robe = mix(mix(night, K.robe, 0.35), K.robe, dawn * 0.8), robe2 = mix(mix(night, K.robe2, 0.35), K.robe2, dawn * 0.8), skin = mix('#3a2418', K.skin, 0.3 + dawn * 0.6), rim = mix('#8aa0e8', '#ffe0a0', dawn);
  const longHair = K === CLASSES.chod, bun = K === CLASSES.sage;
  if (longHair) { g.fillStyle = '#0e0a08'; g.beginPath(); g.moveTo(x - 30 * s, y - 215 * s); g.quadraticCurveTo(x - 50 * s, y - 150 * s, x - 40 * s, y - 95 * s); g.lineTo(x + 40 * s, y - 95 * s); g.quadraticCurveTo(x + 50 * s, y - 150 * s, x + 30 * s, y - 215 * s); g.closePath(); g.fill(); }
  const breathe = Math.sin(t * 0.9) * 1.2 * s;
  if (glow) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = glow; g.drawImage(glowSpr('#ffd88a', 64), x - 170 * s, y - 250 * s, 340 * s, 340 * s); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  // stone seat
  g.fillStyle = lgrad(g, x - 120 * s, 0, x + 120 * s, 0, [[0, mix('#1a1822', '#8a7a6a', dawn)], [1, mix('#07060a', '#3a2e26', dawn)]]); g.beginPath(); g.ellipse(x, y + 8 * s, 125 * s, 26 * s, 0, 0, TAU); g.fill(); g.fillRect(x - 125 * s, y + 8 * s, 250 * s, 18 * s); g.beginPath(); g.ellipse(x, y + 26 * s, 125 * s, 24 * s, 0, 0, Math.PI); g.fill();
  // crossed legs (lap) under the robe
  g.beginPath(); g.moveTo(x - 110 * s, y + 4 * s); g.bezierCurveTo(x - 110 * s, y - 40 * s, x - 40 * s, y - 52 * s, x, y - 46 * s); g.bezierCurveTo(x + 40 * s, y - 52 * s, x + 110 * s, y - 40 * s, x + 110 * s, y + 4 * s); g.quadraticCurveTo(x, y + 20 * s, x - 110 * s, y + 4 * s);
  g.fillStyle = lgrad(g, x - 110 * s, 0, x + 110 * s, 0, [[0, shade(robe, 0.15)], [0.5, robe], [1, shade(robe, -0.55)]]); g.fill();
  g.strokeStyle = rgba(shade(robe, -0.6), 0.6); g.lineWidth = 2 * s; for (const k of [-60, -25, 20, 55]) { g.beginPath(); g.moveTo(x + k * s, y - 38 * s); g.quadraticCurveTo(x + (k + 12) * s, y - 15 * s, x + (k + 4) * s, y + 8 * s); g.stroke(); }
  // torso
  g.beginPath(); g.moveTo(x - 62 * s, y - 38 * s); g.bezierCurveTo(x - 70 * s, y - 110 * s, x - 62 * s, y - 150 * s + breathe, x - 30 * s, y - 158 * s + breathe); g.lineTo(x + 30 * s, y - 158 * s + breathe); g.bezierCurveTo(x + 62 * s, y - 150 * s + breathe, x + 70 * s, y - 110 * s, x + 62 * s, y - 38 * s); g.closePath();
  g.fillStyle = lgrad(g, x - 70 * s, 0, x + 70 * s, 0, [[0, shade(robe, 0.2)], [0.45, robe], [1, shade(robe, -0.6)]]); g.fill();
  // outer robe draped across
  g.beginPath(); g.moveTo(x - 30 * s, y - 158 * s + breathe); g.bezierCurveTo(x + 10 * s, y - 120 * s, x + 40 * s, y - 80 * s, x + 64 * s, y - 40 * s); g.lineTo(x + 30 * s, y - 36 * s); g.bezierCurveTo(x + 10 * s, y - 80 * s, x - 20 * s, y - 120 * s, x - 48 * s, y - 150 * s + breathe); g.closePath(); g.fillStyle = lgrad(g, x - 40 * s, y - 150 * s, x + 60 * s, y - 40 * s, [[0, shade(robe2, 0.2)], [1, shade(robe2, -0.4)]]); g.fill();
  // hands in dhyana mudra
  g.fillStyle = lgrad(g, x - 30 * s, 0, x + 30 * s, 0, [[0, shade(skin, 0.15)], [1, shade(skin, -0.35)]]); g.beginPath(); g.ellipse(x, y - 44 * s, 30 * s, 11 * s, 0, 0, TAU); g.fill();
  g.strokeStyle = shade(skin, -0.5); g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(x - 10 * s, y - 50 * s); g.quadraticCurveTo(x, y - 60 * s, x + 10 * s, y - 50 * s); g.stroke();
  // neck and head
  g.fillStyle = shade(skin, -0.15); g.fillRect(x - 11 * s, y - 176 * s + breathe, 22 * s, 22 * s);
  const hx = x, hy = y - 205 * s + breathe;
  g.fillStyle = rgrad(g, hx - 10 * s, hy - 14 * s, 2 * s, 40 * s, [[0, shade(skin, 0.35)], [0.6, skin], [1, shade(skin, -0.5)]]); g.beginPath(); g.ellipse(hx, hy, 29 * s, 34 * s, 0, 0, TAU); g.fill();
  if (longHair || bun) { g.fillStyle = '#0e0a08'; g.beginPath(); g.ellipse(hx, hy - 16 * s, 30 * s, 20 * s, 0, Math.PI, 0); g.fill(); g.beginPath(); g.arc(hx, hy - 38 * s, 12 * s, 0, TAU); g.fill(); }
  for (const sd of [-1, 1]) { g.fillStyle = shade(skin, -0.2); g.beginPath(); g.ellipse(hx + sd * 29 * s, hy + 4 * s, 5 * s, 10 * s, 0, 0, TAU); g.fill(); }
  // moonlight rim
  g.strokeStyle = rgba(rim, 0.55); g.lineWidth = 2 * s; g.beginPath(); g.arc(hx, hy, 29 * s, Math.PI * 0.95, Math.PI * 1.6); g.stroke(); g.beginPath(); g.moveTo(x - 66 * s, y - 60 * s); g.bezierCurveTo(x - 70 * s, y - 110 * s, x - 62 * s, y - 145 * s + breathe, x - 34 * s, y - 156 * s + breathe); g.stroke();
  const fc = shade(skin, -0.55);
  if (eyes) { g.strokeStyle = fc; g.lineWidth = 1.8 * s; for (const sd of [-1, 1]) { g.beginPath(); g.arc(hx + sd * 11 * s, hy + 1 * s, 6 * s, 0.25, Math.PI - 0.25); g.stroke(); } }
  else { for (const sd of [-1, 1]) { g.fillStyle = '#e8dcc8'; g.beginPath(); g.ellipse(hx + sd * 11 * s, hy + 3 * s, 5 * s, 1.6 * s, 0, 0, Math.PI); g.fill(); g.fillStyle = '#1a1008'; g.beginPath(); g.arc(hx + sd * 11 * s, hy + 3.4 * s, 1.4 * s, 0, Math.PI); g.fill(); g.strokeStyle = fc; g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(hx + sd * 11 * s - 5.5 * s, hy + 3 * s); g.lineTo(hx + sd * 11 * s + 5.5 * s, hy + 3 * s); g.stroke(); } }
  g.strokeStyle = fc; g.lineWidth = 1.4 * s; g.beginPath(); g.moveTo(hx, hy + 4 * s); g.lineTo(hx - 2 * s, hy + 13 * s); g.lineTo(hx + 2 * s, hy + 14 * s); g.stroke();
  g.beginPath(); g.moveTo(hx - 6 * s, hy + 21 * s); g.quadraticCurveTo(hx, hy + 23 * s, hx + 6 * s, hy + 21 * s); g.stroke();
  g.strokeStyle = rgba(fc, 0.5); g.beginPath(); g.moveTo(hx - 18 * s, hy - 8 * s); g.quadraticCurveTo(hx - 11 * s, hy - 11 * s, hx - 4 * s, hy - 8 * s); g.moveTo(hx + 4 * s, hy - 8 * s); g.quadraticCurveTo(hx + 11 * s, hy - 11 * s, hx + 18 * s, hy - 8 * s); g.stroke();
}
function drawIncense(g, x, y, s, t, ashFall = 0, dawn = 0) {
  g.fillStyle = lgrad(g, x - 18 * s, 0, x + 18 * s, 0, [[0, mix('#3a2a18', '#b8904a', dawn)], [1, mix('#140c06', '#5a3a1a', dawn)]]); g.beginPath(); g.ellipse(x, y - 4 * s, 18 * s, 6 * s, 0, 0, TAU); g.fill(); g.fillRect(x - 15 * s, y - 16 * s, 30 * s, 12 * s); g.beginPath(); g.ellipse(x, y - 16 * s, 15 * s, 5 * s, 0, 0, TAU); g.fillStyle = mix('#5a4a2a', '#e8c880', dawn); g.fill();
  line(g, x, y - 16 * s, x + 4 * s, y - 80 * s, '#7a2a18', 2 * s); const tipX = x + 4 * s, tipY = y - 80 * s;
  g.fillStyle = '#a8a498';
  if (ashFall <= 0) { g.save(); g.translate(tipX, tipY); g.rotate(0.25 + Math.sin(t * 0.7) * 0.03); g.fillRect(-1.6 * s, -9 * s, 3.2 * s, 9 * s); g.restore(); }
  else { const fy = tipY - 4 * s + ashFall * ashFall * 140 * s; g.save(); g.translate(tipX + ashFall * 6 * s, Math.min(fy, y - 18 * s)); g.rotate(0.25 + ashFall * 2.5); g.fillRect(-1.6 * s, -4.5 * s, 3.2 * s, 9 * s); g.restore(); }
  g.globalCompositeOperation = 'lighter'; const gl = 7 + Math.sin(t * 5) * 1.5; g.drawImage(glowSpr('#ff5a1a', 16), tipX - gl * s, tipY - gl * s, gl * 2 * s, gl * 2 * s); g.globalCompositeOperation = 'source-over';
  for (let k = 0; k < 2; k++) { g.strokeStyle = `rgba(210,210,225,${0.22 - k * 0.08})`; g.lineWidth = (2.2 + k * 3) * s; g.beginPath(); g.moveTo(tipX, tipY - 6 * s); for (let i = 1; i < 36; i++) g.lineTo(tipX + Math.sin(i * 0.3 + t * 1.1 + k) * i * (1.2 + k * 0.6) * s, tipY - 6 * s - i * 8 * s); g.stroke(); }
}
const INTRO_SCRIPT = [
  { dur: 7, text: v => `On the last night of the rains retreat, ${v.who || 'a monk'} sat down beneath the bodhi tree.`, draw(g, t, W, H) { drawNight(g, W, H, t); const s = Math.min(W / 1000, H / 700); drawBodhiTree(g, W * 0.5, H * 0.74, s * 1.05, t); drawSeatedMonk(g, W * 0.5, H * 0.74, s * 0.72, t); drawIncense(g, W * 0.5 + 105 * s, H * 0.76, s * 0.75, t); } },
  { dur: 7, text: v => `${v.He || 'He'} vowed not to rise until ${v.he || 'he'} had seen through the wheel of birth and death.`, draw(g, t, W, H) { drawNight(g, W, H, t); const s = Math.min(W / 1000, H / 700) * (1.35 + t * 0.035); drawSeatedMonk(g, W * 0.46, H * 0.92, s, t, t > 4 ? 1 : 0, 0.1); drawIncense(g, W * 0.46 + 150 * s, H * 0.94, s, t); } },
  { dur: 6, text: v => `The incense ash had just begun to bend. ${v.He || 'He'} closed ${v.his || 'his'} eyes, and went inward.`, sfx: 'bell', draw(g, t, W, H) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const s = Math.min(W / 1000, H / 700) * 3.2; g.globalAlpha = Math.max(0, 1 - t / 5); drawIncense(g, W * 0.5, H * 0.95, s, t); g.globalAlpha = 1; g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, t / 5) * 0.8; g.drawImage(glowSpr('#ffd88a', 64), W / 2 - 60, H / 2 - 60, 120, 120); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } },
  { dur: 8, text: 'Within him turned the wheel of samsara: six realms, each a prison made of mind.', draw(g, t, W, H) { g.fillStyle = rgrad(g, W / 2, H / 2, 10, Math.max(W, H) * 0.7, [[0, '#1a0e06'], [1, '#000']]); g.fillRect(0, 0, W, H); drawBhavacakra(g, W / 2, H * 0.5, Math.min(W, H) * 0.26 * (0.8 + t * 0.03), t + 3, { spin: 0.12 }); } },
  { dur: 6, text: v => `${v.He || 'He'} would go down through all of them, from the heavens of the gods to the deepest hell.`, draw(g, t, W, H) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const z = 1 + t * t * 0.12; const R = Math.min(W, H) * 0.3 * z; drawBhavacakra(g, W / 2, H * 0.55 + R * 0.62 * Math.min(1, t / 5), R, 9, { spin: 0, hi: 0, noYama: t > 2 }); g.fillStyle = `rgba(255,248,230,${Math.max(0, (t - 4.5) / 1.5)})`; g.fillRect(0, 0, W, H); } },
  { dur: 3.5, text: v => 'Om.', sfx: 'mantra', draw(g, t, W, H) { g.fillStyle = lgrad(g, 0, 0, 0, H, [[0, '#fff8e8'], [1, '#e8d8b8']]); g.fillRect(0, 0, W, H); } }
];
const END_SCRIPT = [
  { dur: 7, text: 'The weapons of Mara\'s army fell as flowers, and his army scattered like mist before the sun.', draw(g, t, W, H) { g.fillStyle = rgrad(g, W / 2, H / 2, 10, Math.max(W, H), [[0, '#fff0d0'], [0.4, '#c89060'], [1, '#2a1208']]); g.fillRect(0, 0, W, H); const rnd = mulberry(3); for (let i = 0; i < 90; i++) { const x = rnd() * W, y = ((rnd() * H + t * (30 + rnd() * 60)) % (H + 40)) - 20; g.save(); g.translate(x + Math.sin(t + i) * 20, y); g.rotate(t + i); drawSprScaled(g, ART.fx.petal, 0, 0, 1.6 + rnd()); g.restore(); } } },
  { dur: 7, text: 'The wheel slowed, and stopped. Nothing was left to turn it.', draw(g, t, W, H) { g.fillStyle = '#0a0604'; g.fillRect(0, 0, W, H); const sp = Math.max(0, 0.3 - t * 0.05); drawBhavacakra(g, W / 2, H * 0.55, Math.min(W, H) * 0.3, t * sp * 10, { spin: 0.1 }); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, t / 6); g.drawImage(glowSpr('#fff4d0', 64), W / 2 - W * 0.6, H * 0.55 - W * 0.6, W * 1.2, W * 1.2); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } },
  { dur: 8, text: v => `${v.He || 'He'} opened ${v.his || 'his'} eyes. The incense ash that had begun to bend when ${v.he || 'he'} closed them was only now falling.`, sfx: 'bell', draw(g, t, W, H) { drawNight(g, W, H, t, 0.1); const s = Math.min(W / 1000, H / 700) * 1.9; drawSeatedMonk(g, W * 0.44, H * 0.95, s * 0.85, t, 0, 0.25); drawIncense(g, W * 0.44 + 128 * s, H * 0.97, s * 0.85, t, Math.max(0, (t - 2.5) / 3.2)); } },
  { dur: 8, text: v => `Only a moment had passed. The morning star rose, and ${v.name || 'the monk'} was awake.`, draw(g, t, W, H) { const d = Math.min(1, 0.2 + t / 7); drawNight(g, W, H, t, d); const s = Math.min(W / 1000, H / 700); drawBodhiTree(g, W * 0.5, H * 0.74, s * 1.05, t, d); drawSeatedMonk(g, W * 0.5, H * 0.74, s * 0.72, t, 0, 0.3 + d * 0.4, d); drawIncense(g, W * 0.5 + 105 * s, H * 0.76, s * 0.75, t, 1, d); } },
  { dur: 7, text: 'Gate, gate, paragate, parasamgate, bodhi svaha.', sfx: 'mantra', draw(g, t, W, H) { drawNight(g, W, H, t, 1); g.fillStyle = `rgba(255,250,235,${Math.min(0.9, t / 6)})`; g.fillRect(0, 0, W, H); } }
];
function startEnding() {
  const C = G.C; saveChar(C); $('hud').hidden = true; UI.panel = null; $('layer').hidden = true;
  CINE.play(END_SCRIPT, () => showEndCredits(C), cineVars(C));
}
function showEndCredits(C) {
  G.state = 'title'; const sc = $('screen'); sc.hidden = false; AU.setMusic('end');
  sc.innerHTML = `<h1 class="logo" style="font-size:clamp(30px,6vw,64px)">Awakened<small>${esc(C.name)} · Level ${C.level} ${CLASSES[C.cls].name}</small></h1><div class="lore" style="margin-top:22px">From the heavens of the gods to the floor of Avici, and back to the seat beneath the tree.<br><br>Time on the path: ${Math.floor(C.time / 3600)}h ${Math.floor(C.time % 3600 / 60)}m · Beings liberated: ${fmtFull(C.kills)} · Falls: ${C.deaths}</div><div class="lore" style="margin-top:14px;font-size:15px">Your monk remains in the list. You may walk the realms again with this monk, keeping every item, and hunt for what you missed.</div><div class="menu" style="width:min(320px,86vw)"><button class="btn" id="bEndMenu">Return to the Main Menu</button></div>`;
  $('bEndMenu').onclick = () => { AU.play('click'); showTitle(); };
}
function showRealmIntro(r, cb) {
  const R = REALMS[r]; const L = $('layer'); L.hidden = false; UI.panel = 'intro'; const prev = G.state; G.state = 'intro'; AU.play('gong', 0.8); AU.setMusic(R.id);
  L.innerHTML = `<div class="intro-card" id="introCard"><canvas id="introCv" style="position:absolute;inset:0;width:100%;height:100%;z-index:-1"></canvas><div class="skt">${R.skt} · The Poison of ${R.poison}</div><h2 class="big">${R.name}</h2><div class="skt" style="letter-spacing:.3em">${R.sub}</div><p class="lore">${R.intro}</p><button class="btn" id="bIntro">Enter</button></div>`;
  const cv = $('introCv'); cv.width = RENDER.W; cv.height = RENDER.H; const g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height); g.globalAlpha = 0.5; drawBhavacakra(g, cv.width / 2, cv.height * 0.5, Math.min(cv.width, cv.height) * 0.42, r * 1.3, { spin: 0, hi: r, noYama: 1 }); g.globalAlpha = 1; g.fillStyle = rgrad(g, cv.width / 2, cv.height / 2, 10, Math.max(cv.width, cv.height) * 0.6, [[0, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,.9)']]); g.fillRect(0, 0, cv.width, cv.height);
  const done = () => { UI.introDone = null; L.hidden = true; L.innerHTML = ''; UI.panel = null; G.state = 'play'; AU.play('portal', 0.6); cb && cb(); };
  UI.introDone = done; $('bIntro').onclick = done;
}

/* ---------- tutorial: shown once, after the opening cinematic and the first realm card ---------- */
function tutPages(C) {
  const touch = matchMedia('(pointer:coarse)').matches; const K = CLASSES[C.cls]; const R0 = REALMS[0];
  const bossName = R => { const a = R.areas.find(a => a.kind === 'boss'); return a && BOSSES[a.boss] ? BOSSES[a.boss].name : ''; };
  const ev = Object.values(EVOS).find(e => SKILLS[e.id].cls === C.cls), un = unionsFor(C.cls)[0], hm = harmoniesFor(C.cls)[0];
  const chip = t => `<span class="kbd">${t}</span>`;
  const realms = `<div class="realmstrip">${REALMS.map((R, i) => `<div class="rchip${i === 0 ? ' here' : ''}"><b>${i + 1}. ${esc(R.name.replace(' Realm', ''))}</b><small>${esc(R.poison)} · ${esc(bossName(R))}</small></div>`).join('')}</div>`;
  return [
    { title: 'Where You Are', html: `<canvas id="tutWheel" width="220" height="220" class="tutwheel"></canvas><p>You are <b>${esc(C.name)}</b>, a ${esc(K.name)}, sitting in meditation beneath a tree. Nothing about you moves. But the mind has doors, and tonight you have gone <i>inward</i>, into the turning of your own existence.</p><p>This is <b>Samsara</b>: the Wheel of rebirth, the six realms where beings are born and suffer and are born again, each driven by a poison of the mind. You have entered it at the top, in the <b>${esc(R0.name)}</b>, where the gods forget that bliss must end.</p>` },
    { title: 'Your Goal', html: `<p>To wake. You must descend through all six realms and overcome the poison of each. At the end of every realm stands its <b>guardian</b>: a being that embodies the realm's delusion. Defeat it and the way down opens.</p>${realms}<p>At the very bottom, in the hell of Avici, waits <b>Mara</b>, Lord of Illusion. Overcome him, and the meditation ends.</p>` },
    { title: 'Moving and Fighting', html: `<div class="tutgrid"><div><h4>Move</h4><p>${touch ? `Touch and <b>drag anywhere</b> on the world. The stick appears under your finger.` : `Use ${chip('W')}${chip('A')}${chip('S')}${chip('D')} or the arrow keys, or <b>hold the left mouse button</b> toward where you wish to go.`}</p></div><div><h4>Fight</h4><p>You do <b>not</b> aim or attack. Your equipped arts <b>cast themselves</b> at nearby enemies whenever they are ready and you have the mana. Your task is to move: stay away from danger, and keep walking into the fight.</p></div><div><h4>Gather</h4><p>Fallen enemies leave <b>merit</b> (experience), <b>gold</b> and sometimes potions. Walk over them to collect. Use potions ${touch ? 'with the buttons beside the orbs' : `with ${chip('1')} ${chip('2')}, or let them be drunk automatically`}.</p></div><div><h4>The Mantra</h4><p>Every kill fills the golden lotus. When it is full, ${touch ? 'tap it' : `press ${chip('Space')}`} to chant your <b>mantra</b>: ${esc(K.mantra)}, a mighty attack.</p></div></div>` },
    { title: 'Growing Stronger', html: `<p>Each level gives <b>5 attribute points</b> (Character screen${touch ? '' : ', ' + chip('C')}) and <b>1 skill point</b> (Skills screen${touch ? '' : ', ' + chip('T')}). A glowing dot on the buttons tells you when you have points to spend.</p><p>Your skills come in two kinds: <b>arts</b> (two trees) that you equip, up to six at a time, and a <b>passive tree</b> whose boons are always active. Raise a skill's level to make it stronger. Then look for <b>synergies</b>, which turn your build into something new:</p><div class="tutsyn"><div><b>Evolution</b><span>An art at level ${EVO_LV}+ with its matching passive at level ${EVO_PLV}+ becomes a new art.${ev ? `<br><i>${esc(SKILLS[ev.id].name)} + ${esc(SKILLS[ev.passive].name)} → ${esc(ev.name)}</i>` : ''}</span></div><div><b>Union</b><span>Two equipped arts, each at level ${UNION_LV}+, give each other an extra attack.${un ? `<br><i>${esc(SKILLS[un.a].name)} + ${esc(SKILLS[un.b].name)} → ${esc(un.name)}</i>` : ''}</span></div><div><b>Harmony</b><span>Two passives at level ${HARM_LV}+ grant a bonus together.${hm ? `<br><i>${esc(SKILLS[hm.a].name)} + ${esc(SKILLS[hm.b].name)} → ${esc(hm.name)}</i>` : ''}</span></div></div><p style="margin-bottom:0">The <b>Synergies</b> tab of the Skills screen lists every recipe for your class and how close you are to each.</p>` },
    { title: 'Gear and the Sanctuary', html: `<p>Each realm has a <b>sanctuary</b> where you start: a safe place with a <b>merchant</b> and a <b>smith</b>, a <b>stash</b> for spare items, and the realm's <b>guide</b>. Wounds heal completely here.</p><p><b>Gear comes from two places only:</b> the guardians of each realm, and the vendors. Everything else you meet drops gold, merit and potions, so spend your gold well.</p><p>${touch ? 'Tap an item to select it, then use the buttons to equip, sell or buy.' : `In shops, <b>right-click</b> an item to buy it, and right-click an item in your bag to sell it. In your inventory, right-click (or double-click) to equip.`} Items need strength, dexterity, spirit or a level to wear. Red slots mean you cannot use them yet.</p><p style="margin-bottom:0">If you fall, you wake in the sanctuary and lose some gold, and the realm remains as you left it. Use the <b>portal</b> button to return to the sanctuary at any time, and <b>waypoints</b> to travel between places you have found.</p>` },
    { title: 'Your First Steps', html: `<p>Look about the sanctuary. Find <b>${esc(R0.guide.name)}</b>, ${esc(R0.guide.title)}, and ${touch ? 'tap <b>Talk</b> when you are close' : `press ${chip('E')} when you are close`}. The guide offers <b>quests</b> that give skill points, attribute points and the way onward.</p><p>Then leave through the glowing <b>gate</b> to the first field and let your arts do their work. Learn a second skill as soon as you can: you will have a point at level 2.</p><p>Open the <b>map</b> ${touch ? 'button' : chip('M')} when lost, the <b>quest log</b> ${touch ? 'button' : chip('Q')} to see what you need, and the menu for these instructions at any time under <b>How to Play</b>.</p><p style="margin-bottom:0;color:var(--gold-hi);text-align:center;font-family:var(--f-ui);letter-spacing:.08em">May all beings be free from suffering.</p>` }
  ];
}
function showTutorial(C, cb) {
  const L = $('layer'); const pages = tutPages(C); let i = 0; L.hidden = false; UI.panel = 'tutorial'; G.state = 'panel';
  let fin = false; const finish = () => { if (fin) return; fin = true; UI.tutDone = null; C.seenTut = 1; saveChar(C); L.hidden = true; L.innerHTML = ''; UI.panel = null; G.state = 'play'; G.keys = {}; AU.play('close', 0.5); cb && cb(); };
  UI.tutDone = finish;
  const draw = () => {
    const p = pages[i]; const last = i === pages.length - 1;
    L.innerHTML = `<div class="panel wide stone tut"><div class="ph"><h2>${p.title}</h2><button class="x" id="tutX" aria-label="Skip tutorial" title="Skip tutorial">&times;</button></div><div class="pb"><div class="tutbody">${p.html}</div></div><div class="tutnav"><div class="dots">${pages.map((_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('')}</div><div class="navbtns">${i ? '<button class="btn small" id="tutBack">Back</button>' : '<button class="btn small" id="tutSkip">Skip</button>'}<button class="btn small" id="tutNext">${last ? 'Begin the Path' : 'Next'}</button></div></div></div>`;
    $('tutNext').onclick = () => { AU.play('click'); if (last) finish(); else { i++; draw(); } };
    if ($('tutBack')) $('tutBack').onclick = () => { AU.play('click'); i--; draw(); };
    if ($('tutSkip')) $('tutSkip').onclick = finish; $('tutX').onclick = finish;
    const cv = $('tutWheel'); if (cv) { const g = cv.getContext('2d'); try { drawBhavacakra(g, 110, 110, 100, 0, { spin: 0, hi: 0, noYama: 1 }); } catch (e) { } }
  };
  draw();
}
