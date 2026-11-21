// Game state, rendering, physics, the kick sequence, destination card and colour pickers.

/* ---------- State ---------- */
let cam = { ...START_CAM };
let pose = full("set"); pose._key = "set";
let ball = { x: 0, y: 0.32, rot: -78, show: true };
let trail = [], flying = false, busy = false, landedZone = -1, lastZone = -1, wind = 0;
let saved = new Set();   // place names added to the plan (one save per place, whichever route it was kicked on)
let teamOrder = null, teamChosen = false;   // inside the prototype: picked teams first; a team chosen here wins
let cardChanged = false; // something was added or removed on the open card: Close reads Save

/* ---------- Helpers ---------- */
const sx = wx => 600 + (wx - cam.x) * cam.k;
const sy = wy => GY - wy * cam.k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
const dur = ms => REDUCE ? 0 : ms;
function anim(ms, fn) {
  ms = dur(ms);
  return new Promise(res => {
    if (ms <= 0) { fn(1); return res(); }
    const t0 = performance.now();
    (function step(now) { const t = Math.min(1, (now - t0) / ms); fn(t); t < 1 ? requestAnimationFrame(step) : res(); })(t0);
  });
}
const wait = ms => new Promise(r => setTimeout(r, dur(ms)));

/* convert rig pose x (old scene px, tee at 560, scale 1.45) to world x */
const poseWX = p => ((p.x - TEE_X) / S) * RIG;

/* ---------- Static world drawing ---------- */
function drawWorld() {
  const R = ROUTES[routeKey], end = B()[NZ], parts = [];
  // sea
  if (R.sea) parts.push(`<rect x="${ZONE_START - 10}" y="-3.2" width="${end - ZONE_START + 60}" height="3.2" fill="#5fa8d3"/>`);
  // hills: back layer then front layer
  const pts = (fn, off, scale) => { let d = `M${ZONE_START - 10},0`; for (let x = ZONE_START - 10; x <= end + 40; x += 3) d += ` L${x},${(-fn(x + off) * scale).toFixed(2)}`; return d + ` L${end + 40},0 Z`; };
  parts.push(`<path d="${pts(R.hillFn, 37, 1.25)}" fill="${R.hill2}" opacity=".55"/>`);
  if (R.city) {   // a Gorillas-style skyline behind the local stops
    const r = rng(42 + routeKey.length);
    for (const [col, hMax, step] of [[R.hill2, 22, 7], [R.hill, 14, 5]]) {
      for (let x = ZONE_START - 6; x < end + 30; x += step * (0.6 + r() * 0.8)) {
        const w = step * (0.5 + r() * 0.5), h = 3 + r() * hMax;
        parts.push(`<rect x="${x.toFixed(1)}" y="${(-h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${col}"/>`);
      }
    }
  }
  parts.push(`<path d="${pts(R.hillFn, 0, 0.8)}" fill="${R.hill}"/>`);
  if (R.solid) {   // solid terrain: drawn in front, and the ball collides with it
    const x0 = Math.floor(R.mtn.f0 - 2), x1 = Math.ceil(R.mtn.e1 + 2);
    let d = `M${x0},0`, top = `M${x0},0`;
    for (let x = x0; x <= x1; x += 1) { const h = R.solid(x); d += ` L${x},${(-h).toFixed(2)}`; top += ` L${x},${(-h).toFixed(2)}`; }
    parts.push(`<path d="${d} L${x1},0 Z" fill="${R.solidCol}"/>`);
    parts.push(`<path d="${top}" fill="none" stroke="${R.solidTop}" stroke-width="0.9" stroke-linejoin="round"/>`);
  }
  // near: stadium turf and verge
  parts.push(`<rect x="-80" y="0" width="${ZONE_START + 80}" height="400" fill="${fieldColour()}"/>`);
  parts.push(`<rect x="22" y="-1.4" width="${ZONE_START - 22}" height="1.4" fill="#2f4a3a"/>`); // low stadium wall
  // zones
  for (let i = 0; i < NZ; i++) {
    const x = B()[i];
    parts.push(`<rect x="${x}" y="0" width="${B()[i + 1] - x}" height="400" fill="${R.ground[i]}"/>`);
    parts.push(`<line x1="${x}" y1="0" x2="${x}" y2="1.2" stroke="rgba(0,0,0,.25)" stroke-width="0.25"/>`);
  }
  parts.push(`<rect x="${end}" y="0" width="200" height="400" fill="${R.ground[NZ - 1]}"/>`);
  // turf lines
  $("worldStatic").innerHTML = parts.join("");
  // posts (slight three-quarter view so the crossbar reads)
  const bx = POST_X + 0.9;
  $("posts").innerHTML = `
    <line x1="${bx}" y1="0" x2="${bx}" y2="${-POST_H + 1.2}" stroke="#d9d3bf" stroke-width="0.16" stroke-linecap="round"/>
    <line x1="${POST_X}" y1="${-BAR_H}" x2="${bx}" y2="${-BAR_H - 0.5}" stroke="#efe9d6" stroke-width="0.16" stroke-linecap="round"/>
    <line x1="${POST_X}" y1="0" x2="${POST_X}" y2="${-POST_H}" stroke="#efe9d6" stroke-width="0.18" stroke-linecap="round"/>
    <rect x="${bx - 0.22}" y="-1.2" width="0.44" height="1.2" rx="0.18" fill="${darken(fieldColour(), 0.2)}"/>
    <rect x="${POST_X - 0.25}" y="-1.3" width="0.5" height="1.3" rx="0.2" fill="${darken(fieldColour(), 0.2)}"/>
    <rect x="-0.12" y="-0.14" width="0.24" height="0.14" fill="#e8742c"/>`;
}

