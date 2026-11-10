/* Concepts: the itinerary screen (M1).
   1. Timeline / List toggle.
   2. Timeline view: every match on a sideways-scrolling date axis, with a draggable range for the days the fan is in NSW.
   3. List view: drag-to-reorder (pointer and keyboard), within a day, between days and into Not yet planned.
   Placeholder data throughout (prototype only). The list in the page is the source of truth: the AI prompt and the
   range read from it, so reordering and changing the range show up there. */
(function () {
  'use strict';
  var phone = document.getElementById('cn-phone');
  if (!phone) return;
  var body = phone.querySelector('.cn-body');
  var listPane = phone.querySelector('[data-pane="list"]');
  var tlPane = phone.querySelector('[data-pane="timeline"]');
  var segBtns = phone.querySelectorAll('.cn-seg button');
  var live = document.getElementById('cn-live');
  var meta = document.getElementById('cn-meta');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var EASE = 'cubic-bezier(.2, .8, .2, 1)';

  function say(msg) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 30); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  /* ---------- Dates ---------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var AXIS0 = Date.UTC(2027, 8, 24); // the axis starts on 24 Sep 2027
  var DAYS = 58, COL = 40, PAD = 29;  // 58 days, 40px a day, 29px before the first tick
  function dayOf(i) { return new Date(AXIS0 + i * 864e5); }
  function idx(mon, d) { return Math.round((Date.UTC(2027, MON.indexOf(mon), d) - AXIS0) / 864e5); }
  function longLabel(i) { var d = dayOf(i); return WD[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MON[d.getUTCMonth()]; }
  function shortLabel(i) { var d = dayOf(i); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()]; }
  function xOf(i) { return PAD + COL * i; }

  /* ---------- Matches: the fixture list, and the teams the fan follows ---------- */
  var FIX = (window.cnFixtures || []).map(function (f) {
    var p = f.d.split(' ');
    return { i: idx(p[2], +p[1]), teams: f.t ? f.t.split(' v ') : null, stage: f.s, venue: f.v, away: f.a || null };
  });
  var MATCH_DAY = {};
  FIX.forEach(function (f) { MATCH_DAY[f.i] = true; });
  var FIRST = idx('Oct', 1), LAST = idx('Nov', 13);
  var ALL_TEAMS = [];
  FIX.forEach(function (f) { (f.teams || []).forEach(function (t) { if (ALL_TEAMS.indexOf(t) < 0) ALL_TEAMS.push(t); }); });
  ALL_TEAMS.sort();
  // The fan chose their team earlier in the journey: it comes from the trip setup. They can add, change or remove teams here.
  var state = { teams: window.cnTripSetup && window.cnTripSetup.team ? [window.cnTripSetup.team] : [], showMine: true };
  var IMG_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="5.5" cy="6" r="1.2" fill="currentColor"/><path d="M2 12l4-3.5 3 2.5 2-1.5 3 2.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  var TICKET = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1.4a1.6 1.6 0 0 0 0 3.2V10a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V8.6a1.6 1.6 0 0 0 0-3.2z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  function isMine(f) { return !!f.teams && f.teams.some(function (t) { return state.teams.indexOf(t) > -1; }); }
  function cityOf(f) { return f.away ? f.away : /Newcastle/.test(f.venue) ? 'NSW (Newcastle)' : 'NSW (Sydney)'; }
  var range = { start: idx('Sep', 26), end: idx('Oct', 11) };

  /* ---------- Timeline view ---------- */
  var el = {};

  function buildTimeline() {
    var h = '';
    h += '<h3 class="cn-tl-title">All matches, 1 Oct to 13 Nov 2027</h3>';
    h += '<ul class="cn-tl-key"><li><span class="cn-tl-dot cn-tl-dot--team" aria-hidden="true"></span><span id="cn-tl-key-team"></span></li><li><span class="cn-tl-emoji" aria-hidden="true">\ud83c\udfc9</span>Other matches</li><li><span class="cn-tl-imgkey" aria-hidden="true">' + IMG_ICON + '</span>Your places</li></ul>';
    h += '<div class="cn-tl-row"><p class="cn-tl-summary"><strong id="cn-tl-range"></strong><span id="cn-tl-days"></span></p><button type="button" class="cn-tl-done">Done</button></div>';
    h += '<div class="cn-tl-controls"><button type="button" class="cn-switch cn-switch--sm" id="cn-tl-mine" role="switch" aria-checked="true"><span class="cn-switch-track" aria-hidden="true"></span>Show my teams\u2019 matches</button>';
    h += '<button type="button" class="cn-tl-teams-btn" id="cn-tl-teams-btn" aria-expanded="false" aria-controls="cn-tl-teams-panel"><span id="cn-tl-teams-label"></span><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.2l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    h += '<div class="cn-tl-teams-panel" id="cn-tl-teams-panel" role="group" aria-label="Choose your teams" hidden><div class="cn-tl-teams-head"><strong>Your teams</strong><button type="button" class="cn-tl-clear" id="cn-tl-clear">Clear all</button></div><ul class="cn-tl-teams-list">';
    ALL_TEAMS.forEach(function (t) { h += '<li><label><input type="checkbox" value="' + t + '"><span>' + t + '</span></label></li>'; });
    h += '</ul></div><ul class="cn-tl-chips" id="cn-tl-chips"></ul></div>';
    h += '<div class="cn-tl-scroll" tabindex="0" role="region" aria-label="Timeline of all matches. Scrolls sideways."><div class="cn-tl-canvas" style="width:' + (PAD * 2 + COL * (DAYS - 1)) + 'px">';
    h += '<div class="cn-tl-band" id="cn-tl-band"></div>';
    h += '<span class="cn-tl-tag" id="cn-tl-tag-start"></span><span class="cn-tl-tag" id="cn-tl-tag-end"></span>';
    h += '<div class="cn-tl-axis" style="left:' + PAD + 'px;width:' + (COL * (DAYS - 1)) + 'px"></div>';
    for (var i = 0; i < DAYS; i++) {
      var inTournament = i >= FIRST && i <= LAST, isMatch = !!MATCH_DAY[i];
      var cls = isMatch ? 'is-match' : inTournament ? 'is-day' : 'is-off';
      var d = dayOf(i);
      h += '<span class="cn-tl-tick ' + cls + '" data-i="' + i + '" style="left:' + xOf(i) + 'px"></span>';
      h += '<span class="cn-tl-date ' + cls + '" data-i="' + i + '" style="left:' + xOf(i) + 'px">' + d.getUTCDate() + '</span>';
      if (i === 0 || d.getUTCDate() === 1) h += '<span class="cn-tl-month" style="left:' + xOf(i) + 'px">' + MON[d.getUTCMonth()] + ' 2027</span>';
    }
    h += '<div class="cn-tl-markers" id="cn-tl-markers"></div>';
    h += '<span class="cn-tl-bracket" style="left:' + (xOf(FIRST) - 18) + 'px;width:' + (xOf(LAST) - xOf(FIRST) + 36) + 'px"></span>';
    h += '<span class="cn-tl-bracket-label" style="left:' + (xOf(FIRST) - 12) + 'px">Rugby World Cup 2027, 1 Oct to 13 Nov</span>';
    h += '<button type="button" class="cn-tl-handle" data-which="start" role="slider" aria-label="First day in NSW" aria-valuemin="0" aria-valuemax="' + (DAYS - 1) + '"></button>';
    h += '<button type="button" class="cn-tl-handle" data-which="end" role="slider" aria-label="Last day in NSW" aria-valuemin="0" aria-valuemax="' + (DAYS - 1) + '"></button>';
    h += '</div></div>';
    h += '<p class="visually-hidden" id="cn-tl-sr"></p>';
    h += '<p class="cn-tl-foot" id="cn-tl-foot"></p>';
    h += '<p class="cn-hint cn-tl-swipe">Swipe sideways for later dates</p>';
    tlPane.innerHTML = h;
    el.scroll = tlPane.querySelector('.cn-tl-scroll');
    el.canvas = tlPane.querySelector('.cn-tl-canvas');
    el.band = document.getElementById('cn-tl-band');
    el.tagS = document.getElementById('cn-tl-tag-start');
    el.tagE = document.getElementById('cn-tl-tag-end');
    el.hS = tlPane.querySelector('[data-which="start"]');
    el.hE = tlPane.querySelector('[data-which="end"]');
    el.range = document.getElementById('cn-tl-range');
    el.days = document.getElementById('cn-tl-days');
    el.foot = document.getElementById('cn-tl-foot');
    el.done = tlPane.querySelector('.cn-tl-done');
    el.markers = document.getElementById('cn-tl-markers');
    el.mine = document.getElementById('cn-tl-mine');
    el.teamsBtn = document.getElementById('cn-tl-teams-btn');
    el.teamsLabel = document.getElementById('cn-tl-teams-label');
    el.teamsPanel = document.getElementById('cn-tl-teams-panel');
    el.chips = document.getElementById('cn-tl-chips');
    el.keyTeam = document.getElementById('cn-tl-key-team');
    el.sr = document.getElementById('cn-tl-sr');
  }

  function applyOut() {
    Array.prototype.forEach.call(tlPane.querySelectorAll('[data-i]'), function (n) {
      var i = +n.dataset.i;
      n.classList.toggle('is-out', i < range.start || i > range.end);
    });
  }
  // Markers above the axis, one stack a day: the followed teams' matches (large), other rugby matches (a rugby ball),
  // then anything that is not a rugby match, such as a place on the itinerary (an image placeholder).
  function renderMarkers() {
    var days = {}, h = '', lastLabelX = -999, sr = [];
    function day(i) { return days[i] || (days[i] = { mine: [], other: [], places: [] }); }
    FIX.forEach(function (f) { var mineF = isMine(f); if (mineF && !state.showMine) return; (mineF ? day(f.i).mine : day(f.i).other).push(f); });
    // Itinerary places that are not rugby matches
    Array.prototype.forEach.call(listPane.querySelectorAll('.cn-day'), function (hd) {
      var m = /^[A-Z][a-z]{2} (\d+) ([A-Z][a-z]{2})$/.exec(hd.textContent.trim());
      if (!m) return;
      var ul = hd.nextElementSibling; while (ul && ul.tagName !== 'UL') ul = ul.nextElementSibling;
      Array.prototype.forEach.call(ul ? ul.querySelectorAll('.cn-item-name') : [], function (nm) {
        if (/ v /.test(nm.textContent)) return;
        day(idx(m[2], +m[1])).places.push(nm.textContent.trim());
      });
    });
    Object.keys(days).map(Number).sort(function (a, b) { return a - b; }).forEach(function (i) {
      var d = days[i], x = xOf(i), cy = 189, prev = 0, top = 189;
      function put(size) { cy = prev ? cy - (prev / 2 + 5 + size / 2) : 189; prev = size; top = cy - size / 2; return cy - size / 2; }
      d.mine.forEach(function (f) {
        h += '<span class="cn-tl-marker cn-tl-marker--team" data-i="' + i + '" title="' + f.teams.join(' v ') + ', ' + cityOf(f) + '" style="left:' + x + 'px;top:' + put(26) + 'px">' + TICKET + '</span>';
        sr.push(longLabel(i) + ': ' + f.teams.join(' v ') + ', ' + cityOf(f));
      });
      d.other.forEach(function (f) {
        h += '<span class="cn-tl-marker cn-tl-marker--ball" data-i="' + i + '" title="' + (f.teams ? f.teams.join(' v ') : f.stage) + '" style="left:' + x + 'px;top:' + put(16) + 'px" aria-hidden="true">\ud83c\udfc9</span>';
      });
      d.places.forEach(function (name) {
        h += '<span class="cn-tl-marker cn-tl-marker--img" data-i="' + i + '" title="' + name + '" style="left:' + x + 'px;top:' + put(16) + 'px">' + IMG_ICON + '</span>';
        sr.push(longLabel(i) + ': ' + name + ' (your itinerary)');
      });
      if (d.mine.length && top - 4 > 78) {
        h += '<span class="cn-tl-leader" data-i="' + i + '" style="left:' + x + 'px;top:71px;height:' + (top - 4 - 71) + 'px"></span>';
        if (x - lastLabelX >= 84) { h += '<span class="cn-tl-city" data-i="' + i + '" style="left:' + x + 'px">' + cityOf(d.mine[0]) + '</span>'; lastLabelX = x; }
      }
    });
    el.markers.innerHTML = h;
    el.sr.textContent = sr.length ? 'On the timeline: ' + sr.join('. ') + '.' : '';
    applyOut();
  }
  function teamsLabel() { var t = state.teams; return !t.length ? 'Choose your teams' : 'Teams: ' + (t.length <= 2 ? t.join(', ') : t[0] + ', ' + t[1] + ' +' + (t.length - 2)); }
  function syncTeams() {
    el.teamsLabel.textContent = teamsLabel();
    el.keyTeam.textContent = state.teams.length ? 'Your teams (' + (state.teams.length <= 2 ? state.teams.join(', ') : state.teams.length + ' teams') + ')' : 'Your teams';
    Array.prototype.forEach.call(el.teamsPanel.querySelectorAll('input'), function (c) { c.checked = state.teams.indexOf(c.value) > -1; });
    el.chips.innerHTML = state.teams.length ? state.teams.map(function (t) { return '<li><button type="button" class="cn-tl-chip" data-team="' + t + '" aria-label="Remove ' + t + '">' + t + '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button></li>'; }).join('') : '<li class="cn-tl-nochip">No teams chosen. Open the list to add one.</li>';
    if (window.cnTripSetup) window.cnTripSetup.team = state.teams.join(', ');
    renderMarkers();
    updateRange();
  }
  function setTeams(list, msg) { state.teams = list; if (list.length && !state.showMine) { state.showMine = true; el.mine.setAttribute('aria-checked', 'true'); } syncTeams(); if (msg) say(msg); }
  function bindTeams() {
    el.mine.addEventListener('click', function () {
      state.showMine = !state.showMine;
      el.mine.setAttribute('aria-checked', state.showMine ? 'true' : 'false');
      renderMarkers();
      say(state.showMine ? 'Showing your teams\u2019 matches.' : 'Your teams\u2019 matches are hidden.');
    });
    el.teamsBtn.addEventListener('click', function () {
      var open = el.teamsPanel.hidden;
      el.teamsPanel.hidden = !open;
      el.teamsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    el.teamsPanel.addEventListener('change', function (e) {
      var c = e.target; if (!c.matches('input')) return;
      var t = c.value, list = state.teams.filter(function (x) { return x !== t; });
      if (c.checked) list.push(t);
      list.sort();
      setTeams(list, c.checked ? 'Added ' + t + '.' : 'Removed ' + t + '.');
    });
    document.getElementById('cn-tl-clear').addEventListener('click', function () { setTeams([], 'All teams removed.'); });
    el.chips.addEventListener('click', function (e) {
      var b = e.target.closest('.cn-tl-chip'); if (!b) return;
      var t = b.dataset.team, items = el.chips.querySelectorAll('.cn-tl-chip'), k = Array.prototype.indexOf.call(items, b);
      setTeams(state.teams.filter(function (x) { return x !== t; }), 'Removed ' + t + '.');
      var left = el.chips.querySelectorAll('.cn-tl-chip');
      (left[Math.min(k, left.length - 1)] || el.teamsBtn).focus();
    });
    tlPane.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !el.teamsPanel.hidden) { e.stopPropagation(); el.teamsPanel.hidden = true; el.teamsBtn.setAttribute('aria-expanded', 'false'); el.teamsBtn.focus(); }
    });
  }

  function itemCount() { return listPane.querySelectorAll('.cn-item').length; }
  function updateRange() {
    var s = range.start, e = range.end;
    el.band.style.left = (xOf(s) - COL / 2) + 'px';
    el.band.style.width = ((e - s + 1) * COL) + 'px';
    el.hS.style.left = (xOf(s) - COL / 2) + 'px';
    el.hE.style.left = (xOf(e) + COL / 2) + 'px';
    el.tagS.style.left = (xOf(s) - COL / 2) + 'px'; el.tagS.textContent = longLabel(s);
    el.tagE.style.left = (xOf(e) + COL / 2) + 'px'; el.tagE.textContent = longLabel(e);
    [[el.hS, s, 'First day in NSW'], [el.hE, e, 'Last day in NSW']].forEach(function (a) {
      a[0].setAttribute('aria-valuenow', a[1]);
      a[0].setAttribute('aria-valuetext', longLabel(a[1]));
    });
    el.range.textContent = shortLabel(s) + ' to ' + shortLabel(e);
    el.days.textContent = plural(e - s + 1, 'day', 'days') + ' in NSW';
    applyOut();
    // "5 days before your first match": the followed teams' first match inside the range
    var mine = FIX.filter(function (f) { return isMine(f) && f.i >= s && f.i <= e; }).sort(function (x, y) { return x.i - y.i; })[0];
    el.foot.textContent = !state.teams.length ? 'Choose a team to see how long it is before your first match.' : !mine ? 'None of your teams\u2019 matches fall in these days.' : mine.i === s ? 'Your first match is on your first day.' : plural(mine.i - s, 'day', 'days') + ' before your first match.';
    meta.textContent = shortLabel(s) + ' to ' + shortLabel(e) + ' · ' + plural(itemCount(), 'item', 'items');
    if (window.cnTripSetup) { window.cnTripSetup.arrive = longLabel(s); window.cnTripSetup.leave = longLabel(e); }
  }

  // Range handles: drag, or arrow keys when focused. The handle sits on the edge of the first or last day.
  function bindRange() {
    var drag = null;
    function setEdge(which, i) {
      i = Math.max(0, Math.min(DAYS - 1, i));
      if (which === 'start') range.start = Math.min(i, range.end); else range.end = Math.max(i, range.start);
      updateRange();
    }
    function fromPointer(which, clientX) {
      var x = clientX - el.canvas.getBoundingClientRect().left - drag.off;
      return which === 'start' ? Math.round((x - PAD + COL / 2) / COL) : Math.round((x - PAD - COL / 2) / COL);
    }
    [el.hS, el.hE].forEach(function (hd) {
      var which = hd.dataset.which;
      hd.addEventListener('pointerdown', function (e) {
        if (e.button > 0) return;
        e.preventDefault();
        var edge = which === 'start' ? xOf(range.start) - COL / 2 : xOf(range.end) + COL / 2;
        drag = { which: which, id: e.pointerId, off: e.clientX - el.canvas.getBoundingClientRect().left - edge, x: e.clientX, raf: 0 };
        hd.setPointerCapture(e.pointerId);
        hd.classList.add('is-dragging');
        hd.focus({ preventScroll: true });
        (function loop() { // keep scrolling while the pointer rests near an edge
          if (!drag) return;
          var r = el.scroll.getBoundingClientRect(), near = 40, dx = 0;
          if (drag.x < r.left + near) dx = -Math.ceil((r.left + near - drag.x) / near * 12);
          else if (drag.x > r.right - near) dx = Math.ceil((drag.x - (r.right - near)) / near * 12);
          if (dx) { el.scroll.scrollLeft += dx; setEdge(which, fromPointer(which, drag.x)); }
          drag.raf = requestAnimationFrame(loop);
        })();
      });
      hd.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        drag.x = e.clientX;
        setEdge(which, fromPointer(which, e.clientX));
      });
      function end(e) { if (!drag || e.pointerId !== drag.id) return; cancelAnimationFrame(drag.raf); drag = null; hd.classList.remove('is-dragging'); }
      hd.addEventListener('pointerup', end);
      hd.addEventListener('pointercancel', end);
      hd.addEventListener('keydown', function (e) {
        var cur = which === 'start' ? range.start : range.end, step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -7, PageUp: 7 }[e.key];
        if (e.key === 'Home') step = -DAYS; if (e.key === 'End') step = DAYS;
        if (!step) return;
        e.preventDefault();
        setEdge(which, cur + step);
        hd.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    });
    el.done.addEventListener('click', function () { setView('list'); segBtns[1].focus({ preventScroll: true }); });
  }

  /* ---------- Toggle ---------- */
  function setView(v) {
    var tl = v === 'timeline';
    listPane.hidden = tl;
    tlPane.hidden = !tl;
    segBtns[0].setAttribute('aria-pressed', tl ? 'true' : 'false');
    segBtns[1].setAttribute('aria-pressed', tl ? 'false' : 'true');
    phone.dataset.view = v;
    body.scrollTop = 0;
    if (tl) { el.scroll.scrollLeft = 0; renderMarkers(); }
    phone.dispatchEvent(new CustomEvent('cn:view', { detail: v }));
  }
  segBtns[0].addEventListener('click', function () { setView('timeline'); });
  segBtns[1].addEventListener('click', function () { setView('list'); });

  /* ---------- Reorder ---------- */
  function lists() { return Array.prototype.slice.call(listPane.querySelectorAll('.cn-items')); }
  function itemsOf(ul, skip) { return Array.prototype.filter.call(ul.children, function (c) { return c.classList.contains('cn-item') && c !== skip; }); }
  function headOf(ul) { var n = ul.previousElementSibling; while (n && !n.classList.contains('cn-day')) n = n.previousElementSibling; return n; }
  function dayName(ul) { var h = headOf(ul); return h ? h.textContent.trim() : ''; }
  function refreshEmpty(skip) { lists().forEach(function (ul) { ul.classList.toggle('is-empty', itemsOf(ul, skip).length === 0); }); }
  function nameOf(li) { return li.querySelector('.cn-item-name').textContent.trim(); }
  // Run a DOM change and slide every other item from where it was to where it is now
  function flip(change, skip) {
    var all = Array.prototype.slice.call(listPane.querySelectorAll('.cn-item')).filter(function (x) { return x !== skip; });
    var before = all.map(function (x) { return x.getBoundingClientRect().top; });
    change();
    if (reduce.matches) return;
    all.forEach(function (x, k) {
      var dy = before[k] - x.getBoundingClientRect().top;
      if (dy) x.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 200, easing: EASE });
    });
  }
  function position(li) { var ul = li.parentNode, all = itemsOf(ul); return { day: dayName(ul), n: all.indexOf(li) + 1, of: all.length }; }
  function announceDrop(li) { var p = position(li); say(nameOf(li) + ' is now in ' + p.day + ', position ' + p.n + ' of ' + p.of + '.'); phone.dispatchEvent(new CustomEvent('cn:reorder')); }

  var drag = null;
  function updateDrag() {
    var d = drag, li = d.li, ls = lists();
    var top = d.y - d.dy, center = top + li.offsetHeight / 2, target = ls[0];
    ls.forEach(function (ul) { var h = headOf(ul); if (h && d.y >= h.getBoundingClientRect().top - 2) target = ul; });
    var sibs = itemsOf(target, li), n = 0;
    sibs.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top + r.height / 2 < center) n++; });
    var ref = sibs[n] || null;
    if (li.parentNode !== target || li.nextElementSibling !== ref) {
      flip(function () { target.insertBefore(li, ref); refreshEmpty(li); }, li);
    }
    ls.forEach(function (ul) { ul.classList.toggle('is-over', ul === target); });
    li.style.transform = '';
    var nat = li.getBoundingClientRect().top;
    li.style.transform = 'translateY(' + (top - nat) + 'px) scale(1.02)';
  }
  listPane.addEventListener('pointerdown', function (e) {
    var hd = e.target.closest('.cn-handle');
    if (!hd || e.button > 0 || drag) return;
    e.preventDefault();
    var li = hd.closest('.cn-item'), r = li.getBoundingClientRect();
    drag = { li: li, hd: hd, id: e.pointerId, dy: e.clientY - r.top, y: e.clientY, home: { ul: li.parentNode, next: li.nextElementSibling }, raf: 0 };
    hd.setPointerCapture(e.pointerId);
    li.classList.add('is-dragging');
    phone.classList.add('is-sorting');
    hd.focus({ preventScroll: true });
    say('Picked up ' + nameOf(li) + '.');
    updateDrag();
    (function loop() { // keep scrolling the list while the pointer rests near the top or bottom
      if (!drag) return;
      var b = body.getBoundingClientRect(), near = 56, dy = 0;
      if (drag.y < b.top + near) dy = -Math.ceil((b.top + near - drag.y) / near * 14);
      else if (drag.y > b.bottom - near) dy = Math.ceil((drag.y - (b.bottom - near)) / near * 14);
      if (dy) { var was = body.scrollTop; body.scrollTop += dy; if (body.scrollTop !== was) updateDrag(); }
      drag.raf = requestAnimationFrame(loop);
    })();
  });
  listPane.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    drag.y = e.clientY;
    updateDrag();
  });
  function finish(commit) {
    var d = drag; if (!d) return;
    drag = null;
    cancelAnimationFrame(d.raf);
    var li = d.li;
    if (!commit) flip(function () { d.home.ul.insertBefore(li, d.home.next); refreshEmpty(); }, li);
    var from = li.getBoundingClientRect().top;
    li.style.transform = '';
    var to = li.getBoundingClientRect().top;
    function done() { li.classList.remove('is-dragging'); phone.classList.remove('is-sorting'); lists().forEach(function (ul) { ul.classList.remove('is-over'); }); refreshEmpty(); }
    if (reduce.matches) done();
    else { var a = li.animate([{ transform: 'translateY(' + (from - to) + 'px) scale(1.02)' }, { transform: 'none' }], { duration: 180, easing: EASE }); a.onfinish = a.oncancel = done; }
    if (commit) announceDrop(li); else say('Move cancelled.');
  }
  listPane.addEventListener('pointerup', function (e) { if (drag && e.pointerId === drag.id) finish(true); });
  listPane.addEventListener('pointercancel', function (e) { if (drag && e.pointerId === drag.id) finish(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drag) { e.stopPropagation(); finish(false); } }, true);

  // Keyboard: Space or Enter picks up, arrow keys move, Space or Enter drops, Escape puts it back
  var held = null;
  function release(commit, hd) {
    if (!held) return;
    var h = held; held = null;
    h.li.classList.remove('is-grabbed');
    h.hd.setAttribute('aria-pressed', 'false');
    if (!commit) { flip(function () { h.home.ul.insertBefore(h.li, h.home.next); refreshEmpty(); }, null); h.hd.focus(); say('Move cancelled.'); }
    else announceDrop(h.li);
  }
  function step(li, dir) {
    var ul = li.parentNode, ls = lists(), sib = dir < 0 ? li.previousElementSibling : li.nextElementSibling, target, ref;
    while (sib && !sib.classList.contains('cn-item')) sib = dir < 0 ? sib.previousElementSibling : sib.nextElementSibling;
    if (sib) { target = ul; ref = dir < 0 ? sib : sib.nextElementSibling; }
    else {
      var k = ls.indexOf(ul) + dir;
      if (k < 0 || k >= ls.length) { say(dir < 0 ? 'Already first.' : 'Already last.'); return false; }
      target = ls[k]; ref = dir < 0 ? null : (itemsOf(target)[0] || null);
    }
    flip(function () { target.insertBefore(li, ref); refreshEmpty(); }, null);
    li.querySelector('.cn-handle').focus();
    var p = position(li);
    say('Moved to ' + p.day + ', position ' + p.n + ' of ' + p.of + '.');
    return true;
  }
  listPane.addEventListener('keydown', function (e) {
    var hd = e.target.closest('.cn-handle');
    if (!hd) return;
    var li = hd.closest('.cn-item');
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (held) { release(true, hd); return; }
      held = { li: li, hd: hd, home: { ul: li.parentNode, next: li.nextElementSibling } };
      li.classList.add('is-grabbed');
      hd.setAttribute('aria-pressed', 'true');
      var p = position(li);
      say('Picked up ' + nameOf(li) + ', ' + p.day + ', position ' + p.n + ' of ' + p.of + '. Use the up and down arrow keys to move it, Space to drop, Escape to cancel.');
    } else if (held && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      step(li, e.key === 'ArrowUp' ? -1 : 1);
    } else if (held && e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation(); release(false, hd);
    }
  });
  listPane.addEventListener('focusout', function (e) {
    if (held && e.target.closest && e.target.closest('.cn-handle') === held.hd) { var h = held; setTimeout(function () { if (held === h && document.activeElement !== h.hd) release(true, h.hd); }, 0); }
  });

  buildTimeline();
  bindRange();
  bindTeams();
  syncTeams();
  phone.addEventListener('cn:reorder', renderMarkers);
  refreshEmpty();
})();
