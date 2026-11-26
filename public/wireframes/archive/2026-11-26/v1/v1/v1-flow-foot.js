/* Version 1: Back sits with Skip and Next (26 Nov 2026). The flow (concepts-flow-c.js) draws Back at the top of each
   question, beside "Step 2 of 3", and Skip and Next in the pinned bar at the foot. The three belong together, so Back is
   copied into the bar (as the first button, a square beside Skip) after every redraw of either, and the one at the top
   is hidden (v1-flow-foot.css). The copy is the flow's own control: it carries data-fc-go="-1", so the flow's click
   handler (and the push, v1-flow-motion.js) treat it as the one at the top was treated. Version 1's own file; no
   shared script or stylesheet is touched. */
(function () {
  'use strict';
  var phone = document.getElementById('tp-phone'), foot = document.getElementById('tp-fc-foot'), headTop = phone && phone.querySelector('.tp-fc-head');
  if (!phone || !foot || !headTop || document.documentElement.getAttribute('data-flow') !== 'c') return;
  function sync() {
    var nav = foot.querySelector('.tp-fc-nav'); if (!nav) return;
    var src = headTop.querySelector('.tp-fc-backbtn[data-fc-go="-1"]'), mine = nav.querySelector('.tp-fc-foot-back');
    if (!src) { if (mine) mine.parentNode.removeChild(mine); return; }
    if (!mine) {
      mine = document.createElement('button'); mine.type = 'button';
      mine.className = 'tp-home-cta tp-home-cta--line tp-fc-foot-back'; mine.setAttribute('data-fc-go', '-1');
      mine.innerHTML = src.innerHTML; nav.insertBefore(mine, nav.firstChild);
    }
    mine.setAttribute('aria-label', src.getAttribute('aria-label') || 'Back');
  }
  if (window.MutationObserver) {
    var mo = new MutationObserver(sync);
    mo.observe(foot, { childList: true, subtree: true });
    mo.observe(headTop, { childList: true, subtree: true });
  }
  sync();
})();
