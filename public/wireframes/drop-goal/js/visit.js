// One visit (22 Nov): a random start, never the same stop twice, Explore all stops, and previous and next on the card.
// Everything here sits on top of the physics: simulate(), the zones, the routes, the terrain and PLAYER_MODEL are
// untouched. A kick is worked out exactly as before; only if it would land on a stop already seen this visit is a
// second path laid over it from the posts, ending at the nearest stop not yet seen (README, Never twice).
// Loads before main.js (its first render draws the markers here); visitBoot() runs at the end of main.js's start-up.
// Kept for the visit in sessionStorage (wrapped, so it all still works without it). Reset prototype clears it (thk:reset).

/* ---------- The visit's memory ---------- */
const VISIT_KEY = "thk-visit-1";
let visit = { start: null, seen: {} };
try { const v = JSON.parse(sessionStorage.getItem(VISIT_KEY) || "null"); if (v && typeof v === "object") visit = { start: v.start || null, seen: v.seen || {} }; } catch (e) {}
function saveVisit() { try { sessionStorage.setItem(VISIT_KEY, JSON.stringify(visit)); } catch (e) {} }
const seenList = (rk = routeKey) => (visit.seen[rk] = (visit.seen[rk] || []).filter(i => i >= 0 && i < NZ));
function markSeen(i) { const l = seenList(); if (i >= 0 && l.indexOf(i) < 0) { l.push(i); saveVisit(); } }
const isSeen = i => seenList().indexOf(i) > -1;

// The estimate under Power is a testing aid: only with ?tools (on the page around the game, or on the game on its own)
const TOOLS = (() => { const t = s => /[?&]tools\b/.test(s); try { return t(location.search) || (window.parent !== window && t(window.parent.location.search)); } catch (e) { return t(location.search); } })();

/* ---------- 1. A random start ----------
   Each visit opens on a random route (from Sydney) with an angle and power that send the first kick to a stop picked
   at random, every stop as likely as the next, so the first kick is a good one and no stop is favoured by it. The
   wind still moves it. Moving any control replaces these with the person's own settings for the rest of the visit. */
const zoneOfR = (R, x) => { for (let i = 0; i < NZ; i++) if (x < R.bounds[i + 1]) return i; return NZ - 1; };
const clearsBar = (a, p) => { const v = speedFromPower(p), th = a * Math.PI / 180, t = POST_X / (v * Math.cos(th)); return 0.32 + v * Math.sin(th) * t - 0.5 * G * t * t > BAR_H + 0.3; };
const aims = {};
function aimTable(rk) {   // for each stop, the angle and power pairs (middle angles) that land there with no wind
  if (aims[rk]) return aims[rk];
  const R = ROUTES[rk], t = Array.from({ length: NZ }, () => ({ good: [], any: [] }));
  for (let a = 30; a <= 60; a++) for (let p = 4; p <= 100; p++) {
    const z = zoneOfR(R, Math.max(ZONE_START, landFast(R, a, p, 0)));
    (clearsBar(a, p) ? t[z].good : t[z].any).push([a, p]);
  }
  // the top half of each stop's power range, so even the first stop is a clean, purposeful kick rather than a tap
  return (aims[rk] = t.map(c => { const l = (c.good.length ? c.good : c.any).slice().sort((x, y) => x[1] - y[1]); return l.slice(Math.floor(l.length / 2)); }));
}
function randomStart(r = Math.random) {
  const dirs = ["local", "north", "south", "west"], d = dirs[Math.floor(r() * dirs.length)], rk = "sydney-" + d;
  const pairs = aimTable(rk)[Math.floor(r() * NZ)], [a, p] = pairs[Math.floor(r() * pairs.length)] || [45, 50];
  return { s: "sydney", r: d, a, p };
}
function applyStart() {
  const st = visit.start;
  startKey = STARTS[st.s] ? st.s : "sydney"; dirKey = ["local", "north", "south", "west"].indexOf(st.r) > -1 ? st.r : "north";
  $("angle").value = st.a; $("power").value = st.p;
  setRoute0(); syncReadouts();
}
// The person's own settings hold from their first change
function keepControls() { visit.start = { s: startKey, r: dirKey, a: angle(), p: power() }; saveVisit(); }

