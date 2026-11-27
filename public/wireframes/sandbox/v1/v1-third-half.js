/* Concepts: Where to watch, Suits your 3rd half and the one question (prototype-pick-your-team.html).
   Experience principles (CLAUDE.md): reward early, then build on it; don't make people do the work.
   - Both result sections show straight away for the person's matches (picked teams, ticket marks, every NSW match for
     Here for the rugby). Nothing waits for dates. With no team picked they are a first look only: the next NSW match
     day (in their days in NSW once they have said so), not every match at once; the empty Your plan so far offers Pick your teams (the team list in a sheet).
   - Your days (optional), on the page under the team picker once there is something to plan around; nothing is
     guessed, with two quick picks. Refine your plan (folded): where they are staying and who is coming, which choose and
     order the ideas (a local: nearest first, no dates needed). Each answer refines the results in
     place, says what changed under the answer, and tints each section that changed as it comes into view. It is saved
     with the picks (tp-pick-v1), shown and editable in the open plan.
   Data: real places, with indicative hours, prices and screenings (not confirmed). Where to watch uses placeholder venues from window.cnWatchVenues (no real business named); products from
   window.cnThirdHalf, shaped like the product data contract (availability, pricing and distance_to_venue are gap, so
   pink). No venue or product is favoured: spots go by type then name, products by distance then name. Links go out
   only; nothing is booked here. State and the plan live in concepts-teams.js (window.tpPicker). */
