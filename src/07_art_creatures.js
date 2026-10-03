/* ================= art: creatures, heroes, NPCs, bosses ================= */
function paintHumanoid(g, L, f, bx, by) {
  const H = L.h; const u = H / 50;
  const walk = f < 4; const ph = (f % 4) / 4 * TAU; const atk = f === 4;
  const swing = walk ? Math.sin(ph) * H * 0.07 : 0; const bob = walk ? -Math.abs(Math.cos(ph)) * H * 0.02 : 0;
  const bulk = L.bulky ? 1.35 : L.thin ? 0.8 : 1; const garb = L.garb || (L.bare ? 'loin' : 'robe');
  const hunch = L.hunch ? H * 0.08 : 0;
  const hipY = by - H * 0.42 + bob, shY = by - H * 0.72 + bob + hunch * 0.6, neckY = by - H * 0.8 + bob + hunch;
  const headR = (L.headR || 0.105) * H; const headX = bx + hunch * 0.9 + (atk ? 2 * u : 0), headY = by - H * 0.88 + bob + hunch * 1.1;
  const sw = H * 0.16 * bulk, hw = H * 0.12 * bulk;
  const skin = L.skin || '#c89060', cl = L.cloth || '#8a5a2a', c2 = L.cloth2 || shade(cl, 0.3);
  const lean = atk ? 3 * u : 0;
  // wings
  if (L.wings) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(bx + s * 3 * u, shY + 3 * u); g.quadraticCurveTo(bx + s * 22 * u, shY - 20 * u + Math.sin(ph) * 4 * u, bx + s * 26 * u, shY + 10 * u); g.quadraticCurveTo(bx + s * 16 * u, shY + 6 * u, bx + s * 3 * u, shY + 10 * u); g.fillStyle = lgrad(g, bx, shY - 20 * u, bx, shY + 10 * u, [[0, shade(L.wings, 0.4)], [1, shade(L.wings, -0.3)]]); g.fill(); }
  if (L.halo) { g.fillStyle = rgrad(g, headX, headY, headR * 0.8, headR * 2.4, [[0, rgba(L.halo, 0.9)], [0.5, rgba(L.halo, 0.35)], [1, rgba(L.halo, 0)]]); ellipse(g, headX, headY, headR * 2.4, headR * 2.4, g.fillStyle); g.strokeStyle = rgba(L.halo, 0.9); g.lineWidth = 1.2 * u; g.beginPath(); g.arc(headX, headY, headR * 1.7, 0, TAU); g.stroke(); }
  if (L.flamehalo) { for (let i = 0; i < 12; i++) { const a = -Math.PI + i / 11 * Math.PI; const r = headR * 2.4 + Math.sin(i * 3 + f) * 2 * u; poly(g, [headX + Math.cos(a) * headR * 1.4, headY + Math.sin(a) * headR * 1.4, headX + Math.cos(a) * r, headY + Math.sin(a) * r, headX + Math.cos(a + 0.2) * headR * 1.4, headY + Math.sin(a + 0.2) * headR * 1.4], i % 2 ? '#ff8a2a' : '#ffd060'); } }
  const armC = garb === 'robe' && !L.bareArm ? cl : skin;
  const handY = hipY - 1 * u;
  // extra arms (behind)
  const nArms = L.arms || 2;
  if (nArms >= 4) { limb(g, bx - sw * 0.5, shY + 2 * u, bx - sw * 1.6, shY - 8 * u - swing * 0.3, 3.4 * u, skin); limb(g, bx + sw * 0.5, shY + 2 * u, bx + sw * 1.7, shY - 10 * u + swing * 0.3, 3.4 * u, skin); }
  if (nArms >= 6) { limb(g, bx - sw * 0.4, shY + 5 * u, bx - sw * 1.9, shY + 4 * u, 3.2 * u, skin); limb(g, bx + sw * 0.4, shY + 5 * u, bx + sw * 1.9, shY + 3 * u, 3.2 * u, skin); }
  // back arm
  const baX = bx - sw * 0.85, baEnd = [baX - swing * 0.5 - 1 * u, handY];
  limb(g, baX, shY + 1.5 * u, baEnd[0], baEnd[1], 4.2 * u * bulk, garb === 'robe' ? shade(armC, -0.15) : shade(skin, -0.15));
  ball(g, baEnd[0], baEnd[1], 2.2 * u * bulk, 2.2 * u * bulk, shade(skin, -0.15));
  if (L.weapon === 'bell' || L.weapon === 'mala2') { poly(g, [baEnd[0] - 3 * u, baEnd[1] + 7 * u, baEnd[0] - 2 * u, baEnd[1] + 1 * u, baEnd[0] + 2 * u, baEnd[1] + 1 * u, baEnd[0] + 3 * u, baEnd[1] + 7 * u], '#e0b040'); }
  // legs
  const legW = 4.6 * u * bulk * (L.thin ? 0.75 : 1);
  if (garb !== 'robe') {
    limb(g, bx - hw * 0.4, hipY, bx - hw * 0.45 - swing, by - 2 * u, legW, shade(L.pants || skin, -0.15));
    limb(g, bx + hw * 0.4, hipY, bx + hw * 0.45 + swing, by - 2 * u, legW, L.pants || skin);
  }
  // feet
  ellipse(g, bx - hw * 0.45 - swing + 1.5 * u, by - 1 * u, 3.2 * u, 1.6 * u, L.feet || '#3a2a1a');
  ellipse(g, bx + hw * 0.45 + swing + 1.5 * u, by - 1 * u, 3.2 * u, 1.6 * u, L.feet || '#3a2a1a');
  // torso & garment
  if (garb === 'robe') {
    const hem = by - H * 0.04, hemW = H * 0.22 * bulk;
    g.beginPath(); g.moveTo(bx - sw + lean * 0.3, shY); g.quadraticCurveTo(bx - sw * 1.05, hipY, bx - hemW + swing * 0.3, hem); g.quadraticCurveTo(bx, hem + 2 * u, bx + hemW + swing * 0.3, hem); g.quadraticCurveTo(bx + sw * 1.05, hipY, bx + sw + lean * 0.3, shY); g.closePath();
    g.fillStyle = lgrad(g, bx - hemW, 0, bx + hemW, 0, [[0, shade(cl, 0.22)], [0.45, cl], [1, shade(cl, -0.45)]]); g.fill();
    g.globalAlpha = 0.35; for (let i = -1; i <= 1; i++) curve(g, [bx + i * sw * 0.55, hipY - 4 * u, bx + i * sw * 0.7 + swing * 0.2, hipY + 8 * u, bx + i * hemW * 0.6 + swing * 0.3, hem - 1 * u], shade(cl, -0.5), 0.9 * u); g.globalAlpha = 1;
    // shawl / sash across the body
    if (!L.noSash) { g.beginPath(); g.moveTo(bx - sw, shY + 1 * u); g.lineTo(bx - sw * 0.2, shY - 1 * u); g.lineTo(bx + sw * 0.9, hipY + 1 * u); g.lineTo(bx + sw * 0.3, hipY + 4 * u); g.closePath(); g.fillStyle = lgrad(g, bx - sw, 0, bx + sw, 0, [[0, shade(c2, 0.2)], [1, shade(c2, -0.35)]]); g.fill(); }
    if (L.bareArm) { ball(g, bx + sw * 0.75, shY + 2 * u, 3.4 * u, 3 * u, skin); }
  } else {
    // bare or tunic torso
    const torsoC = garb === 'loin' ? skin : cl;
    g.beginPath(); g.moveTo(bx - sw, shY); g.quadraticCurveTo(bx - sw * 0.95, hipY - 4 * u, bx - hw, hipY + 1 * u); g.lineTo(bx + hw, hipY + 1 * u); g.quadraticCurveTo(bx + sw * 0.95, hipY - 4 * u, bx + sw, shY); g.closePath();
    g.fillStyle = lgrad(g, bx - sw, 0, bx + sw, 0, [[0, shade(torsoC, 0.2)], [0.5, torsoC], [1, shade(torsoC, -0.45)]]); g.fill();
    if (garb === 'loin') { if (!L.thin) { curve(g, [bx - sw * 0.5, shY + 5 * u, bx, shY + 8 * u, bx + sw * 0.5, shY + 5 * u], shade(skin, -0.35), 0.8 * u); line(g, bx, shY + 9 * u, bx, hipY - 3 * u, shade(skin, -0.3), 0.7 * u); } else { for (let i = 0; i < 4; i++) curve(g, [bx - sw * 0.6, shY + (3 + i * 3) * u, bx, shY + (4 + i * 3) * u, bx + sw * 0.6, shY + (3 + i * 3) * u], shade(skin, -0.4), 0.6 * u); } }
    // skirt / loincloth
    const skW = garb === 'tunic' ? hw * 1.4 : hw * 1.1, skL = garb === 'tunic' ? H * 0.2 : H * 0.13;
    poly(g, [bx - hw * 1.05, hipY - 1 * u, bx + hw * 1.05, hipY - 1 * u, bx + skW + swing * 0.2, hipY + skL, bx - skW + swing * 0.2, hipY + skL], lgrad(g, bx - skW, 0, bx + skW, 0, [[0, shade(c2, 0.2)], [1, shade(c2, -0.4)]]));
    line(g, bx - hw * 1.05, hipY - 1 * u, bx + hw * 1.05, hipY - 1 * u, shade(c2, 0.4), 1.4 * u);
  }
  if (L.armor) { poly(g, [bx - sw * 0.9, shY + 1 * u, bx + sw * 0.9, shY + 1 * u, bx + sw * 0.75, hipY - 3 * u, bx - sw * 0.75, hipY - 3 * u], lgrad(g, bx - sw, 0, bx + sw, 0, [[0, shade(L.armor, 0.35)], [1, shade(L.armor, -0.45)]])); for (let i = 1; i < 4; i++) line(g, bx - sw * 0.85, shY + i * 4 * u, bx + sw * 0.85, shY + i * 4 * u, shade(L.armor, -0.5), 0.6 * u); ball(g, bx - sw * 0.95, shY + 1 * u, 3.2 * u, 2.6 * u, L.armor); ball(g, bx + sw * 0.95, shY + 1 * u, 3.2 * u, 2.6 * u, L.armor); }
  if (L.belly) { ball(g, bx + 2 * u, hipY - 4 * u, 9 * u, 8.5 * u, shade(skin, 0.05), 0.35, -0.5); ellipse(g, bx + 3 * u, hipY - 3 * u, 0.9 * u, 0.9 * u, shade(skin, -0.5)); }
  if (L.garland) { for (let i = 0; i < 12; i++) { const a = Math.PI * 0.1 + i / 11 * Math.PI * 0.8; ellipse(g, bx + Math.cos(a) * sw * 0.9, shY + 1 * u + Math.sin(a) * 9 * u, 1.1 * u, 2 * u, '#f0e6d0', a); } }
  if (L.beads) { for (let i = 0; i < 9; i++) { const a = Math.PI * 0.15 + i / 8 * Math.PI * 0.7; ball(g, bx + Math.cos(a) * sw * 0.7, shY + Math.sin(a) * 7 * u, 1.1 * u, 1.1 * u, L.beads); } }
  // neck
  const neckW = L.thin && L.belly ? 1.6 * u : 3.8 * u * bulk;
  limb(g, bx + hunch * 0.5, shY + 1 * u, headX, headY + headR * 0.6, neckW, skin);
  // head
  paintHead(g, L, headX, headY, headR, u, f);
  // front arm & weapon
  const faX = bx + sw * 0.85;
  let hx = faX + swing * 0.5 + 1 * u, hy = handY;
  if (atk) { hx = faX + 9 * u; hy = shY - 2 * u; }
  if (L.weapon === 'lute') { hx = bx + 2 * u; hy = hipY - 6 * u; }
  if (L.weapon === 'drum') { hx = bx + 3 * u; hy = hipY - 7 * u; }
  const faC = garb === 'robe' && !L.bareArm ? cl : skin;
  paintWeapon(g, L, hx, hy, u, f, atk, 'back');
  limb(g, faX, shY + 1.5 * u, hx, hy, 4.2 * u * bulk, faC);
  ball(g, hx, hy, 2.3 * u * bulk, 2.3 * u * bulk, skin);
  paintWeapon(g, L, hx, hy, u, f, atk, 'front');
  if (L.scarf) { g.globalAlpha = 0.85; curve(g, [bx - sw * 1.2, shY + 2 * u, bx - sw * 2 - swing, hipY, bx - sw * 1.6 - swing * 1.5, by - 4 * u], L.scarf, 1.6 * u); curve(g, [bx + sw * 1.1, shY + 2 * u, bx + sw * 2.2 + swing, hipY - 4 * u, bx + sw * 2.4, hipY + 8 * u], L.scarf, 1.6 * u); g.globalAlpha = 1; }
  if (L.burnt) { g.globalAlpha = 0.8; for (let i = 0; i < 6; i++) ball(g, bx + rand(-sw, sw), rand(shY, by - 4 * u), 1.1 * u, 1.1 * u, i % 2 ? '#ff6a1a' : '#ffb040'); g.globalAlpha = 1; }
  if (L.icy) { g.globalAlpha = 0.6; for (let i = 0; i < 5; i++) { const x = bx + rand(-sw, sw), y = rand(shY, hipY); poly(g, [x - 2 * u, y, x, y - 5 * u, x + 2 * u, y], '#e8f8ff'); } g.globalAlpha = 1; }
}
function paintHead(g, L, x, y, r, u, f) {
  const skin = L.skin || '#c89060'; const hd = L.head || 'bald';
  if (hd === 'ox' || hd === 'horse') {
    const col = hd === 'ox' ? '#4a3024' : '#6a4028';
    if (hd === 'ox') { for (const s of [-1, 1]) curve(g, [x + s * r * 0.7, y - r * 0.6, x + s * r * 2.2, y - r * 1.0, x + s * r * 2.0, y - r * 2.2], '#e8dcc0', 2.2 * u); }
    else { for (let i = 0; i < 5; i++) line(g, x - r * 0.4 - i * 1.2 * u, y - r * 1.1 + i * 2 * u, x - r * 1.4, y + i * 3 * u, '#1a1210', 1.4 * u); }
    ball(g, x, y, r * 1.1, r * 1.15, col); ball(g, x + r * 0.9, y + r * (hd === 'horse' ? 0.7 : 0.45), r * (hd === 'horse' ? 0.9 : 0.75), r * 0.6, shade(col, 0.15));
    ellipse(g, x + r * 1.4, y + r * 0.5, 0.8 * u, 0.8 * u, '#1a0a0a'); ellipse(g, x + r * 0.35, y - r * 0.3, 1.1 * u, 1.1 * u, '#ff4a1a');
    if (hd === 'ox') { g.strokeStyle = '#c8b050'; g.lineWidth = 0.8 * u; g.beginPath(); g.arc(x + r * 1.3, y + r * 0.85, 1.6 * u, 0, TAU); g.stroke(); }
    ellipse(g, x - r * 0.5, y - r * 0.9, 1.6 * u, 3 * u, col, -0.5);
    return;
  }
  if (hd === 'bird') { ball(g, x, y, r * 1.05, r, L.cloth || '#58b0a0'); poly(g, [x + r * 0.7, y - r * 0.1, x + r * 2.1, y + r * 0.3, x + r * 0.7, y + r * 0.5], '#e8b040'); ellipse(g, x + r * 0.35, y - r * 0.2, 1 * u, 1 * u, '#1a1010'); for (let i = 0; i < 3; i++) poly(g, [x - r * 0.3 + i * 2 * u, y - r * 0.8, x - r * 0.8 + i * 2 * u, y - r * 1.9, x + i * 2 * u, y - r * 0.9], '#f0d060'); return; }
  if (hd === 'ape') { ball(g, x, y, r * 1.15, r * 1.1, '#5a5a5a'); ball(g, x + r * 0.45, y + r * 0.25, r * 0.7, r * 0.55, '#b8a898'); ellipse(g, x + r * 0.2, y - r * 0.25, 1 * u, 1 * u, '#1a1010'); ellipse(g, x + r * 0.7, y - r * 0.25, 1 * u, 1 * u, '#1a1010'); line(g, x - r * 0.3, y - r * 0.55, x + r * 0.9, y - r * 0.55, '#2a2a2a', 1.4 * u); return; }
  const skull = hd === 'skull';
  if (hd === 'yogini') { g.fillStyle = lgrad(g, 0, y - r, 0, y + r * 3.2, [[0, '#1a1210'], [1, 'rgba(26,18,16,0.6)']]); g.beginPath(); g.moveTo(x - r * 1.05, y - r * 0.3); g.quadraticCurveTo(x - r * 1.7, y + r * 1.6, x - r * 1.2, y + r * 3.2); g.lineTo(x + r * 0.9, y + r * 3.0); g.quadraticCurveTo(x + r * 1.4, y + r * 1.4, x + r * 1.0, y - r * 0.3); g.closePath(); g.fill(); }
  ball(g, x, y, r, r * 1.05, skull ? '#d8d0bc' : skin, 0.35, -0.45);
  if (hd === 'hood') { g.beginPath(); g.arc(x - r * 0.1, y - r * 0.1, r * 1.3, Math.PI * 0.55, Math.PI * 2.3); g.quadraticCurveTo(x + r * 1.2, y + r * 1.2, x - r * 0.5, y + r * 1.3); g.fillStyle = L.cloth2 || '#4a3a2a'; g.fill(); ellipse(g, x + r * 0.3, y + r * 0.1, r * 0.55, r * 0.7, '#1a120c'); ellipse(g, x + r * 0.45, y, 0.8 * u, 0.8 * u, L.eye || '#e8d8b0'); return; }
  // face
  const eyeC = L.eye || (skull ? '#ff4a1a' : '#1a1210');
  if (skull) { ellipse(g, x + r * 0.05, y - r * 0.05, r * 0.28, r * 0.3, '#1a0e0a'); ellipse(g, x + r * 0.62, y - r * 0.05, r * 0.24, r * 0.3, '#1a0e0a'); ellipse(g, x + r * 0.05, y - r * 0.05, 0.7 * u, 0.7 * u, eyeC); ellipse(g, x + r * 0.62, y - r * 0.05, 0.7 * u, 0.7 * u, eyeC); for (let i = 0; i < 4; i++) line(g, x + r * (0.05 + i * 0.18), y + r * 0.55, x + r * (0.05 + i * 0.18), y + r * 0.8, '#3a2a1a', 0.6 * u); }
  else { ellipse(g, x + r * 0.15, y - r * 0.05, 0.9 * u, 1 * u, eyeC); ellipse(g, x + r * 0.62, y - r * 0.05, 0.8 * u, 0.95 * u, eyeC); line(g, x + r * 0.4, y + r * 0.45, x + r * 0.7, y + r * 0.45, shade(skin, -0.45), 0.6 * u); }
  if (L.fangs) { poly(g, [x + r * 0.25, y + r * 0.5, x + r * 0.35, y + r * 0.95, x + r * 0.45, y + r * 0.5], '#f0ece0'); poly(g, [x + r * 0.6, y + r * 0.5, x + r * 0.7, y + r * 0.9, x + r * 0.8, y + r * 0.5], '#f0ece0'); }
  if (L.mouthfire) { g.fillStyle = rgrad(g, x + r * 0.6, y + r * 0.6, 0.2, r * 1.2, [[0, '#fff4a0'], [0.4, 'rgba(255,120,20,.9)'], [1, 'rgba(255,60,10,0)']]); ellipse(g, x + r * 0.7, y + r * 0.6, r * 1.2, r * 0.9, g.fillStyle); }
  switch (hd) {
    case 'crown': ball(g, x - r * 0.2, y - r * 0.85, r * 0.55, r * 0.5, '#2a1a12'); poly(g, [x - r * 0.9, y - r * 0.55, x - r * 0.8, y - r * 1.25, x - r * 0.4, y - r * 0.85, x, y - r * 1.45, x + r * 0.4, y - r * 0.85, x + r * 0.8, y - r * 1.25, x + r * 0.9, y - r * 0.55], lgrad(g, 0, y - r * 1.4, 0, y - r * 0.5, [[0, '#fff0a0'], [1, '#b8862a']])); ball(g, x, y - r * 0.85, 1 * u, 1 * u, '#ff4a6a'); break;
    case 'helm': g.beginPath(); g.arc(x, y - r * 0.1, r * 1.12, Math.PI, 0); g.lineTo(x + r * 1.12, y + r * 0.2); g.lineTo(x - r * 1.12, y + r * 0.2); g.closePath(); g.fillStyle = lgrad(g, x - r, 0, x + r, 0, [[0, '#fff0b0'], [1, '#a8781a']]); g.fill(); poly(g, [x - r * 0.2, y - r * 1.1, x, y - r * 2.1, x + r * 0.2, y - r * 1.1], '#e8402a'); break;
    case 'horns': ball(g, x - r * 0.2, y - r * 0.6, r * 0.9, r * 0.6, '#1a1210'); for (const s of [-1, 1]) curve(g, [x + s * r * 0.5, y - r * 0.7, x + s * r * 1.4, y - r * 1.3, x + s * r * 0.9, y - r * 2.2], '#d8d0b8', 1.8 * u); break;
    case 'hair': for (let i = 0; i < 9; i++) { const a = Math.PI * (0.8 + i * 0.16); curve(g, [x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.3 + 3 * u, x + Math.cos(a) * r * 1.4 - 2 * u, y + r * 1.4 + (i % 3) * 2 * u], '#2a2420', 1.2 * u); } break;
    case 'turban': ball(g, x - r * 0.1, y - r * 0.6, r * 1.1, r * 0.72, L.cloth2 || '#e8e0c8', 0.3, -0.4); curve(g, [x - r, y - r * 0.5, x, y - r * 1.1, x + r, y - r * 0.4], shade(L.cloth2 || '#e8e0c8', -0.3), 0.9 * u); break;
    case 'kasa': poly(g, [x - r * 2.2, y - r * 0.3, x, y - r * 1.9, x + r * 2.2, y - r * 0.3], lgrad(g, x - r * 2, 0, x + r * 2, 0, [[0, '#f0d898'], [1, '#8a6a30']])); ellipse(g, x, y - r * 0.3, r * 2.2, r * 0.35, '#7a5a28'); for (let i = 0; i < 5; i++) line(g, x, y - r * 1.9, x - r * 2 + i * r, y - r * 0.35, 'rgba(80,50,20,.45)', 0.5 * u); break;
    case 'pandita': poly(g, [x - r * 1.1, y - r * 0.4, x - r * 0.2, y - r * 2.6, x + r * 0.5, y - r * 2.4, x + r * 1.1, y - r * 0.4], lgrad(g, x - r, 0, x + r, 0, [[0, '#fff08a'], [1, '#c8901a']])); for (let i = 0; i < 5; i++) line(g, x - r * 0.9 + i * r * 0.45, y - r * 0.5, x - r * 0.2 + i * 0.15 * r, y - r * 2.4, 'rgba(160,110,20,.6)', 0.6 * u); break;
    case 'skullcrown': for (let i = 0; i < 5; i++) ball(g, x - r * 0.8 + i * r * 0.4, y - r * 0.95 - Math.sin(i / 4 * Math.PI) * r * 0.25, r * 0.22, r * 0.24, '#f0ece0'); break;
    case 'bun': ball(g, x - r * 0.3, y - r * 0.9, r * 0.45, r * 0.4, '#1a1210'); break;
    case 'yogini': g.fillStyle = '#1a1210'; g.beginPath(); g.ellipse(x - r * 0.1, y - r * 0.55, r * 1.02, r * 0.55, 0, Math.PI, 0); g.fill(); ball(g, x - r * 0.1, y - r * 1.15, r * 0.4, r * 0.38, '#1a1210'); for (let i = 0; i < 5; i++) ball(g, x - r * 0.7 + i * r * 0.35, y - r * 0.72 - Math.sin(i / 4 * Math.PI) * r * 0.18, r * 0.16, r * 0.17, '#f4ecd8'); break;
  }
}
function paintWeapon(g, L, x, y, u, f, atk, layer) {
  const w = L.weapon; if (!w || w === 'none') return;
  const back = layer === 'back', front = !back;
  switch (w) {
    case 'sword': if (front) { g.save(); g.translate(x, y); g.rotate(atk ? -0.3 : -1.1); poly(g, [-1 * u, 0, 1 * u, 0, 1.5 * u, -16 * u, 0, -19 * u, -1.2 * u, -16 * u], lgrad(g, -2 * u, 0, 2 * u, 0, [[0, '#f0f4ff'], [1, '#7a7a8a']])); line(g, -3 * u, 0, 3 * u, 0, '#c8a040', 1.4 * u); g.restore(); } break;
    case 'flamesword': if (front) { g.save(); g.translate(x, y); g.rotate(atk ? -0.2 : -0.9); poly(g, [-1.1 * u, 0, 1.1 * u, 0, 1.6 * u, -18 * u, 0, -22 * u, -1.3 * u, -18 * u], lgrad(g, -2 * u, 0, 2 * u, 0, [[0, '#ffffff'], [1, '#b8b8d0']])); for (let i = 0; i < 5; i++) poly(g, [1.3 * u, -4 * u - i * 3.5 * u, 5 * u + Math.sin(f + i) * u, -7 * u - i * 3.5 * u, 1.3 * u, -1 * u - i * 3.5 * u], i % 2 ? '#ffd060' : '#ff7a2a'); line(g, -3.5 * u, 0, 3.5 * u, 0, '#e0b040', 1.6 * u); g.restore(); } break;
    case 'spear': case 'trident': if (back) { line(g, x - 6 * u, y + 10 * u, x + 4 * u, y - 26 * u, '#5a4028', 1.6 * u); if (w === 'spear') poly(g, [x + 3 * u, y - 25 * u, x + 5.5 * u, y - 33 * u, x + 6 * u, y - 24 * u], '#e0e0e8'); else { for (const d of [-2.5, 0, 2.5]) line(g, x + 4 * u + d * u, y - 26 * u, x + 4.5 * u + d * u * 1.2, y - 32 * u, '#c8c8d0', 1.1 * u); line(g, x + 1.5 * u, y - 26 * u, x + 7 * u, y - 26 * u, '#c8c8d0', 1.1 * u); } } break;
    case 'staff': case 'khakkhara': if (back) { line(g, x - 1 * u, y + 12 * u, x + 1 * u, y - 30 * u, '#6a4424', 1.8 * u); if (w === 'khakkhara') { g.strokeStyle = '#e0c060'; g.lineWidth = 1 * u; g.beginPath(); g.ellipse(x + 1 * u, y - 34 * u, 3.5 * u, 4.5 * u, 0, 0, TAU); g.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.beginPath(); g.arc(x + 1 * u + Math.cos(a) * 4 * u, y - 34 * u + Math.sin(a) * 5 * u, 1.3 * u, 0, TAU); g.stroke(); } } else ball(g, x + 1 * u, y - 31 * u, 2.4 * u, 2.4 * u, '#ffe890'); } break;
    case 'khatvanga': if (back) { line(g, x - 1 * u, y + 12 * u, x + 1.5 * u, y - 26 * u, '#e8dcc0', 1.5 * u); for (let i = 0; i < 3; i++) ball(g, x + 1.5 * u, y - 28 * u - i * 3 * u, (2.2 - i * 0.3) * u, 1.9 * u, ['#a86a4a', '#c8a080', '#f0e8d0'][i]); g.strokeStyle = '#c8b070'; g.lineWidth = 0.8 * u; g.beginPath(); g.moveTo(x - 1.5 * u, y - 40 * u); g.lineTo(x - 1.5 * u, y - 37 * u); g.quadraticCurveTo(x + 1.5 * u, y - 35 * u, x + 4.5 * u, y - 37 * u); g.lineTo(x + 4.5 * u, y - 40 * u); g.moveTo(x + 1.5 * u, y - 41 * u); g.lineTo(x + 1.5 * u, y - 36 * u); g.stroke(); line(g, x + 1.5 * u, y - 24 * u, x + 5 * u, y - 18 * u, '#c81a1a', 1 * u); } break;
    case 'bow': if (back) { g.strokeStyle = '#5a3a1a'; g.lineWidth = 1.5 * u; g.beginPath(); g.moveTo(x + 2 * u, y - 16 * u); g.quadraticCurveTo(x + 9 * u, y, x + 2 * u, y + 14 * u); g.stroke(); line(g, x + 2 * u, y - 16 * u, x + 2 * u, y + 14 * u, '#e8e0d0', 0.5 * u); } break;
    case 'yumi': if (back) { g.strokeStyle = '#1e1410'; g.lineWidth = 1.6 * u; g.beginPath(); g.moveTo(x + 1 * u, y - 30 * u); g.quadraticCurveTo(x + 10 * u, y - 12 * u, x + 3 * u, y - 2 * u); g.quadraticCurveTo(x + 7 * u, y + 6 * u, x + 1 * u, y + 12 * u); g.stroke(); line(g, x + 1 * u, y - 30 * u, x + 1 * u, y + 12 * u, '#f0e8d8', 0.45 * u); line(g, x + 4 * u, y - 4 * u, x + 5 * u, y + 1 * u, '#c8302a', 1.6 * u); } break;
    case 'club': if (front) { g.save(); g.translate(x, y); g.rotate(atk ? -0.4 : -1.2); line(g, 0, 2 * u, 0, -12 * u, '#4a3020', 2.2 * u); ball(g, 0, -16 * u, 4.5 * u, 6 * u, '#6a5a4a'); for (let i = 0; i < 5; i++) ball(g, Math.cos(i) * 4 * u, -16 * u + Math.sin(i * 2) * 5 * u, 1 * u, 1 * u, '#c8c8c8'); g.restore(); } break;
    case 'lute': if (front) { g.save(); g.translate(x, y); g.rotate(-0.5); line(g, -14 * u, 0, 10 * u, 0, '#6a3a1a', 1.8 * u); ball(g, -14 * u, 0, 5 * u, 4.5 * u, '#c8802a'); ball(g, 8 * u, 0, 3.5 * u, 3 * u, '#c8802a'); for (let i = 0; i < 3; i++) line(g, -12 * u, -1 * u + i * u, 9 * u, -1 * u + i * u, '#fff0c0', 0.25 * u); g.restore(); } break;
    case 'drum': if (front) { ball(g, x, y + 3 * u, 6 * u, 4.5 * u, '#8a2a1a'); ellipse(g, x, y + 0 * u, 6 * u, 1.8 * u, '#e8d8b0'); } break;
    case 'claws': if (front) for (let i = 0; i < 3; i++) line(g, x + 1 * u, y + i * u, x + 5 * u, y + 3 * u + i * 1.2 * u, '#e8e0d0', 0.6 * u); break;
    case 'vajra': if (front) { g.save(); g.translate(x, y - 1 * u); g.rotate(atk ? -0.3 : 0.3); ball(g, 0, 0, 1.6 * u, 1.6 * u, '#ffe080'); for (const d of [-1, 1]) { g.strokeStyle = '#f0c040'; g.lineWidth = 0.9 * u; for (const a of [-0.5, 0, 0.5]) { g.beginPath(); g.moveTo(0, d * 1.5 * u); g.quadraticCurveTo(Math.sin(a) * 6 * u, d * 4 * u, 0, d * 7 * u); g.stroke(); } } g.restore(); } break;
    case 'mala': if (front) { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ball(g, x + Math.cos(a) * 3 * u, y + 5 * u + Math.sin(a) * 3.5 * u, 0.9 * u, 0.9 * u, '#b88a50'); } } break;
    case 'bell': break;
    case 'jewel': if (front) { g.fillStyle = rgrad(g, x + 1 * u, y - 3 * u, 0, 6 * u, [[0, '#ffffff'], [0.4, 'rgba(255,220,120,.9)'], [1, 'rgba(255,200,80,0)']]); ellipse(g, x + 1 * u, y - 3 * u, 6 * u, 6 * u, g.fillStyle); ball(g, x + 1 * u, y - 3 * u, 2.2 * u, 2.6 * u, '#ffe8a0'); } break;
  }
}
function paintQuad(g, L, f, bx, by) {
  const H = L.h, u = H / 30, k = L.kind; const ph = (f % 4) / 4 * TAU; const sw = Math.sin(ph) * 3 * u;
  const cfg = { dog: [1.2, 0.45, 0.38], tiger: [1.5, 0.5, 0.4], boar: [1.2, 0.3, 0.5], elephant: [1.3, 0.42, 0.6], croc: [2.0, 0.15, 0.28], lion: [1.4, 0.45, 0.45] }[k] || [1.2, 0.4, 0.4];
  const bl = H * cfg[0], legH = H * cfg[1], bh = H * cfg[2]; const col = L.col, c2 = L.col2;
  const bodyY = by - legH - bh * 0.55 + (f < 4 ? -Math.abs(Math.cos(ph)) * u : 0);
  const legW = k === 'elephant' ? 6 * u : k === 'croc' ? 3 * u : 3.2 * u;
  const legs = [[-bl * 0.3, -1], [bl * 0.3, 1]];
  // far legs
  for (const [lx, s] of legs) limb(g, bx + lx - 2 * u, bodyY + bh * 0.2, bx + lx - 2 * u - sw * s, by - 3 * u, legW, shade(col, -0.35));
  // tail
  if (k === 'lion') { curve(g, [bx - bl * 0.48, bodyY - 2 * u, bx - bl * 0.8, bodyY - 8 * u + sw, bx - bl * 0.75, bodyY - 14 * u], col, 2 * u); ball(g, bx - bl * 0.75, bodyY - 15 * u, 4 * u, 3.5 * u, '#4ad0c8'); }
  else if (k === 'croc') { poly(g, [bx - bl * 0.45, bodyY - 2 * u, bx - bl * 1.0, bodyY + 3 * u + sw * 0.5, bx - bl * 0.45, bodyY + 5 * u], shade(col, -0.1)); }
  else if (k !== 'elephant') curve(g, [bx - bl * 0.48, bodyY - 1 * u, bx - bl * 0.7, bodyY - 6 * u + sw, bx - bl * 0.72, bodyY + 4 * u], col, 1.8 * u);
  else line(g, bx - bl * 0.48, bodyY, bx - bl * 0.55, bodyY + 10 * u, col, 1.2 * u);
  // body
  ball(g, bx, bodyY, bl * 0.52, bh * 0.62, col, 0.3, -0.5);
  if (k === 'tiger') { for (let i = 0; i < 7; i++) { const x = bx - bl * 0.35 + i * bl * 0.1; curve(g, [x, bodyY - bh * 0.5, x + 2 * u, bodyY - bh * 0.1, x - 1 * u, bodyY + bh * 0.25], c2, 1.3 * u); } ellipse(g, bx, bodyY + bh * 0.35, bl * 0.35, bh * 0.2, '#f0e8d8'); }
  if (k === 'boar') { for (let i = 0; i < 9; i++) line(g, bx - bl * 0.3 + i * bl * 0.07, bodyY - bh * 0.55, bx - bl * 0.33 + i * bl * 0.07, bodyY - bh * 0.85, shade(col, -0.4), 1 * u); }
  if (k === 'croc') { for (let i = 0; i < 8; i++) poly(g, [bx - bl * 0.4 + i * bl * 0.1, bodyY - bh * 0.5, bx - bl * 0.37 + i * bl * 0.1, bodyY - bh * 0.95, bx - bl * 0.34 + i * bl * 0.1, bodyY - bh * 0.5], shade(col, -0.3)); }
  if (k === 'elephant' && c2) { poly(g, [bx - bl * 0.25, bodyY - bh * 0.6, bx + bl * 0.2, bodyY - bh * 0.6, bx + bl * 0.15, bodyY + bh * 0.1, bx - bl * 0.2, bodyY + bh * 0.1], c2); for (let i = 0; i < 4; i++) ball(g, bx - bl * 0.2 + i * bl * 0.12, bodyY + bh * 0.12, 1.2 * u, 1.2 * u, '#ffe890'); }
  if (L.fire) { g.globalAlpha = 0.8; for (let i = 0; i < 7; i++) { const x = bx - bl * 0.4 + i * bl * 0.13; poly(g, [x - 2 * u, bodyY - bh * 0.4, x, bodyY - bh * 0.4 - (4 + (i + f) % 3 * 2) * u, x + 2 * u, bodyY - bh * 0.4], i % 2 ? '#ffb040' : '#ff5a1a'); } g.globalAlpha = 1; }
  // near legs
  for (const [lx, s] of legs) limb(g, bx + lx + 2 * u, bodyY + bh * 0.25, bx + lx + 2 * u + sw * s, by - 2 * u, legW, col);
  // head
  const hx = bx + bl * 0.5, hy = bodyY - bh * (k === 'croc' ? 0.1 : k === 'boar' ? 0.05 : 0.45);
  switch (k) {
    case 'dog': ball(g, hx, hy, 5 * u, 4.5 * u, col); poly(g, [hx + 2 * u, hy, hx + 10 * u, hy + 2 * u, hx + 3 * u, hy + 4 * u], shade(col, -0.1)); poly(g, [hx - 3 * u, hy - 3 * u, hx - 1 * u, hy - 9 * u, hx + 1 * u, hy - 3 * u], shade(col, -0.2)); ellipse(g, hx + 1 * u, hy - 1 * u, 0.9 * u, 0.9 * u, L.fire ? '#ffe060' : '#1a1010'); if (L.fire) { g.fillStyle = 'rgba(255,90,20,.6)'; ellipse(g, hx + 8 * u, hy + 3 * u, 4 * u, 2 * u, g.fillStyle); } break;
    case 'tiger': case 'lion': ball(g, hx, hy, 6.5 * u, 6 * u, k === 'lion' ? '#f4f8ff' : col); if (k === 'lion') { for (let i = 0; i < 10; i++) { const a = Math.PI * 0.4 + i / 9 * Math.PI * 1.2; ball(g, hx + Math.cos(a) * 6 * u - 1 * u, hy + Math.sin(a) * 6 * u, 2.6 * u, 2.6 * u, i % 2 ? '#4ad0c8' : '#2aa8b8'); } }
      ball(g, hx + 4 * u, hy + 2 * u, 3.6 * u, 3 * u, k === 'lion' ? '#fff' : '#f0e0c8'); ellipse(g, hx + 6.5 * u, hy + 1 * u, 1.2 * u, 1 * u, '#3a1a1a'); ellipse(g, hx + 1.5 * u, hy - 2 * u, 1 * u, 1 * u, k === 'lion' ? '#1a4a6a' : '#e8c020'); ball(g, hx - 3 * u, hy - 5 * u, 1.8 * u, 1.8 * u, col); if (k === 'tiger') { line(g, hx - 2 * u, hy - 4 * u, hx, hy - 1 * u, c2, 0.8 * u); } break;
    case 'boar': ball(g, hx, hy, 7 * u, 6 * u, shade(col, 0.05)); ball(g, hx + 6 * u, hy + 2 * u, 3.5 * u, 3 * u, '#8a6a5a'); curve(g, [hx + 5 * u, hy + 3 * u, hx + 8 * u, hy, hx + 7 * u, hy - 3 * u], c2 || '#f0e8d0', 1.3 * u); ellipse(g, hx + 1 * u, hy - 2 * u, 1 * u, 1 * u, '#ff3a1a'); poly(g, [hx - 4 * u, hy - 4 * u, hx - 3 * u, hy - 9 * u, hx, hy - 5 * u], shade(col, -0.2)); break;
    case 'elephant': ball(g, hx, hy, 9 * u, 9 * u, col); ellipse(g, hx - 5 * u, hy + 1 * u, 7 * u, 9 * u, shade(col, -0.15)); curve(g, [hx + 6 * u, hy + 3 * u, hx + 11 * u, hy + 12 * u, hx + 8 * u, hy + 20 * u], col, 4 * u); curve(g, [hx + 4 * u, hy + 6 * u, hx + 10 * u, hy + 10 * u, hx + 13 * u, hy + 6 * u], '#fffbe8', 1.8 * u); ellipse(g, hx + 3 * u, hy - 2 * u, 1.2 * u, 1.2 * u, '#1a1010'); if (c2) { poly(g, [hx - 4 * u, hy - 9 * u, hx + 5 * u, hy - 9 * u, hx + 4 * u, hy - 5 * u, hx - 3 * u, hy - 5 * u], c2); } break;
    case 'croc': poly(g, [hx - 4 * u, hy - 3 * u, hx + 16 * u, hy + 1 * u, hx + 16 * u, hy + 3 * u, hx - 4 * u, hy + 5 * u], col); ball(g, hx, hy - 2 * u, 3 * u, 2.5 * u, col); ellipse(g, hx, hy - 3 * u, 1 * u, 1 * u, '#e8d020'); for (let i = 0; i < 6; i++) poly(g, [hx + 3 * u + i * 2 * u, hy + 2 * u, hx + 4 * u + i * 2 * u, hy + 3.5 * u, hx + 5 * u + i * 2 * u, hy + 2 * u], '#f0ece0'); break;
  }
}
function paintBird(g, L, f, bx, by) {
  const H = L.h, u = H / 20; const wing = [0.9, 0.2, -0.7, 0.2][f % 4];
  const cy = by - H * 0.9; const col = L.col, c2 = L.col2 || shade(col, 0.3);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(bx + s * 1 * u, cy); g.quadraticCurveTo(bx + s * 8 * u, cy - wing * 10 * u - 4 * u, bx + s * 15 * u, cy - wing * 12 * u); g.quadraticCurveTo(bx + s * 8 * u, cy + 1 * u, bx + s * 1 * u, cy + 3 * u); g.fillStyle = lgrad(g, bx, cy - 10 * u, bx, cy + 3 * u, [[0, s < 0 ? shade(col, -0.3) : col], [1, shade(col, -0.5)]]); g.fill(); }
  poly(g, [bx - 3 * u, cy + 1 * u, bx - 9 * u, cy + 5 * u, bx - 8 * u, cy + 1 * u], shade(col, -0.2));
  ball(g, bx, cy + 1 * u, 5 * u, 3.4 * u, col); ball(g, bx + 5 * u, cy - 2 * u, 2.8 * u, 2.6 * u, c2);
  poly(g, [bx + 7 * u, cy - 2.5 * u, bx + 11 * u, cy - 1 * u, bx + 7 * u, cy - 0.5 * u], L.beak || '#e8b040');
  ellipse(g, bx + 5.8 * u, cy - 2.6 * u, 0.7 * u, 0.7 * u, L.eye || '#1a1010');
  if (L.flame) { g.globalAlpha = 0.7; g.fillStyle = rgrad(g, bx, cy, 0, 14 * u, [[0, 'rgba(255,200,80,.6)'], [1, 'rgba(255,100,20,0)']]); ellipse(g, bx, cy, 14 * u, 10 * u, g.fillStyle); g.globalAlpha = 1; }
}
function paintGhost(g, L, f, bx, by) {
  const H = L.h, u = H / 40; const ph = f / 4 * TAU; const cy = by - H * 0.55;
  g.globalAlpha = 0.9;
  g.beginPath(); g.moveTo(bx - 8 * u, cy - 8 * u); g.quadraticCurveTo(bx - 12 * u, cy + 10 * u, bx - 6 * u + Math.sin(ph) * 3 * u, by - 2 * u); g.quadraticCurveTo(bx - 1 * u, cy + 12 * u, bx + 2 * u + Math.sin(ph + 1) * 4 * u, by + 1 * u); g.quadraticCurveTo(bx + 5 * u, cy + 10 * u, bx + 10 * u, cy - 8 * u); g.closePath();
  g.fillStyle = lgrad(g, 0, cy - 12 * u, 0, by, [[0, L.col], [0.7, rgba(L.col2 || '#333', 0.6)], [1, rgba(L.col2 || '#333', 0)]]); g.fill();
  if (L.flame) { for (let i = 0; i < 6; i++) poly(g, [bx - 8 * u + i * 3 * u, cy - 6 * u, bx - 7 * u + i * 3 * u, cy - 16 * u - ((i + f) % 3) * 3 * u, bx - 5 * u + i * 3 * u, cy - 6 * u], i % 2 ? '#ffd060' : '#ff6a1a'); }
  limb(g, bx - 7 * u, cy - 4 * u, bx - 12 * u, cy + 8 * u + Math.sin(ph) * 2 * u, 2.4 * u, shade(L.col, -0.2));
  limb(g, bx + 8 * u, cy - 4 * u, bx + 13 * u, cy + 6 * u - Math.sin(ph) * 2 * u, 2.4 * u, L.col);
  ball(g, bx + 1 * u, cy - 10 * u, (L.thin ? 5 : 7) * u, (L.thin ? 6 : 7.5) * u, shade(L.col, 0.15));
  g.globalAlpha = 1;
  const ec = L.eye || '#fff'; ellipse(g, bx - 1.5 * u, cy - 10 * u, 1.4 * u, 1.8 * u, ec); ellipse(g, bx + 3.5 * u, cy - 10 * u, 1.4 * u, 1.8 * u, ec);
  ellipse(g, bx + 1 * u, cy - 5.5 * u, 1.6 * u, (L.thin ? 0.6 : 2) * u, '#0a0606');
  if (L.lantern) { line(g, bx + 13 * u, cy + 6 * u, bx + 13 * u, cy + 10 * u, '#3a3a3a', 0.6 * u); g.fillStyle = rgrad(g, bx + 13 * u, cy + 13 * u, 0, 7 * u, [[0, '#fff'], [0.4, rgba(L.lantern, 0.9)], [1, rgba(L.lantern, 0)]]); ellipse(g, bx + 13 * u, cy + 13 * u, 7 * u, 7 * u, g.fillStyle); }
}
function paintWisp(g, L, f, bx, by) {
  const H = L.h, u = H / 18; const cy = by - H * 0.9; const p = 1 + Math.sin(f / 4 * TAU) * 0.08;
  g.fillStyle = rgrad(g, bx, cy, 0, 11 * u * p, [[0, '#ffffff'], [0.35, L.col], [0.7, rgba(L.col2 || L.col, 0.5)], [1, rgba(L.col2 || L.col, 0)]]); ellipse(g, bx, cy, 11 * u * p, 11 * u * p, g.fillStyle);
  if (L.flame) for (let i = 0; i < 4; i++) poly(g, [bx - 4 * u + i * 2.6 * u, cy - 2 * u, bx - 3 * u + i * 2.6 * u, cy - 10 * u - ((i + f) % 3) * 2 * u, bx - 1.5 * u + i * 2.6 * u, cy - 2 * u], rgba(L.col2, 0.8));
  ellipse(g, bx - 2 * u, cy - 0.5 * u, 1 * u, 1.3 * u, L.eye || '#000'); ellipse(g, bx + 2 * u, cy - 0.5 * u, 1 * u, 1.3 * u, L.eye || '#000');
}
function paintSwarm(g, L, f, bx, by) {
  const H = L.h, u = H / 18; const rnd = mulberry(7 + f);
  for (let i = 0; i < 14; i++) { const a = rnd() * TAU, r = rnd() * 9 * u; const x = bx + Math.cos(a) * r * 1.3, y = by - 12 * u + Math.sin(a) * r * 0.9; ellipse(g, x - 1 * u, y - 1 * u, 2.2 * u, 1 * u, 'rgba(230,230,200,.45)', -0.4 + (f % 2) * 0.8); ball(g, x, y, 1.6 * u, 1.1 * u, i % 3 ? L.col : L.col2); }
}
function paintSerpent(g, L, f, bx, by) {
  const H = L.h, u = H / 22; const ph = f / 4 * TAU;
  for (let i = 12; i >= 0; i--) { const t = i / 12; const x = bx - 12 * u + (1 - t) * 22 * u; const y = by - 3 * u - Math.sin(ph + t * 6) * 2.5 * u - (i < 3 ? (3 - i) * 3 * u : 0); ball(g, x, y, (2.2 + (1 - Math.abs(t - 0.4)) * 1.4) * u, (1.9 + (1 - Math.abs(t - 0.4)) * 1.1) * u, i % 2 ? L.col : shade(L.col, -0.15)); }
  const hx = bx + 10 * u, hy = by - 12 * u; ellipse(g, hx - 1 * u, hy + 1 * u, 4.5 * u, 5 * u, shade(L.col2, -0.1)); ball(g, hx + 1 * u, hy, 3.4 * u, 2.6 * u, L.col); ellipse(g, hx + 2 * u, hy - 1 * u, 0.8 * u, 0.8 * u, '#ffe020'); line(g, hx + 4 * u, hy + 0.5 * u, hx + 6.5 * u, hy + 1 * u, '#e02a2a', 0.5 * u);
}
function paintNaga(g, L, f, bx, by) {
  const H = L.h, u = H / 48; const ph = f / 4 * TAU;
  for (let i = 10; i >= 0; i--) { const t = i / 10; const a = t * Math.PI * 1.4 + ph * 0.2; ball(g, bx - 4 * u + Math.cos(a) * 9 * u, by - 4 * u + Math.sin(a) * 3 * u, 4.5 * u, 3.4 * u, i % 2 ? L.col : shade(L.col, -0.15)); }
  // hood
  for (let i = 0; i < 5; i++) { const a = -Math.PI * 0.85 + i / 4 * Math.PI * 0.7; ball(g, bx + Math.cos(a) * 8 * u, by - 40 * u + Math.sin(a) * 6 * u, 3.4 * u, 3.8 * u, L.col); ellipse(g, bx + Math.cos(a) * 8 * u + 1 * u, by - 40 * u + Math.sin(a) * 6 * u, 0.6 * u, 0.6 * u, '#ffe020'); }
  g.fillStyle = lgrad(g, bx - 8 * u, 0, bx + 8 * u, 0, [[0, shade(L.col, 0.2)], [1, shade(L.col, -0.4)]]); g.beginPath(); g.ellipse(bx, by - 36 * u, 10 * u, 9 * u, 0, Math.PI, 0); g.fill();
  const hL = Object.assign({}, L, { h: 36, head: 'crown', garb: 'loin', skin: L.skin, cloth: L.col, cloth2: L.col2 });
  const sub = u * 48 / 50;
  // torso
  limb(g, bx, by - 8 * u, bx, by - 24 * u, 9 * u, L.skin);
  limb(g, bx - 5 * u, by - 22 * u, bx - 10 * u, by - 12 * u, 3 * u, L.skin); ball(g, bx + 5 * u, by - 22 * u, 2 * u, 2 * u, L.skin);
  paintWeapon(g, { weapon: L.weapon }, bx + 8 * u, by - 14 * u, sub, f, false, 'back');
  limb(g, bx + 5 * u, by - 22 * u, bx + 8 * u, by - 14 * u, 3 * u, L.skin);
  paintHead(g, { skin: L.skin, head: 'crown' }, bx + 1 * u, by - 31 * u, 4.6 * u, sub, f);
}
function paintHeadBeast(g, L, f, bx, by) {
  const H = L.h, u = H / 30; const cy = by - H * 0.9 + Math.sin(f / 4 * TAU) * 1.5 * u;
  g.globalAlpha = 0.6; for (let i = 0; i < 5; i++) ball(g, bx - 4 * u + i * 2 * u, cy + 10 * u + i * 1.5 * u, (5 - i * 0.6) * u, (4 - i * 0.5) * u, '#1a1830'); g.globalAlpha = 1;
  ball(g, bx, cy, 11 * u, 10.5 * u, L.col, 0.3, -0.55);
  poly(g, [bx - 10 * u, cy - 5 * u, bx - 8 * u, cy - 15 * u, bx - 3 * u, cy - 9 * u, bx, cy - 17 * u, bx + 3 * u, cy - 9 * u, bx + 8 * u, cy - 15 * u, bx + 10 * u, cy - 5 * u], lgrad(g, 0, cy - 16 * u, 0, cy - 5 * u, [[0, '#fff0a0'], [1, L.col2]]));
  ellipse(g, bx - 4 * u, cy - 1 * u, 2.6 * u, 1.8 * u, L.eye); ellipse(g, bx + 4.5 * u, cy - 1 * u, 2.6 * u, 1.8 * u, L.eye);
  g.beginPath(); g.ellipse(bx + 1 * u, cy + 5 * u, 6 * u, 3.4 * u, 0, 0, Math.PI); g.fillStyle = '#2a0808'; g.fill();
  for (let i = 0; i < 5; i++) poly(g, [bx - 4 * u + i * 2.3 * u, cy + 5 * u, bx - 3 * u + i * 2.3 * u, cy + 8.5 * u, bx - 2 * u + i * 2.3 * u, cy + 5 * u], '#f0ece0');
}
function paintBlob(g, L, f, bx, by) {
  const H = L.h, u = H / 34; const sq = 1 + Math.sin(f / 4 * TAU) * 0.06;
  for (let i = 3; i >= 0; i--) ball(g, bx - 12 * u + i * 7 * u, by - 10 * u - i * 1.5 * u, (10 + i) * u * sq, (9 + i * 0.8) * u / sq, i % 2 ? L.col : shade(L.col, -0.1), 0.3, -0.5);
  ellipse(g, bx + 14 * u, by - 15 * u, 5 * u, 6 * u, '#2a0a06'); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; poly(g, [bx + 14 * u + Math.cos(a) * 5 * u, by - 15 * u + Math.sin(a) * 6 * u, bx + 14 * u + Math.cos(a) * 3 * u, by - 15 * u + Math.sin(a) * 3.5 * u, bx + 14 * u + Math.cos(a + 0.4) * 5 * u, by - 15 * u + Math.sin(a + 0.4) * 6 * u], '#f0e8d0'); }
  for (let i = 0; i < 5; i++) ellipse(g, bx - 10 * u + i * 5 * u, by - 20 * u - (i % 2) * 2 * u, 1.3 * u, 1.3 * u, '#ff4a2a');
}
function paintTree(g, L, f, bx, by) {
  const H = L.h, u = H / 64; const sway = Math.sin(f / 4 * TAU) * 2 * u;
  limb(g, bx, by, bx + sway * 0.3, by - 36 * u, 9 * u, L.col);
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; const ex = bx + Math.cos(a) * 26 * u + sway, ey = by - 34 * u + Math.sin(a) * 26 * u; limb(g, bx + sway * 0.3, by - 32 * u, ex, ey, 3 * u, L.col); for (let k = 0; k < 4; k++) { g.save(); g.translate(ex + rand(-4, 4) * u, ey + rand(-4, 4) * u); g.rotate(a + rand(-1, 1)); g.fillStyle = lgrad(g, 0, -2 * u, 0, 2 * u, [[0, '#f0f0ff'], [1, '#7a7a8a']]); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(5 * u, -2 * u, 10 * u, 0); g.quadraticCurveTo(5 * u, 2 * u, 0, 0); g.fill(); g.restore(); } }
  ellipse(g, bx - 3 * u, by - 22 * u, 1.6 * u, 1.2 * u, '#ff3a1a'); ellipse(g, bx + 3 * u, by - 22 * u, 1.6 * u, 1.2 * u, '#ff3a1a'); ellipse(g, bx, by - 17 * u, 3 * u, 1.3 * u, '#1a0a0a');
  for (let i = 0; i < 4; i++) curve(g, [bx, by - 3 * u, bx + (i - 1.5) * 6 * u, by - 1 * u, bx + (i - 1.5) * 11 * u, by + 1 * u], L.col, 2 * u);
}

