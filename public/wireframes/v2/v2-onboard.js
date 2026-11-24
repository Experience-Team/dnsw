/* Version 2: Drop goal's onboarding (24 Nov 2026). Shown over the game the first time someone opens it; after that
   Play now goes straight to the game, and How to play (the ? beside the game's close cross) brings it back.
   - One screen of rules, Two taps to kick: a picture of the real game playing itself once
     (v2/drop-goal/index.html?demo=taps, in a frame scaled down like a screenshot) with each press marked and named, a
     Replay button once it has played, and three short tips: the two presses, then what a goal gets you. It was two
     screens; Score to find a place was folded in. With reduced motion the picture stays still.
   - Tap or click: on a touch screen the words say Tap; with a mouse (hover and a fine pointer) they say Click, and
     the first tip adds "or press Space". The picture's own marker does the same (game.js).
   - Team: with a team picked on Home, the screen says who is kicking, with Change. With none, a first screen offers
     the team cards (Home's own hand of cards, lent here by its id, so a pick is the same pick everywhere). It can be
     passed without picking: the game works without a team (experience principle 2).
   - Skip is on every screen. Finishing or skipping marks it seen (v2ob-seen, filed under v2:, so Reset shows it again);
     closing the game with the cross does not.
   - Team screen and rules are sideways between equals (check 10): each slides in from the side it comes from, and the
     step is read out. */
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
  // With a mouse it is clicks, on a touch screen taps: the words follow how this person will play
  var CLICK = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var WORDS = CLICK ? { taps: 'clicks', Tap: 'Click', space: ', or press Space,' } : { taps: 'taps', Tap: 'Tap', space: '' };
  [].forEach.call(ob.querySelectorAll('[data-ob-word]'), function (el) { el.textContent = WORDS[el.dataset.obWord]; });
  var NAMES = { team: 'Your team', taps: 'Two ' + WORDS.taps + ' to kick' };
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
  function hold() { if (anchor && anchor.el.isConnected) { var d = topOf(anchor.el) - anchor.top; if (Math.abs(d) >= 0.5) body.scrollTop += d; } }
  // The person scrolls, or a control takes them somewhere (the menu's Home): that is where they want to be, so let go
  function release() { anchor = null; clearTimeout(settle); }
  ['wheel', 'touchmove'].forEach(function (ev) { body.addEventListener(ev, release, { passive: true }); });
  body.addEventListener('keydown', function (e) { if (/^(Arrow(Up|Down)|Page(Up|Down)|Home|End| )$/.test(e.key)) release(); });
  if (window.ResizeObserver && homeEl) new ResizeObserver(function () { if (anchor && picker.parentNode !== teamsBox) hold(); }).observe(homeEl);
  function lendIn() {
    if (!picker || picker.parentNode === teamsBox || picker.closest('#tp-at')) return;
    clearTimeout(settle);
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
    settle = setTimeout(function () { hold(); anchor = null; }, 900);
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
  ['taps'].forEach(function (name) {
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
    countEl.textContent = steps.length > 1 ? 'Step ' + (at + 1) + ' of ' + steps.length : ''; countEl.hidden = steps.length < 2;   // one screen needs no count
    backBtn.hidden = at === 0;
    if (at > 0) backBtn.querySelector('span').textContent = 'Back';
    // Next says where it goes to screen readers; on screen it stays short, so it holds one line at 320 wide in both themes
    nextBtn.querySelector('span').innerHTML = last ? 'Let’s play' : name === 'team' ? (picked().length ? 'Continue' : 'Continue without a team') : 'Next<span class="visually-hidden">: ' + NAMES[steps[at + 1]] + '</span>';
  }

  /* ---------- moving between screens ---------- */
  function show(k, dir, quiet) {
    var was = steps[at];
    if (was === 'team') lendBack();
    if (was === 'taps') stopShot(was);
    at = k;
    var name = steps[at];
    [].forEach.call(ob.querySelectorAll('.v2-ob-panel'), function (p) { p.hidden = p.dataset.step !== name; });
    var p = panel(name);
    ob.classList.toggle('is-pitch', name === 'team');   // the team cards sit on the pitch, as the game does
    labels();
    if (name === 'team') lendIn();
    if (name === 'taps') teamText();
    if (name === 'taps') playShot(name);
    // Sideways between equals: it comes in from the side it comes from; reduced motion swaps in place
    if (dir && !still() && p.animate) p.animate([{ opacity: 0, transform: 'translateX(' + (dir > 0 ? 28 : -28) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
    p.querySelector('.v2-ob-h').focus({ preventScroll: true });
    if (!quiet && tp && tp.say) tp.say(NAMES[name] + (steps.length > 1 ? ', step ' + (at + 1) + ' of ' + steps.length : '') + '.');
  }
  function start(o) {
    o = o || {};
    if (open) return true;
    if (!o.force && seen()) return false;
    steps = (!o.force && !picked().length ? ['team'] : []).concat(['taps']);
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
    stopShot('taps');
    open = false; at = -1;
    ob.hidden = true; ob.classList.remove('is-pitch'); gameFrame.inert = false; if (howBtn) howBtn.hidden = false;
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

  window.v2Onboard = { release: release, start: start, close: function () { close(false); }, isOpen: function () { return open; } };
})();
