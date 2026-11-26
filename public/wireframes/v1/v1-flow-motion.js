/* Version 1: moving through the questions (26 Nov 2026). Version 1's own file; it reads the page the flow
   (concepts-flow-c.js) draws and changes none of the shared scripts or styles.

   1. Next, Back and Skip push. The step on show leaves the way the person is going (next to the left, back to the
      right) while the next one comes in from the other side, as one rail, in the same time and over the same distance,
      so the question pushes the cards out of the frame. The step on show is copied just before the flow redraws (a
      still of it, called the ghost) and slid out; the flow's own controls slide in. The frame is the stage's own box
      (#tp-pick), so nothing is seen outside it and nothing scrolls sideways. Finishing the flow does not push: the
      plan that follows is a different page, not a neighbour.
   2. The hand of cards deals in each time it arrives at the first question (the Plan tab opened): the cards leave
      a pile at the foot of the hand and fan out to their places, a few milliseconds apart. Coming back to the cards with
      Back is the push's job, so the cards do not deal as well.

   Reduced motion: nothing moves. The flow's own small slide and the shared one-off fade-in of the cards (concepts-teams.js)
   are replaced while these run, and left alone otherwise. */
(function () {
  'use strict';
  var phone = document.getElementById('tp-phone'), pick = document.getElementById('tp-pick');
  if (!phone || !pick || document.documentElement.getAttribute('data-flow') !== 'c') return;
  var body = pick.offsetParent || phone.querySelector('.cn-body');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var STEPS = ['teams', 'days', 'stay'];
  var NAV = '[data-fc-go], [data-fc-skip], [data-fc-all]'; // Next, Back, Skip and Show every NSW match
  var PUSH = { duration: 480, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'both' }; // an even ease in and out: nothing is front-loaded
  var running = null, pushing = false;

  /* ---------- 1. The push ---------- */
  function clean() {
    if (!running) return;
    var r = running; running = null; pushing = false;
    r.anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
    if (r.ghost.parentNode) r.ghost.parentNode.removeChild(r.ghost);
    pick.classList.remove('v1-fc-pushing'); pick.style.minHeight = '';
  }
  // A copy of the stage as it is now. The flow's styles read the step from the phone, which is about to change, so the
  // stage's own parts keep the display they have now
  function take(dir) {
    var g = pick.cloneNode(true), a = pick.children, b = g.children, i, cs;
    for (i = 0; i < a.length; i++) {
      cs = getComputedStyle(a[i]);
      b[i].style.setProperty('display', cs.display, 'important');
      b[i].style.setProperty('visibility', cs.visibility, 'important');
    }
    g.setAttribute('aria-hidden', 'true'); g.setAttribute('inert', ''); g.removeAttribute('tabindex');
    return { ghost: g, dir: dir, scroll: body.scrollTop, left: pick.offsetLeft, top: pick.offsetTop, w: pick.offsetWidth, h: pick.offsetHeight };
  }
  function push(s) {
    var g = s.ghost, W = s.w, sign = s.dir, anims = [];
    // The flow has already scrolled the new step to its top; the old one stays where the person last saw it
    g.className += ' v1-fc-ghost';
    g.style.cssText += ';left:' + s.left + 'px;top:' + (s.top + body.scrollTop - s.scroll) + 'px;width:' + W + 'px;height:' + s.h + 'px';
    pick.after(g);
    pick.classList.add('v1-fc-pushing'); pick.style.minHeight = s.h + 'px'; // the stage keeps its height until the old step has gone
    [].slice.call(g.children).forEach(function (el) {
      if (getComputedStyle(el).display === 'none') return;
      anims.push(el.animate([{ translate: '0 0' }, { translate: (-sign * W) + 'px 0' }], PUSH));
    });
    [].slice.call(pick.children).forEach(function (el) {
      if (!el.getClientRects().length) return;
      el.getAnimations().forEach(function (an) { an.cancel(); }); // the flow's own 32px slide: this replaces it
      anims.push(el.animate([{ translate: (sign * W) + 'px 0' }, { translate: '0 0' }], PUSH));
    });
    running = { ghost: g, anims: anims }; pushing = true;
    var end = function () { if (running && running.ghost === g) clean(); };
    Promise.all(anims.map(function (an) { return an.finished; })).then(end, end);
  }
  // Captured before the flow's own listener (on the same element, in the bubbling phase) redraws the page
  phone.addEventListener('click', function (e) {
    if (reduce.matches || !pick.animate) return;
    var b = e.target.closest(NAV);
    if (!b || !phone.contains(b) || b.getAttribute('aria-disabled') === 'true') return;
    var from = phone.getAttribute('data-fc');
    if (STEPS.indexOf(from) < 0) return;
    clean();
    var s = take(b.dataset.fcGo && +b.dataset.fcGo < 0 ? -1 : 1);
    requestAnimationFrame(function () {
      var to = phone.getAttribute('data-fc');
      if (to === from || STEPS.indexOf(to) < 0) return; // nothing moved on, or the flow finished
      push(s);
    });
  }, true);

  /* ---------- 2. The cards deal in ---------- */
  var wrap = document.getElementById('tp-fan2-wrap'), fan = document.getElementById('tp-fan2');
  var shown = false, dealT = 0;
  function deal() {
    if (reduce.matches || !fan || !fan.animate || !wrap.getClientRects().length) return;
    var cards = [].slice.call(fan.querySelectorAll('.tp-card2')).filter(function (c) { return c.getClientRects().length; });
    if (!cards.length) return;
    var w = wrap.getBoundingClientRect(), ox = w.left + w.width / 2, oy = w.bottom - 24, t0 = performance.now();
    cards.forEach(function (c, k) {
      var r = c.getBoundingClientRect();
      var an = c.animate([
        { translate: (ox - (r.left + r.width / 2)) + 'px ' + (oy - (r.top + r.height / 2)) + 'px', scale: '.55', opacity: 0 },
        { opacity: 1, offset: .22 },
        { translate: '0 0', scale: '1', opacity: 1 }
      ], { duration: 640, delay: k * 17, easing: 'cubic-bezier(.33, 0, .2, 1)', fill: 'backwards' });
      an.id = 'v1-deal';
    });
    // The shared fade-in of the cards (concepts-teams.js) starts when the hand comes into view, which may be after this:
    // for the first second, anything of theirs on the cards gives way to this
    (function drop() {
      cards.forEach(function (c) { c.getAnimations().forEach(function (an) { if (an.id !== 'v1-deal') an.cancel(); }); });
      if (performance.now() - t0 < 1000) requestAnimationFrame(drop);
    })();
  }
  // The hand arrives at the question when its picker is back under the stage (Home borrows the picker while Home shows,
  // so opening the Plan tab moves it here without changing its size) and the step showing is Your teams. It lays itself out
  // when it shows, so the deal waits a moment for the cards to take their places
  var picker = document.getElementById('tp-picker');
  function inStep() { return !!picker && !!wrap && pick.contains(picker) && phone.getAttribute('data-fc') === 'teams' && picker.getClientRects().length > 0; }
  function watch() {
    var now = inStep();
    if (now && !shown) {
      clearTimeout(dealT);
      dealT = setTimeout(function () { if (!pushing && !reduce.matches && inStep()) deal(); }, 90);
    }
    shown = now;
  }
  if (picker && window.MutationObserver) {
    var mo = new MutationObserver(watch);
    mo.observe(phone, { attributes: true, attributeFilter: ['class', 'data-fc', 'data-view'] });
    mo.observe(pick, { childList: true });
    shown = inStep();
  }
})();
