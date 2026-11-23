/* Option C (?flow=c, 23 Nov): the questions up front, one step at a time, a test from team feedback.
   The Plan tab asks four things in turn before it shows the planner: your teams, the tickets you already have, your
   days in NSW and where you're staying. Who's coming is left out until it changes anything (the user's call). Every
   step can be skipped, and Skip to your plan finishes the flow from any step with whatever has been answered.
   Each step borrows the planner's own controls, so an answer is the same answer as in Options A and B:
     1 Teams: the hand of cards with Find your team and Clear all (#tp-util, #tp-picker), Every NSW match included.
     2 Tickets: your teams' NSW matches as a list built here; No tickets yet replaces any marked, and marking one
       replaces it (check 2); Clear all shows once one is marked (check 3).
     3 Your days: the page's slider and Type your dates (#tp-ask), starting from your first to last NSW match.
     4 Where you're staying: the quick answers and the NSW place search from Refine your plan (#tp-ask).
   The plan bar stays in view the whole time and fills as answers come in, but does not open until the flow is
   finished (the user's call). Once finished, the planner is Option A's, under a Your answers block; each answer's
   Change opens its step again in place, and Done comes back to the answer.
   The flow's own place (step, No tickets yet, whether the days were started for them) is kept in this browser with
   Option C's other saves (flow-c:, the storage script in the page's <head>). Reset prototype starts it again. */
