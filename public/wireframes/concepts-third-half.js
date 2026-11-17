/* Concepts: Where to watch, Suits your 3rd half and the one question (prototype-pick-your-team.html).
   Experience principles (CLAUDE.md): reward early, then build on it; don't make people do the work.
   - Both result sections show straight away for the person's matches (picked teams, ticket marks, every NSW match for
     Here for the rugby). Nothing waits for dates. With no team picked they are a first look only: the next NSW match
     day (in their days in NSW once they have said so), not every match at once; the empty Your plan so far offers Pick your teams (the team list in a sheet).
   - Your days (optional), on the page under the team picker once there is something to plan around; nothing is
     guessed, with two quick picks. Refine your plan (folded): where they are staying and who is coming, which choose and
     order the ideas (a local: nearest first, no dates needed). Each answer refines the results in
     place, says what changed under the answer, and tints each section that changed as it comes into view. It is saved
     with the picks (tp-pick-v1), shown and editable in the open timeline.
   Data: real places, with indicative hours, prices and screenings (not confirmed). Where to watch uses placeholder venues from window.cnWatchVenues (no real business named); products from
   window.cnThirdHalf, shaped like the product data contract (availability, pricing and distance_to_venue are gap, so
   pink). No venue or product is favoured: spots go by type then name, products by distance then name. Links go out
   only; nothing is booked here. State and the timeline live in concepts-teams.js (window.tpPicker). */
