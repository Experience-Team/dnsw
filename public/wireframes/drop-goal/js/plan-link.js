// The link to the prototype page (Stage 2). When the game runs inside the prototype (in its Drop goal iframe), Add to
// your plan saves the place to the plan's "Saved, not placed yet" group, and the plan's saves come back here so the
// button always matches the plan. Messages, both ways through postMessage, same origin only (see README, Messages):
//   thk:ready    game -> page  the game has loaded; the page answers with thk:saved
//   thk:save     game -> page  { name, distance_km, route: { start, label, position } }, the §18 fields the game holds
//   thk:unsave   game -> page  { name }
//   thk:saved    page -> game  { names: [...] }, every place from the game in the plan, after any change to the plan
// Opened on its own, nothing answers, and saves stay in this page's memory as before.
(function () {
  if (window.parent === window) return;
  const ORIGIN = location.origin;
  const post = msg => { try { window.parent.postMessage(msg, ORIGIN); } catch (e) {} };
  window.planLink = {
    send(on, i) {
      const R = ROUTES[routeKey], z = R.zones[i];
      if (on) post({ type: "thk:save", name: z[0], distance_km: typeof z[1] === "number" ? z[1] : null,
                     route: { start: startKey, label: R.label, position: i + 1 } });
      else post({ type: "thk:unsave", name: z[0] });
    }
  };
  window.addEventListener("message", e => {
    const d = e.data;
    if (e.source !== window.parent || e.origin !== ORIGIN || !d || d.type !== "thk:saved" || !Array.isArray(d.names)) return;
    const open = !$("card").hidden && landedZone >= 0 ? placeName() : null, was = open !== null && saved.has(open);
    saved.clear(); d.names.forEach(n => { if (typeof n === "string") saved.add(n); });
    if (open === null) return;
    const now = saved.has(open);
    if (now === was) return;
    // Changed in the plan (removed there, Clear plan, Reset) while this card is open: the button follows, and a line
    // already showing is brought up to date rather than describing the change before
    updateSave();
    if ($("cardStatus").textContent) cardStatus(open + (now ? " is in your plan." : " is no longer in your plan."));
  });
  post({ type: "thk:ready" });
})();
