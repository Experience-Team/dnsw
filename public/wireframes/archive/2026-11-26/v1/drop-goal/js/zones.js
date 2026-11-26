// Landing-zone sizing for equal exposure, plus Blue Mountains terrain. See README > Neutrality.

/* ---------- Zone sizing: each stop's landing zone is sized so it catches roughly 1 in 10 kicks ---------- */
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
function buildMountains(Rt) {
  const m = Rt.mountains; if (!m) { Rt.solid = null; Rt.mtn = null; return; }
  const { f0, p0, p1, e1, height } = m;
  Rt.mtn = { f0, p0, p1, e1, foot: f0 - 25 };
  Rt.solid = x => x < f0 || x > e1 ? 0 : smooth((x - f0) / (p0 - f0)) * (1 - smooth((x - p1) / (e1 - p1))) * (height + 2.5 * Math.sin(x / 6.5) + 1.5 * Math.sin(x / 2.3));
}
function restOn(Rt, x) {          // where a ball that touched down at x comes to rest
  const m = Rt.mtn; if (!m || x < m.f0 || x > m.e1) return x;
  if (x < m.p0) return lerp(m.f0 - 1, m.foot + 1, (x - m.f0) / (m.p0 - m.f0));          // front face: bounces back into the foothills
  if (x > m.p1) { const after = Rt.bounds[Rt.mountains.plateauZones[1] + 2];               // rolls down the far side, into the next stop
                  return m.e1 + 1 + ((x - m.p1) / (m.e1 - m.p1)) * 0.7 * (after - m.e1 - 2); }
  return x;
}
function landFast(Rt, ang, pow, w) {
  const v = speedFromPower(pow), th = ang * Math.PI / 180, vx = v * Math.cos(th), vy = v * Math.sin(th), y0 = 0.32;
  const T = (vy + Math.sqrt(vy * vy + 2 * G * y0)) / G;
  if (Rt.solid) { const m = Rt.mtn;
    for (let t = 0.02; t <= T; t += 0.02) { const x = vx * t + 0.5 * w * t * t; if (x < m.f0 || x > m.e1) continue;
      const y = y0 + vy * t - 0.5 * G * t * t; if (y <= Rt.solid(x)) return restOn(Rt, x); } }
  return vx * T + 0.5 * w * T * T;
}
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const PLAYER_MODEL = { angle: [20, 70], power: [3, 100] };   // how we assume people play
function sampleRests(Rt, n, seed) {
  const r = rng(seed), xs = [];
  for (let i = 0; i < n; i++) {
    const a = lerp(PLAYER_MODEL.angle[0], PLAYER_MODEL.angle[1], r()), p = lerp(PLAYER_MODEL.power[0], PLAYER_MODEL.power[1], r());
    const w = Math.round((r() * 2 - 1) * WIND_MAX * 10) / 10;
    xs.push(landFast(Rt, a, p, w));
  }
  return xs;
}
function computeBounds(Rt) {
  Rt.bounds = Array.from({ length: NZ + 1 }, (_, i) => ZONE_START + i * ZONE_W);
  buildMountains(Rt);
  const xs = sampleRests(Rt, 4000, 7).sort((a, b) => a - b);
  const q = (arr, f) => arr[Math.min(arr.length - 1, Math.max(0, Math.floor(f * arr.length)))];
  const b = [ZONE_START];
  if (!Rt.mtn) {
    for (let i = 1; i < NZ; i++) b.push(Math.max(b[i - 1] + 12, q(xs, i / NZ)));
  } else {
    // stops before the range split the foothill landings, the plateau stops split the plateau, the rest split the plains
    const m = Rt.mtn, pre = xs.filter(x => x < m.p0), plat = xs.filter(x => x >= m.p0 && x <= m.p1), post = xs.filter(x => x > m.p1);
    b.push(Math.max(b[0] + 12, Math.min(m.f0 - 4, q(pre, 0.5))), m.p0, Math.max(m.p0 + 12, q(plat, 0.5)), m.p1);
    for (let i = 1; i <= NZ - 5; i++) b.push(Math.max(b[b.length - 1] + 12, q(post, i / (NZ - 4))));
  }
  b.push(Math.max(q(xs, 0.997) + 15, b[NZ - 1] + 30));
  Rt.bounds = b;
}
const B = () => ROUTES[routeKey].bounds;
const zCentre = i => {           // pin position: middle of the part of the zone where a ball can come to rest
  const b = B(), m = ROUTES[routeKey].mtn; let lo = b[i], hi = b[i + 1];
  if (m && lo < m.f0 && hi > m.f0) hi = Math.min(hi, m.f0);          // foothill stop: ignore the mountain face
  if (m && lo < m.e1 && hi > m.e1 && lo >= m.p1) lo = m.e1;          // stop past the range: ignore the far slope
  return (lo + hi) / 2;
};
const zoneOf = x => { const b = B(); for (let i = 0; i < NZ; i++) if (x < b[i + 1]) return i; return NZ - 1; };