/* ---------- Per-frame render ---------- */
function render() {
  $("world").setAttribute("transform", `translate(${(600 - cam.x * cam.k).toFixed(2)} ${GY}) scale(${cam.k.toFixed(4)})`);
  // player
  const px = poseWX(pose), py = groundOffset(pose) * RIG - (pose.lift / S) * RIG;
  $("player").setAttribute("transform", `translate(${px.toFixed(3)} ${py.toFixed(3)}) scale(${RIG})`);
  $("player").innerHTML = playerMarkup(pose, "none");
  // screen-space overlay: zone pins, trail, ball, guide
  const R = ROUTES[routeKey], out = [];
  for (let i = 0; i < NZ; i++) {
    const cx = sx(zCentre(i));
    if (cx < -100 || cx > 1300) continue;
    const hit = i === landedZone, h = 26 + (i % 2) * 22, base = sy(terrain(zCentre(i)));
    out.push(`<g class="pin${hit ? " hit" : ""}" transform="translate(0 ${(base - GY).toFixed(1)})">
      <line x1="${cx}" y1="${GY}" x2="${cx}" y2="${GY - h}" stroke="${hit ? "#17211a" : "rgba(23,33,26,.55)"}" stroke-width="2"/>
      <circle cx="${cx}" cy="${GY - h}" r="${hit ? 6 : 4}" fill="${hit ? "#ff4d00" : "#17211a"}"/>
      <text x="${cx}" y="${GY - h - 10}" text-anchor="middle">${R.zones[i][0]}</text></g>`);
  }
  // route overview bar (always visible, helps aiming)
  const bx0 = 170, bw = 500, by = 34, seg = bw / NZ;
  out.push(`<g class="routebar"><text x="${bx0}" y="${by - 8}" font-size="12" font-weight="700" fill="#17211a">${R.label.toUpperCase()} FROM ${STARTS[startKey].toUpperCase()}</text>`);
  for (let i = 0; i < NZ; i++) out.push(`<rect x="${bx0 + i * seg + 1}" y="${by}" width="${seg - 2}" height="10" rx="2" fill="${R.ground[i]}" stroke="${i === lastZone ? "#17211a" : "none"}" stroke-width="2"/>`);
  if (lastZone >= 0) out.push(`<text x="${bx0 + bw}" y="${by - 8}" text-anchor="end" font-size="12" fill="#17211a">Last kick: ${R.zones[lastZone][0]}</text>`);
  out.push(`<text x="${bx0}" y="${by + 26}" font-size="11" fill="#17211a" opacity=".7">${R.zones[0][0]} · ${R.zones[0][1]} km</text><text x="${bx0 + bw}" y="${by + 26}" text-anchor="end" font-size="11" fill="#17211a" opacity=".7">${R.zones[NZ - 1][0]} · ${R.zones[NZ - 1][1]} km</text></g>`);
  if (R.solid) { const mc = (R.mtn.p0 + R.mtn.p1) / 2, mx = sx(mc), my = sy(R.solid(mc)) + 26; if (mx > 0 && mx < 1200 && cam.k < 20) out.push(`<text x="${mx}" y="${my}" text-anchor="middle" font-size="12" font-weight="700" fill="rgba(255,255,255,.85)" letter-spacing="2">${R.solidName.toUpperCase()}</text>`); }
  if (trail.length > 1) out.push(`<polyline points="${trail.map(p => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(" ")}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2.5" stroke-dasharray="2 7" stroke-linecap="round"/>`);
  if (!busy && !flying) out.push(guideMarkup());
  if (ball.show) {
    const bs = clamp(cam.k * 0.028, 0.55, 1.3);
    out.push(`<g transform="translate(${sx(ball.x).toFixed(1)} ${sy(ball.y).toFixed(1)}) rotate(${ball.rot.toFixed(1)}) scale(${bs.toFixed(3)})">${ballSVG()}</g>`);
  }
  $("overlay").innerHTML = out.join("");
}

