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
  var thirdList = document.getElementById('tp-third-list'), thirdNote = document.getElementById('tp-third-note');
  var watchNote = document.getElementById('tp-watch-note'), watchNoteText = watchNote ? watchNote.textContent : '';
  var ask = document.getElementById('tp-ask'), tripEl = document.getElementById('tp-third-trip');
  if (!watchList || !thirdList || !ask) return;

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
  // key: what the card's button looks up in ITEMS; the item it adds can have its own id (a trip card is keyed by
  // trip and free stretch, the trip itself is one item in the plan)
  function addBtn(id, label) {
    var on = added(ITEMS[id] ? ITEMS[id].id : id);
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
  /* ---------- Around your matches: the fan's days in NSW, in order ----------
     Not date pills: blocks with plain headings, in time order. Two kinds, plus the edges:
     - a match day (Before the match, After the final whistle, Near the stadium, as before);
     - a free stretch ("4 free days · Tue 12 to Fri 15 Oct"): one or two free days get day trips; three or more get
       longer trips first, then day trips; an interstate match of theirs that evening is a screening, linked to Where
       to watch;
     - the first and last day of a stay are half days (arrival, departure): only things near the base, never counted
       towards a free stretch; a day away for an interstate match they have a ticket for splits the stretch.
     Where the days come from: the confirmed days in NSW; otherwise first to last NSW match, as a guess to confirm
     (never for Here for the rugby, where that would be six weeks); otherwise match days only, with a nudge to the
     timeline question. I live in NSW: no free stretches; each match day gets Make a day of it.
     Only the next block is open; the rest open from their heading. At most three suggestions each, then Show more.
     Nothing is added for them, and a free stretch can stay empty. Trips are curated by the DNSW team (cnTrips,
     fixture-only, pink); trips and stops are sorted by travel time, then name. Links go out only. */
  var TRIPS = Array.isArray(window.cnTrips) ? window.cnTrips : [];
  var WD_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var CITY = { sydney: 'Sydney', newcastle: 'Newcastle' }, MODE = { train: 'by train', car: 'by car', coach: 'by coach' };
  var openSet = null, blkSig = '', moreBlk = {}, moveOpen = null;
  function dayLabel(d) { var x = new Date(Date.UTC(2027, 9, 1 + d)); return WD_SHORT[x.getUTCDay()] + ' ' + x.getUTCDate() + ' ' + MONTHS[x.getUTCMonth()]; }
  function spanLabel(a, z) { return a === z ? dayLabel(a) : WD_SHORT[new Date(Date.UTC(2027, 9, 1 + a)).getUTCDay()] + ' ' + tp.isoRange(isoOf(a), isoOf(z)).replace(' to ', ' to ' + WD_SHORT[new Date(Date.UTC(2027, 9, 1 + z)).getUTCDay()] + ' '); }
  function cityOf(venue) { return /Newcastle/.test(venue || '') ? 'newcastle' : 'sydney'; }
  function mins(m) { return m < 60 ? m + ' min' : m % 60 ? Math.floor(m / 60) + ' hr ' + (m % 60) + ' min' : (m / 60) + ' hr'; }
  // Worked out from the stops, not written by hand: the days every stop is open, and the dearest stop's price band
  function tripDays(t) { return WD_ORDER.filter(function (wd) { return t.stops.every(function (s) { return s.days.indexOf(wd) > -1; }); }); }
  function tripBand(t) { return t.stops.reduce(function (b, s) { return s.band.length > b.length ? s.band : b; }, '') || 'free'; }
  function tripFrom(t, base) { return t.travel[base] ? base : Object.keys(t.travel)[0]; }
  function tripMins(t, base) { return t.travel[tripFrom(t, base)].minutes; }
  function getThere(t, base) { var b = tripFrom(t, base), tr = t.travel[b]; return mins(tr.minutes) + ' ' + (MODE[tr.mode] || '') + ' from ' + CITY[b]; }
  function fitsDay(t, d) { return tripDays(t).indexOf(weekdayOf(d)) > -1; }
  // Valid starts in a stretch: a day trip on any free day it runs; a longer trip so it ends with a free day to spare
  function starts(t, b) {
    var out = [];
    if (t.kind === 'day') { for (var d = b.a; d <= b.z; d++) if (fitsDay(t, d)) out.push(d); }
    else for (var s = b.a; s + t.nights <= b.z - 1; s++) out.push(s);
    return out;
  }

  function model() {
    var t = trip(), local = !!(t && t.mode === 'local'), rugby = tp.rugby(), own = tp.own();
    var ms = own ? tp.userMatches() : [], nsw = ms.filter(function (m) { return !m.f.a; });
    var days = {}; nsw.forEach(function (m) { days[m.day] = true; });
    var nd = Object.keys(days).map(Number).sort(function (x, y) { return x - y; });
    var range = null, how = 'none';
    if (t && t.mode === 'visiting' && t.from && t.to) { range = { a: tp.isoDay(t.from), z: tp.isoDay(t.to) }; how = 'confirmed'; }
    else if (!local && own && !rugby && nd.length >= 2) { range = { a: nd[0], z: nd[nd.length - 1] }; how = 'guessed'; }
    else if (!local && own && !rugby && nd.length === 1) how = 'one';
    return { t: t, local: local, rugby: rugby, own: own, ms: ms, nsw: nsw, range: range, how: how };
  }
  function matchBlocks(list) {
    var by = {}, out = [];
    list.forEach(function (m) { (by[m.day] = by[m.day] || []).push(m); });
    Object.keys(by).map(Number).sort(function (x, y) { return x - y; }).forEach(function (d) { out.push({ kind: 'match', key: 'm' + d, day: d, ms: by[d] }); });
    return out;
  }
  function blocks(M) {
    if (!M.own && !M.range) { var d0 = nswDays()[0]; return d0 ? matchBlocks(tp.allMatches().filter(function (m) { return !m.f.a && m.day === d0.m.day; })).slice(0, 1) : []; }
    if (!M.range) {
      // Match days only: theirs in NSW, or (a team that plays only interstate) the NSW matches they could go to
      return matchBlocks(M.nsw.length ? M.nsw : tp.allMatches().filter(function (m) { return !m.f.a; }));
    }
    var a = M.range.a, z = M.range.z, by = {}, out = [], st = null;
    M.ms.forEach(function (m) { if (m.day >= a && m.day <= z) (by[m.day] = by[m.day] || []).push(m); });
    // Here for the rugby watches every interstate match too
    if (M.rugby) tp.allMatches().forEach(function (m) { if (m.f.a && m.day >= a && m.day <= z) (by[m.day] = by[m.day] || []).push(m); });
    function close() { if (st) { out.push(st); st = null; } }
    for (var d = a; d <= z; d++) {
      var dm = by[d] || [], home = dm.filter(function (m) { return !m.f.a; }), away = dm.filter(function (m) { return m.f.a && hasTicket(m); });
      if (home.length) { close(); out.push({ kind: 'match', key: 'm' + d, day: d, ms: home }); continue; }
      if (away.length) { close(); out.push({ kind: 'away', key: 'a' + d, day: d, m: away[0] }); continue; }
      if (a !== z && (d === a || d === z)) { close(); out.push({ kind: 'half', key: 'h' + d, day: d, first: d === a }); continue; }
      if (!st) st = { kind: 'free', key: 'f' + d, a: d, z: d, watch: [] };
      st.z = d;
      dm.filter(function (m) { return m.f.a && m.f.t; }).forEach(function (m) { st.watch.push(m); });
    }
    close();
    // Base for each stretch and half day: from the matches either side (Sydney or Newcastle)
    out.forEach(function (b, i) {
      if (b.kind !== 'free' && b.kind !== 'half') return;
      var p = null, n = null;
      for (var j = i - 1; j >= 0; j--) if (out[j].kind === 'match') { p = out[j]; break; }
      for (j = i + 1; j < out.length; j++) if (out[j].kind === 'match') { n = out[j]; break; }
      var pc = p && cityOf(p.ms[0].f.v), nc = n && cityOf(n.ms[0].f.v);
      b.base = b.kind === 'half' ? (b.first ? nc || pc : pc || nc) || 'sydney' : pc || nc || 'sydney';
      b.between = !!(pc && nc && pc !== nc);
    });
    return out;
  }

  // Match day groups, as before: Before the match, After the final whistle, Near the stadium
  function productCard(p, why, id, f) {
    return '<article class="tp-pc" data-id="' + esc(id) + '">' +
      '<button type="button" class="tp-pc-main" data-open="' + esc(id) + '" aria-haspopup="dialog">' +
      '<span class="ph-img tp-pc-img" aria-hidden="true"></span><span class="tp-pc-body"><span class="tp-pc-title">' + esc(p.title) + '</span>' +
      '<span class="tp-pc-type provenance-gap">' + esc(PTYPE[p.type] || 'Product') + '</span>' +
      '<span class="tp-pc-why provenance-gap" data-why="' + esc(why) + '">' + esc(why) + '</span></span></button>' +
      addBtn(id, p.title + ' on ' + f.d) + '</article>';
  }
  function matchBody(b, M) {
    var m = b.ms.filter(hasTicket)[0] || b.ms[0], f = m.f, wd = weekdayOf(m.day), k = kickMins(f.k), d = { m: m };
    var groups = { before: [], after: [], near: [] }, h = '';
    if (b.ms.length > 1) h += '<p class="tp-blk-note">Also in NSW that day: ' + b.ms.filter(function (x) { return x !== m; }).map(function (x) { return esc(matchName(x.f)) + ', ' + esc(x.f.k || 'time to be confirmed') + ', ' + esc(x.f.v); }).join('; ') + '.</p>';
    PRODUCTS.filter(function (p) { return p.distance_to_venue && p.distance_to_venue.venue_ref === f.v; }).forEach(function (p) {
      var o = hoursOn(p, wd);
      if (!o) return; // closed that day: not a fit, so not shown
      var g = 'near';
      if (k !== null) {
        var bb = openAt(o, k - 90), aa = openAt(o, Math.min(1439, k + 150));
        g = bb && aa ? 'near' : bb ? 'before' : aa ? 'after' : hm(o.opens) < k ? 'before' : 'after';
      }
      groups[g].push({ p: p, o: o });
    });
    var LABEL = { before: 'Before the match', after: 'After the final whistle', near: 'Near the stadium' }, any = false;
    ['before', 'after', 'near'].forEach(function (g) {
      var list = groups[g].sort(function (x, y) { return (x.p.distance_to_venue.km - y.p.distance_to_venue.km) || x.p.title.localeCompare(y.p.title); });
      if (!list.length) return;
      any = true;
      h += '<h5 class="tp-grp">' + LABEL[g] + '</h5><div class="tp-pcs">';
      list.forEach(function (x) {
        var p = x.p, id = 'p:' + p.id + ':' + f.d, why = reason(p, x.o, d);
        ITEMS[id] = { id: id, kind: 'product', title: p.title, kindLabel: PTYPE[p.type] || 'Product', place: p.address && p.address.suburb, day: f.d, matchName: matchName(f) };
        MODAL[id] = { type: 'product', p: p, f: f, o: x.o, why: why };
        h += productCard(p, why, id, f);
      });
      h += '</div>';
    });
    if (!any) h += '<p class="tp-empty">Nothing listed near ' + esc(f.v) + ' is open on ' + esc(f.d) + ' yet.</p>';
    // A local makes a day of it: the attractions around that stadium, and on a weekend the other weekend day too
    if (M.local) {
      h += '<h5 class="tp-grp">Make a day of it</h5>';
      var base = cityOf(f.v), other = wd === 'sat' ? m.day + 1 : wd === 'sun' ? m.day - 1 : null;
      var near = PRODUCTS.filter(function (p) { return p.type === 'attraction' && p.distance_to_venue && cityOf(p.distance_to_venue.venue_ref) === base && hoursOn(p, wd); })
        .sort(function (x, y) { return x.distance_to_venue.km - y.distance_to_venue.km || x.title.localeCompare(y.title); }).slice(0, 2);
      h += '<div class="tp-pcs">' + near.map(function (p) { var id = 'p:' + p.id + ':' + f.d, o = hoursOn(p, wd), why = reason(p, o, d); ITEMS[id] = { id: id, kind: 'product', title: p.title, kindLabel: PTYPE[p.type] || 'Product', place: p.address.suburb, day: f.d, matchName: matchName(f) }; MODAL[id] = { type: 'product', p: p, f: f, o: o, why: why }; return productCard(p, why, id, f); }).join('') + '</div>';
      // Not when the other weekend day is one of their match days too
      if (other !== null && M.nsw.some(function (x) { return x.day === other; })) other = null;
      if (other !== null) {
        var ts = TRIPS.filter(function (t) { return t.kind === 'day' && t.bases.indexOf(base) > -1 && fitsDay(t, other); }).sort(byTravel(base)).slice(0, 2);
        if (ts.length) h += '<p class="tp-blk-sub">Make a weekend of it: ' + esc(dayLabel(other)) + '</p><div class="tp-pcs">' + ts.map(function (t) { return tripCard(t, { a: other, z: other, base: base, key: b.key }, other); }).join('') + '</div>';
      }
    }
    return h;
  }
  function byTravel(base) { return function (x, y) { return tripMins(x, base) - tripMins(y, base) || x.title.localeCompare(y.title); }; }
  /* One card per trip and free stretch (key), so its Fits line and its Add always mean this stretch; the trip itself is
     one item in the plan (id). Added in this stretch: where it went, and Move. Added elsewhere: where it is, and Move
     here. */
  function tripCard(t, b, at) {
    var id = 't:' + t.id, key = id + '@' + b.key, s = at !== undefined ? at : starts(t, b)[0], n = b.z - b.a + 1;
    var fits = t.kind === 'day' ? 'Fits ' + dayLabel(s) : 'Fits ' + t.nights + (t.nights === 1 ? ' night' : ' nights') + ' of your ' + n;
    var why = [fits, getThere(t, b.base), tripBand(t)].join(' · ');
    ITEMS[key] = { id: id, kind: 'trip', trip: t.kind, tripId: t.id, title: t.region, kindLabel: (t.kind === 'day' ? 'Day trip' : 'Longer trip') + ', curated by Destination NSW', place: getThere(t, b.base),
      day: dayLabel(s), endDay: t.kind === 'long' ? dayLabel(s + t.nights) : null, nights: t.nights || 0, start: s, when: t.kind === 'long' ? spanLabel(s, s + t.nights) : dayLabel(s) };
    MODAL[key] = { type: 'trip', t: t, b: b, why: why };
    var it = state.added.filter(function (x) { return x.id === id; })[0], line = '';
    var here = it && it.start >= b.a && it.start <= b.z, cl = it && tp.clashes()[id];
    if (it && !here) {
      // Already in the plan, in another free stretch: say where, and offer to bring it here
      line = '<p class="tp-trip-added">In your plan on ' + esc(it.nights ? spanLabel(it.start, it.start + it.nights) : it.day) +
        ' \u00b7 <button type="button" class="tp-link" data-move-to="' + s + '" data-move-id="' + esc(id) + '">Move here</button></p>';
    } else if (it) {
      // Says where it went, and offers the other valid starts in this stretch
      var other = starts(t, b).filter(function (x) { return x !== it.start; });
      line = '<p class="tp-trip-added">Added: ' + esc(t.region) + ', ' + esc(it.nights ? spanLabel(it.start, it.start + it.nights) : it.day) +
        (other.length ? ' \u00b7 <button type="button" class="tp-link" data-move="' + esc(key) + '" aria-expanded="' + (moveOpen === key) + '">Move</button>' : '') + '</p>' +
        (cl ? '<p class="tp-trip-clash">' + esc(clashText(cl)) + '</p>' : '') +
        (moveOpen === key ? '<div class="tp-move" role="group" aria-label="Move ' + esc(t.region) + ' to start on">' + other.map(function (x) {
          return '<button type="button" class="tp-chip" data-move-to="' + x + '" data-move-id="' + esc(id) + '">' + esc(t.kind === 'long' ? spanLabel(x, x + t.nights) : dayLabel(x)) + '</button>';
        }).join('') + '</div>' : '');
    }
    return '<article class="tp-pc tp-trip' + (t.kind === 'long' ? ' tp-trip--long' : '') + '" data-id="' + esc(key) + '">' +
      '<button type="button" class="tp-pc-main" data-open="' + esc(key) + '" aria-haspopup="dialog">' +
      '<span class="ph-img tp-pc-img" aria-hidden="true"></span><span class="tp-pc-body"><span class="tp-pc-title provenance-gap">' + esc(t.title) + '</span>' +
      '<span class="tp-pc-type provenance-gap">' + (t.kind === 'day' ? 'Day trip' : 'Longer trip') + ' · Curated by Destination NSW</span>' +
      '<span class="tp-pc-why provenance-gap" data-why="' + esc(why) + '">' + esc(why) + '</span></span></button>' +
      addBtn(key, t.region + ', ' + (t.kind === 'day' ? 'day trip' : 'longer trip')) + line + '</article>';
  }
  // "Clashes with Italy v Romania, Mon 11 Oct" (a match), or "with Blue Mountains, Sun 17 Oct" (another trip)
  function clashText(cl) { return 'Clashes with ' + tp.list(cl.map(function (c) { return c.name + ', ' + c.day; })) + '.'; }
  /* Where a trip can go now: every valid start in every free stretch it suits, for Move in the timeline's detail (a
     trip whose stretch has split has no card on the page any more) */
  function tripMoves(id) {
    var it = state.added.filter(function (x) { return x.id === id; })[0]; if (!it) return [];
    var t = TRIPS.filter(function (x) { return x.id === it.tripId; })[0]; if (!t) return [];
    var out = [];
    blocks(model()).forEach(function (b) {
      if (b.kind !== 'free' || (t.kind === 'long' && (b.z - b.a + 1 < 3 || !(t.bases.indexOf(b.base) > -1 || (b.between && t.on_the_way))))) return;
      if (t.kind === 'day' && t.bases.indexOf(b.base) < 0) return;
      starts(t, b).forEach(function (x) { if (x !== it.start) out.push({ start: x, label: t.kind === 'long' ? spanLabel(x, x + t.nights) : dayLabel(x) }); });
    });
    return out.slice(0, 6);
  }
  function moveTrip(id, s) {
    var cur = state.added.filter(function (x) { return x.id === id; })[0]; if (!cur) return;
    var nu = Object.assign({}, cur, { start: s, day: dayLabel(s), endDay: cur.nights ? dayLabel(s + cur.nights) : null, when: cur.nights ? spanLabel(s, s + cur.nights) : dayLabel(s) });
    tp.removeItem(id); tp.addItem(nu); moveOpen = null;
    render(true);
    tp.say(cur.title + ' moved to ' + nu.when + '.');
  }
  tp.tripMoves = tripMoves; tp.moveTrip = moveTrip;
  function freeBody(b) {
    var n = b.z - b.a + 1, h = '';
    b.watch.forEach(function (m) {
      h += '<p class="tp-blk-watch">' + esc(dayLabel(m.day)) + ' evening: <button type="button" class="tp-link" data-watch="' + esc(m.key) + '">watch ' + esc(matchName(m.f)) + ' in NSW</button></p>';
    });
    var longs = n >= 3 ? TRIPS.filter(function (t) { return t.kind === 'long' && starts(t, b).length && (t.bases.indexOf(b.base) > -1 || (b.between && t.on_the_way)); }) : [];
    var days = TRIPS.filter(function (t) { return t.kind === 'day' && t.bases.indexOf(b.base) > -1 && starts(t, b).length; });
    longs.sort(function (x, y) { return (b.between ? (y.on_the_way ? 1 : 0) - (x.on_the_way ? 1 : 0) : 0) || byTravel(b.base)(x, y); });
    days.sort(byTravel(b.base));
    var all = longs.concat(days), show = moreBlk[b.key] ? all : all.slice(0, 3);
    if (b.between && longs.some(function (t) { return t.on_the_way; })) h += '<p class="tp-blk-note">Between a Newcastle match and a Sydney match: something on the way.</p>';
    if (!all.length) h += '<p class="tp-empty">Nothing curated fits these days yet. Free days can stay free.</p>';
    else h += '<div class="tp-pcs">' + show.map(function (t) { return tripCard(t, b); }).join('') + '</div>';
    if (all.length > 3) h += '<button type="button" class="tp-link tp-blk-more" data-more="' + esc(b.key) + '" aria-expanded="' + !!moreBlk[b.key] + '">' + (moreBlk[b.key] ? 'Show fewer' : 'Show ' + (all.length - 3) + ' more') + '</button>';
    return h;
  }
  function halfBody(b) {
    var wd = weekdayOf(b.day), f = { d: dayLabel(b.day) };
    var list = PRODUCTS.filter(function (p) { return p.distance_to_venue && cityOf(p.distance_to_venue.venue_ref) === b.base && hoursOn(p, wd) && (p.type === 'food_and_drink' || p.type === 'attraction'); })
      .sort(function (x, y) { return x.distance_to_venue.km - y.distance_to_venue.km || x.title.localeCompare(y.title); });
    var show = moreBlk[b.key] ? list : list.slice(0, 3);
    var h = '<p class="tp-blk-note">' + (b.first ? 'Arrival day' : 'Last day') + ': something near your base in ' + CITY[b.base] + ', nothing far.</p><div class="tp-pcs">';
    show.forEach(function (p) {
      var o = hoursOn(p, wd), id = 'p:' + p.id + ':' + f.d, why = ['Open ' + f.d + ', ' + clock(o.opens) + ' to ' + clock(o.closes), p.pricing.is_free ? 'free' : p.pricing.band, p.address.suburb].filter(Boolean).join(' · ');
      ITEMS[id] = { id: id, kind: 'product', title: p.title, kindLabel: PTYPE[p.type] || 'Product', place: p.address.suburb, day: f.d };
      MODAL[id] = { type: 'product', p: p, f: { d: f.d, v: CITY[b.base] }, o: o, why: why };
      h += productCard(p, why, id, f);
    });
    h += '</div>';
    if (list.length > 3) h += '<button type="button" class="tp-link tp-blk-more" data-more="' + esc(b.key) + '" aria-expanded="' + !!moreBlk[b.key] + '">' + (moreBlk[b.key] ? 'Show fewer' : 'Show ' + (list.length - 3) + ' more') + '</button>';
    return h;
  }
  function heading(b) {
    if (b.kind === 'match') { var m = b.ms.filter(hasTicket)[0] || b.ms[0], f = m.f; return { when: dayLabel(b.day) + ' · Match day', what: matchName(f) + ', ' + (f.k || 'time to be confirmed') + ', ' + f.v + (hasTicket(m) ? ' (your ticket)' : '') }; }
    if (b.kind === 'free') { var n = b.z - b.a + 1; return { when: n + (n === 1 ? ' free day' : ' free days') + ' · ' + spanLabel(b.a, b.z), what: b.between ? 'Between Newcastle and Sydney' : 'From ' + CITY[b.base] }; }
    if (b.kind === 'half') return { when: dayLabel(b.day) + ' · ' + (b.first ? 'Arrival day' : 'Last day'), what: 'Half a day, near your base' };
    return { when: dayLabel(b.day) + ' · Away', what: matchName(b.m.f) + ' in ' + b.m.f.a + ' (your ticket)' };
  }
  function renderThird() {
    // With no team but their days set (T16), the days still lead: free stretches with day trips and longer trips
    var M = model(), bs = blocks(M), first = teaser() && !M.range;
    if (thirdNote) thirdNote.textContent = first ? 'A first look: around the next NSW match day. Each links out; nothing is booked here.'
      : M.range ? 'Your days in NSW, in order: match days and the free days between them. Each links out; nothing is booked here.'
      : M.own && !M.nsw.length && !M.local ? tp.list(state.picked.filter(function (n) { return tp.teams[n]; })) + ' plays interstate, so these are the NSW match days you could go to. Each links out; nothing is booked here.'
      : 'Your match days in NSW. Each links out; nothing is booked here.';
    // Only the next block is open to start with; a different set of days starts again from the next one
    var sigNow = bs.map(function (b) { return b.key; }).join(',');
    if (sigNow !== blkSig || !openSet) { blkSig = sigNow; openSet = {}; var nx = bs.filter(function (b) { return b.kind !== 'away'; })[0]; if (nx) openSet[nx.key] = true; }
    if (!bs.length) {
      thirdList.innerHTML = '<p class="tp-empty">' + (stay() ? 'No NSW match falls in your days here (' + esc(tp.isoRange(trip().from, trip().to)) + '). Change your days, or see Where to watch above.' : 'There are no NSW matches to plan around yet. See Where to watch above.') + '</p>' + (first ? TAILOR : '');
      return;
    }
    var h = '';
    bs.forEach(function (b) {
      var hd = heading(b), open = !!openSet[b.key], bid = 'tp-blk-' + b.key;
      if (b.kind === 'away') { h += '<div class="tp-blk tp-blk--away"><p class="tp-blk-line"><span class="tp-blk-when">' + esc(hd.when) + '</span> <span class="tp-blk-what">' + esc(hd.what) + '</span></p></div>'; return; }
      h += '<section class="tp-blk tp-blk--' + b.kind + '" data-blk="' + b.key + '"><h4 class="tp-blk-h"><button type="button" class="tp-blk-head" data-blk-toggle="' + b.key + '" aria-expanded="' + open + '" aria-controls="' + bid + '">' +
        '<span class="tp-blk-when">' + esc(hd.when) + '</span><span class="tp-blk-what">' + esc(hd.what) + '</span><span class="tp-blk-chev" aria-hidden="true"></span></button></h4>' +
        '<div class="tp-blk-body" id="' + bid + '"' + (open ? '' : ' hidden') + '>' + (open ? (b.kind === 'match' ? matchBody(b, M) : b.kind === 'free' ? freeBody(b) : halfBody(b)) : '') + '</div></section>';
    });
    if (first) h += TAILOR;
    thirdList.innerHTML = h;
  }
  thirdList.addEventListener('click', function (e) {
    var t = e.target.closest('[data-blk-toggle]');
    if (t) { var k = t.dataset.blkToggle; if (openSet[k]) delete openSet[k]; else openSet[k] = true; render(true, '[data-blk-toggle="' + k + '"]'); return; }
    var m = e.target.closest('[data-more]');
    if (m) { moreBlk[m.dataset.more] = !moreBlk[m.dataset.more]; render(true, '[data-more="' + m.dataset.more + '"]'); return; }
    var mv = e.target.closest('[data-move]');
    if (mv) {
      var k = mv.dataset.move;
      moveOpen = moveOpen === k ? null : k;
      render(true, '[data-move="' + CSS.escape(k) + '"]');
      // Opened: focus goes to the first other start
      var first = moveOpen && thirdList.querySelector('[data-move="' + CSS.escape(k) + '"]').closest('.tp-trip').querySelector('.tp-move [data-move-to]');
      if (first) first.focus({ preventScroll: true });
      return;
    }
    var to = e.target.closest('[data-move-to]');
    if (to) {
      // Move: the same trip, another valid start (in this stretch, or here from another one)
      var id = to.dataset.moveId;
      moveTrip(id, +to.dataset.moveTo);
      var back = thirdList.querySelector('[data-move^="' + CSS.escape(id) + '@"]') || thirdList.querySelector('.tp-add[data-item^="' + CSS.escape(id) + '@"]');
      if (back) back.focus({ preventScroll: true });
      return;
    }
    var w = e.target.closest('[data-watch]');
    if (w) {
      var g = watchList.querySelector('.tp-wm[data-key="' + CSS.escape(w.dataset.watch) + '"]') || document.getElementById('tp-watch');
      var top = g.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16;
      body.scrollTo({ top: Math.max(0, top), behavior: reduce.matches ? 'auto' : 'smooth' });
      var f = g.querySelector('button'); if (f) f.focus({ preventScroll: true });
    }
  });
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
  // A match opens as a sheet from the bottom, over a scrim; products and places stay full-screen pages
  var pmScrim = document.createElement('div');
  pmScrim.className = 'tp-pm-scrim'; pmScrim.hidden = true;
  phone.insertBefore(pmScrim, pm);
  pmScrim.addEventListener('click', function () { closePm(); });
  pmBody = pm.querySelector('#tp-pm-body'); pmKind = pm.querySelector('#tp-pm-kind');
  function pmActions(id, label) {
    var on = added(ITEMS[id] ? ITEMS[id].id : id);
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
    if (f.t) h += '<label class="tp-ticket tp-pm-ticket"><input type="checkbox" data-pm-ticket="' + esc(m.tkey) + '"' + (state.tickets.indexOf(m.tkey) > -1 ? ' checked' : '') + ' aria-describedby="tp-pm-ticket-why" /><span>I have a ticket</span></label><p class="tp-ticket-why" id="tp-pm-ticket-why">Tick it if you\u2019re going, so we skip its screenings and plan your days around it.</p>';
    h += '</div>';
    if (teams.length) {
      // The same toggle as Add to my timeline: pressed reads Added, with a tick; pressing it again takes the team off
      h += '<h3 class="cn-pp-h">Your teams</h3><div class="tp-pm-teams">' + teams.map(function (n) {
        var on = tp.isPicked(n);
        return '<button type="button" class="tp-pm-team" data-pm-team="' + esc(n) + '" aria-pressed="' + on + '">' + (on ? '\u2713 ' + esc(n) + ' added to my teams' : 'Add ' + esc(n) + ' to my teams') + '</button>';
      }).join('') + '</div><p class="tp-pm-note">Adding a team adds all its matches, as picking its card does. Press again to take it off.</p>';
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
  /* A curated trip: what it is, how to get there from the base, when it runs and roughly what it costs (both worked out
     from its stops), then its stops as product cards. ATDW stops and DNSW's custom stops look the same apart from a
     small source label. Stops in a neutral order: travel time from the start, then name. */
  var SOURCE = { atdw: 'ATDW listing', custom: 'Custom: Destination NSW' };
  function dayRun(ds) {
    if (ds.length === 7) return 'Every day';
    if (!ds.length) return 'Check the stops';
    // A run of days, wrapping past Sunday ("Thu to Mon"), or else the days listed
    for (var k = 0; k < ds.length; k++) {
      var st = WD_ORDER.indexOf(ds[k]);
      if (ds.every(function (x, j) { return ds.indexOf(WD_ORDER[(st + j) % 7]) > -1; })) return WD_NAME[ds[k]] + ' to ' + WD_NAME[WD_ORDER[(st + ds.length - 1) % 7]];
    }
    return ds.map(function (d) { return WD_NAME[d]; }).join(', ');
  }
  function pmTrip(id, x) {
    var t = x.t, b = x.b, h = '';
    var bases = Object.keys(t.travel).map(function (k) { return mins(t.travel[k].minutes) + ' ' + (MODE[t.travel[k].mode] || '') + ' from ' + CITY[k]; }).join('; ');
    h += '<div class="plan-modal-img ph-img" role="img" aria-label="Placeholder image of ' + esc(t.region) + '"></div><div class="plan-modal-body">';
    h += '<p class="tp-pm-type provenance-gap">' + (t.kind === 'day' ? 'Day trip' : 'Longer trip, ' + t.nights + (t.nights === 1 ? ' night' : ' nights')) + ' \u00b7 Curated by Destination NSW</p>';
    h += '<h2 class="cn-pp-title provenance-gap" id="tp-pm-title">' + esc(t.title) + '</h2>';
    h += '<p class="tp-pm-why provenance-gap">' + esc(x.why) + '</p>';
    h += '<p class="cn-pp-venue provenance-gap">' + esc(t.summary) + '</p>';
    h += '<h3 class="cn-pp-h">Practical details</h3><dl class="pl-option-facts cn-pp-facts">' +
      '<div><dt>Getting there</dt><dd><span class="provenance-gap">' + esc(bases) + '</span></dd></div>' +
      '<div><dt>Runs</dt><dd><span class="provenance-gap">' + esc(dayRun(tripDays(t))) + '</span> <span class="tp-pm-derived">(from its stops)</span></dd></div>' +
      '<div><dt>Price</dt><dd><span class="provenance-gap">' + esc(tripBand(t) === 'free' ? 'Free' : tripBand(t) + ' (price band)') + '</span> <span class="tp-pm-derived">(from its stops)</span></dd></div></dl>';
    var stops = t.stops.slice().sort(function (a, c) { return a.minutes_from_start - c.minutes_from_start || a.title.localeCompare(c.title); });
    h += '<h3 class="cn-pp-h">Stops</h3><div class="tp-pcs tp-stops">' + stops.map(function (st) {
      return '<article class="tp-pc tp-stop"><span class="ph-img tp-pc-img" aria-hidden="true"></span><span class="tp-pc-body"><span class="tp-pc-title provenance-gap">' + esc(st.title) + '</span>' +
        '<span class="tp-pc-type provenance-gap">' + esc(PTYPE[st.type] || 'Product') + ' \u00b7 ' + esc(st.suburb) + '</span>' +
        '<span class="tp-stop-src">' + esc(SOURCE[st.source]) + '</span></span></article>';
    }).join('') + '</div>';
    h += pmActions(id, t.region) + '</div>';
    return h;
  }
  function openPm(id, opener) {
    var isMatch = id.indexOf('match:') === 0, x = isMatch ? { type: 'match', m: tp.match(id.slice(6)) } : MODAL[id];
    if (!x || (isMatch && !x.m)) return;
    pmSaid = '';
    pmBody.innerHTML = isMatch ? pmMatch(id.slice(6)) : x.type === 'product' ? pmProduct(id, x) : x.type === 'trip' ? pmTrip(id, x) : pmSpot(id, x);
    pmBody.scrollTop = 0;
    pmKind.textContent = isMatch ? 'Match' : x.type === 'product' ? 'Around your matches' : x.type === 'trip' ? (x.t.kind === 'day' ? 'Day trip' : 'Longer trip') : (SPOT_TYPE[x.sp.type] || 'Where to watch');
    pmOpen = { id: id, opener: opener && opener.dataset.open };
    pm.classList.toggle('is-match', isMatch);
    pm.classList.toggle('is-sheet', isMatch);
    pmScrim.hidden = !isMatch;
    // Everything behind waits; remember what was already inert so closing puts it back as it was
    pmBehind = [body, document.getElementById('tp-tl'), document.getElementById('tp-tl-scrim')].filter(Boolean).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; });
    pm.hidden = false;
    pm.classList.remove('is-open', 'is-closing'); void pm.offsetWidth; pm.classList.add('is-open');
    pm.querySelector('[data-pm-close]').focus({ preventScroll: true });
    tp.say((isMatch ? matchName(x.m.f) + ', ' + x.m.f.d : x.type === 'product' ? x.p.title : x.type === 'trip' ? x.t.title : x.sp.name) + ', page opened.');
    notesRefresh();
  }
  function closePm() {
    if (!pmOpen) return;
    var back = pmOpen.opener; pmOpen = null;
    pmBehind.forEach(function (pair) { pair[0].inert = pair[1]; });
    var sheet = pm.classList.contains('is-sheet');
    function done() { pm.hidden = true; pmScrim.hidden = true; pm.classList.remove('is-open', 'is-closing'); notesRefresh(); }
    if (reduce.matches || !pm.animate) done();
    else if (sheet) {
      // The sheet slides back down the way it came; the scrim fades with it
      pm.classList.add('is-closing');
      pmScrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in' });
      pm.animate([{ transform: 'none' }, { transform: 'translateY(100%)' }], { duration: 240, easing: 'cubic-bezier(.4, 0, 1, 1)' }).onfinish = done;
    }
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
      pmRefresh('[data-pm-team="' + CSS.escape(tb.dataset.pmTeam) + '"]');
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
  function snap() { return { watch: watchList.textContent + watchMore.textContent, third: thirdList.textContent }; }
  function changedSince(before, lead, same) {
    var after = snap(), names = [];
    pending = [];
    if (before.watch !== after.watch) { names.push('Where to watch'); pending.push(SECS.watch); }
    if (before.third !== after.third) { names.push('Around your matches'); pending.push(SECS.third); }
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
    var t = trip(), done = t && (t.mode === 'local' || (t.mode === 'visiting' && t.from && t.to)), M = model();
    // A guess from their first to last NSW match, confirmed with the same That's right as the timeline
    if (!done && M.how === 'guessed') {
      tripEl.innerHTML = '<span>Looks like you\u2019re here <strong>' + esc(tp.isoRange(isoOf(M.range.a), isoOf(M.range.z))) + '</strong></span> \u00b7 <button type="button" class="tp-link" data-act="trip-ok">That\u2019s right</button> \u00b7 <button type="button" class="tp-link" data-act="trip">Change</button>';
      return;
    }
    if (!done) {
      tripEl.innerHTML = '<button type="button" class="tp-link tp-third-trip-ask" data-act="trip">' + (M.how === 'one' ? 'Staying longer? Set your days' : 'Set your days in NSW to see what fits your free days') + '</button>';
      return;
    }
    var what = !done ? '' : t.mode === 'local' ? 'You live in NSW' : t.mode === 'unsure' ? 'Not sure yet if you\u2019re visiting' : 'Your days in NSW: ' + tp.isoRange(t.from, t.to);
    tripEl.innerHTML = done ? '<span class="tp-third-trip-a">' + esc(what) + '</span> \u00b7 <button type="button" class="tp-link" data-act="trip">Change</button>'
      : '<button type="button" class="tp-link tp-third-trip-ask" data-act="trip">' + (t && t.mode === 'visiting' ? 'Visiting? Confirm your days to see what fits' : 'Visiting? Set your days to see what fits') + '</button>';
  }
  phone.addEventListener('click', function (e) {
    if (e.target.closest('#tp-third-trip [data-act="trip"]')) { openAsk(); return; }
    if (!e.target.closest('#tp-third-trip [data-act="trip-ok"]')) return;
    var M = model(); if (!M.range) return;
    var before = snap();
    tp.setTrip({ mode: 'visiting', from: isoOf(M.range.a), to: isoOf(M.range.z) });
    var said = changedSince(before, 'Your days in NSW are ' + tp.isoRange(isoOf(M.range.a), isoOf(M.range.z)) + '.');
    askNews = '';
    render(true, '#tp-third-trip [data-act="trip"]');
    tp.say(said);
  });

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
      things.forEach(function (it) {
        // A longer trip is a span: "Tue 12 to Thu 14 Oct: Hunter Valley (2 nights)"
        if (it.kind === 'trip') { var c = tp.clashes()[it.id]; lines.push('- ' + (it.nights ? spanLabel(it.start, it.start + it.nights) : it.day) + ': ' + it.title + (it.nights ? ' (' + it.nights + (it.nights === 1 ? ' night' : ' nights') + ')' : ' (day trip)') + (c ? ' [clashes with ' + c.map(function (x) { return x.name + ', ' + x.day; }).join('; ') + ']' : '')); return; }
        lines.push('- ' + it.day + ': ' + it.title + (it.place ? ', ' + it.place : '') + (it.matchName ? ' (for ' + it.matchName + ')' : ''));
      });
      lines.push('', 'Places are placeholders in this prototype, not real listings.');
    }
    return lines.join('\n');
  }
  function renderPlan() {
    if (!planBody) return;
    var t = trip(), ms = tp.own() ? tp.userMatches() : [], n = state.added.filter(function (it) { return it.kind !== 'match'; }).length;
    // Save & share in the timeline only shows once there is a plan to keep
    if (ssBtn) ssBtn.hidden = !ms.length && !n;
    if (!ms.length && !n) {
      planBody.innerHTML = '<p class="tp-plan-empty">Pick a team, or add a screening or a place above, and your plan builds up here.</p>';
      return;
    }
    var nsw = ms.filter(function (m) { return !m.f.a; }).length, tk = ms.filter(hasTicket).length;
    var when = t && t.mode === 'visiting' && t.from && t.to ? 'In NSW ' + tp.isoRange(t.from, t.to) : t && t.mode === 'local' ? 'Local' : '';
    var facts = [];
    if (ms.length) facts.push('<li>' + tp.countPhrase(ms.map(function (m) { return m.f; }), { num: function (x) { return '<strong>' + x + '</strong>'; } }) + ', ' + (nsw === ms.length ? 'all in NSW' : nsw ? nsw + ' in NSW' : 'all interstate') + (tk ? ', ' + tk + (tk === 1 ? ' ticket' : ' tickets') : '') + '</li>');
    facts.push('<li><strong>' + n + '</strong> ' + (n === 1 ? 'thing' : 'things') + ' added</li>');
    // With days confirmed, how many of their matches fall in them: the same figure the timeline bar shows
    if (when && t.mode === 'visiting' && ms.length) {
      var a = tp.isoDay(t.from), z = tp.isoDay(t.to), inD = ms.filter(function (m) { return m.day >= a && m.day <= z; }).length;
      if (inD !== ms.length) when += ', ' + inD + (inD === 1 ? ' match' : ' matches') + ' in your days';
    }
    if (when) facts.push('<li>' + esc(when) + '</li>');
    // A trip that clashes is said here too, with the way to fix it, not only in the open timeline
    var cls = tp.clashes(), clash = state.added.filter(function (it) { return cls[it.id]; }).map(function (it) {
      return '<p class="tp-plan-clash">' + esc(it.title) + ' (' + esc(it.when || it.day) + '): ' + 'clashes with ' + esc(tp.list(cls[it.id].map(function (c) { return c.name + ', ' + c.day; }))) + '</p>';
    }).join('');
    planBody.innerHTML = '<ul class="tp-plan-facts">' + facts.join('') + '</ul>' + (clash ? clash + '<p class="tp-plan-clash-how">Open your timeline to move or remove it.</p>' : '') +
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

  /* ---------- Save & share: a second sheet stacked over the open timeline ----------
     The options come from the Share/edit itinerary prototype's sheet; what they keep or send is this plan. */
  var ssBtn = document.getElementById('tp-tl-share'), ss = document.getElementById('tp-ss');
  var KIND = { screening: 'Screening', place: 'Place', product: 'Thing to do' };
  // One row per match or thing added, in date order: for the table, the spreadsheet and the route
  function planRows() {
    var rows = [];
    if (tp.own()) tp.userMatches().forEach(function (m) {
      var f = m.f;
      rows.push({ at: m.day, date: f.d, time: f.k || 'To be confirmed', what: matchName(f), kind: 'Match', where: f.v + ', ' + f.p, place: f.a ? '' : f.v + ', ' + f.p,
        note: [hasTicket(m) ? 'Ticket' : '', f.a ? 'Interstate' : ''].filter(Boolean).join(', ') });
    });
    state.added.forEach(function (it) {
      if (it.kind === 'match') return;
      var at = it.start != null ? it.start : (function () { try { return tp.dayOf(it.day); } catch (e) { return 99; } })();
      var trip = it.kind === 'trip', c = trip && tp.clashes()[it.id];
      rows.push({ at: at, date: trip && it.nights ? spanLabel(it.start, it.start + it.nights) : it.day, time: '', what: it.title,
        kind: trip ? (it.nights ? 'Longer trip (' + it.nights + (it.nights === 1 ? ' night)' : ' nights)') : 'Day trip') : (KIND[it.kind] || 'Added'),
        where: trip ? it.title + (it.place ? ' (' + it.place + ')' : '') : it.place || '', place: trip ? it.title : it.place || '', note: c ? 'Clashes with ' + c.map(function (x) { return x.name + ', ' + x.day; }).join('; ') : (it.matchName ? 'For ' + it.matchName : '') });
    });
    return rows.sort(function (a, b) { return a.at - b.at; });
  }
  var COLS = ['Date', 'Time', 'What', 'Type', 'Where', 'Notes'];
  function rowCells(r) { return [r.date, r.time, r.what, r.kind, r.where, r.note]; }
  function csv() {
    var q = function (v) { v = String(v || ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return '﻿' + [COLS].concat(planRows().map(rowCells)).map(function (r) { return r.map(q).join(','); }).join('\r\n');
  }
  function tsv() { return [COLS].concat(planRows().map(rowCells)).map(function (r) { return r.map(function (v) { return String(v || '').replace(/[\t\n]/g, ' '); }).join('\t'); }).join('\n'); }
  function aiText() {
    return 'Hi! I am a Rugby World Cup 2027 fan planning time in New South Wales, Australia. Please turn my plan below into a practical day-by-day itinerary. Keep my matches fixed, put things that are close to each other on the same day, and tell me if something does not fit.\n\n' + planText();
  }
  function fileName(ext) { var t = trip(); return 'rwc-2027-plan' + (t && t.mode === 'visiting' && t.from ? '-' + t.from + '-to-' + t.to : '') + '.' + ext; }
  function download(text, type, ext) {
    var a = document.createElement('a'), url = URL.createObjectURL(new Blob([text], { type: type }));
    a.href = url; a.download = fileName(ext); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  var toast = document.getElementById('tp-ss-toast'), toastT;
  function ssSay(msg) {
    toast.hidden = true; void toast.offsetWidth; toast.textContent = msg; toast.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { toast.hidden = true; }, 2600);
  }
  function mark(tile) {
    ss.querySelectorAll('.cn-tile.is-copied').forEach(function (t) { t.classList.remove('is-copied'); });
    tile.classList.add('is-copied');
    clearTimeout(tile._t); tile._t = setTimeout(function () { tile.classList.remove('is-copied'); }, 2400);
  }
  var fb = document.getElementById('tp-ss-fallback'), fbText = document.getElementById('tp-ss-fallback-text');
  function copy(text, tile, msg) {
    fb.hidden = true;
    function fallback() { fb.hidden = false; fbText.value = text; fbText.focus(); fbText.select(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { mark(tile); ssSay(msg); }, fallback); else fallback();
  }
  function printPlan() {
    var lines = planText().split('\n'), html = '', inList = false;
    lines.forEach(function (l, i) {
      if (/^- /.test(l)) { if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + esc(l.slice(2)) + '</li>'; return; }
      if (inList) { html += '</ul>'; inList = false; }
      if (!l) return;
      html += i === 0 ? '<h1>' + esc(l) + '</h1>' : /:$/.test(l) ? '<h2>' + esc(l.slice(0, -1)) + '</h2>' : '<p>' + esc(l) + '</p>';
    });
    if (inList) html += '</ul>';
    var fr = document.createElement('iframe');
    fr.setAttribute('aria-hidden', 'true'); fr.style.cssText = 'position:fixed;width:0;height:0;border:0;';
    document.body.appendChild(fr);
    var d = fr.contentDocument;
    d.open(); d.write('<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><title>' + esc(fileName('pdf').replace('.pdf', '')) + '</title><style>body{font:14px/1.5 system-ui,sans-serif;color:#111;margin:24px}h1{font-size:20px;margin:0 0 4px}h2{font-size:15px;margin:20px 0 6px}ul{padding-left:18px;margin:0}li{margin:4px 0}p{margin:4px 0}</style></head><body>' + html + '</body></html>'); d.close();
    setTimeout(function () { fr.contentWindow.focus(); fr.contentWindow.print(); setTimeout(function () { fr.remove(); }, 1000); }, 50);
  }
  function mapsUrl() {
    var stops = [];
    planRows().forEach(function (r) { if (r.place && stops[stops.length - 1] !== r.place) stops.push(r.place); });
    if (!stops.length) return null;
    return stops.length === 1 ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(stops[0] + ', NSW')
      : 'https://www.google.com/maps/dir/' + stops.map(function (x) { return encodeURIComponent(x + ', NSW'); }).join('/');
  }
  ss.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    switch (b.id) {
      case 'tp-ss-print': printPlan(); break;
      case 'tp-ss-txt': download(planText(), 'text/plain;charset=utf-8', 'txt'); mark(b); ssSay('Downloaded ' + fileName('txt')); break;
      case 'tp-ss-csv': download(csv(), 'text/csv;charset=utf-8', 'csv'); mark(b); ssSay('Downloaded ' + fileName('csv')); break;
      case 'tp-ss-chat': copy(planText(), b, 'Copied. Paste it into a chat, a note or an email.'); break;
      case 'tp-ss-sheet': copy(tsv(), b, 'Copied for your spreadsheet. Paste into cells.'); break;
      case 'tp-ss-ai': copy(aiText(), b, 'Copied. Paste it into your AI assistant.'); break;
      case 'tp-ss-maps': var u = mapsUrl(); if (u) window.open(u, '_blank', 'noopener'); else ssSay('Nothing in your plan has a place in NSW yet.'); break;
      case 'tp-ss-send': send(); break;
      case 'tp-ss-again': ss.classList.remove('is-sent'); note.textContent = NOTE; email.focus(); break;
    }
  });
  var email = document.getElementById('tp-ss-email'), emailErr = document.getElementById('tp-ss-email-error'), note = document.getElementById('tp-ss-note');
  var NOTE = note.textContent;
  function send() {
    var to = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) { email.setAttribute('aria-invalid', 'true'); emailErr.hidden = false; email.focus(); return; }
    email.removeAttribute('aria-invalid'); emailErr.hidden = true;
    document.getElementById('tp-ss-sent-text').textContent = 'Sent to ' + to;
    note.textContent = 'Sent to ' + to + '. Check your inbox. It is still saved on this device too.';
    ss.classList.add('is-sent');
    document.getElementById('tp-ss-again').focus({ preventScroll: true });
  }
  email.addEventListener('input', function () { if (email.getAttribute('aria-invalid')) { email.removeAttribute('aria-invalid'); emailErr.hidden = true; } });
  email.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send(); } });
  // Opens as a sheet stacked over the timeline (tp.stackOpen in concepts-teams.js: motion, closing, focus, Tab)
  ssBtn.addEventListener('click', function () { fb.hidden = true; toast.hidden = true; tp.stackOpen(ss, ssBtn); });

  /* ---------- Render: only when something it depends on changed ---------- */
  var sig = '', seen = {}, whys = {};
  function signature() {
    return JSON.stringify([state.picked, state.tickets, state.trip, state.added.map(function (x) { return x.id; }), state.tab, openSet, moreBlk, moveOpen, watchAll, askEditing, askManual, askError, openCard, copied]);
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
  if (resetBtn) resetBtn.addEventListener('click', function () { closePm(); openSet = null; blkSig = ''; moreBlk = {}; moveOpen = null; watchAll = false; openCard = null; askEditing = false; askManual = false; askError = ''; seen = {}; whys = {}; render(true); });
  render(true);
})();