/* ---------- 2. Never twice ---------- */
// The stop to show instead of z (pure, so checkDistribution() can use it): the nearest stop not seen yet; a tie goes the
// way the ball was travelling. One stop on with the wind (or none) is a late gust; back, or against the wind, is off
// the upright; two or more stops is off the upright, then the gust. Every stop seen: where it landed, and a fresh list.
function rerouteZ(seen, z, w, travel) {
  if (seen.size >= NZ) return { to: z, kind: null, allSeen: true };
  if (!seen.has(z)) return { to: z, kind: null };
  for (let d = 1; d < NZ; d++) {
    const f = z + d < NZ && !seen.has(z + d), b = z - d >= 0 && !seen.has(z - d);
    if (!f && !b) continue;
    const dir = f && b ? (travel < 0 ? -1 : 1) : f ? 1 : -1, to = z + dir * d;
    return { to, dir, kind: d >= 2 ? "both" : dir > 0 && w >= 0 ? "gust" : "upright" };
  }
  return { to: z, kind: null };
}
// The one path the ball flies: the physics up to the posts (an upright) or late in the flight (a gust), then bent
// smoothly onto the new stop, landing at its pin. It never changes how the kick was struck.
function reroutePath(s, plan, over) {
  const p1 = s.pos(s.tHit), xEnd = zCentre(plan.to), yEnd = terrain(xEnd);
  let tp = null; for (let t = 0.004; t <= s.tHit; t += 0.004) if (s.pos(t)[0] >= POST_X) { tp = t; break; }
  let kind = plan.kind;
  // Off the upright always means it still went over (22 Nov): a kick that never reached the posts, or went under the
  // bar, can only be carried by the wind
  if (tp === null || tp > s.tHit * 0.85 || !over) kind = "gust";
  const xMid = kind === "both" ? zCentre(plan.to - plan.dir) : null;
  const A1 = kind === "gust" ? 0 : kind === "both" ? xMid - p1[0] : xEnd - p1[0];
  const A2 = kind === "gust" ? xEnd - p1[0] : kind === "both" ? xEnd - xMid : 0;
  const ts = Math.max(tp || 0, s.tHit * 0.55), Ay = yEnd - p1[1];
  const sm = u => u * u * (3 - 2 * u);
  const pos = t => {
    const n = s.pos(t), u1 = tp === null || A1 === 0 ? 0 : clamp((t - tp) / (s.tHit - tp), 0, 1), g1 = 1 - (1 - u1) ** 2;
    const g2 = A2 === 0 ? 0 : sm(clamp((t - ts) / (s.tHit - ts), 0, 1));
    const gy = (Math.abs(A1) * g1 + Math.abs(A2) * g2) / (Math.abs(A1) + Math.abs(A2) || 1);
    const x = n[0] + A1 * g1 + A2 * g2;
    let y = n[1] + Ay * gy;
    if (A1 !== 0 && !REDUCE && t > tp) y += 0.5 * Math.sin((t - tp) * 38) * Math.exp(-(t - tp) * 5);   // the wobble off the post
    if (t < s.tHit) y = Math.max(y, terrain(x) + 0.2);
    return [x, t >= s.tHit ? yEnd : y];
  };
  return { pos, tp: A1 === 0 ? null : tp, ts: A2 === 0 ? null : ts, kind, xEnd, gustDir: Math.sign(A2) || 1,
           gustKmh: Math.round(clamp(20 + Math.abs(A2) / 4, 25, 60)) };
}
function planKick(z, travel) {
  const plan = rerouteZ(new Set(seenList()), z, wind, travel);
  if (plan.allSeen) { visit.seen[routeKey] = []; saveVisit(); }   // a fresh list: the stop it lands on is its first
  return plan;
}
// The upright flashes and the wind readout shows the gust; reduced motion: neither (the card's line says what happened)
let postFlash = 0;
function flashPost() { if (!REDUCE) postFlash = performance.now(); }
let gustTimer = 0, gustAt = 0, gustDir = 1;
function showGust(kmh, dir) {
  if (REDUCE) return;
  gustAt = performance.now(); gustDir = dir;
  const len = 120, a = dir > 0 ? "→" : "←";
  $("windVal").textContent = `Gust ${kmh} km/h ${a}`; $("windVal").classList.add("gusting");
  $("windFlag").innerHTML = `<g class="gust-flare">
    <text x="0" y="-14" font-size="14" font-weight="700" fill="#c2410c">GUST ${kmh} KM/H</text>
    <line x1="${dir > 0 ? -20 : len}" y1="0" x2="${dir > 0 ? len - 20 : 0}" y2="0" stroke="#c2410c" stroke-width="6" stroke-linecap="round"/>
    <path d="M${dir > 0 ? len - 20 : 0},0 l${-14 * dir},-10 v20 z" fill="#c2410c"/></g>`;
  clearTimeout(gustTimer); gustTimer = setTimeout(() => { $("windVal").classList.remove("gusting"); drawWind(); }, 1700);
}
// While the gust blows, wind streaks trail the ball, so the push is seen where the eye is
function gustMarkup() {
  const age = performance.now() - gustAt; if (!gustAt || !flying || age > 1400) return "";
  const x = sx(ball.x), y = sy(ball.y), k = Math.min(1, age / 200) * Math.min(1, (1400 - age) / 300), d = gustDir;
  return `<g opacity="${(0.9 * k).toFixed(2)}" stroke="#fff" stroke-linecap="round" stroke-width="3">` +
    [[-10, 46], [2, 64], [14, 40]].map(([dy, len], j) => { const ph = ((age / 90) + j * 0.7) % 1, x0 = x - d * (22 + ph * 26); return `<line x1="${x0.toFixed(1)}" y1="${(y + dy).toFixed(1)}" x2="${(x0 - d * len).toFixed(1)}" y2="${(y + dy).toFixed(1)}"/>`; }).join("") + `</g>`;
}
function postFlashMarkup() {
  const age = performance.now() - postFlash; if (!postFlash || age > 420) return "";
  const k = 1 - age / 420, x = sx(POST_X), y = sy(POST_H * 0.7);
  return `<g opacity="${k.toFixed(2)}"><circle cx="${x}" cy="${y}" r="${(10 + 26 * (1 - k)).toFixed(1)}" fill="none" stroke="#fff" stroke-width="4"/>
    <line x1="${sx(POST_X)}" y1="${sy(0)}" x2="${sx(POST_X)}" y2="${sy(POST_H)}" stroke="#fff6c2" stroke-width="${(cam.k * 0.4).toFixed(1)}" stroke-linecap="round"/></g>`;
}

