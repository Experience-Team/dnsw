/* VERSION 1's PLAN (26 Nov 2026), a new layout to try. Version 1's own copy of concepts-plan.js; the old layout is kept in
   archive/. Testing said people open their plan and cannot read it: the useful things were behind secondary sheets.
   Now: the days are one vertical timeline, one after another, each day a card on a rail. A day with a match or things
   added is a solid card; an empty day has a dotted border; a free day has a dotted outline, a big plus and Suggest
   ideas, which opens up to three ideas right there (Show more for the rest), no sheet. List or Map at the top: the map
   shows each day's place and opens full screen, where the days swipe (what Follow day by day used to be). Match
   days carry getting there, and what is added carries where, how to get there and when, on the card.
   --- The text below is the earlier layout's note ---
   Your plan, day by day (16 Nov). In testing, nobody could read their own plan off the old plan: added things were
   small unlabelled squares on a strip of the whole tournament ("So where's my stuff?", "It's a chart, not a plan", "I
   plan by times"). This draws, inside the Your plan sheet:
   - a strip of your days as an index: one 36px button a day (your days, or your teams' match days with no dates), its
     day number, a match marker and a filled or empty dot. Tapping one goes to that day's card;
   - one card per day: the date and the kind of day (Arrival day, Match day, Last day, Free day, the page's words), the
     match with its kick-off in Sydney time, its stadium and your ticket, then everything added that day with its
     picture, name, type and time where the data has one, each with Move (the item sheet's "Move it to" days, here on
     the card) and Remove. Screenings only Remove: a screening is for one match. Days with nothing added get Add
     ideas (the ideas sheet the + used to open); a run of two or more empty days is one card until it is opened up.
   The cards are stacked and the sheet scrolls, with the strip stuck under the sheet's header.
   Nothing here invents data: times are a product's indicative opening hours that day, or the kick-off a screening
   shows; ideas, places saved from the map and trips have none, so none is shown. Pictures are the stand-ins
   pv-device.js paints by name (grey in the wireframe). */
