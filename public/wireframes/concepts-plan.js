/* Your plan, day by day (16 Nov). In testing, nobody could read their own plan off the old plan: added things were
   small unlabelled squares on a strip of the whole tournament ("So where's my stuff?", "It's a chart, not a plan", "I
   plan by times"). This draws, inside the Your plan sheet:
   - a strip of your days as an index: one 36px button a day (your days, or your teams' match days with no dates), its
     day number, a match marker and a filled or empty dot. Tapping one goes to that day's card;
   - one card per day: the date and the kind of day (Arrival day, Match day, Last day, Free day, the page's words), the
     match with its kick-off in Sydney time, its stadium and your ticket, then everything added that day with its
     picture, name, type and time where the data has one, each with Move (the item sheet's "Move it to" days, here on
     the card) and Remove. Screenings only Remove: a screening is for one match. Days with nothing added get Add
     ideas (the ideas sheet the + used to open); a run of two or more empty days is one card until it is opened up.
   Two layouts of the same cards, for the next test round: ?plan=cards (the default) stacks them and the sheet scrolls,
   with the strip stuck under the sheet's header; ?plan=swipe shows one card at a time, swiped sideways with snapping,
   with Previous day, Next day and "Day 3 of 8". The tools panel switches between them.
   Nothing here invents data: times are a product's indicative opening hours that day, or the kick-off a screening
   shows; ideas, places saved from the map and trips have none, so none is shown. Pictures are the stand-ins
   pv-device.js paints by name (grey in the wireframe). */
