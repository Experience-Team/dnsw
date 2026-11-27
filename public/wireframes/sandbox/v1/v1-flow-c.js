/* Option C (?flow=c, 23 Nov): the questions up front, one step at a time, a test from team feedback.
   The Plan tab asks three things in turn before it shows the plan: your teams, your days in NSW and where you're
   staying (26 Nov 2026: the tickets step is gone; the matches are inferred from the teams and the days, and each can
   be taken off). Who's coming is left out until it changes anything (the user's call). Teams and where you're
   staying are required; your days can be skipped.
   Each step borrows the planner's own controls, so an answer is the same answer as in Options A and B:
     1 Teams: the hand of cards with Find your team and Clear all (#tp-util, #tp-picker). Show every NSW match means
       no team: nothing is inferred, and the NSW matches inside the days are listed to add.
     2 Your days: the range calendar (#tp-ask), starting from a day before your first NSW match to a day after your last.
     3 Where are you staying, or thinking of staying?: the quick answers and the NSW place search (#tp-ask), a place always
       required, with one more place optional (each with Remove).
   The plan bar stays in view the whole time and fills as answers come in, but does not open until the flow is
   finished (the user's call). Once finished, the planner is Option A's, under a Your answers block; each answer's
   Change opens its step again in place, and Done comes back to the answer.
   The flow's own place (step, whether the days were started for them) is kept in this browser with Option C's other
   saves (flow-c:, the storage script in the page's <head>). Reset prototype starts it again. */
