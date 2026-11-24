/* Version 2: Drop goal's team screen (24 Nov 2026; one tap since the practice-kick brief). The rules screen that used
   to follow it is gone: the game teaches itself with a practice kick on the pitch (v2/drop-goal/game.js), started by
   v2-view.js the first time the game is opened and from the ? beside the close cross.
   - A team is compulsory before playing (an agreed exception to experience principle 2, CLAUDE.md). With any team
     picked on Home this screen is not shown: the first one picked is the kicker. With none, it comes first by every
     route into the game.
   - One tap: tapping a card picks that team, "Kicking for [team]" shows for about half a second, and the pitch opens.
     There is no Continue and nothing to confirm.
   - Change, on the pitch, opens this screen again. A tap makes that team the kicker (first in the picks) and keeps
     any other teams picked on Home.
   - The cards are Home's own hand (lent here by its id), so a pick is the same pick everywhere; here a tap never
     unpicks, and the hand's caption and Clear all are left on Home.
   - Home holds still while its cards are away (check 8). */
(function () {
  'use strict';
  var ob = document.getElementById('v2-ob'), phone = document.getElementById('tp-phone');
  if (!ob || !phone) return;
  var tp = window.v2Picker;
  var teamsBox = document.getElementById('v2-ob-teams'), nowEl = document.getElementById('v2-ob-now');
  var picker = document.getElementById('tp-picker'), gameFrame = document.getElementById('v2-game'), howBtn = document.getElementById('v2-play-how');
  var still = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var open = false, going = 0;

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
    phone.classList.add('v2-onboarding');
    lendIn();
    if (!still() && ob.animate) ob.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
    ob.querySelector('.v2-ob-h').focus({ preventScroll: true });
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
    phone.classList.remove('v2-onboarding');
    if (play && window.v2Play) window.v2Play.enter();
  }

  window.v2Onboard = { release: release, start: start, close: function () { close(false); }, isOpen: function () { return open; }, hasTeam: function () { return kickers().length > 0; } };
})();
