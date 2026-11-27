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
  var B = G.bounds, IMG = 'assets/images/map/nsw-relief.webp', IW = 2800, IH = 3602, MAP_H = 280;
  var state = { tab: {}, more: {}, lit: '' };
  tp.narState = state;

  /* ---------- The section: two sentences, then the map ---------- */
  var sec = document.createElement('section');
  sec.className = 'tp-sec v1-nar'; sec.id = 'v1-nar'; sec.tabIndex = -1; sec.setAttribute('aria-labelledby', 'v1-nar-title');
  sec.innerHTML = '<h2 class="visually-hidden" id="v1-nar-title">Your trip</h2>' +
    '<p class="v1-nar-s" id="v1-nar-s1"></p><p class="v1-nar-s" id="v1-nar-s2"></p><p class="v1-nar-addp" id="v1-nar-addp" hidden></p>' +
    '<div class="v1-tm" id="v1-tm" role="button" tabindex="0"><div class="v1-tm-layer" aria-hidden="true"><img class="v1-tm-img" alt="" draggable="false"></div>' +
    '<svg class="v1-tm-svg" aria-hidden="true" focusable="false"></svg><div class="v1-tm-pins" aria-hidden="true"></div></div>';
  pick.parentNode.insertBefore(sec, pick);
  pick.parentNode.insertBefore(third, pick); // the days follow the map
  var s1 = sec.querySelector('#v1-nar-s1'), s2 = sec.querySelector('#v1-nar-s2'), addp = sec.querySelector('#v1-nar-addp');
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
    if (!(t.from && t.to)) { s1.textContent = ''; s2.textContent = ''; addp.hidden = true; return; }
    var g = going(), items = g.map(function (x) { return pinBtn(x.label, x.venue); });
    var tail = items.length ? ' to see ' + list(items) : (noNswTeams().length ? ' to follow ' + esc(tp.list(noNswTeams())) : '');
    s1.innerHTML = 'It looks like you’re here between <button type="button" class="v1-nar-b" data-nar-days id="v1-nar-d1">' + esc(isoLabel(t.from)) + '</button> and <button type="button" class="v1-nar-b" data-nar-days id="v1-nar-d2">' + esc(isoLabel(t.to)) + '</button>' + tail + '.';
    if (t.base === 'outside') s2.innerHTML = 'You’re <button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p1">staying outside NSW</button>.';
    else if (t.base) s2.innerHTML = 'You’re staying in <button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p1">' + esc(t.base) + '</button>' + (t.base2 ? ' and <button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p2">' + esc(t.base2) + '</button>' : '') + '.';
    else s2.innerHTML = '<button type="button" class="v1-nar-b" data-go-stay id="v1-nar-p1">Add where you’re staying</button>.';
    var canAdd = !!t.base && t.base !== 'outside' && !t.base2;
    addp.hidden = !canAdd;
    addp.innerHTML = canAdd ? '<button type="button" class="tp-link" data-nar-addplace id="v1-nar-addplace">+ Add another place</button>' : '';
  }

  /* ---------- The trip map: fixed height, zoomed to fit, one static picture ---------- */
  function px(ll) { return [(ll[1] - B.lon0) / (B.lon1 - B.lon0) * IW, (B.lat1 - ll[0]) / (B.lat1 - B.lat0) * IH]; }
  var drawn = '';
  function mapPoints() {
    var P = [];
    K.placesOf().forEach(function (n) { if (G.places[n]) P.push({ kind: 'stay', key: n, label: n, ll: G.places[n] }); });
    var seenV = {};
    going().forEach(function (x) { if (!seenV[x.venue] && G.venues[x.venue]) { seenV[x.venue] = 1; P.push({ kind: x.maybe ? 'maybe' : 'stadium', key: x.venue, label: x.venue, ll: G.venues[x.venue] }); } });
    if (watchTeams().length) { var fz = watchFan(); if (fz) P.push({ kind: 'fan', key: fz.name, label: fz.name, ll: fz.ll }); }
    return P;
  }
  function draw() {
    var W = box.clientWidth; if (!W) return;
    var P = mapPoints(), sig = W + '|' + P.map(function (p) { return p.kind + p.key; }).join(',') + '|' + state.lit;
    if (sig === drawn) return; drawn = sig;
    if (!img.getAttribute('src')) img.src = IMG;
    var H = MAP_H, xy = P.map(function (p) { return px(p.ll); });
    var cx, cy, s;
    if (xy.length) {
      var x0 = Math.min.apply(null, xy.map(function (q) { return q[0]; })), x1 = Math.max.apply(null, xy.map(function (q) { return q[0]; }));
      var y0 = Math.min.apply(null, xy.map(function (q) { return q[1]; })), y1 = Math.max.apply(null, xy.map(function (q) { return q[1]; }));
      cx = (x0 + x1) / 2; cy = (y0 + y1) / 2;
      var padX = 74, padY = 40, spanMin = 150;
      s = Math.min((W - 2 * padX) / Math.max(x1 - x0, spanMin), (H - 2 * padY) / Math.max(y1 - y0, spanMin));
    } else { var c = px(G.places['Sydney CBD'] || [-33.87, 151.21]); cx = c[0]; cy = c[1]; s = 1; }
    // Never closer than the city (a Sydney-only trip shows Sydney) and as far out as the trip needs: on a wide box the picture may be
    // narrower than the box, so its sides fade out instead of the trip being cut off
    s = Math.max(.08, Math.min(.8, s));
    if (IW * s > W) cx = Math.max(W / (2 * s), Math.min(IW - W / (2 * s), cx));
    cy = Math.max(H / (2 * s), Math.min(IH - H / (2 * s), cy));
    layer.style.transform = 'translate(' + (W / 2 - cx * s) + 'px,' + (H / 2 - cy * s) + 'px) scale(' + s + ')';
    function scr(q) { return [W / 2 + (q[0] - cx) * s, H / 2 + (q[1] - cy) * s]; }
    var pts = P.map(function (p, i) { var q = scr(xy[i]); return { p: p, x: q[0], y: q[1] }; });
    // The route between: from the nearer place they stay to each stadium (or the fan zone)
    var stays = pts.filter(function (o) { return o.p.kind === 'stay'; }), lines = '';
    pts.forEach(function (o) {
      if (o.p.kind === 'stay' || !stays.length) return;
      var from = stays.slice().sort(function (a, b) { return Math.hypot(a.x - o.x, a.y - o.y) - Math.hypot(b.x - o.x, b.y - o.y); })[0];
      if (Math.hypot(from.x - o.x, from.y - o.y) < 16) return; // staying at the ground: nothing to draw
      var mx = (from.x + o.x) / 2, my = (from.y + o.y) / 2 - Math.min(30, Math.hypot(from.x - o.x, from.y - o.y) * .18);
      lines += '<path class="v1-tm-route' + (o.p.kind === 'maybe' ? ' is-maybe' : '') + (state.lit && state.lit === o.p.key ? ' is-lit' : '') + '" d="M' + from.x.toFixed(1) + ' ' + from.y.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + o.x.toFixed(1) + ' ' + o.y.toFixed(1) + '"/>';
    });
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = lines;
    pins.innerHTML = pts.map(function (o, i) {
      var near = pts.some(function (q, j) { return j < i && Math.hypot(q.x - o.x, q.y - o.y) < 22; });
      // A pin on top of another (staying at the ground) moves up and to the left, and its label goes to the left, so both read
      var x = o.x + (near ? -4 : 0), y = o.y + (near ? 16 : 0), lw = o.p.label.length * 6.3 + 16, left = near || x + 12 + lw > W - 4;
      if (left && x - 12 - lw < 4) left = false; // no room on the left: the label goes right even if it runs on
      if (!left && x + 12 + lw > W - 4 && x - 12 - lw >= 4) left = true;
      return '<span class="v1-tm-pin is-' + o.p.kind + (state.lit && state.lit === o.p.key ? ' is-lit' : '') + (state.lit && state.lit !== o.p.key ? ' is-dim' : '') + (left ? ' is-l' : '') + '" data-pin="' + esc(o.p.key) + '" style="left:' + x.toFixed(1) + 'px;top:' + y.toFixed(1) + 'px"><i></i><b>' + esc(o.p.label) + '</b></span>';
    }).join('');
    var names = P.map(function (p) { return p.label; });
    box.setAttribute('aria-label', 'Trip map' + (names.length ? ': ' + list(names) : '') + '. Opens the full-screen map, day by day.');
  }
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
    if (b.hasAttribute('data-nar-addplace')) { K.openStay(b, true); return; }
    if (b.dataset.narPin !== undefined) { highlight(b.dataset.narPin); return; }
  });
  third.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.narDay !== undefined) { highlight(b.dataset.narDay); return; }
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
        ', from ' + (two && np ? esc(np) : 'where you’re staying') + '. ' + K.sampleTag + ' <button type="button" class="tp-link" data-open="go:' + esc(m.key) + '" aria-haspopup="dialog">Getting there and back<span class="visually-hidden">, ' + esc(K.matchName(f)) + '</span></button></p>';
    }
    // The nearest fan zone, before and after
    var sp = K.nearestFan(vv);
    if (sp) {
      var fid = 'fz:' + sp.id + ':' + f.d, fkm = vv ? K.kmBetween(sp.ll, vv) : null;
      K.registerItem(fid, { id: fid, kind: 'place', title: sp.name, kindLabel: sp.kind === 'fan_village' ? 'Fan village' : 'Fan zone', place: sp.suburb, note: sp.opens, day: f.d, matchName: K.matchName(f) });
      h += '<div class="v1-md-fz"><p class="v1-fan-near"><span class="v1-fan-k">Before and after</span> ' + esc(sp.name) + ', ' + esc(sp.suburb) + (sp.addr ? ' · ' + esc(sp.addr) : '') +
        (fkm !== null ? ' · about ' + Math.max(1, Math.round(fkm)) + ' km from ' + esc(venue) : '') + ' ' + K.sampleTag + '</p>' + K.addBtn(fid, sp.name + ' on ' + f.d) + '</div>';
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
  // A team with no NSW match inside the days: the watch block takes the place of a match block, its fan zone is on the map
  tp.narNoNsw = function (teams) {
    return teams.map(function (n) {
      var away = tp.userMatches().filter(function (m) { return m.f.a && m.f.t && m.f.t.split(' v ').indexOf(n) > -1; });
      return tp.noNswBlock ? tp.noNswBlock(n, away) : '';
    }).join('');
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
