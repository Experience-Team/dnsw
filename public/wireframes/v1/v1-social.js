/* Sydney on social (25 Nov 2026), Version 1's own copy. The Home section (#tp-soc): a ring for each account that has
   stories, a row of recent posts and a Visit button for each account; and the viewer, over the whole phone, which plays an
   account's stories or shows one post. Data: window.cnSocial (concepts-social.js, all gap fields, invented sample content;
   docs/product-data-contract.md §21). Styles: v1-social.css. Version 2 has its own copy (v2/v2-social.js).
   Empty states: no accounts hides the section; an account with no stories is a plain button (no ring); no posts hides the
   row. Links are placeholders until the accounts are confirmed: they announce that and go nowhere. Seen rings are kept
   in tp-soc-v1. In the viewer: tap right or Next for the next story, tap left or Previous for the one before, hold to
   pause, Pause button, arrow keys; a story lasts 5 seconds and, with reduced motion, does not advance by itself.
   The close cross is top right, 16px from the edge; Escape closes; focus goes back to what opened it. */
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
  var layer = null, view, live, opener = null, inertWas = [], mode = '', acctId = '', idx = 0, paused = false;
  function build() {
    layer = document.createElement('div');
    layer.className = 'tp-soc-layer'; layer.id = 'tp-soc-layer'; layer.hidden = true; layer.tabIndex = -1;
    layer.setAttribute('role', 'dialog'); layer.setAttribute('aria-modal', 'true'); layer.setAttribute('aria-label', 'Sydney on social');
    layer.innerHTML = '<div id="tp-soc-view"></div><p class="visually-hidden" id="tp-soc-live" aria-live="polite"></p>' +
      '<button type="button" class="tp-soc-ctl tp-soc-pause" id="tp-soc-pause" aria-label="Pause">' + PAUSE + '</button>' +
      '<button type="button" class="tp-soc-ctl tp-soc-x" id="tp-soc-x" aria-label="Close">' + CLOSE + '</button>';
    phone.appendChild(layer);
    view = layer.querySelector('#tp-soc-view'); live = layer.querySelector('#tp-soc-live');
    layer.querySelector('#tp-soc-x').addEventListener('click', close);
    layer.querySelector('#tp-soc-pause').addEventListener('click', function () { setPaused(!paused); });
    layer.addEventListener('keydown', onKey);
    layer.addEventListener('click', onLayerClick);
    layer.addEventListener('animationend', function (e) { if (e.animationName === 'tp-soc-fill' && mode === 'story') next(); });
    ['pointerdown'].forEach(function (t) { layer.addEventListener(t, function (e) { if (e.target.closest('.tp-soc-hit')) hold(true); }); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { layer.addEventListener(t, function (e) { if (e.target.closest && e.target.closest('.tp-soc-hit')) hold(false); }); });
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
    layer.hidden = true; mode = ''; held = false;
    inertWas.forEach(function (p) { p[0].inert = p[1]; }); inertWas = [];
    var o = opener; opener = null;
    if (o && o.isConnected && o.focus) o.focus({ preventScroll: true });
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
    open(from); layer.classList.remove('is-post'); setPaused(false); drawStory();
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

  /* A single post */
  function openPost(id, from) {
    var p = posts.filter(function (x) { return x.id === id; })[0], a = p && acc(p.account); if (!p || !a) return;
    mode = 'post'; open(from); layer.classList.add('is-post'); layer.querySelector('#tp-soc-pause').hidden = true;
    view.innerHTML = '<div class="tp-soc-media" style="background-image:' + url(p.image) + '"></div><div class="tp-soc-scrim"></div>' + head(a, 'sample') +
      '<div class="tp-soc-cap"><p class="tp-soc-when">' + esc(when(p.posted)) + '</p><p class="tp-soc-capt">' + esc(p.caption) + '</p>' +
      '<div class="tp-soc-acts"><a class="tp-soc-btn tp-soc-btn--solid" href="#" data-soc-visit="' + a.id + '" data-soc-post-link="' + p.id + '">View on ' + esc(LABEL[a.platform] || a.platform) + EXT + '</a>' + visitBtn(a, false) + '</div>' +
      '<p class="tp-soc-say" id="tp-soc-lsay" role="status"></p></div>';
    live.textContent = ''; setTimeout(function () { live.textContent = (LABEL[a.platform] || '') + ' post, ' + when(p.posted) + ': ' + p.caption; }, 30);
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (mode === 'story' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.target.closest('a, button.tp-soc-ctl')) { e.preventDefault(); if (e.key === 'ArrowRight') next(); else prev(); return; }
    if (e.key === 'Tab') { // keep the focus inside the viewer
      var f = [].filter.call(layer.querySelectorAll('button, a[href]'), function (el) { return !el.hidden && el.offsetParent !== null; });
      if (!f.length) return;
      var i = f.indexOf(document.activeElement), last = f.length - 1;
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[last].focus(); } else if (!e.shiftKey && i === last) { e.preventDefault(); f[0].focus(); }
    }
  }
  function onLayerClick(e) {
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