/* ---------- Controls ---------- */
const angle = () => +$("angle").value, power = () => +$("power").value;
const speedFromPower = p => 77 * Math.sqrt(Math.max(0.02, p / 100));   // range grows with speed squared, so this keeps power roughly linear with distance
function guideMarkup() {
  const v = speedFromPower(power()), th = angle() * Math.PI / 180, pts = [];
  for (let t = 0.05; t <= 0.9; t += 0.07) {
    const x = v * Math.cos(th) * t, y = 0.32 + v * Math.sin(th) * t - 0.5 * G * t * t;
    pts.push(`<circle cx="${sx(x).toFixed(1)}" cy="${sy(y).toFixed(1)}" r="3" fill="rgba(255,255,255,${(0.95 - t).toFixed(2)})"/>`);
  }
  return pts.join("");
}
function newWind() {
  wind = Math.round((Math.random() * 2 - 1) * WIND_MAX * 10) / 10;   // horizontal acceleration
  const kmh = Math.round(Math.abs(wind) * 30), dir = wind === 0 ? "" : wind > 0 ? "→" : "←";
  $("windVal").textContent = wind === 0 ? "Calm" : `${kmh} km/h ${dir}`;
  const len = Math.abs(wind) * 66, sign = Math.sign(wind) || 1;
  $("windFlag").innerHTML = `
    <text x="0" y="-14" font-size="14" font-weight="700" fill="#17211a">WIND ${wind === 0 ? "CALM" : kmh + " KM/H"}</text>
    ${wind === 0 ? "" : `<line x1="${sign > 0 ? 0 : len}" y1="0" x2="${sign > 0 ? len : 0}" y2="0" stroke="#17211a" stroke-width="4" stroke-linecap="round"/>
    <path d="M${sign > 0 ? len : 0},0 l${-10 * sign},-7 v14 z" fill="#17211a"/>`}`;
}
function syncReadouts() { $("angleVal").textContent = angle() + "°"; $("powerVal").textContent = power() + "%"; updateEstimate(); if (!busy) render(); }

