/* Concepts: Pick your team (concepts.html, #pick-your-team).
   A fanned hand of cards: the 24 teams, alphabetical, then "Here for the rugby". Drag or swipe the fan sideways,
   or use the arrow keys; tap or press Space to pick a card (as many as you like). "See their matches" flies the
   picked cards out of the fan and flips them to show their matches.
   Data: window.cnFixtures (concepts-fixtures.js), the 36 pool matches and the knockouts in NSW, kick-offs in Sydney
   time. Nothing else is added: no flags, no community or home-country times, no ticket links.
   Jobs covered (docs/jtbd-itinerary.md): T1 one team, T5 and T7 more than one, T8 and T9 no team, T2 and T12
   tickets, T3 NSW or interstate, T4 knockouts, T6 a shared match noted on both cards, T15 saved on this device,
   T16 skip. The choice is kept in this browser under tp-pick-v1; ?reset clears it. */
(function () {
  'use strict';
  var root = document.getElementById('tp-pick');
  var FIX = window.cnFixtures;
  if (!root || !Array.isArray(FIX)) return;

  var fan = document.getElementById('tp-fan');
  var caption = document.getElementById('tp-fan-caption');
  var chosenEl = document.getElementById('tp-chosen');
  var showBtn = document.getElementById('tp-show');
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
  function place(animate) {
    var mid = Math.round(offset);
    cards.forEach(function (b, i) {
      var rel = i - offset, c = CARDS[i];
      var lift = (isPicked(c) ? LIFT : 0) + (i === mid ? 6 : 0);
      b.style.transition = animate ? '' : 'none';
      b.style.transform = dealt ? 'rotate(' + (rel * STEP).toFixed(2) + 'deg) translateY(' + (-lift) + 'px)' : 'rotate(0deg) translateY(0)';
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
  function settle(to, focus) {
    offset = Math.max(0, Math.min(CARDS.length - 1, Math.round(to)));
    place(true);
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
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); deal(); } }, { root: body, threshold: .4 });
    io.observe(fan);
  } else deal();

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
    var c = CARDS[i], on = !isPicked(c);
    if (on) state.picked.push(c.name); else state.picked = state.picked.filter(function (n) { return n !== c.name; });
    save();
    settle(i, false);
    renderChosen();
    say(c.name + (on ? ' picked. ' : ' removed. ') + chosenText());
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
    showBtn.textContent = !n ? 'See their matches' : n === 1 && state.picked[0] === RUGBY.name ? 'See the NSW matches' : 'See their matches (' + n + ')';
  }
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
      '<ol class="tp-ms">' + ms.map(function (f) { return row(f, c.name, c.rugby); }).join('') + '</ol><p class="tp-ko">' + esc(koNote(c)) + '</p>';
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
    document.getElementById('tp-deck-hint').hidden = cs.length < 2;
    sum.textContent = summary();
  }
  function setView(v) {
    state.view = v; save();
    document.getElementById('tp-pick-title').textContent = v === 'results' ? 'Your matches' : 'Pick your team';
    picker.hidden = v !== 'pick';
    results.hidden = v !== 'results';
    skipped.hidden = v !== 'skipped';
  }
  function showResults(animate) {
    if (!state.picked.length) return;
    // Where each picked card sits in the fan now, to fly from
    var from = {};
    if (animate && !reduce.matches) pickedCards().forEach(function (c) {
      var b = cards[CARDS.indexOf(c)], r = b.getBoundingClientRect();
      if (r.width && b.style.visibility !== 'hidden') from[c.name] = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: b.offsetWidth, h: b.offsetHeight, a: (CARDS.indexOf(c) - offset) * STEP };
    });
    buildDeck();
    setView('results');
    var top = results.offsetTop - 12;
    if (body.scrollTop > top) body.scrollTop = top;
    deck.scrollLeft = 0;
    Array.prototype.forEach.call(deck.children, function (el, k) {
      var flip = el.firstElementChild, f = from[el.dataset.name];
      if (!animate || reduce.matches) { flip.classList.add('is-flipped'); return; }
      var r = el.getBoundingClientRect(), delay = k * 70;
      if (f) {
        var dx = f.x - (r.left + r.width / 2), dy = f.y - (r.top + r.height / 2);
        el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + f.a + 'deg) scale(' + (f.w / r.width) + ',' + (f.h / r.height) + ')' }, { transform: 'none' }], { duration: 560, delay: delay, easing: EASE, fill: 'backwards' });
      } else el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: delay, easing: EASE, fill: 'backwards' });
      // The turn starts as the card leaves the fan and lands face up
      var a = flip.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(180deg)' }], { duration: 620, delay: delay + 80, easing: 'cubic-bezier(.45, 0, .2, 1)', fill: 'both' });
      a.onfinish = function () { flip.classList.add('is-flipped'); a.cancel(); };
    });
    sum.focus({ preventScroll: true });
    say(summary());
  }
  showBtn.addEventListener('click', function () {
    if (!state.picked.length) { chosenEl.textContent = 'Pick at least one card first, or choose Here for the rugby.'; say(chosenEl.textContent); return; }
    showResults(true);
  });
  document.getElementById('tp-change').addEventListener('click', function () {
    setView('pick');
    place(false);
    if (!reduce.matches) picker.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
    cards[Math.round(offset)].focus({ preventScroll: true });
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
  window.tpPicker = { teams: TEAMS, state: state };
})();
