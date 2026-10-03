/* ================= boot & main loop ================= */
function buildArt() {
  buildGrit(); buildFx(); buildObjects(); ART.sentry = buildSentry();
  // vajra projectile sprite
  const sp = newSpr(24, 24, 12, 12); const g = sp.g; g.translate(12, 12); g.scale(0.34, 0.34); g.translate(-32, -32); drawSymbol(g, 'vajra', '#f0c040'); ART.fx.vajra = sp;
}
function loop() {
  let last = performance.now();
  const frame = (now) => {
    let dt = Math.min(0.05, (now - last) / 1000); last = now;
    try {
      if (G.state === 'title') titleLoop(dt);
      else if (G.state === 'create') createLoop(dt);
      else if (G.state === 'cine') CINE.update(dt);
      else if (G.A && G.P) { if (G.state === 'play') update(dt); render(G.state === 'play' ? dt : 0); UI.hud(); if (G.state === 'play') perfWatch(now); }
    } catch (err) { console.error(err); if (!G._errShown) { G._errShown = 1; toast('Something went wrong', String(err.message || err).slice(0, 80), 6); } }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
const PERF = { t0: 0, n: 0, checks: 0 };
function perfWatch(now) {
  if (OPT.quality === 'low' || PERF.done) return; if (!PERF.t0 || now - PERF.last > 250) { PERF.t0 = now; PERF.n = 0; PERF.last = now; return; } PERF.last = now; PERF.n++;
  if (now - PERF.t0 > 6000) { const fps = PERF.n / ((now - PERF.t0) / 1000); PERF.t0 = now; PERF.n = 0; PERF.checks++;
    if (fps < 34) { PERF.slow = (PERF.slow || 0) + 1; if (PERF.slow >= 2) { PERF.done = 1; OPT.quality = 'low'; saveOpt(); resizeCanvas(); if (G.A) G.A.chunks.clear(); toast('Switched to fast graphics', 'You can change this in Options', 3); } } else PERF.slow = 0;
    if (PERF.checks > 20) PERF.done = 1; }
}
function boot() {
  RENDER.cv = $('cv'); RENDER.ctx = RENDER.cv.getContext('2d', { alpha: false });
  AU.vol.music = OPT.music; AU.vol.sfx = OPT.sfx;
  resizeCanvas(); let rzT = 0, lastDim = innerWidth + 'x' + innerHeight; const onRz = () => { clearTimeout(rzT); rzT = setTimeout(() => { const d = innerWidth + 'x' + innerHeight; if (d === lastDim) return; lastDim = d; resizeCanvas(); if (G.state === 'cine') CINE.resize(); if (G.A) G.A.chunks.clear(); }, 120); }; window.addEventListener('resize', onRz); window.addEventListener('orientationchange', onRz);
  buildArt(); setupInput();
  const wake = () => AU.init(); window.addEventListener('pointerdown', wake, { passive: true }); window.addEventListener('keydown', wake);
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'play') UI.open('menu'); if (G.C && document.hidden) saveChar(G.C); });
  window.addEventListener('pagehide', () => { if (G.C) saveChar(G.C); });
  showTitle(); loop();
  // expose for automated play-testing
  window.__WOS = { G, UI, OPT, startGame, newChar, loadArea, charStats, SKILLS, REALMS, learnSkill, genItem, gainXP, saveChar, spawnBoss };
}
function start(data) {
  boot();
  try { window.claude?.hot?.snapshot?.(() => { if (G.C) saveChar(G.C); return { cid: G.C && G.state !== 'title' && G.state !== 'create' && G.state !== 'cine' ? G.C.id : null }; }); } catch (e) { }
  if (data && data.cid) { const C = loadChar(data.cid); if (C) { C.realmSeen[C.realm || 0] = 1; startGame(C); } }
}
function launch() { const hot = window.claude && window.claude.hot; if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {}); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', launch); else launch();
