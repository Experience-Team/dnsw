/* Concepts: Pick your team (prototype-pick-your-team.html).
   A fanned hand of cards: the 24 teams, alphabetical. Here for the rugby (every NSW match, no team) is a button under
   the fan, not a card; with teams picked it asks before swapping them, and offers Undo after. Drag or swipe the fan sideways,
   or use the arrow keys; tap or press Space to pick a card (as many as you like). Picking is the action: there is no
   button to press after it. A pick takes effect at once (Your matches, the timeline, Where to watch and Suits your 3rd
   half all follow it) and says what it did: the caption under the fan, the team's matches flying into the timeline
   bar, and the Your matches tab count. Unpicking reverses it. The picker stays on screen throughout.
   Data: window.cnFixtures (concepts-fixtures.js), the 36 pool matches and the knockouts in NSW, kick-offs in Sydney
   time. Nothing else is added: no flags, no community or home-country times, no ticket links.
   Jobs covered (docs/jtbd-itinerary.md): T1 one team, T5 and T7 more than one, T8 and T9 no team, T2 and T12
   tickets, T3 NSW or interstate, T4 knockouts, T6 a shared match noted on both cards, T15 saved on this device,
   T16 no team (set your days in NSW in the open timeline), T12 a single match from All matches, and Clear all. The choice is kept in this browser under tp-pick-v1; ?reset clears it. */
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
  var rugbyLinks = [].slice.call(root.ownerDocument.querySelectorAll('#tp-phone [data-rugby]'));
  var picker = document.getElementById('tp-picker');
  var results = document.getElementById('tp-results');
  var deck = document.getElementById('tp-deck');
  var sum = document.getElementById('tp-results-sum');
  var live = document.getElementById('tp-live');
  /* Icons for prompts, greyscale and decorative (aria-hidden), sized to the text. From the Rugby World Cup Figma:
     card fan (node 252:13225) and calendar (node 254:13291), each one filled path in the text colour */
  window.tpIcons = {
    fan: '<svg class="tp-ico tp-ico-fan" viewBox="0 0 36 33" aria-hidden="true" focusable="false"><path d="M31.313 0.355164L20.0081 0.482213C19.2242 0.491107 18.4682 0.721491 17.819 1.13186L12.5913 2.55355C12.5718 2.55905 12.5524 2.56498 12.5333 2.57176L10.7483 3.19176L10.7474 3.19007L10.7381 3.19515L10.5327 3.2663C10.0258 3.44247 9.56374 3.71224 9.16565 4.05697L7.62792 4.89973L6.57341 5.48713L6.55647 5.46426L6.38876 5.59004L5.87337 5.87674C5.41768 6.13084 5.0179 6.46583 4.69011 6.86138L2.0208 8.85903C2.01317 8.86453 2.0064 8.87004 1.9992 8.87596C1.12594 9.57389 0.577511 10.57 0.453849 11.68C0.331882 12.7785 0.639766 13.8593 1.32245 14.7266L12.1623 30.7315C12.1746 30.7497 12.1886 30.7679 12.2026 30.7857C13.0525 31.8491 14.3192 32.3865 15.5846 32.3535C16.4587 32.3302 17.3324 32.035 18.068 31.451L21.0723 29.2365L24.4654 28.5962L26.1967 28.2714L26.1878 28.4069L31.6632 28.5585C31.6852 28.5577 31.7064 28.5572 31.7284 28.5568C33.9988 28.4971 35.8194 26.3864 35.794 24.1139L35.5462 4.5982C35.5204 2.2914 33.6198 0.329754 31.313 0.355164ZM9.74076 6.02793C9.85637 5.81661 10.0021 5.62603 10.1706 5.46002L11.436 4.76633L12.0675 4.54696C11.7337 5.3101 11.63 6.16345 11.7854 6.99309L15.0993 26.0844L9.5811 8.05946C9.57814 8.04929 9.57475 8.03955 9.57136 8.02897C9.34225 7.37 9.40408 6.64074 9.74076 6.02793ZM15.8713 4.71339L16.0865 21.7563L13.4718 6.69452C13.4709 6.69029 13.4701 6.68605 13.4692 6.68182C13.3413 6.00295 13.5057 5.29613 13.9203 4.74219C14.2908 4.24712 14.8304 3.91086 15.4389 3.79609L15.9836 3.69361C15.9052 4.02394 15.8671 4.36528 15.8713 4.71339ZM7.74523 6.79574C7.68425 7.39075 7.74989 7.99848 7.94809 8.57528L13.4883 26.6727L5.77342 10.7775C5.76622 10.7631 5.7586 10.7487 5.75097 10.7347C5.40582 10.1147 5.34399 9.37442 5.58285 8.70402C5.66077 8.48507 5.76834 8.28052 5.90132 8.09503L7.32258 7.0312L7.74523 6.79574ZM2.6823 13.6852C2.26981 13.1698 2.08347 12.5253 2.15674 11.8697C2.22873 11.2183 2.54975 10.6339 3.05922 10.2218L3.73258 9.7183C3.76011 10.3523 3.9312 10.9782 4.24247 11.5453L11.8447 27.2084L2.72253 13.7399C2.70941 13.7212 2.69628 13.703 2.6823 13.6852ZM34.0754 23.9225C34.0903 25.2641 33.0125 26.3843 31.6721 26.4194L20.3274 26.5482C18.965 26.563 17.8444 25.467 17.8292 24.1041L17.5844 4.69349C17.578 4.1476 17.7474 3.62796 18.0731 3.19134C18.1167 3.13162 18.1616 3.07657 18.2052 3.02744C18.6647 2.5095 19.2979 2.21432 19.9882 2.19611L31.3324 2.06822C32.6948 2.05297 33.8158 3.14899 33.8307 4.51223L34.0754 23.9225Z"/></svg>',
    cal: '<svg class="tp-ico tp-ico-cal" viewBox="0 0 28 32" aria-hidden="true" focusable="false"><path d="M9.5 4H18.5V1.5C18.5 0.6875 19.125 0 20 0C20.8125 0 21.5 0.6875 21.5 1.5V4H24C26.1875 4 28 5.8125 28 8V28C28 30.25 26.1875 32 24 32H4C1.75 32 0 30.25 0 28V8C0 5.8125 1.75 4 4 4H6.5V1.5C6.5 0.6875 7.125 0 8 0C8.8125 0 9.5 0.6875 9.5 1.5V4ZM3 28C3 28.5625 3.4375 29 4 29H24C24.5 29 25 28.5625 25 28V12H3V28Z"/></svg>'
  };
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
  /* Team flags from the Rugby World Cup Figma Flag Pack (node 170:129), one SVG per team in flags/ (25 x 16). England,
     Scotland and Wales use their own flags. Decorative everywhere: the team name is always said alongside. */
  var FLAG_FILE = { 'Argentina': 'argentina', 'Australia': 'australia', 'Canada': 'canada', 'Chile': 'chile', 'England': 'england', 'Fiji': 'fiji', 'France': 'france', 'Georgia': 'georgia', 'Hong Kong China': 'hongkong', 'Ireland': 'ireland', 'Italy': 'italy', 'Japan': 'japan', 'New Zealand': 'newzealand', 'Portugal': 'portugal', 'Romania': 'romania', 'Samoa': 'samoa', 'Scotland': 'scotland', 'South Africa': 'southafrica', 'Spain': 'spain', 'Tonga': 'tonga', 'USA': 'unitedstates', 'Uruguay': 'uruguay', 'Wales': 'wales', 'Zimbabwe': 'zimbabwe' };
  var FLAG = {};
  Object.keys(FLAG_FILE).forEach(function (n) { FLAG[n] = '<img class="tp-fl" src="flags/' + FLAG_FILE[n] + '.svg" alt="" width="25" height="16" decoding="async">'; });
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
  var CARDS = names.map(function (n) { return TEAMS[n]; });
  var R16 = FIX.filter(function (f) { return /^Round of 16/.test(f.s); });

  /* ---------- State, kept in this browser ---------- */
  var KEY = 'tp-pick-v1';
  // added: things put on the timeline (screenings, the village, products); trip: the one optional question's answer
  // tab: which of Your matches and All matches is chosen once a team is picked (kept, like everything else, on reload)
  var state = { picked: [], tickets: [], tab: 'yours', added: [], trip: null, allFilter: { nsw: false, city: null } };
  try {
    if (/[?&]reset\b/.test(location.search)) localStorage.removeItem(KEY);
    var rec = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (rec && Array.isArray(rec.picked)) {
      state.picked = rec.picked.filter(function (n) { return n === RUGBY.name || TEAMS[n]; });
      state.tickets = Array.isArray(rec.tickets) ? rec.tickets.filter(function (x) { return typeof x === 'string'; }) : [];
      if (rec.tab === 'all') state.tab = 'all';
    }
    // All matches filter: In NSW only, then one host city (kept on reload)
    if (rec && rec.allFilter && rec.allFilter.nsw === true) state.allFilter = { nsw: true, city: typeof rec.allFilter.city === 'string' ? rec.allFilter.city : null };
    if (rec && Array.isArray(rec.added)) state.added = rec.added.filter(function (x) { return x && typeof x.id === 'string' && typeof x.day === 'string'; });
    if (rec && rec.trip && /^(visiting|local|unsure)$/.test(rec.trip.mode)) state.trip = rec.trip;
  } catch (e) { /* storage blocked: the picker still works, it just is not kept */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  // Tells the annotation layer (prototype-pick-your-team.html) that what is on screen has changed
  // Tells the annotation layer that what is on screen has changed
  function notesOnly() { document.getElementById('tp-phone').dispatchEvent(new CustomEvent('tp:state')); }
  // Picks, tickets or the screen changed: the timeline follows, then the annotations
  var tlReady = false;
  function changed() { if (tlReady) { tlUpdate(); syncBar(); markRows(); } if (tlClearBtn) tlClearSync(); notesOnly(); }
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
    else if (on && !c.rugby && isPicked(RUGBY)) { state.picked = state.picked.filter(function (n) { return n !== RUGBY.name; }); note = ' Here for the rugby is off.'; }
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
    if (c.rugby) return 'Every NSW match added: ' + countPhrase(nswPool.concat(nswKo));
    return c.name + ' added: ' + countPhrase(c.matches) + ', ' + (c.nsw ? c.nsw + ' in NSW' : 'all interstate');
  }
  var CAPTION_REST = 'Tap a card to add its matches. Tap it again to take it off.';
  // undo: a function, to offer Undo in the caption for a few seconds (after Clear all)
  var undoTimer = 0;
  function showCaption(lead, rest, note, undo) {
    clearTimeout(undoTimer);
    caption.innerHTML = '<span aria-hidden="true"><span class="tp-cap-new">' + esc(lead) + '</span>' + esc(rest || '') + (note ? '<span class="tp-cap-note">. ' + esc(note.trim()) + '</span>' : '') + '</span>' +
      (undo ? ' <button type="button" class="tp-link tp-undo" id="tp-undo">Undo</button>' : '');
    if (undo) {
      var u = caption.querySelector('#tp-undo');
      u.addEventListener('click', function () { clearTimeout(undoTimer); undo(u); });
      // It goes after six seconds; if it had focus, focus goes to the button it came from
      undoTimer = setTimeout(function () { var had = document.activeElement === u; u.remove(); if (had) { var mid = fan.querySelector('.tp-card.is-mid'); if (mid) mid.focus({ preventScroll: true }); } }, 6000);
    }
    var n = caption.querySelector('.tp-cap-new');
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
    var quiet = reduce.matches || !src || !document.body.animate || !src.getClientRects().length || stackEl === tsSheet; // in the Your teams sheet, the bar is behind
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
  /* Find your team: an icon button by the heading. Open, the field slides across the heading row from the icon (clip,
     so nothing below moves) with the keyboard up; Escape, the cross or a tap elsewhere with nothing typed folds it back
     into the icon, and focus returns to the icon */
  var findBox = document.getElementById('tp-find'), findOpen = document.getElementById('tp-find-open'), findAnim = null;
  // The indicative keyboard rises with the field and goes with it; the heading row is brought near the top of the
  // phone first, so the suggestions under it stay clear of the keyboard
  var kbd = document.getElementById('tp-kbd'), kbdAnim = null;
  function showKbd(on) {
    if (!kbd) return;
    if (kbdAnim) { kbdAnim.cancel(); kbdAnim = null; }
    if (on) {
      kbd.hidden = false;
      if (!reduce.matches && kbd.animate) kbdAnim = kbd.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.3, .4, .3, 1)' });
    } else if (!kbd.hidden) {
      if (!reduce.matches && kbd.animate) { kbdAnim = kbd.animate([{ transform: 'none' }, { transform: 'translateY(100%)' }], { duration: 180, easing: 'cubic-bezier(.4, 0, 1, 1)' }); kbdAnim.onfinish = function () { kbd.hidden = true; kbdAnim = null; }; }
      else kbd.hidden = true;
    }
  }
  if (kbd) kbd.addEventListener('pointerdown', function (e) { e.preventDefault(); }); // a picture: tapping it does nothing and keeps the field focused
  function openFind() {
    if (!findBox || !findBox.hidden) { if (findIn) findIn.focus(); return; }
    if (findAnim) findAnim.cancel();
    findBox.hidden = false; findOpen.setAttribute('aria-expanded', 'true');
    var head = root.querySelector('.tp-pick-head'), top = head.getBoundingClientRect().top - body.getBoundingClientRect().top;
    if (top < 8 || top > 120) body.scrollTo({ top: Math.max(0, body.scrollTop + top - 16), behavior: reduce.matches ? 'auto' : 'smooth' });
    showKbd(true);
    if (!reduce.matches && findBox.animate) findAnim = findBox.animate([{ clipPath: 'inset(0 0 0 calc(100% - 40px) round 999px)', opacity: .6 }, { clipPath: 'inset(0 0 0 0 round 999px)', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.3, .4, .3, 1)' });
    findIn.focus({ preventScroll: true });
    notesOnly();
  }
  function closeFind(focusBtn) {
    if (!findBox || findBox.hidden) return;
    clearFind();
    findOpen.setAttribute('aria-expanded', 'false');
    showKbd(false);
    var done = function () { findBox.hidden = true; findAnim = null; notesOnly(); };
    if (findAnim) findAnim.cancel();
    if (!reduce.matches && findBox.animate) { findAnim = findBox.animate([{ clipPath: 'inset(0 0 0 0 round 999px)', opacity: 1 }, { clipPath: 'inset(0 0 0 calc(100% - 40px) round 999px)', opacity: 0 }], { duration: 180, easing: 'cubic-bezier(.4, 0, 1, 1)' }); findAnim.onfinish = done; }
    else done();
    if (focusBtn) findOpen.focus({ preventScroll: true });
  }
  if (findOpen) findOpen.addEventListener('click', openFind);
  if (findBox) document.getElementById('tp-find-close').addEventListener('click', function () { closeFind(true); });
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
      else if (e.key === 'Escape') { e.preventDefault(); closeFind(true); }
      else if (e.key === 'ArrowDown' && found.length) { e.preventDefault(); findList.querySelector('.tp-find-opt').focus(); }
    });
    findList.addEventListener('click', function (e) { var b = e.target.closest('.tp-find-opt'); if (b) pickFound(b.dataset.team); });
    findList.addEventListener('keydown', function (e) {
      var b = e.target.closest('.tp-find-opt'); if (!b) return;
      var all = Array.prototype.slice.call(findList.querySelectorAll('.tp-find-opt')), k = all.indexOf(b);
      if (e.key === 'ArrowDown') { e.preventDefault(); (all[k + 1] || all[k]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (k ? all[k - 1] : findIn).focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeFind(true); }
    });
    // Leaving the field and its suggestions closes them; the text stays so nothing typed is lost
    // A tap elsewhere hides the suggestions; with nothing typed it also folds the search back into its icon
    document.addEventListener('pointerdown', function (e) { if (!e.target.closest('.tp-find') && !e.target.closest('#tp-find-open') && !e.target.closest('#tp-kbd')) { findList.hidden = true; findIn.setAttribute('aria-expanded', 'false'); if (!findIn.value.trim() && !findBox.hidden) closeFind(false); } });
    findIn.addEventListener('focus', function () { if (findIn.value.trim()) renderFind(); });
  }

  /* ---------- Your teams: the list editor in the sheet over the timeline ----------
     No fan here (the fan is on the page). Pinned at the top: your picks as removable chips, the count of their matches,
     the last change with Undo where offered, and a search field; only the list scrolls; Done is pinned. Every NSW match
     comes first; then your picks, teams with NSW matches and interstate teams, each A to Z. The order is set on open
     and when the search clears, never on a tap, so a row never jumps from under the finger. Team rows go through the
     fan's own toggle (the same state, swap rule, saving and timeline); tsSync() runs on every change. */
  var tsSheet = document.getElementById('tp-ts'), tsList = document.getElementById('tp-ts-list'), tsFind = document.getElementById('tp-ts-find');
  var tsChips = document.getElementById('tp-ts-chips'), tsCount = document.getElementById('tp-ts-count-text'), tsEmpty = document.getElementById('tp-ts-empty');
  var tsClear = document.getElementById('tp-ts-clear'), tsNoteEl = document.getElementById('tp-ts-note'), tsNone = document.getElementById('tp-ts-none'), tsNoteT = 0;
  var tsLink = document.getElementById('tp-tl-teams'), tsLinkBtn = document.getElementById('tp-tl-teams-btn');
  // Name or code, matching the start of a word: "zea" finds New Zealand, "rsa" finds South Africa (as the page search)
  function teamMatch(n, q) { return n.toLowerCase().split(/\s+/).some(function (w) { return w.indexOf(q) === 0; }) || n.toLowerCase().indexOf(q) === 0 || TEAMS[n].code.toLowerCase() === q; }
  function tsRow(key, flag, name, meta) {
    return '<li><button type="button" class="tp-find-opt tp-list-opt" data-team="' + esc(key) + '" aria-pressed="false">' +
      (flag ? '<span class="tp-find-flag" aria-hidden="true">' + flag + '</span>' : '<span class="tp-find-flag tp-list-all" aria-hidden="true"></span>') +
      '<span class="tp-find-text"><span class="tp-find-name">' + esc(name) + '</span><span class="tp-find-meta">' + esc(meta) + '</span></span>' +
      '<span class="tp-find-state" aria-hidden="true">Pick</span></button></li>';
  }
  function tsBuild() {
    var mine = names.filter(function (n) { return isPicked(TEAMS[n]); });
    var rest = names.filter(function (n) { return !isPicked(TEAMS[n]); });
    var order = mine.concat(rest.filter(function (n) { return TEAMS[n].nsw; }), rest.filter(function (n) { return !TEAMS[n].nsw; }));
    tsList.innerHTML = tsRow(RUGBY.name, '', 'Every NSW match', 'No team needed: ' + countPhrase(nswPool.concat(nswKo), { short: true })) +
      order.map(function (n) { var t = TEAMS[n]; return tsRow(n, FLAG[n], n, t.pool + ' · ' + nswLine(t)); }).join('');
  }
  function tsMatches() {
    if (isPicked(RUGBY)) return nswPool.concat(nswKo);
    var seen = {}, out = [];
    teamsPicked().forEach(function (n) { TEAMS[n].matches.forEach(function (f) { var k = f.d + '|' + f.t; if (!seen[k]) { seen[k] = 1; out.push(f); } }); });
    return out;
  }
  function tsSync() {
    if (!tsList) return;
    tsList.querySelectorAll('.tp-list-opt').forEach(function (b) {
      var on = state.picked.indexOf(b.dataset.team) > -1;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.lastElementChild.textContent = on ? 'Picked' : 'Pick';
    });
    var picks = state.picked.slice();
    tsChips.innerHTML = picks.map(function (n) {
      var label = n === RUGBY.name ? 'Every NSW match' : n;
      return '<li><button type="button" class="tp-ts-chip" data-team="' + esc(n) + '" aria-label="Remove ' + esc(label) + '">' +
        (FLAG[n] ? '<span aria-hidden="true">' + FLAG[n] + '</span>' : '') + '<span>' + esc(label) + '</span><svg class="tp-ts-chip-x" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button></li>';
    }).join('');
    tsChips.hidden = !picks.length; tsEmpty.hidden = !!picks.length;
    var fs = tsMatches(), nsw = fs.filter(function (f) { return !f.a; }).length;
    tsCount.textContent = picks.length ? countPhrase(fs, { short: true }) + ' · ' + nsw + ' in NSW' : '';
    tsCount.parentNode.hidden = !picks.length;
    tsClear.hidden = teamsPicked().length < 2;
  }
  // The last change, said where the eye is; Undo, when offered, stays for six seconds
  function tsNote(text, undo) {
    clearTimeout(tsNoteT);
    tsNoteEl.textContent = text;
    if (undo) {
      var u = document.createElement('button'); u.type = 'button'; u.className = 'tp-link'; u.textContent = 'Undo';
      u.addEventListener('click', function () { clearTimeout(tsNoteT); undo(); });
      tsNoteEl.appendChild(document.createTextNode(' ')); tsNoteEl.appendChild(u);
      tsNoteT = setTimeout(function () { var had = document.activeElement === u; u.remove(); if (had) tsFind.focus({ preventScroll: true }); }, 6000);
    }
  }
  function tsFilter() {
    var q = tsFind.value.trim().toLowerCase(), shown = 0;
    tsList.querySelectorAll('li').forEach(function (li) {
      var n = li.firstElementChild.dataset.team;
      var hit = !q || (n === RUGBY.name ? /^(every|nsw|all|rugby)/.test(q) || 'every nsw match'.indexOf(q) === 0 : teamMatch(n, q));
      li.hidden = !hit; if (hit) shown++;
    });
    tsNone.hidden = shown > 0;
    tsNone.textContent = shown ? '' : 'No team matches “' + tsFind.value.trim() + '”. Try the country’s name, for example New Zealand.';
    return shown;
  }
  // Every NSW match on or off; on replaces the teams, with Undo
  function tsRugby(from) {
    var on = !isPicked(RUGBY), prev = state.picked.slice(), swapped = on && teamsPicked().length > 0;
    setRugby(on, from);
    var lead = on ? 'Every NSW match added' : 'Every NSW match removed', rest = on ? ': ' + countPhrase(nswPool.concat(nswKo), { short: true }) : '';
    showCaption(lead, rest);
    tsNote(lead + rest + '.' + (swapped ? ' Your teams are cleared.' : ''), swapped ? function () {
      state.picked = prev; save(); place(true); renderChosen(); renderMatches();
      tsNote('Your teams are back: ' + list(prev) + '.');
      say('Undone. Your teams are back.');
      tsFind.focus({ preventScroll: true });
    } : null);
    say(lead + rest + '.' + (swapped ? ' Your teams are cleared. Undo is available for a few seconds.' : ''));
  }
  function tsTeam(n, from) {
    var i = CARDS.indexOf(TEAMS[n]), wasR = isPicked(RUGBY), on = !isPicked(TEAMS[n]);
    if (pos(i) < 0) setNsw(false);
    var msg = toggle(i, from);
    tsNote(msg + '.' + (on && wasR ? ' Every NSW match is off.' : ''));
  }
  if (tsList) {
    tsList.addEventListener('click', function (e) {
      var b = e.target.closest('.tp-list-opt'); if (!b) return;
      if (b.dataset.team === RUGBY.name) tsRugby(b); else tsTeam(b.dataset.team, b);
      b.focus({ preventScroll: true });
    });
    tsChips.addEventListener('click', function (e) {
      var c = e.target.closest('.tp-ts-chip'); if (!c) return;
      var all = Array.prototype.slice.call(tsChips.querySelectorAll('.tp-ts-chip')), k = all.indexOf(c), n = c.dataset.team;
      if (n === RUGBY.name) tsRugby(c); else tsTeam(n, c);
      var next = tsChips.querySelectorAll('.tp-ts-chip');
      (next[Math.min(k, next.length - 1)] || tsFind).focus({ preventScroll: true });
    });
    tsClear.addEventListener('click', function () {
      clearBtn.click(); // the page's own Clear all: teams and their ticket marks, with Undo
      tsNote('All teams cleared.', function () { var u = document.getElementById('tp-undo'); if (u) u.click(); tsNote('Your teams are back.'); tsFind.focus({ preventScroll: true }); });
      tsFind.focus({ preventScroll: true });
    });
    tsFind.addEventListener('input', function () {
      if (!tsFind.value.trim()) tsBuild(), tsSync();
      var n = tsFilter();
      if (tsFind.value.trim()) say(n ? n + (n === 1 ? ' team matches.' : ' teams match.') : 'No team matches.');
    });
    tsFind.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && tsFind.value) { e.preventDefault(); e.stopPropagation(); tsFind.value = ''; tsBuild(); tsSync(); tsFilter(); }
      else if (e.key === 'Enter') { var first = tsList.querySelector('li:not([hidden]) .tp-list-opt'); if (first && tsFind.value.trim()) { e.preventDefault(); first.click(); } }
      else if (e.key === 'ArrowDown') { var f = tsList.querySelector('li:not([hidden]) .tp-list-opt'); if (f) { e.preventDefault(); f.focus(); } }
    });
    tsList.addEventListener('keydown', function (e) {
      var b = e.target.closest('.tp-list-opt'); if (!b) return;
      var all = Array.prototype.slice.call(tsList.querySelectorAll('li:not([hidden]) .tp-list-opt')), k = all.indexOf(b);
      if (e.key === 'ArrowDown') { e.preventDefault(); (all[k + 1] || b).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (k ? all[k - 1] : tsFind).focus(); }
    });
  }
  function tsOpen(opener) {
    if (!tlOpen) return;
    tsFind.value = ''; tsBuild(); tsSync(); tsFilter();
    clearTimeout(tsNoteT); tsNoteEl.textContent = '';
    document.getElementById('tp-ts-body').scrollTop = 0;
    stackOpen(tsSheet, opener);
    // After a frame: with reduced motion the sheet's contents become visible over 1ms, and a hidden field cannot take focus
    setTimeout(function () { if (stackEl === tsSheet) tsFind.focus({ preventScroll: true }); }, 30);
  }
  if (tsSheet) tsSheet.addEventListener('tp:stackclose', function () {
    var a = document.activeElement;
    if (!a || a === document.body || !tl.contains(a) || !a.offsetParent) (tsLink.hidden ? document.getElementById('tp-tl-pick') : tsLinkBtn).focus({ preventScroll: true });
  });

  function chosenText() {
    var n = state.picked.length;
    if (!n) return 'No teams picked yet.';
    var teams = state.picked.filter(function (x) { return x !== RUGBY.name; });
    var rugby = state.picked.length > teams.length;
    return (teams.length ? 'Picked: ' + list(teams) : '') + (rugby ? (teams.length ? ', plus every NSW match.' : 'Here for the rugby: every NSW match.') : '.');
  }
  function renderChosen() {
    chosenEl.textContent = chosenText();
    tsSync();
    clearBtn.hidden = !teamsPicked().length; // teams only: with just every NSW match on, it stays hidden; the link in All matches removes them
    // The quiet links: with no team, add every NSW match; on, take them off; hidden while teams are picked
    var r = isPicked(RUGBY), hide = teamsPicked().length > 0;
    rugbyLinks.forEach(function (a) {
      // In the timeline it is part of the empty state only, so it goes with any pick (on, it shows in All matches)
      a.parentNode.hidden = a.parentNode.id === 'tp-tl-rugby' ? state.picked.length > 0 : hide;
      a.setAttribute('aria-pressed', r ? 'true' : 'false');
      a.textContent = r ? 'Every NSW match added. Remove them' : 'Not following a team? Add every NSW match';
    });
    changed(); // after the label is rewritten, which would otherwise wipe the annotation badge
  }
  // Clear all: every card back in the hand and every ticket mark gone, so the picker starts again
  clearBtn.addEventListener('click', function () {
    var before = ownKeys(), old = tlValue.textContent, bar = tlOn;
    var prevPicked = state.picked.slice(), prevTickets = state.tickets.slice(), prevTab = state.tab;
    state.picked = [];
    // Tickets go with the teams; a ticket on a match added on its own stays with that match
    var keepT = addedMatches().map(function (m) { return idOf(m.f); });
    state.tickets = state.tickets.filter(function (x) { return keepT.indexOf(x) > -1; });
    var dropped = prevTickets.length - state.tickets.length;
    save();
    place(true);
    renderChosen();
    renderMatches();
    pickFlights(null, before, old, bar);
    // Undo for a few seconds: the teams and their ticket marks come back exactly as they were. Focus goes to Undo, as
    // the button has just hidden itself; when Undo goes, focus goes to the middle card
    showCaption('All teams cleared', '', '', function (u) {
      var b2 = ownKeys(), o2 = tlValue.textContent, bar2 = tlOn;
      state.picked = prevPicked; state.tickets = prevTickets; state.tab = prevTab;
      save(); place(true); renderChosen(); renderMatches(null, null, prevTab === 'all');
      pickFlights(u, b2, o2, bar2);
      showCaption('Your teams are back', ': ' + list(prevPicked.map(function (n) { return n === RUGBY.name ? 'every NSW match' : n; })));
      say('Undone. Your teams' + (prevTickets.length ? ' and ticket marks' : '') + ' are back.');
      clearBtn.focus({ preventScroll: true });
      notesOnly();
    });
    notesOnly();
    var undoBtn = document.getElementById('tp-undo');
    (undoBtn || midCard()).focus({ preventScroll: true });
    say('All teams' + (dropped ? ' and ' + dropped + (dropped === 1 ? ' ticket mark' : ' ticket marks') : '') + ' cleared. Undo is available for a few seconds.');
  });
  /* ---------- Here for the rugby: a quiet link, every NSW match and no team ----------
     In All matches and the timeline's empty state, only while no team is picked (so it never has to replace teams).
     Pressed again it comes off. Same feedback as a pick: one sweep of dots into the bar from the link, the tab count,
     the live region. Picking a team while it is on takes it off. */
  function setRugby(on, from, keepTab) {
    var before = ownKeys(), oldValue = own() ? tlValue.textContent : 'Adding matches\u2026', barWasOn = tlOn;
    if (on) state.picked = [RUGBY.name]; else state.picked = state.picked.filter(function (n) { return n !== RUGBY.name; });
    save();
    place(true);
    renderChosen();
    renderMatches(on ? RUGBY.name : null, on ? null : RUGBY.name, keepTab);
    pickFlights(from, before, oldValue, barWasOn, on, 0);
  }
  function teamsPicked() { return state.picked.filter(function (n) { return n !== RUGBY.name; }); }
  rugbyLinks.forEach(function (a) {
    a.addEventListener('click', function () {
      var on = !isPicked(RUGBY), inTl = tlPanel.contains(a);
      // From the open timeline there is nothing to fly from: the markers appear in place. From All matches, All
      // matches stays the chosen tab, so the link (now Remove them) stays where it was, with focus on it
      setRugby(on, inTl ? null : a, !inTl);
      var lead = on ? 'Every NSW match added' : 'Every NSW match removed';
      showCaption(lead, on ? ': ' + countPhrase(nswPool.concat(nswKo)) : '');
      say(lead + (on ? ': ' + countPhrase(nswPool.concat(nswKo)) : '') + '.');
      if (inTl && on) document.getElementById('tp-tl-title').focus({ preventScroll: true });
      else if (!inTl) a.focus({ preventScroll: true });
      notesOnly();
    });
  });

  /* ---------- Your matches: a card per picked team, built as picks change ----------
     A match between two picked teams appears once, on the card of the team picked first; the other card says where it
     is. Matches added one at a time from All matches (with no team of theirs in it) get a card of their own. */
  function others(f, self) {
    // Picked teams also in this match, other than the card it sits on
    return f.t.split(' v ').filter(function (n) { return n !== self && state.picked.indexOf(n) > -1; });
  }
  var TICKET_WHY = 'Tick \u2018I have a ticket\u2019 for the ones you\u2019ll be at, so we skip their screenings and plan your days around them.', TICKET_WHY_P = '<p class="tp-ticket-why">' + TICKET_WHY + '</p>';
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
      // Why the ticket tick is asked, once per card, under the card's head; each tick points to it (aria-describedby)
      TICKET_WHY_P +
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
      TICKET_WHY_P + '<ol class="tp-ms">' + ms.map(function (m) { return m.f.t ? row(m.f, '', true) : '<li class="tp-m"><p class="tp-m-when">' + esc(m.f.d) + ', ' + esc(m.f.k || 'time to be confirmed') + '</p><p class="tp-m-teams">' + esc(m.f.s) + '</p><p class="tp-m-where">' + esc(m.f.v + ', ' + m.f.p) + '</p><span class="tp-tag">Teams to be decided</span></li>'; }).join('') + '</ol></div></div></article>';
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
    // Each card's ticks are described by that card's line on why a ticket is asked
    [].forEach.call(deck.querySelectorAll('.tp-rcard'), function (card, i) {
      var w = card.querySelector('.tp-ticket-why'); if (!w) return;
      w.id = 'tp-tw-' + i;
      [].forEach.call(card.querySelectorAll('input[data-match]'), function (inp) { inp.setAttribute('aria-describedby', w.id); });
    });
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
  // Host venues (cnVenues): nsw drives In NSW only, city the city chips. A fixture whose venue is not in the list
  // falls back to the fixture's own marker (a: a city outside NSW)
  var allReset = null; // set below: back to every match, filter off (the reset needs it from outside the block)
  var VENUES = {}; (window.cnVenues || []).forEach(function (v) { VENUES[v.stadium] = v; });
  function inNsw(f) { var v = VENUES[f.v]; return v ? v.nsw : !f.a; }
  function cityOf(f) { var v = VENUES[f.v]; return v && v.nsw ? v.city : null; }
  if (allSec) {
    var ALL = FIX.slice().sort(function (a, b) { return ord(a.d) - ord(b.d) || minutes(a.k) - minutes(b.k); });
    function rowHtml(f) {
      // Every row is three lines, so a column of knockouts is no taller than a column of pool matches (which would
      // leave an empty band under the others): a knockout's stage joins the date line, "teams to be decided" its name
      var ko = !/^Pool /.test(f.s);
      var who = f.t ? f.t.split(' v ').map(side).join(' <span class="tp-all-v">v</span> ') : esc(f.s) + ' <span class="tp-all-v">· teams to be decided</span>';
      return '<li class="tp-all-m' + (f.a ? ' is-away' : '') + '" data-key="' + esc(f.d + '|' + (f.t || f.s)) + '"><button type="button" class="tp-all-btn" data-open="match:' + esc(f.d + '|' + (f.t || f.s)) + '" aria-haspopup="dialog">' +
        '<span class="tp-all-when">' + esc(f.d) + ', ' + esc(f.k || 'time to be confirmed') + (ko && f.t ? ' · ' + esc(f.s.replace(/ \(\d+\)$/, '')) : '') + '</span><span class="tp-all-teams">' + who + '</span>' +
        '<span class="tp-all-where">' + esc(f.v + ', ' + f.p) + (f.a ? ' (interstate)' : '') + '</span></button></li>';
    }
    var allScroll = document.getElementById('tp-all-scroll'), allBtns = [], allAt = 0;
    var allNote = document.getElementById('tp-all-note'), allHint = document.getElementById('tp-all-hint');
    var allEmpty = document.getElementById('tp-all-empty'), nswChip = document.getElementById('tp-all-nsw'), cityBox = document.getElementById('tp-all-cities');
    // The NSW host cities, from the fixtures, each with its count (most matches first, then name)
    var CITIES = {};
    ALL.forEach(function (f) { var c = cityOf(f); if (c) CITIES[c] = (CITIES[c] || 0) + 1; });
    var cityNames = Object.keys(CITIES).sort(function (a, b) { return CITIES[b] - CITIES[a] || a.localeCompare(b); });
    // A segmented control: the cities side by side in one pill, with a dark thumb that slides to the one chosen
    cityBox.innerHTML = '<span class="tp-seg-thumb" aria-hidden="true"></span>' + cityNames.map(function (c) { return '<button type="button" class="tp-seg-btn" data-city="' + esc(c) + '" aria-pressed="false">' + esc(c) + '<span class="tp-fchip-n"> · ' + CITIES[c] + '</span></button>'; }).join('');
    var segThumb = cityBox.querySelector('.tp-seg-thumb');
    function placeThumb() {
      var on = cityBox.querySelector('[aria-pressed="true"]'), had = cityBox.classList.contains('has-sel');
      cityBox.classList.toggle('has-sel', !!on);
      if (!on) return; // fades out where it was
      // Appearing (none chosen before): it starts at its place and fades in; moving: it slides from the last one
      if (!had) { segThumb.style.transition = 'none'; }
      segThumb.style.left = on.offsetLeft + 'px'; segThumb.style.width = on.offsetWidth + 'px';
      if (!had) { void segThumb.offsetWidth; segThumb.style.transition = ''; }
    }
    function allShown() {
      var fl = state.allFilter;
      return ALL.filter(function (f) { return !fl.nsw || (inNsw(f) && (!fl.city || cityOf(f) === fl.city)); });
    }
    function allWhat(n) {
      var fl = state.allFilter, m = n + (n === 1 ? ' match' : ' matches');
      return !fl.nsw ? 'Every match of the tournament' : fl.city ? m + ' in ' + fl.city : m + ' in NSW';
    }
    // Rebuild the list for the filter: columns of five as before, back at the first column, one tab stop
    function renderAll(announce) {
      var shown = allShown(), cols = '';
      for (var c0 = 0; c0 < shown.length; c0 += 5) {
        var last = Math.min(c0 + 5, shown.length);
        cols += '<ol class="tp-all-col" aria-label="Matches ' + (c0 + 1) + ' to ' + last + ' of ' + shown.length + '">' + shown.slice(c0, last).map(rowHtml).join('') + '</ol>';
      }
      allScroll.innerHTML = cols;
      allScroll.scrollLeft = 0;
      allBtns = Array.prototype.slice.call(allScroll.querySelectorAll('.tp-all-btn')); allAt = 0;
      allBtns.forEach(function (b, k) { b.tabIndex = k ? -1 : 0; });
      var fl = state.allFilter, none = !shown.length;
      allNote.textContent = allWhat(shown.length) + ', by date. Tap one for its details.';
      allNote.hidden = none; // the empty message below says it instead
      allScroll.hidden = none; allHint.hidden = none || shown.length <= 5;
      allEmpty.hidden = !none;
      if (none) document.getElementById('tp-all-empty-text').textContent = 'No matches ' + (fl.city ? 'in ' + fl.city : 'in NSW') + '.';
      allScroll.setAttribute('aria-label', (fl.nsw ? allWhat(shown.length) : 'All matches') + ', five to a column. Arrow keys move between matches.');
      nswChip.setAttribute('aria-pressed', fl.nsw ? 'true' : 'false');
      cityBox.querySelectorAll('[data-city]').forEach(function (b) { b.setAttribute('aria-pressed', fl.city === b.dataset.city ? 'true' : 'false'); });
      if (!cityBox.hidden) placeThumb();
      markRows();
      if (announce) say(none ? 'No matches ' + (fl.city ? 'in ' + fl.city : 'in NSW') + '.' : fl.nsw ? allWhat(shown.length) + '.' : 'All ' + shown.length + ' matches.');
    }
    // The city chips slide in from the NSW chip, one after another, so the eye can follow them; out, they slide back
    var cityAnims = [];
    function showCities(on, instant) {
      cityAnims.forEach(function (a) { a.cancel(); }); cityAnims = [];
      var chips = [cityBox]; // the control slides in as one piece
      if (on) {
        cityBox.hidden = false; placeThumb();
        if (instant || reduce.matches || !cityBox.animate) return;
        chips.forEach(function (c, k) {
          cityAnims.push(c.animate([{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }], { duration: 340, delay: k * 60, easing: 'cubic-bezier(.3, .4, .3, 1)', fill: 'backwards' }));
        });
      } else {
        if (instant || reduce.matches || !cityBox.animate || cityBox.hidden) { cityBox.hidden = true; return; }
        chips.forEach(function (c, k) {
          var a = c.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-16px)' }], { duration: 180, delay: (chips.length - 1 - k) * 30, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' });
          cityAnims.push(a);
        });
        var lastA = cityAnims[0];
        if (lastA) lastA.onfinish = function () { cityBox.hidden = true; cityAnims.forEach(function (a) { a.cancel(); }); cityAnims = []; };
      }
    }
    nswChip.addEventListener('click', function () {
      var on = !state.allFilter.nsw;
      state.allFilter = { nsw: on, city: null }; // off clears the city too
      save(); showCities(on); renderAll(true); notesOnly();
    });
    cityBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-city]'); if (!b) return;
      // One city at a time; the active one again goes back to every NSW match
      state.allFilter.city = state.allFilter.city === b.dataset.city ? null : b.dataset.city;
      save(); renderAll(true); notesOnly();
    });
    document.getElementById('tp-all-empty-clear').addEventListener('click', function () {
      state.allFilter = { nsw: false, city: null };
      save(); showCities(false, true); renderAll(true); nswChip.focus({ preventScroll: true }); notesOnly();
    });
    showCities(state.allFilter.nsw, true);
    renderAll(false);
    allReset = function () { showCities(false, true); renderAll(false); };
    /* One tab stop for the whole list (it was 44): the current row is in the tab order, the arrow keys move between
       rows (down and right forward, up and left back; Home and End), and the list slides to keep it in view */
    allScroll.addEventListener('focusin', function (e) { var k = allBtns.indexOf(e.target); if (k > -1 && k !== allAt) { allBtns[allAt].tabIndex = -1; allAt = k; e.target.tabIndex = 0; } });
    allScroll.addEventListener('keydown', function (e) {
      var k = allBtns.indexOf(e.target); if (k < 0) return;
      var to = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? k + 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? k - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? allBtns.length - 1 : null;
      if (to === null) return;
      e.preventDefault();
      to = Math.max(0, Math.min(allBtns.length - 1, to));
      allBtns[to].focus({ preventScroll: true });
      var col = allBtns[to].closest('.tp-all-col');
      allScroll.scrollTo({ left: col.offsetLeft - allScroll.offsetLeft - 16, behavior: reduce.matches ? 'auto' : 'smooth' });
    });
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
  var tlBadge = document.getElementById('tp-tl-badge'), tlPrompt = document.getElementById('tp-tl-prompt');
  var tlItemEls = {}, tlStay, tlKey = document.getElementById('tp-tl-key'), tlClash = {}, tlClashEl;
  var phoneEl = document.getElementById('tp-phone');
  var SPOTS = Array.isArray(window.cnWatchSpots) ? window.cnWatchSpots : [];
  var TL_ICON = {
    ball: '<svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true"><ellipse cx="8" cy="8" rx="6.5" ry="4.2" transform="rotate(-35 8 8)" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5.6 10.4l4.8-4.8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    ticket: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1.4a1.6 1.6 0 0 0 0 3.2V10a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V8.6a1.6 1.6 0 0 0 0-3.2z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    // Added items use a square marker (matches are round): a screen for a screening, a pin for a place or a product
    screen: '<svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><rect x="1.5" y="2.5" width="11" height="7.5" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 12.5h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    // A curated day trip: a winding road with an end point
    route: '<svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 12.5c0-3 4-2.5 4-5.5S3 4 5.5 2.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="10.5" cy="3.5" r="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6.5 2.5h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
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
    tlCanvas.innerHTML = '<span class="tp-tl-stay" hidden></span><span class="tp-tl-clashes" aria-hidden="true"></span>' + h;
    var d = '';
    for (var j = 0; j < DAYS; j++) d += '<span class="tp-tl-dot is-off" style="left:' + (j / (DAYS - 1) * 100) + '%"></span>';
    tlDots.innerHTML = d;
  })();
  var tlMarks = Array.prototype.slice.call(tlCanvas.querySelectorAll('.tp-tl-mk'));
  tlStay = tlCanvas.querySelector('.tp-tl-stay');
  tlClashEl = tlCanvas.querySelector('.tp-tl-clashes');
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
        // Teams known: the Figma flag pair, side by side (15 x 9.6 each, as wide as a day column); a ticket rings it in
        // blue. Teams to be decided keep the neutral marker
        var tms = m.f.t ? m.f.t.split(' v ') : [], flags = tms.length === 2 && FLAG[tms[0]] && FLAG[tms[1]];
        m.sym.className = 'cn-tl-sym ' + (flags ? 'cn-tl-sym--flags' + (tk ? ' is-ticket' : '') : tk ? 'cn-tl-sym--ticket' : 'cn-tl-sym--match') + (m.f.a ? ' is-away' : '') + (m.f.t ? '' : ' is-tbd');
        m.el.classList.toggle('tp-tl-mk--flags', !!flags);
        m.sym.innerHTML = flags ? FLAG[tms[0]] + FLAG[tms[1]]
          : tk ? TL_ICON.ticket : m.f.t ? TL_ICON.ball : '<span class="tp-tl-q" aria-hidden="true">?</span>';
        m.el.setAttribute('aria-label', m.f.d + ', ' + tlName(m) + ', ' + (m.f.a ? 'interstate, ' + m.f.a : m.f.p) + (tk ? ', you have a ticket' : ''));
      }
    });
    // Added items sit on their day above that day's matches (a screening next to its match), square markers
    var itemDays = {}, keep = {};
    // Days a trip cannot share: one of their matches in NSW, or any match they have a ticket for
    var busy = {};
    shown.forEach(function (m) { var tk = !!m.tkey && state.tickets.indexOf(m.tkey) > -1; if (own() && (!m.f.a || tk)) (busy[m.day] = busy[m.day] || []).push(m); });
    tlClash = {};
    var hatch = '', tripDays = {};
    // Two trips on the same day clash too (a day trip on a longer trip's days, or two day trips)
    state.added.forEach(function (it) {
      if (it.kind !== 'trip') return;
      var d0 = dayOf(it.day);
      for (var d = d0; d <= d0 + (it.nights || 0); d++) (tripDays[d] = tripDays[d] || []).push(it);
    });
    state.added.forEach(function (it) {
      if (it.kind === 'match') return; // a match added on its own is a match marker, drawn above
      var day = dayOf(it.day);
      if (!(day >= 0 && day < DAYS)) return;
      keep[it.id] = true;
      itemDays[day] = true;
      var span = it.kind === 'trip' && it.nights > 0;
      // A place on a day it cannot be done: inside a longer trip, on an interstate match day they have a ticket for
      // (they are away), or closed that day (fixture opening hours, gap data). Hatched and said, as for trips
      if (it.kind !== 'trip') {
        var ph = [];
        shown.forEach(function (m) { if (m.day === day && m.f.a && m.tkey && state.tickets.indexOf(m.tkey) > -1) ph.push({ name: tlName(m) + ' (interstate)', day: m.f.d }); });
        (tripDays[day] || []).forEach(function (x) { if (x.nights > 0) ph.push({ name: x.title, day: dayLabel(day) }); });
        if (window.tpPicker && typeof window.tpPicker.itemClosed === 'function' && window.tpPicker.itemClosed(it, day)) ph.push({ closed: true, name: 'closed that day', day: dayLabel(day) });
        if (ph.length) {
          tlClash[it.id] = ph;
          hatch += '<span class="tp-tl-clash" style="left:' + (PADX + day * DAYW - DAYW / 2) + 'px;width:' + DAYW + 'px"></span>';
        }
      }
      // A trip on a day it cannot share: hatched on the axis, said in its detail; nothing is moved
      if (it.kind === 'trip') {
        var hit = [];
        for (var cd = day; cd <= day + (it.nights || 0); cd++) {
          var others = (tripDays[cd] || []).filter(function (x) { return x !== it; });
          if (!busy[cd] && !others.length) continue;
          (busy[cd] || []).forEach(function (m) { hit.push({ name: tlName(m), day: m.f.d }); });
          others.forEach(function (x) { if (!hit.some(function (h) { return h.name === x.title; })) hit.push({ name: x.title, day: dayLabel(cd) }); });
          hatch += '<span class="tp-tl-clash" style="left:' + (PADX + cd * DAYW - DAYW / 2) + 'px;width:' + DAYW + 'px"></span>';
        }
        if (hit.length) tlClash[it.id] = hit;
      }
      var el = tlItemEls[it.id];
      if (!el && tlCarry && !span) { el = tlItemEls[it.id] = tlCarry; el.dataset.item = it.id; tlCarry = null; el.style.left = (PADX + day * DAYW) + 'px'; }
      if (!el) {
        el = tlItemEls[it.id] = document.createElement('button');
        el.type = 'button'; el.dataset.item = it.id;
        if (span) {
          // A longer trip: a solid span across its nights, with its title
          el.className = 'tp-tl-mk tp-tl-span is-new';
          el.innerHTML = '<span class="tp-tl-span-t">' + esc(it.title) + ' \u00b7 ' + it.nights + (it.nights === 1 ? ' night' : ' nights') + '</span>';
          el.style.left = (PADX + day * DAYW - DAYW / 2 + 3) + 'px';
          el.style.width = ((it.nights + 1) * DAYW - 6) + 'px';
        } else {
          el.className = 'tp-tl-mk tp-tl-mk--item is-new';
          el.innerHTML = '<span class="cn-tl-sym cn-tl-sym--place">' + (it.kind === 'screening' ? TL_ICON.screen : it.kind === 'trip' ? TL_ICON.route : TL_ICON.pin) + '</span>';
          el.style.left = (PADX + day * DAYW) + 'px';
        }
        tlCanvas.appendChild(el);
        setTimeout(function () { el.classList.remove('is-new'); }, 20);
      }
      el.classList.toggle('is-clash', !!tlClash[it.id]);
      el.classList.toggle('is-movable', it.kind === 'place' || it.kind === 'product');
      if (span) { el.setAttribute('aria-label', (it.when || it.day + ' to ' + it.endDay) + ', added: ' + it.title + ', ' + it.nights + (it.nights === 1 ? ' night' : ' nights') + (tlClash[it.id] ? ', clashes with a match' : '')); return; }
      var row = perDay[day] || 0; perDay[day] = row + 1;
      el.style.setProperty('--row', row);
      el.setAttribute('aria-label', it.day + ', added: ' + it.title + (it.matchName ? ', for ' + it.matchName : '') + (tlClash[it.id] ? ', clashes with a match' : ''));
    });
    tlClashEl.innerHTML = hatch;
    Object.keys(tlItemEls).forEach(function (id) { if (!keep[id]) { if (tlItemEls[id] !== tlCarry) tlItemEls[id].remove(); delete tlItemEls[id]; if (tlSelItem === id) tlSelItem = null; } });
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
    // A longer trip's span runs along the top, so the canvas makes room for it above the markers
    var spans = state.added.some(function (it) { return it.kind === 'trip' && it.nights > 0; });
    tlCanvas.style.height = (60 + rows * 32 + (spans ? 34 : 0)) + 'px';
    tlDotEls.forEach(function (el, i) {
      var t = dayType[i];
      el.className = 'tp-tl-dot' + (t === undefined && !itemDays[i] ? ' is-off' : t === undefined ? ' is-item' : t === 3 ? ' is-ticket' : t === 1 ? ' is-away' : t === 0 ? ' is-tbd' : '') + (itemDays[i] && t !== undefined ? ' has-item' : '');
    });
    // The bar's words
    var teams = tlTeams(), none = !state.picked.length;
    var label = none ? 'Pick your team' : isPicked(RUGBY) ? 'Here for the rugby: every NSW match' : 'Your teams: ' + list(teams);
    var added = state.added.length;
    if (added) label = added + ' added to your timeline' + (none ? ' \u00b7 Pick your team' : '');
    var nClash = Object.keys(tlClash).length;
    if (nClash) label = nClash + (nClash === 1 ? ' clash' : ' clashes') + ' \u00b7 ' + added + ' added to your timeline';
    tlLabel.classList.toggle('is-clash', !!nClash);
    tlLabel.textContent = label;
    tlLabel.classList.toggle('is-hook', none || !!added);
    // Once the days in NSW are confirmed the bar follows them: the matches in those days, and those days (no prefix:
    // the bar has room for "9 pool + 8 knockouts · 3 Oct to 13 Nov" and no more)
    if (confirmed) {
      var ca = isoDay(trip.from), cz = isoDay(trip.to), inDays = shown.filter(function (m) { return m.day >= ca && m.day <= cz; });
      // It says it counts only their days, so it never seems to disagree with the plan's total
      setValue(inDays.length === shown.length ? countPhrase(shown.map(function (m) { return m.f; }), { short: true }) + ' · ' + isoRange(trip.from, trip.to)
        : inDays.length + (inDays.length === 1 ? ' match' : ' matches') + ' in your days · ' + isoRange(trip.from, trip.to));
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
    if (tsLink) tsLink.hidden = none; // with a team (or every NSW match): add or change them over the timeline
    // The key lists only the marker shapes on the axis now
    // Each entry draws its marker exactly as the axis does (the ball in the ring, the screen or pin in the square)
    var kinds = { nsw: false, away: false, ticket: false, tbd: false,
      screen: state.added.some(function (it) { return it.kind === 'screening'; }), pin: state.added.some(function (it) { return it.kind !== 'screening' && it.kind !== 'match' && it.kind !== 'trip'; }),
      trip: state.added.some(function (it) { return it.kind === 'trip' && !it.nights; }), span: state.added.some(function (it) { return it.kind === 'trip' && it.nights; }) };
    shown.forEach(function (m) { var tk = !!m.tkey && state.tickets.indexOf(m.tkey) > -1; if (tk) kinds.ticket = true; else if (!m.f.t) kinds.tbd = true; else if (m.f.a) kinds.away = true; else kinds.nsw = true; });
    tlKey.innerHTML = (kinds.nsw ? '<li><span class="cn-tl-sym cn-tl-sym--flags tp-key-flags" aria-hidden="true"><i></i><i></i></span>In NSW</li>' : '') +
      (kinds.away ? '<li><span class="cn-tl-sym cn-tl-sym--flags tp-key-flags is-away" aria-hidden="true"><i></i><i></i></span>Interstate</li>' : '') +
      (kinds.ticket ? '<li><span class="cn-tl-sym cn-tl-sym--ticket" aria-hidden="true">' + TL_ICON.ticket + '</span>Your ticket</li>' : '') +
      (kinds.tbd ? '<li><span class="cn-tl-sym cn-tl-sym--match is-tbd" aria-hidden="true"><span class="tp-tl-q">?</span></span>Teams to be decided</li>' : '') +
      (kinds.screen ? '<li><span class="cn-tl-sym cn-tl-sym--place" aria-hidden="true">' + TL_ICON.screen + '</span>Screening you added</li>' : '') +
      (kinds.pin ? '<li><span class="cn-tl-sym cn-tl-sym--place" aria-hidden="true">' + TL_ICON.pin + '</span>Place you added</li>' : '') +
      (kinds.trip ? '<li><span class="cn-tl-sym cn-tl-sym--place" aria-hidden="true">' + TL_ICON.route + '</span>Day trip you added</li>' : '') +
      (kinds.span ? '<li><span class="tp-tl-key-span" aria-hidden="true"></span>Longer trip you added</li>' : '') +
      (Object.keys(tlClash).length ? '<li><span class="tp-tl-key-clash" aria-hidden="true"></span>Clash: two things on one day</li>' : '');
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
    // A marker's details open in a sheet stacked over the timeline (match sheet, or the added item with Move and
    // Remove); this line only says so. The chosen marker keeps its pressed state for the arrow keys.
    if (tlSelItem && !state.added.some(function (x) { return x.id === tlSelItem; })) tlSelItem = null;
    tlDetail.classList.add('is-empty');
    tlDetail.innerHTML = '<p class="tp-tl-hint">Tap a marker for its details.</p>';
  }
  function dayLabel(d) { var x = new Date(Date.UTC(2027, 9, 1 + d)); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][x.getUTCDay()] + ' ' + x.getUTCDate() + ' ' + ['Oct', 'Nov'][x.getUTCMonth() - 9]; }
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
  // Tap (or Enter) opens the marker's details stacked over the timeline; the arrow keys only move between markers
  tlCanvas.addEventListener('click', function (e) {
    var b = e.target.closest('.tp-tl-mk'); if (!b) return;
    tlPick(b, false);
    var open = window.tpPicker.openSheet;
    if (typeof open === 'function') open(b.dataset.item ? 'item:' + b.dataset.item : 'match:' + TLM[+b.dataset.k].key, b);
  });
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
  /* Hold a place (or a product) for 350ms to lift it, then drag it to another day; let go and it settles onto that
     day. Moving before the hold ends scrolls the axis as normal, and a quick tap still opens its sheet. Screenings stay
     with their match and trips move by their own rules, so neither is dragged. The keyboard way is Move in the sheet.
     Clashes are allowed and shown, as with Move. On a phone: a light haptic tick on lift and per day crossed. */
  var HOLD = 350, tdrag = null, dragSwallow = false, tlCarry = null;
  var tlDrop = document.createElement('span'); tlDrop.className = 'tp-tl-drop'; tlDrop.hidden = true; tlDrop.setAttribute('aria-hidden', 'true');
  tlDrop.innerHTML = '<span class="tp-tl-drop-t"></span>';
  function dragItem(el) { var id = el && el.dataset.item; return id ? state.added.filter(function (x) { return x.id === id; })[0] : null; }
  function dragMovable(it) { return it && (it.kind === 'place' || it.kind === 'product'); }
  function dragRange() {
    var t = state.trip, a = 0, z = DAYS - 1;
    if (t && t.mode === 'visiting' && t.from && t.to) { a = Math.max(0, isoDay(t.from)); z = Math.min(DAYS - 1, isoDay(t.to)); }
    return [a, z];
  }
  function dragDay(dx) { var r = dragRange(); return Math.max(r[0], Math.min(r[1], tdrag.day + Math.round(dx / DAYW))); }
  function dragShow(d) {
    if (!tlDrop.isConnected) tlCanvas.appendChild(tlDrop);
    tlDrop.style.left = (PADX + d * DAYW) + 'px';
    tlDrop.firstChild.textContent = dayLabel(d);
    tlDrop.hidden = false;
  }
  function dragEdge() { // near either edge of the axis, it scrolls along with the tdrag
    if (!tdrag || !tdrag.lifted) return;
    var r = tlScroll.getBoundingClientRect(), v = tdrag.x < r.left + 32 ? -6 : tdrag.x > r.right - 32 ? 6 : 0;
    if (v) { var s0 = tlScroll.scrollLeft; tlScroll.scrollLeft += v; tdrag.scroll += tlScroll.scrollLeft - s0; dragMove(); }
    tdrag.raf = requestAnimationFrame(dragEdge);
  }
  function dragMove() {
    var dx = tdrag.x - tdrag.x0 + tdrag.scroll, d = dragDay(dx);
    tdrag.el.classList.add('is-following');
    tdrag.el.style.setProperty('--dx', dx + 'px');
    if (d !== tdrag.to) { tdrag.to = d; dragShow(d); }
  }
  function dragLift() {
    tdrag.lifted = true; tdrag.to = tdrag.day; tdrag.scroll = 0;
    tdrag.el.classList.add('is-lifted');
    tdrag.el.style.setProperty('--dx', '0px');
    try { tdrag.el.setPointerCapture(tdrag.pid); } catch (err) {}
    dragShow(tdrag.day);
    say('Picked up ' + tdrag.it.title + '. Drag it to another day and let go.');
    tdrag.raf = requestAnimationFrame(dragEdge);
  }
  function dragEnd(cancel) {
    if (!tdrag) return;
    var g = tdrag; tdrag = null;
    clearTimeout(g.t); cancelAnimationFrame(g.raf);
    if (!g.lifted) return;
    dragSwallow = true; setTimeout(function () { dragSwallow = false; }, 0);
    tlDrop.hidden = true;
    var el = g.el, dx = parseFloat(el.style.getPropertyValue('--dx')) || 0, to = cancel ? g.day : g.to;
    if (to !== g.day && typeof window.tpPicker.moveItem === 'function') {
      tlCarry = el; // the same marker carries on to the new day, so it settles rather than popping in again
      var nid = window.tpPicker.moveItem(g.it.id, to);
      tlCarry = null;
      dx -= (to - g.day) * DAYW; // left has jumped to the new day: keep it where the finger let go, then settle
      tlSelItem = nid;
    }
    el.classList.add('is-following');
    el.style.setProperty('--dx', dx + 'px'); // still lifted, with no transition, so the jump in left is not seen
    void el.offsetWidth;
    el.classList.remove('is-lifted', 'is-following');
    el.classList.add('is-settling');
    void el.offsetWidth;
    el.style.setProperty('--dx', '0px');
    setTimeout(function () { el.classList.remove('is-settling'); el.style.removeProperty('--dx'); }, reduce.matches ? 0 : 220);
    if (to === g.day) say(g.it.title + ' stays on ' + dayLabel(g.day) + '.');
  }
  tlCanvas.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.tp-tl-mk--item'), it = dragItem(el);
    if (!dragMovable(it) || (e.pointerType === 'mouse' && e.button !== 0)) return;
    dragEnd(true);
    tdrag = { el: el, it: it, pid: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, day: dayOf(it.day), lifted: false, scroll: 0 };
    tdrag.t = setTimeout(dragLift, HOLD);
  });
  tlCanvas.addEventListener('pointermove', function (e) {
    if (!tdrag || e.pointerId !== tdrag.pid) return;
    tdrag.x = e.clientX;
    if (!tdrag.lifted) { if (Math.abs(e.clientX - tdrag.x0) > 8 || Math.abs(e.clientY - tdrag.y0) > 8) dragEnd(true); return; } // a scroll, not a hold
    dragMove();
  });
  tlCanvas.addEventListener('pointerup', function (e) { if (tdrag && e.pointerId === tdrag.pid) dragEnd(false); });
  tlCanvas.addEventListener('pointercancel', function (e) { if (tdrag && e.pointerId === tdrag.pid) dragEnd(true); });
  tlCanvas.addEventListener('touchmove', function (e) { if (tdrag && tdrag.lifted) e.preventDefault(); }, { passive: false }); // the axis does not scroll under a lifted place
  tlCanvas.addEventListener('contextmenu', function (e) { if (e.target.closest('.tp-tl-mk--item')) e.preventDefault(); });
  tlCanvas.addEventListener('click', function (e) { if (dragSwallow) { e.stopImmediatePropagation(); e.preventDefault(); } }, true); // a tdrag is not a tap
  document.addEventListener('keydown', function (e) { if (tdrag && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); dragEnd(true); } }, true);
  /* Clear timeline: takes off everything they added (screenings, places, products, trips, single matches added from All
     matches, and ticket marks on those matches, which would be left with no match). Teams and their tickets, the trip
     answer, the filter and the tab stay: teams are cleared at the fan (Clear all), and matches are the plan's fixed
     spine. Undo for six seconds, with focus on it, as Clear all. */
  var tlClearBtn = document.getElementById('tp-tl-clear'), tlCleared = document.getElementById('tp-tl-cleared'), tlUndo = document.getElementById('tp-tl-undo'), tlClearT = 0;
  function tlClearSync() { tlClearBtn.hidden = !state.added.length || !tlCleared.hidden; }
  function tlClearEnd(focusTitle) {
    clearTimeout(tlClearT);
    var had = document.activeElement === tlUndo;
    tlCleared.hidden = true;
    tlClearSync();
    if (focusTitle && had) document.getElementById('tp-tl-title').focus({ preventScroll: true });
  }
  // A ticket on a match that was only there because it was added goes with it
  function tlClearGone() {
    var keep = state.added; state.added = [];
    var gone = TLM.filter(function (m) { return m.tkey && state.tickets.indexOf(m.tkey) > -1 && !tlShown(m.f); }).map(function (m) { return m.tkey; });
    state.added = keep;
    return gone;
  }
  /* Asked first, in a short sheet stacked over the timeline: what comes off (counted by kind) and what stays. Cancel,
     the cross, Escape, the strip above or dragging it down keeps everything; focus goes back to Clear timeline. */
  var tlCC = document.getElementById('tp-cc');
  function tlCount(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  tlClearBtn.addEventListener('click', function () {
    var by = {}; state.added.forEach(function (x) { var k = x.kind === 'product' ? 'place' : x.kind; by[k] = (by[k] || 0) + 1; });
    var gone = tlClearGone(), off = [], keep = [];
    if (by.match) off.push(tlCount(by.match, 'match you added from All matches', 'matches you added from All matches'));
    if (by.screening) off.push(tlCount(by.screening, 'place to watch', 'places to watch'));
    if (by.place) off.push(tlCount(by.place, 'place to go', 'places to go'));
    if (by.trip) off.push(tlCount(by.trip, 'trip', 'trips'));
    if (gone.length) off.push(tlCount(gone.length, 'ticket mark on an added match', 'ticket marks on added matches'));
    var teams = state.picked.filter(function (x) { return x !== RUGBY.name; });
    if (isPicked(RUGBY)) keep.push('Every NSW match, as you’re here for the rugby');
    else if (teams.length) keep.push((teams.length === 1 ? teams[0] : tlCount(teams.length, 'team', 'teams')) + ' and ' + (teams.length === 1 ? 'its' : 'their') + ' matches');
    var tk = state.tickets.length - gone.length;
    if (tk > 0) keep.push(tlCount(tk, 'ticket you’ve marked', 'tickets you’ve marked'));
    if (state.trip && state.trip.from) keep.push('Your days in NSW, ' + isoRange(state.trip.from, state.trip.to));
    if (!keep.length) keep.push('Your answers to the trip question');
    var li = function (s) { return '<li>' + esc(s) + '</li>'; };
    document.getElementById('tp-cc-off').innerHTML = off.map(li).join('');
    document.getElementById('tp-cc-keep').innerHTML = keep.map(li).join('');
    stackOpen(tlCC, tlClearBtn);
    tlCC.querySelector('.tp-plan-btn').focus({ preventScroll: true }); // the safe choice has focus
  });
  document.getElementById('tp-cc-go').addEventListener('click', function () {
    stackClose(false);
    tlClearDo();
  });
  function tlClearDo() {
    var prevAdded = state.added.slice(), prevTickets = state.tickets.slice();
    var gone = tlClearGone();
    state.added = [];
    state.tickets = state.tickets.filter(function (x) { return gone.indexOf(x) < 0; });
    tlSel = -1; tlSelItem = null;
    save(); changed(); renderMatches();
    var n = prevAdded.length;
    document.getElementById('tp-tl-cleared-text').textContent = 'Timeline cleared: ' + n + (n === 1 ? ' thing' : ' things') + ' taken off.';
    tlCleared.hidden = false; tlClearSync();
    tlUndo.onclick = function () {
      state.added = prevAdded; state.tickets = prevTickets;
      save(); changed(); renderMatches();
      tlClearEnd(false);
      tlClearBtn.focus({ preventScroll: true });
      say('Undone. ' + n + (n === 1 ? ' thing is' : ' things are') + ' back on your timeline.');
    };
    tlUndo.focus({ preventScroll: true });
    say('Timeline cleared: ' + n + (n === 1 ? ' thing' : ' things') + ' taken off' + (gone.length ? ', with ' + gone.length + (gone.length === 1 ? ' ticket mark' : ' ticket marks') : '') + '. Your teams and your days stay. Undo is available for a few seconds.');
    clearTimeout(tlClearT);
    tlClearT = setTimeout(function () { tlClearEnd(true); }, 6000);
  }
  // The panel's height: as tall as fits under the top of the phone, up to 460px
  // Open, the sheet is as tall as it can be: it leaves a 48px strip of the dimmed page at the top (44px or more to tap)
  var TL_STRIP = 48;
  // A faint line under the title row, only once the content has scrolled under it
  var tlHead = document.querySelector('.tp-tl-head');
  tlPanel.addEventListener('scroll', function () { tlHead.classList.toggle('is-stuck', tlPanel.scrollTop > 0); }, { passive: true });
  function tlFit() { tl.style.setProperty('--tl-p', Math.max(260, phoneEl.clientHeight - BAR - TL_STRIP) + 'px'); }
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
    if (!open && stackEl) stackClose(false); // a sheet stacked over the timeline goes with it
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
      var nswFirst = own() ? TLM.filter(function (m) { return m.on && !m.f.a; })[0] : null;
      var start = tlSelEl() || (!tlStay.hidden && tlStay) || items[0] || (nswFirst && nswFirst.el) || tlOrder()[0];
      // A short stay sits in the middle of the view, with the days around it either side; a long one starts at the left
      var vw = tlScroll.clientWidth, x = !start ? 0 : start !== tlStay ? start.offsetLeft - 48
        : tlStay.offsetWidth < vw - 96 ? tlStay.offsetLeft + tlStay.offsetWidth / 2 - vw / 2 : tlStay.offsetLeft - 16;
      tlScroll.scrollLeft = Math.max(0, x);
      tlPanel.scrollTop = 0;
      tlZoom(true);
      document.getElementById('tp-tl-title').focus({ preventScroll: true });
    } else if (focusBack !== false) tlToggle.focus({ preventScroll: true });
    if (!open) phoneEl.dispatchEvent(new CustomEvent('tp:tlclose'));
    syncBar();
    notesOnly();
  }
  tlToggle.addEventListener('click', function () { if (tlDragged) { tlDragged = false; return; } tlSetOpen(!tlOpen); });
  // Drag the sheet by its bar (the handle is on it): open, down past a third (or a flick) closes; collapsed, up opens.
  // A tap still toggles; a move of 6px or more is a drag, and its click is ignored.
  var tlDrag = null, tlDragged = false;
  function tlTravel() { return parseFloat(getComputedStyle(tl).getPropertyValue('--tl-p')) || 420; }
  tlToggle.addEventListener('pointerdown', function (e) {
    if (!tlOn || stackEl || (e.pointerType === 'mouse' && e.button !== 0)) return;
    tlFit();
    tlDrag = { y: e.clientY, t: e.timeStamp, dy: 0, open: tlOpen, id: e.pointerId, moved: false };
    tlDragged = false;
    try { tlToggle.setPointerCapture(e.pointerId); } catch (err) {} // so a quick drag that leaves the bar still counts
  });
  tlToggle.addEventListener('pointermove', function (e) {
    if (!tlDrag) return;
    var dy = e.clientY - tlDrag.y;
    if (!tlDrag.moved) {
      if (Math.abs(dy) < 6) return;
      tlDrag.moved = true;
      tl.classList.add('is-dragging');
    }
    var P = tlTravel();
    tlDrag.dy = dy; tlDrag.t2 = e.timeStamp;
    tl.style.transform = 'translateY(' + Math.max(0, Math.min(P, (tlDrag.open ? 0 : P) + dy)) + 'px)';
  });
  function tlLetGo(e) {
    var d = tlDrag; tlDrag = null;
    if (!d || !d.moved) return;
    tlDragged = true; setTimeout(function () { tlDragged = false; }, 0);
    var P = tlTravel(), v = d.dy / Math.max(1, e.timeStamp - d.t);
    tl.classList.remove('is-dragging'); tl.style.transform = ''; // springs from where it was let go
    if (d.open && (d.dy > P / 3 || (v > .6 && d.dy > 24))) tlSetOpen(false);
    else if (!d.open && (-d.dy > P / 3 || (v < -.6 && d.dy < -24))) tlSetOpen(true);
  }
  tlToggle.addEventListener('pointerup', tlLetGo); tlToggle.addEventListener('pointercancel', tlLetGo);
  tlScrim.addEventListener('click', function () { tlSetOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (stackEl) { e.preventDefault(); stackClose(); } // the top sheet only
    else if (tlOpen) { e.preventDefault(); tlSetOpen(false); }
  });

  /* ---------- Stacked sheets over the open timeline: one pattern, one level deep ----------
     A sheet opened from the timeline (.tp-stack: Save & share now; a trip, a match or Move later) slides up while the
     timeline moves back (scaled to 94% from its top centre, its top raised 10px, dimmed by the stack scrim), in one
     motion with one timing; closing reverses both. The sheet stops 16px below the timeline's moved-back top, so a
     strip of the timeline shows above it. A third sheet replaces the second rather than stacking again. */
  var stackScrim = document.getElementById('tp-stack-scrim'), stackEl = null, stackOpener = null, fwdT;
  var BACK_LIFT = 10, STACK_GAP = 16;
  function stackHide(sh) { sh.classList.remove('is-open', 'is-dragging'); sh.style.transform = ''; sh.inert = true; }
  function stackOpen(sheet, opener) {
    if (!tlOpen || stackEl === sheet) return;
    if (stackEl) stackHide(stackEl); // replace, never a third level
    else stackOpener = opener || document.activeElement;
    stackEl = sheet;
    sheet.style.setProperty('--stack-top', (tl.offsetTop - BACK_LIFT + STACK_GAP) + 'px');
    sheet.scrollTop = 0;
    sheet.inert = false;
    sheet.classList.add('is-open');
    clearTimeout(fwdT); tl.classList.remove('is-fwd');
    tl.classList.add('is-back');
    tl.inert = true; // stays in view behind, but cannot be used
    stackScrim.classList.add('is-on');
    sheet.focus({ preventScroll: true });
    notesOnly();
  }
  function stackClose(focusBack) {
    if (!stackEl) return;
    var sh = stackEl; stackEl = null;
    stackHide(sh);
    tl.classList.add('is-fwd'); // the way back has the sheet's closing timing, so the two still move as one
    tl.classList.remove('is-back');
    clearTimeout(fwdT); fwdT = setTimeout(function () { tl.classList.remove('is-fwd'); }, 360);
    tl.inert = false;
    stackScrim.classList.remove('is-on');
    if (focusBack !== false && stackOpener && stackOpener.isConnected) stackOpener.focus({ preventScroll: true });
    stackOpener = null;
    sh.dispatchEvent(new CustomEvent('tp:stackclose', { bubbles: true }));
    notesOnly();
  }
  stackScrim.addEventListener('click', function () { stackClose(); }); // the strip of timeline and page above the sheet
  phoneEl.addEventListener('click', function (e) { if (stackEl && e.target.closest('[data-stack-close]')) stackClose(); });
  // Tab stays in the top sheet
  document.addEventListener('keydown', function (e) {
    if (!stackEl || e.key !== 'Tab') return;
    var f = [].filter.call(stackEl.querySelectorAll('button, input, textarea, select, a[href], [tabindex="0"], summary'), function (x) { return !x.disabled && x.tabIndex > -1 && x.offsetParent !== null; });
    if (!f.length) return;
    var a = document.activeElement;
    if (!stackEl.contains(a)) { e.preventDefault(); f[0].focus(); }
    else if (e.shiftKey && (a === f[0] || a === stackEl)) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  // Drag the handle down to close: past a third of the way, or a flick, closes; earlier springs back
  function stackRegister(sh) {
    var grab = sh.querySelector('.cn-grabber'), y0 = null, dy = 0, t0 = 0;
    if (!grab) return;
    grab.addEventListener('pointerdown', function (e) { if (stackEl !== sh) return; y0 = e.clientY; dy = 0; t0 = e.timeStamp; grab.setPointerCapture(e.pointerId); sh.classList.add('is-dragging'); });
    grab.addEventListener('pointermove', function (e) { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sh.style.transform = 'translateY(' + dy + 'px)'; });
    function letGo(e) {
      if (y0 == null) return;
      var v = dy / Math.max(1, e.timeStamp - t0); y0 = null;
      sh.classList.remove('is-dragging');
      if (dy > sh.offsetHeight / 3 || (v > .6 && dy > 24)) stackClose(); else sh.style.transform = '';
    }
    grab.addEventListener('pointerup', letGo); grab.addEventListener('pointercancel', letGo);
  }
  phoneEl.querySelectorAll('.tp-stack').forEach(stackRegister);
  // Pick a team (none picked) and Add or change teams (some picked) open the Your teams sheet over the timeline
  document.getElementById('tp-tl-pick').addEventListener('click', function (e) { tsOpen(e.currentTarget); });
  tsLinkBtn.addEventListener('click', function (e) { tsOpen(e.currentTarget); });
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
    if (stackEl) stackClose(false);
    deck.getAnimations && deck.querySelectorAll('*').forEach(function (el) { el.getAnimations().forEach(function (a) { a.cancel(); }); });
    cards.forEach(function (b) { if (b._pull) b._pull.cancel(); b.style.zIndex = ''; });
    state.picked = []; state.tickets = []; state.allFilter = { nsw: false, city: null };
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (allReset) allReset();
    deck.innerHTML = '';
    setNsw(false); closeFind(false); clearFind(); offset = START; dealt = false;
    state.tab = 'yours';
    clearTimeout(undoTimer);
    renderChosen();
    renderMatches();
    caption.textContent = CAPTION_REST;
    place(false);
    body.scrollTop = 0;
    tlSetOpen(false, false); tlSel = -1; tlSelItem = null; state.added = []; state.trip = null; save(); changed();
    watchDeal();
    say('Prototype reset. No teams picked.');
  });

  window.tpPicker = { stackRegister: stackRegister, tlClash: function (id) { return tlClash[id] || null; }, tlSelect: function (k, focus, id) { tlSelect(k, focus, id); }, stackOpen: stackOpen, stackClose: stackClose, stackOn: function () { return stackEl; }, teams: TEAMS, state: state, userMatches: userMatches, addItem: addItem, removeItem: removeItem, setTrip: setTrip,
    flyToBar: flyToBar, say: say, allMatches: allMatches, inferTrip: inferTrip, openTimeline: function (focusSel) { tlSetOpen(true); var el = focusSel && tlPanel.querySelector(focusSel); if (el) el.focus({ preventScroll: true }); }, side: side, esc: esc, list: list, countPhrase: countPhrase, isoRange: isoRange, isoDay: isoDay, dayOf: dayOf, reduce: reduce, body: body,
    rugby: function () { return isPicked(RUGBY); }, picked: function () { return state.picked.length > 0; }, own: own,
    // For the match page (concepts-third-half.js): the match by its key, whether a team is picked, picking a team
    // exactly as the fan does (from: null, as the page covers the fan and the bar), and a ticket mark
    match: function (key) { return TLM_BY[key] || null; }, isPicked: function (n) { return state.picked.indexOf(n) > -1; },
    pickTeam: function (n) { var c = TEAMS[n]; if (!c) return ''; var i = CARDS.indexOf(c); if (pos(i) < 0) setNsw(false); return toggle(i, null, true); },
    setTicket: setTicket, flag: function (n) { return FLAG[n] || ''; },
    // Trips that clash, by item id: [{ name, day }] (filled by the timeline; read by the plan and the trip cards)
    clashes: function () { return tlClash; } };
  // The sections below the match cards read the picks once this is ready
  phoneEl.dispatchEvent(new CustomEvent('tp:ready'));
})();
