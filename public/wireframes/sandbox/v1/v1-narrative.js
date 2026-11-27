/* The narrative plan page (27 Nov 2026), sandbox only. Once the three questions are answered, the Plan tab reads the way a
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
  var B = G.bounds, IMG = 'assets/images/map/nsw-map.webp', IW = 2000, IH = 1000, MAP_H = 280;
  var state = { tab: {}, more: {}, lit: '' };
  tp.narState = state;

  /* ---------- The section: two sentences, then the map ---------- */
  var sec = document.createElement('section');
  sec.className = 'tp-sec v1-nar'; sec.id = 'v1-nar'; sec.tabIndex = -1; sec.setAttribute('aria-labelledby', 'v1-nar-title');
  sec.innerHTML = '<h2 class="visually-hidden" id="v1-nar-title">Your trip</h2>' +
    '<p class="v1-nar-s" id="v1-nar-s1"></p><p class="v1-nar-s" id="v1-nar-s2"></p>' +
    '<div class="v1-tm" id="v1-tm" role="button" tabindex="0"><div class="v1-tm-layer" aria-hidden="true"><img class="v1-tm-img" alt="" draggable="false"></div>' +
    '<svg class="v1-tm-svg" aria-hidden="true" focusable="false"></svg><div class="v1-tm-pins" aria-hidden="true"></div></div>';
  pick.parentNode.insertBefore(sec, pick);
  pick.parentNode.insertBefore(third, pick); // the days follow the map
  var s1 = sec.querySelector('#v1-nar-s1'), s2 = sec.querySelector('#v1-nar-s2');
  var box = sec.querySelector('#v1-tm'), layer = box.querySelector('.v1-tm-layer'), img = box.querySelector('.v1-tm-img'), svg = box.querySelector('.v1-tm-svg'), pins = box.querySelector('.v1-tm-pins');

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
    var g = going(), items = g.map(function (x) { return pinBtn(x.label, x.venue); });
    var tail = items.length ? ' to see ' + list(items) : (noNswTeams().length ? ' to follow ' + esc(tp.list(noNswTeams())) : '');
    s1.innerHTML = 'It looks like you’re here between <button type="button" class="v1-nar-b" data-nar-days id="v1-nar-d1">' + esc(isoLabel(t.from)) + '</button> and <button type="button" class="v1-nar-b" data-nar-days id="v1-nar-d2">' + esc(isoLabel(t.to)) + '</button>' + tail + '.';
    if (t.base === 'outside') s2.innerHTML = 'You’re <button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p1">staying outside NSW</button>.';
    else if (t.base) s2.innerHTML = 'You’re staying in <button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p1">' + esc(t.base) + '</button>' + (t.base2 ? ' and <button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p2">' + esc(t.base2) + '</button>' : '') + '.';
    else s2.innerHTML = '<button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p1">Add where you’re staying</button>.';
  }

  /* ---------- The trip map: fixed height, zoomed to fit, one static picture ---------- */
  function px(ll) { return [(ll[1] - B.lon0) / (B.lon1 - B.lon0) * IW, (B.lat1 - ll[0]) / (B.lat1 - B.lat0) * IH]; }
  var drawn = '';
  /* Where the map is allowed to look: never closer than one image pixel per device pixel on a 2x screen (S_MAX, so the base
     picture is sharp at 390 wide), never further out than the base map's own names stay readable (S_MIN). Nothing, pin or label, is
     closer than EDGE to the map's edge. */
  var S_MAX = .5, S_MIN = .3, EDGE = 24, NEAR_KM = 40;
  // The other city's ground, its stops and its dotted route: drawn when it is part of the plan (they stay near it) or has just been
  // asked for with "Show route on map"; otherwise the map frames only their own places
  function stayNear(venue) {
    var v = G.venues[venue];
    return !!v && K.placesOf().some(function (n) { return G.places[n] && K.kmBetween(G.places[n], v) <= NEAR_KM; });
  }
  function showExtra(r) { return state.lit === r.venue || stayNear(r.venue); }
  function mapPoints() {
    var P = [];
    K.placesOf().forEach(function (n) { if (G.places[n]) P.push({ kind: 'stay', key: n, label: n, ll: G.places[n] }); });
    var seenV = {};
    going().forEach(function (x) { if (!seenV[x.venue] && G.venues[x.venue]) { seenV[x.venue] = 1; P.push({ kind: x.maybe ? 'maybe' : 'stadium', key: x.venue, label: x.venue, ll: G.venues[x.venue], going: 1 }); } });
    if (watchTeams().length) { var fz = watchFan(); if (fz) P.push({ kind: 'fan', key: fz.name, label: fz.name, ll: fz.ll, going: 1 }); }
    // Another match while you're here, in the other city: its ground, and the stops on the way (sample), joined by a dashed route
    (tp.narRoutes ? tp.narRoutes() : []).forEach(function (r) {
      if (!G.venues[r.venue] || !showExtra(r)) return;
      if (!seenV[r.venue]) {
        // The stops are on the way from a place they stay that is not already there; staying only near the ground, there is no way to draw
        var far = K.placesOf().some(function (n) { return G.places[n] && K.kmBetween(G.places[n], G.venues[r.venue]) > NEAR_KM; }), st = far ? r.stops : [];
        seenV[r.venue] = 1; P.push({ kind: 'extra', key: r.venue, label: r.venue, ll: G.venues[r.venue], going: 1, stops: st.map(function (x) { return 'stop:' + x.name; }) });
        st.forEach(function (x) { P.push({ kind: 'stop', key: 'stop:' + x.name, label: x.name, ll: x.ll }); });
      }
    });
    return P;
  }
  // A label's real size, measured once with the page's own font (and again when the fonts arrive)
  var meas = null, sizes = {};
  function labelSize(p) {
    var k = (p.kind === 'stop' ? 's|' : 'n|') + p.label; if (sizes[k]) return sizes[k];
    if (!meas) { meas = document.createElement('div'); meas.className = 'v1-tm-meas'; meas.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none'; box.appendChild(meas); }
    meas.innerHTML = '<span class="v1-tm-pin is-' + p.kind + '"><b>' + esc(p.label) + '</b></span>';
    var b = meas.querySelector('b'); return (sizes[k] = { w: b.offsetWidth, h: b.offsetHeight });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { sizes = {}; drawn = ''; draw(); });
  var ORDER = { stay: 0, stadium: 1, fan: 2, maybe: 3, extra: 4, stop: 5 };
  function hit(a, b, g) { g = g || 0; return a[0] - g < b[2] && a[2] + g > b[0] && a[1] - g < b[3] && a[3] + g > b[1]; }
  /* The pins at zoom s, as offsets from the middle of the places (so it does not depend on where the picture sits): a pin on top of
     another moves to the nearest free spot; each label takes the first place that touches no other label or pin (right, left, then
     below or above them, then under or over the pin); a stop whose label has no clear place goes without. Returns the box they fill. */
  function layout(s, xy, ref) {
    var order = P0.map(function (p, i) { return i; }).sort(function (a, b) { return ORDER[P0[a].kind] - ORDER[P0[b].kind] || a - b; });
    var it = P0.map(function (p, i) { return { p: p, i: i, x: (xy[i][0] - ref[0]) * s, y: (xy[i][1] - ref[1]) * s, lab: null }; });
    var NUD = [[0, 20], [0, -20], [22, 0], [-22, 0], [16, 16], [-16, 16], [16, -16], [-16, -16], [0, 40], [0, -40]], done = [];
    order.forEach(function (i) {
      var o = it[i], r = o.p.kind === 'stop' ? 5 : 9, x0 = o.x, y0 = o.y;
      function free() { return done.every(function (q) { return Math.hypot(q.x - o.x, q.y - o.y) >= r + (q.p.kind === 'stop' ? 5 : 9) + 3; }); }
      if (!free()) for (var k = 0; k < NUD.length; k++) { o.x = x0 + NUD[k][0]; o.y = y0 + NUD[k][1]; if (free()) break; if (k === NUD.length - 1) { o.x = x0; o.y = y0; } }
      done.push(o);
    });
    var circ = it.map(function (o) { var r = o.p.kind === 'stop' ? 5 : 9.5; return [o.x - r, o.y - r, o.x + r, o.y + r]; }), placed = [];
    order.forEach(function (i) {
      var o = it[i], z = labelSize(o.p), w = z.w, h = z.h, g = o.p.kind === 'stop' ? 8 : 12, c = [];
      c.push([g, -h / 2], [-g - w, -h / 2], [g, h / 2 - 2], [-g - w, h / 2 - 2], [g, -h / 2 - h + 2], [-g - w, -h / 2 - h + 2], [-w / 2, 12], [-w / 2, -12 - h]);
      var best = null, bestA = 1e9;
      for (var k = 0; k < c.length; k++) {
        var r = [o.x + c[k][0], o.y + c[k][1], o.x + c[k][0] + w, o.y + c[k][1] + h], a = 0;
        placed.forEach(function (q) { if (hit(r, q, 1)) a += 100; });
        circ.forEach(function (q, j) { if (j !== i && hit(r, q, 2)) a += 100; });
        if (hit(r, circ[i], 0)) a += 100;
        if (a < bestA) { bestA = a; best = { dx: c[k][0], dy: c[k][1], r: r }; }
        if (!a) break;
      }
      if (best && (bestA === 0 || o.p.kind !== 'stop')) { o.lab = best; placed.push(best.r); }
    });
    var bb = [1e9, 1e9, -1e9, -1e9];
    circ.concat(placed).forEach(function (q) { bb[0] = Math.min(bb[0], q[0]); bb[1] = Math.min(bb[1], q[1]); bb[2] = Math.max(bb[2], q[2]); bb[3] = Math.max(bb[3], q[3]); });
    return { it: it, bb: bb, w: bb[2] - bb[0], h: bb[3] - bb[1] };
  }
  var P0 = [];
  function draw() {
    var W = box.clientWidth; if (!W) return;
    var P = mapPoints(), sig = W + '|' + P.map(function (p) { return p.kind + p.key; }).join(',') + '|' + state.lit;
    if (sig === drawn) return; drawn = sig;
    if (!img.getAttribute('src')) img.src = IMG;
    var H = box.clientHeight || MAP_H; P0 = P;
    var xy = P.map(function (p) { return px(p.ll); });
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    xy.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
    if (!xy.length) { var c0 = px(G.places['Sydney CBD'] || [-33.87, 151.21]); x0 = x1 = c0[0]; y0 = y1 = c0[1]; }
    var ref = [(x0 + x1) / 2, (y0 + y1) / 2], pad = EDGE + 9;
    // As close as the places need, never closer than S_MAX (a one-suburb trip keeps S_MAX and is centred), then out in steps until the
    // pins and their labels all fit inside the 24px margin, never past S_MIN (or the least that still fills the box with picture)
    var floor = Math.min(S_MAX, Math.max(S_MIN, W / IW, H / IH));
    var s = Math.max(floor, Math.min(S_MAX, (W - 2 * pad) / Math.max(x1 - x0, 1), (H - 2 * pad) / Math.max(y1 - y0, 1))), L;
    for (;;) {
      L = layout(s, xy, ref);
      if ((L.w <= W - 2 * EDGE && L.h <= H - 2 * EDGE) || s <= floor + 1e-6) break;
      s = Math.max(floor, s * .94);
    }
    // The box's middle sits on the middle of what is drawn; the picture is kept under the whole box
    var bcx = (L.bb[0] + L.bb[2]) / 2, bcy = (L.bb[1] + L.bb[3]) / 2, cx = ref[0] + bcx / s, cy = ref[1] + bcy / s;
    if (IW * s > W) cx = Math.max(W / (2 * s), Math.min(IW - W / (2 * s), cx));
    cy = Math.max(H / (2 * s), Math.min(IH - H / (2 * s), cy));
    layer.style.transform = 'translate(' + (W / 2 - cx * s) + 'px,' + (H / 2 - cy * s) + 'px) scale(' + s + ')';
    // Each pin's place on the box: the picture's own position of the place, plus any nudge the layout gave it
    var pts = L.it.map(function (o) {
      var q = xy[o.i], nx = o.x - (q[0] - ref[0]) * s, ny = o.y - (q[1] - ref[1]) * s;
      return { p: o.p, x: W / 2 + (q[0] - cx) * s + nx, y: H / 2 + (q[1] - cy) * s + ny, lab: o.lab };
    });
    // The route between: from the nearer place they stay to each stadium (or the fan zone)
    var stays = pts.filter(function (o) { return o.p.kind === 'stay'; }), lines = '';
    pts.forEach(function (o) {
      if (o.p.kind === 'stay' || o.p.kind === 'stop' || !stays.length) return;
      if (o.p.kind === 'extra') {
        // Through its stops, in order, from the nearer place they stay: a dashed line
        var away = stays.filter(function (z) { return K.kmBetween(z.p.ll, o.p.ll) > NEAR_KM; });
        if (!away.length) return; // they stay by that ground: nothing to join
        var f0 = away.sort(function (a, b) { return Math.hypot(a.x - o.x, a.y - o.y) - Math.hypot(b.x - o.x, b.y - o.y); })[0], d = 'M' + f0.x.toFixed(1) + ' ' + f0.y.toFixed(1);
        (o.p.stops || []).forEach(function (k) { var q = pts.filter(function (z) { return z.p.key === k; })[0]; if (q) d += ' L' + q.x.toFixed(1) + ' ' + q.y.toFixed(1); });
        lines += '<path class="v1-tm-route is-extra' + (state.lit && state.lit === o.p.key ? ' is-lit' : '') + '" d="' + d + ' L' + o.x.toFixed(1) + ' ' + o.y.toFixed(1) + '"/>';
        return;
      }
      var from = stays.slice().sort(function (a, b) { return Math.hypot(a.x - o.x, a.y - o.y) - Math.hypot(b.x - o.x, b.y - o.y); })[0];
      if (Math.hypot(from.x - o.x, from.y - o.y) < 16) return; // staying at the ground: nothing to draw
      var mx = (from.x + o.x) / 2, my = (from.y + o.y) / 2 - Math.min(30, Math.hypot(from.x - o.x, from.y - o.y) * .18);
      lines += '<path class="v1-tm-route' + (o.p.kind === 'maybe' ? ' is-maybe' : '') + (state.lit && state.lit === o.p.key ? ' is-lit' : '') + '" d="M' + from.x.toFixed(1) + ' ' + from.y.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + o.x.toFixed(1) + ' ' + o.y.toFixed(1) + '"/>';
    });
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = lines;
    pins.innerHTML = pts.map(function (o) {
      return '<span class="v1-tm-pin is-' + o.p.kind + (state.lit && state.lit === o.p.key ? ' is-lit' : '') + (state.lit && state.lit !== o.p.key ? ' is-dim' : '') + '" data-pin="' + esc(o.p.key) + '" style="left:' + o.x.toFixed(1) + 'px;top:' + o.y.toFixed(1) + 'px"><i></i>' +
        (o.lab ? '<b style="left:' + o.lab.dx.toFixed(1) + 'px;top:' + o.lab.dy.toFixed(1) + 'px;right:auto">' + esc(o.p.label) + '</b>' : '') + '</span>';
    }).join('');
    var names = P.map(function (p) { return p.label; });
    box.setAttribute('aria-label', 'Trip map' + (names.length ? ': ' + list(names) : '') + '. Opens the full-screen map, day by day.');
  }
  // Tapping away from a route that was asked for brings the map back to their own places (a lit stadium or day keeps its own toggle)
  document.addEventListener('click', function (e) {
    if (!state.lit) return;
    var r = (tp.narRoutes ? tp.narRoutes() : []).filter(function (x) { return x.venue === state.lit; })[0];
    if (!r || stayNear(r.venue) || going().some(function (x) { return x.venue === r.venue; })) return;
    if (e.target.closest && e.target.closest('[data-nar-route], [data-nar-onmap], [data-nar-pin], [data-nar-day], #v1-tm')) return;
    state.lit = ''; drawn = ''; draw();
  });
  function highlight(key) { state.lit = state.lit === key ? '' : key; drawn = ''; draw(); }
  tp.narHighlight = function (key) { state.lit = key || ''; drawn = ''; draw(); };
  if (window.ResizeObserver) new ResizeObserver(function () { drawn = ''; draw(); }).observe(box);
  function openFull() { if (!tp.openDaysMap(box)) tp.say('Set your days to open the day-by-day map.'); }
  box.addEventListener('click', openFull);
  box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFull(); } });

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
    if (b.dataset.narRoute !== undefined) { state.lit = b.dataset.narRoute; drawn = ''; draw(); scrollTo(box, 12); return; }
    if (b.dataset.narOnmap !== undefined) { state.lit = b.dataset.narOnmap; drawn = ''; draw(); scrollTo(box, 12); return; }
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
      h += '<p class="v1-md-d">It’s ' + [km !== null ? (km < 1 ? 'under 1 km' : 'about ' + Math.round(km) + ' km') : '', r && r.mins ? 'about ' + K.mins(r.mins) : ''].filter(Boolean).join(', ') +
        ', from ' + (two && np ? esc(np) : 'where you’re staying') + '. ' + K.sampleTag + '</p>' +
        '<p class="v1-md-l"><button type="button" class="tp-link" data-open="go:' + esc(m.key) + '" aria-haspopup="dialog">Getting there and back<span class="visually-hidden">, ' + esc(K.matchName(f)) + '</span></button></p>';
    }
    // The nearest fan zone, before and after
    var sp = K.nearestFan(vv);
    if (sp) {
      var fid = 'fz:' + sp.id + ':' + f.d, fkm = vv ? K.kmBetween(sp.ll, vv) : null;
      K.registerItem(fid, { id: fid, kind: 'place', title: sp.name, kindLabel: sp.kind === 'fan_village' ? 'Fan village' : 'Fan zone', place: sp.suburb, note: sp.opens, day: f.d, matchName: K.matchName(f) });
      h += '<div class="v1-md-fz"><p class="v1-fan-near"><strong class="v1-fan-nm">' + esc(sp.name) + '</strong><span class="v1-fan-sub">Before and after the match' +
        (fkm !== null ? ' · about ' + Math.max(1, Math.round(fkm)) + ' km from ' + esc(venue) : '') + ' ' + K.sampleTag + '</span></p>' + K.addBtn(fid, sp.name + ' on ' + f.d) + '</div>';
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
    if (s !== sig) { sig = s; drawn = ''; sentences(); }
    draw();
  }
  phone.addEventListener('tp:state', render);
  render();
  requestAnimationFrame(function () { drawn = ''; render(); });
})();
