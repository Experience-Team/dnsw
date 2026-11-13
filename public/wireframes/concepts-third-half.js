/* Concepts: Where to watch, Suits your 3rd half and the one question (prototype-pick-your-team.html).
   Experience principles (CLAUDE.md): reward early, then build on it; don't make people do the work.
   - Both result sections show straight away for the person's matches (picked teams, ticket marks, every NSW match for
     Here for the rugby, or every match when nothing is picked). Nothing waits for dates.
   - One optional question comes after them. Visiting NSW infers the days from the first to last NSW match; I live in
     NSW never asks for dates; Not sure yet changes nothing. The answer refines the results in place and is saved with
     the picks (tp-pick-v1), shown and editable in the open timeline.
   Data: placeholders only. Screenings, the village and the fan zone come from window.cnWatchSpots; products from
   window.cnThirdHalf, shaped like the product data contract (availability, pricing and distance_to_venue are gap, so
   pink). No venue or product is favoured: spots go by type then name, products by distance then name. Links go out
   only; nothing is booked here. State and the timeline live in concepts-teams.js (window.tpPicker). */
(function () {
  'use strict';
  var tp = window.tpPicker, FIX = window.cnFixtures;
  if (!tp || !Array.isArray(FIX)) return;
  var SPOTS = Array.isArray(window.cnWatchSpots) ? window.cnWatchSpots : [];
  var PRODUCTS = Array.isArray(window.cnThirdHalf) ? window.cnThirdHalf : [];
  var phone = document.getElementById('tp-phone'), body = tp.body, reduce = tp.reduce, esc = tp.esc, side = tp.side;
  var watchList = document.getElementById('tp-watch-list'), watchMore = document.getElementById('tp-watch-more');
  var daysEl = document.getElementById('tp-days'), thirdList = document.getElementById('tp-third-list'), thirdNote = document.getElementById('tp-third-note');
  var ask = document.getElementById('tp-ask');
  if (!watchList || !daysEl || !thirdList || !ask) return;

  var SPOT_TYPE = { fan_zone: 'Fan zone', village: 'Village', pub: 'Pub screening' }, SPOT_ORDER = { fan_zone: 0, village: 1, pub: 2 };
  var PTYPE = { food_and_drink: 'Food and drink', attraction: 'Attraction', tour: 'Tour', event: 'Event', hire: 'Hire', accommodation: 'Accommodation' };
  var WD = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var WD_PLURAL = { sun: 'Sundays', mon: 'Mondays', tue: 'Tuesdays', wed: 'Wednesdays', thu: 'Thursdays', fri: 'Fridays', sat: 'Saturdays' };
  var state = tp.state;

  /* ---------- Small helpers ---------- */
  function weekdayOf(day) { return WD[new Date(Date.UTC(2027, 9, 1 + day)).getUTCDay()]; }
  function isoOf(day) { var d = new Date(Date.UTC(2027, 9, 1 + day)); return d.toISOString().slice(0, 10); }
  function hm(s) { var p = s.split(':'); return +p[0] * 60 + +p[1]; }
  function kickMins(k) { var m = /^(\d+):(\d+)(am|pm)$/.exec(k || ''); return m ? ((+m[1] % 12) + (m[3] === 'pm' ? 12 : 0)) * 60 + +m[2] : null; }
  function clock(s) {
    if (s === '23:59') return 'midnight';
    var p = s.split(':'), h = +p[0], mm = p[1], ap = h < 12 ? 'am' : 'pm', h12 = h % 12 || 12;
    return h12 + (mm === '00' ? '' : ':' + mm) + ap;
  }
  function hasTicket(m) { return !!m.tkey && state.tickets.indexOf(m.tkey) > -1; }
  function matchName(f) { return f.t || f.s; }
  function trip() { return state.trip; }
  function stay() { var t = trip(); return t && t.mode === 'visiting' && t.from && t.to ? { a: tp.isoDay(t.from), z: tp.isoDay(t.to) } : null; }
  function inStay(day) { var s = stay(); return !s || (day >= s.a && day <= s.z); }
  function added(id) { return state.added.some(function (x) { return x.id === id; }); }
  function notesRefresh() { phone.dispatchEvent(new CustomEvent('tp:state')); }
  function addBtn(id, label) {
    var on = added(id);
    return '<button type="button" class="tp-add" data-item="' + esc(id) + '" aria-pressed="' + on + '">' +
      '<span aria-hidden="true">' + (on ? 'Added' : 'Add') + '</span><span class="visually-hidden">' + (on ? 'Added: ' : 'Add ') + esc(label) + (on ? '. Press to remove' : ' to your timeline') + '</span></button>';
  }
  // Items the add buttons put on the timeline, by id, rebuilt on each render
  var ITEMS = {};

  /* ---------- Where to watch ---------- */
  var watchAll = false;
  function spotsFor(m) {
    return SPOTS.filter(function (sp) { return Array.isArray(sp.shows) && sp.shows.indexOf(m.key) > -1; })
      .sort(function (a, b) { return (SPOT_ORDER[a.type] - SPOT_ORDER[b.type]) || a.name.localeCompare(b.name); });
  }
  function renderWatch() {
    // The person's matches without a ticket (with a ticket they will be at the ground) that a spot shows, in their days
    var ms = tp.userMatches().filter(function (m) { return !hasTicket(m) && inStay(m.day) && spotsFor(m).length; });
    var s = stay(), h = '';
    if (!ms.length) {
      h = '<p class="tp-empty">' + (s ? 'None of your matches in your days in NSW (' + esc(tp.isoRange(trip().from, trip().to)) + ') has a screening listed yet.'
        : 'None of your matches has a screening listed yet.') + '</p>';
    }
    var show = watchAll ? ms : ms.slice(0, 3);
    show.forEach(function (m) {
      var f = m.f, who = f.t ? f.t.split(' v ').map(side).join(' <span class="tp-all-v">v</span> ') : esc(f.s);
      h += '<div class="tp-wm" data-key="' + esc(m.key) + '"><p class="tp-wm-when">' + esc(f.d) + ', ' + esc(f.k || 'time to be confirmed') + '</p>' +
        '<p class="tp-wm-teams">' + who + '</p>' + (f.a ? '<span class="tp-tag tp-tag--away">Interstate: ' + esc(f.a) + '</span>' : '<span class="tp-tag">In NSW</span>') +
        '<ul class="tp-wm-spots">' + spotsFor(m).map(function (sp) {
          var id = 'w:' + SPOTS.indexOf(sp) + ':' + m.key;
          var open = sp.open_from && sp.open_to ? 'Open daily, ' + tp.isoRange(sp.open_from, sp.open_to) : '';
          ITEMS[id] = { id: id, kind: sp.type === 'village' ? 'place' : 'screening', title: sp.name, kindLabel: SPOT_TYPE[sp.type] || 'Screening', place: sp.place, note: open, day: f.d, matchName: matchName(f) };
          return '<li class="tp-ws provenance-gap" data-id="' + esc(id) + '"><span class="tp-ws-text"><span class="tp-ws-name">' + esc(sp.name) + '</span>' +
            '<span class="tp-ws-meta">' + esc(SPOT_TYPE[sp.type] || 'Screening') + ' · ' + esc(sp.place) + '</span>' +
            (open ? '<span class="tp-ws-meta">' + esc(open) + '</span>' : '') + '</span>' +
            addBtn(id, sp.name + ' on ' + f.d) + '</li>';
        }).join('') + '</ul></div>';
    });
    watchList.innerHTML = h;
    var more = ms.length - show.length;
    watchMore.hidden = ms.length <= 3;
    watchMore.setAttribute('aria-expanded', watchAll ? 'true' : 'false');
    watchMore.textContent = watchAll ? 'Show fewer' : 'Show ' + more + ' more ' + (more === 1 ? 'match' : 'matches') + ' with screenings';
  }
  watchMore.addEventListener('click', function () { watchAll = !watchAll; render(true); });

  /* ---------- Suits your 3rd half ---------- */
  var selDay = null;
  // The person's match days in NSW (one chip per day and stadium), in their days in NSW when they have said so
  function nswDays() {
    var out = [], seen = {};
    tp.userMatches().forEach(function (m) {
      if (m.f.a || !inStay(m.day)) return;
      var k = m.f.d + '|' + m.f.v;
      if (seen[k]) { if (hasTicket(m)) seen[k].ticket = true; return; }
      seen[k] = { key: k, m: m, ticket: hasTicket(m) };
      out.push(seen[k]);
    });
    return out;
  }
  function hoursOn(p, wd) {
    var a = p.availability;
    if (!a || a.kind !== 'opening_hours' || !Array.isArray(a.opening_hours)) return null;
    return a.opening_hours.filter(function (o) { return o.day === wd; })[0] || null;
  }
  function openAt(o, t) { return !!o && t >= hm(o.opens) && t <= Math.min(1439, hm(o.closes)); }
  // Walking or transit time to the stadium (fixture-only, not in the contract), preferred over km; km only as a fallback
  function travel(dv, venue) {
    if (!dv) return '';
    var to = venue ? esc(venue) : (dv.label || 'the stadium');
    if (dv.walking_minutes && dv.walking_minutes <= 20) return dv.walking_minutes + ' min walk to ' + to;
    if (dv.transit_minutes) return dv.transit_minutes + ' min by public transport to ' + to;
    return dv.km + ' km from ' + to;
  }
  function reason(p, o, d) {
    var t = trip(), f = d.m.f, wd = weekdayOf(d.m.day);
    var open = t && t.mode === 'visiting' && stay() ? 'Open on ' + f.d + ', ' + clock(o.opens) + ' to ' + clock(o.closes) : 'Open ' + WD_PLURAL[wd] + ' ' + clock(o.opens) + ' to ' + clock(o.closes);
    var price = p.pricing ? (p.pricing.is_free ? 'free' : p.pricing.band) : '';
    var dist = travel(p.distance_to_venue);
    var parts = t && t.mode === 'local' ? [dist, open.charAt(0).toLowerCase() + open.slice(1), price] : [open, price, dist];
    parts = parts.filter(Boolean);
    return parts.join(' · ');
  }
  var openCard = null;
  function renderThird() {
    var days = nswDays(), s = stay();
    if (!days.some(function (d) { return d.key === selDay; })) {
      var first = days.filter(function (d) { return d.ticket; })[0] || days[0];
      selDay = first ? first.key : null;
    }
    daysEl.hidden = days.length < 1;
    daysEl.innerHTML = days.map(function (d) {
      return '<button type="button" class="tp-chip" data-day="' + esc(d.key) + '" aria-pressed="' + (d.key === selDay) + '">' +
        esc(d.m.f.d) + ' · ' + esc(d.m.f.p) + (d.ticket ? '<span class="tp-chip-tk"> · ticket</span>' : '') + '</button>';
    }).join('');
    if (!selDay) {
      thirdList.innerHTML = '<p class="tp-empty">' + (s ? 'None of your match days in NSW falls in your days here (' + esc(tp.isoRange(trip().from, trip().to)) + '). Change your dates, or see Where to watch above.'
        : 'None of your matches is in NSW, so there is nothing near a stadium to suggest yet. See Where to watch above.') + '</p>';
      return;
    }
    var d = days.filter(function (x) { return x.key === selDay; })[0], f = d.m.f, wd = weekdayOf(d.m.day), k = kickMins(f.k);
    var groups = { before: [], after: [], near: [] };
    PRODUCTS.filter(function (p) { return p.distance_to_venue && p.distance_to_venue.venue_ref === f.v; }).forEach(function (p) {
      var o = hoursOn(p, wd);
      if (!o) return; // closed that day: not a fit, so not shown
      var g = 'near';
      if (k !== null) {
        var b = openAt(o, k - 90), a = openAt(o, Math.min(1439, k + 150));
        g = b && a ? 'near' : b ? 'before' : a ? 'after' : hm(o.opens) < k ? 'before' : 'after';
      }
      groups[g].push({ p: p, o: o });
    });
    var LABEL = { before: 'Before the match', after: 'After the final whistle', near: 'Near the stadium' };
    var h = '<p class="tp-third-match">' + esc(f.d) + ', ' + (f.k ? 'kick-off ' + esc(f.k) : 'kick-off to be confirmed') + ' · ' + esc(f.v) + '</p>', any = false;
    ['before', 'after', 'near'].forEach(function (g) {
      var list = groups[g].sort(function (x, y) { return (x.p.distance_to_venue.km - y.p.distance_to_venue.km) || x.p.title.localeCompare(y.p.title); });
      if (!list.length) return;
      any = true;
      h += '<h4 class="tp-grp">' + LABEL[g] + '</h4><div class="tp-pcs">';
      list.forEach(function (x) {
        var p = x.p, id = 'p:' + p.id + ':' + f.d, cid = 'tp-pc-' + p.id, why = reason(p, x.o, d);
        ITEMS[id] = { id: id, kind: 'product', title: p.title, kindLabel: PTYPE[p.type] || 'Product', place: p.address && p.address.suburb, day: f.d, matchName: matchName(f) };
        var isOpen = openCard === id;
        h += '<article class="tp-pc" data-id="' + esc(id) + '">' +
          '<button type="button" class="tp-pc-main" aria-expanded="' + isOpen + '" aria-controls="' + cid + '">' +
          '<span class="ph-img tp-pc-img" aria-hidden="true"></span><span class="tp-pc-body"><span class="tp-pc-title">' + esc(p.title) + '</span>' +
          '<span class="tp-pc-type provenance-gap">' + esc(PTYPE[p.type] || 'Product') + '</span>' +
          '<span class="tp-pc-why provenance-gap" data-why="' + esc(why) + '">' + esc(why) + '</span></span></button>' +
          addBtn(id, p.title + ' on ' + f.d) +
          '<div class="tp-pc-more" id="' + cid + '"' + (isOpen ? '' : ' hidden') + '><dl>' +
          '<dt>Where</dt><dd class="provenance-gap">' + esc(p.address.suburb) + ', ' + travel(p.distance_to_venue, f.v) + ' (' + p.distance_to_venue.km + ' km)</dd>' +
          '<dt>' + esc(f.d) + '</dt><dd class="provenance-gap">Open ' + clock(x.o.opens) + ' to ' + clock(x.o.closes) + '</dd>' +
          '<dt>Price</dt><dd class="provenance-gap">' + (p.pricing.is_free ? 'Free' : esc(p.pricing.band) + ' (price band)') + '</dd></dl>' +
          '<a class="tp-out" href="' + esc(p.links.website || '#') + '" rel="external noopener">Visit their website<span class="visually-hidden"> (their own site; nothing is booked here)</span></a></div></article>';
      });
      h += '</div>';
    });
    if (!any) h += '<p class="tp-empty">Nothing listed near ' + esc(f.v) + ' is open on ' + esc(f.d) + ' yet.</p>';
    thirdList.innerHTML = h;
  }
  daysEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-day]'); if (!b) return;
    selDay = b.dataset.day; openCard = null;
    render(true, '[data-day="' + CSS.escape(b.dataset.day) + '"]');
    tp.say('Suggestions for ' + b.textContent + '.');
  });
  thirdList.addEventListener('click', function (e) {
    var b = e.target.closest('.tp-pc-main'); if (!b) return;
    var card = b.closest('.tp-pc'), more = card.querySelector('.tp-pc-more'), open = more.hidden;
    more.hidden = !open; b.setAttribute('aria-expanded', open ? 'true' : 'false');
    openCard = open ? card.dataset.id : null;
    if (open && !reduce.matches && more.animate) more.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'ease-out' });
    notesRefresh();
  });

  /* ---------- Add and remove (both sections) ---------- */
  phone.addEventListener('click', function (e) {
    var out = e.target.closest('.tp-out');
    if (out && out.getAttribute('href') === '#') { e.preventDefault(); tp.say('Placeholder link: it goes to the listing\u2019s own website once real listings are in.'); return; }
    var b = e.target.closest('.tp-add'); if (!b) return;
    var it = ITEMS[b.dataset.item]; if (!it) return;
    if (added(it.id)) {
      tp.removeItem(it.id);
      tp.say(it.title + ' removed from your timeline. ' + state.added.length + ' added.');
    } else {
      tp.flyToBar(b);
      tp.addItem(Object.assign({}, it));
      tp.say(it.title + ' added to your timeline on ' + it.day + '. ' + state.added.length + ' added.');
    }
  });

  /* ---------- The one question ---------- */
  var askEditing = false, askManual = false, askError = '';
  // From what they have already done: their first to last match in NSW (and any ticket). Nothing to go on without a pick.
  function inferred() {
    if (!tp.picked()) return null;
    var ds = tp.userMatches().filter(function (m) { return !m.f.a; }).map(function (m) { return m.day; });
    if (!ds.length) return null;
    return { from: isoOf(Math.min.apply(null, ds)), to: isoOf(Math.max.apply(null, ds)) };
  }
  function fork(mode) {
    var t = trip(), cur = t ? t.mode : null;
    var B = function (m, label) { return '<button type="button" class="tp-chip tp-fork" data-mode="' + m + '" aria-pressed="' + (cur === m) + '">' + label + '</button>'; };
    return '<div class="tp-forks" role="group" aria-label="Visiting or local">' + B('visiting', 'Visiting NSW') + B('local', 'I live in NSW') + B('unsure', 'Not sure yet') + '</div>';
  }
  function renderAsk() {
    var t = trip(), done = t && (t.mode !== 'visiting' || (t.from && t.to)) && !askEditing, h;
    if (done) {
      var what = t.mode === 'local' ? 'I’m local' : t.mode === 'unsure' ? 'Not sure yet' : 'In NSW ' + tp.isoRange(t.from, t.to);
      h = '<p class="tp-ask-sum"><span class="tp-ask-sum-text">' + esc(what) + '</span> · <button type="button" class="tp-link" data-act="change">Change</button></p>' +
        '<p class="tp-ask-why">Saved on this device only, with your picks.</p>';
    } else {
      h = '<h3 class="tp-sec-title" id="tp-ask-title">Make these fit your trip</h3>' +
        '<p class="tp-sec-note">Optional. One tap sharpens the suggestions above. Saved on this device only.</p>' + fork();
      if (t && t.mode === 'visiting') {
        var inf = inferred();
        if (inf && !askManual) {
          h += '<div class="tp-ask-step"><p class="tp-ask-guess">Looks like you’re here ' + (inf.from === inf.to ? 'on ' : '') + '<strong>' + esc(tp.isoRange(inf.from, inf.to)) + '</strong>, ' + (inf.from === inf.to ? 'for your match in NSW.' : 'from your first to last match in NSW.') + '</p>' +
            '<div class="tp-ask-acts"><button type="button" class="tp-pill" data-act="confirm">That’s right</button><button type="button" class="tp-link" data-act="adjust">Change dates</button></div></div>';
        } else {
          var from = (t.from) || (askManual && inf ? inf.from : ''), to = (t.to) || (askManual && inf ? inf.to : '');
          h += '<div class="tp-ask-step"><p class="tp-ask-guess">' + (inf ? 'Set your days in NSW.' : 'When are you in NSW? Add your days, or leave it for later.') + '</p>' +
            '<div class="tp-dates"><label class="tp-date"><span>First day in NSW</span><input type="date" id="tp-from" min="2027-09-20" max="2027-11-20" value="' + esc(from) + '"></label>' +
            '<label class="tp-date"><span>Last day in NSW</span><input type="date" id="tp-to" min="2027-09-20" max="2027-11-20" value="' + esc(to) + '"></label></div>' +
            (askError ? '<p class="tp-ask-err" role="alert">' + esc(askError) + '</p>' : '') +
            '<div class="tp-ask-acts"><button type="button" class="tp-pill" data-act="use">Use these dates</button></div></div>';
        }
      }
    }
    ask.innerHTML = h;
    ask.setAttribute('aria-labelledby', done ? '' : 'tp-ask-title');
    if (done) ask.setAttribute('aria-label', 'Your trip'); else ask.removeAttribute('aria-label');
  }
  ask.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var t = trip(), h0 = ask.offsetHeight; // measured before anything changes, so the change can glide
    if (b.dataset.mode) {
      var mode = b.dataset.mode;
      askManual = false; askError = '';
      if (mode === 'visiting') {
        // Keep dates already set; otherwise the guess shows next
        // Dates already set show in the fields to adjust; otherwise the guess shows next
        askEditing = true; askManual = !!(t && t.mode === 'visiting' && t.from);
        tp.setTrip({ mode: 'visiting', from: t && t.mode === 'visiting' ? t.from : undefined, to: t && t.mode === 'visiting' ? t.to : undefined });
        settle('[data-mode="visiting"]', h0);
        tp.say('Visiting NSW.');
      } else {
        askEditing = false;
        tp.setTrip({ mode: mode });
        settle('[data-act="change"]', h0);
        tp.say(mode === 'local' ? 'Local. Suggestions stay grouped by match day; no dates needed.' : 'Not sure yet. Nothing changes; you can answer later.');
      }
      return;
    }
    var act = b.dataset.act;
    if (act === 'change') { askEditing = true; askManual = false; settle('.tp-fork[aria-pressed="true"], .tp-fork', h0); return; }
    if (act === 'adjust') { askManual = true; settle('#tp-from', h0); return; }
    if (act === 'confirm') {
      var inf = inferred();
      askEditing = false;
      tp.setTrip({ mode: 'visiting', from: inf.from, to: inf.to });
      settle('[data-act="change"]', h0);
      tp.say('Your days in NSW are ' + tp.isoRange(inf.from, inf.to) + '. Suggestions updated.');
      return;
    }
    if (act === 'use') {
      var a = document.getElementById('tp-from').value, z = document.getElementById('tp-to').value;
      if (!a || !z) { askError = 'Add both days, or leave this for later: everything works without them.'; settle(a ? '#tp-to' : '#tp-from', h0); return; }
      if (z < a) { askError = 'The last day is before the first day.'; settle('#tp-to', h0); return; }
      askError = ''; askEditing = false; askManual = false;
      tp.setTrip({ mode: 'visiting', from: a, to: z });
      settle('[data-act="change"]', h0);
      tp.say('Your days in NSW are ' + tp.isoRange(a, z) + '. Suggestions updated.');
    }
  });
  // The question collapsing to its answer (or opening again) glides between the two heights
  function settle(focusSel, h0) {
    render(true);
    var h1 = ask.offsetHeight;
    if (!reduce.matches && ask.animate && Math.abs(h1 - h0) > 2) {
      ask.style.overflow = 'hidden';
      ask.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 280, easing: 'cubic-bezier(.2, .8, .2, 1)' }).onfinish = function () { ask.style.overflow = ''; };
    }
    if (ask.animate) ask.firstElementChild && ask.firstElementChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce.matches ? 120 : 220, easing: 'ease-out' });
    var el = focusSel && ask.querySelector(focusSel);
    if (el) el.focus({ preventScroll: true });
  }
  // From the open timeline: Change or Answer comes here
  phone.addEventListener('tp:ask', function () {
    askEditing = true; askManual = false;
    render(true);
    var top = ask.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16;
    body.scrollTo({ top: Math.max(0, top), behavior: reduce.matches ? 'auto' : 'smooth' });
    var first = ask.querySelector('.tp-fork[aria-pressed="true"]') || ask.querySelector('.tp-fork');
    if (first) first.focus({ preventScroll: true });
  });

  /* ---------- Render: only when something it depends on changed ---------- */
  var sig = '', seen = {}, whys = {};
  function signature() {
    return JSON.stringify([state.picked, state.tickets, state.trip, state.added.map(function (x) { return x.id; }), state.view, selDay, watchAll, askEditing, askManual, askError, openCard]);
  }
  function render(force, focusSel) {
    var s = signature();
    if (!force && s === sig) return;
    sig = s;
    // The control that had focus is rebuilt, so focus goes back to its replacement
    var active = document.activeElement, keep = null;
    if (active && phone.contains(active) && active.dataset) {
      if (active.dataset.item) keep = '.tp-add[data-item="' + CSS.escape(active.dataset.item) + '"]';
      else if (active.dataset.day) keep = '[data-day="' + CSS.escape(active.dataset.day) + '"]';
    }
    ITEMS = {};
    renderWatch();
    renderThird();
    renderAsk();
    // A gentle change: what is new fades up; a reason that changed glows briefly
    var now = {};
    phone.querySelectorAll('.tp-wm, .tp-pc').forEach(function (el) {
      var k = el.dataset.key || el.dataset.id;
      now[k] = true;
      if (sig && !seen[k] && Object.keys(seen).length) el.classList.add('is-in');
      var why = el.querySelector('.tp-pc-why');
      if (why) { if (whys[k] && whys[k] !== why.dataset.why) why.classList.add('is-updated'); whys[k] = why.dataset.why; }
    });
    seen = now;
    var f = (focusSel && phone.querySelector(focusSel)) || (keep && phone.querySelector(keep));
    if (f && f !== document.activeElement) f.focus({ preventScroll: true });
    notesRefresh();
  }
  phone.addEventListener('tp:state', function () { render(false); });
  // Reset prototype (a reviewer tool): this section's own choices go back to a first visit too
  var resetBtn = document.getElementById('tp-reset');
  if (resetBtn) resetBtn.addEventListener('click', function () { selDay = null; watchAll = false; openCard = null; askEditing = false; askManual = false; askError = ''; seen = {}; whys = {}; render(true); });
  render(true);
})();