(function () {
  var TBC = (window.TP_WORDS || {}).timeTbc || 'Time to be confirmed', TBC_L = TBC.charAt(0).toLowerCase() + TBC.slice(1); // A2 (21 Nov): concepts-words.js
  var root = document.getElementById('tp-dc'), tp = window.tpPicker;
  if (!root || !tp) return;
  var html = document.documentElement, state = tp.state, esc = tp.esc;
  var panel = document.getElementById('tp-tl-panel'), head = panel && panel.querySelector('.tp-tl-head');
  var foot = document.getElementById('tp-tl-foot');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Oct', 'Nov'];
  var expanded = {}, moving = null, current = null, flashIds = [];
  function swipe() { return html.getAttribute('data-plan') === 'swipe'; }
  function dateOf(d) { return new Date(Date.UTC(2027, 9, 1 + d)); }
  function dayLabel(d) { var x = dateOf(d); return WD[x.getUTCDay()] + ' ' + x.getUTCDate() + ' ' + MON[x.getUTCMonth() - 9]; }
  function spanLabel(a, z) {
    var x = dateOf(a), y = dateOf(z);
    return x.getUTCMonth() === y.getUTCMonth() ? WD[x.getUTCDay()] + ' ' + x.getUTCDate() + ' to ' + dayLabel(z) : dayLabel(a) + ' to ' + dayLabel(z);
  }
  function hasTicket(m) { return !!m.tkey && state.tickets.indexOf(m.tkey) > -1; }
  function mName(f) { return f.t || f.s + ', teams to be decided'; }
  function flags(f) { var t = f.t ? f.t.split(' v ') : []; return t.length === 2 && tp.flag(t[0]) && tp.flag(t[1]) ? '<span class="tp-dc-flags" aria-hidden="true">' + tp.flag(t[0]) + tp.flag(t[1]) + '</span>' : ''; }
  /* Away from NSW (Stage D, F-048): a day whose matches are all interstate names the cities, from the match rows. A day
     with an NSW match, or with only matches to watch, is not away. Never an idea, a button or a free day. */
  function awayCities(day) {
    if (!day.ms.length || day.ms.some(function (m) { return !m.f.a; })) return null;
    var c = []; day.ms.forEach(function (m) { if (c.indexOf(m.f.a) < 0) c.push(m.f.a); });
    return c;
  }
  function itemDay(it) { try { return it.day ? tp.dayOf(it.day) : null; } catch (e) { return null; } }

  /* ---------- The days and what is on them ---------- */
  function model() {
    var trip = state.trip, range = trip && trip.from && trip.to ? { a: tp.isoDay(trip.from), z: tp.isoDay(trip.to) } : null;
    var own = tp.own(), ms = own ? tp.userMatches() : [];
    // Interstate matches the switch shows (Every NSW match), to watch in NSW: on their day's card, not in the plan
    var extra = own ? tp.allMatches().filter(function (m) { return m.vis && !m.on; }) : [];
    var items = state.added.filter(function (it) { return it.kind !== 'match' && !it.unplaced && itemDay(it) !== null; });
    var set = {};
    if (range) for (var d = range.a; d <= range.z; d++) set[d] = true;
    else ms.forEach(function (m) { set[m.day] = true; });
    // Anything added on a day outside your days still gets its day, so nothing goes missing
    items.forEach(function (it) { set[itemDay(it)] = true; });
    var days = Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
    var free = {}; (tp.freeDays ? tp.freeDays() : []).forEach(function (x) { free[x.d] = x; });
    var out = days.map(function (d) {
      var dm = ms.filter(function (m) { return m.day === d; }), dx = range ? extra.filter(function (m) { return m.day === d; }) : [];
      var its = items.filter(function (it) { return itemDay(it) === d; });
      // A longer trip's later days: "Hunter Valley, night 2" (the trip itself sits on its first day)
      var nights = items.filter(function (it) { var s = itemDay(it); return it.kind === 'trip' && it.nights > 0 && d > s && d <= s + it.nights; })
        .map(function (it) { return { it: it, n: d - itemDay(it) + 1 }; });
      var kinds = [];
      if (range && range.a !== range.z && d === range.a) kinds.push('Arrival day');
      if (dm.length) kinds.push('Match day');
      if (range && range.a !== range.z && d === range.z) kinds.push('Last day');
      if (!kinds.length) kinds.push('Free day');
      var fi = free[d];
      return { d: d, ms: dm, extra: dx, its: its, nights: nights, kinds: kinds, ideas: !!(fi && !fi.filled) && !dm.length,
        empty: !dm.length && !dx.length && !its.length && !nights.length };
    });
    return { range: range, own: own, days: out, n: days.length, first: days[0] };
  }
  // The cards in order: single days, and runs of two or more empty days as one card until opened up
  function groups(M) {
    var g = [], i = 0;
    while (i < M.days.length) {
      var day = M.days[i], j = i;
      if (day.empty) while (j + 1 < M.days.length && M.days[j + 1].empty && M.days[j + 1].d === M.days[j].d + 1) j++;
      var key = 'r' + day.d + '-' + M.days[j].d;
      if (j > i && !expanded[key]) g.push({ run: true, key: key, days: M.days.slice(i, j + 1) });
      else for (var k = i; k <= j; k++) g.push({ run: false, key: 'd' + M.days[k].d, days: [M.days[k]], from: j > i ? key : null });
      i = j + 1;
    }
    return g;
  }

  /* ---------- Drawing ---------- */
  var MOVE = '<svg class="tp-ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.5 8h11M10 4.5L13.5 8 10 11.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  /* I have tickets on the plan's match cards (19 Nov), the same button as the team cards' rows: one ticket wherever
     it is marked, the same toast (ticketToggle in concepts-third-half.js). A match to watch only, or with teams to be
     decided, keeps its line of text */
  var I_TIX = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1.6a1.6 1.6 0 0 0 0 2.8V11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9.4a1.6 1.6 0 0 0 0-2.8z"/><path class="tc-tix-tick" d="M5.6 8.1l1.6 1.6 3.2-3.3"/></svg>';
  function matchHtml(m, watchOnly) {
    var f = m.f, where = f.a ? f.v + ', ' + f.a + ' (interstate)' : f.v + ', ' + f.p, tix = !watchOnly && !!m.tkey;
    return '<li class="tp-dc-m' + (f.a ? ' is-away' : '') + (tix ? ' has-tix' : '') + '">' + flags(f) +
      '<div class="tp-dc-m-b"><button type="button" class="tp-dc-name" data-dc-match="' + esc(m.key) + '" aria-haspopup="dialog">' + esc(mName(f)) + '</button>' +
      '<span class="tp-dc-time">' + (f.k ? esc(f.k) + ' Sydney time' : TBC) + '</span>' +
      '<span class="tp-dc-where">' + esc(where) + '</span>' +
      (tix ? '' : '<span class="tp-dc-tk">' + (watchOnly ? 'To watch in NSW, not in your plan' : 'Teams to be decided') + '</span>') + '</div>' +
      (tix ? '<button type="button" class="tc-act tc-tix tp-dc-tix" data-ticket="' + esc(m.tkey) + '" aria-pressed="' + hasTicket(m) + '">' + I_TIX + '<span>I have tickets</span><span class="visually-hidden">: ' + esc(mName(f)) + ', ' + esc(f.d) + '</span></button>' : '') + '</li>';
  }
  function itemHtml(it, day) {
    var time = '', sub = it.kindLabel || 'Added';
    if (it.kind === 'product') time = tp.itemHours ? tp.itemHours(it) : '';
    if (it.kind === 'screening') {
      // A screening shows the match's kick-off; it has no time of its own
      var sm = day.ms.concat(day.extra).filter(function (m) { return it.matchName && it.matchName.indexOf(m.f.t || m.f.s) > -1; })[0];
      if (sm && sm.f.k) time = 'Shows the ' + sm.f.k + ' kick-off';
    }
    if (it.kind === 'trip' && it.nights > 0) time = it.nights + (it.nights === 1 ? ' night' : ' nights') + ', to ' + dayLabel(itemDay(it) + it.nights);
    var cl = tp.tlClash ? tp.tlClash(it.id) : null, clash = '';
    if (cl) {
      var who = cl.filter(function (c) { return !c.closed; }), shut = cl.some(function (c) { return c.closed; });
      clash = '<span class="tp-dc-clash">' + (who.length ? 'Clashes with ' + esc(tp.list(who.map(function (c) { return c.name + ', ' + c.day; }))) + '. ' : '') + (shut ? 'It is closed that day (opening hours). ' : '') + 'Nothing has been moved.</span>';
    }
    var canMove = it.kind !== 'screening', open = moving === it.id, mv = open ? tp.itemMoves(it) : [];
    var h = '<li class="tp-dc-it' + (flashIds.indexOf(it.id) > -1 ? ' is-flash' : '') + '" data-id="' + esc(it.id) + '">' +
      '<span class="ph-img tp-dc-img"' + tp.imgKey(it.title) + ' aria-hidden="true"></span>' +
      '<div class="tp-dc-it-b"><button type="button" class="tp-dc-name" data-dc-open="' + esc(it.id) + '" aria-haspopup="dialog">' + esc(it.title) + '</button>' +
      '<span class="tp-dc-type">' + esc(sub) + '</span>' + (time ? '<span class="tp-dc-time">' + esc(time) + '</span>' : '') + clash +
      '<div class="tp-dc-acts">' +
      (canMove ? '<button type="button" class="tp-dc-act" data-dc-move="' + esc(it.id) + '" aria-expanded="' + open + '">' + MOVE + '<span>Move</span></button>' : '') +
      '<button type="button" class="tp-dc-act" data-dc-remove="' + esc(it.id) + '">' + window.tpIcons.remove + '<span>Remove</span></button></div>';
    if (open) {
      h += mv.length ? '<div class="tp-dc-move" role="group" aria-label="Move ' + esc(it.title) + ' to"><p class="tp-dc-move-h">Move it to</p>' + mv.map(function (m) { return '<button type="button" class="tp-chip" data-dc-to="' + m.day + '" data-dc-id="' + esc(it.id) + '">' + esc(m.label) + '</button>'; }).join('') + '</div>'
        : '<p class="tp-dc-move-none">No other days fit it now. Remove it, or change your days.</p>';
    }
    return h + '</div></li>';
  }
  function dayBody(day) {
    var kick = (day.ms.filter(hasTicket)[0] || day.ms[0] || {}).f;
    kick = kick && kick.k;
    var before = [], after = [], rest = [], screens = [];
    day.its.forEach(function (it) {
      if (it.kind === 'screening') { screens.push(it); return; }
      var s = day.ms.length && tp.itemSlot ? tp.itemSlot(it, kick) : null;
      (s === 'before' ? before : s === 'after' ? after : rest).push(it);
    });
    var li = before.map(function (it) { return itemHtml(it, day); })
      .concat(day.ms.map(function (m) { return matchHtml(m, false); }), day.extra.map(function (m) { return matchHtml(m, true); }))
      .concat(screens.concat(after, rest).map(function (it) { return itemHtml(it, day); }))
      .concat(day.nights.map(function (x) { return '<li class="tp-dc-night"><span class="ph-img tp-dc-img"' + tp.imgKey(x.it.title) + ' aria-hidden="true"></span><div class="tp-dc-it-b"><span class="tp-dc-nm">' + esc(x.it.title) + ', night ' + x.n + '</span><span class="tp-dc-type">' + esc(x.it.kindLabel || 'Longer trip') + '</span></div></li>'; }));
    var h = li.length ? '<ul class="tp-dc-list">' + li.join('') + '</ul>' : '<p class="tp-dc-empty">Nothing added yet.</p>';
    // Not going to the match? (Stage C, F-029): after the day's own list, so it is read before, the match, after, then this
    var nm = day.ms.filter(function (m) { return !m.f.a; }), eve = nm.length && tp.eveningHtml ? tp.eveningHtml(nm.filter(hasTicket)[0] || nm[0]) : '';
    if (eve) h += '<div class="tp-dc-eve">' + eve + '</div>';
    if (day.ideas) h += '<button type="button" class="tp-dc-ideas" data-dc-ideas="' + day.d + '" aria-haspopup="dialog">' + window.tpIcons.add + '<span>Add ideas</span></button>';
    return h;
  }
  function cardHtml(g, idx, total, M) {
    var a = g.days[0].d, z = g.days[g.days.length - 1].d, id = 'tp-dc-' + g.key;
    var title = g.run ? g.days.length + ' free days · ' + spanLabel(a, z) : dayLabel(a) + ' · ' + g.days[0].kinds.join(' · ');
    var h = '<article class="tp-dc-card' + (g.run ? ' is-run' : '') + '" id="' + id + '" data-dc-a="' + a + '" data-dc-z="' + z + '" aria-labelledby="' + id + '-h">' +
      '<h4 class="tp-dc-h" id="' + id + '-h" tabindex="-1">' + esc(title) + '</h4>';
    if (g.run) {
      var fd = g.days.filter(function (x) { return x.ideas; })[0];
      h += '<p class="tp-dc-empty">Nothing added yet.</p><div class="tp-dc-run-acts">' +
        (fd ? '<button type="button" class="tp-dc-ideas" data-dc-ideas="' + fd.d + '" aria-haspopup="dialog">' + window.tpIcons.add + '<span>Add ideas</span></button>' : '') +
        '<button type="button" class="tp-link" data-dc-expand="' + esc(g.key) + '" aria-expanded="false">Show each day</button></div>';
    } else {
      // Matches at the same time, or in several cities (tp.matchClash in concepts-teams.js): one plain line under the heading
      var mc = tp.matchClash ? tp.matchClash(a) : null;
      if (mc) h += '<p class="tp-dc-mclash' + (mc.ring ? '' : ' is-quiet') + '">' + esc(mc.line) + '</p>';
      var aw = awayCities(g.days[0]), W = window.TP_WORDS || {};
      if (aw) h += '<p class="tp-dc-away">' + esc(W.awayLine ? W.awayLine(aw) : 'Away from NSW: ' + aw.join(', ')) + '</p>';
      h += dayBody(g.days[0]);
    }
    return h + '</article>';
  }
  function stripHtml(M) {
    return M.days.map(function (day) {
      var x = dateOf(day.d), nAdd = day.its.length + day.nights.length;
      var mc = tp.matchClash ? tp.matchClash(day.d) : null;
      var aw = awayCities(day), W = window.TP_WORDS || {};
      var match = day.ms[0], label = dayLabel(day.d) + ', ' + day.kinds.join(', ').toLowerCase() + (aw ? ', ' + (W.awaySay ? W.awaySay(aw) : 'away from NSW, ' + aw.join(' and ')) : '') + (mc ? ', ' + mc.say : '') + (match ? ', ' + tp.list(day.ms.map(function (m) { return mName(m.f); })) : '') +
        ', ' + (nAdd ? nAdd + (nAdd === 1 ? ' thing added' : ' things added') : 'nothing added');
      return '<button type="button" class="tp-dc-day' + (match ? ' is-match' : '') + (match && match.f.a ? ' is-away' : '') + (nAdd ? ' is-filled' : '') + (mc && mc.ring ? ' is-clash' : '') + '" data-dc-day="' + day.d + '" aria-label="' + esc(label) + '" tabindex="-1">' +
        '<span class="tp-dc-day-n" aria-hidden="true">' + x.getUTCDate() + '</span><span class="tp-dc-day-m" aria-hidden="true"><i class="tp-dc-ball"></i><i class="tp-dc-dot"></i></span></button>';
    }).join('');
  }

  var G = [], M0 = null;
  function snapshot() {
    var a = document.activeElement, sel = null;
    if (a && root.contains(a)) {
      var attrs = ['dcDay', 'dcOpen', 'dcMatch', 'dcMove', 'dcRemove', 'dcIdeas', 'dcExpand', 'dcTo', 'dcPrev', 'dcNext', 'ticket', 'item'];
      for (var i = 0; i < attrs.length; i++) if (a.dataset[attrs[i]] !== undefined) { sel = '[data-' + attrs[i].replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }) + '="' + CSS.escape(a.dataset[attrs[i]]) + '"]'; break; }
      if (!sel && a.id) sel = '#' + CSS.escape(a.id);
    }
    var st = root.querySelector('.tp-dc-days'), tr = root.querySelector('.tp-dc-track');
    return { sel: sel, strip: st ? st.scrollLeft : 0, track: tr ? tr.scrollLeft : null };
  }
  function render() {
    var snap = snapshot(), M = model();
    M0 = M;
    root.hidden = !M.n;
    if (!M.n) { root.innerHTML = ''; return; }
    G = groups(M);
    var cards = G.map(function (g, i) { return cardHtml(g, i, G.length, M); });
    /* B3 (21 Nov, F-051): with no days set, one card under the last match day says what days unlock. Nothing is
       guessed: no arrival or departure day, no ideas for undated days. In swipe it sits under the cards */
    var W = window.TP_WORDS || {}, stay = '', lastM = -1;
    G.forEach(function (g, i) { if (!g.run && g.days[0].ms.length) lastM = i; });
    if (!M.range && M.own && lastM > -1) stay = '<section class="tp-dc-stay" aria-labelledby="tp-dc-stay-h"><p class="tp-dc-stay-p"><strong id="tp-dc-stay-h">' + esc(W.stayAfter || 'Staying after your last match?') + '</strong> ' +
      esc(W.setDaysWhy || '') + '</p><button type="button" class="tp-dc-ideas" data-dc-setdays aria-haspopup="dialog">' + window.tpIcons.cal + '<span>' + esc(W.setDays || 'Set your days') + '</span></button></section>';
    if (stay && !swipe()) cards.splice(lastM + 1, 0, stay);
    cards = cards.join('');
    // With days set, the line above the strip already says Your days (and their dates), so its label is for screen
    // readers only; with match days only, it says so on screen, as the days are not in a row
    var h = (outNote ? '<p class="tp-dc-out">' + esc(outNote) + '</p>' : '') + '<div class="tp-dc-strip"><p class="tp-dc-strip-h' + (M.range ? ' visually-hidden' : '') + '" id="tp-dc-strip-h">' + esc(M.range ? 'Your days' : 'Your match days') + '</p>' +
      '<div class="tp-dc-days" role="group" aria-labelledby="tp-dc-strip-h">' + stripHtml(M) + '</div></div>';
    if (swipe()) {
      h += '<div class="tp-dc-nav"><button type="button" class="tp-dc-step" data-dc-prev>' + '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10 3.5L5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Previous day</span></button>' +
        '<p class="tp-dc-pos" id="tp-dc-pos"></p>' +
        '<button type="button" class="tp-dc-step" data-dc-next><span>Next day</span><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>' +
        '<div class="tp-dc-track">' + cards + '</div>' + stay;
    } else h += '<div class="tp-dc-cards">' + cards + '</div><div class="tp-dc-tail" aria-hidden="true"></div>';
    root.innerHTML = h;
    root.classList.toggle('is-swipe', swipe());
    var st = root.querySelector('.tp-dc-days'); st.scrollLeft = snap.strip;
    var tr = root.querySelector('.tp-dc-track');
    if (tr) {
      if (snap.track !== null) tr.scrollLeft = snap.track;
      else if (current !== null) { var c0 = cardFor(current); if (c0) tr.scrollLeft = c0.offsetLeft - tr.offsetLeft; }
      tr.addEventListener('scroll', onTrack, { passive: true });
    }
    measure();
    tail();
    if (current === null || !M.days.some(function (x) { return x.d === current; })) current = M.first;
    syncCurrent(false);
    if (snap.sel) { var f = root.querySelector(snap.sel); if (f) f.focus({ preventScroll: true }); }
    flashIds = [];
  }
  // The strip sits under the sheet's sticky header; focus and the browser's own scrolling keep clear of both, and of
  // the fixed foot with Save & share (nothing that takes focus sits under it)
  function measure() {
    if (!panel) return;
    // Only the strip sticks now (16 Nov polish): the title row scrolls away with the rest
    var sh = root.querySelector('.tp-dc-strip'), fh = foot && foot.offsetParent ? foot.offsetHeight : 0;
    panel.style.setProperty('--dc-top', '-8px');
    panel.style.scrollPaddingTop = ((sh && !swipe() ? sh.offsetHeight : 0) + 8) + 'px';
    panel.style.scrollPaddingBottom = (fh + 8) + 'px';
  }

  /* Room at the end (21 Nov): the last day's card can come to the top under the strip like any other, so opening the
     plan on a team's last match day (See your match day) or tapping the last day lands it there. The space is only
     what that card needs, measured as the plan is drawn and as it opens */
  function stuckGap() {
    var strip = root.querySelector('.tp-dc-strip'), cs = getComputedStyle(panel);
    return parseFloat(cs.paddingTop) + (parseFloat(getComputedStyle(strip).top) || 0) + strip.offsetHeight + 12;
  }
  function tail() {
    var t = root.querySelector('.tp-dc-tail'); if (!t || !panel || swipe()) return;
    var cardsEl = root.querySelectorAll('.tp-dc-card'), last = cardsEl[cardsEl.length - 1]; if (!last) return;
    t.style.height = '0px';
    var pr = panel.getBoundingClientRect(), y = last.getBoundingClientRect().top - pr.top - panel.clientTop + panel.scrollTop;
    var need = y - stuckGap(), max = panel.scrollHeight - panel.clientHeight;
    t.style.height = Math.max(0, Math.ceil(need - max)) + 'px';
  }
  if (window.ResizeObserver && panel) new ResizeObserver(function () { tail(); }).observe(panel);

  /* ---------- Where you are: the current day ---------- */
  function cardFor(d) { var c = null; root.querySelectorAll('.tp-dc-card').forEach(function (el) { if (+el.dataset.dcA <= d && +el.dataset.dcZ >= d) c = el; }); return c; }
  function syncCurrent(scrollStrip, instant) {
    var card = current !== null ? cardFor(current) : null, a = card ? +card.dataset.dcA : current, z = card ? +card.dataset.dcZ : current;
    var days = root.querySelectorAll('.tp-dc-day'), on = null;
    days.forEach(function (b) {
      var d = +b.dataset.dcDay, is = d >= a && d <= z;
      b.classList.toggle('is-current', is);
      if (is) b.setAttribute('aria-current', 'date'); else b.removeAttribute('aria-current');
      if (d === a) on = b;
    });
    // One button of the strip takes Tab (the current day); the arrow keys move along it
    days.forEach(function (b) { b.tabIndex = b === on ? 0 : -1; });
    if (on && scrollStrip) {
      var st = on.parentNode, l = on.offsetLeft - st.offsetLeft;
      if (l < st.scrollLeft + 8 || l + on.offsetWidth > st.scrollLeft + st.clientWidth - 8) st.scrollTo({ left: Math.max(0, l - st.clientWidth / 2 + on.offsetWidth / 2), behavior: instant || reduce.matches ? 'auto' : 'smooth' });
    }
    if (swipe()) {
      var cards = root.querySelectorAll('.tp-dc-card'), pos = root.querySelector('#tp-dc-pos'), i = Array.prototype.indexOf.call(cards, card);
      cards.forEach(function (c) { c.inert = c !== card; });
      if (pos && card && M0) {
        var ia = M0.days.map(function (x) { return x.d; }).indexOf(a) + 1, iz = M0.days.map(function (x) { return x.d; }).indexOf(z) + 1;
        pos.textContent = (ia === iz ? 'Day ' + ia : 'Days ' + ia + ' to ' + iz) + ' of ' + M0.n;
      }
      var pv = root.querySelector('[data-dc-prev]'), nx = root.querySelector('[data-dc-next]');
      if (pv) pv.disabled = i <= 0;
      if (nx) nx.disabled = i < 0 || i >= cards.length - 1;
    }
  }
  // Cards: the day whose card is at the top of the sheet, under the strip, is the current one
  var raf = 0, lockT = 0;
  if (panel) panel.addEventListener('scroll', function () {
    if (swipe() || raf || Date.now() < lockT) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var strip = root.querySelector('.tp-dc-strip'); if (!strip) return;
      var line = strip.getBoundingClientRect().bottom + 12, pick = null;
      root.querySelectorAll('.tp-dc-card').forEach(function (c) { if (!pick && c.getBoundingClientRect().bottom > line + 48) pick = c; /* more than a sliver of it in view */ });
      if (pick && +pick.dataset.dcA !== current) { current = +pick.dataset.dcA; syncCurrent(true); }
    });
  }, { passive: true });
  // Swipe: the card that has snapped into view is the current one
  var trackT = 0;
  function onTrack() {
    clearTimeout(trackT);
    trackT = setTimeout(function () {
      var tr = root.querySelector('.tp-dc-track'); if (!tr) return;
      var mid = tr.scrollLeft + tr.clientWidth / 2, pick = null;
      tr.querySelectorAll('.tp-dc-card').forEach(function (c) { var l = c.offsetLeft - tr.offsetLeft; if (mid >= l && mid < l + c.offsetWidth) pick = c; });
      if (pick && +pick.dataset.dcA !== current) { current = +pick.dataset.dcA; syncCurrent(true); }
    }, 90);
  }
  // Go to a day: its card comes to the top of the sheet (cards) or into view (swipe). Only the sheet or the track
  // scrolls, never the page behind
  function goTo(d, focus, instant) {
    var card = cardFor(d); if (!card) return;
    current = +card.dataset.dcA;
    lockT = Date.now() + 900; // the day asked for stays the current one while the sheet scrolls to it (and when the last days cannot reach the top)
    var beh = instant || reduce.matches ? 'auto' : 'smooth';
    if (swipe()) {
      var tr = root.querySelector('.tp-dc-track');
      card.inert = false;
      tr.scrollTo({ left: card.offsetLeft - tr.offsetLeft, behavior: beh });
    } else if (panel) {
      // Aim for where the strip will be once it has stuck, not where it is now: from the top of the sheet the title
      // rows above it scroll away too, so measuring against the strip as it sits undershoots by their height
      var strip = root.querySelector('.tp-dc-strip'), cs = getComputedStyle(panel), pr = panel.getBoundingClientRect();
      var stuck = parseFloat(cs.paddingTop) + (parseFloat(getComputedStyle(strip).top) || 0);
      var y = card.getBoundingClientRect().top - pr.top - panel.clientTop + panel.scrollTop;
      panel.scrollTo({ top: Math.max(0, Math.min(panel.scrollHeight - panel.clientHeight, y - stuck - strip.offsetHeight - 12)), behavior: beh });
    }
    syncCurrent(true, instant);
    if (focus) card.querySelector('.tp-dc-h').focus({ preventScroll: true });
  }
  /* Where the plan opens (20 Nov): your days in NSW (their first day), else the earliest-dated thing you added, else
     your first NSW match, else the plan's first day. The same rule every time it opens, so closing and reopening lands
     on the same day; a ticket, or a day tapped on the strip, does not change it. The strip's current day and the card
     at the top of the sheet (or in view, one day at a time) are set together. The first card stays at the very top of
     the sheet, with the heading and your days line above it. */
  function openDay(M) {
    if (M.range) return M.range.a;
    var its = M.days.filter(function (x) { return x.its.length || x.nights.length; })[0];
    if (its) return its.d;
    var nsw = M.days.filter(function (x) { return x.ms.some(function (m) { return !m.f.a; }); })[0];
    return nsw ? nsw.d : M.first;
  }
  // at: { day, note } when the page asks for a day (See your match day, 20 Nov); a day with no card (outside your days)
  // falls back to the rule, and the note says why
  var outNote = '';
  function openOn(at) {
    var want = at && at.note || '';
    if (want !== outNote) { outNote = want; render(); }
    tail();
    if (!M0 || !M0.n) return;
    var d = at && at.day != null && cardFor(at.day) ? at.day : openDay(M0), card = cardFor(d), first = root.querySelector('.tp-dc-card');
    if (!card) return;
    if (card === first && !swipe()) {
      current = +card.dataset.dcA; lockT = Date.now() + 900;
      if (panel) panel.scrollTop = 0;
      syncCurrent(true, true);
    } else goTo(d, false, true);
  }

  /* ---------- What people do on the cards ---------- */
  function item(id) { return state.added.filter(function (x) { return x.id === id; })[0]; }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !root.contains(b)) return;
    var ds = b.dataset;
    if (ds.dcDay !== undefined) { goTo(+ds.dcDay, true); return; }
    if (ds.dcSetdays !== undefined) { tp.openDays(b); return; }
    if (ds.dcPrev !== undefined || ds.dcNext !== undefined) {
      var cards = Array.prototype.slice.call(root.querySelectorAll('.tp-dc-card')), i = cards.indexOf(cardFor(current));
      var to = cards[i + (ds.dcNext !== undefined ? 1 : -1)];
      if (to) goTo(+to.dataset.dcA, false);
      return;
    }
    if (ds.dcOpen) { tp.openSheet('item:' + ds.dcOpen, b); return; }
    if (ds.dcMatch) { tp.openSheet('match:' + ds.dcMatch, b); return; }
    if (ds.dcIdeas) { if (window.tpFreeApi) window.tpFreeApi.toggle(+ds.dcIdeas, b); return; }
    if (ds.dcExpand) {
      expanded[ds.dcExpand] = true;
      var a0 = +ds.dcExpand.slice(1).split('-')[0];
      render();
      var first = root.querySelector('#tp-dc-d' + a0 + '-h'); if (first) first.focus({ preventScroll: true });
      tp.say('Showing each free day, ' + spanLabel(a0, +ds.dcExpand.split('-')[1]) + '.');
      return;
    }
    if (ds.dcMove) {
      moving = moving === ds.dcMove ? null : ds.dcMove;
      render();
      var chip = moving && root.querySelector('[data-dc-to][data-dc-id="' + CSS.escape(moving) + '"]');
      (chip || root.querySelector('[data-dc-move="' + CSS.escape(ds.dcMove) + '"]')).focus({ preventScroll: true });
      return;
    }
    if (ds.dcTo) {
      var it = item(ds.dcId); if (!it) return;
      var from = itemDay(it), card = cardFor(from);
      moving = null;
      tp.moveItem(ds.dcId, +ds.dcTo); // says "Manly ferry moved to Fri 15 Oct." (the item sheet's own message)
      render();
      // Focus stays on the card it left (its heading), so nothing jumps; the message says where it went
      var h = card && root.querySelector('#' + CSS.escape(card.id) + '-h') || (cardFor(from) && cardFor(from).querySelector('.tp-dc-h'));
      if (h) h.focus({ preventScroll: true });
      return;
    }
    if (ds.dcRemove) {
      var gone = item(ds.dcRemove); if (!gone) return;
      var li = b.closest('.tp-dc-it'), next = li && (li.nextElementSibling || li.previousElementSibling), nextId = next && next.dataset.id, cardEl = b.closest('.tp-dc-card'), cid = cardEl && cardEl.id;
      if (moving === gone.id) moving = null;
      tp.removeItem(gone.id);
      tp.say(gone.title + ' removed from your plan. ' + state.added.length + ' added.');
      render();
      var f = nextId && root.querySelector('[data-dc-open="' + CSS.escape(nextId) + '"]');
      if (!f && cid) f = root.querySelector('#' + CSS.escape(cid) + '-h');
      if (!f) f = cardFor(itemDay(gone)) && cardFor(itemDay(gone)).querySelector('.tp-dc-h');
      if (f) f.focus({ preventScroll: true });
    }
  });
  // The strip: arrow keys move along the days (Home and End to either end); Enter or Space goes to that day
  root.addEventListener('keydown', function (e) {
    var b = e.target.closest('.tp-dc-day'); if (!b) return;
    var all = Array.prototype.slice.call(root.querySelectorAll('.tp-dc-day')), i = all.indexOf(b), to = null;
    if (e.key === 'ArrowRight') to = all[Math.min(all.length - 1, i + 1)];
    else if (e.key === 'ArrowLeft') to = all[Math.max(0, i - 1)];
    else if (e.key === 'Home') to = all[0];
    else if (e.key === 'End') to = all[all.length - 1];
    if (!to) return;
    e.preventDefault();
    all.forEach(function (x) { x.tabIndex = x === to ? 0 : -1; });
    to.focus();
  });

  /* ---------- The tools switch: cards or one day at a time (also in the address, ?plan=swipe) ---------- */
  var tog = document.getElementById('tp-plan-toggle');
  if (tog) {
    tog.setAttribute('aria-checked', swipe() ? 'true' : 'false');
    tog.addEventListener('click', function () {
      var on = !swipe();
      if (on) html.setAttribute('data-plan', 'swipe'); else html.removeAttribute('data-plan');
      tog.setAttribute('aria-checked', on ? 'true' : 'false');
      try {
        var u = new URL(location.href); u.searchParams.set('plan', on ? 'swipe' : 'cards');
        history.replaceState(null, '', u.pathname + u.search.replace(/=(?=&|$)/g, '') + u.hash);
      } catch (err) {}
      var keep = current; render(); if (keep !== null) goTo(keep, false);
      tp.say(on ? 'Your plan shows one day at a time.' : 'Your plan shows every day, one under the other.');
    });
  }

  window.tpPlan = {
    render: render,
    goTo: goTo,
    openOn: openOn,
    focusCurrent: function () { var c = current !== null ? cardFor(current) : null, h = c && c.querySelector('.tp-dc-h'); if (h) h.focus({ preventScroll: true }); },
    same: function (el) {
      var ds = el.dataset || {}, k = ['dcIdeas', 'dcOpen', 'dcMatch', 'dcMove', 'dcDay', 'dcExpand', 'ticket'].filter(function (x) { return ds[x] !== undefined; })[0];
      var hit = k ? root.querySelector('[data-' + k.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }) + '="' + CSS.escape(ds[k]) + '"]') : null;
      // A day filled from its ideas sheet loses Add ideas: its card's heading stands in
      if (!hit && k === 'dcIdeas') { var c = cardFor(+ds.dcIdeas); hit = c && c.querySelector('.tp-dc-h'); }
      return hit;
    },
    addButton: function (d) { return root.querySelector('[data-dc-ideas="' + d + '"]'); },
    // Something just added (from the ideas sheet): its line on the card is singled out for a moment
    flash: function (ids) { flashIds = ids.slice(); render(); setTimeout(function () { root.querySelectorAll('.tp-dc-it.is-flash').forEach(function (el) { el.classList.remove('is-flash'); }); }, 1600); }
  };
  if (window.ResizeObserver && head) new ResizeObserver(measure).observe(head);
  render();
})();
