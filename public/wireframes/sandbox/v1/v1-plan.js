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
    // Later-round NSW matches inside the days (teams to be decided): not a free day, and not assumed (27 Nov 2026)
    var koAll = range && tp.koOnDays ? tp.koOnDays() : [];
    var out = days.map(function (d) {
      var dm = ms.filter(function (m) { return m.day === d; }), dx = range ? extra.filter(function (m) { return m.day === d; }) : [];
      var its = items.filter(function (it) { return itemDay(it) === d; });
      // A longer trip's later days: "Hunter Valley, night 2" (the trip itself sits on its first day)
      var nights = items.filter(function (it) { var s = itemDay(it); return it.kind === 'trip' && it.nights > 0 && d > s && d <= s + it.nights; })
        .map(function (it) { return { it: it, n: d - itemDay(it) + 1 }; });
      var kos = koAll.filter(function (m) { return m.day === d; });
      var kinds = [];
      if (range && range.a !== range.z && d === range.a) kinds.push('Arrival day');
      if (dm.length) kinds.push('Match day');
      if (range && range.a !== range.z && d === range.z) kinds.push('Last day');
      if (kos.length && !dm.length) kinds.push('Later round');
      if (!kinds.length) kinds.push('Free day');
      var fi = free[d];
      return { d: d, ms: dm, kos: kos, extra: dx, its: its, nights: nights, kinds: kinds, ideas: !!(fi && !fi.filled) && !dm.length,
        // The arrival and last day keep their own card, with Add ideas, and never fold into a run of free days (E2)
        empty: !dm.length && !kos.length && !dx.length && !its.length && !nights.length && !(range && range.a !== range.z && (d === range.a || d === range.z)) };
    });
    return { range: range, own: own, days: out, n: days.length, first: days[0] };
  }
  // The cards in order: every day on its own, the empty ones included (26 Nov 2026: empty days are shown in the timeline)
  function groups(M) {
    return M.days.map(function (day) { return { run: false, key: 'd' + day.d, days: [day] }; });
  }

  /* ---------- Drawing ---------- */
  var MOVE = '<svg class="tp-ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.5 8h11M10 4.5L13.5 8 10 11.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  /* A match on the plan has a quiet Remove, the same as an idea (26 Nov 2026): the matches are inferred from the teams and
     the days, so the person takes off any they are not going to. It comes back from Also on in NSW. A match to watch
     only, in NSW but not in the plan, has no Remove: it is not on the plan. */
  function matchHtml(m, watchOnly) {
    var f = m.f, where = f.a ? f.v + ', ' + f.a + ' (interstate)' : f.v + ', ' + f.p;
    return '<li class="tp-dc-m' + (f.a ? ' is-away' : '') + '" data-mkey="' + esc(m.key) + '">' + flags(f) +
      '<div class="tp-dc-m-b"><button type="button" class="tp-dc-name" data-dc-match="' + esc(m.key) + '" aria-haspopup="dialog">' + esc(mName(f)) + '</button>' +
      '<span class="tp-dc-time">' + (f.k ? esc(f.k) + ' Sydney time' : TBC) + '</span>' +
      (f.a ? '' : '<span class="tp-tag tp-tag--inline tp-dc-nsw">In NSW</span>') +
      '<span class="tp-dc-where">' + esc(where) + '</span>' +
      (watchOnly ? '<span class="tp-dc-tk">To watch in NSW, not in your plan</span>'
        : '<div class="tp-dc-acts"><button type="button" class="tp-dc-act" data-dc-mrm="' + esc(m.key) + '">' + window.tpIcons.remove + '<span>Remove</span><span class="visually-hidden">: ' + esc(mName(f)) + ', ' + esc(f.d) + '</span></button></div>') + '</div></li>';
  }
  // A later round on the day, teams to be decided: one line with Add, nothing assumed (27 Nov 2026)
  function koHtml(m) {
    var f = m.f;
    return '<li class="tp-dc-m v1p-ko" data-mkey="' + esc(m.key) + '"><div class="tp-dc-m-b"><span class="tp-dc-name v1p-ko-n">' + esc(tp.koName(f)) + ' is on \u00b7 teams to be decided</span>' +
      '<span class="tp-dc-time">' + (f.k ? esc(f.k) + ' Sydney time' : TBC) + '</span><span class="tp-dc-where">' + esc(f.v + ', ' + f.p) + '</span>' +
      '<div class="tp-dc-acts">' + tp.koAddHtml(m) + '</div></div></li>';
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
    var kick = (day.ms[0] || {}).f;
    kick = kick && kick.k;
    var before = [], after = [], rest = [], screens = [];
    day.its.forEach(function (it) {
      if (it.kind === 'screening') { screens.push(it); return; }
      var s = day.ms.length && tp.itemSlot ? tp.itemSlot(it, kick) : null;
      (s === 'before' ? before : s === 'after' ? after : rest).push(it);
    });
    var li = before.map(function (it) { return itemHtml(it, day); })
      .concat(day.ms.map(function (m) { return matchHtml(m, false); }), (day.kos || []).map(koHtml), day.extra.map(function (m) { return matchHtml(m, true); }))
      .concat(screens.concat(after, rest).map(function (it) { return itemHtml(it, day); }))
      .concat(day.nights.map(function (x) { return '<li class="tp-dc-night"><span class="ph-img tp-dc-img"' + tp.imgKey(x.it.title) + ' aria-hidden="true"></span><div class="tp-dc-it-b"><span class="tp-dc-nm">' + esc(x.it.title) + ', night ' + x.n + '</span><span class="tp-dc-type">' + esc(x.it.kindLabel || 'Longer trip') + '</span></div></li>'; }));
    var h = '';
    // Getting there and back, on the match day itself: one line, then the full details (26 Nov 2026)
    var nm = day.ms.filter(function (m) { return !m.f.a; });
    if (nm.length && tp.goOne) h += '<div class="v1p-go">' + tp.goOne(nm[0]) + '</div>';
    if (nm.length && tp.fanNear) h += '<div class="v1p-fz">' + tp.fanNear(nm[0].f) + '</div>';
    h += li.length ? '<ul class="tp-dc-list">' + li.join('') + '</ul>' : '';
    // Ideas for a day with something on it already (room for one more): a quiet button, the ideas open below it
    if (day.ideas && li.length) h += '<div class="v1p-more-acts">' + ideasToggle(day, false) + '</div>';
    if (day.ideas && li.length && v1open[day.d]) h += ideasHtml(day);
    return h;
  }
  function cardHtml(g, idx, total, M) {
    var day = g.days[0], d = day.d, id = 'tp-dc-' + g.key;
    var has = day.ms.length || day.its.length || day.nights.length || day.extra.length || (day.kos || []).length;
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
  /* The map (26 Nov 2026): each day's pin sits where that day's own things are: the stadium for a match, the place of
     each idea or place added to it. A day with nothing on it has no pin, and the list names each day's real place. */
  function mapViewHtml(M) {
    var GEO = window.cnGeo;
    if (!GEO || !M.days.length) {
      return '<div class="v1p-mapnone"><p>Set your days to see your plan on a map, one day after another.</p><button type="button" class="tp-pill tp-pill--dark" data-dc-setdays aria-haspopup="dialog">' + window.tpIcons.cal + 'Set your days</button></div>';
    }
    var pins = [], rows = [];
    M.days.forEach(function (day, i) {
      var pts = [];
      day.ms.filter(function (m) { return !m.f.a; }).forEach(function (m) {
        var ll = tp.venueLL && tp.venueLL(m.f.v); if (ll) pts.push({ ll: ll, name: m.f.v + ', ' + m.f.p, match: true });
      });
      day.its.forEach(function (it) {
        var ll = tp.itemLL && tp.itemLL(it); if (ll) pts.push({ ll: ll, name: it.title + (it.place ? ', ' + it.place : ''), match: false });
      });
      pts.forEach(function (pt) { pins.push({ n: i + 1, d: day.d, kind: pt.match ? 'match' : 'item', ll: pt.ll, name: pt.name }); });
      rows.push({ n: i + 1, d: day.d, kinds: day.kinds, names: pts.map(function (x) { return x.name; }), pinned: pts.length > 0 });
    });
    if (!pins.length) {
      return '<div class="v1p-mapnone"><p>Nothing on your plan has a place on the map yet. Add a match or an idea and it appears here.</p></div>';
    }
    // Days in the same place share one pin, named by their numbers (1, 3 to 7)
    var spots = {};
    pins.forEach(function (p) { if (!p.ll) return; var k = p.ll[0].toFixed(3) + ',' + p.ll[1].toFixed(3); (spots[k] = spots[k] || { ll: p.ll, ns: [], match: false, name: p.name.split(',')[0] }).ns.push(p.n); if (p.kind === 'match') spots[k].match = true; });
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
      '<ol class="v1p-map-days">' + rows.map(function (r) {
        return '<li><button type="button" class="v1p-map-row' + (r.pinned ? '' : ' is-nopin') + '" data-v1p-go="' + r.d + '"><span class="v1p-pin-n" aria-hidden="true">' + r.n + '</span><span class="v1p-map-t"><b>' + esc(dayLabel(r.d)) + '</b><span>' + esc(r.kinds.join(' · ')) + (r.pinned ? ' · ' + esc(r.names.join(' and ')) : ' · nothing planned, so no pin') + '</span></span></button></li>';
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
      var attrs = ['z', 'zPage', 'v1pIdeas', 'v1pMore', 'v1pView', 'v1pGo', 'dcOpen', 'dcMatch', 'dcMove', 'dcRemove', 'dcTo', 'dcMrm', 'item'];
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
    if (!M.n) { root.innerHTML = ''; shell = null; return; }
    G = groups(M);
    if (!shell || !root.contains(shell)) buildShell();
    outEl.innerHTML = outNote ? '<p class="tp-dc-out">' + esc(outNote) + '</p>' : '';
    track.innerHTML = colsHtml(M);
    sumEl.innerHTML = sumHtml(M);
    applyZoom(zoom, true);
    measure();
    syncSel();
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

  /* ---------- The zoomable timeline (27 Nov 2026) ----------
     The open plan is the overview: the bar's strip grown, one mark a day across all 44 days, with a slider to zoom. Which
     days are yours is a tinted band (your days); a day outside it is dimmed and never reads as a gap; an empty day inside
     it is a dotted ring, the same empty state as the page. The full plan lives on the page. Tapping a day shows its
     summary under the timeline and never moves the page; Go to this day on the plan page says that it does. */
  var NDAYS = 44, PAD = 16, W1 = 132, ST_MID = 34, ST_CLOSE = 67;
  var STAGES = ['Whole trip, marks only', 'Day labels and match markers', 'Day details, with flags and pictures'];
  var shell = null, outEl = null, view = null, track = null, sumEl = null, rangeEl = null, zoomEl = null;
  var zoom = 0, zTarget = 0, zAnim = null, zAnchor, zRaf = 0, sel = null;
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function stageOf(z) { return z < ST_MID ? 0 : z < ST_CLOSE ? 1 : 2; }
  function buildShell() {
    root.innerHTML = '<div class="v1z-out"></div><section class="v1z" id="v1z" aria-label="Your days">' +
      '<div class="v1z-view" id="v1z-view"><div class="v1z-track" id="v1z-track" role="group" aria-label="Your days, 1 October to 13 November. Left and right arrows move between days."></div></div>' +
      '<div class="v1z-zoom"><span class="v1z-wedge" aria-hidden="true"></span>' +
      '<input type="range" class="v1z-range" id="v1z-range" min="0" max="100" step="1" value="0" aria-label="Zoom the timeline" aria-valuetext="' + STAGES[0] + '"></div>' +
      '</section><div class="v1z-sum" id="v1z-sum"></div>';
    shell = root.querySelector('.v1z'); outEl = root.querySelector('.v1z-out'); view = root.querySelector('#v1z-view'); track = root.querySelector('#v1z-track');
    sumEl = root.querySelector('#v1z-sum'); rangeEl = root.querySelector('#v1z-range'); zoomEl = root.querySelector('.v1z-zoom');
    rangeEl.value = zTarget; syncRange();
    view.addEventListener('scroll', edges, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(function () { applyZoom(zoom, true); }).observe(view);
    // Zooming in from the whole trip, the centre is the chosen day, or the middle of your days, so there is something to look at
    rangeEl.addEventListener('input', function () {
      var R = M0 && M0.range, c = sel !== null ? sel : R ? (R.a + R.z) / 2 : undefined;
      zAnchor = c === undefined ? undefined : (c + .5) / NDAYS;
      zoomTo(+rangeEl.value);
    });
  }
  function syncRange() {
    if (!rangeEl) return;
    rangeEl.setAttribute('aria-valuetext', STAGES[stageOf(zTarget)]);
    zoomEl.style.setProperty('--zp', zTarget + '%');
  }
  // The column width: the whole trip fits at 0, a day is W1 wide at 100; geometric, so equal slider steps are equal zoom factors
  function colW(z, vw) { var w0 = Math.max(4, (vw - 2 * PAD) / NDAYS); return w0 * Math.pow(W1 / w0, z / 100); }
  // Sets the zoom; the view's centre stays on the same day (or centreFrac, a day's place along the trip, when given)
  function applyZoom(z, keep, centreFrac) {
    if (!view) return;
    var vw = view.clientWidth; if (!vw) return;
    var old = parseFloat(shell.style.getPropertyValue('--cw')) || 0, cf = centreFrac;
    if (cf === undefined) {
      // Between the whole trip and about a third of the way in, the centre glides: toward the anchor (the chosen day, or the
      // middle of your days) as the zoom grows, and back toward the middle of the trip as it shrinks. Past that the centre
      // is simply wherever it was, so the eye keeps what it is following.
      var qn = z >= 30 ? 1 : (z / 30) * (z / 30) * (3 - 2 * z / 30), qp = zoom >= 30 ? 1 : (zoom / 30) * (zoom / 30) * (3 - 2 * zoom / 30);
      var here = old ? (view.scrollLeft + vw / 2 - PAD) / (NDAYS * old) : .5;
      if (zAnchor !== undefined && qp < 1 && z >= zoom) cf = .5 + (zAnchor - .5) * qn;
      else if (z < zoom && qn < qp && qp > 0) cf = .5 + (here - .5) * (qn / qp);
      else cf = here;
    }
    var cw = colW(z, vw), inner = NDAYS * cw + 2 * PAD;
    zoom = z;
    shell.style.setProperty('--cw', cw.toFixed(3) + 'px');
    shell.style.setProperty('--s1', clamp01((z - 28) / 12).toFixed(3));
    shell.style.setProperty('--s2', clamp01((z - 61) / 12).toFixed(3));
    shell.classList.toggle('is-w3', cw >= 40); shell.classList.toggle('is-w4', cw >= 70);
    track.style.width = inner + 'px';
    view.scrollLeft = Math.max(0, Math.min(inner - vw, cf * NDAYS * cw + PAD - vw / 2));
    edges();
  }
  function edges() {
    if (!view) return;
    var max = view.scrollWidth - view.clientWidth;
    shell.classList.toggle('can-l', view.scrollLeft > 2);
    shell.classList.toggle('can-r', view.scrollLeft < max - 2);
  }
  // Moves toward a zoom: small steps (a drag) follow the thumb exactly; a jump (a key, a tap on the track, opening on a day)
  // glides on an even ease over a time that grows with the distance, the centre held or moved with it. Reduced motion, or
  // instant, sets it in place.
  function centreNow() { var vw = view.clientWidth, cw = parseFloat(shell.style.getPropertyValue('--cw')) || 0; return cw ? (view.scrollLeft + vw / 2 - PAD) / (NDAYS * cw) : .5; }
  // The slider value at which your days (first to last) fill the view with a day either side; 0 when they are most of the trip
  function fitZoom(a, z) {
    var vw = view && view.clientWidth; if (!vw) return null;
    var w0 = Math.max(4, (vw - 2 * PAD) / NDAYS), want = (vw - 2 * PAD) / (z - a + 1 + 2);
    return Math.max(0, Math.min(100, 100 * Math.log(want / w0) / Math.log(W1 / w0)));
  }
  function zoomTo(t, day, instant) {
    zTarget = Math.max(0, Math.min(100, t));
    if (rangeEl) rangeEl.value = zTarget;
    syncRange();
    var cTo = day != null ? (day + .5) / NDAYS : undefined, dist = Math.abs(zTarget - zoom);
    if (instant || reduce.matches || (dist <= 6 && cTo === undefined)) { zAnim = null; cancelAnimationFrame(zRaf); zRaf = 0; applyZoom(zTarget, false, cTo); return; }
    zAnim = { from: zoom, to: zTarget, cFrom: centreNow(), cTo: cTo, t0: performance.now(), dur: Math.min(420, 140 + dist * 2.8) };
    if (!zRaf) zRaf = requestAnimationFrame(zStep);
  }
  function zStep(now) {
    zRaf = 0;
    var a = zAnim; if (!a) return;
    var p = Math.max(0, Math.min(1, (now - a.t0) / a.dur)), e = p * p * (3 - 2 * p);
    applyZoom(a.from + (a.to - a.from) * e, false, a.cTo === undefined ? undefined : a.cFrom + (a.cTo - a.cFrom) * e);
    if (p < 1) zRaf = requestAnimationFrame(zStep); else zAnim = null;
  }
  function thingsOf(day) {
    var out = [], cl = tp.matchClash ? tp.matchClash(day.d) : null;
    day.ms.forEach(function (m) { out.push({ k: m.f.a ? 'away' : 'nsw', f: m.f, name: mName(m.f) + (m.f.a ? ' (in ' + m.f.a + ')' : ''), clash: !!(cl && cl.ring) }); });
    (day.kos || []).forEach(function (m) { out.push({ k: 'tbd', f: m.f, name: mName(m.f) }); });
    day.extra.forEach(function (m) { out.push({ k: 'watch', f: m.f, name: mName(m.f) + ', to watch in NSW' }); });
    day.its.forEach(function (it) { out.push({ k: 'item', it: it, name: it.title }); });
    day.nights.forEach(function (x) { out.push({ k: 'night', it: x.it, name: x.it.title + ', night ' + x.n }); });
    return out;
  }
  function detailHtml(t) {
    if (t.it) return '<span class="v1z-t v1z-t--i"><span class="ph-img v1z-th"' + tp.imgKey(t.it.title) + '></span><small>' + esc(t.it.title) + '</small></span>';
    var f = t.f, tm = f.t ? f.t.split(' v ') : [], fl = tm.length === 2 && tp.flag(tm[0]) && tp.flag(tm[1]);
    return '<span class="v1z-t v1z-t--' + t.k + '">' + (fl ? '<span class="tp-dc-flags v1z-fl">' + tp.flag(tm[0]) + tp.flag(tm[1]) + '</span>' : '<span class="v1z-q">?</span>') +
      '<small>' + (f.k ? esc(f.k) : 'Time to be confirmed') + (t.k === 'watch' ? ', to watch' : '') + '</small></span>';
  }
  function colHtml(d, day, R) {
    var ins = R ? d >= R.a && d <= R.z : !!day, th = day ? thingsOf(day) : [], x = dateOf(d);
    var tab = sel !== null ? d === sel : R ? d === R.a : d === 0;
    var cls = 'v1z-d' + (ins ? ' is-in' : ' is-out') + (th.length ? ' is-has' : ins ? ' is-empty' : '') + (sel === d ? ' is-sel' : '');
    var label = dayLabel(d) + (ins ? '' : ', outside your days') + (day && ins ? ', ' + day.kinds.join(', ') : '') + (th.length ? ': ' + th.map(function (t) { return t.name; }).join('; ') : ins ? ': nothing planned yet' : '');
    var marks = th.length ? th.slice(0, 4).map(function (t) { return '<i class="v1z-m v1z-m--' + t.k + (t.clash ? ' is-clash' : '') + '"></i>'; }).join('') + (th.length > 4 ? '<i class="v1z-m v1z-m--more"></i>' : '')
      : ins ? '<i class="v1z-m v1z-m--empty"></i>' : '<i class="v1z-m v1z-m--out"></i>';
    var det = th.length ? th.slice(0, 2).map(detailHtml).join('') + (th.length > 2 ? '<span class="v1z-t v1z-t--more"><small>+' + (th.length - 2) + ' more</small></span>' : '')
      : ins ? '<span class="v1z-t v1z-t--e"><small>Nothing yet</small></span>' : '';
    return '<button type="button" class="' + cls + '" data-z="' + d + '" tabindex="' + (tab ? 0 : -1) + '" aria-pressed="' + (sel === d) + '" aria-label="' + esc(label) + '">' +
      '<span class="v1z-lbl" aria-hidden="true"><b>' + x.getUTCDate() + '</b><small><span class="v1z-wd1">' + 'SMTWTFS'.charAt(x.getUTCDay()) + '</span><span class="v1z-wd3">' + WD[x.getUTCDay()] + '</span></small></span>' +
      '<span class="v1z-mks" aria-hidden="true">' + marks + '</span><span class="v1z-det" aria-hidden="true">' + det + '</span></button>';
  }
  function colsHtml(M) {
    var byD = {}; M.days.forEach(function (x) { byD[x.d] = x; });
    var R = M.range;
    var h = '<span class="v1z-mo" aria-hidden="true"><span class="v1z-mon" style="--a:0;--n:31"><b>October</b></span><span class="v1z-mon" style="--a:31;--n:13"><b>November</b></span></span>';
    if (R) h += '<span class="v1z-band" aria-hidden="true" style="--a:' + R.a + ';--n:' + (R.z - R.a + 1) + '"></span>';
    for (var d = 0; d < NDAYS; d++) h += colHtml(d, byD[d], R);
    return h;
  }
  // The selected day, under the timeline: the day's own card, without the rail or Move and Remove (an item's own sheet has those)
  function sumHtml(M) {
    if (sel === null) return '<p class="v1z-hint">Tap a day for what is on it. Zoom in for more detail.</p>';
    var day = M.days.filter(function (x) { return x.d === sel; })[0], R = M.range;
    if (!day) {
      return '<div class="v1z-out-day"><h4 class="tp-dc-h" id="v1z-sum-h" tabindex="-1">' + esc(dayLabel(sel)) + ' · Outside your days</h4>' +
        '<p>' + (R ? 'Your days are ' + esc(spanLabel(R.a, R.z)) + '.' : 'Your days are not set yet.') + '</p>' +
        '<button type="button" class="tp-pill" data-dc-setdays aria-haspopup="dialog">' + window.tpIcons.cal + '<span>Change your days</span></button></div>';
    }
    return '<ol class="v1p-days v1z-one">' + cardHtml({ run: false, key: 'd' + day.d, days: [day] }, 0, 1, M) + '</ol>' +
      '<button type="button" class="tp-link v1z-page" data-z-page="' + day.d + '">Go to this day on the plan page</button>';
  }
  function syncSel() {
    if (!track) return;
    track.querySelectorAll('.v1z-d').forEach(function (b) {
      var on = +b.dataset.z === sel;
      b.classList.toggle('is-sel', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var tabD = sel !== null ? sel : M0 && M0.range ? M0.range.a : 0, tb = track.querySelector('[data-z="' + tabD + '"]');
    if (tb) { track.querySelectorAll('.v1z-d').forEach(function (b) { b.tabIndex = -1; }); tb.tabIndex = 0; }
    current = sel;
  }
  function select(d, focus) {
    sel = d; current = d;
    sumEl.innerHTML = M0 ? sumHtml(M0) : '';
    syncSel();
    if (d !== null) { var cb = track.querySelector('[data-z="' + d + '"]'); if (cb) keepIn(cb, true); tp.say(dayLabel(d) + ', details are under the timeline.'); }
    if (focus && d !== null) { var b = track.querySelector('[data-z="' + d + '"]'); if (b) b.focus({ preventScroll: true }); }
  }
  // Keeps a day that has focus inside the view, scrolling the timeline only
  function keepIn(el, smooth) {
    var vr = view.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (r.left >= vr.left + PAD + 24 && r.right <= vr.right - PAD - 24) return; // clear of the edges and their fade
    view.scrollTo({ left: Math.max(0, view.scrollLeft + (r.left + r.width / 2) - (vr.left + vr.width / 2)), behavior: smooth && !reduce.matches ? 'smooth' : 'auto' });
  }
  function cardFor(d) { return root.querySelector('.tp-dc-card[data-dc-a="' + d + '"]'); }
  // Go to a day: it is selected and the timeline comes to it (zoomed in if it was zoomed out). Only the sheet moves, never the page
  function goTo(d, focus, instant) {
    if (!shell) return;
    d = Math.max(0, Math.min(NDAYS - 1, d));
    if (zTarget < ST_CLOSE) zoomTo(78, d, instant);
    else { var cw = parseFloat(shell.style.getPropertyValue('--cw')) || 1; view.scrollTo({ left: Math.max(0, d * cw + cw / 2 + PAD - view.clientWidth / 2), behavior: instant || reduce.matches ? 'auto' : 'smooth' }); }
    select(d, focus);
  }
  /* Opening: on a day the page asked for (See your match day), zoomed in on that day with its summary; otherwise the whole
     trip, zoomed all the way out, so the first thing seen is which days are empty. Reopening starts the same way. */
  var outNote = '';
  var lastOpen = null, addedSince = null, seenIds = null;
  function noteAdds() {
    var ids = state.added.map(function (x) { return x.id; });
    if (seenIds) state.added.forEach(function (x) { if (seenIds.indexOf(x.id) < 0) { var d = itemDay(x); if (d !== null) addedSince = d; } });
    seenIds = ids;
  }
  function openOn(at) {
    outNote = at && at.note || '';
    render();
    if (!M0 || !M0.n) return;
    var d = at && at.day != null ? Math.max(0, Math.min(NDAYS - 1, at.day)) : null;
    sel = d; current = d; zAnchor = undefined;
    // On open the timeline fits your days, a day either side, so the first thing seen is your trip. Here for all 44 days is
    // the widest view, the whole of it at once. Opened on a day: zoomed in on that day
    var R = M0.range, fit = d === null && R ? fitZoom(R.a, R.z) : null;
    if (fit) zoomTo(fit, (R.a + R.z) / 2, true); else zoomTo(d === null ? 0 : 82, d === null ? undefined : d, true);
    sumEl.innerHTML = sumHtml(M0);
    syncSel();
  }
  // Go to this day on the plan page: the one control here that moves the page, and its label says so (check 8)
  function pageDay(d) {
    var third = document.getElementById('tp-third'); if (!third) return;
    var best = null, bn = -1;
    third.querySelectorAll('[data-blk]').forEach(function (el) {
      var m = /^[a-z]+(\d+)$/.exec(el.getAttribute('data-blk')); if (!m) return;
      var n = +m[1]; if (n <= d && n > bn) { bn = n; best = el; }
    });
    if (best) tp.goTo(best);
  }
  root.addEventListener('keydown', function (e) {
    var b = e.target.closest && e.target.closest('.v1z-d'); if (!b) return;
    var i = +b.dataset.z, n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? NDAYS - 1 : null;
    if (n === null || n < 0 || n >= NDAYS) return;
    e.preventDefault();
    var nb = track.querySelector('[data-z="' + n + '"]'); if (!nb) return;
    b.tabIndex = -1; nb.tabIndex = 0; nb.focus({ preventScroll: true }); keepIn(nb);
  });

  /* ---------- What people do on the cards ---------- */
  function item(id) { return state.added.filter(function (x) { return x.id === id; })[0]; }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !root.contains(b)) return;
    var ds = b.dataset;
    // The page registers what its Add and getting-there buttons open as it draws; make sure these are registered
    var dayEl = b.closest('.v1p-day');
    if (dayEl && b.classList.contains('tp-add') && tp.ideasInline) tp.ideasInline(+dayEl.dataset.d);
    if (ds.open && ds.open.indexOf('go:') === 0 && tp.goOne) { var gm = tp.match(ds.open.slice(3)); if (gm) tp.goOne(gm); }
    if (ds.z !== undefined) {
      var zd = +ds.z, R2 = M0 && M0.range;
      // A spare day (empty, inside your days): its ideas open in the sheet stacked over the plan, as Add ideas does on its card
      var spare = b.classList.contains('is-empty') && R2 && zd >= R2.a && zd <= R2.z && window.tpFreeApi && (tp.freeDays ? tp.freeDays() : []).some(function (x) { return x.d === zd && !x.filled; });
      if (spare) { window.tpFreeApi.toggle(zd, b); return; }
      select(sel === zd ? null : zd, false); return;
    }
    if (ds.zPage !== undefined) { closeWide(false); pageDay(+ds.zPage); return; } // the page is behind the full width timeline: it closes first
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
    if (ds.dcMrm) {
      var mt = tp.match(ds.dcMrm); if (!mt) return;
      var mli = b.closest('.tp-dc-m'), mnext = mli && (mli.nextElementSibling || mli.previousElementSibling), mnk = mnext && mnext.dataset.mkey, mcard = b.closest('.tp-dc-card'), mcid = mcard && mcard.id;
      tp.dropMatch(ds.dcMrm);
      tp.say(mName(mt.f) + ' removed from your plan.');
      render();
      var mf = mnk && root.querySelector('[data-dc-match="' + CSS.escape(mnk) + '"]');
      if (!mf && mcid) mf = root.querySelector('#' + CSS.escape(mcid) + '-h');
      if (mf) mf.focus({ preventScroll: true });
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

  /* ---------- The timeline at full width (desktop, 27 Nov 2026) ----------
     Wide screens get a button on the plan's heading that lends the timeline (and the chosen day's summary) to a modal
     across the window: more days at once, with details. A cross top right, Escape, or a tap on the dark area closes it,
     and focus goes back to the button. A sheet opened from it (a spare day's ideas) stacks over it. */
  var phoneEl = document.getElementById('tp-phone'), wideMq = matchMedia('(min-width: 1024px)'), wm = null, wmHome = null, wmNext = null, wmOpener = null;
  var EXPAND = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5L9 7M2.5 13.5L7 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  if (head && phoneEl) {
    var ex = document.createElement('button');
    ex.type = 'button'; ex.className = 'v1z-expand'; ex.id = 'v1z-expand';
    ex.setAttribute('aria-label', 'Open the timeline full width'); ex.title = 'Open the timeline full width'; ex.setAttribute('aria-haspopup', 'dialog');
    ex.innerHTML = EXPAND;
    head.insertBefore(ex, head.children[1] || null);
    ex.addEventListener('click', function () { openWide(ex); });
  }
  function wideOk() { return wideMq.matches && document.documentElement.classList.contains('pv-device'); }
  function buildWide() {
    wm = document.createElement('div');
    wm.className = 'v1z-wide'; wm.id = 'v1z-wide'; wm.hidden = true;
    wm.innerHTML = '<div class="v1z-wide-scrim" data-wide-close></div>' +
      '<div class="v1z-wide-box" role="dialog" aria-modal="true" aria-labelledby="v1z-wide-h"><div class="v1z-wide-head"><h3 id="v1z-wide-h" tabindex="-1">Your plan</h3>' +
      '<button type="button" class="cn-close v1z-wide-x" data-wide-close aria-label="Close the full width timeline"><svg class="cn-x" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>' +
      '<div class="v1z-wide-body"></div></div>';
    phoneEl.appendChild(wm);
    wm.addEventListener('click', function (e) { if (e.target.closest('[data-wide-close]')) closeWide(true); });
  }
  // The width changed: with no day chosen, your days fill the view again; with one, the view stays where it is
  function refit() {
    var R = M0 && M0.range, f = R && sel === null ? fitZoom(R.a, R.z) : null;
    if (f !== null && f !== undefined) zoomTo(f, (R.a + R.z) / 2, true); else applyZoom(zoom, true);
  }
  function openWide(opener) {
    if (!wideOk() || !M0 || !M0.n) return;
    if (!wm) buildWide();
    if (!wm.hidden) return;
    wmOpener = opener || null; wmHome = root.parentNode; wmNext = root.nextSibling;
    wm.querySelector('.v1z-wide-body').appendChild(root);
    wm.hidden = false;
    var bd = phoneEl.querySelector('.cn-body'), tl = document.getElementById('tp-tl');
    wm._was = [[bd, bd && bd.inert], [tl, tl && tl.inert]]; wm._was.forEach(function (p) { if (p[0]) p[0].inert = true; });
    if (!reduce.matches && wm.animate) { wm.querySelector('.v1z-wide-box').animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.2, .8, .2, 1)' }); wm.querySelector('.v1z-wide-scrim').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' }); }
    refit();
    wm.querySelector('#v1z-wide-h').focus({ preventScroll: true });
    tp.say('Your plan, full width timeline opened.');
  }
  function closeWide(focusBack) {
    if (!wm || wm.hidden) return;
    var back = wmOpener, was = wm._was || [];
    wm.hidden = true;
    was.forEach(function (p) { if (p[0]) p[0].inert = p[1]; });
    if (wmHome) wmHome.insertBefore(root, wmNext && wmNext.parentNode === wmHome ? wmNext : null);
    refit();
    if (focusBack !== false && back && back.isConnected) back.focus({ preventScroll: true });
    if (focusBack !== false) tp.say('Back to Your plan.');
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !wm || wm.hidden || e.defaultPrevented) return;
    if (phoneEl.querySelector('.cn-pp.tp-pm:not([hidden]), .tp-stack.is-open')) return; // a sheet over it goes back first
    closeWide(true);
  });
  wideMq.addEventListener('change', function () { if (!wideOk()) closeWide(false); });

  window.tpPlan = {
    render: render,
    goTo: goTo,
    openOn: openOn,
    focusCurrent: function () { var b = sel !== null && track ? track.querySelector('[data-z="' + sel + '"]') : null; if (b) b.focus({ preventScroll: true }); },
    same: function (el) {
      var ds = el.dataset || {}, k = ['v1pIdeas', 'dcOpen', 'dcMatch', 'dcMove', 'dcMrm', 'z'].filter(function (x) { return ds[x] !== undefined; })[0];
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
