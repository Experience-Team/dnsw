// The link to the prototype page (Stage 2). When the game runs inside the prototype (in its Drop goal iframe), Add to
// your plan saves the place to the plan's "Saved, not placed yet" group, and the plan's saves come back here so the
// button always matches the plan. Messages, both ways through postMessage, same origin only (see README, Messages):
//   thk:ready    game -> page  the game has loaded; the page answers with thk:saved
//   thk:save     game -> page  { name, distance_km, route: { start, label, position } }, the §18 fields the game holds
//   thk:unsave   game -> page  { name }
//   thk:saved    page -> game  { names: [...] }, every place from the game in the plan, after any change to the plan
//   thk:theme    page -> game  { theme: "hifi" | "wireframe", tokens: { "c-ink": "#111", ... } }, the page's theme values
//                              (Stage 3), on load and when the theme switch changes; set as --e-* (css/embed.css)
//   thk:teams    page -> game  { picked: [team names] }, the teams picked in the planner (Stage 3): they come first
//                              in the team row, and the first is the kicker unless a team was chosen here
//   thk:card     game -> page  { open: true | false }, when the result card opens or closes, so the page head dims
//   thk:open-plan game -> page  See your plan on the card's line: the page closes the card, goes to the planner and
//                              opens the plan at Saved, not placed yet
//   thk:reset    page -> game  Reset prototype: a new visit (the seen lists and the random start are cleared; js/visit.js)
//   thk:close    page -> game  a press on the page outside the game, or leaving the tab: the card closes (silently,
//                              so focus stays where the person pressed)
// Opened on its own, nothing answers, and saves stay in this page's memory as before.
(function () {
  if (window.parent === window) return;
  const ORIGIN = location.origin;
  const post = msg => { try { window.parent.postMessage(msg, ORIGIN); } catch (e) {} };
  window.planLink = {
    openPlan() { post({ type: "thk:open-plan" }); },
    send(on, i) {
      const R = ROUTES[routeKey], z = R.zones[i];
      if (on) post({ type: "thk:save", name: z[0], distance_km: typeof z[1] === "number" ? z[1] : null,
                     route: { start: startKey, label: R.label, position: i + 1 } });
      else post({ type: "thk:unsave", name: z[0] });
    }
  };
  const TOKEN = /^[a-z0-9-]{1,40}$/;
  function applyTheme(d) {
    const root = document.documentElement, t = d.tokens && typeof d.tokens === "object" ? d.tokens : {};
    root.setAttribute("data-theme", d.theme === "hifi" ? "hifi" : "wireframe");
    Object.keys(t).forEach(k => { const v = t[k]; if (TOKEN.test(k) && typeof v === "string" && v.length <= 200) root.style.setProperty("--e-" + k, v.trim()); });
  }
  function applyTeams(d) {
    if (busy) { setTimeout(() => applyTeams(d), 400); return; }   // not mid-kick: the team row is disabled then
    const picked = d.picked.map(n => TEAMS.findIndex(t => t.name === n)).filter(i => i > -1);
    teamOrder = picked.concat(TEAMS.map((_, i) => i).filter(i => picked.indexOf(i) < 0));
    if (picked.length && !teamChosen) loadTeam(picked[0]);
    refreshLook();
  }
  // Tell the page when the card opens or closes (openCard and closeCard are game.js globals; wrapped, not changed)
  const open0 = openCard, close0 = closeCard;
  openCard = function () { const r = open0.apply(this, arguments); post({ type: "thk:card", open: true }); return r; };
  closeCard = function () { const was = !$("card").hidden, r = close0.apply(this, arguments); if (was) post({ type: "thk:card", open: false }); return r; };
  window.addEventListener("message", e => {
    const d = e.data;
    if (e.source !== window.parent || e.origin !== ORIGIN || !d) return;
    if (d.type === "thk:reset") { if (window.visitReset) window.visitReset(); return; }
    if (d.type === "thk:close") { if (!$("card").hidden) closeCard(true); return; }
    if (d.type === "thk:theme") { applyTheme(d); return; }
    if (d.type === "thk:teams" && Array.isArray(d.picked)) { applyTeams(d); return; }
    if (d.type !== "thk:saved" || !Array.isArray(d.names)) return;
    const open = !$("card").hidden && cardZone >= 0 ? placeName() : null, was = open !== null && saved.has(open);
    saved.clear(); d.names.forEach(n => { if (typeof n === "string") saved.add(n); });
    if (open === null) return;
    const now = saved.has(open);
    if (now === was) return;
    // Changed in the plan (removed there, Clear plan, Reset) while this card is open: the button follows, and a line
    // already showing is brought up to date rather than describing the change before
    updateSave();
    if ($("cardStatus").textContent) cardStatus(now ? open + " is in your plan." : open + " is no longer in your plan.", now);
  });
  post({ type: "thk:ready" });
})();