(function () {
  'use strict';
  var tp = window.tpPicker, FIX = window.cnFixtures;
  if (!tp || !Array.isArray(FIX)) return;
  // Where to watch: placeholder venues (clearly marked) until real ones are supplied; see cnWatchVenues in concepts-fixtures.js
  var SPOTS = Array.isArray(window.cnWatchVenues) ? window.cnWatchVenues : [];
  var PRODUCTS = Array.isArray(window.cnThirdHalf) ? window.cnThirdHalf : [];
  var phone = document.getElementById('tp-phone'), body = tp.body, reduce = tp.reduce, esc = tp.esc, side = tp.side;
  var watchList = document.getElementById('tp-watch-list'), watchMore = document.getElementById('tp-watch-more');
  var thirdList = document.getElementById('tp-third-list'), thirdNote = document.getElementById('tp-third-note');
  var watchNote = document.getElementById('tp-watch-note'), watchNoteText = watchNote ? watchNote.textContent : '';
  var ask = document.getElementById('tp-ask'), tripEl = document.getElementById('tp-third-trip');
  if (!watchList || !thirdList || !ask) return;

  var SPOT_TYPE = { fan_zone: 'Fan zone', village: 'Village', pub: 'Pub', club: 'Club' }, SPOT_ORDER = { fan_zone: 0, village: 1, pub: 2, club: 3 };
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
  function stay() { var t = trip(); return t && t.from && t.to ? { a: tp.isoDay(t.from), z: tp.isoDay(t.to) } : null; }
  /* Where you are staying (optional, under Refine your plan). Quick answers, then NSW places to search; each place goes
     with the host city it is nearest (null: far enough from both that neither is assumed). Outside NSW is one answer. */
  var PLACES = [['Sydney CBD', 'sydney'], ['Bondi', 'sydney'], ['Newcastle', 'newcastle'], ['Blacktown', 'sydney'], ['Bondi Junction', 'sydney'], ['Campbelltown', 'sydney'], ['Chatswood', 'sydney'], ['Coogee', 'sydney'], ['Cronulla', 'sydney'],
    ['Darling Harbour', 'sydney'], ['Hornsby', 'sydney'], ['Liverpool', 'sydney'], ['Manly', 'sydney'], ['Newtown', 'sydney'], ['North Sydney', 'sydney'], ['Parramatta', 'sydney'], ['Penrith', 'sydney'], ['Randwick', 'sydney'],
    ['Surry Hills', 'sydney'], ['Sydney Olympic Park', 'sydney'], ['The Rocks', 'sydney'], ['Katoomba', 'sydney'], ['Leura', 'sydney'], ['Gosford', 'sydney'], ['Terrigal', 'sydney'], ['Wollongong', 'sydney'], ['Kiama', 'sydney'],
    ['Merewether', 'newcastle'], ['Maitland', 'newcastle'], ['Cessnock', 'newcastle'], ['Pokolbin', 'newcastle'], ['Lake Macquarie', 'newcastle'], ['Nelson Bay', 'newcastle'], ['Port Stephens', 'newcastle'],
    ['Albury', null], ['Bathurst', null], ['Byron Bay', null], ['Coffs Harbour', null], ['Dubbo', null], ['Jervis Bay', null], ['Orange', null], ['Port Macquarie', null], ['Tamworth', null], ['Wagga Wagga', null]]
    .map(function (x) { return { n: x[0], c: x[1] }; });
  function baseOf() { var t = trip(); return t && t.base || null; }
  function basePlace() { var b = baseOf(); return b && b !== 'local' && b !== 'outside' ? b : null; }
  function baseCity() { var n = basePlace(), p = n && PLACES.filter(function (x) { return x.n === n; })[0]; return p ? p.c : null; }
  // Until a base is given the copy says the city ("in Sydney"); once given, where they are staying
  function whereText(city) { var n = basePlace(); return n ? 'near where you\u2019re staying, ' + n : 'in ' + CITY[city]; }
  /* Honest fit: once they say where they are staying, ideas are ranked by distance from it and each says how far
     ("about 4 km from Bondi"; straight line, from made-up coordinates for now). Nothing is called near unless it is
     within NEAR_KM; otherwise the copy says the ideas are in the city. */
  var NEAR_KM = 6;
  function kmFrom(ll) {
    var n = basePlace(), g = window.cnGeo, b = n && g && g.places[n]; if (!b || !ll) return null;
    var r = Math.PI / 180, dLa = (ll[0] - b[0]) * r, dLo = (ll[1] - b[1]) * r;
    var a = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(b[0] * r) * Math.cos(ll[0] * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 12742 * Math.asin(Math.sqrt(a));
  }
  function kmLine(km) { return km === null || km === undefined ? '' : (km < 1 ? 'under 1 km' : 'about ' + Math.round(km) + ' km') + ' from ' + basePlace(); }
  function ideaKm(i) { return kmFrom(window.cnGeo && window.cnGeo.ideas[i.id]); }
  function prodKm(p) { return kmFrom(window.cnGeo && window.cnGeo.products[p.id]); }
  function byKm(fn) { return function (x, y) { var a = fn(x), b = fn(y); return (a === null ? 1e9 : a) - (b === null ? 1e9 : b); }; }
  // A half day's places: in their city and open that day, nearest to where they are staying first
  function halfList(b, wd) {
    var list = PRODUCTS.filter(function (p) { return p.distance_to_venue && cityOf(p.distance_to_venue.venue_ref) === b.base && hoursOn(p, wd) && (p.type === 'food_and_drink' || p.type === 'attraction'); })
      .sort(function (x, y) { return partyRank(x) - partyRank(y) || x.distance_to_venue.km - y.distance_to_venue.km || x.title.localeCompare(y.title); });
    if (basePlace()) list.sort(byKm(prodKm));
    return list;
  }
  function halfNear(b) { var l = halfList(b, weekdayOf(b.day)), k = l.length ? prodKm(l[0]) : null; return k !== null && k <= NEAR_KM; }
  function halfWhere(b) { return basePlace() && !halfNear(b) ? 'in ' + CITY[b.base] : whereText(b.base); }
  function halfNote(b) { return basePlace() && !halfNear(b) ? 'Nothing listed close to ' + basePlace() + ' yet, so these are in ' + CITY[b.base] + '.' : 'Something ' + whereText(b.base) + ', nothing far.'; }
  /* Who is coming (optional): the order of ideas, never what is shown. Family: attractions and free things first;
     couple and friends: food and drink first; solo: as it is (nearest first). */
  function partyOf() { var t = trip(); return t && t.party || null; }
  function partyRank(p) {
    var party = partyOf(); if (!party || party === 'solo') return 0;
    if (party === 'family') return (p.type === 'attraction' ? 0 : 2) + (p.pricing && p.pricing.is_free ? 0 : 1);
    return p.type === 'food_and_drink' ? 0 : 1;
  }
  function inStay(day) { var s = stay(); return !s || (day >= s.a && day <= s.z); }
  function added(id) { return state.added.some(function (x) { return x.id === id; }); }
  function notesRefresh() { phone.dispatchEvent(new CustomEvent('tp:state')); }
  // key: what the card's button looks up in ITEMS; the item it adds can have its own id (a trip card is keyed by
  // trip and free stretch, the trip itself is one item in the plan)
  // An add toggle's visible label: a circled plus to add, a circled tick once added (pressing again removes)
  function addLabel(on, text) { return (on ? window.tpIcons.added : window.tpIcons.add) + '<span class="tp-add-t">' + text + '</span>'; }
  function addBtn(id, label) {
    var on = added(ITEMS[id] ? ITEMS[id].id : id);
    return '<button type="button" class="tp-add" data-item="' + esc(id) + '" aria-pressed="' + on + '">' +
      '<span aria-hidden="true">' + addLabel(on, on ? 'Added' : 'Add') + '</span><span class="visually-hidden">' + (on ? 'Added: ' : 'Add ') + esc(label) + (on ? '. Press to remove' : ' to your timeline') + '</span></button>';
  }
  // Items the add buttons put on the timeline, by id, rebuilt on each render; and what each one's page shows
  var ITEMS = {}, MODAL = {};

  /* ---------- First look: no team picked yet ----------
     Without a pick there is nothing to tailor to, so both sections show one day only (the next NSW match day, in the
     person's days in NSW once given) instead of every match at once; Your plan so far, below, is the way on (Pick your teams opens the team list). */
  function teaser() { return !tp.own(); }
  function teaserDay() { var d = nswDays()[0]; return d ? d.m.f.d : null; }
  // (Pick your teams to tailor this is gone: Your plan so far, just below, opens the team list in a sheet; 16 Nov)

  /* ---------- Where to watch ---------- */
  var watchAll = false;
  function spotsFor(m) {
    return SPOTS.filter(function (sp) { return Array.isArray(sp.shows) && sp.shows.indexOf(m.key) > -1; })
      .sort(function (a, b) { return (SPOT_ORDER[a.type] - SPOT_ORDER[b.type]) || a.name.localeCompare(b.name); });
  }
  // A screening (or the village) for one match: registered so Add and its page work, wherever it is listed
  function spotItem(sp, m) {
    var id = 'w:' + SPOTS.indexOf(sp) + ':' + m.key;
    var open = sp.open_from && sp.open_to ? 'Open daily, ' + tp.isoRange(sp.open_from, sp.open_to) : '';
    ITEMS[id] = { id: id, kind: sp.type === 'village' ? 'place' : 'screening', title: sp.name, kindLabel: SPOT_TYPE[sp.type] || 'Screening', place: sp.place, note: open, day: m.f.d, matchName: matchName(m.f) };
    MODAL[id] = { type: 'spot', sp: sp, m: m };
    return id;
  }
  /* Going? Each screening card points to the one place a ticket is marked, the match card's I have a ticket (the
     Yes / No pair here was a second way to answer; replaced 15 Nov). Once marked, that match's screenings give way to
     one card for getting there and back, with Not going after all? to undo. */
  function notGoing(m) { return (state.notGoing || []).indexOf(m.key) > -1; }
  // One line, not a second way to answer: the ticket is marked in one place, the match card's I have a ticket
  // (agreed 15 Nov). The link goes there; once marked, the card turns into getting there and back.
  // One line per card, not one per match (a card with four matches said it four times in a row): the match is named
  // when there is one; with several it asks once and the link goes to the first one's ticket box
  function goingQ(ms) {
    var open = ms.filter(function (m) { return m.tkey && !hasTicket(m); });
    if (!open.length) return '';
    var m = open[0], q = open.length === 1 ? 'Going to ' + matchName(m.f) + '?' : 'Going to one of these?';
    return '<p class="tp-ws-going"><span class="tp-ws-going-q">' + esc(q) + '</span> <button type="button" class="tp-link" data-going-mark="' + esc(m.key) + '">Mark your ticket on the match</button></p>';
  }
  function gettingThere(m) {
    var f = m.f, city = f.a || f.p;
    return '<li class="tp-wm tp-wc tp-wc--going" data-key="' + esc(m.key) + '">' + matchLine(m) +
      '<h4 class="tp-ws-go-h" tabindex="-1" id="go-' + esc(m.key.replace(/\W+/g, '-')) + '">You’re going: getting there and back</h4>' +
      '<p class="tp-wv-meta provenance-gap">' + esc(f.v) + ', ' + esc(city) + '. ' + (f.a ? 'Travel to ' + esc(f.a) + ' and back: placeholder until transport details are supplied.' : 'Public transport to the stadium and back: placeholder until transport details are supplied.') + '</p>' +
      '<p class="tp-ws-going"><button type="button" class="tp-link" data-going="' + esc(m.key) + '" data-v="undo">Not going after all?</button></p></li>';
  }

  /* ---------- Which venues, fairly ----------
     A government site cannot favour one business: for each evening the venues are taken in a rotation that starts at a
     different place for each match, one of each kind first (fan zone, pub, club) and from different areas, and no venue
     is shown for more than two evenings on the page while another would do. With two of their matches on one evening,
     venues showing both come first. Where they are staying (Refine your plan) puts that city's venues first. Worked
     out once per render, in date order, so a match shows the same venues in Where to watch and in Your days. */
  // Team names, never nicknames (Boks, All Blacks ...): not every fan knows them (agreed 16 Nov)
  var FIX = window.cnFixtures || [];
  function fixIndex(m) { for (var i = 0; i < FIX.length; i++) if (FIX[i].d === m.f.d && FIX[i].t === m.f.t) return i; return 0; }
  function shows(sp, m) { return Array.isArray(sp.shows) && sp.shows.indexOf(m.key) > -1; }
  var VEN = {}, VUSED = {};
  function evKey(ms) { return ms.map(function (m) { return m.key; }).join('+'); }
  function venuesFor(ms) {
    var k = evKey(ms); if (VEN[k]) return VEN[k];
    var city = baseCity(), off = fixIndex(ms[0]) % (SPOTS.length || 1);
    var cand = SPOTS.map(function (sp, j) { return { sp: sp, j: j, all: ms.every(function (m) { return shows(sp, m); }), any: ms.some(function (m) { return shows(sp, m); }) }; })
      .filter(function (c) { return c.any; })
      .sort(function (x, y) {
        return (y.all - x.all) || ((city && y.sp.city === city) - (city && x.sp.city === city)) ||
          (((x.j - off + SPOTS.length) % SPOTS.length) - ((y.j - off + SPOTS.length) % SPOTS.length));
      });
    var pick = [], types = {}, areas = {};
    // Pass 1: a different kind and area each, not over-used; pass 2: fill from what is left
    [true, false].forEach(function (strict) {
      cand.forEach(function (c) {
        if (pick.length >= 3 || pick.indexOf(c) > -1) return;
        if (strict && (types[c.sp.type] || areas[c.sp.place] || (VUSED[c.sp.name] || 0) >= 2)) return;
        if (!strict && (VUSED[c.sp.name] || 0) >= 2 && cand.length > pick.length + 1) return;
        pick.push(c); types[c.sp.type] = 1; areas[c.sp.place] = 1;
      });
    });
    // Keep the both-first order within the picks
    pick.sort(function (x, y) { return (y.all - x.all); });
    pick.forEach(function (c) { VUSED[c.sp.name] = (VUSED[c.sp.name] || 0) + 1; });
    return (VEN[k] = pick);
  }
  // The person's untick matches grouped by evening (two picked teams on one evening share one card)
  function evenings(ms) {
    var by = {}, out = [];
    ms.forEach(function (m) { (by[m.day] = by[m.day] || []).push(m); });
    Object.keys(by).map(Number).sort(function (x, y) { return x - y; }).forEach(function (d) { out.push(by[d]); });
    return out;
  }
  function teamOf(m) { var t = (m.f.t || '').split(' v '); return t.filter(function (n) { return tp.isPicked(n); })[0] || t[0]; }
  function kickLine(m) { var n = teamOf(m); return n + ' plays at ' + (m.f.k ? m.f.k.replace(':00', '') : 'a time to be confirmed'); } // 8pm, not 8:00pm
  // Several matches on one day: "of your matches" only once they have picked something, and "tonight" only when every
  // kick-off is 5pm or later (a 12:15pm match is not tonight)
  function lateAll(ms) { return ms.every(function (m) { var k = kickMins(m.f.k); return k !== null && k >= 17 * 60; }); }
  function manyLine(ms) { return ms.length + (tp.own() ? ' of your matches ' : ' matches ') + (lateAll(ms) ? 'tonight' : 'that day'); }
  /* One venue row, wherever venues are listed (Where to watch on the page and in its sheet, a match sheet): a thumbnail,
     the name and what it is, all one link to the venue's details (a sheet from the page, a drill-down level inside a
     sheet), then Add */
  function venueRow(id, name, meta, addHtml) {
    return '<li class="tp-wv-i"><button type="button" class="tp-wv-t" data-open="' + esc(id) + '" aria-haspopup="dialog"><span class="ph-img tp-pc-img tp-wv-img"' + imgKey(name) + ' aria-hidden="true"></span>' +
      '<span class="tp-wv-txt"><span class="tp-wv-name provenance-gap">' + esc(name) + '</span><span class="tp-wv-meta">' + meta + '</span></span></button>' + addHtml + '</li>';
  }
  // The venues for one evening: name, kind and area, what it shows (with two matches), Add
  function venueRows(ms, keyBase) {
    var vs = venuesFor(ms), two = ms.length > 1;
    if (!vs.length) return '<p class="tp-empty">No screening listed for this match yet.</p>';
    return '<ul class="tp-wv">' + vs.map(function (c) {
      var showing = ms.filter(function (m) { return shows(c.sp, m); }), m0 = showing[0];
      var id = 'w:' + c.j + ':' + keyBase;
      ITEMS[id] = { id: id, kind: 'screening', title: c.sp.name, kindLabel: SPOT_TYPE[c.sp.type] || 'Screening', place: c.sp.place, note: '', day: m0.f.d, matchName: showing.map(function (m) { return matchName(m.f); }).join(' and ') };
      MODAL[id] = { type: 'spot', sp: c.sp, m: m0 };
      var what = two ? (c.all ? (ms.length > 2 ? 'Shows all ' + ms.length : 'Shows both') : 'Shows ' + matchName(m0.f) + ' only') : '';
      return venueRow(id, c.sp.name, esc(SPOT_TYPE[c.sp.type] || 'Screening') + ' · ' + esc(c.sp.place) + (what ? ' · <strong>' + esc(what) + '</strong>' : ''),
        addBtn(id, c.sp.name + ', ' + ITEMS[id].matchName + ' on ' + m0.f.d));
    }).join('') + '</ul>';
  }
  function matchLine(m) {
    var f = m.f, who = f.t ? f.t.split(' v ').map(side).join(' <span class="tp-all-v">v</span> ') : esc(f.s);
    var tag = f.a ? '<span class="tp-tag tp-tag--away">Interstate: ' + esc(f.a) + '</span>' : '<span class="tp-tag">In NSW</span>';
    return '<div class="tp-wc-m"><p class="tp-wc-when">' + esc(f.d) + ', ' + esc(f.k || 'time to be confirmed') + ' ' + tag + '</p><p class="tp-wc-teams">' + who + '</p></div>';
  }
  function renderWatch() {
    VEN = {}; VUSED = {};
    // Every match of every picked team, interstate included, in their days once set; one with a ticket shows getting
    // there and back instead of screenings
    var ms = tp.userMatches().filter(function (m) { return m.f.t && inStay(m.day); });
    var s = stay(), h = '', first = teaser();
    if (first) {
      var d0 = teaserDay(), on = ms.filter(function (m) { return m.f.d === d0; });
      ms = on.length ? on : ms.slice(0, 1);
    }
    if (watchNote) watchNote.textContent = first && ms.length ? 'A first look: screenings on ' + ms[0].f.d + ', the next NSW match day.' : 'Every match of your teams, interstate ones too, at fan zones, pubs and clubs in NSW. Venues are examples until real ones are supplied.';
    if (!ms.length) {
      h = '<p class="tp-empty">' + (s ? 'None of your matches falls in your days (' + esc(tp.isoRange(trip().from, trip().to)) + ').' : 'Pick your teams to see where to watch their matches.') + '</p>';
    }
    var evs = evenings(ms), cards = [];
    evs.forEach(function (ev) {
      var going = ev.filter(hasTicket), watch = ev.filter(function (m) { return !hasTicket(m); });
      going.forEach(function (m) { cards.push(gettingThere(m)); });
      if (!watch.length) return;
      var two = watch.length > 1, k = evKey(watch);
      cards.push('<li class="tp-wm tp-wc' + (two ? ' is-clash' : '') + '" data-key="' + esc(watch[0].key) + '">' +
        (two ? '<p class="tp-wc-clash">' + manyLine(watch) + '</p>' : '') +
        watch.map(matchLine).join('') +
        '<p class="tp-wc-sub">Where to watch in NSW' + (two ? ', venues showing ' + (watch.length > 2 ? 'all of them' : 'both') + ' first' : '') + '</p>' +
        venueRows(watch, k) + goingQ(watch) + '</li>');
    });
    // More than one match day: a carousel, one card at a time with the next peeking in, the same as the team cards
    // (agreed 16 Nov); every card is in it, so there is no Show more
    var car = cards.length > 1, sx = car && watchList.querySelector('.tp-wcs') ? watchList.querySelector('.tp-wcs').scrollLeft : 0;
    if (cards.length) h += '<ul class="tp-wcs' + (car ? ' tp-wcs--car' : '') + '" aria-label="Where to watch, by match day' + (car ? ', ' + cards.length + ' cards, scroll sideways' : '') + '">' + cards.join('') + '</ul>' +
      (car ? '<p class="tp-deck-hint tp-wcs-hint">' + cards.length + ' match days. Swipe for the others.</p>' : '');
    watchList.innerHTML = h;
    if (sx) watchList.querySelector('.tp-wcs').scrollLeft = sx; // a change on one card keeps the carousel where it was
    watchMore.hidden = true;
    if (!watchMore.hidden) { watchMore.textContent = watchAll ? 'Show fewer' : 'Show ' + (cards.length - 4) + ' more match days'; watchMore.setAttribute('aria-expanded', watchAll ? 'true' : 'false'); }
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
     Where the days come from: the days they set; otherwise match days only, with a nudge to Your days (nothing is
     guessed). I'm a local: no free stretches; each match day gets Make a day of it.
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
  // Non-breaking spaces, so a duration never splits across lines (2 / hr 15 min)
  function mins(m) { return m < 60 ? m + '\u00a0min' : m % 60 ? Math.floor(m / 60) + '\u00a0hr ' + (m % 60) + '\u00a0min' : (m / 60) + '\u00a0hr'; }
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
    var t = trip(), local = baseOf() === 'local', rugby = tp.rugby(), own = tp.own();
    var ms = own ? tp.userMatches() : [], nsw = ms.filter(function (m) { return !m.f.a; });
    var days = {}; nsw.forEach(function (m) { days[m.day] = true; });
    var nd = Object.keys(days).map(Number).sort(function (x, y) { return x - y; });
    var range = null, how = 'none';
    // Days as set; nothing is guessed (no range until they choose one)
    if (t && t.from && t.to) { range = { a: tp.isoDay(t.from), z: tp.isoDay(t.to) }; how = 'confirmed'; }
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
      // A free day with one of their matches on (interstate, no ticket): its own card, where to watch it in NSW
      var tv = dm.filter(function (m) { return m.f.a && m.f.t && !hasTicket(m) && M.ms.indexOf(m) > -1; });
      if (tv.length) { close(); out.push({ kind: 'watch', key: 'w' + d, day: d, ms: tv }); continue; }
      if (a !== z && (d === a || d === z)) { close(); out.push({ kind: 'half', key: 'h' + d, day: d, first: d === a }); continue; }
      if (!st) st = { kind: 'free', key: 'f' + d, a: d, z: d };
      st.z = d;
    }
    close();
    // Base for each stretch and half day: from the matches either side (Sydney or Newcastle)
    out.forEach(function (b, i) {
      if (b.kind !== 'free' && b.kind !== 'half') return;
      var p = null, n = null;
      for (var j = i - 1; j >= 0; j--) if (out[j].kind === 'match') { p = out[j]; break; }
      for (j = i + 1; j < out.length; j++) if (out[j].kind === 'match') { n = out[j]; break; }
      var pc = p && cityOf(p.ms[0].f.v), nc = n && cityOf(n.ms[0].f.v);
      b.base = baseCity() || (b.kind === 'half' ? (b.first ? nc || pc : pc || nc) || 'sydney' : pc || nc || 'sydney'); // where they are staying, once given
      b.between = !!(pc && nc && pc !== nc);
    });
    return out;
  }

  // High fidelity images: each placeholder names its picture, assets/images/<name>.webp or .jpg (the title in lower case, words
  // joined by hyphens). Only the high fidelity theme loads them (pv-device.js); the wireframe keeps the grey block.
  function imgKey(title) { return ' data-img="' + esc(String(title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) + '"'; }
  // Match day groups, as before: Before the match, After the final whistle, Near the stadium
  function productCard(p, why, id, f) {
    return '<article class="tp-pc" data-id="' + esc(id) + '">' +
      '<button type="button" class="tp-pc-main" data-open="' + esc(id) + '" aria-haspopup="dialog">' +
      '<span class="ph-img tp-pc-img"' + imgKey(p.title) + ' aria-hidden="true"></span><span class="tp-pc-body"><span class="tp-pc-title">' + esc(p.title) + '</span>' +
      '<span class="tp-pc-type provenance-gap">' + esc(PTYPE[p.type] || 'Product') + '</span>' +
      '<span class="tp-pc-why provenance-gap" data-why="' + esc(why) + '">' + esc(why) + '</span></span></button>' +
      addBtn(id, p.title + ' on ' + f.d) + '</article>';
  }
  /* Getting there and back on a match day (PLACEHOLDER transport details, proposed contract field
     getting_there.event_day, gap). One line at the top of the day, from where they are staying (the venue's default
     start, such as Central, until they say), then a button to a sheet with the schematic route and all the details. */
  var TRAVEL = window.cnMatchTravel || null;
  var TRAIN_ICO = '<svg class="tp-ico tp-go-ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3.5" y="1.5" width="9" height="10" rx="2.5"/><path d="M3.5 7.5h9M6 14.5l1-3M10 14.5l-1-3"/><circle cx="6" cy="9.5" r=".6"/><circle cx="10" cy="9.5" r=".6"/></svg>';
  var LEG = { walk: 'Walk', train: 'Train', event: 'Event shuttle' };
  function goRoute(f) { return TRAVEL && !f.a ? TRAVEL.route(f.v, basePlace(), baseCity()) : null; }
  function ampm(t) { t = ((t % 1440) + 1440) % 1440; var hh = Math.floor(t / 60), mm = t % 60; return ((hh % 12) || 12) + (mm ? ':' + (mm < 10 ? '0' : '') + mm : '') + (hh < 12 ? 'am' : 'pm'); }
  function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function goLine(r) { return r.mode + ' from ' + r.from + ', ' + (r.mins ? 'about ' + mins(r.mins) : 'time to be confirmed') + ' · ' + lower(r.event_day.extra_services); }
  // The line above already names the start, so this only offers the change
  function goStay(r) { return r.fromDefault && !baseOf() ? '<p class="tp-go-from"><button type="button" class="tp-link" data-go-stay>Add where you’re staying</button> to see your own route.</p>' : ''; }
  function goBlock(m) {
    var f = m.f, r = goRoute(f); if (!r) return '';
    var id = 'go:' + m.key;
    MODAL[id] = { type: 'route', r: r, m: m };
    // Icon in its own column, everything else (the line, its Placeholder tag, Add where you're staying and the button)
    // on one left edge beside it
    return '<div class="tp-go">' + TRAIN_ICO + '<div class="tp-go-txt"><p class="tp-go-line"><span class="provenance-gap">' + esc(goLine(r)) + '</span> <span class="tp-go-tag">Placeholder</span></p>' + goStay(r) +
      '<button type="button" class="tp-go-btn" data-open="' + esc(id) + '" aria-haspopup="dialog">Getting there and back<span class="visually-hidden">, ' + esc(matchName(f)) + '</span></button></div></div>';
  }
  // Getting there in one line for the day-by-day map's match day (16 Nov): how and how long, then the full details
  function goOne(m) {
    var f = m.f, r = goRoute(f); if (!r) return '';
    var id = 'go:' + m.key;
    MODAL[id] = { type: 'route', r: r, m: m };
    return '<p class="tp-go-one">' + TRAIN_ICO + '<span><span class="provenance-gap">' + esc(r.mode + ' from ' + r.from + ', ' + (r.mins ? 'about ' + mins(r.mins) : 'time to be confirmed')) + '</span> \u00b7 ' +
      '<button type="button" class="tp-link" data-open="' + esc(id) + '" aria-haspopup="dialog">Getting there and back<span class="visually-hidden">, ' + esc(matchName(f)) + '</span></button></span></p>';
  }
  // Where a match day starts from when they have not said where they are staying: the city centre the route starts at
  function startOf(f) {
    var r = goRoute(f), c = cityOf(f.v), ll = GEO && GEO.places[c === 'newcastle' ? 'Newcastle' : 'Sydney CBD'];
    return ll ? { ll: ll, name: r ? r.from : (c === 'newcastle' ? 'Newcastle' : 'Sydney CBD') } : null;
  }
  // The schematic route: stops on a line, each leg styled by how you travel it. Not to scale.
  function goMap(r) {
    var h = '<figure class="tp-go-map-f"><ol class="tp-go-map" aria-label="Route from ' + esc(r.from) + ' to ' + esc(r.venue) + '">';
    h += '<li class="tp-go-stop is-end"><span class="tp-go-dot" aria-hidden="true"></span><span class="tp-go-stop-n">' + esc(r.from) + '</span>' + (r.fromDefault ? '' : '<span class="tp-go-stop-s">Where you’re staying</span>') + '</li>';
    r.legs.forEach(function (l) {
      h += '<li class="tp-go-leg is-' + l.mode + '"><span class="tp-go-seg" aria-hidden="true"></span><span class="tp-go-leg-t provenance-gap">' + esc(l.mode === 'train' && r.far ? 'Regional coach' : l.mode === 'train' && l.intercity ? 'Intercity train' : LEG[l.mode]) + '' + ', ' + (l.mins ? 'about ' + mins(l.mins) : 'time to be confirmed') + '</span></li>';
      h += '<li class="tp-go-stop' + (l.gates ? ' is-end is-venue' : '') + '"><span class="tp-go-dot" aria-hidden="true"></span><span class="tp-go-stop-n' + (l.gates ? '' : ' provenance-gap') + '">' + esc(l.to) + '</span></li>';
    });
    return h + '</ol><figcaption class="tp-go-cap">Schematic, not to scale</figcaption></figure>';
  }
  function pmRoute(id, x) {
    var r = x.r, f = x.m.f, k = kickMins(f.k), e = r.event_day, h = '';
    var leave = k !== null && r.mins ? ampm(k - 45 - r.mins) : null, ft = k !== null ? k + 100 : null;
    h += '<div class="plan-modal-body tp-pm-go">';
    h += '<p class="tp-pm-type">' + esc(f.d) + '</p>';
    h += '<h2 class="cn-pp-title" id="tp-pm-title">Getting there and back</h2>';
    h += '<p class="cn-pp-venue">' + esc(matchName(f)) + ', ' + esc(f.k || 'time to be confirmed') + ', ' + esc(f.v) + '</p>';
    h += '<p class="tp-go-ph" role="note">Placeholder transport details. Real routes, times and services to come.</p>';
    h += goMap(r);
    h += '<h3 class="cn-pp-h">Getting there</h3><dl class="pl-option-facts cn-pp-facts">' +
      '<div><dt>From</dt><dd>' + esc(r.from) + (r.fromDefault && !baseOf() ? ' · <button type="button" class="tp-link" data-go-stay>Add where you’re staying</button>' : '') + '</dd></div>' +
      '<div><dt>Journey</dt><dd><span class="provenance-gap">' + esc(r.mode) + ', ' + (r.mins ? 'about ' + mins(r.mins) : 'time to be confirmed') + '</span></dd></div>' +
      (leave ? '<div><dt>Leave by</dt><dd><span class="provenance-gap">About ' + leave + ', to be at the gates 45 min before kick-off</span></dd></div>' : '') +
      '<div><dt>Your ticket</dt><dd><span class="provenance-gap">Whether match tickets include public transport is to be confirmed</span></dd></div></dl>';
    h += '<h3 class="cn-pp-h">Getting back</h3><dl class="pl-option-facts cn-pp-facts">' +
      (ft !== null ? '<div><dt>Full time</dt><dd><span class="provenance-gap">About ' + ampm(ft) + '</span></dd></div>' : '') +
      '<div><dt>Services</dt><dd><span class="provenance-gap">' + esc(e.extra_services) + '. ' + esc(e.return_note) + '</span></dd></div>' +
      '<div><dt>Last service</dt><dd><span class="provenance-gap">' + esc(e.last_service || 'Time to be confirmed') + '</span></dd></div>' +
      (ft !== null && r.mins ? '<div><dt>Back by</dt><dd><span class="provenance-gap">About ' + ampm(ft + 30 + r.mins) + ' in ' + esc(r.from) + '</span></dd></div>' : '') + '</dl>';
    // A long way back after an evening match: say so plainly, and that staying closer that night is an option
    if ((r.cross || r.far) && (ft === null || ft + 30 + (r.mins || 0) >= 23 * 60)) h += '<p class="tp-go-p">That\u2019s a late, long trip back. Think about staying in ' + esc(CITY[cityOf(f.v)]) + ' the night of the match.</p>';
    h += '<h3 class="cn-pp-h">Accessibility</h3><p class="tp-go-p provenance-gap">' + esc(e.accessibility) + '</p>';
    h += '<div class="tp-pm-acts"><span class="tp-pm-full" role="link" aria-disabled="true">Learn more on Practical info</span><span class="tp-pm-soon">Not linked yet</span></div></div>';
    return h;
  }
  // Add where you're staying: the staying question in a sheet, where they are (it jumped down to Your days)
  function openStaying(opener) {
    openDays(true, opener); // with or without a team: a first look offers it too (it did nothing there)
  }
  function matchBody(b, M) {
    var m = b.ms.filter(hasTicket)[0] || b.ms[0], f = m.f, wd = weekdayOf(m.day), k = kickMins(f.k), d = { m: m };
    var groups = { before: [], after: [], near: [] }, h = goBlock(m) + alsoLine(m.day);
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
      var list = groups[g].sort(function (x, y) { return partyRank(x.p) - partyRank(y.p) || (x.p.distance_to_venue.km - y.p.distance_to_venue.km) || x.p.title.localeCompare(y.p.title); });
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
      '<span class="ph-img tp-pc-img"' + imgKey(t.title) + ' aria-hidden="true"></span><span class="tp-pc-body"><span class="tp-pc-title provenance-gap">' + esc(t.title) + '</span>' +
      '<span class="tp-pc-type provenance-gap">' + (t.kind === 'day' ? 'Day trip' : 'Longer trip') + ' · Curated by Destination NSW</span>' +
      '<span class="tp-pc-why provenance-gap" data-why="' + esc(why) + '">' + esc(why) + '</span></span></button>' +
      addBtn(key, t.region + ', ' + (t.kind === 'day' ? 'day trip' : 'longer trip')) + line + '</article>';
  }
  // "Clashes with Italy v Romania, Mon 11 Oct" (a match), or "with Blue Mountains, Sun 17 Oct" (another trip)
  function clashText(cl) { return 'Clashes with ' + tp.list(cl.map(function (c) { return c.name + ', ' + c.day; })) + '.'; }
  /* Where a trip can go now: every valid start in every free stretch it suits, for Move in the timeline's detail (a
     trip whose stretch has split has no card on the page any more) */
  function tripMoves(id, all) {
    var it = state.added.filter(function (x) { return x.id === id; })[0]; if (!it) return [];
    var t = TRIPS.filter(function (x) { return x.id === it.tripId; })[0]; if (!t) return [];
    var out = [];
    blocks(model()).forEach(function (b) {
      if (b.kind !== 'free' || (t.kind === 'long' && (b.z - b.a + 1 < 3 || !(t.bases.indexOf(b.base) > -1 || (b.between && t.on_the_way))))) return;
      if (t.kind === 'day' && t.bases.indexOf(b.base) < 0) return;
      starts(t, b).forEach(function (x) { if (x !== it.start) out.push({ start: x, label: t.kind === 'long' ? spanLabel(x, x + t.nights) : dayLabel(x) }); });
    });
    return all ? out : out.slice(0, 6);
  }
  function moveTrip(id, s) {
    var cur = state.added.filter(function (x) { return x.id === id; })[0]; if (!cur) return;
    var nu = Object.assign({}, cur, { start: s, day: dayLabel(s), endDay: cur.nights ? dayLabel(s + cur.nights) : null, when: cur.nights ? spanLabel(s, s + cur.nights) : dayLabel(s) });
    tp.removeItem(id); tp.addItem(nu); moveOpen = null;
    render(true);
    tp.say(cur.title + ' moved to ' + nu.when + '.');
  }
  tp.tripMoves = tripMoves; tp.moveTrip = moveTrip;
  /* ---------- Free days: three to five ideas a day ----------
     Each free day gets its own short list: half-day ideas in the city and day trips, each tagged with how to get there
     by public transport and how long it takes (car-only trips offer a guided tour instead). Nothing is suggested twice
     on the page, and nothing already in the plan is suggested. A day is filled once it has a day trip, or two half-day
     ideas (or a longer trip covers it): it then shows what is in it, and its ideas move on to the next free day. First-
     time visitors (not a local and not staying in Sydney, or not said) see Sydney's half days first; who is coming puts
     the ideas that suit them first. */
  var IDEAS = Array.isArray(window.cnFreeIdeas) ? window.cnFreeIdeas : [], SUGG = {}, FREE_LEFT = 0, FREEINFO = [];
  function firstTimer() { var b = baseOf(); return b !== 'local' && baseCity() !== 'sydney'; }
  function ideaAdded(i) { return added('i:' + i.id); }
  function dayItems(d) {
    var dl = dayLabel(d);
    return state.added.filter(function (x) {
      if (x.kind === 'match' || x.kind === 'screening') return false;
      if (x.nights) return x.start <= d && d <= x.start + x.nights;
      return x.day === dl;
    });
  }
  // What they added to a match, half or watch day that its own cards do not show (a place saved from the map and slotted
  // there, for example): one line, so nothing on their plan goes missing from its day
  function alsoItems(d) { return dayItems(d).filter(function (x) { return x.kind !== 'product'; }); }
  /* Every mention of a place opens its details (16 Nov): something on their plan opens its own sheet (Move, Remove);
     a place saved from the map and not yet placed opens the place */
  function placeLink(x) {
    var id = x.unplaced && x.poi ? 'poi:' + x.poi : 'item:' + x.id;
    return '<button type="button" class="tp-link tp-place-link" data-open="' + esc(id) + '" aria-haspopup="dialog">' + esc(x.title) + '</button>';
  }
  function placeLinks(its, sep) { return its.map(placeLink).join(sep || ', '); }
  function alsoLine(d) { var its = alsoItems(d); return its.length ? '<p class="tp-blk-note tp-blk-also">Also on your plan that day: ' + placeLinks(its) + '.</p>' : ''; }
  function dayFilled(d) {
    var its = dayItems(d);
    return its.some(function (x) { return x.idea === 'day' || x.kind === 'trip'; }) || its.length >= 2;
  }
  function partyFirst(list) {
    var p = partyOf(); if (!p || p === 'solo') return list;
    return list.filter(function (i) { return i.party.indexOf(p) > -1; }).concat(list.filter(function (i) { return i.party.indexOf(p) < 0; }));
  }
  function ideasFor(d, city) {
    var free = function (i) { return i.city === city && !SUGG[i.id] && !ideaAdded(i); };
    var near = basePlace() ? function (l) { return l.sort(byKm(ideaKm)); } : function (l) { return l; };
    var halves = partyFirst(near(IDEAS.filter(function (i) { return i.kind === 'half' && free(i); })));
    var trips = partyFirst(near(IDEAS.filter(function (i) { return i.kind === 'day' && free(i); })));
    // First-timers: Sydney half days lead (two, then a day trip); otherwise a day trip leads
    var lead = firstTimer() && city === 'sydney' ? ['h', 'h', 't', 'h', 't'] : ['t', 'h', 'h', 't', 'h'], out = [];
    for (var k = 0; out.length < halves.length + trips.length && k < 40; k++) {
      var want = lead[k % lead.length], src = want === 'h' ? (halves.length ? halves : trips) : (trips.length ? trips : halves);
      if (!src.length) break;
      out.push(src.shift());
    }
    return out;
  }
  function howLine(i) {
    if (i.car) return 'Car only, ' + mins(i.how.mins) + ' from ' + i.how.from + ' (no public transport)';
    return i.how.mode + ' from ' + i.how.from + ' · ' + (i.how.mins ? mins(i.how.mins) + ' by public transport' : 'time to be confirmed');
  }
  // In the timeline's ideas sheet (open) the card's main part is a button that shows the idea's details in the sheet
  function ideaCard(i, d, open) {
    var id = 'i:' + i.id, key = id + '@' + d, dl = dayLabel(d), type = (i.kind === 'half' ? 'Half-day idea' : 'Day trip') + ' · ' + CITY[i.city];
    var km = ideaKm(i), why = 'Fits ' + dl + (km !== null ? ' · ' + kmLine(km) : '') + ' · ' + howLine(i);
    // In the ideas sheet the day is the heading, so the line leads with how to get there and how long, then distance:
    // Ferry from Sydney CBD, 35 min · about 9 km away (the details give the full wording)
    if (open) why = (i.car ? 'Car only, ' + mins(i.how.mins) + ' from ' + i.how.from : i.how.mode + ' from ' + i.how.from + (i.how.mins ? ', ' + mins(i.how.mins) : ', time to be confirmed')) + (km !== null ? ' · ' + (km < 1 ? 'under\u00a01\u00a0km' : 'about\u00a0' + Math.round(km) + '\u00a0km') + '\u00a0away' : '');
    ITEMS[key] = { id: id, kind: 'place', idea: i.kind, title: i.title, kindLabel: i.kind === 'half' ? 'Half-day idea' : 'Day trip', place: howLine(i), day: dl };
    return '<article class="tp-pc tp-idea' + (open ? ' tp-idea--open' : '') + '" data-id="' + esc(key) + '">' + (open ? '<button type="button" class="tp-pc-main" data-idea-open="' + esc(key) + '">' : '<button type="button" class="tp-pc-main" data-open="idea:' + esc(key) + '" aria-haspopup="dialog">') +
      '<span class="ph-img tp-pc-img"' + imgKey(i.title) + ' aria-hidden="true"></span><span class="tp-pc-body"><span class="tp-pc-title' + (i.placeholder ? ' provenance-gap' : '') + '">' + esc(i.title) + '</span>' +
      '<span class="tp-pc-type">' + esc(type) + '</span>' +
      '<span class="tp-pc-why provenance-gap" data-why="' + esc(why) + '">' + esc(why) + '</span>' +
      (i.car ? '<span class="tp-pc-tour provenance-gap">No car? Ridgeline Tours runs a guided day' + (open ? '' : ' from ' + esc(i.how.from)) + '.</span>' : '') + '</span></button>' +
      addBtn(key, i.title + ' on ' + dl) + '</article>';
  }
  /* An idea's details (its own sheet from the page, or a level of the ideas sheet, back by the arrow): a placeholder image, title and
     type, why it fits that day, how to get there and how long it takes, then opening hours, price and a short
     description. Ideas are fixture-only (cnFreeIdeas has no hours, price or description), so those three are
     bracketed placeholders, pink with Annotations on. Add to your timeline and View full page (not linked yet). */
  function ideaDetail(i, d, noBack) {
    var id = 'i:' + i.id, key = id + '@' + d, dl = dayLabel(d), km = ideaKm(i);
    ITEMS[key] = { id: id, kind: 'place', idea: i.kind, title: i.title, kindLabel: i.kind === 'half' ? 'Half-day idea' : 'Day trip', place: howLine(i), day: dl };
    var h = ''; // its way back is the sheet's back arrow
    h += '<div class="plan-modal-img ph-img tp-idea-img"' + imgKey(i.title) + ' role="img" aria-label="Placeholder image of ' + esc(i.title) + '"></div>';
    h += '<p class="tp-pm-type">' + esc((i.kind === 'half' ? 'Half-day idea' : 'Day trip') + ' · ' + CITY[i.city]) + '</p>';
    h += '<h2 class="cn-pp-title' + (i.placeholder ? ' provenance-gap' : '') + '" id="tp-pm-title" tabindex="-1">' + esc(i.title) + '</h2>';
    h += '<p class="tp-pm-why provenance-gap">Fits ' + esc(dl) + (i.kind === 'half' ? ': it takes about half the day' : ': it takes the whole day') + (km !== null ? ', ' + esc(kmLine(km)) : '') + '.</p>';
    h += '<h3 class="cn-pp-h">Practical details</h3><dl class="pl-option-facts cn-pp-facts">' +
      '<div><dt>Getting there</dt><dd><span class="provenance-gap">' + esc(howLine(i)) + '</span>' + (i.car ? '<br><span class="provenance-gap">No car? Ridgeline Tours runs a guided day from ' + esc(i.how.from) + '.</span>' : '') + '</dd></div>' +
      '<div><dt>Opening hours</dt><dd><span class="provenance-gap">[Opening hours to come]</span></dd></div>' +
      '<div><dt>Price</dt><dd><span class="provenance-gap">[Price to come]</span></dd></div></dl>';
    h += '<p class="cn-pp-text provenance-gap tp-idea-desc">[A short description of ' + esc(i.title) + ' to come: what it is and why it is worth the time.]</p>';
    return h + pmActions(key, i.title + ' on ' + dl);
  }
  function freeBody(b) {
    var h = '', n = b.z - b.a + 1;
    for (var d = b.a; d <= b.z; d++) {
      var dl = dayLabel(d), its = dayItems(d), dk = b.key + ':' + d;
      h += '<div class="tp-fday"><h5 class="tp-grp">' + esc(dl) + '</h5>';
      if (dayFilled(d)) {
        FREEINFO.push({ d: d, label: dl, filled: true, count: 0, dk: dk, its: its, show: [], more: false, base: b.base });
        h += '<p class="tp-fday-done">Your day: ' + placeLinks(its, ' and ') + '. New ideas move on to your next free day.</p></div>';
        continue;
      }
      if (its.length) h += '<p class="tp-fday-so">So far: ' + placeLinks(its) + '. Room for one more.</p>';
      // Shared out so every free day left gets three to five while there are enough (More ideas shows the rest)
      var list = ideasFor(d, b.base), per = Math.max(3, Math.min(5, Math.floor(list.length / Math.max(1, FREE_LEFT)))), show = list.slice(0, moreBlk[dk] ? per + 4 : per);
      FREE_LEFT--;
      show.forEach(function (i) { SUGG[i.id] = true; });
      FREEINFO.push({ d: d, label: dl, filled: false, count: show.length, dk: dk, its: its, show: show, more: list.length > per, base: b.base });
      if (!show.length) h += '<p class="tp-empty">No new ideas for this day yet: everything has been suggested on another day. Free days can stay free.</p>';
      else h += '<div class="tp-pcs">' + show.map(function (i) { return ideaCard(i, d); }).join('') + '</div>';
      if (list.length > per) h += '<button type="button" class="tp-link tp-blk-more" data-more="' + esc(dk) + '" aria-expanded="' + !!moreBlk[dk] + '">' + (moreBlk[dk] ? 'Fewer ideas' : 'More ideas') + '</button>';
      h += '</div>';
    }
    // Three or more free days: the curated longer trips, as before
    var longs = n >= 3 ? TRIPS.filter(function (t) { return t.kind === 'long' && starts(t, b).length && (t.bases.indexOf(b.base) > -1 || (b.between && t.on_the_way)); }) : [];
    if (longs.length) h += '<h5 class="tp-grp">Or make it a longer trip</h5><div class="tp-pcs">' + longs.slice(0, 2).map(function (t) { return tripCard(t, b); }).join('') + '</div>';
    return h;
  }
  // A free day with one (or two) of their matches on: where to watch in NSW, the same fair venues as Where to watch
  function watchBody(b) {
    return alsoLine(b.day) + '<p class="tp-blk-note">' + (b.ms.length > 1 ? manyLine(b.ms) + ', so venues showing ' + (b.ms.length > 2 ? 'all of them' : 'both') + ' come first. ' : '') + 'Here\u2019s where to watch in NSW.</p>' +
      b.ms.map(matchLine).join('') + venueRows(b.ms, evKey(b.ms));
  }
  function halfBody(b) {
    var wd = weekdayOf(b.day), f = { d: dayLabel(b.day) };
    var list = halfList(b, wd);
    // Half a day holds two things at most, as a free day does: once full it shows what is in it, and no more Add
    var full = dayFilled(b.day);
    if (full) list = list.filter(function (p) { return added('p:' + p.id + ':' + f.d); });
    var show = moreBlk[b.key] || full ? list : list.slice(0, 3);
    var h = alsoLine(b.day) + (full ? '<p class="tp-fday-done">Your half day: ' + placeLinks(dayItems(b.day), ' and ') + '. That’s plenty for ' + (b.first ? 'an arrival day' : 'a last day') + '; remove one to see other ideas.</p>'
      : '<p class="tp-blk-note">' + (b.first ? 'Arrival day' : 'Last day') + ': ' + esc(halfNote(b).charAt(0).toLowerCase() + halfNote(b).slice(1)) + '</p>') + '<div class="tp-pcs">';
    show.forEach(function (p) {
      var o = hoursOn(p, wd), id = 'p:' + p.id + ':' + f.d, why = ['Open ' + f.d + ', ' + clock(o.opens) + ' to ' + clock(o.closes), p.pricing.is_free ? 'free' : p.pricing.band, p.address.suburb, kmLine(prodKm(p))].filter(Boolean).join(' · ');
      ITEMS[id] = { id: id, kind: 'product', title: p.title, kindLabel: PTYPE[p.type] || 'Product', place: p.address.suburb, day: f.d };
      MODAL[id] = { type: 'product', p: p, f: { d: f.d, v: CITY[b.base] }, o: o, why: why };
      h += productCard(p, why, id, f);
    });
    h += '</div>';
    if (list.length > 3 && !full) h += '<button type="button" class="tp-link tp-blk-more" data-more="' + esc(b.key) + '" aria-expanded="' + !!moreBlk[b.key] + '">' + (moreBlk[b.key] ? 'Fewer places' : 'More places') + '</button>';
    return h;
  }
  function heading(b) {
    if (b.kind === 'match') { var m = b.ms.filter(hasTicket)[0] || b.ms[0], f = m.f; return { when: dayLabel(b.day) + ' · Match day', what: matchName(f) + ', ' + (f.k || 'time to be confirmed') + ', ' + f.v + (hasTicket(m) ? ' (your ticket)' : '') }; }
    if (b.kind === 'free') { var n = b.z - b.a + 1; return { when: n + (n === 1 ? ' free day' : ' free days') + ' · ' + spanLabel(b.a, b.z), what: b.between ? 'Between Newcastle and Sydney' : 'From ' + (basePlace() || CITY[b.base]) }; }
    if (b.kind === 'watch') return { when: dayLabel(b.day) + ' \u00b7 Free day', what: (b.ms.length > 1 ? manyLine(b.ms) : kickLine(b.ms[0])) + '. Here\u2019s where to watch' };
    if (b.kind === 'half') return { when: dayLabel(b.day) + ' · ' + (b.first ? 'Arrival day' : 'Last day'), what: 'Half a day, ' + halfWhere(b) };
    return { when: dayLabel(b.day) + ' · Away', what: matchName(b.m.f) + ' in ' + b.m.f.a + ' (your ticket)' };
  }
  /* A free day's ideas, opened from its + on the axis in the sheet stacked over the timeline (16 Nov: they used to open
     inline under the axis). The same list the page shows for that day (the same ideas, Fits [day], More ideas and Add
     buttons), so adding here or on the page is one plan. When the day fills, it says so and offers the next free day,
     whose ideas the page has moved on to. Under the list, See all ideas for this day stands for the full page (not
     linked yet). What was added lands on the axis once the sheet closes. */
  var tlIdeas = document.getElementById('tp-tl-ideas'), tlIdeasDay = null, tlIdeasHold = null, tlIdeasHome = tlIdeas && tlIdeas.parentNode, tlIdeasNext = tlIdeas && tlIdeas.nextSibling, tlIdeasAdded = [];
  var tlIdeasOrder = {}; // the order each day's cards were shown in
  function freeInfo(d) { return FREEINFO.filter(function (x) { return x.d === d; })[0]; }
  function renderTlIdeas() {
    if (window.tpFreeApi) window.tpFreeApi.set(FREEINFO.map(function (x) { return { d: x.d, label: x.label, filled: x.filled, count: x.count }; }));
    if (!tlIdeas) return;
    var fd = tlIdeasDay !== null ? freeInfo(tlIdeasDay) : null;
    if (!fd) { tlIdeas.innerHTML = ''; tlIdeas.style.minHeight = ''; tlIdeasHold = null; return; }
    // While the same day stays open the list never gets shorter (a day that fills shrinks to one line), so the sheet
    // keeps its scroll
    if (tlIdeasHold === fd.d && tlIdeas.offsetHeight) tlIdeas.style.minHeight = Math.max(parseFloat(tlIdeas.style.minHeight) || 0, tlIdeas.offsetHeight) + 'px';
    else tlIdeas.style.minHeight = '';
    tlIdeasHold = fd.d;
    // Ideas added to this day stay in the list, first, marked Added (tap again to take one off); anything else on the
    // day (a place saved from the map, say) is named in one line
    var kept = IDEAS.filter(function (i) { return fd.its.some(function (x) { return x.id === 'i:' + i.id; }); });
    var other = fd.its.filter(function (x) { return !kept.some(function (i) { return x.id === 'i:' + i.id; }); });
    var line = fd.filled ? 'Your day is full' : fd.count + (fd.count === 1 ? ' idea' : ' ideas');
    var h = '<h2 class="cn-pp-title tp-tl-ideas-h" id="tp-pm-title" tabindex="-1">' + esc(fd.label) + '</h2><p class="tp-tl-ideas-sub" id="tp-tl-ideas-h">Free day · ' + esc(line) + '</p>';
    if (other.length) h += '<p class="tp-fday-so">Also on your plan that day: ' + placeLinks(other) + '.</p>';
    // Cards keep the order they were shown in, so adding one leaves it where it was (Back lands on the same place);
    // new ones go after
    var pool = kept.concat(fd.filled ? [] : fd.show), seenOrd = tlIdeasOrder[fd.d] || [];
    var cards = seenOrd.map(function (id) { return pool.filter(function (i) { return i.id === id; })[0]; }).filter(Boolean)
      .concat(pool.filter(function (i) { return seenOrd.indexOf(i.id) < 0; }));
    tlIdeasOrder[fd.d] = cards.map(function (i) { return i.id; }).concat(seenOrd.filter(function (id) { return !cards.some(function (i) { return i.id === id; }); }));
    if (cards.length) h += '<div class="tp-pcs">' + cards.map(function (i) { return ideaCard(i, fd.d, true); }).join('') + '</div>';
    if (fd.filled) {
      // Full: the list stays, with what is in the day marked Added, then the next free day
      var next = FREEINFO.filter(function (x) { return x.d > fd.d && !x.filled; })[0] || FREEINFO.filter(function (x) { return !x.filled; })[0];
      h += '<p class="tp-fday-done">Your day is full' + (kept.length ? '' : ': ' + esc(fd.its.map(function (x) { return x.title; }).join(' and '))) + '. New ideas move on to your next free day; take one off to see others here.</p>';
      if (next) h += '<button type="button" class="tp-go-btn tp-tl-ideas-next" data-tlideas-go="' + next.d + '">Next free day: ' + esc(next.label) + ' · ' + next.count + (next.count === 1 ? ' idea' : ' ideas') + '</button>';
    } else {
      if (!fd.show.length) h += '<p class="tp-empty">No new ideas for this day yet: everything has been suggested on another day. Free days can stay free.</p>';
      if (fd.more) h += '<button type="button" class="tp-link tp-blk-more" data-tlideas-more="' + esc(fd.dk) + '" aria-expanded="' + !!moreBlk[fd.dk] + '">' + (moreBlk[fd.dk] ? 'Fewer ideas' : 'More ideas') + '</button>';
    }
    h += '<div class="tp-pm-acts tp-tl-ideas-full"><span class="tp-pm-full" role="link" aria-disabled="true">See all ideas for this day</span><span class="tp-pm-soon">Not linked yet</span></div>';
    tlIdeas.innerHTML = h;
  }
  // The list is one element, lent to the sheet while it is open and put back after
  function tlIdeasReturn() {
    if (!tlIdeas || !tlIdeasHome || tlIdeas.parentNode === tlIdeasHome) return;
    tlIdeasHome.insertBefore(tlIdeas, tlIdeasNext && tlIdeasNext.parentNode === tlIdeasHome ? tlIdeasNext : null);
    tlIdeas.hidden = true; tlIdeas.style.minHeight = ''; tlIdeasHold = null;
  }
  phone.addEventListener('tp:freeideas', function (e) {
    tlIdeasDay = e.detail.day;
    // Next free day: the open sheet swaps to that day, from its top
    if (tlIdeasDay !== null && pmOpen && pmOpen.id.indexOf('ideas:') === 0) { pmOpen.id = 'ideas:' + tlIdeasDay; tlIdeas.style.minHeight = ''; tlIdeasHold = null; pmBody.scrollTop = 0; }
    renderTlIdeas();
  });
  if (tlIdeas) {
    tlIdeas.addEventListener('click', function (e) {
      // An idea's details, and the next free day, are levels of the sheet (drill down, with the back arrow)
      var op = e.target.closest('[data-idea-open]');
      if (op) { pmPush('idea:' + op.dataset.ideaOpen, op); return; }
      var g = e.target.closest('[data-tlideas-go]');
      if (g) { pmPush('ideas:' + g.dataset.tlideasGo, g); return; }
      var m = e.target.closest('[data-tlideas-more]');
      if (m) { var k = m.dataset.tlideasMore; moreBlk[k] = !moreBlk[k]; render(true, '#tp-tl-ideas [data-tlideas-more="' + CSS.escape(k) + '"]'); }
    });
  }
  /* ---------- The map view of Your days, in order (drawn by concepts-map.js) ----------
     The same days, ideas and Add buttons as the list, as steps: one per day once dates are set (a long plan merges runs
     of free days with nothing added). Each step has an anchor (home on free days, the stadium on match days), its pins
     (made-up coordinates, concepts-geo.js) and the card's HTML, built with the list's own card functions so the ITEMS
     behind every Add button are the same ones. Pins are numbered clockwise from north, never by rank, and a day's
     products come in a rotating order, so no business is favoured. */
  var LASTM = null, LASTBS = [], GEO = window.cnGeo || null;
  var AWAY_LL = { Brisbane: [-27.47, 153.02], Melbourne: [-37.81, 144.96], Adelaide: [-34.93, 138.6], Perth: [-31.95, 115.86], Townsville: [-19.26, 146.82] };
  function hash(str) { var n = 7; for (var i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) % 100003; return n; }
  function homeLL() { var n = basePlace(); return n && GEO && GEO.places[n] ? { ll: GEO.places[n], name: n, home: true } : null; }
  function stadiumLL(v) { return GEO && GEO.venues[v] ? { ll: GEO.venues[v], name: v } : null; }
  // Without a base: the stadium of the nearest match in time, in that city
  function nearStadium(d, city) {
    var best = null;
    (LASTM ? LASTM.nsw : []).forEach(function (m) { if (city && cityOf(m.f.v) !== city) return; if (!best || Math.abs(m.day - d) < Math.abs(best.day - d)) best = m; });
    if (best) return stadiumLL(best.f.v);
    return stadiumLL(city === 'newcastle' ? 'Newcastle Stadium' : 'Stadium Australia');
  }
  function stepsOf(bs) {
    var out = [];
    bs.forEach(function (b) {
      if (b.kind === 'free') for (var d = b.a; d <= b.z; d++) out.push({ kind: 'free', day: d, days: [d], b: b });
      else out.push({ kind: b.kind, day: b.day, days: [b.day], b: b });
    });
    // A long plan (more than 12 days): runs of free days with nothing added become one step (each day is a tab on its card)
    if (out.length > 12) {
      var merged = [];
      out.forEach(function (st) {
        var last = merged[merged.length - 1];
        var empty = st.kind === 'free' && !dayItems(st.day).length;
        if (empty && last && last.kind === 'free' && last.empty && last.days[last.days.length - 1] === st.day - 1) { last.days.push(st.day); return; }
        st.empty = empty; merged.push(st);
      });
      out = merged;
    }
    return out;
  }
  // Where something they added sits: an idea, a product, or a place saved from the map (each has its own coordinates)
  function addedLL(x) {
    if (!GEO) return null;
    if (x.kind === 'poi') { var p = poiOf(x); return p ? p.ll : null; }
    if (x.kind === 'product') { var pid = (x.id || '').split(':')[1]; return GEO.products[pid] || null; }
    return GEO.ideas[(x.id || '').replace(/^i:/, '').replace(/@.*$/, '')] || null;
  }
  function pinsOf(list, anchor) {
    // Numbered clockwise from north around the day's anchor: geography decides the order, not a ranking
    var a = anchor && anchor.ll;
    list.forEach(function (p) { p.ang = a ? (Math.atan2(p.ll[1] - a[1], p.ll[0] - a[0]) * 180 / Math.PI + 360) % 360 : 0; });
    list.sort(function (x, y) { return x.ang - y.ang; });
    list.forEach(function (p, i) { p.n = i + 1; });
    return list;
  }
  function nearProducts(venue, wd, d, n) {
    return PRODUCTS.filter(function (p) { return p.distance_to_venue && p.distance_to_venue.venue_ref === venue && hoursOn(p, wd); })
      .sort(function (x, y) { return hash(x.id + ':' + d) - hash(y.id + ':' + d); }).slice(0, n);
  }
  function productPins(ps, f, m) {
    return ps.map(function (p) {
      var o = hoursOn(p, weekdayOf(m.day)), id = 'p:' + p.id + ':' + f.d, why = reason(p, o, { m: m });
      ITEMS[id] = { id: id, kind: 'product', title: p.title, kindLabel: PTYPE[p.type] || 'Product', place: p.address && p.address.suburb, day: f.d, matchName: matchName(f) };
      MODAL[id] = { type: 'product', p: p, f: f, o: o, why: why };
      return { key: id, title: p.title, kindLabel: PTYPE[p.type] || 'Product', ll: GEO && GEO.products[p.id], html: productCard(p, why, id, f) };
    }).filter(function (x) { return x.ll; });
  }
  function mapStep(st, sub) {
    var b = st.b, d = sub !== undefined ? sub : st.day, dl = dayLabel(d), home = homeLL(), r = { day: d, label: dl, kind: st.kind, pins: [], loops: [], home: home };
    if (st.kind === 'match') {
      var m = b.ms.filter(hasTicket)[0] || b.ms[0], f = m.f, sl = stadiumLL(f.v);
      r.anchor = sl; r.place = CITY[cityOf(f.v)]; r.kicker = dl + ' \u00b7 Match day';
      // Match day is the hero of the walk-through (16 Nov): the teams with their stripes, kick-off and venue lead the card
      r.title = matchName(f) + ', ' + (f.k ? f.k + ' kick-off' : 'kick-off to be confirmed') + ', ' + f.v;
      r.hero = { teams: f.t ? f.t.split(' v ') : [], k: f.k, v: f.v, ticket: hasTicket(m) };
      if (b.ms.length > 1) r.note = 'Also that day: ' + b.ms.filter(function (x) { return x !== m; }).map(function (x) { return matchName(x.f); }).join(', ');
      r.lead = goOne(m);
      r.pins = productPins(nearProducts(f.v, weekdayOf(d), d, 3), f, m);
      // The map frames where the day starts (where they are staying, else the city centre the route starts at) and the
      // stadium, with the way there and back between them
      r.start = home || startOf(f);
      if (r.start && sl) r.loops.push({ from: r.start.ll, to: sl.ll, match: true });
    } else if (st.kind === 'watch') {
      var city = baseCity() || 'sydney';
      r.anchor = home || nearStadium(d, city); r.place = home ? home.name : CITY[city];
      r.kicker = dl + ' \u00b7 Free day'; r.title = (b.ms.length > 1 ? manyLine(b.ms) : kickLine(b.ms[0])) + '. Where to watch';
      r.body = venueRows(b.ms, evKey(b.ms));
      r.pins = venuesFor(b.ms).map(function (c) { return { key: 'w:' + c.j + ':' + evKey(b.ms), title: c.sp.name, kindLabel: SPOT_TYPE[c.sp.type] || 'Screening', ll: GEO && GEO.watch[c.j] }; }).filter(function (x) { return x.ll; });
    } else if (st.kind === 'half') {
      var wd = weekdayOf(d), c2 = b.base, fx = { d: dl, v: CITY[c2] };
      r.anchor = home || nearStadium(d, c2); r.place = home ? home.name : CITY[c2];
      r.kicker = dl + ' \u00b7 ' + (b.first ? 'Arrival day' : 'Last day'); r.title = 'Half a day, ' + halfWhere(b);
      if (basePlace() && !halfNear(b)) r.note = halfNote(b);
      // Nearest to where they are staying once that is known; otherwise a rotating order, so no business is favoured
      var ps = basePlace() ? halfList(b, wd).slice(0, 3) : halfList(b, wd).sort(function (x, y) { return hash(x.id + ':' + d) - hash(y.id + ':' + d); }).slice(0, 3);
      if (dayFilled(d)) { ps = halfList(b, wd).filter(function (p) { return added('p:' + p.id + ':' + dl); }); r.note = 'Your half day is full.'; }
      r.pins = ps.map(function (p) {
        var o = hoursOn(p, wd), id = 'p:' + p.id + ':' + dl, why = ['Open ' + dl + ', ' + clock(o.opens) + ' to ' + clock(o.closes), p.pricing.is_free ? 'free' : p.pricing.band, p.address.suburb, kmLine(prodKm(p))].filter(Boolean).join(' \u00b7 ');
        ITEMS[id] = { id: id, kind: 'product', title: p.title, kindLabel: PTYPE[p.type] || 'Product', place: p.address.suburb, day: dl };
        MODAL[id] = { type: 'product', p: p, f: fx, o: o, why: why };
        return { key: id, title: p.title, kindLabel: PTYPE[p.type] || 'Product', ll: GEO && GEO.products[p.id], html: productCard(p, why, id, fx) };
      }).filter(function (x) { return x.ll; });
    } else if (st.kind === 'away') {
      var am = b.m, ll = AWAY_LL[am.f.a];
      r.anchor = home || nearStadium(d, 'sydney'); r.place = am.f.a; r.away = ll ? { ll: ll, name: am.f.a } : null;
      r.kicker = dl + ' \u00b7 Away'; r.title = matchName(am.f) + ' in ' + am.f.a + ' (your ticket)';
      r.body = '<p class="tp-blk-note">Off this map: you\u2019re in ' + esc(am.f.a) + ' for the match.</p>';
    } else {
      var fd = freeInfo(d), city3 = b.base;
      r.anchor = home || nearStadium(d, city3); r.place = home ? home.name : CITY[city3];
      r.kicker = dl + ' \u00b7 Free day' + (home ? ' \u00b7 from ' + home.name : '');
      r.title = st.days.length > 1 ? st.days.length + ' free days' : ''; // one free day: the heading already says so
      var its = fd ? fd.its : dayItems(d);
      if (fd && fd.filled) r.body = '<p class="tp-fday-done">Your day: ' + placeLinks(its, ' and ') + '. New ideas move on to your next free day.</p>';
      else if (fd) {
        if (its.length) r.note = 'So far: ' + its.map(function (x) { return x.title; }).join(', ') + '. Room for one more.';
        r.pins = fd.show.map(function (i) { var key = 'i:' + i.id + '@' + d; return { key: key, title: i.title, kindLabel: i.kind === 'half' ? 'Half-day idea' : 'Day trip', ll: GEO && GEO.ideas[i.id], trip: i.kind === 'day', html: ideaCard(i, d) }; }).filter(function (x) { return x.ll; });
      }
      // What is already on that day: shown as done pins, with a loop for a day trip
      its.forEach(function (x) {
        var ll = addedLL(x);
        if (ll) r.pins.push({ key: null, title: x.title, kindLabel: 'Added', ll: ll, done: true, trip: x.idea === 'day' });
      });
      r.pins.forEach(function (p) { if (p.trip && r.anchor) r.loops.push({ from: r.anchor.ll, to: p.ll, done: !!p.done }); });
    }
    // Match, half and watch days: what else is on their plan that day (a place saved from the map), said and pinned
    if (st.kind !== 'free' && st.kind !== 'away') {
      var also = alsoItems(d);
      if (also.length) r.note = (r.note ? r.note + ' ' : '') + 'Also on your plan: ' + also.map(function (x) { return x.title; }).join(', ') + '.';
      also.forEach(function (x) { var ll = addedLL(x); if (ll) r.pins.push({ key: null, title: x.title, kindLabel: 'Added', ll: ll, done: true }); });
    }
    pinsOf(r.pins, r.anchor);
    if (!r.body) r.body = r.pins.filter(function (p) { return p.html; }).length ? '<div class="tp-pcs tp-map-pcs">' + r.pins.filter(function (p) { return p.html; }).map(function (p) { return p.html.replace('<article class="tp-pc', '<article data-pin="' + p.n + '" class="tp-pc'); }).join('') + '</div>' : '';
    return r;
  }
  tp.mapPlan = function () {
    if (!LASTM || !LASTM.range || !GEO) return null;
    return stepsOf(LASTBS);
  };
  tp.mapStep = mapStep;
  // See as a list: the list opens at that day's block
  tp.listShowDay = function (d) {
    var b = LASTBS.filter(function (x) { return x.kind === 'free' ? d >= x.a && d <= x.z : x.day === d; })[0];
    if (!b) return;
    openSet[b.key] = true;
    render(true);
    var head = thirdList.querySelector('[data-blk-toggle="' + b.key + '"]');
    if (!head) return;
    var top = head.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16 - (window.tpCapRoom ? window.tpCapRoom() : 0);
    body.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    head.focus({ preventScroll: true });
  };
  function renderThird() {
    SUGG = {}; FREEINFO = [];
    // With no team but their days set (T16), the days still lead: free stretches with day trips and longer trips
    var M = model(), bs = blocks(M), first = teaser() && !M.range;
    LASTM = M; LASTBS = bs;
    // Free days' ideas in date order, open or not, so nothing is suggested twice on the page
    FREE_LEFT = 0; bs.forEach(function (b) { if (b.kind === 'free') for (var d = b.a; d <= b.z; d++) if (!dayFilled(d)) FREE_LEFT++; });
    bs.forEach(function (b) { if (b.kind === 'free') b._html = freeBody(b); });
    if (thirdNote) thirdNote.textContent = first ? 'A first look: around the next NSW match day. Each links out; nothing is booked here.'
      : M.range ? 'Your days in NSW, in order: match days and the free days between them. Each links out; nothing is booked here.'
      : M.own && !M.nsw.length && !M.local ? tp.list(state.picked.filter(function (n) { return tp.teams[n]; })) + ' plays interstate, so these are the NSW match days you could go to. Each links out; nothing is booked here.'
      : 'Your match days in NSW. Each links out; nothing is booked here.';
    // Only the next block is open to start with; a different set of days starts again from the next one
    var sigNow = bs.map(function (b) { return b.key; }).join(',');
    if (sigNow !== blkSig || !openSet) { blkSig = sigNow; openSet = {}; var nx = bs.filter(function (b) { return b.kind !== 'away'; })[0]; if (nx) openSet[nx.key] = true; }
    if (!bs.length) {
      thirdList.innerHTML = '<p class="tp-empty">' + (stay() ? 'No NSW match falls in your days here (' + esc(tp.isoRange(trip().from, trip().to)) + '). Change your days, or see Where to watch above.' : 'There are no NSW matches to plan around yet. See Where to watch above.') + '</p>';
      return;
    }
    var h = '';
    bs.forEach(function (b) {
      var hd = heading(b), open = !!openSet[b.key], bid = 'tp-blk-' + b.key;
      if (b.kind === 'away') { h += '<div class="tp-blk tp-blk--away"><p class="tp-blk-line"><span class="tp-blk-when">' + esc(hd.when) + '</span> <span class="tp-blk-what">' + esc(hd.what) + '</span></p></div>'; return; }
      h += '<section class="tp-blk tp-blk--' + b.kind + '" data-blk="' + b.key + '"><h4 class="tp-blk-h"><button type="button" class="tp-blk-head" data-blk-toggle="' + b.key + '" aria-expanded="' + open + '" aria-controls="' + bid + '">' +
        '<span class="tp-blk-when">' + esc(hd.when) + '</span><span class="tp-blk-what">' + esc(hd.what) + '</span><span class="tp-blk-chev" aria-hidden="true"></span></button></h4>' +
        '<div class="tp-blk-body" id="' + bid + '"' + (open ? '' : ' hidden') + '>' + (open ? (b.kind === 'match' ? matchBody(b, M) : b.kind === 'free' ? b._html : b.kind === 'watch' ? watchBody(b) : halfBody(b)) : '') + '</div></section>';
    });
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
  pm.innerHTML = '<div class="cn-bar"><button type="button" class="cn-close tp-pm-back" data-pm-back aria-label="Back" hidden><svg class="cn-x" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M9 2L4 7l5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><p class="cn-bar-title" id="tp-pm-kind"></p><button type="button" class="cn-close" data-pm-close aria-label="Close"><svg class="cn-x" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div><div class="cn-pp-body" id="tp-pm-body" tabindex="-1"></div>';
  phone.appendChild(pm);
  // A match opens as a sheet from the bottom, over a scrim; products and places stay full-screen pages
  var pmScrim = document.createElement('div');
  pmScrim.className = 'tp-pm-scrim'; pmScrim.hidden = true;
  phone.insertBefore(pmScrim, pm);
  pmScrim.addEventListener('click', function () { pmClearHistory(); closePm(); }); // the dark area closes the whole sheet, every level
  pmBody = pm.querySelector('#tp-pm-body'); pmKind = pm.querySelector('#tp-pm-kind');
  function pmActions(id, label) {
    var on = added(ITEMS[id] ? ITEMS[id].id : id);
    return '<div class="tp-pm-acts"><button type="button" class="tp-pill tp-pm-add" data-pm-add="' + esc(id) + '" aria-pressed="' + on + '"><span class="tp-pm-add-l">' + addLabel(on, on ? 'Added to your timeline' : 'Add to your timeline') + '</span><span class="visually-hidden">, ' + esc(label) + '</span></button>' +
      '<span class="tp-pm-full" role="link" aria-disabled="true">View full page</span><span class="tp-pm-soon">Not linked yet</span></div>';
  }
  function pmProduct(id, x) {
    var p = x.p, f = x.f, h = '';
    h += '<div class="plan-modal-img ph-img"' + imgKey(p.title) + ' role="img" aria-label="Placeholder image of ' + esc(p.title) + '"></div><div class="plan-modal-body">';
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
    h += '<div class="plan-modal-img ph-img"' + imgKey(sp.name) + ' role="img" aria-label="Placeholder image of ' + esc(sp.name) + '"></div><div class="plan-modal-body">';
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
    // An interstate match leads with where to watch it in NSW: the fan zone, the village and pubs screening it (gap data)
    if (f.a) {
      var sps = spotsFor(m);
      h += '<section class="tp-pm-watch" aria-labelledby="tp-pm-watch-h"><h3 class="cn-pp-h" id="tp-pm-watch-h">Where to watch it in NSW</h3>' +
        (sps.length ? '<ul class="tp-wv tp-pm-watch-list">' + sps.map(function (sp) {
          var id = spotItem(sp, m), open = ITEMS[id].note;
          return venueRow(id, sp.name, esc(SPOT_TYPE[sp.type] || 'Screening') + ' \u00b7 ' + esc(sp.place) + (open ? ' \u00b7 ' + esc(open) : ''),
            addBtn(id, sp.name + ', ' + matchName(f) + ' on ' + f.d).replace('class="tp-add"', 'class="tp-add" data-pm-spot="' + esc(id) + '"'));
        }).join('') + '</ul>' : '<p class="tp-pm-note">No NSW screenings listed for this match yet.</p>') + '</section>';
    }
    h += '<dl class="pl-option-facts cn-pp-facts tp-pm-summary">' +
      '<div><dt>Date</dt><dd>' + esc(f.d) + '</dd></div>' +
      '<div><dt>Kick-off</dt><dd>' + (f.k ? esc(f.k) + ' Sydney time' : 'Time to be confirmed') + '</dd></div>' +
      '<div><dt>Venue</dt><dd>' + esc(f.v) + '</dd></div>' +
      '<div><dt>City</dt><dd>' + esc(f.p) + (f.a ? ' (interstate)' : ', NSW') + '</dd></div></dl>';
    // On the timeline already, through a team or Here for the rugby: say so instead of offering to add it
    h += '<div class="tp-pm-acts tp-pm-acts--match">';
    if (by.length || rugby) h += '<p class="tp-pm-on">' + window.tpIcons.added + '<span>On your timeline: ' + (by.length ? esc(tp.list(by)) + (by.length === 1 ? ' is one of your teams' : ' are your teams') : 'Every NSW match is on') + '</span></p>';
    else h += '<button type="button" class="tp-pill tp-pm-add" data-pm-match="' + esc(key) + '" aria-pressed="' + on + '"><span class="tp-pm-add-l">' + addLabel(on, on ? 'Added to my timeline' : 'Add to my timeline') + '</span><span class="visually-hidden"> for ' + esc(matchName(f)) + ', ' + esc(f.d) + '</span></button>';
    if (f.t) h += '<label class="tp-ticket tp-pm-ticket"><input type="checkbox" data-pm-ticket="' + esc(m.tkey) + '"' + (state.tickets.indexOf(m.tkey) > -1 ? ' checked' : '') + ' aria-describedby="tp-pm-ticket-why" /><span class="tp-pm-ticket-l">' + window.tpIcons.ticket + 'I have a ticket</span></label><p class="tp-ticket-why" id="tp-pm-ticket-why">Mark it if you\u2019re going, so we skip its screenings and plan your days around it.</p>';
    h += '</div>';
    if (teams.length) {
      // The same toggle as Add to my timeline: pressed reads Added, with a tick; pressing it again takes the team off
      h += '<h3 class="cn-pp-h">Your teams</h3><div class="tp-pm-teams">' + teams.map(function (n) {
        var on = tp.isPicked(n);
        return '<button type="button" class="tp-pm-team" data-pm-team="' + esc(n) + '" aria-pressed="' + on + '">' + addLabel(on, on ? esc(n) + ' added to my teams' : 'Add ' + esc(n) + ' to my teams') + '</button>';
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
    h += '<div class="plan-modal-img ph-img"' + imgKey(t.title || t.region) + ' role="img" aria-label="Placeholder image of ' + esc(t.region) + '"></div><div class="plan-modal-body">';
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
      return '<article class="tp-pc tp-stop"><span class="ph-img tp-pc-img"' + imgKey(st.title) + ' aria-hidden="true"></span><span class="tp-pc-body"><span class="tp-pc-title provenance-gap">' + esc(st.title) + '</span>' +
        '<span class="tp-pc-type provenance-gap">' + esc(PTYPE[st.type] || 'Product') + ' \u00b7 ' + esc(st.suburb) + '</span>' +
        '<span class="tp-stop-src">' + esc(SOURCE[st.source]) + '</span></span></article>';
    }).join('') + '</div>';
    h += pmActions(id, t.region) + '</div>';
    return h;
  }
  /* ---------- An added item from the timeline: its details, Move and Remove (stacked over the timeline) ----------
     Where it can go: places and products on the days they are open (fixture opening hours, gap data), a fan zone or
     village between its open dates, all inside the days in NSW if set, else the tournament; trips use tripMoves.
     A screening belongs to one match's broadcast, so it is not moved, only removed. */
  function addedItem(id) { return state.added.filter(function (x) { return x.id === id; })[0] || null; }
  function productOf(it) { var pid = it.id.split(':')[1]; return PRODUCTS.filter(function (p) { return p.id === pid; })[0] || null; }
  function spotOf(it) { return SPOTS[+it.id.split(':')[1]] || null; }
  function openOn(it, d) {
    if (it.kind === 'poi') { var pp = poiOf(it); return !pp || pp.open.indexOf(weekdayOf(d)) > -1; }
    if (it.kind === 'product') { var p = productOf(it); return !p || !p.availability || p.availability.kind !== 'opening_hours' ? true : !!hoursOn(p, weekdayOf(d)); }
    if (it.kind === 'place') { var sp = spotOf(it); return !sp || !sp.open_from ? true : d >= tp.isoDay(sp.open_from) && d <= tp.isoDay(sp.open_to); }
    return true;
  }
  /* For the day cards (concepts-plan.js, 16 Nov): what an added item can show without inventing anything. A product's
     opening hours on its day (indicative fixture data), and whether it sits before or after that day's match by the same
     rule as Before the match / After the final whistle (its hours against the kick-off). Nothing else has a time. */
  tp.itemHours = function (it) {
    if (it.kind !== 'product' || !it.day) return '';
    var p = productOf(it), o = p && hoursOn(p, weekdayOf(tp.dayOf(it.day)));
    return o ? 'Open ' + clock(o.opens) + ' to ' + clock(o.closes) : '';
  };
  tp.itemSlot = function (it, kick) {
    if (it.kind !== 'product' || !it.day) return null;
    var p = productOf(it), o = p && hoursOn(p, weekdayOf(tp.dayOf(it.day))), k = kickMins(kick);
    if (!o || k === null) return null;
    var bb = openAt(o, k - 90), aa = openAt(o, Math.min(1439, k + 150));
    return bb && aa ? null : bb ? 'before' : aa ? 'after' : hm(o.opens) < k ? 'before' : 'after';
  };
  tp.itemMoves = function (it) { return itemMoves(it); };
  /* The map's card row (17 Nov, concepts-map.js): the person's route as stops in day order, each with the things the
     page already offers there, as the same items (the same ids and Add) as everywhere else:
     - a match in NSW: the products near its stadium open that day (with their indicative hours) and the made-up places
       near it (open that day), nearest first, so none is ranked; an Add puts it on that match day;
     - a match interstate: the NSW screenings of it (its kick-off is their time);
     - with days set, each free day with ideas: those ideas (they have no hours).
     Positions are the prototype's made-up coordinates (concepts-geo.js); anything without one is left out. */
  tp.mapStops = function () {
    if (!tp.own()) return [];
    var GEOX = window.cnGeo || {}, POIS = (window.cnMapPoi && window.cnMapPoi.pois) || [], out = [], seen = {};
    function dist(a, b) { if (!a || !b) return 99; var dx = (a[1] - b[1]) * 92, dy = (a[0] - b[0]) * 111; return Math.sqrt(dx * dx + dy * dy); }
    tp.userMatches().forEach(function (m) {
      var f = m.f, wd = weekdayOf(m.day);
      if (!f.a) {
        var sk = 'm' + m.day + '|' + f.v; if (seen[sk]) { seen[sk].ms.push(m); return; }
        var at = GEOX.venues && GEOX.venues[f.v], its = [];
        PRODUCTS.forEach(function (p) {
          if (!p.distance_to_venue || p.distance_to_venue.venue_ref !== f.v) return;
          var o = hoursOn(p, wd), ll = GEOX.products && GEOX.products[p.id]; if (!o || !ll) return;
          var key = 'p:' + p.id + ':' + f.d;
          if (!ITEMS[key]) ITEMS[key] = { id: key, kind: 'product', title: p.title, kindLabel: PTYPE[p.type] || 'Product', place: p.address && p.address.suburb, day: f.d, matchName: matchName(f) };
          if (!MODAL[key]) MODAL[key] = { type: 'product', p: p, f: f, o: o, why: reason(p, o, { m: m }) };
          its.push({ key: key, open: key, title: p.title, type: PTYPE[p.type] || 'Product', time: 'Open ' + clock(o.opens) + ' to ' + clock(o.closes), ll: ll, d: dist(ll, at) });
        });
        POIS.forEach(function (q) {
          if (q.near !== f.v || q.open.indexOf(wd) < 0) return;
          var key = 'poi:' + q.id;
          // An Add from the card puts it on this match day (agreed 17 Nov), not in Saved, not placed yet
          ITEMS['mp:' + q.id + ':' + f.d] = { id: key, kind: 'poi', poi: q.id, title: q.title, kindLabel: q.cat, place: q.area, day: f.d, matchName: matchName(f) };
          its.push({ key: 'mp:' + q.id + ':' + f.d, open: 'poi:' + q.id, title: q.title, type: q.cat, time: 'Open ' + f.d, ll: q.ll, d: dist(q.ll, at), made: true });
        });
        its.sort(function (x, y) { return x.d - y.d || x.title.localeCompare(y.title); });
        var st = { key: sk, day: m.day, kind: 'match', ms: [m], label: f.d + ' · ' + f.v, ll: at, items: its };
        seen[sk] = st; out.push(st);
      } else {
        var ws = [];
        SPOTS.forEach(function (v, j) {
          var ll = GEOX.watch && GEOX.watch[j]; if (!ll || !f.t || v.shows.indexOf(m.key) < 0) return;
          var key = spotItem(v, m); // the venue's own details, as from Where to watch
          ws.push({ key: key, open: key, title: v.name, type: (SPOT_TYPE[v.type] || 'Screening') + ' · ' + v.place, time: f.k ? 'Shows the ' + f.k + ' kick-off' : '', ll: ll, d: SPOT_ORDER[v.type] * 10 + j, made: true });
        });
        ws.sort(function (x, y) { return x.d - y.d; });
        ws = ws.slice(0, 3); // three to start (fan zones first); Where to watch on the page lists them all
        out.push({ key: 'a' + m.day + '|' + f.t, day: m.day, kind: 'away', ms: [m], label: f.d + ' · Watch ' + (f.t || f.s) + ' in NSW', ll: null, items: ws });
      }
    });
    // With days set: the free days and their ideas, in day order among the matches
    FREEINFO.forEach(function (fd) {
      if (fd.filled || !fd.show || !fd.show.length) return;
      var its = fd.show.map(function (i) {
        var key = 'i:' + i.id + '@' + fd.d, ll = GEOX.ideas && GEOX.ideas[i.id]; if (!ll || !ITEMS[key]) return null;
        return { key: key, open: 'idea:' + key, title: i.title, type: (i.kind === 'half' ? 'Half-day idea' : 'Day trip') + ' · ' + CITY[i.city], time: '', ll: ll, made: !!i.placeholder };
      }).filter(Boolean);
      if (its.length) out.push({ key: 'f' + fd.d, day: fd.d, kind: 'free', label: fd.label + ' · Free day', ll: null, items: its });
    });
    out.sort(function (a, b) { return a.day - b.day; });
    return out.filter(function (st) { return st.items.length; });
  };
  tp.addBtnHtml = function (key, label) { return addBtn(key, label); };
  tp.imgAttr = function (title) { return imgKey(title); };
  tp.moveItem = function (id, d) { return moveItem(id, d); };
  tp.freeDays = function () { return FREEINFO.map(function (x) { return { d: x.d, filled: x.filled, count: x.count }; }); };
  tp.imgKey = function (title) { return imgKey(title); };
  tp.itemClosed = function (it, d) { return (it.kind === 'product' || it.kind === 'place' || it.kind === 'poi') && !it.unplaced && !openOn(it, d); };

  /* ---------- Saved, not placed yet ----------
     A place added from the map before their days are set has no day yet (day '', unplaced). It waits in a "Saved, not
     placed yet" group in the plan and the timeline, and is slotted once days are set, without asking: near a stadium,
     that stadium's match day if it is in their days; otherwise the first free day with room (none or one idea so far);
     always a day it is open. If nothing fits it stays in the group, saying so. Agreed 15 November 2026. */
  var POI = window.cnMapPoi || null;
  function poiOf(it) { return POI && it.poi ? POI.pois.filter(function (p) { return p.id === it.poi; })[0] || null : null; }
  // A place near a stadium (from the map above the matches): its own sheet, with Add to your plan
  function poiDays(p) {
    var order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], N = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
    var o = order.filter(function (d) { return p.open.indexOf(d) > -1; });
    if (o.length === 7) return 'Every day';
    var a = order.indexOf(o[0]), z = order.indexOf(o[o.length - 1]);
    return z - a + 1 === o.length ? N[o[0]] + ' to ' + N[o[o.length - 1]] : o.map(function (d) { return N[d]; }).join(', ');
  }
  function pmPoi(p) {
    var it = addedItem('poi:' + p.id), on = !!it, near = p.near === 'village' ? 'the fan village' : p.near;
    var h = '<div class="plan-modal-img ph-img"' + imgKey(p.title) + ' role="img" aria-label="Placeholder image of ' + esc(p.title) + '"></div><div class="plan-modal-body">';
    h += '<p class="tp-pm-type provenance-gap">' + esc(p.cat) + '</p>';
    h += '<h2 class="cn-pp-title provenance-gap" id="tp-pm-title">' + esc(p.title) + '</h2>';
    h += '<p class="cn-pp-venue provenance-gap">' + esc(p.area) + ' \u00b7 near ' + esc(near) + '</p>';
    h += '<h3 class="cn-pp-h">Practical details</h3><dl class="pl-option-facts cn-pp-facts">' +
      '<div><dt>Open</dt><dd><span class="provenance-gap">' + esc(poiDays(p)) + '</span></dd></div>' +
      '<div><dt>On your plan</dt><dd>' + (!it ? 'Not yet' : it.unplaced ? 'Saved, not placed yet' + (stay() ? ': no free day fits it yet' : ': it goes into a free day once you set your days') : esc(it.day)) + '</dd></div></dl>';
    h += '<div class="tp-pm-acts"><button type="button" class="tp-pill tp-pm-add" data-pm-poi="' + esc(p.id) + '" aria-pressed="' + on + '"><span class="tp-pm-add-l">' + addLabel(on, on ? 'Added to your plan' : 'Add to your plan') + '</span><span class="visually-hidden">, ' + esc(p.title) + '</span></button>' +
      '<span class="tp-pm-full" role="link" aria-disabled="true">View full page</span><span class="tp-pm-soon">Not linked yet</span></div></div>';
    return h;
  }
  tp.poiItem = function (p) { return { id: 'poi:' + p.id, kind: 'poi', poi: p.id, title: p.title, kindLabel: p.cat, place: p.area, day: '', unplaced: true }; };
  tp.unplaced = function () { return state.added.filter(function (it) { return it.unplaced; }); };
  function slotDay(it, s) {
    var p = poiOf(it), open = function (d) { return openOn(it, d); };
    var bs = blocks(model()), mine = (tp.own() ? tp.userMatches() : []).filter(function (m) { return !m.f.a && m.day >= s.a && m.day <= s.z; });
    if (p && p.near !== 'village') {
      var md = mine.filter(function (m) { return m.f.v === p.near && open(m.day); })[0];
      if (md) return md.day;
    }
    var free = [];
    bs.forEach(function (b) { if (b.kind === 'free') { for (var d = b.a; d <= b.z; d++) free.push(d); } else if (b.kind === 'watch') free.push(b.day); });
    free.sort(function (a, b) { return a - b; });
    for (var i = 0; i < free.length; i++) if (open(free[i]) && !dayFilled(free[i]) && dayItems(free[i]).length < 2) return free[i];
    return null;
  }
  tp.slotSaved = function () {
    var s = stay(), out = [];
    state.added.forEach(function (it) {
      if (!it.unplaced) return;
      var d = s ? slotDay(it, s) : null;
      it.nofit = !!s && d === null;
      if (d === null) return;
      it.day = dayLabel(d); delete it.unplaced; delete it.nofit; out.push(it);
    });
    if (out.length) {
      tp.save();
      // Said after whatever else the change says (Your days: ...), so it is not talked over
      var msg = out.length === 1 ? 'Saved, now placed: ' + out[0].title + ' on ' + out[0].day + '.' : out.length + ' saved places placed into your days: ' + tp.list(out.map(function (x) { return x.title + ' on ' + x.day; })) + '.';
      setTimeout(function () { tp.say(msg); }, 1500);
    }
    return out;
  };
  function itemMoves(it) {
    if (it.kind === 'trip') return tripMoves(it.id).map(function (m) { return { day: m.start, label: m.label, trip: true }; });
    if ((it.kind !== 'product' && it.kind !== 'place' && it.kind !== 'poi') || it.unplaced) return [];
    var cur = tp.dayOf(it.day), s = stay(), a = s ? Math.max(0, s.a) : 0, z = s ? Math.min(43, s.z) : 43, out = []; // the axis runs 1 Oct to 13 Nov
    var mine = {}; (tp.own() ? tp.userMatches() : []).forEach(function (m) { if (!m.f.a) mine[m.day] = true; });
    for (var d = a; d <= z; d++) if (d !== cur && openOn(it, d)) out.push(d);
    // The six nearest the current day, in date order
    out = out.sort(function (x, y) { return Math.abs(x - cur) - Math.abs(y - cur) || x - y; }).slice(0, 6).sort(function (x, y) { return x - y; });
    return out.map(function (d) { return { day: d, label: dayLabel(d) + (mine[d] ? ' · match day' : '') }; });
  }
  function moveItem(id, d) {
    var cur = addedItem(id); if (!cur) return id;
    if (cur.kind === 'trip') { moveTrip(id, d); return id; }
    // A place saved from the map keeps its id (poi:...), so the map still shows it as saved
    var nid = cur.kind === 'poi' ? cur.id : cur.kind === 'product' ? 'p:' + cur.id.split(':')[1] + ':' + dayLabel(d) : 'w:' + cur.id.split(':')[1] + ':moved:' + dayLabel(d);
    var nu = Object.assign({}, cur, { id: nid, day: dayLabel(d) });
    delete nu.matchName; // it was suggested for a match on its old day
    tp.removeItem(id); tp.addItem(nu);
    render(true);
    tp.say(cur.title + ' moved to ' + nu.day + '.');
    return nid;
  }
  function pmItem(id) {
    var it = addedItem(id); if (!it) return '<div class="plan-modal-body"><p class="cn-pp-text">This is no longer on your timeline.</p></div>';
    var cl = tp.tlClash(id), mv = itemMoves(it), h = '<div class="plan-modal-body tp-pm-item">';
    h += '<p class="tp-pm-type">' + esc(it.kindLabel || 'Added') + '</p>';
    h += '<h2 class="cn-pp-title provenance-gap" id="tp-pm-title">' + esc(it.title) + '</h2>';
    h += '<dl class="pl-option-facts cn-pp-facts tp-pm-summary"><div><dt>When</dt><dd>' + esc(it.endDay ? (it.when || it.day + ' to ' + it.endDay) + ', ' + it.nights + (it.nights === 1 ? ' night' : ' nights') : it.day) + (it.matchName ? ', for ' + esc(it.matchName) : '') + '</dd></div>' +
      (it.place ? '<div><dt>Where</dt><dd><span class="provenance-gap">' + esc(it.place) + '</span></dd></div>' : '') +
      (it.note ? '<div><dt>Open</dt><dd><span class="provenance-gap">' + esc(it.note) + '</span></dd></div>' : '') + '</dl>';
    if (cl) {
      var who = cl.filter(function (c) { return !c.closed; }), shut = cl.some(function (c) { return c.closed; });
      h += '<p class="tp-tl-d-clash">' + (who.length ? 'Clashes with ' + esc(tp.list(who.map(function (c) { return c.name + ', ' + c.day; }))) + '. ' : '') + (shut ? '<span class="provenance-gap">It is closed that day (opening hours).</span> ' : '') + 'Nothing has been moved.</p>';
    }
    if (it.kind === 'screening') h += '<p class="tp-pm-note">A screening is for one match, so it stays on that match’s day. Remove it if your plans change.</p>';
    else if (mv.length) h += '<h3 class="cn-pp-h">Move it to</h3><div class="tp-move" role="group" aria-label="Move ' + esc(it.title) + ' to">' + mv.map(function (m) { return '<button type="button" class="tp-chip" data-pm-move="' + m.day + '">' + esc(m.label) + '</button>'; }).join('') + '</div>' +
      (it.kind === 'trip' ? '' : '<p class="tp-pm-note">Days it is open<span class="provenance-gap"> (indicative opening hours)</span>' + (stay() ? ', within your days in NSW.' : '.') + '</p>');
    else h += '<p class="tp-pm-note">No other days fit it now. Remove it, or change your days.</p>';
    h += '<div class="tp-pm-acts"><button type="button" class="tp-link" data-pm-remove="' + esc(id) + '">' + window.tpIcons.remove + '<span class="tp-u">Remove from timeline</span></button></div>';
    h += '<p class="tp-pm-said" aria-hidden="true">' + esc(pmSaid) + '</p></div>';
    return h;
  }
  // The match sheet doubles as the timeline's stacked sheet: grabber, stack closing, focus back to the marker
  var pmGrab = document.createElement('span'); pmGrab.className = 'cn-grabber tp-pm-grab'; pmGrab.setAttribute('aria-hidden', 'true');
  pm.insertBefore(pmGrab, pm.firstChild);
  pm.tabIndex = -1;
  if (typeof tp.stackRegister === 'function') tp.stackRegister(pm);
  var pmStacked = false, pmUnstackT = 0;
  pm.addEventListener('tp:stackclose', function () {
    var wasIdeas = !!pmOpen && (pmOpen.id.indexOf('ideas:') === 0 || pmHistory.some(function (h) { return h.id.indexOf('ideas:') === 0; }));
    pmClearHistory();
    if (!pmStacked) return;
    pmStacked = false; pmOpen = null;
    if (wasIdeas) {
      var landed = tlIdeasAdded.filter(function (id) { return added(id); }); tlIdeasAdded = [];
      if (window.tpFreeApi) window.tpFreeApi.close(false);
      // After the sheet has slid away, so the ring is seen
      setTimeout(function () { tlIdeasReturn(); if (tp.tlSettle && landed.length) tp.tlSettle(landed); }, reduce.matches ? 0 : 320);
    }
    clearTimeout(pmUnstackT);
    pmUnstackT = setTimeout(function () { if (!pmStacked) { pm.hidden = true; pm.classList.remove('tp-stack', 'is-stacked'); } notesRefresh(); }, reduce.matches ? 0 : 340);
  });
  tp.openSheet = function (id, opener) { openPm(id, opener, true); };
  tp.moveItem = moveItem; // the timeline's hold-and-drag
  // The days a dragged item may land on: a trip only on the start days it runs; anything else on any day it is open in
  // their days (every day of the axis without days)
  tp.itemStarts = function (id) {
    var it = addedItem(id); if (!it) return [];
    if (it.kind === 'trip') return tripMoves(id, true).map(function (m) { return m.start; }).concat([it.start]);
    var s = stay(), a = s ? Math.max(0, s.a) : 0, z = s ? Math.min(43, s.z) : 43, out = [];
    for (var d = a; d <= z; d++) if (openOn(it, d)) out.push(d);
    var cur = tp.dayOf(it.day); if (out.indexOf(cur) < 0) out.push(cur);
    return out;
  };
  /* ---------- More detail inside a sheet: drill down (17 Nov, CLAUDE.md check 10) ----------
     One rule everywhere: a link inside a sheet to more detail (a venue in Where to watch, a place in Also on your plan,
     an idea in a day's ideas, the next free day, Add where you're staying) never opens a second sheet; the sheet drills
     down. The new level pushes in from the right over the old one, which eases a little to the left; a back arrow
     appears top left (only below the first level). The back arrow, Escape and dragging the grabber go back one level:
     the level slides out to the right and the one before comes back as it is now (an Add made meanwhile shows), at the
     scroll it had, with focus on the link that opened the level just closed. The cross and the dark area close the
     whole sheet, and focus goes back to what opened it. Stacking is only for a sheet over a full-screen layer (the
     timeline, a full-screen map). One sheet element does it all; a level is drawn again from its id on the way back.
     Reduced motion: the levels swap in place. */
  var pmHistory = [], pmBack = pm.querySelector('[data-pm-back]');
  function pmBackSync() {
    var prev = pmHistory[pmHistory.length - 1];
    pmBack.hidden = !prev;
    pmBack.setAttribute('aria-label', prev ? 'Back to ' + prev.title : 'Back');
  }
  function pmClearHistory() {
    // Closing the whole sheet: focus goes back to what opened it, not to a link inside one of its levels
    if (pmHistory.length && pmOpen) { pmOpen.opener = pmHistory[0].opener; pmOpenerEl = pmHistory[0].openerEl; }
    pmHistory = []; pmBackSync();
  }
  function pmTitle() { var t = pm.querySelector('#tp-pm-title'); return (t ? t.textContent : pmKind.textContent).trim(); }
  // The link's own attribute, to find it again once its level is drawn afresh
  function pmSel(el) {
    for (var i = 0; el && i < el.attributes.length; i++) { var a = el.attributes[i]; if (/^data-/.test(a.name)) return '[' + a.name + '="' + CSS.escape(a.value) + '"]'; }
    return null;
  }
  // The level being left, as a still picture over the body while the new one slides in
  function pmSnap() {
    if (reduce.matches || !pm.animate) return null;
    var snap = pmBody.cloneNode(true);
    snap.removeAttribute('id'); Array.prototype.forEach.call(snap.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
    snap.classList.add('tp-pm-snap'); snap.setAttribute('aria-hidden', 'true'); snap.inert = true;
    snap.style.top = pmBody.offsetTop + 'px'; snap.style.height = pmBody.offsetHeight + 'px';
    pm.appendChild(snap); snap.scrollTop = pmBody.scrollTop;
    return snap;
  }
  // An even glide the eye can follow across (no front-loaded curve)
  function pmMove(snap, dir) {
    if (!snap) return;
    var o = { duration: 320, easing: 'cubic-bezier(.3, .2, .25, 1)' };
    snap.style.zIndex = dir > 0 ? 0 : 2; // forward: the new level comes over the old; back: the old one leaves over it
    snap.animate([{ transform: 'none' }, { transform: 'translateX(' + (dir > 0 ? -30 : 100) + '%)' }], o).onfinish = function () { snap.remove(); };
    pmBody.animate([{ transform: 'translateX(' + (dir > 0 ? 100 : -30) + '%)' }, { transform: 'none' }], o);
  }
  function pmPush(id, link) {
    if (!pmOpen) return;
    var prev = { id: pmOpen.id, opener: pmOpen.opener, openerEl: pmOpenerEl, scroll: pmBody.scrollTop, sel: pmSel(link), title: pmTitle() };
    // The sheet holds the height it opened at for every level: only the content moves, never its edge (a taller level
    // scrolls inside it). Over the timeline its top is pinned already. Released when it closes.
    if (!pmStacked && !pm.style.height) pm.style.height = pm.offsetHeight + 'px';
    var snap = pmSnap(); // before the ideas list (lent to the sheet) goes home, so the picture shows it
    if (openPm(id, link, false, true) === false) { if (snap) snap.remove(); if (prev.id.indexOf('ideas:') === 0) openPm(prev.id, null, false, true); return; }
    pmHistory.push(prev); pmBackSync();
    pmOpenerEl = link;
    pmBody.scrollTop = 0;
    pmMove(snap, 1);
    pmBack.focus({ preventScroll: true });
    tp.say(pmTitle() + ', details opened.');
    notesRefresh();
  }
  function pmPop() {
    var prev = pmHistory.pop(); if (!prev) return;
    // A drag let go part way down: the sheet springs back up while the level slides away
    var from = pm.style.transform; pm.style.transform = '';
    if (from && !reduce.matches && pm.animate) pm.animate([{ transform: from }, { transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    var snap = pmSnap();
    openPm(prev.id, null, false, true);
    pmOpen.opener = prev.opener; pmOpenerEl = prev.openerEl;
    pmBackSync();
    pmBody.scrollTop = prev.scroll;
    pmMove(snap, -1);
    var l = prev.sel && pmBody.querySelector(prev.sel);
    (l || (pmHistory.length ? pmBack : pm.querySelector('[data-pm-close]'))).focus({ preventScroll: true });
    tp.say('Back to ' + prev.title + '.');
    notesRefresh();
  }
  pmBack.addEventListener('click', function () { pmPop(); });
  /* Dragging the grabber of a sheet over the page: past a third of its height, or a flick, goes back one level, or
     closes it at the first; earlier it springs back. (Over the timeline the stack's own drag does the same.) */
  (function () {
    var y0 = null, dy = 0, t0 = 0;
    pmGrab.addEventListener('pointerdown', function (e) { if (pmStacked || !pmOpen) return; y0 = e.clientY; dy = 0; t0 = e.timeStamp; pmGrab.setPointerCapture(e.pointerId); pm.classList.add('is-dragging'); });
    pmGrab.addEventListener('pointermove', function (e) { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); pm.style.transform = 'translateY(' + dy + 'px)'; });
    function letGo(e) {
      if (y0 == null) return;
      var v = dy / Math.max(1, e.timeStamp - t0); y0 = null;
      pm.classList.remove('is-dragging');
      // A tap on the grabber (no drag) does the same as a full drag
      if (dy < 6 || dy > pm.offsetHeight / 3 || (v > .6 && dy > 24)) { if (pmHistory.length) pmPop(); else closePm(); return; }
      var from = pm.style.transform; pm.style.transform = '';
      if (from && !reduce.matches && pm.animate) pm.animate([{ transform: from }, { transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    }
    pmGrab.addEventListener('pointerup', letGo); pmGrab.addEventListener('pointercancel', letGo);
  })();
  /* Over a full-screen map (the overview in full screen, Follow day by day), a sheet stacks: the map steps back behind
     it, as the timeline does under its stacked sheets, and comes forward again when the sheet closes */
  var pmLayer = null;
  function pmLayerBack(on) {
    if (on) { pmLayer = phone.querySelector('.tp-ov-map.is-full') || phone.querySelector('.tp-mapfs:not([hidden])'); if (pmLayer) pmLayer.classList.add('tp-layer-back'); }
    else if (pmLayer) { pmLayer.classList.remove('tp-layer-back'); pmLayer = null; }
  }
  // Dragging the grabber down over the timeline goes back one level when there is one
  pm.addEventListener('tp:stackdismiss', function (e) { if (pmHistory.length) { e.preventDefault(); pmPop(); } });
  function openPm(id, opener, stacked, swap) {
    var isMatch = id.indexOf('match:') === 0, isItem = id.indexOf('item:') === 0, isDays = id === 'days' || id === 'days:stay';
    var isKo = id.indexOf('ko:') === 0, isWt = id.indexOf('wt:') === 0, isIdeas = id.indexOf('ideas:') === 0;
    var isPoi = id.indexOf('poi:') === 0, isIdea = id.indexOf('idea:') === 0;
    var poiP = isPoi && POI ? POI.pois.filter(function (q) { return q.id === id.slice(4); })[0] : null;
    var ideaK = isIdea ? id.slice(5) : '', ideaAt = ideaK.lastIndexOf('@'), ideaI = isIdea ? IDEAS.filter(function (q) { return q.id === ideaK.slice(2, ideaAt); })[0] : null;
    if ((isPoi && !poiP) || (isIdea && !ideaI)) return false;
    if (!swap) pmClearHistory();
    tlIdeasReturn(); // the ideas list is lent to the sheet; take it back before the body is replaced
    var x = isPoi ? { type: 'poi' } : isIdea ? { type: 'idea' } : isIdeas ? { type: 'ideas' } : isKo ? { type: 'ko' } : isWt ? { type: 'wt' } : isDays ? { type: 'days' } : isMatch ? { type: 'match', m: tp.match(id.slice(6)) } : isItem ? { type: 'item', it: addedItem(id.slice(5)) } : MODAL[id];
    if (!x || (isMatch && !x.m) || (isItem && !x.it)) return false;
    pmSaid = '';
    // Products, curated trips and watch spots open as sheets too (16 Nov), not full-screen pages: the page stays in view
    // above, and the cross, the scrim or Escape closes them
    var isRoute = x.type === 'route', asSheet = isMatch || isRoute || isDays || isKo || isWt || isIdeas || x.type === 'product' || x.type === 'trip' || x.type === 'spot' || isPoi || isIdea || isItem;
    pmOpenerEl = null;
    pmBody.innerHTML = isPoi ? pmPoi(poiP) : isIdea ? '<div class="plan-modal-body tp-pm-idea">' + ideaDetail(ideaI, +ideaK.slice(ideaAt + 1), true) + '</div>' : isIdeas ? '<div class="plan-modal-body tp-pm-ideas"></div>' : isKo ? pmKo(id.slice(3)) : isWt ? pmWt(id.slice(3)) : isDays ? pmDays() : isMatch ? pmMatch(id.slice(6)) : isItem ? pmItem(id.slice(5)) : x.type === 'product' ? pmProduct(id, x) : x.type === 'trip' ? pmTrip(id, x) : isRoute ? pmRoute(id, x) : pmSpot(id, x);
    if (isIdeas) { if (!swap) tlIdeasAdded = []; pmBody.firstChild.appendChild(tlIdeas); tlIdeas.hidden = false; tlIdeasDay = +id.slice(6); renderTlIdeas(); }
    pmBody.scrollTop = 0;
    pmKind.textContent = isPoi ? (poiP.near === 'village' ? 'Near the fan village' : 'Near the stadium') : isIdea ? 'Idea for a free day' : isIdeas ? 'Ideas for a free day' : isKo ? 'Knockouts in NSW' : isWt ? 'Where to watch in NSW' : isDays ? (dStay ? 'Your trip' : 'Your days') : isMatch ? 'Match' : isItem ? 'On your timeline' : x.type === 'product' ? 'Around your matches' : x.type === 'trip' ? (x.t.kind === 'day' ? 'Day trip' : 'Longer trip') : isRoute ? 'Match day' : (SPOT_TYPE[x.sp.type] || 'Where to watch');
    pmOpen = { id: id, opener: opener && opener.dataset.open };
    if (swap) return true; // a sheet over a sheet (pmPush, pmPop): the sheet is already open, only its content changes
    if (stacked) {
      // Over the open timeline: the stacked-sheet pattern does the motion, scrim, Tab, Escape, drag and focus return
      clearTimeout(pmUnstackT);
      pmStacked = true;
      pm.classList.remove('is-sheet', 'is-open', 'is-closing');
      pm.classList.add('tp-stack', 'is-stacked');
      pm.classList.toggle('is-match', isMatch || isDays || isIdeas);
      pm.hidden = false;
      void pm.offsetWidth;
      tp.stackOpen(pm, opener);
      pm.querySelector('[data-pm-close]').focus({ preventScroll: true });
      tp.say(isPoi || isIdea ? (isPoi ? poiP.title : ideaI.title) + ', details opened.' : isIdeas ? 'Ideas for ' + (freeInfo(tlIdeasDay) || {}).label + ', opened.' : isKo || isWt ? pmKind.textContent + ', opened.' : isDays ? (dStay ? 'Where you\u2019re staying, opened.' : 'Your days, opened. Pick your first day, then your last.') : (isMatch ? matchName(x.m.f) + ', ' + x.m.f.d : x.it.title + ', ' + x.it.day) + ', details opened.');
      notesRefresh();
      return;
    }
    pm.classList.remove('tp-stack', 'is-stacked');
    // A stacked sheet that closed earlier leaves the element inert and offset; on its own over the page it must take taps
    pm.inert = false; pm.style.transform = ''; pm.style.height = ''; pm.style.removeProperty('--stack-top');
    pm.classList.toggle('is-match', isMatch || isDays);
    pm.classList.toggle('is-sheet', asSheet);
    pmScrim.hidden = !asSheet;
    // Everything behind waits; remember what was already inert so closing puts it back as it was
    pmLayerBack(true);
    pmBehind = [body, document.getElementById('tp-tl'), document.getElementById('tp-tl-scrim'), phone.querySelector('.tp-ov-map.is-full')].filter(Boolean).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; });
    pm.hidden = false;
    pm.classList.remove('is-open', 'is-closing'); void pm.offsetWidth; pm.classList.add('is-open');
    pm.querySelector('[data-pm-close]').focus({ preventScroll: true });
    tp.say(isPoi || isIdea || isItem ? (isPoi ? poiP.title : isIdea ? ideaI.title : x.it.title) + ', details opened.' : isKo || isWt ? pmKind.textContent + ', opened.' : isDays ? (dStay ? 'Where you\u2019re staying, opened.' : 'Your days, opened. Pick your first day, then your last.') : (isMatch ? matchName(x.m.f) + ', ' + x.m.f.d : x.type === 'product' ? x.p.title : x.type === 'trip' ? x.t.title : isRoute ? 'Getting there and back, ' + matchName(x.m.f) : x.sp.name) + (asSheet ? ', details opened.' : ', page opened.'));
    notesRefresh();
  }
  function closePm() {
    if (!pmOpen) return;
    if (pmHistory.length) { pmPop(); return; } // a sheet opened from inside a sheet closes back to the one under it
    if (pmStacked) { tp.stackClose(); return; } // the stack closes it, and puts focus back on the marker
    var back = pmOpen.opener; pmOpen = null;
    pmBehind.forEach(function (pair) { pair[0].inert = pair[1]; });
    pmLayerBack(false);
    var sheet = pm.classList.contains('is-sheet');
    function done() { pm.hidden = true; pmScrim.hidden = true; pm.style.height = ''; pm.classList.remove('is-open', 'is-closing'); notesRefresh(); }
    if (reduce.matches || !pm.animate) done();
    else if (sheet) {
      // The sheet slides back down the way it came; the scrim fades with it
      pm.classList.add('is-closing');
      pmScrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in' });
      var from = pm.style.transform || 'none'; pm.style.transform = ''; // a drag let go part way down: on from there
      pm.animate([{ transform: from }, { transform: 'translateY(100%)' }], { duration: 240, easing: 'cubic-bezier(.4, 0, 1, 1)' }).onfinish = done;
    }
    else { pm.classList.add('is-closing'); pm.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(16px)' }], { duration: 180, easing: 'cubic-bezier(.4, 0, 1, 1)' }).onfinish = done; }
    // The control that was tapped, if it is still there (the same id can appear twice: a map card and its row on the page)
    var el = pmOpenerEl && document.contains(pmOpenerEl) && !pmOpenerEl.closest('[inert]') ? pmOpenerEl : back && phone.querySelector('[data-open="' + CSS.escape(back) + '"]');
    // The control that opened it was redrawn while the sheet was open (a card showing a new chip): its replacement
    if (!el && pmOpenerEl) {
      var d = pmOpenerEl.dataset || {}, k = ['openWatch', 'watchTeam', 'ko', 'open', 'goingMark'].filter(function (n) { return d[n] !== undefined; })[0];
      var sel = k ? '[data-' + k.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }) + '="' + CSS.escape(d[k]) + '"]' : d.planDays !== undefined ? '[data-plan-days]' : null;
      if (sel) el = phone.querySelector('#tp-deck ' + sel) || phone.querySelector(sel);
    }
    if (el) el.focus({ preventScroll: true });
  }
  /* ---------- From the team cards (redesigned 16 Nov): small sheets, never a page jump ----------
     The knockout line opens the knockout path in NSW; See where to watch all N opens the screenings for each of the
     team's matches (with Add); Watch in NSW on a row opens that match's sheet at Where to watch it in NSW; Plan around
     your match day opens the days sheet. */
  function pmKo(key) {
    var c = tp.teams[key], ko = (window.cnFixtures || []).filter(function (f) { return !/^Pool /.test(f.s) && !f.a; });
    var mine = c ? ko.filter(function (f) { return f.t && f.t.indexOf(c.pool) > -1; })[0] : null, h = '<div class="plan-modal-body tp-pm-ko">';
    h += '<h2 class="cn-pp-title" id="tp-pm-title">' + (c ? esc(c.name) + '\u2019s way through' : 'Knockouts in NSW') + '</h2>';
    if (mine) {
      var pos = /(\w+) Pool /.exec(mine.t.split(' v ').filter(function (x) { return x.indexOf(c.pool) > -1; })[0])[1];
      h += '<p class="tp-ko-lead">If ' + esc(c.name) + ' finishes ' + (pos === '2nd' ? 'second' : pos === '1st' ? 'first' : esc(pos)) + ' in ' + esc(c.pool) + ', its Round of 16 match is in Sydney: <b>' + esc(mine.d) + (mine.k ? ', ' + esc(mine.k) : '') + ', ' + esc(mine.v) + '</b> (' + esc(mine.t) + ').</p>';
    } else if (c) h += '<p class="tp-ko-lead">' + esc(c.name) + '\u2019s Round of 16 would be interstate. If it goes through, the semi-finals and the final are in Sydney.</p>';
    h += '<p class="tp-ko-note">Knockouts in NSW, all in Sydney. Teams are known when the pools finish.</p><ol class="tp-ko-list">' + ko.map(function (f) {
      var hit = mine && f === mine;
      var mk = f.d + '|' + (f.t || f.s), row = '<span class="tp-ko-d">' + esc(f.d) + (f.k ? ', ' + esc(f.k) : '') + '</span><span class="tp-ko-s">' + esc(f.s.replace(/ \(\d+\)$/, '')) + (f.t ? ': ' + esc(f.t) : '') + '</span><span class="tp-ko-v">' + esc(f.v) + '</span>';
      return '<li' + (hit ? ' class="is-hit"' : '') + '>' + (tp.match(mk) ? '<button type="button" class="tp-ko-row" data-open="match:' + esc(mk) + '" aria-haspopup="dialog">' + row + '</button>' : row) + '</li>';
    }).join('') + '</ol></div>';
    return h;
  }
  function pmWt(name) {
    var ms = tp.userMatches().filter(function (m) { return m.f.t && m.f.t.split(' v ').indexOf(name) > -1; });
    var h = '<div class="plan-modal-body tp-pm-wt"><h2 class="cn-pp-title" id="tp-pm-title">Watch ' + esc(name) + ' in NSW</h2>' +
      '<p class="tp-ko-note">' + ms.length + (ms.length === 1 ? ' match' : ' matches') + ', each at fan zones, pubs and clubs in NSW. Add the one you\u2019ll go to. Venues are examples until real ones are supplied.</p>';
    ms.forEach(function (m) { h += '<section class="tp-wt-m">' + matchLine(m) + venueRows([m], evKey([m])) + '</section>'; });
    return h + '</div>';
  }
  tp.openMatchAt = function (key, opener, where) {
    openPm('match:' + key, opener); pmOpenerEl = opener || null;
    var t = pm.querySelector(where === 'ticket' ? '[data-pm-ticket]' : '#tp-pm-watch-h');
    if (!t) return;
    if (where !== 'ticket') { t.tabIndex = -1; pmBody.scrollTop = Math.max(0, t.getBoundingClientRect().top - pmBody.getBoundingClientRect().top + pmBody.scrollTop - 12); }
    t.focus({ preventScroll: where !== 'ticket' });
  };
  phone.addEventListener('click', function (e) {
    if (pm.contains(e.target)) return;
    var w = e.target.closest('[data-open-watch]');
    if (w) { tp.openMatchAt(w.dataset.openWatch, w, 'watch'); return; }
    var k = e.target.closest('[data-ko]');
    if (k) { openPm('ko:' + k.dataset.ko, k); pmOpenerEl = k; return; }
    var wt = e.target.closest('[data-watch-team]');
    if (wt) { openPm('wt:' + wt.dataset.watchTeam, wt); pmOpenerEl = wt; return; }
    var pd = e.target.closest('[data-plan-days]');
    if (pd) { openDays(false, pd, pd.dataset.planTeam); return; }
  });

  /* ---------- Your days, and where you're staying, in a sheet (16 Nov) ----------
     Every way to the days from elsewhere on the page (Staying longer? Set your days, Set your days to see what fits,
     Change, the timeline's Add your days) opens this sheet where the person is, instead of jumping the page down to
     Your days: the calendar is inline (October and November 2027, the tournament and two days either side), their NSW
     matches are marked, the first tap sets the first day and the second the last. Add where you're staying opens the
     same sheet on the staying question. Nothing moves behind it, and closing returns focus to what opened it. */
  var dsel = null, dStay = false, pmOpenerEl = null, pmAnchor = null;
  // What the opener sits in (a day's block), so focus and the page can be held even when the opener itself is rebuilt
  function anchorOf(op) { var c = op && op.closest('[data-blk], [id]'); return !c ? null : c.dataset.blk ? '[data-blk="' + CSS.escape(c.dataset.blk) + '"]' : '#' + CSS.escape(c.id); }
  function dRange() { var t = trip() || {}; return t.from && t.to ? { a: tp.isoDay(t.from), z: tp.isoDay(t.to) } : null; }
  function daysTickets() {
    var ms = dTicketKeys.map(function (k) { return tp.match(k); }).filter(Boolean);
    if (!ms.length) return '';
    return '<section class="tp-days-tk" aria-label="Your ticket">' + ms.map(function (m, i) {
      var on = state.tickets.indexOf(m.tkey) > -1, id = 'tp-days-tk-why-' + i;
      return '<p class="tp-days-tk-m">' + esc(matchName(m.f)) + ', ' + esc(m.f.d) + (m.f.k ? ', ' + esc(m.f.k) : '') + ' · ' + esc(m.f.v) + '</p>' +
        '<label class="tp-ticket tp-pm-ticket"><input type="checkbox" data-dticket="' + esc(m.key) + '"' + (on ? ' checked' : '') + ' aria-describedby="' + id + '" /><span class="tp-pm-ticket-l">' + window.tpIcons.ticket + 'I have a ticket</span></label>' +
        '<p class="tp-ticket-why" id="' + id + '">Mark it if you\u2019re going, so we skip its screenings and plan your days around it.</p>';
    }).join('') + '</section>';
  }
  function dMatches() { var o = {}; (tp.own() ? tp.userMatches() : []).forEach(function (m) { if (!m.f.a) (o[m.day] = o[m.day] || []).push(m); }); return o; }
  function calMonth(y, mo, ms) {
    // Monday-first weeks; days outside 29 Sep to 15 Nov are shown but cannot be picked
    var first = new Date(Date.UTC(y, mo, 1)), lead = (first.getUTCDay() + 6) % 7, days = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
    var name = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][mo];
    var h = '<div class="tp-cal-m"><h4 class="tp-cal-h">' + name + ' ' + y + '</h4><div class="tp-cal-g" role="group" aria-label="' + name + ' ' + y + '">' +
      ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(function (d) { return '<span class="tp-cal-wd" aria-hidden="true">' + d + '</span>'; }).join('');
    var start = Math.round((first - Date.UTC(2027, 9, 1)) / 864e5) - lead, cells = Math.ceil((lead + days) / 7) * 7;
    cells = Math.min(cells, Math.ceil((RMAX - start + 1) / 7) * 7); // no weeks after 15 Nov
    for (var k = 0; k < cells; k++) {
      var d = start + k, dt = new Date(Date.UTC(2027, 9, 1 + d)), inMonth = dt.getUTCMonth() === mo;
      if (!inMonth && !(mo === 9 && d >= RMIN && d < 0)) { h += '<span class="tp-cal-x" aria-hidden="true"></span>'; continue; }
      var can = d >= RMIN && d <= RMAX, mm = ms[d] || [], a = dsel && dsel.a, z = dsel && dsel.z;
      var st = dsel ? (d === a ? ' is-start' : '') + (z !== null && d === z ? ' is-end' : '') + (z !== null && d > a && d < z ? ' is-in' : '') : '';
      var lbl = dayLabel(d) + (mm.length ? ', ' + mm.map(function (m) { return matchName(m.f); }).join(' and ') : '') + (dsel && d === a ? ', first day' : '') + (z !== null && dsel && d === z ? ', last day' : '');
      h += can ? '<button type="button" class="tp-cal-d' + (mm.length ? ' is-match' : '') + (inMonth ? '' : ' is-other') + st + '" data-dday="' + d + '" aria-pressed="' + !!st + '" aria-label="' + esc(lbl) + '">' + dt.getUTCDate() + '</button>'
        : '<span class="tp-cal-d is-off" aria-hidden="true">' + dt.getUTCDate() + '</span>';
    }
    return h + '</div></div>';
  }
  function pmDays() {
    var t = trip() || {}, ms = dMatches(), has = !!(t.from && t.to);
    var h = '<div class="plan-modal-body tp-days">';
    if (dStay) {
      var cur = t.base || '';
      h += '<h2 class="cn-pp-title" id="tp-pm-title">Where are you staying?</h2><p class="tp-days-note">Optional. Ideas then start near it, and match days show your own way there and back.</p>' +
        '<div class="tp-quick" role="group" aria-label="Where you’re staying">' + BASE_Q.map(function (x) { return chip('sbase', x[0], x[1], cur === x[0]); }).join('') + '</div>' +
        (basePlace() && !BASE_Q.some(function (x) { return x[0] === cur; }) ? '<p class="tp-days-note">' + esc(baseLabel(cur)) + '</p>' : '') +
        '<h3 class="tp-days-q">Who’s coming?</h3><div class="tp-quick" role="group" aria-label="Who’s coming">' + PARTY_Q.map(function (x) { return chip('sparty', x[0], x[1], t.party === x[0]); }).join('') + '</div>' +
        '<div class="tp-days-acts"><button type="button" class="tp-pill" data-dclose>Done</button></div>';
      return h + '</div>';
    }
    var qm = quickRange('pm1'), PM = [1, 2, 3, 7, 14];
    var Q = function (kind, r, label) { return r ? '<button type="button" class="tp-chip" data-dquick="' + kind + '" aria-pressed="' + !!(dsel && dsel.z !== null && isoOf(dsel.a) === r.from && isoOf(dsel.z) === r.to) + '">' + label + '</button>' : ''; };
    var n = dsel && dsel.z !== null ? dsel.z - dsel.a + 1 : 0, inN = 0;
    if (n) Object.keys(ms).forEach(function (d) { if (+d >= dsel.a && +d <= dsel.z) inN += ms[d].length; });
    var sum = !dsel ? 'Tap your first day, then your last.' : dsel.z === null ? 'First day: ' + dayLabel(dsel.a) + '. Now tap your last day.'
      : tp.isoRange(isoOf(dsel.a), isoOf(dsel.z)) + ' · ' + n + (n === 1 ? ' day' : ' days') + (Object.keys(ms).length ? ', ' + (inN ? inN + ' of your NSW matches' : 'none of your NSW matches') : '');
    h += '<h2 class="cn-pp-title" id="tp-pm-title">Your days in NSW</h2><p class="tp-days-note">Optional. The ideas then fit around your matches' + (Object.keys(ms).length ? ', which are marked' : '') + '.</p>' +
      daysTickets() +
      // Either side of their matches, as flexible dates (16 Nov): ± 1 to ± 14 days (About a week removed 16 Nov: it overlapped ± 7 days)
      (qm ? '<div class="tp-quick tp-days-flex" role="group" aria-label="Days either side of your matches">' + PM.map(function (n) { return Q('pm' + n, quickRange('pm' + n), '\u00b1 ' + n + (n === 1 ? ' day' : ' days') + '<span class="visually-hidden"> either side of your matches</span>'); }).join('') + '</div>' : '') +
      // The tournament at a glance, with the same two handles as on the page: drag either end, or tap the track
      '<div class="tp-range tp-days-range' + (dsel && dsel.z !== null ? '' : ' is-unset') + '"><div class="tp-range-track"><span class="tp-range-fill"></span>' +
        '<span class="tp-range-mark" aria-hidden="true" style="left:' + (2 / 47 * 100) + '%"></span><span class="tp-range-mark" aria-hidden="true" style="left:' + (45 / 47 * 100) + '%"></span>' +
        Object.keys(ms).map(function (d) { return '<span class="tp-range-match" aria-hidden="true" style="left:' + ((+d - RMIN) / RSPAN * 100) + '%"></span>'; }).join('') +
        '<span class="tp-range-h" role="slider" tabindex="0" data-dh="from" aria-label="First day" aria-valuemin="' + RMIN + '" aria-valuemax="' + RMAX + '"></span>' +
        '<span class="tp-range-h" role="slider" tabindex="0" data-dh="to" aria-label="Last day" aria-valuemin="' + RMIN + '" aria-valuemax="' + RMAX + '"></span></div>' +
        '<div class="tp-range-ends" aria-hidden="true"><span>29 Sep</span><span>Tournament 1 Oct to 13 Nov</span><span>15 Nov</span></div></div>' +
      '<div class="tp-cal">' + calMonth(2027, 9, ms) + calMonth(2027, 10, ms) + '</div>' +
      // Fixed to the bottom of the sheet (16 Nov): the calendar runs below the fold, so what is picked and Use these
      // dates stay in view and it is clear the timeline waits for that tap
      '<div class="tp-days-bar"><p class="tp-days-sum" aria-live="polite">' + esc(sum) + '</p>' +
      '<div class="tp-days-acts"><button type="button" class="tp-pill tp-pill--dark" data-duse' + (n ? '' : ' disabled') + '>' + window.tpIcons.cal + 'Use these dates</button>' +
      (has ? '<button type="button" class="tp-link" data-dclear>Remove my days</button>' : '') + '</div></div>';
    return h + '</div>';
  }
  /* Opened from a team card's Plan around your match day: that team's NSW matches with no ticket marked yet get the
     same I have a ticket toggle as the match sheet, above the dates (16 Nov), so going or not is settled while the
     days are planned around it. The list is fixed when the sheet opens, so a ticket just marked stays there to undo. */
  var dTicketKeys = [];
  function openDays(stay, opener, team) {
    dStay = !!stay; dsel = dRange();
    dTicketKeys = [];
    if (team && !stay) (tp.own() ? tp.userMatches() : []).forEach(function (m) {
      if (!m.f.a && m.f.t && m.f.t.split(' v ').indexOf(team) > -1 && state.tickets.indexOf(m.tkey) < 0) dTicketKeys.push(m.key);
    });
    var tl = document.getElementById('tp-tl'), overTl = !!(tl && tl.classList.contains('is-open'));
    openPm(stay ? 'days:stay' : 'days', opener, overTl);
    pmOpenerEl = opener || null; pmAnchor = anchorOf(opener);
    daysPaint();
  }
  // Setting the days rebuilds the sections above the link that opened the sheet; the page is held so that link (now
  // Change) stays exactly where it was on screen, and focus goes back to it
  function holdPlace(fn) {
    var op = pmOpenerEl, sel = op && op.closest('#tp-third-trip') ? '#tp-third-trip [data-act="trip"]' : op && op.closest('#tp-tl-daysline') ? '#tp-tl-daysline [data-act="days"]' : op && op.closest('#tp-ask') ? '#tp-ask [data-act="change"], #tp-ask .tp-ask-title' : null;
    var an = pmAnchor && document.querySelector(pmAnchor), ref = op && document.contains(op) ? op : an;
    var y0 = ref ? ref.getBoundingClientRect().top : null, inPage = ref && body.contains(ref);
    fn();
    var nu = sel && document.querySelector(sel);
    if (!nu && op && document.contains(op)) nu = op;
    if (!nu && pmAnchor) { var an2 = document.querySelector(pmAnchor); nu = an2 && (an2.querySelector('[data-go-stay], .tp-go-btn, button, a[href]') || an2); }
    if (nu && y0 !== null && inPage) body.scrollTop += nu.getBoundingClientRect().top - y0;
    if (nu) { pmOpenerEl = nu; requestAnimationFrame(function () { nu.focus({ preventScroll: true }); }); }
  }
  function daysRefresh(focusSel) {
    pmBody.innerHTML = pmDays();
    daysPaint();
    var el = focusSel && pm.querySelector(focusSel);
    if (el && !el.disabled) el.focus({ preventScroll: true });
  }
  // Selection drawn in place (slider handles, calendar days, summary, Use these dates): a drag never rebuilds the sheet
  function daysPaint() {
    var r = pm.querySelector('.tp-days-range'); if (!r) return;
    var a = dsel ? dsel.a : RMIN, z = dsel ? (dsel.z !== null ? dsel.z : dsel.a) : RMAX, pct = function (d) { return ((d - RMIN) / RSPAN * 100) + '%'; };
    r.querySelectorAll('[data-dh]').forEach(function (h) { var v = h.dataset.dh === 'from' ? a : z; h.style.left = pct(v); h.setAttribute('aria-valuenow', v); h.setAttribute('aria-valuetext', dayLabel(v)); });
    var fill = r.querySelector('.tp-range-fill'); fill.style.left = pct(a); fill.style.width = ((z - a) / RSPAN * 100) + '%';
    r.classList.toggle('is-unset', !dsel);
    pm.querySelectorAll('[data-dday]').forEach(function (b) {
      var d = +b.dataset.dday, st = !!dsel, s0 = st && d === dsel.a, s1 = st && dsel.z !== null && d === dsel.z, mid = st && dsel.z !== null && d > dsel.a && d < dsel.z;
      b.classList.toggle('is-start', s0); b.classList.toggle('is-end', s1); b.classList.toggle('is-in', mid);
      b.setAttribute('aria-pressed', s0 || s1 || mid ? 'true' : 'false');
    });
    var ms = dMatches(), n = dsel && dsel.z !== null ? dsel.z - dsel.a + 1 : 0, inN = 0;
    if (n) Object.keys(ms).forEach(function (d) { if (+d >= dsel.a && +d <= dsel.z) inN += ms[d].length; });
    var sum = pm.querySelector('.tp-days-sum');
    if (sum) sum.textContent = !dsel ? 'Tap your first day, then your last, or drag the ends of the bar.' : dsel.z === null ? 'First day: ' + dayLabel(dsel.a) + '. Now tap your last day.'
      : tp.isoRange(isoOf(dsel.a), isoOf(dsel.z)) + ' \u00b7 ' + n + (n === 1 ? ' day' : ' days') + (Object.keys(ms).length ? ', ' + (inN ? inN + ' of your NSW matches' : 'none of your NSW matches') : '');
    var use = pm.querySelector('[data-duse]'); if (use) use.disabled = !n;
    pm.querySelectorAll('[data-dquick]').forEach(function (c) { var q = quickRange(c.dataset.dquick); c.setAttribute('aria-pressed', !!(q && n && isoOf(dsel.a) === q.from && isoOf(dsel.z) === q.to) + ''); });
  }
  function daysSlide(which, d) {
    d = Math.max(RMIN, Math.min(RMAX, d));
    var a = dsel ? dsel.a : RMIN, z = dsel ? (dsel.z !== null ? dsel.z : dsel.a) : RMAX;
    if (which === 'from') a = Math.min(z, d); else z = Math.max(a, d); // the handles never cross
    dsel = { a: a, z: z }; daysPaint();
  }
  var dDrag = null;
  pm.addEventListener('pointerdown', function (e) {
    var tr = e.target.closest('.tp-days-range .tp-range-track'); if (!tr) return;
    var rect = tr.getBoundingClientRect(), at = RMIN + Math.round((e.clientX - rect.left) / rect.width * RSPAN), h = e.target.closest('[data-dh]');
    if (!h) { var a = dsel ? dsel.a : RMIN, z = dsel && dsel.z !== null ? dsel.z : RMAX; h = tr.querySelector('[data-dh="' + (Math.abs(at - a) <= Math.abs(at - z) && at <= z ? 'from' : 'to') + '"]'); daysSlide(h.dataset.dh, at); }
    e.preventDefault(); h.focus({ preventScroll: true });
    dDrag = { h: h, rect: rect }; h.classList.add('is-dragging');
    try { tr.setPointerCapture(e.pointerId); } catch (err) {}
  });
  pm.addEventListener('pointermove', function (e) { if (dDrag) daysSlide(dDrag.h.dataset.dh, RMIN + Math.round((e.clientX - dDrag.rect.left) / dDrag.rect.width * RSPAN)); });
  function dDragEnd() { if (!dDrag) return; dDrag.h.classList.remove('is-dragging'); dDrag = null; if (dsel) tp.say(tp.isoRange(isoOf(dsel.a), isoOf(dsel.z)) + '.'); }
  pm.addEventListener('pointerup', dDragEnd); pm.addEventListener('pointercancel', dDragEnd);
  pm.addEventListener('keydown', function (e) {
    var h = e.target.closest('[data-dh]'); if (!h) return;
    var v = +h.getAttribute('aria-valuenow'), step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 7, PageDown: -7 }[e.key];
    if (e.key === 'Home') v = RMIN; else if (e.key === 'End') v = RMAX; else if (step) v += step; else return;
    e.preventDefault(); daysSlide(h.dataset.dh, v);
  });
  pm.addEventListener('click', function (e) {
    if (!pmOpen || pmOpen.id.indexOf('days') !== 0) return;
    var b = e.target.closest('[data-dday], [data-dquick], [data-duse], [data-dclear], [data-sbase], [data-sparty], [data-dclose]'); if (!b) return;
    var t = trip() || {};
    if (b.dataset.dday !== undefined) {
      var d = +b.dataset.dday;
      if (!dsel || dsel.z !== null || d < dsel.a) dsel = { a: d, z: null }; else dsel.z = d;
      daysPaint();
      tp.say(dsel.z === null ? 'First day ' + dayLabel(d) + '. Now pick your last day.' : 'Last day ' + dayLabel(d) + '. ' + tp.isoRange(isoOf(dsel.a), isoOf(dsel.z)) + '.');
      return;
    }
    if (b.dataset.dquick) { var r = quickRange(b.dataset.dquick); if (r) dsel = { a: tp.isoDay(r.from), z: tp.isoDay(r.to) }; daysPaint(); if (dsel) tp.say(tp.isoRange(isoOf(dsel.a), isoOf(dsel.z)) + '.'); return; }
    if (b.hasAttribute('data-duse')) {
      if (!dsel || dsel.z === null) return;
      var from = isoOf(dsel.a), to = isoOf(dsel.z);
      askEditing = false; askDraft = null; askError = ''; askOwn = true;
      holdPlace(function () { tp.setTrip({ from: from, to: to, base: t.base, party: t.party }); });
      closePm(); tp.say('Your days: ' + tp.isoRange(from, to) + '.');
      return;
    }
    if (b.hasAttribute('data-dclear')) {
      askEditing = false; askDraft = null; askError = ''; askOwn = true; dsel = null;
      holdPlace(function () { tp.setTrip({ base: t.base, party: t.party }); }); closePm(); tp.say('Your days are removed.'); return;
    }
    if (b.dataset.sbase !== undefined) { var v = t.base === b.dataset.sbase ? undefined : b.dataset.sbase; askOwn = true; holdPlace(function () { tp.setTrip({ from: t.from, to: t.to, base: v, party: t.party }); }); daysRefresh('[data-sbase="' + CSS.escape(b.dataset.sbase) + '"]'); tp.say(v ? baseLabel(v) + '.' : 'Where you’re staying is removed.'); return; }
    if (b.dataset.sparty !== undefined) { var pv = t.party === b.dataset.sparty ? undefined : b.dataset.sparty; askOwn = true; holdPlace(function () { tp.setTrip({ from: t.from, to: t.to, base: t.base, party: pv }); }); daysRefresh('[data-sparty="' + CSS.escape(b.dataset.sparty) + '"]'); return; }
    if (b.hasAttribute('data-dclose')) closePm();
  });

  phone.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o && !pm.contains(o) && o.isConnected) { var tlEl = document.getElementById('tp-tl'); if (openPm(o.dataset.open, o, !!(tlEl && tlEl.classList.contains('is-open') && tlEl.contains(o))) !== false) pmOpenerEl = o; return; }
    var gs = e.target.closest('[data-go-stay]');
    if (gs && !pm.contains(gs) && gs.isConnected) { openStaying(gs); return; } // not one a sheet has just redrawn away
  });
  pm.addEventListener('click', function (e) {
    // A link inside the sheet to something with details of its own (a venue, a place, a match): the sheet drills down
    var ol = e.target.closest('[data-open]');
    if (ol && pmBody.contains(ol)) { e.preventDefault(); pmPush(ol.dataset.open, ol); return; }
    if (e.target.closest('[data-pm-close]')) { pmClearHistory(); closePm(); return; } // the cross closes the whole sheet
    // From the travel sheet: Where are you staying? as the next level; Done comes back to the route, now their own
    var gst = e.target.closest('[data-go-stay]');
    if (gst) { dStay = true; dsel = dRange(); dTicketKeys = []; pmPush('days:stay', gst); return; }
    // An added item's sheet: Move to another day, or Remove
    var mvb = e.target.closest('[data-pm-move]');
    if (mvb && pmOpen && pmOpen.id.indexOf('item:') === 0) {
      var nid = moveItem(pmOpen.id.slice(5), +mvb.dataset.pmMove);
      pmOpen.id = 'item:' + nid;
      var moved = addedItem(nid);
      pmSaid = moved ? moved.title + ' moved to ' + (moved.when || moved.day) + '.' : '';
      pmBody.innerHTML = pmItem(nid);
      if (typeof tp.tlSelect === 'function') tp.tlSelect(-1, false, nid); // its marker stays the chosen one, on its new day
      var again = pm.querySelector('[data-pm-move], [data-pm-remove]'); if (again) again.focus({ preventScroll: true });
      return;
    }
    var rmb = e.target.closest('[data-pm-remove]');
    if (rmb) {
      var gone = addedItem(rmb.dataset.pmRemove);
      tp.removeItem(rmb.dataset.pmRemove);
      if (gone) tp.say(gone.title + ' removed from your timeline. ' + state.added.length + ' added.');
      tp.stackClose(false);
      document.getElementById('tp-tl-title').focus({ preventScroll: true });
      return;
    }
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
    var sb = e.target.closest('[data-pm-spot]');
    if (sb) {
      var si = ITEMS[sb.dataset.pmSpot];
      // The page redraws on every change and clears its list of items, so after the first Add the rest found nothing
      // (and the first could not be undone): the sheet's own entries are rebuilt first
      if (!si && pmOpen && pmOpen.id.indexOf('match:') === 0) { pmBody.innerHTML = pmMatch(pmOpen.id.slice(6)); si = ITEMS[sb.dataset.pmSpot]; }
      if (!si) return;
      var son = !added(si.id);
      if (son) tp.addItem(Object.assign({}, si)); else tp.removeItem(si.id);
      pmSaid = si.title + (son ? ' added to your timeline on ' + si.day + '.' : ' removed from your timeline.');
      e.stopPropagation(); // handled here: the page's own Add handler must not toggle it back
      pmRefresh('[data-pm-spot="' + CSS.escape(si.id) + '"]');
      tp.say(pmSaid + ' ' + state.added.length + ' added.');
      return;
    }
    // A screening's Add in a match's own sheet (Where to watch it in NSW): adds or takes it off, and the sheet redraws so
    // every Add in it stays live (they did nothing before: the page's handler leaves the sheet alone)
    var vb = e.target.closest('.tp-add[data-item]');
    if (vb && pmOpen && (pmOpen.id.indexOf('match:') === 0 || pmOpen.id.indexOf('wt:') === 0)) {
      var vid = vb.dataset.item, vi = ITEMS[vid], isWt = pmOpen.id.indexOf('wt:') === 0;
      var redraw = function () { pmBody.innerHTML = isWt ? pmWt(pmOpen.id.slice(3)) : pmMatch(pmOpen.id.slice(6)); };
      if (!vi) { redraw(); vi = ITEMS[vid]; } // the page redrew and cleared the list
      if (!vi) return;
      var von = !added(vi.id);
      if (von) tp.addItem(Object.assign({}, vi)); else tp.removeItem(vi.id);
      pmSaid = vi.title + (von ? ' added to your timeline on ' + vi.day + '.' : ' removed from your timeline.');
      e.stopPropagation();
      if (isWt) { var st = pmBody.scrollTop; redraw(); pmBody.scrollTop = st; var fb = pm.querySelector('.tp-add[data-item="' + CSS.escape(vid) + '"]'); if (fb) fb.focus({ preventScroll: true }); }
      else pmRefresh('.tp-add[data-item="' + CSS.escape(vid) + '"]');
      tp.say(pmSaid + ' ' + state.added.length + ' added.');
      return;
    }
    var pb = e.target.closest('[data-pm-poi]');
    if (pb && POI) {
      var pp = POI.pois.filter(function (q) { return q.id === pb.dataset.pmPoi; })[0]; if (!pp) return;
      var pit = addedItem('poi:' + pp.id);
      if (pit) { tp.removeItem(pit.id); tp.say(pp.title + ' removed from your plan.'); }
      else {
        tp.addItem(tp.poiItem(pp));
        var nu = addedItem('poi:' + pp.id);
        tp.say(!nu ? '' : nu.unplaced ? pp.title + ' saved, not placed yet. ' + (stay() ? 'No free day fits it yet.' : 'It goes into a free day once you set your days.') : pp.title + ' added to your plan on ' + nu.day + '.');
      }
      pmBody.innerHTML = pmPoi(pp);
      var pf = pm.querySelector('[data-pm-poi]'); if (pf) pf.focus({ preventScroll: true });
      if (tp.ovRefresh) tp.ovRefresh();
      return;
    }
    var b = e.target.closest('[data-pm-add]'); if (!b) return;
    var it = ITEMS[b.dataset.pmAdd]; if (!it) return;
    var on = !added(it.id);
    if (on && pmHistory.some(function (h) { return h.id.indexOf('ideas:') === 0; })) tlIdeasAdded.push(it.id); // from an idea's details: lands on the axis when the sheet closes
    if (on) tp.addItem(Object.assign({}, it)); else tp.removeItem(it.id);
    // The page stays open; its button follows (the card behind updates with the page)
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.querySelector('.tp-pm-add-l').innerHTML = addLabel(on, on ? 'Added to your timeline' : 'Add to your timeline');
    tp.say(it.title + (on ? ' added to your timeline on ' + it.day + '. ' : ' removed from your timeline. ') + state.added.length + ' added.');
  });
  pm.addEventListener('change', function (e) {
    // I have a ticket in the days sheet (from Plan around your match day): the same rule as the match sheet
    var dt = e.target.closest('[data-dticket]');
    if (dt) {
      var dm = tp.match(dt.dataset.dticket); if (!dm) return;
      tp.setTicket(dm.tkey, dt.checked);
      tp.say(dt.checked ? 'Ticket marked for ' + matchName(dm.f) + '.' : 'Ticket removed for ' + matchName(dm.f) + '.');
      return;
    }
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
    // Going? Mark your ticket on the match: the match's own sheet opens over the page, at its I have a ticket (it used
    // to scroll the page up to the match card in Your matches, a jump nobody asked for)
    var gk = e.target.closest('[data-going-mark]');
    if (gk) {
      var km = tp.match(gk.dataset.goingMark); if (!km) return;
      openPm('match:' + km.key, gk); pmOpenerEl = gk;
      var tb2 = pm.querySelector('[data-pm-ticket]'); if (tb2) tb2.focus({ preventScroll: true });
      tp.say(matchName(km.f) + ': tick I have a ticket if you are going.');
      return;
    }
    var gq = e.target.closest('[data-going]');
    if (gq && !pm.contains(gq)) {
      var gm = tp.match(gq.dataset.going); if (!gm) return;
      var gf = gm.f, gid = matchId(gm.key), v = gq.dataset.v;
      if (v === 'no') {
        state.notGoing = (state.notGoing || []).concat([gm.key]); tp.save();
        var ck = (gq.closest('.tp-wm') || {}).dataset; ck = ck && ck.key || gm.key;
        render(true, '.tp-wm[data-key="' + CSS.escape(ck) + '"] .tp-add');
        tp.say('Not going to ' + matchName(gf) + '. Its screenings stay listed.');
        return;
      }
      if (v === 'yes') {
        tp.flyToBar(gq);
        var mine = gf.t && gf.t.split(' v ').some(function (n) { return tp.isPicked(n); }) || (tp.rugby() && !gf.a);
        if (!mine && !added(gid)) tp.addItem({ id: gid, kind: 'match', key: gm.key, title: matchName(gf), kindLabel: 'Match', day: gf.d, place: gf.v + ', ' + gf.p });
        state.notGoing = (state.notGoing || []).filter(function (k) { return k !== gm.key; });
        tp.setTicket(gm.tkey, true);
        render(true, '#go-' + CSS.escape(gm.key.replace(/\W+/g, '-')));
        tp.say('Going to ' + matchName(gf) + ', ' + gf.d + '. Ticket marked and the match is on your timeline. Its screenings give way to getting there and back.');
        return;
      }
      // Not going after all: the ticket comes off (and the match added for it); the screenings come back
      tp.setTicket(gm.tkey, false);
      if (added(gid)) tp.removeItem(gid);
      render(true, '.tp-wm [data-going="' + CSS.escape(gm.key) + '"][data-v="yes"]');
      tp.say('Ticket removed for ' + matchName(gf) + '. Its screenings are back.');
      return;
    }
    // Not a button inside a sheet, and not one a sheet has just redrawn away (it is no longer in the page)
    var inIdeas = !!(tlIdeas && tlIdeas.contains(e.target));
    var b = e.target.closest('.tp-add'); if (!b || (pm.contains(b) && !inIdeas) || !b.isConnected) return;
    var it = ITEMS[b.dataset.item]; if (!it) return;
    if (added(it.id)) {
      tp.removeItem(it.id);
      tp.say(it.title + ' removed from your timeline. ' + state.added.length + ' added.');
    } else if (inIdeas) {
      // Added from the ideas sheet: the axis is behind the sheet, so its marker settles with a ring once the sheet closes
      tp.addItem(Object.assign({}, it));
      tlIdeasAdded.push(it.id);
      tp.say(it.title + ' added to your timeline on ' + it.day + '. ' + state.added.length + ' added.');
      return;
    } else {
      tp.flyToBar(b);
      tp.addItem(Object.assign({}, it));
      tp.say(it.title + ' added to your timeline on ' + it.day + '. ' + state.added.length + ' added.');
    }
  });

  /* ---------- The one question ---------- */
  var askEditing = false, askManual = false, askError = '', askDraft = null, askUndo = [], askKeyT = 0;
  var I_UNDO = '<svg class="tp-ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.5 3.5L2.5 6.5l3 3M2.8 6.5H10a3.5 3.5 0 0 1 0 7H7"/></svg>';
  var I_RESET = '<svg class="tp-ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8a5 5 0 1 0 1.5-3.6M4.5 1.8v2.8H7.3"/></svg>'; // askDraft: what they typed, kept through an error
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
  /* ---------- Your days, and Refine your plan (on the page, under the team picker) ----------
     Asked only once there is something to plan around (a team, every NSW match or a match of their own), and nothing is
     guessed: the days start empty. Two quick picks fill them in one tap (Around my matches: the day before their first
     NSW match to the day after their last; About a week: seven days from the day before their first NSW match), or the
     fields and the slider. Refine your plan (optional, folded) asks where they are staying and who is coming; the
     answers choose and order the ideas below, and apply as they are tapped. */
  var refineOpen = false, placeQ = '';
  function quickRange(kind) {
    var M = model(), ds = (M.nsw.length ? M.nsw : M.ms).map(function (m) { return m.day; }).sort(function (x, y) { return x - y; });
    if (!ds.length) return null;
    // ±N days: N days either side of their first and last match (as Airbnb's flexible dates); week: a week from the
    // day before the first; matches: one day either side
    var pm = /^pm(\d+)$/.exec(kind), w = pm ? +pm[1] : 1;
    var a = ds[0] - w, z = kind === 'week' ? ds[0] - 1 + 6 : ds[ds.length - 1] + w;
    if (kind === 'week') a = ds[0] - 1;
    return { from: isoOf(Math.max(RMIN, a)), to: isoOf(Math.min(RMAX, z)) };
  }
  var BASE_Q = [['local', 'I’m a local'], ['Sydney CBD', 'Sydney CBD'], ['Newcastle', 'Newcastle'], ['Bondi', 'Bondi'], ['outside', 'Outside NSW']];
  var PARTY_Q = [['solo', 'Solo'], ['couple', 'Couple'], ['friends', 'Friends'], ['family', 'Family']];
  function baseLabel(b) { return b === 'local' ? 'I’m a local' : b === 'outside' ? 'Staying outside NSW' : 'Staying in ' + b; }
  function partyLabel(p) { return { solo: 'Solo', couple: 'A couple', friends: 'Friends', family: 'Family' }[p] || ''; }
  function chip(attr, val, label, on) { return '<button type="button" class="tp-chip" data-' + attr + '="' + esc(val) + '" aria-pressed="' + !!on + '">' + label + '</button>'; }
  function renderAsk() {
    var t = trip() || {}, show = tp.own();
    ask.hidden = !show;
    if (!show) { ask.innerHTML = ''; return; }
    var has = !!(t.from && t.to), h = '<h3 class="tp-ask-title" id="tp-ask-title">Your days in NSW</h3>';
    if (has && !askEditing) {
      h += '<p class="tp-ask-sum">' + window.tpIcons.cal + '<span class="tp-ask-sum-text">' + esc(tp.isoRange(t.from, t.to)) + '</span> · <button type="button" class="tp-link" data-act="change">Change</button></p>';
    } else {
      // No quick picks and no Use these dates (16 Nov): every change applies as it is made, with Undo and Reset
      var mdays = {}; (tp.own() ? tp.userMatches() : []).forEach(function (m) { if (!m.f.a) mdays[m.day] = 1; });
      h += '<p class="tp-sec-note">Optional. Set them and the ideas below fit around your matches' + (Object.keys(mdays).length ? ', dotted on the bar' : '') + '.</p>' +
        '<div class="tp-dates"><label class="tp-date"><span>First day</span><input type="date" id="tp-from" data-f="from" min="2027-09-29" max="2027-11-15" value="' + esc((askDraft || t).from || '') + '"></label>' +
        '<label class="tp-date"><span>Last day</span><input type="date" id="tp-to" data-f="to" min="2027-09-29" max="2027-11-15" value="' + esc((askDraft || t).to || '') + '"></label></div>' +
        '<div class="tp-range" id="tp-range"><div class="tp-range-track"><span class="tp-range-fill"></span>' +
        '<span class="tp-range-mark" aria-hidden="true" style="left:' + (2 / 47 * 100) + '%"></span><span class="tp-range-mark" aria-hidden="true" style="left:' + (45 / 47 * 100) + '%"></span>' +
        Object.keys(mdays).map(function (d) { return '<span class="tp-range-match" aria-hidden="true" style="left:' + ((+d + 2) / 47 * 100) + '%"></span>'; }).join('') +
        '<span class="tp-range-h" role="slider" tabindex="0" data-h="from" aria-label="First day" aria-valuemin="-2" aria-valuemax="45"></span>' +
        '<span class="tp-range-h" role="slider" tabindex="0" data-h="to" aria-label="Last day" aria-valuemin="-2" aria-valuemax="45"></span></div>' +
        '<div class="tp-range-ends" aria-hidden="true"><span>29 Sep</span><span class="tp-range-out"></span><span>15 Nov</span></div></div>' +
        (askError ? '<p class="tp-ask-err" role="alert">' + esc(askError) + '</p>' : '') +
        ((askUndo.length || has || (askDraft && (askDraft.from || askDraft.to))) ? '<div class="tp-ask-acts tp-ask-acts--links">' +
          (askUndo.length ? '<button type="button" class="tp-link tp-ico-link" data-act="undo">' + I_UNDO + 'Undo</button>' : '') +
          (has || (askDraft && (askDraft.from || askDraft.to)) ? '<button type="button" class="tp-link tp-ico-link" data-act="clear">' + I_RESET + 'Reset</button>' : '') + '</div>' : '');
    }
    if (askNews) h += '<p class="tp-ask-news">' + esc(askNews) + '</p>';
    // Refine your plan: folded; a line under it says what is set
    var bits = [t.base ? baseLabel(t.base) : '', t.party ? partyLabel(t.party) : ''].filter(Boolean);
    h += '<div class="tp-refine"><button type="button" class="tp-refine-btn" data-act="refine" aria-expanded="' + refineOpen + '" aria-controls="tp-refine-panel">Refine your plan by adding more details<svg class="tp-refine-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      (bits.length && !refineOpen ? '<p class="tp-refine-sum">' + esc(bits.join(' · ')) + '</p>' : '');
    if (refineOpen) {
      var cur = t.base || '', fromList = basePlace() && !BASE_Q.some(function (x) { return x[0] === cur; });
      h += '<div class="tp-refine-panel" id="tp-refine-panel">' +
        '<h4 class="tp-refine-q" id="tp-q-base">Do you know where you’re staying?</h4>' +
        '<div class="tp-quick" role="group" aria-labelledby="tp-q-base">' + BASE_Q.map(function (x) { return chip('base', x[0], x[1], cur === x[0]); }).join('') + '</div>' +
        '<label class="tp-place"><span>Or find a place in NSW</span><input type="search" id="tp-place" autocomplete="off" placeholder="For example Parramatta" value="' + esc(placeQ) + '" aria-controls="tp-place-list" aria-expanded="' + !!placeQ + '"></label>' +
        '<ul class="tp-place-list" id="tp-place-list" aria-label="NSW places"' + (placeQ ? '' : ' hidden') + '>' + placeList() + '</ul>' +
        (fromList ? '<p class="tp-place-cur">' + esc(baseLabel(cur)) + ' · <button type="button" class="tp-link" data-base="' + esc(cur) + '">Remove</button></p>' : '') +
        '<h4 class="tp-refine-q" id="tp-q-party">Who’s coming?</h4>' +
        '<div class="tp-quick" role="group" aria-labelledby="tp-q-party">' + PARTY_Q.map(function (x) { return chip('party', x[0], x[1], t.party === x[0]); }).join('') + '</div>' +
        '</div>';
    }
    h += '</div>';
    ask.innerHTML = h;
    if (ask.querySelector('#tp-range')) { var keep = rRoot; rRoot = ask; rangeFromFields(); rRoot = keep; }
  }
  function placeList() {
    var q = placeQ.trim().toLowerCase(); if (!q) return '';
    var hits = PLACES.filter(function (x) { return x.n.toLowerCase().split(/\s+/).some(function (w) { return w.indexOf(q) === 0; }) || x.n.toLowerCase().indexOf(q) === 0; }).slice(0, 5);
    return hits.length ? hits.map(function (x) { return '<li><button type="button" class="tp-place-opt" data-base="' + esc(x.n) + '">' + esc(x.n) + '</button></li>'; }).join('')
      : '<li class="tp-place-none">No NSW place matches “' + esc(placeQ.trim()) + '”. Staying outside NSW? Choose Outside NSW above.</li>';
  }
  function setPart(k, v, before, lead) {
    var t = trip() || {}, o = { from: t.from, to: t.to, base: t.base, party: t.party };
    o[k] = v; askOwn = true; tp.setTrip(o);
    return changedSince(before, lead);
  }
  ask.addEventListener('input', function (e) {
    if (e.target.id !== 'tp-place') return;
    placeQ = e.target.value;
    var list = ask.querySelector('#tp-place-list');
    list.innerHTML = placeList(); list.hidden = !placeQ.trim();
    e.target.setAttribute('aria-expanded', placeQ.trim() ? 'true' : 'false');
  });
  ask.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var t = trip() || {}, h0 = ask.offsetHeight, before = snap(), said;
    askNews = '';
    if (b.dataset.quick) {
      var r = quickRange(b.dataset.quick); if (!r) return;
      askEditing = false; askDraft = null; askError = '';
      askOwn = true; tp.setTrip({ from: r.from, to: r.to, base: t.base, party: t.party });
      said = changedSince(before, 'Your days: ' + tp.isoRange(r.from, r.to) + '.');
      settle('[data-act="change"]', h0); tp.say(said); return;
    }
    if (b.dataset.base !== undefined && ask.contains(b)) {
      // One answer: tapping the chosen one again clears it; choosing a place from the list replaces a quick answer
      var v = t.base === b.dataset.base ? undefined : b.dataset.base;
      placeQ = '';
      said = setPart('base', v, before, v ? baseLabel(v) + '.' + (v === 'local' ? ' Ideas now for a local: nearest first, no dates needed.' : '') : 'Where you’re staying is cleared.');
      settle(v && !BASE_Q.some(function (x) { return x[0] === v; }) ? '#tp-place' : '[data-base="' + CSS.escape(b.dataset.base) + '"]', h0); tp.say(said); return;
    }
    if (b.dataset.party) {
      var pv = t.party === b.dataset.party ? undefined : b.dataset.party;
      said = setPart('party', pv, before, pv ? 'Ideas ordered for ' + { solo: 'one', couple: 'a couple', friends: 'friends', family: 'a family' }[pv] + '.' : 'Who’s coming is cleared.');
      settle('[data-party="' + CSS.escape(b.dataset.party) + '"]', h0); tp.say(said); return;
    }
    var act = b.dataset.act;
    if (act === 'refine') { refineOpen = !refineOpen; settle('[data-act="refine"]', h0); return; }
    if (act === 'change') { askEditing = true; settle('#tp-from', h0); return; }
    if (act === 'clear' || act === 'undo') { rRoot = ask; askHold(); daysStep(act, '#tp-from'); }
    // (Use these dates is gone: days apply as they are set, see applyDays below)
  });
  // Undo and Reset, from either slider (rRoot): one history. Undoing the change that placed saved places puts them back
  // in Saved, not placed yet, as they were
  function daysStep(act, fallback) {
    var t = trip() || {}, before = snap(), said;
    if (act === 'clear') {
      if (t.from || t.to) askUndo.push({ from: t.from || '', to: t.to || '' });
      askEditing = true; askDraft = null; askError = '';
      askOwn = true; tp.setTrip({ base: t.base, party: t.party });
      said = changedSince(before, 'Your days are reset.');
    } else {
      var prev = askUndo.pop(); if (!prev) return;
      askEditing = true; askDraft = null; askError = ''; askOwn = true;
      (prev.placed || []).forEach(function (id) { var it = addedItem(id); if (it) { it.day = ''; it.unplaced = true; } });
      tp.setTrip(prev.from ? { from: prev.from, to: prev.to, base: t.base, party: t.party } : { base: t.base, party: t.party });
      said = changedSince(before, prev.from ? 'Back to ' + tp.isoRange(prev.from, prev.to) + '.' : 'Your days are removed again.') + ((prev.placed || []).length ? ' ' + prev.placed.length + (prev.placed.length === 1 ? ' saved place is' : ' saved places are') + ' back in Saved, not placed yet.' : '');
    }
    askQuiet(askUndo.length ? '[data-act="undo"]' : fallback); tp.say(said);
  }
  // Days apply as they are set: on letting go of a slider handle, a short pause after the arrow keys, or a date field
  // changing. Each change can be undone. The panel redraws quietly (no fade), focus stays where it was
  // Setting days can grow what sits above the panel (the map's Follow day by day line): the panel is held where it was
  // on screen, so nothing jumps under the person's finger
  var askY = null;
  function askHold() { askY = ask.getBoundingClientRect().top; }
  function askQuiet(sel) {
    render(true);
    if (askY !== null) { body.scrollTop += ask.getBoundingClientRect().top - askY; askY = null; }
    var el = sel && (rRoot || ask).querySelector(sel); if (el) el.focus({ preventScroll: true });
  }
  // The slider is in two places: Your days on the page (#tp-ask) and, while no days are set, the open timeline
  // (#tp-tl-daysline). rRoot is the one in use, set as each event comes in; both share one Undo history
  var rRoot = null;
  function applyDays(a, z, sel) {
    var t = trip() || {}, lo = '2027-09-29', hi = '2027-11-15', before = snap();
    askDraft = { from: a, to: z };
    if (!a || !z) { askError = ''; return; } // waiting for the other day
    if (a < lo || a > hi || z < lo || z > hi) { askError = 'Pick days between 29 Sep and 15 Nov, around the tournament.'; askQuiet(sel); return; }
    if (z < a) { askError = 'The last day is before the first day.'; askQuiet(sel); return; }
    if (t.from === a && t.to === z) { askDraft = null; return; }
    var step = { from: t.from || '', to: t.to || '' }, wait = tp.unplaced().map(function (x) { return x.id; });
    askUndo.push(step);
    askError = ''; askDraft = null; askEditing = true; askOwn = true;
    if (rRoot !== daysLine) askHold();
    var land = tlWaitRects();
    tp.setTrip({ from: a, to: z, base: t.base, party: t.party });
    step.placed = wait.filter(function (id) { var it = addedItem(id); return it && !it.unplaced; });
    tlWaitLand(land);
    // Work out what changed before the panel redraws, so its line under the slider is about this change, not the last
    var said = changedSince(before, 'Your days: ' + tp.isoRange(a, z) + '.');
    askQuiet(sel);
    tp.say(said);
  }
  function applyFromFields(sel) { var p = rangeParts(); if (p.from && p.to) applyDays(p.from.value, p.to.value, sel); }
  ask.addEventListener('change', function (e) { if (e.target.id === 'tp-from' || e.target.id === 'tp-to') { rRoot = ask; applyFromFields('#' + e.target.id); } });
  /* Saved, not placed yet, going onto days as the days are set in the open timeline: each glides from its row in the
     list to its day on the axis (the same flight as an idea landing), one after another */
  function tlWaitRects() {
    var out = {}, tl = document.getElementById('tp-tl');
    if (!tl || !tl.classList.contains('is-open')) return out;
    document.querySelectorAll('#tp-tl-wait [data-wait-rm]').forEach(function (b) { var li = b.closest('li'); if (li && li.getClientRects().length) out[b.dataset.waitRm] = li.getBoundingClientRect(); });
    return out;
  }
  function tlWaitLand(rects) {
    var n = 0;
    Object.keys(rects).forEach(function (id) {
      var it = addedItem(id); if (!it || it.unplaced || !tp.tlLand) return;
      var r = rects[id], at = n++;
      setTimeout(function () { tp.tlLand(id, { left: r.left + 16, top: r.top, width: 22, height: r.height }); }, at * 160);
    });
  }
  var lastTrip = '', askOwn = false;
  /* ---------- The date slider: 29 Sep to 15 Nov (the tournament and two days either side), two handles ----------
     Each handle is a slider (arrows a day, Page Up and Down a week, Home and End to the limit); they never cross. It
     and the date fields (limited to the same days) follow each other; Use these dates still commits. A date typed past
     either end pins its handle there and says so. On a phone: a light haptic tick per day, a firmer one at either end. */
  var RMIN = -2, RMAX = 45, RSPAN = RMAX - RMIN;
  function rangeClamp(d) { return Math.max(RMIN, Math.min(RMAX, d)); }
  function rangeAt(x, rect) { return rangeClamp(RMIN + Math.round((x - rect.left) / rect.width * RSPAN)); } // snaps to whole days
  function rangeDay(iso, fb) { if (!iso) return { d: fb, out: '' }; var d = tp.isoDay(iso); return { d: rangeClamp(d), out: d < RMIN || d > RMAX ? dayLabel(d) + (d < RMIN ? ', before 29 Sep' : ', after 15 Nov') : '' }; }
  function rangeParts() { var root = rRoot || ask; return { r: root.querySelector('.tp-range'), from: root.querySelector('[data-f="from"]'), to: root.querySelector('[data-f="to"]') }; }
  function rangeDraw(a, z, outA, outZ) {
    var p = rangeParts(); if (!p.r) return;
    var hs = p.r.querySelectorAll('.tp-range-h'), pct = function (d) { return ((d - RMIN) / RSPAN * 100) + '%'; };
    [[hs[0], a, outA], [hs[1], z, outZ]].forEach(function (x) {
      x[0].style.left = pct(x[1]);
      x[0].setAttribute('aria-valuenow', x[1]);
      x[0].setAttribute('aria-valuetext', x[2] || dayLabel(x[1]));
    });
    var fill = p.r.querySelector('.tp-range-fill');
    fill.style.left = pct(a); fill.style.width = ((z - a) / RSPAN * 100) + '%';
    var o = p.r.querySelector('.tp-range-out');
    o.textContent = outA || outZ || 'Tournament 1 Oct to 13 Nov'; // the marks' key, unless a typed date is past an end
    o.classList.toggle('is-out', !!(outA || outZ));
  }
  function rangeFromFields() {
    var p = rangeParts(); if (!p.r) return;
    var a = rangeDay(p.from.value, RMIN), z = rangeDay(p.to.value, RMAX);
    if (z.d < a.d) z.d = a.d;
    rangeDraw(a.d, z.d, a.out, z.out);
    p.r.classList.toggle('is-unset', !p.from.value && !p.to.value);
  }
  function rangeSet(which, d) {
    var p = rangeParts(); if (!p.r) return;
    var a = +p.r.querySelector('[data-h="from"]').getAttribute('aria-valuenow'), z = +p.r.querySelector('[data-h="to"]').getAttribute('aria-valuenow');
    // The handles never cross: the one that moves stops at the other
    if (which === 'from') a = Math.max(RMIN, Math.min(z, d)); else z = Math.min(RMAX, Math.max(a, d));
    p.from.value = isoOf(a); p.to.value = isoOf(z);
    p.r.classList.remove('is-unset');
    rangeDraw(a, z, '', '');
    if (askError) { askError = ''; var er = (rRoot || ask).querySelector('.tp-ask-err'); if (er) er.remove(); }
  }
  var rangeDrag = null;
  function bindRange(root) {
  if (!root) return;
  root.addEventListener('pointerdown', function (e) {
    var tr = e.target.closest('.tp-range-track'); if (!tr) return;
    rRoot = root;
    var h = e.target.closest('.tp-range-h');
    var rect = tr.getBoundingClientRect(), at = rangeAt(e.clientX, rect);
    if (!h) { // a tap on the track moves the nearer handle there
      var hs = tr.querySelectorAll('.tp-range-h'), a = +hs[0].getAttribute('aria-valuenow'), z = +hs[1].getAttribute('aria-valuenow');
      h = Math.abs(at - a) <= Math.abs(at - z) && at <= z ? hs[0] : hs[1];
      rangeSet(h.dataset.h, at);
    }
    e.preventDefault();
    h.focus({ preventScroll: true });
    // Both handles on one day: the drag's direction decides which moves (left the first day, right the last)
    var same = tr.querySelector('[data-h="from"]').getAttribute('aria-valuenow') === tr.querySelector('[data-h="to"]').getAttribute('aria-valuenow');
    rangeDrag = { h: h, rect: rect, id: e.pointerId, x0: e.clientX, pending: same };
    try { tr.setPointerCapture(e.pointerId); } catch (err) {}
    h.classList.add('is-dragging');
  });
  root.addEventListener('pointermove', function (e) {
    if (!rangeDrag) return;
    if (rangeDrag.pending) {
      if (Math.abs(e.clientX - rangeDrag.x0) < 4) return;
      rangeDrag.h.classList.remove('is-dragging');
      rangeDrag.h = root.querySelector('.tp-range-h[data-h="' + (e.clientX < rangeDrag.x0 ? 'from' : 'to') + '"]');
      rangeDrag.h.classList.add('is-dragging'); rangeDrag.h.focus({ preventScroll: true });
      rangeDrag.pending = false;
    }
    rangeSet(rangeDrag.h.dataset.h, rangeAt(e.clientX, rangeDrag.rect));
  });
  function rangeEnd() { if (!rangeDrag) return; var w = rangeDrag.h.dataset.h; rangeDrag.h.classList.remove('is-dragging'); rangeDrag = null; applyFromFields('.tp-range-h[data-h="' + w + '"]'); }
  root.addEventListener('pointerup', rangeEnd); root.addEventListener('pointercancel', rangeEnd);
  root.addEventListener('keydown', function (e) {
    var h = e.target.closest('.tp-range-h'); if (!h) return;
    rRoot = root;
    var v = +h.getAttribute('aria-valuenow'), step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 7, PageDown: -7 }[e.key];
    if (e.key === 'Home') v = RMIN; else if (e.key === 'End') v = RMAX; else if (step) v += step; else return;
    e.preventDefault();
    rangeSet(h.dataset.h, v);
    clearTimeout(askKeyT); askKeyT = setTimeout(function () { applyFromFields('.tp-range-h[data-h="' + h.dataset.h + '"]'); }, 450);
  });
  }
  bindRange(ask); bindRange(document.getElementById('tp-tl-daysline'));
  ask.addEventListener('input', function (e) { if (e.target.id === 'tp-from' || e.target.id === 'tp-to') { rRoot = ask; rangeFromFields(); } });
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
  /* Every way to the days from elsewhere (Set your days, Change, the timeline's line) opens them in a sheet where the
     person is; the page no longer jumps down to Your days (agreed 16 Nov) */
  function openAsk(dates, opener) {
    if (!tp.own()) return;
    openDays(false, opener);
  }
  phone.addEventListener('tp:ask', function () { openAsk(true); });
  /* The line under Suits your 3rd half: your days and Change, or the way to set them. Nothing guessed. */
  function renderTripLine() {
    if (!tripEl) return;
    var t = trip() || {}, M = model();
    if (!M.own) { tripEl.innerHTML = ''; return; }
    if (t.from && t.to) {
      tripEl.innerHTML = '<span class="tp-third-trip-a">Your days: ' + esc(tp.isoRange(t.from, t.to)) + '</span> · <button type="button" class="tp-link" data-act="trip">' + window.tpIcons.cal + 'Change</button>';
      return;
    }
    tripEl.innerHTML = '<button type="button" class="tp-link tp-third-trip-ask" data-act="trip">' + window.tpIcons.cal + (M.how === 'one' ? 'Staying longer? Set your days' : 'Set your days to see what fits your free days') + '</button>';
  }
  /* In the open timeline. Days set: one line that says what is set, with Change (the days sheet, stacked).
     No days yet (16 Nov): the date slider itself, in place of the small Add your days link, because setting days is
     what places anything saved from the map; a line says so when something is waiting. It applies as it is set, with
     Undo and Reset (one history with the page's), and stays a slider until the timeline closes, so the days can be
     adjusted; Pick on a calendar opens the days sheet. */
  var daysLine = document.getElementById('tp-tl-daysline'), tlDaysEdit = false;
  function renderDaysLine() {
    if (!daysLine) return;
    var t = trip() || {}, bits = [], has = !!(t.from && t.to), wait = tp.unplaced().length;
    if (has) bits.push('Your days: ' + tp.isoRange(t.from, t.to));
    if (t.base) bits.push(baseLabel(t.base));
    if (t.party) bits.push(partyLabel(t.party));
    daysLine.hidden = !tp.own() && !wait;
    if (!has && !daysLine.hidden) tlDaysEdit = true;
    daysLine.classList.toggle('is-edit', tlDaysEdit && !daysLine.hidden);
    if (!tlDaysEdit) {
      daysLine.innerHTML = (bits.length ? '<span>' + esc(bits.join(' · ')) + '</span> · ' : '') + '<button type="button" class="tp-link" data-act="days">' + window.tpIcons.cal + (t.from ? 'Change' : 'Add your days') + '</button>';
      return;
    }
    var mdays = {}; (tp.own() ? tp.userMatches() : []).forEach(function (m) { if (!m.f.a) mdays[m.day] = 1; });
    var note = has ? 'Your days: ' + tp.isoRange(t.from, t.to) + '. Type new dates or drag either end to change them.'
      : wait ? 'Set your days and ' + (wait === 1 ? 'the place you saved goes' : 'the ' + wait + ' places you saved go') + ' onto free days.'
      : 'Optional. Ideas then fit around your matches' + (Object.keys(mdays).length ? ', dotted on the bar' : '') + '.';
    daysLine.innerHTML = '<span class="tp-tl-setdays-h" id="tp-tl-setdays-h">Your days in NSW</span>' +
      '<span class="tp-tl-setdays-n">' + esc(note) + '</span>' +
      // The same First day and Last day fields as the page (16 Nov): typing a date is the precise and accessible way in,
      // and the slider and fields follow each other
      '<span class="tp-dates"><label class="tp-date"><span>First day</span><input type="date" id="tp-tl-from" data-f="from" min="2027-09-29" max="2027-11-15" value="' + esc((askDraft || t).from || '') + '"></label>' +
      '<label class="tp-date"><span>Last day</span><input type="date" id="tp-tl-to" data-f="to" min="2027-09-29" max="2027-11-15" value="' + esc((askDraft || t).to || '') + '"></label></span>' +
      '<span class="tp-range tp-tl-range" role="group" aria-labelledby="tp-tl-setdays-h"><span class="tp-range-track"><span class="tp-range-fill"></span>' +
      '<span class="tp-range-mark" aria-hidden="true" style="left:' + (2 / 47 * 100) + '%"></span><span class="tp-range-mark" aria-hidden="true" style="left:' + (45 / 47 * 100) + '%"></span>' +
      Object.keys(mdays).map(function (d) { return '<span class="tp-range-match" aria-hidden="true" style="left:' + ((+d + 2) / 47 * 100) + '%"></span>'; }).join('') +
      '<span class="tp-range-h" role="slider" tabindex="0" data-h="from" aria-label="First day" aria-valuemin="-2" aria-valuemax="45"></span>' +
      '<span class="tp-range-h" role="slider" tabindex="0" data-h="to" aria-label="Last day" aria-valuemin="-2" aria-valuemax="45"></span></span>' +
      '<span class="tp-range-ends" aria-hidden="true"><span>29 Sep</span><span class="tp-range-out"></span><span>15 Nov</span></span></span>' +
      (askError && rRoot === daysLine ? '<span class="tp-ask-err" role="alert">' + esc(askError) + '</span>' : '') +
      '<span class="tp-ask-acts tp-ask-acts--links">' +
        (askUndo.length ? '<button type="button" class="tp-link tp-ico-link" data-act="undo">' + I_UNDO + 'Undo</button>' : '') +
        (has ? '<button type="button" class="tp-link tp-ico-link" data-act="clear">' + I_RESET + 'Reset</button>' : '') +
        '<button type="button" class="tp-link tp-ico-link" data-act="days">' + window.tpIcons.cal + 'Pick on a calendar</button></span>';
    var keep = rRoot; rRoot = daysLine; rangeFromFields(); rRoot = keep;
  }
  if (daysLine) {
    daysLine.addEventListener('change', function (e) { if (e.target.dataset.f) { rRoot = daysLine; applyFromFields('#' + e.target.id); } });
    daysLine.addEventListener('input', function (e) { if (e.target.dataset.f) { rRoot = daysLine; rangeFromFields(); } });
  }
  if (daysLine) daysLine.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act="undo"], [data-act="clear"]'); if (!b) return;
    rRoot = daysLine; daysStep(b.dataset.act, '.tp-range-h[data-h="from"]');
  });
  // Closed and opened again, the timeline shows the days as one line with Change
  phone.addEventListener('tp:tlclose', function () { if (tlDaysEdit) { tlDaysEdit = false; renderDaysLine(); } });
  phone.addEventListener('click', function (e) {
    var tb = e.target.closest('#tp-third-trip [data-act="trip"], #tp-tl-daysline [data-act="days"]');
    if (tb) openAsk(true, tb);
  });

  // From the results' interstate note: down to the screenings of their matches
  var toWatch = document.getElementById('tp-to-watch');
  if (toWatch) toWatch.addEventListener('click', function () {
    var w = document.getElementById('tp-watch'), top = w.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16 - (window.tpCapRoom ? window.tpCapRoom() : 0);
    body.scrollTo({ top: Math.max(0, top), behavior: reduce.matches ? 'auto' : 'smooth' });
    document.getElementById('tp-watch-title').setAttribute('tabindex', '-1');
    document.getElementById('tp-watch-title').focus({ preventScroll: true });
  });

  /* ---------- Your plan so far: the end of the page ---------- */
  var planBody = document.getElementById('tp-plan-body'), copied = false;
  function planText() {
    var t = trip(), lines = ['My Rugby World Cup 2027 plan (Plan your 3rd half)'];
    if (t && t.from && t.to) lines.push('In NSW ' + tp.isoRange(t.from, t.to));
    if (t && t.base) lines.push(baseLabel(t.base));
    if (t && t.party) lines.push('Coming: ' + partyLabel(t.party).toLowerCase());
    if (tp.own()) {
      lines.push('', 'Matches (kick-off times are Sydney time):');
      tp.userMatches().forEach(function (m) {
        var f = m.f;
        lines.push('- ' + f.d + ', ' + (f.k || 'time to be confirmed') + ': ' + matchName(f) + ', ' + f.v + ', ' + f.p + (f.a ? ' (interstate)' : '') + (hasTicket(m) ? ' (ticket)' : ''));
      });
    }
    var things = state.added.filter(function (it) { return it.kind !== 'match' && !it.unplaced; }), waiting = tp.unplaced();
    if (things.length) {
      lines.push('', 'Added:');
      things.forEach(function (it) {
        // A longer trip is a span: "Tue 12 to Thu 14 Oct: Hunter Valley (2 nights)"
        if (it.kind === 'trip') { var c = tp.clashes()[it.id]; lines.push('- ' + (it.nights ? spanLabel(it.start, it.start + it.nights) : it.day) + ': ' + it.title + (it.nights ? ' (' + it.nights + (it.nights === 1 ? ' night' : ' nights') + ')' : ' (day trip)') + (c ? ' [clashes with ' + c.map(function (x) { return x.name + ', ' + x.day; }).join('; ') + ']' : '')); return; }
        lines.push('- ' + it.day + ': ' + it.title + (it.place ? ', ' + it.place : '') + (it.matchName ? ' (for ' + it.matchName + ')' : ''));
      });
    }
    if (waiting.length) {
      lines.push('', 'Saved, not placed yet' + (stay() ? ' (no free day fits these yet):' : ' (they go into free days once you set your days):'));
      waiting.forEach(function (it) { lines.push('- ' + it.title + (it.place ? ', ' + it.place : '')); });
    }
    if (things.length || waiting.length) lines.push('', 'Hours, prices and screenings are indicative in this prototype, not confirmed.');
    return lines.join('\n');
  }
  function renderPlan() {
    if (!planBody) return;
    var t = trip(), ms = tp.own() ? tp.userMatches() : [], n = state.added.filter(function (it) { return it.kind !== 'match'; }).length;
    // Save & share in the timeline only shows once there is a plan to keep
    if (ssBtn) ssBtn.hidden = !ms.length && !n;
    if (!ms.length && !n) {
      // Nothing yet: the way in is right here, the team list in a sheet (no jump back up to the cards)
      planBody.innerHTML = '<div class="tp-plan-acts"><button type="button" class="tp-plan-btn tp-plan-btn--primary" data-plan="teams" aria-haspopup="dialog">' + window.tpIcons.fan + 'Pick your teams</button></div>' +
        '<p class="tp-plan-empty">Or add a screening or a place above, and your plan builds up here.</p>';
      return;
    }
    var nsw = ms.filter(function (m) { return !m.f.a; }).length, tk = ms.filter(hasTicket).length;
    var when = t && t.from && t.to ? 'In NSW ' + tp.isoRange(t.from, t.to) : t && t.mode === 'local' ? 'Local' : '';
    var facts = [];
    if (ms.length) facts.push('<li>' + tp.countPhrase(ms.map(function (m) { return m.f; }), { num: function (x) { return '<strong>' + x + '</strong>'; } }) + ', ' + (nsw === ms.length ? 'all in NSW' : nsw ? nsw + ' in NSW' : 'all interstate') + (tk ? ', ' + tk + (tk === 1 ? ' ticket' : ' tickets') : '') + '</li>');
    facts.push('<li><strong>' + n + '</strong> ' + (n === 1 ? 'thing' : 'things') + ' added</li>');
    // With days confirmed, how many of their matches fall in them: the same figure the timeline bar shows
    if (when && t.from && ms.length) {
      // Only NSW matches count as in your days: an interstate one in the same dates is watched here, not gone to
      var a = tp.isoDay(t.from), z = tp.isoDay(t.to), msN = ms.filter(function (m) { return !m.f.a; }), inD = msN.filter(function (m) { return m.day >= a && m.day <= z; }).length;
      if (msN.length && inD !== msN.length) when += ', ' + inD + ' of your NSW ' + (msN.length === 1 ? 'match' : 'matches') + ' in your days';
    }
    if (when) facts.push('<li>' + esc(when) + '</li>');
    // A trip that clashes is said here too, with the way to fix it, not only in the open timeline
    var cls = tp.clashes(), clash = state.added.filter(function (it) { return cls[it.id]; }).map(function (it) {
      return '<p class="tp-plan-clash">' + esc(it.title) + ' (' + esc(it.when || it.day) + '): ' + 'clashes with ' + esc(tp.list(cls[it.id].map(function (c) { return c.name + ', ' + c.day; }))) + '</p>';
    }).join('');
    // Saved from the map before their days were set: a group of its own until a free day takes them
    var wait = tp.unplaced(), waitH = wait.length ? '<div class="tp-plan-wait"><h4 class="tp-plan-wait-h">Saved, not placed yet</h4><ul>' + wait.map(function (it) { return '<li>' + esc(it.title) + (it.place ? '<span>, ' + esc(it.place) + '</span>' : '') + '</li>'; }).join('') + '</ul><p class="tp-plan-wait-n">' + (stay() ? 'No free day fits ' + (wait.length === 1 ? 'this' : 'these') + ' yet: your free days are full, or ' + (wait.length === 1 ? 'it is' : 'they are') + ' closed on them. Change your days, or remove ' + (wait.length === 1 ? 'it' : 'them') + ' in your timeline.' : 'Each goes into a free day once you set your days.') + '</p></div>' : '';
    planBody.innerHTML = '<ul class="tp-plan-facts">' + facts.join('') + '</ul>' + waitH + (clash ? clash + '<p class="tp-plan-clash-how">Open your timeline to move or remove it.</p>' : '') +
      '<div class="tp-plan-acts"><button type="button" class="tp-plan-btn tp-plan-btn--primary" data-plan="open">Open your timeline</button>' +
      '<button type="button" class="tp-plan-btn" data-plan="copy">' + (copied ? 'Copied' : 'Copy plan') + '</button></div>' +
      '<p class="tp-plan-note">Copies as plain text for your notes or a message. Nothing leaves this device unless you paste it.</p>';
  }
  if (planBody) planBody.addEventListener('click', function (e) {
    var b = e.target.closest('[data-plan]'); if (!b) return;
    if (b.dataset.plan === 'open') { tp.openTimeline(); return; }
    if (b.dataset.plan === 'teams') { if (tp.openTeams) tp.openTeams(b); return; }
    var text = planText();
    function done() {
      copied = true; render(true, '[data-plan="copy"]');
      tp.say('Plan copied. Paste it into your notes or a message.');
      setTimeout(function () { copied = false; render(true); }, 2400);
    }
    function fallback() {
      // Copying is blocked: show the text selected, to copy by hand
      // One fallback box at most: pressed again, the same box is filled and selected again
      if (!planBody.querySelector('.tp-plan-fallback')) planBody.insertAdjacentHTML('beforeend', '<label class="tp-plan-fallback"><span>Copying is blocked here. The text is selected: copy it with your device\u2019s Copy.</span><textarea readonly rows="6"></textarea></label>');
      var ta = planBody.querySelector('textarea'); ta.value = text; ta.focus(); ta.select();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  });

  /* ---------- Save & share: a second sheet stacked over the open timeline ----------
     The options come from the Share/edit itinerary prototype's sheet; what they keep or send is this plan. */
  var ssBtn = document.getElementById('tp-tl-share'), ss = document.getElementById('tp-ss');
  var KIND = { screening: 'Screening', place: 'Place', product: 'Thing to do', poi: 'Place' };
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
      if (it.unplaced) { rows.push({ at: 999, date: 'Not placed yet', time: '', what: it.title, kind: KIND[it.kind] || 'Place', where: it.place || '', place: it.place || '', note: 'Saved from the map' }); return; }
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
  function fileName(ext) { var t = trip(); return 'rwc-2027-plan' + (t && t.from ? '-' + t.from + '-to-' + t.to : '') + '.' + ext; }
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
    // Focus in the timeline's ideas stays there (the page has the same buttons): where it was, by position
    var scopeEl = active && active.closest ? active.closest('#tp-tl-ideas, #tp-map') : null, inIdeas = !!scopeEl;
    var ideasAt = inIdeas ? Array.prototype.indexOf.call(scopeEl.querySelectorAll('.tp-add'), active) : -1;
    if (active && phone.contains(active) && active.dataset) {
      if (active.dataset.item) keep = '.tp-add[data-item="' + CSS.escape(active.dataset.item) + '"]';
      else if (active.dataset.pmAdd) keep = '[data-pm-add="' + CSS.escape(active.dataset.pmAdd) + '"]';
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
    renderDaysLine();
    renderPlan();
    renderTlIdeas();
    if (tp.mapRender) tp.mapRender();
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
    // In the timeline's ideas the same buttons exist on the page too: look in the ideas first, so focus never jumps
    var f = (focusSel && phone.querySelector(focusSel)) || (keep && (inIdeas ? scopeEl.querySelector(keep) : phone.querySelector(keep)));
    // The idea just added leaves the list: focus goes to the idea now in its place, else the list's heading
    if (!f && inIdeas && !scopeEl.hidden) { var adds = scopeEl.querySelectorAll('.tp-add'); f = (ideasAt > -1 && (adds[ideasAt] || adds[adds.length - 1])) || scopeEl.querySelector('.tp-tl-ideas-next, .tp-map-card-h') || scopeEl.querySelector('.tp-tl-ideas-h'); }
    if (f && f !== document.activeElement) f.focus({ preventScroll: true });
    notesRefresh();
  }
  phone.addEventListener('tp:state', function () { render(false); });
  // Reset prototype (a reviewer tool): this section's own choices go back to a first visit too
  var resetBtn = document.getElementById('tp-reset');
  if (resetBtn) resetBtn.addEventListener('click', function () { closePm(); refineOpen = false; placeQ = ''; openSet = null; blkSig = ''; moreBlk = {}; moveOpen = null; watchAll = false; openCard = null; askEditing = false; askDraft = null; askManual = false; askError = ''; seen = {}; whys = {}; render(true); });
  render(true);
})();
