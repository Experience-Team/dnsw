/* Two maps on the Pick your team prototype, both the gallery's illustration rendered flat (assets/images/map).
   1. Around the matches in NSW, under the team cards (the overview, near the end of this file): calm context in a fixed
      box, never sticky, loaded only when it comes near the screen. See its own comment for the three stages.
   2. Your days, in order (guided): only once their days are set AND they press Follow day by day on the overview. It is
      pinned while the page scrolls past it one day at a time: each step glides the camera to that day (home on free
      days, the stadium on match days), shows the day's card with the same cards and Add buttons as the list
      (concepts-third-half.js, tp.mapStep), and numbered pins around it. Progress pill with a list of days to jump to,
      Explore freely (pan and zoom, every day's stops), See as a list, Back to the overview, Skip the map. A long plan
      merges runs of empty free days and shortens each step, and the map lets go straight after the last day. The list
      below always shows. Coordinates are made up (concepts-geo.js), except the three stadiums. Reworked 15 Nov 2026. */
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
  var ICO = function (d) { return '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'; };
  var I_PLUS = ICO('M8 3.5v9M3.5 8h9'), I_MINUS = ICO('M3.5 8h9'), I_CENTRE = ICO('M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3M8 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z'), I_ARROW = ICO('M8 13V3M4 7l4-4 4 4'), I_DOWN = ICO('M8 3v10M4 9l4 4 4-4');
  var FLAG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 14V2.5M4 3h7.5l-1.8 2.5L11.5 8H4"/></svg>';

  /* ---------- Markup ---------- */
  // Following day by day is something they choose (Follow day by day, on the map above the matches); these leave it
  var dview = document.createElement('div');
  dview.className = 'tp-dview'; dview.hidden = true;
  dview.innerHTML = '<button type="button" class="tp-map-skip" data-mback>' + I_ARROW + 'Back to the overview</button>' +
    '<a class="tp-map-skip" href="#tp-map-end">Skip the map' + I_DOWN + '</a>';
  var mapEl = document.createElement('div');
  mapEl.className = 'tp-map'; mapEl.id = 'tp-map'; mapEl.hidden = true;
  mapEl.innerHTML = '<div class="tp-map-snaps" aria-hidden="true"></div>' +
    '<div class="tp-map-stage" role="region" aria-label="Map of your days">' +
      '<div class="tp-map-top"><button type="button" class="tp-map-pill" aria-haspopup="dialog" aria-expanded="false"></button>' +
        '<button type="button" class="tp-map-free" aria-pressed="false"><span class="tp-map-free-l">Explore freely</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5L9 7M6.5 13.5h-4v-4M2.5 13.5L7 9"/></svg></button></div>' +
      '<div class="tp-map-view" tabindex="-1" aria-label="Map. In Explore freely: arrow keys move, plus and minus zoom, zero resets.">' +
        '<div class="tp-map-layer"><img class="tp-map-img" width="' + IW + '" height="' + IH + '" alt="" decoding="async" draggable="false"></div>' +
        '<svg class="tp-map-routes" aria-hidden="true"></svg><div class="tp-map-marks" aria-hidden="true"></div><div class="tp-map-pins"></div><div class="tp-map-clusters"></div><div class="tp-map-edges" aria-hidden="true"></div>' +
      '</div>' +
      '<div class="tp-map-key" aria-hidden="true"></div>' +
      '<div class="tp-map-zoom" hidden><button type="button" data-zoom="in" aria-label="Zoom in">' + I_PLUS + '</button><button type="button" data-zoom="out" aria-label="Zoom out">' + I_MINUS + '</button><button type="button" data-zoom="reset" aria-label="Back to this day">' + I_CENTRE + '</button></div>' +
      '<div class="tp-map-pop" hidden></div>' +
      '<div class="tp-map-card"></div>' +
      '<p class="tp-map-hint" aria-hidden="true" hidden><svg viewBox="0 0 12 12"><path d="M7.5 2.5L4 6l3.5 3.5"/></svg><span>Swipe left or right for each day</span><svg viewBox="0 0 12 12"><path d="M4.5 2.5L8 6 4.5 9.5"/></svg></p>' +
      '<div class="tp-map-jump" role="dialog" aria-modal="true" aria-labelledby="tp-map-jump-h" hidden></div>' +
      '<p class="visually-hidden" aria-live="polite" id="tp-map-say"></p>' +
    '</div>';
  var endEl = document.createElement('span');
  endEl.id = 'tp-map-end'; endEl.tabIndex = -1; endEl.className = 'tp-map-end';
  list.parentNode.insertBefore(dview, list);
  list.parentNode.insertBefore(endEl, list);
  /* Full screen (16 Nov): following day by day opens over the whole phone with a close cross at the top, so it is
     always one tap to leave; the map steps through the days as this layer (not the page) scrolls. The page behind
     never moves, and closing puts focus back on Follow day by day. Escape closes it too. */
  var fs = document.createElement('div');
  fs.className = 'tp-mapfs'; fs.hidden = true;
  fs.setAttribute('role', 'dialog'); fs.setAttribute('aria-modal', 'true'); fs.setAttribute('aria-labelledby', 'tp-mapfs-h');
  fs.innerHTML = '<div class="cn-bar tp-mapfs-bar"><p class="cn-bar-title" id="tp-mapfs-h">Your days, day by day</p><button type="button" class="cn-close" data-mclose aria-label="Close day by day"><svg class="cn-x" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div>' +
    '<div class="tp-mapfs-scroll"></div>';
  var sc = fs.querySelector('.tp-mapfs-scroll');
  sc.appendChild(mapEl);
  phone.appendChild(fs);
  var fsBehind = [], fsOpener = null;
  var stage = mapEl.querySelector('.tp-map-stage'), view = mapEl.querySelector('.tp-map-view'), layer = mapEl.querySelector('.tp-map-layer');
  var svg = mapEl.querySelector('.tp-map-routes'), marksEl = mapEl.querySelector('.tp-map-marks'), pinsEl = mapEl.querySelector('.tp-map-pins'), edgesEl = mapEl.querySelector('.tp-map-edges');
  var pill = mapEl.querySelector('.tp-map-pill'), freeBtn = mapEl.querySelector('.tp-map-free'), zoomEl = mapEl.querySelector('.tp-map-zoom');
  var card = mapEl.querySelector('.tp-map-card'), jump = mapEl.querySelector('.tp-map-jump'), pop = mapEl.querySelector('.tp-map-pop'), sayEl = mapEl.querySelector('#tp-map-say');
  var keyEl = mapEl.querySelector('.tp-map-key'), clustersEl = mapEl.querySelector('.tp-map-clusters');
  var measure = document.createElement('div'); measure.className = 'tp-map-card tp-map-measure'; measure.setAttribute('aria-hidden', 'true');
  mapEl.querySelector('.tp-map-stage').appendChild(measure);
  var snaps = mapEl.querySelector('.tp-map-snaps'), skip = dview.querySelector('a.tp-map-skip'), gImg = mapEl.querySelector('.tp-map-img');
  var IMG = 'assets/images/map/nsw-relief.webp';

  /* ---------- State ---------- */
  var steps = [], cards = [], sub = {}, cur = -1, curDay = null, on = false, free = false;
  var cam = { x: IW / 2, y: IH / 2, s: .2, fy: 200 }, anim = 0, stageH = 600, stepPx = 400, vw = 390;
  // Guided (pinned while the page steps through their days) only once they press Follow day by day; not kept on reload,
  // so scrolling the page never quietly turns into stepping through a map
  var guided = false;
  function say(t) { sayEl.textContent = ''; setTimeout(function () { sayEl.textContent = t; }, 30); }
  function trackTop() { return mapEl.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop; }
  function stepTop(i) { return Math.round(trackTop() + i * stepPx); }
  function placeOf(i) { var c = cards[i]; return c ? c.place || '' : ''; }

  /* ---------- Layout ---------- */
  function layout() {
    var bar = document.getElementById('tp-tl');
    stageH = Math.max(360, sc.clientHeight); // the full-screen layer under its close bar
    vw = mapEl.clientWidth || 390;
    var n = steps.length;
    // Each day is one deliberate swipe: shorter steps for a long plan, and the map lets go after the last day
    stepPx = Math.round(stageH * (n <= 14 ? .5 : .36)); // half a screen a day (agreed 15 Nov; was 70% up to 8 days)
    mapEl.style.setProperty('--stage-h', stageH + 'px');
    // Since 16 Nov the layer is one fixed screen: days are stepped explicitly (swipe the map, the arrows, a dot, the day
    // list or the arrow keys), never by scrolling
    mapEl.style.height = stageH + 'px';
    snaps.innerHTML = '';
  }

  /* ---------- Camera ---------- */
  function availTop() { return 96; } // under the controls and the key
  var nextH = null; // the height of a held card that has not been drawn yet, so the map frames the day around it
  // The map is framed against the collapsed sheet, so opening the ideas never moves it
  function availBottom() { return stageH - (nextH || collapsedH || card.offsetHeight || 260) - 14; }
  function frameOf(i) {
    var c = cards[i]; if (!c) return null;
    var pts = [];
    if (c.anchor && onMap(c.anchor.ll)) pts.push(px(c.anchor.ll));
    c.pins.forEach(function (p) { if (onMap(p.ll)) pts.push(px(p.ll)); });
    if (c.kind === 'match' && c.start && onMap(c.start.ll)) pts.push(px(c.start.ll)); // where the day starts, and the stadium
    if (!pts.length) pts.push(px([-33.8688, 151.2093]));
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    // Match day frames a journey, so its pins, pushed off the stadium's mark, need more room above the card
    var at = availTop(), ab = Math.max(at + 160, availBottom() - (c.kind === 'match' ? 48 : 0)), aw = vw - 120, ah = ab - at - 64;
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
  function glide(to) {
    cancelAnimationFrame(anim);
    if (reduce.matches || !to) { if (to) cam = to; apply(); return 0; }
    var from = { x: cam.x, y: cam.y, s: cam.s, fy: cam.fy }, t0 = performance.now();
    var io = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    // Far apart (it would race across more than a screen): pull back until both places are in view, travel there, then
    // close in, so the eye can follow where it is going. Near: one even glide.
    var dx = Math.abs(to.x - from.x), dy = Math.abs(to.y - from.y);
    var far = Math.hypot(dx, dy) * Math.min(from.s, to.s) > vw * 1.2;
    var sMid = far ? Math.max(sMin(), Math.min(from.s, to.s, (vw - 80) / Math.max(dx, 1), Math.max(120, availBottom() - availTop() - 40) / Math.max(dy, 1))) : 0; // fits both in the visible map above the card
    var dur = far ? 1200 : 700, L0 = Math.log(from.s), L1 = Math.log(to.s), LM = far ? Math.log(sMid) : 0;
    (function frame(now) {
      var t = Math.min(1, (now - t0) / dur), e = io(t), ls;
      // Far: out (first 38%), held while it travels (both places in view), then in; it travels mostly while held
      if (far) { ls = t < .38 ? L0 + (LM - L0) * io(t / .38) : t < .62 ? LM : LM + (L1 - LM) * io((t - .62) / .38); e = io(Math.max(0, Math.min(1, (t - .18) / .64))); }
      else ls = L0 + (L1 - L0) * e;
      cam = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, s: Math.max(sMin(), Math.exp(ls)), fy: from.fy + (to.fy - from.fy) * e };
      if (far) clampCam(); // pulled right back, the view stays on the picture (no edge of the drawing shows)
      apply();
      if (t < 1) anim = requestAnimationFrame(frame);
    })(t0);
    return dur;
  }


  /* ---------- Pins, marks and routes ---------- */
  var pinEls = [];
  function pinsFor() {
    var out = [];
    if (!free) { var c = cards[cur]; if (c) c.pins.forEach(function (p) { if (onMap(p.ll)) out.push({ p: p, i: cur, strong: true }); }); return out; }
    // Explore freely: every day's stops, each day of a merged step included; the day picked stays strong
    steps.forEach(function (st, i) {
      st.days.forEach(function (d) {
        var c = d === cards[i].day ? cards[i] : tp.mapStep(st, d);
        c.pins.forEach(function (p) { if (onMap(p.ll)) out.push({ p: p, i: i, c: c, strong: i === cur && d === cards[i].day }); });
      });
    });
    return out;
  }
  function drawPins() {
    var ps = pinsFor(), c = cards[cur];
    pinsEl.innerHTML = ps.map(function (x, k) {
      var p = x.p, lbl = (x.strong && !free ? p.n + ' of ' + c.pins.length + ': ' : '') + p.title + ', ' + p.kindLabel + (free ? ', ' + (x.c || cards[x.i]).label : '') + (p.done ? ', on your plan' : '');
      return '<button type="button" class="tp-map-pin' + (x.strong ? ' is-strong' : ' is-faint') + (p.done ? ' is-done' : '') + (p.trip ? ' is-trip' : '') + '" data-k="' + k + '" aria-label="' + esc(lbl) + '">' +
        (p.done ? TICK : x.strong && !free ? '<span>' + p.n + '</span>' : '<span class="tp-map-dn">' + ((x.c || cards[x.i]).label.split(' ')[1] || '') + '</span>') + '</button>';
    }).join('');
    pinEls = Array.prototype.slice.call(pinsEl.children).map(function (el, k) { return { el: el, x: ps[k] }; });
    // Home, the day's stadium and every stadium on their plan, as quiet marks with a short label
    var mk = [], home = c && c.home;
    if (home && onMap(home.ll)) mk.push({ ll: home.ll, cls: 'is-home', ico: HOME, t: home.name });
    var seen = {};
    cards.forEach(function (cc, i) { if (cc.kind === 'match' && cc.anchor && !seen[cc.anchor.name]) { seen[cc.anchor.name] = 1; mk.push({ ll: cc.anchor.ll, cls: 'is-stadium' + (i === cur ? ' is-now' : ''), ico: FLAG, t: cc.anchor.name }); } });
    if (c && !home && c.anchor && c.kind !== 'match') mk.push({ ll: c.anchor.ll, cls: 'is-base', ico: '', t: c.anchor.name });
    if (c && !home && c.kind === 'match' && c.start && onMap(c.start.ll)) mk.push({ ll: c.start.ll, cls: 'is-base', ico: '', t: c.start.name });
    var names = {}; mk = mk.filter(function (m) { if (names[m.t]) return false; names[m.t] = 1; return true; });
    marksEl.innerHTML = mk.map(function (m, k) { return '<span class="tp-map-mark ' + m.cls + '" data-m="' + k + '"><span class="tp-map-mark-i">' + m.ico + '</span><span class="tp-map-mark-t">' + esc(m.t) + '</span></span>'; }).join('');
    marks = mk;
    place();
  }
  var marks = [], clusters = [];
  function curve(a, b, bow) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    var cx = mx - dy / len * len * bow, cy = my + dx / len * len * bow;
    return 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
  }
  function place() {
    // Pins close together are eased apart so each stays tappable (36px between centres), and kept off home and the stadium
    var P = pinEls.map(function (o) { var s = scr(px(o.x.p.ll)); return { x: s[0], y: s[1], o: o, r: o.x.strong ? 19 : 13 }; });
    // A label that would run off the right edge sits to the left of its mark instead
    var M = marks.map(function (m, k) {
      var s = scr(px(m.ll)), el = marksEl.children[k], t = el && el.querySelector('.tp-map-mark-t'), w = t && t.offsetParent ? t.offsetWidth : 0, left = s[0] + 16 + w > vw - 8;
      // A mark off the side of the map takes its label with it (a label alone at the edge was cut off); one that would
      // run off either side flips to the side with room
      var gone = s[0] < 4 || s[0] > vw - 4 || s[1] < 0 || s[1] > stageH;
      if (left && s[0] - 16 - w < 8) left = false;
      if (el) { el.classList.toggle('is-left', left); el.style.marginLeft = left ? -(w + 16) + 'px' : ''; el.style.visibility = gone ? 'hidden' : ''; }
      return { x: s[0], y: s[1], w: w, left: left };
    });
    // Explore freely: stops close together on screen become one marker with a count (tap it to zoom in)
    var groups = [];
    if (free) {
      var taken = [];
      P.forEach(function (q, a) {
        if (taken[a]) return;
        var g = [q]; taken[a] = true;
        P.forEach(function (o, b) { if (!taken[b] && Math.hypot(o.x - q.x, o.y - q.y) < 34) { g.push(o); taken[b] = true; } });
        if (g.length > 1) groups.push(g);
      });
      // Groups whose markers would touch are merged, so no two markers overlap
      var cen = function (g) { return [g.reduce(function (t, q) { return t + q.x; }, 0) / g.length, g.reduce(function (t, q) { return t + q.y; }, 0) / g.length]; };
      for (var merged = true; merged;) {
        merged = false;
        for (var i1 = 0; i1 < groups.length && !merged; i1++) for (var i2 = i1 + 1; i2 < groups.length; i2++) {
          var c1 = cen(groups[i1]), c2 = cen(groups[i2]);
          if (Math.abs(c1[0] - c2[0]) < 80 && Math.abs(c1[1] - c2[1]) < 40) { groups[i1] = groups[i1].concat(groups[i2]); groups.splice(i2, 1); merged = true; break; }
        }
      }
      groups.forEach(function (g) { g.forEach(function (q) { q.hide = true; }); });
      clustersEl.innerHTML = groups.map(function (g, k) {
        var cx = g.reduce(function (t, q) { return t + q.x; }, 0) / g.length, cy = g.reduce(function (t, q) { return t + q.y; }, 0) / g.length;
        g.cx = cx; g.cy = cy;
        return '<button type="button" class="tp-map-cluster" data-g="' + k + '" style="transform:translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)" aria-label="' + g.length + ' stops here. Zoom in"><b>' + g.length + '</b> stops</button>';
      }).join('');
    } else if (clustersEl.firstChild) clustersEl.innerHTML = '';
    clusters = groups;
    P = P.filter(function (q) { q.o.el.hidden = !!q.hide; return !q.hide; });
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
          var l0 = m.left ? m.x - 14 - m.w : m.x + 12, l1 = m.left ? m.x - 12 : m.x + 14 + m.w;
          if (m.w && P[a].x + P[a].r > l0 && P[a].x - P[a].r < l1 && Math.abs(P[a].y - m.y) < P[a].r + 10) P[a].y = m.y + (P[a].y < m.y ? -1 : 1) * (P[a].r + 10);
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
      e += '<span class="tp-map-edge" style="transform:translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px)"><span class="tp-map-edge-a" style="transform:rotate(' + (ang * 180 / Math.PI + 90).toFixed(0) + 'deg)">' + I_ARROW + '</span>' + esc(o.name) + '</span>';
    });
    edgesEl.innerHTML = e;
  }

  /* ---------- The card ---------- */
  function navLbl(i) { return steps[i] ? 'Day ' + (i + 1) : ''; }
  /* The card's bottom row: ← Day n, a dot per day, Day n →. The arrow with nowhere to go is left out (a spacer keeps
     the dots centred). The dots are 24px targets, so they show only while they fit; past that the row says Day n of N. */
  function dotsHtml(i) {
    var n = steps.length; if (n < 2) return '';
    var room = Math.max(0, (card.clientWidth || vw - 20) - 24 - 2 * 72);
    if (n * 24 > room) return '<span class="tp-map-dots-t" aria-hidden="true">Day ' + (i + 1) + ' of ' + n + '</span>';
    return '<span class="tp-map-dots" role="group" aria-label="Your days">' + steps.map(function (st, k) {
      return '<button type="button" class="tp-map-dot" data-mjump="' + k + '" aria-label="Day ' + (k + 1) + ' of ' + n + ', ' + esc(cards[k] ? cards[k].label : '') + '"' + (k === i ? ' aria-current="step"' : '') + '><i></i></button>';
    }).join('') + '</span>';
  }
  // The last day ends on one line: how many days, and how much is planned in them (matches are not counted)
  function summary() {
    var t = state.trip || {}, a = t.from ? tp.isoDay(t.from) : null, z = t.to ? tp.isoDay(t.to) : null;
    var days = a !== null && z !== null ? z - a + 1 : steps.reduce(function (n, st) { return n + st.days.length; }, 0);
    var n = state.added.filter(function (x) {
      if (x.kind === 'match' || x.unplaced) return false;
      var d = x.kind === 'trip' && x.start !== undefined ? x.start : x.day ? tp.dayOf(x.day) : null;
      return d === null || a === null ? true : d >= a && d <= z;
    }).length;
    return days + (days === 1 ? ' day, ' : ' days, ') + (n ? n + (n === 1 ? ' thing' : ' things') + ' added' : 'nothing added yet');
  }
  /* Match day leads with the match (16 Nov): the two teams' stripes along the top edge (the same bands as their cards on
     the page), the date, then the teams with their flags as the card's heading, then kick-off and the venue */
  function bandHtml(n) { var cols = tp.teamBand ? tp.teamBand(n) : null; return '<span class="tp-map-band-t">' + (cols || ['var(--c-btn)']).map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>'; }
  function heroHtml(c) {
    var x = c.hero, t = x.teams;
    var who = t.length ? t.map(function (n) { return '<span class="tp-map-team">' + (tp.flag(n) ? '<span aria-hidden="true">' + tp.flag(n) + '</span>' : '') + esc(n) + '</span>'; }).join(' <span class="tp-map-v">v</span> ') : 'Teams to be decided';
    return (t.length ? '<div class="tp-map-band" aria-hidden="true">' + t.map(bandHtml).join('') + '</div>' : '') +
      '<div class="tp-map-card-top"><p class="tp-map-kick">' + esc(c.kicker) + (x.ticket ? ' \u00b7 Your ticket' : '') + '</p><button type="button" class="tp-link tp-map-aslist" data-mlist>See as a list</button></div>' +
      '<h4 class="tp-map-card-h tp-map-match-h" tabindex="-1">' + who + '</h4>' +
      '<p class="tp-map-match-m">' + esc((x.k ? x.k + ' kick-off' : 'Kick-off to be confirmed') + ' \u00b7 ' + x.v) + '</p>';
  }
  var sheetOpen = false, collapsedH = 0;
  function cardHtml(i) {
    var c = cards[i], st = steps[i]; if (!c) return '';
    var n = steps.length, last = i === n - 1;
    var grab = '<span class="tp-map-grab" aria-hidden="true"></span>';
    var h = grab + (c.hero ? heroHtml(c) : '<div class="tp-map-card-top"><h4 class="tp-map-card-h" tabindex="-1">' + esc(c.kicker) + '</h4><button type="button" class="tp-link tp-map-aslist" data-mlist>See as a list</button></div>' + (c.title ? '<p class="tp-map-title">' + esc(c.title) + '</p>' : ''));
    if (st.days.length > 1) h += '<div class="tp-map-tabs" role="group" aria-label="Pick a day">' + st.days.map(function (d) { var x = cardsFor(st, d); return '<button type="button" class="tp-chip" data-mtab="' + d + '" aria-pressed="' + (d === c.day) + '">' + esc(x ? x.label.replace(/ (Oct|Nov)$/, '') : '') + '</button>'; }).join('') + '</div>';
    if (c.note) h += '<p class="tp-map-note">' + esc(c.note) + '</p>';
    if (c.lead) h += '<div class="tp-map-lead">' + c.lead + '</div>';
    // A bottom sheet (16 Nov): collapsed it shows the day, getting there and how to move between days; the day's ideas
    // open with the row below (or by dragging the grabber up, or tapping a pin). The choice carries from day to day.
    var nIdeas = c.pins.filter(function (p) { return p.html; }).length, hasBody = !!(c.body && c.body.replace(/<[^>]+>/g, '').trim());
    if (hasBody) h += '<button type="button" class="tp-map-more" data-msheet aria-expanded="' + sheetOpen + '" aria-controls="tp-map-body"><span>' + (nIdeas ? nIdeas + (nIdeas === 1 ? ' idea' : ' ideas') + ' for this day' : 'Details for this day') + '</span><span class="tp-map-more-a">' + (sheetOpen ? 'Hide' : 'Show') + '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 7.5L6 4l3.5 3.5"/></svg></span></button>' +
      '<div class="tp-map-body" id="tp-map-body"' + (sheetOpen ? '' : ' hidden') + '>' + c.body + '</div>';
    if (last) h += '<p class="tp-map-sum">' + esc(summary()) + '</p>';
    h += '<div class="tp-map-nav">' + (i ? '<button type="button" class="tp-link tp-map-arrow" data-mstep="-1">← ' + esc(navLbl(i - 1)) + '</button>' : '<span class="tp-map-arrow" aria-hidden="true"></span>') +
      dotsHtml(i) +
      (last ? '<span class="tp-map-arrow" aria-hidden="true"></span>' : '<button type="button" class="tp-link tp-map-arrow" data-mstep="1">' + esc(navLbl(i + 1)) + ' →</button>') + '</div>';
    return h;
  }
  // Status changes at once (the pill and the dots); the card itself may be held until the map has mostly arrived
  function drawStatus(i) {
    var c = cards[i]; if (!c) return;
    pill.innerHTML = '<span>Day ' + (i + 1) + ' of ' + steps.length + ' · ' + esc(placeOf(i)) + '</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg>';
    pill.setAttribute('aria-label', 'Day ' + (i + 1) + ' of ' + steps.length + ', ' + c.label + ', ' + placeOf(i) + '. Jump to a day');
    card.querySelectorAll('[data-mjump]').forEach(function (d) { if (+d.dataset.mjump === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
    var dt = card.querySelector('.tp-map-dots-t'); if (dt) dt.textContent = 'Day ' + (i + 1) + ' of ' + steps.length;
  }
  function collapsedHeight(i) { var o = sheetOpen; sheetOpen = false; measure.innerHTML = cardHtml(i); sheetOpen = o; var hh = measure.offsetHeight; measure.innerHTML = ''; return hh; }
  // Open or close the sheet: its height glides between the two (240ms; reduced motion: at once); the map stays put
  function setSheet(v, focusSel) {
    if (v === sheetOpen) return;
    var h0 = card.offsetHeight;
    sheetOpen = v;
    var b = card.querySelector('.tp-map-body'), t = card.querySelector('[data-msheet]');
    if (b) b.hidden = !v;
    if (t) { t.setAttribute('aria-expanded', v ? 'true' : 'false'); t.querySelector('.tp-map-more-a').firstChild.textContent = v ? 'Hide' : 'Show'; }
    card.classList.toggle('is-open', v);
    var h1 = card.offsetHeight;
    if (!reduce.matches && card.animate && h0 !== h1) card.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 240, easing: 'cubic-bezier(.3, .2, .25, 1)' });
    if (focusSel) { var f = card.querySelector(focusSel); if (f) f.focus({ preventScroll: true }); }
    say(v ? 'Ideas shown.' : 'Ideas hidden.');
  }
  function paintCard(i, dir) {
    var active = document.activeElement, inCard = active && card.contains(active);
    var keep = inCard ? (active.dataset.mstep ? '[data-mstep="' + active.dataset.mstep + '"]' : active.dataset.mjump !== undefined ? '[data-mjump="' + i + '"]' : active.dataset.mtab ? '[data-mtab="' + active.dataset.mtab + '"]' : active.dataset.mlist !== undefined ? '[data-mlist]' : null) : null;
    card.innerHTML = cardHtml(i);
    card.classList.toggle('is-open', sheetOpen);
    collapsedH = sheetOpen ? collapsedHeight(i) : card.offsetHeight;
    // The new day comes in from the side it was asked for (later days from the right), an even glide the eye can follow
    if (dir && !reduce.matches && card.animate) card.animate([{ opacity: 0, transform: 'translateX(' + (dir * 40) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.3, .2, .25, 1)' });
    var f = keep && card.querySelector(keep);
    // An arrow that is gone (the first or last day reached) hands focus to the other one, else to the day's heading
    if (!f && keep && keep.indexOf('data-mstep') > -1) f = card.querySelector('[data-mstep]');
    if (f) f.focus({ preventScroll: true }); else if (inCard) card.querySelector('.tp-map-card-h').focus({ preventScroll: true });
    drawStatus(i);
    if (card.querySelector('.tp-map-pcs')) hot(1, false); // pin 1 and card 1 go together from the start
  }
  function cardsFor(st, d) { return tp.mapStep(st, d); }
  // A short key for what is on the map right now: only the symbols in view
  function drawKey() {
    var c = cards[cur], k = [];
    if (free) { k.push('<span><i class="tp-map-key-dot">13</i>A stop and its date</span>', '<span><i class="tp-map-key-dot is-n">3</i>Stops close together: tap to zoom</span>'); }
    else if (c) {
      if (c.pins.some(function (p) { return p.html; })) k.push('<span><i class="tp-map-key-dot">1</i>Ideas below</span>');
      if (c.home && onMap(c.home.ll)) k.push('<span><i class="tp-map-key-i">' + HOME + '</i>Where you\u2019re staying</span>');
      if (marks.some(function (m) { return /is-stadium/.test(m.cls); })) k.push('<span><i class="tp-map-key-i is-round">' + FLAG + '</i>Stadium</span>');
      if (c.loops.length) k.push('<span><i class="tp-map-key-l"></i>There and back</span>');
    }
    keyEl.innerHTML = k.join('');
  }

  /* ---------- Steps ---------- */
  /* A change of day (16 Nov): the map leads and the card follows. The pill and the dots change at once; the old card
     dims and eases a little the other way; the map glides to the new day (0.7s, or 1.2s when it pulls back to travel
     far); the new card is held until the map is 60% of the way there, then comes in from the side asked for. Stepping
     again mid-way picks up from wherever things are. Reduced motion: the map and the card change together, at once. */
  var cardT = 0, cardOut = null, pending = null;
  /* Swipe hint (18 Nov): a pill over the map, just above the day's card, the first time day by day opens in a visit
     (this browser tab), telling people the map steps through the days sideways. It is a prompt, not a control
     (aria-hidden: screen readers hear the day and the arrow keys from say()), so it never takes a tap: the map under it
     still swipes. It goes as soon as they move to another day by any means, after 5 seconds, in Explore freely, or when
     the layer closes. Its chevrons nudge outwards twice; reduced motion: it fades in and out only. Not on a desktop,
     where there is no swiping (the arrows and keys step). */
  var hint = mapEl.querySelector('.tp-map-hint'), hintT = 0;
  function hintSeen() { try { return sessionStorage.getItem('tp-map-swiped') === '1'; } catch (e) { return false; } }
  function hintDone() { try { sessionStorage.setItem('tp-map-swiped', '1'); } catch (e) {} }
  function desktop() { return matchMedia('(min-width: 1024px)').matches && document.documentElement.classList.contains('pv-device'); }
  function hintShow() {
    if (hintSeen() || desktop() || steps.length < 2 || free) return;
    hint.style.bottom = Math.max(64, stage.clientHeight - card.offsetTop + 12) + 'px';
    hint.hidden = false;
    hint.classList.remove('is-out'); void hint.offsetWidth; hint.classList.add('is-in');
    clearTimeout(hintT); hintT = setTimeout(function () { hintHide(); }, 5000);
  }
  function hintHide(done) {
    clearTimeout(hintT);
    if (done) hintDone();
    if (hint.hidden) return;
    hint.classList.remove('is-in'); hint.classList.add('is-out');
    setTimeout(function () { if (hint.classList.contains('is-out')) hint.hidden = true; }, reduce.matches ? 0 : 220);
  }
  function goTo(i, opts) {
    opts = opts || {};
    i = Math.max(0, Math.min(steps.length - 1, i));
    if (!opts.first && !opts.cut && cur > -1 && i !== cur) hintHide(true); // they have found their way between days
    var prev = cur, changed = i !== cur;
    cur = i; curDay = cards[i] ? cards[i].day : null;
    clearTimeout(cardT); if (cardOut) { cardOut.cancel(); cardOut = null; }
    var dir = prev < 0 || i === prev ? 0 : i > prev ? 1 : -1;
    var hold = changed && !opts.first && !opts.cut && !reduce.matches && !!card.animate;
    if (hold) {
      // Measure the card that is coming, so the map frames the day around it before it is drawn
      var keepOpen = sheetOpen; sheetOpen = false; measure.innerHTML = cardHtml(i); sheetOpen = keepOpen; nextH = measure.offsetHeight; measure.innerHTML = '';
      drawStatus(i);
      cardOut = card.animate([{ opacity: 1, transform: 'none' }, { opacity: .45, transform: 'translateX(' + (-dir * 12) + 'px)' }], { duration: 200, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' });
    } else { nextH = null; paintCard(i, 0); }
    drawPins();
    drawKey();
    var to = frameOf(i), dur = 0;
    if (opts.first || opts.cut) { cam = to; apply(); } else dur = glide(to);
    if (hold) cardT = setTimeout(function () { if (cardOut) { cardOut.cancel(); cardOut = null; } nextH = null; paintCard(i, dir); }, Math.round((dur || 700) * .6));
    if (changed && !opts.first) say('Day ' + (i + 1) + ' of ' + steps.length + ', ' + cards[i].kicker.split(' · ').join(', ') + '.' + (cards[i].title ? ' ' + cards[i].title + '.' : '') + (i === steps.length - 1 ? ' ' + summary() + '.' : ''));
  }
  function jumpTo(i) { goTo(i); }
  // Drag the sheet's grabber up to open it or down to close it; a tap toggles it
  var gdrag = null;
  // (the release is heard on the window, so it counts wherever the finger or mouse ends up)
  card.addEventListener('pointerdown', function (e) { if (e.target.closest('.tp-map-grab')) { e.preventDefault(); gdrag = { id: e.pointerId, y: e.clientY }; } });
  window.addEventListener('pointerup', function (e) {
    if (!gdrag || e.pointerId !== gdrag.id) return;
    var dy = e.clientY - gdrag.y; gdrag = null;
    if (dy < -24) setSheet(true); else if (dy > 24) setSheet(false); else if (Math.abs(dy) < 6) setSheet(!sheetOpen);
  });
  window.addEventListener('pointercancel', function () { gdrag = null; });
  // Swipe the map sideways to change day (guided only; in Explore freely a drag pans). A tap on a pin is not a swipe.
  var swipe = null;
  view.addEventListener('pointerdown', function (e) { if (free || !on) return; swipe = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
  view.addEventListener('pointerup', function (e) {
    if (!swipe || e.pointerId !== swipe.id) return;
    var dx = e.clientX - swipe.x, dy = e.clientY - swipe.y; swipe = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(cur + (dx < 0 ? 1 : -1));
  });
  view.addEventListener('pointercancel', function () { swipe = null; });
  // The arrow keys step too, anywhere in the layer except inside the ideas row or the day tabs (they scroll sideways)
  stage.addEventListener('keydown', function (e) {
    if (free || !on || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || !jump.hidden || !pop.hidden) return;
    if (e.target.closest('.tp-map-pcs, .tp-map-tabs, input')) return;
    e.preventDefault();
    goTo(cur + (e.key === 'ArrowRight' ? 1 : -1));
  });
  window.addEventListener('resize', function () { if (on) { layout(); goTo(cur, { cut: true }); } });

  /* ---------- Render (called by concepts-third-half.js on every change) ---------- */
  var seenDays = '';
  tp.mapRender = function () {
    var plan = tp.mapPlan(), can = !!(plan && plan.length);
    if (!can) guided = false;
    var want = can && guided;
    dview.hidden = true; // the full-screen layer's cross replaces Back to the overview and Skip the map
    mapEl.hidden = !want; list.hidden = false;
    if (want && !gImg.getAttribute('src')) gImg.src = IMG;
    if (ov) ov.render(can);
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
    if (!first && shapeChanged && !free && sc.scrollTop >= trackTop() - 4) sc.scrollTo({ top: stepTop(idx), behavior: 'auto' });
  };
  // In and out of following day by day
  function follow(v) {
    if (v === guided) return;
    var day = curDay;
    guided = v; free = false; pending = null; mapEl.classList.remove('is-free'); freeBtn.setAttribute('aria-pressed', 'false'); freeBtn.querySelector('.tp-map-free-l').textContent = 'Explore freely'; zoomEl.hidden = true;
    if (!v) { on = false; }
    if (v) sheetOpen = false; // each visit starts with the map in view and the ideas one tap away
    fsShow(v);
    tp.mapRender();
    if (v) {
      sc.scrollTo({ top: trackTop(), behavior: 'auto' });
      var h = card.querySelector('.tp-map-card-h'); if (h) h.focus({ preventScroll: true });
      say('Following your days, one at a time as you scroll. Day 1 of ' + steps.length + '.');
      setTimeout(hintShow, reduce.matches ? 0 : 420); // once the layer has risen and the first day's card is in place
    } else hintHide();
    return day;
  }
  function fsShow(v) {
    if (v === !fs.hidden) return;
    if (v) {
      fsOpener = document.activeElement;
      // Everything behind waits; what was already inert is put back as it was
      fsBehind = [body, document.getElementById('tp-tl'), document.getElementById('tp-tl-scrim')].filter(Boolean).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; });
      fs.hidden = false;
      if (!reduce.matches && fs.animate) fs.animate([{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2, .8, .2, 1)' });
      return;
    }
    fsBehind.forEach(function (pair) { pair[0].inert = pair[1]; }); fsBehind = [];
    var done = function () { fs.hidden = true; };
    if (!reduce.matches && fs.animate) fs.animate([{ opacity: 1 }, { transform: 'translateY(16px)', opacity: 0 }], { duration: 220, easing: 'cubic-bezier(.4, 0, 1, 1)' }).onfinish = done; else done();
  }
  // Close (the cross, Escape, Back to the overview): the page is where they left it, focus back on Follow day by day
  function closeFs() {
    follow(false);
    var b = document.querySelector('[data-ofollow]');
    var f = fsOpener && document.contains(fsOpener) && !fsOpener.closest('.tp-mapfs') ? fsOpener : b;
    if (f) f.focus({ preventScroll: true });
    say('Day by day closed.');
  }
  fs.addEventListener('click', function (e) { if (e.target.closest('[data-mclose]')) closeFs(); });
  fs.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); closeFs(); } });
  // Tab stays in the layer while it is open
  fs.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !jump.hidden) return;
    var f = [].filter.call(fs.querySelectorAll('button, a[href], [tabindex="0"]'), function (x) { return !x.disabled && x.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  function toList(day) { follow(false); if (day !== null && day !== undefined && tp.listShowDay) tp.listShowDay(day); }
  function toOverview() { closeFs(); }

  /* ---------- Controls ---------- */
  dview.addEventListener('click', function (e) {
    if (e.target.closest('[data-mback]')) { toOverview(); return; }
    if (e.target.closest('a.tp-map-skip')) {
      e.preventDefault();
      var top = endEl.getBoundingClientRect().top - body.getBoundingClientRect().top + sc.scrollTop;
      sc.scrollTo({ top: top, behavior: 'auto' });
      // Focus goes where the page now is: the first day in the list just after the map (what is on screen)
      var h = list.querySelector('[data-blk-toggle]');
      (h || endEl).focus({ preventScroll: true });
    }
  });
  card.addEventListener('click', function (e) {
    var s = e.target.closest('[data-mstep]');
    if (s) { goTo(cur + +s.dataset.mstep); return; }
    if (e.target.closest('[data-msheet]')) { setSheet(!sheetOpen); return; }
    var dj = e.target.closest('[data-mjump]');
    if (dj) { goTo(+dj.dataset.mjump); return; }
    var t = e.target.closest('[data-mtab]');
    if (t) { var st = steps[cur], d = +t.dataset.mtab; sub[st.day] = d; cards[cur] = tp.mapStep(st, d); curDay = d; goTo(cur, { cut: false }); var f = card.querySelector('[data-mtab="' + d + '"]'); if (f) f.focus({ preventScroll: true }); return; }
    if (e.target.closest('[data-mlist]')) toList(curDay);
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
    if (!free) { if (x.p.html) { setSheet(true); hot(x.p.n, true); } return; }
    // Explore freely: a small card for the pin, with Add for its day and a way to that day
    var c = x.c || cards[x.i];
    pop.innerHTML = '<p class="tp-map-pop-t">' + esc(x.p.title) + '</p><p class="tp-map-pop-m">' + esc(x.p.kindLabel) + ' · ' + esc(c.label) + '</p>' +
      '<div class="tp-map-pop-a">' + (x.p.key ? '<button type="button" class="tp-add" data-item="' + esc(x.p.key) + '" aria-pressed="false"><span aria-hidden="true">' + PLUS + '<span class="tp-add-t">Add to ' + esc(c.label) + '</span></span><span class="visually-hidden">Add ' + esc(x.p.title) + ' to your plan on ' + esc(c.label) + '</span></button>' : '<span class="tp-map-pop-done">' + TICK + ' On your plan</span>') +
      '<button type="button" class="tp-link" data-mgo="' + x.i + '" data-mday="' + c.day + '">Go to ' + esc(c.label) + '</button><button type="button" class="tp-link" data-mpop-close>Close</button></div>';
    pop.hidden = false;
    var f = pop.querySelector('.tp-add, [data-mgo]'); if (f) f.focus({ preventScroll: true });
  });
  // A group of stops: zoom in on it; at the closest zoom (stops at the same place on different days) list them instead
  clustersEl.addEventListener('click', function (e) {
    var b = e.target.closest('.tp-map-cluster'); if (!b) return;
    var g = clusters[+b.dataset.g]; if (!g) return;
    if (cam.s < 1.15) { cancelAnimationFrame(anim); var to = { x: cam.x + (g.cx - vw / 2) / cam.s, y: cam.y + (g.cy - cam.fy) / cam.s, s: Math.min(1.2, cam.s * 2.2), fy: cam.fy }; glide(clampCam(to)); return; } // closest zoom: list them
    pop.innerHTML = '<p class="tp-map-pop-t">' + g.length + ' stops here</p><ul class="tp-map-pop-l">' + g.map(function (q) {
      var x = q.o.x, c = x.c || cards[x.i];
      return '<li><span><b>' + esc(x.p.title) + '</b> \u00b7 ' + esc(c.label) + '</span>' + (x.p.key ? '<button type="button" class="tp-add" data-item="' + esc(x.p.key) + '" aria-pressed="false"><span aria-hidden="true">' + PLUS + '<span class="tp-add-t">Add</span></span><span class="visually-hidden">Add ' + esc(x.p.title) + ' to your plan on ' + esc(c.label) + '</span></button>' : '<span class="tp-map-pop-done">' + TICK + ' On your plan</span>') + '</li>';
    }).join('') + '</ul><div class="tp-map-pop-a"><button type="button" class="tp-link" data-mpop-close>Close</button></div>';
    pop.hidden = false;
    var f = pop.querySelector('.tp-add, [data-mpop-close]'); if (f) f.focus({ preventScroll: true });
  });
  pop.addEventListener('click', function (e) {
    var g = e.target.closest('[data-mgo]');
    if (g) { var gi = +g.dataset.mgo, gd = +g.dataset.mday, gs = steps[gi]; if (gs && gs.days.length > 1) { sub[gs.day] = gd; cards[gi] = tp.mapStep(gs, gd); } pop.hidden = true; setFree(false, gi); return; }
    if (e.target.closest('[data-mpop-close]') || e.target.closest('.tp-add')) setTimeout(function () { pop.hidden = true; view.focus({ preventScroll: true }); }, e.target.closest('.tp-add') ? 600 : 0);
  });

  /* ---------- Jump to a day ---------- */
  function openJump() {
    jump.innerHTML = '<div class="tp-map-jump-top"><h4 id="tp-map-jump-h">Your days</h4><button type="button" class="tp-link" data-jclose>Close</button></div><ol class="tp-map-jump-l">' +
      steps.map(function (st, i) { var c = cards[i]; return '<li><button type="button" data-jump="' + i + '"' + (i === cur ? ' aria-current="step"' : '') + '><span class="tp-map-jump-n">' + (i + 1) + '</span><span class="tp-map-jump-d">' + esc(st.days.length > 1 ? c.label.replace(/ (Oct|Nov)$/, '') + ' to ' + cardsFor(st, st.days[st.days.length - 1]).label : c.label) + '</span><span class="tp-map-jump-k">' + esc(c.kicker.split(' · ').slice(1).filter(function (x) { return !/^from /.test(x); }).join(' · ')) + (c.place ? ' · ' + esc(c.place) : '') + '</span></button></li>'; }).join('') +
      '</ol><div class="tp-map-jump-a"><button type="button" class="tp-link tp-map-jump-list" data-mlist2>See as a list instead</button><button type="button" class="tp-link tp-map-jump-list" data-mback2>Back to the overview</button></div>';
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
    if (e.target.closest('[data-mlist2]')) { closeJump(false); toList(curDay); return; }
    if (e.target.closest('[data-mback2]')) { closeJump(false); toOverview(); }
  });
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!jump.hidden) { e.stopPropagation(); e.preventDefault(); closeJump(); }
      else if (!pop.hidden) { e.stopPropagation(); e.preventDefault(); pop.hidden = true; view.focus({ preventScroll: true }); }
      else if (sheetOpen && !free) { e.stopPropagation(); e.preventDefault(); setSheet(false, '[data-msheet]'); } // the open sheet closes first
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
    if (v) hintHide(); // panning freely: the hint about swiping between days no longer applies
    free = v; pending = null;
    mapEl.classList.toggle('is-free', v);
    freeBtn.setAttribute('aria-pressed', v ? 'true' : 'false');
    freeBtn.querySelector('.tp-map-free-l').textContent = v ? 'Back to the guided route' : 'Explore freely';
    zoomEl.hidden = !v; pop.hidden = true;
    phone.classList.toggle('tp-map-on', on && !v);
    layout();
    if (v) {
      sc.scrollTo({ top: trackTop(), behavior: 'auto' });
      drawPins();
      drawKey();
      // Opens on the whole plan: every stop in view, each marked with its date
      var xs = pinEls.map(function (o) { return px(o.x.p.ll); }), x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      xs.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
      if (xs.length) glide(clampCam({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, s: Math.max(sMin(), Math.min(1.2, Math.min((vw - 80) / Math.max(x1 - x0, 140), (stageH - 160) / Math.max(y1 - y0, 140)))), fy: 60 + (stageH - 60) / 2 }));
      view.focus({ preventScroll: true });
      say('Explore freely. Drag to move, pinch or use plus and minus to zoom. Every day’s stops are shown.');
    } else {
      var i = goStep !== undefined ? goStep : cur;
      cur = -1; goTo(i, { first: false });
      sc.scrollTo({ top: stepTop(i), behavior: 'auto' });
      freeBtn.focus({ preventScroll: true });
    }
  }
  freeBtn.addEventListener('click', function () { setFree(!free); });
  function zoomBy(f, cx, cy) {
    cancelAnimationFrame(anim);
    cx = cx === undefined ? vw / 2 : cx; cy = cy === undefined ? cam.fy : cy;
    var ns = Math.max(sMin(), Math.min(1.2, cam.s * f)), wx = cam.x + (cx - vw / 2) / cam.s, wy = cam.y + (cy - cam.fy) / cam.s;
    cam = { x: wx - (cx - vw / 2) / ns, y: wy - (cy - cam.fy) / ns, s: ns, fy: cam.fy }; clampCam(); apply();
  }
  function clampCam(c) {
    // Keep the picture filling the view where it can (no edge of the illustration showing)
    c = c || cam;
    var hw = vw / 2 / c.s, top = c.fy / c.s, bot = (stageH - c.fy) / c.s;
    c.x = hw * 2 >= IW ? IW / 2 : Math.max(hw, Math.min(IW - hw, c.x));
    c.y = top + bot >= IH ? IH / 2 : Math.max(top, Math.min(IH - bot, c.y));
    return c;
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
    if (!free || e.target.closest('.tp-map-pin, .tp-map-cluster')) return;
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
      cam = { x: drag.cam.x - ((a1.x + b1.x) - (a0.x + b0.x)) / 2 / drag.cam.s, y: drag.cam.y - ((a1.y + b1.y) - (a0.y + b0.y)) / 2 / drag.cam.s, s: Math.max(sMin(), Math.min(1.2, drag.cam.s * f)), fy: drag.cam.fy };
    } else cam = { x: drag.cam.x - (a1.x - a0.x) / drag.cam.s, y: drag.cam.y - (a1.y - a0.y) / drag.cam.s, s: drag.cam.s, fy: drag.cam.fy };
    clampCam(); apply();
  });
  function endPtr(e) { ptrs.delete(e.pointerId); drag = ptrs.size ? { cam: { x: cam.x, y: cam.y, s: cam.s, fy: cam.fy }, pts: new Map(ptrs) } : null; }
  view.addEventListener('pointerup', endPtr);
  view.addEventListener('pointercancel', endPtr);

  var ov = null;
  /* ---------- Around the matches in NSW: the map under the team cards ----------
     Calm context, never a step: the team cards stay the first thing to do. One map, three stages, by what they have told us:
     1. Nothing picked: the NSW stadiums, the fan village (placeholder, Darling Harbour) and a few things near each.
     2. A team picked: its NSW matches light up on their stadiums; matches interstate sit in one marker per direction at the
        edge (north: Brisbane, Townsville; south-west: Melbourne, Adelaide, Perth) with a way to NSW screenings.
     3. Their days set: the same map, and Follow day by day enters the guided map further down (it never starts by itself).
     Pan, zoom and tap only: one finger scrolls the page, two move the map (touch); a mouse drags; + and - zoom. Things
     near a place are three of its dummies, one per category, in an order that changes each day, so none is favoured.
     The picture loads only once the map is near the screen. Places and names are made up (concepts-geo.js, cnMapPoi). */
  var POI = window.cnMapPoi;
  var pick = document.getElementById('tp-picker');
  if (POI && pick) ov = (function () {
    var I_FULL = ICO('M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10'), I_SHRINK = ICO('M6 2.5V6H2.5M13.5 6H10V2.5M10 13.5V10h3.5M2.5 10H6v3.5');
    var OVH = 380, I_STAR = ICO('M8 1.8l1.8 3.9 4.2.5-3.1 2.9.8 4.2L8 11.2l-3.7 2.1.8-4.2L2 6.2l4.2-.5z');
    var sec = document.createElement('section');
    sec.className = 'tp-ov'; sec.id = 'tp-ov'; sec.setAttribute('aria-labelledby', 'tp-ov-h');
    var I_PREV = ICO('M10 3.5L5.5 8l4.5 4.5'), I_NEXT = ICO('M6 3.5L10.5 8 6 12.5');
    sec.innerHTML = '<h3 class="tp-ov-h" id="tp-ov-h">Around the matches in NSW</h3><p class="tp-ov-sub" id="tp-ov-sub"></p>' +
      // A way past the map that never needs the map itself: before it in tab order, and it says it moves the page
      '<a class="tp-link tp-ov-skip" href="#tp-ov-end" data-oskip>Skip the map' + I_DOWN + '</a>' +
      '<div class="tp-ov-map is-wait" style="height:' + OVH + 'px">' +
        '<div class="tp-ov-view" tabindex="0" role="application" aria-roledescription="map" aria-label="Map of the NSW stadiums and the fan village. Arrow keys move it, plus and minus zoom." aria-describedby="tp-ov-sub">' +
          '<div class="tp-map-layer tp-ov-layer"><img class="tp-map-img" width="' + IW + '" height="' + IH + '" alt="" decoding="async" draggable="false"></div>' +
        '</div>' +
        '<div class="tp-ov-marks"></div><div class="tp-ov-tvs"></div><div class="tp-ov-pins"></div><div class="tp-ov-edges"></div>' +
        // Once a team is picked: the things along their route as cards over the foot of the map (17 Nov)
        '<div class="tp-ov-rail" hidden><p class="tp-ov-rstop" id="tp-ov-rstop"></p><div class="tp-ov-rnav"><p class="tp-ov-rpos" aria-hidden="true"></p>' +
          '<button type="button" class="tp-ov-rbtn" data-oprev aria-label="Previous place">' + I_PREV + '</button>' +
          '<button type="button" class="tp-ov-rbtn" data-onext aria-label="Next place">' + I_NEXT + '</button></div>' +
          '<div class="tp-ov-track" role="group" aria-labelledby="tp-ov-rstop"></div></div>' +
        '<div class="tp-map-zoom tp-ov-zoom"><button type="button" data-ozoom="in" aria-label="Zoom in">' + I_PLUS + '</button><button type="button" data-ozoom="out" aria-label="Zoom out">' + I_MINUS + '</button><button type="button" class="tp-ov-fs" data-ofull aria-pressed="false" aria-label="Full screen map">' + I_FULL + '</button></div>' +
        '<p class="tp-ov-hint" aria-hidden="true"></p>' +
      '</div>' +
      '<div class="tp-ov-pop" id="tp-ov-pop" role="region" aria-labelledby="tp-ov-pop-h" hidden></div>' +
      '<div class="tp-ov-follow" hidden><p>Your trip is ready to follow day by day.</p><button type="button" class="tp-plan-btn tp-plan-btn--primary" data-ofollow>Follow day by day</button></div>' +
      '<p class="visually-hidden" aria-live="polite" id="tp-ov-say"></p><span class="tp-ov-end" id="tp-ov-end" tabindex="-1"></span>';
    // After All matches (18 Nov): Your days in NSW moved up into the team picker, so the map follows the match list
    var allSec = document.getElementById('tp-all');
    if (allSec) allSec.parentNode.insertBefore(sec, allSec.nextSibling); else pick.parentNode.insertBefore(sec, pick.nextSibling);
    var box = sec.querySelector('.tp-ov-map'), oview = sec.querySelector('.tp-ov-view'), olayer = sec.querySelector('.tp-ov-layer'), oimg = olayer.querySelector('img');
    var otvs = sec.querySelector('.tp-ov-tvs'), omarks = sec.querySelector('.tp-ov-marks'), oedges = sec.querySelector('.tp-ov-edges'), opop = sec.querySelector('.tp-ov-pop'), hint = sec.querySelector('.tp-ov-hint');
    var osub = sec.querySelector('.tp-ov-sub'), ofollow = sec.querySelector('.tp-ov-follow'), osay = sec.querySelector('#tp-ov-say');
    function osayT(t) { osay.textContent = ''; setTimeout(function () { osay.textContent = t; }, 30); }
    var lastCity = null, W = 390, ocam = { x: 0, y: 0, s: 1, fy: OVH / 2 }, oanim = 0, loaded = false, stage = 0, popAt = null;
    var S_MIN = .55, S_MAX = 1.2;

    // The places: the three stadiums and the village, each with the things near it
    var LOCS = Object.keys(GEO.venues).map(function (v) { return { id: v, name: v, area: POI.near[v], ll: GEO.venues[v], kind: 'stadium', city: /Newcastle/.test(v) ? 'newcastle' : 'sydney' }; });
    LOCS.push({ id: 'village', name: POI.village.name, area: POI.village.area, ll: POI.village.ll, kind: 'village', city: 'sydney' });
    // Where each label sits, so labels never cross a neighbour's mark at the zooms this map allows
    var SIDE = { 'Stadium Australia': 'r', 'Sydney Football Stadium': 'b', 'Newcastle Stadium': 'r', village: 'l' };
    function hash(str) { var n = 7; for (var i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) % 100003; return n; }
    // Three near each place, one per category: the order of categories and of places within them rotates each day
    var DAYKEY = new Date().toISOString().slice(0, 10);
    function nearOf(loc) {
      var all = POI.pois.filter(function (p) { return p.near === loc.id; }).sort(function (a, b) { return hash(a.id + DAYKEY) - hash(b.id + DAYKEY); });
      var out = [], cats = {};
      all.forEach(function (p) { if (out.length < 3 && !cats[p.cat]) { cats[p.cat] = 1; out.push(p); } });
      all.forEach(function (p) { if (out.length < 3 && out.indexOf(p) < 0) out.push(p); });
      return out;
    }
    LOCS.forEach(function (l) { l.near = nearOf(l); });
    // Where to watch in NSW, on the map (in place of the edge markers for matches interstate, agreed 16 Nov): the
    // placeholder screening venues (fan zones, pubs, clubs) as TV pins. Once a team is picked, the ones that list one of
    // their matches are strong and the rest stay faint
    var VENS = (Array.isArray(window.cnWatchVenues) ? window.cnWatchVenues : []).map(function (v, j) { return { v: v, j: j, ll: GEO.watch && GEO.watch[j] }; }).filter(function (x) { return x.ll; });
    var VTYPE = { fan_zone: 'Fan zone', pub: 'Pub', club: 'Club' };
    var I_TV = ICO('M2.5 4.5h11v7.5h-11zM6 14h4M5.5 2l2.5 2.5L10.5 2');
    function venShows(x) { return mine().filter(function (m) { return m.f.t && x.v.shows.indexOf(m.key) > -1; }); }
    var CITYFRAME = {
      sydney: LOCS.filter(function (l) { return l.city === 'sydney'; }),
      newcastle: LOCS.filter(function (l) { return l.city === 'newcastle'; })
    };
    var CITYNAME = { sydney: 'Sydney', newcastle: 'Newcastle' };
    function frame(city) {
      var ls = CITYFRAME[city], x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      ls.forEach(function (l) { var q = px(l.ll); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
      var s = Math.max(S_MIN, Math.min(S_MAX, (W - 150) / Math.max(x1 - x0, 120), (OVH - 200) / Math.max(y1 - y0, 120)));
      // One stadium on its own (Newcastle) sits left of centre, so its label to the right has room
      return oclamp({ x: (x0 + x1) / 2 + (ls.length === 1 ? 70 / s : 0), y: (y0 + y1) / 2 - 20 / s, s: s, fy: OVH / 2 });
    }
    function oclamp(c) {
      var hw = W / 2 / c.s, top = c.fy / c.s, bot = (OVH - c.fy) / c.s;
      c.x = Math.max(hw, Math.min(IW - hw, c.x)); c.y = Math.max(top, Math.min(IH - bot, c.y));
      return c;
    }
    function oscr(ll) { var q = px(ll); return [W / 2 + (q[0] - ocam.x) * ocam.s, ocam.fy + (q[1] - ocam.y) * ocam.s]; }
    function oglide(to) {
      cancelAnimationFrame(oanim);
      if (reduce.matches) { ocam = to; oapply(); return; }
      var from = { x: ocam.x, y: ocam.y, s: ocam.s, fy: ocam.fy }, t0 = performance.now();
      var far = Math.hypot(to.x - from.x, to.y - from.y) * Math.min(from.s, to.s) > W * 1.2;
      // Pulled back far enough that both places are in view at once (further than the zoom buttons go, only while gliding)
      var sMid = Math.min(S_MIN, (W - 80) / Math.max(1, Math.abs(to.x - from.x)), (OVH - 80) / Math.max(1, Math.abs(to.y - from.y)));
      var dur = far ? 1400 : 600, L0 = Math.log(from.s), L1 = Math.log(to.s), LM = Math.log(sMid);
      var io = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      box.classList.toggle('is-moving', far); // labels step aside while it is pulled right back, and return on arrival
      (function f(now) {
        var t = Math.min(1, (now - t0) / dur), e = io(t), ls;
        if (far && t > .85) box.classList.remove('is-moving');
        // Far (Sydney to Newcastle): out first, across, then in, so the eye can follow where it goes
        if (far) { ls = t < .35 ? L0 + (LM - L0) * io(t / .35) : t < .65 ? LM : LM + (L1 - LM) * io((t - .65) / .35); e = io(Math.max(0, Math.min(1, (t - .15) / .7))); }
        else ls = L0 + (L1 - L0) * e;
        ocam = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, s: Math.exp(ls), fy: from.fy + ((to.fy || OVH / 2) - from.fy) * e };
        oclamp(ocam); oapply();
        if (t < 1) oanim = requestAnimationFrame(f);
      })(t0);
    }

    /* What the stage shows */
    function mine() { return tp.own() ? tp.userMatches() : []; }
    function teamsIn(f) { return state.picked.filter(function (n) { return f.t && f.t.indexOf(n) > -1; }); }
    function matchesAt(v) { return mine().filter(function (m) { return !m.f.a && m.f.v === v; }); }
    function homeCity() {
      var ms = mine().filter(function (m) { return !m.f.a; });
      return ms.length && ms.every(function (m) { return /Newcastle/.test(m.f.v); }) ? 'newcastle' : 'sydney';
    }

    function draw() {
      var lit = stage >= 2 && tp.own(); // days set but no team: nothing to light up, so nothing is dimmed either
      omarks.innerHTML = LOCS.map(function (l, k) {
        var ms = l.kind === 'stadium' ? matchesAt(l.id) : [], on = ms.length > 0;
        var done = l.near.filter(function (p) { return state.added.some(function (x) { return x.id === 'poi:' + p.id; }); }).length;
        // Two lines at most, so neighbouring labels never meet: the one match, or how many and between which dates
        var dd = function (m) { return m.f.d.replace(/^\w+ /, ''); }, a0 = on && dd(ms[0]), a1 = on && dd(ms[ms.length - 1]);
        if (on && a0.slice(-3) === a1.slice(-3)) a0 = a0.slice(0, -4);
        var lines = !on ? '' : '<span class="tp-ov-m">' + (ms.length === 1 ? esc(ms[0].f.t || 'To be decided') + ' \u00b7 ' + esc(dd(ms[0])) : ms.length + ' of your matches \u00b7 ' + esc(a0) + ' to ' + esc(a1)) + '</span>';
        var lbl = l.name + (l.kind === 'stadium' ? ', ' + l.area : '') + (on ? '. ' + ms.length + (ms.length === 1 ? ' of your matches: ' : ' of your matches: ') + ms.map(function (m) { return (m.f.t || 'To be decided') + ', ' + m.f.d; }).join('; ') : '') + '. ' + l.near.length + ' things nearby' + (done ? ', ' + done + ' on your plan' : '') + '. Show them';
        var dots = l.near.map(function (p) {
          var a = Math.atan2(-(p.ll[0] - l.ll[0]), p.ll[1] - l.ll[1]);
          return '<i class="tp-ov-dot' + (state.added.some(function (x) { return x.id === 'poi:' + p.id; }) ? ' is-done' : '') + '" style="transform:translate(' + (Math.cos(a) * 21).toFixed(1) + 'px,' + (Math.sin(a) * 21).toFixed(1) + 'px)"></i>';
        }).join('');
        return '<button type="button" class="tp-ov-loc is-' + l.kind + ' is-' + (SIDE[l.id] || 'r') + (lit && l.kind === 'stadium' ? on ? ' is-lit' : ' is-dim' : '') + (popAt === k ? ' is-sel' : '') + '" data-loc="' + k + '" aria-label="' + esc(lbl) + '" aria-expanded="' + (popAt === k) + '" aria-controls="tp-ov-pop">' +
          '<span class="tp-ov-dots" aria-hidden="true">' + dots + '</span><span class="tp-ov-i" aria-hidden="true">' + (l.kind === 'stadium' ? FLAG : I_STAR) + '</span>' +
          '<span class="tp-ov-t" aria-hidden="true"><b>' + esc(l.kind === 'village' ? 'Fan village' : l.name) + '</b>' + (l.kind === 'village' ? '<span class="tp-ov-m is-q">Placeholder</span>' : '') + lines + '</span></button>';
      }).join('');
      var picked = tp.own();
      otvs.innerHTML = VENS.map(function (x, k) {
        var ms = venShows(x), strong = picked && ms.length > 0;
        var lbl = x.v.name + ', ' + (VTYPE[x.v.type] || 'Screening') + ', ' + x.v.place + '. ' + (picked ? (ms.length ? 'Shows ' + ms.length + (ms.length === 1 ? ' of your matches' : ' of your matches') : 'None of your matches listed') : 'Screenings') + '. Show details';
        return '<button type="button" class="tp-ov-tv' + (picked && !strong ? ' is-faint' : '') + (popAt === 'v' + k ? ' is-sel' : '') + '" data-ven="' + k + '" aria-label="' + esc(lbl) + '" aria-expanded="' + (popAt === 'v' + k) + '" aria-controls="tp-ov-pop">' + I_TV + '</button>';
      }).join('');
      oedges.innerHTML = '<button type="button" class="tp-ov-city" data-ocity hidden></button>';
      oapply();
    }
    function oapply() {
      placePins();
      olayer.style.transform = 'translate(' + (W / 2 - ocam.x * ocam.s).toFixed(1) + 'px,' + (ocam.fy - ocam.y * ocam.s).toFixed(1) + 'px) scale(' + ocam.s.toFixed(4) + ')';
      var off = { sydney: 0, newcastle: 0 }, seen = { sydney: 0, newcastle: 0 };
      Array.prototype.forEach.call(omarks.children, function (el, k) {
        var l = LOCS[k], q = oscr(l.ll), out = q[0] < -10 || q[0] > W + 10 || q[1] < -10 || q[1] > OVH + 10;
        el.style.transform = 'translate(' + q[0].toFixed(1) + 'px,' + q[1].toFixed(1) + 'px)';
        el.classList.toggle('is-out', out);
        el.tabIndex = out ? -1 : 0;
        if (out) off[l.city]++; else seen[l.city]++;
        // A label never runs off the map: a side label that would flips to the other side; one underneath slides back in
        var t = el.querySelector('.tp-ov-t'); if (!t || out) return;
        var side = SIDE[l.id] || 'r', tw = t.offsetWidth;
        if (side === 'b') { var lx = q[0] - tw / 2; t.style.marginLeft = (lx < 8 ? 8 - lx : lx + tw > W - 8 ? W - 8 - lx - tw : 0) + 'px'; }
        else el.classList.toggle('is-flip', side === 'r' ? q[0] + 30 + tw > W - 8 : q[0] - 30 - tw < 8);
      });
      // The other city, when it is off the map: a chip at the edge, pointing its way; tap to go there
      var cityBtn = oedges.querySelector('[data-ocity]'), go = null;
      ['newcastle', 'sydney'].forEach(function (c) { if (!go && off[c] && !seen[c]) go = c; });
      if (cityBtn) {
        cityBtn.hidden = !go;
        if (go) {
          var ls = CITYFRAME[go], cx = 0, cy = 0;
          ls.forEach(function (l) { var q = oscr(l.ll); cx += q[0] / ls.length; cy += q[1] / ls.length; });
          var ang = Math.atan2(cy - OVH / 2, cx - W / 2), up = cy < OVH / 2;
          var t = go === 'newcastle' ? 'Newcastle Stadium' : 'Sydney', n = go === 'sydney' ? ls.reduce(function (a, l) { return a + matchesAt(l.id).length; }, 0) : matchesAt('Newcastle Stadium').length;
          var html = '<span class="tp-ov-edge-a" aria-hidden="true" style="transform:rotate(' + (ang * 180 / Math.PI + 90).toFixed(0) + 'deg)">' + I_ARROW + '</span>' + esc(t) + (n ? ' · ' + n + (n === 1 ? ' match' : ' matches') : '');
          if (cityBtn.dataset.html !== html) { cityBtn.innerHTML = html; cityBtn.dataset.html = html; }
          cityBtn.dataset.ocity = go;
          cityBtn.setAttribute('aria-label', 'Go to ' + CITYNAME[go] + (n ? ', ' + n + (n === 1 ? ' of your matches' : ' of your matches') : ''));
          // On the right edge, under the zoom buttons when it is up (the interstate markers keep the left); its arrow points the way
          var w = cityBtn.offsetWidth || 160;
          // Always the bottom-right corner, whichever way it points (agreed 16 Nov); in full screen it sits above an open card
          var lift = full && !opop.hidden && box.contains(opop) ? opop.offsetHeight + 8 : 0;
          cityBtn.style.transform = 'translate(' + (W - 12 - w).toFixed(0) + 'px,' + (OVH - 12 - (cityBtn.offsetHeight || 36) - lift) + 'px)';
          cityBtn.classList.toggle('is-up', up);
        }
      }
      // TV pins are eased off the places (their mark and ring of dots) and off each other, so each stays tappable and
      // nothing sits on a stadium; a place keeps its true position, the venue moves
      var marksAt = LOCS.map(function (l) { return oscr(l.ll); }), tv = VENS.map(function (x) { var q = oscr(x.ll); return [q[0], q[1]]; });
      for (var it = 0; it < 6; it++) tv.forEach(function (q, k) {
        marksAt.forEach(function (m) { var dx = q[0] - m[0], dy = q[1] - m[1], d = Math.hypot(dx, dy) || .01; if (d < 40) { if (d < .02) { dx = 0; dy = 1; d = 1; } q[0] = m[0] + dx / d * 40; q[1] = m[1] + dy / d * 40; } });
        tv.forEach(function (o, j) { if (j <= k) return; var dx = o[0] - q[0], dy = o[1] - q[1], d = Math.hypot(dx, dy) || .01; if (d < 32) { var push = (32 - d) / 2; if (d < .02) { dx = 1; dy = 0; d = 1; } q[0] -= dx / d * push; q[1] -= dy / d * push; o[0] += dx / d * push; o[1] += dy / d * push; } });
      });
      // and off every label and chip on the map (moved straight up or down, out of the box it landed in)
      var br = box.getBoundingClientRect(), rects = [];
      omarks.querySelectorAll('.tp-ov-loc:not(.is-out) .tp-ov-t').forEach(function (t) { rects.push(t.getBoundingClientRect()); });
      oedges.querySelectorAll('.tp-ov-city:not([hidden])').forEach(function (t) { rects.push(t.getBoundingClientRect()); });
      box.querySelectorAll('.tp-ov-zoom').forEach(function (t) { rects.push(t.getBoundingClientRect()); });
      tv.forEach(function (q) {
        rects.forEach(function (r) {
          var x0 = r.left - br.left - 16, x1 = r.right - br.left + 16, y0 = r.top - br.top - 16, y1 = r.bottom - br.top + 16;
          if (q[0] > x0 && q[0] < x1 && q[1] > y0 && q[1] < y1) q[1] = q[1] - y0 < y1 - q[1] ? y0 : y1;
        });
      });
      Array.prototype.forEach.call(otvs.children, function (el, k) {
        var q = tv[k], out = q[0] < 14 || q[0] > W - 14 || q[1] < 14 || q[1] > OVH - 14;
        el.style.transform = 'translate(' + q[0].toFixed(1) + 'px,' + q[1].toFixed(1) + 'px)';
        el.classList.toggle('is-out', out); el.tabIndex = out ? -1 : 0;
      });
    }

    /* Rendered on every change (from tp.mapRender) */
    var lastSig = '';
    function render(can) {
      var st = can ? 3 : tp.own() ? 2 : 1;
      var none = !state.picked.length;
      osub.textContent = st === 1 ? 'The stadiums, the fan village, things near each, and places to watch (TV pins). Pick a team to see where they play.'
        : st === 2 ? (mine().some(function (m) { return !m.f.a; }) ? (tp.rugby() ? 'Every NSW match on its stadium, and things nearby.' : 'Where your teams play in NSW, and things near each, as cards over the map. Swipe them, or use Previous and Next.') : 'Your teams play interstate. The cards over the map are places in NSW to watch them.')
        : tp.own() ? 'Your matches and what you’ve added, around NSW.' : 'The stadiums, the fan village and things near each, for your days.';
      ofollow.hidden = st !== 3;
      var sig = st + '|' + (none ? '' : state.picked.join(',')) + '|' + mine().map(function (m) { return m.key || m.f.d + m.f.t; }).join(',') + '|' + state.added.map(function (x) { return x.id; }).join(',') + '|' + (state.trip ? state.trip.from + state.trip.to : '');
      if (sig === lastSig || !loaded) { stage = st; if (!loaded) lastSig = ''; return; }
      lastSig = sig; stage = st;
      draw();
      railRender();
      if (popAt !== null && !opop.hidden) showPop(popAt, true);
      // A team that plays only in Newcastle: the map goes there (a glide the eye can follow), and back for Sydney
      var city = homeCity();
      if (lastCity && city !== lastCity) oglide(frame(city));
      lastCity = city;
    }
    function load() {
      if (loaded) return;
      loaded = true;
      W = box.clientWidth || 390;
      oimg.onload = function () { box.classList.remove('is-wait'); };
      oimg.src = IMG;
      ocam = frame(homeCity()); lastCity = homeCity();
      stage = 0; lastSig = '';
      render(!!(tp.mapPlan() || []).length);
    }
    // The picture loads only when the map comes near the screen (the page scrolls inside the phone frame)
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); } }, { root: body, rootMargin: '200px 0px' });
      io.observe(box);
    } else load();
    window.addEventListener('resize', function () { if (!loaded) return; W = box.clientWidth || 390; oclamp(ocam); oapply(); });

    /* ---------- The route as cards over the map (17 Nov) ----------
       Once a team is picked, the things along their route sit as cards over the foot of the map, stop by stop in day order
       (tp.mapStops: near each NSW match's stadium, NSW screenings of an interstate match, and, with days set, ideas for
       each free day). Swipe the row, or Previous and Next: the map glides to the card's place, its photo pin is singled
       out and the stop's other pins fade back. Tapping a pin brings its card. Add on a card is the page's own Add (the
       same item, on that day), so it lands on its day card in Your plan and the status line says where it went. Before
       a team is picked the map stays as it was. Reduced motion: the map jumps and the pin is marked. */
    var opins = sec.querySelector('.tp-ov-pins'), rail = sec.querySelector('.tp-ov-rail'), track = sec.querySelector('.tp-ov-track');
    var rstop = sec.querySelector('.tp-ov-rstop'), rpos = sec.querySelector('.tp-ov-rpos'), STOPS = [], FLAT = [], rcur = 0, railSig = '';
    function railOn() { return !rail.hidden; }
    function railH() { return railOn() ? rail.offsetHeight : 0; }
    function railRender() {
      STOPS = tp.mapStops ? tp.mapStops() : []; FLAT = [];
      STOPS.forEach(function (st, si) { st.items.forEach(function (it) { FLAT.push({ it: it, st: st, si: si }); }); });
      var on = FLAT.length > 0, was = railOn();
      rail.hidden = !on; box.classList.toggle('has-rail', on);
      // Inline, the map grows to make room for the cards; in full screen it already fills the phone
      if (full) OVH = box.clientHeight || OVH; else box.style.height = (on ? OVH = 460 : OVH = 380) + 'px';
      if (!on) { opins.innerHTML = ''; railSig = ''; oapply(); return; }
      var sig = FLAT.map(function (x) { return x.it.key; }).join(',');
      var keepKey = FLAT[rcur] && was ? null : null, act = document.activeElement, focusSel = null;
      if (act && track.contains(act)) focusSel = act.dataset.item ? '[data-item="' + CSS.escape(act.dataset.item) + '"]' : act.dataset.open ? '[data-open="' + CSS.escape(act.dataset.open) + '"]' : null;
      var sl = track.scrollLeft;
      track.innerHTML = FLAT.map(function (x, i) {
        var it = x.it, day = x.st.label.split(' · ')[0];
        return '<article class="tp-ov-card" data-i="' + i + '" aria-label="' + esc(it.title + ', ' + it.type + ', ' + x.st.label) + '">' +
          '<span class="ph-img tp-ov-cimg"' + tp.imgAttr(it.title) + ' aria-hidden="true"></span>' +
          '<span class="tp-ov-cbody"><button type="button" class="tp-link tp-ov-cname" data-open="' + esc(it.open) + '" aria-haspopup="dialog">' + esc(it.title) + '</button>' +
          '<span class="tp-ov-ctype' + (it.made ? ' provenance-gap' : '') + '">' + esc(it.type) + '</span>' +
          (it.time ? '<span class="tp-ov-ctime provenance-gap">' + esc(it.time) + '</span>' : '') +
          tp.addBtnHtml(it.key, it.title + ' on ' + day) + '</span></article>';
      }).join('');
      track.scrollLeft = sl;
      if (focusSel) { var f = track.querySelector(focusSel); if (f) f.focus({ preventScroll: true }); }
      if (sig !== railSig) { railSig = sig; if (rcur >= FLAT.length) rcur = 0; setCur(rcur, { jump: !was, scroll: !was }); }
      else setCur(rcur, { keep: true });
    }
    function cardEl(i) { return track.children[i]; }
    var I_TICK = ICO('M3.8 8.3l2.7 2.7 5.7-5.9');
    // The item id behind a card's Add: a map place is poi:id, an idea i:id (its day is in the key), the rest as keyed
    function isAdded(key) {
      var id = key.indexOf('mp:') === 0 ? 'poi:' + key.split(':')[1] : key.indexOf('i:') === 0 ? key.split('@')[0] : key;
      return state.added.some(function (a) { return a.id === id; });
    }
    // The current card: the stop line and position, its pin singled out, the map gliding to it
    function setCur(i, o) {
      o = o || {};
      if (!FLAT.length) return;
      i = Math.max(0, Math.min(FLAT.length - 1, i)); rcur = i;
      var x = FLAT[i];
      rstop.textContent = x.st.label;
      rpos.textContent = (i + 1) + ' of ' + FLAT.length;
      // In the card row itself: in full screen the map and its cards leave the section for the whole phone
      rail.querySelector('[data-oprev]').disabled = i === 0;
      rail.querySelector('[data-onext]').disabled = i === FLAT.length - 1;
      Array.prototype.forEach.call(track.children, function (c, k) { c.classList.toggle('is-cur', k === i); });
      drawPins();
      if (o.scroll) { var c = cardEl(i); if (c) track.scrollTo({ left: c.offsetLeft - track.offsetLeft - 16, behavior: o.jump || reduce.matches ? 'auto' : 'smooth' }); }
      if (!o.keep) {
        var q = px(x.it.ll), s = Math.max(ocam.s, .95), fy = Math.max(70, (OVH - railH()) / 2);
        var to = oclamp({ x: q[0], y: q[1], s: Math.min(S_MAX, s), fy: fy });
        if (o.jump) { ocam = to; oapply(); } else oglide(to);
      }
    }
    // The current stop's photo pins: the current one larger and ringed, the rest faded back; added ones carry a tick
    function drawPins() {
      if (!railOn()) { opins.innerHTML = ''; return; }
      var x = FLAT[rcur], st = x.st, h = '';
      FLAT.forEach(function (y, i) {
        if (y.st !== st) return;
        var on = isAdded(y.it.key);
        h += '<button type="button" class="tp-ov-pin' + (i === rcur ? ' is-cur' : '') + (on ? ' is-added' : '') + '" data-opin="' + i + '" aria-label="' + esc(y.it.title + ', ' + y.it.type + (on ? ', added to your plan' : '') + '. Show its card') + '" style="--z:' + (i === rcur ? 3 : 1) + '">' +
          '<span class="ph-img tp-ov-pimg"' + tp.imgAttr(y.it.title) + ' aria-hidden="true"></span>' + (on ? '<span class="tp-ov-ptick" aria-hidden="true">' + I_TICK + '</span>' : '') + '</button>';
      });
      opins.innerHTML = h; placePins();
    }
    function placePins() {
      if (!opins || !opins.children.length) return;
      Array.prototype.forEach.call(opins.children, function (el) {
        var y = FLAT[+el.dataset.opin]; if (!y) return;
        var q = oscr(y.it.ll), out = q[0] < -16 || q[0] > W + 16 || q[1] < -16 || q[1] > OVH - railH() + 8;
        el.style.transform = 'translate(' + q[0].toFixed(1) + 'px,' + q[1].toFixed(1) + 'px)';
        el.classList.toggle('is-out', out); el.tabIndex = out ? -1 : 0;
      });
    }
    // A stadium tapped while the cards are on: its first card comes into view
    function cardAtPlace(v) {
      for (var i = 0; i < FLAT.length; i++) if (FLAT[i].st.kind === 'match' && FLAT[i].st.ms[0].f.v === v) { setCur(i, { scroll: true }); return true; }
      return false;
    }
    var trackT = 0;
    track.addEventListener('scroll', function () {
      clearTimeout(trackT);
      trackT = setTimeout(function () {
        var mid = track.scrollLeft + 16 + 4, best = rcur, bd = Infinity;
        Array.prototype.forEach.call(track.children, function (c, k) { var d = Math.abs(c.offsetLeft - track.offsetLeft - mid + 4); if (d < bd) { bd = d; best = k; } });
        if (best !== rcur) setCur(best);
      }, 110);
    }, { passive: true });
    track.addEventListener('focusin', function (e) { var c = e.target.closest('.tp-ov-card'); if (c && +c.dataset.i !== rcur) setCur(+c.dataset.i, { scroll: true }); });
    rail.addEventListener('click', function (e) {
      if (e.target.closest('[data-oprev]')) { setCur(rcur - 1, { scroll: true }); return; }
      if (e.target.closest('[data-onext]')) { setCur(rcur + 1, { scroll: true }); return; }
    });
    opins.addEventListener('click', function (e) {
      var b = e.target.closest('[data-opin]'); if (!b) return;
      setCur(+b.dataset.opin, { scroll: true });
      var n = cardEl(rcur) && cardEl(rcur).querySelector('.tp-ov-cname'); if (n) n.focus({ preventScroll: true });
      osayT(FLAT[rcur].it.title + ', card ' + (rcur + 1) + ' of ' + FLAT.length + '.');
    });
    // Skip the map: to what follows it, saying so (its label says it moves the page)
    sec.querySelector('[data-oskip]').addEventListener('click', function (e) {
      e.preventDefault();
      // The next thing on the page that is showing (a section can be hidden, for example All matches once a team is picked)
      var end = sec.querySelector('#tp-ov-end'), next = sec.nextElementSibling;
      while (next && (next.hidden || !next.offsetHeight)) next = next.nextElementSibling;
      next = next || end;
      body.scrollTo({ top: Math.max(0, next.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 12 - (window.tpCapRoom ? window.tpCapRoom() : 0)), behavior: reduce.matches ? 'auto' : 'smooth' });
      var h = next.querySelector && next.querySelector('h2, h3') || end;
      if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
      osayT('Skipped the map.');
    });

    /* A place's things nearby, with Add */
    function openDays(p) {
      var order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], N = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
      var o = order.filter(function (d) { return p.open.indexOf(d) > -1; });
      if (o.length === 7) return 'Open every day';
      var i0 = order.indexOf(o[0]), run = o.every(function (d, k) { return order.indexOf(d) === i0 + k; });
      return 'Open ' + (run ? N[o[0]] + ' to ' + N[o[o.length - 1]] : o.map(function (d) { return N[d]; }).join(', '));
    }
    function itemOf(p) { return state.added.filter(function (x) { return x.id === 'poi:' + p.id; })[0] || null; }
    function selMark(key) {
      [omarks, otvs].forEach(function (box) { Array.prototype.forEach.call(box.children, function (el) { var me = el.dataset.ven !== undefined ? 'v' + el.dataset.ven : +el.dataset.loc; el.classList.toggle('is-sel', me === key); el.setAttribute('aria-expanded', me === key ? 'true' : 'false'); }); });
    }
    function bringIn(ll) {
      var q = px(ll), s = Math.max(ocam.s, .9); oglide(oclamp({ x: q[0], y: q[1], s: s, fy: OVH / 2 }));
      var r = opop.getBoundingClientRect(), br = body.getBoundingClientRect(), room = br.bottom - 100; if (!full && r.bottom > room) body.scrollBy({ top: Math.min(r.bottom - room, r.top - br.top - 60), behavior: reduce.matches ? 'auto' : 'smooth' });
    }
    // A screening venue's card: what it is, and which of their matches it lists (or how many it shows), with the way to
    // Where to watch, where each screening has its Add
    function showVen(k, keep) {
      var x = VENS[k], ms = venShows(x), picked = tp.own(), fz = x.v.type === 'fan_zone';
      popAt = 'v' + k;
      var list = ms.slice(0, 5).map(function (m) { return esc(m.f.t) + ', ' + esc(m.f.d) + (m.f.k ? ', ' + esc(m.f.k) : '') + (m.f.a ? ' (in ' + esc(m.f.a) + ')' : ''); });
      opop.innerHTML = '<div class="tp-ov-pop-top"><h4 class="tp-map-pop-t" id="tp-ov-pop-h" tabindex="-1">' + esc(x.v.name) + '</h4><button type="button" class="tp-link" data-oclose>Close</button></div>' +
        '<p class="tp-map-pop-m">' + esc(VTYPE[x.v.type] || 'Screening') + ' \u00b7 ' + esc(x.v.place) + ' \u00b7 placeholder venue</p>' +
        '<p class="tp-ov-pop-k">' + (picked ? 'Your matches it shows' : 'Screenings') + '</p>' +
        (picked ? (list.length ? '<p class="tp-ov-pop-ms">' + list.join('<br>') + (ms.length > 5 ? '<br>and ' + (ms.length - 5) + ' more' : '') + '</p>' : '<p class="tp-map-pop-m">None of your matches is listed here yet.</p>')
          : '<p class="tp-map-pop-m">' + (fz ? 'Every match of the tournament, on big screens.' : x.v.shows.length + ' matches across the tournament.') + ' Pick a team to see which of theirs.</p>') +
        '<div class="tp-map-pop-a"><a href="#tp-watch" class="tp-link" data-owatch>See screenings in Where to watch</a></div>';
      opop.hidden = false;
      if (!keep) opop.querySelector('.tp-map-pop-t').focus({ preventScroll: true });
      selMark(popAt);
      if (!keep) bringIn(x.ll);
    }
    // A place's sheet added or removed it: the pop-up it was opened from follows
    tp.ovRefresh = function () { if (!opop.hidden && popAt !== null) showPop(popAt, true); };
    function showPop(k, keep) {
      if (typeof k === 'string') { showVen(+k.slice(1), keep); return; }
      var l = LOCS[k], ms = l.kind === 'stadium' ? matchesAt(l.id) : [];
      popAt = k;
      var h = '<div class="tp-ov-pop-top"><h4 class="tp-map-pop-t" id="tp-ov-pop-h" tabindex="-1">' + esc(l.kind === 'village' ? 'Fan village' : l.name) + '</h4><button type="button" class="tp-link" data-oclose>Close</button></div>' +
        '<p class="tp-map-pop-m">' + esc(l.area) + (l.kind === 'village' ? ' · placeholder: big screens and fan events, details to come' : '') + '</p>' +
        (ms.length ? '<p class="tp-ov-pop-ms">' + ms.map(function (m) { return esc(m.f.t || 'To be decided') + ', ' + esc(m.f.d) + (m.f.k ? ', ' + esc(m.f.k) : ''); }).join('<br>') + '</p>' : '') +
        '<p class="tp-ov-pop-k">Nearby</p><ul class="tp-map-pop-l">' + l.near.map(function (p) {
          var it = itemOf(p), on = !!it;
          var note = !it ? '' : it.unplaced ? (state.trip && state.trip.from ? 'Saved, not placed yet. No free day fits it yet.' : 'Saved, not placed yet. It goes into a free day once you set your days.') : 'On your plan: ' + it.day;
          return '<li><span class="ph-img tp-pc-img tp-ov-pop-img" data-img="' + esc(String(p.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) + '" aria-hidden="true"></span><span class="tp-ov-pop-txt"><button type="button" class="tp-link tp-place-link" data-open="poi:' + p.id + '" aria-haspopup="dialog">' + esc(p.title) + '</button><span class="tp-ov-pop-d">' + esc(p.cat) + ' · ' + esc(p.area) + ' · ' + esc(openDays(p)) + '</span>' + (note ? '<span class="tp-ov-pop-n" data-onote="' + p.id + '">' + esc(note) + '</span>' : '') + '</span>' +
            '<button type="button" class="tp-add" data-oadd="' + p.id + '" aria-pressed="' + on + '"><span aria-hidden="true">' + (on ? TICK : PLUS) + '<span class="tp-add-t">' + (on ? 'Added' : 'Add') + '</span></span><span class="visually-hidden">' + (on ? 'Remove ' : 'Add ') + esc(p.title) + (on ? ' from your plan' : ' to your plan') + '</span></button></li>';
        }).join('') + '</ul>';
      var focusSel = keep && document.activeElement && opop.contains(document.activeElement) && document.activeElement.dataset.oadd ? '[data-oadd="' + document.activeElement.dataset.oadd + '"]' : null;
      opop.innerHTML = h; opop.hidden = false;
      var f = focusSel ? opop.querySelector(focusSel) : null;
      if (f) f.focus({ preventScroll: true }); else if (!keep) opop.querySelector('.tp-map-pop-t').focus({ preventScroll: true });
      // The place it is about is picked out on the map and glides to the middle, the card opening just under the map,
      // and the card is brought into view above the plan bar if it opened below the screen
      selMark(k);
      if (!keep) bringIn(l.ll);
    }
    function closePop() {
      var k = popAt; opop.hidden = true; popAt = null;
      selMark(null);
      var b = k === null ? null : typeof k === 'string' ? otvs.querySelector('[data-ven="' + k.slice(1) + '"]') : omarks.querySelector('[data-loc="' + k + '"]');
      if (b) b.focus({ preventScroll: true });
    }
    omarks.addEventListener('click', function (e) { var b = e.target.closest('[data-loc]'); if (!b) return; if (railOn() && cardAtPlace(LOCS[+b.dataset.loc].id)) return; showPop(+b.dataset.loc); });
    otvs.addEventListener('click', function (e) { var b = e.target.closest('[data-ven]'); if (b) showVen(+b.dataset.ven); });
    opop.addEventListener('click', function (e) {
      if (e.target.closest('[data-oclose]')) { closePop(); return; }
      var a = e.target.closest('[data-oadd]'); if (!a) return;
      var p = POI.pois.filter(function (x) { return x.id === a.dataset.oadd; })[0]; if (!p) return;
      var it = itemOf(p);
      if (it) { tp.removeItem(it.id); osayT(p.title + ' removed from your plan.'); }
      else {
        tp.addItem(tp.poiItem(p));
        var nu = itemOf(p);
        osayT(!nu ? '' : nu.unplaced ? p.title + ' saved, not placed yet. ' + (state.trip && state.trip.from ? 'No free day fits it yet.' : 'It goes into a free day once you set your days.') : p.title + ' added to your plan on ' + nu.day + '.');
      }
      showPop(popAt, true);
      var f = opop.querySelector('[data-oadd="' + p.id + '"]'); if (f) f.focus({ preventScroll: true });
    });
    sec.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !opop.hidden) { e.stopPropagation(); closePop(); } });
    oedges.addEventListener('click', function (e) {
      var c = e.target.closest('[data-ocity]');
      if (c) { opop.hidden = true; popAt = null; selMark(null); oglide(frame(c.dataset.ocity)); osayT('Showing ' + CITYNAME[c.dataset.ocity] + '.'); }
    });
    opop.addEventListener('click', function (e) {
      if (e.target.closest('[data-owatch]')) {
        e.preventDefault();
        var w = document.getElementById('tp-watch'); if (!w) return;
        body.scrollTo({ top: w.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 12 - (window.tpCapRoom ? window.tpCapRoom() : 0), behavior: reduce.matches ? 'auto' : 'smooth' });
        var h = document.getElementById('tp-watch-title'); if (h) h.focus({ preventScroll: true });
      }
    });
    ofollow.addEventListener('click', function (e) { if (e.target.closest('[data-ofollow]')) follow(true); });

    /* Zoom, pan and the two-finger rule */
    function ozoom(f, cx, cy) {
      cancelAnimationFrame(oanim);
      cx = cx === undefined ? W / 2 : cx; cy = cy === undefined ? ocam.fy : cy;
      var ns = Math.max(S_MIN, Math.min(S_MAX, ocam.s * f)), wx = ocam.x + (cx - W / 2) / ocam.s, wy = ocam.y + (cy - ocam.fy) / ocam.s;
      ocam = oclamp({ x: wx - (cx - W / 2) / ns, y: wy - (cy - ocam.fy) / ns, s: ns, fy: ocam.fy }); oapply();
    }
    sec.querySelector('.tp-ov-zoom').addEventListener('click', function (e) { var z = e.target.closest('[data-ozoom]'); if (z) ozoom(z.dataset.ozoom === 'in' ? 1.35 : 1 / 1.35); });
    /* Full screen (16 Nov): the map fills the phone screen, over the page and the plan bar; one finger moves it
       there (nothing to scroll), the place cards open over its foot, and Escape or the same button brings it back to
       where it was on the page. The map keeps its place and zoom either way */
    var full = false, fsHome = document.createComment('map'), fsBtn = sec.querySelector('[data-ofull]'), fsInert = [];
    function setFull(v) {
      if (v === full) return;
      full = v; load();
      var cx = ocam.x, cy = ocam.y, cs = ocam.s;
      if (v) {
        box.parentNode.insertBefore(fsHome, box);
        phone.appendChild(box); box.appendChild(opop);
        fsInert = [body, document.getElementById('tp-tl'), document.getElementById('tp-tl-scrim')].filter(Boolean).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; });
      } else {
        fsHome.parentNode.insertBefore(box, fsHome); fsHome.remove(); box.parentNode.insertBefore(opop, box.nextSibling);
        fsInert.forEach(function (p) { p[0].inert = p[1]; }); fsInert = [];
      }
      box.classList.toggle('is-full', v);
      fsBtn.setAttribute('aria-pressed', v ? 'true' : 'false');
      fsBtn.setAttribute('aria-label', v ? 'Exit full screen' : 'Full screen map');
      fsBtn.innerHTML = v ? I_SHRINK : I_FULL;
      W = box.clientWidth || 390; OVH = box.clientHeight || 380;
      ocam = oclamp({ x: cx, y: cy, s: cs, fy: OVH / 2 }); oapply();
      // The current card's place, centred above the cards at the new size
      if (railOn()) setCur(rcur, { jump: true, scroll: true });
      if (!v && popAt === null) opop.hidden = true;
      fsBtn.focus({ preventScroll: true });
      if (!v) { var top = sec.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 12 - (window.tpCapRoom ? window.tpCapRoom() : 0); if (top < body.scrollTop || top > body.scrollTop + body.clientHeight - 200) body.scrollTo({ top: Math.max(0, top), behavior: 'auto' }); }
      osayT(v ? 'Full screen map. Escape or Exit full screen to go back.' : 'Map back on the page.');
    }
    fsBtn.addEventListener('click', function () { setFull(!full); });
    box.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !full) return;
      e.stopPropagation(); e.preventDefault();
      if (!opop.hidden) closePop(); else setFull(false);
    });
    oview.addEventListener('keydown', function (e) {
      var k = e.key, st = 60 / ocam.s;
      if (k === 'ArrowLeft') ocam.x -= st; else if (k === 'ArrowRight') ocam.x += st; else if (k === 'ArrowUp') ocam.y -= st; else if (k === 'ArrowDown') ocam.y += st;
      else if (k === '+' || k === '=') { ozoom(1.3); e.preventDefault(); return; } else if (k === '-') { ozoom(1 / 1.3); e.preventDefault(); return; }
      else return;
      e.preventDefault(); cancelAnimationFrame(oanim); oclamp(ocam); oapply();
    });
    var hintT = 0;
    function showHint(t) { hint.textContent = t; hint.classList.add('is-on'); clearTimeout(hintT); hintT = setTimeout(function () { hint.classList.remove('is-on'); }, 1400); }
    var optr = new Map(), odrag = null;
    box.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button, a, .tp-ov-pop, .tp-ov-rail')) return;
      optr.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
      // One finger is the page's: it scrolls past the map. Two fingers, or a mouse, move the map
      if (e.pointerType === 'touch' && optr.size < 2 && !full) { odrag = { one: { x: e.clientX, y: e.clientY } }; return; }
      try { box.setPointerCapture(e.pointerId); } catch (err) {}
      cancelAnimationFrame(oanim);
      odrag = { cam: { x: ocam.x, y: ocam.y, s: ocam.s, fy: ocam.fy }, pts: new Map(optr) };
    });
    box.addEventListener('pointermove', function (e) {
      if (!optr.has(e.pointerId) || !odrag) return;
      optr.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
      if (odrag.one) { if (Math.abs(e.clientX - odrag.one.x) > 12 && !odrag.told) { odrag.told = true; showHint('Use two fingers to move the map'); } return; }
      var ids = Array.from(optr.keys()), a0 = odrag.pts.get(ids[0]), a1 = optr.get(ids[0]);
      if (!a0) return;
      var r = box.getBoundingClientRect();
      if (ids.length > 1 && odrag.pts.get(ids[1])) {
        var b0 = odrag.pts.get(ids[1]), b1 = optr.get(ids[1]);
        var f = Math.hypot(a1.x - b1.x, a1.y - b1.y) / Math.max(20, Math.hypot(a0.x - b0.x, a0.y - b0.y)), ns = Math.max(S_MIN, Math.min(S_MAX, odrag.cam.s * f));
        var m0x = (a0.x + b0.x) / 2 - r.left, m0y = (a0.y + b0.y) / 2 - r.top, m1x = (a1.x + b1.x) / 2 - r.left, m1y = (a1.y + b1.y) / 2 - r.top;
        var wx = odrag.cam.x + (m0x - W / 2) / odrag.cam.s, wy = odrag.cam.y + (m0y - odrag.cam.fy) / odrag.cam.s;
        ocam = { x: wx - (m1x - W / 2) / ns, y: wy - (m1y - odrag.cam.fy) / ns, s: ns, fy: odrag.cam.fy };
      } else ocam = { x: odrag.cam.x - (a1.x - a0.x) / odrag.cam.s, y: odrag.cam.y - (a1.y - a0.y) / odrag.cam.s, s: odrag.cam.s, fy: odrag.cam.fy };
      oclamp(ocam); oapply();
    });
    function oend(e) {
      optr.delete(e.pointerId);
      var left = Array.from(optr.values());
      odrag = !left.length ? null : left.length === 1 && left[0].type === 'touch' ? { one: left[0], told: true } : { cam: { x: ocam.x, y: ocam.y, s: ocam.s, fy: ocam.fy }, pts: new Map(optr) };
    }
    box.addEventListener('pointerup', oend); box.addEventListener('pointercancel', oend);
    // Two-finger gestures need the page's own pinch kept off the map; one finger still scrolls the page (CSS touch-action)
    box.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); var r = box.getBoundingClientRect(); ozoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }
    }, { passive: false });

    return {
      render: render,
      show: function () {
        var top = sec.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 12 - (window.tpCapRoom ? window.tpCapRoom() : 0);
        body.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
        load();
        var b = ofollow.querySelector('[data-ofollow]');
        (b && !ofollow.hidden ? b : oview).focus({ preventScroll: true });
      }
    };
  })();
  // The first render may have happened before this file loaded
  if (typeof tp.mapRender === 'function') setTimeout(function () { tp.mapRender(); }, 0);
})();