/* sprite builder for any look (frames 0..3 walk, 4 attack) */
function buildCreature(key, L, nFrames = 5, scale) {
  if (ART.cre[key]) return ART.cre[key];
  const H = L.h; const W = Math.ceil(H * (L.body === 'quad' ? 2.4 : L.body === 'bird' ? 2 : 1.9) + 28), Hc = Math.ceil(H * (L.body === 'naga' ? 1.2 : 1.45) + 30);
  const frames = [], mframes = [];
  for (let f = 0; f < nFrames; f++) {
    const sp = newSpr(W, Hc, W / 2, Hc - 10, scale); const g = sp.g; const bx = W / 2, by = Hc - 10;
    switch (L.body) {
      case 'human': paintHumanoid(g, L, f, bx, by); break;
      case 'quad': paintQuad(g, L, f, bx, by); break;
      case 'bird': paintBird(g, L, f, bx, by); break;
      case 'ghost': paintGhost(g, L, f, bx, by); break;
      case 'wisp': paintWisp(g, L, f, bx, by); break;
      case 'swarm': paintSwarm(g, L, f, bx, by); break;
      case 'serpent': paintSerpent(g, L, f, bx, by); break;
      case 'naga': paintNaga(g, L, f, bx, by); break;
      case 'head': paintHeadBeast(g, L, f, bx, by); break;
      case 'blob': paintBlob(g, L, f, bx, by); break;
      case 'tree': paintTree(g, L, f, bx, by); break;
    }
    const glowy = L.body === 'wisp' || L.body === 'ghost' || L.body === 'swarm';
    finishSpr(sp, { outline: glowy ? 0 : 1, grit: glowy ? 0 : 0.14, dark: glowy ? 0.15 : 0.36, shade: glowy ? 0 : 1 });
    frames.push(sp); mframes.push(mirrorSpr(sp));
  }
  const o = { frames, mframes, H };
  ART.cre[key] = o; return o;
}

