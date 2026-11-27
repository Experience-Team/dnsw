/* Sandbox: Drop goal, brought over from Version 2 (27 Nov 2026). The game is the sandbox's own copy (drop-goal-v2/, in
   a frame); this file is Version 2's sb-view.js (the Play part and Home's how-to-play) and v2-onboard.js (the team
   screen), with the sandbox's names (sb-, sbPlay) and its planner in place of Version 2's saved list.
   - Play now, the picture and the Play tab open the game over the whole screen; the tab does not change the page.
     Back (top left), Escape and the phone's back button close it, and focus goes back to what opened it.
   - A team is needed first (CLAUDE.md, experience principle 2's exception): with none picked, the team screen comes
     first; one tap picks the kicker. The practice kick shows the first time, and from the ? at the top right.
   - Add on a result card or in the places goes into the planner's saved state through tpPicker (kind kick: Saved,
     not placed yet). "[n] added · Your plan" closes the game and shows the Plan tab.
   - Or see all the places opens the game's list without the pitch. */
/* The team screen (Version 2's v2-onboard.js). The hand of cards is lent from wherever it is (Home or the planner) and
   put back there. */
(function () {
  'use strict';
  var ob = document.getElementById('sb-ob'), phone = document.getElementById('tp-phone');
  if (!ob || !phone) return;
  var tp = window.tpPicker;
  var teamsBox = document.getElementById('sb-ob-teams'), nowEl = document.getElementById('sb-ob-now');
  var picker = document.getElementById('tp-picker'), gameFrame = document.getElementById('sb-game'), howBtn = document.getElementById('sb-play-how');
  var still = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var open = false, going = 0;
  // With a mouse it is a click, as in the game
  var tapWord = document.getElementById('sb-ob-tap');
  if (tapWord && matchMedia('(hover: hover) and (pointer: fine)').matches) tapWord.textContent = 'Click';

  function picked() { return tp && tp.state && Array.isArray(tp.state.picked) ? tp.state.picked.slice() : []; }
  function kickers() { return picked().filter(function (n) { return n !== 'Every NSW match'; }); }

  /* ---------- Home holds still while its cards are lent ---------- */
  var body = phone.querySelector('.cn-body'), homeEl = document.getElementById('tp-home'), anchor = null, settle = 0;
  function topOf(el) { return el.getBoundingClientRect().top - body.getBoundingClientRect().top; }
  function hold() { if (anchor && anchor.el.isConnected) { var d = topOf(anchor.el) - anchor.top; if (Math.abs(d) >= 0.5) body.scrollTop += d; } }
  // The person scrolls, or a control takes them somewhere (the menu's Home): that is where they want to be, so let go
  function release() { anchor = null; clearTimeout(settle); }
  ['wheel', 'touchmove'].forEach(function (ev) { body.addEventListener(ev, release, { passive: true }); });
  body.addEventListener('keydown', function (e) { if (/^(Arrow(Up|Down)|Page(Up|Down)|Home|End| )$/.test(e.key)) release(); });
  if (window.ResizeObserver && homeEl) new ResizeObserver(function () { if (anchor && picker.parentNode !== teamsBox) hold(); }).observe(homeEl);
  var cameFrom = null;
  function lendIn() {
    if (!picker || picker.parentNode === teamsBox || picker.closest('#tp-at')) return;
    clearTimeout(settle);
    if (!anchor) {
      var secs = [].slice.call(document.querySelectorAll('#tp-home .tp-home-sec')), el = secs.filter(function (x) { return x.offsetParent && topOf(x) + x.offsetHeight > 0; })[0];
      anchor = el ? { el: el, top: topOf(el) } : null;
    }
    cameFrom = { parent: picker.parentNode, next: picker.nextSibling };
    teamsBox.appendChild(picker); window.dispatchEvent(new Event('resize'));
  }
  function lendBack() {
    if (!picker || !cameFrom) return;
    // Back where it came from; if something else has already taken it, the tabs script puts it where the tab showing wants it
    if (picker.parentNode === teamsBox) cameFrom.parent.insertBefore(picker, cameFrom.next && cameFrom.next.parentNode === cameFrom.parent ? cameFrom.next : null);
    cameFrom = null;
    if (window.tpView && window.tpView.lend) window.tpView.lend();
    window.dispatchEvent(new Event('resize'));
    hold();
    settle = setTimeout(function () { hold(); anchor = null; }, 900);
  }

  /* ---------- one tap picks the kicker ---------- */
  function nameOf(card) { var n = card.querySelector('.tp-card2-name'); return n ? n.textContent.trim() : ''; }
  // The team becomes the kicker: first in the picks, the others kept in their order
  function makeKicker(name) {
    var rest = tp.state.picked.filter(function (n) { return n !== name; });
    tp.state.picked = [name].concat(rest);
    tp.save();
  }
  function chosen(name) {
    if (going || !name) return;
    makeKicker(name);
    nowEl.textContent = 'Kicking for ' + name; nowEl.hidden = false; ob.classList.add('is-chosen');
    if (!still() && nowEl.animate) nowEl.animate([{ opacity: 0, transform: 'translate(-50%, -50%) scale(.92)' }, { opacity: 1, transform: 'translate(-50%, -50%)' }], { duration: 180, easing: 'ease-out' });
    if (tp && tp.say) tp.say('Kicking for ' + name + '.');
    going = setTimeout(function () { going = 0; close(true); }, 560);
  }
  // In the capture phase, before the hand's own handler: a card already picked would be unpicked by it, and here a
  // tap only ever chooses. A card not yet picked goes through to the hand (so the pick is the hand's own), then is
  // made the kicker
  teamsBox.addEventListener('click', function (e) {
    var card = e.target.closest('.tp-card2'); if (!card || !open) return;
    if (going) { e.stopPropagation(); e.preventDefault(); return; }
    var name = nameOf(card);
    if (kickers().indexOf(name) > -1) { e.stopPropagation(); e.preventDefault(); chosen(name); }
    else setTimeout(function () { if (open && kickers().indexOf(name) > -1) chosen(name); }, 0);
  }, true);

  function start() {
    if (open) return true;
    open = true;
    nowEl.hidden = true; ob.classList.remove('is-chosen');
    ob.hidden = false; ob.classList.add('is-pitch'); gameFrame.inert = true; if (howBtn) howBtn.hidden = true;
    phone.classList.add('sb-onboarding');
    lendIn();
    if (!still() && ob.animate) ob.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
    ob.querySelector('.sb-ob-h').focus({ preventScroll: true });
    if (tp && tp.say) tp.say('Who are you kicking for? Pick a team.');
    return true;
  }
  // Puts it away. With play, the pitch takes over: the game loads for the kicker and takes the focus
  function close(play) {
    if (!open) return;
    clearTimeout(going); going = 0;
    lendBack();
    open = false;
    ob.hidden = true; gameFrame.inert = false; if (howBtn) howBtn.hidden = false;
    phone.classList.remove('sb-onboarding');
    if (play && window.sbPlay) window.sbPlay.enter();
  }

  window.sbOnboard = { release: release, start: start, close: function () { close(false); }, isOpen: function () { return open; }, hasTeam: function () { return kickers().length > 0; } };
})();
(function () {
  'use strict';
  var phone = document.getElementById('tp-phone');
  if (!phone) return;
  var body = phone.querySelector('.cn-body');
  var layer = document.getElementById('sb-play'), frame = document.getElementById('sb-game'), closeBtn = document.getElementById('sb-play-close');
  var tp = window.tpPicker;
  var still = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; };
  try { history.scrollRestoration = 'manual'; } catch (e) {}

  /* ---------- Play: Drop goal over the whole screen ---------- */
  var GAME = 'drop-goal-v2/index.html';
  // The picked teams: the first kicks. Every kicker has a team (January brief): with none, the game is not loaded, and
  // opening it leads to the team screen first (v2-onboard.js)
  function teams() { return tp && tp.state && Array.isArray(tp.state.picked) ? tp.state.picked.filter(function (n) { return n !== 'Every NSW match'; }).join(',') : ''; }
  function gameUrl(t) { return GAME + (t ? '?team=' + encodeURIComponent(t) : ''); }
  var loaded = null;
  function loadGame() {
    var t = teams(); if (!t || t === loaded) return false;
    // The first load sets the frame's address; later ones replace it, so the back button never steps through old games
    if (loaded === null) frame.src = gameUrl(t);
    else try { frame.contentWindow.location.replace(gameUrl(t)); } catch (e) { frame.src = gameUrl(t); }
    loaded = t;
    return true;
  }
  var opener = null, inertWas = [], isOpen = false, leaving = null;
  /* The practice kick (drop-goal-v2/game.js): the first time the pitch is shown, and from the ? beside the cross. Seen
     is kept under sb: (sbob-seen), so Reset shows it again; the game says when it is done or skipped */
  var SEEN = 'sbob-seen', wantPractice = false;
  function seen() { try { return localStorage.getItem(SEEN) === '1'; } catch (e) { return false; } }
  function gameApi() { try { return frame.contentWindow && frame.contentWindow.__dgPractice; } catch (e) { return null; } }
  function practise() { var a = gameApi(); if (a && isOpen) { wantPractice = false; a.start(); focusGame(); } else wantPractice = true; }
  // Onto the pitch: the game for the kicker (loaded again if the kicker changed), the focus, and the practice kick if
  // it has not been seen
  function enter() {
    var fresh = loadGame();
    if (!seen()) { if (fresh) wantPractice = true; else practise(); }
    else if (!fresh) try { if (frame.contentWindow.__dgRetype) frame.contentWindow.__dgRetype(); } catch (e) {}   // the caption above the bar is typed again as the game shows
    focusGame();
  }
  function focusGame() { try { frame.focus(); var d = frame.contentDocument && frame.contentDocument.getElementById('dg'); if (d) d.focus({ preventScroll: true }); } catch (e) {} }
  /* The places without the game (Home's Or see all the places, 24 Nov): the same layer, with the game's own list
     opened in the frame (?places) and no pitch, team screen or practice kick. No team is needed. Its cross closes the
     layer; the game is loaded again afterwards, ready for Play now */
  var placesOnly = false;
  function openPlaces(from) { placesOnly = true; openGame(from); }
  function openGame(from, quick) {
    if (isOpen || !layer) return;
    if (leaving) { leaving.onfinish = null; leaving.cancel(); leaving = null; }
    isOpen = true; opener = from || document.activeElement;
    if (placesOnly) {
      var t = teams(), u = GAME + '?places' + (t ? '&team=' + encodeURIComponent(t) : '');
      if (loaded === null) frame.src = u; else try { frame.contentWindow.location.replace(u); } catch (e) { frame.src = u; }
      loaded = ''; window.sbPlay.cross(false);
    } else loadGame();
    // Everything else on the phone steps back: what was already inert stays so when the game closes
    inertWas = [].filter.call(phone.children, function (el) { return el !== layer; }).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; });
    layer.hidden = false; layer.style.pointerEvents = '';
    phone.classList.add('sb-playing');
    if (window.sbDemoSync) window.sbDemoSync();
    if (!quick && layer.animate) layer.animate(still() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
    // No team: the team screen first, by every route (v2-onboard.js). Otherwise the pitch, with the practice kick the
    // first time
    if (placesOnly) { try { frame.focus(); } catch (e) {} }
    else if (!teams() && window.sbOnboard) window.sbOnboard.start(); else enter();
    try { history.pushState({ sbplay: true }, ''); } catch (e) {}
    if (tp && tp.say) tp.say(placesOnly ? 'The places opened. Close is at the top right.' : 'Drop goal opened. Back is at the top left.');
  }
  function shut() {
    if (!isOpen) return;
    isOpen = false;
    if (window.sbOnboard) window.sbOnboard.close();
    inertWas.forEach(function (p) { p[0].inert = p[1]; }); inertWas = [];
    phone.classList.remove('sb-playing');
    if (window.sbDemoSync) window.sbDemoSync();
    // Once it has gone, a result card or the places are put away, so the game opens again on the pitch
    var done = function () { leaving = null; layer.hidden = true; layer.style.pointerEvents = ''; try { if (frame.contentWindow.__dgAway) frame.contentWindow.__dgAway(); } catch (e) {} };
    if (!still() && layer.animate) {
      layer.style.pointerEvents = 'none';   // while it leaves, a press goes to the page under it
      leaving = layer.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(32px)' }], { duration: 220, easing: 'ease-in' });
      leaving.onfinish = done;
    } else done();
    if (opener && opener.isConnected && opener.focus) opener.focus({ preventScroll: true });
    opener = null;
    if (tp && tp.say) tp.say(placesOnly ? 'The places closed.' : 'Drop goal closed.');
    if (placesOnly) { placesOnly = false; window.sbPlay.cross(true); setTimeout(loadGame, 260); }
  }
  // The cross and Escape go back through the history entry Play made, so the phone's back button and they do the same
  function closeGame() {
    if (!isOpen) return;
    if (history.state && history.state.sbplay) history.back(); else shut();
  }
  window.addEventListener('popstate', function () { if (isOpen) shut(); });
  if (layer) {
    closeBtn.addEventListener('click', closeGame);
    layer.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closeGame(); } });
    // The game is ready as the page opens, so Play now shows it at once; a pick while it is closed dresses the kicker
    frame.addEventListener('load', function () { if (!isOpen) return; focusGame(); if (wantPractice) practise(); });
    loadGame();
    phone.addEventListener('tp:state', function () { if (!isOpen) loadGame(); });
  }
  // For the game (drop-goal-v2/): Escape on its kick screen closes it, and its own full-screen list hides the cross
  var howB = document.getElementById('sb-play-how');
  var crossOff = false, cardUp = false;
  if (howB) howB.addEventListener('click', practise);
  var seeB = document.getElementById('sb-kick-places');
  if (seeB) seeB.addEventListener('click', function () { openPlaces(seeB); });
  window.sbPlay = { open: openGame, places: openPlaces, close: closeGame, isOpen: function () { return isOpen; }, reload: loadGame, focus: focusGame, enter: enter,
    // During the practice kick How to play is put away; it comes back, fading in, when the game is ready
    practiceStart: function () { if (howB) howB.hidden = true; },
    practiceDone: function () { try { localStorage.setItem(SEEN, '1'); } catch (e) {} if (howB && howB.hidden && !crossOff) { howB.hidden = false; if (!still() && howB.animate) howB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' }); } },
    changeTeam: function () { if (window.sbOnboard) window.sbOnboard.start(); },
    cross: function (show) { crossOff = !show; if (closeBtn) closeBtn.hidden = crossOff || cardUp; var h = document.getElementById('sb-play-how'); if (h) h.hidden = !show; },
    // A result card on a phone has its own close cross: Back steps aside while the card is up (drop-goal-v2/result.js)
    back: function (show) { cardUp = !show; if (closeBtn) closeBtn.hidden = crossOff || cardUp; } };


  /* ---------- The planner: saves, and the way to the plan ---------- */
  window.sbPlay.save = function (item, on, id) { if (!tp) return; if (on && item) tp.addItem(item, true); else if (!on) tp.removeItem(id); };
  window.sbSaved = { open: function () {
    closeGame();
    setTimeout(function () { if (window.tpView) window.tpView.go('plan'); if (tp && tp.openTimeline) tp.openTimeline(); }, still() ? 0 : 260);
  } };
  // Reset prototype: the practice kick shows again and the places start over
  var resetB = document.getElementById('tp-reset');
  if (resetB) resetB.addEventListener('click', function () {
    try { localStorage.removeItem(SEEN); } catch (e) {}
    try { frame.contentWindow.sessionStorage.removeItem('sb:dg-rotation'); } catch (e) {}
    if (isOpen) shut();
  });
  /* ---------- How to play: the game playing itself on Home ----------
     It plays once each time the Play section comes into view (24 Nov: on a loop it was repetitive), then rests. If it
     is scrolled away or the game is opened before it finishes, it goes back to rest. With a mouse, moving onto it
     plays it again. There is no Replay button: after a game it read as "replay the game". With reduced motion it
     never plays (game.js). */
  (function () {
    var box = document.getElementById('sb-demo'), fr = document.getElementById('sb-demo-frame');
    if (!box || !fr) return;
    var seen = false, done = false;
    // With a mouse the line says click, as the onboarding does
    var how = document.getElementById('sb-demo-how');
    if (how && matchMedia('(hover: hover) and (pointer: fine)').matches) how.innerHTML = '<strong>How to play:</strong> click to drop the ball, then click again as it bounces.';
    function api() { try { return fr.contentWindow && fr.contentWindow.__dgDemo; } catch (e) { return null; } }
    function sync() {
      var a = api(); if (!a) return;
      a.onDone = function () { done = true; };
      if (done) return;
      if (seen && !isOpen) { if (!a.playing()) a.play(); } else if (a.playing()) a.stop();
    }
    box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && done) { done = false; sync(); } });
    fr.addEventListener('load', sync);
    // Every kicker has a team (January brief): the picked one, or Australia, the host, before anyone has picked
    fr.src = GAME + '?demo&team=' + encodeURIComponent(teams().split(',')[0] || 'Australia');
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { var was = seen; seen = es[es.length - 1].isIntersecting; if (seen && !was) done = false; sync(); }, { root: body, threshold: 0.6 }).observe(box);
    else seen = true;
    window.sbDemoSync = sync;
  })();

  // A reset link that had the game open, or a shared link to it
  /* ?view=kick opens the game once. It is taken off the address first, so refreshing the page shows Home, not the game
     again (24 Nov) */
  if (/[?&]view=kick\b/.test(location.search)) {
    try { var u = new URL(location.href); u.searchParams.delete('view'); history.replaceState(history.state, '', u.pathname + u.search.replace(/=(?=&|$)/g, '') + u.hash); } catch (e) {}
    openGame(document.querySelector('#tp-home-kick button.tp-home-cta'), true);
  }
})();
