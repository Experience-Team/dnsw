/* Sydney on social (25 Nov 2026), Version 1's own copy. The Home section (#tp-soc): a ring for each account that has
   stories, a row of recent posts and a Visit button for each account; and the viewer, over the whole phone, which plays an
   account's stories or shows one post. Data: window.cnSocial (concepts-social.js, all gap fields, invented sample content;
   docs/product-data-contract.md §21). Styles: v1-social.css. Version 2 has its own copy (v2/v2-social.js).
   Empty states: no accounts hides the section; an account with no stories is a plain button (no ring); no posts hides the
   row. Links are placeholders until the accounts are confirmed: they announce that and go nowhere. Seen rings are kept
   in tp-soc-v1. In the viewer: tap right or Next for the next story, tap left or Previous for the one before, hold to
   pause, Pause button, arrow keys; a story lasts 5 seconds and, with reduced motion, does not advance by itself.
   Swipe or drag sideways, or use the arrows or Previous and Next, to go to the next or previous story (over to the next
   account at the end) or post: the content follows the finger and slides in from the side it comes from. Posts are in the
   order of the row on the page. The close cross is top right, 16px from the edge; Escape closes; focus goes back to what is
   showing (the row scrolls to it if a swipe moved on). */
(function () {
  var D = window.cnSocial || {}, sec = document.getElementById('tp-soc'), phone = document.getElementById('tp-phone');
  if (!sec || !phone) return;
  var accounts = D.accounts || [], stories = D.stories || [], posts = D.posts || [];
  if (!accounts.length) return; // empty state: nothing to follow, so the section stays hidden
  sec.hidden = false;
  var STORE = 'tp-soc-v1', MS = 5000;
  var LABEL = { instagram: 'Instagram', tiktok: 'TikTok' };
  var ICON = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 3v11.2a3.2 3.2 0 1 1-3.2-3.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 3c.3 2.4 1.9 4 4.5 4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  var EXT = '<svg class="tp-soc-ext" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M4.5 2.5h5v5M9.5 2.5l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CLOSE = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2 2l10 10M12 2L2 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var PAUSE = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4 2.5v9M10 2.5v9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  var CHEV_L = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M9 2.5L4.5 7 9 11.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEV_R = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M5 2.5L9.5 7 5 11.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var PLAY = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4.5 2.5l7 4.5-7 4.5z" fill="currentColor"/></svg>';
  var still = matchMedia('(prefers-reduced-motion: reduce)');

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function acc(id) { return accounts.filter(function (a) { return a.id === id; })[0]; }
  function storiesOf(id) { return stories.filter(function (s) { return s.account === id; }); }
  function url(p) { return "url('" + encodeURI(String(p)) + "')"; } // sits inside a double-quoted style attribute
  function when(iso) { var d = new Date(iso + 'T00:00:00'); return isNaN(d) ? '' : d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }); }
  var seen = {};
  try { seen = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { seen = {}; }
  function keep() { try { localStorage.setItem(STORE, JSON.stringify(seen)); } catch (e) {} }

  /* ---------- the section ---------- */
  // The rows that scroll sideways run to the edge of the screen on a phone, and to the edge of the window on desktop, past the
  // page margins or a fixed-width column: the bleed is the gap between the scrolling page and this section, each side, and
  // the first item stays lined up with the section
  var scroller = sec.closest('.tp-body');
  function bleed() { if (!scroller || !sec.offsetParent) return; var g = Math.max(0, Math.round((scroller.clientWidth - sec.clientWidth) / 2 * 100) / 100); sec.style.setProperty('--tp-soc-bleed', g + 'px'); }
  if (window.ResizeObserver && scroller) { var ro = new ResizeObserver(bleed); ro.observe(scroller); ro.observe(sec); }
  bleed();
  var rings = sec.querySelector('#tp-soc-rings'), postsEl = sec.querySelector('#tp-soc-posts'), visit = sec.querySelector('#tp-soc-visit'), say = sec.querySelector('#tp-soc-say');
  rings.innerHTML = accounts.map(function (a) {
    var n = storiesOf(a.id).length, p = LABEL[a.platform] || a.platform, inner = '<span class="tp-soc-av" aria-hidden="true">' + (ICON[a.platform] || '') + '</span><span class="tp-soc-rl">' + esc(a.name) + '</span><span class="tp-soc-rs">' + esc(p) + '</span>';
    if (!n) return '<li><a class="tp-soc-ring is-plain" href="#" data-soc-visit="' + a.id + '" aria-label="Visit ' + esc(a.name) + ' on ' + esc(p) + '">' + inner + '</a></li>';
    return '<li><button type="button" class="tp-soc-ring' + (seen[a.id] ? ' is-seen' : '') + '" data-soc-story="' + a.id + '" aria-label="' + esc(p) + ' stories from ' + esc(a.name) + ', ' + n + (n === 1 ? ' story' : ' stories') + (seen[a.id] ? ', seen' : ', not seen yet') + '">' + inner + '</button></li>';
  }).join('');
  if (!posts.length) postsEl.hidden = true;
  else postsEl.innerHTML = posts.map(function (p) {
    var a = acc(p.account) || {}, pl = LABEL[a.platform] || '';
    return '<li><button type="button" class="tp-soc-post" data-soc-post="' + p.id + '" aria-label="' + esc(pl) + ' post, ' + esc(when(p.posted)) + ': ' + esc(p.caption) + '">' +
      '<span class="tp-soc-pimg" style="background-image:' + url(p.image) + '"><span class="tp-soc-badge" aria-hidden="true">' + (ICON[a.platform] || '') + '</span></span>' +
      '<span class="tp-soc-pcap">' + esc(p.caption) + '</span><span class="tp-soc-pdate">' + esc(when(p.posted)) + '</span></button></li>';
  }).join('');
  visit.innerHTML = accounts.map(function (a) {
    var p = LABEL[a.platform] || a.platform;
    return '<a class="tp-soc-btn" href="#" data-soc-visit="' + a.id + '">' + (ICON[a.platform] || '') + 'Visit ' + esc(p) + EXT + '</a>';
  }).join('');

  function visitNote(id, into) {
    var a = acc(id) || {}, p = LABEL[a.platform] || '';
    into.textContent = 'Placeholder link: it goes to the Sydney ' + p + ' account once the address is confirmed.';
    clearTimeout(into._t); into._t = setTimeout(function () { into.textContent = ''; }, 4000);
  }

  /* ---------- the viewer ---------- */
  var layer = null, view, live, opener = null, inertWas = [], mode = '', acctId = '', idx = 0, paused = false, postIdx = -1, busy = false, drag = null, swallow = false, curAnim = null;
  function build() {
    layer = document.createElement('div');
    layer.className = 'tp-soc-layer'; layer.id = 'tp-soc-layer'; layer.hidden = true; layer.tabIndex = -1;
    layer.setAttribute('role', 'dialog'); layer.setAttribute('aria-modal', 'true'); layer.setAttribute('aria-label', 'Sydney on social');
    layer.innerHTML = '<div id="tp-soc-view"></div><p class="visually-hidden" id="tp-soc-live" aria-live="polite"></p>' +
      '<button type="button" class="tp-soc-ctl tp-soc-pause" id="tp-soc-pause" aria-label="Pause">' + PAUSE + '</button>' +
      '<button type="button" class="tp-soc-ctl tp-soc-nav tp-soc-pprev" id="tp-soc-pprev" aria-label="Previous post" hidden>' + CHEV_L + '</button>' +
      '<button type="button" class="tp-soc-ctl tp-soc-nav tp-soc-pnext" id="tp-soc-pnext" aria-label="Next post" hidden>' + CHEV_R + '</button>' +
      '<button type="button" class="tp-soc-ctl tp-soc-x" id="tp-soc-x" aria-label="Close">' + CLOSE + '</button>';
    phone.appendChild(layer);
    view = layer.querySelector('#tp-soc-view'); live = layer.querySelector('#tp-soc-live');
    layer.querySelector('#tp-soc-x').addEventListener('click', close);
    layer.querySelector('#tp-soc-pause').addEventListener('click', function () { setPaused(!paused); });
    layer.querySelector('#tp-soc-pprev').addEventListener('click', function () { go(-1); });
    layer.querySelector('#tp-soc-pnext').addEventListener('click', function () { go(1); });
    layer.addEventListener('keydown', onKey);
    layer.addEventListener('click', onLayerClick);
    layer.addEventListener('animationend', function (e) { if (e.animationName === 'tp-soc-fill' && mode === 'story') next(); });
    layer.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.tp-soc-hit')) hold(true);
      if (e.button || busy || e.target.closest('a, .tp-soc-ctl')) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), on: false, dx: 0 };
    });
    // A sideways drag: the content follows the finger (and resists at either end); let go past a quarter of the width, or
    // with a flick, and it carries on to the next one, otherwise it springs back
    layer.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        drag.on = true; hold(true); clearAnim(); try { layer.setPointerCapture(e.pointerId); } catch (x) {}
      }
      drag.dx = dx;
      view.style.transform = 'translateX(' + (target(dx < 0 ? 1 : -1) ? dx : dx * 0.3) + 'px)';
    });
    function endDrag(e, cancel) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if (!d.on) return;
      swallow = true; setTimeout(function () { swallow = false; }, 60);
      hold(false);
      var w = layer.clientWidth, v = Math.abs(d.dx) / Math.max(1, Date.now() - d.t), dir = d.dx < 0 ? 1 : -1;
      if (!cancel && (Math.abs(d.dx) > w * 0.25 || v > 0.5) && target(dir)) go(dir, d.dx); else springBack(d.dx);
    }
    layer.addEventListener('pointerup', function (e) { endDrag(e, false); if (!drag && e.target.closest && e.target.closest('.tp-soc-hit')) hold(false); });
    layer.addEventListener('pointercancel', function (e) { endDrag(e, true); hold(false); });
    layer.addEventListener('pointerleave', function (e) { if (e.target.closest && e.target.closest('.tp-soc-hit')) hold(false); });
  }
  var held = false;
  function hold(on) { if (mode !== 'story' || still.matches) return; held = on; layer.classList.toggle('is-paused', on || paused); }
  function setPaused(p) {
    paused = p; layer.classList.toggle('is-paused', p);
    var b = layer.querySelector('#tp-soc-pause'); b.setAttribute('aria-label', p ? 'Play' : 'Pause'); b.innerHTML = p ? PLAY : PAUSE;
  }
  function open(from) {
    if (!layer) build();
    opener = from;
    inertWas = [].filter.call(phone.children, function (el) { return el !== layer; }).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; });
    layer.hidden = false; layer.style.animation = ''; layer.focus({ preventScroll: true });
  }
  function close() {
    if (!layer || layer.hidden) return;
    var was = mode, o = opener, moved = false; opener = null;
    // Focus goes back to what is showing, which a swipe may have moved on from what was opened
    if (was === 'post' && posts[postIdx]) { var c = postsEl.querySelector('[data-soc-post="' + posts[postIdx].id + '"]'); if (c) { moved = c !== o; o = c; } }
    else if (was === 'story') { var r = rings.querySelector('[data-soc-story="' + acctId + '"]'); if (r) { moved = r !== o; o = r; } }
    layer.hidden = true; mode = ''; held = false; drag = null; busy = false; clearAnim();
    inertWas.forEach(function (p) { p[0].inert = p[1]; }); inertWas = [];
    if (o && o.isConnected && o.focus) { if (moved) o.scrollIntoView({ block: 'nearest', inline: 'nearest' }); o.focus({ preventScroll: true }); }
  }
  function head(a, sub) {
    var p = LABEL[a.platform] || '';
    return '<div class="tp-soc-head"><span class="tp-soc-av" aria-hidden="true">' + (ICON[a.platform] || '') + '</span><span class="tp-soc-hn"><b>' + esc(a.name) + '</b><small>' + esc(p) + (a.handle ? ' · ' + esc(a.handle) : '') + (sub ? ' · ' + esc(sub) : '') + '</small></span></div>';
  }
  function visitBtn(a, solid) { return '<a class="tp-soc-btn' + (solid ? ' tp-soc-btn--solid' : '') + '" href="#" data-soc-visit="' + a.id + '">Visit ' + esc(LABEL[a.platform] || a.platform) + EXT + '</a>'; }

  /* Stories */
  function openStories(id, from) {
    if (!storiesOf(id).length) return;
    mode = 'story'; acctId = id; idx = 0; held = false;
    open(from); layer.classList.remove('is-post'); setNav(false, false); setPaused(false); drawStory();
  }
  function drawStory() {
    var list = storiesOf(acctId), s = list[idx], a = acc(acctId); if (!s || !a) return;
    layer.classList.toggle('is-still', still.matches);
    layer.querySelector('#tp-soc-pause').hidden = still.matches;
    layer.style.setProperty('--tp-soc-ms', MS + 'ms');
    view.innerHTML = '<div class="tp-soc-media" style="background-image:' + url(s.image) + '"></div><div class="tp-soc-scrim"></div>' +
      '<ol class="tp-soc-bars" aria-hidden="true">' + list.map(function (_, i) { return '<li class="' + (i < idx ? 'is-done' : i === idx ? 'is-now' : '') + '"><i></i></li>'; }).join('') + '</ol>' +
      head(a, 'sample') +
      '<button type="button" class="tp-soc-hit tp-soc-prev" aria-label="Previous story"></button><button type="button" class="tp-soc-hit tp-soc-next" aria-label="Next story"></button>' +
      '<div class="tp-soc-cap"><p class="tp-soc-capt">' + esc(s.caption) + '</p><div class="tp-soc-acts">' + visitBtn(a, true) + '</div><p class="tp-soc-say" id="tp-soc-lsay" role="status"></p></div>';
    live.textContent = ''; setTimeout(function () { live.textContent = (LABEL[a.platform] || '') + ' story ' + (idx + 1) + ' of ' + list.length + ': ' + s.caption; }, 30);
    if (idx === list.length - 1) { seen[acctId] = true; keep(); paintSeen(acctId); }
  }
  function paintSeen(id) {
    var b = rings.querySelector('[data-soc-story="' + id + '"]'); if (!b) return;
    var a = acc(id) || {}, n = storiesOf(id).length, p = LABEL[a.platform] || '';
    b.classList.add('is-seen'); b.setAttribute('aria-label', p + ' stories from ' + a.name + ', ' + n + (n === 1 ? ' story' : ' stories') + ', seen');
  }
  function next() {
    var list = storiesOf(acctId);
    if (idx < list.length - 1) { idx++; drawStory(); return; }
    // The end of this account's stories: on to the next account that has some, or the viewer closes
    var ids = accounts.map(function (a) { return a.id; }).filter(function (i) { return storiesOf(i).length; });
    var at = ids.indexOf(acctId);
    if (at > -1 && at < ids.length - 1) { acctId = ids[at + 1]; idx = 0; drawStory(); } else close();
  }
  function prev() { if (idx > 0) { idx--; drawStory(); } else drawStory(); }

  /* A single post, and the way sideways between posts and stories */
  function setNav(prevOn, nextOn) { layer.querySelector('#tp-soc-pprev').hidden = !prevOn; layer.querySelector('#tp-soc-pnext').hidden = !nextOn; }
  function openPost(id, from) {
    var i = -1; posts.forEach(function (x, k) { if (x.id === id) i = k; });
    if (i < 0 || !acc(posts[i].account)) return;
    postIdx = i; mode = 'post'; open(from); layer.classList.add('is-post'); layer.querySelector('#tp-soc-pause').hidden = true; drawPost();
  }
  function drawPost() {
    var p = posts[postIdx], a = p && acc(p.account); if (!p || !a) return;
    var n = posts.length;
    view.innerHTML = '<div class="tp-soc-media" style="background-image:' + url(p.image) + '"></div><div class="tp-soc-scrim"></div>' + head(a, 'sample') +
      '<div class="tp-soc-cap"><p class="tp-soc-when">' + esc(when(p.posted)) + ' · ' + (postIdx + 1) + ' of ' + n + '</p><p class="tp-soc-capt">' + esc(p.caption) + '</p>' +
      '<div class="tp-soc-acts"><a class="tp-soc-btn tp-soc-btn--solid" href="#" data-soc-visit="' + a.id + '" data-soc-post-link="' + p.id + '">View on ' + esc(LABEL[a.platform] || a.platform) + EXT + '</a>' + visitBtn(a, false) + '</div>' +
      '<p class="tp-soc-say" id="tp-soc-lsay" role="status"></p></div>';
    setNav(postIdx > 0, postIdx < n - 1);
    live.textContent = ''; setTimeout(function () { live.textContent = (LABEL[a.platform] || '') + ' post ' + (postIdx + 1) + ' of ' + n + ', ' + when(p.posted) + ': ' + p.caption; }, 30);
  }
  function acctIds() { return accounts.map(function (a) { return a.id; }).filter(function (i) { return storiesOf(i).length; }); }
  // Where a swipe, an arrow or Previous and Next would land: the next or previous post, or story (over to the next account at
  // the end of one's stories); null at either end
  function target(dir) {
    if (mode === 'post') { var n = postIdx + dir; return n < 0 || n >= posts.length ? null : { p: n }; }
    if (mode !== 'story') return null;
    var list = storiesOf(acctId), ids = acctIds(), at = ids.indexOf(acctId);
    if (dir > 0) return idx < list.length - 1 ? { a: acctId, i: idx + 1 } : at > -1 && at < ids.length - 1 ? { a: ids[at + 1], i: 0 } : null;
    return idx > 0 ? { a: acctId, i: idx - 1 } : at > 0 ? { a: ids[at - 1], i: 0 } : null;
  }
  function apply(t) { if (t.p != null) { postIdx = t.p; drawPost(); } else { acctId = t.a; idx = t.i; drawStory(); layer.classList.toggle('is-paused', paused); } }
  // Sideways between equals slides: the old one goes out the way you swiped, the new one comes in from that side. Reduced
  // motion swaps in place
  function slide(from, to, ms) {
    view.style.transform = '';
    if (still.matches || !view.animate) return Promise.resolve();
    var a = view.animate([{ transform: 'translateX(' + from + 'px)' }, { transform: 'translateX(' + to + 'px)' }], { duration: ms, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' });
    if (curAnim) curAnim.cancel();
    curAnim = a;
    return a.finished.then(function () {}, function () {});
  }
  function clearAnim() { if (curAnim) { curAnim.cancel(); curAnim = null; } if (view) view.style.transform = ''; }
  function go(dir, fromDx) {
    var t = target(dir);
    if (busy || !t) { if (fromDx) springBack(fromDx); return; }
    busy = true;
    var w = layer.clientWidth;
    slide(fromDx || 0, -dir * w, 170).then(function () { apply(t); return slide(dir * w, 0, 200); }).then(function () { busy = false; clearAnim(); });
  }
  function springBack(dx) { busy = true; slide(dx || 0, 0, 160).then(function () { busy = false; clearAnim(); }); }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (mode === 'story' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.target.closest('a, button.tp-soc-ctl')) { e.preventDefault(); if (e.key === 'ArrowRight') next(); else prev(); return; }
    if (mode === 'post' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.target.closest('a, button.tp-soc-ctl')) { e.preventDefault(); go(e.key === 'ArrowRight' ? 1 : -1); return; }
    if (e.key === 'Tab') { // keep the focus inside the viewer
      var f = [].filter.call(layer.querySelectorAll('button, a[href]'), function (el) { return !el.hidden && el.offsetParent !== null; });
      if (!f.length) return;
      var i = f.indexOf(document.activeElement), last = f.length - 1;
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[last].focus(); } else if (!e.shiftKey && i === last) { e.preventDefault(); f[0].focus(); }
    }
  }
  function onLayerClick(e) {
    if (swallow) { e.preventDefault(); return; } // the click that ends a swipe is not a tap
    var v = e.target.closest('[data-soc-visit]');
    if (v) { e.preventDefault(); visitNote(v.getAttribute('data-soc-visit'), layer.querySelector('#tp-soc-lsay')); return; }
    if (e.target.closest('.tp-soc-next')) next(); else if (e.target.closest('.tp-soc-prev')) prev();
  }

  sec.addEventListener('click', function (e) {
    var s = e.target.closest('[data-soc-story]'), p = e.target.closest('[data-soc-post]'), v = e.target.closest('[data-soc-visit]');
    if (s) { openStories(s.getAttribute('data-soc-story'), s); return; }
    if (p) { openPost(p.getAttribute('data-soc-post'), p); return; }
    if (v) { e.preventDefault(); visitNote(v.getAttribute('data-soc-visit'), say); }
  });
  window.tpSocial = { openStories: openStories, openPost: openPost, close: close, isOpen: function () { return !!layer && !layer.hidden; } };
})();