/* ---------- Pose tween ---------- */
function tweenTo(key, ms, e = ease) {
  const from = Object.assign({}, pose), to = full(key);
  return anim(ms, t => { const k = e(t); for (const n in BASE) pose[n] = from[n] + (to[n] - from[n]) * k; if (t === 1) pose._key = key; render(); });
}
function camTo(target, ms) {
  const from = { ...cam };
  return anim(ms, t => { const k = ease(t);
    cam.k = Math.exp(lerp(Math.log(from.k), Math.log(target.k), k)); cam.x = lerp(from.x, target.x, k); render(); });
}

/* ---------- Physics (shared by the kick and the km estimate) ---------- */
const terrain = x => (ROUTES[routeKey].solid ? ROUTES[routeKey].solid(x) : 0);
const restX = x => restOn(ROUTES[routeKey], x);
function simulate(angDeg, pow, w) {
  const v = speedFromPower(pow), th = angDeg * Math.PI / 180;
  const vx = v * Math.cos(th), vy = v * Math.sin(th), y0 = 0.32;
  const T = (vy + Math.sqrt(vy * vy + 2 * G * y0)) / G;
  const pos = t => [vx * t + 0.5 * w * t * t, y0 + vy * t - 0.5 * G * t * t];
  let tHit = T, hit = false;
  for (let t = 0.02; t <= T; t += 0.004) { const p = pos(t); if (p[0] > POST_X + 5 && p[1] <= terrain(p[0])) { tHit = t; hit = p[1] > 0.05 || terrain(p[0]) > 0.05; break; } }
  return { T, tHit, pos, hit, landX: pos(tHit)[0], maxH: vy * vy / (2 * G) + y0 };
}
const slope = x => (terrain(x + 0.5) - terrain(x - 0.5));
/* where the ball comes to rest after touching down */
function kmAt(x) {
  const Z = ROUTES[routeKey].zones, cs = Z.map((z, i) => zCentre(i));
  if (x <= cs[0]) return Math.round(Z[0][1] * Math.max(0.3, x / cs[0]));
  for (let i = 1; i < NZ; i++) if (x <= cs[i]) { const f = (x - cs[i - 1]) / (cs[i] - cs[i - 1]); return Math.round(lerp(Z[i - 1][1], Z[i][1], f)); }
  return Z[NZ - 1][1];
}
function updateEstimate() {
  const s = simulate(angle(), power(), 0), rx = restX(s.landX);
  const m = ROUTES[routeKey].mtn, blocked = s.hit && m && s.landX < m.p0;
  $("estVal").textContent = `No wind: ≈ ${kmAt(rx)} km, ${ROUTES[routeKey].zones[zoneOf(rx)][0]}` + (blocked ? " (hits the mountains)" : "");
}

