/* Concepts: Pick your team (prototype-pick-your-team.html).
   A fanned hand of cards: the 24 teams, alphabetical, then "Here for the rugby". Drag or swipe the fan sideways,
   or use the arrow keys; tap or press Space to pick a card (as many as you like). Picking is the action: there is no
   button to press after it. A pick takes effect at once (Your matches, the timeline, Where to watch and Suits your 3rd
   half all follow it) and says what it did: the caption under the fan, the team's matches flying into the timeline
   bar, and the Your matches tab count. Unpicking reverses it. The picker stays on screen throughout.
   Data: window.cnFixtures (concepts-fixtures.js), the 36 pool matches and the knockouts in NSW, kick-offs in Sydney
   time. Nothing else is added: no flags, no community or home-country times, no ticket links.
   Jobs covered (docs/jtbd-itinerary.md): T1 one team, T5 and T7 more than one, T8 and T9 no team, T2 and T12
   tickets, T3 NSW or interstate, T4 knockouts, T6 a shared match noted on both cards, T15 saved on this device,
   T16 skip (to the dates question), T12 a single match from All matches, and Clear all to start again. The choice is kept in this browser under tp-pick-v1; ?reset clears it. */
(function () {
  'use strict';
  var root = document.getElementById('tp-pick');
  var FIX = window.cnFixtures;
  if (!root || !Array.isArray(FIX)) return;

  var fan = document.getElementById('tp-fan');
  var caption = document.getElementById('tp-fan-caption');
  var chosenEl = document.getElementById('tp-chosen');
  var tabsEl = document.getElementById('tp-tabs'), tabYours = document.getElementById('tp-tab-yours'), tabAll = document.getElementById('tp-tab-all');
  var clearBtn = document.getElementById('tp-clear');
  var picker = document.getElementById('tp-picker');
  var results = document.getElementById('tp-results');
  var deck = document.getElementById('tp-deck');
  var sum = document.getElementById('tp-results-sum');
  var live = document.getElementById('tp-live');
  var body = document.querySelector('#tp-phone .cn-body');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var EASE = 'cubic-bezier(.16, 1, .3, 1)';

  /* ---------- Data ---------- */
  var CODE = { 'Argentina': 'ARG', 'Australia': 'AUS', 'Canada': 'CAN', 'Chile': 'CHI', 'England': 'ENG', 'Fiji': 'FIJ', 'France': 'FRA', 'Georgia': 'GEO', 'Hong Kong China': 'HKG', 'Ireland': 'IRE', 'Italy': 'ITA', 'Japan': 'JPN', 'New Zealand': 'NZL', 'Portugal': 'POR', 'Romania': 'ROU', 'Samoa': 'SAM', 'Scotland': 'SCO', 'South Africa': 'RSA', 'Spain': 'ESP', 'Tonga': 'TGA', 'USA': 'USA', 'Uruguay': 'URU', 'Wales': 'WAL', 'Zimbabwe': 'ZIM' };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function ord(d) { var p = d.split(' '); return MON.indexOf(p[2]) * 100 + +p[1]; }
  function idOf(f) { return f.d + '|' + f.t; }
  var pool = FIX.filter(function (f) { return f.t && /^Pool /.test(f.s); }).sort(function (a, b) { return ord(a.d) - ord(b.d) || (a.k || '').localeCompare(b.k || ''); });
  var TEAMS = {};
  pool.forEach(function (f) {
    f.t.split(' v ').forEach(function (n) {
      var t = TEAMS[n] = TEAMS[n] || { name: n, code: CODE[n] || n.slice(0, 3).toUpperCase(), pool: f.s, matches: [] };
      t.matches.push(f);
    });
  });
  // Flags for the all matches list. England, Scotland and Wales use their own flags; the rest are country flags.
  var FLAG = { 'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Canada': '🇨🇦', 'Chile': '🇨🇱', 'England': '🏴\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', 'Fiji': '🇫🇯', 'France': '🇫🇷', 'Georgia': '🇬🇪', 'Hong Kong China': '🇭🇰', 'Ireland': '🇮🇪', 'Italy': '🇮🇹', 'Japan': '🇯🇵', 'New Zealand': '🇳🇿', 'Portugal': '🇵🇹', 'Romania': '🇷🇴', 'Samoa': '🇼🇸', 'Scotland': '🏴\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}', 'South Africa': '🇿🇦', 'Spain': '🇪🇸', 'Tonga': '🇹🇴', 'USA': '🇺🇸', 'Uruguay': '🇺🇾', 'Wales': '🏴\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}', 'Zimbabwe': '🇿🇼' };
  var names = Object.keys(TEAMS).sort();
  names.forEach(function (n) { TEAMS[n].nsw = TEAMS[n].matches.filter(function (f) { return !f.a; }).length; });
  var nswPool = pool.filter(function (f) { return !f.a; });
  var nswKo = FIX.filter(function (f) { return !/^Pool /.test(f.s) && !f.a; });
  /* One counting rule for every count of matches on the page (summary, card, bar, plan): pool matches and knockouts
     are named apart whenever both are in the count, for example "9 pool matches + 8 knockouts". A team's knockouts are
     not known until the pools finish, so a team's count is pool matches only. short: the bar's tighter form
     ("9 pool + 8 knockouts"). num: wraps each number (the plan sets them bold). */
  function countPhrase(fs, opts) {
    opts = opts || {};
    var p = fs.filter(function (f) { return /^Pool /.test(f.s); }).length, k = fs.length - p, n = opts.num || String;
    var P = n(p) + ' pool ' + (p === 1 ? 'match' : 'matches'), K = n(k) + ' ' + (k === 1 ? 'knockout' : 'knockouts');
    if (p && k) return opts.short ? n(p) + ' pool + ' + K : P + ' + ' + K;
    return p ? P : k ? K : 'No matches';
  }
  // The 25th card: no team, every match in NSW
  var RUGBY = { name: 'Here for the rugby', code: 'ALL', rugby: true };
  var CARDS = names.map(function (n) { return TEAMS[n]; }).concat([RUGBY]);
  var R16 = FIX.filter(function (f) { return /^Round of 16/.test(f.s); });

  /* ---------- State, kept in this browser ---------- */
  var KEY = 'tp-pick-v1';
  // added: things put on the timeline (screenings, the village, products); trip: the one optional question's answer
  // tab: which of Your matches and All matches is chosen once a team is picked (kept, like everything else, on reload)
  var state = { picked: [], tickets: [], tab: 'yours', added: [], trip: null };
  try {
    if (/[?&]reset\b/.test(location.search)) localStorage.removeItem(KEY);
    var rec = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (rec && Array.isArray(rec.picked)) {
      state.picked = rec.picked.filter(function (n) { return n === RUGBY.name || TEAMS[n]; });
      state.tickets = Array.isArray(rec.tickets) ? rec.tickets.filter(function (x) { return typeof x === 'string'; }) : [];
      if (rec.tab === 'all') state.tab = 'all';
    }
    if (rec && Array.isArray(rec.added)) state.added = rec.added.filter(function (x) { return x && typeof x.id === 'string' && typeof x.day === 'string'; });
    if (rec && rec.trip && /^(visiting|local|unsure)$/.test(rec.trip.mode)) state.trip = rec.trip;
  } catch (e) { /* storage blocked: the picker still works, it just is not kept */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  // Tells the annotation layer (prototype-pick-your-team.html) that what is on screen has changed
  // Tells the annotation layer that what is on screen has changed
  function notesOnly() { document.getElementById('tp-phone').dispatchEvent(new CustomEvent('tp:state')); }
  // Picks, tickets or the screen changed: the timeline follows, then the annotations
  var tlReady = false;
  function changed() { if (tlReady) { tlUpdate(); syncBar(); markRows(); } notesOnly(); }
  // All matches: a row whose match was added on its own says so
  function markRows() {
    var on = {};
    state.added.forEach(function (it) { if (it.kind === 'match') on[it.key] = true; });
    document.querySelectorAll('#tp-all-scroll .tp-all-m').forEach(function (li) { li.classList.toggle('is-added', !!on[li.dataset.key]); });
  }
  function say(msg) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 30); }
  function isPicked(c) { return state.picked.indexOf(c.name) > -1; }
  // A team with no pool match in NSW is not a dead end: its fans can watch in NSW and go to the NSW matches
  function lowerFirst(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
  function nswLine(c) { return c.rugby ? 'Every match in NSW' : c.nsw ? c.nsw + (c.nsw === 1 ? ' match' : ' matches') + ' in NSW' : 'Plays interstate; watch in NSW'; }
  function esc(x) { return String(x).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

  /* ---------- The fan ----------
     Each card turns about a pivot well below the fan, so the hand curves like cards held in a hand. Later cards lie
     on top, so every card shows its code at the top left. offset is the index of the card in the middle; it moves
     with a drag and settles on a whole card. */
  var STEP = 6.5, PIVOT = 460, PX = 64, LIFT = 26;
  // The middle card gets extra room either side (GAP degrees), so the card that is in focus is never covered by its
  // neighbour and its pool and NSW line can be read on the card itself. It eases in over the first card of distance,
  // so a drag stays continuous.
  var GAP = 5;
  function angleOf(rel) { return rel * STEP + Math.max(-1, Math.min(1, rel)) * GAP; }
  var TICK = '<svg class="tp-card-tick" width="14" height="12" viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5l3.5 3.5L11 1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  function front(c) {
    // The code stays alone at the top left, so it shows on cards the next card overlaps; the flag sits with the name
    return '<span class="tp-card-code">' + esc(c.code) + '</span><span class="tp-card-name">' + (FLAG[c.name] ? '<span class="tp-card-flag" aria-hidden="true">' + FLAG[c.name] + '</span>' : '') + esc(c.name) + '</span>' +
      '<span class="tp-card-meta">' + (c.rugby ? 'No team' : esc(c.pool)) + '<br>' + esc(nswLine(c)) + '</span>';
  }
  fan.innerHTML = CARDS.map(function (c, i) {
    return '<button type="button" class="tp-card' + (c.rugby ? ' tp-card--rugby' : '') + '" data-i="' + i + '" tabindex="-1" aria-pressed="false" aria-label="' +
      esc(c.name + ', ' + (c.rugby ? 'no team, see every match in NSW' : c.pool + ', ' + lowerFirst(nswLine(c)))) + '">' + front(c) + TICK + '</button>';
  }).join('');
  var cards = Array.prototype.slice.call(fan.children);
  /* seq: the cards in the hand, in order (all of them, or only teams playing in NSW, see "In NSW" below). offset counts
     positions in seq, not card indexes. The hand opens on Australia, the host nation, rather than whichever card
     happens to sit fourth alphabetically. */
  var seq = CARDS.map(function (c, i) { return i; });
  function pos(i) { return seq.indexOf(i); }
  function midCard() { return cards[seq[Math.max(0, Math.min(seq.length - 1, Math.round(offset)))]]; }
  var START = Math.max(0, CARDS.findIndex(function (c) { return c.name === 'Australia'; }));
  var offset = START, dealt = false;
  // trans: an inline transition for this move only (the glide to a picked card); otherwise the stylesheet's
  function place(animate, trans) {
    var mid = Math.round(offset);
    cards.forEach(function (b, i) {
      var p = pos(i), out = p < 0, c = CARDS[i];
      // A card out of the hand (In NSW on) stays where it last was and fades out; it comes back the same way
      var rel = out ? (b._rel || 0) : p - offset;
      if (!out) b._rel = rel;
      var lift = (isPicked(c) ? LIFT : 0) + (p === mid ? 6 : 0);
      b.style.transition = !animate ? 'none' : trans || '';
      b.style.transform = dealt ? 'rotate(' + angleOf(rel).toFixed(2) + 'deg) translateY(' + (-lift) + 'px)' : 'rotate(0deg) translateY(0)';
      var far = out || Math.abs(rel) > 7.5;
      b.style.opacity = far ? '0' : '';
      b.style.visibility = far ? 'hidden' : '';
      b.tabIndex = p === mid ? 0 : -1;
      b.classList.toggle('is-mid', p === mid);
      b.classList.toggle('is-picked', isPicked(c));
      b.setAttribute('aria-pressed', isPicked(c) ? 'true' : 'false');
    });
  }
  function settle(to, focus, trans) {
    offset = Math.max(0, Math.min(seq.length - 1, Math.round(to)));
    place(true, trans);
    if (focus) midCard().focus({ preventScroll: true });
  }
  // The deal: the first time the fan comes into view, the hand opens from a stack. The one authored moment here.
  function deal() {
    if (dealt) return;
    dealt = true;
    if (reduce.matches) { place(false); return; }
    cards.forEach(function (b, i) { b.style.transitionDelay = (pos(i) < 0 ? 0 : Math.abs(pos(i) - offset) * 22) + 'ms'; });
    place(true);
    setTimeout(function () { cards.forEach(function (b) { b.style.transitionDelay = ''; }); }, 900);
  }
  place(false);
  // The hand deals open the first time the fan comes into view (and again after Reset prototype)
  function watchDeal() {
    if (!('IntersectionObserver' in window)) { deal(); return; }
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); deal(); } }, { root: body, threshold: .4 });
    io.observe(fan);
  }
  watchDeal();

  // Drag or swipe sideways; a tap picks. Vertical swipes still scroll the phone (touch-action: pan-y).
  var drag = null, suppress = false;
  fan.addEventListener('pointerdown', function (e) {
    if (e.button > 0) return;
    drag = { id: e.pointerId, x: e.clientX, o: offset, moved: false, t: performance.now(), lx: e.clientX, v: 0 };
  });
  fan.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 6) return;
    if (!drag.moved) { drag.moved = true; fan.setPointerCapture(e.pointerId); fan.classList.add('is-dragging'); deal(); }
    var now = performance.now();
    drag.v = (e.clientX - drag.lx) / Math.max(1, now - drag.t); drag.t = now; drag.lx = e.clientX;
    offset = Math.max(-.6, Math.min(seq.length - .4, drag.o - dx / PX));
    place(false);
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    if (!d.moved) return;
    fan.classList.remove('is-dragging');
    suppress = true; setTimeout(function () { suppress = false; }, 0);
    settle(offset - d.v * 140 / PX); // a flick carries on a little
  }
  fan.addEventListener('pointerup', endDrag);
  fan.addEventListener('pointercancel', endDrag);
  fan.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    offset = Math.max(0, Math.min(seq.length - 1, offset + e.deltaX / PX));
    place(false);
    clearTimeout(fan._w); fan._w = setTimeout(function () { settle(offset); }, 120);
  }, { passive: false });

  // from: where the pick came from, for the dots to fly out of (the card itself unless said otherwise; null for none,
  // as from the match page, which covers the fan and the bar)
  function toggle(i, from, keepTab) {
    var c = CARDS[i], on = !isPicked(c), note = '';
    // While the first pick's dots are in the air the bar has no count of theirs yet, so it says what is happening
    var before = ownKeys(), oldValue = own() ? tlValue.textContent : 'Adding matches\u2026', barWasOn = tlOn;
    // Here for the rugby already covers every match in NSW, so it stands alone: picking it puts the team cards back in
    // the hand, and picking a team puts it back. The cards that go drop in the same glide.
    if (on && c.rugby && state.picked.length) { state.picked = []; note = ' Your team picks are cleared, as every NSW match is included.'; }
    else if (on && !c.rugby && isPicked(RUGBY)) { state.picked = state.picked.filter(function (n) { return n !== RUGBY.name; }); note = ' Here for the rugby is cleared.'; }
    if (on) state.picked.push(c.name); else state.picked = state.picked.filter(function (n) { return n !== c.name; });
    save();
    // The pick is a visible moment, not just a turn of the hand: the card is pulled up out of the fan above its
    // neighbours, travels to the middle while the hand turns under it, and settles back in. A fan step is only 6.5deg,
    // so without the pull a pick one or two cards over hardly reads. Slower the further it goes, eased in and out.
    // Reduced motion keeps the stylesheet's (no movement); the colour and tick still change.
    var dist = Math.abs(pos(i) - offset), dur = Math.round(Math.min(1100, 620 + 120 * dist));
    var ease = 'cubic-bezier(.65, 0, .35, 1)';
    settle(pos(i), false, reduce.matches ? '' : 'transform ' + dur + 'ms ' + ease + ', opacity 220ms ease-out, background-color 200ms ease-out, color 200ms ease-out');
    if (!reduce.matches && cards[i].animate) {
      var card = cards[i];
      if (card._pull) card._pull.cancel();
      card.style.zIndex = 60; // rides above the cards it passes
      // translate and scale are separate properties, so they add to the fan's rotate without fighting it
      card._pull = card.animate([
        { translate: '0 0', scale: '1', boxShadow: '-2px 0 6px rgba(0,0,0,.08)' },
        { translate: '0 ' + (on ? -46 : -30) + 'px', scale: on ? '1.1' : '1.05', boxShadow: '0 18px 30px rgba(0,0,0,.25)', offset: .4 },
        { translate: '0 0', scale: '1', boxShadow: '-2px 0 6px rgba(0,0,0,.08)' }
      ], { duration: Math.max(dur, 700), easing: ease });
      card._pull.onfinish = card._pull.oncancel = function () { card.style.zIndex = ''; card._pull = null; };
    }
    renderChosen();
    renderMatches(on ? c.name : null, on ? null : c.name, keepTab);
    var msg = pickLine(c, on);
    showCaption(c.name + (on ? ' added' : ' removed'), msg.slice((c.name + (on ? ' added' : ' removed')).length), note);
    say(msg + '.' + note);
    pickFlights(from === undefined ? cards[i] : from, before, oldValue, barWasOn, c.rugby, from === undefined ? dur : 0);
    notesOnly(); // after the caption is rewritten, which would otherwise wipe its annotation badge
    return msg;
  }
  /* ---------- What a pick did ----------
     The caption under the fan is the feedback line (it used to repeat the middle card): what was added or removed, and
     what that means in matches. The new part is emphasised for a moment, then settles. The live region says the same. */
  function pickLine(c, on) {
    if (!on) return c.name + ' removed';
    if (c.rugby) return 'Here for the rugby added: every NSW match, ' + countPhrase(nswPool.concat(nswKo));
    return c.name + ' added: ' + countPhrase(c.matches) + ', ' + (c.nsw ? c.nsw + ' in NSW' : 'all interstate');
  }
  var CAPTION_REST = 'Tap a card to add its matches. Tap it again to take it off.';
  function showCaption(lead, rest, note) {
    caption.innerHTML = '<span class="tp-cap-new">' + esc(lead) + '</span>' + esc(rest || '') + (note ? '<span class="tp-cap-note">' + esc(note) + '</span>' : '');
    var n = caption.firstChild;
    if (n.animate && !reduce.matches) n.animate([{ backgroundColor: '#dfe9fb', boxShadow: '0 0 0 4px #dfe9fb' }, { backgroundColor: '#dfe9fb', boxShadow: '0 0 0 4px #dfe9fb', offset: .35 }, { backgroundColor: 'rgba(223,233,251,0)', boxShadow: '0 0 0 4px rgba(223,233,251,0)' }], { duration: 1400, easing: 'ease-out' });
  }
  // The person's own matches on the strip. With nothing of their own the strip previews every match, and none of
  // those is theirs, so the first pick flies all of its matches in.
  function ownKeys() { var o = {}; if (own()) TLM.forEach(function (m) { if (m.on) o[m.key] = m; }); return o; }
  /* The team's matches arrive in the timeline bar: on the first pick the bar rises, then a dot per new match glides from
     the picked card to its date on the bar's strip, 60ms apart so they read as one team's matches arriving, and lands
     there; the count changes once they are in. A match already on the strip (shared with a team already picked) does
     not fly again. Here for the rugby is one sweep, not 17 flights. Picks in quick succession fly shorter and closer,
     so they do not pile up. Unpicking lifts that team's dots out of the strip as they fade, and the count drops.
     Reduced motion, or a pick made where the bar cannot be seen: no flight; the dots fade in on the strip. */
  var flying = 0, lastPick = 0;
  // glide: how long the picked card takes to reach the middle of the fan; its dots leave once it is nearly there,
  // from where it comes to rest, so they are seen to come out of the card and not from where it used to be
  function pickFlights(src, before, oldValue, barWasOn, sweep, glide) {
    var now = ownKeys(), inc = [], out = [];
    Object.keys(now).forEach(function (k) { if (!before[k]) inc.push(now[k]); });
    Object.keys(before).forEach(function (k) { if (!now[k]) out.push(before[k]); });
    var strip = tl.querySelector('.tp-tl-strip'), ph = phoneEl.getBoundingClientRect();
    // Leaving: each of the team's dots lifts out of the strip and fades (the strip's own dot has already gone)
    if (out.length && tlOn && !reduce.matches && document.body.animate) {
      var days = {};
      out.forEach(function (m) { days[m.day] = true; });
      Object.keys(days).forEach(function (d, k) {
        var r = tlDotEls[d].getBoundingClientRect(), g = document.createElement('span');
        g.className = 'tp-fly tp-fly--dot';
        g.style.left = (r.left + r.width / 2 - ph.left - 5) + 'px'; g.style.top = (r.top + r.height / 2 - ph.top - 5) + 'px';
        phoneEl.appendChild(g);
        g.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-22px)', opacity: 0 }], { duration: 420, delay: k * 30, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' }).onfinish = function () { g.remove(); };
      });
    }
    if (!inc.length) return;
    inc.sort(function (a, b) { return a.day - b.day; });
    var landDots = inc.map(function (m) { return tlDotEls[m.day]; });
    function landed(el) { el.classList.remove('is-incoming'); el.classList.remove('is-landed'); void el.offsetWidth; el.classList.add('is-landed'); }
    var quiet = reduce.matches || !src || !document.body.animate || !src.getClientRects().length;
    if (quiet) { landDots.forEach(landed); return; }
    // The dots wait off the strip until their flight lands; the count waits for the last one
    landDots.forEach(function (el) { el.classList.add('is-incoming'); });
    tlValue.textContent = oldValue;
    flying++;
    var t = performance.now(), rapid = t - lastPick < 900; lastPick = t;
    var DUR = rapid ? 360 : 680, GAP = rapid ? 30 : 60, wait = Math.max(barWasOn ? 0 : 380, (glide || 0) * .6); // the bar's rise is 360ms
    var list = sweep ? [inc[0]] : inc, done = 0;
    setTimeout(function () {
      var a = src.getBoundingClientRect();
      if (src.classList.contains('tp-card')) {
        // The card's resting place in the middle of the fan: its own layout box, upright, lifted as a pick is
        var fr = fan.getBoundingClientRect();
        a = { left: fr.left + src.offsetLeft, top: fr.top + src.offsetTop - LIFT - 6, width: src.offsetWidth, height: src.offsetHeight };
      }
      list.forEach(function (m, k) {
        var dest = tlDotEls[m.day], b = dest.getBoundingClientRect(), g = document.createElement('span');
        g.className = 'tp-fly tp-fly--dot';
        var x0 = a.left + a.width / 2 - ph.left - 5, y0 = a.top + a.height * .35 - ph.top - 5;
        g.style.left = x0 + 'px'; g.style.top = y0 + 'px';
        phoneEl.appendChild(g);
        var dx = b.left + b.width / 2 - ph.left - 5 - x0, dy = b.top + b.height / 2 - ph.top - 5 - y0;
        // It leaves the card visibly (small, then full size as it lifts), arcs, and lands at the strip's dot size
        g.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 1 }, { transform: 'translate(' + dx * .4 + 'px,' + (dy * .4 - 30) + 'px) scale(1.2)', opacity: 1, offset: .35 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.8)', opacity: 1 }],
          { duration: DUR, delay: k * GAP, easing: 'cubic-bezier(.45, .05, .25, 1)', fill: 'backwards' }).onfinish = function () {
          g.remove();
          if (sweep) {
            // One dot lands on the first day, then the rest light up along the strip, left to right
            landDots.forEach(function (el, j) { setTimeout(function () { landed(el); }, j * 22); });
            setTimeout(finish, landDots.length * 22 + 120);
          } else { inc.forEach(function (x) { if (x.day === m.day) landed(tlDotEls[x.day]); }); if (++done === list.length) finish(); }
        };
      });
    }, wait);
    function finish() {
      if (--flying) return;
      tlValue.textContent = valueNow;
      if (tlValue.animate) tlValue.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
    }
  }
  fan.addEventListener('click', function (e) {
    var b = e.target.closest('.tp-card');
    if (!b || suppress) return;
    toggle(+b.dataset.i);
  });
  fan.addEventListener('keydown', function (e) {
    var k = e.key, to = null;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = Math.round(offset) + 1;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') to = Math.round(offset) - 1;
    else if (k === 'Home') to = 0;
    else if (k === 'End') to = seq.length - 1;
    else if (/^[a-z]$/i.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) to = jumpTo(k);
    if (to === null) return;
    e.preventDefault();
    deal();
    settle(to, true);
  });

  /* ---------- Finding your team ----------
     Three ways in, so nobody swipes through 25 cards for theirs: type in Find your team (suggestions under the field;
     the hand glides to the first match; choosing one picks it), type a letter while the hand has focus (jumps to the
     next team starting with it), or narrow the hand to the 15 teams with a pool match in NSW. */
  function jumpTo(letter) {
    var L = letter.toLowerCase(), cur = Math.round(offset);
    for (var n = 1; n <= seq.length; n++) {
      var p = (cur + n) % seq.length, c = CARDS[seq[p]];
      if (!c.rugby && c.name.toLowerCase().charAt(0) === L) return p;
    }
    return null;
  }
  var nswBtn = document.getElementById('tp-nsw'), findIn = document.getElementById('tp-find-in'), findList = document.getElementById('tp-find-list');
  var NSW_COUNT = names.filter(function (n) { return TEAMS[n].nsw > 0; }).length;
  function setNsw(on) {
    if (!nswBtn || (nswBtn.getAttribute('aria-pressed') === 'true') === on) return;
    var keep = seq[Math.round(offset)];
    nswBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    // Teams with a pool match in NSW, plus Here for the rugby and anything already picked (never hide a pick)
    seq = CARDS.map(function (c, i) { return i; }).filter(function (i) { var c = CARDS[i]; return !on || c.rugby || c.nsw > 0 || isPicked(c); });
    var p = pos(keep);
    if (p < 0) { p = 0; while (p < seq.length - 1 && seq[p] < keep) p++; } // the nearest card that stays
    offset = p;
    place(dealt && !reduce.matches, 'transform 420ms cubic-bezier(.3, .7, .2, 1), opacity 260ms ease-out, background-color 200ms ease-out');
  }
  if (nswBtn) {
    nswBtn.textContent = 'In NSW \u00b7 ' + NSW_COUNT;
    nswBtn.setAttribute('aria-label', 'Only the ' + NSW_COUNT + ' teams with a pool match in NSW');
    nswBtn.addEventListener('click', function () {
      var on = nswBtn.getAttribute('aria-pressed') !== 'true';
      deal(); setNsw(on);
      say(on ? 'Showing the ' + NSW_COUNT + ' teams with a pool match in NSW, ' + seq.length + ' cards.' : 'Showing all 24 teams.');
    });
  }
  var found = [];
  function clearFind() { if (!findIn) return; findIn.value = ''; found = []; renderFind(); }
  function renderFind() {
    var q = findIn.value.trim().toLowerCase();
    if (!q) { findList.hidden = true; findList.innerHTML = ''; findIn.setAttribute('aria-expanded', 'false'); return; }
    // Name or code, matching the start of a word: "zea" finds New Zealand, "rsa" finds South Africa
    found = names.filter(function (n) {
      var t = TEAMS[n];
      return n.toLowerCase().split(/\s+/).some(function (w) { return w.indexOf(q) === 0; }) || n.toLowerCase().indexOf(q) === 0 || t.code.toLowerCase() === q;
    }).slice(0, 4);
    findIn.setAttribute('aria-expanded', 'true');
    findList.hidden = false;
    if (!found.length) {
      findList.innerHTML = '<li class="tp-find-none">No team matches \u201c' + esc(findIn.value.trim()) + '\u201d. Try the country\u2019s name, for example New Zealand.</li>';
      return;
    }
    findList.innerHTML = found.map(function (n, k) {
      var t = TEAMS[n], picked = isPicked(t);
      return '<li><button type="button" class="tp-find-opt" data-team="' + esc(n) + '" aria-pressed="' + picked + '">' +
        (FLAG[n] ? '<span class="tp-find-flag" aria-hidden="true">' + FLAG[n] + '</span>' : '') +
        '<span class="tp-find-text"><span class="tp-find-name">' + esc(n) + '</span><span class="tp-find-meta">' + esc(t.pool) + ' \u00b7 ' + esc(nswLine(t)) + '</span></span>' +
        '<span class="tp-find-state" aria-hidden="true">' + (picked ? 'Picked' : 'Pick') + '</span></button></li>';
    }).join('');
    // The hand glides to the first match while you type, so the card is already there when you look up
    var i = CARDS.indexOf(TEAMS[found[0]]);
    if (pos(i) < 0) setNsw(false);
    deal();
    settle(pos(i), false, reduce.matches ? '' : 'transform 520ms cubic-bezier(.45, .05, .25, 1), opacity 220ms ease-out');
  }
  function pickFound(n) {
    var i = CARDS.indexOf(TEAMS[n]);
    if (pos(i) < 0) setNsw(false);
    toggle(i);
    clearFind();
    findIn.focus({ preventScroll: true });
  }
  if (findIn) {
    findIn.addEventListener('input', function () { renderFind(); if (findIn.value.trim()) say(found.length ? found.length + (found.length === 1 ? ' team matches.' : ' teams match.') : 'No team matches.'); });
    findIn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && found.length) { e.preventDefault(); pickFound(found[0]); }
      else if (e.key === 'Escape' && findIn.value) { e.preventDefault(); clearFind(); }
      else if (e.key === 'ArrowDown' && found.length) { e.preventDefault(); findList.querySelector('.tp-find-opt').focus(); }
    });
    findList.addEventListener('click', function (e) { var b = e.target.closest('.tp-find-opt'); if (b) pickFound(b.dataset.team); });
    findList.addEventListener('keydown', function (e) {
      var b = e.target.closest('.tp-find-opt'); if (!b) return;
      var all = Array.prototype.slice.call(findList.querySelectorAll('.tp-find-opt')), k = all.indexOf(b);
      if (e.key === 'ArrowDown') { e.preventDefault(); (all[k + 1] || all[k]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (k ? all[k - 1] : findIn).focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); clearFind(); findIn.focus(); }
    });
    // Leaving the field and its suggestions closes them; the text stays so nothing typed is lost
    document.addEventListener('pointerdown', function (e) { if (!e.target.closest('.tp-find')) { findList.hidden = true; findIn.setAttribute('aria-expanded', 'false'); } });
    findIn.addEventListener('focus', function () { if (findIn.value.trim()) renderFind(); });
  }

  function chosenText() {
    var n = state.picked.length;
    if (!n) return 'No teams picked yet.';
    var teams = state.picked.filter(function (x) { return x !== RUGBY.name; });
    var rugby = state.picked.length > teams.length;
    return (teams.length ? 'Picked: ' + list(teams) : '') + (rugby ? (teams.length ? ', plus every NSW match.' : 'Here for the rugby: every NSW match.') : '.');
  }
  function renderChosen() {
    chosenEl.textContent = chosenText();
    clearBtn.hidden = !state.picked.length;
    changed(); // after the label is rewritten, which would otherwise wipe the annotation badge
  }
  // Clear all: every card back in the hand and every ticket mark gone, so the picker starts again
  clearBtn.addEventListener('click', function () {
    var before = ownKeys(), old = tlValue.textContent, bar = tlOn;
    state.picked = [];
    // Tickets go with the teams; a ticket on a match added on its own stays with that match
    var keepT = addedMatches().map(function (m) { return idOf(m.f); });
    state.tickets = state.tickets.filter(function (x) { return keepT.indexOf(x) > -1; });
    save();
    place(true);
    renderChosen();
    renderMatches();
    pickFlights(null, before, old, bar);
    showCaption('All teams cleared', '. ' + CAPTION_REST);
    notesOnly();
    midCard().focus({ preventScroll: true }); // the button has just hidden itself
    say('All teams and their tickets cleared. No teams picked.');
  });
  document.getElementById('tp-rugby-link').addEventListener('click', function () {
    deal();
    var i = CARDS.length - 1;
    if (pos(i) < 0) setNsw(false);
    if (!isPicked(RUGBY)) toggle(i); else settle(i);
    cards[i].focus({ preventScroll: true });
  });

  /* ---------- Your matches: a card per picked team, built as picks change ----------
     A match between two picked teams appears once, on the card of the team picked first; the other card says where it
     is. Matches added one at a time from All matches (with no team of theirs in it) get a card of their own. */
  function others(f, self) {
    // Picked teams also in this match, other than the card it sits on
    return f.t.split(' v ').filter(function (n) { return n !== self && state.picked.indexOf(n) > -1; });
  }
  function row(f, self, full) {
    var id = idOf(f), opp = full ? f.t : 'v ' + f.t.split(' v ').filter(function (n) { return n !== self; })[0];
    var also = full ? f.t.split(' v ').filter(function (n) { return state.picked.indexOf(n) > -1; }) : others(f, self);
    var tag = f.a ? '<span class="tp-tag tp-tag--away">Interstate: ' + esc(f.a) + '</span>' : '<span class="tp-tag">In NSW</span>';
    var note = also.length ? '<p class="tp-m-also">' + (full ? 'Your team: ' : 'Also your team: ') + esc(list(also)) + '</p>' : '';
    var has = state.tickets.indexOf(id) > -1;
    return '<li class="tp-m' + (has ? ' has-ticket' : '') + '"><p class="tp-m-when">' + esc(f.d) + ', ' + esc(f.k || 'time to be confirmed') + '</p>' +
      '<p class="tp-m-teams">' + esc(opp) + '</p><p class="tp-m-where">' + esc(f.v + ', ' + f.p) + '</p>' + tag + note +
      '<label class="tp-ticket"><input type="checkbox" data-match="' + esc(id) + '"' + (has ? ' checked' : '') + ' /><span>I have a ticket</span></label></li>';
  }
  function koNote(c) {
    if (c.rugby) return 'Knockouts in NSW: Round of 16 on Sat 23 and Sun 24 Oct (Sydney Football Stadium), quarter-finals on Sat 30 and Sun 31 Oct, semi-finals on Fri 5 and Sat 6 Nov, and the final on Sat 13 Nov (all Stadium Australia). Teams are known when the pools finish.';
    var p = c.pool.replace('Pool ', ''), r = R16.filter(function (f) { return f.t && f.t.indexOf('Pool ' + p) > -1; })[0], line = '';
    if (r) { var pos = /(\w+) Pool /.exec(r.t.split(' v ').filter(function (x) { return x.indexOf('Pool ' + p) > -1; })[0])[1]; line = 'If ' + c.name + ' finishes ' + (pos === '2nd' ? 'second' : pos) + ' in ' + c.pool + ', its Round of 16 match is in Sydney on ' + r.d + '. '; }
    return line + 'Knockouts in NSW run from Sat 23 Oct to the final on Sat 13 Nov. Teams are known when the pools finish.';
  }
  function back(c, seen, isNew) {
    var ms = c.rugby ? nswPool : c.matches, own = [], elsewhere = [];
    ms.forEach(function (f) {
      var at = seen[idOf(f)];
      if (at && at !== c.name) elsewhere.push([f, at]); else { own.push(f); seen[idOf(f)] = c.name; }
    });
    var head = c.rugby ? countPhrase(nswPool.concat(nswKo)) + ' in NSW' : c.pool + ' &middot; ' + countPhrase(c.matches) + ', ' + c.nsw + ' in NSW';
    var moved = elsewhere.map(function (x) { return '<p class="tp-m-moved">' + esc(x[0].d) + ', v ' + esc(x[0].t.split(' v ').filter(function (n) { return n !== c.name; })[0]) + ': on your ' + esc(x[1]) + ' card.</p>'; }).join('');
    return '<div class="tp-back-head"><span class="tp-back-code">' + esc(c.code) + '</span><div><h4 class="tp-back-name">' + (FLAG[c.name] ? '<span aria-hidden="true">' + FLAG[c.name] + '</span> ' : '') + esc(c.name) + '</h4><p class="tp-back-meta">' + head + '</p></div>' +
      (isNew ? '<span class="tp-rcard-new">Just added</span>' : '') + '</div>' +
      '<ol class="tp-ms' + (c.rugby ? ' tp-ms--cols' : '') + '">' + own.map(function (f) { return row(f, c.name, c.rugby); }).join('') +
      // On the columned card the knockout note is a column of its own, so it adds width, not height
      (c.rugby ? '<li class="tp-ko tp-ko--col">' + esc(koNote(c)) + '</li></ol>' : '</ol>' + moved + '<p class="tp-ko">' + esc(koNote(c)) + '</p>');
  }
  // Single matches added from All matches that no picked team's card already shows
  function addedMatches() { return state.added.filter(function (it) { return it.kind === 'match'; }).map(function (it) { return TLM_BY[it.key]; }).filter(Boolean); }
  function addedCard(seen) {
    var ms = addedMatches().filter(function (m) { return !seen[idOf(m.f)]; });
    if (!ms.length) return '';
    return '<article class="tp-rcard tp-rcard--added" data-name="added" aria-label="Matches you added"><div class="tp-flip is-flipped"><div class="tp-face tp-face--back">' +
      '<div class="tp-back-head"><span class="tp-back-code">+</span><div><h4 class="tp-back-name">Matches you added</h4><p class="tp-back-meta">' + countPhrase(ms.map(function (m) { return m.f; })) + ', from All matches</p></div></div>' +
      '<ol class="tp-ms">' + ms.map(function (m) { return m.f.t ? row(m.f, '', true) : '<li class="tp-m"><p class="tp-m-when">' + esc(m.f.d) + ', ' + esc(m.f.k || 'time to be confirmed') + '</p><p class="tp-m-teams">' + esc(m.f.s) + '</p><p class="tp-m-where">' + esc(m.f.v + ', ' + m.f.p) + '</p><span class="tp-tag">Teams to be decided</span></li>'; }).join('') + '</ol></div></div></article>';
  }
  function pickedCards() {
    // Teams in the order they were picked, then Here for the rugby last
    var t = state.picked.filter(function (n) { return n !== RUGBY.name; }).map(function (n) { return TEAMS[n]; });
    return isPicked(RUGBY) ? t.concat([RUGBY]) : t;
  }
  function summary() {
    var ids = {}, nsw = 0, tickets = 0;
    pickedCards().forEach(function (c) { (c.rugby ? nswPool.concat(nswKo) : c.matches).forEach(function (f) { ids[idOf(f)] = f; }); });
    var all = Object.keys(ids);
    all.forEach(function (k) { if (!ids[k].a) nsw++; if (state.tickets.indexOf(k) > -1) tickets++; });
    var teams = pickedCards().filter(function (c) { return !c.rugby; }).map(function (c) { return c.name; });
    var who = teams.length ? list(teams) + (isPicked(RUGBY) ? ', plus every NSW match' : '') : 'Every NSW match';
    // A match between two of your teams counts once
    var fs = all.map(function (k) { return ids[k]; });
    return who + ': ' + countPhrase(fs) + (nsw === all.length ? ', all in NSW. ' : ', ' + nsw + ' in NSW. ') + (tickets ? tickets + (tickets === 1 ? ' ticket.' : ' tickets.') : 'No tickets marked yet.');
  }
  function buildDeck(newName) {
    var cs = pickedCards(), seen = {};
    var html = cs.map(function (c) {
      return '<article class="tp-rcard' + (c.rugby ? ' tp-rcard--rugby' : '') + '" data-name="' + esc(c.name) + '" aria-label="' + esc(c.name) + '"><div class="tp-flip is-flipped">' +
        '<div class="tp-face tp-face--back">' + back(c, seen, c.name === newName) + '</div></div></article>';
    }).join('') + addedCard(seen);
    var keep = deck.scrollLeft;
    deck.innerHTML = html;
    deck.classList.toggle('is-single', deck.children.length === 1);
    deck.scrollLeft = keep;
    // The hint shows whenever there is more to the side: other cards, or the columns of Here for the rugby
    var hint = document.getElementById('tp-deck-hint');
    hint.textContent = deck.children.length > 1 ? 'Swipe for your other cards.' : 'Swipe sideways for more matches.';
    requestAnimationFrame(function () { hint.hidden = deck.scrollWidth <= deck.clientWidth + 2; });
    sum.textContent = summary();
    // Teams that play all their pool matches interstate: say so plainly, and point to watching in NSW
    var away = cs.filter(function (c) { return !c.rugby && !c.nsw; }).map(function (c) { return c.name; });
    var awayEl = document.getElementById('tp-results-away');
    if (awayEl) {
      awayEl.hidden = !away.length;
      awayEl.querySelector('.tp-results-away-text').textContent = away.length ? list(away) + (away.length === 1 ? ' plays all its' : ' play all their') + ' pool matches interstate. You can still watch them in NSW, and go to an NSW match while you’re here.' : '';
    }
    // The newest card comes in gently and says it is new: it rises into place, the deck slides to it, and its
    // "Just added" label stays for a moment before fading
    var el = newName && deck.querySelector('.tp-rcard[data-name="' + CSS.escape(newName) + '"]');
    if (el) {
      el.classList.add('is-new');
      var vis = !results.hidden;
      if (vis) deck.scrollTo({ left: Math.max(0, el.offsetLeft - 16), behavior: reduce.matches ? 'auto' : 'smooth' });
      if (vis && el.animate) el.animate(reduce.matches ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(14px) scale(.97)' }, { opacity: 1, transform: 'none' }],
        { duration: reduce.matches ? 160 : 460, easing: 'cubic-bezier(.2, .8, .2, 1)' });
      clearTimeout(el._new); el._new = setTimeout(function () { el.classList.remove('is-new'); }, 2600);
    }
  }
  /* ---------- Tabs: Your matches and All matches ----------
     Only once a team is picked; with none, All matches stands alone as it always did. The first pick chooses Your
     matches; after that the chosen tab stays put (and is kept on reload), and the tab's count says what changed. */
  var tabsOn = false, lastN = 0, restoring = false;
  // keepTab: a pick made from a match page keeps All matches chosen, so closing the page goes back to its row
  function renderMatches(newName, goneName, keepTab) {
    var has = state.picked.length > 0;
    if (!has) {
      tabsOn = false; lastN = 0;
      tabsEl.hidden = true; results.hidden = true; deck.innerHTML = '';
      if (allSec) { allSec.hidden = false; allSec.classList.remove('is-tabbed'); allSec.removeAttribute('role'); allSec.setAttribute('aria-labelledby', 'tp-all-title'); }
      return;
    }
    if (!tabsOn) { tabsOn = true; if (!restoring) { state.tab = keepTab ? 'all' : 'yours'; save(); } tabsEl.hidden = false; if (!restoring && !reduce.matches && tabsEl.animate) tabsEl.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.2, .8, .2, 1)' }); }
    // A card that goes fades out first, so the deck does not jump in one frame
    var gone = goneName && !results.hidden && !reduce.matches && deck.querySelector('.tp-rcard[data-name="' + CSS.escape(goneName) + '"]');
    if (gone && gone.animate) gone.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 180, easing: 'ease-in' }).onfinish = function () { buildDeck(newName); };
    else buildDeck(newName);
    var n = userMatches().length;
    tabYours.innerHTML = 'Your matches <span class="tp-tab-n">(' + n + ')</span>';
    if (lastN && n !== lastN && tabYours.animate) {
      var t = tabYours.querySelector('.tp-tab-n');
      t.classList.add('is-bumped');
      setTimeout(function () { t.classList.remove('is-bumped'); }, 1200);
    }
    lastN = n;
    setTab(state.tab);
  }
  function setTab(t, focus) {
    state.tab = t; save();
    var y = t === 'yours';
    tabYours.setAttribute('aria-selected', y ? 'true' : 'false'); tabAll.setAttribute('aria-selected', y ? 'false' : 'true');
    tabYours.tabIndex = y ? 0 : -1; tabAll.tabIndex = y ? -1 : 0;
    results.hidden = !y;
    if (allSec) { allSec.hidden = y; allSec.classList.add('is-tabbed'); allSec.setAttribute('role', 'tabpanel'); allSec.setAttribute('aria-labelledby', 'tp-tab-all'); }
    if (focus) (y ? tabYours : tabAll).focus({ preventScroll: true });
    if (tlReady) syncBar();
    notesOnly();
  }
  // Standard tabs: click or arrow keys (Home and End too) move the selection, which follows focus
  tabsEl.addEventListener('click', function (e) { var b = e.target.closest('[role="tab"]'); if (b) setTab(b === tabYours ? 'yours' : 'all', true); });
  tabsEl.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k !== 'ArrowLeft' && k !== 'ArrowRight' && k !== 'Home' && k !== 'End') return;
    e.preventDefault();
    var to = k === 'Home' ? 'yours' : k === 'End' ? 'all' : state.tab === 'yours' ? 'all' : 'yours';
    setTab(to, true);
  });
  /* ---------- All matches ----------
     Below the picker, whether or not anyone has picked: every match in the fixture list, in date order. Kept minimal,
     as this page is not the main source for matches. Once a team is picked it is the All matches tab. Each row opens the
     match's own full-screen page (concepts-third-half.js): add that one match to the timeline, or add either team. */
  var allSec = document.getElementById('tp-all');
  function minutes(k) { var m = /^(\d+):(\d+)(am|pm)$/.exec(k || ''); return m ? ((+m[1] % 12) + (m[3] === 'pm' ? 12 : 0)) * 60 + +m[2] : 24 * 60; }
  function side(n) { return FLAG[n] ? '<span class="tp-flag" aria-hidden="true">' + FLAG[n] + '</span> ' + esc(n) : esc(n); }
  if (allSec) {
    var rows = FIX.slice().sort(function (a, b) { return ord(a.d) - ord(b.d) || minutes(a.k) - minutes(b.k); }).map(function (f) {
      // Every row is three lines, so a column of knockouts is no taller than a column of pool matches (which would
      // leave an empty band under the others): a knockout's stage joins the date line, "teams to be decided" its name
      var ko = !/^Pool /.test(f.s);
      var who = f.t ? f.t.split(' v ').map(side).join(' <span class="tp-all-v">v</span> ') : esc(f.s) + ' <span class="tp-all-v">\u00b7 teams to be decided</span>';
      return '<li class="tp-all-m' + (f.a ? ' is-away' : '') + '" data-key="' + esc(f.d + '|' + (f.t || f.s)) + '"><button type="button" class="tp-all-btn" data-open="match:' + esc(f.d + '|' + (f.t || f.s)) + '" aria-haspopup="dialog">' +
        '<span class="tp-all-when">' + esc(f.d) + ', ' + esc(f.k || 'time to be confirmed') + (ko && f.t ? ' \u00b7 ' + esc(f.s.replace(/ \(\d+\)$/, '')) : '') + '</span><span class="tp-all-teams">' + who + '</span>' +
        '<span class="tp-all-where">' + esc(f.v + ', ' + f.p) + (f.a ? ' (interstate)' : '') + '</span></button></li>';
    });
    // Columns of five: each is a card without a border, snapped as the strip is swiped sideways
    var cols = '';
    for (var c0 = 0; c0 < rows.length; c0 += 5) {
      var last = Math.min(c0 + 5, rows.length);
      cols += '<ol class="tp-all-col" aria-label="Matches ' + (c0 + 1) + ' to ' + last + ' of ' + rows.length + '">' + rows.slice(c0, last).join('') + '</ol>';
    }
    document.getElementById('tp-all-scroll').innerHTML = cols;
  }
  // A ticket on a match is one ticket, whichever card it is marked on
  deck.addEventListener('change', function (e) {
    var cb = e.target.closest('input[data-match]'); if (!cb) return;
    setTicket(cb.dataset.match, cb.checked);
    say((cb.checked ? 'Ticket marked. ' : 'Ticket removed. ') + summary());
  });
  function setTicket(id, on) {
    state.tickets = state.tickets.filter(function (x) { return x !== id; });
    if (on) state.tickets.push(id);
    save();
    deck.querySelectorAll('input[data-match]').forEach(function (x) {
      if (x.dataset.match !== id) return;
      x.checked = on;
      x.closest('.tp-m').classList.toggle('has-ticket', on);
    });
    if (tabsOn) sum.textContent = summary();
    changed(); // rewriting the summary wipes its annotation badge
  }
  // Skip: no team needed, so straight on to the dates question (the picker stays where it is, above)
  document.getElementById('tp-skip').addEventListener('click', function () {
    phoneEl.dispatchEvent(new CustomEvent('tp:ask'));
  });
  // Where the phone's content must scroll to for the picker's title to sit 16px below the top
  function pickTop() {
    var t = document.getElementById('tp-pick-title');
    return Math.max(0, Math.round(t.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16));
  }

  /* ---------- Timeline bar (Figma: Rugby World Cup, node 213:13100, adapted to the 390px phone) ----------
     A sheet docked over the bottom of the phone, out of the content's flow. Three states: hidden (until the match cards
     have scrolled past the top of the phone), collapsed (the 104px bar) and open (the sheet risen by its panel height).
     Only transform moves it. Matches only: every match with no team or after Skip, every NSW match for Here for the
     rugby, and only the picked teams' matches, live as picks change. The All matches list stays unfiltered.
     Fan zones and the village are gap data from cnWatchSpots (placeholders). The number badge counts items added to
     the timeline; none exist yet, so only the reviewer-only stand-in control can show it. */
  var tl = document.getElementById('tp-tl');
  var tlToggle = document.getElementById('tp-tl-toggle'), tlPanel = document.getElementById('tp-tl-panel'), tlScrim = document.getElementById('tp-tl-scrim');
  var tlCanvas = document.getElementById('tp-tl-canvas'), tlScroll = document.getElementById('tp-tl-scroll'), tlDetail = document.getElementById('tp-tl-detail');
  var tlDots = document.getElementById('tp-tl-dots'), tlLabel = document.getElementById('tp-tl-label'), tlValue = document.getElementById('tp-tl-value');
  var tlBadge = document.getElementById('tp-tl-badge'), tlPrompt = document.getElementById('tp-tl-prompt'), tlTrip = document.getElementById('tp-tl-trip');
  var tlItemEls = {}, tlStay, tlKey = document.getElementById('tp-tl-key');
  var phoneEl = document.getElementById('tp-phone');
  var SPOTS = Array.isArray(window.cnWatchSpots) ? window.cnWatchSpots : [];
  var TL_ICON = {
    ball: '<svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true"><ellipse cx="8" cy="8" rx="6.5" ry="4.2" transform="rotate(-35 8 8)" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5.6 10.4l4.8-4.8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    ticket: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1.4a1.6 1.6 0 0 0 0 3.2V10a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V8.6a1.6 1.6 0 0 0 0-3.2z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    // Added items use a square marker (matches are round): a screen for a screening, a pin for a place or a product
    screen: '<svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><rect x="1.5" y="2.5" width="11" height="7.5" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 12.5h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    pin: '<svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 13s4.5-4.3 4.5-7.5a4.5 4.5 0 0 0-9 0C2.5 8.7 7 13 7 13z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="7" cy="5.5" r="1.5" fill="currentColor"/></svg>'
  };
  var DAYS = 44, DAYW = 40, PADX = 28, BAR = 104;
  var tlOn = false, tlOpen = false, tlSel = -1, tlSelItem = null;
  function dayOf(d) { var p = d.split(' '); return (p[2] === 'Nov' ? 31 : 0) + (+p[1]) - 1; } // 1 Oct is day 0, 13 Nov day 43
  // Trip dates are ISO (2027-10-03); day numbers count from 1 Oct 2027 (a Friday)
  function isoDay(iso) { var p = iso.split('-'); return Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(2027, 9, 1)) / 864e5); }
  function isoRange(a, b) {
    var M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], pa = a.split('-'), pb = b.split('-');
    var da = +pa[2] + ' ' + M[+pa[1] - 1], db = +pb[2] + ' ' + M[+pb[1] - 1];
    return a === b ? da : pa[1] === pb[1] ? +pa[2] + ' to ' + db : da + ' to ' + db;
  }
  var TLM = FIX.slice().sort(function (a, b) { return ord(a.d) - ord(b.d) || minutes(a.k) - minutes(b.k); }).map(function (f) {
    return { f: f, day: dayOf(f.d), key: f.d + '|' + (f.t || f.s), tkey: f.t ? f.d + '|' + f.t : null };
  });
  var TLM_BY = {}; TLM.forEach(function (m) { TLM_BY[m.key] = m; });
  // The canvas: an axis with every day of the tournament and one marker button per match, built once
  (function () {
    var h = '<span class="tp-tl-axis" style="left:' + PADX + 'px;width:' + ((DAYS - 1) * DAYW) + 'px"></span>';
    for (var i = 0; i < DAYS; i++) {
      var x = PADX + i * DAYW;
      h += '<span class="tp-tl-tick" style="left:' + x + 'px"></span><span class="tp-tl-day" style="left:' + x + 'px">' + (i < 31 ? i + 1 : i - 30) + '</span>';
      // Each month is a band as wide as its days; its label sticks to the left edge while the month is in view
      if (i === 0 || i === 31) h += '<span class="tp-tl-mband" style="left:' + (x - 14) + 'px;width:' + ((i ? DAYS - 31 : 31) * DAYW) + 'px"><span class="tp-tl-month">' + (i ? 'November' : 'October') + '</span></span>';
    }
    h += TLM.map(function (m, k) { return '<button type="button" class="tp-tl-mk" data-k="' + k + '" tabindex="-1" aria-pressed="false" style="left:' + (PADX + m.day * DAYW) + 'px"><span class="cn-tl-sym cn-tl-sym--match"></span></button>'; }).join('');
    tlCanvas.style.width = (PADX * 2 + (DAYS - 1) * DAYW) + 'px';
    tlCanvas.innerHTML = '<span class="tp-tl-stay" hidden></span>' + h;
    var d = '';
    for (var j = 0; j < DAYS; j++) d += '<span class="tp-tl-dot is-off" style="left:' + (j / (DAYS - 1) * 100) + '%"></span>';
    tlDots.innerHTML = d;
  })();
  var tlMarks = Array.prototype.slice.call(tlCanvas.querySelectorAll('.tp-tl-mk'));
  tlStay = tlCanvas.querySelector('.tp-tl-stay');
  var tlDotEls = Array.prototype.slice.call(tlDots.children);
  TLM.forEach(function (m, k) { m.el = tlMarks[k]; m.sym = tlMarks[k].firstElementChild; m.state = ''; });

  function tlTeams() { return state.picked.filter(function (n) { return n !== RUGBY.name; }); }
  // A single match added from All matches is the person's too, with or without a team of theirs in it
  function isAddedMatch(f) { var k = f.d + '|' + (f.t || f.s); return state.added.some(function (it) { return it.kind === 'match' && it.key === k; }); }
  function tlShown(f) {
    if (isAddedMatch(f)) return true;
    if (isPicked(RUGBY)) return !f.a; // every NSW match, knockouts included
    var t = tlTeams();
    // Nothing of their own yet: every match, as a preview of the tournament
    if (!t.length) return !state.added.some(function (it) { return it.kind === 'match'; });
    return !!f.t && f.t.split(' v ').some(function (n) { return t.indexOf(n) > -1; });
  }
  function shortDate(d) { var p = d.split(' '); return p[1] + ' ' + p[2]; }
  function tlRange(a, b) {
    if (a === b) return shortDate(a);
    var pa = a.split(' '), pb = b.split(' ');
    return pa[2] === pb[2] ? pa[1] + ' to ' + pb[1] + ' ' + pb[2] : shortDate(a) + ' to ' + shortDate(b);
  }
  function tlName(m) { return m.f.t ? m.f.t : m.f.s + ', teams to be decided'; }
  // The bar's count: held at its old value while a pick's dots are still flying in, then changed as the last one lands
  var valueNow = '';
  function setValue(v) { valueNow = v; if (!flying) tlValue.textContent = v; }
  function tlUpdate() {
    var perDay = {}, dayType = {}, shown = [];
    TLM.forEach(function (m) {
      var on = tlShown(m.f), tk = !!m.tkey && state.tickets.indexOf(m.tkey) > -1;
      m.on = on;
      if (on) {
        var row = perDay[m.day] || 0; perDay[m.day] = row + 1;
        m.el.style.setProperty('--row', row);
        shown.push(m);
        var t = tk ? 3 : !m.f.t ? 0 : m.f.a ? 1 : 2; // the strip shows one dot a day: ticket, then NSW, interstate, to be decided
        if (dayType[m.day] === undefined || t > dayType[m.day]) dayType[m.day] = t;
      }
      m.el.classList.toggle('is-off', !on);
      var st = (tk ? 'ticket' : 'match') + (m.f.a ? ' away' : '') + (m.f.t ? '' : ' tbd');
      if (st !== m.state) {
        m.state = st;
        m.sym.className = 'cn-tl-sym ' + (tk ? 'cn-tl-sym--ticket' : 'cn-tl-sym--match') + (m.f.a ? ' is-away' : '') + (m.f.t ? '' : ' is-tbd');
        m.sym.innerHTML = tk ? TL_ICON.ticket : m.f.t ? TL_ICON.ball : '<span class="tp-tl-q" aria-hidden="true">?</span>';
        m.el.setAttribute('aria-label', m.f.d + ', ' + tlName(m) + ', ' + (m.f.a ? 'interstate, ' + m.f.a : m.f.p) + (tk ? ', you have a ticket' : ''));
      }
    });
    // Added items sit on their day above that day's matches (a screening next to its match), square markers
    var itemDays = {}, keep = {};
    state.added.forEach(function (it) {
      if (it.kind === 'match') return; // a match added on its own is a match marker, drawn above
      var day = dayOf(it.day);
      if (!(day >= 0 && day < DAYS)) return;
      keep[it.id] = true;
      itemDays[day] = true;
      var el = tlItemEls[it.id];
      if (!el) {
        el = tlItemEls[it.id] = document.createElement('button');
        el.type = 'button'; el.className = 'tp-tl-mk tp-tl-mk--item is-new'; el.dataset.item = it.id;
        el.innerHTML = '<span class="cn-tl-sym cn-tl-sym--place">' + (it.kind === 'screening' ? TL_ICON.screen : TL_ICON.pin) + '</span>';
        el.style.left = (PADX + day * DAYW) + 'px';
        tlCanvas.appendChild(el);
        setTimeout(function () { el.classList.remove('is-new'); }, 20);
      }
      var row = perDay[day] || 0; perDay[day] = row + 1;
      el.style.setProperty('--row', row);
      el.setAttribute('aria-label', it.day + ', added: ' + it.title + (it.matchName ? ', for ' + it.matchName : ''));
    });
    Object.keys(tlItemEls).forEach(function (id) { if (!keep[id]) { tlItemEls[id].remove(); delete tlItemEls[id]; if (tlSelItem === id) tlSelItem = null; } });
    // Visiting with dates: the days in NSW are shaded on the axis
    var trip = state.trip, confirmed = trip && trip.mode === 'visiting' && trip.from && trip.to;
    var guess = !confirmed && trip && trip.mode === 'visiting' ? inferTrip() : null, stay = confirmed ? trip : guess;
    tlStay.hidden = !stay;
    tlStay.classList.toggle('is-suggested', !!guess);
    if (stay) {
      var a = isoDay(stay.from), z = isoDay(stay.to);
      a = Math.max(0, Math.min(DAYS - 1, a)); z = Math.max(a, Math.min(DAYS - 1, z));
      tlStay.style.left = (PADX + a * DAYW - DAYW / 2) + 'px';
      tlStay.style.width = ((z - a + 1) * DAYW) + 'px';
    }
    // The canvas is as tall as the tallest day shown: 50px for the axis and dates, 28px a row, 10px above
    var rows = 1; Object.keys(perDay).forEach(function (d) { rows = Math.max(rows, perDay[d]); });
    tlCanvas.style.height = (60 + rows * 28) + 'px';
    tlDotEls.forEach(function (el, i) {
      var t = dayType[i];
      el.className = 'tp-tl-dot' + (t === undefined && !itemDays[i] ? ' is-off' : t === undefined ? ' is-item' : t === 3 ? ' is-ticket' : t === 1 ? ' is-away' : t === 0 ? ' is-tbd' : '') + (itemDays[i] && t !== undefined ? ' has-item' : '');
    });
    // The bar's words
    var teams = tlTeams(), none = !state.picked.length;
    var label = none ? 'Pick your team' : isPicked(RUGBY) ? 'Here for the rugby: every NSW match' : 'Your teams: ' + list(teams);
    var added = state.added.length;
    if (added) label = added + ' added to your timeline' + (none ? ' \u00b7 Pick your team' : '');
    tlLabel.textContent = label;
    tlLabel.classList.toggle('is-hook', none || !!added);
    // Once the days in NSW are confirmed the bar follows them: the matches in those days, and those days (no prefix:
    // the bar has room for "9 pool + 8 knockouts · 3 Oct to 13 Nov" and no more)
    if (confirmed) {
      var ca = isoDay(trip.from), cz = isoDay(trip.to), inDays = shown.filter(function (m) { return m.day >= ca && m.day <= cz; });
      setValue(countPhrase(inDays.map(function (m) { return m.f; }), { short: true }) + ' · ' + isoRange(trip.from, trip.to));
    } else {
      setValue(countPhrase(shown.map(function (m) { return m.f; }), { short: true }) + (shown.length ? ' · ' + tlRange(shown[0].f.d, shown[shown.length - 1].f.d) : ''));
    }
    if (String(added || '') !== tlBadge.textContent) {
      tlBadge.hidden = !added;
      tlBadge.textContent = added || '';
      // The count changing is worth seeing: the badge pops again
      if (added) { tlBadge.style.animation = 'none'; tlBadge.offsetWidth; tlBadge.style.animation = ''; }
    }
    // One prompt at a time: which team first; the trip line only once there is a team
    tlPrompt.hidden = !none;
    tlTrip.hidden = none;
    tlTrip.innerHTML = none ? '' : tripLine();
    // The key lists only the marker shapes on the axis now
    // Each entry draws its marker exactly as the axis does (the ball in the ring, the screen or pin in the square)
    var kinds = { nsw: false, away: false, ticket: false, tbd: false,
      screen: state.added.some(function (it) { return it.kind === 'screening'; }), pin: state.added.some(function (it) { return it.kind !== 'screening' && it.kind !== 'match'; }) };
    shown.forEach(function (m) { var tk = !!m.tkey && state.tickets.indexOf(m.tkey) > -1; if (tk) kinds.ticket = true; else if (!m.f.t) kinds.tbd = true; else if (m.f.a) kinds.away = true; else kinds.nsw = true; });
    tlKey.innerHTML = (kinds.nsw ? '<li><span class="cn-tl-sym cn-tl-sym--match" aria-hidden="true">' + TL_ICON.ball + '</span>In NSW</li>' : '') +
      (kinds.away ? '<li><span class="cn-tl-sym cn-tl-sym--match is-away" aria-hidden="true">' + TL_ICON.ball + '</span>Interstate</li>' : '') +
      (kinds.ticket ? '<li><span class="cn-tl-sym cn-tl-sym--ticket" aria-hidden="true">' + TL_ICON.ticket + '</span>Your ticket</li>' : '') +
      (kinds.tbd ? '<li><span class="cn-tl-sym cn-tl-sym--match is-tbd" aria-hidden="true"><span class="tp-tl-q">?</span></span>Teams to be decided</li>' : '') +
      (kinds.screen ? '<li><span class="cn-tl-sym cn-tl-sym--place" aria-hidden="true">' + TL_ICON.screen + '</span>Screening you added</li>' : '') +
      (kinds.pin ? '<li><span class="cn-tl-sym cn-tl-sym--place" aria-hidden="true">' + TL_ICON.pin + '</span>Place you added</li>' : '');
    // A selected match that is no longer shown is let go
    if (tlSel > -1 && !TLM[tlSel].on) tlSel = -1;
    tlRenderDetail();
  }
  // Every marker shown, matches and added items, in the order of the axis: by day, then bottom to top
  function tlOrder() {
    var els = [];
    TLM.forEach(function (m) { if (m.on) els.push(m.el); });
    Object.keys(tlItemEls).forEach(function (id) { els.push(tlItemEls[id]); });
    return els.sort(function (a, b) { return a.offsetLeft - b.offsetLeft || (+a.style.getPropertyValue('--row') || 0) - (+b.style.getPropertyValue('--row') || 0); });
  }
  function tlSelEl() { return tlSelItem ? tlItemEls[tlSelItem] : tlSel > -1 ? TLM[tlSel].el : null; }
  function tlRoving() {
    var order = tlOrder(), sel = tlSelEl(), tab = sel || order[0];
    order.concat(TLM.filter(function (m) { return !m.on; }).map(function (m) { return m.el; })).forEach(function (el) {
      el.tabIndex = el === tab ? 0 : -1;
      el.setAttribute('aria-pressed', el === sel ? 'true' : 'false');
    });
  }
  function tlRenderDetail() {
    tlRoving();
    if (tlSelItem) {
      var it = state.added.filter(function (x) { return x.id === tlSelItem; })[0];
      if (it) {
        tlDetail.innerHTML = '<p class="tp-tl-d-when">' + esc(it.day) + (it.matchName ? ', for ' + esc(it.matchName) : '') + '</p>' +
          '<p class="tp-tl-d-teams provenance-gap">' + esc(it.title) + '</p><p class="tp-tl-d-stage">' + esc(it.kindLabel || '') + '</p>' +
          (it.place ? '<p class="tp-tl-d-where">' + esc(it.place) + '</p>' : '') + (it.note ? '<p class="tp-tl-d-where">' + esc(it.note) + '</p>' : '') +
          '<button type="button" class="tp-link tp-tl-remove" data-remove="' + esc(it.id) + '">Remove from timeline</button>';
        return;
      }
      tlSelItem = null;
    }
    tlDetail.classList.toggle('is-empty', tlSel < 0 && !tlSelItem);
    if (tlSel < 0) { tlDetail.innerHTML = '<p class="tp-tl-hint">Tap a marker for its details.</p>'; return; }
    var m = TLM[tlSel], f = m.f, tk = !!m.tkey && state.tickets.indexOf(m.tkey) > -1;
    var who = f.t ? f.t.split(' v ').map(side).join(' <span class="tp-all-v">v</span> ') : esc(f.s);
    var h = '<p class="tp-tl-d-when">' + esc(f.d) + ', ' + (f.k ? esc(f.k) + ' Sydney time' : 'time to be confirmed') + '</p>' +
      '<p class="tp-tl-d-teams">' + who + '</p>' +
      '<p class="tp-tl-d-stage">' + (f.t ? esc(f.s) : 'Teams to be decided') + '</p>' +
      '<p class="tp-tl-d-where">' + esc(f.v + ', ' + f.p) + '</p>' +
      (f.a ? '<span class="tp-tag tp-tag--away">Interstate: ' + esc(f.a) + '</span>' : '<span class="tp-tag">In NSW</span>');
    // Gap data: only where a placeholder spot lists this match; otherwise no line at all
    var spots = f.a ? SPOTS.filter(function (sp) { return Array.isArray(sp.shows) && sp.shows.indexOf(m.key) > -1; }) : [];
    if (spots.length) h += '<p class="tp-tl-watch provenance-gap">Watch in NSW: ' + spots.map(function (sp) { return esc(sp.name) + ', ' + esc(sp.place); }).join('; ') + '</p>';
    if (tk) h += '<p class="tp-tl-d-ticket">You have a ticket for this match.</p>';
    if (isAddedMatch(f)) h += '<p class="tp-tl-d-stage">Added by you from All matches</p><button type="button" class="tp-link tp-tl-remove" data-remove="m:' + esc(m.key) + '">Remove from timeline</button>';
    tlDetail.innerHTML = h;
  }
  function tlSelect(k, focus, itemId) {
    tlSel = itemId ? -1 : k; tlSelItem = itemId || null;
    tlRenderDetail();
    var el = itemId ? tlItemEls[itemId] : TLM[k].el, x = el.offsetLeft;
    // Keep the chosen marker in view, with some of the days either side
    if (x < tlScroll.scrollLeft + 40 || x > tlScroll.scrollLeft + tlScroll.clientWidth - 40) tlScroll.scrollTo({ left: Math.max(0, x - tlScroll.clientWidth / 2), behavior: reduce.matches ? 'auto' : 'smooth' });
    if (focus) el.focus({ preventScroll: true });
    notesOnly();
  }
  function tlPick(el, focus) { if (el.dataset.item) tlSelect(-1, focus, el.dataset.item); else tlSelect(+el.dataset.k, focus); }
  tlCanvas.addEventListener('click', function (e) { var b = e.target.closest('.tp-tl-mk'); if (b) tlPick(b, false); });
  tlCanvas.addEventListener('keydown', function (e) {
    var b = e.target.closest('.tp-tl-mk'); if (!b) return;
    var on = tlOrder(), at = on.indexOf(b), to = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = on[Math.min(on.length - 1, at + 1)];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = on[Math.max(0, at - 1)];
    else if (e.key === 'Home') to = on[0];
    else if (e.key === 'End') to = on[on.length - 1];
    if (!to) return;
    e.preventDefault();
    tlPick(to, true);
  });
  // Remove an added item from its detail card
  tlDetail.addEventListener('click', function (e) {
    var r = e.target.closest('[data-remove]'); if (!r) return;
    var it = state.added.filter(function (x) { return x.id === r.dataset.remove; })[0];
    tlSelItem = null;
    removeItem(r.dataset.remove);
    document.getElementById('tp-tl-title').focus({ preventScroll: true });
    if (it) say(it.title + ' removed from your timeline. ' + state.added.length + ' added.');
  });
  // The trip line in the open timeline: Change (or Answer) goes to the question below the suggestions
  tlTrip.addEventListener('click', function (e) {
    if (e.target.closest('[data-trip-ok]')) {
      var g = inferTrip();
      if (g) { setTrip({ mode: 'visiting', from: g.from, to: g.to }); say('Your days in NSW are ' + isoRange(g.from, g.to) + '.'); var c = tlTrip.querySelector('[data-ask]'); if (c) c.focus({ preventScroll: true }); }
      return;
    }
    if (!e.target.closest('[data-ask]')) return;
    tlSetOpen(false, false);
    phoneEl.dispatchEvent(new CustomEvent('tp:ask'));
  });
  // The panel's height: as tall as fits under the top of the phone, up to 460px
  function tlFit() { tl.style.setProperty('--tl-p', Math.max(260, Math.min(460, phoneEl.clientHeight - BAR - 72)) + 'px'); }
  tlFit();
  window.addEventListener('resize', tlFit);
  // Shown once the match cards have come into view and their top has passed the top of the phone (never for the fan)
  function tlRef() {
    if (!results.hidden) return deck;
    return allSec && !allSec.hidden ? document.getElementById('tp-all-scroll') : null;
  }
  function syncBar() {
    var ref = tlRef(), r = ref && ref.getBoundingClientRect(), box = body.getBoundingClientRect();
    // The cards' top has passed the top of the phone; or, where the page is too short for that, the cards are in view and
    // the page is scrolled to its end (otherwise the bar could never appear under a short list)
    var atEnd = body.scrollTop + body.clientHeight >= body.scrollHeight - 2;
    var seen = !!(r && r.height > 0 && (r.top < box.top || (atEnd && r.top < box.bottom && r.bottom > box.top)));
    // Once something is on the timeline, the bar stays up anywhere below the fan, so an Add never goes nowhere
    var fanBox = root.querySelector('.tp-fan-wrap').getBoundingClientRect();
    var belowFan = fanBox.height > 0 && fanBox.bottom < box.top;
    // A pick is shown working: the bar is up whenever a team is picked
    var on = tlOpen || state.picked.length > 0 || seen || (state.added.length > 0 && belowFan);
    if (on === tlOn) return;
    tlOn = on;
    tl.classList.toggle('is-on', on);
    tl.inert = !on;
    notesOnly();
  }
  var barRaf = 0;
  body.addEventListener('scroll', function () { if (!barRaf) barRaf = requestAnimationFrame(function () { barRaf = 0; syncBar(); }); }, { passive: true });
  window.addEventListener('resize', syncBar);
  /* The mini strip and the big axis are the same timeline at two scales. Opening, a copy of the axis starts shrunk onto
     the strip (its markers the size of the strip's dots) and grows into place while the sheet rises; closing, it shrinks
     back onto the strip. Both live in the sheet, so their offset holds while the sheet slides. Reduced motion: fades. */
  function tlZoom(open) {
    if (reduce.matches || !tlCanvas.animate) return;
    var tr = tl.getBoundingClientRect(), cr = tlCanvas.getBoundingClientRect(), sr = tl.querySelector('.tp-tl-strip').getBoundingClientRect();
    var k = sr.width / ((DAYS - 1) * DAYW), H = tlCanvas.offsetHeight;
    var cx = cr.left - tr.left, cy = cr.top - tr.top, sx = sr.left - tr.left, sy = sr.top - tr.top + sr.height / 2;
    var small = 'translate(' + (sx - cx - k * PADX) + 'px,' + (sy - cy - k * (H - 44.5)) + 'px) scale(' + k + ')';
    var old = tl.querySelector('.tp-tl-zoom'); if (old) old.remove();
    var z = tlCanvas.cloneNode(true);
    z.removeAttribute('id'); z.removeAttribute('role'); z.setAttribute('aria-hidden', 'true'); z.inert = true;
    z.classList.add('tp-tl-zoom');
    z.style.left = cx + 'px'; z.style.top = cy + 'px';
    tl.appendChild(z);
    tlScroll.style.visibility = 'hidden';
    var frames = [{ transform: small, opacity: .7 }, { transform: 'none', opacity: 1 }];
    var an = z.animate(open ? frames : frames.slice().reverse(), { duration: open ? 420 : 340, easing: open ? 'cubic-bezier(.32, .72, 0, 1)' : 'cubic-bezier(.4, 0, .2, 1)' });
    an.onfinish = an.oncancel = function () { z.remove(); tlScroll.style.visibility = ''; };
  }
  function tlSetOpen(open, focusBack) {
    if (open === tlOpen) return;
    if (!open) tlZoom(false);
    tlOpen = open;
    tl.classList.toggle('is-open', open);
    tlToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    tlPanel.inert = !open;
    body.inert = open; // the screen behind waits under the scrim while the timeline is open
    tlScrim.classList.toggle('is-on', open);
    if (open) {
      tlFit();
      // Open on what matters: the chosen marker; else the days in NSW (confirmed or suggested); else the first thing
      // they added; else the first match shown. Never on empty early October with the trip cut off at the edge.
      var items = Object.keys(tlItemEls).map(function (id) { return tlItemEls[id]; }).sort(function (a, b) { return a.offsetLeft - b.offsetLeft; });
      var start = tlSelEl() || (!tlStay.hidden && tlStay) || items[0] || tlOrder()[0];
      // A short stay sits in the middle of the view, with the days around it either side; a long one starts at the left
      var vw = tlScroll.clientWidth, x = !start ? 0 : start !== tlStay ? start.offsetLeft - 48
        : tlStay.offsetWidth < vw - 96 ? tlStay.offsetLeft + tlStay.offsetWidth / 2 - vw / 2 : tlStay.offsetLeft - 16;
      tlScroll.scrollLeft = Math.max(0, x);
      tlPanel.scrollTop = 0;
      tlZoom(true);
      document.getElementById('tp-tl-title').focus({ preventScroll: true });
    } else if (focusBack !== false) tlToggle.focus({ preventScroll: true });
    syncBar();
    notesOnly();
  }
  tlToggle.addEventListener('click', function () { tlSetOpen(!tlOpen); });
  tlScrim.addEventListener('click', function () { tlSetOpen(false); });
  document.addEventListener('keydown', function (e) { if (tlOpen && e.key === 'Escape') { e.preventDefault(); tlSetOpen(false); } });
  // The prompt that used to sit at the top of the phone: back to the fan
  document.getElementById('tp-tl-pick').addEventListener('click', function () {
    tlSetOpen(false, false);
    deal();
    body.scrollTo({ top: pickTop(), behavior: reduce.matches ? 'auto' : 'smooth' });
    midCard().focus({ preventScroll: true });
  });
  /* ---------- Added items and the trip answer: used by the Where to watch, Suits your 3rd half and question sections
     (concepts-third-half.js) through window.tpPicker. Saved on this device with the picks. ---------- */
  function addItem(it) {
    if (state.added.some(function (x) { return x.id === it.id; })) return false;
    state.added.push(it); save(); changed(); syncBar(); return true;
  }
  function removeItem(id) {
    var n = state.added.length;
    state.added = state.added.filter(function (x) { return x.id !== id; });
    if (state.added.length !== n) { save(); changed(); }
  }
  function setTrip(t) { state.trip = t; save(); changed(); }
  // The added item travels from the button that added it to the timeline bar, then the badge pops
  function flyToBar(fromEl) {
    if (!tlOn || reduce.matches || !fromEl || !document.body.animate) return;
    var a = fromEl.getBoundingClientRect(), b = tl.querySelector('.tp-tl-exp').getBoundingClientRect(), ph = phoneEl.getBoundingClientRect();
    var g = document.createElement('span');
    g.className = 'tp-fly';
    g.style.left = (a.left + a.width / 2 - ph.left - 6) + 'px'; g.style.top = (a.top + a.height / 2 - ph.top - 6) + 'px';
    phoneEl.appendChild(g);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    g.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - 40) + 'px) scale(1.15)', opacity: 1, offset: .5 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.6)', opacity: .2 }],
      { duration: 560, easing: 'cubic-bezier(.45, .05, .25, 1)' }).onfinish = function () { g.remove(); };
  }
  // The person's matches, as the timeline shows them: picked teams', every NSW match for Here for the rugby, or all
  function userMatches() { return TLM.filter(function (m) { return tlShown(m.f); }); }
  // Anything of their own: a team picked, or a match added on its own
  function own() { return state.picked.length > 0 || state.added.some(function (it) { return it.kind === 'match'; }); }
  function allMatches() { return TLM.slice(); }
  // The days in NSW guessed from what they have picked: first to last NSW match. Nothing to go on without a pick.
  function inferTrip() {
    if (!own()) return null;
    var ds = userMatches().filter(function (m) { return !m.f.a; }).map(function (m) { return m.day; });
    if (!ds.length) return null;
    function iso(d) { return new Date(Date.UTC(2027, 9, 1 + d)).toISOString().slice(0, 10); }
    return { from: iso(Math.min.apply(null, ds)), to: iso(Math.max.apply(null, ds)) };
  }
  function tripLine() {
    var t = state.trip;
    if (!t) return '<span>Visiting or local?</span> <button type="button" class="tp-link" data-ask>Answer</button>';
    if (t.mode === 'visiting' && !(t.from && t.to)) {
      var g = inferTrip();
      // A guess is shown as a guess until it is confirmed
      if (g) return '<span>Looks like you\u2019re here <strong>' + esc(isoRange(g.from, g.to)) + '</strong> <span class="tp-tl-sugg">suggested</span></span><span class="tp-tl-trip-acts"><button type="button" class="tp-link" data-trip-ok>That\u2019s right</button> \u00b7 <button type="button" class="tp-link" data-ask>Change</button></span>';
      return '<span>Visiting NSW</span> \u00b7 <button type="button" class="tp-link" data-ask>Add your days</button>';
    }
    var what = t.mode === 'local' ? 'I\u2019m local' : t.mode === 'unsure' ? 'Not sure yet' : 'In NSW ' + isoRange(t.from, t.to);
    return '<span>' + esc(what) + '</span> \u00b7 <button type="button" class="tp-link" data-ask>Change</button>';
  }
  tlReady = true;
  tlUpdate();

  renderChosen();
  caption.textContent = CAPTION_REST;
  restoring = true; renderMatches(); restoring = false;
  syncBar();
  /* ---------- Reset prototype (a reviewer tool in the section header, not part of the design) ----------
     Back to a first visit: nothing picked, no tickets, nothing saved, the picker view, the hand stacked to deal open
     again, and the phone scrolled to the top. */
  var resetBtn = document.getElementById('tp-reset');
  if (resetBtn) resetBtn.addEventListener('click', function () {
    deck.getAnimations && deck.querySelectorAll('*').forEach(function (el) { el.getAnimations().forEach(function (a) { a.cancel(); }); });
    cards.forEach(function (b) { if (b._pull) b._pull.cancel(); b.style.zIndex = ''; });
    state.picked = []; state.tickets = [];
    try { localStorage.removeItem(KEY); } catch (e) {}
    deck.innerHTML = '';
    setNsw(false); clearFind(); offset = START; dealt = false;
    state.tab = 'yours';
    renderChosen();
    renderMatches();
    caption.textContent = CAPTION_REST;
    place(false);
    body.scrollTop = 0;
    tlSetOpen(false, false); tlSel = -1; tlSelItem = null; state.added = []; state.trip = null; save(); changed();
    watchDeal();
    say('Prototype reset. No teams picked.');
  });

  window.tpPicker = { teams: TEAMS, state: state, userMatches: userMatches, addItem: addItem, removeItem: removeItem, setTrip: setTrip,
    flyToBar: flyToBar, say: say, allMatches: allMatches, inferTrip: inferTrip, openTimeline: function () { tlSetOpen(true); }, side: side, esc: esc, list: list, countPhrase: countPhrase, isoRange: isoRange, isoDay: isoDay, dayOf: dayOf, reduce: reduce, body: body,
    rugby: function () { return isPicked(RUGBY); }, picked: function () { return state.picked.length > 0; }, own: own,
    // For the match page (concepts-third-half.js): the match by its key, whether a team is picked, picking a team
    // exactly as the fan does (from: null, as the page covers the fan and the bar), and a ticket mark
    match: function (key) { return TLM_BY[key] || null; }, isPicked: function (n) { return state.picked.indexOf(n) > -1; },
    pickTeam: function (n) { var c = TEAMS[n]; if (!c) return ''; var i = CARDS.indexOf(c); if (pos(i) < 0) setNsw(false); return toggle(i, null, true); },
    setTicket: setTicket, flag: function (n) { return FLAG[n] || ''; } };
  // The sections below the match cards read the picks once this is ready
  phoneEl.dispatchEvent(new CustomEvent('tp:ready'));
})();