(function () {
  'use strict';
  if (document.documentElement.getAttribute('data-flow') !== 'sb') return;
  var tp = window.tpPicker; if (!tp) return;
  var phone = document.getElementById('tp-phone'), body = tp.body, state = tp.state, esc = tp.esc;
  var pick = document.getElementById('tp-pick'), ask = document.getElementById('tp-ask');
  if (!phone || !pick || !ask) return;

  // Three steps since 26 Nov 2026: your teams, your days, where you're staying (the tickets step is gone; where you're
  // staying is required, as the base of the plan)
  var STEPS = ['teams', 'days', 'stay'];
  var NAME = { teams: 'Your teams', days: 'Your days', stay: 'Where you’re staying' };
  var NEXT = { teams: 'Next: your dates', days: 'Next: your stay', stay: 'See your plan' };
  var KEY = 'tp-fc-v1';
  var fc = { step: 'teams', filled: false };
  try { if (/[?&]reset\b/.test(location.search)) localStorage.removeItem(KEY); } catch (e) {} // ?reset starts the flow again too
  try { var rec = JSON.parse(localStorage.getItem(KEY) || 'null');
    // Saved before 26 Nov 2026 (v < 3): a place on the old tickets step moves to the days; the old stay step (gone since
    // 24 Nov) means the flow was finished, the answer kept
    if (rec && (rec.v || 1) < 3) { if (rec.step === 'tickets') rec.step = 'days'; else if (rec.step === 'stay') rec.step = 'done'; }
    if (rec && (STEPS.indexOf(rec.step) > -1 || rec.step === 'done')) fc = { step: rec.step, filled: !!rec.filled, pre: rec.pre || null, v: rec.v || 1 }; } catch (e) {}
  // Step 1 is the one required answer since 24 Nov. A place saved before then that got past it with nothing picked
  // goes back to step 1; saves since carry v: 2 or more, so a card left with no team after the flow stays as it is
  if ((fc.v || 1) < 2 && fc.step !== 'teams' && !state.picked.length) fc.step = 'teams';
  // Where you're staying needs a place (27 Nov 2026): a finished flow saved with none (an old Still deciding, or nothing) goes back to step 3
  if (fc.step === 'done' && !(state.trip && state.trip.from && state.trip.to)) fc.step = 'days'; // Your days is required too (27 Nov 2026)
  else if (fc.step === 'done' && !(state.trip && state.trip.base)) fc.step = 'stay';
  fc.v = 3;
  var edit = ''; // was a step reopened from Your answers; no longer set since the answers became a card (24 Nov)
  function keep() { fc.v = 3; try { localStorage.setItem(KEY, JSON.stringify(fc)); } catch (e) {} }
  // The step showing, or '' once the flow is finished and nothing is reopened
  function step() { return edit || (fc.step === 'done' ? '' : fc.step); }
  window.tpFlowC = {
    step: step,
    ticketsAnswered: function () { return ticketsAnswered(); }, // answered or skipped: nothing prompts for tickets again
    inCard: function () { return !step(); }, // finished: Your days and Where you're staying sit in the card
    inLevel: function () { return cardOpen; }, // the Your answers level is open in the plan: its Save bar says what changed
    // Home's Plan around your matches: the step showing, or, once the questions are done, the plan with the card
    focusStep: function () { requestAnimationFrame(function () { if (step()) { toTop(); focusHead(); } else if (tp.openTimeline) tp.openTimeline('#tp-fc-h'); }); }
  };

  var reduce = tp.reduce;
  var TICK = '<svg class="tp-fc-tick" width="14" height="12" viewBox="0 0 12 10" aria-hidden="true" focusable="false"><path d="M1 5l3.5 3.5L11 1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var ARR = '<svg class="tp-home-arr" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  var BACK = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M13 8H3M7 4L3 8l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- What has been answered ---------- */
  function baseLabel(b) { return b === 'outside' ? 'Outside NSW' : b; }
  function teamsText() { return state.picked.length ? tp.list(state.picked.slice()) : 'None picked'; }
  function daysText() { var t = state.trip; return t && t.from && t.to ? tp.isoRange(t.from, t.to) : 'Not set'; }
  function stayText() { var t = state.trip; return t && t.base ? tp.stayLine(t, true) : 'Not set'; }
  // Where you're staying is answered by a place (or Staying outside NSW); a second place is optional. No place is not an answer (27 Nov 2026)
  function hasBase() { var t = state.trip; return !!(t && t.base); }
  function hasDays() { var t = state.trip; return !!(t && t.from && t.to); }
  /* ---------- The step's head and foot, around the borrowed controls ---------- */
  var head = document.createElement('section');
  head.className = 'tp-fc'; head.id = 'tp-fc';
  head.setAttribute('aria-labelledby', 'tp-fc-h');
  pick.insertBefore(head, pick.firstChild);
  /* Once the questions are done (24 Nov), Your answers is one condensed card: the teams, then days and where
     you're staying in a line. Change opens it, and inside are all the answers' own controls: the hand of cards (with
     Find and Every NSW match), Your days and Where you're staying. They are the same controls the
     steps borrow, moved into the card's body by id; Home and the Add team sheet still borrow the hand from wherever it
     is, and put it back there. Done (at the top or the foot of the card) closes it. Closed again on every visit. */
  var headTop = document.createElement('div'); headTop.className = 'tp-fc-head';
  var cardBody = document.createElement('div'); cardBody.className = 'tp-fc-body'; cardBody.id = 'tp-fc-body';
  cardBody.setAttribute('role', 'region'); cardBody.setAttribute('aria-label', 'Your answers');
  cardBody.innerHTML = '<h4 class="tp-fc-bh">Your teams</h4><div class="tp-fc-slot" id="tp-fc-slot-teams"></div>' +
    '<div class="tp-fc-slot" id="tp-fc-slot-ask"></div>';
  head.appendChild(headTop);
  /* Since 24 Nov the card lives in the open plan (the timeline sheet), at its top under the title, and Change drills
     down inside the plan to a Your answers level (CLAUDE.md check 10): it slides in from the right over the plan's
     content, holding the sheet's height, with a back arrow top left. Back, Escape and the grabber's one step go back;
     the plan's close closes it all. Its changes apply at once, so the first one pins a bar to the level's foot naming
     the latest change, with Save (which closes the plan, as the close does). */
  var tlPanel = document.getElementById('tp-tl-panel');
  var level = document.createElement('div');
  level.className = 'tp-fc-level'; level.id = 'tp-fc-level'; level.hidden = true;
  level.setAttribute('role', 'region'); level.setAttribute('aria-labelledby', 'tp-fc-lh');
  level.innerHTML = '<div class="tp-fc-lhead"><button type="button" class="tp-fc-backbtn tp-fc-lback" data-fc-card="back" aria-label="Back to Your plan">' +
    '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M13 8H3M7 4L3 8l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<h3 class="tp-fc-lh" id="tp-fc-lh" tabindex="-1">Your answers</h3>' +
    '<button type="button" class="cn-close tp-fc-lclose" data-fc-card="close" aria-label="Close your plan"><svg class="cn-x" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>';
  level.appendChild(cardBody);
  var saveBar = document.createElement('div');
  saveBar.className = 'tp-fc-save'; saveBar.hidden = true;
  saveBar.innerHTML = '<p class="tp-fc-save-t" role="status"></p><button type="button" class="tp-home-cta" data-fc-card="save">Save</button>';
  level.appendChild(saveBar);
  if (tlPanel) tlPanel.appendChild(level);
  var slotTeams = cardBody.querySelector('#tp-fc-slot-teams'), slotAsk = cardBody.querySelector('#tp-fc-slot-ask');
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
    // The card: in the open plan once finished (under its title row), at the top of the planner while a step shows
    var tlHead = tlPanel && tlPanel.querySelector('.tp-tl-head');
    if (inCard && tlHead) { if (head.previousElementSibling !== tlHead) tlHead.parentNode.insertBefore(head, tlHead.nextSibling); }
    else if (head.parentNode !== pick || pick.firstChild !== head) pick.insertBefore(head, pick.firstChild);
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
    if (s === 'teams') return 'Pick one or more teams to see their matches.';
    if (s === 'days') {
      var t = state.trip;
      if (tp.rugby()) return 'Tap a first day and a last day, and the NSW matches inside them are listed for you to add.';
      if (t && t.from && fc.filled) return 'We’ve started with a day either side of your first and last match in NSW. Tap a first and a last day to change it.';
      return tp.own() ? 'Tap a first day and a last day. The matches inside them are your plan.' : 'Tap a first day and a last day to see ideas for your time in NSW.';
    }
    return 'Pick the closest place, or search. Thinking of somewhere? That counts. You can add a second place.';
  }
  function stepTitle(s) {
    return { teams: 'Which teams are you following?', days: 'When are you in NSW?', stay: 'Where are you staying, or thinking of staying?' }[s];
  }
  var NEXTI = '<svg class="tp-fc-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M4.5 2.5L8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEV = '<svg class="tp-fc-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // The condensed card: the teams on one line, then days and where you're staying, each only once answered
  function answersHtml() {
    var t = state.trip || {}, bits = [];
    bits.push(t.from && t.to ? tp.isoRange(t.from, t.to) : 'No days set');
    if (t.base) bits.push(tp.stayLine(t, true));
    return '<h3 class="tp-fc-ah"><button type="button" class="tp-fc-cardbtn" id="tp-fc-h" data-fc-card="open">' +
      '<span class="tp-fc-cardt">Your answers</span><span class="tp-fc-cardact">Change' + NEXTI + '</span></button></h3>' +
      '<p class="tp-fc-sum1">' + esc(state.picked.length ? tp.list(state.picked.slice()) : 'No team picked') + '</p>' +
      '<p class="tp-fc-sum2">' + esc(bits.filter(Boolean).join(' · ')) + '</p>';
  }
  function headHtml(s) {
    if (!s) return answersHtml();
    var i = STEPS.indexOf(s);
    // From step 2, a back arrow beside the count goes back one step (the foot's left button is Skip now, 24 Nov)
    var back = i > 0 ? '<button type="button" class="tp-fc-backbtn" data-fc-go="-1" aria-label="Back to ' + esc(NAME[STEPS[i - 1]].toLowerCase()) + '">' + BACK + '</button>' : '';
    return (edit ? '<p class="tp-fc-count">Change your answer</p>' : '<div class="tp-fc-top">' + back + '<p class="tp-fc-count" id="tp-fc-count">Step ' + (i + 1) + ' of ' + STEPS.length + '<span class="visually-hidden">: ' + NAME[s] + '</span></p></div>' +
      '<ol class="tp-fc-prog" aria-hidden="true">' + STEPS.map(function (x, j) { return '<li class="' + (j < i ? 'is-done' : j === i ? 'is-on' : '') + '"></li>'; }).join('') + '</ol>') +
      '<h3 class="tp-fc-h" id="tp-fc-h" tabindex="-1"' + (edit ? '' : ' aria-describedby="tp-fc-count"') + '>' + stepTitle(s) + '</h3>' +
      '<p class="tp-fc-note">' + esc(stepNote(s)) + '</p>';
  }
  function footHtml(s) {
    if (!s) return '';
    if (edit) return '<div class="tp-fc-nav"><button type="button" class="tp-home-cta" data-fc-done>Done</button></div>';
    // Skip on the left moves on to the next screen without this answer; Next on the right (24 Nov). The plan bar under
    // the foot already says what is on the plan, so the foot carries the buttons only.
    // Step 1 is required (24 Nov): until a team or Every NSW match is picked, Next is unavailable (aria-disabled, so it
    // stays in place and in the Tab order) with a line saying why, and the left button is Show every NSW match.
    // Step 3, where you're staying, is required too (26 Nov 2026): Next, See your plan, is unavailable until a place is
    // chosen, and there is no Skip
    // Your days is required too (27 Nov 2026): a day before the first NSW match to a day after the last is the starting answer, and where there is
    // nothing to start from (Show every NSW match, a team with no NSW match) a first and a last day are tapped before
    // Next turns on. No Skip on days or on the stay step.
    var need = s === 'teams' ? !state.picked.length : s === 'days' ? !hasDays() : s === 'stay' ? !hasBase() : false;
    var why = s === 'stay' ? 'Choose where you’re staying, or thinking of staying.' : s === 'days' ? 'Tap a first day and a last day to carry on.' : 'Pick a team to carry on, or show every NSW match.';
    var left = s === 'stay' || s === 'days' ? '' : need ? '<button type="button" class="tp-home-cta tp-home-cta--line tp-fc-skipbtn tp-fc-allbtn" data-fc-all>Show every NSW match</button>'
      : '<button type="button" class="tp-home-cta tp-home-cta--line tp-fc-skipbtn" data-fc-skip>Skip</button>';
    return (need ? '<p class="tp-fc-why" id="tp-fc-why">' + why + '</p>' : '') +
      '<div class="tp-fc-nav' + (s === 'stay' || s === 'days' ? ' tp-fc-nav--one' : '') + '">' + left +
      '<button type="button" class="tp-home-cta tp-fc-next" data-fc-go="1"' + (need ? ' aria-disabled="true" aria-describedby="tp-fc-why"' : '') + '>' + NEXT[s] + ARR + '</button></div>';
  }

  /* ---------- Drawing ---------- */
  // Redrawn whenever the answers change; the control with focus is found again by what it does
  function focusKey(el) {
    if (!el || !el.dataset) return null;
    var ks = ['fcDone', 'fcSkip', 'fcAll'];
    for (var i = 0; i < ks.length; i++) if (el.dataset[ks[i]] !== undefined) return '[data-' + ks[i].replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }) + ']';
    if (el.dataset.fcGo) return '[data-fc-go="' + el.dataset.fcGo + '"]';
    if (el.dataset.fcCard) return '[data-fc-card="' + el.dataset.fcCard + '"]';
    return null;
  }
  var lastH = '', lastF = '';
  function draw() {
    var s = step(), a = document.activeElement, k = (headTop.contains(a) || foot.contains(a) || saveBar.contains(a)) ? focusKey(a) : null;
    if (s) phone.setAttribute('data-fc', s); else phone.removeAttribute('data-fc');
    if (s) phone.removeAttribute('data-fc-card'); else phone.setAttribute('data-fc-card', cardOpen ? 'open' : 'closed');
    place();
    var h = headHtml(s), f = footHtml(s);
    if (h !== lastH) { headTop.innerHTML = h; lastH = h; }
    if (f !== lastF) { foot.innerHTML = f; lastF = f; }
    if (k) { var el = phone.querySelector(k); if (el && el !== document.activeElement) el.focus({ preventScroll: true }); else if (!el) focusHead(); }
  }
  function focusHead() { var h = document.getElementById('tp-fc-h'); if (h) h.focus({ preventScroll: true }); }
  function toTopOf(el) {
    var nav = phone.querySelector('.tp-cap-wrap'), room = nav ? nav.offsetHeight + 16 : 16;
    body.scrollTop = Math.max(0, body.scrollTop + el.getBoundingClientRect().top - body.getBoundingClientRect().top - room);
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
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
  // Your days starts from a day before their first NSW match to a day after their last, once, the first time the step opens with none set
  function prefillDays() {
    if (fc.filled || (state.trip && state.trip.from) || tp.rugby()) return; // no team: nothing is inferred
    var r = tp.inferTrip(); if (!r) return;
    // One day either side of the first and last NSW match (27 Nov 2026), inside the days the calendar can pick (29 Sep to 15 Nov)
    function shift(iso, n) { var d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
    r = { from: shift(r.from, -1) < '2027-09-29' ? '2027-09-29' : shift(r.from, -1), to: shift(r.to, 1) > '2027-11-15' ? '2027-11-15' : shift(r.to, 1) };
    var t = state.trip || {};
    fc.filled = true; fc.pre = r; keep();
    tp.setTrip({ from: r.from, to: r.to, base: t.base, base2: t.base2, party: t.party });
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
  // What the answers are now, to name the latest change on the Save bar
  function snap() { var t = state.trip || {}; return { picked: state.picked.slice(), from: t.from || '', to: t.to || '', base: t.base || '', base2: t.base2 || '' }; }
  var lastSnap = null;
  function changeLine(a, b) {
    var added = b.picked.filter(function (n) { return a.picked.indexOf(n) < 0; }), gone = a.picked.filter(function (n) { return b.picked.indexOf(n) < 0; });
    if (added.length) return added[added.length - 1] + ' added to your teams';
    if (gone.length) return gone[gone.length - 1] + ' removed from your teams';
    if (b.from !== a.from || b.to !== a.to) return b.from && b.to ? 'Your days are now ' + tp.isoRange(b.from, b.to) : 'Your days are cleared';
    if (b.base !== a.base || b.base2 !== a.base2) return b.base ? tp.stayLine({ base: b.base, base2: b.base2 || undefined }) : 'Where you’re staying is cleared';
    return '';
  }
  function followChange() {
    if (!cardOpen) return;
    var now = snap(), line = lastSnap ? changeLine(lastSnap, now) : '';
    lastSnap = now;
    if (!line) return;
    saveBar.querySelector('.tp-fc-save-t').textContent = line;
    if (saveBar.hidden) {
      saveBar.hidden = false;
      if (!reduce.matches && saveBar.animate) saveBar.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.25, .1, .25, 1)' });
    }
  }
  function openLevel() {
    if (cardOpen || !tlPanel) return;
    cardOpen = true; lastSnap = snap(); saveBar.hidden = true;
    draw();
    if (tp.askRender) tp.askRender();
    // Over the plan's content where the plan is scrolled to, filling the sheet's height (check 10: it never resizes)
    level.style.top = tlPanel.scrollTop + 'px'; level.style.height = tlPanel.clientHeight + 'px';
    tlPanel.classList.add('is-drilled'); level.hidden = false; level.scrollTop = 0;
    window.dispatchEvent(new Event('resize')); // the hand measures again, now that it shows
    if (!reduce.matches && level.animate) level.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.25, .1, .25, 1)' });
    document.getElementById('tp-fc-lh').focus({ preventScroll: true });
    tp.say('Your answers, details opened.');
  }
  function closeLevel(focusBack, instant) {
    if (!cardOpen) return;
    cardOpen = false;
    function done() { level.hidden = true; tlPanel.classList.remove('is-drilled'); level.style.top = ''; level.style.height = ''; }
    if (!instant && !reduce.matches && level.animate) level.animate([{ transform: 'none' }, { transform: 'translateX(100%)' }], { duration: 260, easing: 'cubic-bezier(.4, 0, .6, 1)' }).onfinish = done;
    else done();
    draw();
    if (focusBack) { var b = document.getElementById('tp-fc-h'); if (b) b.focus({ preventScroll: true }); tp.say('Back to Your plan.'); }
  }
  function go(to, dir) {
    if (to === 'done') closeLevel(false, true);
    if (fc.step === 'tickets' && to !== 'tickets' && dir > 0) fc.tix = true; // Next or Skip on Tickets: it has been answered or left
    fc.step = to; keep(); show(dir, to !== 'done');
    // Finished: the card goes into the plan, so the page starts with Your matches
    // Finished: See your plan lands at the top of the plan page, the opening sentences (27 Nov 2026)
    if (to === 'done') { var nar = document.getElementById('v1-nar'), y = document.getElementById('tp-yours-title'), r = document.getElementById('tp-results'); toTopOf(nar && nar.offsetParent !== null ? nar : y && !r.hidden ? y : pick); }
    tp.say(to === 'done' ? 'Your plan, with your answers.' : '');
  }

  /* ---------- Controls ---------- */
  phone.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !(head.contains(b) || foot.contains(b) || level.contains(b))) return;
    var s = step(), i = STEPS.indexOf(s);
    // Next on step 1 with nothing picked: it says why (the line is also its description) and stays where it is
    if (b.getAttribute('aria-disabled') === 'true') { tp.say(s === 'stay' ? 'Choose where you’re staying, or thinking of staying.' : s === 'days' ? 'Tap a first day and a last day to carry on.' : 'Pick a team to carry on, or show every NSW match.'); return; }
    if (b.dataset.fcAll !== undefined) { tp.addRugby(b); go('days', 1); return; }
    if (b.dataset.fcGo) { var d = +b.dataset.fcGo, j = i + d; go(j >= STEPS.length ? 'done' : STEPS[Math.max(0, j)], d); return; }
    if (b.dataset.fcSkip !== undefined) {
      // Skipping Your days takes back the days started for them, if they were left as they were: a skip is not a yes
      var t = state.trip, pre = fc.pre;
      if (s === 'days' && t && pre && t.from === pre.from && t.to === pre.to) tp.setTrip({ base: t.base, base2: t.base2, party: t.party });
      go(i + 1 >= STEPS.length ? 'done' : STEPS[i + 1], 1); return;
    }
    if (b.dataset.fcCard === 'open') { openLevel(); return; }
    if (b.dataset.fcCard === 'back') { closeLevel(true); return; }
    if (b.dataset.fcCard === 'close') { closeLevel(false, true); if (tp.closeTimeline) tp.closeTimeline(); return; } // the cross closes the plan, the level with it
    if (b.dataset.fcCard === 'save') { closeLevel(false, true); if (tp.closeTimeline) tp.closeTimeline(); return; } // Save is the plan's close
  });
  // Escape on the Your answers level goes back one step, to the plan, before the plan's own Escape closes it (not while
  // a sheet is stacked over the plan, or Find is open: those close first)
  if (tlEl) tlEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !cardOpen || (tp.stackOn && tp.stackOn()) || document.querySelector('#tp-fc-level .tp-find:not([hidden])')) return;
    e.preventDefault(); e.stopPropagation(); closeLevel(true);
  }, true);
  // A tap on the plan's grabber bar goes back one step too (check 10), rather than closing the plan from the level
  var tlToggle = document.getElementById('tp-tl-toggle');
  if (tlToggle) tlToggle.addEventListener('click', function (e) {
    if (!cardOpen || (tp.stackOn && tp.stackOn())) return;
    e.preventDefault(); e.stopImmediatePropagation(); closeLevel(true);
  }, true);
  // The plan closing (its close, Save, a tap outside) closes the level with it, so the plan opens on itself next time
  phone.addEventListener('tp:tlclose', function () { closeLevel(false, true); });
  phone.addEventListener('tp:state', function () { draw(); followChange(); });
  var reset = document.getElementById('tp-reset');
  if (reset) reset.addEventListener('click', function () { fc = { step: 'teams', filled: false, v: 3 }; edit = ''; closeLevel(false, true); keep(); show(0, false); });
  show(0, false);
})();