/* ---------- The kick ---------- */
async function kick() {
  if (busy) return; busy = true; setDisabled(true); closeCard(true);
  landedZone = -1; trail = [];
  await tweenTo("run1", 240); await tweenTo("run2", 200); await tweenTo("plant", 170); await tweenTo("contact", 90, t => t);

  const s = simulate(angle(), power(), wind), { T, tHit, pos, maxH } = s;
  let landX = s.landX;
  let over = false; { let prev = pos(0); for (let t = 0.01; t <= tHit; t += 0.01) { const p = pos(t); if (prev[0] < POST_X && p[0] >= POST_X) { over = p[1] > BAR_H; break; } prev = p; } }

  const minX = Math.min(-4, landX - 10), maxX = Math.max(POST_X + 6, landX + 14);
  const fitK = Math.min(1080 / (maxX - minX), 470 / (maxH + 4), 55);
  const fit = { k: fitK, x: (minX + maxX) / 2 };
  flying = true; ball.show = true;
  const D = clamp(900 + tHit * 210, 1100, 3800);
  const followP = tweenTo("follow", 260);
  const camStart = { ...cam };
  await anim(D, t => {
    const p = pos(t * tHit); ball.x = p[0]; ball.y = Math.max(terrain(p[0]), p[1]); ball.rot = -78 + t * 1100;
    trail.push([ball.x, ball.y]); if (trail.length > 160) trail.splice(1, 1);
    const ck = ease(Math.min(1, t / 0.35));
    cam.k = Math.exp(lerp(Math.log(camStart.k), Math.log(fit.k), ck)); cam.x = lerp(camStart.x, fit.x, ck);
    render();
  });
  await followP;
  flying = false;
  ball.x = landX; ball.y = terrain(landX);

  // terrain: bounce back off the face, or roll down the far side
  const rx = restX(landX);
  const hitFace = s.hit && rx < landX, rolledOn = s.hit && rx > landX;
  if (rx !== landX) {
    const x0 = landX;
    await anim(hitFace ? 1300 : 900, t => {
      const e = ease(t); ball.x = lerp(x0, rx, e);
      const bounce = hitFace ? Math.max(0, Math.sin(Math.min(1, t * 2.2) * Math.PI)) * 6 * (1 - t) : 0;
      ball.y = terrain(ball.x) + bounce; ball.rot += hitFace ? -8 : 8; render();
    });
    landX = rx; ball.y = terrain(rx);
  }

  landedZone = zoneOf(Math.max(landX, ZONE_START)); lastZone = landedZone;
  const shortKick = landX < ZONE_START, longKick = landX > B()[NZ];
  const zoneMid = zCentre(landedZone);
  if (shortKick || longKick) { const bx = ball.x; await anim(700, t => { ball.x = lerp(bx, longKick ? B()[NZ] - 4 : ZONE_START + 4, ease(t)); ball.rot += 9; render(); }); }
  render();
  await wait(350);
  const k2 = 7.5;
  await camTo({ k: k2, x: zoneMid + (600 - 330) / k2 }, 900);
  const R = ROUTES[routeKey];
  const terrainNote = !R.solid ? "" : hitFace ? `Too low! It hit the ${R.solidName} and rolled back down.` :
                      rolledOn ? `It cleared the top and rolled down the far side of the ${R.solidName}.` :
                      (s.hit && terrain(landX) > 0.05) ? `It came down in the ${R.solidName}.` : "";
  openCard(landedZone, { over, shortKick, longKick, terrainNote });
  if (over) tweenTo("celebrate", 320);
  busy = false; setDisabled(false);
  $("btnKick").textContent = "Line up next kick";
}

async function resetKick() {
  if (busy) return; busy = true; setDisabled(true);
  closeCard(true);
  trail = []; landedZone = -1;
  await camTo(START_CAM, 900);
  ball = { x: 0, y: 0.32, rot: -78, show: true };
  Object.assign(pose, full("set")); pose._key = "set";
  newWind(); render();
  busy = false; setDisabled(false);
  $("btnKick").textContent = "Kick";
}
function setDisabled(d) { ["btnKick"].forEach(id => $(id).disabled = d); document.querySelectorAll(".route").forEach(b => b.disabled = d); document.querySelectorAll(".chip").forEach(b => b.disabled = d); }