/* heroes */
const HERO_LOOK = {
  vajra: { body: 'human', h: 46, skin: '#c68a5a', cloth: '#d9822b', cloth2: '#a8481a', head: 'bald', weapon: 'vajra', bareArm: 1, beads: '#6a3a1a', bulky: 1, feet: '#6a4424' },
  sage: { body: 'human', h: 46, skin: '#d8a27a', cloth: '#7a1f2b', cloth2: '#d8a53a', head: 'bun', weapon: 'flamesword', feet: '#3a1a12' },
  archer: { body: 'human', h: 46, skin: '#d6a07a', cloth: '#23262c', cloth2: '#e8e2d2', head: 'kasa', weapon: 'yumi', noSash: 0, feet: '#e8e0d0' },
  chod: { body: 'human', h: 46, skin: '#c8906a', cloth: '#e8e2d2', cloth2: '#8a1a1a', head: 'yogini', weapon: 'khatvanga', beads: '#f0e6d0', feet: '#3a2a1a', bareArm: 1 }
};
const NPC_LOOK = {
  guide: r => ({ body: 'human', h: 46, skin: '#e0b088', cloth: ['#e8e0d0', '#c8a060', '#a84a2a', '#4a7a3a', '#6a6a8a', '#3a2a2a'][r], cloth2: '#d8a040', head: 'bald', weapon: 'khakkhara', halo: '#ffe8a0' }),
  merchant: r => [{ body: 'human', h: 44, skin: '#d8a070', cloth: '#6a9ae0', cloth2: '#f0d060', head: 'crown', weapon: 'lute' }, { body: 'human', h: 42, skin: '#a8744a', cloth: '#8a6a3a', cloth2: '#e8e0c8', head: 'turban', weapon: 'none', belly: 1 }, { body: 'human', h: 48, skin: '#c8402a', cloth: '#3a2a1a', cloth2: '#d8a030', head: 'helm', arms: 4, weapon: 'none' }, { body: 'human', h: 42, skin: '#6a6a6a', cloth: '#8a3a1a', cloth2: '#e8c040', head: 'ape', ape: 1, weapon: 'none', bulky: 1 }, { body: 'ghost', h: 46, col: '#b8c8b0', col2: '#4a5a4a', eye: '#fff4a0' }, { body: 'human', h: 50, skin: '#4a3024', cloth: '#2a2a2a', cloth2: '#6a6a6a', head: 'ox', weapon: 'none' }][r],
  smith: r => [{ body: 'human', h: 46, skin: '#e0b080', cloth: '#6a5a4a', cloth2: '#e8c050', head: 'bald', weapon: 'club', garb: 'loin', bulky: 1 }, { body: 'human', h: 46, skin: '#8a5a3a', cloth: '#4a3a2a', cloth2: '#8a2a1a', head: 'turban', weapon: 'club', garb: 'loin', bulky: 1 }, { body: 'human', h: 50, skin: '#a8341e', cloth: '#1a1410', cloth2: '#ff8a2a', head: 'bald', arms: 4, weapon: 'club', garb: 'loin', bulky: 1 }, { body: 'quad', kind: 'elephant', h: 40, col: '#8a8a8a', col2: '#c83a2a' }, { body: 'human', h: 46, skin: '#8a8a70', cloth: '#5a5040', cloth2: '#c8a040', head: 'hair', belly: 1, thin: 1, weapon: 'club' }, { body: 'human', h: 50, skin: '#3a2a22', cloth: '#1a1414', cloth2: '#6a6a72', head: 'horse', weapon: 'club' }][r],
  gambler: r => [{ body: 'human', h: 44, skin: '#f0c8a0', cloth: '#fff8e8', cloth2: '#e0b040', head: 'crown', halo: '#ffe8a0', weapon: 'none' }, { body: 'human', h: 42, skin: '#a8744a', cloth: '#3a2a4a', cloth2: '#c8a040', head: 'hood', weapon: 'none' }, { body: 'human', h: 46, skin: '#b8342a', cloth: '#2a1a3a', cloth2: '#c8a040', head: 'crown', arms: 4, weapon: 'none' }, { body: 'quad', kind: 'dog', h: 24, col: '#c8a060', col2: '#6a4a2a' }, { body: 'human', h: 44, skin: '#9a9a80', cloth: '#4a4030', cloth2: '#8a8060', head: 'hood', weapon: 'none' }, { body: 'human', h: 44, skin: '#6a3a2a', cloth: '#1a1414', cloth2: '#c83a1a', head: 'hood', weapon: 'none' }][r]
};
const MINION_LOOK = {
  m_lion: { body: 'quad', kind: 'lion', h: 26, col: '#f4f8ff', col2: '#4ad0c8' },
  m_garuda: { body: 'bird', h: 30, col: '#e8802a', col2: '#ffd060', beak: '#ffe890', flame: 1 },
  m_naga: { body: 'naga', h: 44, skin: '#4a9a7a', col: '#2a8a6a', col2: '#e8d060', weapon: 'trident' },
  m_citipati: { body: 'human', h: 54, skin: '#efe6d0', cloth: '#8a1a1a', cloth2: '#e8c040', head: 'skull', thin: 1, garb: 'loin', weapon: 'staff', flamehalo: 1, eye: '#ff6a2a', scarf: '#e8c040' },
  m_dakini: { body: 'human', h: 44, skin: '#c8402a', cloth: '#1a1414', cloth2: '#e8c040', head: 'skullcrown', garb: 'loin', weapon: 'sword', flamehalo: 1, scarf: '#f0e6d0', beads: '#f0e6d0', eye: '#fff4c0' },
  m_mahakala: { body: 'human', h: 84, skin: '#1e2a6a', cloth: '#1a1414', cloth2: '#e8a030', head: 'skullcrown', arms: 6, weapon: 'club', garb: 'loin', bulky: 1, fangs: 1, flamehalo: 1, eye: '#ffe060' }
};
function buildSentry() {
  const out = []; for (let f = 0; f < 4; f++) { const sp = newSpr(32, 56, 16, 50); const g = sp.g; ellipse(g, 16, 50, 10, 4, 'rgba(0,0,0,.4)'); line(g, 16, 50, 16, 28, '#5a3a1a', 3); const x0 = 8, x1 = 24; g.fillStyle = lgrad(g, x0, 0, x1, 0, [[0, '#ffe890'], [0.5, '#d8a030'], [1, '#6a4a10']]); g.fillRect(x0, 8, 16, 20); ellipse(g, 16, 8, 8, 2.4, '#ffe890'); ellipse(g, 16, 28, 8, 2.4, '#8a6a20'); for (let i = 0; i < 3; i++) { const x = x0 + ((i * 5 + f * 1.3) % 16); line(g, x, 11, x, 25, '#8a1a1a', 1); } out.push(finishSpr(sp, { grit: 0.1 })); } return out;
}

