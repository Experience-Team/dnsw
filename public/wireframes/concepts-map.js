/* Your days, in order, as a map (Pick your team prototype).
   Once their days are set, the section offers Map | List (Map by default, List with reduced motion; the choice is kept).
   The map is the gallery's illustration rendered flat (assets/images/map), pinned in place while the page scrolls past it
   one day at a time: each step glides the camera to that day (home on free days, the stadium on match days), shows the
   day's card with the same cards and Add buttons as the list (concepts-third-half.js, tp.mapStep), and numbered pins
   around it. Progress pill with a list of days to jump to, Explore freely (pan and zoom, every day's stops), See as a
   list, Skip the map. A long plan merges runs of empty free days and shortens each step, and the map lets go straight
   after the last day, so nobody is held in a long scroll. Coordinates are made up (concepts-geo.js), except the three
   stadiums. */
(function () {
  'use strict';
  var tp = window.tpPicker, GEO = window.cnGeo;
  if (!tp || !GEO || typeof tp.mapPlan !== 'function') return;
  var B = GEO.bounds, IW = 2800, IH = 3602, BAR = 88;
  var phone = document.getElementById('tp-phone'), body = tp.body, reduce = tp.reduce, esc = tp.esc, state = tp.state;
  var list = document.getElementById('tp-third-list');
  if (!list) return;
  function px(ll) { return [(ll[1] - B.lon0) / (B.lon1 - B.lon0) * IW, (B.lat1 - ll[0]) / (B.lat1 - B.lat0) * IH]; }
  function onMap(ll) { return ll && ll[1] > B.lon0 && ll[1] < B.lon1 && ll[0] > B.lat0 && ll[0] < B.lat1; }
  var PLUS = window.tpIcons ? window.tpIcons.add : '', TICK = window.tpIcons ? window.tpIcons.added : '';
  var HOME = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 7.5L8 3l5.5 4.5V13a.5.5 0 0 1-.5.5H9.5V10h-3v3.5H3a.5.5 0 0 1-.5-.5z"/></svg>';
  var FLAG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 14V2.5M4 3h7.5l-1.8 2.5L11.5 8H4"/></svg>';

  /* ---------- Markup ---------- */
  var dview = document.createElement('div');
  dview.className = 'tp-dview'; dview.hidden = true;
  dview.innerHTML = '<div class="tp-seg has-sel tp-dview-seg" role="group" aria-label="Show your days as"><span class="tp-seg-thumb" aria-hidden="true"></span>' +
    '<button type="button" class="tp-seg-btn" data-dview="map" aria-pressed="false">Map</button><button type="button" class="tp-seg-btn" data-dview="list" aria-pressed="false">List</button></div>' +
    '<a class="tp-link tp-map-skip" href="#tp-map-end">Skip the map</a>';
  var mapEl = document.createElement('div');
  mapEl.className = 'tp-map'; mapEl.id = 'tp-map'; mapEl.hidden = true;
  mapEl.innerHTML = '<div class="tp-map-snaps" aria-hidden="true"></div>' +
    '<div class="tp-map-stage" role="region" aria-label="Map of your days">' +
      '<div class="tp-map-top"><button type="button" class="tp-map-pill" aria-haspopup="dialog" aria-expanded="false"></button>' +
        '<button type="button" class="tp-map-free" aria-pressed="false"><span class="tp-map-free-l">Explore freely</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5L9 7M6.5 13.5h-4v-4M2.5 13.5L7 9"/></svg></button></div>' +
      '<div class="tp-map-view" tabindex="-1" aria-label="Map. In Explore freely: arrow keys move, plus and minus zoom, zero resets.">' +
        '<div class="tp-map-layer"><img class="tp-map-img" src="assets/images/map/nsw-relief.webp" width="' + IW + '" height="' + IH + '" alt="" decoding="async" draggable="false"></div>' +
        '<svg class="tp-map-routes" aria-hidden="true"></svg><div class="tp-map-marks" aria-hidden="true"></div><div class="tp-map-pins"></div><div class="tp-map-edges" aria-hidden="true"></div>' +
      '</div>' +
      '<div class="tp-map-zoom" hidden><button type="button" data-zoom="in" aria-label="Zoom in">+</button><button type="button" data-zoom="out" aria-label="Zoom out">−</button><button type="button" data-zoom="reset" aria-label="Back to this day">⌖</button></div>' +
      '<div class="tp-map-pop" hidden></div>' +
      '<div class="tp-map-card"></div>' +
      '<div class="tp-map-jump" role="dialog" aria-modal="true" aria-labelledby="tp-map-jump-h" hidden></div>' +
      '<p class="visually-hidden" aria-live="polite" id="tp-map-say"></p>' +
    '</div>';
  var endEl = document.createElement('span');
  endEl.id = 'tp-map-end'; endEl.tabIndex = -1; endEl.className = 'tp-map-end';
  list.parentNode.insertBefore(dview, list);
  list.parentNode.insertBefore(mapEl, list);
  list.parentNode.insertBefore(endEl, list.nextSibling);
  var stage = mapEl.querySelector('.tp-map-stage'), view = mapEl.querySelector('.tp-map-view'), layer = mapEl.querySelector('.tp-map-layer');
  var svg = mapEl.querySelector('.tp-map-routes'), marksEl = mapEl.querySelector('.tp-map-marks'), pinsEl = mapEl.querySelector('.tp-map-pins'), edgesEl = mapEl.querySelector('.tp-map-edges');
  var pill = mapEl.querySelector('.tp-map-pill'), freeBtn = mapEl.querySelector('.tp-map-free'), zoomEl = mapEl.querySelector('.tp-map-zoom');
  var card = mapEl.querySelector('.tp-map-card'), jump = mapEl.querySelector('.tp-map-jump'), pop = mapEl.querySelector('.tp-map-pop'), sayEl = mapEl.querySelector('#tp-map-say');
  var snaps = mapEl.querySelector('.tp-map-snaps'), seg = dview.querySelector('.tp-dview-seg'), skip = dview.querySelector('.tp-map-skip');

  /* ---------- State ---------- */
  var steps = [], cards = [], sub = {}, cur = -1, curDay = null, on = false, free = false;
  var cam = { x: IW / 2, y: IH / 2, s: .2, fy: 200 }, anim = 0, stageH = 600, stepPx = 400, vw = 390;
  function mode() { return state.dayView === 'list' || state.dayView === 'map' ? state.dayView : reduce.matches ? 'list' : 'map'; }
  function say(t) { sayEl.textContent = ''; setTimeout(function () { sayEl.textContent = t; }, 30); }
  function trackTop() { return mapEl.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop; }
  function stepTop(i) { return Math.round(trackTop() + i * stepPx); }
  function placeOf(i) { var c = cards[i]; return c ? c.place || '' : ''; }

  /* ---------- Layout ---------- */
  function layout() {
    var bar = document.getElementById('tp-tl');
    stageH = Math.max(420, body.clientHeight - (bar && !bar.hidden ? BAR : 0));
    vw = mapEl.clientWidth || 390;
    var n = steps.length;
    // Each day is one deliberate swipe: shorter steps for a long plan, and the map lets go after the last day
    stepPx = Math.round(stageH * (n <= 8 ? .7 : n <= 14 ? .5 : .36));
    mapEl.style.setProperty('--stage-h', stageH + 'px');
    mapEl.style.height = (free ? stageH : stageH + Math.max(0, n - 1) * stepPx) + 'px';
    snaps.innerHTML = free ? '' : steps.map(function (s, i) { return '<span style="top:' + i * stepPx + 'px"></span>'; }).join('');
  }

  /* ---------- Camera ---------- */
  function availTop() { return 60; }
  function availBottom() { return stageH - (card.offsetHeight || 260) - 14; }
  function frameOf(i) {
    var c = cards[i]; if (!c) return null;
    var pts = [];
    if (c.anchor && onMap(c.anchor.ll)) pts.push(px(c.anchor.ll));
    c.pins.forEach(function (p) { if (onMap(p.ll)) pts.push(px(p.ll)); });
    if (c.kind === 'match' && c.home && onMap(c.home.ll)) pts.push(px(c.home.ll));
    if (!pts.length) pts.push(px([-33.8688, 151.2093]));
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    var at = availTop(), ab = Math.max(at + 160, availBottom()), aw = vw - 120, ah = ab - at - 64;
    var span = 140; // never closer than about 8 km across
    var s = Math.min(aw / Math.max(x1 - x0, span), ah / Math.max(y1 - y0, span));
    s = Math.max(sMin(), Math.min(1.35, s));
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, s: s, fy: at + (ab - at) / 2 };
  }
  function sMin() { return Math.min(vw / IW, stageH / IH) * .98; }
  function apply() {
    marksEl.classList.toggle('is-far', cam.s < .5);
    layer.style.transform = 'translate(' + (vw / 2 - cam.x * cam.s).toFixed(1) + 'px,' + (cam.fy - cam.y * cam.s).toFixed(1) + 'px) scale(' + cam.s.toFixed(4) + ')';
    place();
  }
  function scr(p) { return [vw / 2 + (p[0] - cam.x) * cam.s, cam.fy + (p[1] - cam.y) * cam.s]; }
  function glide(to, far) {
    cancelAnimationFrame(anim);
    if (reduce.matches || !to) { if (to) cam = to; apply(); return; }
    var from = { x: cam.x, y: cam.y, s: cam.s, fy: cam.fy }, t0 = performance.now();
    // Far apart: out, across and in, so the move can be followed; otherwise one even glide
    var dist = Math.hypot((to.x - from.x) * Math.min(from.s, to.s), (to.y - from.y) * Math.min(from.s, to.s));
    var dip = dist > vw * 1.2 ? .5 : 0, dur = dip ? 900 : 700;
    (function frame(now) {
      var t = Math.min(1, (now - t0) / dur), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      var ls = Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * e;
      cam = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, s: Math.exp(ls) * (1 - dip * Math.sin(Math.PI * e)), fy: from.fy + (to.fy - from.fy) * e };
      cam.s = Math.max(sMin(), cam.s);
      apply();
      if (t < 1) anim = requestAnimationFrame(frame);
    })(t0);
  }

  /* ---------- Pins, marks and routes ---------- */
  var pinEls = [];
  function pinsFor() {
    var out = [];
    if (!free) { var c = cards[cur]; if (c) c.pins.forEach(function (p) { if (onMap(p.ll)) out.push({ p: p, i: cur, strong: true }); }); return out; }
    // Explore freely: every day's stops; the day picked stays strong
    cards.forEach(function (c, i) { c.pins.forEach(function (p) { if (onMap(p.ll)) out.push({ p: p, i: i, strong: i === cur }); }); });
    return out;
  }
  function drawPins() {
    var ps = pinsFor(), c = cards[cur];
    pinsEl.innerHTML = ps.map(function (x, k) {
      var p = x.p, lbl = (x.strong && !free ? p.n + ' of ' + c.pins.length + ': ' : '') + p.title + ', ' + p.kindLabel + (free ? ', ' + cards[x.i].label : '') + (p.done ? ', on your plan' : '');
      return '<button type="button" class="tp-map-pin' + (x.strong ? ' is-strong' : ' is-faint') + (p.done ? ' is-done' : '') + (p.trip ? ' is-trip' : '') + '" data-k="' + k + '" aria-label="' + esc(lbl) + '">' +
        (p.done ? TICK : x.strong && !free ? '<span>' + p.n + '</span>' : '<span class="tp-map-dot"></span>') + '</button>';
    }).join('');
    pinEls = Array.prototype.slice.call(pinsEl.children).map(function (el, k) { return { el: el, x: ps[k] }; });
    // Home, the day's stadium and every stadium on their plan, as quiet marks with a short label
    var mk = [], home = c && c.home;
    if (home && onMap(home.ll)) mk.push({ ll: home.ll, cls: 'is-home', ico: HOME, t: home.name });
    var seen = {};
    cards.forEach(function (cc, i) { if (cc.kind === 'match' && cc.anchor && !seen[cc.anchor.name]) { seen[cc.anchor.name] = 1; mk.push({ ll: cc.anchor.ll, cls: 'is-stadium' + (i === cur ? ' is-now' : ''), ico: FLAG, t: cc.anchor.name }); } });
    if (c && !home && c.anchor && c.kind !== 'match') mk.push({ ll: c.anchor.ll, cls: 'is-base', ico: '', t: c.anchor.name });
    marksEl.innerHTML = mk.map(function (m, k) { return '<span class="tp-map-mark ' + m.cls + '" data-m="' + k + '"><span class="tp-map-mark-i">' + m.ico + '</span><span class="tp-map-mark-t">' + esc(m.t) + '</span></span>'; }).join('');
    marks = mk;
    place();
  }
  var marks = [];
  function curve(a, b, bow) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    var cx = mx - dy / len * len * bow, cy = my + dx / len * len * bow;
    return 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
  }
  function place() {
    // Pins close together are eased apart so each stays tappable (36px between centres), and kept off home and the stadium
    var P = pinEls.map(function (o) { var s = scr(px(o.x.p.ll)); return { x: s[0], y: s[1], o: o, r: o.x.strong ? 19 : 13 }; });
    var M = marks.map(function (m, k) { var s = scr(px(m.ll)), t = marksEl.children[k] && marksEl.children[k].querySelector('.tp-map-mark-t'); return { x: s[0], y: s[1], w: t && t.offsetParent ? t.offsetWidth : 0 }; });
    for (var it = 0; it < 6; it++) {
      for (var a = 0; a < P.length; a++) {
        for (var b2 = a + 1; b2 < P.length; b2++) {
          var dx = P[b2].x - P[a].x, dy = P[b2].y - P[a].y, d = Math.hypot(dx, dy), need = P[a].r + P[b2].r;
          if (d < need) { if (d < .01) { dx = 1; dy = 0; d = 1; } var push = (need - d) / 2; P[a].x -= dx / d * push; P[a].y -= dy / d * push; P[b2].x += dx / d * push; P[b2].y += dy / d * push; }
        }
        M.forEach(function (m) {
          var dx2 = P[a].x - m.x, dy2 = P[a].y - m.y, d2 = Math.hypot(dx2, dy2), need2 = P[a].r + 14;
          if (d2 < need2) { if (d2 < .01) { dx2 = 0; dy2 = -1; d2 = 1; } P[a].x = m.x + dx2 / d2 * need2; P[a].y = m.y + dy2 / d2 * need2; }
          // and off its label, which sits to the right of the mark: out above or below, whichever is nearer
          if (m.w && P[a].x + P[a].r > m.x + 12 && P[a].x - P[a].r < m.x + 14 + m.w && Math.abs(P[a].y - m.y) < P[a].r + 10) P[a].y = m.y + (P[a].y < m.y ? -1 : 1) * (P[a].r + 10);
        });
      }
    }
    P.forEach(function (q) { q.o.el.style.transform = 'translate(' + q.x.toFixed(1) + 'px,' + q.y.toFixed(1) + 'px)'; });
    Array.prototype.forEach.call(marksEl.children, function (el, k) { el.style.transform = 'translate(' + M[k].x.toFixed(1) + 'px,' + M[k].y.toFixed(1) + 'px)'; });
    // Loops out and back from home: today's dark and thick, solid out and dashed back; other days thin and grey.
    // Without a base, a route joins each day's place in date order
    var h = '', c = cards[cur];
    if (c && !c.home) {
      var chain = cards.map(function (cc) { return cc.anchor && onMap(cc.anchor.ll) ? scr(px(cc.anchor.ll)) : null; }).filter(Boolean);
      if (chain.length > 1) h += '<path class="tp-map-chain" d="M' + chain.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + '"/>';
    }
    cards.forEach(function (cc, i) {
      cc.loops.forEach(function (l, k) {
        if (!onMap(l.from) || !onMap(l.to)) return;
        var a = scr(px(l.from)), b = scr(px(l.to)), now = i === cur, bow = .16 + (k % 3) * .05;
        if (!now && !l.done && !l.match) return; // only what is planned, or today's ideas
        var cls = now ? (l.done || l.match ? 'is-now' : 'is-idea') : 'is-other';
        h += '<path class="tp-map-loop ' + cls + '" d="' + curve(a, b, bow) + '"/><path class="tp-map-loop is-back ' + cls + '" d="' + curve(b, a, bow) + '"/>';
      });
    });
    svg.innerHTML = h;
    // Off the map (a match interstate, a base far away): a chip at the edge pointing the way
    var e = '';
    [c && c.away, c && c.home && !onMap(c.home.ll) ? { ll: c.home.ll, name: c.home.name + ' (where you’re staying)' } : null].forEach(function (o) {
      if (!o) return;
      var p = scr(px(o.ll)), cx = vw / 2, cy = cam.fy, ang = Math.atan2(p[1] - cy, p[0] - cx);
      var r = Math.min((vw / 2 - 70) / Math.abs(Math.cos(ang) || 1e-6), ((stageH - 120) / 2) / Math.abs(Math.sin(ang) || 1e-6));
      var x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      e += '<span class="tp-map-edge" style="transform:translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px)"><span class="tp-map-edge-a" style="transform:rotate(' + (ang * 180 / Math.PI + 90).toFixed(0) + 'deg)">↑</span>' + esc(o.name) + '</span>';
    });
    edgesEl.innerHTML = e;
  }

  /* ---------- The card ---------- */
  function navLbl(i) { return steps[i] ? 'Day ' + (i + 1) : ''; }
  function drawCard(fresh) {
    var c = cards[cur], st = steps[cur]; if (!c) { card.innerHTML = ''; return; }
    var active = document.activeElement, keep = active && card.contains(active) ? (active.dataset.mstep ? '[data-mstep="' + active.dataset.mstep + '"]' : active.dataset.mtab ? '[data-mtab="' + active.dataset.mtab + '"]' : null) : null;
    var h = '<p class="tp-map-kicker">' + esc(c.kicker) + '</p><h4 class="tp-map-card-h" tabindex="-1">' + esc(c.title) + '</h4>';
    if (st.days.length > 1) h += '<div class="tp-map-tabs" role="group" aria-label="Pick a day">' + st.days.map(function (d) { var x = cardsFor(st, d); return '<button type="button" class="tp-chip" data-mtab="' + d + '" aria-pressed="' + (d === c.day) + '">' + esc(x ? x.label.replace(/ (Oct|Nov)$/, '') : '') + '</button>'; }).join('') + '</div>';
    if (c.note) h += '<p class="tp-map-note">' + esc(c.note) + '</p>';
    if (c.lead) h += '<div class="tp-map-lead">' + c.lead + '</div>';
    h += '<div class="tp-map-body">' + (c.body || '') + '</div>';
    h += '<div class="tp-map-nav"><button type="button" class="tp-link" data-mstep="-1"' + (cur ? '' : ' disabled') + '>← ' + esc(navLbl(cur - 1) || 'Day 1') + '</button>' +
      '<button type="button" class="tp-link" data-mlist>See as a list</button>' +
      '<button type="button" class="tp-link" data-mstep="1"' + (cur < steps.length - 1 ? '' : ' disabled') + '>' + esc(navLbl(cur + 1) || 'Last day') + ' →</button></div>';
    card.innerHTML = h;
    if (fresh && !reduce.matches && card.animate) card.animate([{ opacity: .35, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
    var f = keep && card.querySelector(keep);
    if (f && !f.disabled) f.focus({ preventScroll: true }); else if (keep) card.querySelector('.tp-map-card-h').focus({ preventScroll: true });
    pill.innerHTML = '<span>Day ' + (cur + 1) + ' of ' + steps.length + ' · ' + esc(placeOf(cur)) + '</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg>';
    pill.setAttribute('aria-label', 'Day ' + (cur + 1) + ' of ' + steps.length + ', ' + c.label + ', ' + placeOf(cur) + '. Jump to a day');
  }
  function cardsFor(st, d) { return tp.mapStep(st, d); }

  /* ---------- Steps ---------- */
  function goTo(i, opts) {
    opts = opts || {};
    i = Math.max(0, Math.min(steps.length - 1, i));
    var changed = i !== cur;
    cur = i; curDay = cards[i] ? cards[i].day : null;
    drawCard(changed && !opts.first);
    drawPins();
    var to = frameOf(i);
    if (opts.first || opts.cut) { cam = to; apply(); } else glide(to);
    if (changed && !opts.first) say('Day ' + (i + 1) + ' of ' + steps.length + ', ' + cards[i].label + ', ' + cards[i].kicker.split(' · ').slice(1).join(', ') + '. ' + cards[i].title + '.');
  }
  function jumpTo(i, smooth) {
    i = Math.max(0, Math.min(steps.length - 1, i));
    if (free) { goTo(i); return; }
    goTo(i);
    // While the page glides to the step, the days it passes are not stepped through
    var top = stepTop(i);
    pending = { top: top, until: performance.now() + 1200 };
    body.scrollTo({ top: top, behavior: smooth && !reduce.matches ? 'smooth' : 'auto' });
  }
  var pending = null;
  function onScroll() {
    if (!on || free || !steps.length) return;
    if (pending) { if (Math.abs(body.scrollTop - pending.top) > 4 && performance.now() < pending.until) return; pending = null; }
    var raw = (body.scrollTop - trackTop()) / stepPx, i = Math.max(0, Math.min(steps.length - 1, Math.round(raw)));
    if (i !== cur) goTo(i);
  }
  body.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { if (on) { layout(); goTo(cur, { cut: true }); } });

  /* ---------- Render (called by concepts-third-half.js on every change) ---------- */
  var seenDays = '';
  tp.mapRender = function () {
    var plan = tp.mapPlan(), can = !!(plan && plan.length);
    dview.hidden = !can;
    var m = mode(), want = can && m === 'map';
    seg.querySelectorAll('[data-dview]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.dview === m ? 'true' : 'false'); });
    segThumb();
    skip.hidden = !want;
    mapEl.hidden = !want; list.hidden = want;
    phone.classList.toggle('tp-map-on', want && !free);
    if (!want) { on = false; steps = []; cards = []; cur = -1; return; }
    var first = !on; on = true;
    steps = plan;
    // Keep the same day in view when the steps change (something added splits a merged run)
    cards = steps.map(function (st) { var d = sub[st.day] !== undefined && st.days.indexOf(sub[st.day]) > -1 ? sub[st.day] : st.days[0]; return tp.mapStep(st, d); });
    var keyNow = steps.map(function (s) { return s.days.join('-'); }).join(',');
    var idx = curDay === null ? 0 : steps.findIndex(function (s) { return s.days.indexOf(curDay) > -1; });
    if (idx < 0) idx = 0;
    layout();
    var shapeChanged = keyNow !== seenDays; seenDays = keyNow;
    cur = -1; goTo(idx, { first: first || shapeChanged, cut: !first && !shapeChanged });
    if (!first && shapeChanged && !free && body.scrollTop >= trackTop() - 4) body.scrollTo({ top: stepTop(idx), behavior: 'auto' });
  };
  function segThumb() {
    var t = seg.querySelector('.tp-seg-thumb'), b = seg.querySelector('[aria-pressed="true"]');
    if (!t || !b) return;
    t.style.left = b.offsetLeft + 'px'; t.style.width = b.offsetWidth + 'px';
  }

  /* ---------- Controls ---------- */
  dview.addEventListener('click', function (e) {
    var b = e.target.closest('[data-dview]');
    if (b) {
      var was = mode(); state.dayView = b.dataset.dview; tp.save();
      if (was === state.dayView) return;
      var day = curDay;
      if (state.dayView === 'list') { free = false; mapEl.classList.remove('is-free'); tp.mapRender(); if (day !== null && tp.listShowDay) tp.listShowDay(day); else b.focus(); return; }
      tp.mapRender();
      body.scrollTo({ top: stepTop(cur), behavior: 'auto' });
      b.focus({ preventScroll: true });
      return;
    }
    if (e.target.closest('.tp-map-skip')) {
      e.preventDefault();
      var top = endEl.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;
      body.scrollTo({ top: top, behavior: 'auto' });
      // Focus goes to the next section's heading, the first thing after the map
      var next = endEl.closest('.tp-sec'), h = null;
      while (next && !h) { next = next.nextElementSibling; h = next && next.querySelector('h2, h3'); }
      if (h && !h.hasAttribute('tabindex')) h.tabIndex = -1;
      (h || endEl).focus({ preventScroll: true });
    }
  });
  card.addEventListener('click', function (e) {
    var s = e.target.closest('[data-mstep]');
    if (s) { jumpTo(cur + +s.dataset.mstep, true); return; }
    var t = e.target.closest('[data-mtab]');
    if (t) { var st = steps[cur], d = +t.dataset.mtab; sub[st.day] = d; cards[cur] = tp.mapStep(st, d); curDay = d; goTo(cur, { cut: false }); var f = card.querySelector('[data-mtab="' + d + '"]'); if (f) f.focus({ preventScroll: true }); return; }
    if (e.target.closest('[data-mlist]')) { state.dayView = 'list'; tp.save(); var day = curDay; free = false; mapEl.classList.remove('is-free'); tp.mapRender(); if (tp.listShowDay) tp.listShowDay(day); }
  });
  // A pin and its card go together: tapping a pin shows its card; the cards row scrolled shows its pin
  function hot(n, scrollCard) {
    pinEls.forEach(function (o) { o.el.classList.toggle('is-hot', o.x.strong && o.x.p.n === n); });
    var row = card.querySelector('.tp-map-pcs'), el = row && row.querySelector('[data-pin="' + n + '"]');
    card.querySelectorAll('.tp-map-pcs .tp-pc').forEach(function (a) { a.classList.toggle('is-hot', a === el); });
    if (el && scrollCard) row.scrollTo({ left: el.offsetLeft - row.offsetLeft - 4, behavior: reduce.matches ? 'auto' : 'smooth' });
  }
  card.addEventListener('scroll', function (e) {
    var row = e.target; if (!row.classList || !row.classList.contains('tp-map-pcs')) return;
    var best = null, bd = Infinity;
    row.querySelectorAll('.tp-pc').forEach(function (a) { var d = Math.abs(a.offsetLeft - row.offsetLeft - row.scrollLeft); if (d < bd) { bd = d; best = a; } });
    if (best) hot(+best.dataset.pin, false);
  }, true);
  pinsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.tp-map-pin'); if (!b) return;
    var x = pinEls[+b.dataset.k].x;
    if (!free) { if (x.p.html) hot(x.p.n, true); return; }
    // Explore freely: a small card for the pin, with Add for its day and a way to that day
    var c = cards[x.i];
    pop.innerHTML = '<p class="tp-map-pop-t">' + esc(x.p.title) + '</p><p class="tp-map-pop-m">' + esc(x.p.kindLabel) + ' · ' + esc(c.label) + '</p>' +
      '<div class="tp-map-pop-a">' + (x.p.key ? '<button type="button" class="tp-add" data-item="' + esc(x.p.key) + '" aria-pressed="false"><span aria-hidden="true">' + PLUS + '<span class="tp-add-t">Add to ' + esc(c.label) + '</span></span><span class="visually-hidden">Add ' + esc(x.p.title) + ' to your timeline on ' + esc(c.label) + '</span></button>' : '<span class="tp-map-pop-done">' + TICK + ' On your plan</span>') +
      '<button type="button" class="tp-link" data-mgo="' + x.i + '">Go to ' + esc(c.label) + '</button><button type="button" class="tp-link" data-mpop-close>Close</button></div>';
    pop.hidden = false;
    var f = pop.querySelector('.tp-add, [data-mgo]'); if (f) f.focus({ preventScroll: true });
  });
  pop.addEventListener('click', function (e) {
    var g = e.target.closest('[data-mgo]');
    if (g) { pop.hidden = true; setFree(false, +g.dataset.mgo); return; }
    if (e.target.closest('[data-mpop-close]') || e.target.closest('.tp-add')) setTimeout(function () { pop.hidden = true; view.focus({ preventScroll: true }); }, e.target.closest('.tp-add') ? 600 : 0);
  });

  /* ---------- Jump to a day ---------- */
  function openJump() {
    jump.innerHTML = '<div class="tp-map-jump-top"><h4 id="tp-map-jump-h">Your days</h4><button type="button" class="tp-link" data-jclose>Close</button></div><ol class="tp-map-jump-l">' +
      steps.map(function (st, i) { var c = cards[i]; return '<li><button type="button" data-jump="' + i + '"' + (i === cur ? ' aria-current="step"' : '') + '><span class="tp-map-jump-n">' + (i + 1) + '</span><span class="tp-map-jump-d">' + esc(st.days.length > 1 ? c.label.replace(/ (Oct|Nov)$/, '') + ' to ' + cardsFor(st, st.days[st.days.length - 1]).label : c.label) + '</span><span class="tp-map-jump-k">' + esc(c.kicker.split(' · ').slice(1).filter(function (x) { return !/^from /.test(x); }).join(' · ')) + (c.place ? ' · ' + esc(c.place) : '') + '</span></button></li>'; }).join('') +
      '</ol><button type="button" class="tp-link tp-map-jump-list" data-mlist2>See as a list instead</button>';
    jump.hidden = false; pill.setAttribute('aria-expanded', 'true');
    var f = jump.querySelector('[aria-current]') || jump.querySelector('[data-jump]'); f.focus({ preventScroll: true });
    f.scrollIntoView({ block: 'nearest' });
  }
  function closeJump(back) { jump.hidden = true; pill.setAttribute('aria-expanded', 'false'); if (back !== false) pill.focus({ preventScroll: true }); }
  pill.addEventListener('click', function () { if (jump.hidden) openJump(); else closeJump(); });
  jump.addEventListener('click', function (e) {
    var j = e.target.closest('[data-jump]');
    if (j) { closeJump(false); jumpTo(+j.dataset.jump, false); card.querySelector('.tp-map-card-h').focus({ preventScroll: true }); return; }
    if (e.target.closest('[data-jclose]')) { closeJump(); return; }
    if (e.target.closest('[data-mlist2]')) { closeJump(false); state.dayView = 'list'; tp.save(); var day = curDay; tp.mapRender(); if (tp.listShowDay) tp.listShowDay(day); }
  });
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!jump.hidden) { e.stopPropagation(); closeJump(); }
      else if (!pop.hidden) { e.stopPropagation(); pop.hidden = true; view.focus({ preventScroll: true }); }
      return;
    }
    if (e.key === 'Tab' && !jump.hidden) {
      var fs = jump.querySelectorAll('button'), a = fs[0], z = fs[fs.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* ---------- Explore freely ---------- */
  function setFree(v, goStep) {
    free = v;
    mapEl.classList.toggle('is-free', v);
    freeBtn.setAttribute('aria-pressed', v ? 'true' : 'false');
    freeBtn.querySelector('.tp-map-free-l').textContent = v ? 'Back to the guided route' : 'Explore freely';
    zoomEl.hidden = !v; pop.hidden = true;
    phone.classList.toggle('tp-map-on', on && !v);
    layout();
    if (v) {
      body.scrollTo({ top: trackTop(), behavior: 'auto' });
      drawPins();
      view.focus({ preventScroll: true });
      say('Explore freely. Drag to move, pinch or use plus and minus to zoom. Every day’s stops are shown.');
    } else {
      var i = goStep !== undefined ? goStep : cur;
      cur = -1; goTo(i, { first: false });
      body.scrollTo({ top: stepTop(i), behavior: 'auto' });
      freeBtn.focus({ preventScroll: true });
    }
  }
  freeBtn.addEventListener('click', function () { setFree(!free); });
  function zoomBy(f, cx, cy) {
    cancelAnimationFrame(anim);
    cx = cx === undefined ? vw / 2 : cx; cy = cy === undefined ? cam.fy : cy;
    var ns = Math.max(sMin(), Math.min(1.6, cam.s * f)), wx = cam.x + (cx - vw / 2) / cam.s, wy = cam.y + (cy - cam.fy) / cam.s;
    cam = { x: wx - (cx - vw / 2) / ns, y: wy - (cy - cam.fy) / ns, s: ns, fy: cam.fy }; clampCam(); apply();
  }
  function clampCam() {
    // Keep the picture filling the view where it can (no edge of the illustration showing)
    var hw = vw / 2 / cam.s, top = cam.fy / cam.s, bot = (stageH - cam.fy) / cam.s;
    cam.x = hw * 2 >= IW ? IW / 2 : Math.max(hw, Math.min(IW - hw, cam.x));
    cam.y = top + bot >= IH ? IH / 2 : Math.max(top, Math.min(IH - bot, cam.y));
  }
  zoomEl.addEventListener('click', function (e) {
    var z = e.target.closest('[data-zoom]'); if (!z) return;
    if (z.dataset.zoom === 'in') zoomBy(1.4); else if (z.dataset.zoom === 'out') zoomBy(1 / 1.4); else glide(frameOf(cur));
  });
  view.addEventListener('keydown', function (e) {
    if (!free) return;
    var k = e.key, step = 60 / cam.s;
    if (k === 'ArrowLeft') cam.x -= step; else if (k === 'ArrowRight') cam.x += step; else if (k === 'ArrowUp') cam.y -= step; else if (k === 'ArrowDown') cam.y += step;
    else if (k === '+' || k === '=') { zoomBy(1.3); e.preventDefault(); return; } else if (k === '-') { zoomBy(1 / 1.3); e.preventDefault(); return; } else if (k === '0') { glide(frameOf(cur)); e.preventDefault(); return; }
    else return;
    e.preventDefault(); cancelAnimationFrame(anim); clampCam(); apply();
  });
  // Drag to pan, pinch to zoom (Explore freely only; guided, the page scroll moves the map)
  var ptrs = new Map(), drag = null;
  view.addEventListener('pointerdown', function (e) {
    if (!free || e.target.closest('.tp-map-pin')) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { view.setPointerCapture(e.pointerId); } catch (err) {}
    cancelAnimationFrame(anim);
    drag = { cam: { x: cam.x, y: cam.y, s: cam.s, fy: cam.fy }, pts: new Map(ptrs) };
  });
  view.addEventListener('pointermove', function (e) {
    if (!free || !ptrs.has(e.pointerId) || !drag) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    var ids = Array.from(ptrs.keys()), a0 = drag.pts.get(ids[0]), a1 = ptrs.get(ids[0]);
    if (!a0) return;
    if (ids.length > 1 && drag.pts.get(ids[1])) {
      var b0 = drag.pts.get(ids[1]), b1 = ptrs.get(ids[1]);
      var f = Math.hypot(a1.x - b1.x, a1.y - b1.y) / Math.max(20, Math.hypot(a0.x - b0.x, a0.y - b0.y));
      cam = { x: drag.cam.x - ((a1.x + b1.x) - (a0.x + b0.x)) / 2 / drag.cam.s, y: drag.cam.y - ((a1.y + b1.y) - (a0.y + b0.y)) / 2 / drag.cam.s, s: Math.max(sMin(), Math.min(1.6, drag.cam.s * f)), fy: drag.cam.fy };
    } else cam = { x: drag.cam.x - (a1.x - a0.x) / drag.cam.s, y: drag.cam.y - (a1.y - a0.y) / drag.cam.s, s: drag.cam.s, fy: drag.cam.fy };
    clampCam(); apply();
  });
  function endPtr(e) { ptrs.delete(e.pointerId); drag = ptrs.size ? { cam: { x: cam.x, y: cam.y, s: cam.s, fy: cam.fy }, pts: new Map(ptrs) } : null; }
  view.addEventListener('pointerup', endPtr);
  view.addEventListener('pointercancel', endPtr);

  // The first render may have happened before this file loaded
  if (typeof tp.mapRender === 'function') setTimeout(function () { tp.mapRender(); }, 0);
})();
