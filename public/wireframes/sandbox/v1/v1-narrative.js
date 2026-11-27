/* The narrative plan page (27 Nov 2026), sandbox only. The trip map was rebuilt the same day: one drawn, interactive map (see
   "The trip map" below and v1-basemap.js); the full-screen day-by-day map no longer opens from it. Once the three questions are answered, the Plan tab reads the way a
   NSW travel expert would talk the trip through: two opening sentences (the dates and matches, then where they are staying,
   each bracketed part a control), one trip map under them, then the days in date order. The days are the existing Around
   your matches list (v1-third-half.js, renderThird), every day open; this file supplies the sentences, the map and the match
   day block (tp.narMatchBody). Transport, route, address and place-to-stay details here are sample data, marked Sample. */
(function () {
  'use strict';
  var tp = window.tpPicker, phone = document.getElementById('tp-phone');
  if (!tp || !phone || !tp.narKit || !window.cnGeo) return;
  var K = tp.narKit, G = window.cnGeo, esc = tp.esc, body = tp.body, reduce = tp.reduce;
  var third = document.getElementById('tp-third'), pick = document.getElementById('tp-pick');
  if (!third || !pick || !pick.parentNode) return;
  var B = G.bounds, BM = window.v1BaseMap || { land: '', lakes: '', names: [] }, IW = 2000, IH = 1000, MAP_H = 280;
  var state = { tab: {}, more: {}, lit: '' };
  tp.narState = state;

  /* ---------- The section: two sentences, then the map ---------- */
  var sec = document.createElement('section');
  sec.className = 'tp-sec v1-nar'; sec.id = 'v1-nar'; sec.tabIndex = -1; sec.setAttribute('aria-labelledby', 'v1-nar-title');
  var ICO = function (d) { return '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var I_EXP = ICO('M9.5 2.5h4v4M13.5 2.5L9 7M6.5 13.5h-4v-4M2.5 13.5L7 9'), I_X = ICO('M3.5 3.5l9 9M12.5 3.5l-9 9'), I_PLUS = ICO('M8 3.5v9M3.5 8h9'), I_MINUS = ICO('M3.5 8h9'), I_DOWN = ICO('M8 3v10M4 9l4 4 4-4');
  var SW = [['plan', 'My plan'], ['ideas', 'Ideas'], ['fans', 'Fan zones and pubs']];
  sec.innerHTML = '<h2 class="visually-hidden" id="v1-nar-title">Your trip</h2>' +
    '<p class="v1-nar-s" id="v1-nar-s1"></p><p class="v1-nar-s" id="v1-nar-s2"></p>' +
    '<div class="v1-tm-sw" role="group" aria-label="Show on the map">' + SW.map(function (x) { return '<button type="button" class="v1-tm-swb" data-tm-sw="' + x[0] + '" aria-pressed="' + (x[0] === 'plan') + '"><i aria-hidden="true"></i>' + x[1] + '</button>'; }).join('') + '</div>' +
    '<div class="v1-tm-slot" id="v1-tm-slot"><div class="v1-tm" id="v1-tm" role="group" aria-label="Trip map" tabindex="-1">' +
    '<svg class="v1-tm-base" aria-hidden="true" focusable="false"><g class="v1-tm-world"><path class="v1-tm-land" d="' + BM.land + '"/><path class="v1-tm-lake" d="' + BM.lakes + '"/></g><g class="v1-tm-routes"></g></svg>' +
    '<div class="v1-tm-over"><div class="v1-tm-names" aria-hidden="true"></div><div class="v1-tm-pins"></div></div>' +
    '<button type="button" class="v1-tm-back" hidden>' + I_DOWN + '<span></span></button>' +
    '<div class="v1-tm-ctl"><button type="button" class="v1-tm-cb" data-tm-full aria-label="Expand the map">' + I_EXP + '</button>' +
    '<button type="button" class="v1-tm-cb" data-tm-zoom="1" aria-label="Zoom in">' + I_PLUS + '</button><button type="button" class="v1-tm-cb" data-tm-zoom="-1" aria-label="Zoom out">' + I_MINUS + '</button></div>' +
    '<button type="button" class="v1-tm-more" data-tm-zoom="1" hidden>Zoom in for more</button><div class="v1-tm-card" role="group" tabindex="-1" hidden></div></div></div>';
  pick.parentNode.insertBefore(sec, pick);
  pick.parentNode.insertBefore(third, pick); // the days follow the map
  var s1 = sec.querySelector('#v1-nar-s1'), s2 = sec.querySelector('#v1-nar-s2');
  var slot = sec.querySelector('#v1-tm-slot'), box = sec.querySelector('#v1-tm'), svg = box.querySelector('.v1-tm-base'), world = box.querySelector('.v1-tm-world'), routesEl = box.querySelector('.v1-tm-routes'),
    over = box.querySelector('.v1-tm-over'), namesEl = box.querySelector('.v1-tm-names'), pins = box.querySelector('.v1-tm-pins'), backEl = box.querySelector('.v1-tm-back'), fullBtn = box.querySelector('[data-tm-full]'),
    moreEl = box.querySelector('.v1-tm-more'), cardEl = box.querySelector('.v1-tm-card'), swEl = sec.querySelector('.v1-tm-sw');

  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function isoLabel(iso) { return K.dayLabel(tp.isoDay(iso)); }
  function nswMatches() { return tp.userMatches().filter(function (m) { return !m.f.a; }); }
  function pinBtn(label, key) { return '<button type="button" class="v1-nar-b" data-nar-pin="' + esc(key) + '">' + esc(label) + '</button>'; }

  /* Where they are going, for the sentence and the map: their NSW matches, and the later rounds inside their days (not assumed) */
  function going() {
    var out = [], seen = {};
    nswMatches().forEach(function (m) { out.push({ label: K.matchName(m.f), venue: m.f.v, maybe: false }); seen[m.key] = true; });
    K.koOnDays().forEach(function (m) { out.push({ label: K.koName(m.f), venue: m.f.v, maybe: true }); });
    return out;
  }
  function noNswTeams() {
    if (nswMatches().length) return [];
    return tp.state.picked.filter(function (n) { return tp.teams[n]; });
  }
  // Those of them that play interstate inside the days: the watch block, and its fan zone on the map
  function watchTeams() {
    return noNswTeams().filter(function (n) { return tp.userMatches().some(function (m) { return m.f.a && m.f.t && m.f.t.split(' v ').indexOf(n) > -1; }); });
  }
  // The fan zone a team with no NSW match is sent to: the nearest to where they stay
  function watchFan() {
    var first = K.placesOf()[0], ll = (first && G.places[first]) || G.places['Sydney CBD'];
    return K.nearestFan(ll);
  }

  function sentences() {
    var t = tp.state.trip || {};
    if (!(t.from && t.to)) { s1.textContent = ''; s2.textContent = ''; return; }
    // Only matches they are assumed to go to, or have added, go after "to see"; the later rounds on in their days have a clause of their own (28 Nov 2026)
    var g = going(), items = g.filter(function (x) { return !x.maybe; }).map(function (x) { return pinBtn(x.label, x.venue); }), later = g.filter(function (x) { return x.maybe; }).map(function (x) { return pinBtn(x.label, x.venue); });
    var tail = items.length ? ' to see ' + list(items) : (noNswTeams().length && !later.length ? ' to follow ' + esc(tp.list(noNswTeams())) : ''), plural = later.length > 1, more = '';
    if (later.length) { if (tail) more = ' ' + list(later) + (plural ? ' are' : ' is') + ' also on while you’re here.'; else tail = ', while ' + list(later) + (plural ? ' are' : ' is') + ' on'; }
    s1.innerHTML = 'It looks like you’re here between <button type="button" class="v1-nar-b" data-nar-days id="v1-nar-d1">' + esc(isoLabel(t.from)) + '</button> and <button type="button" class="v1-nar-b" data-nar-days id="v1-nar-d2">' + esc(isoLabel(t.to)) + '</button>' + tail + '.' + more;
    if (t.base === 'outside') s2.innerHTML = 'You’re <button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p1">staying outside NSW</button>.';
    else if (t.base) s2.innerHTML = 'You’re staying in <button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p1">' + esc(t.base) + '</button>' + (t.base2 ? ' and <button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p2">' + esc(t.base2) + '</button>' : '') + '.';
    else s2.innerHTML = '<button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p1">Add where you’re staying</button>.';
  }

  /* ---------- The trip map (27 Nov 2026): one map, the same closed or expanded ----------
     A drawn base map (v1-basemap.js) under named pins. It pans (drag), zooms (pinch, plus and minus) where it sits, and expanding
     it only makes it bigger and adds a close cross. Three switches above it add or remove pins: My plan (where they stay, each
     ground or fan zone they are going to, anything they have added), Ideas (what the days below offer) and Fan zones and pubs
     (v1-fanspots.js, sample). Every pin shown has its name beside it; a pin whose name has no clear place waits until they zoom in.
     A pin opens a small card: the place, its day, Add or Remove, and Go to this day. */
  function px(ll) { return [(ll[1] - B.lon0) / (B.lon1 - B.lon0) * IW, (B.lat1 - ll[0]) / (B.lat1 - B.lat0) * IH]; }
  /* Zoom is map pixels per screen pixel (1 is about 3.7 km to the centimetre on a phone). S_MIN keeps a trip that takes in
     Newcastle readable, FIT_MAX stops two nearby places being over-zoomed when the map frames itself, S_MAX is as close as
     the drawing is worth looking at. Framed by itself, nothing sits closer than EDGE to the map's edge or under the controls. */
  var S_MIN = .3, S_MAX = 32, FIT_MAX = 10, EDGE = 24, CTL = 44, NEAR_KM = 40;
  var X0 = px([0, 150.3])[0], X1 = px([0, 152.6])[0], Y0 = px([-32.45, 0])[1], Y1 = px([-34.75, 0])[1];
  var sw = { plan: true, ideas: false, fans: false }, cam = null, userMoved = false, full = false, busy = false;
  var card = null, back = null, ownSig = '', lastW = 0, lastH = 0, L = null, P0 = [], pinEls = {}, side = {};
  var SPOTS = window.v1FanSpots || [], KINDS = window.v1FanKinds || {};

  // The other city's ground, its stops and its dotted route: drawn when it is part of the plan (they stay near it) or has just been
  // asked for with "Show route on map"; otherwise the map frames only their own places
  function stayNear(venue) {
    var v = G.venues[venue];
    return !!v && K.placesOf().some(function (n) { return G.places[n] && K.kmBetween(G.places[n], v) <= NEAR_KM; });
  }
  function showExtra(r) { return state.lit === r.venue || stayNear(r.venue); }
  function isAdded(id) { return tp.state.added.some(function (x) { return x.id === id; }); }
  function spotById(id) { return SPOTS.filter(function (s) { return s.id === id; })[0]; }
  // Where something they have added sits: a product, a made-up place, an idea, a fan zone or pub, a screening venue
  function addedLL(x) {
    var id = String(x.id || '');
    if (x.kind === 'poi') { var q = (window.cnMapPoi && window.cnMapPoi.pois || []).filter(function (p) { return p.id === x.poi; })[0]; return q ? q.ll : null; }
    if (x.kind === 'product') return (G.products || {})[id.split(':')[1]] || null;
    if (id.indexOf('fz:') === 0) { var sp = spotById(id.split(':')[1]); return sp ? sp.ll : null; }
    if (id.indexOf('w:') === 0) return (G.watch || [])[+id.split(':')[1]] || null;
    if (id.indexOf('i:') === 0) return (G.ideas || {})[id.replace(/^i:/, '').replace(/@.*$/, '')] || null;
    if (id.indexOf('stay:') === 0) return G.places[x.place] || null; // a sample place to stay sits at its suburb
    return null;
  }
  function dayNum(label) { var d = tp.dayOf ? tp.dayOf(label) : null; return typeof d === 'number' && !isNaN(d) ? d : null; }
  // The day a fan zone or pub would go on: their first NSW match day near it, or else their first day
  function spotDay(sp) {
    var near = nswMatches().filter(function (m) { return G.venues[m.f.v] && K.kmBetween(G.venues[m.f.v], sp.ll) <= NEAR_KM; })[0], t = tp.state.trip || {};
    return near ? near.day : t.from ? tp.isoDay(t.from) : null;
  }
  function spotItem(sp, d) {
    var dl = K.dayLabel(d), id = 'fz:' + sp.id + ':' + dl;
    return { id: id, kind: 'place', title: sp.name, kindLabel: KINDS[sp.kind] || 'Fan zone', place: sp.suburb, note: sp.opens, day: dl };
  }
  function mapPoints() {
    var P = [], names = {};
    function add(p) { if (!p.ll || names[p.label]) return; names[p.label] = 1; p.w = px(p.ll); P.push(p); }
    var t = tp.state.trip || {};
    K.placesOf().forEach(function (n) { if (G.places[n]) add({ kind: 'stay', key: 'stay|' + n, lit: n, label: n, ll: G.places[n], own: 1 }); });
    var extras = [];
    if (sw.plan) {
      var seenV = {};
      going().forEach(function (x) { if (!seenV[x.venue] && G.venues[x.venue]) { seenV[x.venue] = 1; add({ kind: x.maybe ? 'maybe' : 'stadium', key: x.venue, lit: x.venue, label: x.venue, ll: G.venues[x.venue], own: 1, going: 1 }); } });
      if (watchTeams().length) { var fz = watchFan(); if (fz) add({ kind: 'fan', key: 'fan|' + fz.name, lit: fz.name, label: fz.name, ll: fz.ll, own: 1, going: 1, fan: fz }); }
      // Another match while they are here, in the other city: its ground, and the stops on the way (sample), joined by a dashed route
      (tp.narRoutes ? tp.narRoutes() : []).forEach(function (r) {
        if (!G.venues[r.venue] || !showExtra(r) || seenV[r.venue]) return;
        var far = K.placesOf().some(function (n) { return G.places[n] && K.kmBetween(G.places[n], G.venues[r.venue]) > NEAR_KM; }), st = far ? r.stops : [];
        seenV[r.venue] = 1; add({ kind: 'extra', key: r.venue, lit: r.venue, label: r.venue, ll: G.venues[r.venue], own: 1, going: 1, stops: st.map(function (x) { return 'stop|' + x.name; }) });
        st.forEach(function (x) { add({ kind: 'stop', key: 'stop|' + x.name, label: x.name, ll: x.ll, own: 1 }); });
      });
      // Anything they have added that has a place
      tp.state.added.forEach(function (x) {
        if (x.kind === 'match') return;
        var ll = addedLL(x); if (!ll) return;
        if (names[x.title]) { var q = P.filter(function (p) { return p.label === x.title && p.items; })[0]; if (q) q.items.push(x); return; }
        add({ kind: 'added', key: 'it|' + x.title, lit: x.title, label: x.title, ll: ll, own: 1, items: [x] });
      });
    }
    if (sw.ideas && tp.mapStops) tp.mapStops().forEach(function (st) {
      st.items.forEach(function (i) {
        if (!i.ll || /^w:/.test(i.key) || st.kind === 'ko') return;
        var it = K.item(i.key); if (!it || isAdded(it.id)) return;
        add({ kind: 'idea', key: 'it|' + i.title, lit: i.title, label: i.title, ll: i.ll, idea: Object.assign({}, it), type: i.type, d: st.day });
      });
    });
    if (sw.fans) SPOTS.forEach(function (sp) { add({ kind: 'spot', key: 'it|' + sp.name, lit: sp.name, label: sp.name, ll: sp.ll, spot: sp }); });
    // The pin whose card is open stays while the card does, so a Remove can be undone where it was pressed
    if (card && card.p && !P.some(function (p) { return p.key === card.key; })) { var g = Object.assign({}, card.p, { ghost: 1 }); delete names[g.label]; add(g); }
    return P;
  }

  /* ---- Sizes: a label's real size, measured once with the page's own font (and again when the fonts arrive) ---- */
  var meas = null, sizes = {};
  function sizeOf(cls, text) {
    var k = cls + '|' + text; if (sizes[k]) return sizes[k];
    if (!meas) { meas = document.createElement('div'); meas.className = 'v1-tm-meas'; meas.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none'; box.appendChild(meas); }
    meas.innerHTML = cls.indexOf('v1-tm-nm') === 0 ? '<span class="' + cls + '">' + esc(text) + '</span>' : '<span class="v1-tm-pin ' + cls + '"><b>' + esc(text) + '</b></span>';
    var b = meas.querySelector('b') || meas.firstChild; return (sizes[k] = { w: b.offsetWidth, h: b.offsetHeight });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { sizes = {}; relayout(); });

  /* ---- Layout at zoom s, in zoomed map pixels (so a pan never changes it) ----
     Their own places first: one on top of another moves to the nearest free spot, and each label takes the first place that touches
     no other label or pin (right, left, then below or above them, then under or over the pin). Then the switched-on pins, one at a
     time: a pin is shown only if it and its name fit without touching anything already placed; the rest wait for a closer zoom.
     Last, the base map's own names, only where nothing else is. */
  var ORDER = { stay: 0, stadium: 1, fan: 2, maybe: 3, extra: 4, added: 5, stop: 6, idea: 8, spot: 9 };
  function rad(p) { return p.kind === 'stop' ? 5 : 9.5; }
  function hit(a, b, g) { g = g || 0; return a[0] - g < b[2] && a[2] + g > b[0] && a[1] - g < b[3] && a[3] + g > b[1]; }
  function cands(o, z) {
    var w = z.w, h = z.h, g = o.p.kind === 'stop' ? 8 : 12;
    return [[g, -h / 2], [-g - w, -h / 2], [g, h / 2 - 2], [-g - w, h / 2 - 2], [g, -h / 2 - h + 2], [-g - w, -h / 2 - h + 2], [-w / 2, 12], [-w / 2, -12 - h]];
  }
  function layout(s, P) {
    var it = P.map(function (p) { return { p: p, u: p.w[0] * s, v: p.w[1] * s, lab: null, hide: false, pri: (state.lit && p.lit === state.lit) || (card && card.key === p.key) ? (p.own ? ORDER[p.kind] : 7) : ORDER[p.kind] }; });
    var order = it.slice().sort(function (a, b) { return a.pri - b.pri; });
    var own = order.filter(function (o) { return o.p.own; }), opt = order.filter(function (o) { return !o.p.own; });
    var NUD = [[0, 20], [0, -20], [22, 0], [-22, 0], [16, 16], [-16, 16], [16, -16], [-16, -16], [0, 40], [0, -40]], done = [];
    own.forEach(function (o) {
      var u0 = o.u, v0 = o.v;
      function free() { return done.every(function (q) { return Math.hypot(q.u - o.u, q.v - o.v) >= rad(o.p) + rad(q.p) + 3; }); }
      if (!free()) for (var k = 0; k < NUD.length; k++) { o.u = u0 + NUD[k][0]; o.v = v0 + NUD[k][1]; if (free()) break; if (k === NUD.length - 1) { o.u = u0; o.v = v0; } }
      done.push(o);
    });
    function circ(o) { var r = rad(o.p); return [o.u - r, o.v - r, o.u + r, o.v + r]; }
    var circs = own.map(circ), placed = [];
    function place(o, must) {
      var z = sizeOf('is-' + o.p.kind, o.p.label), c = cands(o, z), mine = circ(o), best = null, bestA = 1e9, pref = side[o.p.key];
      var idx = c.map(function (x, i) { return i; }); if (pref !== undefined && pref < c.length) { idx.splice(idx.indexOf(pref), 1); idx.unshift(pref); }
      for (var n = 0; n < idx.length; n++) {
        var k = idx[n], r = [o.u + c[k][0], o.v + c[k][1], o.u + c[k][0] + z.w, o.v + c[k][1] + z.h], a = 0;
        placed.forEach(function (q) { if (hit(r, q, 1)) a += 100; });
        circs.forEach(function (q) { if (q !== mine && !(q[0] === mine[0] && q[1] === mine[1]) && hit(r, q, 2)) a += 100; });
        if (a < bestA) { bestA = a; best = { dx: c[k][0], dy: c[k][1], r: r, k: k }; }
        if (!a) break;
      }
      if (best && (bestA === 0 || must)) { o.lab = best; placed.push(best.r); side[o.p.key] = best.k; return true; }
      return false;
    }
    own.forEach(function (o) { if (!place(o, o.p.kind !== 'stop')) o.lab = null; });
    var bb = [1e9, 1e9, -1e9, -1e9];
    circs.concat(placed).forEach(function (q) { bb[0] = Math.min(bb[0], q[0]); bb[1] = Math.min(bb[1], q[1]); bb[2] = Math.max(bb[2], q[2]); bb[3] = Math.max(bb[3], q[3]); });
    var held = 0;
    opt.forEach(function (o) {
      var mine = circ(o);
      if (circs.some(function (q) { return hit(mine, q, 3); }) || placed.some(function (q) { return hit(mine, q, 2); })) { o.hide = true; held++; return; }
      circs.push(mine);
      if (!place(o, false)) { circs.pop(); o.hide = true; held++; }
    });
    // The base map's names: a quiet layer under everything, dropped wherever a pin or its name is, or where a pin already says it
    var said = {}; P.forEach(function (p) { said[p.label.toLowerCase()] = 1; });
    var nm = [];
    BM.names.forEach(function (n) {
      if (s < n[3] || s >= n[4] || said[n[0].toLowerCase()]) return;
      var z = sizeOf('v1-tm-nm is-' + n[5], n[0]), u = n[1] * s, v = n[2] * s, r = [u - z.w / 2, v - z.h / 2, u + z.w / 2, v + z.h / 2];
      if (placed.some(function (q) { return hit(r, q, 4); }) || circs.some(function (q) { return hit(r, q, 4); })) return;
      placed.push(r); nm.push({ n: n, u: u, v: v, w: z.w, h: z.h });
    });
    return { s: s, it: it, names: nm, bb: bb, held: held };
  }

  /* ---- Framing: their own places, as close as FIT_MAX allows, then out in steps until pins and names sit inside the margin ---- */
  function fitSet(P) { return P.filter(function (p) { return p.own && !p.ghost; }); }
  function fitCam(P, W, H) {
    var F = fitSet(P), aw = W - 2 * EDGE - CTL, ah = H - 2 * EDGE;
    if (!F.length) { var c0 = px(G.places['Sydney CBD'] || [-33.87, 151.21]); return clampCam({ x: c0[0], y: c0[1], s: 4 }, W, H); }
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    F.forEach(function (p) { x0 = Math.min(x0, p.w[0]); x1 = Math.max(x1, p.w[0]); y0 = Math.min(y0, p.w[1]); y1 = Math.max(y1, p.w[1]); });
    var lo = minS(W, H), s = Math.max(lo, Math.min(FIT_MAX, (aw - 20) / Math.max(x1 - x0, .01), (ah - 20) / Math.max(y1 - y0, .01))), R;
    for (;;) {
      R = layout(s, F);
      if ((R.bb[2] - R.bb[0] <= aw && R.bb[3] - R.bb[1] <= ah) || s <= lo + 1e-6) break;
      s = Math.max(lo, s * .94);
    }
    // The middle of what is drawn sits in the middle of the room left of the controls
    return clampCam({ x: (R.bb[0] + R.bb[2]) / 2 / s + CTL / 2 / s, y: (R.bb[1] + R.bb[3]) / 2 / s, s: s }, W, H);
  }
  function minS(W, H) { return Math.max(S_MIN, H / (Y1 - Y0)); }
  function clampCam(c, W, H) {
    c.s = Math.max(minS(W, H), Math.min(S_MAX, c.s));
    var hw = W / 2 / c.s, hh = H / 2 / c.s;
    c.x = X1 - X0 > 2 * hw ? Math.max(X0 + hw, Math.min(X1 - hw, c.x)) : Math.max(X0, Math.min(X1, c.x));
    c.y = Y1 - Y0 > 2 * hh ? Math.max(Y0 + hh, Math.min(Y1 - hh, c.y)) : (Y0 + Y1) / 2;
    return c;
  }

  /* ---- Drawing ---- */
  function size() { return [box.clientWidth, box.clientHeight || MAP_H]; }
  function relayout() { if (!cam) return; L = null; apply(); }
  function apply() {
    var z = size(), W = z[0], H = z[1]; if (!W || !cam) return;
    var tx = Math.round(W / 2 - cam.x * cam.s), ty = Math.round(H / 2 - cam.y * cam.s);
    world.setAttribute('transform', 'translate(' + tx + ' ' + ty + ') scale(' + cam.s.toFixed(5) + ')');
    routesEl.setAttribute('transform', 'translate(' + tx + ' ' + ty + ')');
    over.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
    if (!L || L.s !== cam.s) { L = layout(cam.s, P0); paint(); }
    // A base map name cut by the map's edge, or under its controls, is left out (a pin's name is not: it can be panned to)
    var ox = tx, oy = ty, kids = namesEl.children;
    L.names.forEach(function (n, i) {
      var l = n.u - n.w / 2 + ox, t = n.v - n.h / 2 + oy, r = l + n.w, bt = t + n.h, pad = full ? 16 : 8;
      var cut = l < 4 || r > W - 4 || t < 4 || bt > H - 4 || (r > W - pad - 40 && t < pad + 124) || (back && l < 180 && t < pad + 40);
      if (kids[i]) kids[i].style.visibility = cut ? 'hidden' : '';
    });
    // The same for a switched-on pin (an idea, a fan zone or pub) whose name would be cut: it shows once it is clear of the edge
    L.it.forEach(function (o) {
      if (o.hide || o.p.own || !o.lab || !pinEls[o.p.key]) return;
      var l = o.lab.r[0] + ox, t = o.lab.r[1] + oy, r = o.lab.r[2] + ox, bt = o.lab.r[3] + oy, x = o.u + ox, y = o.v + oy, pad = full ? 16 : 8;
      var inView = r > 0 && l < W && bt > 0 && t < H, cut = inView && (l < 4 || r > W - 4 || t < 4 || bt > H - 4 || (r > W - pad - 40 && t < pad + 124 && bt > pad));
      pinEls[o.p.key].style.visibility = cut && !(card && card.key === o.p.key) ? 'hidden' : '';
    });
  }
  function pinClass(o) {
    var p = o.p, lit = state.lit && state.lit === p.lit, sel = card && card.key === p.key;
    return 'v1-tm-pin is-' + p.kind + (p.spot ? ' is-' + (p.spot.kind === 'fan_zone' || p.spot.kind === 'fan_village' ? 'fz' : 'pub') : '') + (p.ghost ? ' is-ghost' : '') + (lit || sel ? ' is-lit' : '') + ((state.lit || card) && !lit && !sel ? ' is-dim' : '');
  }
  function pinLabel(p) {
    var what = { stay: 'where you’re staying', stadium: 'stadium, on your plan', maybe: 'stadium, a later round is on', fan: 'fan zone, on your plan', extra: 'stadium', added: 'on your plan', idea: 'idea', stop: 'stop on the way' }[p.kind] || (p.spot ? (KINDS[p.spot.kind] || 'Fan zone').toLowerCase() : '');
    return p.label + ', ' + what;
  }
  function paint() {
    var seen = {};
    L.it.forEach(function (o) {
      if (o.hide) return;
      var k = o.p.key, el = pinEls[k]; seen[k] = 1;
      if (!el) {
        el = pinEls[k] = document.createElement(o.p.kind === 'stop' ? 'span' : 'button');
        if (o.p.kind !== 'stop') { el.type = 'button'; el.setAttribute('aria-haspopup', 'dialog'); }
        el.dataset.pin = k; el.innerHTML = '<i></i><b></b>'; pins.appendChild(el);
      }
      el.className = pinClass(o);
      if (o.p.kind !== 'stop') el.setAttribute('aria-label', pinLabel(o.p));
      el.style.left = o.u.toFixed(1) + 'px'; el.style.top = o.v.toFixed(1) + 'px';
      var b = el.lastChild;
      if (b.textContent !== o.p.label) b.textContent = o.p.label;
      b.hidden = !o.lab;
      if (o.lab) { b.style.left = o.lab.dx.toFixed(1) + 'px'; b.style.top = o.lab.dy.toFixed(1) + 'px'; }
    });
    Object.keys(pinEls).forEach(function (k) { if (!seen[k]) { if (pinEls[k].contains(document.activeElement)) box.focus({ preventScroll: true }); pinEls[k].remove(); delete pinEls[k]; } });
    namesEl.innerHTML = L.names.map(function (n) { return '<span class="v1-tm-nm is-' + n.n[5] + '" style="left:' + (n.u - n.w / 2).toFixed(1) + 'px;top:' + (n.v - n.h / 2).toFixed(1) + 'px">' + esc(n.n[0]) + '</span>'; }).join('');
    // The route between: from the nearer place they stay to each ground (or the fan zone)
    var shown = L.it.filter(function (o) { return !o.hide; }), stays = shown.filter(function (o) { return o.p.kind === 'stay'; }), lines = '';
    shown.forEach(function (o) {
      if (!o.p.going || !stays.length) return;
      var lit = state.lit && state.lit === o.p.lit;
      if (o.p.kind === 'extra') {
        var away = stays.filter(function (z) { return K.kmBetween(z.p.ll, o.p.ll) > NEAR_KM; });
        if (!away.length) return; // they stay by that ground: nothing to join
        var f0 = away.sort(function (a, b) { return Math.hypot(a.u - o.u, a.v - o.v) - Math.hypot(b.u - o.u, b.v - o.v); })[0], d = 'M' + f0.u.toFixed(1) + ' ' + f0.v.toFixed(1);
        (o.p.stops || []).forEach(function (k) { var q = shown.filter(function (z) { return z.p.key === k; })[0]; if (q) d += ' L' + q.u.toFixed(1) + ' ' + q.v.toFixed(1); });
        lines += '<path class="v1-tm-route is-extra' + (lit ? ' is-lit' : '') + '" d="' + d + ' L' + o.u.toFixed(1) + ' ' + o.v.toFixed(1) + '"/>';
        return;
      }
      var from = stays.slice().sort(function (a, b) { return Math.hypot(a.u - o.u, a.v - o.v) - Math.hypot(b.u - o.u, b.v - o.v); })[0], len = Math.hypot(from.u - o.u, from.v - o.v);
      if (len < 24) return; // staying at the ground: nothing to draw
      var mx = (from.u + o.u) / 2, my = (from.v + o.v) / 2 - Math.min(30, len * .18);
      lines += '<path class="v1-tm-route' + (o.p.kind === 'maybe' ? ' is-maybe' : '') + (lit ? ' is-lit' : '') + '" d="M' + from.u.toFixed(1) + ' ' + from.v.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + o.u.toFixed(1) + ' ' + o.v.toFixed(1) + '"/>';
    });
    routesEl.innerHTML = lines;
    moreEl.hidden = !L.held || !!card;
  }
  /* ---- Camera moves: every one glides (ease in and out), or jumps with reduced motion ---- */
  var anim = 0, gliding = false;
  function anim0() { return gliding; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function glide(to, ms, step, done) {
    cancelAnimationFrame(anim); gliding = false;
    if (reduce.matches || !cam) { cam = to; if (step) step(1); apply(); if (done) done(); return; }
    gliding = true;
    var from = { x: cam.x, y: cam.y, s: cam.s }, t0 = performance.now(), l0 = Math.log(from.s), l1 = Math.log(to.s);
    (function frame(now) {
      var t = Math.min(1, (now - t0) / ms), e = ease(t);
      cam = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, s: Math.exp(l0 + (l1 - l0) * e) };
      if (step) step(e);
      apply();
      if (t < 1) anim = requestAnimationFrame(frame); else { gliding = false; if (done) done(); }
    })(t0);
  }
  function zoomBy(f, at) {
    var z = size(), W = z[0], H = z[1], ax = at ? at[0] : W / 2, ay = at ? at[1] : H / 2;
    var s = Math.max(minS(W, H), Math.min(S_MAX, cam.s * f)), wx = cam.x + (ax - W / 2) / cam.s, wy = cam.y + (ay - H / 2) / cam.s;
    return clampCam({ s: s, x: wx - (ax - W / 2) / s, y: wy - (ay - H / 2) / s }, W, H);
  }
  // Bring a pin into the clear part of the map (inside the margin, left of the controls, above an open card) with the least movement
  function reveal(key, ms) {
    var z = size(), W = z[0], H = z[1], p = P0.filter(function (q) { return q.key === key; })[0]; if (!p || !cam) return;
    var o = L && L.it.filter(function (q) { return q.p.key === key; })[0];
    var to = { x: cam.x, y: cam.y, s: cam.s };
    if (o && o.hide) to = zoomBy(Math.min(S_MAX / cam.s, 2.5)); // its name had no room: closer
    // The pin with its name, as a box on the screen; moved only as far as it takes to clear the margin, the controls and an open card
    var sx = W / 2 + (p.w[0] - to.x) * to.s, sy = H / 2 + (p.w[1] - to.y) * to.s, lw = sizeOf('is-' + p.kind, p.label).w + 14;
    var bx = o && o.lab && !o.hide && to.s === cam.s ? [Math.min(-10, o.lab.dx), Math.min(-10, o.lab.dy), Math.max(10, o.lab.dx + lw - 14), Math.max(10, o.lab.dy + 18)] : [-10, -10, lw + 10, 10];
    var l = EDGE, r = W - EDGE - CTL, t = EDGE + (back ? 28 : 0), b = H - EDGE - (card && !cardEl.hidden ? cardEl.offsetHeight + 4 : 0);
    var nx = sx, ny = sy;
    if (sx + bx[2] > r) nx = r - bx[2]; if (nx + bx[0] < l) nx = l - bx[0];
    if (sy + bx[3] > b) ny = b - bx[3]; if (ny + bx[1] < t) ny = t - bx[1];
    if (o && o.hide) { nx = (l + r) / 2 - lw / 2; ny = (t + b) / 2; }
    to.x -= (nx - sx) / to.s; to.y -= (ny - sy) / to.s; clampCam(to, W, H);
    if (Math.abs(to.x - cam.x) * cam.s > 1 || Math.abs(to.y - cam.y) * cam.s > 1 || to.s !== cam.s) glide(to, ms || 320);
  }

  function draw() {
    var z = size(), W = z[0], H = z[1]; if (!W || busy) return;
    P0 = mapPoints();
    var F = fitSet(P0), sig = F.map(function (p) { return p.kind + p.key; }).join(','), resized = W !== lastW || H !== lastH;
    lastW = W; lastH = H;
    if (!cam) { cam = fitCam(P0, W, H); ownSig = sig; }
    else if (sig !== ownSig && !card) { ownSig = sig; userMoved = false; L = null; glide(fitCam(P0, W, H), 420); } // not while a card is open: a Remove there must not move the map from under it
    else if (resized) { if (userMoved) clampCam(cam, W, H); else cam = fitCam(P0, W, H); }
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    L = null; apply();
    if (card) cardDraw();
  }
  // Tapping away from a route that was asked for brings the map back to their own places (a lit stadium or day keeps its own toggle)
  document.addEventListener('click', function (e) {
    if (!state.lit) return;
    var r = (tp.narRoutes ? tp.narRoutes() : []).filter(function (x) { return x.venue === state.lit; })[0];
    if (!r || stayNear(r.venue) || going().some(function (x) { return x.venue === r.venue; })) return;
    if (e.target.closest && e.target.closest('[data-nar-route], [data-nar-onmap], [data-nar-pin], [data-nar-day], #v1-tm')) return;
    state.lit = ''; draw();
  });
  // Highlight a pin: it is ringed, the others' dots step back, and the map moves only as far as it takes to show it
  function light(key, reframe) {
    state.lit = key || '';
    draw();
    if (!key) return;
    // Asked for from a day (Show on map): the map goes back to framing their places, so the pin is seen in its setting
    if (reframe) { var z = size(); userMoved = false; glide(fitCam(P0, z[0], z[1]), 420); return; }
    var p = P0.filter(function (q) { return q.lit === key; })[0];
    if (p) reveal(p.key, 420);
  }
  function highlight(key) { light(state.lit === key ? '' : key); }
  tp.narHighlight = function (key) { light(key); };
  if (window.ResizeObserver) new ResizeObserver(function () { if (!busy) draw(); }).observe(box);

  /* ---- The three switches ---- */
  swEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tm-sw]'); if (!b) return;
    var k = b.dataset.tmSw; sw[k] = !sw[k]; b.setAttribute('aria-pressed', String(sw[k]));
    if (card && !sw[k]) cardClose(false);
    draw();
    var n = P0.filter(function (p) { return k === 'plan' ? p.own && p.kind !== 'stay' : p.kind === (k === 'ideas' ? 'idea' : 'spot'); });
    tp.say(b.textContent + (sw[k] ? ' shown on the map, ' + n.length + (n.length === 1 ? ' place.' : ' places.') : ' hidden on the map.'));
    if (!sw[k] || !n.length || k === 'plan') return;
    // Turned on with none of its pins in view: pull back just far enough to bring the nearest in beside their own places
    var z = size(), W = z[0], H = z[1], vis = function (p) { var x = W / 2 + (p.w[0] - cam.x) * cam.s, y = H / 2 + (p.w[1] - cam.y) * cam.s; return x > EDGE && x < W - EDGE - CTL && y > EDGE && y < H - EDGE; };
    if (n.some(vis)) return; // one is here already, shown or waiting for a closer zoom (the map says so)
    var c = [cam.x, cam.y], near = n.slice().sort(function (a, b) { return Math.hypot(a.w[0] - c[0], a.w[1] - c[1]) - Math.hypot(b.w[0] - c[0], b.w[1] - c[1]); })[0];
    var F = fitSet(P0).concat([Object.assign({}, near, { own: 1 })]), to = fitCam(F, W, H);
    glide(to, 420);
  });

  /* ---- A pin's card: the place, its day, Add or Remove, Go to this day ---- */
  function rangeText() { var t = tp.state.trip || {}; return t.from && t.to ? isoLabel(t.from) + ' to ' + isoLabel(t.to) : ''; }
  function matchItem(m) { var f = m.f; return { id: 'm:' + m.key, kind: 'match', key: m.key, title: f.t ? K.matchName(f) : K.koName(f), kindLabel: 'Match', day: f.d, place: f.v + ', ' + f.p }; }
  function cardFor(p) {
    var c = { key: p.key, p: p, title: p.label, meta: '', rows: [] }, t = tp.state.trip || {};
    if (p.kind === 'stay') { c.meta = 'Where you’re staying' + (rangeText() ? ' · ' + rangeText() : ''); c.rows.push({ d: t.from ? tp.isoDay(t.from) : null, go: 'Go to your first day', quiet: 1 }); }
    else if (p.kind === 'stadium' || p.kind === 'maybe' || p.kind === 'extra') {
      c.meta = 'Stadium' + (window.cnMapPoi && window.cnMapPoi.near[p.label] ? ' · ' + window.cnMapPoi.near[p.label] : '');
      var ms = nswMatches().filter(function (m) { return m.f.v === p.label; }).concat(K.koOnDays().filter(function (m) { return m.f.v === p.label; })), seen = {};
      if (p.kind === 'extra') ms = ms.concat((tp.narRoutes ? tp.narRoutes() : []).filter(function (r) { return r.venue === p.label && r.m; }).map(function (r) { return r.m; }));
      ms.forEach(function (m) { if (seen[m.key]) return; seen[m.key] = 1; c.rows.push({ name: m.f.t ? K.matchName(m.f) : K.koName(m.f), d: m.day, match: m }); });
      c.rows.sort(function (a, b) { return a.d - b.d; });
    } else if (p.kind === 'fan') {
      c.meta = (p.fan.kind === 'fan_village' ? 'Fan village' : 'Fan zone') + ' · ' + p.fan.suburb; c.sample = 1;
      var aw = tp.userMatches().filter(function (m) { return m.f.a; })[0];
      c.rows.push({ note: 'Where to watch ' + tp.list(watchTeams()) + ' while you’re here', d: aw ? aw.day : null });
    } else if (p.kind === 'added') {
      c.meta = p.items[0].kindLabel || ''; c.sample = /^(fz|stay|w):/.test(p.items[0].id);
      p.items.forEach(function (x) { c.rows.push({ d: dayNum(x.day), item: Object.assign({}, x) }); });
    } else if (p.kind === 'idea') { c.meta = p.type || p.idea.kindLabel || ''; c.rows.push({ d: p.d, item: p.idea }); }
    else if (p.kind === 'spot') { var d = spotDay(p.spot); c.meta = (KINDS[p.spot.kind] || 'Fan zone') + ' · ' + p.spot.suburb; c.sample = 1; c.rows.push({ d: d, item: d === null ? null : spotItem(p.spot, d) }); }
    return c;
  }
  function rowOn(r) {
    if (r.match) return isAdded('m:' + r.match.key) || nswMatches().some(function (m) { return m.key === r.match.key; });
    return r.item ? isAdded(r.item.id) : null;
  }
  function cardDraw() {
    var c = card, keep = document.activeElement && cardEl.contains(document.activeElement) ? document.activeElement.getAttribute('data-k') : null;
    var h = '<button type="button" class="v1-tm-cx" data-tm-cardx aria-label="Close ' + esc(c.title) + '">' + I_X + '</button>' +
      '<p class="v1-tm-ct">' + esc(c.title) + '</p>' + (c.meta ? '<p class="v1-tm-cm">' + esc(c.meta) + (c.sample ? ' <span class="v1-sample provenance-gap">Sample</span>' : '') + '</p>' : '');
    c.rows.forEach(function (r, i) {
      var on = rowOn(r), dl = r.d !== null && r.d !== undefined ? K.dayLabel(r.d) : '';
      var line = r.quiet ? '' : r.note ? r.note : (r.name ? '<b>' + esc(r.name) + '</b> · ' : '') + (on === null ? esc(dl) : on ? 'On your plan, ' + esc(dl) : (r.name ? esc(dl) + ', not on your plan' : 'An idea for ' + esc(dl)));
      h += '<div class="v1-tm-cr">' + (line ? '<p class="v1-tm-cd">' + line + '</p>' : '') + '<div class="v1-tm-ca">' +
        (on === null ? '' : '<button type="button" class="v1-tm-btn' + (on ? '' : ' is-add') + '" data-tm-tog="' + i + '" data-k="t' + i + '">' + (on ? 'Remove' : 'Add') + '<span class="visually-hidden"> ' + esc(r.name || c.title) + (on ? ' from' : ' to') + ' your plan' + (dl ? ', ' + esc(dl) : '') + '</span></button>') +
        (dl ? '<button type="button" class="v1-tm-btn is-go" data-tm-go="' + r.d + '" data-k="g' + i + '">' + (r.go || 'Go to this day') + (c.rows.length > 1 ? '<span class="visually-hidden">, ' + esc(dl) + '</span>' : '') + '</button>' : '') + '</div></div>';
    });
    cardEl.innerHTML = h; cardEl.setAttribute('aria-label', c.title);
    if (keep) { var again = cardEl.querySelector('[data-k="' + keep + '"]'); if (again) again.focus({ preventScroll: true }); }
  }
  function cardOpen(key) {
    var p = P0.filter(function (q) { return q.key === key; })[0]; if (!p || p.kind === 'stop') return;
    card = cardFor(p); cardEl.hidden = false; cardDraw();
    if (!reduce.matches && cardEl.animate) cardEl.animate([{ transform: 'translateY(12px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.4, 0, .2, 1)' });
    L = null; apply();
    cardEl.focus({ preventScroll: true });
    card.from = userMoved ? null : { x: cam.x, y: cam.y, s: cam.s };
    reveal(key, 320);
    tp.say(card.title + ', details opened.');
  }
  function cardClose(refocus) {
    if (!card) return;
    var k = card.key, from = card.from; card = null; cardEl.hidden = true; cardEl.innerHTML = '';
    draw();
    // The map had only moved to keep the pin clear of the card: it goes back (unless their places changed, which reframes it anyway)
    if (from && !userMoved && !busy && !anim0()) glide(from, 320);
    if (refocus) { var el = pinEls[k] || box; el.focus({ preventScroll: true }); }
  }
  cardEl.addEventListener('click', function (e) {
    e.stopPropagation(); // the card redraws under the press, so nothing above it may read this as a tap on the map
    var b = e.target.closest('button'); if (!b || !card) return;
    if (b.hasAttribute('data-tm-cardx')) { cardClose(true); return; }
    if (b.dataset.tmGo !== undefined) { goDay(+b.dataset.tmGo); return; }
    if (b.dataset.tmTog !== undefined) {
      var r = card.rows[+b.dataset.tmTog], on = rowOn(r), name = r.name || card.title, dl = K.dayLabel(r.d);
      if (r.match) { if (on) tp.dropMatch(r.match.key); else tp.addItem(matchItem(r.match)); }
      else if (on) tp.removeItem(r.item.id); else tp.addItem(Object.assign({}, r.item));
      draw(); // the change shows here: the button turns, the pin fills or empties
      tp.say(name + (on ? ' removed from your plan.' : ' added to your plan, ' + dl + '.'));
    }
  });
  // Go to this day: the page moves to that day (the label says so), the map closing first if it was expanded
  function goDay(d) {
    var key = tp.narBlockKey ? tp.narBlockKey(d) : null, el = key && document.getElementById('v1-blk-' + key);
    if (!el) { tp.say('That day is outside your days.'); return; }
    var go = function () {
      cardClose(false);
      scrollTo(el, 12);
      var h = el.querySelector('.v1-nar-dh'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    };
    if (full) setFull(false, go); else go();
  }

  /* ---- Back to [day]: after Show on map has brought them up here ---- */
  function backSet(b) {
    var blk = b.closest('.v1-nar-blk'), d = blk ? parseInt(String(blk.dataset.blk).replace(/^\D+/, ''), 10) : NaN;
    back = { top: body.scrollTop, opener: b, label: isNaN(d) ? 'where you were' : K.dayLabel(d) };
    backEl.querySelector('span').textContent = 'Back to ' + back.label; backEl.hidden = false;
  }
  function backClear() { back = null; backEl.hidden = true; }
  backEl.addEventListener('click', function () {
    if (!back) return;
    var b = back; backClear();
    var go = function () { body.scrollTo({ top: b.top, behavior: reduce.matches ? 'auto' : 'smooth' }); if (b.opener && b.opener.isConnected) b.opener.focus({ preventScroll: true }); };
    if (full) setFull(false, go); else go();
  });
  // Scrolled back down there themselves: the link has done its job
  body.addEventListener('scroll', function () { if (!back || full) return; var far = Math.abs(body.scrollTop - back.top); if (far > 200) back.away = true; else if (back.away && far < 80) backClear(); }, { passive: true });

  /* ---- Expand and close: the same map, bigger. It grows from where it sits and shrinks back into it ---- */
  var behind = [];
  function setFull(v, then) {
    if (v === full || busy) { if (then) then(); return; }
    var z = size(), r0 = box.getBoundingClientRect(), pr = phone.getBoundingClientRect(), sr = slot.getBoundingClientRect();
    function swap(on) {
      full = on; box.classList.toggle('is-full', on);
      if (on) { slot.style.height = r0.height + 'px'; phone.appendChild(box); behind = [body, document.getElementById('tp-tl'), document.getElementById('tp-tl-scrim'), phone.querySelector('.tp-cap-wrap')].filter(Boolean).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; }); }
      else { behind.forEach(function (x) { x[0].inert = x[1]; }); behind = []; slot.appendChild(box); slot.style.height = ''; }
      fullBtn.innerHTML = on ? I_X : I_EXP; fullBtn.setAttribute('aria-label', on ? 'Close the expanded map' : 'Expand the map');
      box.setAttribute('aria-label', on ? 'Trip map, expanded' : 'Trip map');
    }
    var W1 = v ? pr.width : sr.width, H1 = v ? pr.height : MAP_H_NOW(), fx = pr.left + pr.width / 2, fy = pr.top + pr.height / 2, sx = sr.left + sr.width / 2, sy = sr.top + sr.height / 2;
    var end = userMoved ? clampCam({ x: cam.x, y: cam.y, s: cam.s }, W1, H1) : fitCam(P0, W1, H1);
    // The slot's place inside the full layer, as a clip: the layer is cut to it at the small end of the move
    var ins = [sr.top - pr.top, pr.right - sr.right, pr.bottom - sr.bottom, sr.left - pr.left].map(function (n) { return Math.max(0, n); });
    function clip(e) { box.style.clipPath = e >= 1 ? '' : 'inset(' + ins.map(function (n) { return (n * (1 - e)).toFixed(1) + 'px'; }).join(' ') + ')'; }
    busy = true; cancelAnimationFrame(anim);
    if (v) {
      swap(true); lastW = pr.width; lastH = pr.height;
      svg.setAttribute('width', lastW); svg.setAttribute('height', lastH); svg.setAttribute('viewBox', '0 0 ' + lastW + ' ' + lastH);
      // Start with every place exactly where it was on the page, then move to the framing for the bigger map
      cam = { s: cam.s, x: cam.x + (fx - sx) / cam.s, y: cam.y + (fy - sy) / cam.s }; clip(0); L = null; apply();
      glide(end, 360, clip, function () { busy = false; clip(1); draw(); fullBtn.focus({ preventScroll: true }); tp.say('Map expanded.'); if (then) then(); });
    } else {
      // Move to where the small map's framing will sit inside the full layer, then put it back in the page
      var mid = { s: end.s, x: end.x + (fx - sx) / end.s, y: end.y + (fy - sy) / end.s };
      glide(mid, 320, function (e) { clip(1 - e); }, function () {
        swap(false); box.style.clipPath = ''; cam = end; busy = false; lastW = 0; draw();
        if (!then) fullBtn.focus({ preventScroll: true });
        tp.say('Map closed.'); if (then) then();
      });
    }
  }
  function MAP_H_NOW() { return slot.offsetHeight || MAP_H; }

  /* ---- Pan and zoom where it sits: drag, pinch, the plus and minus buttons, the keyboard ---- */
  var ptrs = {}, nPtr = 0, drag = null, pinch = null, swallow = false, raf = 0;
  function local(e) { var r = box.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function later() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; apply(); }); }
  box.addEventListener('pointerdown', function (e) {
    if (busy || e.target.closest('.v1-tm-ctl, .v1-tm-card, .v1-tm-back, .v1-tm-more')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    ptrs[e.pointerId] = local(e); nPtr = Object.keys(ptrs).length;
    cancelAnimationFrame(anim);
    if (nPtr === 1) drag = { at: ptrs[e.pointerId], cam: { x: cam.x, y: cam.y, s: cam.s }, moved: false, id: e.pointerId };
    else if (nPtr === 2) { var a = Object.keys(ptrs).map(function (k) { return ptrs[k]; }); pinch = { d: Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]) || 1, mid: [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2], cam: { x: cam.x, y: cam.y, s: cam.s } }; if (drag) drag.moved = true; }
  });
  window.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return;
    var z = size(), W = z[0], H = z[1]; ptrs[e.pointerId] = local(e);
    if (nPtr >= 2 && pinch) {
      var a = Object.keys(ptrs).map(function (k) { return ptrs[k]; }), d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]) || 1, mid = [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2];
      var s = Math.max(minS(W, H), Math.min(S_MAX, pinch.cam.s * d / pinch.d)), wx = pinch.cam.x + (pinch.mid[0] - W / 2) / pinch.cam.s, wy = pinch.cam.y + (pinch.mid[1] - H / 2) / pinch.cam.s;
      cam = clampCam({ s: s, x: wx - (mid[0] - W / 2) / s, y: wy - (mid[1] - H / 2) / s }, W, H); userMoved = true; later();
    } else if (drag && drag.id === e.pointerId) {
      var p = ptrs[e.pointerId], dx = p[0] - drag.at[0], dy = p[1] - drag.at[1];
      if (!drag.moved && Math.hypot(dx, dy) < 8) return;
      if (!drag.moved) { drag.moved = true; box.classList.add('is-drag'); try { box.setPointerCapture(e.pointerId); } catch (err) {} }
      cam = clampCam({ s: drag.cam.s, x: drag.cam.x - dx / drag.cam.s, y: drag.cam.y - dy / drag.cam.s }, W, H); userMoved = true; later();
    }
  });
  function ptrEnd(e) {
    if (!ptrs[e.pointerId]) return;
    delete ptrs[e.pointerId]; nPtr = Object.keys(ptrs).length;
    if (nPtr < 2) pinch = null;
    if (nPtr === 1) { var k = Object.keys(ptrs)[0]; drag = { at: ptrs[k], cam: { x: cam.x, y: cam.y, s: cam.s }, moved: true, id: +k }; }
    if (nPtr === 0) { if (drag && drag.moved) { swallow = true; setTimeout(function () { swallow = false; }, 60); } drag = null; box.classList.remove('is-drag'); }
  }
  window.addEventListener('pointerup', ptrEnd); window.addEventListener('pointercancel', ptrEnd);
  // A press that turned into a drag is not a tap on whatever it ended on
  box.addEventListener('click', function (e) { if (swallow) { swallow = false; e.stopPropagation(); e.preventDefault(); } }, true);
  box.addEventListener('click', function (e) {
    if (busy) return;
    var zb = e.target.closest('[data-tm-zoom]');
    if (zb) { userMoved = true; glide(zoomBy(+zb.dataset.tmZoom > 0 ? 1.7 : 1 / 1.7), 240); return; }
    if (e.target.closest('[data-tm-full]')) { setFull(!full); return; }
    if (e.target.closest('.v1-tm-card, .v1-tm-back')) return;
    var pb = e.target.closest('button.v1-tm-pin');
    if (pb) { if (card && card.key === pb.dataset.pin) cardClose(true); else { if (card) cardClose(false); cardOpen(pb.dataset.pin); } return; }
    // The map itself: an open card closes; with none open, the small map expands (the icon in its corner says so)
    if (card) { cardClose(false); return; }
    if (state.lit) { light(''); return; }
    if (!full) setFull(true);
  });
  // Pinch on a trackpad (and Ctrl with the wheel) zooms; a plain wheel scrolls the page, except on the expanded map, which has no page under it
  box.addEventListener('wheel', function (e) {
    if (!(e.ctrlKey || full) || busy || e.target.closest('.v1-tm-card')) return;
    e.preventDefault(); cancelAnimationFrame(anim);
    cam = zoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? .012 : .0025)), local(e)); userMoved = true; later();
  }, { passive: false });
  box.addEventListener('keydown', function (e) {
    if (busy) return;
    if (e.key === 'Escape') { if (card) { e.stopPropagation(); cardClose(true); } else if (full) { e.stopPropagation(); setFull(false); } return; }
    if (e.target.closest('.v1-tm-card')) return;
    var z = size(), mv = { ArrowLeft: [-48, 0], ArrowRight: [48, 0], ArrowUp: [0, -48], ArrowDown: [0, 48] }[e.key];
    if (mv) { e.preventDefault(); userMoved = true; glide(clampCam({ s: cam.s, x: cam.x + mv[0] / cam.s, y: cam.y + mv[1] / cam.s }, z[0], z[1]), 160); }
    else if (e.key === '+' || e.key === '=') { userMoved = true; glide(zoomBy(1.7), 240); }
    else if (e.key === '-' || e.key === '_') { userMoved = true; glide(zoomBy(1 / 1.7), 240); }
  });

  /* ---------- Controls in the sentences and the days ---------- */
  function scrollTo(el, gap) {
    var nav = phone.querySelector('.tp-cap-wrap'), room = (nav ? nav.offsetHeight : 0) + (gap || 16);
    body.scrollTo({ top: Math.max(0, body.scrollTop + el.getBoundingClientRect().top - body.getBoundingClientRect().top - room), behavior: reduce.matches ? 'auto' : 'smooth' });
  }
  sec.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-nar-days')) { tp.openDays(b); return; }
    if (b.dataset.narPin !== undefined) { highlight(b.dataset.narPin); return; }
  });
  third.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.narDay !== undefined) { highlight(b.dataset.narDay); return; }
    // Show on map and Show route on map go up to the map (their labels say so) and leave a way back to the day on it
    if (b.dataset.narRoute !== undefined || b.dataset.narOnmap !== undefined) { if (card) cardClose(false); backSet(b); light(b.dataset.narRoute !== undefined ? b.dataset.narRoute : b.dataset.narOnmap, true); scrollTo(swEl, 12); return; }
    if (b.dataset.narGoto !== undefined) { var t = document.getElementById(b.dataset.narGoto); if (t) { scrollTo(t, 12); } return; }
    if (b.dataset.narTab !== undefined) { var p = b.dataset.narTab.split('|'); state.tab[p[0]] = p[1]; tp.render(true, '[data-nar-tab="' + CSS.escape(b.dataset.narTab) + '"]'); return; }
    if (b.dataset.narMore !== undefined) { state.more[b.dataset.narMore] = !state.more[b.dataset.narMore]; tp.render(true, '[data-nar-more="' + CSS.escape(b.dataset.narMore) + '"]'); return; }
  });

  /* ---------- A match day: one block that fits one phone screen ---------- */
  var seenVenue = {};
  tp.narBegin = function () { seenVenue = {}; };
  // Sample places to stay near each ground (no accommodation is tied to a stadium in the data yet)
  var STAYS = {
    'Stadium Australia': [['Olympic Park Lodge', 'Sydney Olympic Park', 'Rooms two minutes from the ground'], ['Homebush Bay Apartments', 'Homebush Bay', 'Apartments by the water'], ['Parramatta Riverside Hotel', 'Parramatta', 'A train ride from the ground']],
    'Sydney Football Stadium': [['Moore Park Boutique Hotel', 'Moore Park', 'A short walk to the ground'], ['Surry Hills Townhouse', 'Surry Hills', 'Rooms above the cafés'], ['Centennial Park Inn', 'Paddington', 'Next to the park']],
    'Newcastle Stadium': [['Honeysuckle Harbour Hotel', 'Newcastle', 'Harbour views, a short train ride'], ['Broadmeadow Court Motel', 'Broadmeadow', 'Beside the ground'], ['Merewether Beach House', 'Merewether', 'Rooms by the surf']]
  };
  function slug(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function stayCard(sp, venue, f, onmap) {
    var id = 'stay:' + slug(sp[0]) + ':' + f.d;
    K.registerItem(id, { id: id, kind: 'place', title: sp[0], kindLabel: 'Place to stay', place: sp[1], note: sp[2] + ' (sample)', day: f.d, matchName: K.matchName(f) });
    return { id: id, title: sp[0], img: sp[0], kind: 'Place to stay', why: sp[2], open: '', sample: true };
  }
  function cardData(tab, m, f) {
    var wd = K.weekdayOf(m.day), out = [];
    if (tab === 'stay') return (STAYS[f.v] || []).map(function (sp) { return stayCard(sp, f.v, f); });
    var want = tab === 'food' ? 'food_and_drink' : 'attraction';
    K.products().filter(function (p) { return p.distance_to_venue && p.distance_to_venue.venue_ref === f.v && p.type === want; }).forEach(function (p) {
      var o = K.hoursOn(p, wd); if (!o) return;
      var id = K.registerProduct(p, m, o);
      out.push({ km: p.distance_to_venue.km, id: id, title: p.title, img: p.title, kind: K.ptype[p.type] || 'Product', why: K.travel(p.distance_to_venue), open: id });
    });
    var POI = window.cnMapPoi && window.cnMapPoi.pois || [];
    POI.filter(function (q) { return q.near === f.v && q.open.indexOf(wd) > -1 && (tab === 'food' ? q.cat === 'Food and drink' : q.cat !== 'Food and drink'); }).forEach(function (q) {
      var key = K.registerPoi(q, f);
      out.push({ km: 9, id: key, title: q.title, img: q.title, kind: q.cat, why: q.area, open: 'poi:' + q.id });
    });
    return out.sort(function (a, b) { return (a.km || 9) - (b.km || 9) || a.title.localeCompare(b.title); });
  }
  function cardHtml(c, f) {
    return '<article class="v1-nc"><span class="ph-img v1-nc-img"' + K.imgKey(c.img) + ' aria-hidden="true"></span><div class="v1-nc-b">' +
      (c.open ? '<button type="button" class="v1-nc-t" data-open="' + esc(c.open) + '" aria-haspopup="dialog">' + esc(c.title) + '</button>' : '<span class="v1-nc-t">' + esc(c.title) + '</span>') +
      '<span class="v1-nc-k">' + esc(c.kind) + (c.sample ? ' ' + K.sampleTag : '') + '</span><span class="v1-nc-w">' + esc(c.why || '') + '</span></div>' +
      K.addBtn(c.id, c.title + ' on ' + f.d) + '</article>';
  }
  function kickText(f) { return f.k ? 'Kick-off ' + esc(f.k) + '.' : 'Kick-off time to be confirmed.'; }
  function sentence(m) {
    var f = m.f;
    return '<p class="v1-md-s">Your <button type="button" class="v1-nar-b" data-open="match:' + esc(m.key) + '" aria-haspopup="dialog">' + esc(K.matchName(f)) + '</button> is at ' + esc(f.v) + ', ' + esc(f.p) + '. ' + kickText(f) + '</p>';
  }
  tp.narMatchBody = function (b, M) {
    var m = b.ms[0], f = m.f, venue = f.v, first = seenVenue[venue];
    var h = b.ms.map(sentence).join('');
    if (first) {
      return h + '<p class="v1-md-s v1-md-again">Same ground as ' + esc(first.when) + '. <button type="button" class="tp-link" data-nar-goto="' + esc(first.id) + '">See ' + esc(venue) + ' above</button></p>';
    }
    seenVenue[venue] = { id: 'v1-blk-' + b.key, when: K.dayLabel(b.day) };
    // How far, how long, from the nearer place they stay
    var r = K.goRoute(f), np = K.nearerPlace(venue), pp = np && G.places[np], vv = G.venues[venue];
    tp.goOne(m); // registers the Getting there and back sheet
    var km = pp && vv ? K.kmBetween(pp, vv) : null;
    if (km !== null || (r && r.mins)) {
      var two = K.placesOf().length > 1;
      h += '<p class="v1-md-d">It’s ' + [km !== null ? K.dist(km) : '', r && r.mins ? 'about ' + K.mins(r.mins) + ' ' + K.byMode(r) : ''].filter(Boolean).join(', ') +
        ', from ' + (two && np ? esc(np) : 'where you’re staying') + '. ' + K.sampleTag + '</p>' +
        '<p class="v1-md-l"><button type="button" class="tp-link" data-open="go:' + esc(m.key) + '" aria-haspopup="dialog">Getting there and back<span class="visually-hidden">, ' + esc(K.matchName(f)) + '</span></button></p>';
    }
    // The nearest fan zone: "before and after" only when it is within a 20 minute walk of the ground (28 Nov 2026); further, it says it is the nearest and how far
    var sp = K.nearestFan(vv);
    if (sp) {
      var fid = 'fz:' + sp.id + ':' + f.d, fkm = vv ? K.kmBetween(sp.ll, vv) : null, fwalk = fkm !== null ? Math.max(3, Math.round(fkm * 13)) : null, near = fwalk !== null && fwalk <= 20;
      K.registerItem(fid, { id: fid, kind: 'place', title: sp.name, kindLabel: sp.kind === 'fan_village' ? 'Fan village' : 'Fan zone', place: sp.suburb, note: sp.opens, day: f.d, matchName: K.matchName(f) });
      h += '<div class="v1-md-fz"><p class="v1-fan-near">' + (near
        ? '<strong class="v1-fan-nm">' + esc(sp.name) + '</strong><span class="v1-fan-sub">Before and after the match · ' + fwalk + ' min walk from ' + esc(venue) + ' ' + K.sampleTag + '</span>'
        : '<span class="v1-fan-sub">Nearest fan zone: <strong class="v1-fan-nm v1-fan-inl">' + esc(sp.name) + '</strong>' + (fkm !== null ? ', ' + K.dist(fkm) + ' from ' + esc(venue) : '') + ' ' + K.sampleTag + '</span>') +
        '</p>' + K.addBtn(fid, sp.name + ' on ' + f.d) + '</div>';
    }
    // One row of cards, with a switch
    var tab = state.tab[b.key] || 'food', cards = cardData(tab, m, f), more = !!state.more[b.key], shown = more ? cards : cards.slice(0, 2);
    var TABS = [['food', 'Food and drink'], ['do', 'Things to do'], ['stay', 'Places to stay']];
    h += '<div class="v1-md-sw tp-seg" role="group" aria-label="Near ' + esc(venue) + '">' + TABS.map(function (t) {
      return '<button type="button" class="tp-seg-btn v1-md-tab" data-nar-tab="' + esc(b.key + '|' + t[0]) + '" aria-pressed="' + (tab === t[0]) + '">' + t[1] + '</button>';
    }).join('') + '</div>';
    h += cards.length ? '<div class="v1-nc-row">' + shown.map(function (c) { return cardHtml(c, f); }).join('') + '</div>' : '<p class="tp-empty">Nothing listed here is open on ' + esc(f.d) + ' yet.</p>';
    h += '<div class="v1-md-acts">' + (cards.length > 2 ? '<button type="button" class="tp-link" data-nar-more="' + esc(b.key) + '" aria-expanded="' + more + '">' + (more ? 'Show fewer' : 'Show more') + '</button>' : '') +
      '<button type="button" class="tp-link" data-nar-onmap="' + esc(venue) + '">Show on map</button></div>';
    return h;
  };
  // Teams with no NSW match inside the days: one watch block for all of them, the fan zone and its address once, then their interstate
  // matches as one list in date order (a match between two of them is listed once)
  tp.narNoNsw = function (teams) {
    var by = {}, some = [], none = [];
    teams.forEach(function (n) {
      var away = tp.userMatches().filter(function (m) { return m.f.a && m.f.t && m.f.t.split(' v ').indexOf(n) > -1; });
      if (away.length) { some.push(n); away.forEach(function (m) { by[m.key] = m; }); } else none.push(n);
    });
    var ms = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return a.day - b.day || (K.kickMins(a.f.k) || 0) - (K.kickMins(b.f.k) || 0); });
    return (some.length && tp.noNswBlock ? tp.noNswBlock(some, ms) : '') + none.map(function (n) { return tp.noNswBlock ? tp.noNswBlock(n, []) : ''; }).join('');
  };

  /* ---------- Rendering: on every change, and the class that swaps the old sections out ---------- */
  var lastOn = null, sig = '';
  function on() { return !!(window.tpFlowC && window.tpFlowC.step() === ''); }
  function render() {
    var o = on();
    if (o !== lastOn) { lastOn = o; phone.classList.toggle('v1-nar-on', o); window.dispatchEvent(new Event('resize')); if (o) { sig = ''; tp.render(true); } }
    if (!o) return;
    var t = tp.state.trip || {}, s = [t.from, t.to, t.base, t.base2, tp.state.picked.join(','), tp.state.added.map(function (x) { return x.id; }).join(','), tp.state.notGoing.join(',')].join('|');
    if (s !== sig) { sig = s; sentences(); }
    draw();
  }
  phone.addEventListener('tp:state', render);
  render();
  requestAnimationFrame(function () { render(); });
})();
