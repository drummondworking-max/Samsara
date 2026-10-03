'use strict';
/* ================= util ================= */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const chance = p => Math.random() < p;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const $ = id => document.getElementById(id);
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
const hyp = (x, y) => Math.sqrt(x * x + y * y);
function wpick(list, w) { let t = 0; for (const it of list) t += w(it); let r = Math.random() * t; for (const it of list) { r -= w(it); if (r <= 0) return it; } return list[list.length - 1]; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function mulberry(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function fmt(n) { n = Math.round(n); if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'; if (n >= 1e4) return Math.round(n / 1e3) + 'k'; return String(n); }
function fmtFull(n) { return Math.round(n).toLocaleString('en-US'); }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

/* colour helpers */
function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbHex(r, g, b) { return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function shade(h, amt) { const [r, g, b] = hexRgb(h); if (amt >= 0) return rgbHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt); return rgbHex(r * (1 + amt), g * (1 + amt), b * (1 + amt)); }
function mix(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
function rgba(h, a) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; }

/* value noise (seeded) */
function makeNoise(seed) {
  const rnd = mulberry(seed); const P = new Uint8Array(512); const V = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; V[i] = rnd(); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = P[i]; P[i] = P[j]; P[j] = t; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  const sm = t => t * t * (3 - 2 * t);
  function n2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y); const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const a = V[P[P[X] + Y]], b = V[P[P[X + 1] + Y]], c = V[P[P[X] + Y + 1]], d = V[P[P[X + 1] + Y + 1]];
    const u = sm(xf), v = sm(yf);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }
  n2.fbm = (x, y, o = 4) => { let s = 0, a = 0.5, f = 1, t = 0; for (let i = 0; i < o; i++) { s += n2(x * f, y * f) * a; t += a; a *= 0.5; f *= 2.03; } return s / t; };
  // tileable version with period p
  n2.tile = (x, y, p) => {
    const xi = Math.floor(x), yi = Math.floor(y); const xf = x - xi, yf = y - yi;
    const m = k => ((k % p) + p) % p;
    const g = (i, j) => V[P[P[m(i) & 255] + (m(j) & 255)]];
    const u = sm(xf), v = sm(yf);
    return lerp(lerp(g(xi, yi), g(xi + 1, yi), u), lerp(g(xi, yi + 1), g(xi + 1, yi + 1), u), v);
  };
  n2.tfbm = (x, y, p, o = 4) => { let s = 0, a = 0.5, f = 1, t = 0; for (let i = 0; i < o; i++) { s += n2.tile(x * f, y * f, p * f) * a; t += a; a *= 0.5; f *= 2; } return s / t; };
  return n2;
}
const NOISE = makeNoise(1337);

function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }

/* storage (always guarded) */
const Store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { } }
};

/* iso projection: world tiles -> screen pixels (zoom 1) */
const TW = 64, TH = 32, HTW = 32, HTH = 16;
const isoX = (x, y) => (x - y) * HTW;
const isoY = (x, y) => (x + y) * HTH;
function screenToWorldVec(sx, sy) { const x = (sx / HTW + sy / HTH) / 2, y = (sy / HTH - sx / HTW) / 2; return [x, y]; }
