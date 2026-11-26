// Event wiring and start-up.

/* ---------- Wire up ---------- */
function setRoute() {
  routeKey = startKey + "-" + dirKey; lastZone = -1;
  document.querySelectorAll(".startbtn").forEach(x => x.setAttribute("aria-pressed", x.dataset.s === startKey));
  document.querySelectorAll(".dirbtn").forEach(x => { x.setAttribute("aria-pressed", x.dataset.r === dirKey); x.title = ROUTES[startKey + "-" + x.dataset.r].label; });
  drawWorld(); updateEstimate(); if (landedZone >= 0) resetKick(); else render();
}
document.querySelectorAll(".dirbtn").forEach(b => b.onclick = () => { if (busy) return; dirKey = b.dataset.r; setRoute(); });
document.querySelectorAll(".startbtn").forEach(b => b.onclick = () => { if (busy) return; startKey = b.dataset.s; setRoute(); });
$("angle").addEventListener("input", syncReadouts);
$("power").addEventListener("input", syncReadouts);
$("btnKick").onclick = () => exploring ? setExplore(false) : landedZone >= 0 ? resetKick().then(() => {}) : kick();   // Back to kicking while exploring (js/visit.js)
$("btnAgain").onclick = () => resetKick();
$("btnX").onclick = () => closeCard();
$("btnSave").onclick = () => toggleSave();
$("btnCopyCfg").onclick = copyCfg;
$("btnResetTeam").onclick = () => { delete cfg.teams[TEAMS[teamIdx].code]; saveCfg(); loadTeam(teamIdx); refreshLook(); toast("Team reset to defaults."); };
$("fieldCustom").addEventListener("input", e => setField(e.target.value));
$("fieldPerTeam").addEventListener("change", e => { cfg.fieldPerTeam = e.target.checked; saveCfg(); refreshLook(); });
$("btnImport").onclick = () => { $("importBox").hidden = false; $("importText").focus(); };
$("btnCancelImport").onclick = () => { $("importBox").hidden = true; };
$("btnApplyImport").onclick = () => { importCfg($("importText").value); $("importBox").hidden = true; $("importText").value = ""; };
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("card").hidden) closeCard(); });
// A tap or click anywhere outside the open card closes it, as a sheet's backdrop does. Tapping another control still
// does what it does (Line up next kick, a route); focus stays with it rather than jumping back to Kick
document.addEventListener("pointerdown", e => {
  const c = $("card");
  if (c.hidden || c.contains(e.target)) return;
  closeCard(!!e.target.closest("button, input, select, summary, label"));
});

for (const k in ROUTES) computeBounds(ROUTES[k]);
loadTeam(1); setPalette(); buildParts(); buildPickers(); applyField(); newWind(); syncReadouts(); render();
visitBoot();   // the visit's random start, never twice and Explore (js/visit.js)

// Dev helper: run checkDistribution() in the browser console to see, per route, the % of
// simulated kicks landing on each stop (same player model used to size the zones).
window.checkDistribution = function (n = 8000) {
  const keep = routeKey, rows = {};
  for (const r in ROUTES) {
    routeKey = r; const c = new Array(NZ).fill(0), rr = rng(999);
    for (let i = 0; i < n; i++) {
      const a = lerp(PLAYER_MODEL.angle[0], PLAYER_MODEL.angle[1], rr()), pw = lerp(PLAYER_MODEL.power[0], PLAYER_MODEL.power[1], rr());
      const w = Math.round((rr() * 2 - 1) * WIND_MAX * 10) / 10, s = simulate(a, pw, w);
      c[zoneOf(Math.max(ZONE_START, restX(s.landX)))]++;
    }
    rows[r] = Object.fromEntries(ROUTES[r].zones.map((z, i) => [z[0], Math.round(c[i] / n * 1000) / 10 + "%"]));
  }
  routeKey = keep; console.log("Kicks: each stop's share of single kicks"); console.table(rows);
  // Whole visits (js/visit.js): the random start, a series of kicks, the seen list and the re-routing; each stop's share
  // of the cards shown. Should stay within about 8 to 12%
  const visits = {}; for (const r in ROUTES) visits[r] = visitShares(r);
  console.log("Visits: each stop's share of the cards shown"); console.table(visits);
  return { kicks: rows, visits };
};
