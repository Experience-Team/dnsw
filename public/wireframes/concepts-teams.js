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
  var state = { picked: [], tickets: [], view: 'pick' };
  try {
    if (/[?&]reset\b/.test(location.search)) localStorage.removeItem(KEY);
    var rec = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (rec && Array.isArray(rec.picked)) {
      state.picked = rec.picked.filter(function (n) { return n === RUGBY.name || TEAMS[n]; });
      state.tickets = Array.isArray(rec.tickets) ? rec.tickets.filter(function (x) { return typeof x === 'string'; }) : [];
      if (rec.view === 'skipped' || (rec.view === 'results' && state.picked.length)) state.view = rec.view;
    }
  } catch (e) { /* storage blocked: the picker still works, it just is not kept */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  // Tells the annotation layer (prototype-pick-your-team.html) that what is on screen has changed
  function changed() { document.getElementById('tp-phone').dispatchEvent(new CustomEvent('tp:state')); }
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
    syncNudge();
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
  // Pick a team prompt: slides in once the person has scrolled past the cards without a team (never on Your matches or after Skip)
  var nudge = document.getElementById('tp-nudge'), nudgeOn = false, nudgeRaf = 0;
  function syncNudge() {
    // Only on the picker: someone who chose Skip this step has made their choice and is not nagged
    var cardsBox = root.querySelector('.tp-fan-wrap').getBoundingClientRect();
    var past = state.view === 'pick' && state.picked.length === 0 && cardsBox.height > 0 && cardsBox.bottom < body.getBoundingClientRect().top;
    if (past === nudgeOn) return;
    nudgeOn = past;
    nudge.classList.toggle('is-on', past);
    changed(); // the annotation for it follows
  }
  body.addEventListener('scroll', function () { if (!nudgeRaf) nudgeRaf = requestAnimationFrame(function () { nudgeRaf = 0; syncNudge(); }); }, { passive: true });
  window.addEventListener('resize', syncNudge);
  document.getElementById('tp-nudge-btn').addEventListener('click', function () {
    deal();
    body.scrollTo({ top: resultsTop(), behavior: reduce.matches ? 'auto' : 'smooth' }); // the title 16px below the top
    cards[Math.round(offset)].focus({ preventScroll: true });
  });
  function setView(v) {
    if (v === 'results' && state.view !== 'results') showAll = false; // closed each time Your matches opens
    state.view = v; save();
    syncAll(v);
    syncNudge();
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

  renderChosen();
  if (state.view === 'results') { dealt = true; place(false); showResults(false); } else setView(state.view);
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
    watchDeal();
    say('Prototype reset. No teams picked.');
  });

  window.tpPicker = { teams: TEAMS, state: state };
})();