/* ---------- The card's lines ---------- */
function kickerLine(info) {
  if (info.explore) return "Exploring\u00a0…";
  const k = info.reroute;
  if (info.over) return k === "upright" ? "Off the upright and over! The ball landed in\u00a0…" :
                        k === "gust" ? "Over the bar and caught the breeze! The ball landed in\u00a0…" :
                        k === "both" ? "Off the upright and over, then caught the breeze! The ball landed in\u00a0…" : "Over the bar! The ball landed in\u00a0…";
  return k === "upright" ? "Off the upright! The ball landed in\u00a0…" : k === "gust" ? "Caught the breeze! The ball landed in\u00a0…" :
         k === "both" ? "Off the upright and caught the breeze! The ball landed in\u00a0…" : "The ball landed in\u00a0…";
}
const ALL_SEEN = "You’ve seen every stop on this route. Try another route?";

/* ---------- 6. Previous and next stop on the card ---------- */
let cardInfo = null;   // the card's own landing (or how it was opened), to go back to it
function fillSteps() {
  const Z = ROUTES[routeKey].zones, p = cardZone - 1, n = cardZone + 1;
  $("btnPrev").hidden = p < 0; $("btnNext").hidden = n >= NZ;
  if (p >= 0) { $("btnPrev").querySelector(".step-name").textContent = Z[p][0]; $("btnPrev").setAttribute("aria-label", "Previous stop: " + Z[p][0]); }
  if (n < NZ) { $("btnNext").querySelector(".step-name").textContent = Z[n][0]; $("btnNext").setAttribute("aria-label", "Next stop: " + Z[n][0]); }
}
function stepCard(dir) {
  const to = cardZone + dir; if (to < 0 || to >= NZ || busy) return;
  const card = $("card"), box = $("cardStop"), inner = card.querySelector(".card-inner"), was = document.activeElement;
  if (isSheetCard() && !card.style.height) card.style.height = card.offsetHeight + "px";   // the card holds its height
  let ghost = null;
  if (!REDUCE) {
    ghost = box.cloneNode(true); ghost.removeAttribute("id"); ghost.querySelectorAll("[id]").forEach(e => e.removeAttribute("id"));
    ghost.classList.add("card-ghost"); ghost.setAttribute("aria-hidden", "true"); ghost.inert = true;
    ghost.style.top = (box.offsetTop - inner.scrollTop) + "px"; ghost.style.width = box.offsetWidth + "px";
    inner.append(ghost);
  }
  inner.scrollTop = 0;
  fillCard(to, to === landedZone && cardInfo && !cardInfo.explore ? cardInfo : { explore: true });
  cardStatus("");
  $("cardSay").textContent = `${ROUTES[routeKey].zones[to][0]}, stop ${to + 1} of ${NZ}`;
  if (ghost) {
    const o = { duration: 300, easing: "cubic-bezier(.25,.8,.3,1)" };
    box.animate([{ transform: `translateX(${dir * 100}%)` }, { transform: "none" }], o);
    ghost.animate([{ transform: "none", opacity: 1 }, { transform: `translateX(${-dir * 100}%)`, opacity: .4 }], o).onfinish = () => ghost.remove();
  }
  // Focus stays on the button pressed; at the end of the route it moves to the other one
  if (was === $("btnPrev") || was === $("btnNext")) (was.hidden ? (was === $("btnPrev") ? $("btnNext") : $("btnPrev")) : was).focus({ focusVisible: was.matches(":focus-visible") });
  panTo(to, true);
  render();
}
const isSheetCard = () => matchMedia("(max-width: 760px)").matches && !matchMedia("(min-width: 600px) and (max-height: 560px)").matches;
// The pitch follows the card: the stop showing is the highlighted marker, and the camera brings it into view
function panTo(i, card) { const k = 7.5; return camTo({ k, x: clamp(zCentre(i) + (card ? 270 : 0) / k, exploreMin(), exploreMax()) }, 600); }