(function () {
  'use strict';
  if (document.documentElement.getAttribute('data-flow') !== 'c') return;
  var tp = window.tpPicker; if (!tp) return;
  var phone = document.getElementById('tp-phone'), body = tp.body, state = tp.state, esc = tp.esc;
  var pick = document.getElementById('tp-pick'), ask = document.getElementById('tp-ask');
  if (!phone || !pick || !ask) return;

  var STEPS = ['teams', 'tickets', 'days', 'stay'];
  var NAME = { teams: 'Your teams', tickets: 'Tickets', days: 'Your days', stay: 'Where you’re staying' };
  var NEXT = { teams: 'Next: tickets', tickets: 'Next: your days', days: 'Next: your stay', stay: 'See your plan' };
  var KEY = 'tp-fc-v1';
  var fc = { step: 'teams', none: false, filled: false };
  try { if (/[?&]reset\b/.test(location.search)) localStorage.removeItem(KEY); } catch (e) {} // ?reset starts the flow again too
  try { var rec = JSON.parse(localStorage.getItem(KEY) || 'null'); if (rec && (STEPS.indexOf(rec.step) > -1 || rec.step === 'done')) fc = { step: rec.step, none: !!rec.none, filled: !!rec.filled, pre: rec.pre || null }; } catch (e) {}
  var edit = ''; // was a step reopened from Your answers; no longer set since the answers became a card (24 Nov)
  function keep() { try { localStorage.setItem(KEY, JSON.stringify(fc)); } catch (e) {} }
  // The step showing, or '' once the flow is finished and nothing is reopened
  function step() { return edit || (fc.step === 'done' ? '' : fc.step); }
  window.tpFlowC = {
    step: step,
    inCard: function () { return !step(); }, // finished: Your days and Where you're staying sit in the card
    // Home's Plan around your matches: the step showing, or the card opened once the questions are done
    focusStep: function () { requestAnimationFrame(function () { if (!step() && !cardOpen) setCard(true, false); toTop(); focusHead(); }); }
  };

  var reduce = tp.reduce;
  var TICK = '<svg class="tp-fc-tick" width="14" height="12" viewBox="0 0 12 10" aria-hidden="true" focusable="false"><path d="M1 5l3.5 3.5L11 1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var ARR = '<svg class="tp-home-arr" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  var BACK = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M13 8H3M7 4L3 8l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- What has been answered ---------- */
  function city(f) { return (window.cnVenueCity || {})[f.v] || f.p; }
  // The matches a ticket can be marked on: your teams' NSW matches whose teams are known (as the match cards' I have
  // tickets), by date
  // Every match of your teams whose teams are known: NSW first, then interstate (24 Nov; NSW only before, which left
  // teams that play all their pool matches interstate with nothing to mark). The plan and each match's sheet already
  // take an interstate ticket. Knockouts are left out: with no teams yet, a ticket for one cannot be recorded
  function tixMatches() {
    if (!tp.own()) return [];
    var ms = tp.userMatches().filter(function (m) { return m.tkey; });
    return ms.filter(function (m) { return !m.f.a; }).concat(ms.filter(function (m) { return m.f.a; }));
  }
  function myTickets() { return tixMatches().filter(function (m) { return state.tickets.indexOf(m.tkey) > -1; }); }
  function baseLabel(b) { return b === 'outside' ? 'Outside NSW' : b; }
  function teamsText() { return state.picked.length ? tp.list(state.picked.slice()) : 'None picked'; }
  function ticketsText() { var n = myTickets().length; return n ? n + (n === 1 ? ' match' : ' matches') : fc.none ? 'None yet' : 'Not answered'; }
  function daysText() { var t = state.trip; return t && t.from && t.to ? tp.isoRange(t.from, t.to) : 'Not set'; }
  function stayText() { var t = state.trip; return t && t.base ? baseLabel(t.base) : 'Not set'; }
  /* ---------- The step's head and foot, around the borrowed controls ---------- */
  var head = document.createElement('section');
  head.className = 'tp-fc'; head.id = 'tp-fc';
  head.setAttribute('aria-labelledby', 'tp-fc-h');
  pick.insertBefore(head, pick.firstChild);
  /* Once the questions are done (24 Nov), Your answers is one condensed card: the teams, then tickets, days and where
     you're staying in a line. Change opens it, and inside are all the answers' own controls: the hand of cards (with
     Find and Every NSW match), the tickets list, Your days and Where you're staying. They are the same controls the
     steps borrow, moved into the card's body by id; Home and the Add team sheet still borrow the hand from wherever it
     is, and put it back there. Done (at the top or the foot of the card) closes it. Closed again on every visit. */
  var headTop = document.createElement('div'); headTop.className = 'tp-fc-head';
  var cardBody = document.createElement('div'); cardBody.className = 'tp-fc-body'; cardBody.id = 'tp-fc-body';
  cardBody.setAttribute('role', 'region'); cardBody.setAttribute('aria-label', 'Your answers');
  cardBody.innerHTML = '<h4 class="tp-fc-bh">Your teams</h4><div class="tp-fc-slot" id="tp-fc-slot-teams"></div>' +
    '<h4 class="tp-fc-bh">Tickets</h4><div class="tp-fc-slot" id="tp-fc-slot-tix"></div>' +
    '<div class="tp-fc-slot" id="tp-fc-slot-ask"></div>' +
    '<p class="tp-fc-bdone"><button type="button" class="tp-home-cta tp-home-cta--line" data-fc-card="close">Done</button></p>';
  head.appendChild(headTop); head.appendChild(cardBody);
  var slotTeams = cardBody.querySelector('#tp-fc-slot-teams'), slotTix = cardBody.querySelector('#tp-fc-slot-tix'), slotAsk = cardBody.querySelector('#tp-fc-slot-ask');
  var cardOpen = false;
  // The planner's own controls the card holds, in order. The hand's place marker (a comment the tab script leaves so
  // the hand comes back from Home) moves with it, so Home returns the hand to the card
  function pickMark() {
    var w = document.createTreeWalker(document.getElementById('tp-phone'), NodeFilter.SHOW_COMMENT);
    while (w.nextNode()) if (/hand of cards lives here/.test(w.currentNode.nodeValue)) return w.currentNode;
    return null;
  }
  function borrowed(id) {
    var el = document.getElementById(id);
    // Lent elsewhere right now (Home, the Add team sheet): left where it is; it comes back to its marker or placeholder
    return el && !el.closest('#tp-home, #tp-at') ? el : null;
  }
  function place() {
    var inCard = !step(), mark = pickMark(), tabs = document.getElementById('tp-tabs');
    var teamBits = [borrowed('tp-util'), mark, borrowed('tp-picker'), borrowed('tp-fc-rugby')];
    var ask = borrowed('tp-ask');
    if (inCard) {
      teamBits.forEach(function (el) { if (el && el.parentNode !== slotTeams) slotTeams.appendChild(el); });
      if (ask && ask.parentNode !== slotAsk) slotAsk.appendChild(ask);
    } else {
      teamBits.concat([ask]).forEach(function (el) { if (el && el.parentNode !== pick) pick.insertBefore(el, tabs); });
    }
  }
  // The foot floats at the bottom of the screen, out of the scrolling page (24 Nov): it sits just before the plan bar,
  // so when the bar rises into view the foot rises with it, on the same curve (shared.css, "Option C")
  var foot = document.createElement('div');
  foot.className = 'tp-fc-foot'; foot.id = 'tp-fc-foot';
  foot.setAttribute('role', 'group'); foot.setAttribute('aria-label', 'Steps');
  var tlEl = document.getElementById('tp-tl');
  phone.insertBefore(foot, document.getElementById('tp-tl-scrim') || tlEl);
  // The page keeps room under the step for the floating foot
  function footRoom() { if (foot.offsetHeight) phone.style.setProperty('--fc-foot-h', foot.offsetHeight + 'px'); }
  if (window.ResizeObserver) new ResizeObserver(footRoom).observe(foot);

  function stepNote(s) {
    if (s === 'teams') return 'Pick one or more teams. No team? Add every NSW match under the cards.';
    if (s === 'tickets') {
      if (!tp.own()) return 'Pick a team first, and its matches show here.';
      return tixMatches().length ? 'Mark the matches you already have tickets for.' : 'There are no matches to mark yet: their teams are still to be decided.';
    }
    if (s === 'days') {
      var t = state.trip;
      if (t && t.from && fc.filled) return 'We’ve started with your first to last match in NSW. Drag either end to change it.';
      return tp.own() ? 'Drag either end to set them, or skip if you don’t know yet.' : 'Set your days to see ideas for your time in NSW.';
    }
    return 'Ideas near you come first. Skip if you’re not sure yet.';
  }
  function stepTitle(s) {
    return { teams: 'Which teams are you following?', tickets: 'Do you have tickets yet?', days: 'When are you in NSW?', stay: 'Where are you staying?' }[s];
  }
  function ticketsHtml() {
    var ms = tixMatches(); if (!ms.length) return '';
    var on = myTickets().length;
    return '<div class="tp-fc-tix" role="group" aria-label="Tickets you have">' +
      '<button type="button" class="tp-fc-opt tp-fc-none" data-fc-none aria-pressed="' + (fc.none && !on) + '">' + TICK + '<span class="tp-fc-opt-t">No tickets yet</span></button>' +
      ms.map(function (m, i) {
        var has = state.tickets.indexOf(m.tkey) > -1;
        // A heading where the list turns from NSW to interstate matches (or leads it, when every match is interstate)
        var sub = m.f.a && (i === 0 || !ms[i - 1].f.a) ? '<p class="tp-fc-sub">' + (i === 0 ? 'Your teams’ matches, all interstate' : 'Interstate') + '</p>' : '';
        return sub + '<button type="button" class="tp-fc-opt" data-fc-tix="' + esc(m.tkey) + '" aria-pressed="' + has + '">' + TICK +
          '<span class="tp-fc-opt-t">' + esc(m.f.t) + '</span><span class="tp-fc-opt-m">' + esc(m.f.d + ' · ' + m.f.k + (m.f.a ? ' Sydney time · ' + m.f.v + ', ' + m.f.a : ' · ' + m.f.v + ', ' + city(m.f))) + '</span></button>';
      }).join('') + '</div>' +
      (on ? '<p class="tp-fc-clear"><button type="button" class="tp-link" data-fc-clear>Clear all</button></p>' : '');
  }
  var CHEV = '<svg class="tp-fc-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // The condensed card: the teams on one line, then tickets, days and where you're staying, each only once answered
  function answersHtml() {
    var n = myTickets().length, t = state.trip || {}, bits = [];
    bits.push(n ? n + (n === 1 ? ' ticket' : ' tickets') : fc.none ? 'No tickets yet' : '');
    bits.push(t.from && t.to ? tp.isoRange(t.from, t.to) : 'No days set');
    if (t.base) bits.push(t.base === 'outside' ? 'From outside NSW' : 'Staying in ' + t.base);
    return '<h3 class="tp-fc-ah"><button type="button" class="tp-fc-cardbtn" id="tp-fc-h" data-fc-card="toggle" aria-expanded="' + cardOpen + '" aria-controls="tp-fc-body">' +
      '<span class="tp-fc-cardt">Your answers</span><span class="tp-fc-cardact">' + (cardOpen ? 'Done' : 'Change') + CHEV + '</span></button></h3>' +
      '<p class="tp-fc-sum1">' + esc(state.picked.length ? tp.list(state.picked.slice()) : 'No team picked') + '</p>' +
      '<p class="tp-fc-sum2">' + esc(bits.filter(Boolean).join(' · ')) + '</p>';
  }
  function tixSlotHtml() {
    return ticketsHtml() || '<p class="tp-fc-note">' + esc(stepNote('tickets')) + '</p>';
  }
  function headHtml(s) {
    if (!s) return answersHtml();
    var i = STEPS.indexOf(s);
    // From step 2, a back arrow beside the count goes back one step (the foot's left button is Skip now, 24 Nov)
    var back = i > 0 ? '<button type="button" class="tp-fc-backbtn" data-fc-go="-1" aria-label="Back to ' + esc(NAME[STEPS[i - 1]].toLowerCase()) + '">' + BACK + '</button>' : '';
    return (edit ? '<p class="tp-fc-count">Change your answer</p>' : '<div class="tp-fc-top">' + back + '<p class="tp-fc-count" id="tp-fc-count">Step ' + (i + 1) + ' of ' + STEPS.length + '<span class="visually-hidden">: ' + NAME[s] + '</span></p></div>' +
      '<ol class="tp-fc-prog" aria-hidden="true">' + STEPS.map(function (x, j) { return '<li class="' + (j < i ? 'is-done' : j === i ? 'is-on' : '') + '"></li>'; }).join('') + '</ol>') +
      '<h3 class="tp-fc-h" id="tp-fc-h" tabindex="-1"' + (edit ? '' : ' aria-describedby="tp-fc-count"') + '>' + stepTitle(s) + '</h3>' +
      '<p class="tp-fc-note">' + esc(edit ? stepNote(s).replace(/,? or skip[^.]*\./, '.').replace(/ Skip[^.]*\./, '') : stepNote(s)) + '</p>' + // no Skip while changing one answer
      (s === 'tickets' ? ticketsHtml() : '');
  }
  function footHtml(s) {
    if (!s) return '';
    if (edit) return '<div class="tp-fc-nav"><button type="button" class="tp-home-cta" data-fc-done>Done</button></div>';
    // Skip on the left moves on to the next screen without this answer; Next on the right (24 Nov). The plan bar under
    // the foot already says what is on the plan, so the foot carries the buttons only
    return '<div class="tp-fc-nav"><button type="button" class="tp-home-cta tp-home-cta--line tp-fc-skipbtn" data-fc-skip>Skip</button>' +
      '<button type="button" class="tp-home-cta tp-fc-next" data-fc-go="1">' + NEXT[s] + ARR + '</button></div>';
  }

  /* ---------- Drawing ---------- */
  // Redrawn whenever the answers change; the control with focus is found again by what it does
  function focusKey(el) {
    if (!el || !el.dataset) return null;
    if (el.dataset.fcTix) return '[data-fc-tix="' + CSS.escape(el.dataset.fcTix) + '"]';
    var ks = ['fcNone', 'fcClear', 'fcDone', 'fcSkip'];
    for (var i = 0; i < ks.length; i++) if (el.dataset[ks[i]] !== undefined) return '[data-' + ks[i].replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }) + ']';
    if (el.dataset.fcGo) return '[data-fc-go="' + el.dataset.fcGo + '"]';
    if (el.dataset.fcCard) return '[data-fc-card="' + el.dataset.fcCard + '"]';
    return null;
  }
  var lastH = '', lastF = '', lastX = '';
  function draw() {
    var s = step(), a = document.activeElement, k = ((headTop.contains(a) || slotTix.contains(a)) || foot.contains(a)) ? focusKey(a) : null;
    if (s) phone.setAttribute('data-fc', s); else phone.removeAttribute('data-fc');
    if (s) phone.removeAttribute('data-fc-card'); else phone.setAttribute('data-fc-card', cardOpen ? 'open' : 'closed');
    place();
    var h = headHtml(s), f = footHtml(s), x = s ? '' : tixSlotHtml();
    if (h !== lastH) { headTop.innerHTML = h; lastH = h; }
    if (x !== lastX) { slotTix.innerHTML = x; lastX = x; }
    if (f !== lastF) { foot.innerHTML = f; lastF = f; }
    if (k) { var el = phone.querySelector(k); if (el && el !== document.activeElement) el.focus({ preventScroll: true }); else if (!el) focusHead(); }
  }
  function focusHead() { var h = document.getElementById('tp-fc-h'); if (h) h.focus({ preventScroll: true }); }
  // A new step starts at its top, just under the floating capsule
  function toTop() {
    var nav = phone.querySelector('.tp-cap-wrap'), room = nav ? nav.offsetHeight + 16 : 16;
    var y = body.scrollTop + head.getBoundingClientRect().top - body.getBoundingClientRect().top - room;
    if (y < body.scrollTop) body.scrollTop = Math.max(0, y);
    else if (head.getBoundingClientRect().top > body.getBoundingClientRect().top + body.clientHeight * .4) body.scrollTop = y;
  }
  // The step's controls glide in from the side they come from (next from the right, back from the left), so the
  // change reads as moving through the steps. Reduced motion swaps in place
  function slideIn(dir) {
    if (reduce.matches || !document.body.animate || !dir) return;
    [head].concat([].slice.call(pick.querySelectorAll(':scope > #tp-util, :scope > #tp-picker, :scope > #tp-ask'))).forEach(function (el) {
      if (!el.getClientRects().length) return;
      el.animate([{ transform: 'translateX(' + (dir > 0 ? 32 : -32) + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: 'cubic-bezier(.25, .1, .25, 1)' });
    });
  }
  // Your days starts from their first to last NSW match, once, the first time the step opens with none set
  function prefillDays() {
    if (fc.filled || (state.trip && state.trip.from)) return;
    var r = tp.inferTrip(); if (!r) return;
    var t = state.trip || {};
    fc.filled = true; fc.pre = r; keep();
    tp.setTrip({ from: r.from, to: r.to, base: t.base, party: t.party });
  }
  function show(dir, focus) {
    var s = step();
    if (s === 'days' && !edit) prefillDays(); // only on the way through: Change never sets days on its own
    draw();
    if (tp.askRender) tp.askRender(); // Your days and Where you're staying draw for the step showing
    if (tp.syncBar) tp.syncBar();
    window.dispatchEvent(new Event('resize')); // the hand lays itself out again once it shows
    phone.dispatchEvent(new CustomEvent('tp:state'));
    if (focus) { toTop(); focusHead(); }
    slideIn(dir);
  }
  function setCard(on, focusBtn) {
    cardOpen = on; draw();
    if (tp.askRender) tp.askRender();
    window.dispatchEvent(new Event('resize')); // the hand measures again, now that it shows
    if (on && !reduce.matches && cardBody.animate) cardBody.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.25, .1, .25, 1)' });
    if (!on) toTop(); // closing from the foot of a long card: the card's top comes back into view
    if (focusBtn) { var b = document.getElementById('tp-fc-h'); if (b) b.focus({ preventScroll: true }); }
    tp.say(on ? 'Your answers, opened.' : 'Your answers, closed.');
  }
  function go(to, dir) {
    if (to === 'done') cardOpen = false;
    fc.step = to; keep(); show(dir, true);
    tp.say(to === 'done' ? 'Your plan, with your answers.' : '');
  }

  /* ---------- Controls ---------- */
  phone.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !(head.contains(b) || foot.contains(b))) return;
    var s = step(), i = STEPS.indexOf(s);
    if (b.dataset.fcGo) { var d = +b.dataset.fcGo, j = i + d; go(j >= STEPS.length ? 'done' : STEPS[Math.max(0, j)], d); return; }
    if (b.dataset.fcSkip !== undefined) {
      // Skipping Your days takes back the days started for them, if they were left as they were: a skip is not a yes
      var t = state.trip, pre = fc.pre;
      if (s === 'days' && t && pre && t.from === pre.from && t.to === pre.to) tp.setTrip({ base: t.base, party: t.party });
      go(i + 1 >= STEPS.length ? 'done' : STEPS[i + 1], 1); return;
    }
    if (b.dataset.fcCard) { setCard(b.dataset.fcCard === 'toggle' ? !cardOpen : false, true); return; }
    if (b.dataset.fcNone !== undefined) {
      // No tickets yet replaces any marked; pressing it again takes the answer back
      var had = myTickets();
      fc.none = !(fc.none && !had.length); keep();
      had.forEach(function (m) { tp.setTicket(m.tkey, false); });
      draw();
      tp.say(fc.none ? 'No tickets yet.' + (had.length ? ' ' + had.length + (had.length === 1 ? ' ticket' : ' tickets') + ' cleared.' : '') : 'Answer cleared.');
      return;
    }
    if (b.dataset.fcTix) {
      var on = state.tickets.indexOf(b.dataset.fcTix) < 0, m = tp.match(b.dataset.fcTix); // a ticket key is its match key
      fc.none = false; keep();
      tp.setTicket(b.dataset.fcTix, on);
      draw();
      tp.say((on ? 'Ticket marked: ' : 'Ticket removed: ') + (m ? m.f.t : '') + '.');
      return;
    }
    if (b.dataset.fcClear !== undefined) {
      var all = myTickets();
      all.forEach(function (m) { tp.setTicket(m.tkey, false); });
      draw();
      tp.say(all.length + (all.length === 1 ? ' ticket' : ' tickets') + ' cleared.');
      var first = head.querySelector('[data-fc-none]'); if (first) first.focus({ preventScroll: true });
    }
  });
  // Escape inside the open card closes it, back to its Change (not while Find is open: Escape closes Find first)
  phone.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !cardOpen || step() || !head.contains(e.target) || e.defaultPrevented || document.querySelector('#tp-fc .tp-find:not([hidden])')) return;
    setCard(false, true);
  });
  phone.addEventListener('tp:state', function () { draw(); });
  var reset = document.getElementById('tp-reset');
  if (reset) reset.addEventListener('click', function () { fc = { step: 'teams', none: false, filled: false }; edit = ''; cardOpen = false; keep(); show(0, false); });
  show(0, false);
})();
