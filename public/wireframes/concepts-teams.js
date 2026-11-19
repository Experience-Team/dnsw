/* Concepts: Pick your team (prototype-pick-your-team.html).
   A fanned hand of cards: the 24 teams, alphabetical. Here for the rugby (every NSW match, no team) is a button under
   the fan, not a card; with teams picked it asks before swapping them, and offers Undo after. Drag or swipe the fan sideways,
   or use the arrow keys; tap or press Space to pick a card (as many as you like). Picking is the action: there is no
   button to press after it. A pick takes effect at once (Your matches, the plan, Where to watch and Suits your 3rd
   half all follow it) and says what it did: the caption under the fan, the team's matches flying into the plan
   bar, and the Your matches tab count. Unpicking reverses it. The picker stays on screen throughout.
   Data: window.cnFixtures (concepts-fixtures.js), the 36 pool matches and the knockouts in NSW, kick-offs in Sydney
   time. Nothing else is added: no flags, no community or home-country times, no ticket links.
   Jobs covered (docs/jtbd-itinerary.md): T1 one team, T5 and T7 more than one, T8 and T9 no team, T2 and T12
   tickets, T3 NSW or interstate, T4 knockouts, T6 a shared match noted on both cards, T15 saved on this device,
   T16 no team (set your days in NSW in the open plan), T12 a single match from All matches, and Clear all. The choice is kept in this browser under tp-pick-v1; ?reset clears it. */
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
    cal: '<svg class="tp-ico tp-ico-cal" viewBox="0 0 28 32" aria-hidden="true" focusable="false"><path d="M9.5 4H18.5V1.5C18.5 0.6875 19.125 0 20 0C20.8125 0 21.5 0.6875 21.5 1.5V4H24C26.1875 4 28 5.8125 28 8V28C28 30.25 26.1875 32 24 32H4C1.75 32 0 30.25 0 28V8C0 5.8125 1.75 4 4 4H6.5V1.5C6.5 0.6875 7.125 0 8 0C8.8125 0 9.5 0.6875 9.5 1.5V4ZM3 28C3 28.5625 3.4375 29 4 29H24C24.5 29 25 28.5625 25 28V12H3V28Z"/></svg>',
    // Add, remove, and added (an add toggle that is on: pressing it again removes): outline circles, in the text colour
    add: '<svg class="tp-ico tp-ico-circ" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="7"/><path d="M8 4.75v6.5M4.75 8h6.5"/></svg>',
    remove: '<svg class="tp-ico tp-ico-circ" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="7"/><path d="M4.75 8h6.5"/></svg>',
    // A ticket (as on the plan's ticket marker), outline, in the text colour
    ticket: '<svg class="tp-ico tp-ico-circ tp-ico-ticket" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M1.5 4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1.4a1.6 1.6 0 0 0 0 3.2V10a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V8.6a1.6 1.6 0 0 0 0-3.2z"/></svg>',
    added: '<svg class="tp-ico tp-ico-circ" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="7"/><path d="M5 8.2l2 2 4-4.2"/></svg>'
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
  // Every NSW match (no team): three flags fanned in a flag's space, so it reads as every team rather than an empty slot.
  // Everywhere a flag is drawn by name (the sheet row, its chip, the result card) shows it.
  FLAG['Every NSW match'] = '<span class="tp-fl tp-fl-all">' + ['france', 'ireland', 'australia'].map(function (f) { return '<img src="flags/' + f + '.svg" alt="" decoding="async">'; }).join('') + '</span>';
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
  var RUGBY = { name: 'Every NSW match', code: 'ALL', rugby: true }; // no team needed (it was Here for the rugby, then All matches)
  var CARDS = names.map(function (n) { return TEAMS[n]; });
  var R16 = FIX.filter(function (f) { return /^Round of 16/.test(f.s); });

  /* ---------- State, kept in this browser ---------- */
  var KEY = 'tp-pick-v1';
  // added: things put on the plan (screenings, the village, products); trip: the one optional question's answer
  // tab: which of Your matches and All matches is chosen once a team is picked (kept, like everything else, on reload)
  var state = { picked: [], tickets: [], tab: 'yours', added: [], trip: null, allFilter: { nsw: true, city: null, v: 2 }, interstate: false, view: 'fan', nswMark: false, notGoing: [] };
  try {
    if (/[?&]reset\b/.test(location.search)) localStorage.removeItem(KEY);
    var rec = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (rec && Array.isArray(rec.picked)) {
      state.picked = rec.picked.map(function (n) { return n === 'Here for the rugby' || n === 'All matches' ? RUGBY.name : n; }).filter(function (n) { return n === RUGBY.name || TEAMS[n]; }); // saved under its old name before
      state.tickets = Array.isArray(rec.tickets) ? rec.tickets.filter(function (x) { return typeof x === 'string'; }) : [];
      if (rec.tab === 'all') state.tab = 'all';
    }
    // All matches filter: In NSW (default) or All, then one host city with In NSW (kept on reload)
    // In NSW is the default (v2); a choice saved before that, when All was the default, is not carried over
    if (rec && rec.allFilter && rec.allFilter.v === 2) state.allFilter = { nsw: rec.allFilter.nsw !== false, city: rec.allFilter.nsw !== false && typeof rec.allFilter.city === 'string' ? rec.allFilter.city : null, v: 2 };
    // Show interstate matches too (the open plan's switch, with Every NSW match on)
    if (rec && rec.interstate === true) state.interstate = true;
    // The picker: the fan or the grid, and whether cards of teams playing in NSW are marked (kept on reload)
    if (rec && rec.view === 'grid') state.view = 'grid';
    if (rec && rec.nswMark === true) state.nswMark = true;
    // Matches they said No to on Going to this match? (the question is not asked again for those)
    if (rec && Array.isArray(rec.notGoing)) state.notGoing = rec.notGoing.filter(function (x) { return typeof x === 'string'; });
    if (rec && Array.isArray(rec.added)) state.added = rec.added.filter(function (x) { return x && typeof x.id === 'string' && typeof x.day === 'string'; });
    // The trip: your days (from, to), where you are staying (base) and who is coming (party), each optional. Saved before
    // as a Visiting / local / not sure answer: a local becomes base local; not sure is dropped; days are kept
    if (rec && rec.trip && typeof rec.trip === 'object') state.trip = normTrip({ from: rec.trip.from, to: rec.trip.to, base: rec.trip.base || (rec.trip.mode === 'local' ? 'local' : undefined), party: rec.trip.party });
  } catch (e) { /* storage blocked: the picker still works, it just is not kept */ }
  // mode follows from the answers: local if staying is I'm a local, visiting once days are set; nothing else is assumed
  function normTrip(t) {
    if (!t) return null;
    var o = {};
    ['from', 'to', 'base', 'party'].forEach(function (k) { if (typeof t[k] === 'string' && t[k]) o[k] = t[k]; });
    if (!o.from || !o.to) { delete o.from; delete o.to; }
    o.mode = o.base === 'local' ? 'local' : o.from ? 'visiting' : undefined;
    return Object.keys(o).some(function (k) { return o[k]; }) ? o : null;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  // Tells the annotation layer (prototype-pick-your-team.html) that what is on screen has changed
  // Tells the annotation layer that what is on screen has changed
  function notesOnly() { document.getElementById('tp-phone').dispatchEvent(new CustomEvent('tp:state')); }
  // Picks, tickets or the screen changed: the plan follows, then the annotations
  var tlReady = false;
  // A ticket or a screening set from a sheet shows on its card's row as a chip: the deck redraws when either changes
  var lastDeckSig = '';
  function deckSig() { return state.tickets.join(',') + '|' + state.added.filter(function (x) { return x.kind === 'screening'; }).map(function (x) { return x.id; }).join(','); }
  function deckFollow() {
    if (!tabsOn || !deck.children.length) return;
    var ds = deckSig(); if (ds === lastDeckSig) return;
    lastDeckSig = ds;
    var a = document.activeElement, keepSel = a && deck.contains(a) ? (a.dataset.openWatch ? '[data-open-watch="' + CSS.escape(a.dataset.openWatch) + '"]' : a.dataset.ticket ? '[data-ticket="' + CSS.escape(a.dataset.ticket) + '"]' : a.dataset.open ? '[data-open="' + CSS.escape(a.dataset.open) + '"]' : null) : null;
    buildDeck();
    var f = keepSel && deck.querySelector(keepSel); if (f) f.focus({ preventScroll: true });
  }
  function changed() { if (window.tpPicker && window.tpPicker.slotSaved) window.tpPicker.slotSaved(); deckFollow(); if (tlReady) { tlUpdate(); syncBar(); markRows(); } if (tlClearBtn) tlClearSync(); notesOnly(); }
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
  // A team with few or no pool matches in NSW: pair the count with what NSW has for everyone
  // Plain and short: where its pool matches are, and that the knockouts are in NSW. ("plus ... screenings of every
  // match" read as if picking a team added every screening; reworded 16 Nov)
  function nswCount(c) { return c.nsw > 1 ? c.nsw + ' in NSW' : c.nsw === 1 ? '1 in NSW. The knockouts are in NSW too' : 'all interstate, with screenings in NSW. The knockouts are in NSW'; }
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
  // Cards show the team only (no pool or match info). With Plays in NSW on, teams with a match in NSW get a small marker
  var NSW_MARK = '<span class="tp-nsw-mark" aria-hidden="true">NSW</span>';
  function cardLabel(c) { return c.rugby ? c.name + ', no team, see every match in NSW' : c.name + (state.nswMark && c.nsw > 0 ? ', plays in NSW' : ''); }
  function front(c) {
    // The code stays alone at the top left, so it shows on cards the next card overlaps; the flag sits with the name
    return '<span class="tp-card-code">' + esc(c.code) + '</span><span class="tp-card-name">' + (FLAG[c.name] ? '<span class="tp-card-flag" aria-hidden="true">' + FLAG[c.name] + '</span>' : '') + esc(c.name) + '</span>' +
      (c.nsw > 0 ? NSW_MARK : '');
  }
  fan.innerHTML = CARDS.map(function (c, i) {
    return '<button type="button" class="tp-card' + (c.rugby ? ' tp-card--rugby' : '') + '" data-i="' + i + '" tabindex="-1" aria-pressed="false" aria-label="' +
      esc(cardLabel(c)) + '">' + front(c) + TICK + '</button>';
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
    sync2(animate);
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
    if (on && c.rugby && state.picked.length) { state.picked = []; note = ' Your team picks are cleared. Every NSW match includes their NSW matches.'; }
    else if (on && !c.rugby && isPicked(RUGBY)) { state.picked = state.picked.filter(function (n) { return n !== RUGBY.name; }); note = ' Every NSW match is off.'; }
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
    return c.name + ' added: ' + countPhrase(c.matches) + ', ' + nswCount(c);
  }
  var CAPTION_REST = 'Tap a card to add its matches to your plan';
  /* Clear all ends the caption's sentence (18 Nov) instead of taking a row under it: after each rewrite it is moved
     back in, after a full stop where the sentence has none. It stays outside the caption's aria-hidden text, so it is
     still a button for everyone; renderChosen shows or hides it with its full stop. */
  function capClear() {
    var sep = caption.querySelector('.tp-clear-sep'); if (sep) sep.remove();
    if (clearBtn.parentNode) clearBtn.parentNode.removeChild(clearBtn);
    var t = caption.textContent.replace(/\s+$/, '');
    sep = document.createElement('span'); sep.className = 'tp-clear-sep'; sep.setAttribute('aria-hidden', 'true');
    sep.textContent = /[.!?:]$/.test(t) ? ' ' : '. ';
    sep.hidden = clearBtn.hidden;
    caption.appendChild(sep); caption.appendChild(clearBtn);
  }
  // undo: a function, to offer Undo in the caption for a few seconds (after Clear all)
  var undoTimer = 0;
  function showCaption(lead, rest, note, undo) {
    clearTimeout(undoTimer);
    caption.innerHTML = '<span aria-hidden="true"><span class="tp-cap-new">' + esc(lead) + '</span>' + esc(rest || '') + (note ? '<span class="tp-cap-note">. ' + esc(note.trim()) + '</span>' : '') + '</span>' +
      (undo ? ' <button type="button" class="tp-link tp-undo" id="tp-undo">Undo</button>' : '');
    capClear();
    if (undo) {
      var u = caption.querySelector('#tp-undo');
      u.addEventListener('click', function () { clearTimeout(undoTimer); undo(u); });
      // It goes after six seconds; if it had focus, focus goes to the button it came from
      undoTimer = setTimeout(function () { var had = document.activeElement === u; u.remove(); if (had) { var mid = handFocusEl(); if (mid) mid.focus({ preventScroll: true }); } }, 6000);
    }
    var n = caption.querySelector('.tp-cap-new');
    // The flash colour is the theme's --c-flash, read when it runs, so the high fidelity theme can change it
    var fl = getComputedStyle(n).getPropertyValue('--c-flash').trim() || '#dfe9fb';
    if (n.animate && !reduce.matches) n.animate([{ backgroundColor: fl, boxShadow: '0 0 0 4px ' + fl }, { backgroundColor: fl, boxShadow: '0 0 0 4px ' + fl, offset: .35 }, { backgroundColor: 'transparent', boxShadow: '0 0 0 4px transparent' }], { duration: 1400, easing: 'ease-out' });
  }
  // The person's own matches on the strip. With nothing of their own the strip previews every match, and none of
  // those is theirs, so the first pick flies all of its matches in.
  function ownKeys() { var o = {}; if (own()) TLM.forEach(function (m) { if (m.on) o[m.key] = m; }); return o; }
  /* The team's matches arrive in the plan bar: on the first pick the bar rises, then a dot per new match glides from
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

  /* ---------- TEST: the stacked hand (Figma node 282:26254) ----------
     A copy of the fan's job in a new layout: all 24 teams at once, in rows of six on four overlapping arcs, each card
     turned about a pivot below its row, later rows lying over earlier ones so each card's code and flag show at its top.
     It is a test: the original fan is kept, hidden, and comes back with the panel switch "Stacked hand (test)" or
     ?fan=classic (?fan=stacked forces this one); the choice is remembered in this browser (tp-fan-variant). Both hands
     go through the same toggle(), so picks, Undo, the plan, saving and the Your teams sheet behave the same.
     Geometry from the Figma frame (462 wide), scaled to the phone: per-column angles, a 214px radius, rows 67px apart. */
  var fan2Wrap = document.getElementById('tp-fan2-wrap'), fan2 = document.getElementById('tp-fan2'), fanWrap = root.querySelector('.tp-fan-wrap');
  var cards2 = null, f2Dealt = false, f2Focus = 0, viewLabel = function () {}, syncNswMark = function () {};
  var F2 = { s: .82, angles: [-47.9, -33.5, -15.6, 1.6, 18.8, 36.0], px: 257.7, py: 311.2, row: 67.2, r: 214, w: 70, h: 107, x0: 18, y0: 40, pad: 13, top: 8, lift: 10 };
  function fanVariant() {
    var m = /[?&]fan=(classic|stacked)\b/.exec(location.search), v = m && m[1];
    // The remembered choice belongs to the switch, which only the tools version shows: the plain address (the one DNSW
    // reviewers get) always opens on the stacked hand unless ?fan= asks otherwise
    var tools = document.documentElement.classList.contains('pv-tools');
    try { if (v) localStorage.setItem('tp-fan-variant', v); else if (tools) v = localStorage.getItem('tp-fan-variant'); } catch (e) {}
    return v === 'classic' ? 'classic' : 'stacked';
  }
  var variant = fan2 ? fanVariant() : 'classic';
  function stacked() { return variant === 'stacked' && !!fan2; }
  function handFocusEl() { return stacked() || grid() ? fan2.querySelector('.tp-card2[tabindex="0"]') : midCard(); }
  function handWrap() { return stacked() || grid() ? fan2Wrap : fanWrap; }
  if (fan2) {
    fan2.innerHTML = CARDS.map(function (c, i) {
      return '<button type="button" class="tp-card2" data-i="' + i + '" tabindex="-1" aria-pressed="false" aria-label="' +
        esc(cardLabel(c)) + '"><span class="tp-card2-code">' + esc(c.code) + '</span>' +
        (FLAG[c.name] ? '<span class="tp-card2-flag" aria-hidden="true">' + FLAG[c.name] + '</span>' : '') +
        // The full name shows in the grid only (the fan's cards are too narrow for it at 14px)
        '<span class="tp-card2-name" aria-hidden="true">' + esc(c.name) + '</span>' + (c.nsw > 0 ? NSW_MARK : '') + TICK + '</button>';
    }).join('');
    cards2 = Array.prototype.slice.call(fan2.children);
  }
  // Where card k of the visible hand sits: its row of six (a short last row takes the middle angles), and the box and
  // pivot that turn it into place
  function slot2(k, n) {
    var row = Math.floor(k / 6), col = k % 6, inRow = Math.min(6, n - row * 6), a = F2.angles[col + Math.floor((6 - inRow) / 2)];
    var s = F2.s, w = F2.w * s, h = F2.h * s, r = F2.r * s;
    var px = (F2.px - F2.x0) * s + F2.pad, py = (F2.py - F2.y0) * s + F2.top + row * F2.row * s;
    return { left: px - w / 2, top: py - r - h / 2, w: w, h: h, ox: w / 2, oy: h / 2 + r, a: a, z: row * 10 + col };
  }
  /* The grid: the same cards, upright, four to a row in alphabetical order, each wide enough for the full name */
  var G = { cols: 4, gap: 8, h: 106, x0: 16, y0: 8 }; // 106px: room for a three-line name (Hong Kong China in the system font)
  function grid() { return state.view === 'grid'; }
  function slotGrid(k) {
    var w = (fan2Wrap.clientWidth - G.x0 * 2 - G.gap * (G.cols - 1)) / G.cols, row = Math.floor(k / G.cols), col = k % G.cols;
    return { left: G.x0 + col * (w + G.gap), top: G.y0 + row * (G.h + G.gap), w: w, h: G.h, ox: w / 2, oy: G.h / 2, a: 0, z: k };
  }
  function gridHeight(n) { return G.y0 * 2 + Math.ceil(n / G.cols) * (G.h + G.gap) - G.gap; }
  function sync2(animate) {
    if (!cards2) return;
    var vis = seq.filter(function (i) { return true; }), n = vis.length;
    f2Focus = Math.max(0, Math.min(n - 1, f2Focus));
    cards2.forEach(function (b, i) {
      var k = vis.indexOf(i), c = CARDS[i], on = isPicked(c);
      b.classList.toggle('is-out', k < 0);
      b.classList.toggle('is-picked', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.tabIndex = k === f2Focus ? 0 : -1;
      if (k < 0) return; // a card out of the hand (In NSW on) keeps its last place and fades
      var sl = grid() ? slotGrid(k) : slot2(k, n);
      if (!animate) b.style.transition = 'none';
      b.style.left = sl.left.toFixed(1) + 'px'; b.style.top = sl.top.toFixed(1) + 'px';
      b.style.width = sl.w.toFixed(1) + 'px'; b.style.height = sl.h.toFixed(1) + 'px';
      b.style.transformOrigin = sl.ox.toFixed(1) + 'px ' + sl.oy.toFixed(1) + 'px';
      b.style.transform = 'rotate(' + sl.a + 'deg) translateY(' + (on && !grid() ? -F2.lift : 0) + 'px)';
      b.style.zIndex = sl.z;
      if (!animate) { void b.offsetWidth; b.style.transition = ''; }
    });
  }
  function showVariant(animate) {
    if (!fan2) return;
    fan2Wrap.hidden = !stacked() && !grid();
    fanWrap.hidden = stacked() || grid();
    fan2Wrap.classList.toggle('is-grid', grid());
    fan2Wrap.style.height = grid() ? gridHeight(seq.length) + 'px' : '';
    fitHand();
    var help = document.getElementById('tp-fan-help'), help2 = document.getElementById('tp-fan2-help');
    if (help) help.hidden = stacked(); if (help2) help2.hidden = !stacked();
    var sw = document.getElementById('tp-fan-toggle');
    if (sw) sw.setAttribute('aria-checked', stacked() ? 'true' : 'false');
    sync2(!!animate);
    if (stacked() || grid()) deal2(); else watchDeal();
  }
  /* The hand is laid out for a 390px phone: its cards span 28 to 362px (368 with a picked card lifted). On any other width it is
     centred on those real extremes and scaled down when it would not fit with 12px either side, and its box takes the
     scaled height, so no card is clipped and the space above and below stays even (interaction check 6). */
  var HAND = { l: 28, r: 365, h: 339 }; // 362 with no card picked, 368 with a picked card lifted: centred between the two
  function fitHand() {
    if (!fan2) return;
    if (!stacked() || grid()) { fan2.style.transform = ''; return; }
    var W = fan2Wrap.clientWidth || 390, k = Math.min(1, (W - 24) / (HAND.r - HAND.l)), c = (HAND.l + HAND.r) / 2;
    fan2.style.transformOrigin = '0 0';
    fan2.style.transform = 'translateX(' + (W / 2 - c * k).toFixed(1) + 'px) scale(' + k.toFixed(4) + ')';
    fan2Wrap.style.height = Math.round(HAND.h * k) + 'px';
  }
  window.addEventListener('resize', fitHand);
  // The deal: the first time the stacked hand comes into view its cards come up into place, row by row
  function deal2() {
    if (f2Dealt || !stacked()) return;
    var go = function () {
      if (f2Dealt) return;
      f2Dealt = true;
      if (reduce.matches || !fan2.animate) return;
      cards2.forEach(function (b) {
        var k = seq.indexOf(+b.dataset.i); if (k < 0) return;
        b.animate([{ opacity: 0, translate: '0 24px' }, { opacity: 1, translate: '0 0' }], { duration: 420, delay: Math.floor(k / 6) * 90 + (k % 6) * 25, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' });
      });
    };
    if (!('IntersectionObserver' in window)) { go(); return; }
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); } }, { root: body, threshold: .3 });
    io.observe(fan2);
  }
  if (fan2) {
    fan2.addEventListener('click', function (e) {
      var b = e.target.closest('.tp-card2'); if (!b) return;
      var i = +b.dataset.i;
      f2Focus = Math.max(0, seq.indexOf(i));
      var on = !isPicked(CARDS[i]);
      // The pick is singled out: the card rises out of its row, a little larger and above its neighbours, then settles
      // (lifted a little while it stays picked). Reduced motion: no movement; the colour and tick still change.
      if (!reduce.matches && b.animate) {
        if (b._pull) b._pull.cancel();
        b.classList.add('is-pulling');
        b._pull = b.animate([{ translate: '0 0', scale: '1' }, { translate: '0 ' + (on ? -18 : -10) + 'px', scale: on ? '1.14' : '1.06', offset: .4 }, { translate: '0 0', scale: '1' }], { duration: 640, easing: 'cubic-bezier(.65, 0, .35, 1)' });
        b._pull.onfinish = b._pull.oncancel = function () { b.classList.remove('is-pulling'); b._pull = null; };
      }
      toggle(i, b);
    });
    fan2.addEventListener('keydown', function (e) {
      var k = e.key, n = seq.length, cur = f2Focus, to = null, rowN = grid() ? G.cols : 6; // a row of the grid, or of the hand
      if (k === 'ArrowRight') to = cur + 1;
      else if (k === 'ArrowLeft') to = cur - 1;
      else if (k === 'ArrowDown') to = cur + rowN < n ? cur + rowN : cur;
      else if (k === 'ArrowUp') to = cur - rowN >= 0 ? cur - rowN : cur;
      else if (k === 'Home') to = 0;
      else if (k === 'End') to = n - 1;
      else if (/^[a-z]$/i.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        for (var d = 1; d <= n; d++) { var p = (cur + d) % n; if (CARDS[seq[p]].name.toLowerCase().charAt(0) === k.toLowerCase()) { to = p; break; } }
      }
      if (to === null) return;
      e.preventDefault();
      f2Focus = Math.max(0, Math.min(n - 1, to));
      sync2(true);
      cards2[seq[f2Focus]].focus({ preventScroll: true });
    });
    var fanSw = document.getElementById('tp-fan-toggle');
    if (fanSw) fanSw.addEventListener('click', function () {
      variant = stacked() ? 'classic' : 'stacked';
      try { localStorage.setItem('tp-fan-variant', variant); } catch (e) {}
      showVariant(false);
      say(stacked() ? 'Showing the stacked hand (test).' : 'Showing the original fan.');
      notesOnly();
    });
    /* Grid / Fan: the same 24 cards, laid out as a grid (upright, four to a row, full names) or as the hand. Picks stay.
       The cards glide from one layout to the other, a few milliseconds apart in reading order, so the eye can follow
       them; the box grows or shrinks with them. Reduced motion: the new layout appears at once. */
    var viewBtn = document.getElementById('tp-view'), GRID_ICO = viewBtn ? viewBtn.querySelector('svg').outerHTML : '';
    var VIEW_EASE = 'cubic-bezier(.45, .05, .25, 1)', viewTimer = 0;
    viewLabel = function () {
      if (!viewBtn) return;
      viewBtn.innerHTML = (grid() ? window.tpIcons.fan : GRID_ICO) + '<span class="tp-view-l">' + (grid() ? 'Fan' : 'Grid') + '</span><span class="visually-hidden"> view of the teams</span>';
    };
    if (viewBtn) viewBtn.addEventListener('click', function () {
      state.view = grid() ? 'fan' : 'grid';
      save();
      var glide = !reduce.matches && (stacked() || !fan2Wrap.hidden);
      clearTimeout(viewTimer);
      if (glide) cards2.forEach(function (b) {
        var k = seq.indexOf(+b.dataset.i);
        b.style.transition = ['left', 'top', 'width', 'height', 'transform', 'transform-origin'].map(function (pr) { return pr + ' 520ms ' + VIEW_EASE + ' ' + (Math.max(0, k) * 14) + 'ms'; }).join(', ') + ', background-color 120ms ease-out, color 120ms ease-out';
      });
      showVariant(glide);
      if (glide) viewTimer = setTimeout(function () { cards2.forEach(function (b) { b.style.transition = ''; }); }, 520 + 24 * 14 + 60);
      viewLabel();
      say(grid() ? 'Showing the teams as a grid, with their names.' : 'Showing the teams as a fan.');
      notesOnly();
    });
    viewLabel();
    /* Plays in NSW: marks the cards of the teams with a match in NSW with a small NSW tag. Nothing is hidden or dimmed,
       so a team that plays interstate can still be picked (its fans can watch in NSW) */
    var nswSw = document.getElementById('tp-nswmark');
    syncNswMark = function () {
      if (!nswSw) return;
      nswSw.setAttribute('aria-checked', state.nswMark ? 'true' : 'false');
      root.querySelector('.tp-picker').classList.toggle('show-nsw', state.nswMark);
      cards2.forEach(function (b) { b.setAttribute('aria-label', cardLabel(CARDS[+b.dataset.i])); });
      cards.forEach(function (b) { b.setAttribute('aria-label', cardLabel(CARDS[+b.dataset.i])); });
    };
    if (nswSw) nswSw.addEventListener('click', function () {
      state.nswMark = !state.nswMark;
      save(); syncNswMark();
      var n = CARDS.filter(function (c) { return !c.rugby && c.nsw > 0; }).length;
      say(state.nswMark ? n + ' teams play a match in NSW; their cards are marked. Every team can still be picked.' : 'NSW marks off.');
      notesOnly();
    });
    syncNswMark();
    showVariant(false);
  }

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
    if (!kbd || document.documentElement.classList.contains('pv-device')) return; // phone view: the phone's own keyboard
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
    var head = root.querySelector('.tp-util'), top = head.getBoundingClientRect().top - body.getBoundingClientRect().top;
    var room = (window.tpCapRoom ? window.tpCapRoom() : 0);
    if (top < 8 + room || top > 120 + room) body.scrollTo({ top: Math.max(0, body.scrollTop + top - 16 - room), behavior: reduce.matches ? 'auto' : 'smooth' });
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

  /* ---------- Your teams: the list editor in the sheet over the plan ----------
     No fan here (the fan is on the page). Pinned at the top: your picks as removable chips, the count of their matches,
     the last change with Undo where offered, and a search field; only the list scrolls; Done is pinned. Every NSW match
     comes first; then your picks, teams with NSW matches and interstate teams, each A to Z. The order is set on open
     and when the search clears, never on a tap, so a row never jumps from under the finger. Team rows go through the
     fan's own toggle (the same state, swap rule, saving and plan); tsSync() runs on every change. */
  var tsSheet = document.getElementById('tp-ts'), tsList = document.getElementById('tp-ts-list'), tsFind = document.getElementById('tp-ts-find');
  var tsChips = document.getElementById('tp-ts-chips'), tsCount = document.getElementById('tp-ts-count-text'), tsEmpty = document.getElementById('tp-ts-empty');
  var tsClear = document.getElementById('tp-ts-clear'), tsNoteEl = document.getElementById('tp-ts-note'), tsNone = document.getElementById('tp-ts-none'), tsNoteT = 0;
  var tsLink = document.getElementById('tp-tl-teams'), tsLinkBtn = document.getElementById('tp-tl-teams-btn');
  // Name or code, matching the start of a word: "zea" finds New Zealand, "rsa" finds South Africa (as the page search)
  function teamMatch(n, q) { return n.toLowerCase().split(/\s+/).some(function (w) { return w.indexOf(q) === 0; }) || n.toLowerCase().indexOf(q) === 0 || TEAMS[n].code.toLowerCase() === q; }
  function tsRow(key, flag, name, meta) {
    return '<li><button type="button" class="tp-find-opt tp-list-opt" data-team="' + esc(key) + '" aria-pressed="false">' +
      '<span class="tp-find-flag" aria-hidden="true">' + flag + '</span>' +
      '<span class="tp-find-text"><span class="tp-find-name">' + esc(name) + '</span><span class="tp-find-meta">' + esc(meta) + '</span></span>' +
      '<span class="tp-find-state" aria-hidden="true">Pick</span></button></li>';
  }
  function tsBuild() {
    var mine = names.filter(function (n) { return isPicked(TEAMS[n]); });
    var rest = names.filter(function (n) { return !isPicked(TEAMS[n]); });
    var order = mine.concat(rest.filter(function (n) { return TEAMS[n].nsw; }), rest.filter(function (n) { return !TEAMS[n].nsw; }));
    tsList.innerHTML = tsRow(RUGBY.name, FLAG[RUGBY.name], 'Every NSW match', 'No team needed: ' + countPhrase(nswPool.concat(nswKo), { short: true })) +
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
      var label = n;
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
      var hit = !q || (n === RUGBY.name ? /^(every|nsw|all|rugby)/.test(q) || 'all matches'.indexOf(q) === 0 : teamMatch(n, q));
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
    // The title matches the way in: Pick your team with nothing picked, Change your teams after. Set on open, never mid-edit
    document.getElementById('tp-ts-title').textContent = state.picked.length ? 'Change your teams' : 'Pick your teams';
    tsFind.value = ''; tsBuild(); tsSync(); tsFilter();
    clearTimeout(tsNoteT); tsNoteEl.textContent = '';
    document.getElementById('tp-ts-body').scrollTop = 0;
    // From the plan it stacks over it; from the page (Your plan so far) it opens on its own, over the page
    if (tlOpen) stackOpen(tsSheet, opener); else stackOpenSolo(tsSheet, opener);
    // After a frame: with reduced motion the sheet's contents become visible over 1ms, and a hidden field cannot take focus
    setTimeout(function () { if (stackEl === tsSheet) tsFind.focus({ preventScroll: true }); }, 30);
  }
  if (tsSheet) tsSheet.addEventListener('tp:stackclose', function (e) {
    var a = document.activeElement;
    // Opened from the page: back to what opened it, or, rebuilt by the picks, to Your plan so far's first control
    if (e.detail && e.detail.solo) { if (!a || a === document.body || !a.offsetParent || tsSheet.contains(a) || !body.contains(a)) { var f = document.querySelector('#tp-plan-body button') || document.getElementById('tp-plan-title'); if (f) { if (!f.matches('button')) f.tabIndex = -1; f.focus({ preventScroll: true }); } } return; }
    if (!a || a === document.body || !tl.contains(a) || !a.offsetParent) (tsLink.hidden ? document.getElementById('tp-tl-pick') : tsLinkBtn).focus({ preventScroll: true });
  });

  /* Add team (18 Nov): the page's picker (Find row and hand) is lent to the sheet and given back on close. A placeholder
     holds its height on the page meanwhile, so nothing behind the sheet moves */
  var atSheet = document.getElementById('tp-at'), atBody = document.getElementById('tp-at-body'), atHold = null;
  function atOpen(opener) {
    if (!atSheet || atHold) return;
    var util = document.getElementById('tp-util'), picker = document.getElementById('tp-picker');
    atHold = document.createElement('div'); atHold.className = 'tp-at-hold';
    // On Home (19 Nov) the hand is lent there without the Find row: each keeps its own placeholder, so neither page moves
    atHold2 = null;
    if (picker.parentNode !== util.parentNode) {
      atHold2 = document.createElement('div'); atHold2.className = 'tp-at-hold';
      atHold2.style.height = picker.offsetHeight + 'px'; picker.parentNode.insertBefore(atHold2, picker);
      atHold.style.height = util.offsetHeight + 'px';
    } else atHold.style.height = (picker.getBoundingClientRect().bottom - util.getBoundingClientRect().top) + 'px';
    util.parentNode.insertBefore(atHold, util);
    atBody.appendChild(util); atBody.appendChild(picker);
    atBody.scrollTop = 0;
    var saves = state.added.some(function (it) { return it.kind !== 'match'; });
    atSheet.querySelector('.tp-at-note').textContent = 'Pick the teams you follow. ' + (saves ? 'What you saved is planned around their matches.' : 'Their matches go on your plan.');
    atOpener = opener || null;
    if (tlOpen) stackOpen(atSheet, opener); else stackOpenSolo(atSheet, opener);
    window.dispatchEvent(new Event('resize')); // the hand lays itself out for its new width
  }
  var atOpener = null, atHold2 = null;
  if (atSheet) atSheet.addEventListener('tp:stackclose', function () {
    if (!atHold) return;
    var util = document.getElementById('tp-util'), picker = document.getElementById('tp-picker');
    atHold.parentNode.insertBefore(util, atHold);
    if (atHold2) { atHold2.parentNode.insertBefore(picker, atHold2); atHold2.remove(); atHold2 = null; }
    else atHold.parentNode.insertBefore(picker, atHold);
    atHold.remove(); atHold = null;
    if (window.tpView) window.tpView.lend(); // the tab may have changed while the sheet was open
    window.dispatchEvent(new Event('resize'));
    // Back to Add team; once a team is picked it has gone, so to the plan's title (open) or the bar (closed)
    var back = atOpener;
    requestAnimationFrame(function () {
      if (back && document.contains(back) && back.getClientRects().length && !back.closest('[hidden]')) back.focus({ preventScroll: true });
      else (tlOpen ? document.getElementById('tp-tl-title') : document.getElementById('tp-tl-toggle')).focus({ preventScroll: true });
    });
  });
  function chosenText() {
    var n = state.picked.length;
    if (!n) return 'No teams picked yet.';
    var teams = state.picked.filter(function (x) { return x !== RUGBY.name; });
    var rugby = state.picked.length > teams.length;
    return (teams.length ? 'Picked: ' + list(teams) : '') + (rugby ? (teams.length ? ', plus every NSW match.' : 'Every NSW match.') : '.');
  }
  function renderChosen() {
    chosenEl.textContent = chosenText();
    tsSync();
    clearBtn.hidden = !state.picked.length; // anything picked, Every NSW match included, can be cleared from the picker (check 3)
    var cSep = caption.querySelector('.tp-clear-sep'); if (cSep) cSep.hidden = clearBtn.hidden;
    // The quiet links: with no team, add every NSW match; on, take them off; hidden while teams are picked
    var r = isPicked(RUGBY), hide = teamsPicked().length > 0;
    rugbyLinks.forEach(function (a) {
      // In the plan it is part of the empty state only, so it goes with any pick (on, it shows in All matches)
      a.parentNode.hidden = a.parentNode.id === 'tp-tl-rugby' ? state.picked.length > 0 : hide;
      // Not a toggle button: the label itself says what it will do (Add or Remove), so no aria-pressed
      // Home's link keeps its own words (Figma 385:649): I'm just here for the rugby
      a.innerHTML = r ? window.tpIcons.remove + '<span class="tp-u">Remove every NSW match</span>' : window.tpIcons.add + '<span class="tp-u">' + (a.hasAttribute('data-rugby-home') ? 'I\u2019m just here for the rugby' : 'Add every NSW match') + '</span>';
      // The quiet line says who it is for and that it adds rather than filters; off state only
      var why = a.parentNode.querySelector('.tp-rugby-why');
      if (why) { why.hidden = r; why.textContent = (a.hasAttribute('data-rugby-home') ? 'This adds all ' : 'No team? This adds all ') + nswPool.concat(nswKo).length + ' matches played in NSW.'; }
    });
    changed(); // after the label is rewritten, which would otherwise wipe the annotation badge
  }
  // Clear all: every card back in the hand and every ticket mark gone, so the picker starts again
  clearBtn.addEventListener('click', function () {
    var before = ownKeys(), old = tlValue.textContent, bar = tlOn;
    var prevPicked = state.picked.slice(), prevTickets = state.tickets.slice(), prevTab = state.tab;
    var onlyRugby = prevPicked.length === 1 && prevPicked[0] === RUGBY.name;
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
    showCaption(onlyRugby ? 'Every NSW match cleared' : 'All teams cleared', '', '', function (u) {
      var b2 = ownKeys(), o2 = tlValue.textContent, bar2 = tlOn;
      state.picked = prevPicked; state.tickets = prevTickets; state.tab = prevTab;
      save(); place(true); renderChosen(); renderMatches(null, null, prevTab === 'all');
      pickFlights(null, b2, o2, bar2); // the bar shows its total at once (no flight from the caption, which read as a lag)
      showCaption(onlyRugby ? 'Every NSW match is back' : 'Your teams are back', onlyRugby ? '' : ': ' + list(prevPicked.map(function (n) { return n; })));
      say('Undone. Your teams' + (prevTickets.length ? ' and ticket marks' : '') + ' are back.');
      clearBtn.focus({ preventScroll: true });
      notesOnly();
    });
    notesOnly();
    var undoBtn = document.getElementById('tp-undo');
    (undoBtn || handFocusEl()).focus({ preventScroll: true });
    say((onlyRugby ? 'Every NSW match' : 'All teams') + (dropped ? ' and ' + dropped + (dropped === 1 ? ' ticket mark' : ' ticket marks') : '') + ' cleared. Undo is available for a few seconds.');
  });
  /* ---------- Here for the rugby: a quiet link, every NSW match and no team ----------
     In All matches and the plan's empty state, only while no team is picked (so it never has to replace teams).
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
      // From the open plan there is nothing to fly from: the markers appear in place. From All matches, All
      // matches stays the chosen tab, so the link (now Remove every NSW match) stays where it was, with focus on it
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
  /* ---------- Team cards (redesigned 16 Nov, mock-up approved) ----------
     Lead with the team: a band in its colours, a large flag, its name and one line of what is ahead; a quiet meta line.
     One compact row per match (date block, opponent and flag, city and kick-off), the whole row opening the match's
     sheet; interstate rows carry Watch in NSW, which opens that sheet at its screenings; a chip only once something is
     set (Ticket, Watching at ...). No form fields on the card: the ticket question and its reason live in the match
     sheet. One knockout line (its own small sheet) and one next step per card. */
  var TEAM_BAND = {
    'Argentina': ['#74ACDF', '#fff', '#74ACDF'], 'Australia': ['#012169', '#FFCD00', '#00843D'], 'Canada': ['#D80621', '#fff', '#D80621'],
    'Chile': ['#0039A6', '#fff', '#D52B1E'], 'England': ['#fff', '#CE1124', '#fff'], 'Fiji': ['#68BFE5', '#012169', '#fff'],
    'France': ['#0055A4', '#fff', '#EF4135'], 'Georgia': ['#fff', '#E8112D', '#fff'], 'Hong Kong China': ['#DE2910', '#fff', '#DE2910'],
    'Ireland': ['#169B62', '#fff', '#FF883E'], 'Italy': ['#009246', '#fff', '#CE2B37'], 'Japan': ['#fff', '#BC002D', '#fff'],
    'New Zealand': ['#000', '#fff', '#000'], 'Portugal': ['#006600', '#FF0000', '#FF0000'], 'Romania': ['#002B7F', '#FCD116', '#CE1126'],
    'Samoa': ['#CE1126', '#002B7F', '#CE1126'], 'Scotland': ['#005EB8', '#fff', '#005EB8'], 'South Africa': ['#007749', '#FFB81C', '#E03C31'],
    'Spain': ['#AA151B', '#F1BF00', '#AA151B'], 'Tonga': ['#C10000', '#fff', '#C10000'], 'United States': ['#B22234', '#fff', '#3C3B6E'],
    'Uruguay': ['#0038A8', '#fff', '#FCD116'], 'Wales': ['#fff', '#00AB39', '#D30731'], 'Zimbabwe': ['#006400', '#FFD200', '#D40000']
  };
  var I_TV = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.5 4.5h11v7.5h-11zM6 14h4M5.5 2l2.5 2.5L10.5 2"/></svg>';
  // Ticket outline; pressed, a tick inside it
  var I_TIX = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1.6a1.6 1.6 0 0 0 0 2.8V11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9.4a1.6 1.6 0 0 0 0-2.8z"/><path class="tc-tix-tick" d="M5.6 8.1l1.6 1.6 3.2-3.3"/></svg>';
  var I_GO = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 14V2.5M4 3h7.5l-1.8 2.5L11.5 8H4"/></svg>';
  var I_CUP = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 2.5h6v3a3 3 0 0 1-6 0zM5 3.5H3v1a2 2 0 0 0 2 2M11 3.5h2v1a2 2 0 0 1-2 2M8 8.5v3M5.5 13.5h5"/></svg>';
  var I_NEXT = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6 3.5L10.5 8 6 12.5"/></svg>';
  var I_CAL = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/></svg>';
  var WDAY = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
  function flagBig(n) { var m = FLAG[n] && /src="([^"]+)"/.exec(FLAG[n]); return m ? '<img class="tc-flag" src="' + m[1] + '" alt="" width="64" height="43" decoding="async">' : '<span class="tc-flag tc-flag--code" aria-hidden="true">' + esc((TEAMS[n] && TEAMS[n].code) || n.slice(0, 3)) + '</span>'; }
  function band(cols) { return '<div class="tc-band" aria-hidden="true">' + cols.map(function (c) { return '<i' + (c === '#fff' ? ' class="is-white"' : '') + ' style="background:' + c + '"></i>'; }).join('') + '</div>'; }
  function cityShort(f) { return f.a || (/Newcastle/.test(f.v) ? 'Newcastle' : 'Sydney'); }
  function kick(f) { return f.k ? f.k.replace(':00', '') : 'time to be confirmed'; }
  function daysSpan(fs) { if (!fs.length) return 0; var a = dayOf(fs[0].d), z = dayOf(fs[fs.length - 1].d); return z - a + 1; }
  // What is set on a match, as a chip: a ticket, or the screening they added for it
  function watchingAt(f) {
    var k = idOf(f), it = state.added.filter(function (x) { return x.kind === 'screening' && x.id.indexOf(k) > -1; })[0];
    return it ? it.title.replace(/ Fan Zone$/, '') : '';
  }
  function row(f, self, full) {
    var id = idOf(f), has = state.tickets.indexOf(id) > -1, w = !has && watchingAt(f);
    var p = f.d.split(' '), sides = f.t ? f.t.split(' v ') : [];
    var who = full ? sides.map(function (n) { return '<span class="tc-team">' + (FLAG[n] || '') + esc(n) + '</span>'; }).join('<span class="tc-vs">v</span>')
      : (function () { var o = sides.filter(function (n) { return n !== self; })[0] || f.s; return '<span class="tc-vs">v</span><span class="tc-team">' + (FLAG[o] || '') + esc(o) + '</span>'; })();
    var name = full ? (f.t || f.s) : 'v ' + (sides.filter(function (n) { return n !== self; })[0] || f.s);
    var also = full ? [] : others(f, self);
    // An NSW match with known teams has I have tickets on its row (18 Nov), in place of the In NSW flag, so its own
    // pressed state says it; the Ticket chip stays for interstate rows, which keep Watch in NSW
    var tix = !f.a && !!f.t;
    var chip = has && !tix ? '<span class="tc-chip is-ticket">Ticket</span>' : w ? '<span class="tc-chip is-watch">Watching at ' + esc(w) + '</span>' : '';
    var lbl = (WDAY[p[0]] || p[0]) + ' ' + p[1] + ' ' + p[2] + ', ' + kick(f) + ', ' + name + ', ' + f.v + ', ' + (f.a ? f.a + ' (interstate)' : cityShort(f) + ' (in NSW)') + (has ? ', you have a ticket' : w ? ', watching at ' + w : '') + (also.length ? ', also your ' + list(also) : '') + '. Details';
    return '<li class="tc-row' + (f.a ? ' is-away' : ' is-nsw') + (has ? ' has-ticket' : '') + '" data-key="' + esc(id) + '">' +
      '<button type="button" class="tc-open" data-open="match:' + esc(id) + '" aria-haspopup="dialog" aria-label="' + esc(lbl) + '">' +
        '<span class="tc-date" aria-hidden="true"><small>' + esc(p[0]) + '</small><b>' + esc(p[1]) + '</b><em>' + esc(p[2]) + '</em></span>' +
        '<span class="tc-who" aria-hidden="true"><span class="tc-opp">' + who + '</span><span class="tc-where">' + esc(cityShort(f)) + ' · ' + esc(kick(f)) + (also.length ? ' · also your ' + esc(list(also)) : '') + '</span>' + chip + '</span>' +
        (f.a || tix ? '' : '<span class="tc-go" aria-hidden="true"><span class="tc-go-dot">' + I_GO + '</span>' + (full ? '' : '<span>In NSW</span>') + '</span>') +
      '</button>' +
      (tix ? '<button type="button" class="tc-act tc-tix" data-ticket="' + esc(id) + '" data-name="' + esc(name) + '" aria-pressed="' + has + '">' + I_TIX + '<span>I have tickets</span><span class="visually-hidden">: ' + esc(name) + ', ' + esc(f.d) + '</span></button>' : '') +
      (f.a ? '<button type="button" class="tc-act" data-open-watch="' + esc(id) + '" aria-haspopup="dialog">' + I_TV + '<span>Watch in NSW</span><span class="visually-hidden">: ' + esc(name) + ', ' + esc(f.d) + '</span></button>' : '') +
      '</li>';
  }
  // The knockout line: only what matters in NSW, one line; its sheet has the whole path
  function koLine(c) {
    if (c.rugby) return { text: 'Knockouts in NSW: ', strong: 'Round of 16 to the final, 23 Oct to 13 Nov', key: 'all' };
    var p = c.pool.replace('Pool ', ''), r = R16.filter(function (f) { return f.t && f.t.indexOf('Pool ' + p) > -1; })[0];
    if (r) {
      var pos = /(\w+) Pool /.exec(r.t.split(' v ').filter(function (x) { return x.indexOf('Pool ' + p) > -1; })[0])[1];
      return { text: 'If ' + c.name + ' finishes ' + (pos === '2nd' ? 'second' : pos === '1st' ? 'first' : pos) + ' in ' + c.pool + ': ', strong: 'Round of 16 in Sydney, ' + r.d, key: c.name };
    }
    return { text: 'If ' + c.name + ' goes through: ', strong: 'semi-finals and the final in Sydney, from Fri 5 Nov', key: c.name };
  }
  function back(c, seen, isNew) {
    var ms = c.rugby ? nswPool : c.matches, own = [], elsewhere = [];
    ms.forEach(function (f) {
      var at = seen[idOf(f)];
      if (at && at !== c.name) elsewhere.push([f, at]); else { own.push(f); seen[idOf(f)] = c.name; }
    });
    var h = '';
    if (c.rugby) {
      var nx = nswPool[0];
      h += band(['var(--c-accent)']) + '<header class="tc-head tc-head--all"><div><h4 class="tc-name">' + esc(c.name) + '</h4>' +
        '<p class="tc-ahead">' + esc(countPhrase(nswPool.concat(nswKo), { short: true })) + ', all in NSW' + (nx ? ' · next: ' + esc(nx.t) + ', ' + esc(nx.d) : '') + '</p></div>' +
        (isNew ? '<span class="tp-rcard-new">Just added</span>' : '') + '</header>';
    } else {
      var fs = c.matches.slice().sort(function (a, b) { return dayOf(a.d) - dayOf(b.d); }), n0 = fs[0], opp0 = n0 && n0.t.split(' v ').filter(function (n) { return n !== c.name; })[0];
      h += band(TEAM_BAND[c.name] || ['var(--c-btn)']) + '<header class="tc-head">' + flagBig(c.name) +
        '<div><h4 class="tc-name">' + esc(c.name) + '</h4><p class="tc-ahead">' + fs.length + (fs.length === 1 ? ' match' : ' matches') + (fs.length > 1 ? ' in ' + daysSpan(fs) + ' days' : '') + (n0 ? ' · next: v ' + esc(opp0) + ', ' + esc(n0.d) : '') + '</p></div>' +
        (isNew ? '<span class="tp-rcard-new">Just added</span>' : '') +
        '<p class="tc-meta"><b>' + esc(c.pool) + '</b> · ' + fs.length + ' pool ' + (fs.length === 1 ? 'match' : 'matches') + ' · <b>' + (c.nsw ? c.nsw + ' in NSW' : 'all interstate') + '</b></p></header>';
    }
    // Every NSW match: the first four, then the rest behind one control (the card stays short)
    var cut = c.rugby && !rugbyAll ? 4 : own.length;
    h += '<ol class="tc-rows">' + own.slice(0, cut).map(function (f) { return row(f, c.name, c.rugby); }).join('') + '</ol>';
    if (own.length > cut) h += '<button type="button" class="tc-more" data-rugby-more aria-expanded="false">' + (own.length - cut) + ' more pool matches</button>';
    else if (c.rugby && rugbyAll) h += '<button type="button" class="tc-more" data-rugby-more aria-expanded="true">Fewer matches</button>';
    h += elsewhere.map(function (x) { return '<p class="tc-moved">' + esc(x[0].d) + ', v ' + esc(x[0].t.split(' v ').filter(function (n) { return n !== c.name; })[0]) + ': on your ' + esc(x[1]) + ' card.</p>'; }).join('');
    var ko = koLine(c);
    h += '<button type="button" class="tc-ko" data-ko="' + esc(ko.key) + '" aria-haspopup="dialog">' + I_CUP + '<span>' + esc(ko.text) + '<b>' + esc(ko.strong) + '</b></span>' + I_NEXT + '</button>';
    // One next step: a team that plays in NSW plans around its match day; one that does not finds where to watch
    var next = c.rugby ? '<button type="button" class="tc-next" data-plan-days aria-haspopup="dialog">' + I_CAL + 'Plan around your match days</button>'
      : c.nsw ? '<button type="button" class="tc-next" data-plan-days data-plan-team="' + esc(c.name) + '" aria-haspopup="dialog">' + I_CAL + 'Plan around your match day' + (c.nsw > 1 ? 's' : '') + '</button>'
      : '<button type="button" class="tc-next" data-watch-team="' + esc(c.name) + '" aria-haspopup="dialog">' + I_TV + 'See where to watch all ' + c.matches.length + ' in NSW</button>';
    return h + '<div class="tc-foot">' + next + '</div>';
  }
  var rugbyAll = false;
  // Single matches added from All matches that no picked team's card already shows
  function addedMatches() { return state.added.filter(function (it) { return it.kind === 'match'; }).map(function (it) { return TLM_BY[it.key]; }).filter(Boolean); }
  function addedCard(seen) {
    var ms = addedMatches().filter(function (m) { return !seen[idOf(m.f)]; });
    if (!ms.length) return '';
    return '<article class="tp-rcard tp-rcard--added" data-name="added" aria-label="Matches you added"><div class="tp-flip is-flipped"><div class="tp-face tp-face--back">' +
      band(['var(--c-ink-3)']) + '<header class="tc-head tc-head--all"><div><h4 class="tc-name">Matches you added</h4><p class="tc-ahead">' + countPhrase(ms.map(function (m) { return m.f; })) + ', from All matches</p></div></header>' +
      '<ol class="tc-rows">' + ms.map(function (m) {
        if (m.f.t) return row(m.f, '', true);
        var p = m.f.d.split(' ');
        return '<li class="tc-row is-nsw"><button type="button" class="tc-open" data-open="match:' + esc(idOf(m.f)) + '" aria-haspopup="dialog" aria-label="' + esc(m.f.d + ', ' + m.f.s + ', ' + m.f.v + ', teams to be decided. Details') + '"><span class="tc-date" aria-hidden="true"><small>' + esc(p[0]) + '</small><b>' + esc(p[1]) + '</b><em>' + esc(p[2]) + '</em></span><span class="tc-who" aria-hidden="true"><span class="tc-opp"><span class="tc-team">' + esc(m.f.s) + '</span></span><span class="tc-where">' + esc(cityShort(m.f)) + ' \u00b7 teams to be decided</span></span></button></li>';
      }).join('') + '</ol></div></div></article>';
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
    return who + ': ' + countPhrase(fs) + (nsw === all.length ? ', all in NSW. ' : !nsw ? ', all interstate. ' : ', ' + nsw + ' in NSW. ') + (tickets ? tickets + (tickets === 1 ? ' ticket.' : ' tickets.') : 'No tickets marked yet.');
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
    lastDeckSig = deckSig();
    // (The box saying a team plays all its pool matches interstate is gone: each card's meta line says all interstate)
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
     match's own full-screen page (concepts-third-half.js): add that one match to the plan, or add either team. */
  var allSec = document.getElementById('tp-all');
  function minutes(k) { var m = /^(\d+):(\d+)(am|pm)$/.exec(k || ''); return m ? ((+m[1] % 12) + (m[3] === 'pm' ? 12 : 0)) * 60 + +m[2] : 24 * 60; }
  function side(n) { return FLAG[n] ? '<span class="tp-flag" aria-hidden="true">' + FLAG[n] + '</span> ' + esc(n) : esc(n); }
  // Host venues (cnVenues): nsw drives In NSW, city the city control. A fixture whose venue is not in the list
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
    var allEmpty = document.getElementById('tp-all-empty'), scopeBox = document.getElementById('tp-all-scope'), cityBox = document.getElementById('tp-all-cities');
    // In NSW | All: the same segmented control as the cities (no counts, so it and the cities fit one row at 390px;
    // the line under it gives the count); one is always chosen
    var scopeThumb = scopeBox.querySelector('.tp-seg-thumb');
    function placeScope(instant) {
      var on = scopeBox.querySelector('[aria-pressed="true"]'); if (!on || !scopeBox.offsetWidth) return; // hidden: measured when it shows
      if (instant) scopeThumb.style.transition = 'none';
      scopeThumb.style.left = on.offsetLeft + 'px'; scopeThumb.style.width = on.offsetWidth + 'px';
      if (instant) { void scopeThumb.offsetWidth; scopeThumb.style.transition = ''; }
    }
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
    // A thumb measured while All matches was hidden (a team picked, Your matches chosen) had no width: placed again,
    // without sliding, the moment the control has a size
    if (window.ResizeObserver) new ResizeObserver(function () { if (scopeBox.offsetWidth) { placeScope(true); var on = cityBox.querySelector('[aria-pressed="true"]'); if (on && cityBox.offsetWidth) { segThumb.style.transition = 'none'; segThumb.style.left = on.offsetLeft + 'px'; segThumb.style.width = on.offsetWidth + 'px'; void segThumb.offsetWidth; segThumb.style.transition = ''; } } }).observe(scopeBox);
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
      var scopeWas = scopeBox.querySelector('[aria-pressed="true"]');
      scopeBox.querySelectorAll('[data-scope]').forEach(function (b) { b.setAttribute('aria-pressed', (b.dataset.scope === 'nsw') === fl.nsw ? 'true' : 'false'); });
      placeScope(!scopeWas || scopeBox.offsetWidth === 0);
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
    scopeBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-scope]'); if (!b) return;
      var on = b.dataset.scope === 'nsw';
      if (on === state.allFilter.nsw) return; // already chosen: nothing changes
      state.allFilter = { nsw: on, city: null, v: 2 }; // All clears the city too
      save(); showCities(on); renderAll(true); notesOnly();
    });
    cityBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-city]'); if (!b) return;
      // One city at a time; the active one again goes back to every NSW match
      state.allFilter.city = state.allFilter.city === b.dataset.city ? null : b.dataset.city;
      save(); renderAll(true); notesOnly();
    });
    document.getElementById('tp-all-empty-clear').addEventListener('click', function () {
      state.allFilter = { nsw: false, city: null, v: 2 };
      save(); showCities(false, true); renderAll(true); scopeBox.querySelector('[data-scope="all"]').focus({ preventScroll: true }); notesOnly();
    });
    showCities(state.allFilter.nsw, true);
    renderAll(false);
    // The thumbs are measured from the labels, so measure again once the web fonts are in (high fidelity)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeScope(true); if (!cityBox.hidden) placeThumb(); });
    allReset = function () { showCities(state.allFilter.nsw, true); renderAll(false); };
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
  // Every NSW match: the rest of the pool matches, in place (no jump), focus on the same control
  deck.addEventListener('click', function (e) {
    if (!e.target.closest('[data-rugby-more]')) return;
    rugbyAll = !rugbyAll; buildDeck();
    var b = deck.querySelector('[data-rugby-more]'); if (b) b.focus({ preventScroll: true });
    say(rugbyAll ? 'All ' + nswPool.length + ' pool matches shown.' : 'First four pool matches shown.');
  });
  // I have tickets on a match row (18 Nov) is handled in concepts-third-half.js (ticketToggle), which confirms what it
  // changed out of view with a toast; the row redraws (deckFollow) with focus kept on the button
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
    if (tabsOn) sum.textContent = summary();
    changed(); // rewriting the summary wipes its annotation badge
  }
  // Where the phone's content must scroll to for the picker's title to sit 16px below the top
  function pickTop() {
    var t = document.getElementById('tp-pick-title');
    return Math.max(0, Math.round(t.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16));
  }

  /* ---------- Plan bar (Figma: Rugby World Cup, node 213:13100, adapted to the 390px phone) ----------
     A sheet docked over the bottom of the phone, out of the content's flow. Three states: hidden (until the match cards
     have scrolled past the top of the phone), collapsed (the 88px bar) and open (the sheet risen by its panel height).
     Only transform moves it. Matches only: every match with no team or after Skip, every NSW match for Here for the
     rugby, and only the picked teams' matches, live as picks change. The All matches list stays unfiltered.
     Where to watch venues are placeholders from cnWatchVenues (gap data, clearly marked). The number badge counts items added to
     the plan; none exist yet, so only the reviewer-only stand-in control can show it. */
  var tl = document.getElementById('tp-tl');
  var tlInter = document.getElementById('tp-tl-inter'), tlInterBtn = document.getElementById('tp-inter');
  var tlToggle = document.getElementById('tp-tl-toggle'), tlPanel = document.getElementById('tp-tl-panel'), tlScrim = document.getElementById('tp-tl-scrim');
  var tlCanvas = document.getElementById('tp-tl-canvas'), tlScroll = document.getElementById('tp-tl-scroll'), tlDetail = document.getElementById('tp-tl-detail');
  var tlDays = document.getElementById('tp-tl-days'), tlStripStay = document.querySelector('#tp-tl-toggle .tp-tl-strip-stay');
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
  var DAYS = 44, DAYW = 40, PADX = 28, BAR = 88;
  var tlOn = false, tlOpen = false, tlSel = -1, tlSelItem = null;
  // Free days on the axis: a + per free day (from Your days, in order), opening that day's ideas inside the sheet
  var tlFreeInfo = [], tlFreeEls = {}, tlPerDay = {}, tlFreeOpen = null, tlSelFree = null;
  var tlIdeasEl = document.getElementById('tp-tl-ideas');
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
  /* Show interstate matches too: with Every NSW match on, the open plan's switch puts every interstate match on the
     axis too, as the dashed marker, for watching in NSW. They are not part of the plan: not counted, not on the bar's
     strip, no clashes, not in Save & share (all of those read tlShown). Adding one on its own, or marking a ticket,
     makes it part of the plan as before. With teams the switch is hidden: their interstate matches already count. */
  function interRelevant() { return isPicked(RUGBY); }
  function tlExtra(f) { return !!f.a && state.interstate && interRelevant() && !tlShown(f); }
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
      var on = tlShown(m.f), ex = !on && tlExtra(m.f), tk = !!m.tkey && state.tickets.indexOf(m.tkey) > -1;
      m.on = on; m.vis = on || ex; // on: in the plan; vis: on the axis (the plan, or an interstate match to watch)
      if (m.vis) { var row0 = perDay[m.day] || 0; perDay[m.day] = row0 + 1; m.el.style.setProperty('--row', row0); }
      m.el.classList.toggle('is-extra', ex);
      if (on) {
        shown.push(m);
        var t = tk ? 3 : !m.f.t ? 0 : m.f.a ? 1 : 2; // the strip shows one dot a day: ticket, then NSW, interstate, to be decided
        if (dayType[m.day] === undefined || t > dayType[m.day]) dayType[m.day] = t;
      }
      m.el.classList.toggle('is-off', !m.vis);
      var st = (tk ? 'ticket' : 'match') + (m.f.a ? ' away' : '') + (m.f.t ? '' : ' tbd') + (ex ? ' extra' : '');
      if (st !== m.state) {
        m.state = st;
        // Teams known: the Figma flag pair, side by side (15 x 9.6 each, as wide as a day column); a ticket rings it in
        // blue. Teams to be decided keep the neutral marker
        var tms = m.f.t ? m.f.t.split(' v ') : [], flags = tms.length === 2 && FLAG[tms[0]] && FLAG[tms[1]];
        m.sym.className = 'cn-tl-sym ' + (flags ? 'cn-tl-sym--flags' + (tk ? ' is-ticket' : '') : tk ? 'cn-tl-sym--ticket' : 'cn-tl-sym--match') + (m.f.a ? ' is-away' : '') + (m.f.t ? '' : ' is-tbd');
        m.el.classList.toggle('tp-tl-mk--flags', !!flags);
        m.sym.innerHTML = flags ? FLAG[tms[0]] + FLAG[tms[1]]
          : tk ? TL_ICON.ticket : m.f.t ? TL_ICON.ball : '<span class="tp-tl-q" aria-hidden="true">?</span>';
        m.el.setAttribute('aria-label', m.f.d + ', ' + tlName(m) + ', ' + (m.f.a ? 'interstate, ' + m.f.a : m.f.p) + (tk ? ', you have a ticket' : '') + (ex ? ', to watch in NSW, not in your plan' : ''));
      }
    });
    // The switch: only with Every NSW match on (teams' interstate matches already count); its state is kept either way
    if (tlInter) {
      tlInter.hidden = !interRelevant();
      tlInterBtn.setAttribute('aria-checked', state.interstate ? 'true' : 'false');
    }
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
      // Added items are no longer drawn on the strip (16 Nov): the day cards name them (concepts-plan.js)
    });
    tlClashEl.innerHTML = ''; void hatch; // clashes are said on the day cards now, not hatched
    // Visiting with dates: the days in NSW are shaded on the axis
    // Your days as set; nothing is guessed any more (the band shows only once days are chosen)
    var trip = state.trip, confirmed = !!(trip && trip.from && trip.to);
    var guess = null, stay = confirmed ? trip : null;
    tlStay.hidden = !stay;
    tlStay.classList.toggle('is-suggested', !!guess);
    if (stay) {
      var a = isoDay(stay.from), z = isoDay(stay.to);
      a = Math.max(0, Math.min(DAYS - 1, a)); z = Math.max(a, Math.min(DAYS - 1, z));
      tlStay.style.left = (PADX + a * DAYW - DAYW / 2) + 'px';
      tlStay.style.width = ((z - a + 1) * DAYW) + 'px';
    }
    // The bar's strip shows the same days as a band behind its dots (the days are spelt out for screen readers)
    if (tlStripStay) {
      tlStripStay.hidden = !stay;
      tlStripStay.classList.toggle('is-suggested', !!guess);
      if (stay) {
        var sa = Math.max(0, Math.min(DAYS - 1, isoDay(stay.from))), sz = Math.max(sa, Math.min(DAYS - 1, isoDay(stay.to)));
        tlStripStay.style.left = Math.max(0, (sa - .5) / (DAYS - 1) * 100) + '%';
        tlStripStay.style.right = Math.max(0, 100 - (sz + .5) / (DAYS - 1) * 100) + '%';
      }
    }
    tlPerDay = {}; Object.keys(perDay).forEach(function (d) { tlPerDay[d] = perDay[d]; });
    // The canvas is as tall as the tallest day shown: 50px for the axis and dates, 28px a row, 10px above
    var rows = 1; Object.keys(perDay).forEach(function (d) { rows = Math.max(rows, perDay[d]); });
    // A longer trip's span runs along the top, so the canvas makes room for it above the markers
    var spans = state.added.some(function (it) { return it.kind === 'trip' && it.nights > 0; });
    tlCanvas.style.height = (60 + rows * 32 + (spans ? 34 : 0)) + 'px';
    if (!own()) dayType = {}; // empty plan: no match dots on the bar's strip (the open plan still previews them)
    tlDotEls.forEach(function (el, i) {
      var t = dayType[i];
      el.className = 'tp-tl-dot' + (t === undefined && !itemDays[i] ? ' is-off' : t === undefined ? ' is-item' : t === 3 ? ' is-ticket' : t === 1 ? ' is-away' : t === 0 ? ' is-tbd' : '') + (itemDays[i] && t !== undefined ? ' has-item' : '');
    });
    // The bar's words. One reading that never changes meaning: the label names your teams; the value is the plan's total
    // by the page's one counting rule (as the tab, the summary and the Your teams sheet); your days are a small note under
    // the strip; what you added is on the badge only; clashes show on the strip (and are named in the open plan)
    var teams = tlTeams(), none = !state.picked.length;
    var label = none ? 'Your plan' : isPicked(RUGBY) ? 'Every NSW match' : 'Your teams: ' + list(teams);
    var added = state.added.length;
    // Two or more teams: flags and codes, so the header fits and still shows what they chose (full names for screen readers)
    if (!none && !isPicked(RUGBY) && teams.length > 1) {
      var vis = teams.slice(0, 4), more = teams.length - vis.length;
      var lh = vis.map(function (n) { return '<span class="tp-tl-lteam">' + (FLAG[n] || '') + esc(TEAMS[n] ? TEAMS[n].code : n) + '</span>'; }).join('') + (more ? '<span class="tp-tl-lteam">+' + more + '</span>' : '');
      lh = '<span aria-hidden="true" class="tp-tl-lteams">' + lh + '</span><span class="visually-hidden">' + esc(label) + '</span>';
      if (tlLabel.innerHTML !== lh) tlLabel.innerHTML = lh;
    } else tlLabel.textContent = label;
    tlLabel.classList.toggle('is-hook', false);
    var fsAll = shown.map(function (m) { return m.f; }), inNsw = fsAll.filter(function (f) { return !f.a; }).length;
    // Nothing of their own yet: the empty state, even though the open plan previews every match
    var savedN = state.added.filter(function (it) { return it.kind !== 'match'; }).length;
    setValue(own() && fsAll.length ? countPhrase(fsAll, { short: true }) + ' \u00b7 ' + (inNsw ? inNsw + ' in NSW' : 'all interstate') : !own() && savedN ? savedN + ' saved' : 'No matches yet');
    // No team (18 Nov): Add team sits on the bar, beside the value, and opens the team sheet
    var addTeam = document.getElementById('tp-tl-addteam');
    if (addTeam) { addTeam.hidden = own(); tl.classList.toggle('has-addteam', !own()); }
    if (tlDays) {
      if (confirmed) {
        // NSW matches only: one interstate in the same dates is watched here, not gone to (as Your plan so far says)
        var ca = isoDay(trip.from), cz = isoDay(trip.to), shownN = shown.filter(function (m) { return !m.f.a; }), inDays = shownN.filter(function (m) { return m.day >= ca && m.day <= cz; }).length;
        tlDays.textContent = (!shownN.length || !own() ? 'Your days' : inDays === shownN.length ? 'All NSW matches in your days' : inDays + ' NSW in your days') + ' \u00b7 ' + isoRange(trip.from, trip.to);
      } else tlDays.textContent = own() && shown.length ? tlRange(shown[0].f.d, shown[shown.length - 1].f.d) : ''; // the value already says No matches yet
      // The count on the badge is hidden from screen readers (it sits in the expand control), so it is said here, last
      if (added) tlDays.textContent += (tlDays.textContent ? ', ' : '') + added + ' added';
    }
    // Saved, not placed yet: what was added from the map before their days were set, waiting for a free day
    var tlWait = document.getElementById('tp-tl-wait');
    if (tlWait) {
      var wl = state.added.filter(function (it) { return it.unplaced; });
      tlWait.hidden = !wl.length;
      // The prompt under the saves (18 Nov): no team, add one so they can be planned around their matches; no days,
      // set them so each goes onto a free day; days set and still waiting, no free day fits
      var wn = !own() ? 'Add a team so these can be planned around their matches.' + (confirmed ? '' : ' Set your days and each goes onto a free day.')
        : confirmed ? 'No free day fits ' + (wl.length === 1 ? 'this' : 'these') + ' yet. Change your days to make room.' : 'Set your days and each goes onto a free day.';
      var wa = (!own() ? '<button type="button" class="tp-link" data-wait-team>Add team</button>' : '') + (confirmed ? '' : '<button type="button" class="tp-link" data-wait-days>Set your days</button>');
      var wh = wl.length ? '<h4 class="tp-tl-wait-h" id="tp-tl-wait-h">Saved, not placed yet</h4><ul>' + wl.map(function (it) {
        return '<li><span class="tp-tl-wait-t">' + (it.poi ? '<button type="button" class="tp-link tp-place-link" data-open="poi:' + esc(it.poi) + '" aria-haspopup="dialog">' + esc(it.title) + '</button>' : esc(it.title)) + (it.fixed ? '<span>, ' + esc(it.fixed) + '</span>' : it.place ? '<span>, ' + esc(it.place) + '</span>' : '') + '</span><button type="button" class="tp-link" data-wait-rm="' + esc(it.id) + '">Remove<span class="visually-hidden"> ' + esc(it.title) + '</span></button></li>';
      }).join('') + '</ul><p class="tp-tl-wait-n">' + wn + '</p>' + (wa ? '<p class="tp-tl-wait-a">' + wa + '</p>' : '') : '';
      if (tlWait.innerHTML !== wh) tlWait.innerHTML = wh;
    }
    var howEl = document.getElementById('tp-tl-how');
    if (howEl) howEl.hidden = !(own() && shown.length);
    // A clash marks its day on the strip
    var clashDays = {};
    Object.keys(tlClash).forEach(function (id) {
      var it = state.added.filter(function (x) { return x.id === id; })[0];
      if (it && it.day) clashDays[dayOf(it.day)] = true;
      (tlClash[id] || []).forEach(function (c) { if (c && c.day && /^\w{3} \d{1,2} (Oct|Nov)$/.test(c.day)) clashDays[dayOf(c.day)] = true; });
    });
    tlDotEls.forEach(function (el, i) { el.classList.toggle('is-clash', !!clashDays[i]); });
    if (String(added || '') !== tlBadge.textContent) {
      tlBadge.hidden = !added;
      tlBadge.textContent = added || '';
      // The count changing is worth seeing: the badge pops again
      if (added) { tlBadge.style.animation = 'none'; tlBadge.offsetWidth; tlBadge.style.animation = ''; }
    }
    // One prompt at a time: which team first; the trip line only once there is a team
    tlPrompt.hidden = !none || (!own() && state.added.some(function (it) { return it.unplaced; })); // the saves' box asks instead
    if (tsLink) tsLink.hidden = none; // with a team (or every NSW match): add or change them over the plan
    // The key lists only the marker shapes on the axis now
    // Each entry draws its marker exactly as the axis does (the ball in the ring, the screen or pin in the square)
    var kinds = { nsw: false, away: false, ticket: false, tbd: false,
      screen: state.added.some(function (it) { return it.kind === 'screening'; }), pin: state.added.some(function (it) { return it.kind !== 'screening' && it.kind !== 'match' && it.kind !== 'trip'; }),
      trip: state.added.some(function (it) { return it.kind === 'trip' && !it.nights; }), span: state.added.some(function (it) { return it.kind === 'trip' && it.nights; }) };
    shown.forEach(function (m) { var tk = !!m.tkey && state.tickets.indexOf(m.tkey) > -1; if (tk) kinds.ticket = true; else if (!m.f.t) kinds.tbd = true; else if (m.f.a) kinds.away = true; else kinds.nsw = true; });
    // Interstate matches shown by the switch: the same dashed marker, named as watching, not your plan
    var extraOn = TLM.some(function (m) { return m.vis && !m.on; });
    if (extraOn) kinds.away = true;
    if (tlKey) tlKey.innerHTML = (kinds.nsw ? '<li><span class="cn-tl-sym cn-tl-sym--flags tp-key-flags" aria-hidden="true"><i></i><i></i></span>In NSW</li>' : '') +
      (kinds.away ? '<li><span class="cn-tl-sym cn-tl-sym--flags tp-key-flags is-away" aria-hidden="true"><i></i><i></i></span>' + (extraOn ? 'Interstate, to watch in NSW' : 'Interstate') + '</li>' : '') +
      (kinds.ticket ? '<li><span class="cn-tl-sym cn-tl-sym--ticket" aria-hidden="true">' + TL_ICON.ticket + '</span>Your ticket</li>' : '') +
      (kinds.tbd ? '<li><span class="cn-tl-sym cn-tl-sym--match is-tbd" aria-hidden="true"><span class="tp-tl-q">?</span></span>Teams to be decided</li>' : '') +
      (kinds.screen ? '<li><span class="cn-tl-sym cn-tl-sym--place" aria-hidden="true">' + TL_ICON.screen + '</span>Screening you added</li>' : '') +
      (kinds.pin ? '<li><span class="cn-tl-sym cn-tl-sym--place" aria-hidden="true">' + TL_ICON.pin + '</span>Place you added</li>' : '') +
      (kinds.trip ? '<li><span class="cn-tl-sym cn-tl-sym--place" aria-hidden="true">' + TL_ICON.route + '</span>Day trip you added</li>' : '') +
      (kinds.span ? '<li><span class="tp-tl-key-span" aria-hidden="true"></span>Longer trip you added</li>' : '') +
      (Object.keys(tlClash).length ? '<li><span class="tp-tl-key-clash" aria-hidden="true"></span>Clash: two things on one day</li>' : '');
    // A selected match that is no longer shown is let go
    if (tlSel > -1 && !TLM[tlSel].vis) tlSel = -1;
    tlFreeDraw();
    tlRenderDetail();
  }
  // Every marker shown, matches and added items, in the order of the axis: by day, then bottom to top
  function tlOrder() {
    var els = [];
    TLM.forEach(function (m) { if (m.vis) els.push(m.el); });
    Object.keys(tlItemEls).forEach(function (id) { els.push(tlItemEls[id]); });
    Object.keys(tlFreeEls).forEach(function (d) { els.push(tlFreeEls[d]); });
    return els.sort(function (a, b) { return a.offsetLeft - b.offsetLeft || (+a.style.getPropertyValue('--row') || 0) - (+b.style.getPropertyValue('--row') || 0); });
  }
  function tlSelEl() { return tlSelFree && tlSelFree.isConnected ? tlSelFree : tlSelItem ? tlItemEls[tlSelItem] : tlSel > -1 ? TLM[tlSel].el : null; }
  function tlRoving() {
    var order = tlOrder(), sel = tlSelEl(), tab = sel || order[0];
    order.concat(TLM.filter(function (m) { return !m.vis; }).map(function (m) { return m.el; })).forEach(function (el) {
      el.tabIndex = el === tab ? 0 : -1;
      if (!el.dataset.free) el.setAttribute('aria-pressed', el === sel ? 'true' : 'false'); // a free day's + says expanded instead
    });
  }
  /* ---------- Free days on the axis ----------
     Each free day in Your days, in order gets a + on the axis, with a short line above it (Free, and how many ideas;
     Full once the day is filled). The + opens that day's ideas below the plan, inside the sheet: nothing closes and
     the page behind never moves. While ideas are open the axis sticks under the sheet's header, so an idea added from
     the list can be seen landing on its day. The list itself is drawn by concepts-third-half.js (the same ideas, the
     same Fits [day] rules and the same Add buttons as the page, so the two stay in step). */
  function tlKeepInView(el) {
    var x = el.offsetLeft;
    if (x < tlScroll.scrollLeft + 40 || x > tlScroll.scrollLeft + tlScroll.clientWidth - 40) tlScroll.scrollTo({ left: Math.max(0, x - tlScroll.clientWidth / 2), behavior: reduce.matches ? 'auto' : 'smooth' });
  }
  /* Free days (16 Nov): the + on the axis is gone. Each free day's card has Add ideas (concepts-plan.js), which opens the
     same ideas sheet stacked over the plan; the list is still drawn by concepts-third-half.js, which reports the
     free days here (tpFreeApi.set). Closing the sheet puts focus back on that day's Add ideas. */
  function tlFreeDraw() { if (window.tpPlan) window.tpPlan.render(); }
  function tlFreeShow(d) {
    tlFreeOpen = d;
    phoneEl.dispatchEvent(new CustomEvent('tp:freeideas', { detail: { day: d } }));
  }
  function tlFreeToggle(d, opener) {
    tlFreeShow(d);
    if (typeof window.tpPicker.openSheet === 'function') window.tpPicker.openSheet('ideas:' + d, opener);
  }
  function planAdd(d) { return window.tpPlan ? window.tpPlan.addButton(d) : null; }
  window.tpFreeApi = {
    set: function (list) { tlFreeInfo = list || []; tlFreeDraw(); },
    close: function (focusAdd) { var d = tlFreeOpen; tlFreeShow(null); var b = focusAdd && d !== null && planAdd(d); if (b) b.focus({ preventScroll: true }); },
    // Next free day, from inside the sheet: the sheet swaps to that day, and closing it goes back to that day's Add ideas
    go: function (d) { tlFreeShow(d); var b = planAdd(d); if (b && stackEl) stackOpener = b; if (window.tpPlan) window.tpPlan.goTo(d, false); },
    open: function () { return tlFreeOpen; },
    toggle: function (d, opener) { tlFreeToggle(d, opener); }
  };
  // What was added in the ideas sheet, once it closes, or an idea added from inside it: its line on the day card is
  // singled out (concepts-plan.js), so the person sees where it went
  function tlSettle(ids) { if (window.tpPlan) window.tpPlan.flash(ids); }
  function tlLand(id) { if (window.tpPlan) window.tpPlan.flash([id]); }
  function tlRenderDetail() {
    tlRoving();
    // A marker's details open in a sheet stacked over the plan (match sheet, or the added item with Move and
    // Remove); this line only says so. The chosen marker keeps its pressed state for the arrow keys.
    if (tlSelItem && !state.added.some(function (x) { return x.id === tlSelItem; })) tlSelItem = null;
    tlDetail.classList.add('is-empty');
    tlDetail.innerHTML = ''; // the instruction sits above the axis now (Tap a match to ...), where people look first
  }
  function dayLabel(d) { var x = new Date(Date.UTC(2027, 9, 1 + d)); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][x.getUTCDay()] + ' ' + x.getUTCDate() + ' ' + ['Oct', 'Nov'][x.getUTCMonth() - 9]; }
  function tlSelect(k, focus, itemId) {
    tlSel = itemId ? -1 : k; tlSelItem = itemId || null; tlSelFree = null;
    tlRenderDetail();
    if (itemId) return; // added items live on the day cards now, not on the strip
    var el = itemId ? tlItemEls[itemId] : TLM[k].el, x = el.offsetLeft;
    // Keep the chosen marker in view, with some of the days either side
    if (x < tlScroll.scrollLeft + 40 || x > tlScroll.scrollLeft + tlScroll.clientWidth - 40) tlScroll.scrollTo({ left: Math.max(0, x - tlScroll.clientWidth / 2), behavior: reduce.matches ? 'auto' : 'smooth' });
    if (focus) el.focus({ preventScroll: true });
    notesOnly();
  }
  function tlPick(el, focus) {
    if (el.dataset.free) { tlSel = -1; tlSelItem = null; tlSelFree = el; tlRoving(); tlKeepInView(el); if (focus) el.focus({ preventScroll: true }); return; }
    if (el.dataset.item) tlSelect(-1, focus, el.dataset.item); else tlSelect(+el.dataset.k, focus); }
  // Tap (or Enter) opens the marker's details stacked over the plan; the arrow keys only move between markers
  tlCanvas.addEventListener('click', function (e) {
    var b = e.target.closest('.tp-tl-mk'); if (!b) return;
    if (b.dataset.free) { tlPick(b, false); tlFreeToggle(+b.dataset.free, b); return; }
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
  // Hold and drag to move was removed on 16 Nov: Move on each day card (concepts-plan.js) replaces it
  /* Clear plan: takes off everything they added (screenings, places, products, trips, single matches added from All
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
  /* Asked first, in a short sheet stacked over the plan: what comes off (counted by kind) and what stays. Cancel,
     the cross, Escape, the strip above or dragging it down keeps everything; focus goes back to Clear plan. */
  var tlCC = document.getElementById('tp-cc');
  function tlCount(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  document.getElementById('tp-tl-wait').addEventListener('click', function (e) {
    var wt = e.target.closest('[data-wait-team]'); if (wt) { atOpen(wt); return; }
    var wd = e.target.closest('[data-wait-days]'); if (wd) { if (window.tpPicker.openDays) window.tpPicker.openDays(wd); return; }
    var b = e.target.closest('[data-wait-rm]'); if (!b) return;
    var it = state.added.filter(function (x) { return x.id === b.dataset.waitRm; })[0];
    removeItem(b.dataset.waitRm);
    if (it) say(it.title + ' removed. ' + state.added.length + ' added.');
    var next = document.querySelector('#tp-tl-wait [data-wait-rm]');
    if (next) next.focus({ preventScroll: true }); else { if (!tlCanvas.hasAttribute('tabindex')) tlCanvas.tabIndex = -1; tlCanvas.focus({ preventScroll: true }); }
  });
  tlClearBtn.addEventListener('click', function () {
    var by = {}; state.added.forEach(function (x) { var k = x.kind === 'product' ? 'place' : x.kind; by[k] = (by[k] || 0) + 1; });
    var gone = tlClearGone(), off = [], keep = [];
    if (by.match) off.push(tlCount(by.match, 'match you added from All matches', 'matches you added from All matches'));
    if (by.screening) off.push(tlCount(by.screening, 'place to watch', 'places to watch'));
    if (by.place) off.push(tlCount(by.place, 'place to go', 'places to go'));
    if (by.trip) off.push(tlCount(by.trip, 'trip', 'trips'));
    if (gone.length) off.push(tlCount(gone.length, 'ticket mark on an added match', 'ticket marks on added matches'));
    var teams = state.picked.filter(function (x) { return x !== RUGBY.name; });
    if (isPicked(RUGBY)) keep.push('Every NSW match');
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
    document.getElementById('tp-tl-cleared-text').textContent = 'Plan cleared: ' + n + (n === 1 ? ' thing' : ' things') + ' taken off.';
    tlCleared.hidden = false; tlClearSync();
    tlUndo.onclick = function () {
      state.added = prevAdded; state.tickets = prevTickets;
      save(); changed(); renderMatches();
      tlClearEnd(false);
      tlClearBtn.focus({ preventScroll: true });
      say('Undone. ' + n + (n === 1 ? ' thing is' : ' things are') + ' back on your plan.');
    };
    tlUndo.focus({ preventScroll: true });
    say('Plan cleared: ' + n + (n === 1 ? ' thing' : ' things') + ' taken off' + (gone.length ? ', with ' + gone.length + (gone.length === 1 ? ' ticket mark' : ' ticket marks') : '') + '. Your teams and your days stay. Undo is available for a few seconds.');
    clearTimeout(tlClearT);
    tlClearT = setTimeout(function () { tlClearEnd(true); }, 6000);
  }
  // The panel's height: as tall as fits under the top of the phone, up to 460px
  // Open, the sheet is as tall as it can be: it leaves a 48px strip of the dimmed page at the top (44px or more to tap)
  var TL_STRIP = 48;
  // A faint line under the title row, only once the content has scrolled under it
  var tlHead = document.querySelector('.tp-tl-head');
  tlPanel.addEventListener('scroll', function () { tlHead.classList.toggle('is-stuck', tlPanel.scrollTop > 0); }, { passive: true });
  /* Desktop website (the page on its own, 1024px and wider): Your plan is a rail on the right, not a sheet. It starts
     beside the team picker and, as the page scrolls, follows it down to just under the section nav; open, the plan
     fills the rail to 24px above the window's foot. The page beside it stays usable. */
  var wideMq = matchMedia('(min-width: 1024px)');
  function wide() { return wideMq.matches && document.documentElement.classList.contains('pv-device'); }
  var railTop = 0;
  function railFollow() {
    if (!wide()) { tl.style.removeProperty('--rail-top'); return; }
    tl.style.setProperty('--sbw', (body.offsetWidth - body.clientWidth) + 'px'); // the page's scrollbar, so the rail lines up with the header
    var pr = phoneEl.getBoundingClientRect(), capW = phoneEl.querySelector('.tp-cap-wrap'), pick = document.getElementById('tp-pick');
    var under = capW ? capW.getBoundingClientRect().bottom - pr.top + 24 : 24;
    var start = pick ? pick.getBoundingClientRect().top - pr.top : under;
    railTop = Math.max(under, start);
    // Open, the plan needs room: the rail rises (never above the nav) until 320px of it fits above the window's foot
    if (tlOpen) railTop = Math.max(under, Math.min(railTop, phoneEl.clientHeight - 24 - BAR - 320));
    railTop = Math.round(railTop);
    tl.style.setProperty('--rail-top', railTop + 'px');
    tlFit();
  }
  function tlFit() {
    var h = wide() ? phoneEl.clientHeight - railTop - BAR - 24 : phoneEl.clientHeight - BAR - TL_STRIP;
    tl.style.setProperty('--tl-p', Math.max(wide() ? 160 : 260, h) + 'px');
  }
  tlFit();
  window.addEventListener('resize', function () { railFollow(); tlFit(); });
  // Shown once the match cards have come into view and their top has passed the top of the phone (never for the fan)
  function tlRef() {
    if (!results.hidden) return deck;
    return allSec && !allSec.hidden ? document.getElementById('tp-all-scroll') : null;
  }
  // Go to your plan: the first Tab stop in the phone, so the bar (last in the markup) is two presses away
  var skipEl = document.getElementById('tp-skip');
  if (skipEl) skipEl.addEventListener('click', function (e) { e.preventDefault(); document.getElementById('tp-tl-toggle').focus(); });
  if (skipEl) skipEl.hidden = !tlOn;
  function syncBar() {
    railFollow(); // the rail's top follows the page as it changes, not only as it scrolls
    var ref = tlRef(), r = ref && ref.getBoundingClientRect(), box = body.getBoundingClientRect();
    // The cards' top has passed the top of the phone; or, where the page is too short for that, the cards are in view and
    // the page is scrolled to its end (otherwise the bar could never appear under a short list)
    var atEnd = body.scrollTop + body.clientHeight >= body.scrollHeight - 2;
    var seen = !!(r && r.height > 0 && (r.top < box.top || (atEnd && r.top < box.bottom && r.bottom > box.top)));
    // Once something is on the plan, the bar stays up anywhere below the fan, so an Add never goes nowhere
    var fanBox = handWrap().getBoundingClientRect();
    var belowFan = fanBox.height > 0 && fanBox.bottom < box.top;
    // A pick is shown working: the bar is up whenever a team is picked
    // From a moment after the page loads the bar is always up, empty to start (Your plan, No matches yet), so the plan is
    // seen before anything is in it
    var on = barIntro || tlOpen || state.picked.length > 0 || seen || (state.added.length > 0 && belowFan);
    if (skipEl) skipEl.hidden = !on; // the skip link only points somewhere while the bar is up
    if (on === tlOn) return;
    tlOn = on;
    tl.classList.toggle('is-on', on);
    tl.inert = !on || stackSolo; // behind the team list opened from the page, it waits
    notesOnly();
  }
  var barIntro = false, barRaf = 0;
  setTimeout(function () { barIntro = true; syncBar(); }, 700);
  body.addEventListener('scroll', function () { if (!barRaf) barRaf = requestAnimationFrame(function () { barRaf = 0; railFollow(); syncBar(); }); }, { passive: true });
  railFollow();
  window.addEventListener('resize', syncBar);
  /* The mini strip and the big axis are the same plan at two scales. Opening, a copy of the axis starts shrunk onto
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
    var an = z.animate(open ? frames : frames.slice().reverse(), { duration: open ? 440 : 340, easing: open ? 'cubic-bezier(.4, 0, .2, 1)' : 'cubic-bezier(.4, 0, .2, 1)' });
    an.onfinish = an.oncancel = function () { z.remove(); tlScroll.style.visibility = ''; };
  }
  var tlNudged = false;
  function tlSetOpen(open, focusBack) {
    if (open === tlOpen) return;
    if (!open && stackEl) stackClose(false); // a sheet stacked over the plan goes with it
    if (!open) tlZoom(false);
    if (!open && tlFreeOpen !== null) tlFreeShow(null);
    tlOpen = open;
    tl.classList.toggle('is-open', open);
    tlToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    tlPanel.inert = !open;
    body.inert = open && !wide(); // the screen behind waits under the scrim while the plan is open (not beside the desktop rail)
    tlScrim.classList.toggle('is-on', open && !wide());
    if (typeof toastEl !== 'undefined' && toastEl && !toastEl.hidden) toastPlace(); // a message on screen moves above or below the bar with it
    if (wide()) { // the rail glides to its new top, so the eye can follow it (check 1)
      tl.classList.add('is-gliding'); clearTimeout(tl._glide);
      tl._glide = setTimeout(function () { tl.classList.remove('is-gliding'); }, 420);
      railFollow();
    }
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
      // The first time it opens with matches on it, the first one is singled out once (a ring, twice), so it is clear
      // the matches themselves are what to tap; reduced motion: the ring shows and fades without pulsing
      var how = document.getElementById('tp-tl-how');
      if (how && !how.hidden && !tlNudged && nswFirst && nswFirst.el) {
        tlNudged = true;
        var nel = (TLM.filter(function (m) { return m.on; })[0] || nswFirst).el;
        setTimeout(function () { nel.classList.add('is-nudge'); setTimeout(function () { nel.classList.remove('is-nudge'); }, 1900); }, 480);
      }
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
    if (!tlOn || stackEl || wide() || (e.pointerType === 'mouse' && e.button !== 0)) return; // the desktop rail does not drag
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
  // While the plan is open, Tab stays in it (the bar and the sheet), as in the other sheets: the page behind is
  // inert, but the skip link and the prototype's own panel sat outside it
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !tlOpen || stackEl || wide()) return; // the desktop rail sits beside the page: Tab moves on
    var tlEl = document.getElementById('tp-tl');
    var fs = Array.prototype.filter.call(tlEl.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'), function (el) { return !el.disabled && !el.closest('[hidden], [inert]') && el.getClientRects().length; });
    if (!fs.length) return;
    var a = fs[0], z = fs[fs.length - 1], at = document.activeElement;
    if (!tlEl.contains(at)) { e.preventDefault(); (e.shiftKey ? z : a).focus(); }
    else if (e.shiftKey && at === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && at === z) { e.preventDefault(); a.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (stackEl) { e.preventDefault(); stackClose(); } // the top sheet only
    else if (tlOpen) { e.preventDefault(); tlSetOpen(false); }
  });

  /* ---------- Stacked sheets over the open plan: one pattern, one level deep ----------
     A sheet opened from the plan (.tp-stack: Save & share now; a trip, a match or Move later) slides up while the
     plan moves back (scaled to 94% from its top centre, its top raised 10px, dimmed by the stack scrim), in one
     motion with one timing; closing reverses both. The sheet stops 16px below the plan's moved-back top, so a
     strip of the plan shows above it. A third sheet replaces the second rather than stacking again. */
  // The day cards are redrawn while a sheet is open over them (an idea added, a move): the control that opened the sheet
  // is then a new element, found again by what it does, so closing still puts focus back on it
  function liveOpener(el) { return el && !el.isConnected && window.tpPlan ? window.tpPlan.same(el) || el : el; }
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
  // The same sheet over the page rather than over the plan (the team list from Your plan so far): page and bar wait
  // under the scrim, Tab stays in the sheet, Escape and the scrim close it
  var stackSolo = false, soloAnchor = null, soloY = 0;
  // Picks made in the sheet rebuild the page above (tabs, cards, the map): the section it was opened from is held
  // where it was, so closing the sheet shows the same place
  function soloHold() { if (soloAnchor && soloAnchor.isConnected) body.scrollTop += soloAnchor.getBoundingClientRect().top - soloY; }
  function stackOpenSolo(sheet, opener) {
    if (stackEl) return;
    stackOpener = opener || document.activeElement; stackEl = sheet; stackSolo = true;
    soloAnchor = opener && opener.closest('section'); soloY = soloAnchor ? soloAnchor.getBoundingClientRect().top : 0;
    sheet.style.setProperty('--stack-top', '56px');
    sheet.scrollTop = 0; sheet.inert = false; sheet.classList.add('is-open');
    tl.inert = true; body.inert = true;
    stackScrim.classList.add('is-on');
    sheet.focus({ preventScroll: true });
    notesOnly();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !stackSolo || !stackEl) return;
    var fs = Array.prototype.filter.call(stackEl.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])'), function (el) { return !el.disabled && !el.closest('[hidden]') && el.getClientRects().length; });
    if (!fs.length) return;
    var a = fs[0], z = fs[fs.length - 1], at = document.activeElement;
    if (!stackEl.contains(at)) { e.preventDefault(); (e.shiftKey ? z : a).focus(); }
    else if (e.shiftKey && at === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && at === z) { e.preventDefault(); a.focus(); }
  });
  function stackClose(focusBack) {
    if (!stackEl) return;
    var sh = stackEl; stackEl = null;
    if (stackSolo) {
      stackSolo = false; stackHide(sh);
      soloHold(); soloAnchor = null;
      body.inert = false; stackScrim.classList.remove('is-on'); tl.inert = !tlOn; syncBar();
      stackOpener = liveOpener(stackOpener);
      if (focusBack !== false && stackOpener && stackOpener.isConnected) stackOpener.focus({ preventScroll: true });
      stackOpener = null;
      sh.dispatchEvent(new CustomEvent('tp:stackclose', { bubbles: true, detail: { solo: true } }));
      notesOnly();
      return;
    }
    stackHide(sh);
    tl.classList.add('is-fwd'); // the way back has the sheet's closing timing, so the two still move as one
    tl.classList.remove('is-back');
    clearTimeout(fwdT); fwdT = setTimeout(function () { tl.classList.remove('is-fwd'); }, 360);
    tl.inert = false;
    stackScrim.classList.remove('is-on');
    stackOpener = liveOpener(stackOpener);
    if (focusBack !== false && stackOpener && stackOpener.isConnected) stackOpener.focus({ preventScroll: true });
    stackOpener = null;
    sh.dispatchEvent(new CustomEvent('tp:stackclose', { bubbles: true }));
    notesOnly();
  }
  stackScrim.addEventListener('click', function () { stackClose(); }); // the strip of plan and page above the sheet
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
      // A tap on the grabber (no drag) does the same as a full drag
      if (dy < 6 || dy > sh.offsetHeight / 3 || (v > .6 && dy > 24)) {
        // A sheet with its own levels (a sheet over a sheet) can take the dismiss and close one level instead
        if (sh.dispatchEvent(new CustomEvent('tp:stackdismiss', { cancelable: true }))) stackClose();
      } else sh.style.transform = '';
    }
    grab.addEventListener('pointerup', letGo); grab.addEventListener('pointercancel', letGo);
  }
  phoneEl.querySelectorAll('.tp-stack').forEach(stackRegister);
  // Pick your team (none picked) and Change your teams (some picked) open the Your teams sheet over the plan
  document.getElementById('tp-tl-pick').addEventListener('click', function (e) { tsOpen(e.currentTarget); });
  document.getElementById('tp-tl-addteam').addEventListener('click', function (e) { atOpen(e.currentTarget); });
  tsLinkBtn.addEventListener('click', function (e) { tsOpen(e.currentTarget); });
  /* ---------- Added items and the trip answer: used by the Where to watch, Suits your 3rd half and question sections
     (concepts-third-half.js) through window.tpPicker. Saved on this device with the picks. ---------- */
  function addItem(it) {
    if (state.added.some(function (x) { return x.id === it.id; })) return false;
    // Saved with no team and no days (18 Nov): a thing tied to a date (a screening, a match day idea) waits with the
    // other saves until days are set; setting days puts it on its own date (concepts-third-half.js, slotSaved)
    if (!own() && !(state.trip && state.trip.from && state.trip.to) && it.kind !== 'match' && it.day && !it.unplaced) { it.fixed = it.day; it.day = ''; it.unplaced = true; }
    var firstSave = it.kind !== 'match' && !state.added.some(function (x) { return x.kind !== 'match'; }), barWas = tlOn;
    state.added.push(it); save(); changed(); syncBar();
    // The first save made while the plan bar is out of sight is confirmed where they are (check 11)
    if (firstSave && !barWas && !tlOpen) toast('Saved to your plan', it.title + (it.unplaced ? ' waits in your plan until you set your days.' : ', ' + it.day + '.'), { label: 'Open your plan', fn: function () { tlSetOpen(true); } });
    return true;
  }
  function removeItem(id) {
    var n = state.added.length;
    state.added = state.added.filter(function (x) { return x.id !== id; });
    if (state.added.length === n) return;
    // The open plan stays on the days it was showing (it jumped back to the start of the plan)
    var keepX = tlOpen ? tlScroll.scrollLeft : null;
    save(); changed();
    if (keepX !== null) { tlScroll.scrollLeft = keepX; requestAnimationFrame(function () { tlScroll.scrollLeft = keepX; setTimeout(function () { tlScroll.scrollLeft = keepX; }, 60); }); }
  }
  function setTrip(t) { state.trip = normTrip(t); save(); changed(); }
  // The added item travels from the button that added it to the plan bar, then the badge pops
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
  // The person's matches, as the plan shows them: picked teams', every NSW match for Here for the rugby, or all
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
  if (tlInterBtn) tlInterBtn.addEventListener('click', function () {
    state.interstate = !state.interstate;
    save();
    tlUpdate();
    var n = TLM.filter(function (m) { return m.vis && !m.on; }).length;
    say(state.interstate ? n + ' interstate matches shown, to watch in NSW. They are not added to your plan.' : 'Interstate matches hidden.');
    notesOnly();
  });
  tlReady = true;
  tlUpdate();

  renderChosen();
  caption.textContent = CAPTION_REST; capClear();
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
    state.picked = []; state.tickets = []; state.allFilter = { nsw: true, city: null, v: 2 };
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (allReset) allReset();
    deck.innerHTML = '';
    setNsw(false); closeFind(false); clearFind(); offset = START; dealt = false;
    state.view = 'fan'; state.nswMark = false; state.notGoing = []; showVariant(false); viewLabel(); syncNswMark();
    state.tab = 'yours';
    clearTimeout(undoTimer);
    renderChosen();
    renderMatches();
    caption.textContent = CAPTION_REST; capClear();
    place(false);
    body.scrollTop = 0;
    tlSetOpen(false, false); tlSel = -1; tlSelItem = null; state.added = []; state.trip = null; save(); changed();
    watchDeal();
    say('Prototype reset. No teams picked.');
  });

  window.tpPicker = { save: function () { save(); }, stackRegister: stackRegister, tlClash: function (id) { return tlClash[id] || null; }, tlSelect: function (k, focus, id) { tlSelect(k, focus, id); }, stackOpen: stackOpen, stackClose: stackClose, stackOn: function () { return stackEl; }, teams: TEAMS, state: state, userMatches: userMatches, addItem: addItem, removeItem: removeItem, setTrip: setTrip,
    flyToBar: flyToBar, tlLand: tlLand, tlSettle: tlSettle, say: say, allMatches: allMatches, inferTrip: inferTrip, closeTimeline: function () { if (tlOpen) tlSetOpen(false); }, openTimeline: function (focusSel) { tlSetOpen(true); var el = focusSel && tlPanel.querySelector(focusSel); if (el) el.focus({ preventScroll: true }); }, side: side, esc: esc, list: list, countPhrase: countPhrase, isoRange: isoRange, isoDay: isoDay, dayOf: dayOf, reduce: reduce, body: body,
    rugby: function () { return isPicked(RUGBY); }, picked: function () { return state.picked.length > 0; }, own: own,
    // For the match page (concepts-third-half.js): the match by its key, whether a team is picked, picking a team
    // exactly as the fan does (from: null, as the page covers the fan and the bar), and a ticket mark
    match: function (key) { return TLM_BY[key] || null; }, isPicked: function (n) { return state.picked.indexOf(n) > -1; },
    pickTeam: function (n) { var c = TEAMS[n]; if (!c) return ''; var i = CARDS.indexOf(c); if (pos(i) < 0) setNsw(false); return toggle(i, null, true); },
    setTicket: setTicket, summary: function () { return summary(); }, flag: function (n) { return FLAG[n] || ''; }, teamBand: function (n) { return TEAM_BAND[n] || null; },
    // Trips that clash, by item id: [{ name, day }] (filled by the plan; read by the plan and the trip cards)
    clashes: function () { return tlClash; },
    // The team list as a sheet, from anywhere on the page (Your plan so far)
    openTeams: function (opener) { tsOpen(opener); } };

  /* ---------- Toasts: what a change did, said where the person is ----------
     One at a time, near the foot of the screen: above the Your plan bar on a phone, at the foot of the content column
     on a desktop. A short title saying what happened, a line saying what it changed elsewhere on the page, and at most
     one link to it (its label names where it goes, so the page only moves when asked). Stays 6 seconds, longer while
     the pointer or keyboard focus is on it; the cross closes it. Screen readers already hear each change from say(),
     so the toast is not a live region and says nothing twice. Rises 12px and fades in; reduced motion fades only. */
  var toastEl = document.createElement('div');
  toastEl.className = 'tp-toast';
  toastEl.hidden = true;
  toastEl.innerHTML = '<div class="tp-toast-txt"><p class="tp-toast-t"></p><p class="tp-toast-d"></p></div>' +
    '<button type="button" class="tp-toast-act"></button>' +
    '<button type="button" class="tp-toast-x" aria-label="Close message"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg></button>';
  phoneEl.appendChild(toastEl);
  var toastT = 0, toastHeld = false, toastFn = null;
  /* Where it sits: from the bottom of the screen (16px on a phone, 24px on a desktop), and 12px above whatever is
     pinned to the bottom of the screen and showing on top there: the Your plan bar, the open plan's Save & share
     row, a sheet's own bottom row (Done, Use these dates, the photo's buttons), the day by day map's card, the
     keyboard. Only one that is actually on top counts (a bar under an open sheet does not), and only while its foot
     is at the screen's foot. Checked while the toast is up, so it moves with the bar appearing or a sheet opening. */
  var PINNED = '.tp-tl-bar, .tp-tl-foot, .tp-days-bar, .tp-ts-acts, .tp-cc-acts, .tp-ph-acts, .tp-mapfs:not([hidden]) .tp-map-card, .tp-kbd';
  var toastWatch = 0;
  function onTop(el, r) {
    var x = r.left + r.width / 2, y = r.top + Math.min(6, r.height / 2);
    var hits = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
    for (var i = 0; i < hits.length; i++) { if (toastEl.contains(hits[i])) continue; return el.contains(hits[i]) || hits[i] === el; }
    return false;
  }
  function toastPlace() {
    var pr = phoneEl.getBoundingClientRect(), base = wide() ? 24 : 16, b = base;
    var els = [].filter.call(phoneEl.querySelectorAll(PINNED + ', .tp-map-hint:not([hidden])'), function (el) {
      if (!el.getClientRects().length) return false;
      var r = el.getBoundingClientRect();
      return r.height >= 1 && r.top < pr.bottom && r.right > pr.left && r.left < pr.right && (el.classList.contains('tp-map-hint') || onTop(el, r)); // showing, and not under a sheet or layer (the swipe prompt takes no taps, so the hit test cannot see it; it only shows on top)
    }).map(function (el) { return el.getBoundingClientRect(); }).sort(function (x, y) { return y.bottom - x.bottom; });
    // Stack up from the foot: a thing counts if it reaches down to the level reached so far (the screen's foot first,
    // then the top of what sits there, so the map's swipe prompt above its card counts too)
    var level = pr.bottom, grew = true;
    while (grew) {
      grew = false;
      els.forEach(function (r) { if (r.bottom >= level - 40 && r.top < level) { level = r.top; grew = true; } });
    }
    if (level < pr.bottom) b = Math.max(base, Math.round(pr.bottom - level) + 12);
    toastEl.style.setProperty('--toast-b', b + 'px');
  }
  function toastHide(now) {
    clearTimeout(toastT);
    if (toastEl.hidden) return;
    if (now || reduce.matches || !toastEl.animate) { toastEl.hidden = true; toastFollow(false); return; }
    toastEl.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px)' }], { duration: 180, easing: 'cubic-bezier(.4, 0, 1, 1)' }).onfinish = function () { toastEl.hidden = true; toastFollow(false); };
  }
  function toastFollow(on) {
    clearInterval(toastWatch);
    if (on) toastWatch = setInterval(function () { if (toastEl.hidden) clearInterval(toastWatch); else toastPlace(); }, 150);
  }
  function toastArm() { clearTimeout(toastT); if (!toastHeld) toastT = setTimeout(function () { toastHide(); }, 6000); }
  /* key: a toast that repeats as someone adjusts something (setting days) passes one; while a toast with the same key
     is showing, the new one updates it in place, without the flash, and its six seconds start again */
  var toastKey = '';
  function toast(title, detail, action, key) {
    var quiet = !toastEl.hidden && !!key && key === toastKey;
    toastKey = key || '';
    toastEl.querySelector('.tp-toast-t').textContent = title;
    var d = toastEl.querySelector('.tp-toast-d'); d.textContent = detail || ''; d.hidden = !detail;
    var act = toastEl.querySelector('.tp-toast-act');
    toastFn = action && action.fn || null;
    act.textContent = action ? action.label : ''; act.hidden = !action;
    var was = !toastEl.hidden;
    if (quiet) { toastPlace(); toastArm(); return; }
    toastEl.hidden = false;
    toastEl.classList.add('is-placing'); toastPlace(); void toastEl.offsetWidth; toastEl.classList.remove('is-placing'); // first place without a glide
    toastFollow(true);
    if (toastEl.animate && !was) toastEl.animate(reduce.matches ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: reduce.matches ? 150 : 260, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    else if (toastEl.animate) toastEl.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 160 }); // a new message replacing one on screen
    toastArm();
  }
  toastEl.querySelector('.tp-toast-x').addEventListener('click', function () { toastHide(); });
  toastEl.querySelector('.tp-toast-act').addEventListener('click', function () { var fn = toastFn; toastHide(true); if (fn) fn(); });
  toastEl.addEventListener('pointerenter', function () { toastHeld = true; clearTimeout(toastT); });
  toastEl.addEventListener('pointerleave', function () { toastHeld = false; toastArm(); });
  toastEl.addEventListener('focusin', function () { toastHeld = true; clearTimeout(toastT); });
  toastEl.addEventListener('focusout', function () { toastHeld = false; toastArm(); });
  phoneEl.addEventListener('tp:tlclose', toastPlace);
  // Go to a section named in a toast's link: it scrolls into view under the section nav, gently unless motion is reduced
  function goTo(sec) {
    if (!sec) return;
    if (window.tpView) window.tpView.reveal(sec); // a section in another tab (Home, the planner): that tab first
    if (tlOpen && !wide()) tlSetOpen(false, false);
    var nav = phoneEl.querySelector('.tp-cap-wrap'), top = nav ? nav.offsetHeight + 24 : 16;
    body.scrollTo({ top: body.scrollTop + sec.getBoundingClientRect().top - body.getBoundingClientRect().top - top, behavior: reduce.matches ? 'auto' : 'smooth' });
    var h = sec.querySelector('h2, h3'); if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  window.tpPicker.toast = toast;
  window.tpPicker.toastHide = toastHide;
  window.tpPicker.goTo = goTo;
  window.tpPicker.openPlan = function () { if (!tlOpen) tlSetOpen(true); };
  // The sections below the match cards read the picks once this is ready
  phoneEl.dispatchEvent(new CustomEvent('tp:ready'));
})();
