/* Version 2: what shows on the phone (24 Nov 2026). It takes the place of Options A to C's capsule script: Home is
   the page, the planner is not in Version 2 yet, and Drop goal opens over the whole screen.
   - Home: the planner's hand of cards is lent to Home for good (found by its id), so a pick on Home is the pick.
   - Menu (to be refined): Home, Plan your 3rd half, Play Drop Goal. A tap outside, Escape or picking anything closes
     it, and focus goes back to the button.
   - Play: Play now and the menu open the game (v2/drop-goal/, in a frame) as a full-screen layer. The close cross is
     top right; Escape and the phone's back button close it too; focus goes back to what opened it. ?view=kick opens
     it straight away. The picked teams go to the game in its address (?team=Wales,Japan), so the first kicks and all of
     them choose the places.
   - Saves: the game writes its saves into the same saved state the team cards keep (tp-pick-v1, filed under v2:), so
     they are merged back into the page's copy as they happen and a later pick never drops them.
   window.v2View keeps the shape the copied scripts expect (get, go, reveal, lend); window.v2CapRoom is the room their
   jumps leave under the menu. */
(function () {
  'use strict';
  var phone = document.getElementById('tp-phone');
  if (!phone) return;
  var body = phone.querySelector('.cn-body'), home = document.getElementById('tp-home');
  var wrap = document.getElementById('v2-menu-wrap'), btn = document.getElementById('v2-menu-btn'), menu = document.getElementById('v2-menu');
  var layer = document.getElementById('v2-play'), frame = document.getElementById('v2-game'), closeBtn = document.getElementById('v2-play-close');
  var tp = window.v2Picker;
  var still = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; };
  // Back closes the game (below): the browser must not also put the page's scroll back to where it remembers it, which
  // moved Home under the person. The page keeps its own place
  try { history.scrollRestoration = 'manual'; } catch (e) {}

  /* ---------- Home: the hand of cards, lent for good ---------- */
  var picker = document.getElementById('tp-picker'), homeHand = document.getElementById('tp-home-hand');
  function lend() { if (picker && homeHand && picker.parentNode !== homeHand && !picker.closest('#tp-at')) homeHand.appendChild(picker); }
  lend();
  window.dispatchEvent(new Event('resize'));   // the hand lays itself out again in its new place

  // The header's height, for the desktop website's layout (as the capsule script did)
  var topEl = phone.querySelector('.tp-top');
  function topH() { if (topEl && topEl.offsetHeight) phone.style.setProperty('--top-h', topEl.offsetHeight + 'px'); }
  topH();
  if (window.ResizeObserver && topEl) new ResizeObserver(topH).observe(topEl);

  /* ---------- Where things go ---------- */
  function jump(el, focusEl) {
    if (!el) return;
    if (tp && tp.goTo) tp.goTo(el); else el.scrollIntoView({ block: 'start', behavior: still() ? 'auto' : 'smooth' });
    if (focusEl) focusEl.focus({ preventScroll: true });
  }
  function go(v, from) {
    if (v !== 'kick' && v !== 'play' && window.v2Onboard) window.v2Onboard.release();   // a jump on Home is where they want to be
    if (v === 'kick' || v === 'play') openGame(from);
    else {
      // From an open article: Home comes back first (it goes back through the article's history entry, which puts
      // Home's scroll where it was), and the jump follows once that has settled
      var then = v === 'plan'
        ? function () { jump(document.getElementById('tp-home-plan'), document.getElementById('tp-home-plan-title')); }
        : function () { body.scrollTo({ top: 0, behavior: still() ? 'auto' : 'smooth' }); };
      if (window.v2Article && window.v2Article.get()) { window.v2Article.close(); setTimeout(then, 120); } else then();
    }
  }
  window.v2View = { get: function () { return 'event'; }, go: function (v) { go(v); }, reveal: function () {}, lend: lend };
  window.v2CapRoom = function () { return wrap ? wrap.offsetHeight + 16 : 16; };

  /* ---------- Menu ---------- */
  function menuOpen() {
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true');
    if (menu.animate) menu.animate(still() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(-4px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 160, easing: 'ease-out' });
    menu.querySelector('.v2-menu-i').focus({ preventScroll: true });
  }
  function menuClose(back) {
    if (menu.hidden) return;
    menu.hidden = true; btn.setAttribute('aria-expanded', 'false');
    if (back) btn.focus({ preventScroll: true });
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { if (menu.hidden) menuOpen(); else menuClose(true); });
    menu.addEventListener('click', function (e) {
      // Reset prototype, for reviewers: the same reset as the viewer's own button
      if (e.target.closest('#v2-menu-reset')) { menuClose(false); var r = document.getElementById('tp-reset'); if (r) r.click(); return; }
      var i = e.target.closest('[data-v2-go]'); if (!i) return;
      menuClose(true);
      go(i.dataset.v2Go, btn);
    });
    // A press outside closes it, and the thing pressed still does what it does (check 10)
    document.addEventListener('pointerdown', function (e) { if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) menuClose(false); }, true);
    wrap.addEventListener('keydown', function (e) {
      if (menu.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); menuClose(true); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var its = [].slice.call(menu.querySelectorAll('.v2-menu-i, .v2-menu-r')), i = its.indexOf(document.activeElement);
      e.preventDefault(); its[(i + (e.key === 'ArrowDown' ? 1 : its.length - 1)) % its.length].focus();
    });
    menu.addEventListener('focusout', function (e) { if (!menu.hidden && e.relatedTarget && !menu.contains(e.relatedTarget) && e.relatedTarget !== btn) menuClose(false); });
  }

  /* ---------- Play: Drop goal over the whole screen ---------- */
  var GAME = 'v2/drop-goal/index.html';
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
  /* The practice kick (v2/drop-goal/game.js): the first time the pitch is shown, and from the ? beside the cross. Seen
     is kept under v2: (v2ob-seen), so Reset shows it again; the game says when it is done or skipped */
  var SEEN = 'v2ob-seen', wantPractice = false;
  function seen() { try { return localStorage.getItem(SEEN) === '1'; } catch (e) { return false; } }
  function gameApi() { try { return frame.contentWindow && frame.contentWindow.__dgPractice; } catch (e) { return null; } }
  function practise() { var a = gameApi(); if (a && isOpen) { wantPractice = false; a.start(); focusGame(); } else wantPractice = true; }
  // Onto the pitch: the game for the kicker (loaded again if the kicker changed), the focus, and the practice kick if
  // it has not been seen
  function enter() {
    var fresh = loadGame();
    if (!seen()) { if (fresh) wantPractice = true; else practise(); }
    focusGame();
  }
  function focusGame() { try { frame.focus(); var d = frame.contentDocument && frame.contentDocument.getElementById('dg'); if (d) d.focus({ preventScroll: true }); } catch (e) {} }
  function openGame(from, quick) {
    if (isOpen || !layer) return;
    if (leaving) { leaving.onfinish = null; leaving.cancel(); leaving = null; }
    isOpen = true; opener = from || document.activeElement;
    loadGame();
    // Everything else on the phone steps back: what was already inert stays so when the game closes
    inertWas = [].filter.call(phone.children, function (el) { return el !== layer; }).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; });
    layer.hidden = false; layer.style.pointerEvents = '';
    phone.classList.add('v2-playing');
    if (window.v2DemoSync) window.v2DemoSync();
    if (!quick && layer.animate) layer.animate(still() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
    // No team: the team screen first, by every route (v2-onboard.js). Otherwise the pitch, with the practice kick the
    // first time
    if (!teams() && window.v2Onboard) window.v2Onboard.start(); else enter();
    try { history.pushState({ v2play: true }, ''); } catch (e) {}
    if (tp && tp.say) tp.say('Drop goal opened. Close the game is at the top right.');
  }
  function shut() {
    if (!isOpen) return;
    isOpen = false;
    if (window.v2Onboard) window.v2Onboard.close();
    inertWas.forEach(function (p) { p[0].inert = p[1]; }); inertWas = [];
    phone.classList.remove('v2-playing');
    if (window.v2DemoSync) window.v2DemoSync();
    var done = function () { leaving = null; layer.hidden = true; layer.style.pointerEvents = ''; };
    if (!still() && layer.animate) {
      layer.style.pointerEvents = 'none';   // while it leaves, a press goes to the page under it
      leaving = layer.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(32px)' }], { duration: 220, easing: 'ease-in' });
      leaving.onfinish = done;
    } else done();
    if (opener && opener.isConnected && opener.focus) opener.focus({ preventScroll: true });
    opener = null;
    if (tp && tp.say) tp.say('Drop goal closed. Back to Home.');
  }
  // The cross and Escape go back through the history entry Play made, so the phone's back button and they do the same
  function closeGame() {
    if (!isOpen) return;
    if (history.state && history.state.v2play) history.back(); else shut();
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
  // For the game (v2/drop-goal/): Escape on its kick screen closes it, and its own full-screen list hides the cross
  var howB = document.getElementById('v2-play-how');
  if (howB) howB.addEventListener('click', practise);
  window.v2Play = { open: openGame, close: closeGame, isOpen: function () { return isOpen; }, reload: loadGame, focus: focusGame, enter: enter,
    practiceDone: function () { try { localStorage.setItem(SEEN, '1'); } catch (e) {} },
    changeTeam: function () { if (window.v2Onboard) window.v2Onboard.start(); },
    cross: function (show) { if (closeBtn) closeBtn.hidden = !show; var h = document.getElementById('v2-play-how'); if (h) h.hidden = !show; } };

  // Play now, and anything else that asks for the game or the planner by its old tab name
  phone.addEventListener('click', function (e) {
    var b = e.target.closest('[data-view]'); if (!b || !phone.contains(b)) return;
    // The how-to-play picture is not a control of its own: focus goes back to Play now when the game closes
    go(b.dataset.view, b.matches('button, a') ? b : document.querySelector('#tp-home-kick button.tp-home-cta'));
  });

  /* ---------- The game's saves, merged into the page's copy of the saved state ---------- */
  window.addEventListener('storage', function (e) {
    if (e.key !== 'v2:tp-pick-v1' || !e.newValue || !tp || !tp.state) return;
    try {
      var rec = JSON.parse(e.newValue), kicks = (Array.isArray(rec.added) ? rec.added : []).filter(function (x) { return x && x.kind === 'kick' && typeof x.id === 'string'; });
      tp.state.added = tp.state.added.filter(function (x) { return x.kind !== 'kick'; }).concat(kicks);
    } catch (x) {}
  });

  /* ---------- How to play: the game playing itself on Home ----------
     It plays once each time the Play section comes into view (24 Nov: on a loop it was repetitive), then rests. If it
     is scrolled away or the game is opened before it finishes, it goes back to rest. With a mouse, moving onto it
     plays it again. There is no Replay button: after a game it read as "replay the game". With reduced motion it
     never plays (game.js). */
  (function () {
    var box = document.getElementById('v2-demo'), fr = document.getElementById('v2-demo-frame');
    if (!box || !fr) return;
    var seen = false, done = false;
    // With a mouse the line says click, as the onboarding does
    var how = document.getElementById('v2-demo-how');
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
    window.v2DemoSync = sync;
  })();

  /* ---------- At a glance: the cards' dots (the carousel on phones) ----------
     One dot per card. The dot for the card in view is marked as it is swiped, and a dot takes the row to its card */
  (function () {
    var row = document.querySelector('#tp-home-glance .tp-gl'), dots = document.getElementById('v2-gl-dots');
    if (!row || !dots) return;
    var cards = [].slice.call(row.querySelectorAll('.tp-gl-card'));
    dots.innerHTML = cards.map(function (c, i) { var h = c.querySelector('.tp-gl-h'); return '<button type="button" class="v2-gl-dot" data-i="' + i + '" aria-label="Card ' + (i + 1) + ' of ' + cards.length + ': ' + (h ? h.textContent.trim() : '') + '"></button>'; }).join('');
    var btns = [].slice.call(dots.children), at = -1, raf = 0;
    function mark() {
      raf = 0;
      var x = row.getBoundingClientRect().left, best = 0, d = Infinity;
      cards.forEach(function (c, i) { var k = Math.abs(c.getBoundingClientRect().left - x - parseFloat(getComputedStyle(row).paddingLeft || 0)); if (k < d) { d = k; best = i; } });
      // at the far end the last card cannot reach the left edge, so it counts once the row can scroll no further
      if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 2) best = cards.length - 1;
      if (best === at) return; at = best;
      btns.forEach(function (b, i) { if (i === at) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    }
    row.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(mark); }, { passive: true });
    dots.addEventListener('click', function (e) {
      var b = e.target.closest('.v2-gl-dot'); if (!b) return;
      var c = cards[+b.dataset.i];
      row.scrollTo({ left: c.offsetLeft - row.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft || 0), behavior: still() ? 'auto' : 'smooth' });
    });
    mark();
  })();

  // A reset link that had the game open, or a shared link to it
  if (/[?&]view=kick\b/.test(location.search)) openGame(document.querySelector('#tp-home-kick button.tp-home-cta'), true);
})();
