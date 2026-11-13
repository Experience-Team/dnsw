/* Concepts: Pick your team (prototype-pick-your-team.html).
   A fanned hand of cards: the 24 teams, alphabetical, then "Here for the rugby". Drag or swipe the fan sideways,
   or use the arrow keys; tap or press Space to pick a card (as many as you like). "See their matches" flies the
   picked cards out of the fan and flips them to show their matches.
   Data: window.cnFixtures (concepts-fixtures.js), the 36 pool matches and the knockouts in NSW, kick-offs in Sydney
   time. Nothing else is added: no flags, no community or home-country times, no ticket links.
   Jobs covered (docs/jtbd-itinerary.md): T1 one team, T5 and T7 more than one, T8 and T9 no team, T2 and T12
   tickets, T3 NSW or interstate, T4 knockouts, T6 a shared match noted on both cards, T15 saved on this device,
   T16 skip, and Clear all to start again. The choice is kept in this browser under tp-pick-v1; ?reset clears it. */
(function () {
  'use strict';
  var root = document.getElementById('tp-pick');
  var FIX = window.cnFixtures;
  if (!root || !Array.isArray(FIX)) return;

  var fan = document.getElementById('tp-fan');
  var caption = document.getElementById('tp-fan-caption');
  var chosenEl = document.getElementById('tp-chosen');
  var showBtn = document.getElementById('tp-show');
  var clearBtn = document.getElementById('tp-clear');
  var picker = document.getElementById('tp-picker');
  var results = document.getElementById('tp-results');
  var deck = document.getElementById('tp-deck');
  var sum = document.getElementById('tp-results-sum');
  var skipped = document.getElementById('tp-skipped');
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
  // The 25th card: no team, every match in NSW
  var RUGBY = { name: 'Here for the rugby', code: 'ALL', rugby: true };
  var CARDS = names.map(function (n) { return TEAMS[n]; }).concat([RUGBY]);
  var R16 = FIX.filter(function (f) { return /^Round of 16/.test(f.s); });

  /* ---------- State, kept in this browser ---------- */
  var KEY = 'tp-pick-v1';
  // added: things put on the timeline (screenings, the village, products); trip: the one optional question's answer
  var state = { picked: [], tickets: [], view: 'pick', added: [], trip: null };
  try {
    if (/[?&]reset\b/.test(location.search)) localStorage.removeItem(KEY);
    var rec = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (rec && Array.isArray(rec.picked)) {
      state.picked = rec.picked.filter(function (n) { return n === RUGBY.name || TEAMS[n]; });
      state.tickets = Array.isArray(rec.tickets) ? rec.tickets.filter(function (x) { return typeof x === 'string'; }) : [];
      if (rec.view === 'skipped' || (rec.view === 'results' && state.picked.length)) state.view = rec.view;
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
  function changed() { if (tlReady) { tlUpdate(); syncBar(); } notesOnly(); }
  function say(msg) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 30); }
  function isPicked(c) { return state.picked.indexOf(c.name) > -1; }
  function nswLine(c) { return c.rugby ? 'Every match in NSW' : c.nsw ? c.nsw + (c.nsw === 1 ? ' match' : ' matches') + ' in NSW' : 'No matches in NSW'; }
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
    return '<span class="tp-card-code">' + esc(c.code) + '</span><span class="tp-card-name">' + esc(c.name) + '</span>' +
      '<span class="tp-card-meta">' + (c.rugby ? 'No team' : esc(c.pool)) + '<br>' + esc(nswLine(c)) + '</span>';
  }
  fan.innerHTML = CARDS.map(function (c, i) {
    return '<button type="button" class="tp-card' + (c.rugby ? ' tp-card--rugby' : '') + '" data-i="' + i + '" tabindex="-1" aria-pressed="false" aria-label="' +
      esc(c.name + ', ' + (c.rugby ? 'no team, see every match in NSW' : c.pool + ', ' + nswLine(c))) + '">' + front(c) + TICK + '</button>';
  }).join('');
  var cards = Array.prototype.slice.call(fan.children);
  var offset = 3, dealt = false;
  // trans: an inline transition for this move only (the glide to a picked card); otherwise the stylesheet's
  function place(animate, trans) {
    var mid = Math.round(offset);
    cards.forEach(function (b, i) {
      var rel = i - offset, c = CARDS[i];
      var lift = (isPicked(c) ? LIFT : 0) + (i === mid ? 6 : 0);
      b.style.transition = !animate ? 'none' : trans || '';
      b.style.transform = dealt ? 'rotate(' + angleOf(rel).toFixed(2) + 'deg) translateY(' + (-lift) + 'px)' : 'rotate(0deg) translateY(0)';
      var far = Math.abs(rel) > 7.5;
      b.style.opacity = far ? '0' : '';
      b.style.visibility = far ? 'hidden' : '';
      b.tabIndex = i === mid ? 0 : -1;
      b.classList.toggle('is-mid', i === mid);
      b.classList.toggle('is-picked', isPicked(c));
      b.setAttribute('aria-pressed', isPicked(c) ? 'true' : 'false');
    });
    var c = CARDS[mid];
    caption.innerHTML = '<strong>' + esc(c.name) + '</strong> &middot; ' + esc(c.rugby ? 'No team, every match in NSW' : c.pool + ', ' + nswLine(c).replace(/^No /, 'no '));
  }
  function settle(to, focus, trans) {
    offset = Math.max(0, Math.min(CARDS.length - 1, Math.round(to)));
    place(true, trans);
    if (focus) cards[offset].focus({ preventScroll: true });
  }
  // The deal: the first time the fan comes into view, the hand opens from a stack. The one authored moment here.
  function deal() {
    if (dealt) return;
    dealt = true;
    if (reduce.matches) { place(false); return; }
    cards.forEach(function (b, i) { b.style.transitionDelay = (Math.abs(i - offset) * 22) + 'ms'; });
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
    offset = Math.max(-.6, Math.min(CARDS.length - .4, drag.o - dx / PX));
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
    offset = Math.max(0, Math.min(CARDS.length - 1, offset + e.deltaX / PX));
    place(false);
    clearTimeout(fan._w); fan._w = setTimeout(function () { settle(offset); }, 120);
  }, { passive: false });

  function toggle(i) {
    var c = CARDS[i], on = !isPicked(c), note = '';
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
    var dist = Math.abs(i - offset), dur = Math.round(Math.min(1100, 620 + 120 * dist));
    var ease = 'cubic-bezier(.65, 0, .35, 1)';
    settle(i, false, reduce.matches ? '' : 'transform ' + dur + 'ms ' + ease + ', opacity 220ms ease-out, background-color 200ms ease-out, color 200ms ease-out');
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
    say(c.name + (on ? ' picked.' : ' removed.') + note + ' ' + chosenText());
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
    else if (k === 'End') to = CARDS.length - 1;
    if (to === null) return;
    e.preventDefault();
    deal();
    settle(to, true);
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
    var n = state.picked.length;
    showBtn.setAttribute('aria-disabled', n ? 'false' : 'true');
    clearBtn.hidden = !n;
    showBtn.textContent = !n ? 'See their matches' : n === 1 && state.picked[0] === RUGBY.name ? 'See the NSW matches' : 'See their matches (' + n + ')';
    changed(); // after the label is rewritten, which would otherwise wipe the annotation badge
  }
  // Clear all: every card back in the hand and every ticket mark gone, so the picker starts again
  clearBtn.addEventListener('click', function () {
    state.picked = []; state.tickets = [];
    save();
    place(true);
    renderChosen();
    cards[Math.round(offset)].focus({ preventScroll: true }); // the button has just hidden itself
    say('All teams and tickets cleared. No teams picked yet.');
  });
  document.getElementById('tp-rugby-link').addEventListener('click', function () {
    deal();
    var i = CARDS.length - 1;
    if (!isPicked(RUGBY)) toggle(i); else settle(i);
    cards[i].focus({ preventScroll: true });
  });

  /* ---------- The flip: the picked cards fly out of the fan and turn over ---------- */
  function others(f, self) {
    // Picked teams also in this match, other than the card it sits on: the match is the same one, so its ticket is too
    return f.t.split(' v ').filter(function (n) { return n !== self && state.picked.indexOf(n) > -1; });
  }
  function row(f, self, rugbyCard) {
    var id = idOf(f), opp = rugbyCard ? f.t : 'v ' + f.t.split(' v ').filter(function (n) { return n !== self; })[0];
    var also = rugbyCard ? f.t.split(' v ').filter(function (n) { return state.picked.indexOf(n) > -1; }) : others(f, self);
    var tag = f.a ? '<span class="tp-tag tp-tag--away">Interstate: ' + esc(f.a) + '</span>' : '<span class="tp-tag">In NSW</span>';
    var note = also.length ? '<p class="tp-m-also">' + (rugbyCard ? 'Your team: ' : 'Also on your ') + esc(list(also)) + (rugbyCard ? '' : ' card') + '</p>' : '';
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
  function back(c) {
    var ms = c.rugby ? nswPool : c.matches;
    var head = c.rugby ? nswPool.length + ' pool matches in NSW' : c.pool + ' &middot; ' + c.matches.length + ' pool matches, ' + c.nsw + ' in NSW';
    return '<div class="tp-back-head"><span class="tp-back-code">' + esc(c.code) + '</span><div><h4 class="tp-back-name">' + esc(c.name) + '</h4><p class="tp-back-meta">' + head + '</p></div></div>' +
      '<ol class="tp-ms' + (c.rugby ? ' tp-ms--cols' : '') + '">' + ms.map(function (f) { return row(f, c.name, c.rugby); }).join('') +
      // On the columned card the knockout note is a column of its own, so it adds width, not height
      (c.rugby ? '<li class="tp-ko tp-ko--col">' + esc(koNote(c)) + '</li></ol>' : '</ol><p class="tp-ko">' + esc(koNote(c)) + '</p>');
  }
  function pickedCards() {
    // Teams in the order they were picked, then Here for the rugby last
    var t = state.picked.filter(function (n) { return n !== RUGBY.name; }).map(function (n) { return TEAMS[n]; });
    return isPicked(RUGBY) ? t.concat([RUGBY]) : t;
  }
  function summary() {
    var ids = {}, nsw = 0, tickets = 0;
    pickedCards().forEach(function (c) { (c.rugby ? nswPool : c.matches).forEach(function (f) { ids[idOf(f)] = f; }); });
    var all = Object.keys(ids);
    all.forEach(function (k) { if (!ids[k].a) nsw++; if (state.tickets.indexOf(k) > -1) tickets++; });
    var teams = pickedCards().filter(function (c) { return !c.rugby; }).map(function (c) { return c.name; });
    var who = teams.length ? list(teams) + (isPicked(RUGBY) ? ', plus every NSW match' : '') : 'Every NSW match';
    // A match between two of your teams counts once
    return who + ': ' + all.length + (all.length === 1 ? ' match' : ' matches') + ', ' + nsw + ' in NSW. ' + (tickets ? tickets + (tickets === 1 ? ' ticket.' : ' tickets.') : 'No tickets marked yet.');
  }
  function buildDeck() {
    var cs = pickedCards();
    deck.classList.toggle('is-single', cs.length === 1);
    deck.innerHTML = cs.map(function (c) {
      return '<article class="tp-rcard' + (c.rugby ? ' tp-rcard--rugby' : '') + '" data-name="' + esc(c.name) + '" aria-label="' + esc(c.name) + '"><div class="tp-flip">' +
        '<div class="tp-face tp-face--front" aria-hidden="true">' + front(c) + '</div>' +
        '<div class="tp-face tp-face--back">' + back(c) + '</div></div></article>';
    }).join('');
    // The hint shows whenever there is more to the side: other cards, or the columns of Here for the rugby
    var hint = document.getElementById('tp-deck-hint');
    hint.textContent = cs.length > 1 ? 'Swipe for your other cards.' : 'Swipe sideways for more matches.';
    hint.hidden = true;
    requestAnimationFrame(function () { hint.hidden = deck.scrollWidth <= deck.clientWidth + 2; });
    sum.textContent = summary();
  }
  /* ---------- All matches ----------
     Below the picker, whether or not anyone has picked: every match in the fixture list, in date order. Kept minimal,
     as this page is not the main source for matches. Hidden while the picked cards are showing (Your matches). */
  var allSec = document.getElementById('tp-all');
  function minutes(k) { var m = /^(\d+):(\d+)(am|pm)$/.exec(k || ''); return m ? ((+m[1] % 12) + (m[3] === 'pm' ? 12 : 0)) * 60 + +m[2] : 24 * 60; }
  function side(n) { return FLAG[n] ? '<span class="tp-flag" aria-hidden="true">' + FLAG[n] + '</span> ' + esc(n) : esc(n); }
  if (allSec) {
    var rows = FIX.slice().sort(function (a, b) { return ord(a.d) - ord(b.d) || minutes(a.k) - minutes(b.k); }).map(function (f) {
      var who = f.t ? f.t.split(' v ').map(side).join(' <span class="tp-all-v">v</span> ') : esc(f.s);
      var stage = f.t && !/^Pool /.test(f.s) ? '<span class="tp-all-stage">' + esc(f.s) + '</span>' : f.t ? '' : '<span class="tp-all-stage">Teams to be decided</span>';
      return '<li class="tp-all-m' + (f.a ? ' is-away' : '') + '"><p class="tp-all-when">' + esc(f.d) + ', ' + esc(f.k || 'time to be confirmed') + '</p><p class="tp-all-teams">' + who + '</p>' + stage +
        '<p class="tp-all-where">' + esc(f.v + ', ' + f.p) + (f.a ? ' (interstate)' : '') + '</p></li>';
    });
    // Columns of five: each is a card without a border, snapped as the strip is swiped sideways
    var cols = '';
    for (var c0 = 0; c0 < rows.length; c0 += 5) {
      var last = Math.min(c0 + 5, rows.length);
      cols += '<ol class="tp-all-col" aria-label="Matches ' + (c0 + 1) + ' to ' + last + ' of ' + rows.length + '">' + rows.slice(c0, last).join('') + '</ol>';
    }
    document.getElementById('tp-all-scroll').innerHTML = cols;
  }
  // Your matches: the all matches list is closed until Show all matches opens it. Everywhere else it is always there.
  var showAll = false, showAllBtn = document.getElementById('tp-showall');
  function syncAll(v) {
    if (allSec) allSec.hidden = v === 'results' && !showAll;
    showAllBtn.textContent = showAll ? 'Hide all matches' : 'Show all matches';
    showAllBtn.setAttribute('aria-expanded', showAll ? 'true' : 'false');
  }
  showAllBtn.addEventListener('click', function () {
    showAll = !showAll;
    syncAll('results');
    changed(); // after the label is rewritten, which would otherwise wipe the annotation badge
    if (showAll) {
      // glide down to the list so the change is seen, with the title 16px below the top
      var t = document.getElementById('tp-all-title');
      body.scrollTo({ top: Math.max(0, Math.round(t.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16)), behavior: reduce.matches ? 'auto' : 'smooth' });
    }
    say(showAll ? 'All matches shown below your cards.' : 'All matches hidden.');
  });
  function setView(v) {
    if (v === 'results' && state.view !== 'results') showAll = false; // closed each time Your matches opens
    state.view = v; save();
    syncAll(v);
    document.getElementById('tp-pick-title').textContent = v === 'results' ? 'Your matches' : 'Pick your team';
    picker.hidden = v !== 'pick';
    results.hidden = v !== 'results';
    skipped.hidden = v !== 'skipped';
    changed();
  }
  // Where the phone's content must scroll to for the section title to sit 16px below the top bar. Measured against
  // the scrolling body itself (offsetTop would also count the bar above it).
  function resultsTop() {
    var t = document.getElementById('tp-pick-title');
    return Math.max(0, Math.round(t.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16));
  }
  /* The reveal. Pressing See their matches is one sequence, not a swap:
     1. Let go (380ms): the phone glides so Your matches will start where the section title sits now, the cards you did
        not pick drop away and the rest of the picker fades, so the picked cards are left alone in the fan.
     2. Fly and turn (about 800ms): the picked cards leave the fan on an arc that lifts a little at the middle, and turn
        face up on the way, landing in the match deck. The new title and summary arrive just behind them, and the rest
        fades up as they land.
     Reduced motion: no glide, flight or turn; the match cards fade in. Reload (animate false) goes straight there. */
  var busy = false;
  function glideTo(top, ms) {
    var from = body.scrollTop, dist = top - from;
    if (Math.abs(dist) < 4) return;
    var t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // ease in and out
      body.scrollTop = from + dist * e;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function letGo() {
    var DUR = 380, held = [];
    glideTo(resultsTop(), DUR);
    // Cards that were not picked drop away; the picker's other parts fade. The picked cards stay put.
    cards.forEach(function (b, i) {
      if (isPicked(CARDS[i]) || b.style.visibility === 'hidden') return;
      held.push(b.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 32px' }], { duration: 260, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }));
    });
    Array.prototype.forEach.call(picker.children, function (el) {
      if (el.classList.contains('tp-fan-wrap')) return;
      held.push(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' }));
    });
    held.push(document.getElementById('tp-pick-title').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' }));
    return new Promise(function (done) { setTimeout(function () { done(held); }, DUR); });
  }
  // Fade a part of the new screen up from slightly below, after a delay; it is visible before and after
  function arrive(el, delay) {
    if (el && el.animate) el.animate([{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], { duration: 320, delay: delay, easing: EASE, fill: 'backwards' });
  }
  function showResults(animate, held) {
    if (!state.picked.length) return;
    var move = animate && !reduce.matches;
    // Where each picked card sits in the fan now, to fly from
    var from = {};
    if (move) pickedCards().forEach(function (c) {
      var b = cards[CARDS.indexOf(c)], r = b.getBoundingClientRect();
      if (r.width && b.style.visibility !== 'hidden') from[c.name] = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: b.offsetWidth, h: b.offsetHeight, a: angleOf(CARDS.indexOf(c) - offset) };
    });
    buildDeck();
    setView('results');
    // The picker is hidden now: the held animations have nothing left to hold
    (held || []).forEach(function (a) { a.cancel(); });
    deck.scrollLeft = 0;
    // The phone already glided to where Your matches starts (this only tidies a few pixels, or does it all on reload)
    body.scrollTop = resultsTop();
    if (!animate) { Array.prototype.forEach.call(deck.children, function (el) { el.firstElementChild.classList.add('is-flipped'); }); sum.focus({ preventScroll: true }); say(summary()); return; }
    if (reduce.matches) {
      Array.prototype.forEach.call(deck.children, function (el) { el.firstElementChild.classList.add('is-flipped'); });
      results.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
      sum.focus({ preventScroll: true }); say(summary()); return;
    }
    // Snapping would catch a card mid-flight and leave the deck scrolled part way in, so it is off until they land
    deck.classList.add('is-flying');
    var landed = 0, total = deck.children.length, FLY = 780;
    function land() {
      if (++landed < total) return;
      deck.scrollLeft = 0; deck.classList.remove('is-flying'); changed();
    }
    // The new screen's words arrive just behind the cards
    arrive(document.getElementById('tp-pick-title'), 0);
    arrive(sum, 140);
    arrive(results.querySelector('.tp-results-note'), 200);
    arrive(document.getElementById('tp-deck-hint'), FLY - 120);
    arrive(results.querySelector('.tp-results-actions'), FLY - 80);
    Array.prototype.forEach.call(deck.children, function (el, k) {
      var flip = el.firstElementChild, f = from[el.dataset.name], delay = k * 90;
      var r = el.getBoundingClientRect();
      if (f) {
        var dx = f.x - (r.left + r.width / 2), dy = f.y - (r.top + r.height / 2), sx = f.w / r.width, sy = f.h / r.height;
        // An arc: the card lifts and grows a little at the middle of its flight, then settles
        el.animate([
          { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + f.a + 'deg) scale(' + sx + ',' + sy + ')', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.12))' },
          { transform: 'translate(' + (dx * .45) + 'px,' + (dy * .45 - 22) + 'px) rotate(' + (f.a * .4) + 'deg) scale(' + ((sx + 1) / 2 * 1.04) + ',' + ((sy + 1) / 2 * 1.04) + ')', filter: 'drop-shadow(0 18px 18px rgba(0,0,0,.22))', offset: .45 },
          { transform: 'none', filter: 'drop-shadow(0 0 0 rgba(0,0,0,0))' }
        ], { duration: FLY, delay: delay, easing: 'cubic-bezier(.45, .05, .25, 1)', fill: 'backwards' });
      } else el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: delay, easing: EASE, fill: 'backwards' });
      // The turn runs across the middle of the flight and lands face up
      var a = flip.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(180deg)' }], { duration: FLY - 220, delay: delay + 110, easing: 'cubic-bezier(.45, 0, .2, 1)', fill: 'both' });
      a.onfinish = function () { flip.classList.add('is-flipped'); a.cancel(); land(); };
    });
    sum.focus({ preventScroll: true });
    say(summary());
  }
  showBtn.addEventListener('click', function () {
    if (busy) return;
    if (!state.picked.length) { chosenEl.textContent = 'Pick at least one card first, or choose Here for the rugby.'; say(chosenEl.textContent); return; }
    if (reduce.matches) { showResults(true); return; }
    busy = true;
    letGo().then(function (held) { busy = false; showResults(true, held); });
  });
  document.getElementById('tp-change').addEventListener('click', function () {
    function back() {
      setView('pick');
      // The cards go back into the hand: the fan starts stacked and deals open again, picks still lifted
      if (!reduce.matches) { dealt = false; place(false); fan.offsetWidth; requestAnimationFrame(deal); } else place(false);
      cards[Math.round(offset)].focus({ preventScroll: true });
    }
    // The match cards fade and drop away first, so the deck does not vanish in one frame
    if (reduce.matches || !results.animate) { back(); return; }
    results.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(16px)' }], { duration: 200, easing: 'cubic-bezier(.4, 0, 1, 1)' }).onfinish = back;
  });
  // A ticket on a match is one ticket, whichever card it is marked on
  deck.addEventListener('change', function (e) {
    var cb = e.target.closest('input[data-match]'); if (!cb) return;
    var id = cb.dataset.match;
    state.tickets = state.tickets.filter(function (x) { return x !== id; });
    if (cb.checked) state.tickets.push(id);
    save();
    deck.querySelectorAll('input[data-match]').forEach(function (x) {
      if (x.dataset.match !== id) return;
      x.checked = cb.checked;
      x.closest('.tp-m').classList.toggle('has-ticket', cb.checked);
    });
    sum.textContent = summary();
    changed(); // rewriting the summary wipes its annotation badge
    say((cb.checked ? 'Ticket marked. ' : 'Ticket removed. ') + summary());
  });
  document.getElementById('tp-skip').addEventListener('click', function () {
    setView('skipped');
    skipped.querySelector('.tp-skipped-text').focus({ preventScroll: true });
  });
  document.getElementById('tp-unskip').addEventListener('click', function () {
    setView('pick');
    deal();
    cards[Math.round(offset)].focus({ preventScroll: true });
  });

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
  var tlItemEls = {}, tlStay;
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
  // The canvas: an axis with every day of the tournament and one marker button per match, built once
  (function () {
    var h = '<span class="tp-tl-axis" style="left:' + PADX + 'px;width:' + ((DAYS - 1) * DAYW) + 'px"></span>';
    for (var i = 0; i < DAYS; i++) {
      var x = PADX + i * DAYW;
      h += '<span class="tp-tl-tick" style="left:' + x + 'px"></span><span class="tp-tl-day" style="left:' + x + 'px">' + (i < 31 ? i + 1 : i - 30) + '</span>';
      if (i === 0 || i === 31) h += '<span class="tp-tl-month" style="left:' + (x - 6) + 'px">' + (i ? 'November' : 'October') + '</span>';
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
  function tlShown(f) {
    if (isPicked(RUGBY)) return !f.a; // every NSW match, knockouts included
    var t = tlTeams();
    if (!t.length) return true;
    return !!f.t && f.t.split(' v ').some(function (n) { return t.indexOf(n) > -1; });
  }
  function shortDate(d) { var p = d.split(' '); return p[1] + ' ' + p[2]; }
  function tlRange(a, b) {
    if (a === b) return shortDate(a);
    var pa = a.split(' '), pb = b.split(' ');
    return pa[2] === pb[2] ? pa[1] + ' to ' + pb[1] + ' ' + pb[2] : shortDate(a) + ' to ' + shortDate(b);
  }
  function tlName(m) { return m.f.t ? m.f.t : m.f.s + ', teams to be decided'; }
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
        m.sym.innerHTML = tk ? TL_ICON.ticket : m.f.t ? TL_ICON.ball : '';
        m.el.setAttribute('aria-label', m.f.d + ', ' + tlName(m) + ', ' + (m.f.a ? 'interstate, ' + m.f.a : m.f.p) + (tk ? ', you have a ticket' : ''));
      }
    });
    // Added items sit on their day above that day's matches (a screening next to its match), square markers
    var itemDays = {}, keep = {};
    state.added.forEach(function (it) {
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
    var trip = state.trip, stay = trip && trip.mode === 'visiting' && trip.from && trip.to;
    tlStay.hidden = !stay;
    if (stay) {
      var a = isoDay(trip.from), z = isoDay(trip.to);
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
    tlValue.textContent = shown.length + (shown.length === 1 ? ' match' : ' matches') + (shown.length ? ' · ' + tlRange(shown[0].f.d, shown[shown.length - 1].f.d) : '');
    if (String(added || '') !== tlBadge.textContent) {
      tlBadge.hidden = !added;
      tlBadge.textContent = added || '';
      // The count changing is worth seeing: the badge pops again
      if (added) { tlBadge.style.animation = 'none'; tlBadge.offsetWidth; tlBadge.style.animation = ''; }
    }
    tlPrompt.hidden = !none;
    // The trip answer, editable here (never asked twice)
    tlTrip.innerHTML = tripLine();
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
          '<p class="tp-tl-d-teams">' + esc(it.title) + '</p><p class="tp-tl-d-stage">' + esc(it.kindLabel || '') + '</p>' +
          (it.place ? '<p class="tp-tl-d-where">' + esc(it.place) + '</p>' : '') + (it.note ? '<p class="tp-tl-d-where">' + esc(it.note) + '</p>' : '') +
          '<p class="tp-tl-d-gap provenance-gap">Placeholder: not real data yet.</p>' +
          '<button type="button" class="tp-link tp-tl-remove" data-remove="' + esc(it.id) + '">Remove from timeline</button>';
        return;
      }
      tlSelItem = null;
    }
    if (tlSel < 0) { tlDetail.innerHTML = '<p class="tp-tl-hint">Tap a match or something you added to see its details.</p>'; return; }
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
    if (state.view === 'results') return deck;
    return allSec && !allSec.hidden ? document.getElementById('tp-all-scroll') : null;
  }
  function syncBar() {
    var ref = tlRef(), r = ref && ref.getBoundingClientRect(), box = body.getBoundingClientRect();
    // The cards' top has passed the top of the phone; or, where the page is too short for that, the cards are in view and
    // the page is scrolled to its end (otherwise the bar could never appear under a short list)
    var atEnd = body.scrollTop + body.clientHeight >= body.scrollHeight - 2;
    var seen = !!(r && r.height > 0 && (r.top < box.top || (atEnd && r.top < box.bottom && r.bottom > box.top)));
    var on = tlOpen || seen;
    if (on === tlOn) return;
    tlOn = on;
    tl.classList.toggle('is-on', on);
    tl.inert = !on;
    notesOnly();
  }
  var barRaf = 0;
  body.addEventListener('scroll', function () { if (!barRaf) barRaf = requestAnimationFrame(function () { barRaf = 0; syncBar(); }); }, { passive: true });
  window.addEventListener('resize', syncBar);
  function tlSetOpen(open, focusBack) {
    if (open === tlOpen) return;
    tlOpen = open;
    tl.classList.toggle('is-open', open);
    tlToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    tlPanel.inert = !open;
    body.inert = open; // the screen behind waits under the scrim while the timeline is open
    tlScrim.classList.toggle('is-on', open);
    if (open) {
      tlFit();
      // Start the axis at the chosen match, or the first one shown
      var start = tlSelEl() || tlOrder()[0];
      if (start) tlScroll.scrollLeft = Math.max(0, start.offsetLeft - 48);
      tlPanel.scrollTop = 0;
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
    if (state.view === 'skipped') document.getElementById('tp-unskip').click();
    deal();
    body.scrollTo({ top: resultsTop(), behavior: reduce.matches ? 'auto' : 'smooth' });
    cards[Math.round(offset)].focus({ preventScroll: true });
  });
  /* ---------- Added items and the trip answer: used by the Where to watch, Suits your 3rd half and question sections
     (concepts-third-half.js) through window.tpPicker. Saved on this device with the picks. ---------- */
  function addItem(it) {
    if (state.added.some(function (x) { return x.id === it.id; })) return false;
    state.added.push(it); save(); changed(); return true;
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
  function tripLine() {
    var t = state.trip;
    if (!t) return '<span>Visiting or local? One tap sharpens the suggestions.</span> <button type="button" class="tp-link" data-ask>Answer</button>';
    var what = t.mode === 'local' ? 'I’m local' : t.mode === 'unsure' ? 'Not sure yet' : t.from && t.to ? 'In NSW ' + isoRange(t.from, t.to) : 'Visiting NSW, dates not set';
    return '<span>' + esc(what) + '</span> · <button type="button" class="tp-link" data-ask>Change</button>';
  }
  tlReady = true;
  tlUpdate();

  renderChosen();
  if (state.view === 'results') { dealt = true; place(false); showResults(false); } else setView(state.view);
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
    deck.innerHTML = ''; deck.classList.remove('is-flying');
    offset = 3; dealt = false;
    setView('pick');
    renderChosen();
    place(false);
    body.scrollTop = 0;
    tlSetOpen(false, false); tlSel = -1; tlSelItem = null; state.added = []; state.trip = null; save(); changed();
    watchDeal();
    say('Prototype reset. No teams picked.');
  });

  window.tpPicker = { teams: TEAMS, state: state, userMatches: userMatches, addItem: addItem, removeItem: removeItem, setTrip: setTrip,
    flyToBar: flyToBar, say: say, side: side, esc: esc, list: list, isoRange: isoRange, isoDay: isoDay, dayOf: dayOf, reduce: reduce, body: body,
    rugby: function () { return isPicked(RUGBY); }, picked: function () { return state.picked.length > 0; } };
  // The sections below the match cards read the picks once this is ready
  phoneEl.dispatchEvent(new CustomEvent('tp:ready'));
})();
