/* Concepts: Where to watch, Suits your 3rd half and the one question (prototype-pick-your-team.html).
   Experience principles (CLAUDE.md): reward early, then build on it; don't make people do the work.
   - Both result sections show straight away for the person's matches (picked teams, ticket marks, every NSW match for
     Here for the rugby). Nothing waits for dates. With no team picked they are a first look only: the next NSW match
     day (in their days in NSW once they have said so), with one Pick a team to tailor this, not every match at once.
   - One optional question, in the open timeline and nowhere else on the page (a line under Suits your 3rd half opens
     it, and shows the answer once given). Visiting NSW infers the days from the first to
     last NSW match; I live in NSW never asks for dates; Not sure yet changes nothing. The answer refines the results in
     place, says what changed under the answer, and tints each section that changed as it comes into view. It is saved
     with the picks (tp-pick-v1), shown and editable in the open timeline.
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
  var watchNote = document.getElementById('tp-watch-note'), watchNoteText = watchNote ? watchNote.textContent : '';
  var ask = document.getElementById('tp-ask'), tripEl = document.getElementById('tp-third-trip');
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
  // Items the add buttons put on the timeline, by id, rebuilt on each render; and what each one's page shows
  var ITEMS = {}, MODAL = {};

  /* ---------- First look: no team picked yet ----------
     Without a pick there is nothing to tailor to, so both sections show one day only (the next NSW match day, in the
     person's days in NSW once given) and one way on, Pick a team to tailor this, instead of every match at once. */
  function teaser() { return !tp.own(); }
  function teaserDay() { var d = nswDays()[0]; return d ? d.m.f.d : null; }
  var TAILOR = '<p class="tp-tailor"><button type="button" class="tp-pill" data-act="tailor">Pick a team to tailor this</button></p>';

  /* ---------- Where to watch ---------- */
  var watchAll = false;
  function spotsFor(m) {
    return SPOTS.filter(function (sp) { return Array.isArray(sp.shows) && sp.shows.indexOf(m.key) > -1; })
      .sort(function (a, b) { return (SPOT_ORDER[a.type] - SPOT_ORDER[b.type]) || a.name.localeCompare(b.name); });
  }
  function renderWatch() {
    // The person's matches without a ticket (with a ticket they will be at the ground) that a spot shows, in their days
    var ms = tp.userMatches().filter(function (m) { return !hasTicket(m) && inStay(m.day) && spotsFor(m).length; });
    var s = stay(), h = '', first = teaser();
    if (first) {
      // The next NSW match day's screenings (any match that day, in NSW or not); failing that, the first day with one
      var d0 = teaserDay(), on = ms.filter(function (m) { return m.f.d === d0; });
      ms = on.length ? on : ms.filter(function (m) { return ms[0] && m.f.d === ms[0].f.d; });
    }
    if (watchNote) watchNote.textContent = first && ms.length ? 'A first look: screenings on ' + ms[0].f.d + ', the next NSW match day.' : watchNoteText;
    if (!ms.length) {
      h = '<p class="tp-empty">' + (s ? 'None of your matches in your days in NSW (' + esc(tp.isoRange(trip().from, trip().to)) + ') has a screening listed yet.'
        : 'None of your matches has a screening listed yet.') + '</p>';
    }
    var show = watchAll ? ms : ms.slice(0, 3);
    show.forEach(function (m) {
      var f = m.f, who = f.t ? f.t.split(' v ').map(side).join(' <span class="tp-all-v">v</span> ') : esc(f.s);
      // One compact group per match: date and where on one line, the teams, then its spots as plain rows
      h += '<div class="tp-wm" data-key="' + esc(m.key) + '"><p class="tp-wm-when"><span>' + esc(f.d) + ', ' + esc(f.k || 'time to be confirmed') + '</span>' +
        (f.a ? '<span class="tp-tag tp-tag--away">Interstate: ' + esc(f.a) + '</span>' : '<span class="tp-tag">In NSW</span>') + '</p>' +
        '<p class="tp-wm-teams">' + who + '</p>' +
        '<ul class="tp-wm-spots">' + spotsFor(m).map(function (sp) {
          var id = 'w:' + SPOTS.indexOf(sp) + ':' + m.key;
          var open = sp.open_from && sp.open_to ? 'Open daily, ' + tp.isoRange(sp.open_from, sp.open_to) : '';
          ITEMS[id] = { id: id, kind: sp.type === 'village' ? 'place' : 'screening', title: sp.name, kindLabel: SPOT_TYPE[sp.type] || 'Screening', place: sp.place, note: open, day: f.d, matchName: matchName(f) };
          MODAL[id] = { type: 'spot', sp: sp, m: m };
          return '<li class="tp-ws provenance-gap" data-id="' + esc(id) + '"><button type="button" class="tp-ws-text" data-open="' + esc(id) + '" aria-haspopup="dialog"><span class="tp-ws-name">' + esc(sp.name) + '</span>' +
            '<span class="tp-ws-meta">' + esc(SPOT_TYPE[sp.type] || 'Screening') + ' · ' + esc(sp.place) + '</span>' +
            (open ? '<span class="tp-ws-meta">' + esc(open) + '</span>' : '') + '</button>' +
            addBtn(id, sp.name + ' on ' + f.d) + '</li>';
        }).join('') + '</ul></div>';
    });
    watchList.innerHTML = h;
    var more = ms.length - show.length;
    watchMore.hidden = first || ms.length <= 3;
    watchMore.setAttribute('aria-expanded', watchAll ? 'true' : 'false');
    watchMore.textContent = watchAll ? 'Show fewer' : 'Show ' + more + ' more ' + (more === 1 ? 'match' : 'matches') + ' with screenings';
  }
  watchMore.addEventListener('click', function () { watchAll = !watchAll; render(true); });

  /* ---------- Suits your 3rd half ---------- */
  var selDay = null;
  // The person's match days in NSW (one chip per day and stadium), in their days in NSW when they have said so
  // fallback: none of the person's matches is in NSW, so offer the NSW match days they could go to instead
  var fallback = false, thirdNoteText = thirdNote ? thirdNote.textContent : '';
  function nswDays() {
    var out = [], seen = {};
    var own = tp.userMatches().filter(function (m) { return !m.f.a; });
    fallback = tp.picked() && !own.length;
    (fallback ? tp.allMatches() : tp.userMatches()).forEach(function (m) {
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
    var days = nswDays(), s = stay(), first = teaser();
    if (first) days = days.slice(0, 1); // one day only until there is a team to tailor to
    if (!days.some(function (d) { return d.key === selDay; })) {
      var first = days.filter(function (d) { return d.ticket; })[0] || days[0];
      selDay = first ? first.key : null;
    }
    daysEl.hidden = first || days.length < 1;
    if (thirdNote) {
      var teams = state.picked.filter(function (n) { return tp.teams[n]; });
      thirdNote.textContent = first && days.length ? 'A first look: around the next NSW match day. Each links out; nothing is booked here.'
        : fallback && days.length ? tp.list(teams) + (teams.length === 1 ? ' plays' : ' play') + ' interstate, so these are around the matches in NSW you could go to. Each links out; nothing is booked here.' : thirdNoteText;
    }
    daysEl.innerHTML = days.map(function (d) {
      return '<button type="button" class="tp-chip" data-day="' + esc(d.key) + '" aria-pressed="' + (d.key === selDay) + '">' +
        esc(d.m.f.d) + ' · ' + esc(d.m.f.p) + (d.ticket ? '<span class="tp-chip-tk"> · ticket</span>' : '') + '</button>';
    }).join('');
    if (!selDay) {
      thirdList.innerHTML = '<p class="tp-empty">' + (s ? (fallback ? 'No NSW match falls in your days here (' : 'None of your match days in NSW falls in your days here (') + esc(tp.isoRange(trip().from, trip().to)) + '). Change your dates, or see Where to watch above.'
        : 'There are no NSW matches to plan around yet. See Where to watch above.') + '</p>' + (first ? TAILOR : '');
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
        MODAL[id] = { type: 'product', p: p, f: f, o: x.o, why: why };
        h += '<article class="tp-pc" data-id="' + esc(id) + '">' +
          '<button type="button" class="tp-pc-main" data-open="' + esc(id) + '" aria-haspopup="dialog">' +
          '<span class="ph-img tp-pc-img" aria-hidden="true"></span><span class="tp-pc-body"><span class="tp-pc-title">' + esc(p.title) + '</span>' +
          '<span class="tp-pc-type provenance-gap">' + esc(PTYPE[p.type] || 'Product') + '</span>' +
          '<span class="tp-pc-why provenance-gap" data-why="' + esc(why) + '">' + esc(why) + '</span></span></button>' +
          addBtn(id, p.title + ' on ' + f.d) + '</article>';
      });
      h += '</div>';
    });
    if (!any) h += '<p class="tp-empty">Nothing listed near ' + esc(f.v) + ' is open on ' + esc(f.d) + ' yet.</p>';
    if (first) h += TAILOR;
    thirdList.innerHTML = h;
  }
  daysEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-day]'); if (!b) return;
    selDay = b.dataset.day; openCard = null;
    render(true, '[data-day="' + CSS.escape(b.dataset.day) + '"]');
    tp.say('Suggestions for ' + b.textContent + '.');
    chipInView();
  });
  /* The day chips run off the right edge of the phone: a fade on whichever edge has more chips past it says so, and
     goes once the row is scrolled to that end. A picked chip is brought clear of the fade. */
  var FADE = 40;
  function fades() {
    var x = daysEl.scrollLeft, max = daysEl.scrollWidth - daysEl.clientWidth;
    daysEl.classList.toggle('is-more-l', x > 2);
    daysEl.classList.toggle('is-more-r', x < max - 2);
  }
  function chipInView() {
    var c = daysEl.querySelector('[aria-pressed="true"]'); if (!c) return;
    var l = c.offsetLeft - FADE, r = c.offsetLeft + c.offsetWidth + FADE - daysEl.clientWidth, x = daysEl.scrollLeft;
    var to = x > l ? l : x < r ? r : x;
    if (to !== x) daysEl.scrollTo({ left: Math.max(0, to), behavior: reduce.matches ? 'auto' : 'smooth' });
  }
  daysEl.addEventListener('scroll', fades, { passive: true });
  window.addEventListener('resize', fades);
  // Pick a team to tailor this: back up to the hand of cards, focus on the card in the middle
  phone.addEventListener('click', function (e) {
    if (!e.target.closest('[data-act="tailor"]')) return;
    var pick = document.getElementById('tp-pick'), card = document.querySelector('#tp-fan [tabindex="0"]');
    var top = pick.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 8;
    body.scrollTo({ top: Math.max(0, top), behavior: reduce.matches ? 'auto' : 'smooth' });
    if (card) card.focus({ preventScroll: true });
  });

  /* ---------- Full-screen pages: a product, or a place to watch (summarised) ----------
     The same pattern as the itinerary prototype's product page (.cn-pp): over the whole phone, a close cross and what
     it is at the top, a placeholder image, then the facts. Each has Add to timeline (in step with the card's Add) and
     View full page, which is not linked yet. Focus moves in and stays in; Escape or the cross closes it and focus goes
     back to what opened it. Gap fields keep the pink marker. */
  var WD_NAME = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }, WD_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  // "Daily 7am to 3pm" or "Thu to Sun 4pm to midnight", from the week's opening hours
  function weekHours(p) {
    var oh = (p.availability && p.availability.opening_hours) || [];
    if (!oh.length) return '';
    var days = WD_ORDER.filter(function (d) { return oh.some(function (o) { return o.day === d; }); }), o = oh[0];
    var same = oh.every(function (x) { return x.opens === o.opens && x.closes === o.closes; });
    var span = days.length === 7 ? 'Daily' : WD_NAME[days[0]] + ' to ' + WD_NAME[days[days.length - 1]];
    return same ? span + ', ' + clock(o.opens) + ' to ' + clock(o.closes) : span;
  }
  var pm = document.createElement('div'), pmBody, pmKind, pmOpen = null, pmBehind = [];
  pm.className = 'cn-pp tp-pm'; pm.id = 'tp-pm'; pm.hidden = true;
  pm.setAttribute('role', 'dialog'); pm.setAttribute('aria-modal', 'true'); pm.setAttribute('aria-labelledby', 'tp-pm-title');
  pm.innerHTML = '<div class="cn-bar"><button type="button" class="cn-close" data-pm-close aria-label="Close"><svg class="cn-x" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button><p class="cn-bar-title" id="tp-pm-kind"></p></div><div class="cn-pp-body" id="tp-pm-body" tabindex="-1"></div>';
  phone.appendChild(pm);
  pmBody = pm.querySelector('#tp-pm-body'); pmKind = pm.querySelector('#tp-pm-kind');
  function pmActions(id, label) {
    var on = added(id);
    return '<div class="tp-pm-acts"><button type="button" class="tp-pill tp-pm-add" data-pm-add="' + esc(id) + '" aria-pressed="' + on + '">' + (on ? '\u2713 Added to your timeline' : 'Add to your timeline') + '<span class="visually-hidden">, ' + esc(label) + '</span></button>' +
      '<span class="tp-pm-full" role="link" aria-disabled="true">View full page</span><span class="tp-pm-soon">Not linked yet</span></div>';
  }
  function pmProduct(id, x) {
    var p = x.p, f = x.f, h = '';
    h += '<div class="plan-modal-img ph-img" role="img" aria-label="Placeholder image of ' + esc(p.title) + '"></div><div class="plan-modal-body">';
    h += '<p class="tp-pm-type provenance-gap">' + esc(PTYPE[p.type] || 'Product') + '</p>';
    h += '<h2 class="cn-pp-title" id="tp-pm-title">' + esc(p.title) + '</h2>';
    h += '<p class="cn-pp-venue">' + esc(p.address.suburb) + ' \u00b7 near ' + esc(f.v) + ', ' + esc(f.d) + '</p>';
    h += '<p class="tp-pm-why provenance-gap">' + esc(x.why) + '</p>';
    h += '<h3 class="cn-pp-h">Practical details</h3><dl class="pl-option-facts cn-pp-facts">' +
      '<div><dt>Getting there</dt><dd><span class="provenance-gap">' + travel(p.distance_to_venue, f.v) + ' (' + p.distance_to_venue.km + ' km)</span></dd></div>' +
      '<div><dt>' + esc(f.d) + '</dt><dd><span class="provenance-gap">Open ' + clock(x.o.opens) + ' to ' + clock(x.o.closes) + '</span></dd></div>' +
      '<div><dt>Opening hours</dt><dd><span class="provenance-gap">' + esc(weekHours(p)) + '</span></dd></div>' +
      '<div><dt>Price</dt><dd><span class="provenance-gap">' + (p.pricing.is_free ? 'Free' : esc(p.pricing.band) + ' (price band)') + '</span></dd></div></dl>';
    h += pmActions(id, p.title + ' on ' + f.d) + '</div>';
    return h;
  }
  function pmSpot(id, x) {
    var sp = x.sp, f = x.m.f, h = '';
    // Summarised: what it is, where, what it shows for this match, and how many of your other matches it shows
    var others = tp.userMatches().filter(function (m) { return m.key !== x.m.key && Array.isArray(sp.shows) && sp.shows.indexOf(m.key) > -1; }).length;
    h += '<div class="plan-modal-img ph-img" role="img" aria-label="Placeholder image of ' + esc(sp.name) + '"></div><div class="plan-modal-body">';
    h += '<h2 class="cn-pp-title provenance-gap" id="tp-pm-title">' + esc(sp.name) + '</h2>';
    h += '<p class="cn-pp-venue provenance-gap">' + esc(sp.place) + '</p>';
    h += '<dl class="pl-option-facts cn-pp-facts tp-pm-summary">' +
      '<div><dt>Showing</dt><dd>' + esc(matchName(f)) + ', ' + esc(f.d) + ', ' + esc(f.k || 'time to be confirmed') + (f.a ? ' (played in ' + esc(f.a) + ')' : '') + '</dd></div>' +
      (others ? '<div><dt>Also shows</dt><dd><span class="provenance-gap">' + others + ' more of your matches</span></dd></div>' : '') +
      (sp.open_from && sp.open_to ? '<div><dt>Open</dt><dd><span class="provenance-gap">Daily, ' + esc(tp.isoRange(sp.open_from, sp.open_to)) + '</span></dd></div>' : '') +
      '</dl>';
    h += pmActions(id, sp.name + ' on ' + f.d) + '</div>';
    return h;
  }
  /* A match from All matches: the facts (date, Sydney kick-off, venue, city, in NSW or interstate), then what can be
     done with it. Add to my timeline puts that one match on the timeline even when neither team is picked (T12, a
     ticket for a match their team is not in). Add [team] to my teams does exactly what picking the card in the fan
     does. I have a ticket shows for any match with known teams; ticking it also puts the match on the timeline, as a
     ticket means they are going. Nothing here adds a team without its own button. */
  var pmSaid = '';
  function matchId(key) { return 'm:' + key; }
  function pmMatch(key) {
    var m = tp.match(key); if (!m) return '';
    var f = m.f, teams = f.t ? f.t.split(' v ') : [], h = '';
    var by = teams.filter(function (n) { return tp.isPicked(n); }), rugby = tp.rugby() && !f.a, on = added(matchId(key));
    var who = f.t ? teams.map(function (n) { return (tp.flag(n) ? '<span aria-hidden="true">' + tp.flag(n) + '</span> ' : '') + esc(n); }).join(' <span class="tp-pm-v">v</span> ') : esc(f.s);
    h += '<div class="plan-modal-body tp-pm-match">';
    h += '<p class="tp-pm-type">' + esc(f.t ? f.s.replace(/ \(\d+\)$/, '') : 'Teams to be decided') + '</p>';
    h += '<h2 class="cn-pp-title" id="tp-pm-title">' + who + '</h2>';
    h += (f.a ? '<span class="tp-tag tp-tag--away">Interstate: ' + esc(f.a) + '</span>' : '<span class="tp-tag">In NSW</span>');
    h += '<dl class="pl-option-facts cn-pp-facts tp-pm-summary">' +
      '<div><dt>Date</dt><dd>' + esc(f.d) + '</dd></div>' +
      '<div><dt>Kick-off</dt><dd>' + (f.k ? esc(f.k) + ' Sydney time' : 'Time to be confirmed') + '</dd></div>' +
      '<div><dt>Venue</dt><dd>' + esc(f.v) + '</dd></div>' +
      '<div><dt>City</dt><dd>' + esc(f.p) + (f.a ? ' (interstate)' : ', NSW') + '</dd></div></dl>';
    // On the timeline already, through a team or Here for the rugby: say so instead of offering to add it
    h += '<div class="tp-pm-acts tp-pm-acts--match">';
    if (by.length || rugby) h += '<p class="tp-pm-on">\u2713 On your timeline: ' + (by.length ? esc(tp.list(by)) + (by.length === 1 ? ' is one of your teams' : ' are your teams') : 'Here for the rugby includes every NSW match') + '</p>';
    else h += '<button type="button" class="tp-pill tp-pm-add" data-pm-match="' + esc(key) + '" aria-pressed="' + on + '">' + (on ? '\u2713 Added to my timeline' : 'Add to my timeline') + '<span class="visually-hidden">, ' + esc(matchName(f)) + ', ' + esc(f.d) + '</span></button>';
    if (f.t) h += '<label class="tp-ticket tp-pm-ticket"><input type="checkbox" data-pm-ticket="' + esc(m.tkey) + '"' + (state.tickets.indexOf(m.tkey) > -1 ? ' checked' : '') + ' /><span>I have a ticket</span></label>';
    h += '</div>';
    if (teams.length) {
      h += '<h3 class="cn-pp-h">Your teams</h3><div class="tp-pm-teams">' + teams.map(function (n) {
        return tp.isPicked(n) ? '<p class="tp-pm-team-on">\u2713 ' + esc(n) + ' is one of your teams</p>'
          : '<button type="button" class="tp-pm-team" data-pm-team="' + esc(n) + '">Add ' + esc(n) + ' to my teams</button>';
      }).join('') + '</div><p class="tp-pm-note">Adding a team adds all its matches, as picking its card does.</p>';
    }
    h += '<p class="tp-pm-said" aria-hidden="true">' + esc(pmSaid) + '</p></div>';
    return h;
  }
  function pmRefresh(focusSel) {
    if (!pmOpen || pmOpen.id.indexOf('match:') !== 0) return;
    pmBody.innerHTML = pmMatch(pmOpen.id.slice(6));
    var el = focusSel && pm.querySelector(focusSel);
    (el || pm.querySelector('[data-pm-team], [data-pm-match], [data-pm-ticket], [data-pm-close]')).focus({ preventScroll: true });
  }
  function openPm(id, opener) {
    var isMatch = id.indexOf('match:') === 0, x = isMatch ? { type: 'match', m: tp.match(id.slice(6)) } : MODAL[id];
    if (!x || (isMatch && !x.m)) return;
    pmSaid = '';
    pmBody.innerHTML = isMatch ? pmMatch(id.slice(6)) : x.type === 'product' ? pmProduct(id, x) : pmSpot(id, x);
    pmBody.scrollTop = 0;
    pmKind.textContent = isMatch ? 'Match' : x.type === 'product' ? 'Suits your 3rd half' : (SPOT_TYPE[x.sp.type] || 'Where to watch');
    pmOpen = { id: id, opener: opener && opener.dataset.open };
    pm.classList.toggle('is-match', isMatch);
    // Everything behind waits; remember what was already inert so closing puts it back as it was
    pmBehind = [body, document.getElementById('tp-tl'), document.getElementById('tp-tl-scrim')].filter(Boolean).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; });
    pm.hidden = false;
    pm.classList.remove('is-open', 'is-closing'); void pm.offsetWidth; pm.classList.add('is-open');
    pm.querySelector('[data-pm-close]').focus({ preventScroll: true });
    tp.say((isMatch ? matchName(x.m.f) + ', ' + x.m.f.d : x.type === 'product' ? x.p.title : x.sp.name) + ', page opened.');
    notesRefresh();
  }
  function closePm() {
    if (!pmOpen) return;
    var back = pmOpen.opener; pmOpen = null;
    pmBehind.forEach(function (pair) { pair[0].inert = pair[1]; });
    function done() { pm.hidden = true; pm.classList.remove('is-open', 'is-closing'); notesRefresh(); }
    if (reduce.matches || !pm.animate) done();
    else { pm.classList.add('is-closing'); pm.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(16px)' }], { duration: 180, easing: 'cubic-bezier(.4, 0, 1, 1)' }).onfinish = done; }
    var el = back && phone.querySelector('[data-open="' + CSS.escape(back) + '"]');
    if (el) el.focus({ preventScroll: true });
  }
  phone.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o && !pm.contains(o)) { openPm(o.dataset.open, o); return; }
  });
  pm.addEventListener('click', function (e) {
    if (e.target.closest('[data-pm-close]')) { closePm(); return; }
    // A match page's own actions
    var mb = e.target.closest('[data-pm-match]');
    if (mb) {
      var key = mb.dataset.pmMatch, f = tp.match(key).f, id = matchId(key), on = !added(id);
      if (on) tp.addItem({ id: id, kind: 'match', key: key, title: matchName(f), kindLabel: 'Match', day: f.d, place: f.v + ', ' + f.p });
      else tp.removeItem(id);
      pmSaid = on ? matchName(f) + ' is on your timeline, ' + f.d + '.' : matchName(f) + ' is off your timeline.';
      pmRefresh('[data-pm-match]');
      tp.say(pmSaid);
      return;
    }
    var tb = e.target.closest('[data-pm-team]');
    if (tb) {
      pmSaid = tp.pickTeam(tb.dataset.pmTeam) + '.';
      pmRefresh('[data-pm-team]');
      return; // the pick says its own line to screen readers
    }
    var b = e.target.closest('[data-pm-add]'); if (!b) return;
    var it = ITEMS[b.dataset.pmAdd]; if (!it) return;
    var on = !added(it.id);
    if (on) tp.addItem(Object.assign({}, it)); else tp.removeItem(it.id);
    // The page stays open; its button follows (the card behind updates with the page)
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.firstChild.textContent = on ? '\u2713 Added to your timeline' : 'Add to your timeline';
    tp.say(it.title + (on ? ' added to your timeline on ' + it.day + '. ' : ' removed from your timeline. ') + state.added.length + ' added.');
  });
  pm.addEventListener('change', function (e) {
    var cb = e.target.closest('[data-pm-ticket]'); if (!cb || !pmOpen) return;
    var key = pmOpen.id.slice(6), m = tp.match(key), f = m.f, mine = f.t.split(' v ').some(function (n) { return tp.isPicked(n); }) || (tp.rugby() && !f.a);
    // A ticket means they are going: the match goes on the timeline too, if no team of theirs puts it there already
    if (cb.checked && !mine && !added(matchId(key))) tp.addItem({ id: matchId(key), kind: 'match', key: key, title: matchName(f), kindLabel: 'Match', day: f.d, place: f.v + ', ' + f.p });
    tp.setTicket(m.tkey, cb.checked);
    pmSaid = cb.checked ? 'Ticket marked' + (mine ? '.' : '. The match is on your timeline.') : 'Ticket removed.';
    pmRefresh('[data-pm-ticket]');
    tp.say(pmSaid);
  });
  pm.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePm(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(pm.querySelectorAll('button, [href], input'), function (n) { return n.offsetParent !== null; });
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });

  /* ---------- Add and remove (both sections) ---------- */
  phone.addEventListener('click', function (e) {
    var out = e.target.closest('.tp-out');
    if (out && out.getAttribute('href') === '#') { e.preventDefault(); tp.say('Placeholder link: it goes to the listing\u2019s own website once real listings are in.'); return; }
    var b = e.target.closest('.tp-add'); if (!b || pm.contains(b)) return;
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
  /* What an answer changed: a line under the answer ("Suggestions now for 9 to 16 Oct. Updated below: …"), gone once
     the person moves on, and a brief tint on each section that changed, played as it comes into view (the sections
     sit below the question, often off screen when it is answered). */
  var askNews = '', SECS = { watch: document.getElementById('tp-watch'), third: document.getElementById('tp-third') }, pending = [];
  function snap() { return { watch: watchList.textContent + watchMore.textContent, third: daysEl.textContent + thirdList.textContent }; }
  function changedSince(before, lead, same) {
    var after = snap(), names = [];
    pending = [];
    if (before.watch !== after.watch) { names.push('Where to watch'); pending.push(SECS.watch); }
    if (before.third !== after.third) { names.push('Suits your 3rd half'); pending.push(SECS.third); }
    askNews = names.length ? lead + ' Updated on the page: ' + names.join(' and ') + '.' : (same || lead + ' Nothing on the page needed to change.');
    // The answer is given in the open timeline, over the page: the sections wait until it closes, then each is tinted
    // as it comes into view
    pending.forEach(function (sec) { sec.classList.remove('is-changed'); });
    if (!document.getElementById('tp-tl').classList.contains('is-open')) watchPending();
    return askNews;
  }
  function flash(sec) { sec.classList.remove('is-changed'); void sec.offsetWidth; sec.classList.add('is-changed'); }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      if (pending.indexOf(e.target) > -1) { pending.splice(pending.indexOf(e.target), 1); flash(e.target); }
    });
  }, { root: body, threshold: 0.12 }) : null;
  function watchPending() { pending.forEach(function (sec) { if (io) io.observe(sec); else flash(sec); }); }
  phone.addEventListener('tp:tlclose', watchPending);
  Object.keys(SECS).forEach(function (k) { if (SECS[k]) SECS[k].addEventListener('animationend', function () { SECS[k].classList.remove('is-changed'); }); });
  // The line stays until the person does something else on the page
  function dropNews(e) {
    if (!askNews || ask.contains(e.target)) return;
    askNews = '';
    var n = ask.querySelector('.tp-ask-news'); if (n) n.remove();
  }
  phone.addEventListener('pointerdown', dropNews);
  phone.addEventListener('keydown', dropNews);
  phone.addEventListener('focusin', dropNews); // tabbing on past the answer counts as moving on
  // From what they have already done: their first to last match in NSW (and any ticket). Nothing to go on without a pick.
  function inferred() { return tp.inferTrip(); }
  function fork(mode) {
    var t = trip(), cur = t ? t.mode : null;
    var B = function (m, label) { return '<button type="button" class="tp-chip tp-fork" data-mode="' + m + '" aria-pressed="' + (cur === m) + '">' + label + '</button>'; };
    return '<div class="tp-forks" role="group" aria-label="Visiting or local">' + B('visiting', 'Visiting NSW') + B('local', 'I live in NSW') + B('unsure', 'Not sure yet') + '</div>';
  }
  // An answer given elsewhere (That's right in the open timeline) closes the question here too: never ask twice
  var lastTrip = JSON.stringify(state.trip), askOwn = false;
  function renderAsk() {
    var tj = JSON.stringify(state.trip);
    if (tj !== lastTrip && !askOwn && state.trip && (state.trip.mode !== 'visiting' || (state.trip.from && state.trip.to))) { askEditing = false; askManual = false; askError = ''; }
    lastTrip = tj; askOwn = false;
    var t = trip(), done = t && (t.mode !== 'visiting' || (t.from && t.to)) && !askEditing, h;
    if (done) {
      var what = t.mode === 'local' ? 'I’m local' : t.mode === 'unsure' ? 'Not sure yet' : 'In NSW ' + tp.isoRange(t.from, t.to);
      h = '<p class="tp-ask-sum"><span class="tp-ask-sum-text">' + esc(what) + '</span> · <button type="button" class="tp-link" data-act="change">Change</button></p>' +
        (askNews ? '<p class="tp-ask-news">' + esc(askNews) + '</p>' : '');
    } else {
      h = '<h3 class="tp-ask-title" id="tp-ask-title">Visiting or local?</h3>' +
        '<p class="tp-sec-note">Optional. One tap sharpens the suggestions on the page.</p>' + fork();
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
    var t = trip(), h0 = ask.offsetHeight, before = snap(); // measured before anything changes, so the change can glide
    askNews = '';
    if (b.dataset.mode) {
      var mode = b.dataset.mode;
      askManual = false; askError = '';
      if (mode === 'visiting') {
        // Keep dates already set; otherwise the guess shows next
        // Dates already set show in the fields to adjust; otherwise the guess shows next
        askEditing = true; askManual = !!(t && t.mode === 'visiting' && t.from);
        askOwn = true; tp.setTrip({ mode: 'visiting', from: t && t.mode === 'visiting' ? t.from : undefined, to: t && t.mode === 'visiting' ? t.to : undefined });
        settle('[data-mode="visiting"]', h0);
        tp.say('Visiting NSW.');
      } else {
        askEditing = false;
        askOwn = true; tp.setTrip({ mode: mode });
        var said = mode === 'local' ? changedSince(before, 'Suggestions now for a local: nearest first, no dates needed.')
          : changedSince(before, 'Suggestions back to your match days, no dates.', 'Nothing changes. You can answer any time.');
        settle('[data-act="change"]', h0);
        tp.say(said);
      }
      return;
    }
    var act = b.dataset.act;
    if (act === 'change') { askEditing = true; askManual = false; settle('.tp-fork[aria-pressed="true"], .tp-fork', h0); return; }
    if (act === 'adjust') { askManual = true; settle('#tp-from', h0); return; }
    if (act === 'confirm') {
      var inf = inferred();
      askEditing = false;
      askOwn = true; tp.setTrip({ mode: 'visiting', from: inf.from, to: inf.to });
      var said1 = changedSince(before, 'Suggestions now for ' + tp.isoRange(inf.from, inf.to) + '.');
      settle('[data-act="change"]', h0);
      tp.say(said1);
      return;
    }
    if (act === 'use') {
      var a = document.getElementById('tp-from').value, z = document.getElementById('tp-to').value;
      if (!a || !z) { askError = 'Add both days, or leave this for later: everything works without them.'; settle(a ? '#tp-to' : '#tp-from', h0); return; }
      if (z < a) { askError = 'The last day is before the first day.'; settle('#tp-to', h0); return; }
      askError = ''; askEditing = false; askManual = false;
      askOwn = true; tp.setTrip({ mode: 'visiting', from: a, to: z });
      var said2 = changedSince(before, 'Suggestions now for ' + tp.isoRange(a, z) + '.');
      settle('[data-act="change"]', h0);
      tp.say(said2);
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
  /* The question is answered in the open timeline. Opening it there: with the choice showing (Change), and focus on the
     current answer or the first choice. */
  function openAsk() {
    askEditing = true; askManual = false;
    render(true);
    tp.openTimeline('.tp-fork[aria-pressed="true"], .tp-fork');
  }
  phone.addEventListener('tp:ask', openAsk);
  /* The line under Suits your 3rd half: the way to the question while it is unanswered, then the answer and Change */
  function renderTripLine() {
    if (!tripEl) return;
    var t = trip(), done = t && (t.mode !== 'visiting' || (t.from && t.to));
    var what = !done ? '' : t.mode === 'local' ? 'You live in NSW' : t.mode === 'unsure' ? 'Not sure yet if you\u2019re visiting' : 'Your days in NSW: ' + tp.isoRange(t.from, t.to);
    tripEl.innerHTML = done ? '<span class="tp-third-trip-a">' + esc(what) + '</span> \u00b7 <button type="button" class="tp-link" data-act="trip">Change</button>'
      : '<button type="button" class="tp-link tp-third-trip-ask" data-act="trip">' + (t && t.mode === 'visiting' ? 'Visiting? Confirm your days to see what fits' : 'Visiting? Set your days to see what fits') + '</button>';
  }
  phone.addEventListener('click', function (e) { if (e.target.closest('#tp-third-trip [data-act="trip"]')) openAsk(); });

  // From the results' interstate note: down to the screenings of their matches
  var toWatch = document.getElementById('tp-to-watch');
  if (toWatch) toWatch.addEventListener('click', function () {
    var w = document.getElementById('tp-watch'), top = w.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16;
    body.scrollTo({ top: Math.max(0, top), behavior: reduce.matches ? 'auto' : 'smooth' });
    document.getElementById('tp-watch-title').setAttribute('tabindex', '-1');
    document.getElementById('tp-watch-title').focus({ preventScroll: true });
  });

  /* ---------- Your plan so far: the end of the page ---------- */
  var planBody = document.getElementById('tp-plan-body'), copied = false;
  function planText() {
    var t = trip(), lines = ['My Rugby World Cup 2027 plan (Plan your 3rd half)'];
    if (t && t.mode === 'visiting' && t.from && t.to) lines.push('In NSW ' + tp.isoRange(t.from, t.to));
    else if (t && t.mode === 'local') lines.push('I live in NSW');
    if (tp.own()) {
      lines.push('', 'Matches (kick-off times are Sydney time):');
      tp.userMatches().forEach(function (m) {
        var f = m.f;
        lines.push('- ' + f.d + ', ' + (f.k || 'time to be confirmed') + ': ' + matchName(f) + ', ' + f.v + ', ' + f.p + (f.a ? ' (interstate)' : '') + (hasTicket(m) ? ' (ticket)' : ''));
      });
    }
    var things = state.added.filter(function (it) { return it.kind !== 'match'; });
    if (things.length) {
      lines.push('', 'Added:');
      things.forEach(function (it) { lines.push('- ' + it.day + ': ' + it.title + (it.place ? ', ' + it.place : '') + (it.matchName ? ' (for ' + it.matchName + ')' : '')); });
      lines.push('', 'Places are placeholders in this prototype, not real listings.');
    }
    return lines.join('\n');
  }
  function renderPlan() {
    if (!planBody) return;
    var t = trip(), ms = tp.own() ? tp.userMatches() : [], n = state.added.filter(function (it) { return it.kind !== 'match'; }).length;
    if (!ms.length && !n) {
      planBody.innerHTML = '<p class="tp-plan-empty">Pick a team, or add a screening or a place above, and your plan builds up here.</p>';
      return;
    }
    var nsw = ms.filter(function (m) { return !m.f.a; }).length, tk = ms.filter(hasTicket).length;
    var when = t && t.mode === 'visiting' && t.from && t.to ? 'In NSW ' + tp.isoRange(t.from, t.to) : t && t.mode === 'local' ? 'Local' : '';
    var facts = [];
    if (ms.length) facts.push('<li>' + tp.countPhrase(ms.map(function (m) { return m.f; }), { num: function (x) { return '<strong>' + x + '</strong>'; } }) + ', ' + (nsw === ms.length ? 'all in NSW' : nsw ? nsw + ' in NSW' : 'all interstate') + (tk ? ', ' + tk + (tk === 1 ? ' ticket' : ' tickets') : '') + '</li>');
    facts.push('<li><strong>' + n + '</strong> ' + (n === 1 ? 'thing' : 'things') + ' added</li>');
    if (when) facts.push('<li>' + esc(when) + '</li>');
    planBody.innerHTML = '<ul class="tp-plan-facts">' + facts.join('') + '</ul>' +
      '<div class="tp-plan-acts"><button type="button" class="tp-plan-btn tp-plan-btn--primary" data-plan="open">Open your timeline</button>' +
      '<button type="button" class="tp-plan-btn" data-plan="copy">' + (copied ? 'Copied' : 'Copy plan') + '</button></div>' +
      '<p class="tp-plan-note">Copies as plain text for your notes or a message. Nothing leaves this device unless you paste it.</p>';
  }
  if (planBody) planBody.addEventListener('click', function (e) {
    var b = e.target.closest('[data-plan]'); if (!b) return;
    if (b.dataset.plan === 'open') { tp.openTimeline(); return; }
    var text = planText();
    function done() {
      copied = true; render(true, '[data-plan="copy"]');
      tp.say('Plan copied. Paste it into your notes or a message.');
      setTimeout(function () { copied = false; render(true); }, 2400);
    }
    function fallback() {
      // Copying is blocked: show the text selected, to copy by hand
      planBody.insertAdjacentHTML('beforeend', '<label class="tp-plan-fallback"><span>Copying is blocked here. The text is selected: copy it with your device\u2019s Copy.</span><textarea readonly rows="6"></textarea></label>');
      var ta = planBody.querySelector('textarea'); ta.value = text; ta.focus(); ta.select();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  });

  /* ---------- Render: only when something it depends on changed ---------- */
  var sig = '', seen = {}, whys = {};
  function signature() {
    return JSON.stringify([state.picked, state.tickets, state.trip, state.added.map(function (x) { return x.id; }), state.tab, selDay, watchAll, askEditing, askManual, askError, openCard, copied]);
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
      else if (active.dataset.mode) keep = '.tp-fork[data-mode="' + CSS.escape(active.dataset.mode) + '"]';
      else if (active.dataset.act === 'trip') keep = '#tp-third-trip [data-act="trip"]';
      else if (active.dataset.open && !pm.contains(active)) keep = '[data-open="' + CSS.escape(active.dataset.open) + '"]';
    }
    ITEMS = {}; MODAL = {};
    renderWatch();
    renderThird();
    renderTripLine();
    fades();
    renderAsk();
    renderPlan();
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
  if (resetBtn) resetBtn.addEventListener('click', function () { closePm(); selDay = null; watchAll = false; openCard = null; askEditing = false; askManual = false; askError = ''; seen = {}; whys = {}; render(true); });
  render(true);
})();
