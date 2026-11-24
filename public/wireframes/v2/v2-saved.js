/* Version 2: Your plan, a simple saved list (24 Nov 2026).
   Saving a place in Drop goal had nowhere to go. This is a stripped-back plan: a list, with the older prototypes' save
   and share options. No days, no matches, no map, no sign-in.
   - What goes in: places and watch parties saved in Drop goal (kind 'kick', written by v2/drop-goal/result.js) and
     articles added from Read before you go (kind 'v2art'). Picking a team adds nothing.
   - The button: pinned to the bottom of the phone on Home and in an article, with a badge that counts the saves; on
     the desktop website it sits in the header beside Menu. It appears with the first save and goes when the list is
     empty. Inside the game it is not shown: the game shows "[n] saved · Your plan" on its card and list instead, and
     that opens this same sheet over the game.
   - The sheet: one row per save (picture or poster, name, one line, Remove). Remove takes the row out at once and
     offers Undo. Clear all asks first. Save & share drills down inside the sheet (check 10).
   - Add from the page, with the button on screen: a dot flies into the button, the button bumps, the badge counts up.
   Everything is kept in Version 2's saved state (v2:tp-pick-v1, added), which Reset prototype clears. */
(function () {
  var tp = window.v2Picker, phone = document.getElementById('tp-phone');
  if (!tp || !phone) return;
  var state = tp.state, esc = tp.esc, reduce = tp.reduce || matchMedia('(prefers-reduced-motion: reduce)');
  var PLACES = window.DG2Places || [], PARTIES = window.DG2Parties || [], ARTS = window.TP_ARTICLES || [];
  var FIX = (window.cnFixtures || []).filter(function (f) { return !f.a && f.t; });
  var MON = { Oct: 9, Nov: 10 }, CITY = { sydney: 'Sydney', newcastle: 'Newcastle' };
  var IMG = 'assets/images/';
  var still = function () { return reduce.matches; };
  var ICON = {
    list: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 2h9v12L8 11 3.5 14z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    x: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    back: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M12 7H2.5M6.5 3l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M6 1.5v9M1.5 6h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    tick: '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M1.5 6.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    go: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M5 2.5l4.5 4.5L5 11.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ---------- what is saved, as rows ---------- */
  function team() { var p = (state.picked || []).filter(function (n) { return n !== 'Every NSW match'; }); return p[0] || ''; }
  function dateOf(f) { var m = /(\d+) (\w+)/.exec(f.d); return Date.UTC(2027, MON[m[2]], +m[1]); }
  function cityOf(f) { return f.v === 'Newcastle Stadium' ? 'newcastle' : 'sydney'; }
  /* What a place fits around: the same rule as the game's card (result.js fits) */
  function fits(p) {
    var t = team(), ms = FIX.filter(function (f) { return t && f.t.split(' v ').indexOf(t) > -1 && cityOf(f) === p.host_city; }).sort(function (a, b) { return dateOf(a) - dateOf(b); });
    var m = ms.filter(function (x) { return dateOf(x) + 864e5 > Date.now(); })[0] || ms[0];
    return m ? m.d + ': before or after ' + m.t : 'A free day around ' + CITY[p.host_city];
  }
  function fixtureOf(p) { return p.match ? FIX.concat((window.cnFixtures || []).filter(function (f) { return f.a; })).filter(function (f) { return f.d === p.match.d && f.t === p.match.t; })[0] || (window.cnFixtures || []).filter(function (f) { return f.d === p.match.d && f.t === p.match.t; })[0] : null; }
  function colours() {
    var k = window.DG2Kit && window.DG2Kit.kitFor(team()), b = k && k.ball;
    return b ? { bg: b.stripe, band: b.stripe2 } : { bg: '#256a3e', band: '#fdce01' };
  }
  function isMine(x) { return x && (x.kind === 'kick' || x.kind === 'v2art'); }
  function mine() { return (state.added || []).filter(isMine); }
  function rowOf(it) {
    if (it.kind === 'v2art') {
      var a = ARTS.filter(function (x) { return x.slug === it.art; })[0]; if (!a) return null;
      return { id: it.id, type: 'Article', name: a.title, line: a.cat + ' · ' + a.mins + ' min read', art: a, pic: '<span class="ph-img v2-sv-pic" data-img="' + esc(a.img) + '" aria-hidden="true"></span>' };
    }
    var pid = it.kick && it.kick.place, p = PLACES.concat(PARTIES).filter(function (x) { return x.id === pid; })[0]; if (!p) return null;
    var c = colours();
    var pic = p.image ? '<span class="v2-sv-pic" aria-hidden="true"><img src="' + IMG + encodeURIComponent(p.image) + '" alt="" loading="lazy"></span>'
      : '<span class="v2-sv-pic v2-sv-pic--poster" style="background:' + c.bg + '" aria-hidden="true"><i style="background:' + c.band + '"></i></span>';
    if (p.kind === 'watch') {
      var f = fixtureOf(p);
      return { id: it.id, type: 'Watch party', name: p.name, line: p.match.d + ': ' + p.match.t + ' · ' + (p.location || 'Location to be confirmed'), place: p, fix: f, pic: pic };
    }
    return { id: it.id, type: 'Place', name: p.name, line: fits(p), place: p, pic: pic };
  }
  function rows() { return mine().map(rowOf).filter(Boolean); }
  function count() { return rows().length; }
  function commit() { tp.save(); phone.dispatchEvent(new CustomEvent('tp:state')); }

  /* ---------- the button: bottom of the phone, or in the header on the desktop website ---------- */
  function mkBtn(cls) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.hidden = true; b.setAttribute('aria-haspopup', 'dialog');
    b.innerHTML = ICON.list + '<span class="v2-pb-t">Your plan</span><b class="v2-pb-n"></b>';
    b.addEventListener('click', function () { open(b); });
    return b;
  }
  var btn = mkBtn('v2-pb'), top = mkBtn('v2-menu-btn v2-pb v2-pb--top');
  phone.appendChild(btn);
  var mwrap = document.getElementById('v2-menu-wrap'), mbtn = document.getElementById('v2-menu-btn');
  if (mwrap && mbtn) mwrap.insertBefore(top, mbtn);
  var menuLi = document.getElementById('v2-menu-plan-li'), menuB = document.getElementById('v2-menu-plan'), menuN = document.getElementById('v2-menu-plan-n');
  if (menuB) menuB.addEventListener('click', function () { if (mbtn && mbtn.getAttribute('aria-expanded') === 'true') mbtn.click(); open(mbtn || btn); });
  function shownBtn() { return [top, btn].filter(function (b) { return !b.hidden && b.offsetParent; })[0] || null; }
  var held = null;   // while a dot is flying in, the badge keeps its old number
  function paintBtn(n) {
    [btn, top].forEach(function (b) {
      var was = b.hidden; b.hidden = !n;
      b.querySelector('.v2-pb-n').textContent = n || '';
      b.setAttribute('aria-label', 'Your plan, ' + n + ' added');
      if (was && n && !still() && b.animate && b.offsetParent) b.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
    });
    if (menuLi) { menuLi.hidden = !n; menuN.textContent = n ? '(' + n + ')' : ''; }
  }
  function bump() {
    var b = shownBtn(); if (!b || still() || !b.animate) return;
    b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.34,1.4,.64,1)' });
    var n = b.querySelector('.v2-pb-n'); if (n) n.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.45)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.34,1.4,.64,1)' });
  }
  /* The added thing travels from the button that added it to the plan button, which bumps as the badge counts up */
  function fly(from, n) {
    var to = shownBtn();
    if (!to || !from || still() || !document.body.animate) { held = null; paintBtn(n); return; }
    var a = from.getBoundingClientRect(), b = to.getBoundingClientRect(), ph = phone.getBoundingClientRect();
    var g = document.createElement('span'); g.className = 'tp-fly tp-fly--dot v2-fly';
    g.style.left = (a.left + a.width / 2 - ph.left - 5) + 'px'; g.style.top = (a.top + a.height / 2 - ph.top - 5) + 'px';
    phone.appendChild(g);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    g.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - 40) + 'px) scale(1.3)', opacity: 1, offset: .5 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.7)', opacity: .3 }],
      { duration: 560, easing: 'cubic-bezier(.45, .05, .25, 1)' }).onfinish = function () { g.remove(); held = null; paintBtn(count()); bump(); };
  }

  /* ---------- Add on the page: articles (v2-home.js draws the empty buttons) ---------- */
  function artId(slug) { return 'v2art:' + slug; }
  function hasArt(slug) { return mine().some(function (x) { return x.id === artId(slug); }); }
  function paintAdds(scope) {
    [].forEach.call((scope || phone).querySelectorAll('[data-v2-add]'), function (b) {
      var slug = b.dataset.v2Add.slice(4), a = ARTS.filter(function (x) { return x.slug === slug; })[0], on = hasArt(slug);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', (on ? 'Added to your plan: ' : 'Add to your plan: ') + (a ? a.title : 'this article') + (on ? '. Press to remove it' : ''));
      b.innerHTML = '<span class="v2-add-in">' + (on ? ICON.tick : ICON.plus) + '<span>' + (on ? 'Added' : 'Add') + '</span></span>';
    });
  }
  phone.addEventListener('click', function (e) {
    var b = e.target.closest('[data-v2-add]'); if (!b) return;
    e.preventDefault();
    var slug = b.dataset.v2Add.slice(4), a = ARTS.filter(function (x) { return x.slug === slug; })[0]; if (!a) return;
    var on = !hasArt(slug), before = count();
    state.added = (state.added || []).filter(function (x) { return x.id !== artId(slug); });
    if (on) state.added.push({ id: artId(slug), kind: 'v2art', title: a.title, day: '', unplaced: true, art: slug });
    if (on) {
      // the button shows before the dot sets off (the first save brings it in), holding the old number until it lands
      held = before; commit(); paintBtn(before || 1); if (!before) [btn, top].forEach(function (x) { x.querySelector('.v2-pb-n').textContent = ''; });
      fly(b, count());
    } else commit();
    tp.say(on ? a.title + ' added to your plan.' : a.title + ' removed from your plan.');
  });
  // tiles and the article are drawn after this runs, and again as articles open
  if (window.MutationObserver) new MutationObserver(function (ms) {
    ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 && (n.matches('[data-v2-add]') || n.querySelector('[data-v2-add]'))) paintAdds(n.matches('[data-v2-add]') ? n.parentNode : n); }); });
  }).observe(phone, { childList: true, subtree: true });

  /* ---------- the sheet ---------- */
  var scrim = document.createElement('div'); scrim.className = 'v2-sv-scrim'; scrim.hidden = true;
  var sheet = document.createElement('section');
  sheet.className = 'v2-sv'; sheet.id = 'v2-sv'; sheet.hidden = true; sheet.tabIndex = -1;
  sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'v2-sv-title');
  sheet.innerHTML =
    '<button type="button" class="v2-sv-grab" id="v2-sv-grab" aria-label="Close Your plan"><i></i></button>' +
    '<header class="v2-sv-head"><button type="button" class="v2-sv-ic v2-sv-back" id="v2-sv-back" aria-label="Back to Your plan" hidden>' + ICON.back + '</button>' +
    '<h3 class="v2-sv-title" id="v2-sv-title" tabindex="-1">Your plan</h3>' +
    '<button type="button" class="v2-sv-ic v2-sv-x" id="v2-sv-x" aria-label="Close Your plan">' + ICON.x + '</button></header>' +
    '<div class="v2-sv-body" id="v2-sv-body"></div><div class="v2-sv-foot" id="v2-sv-foot"></div>';
  phone.appendChild(scrim); phone.appendChild(sheet);
  var bodyEl = sheet.querySelector('#v2-sv-body'), footEl = sheet.querySelector('#v2-sv-foot'), titleEl = sheet.querySelector('#v2-sv-title'), backB = sheet.querySelector('#v2-sv-back'), grab = sheet.querySelector('#v2-sv-grab');
  var isOpen = false, level = 'list', opener = null, after = null, inertWas = [], undo = null, undoT = 0, confirming = false, overGame = false;

  function listHtml() {
    var rs = rows(), h = '';
    if (undo) h += '<p class="v2-sv-undo" role="status"><span>' + esc(undo.msg) + '</span><button type="button" class="v2-sv-link" id="v2-sv-undo">Undo</button></p>';
    if (!rs.length) {
      h += '<div class="v2-sv-empty"><p>Nothing added yet. Score a goal in Drop goal and add where the ball lands, or add an article from Read before you go.</p>' +
        (overGame ? '<p class="v2-sv-acts"><button type="button" class="tp-home-cta" data-sv-go="close">Back to the game</button></p>'
          : '<p class="v2-sv-acts"><button type="button" class="tp-home-cta" data-sv-go="play">Play now' + ICON.go + '</button><button type="button" class="v2-kick-places" data-sv-go="places">Or see all the places</button></p>') + '</div>';
      return h;
    }
    h += '<p class="v2-sv-count"><span>' + rs.length + ' added</span><button type="button" class="v2-sv-link" id="v2-sv-clear">Clear all</button></p>';
    h += '<ul class="v2-sv-list">' + rs.map(function (r) {
      return '<li class="v2-sv-row" data-id="' + esc(r.id) + '">' + r.pic + '<div class="v2-sv-t"><span class="v2-sv-kind">' + r.type + '</span><b>' + esc(r.name) + '</b><span class="v2-sv-line">' + esc(r.line) + '</span></div>' +
        '<button type="button" class="v2-sv-rm" data-sv-rm="' + esc(r.id) + '" aria-label="Remove ' + esc(r.name) + ' from your plan">Remove</button></li>';
    }).join('') + '</ul>';
    return h;
  }
  function footHtml() {
    if (level !== 'list' || !count()) return '';
    if (confirming) return '<div class="v2-sv-confirm" role="alertdialog" aria-labelledby="v2-sv-cq"><p id="v2-sv-cq">Clear all ' + count() + ' from your plan? Your team stays picked.</p><p class="v2-sv-acts v2-sv-acts--row"><button type="button" class="tp-home-cta tp-home-cta--line" id="v2-sv-cno">Cancel</button><button type="button" class="tp-home-cta" id="v2-sv-cyes">Clear all</button></p></div>';
    return '<p class="v2-sv-note">Saved on this device only. Keep a copy so you do not lose it.</p><button type="button" class="tp-home-cta" id="v2-sv-share">Save &amp; share' + ICON.go + '</button>';
  }
  function draw(keepFocus) {
    titleEl.textContent = level === 'share' ? 'Save & share' : 'Your plan';
    backB.hidden = level === 'list';
    grab.setAttribute('aria-label', level === 'share' ? 'Back to Your plan' : 'Close Your plan');
    bodyEl.innerHTML = level === 'share' ? shareHtml() : listHtml();
    footEl.innerHTML = footHtml(); footEl.hidden = !footEl.innerHTML;
    sheet.classList.toggle('is-confirm', confirming);
    if (!keepFocus) titleEl.focus({ preventScroll: true });
  }
  function slide(dir) {
    if (still() || !bodyEl.animate) return;
    var go = { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' };
    [bodyEl, footEl].forEach(function (el) { el.animate([{ transform: 'translateX(' + dir * 28 + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }], go); });
  }
  function toLevel(l) {
    if (l === level) return;
    if (l === 'share') sheet.style.height = sheet.getBoundingClientRect().height + 'px';   // the sheet holds its height while drilling (check 10)
    level = l; confirming = false; draw(); slide(l === 'share' ? 1 : -1);
    tp.say(l === 'share' ? 'Save and share, details opened.' : 'Back to Your plan.');
    if (l === 'list') { var s = sheet.querySelector('#v2-sv-share'); if (s) s.focus({ preventScroll: true }); }
  }
  function open(from, done) {
    if (isOpen) return;
    isOpen = true; opener = from || document.activeElement; after = done || null; level = 'list'; confirming = false;
    overGame = phone.classList.contains('v2-playing');
    inertWas = [].filter.call(phone.children, function (el) { return el !== sheet && el !== scrim; }).map(function (el) { var was = el.inert; el.inert = true; return [el, was]; });
    // opened over the game, the layer has made everything else on the phone inert, this sheet included
    sheet.inert = false; scrim.inert = false;
    sheet.style.height = ''; sheet.style.transform = '';
    scrim.hidden = false; sheet.hidden = false;
    draw();
    if (!still() && sheet.animate) {
      scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
      sheet.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.2,.7,.2,1)' });
    } else if (sheet.animate) sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
    tp.say('Your plan opened. ' + count() + ' added.');
  }
  function close() {
    if (!isOpen) return;
    isOpen = false; clearTimeout(undoT); undo = null;
    inertWas.forEach(function (p) { p[0].inert = p[1]; }); inertWas = [];
    var done = function () { sheet.hidden = true; scrim.hidden = true; sheet.style.transform = ''; };
    if (!still() && sheet.animate) {
      scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' }).onfinish = function () { this.cancel(); };
      sheet.animate([{ transform: getComputedStyle(sheet).transform === 'none' ? 'none' : getComputedStyle(sheet).transform }, { transform: 'translateY(100%)' }], { duration: 240, easing: 'ease-in' }).onfinish = done;
    } else done();
    var o = opener, f = after; opener = null; after = null;
    if (f) f(); else { var t = o && o.isConnected && o.offsetParent ? o : (shownBtn() || mbtn); if (t && t.focus) t.focus({ preventScroll: true }); }
    tp.say('Your plan closed.');
  }
  function stepBack() { if (level === 'share') toLevel('list'); else if (confirming) { confirming = false; draw(true); var c = sheet.querySelector('#v2-sv-clear'); if (c) c.focus({ preventScroll: true }); } else close(); }
  sheet.querySelector('#v2-sv-x').addEventListener('click', close);
  backB.addEventListener('click', function () { toLevel('list'); });
  scrim.addEventListener('click', close);   // a tap outside closes it; on the confirm step that means Cancel (nothing is cleared)
  sheet.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); stepBack(); } });

  /* The grabber: a tap, a drag past a third of the height or a flick goes back one step; a shorter drag springs back */
  (function () {
    var y0 = null, t0 = 0, dy = 0, moved = false;
    grab.addEventListener('pointerdown', function (e) { y0 = e.clientY; t0 = e.timeStamp; dy = 0; moved = false; try { grab.setPointerCapture(e.pointerId); } catch (x) {} });
    grab.addEventListener('pointermove', function (e) { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); if (dy > 4) moved = true; if (moved) sheet.style.transform = 'translateY(' + dy + 'px)'; });
    function end(e) {
      if (y0 === null) return; var h = sheet.getBoundingClientRect().height, fast = dy > 24 && dy / Math.max(1, e.timeStamp - t0) > .6; y0 = null;
      if (!moved) return;   // a tap: the click does it
      if (dy > h / 3 || fast) { if (level === 'share') { sheet.style.transform = ''; toLevel('list'); } else close(); }
      else if (!still() && sheet.animate) { sheet.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' }); sheet.style.transform = ''; }
      else sheet.style.transform = '';
    }
    grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
    grab.addEventListener('click', function () { if (moved) { moved = false; return; } stepBack(); });
  })();

  /* ---------- Remove, Undo, Clear all ---------- */
  function offerUndo(items, msg) {
    clearTimeout(undoT); undo = { items: items, msg: msg };
    undoT = setTimeout(function () { undo = null; if (isOpen && level === 'list') draw(true); }, 8000);
  }
  sheet.addEventListener('click', function (e) {
    var t = e.target, rm = t.closest('[data-sv-rm]'), go = t.closest('[data-sv-go]');
    if (rm) {
      var id = rm.dataset.svRm, i = state.added.findIndex(function (x) { return x.id === id; }), r = rows().filter(function (x) { return x.id === id; })[0]; if (i < 0) return;
      var gone = state.added.splice(i, 1)[0];
      offerUndo([{ at: i, it: gone }], 'Removed ' + (r ? r.name : 'it') + '.');
      commit(); draw(true);
      var u = sheet.querySelector('#v2-sv-undo'); if (u) u.focus({ preventScroll: true });
      tp.say((r ? r.name : 'It') + ' removed from your plan. Undo is available.');
      return;
    }
    if (t.closest('#v2-sv-undo')) {
      if (!undo) return;
      undo.items.slice().sort(function (a, b) { return a.at - b.at; }).forEach(function (u) { state.added.splice(Math.min(u.at, state.added.length), 0, u.it); });
      var n = undo.items.length; clearTimeout(undoT); undo = null; commit(); draw();
      tp.say('Undone. ' + n + (n === 1 ? ' thing is' : ' things are') + ' back in your plan.');
      return;
    }
    if (t.closest('#v2-sv-clear')) { confirming = true; draw(true); sheet.querySelector('#v2-sv-cno').focus({ preventScroll: true }); return; }
    if (t.closest('#v2-sv-cno')) { confirming = false; draw(true); sheet.querySelector('#v2-sv-clear').focus({ preventScroll: true }); return; }
    if (t.closest('#v2-sv-cyes')) {
      var took = []; state.added.forEach(function (x, i) { if (isMine(x)) took.push({ at: i, it: x }); });
      state.added = state.added.filter(function (x) { return !isMine(x); });
      confirming = false; offerUndo(took, 'Your plan is cleared.'); commit(); draw(true);
      var u2 = sheet.querySelector('#v2-sv-undo'); if (u2) u2.focus({ preventScroll: true });
      tp.say('Your plan is cleared. Undo is available.');
      return;
    }
    if (t.closest('#v2-sv-share')) { toLevel('share'); return; }
    if (go) {
      var what = go.dataset.svGo; close();
      if (what === 'play' && window.v2Play) window.v2Play.open(document.querySelector('#tp-home-kick button.tp-home-cta'));
      if (what === 'places' && window.v2Play) window.v2Play.places(document.getElementById('v2-kick-places'));
      return;
    }
    shareClick(e);
  });

  /* ---------- Save & share: the older prototypes' options that work for a plain list ----------
     Carried over: Copy plan (plain, or worded for an AI assistant), Email (the send is pretend, as before), Add to
     maps (each place by name), Download table and Copy for a spreadsheet. Add to calendar is for watch parties only,
     the one kind of save with a date. Left out: the route through every stop and the day-by-day formats, which need
     days and an order. */
  var fmt = 'plain', openRow = '';
  function textOf(f) {
    var rs = rows(), t = team(), out = [], by = function (k) { return rs.filter(function (r) { return r.type === k; }); };
    out.push(f === 'ai' ? 'I am planning a trip to New South Wales for the Rugby World Cup 2027' + (t ? ', following ' + t : '') + '. These are the things I have saved. Help me fit them around the matches, and suggest what is missing.' : 'Your plan: Rugby World Cup 2027 in NSW' + (t ? ' (following ' + t + ')' : ''));
    [['Place', 'Places'], ['Watch party', 'Watch parties'], ['Article', 'Reading']].forEach(function (g) {
      var l = by(g[0]); if (!l.length) return;
      out.push('', g[1]);
      l.forEach(function (r) { out.push('- ' + r.name + ': ' + r.line + (r.type === 'Place' && r.place.travel ? '. ' + r.place.travel + ' (estimate)' : '')); });
    });
    return out.join('\n');
  }
  function table(sep) {
    var q = function (s) { s = String(s || ''); return sep === ',' ? '"' + s.replace(/"/g, '""') + '"' : s.replace(/\s+/g, ' '); };
    return [['Name', 'Type', 'Nearest host city', 'Fits around', 'Travel or location']].concat(rows().map(function (r) {
      var p = r.place;
      return [r.name, r.type, p ? CITY[p.host_city] : '', r.type === 'Article' ? '' : (r.type === 'Watch party' ? p.match.d + ': ' + p.match.t : r.line), p ? (p.kind === 'watch' ? p.location : (p.travel ? p.travel + ' (estimate)' : '')) : r.line];
    })).map(function (row) { return row.map(q).join(sep); }).join('\n');
  }
  function mapsUrl(r) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((r.place.kind === 'watch' ? r.place.location : r.name) + ', NSW, Australia'); }
  function calUrl(r) {
    var m = /(\d+) (\w+)/.exec(r.place.match.d), y = 2027, mo = MON[m[2]] + 1, d = +m[1], pad = function (n) { return (n < 10 ? '0' : '') + n; }, day = '' + y + pad(mo) + pad(d), dates;
    var k = r.fix && r.fix.k && /(\d+):(\d+)(am|pm)/.exec(r.fix.k);
    if (k) { var h = (+k[1] % 12) + (k[3] === 'pm' ? 12 : 0); dates = day + 'T' + pad(h) + k[2] + '00/' + day + 'T' + pad(Math.min(23, h + 2)) + k[2] + '00'; }
    else { var nx = new Date(Date.UTC(y, mo - 1, d + 1)); dates = day + '/' + nx.getUTCFullYear() + pad(nx.getUTCMonth() + 1) + pad(nx.getUTCDate()); }
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('Watch ' + r.place.match.t + ' at ' + r.name) + '&dates=' + dates + '&ctz=Australia%2FSydney&location=' + encodeURIComponent(r.place.location || r.name);
  }
  function srow(id, name, cap, expands) {
    var on = openRow === id;
    return '<li><button type="button" class="v2-ss-row" data-ss="' + id + '"' + (expands ? ' aria-expanded="' + (on ? 'true' : 'false') + '"' : '') + '><span class="v2-ss-text"><span class="v2-ss-name">' + name + '</span><span class="v2-ss-cap">' + cap + '</span></span><span class="v2-ss-state" data-ss-state="' + id + '" role="status"></span></button>' + (on ? panel(id) : '') + '</li>';
  }
  function panel(id) {
    var rs = rows();
    if (id === 'copy') return '<div class="v2-ss-panel"><div class="v2-ss-fmt" role="group" aria-label="Format">' + [['plain', 'Plain text'], ['ai', 'For AI assistant']].map(function (f) { return '<button type="button" class="tp-chip" data-ss-fmt="' + f[0] + '" aria-pressed="' + (fmt === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div>' +
      '<pre class="v2-ss-pre" id="v2-ss-pre" tabindex="0">' + esc(textOf(fmt)) + '</pre><button type="button" class="tp-home-cta" data-ss-do="copy">Copy</button></div>';
    if (id === 'mail') return '<div class="v2-ss-panel"><label class="visually-hidden" for="v2-ss-email">Email address</label><input class="cn-field v2-ss-field" id="v2-ss-email" type="email" autocomplete="email" placeholder="name@example.com" aria-describedby="v2-ss-err" />' +
      '<p class="v2-ss-err" id="v2-ss-err" role="alert" hidden>Enter an email like name@example.com</p><button type="button" class="tp-home-cta" data-ss-do="send">Send my plan</button></div>';
    if (id === 'maps') return '<ul class="v2-ss-links">' + rs.filter(function (r) { return r.place; }).map(function (r) { return '<li><a href="' + esc(mapsUrl(r)) + '" target="_blank" rel="noopener">' + esc(r.name) + '<span class="visually-hidden"> in Google Maps, opens in a new tab</span>' + ICON.go + '</a></li>'; }).join('') + '</ul>';
    if (id === 'cal') return '<ul class="v2-ss-links">' + rs.filter(function (r) { return r.type === 'Watch party'; }).map(function (r) { return '<li><a href="' + esc(calUrl(r)) + '" target="_blank" rel="noopener">' + esc(r.place.match.t + ', ' + r.place.match.d) + '<span class="visually-hidden"> in Google Calendar, opens in a new tab</span>' + ICON.go + '</a></li>'; }).join('') + '</ul>';
    return '';
  }
  function shareHtml() {
    var rs = rows(), places = rs.some(function (r) { return r.place; }), parties = rs.some(function (r) { return r.type === 'Watch party'; });
    return '<p class="v2-sv-note v2-sv-note--top">Saved on this device only. Keep a copy so you do not lose it.</p><ul class="v2-ss-list">' +
      srow('copy', 'Copy plan', 'Text for an AI assistant or your notes app.', true) +
      srow('mail', 'Email', 'Your plan comes as a PDF attachment.', true) +
      (places ? srow('maps', 'Add to maps', 'Open each place in Google Maps.', true) : '') +
      (parties ? srow('cal', 'Add to calendar', 'Watch parties only: they are the saves with a date.', true) : '') +
      srow('csv', 'Download table', 'A .csv for Excel, Sheets or Numbers.', false) +
      srow('tsv', 'Copy for a spreadsheet', 'Paste straight into cells.', false) + '</ul>';
  }
  function said(id, msg) { var s = sheet.querySelector('[data-ss-state="' + id + '"]'); if (s) { s.textContent = msg; setTimeout(function () { if (s.isConnected) s.textContent = ''; }, 4000); } tp.say(msg); }
  function copy(text, id, ok) {
    var fail = function () { var pre = sheet.querySelector('#v2-ss-pre'); if (pre) { var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } said(id, 'Copying was blocked. Select the text and copy it.'); };
    try { navigator.clipboard.writeText(text).then(function () { said(id, ok); }, fail); } catch (e) { fail(); }
  }
  function shareClick(e) {
    var t = e.target, row = t.closest('[data-ss]'), f = t.closest('[data-ss-fmt]'), act = t.closest('[data-ss-do]');
    if (f) { fmt = f.dataset.ssFmt; draw(true); sheet.querySelector('[data-ss-fmt="' + fmt + '"]').focus({ preventScroll: true }); return; }
    if (act) {
      if (act.dataset.ssDo === 'copy') copy(textOf(fmt), 'copy', 'Copied');
      if (act.dataset.ssDo === 'send') {
        var inp = sheet.querySelector('#v2-ss-email'), err = sheet.querySelector('#v2-ss-err'), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim());
        err.hidden = ok; inp.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok) { inp.focus(); return; }
        var to = inp.value.trim(); openRow = ''; draw(true); said('mail', 'Sent to ' + to); sheet.querySelector('[data-ss="mail"]').focus({ preventScroll: true });
      }
      return;
    }
    if (!row) return;
    var id = row.dataset.ss;
    if (id === 'csv') {
      try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([table(',')], { type: 'text/csv' })); a.download = 'your-plan.csv'; document.body.appendChild(a); a.click(); a.remove(); said('csv', 'Downloaded'); } catch (x) { said('csv', 'This browser blocked the download.'); }
      return;
    }
    if (id === 'tsv') { copy(table('\t'), 'tsv', 'Copied'); return; }
    openRow = openRow === id ? '' : id; draw(true);
    var again = sheet.querySelector('[data-ss="' + id + '"]'); if (again) again.focus({ preventScroll: true });
    if (openRow === 'mail') { var m = sheet.querySelector('#v2-ss-email'); if (m) m.focus({ preventScroll: true }); }
  }

  /* ---------- keeping everything in step ---------- */
  var layerN = null;
  function sync() {
    if (held === null) paintBtn(count());
    paintAdds();
    if (isOpen) { if (level === 'share' && !count()) level = 'list'; draw(true); }
  }
  phone.addEventListener('tp:state', sync);
  // a save or remove made inside the game arrives through storage; the page's own copy is merged first (v2-view.js)
  window.addEventListener('storage', function (e) { if (e.key === 'v2:tp-pick-v1') setTimeout(sync, 0); });
  window.v2Saved = {
    open: open, close: close, isOpen: function () { return isOpen; }, count: count,
    /* The game's layer opens and closes (v2-view.js): back on Home, the button bumps once if the count changed */
    layer: function (on) { if (on) { layerN = count(); return; } var was = layerN; layerN = null; setTimeout(function () { sync(); if (was !== null && count() !== was && count()) bump(); }, 320); }
  };
  sync();
})();