/* ---------- Destination card ---------- */
function openCard(i, info) {
  const R = ROUTES[routeKey], [name, km] = R.zones[i];
  $("cardImg").innerHTML = cardImage(i);
  $("cardKicker").textContent = info.over ? "Over the bar! The ball landed in …" : "The ball landed in …";
  $("cardName").textContent = name;
  $("cardTags").innerHTML = [R.label, dirKey === "local" ? "Near the stadium" : i < 2 ? "Day trip" : i < 6 ? "Short trip" : "Road trip"]
    .map(t => `<span>${t}</span>`).join("");
  $("cardDist").textContent = `approx. ${km} km from ${STARTS[startKey]}`;
  $("cardRoute").textContent = `${R.label}, stop ${i + 1} of ${NZ}`;
  $("cardNote").textContent = info.terrainNote || (info.shortKick ? "Short kick! It rolled to the nearest stop." : info.longKick ? "Huge kick! It ran out of road at the last stop." : "");
  cardChanged = false; cardStatus("");   // the cross, Escape or a tap outside closes it; the line names the latest change
  updateSave();
  const c = $("card"); c.hidden = false; requestAnimationFrame(() => c.classList.add("open"));
  $("cardName").focus();
}
function closeCard(silent) { const c = $("card"); c.classList.remove("open"); c.hidden = true; if (!silent) $("btnKick").focus(); }
const placeName = () => ROUTES[routeKey].zones[landedZone][0];
// The line in the card's action bar names the latest change, so the confirmation sits where the person acted
function cardStatus(msg) { $("cardStatus").textContent = msg; $("card").classList.toggle("has-status", !!msg); }
function toggleSave() {
  if (landedZone < 0) return;
  const name = placeName(), on = !saved.has(name);
  if (on) saved.add(name); else saved.delete(name);
  if (window.planLink) window.planLink.send(on, landedZone);   // inside the prototype: the plan keeps it (js/plan-link.js)
  cardChanged = true;
  cardStatus(name + (on ? " added to your plan." : " removed from your plan."));
  updateSave();
}
function updateSave() {
  const on = landedZone >= 0 && saved.has(placeName()), spans = $("btnSave").querySelectorAll("span");
  $("btnSave").setAttribute("aria-pressed", on); spans[0].textContent = on ? "✓" : "+"; spans[1].textContent = on ? "Added to your plan" : "Add to your plan";
}
function cardImage(i) {
  const R = ROUTES[routeKey], g = R.ground[i];
  let hills = "M0,140"; for (let x = 0; x <= 400; x += 10) hills += ` L${x},${(140 - R.hillFn(B()[i] + x / 7) * 4).toFixed(1)}`; hills += " L400,240 L0,240 Z";
  return `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <rect width="400" height="240" fill="#bfe1f2"/><circle cx="320" cy="60" r="26" fill="#ffe08a"/>
    ${R.sea ? `<rect y="128" width="400" height="20" fill="#5fa8d3"/>` : ""}
    <path d="${hills}" fill="${R.hill}"/><rect y="160" width="400" height="80" fill="${g}"/>
    <text x="16" y="226" font-size="12" font-family="Space Mono, monospace" fill="rgba(0,0,0,.55)">DESTINATION IMAGE</text></svg>`;
}

