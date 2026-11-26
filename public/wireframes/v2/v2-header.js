/* Version 2: the header and its action bar (26 Nov 2026). The full header, at rest, is the logo row and, under it (on the
   desktop website, in the same row), the action row: Your plan and the hamburger. That row is one bar, the first thing in
   the phone and over the page (#v2-menu-wrap). At rest it sits in the slot under the header (#v2-bar-slot); once the
   page scrolls, it follows the scroll the way the Version 1 / Version 2 bar does (CLAUDE.md, check 1): it rises with the
   page on the way down, comes back by as much as the page comes back on the way up, and is a slim header (the paper
   behind it, a rule under it) while it is away from its slot. It is never on a timer: every pixel it moves is a pixel the
   page moved, and it stops where the page stops (so part way is possible, as with any scroll-linked bar).
   Two things bring it fully back on a timer, because the person has done something they should see: adding to Your
   plan (the count would change out of sight), and moving to it with the keyboard.

   Where the bar is: y = max(p, -offset). p is where the slot is (the page's own place for it, which scrolls away with the
   header); offset is how much of the bar's height is hidden, from 0 to its height, counted only while the slot is above
   the top (p < 0), so that at the top of the page the bar is simply in its slot. */
(function () {
  'use strict';
  var phone = document.getElementById('tp-phone'), wrap = document.getElementById('v2-menu-wrap'), slot = document.getElementById('v2-bar-slot');
  var body = phone && phone.querySelector('.tp-body'), header = phone && phone.querySelector('.tp-top');
  if (!phone || !wrap || !slot || !body || !header) return;
  var H = 56, offset = 0, lastQ = 0, y = 0, easeT = 0, lastCount = 0;

  function measure() {
    H = wrap.offsetHeight || 56;
    wrap.style.setProperty('--v2-sbw', (body.offsetWidth - body.clientWidth) + 'px'); // the scrollbar: the bar spans the window
  }
  function place() {
    var p = slot.getBoundingClientRect().top - phone.getBoundingClientRect().top, q = Math.min(p, 0);
    offset = p >= 0 ? 0 : Math.max(0, Math.min(H, offset + (lastQ - q)));
    lastQ = q;
    y = Math.max(p, -offset);
    wrap.style.setProperty('--v2-bar-y', y.toFixed(1) + 'px');
    wrap.classList.toggle('is-over', y > p + .5);
  }
  // Fully back, over the page: eased once, then it follows the scroll again from there
  function reveal() {
    if (offset <= 0) return;
    offset = 0;
    wrap.classList.add('is-easing');
    place();
    clearTimeout(easeT); easeT = setTimeout(function () { wrap.classList.remove('is-easing'); }, 300);
  }

  body.addEventListener('scroll', place, { passive: true });
  window.addEventListener('resize', function () { measure(); place(); });
  wrap.addEventListener('focusin', reveal);
  phone.addEventListener('tp:state', function () {
    var n = window.v2Saved && window.v2Saved.count ? window.v2Saved.count() : 0;
    if (n > lastCount) reveal();
    lastCount = n;
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); place(); });
  measure(); place();
  lastCount = window.v2Saved && window.v2Saved.count ? window.v2Saved.count() : 0;
})();