/* bosses: custom compositions, 2 frames */
function buildBoss(id) {
  const key = 'boss_' + id; if (ART.cre[key]) return ART.cre[key];
  const frames = [], mframes = [];
  for (let f = 0; f < 4; f++) {
    let sp;
    const bob = Math.sin(f / 4 * TAU) * 2;
    switch (id) {
      case 'mahabrahma': { sp = newSpr(200, 210, 100, 195); const g = sp.g; const bx = 100, by = 195;
        for (let i = 0; i < 14; i++) { const a = Math.PI + i / 13 * Math.PI; g.save(); g.translate(bx + Math.cos(a) * 50, by - 18 + Math.sin(a) * 10); g.rotate(a + Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(12, -14, 0, -32); g.quadraticCurveTo(-12, -14, 0, 0); g.fillStyle = lgrad(g, 0, -30, 0, 0, [[0, '#fff0f6'], [1, '#e87aa8']]); g.fill(); g.restore(); }
        ellipse(g, bx, by - 14, 62, 16, '#c85a88');
        const L = { h: 130, skin: '#f0c060', cloth: '#fff8ee', cloth2: '#e8a030', head: 'crown', arms: 4, weapon: 'staff', halo: '#fff0b0', beads: '#e8e0d0' };
        paintHumanoid(g, L, 5, bx, by - 20 + bob);
        const hy = by - 20 - 130 * 0.88 + bob; ball(g, bx - 18, hy + 4, 9, 10, shade('#f0c060', -0.1)); ball(g, bx + 18, hy + 4, 9, 10, shade('#f0c060', -0.25));
        for (const s of [-1, 1]) { poly(g, [bx + s * 18 - 8, hy - 3, bx + s * 18 - 6, hy - 12, bx + s * 18, hy - 6, bx + s * 18 + 6, hy - 12, bx + s * 18 + 8, hy - 3], '#ffe890'); ellipse(g, bx + s * 18 + s * 3, hy + 3, 1.3, 1.5, '#1a1010'); }
        ball(g, bx + 44, by - 118 + bob, 7, 8, '#ffb0d0'); ball(g, bx - 44, by - 96 + bob, 6, 8, '#c8e8ff');
        break; }
      case 'angulimala': { sp = newSpr(150, 150, 75, 138); const g = sp.g; const L = { h: 96, skin: '#6a4028', cloth: '#5a1a12', cloth2: '#3a2a1a', head: 'hair', weapon: 'sword', garb: 'loin', bulky: 1, garland: 1, eye: '#ff4a1a' }; paintHumanoid(g, L, f % 4, 75, 138); break; }
      case 'rahu': { sp = newSpr(240, 230, 120, 215); const g = sp.g; const bx = 120, cy = 96 + bob;
        // smoky serpent tail where a body should be
        for (let i = 0; i < 14; i++) { const t2 = i / 13; g.globalAlpha = 0.85 - t2 * 0.5; ball(g, bx - 10 + Math.sin(t2 * 5 + f) * 18, cy + 58 + t2 * 70, 34 - t2 * 24, 22 - t2 * 14, mix('#1c1a36', '#07060e', t2), 0.2, -0.4); } g.globalAlpha = 1;
        drawWrathFace(g, bx, cy, 62, { skin: '#232c52', skinHi: '#4a5a9a', hair: 1, crown: 1, eyes: '#ffd040', mouthOpen: 1.2 });
        // clawed hands clutching the stolen moon
        const mx = bx + 4, my = cy + 70; g.fillStyle = rgrad(g, mx, my, 4, 34, [[0, '#ffffff'], [0.5, '#dfe4ff'], [1, 'rgba(180,190,255,0)']]); g.beginPath(); g.arc(mx, my, 34, 0, TAU); g.fill(); ball(g, mx, my, 20, 20, '#eef0ff', 0.2, -0.25); ball(g, mx - 6, my - 4, 5, 4, '#c8ccde', 0.1, -0.2);
        for (const sd of [-1, 1]) { const hx = mx + sd * 24, hy = my - 2; limb(g, bx + sd * 50, cy + 30, hx + sd * 6, hy, 14, '#232c52'); ball(g, hx, hy, 11, 13, '#2c3664'); for (let k = 0; k < 4; k++) { const fy = hy - 10 + k * 6; limb(g, hx, fy, hx - sd * 14, fy + 2, 4.5, '#2c3664'); poly(g, [hx - sd * 14, fy - 1, hx - sd * 19, fy + 2, hx - sd * 14, fy + 4], '#f0e2c4'); } }
        break; }
      case 'rooster': { const L = { body: 'bird', h: 60, col: '#c8301a', col2: '#ff8a3a', beak: '#ffd060', eye: '#ffe060', flame: 1 }; sp = newSpr(120, 110, 60, 100); paintBird(sp.g, L, f, 60, 100); ball(sp.g, 83, 38, 5, 7, '#ff2a1a'); break; }
      case 'snake': { const L = { h: 70, col: '#2a8a3a', col2: '#c8e040' }; sp = newSpr(140, 110, 70, 100); paintSerpent(sp.g, L, f, 70, 100); break; }
      case 'pig': { const L = { kind: 'boar', h: 58, col: '#1e1a1e', col2: '#e8e0c8' }; sp = newSpr(160, 110, 80, 100); paintQuad(sp.g, L, f, 80, 100); break; }
      case 'ulkamukha': { sp = newSpr(220, 250, 110, 238); const g = sp.g; const bx = 110, by = 238; const sk = '#6e6a58', skd = '#3a3a2e'; const sw = Math.sin(f / 4 * TAU) * 3;
        // stick legs
        for (const sd of [-1, 1]) { limb(g, bx + sd * 22, by - 70, bx + sd * 30 + sw * sd, by - 34, 7, sk); limb(g, bx + sd * 30 + sw * sd, by - 34, bx + sd * 26, by - 4, 6, sk); ellipse(g, bx + sd * 30, by - 3, 11, 4, skd); ball(g, bx + sd * 30 + sw * sd, by - 34, 5, 5, sk); }
        // mountainous belly
        g.fillStyle = rgrad(g, bx - 18, by - 118, 10, 70, [[0, '#a8a28a'], [0.6, sk], [1, '#2e2c22']]); g.beginPath(); g.ellipse(bx, by - 100, 58, 52, 0, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(40,70,40,.5)'; g.lineWidth = 1.4; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(bx - 40 + i * 14, by - 136 + (i % 2) * 8); g.quadraticCurveTo(bx - 36 + i * 15, by - 108, bx - 44 + i * 16, by - 70); g.stroke(); }
        ellipse(g, bx + 4, by - 92, 3, 4, '#2a2820');
        // ribs and chest
        g.fillStyle = lgrad(g, bx - 30, 0, bx + 30, 0, [[0, '#8a8670'], [1, '#3a382c']]); g.beginPath(); g.moveTo(bx - 34, by - 140); g.quadraticCurveTo(bx, by - 175, bx + 34, by - 140); g.lineTo(bx + 20, by - 128); g.lineTo(bx - 20, by - 128); g.closePath(); g.fill();
        for (let i = 0; i < 4; i++) { g.strokeStyle = '#2a2820'; g.lineWidth = 1.5; g.beginPath(); g.arc(bx, by - 128 + i * 2, 22 - i * 3, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
        // long arms with claws
        for (const sd of [-1, 1]) { limb(g, bx + sd * 32, by - 150, bx + sd * 62, by - 110 - sw, 7, sk); limb(g, bx + sd * 62, by - 110 - sw, bx + sd * 70, by - 62, 6, sk); for (let k = 0; k < 4; k++) line(g, bx + sd * 70, by - 62, bx + sd * (66 + k * 4), by - 48 + (k % 2) * 3, '#e0d8c0', 1.6); }
        // needle-thin neck and a small head
        limb(g, bx, by - 160, bx + 4, by - 196, 5, sk);
        ball(g, bx + 4, by - 208, 17, 18, sk, 0.3, -0.5);
        for (let i = 0; i < 10; i++) curve(g, [bx + 4 + (i - 5) * 3, by - 222, bx + (i - 5) * 7, by - 214, bx + (i - 5) * 9, by - 188 + (i % 3) * 5], '#1a1814', 1.4);
        ellipse(g, bx - 3, by - 212, 3, 2.4, '#ffd040'); ellipse(g, bx + 10, by - 212, 3, 2.4, '#ffd040');
        // the flaming mouth
        g.beginPath(); g.ellipse(bx + 4, by - 199, 11, 8, 0, 0, TAU); g.fillStyle = '#2a0402'; g.fill();
        for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.24; const len = 26 + ((i + f) % 3) * 8; poly(g, [bx + 4 + Math.cos(a) * 6 - 3, by - 204, bx + 4 + Math.cos(a) * len, by - 204 + Math.sin(a) * len * 0.9, bx + 4 + Math.cos(a) * 6 + 3, by - 204], i % 2 ? '#ffcf4a' : '#ff5a12'); }
        ellipse(g, bx + 4, by - 199, 6, 4, '#fff4c0');
        break; }
      case 'mara': { sp = newSpr(240, 260, 120, 245); const g = sp.g; const bx = 120, by = 245;
        for (let i = 0; i < 16; i++) { const a = Math.PI + i / 15 * Math.PI; poly(g, [bx + Math.cos(a) * 30, by - 175 + Math.sin(a) * 20, bx + Math.cos(a) * (70 + (i % 3) * 12 + bob), by - 175 + Math.sin(a) * (55 + (i % 2) * 10), bx + Math.cos(a + 0.12) * 30, by - 175 + Math.sin(a + 0.12) * 20], i % 2 ? '#6a0a3a' : '#2a0418'); }
        const L = { h: 200, skin: '#3a1a4a', cloth: '#12060e', cloth2: '#c8902a', head: 'crown', arms: 4, weapon: 'sword', armor: '#2a1a2a', eye: '#ff3a8a', fangs: 1, flamehalo: 0 };
        paintHumanoid(g, L, f, bx, by);
        for (let i = 0; i < 9; i++) { const x = bx - 24 + (i % 3) * 24, y = by - 150 + Math.floor(i / 3) * 26; ellipse(g, x, y, 5, 2.6, '#ffd0e8'); ellipse(g, x, y, 1.8, 1.8, '#6a0a3a'); }
        break; }
      case 'daughter': { sp = newSpr(100, 110, 50, 100); const L = { body: 'human', h: 70, skin: '#e8a0b8', cloth: '#6a0a3a', cloth2: '#ffd060', head: 'crown', scarf: '#ff6ab0', weapon: 'none', fem: 1, eye: '#ff3a8a' }; paintHumanoid(sp.g, L, f, 50, 100); break; }
    }
    finishSpr(sp, { grit: 0.12, dark: 0.35 });
    frames.push(sp); mframes.push(mirrorSpr(sp));
  }
  const o = { frames, mframes, H: frames[0].h }; ART.cre[key] = o; return o;
}


function drawWrathFace(g, hx, hy, hr, o = {}) {
  const skin = o.skin || '#1b2346', skinHi = o.skinHi || '#3a4a8a';
  if (o.hair) for (let i = 0; i < 13; i++) { const a = -Math.PI * 0.95 + i / 12 * Math.PI * 0.9; const bx = hx + Math.cos(a) * hr * 0.9, by = hy - hr * 0.2 + Math.sin(a) * hr * 0.9; g.beginPath(); g.moveTo(bx - hr * 0.12, by); g.quadraticCurveTo(bx + Math.cos(a) * hr * 0.5, by + Math.sin(a) * hr * 0.7 - hr * 0.2, bx + Math.cos(a) * hr * 0.35 + (i % 2 ? hr * 0.1 : -hr * 0.1), by + Math.sin(a) * hr * 0.9 - hr * 0.35); g.lineTo(bx + hr * 0.12, by); g.closePath(); g.fillStyle = lgrad(g, 0, by - hr, 0, by, [[0, '#ffd060'], [0.5, '#ff6a1a'], [1, '#8a1a06']]); g.fill(); }
  g.fillStyle = rgrad(g, hx - hr * 0.3, hy - hr * 0.3, hr * 0.1, hr * 1.2, [[0, skinHi], [0.6, skin], [1, '#070a18']]); g.beginPath(); g.ellipse(hx, hy, hr * 1.05, hr * 1.1, 0, 0, TAU); g.fill();
  for (const s of [-1, 1]) { g.fillStyle = skin; g.beginPath(); g.ellipse(hx + s * hr * 1.05, hy + hr * 0.05, hr * 0.18, hr * 0.32, 0, 0, TAU); g.fill(); g.strokeStyle = '#e8b040'; g.lineWidth = hr * 0.06; g.beginPath(); g.arc(hx + s * hr * 1.08, hy + hr * 0.45, hr * 0.13, 0, TAU); g.stroke(); }
  if (o.crown) { poly(g, [hx - hr * 0.95, hy - hr * 0.35, hx - hr * 0.8, hy - hr * 1.15, hx - hr * 0.45, hy - hr * 0.8, hx - hr * 0.2, hy - hr * 1.35, hx, hy - hr * 0.85, hx + hr * 0.2, hy - hr * 1.35, hx + hr * 0.45, hy - hr * 0.8, hx + hr * 0.8, hy - hr * 1.15, hx + hr * 0.95, hy - hr * 0.35], lgrad(g, 0, hy - hr * 1.35, 0, hy - hr * 0.35, [[0, '#fff0a0'], [1, '#8a5a10']])); for (let i = 0; i < 5; i++) ball(g, hx - hr * 0.64 + i * hr * 0.32, hy - hr * 0.58, hr * 0.07, hr * 0.07, ['#ff3a3a', '#3a7aff', '#ffe060', '#3aff7a', '#ff7aff'][i]); }
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(hx + s * hr * 0.1, hy - hr * 0.3); g.quadraticCurveTo(hx + s * hr * 0.45, hy - hr * 0.62, hx + s * hr * 0.85, hy - hr * 0.42); g.quadraticCurveTo(hx + s * hr * 0.5, hy - hr * 0.42, hx + s * hr * 0.12, hy - hr * 0.2); g.closePath(); g.fillStyle = '#ff7a2a'; g.fill(); }
  for (const s of [-1, 1]) { const ex = hx + s * hr * 0.42, ey = hy - hr * 0.1; g.fillStyle = '#fff4e0'; g.beginPath(); g.ellipse(ex, ey, hr * 0.2, hr * 0.16, 0, 0, TAU); g.fill(); g.fillStyle = rgrad(g, ex, ey, 1, hr * 0.12, [[0, o.eyes || '#ffd040'], [1, '#c81a0a']]); g.beginPath(); g.arc(ex + s * hr * 0.02, ey + hr * 0.01, hr * 0.11, 0, TAU); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(ex + s * hr * 0.02, ey + hr * 0.01, hr * 0.045, 0, TAU); g.fill(); }
  g.fillStyle = '#fff4e0'; g.beginPath(); g.ellipse(hx, hy - hr * 0.48, hr * 0.06, hr * 0.12, 0, 0, TAU); g.fill(); g.fillStyle = '#c81a0a'; g.beginPath(); g.ellipse(hx, hy - hr * 0.48, hr * 0.035, hr * 0.08, 0, 0, TAU); g.fill();
  g.fillStyle = '#0e1330'; g.beginPath(); g.ellipse(hx, hy + hr * 0.18, hr * 0.2, hr * 0.12, 0, 0, TAU); g.fill();
  const mo = o.mouthOpen || 1; const my = hy + hr * 0.52; g.fillStyle = '#3a0606'; g.beginPath(); g.moveTo(hx - hr * 0.62, my - hr * 0.08); g.quadraticCurveTo(hx, my - hr * 0.28, hx + hr * 0.62, my - hr * 0.08); g.quadraticCurveTo(hx + hr * 0.5, my + hr * 0.42 * mo, hx, my + hr * 0.46 * mo); g.quadraticCurveTo(hx - hr * 0.5, my + hr * 0.42 * mo, hx - hr * 0.62, my - hr * 0.08); g.fill();
  for (let i = 0; i < 7; i++) { const x = hx - hr * 0.48 + i * hr * 0.16; const big = i === 0 || i === 6; poly(g, [x - hr * 0.05, my - hr * 0.12, x, my + (big ? hr * 0.36 : hr * 0.1), x + hr * 0.05, my - hr * 0.12], '#f4ecd8'); }
  for (let i = 0; i < 6; i++) { const x = hx - hr * 0.4 + i * hr * 0.16; poly(g, [x - hr * 0.05, my + hr * 0.42 * mo, x, my + hr * 0.24 * mo, x + hr * 0.05, my + hr * 0.42 * mo], '#e8dcc0'); }
}

/* portrait for dialogue and character list */
function portraitCanvas(look, w = 90, h = 110) {
  const c = mkCanvas(w * 2, h * 2); const g = c.getContext('2d'); g.scale(2, 2);
  g.fillStyle = rgrad(g, w / 2, h * 0.45, 4, h * 0.7, [[0, '#3a2c20'], [1, '#0c0806']]); g.fillRect(0, 0, w, h);
  const L = Object.assign({}, look); const bust = L.body === 'human'; const s = L.body === 'quad' ? 1.3 : bust ? 3.6 : 1.9; L.h = (look.h || 46) * s;
  g.save(); g.beginPath(); g.rect(0, 0, w, h); g.clip();
  const by = L.body === 'quad' ? h - 8 : bust ? h * 0.28 + L.h * 0.88 : h + L.h * 0.35;
  switch (L.body) { case 'quad': paintQuad(g, L, 0, w / 2 - 8, by); break; case 'ghost': L.h = look.h * 1.6; paintGhost(g, L, 0, w / 2, h - 6); break; case 'bird': paintBird(g, L, 0, w / 2, h); break; default: paintHumanoid(g, L, 5, w / 2, by); }
  g.restore(); g.strokeStyle = '#5c4a34'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
  return c;
}
