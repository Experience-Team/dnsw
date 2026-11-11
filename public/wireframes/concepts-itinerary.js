/* Concepts: the itinerary screen (M1).
   1. Timeline / List toggle.
   2. Timeline view: the fan's own trip on a sideways-scrolling date axis. Their teams' matches (and any match they
      have a ticket for) sit above the line, the places on their list below it, with a draggable range for the days
      they are in NSW. Every marker opens the product page in a full-screen modal.
   3. List view: drag-to-reorder (pointer and keyboard), within a day, between days and into Not yet planned.
   Placeholder data throughout (prototype only). The list in the page is the source of truth: the timeline, the AI
   prompt and the range read from it, so reordering and changing the range show up there. Nothing here is saved in
   the browser; the only saved state on the page is the annotation switch. */
(function () {
  'use strict';
  var phone = document.getElementById('cn-phone');
  if (!phone) return;
  var body = phone.querySelector('.cn-body');
  var behind = phone.querySelectorAll('.cn-bar, .cn-body, .cn-foot');
  var listPane = phone.querySelector('[data-pane="list"]');
  var tlPane = phone.querySelector('[data-pane="timeline"]');
  var segBtns = phone.querySelectorAll('.cn-seg button');
  var live = document.getElementById('cn-live');
  var meta = document.getElementById('cn-meta');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var EASE = 'cubic-bezier(.2, .8, .2, 1)';

  function say(msg) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 30); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

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
  // Today in Sydney, as a day on the axis (negative before 24 Sep 2027)
  function todayIdx() {
    var p = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
    var g = function (t) { return +p.filter(function (x) { return x.type === t; })[0].value; };
    return Math.round((Date.UTC(g('year'), g('month') - 1, g('day')) - AXIS0) / 864e5);
  }

  /* ---------- Matches: the fixture list, and the teams the fan follows ---------- */
  var FIX = (window.cnFixtures || []).map(function (f, k) {
    var p = f.d.split(' ');
    return { key: 'm' + k, i: idx(p[2], +p[1]), teams: f.t ? f.t.split(' v ') : null, stage: f.s, venue: f.v, precinct: f.p || '', kick: f.k || '', away: f.a || null, ticket: !!f.ticket };
  });
  var FIRST = idx('Oct', 1), LAST = idx('Nov', 13);
  // Only real teams: pool matches. Knockout matches are not drawn yet ("2nd Pool C") and are not teams.
  var ALL_TEAMS = [];
  FIX.forEach(function (f) { if (/^Pool/.test(f.stage) && f.teams) f.teams.forEach(function (t) { if (ALL_TEAMS.indexOf(t) < 0) ALL_TEAMS.push(t); }); });
  ALL_TEAMS.sort();
  // The fan chose their team earlier in the journey (the trip setup). It is a string, one team or several joined
  // with ", "; anything that is not a team in the list is dropped, so older or odd values load without errors.
  var setupTeam = window.cnTripSetup && typeof window.cnTripSetup.team === 'string' ? window.cnTripSetup.team : '';
  var state = { teams: setupTeam.split(/\s*,\s*/).filter(function (t) { return ALL_TEAMS.indexOf(t) > -1; }).sort() };
  var ICON = {
    img: '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="5.5" cy="6" r="1.2" fill="currentColor"/><path d="M2 12l4-3.5 3 2.5 2-1.5 3 2.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    ticket: '<svg width="16" height="16" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1.4a1.6 1.6 0 0 0 0 3.2V10a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V8.6a1.6 1.6 0 0 0 0-3.2z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    ball: '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><ellipse cx="8" cy="8" rx="6.5" ry="4.2" transform="rotate(-35 8 8)" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.6 10.4l4.8-4.8M6.8 7.6l1.6 1.6M8 6.4l1.6 1.6" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>'
  };
  // The same symbols are used on the chart and in the legend
  function sym(kind) { return '<span class="cn-tl-sym cn-tl-sym--' + kind + '" aria-hidden="true">' + ICON[kind === 'match' ? 'ball' : kind === 'place' ? 'img' : 'ticket'] + '</span>'; }
  function isMine(f) { return !!f.teams && f.teams.some(function (t) { return state.teams.indexOf(t) > -1; }); }
  // On the timeline: the fan's teams' matches, and any match they hold a ticket for, whoever is playing
  function onTrip(f) { return f.ticket || isMine(f); }
  function matchName(f) { return f.teams ? f.teams.join(' v ') : f.stage; }
  function kickLabel(k) { return k ? k.replace(/(am|pm)$/, ' $1') : ''; }
  var range = { start: idx('Sep', 26), end: idx('Oct', 11) };

  /* ---------- Places: read from the list ---------- */
  function places() {
    var dated = [], unplanned = [];
    Array.prototype.forEach.call(listPane.querySelectorAll('.cn-day'), function (hd) {
      var m = /^[A-Z][a-z]{2} (\d+) ([A-Z][a-z]{2})$/.exec(hd.textContent.trim());
      var ul = hd.nextElementSibling; while (ul && ul.tagName !== 'UL') ul = ul.nextElementSibling;
      Array.prototype.forEach.call(ul ? ul.querySelectorAll('.cn-item') : [], function (li) {
        var name = li.querySelector('.cn-item-name').textContent.trim();
        if (m && / v /.test(name)) return; // a planned match is drawn as a match marker
        var p = { key: 'p:' + li.dataset.stop, id: li.dataset.stop, name: name, i: m ? idx(m[2], +m[1]) : null };
        (m ? dated : unplanned).push(p);
      });
    });
    return { dated: dated, unplanned: unplanned };
  }

  /* ---------- Timeline view ---------- */
  var el = {};
  var ROW = 76; // one marker (44px) plus a two-line label

  function buildTimeline() {
    var h = '';
    h += '<h3 class="cn-tl-title">Your matches and places</h3>';
    h += '<ul class="cn-tl-key"><li>' + sym('ticket') + 'Match with your ticket</li><li>' + sym('match') + 'Your teams’ matches</li><li>' + sym('place') + 'Your places</li></ul>';
    h += '<div class="cn-tl-row"><p class="cn-tl-summary"><span class="visually-hidden">Your days in NSW: </span><strong id="cn-tl-range"></strong></p>';
    h += '<button type="button" class="cn-tl-teams-btn" id="cn-tl-teams-btn" aria-expanded="false" aria-controls="cn-tl-teams-panel"><span class="visually-hidden">Your teams: </span><span id="cn-tl-teams-label"></span><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.2l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    h += '<div class="cn-tl-teams-panel" id="cn-tl-teams-panel" role="group" aria-labelledby="cn-tl-teams-h" hidden><div class="cn-tl-teams-head"><strong id="cn-tl-teams-h">Your teams</strong><button type="button" class="cn-tl-clear" id="cn-tl-clear">Clear all</button></div><ul class="cn-tl-teams-list">';
    ALL_TEAMS.forEach(function (t) { h += '<li><label><input type="checkbox" value="' + esc(t) + '"><span>' + esc(t) + '</span></label></li>'; });
    h += '</ul></div>';
    h += '<button type="button" class="cn-tl-done">Done</button></div>';
    h += '<div class="cn-tl-empty" id="cn-tl-empty" hidden><p><strong>No teams chosen yet.</strong> Choose your teams to see their matches here.</p><button type="button" class="cn-pill cn-pill--outline cn-pill--sm" id="cn-tl-empty-btn">Choose teams</button></div>';
    h += '<div class="cn-tl-scroll" tabindex="0" role="region" aria-label="Your trip timeline. Scrolls sideways."><div class="cn-tl-canvas" style="width:' + (PAD * 2 + COL * (DAYS - 1)) + 'px">';
    h += '<div class="cn-tl-band" id="cn-tl-band"></div>';
    h += '<span class="cn-tl-tag" id="cn-tl-tag-start"></span><span class="cn-tl-tag" id="cn-tl-tag-end"></span>';
    h += '<div class="cn-tl-axis" style="left:' + PAD + 'px;width:' + (COL * (DAYS - 1)) + 'px"></div>';
    for (var i = 0; i < DAYS; i++) {
      var cls = i >= FIRST && i <= LAST ? 'is-day' : 'is-off';
      var d = dayOf(i);
      h += '<span class="cn-tl-tick ' + cls + '" data-i="' + i + '" style="left:' + xOf(i) + 'px"></span>';
      h += '<span class="cn-tl-date ' + cls + '" data-i="' + i + '" style="left:' + xOf(i) + 'px">' + d.getUTCDate() + '</span>';
      if (i === 0) h += '<span class="cn-tl-month" style="left:' + (xOf(i) - 8) + 'px;transform:none">' + MON[d.getUTCMonth()] + ' 2027</span>'; // the first month starts at the edge, so it is never cut off
      else if (d.getUTCDate() === 1) h += '<span class="cn-tl-month" style="left:' + xOf(i) + 'px">' + MON[d.getUTCMonth()] + ' 2027</span>';
    }
    h += '<div class="cn-tl-markers" id="cn-tl-markers"></div>';
    h += '<span class="cn-tl-bracket" id="cn-tl-bracket" style="left:' + (xOf(FIRST) - 18) + 'px;width:' + (xOf(LAST) - xOf(FIRST) + 36) + 'px"></span>';
    h += '<span class="cn-tl-bracket-label" id="cn-tl-bracket-label" style="left:' + (xOf(FIRST) - 18) + 'px">Rugby World Cup 2027<br>1 Oct to 13 Nov</span>';
    h += '<button type="button" class="cn-tl-handle" data-which="start" role="slider" aria-label="First day in NSW" aria-valuemin="0" aria-valuemax="' + (DAYS - 1) + '"></button>';
    h += '<button type="button" class="cn-tl-handle" data-which="end" role="slider" aria-label="Last day in NSW" aria-valuemin="0" aria-valuemax="' + (DAYS - 1) + '"></button>';
    h += '</div></div>';
    h += '<p class="cn-hint cn-tl-swipe">Swipe sideways for later dates</p>';
    h += '<p class="cn-tl-foot" id="cn-tl-foot"></p>';
    h += '<section class="cn-tl-np" aria-labelledby="cn-tl-np-h"><h4 class="cn-day" id="cn-tl-np-h">Not yet planned</h4><ul class="cn-tl-chips" id="cn-tl-np"></ul></section>';
    tlPane.innerHTML = h;
    el.scroll = tlPane.querySelector('.cn-tl-scroll');
    el.canvas = tlPane.querySelector('.cn-tl-canvas');
    el.band = document.getElementById('cn-tl-band');
    el.tagS = document.getElementById('cn-tl-tag-start');
    el.tagE = document.getElementById('cn-tl-tag-end');
    el.hS = tlPane.querySelector('[data-which="start"]');
    el.hE = tlPane.querySelector('[data-which="end"]');
    el.range = document.getElementById('cn-tl-range');
    el.foot = document.getElementById('cn-tl-foot');
    el.done = tlPane.querySelector('.cn-tl-done');
    el.markers = document.getElementById('cn-tl-markers');
    el.scroll.addEventListener('scroll', function () { if (!el.raf) el.raf = requestAnimationFrame(function () { el.raf = 0; placeBracketLabel(); }); }, { passive: true });
    el.teamsBtn = document.getElementById('cn-tl-teams-btn');
    el.teamsLabel = document.getElementById('cn-tl-teams-label');
    el.teamsPanel = document.getElementById('cn-tl-teams-panel');
    el.empty = document.getElementById('cn-tl-empty');
    el.np = document.getElementById('cn-tl-np');
    el.bracket = document.getElementById('cn-tl-bracket');
    el.bracketLabel = document.getElementById('cn-tl-bracket-label');
  }

  // The bracket label sits at the start of its bracket, and slides so it is never cut off by either edge of the view
  function placeBracketLabel() {
    var w = el.bracketLabel.offsetWidth, lo = xOf(FIRST) - 18, hi = xOf(LAST) + 18 - w;
    var view = el.scroll.scrollLeft + 16, right = el.scroll.scrollLeft + el.scroll.clientWidth - 16 - w;
    el.bracketLabel.style.left = Math.max(view, Math.min(right, Math.min(hi, Math.max(lo, view)))) + 'px';
  }
  function applyOut() {
    Array.prototype.forEach.call(tlPane.querySelectorAll('[data-i]'), function (n) {
      var i = +n.dataset.i;
      n.classList.toggle('is-out', i < range.start || i > range.end);
    });
  }
  // Two lanes on one axis. Matches sit above the line, places below it, so the two kinds never share a column.
  // A day with two items of one kind stacks them in rows, and the chart grows to fit. Labels go above a match and
  // under a place where there is room (two days' width); the match you have a ticket for is always labelled.
  function renderMarkers() {
    var pl = places(), up = {}, down = {}, upRows = 1, downRows = 1, h = '';
    FIX.filter(onTrip).sort(function (a, b) { return a.i - b.i || b.ticket - a.ticket; }).forEach(function (f) { (up[f.i] = up[f.i] || []).push(f); });
    pl.dated.forEach(function (p) { (down[p.i] = down[p.i] || []).push(p); });
    Object.keys(up).forEach(function (i) { upRows = Math.max(upRows, up[i].length); });
    Object.keys(down).forEach(function (i) { downRows = Math.max(downRows, down[i].length); });
    var A = 130 + (upRows - 1) * ROW;                 // the axis
    var bottom = A + 64 + downRows * ROW - 4;          // the end of the place lane
    el.canvas.style.setProperty('--axis', A + 'px');
    el.canvas.style.height = (bottom + 50) + 'px';
    el.band.style.height = (bottom - 30) + 'px';
    el.bracket.style.top = (bottom + 10) + 'px';
    el.bracketLabel.style.top = (bottom + 16) + 'px';

    // Decide labels first: ticketed matches, then the rest left to right, one row at a time
    var taken = {};
    function room(lane, row, x, force) {
      var k = lane + row, xs = taken[k] || (taken[k] = []);
      if (!force && xs.some(function (o) { return Math.abs(o - x) < COL * 2; })) return false;
      xs.push(x); return true;
    }
    var items = [];
    Object.keys(up).forEach(function (i) { up[i].forEach(function (f, r) { items.push({ lane: 'up', row: r, i: +i, f: f }); }); });
    Object.keys(down).forEach(function (i) { down[i].forEach(function (p, r) { items.push({ lane: 'down', row: r, i: +i, p: p }); }); });
    items.sort(function (a, b) { return (b.f && b.f.ticket ? 1 : 0) - (a.f && a.f.ticket ? 1 : 0) || a.i - b.i; });
    items.forEach(function (it) { it.label = room(it.lane, it.row, xOf(it.i), it.f && it.f.ticket); });
    // Draw in day order, matches before places, so Tab moves through the trip in time order
    items.sort(function (a, b) { return a.i - b.i || (a.lane === 'up' ? 0 : 1) - (b.lane === 'up' ? 0 : 1) || a.row - b.row; });
    items.forEach(function (it) {
      var x = xOf(it.i), name, kind, aria, top;
      if (it.f) {
        var f = it.f;
        kind = f.ticket ? 'ticket' : 'match';
        name = matchName(f);
        aria = name + ', ' + longLabel(it.i) + ', ' + f.venue + (f.ticket ? ', you have a ticket' : '');
        top = A - 70 - it.row * ROW;
        h += '<button type="button" class="cn-tl-mk cn-tl-mk--' + kind + '" data-key="' + f.key + '" data-i="' + it.i + '" style="left:' + x + 'px;top:' + top + 'px" aria-label="' + esc(aria) + '">' + sym(kind) + '</button>';
        if (it.label) h += '<span class="cn-tl-lbl cn-tl-lbl--up' + (f.ticket ? ' is-ticket' : '') + '" data-i="' + it.i + '" aria-hidden="true" style="left:' + x + 'px;top:' + (top - 2) + 'px">' + esc(name) + '</span>';
      } else {
        var p = it.p;
        aria = p.name + ', ' + longLabel(it.i) + ', your place';
        top = A + 64 + it.row * ROW;
        h += '<button type="button" class="cn-tl-mk cn-tl-mk--place" data-key="' + esc(p.key) + '" data-i="' + it.i + '" style="left:' + x + 'px;top:' + top + 'px" aria-label="' + esc(aria) + '">' + sym('place') + '</button>';
        if (it.label) h += '<span class="cn-tl-lbl cn-tl-lbl--down" data-i="' + it.i + '" aria-hidden="true" style="left:' + x + 'px;top:' + (top + 44) + 'px">' + esc(p.name) + '</span>';
      }
    });
    el.markers.innerHTML = h;
    // Not yet planned: the list's undated places, as a row under the chart
    el.np.innerHTML = pl.unplanned.length ? pl.unplanned.map(function (p) {
      return '<li><button type="button" class="cn-tl-chip cn-tl-chip--place" data-key="' + esc(p.key) + '" aria-label="' + esc(p.name + ', not yet planned') + '">' + sym('place') + esc(p.name) + '</button></li>';
    }).join('') : '<li class="cn-tl-nochip">Nothing here. Places you have not given a day show here.</li>';
    el.empty.hidden = state.teams.length > 0;
    applyOut();
  }
  function teamsLabel() { var t = state.teams; return !t.length ? 'Choose teams' : t.length === 1 ? t[0] : plural(t.length, 'team', 'teams'); }
  function syncTeams() {
    el.teamsLabel.textContent = teamsLabel();
    Array.prototype.forEach.call(el.teamsPanel.querySelectorAll('input'), function (c) { c.checked = state.teams.indexOf(c.value) > -1; });
    if (window.cnTripSetup) window.cnTripSetup.team = state.teams.join(', ');
    renderMarkers();
    updateRange();
  }
  function setTeams(list, msg) { state.teams = list; syncTeams(); if (msg) say(msg); }
  function openTeams(open, focusBack) {
    el.teamsPanel.hidden = !open;
    el.teamsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var c = el.teamsPanel.querySelector('input:checked') || el.teamsPanel.querySelector('input'); c.focus({ preventScroll: true }); c.scrollIntoView({ block: 'nearest' }); }
    else if (focusBack) el.teamsBtn.focus({ preventScroll: true });
  }
  function bindTeams() {
    el.teamsBtn.addEventListener('click', function () { openTeams(el.teamsPanel.hidden, false); });
    document.getElementById('cn-tl-empty-btn').addEventListener('click', function () { openTeams(true); });
    el.teamsPanel.addEventListener('change', function (e) {
      var c = e.target; if (!c.matches('input')) return;
      var t = c.value, list = state.teams.filter(function (x) { return x !== t; });
      if (c.checked) list.push(t);
      list.sort();
      setTeams(list, c.checked ? 'Added ' + t + '.' : 'Removed ' + t + '.');
    });
    document.getElementById('cn-tl-clear').addEventListener('click', function () { setTeams([], 'All teams removed.'); });
    // The list sits over the chart: a tap outside it, Escape, or moving focus away closes it
    document.addEventListener('pointerdown', function (e) {
      if (!el.teamsPanel.hidden && !el.teamsPanel.contains(e.target) && !el.teamsBtn.contains(e.target)) openTeams(false);
    });
    tlPane.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !el.teamsPanel.hidden) { e.stopPropagation(); openTeams(false, true); }
    });
    el.teamsPanel.addEventListener('focusout', function (e) {
      if (!el.teamsPanel.hidden && e.relatedTarget && !el.teamsPanel.contains(e.relatedTarget) && e.relatedTarget !== el.teamsBtn) openTeams(false);
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
    [[el.hS, s], [el.hE, e]].forEach(function (a) {
      a[0].setAttribute('aria-valuenow', a[1]);
      a[0].setAttribute('aria-valuetext', longLabel(a[1]));
    });
    el.range.textContent = shortLabel(s) + ' to ' + shortLabel(e);
    applyOut();
    // "13 days before your first match in NSW": the range is days in NSW, so matches elsewhere (Perth) do not count
    var first = FIX.filter(function (f) { return onTrip(f) && !f.away && f.i >= s && f.i <= e; }).sort(function (x, y) { return x.i - y.i; })[0];
    el.foot.textContent = plural(e - s + 1, 'day', 'days') + ' in NSW. ' + (!first ? (state.teams.length ? 'None of your matches in NSW fall in these days.' : 'Choose your teams to see how long it is before your first match.') : first.i === s ? 'Your first match in NSW is on your first day.' : plural(first.i - s, 'day', 'days') + ' before your first match in NSW.');
    meta.textContent = shortLabel(s) + ' to ' + shortLabel(e) + ' · ' + plural(itemCount(), 'item', 'items');
    if (window.cnTripSetup) { window.cnTripSetup.arrive = longLabel(s); window.cnTripSetup.leave = longLabel(e); }
  }

  // Range handles: drag, or arrow keys when focused. The handle sits on the edge of the first or last day.
  // touch-action: none on the handles, so on touch a drag on a handle moves it and never scrolls the chart; a swipe
  // anywhere else scrolls the chart and never reaches a handle.
  function bindRange() {
    var drag = null, doneTimer;
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
    // Done confirms the dates and stays on the timeline
    el.done.addEventListener('click', function () {
      clearTimeout(doneTimer);
      el.done.textContent = 'Saved';
      el.done.classList.add('is-saved');
      say('Dates saved: ' + el.range.textContent + ', ' + plural(range.end - range.start + 1, 'day', 'days') + ' in NSW.');
      doneTimer = setTimeout(function () { el.done.textContent = 'Done'; el.done.classList.remove('is-saved'); }, 2000);
    });
  }

  /* ---------- Product page modal ----------
     Full screen inside the phone, over the timeline. Built from the product record (concepts-products.js) or, for a
     match not on the list, from the fixture. Contract fields only; gap fields carry the pink marker. */
  var pp, ppBody, ppKind, ppOpen = null;
  function buildModal() {
    var d = document.createElement('div');
    d.className = 'cn-pp'; d.id = 'cn-pp'; d.hidden = true;
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'cn-pp-title');
    d.innerHTML = '<div class="cn-bar"><button type="button" class="cn-close" data-pp-close aria-label="Close"><svg class="cn-x" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button><p class="cn-bar-title" id="cn-pp-kind"></p></div><div class="cn-pp-body" id="cn-pp-body" tabindex="0" role="region" aria-label="Details"></div>';
    phone.appendChild(d);
    pp = d; ppBody = d.querySelector('#cn-pp-body'); ppKind = d.querySelector('#cn-pp-kind');
    d.querySelector('[data-pp-close]').addEventListener('click', function () { closeModal(true); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeModal(true); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(d.querySelectorAll('button, [href], [tabindex="0"]'), function (n) { return n.offsetParent !== null; });
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    phone.addEventListener('cn:screen', function (e) { if (ppOpen && e.detail !== 'm1') closeModal(false); });
  }
  var PRODUCTS = window.cnProducts || {};
  function recordFor(key) {
    var r, f, i, when = null, ticket = false, plan = null;
    if (key.charAt(0) === 'm') {
      f = FIX.filter(function (x) { return x.key === key; })[0];
      if (!f) return null;
      // A match on the list has a full record; any other match is built from the fixture
      var id = Object.keys(PRODUCTS).filter(function (k) { return PRODUCTS[k].title === matchName(f); })[0];
      r = id ? PRODUCTS[id] : { title: matchName(f), overview: f.stage + ' match at Rugby World Cup 2027.', gallery: [{ alt: 'Placeholder image of ' + f.venue }], address: { line: f.venue, suburb: f.precinct }, practical: {}, getting_there: {} };
      when = longLabel(f.i) + ' 2027, ' + (f.kick ? 'kick-off ' + kickLabel(f.kick) : 'kick-off time to be confirmed');
      ticket = f.ticket;
      return { r: r, match: true, when: when, ticket: ticket };
    }
    var p = places(), all = p.dated.concat(p.unplanned);
    var pl = all.filter(function (x) { return x.key === key; })[0];
    if (!pl) return null;
    r = PRODUCTS[pl.id] || { title: pl.name };
    plan = pl.i == null ? 'Not yet planned' : 'In your plan for ' + longLabel(pl.i);
    return { r: r, match: false, plan: plan };
  }
  // "Water, sunscreen": each item is stored capitalised, so lower the first letter of the ones after the first
  function listOf(a) { return a.map(function (x, k) { return k ? x.charAt(0).toLowerCase() + x.slice(1) : x; }).join(', '); }
  function factRows(r) {
    var g = r.getting_there || {}, p = r.practical || {}, rows = [];
    var t = (g.nearest_transport || []).map(function (n) { return n.mode + ', ' + n.name + (n.walking_minutes ? ', ' + n.walking_minutes + ' min walk' : ''); });
    if (t.length) rows.push(['Getting there', t.join('; ')]);
    if ((p.what_to_bring || []).length) rows.push(['What to bring', listOf(p.what_to_bring)]);
    if ((p.on_site_facilities || []).length) rows.push(['Facilities', listOf(p.on_site_facilities)]);
    if (p.best_time_to_visit) rows.push(['Best time', p.best_time_to_visit]);
    return rows;
  }
  function openModal(key, opener) {
    var rec = recordFor(key);
    if (!rec) return;
    var r = rec.r, h = '', addr = r.address ? [r.address.line, r.address.suburb].filter(Boolean).join(', ') : '';
    var alt = r.gallery && r.gallery[0] ? r.gallery[0].alt : 'Placeholder image';
    h += '<div class="plan-modal-img ph-img" role="img" aria-label="' + esc(alt) + '"></div><div class="plan-modal-body">';
    if (rec.match && rec.ticket) h += '<p class="cn-pp-flag">' + sym('ticket') + 'You have a ticket</p>';
    h += '<h2 class="cn-pp-title" id="cn-pp-title">' + esc(r.title) + '</h2>';
    if (rec.match) {
      h += '<p class="plan-modal-when"><span class="provenance-gap">' + esc(rec.when) + '</span></p>';
      if (addr) h += '<p class="cn-pp-venue">' + esc(addr) + '</p>';
    } else {
      h += '<p class="plan-modal-when">' + esc(rec.plan) + '</p>';
      if (addr) h += '<p class="cn-pp-venue">' + esc(addr) + '</p>';
    }
    h += r.overview ? '<p class="cn-pp-text">' + esc(r.overview) + '</p>' : '<p class="cn-pp-none">No description yet.</p>';
    var rows = factRows(r);
    h += '<h3 class="cn-pp-h">Practical details</h3>';
    h += rows.length ? '<dl class="pl-option-facts cn-pp-facts">' + rows.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd><span class="provenance-gap">' + esc(x[1]) + '</span></dd></div>'; }).join('') + '</dl>' : '<p class="cn-pp-none">No practical details yet.</p>';
    h += '</div>';
    ppBody.innerHTML = h;
    ppBody.scrollTop = 0;
    ppKind.textContent = rec.match ? 'Match' : 'Place';
    ppOpen = { key: key, left: el.scroll.scrollLeft, top: body.scrollTop, opener: opener };
    for (var i = 0; i < behind.length; i++) behind[i].inert = true;
    pp.hidden = false;
    pp.classList.remove('is-open');
    void pp.offsetWidth;
    pp.classList.add('is-open');
    pp.querySelector('[data-pp-close]').focus({ preventScroll: true });
  }
  function closeModal(focusBack) {
    if (!ppOpen) return;
    var o = ppOpen; ppOpen = null;
    pp.hidden = true;
    pp.classList.remove('is-open');
    // Leave the list inert if the Save and share sheet has just opened over it
    if (phone.dataset.screen === 'm1') for (var i = 0; i < behind.length; i++) behind[i].inert = false;
    el.scroll.scrollLeft = o.left;
    body.scrollTop = o.top;
    if (focusBack) {
      // The marker may have been redrawn while the modal was open; find it again by its key
      var back = tlPane.querySelector('[data-key="' + o.key.replace(/"/g, '') + '"]') || o.opener;
      if (back && back.isConnected) back.focus({ preventScroll: true });
    }
  }
  tlPane.addEventListener('click', function (e) {
    var b = e.target.closest('[data-key]');
    if (b && tlPane.contains(b)) openModal(b.dataset.key, b);
  });

  /* ---------- Toggle ---------- */
  // Each view keeps its own scroll position. The first time the timeline opens it scrolls to the fan's first day
  // in NSW, or to their next match once the trip has started.
  var memo = { list: 0, timeline: null };
  function startScroll() {
    var t = todayIdx(), target = xOf(range.start) - COL / 2 - 56; // room for the date tag above the handle
    if (t >= range.start && t <= range.end) {
      var next = FIX.filter(function (f) { return onTrip(f) && f.i >= t; }).sort(function (a, b) { return a.i - b.i; })[0];
      if (next) target = xOf(next.i) - 80;
    }
    return Math.max(0, target);
  }
  function setView(v) {
    var cur = phone.dataset.view || 'list', tl = v === 'timeline';
    if (cur === v) return;
    if (cur === 'timeline') memo.timeline = { left: el.scroll.scrollLeft, top: body.scrollTop }; else memo.list = body.scrollTop;
    if (!tl) openTeams(false);
    listPane.hidden = tl;
    tlPane.hidden = !tl;
    segBtns[0].setAttribute('aria-pressed', tl ? 'true' : 'false');
    segBtns[1].setAttribute('aria-pressed', tl ? 'false' : 'true');
    phone.dataset.view = v;
    if (tl) {
      renderMarkers();
      if (memo.timeline) { el.scroll.scrollLeft = memo.timeline.left; body.scrollTop = memo.timeline.top; }
      else { el.scroll.scrollLeft = startScroll(); body.scrollTop = 0; }
      placeBracketLabel();
    } else body.scrollTop = memo.list;
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
  buildModal();
  bindRange();
  bindTeams();
  syncTeams();
  phone.addEventListener('cn:reorder', function () { renderMarkers(); updateRange(); });
  refreshEmpty();
})();