/* ---------- Team + curation pickers ---------- */
function loadTeam(i) { teamIdx = i; const tc = teamCfg(TEAMS[i].code); kitIdx = tc.kit; shadeIdx = tc.skin; }
function buildPickers() {
  const order = teamOrder || TEAMS.map((_, i) => i);
  $("teams").innerHTML = order.map(i => { const t = TEAMS[i], tc = teamCfg(t.code);
    return `<button class="chip" role="radio" aria-checked="${i === teamIdx}" data-i="${i}" title="${t.name}">
      <span class="sw"><span style="background:${kitAdjust(t.jersey, KIT_STEPS[tc.kit])}"></span><span style="background:${skinFor(t, tc.skin).skin}"></span></span>${t.code}${t.skin ? "" : "*"}</button>`; }).join("");
  const t = TEAMS[teamIdx];
  $("kitShades").innerHTML = KIT_STEPS.map((d, i) => `<button class="kitdot" role="radio" aria-label="Kit shade ${i + 1}" aria-checked="${i === kitIdx}" data-i="${i}">
      <span style="background:${kitAdjust(t.jersey, d)}"></span><span style="background:${kitAdjust(t.hoops || t.trim, d)}"></span><span style="background:${kitAdjust(t.socks, d)}"></span></button>`).join("");
  $("shades").innerHTML = SHADES.map((_, i) => `<button class="dot" role="radio" aria-label="Skin shade ${i + 1}" aria-checked="${i === shadeIdx}" data-i="${i}" style="background:${skinFor(t, i).skin}"></button>`).join("");
  const fc = fieldColour();
  $("fields").innerHTML = FIELDS.map(f => `<button class="fdot" role="radio" aria-label="Field ${f}" aria-checked="${f.toLowerCase() === fc.toLowerCase()}" data-f="${f}" style="background:${f}"></button>`).join("");
  $("fieldCustom").value = fc; $("fieldPerTeam").checked = cfg.fieldPerTeam;
  $("teamName").textContent = t.name + (t.skin ? "" : " (placeholder skin: no blue or green in palette)") + (cfg.fieldPerTeam ? " · field set per team" : "");
  document.querySelectorAll(".chip").forEach(b => b.onclick = () => { teamChosen = true; loadTeam(+b.dataset.i); refreshLook(); });
  document.querySelectorAll(".dot").forEach(b => b.onclick = () => { shadeIdx = +b.dataset.i; setTeamCfg({ skin: shadeIdx }); refreshLook(); });
  document.querySelectorAll(".kitdot").forEach(b => b.onclick = () => { kitIdx = +b.dataset.i; setTeamCfg({ kit: kitIdx }); refreshLook(); });
  document.querySelectorAll(".fdot").forEach(b => b.onclick = () => setField(b.dataset.f));
}
function setField(f) {
  if (cfg.fieldPerTeam) setTeamCfg({ field: f }); else { cfg.field = f; saveCfg(); }
  refreshLook();
}
function applyField() {
  document.documentElement.style.setProperty("--field", fieldColour());
  drawWorld();
}
function refreshLook() {
  setPalette(); buildParts(); buildPickers(); applyField();
  render();
}
async function copyCfg() {
  const out = { field: cfg.field, fieldPerTeam: cfg.fieldPerTeam, teams: {} };
  for (const t of TEAMS) {
    const tc = teamCfg(t.code), d = KIT_STEPS[tc.kit];
    out.teams[t.code] = {
      kit: { jersey: kitAdjust(t.jersey, d), hoops: kitAdjust(t.hoops, d) || undefined, trim: kitAdjust(t.trim, d), shorts: kitAdjust(t.shorts, d), socks: kitAdjust(t.socks, d), band: kitAdjust(t.band, d) },
      skin: skinFor(t, tc.skin).skin, kitShade: tc.kit + 1, skinShade: tc.skin + 1,
      field: cfg.fieldPerTeam && tc.field ? tc.field : undefined
    };
  }
  try { await navigator.clipboard.writeText(JSON.stringify(out, null, 2)); toast("Curated settings copied as JSON."); }
  catch (e) { toast("Copy was blocked by the browser."); }
}


let toastTimer;
function toast(msg) { $("toast").textContent = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => $("toast").textContent = "", 3500); }
function importCfg(text) {
  let data; try { data = JSON.parse(text); } catch (e) { toast("That isn't valid settings JSON."); return; }
  if (!data || !data.teams) { toast("No team settings found in that JSON."); return; }
  if (data.field) cfg.field = data.field;
  cfg.fieldPerTeam = !!data.fieldPerTeam;
  let n = 0;
  for (const [code, t] of Object.entries(data.teams)) {
    if (!TEAMS.some(x => x.code === code)) continue;
    cfg.teams[code] = { kit: clamp((t.kitShade || 3) - 1, 0, KIT_STEPS.length - 1), skin: clamp((t.skinShade || 2) - 1, 0, SHADES.length - 1), field: t.field || null };
    n++;
  }
  saveCfg(); loadTeam(teamIdx); refreshLook(); toast(`Imported settings for ${n} teams.`);
}