(function () {
  var TBC = (window.TP_WORDS || {}).timeTbc || 'Time to be confirmed', TBC_L = TBC.charAt(0).toLowerCase() + TBC.slice(1); // A2 (21 Nov): concepts-words.js
  var root = document.getElementById('tp-dc'), tp = window.tpPicker;
  if (!root || !tp) return;
  var state = tp.state, esc = tp.esc;
  var panel = document.getElementById('tp-tl-panel'), head = panel && panel.querySelector('.tp-tl-head');
  var foot = document.getElementById('tp-tl-foot');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Oct', 'Nov'];
  var expanded = {}, moving = null, current = null, flashIds = [];
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
        // The arrival and last day keep their own card, with Add ideas, and never fold into a run of free days (E2)
        empty: !dm.length && !dx.length && !its.length && !nights.length && !(range && range.a !== range.z && (d === range.a || d === range.z)) };
    });
    return { range: range, own: own, days: out, n: days.length, first: days[0] };
  }
  // The cards in order: every day on its own, the empty ones included (26 Nov 2026: empty days are shown in the timeline)
  function groups(M) {
    return M.days.map(function (day) { return { run: false, key: 'd' + day.d, days: [day] }; });
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
      (f.a ? '' : '<span class="tp-tag tp-tag--inline tp-dc-nsw">In NSW</span>') +
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
      '<span class="tp-dc-type">' + esc(sub) + '</span>' + (time ? '<span class="tp-dc-time">' + esc(time) + '</span>' : '') + moreLines(it) + clash +
      '<div class="tp-dc-acts">' +
      (canMove ? '<button type="button" class="tp-dc-act" data-dc-move="' + esc(it.id) + '" aria-expanded="' + open + '">' + MOVE + '<span>Move</span></button>' : '') +
      '<button type="button" class="tp-dc-act" data-dc-remove="' + esc(it.id) + '">' + window.tpIcons.remove + '<span>Remove</span></button></div>';
    if (open) {
      h += mv.length ? '<div class="tp-dc-move" role="group" aria-label="Move ' + esc(it.title) + ' to"><p class="tp-dc-move-h">Move it to</p>' + mv.map(function (m) { return '<button type="button" class="tp-chip" data-dc-to="' + m.day + '" data-dc-id="' + esc(it.id) + '">' + esc(m.label) + '</button>'; }).join('') + '</div>'
        : '<p class="tp-dc-move-none">No other days fit it now. Remove it, or change your days.</p>';
    }
    return h + '</div></li>';
  }
  var v1view = 'list', v1open = {}, v1more = {};
  var PLUS_BIG = '<svg class="v1p-plus" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="22"/><path d="M24 14v20M14 24h20"/></svg>';
  var I_GO = '<svg class="tp-ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 14s4.5-4.1 4.5-7.6a4.5 4.5 0 0 0-9 0C3.5 9.9 8 14 8 14z"/><circle cx="8" cy="6.5" r="1.6"/></svg>';
  // What an added thing says on its card without a sheet: where it is, how to get there, what it costs, when it is open
  function moreLines(it) {
    var l = tp.itemMore ? tp.itemMore(it) : [];
    return l.length ? '<ul class="v1p-more">' + l.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '';
  }
  function ideasHtml(day) {
    var info = tp.ideasInline ? tp.ideasInline(day.d) : null;
    if (!info || !info.count) return '<p class="v1p-ideas-none">No new ideas for this day yet. Free days can stay free.</p>';
    var shown = info.cards.slice(0, 3), rest = info.cards.slice(3), open = !!v1more[day.d];
    return '<div class="v1p-ideas" id="v1p-ideas-' + day.d + '"><div class="tp-pcs">' + shown.join('') + (open ? rest.join('') : '') + '</div>' +
      (rest.length ? '<button type="button" class="tp-link v1p-showmore" data-v1p-more="' + day.d + '" aria-expanded="' + open + '">' + (open ? 'Show fewer' : 'Show more') + '</button>' : '') + '</div>';
  }
  function ideasToggle(day, big) {
    var open = !!v1open[day.d], lbl = open ? 'Hide ideas' : 'Suggest ideas';
    return '<button type="button" class="v1p-suggest' + (big ? ' is-big' : '') + '" data-v1p-ideas="' + day.d + '" aria-expanded="' + open + '" aria-controls="v1p-ideas-' + day.d + '">' + lbl + '</button>';
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
    var h = '';
    // Getting there and back, on the match day itself: one line, then the full details (26 Nov 2026)
    var nm = day.ms.filter(function (m) { return !m.f.a; });
    if (nm.length && tp.goOne) h += '<div class="v1p-go">' + tp.goOne(nm.filter(hasTicket)[0] || nm[0]) + '</div>';
    h += li.length ? '<ul class="tp-dc-list">' + li.join('') + '</ul>' : '';
    // Ideas for a day with something on it already (room for one more): a quiet button, the ideas open below it
    if (day.ideas && li.length) h += '<div class="v1p-more-acts">' + ideasToggle(day, false) + '</div>';
    if (day.ideas && li.length && v1open[day.d]) h += ideasHtml(day);
    return h;
  }
  function cardHtml(g, idx, total, M) {
    var day = g.days[0], d = day.d, id = 'tp-dc-' + g.key;
    var has = day.ms.length || day.its.length || day.nights.length || day.extra.length;
    var aw = awayCities(day), W = window.TP_WORDS || {};
    var free = !has && day.ideas, empty = !has && !day.ideas;
    var x = dateOf(d), title = dayLabel(d) + ' · ' + day.kinds.join(' · ');
    var cls = 'tp-dc-card' + (free ? ' is-free' : '') + (empty ? ' is-empty' : '') + (aw ? ' is-away' : '') + (has ? ' is-filled' : '');
    var h = '<li class="v1p-day' + (has ? ' is-filled' : ' is-open-day') + (day.ms.length ? ' is-match' : '') + '" data-d="' + d + '">' +
      '<div class="v1p-rail" aria-hidden="true"><span class="v1p-dot"><b>' + x.getUTCDate() + '</b><small>' + WD[x.getUTCDay()] + '</small></span></div>' +
      '<article class="' + cls + '" id="' + id + '" data-dc-a="' + d + '" data-dc-z="' + d + '" aria-labelledby="' + id + '-h">' +
      '<h4 class="tp-dc-h" id="' + id + '-h" tabindex="-1">' + esc(title) + '</h4>';
    // Matches at the same time, or in several cities (tp.matchClash in concepts-teams.js): one plain line under the heading
    var mc = tp.matchClash ? tp.matchClash(d) : null;
    if (mc && aw && !mc.ring) mc = null;
    if (mc) h += '<p class="tp-dc-mclash' + (mc.ring ? '' : ' is-quiet') + '">' + esc(mc.line) + '</p>';
    if (aw) h += '<p class="tp-dc-away">' + esc(W.awayLine ? W.awayLine(aw) : 'Away from NSW: ' + aw.join(', ')) + '</p>';
    if (free) {
      // A free day: a dotted outline, a big plus, Suggest ideas; the ideas open here
      h += '<div class="v1p-free">' + PLUS_BIG + '<p class="v1p-free-t">Nothing planned yet.</p>' + ideasToggle(day, true) + '</div>' + (v1open[d] ? ideasHtml(day) : '');
    } else if (empty) {
      h += '<p class="tp-dc-empty">Nothing planned' + (aw ? '.' : '. Free to explore.') + '</p>';
    } else h += dayBody(day);
    return h + '</article></li>';
  }
  // The map view: where each day is, numbered, and the way into the full-screen map where the days swipe
  function mapViewHtml(M) {
    var plan = tp.mapPlan ? tp.mapPlan() : null, GEO = window.cnGeo;
    if (!plan || !plan.length || !GEO) {
      return '<div class="v1p-mapnone"><p>Set your days to see your plan on a map, one day after another.</p><button type="button" class="tp-pill tp-pill--dark" data-dc-setdays aria-haspopup="dialog">' + window.tpIcons.cal + 'Set your days</button></div>';
    }
    var pins = [];
    plan.forEach(function (st, i) {
      var r = tp.mapStep ? tp.mapStep(st, st.day) : null, a = r && (r.anchor || r.home);
      pins.push({ n: i + 1, d: st.day, kind: st.kind, ll: a && a.ll || null, name: a && a.name || '' });
    });
    // Days in the same place share one pin, named by their numbers (1, 3 to 7)
    var spots = {};
    pins.forEach(function (p) { if (!p.ll) return; var k = p.ll[0].toFixed(3) + ',' + p.ll[1].toFixed(3); (spots[k] = spots[k] || { ll: p.ll, ns: [], match: false, name: p.name }).ns.push(p.n); if (p.kind === 'match') spots[k].match = true; });
    function nums(ns) {
      var out = [], i = 0;
      while (i < ns.length) { var j = i; while (j + 1 < ns.length && ns[j + 1] === ns[j] + 1) j++; out.push(j > i + 1 ? ns[i] + ' to ' + ns[j] : j === i + 1 ? ns[i] + ', ' + ns[j] : '' + ns[i]); i = j + 1; }
      return out.join(', ');
    }
    var geo = Object.keys(spots).map(function (k) { return { ll: spots[k].ll, txt: nums(spots[k].ns), match: spots[k].match, name: spots[k].name }; });
    var B = GEO.bounds, IW = 2800, IH = 3602, h = '<div class="v1p-map">';
    if (geo.length) {
      var lats = geo.map(function (p) { return p.ll[0]; }), lons = geo.map(function (p) { return p.ll[1]; });
      var lat0 = Math.min.apply(null, lats), lat1 = Math.max.apply(null, lats), lon0 = Math.min.apply(null, lons), lon1 = Math.max.apply(null, lons);
      var spanLat = Math.max(0.16, (lat1 - lat0) * 1.5), spanLon = Math.max(0.2, (lon1 - lon0) * 1.5), cLat = (lat0 + lat1) / 2, cLon = (lon0 + lon1) / 2;
      var v = { lat1: cLat + spanLat / 2, lat0: cLat - spanLat / 2, lon0: cLon - spanLon / 2, lon1: cLon + spanLon / 2 };
      var lonW = v.lon1 - v.lon0, latH = v.lat1 - v.lat0, pxW = lonW * IW / (B.lon1 - B.lon0), pxH = latH * IH / (B.lat1 - B.lat0);
      h += '<div class="v1p-map-box" role="img" aria-label="Map of your days: ' + pins.map(function (p) { return p.n + ', ' + dayLabel(p.d); }).join('; ') + '" style="aspect-ratio:' + pxW.toFixed(0) + ' / ' + pxH.toFixed(0) + '">' +
        '<img class="v1p-map-img" src="assets/images/map/nsw-relief.webp" alt="" style="left:' + (-(v.lon0 - B.lon0) / lonW * 100) + '%;top:' + (-(B.lat1 - v.lat1) / latH * 100) + '%;width:' + ((B.lon1 - B.lon0) / lonW * 100) + '%;height:' + ((B.lat1 - B.lat0) / latH * 100) + '%">' +
        geo.map(function (p) { return '<span class="v1p-pin' + (p.match ? ' is-match' : '') + '" style="left:' + ((p.ll[1] - v.lon0) / lonW * 100) + '%;top:' + ((v.lat1 - p.ll[0]) / latH * 100) + '%">' + p.txt + (p.name ? '<small>' + esc(p.name) + '</small>' : '') + '</span>'; }).join('') + '</div>';
    }
    h += '<button type="button" class="tp-pill tp-pill--dark v1p-full" data-v1p-full aria-haspopup="dialog">Open full screen, day by day</button>' +
      '<ol class="v1p-map-days">' + pins.map(function (p) {
        return '<li><button type="button" class="v1p-map-row" data-v1p-go="' + p.d + '"><span class="v1p-pin-n" aria-hidden="true">' + p.n + '</span><span class="v1p-map-t"><b>' + esc(dayLabel(p.d)) + '</b><span>' + esc(p.kind === 'match' ? 'Match day' : p.kind === 'half' ? 'Arrival or last day' : 'Free day') + (p.name ? ' · ' + esc(p.name) : '') + '</span></span></button></li>';
      }).join('') + '</ol></div>';
    return h;
  }
  function toggleHtml() {
    return '<div class="v1p-view" role="group" aria-label="Show your plan as">' +
      ['list', 'map'].map(function (k) { return '<button type="button" class="v1p-view-b" data-v1p-view="' + k + '" aria-pressed="' + (v1view === k) + '">' + (k === 'list' ? 'List' : 'Map') + '</button>'; }).join('') + '</div>';
  }

  var G = [], M0 = null;
  function snapshot() {
    var a = document.activeElement, sel = null;
    if (a && root.contains(a)) {
      var attrs = ['v1pIdeas', 'v1pMore', 'v1pView', 'v1pGo', 'dcOpen', 'dcMatch', 'dcMove', 'dcRemove', 'dcTo', 'ticket', 'item'];
      for (var i = 0; i < attrs.length; i++) if (a.dataset[attrs[i]] !== undefined) { sel = '[data-' + attrs[i].replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }) + '="' + CSS.escape(a.dataset[attrs[i]]) + '"]'; break; }
      if (!sel && a.id) sel = '#' + CSS.escape(a.id);
    }
    return { sel: sel, strip: 0 };
  }
  function render() {
    noteAdds();
    var snap = snapshot(), M = model();
    M0 = M;
    root.hidden = !M.n;
    if (!M.n) { root.innerHTML = ''; return; }
    G = groups(M);
    var cards = G.map(function (g, i) { return cardHtml(g, i, G.length, M); });
    /* B3 (21 Nov, F-051): with no days set, one card under the last match day says what days unlock. Nothing is
       guessed: no arrival or departure day, no ideas for undated days */
    var W = window.TP_WORDS || {}, stay = '', lastM = -1;
    G.forEach(function (g, i) { if (g.days[0].ms.length) lastM = i; });
    if (!M.range && M.own && lastM > -1) stay = '<li class="v1p-stay"><section class="tp-dc-stay" aria-labelledby="tp-dc-stay-h"><p class="tp-dc-stay-p"><strong id="tp-dc-stay-h">' + esc(W.stayAfter || 'Staying after your last match?') + '</strong> ' +
      esc(W.setDaysWhy || '') + '</p><button type="button" class="tp-dc-ideas" data-dc-setdays aria-haspopup="dialog">' + window.tpIcons.cal + '<span>' + esc(W.setDays || 'Set your days') + '</span></button></section></li>';
    if (stay) cards.splice(lastM + 1, 0, stay);
    var h = (outNote ? '<p class="tp-dc-out">' + esc(outNote) + '</p>' : '') + toggleHtml();
    h += v1view === 'map' ? mapViewHtml(M) : '<ol class="v1p-days">' + cards.join('') + '</ol>';
    root.innerHTML = h;
    measure();
    if (current === null || !M.days.some(function (x) { return x.d === current; })) current = M.first;
    syncCurrent(false);
    if (snap.sel) { var f = root.querySelector(snap.sel); if (f) f.focus({ preventScroll: true }); }
    flashIds = [];
  }
  // Nothing sticks under the sheet's header any more: the timeline just scrolls. Focus keeps clear of the fixed foot.
  function measure() {
    if (!panel) return;
    var fh = foot && foot.offsetParent ? foot.offsetHeight : 0;
    panel.style.setProperty('--dc-top', '-8px');
    panel.style.scrollPaddingTop = '12px';
    panel.style.scrollPaddingBottom = (fh + 8) + 'px';
  }
  function tail() {}
  if (window.ResizeObserver && panel) new ResizeObserver(function () { measure(); }).observe(panel);

  /* ---------- Where you are: the current day ---------- */
  function cardFor(d) { var c = null; root.querySelectorAll('.tp-dc-card').forEach(function (el) { if (+el.dataset.dcA <= d && +el.dataset.dcZ >= d) c = el; }); return c; }
  function syncCurrent() {
    var card = current !== null ? cardFor(current) : null;
    root.querySelectorAll('.tp-dc-card').forEach(function (c) { if (c === card) c.setAttribute('aria-current', 'date'); else c.removeAttribute('aria-current'); });
  }
  // The day at the top of the sheet is the current one
  var raf = 0, lockT = 0;
  if (panel) panel.addEventListener('scroll', function () {
    if (raf || Date.now() < lockT) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var line = panel.getBoundingClientRect().top + 96, pick = null;
      root.querySelectorAll('.tp-dc-card').forEach(function (c) { if (!pick && c.getBoundingClientRect().bottom > line) pick = c; });
      if (pick && +pick.dataset.dcA !== current) { current = +pick.dataset.dcA; syncCurrent(); }
    });
  }, { passive: true });
  // Go to a day: its card comes to the top of the sheet. Only the sheet scrolls, never the page behind
  function goTo(d, focus, instant) {
    if (v1view !== 'list') { v1view = 'list'; render(); }
    var card = cardFor(d); if (!card) return;
    current = +card.dataset.dcA;
    lockT = Date.now() + 900;
    var beh = instant || reduce.matches ? 'auto' : 'smooth';
    if (panel) {
      var pr = panel.getBoundingClientRect(), y = card.getBoundingClientRect().top - pr.top - panel.clientTop + panel.scrollTop;
      panel.scrollTo({ top: Math.max(0, Math.min(panel.scrollHeight - panel.clientHeight, y - 16)), behavior: beh });
    }
    syncCurrent();
    if (focus) card.querySelector('.tp-dc-h').focus({ preventScroll: true });
  }
  /* Where the plan first opens in a visit (20 Nov): your days in NSW (their first day), else the earliest-dated thing
     you added, else your first NSW match, else the plan's first day. Reopening in the same visit returns to the day
     last open or last added to (22 Nov, E1, below); a ticket does not change it. The strip's current day and the card
     at the top of the sheet are set together. The first card stays at the very top of
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
  /* Reopening in the same visit (22 Nov, E1): the plan comes back to the day last added to since it was last opened,
     else to the day last open when it closed. The first open of a visit (and a reload) keeps the rule above. */
  var lastOpen = null, addedSince = null, seenIds = null;
  // Something added while it was open wins over where they were looking when they closed it
  document.getElementById('tp-phone').addEventListener('tp:tlclose', function () { lastOpen = addedSince !== null ? addedSince : current; addedSince = null; });
  function noteAdds() {
    var ids = state.added.map(function (x) { return x.id; });
    if (seenIds) state.added.forEach(function (x) { if (seenIds.indexOf(x.id) < 0) { var d = itemDay(x); if (d !== null) addedSince = d; } });
    seenIds = ids;
  }
  function openOn(at) {
    var want = at && at.note || '';
    if (want !== outNote) { outNote = want; render(); }
    tail();
    if (!M0 || !M0.n) return;
    var back = addedSince !== null && cardFor(addedSince) ? addedSince : lastOpen !== null && cardFor(lastOpen) ? lastOpen : null;
    var d = at && at.day != null && cardFor(at.day) ? at.day : back !== null ? back : openDay(M0), card = cardFor(d), first = root.querySelector('.tp-dc-card');
    if (!card) return;
    if (card === first) {
      current = +card.dataset.dcA; lockT = Date.now() + 900;
      if (panel) panel.scrollTop = 0;
      syncCurrent();
    } else goTo(d, false, true);
  }

  /* ---------- What people do on the cards ---------- */
  function item(id) { return state.added.filter(function (x) { return x.id === id; })[0]; }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !root.contains(b)) return;
    var ds = b.dataset;
    // The page registers what its Add and getting-there buttons open as it draws; make sure these are registered
    var dayEl = b.closest('.v1p-day');
    if (dayEl && b.classList.contains('tp-add') && tp.ideasInline) tp.ideasInline(+dayEl.dataset.d);
    if (ds.open && ds.open.indexOf('go:') === 0 && tp.goOne) { var gm = tp.match(ds.open.slice(3)); if (gm) tp.goOne(gm); }
    if (ds.v1pView) { v1view = ds.v1pView; render(); var vb = root.querySelector('[data-v1p-view="' + v1view + '"]'); if (vb) vb.focus({ preventScroll: true }); tp.say(v1view === 'map' ? 'Plan on a map.' : 'Plan as a list.'); return; }
    if (ds.v1pGo) { goTo(+ds.v1pGo, true); return; }
    if (ds.v1pFull !== undefined) { if (tp.openDaysMap) tp.openDaysMap(b); return; }
    if (ds.v1pIdeas) {
      var di = +ds.v1pIdeas; v1open[di] = !v1open[di]; render();
      var nb = root.querySelector('[data-v1p-ideas="' + di + '"]'); if (nb) nb.focus({ preventScroll: true });
      tp.say(v1open[di] ? 'Ideas for ' + dayLabel(di) + ' opened.' : 'Ideas closed.');
      return;
    }
    if (ds.v1pMore) { var dm = +ds.v1pMore; v1more[dm] = !v1more[dm]; render(); var mb = root.querySelector('[data-v1p-more="' + dm + '"]'); if (mb) mb.focus({ preventScroll: true }); return; }
    if (ds.dcSetdays !== undefined) { tp.openDays(b); return; }
    if (ds.dcOpen) { tp.openSheet('item:' + ds.dcOpen, b); return; }
    if (ds.dcMatch) { tp.openSheet('match:' + ds.dcMatch, b); return; }
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
  window.tpPlan = {
    render: render,
    goTo: goTo,
    openOn: openOn,
    focusCurrent: function () { var c = current !== null ? cardFor(current) : null, h = c && c.querySelector('.tp-dc-h'); if (h) h.focus({ preventScroll: true }); },
    same: function (el) {
      var ds = el.dataset || {}, k = ['v1pIdeas', 'dcOpen', 'dcMatch', 'dcMove', 'ticket'].filter(function (x) { return ds[x] !== undefined; })[0];
      var hit = k ? root.querySelector('[data-' + k.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }) + '="' + CSS.escape(ds[k]) + '"]') : null;
      // A day filled from its ideas sheet loses Add ideas: its card's heading stands in
      if (!hit && k === 'v1pIdeas') { var c = cardFor(+ds.v1pIdeas); hit = c && c.querySelector('.tp-dc-h'); }
      return hit;
    },
    addButton: function (d) { return root.querySelector('[data-v1p-ideas="' + d + '"]'); },
    // Something just added (from the ideas sheet): its line on the card is singled out for a moment
    flash: function (ids) { flashIds = ids.slice(); render(); setTimeout(function () { root.querySelectorAll('.tp-dc-it.is-flash').forEach(function (el) { el.classList.remove('is-flash'); }); }, 1600); }
  };
  if (window.ResizeObserver && head) new ResizeObserver(measure).observe(head);
  render();
})();