/* ---------- 5. Explore all stops ---------- */
let exploring = false, exFocus = -1;
const exploreMin = () => zCentre(0) - 20, exploreMax = () => zCentre(NZ - 1) + 60;
function buildExploreList() {
  const Z = ROUTES[routeKey].zones, list = $("exploreList");
  // Same route: update the labels in place, so a button keeps focus and stays the card's way back
  if (list.dataset.route === routeKey && list.children.length === NZ) {
    list.querySelectorAll("button").forEach((b, i) => { b.textContent = `${Z[i][0]}, stop ${i + 1} of ${NZ}${isSeen(i) ? ", seen" : ""}`; });
    return;
  }
  list.dataset.route = routeKey;
  list.innerHTML = Z.map((z, i) => `<li><button type="button" data-i="${i}">${z[0]}, stop ${i + 1} of ${NZ}${isSeen(i) ? ", seen" : ""}</button></li>`).join("");
}
function setExplore(on) {
  if (busy || exploring === on) return;
  exploring = on;
  $("btnExplore").setAttribute("aria-pressed", on);
  $("exploreWrap").hidden = !on;
  document.body.classList.toggle("exploring", on);
  if (on) {
    closeCard(true); buildExploreList();
    $("btnKick").textContent = "Back to kicking";
    panTo(landedZone >= 0 ? landedZone : 0, false);
  } else {
    exFocus = -1;
    if (landedZone >= 0) resetKick(); else { closeCard(true); camTo(START_CAM, 700); $("btnKick").textContent = "Kick"; }
  }
  render();
}
function exploreOpen(i, opener) { cardOpener = opener || null; openCard(i, { explore: true }); panTo(i, true); }
// Pan by dragging the pitch (sideways only, so the page still scrolls up and down) and with the arrow keys
(function () {
  const stage = document.querySelector("svg.stage");
  let d = null;
  stage.addEventListener("pointerdown", e => {
    if (!exploring || busy) return;
    d = { id: e.pointerId, x0: e.clientX, y0: e.clientY, cx: cam.x, moved: false, scale: 1200 / stage.getBoundingClientRect().width };
  });
  stage.addEventListener("pointermove", e => {
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) { d.moved = true; try { stage.setPointerCapture(e.pointerId); } catch (er) {} }
    cam.x = clamp(d.cx - dx * d.scale / cam.k, exploreMin(), exploreMax()); render();
  });
  const end = e => {
    if (!d || e.pointerId !== d.id) return;
    const was = d; d = null;
    if (was.moved || e.type !== "pointerup") return;
    const hit = e.target.closest && e.target.closest("[data-pin]");
    if (hit) exploreOpen(+hit.getAttribute("data-pin"), $("exploreList").querySelector(`[data-i="${hit.getAttribute("data-pin")}"]`));
  };
  stage.addEventListener("pointerup", end); stage.addEventListener("pointercancel", end);
  // Keyboard: the stops are a list of buttons in distance order; focus brings each one into view, and the arrow keys
  // move along the route
  const list = $("exploreList");
  list.addEventListener("focusin", e => { const b = e.target.closest("button"); if (!b) return; exFocus = +b.dataset.i; panTo(exFocus, false); render(); });
  list.addEventListener("focusout", () => { setTimeout(() => { if (!list.contains(document.activeElement)) { exFocus = -1; render(); } }); });
  list.addEventListener("click", e => { const b = e.target.closest("button"); if (b) exploreOpen(+b.dataset.i, b); });
  list.addEventListener("keydown", e => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    const b = e.target.closest("button"); if (!b) return;
    const i = clamp(+b.dataset.i + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1), 0, NZ - 1);
    list.querySelector(`[data-i="${i}"]`).focus(); e.preventDefault();
  });
})();
// The markers in Explore: all the same, a tick on each stop seen, labels at a size that reads on a phone
function exploreScale() { const w = document.querySelector("svg.stage").getBoundingClientRect().width || 1200; return clamp(1200 / w * 0.9, 1, 3.2); }
function pinMarkup(i) {
  const R = ROUTES[routeKey], cx = sx(zCentre(i)), base = sy(terrain(zCentre(i)));
  if (cx < -200 || cx > 1400) return "";
  const shown = !$("card").hidden && cardZone === i, hit = exploring ? shown : (shown || (cardZone < 0 && i === landedZone));
  if (!exploring) {
    const h = 26 + (i % 2) * 22;
    return `<g class="pin${hit ? " hit" : ""}" transform="translate(0 ${(base - GY).toFixed(1)})">
      <line x1="${cx}" y1="${GY}" x2="${cx}" y2="${GY - h}" stroke="${hit ? "#17211a" : "rgba(23,33,26,.55)"}" stroke-width="2"/>
      <circle cx="${cx}" cy="${GY - h}" r="${hit ? 6 : 4}" fill="${hit ? "#ff4d00" : "#17211a"}"/>
      <text x="${cx}" y="${GY - h - 10}" text-anchor="middle">${R.zones[i][0]}</text></g>`;
  }
  const u = exploreScale(), h = (30 + (i % 2) * 34) * u, fs = 13 * u, seen = isSeen(i), name = R.zones[i][0];
  const tw = (name.length * 0.62 + (seen ? 1.6 : 0)) * fs, top = GY - h;
  const ring = exFocus === i ? `<rect x="${cx - tw / 2 - 8 * u}" y="${top - fs - 16 * u}" width="${tw + 16 * u}" height="${h + fs + 22 * u}" rx="${6 * u}" fill="none" stroke="#005ea2" stroke-width="${3 * u}"/>` : "";
  return `<g class="pin explore${shown ? " hit" : ""}" data-pin="${i}" transform="translate(0 ${(base - GY).toFixed(1)})" style="cursor:pointer">
    <rect x="${cx - Math.max(tw, 30 * u) / 2 - 6 * u}" y="${top - fs - 12 * u}" width="${Math.max(tw, 30 * u) + 12 * u}" height="${h + fs + 16 * u}" fill="transparent"/>
    <line x1="${cx}" y1="${GY}" x2="${cx}" y2="${top}" stroke="${shown ? "#17211a" : "rgba(23,33,26,.7)"}" stroke-width="${2 * u}"/>
    <circle cx="${cx}" cy="${top}" r="${(shown ? 6 : 5) * u}" fill="${shown ? "#ff4d00" : "#17211a"}"/>
    <text x="${cx}" y="${top - 10 * u}" text-anchor="middle" style="font-size:${fs.toFixed(1)}px;stroke-width:${(4 * u).toFixed(1)}px">${name}${seen ? " ✓" : ""}</text>${ring}</g>`;
}

