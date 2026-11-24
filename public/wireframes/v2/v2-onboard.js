/* Version 2: Drop goal's onboarding (24 Nov 2026). Shown over the game the first time someone opens it; after that
   Play now goes straight to the game, and How to play (the ? beside the game's close cross) brings it back.
   - Screens: Two taps to kick, then Score to find a place. Each has a picture of the real game playing itself once
     (v2/drop-goal/index.html?demo=taps and ?demo=place, in a frame scaled down like a screenshot), a Replay button once
     it has played, and two short tips. With reduced motion the pictures stay still.
   - Team: with a team picked on Home, the first screen says who is kicking, with Change. With none, a first screen
     offers the team cards (Home's own hand of cards, lent here by its id, so a pick is the same pick everywhere). It can
     be passed without picking: the game works without a team (experience principle 2).
   - Skip is on every screen. Finishing or skipping marks it seen (v2ob-seen, filed under v2:, so Reset shows it again);
     closing the game with the cross does not.
   - Previous and next are sideways between equals (check 10): each screen slides in from the side it comes from, the
     buttons say where they go, and the count is read out. */
(function () {
  'use strict';
  var ob = document.getElementById('v2-ob'), phone = document.getElementById('tp-phone');
  if (!ob || !phone) return;
  var SEEN = 'v2ob-seen', GAME = 'v2/drop-goal/index.html';
  var tp = window.v2Picker;
  var countEl = document.getElementById('v2-ob-count'), nextBtn = document.getElementById('v2-ob-next'), backBtn = document.getElementById('v2-ob-back');
  var skipBtn = document.getElementById('v2-ob-skip'), teamsBox = document.getElementById('v2-ob-teams'), teamLine = document.getElementById('v2-ob-team');
  var picker = document.getElementById('tp-picker'), gameFrame = document.getElementById('v2-game'), howBtn = document.getElementById('v2-play-how');
  var still = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var esc = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var NAMES = { team: 'Your team', taps: 'Two taps to kick', place: 'Score to find a place' };
  var steps = [], at = -1, open = false;

  function seen() { try { return localStorage.getItem(SEEN) === '1'; } catch (e) { return false; } }
  function mark() { try { localStorage.setItem(SEEN, '1'); } catch (e) {} }
  function picked() { return tp && tp.state && Array.isArray(tp.state.picked) ? tp.state.picked.slice() : []; }
  function kickers() { return picked().filter(function (n) { return n !== 'Every NSW match'; }); }
  function panel(name) { return ob.querySelector('.v2-ob-panel[data-step="' + name + '"]'); }

  /* ---------- the team cards, lent while the team screen shows ---------- */
  /* Home holds still while its cards are away (check 8). Lending them changes Home's height above whatever the person
     was looking at, and the hand lays itself out again a moment after it is back. So the section that was on screen
     is remembered with where it sat, and the scroll is corrected to keep it there, at once and as Home settles. */
  var body = phone.querySelector('.cn-body'), homeEl = document.getElementById('tp-home'), anchor = null, settle = 0;
  function topOf(el) { return el.getBoundingClientRect().top - body.getBoundingClientRect().top; }
  var yHeld = null;
  function hold() {
    if (!anchor || !anchor.el.isConnected) return;
    // The person, or a control (the menu's Home), has scrolled since: that is where they want to be, so let go
    if (yHeld !== null && Math.abs(body.scrollTop - yHeld) > 1) { anchor = null; yHeld = null; return; }
    var d = topOf(anchor.el) - anchor.top; if (Math.abs(d) >= 0.5) body.scrollTop += d;
    yHeld = body.scrollTop;
  }
  if (window.ResizeObserver && homeEl) new ResizeObserver(function () { if (anchor && picker.parentNode !== teamsBox) hold(); }).observe(homeEl);
  function lendIn() {
    if (!picker || picker.parentNode === teamsBox || picker.closest('#tp-at')) return;
    clearTimeout(settle); yHeld = null;
    if (!anchor) {
      var secs = [].slice.call(document.querySelectorAll('#tp-home .tp-home-sec')), el = secs.filter(function (x) { return x.offsetParent && topOf(x) + x.offsetHeight > 0; })[0];
      anchor = el ? { el: el, top: topOf(el) } : null;
    }
    teamsBox.appendChild(picker); window.dispatchEvent(new Event('resize'));
  }
  function lendBack() {
    if (!picker || picker.parentNode !== teamsBox || !window.v2View) return;
    window.v2View.lend(); window.dispatchEvent(new Event('resize'));
    hold();
    settle = setTimeout(function () { hold(); anchor = null; yHeld = null; }, 900);
  }

  /* ---------- the pictures: the game playing itself, scaled like a screenshot ---------- */
  var W = 360, H = 640;
  function shot(name) { var p = panel(name); return p && { box: p.querySelector('.v2-ob-shot'), phone: p.querySelector('.v2-ob-phone'), frame: p.querySelector('iframe'), replay: p.querySelector('.v2-ob-replay') }; }
  function api(s) { try { return s.frame.contentWindow && s.frame.contentWindow.__dgDemo; } catch (e) { return null; } }
  // Sized from the room the picture has, skipped while hidden (widths read as zero), and only when that room changes
  var roomWas = {};
  function fit(name) {
    var s = shot(name); if (!s || !s.box.clientHeight || !s.box.clientWidth) return;
    var key = s.box.clientWidth + 'x' + s.box.clientHeight; if (roomWas[name] === key) return; roomWas[name] = key;
    var k = Math.min((s.box.clientHeight - 4) / H, (s.box.clientWidth - 4) / W, 0.8);
    s.phone.style.setProperty('--s', k.toFixed(4));
  }
  function playShot(name) {
    var s = shot(name); if (!s) return;
    var url = GAME + '?demo=' + name + (kickers().length ? '&team=' + encodeURIComponent(kickers().join(',')) : '');
    s.replay.hidden = true;
    var go = function () { var a = api(s); if (!a || steps[at] !== name || !open) return; a.onDone = function () { s.replay.hidden = false; }; a.play(); };
    if (s.frame.dataset.url !== url) { s.frame.dataset.url = url; s.frame.onload = go; s.frame.src = url; }
    else go();
    fit(name);
  }
  function stopShot(name) { var s = shot(name), a = s && api(s); if (a) a.stop(); }
  ['taps', 'place'].forEach(function (name) {
    var s = shot(name); if (!s) return;
    s.replay.addEventListener('click', function () { playShot(name); panel(name).querySelector('.v2-ob-h').focus({ preventScroll: true }); });
    if (window.ResizeObserver) new ResizeObserver(function () { fit(name); }).observe(s.box);
  });

  /* ---------- who is kicking ---------- */
  function teamText() {
    var k = kickers();
    teamLine.innerHTML = (k.length === 0 ? 'Kicking in the Third Half kit.' : k.length === 1 ? 'Kicking for <b>' + esc(k[0]) + '</b>.' : 'Kicking for <b>' + esc(k[0]) + '</b>, the first of your ' + k.length + ' teams.') +
      ' <button type="button" class="tp-link v2-ob-change" id="v2-ob-change">' + (k.length ? 'Change' : 'Pick a team') + '</button>';
  }
  function labels() {
    var name = steps[at], last = at === steps.length - 1;
    countEl.textContent = 'Step ' + (at + 1) + ' of ' + steps.length;
    backBtn.hidden = at === 0;
    if (at > 0) backBtn.querySelector('span').textContent = 'Back';
    // Next says where it goes to screen readers; on screen it stays short, so it holds one line at 320 wide in both themes
    nextBtn.querySelector('span').innerHTML = last ? 'Let’s play' : name === 'team' ? (picked().length ? 'Continue' : 'Continue without a team') : 'Next<span class="visually-hidden">: ' + NAMES[steps[at + 1]] + '</span>';
  }

  /* ---------- moving between screens ---------- */
  function show(k, dir, quiet) {
    var was = steps[at];
    if (was === 'team') lendBack();
    if (was === 'taps' || was === 'place') stopShot(was);
    at = k;
    var name = steps[at];
    [].forEach.call(ob.querySelectorAll('.v2-ob-panel'), function (p) { p.hidden = p.dataset.step !== name; });
    var p = panel(name);
    labels();
    if (name === 'team') lendIn();
    if (name === 'taps') teamText();
    if (name === 'taps' || name === 'place') playShot(name);
    // Sideways between equals: it comes in from the side it comes from; reduced motion swaps in place
    if (dir && !still() && p.animate) p.animate([{ opacity: 0, transform: 'translateX(' + (dir > 0 ? 28 : -28) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
    p.querySelector('.v2-ob-h').focus({ preventScroll: true });
    if (!quiet && tp && tp.say) tp.say(NAMES[name] + ', step ' + (at + 1) + ' of ' + steps.length + '.');
  }
  function start(o) {
    o = o || {};
    if (open) return true;
    if (!o.force && seen()) return false;
    steps = (!o.force && !picked().length ? ['team'] : []).concat(['taps', 'place']);
    open = true; at = -1;
    ob.hidden = false; gameFrame.inert = true; if (howBtn) howBtn.hidden = true;
    phone.classList.add('v2-onboarding');
    if (!still() && ob.animate && o.force) ob.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
    show(0, 0);
    return true;
  }
  // Puts it away. The game behind is as it was; with play, the game takes the teams picked here and the focus
  function close(play) {
    if (!open) return;
    if (steps[at] === 'team') lendBack();
    ['taps', 'place'].forEach(stopShot);
    open = false; at = -1;
    ob.hidden = true; gameFrame.inert = false; if (howBtn) howBtn.hidden = false;
    phone.classList.remove('v2-onboarding');
    if (play && window.v2Play) { window.v2Play.reload(); window.v2Play.focus(); }
  }
  function finish() { mark(); close(true); if (tp && tp.say) tp.say('Drop goal. Tap to drop the ball.'); }

  nextBtn.addEventListener('click', function () { if (at === steps.length - 1) finish(); else show(at + 1, 1); });
  backBtn.addEventListener('click', function () { if (at > 0) show(at - 1, -1); });
  skipBtn.addEventListener('click', finish);
  // Change, or Pick a team: the team screen, put first if it was not there
  ob.addEventListener('click', function (e) {
    if (!e.target.closest('#v2-ob-change')) return;
    if (steps[0] !== 'team') { steps.unshift('team'); at++; }
    show(0, -1);
  });
  // A pick on the team screen changes what its button says
  phone.addEventListener('tp:state', function () { if (open && steps[at] === 'team') labels(); });
  if (howBtn) howBtn.addEventListener('click', function () { start({ force: true }); });

  window.v2Onboard = { start: start, close: function () { close(false); }, isOpen: function () { return open; } };
})();