(function () {
  'use strict';
  var TBC = (window.TP_WORDS || {}).timeTbc || 'Time to be confirmed', TBC_L = TBC.charAt(0).toLowerCase() + TBC.slice(1); // A2 (21 Nov): concepts-words.js
  var WHY = (window.TP_WORDS || {}).setDaysWhy || 'Set dates and the ideas below fit around your matches.'; // B2 (21 Nov)
  // Option B (?flow=a, 23 Nov): Your days shows under the hand before any team is picked, worded for no team
  var FLOW_B = document.documentElement.getAttribute('data-flow') === 'a';
  // Option C (?flow=c, 23 Nov): the questions are asked up front, one step at a time (concepts-flow-c.js). While a step
  // shows, Your days and Where you're staying are borrowed into it: fc() says which step, and toasts stay away, as the
  // sections they would point to are hidden until the flow is finished
  function fc() { return window.tpFlowC ? window.tpFlowC.step() : ''; }
  // Finished (24 Nov): Your days and Where you're staying sit open in the Your answers card, slider and all
  function fcCard() { return !!(window.tpFlowC && window.tpFlowC.inCard && window.tpFlowC.inCard()); }
  // The Your answers level in the open plan names each change on its Save bar, so no toast as well (check 11)
  function fcLevel() { return !!(window.tpFlowC && window.tpFlowC.inLevel && window.tpFlowC.inLevel()); }
  var WHY_NONE = (window.TP_WORDS || {}).setDaysWhyNoTeam || 'Set your days to see ideas for your time in NSW.';
  var PLAY = (window.TP_WORDS || {}).dropGoal || 'Drop goal', IMG = (window.TP_WORDS || {}).imageOf || function (x) { return 'Placeholder image of ' + x; }; // A2 follow-up (21 Nov)
  var GM = (window.TP_WORDS || {}).groupMatches || 'pool matches', GM1 = (window.TP_WORDS || {}).groupMatch || 'pool match', LR = (window.TP_WORDS || {}).laterRounds || 'the knockouts', LR_C = LR.charAt(0).toUpperCase() + LR.slice(1); // A2 (21 Nov): visitor-facing stage names
  var tp = window.tpPicker, FIX = window.cnFixtures;
  if (!tp || !Array.isArray(FIX)) return;
  // Where to watch: placeholder venues (clearly marked) until real ones are supplied; see cnWatchVenues in concepts-fixtures.js
  var SPOTS = Array.isArray(window.cnWatchVenues) ? window.cnWatchVenues : [];
  var PRODUCTS = Array.isArray(window.cnThirdHalf) ? window.cnThirdHalf : [];
  var phone = document.getElementById('tp-phone'), body = tp.body, reduce = tp.reduce, esc = tp.esc, side = tp.side;
  var watchList = document.getElementById('tp-watch-list');
  var thirdList = document.getElementById('tp-third-list'), thirdNote = document.getElementById('tp-third-note');
  var watchNote = document.getElementById('tp-watch-note'), watchNoteText = watchNote ? watchNote.textContent : '';
  var ask = document.getElementById('tp-ask'), tripEl = document.getElementById('tp-third-trip');
  if (!watchList || !thirdList || !ask) return;

  // The suburb or venue a watch venue shows under (26 Nov 2026): never a region label such as North Shore. From v1-fanspots.js (sample)
  function spPlace(sp) { var f = window.v1FanByName && window.v1FanByName(sp.name); return f ? f.suburb : sp.place; }
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
  // A later-rounds match has no teams yet: it is shown by its stage ("Quarter-final 1"), even where the data holds a
  // placeholder pairing (2nd Pool C v 2nd Pool F). 26 Nov 2026.
  function isKo(f) { return !/^Pool /.test(f.s || ''); }
  function koName(f) { return String(f.s || '').replace(/ \((\d)\)$/, ', match $1'); }
  function matchName(f) { return isKo(f) ? koName(f) : (f.t || f.s); }
  function trip() { return state.trip; }
  function stay() { var t = trip(); return t && t.from && t.to ? { a: tp.isoDay(t.from), z: tp.isoDay(t.to) } : null; }
  /* Where you are staying (optional, under Refine your plan). Quick answers, then NSW places to search; each place goes
     with the host city it is nearest (null: far enough from both that neither is assumed). Outside NSW is one answer. */
  var PLACES = [['Sydney CBD', 'sydney'], ['Bondi', 'sydney'], ['Newcastle', 'newcastle'], ['Moore Park', 'sydney'], ['Blacktown', 'sydney'], ['Bondi Junction', 'sydney'], ['Campbelltown', 'sydney'], ['Chatswood', 'sydney'], ['Coogee', 'sydney'], ['Cronulla', 'sydney'],
    ['Darling Harbour', 'sydney'], ['Hornsby', 'sydney'], ['Liverpool', 'sydney'], ['Manly', 'sydney'], ['Newtown', 'sydney'], ['North Sydney', 'sydney'], ['Parramatta', 'sydney'], ['Penrith', 'sydney'], ['Randwick', 'sydney'],
    ['Surry Hills', 'sydney'], ['Sydney Olympic Park', 'sydney'], ['The Rocks', 'sydney'], ['Katoomba', 'sydney'], ['Leura', 'sydney'], ['Gosford', 'sydney'], ['Terrigal', 'sydney'], ['Wollongong', 'sydney'], ['Kiama', 'sydney'],
    ['Merewether', 'newcastle'], ['Maitland', 'newcastle'], ['Cessnock', 'newcastle'], ['Pokolbin', 'newcastle'], ['Lake Macquarie', 'newcastle'], ['Nelson Bay', 'newcastle'], ['Port Stephens', 'newcastle'],
    ['Albury', null], ['Bathurst', null], ['Byron Bay', null], ['Coffs Harbour', null], ['Dubbo', null], ['Jervis Bay', null], ['Orange', null], ['Port Macquarie', null], ['Tamworth', null], ['Wagga Wagga', null]]
    .map(function (x) { return { n: x[0], c: x[1] }; });
  function baseOf() { var t = trip(); return t && t.base || null; }
  function basePlace() { var b = baseOf(); return b && b !== 'local' && b !== 'outside' ? b : null; }
  function cityOfPlace(n) { var p = n && PLACES.filter(function (x) { return x.n === n; })[0]; return p ? p.c : null; }
  function baseCity() { return cityOfPlace(basePlace()); }
  /* A second place (27 Nov 2026): up to two in total, no nights asked. A stadium or fan zone measures from whichever place is
     nearer; spare-time ideas and another match measure from the first (basePlace). */
  function placesOf() { var t = trip() || {}; return [t.base, t.base2].filter(function (n) { return n && n !== 'local' && n !== 'outside'; }); }
  function kmBetween(a, b) {
    var r = Math.PI / 180, dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 12742 * Math.asin(Math.sqrt(x));
  }
  function nearerPlace(ll) {
    var g = window.cnGeo, ps = placesOf().filter(function (n) { return g && g.places[n]; });
    if (!ps.length) return null; if (!ll || ps.length < 2) return ps[0];
    return ps.sort(function (x, y) { return kmBetween(g.places[x], ll) - kmBetween(g.places[y], ll); })[0];
  }
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
  // The places a half day (arrival or last day) offers, the same wherever they show (Follow day by day, the map's
  // cards): nearest to where they are staying once that is known, otherwise a rotating order so no business is
  // favoured; three of them, or what is in it once the half day is full
  function halfPicks(b) {
    var d = b.day, wd = weekdayOf(d), dl = dayLabel(d), l = halfList(b, wd);
    if (dayFilled(d)) return l.filter(function (p) { return added('p:' + p.id + ':' + dl); });
    return basePlace() ? l.slice(0, 3) : l.sort(function (x, y) { return hash(x.id + ':' + d) - hash(y.id + ':' + d); }).slice(0, 3);
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
      '<span aria-hidden="true">' + addLabel(on, on ? 'Added' : 'Add') + '</span><span class="visually-hidden">' + (on ? 'Added: ' : 'Add ') + esc(label) + (on ? '. Press to remove' : ' to your plan') + '</span></button>';
  }
  // Items the add buttons put on the plan, by id, rebuilt on each render; and what each one's page shows
  var ITEMS = {}, MODAL = {};

  /* ---------- First look: no team picked yet ----------
     Without a pick there is nothing to tailor to, so both sections show one day only (the next NSW match day, in the
     person's days in NSW once given) instead of every match at once; Your plan so far, below, is the way on (Pick your teams opens the team list). */
  function teaser() { return !tp.own(); }
  function teaserDay() { var d = nswDays()[0]; return d ? d.m.f.d : null; }
  // (Pick your teams to tailor this is gone: Your plan so far, just below, opens the team list in a sheet; 16 Nov)

  /* ---------- Where to watch ---------- */
  function spotsFor(m) {
    return SPOTS.filter(function (sp) { return Array.isArray(sp.shows) && sp.shows.indexOf(m.key) > -1; })
      .sort(function (a, b) { return (SPOT_ORDER[a.type] - SPOT_ORDER[b.type]) || a.name.localeCompare(b.name); });
  }
  /* Who gets screenings (27 Nov 2026): we assume the person is at their team's NSW matches inside their days, so no pubs or
     clubs are offered for those. Screenings are for the team's matches inside their days that are played interstate, and for
     a match they have removed (they are not going after all). watchMatches() is that list, in day order. */
  function removedMatch(m) { return !!m.f.t && pickedHas(m.f) && tp.matchTaken(m.key); }
  function watchMatches() {
    var a = tp.userMatches().filter(function (m) { return m.f.a && m.f.t && inStay(m.day); });
    var b = tp.allMatches().filter(function (m) { return removedMatch(m) && inStay(m.day); });
    return a.concat(b.filter(function (m) { return a.indexOf(m) < 0; })).sort(function (x, y) { return x.day - y.day || (x.key < y.key ? -1 : 1); });
  }
  tp.watchMatches = watchMatches;
  /* The nearest fan zone to a stadium, for a match the person is at (27 Nov 2026): somewhere to go before and after. The
     fan zones and villages are sample data (v1-fanspots.js), so the line says Sample. Nearest by straight line. */
  function fanSpots() { return (window.v1FanSpots || []).filter(function (x) { return x.kind === 'fan_zone' || x.kind === 'fan_village'; }); }
  function nearestFan(ll) {
    var g = fanSpots(); if (!g.length) return null; if (!ll) return g[0];
    return g.slice().sort(function (x, y) { return kmBetween(x.ll, ll) - kmBetween(y.ll, ll); })[0];
  }
  var SAMPLE_TAG = '<span class="v1-sample provenance-gap">Sample</span>';
  function fanNearHtml(f) {
    var ll = window.cnGeo && window.cnGeo.venues[f.v], sp = nearestFan(ll); if (!sp || f.a) return '';
    var km = ll ? kmBetween(sp.ll, ll) : null;
    return '<p class="v1-fan-near"><span class="v1-fan-k">Before and after</span> ' + esc(sp.name) + ', ' + esc(sp.suburb) + (sp.addr ? ' \u00b7 ' + esc(sp.addr) : '') +
      (km !== null ? ' \u00b7 about ' + Math.max(1, Math.round(km)) + ' km from ' + esc(f.v) : '') + ' ' + SAMPLE_TAG + '</p>';
  }
  tp.fanNear = fanNearHtml;
  /* Later rounds inside their days (27 Nov 2026): an NSW match with no teams yet is not assumed to be one they go to. The
     day reads "[stage] is on, teams to be decided" with Add; once added it is one of their matches and a match day. */
  function koItem(m) {
    var f = m.f, id = 'm:' + m.key;
    ITEMS[id] = { id: id, kind: 'match', key: m.key, title: matchName(f), kindLabel: 'Match', day: f.d, place: f.v + ', ' + f.p };
    return id;
  }
  function koAddHtml(m) { return addBtn(koItem(m), matchName(m.f) + ', ' + m.f.d); }
  function koOnDays() {
    var r = dRange(); if (!r) return [];
    var mine = {}; tp.userMatches().forEach(function (m) { mine[m.key] = true; });
    return tp.allMatches().filter(function (m) { return !m.f.a && isKo(m.f) && m.day >= r.a && m.day <= r.z && !mine[m.key]; });
  }
  tp.koOnDays = koOnDays; tp.koAddHtml = koAddHtml; tp.koName = function (f) { return koName(f); };
  /* A team with no NSW match inside their days (27 Nov 2026), on its card in Your matches. Playing interstate inside the days:
     a watch block with the nearest fan zone to where they stay (sample address), the way from their stay (approximate: the
     nearer of their places, a straight-line guess) and each of those matches with Add. No match at all: one line. */
  function fanRouteHtml(sp) {
    var from = nearerPlace(sp.ll), g = window.cnGeo; if (!from || !g || !g.places[from]) return '';
    var km = kmBetween(g.places[from], sp.ll), walk = km <= 1.5, mins = walk ? Math.max(3, Math.round(km * 13)) : Math.round(10 + km * 3);
    return 'From ' + esc(from) + ': ' + (km < 1 ? 'under 1 km' : 'about ' + Math.round(km) + ' km') + ', ' + (walk ? 'a ' + mins + ' minute walk' : 'about ' + mins + ' minutes by train or bus') + ' (approximate)';
  }
  tp.noNswBlock = function (team, away) {
    if (!away.length) return '<p class="v1-nonsw-none">' + esc(team) + ' have no match inside your days. See Also on in NSW below for matches on while you\u2019re here.</p>';
    var g = window.cnGeo, first = basePlace(), sp = nearestFan((first && g && g.places[first]) || (g && g.places['Sydney CBD'])); if (!sp) return '';
    var route = fanRouteHtml(sp);
    return '<div class="v1-nonsw"><p class="v1-nonsw-h">' + esc(team) + ' play interstate while you\u2019re here. Watch with other fans at <b>' + esc(sp.name) + '</b>.</p>' +
      '<p class="v1-fan-near">' + esc(sp.suburb) + (sp.addr ? ' \u00b7 ' + esc(sp.addr) : '') + ' ' + SAMPLE_TAG + '</p>' + (route ? '<p class="v1-fan-near">' + route + ' ' + SAMPLE_TAG + '</p>' : '') +
      '<ul class="v1-nonsw-l">' + away.map(function (m) {
        var f = m.f; return '<li><span class="v1-nonsw-m">' + esc(matchName(f)) + '<span>' + esc(f.d + ', ' + (f.k || TBC_L) + ' \u00b7 ' + f.a) + '</span></span>' + koAddHtml(m) + '</li>';
      }).join('') + '</ul></div>';
  };
  function koBody(b) {
    var m = b.ms[0], f = m.f;
    return '<p class="tp-blk-note">' + esc(koName(f)) + ' is on at ' + esc(f.v) + ', ' + esc(f.p) + ', ' + esc(f.k || TBC_L) + '. Teams to be decided, so we haven\u2019t assumed you\u2019re going.</p>' +
      '<div class="v1-ko-add">' + koAddHtml(m) + '</div>';
  }
  // A screening (or the village) for one match: registered so Add and its page work, wherever it is listed
  function spotItem(sp, m) {
    var id = 'w:' + SPOTS.indexOf(sp) + ':' + m.key;
    var open = sp.open_from && sp.open_to ? 'Open daily, ' + tp.isoRange(sp.open_from, sp.open_to) : '';
    ITEMS[id] = { id: id, kind: sp.type === 'village' ? 'place' : 'screening', title: sp.name, kindLabel: SPOT_TYPE[sp.type] || 'Screening', place: spPlace(sp), note: open, day: m.f.d, matchName: matchName(m.f) };
    MODAL[id] = { type: 'spot', sp: sp, m: m };
    return id;
  }
  /* Going? Each screening card points to the one place a ticket is marked, the match card's I have a ticket (the
     Yes / No pair here was a second way to answer; replaced 15 Nov). Once marked, that match's screenings give way to
     one card for getting there and back. Its match's name opens the match sheet, where I have a ticket undoes it (21 Nov). */
  function notGoing(m) { return (state.notGoing || []).indexOf(m.key) > -1; }
  // One line, not a second way to answer: the ticket is marked in one place, the match card's I have a ticket
  // (agreed 15 Nov). The link goes there; once marked, the card turns into getting there and back.
  // One line per card, not one per match (a card with four matches said it four times in a row): the match is named
  // when there is one; with several it asks once and the link goes to the first one's ticket box
  function goingQ(ms) { return ''; } // 26 Nov 2026: no tickets are asked for, so no Going? line
  /* A match they have a ticket to (19 Nov, from the critique): not a card but one line above the carousel, so it is
     the first thing seen here. Getting there lives in one place, the match day in Around your matches, which See your
     match day opens (check 8: the label names where it goes). An interstate one says where they will be that day and
     links to the plan, where it is a day away (Around your matches covers NSW days only). */
  function atLine(m) {
    // The match's name opens its sheet, where I have a ticket undoes it (21 Nov: Not going after all? removed, as it
    // read as cancelling; the ticket's one control is I have tickets, on the row and in the match sheet)
    var f = m.f, nm = '<button type="button" class="tp-link tp-ws-at-m" data-open="match:' + esc(m.key) + '" aria-haspopup="dialog">' + esc(matchName(f)) + '</button>';
    var what = f.a ? 'You\u2019re in ' + esc(f.a) + ' for ' + nm + ', ' + esc(f.d) : 'You\u2019re at ' + nm + ', ' + esc(f.d);
    return '<li class="tp-ws-at-i" data-key="' + esc(m.key) + '" tabindex="-1">' + window.tpIcons.ticket +
      '<span class="tp-ws-at-t"><span class="tp-ws-at-what">' + what + '</span> ' +
      '<span class="tp-ws-at-acts">' + (f.a ? '<button type="button" class="tp-link" data-at-plan>See it on your plan</button>' : '<button type="button" class="tp-link" data-at-day="' + m.day + '">See your match day</button>') +
      '</span></span></li>';
  }
  // Where a toast's See Where to watch lands: the line for a ticket just marked, or the card for one just removed,
  // scrolled into the carousel, with focus on it
  function watchShow(key) {
    var at = watchList.querySelector('.tp-ws-at-i[data-key="' + CSS.escape(key) + '"]');
    if (at) { at.focus({ preventScroll: true }); return; }
    var car = watchList.querySelector('.tp-wcs'), card = watchList.querySelector('.tp-wm[data-key="' + CSS.escape(key) + '"]');
    if (!card) { var any = [].slice.call(watchList.querySelectorAll('.tp-wm')).filter(function (c) { return c.querySelector('[data-going-mark="' + CSS.escape(key) + '"]'); })[0]; card = any || null; }
    if (!card) return;
    if (car && car.classList.contains('tp-wcs--car')) car.scrollTo({ left: card.offsetLeft - car.offsetLeft - parseFloat(getComputedStyle(car).paddingLeft || 0), behavior: reduce.matches ? 'auto' : 'smooth' });
    var f = card.querySelector('.tp-wv-t, button'); if (f) f.focus({ preventScroll: true });
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
  function kickLine(m) { var n = teamOf(m); return n + (m.f.k ? ' plays at ' + m.f.k.replace(':00', '') : ' plays (' + TBC_L + ')'); } // 8pm, not 8:00pm
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
      ITEMS[id] = { id: id, kind: 'screening', title: c.sp.name, kindLabel: SPOT_TYPE[c.sp.type] || 'Screening', place: spPlace(c.sp), note: '', day: m0.f.d, matchName: showing.map(function (m) { return matchName(m.f); }).join(' and ') };
      MODAL[id] = { type: 'spot', sp: c.sp, m: m0 };
      var what = two ? (c.all ? (ms.length > 2 ? 'Shows all ' + ms.length : 'Shows both') : 'Shows ' + matchName(m0.f) + ' only') : '';
      return venueRow(id, c.sp.name, esc(SPOT_TYPE[c.sp.type] || 'Screening') + ' · ' + esc(spPlace(c.sp)) + (what ? ' · <strong>' + esc(what) + '</strong>' : ''),
        addBtn(id, c.sp.name + ', ' + ITEMS[id].matchName + ' on ' + m0.f.d));
    }).join('') + '</ul>';
  }
  function matchLine(m) {
    var f = m.f, who = f.t ? f.t.split(' v ').map(side).join(' <span class="tp-all-v">v</span> ') : esc(f.s);
    var tag = f.a ? '<span class="tp-tag tp-tag--away">Interstate: ' + esc(f.a) + '</span>' : '<span class="tp-tag">In NSW</span>';
    return '<div class="tp-wc-m"><p class="tp-wc-when">' + esc(f.d) + ', ' + esc(f.k || TBC_L) + ' ' + tag + '</p><p class="tp-wc-teams">' + who + '</p></div>';
  }
  function renderWatch() {
    VEN = {}; VUSED = {};
    // Every match of every picked team, interstate included, in their days once set; one with a ticket shows getting
    // there and back instead of screenings
    var ms = watchMatches();
    var s = stay(), h = '', first = false;
    // Nothing to list (the person is at all their matches in NSW, or has no team): the section is not shown
    var watchSec = document.getElementById('tp-watch'); if (watchSec) watchSec.hidden = !ms.length;
    if (!ms.length) { watchList.innerHTML = ''; return; }
    var going = ms.filter(hasTicket), left = ms.length - going.length;
    if (watchNote) watchNote.textContent = first && ms.length ? 'A first look: screenings on ' + ms[0].f.d + ', the next NSW match day.'
      : going.length && !left ? 'You have tickets to all your matches. Screenings show here for any you\u2019re not at.'
      : 'Your matches played interstate' + (ms.some(removedMatch) ? ', and any you’re not going to after all, ' : ' ') + 'at fan zones, pubs and clubs in NSW. Venues are examples.';
    var evs = evenings(ms), cards = [];
    evs.forEach(function (ev) {
      var watch = ev.filter(function (m) { return !hasTicket(m); });
      if (!watch.length) return;
      var two = watch.length > 1, k = evKey(watch);
      cards.push('<li class="tp-wm tp-wc' + (two ? ' is-clash' : '') + '" data-key="' + esc(watch[0].key) + '">' +
        (two ? '<p class="tp-wc-clash">' + manyLine(watch) + '</p>' : '') +
        watch.map(matchLine).join('') +
        (two ? '<p class="tp-wc-sub">Venues showing ' + (watch.length > 2 ? 'all of them' : 'both') + ' first</p>' : '') +
        venueRows(watch, k) + goingQ(watch) + '</li>');
    });
    // More than one match day: a carousel, one card at a time with the next peeking in, the same as the team cards
    // (agreed 16 Nov); every card is in it, so there is no Show more
    var car = cards.length > 1, sx = car && watchList.querySelector('.tp-wcs') ? watchList.querySelector('.tp-wcs').scrollLeft : 0;
    if (going.length) h += '<ul class="tp-ws-at" aria-label="Matches you have tickets to">' + going.map(atLine).join('') + '</ul>';
    if (cards.length) h += '<ul class="tp-wcs' + (car ? ' tp-wcs--car' : '') + '" aria-label="Where to watch, by match day' + (car ? ', ' + cards.length + ' cards, scroll sideways' : '') + '">' + cards.join('') + '</ul>' +
      (car ? '<p class="tp-deck-hint tp-wcs-hint">' + cards.length + ' match days. Swipe for the others.</p>' : '');
    watchList.innerHTML = h;
    // The swipe hint only while there is more to the side (on a desktop two match days fit side by side)
    var wCar = watchList.querySelector('.tp-wcs--car'), wHint = watchList.querySelector('.tp-wcs-hint');
    if (wCar && wHint) requestAnimationFrame(function () { wHint.hidden = wCar.scrollWidth <= wCar.clientWidth + 2; });
    if (sx) watchList.querySelector('.tp-wcs').scrollLeft = sx; // a change on one card keeps the carousel where it was
  }

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
  // Around your matches, or Around the NSW matches before a team is picked (or a match added); the same name in its
  // heading, a product sheet's label and the toasts that name it
  function thirdName() { return tp.own() ? 'Around your matches' : 'Around the NSW matches'; }
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
    function close() { if (st) { out.push(st); st = null; } }
    var ko0 = {}; koOnDays().forEach(function (m) { (ko0[m.day] = ko0[m.day] || []).push(m); });
    for (var d = a; d <= z; d++) {
      var dm = by[d] || [], home = dm.filter(function (m) { return !m.f.a; }), away = dm.filter(function (m) { return m.f.a && hasTicket(m); });
      if (home.length) { close(); out.push({ kind: 'match', key: 'm' + d, day: d, ms: home }); continue; }
      if (away.length) { close(); out.push({ kind: 'away', key: 'a' + d, day: d, m: away[0] }); continue; }
      // A free day with one of their matches on (interstate, no ticket): its own card, where to watch it in NSW
      var tv = dm.filter(function (m) { return m.f.a && m.f.t && !hasTicket(m) && M.ms.indexOf(m) > -1; });
      if (tv.length) { close(); out.push({ kind: 'watch', key: 'w' + d, day: d, ms: tv }); continue; }
      // A later-round NSW match on the day (teams to be decided): not a free day, and not assumed (27 Nov 2026)
      var ko = ko0[d]; if (ko) { close(); out.push({ kind: 'ko', key: 'k' + d, day: d, ms: ko }); continue; }
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
  function productCard(p, why, id, f, tag) {
    return '<article class="tp-pc" data-id="' + esc(id) + '">' +
      '<button type="button" class="tp-pc-main" data-open="' + esc(id) + '" aria-haspopup="dialog">' +
      '<span class="ph-img tp-pc-img"' + imgKey(p.title) + ' aria-hidden="true"></span><span class="tp-pc-body"><span class="tp-pc-title">' + esc(p.title) + '</span>' +
      '<span class="tp-pc-type provenance-gap">' + esc(tag || PTYPE[p.type] || 'Product') + '</span>' +
      '<span class="tp-pc-why provenance-gap" data-why="' + esc(why) + '">' + esc(why) + '</span></span></button>' +
      addBtn(id, p.title + ' on ' + f.d) + '</article>';
  }
  // The Not going to the match? group (up to three evening places on each match day) was removed on 26 Nov 2026, from Around
  // your matches and the plan's day card. EVE_I and EVE_M stay, empty, for the lines that read them.
  var EVE_I = {}, EVE_M = {};
  /* Getting there and back on a match day (PLACEHOLDER transport details, proposed contract field
     getting_there.event_day, gap). One line at the top of the day, from where they are staying (the venue's default
     start, such as Central, until they say), then a button to a sheet with the schematic route and all the details. */
  var TRAVEL = window.cnMatchTravel || null;
  var TRAIN_ICO = '<svg class="tp-ico tp-go-ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3.5" y="1.5" width="9" height="10" rx="2.5"/><path d="M3.5 7.5h9M6 14.5l1-3M10 14.5l-1-3"/><circle cx="6" cy="9.5" r=".6"/><circle cx="10" cy="9.5" r=".6"/></svg>';
  var LEG = { walk: 'Walk', train: 'Train', event: 'Event shuttle' };
  /* Staying in the stadium's own precinct (Around Olympic Park for Stadium Australia, Around Moore Park for the Sydney
     Football Stadium, 26 Nov 2026) is a walk to the gates, not a train: the placeholder route works out a train for any
     place that is not the default start, so for these two the route is the walk alone */
  var OWN_PRECINCT = { 'Stadium Australia': 'Sydney Olympic Park', 'Sydney Football Stadium': 'Moore Park' };
  tp.nearerPlace = function (venue) { return nearerPlace(window.cnGeo && window.cnGeo.venues[venue]); };
  function goRoute(f) {
    var from = f.a ? null : nearerPlace(window.cnGeo && window.cnGeo.venues[f.v]) || null;
    var r = TRAVEL && !f.a ? TRAVEL.route(f.v, from, cityOfPlace(from) || baseCity()) : null;
    if (r && OWN_PRECINCT[f.v] && OWN_PRECINCT[f.v] === from) {
      var w = TRAVEL.venues[f.v].walk_mins;
      r = Object.assign({}, r, { from: from, fromDefault: false, mode: 'Walk', legs: [{ mode: 'walk', to: f.v, mins: w, gates: true }], mins: w, cross: false, far: false });
    }
    return r;
  }
  function ampm(t) { t = ((t % 1440) + 1440) % 1440; var hh = Math.floor(t / 60), mm = t % 60; return ((hh % 12) || 12) + (mm ? ':' + (mm < 10 ? '0' : '') + mm : '') + (hh < 12 ? 'am' : 'pm'); }
  function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function goLine(r) { return r.mode + ' from ' + r.from + ', ' + (r.mins ? 'about ' + mins(r.mins) : TBC_L) + ' · ' + lower(r.event_day.extra_services); }
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
    return '<p class="tp-go-one">' + TRAIN_ICO + '<span><span class="provenance-gap">' + esc(r.mode + ' from ' + r.from + ', ' + (r.mins ? 'about ' + mins(r.mins) : TBC_L)) + '</span> \u00b7 ' +
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
      h += '<li class="tp-go-leg is-' + l.mode + '"><span class="tp-go-seg" aria-hidden="true"></span><span class="tp-go-leg-t provenance-gap">' + esc(l.mode === 'train' && r.far ? 'Regional coach' : l.mode === 'train' && l.intercity ? 'Intercity train' : LEG[l.mode]) + '' + ', ' + (l.mins ? 'about ' + mins(l.mins) : TBC_L) + '</span></li>';
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
    h += '<p class="cn-pp-venue">' + esc(matchName(f)) + ', ' + esc(f.k || TBC_L) + ', ' + esc(f.v) + '</p>';
    h += '<p class="tp-go-ph" role="note">Placeholder transport details. Real routes, times and services to come.</p>';
    h += goMap(r);
    h += '<h3 class="cn-pp-h">Getting there</h3><dl class="pl-option-facts cn-pp-facts">' +
      '<div><dt>From</dt><dd>' + esc(r.from) + (r.fromDefault && !baseOf() ? ' · <button type="button" class="tp-link" data-go-stay>Add where you’re staying</button>' : '') + '</dd></div>' +
      '<div><dt>Journey</dt><dd><span class="provenance-gap">' + esc(r.mode) + ', ' + (r.mins ? 'about ' + mins(r.mins) : TBC_L) + '</span></dd></div>' +
      (leave ? '<div><dt>Leave by</dt><dd><span class="provenance-gap">About ' + leave + ', to be at the gates 45 min before kick-off</span></dd></div>' : '') +
      '<div><dt>Your ticket</dt><dd><span class="provenance-gap">Whether match tickets include public transport is to be confirmed</span></dd></div></dl>';
    h += '<h3 class="cn-pp-h">Getting back</h3><dl class="pl-option-facts cn-pp-facts">' +
      (ft !== null ? '<div><dt>Full time</dt><dd><span class="provenance-gap">About ' + ampm(ft) + '</span></dd></div>' : '') +
      '<div><dt>Services</dt><dd><span class="provenance-gap">' + esc(e.extra_services) + '. ' + esc(e.return_note) + '</span></dd></div>' +
      '<div><dt>Last service</dt><dd><span class="provenance-gap">' + esc(e.last_service || TBC) + '</span></dd></div>' +
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
    if (b.ms.length > 1) h += '<p class="tp-blk-note">Also in NSW that day: ' + b.ms.filter(function (x) { return x !== m; }).map(function (x) { return esc(matchName(x.f)) + ', ' + esc(x.f.k || TBC_L) + ', ' + esc(x.f.v); }).join('; ') + '.</p>';
    h += fanNearHtml(f);
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
  /* Where a trip can go now: every valid start in every free stretch it suits, for Move in the plan's detail (a
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
  // A real destination (§19) says how far it is in the page's own words, or that it is still to be confirmed
  var GET_TBC = (window.TP_WORDS || {}).gettingTbc || 'Getting there to be confirmed';
  function howLine(i) {
    if (i.dest) return i.dest.travel || GET_TBC;
    if (i.car) return 'Car only, ' + mins(i.how.mins) + ' from ' + i.how.from + ' (no public transport)';
    return i.how.mode + ' from ' + i.how.from + ' · ' + (i.how.mins ? mins(i.how.mins) + ' by public transport' : TBC_L);
  }
  // In the plan's ideas sheet (open) the card's main part is a button that shows the idea's details in the sheet
  function ideaCard(i, d, open) {
    var id = 'i:' + i.id, key = id + '@' + d, dl = dayLabel(d), type = (i.kind === 'half' ? 'Half-day idea' : 'Day trip') + ' · ' + CITY[i.city];
    var km = ideaKm(i), why = 'Fits ' + dl + (km !== null ? ' · ' + kmLine(km) : '') + ' · ' + howLine(i);
    // In the ideas sheet the day is the heading, so the line leads with how to get there and how long, then distance:
    // Ferry from Sydney CBD, 35 min · about 9 km away (the details give the full wording)
    if (open) why = i.dest ? howLine(i) + (km !== null ? ' · ' + (km < 1 ? 'under\u00a01\u00a0km' : 'about\u00a0' + Math.round(km) + '\u00a0km') + '\u00a0away' : '') : (i.car ? 'Car only, ' + mins(i.how.mins) + ' from ' + i.how.from : i.how.mode + ' from ' + i.how.from + (i.how.mins ? ', ' + mins(i.how.mins) : ', ' + TBC_L)) + (km !== null ? ' · ' + (km < 1 ? 'under\u00a01\u00a0km' : 'about\u00a0' + Math.round(km) + '\u00a0km') + '\u00a0away' : '');
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
     description. Since 22 Nov 2026 the ideas are real towns (concepts-destinations.js, §19): the description is the
     town page's summary and a town has no hours or price rows. Sydney Opera House, the one idea with no row, keeps
     bracketed placeholders, pink with Annotations on. Add to your plan and View full page (not linked yet). */
  function ideaDetail(i, d, noBack) {
    var id = 'i:' + i.id, key = id + '@' + d, dl = dayLabel(d), km = ideaKm(i);
    ITEMS[key] = { id: id, kind: 'place', idea: i.kind, title: i.title, kindLabel: i.kind === 'half' ? 'Half-day idea' : 'Day trip', place: howLine(i), day: dl };
    var h = ''; // its way back is the sheet's back arrow
    h += '<div class="plan-modal-img ph-img tp-idea-img"' + imgKey(i.title) + ' role="img" aria-label="' + esc(IMG(i.title)) + '"></div>';
    h += '<p class="tp-pm-type">' + esc((i.kind === 'half' ? 'Half-day idea' : 'Day trip') + ' · ' + CITY[i.city]) + '</p>';
    h += '<h2 class="cn-pp-title' + (i.placeholder ? ' provenance-gap' : '') + '" id="tp-pm-title" tabindex="-1">' + esc(i.title) + '</h2>';
    h += '<p class="tp-pm-why provenance-gap">Fits ' + esc(dl) + (i.kind === 'half' ? ': it takes about half the day' : ': it takes the whole day') + (km !== null ? ', ' + esc(kmLine(km)) : '') + '.</p>';
    h += '<h3 class="cn-pp-h">Practical details</h3><dl class="pl-option-facts cn-pp-facts">' +
      '<div><dt>Getting there</dt><dd><span class="provenance-gap">' + esc(howLine(i)) + '</span>' + (i.dest && i.dest.getting ? '<span class="provenance-gap tp-idea-get">' + esc(i.dest.getting) + '</span>' : '') + (i.car ? '<br><span class="provenance-gap">No car? Ridgeline Tours runs a guided day from ' + esc(i.how.from) + '.</span>' : '') + '</dd></div>' +
      // A town or suburb has no opening hours or price: the rows are left out (§19 empty state); other ideas keep them
      (i.dest ? '' : '<div class="tp-placeholder"><dt>Opening hours</dt><dd><span class="provenance-gap">[Opening hours to come]</span></dd></div>' +
      '<div class="tp-placeholder"><dt>Price</dt><dd><span class="provenance-gap">[Price to come]</span></dd></div>') + '</dl>';
    h += i.dest ? '<p class="cn-pp-text provenance-gap tp-idea-desc">' + esc(i.dest.summary) + '</p>'
      : '<p class="cn-pp-text provenance-gap tp-idea-desc tp-placeholder">[A short description of ' + esc(i.title) + ' to come: what it is and why it is worth the time.]</p>';
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
    if (b.kind === 'match') { var m = b.ms.filter(hasTicket)[0] || b.ms[0], f = m.f; return { when: dayLabel(b.day) + ' · Match day', what: matchName(f) + ', ' + (f.k || TBC_L) + ', ' + f.v + (hasTicket(m) ? ' (your ticket)' : '') }; }
    if (b.kind === 'free') { var n = b.z - b.a + 1; return { when: n + (n === 1 ? ' free day' : ' free days') + ' · ' + spanLabel(b.a, b.z), what: b.between ? 'Between Newcastle and Sydney' : 'From ' + (basePlace() || CITY[b.base]) }; }
    if (b.kind === 'ko') return { when: dayLabel(b.day) + ' · Later round', what: koName(b.ms[0].f) + ' is on · teams to be decided' };
    if (b.kind === 'watch') return { when: dayLabel(b.day) + ' \u00b7 Free day', what: (b.ms.length > 1 ? manyLine(b.ms) : kickLine(b.ms[0])) + '. Here\u2019s where to watch' };
    if (b.kind === 'half') return { when: dayLabel(b.day) + ' · ' + (b.first ? 'Arrival day' : 'Last day'), what: 'Half a day, ' + halfWhere(b) };
    return { when: dayLabel(b.day) + ' · Away', what: matchName(b.m.f) + ' in ' + b.m.f.a + ' (your ticket)' };
  }
  /* A free day's ideas, opened from its + on the axis in the sheet stacked over the plan (16 Nov: they used to open
     inline under the axis). The same list the page shows for that day (the same ideas, Fits [day], More ideas and Add
     buttons), so adding here or on the page is one plan. When the day fills, it says so and offers the next free day,
     whose ideas the page has moved on to. Under the list, See all ideas for this day stands for the full page (not
     linked yet). What was added lands on the axis once the sheet closes. */
  var tlIdeas = document.getElementById('tp-tl-ideas'), tlIdeasDay = null, tlIdeasHold = null, tlIdeasHome = tlIdeas && tlIdeas.parentNode, tlIdeasNext = tlIdeas && tlIdeas.nextSibling, tlIdeasAdded = [];
  var tlIdeasOrder = {}; // the order each day's cards were shown in
  function freeInfo(d) { return FREEINFO.filter(function (x) { return x.d === d; })[0]; }
  function renderTlIdeas() {
    if (window.tpFreeApi) window.tpFreeApi.set(FREEINFO.filter(function (x) { return !x.half; }).map(function (x) { return { d: x.d, label: x.label, filled: x.filled, count: x.count }; }));
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
    var h = '<h2 class="cn-pp-title tp-tl-ideas-h" id="tp-pm-title" tabindex="-1">' + esc(fd.label) + '</h2><p class="tp-tl-ideas-sub" id="tp-tl-ideas-h">' + esc(fd.half || 'Free day') + ' · ' + esc(line) + '</p>';
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
      r.lead = goOne(m) + fanNearHtml(m.f);
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
      r.pins = venuesFor(b.ms).map(function (c) { return { key: 'w:' + c.j + ':' + evKey(b.ms), open: 'w:' + c.j + ':' + evKey(b.ms), title: c.sp.name, kindLabel: SPOT_TYPE[c.sp.type] || 'Screening', ll: GEO && GEO.watch[c.j] }; }).filter(function (x) { return x.ll; });
    } else if (st.kind === 'ko') {
      var kf = b.ms[0].f;
      r.anchor = stadiumLL(kf.v) || home || nearStadium(d, cityOf(kf.v)); r.place = kf.v;
      r.kicker = dl + ' \u00b7 Later round'; r.title = koName(kf) + ' is on \u00b7 teams to be decided';
      r.body = koBody(b);
    } else if (st.kind === 'half') {
      var wd = weekdayOf(d), c2 = b.base, fx = { d: dl, v: CITY[c2] };
      r.anchor = home || nearStadium(d, c2); r.place = home ? home.name : CITY[c2];
      r.kicker = dl + ' \u00b7 ' + (b.first ? 'Arrival day' : 'Last day'); r.title = 'Half a day, ' + halfWhere(b);
      if (basePlace() && !halfNear(b)) r.note = halfNote(b);
      if (dayFilled(d)) r.note = 'Your half day is full.';
      r.pins = ideaPins(d);
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
        r.pins = ideaPins(d);
      }
      // What is already on that day: shown as done pins, with a loop for a day trip
      its.forEach(function (x) {
        var ll = addedLL(x);
        if (ll) r.pins.push({ key: null, open: 'item:' + x.id, title: x.title, kindLabel: 'Added', ll: ll, done: true, trip: x.idea === 'day' }); // a tap opens it, as on your plan
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
    // An away day has no heading to open: the line itself takes focus
    var head = thirdList.querySelector('[data-blk-toggle="' + b.key + '"]') || thirdList.querySelector('.tp-blk--away[data-blk="' + b.key + '"]');
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
    /* E2 (22 Nov): the arrival and last day get Add ideas in the plan too, offering only the half-day ideas (we do not
       know arrival or departure times, so nothing longer and no time is guessed) */
    bs.forEach(function (b) {
      if (b.kind !== 'half') return;
      var d = b.day, dl = dayLabel(d), its = dayItems(d), dk = b.key + ':' + d, W = window.TP_WORDS || {}, kl = b.first ? (W.arrivalDay || 'Arrival day') : (W.lastDay || 'Last day');
      if (dayFilled(d)) { FREEINFO.push({ d: d, label: dl, filled: true, count: 0, dk: dk, its: its, show: [], more: false, base: b.base, half: kl }); return; }
      // The city's half-day ideas not already in the plan; they may also be offered on a free day, as the page shows
      // places near the base on these days instead (Who's coming? puts the ones that suit first)
      var show = partyFirst(IDEAS.filter(function (i) { return i.kind === 'half' && i.city === b.base && !ideaAdded(i); })).slice(0, 3);
      FREEINFO.push({ d: d, label: dl, filled: false, count: show.length, dk: dk, its: its, show: show, more: false, base: b.base, half: kl });
    });
    // The section's name follows whose matches it is about: no team picked (nor a match added), the NSW matches
    var tt = document.getElementById('tp-third-title'); if (tt) tt.textContent = thirdName();
    if (thirdNote) thirdNote.textContent = first ? 'A first look: around the next NSW match day. Each links out; nothing is booked here.'
      : M.range ? 'Your days in NSW, in order: match days and the free days between them. Each links out; nothing is booked here.'
      : M.own && !M.nsw.length && !M.local ? tp.list(state.picked.filter(function (n) { return tp.teams[n]; })) + ' plays interstate, so these are the NSW match days you could go to. Each links out; nothing is booked here.'
      : 'Each links out; nothing is booked here.';
    // Only the next block is open to start with; a different set of days starts again from the next one
    var sigNow = bs.map(function (b) { return b.key; }).join(',');
    if (sigNow !== blkSig || !openSet) { blkSig = sigNow; openSet = {}; var nx = bs.filter(function (b) { return b.kind !== 'away'; })[0]; if (nx) openSet[nx.key] = true; }
    if (!bs.length) {
      thirdList.innerHTML = '<p class="tp-empty">' + (stay() ? 'No NSW match falls in your days here (' + esc(tp.isoRange(trip().from, trip().to)) + '). Change your days.' : 'There are no NSW matches to plan around yet. See Where to watch above.') + '</p>';
      return;
    }
    var h = '';
    bs.forEach(function (b) {
      var hd = heading(b), open = !!openSet[b.key], bid = 'tp-blk-' + b.key;
      if (b.kind === 'away') { h += '<div class="tp-blk tp-blk--away" data-blk="' + b.key + '" tabindex="-1"><p class="tp-blk-line"><span class="tp-blk-when">' + esc(hd.when) + '</span> <span class="tp-blk-what">' + esc(hd.what) + '</span></p></div>'; return; }
      h += '<section class="tp-blk tp-blk--' + b.kind + '" data-blk="' + b.key + '"><h4 class="tp-blk-h"><button type="button" class="tp-blk-head" data-blk-toggle="' + b.key + '" aria-expanded="' + open + '" aria-controls="' + bid + '">' +
        '<span class="tp-blk-when">' + esc(hd.when) + '</span><span class="tp-blk-what">' + esc(hd.what) + '</span><span class="tp-blk-chev" aria-hidden="true"></span></button></h4>' +
        '<div class="tp-blk-body" id="' + bid + '"' + (open ? '' : ' hidden') + '>' + (open ? (b.kind === 'match' ? matchBody(b, M) : b.kind === 'free' ? b._html : b.kind === 'watch' ? watchBody(b) : b.kind === 'ko' ? koBody(b) : halfBody(b)) : '') + '</div></section>';
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
     it is at the top, a placeholder image, then the facts. Each has Add to plan (in step with the card's Add) and
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
  /* Save (20 Nov; CLAUDE.md check 10, Changes say they're kept): every change in a sheet is applied at once, but on a
     phone the line saying so sits below the fold, and the cross reads as cancel. Once something changes, a bar pins to
     the sheet's foot with what changed and Save, which does exactly what the cross does: closes the sheet. It stays
     while drilling down, and goes when the sheet next opens. Not the days sheet: it holds its dates until Use these
     dates, its own button */
  var pmSave = document.createElement('div');
  pmSave.className = 'tp-pm-save'; pmSave.hidden = true;
  pmSave.innerHTML = '<p class="tp-pm-save-said" aria-hidden="true"></p><button type="button" class="tp-pill tp-pill--dark" data-pm-save>Save</button>';
  pm.appendChild(pmSave);
  var pmRoot = '';
  function said(t) {
    pmSaid = t;
    // A place, product or idea page has one change, and its button says it (Added to your plan): no Save bar (26 Nov 2026)
    if (!pmOpen || !t || /^days/.test(pmRoot) || /^(poi:|idea:|p:)/.test(pmRoot)) return;
    pmSave.querySelector('p').textContent = t;
    if (pmSave.hidden) {
      pmSave.hidden = false; pm.classList.add('has-save');
      if (!reduce.matches && pmSave.animate) pmSave.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.2, 0, 0, 1)' });
    }
  }
  function saveOff() { pmSave.hidden = true; pm.classList.remove('has-save'); }
  phone.appendChild(pm);
  // A match opens as a sheet from the bottom, over a scrim; products and places stay full-screen pages
  var pmScrim = document.createElement('div');
  pmScrim.className = 'tp-pm-scrim'; pmScrim.hidden = true;
  phone.insertBefore(pmScrim, pm);
  pmScrim.addEventListener('click', function () { pmClearHistory(); closePm(); }); // the dark area closes the whole sheet, every level
  pmBody = pm.querySelector('#tp-pm-body'); pmKind = pm.querySelector('#tp-pm-kind');
  function pmActions(id, label) {
    var on = added(ITEMS[id] ? ITEMS[id].id : id);
    return '<div class="tp-pm-acts"><button type="button" class="tp-pill tp-pm-add" data-pm-add="' + esc(id) + '" aria-pressed="' + on + '"><span class="tp-pm-add-l">' + addLabel(on, on ? 'Added' : 'Add') + '</span><span class="visually-hidden">, ' + esc(label) + '</span></button>' +
      '<span class="tp-pm-full" role="link" aria-disabled="true">View full page</span><span class="tp-pm-soon">Not linked yet</span></div>';
  }
  function pmProduct(id, x) {
    var p = x.p, f = x.f, h = '';
    h += '<div class="plan-modal-img ph-img"' + imgKey(p.title) + ' role="img" aria-label="' + esc(IMG(p.title)) + '"></div><div class="plan-modal-body">';
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
    h += '<div class="plan-modal-img ph-img"' + imgKey(sp.name) + ' role="img" aria-label="' + esc(IMG(sp.name)) + '"></div><div class="plan-modal-body">';
    h += '<h2 class="cn-pp-title provenance-gap" id="tp-pm-title">' + esc(sp.name) + '</h2>';
    h += '<p class="cn-pp-venue provenance-gap">' + esc(spPlace(sp)) + '</p>';
    h += '<dl class="pl-option-facts cn-pp-facts tp-pm-summary">' +
      '<div><dt>Showing</dt><dd>' + esc(matchName(f)) + ', ' + esc(f.d) + ', ' + esc(f.k || TBC_L) + (f.a ? ' (played in ' + esc(f.a) + ')' : '') + '</dd></div>' +
      (others ? '<div><dt>Also shows</dt><dd><span class="provenance-gap">' + others + ' more of your matches</span></dd></div>' : '') +
      (sp.open_from && sp.open_to ? '<div><dt>Open</dt><dd><span class="provenance-gap">Daily, ' + esc(tp.isoRange(sp.open_from, sp.open_to)) + '</span></dd></div>' : '') +
      '</dl>';
    // Transport, opening times and what is there (sample, 26 Nov 2026)
    var fsp = window.v1FanByName && window.v1FanByName(sp.name);
    if (fsp) h += '<h3 class="cn-pp-h">About this place <span class="v1-sample provenance-gap">Sample</span></h3><dl class="pl-option-facts cn-pp-facts">' +
      '<div><dt>Getting there</dt><dd>' + esc(fsp.transport) + '</dd></div><div><dt>Open</dt><dd>' + esc(fsp.opens) + '</dd></div>' +
      '<div><dt>What is there</dt><dd>' + esc(fsp.has.join(', ')) + '</dd></div></dl>';
    h += pmActions(id, sp.name + ' on ' + f.d) + '</div>';
    return h;
  }
  /* A match from All matches: the facts (date, Sydney kick-off, venue, city, in NSW or interstate), then what can be
     done with it. Add to my plan puts that one match on the plan even when neither team is picked (T12, a
     ticket for a match their team is not in). Add [team] to my teams does exactly what picking the card in the fan
     does. I have a ticket shows for any match with known teams; ticking it also puts the match on the plan, as a
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
    // With a ticket they will be there, not in NSW (19 Nov): the sheet says so first, and the NSW venues wait behind
    // Watching in NSW instead?, opened in place
    if (f.a || removedMatch(m)) {
      var sps = spotsFor(m), away = hasTicket(m);
      h += '<section class="tp-pm-watch" aria-labelledby="tp-pm-watch-h">' +
        (away ? '<h3 class="cn-pp-h" id="tp-pm-watch-h">You\u2019re in ' + esc(f.a) + ' for this one</h3><p class="tp-pm-note">Your ticket is marked, so it\u2019s a day away on your plan.</p>' +
          '<button type="button" class="tp-refine-btn tp-pm-instead" aria-expanded="false" aria-controls="tp-pm-instead">Watching in NSW instead?<svg class="tp-refine-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div id="tp-pm-instead" hidden>'
          : '<h3 class="cn-pp-h" id="tp-pm-watch-h">Where to watch it in NSW</h3>') +
        (sps.length ? '<ul class="tp-wv tp-pm-watch-list">' + sps.map(function (sp) {
          var id = spotItem(sp, m), open = ITEMS[id].note;
          return venueRow(id, sp.name, esc(SPOT_TYPE[sp.type] || 'Screening') + ' \u00b7 ' + esc(spPlace(sp)) + (open ? ' \u00b7 ' + esc(open) : ''),
            addBtn(id, sp.name + ', ' + matchName(f) + ' on ' + f.d).replace('class="tp-add"', 'class="tp-add" data-pm-spot="' + esc(id) + '"'));
        }).join('') + '</ul>' : '<p class="tp-pm-note">No NSW screenings listed for this match yet.</p>') + (away ? '</div>' : '') + '</section>';
    }
    h += '<dl class="pl-option-facts cn-pp-facts tp-pm-summary">' +
      '<div><dt>Date</dt><dd>' + esc(f.d) + '</dd></div>' +
      '<div><dt>Kick-off</dt><dd>' + (f.k ? esc(f.k) + ' Sydney time' : TBC) + '</dd></div>' +
      '<div><dt>Venue</dt><dd>' + esc(f.v) + '</dd></div>' +
      '<div><dt>City</dt><dd>' + esc(f.p) + (f.a ? ' (interstate)' : ', NSW') + '</dd></div></dl>';
    // Another match of the picked teams kicks off at the same time (20 Nov, tp.clashWith in concepts-teams.js)
    var cw = tp.clashWith ? tp.clashWith(m) : [];
    if (cw.length) h += '<p class="tp-pm-clash">' + esc(clashLine(cw)) + '</p>';
    // On the plan already, through a team or Here for the rugby: say so instead of offering to add it
    h += '<div class="tp-pm-acts tp-pm-acts--match">';
    if (by.length && !tp.matchTaken(key)) h += '<p class="tp-pm-on">' + window.tpIcons.added + '<span>On your plan: ' + esc(tp.list(by)) + (by.length === 1 ? ' is one of your teams' : ' are your teams') + '</span></p>'; // Every NSW match puts none on the plan (26 Nov 2026)
    else h += '<button type="button" class="tp-pill tp-pm-add" data-pm-match="' + esc(key) + '" aria-pressed="' + on + '"><span class="tp-pm-add-l">' + addLabel(on, on ? 'Added' : 'Add') + '</span><span class="visually-hidden"> for ' + esc(matchName(f)) + ', ' + esc(f.d) + '</span></button>';
    h += '</div>';
    if (teams.length) {
      // The same toggle as Add to my plan: pressed reads Added, with a tick; pressing it again takes the team off
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
    h += '<div class="plan-modal-img ph-img"' + imgKey(t.title || t.region) + ' role="img" aria-label="' + esc(IMG(t.region)) + '"></div><div class="plan-modal-body">';
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
  /* ---------- An added item from the plan: its details, Move and Remove (stacked over the plan) ----------
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
          ws.push({ key: key, open: key, title: v.name, type: (SPOT_TYPE[v.type] || 'Screening') + ' · ' + spPlace(v), time: f.k ? 'Shows the ' + f.k + ' kick-off' : '', ll: ll, d: SPOT_ORDER[v.type] * 10 + j, made: true });
        });
        ws.sort(function (x, y) { return x.d - y.d; });
        ws = ws.slice(0, 3); // three to start (fan zones first); Where to watch on the page lists them all
        // Said once per stop, under the stop line (20 Nov): where it is played, so a screening is not taken for a match here
        out.push({ key: 'a' + m.day + '|' + f.t, day: m.day, kind: 'away', ms: [m], label: f.d + ' · ' + (f.t || f.s), sub: 'Played in ' + f.a + '. Watch it in NSW.', ll: null, items: ws });
      }
    });
    // Later-round days inside their days: one card each, with the match to Add (27 Nov 2026)
    koOnDays().forEach(function (m) {
      var f = m.f, id = koItem(m), ll = GEOX.venues && GEOX.venues[f.v];
      out.push({ key: 'k' + m.day, day: m.day, kind: 'ko', ms: [m], label: f.d + ' \u00b7 Later round', sub: koName(f) + ' is on. Teams to be decided.', ll: ll || null,
        items: [{ key: id, open: 'match:' + m.key, title: koName(f), type: 'Later round', time: f.k ? f.k + ' Sydney time' : '', ll: ll || null }] });
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
    // With days set: arrival and last days (half days), the same three places Follow day by day offers (20 Nov), so
    // the cards never miss a day that following them shows
    LASTBS.forEach(function (b) {
      if (b.kind !== 'half') return;
      var d = b.day, wd = weekdayOf(d), dl = dayLabel(d);
      var its = halfPicks(b).map(function (p) {
        var o = hoursOn(p, wd), ll = GEOX.products && GEOX.products[p.id], id = 'p:' + p.id + ':' + dl; if (!o || !ll) return null;
        var why = ['Open ' + dl + ', ' + clock(o.opens) + ' to ' + clock(o.closes), p.pricing.is_free ? 'free' : p.pricing.band, p.address.suburb, kmLine(prodKm(p))].filter(Boolean).join(' \u00b7 ');
        ITEMS[id] = { id: id, kind: 'product', title: p.title, kindLabel: PTYPE[p.type] || 'Product', place: p.address.suburb, day: dl };
        MODAL[id] = { type: 'product', p: p, f: { d: dl, v: CITY[b.base] }, o: o, why: why };
        return { key: id, open: id, title: p.title, type: PTYPE[p.type] || 'Product', time: 'Open ' + clock(o.opens) + ' to ' + clock(o.closes), ll: ll };
      }).filter(Boolean);
      if (its.length) out.push({ key: 'h' + d, day: d, kind: 'half', label: dl + ' · ' + (b.first ? 'Arrival day' : 'Last day'), sub: 'Half a day, ' + halfWhere(b) + '.', ll: null, items: its });
    });
    out.sort(function (a, b) { return a.day - b.day; });
    out = out.filter(function (st) { return st.items.length; });
    // With days in NSW set (20 Nov, a new rule): only the stops inside them. How many were left out is kept, so the
    // card row can say nothing falls in your days rather than vanish
    var s0 = stay(), all = out.length;
    if (s0) out = out.filter(function (st) { return st.day >= s0.a && st.day <= s0.z; });
    tp.mapStopsOut = all - out.length;
    return out;
  };
  tp.addBtnHtml = function (key, label) { return addBtn(key, label); };
  tp.imgAttr = function (title) { return imgKey(title); };
  tp.moveItem = function (id, d) { return moveItem(id, d); };
  /* ---------- For the plan's day cards (v1/v1-plan.js, 26 Nov 2026) ---------- */
  // The ideas for a free day, drawn as the page draws them (the cards and their Add buttons), all of them: the plan shows three and Show more
  /* A day's ideas, in the order the plan's list shows them, and the first three of them are what the full-screen map pins
     for that day (26 Nov 2026: the list and the map had each picked their own) */
  function dayIdeas(d) {
    var fd = freeInfo(d); if (!fd || fd.filled) return [];
    var all = [], seen = {};
    if (fd.half) all = partyFirst(IDEAS.filter(function (i) { return i.kind === 'half' && i.city === fd.base && !ideaAdded(i); }));
    else { fd.show.forEach(function (i) { all.push(i); seen[i.id] = 1; }); ideasFor(d, fd.base).forEach(function (i) { if (!seen[i.id]) all.push(i); }); }
    return all;
  }
  function ideaPins(d) {
    return dayIdeas(d).slice(0, 3).map(function (i) { var key = 'i:' + i.id + '@' + d; return { key: key, title: i.title, kindLabel: i.kind === 'half' ? 'Half-day idea' : 'Day trip', ll: GEO && GEO.ideas[i.id], trip: i.kind === 'day', html: ideaCard(i, d) }; }).filter(function (x) { return x.ll; });
  }
  tp.ideasInline = function (d) {
    var fd = freeInfo(d); if (!fd || fd.filled) return null;
    var all = dayIdeas(d);
    return { label: fd.label, count: all.length, cards: all.map(function (i) { return ideaCard(i, d); }) };
  };
  // What a card can say about something added, without opening it: where it is, how to get there, what it costs, when it is open
  tp.itemMore = function (it) {
    var out = [];
    if (it.kind === 'product') {
      var pid = String(it.id || '').split(':')[1], p = PRODUCTS.filter(function (x) { return x.id === pid; })[0];
      if (p && p.distance_to_venue) { var dv = p.distance_to_venue; out.push((dv.transit_minutes ? dv.transit_minutes + ' min by public transport' : dv.walking_minutes + ' min walk') + ' to ' + dv.venue_ref); }
      if (p && p.pricing) out.push(p.pricing.is_free ? 'Free' : 'Price band ' + p.pricing.band);
    } else if (it.kind === 'screening') {
      var fs = window.v1FanByName && window.v1FanByName(it.title);
      if (fs) { out.push(fs.suburb + ': ' + fs.transport); out.push(fs.opens); }
    } else if (String(it.id || '').indexOf('i:') === 0) {
      var iid = it.id.slice(2).replace(/@.*$/, ''), idea = IDEAS.filter(function (x) { return x.id === iid; })[0];
      if (idea) out.push(howLine(idea));
    }
    if (!out.length && it.place) out.push(it.place);
    return out;
  };
  tp.goOne = function (m) { return goOne(m); };
  tp.itemLL = function (it) { return addedLL(it); }; // where an added item is (26 Nov 2026: the plan's map)
  tp.venueLL = function (v) { return GEO && GEO.venues[v] ? GEO.venues[v] : null; };
  tp.freeDays = function () { return FREEINFO.map(function (x) { return { d: x.d, filled: x.filled, count: x.count }; }); };
  tp.imgKey = function (title) { return imgKey(title); };
  tp.itemClosed = function (it, d) { return (it.kind === 'product' || it.kind === 'place' || it.kind === 'poi') && !it.unplaced && !openOn(it, d); };

  /* ---------- Saved, not placed yet ----------
     A place added from the map before their days are set has no day yet (day '', unplaced). It waits in a "Saved, not
     placed yet" group in the plan and the plan, and is slotted once days are set, without asking: near a stadium,
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
    var h = '<div class="plan-modal-img ph-img"' + imgKey(p.title) + ' role="img" aria-label="' + esc(IMG(p.title)) + '"></div><div class="plan-modal-body">';
    h += '<p class="tp-pm-type provenance-gap">' + esc(p.cat) + '</p>';
    h += '<h2 class="cn-pp-title provenance-gap" id="tp-pm-title">' + esc(p.title) + '</h2>';
    h += '<p class="cn-pp-venue provenance-gap">' + esc(p.area) + ' \u00b7 near ' + esc(near) + '</p>';
    h += '<h3 class="cn-pp-h">Practical details</h3><dl class="pl-option-facts cn-pp-facts">' +
      '<div><dt>Open</dt><dd><span class="provenance-gap">' + esc(poiDays(p)) + '</span></dd></div>' +
      '<div><dt>On your plan</dt><dd>' + (!it ? 'Not yet' : it.unplaced ? 'Saved, not placed yet' + (stay() ? ': no free day fits it yet' : ': it goes into a free day once you set your days') : esc(it.day)) + '</dd></div></dl>';
    h += '<div class="tp-pm-acts"><button type="button" class="tp-pill tp-pm-add" data-pm-poi="' + esc(p.id) + '" aria-pressed="' + on + '"><span class="tp-pm-add-l">' + addLabel(on, on ? 'Added' : 'Add') + '</span><span class="visually-hidden">, ' + esc(p.title) + '</span></button>' +
      '<span class="tp-pm-full" role="link" aria-disabled="true">View full page</span><span class="tp-pm-soon">Not linked yet</span></div></div>';
    return h;
  }
  tp.poiItem = function (p) { return { id: 'poi:' + p.id, kind: 'poi', poi: p.id, title: p.title, kindLabel: p.cat, place: p.area, day: '', unplaced: true }; };
  tp.unplaced = function () { return state.added.filter(function (it) { return it.unplaced; }); };
  /* Kick destinations (Drop goal, Stage 2, 21 Nov): places added from the game's card. They wait in Saved, not placed yet
     like the map's saves but are never slotted onto a day: a stop can be 1,150 km away, has no opening hours, and is a
     trip rather than a stop on a day, so the person plans that day themselves. Only §18 fields (data contract): name
     (the title), distance_km and route. tp.waiting() is the saves that do go onto free days once days are set. */
  tp.waiting = function () { return state.added.filter(function (it) { return it.unplaced && it.kind !== 'kick'; }); };
  tp.kicks = function () { return state.added.filter(function (it) { return it.kind === 'kick'; }); };
  // tp.kickLine and tp.KICK_NOTE come from concepts-teams.js (the plan bar lists these before this file loads)
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
      if (!it.unplaced || it.kind === 'kick') return; // kick destinations are never slotted (see tp.waiting)
      // Saved with no team or days but tied to a date (18 Nov): it goes on that date once it falls in their days
      var d = !s ? null : it.fixed ? (function (fd) { return fd >= s.a && fd <= s.z ? fd : null; })(tp.dayOf(it.fixed)) : slotDay(it, s);
      it.nofit = !!s && d === null;
      if (d === null) return;
      it.day = it.fixed || dayLabel(d); delete it.unplaced; delete it.nofit; delete it.fixed; out.push(it);
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
    var it = addedItem(id); if (!it) return '<div class="plan-modal-body"><p class="cn-pp-text">This is no longer on your plan.</p></div>';
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
    h += '<div class="tp-pm-acts"><button type="button" class="tp-link" data-pm-remove="' + esc(id) + '">' + window.tpIcons.remove + '<span class="tp-u">Remove from plan</span></button></div>';
    h += '<p class="tp-pm-said" aria-hidden="true">' + esc(pmSaid) + '</p></div>';
    return h;
  }
  // The match sheet doubles as the plan's stacked sheet: grabber, stack closing, focus back to the marker
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
  tp.moveItem = moveItem; // the plan's hold-and-drag
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
     plan, a full-screen map). One sheet element does it all; a level is drawn again from its id on the way back.
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
    // scrolls inside it). Over the plan its top is pinned already. Released when it closes.
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
     closes it at the first; earlier it springs back. (Over the plan the stack's own drag does the same.) */
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
     it, as the plan does under its stacked sheets, and comes forward again when the sheet closes */
  var pmLayer = null;
  function pmLayerBack(on) {
    if (on) { pmLayer = phone.querySelector('.tp-ov-map.is-full') || phone.querySelector('.tp-mapfs:not([hidden])'); if (pmLayer) pmLayer.classList.add('tp-layer-back'); }
    else if (pmLayer) { pmLayer.classList.remove('tp-layer-back'); pmLayer = null; }
  }
  // Dragging the grabber down over the plan goes back one level when there is one
  pm.addEventListener('tp:stackdismiss', function (e) { if (pmHistory.length) { e.preventDefault(); pmPop(); } });
  /* ---------- Host city sheet (Home, 19 Nov, Figma 385:649) ----------
     From a city card or a map pin on Home: one NSW stadium, highlights of its area (19 Nov), its matches (each drills down to the match), places near it
     to eat or see (each drills down to the place), places to stay (no data yet: its empty state says so) and the
     curated day trips from that city (listed; they are fitted around your matches in Plan your 3rd half). */
  var HOSTS = {
    'Sydney Football Stadium': { title: 'Sydney \u2013 Moore Park', base: 'sydney', img: 'sydney-football-stadium' },
    'Stadium Australia': { title: 'Sydney \u2013 Olympic Park', base: 'sydney', img: 'stadium-australia' },
    'Newcastle Stadium': { title: 'Newcastle', base: 'newcastle', img: 'Newcastle baths' }
  };
  tp.hosts = HOSTS;
  tp.hostMatches = function (v) { return (window.cnFixtures || []).filter(function (f) { return f.v === v; }).map(function (f) { return tp.match(f.d + '|' + (f.t || f.s)); }).filter(Boolean); };
  function pmCity(v) {
    var c = HOSTS[v], ms = tp.hostMatches(v), pois = POI ? POI.pois.filter(function (q) { return q.near === v; }) : [];
    var trips = TRIPS.filter(function (t) { return t.kind === 'day' && t.bases.indexOf(c.base) > -1; }).sort(byTravel(c.base));
    var h = '<div class="plan-modal-img ph-img" data-img="' + esc(c.img) + '" role="img" aria-label="' + esc(IMG(c.title)) + '"></div><div class="plan-modal-body tp-pm-city">';
    h += '<h2 class="cn-pp-title" id="tp-pm-title">' + esc(c.title) + '</h2>';
    h += '<p class="cn-pp-venue">' + esc(v) + ' \u00b7 ' + ms.length + (ms.length === 1 ? ' match' : ' matches') + '</p>';
    // Highlights of the area (19 Nov, gap field highlights, §16): none, no heading
    var hl = (window.cnHostHighlights || {})[v] || [];
    if (hl.length) h += '<h3 class="cn-pp-h">Highlights</h3><ul class="tp-city-hl">' + hl.map(function (x) {
      return '<li><span class="tp-city-hl-t provenance-gap">' + esc(x.title) + '</span><span class="tp-city-hl-p provenance-gap">' + esc(x.text) + '</span></li>';
    }).join('') + '</ul>';
    h += '<h3 class="cn-pp-h">Match day</h3><ol class="tp-ko-list">' + ms.map(function (m) {
      var f = m.f;
      return '<li><button type="button" class="tp-ko-row" data-open="match:' + esc(m.key) + '" aria-haspopup="dialog"><span class="tp-ko-d">' + esc(f.d) + (f.k ? ', ' + esc(f.k) : '') + '</span><span class="tp-ko-s">' + esc(f.t || f.s.replace(/ \(\d+\)$/, '')) + '</span><span class="tp-ko-v">' + esc(f.t ? f.s : 'Teams known when the pools finish') + '</span></button></li>';
    }).join('') + '</ol>';
    h += '<p class="tp-city-ph">[One line on getting to ' + esc(v) + ' by public transport]</p>';
    h += '<h3 class="cn-pp-h">Near the stadium</h3>' + (pois.length ? '<ul class="tp-ko-list">' + pois.map(function (q) {
      return '<li><button type="button" class="tp-ko-row" data-open="poi:' + esc(q.id) + '" aria-haspopup="dialog"><span class="tp-ko-s">' + esc(q.title) + '</span><span class="tp-ko-v">' + esc(q.cat) + ' \u00b7 ' + esc(q.area) + '</span></button></li>';
    }).join('') + '</ul>' : '<p class="tp-city-empty">Nothing listed near this stadium yet.</p>');
    // Places to stay: no accommodation is tied to a stadium in the data yet (distance_to_venue is a gap field)
    h += '<h3 class="cn-pp-h">Where to stay</h3><p class="tp-city-empty">Places to stay near the stadium are to come.</p>';
    h += '<h3 class="cn-pp-h">Day trips from ' + esc(CITY[c.base]) + '</h3>' + (trips.length ? '<ul class="tp-ko-list">' + trips.map(function (t) {
      return '<li><span class="tp-ko-s tp-city-trip">' + esc(t.title) + '</span><span class="tp-ko-v">' + esc(getThere(t, c.base)) + '</span></li>';
    }).join('') + '</ul><p class="tp-ko-note">Pick your teams and set your days in Plan your 3rd half, and these are fitted around your matches.</p>' : '<p class="tp-city-empty">No day trips from here yet.</p>');
    return h + '</div>';
  }
  function openPm(id, opener, stacked, swap) {
    var isMatch = id.indexOf('match:') === 0, isItem = id.indexOf('item:') === 0, isDays = id === 'days' || id === 'days:stay';
    var isKo = id.indexOf('ko:') === 0, isWt = id.indexOf('wt:') === 0, isIdeas = id.indexOf('ideas:') === 0;
    var isPoi = id.indexOf('poi:') === 0, isIdea = id.indexOf('idea:') === 0, isCity = id.indexOf('city:') === 0;
    if (isCity && !HOSTS[id.slice(5)]) return false;
    var poiP = isPoi && POI ? POI.pois.filter(function (q) { return q.id === id.slice(4); })[0] : null;
    var ideaK = isIdea ? id.slice(5) : '', ideaAt = ideaK.lastIndexOf('@'), ideaI = isIdea ? IDEAS.filter(function (q) { return q.id === ideaK.slice(2, ideaAt); })[0] : null;
    if ((isPoi && !poiP) || (isIdea && !ideaI)) return false;
    if (!swap) pmClearHistory();
    tlIdeasReturn(); // the ideas list is lent to the sheet; take it back before the body is replaced
    var x = isCity ? { type: 'city' } : isPoi ? { type: 'poi' } : isIdea ? { type: 'idea' } : isIdeas ? { type: 'ideas' } : isKo ? { type: 'ko' } : isWt ? { type: 'wt' } : isDays ? { type: 'days' } : isMatch ? { type: 'match', m: tp.match(id.slice(6)) } : isItem ? { type: 'item', it: addedItem(id.slice(5)) } : MODAL[id];
    if (!x || (isMatch && !x.m) || (isItem && !x.it)) return false;
    pmSaid = '';
    if (!swap) { pmRoot = id; saveOff(); }
    // Products, curated trips and watch spots open as sheets too (16 Nov), not full-screen pages: the page stays in view
    // above, and the cross, the scrim or Escape closes them
    var isRoute = x.type === 'route', asSheet = isCity || isMatch || isRoute || isDays || isKo || isWt || isIdeas || x.type === 'product' || x.type === 'trip' || x.type === 'spot' || isPoi || isIdea || isItem;
    pmOpenerEl = null;
    pmBody.innerHTML = isCity ? pmCity(id.slice(5)) : isPoi ? pmPoi(poiP) : isIdea ? '<div class="plan-modal-body tp-pm-idea">' + ideaDetail(ideaI, +ideaK.slice(ideaAt + 1), true) + '</div>' : isIdeas ? '<div class="plan-modal-body tp-pm-ideas"></div>' : isKo ? pmKo(id.slice(3)) : isWt ? pmWt(id.slice(3)) : isDays ? pmDays() : isMatch ? pmMatch(id.slice(6)) : isItem ? pmItem(id.slice(5)) : x.type === 'product' ? pmProduct(id, x) : x.type === 'trip' ? pmTrip(id, x) : isRoute ? pmRoute(id, x) : pmSpot(id, x);
    if (isIdeas) { if (!swap) tlIdeasAdded = []; pmBody.firstChild.appendChild(tlIdeas); tlIdeas.hidden = false; tlIdeasDay = +id.slice(6); renderTlIdeas(); }
    pmBody.scrollTop = 0;
    pmKind.textContent = isCity ? 'Host city' : isPoi ? (poiP.near === 'village' ? 'Near the fan village' : 'Near the stadium') : isIdea ? 'Idea for a free day' : isIdeas ? 'Ideas for a free day' : isKo ? LR_C + ' in NSW' : isWt ? 'Where to watch in NSW' : isDays ? (dStay ? 'Your trip' : 'Your days') : isMatch ? 'Match' : isItem ? 'On your plan' : x.type === 'product' ? thirdName() : x.type === 'trip' ? (x.t.kind === 'day' ? 'Day trip' : 'Longer trip') : isRoute ? 'Match day' : (SPOT_TYPE[x.sp.type] || 'Where to watch');
    pmOpen = { id: id, opener: opener && opener.dataset.open };
    if (swap) return true; // a sheet over a sheet (pmPush, pmPop): the sheet is already open, only its content changes
    if (stacked) {
      // Over the open plan: the stacked-sheet pattern does the motion, scrim, Tab, Escape, drag and focus return
      clearTimeout(pmUnstackT);
      pmStacked = true;
      pm.classList.remove('is-sheet', 'is-open', 'is-closing');
      pm.classList.add('tp-stack', 'is-stacked');
      pm.classList.toggle('is-match', isMatch || isDays || isIdeas);
      pm.hidden = false;
      void pm.offsetWidth;
      tp.stackOpen(pm, opener);
      pm.querySelector('[data-pm-close]').focus({ preventScroll: true });
      tp.say(isPoi || isIdea ? (isPoi ? poiP.title : ideaI.title) + ', details opened.' : isIdeas ? 'Ideas for ' + (freeInfo(tlIdeasDay) || {}).label + ', opened.' : isKo || isWt ? pmKind.textContent + ', opened.' : isDays ? (dStay ? 'Where you\u2019re staying, opened.' : 'Your days, opened. Pick your first day, then your last.') : (isMatch ? matchName(x.m.f) + ', ' + x.m.f.d : x.it ? x.it.title + ', ' + x.it.day : x.p ? x.p.title + (x.f ? ', ' + x.f.d : '') : '') + ', details opened.');
      notesRefresh();
      return;
    }
    pm.classList.remove('tp-stack', 'is-stacked');
    // A stacked sheet that closed earlier leaves the element inert and offset; on its own over the page it must take taps
    pm.inert = false; pm.style.transform = ''; pm.style.height = ''; pm.style.removeProperty('--stack-top');
    pm.classList.toggle('is-match', isMatch || isDays);
    pm.classList.toggle('is-sheet', asSheet);
    pmScrim.hidden = !asSheet && !wideModal(); // a full page is a modal over the dimmed page on desktop too
    // Everything behind waits; remember what was already inert so closing puts it back as it was
    pmLayerBack(true);
    pmBehind = [body, document.getElementById('tp-tl'), document.getElementById('tp-tl-scrim'), phone.querySelector('.tp-ov-map.is-full')].filter(Boolean).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; });
    pm.hidden = false;
    pm.classList.remove('is-open', 'is-closing'); void pm.offsetWidth; pm.classList.add('is-open');
    pm.querySelector('[data-pm-close]').focus({ preventScroll: true });
    tp.say(isCity ? HOSTS[id.slice(5)].title + ', details opened.' : isPoi || isIdea || isItem ? (isPoi ? poiP.title : isIdea ? ideaI.title : x.it.title) + ', details opened.' : isKo || isWt ? pmKind.textContent + ', opened.' : isDays ? (dStay ? 'Where you\u2019re staying, opened.' : 'Your days, opened. Pick your first day, then your last.') : (isMatch ? matchName(x.m.f) + ', ' + x.m.f.d : x.type === 'product' ? x.p.title : x.type === 'trip' ? x.t.title : isRoute ? 'Getting there and back, ' + matchName(x.m.f) : x.sp.name) + (asSheet ? ', details opened.' : ', page opened.'));
    notesRefresh();
  }
  // Desktop website (the page on its own, 1024px and wider): sheets are modals centred in the window
  function wideModal() { return matchMedia('(min-width: 1024px)').matches && document.documentElement.classList.contains('pv-device'); }
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
    else if (sheet && !wideModal()) {
      // The sheet slides back down the way it came; the scrim fades with it
      pm.classList.add('is-closing');
      pmScrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in' });
      var from = pm.style.transform || 'none'; pm.style.transform = ''; // a drag let go part way down: on from there
      pm.animate([{ transform: from }, { transform: 'translateY(100%)' }], { duration: 240, easing: 'cubic-bezier(.4, 0, 1, 1)' }).onfinish = done;
    }
    else { pm.classList.add('is-closing'); if (wideModal() && !pmScrim.hidden) pmScrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-in' }); pm.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(16px)' }], { duration: 180, easing: 'cubic-bezier(.4, 0, 1, 1)' }).onfinish = done; }
    // The control that was tapped, if it is still there (the same id can appear twice: a map card and its row on the page)
    var el = pmOpenerEl && document.contains(pmOpenerEl) && !pmOpenerEl.closest('[inert]') ? pmOpenerEl : back && phone.querySelector('[data-open="' + CSS.escape(back) + '"]');
    // Opened from Where to watch's You're at line, and the ticket was taken off there (21 Nov): the line has gone, so
    // focus goes to the match's card, back in Where to watch, not to a row elsewhere on the page
    if (pmOpenerEl && !document.contains(pmOpenerEl) && pmOpenerEl.classList && pmOpenerEl.classList.contains('tp-ws-at-m') && back) {
      var wk = back.replace(/^match:/, ''), wc = watchList.querySelector('.tp-wm[data-key="' + CSS.escape(wk) + '"]') || watchList.querySelector('.tp-ws-at-i[data-key="' + CSS.escape(wk) + '"] .tp-ws-at-m');
      if (wc) { if (!wc.hasAttribute('tabindex')) wc.setAttribute('tabindex', '-1'); el = wc; }
    }
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
    h += '<h2 class="cn-pp-title" id="tp-pm-title">' + (c ? esc(c.name) + '\u2019s way through' : LR_C + ' in NSW') + '</h2>';
    if (mine) {
      var pos = /(\w+) Pool /.exec(mine.t.split(' v ').filter(function (x) { return x.indexOf(c.pool) > -1; })[0])[1];
      h += '<p class="tp-ko-lead">If ' + esc(c.name) + ' finishes ' + (pos === '2nd' ? 'second' : pos === '1st' ? 'first' : esc(pos)) + ' in ' + esc(c.pool) + ', its Round of 16 match is in Sydney: <b>' + esc(mine.d) + (mine.k ? ', ' + esc(mine.k) : '') + ', ' + esc(mine.v) + '</b> (' + esc(mine.t) + ').</p>';
    } else if (c) h += '<p class="tp-ko-lead">' + esc(c.name) + '\u2019s Round of 16 would be interstate. If it goes through, the semi-finals and the final are in Sydney.</p>';
    h += '<p class="tp-ko-note">' + LR_C + ' in NSW, all in Sydney. Teams are known when the pools finish.</p><ol class="tp-ko-list">' + ko.map(function (f) {
      var hit = mine && f === mine;
      var mk = f.d + '|' + (f.t || f.s), row = '<span class="tp-ko-d">' + esc(f.d) + (f.k ? ', ' + esc(f.k) : '') + '</span><span class="tp-ko-s">' + esc(f.s.replace(/ \(\d+\)$/, '')) + (f.t ? ': ' + esc(f.t) : '') + '</span><span class="tp-ko-v">' + esc(f.v) + '</span>';
      return '<li' + (hit ? ' class="is-hit"' : '') + '>' + (tp.match(mk) ? '<button type="button" class="tp-ko-row" data-open="match:' + esc(mk) + '" aria-haspopup="dialog">' + row + '</button>' : row) + '</li>';
    }).join('') + '</ol></div>';
    return h;
  }
  function pmWt(name) {
    var ms = watchMatches().filter(function (m) { return m.f.t.split(' v ').indexOf(name) > -1; });
    var h = '<div class="plan-modal-body tp-pm-wt"><h2 class="cn-pp-title" id="tp-pm-title">Find the fan zones for ' + esc(name) + '</h2>' +
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
    if (pd) { openDays(false, pd); return; } // Every NSW match's Plan around your match days
  });

  /* ---------- Your days, and where you're staying, in a sheet (16 Nov) ----------
     Every way to the days from elsewhere on the page (Staying longer? Set your days, Set your days to see what fits,
     Change, the plan's Add your days) opens this sheet where the person is, instead of jumping the page down to
     Your days: the calendar is inline (October and November 2027, the tournament and two days either side), their NSW
     matches are marked, the first tap sets the first day and the second the last. Add where you're staying opens the
     same sheet on the staying question. Nothing moves behind it, and closing returns focus to what opened it. */
  var dsel = null, dStay = false, pmOpenerEl = null, pmAnchor = null, sheetQ = '';
  /* Unconfirmed days are kept (21 Nov, check 10's "unconfirmed input"): days picked but not yet confirmed with Use these
     dates survive closing the sheet any way (cross, Escape, grabber, a tap outside) and come back when it reopens, with
     "Not saved yet". The draft is dropped by Use these dates, Remove my days, or the confirmed days changing elsewhere
     (base no longer matches). In memory only: a reload starts from the confirmed days. */
  var dDraft = null;
  function dKey(r) { return r ? r.a + '-' + r.z : ''; }
  function dSame(x, r) { return !x && !r ? true : !x || !r ? false : x.a === r.a && x.z === r.z; }
  function dStart() {
    var r = dRange();
    if (dDraft && dDraft.base === dKey(r)) return dDraft.sel ? { a: dDraft.sel.a, z: dDraft.sel.z } : null;
    dDraft = null; return r;
  }
  // What the opener sits in (a day's block), so focus and the page can be held even when the opener itself is rebuilt
  function anchorOf(op) { var c = op && op.closest('[data-blk], [id]'); return !c ? null : c.dataset.blk ? '[data-blk="' + CSS.escape(c.dataset.blk) + '"]' : '#' + CSS.escape(c.id); }
  function dRange() { var t = trip() || {}; return t.from && t.to ? { a: tp.isoDay(t.from), z: tp.isoDay(t.to) } : null; }
  /* The calendar marks two things only (26 Nov 2026): the person's own team's matches in NSW (an orange ring and dot), and the
     later rounds in NSW (a diamond). Other teams' matches are not marked. With no team (Show every NSW match) every NSW pool
     match is marked, as nothing is theirs yet. The later rounds always take the diamond. */
  function dMatches() {
    var o = {}, src = tp.rugby() ? tp.allMatches() : tp.own() ? tp.userMatchesAll() : [];
    src.forEach(function (m) { if (!m.f.a && !isKo(m.f)) (o[m.day] = o[m.day] || []).push(m); });
    return o;
  }
  /* ---------- Dates (26 Nov 2026): one range calendar, open by default: the first tap sets the first day, the second the last.
     The read-only strip above it was taken out the same day (it was noise beside the calendar, which marks the same matches). */
  // The later rounds in NSW, by day: the diamond
  function koDays() {
    var o = {};
    tp.allMatches().forEach(function (m) { if (!m.f.a && isKo(m.f)) (o[m.day] = o[m.day] || []).push(m); });
    return o;
  }
  // What they picked, so they need not go back to check: each match with its date (the step "When are you in NSW?")
  function stepMatchesHtml() {
    if (!tp.own()) return '';
    if (tp.rugby()) return ''; // no team: nothing is inferred, and the matches inside the days are listed to add (Also on in NSW)
    var ms = tp.userMatchesAll(); if (!ms.length) return '';
    var row = function (m) {
      var f = m.f;
      // A match in NSW (Sydney or Newcastle) is picked out (26 Nov 2026): a tint and an In NSW tag, so the ones that decide the days stand out from the interstate ones
      return '<li' + (f.a ? '' : ' class="is-nsw"') + '><span class="v1-dm-d">' + esc(dayLabel(m.day)) + '</span><span class="v1-dm-n">' + esc(matchName(f)) + ' <span class="v1-dm-w">\u00b7 ' + esc(f.a ? 'in ' + f.a : CITY[cityOf(f.v)] || cityOf(f.v)) + '</span>' + (f.a ? '' : ' <span class="tp-tag tp-tag--inline v1-dm-tag">In NSW</span>') + '</span></li>';
    };
    var head = ms.slice(0, 6), rest = ms.slice(6);
    return '<section class="v1-dm" aria-labelledby="v1-dm-h"><h4 class="v1-dm-h" id="v1-dm-h">Your matches</h4><ul class="v1-dm-l">' + head.map(row).join('') + '</ul>' +
      (rest.length ? '<details class="v1-dm-more"><summary>Show ' + rest.length + ' more</summary><ul class="v1-dm-l">' + rest.map(row).join('') + '</ul></details>' : '') + '</section>';
  }
  // With a team: how many of their NSW matches fall inside the days; with no team: how many NSW matches do
  function matchCount(inN) { return tp.rugby() ? (inN ? inN + (inN === 1 ? ' NSW match' : ' NSW matches') : 'no NSW matches') : (inN ? inN + ' of your NSW matches' : 'none of your NSW matches'); }
  function askSum(sel) {
    if (!sel) return 'Tap your first day, then your last.';
    if (sel.z === null) return 'First day: ' + dayLabel(sel.a) + '. Now tap your last day.';
    var n = sel.z - sel.a + 1, ms = dMatches(), inN = 0;
    Object.keys(ms).forEach(function (d) { if (+d >= sel.a && +d <= sel.z) inN += ms[d].length; });
    return tp.isoRange(isoOf(sel.a), isoOf(sel.z)) + ' · ' + n + (n === 1 ? ' day' : ' days') + (Object.keys(ms).length ? ', ' + matchCount(inN) : '');
  }
  /* What is on a marked day (26 Nov 2026): hover on a desktop, a long hold on a phone, and keyboard focus, show the matches on
     that day and where they are: the match, its stadium and precinct, and the kick-off in Sydney time. Only the days the
     calendar marks have one (the person's own team's NSW matches, or every NSW match with no team, and the later rounds).
     A hold does not select the day: the tap that ends it is swallowed. Closed by moving off, a tap elsewhere, scrolling,
     Escape, or the calendar being drawn again. The one tooltip lives inside the calendar, so it scrolls with it. */
  var tipEl = null, tipBtn = null, tipTimer = 0, holdTimer = 0, holdAt = null, swallowClick = false, TIP_HOLD = 450, TIP_HOVER = 120;
  function dayOfBtn(b) { var v = b.dataset.cday !== undefined ? b.dataset.cday : b.dataset.dday; return v === undefined ? null : +v; }
  function tipHtml(d) {
    var rows = (dMatches()[d] || []).concat(koDays()[d] || []);
    if (!rows.length) return '';
    return '<p class="v1-caltip-d">' + esc(dayLabel(d)) + '</p>' + rows.map(function (m) {
      var f = m.f;
      return '<p class="v1-caltip-m"><b>' + esc(matchName(f)) + '</b>' + (isKo(f) && !f.t ? ' <span>teams to be decided</span>' : '') + '<span>' + esc(f.v + (f.p ? ', ' + f.p : '')) + '</span><span>' + esc(f.k ? f.k + ' Sydney time' : TBC) + '</span></p>';
    }).join('');
  }
  function tipHide() {
    clearTimeout(tipTimer); clearTimeout(holdTimer);
    if (tipBtn) tipBtn.removeAttribute('aria-describedby');
    if (tipEl && tipEl.parentNode) tipEl.parentNode.removeChild(tipEl);
    tipEl = null; tipBtn = null;
  }
  function tipShow(btn) {
    if (tipBtn === btn && tipEl && tipEl.isConnected) return;
    tipHide();
    var d = dayOfBtn(btn), cal = btn.closest('.tp-cal'), html = d === null ? '' : tipHtml(d);
    if (!html || !cal) return;
    tipEl = document.createElement('div');
    tipEl.className = 'v1-caltip'; tipEl.id = 'v1-caltip'; tipEl.setAttribute('role', 'tooltip'); tipEl.innerHTML = html;
    cal.appendChild(tipEl); tipBtn = btn; btn.setAttribute('aria-describedby', 'v1-caltip');
    // Above the day, kept inside the calendar's width; below it when there is no room above (under the sticky nav)
    var c = cal.getBoundingClientRect(), r = btn.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    var left = Math.max(0, Math.min(c.width - w, r.left - c.left + r.width / 2 - w / 2));
    var above = r.top - h - 8 > 96;
    tipEl.style.left = left + 'px';
    tipEl.style.top = (above ? r.top - c.top - h - 6 : r.bottom - c.top + 6) + 'px';
    tipEl.style.setProperty('--arrow-x', Math.max(10, Math.min(w - 10, r.left - c.left + r.width / 2 - left)) + 'px');
    tipEl.classList.toggle('is-below', !above);
  }
  function markedBtn(t) { var b = t && t.closest && t.closest('.tp-cal-d.is-match, .tp-cal-d.is-ko'); return b && phone.contains(b) ? b : null; }
  // Desktop: hover, after a short pause so a sweep across the calendar does not flicker
  phone.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse') return;
    var b = markedBtn(e.target); if (!b) return;
    clearTimeout(tipTimer); tipTimer = setTimeout(function () { tipShow(b); }, TIP_HOVER);
  });
  phone.addEventListener('pointerout', function (e) {
    if (e.pointerType !== 'mouse') return;
    var b = markedBtn(e.target); if (!b) return;
    if (e.relatedTarget && b.contains(e.relatedTarget)) return;
    tipHide();
  });
  // Keyboard: focus shows it (only for keyboard focus, so a tap, which also focuses a button, does not)
  phone.addEventListener('focusin', function (e) {
    var b = markedBtn(e.target); if (b && b.matches(':focus-visible')) tipShow(b);
  });
  phone.addEventListener('focusout', function (e) { if (markedBtn(e.target)) tipHide(); });
  // Phone: a long hold. Moving, scrolling or lifting early is an ordinary tap or scroll
  phone.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') { if (tipEl && !markedBtn(e.target)) tipHide(); return; }
    var b = markedBtn(e.target);
    if (!b) { if (tipEl) tipHide(); return; }
    clearTimeout(holdTimer); holdAt = { x: e.clientX, y: e.clientY };
    holdTimer = setTimeout(function () {
      holdTimer = 0; swallowClick = true; tipShow(b);
      setTimeout(function () { swallowClick = false; }, 900);
    }, TIP_HOLD);
  });
  function holdCancel() { clearTimeout(holdTimer); holdTimer = 0; }
  phone.addEventListener('pointermove', function (e) {
    if (holdTimer && holdAt && Math.hypot(e.clientX - holdAt.x, e.clientY - holdAt.y) > 8) holdCancel();
  });
  phone.addEventListener('pointerup', holdCancel); phone.addEventListener('pointercancel', holdCancel);
  // The hold's own click must not pick the day; a long hold also raises a context menu on some phones
  phone.addEventListener('click', function (e) { if (swallowClick && markedBtn(e.target)) { e.stopPropagation(); e.preventDefault(); swallowClick = false; } }, true);
  phone.addEventListener('contextmenu', function (e) { if (markedBtn(e.target) && (holdTimer || tipEl)) e.preventDefault(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && tipEl) { e.stopPropagation(); tipHide(); } }, true);
  body.addEventListener('scroll', function () { if (tipEl) tipHide(); holdCancel(); }, { passive: true });

  /* The key to the calendar's marks (26 Nov 2026; it went with the strip and is back): two entries, each only when that mark
     is on the calendar. It sits between the Your matches list and the calendar (above the calendar where there is no list).
     Interstate matches are not marked, so they are not keyed. Screen readers hear each day's own label, so it is hidden from them. */
  function calKeyHtml(ms) {
    var items = [];
    if (Object.keys(ms || {}).length) items.push('<span class="v1-k v1-k-mine">' + (tp.rugby() ? 'Match in NSW' : 'Your match in NSW') + '</span>');
    if (Object.keys(koDays()).length) items.push('<span class="v1-k v1-k-ko">Later rounds</span>');
    return items.length ? '<p class="v1-cal-key" aria-hidden="true">' + items.join('') + '</p>' : '';
  }
  function calMonth(y, mo, ms, sel, attr) {
    sel = sel === undefined ? dsel : sel; attr = attr || 'dday';
    var kd = koDays();
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
      var can = d >= RMIN && d <= RMAX, mm = ms[d] || [], oo = kd[d] || [], a = sel && sel.a, z = sel ? sel.z : null;
      var st = sel ? (d === a ? ' is-start' : '') + (z !== null && d === z ? ' is-end' : '') + (z !== null && d > a && d < z ? ' is-in' : '') : '';
      var lbl = dayLabel(d) + (mm.length ? ', ' + mm.map(function (m) { return matchName(m.f); }).join(' and ') : '') +
        (oo.length ? ', later round in NSW: ' + oo.map(function (m) { return matchName(m.f); }).join(' and ') : '') +
        (sel && d === a ? ', first day' : '') + (z !== null && sel && d === z ? ', last day' : '');
      h += can ? '<button type="button" class="tp-cal-d' + (oo.length ? ' is-ko' : mm.length ? ' is-match' : '') + (inMonth ? '' : ' is-other') + st + '" data-' + attr + '="' + d + '" aria-pressed="' + !!st + '" aria-label="' + esc(lbl) + '">' + dt.getUTCDate() + '</button>'
        : '<span class="tp-cal-d is-off" aria-hidden="true">' + dt.getUTCDate() + '</span>';
    }
    return h + '</div></div>';
  }
  function pmDays() {
    var t = trip() || {}, ms = dMatches(), has = !!(t.from && t.to);
    var h = '<div class="plan-modal-body tp-days">';
    if (dStay) {
      // The same choices as step 3 and Your answers (26 Nov 2026): one builder; here one or two places, or outside NSW
      h += '<h2 class="cn-pp-title" id="tp-pm-title">Where are you staying, or thinking of staying?</h2><p class="tp-days-note">Ideas then start near it, and match days show your own way there and back.</p>' +
        '<span id="tp-sq-base" class="visually-hidden">Where are you staying, or thinking of staying?</span>' +
        stayChoicesHtml({ pre: 's', q: sheetQ, labelId: 'tp-sq-base' }) +
        '<h3 class="tp-days-q">Who’s coming?</h3><div class="tp-quick" role="group" aria-label="Who’s coming">' + PARTY_Q.map(function (x) { return chip('sparty', x[0], x[1], t.party === x[0]); }).join('') + '</div>' +
        '<div class="tp-days-acts"><button type="button" class="tp-pill" data-dclose>Done</button></div>';
      return h + '</div>';
    }
    var n = dsel && dsel.z !== null ? dsel.z - dsel.a + 1 : 0, inN = 0;
    if (n) Object.keys(ms).forEach(function (d) { if (+d >= dsel.a && +d <= dsel.z) inN += ms[d].length; });
    var sum = !dsel ? 'Tap your first day, then your last.' : dsel.z === null ? 'First day: ' + dayLabel(dsel.a) + '. Now tap your last day.'
      : tp.isoRange(isoOf(dsel.a), isoOf(dsel.z)) + ' · ' + n + (n === 1 ? ' day' : ' days') + (Object.keys(ms).length ? ', ' + matchCount(inN) : '');
    h += '<h2 class="cn-pp-title" id="tp-pm-title">Your days in NSW</h2><p class="tp-days-note">' + esc(WHY) + '</p>' +
      calKeyHtml(ms) + '<div class="tp-cal">' + calMonth(2027, 9, ms) + calMonth(2027, 10, ms) + '</div>' +
      // Fixed to the bottom of the sheet (16 Nov): the calendar runs below the fold, so what is picked and Use these
      // dates stay in view and it is clear the plan waits for that tap
      '<div class="tp-days-bar"><p class="tp-days-draft" hidden></p><p class="tp-days-sum" aria-live="polite">' + esc(sum) + '</p>' +
      '<div class="tp-days-acts"><button type="button" class="tp-pill tp-pill--dark" data-duse' + (n ? '' : ' disabled') + '>' + window.tpIcons.cal + 'Use these dates</button>' +
      '</div></div>'; // no Remove my days: Your days is required (27 Nov 2026)
    return h + '</div>';
  }
  tp.openDays = function (opener) { openDays(false, opener); };
  function openDays(stay, opener) {
    dStay = !!stay; sheetQ = ''; adding.s = false; dsel = stay ? dRange() : dStart();
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
    pm.querySelectorAll('[data-dday]').forEach(function (b) {
      var d = +b.dataset.dday, st = !!dsel, s0 = st && d === dsel.a, s1 = st && dsel.z !== null && d === dsel.z, mid = st && dsel.z !== null && d > dsel.a && d < dsel.z;
      b.classList.toggle('is-start', s0); b.classList.toggle('is-end', s1); b.classList.toggle('is-in', mid);
      b.setAttribute('aria-pressed', s0 || s1 || mid ? 'true' : 'false');
    });
    var ms = dMatches(), n = dsel && dsel.z !== null ? dsel.z - dsel.a + 1 : 0, inN = 0;
    if (n) Object.keys(ms).forEach(function (d) { if (+d >= dsel.a && +d <= dsel.z) inN += ms[d].length; });
    var sum = pm.querySelector('.tp-days-sum');
    if (sum) sum.textContent = !dsel ? 'Tap your first day, then your last.' : dsel.z === null ? 'First day: ' + dayLabel(dsel.a) + '. Now tap your last day.'
      : tp.isoRange(isoOf(dsel.a), isoOf(dsel.z)) + ' \u00b7 ' + n + (n === 1 ? ' day' : ' days') + (Object.keys(ms).length ? ', ' + matchCount(inN) : '');
    var use = pm.querySelector('[data-duse]'); if (use) use.disabled = !n;
    // The draft follows every change (check 4): kept while it differs from the confirmed days, named in the bar
    var conf = dRange(), unsaved = !dSame(dsel, conf), dl = pm.querySelector('.tp-days-draft');
    dDraft = unsaved ? { sel: dsel ? { a: dsel.a, z: dsel.z } : null, base: dKey(conf) } : null;
    if (dl) { dl.hidden = !unsaved || !dsel; dl.textContent = dsel && dsel.z !== null ? 'Not saved yet. Use these dates to keep them.' : 'Not saved yet. Pick your last day, then Use these dates.'; } // the summary under it names the days
  }
  pm.addEventListener('click', function (e) {
    if (!pmOpen || pmOpen.id.indexOf('days') !== 0) return;
    var b = e.target.closest('[data-dday], [data-duse], [data-dclear], [data-sbase], [data-sout], [data-sadd], [data-scancel], [data-srm], [data-sparty], [data-dclose]'); if (!b) return;
    var t = trip() || {};
    if (b.dataset.dday !== undefined) {
      var d = +b.dataset.dday;
      if (!dsel || dsel.z !== null || d < dsel.a) dsel = { a: d, z: null }; else dsel.z = d;
      daysPaint();
      tp.say(dsel.z === null ? 'First day ' + dayLabel(d) + '. Now pick your last day.' : 'Last day ' + dayLabel(d) + '. ' + tp.isoRange(isoOf(dsel.a), isoOf(dsel.z)) + '.');
      return;
    }
    if (b.hasAttribute('data-duse')) {
      if (!dsel || dsel.z === null) return;
      var from = isoOf(dsel.a), to = isoOf(dsel.z);
      askEditing = false; askDraft = null; askError = ''; askOwn = true;
      var dBefore = snap();
      holdPlace(function () { tp.setTrip({ from: from, to: to, base: t.base, party: t.party }); });
      dDraft = null; closePm(); tp.say('Your days: ' + tp.isoRange(from, to) + '.');
      changedSince(dBefore, ''); daysToast(!!t.from, from, to);
      return;
    }
    if (b.hasAttribute('data-dclear')) {
      askEditing = false; askDraft = null; askError = ''; askOwn = true; dsel = null; dDraft = null;
      var cBefore = snap();
      holdPlace(function () { tp.setTrip({ base: t.base, base2: t.base2, party: t.party }); }); closePm(); tp.say('Your days are removed.');
      changedSince(cBefore, ''); changeToast('Your days are cleared', ['now works from your matches again', 'now work from your matches again']); return;
    }
    if (b.dataset.sbase !== undefined || b.dataset.sout !== undefined || b.dataset.sadd !== undefined || b.dataset.scancel !== undefined || b.dataset.srm !== undefined) {
      // The same choices as step 3 (27 Nov 2026): one place, or two each with Remove; a place is always required
      sheetQ = '';
      var sr = stayDo('s', b); if (!sr || sr.none) return;
      if (sr.show) { daysRefresh(sr.focus); return; }
      var sBefore = snap();
      holdPlace(function () { stayPatch(sr.patch); }); changedSince(sBefore, ''); baseToast(sr.v);
      daysRefresh(sr.focus); tp.say(stayLine(trip()) + '.'); return;
    }
    if (b.dataset.sparty !== undefined) { var pv = t.party === b.dataset.sparty ? undefined : b.dataset.sparty; askOwn = true; holdPlace(function () { tp.setTrip({ from: t.from, to: t.to, base: t.base, base2: t.base2, party: pv }); }); daysRefresh('[data-sparty="' + CSS.escape(b.dataset.sparty) + '"]'); return; }
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
    if (e.target.closest('[data-pm-close]') || e.target.closest('[data-pm-save]')) { pmClearHistory(); closePm(); return; } // the cross, or Save, closes the whole sheet
    // From the travel sheet: Where are you staying? as the next level; Done comes back to the route, now their own
    var gst = e.target.closest('[data-go-stay]');
    if (gst) { dStay = true; dsel = dRange(); pmPush('days:stay', gst); return; }
    // An added item's sheet: Move to another day, or Remove
    var mvb = e.target.closest('[data-pm-move]');
    if (mvb && pmOpen && pmOpen.id.indexOf('item:') === 0) {
      var nid = moveItem(pmOpen.id.slice(5), +mvb.dataset.pmMove);
      pmOpen.id = 'item:' + nid;
      var moved = addedItem(nid);
      said(moved ? moved.title + ' moved to ' + (moved.when || moved.day) + '.' : '');
      pmBody.innerHTML = pmItem(nid);
      if (typeof tp.tlSelect === 'function') tp.tlSelect(-1, false, nid); // its marker stays the chosen one, on its new day
      var again = pm.querySelector('[data-pm-move], [data-pm-remove]'); if (again) again.focus({ preventScroll: true });
      return;
    }
    var rmb = e.target.closest('[data-pm-remove]');
    if (rmb) {
      var gone = addedItem(rmb.dataset.pmRemove);
      tp.removeItem(rmb.dataset.pmRemove);
      if (gone) tp.say(gone.title + ' removed from your plan. ' + state.added.length + ' added.');
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
      said(on ? matchName(f) + ' is on your plan, ' + f.d + '.' : matchName(f) + ' is off your plan.');
      pmRefresh('[data-pm-match]');
      planToast(id, matchName(f), on);
      tp.say(pmSaid);
      return;
    }
    var tb = e.target.closest('[data-pm-team]');
    if (tb) {
      said(tp.pickTeam(tb.dataset.pmTeam) + '.');
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
      said(si.title + (son ? ' added to your plan on ' + si.day + '.' : ' removed from your plan.'));
      e.stopPropagation(); // handled here: the page's own Add handler must not toggle it back
      pmRefresh('[data-pm-spot="' + CSS.escape(si.id) + '"]');
      planToast(si.id, si.title, son);
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
      said(vi.title + (von ? ' added to your plan on ' + vi.day + '.' : ' removed from your plan.'));
      e.stopPropagation();
      if (isWt) { var st = pmBody.scrollTop; redraw(); pmBody.scrollTop = st; var fb = pm.querySelector('.tp-add[data-item="' + CSS.escape(vid) + '"]'); if (fb) fb.focus({ preventScroll: true }); }
      else pmRefresh('.tp-add[data-item="' + CSS.escape(vid) + '"]');
      planToast(vi.id, vi.title, von);
      tp.say(pmSaid + ' ' + state.added.length + ' added.');
      return;
    }
    var pb = e.target.closest('[data-pm-poi]');
    if (pb && POI) {
      var pp = POI.pois.filter(function (q) { return q.id === pb.dataset.pmPoi; })[0]; if (!pp) return;
      var pit = addedItem('poi:' + pp.id);
      if (pit) { tp.removeItem(pit.id); tp.say(pp.title + ' removed from your plan.'); planToast(pit.id, pp.title, false); }
      else {
        tp.addItem(tp.poiItem(pp));
        var nu = addedItem('poi:' + pp.id);
        if (nu) planToast(nu.id, pp.title, true);
        tp.say(!nu ? '' : nu.unplaced ? pp.title + ' saved, not placed yet. ' + (stay() ? 'No free day fits it yet.' : 'It goes into a free day once you set your days.') : pp.title + ' added to your plan on ' + nu.day + '.');
      }
      pmBody.innerHTML = pmPoi(pp);
      var pf = pm.querySelector('[data-pm-poi]'); if (pf) pf.focus({ preventScroll: true });
      if (tp.ovRefresh) tp.ovRefresh();
      return;
    }
    // Watching in NSW instead? (an interstate match they have a ticket to): the venues open in place
    var ins = e.target.closest('.tp-pm-instead');
    if (ins) { var box = pm.querySelector('#tp-pm-instead'), op = ins.getAttribute('aria-expanded') !== 'true'; ins.setAttribute('aria-expanded', op + ''); if (box) box.hidden = !op; return; }
    var b = e.target.closest('[data-pm-add]'); if (!b) return;
    var it = ITEMS[b.dataset.pmAdd]; if (!it) return;
    var on = !added(it.id);
    if (on && pmHistory.some(function (h) { return h.id.indexOf('ideas:') === 0; })) tlIdeasAdded.push(it.id); // from an idea's details: lands on the axis when the sheet closes
    if (on) tp.addItem(Object.assign({}, it)); else tp.removeItem(it.id);
    // The page stays open; its button follows (the card behind updates with the page)
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.querySelector('.tp-pm-add-l').innerHTML = addLabel(on, on ? 'Added' : 'Add');
    tp.say(it.title + (on ? ' added to your plan on ' + it.day + '. ' : ' removed from your plan. ') + state.added.length + ' added.');
    planToast(it.id, it.title, on);
  });
  pm.addEventListener('input', function (e) {
    if (e.target.id !== 'tp-splace') return;
    sheetQ = e.target.value;
    var list = pm.querySelector('#tp-splace-list');
    list.innerHTML = placeList('s', sheetQ); list.hidden = !sheetQ.trim();
    e.target.setAttribute('aria-expanded', sheetQ.trim() ? 'true' : 'false');
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
    if (out && out.getAttribute('href') === '#') { e.preventDefault(); tp.say(out.dataset.say || 'Placeholder link: it goes to the listing\u2019s own website once real listings are in.'); return; }
    var ad = e.target.closest('[data-at-day]');
    // See your match day: the plan, open on that day, as on the team cards (20 Nov; it moved the page to the day in Around your matches)
    if (ad) { tp.openPlanDay(+ad.dataset.atDay, ad); return; }
    if (e.target.closest('[data-at-plan]')) { tp.openPlan(); return; }
    // Not a button inside a sheet, and not one a sheet has just redrawn away (it is no longer in the page)
    var inIdeas = !!(tlIdeas && tlIdeas.contains(e.target));
    var b = e.target.closest('.tp-add'); if (!b || (pm.contains(b) && !inIdeas) || !b.isConnected) return;
    // An evening place keeps its Evening tag even where the map has listed the same place that day
    var it = (b.closest('.tp-eve') && EVE_I[b.dataset.item]) || ITEMS[b.dataset.item]; if (!it) return;
    if (added(it.id)) {
      tp.removeItem(it.id);
      tp.say(it.title + ' removed from your plan. ' + state.added.length + ' added.');
      if (!inIdeas && !b.closest('#tp-tl')) planToast(it.id, it.title, false); else if (inIdeas) said(it.title + ' removed from your plan.');
    } else if (inIdeas) {
      // Added from the ideas sheet: the axis is behind the sheet, so its marker settles with a ring once the sheet closes
      tp.addItem(Object.assign({}, it));
      tlIdeasAdded.push(it.id);
      tp.say(it.title + ' added to your plan on ' + it.day + '. ' + state.added.length + ' added.');
      said(it.title + ' added to your plan on ' + it.day + '.');
      return;
    } else if (b.closest('#tp-tl')) {
      // From a card in the open plan (Not going to the match?): it shows on that card at once, so no toast (check 11)
      tp.addItem(Object.assign({}, it));
      tp.say(it.title + ' added to your plan on ' + it.day + '. ' + state.added.length + ' saved.');
    } else {
      tp.flyToBar(b);
      tp.addItem(Object.assign({}, it));
      var nuIt = addedItem(it.id);
      tp.say(it.title + (nuIt && nuIt.unplaced ? ' saved to your plan. It goes on ' + it.day + ' once you set your days. ' : ' added to your plan on ' + it.day + '. ') + state.added.length + ' saved.');
      planToast(it.id, it.title, true);
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
  function snap() { return { watch: watchList.textContent, third: thirdList.textContent }; }
  function changedSince(before, lead, same) {
    var after = snap(), names = [];
    pending = [];
    if (before.watch !== after.watch) { names.push('Where to watch'); pending.push(SECS.watch); }
    if (before.third !== after.third) { names.push(thirdName()); pending.push(SECS.third); }
    lastChanged = names.map(function (n, i) { return [n, pending[i]]; });
    askNews = names.length ? lead + ' Updated on the page: ' + names.join(' and ') + '.' : (same || lead + ' Nothing on the page needed to change.');
    // The answer is given in the open plan, over the page: the sections wait until it closes, then each is tinted
    // as it comes into view
    pending.forEach(function (sec) { sec.classList.remove('is-changed'); });
    if (!document.getElementById('tp-tl').classList.contains('is-open')) watchPending();
    return askNews;
  }
  /* Toasts for changes that reach other parts of the page (tp.toast, concepts-teams.js). The title says what the person
     did; the line says what it changed, naming the sections that changed (from changedSince), and the link goes to the
     first of them. verb(one, many) agrees with how many sections changed; with none, the line is `none` (or left out). */
  var lastChanged = [];
  function changeToast(title, verb, none) {
    if (fc() || fcLevel()) return;
    var ch = lastChanged.filter(function (c) { return c[1]; });
    // One line saying what they did; the link names the first section it changed (verb and none are no longer shown)
    tp.toast(title + '.', ch.length ? { label: 'See ' + ch[0][0], fn: function () { tp.goTo(ch[0][1]); } } : null);
  }
  function baseToast(v) {
    var t = trip() || {};
    if (v === 'local') changeToast('Ideas now suit a local', ['now shows the nearest first', 'now show the nearest first']);
    else if (v === 'outside') changeToast('Now staying outside NSW', ['is updated to suit', 'are updated to suit']);
    else if (v && t.base2) changeToast('Now staying in ' + t.base + ' and ' + t.base2, ['now measures from the nearer', 'now measure from the nearer']);
    else if (v) changeToast('Now staying in ' + v, ['now starts from there', 'now start from there']);
    else changeToast('Where you’re staying is cleared', ['is updated to suit', 'are updated to suit']);
  }
  // Compact (18 Nov): it repeats as the days are adjusted, so it is the title only, with a link to the first section
  // that changed, and a new one updates the one showing in place rather than popping up again
  function daysToast(had, from, to) {
    if (fc() || fcLevel()) return;
    var ch = lastChanged.filter(function (c) { return c[1]; });
    tp.toast('Your days are now ' + tp.isoRange(from, to) + '.', ch.length ? { label: 'See ' + ch[0][0], fn: function () { tp.goTo(ch[0][1]); } } : null, 'days');
  }
  function clashLine(cw) { return 'At the same time as ' + tp.list(cw.map(function (c) { return c.name + ' in ' + c.city; })) + '.'; }
  // Something put on, or taken off, the plan: says which day it landed on; the link opens the plan (not over a sheet)
  function planToast(id, title, on) {
    // In a sheet the Save bar says it, where they acted (check 11): no toast as well
    if (pmOpen && !/^days/.test(pmRoot)) {
      var si0 = addedItem(id);
      said(!on ? title + ' removed from your plan.' : si0 && si0.unplaced ? title + ' saved to your plan' + (si0.fixed ? '. It goes on ' + si0.fixed + ' once you set your days.' : ', not placed yet.') : title + ' added to your plan' + (si0 && si0.day ? ' on ' + si0.day : '') + '.');
      return;
    }
    var it = addedItem(id), act = pmOpen ? null : { label: 'Open your plan', fn: tp.openPlan };
    if (!on) { tp.toast(title + ' removed from your plan.'); return; }
    if (!it) return;
    if (it.unplaced) tp.toast(title + ' saved. It goes ' + (it.fixed ? 'on ' + it.fixed + ' once you set your days.' : 'into a free day once ' + (stay() ? 'one fits it.' : 'you set your days.')), act);
    else tp.toast(title + ' added to your plan, ' + it.day + '.', act);
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
  // I'm a local was removed on 24 Nov (the user's call): with matches in both Sydney and Newcastle, local to where is
  // not clear. The local paths below (nearest first, Make a day of it) no longer run; a saved local answer is dropped
  /* Where you are staying (26 Nov 2026). The quick answers follow the person's matches in NSW: the ones inside their days
     (all of their team's with no days; every NSW match inside the days with no team). Sydney CBD when one is in Sydney,
     Sydney Olympic Park when one is at Stadium Australia, Moore Park when one is at the Sydney Football Stadium (the same
     names the plan uses),
     Newcastle when one is in Newcastle; with no match in NSW, Sydney CBD and Newcastle. Each button stores a place the
     distance, route and ideas logic knows (PLACES, cnGeo.places). Bondi and Outside NSW are no longer buttons: a saved
     answer still works and shows as the current place; Staying outside NSW is a quiet link under the search. */
  function stayOptions() {
    var r = dRange(), ms = tp.rugby() ? tp.allMatches().filter(function (m) { return !r || (m.day >= r.a && m.day <= r.z); }) : tp.userMatches().concat(koOnDays()); // a later round inside the days adds its stadium's precinct (27 Nov 2026)
    var at = { cbd: false, olympic: false, moore: false, newc: false };
    ms.forEach(function (m) {
      if (m.f.a) return;
      if (m.f.v === 'Stadium Australia') { at.cbd = true; at.olympic = true; }
      else if (m.f.v === 'Sydney Football Stadium') { at.cbd = true; at.moore = true; }
      else if (m.f.v === 'Newcastle Stadium') at.newc = true;
    });
    if (!at.cbd && !at.newc) { at.cbd = true; at.newc = true; }
    var o = [];
    if (at.cbd) o.push(['Sydney CBD', 'Sydney CBD']);
    if (at.olympic) o.push(['Sydney Olympic Park', 'Sydney Olympic Park']);
    if (at.moore) o.push(['Moore Park', 'Moore Park']);
    if (at.newc) o.push(['Newcastle', 'Newcastle']);
    return o;
  }
  var PARTY_Q = [['solo', 'Solo'], ['couple', 'Couple'], ['friends', 'Friends'], ['family', 'Family']];
  /* What the person has said about where they stay, in words (27 Nov 2026): always a place, one or two, or outside NSW. The
     plan, Your answers, the toasts and the share text all read it, and the buttons carry the same place names. */
  function stayLine(t) {
    t = t || {};
    if (t.base === 'outside') return 'Staying outside NSW';
    if (t.base === 'local') return 'I’m a local';
    return t.base ? 'Staying in ' + t.base + (t.base2 ? ' and ' + t.base2 : '') : '';
  }
  tp.stayLine = stayLine;
  function baseLabel(b) { var t = trip() || {}; return stayLine(b === t.base ? t : { base: b }); }
  function partyLabel(p) { return { solo: 'Solo', couple: 'A couple', friends: 'Friends', family: 'Family' }[p] || ''; }
  function chip(attr, val, label, on) { return '<button type="button" class="tp-chip" data-' + attr + '="' + esc(val) + '" aria-pressed="' + !!on + '">' + label + '</button>'; }
  /* The stay choices, one builder for step 3 and Your answers (pre '') and the Your days sheet (pre 's'). A place is always
     required (27 Nov 2026). One place: the quick answers, the NSW place search and a quiet Staying outside NSW link (choosing
     another replaces it), with a quiet + Add another place under them. Adding: the same choices for the second place, with
     Cancel. Two places: each shown with Remove, nothing else (no nights are asked). A saved place that is not a button now
     shows as the current place. */
  var adding = { '': false, s: false };
  function stayChoicesHtml(o) {
    var t = trip() || {}, pre = o.pre || '', cur = t.base || '', two = t.base2 || '';
    if (cur && two) {
      adding[pre] = false;
      return '<ul class="v1-stay-list" aria-label="Where you’re staying">' + [cur, two].map(function (n, i) {
        return '<li><span class="v1-stay-name">' + esc(n) + '</span><button type="button" class="tp-link" data-' + pre + 'rm="' + (i + 1) + '" aria-label="Remove ' + esc(n) + '">Remove</button></li>';
      }).join('') + '</ul>';
    }
    if (!cur || cur === 'outside') adding[pre] = false;
    var add = adding[pre], opts = stayOptions().filter(function (x) { return !add || x[0] !== cur; }), sel = add ? '' : cur, offered = opts.some(function (x) { return x[0] === cur; });
    var h = add ? '<p class="v1-stay-cur-line">' + esc(stayLine({ base: cur })) + '</p><p class="tp-sec-note v1-stay-addq">Add one more place</p>' : '';
    h += '<div class="tp-quick" role="group" aria-labelledby="' + o.labelId + '">' + opts.map(function (x) { return chip(pre + 'base', x[0], x[1], sel === x[0]); }).join('') + '</div>' +
      '<label class="tp-place"><span>Or find a place in NSW</span><input type="search" id="tp-' + pre + 'place" autocomplete="off" placeholder="For example Parramatta" value="' + esc(o.q) + '" aria-controls="tp-' + pre + 'place-list" aria-expanded="' + !!o.q + '"></label>' +
      '<ul class="tp-place-list" id="tp-' + pre + 'place-list" aria-label="NSW places"' + (o.q ? '' : ' hidden') + '>' + placeList(pre, o.q) + '</ul>';
    if (cur && cur !== 'outside' && !offered && !add) h += '<p class="tp-place-cur">' + esc(stayLine({ base: cur })) + '</p>';
    if (!add) h += '<p class="v1-stay-out">' + (cur === 'outside' ? '<span class="v1-stay-cur" tabindex="-1" aria-live="polite"><svg width="14" height="12" viewBox="0 0 12 10" aria-hidden="true" focusable="false"><path d="M1 5l3.5 3.5L11 1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>Staying outside NSW<span class="v1-stay-hint"> · choose a place above to change it</span></span>'
      : '<button type="button" class="tp-link" data-' + pre + 'out>Staying outside NSW</button>') + '</p>';
    if (cur && cur !== 'outside') h += add ? '<p class="v1-stay-add"><button type="button" class="tp-link" data-' + pre + 'cancel>Cancel</button></p>'
      : '<p class="v1-stay-add"><button type="button" class="tp-link" data-' + pre + 'add>+ Add another place</button></p>';
    return h;
  }
  /* What a tap in the stay choices does, the same on step 3, Your answers and the sheet (pre '' or 's'): a patch to the
     trip and a line to say, or just a change of what shows (Add another place, Cancel). */
  function stayDo(pre, b) {
    var t = trip() || {}, g = function (n) { return b.dataset[pre + n]; }, v = g('base');
    if (v !== undefined) {
      if (adding[pre]) { if (v === t.base) return { none: true }; adding[pre] = false; return { patch: { base2: v }, focus: '[data-' + pre + 'rm]', v: v }; }
      if (t.base === v) return { none: true };
      return { patch: { base: v }, focus: v && !stayOptions().some(function (x) { return x[0] === v; }) ? '#tp-' + pre + 'place' : '[data-' + pre + 'base="' + CSS.escape(v) + '"]', v: v };
    }
    if (g('out') !== undefined) return { patch: { base: 'outside', base2: undefined }, focus: '.v1-stay-cur', v: 'outside' };
    if (g('add') !== undefined) { adding[pre] = true; return { show: true, focus: '.tp-quick [data-' + pre + 'base]' }; }
    if (g('cancel') !== undefined) { adding[pre] = false; return { show: true, focus: '[data-' + pre + 'add]' }; }
    if (g('rm') !== undefined) {
      var first = g('rm') === '1';
      return { patch: first ? { base: t.base2, base2: undefined } : { base2: undefined }, focus: '[data-' + pre + 'add]', v: first ? t.base2 : t.base };
    }
    return null;
  }
  function stayPatch(patch) {
    var t = trip() || {}, n = { from: t.from, to: t.to, base: t.base, base2: t.base2, party: t.party };
    Object.keys(patch).forEach(function (k) { n[k] = patch[k]; });
    if (n.base === 'outside') n.base2 = undefined;
    askOwn = true; tp.setTrip(n);
  }
  function renderAsk() {
    var t = trip() || {}, own = tp.own(), step = fc(), card = fcCard(), show = own || FLOW_B || step === 'days' || step === 'stay' || card;
    ask.hidden = !show;
    if (!show) { ask.innerHTML = ''; return; }
    var has = !!(t.from && t.to), h = '<h3 class="tp-ask-title" id="tp-ask-title">Your days in NSW</h3>';
    var asel = askDraft && askDraft.from && !askDraft.to ? { a: tp.isoDay(askDraft.from), z: null } : has ? { a: tp.isoDay(t.from), z: tp.isoDay(t.to) } : null;
    if (has && !askEditing && step !== 'days' && !card) {
      h += '<p class="tp-ask-sum">' + window.tpIcons.cal + '<span class="tp-ask-sum-text">' + esc(tp.isoRange(t.from, t.to)) + '</span> · <button type="button" class="tp-link" data-act="change">Change</button></p>';
    } else {
      // No quick picks and no Use these dates (16 Nov): every change applies as it is made, with Undo and Reset
      h += '<p class="tp-sec-note">' + esc(own ? WHY : WHY_NONE) + '</p>' +
        (step === 'days' ? stepMatchesHtml() : '') +
        calKeyHtml(dMatches()) + '<div class="tp-cal v1-cal">' + calMonth(2027, 9, dMatches(), asel, 'cday') + calMonth(2027, 10, dMatches(), asel, 'cday') + '</div>' +
        '<p class="tp-days-sum v1-cal-sum" aria-live="polite">' + esc(askSum(asel)) + '</p>' +
        (askError ? '<p class="tp-ask-err" role="alert">' + esc(askError) + '</p>' : '') +
        ((askUndo.length || has || (askDraft && (askDraft.from || askDraft.to))) ? '<div class="tp-ask-acts tp-ask-acts--links">' +
          (askUndo.length ? '<button type="button" class="tp-link tp-ico-link" data-act="undo">' + I_UNDO + 'Undo</button>' : '') +
          (step === 'days' && (has || (askDraft && (askDraft.from || askDraft.to))) ? '<button type="button" class="tp-link tp-ico-link" data-act="clear">' + I_RESET + 'Reset</button>' : '') + '</div>' : '');
    }
    // No line under Undo and Reset saying what changed (18 Nov): the toast and the section tint already say it, and
    // screen readers still hear it (askNews goes to tp.say)
    // Refine your plan: folded; a line under it says what is set
    var bits = [stayLine(t), t.party ? partyLabel(t.party) : ''].filter(Boolean);
    h += '<div class="tp-refine"><button type="button" class="tp-refine-btn" data-act="refine" aria-expanded="' + refineOpen + '" aria-controls="tp-refine-panel">Refine your plan by adding more details<svg class="tp-refine-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      (bits.length && !refineOpen ? '<p class="tp-refine-sum">' + esc(bits.join(' · ')) + '</p>' : '');
    if (refineOpen || step === 'stay' || card) {
      h += '<div class="tp-refine-panel" id="tp-refine-panel">' +
        // Where you're staying is required since 26 Nov 2026 (the base of the plan): the step's own title asks the question
        (step === 'stay' ? '<h4 class="tp-refine-q visually-hidden" id="tp-q-base">Where are you staying, or thinking of staying?</h4>'
          : card ? '<h4 class="tp-refine-q" id="tp-q-base">Where are you staying, or thinking of staying?</h4><p class="tp-sec-note tp-q-base-note">The plan starts from here.</p>'
          : '<h4 class="tp-refine-q" id="tp-q-base">Where are you staying, or thinking of staying?</h4>') +
        stayChoicesHtml({ pre: '', q: placeQ, labelId: 'tp-q-base' }) +
        '<h4 class="tp-refine-q" id="tp-q-party">Who’s coming?</h4>' +
        '<div class="tp-quick" role="group" aria-labelledby="tp-q-party">' + PARTY_Q.map(function (x) { return chip('party', x[0], x[1], t.party === x[0]); }).join('') + '</div>' +
        '</div>';
    }
    h += '</div>';
    ask.innerHTML = h;
  }
  function placeList(pre, q) {
    pre = pre || ''; q = (q === undefined ? placeQ : q) || '';
    var ql = q.trim().toLowerCase(); if (!ql) return '';
    var first = adding[pre] ? (trip() || {}).base : null;
    var hits = PLACES.filter(function (x) { return x.n !== first && x.n.toLowerCase().split(/\s+/).some(function (w) { return w.indexOf(ql) === 0; }) || x.n.toLowerCase().indexOf(ql) === 0; }).slice(0, 5);
    return hits.length ? hits.map(function (x) { return '<li><button type="button" class="tp-place-opt" data-' + pre + 'base="' + esc(x.n) + '">' + esc(x.n) + '</button></li>'; }).join('')
      : '<li class="tp-place-none">No NSW place matches “' + esc(q.trim()) + '”. Staying outside NSW? Use the link below.</li>';
  }
  function setPart(k, v, before, lead) {
    var t = trip() || {}, o = { from: t.from, to: t.to, base: t.base, base2: t.base2, party: t.party };
    o[k] = v; askOwn = true; tp.setTrip(o);
    return changedSince(before, lead);
  }
  ask.addEventListener('input', function (e) {
    if (e.target.id !== 'tp-place') return;
    placeQ = e.target.value;
    var list = ask.querySelector('#tp-place-list');
    list.innerHTML = placeList('', placeQ); list.hidden = !placeQ.trim();
    e.target.setAttribute('aria-expanded', placeQ.trim() ? 'true' : 'false');
  });
  ask.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var t = trip() || {}, h0 = ask.offsetHeight, before = snap(), said;
    askNews = '';
    if (b.dataset.cday !== undefined) { cdayTap(+b.dataset.cday); return; }
    if (b.dataset.quick) {
      var r = quickRange(b.dataset.quick); if (!r) return;
      askEditing = false; askDraft = null; askError = '';
      askOwn = true; tp.setTrip({ from: r.from, to: r.to, base: t.base, base2: t.base2, party: t.party });
      said = changedSince(before, 'Your days: ' + tp.isoRange(r.from, r.to) + '.');
      settle('[data-act="change"]', h0); tp.say(said); daysToast(!!t.from, r.from, r.to); return;
    }
    if ((b.dataset.base !== undefined || b.dataset.out !== undefined || b.dataset.add !== undefined || b.dataset.cancel !== undefined || b.dataset.rm !== undefined) && ask.contains(b)) {
      // The stay choices (27 Nov 2026): one place, or two each with Remove; a place is always required
      placeQ = '';
      var r = stayDo('', b); if (!r) return;
      if (r.none) return;
      if (r.show) { settle(r.focus, h0); return; }
      stayPatch(r.patch);
      said = changedSince(before, stayLine(trip()) + '.');
      settle(r.focus, h0); tp.say(said); baseToast(r.v); return;
    }
    if (b.dataset.party) {
      var pv = t.party === b.dataset.party ? undefined : b.dataset.party;
      said = setPart('party', pv, before, pv ? 'Ideas ordered for ' + { solo: 'one', couple: 'a couple', friends: 'friends', family: 'a family' }[pv] + '.' : 'Who’s coming is cleared.');
      settle('[data-party="' + CSS.escape(b.dataset.party) + '"]', h0); tp.say(said);
      changeToast(pv ? 'Ideas now suit ' + { solo: 'one', couple: 'a couple', friends: 'a group of friends', family: 'a family' }[pv] : 'Who’s coming is cleared', pv ? ['is reordered to suit', 'are reordered to suit'] : ['goes back to its usual order', 'go back to their usual order']); return;
    }
    var act = b.dataset.act;
    if (act === 'refine') { refineOpen = !refineOpen; settle('[data-act="refine"]', h0); return; }
    if (act === 'change') { askEditing = true; settle('.tp-cal-d.is-start, [data-cday]', h0); return; }
    if (act === 'clear' || act === 'undo') { rRoot = ask; askHold(); daysStep(act, '[data-cday]'); }
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
      if (!onPagePicker()) changeToast('Your days are cleared', ['now works from your matches again', 'now work from your matches again']);
    } else {
      var prev = askUndo.pop(); if (!prev) return;
      askEditing = true; askDraft = null; askError = ''; askOwn = true;
      (prev.placed || []).forEach(function (id) { var it = addedItem(id); if (it) { it.day = ''; it.unplaced = true; } });
      tp.setTrip(prev.from ? { from: prev.from, to: prev.to, base: t.base, party: t.party } : { base: t.base, party: t.party });
      said = changedSince(before, prev.from ? 'Back to ' + tp.isoRange(prev.from, prev.to) + '.' : 'Your days are removed again.');
      if (!onPagePicker()) changeToast(prev.from ? 'Back to your days: ' + tp.isoRange(prev.from, prev.to) : 'Your days are cleared again', ['is back as it was', 'are back as they were']);
      said = said + ((prev.placed || []).length ? ' ' + prev.placed.length + (prev.placed.length === 1 ? ' saved place is' : ' saved places are') + ' back in Saved, not placed yet.' : '');
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
  // The slider is in two places: Your days on the page (#tp-ask) and, while no days are set, the open plan
  // (#tp-tl-daysline). rRoot is the one in use, set as each event comes in; both share one Undo history
  var rRoot = null;
  function applyDays(a, z, sel) {
    var t = trip() || {}, lo = '2027-09-29', hi = '2027-11-15', before = snap();
    askDraft = { from: a, to: z };
    if (!a || !z) { askError = ''; return; } // waiting for the other day
    if (a < lo || a > hi || z < lo || z > hi) { askError = 'Pick days between 29 Sep and 15 Nov, around the tournament.'; askQuiet(sel); return; }
    if (z < a) { askError = 'The last day is before the first day.'; askQuiet(sel); return; }
    if (t.from === a && t.to === z) { askDraft = null; askQuiet(sel); return; }
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
    // No toast from the page's own date picker (18 Nov): it sat over the slider while the days were still being set,
    // and the dates already show under the slider. The plan's picker keeps it (check 11)
    if (!onPagePicker()) daysToast(!!(step.from && step.to), a, z);
  }
  function onPagePicker() { return (rRoot || ask) === ask; }
  // The calendar on the page or the step: the first tap sets the first day (kept as a draft), the second the last, and
  // the days apply as they are set, with Undo and Reset. A second tap before the first moves the first day there.
  function cdayTap(d) {
    rRoot = ask;
    var iso = isoOf(d), cur = askDraft && askDraft.from && !askDraft.to ? askDraft.from : '';
    askHold();
    if (!cur) { askDraft = { from: iso, to: '' }; askQuiet('[data-cday="' + d + '"]'); tp.say('First day ' + dayLabel(d) + '. Now tap your last day.'); return; }
    var a = cur, z = iso; if (z < a) { a = iso; z = cur; }
    applyDays(a, z, '[data-cday="' + d + '"]');
  }
  /* Saved, not placed yet, going onto days as the days are set in the open plan: each glides from its row in the
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
  var RMIN = -2, RMAX = 45, RSPAN = RMAX - RMIN; // 29 Sep to 15 Nov: the tournament and two days either side
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
  /* Every way to the days from elsewhere (Set your days, Change, the plan's line) opens them in a sheet where the
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
  /* In the open plan, one line (22 Nov, E3; it held its own slider from 16 Nov): days set, Your days: [range] with
     Change; none set, Your days in NSW: not set. with Set your days. Both open the Your days sheet, stacked. */
  var daysLine = document.getElementById('tp-tl-daysline'), tlDaysEdit = false;
  function renderDaysLine() {
    if (!daysLine) return;
    var t = trip() || {}, bits = [], has = !!(t.from && t.to), wait = tp.waiting().length;
    if (has) bits.push('Your days: ' + tp.isoRange(t.from, t.to));
    if (stayLine(t)) bits.push(stayLine(t));
    if (t.party) bits.push(partyLabel(t.party));
    daysLine.hidden = !tp.own() && !wait;
    /* E3 (22 Nov): one slider only, under the team picker on the page (Figma 372:3060). The plan shows one line either
       way, and both open the Your days sheet, where the fields, calendar, Undo, Reset and Remove my days are */
    tlDaysEdit = false;
    daysLine.classList.remove('is-edit');
    var W = window.TP_WORDS || {};
    if (!has) bits.unshift(W.planDaysUnset || 'Your days in NSW: not set.');
    daysLine.innerHTML = (bits.length ? '<span>' + esc(bits.join(' · ')) + '</span> ' + (has ? '· ' : '') : '') + '<button type="button" class="tp-link" data-act="days" aria-haspopup="dialog">' + window.tpIcons.cal + (has ? 'Change' : esc(W.setDays || 'Set your days')) + '</button>';
  }
  if (daysLine) {
  }
  if (daysLine) daysLine.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act="undo"], [data-act="clear"]'); if (!b) return;
    rRoot = daysLine; daysStep(b.dataset.act, '[data-act="days"]');
  });
  // Closed and opened again, the plan shows the days as one line with Change
  phone.addEventListener('tp:tlclose', function () { if (tlDaysEdit) { tlDaysEdit = false; renderDaysLine(); } });
  phone.addEventListener('click', function (e) {
    var tb = e.target.closest('#tp-third-trip [data-act="trip"], #tp-tl-daysline [data-act="days"]');
    if (tb) openAsk(true, tb);
  });

  // From the results' interstate note: down to the screenings of their matches
  var toWatch = document.getElementById('tp-to-watch');
  if (toWatch) toWatch.addEventListener('click', function () {
    var w = document.getElementById('tp-watch'); if (!w || w.hidden) return;
    var top = w.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16 - (window.tpCapRoom ? window.tpCapRoom() : 0);
    body.scrollTo({ top: Math.max(0, top), behavior: reduce.matches ? 'auto' : 'smooth' });
    document.getElementById('tp-watch-title').setAttribute('tabindex', '-1');
    document.getElementById('tp-watch-title').focus({ preventScroll: true });
  });

  /* ---------- Your plan so far: the end of the page ---------- */
  var planBody = document.getElementById('tp-plan-body'), copied = false;
  function planText() {
    var t = trip(), lines = ['My Rugby World Cup 2027 plan (Plan your 3rd half)'];
    if (t && t.from && t.to) lines.push('In NSW ' + tp.isoRange(t.from, t.to));
    if (t && stayLine(t)) lines.push(stayLine(t));
    if (t && t.party) lines.push('Coming: ' + partyLabel(t.party).toLowerCase());
    if (tp.own()) {
      lines.push('', 'Matches (kick-off times are Sydney time):');
      tp.userMatches().forEach(function (m) {
        var f = m.f;
        lines.push('- ' + f.d + ', ' + (f.k || TBC_L) + ': ' + matchName(f) + ', ' + f.v + ', ' + f.p + (f.a ? ' (interstate)' : '') + (hasTicket(m) ? ' (ticket)' : ''));
      });
    }
    var things = state.added.filter(function (it) { return it.kind !== 'match' && !it.unplaced; }), waiting = tp.waiting(), kicks = tp.kicks();
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
    if (kicks.length) {
      lines.push('', 'Saved, not placed yet, from ' + PLAY + ' (plan a day there yourself):');
      kicks.forEach(function (it) { var l = tp.kickLine(it); lines.push('- ' + it.title + (l ? ', ' + l : '')); });
    }
    if (things.length || waiting.length || kicks.length) lines.push('', 'Hours, prices and screenings are indicative in this prototype, not confirmed.');
    return lines.join('\n');
  }
  function renderPlan() {
    if (!planBody) return;
    var t = trip(), ms = tp.own() ? tp.userMatches() : [], n = state.added.filter(function (it) { return it.kind !== 'match'; }).length;
    // Save & share in the plan only shows once there is a plan to keep
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
    if (ms.length) facts.push('<li>' + tp.countPhrase(ms.map(function (m) { return m.f; }), { num: function (x) { return '<strong>' + x + '</strong>'; } }) + ', ' + (tp.nswFig(ms.map(function (m) { return m.f; })) || (nsw === ms.length ? 'all in NSW' : nsw ? nsw + ' in NSW' : 'all interstate')) + (tk ? ', ' + tk + (tk === 1 ? ' ticket' : ' tickets') : '') + '</li>');
    facts.push('<li><strong>' + n + '</strong> ' + (n === 1 ? 'thing' : 'things') + ' added</li>');
    // With days confirmed, how many of their matches fall in them: the same figure the plan bar shows
    if (when && t.from && ms.length) {
      // Only NSW matches count as in your days: an interstate one in the same dates is watched here, not gone to
      var a = tp.isoDay(t.from), z = tp.isoDay(t.to), msN = ms.filter(function (m) { return !m.f.a; }), inD = msN.filter(function (m) { return m.day >= a && m.day <= z; }).length;
      // (Stage D) the count above already says how many NSW matches are in your days
    }
    if (when) facts.push('<li>' + esc(when) + '</li>');
    // A trip that clashes is said here too, with the way to fix it, not only in the open plan
    var cls = tp.clashes(), clash = state.added.filter(function (it) { return cls[it.id]; }).map(function (it) {
      return '<p class="tp-plan-clash">' + esc(it.title) + ' (' + esc(it.when || it.day) + '): ' + 'clashes with ' + esc(tp.list(cls[it.id].map(function (c) { return c.name + ', ' + c.day; }))) + '</p>';
    }).join('');
    // Saved from the map before their days were set: a group of its own until a free day takes them
    var wait = tp.waiting(), kw = tp.kicks(), waitH = wait.length || kw.length ? '<div class="tp-plan-wait"><h4 class="tp-plan-wait-h">Saved, not placed yet</h4><ul>' + wait.map(function (it) { return '<li>' + esc(it.title) + (it.place ? '<span>, ' + esc(it.place) + '</span>' : '') + '</li>'; }).join('') +
      kw.map(function (it) { var l = tp.kickLine(it); return '<li>' + esc(it.title) + (l ? '<span>, ' + esc(l) + '</span>' : '') + '</li>'; }).join('') + '</ul>' +
      (wait.length ? '<p class="tp-plan-wait-n">' + (stay() ? 'No free day fits ' + (wait.length === 1 ? 'this' : 'these') + ' yet: your free days are full, or ' + (wait.length === 1 ? 'it is' : 'they are') + ' closed on them. Change your days, or remove ' + (wait.length === 1 ? 'it' : 'them') + ' in your plan.' : 'Each goes into a free day once you set your days.') + '</p>' : '') +
      (kw.length ? '<p class="tp-plan-wait-n">' + esc(tp.KICK_NOTE) + '</p>' : '') + '</div>' : '';
    planBody.innerHTML = '<ul class="tp-plan-facts">' + facts.join('') + '</ul>' + waitH + (clash ? clash + '<p class="tp-plan-clash-how">Open your plan to move or remove it.</p>' : '') +
      '<div class="tp-plan-acts"><button type="button" class="tp-plan-btn tp-plan-btn--primary" data-plan="open">Open your plan</button>' +
      '<button type="button" class="tp-plan-btn" data-plan="copy">' + (copied ? 'Copied' : 'Copy plan') + '</button></div>' +
      '<p class="tp-plan-note">Copies as plain text. Nothing leaves this device unless you paste it.</p>';
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

  /* ---------- Save & share: a second sheet stacked over the open plan ----------
     What they keep or send is this plan. */
  var ssBtn = document.getElementById('tp-tl-share'), ss = document.getElementById('tp-ss');
  var KIND = { screening: 'Screening', place: 'Place', product: 'Thing to do', poi: 'Place', kick: 'Place to go' };
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
      if (it.kind === 'kick') { var kl = tp.kickLine(it); rows.push({ at: 999, date: 'Not placed yet', time: '', what: it.title, kind: KIND.kick, where: kl, place: it.title, note: 'Saved from ' + PLAY }); return; }
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
    ss.querySelectorAll('.is-copied').forEach(function (t) { t.classList.remove('is-copied'); });
    tile.classList.add('is-copied');
    clearTimeout(tile._t); tile._t = setTimeout(function () { tile.classList.remove('is-copied'); }, 2400);
  }
  var fb = document.getElementById('tp-ss-fallback'), fbText = document.getElementById('tp-ss-fallback-text');
  function copy(text, tile, msg) {
    fb.hidden = true;
    function fallback() { fb.hidden = false; fbText.value = text; fbText.focus(); fbText.select(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { mark(tile); ssSay(msg); }, fallback); else fallback();
  }
  function mapsUrl() {
    var stops = [];
    planRows().forEach(function (r) { if (r.place && stops[stops.length - 1] !== r.place) stops.push(r.place); });
    if (!stops.length) return null;
    return stops.length === 1 ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(stops[0] + ', NSW')
      : 'https://www.google.com/maps/dir/' + stops.map(function (x) { return encodeURIComponent(x + ', NSW'); }).join('/');
  }
  /* ---------- Add to calendar (22 Nov): a link per event, no .ics file ----------
     Each match or dated thing gets its own Google Calendar and Outlook link. Matches start at kick-off (Sydney time,
     so the times hold for someone in another time zone) and last two hours; a match still to be confirmed, a dated
     thing or a trip is all day (a trip over its nights). Things not placed yet have no date, so they are left out. */
  var SYD = function (d) { return d >= 2 ? 11 : 10; }; // daylight saving starts on Sun 3 Oct 2027 (day 2)
  function ymd(d) { var x = new Date(Date.UTC(2027, 9, 1 + d)); return x.toISOString().slice(0, 10); }
  function calItems() {
    var out = [];
    if (tp.own()) tp.userMatches().forEach(function (m) {
      var f = m.f, k = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(f.k || ''), at = null;
      if (k) { var h = (+k[1] % 12) + (/pm/i.test(k[3]) ? 12 : 0); at = Date.UTC(2027, 9, 1 + m.day, h - SYD(m.day), +k[2]); }
      out.push({ d: m.day, what: matchName(f), when: f.d + ', ' + (f.k ? f.k + ' Sydney time' : TBC_L), where: f.v + ', ' + f.p, at: at, mins: 120, days: 1,
        note: 'Rugby World Cup 2027 match' + (f.s && f.t ? ', ' + f.s : '') + '. Kick-off is Sydney time.' + (hasTicket(m) ? ' You have a ticket.' : '') });
    });
    state.added.forEach(function (it) {
      if (it.kind === 'match' || it.kind === 'kick' || it.unplaced) return;
      var d = it.start != null ? it.start : (function () { try { return tp.dayOf(it.day); } catch (e) { return null; } })();
      if (d == null || isNaN(d) || d < 0 || d > 60) return;
      var trip = it.kind === 'trip', n = trip && it.nights ? it.nights : 0;
      out.push({ d: d, what: it.title + (trip ? (n ? ' (' + n + (n === 1 ? ' night)' : ' nights)') : ' (day trip)') : ''), when: (n ? spanLabel(d, d + n) : it.day || dayLabel(d)) + ', all day',
        where: it.place || (trip ? it.title : ''), at: null, days: n + 1, note: 'From your Rugby World Cup 2027 plan.' + (it.matchName ? ' For ' + it.matchName + '.' : '') });
    });
    return out.sort(function (a, b) { return a.d - b.d || (a.at || 0) - (b.at || 0); });
  }
  function calLinks(e) {
    var g, o, enc = encodeURIComponent, base = 'subject=' + enc(e.what) + '&location=' + enc(e.where) + '&body=' + enc(e.note);
    if (e.at) {
      var a = new Date(e.at), z = new Date(e.at + e.mins * 6e4), gz = function (x) { return x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
      g = gz(a) + '/' + gz(z);
      o = '&startdt=' + enc(a.toISOString().replace(/\.\d{3}/, '')) + '&enddt=' + enc(z.toISOString().replace(/\.\d{3}/, ''));
    } else {
      g = ymd(e.d).replace(/-/g, '') + '/' + ymd(e.d + e.days).replace(/-/g, '');
      o = '&allday=true&startdt=' + ymd(e.d) + '&enddt=' + ymd(e.d + e.days);
    }
    return {
      google: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + enc(e.what) + '&dates=' + g + '&details=' + enc(e.note) + '&location=' + enc(e.where) + '&ctz=Australia/Sydney',
      outlook: 'https://outlook.live.com/calendar/0/action/compose?rru=addevent&' + base + o
    };
  }

  /* ---------- Copy plan in three formats (22 Nov) ----------
     Detailed is planText; For AI assistant is aiText; Compact is one line per match or thing (day, time, name, place),
     the In NSW days line, and saves not placed yet by name only. No notes, no base or party, no disclaimer. */
  function compactText() {
    var t = trip(), lines = ['My Rugby World Cup 2027 plan (Plan your 3rd half)'];
    if (t && t.from && t.to) lines.push('In NSW ' + tp.isoRange(t.from, t.to));
    var rows = [];
    if (tp.own()) tp.userMatches().forEach(function (m) {
      var f = m.f; rows.push({ at: m.day, k: 0, line: f.d + ', ' + (f.k || TBC_L) + ': ' + matchName(f) + ', ' + f.v });
    });
    state.added.forEach(function (it) {
      if (it.kind === 'match' || it.kind === 'kick' || it.unplaced) return;
      var at = it.start != null ? it.start : (function () { try { return tp.dayOf(it.day); } catch (e) { return 99; } })();
      var when = it.kind === 'trip' && it.nights ? spanLabel(it.start, it.start + it.nights) : it.day;
      rows.push({ at: at, k: 1, line: when + ': ' + it.title + (it.kind === 'trip' ? (it.nights ? ' (' + it.nights + (it.nights === 1 ? ' night)' : ' nights)') : ' (day trip)') : (it.place ? ', ' + it.place : '')) });
    });
    rows.sort(function (a, b) { return a.at - b.at || a.k - b.k; });
    if (rows.length) { lines.push(''); rows.forEach(function (r) { lines.push('- ' + r.line); }); }
    var later = tp.waiting().concat(tp.kicks());
    if (later.length) { lines.push('', 'Not placed yet:'); later.forEach(function (it) { lines.push('- ' + it.title); }); }
    return lines.join('\n');
  }
  var FORMATS = {
    detailed: { text: function () { return planText(); }, label: 'Your plan in full', msg: 'Copied. Paste it into a note, an email or a chat.' },
    compact: { text: function () { return compactText(); }, label: 'One line each', msg: 'Copied. Paste it into a note, an email or a chat.' },
    ai: { text: function () { return aiText(); }, label: 'Your plan with a short request', msg: 'Copied. Paste it into your AI assistant.' }
  };
  var ssFormat = 'detailed';

  /* ---------- Add to maps (22 Nov): a link per place, in date order ----------
     Each place in the plan (interstate venues left out, as for the route) with Google Maps and Apple Maps links; the
     whole route in Google Maps sits on top when there are two places or more. */
  function placeItems() {
    var seen = {}, out = [];
    planRows().forEach(function (r) {
      if (!r.place) return;
      var k = r.at + '|' + r.place; if (seen[k]) return; seen[k] = 1;
      out.push({ when: r.at >= 999 ? 'Not placed yet' : r.date, what: r.what, place: r.place });
    });
    return out;
  }

  /* ---------- The peek under a row (22 Nov) ----------
     One panel, moved to sit right under the row that opened it: Copy plan (a choice of three formats, the text, Copy),
     Add to calendar and Add to maps (one line each with its links). One thing open at a time, the email panel included:
     another row swaps it, the same row closes it, and it is gone when the sheet opens. */
  var peek = document.getElementById('tp-ss-peek'), peekLabel = document.getElementById('tp-ss-peek-label'), peekText = document.getElementById('tp-ss-peek-text');
  var peekCopy = document.getElementById('tp-ss-peek-copy'), peekCopyL = peekCopy.querySelector('.tp-ss-peek-copy-l'), peekList = document.getElementById('tp-ss-cal-list'), peekOn = null;
  var fmtBox = document.getElementById('tp-ss-fmt'), route = document.getElementById('tp-ss-route');
  var mailRow = document.getElementById('tp-ss-mailrow'), mailPanel = document.getElementById('tp-ss-mail');
  var peekLi = document.createElement('li'); peekLi.className = 'tp-ss-peek-li'; peekLi.appendChild(peek);
  function peekClose() {
    peek.hidden = true; peekOn = null; if (peekLi.parentNode) peekLi.remove();
    ss.querySelectorAll('[aria-controls="tp-ss-peek"]').forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
  }
  function mailSet(open) {
    mailPanel.hidden = !open; mailRow.setAttribute('aria-expanded', open ? 'true' : 'false');
    mailPanel.parentNode.classList.toggle('is-open', open);
  }
  function into(el) {
    // Opens where the person is: the sheet scrolls only as far as needed to show the top of what opened
    var sr = ss.getBoundingClientRect(), pr = el.getBoundingClientRect(), room = sr.bottom - 80;
    if (pr.top + Math.min(pr.height, 160) > room) ss.scrollTo({ top: ss.scrollTop + (pr.top + Math.min(pr.height, 160) - room), behavior: tp.reduce.matches ? 'auto' : 'smooth' });
  }
  function fmtShow() {
    var f = FORMATS[ssFormat];
    fmtBox.querySelectorAll('[data-fmt]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.fmt === ssFormat ? 'true' : 'false'); });
    peekLabel.textContent = f.label; peekText.textContent = f.text(); peekText.scrollTop = 0; peekCopyL.textContent = 'Copy';
  }
  function linkList(items, empty, fn) {
    peekList.innerHTML = items.length ? items.map(fn).join('') : '<li class="tp-ss-cal-none">' + esc(empty) + '</li>';
  }
  function peekOpen(row) {
    if (peekOn === row) { peekClose(); return; }
    peekClose(); mailSet(false); fb.hidden = true;
    peekOn = row; row.setAttribute('aria-expanded', 'true');
    row.parentNode.after(peekLi);
    var kind = row.id === 'tp-ss-copy' ? 'copy' : row.id === 'tp-ss-cal' ? 'cal' : 'maps';
    fmtBox.hidden = kind !== 'copy'; peekCopy.hidden = kind !== 'copy'; peekText.hidden = kind !== 'copy';
    peekList.hidden = kind === 'copy'; route.hidden = true;
    if (kind === 'copy') fmtShow();
    else if (kind === 'cal') {
      peekLabel.textContent = 'Add each one to your calendar';
      linkList(calItems(), 'Nothing in your plan has a date yet. Matches and things placed on a day show here.', function (e) {
        var l = calLinks(e), nm = esc(e.what);
        return '<li><span class="tp-ss-cal-what">' + nm + '</span><span class="tp-ss-cal-when">' + esc(e.when) + (e.where ? ', ' + esc(e.where) : '') + '</span>' +
          '<span class="tp-ss-cal-links"><a href="' + esc(l.google) + '" target="_blank" rel="noopener" aria-label="Add ' + nm + ' to Google Calendar, opens in a new tab">Google Calendar</a>' +
          '<a href="' + esc(l.outlook) + '" target="_blank" rel="noopener" aria-label="Add ' + nm + ' to Outlook, opens in a new tab">Outlook</a></span></li>';
      });
    } else {
      var places = placeItems(), u = places.length > 1 ? mapsUrl() : null;
      peekLabel.textContent = 'Open each place in your maps app';
      if (u) { route.hidden = false; route.firstChild.href = u; }
      linkList(places, 'Nothing in your plan has a place in NSW yet. Matches in NSW and places you add show here.', function (x) {
        var q = encodeURIComponent(x.place + ', NSW'), nm = esc(x.what);
        return '<li><span class="tp-ss-cal-what">' + nm + '</span><span class="tp-ss-cal-when">' + esc(x.when) + (x.place !== x.what ? ', ' + esc(x.place) : '') + '</span>' +
          '<span class="tp-ss-cal-links"><a href="https://www.google.com/maps/search/?api=1&amp;query=' + q + '" target="_blank" rel="noopener" aria-label="Open ' + nm + ' in Google Maps, opens in a new tab">Google Maps</a>' +
          '<a href="https://maps.apple.com/?q=' + q + '" target="_blank" rel="noopener" aria-label="Open ' + nm + ' in Apple Maps, opens in a new tab">Apple Maps</a></span></li>';
      });
    }
    peek.hidden = false;
    into(peek);
  }
  fmtBox.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fmt]'); if (!b || b.dataset.fmt === ssFormat) return;
    ssFormat = b.dataset.fmt; fb.hidden = true; fmtShow();
  });
  peekCopy.addEventListener('click', function () {
    if (!peekOn || peekOn.id !== 'tp-ss-copy') return;
    var f = FORMATS[ssFormat];
    copy(f.text(), peekOn, f.msg);
    if (navigator.clipboard && navigator.clipboard.writeText) { peekCopyL.textContent = 'Copied'; clearTimeout(peekCopy._t); peekCopy._t = setTimeout(function () { peekCopyL.textContent = 'Copy'; }, 2400); }
  });

  ss.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    switch (b.id) {
      case 'tp-ss-mailrow': var open = mailPanel.hidden; peekClose(); mailSet(open); if (open) { into(mailPanel); setTimeout(function () { (ss.classList.contains('is-sent') ? document.getElementById('tp-ss-again') : email).focus({ preventScroll: true }); }, 0); } break;
      case 'tp-ss-share':
        // The phone's own share sheet (26 Nov 2026); where there is none, the plan is copied instead
        if (navigator.share) navigator.share({ title: 'My Rugby World Cup 2027 plan', text: planText() }).then(function () { mark(b); }, function () { /* closed without sharing: nothing to say */ });
        else copy(planText(), b, 'Sharing is not available here, so your plan is copied.');
        break;
      case 'tp-ss-csv': download(csv(), 'text/csv;charset=utf-8', 'csv'); mark(b); ssSay('Downloaded ' + fileName('csv')); break;
      case 'tp-ss-sheet': copy(tsv(), b, 'Copied for your spreadsheet. Paste into cells.'); break;
      case 'tp-ss-copy': case 'tp-ss-cal': case 'tp-ss-maps': peekOpen(b); break;
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
    note.textContent = 'Sent to ' + to + ' as a PDF. Check your inbox. It is still saved on this device too.';
    ss.classList.add('is-sent');
    document.getElementById('tp-ss-again').focus({ preventScroll: true });
  }
  email.addEventListener('input', function () { if (email.getAttribute('aria-invalid')) { email.removeAttribute('aria-invalid'); emailErr.hidden = true; } });
  email.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send(); } });
  // Opens as a sheet stacked over the plan (tp.stackOpen in concepts-teams.js: motion, closing, focus, Tab)
  ssBtn.addEventListener('click', function () { fb.hidden = true; toast.hidden = true; peekClose(); mailSet(false); ssFormat = 'detailed'; ss.scrollTop = 0; tp.stackOpen(ss, ssBtn); });

  /* ---------- Render: only when something it depends on changed ---------- */
  var sig = '', seen = {}, whys = {};
  function signature() {
    return JSON.stringify([state.picked, state.notGoing, state.trip, state.added.map(function (x) { return x.id; }), state.tab, openSet, moreBlk, moveOpen, askEditing, askManual, askError, openCard, copied]);
  }

  /* ---------- Also on in NSW (26 Nov 2026) ----------
     Once days are set: the other NSW matches inside them, whoever is playing, so a fan sees what else is on while they
     are here; and, when a Newcastle match is on in their days and none of theirs is there, a Newcastle card with the
     reason, even if they are staying in Sydney. The later rounds are named by stage and have no teams yet, so they are
     listed, not added. */
  var alsoEl = document.getElementById('v1-also');
  function pickedHas(f) { return !!f.t && f.t.split(' v ').some(function (n) { return state.picked.indexOf(n) > -1; }); }
  function renderAlso() {
    if (!alsoEl) return;
    var t = trip() || {}, hide = function () { alsoEl.hidden = true; alsoEl.innerHTML = ''; };
    if (!tp.own() || !(t.from && t.to)) { hide(); return; }
    var noTeam = tp.rugby();
    var a = tp.isoDay(t.from), z = tp.isoDay(t.to);
    var others = tp.allMatches().filter(function (m) { return !m.f.a && m.day >= a && m.day <= z && (!pickedHas(m.f) || tp.matchTaken(m.key)); });
    if (!others.length) { hide(); return; }
    var inNcl = others.filter(function (m) { return m.f.v === 'Newcastle Stadium'; });
    var mineNcl = tp.userMatches().some(function (m) { return m.f.v === 'Newcastle Stadium'; });
    var card = '';
    if (inNcl.length && !mineNcl && baseCity() !== 'newcastle') {
      card = '<div class="v1-also-card"><h4 class="v1-also-ct">Newcastle</h4>' +
        '<p class="v1-also-why">Why not visit Newcastle, where there are other matches on</p>' +
        '<p class="v1-also-on">On ' + inNcl.map(function (m) { return esc(dayLabel(m.day)); }).filter(function (x, i, arr) { return arr.indexOf(x) === i; }).join(', ') + '</p>' +
        '<button type="button" class="tp-pill tp-pill--dark v1-also-go" data-open="city:Newcastle Stadium" aria-haspopup="dialog">See Newcastle</button></div>';
    }
    var rows = others.map(function (m) {
      var f = m.f, ko = isKo(f), id = 'm:' + m.key, where = (HOSTS[f.v] ? HOSTS[f.v].title.replace(/^Sydney – /, '') : f.v);
      ITEMS[id] = { id: id, kind: 'match', key: m.key, title: matchName(f), kindLabel: 'Match', day: f.d, place: f.v + ', ' + f.p };
      var open = '<button type="button" class="tp-link v1-also-open" data-open="match:' + esc(m.key) + '" aria-haspopup="dialog">' + esc(matchName(f)) + '</button>';
      return '<li><span class="v1-also-d">' + esc(dayLabel(m.day)) + '</span><span class="v1-also-b">' + open + '<span class="v1-also-w">' + esc(where) + (ko ? ' · teams to be decided' : '') + '</span></span>' +
        addBtn(id, matchName(f) + ', ' + f.d) + '</li>';
    }).join('');
    alsoEl.hidden = false;
    alsoEl.innerHTML = '<h3 class="tp-sec-title" id="v1-also-title" tabindex="-1">' + (noTeam ? 'On while you’re here' : 'Also on in NSW') + '</h3>' +
      '<p class="tp-sec-note">' + (noTeam ? 'NSW matches inside your days. Add the ones you’re going to.' : 'Other matches inside your days, whoever is playing.') + '</p>' + card + '<ul class="v1-also-l">' + rows + '</ul>';
  }
  function render(force, focusSel) {
    var s = signature();
    if (!force && s === sig) return;
    sig = s;
    // The control that had focus is rebuilt, so focus goes back to its replacement
    var active = document.activeElement, keep = null;
    // Focus in the plan's ideas stays there (the page has the same buttons): where it was, by position
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
    ITEMS = Object.assign({}, EVE_I); MODAL = Object.assign({}, EVE_M); // the plan's evening places keep working between redraws
    renderWatch();
    renderAlso();
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
    // In the plan's ideas the same buttons exist on the page too: look in the ideas first, so focus never jumps
    var f = (focusSel && phone.querySelector(focusSel)) || (keep && (inIdeas ? scopeEl.querySelector(keep) : phone.querySelector(keep)));
    // The idea just added leaves the list: focus goes to the idea now in its place, else the list's heading
    if (!f && inIdeas && !scopeEl.hidden) { var adds = scopeEl.querySelectorAll('.tp-add'); f = (ideasAt > -1 && (adds[ideasAt] || adds[adds.length - 1])) || scopeEl.querySelector('.tp-tl-ideas-next, .tp-map-card-h') || scopeEl.querySelector('.tp-tl-ideas-h'); }
    if (f && f !== document.activeElement) f.focus({ preventScroll: true });
    notesRefresh();
  }
  phone.addEventListener('tp:state', function () { render(false); });
  tp.askRender = function () { render(true); }; // Option C: a step that borrows Your days or Where you're staying
  // Reset prototype (a reviewer tool): this section's own choices go back to a first visit too
  var resetBtn = document.getElementById('tp-reset');
  if (resetBtn) resetBtn.addEventListener('click', function () { closePm(); refineOpen = false; placeQ = ''; openSet = null; blkSig = ''; moreBlk = {}; moveOpen = null; openCard = null; askEditing = false; askDraft = null; askManual = false; askError = ''; seen = {}; whys = {}; render(true); });
  render(true);
})();