/* ---------- Reset prototype (thk:reset): a new visit ---------- */
window.visitReset = function () {
  try { sessionStorage.removeItem(VISIT_KEY); } catch (e) {}
  visit = { start: randomStart(), seen: {} }; saveVisit();
  if (exploring) { exploring = false; $("btnExplore").setAttribute("aria-pressed", "false"); $("exploreWrap").hidden = true; document.body.classList.remove("exploring"); }
  closeCard(true); landedZone = -1; lastZone = -1; cardZone = -1; trail = [];
  applyStart();
  cam = { ...START_CAM }; ball = { x: 0, y: 0.32, rot: -78, show: true }; Object.assign(pose, full("set")); pose._key = "set";
  newWind(); render(); $("btnKick").textContent = "Kick";
};

/* ---------- 7. Equal exposure across whole visits ----------
   Simulates visits on every route: the random start (a stop picked at random, then wind), then up to 7 more kicks from
   PLAYER_MODEL (most visits short), each going through the seen list and the re-routing, and counts the cards shown.
   Explore and previous and next are left out: people choose where those go. */
function visitShares(rk, visits = 6000, seed = 2026) {
  const R = ROUTES[rk], r = rng(seed), c = new Array(NZ).fill(0), table = aimTable(rk);
  let cards = 0;
  for (let v = 0; v < visits; v++) {
    const seen = new Set(), pairs = table[Math.floor(r() * NZ)], first = pairs[Math.floor(r() * pairs.length)];
    let kicks = 1; while (kicks < 8 && r() < 0.65) kicks++;
    for (let k = 0; k < kicks; k++) {
      const [a, p] = k === 0 ? first : [lerp(PLAYER_MODEL.angle[0], PLAYER_MODEL.angle[1], r()), lerp(PLAYER_MODEL.power[0], PLAYER_MODEL.power[1], r())];
      const w = Math.round((r() * 2 - 1) * WIND_MAX * 10) / 10;
      const z = zoneOfR(R, Math.max(ZONE_START, landFast(R, a, p, w)));
      const plan = rerouteZ(seen, z, w, 1);
      if (plan.allSeen) seen.clear();
      seen.add(plan.to); c[plan.to]++; cards++;
    }
  }
  return Object.fromEntries(R.zones.map((z, i) => [z[0], Math.round(c[i] / cards * 1000) / 10 + "%"]));
}

/* ---------- Start-up: called at the end of main.js's start-up, once the routes and controls are ready ---------- */
let setRoute0 = null;
function visitBoot() {
setRoute0 = setRoute;
setRoute = function () {   // a route change while exploring stays in Explore, on the new route
  const wasEx = exploring;
  if (wasEx) { landedZone = -1; cardZone = -1; trail = []; ball = { x: 0, y: 0.32, rot: -78, show: true }; closeCard(true); }
  setRoute0();
  if (wasEx) { buildExploreList(); panTo(0, false); }
};
$("estVal").hidden = !TOOLS;
if (!visit.start) { visit.start = randomStart(); saveVisit(); }
applyStart();
$("btnExplore").onclick = () => setExplore(!exploring);
document.querySelectorAll(".route").forEach(b => b.addEventListener("click", keepControls));   // after main.js's own handler
$("angle").addEventListener("input", keepControls); $("power").addEventListener("input", keepControls);
$("btnPrev").onclick = () => stepCard(-1);
$("btnNext").onclick = () => stepCard(1);
}
