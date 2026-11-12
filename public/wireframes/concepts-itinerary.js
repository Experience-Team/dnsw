/* Concepts: the itinerary screen (M1).
   1. Timeline / List toggle.
   2. Timeline view: the fan's own trip on a sideways-scrolling date axis. Their teams' matches (and any match they
      have a ticket for) sit above the line, the places on their list below it, with a draggable range for the days
      they are in NSW. Every marker opens the product page in a full-screen modal.
   3. List view: drag-to-reorder (pointer and keyboard), within a day, between days and into Not yet planned.
   Placeholder data throughout (prototype only). The list in the page is the source of truth: the timeline, the AI
   prompt and the range read from it, so reordering and changing the range show up there. The plan (the list's
   order, removed places, the dates and the teams) is kept in this browser's storage, so a reload keeps the fan's
   edits; add ?reset to the address to start again. */
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
  function iso(i) { return dayOf(i).toISOString().slice(0, 10); }
  function fromIso(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? Math.round((Date.UTC(+m[1], +m[2] - 1, +m[3]) - AXIS0) / 864e5) : null; }
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
  // Fixture times are Sydney time (AEDT, UTC+11, through October and November 2027), and every kick-off says so.
  // Outside NSW the local time follows. Minutes behind Sydney in those months: Perth (AWST, UTC+8) 180,
  // Brisbane and Townsville (AEST, no daylight saving, UTC+10) 60, Adelaide (ACDT, UTC+10:30) 30, Melbourne
  // (AEDT) 0. A city not listed gets the Sydney time only, never a guess.
  var BEHIND_MIN = { Perth: 180, Brisbane: 60, Townsville: 60, Adelaide: 30, Melbourne: 0 };
  function kickTime(f) {
    var t = kickLabel(f.kick), m = /(\d{1,2}):(\d{2}) (am|pm)/.exec(t);
    if (!m) return t;
    var out = t + ' Sydney time';
    if (!f.away || !(f.away in BEHIND_MIN)) return out;
    if (BEHIND_MIN[f.away] === 0) return out + ' (the same in ' + f.away + ')';
    var mins = (((+m[1] % 12) + (m[3] === 'pm' ? 12 : 0)) * 60 + +m[2] - BEHIND_MIN[f.away] + 1440) % 1440, h = Math.floor(mins / 60), mm = mins % 60;
    return out + ' (' + ((h % 12) || 12) + ':' + (mm < 10 ? '0' : '') + mm + ' ' + (h < 12 ? 'am' : 'pm') + ' in ' + f.away + ')';
  }
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
    // The legend sits behind a Key button, so the chart starts higher; the ticketed match is always labelled anyway
    h += '<div class="cn-tl-head"><h3 class="cn-tl-title">Your matches and places</h3><span class="cn-tl-head-actions"><button type="button" class="cn-tl-edit cn-tl-keybtn" id="cn-tl-key-btn" aria-expanded="false" aria-controls="cn-tl-key">Key</button><button type="button" class="cn-tl-edit" id="cn-tl-edit" aria-pressed="false"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M9.6 2.1l2.3 2.3-7 7-2.9.6.6-2.9z M8.4 3.3l2.3 2.3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg><span id="cn-tl-edit-label">Edit</span></button></span></div>';
    h += '<p class="cn-hint cn-tl-edit-hint" id="cn-tl-edit-hint" hidden>Drag a place to another day, or up or down to change the order. Keyboard: arrow keys on a place.</p>';
    h += '<ul class="cn-tl-key" id="cn-tl-key" hidden><li>' + sym('ticket') + 'Match with your ticket</li><li>' + sym('match') + 'Your teams’ matches</li><li>' + sym('match').replace('cn-tl-sym--match', 'cn-tl-sym--match is-away') + 'Outside NSW</li><li>' + sym('place') + 'Your places</li></ul>';
    // One row of plain text pickers: the dates (type them in) and the teams, each opening a list over the chart
    h += '<div class="cn-tl-row"><button type="button" class="cn-tl-pick" id="cn-tl-dates-btn" aria-expanded="false" aria-controls="cn-tl-dates-panel"><span class="visually-hidden">Your days in NSW: </span><span id="cn-tl-range"></span><svg class="cn-tl-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.2l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    h += '<div class="cn-tl-teams-panel" id="cn-tl-dates-panel" role="group" aria-labelledby="cn-tl-dates-h" hidden><div class="cn-tl-teams-head"><strong id="cn-tl-dates-h">Your days in NSW</strong><span class="cn-tl-dates-count" id="cn-tl-dates-count"></span></div><div class="cn-tl-dates">';
    h += '<label class="cn-tl-date-field"><span>First day</span><input class="cn-field" type="date" id="cn-tl-in-start" min="' + iso(0) + '" max="' + iso(DAYS - 1) + '" aria-describedby="cn-tl-dates-error"></label>';
    h += '<label class="cn-tl-date-field"><span>Last day</span><input class="cn-field" type="date" id="cn-tl-in-end" min="' + iso(0) + '" max="' + iso(DAYS - 1) + '" aria-describedby="cn-tl-dates-error"></label>';
    h += '</div><p class="cn-error cn-tl-dates-error" id="cn-tl-dates-error" role="alert" hidden></p></div>';
    h += '<button type="button" class="cn-tl-pick" id="cn-tl-teams-btn" aria-expanded="false" aria-controls="cn-tl-teams-panel"><span class="visually-hidden">Your teams: </span><span id="cn-tl-teams-label"></span><svg class="cn-tl-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.2l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    h += '<div class="cn-tl-teams-panel" id="cn-tl-teams-panel" role="group" aria-labelledby="cn-tl-teams-h" hidden><div class="cn-tl-teams-head"><strong id="cn-tl-teams-h">Your teams</strong><button type="button" class="cn-tl-clear" id="cn-tl-clear">Clear all</button></div><ul class="cn-tl-teams-list">';
    ALL_TEAMS.forEach(function (t) { h += '<li><label><input type="checkbox" value="' + esc(t) + '"><span>' + esc(t) + '</span></label></li>'; });
    h += '</ul></div>';
    h += '<button type="button" class="cn-tl-done">Done</button></div>';
    h += '<p class="cn-warn" id="cn-tl-warn" hidden></p>';
    h += '<div class="cn-tl-empty" id="cn-tl-empty" hidden><p><strong>No teams chosen yet.</strong> Choose your teams to see their matches here.</p><button type="button" class="cn-pill cn-pill--outline cn-pill--sm" id="cn-tl-empty-btn">Choose teams</button></div>';
    h += '<div class="cn-tl-scroll" tabindex="0" role="region" aria-label="Your trip timeline. Scrolls sideways."><div class="cn-tl-canvas" style="width:' + (PAD * 2 + COL * (DAYS - 1)) + 'px">';
    h += '<div class="cn-tl-band" id="cn-tl-band"></div><div id="cn-tl-clash"></div>';
    h += '<span class="cn-tl-tag" id="cn-tl-tag-start"></span><span class="cn-tl-tag" id="cn-tl-tag-end"></span>';
    h += '<div class="cn-tl-axis" style="left:' + PAD + 'px;width:' + (COL * (DAYS - 1)) + 'px"></div>';
    for (var i = 0; i < DAYS; i++) {
      var cls = i >= FIRST && i <= LAST ? 'is-day' : 'is-off';
      var d = dayOf(i);
      h += '<span class="cn-tl-tick ' + cls + '" data-i="' + i + '" style="left:' + xOf(i) + 'px"></span>';
      h += '<span class="cn-tl-date ' + cls + '" data-i="' + i + '" style="left:' + xOf(i) + 'px">' + d.getUTCDate() + '</span>';
      if (i === 0 || d.getUTCDate() === 1) h += '<span class="cn-tl-month" data-from="' + i + '" style="left:' + (xOf(i) - 8) + 'px">' + MON[d.getUTCMonth()] + ' 2027</span>';
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
    el.datesBtn = document.getElementById('cn-tl-dates-btn');
    el.datesPanel = document.getElementById('cn-tl-dates-panel');
    el.inS = document.getElementById('cn-tl-in-start');
    el.inE = document.getElementById('cn-tl-in-end');
    el.datesCount = document.getElementById('cn-tl-dates-count');
    el.datesErr = document.getElementById('cn-tl-dates-error');
    el.edit = document.getElementById('cn-tl-edit');
    el.editLabel = document.getElementById('cn-tl-edit-label');
    el.editHint = document.getElementById('cn-tl-edit-hint');
    el.keyBtn = document.getElementById('cn-tl-key-btn');
    el.key = document.getElementById('cn-tl-key');
    el.keyBtn.addEventListener('click', function () {
      var open = el.key.hidden;
      el.key.hidden = !open;
      el.keyBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      phone.dispatchEvent(new CustomEvent('cn:view', { detail: phone.dataset.view })); // redraw the annotation badges
    });
    el.foot = document.getElementById('cn-tl-foot');
    el.warn = document.getElementById('cn-tl-warn');
    el.clash = document.getElementById('cn-tl-clash');
    // The same warning in the list view, under the dates line, so the fan sees it whichever view they are in
    el.listWarn = document.createElement('p'); el.listWarn.className = 'cn-warn'; el.listWarn.hidden = true;
    meta.parentNode.insertBefore(el.listWarn, meta.nextSibling);
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
  // Month labels stick to the left edge of the view while their month is on screen, so the dates always have a month
  function placeMonths() {
    var view = el.scroll.scrollLeft + 12, ms = Array.prototype.slice.call(tlPane.querySelectorAll('.cn-tl-month'));
    ms.forEach(function (m, k) {
      var lo = xOf(+m.dataset.from) - 8, next = ms[k + 1], hi = next ? xOf(+next.dataset.from) - 8 - m.offsetWidth - 12 : Infinity;
      m.style.left = Math.max(lo, Math.min(hi, view)) + 'px';
    });
  }
  function placeBracketLabel() {
    placeMonths();
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
    el.A = A;
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
        aria = name + ', ' + longLabel(it.i) + ', ' + f.venue + (f.away ? ', outside NSW' : '') + (f.ticket ? ', you have a ticket' : '');
        top = A - 70 - it.row * ROW;
        h += '<button type="button" class="cn-tl-mk cn-tl-mk--' + kind + (f.away ? ' is-away' : '') + '" data-key="' + f.key + '" data-i="' + it.i + '" style="left:' + x + 'px;top:' + top + 'px" aria-label="' + esc(aria) + '">' + sym(kind) + '</button>';
        // A match outside NSW says where it is first ("In Perth"), so it is not read as one of the fan's NSW days
        if (it.label) h += '<span class="cn-tl-lbl cn-tl-lbl--up' + (f.ticket ? ' is-ticket' : '') + (f.away ? ' is-away' : '') + '" data-i="' + it.i + '" aria-hidden="true" style="left:' + x + 'px;top:' + (top - 2) + 'px">' + (f.away ? '<span class="cn-tl-lbl-city">In ' + esc(f.away) + '</span><span class="cn-tl-lbl-name">' + esc(name) + '</span>' : esc(name)) + '</span>';
      } else {
        var p = it.p;
        aria = p.name + ', ' + longLabel(it.i) + ', your place';
        top = A + 64 + it.row * ROW;
        h += '<button type="button" class="cn-tl-mk cn-tl-mk--place" data-key="' + esc(p.key) + '" data-stop="' + esc(p.id) + '" data-i="' + it.i + '" data-row="' + it.row + '" style="left:' + x + 'px;top:' + top + 'px" aria-label="' + esc(aria + (editing ? '. Arrow keys move it' : '')) + '">' + sym('place') + '</button>';
        if (it.label) h += '<span class="cn-tl-lbl cn-tl-lbl--down" data-i="' + it.i + '" data-for="' + esc(p.key) + '" aria-hidden="true" style="left:' + x + 'px;top:' + (top + 44) + 'px">' + esc(p.name) + '</span>';
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
  // The dates and the teams open as lists over the chart, one at a time. A tap outside, Escape, or moving focus
  // away closes them.
  var POPS = [];
  function openPop(pop, open, focusBack) {
    if (open) POPS.forEach(function (o) { if (o !== pop) openPop(o, false); });
    pop.panel.hidden = !open;
    pop.btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var c = pop.first(); c.focus({ preventScroll: true }); if (c.scrollIntoView) c.scrollIntoView({ block: 'nearest' }); }
    else if (focusBack) pop.btn.focus({ preventScroll: true });
  }
  function openTeams(open, focusBack) { openPop(POPS[1], open, focusBack); }
  function closePops() { POPS.forEach(function (o) { if (!o.panel.hidden) openPop(o, false); }); }
  function bindTeams() {
    POPS.push({ btn: el.datesBtn, panel: el.datesPanel, first: function () { return el.inS; } });
    POPS.push({ btn: el.teamsBtn, panel: el.teamsPanel, first: function () { return el.teamsPanel.querySelector('input:checked') || el.teamsPanel.querySelector('input'); } });
    POPS.forEach(function (o) {
      o.btn.addEventListener('click', function () { openPop(o, o.panel.hidden, false); });
      o.panel.addEventListener('focusout', function (e) {
        if (!o.panel.hidden && e.relatedTarget && !o.panel.contains(e.relatedTarget) && e.relatedTarget !== o.btn) openPop(o, false);
      });
    });
    document.getElementById('cn-tl-empty-btn').addEventListener('click', function () { openTeams(true); });
    el.teamsPanel.addEventListener('change', function (e) {
      var c = e.target; if (!c.matches('input')) return;
      var t = c.value, list = state.teams.filter(function (x) { return x !== t; });
      if (c.checked) list.push(t);
      list.sort();
      setTeams(list, c.checked ? 'Added ' + t + '.' : 'Removed ' + t + '.');
    });
    document.getElementById('cn-tl-clear').addEventListener('click', function () { setTeams([], 'All teams removed.'); });
    document.addEventListener('pointerdown', function (e) {
      POPS.forEach(function (o) { if (!o.panel.hidden && !o.panel.contains(e.target) && !o.btn.contains(e.target)) openPop(o, false); });
    });
    tlPane.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      POPS.forEach(function (o) { if (!o.panel.hidden) { e.stopPropagation(); openPop(o, false, true); } });
    });
    // Typed dates: a date the browser accepts as complete fires change. Outside the timeline it is refused with a
    // message; a first day after the last day moves the last day with it, and the other way round.
    function typed(which) {
      var inp = which === 'start' ? el.inS : el.inE, i = fromIso(inp.value);
      if (i === null || i < 0 || i > DAYS - 1) {
        el.datesErr.textContent = 'Enter a date from ' + shortLabel(0) + ' to ' + shortLabel(DAYS - 1) + ' 2027.';
        el.datesErr.hidden = false; inp.setAttribute('aria-invalid', 'true');
        return;
      }
      el.datesErr.hidden = true; el.inS.removeAttribute('aria-invalid'); el.inE.removeAttribute('aria-invalid');
      if (which === 'start') { range.start = i; if (range.end < i) range.end = i; }
      else { range.end = i; if (range.start > i) range.start = i; }
      updateRange();
    }
    el.inS.addEventListener('change', function () { typed('start'); });
    el.inE.addEventListener('change', function () { typed('end'); });
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
    el.datesCount.textContent = plural(e - s + 1, 'day', 'days');
    if (document.activeElement !== el.inS) el.inS.value = iso(s);
    if (document.activeElement !== el.inE) el.inE.value = iso(e);
    applyOut();
    // "13 days before your first match in NSW": the range is days in NSW, so matches elsewhere (Perth) do not count
    var first = FIX.filter(function (f) { return onTrip(f) && !f.away && f.i >= s && f.i <= e; }).sort(function (x, y) { return x.i - y.i; })[0];
    el.foot.textContent = plural(e - s + 1, 'day', 'days') + ' in NSW. ' + (!first ? (state.teams.length ? 'None of your matches in NSW fall in these days.' : 'Choose your teams to see how long it is before your first match.') : first.i === s ? 'Your first match in NSW is on your first day.' : plural(first.i - s, 'day', 'days') + ' before your first match in NSW.');
    meta.textContent = shortLabel(s) + ' to ' + shortLabel(e) + ' · ' + plural(itemCount(), 'item', 'items');
    // A match outside NSW inside the days in NSW: the fan cannot be in both places, so say so in both views,
    // hatch that day on the chart, and hand the matches to the copies (the AI prompt, Group chat, Spreadsheet)
    var away = FIX.filter(function (f) { return onTrip(f) && f.away && f.i >= s && f.i <= e; }).sort(function (x, y) { return x.i - y.i; });
    el.clash.innerHTML = away.map(function (f) { return '<span class="cn-tl-clash" data-i="' + f.i + '" style="left:' + (xOf(f.i) - COL / 2) + 'px;width:' + COL + 'px"></span>'; }).join('');
    var msg = away.length ? away.map(function (f) { return matchName(f) + ' is in ' + f.away + ' on ' + longLabel(f.i) + '.'; }).join(' ') +
      (away.length === 1 ? ' That day is inside your days in NSW. Change your dates, or plan to be away from NSW that day.' : ' Those days are inside your days in NSW. Change your dates, or plan to be away from NSW on them.') : '';
    [el.warn, el.listWarn].forEach(function (w) { if (w.textContent !== msg) w.textContent = msg; w.hidden = !msg; });
    if (msg && msg !== lastWarn && !loading) say(msg);
    lastWarn = msg;
    if (window.cnTripSetup) {
      window.cnTripSetup.arrive = longLabel(s); window.cnTripSetup.leave = longLabel(e);
      window.cnTripSetup.away = away.map(function (f) { return { match: matchName(f), day: longLabel(f.i), city: f.away, venue: f.venue, kick: kickTime(f) }; });
    }
    save();
  }
  var lastWarn = '';

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
      el.done.textContent = 'Dates set';
      el.done.classList.add('is-saved');
      say('Dates set: ' + el.range.textContent + ', ' + plural(range.end - range.start + 1, 'day', 'days') + ' in NSW.');
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
      when = longLabel(f.i) + ' 2027, ' + (f.kick ? 'kick-off ' + kickTime(f) : 'kick-off time to be confirmed');
      ticket = f.ticket;
      return { r: r, match: true, when: when, ticket: ticket };
    }
    var p = places(), all = p.dated.concat(p.unplanned);
    var pl = all.filter(function (x) { return x.key === key; })[0];
    if (!pl) return null;
    r = PRODUCTS[pl.id] || { title: pl.name };
    plan = pl.i == null ? 'Not yet planned' : 'In your plan for ' + longLabel(pl.i);
    return { r: r, match: false, plan: plan, id: pl.id };
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
    // A place can leave the plan; a match cannot (it is fixed to its day), and its page says so
    if (rec.match) h += '<p class="cn-pp-none cn-pp-fixed">' + sym('ticket').replace('cn-tl-sym--ticket', 'cn-tl-sym--fixed') + 'Matches are fixed to their day, so they cannot be moved or removed.</p>';
    if (!rec.match) h += '<div class="plan-modal-actions"><button type="button" class="cn-pill cn-pill--outline cn-pill--sm cn-pp-remove" data-remove="' + esc(rec.id) + '">Remove from plan</button></div>';
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
  // The list rows open the same product page as the timeline markers
  function rowKey(li) {
    var name = li.querySelector('.cn-item-name').textContent.trim();
    if (/ v /.test(name)) { var f = FIX.filter(function (x) { return matchName(x) === name; })[0]; return f ? f.key : null; }
    return 'p:' + li.dataset.stop;
  }
  function bindRows() {
    Array.prototype.forEach.call(listPane.querySelectorAll('.cn-item-text'), function (t) {
      var name = t.querySelector('.cn-item-name').textContent.trim();
      t.setAttribute('role', 'button'); t.setAttribute('tabindex', '0'); t.setAttribute('aria-label', name + ', details');
    });
    function open(t) { var li = t.closest('.cn-item'), k = li && rowKey(li); if (k) openModal(k, t); }
    listPane.addEventListener('click', function (e) { var t = e.target.closest('.cn-item-text'); if (t && !phone.classList.contains('is-sorting')) open(t); });
    listPane.addEventListener('keydown', function (e) {
      var t = e.target.closest && e.target.closest('.cn-item-text');
      if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(t); }
    });
  }

  /* ---------- Remove from plan, with Undo ----------
     The place leaves the list (and so the timeline, the counts and every export). An Undo toast puts it back where
     it was for 6 seconds; if its day has gone meanwhile, it comes back into Not yet planned. */
  var undo = null, undoEl;
  function undoToast() {
    if (undoEl) return undoEl;
    undoEl = document.createElement('div');
    undoEl.className = 'cn-toast cn-undo'; undoEl.hidden = true;
    undoEl.innerHTML = '<span class="cn-undo-text" role="status"></span><button type="button" class="cn-undo-btn">Undo</button>';
    phone.appendChild(undoEl);
    undoEl.querySelector('.cn-undo-btn').addEventListener('click', restore);
    return undoEl;
  }
  function hideUndo() { if (undo) clearTimeout(undo.timer); undo = null; if (undoEl) undoEl.hidden = true; }
  function removePlace(id) {
    var li = listPane.querySelector('.cn-item[data-stop="' + id + '"]');
    if (!li) return;
    hideUndo();
    var name = nameOf(li), home = { ul: li.parentNode, next: li.nextElementSibling };
    vanish(li); // fades where it was while the rows below close the gap
    flip(function () { li.remove(); refreshEmpty(); }, null);
    phone.dispatchEvent(new CustomEvent('cn:reorder'));
    var t = undoToast();
    t.querySelector('.cn-undo-text').textContent = 'Removed ' + name + '.';
    t.hidden = false;
    undo = { li: li, home: home, timer: setTimeout(hideUndo, 6000) };
    if (removed.indexOf(id) < 0) removed.push(id);
    save();
    t.querySelector('.cn-undo-btn').focus({ preventScroll: true });
  }
  function restore() {
    if (!undo) return;
    var u = undo; hideUndo();
    var ul = u.home.ul.isConnected ? u.home.ul : lists()[lists().length - 1];
    flip(function () { ul.insertBefore(u.li, u.home.next && u.home.next.parentNode === ul ? u.home.next : null); refreshEmpty(); }, u.li);
    if (!reduce.matches) u.li.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: DUR, easing: EASE });
    landed(u.li);
    removed = removed.filter(function (x) { return x !== u.li.dataset.stop; });
    phone.dispatchEvent(new CustomEvent('cn:reorder'));
    say(nameOf(u.li) + ' is back in ' + dayName(ul) + '.');
    var focusTo = phone.dataset.view === 'timeline' ? tlPane.querySelector('[data-stop="' + u.li.dataset.stop + '"]') : u.li.querySelector('.cn-item-text');
    (focusTo || u.li.querySelector('.cn-item-text')).focus({ preventScroll: true });
  }
  function ppBodyClick() {
    ppBody.addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove]'); if (!b) return;
      closeModal(false);
      removePlace(b.dataset.remove);
    });
  }
  phone.addEventListener('cn:screen', function (e) { if (e.detail !== 'm1') hideUndo(); });

  tlPane.addEventListener('click', function (e) {
    var b = e.target.closest('[data-key]');
    if (!b || !tlPane.contains(b)) return;
    if (editing && b.classList.contains('cn-tl-mk--place')) return; // in edit mode a place is moved, not opened
    openModal(b.dataset.key, b);
  });

  /* ---------- Edit mode: move places on the timeline ----------
     Edit hides the date handles and lets the fan drag a place to another day, or up and down within its day.
     The list is the source of truth, so a move is made in the list and the timeline redraws from it. */
  var editing = false;
  function setEditing(on) {
    editing = on;
    tlPane.classList.toggle('is-editing', on);
    el.edit.setAttribute('aria-pressed', on ? 'true' : 'false');
    el.editLabel.textContent = on ? 'Done editing' : 'Edit';
    el.editHint.hidden = !on;
    closePops();
    renderMarkers();
    say(on ? 'Editing. Drag a place to another day, or use the arrow keys on a place. The date handles are hidden.' : 'Finished editing.');
    phone.dispatchEvent(new CustomEvent('cn:view', { detail: phone.dataset.view })); // redraw the annotation badges
  }
  // Finds the list's heading for a day, adding the day in date order if the fan has nothing on it yet
  function dayList(i) {
    var label = longLabel(i), heads = Array.prototype.slice.call(listPane.querySelectorAll('.cn-day')), after = null;
    for (var k = 0; k < heads.length; k++) {
      var t = heads[k].textContent.trim(), m = /^[A-Z][a-z]{2} (\d+) ([A-Z][a-z]{2})$/.exec(t);
      if (t === label) { var ul = heads[k].nextElementSibling; while (ul && ul.tagName !== 'UL') ul = ul.nextElementSibling; return ul; }
      if (!m || idx(m[2], +m[1]) > i) { after = heads[k]; break; }
    }
    var h = document.createElement('h3'); h.className = 'cn-day'; h.textContent = label;
    var list = document.createElement('ul'); list.className = 'cn-items';
    listPane.insertBefore(h, after); listPane.insertBefore(list, after);
    return list;
  }
  function placeItems(ul, skip) { return itemsOf(ul, skip).filter(function (li) { return !/ v /.test(nameOf(li)); }); }
  // Moves a place to day i, as the row-th place of that day, then animates every marker from where it was
  function movePlace(id, i, row) {
    var li = listPane.querySelector('.cn-item[data-stop="' + id + '"]');
    if (!li) return;
    i = Math.max(0, Math.min(DAYS - 1, i));
    var ul = dayList(i), sibs = placeItems(ul, li);
    row = Math.max(0, Math.min(sibs.length, row));
    var before = {};
    Array.prototype.forEach.call(el.markers.querySelectorAll('.cn-tl-mk'), function (b) { before[b.dataset.key] = b.getBoundingClientRect(); });
    ul.insertBefore(li, sibs[row] || null);
    refreshEmpty();
    phone.dispatchEvent(new CustomEvent('cn:reorder')); // redraws the timeline and the counts
    if (!reduce.matches) Array.prototype.forEach.call(el.markers.querySelectorAll('.cn-tl-mk'), function (b) {
      var a = before[b.dataset.key], n = b.getBoundingClientRect();
      if (a && (a.left !== n.left || a.top !== n.top)) b.animate([{ transform: 'translate(' + (a.left - n.left) + 'px,' + (a.top - n.top) + 'px)' }, { transform: 'none' }], { duration: 220, easing: EASE });
    });
    var mk = el.markers.querySelector('[data-stop="' + id + '"]');
    if (mk) mk.focus({ preventScroll: true });
    var n = placeItems(ul).indexOf(li) + 1, of = placeItems(ul).length;
    say(nameOf(li) + ' moved to ' + longLabel(i) + ', place ' + n + ' of ' + of + '.');
  }
  function bindEdit() {
    el.edit.addEventListener('click', function () { setEditing(!editing); });
    var mv = null;
    el.markers.addEventListener('pointerdown', function (e) {
      var b = editing && e.target.closest('.cn-tl-mk--place');
      if (!b || e.button > 0 || mv) return;
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      b.focus({ preventScroll: true });
      mv = { b: b, id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, s0: el.scroll.scrollLeft, left: parseFloat(b.style.left), top: parseFloat(b.style.top), raf: 0, ghost: document.createElement('span') };
      mv.ghost.className = 'cn-tl-drop';
      el.markers.appendChild(mv.ghost);
      b.classList.add('is-dragging');
      mv.label = el.markers.querySelector('.cn-tl-lbl[data-for="' + b.dataset.key + '"]');
      if (mv.label) mv.label.hidden = true; // the label stays behind while the place moves
      update();
      (function loop() { // keep scrolling while the pointer rests near an edge
        if (!mv) return;
        var r = el.scroll.getBoundingClientRect(), near = 40, dx = 0;
        if (mv.x < r.left + near) dx = -Math.ceil((r.left + near - mv.x) / near * 12);
        else if (mv.x > r.right - near) dx = Math.ceil((mv.x - (r.right - near)) / near * 12);
        if (dx) { el.scroll.scrollLeft += dx; update(); }
        mv.raf = requestAnimationFrame(loop);
      })();
    });
    function target() {
      var x = mv.left + (mv.x - mv.x0) + (el.scroll.scrollLeft - mv.s0), y = mv.top + (mv.y - mv.y0);
      return { dx: x - mv.left, dy: y - mv.top, i: Math.max(0, Math.min(DAYS - 1, Math.round((x - PAD) / COL))), row: Math.max(0, Math.round((y - (el.A + 64)) / ROW)) };
    }
    function update() {
      var t = target(), cap = el.markers.querySelectorAll('.cn-tl-mk--place[data-i="' + t.i + '"]:not(.is-dragging)').length;
      t.row = Math.min(t.row, cap);
      mv.b.style.transform = 'translate(' + t.dx + 'px,' + t.dy + 'px) scale(1.1)';
      mv.ghost.style.left = xOf(t.i) + 'px';
      mv.ghost.style.top = (el.A + 64 + t.row * ROW) + 'px';
    }
    el.markers.addEventListener('pointermove', function (e) { if (mv && e.pointerId === mv.id) { mv.x = e.clientX; mv.y = e.clientY; update(); } });
    function end(e, commit) {
      if (!mv || e.pointerId !== mv.id) return;
      var m = mv, t = target(); mv = null;
      cancelAnimationFrame(m.raf); m.ghost.remove(); m.b.classList.remove('is-dragging');
      var moved = Math.abs(m.x - m.x0) + Math.abs(m.y - m.y0) > 4;
      if (m.label) m.label.hidden = false;
      if (!commit || !moved) { m.b.style.transform = ''; if (commit === false) say('Move cancelled.'); return; }
      movePlace(m.b.dataset.stop, t.i, t.row);
    }
    el.markers.addEventListener('pointerup', function (e) { end(e, true); });
    el.markers.addEventListener('pointercancel', function (e) { end(e, false); });
    // Keyboard: left and right move a day, up and down change the order within the day
    el.markers.addEventListener('keydown', function (e) {
      var b = editing && e.target.closest('.cn-tl-mk--place');
      if (!b) return;
      var i = +b.dataset.i, row = +b.dataset.row;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); movePlace(b.dataset.stop, i + (e.key === 'ArrowLeft' ? -1 : 1), row); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        var count = el.markers.querySelectorAll('.cn-tl-mk--place[data-i="' + i + '"]').length, to = row + (e.key === 'ArrowUp' ? -1 : 1);
        if (to < 0 || to >= count) { say(to < 0 ? 'Already first on this day.' : 'Already last on this day.'); return; }
        movePlace(b.dataset.stop, i, to);
      }
    });
  }

  /* ---------- Toggle ---------- */
  // Each view keeps its own scroll position. The first time the timeline opens it scrolls to the fan's first day
  // in NSW, or to their next match once the trip has started.
  var memo = { list: 0, timeline: null };
  // First open: lead with the fan's own trip, not the empty days before it. Once the trip has started, the next match
  // leads; before that, the first planned item in their NSW days (a place with a day, or a match in NSW), so the
  // days that follow it are in view too. With nothing planned it falls back to the first day in NSW.
  function startScroll() {
    var t = todayIdx(), lead = null, s = range.start, e = range.end;
    if (t >= s && t <= e) {
      var next = FIX.filter(function (f) { return onTrip(f) && f.i >= t; }).sort(function (a, b) { return a.i - b.i; })[0];
      if (next) lead = next.i;
    }
    if (lead === null) {
      var days = places().dated.map(function (p) { return p.i; })
        .concat(FIX.filter(function (f) { return onTrip(f) && !f.away; }).map(function (f) { return f.i; }))
        .filter(function (i) { return i >= s && i <= e; });
      if (days.length) lead = Math.min.apply(null, days);
    }
    // The lead sits about a quarter in from the left; with no lead, the first day's handle and its date tag show
    var target = lead === null ? xOf(s) - COL / 2 - 56 : xOf(lead) - Math.round(el.scroll.clientWidth / 4);
    return Math.max(0, Math.min(target, el.scroll.scrollWidth - el.scroll.clientWidth));
  }
  function setView(v) {
    var cur = phone.dataset.view || 'list', tl = v === 'timeline';
    if (cur === v) return;
    if (cur === 'timeline') memo.timeline = { left: el.scroll.scrollLeft, top: body.scrollTop }; else memo.list = body.scrollTop;
    if (!tl) closePops();
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
  function refreshEmpty(skip) {
    lists().forEach(function (ul) {
      var empty = itemsOf(ul, skip).length === 0 && !(skip && skip.parentNode === ul); // the slot being dragged counts
      ul.classList.toggle('is-empty', empty);
      if (skip) return; // mid-drag: leave the Remove this day buttons alone
      // An empty day (not Not yet planned) can be taken out of the plan
      var btn = ul.nextElementSibling && ul.nextElementSibling.classList.contains('cn-day-remove') ? ul.nextElementSibling : null;
      var dated = /^[A-Z][a-z]{2} \d+ [A-Z][a-z]{2}$/.test(dayName(ul));
      if (empty && dated && !btn) {
        btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cn-day-remove';
        btn.textContent = 'Remove this day'; btn.setAttribute('aria-label', 'Remove ' + dayName(ul) + ' from your plan');
        ul.parentNode.insertBefore(btn, ul.nextSibling);
      } else if (btn && !(empty && dated)) btn.remove();
    });
  }
  listPane.addEventListener('click', function (e) {
    var b = e.target.closest('.cn-day-remove'); if (!b) return;
    var ul = b.previousElementSibling, h = headOf(ul), label = dayName(ul), next = b.nextElementSibling;
    [h, ul].forEach(vanish);
    flip(function () { h.remove(); ul.remove(); b.remove(); }, null);
    say('Removed ' + label + ' from your plan.');
    phone.dispatchEvent(new CustomEvent('cn:reorder'));
    if (next) { next.setAttribute('tabindex', '-1'); next.focus({ preventScroll: true }); }
  });
  function nameOf(li) { return li.querySelector('.cn-item-name').textContent.trim(); }

  /* ---------- List motion ----------
     One idea carries every change to the list: nothing jumps. Rows that move slide from where they were to where
     they are now (FLIP), the day headings, hints and empty slots with them, so the list never tears. A slide that is
     still running when the next change comes is taken over from wherever it has got to, so fast drags stay smooth.
     Positions for decisions (where a drop lands) are read from layout, never from a row that is mid-slide. */
  var DUR = 220, running = [];
  // Every block that can move: the pane's own rows (meta, warning, headings, hints, lists, Remove this day) and the items
  function movers() {
    var top = Array.prototype.filter.call(listPane.children, function (c) { return !c.hidden; });
    return { top: top, items: Array.prototype.slice.call(listPane.querySelectorAll('.cn-item')) };
  }
  function flip(change, skip) {
    var m = movers(), seen = [];
    var before = new Map();
    m.top.concat(m.items).forEach(function (x) { if (x !== skip) before.set(x, x.getBoundingClientRect().top); });
    running.forEach(function (a) { a.cancel(); }); running = [];
    change();
    if (reduce.matches || listPane.hidden) return;
    var after = movers(), shift = new Map();
    after.top.forEach(function (x) {
      if (!before.has(x)) return;
      var dy = before.get(x) - x.getBoundingClientRect().top;
      shift.set(x, dy);
      if (Math.abs(dy) > .5) seen.push(x.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: DUR, easing: EASE }));
    });
    after.items.forEach(function (x) {
      if (x === skip || !before.has(x)) return;
      // An item rides on its list's slide, so it only animates the difference
      var dy = before.get(x) - x.getBoundingClientRect().top - (shift.get(x.parentNode) || 0);
      if (Math.abs(dy) > .5) seen.push(x.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: DUR, easing: EASE }));
    });
    running = seen;
    seen.forEach(function (a) { a.onfinish = function () { running = running.filter(function (r) { return r !== a; }); }; });
  }
  // Where a block sits in the layout, ignoring any slide in progress (offsetTop does not see transforms)
  function layoutTop(x) { var t = 0; for (var n = x; n && n !== listPane.offsetParent; n = n.offsetParent) t += n.offsetTop; return t; }
  function paneTop(x) { return layoutTop(x) - layoutTop(listPane) + listPane.getBoundingClientRect().top; }
  // A short wash of state blue where a place has landed, so the eye finds it after a move. Colour only, so it stays
  // with reduced motion.
  function landed(li) {
    li.animate([{ borderColor: '#2666d9', boxShadow: '0 0 0 1px #2666d9', backgroundColor: '#f2f6fd' }, { borderColor: '#dbdbdb', boxShadow: '0 0 0 0 rgba(38,102,217,0)', backgroundColor: '#fff' }], { duration: 900, easing: 'ease-out' });
  }
  // A copy of a row, laid over it in the phone, to lift during a drag or to fade out on remove
  function ghostOf(x) {
    var r = x.getBoundingClientRect(), pr = phone.getBoundingClientRect(), g = x.cloneNode(true);
    g.classList.add('cn-ghost'); g.setAttribute('aria-hidden', 'true'); g.inert = true;
    g.style.left = (r.left - pr.left) + 'px'; g.style.top = (r.top - pr.top) + 'px'; g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    phone.appendChild(g);
    return g;
  }
  function vanish(x) {
    if (reduce.matches || !x.offsetParent) return; // nothing to see when the list is hidden behind the timeline
    var g = ghostOf(x);
    g.classList.add('is-leaving');
    g.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 140, easing: 'cubic-bezier(.4, 0, 1, 1)' }).onfinish = function () { g.remove(); };
  }
  function position(li) { var ul = li.parentNode, all = itemsOf(ul); return { day: dayName(ul), n: all.indexOf(li) + 1, of: all.length }; }
  function announceDrop(li) { var p = position(li); say(nameOf(li) + ' is now in ' + p.day + ', position ' + p.n + ' of ' + p.of + '.'); phone.dispatchEvent(new CustomEvent('cn:reorder')); }

  /* ---------- Drag to reorder ----------
     The row stays in the list as a dashed slot that shows where it will land; a lifted copy follows the pointer.
     The two never fight over a transform, so the copy stays exactly under the finger while the list makes room. */
  var drag = null;
  function placeGhost() {
    var d = drag, pr = phone.getBoundingClientRect();
    d.ghost.style.top = (d.y - d.dy - pr.top) + 'px';
  }
  function updateDrag() {
    var d = drag, li = d.li, ls = lists();
    placeGhost();
    var center = d.y - d.dy + d.h / 2, target = ls[0];
    // The day is the last heading above the pointer
    ls.forEach(function (ul) { var h = headOf(ul); if (h && d.y >= paneTop(h) - 2) target = ul; });
    var sibs = itemsOf(target, li), n = 0;
    sibs.forEach(function (s) { if (paneTop(s) + s.offsetHeight / 2 < center) n++; });
    var ref = sibs[n] || null;
    if (li.parentNode !== target || li.nextElementSibling !== ref) {
      flip(function () { target.insertBefore(li, ref); refreshEmpty(li); }, null);
      // Moving the row takes its handle out of the document for a moment, which drops pointer capture: take it back
      try { if (!d.hd.hasPointerCapture(d.id)) d.hd.setPointerCapture(d.id); } catch (e) { /* the pointer has gone; the document listeners still end the drag */ }
    }
    ls.forEach(function (ul) { ul.classList.toggle('is-over', ul === target); });
  }
  listPane.addEventListener('pointerdown', function (e) {
    var hd = e.target.closest('.cn-handle');
    if (!hd || e.button > 0 || drag) return;
    e.preventDefault();
    var li = hd.closest('.cn-item'), r = li.getBoundingClientRect();
    var ghost = ghostOf(li);
    drag = { li: li, hd: hd, ghost: ghost, id: e.pointerId, dy: e.clientY - r.top, h: r.height, y: e.clientY, home: { ul: li.parentNode, next: li.nextElementSibling }, raf: 0 };
    hd.setPointerCapture(e.pointerId);
    li.classList.add('is-slot');
    phone.classList.add('is-sorting');
    hd.focus({ preventScroll: true });
    say('Picked up ' + nameOf(li) + '.');
    if (!reduce.matches) ghost.animate([{ transform: 'none', boxShadow: '0 1px 2px rgba(0,0,0,.08)' }, { transform: 'scale(1.03)', boxShadow: '0 12px 28px rgba(0,0,0,.18)' }], { duration: 150, easing: EASE, fill: 'forwards' });
    else ghost.style.boxShadow = '0 12px 28px rgba(0,0,0,.18)';
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
  // Move and release are heard on the whole document, so a drag that leaves the list (over the footer, off the phone)
  // still follows the pointer and still ends where it is let go
  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    drag.y = e.clientY;
    updateDrag();
  });
  function finish(commit) {
    var d = drag; if (!d) return;
    drag = null;
    cancelAnimationFrame(d.raf);
    var li = d.li, g = d.ghost;
    if (!commit) flip(function () { d.home.ul.insertBefore(li, d.home.next); refreshEmpty(); }, null);
    lists().forEach(function (ul) { ul.classList.remove('is-over'); });
    function done() {
      g.remove();
      phone.classList.remove('is-sorting');
      // Remove this day can appear or go now, so that change slides too
      flip(function () { li.classList.remove('is-slot'); refreshEmpty(); }, null);
      if (commit) landed(li);
    }
    if (reduce.matches) done();
    else {
      // The copy settles into the slot: it lands where the list has finished moving to, not where the slot is mid-slide
      var pr = phone.getBoundingClientRect(), to = paneTop(li) - pr.top, from = parseFloat(g.style.top);
      var a = g.animate([{ transform: 'translateY(0) scale(1.03)', boxShadow: '0 12px 28px rgba(0,0,0,.18)' }, { transform: 'translateY(' + (to - from) + 'px) scale(1)', boxShadow: '0 1px 2px rgba(0,0,0,0)' }], { duration: DUR, easing: EASE, fill: 'forwards' });
      a.onfinish = a.oncancel = done;
    }
    if (commit) announceDrop(li); else say('Move cancelled.');
  }
  document.addEventListener('pointerup', function (e) { if (drag && e.pointerId === drag.id) finish(true); });
  document.addEventListener('pointercancel', function (e) { if (drag && e.pointerId === drag.id) finish(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drag) { e.stopPropagation(); finish(false); } }, true);

  // Keyboard: Space or Enter picks up, arrow keys move, Space or Enter drops, Escape puts it back
  var held = null;
  function release(commit, hd) {
    if (!held) return;
    var h = held; held = null;
    h.li.classList.remove('is-grabbed');
    h.hd.setAttribute('aria-pressed', 'false');
    if (!commit) { flip(function () { h.home.ul.insertBefore(h.li, h.home.next); refreshEmpty(); }, null); h.hd.focus(); say('Move cancelled.'); }
    else { announceDrop(h.li); landed(h.li); }
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

  /* ---------- Saved in this browser ----------
     One record: the list's days in order with their stops, the places the fan removed, the dates and the teams.
     Storage can be missing or blocked (private windows, previews), so every read and write is wrapped and the
     page works the same without it. Anything odd in a saved record is ignored, never half-applied. */
  var STORE = 'cn-plan-v1', removed = [], loading = true;
  function save() {
    if (loading) return;
    var days = Array.prototype.map.call(listPane.querySelectorAll('.cn-day'), function (h) {
      var ul = h.nextElementSibling; while (ul && ul.tagName !== 'UL') ul = ul.nextElementSibling;
      return { label: h.textContent.trim(), stops: Array.prototype.map.call(ul ? ul.querySelectorAll('.cn-item') : [], function (li) { return li.dataset.stop; }) };
    });
    try { localStorage.setItem(STORE, JSON.stringify({ v: 1, days: days, removed: removed, start: range.start, end: range.end, teams: state.teams })); } catch (e) { /* not saved: the page still works */ }
  }
  function load() {
    var rec;
    try {
      if (/[?&]reset\b/.test(location.search)) { localStorage.removeItem(STORE); return; }
      rec = JSON.parse(localStorage.getItem(STORE) || 'null');
    } catch (e) { return; }
    if (!rec || rec.v !== 1 || !Array.isArray(rec.days)) return;
    var dateRe = /^([A-Z][a-z]{2}) (\d+) ([A-Z][a-z]{2})$/, labels = {};
    // Places the fan removed come out first
    (Array.isArray(rec.removed) ? rec.removed : []).forEach(function (id) {
      var li = listPane.querySelector('.cn-item[data-stop="' + String(id).replace(/"/g, '') + '"]');
      if (li && !/ v /.test(nameOf(li))) { li.remove(); removed.push(li.dataset.stop); }
    });
    // Then each saved day, in the saved order of its stops. A stop the page no longer has is skipped.
    rec.days.forEach(function (d) {
      if (!d || typeof d.label !== 'string' || !Array.isArray(d.stops)) return;
      var m = dateRe.exec(d.label), ul;
      if (d.label === 'Not yet planned') ul = lists()[lists().length - 1];
      else if (m && idx(m[3], +m[2]) >= 0 && idx(m[3], +m[2]) < DAYS) ul = dayList(idx(m[3], +m[2]));
      else return;
      labels[d.label] = true;
      d.stops.forEach(function (id) {
        var li = listPane.querySelector('.cn-item[data-stop="' + String(id).replace(/"/g, '') + '"]');
        // A match never changes day, but it takes its saved place in the order of its own day
        if (li && (!/ v /.test(nameOf(li)) || li.parentNode === ul)) ul.appendChild(li);
      });
    });
    // A dated day the fan took out of the plan, and that is now empty, goes
    Array.prototype.slice.call(listPane.querySelectorAll('.cn-day')).forEach(function (h) {
      var t = h.textContent.trim(), ul = h.nextElementSibling; while (ul && ul.tagName !== 'UL') ul = ul.nextElementSibling;
      if (dateRe.test(t) && !labels[t] && ul && !ul.querySelector('.cn-item')) { ul.remove(); h.remove(); }
    });
    var a = +rec.start, b = +rec.end;
    if (a >= 0 && b < DAYS && a <= b && a === Math.floor(a) && b === Math.floor(b)) { range.start = a; range.end = b; }
    if (Array.isArray(rec.teams)) state.teams = rec.teams.filter(function (t) { return ALL_TEAMS.indexOf(t) > -1; }).sort();
  }

  load();
  buildTimeline();
  buildModal();
  bindEdit();
  bindRows();
  ppBodyClick();
  bindRange();
  bindTeams();
  syncTeams();
  phone.addEventListener('cn:reorder', function () { renderMarkers(); updateRange(); });
  refreshEmpty();
  loading = false;
  save();
})();
