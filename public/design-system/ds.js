/* DNSW Design System: the docs site. Rail and drawer, routing, search, and the blocks that read tokens from the code.
   Pages are HTML fragments in pages/; blocks inside them are placeholders with data-ds="..." that this file fills. */
(function () {
  'use strict';

  var BASE = '/design-system';
  var NAV = window.DS_NAV, T = window.DSTokens;
  var wide = window.matchMedia('(min-width: 841px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Icons (24px, stroke) ── */
  var P = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    home: '<path d="M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>',
    start: '<circle cx="12" cy="12" r="8.5"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
    book: '<path d="M5 4.5h10.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h10.5"/><path d="M9 4.5v6l2-1.5 2 1.5v-6"/>',
    palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.9-1 1.4-2.1-.6-1.2.1-2.4 1.5-2.4H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9-8.5-9z"/><circle cx="7.8" cy="11" r="1.2"/><circle cx="10.5" cy="7.5" r="1.2"/><circle cx="15" cy="8" r="1.2"/>',
    components: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="3.5"/><rect x="4" y="13" width="7" height="7" rx="3.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    patterns: '<path d="M12 4l8.5 4.5L12 13 3.5 8.5z"/><path d="M3.5 12.5L12 17l8.5-4.5"/><path d="M3.5 16.5L12 21l8.5-4.5"/>',
    brands: '<path d="M5 20.5V4"/><path d="M5 4.5h12l-2.5 4 2.5 4H5"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    pin: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    moon: '<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z"/>',
    out: '<path d="M14 4.5h5.5V10M19.5 4.5L11 13M17.5 14v5.5h-13v-13H10"/>'
  };
  function icon(n, cls) { return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + P[n] + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ── Routes: every page, flattened ── */
  var ROUTES = [], BY = {};
  NAV.forEach(function (sec) {
    var secPath = sec.id;
    add({ path: secPath, title: sec.title, lede: sec.lede, sec: sec, file: sec.id ? sec.id + '/index' : 'home', hero: true, art: sec.art || 'home' });
    (sec.pages || []).forEach(function (p) {
      var path = sec.id + '/' + p.id;
      add({ path: path, title: p.title, lede: p.lede, sec: sec, node: p, keywords: p.keywords, file: p.children ? path + '/index' : path });
      (p.children || []).forEach(function (c) {
        add({ path: path + '/' + c.id, title: c.title, lede: c.lede, sec: sec, node: c, parent: p, parentPath: path, keywords: c.keywords, file: path + '/' + c.id });
      });
    });
  });
  function add(r) { ROUTES.push(r); BY[r.path] = r; }
  function href(path) { return BASE + '/' + (path ? path : ''); }
  function current() {
    var p = location.pathname.replace(/\/index\.html$/, '');
    if (p.indexOf(BASE) === 0) p = p.slice(BASE.length);
    return p.replace(/^\/+|\/+$/g, '');
  }

  /* ── Rail ── */
  var rail = $('#ds-rail-list');
  rail.innerHTML = NAV.map(function (s) {
    return '<li><a class="ds-rail-link" href="' + href(s.id) + '" data-sec="' + s.id + '"><span class="ds-rail-ind">' + icon(s.icon) + '</span><span>' + esc(s.title) + '</span></a></li>';
  }).join('');
  $$('[data-ds-search]').forEach(function (b) { b.innerHTML = icon('search'); });
  $('#ds-menu-open').innerHTML = icon('menu');
  $('#ds-menu-close').innerHTML = icon('close');
  $('#ds-search-close').innerHTML = icon('close');
  $('.ds-search-ico').innerHTML = icon('search');

  /* ── Drawer ── */
  var drawer = $('#ds-drawer'), dBody = $('#ds-drawer-body'), dTitle = $('#ds-drawer-title'), scrim = $('#ds-scrim');
  var openGroups = {}, openSecs = {};
  function fold(id, open, inner) { return '<div class="ds-fold' + (open ? ' is-open' : '') + '" id="' + id + '"><div>' + inner + '</div></div>'; }
  function drawDrawer(route) {
    var cur = route ? route.path : '';
    var curSec = route ? route.sec.id : '';
    if (route && route.parent) openGroups[route.parentPath] = true;
    if (route && route.node && route.node.children) openGroups[route.path] = true;
    openSecs[curSec] = true;
    dBody.innerHTML = '<a class="ds-dlink ds-dhome" href="' + href('') + '"' + (cur === '' && route ? ' aria-current="page"' : '') + '>' + icon('home') + 'Home</a>' + NAV.filter(function (s) { return s.pages; }).map(function (s) {
      var list = '<ul class="ds-dlist">' +
        '<li><a class="ds-dlink" href="' + href(s.id) + '"' + (cur === s.id ? ' aria-current="page"' : '') + '>Overview</a></li>' +
        s.pages.map(function (p) {
          var path = s.id + '/' + p.id;
          if (!p.children) return '<li><a class="ds-dlink" href="' + href(path) + '"' + (cur === path ? ' aria-current="page"' : '') + '>' + esc(p.title) + '</a></li>';
          var open = !!openGroups[path], inGroup = cur === path || cur.indexOf(path + '/') === 0;
          var fid = 'ds-g-' + path.replace(/\//g, '-');
          return '<li><button type="button" class="ds-dgroup-btn' + (inGroup ? ' is-current-group' : '') + '" aria-expanded="' + open + '" aria-controls="' + fid + '" data-group="' + path + '">' + esc(p.title) + icon('chev', 'ds-chev') + '</button>' +
            fold(fid, open, '<ul class="ds-dlist">' +
              '<li><a class="ds-dlink" href="' + href(path) + '"' + (cur === path ? ' aria-current="page"' : '') + '>Overview</a></li>' +
              p.children.map(function (c) {
                var cp = path + '/' + c.id;
                return '<li><a class="ds-dlink" href="' + href(cp) + '"' + (cur === cp ? ' aria-current="page"' : '') + '>' + esc(c.title) + '</a></li>';
              }).join('') + '</ul>') + '</li>';
        }).join('') + '</ul>';
      var sid = 'ds-s-' + s.id, open = !!openSecs[s.id];
      return '<section class="ds-dsec" data-sec="' + s.id + '" aria-label="' + esc(s.title) + '">' +
        '<button type="button" class="ds-dgroup-btn ds-dsec-toggle" aria-expanded="' + open + '" aria-controls="' + sid + '" data-sec-toggle="' + s.id + '">' + icon(s.icon, 'ds-dsec-ico') + esc(s.title) + icon('chev', 'ds-chev') + '</button>' +
        fold(sid, open, list) + '</section>';
    }).join('');
    show(curSec);
  }
  var shownSec = '';
  function show(secId) {
    shownSec = secId;
    var sec = NAV.filter(function (s) { return s.id === secId; })[0];
    $$('.ds-dsec', dBody).forEach(function (el) { el.classList.toggle('is-shown', el.getAttribute('data-sec') === secId); });
    dTitle.textContent = wide.matches ? (sec && sec.pages ? sec.title : '') : 'Menu';
    $$('.ds-rail-link').forEach(function (a) { a.classList.toggle('is-peek', a.getAttribute('data-sec') === secId && !a.hasAttribute('aria-current')); });
  }
  dBody.addEventListener('click', function (e) {
    var g = e.target.closest('[data-group], [data-sec-toggle]');
    if (!g) return;
    var key = g.getAttribute('data-group') || g.getAttribute('data-sec-toggle');
    var bag = g.hasAttribute('data-group') ? openGroups : openSecs;
    var open = g.getAttribute('aria-expanded') !== 'true';
    bag[key] = open;
    g.setAttribute('aria-expanded', open);
    document.getElementById(g.getAttribute('aria-controls')).classList.toggle('is-open', open);
  });

  /* Pinned: the drawer sits beside the rail. Unpinned: it flies out over the page from the rail on hover or keyboard
     focus, and goes when the pointer or focus leaves both. A tap on the rail just goes to the section. */
  var pinBtn = $('#ds-pin');
  var pinned = store('ds-pin') !== '0';
  function setPin(on, save) {
    pinned = on;
    document.body.classList.toggle('ds-pinned', on);
    pinBtn.setAttribute('aria-pressed', on);
    pinBtn.setAttribute('aria-label', on ? 'Hide the page list' : 'Keep the page list open');
    pinBtn.title = pinBtn.getAttribute('aria-label');
    pinBtn.innerHTML = icon('pin');
    if (save) store('ds-pin', on ? '1' : '0');
    flyClose(true);
  }
  pinBtn.addEventListener('click', function () { setPin(!pinned, true); });

  var flyT = 0, flyOpen = false;
  function flyShow(secId) {
    clearTimeout(flyT);
    var sec = NAV.filter(function (s) { return s.id === secId; })[0];
    if (!sec || !sec.pages) { flyClose(true); return; }
    show(secId);
    if (!pinned || !routeNow.sec.pages) { drawer.classList.add('is-open'); flyOpen = true; }
  }
  function flyClose(now) {
    clearTimeout(flyT);
    var go = function () {
      drawer.classList.remove('is-open'); flyOpen = false; show(routeNow ? routeNow.sec.id : '');
    };
    if (now) go(); else flyT = setTimeout(go, 260);
  }
  var railEl = $('.ds-rail');
  rail.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch' || !wide.matches) return;
    var a = e.target.closest('.ds-rail-link');
    if (!a) return;
    clearTimeout(flyT);
    var id = a.getAttribute('data-sec');
    flyT = setTimeout(function () { flyShow(id); }, flyOpen || pinned ? 0 : 90);
  });
  [railEl, drawer].forEach(function (el) {
    el.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch' && wide.matches) flyClose(); });
    el.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch' && el === drawer) clearTimeout(flyT); });
  });
  var quietFocus = false;
  rail.addEventListener('focusin', function (e) {
    var a = e.target.closest('.ds-rail-link');
    if (quietFocus) { quietFocus = false; return; }
    if (a && a.matches(':focus-visible') && wide.matches) flyShow(a.getAttribute('data-sec'));
  });
  rail.addEventListener('keydown', function (e) {
    var a = e.target.closest('.ds-rail-link');
    if (!a) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var links = $$('.ds-rail-link'), i = links.indexOf(a);
      var n = links[(i + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length];
      n.focus(); e.preventDefault();
    } else if (e.key === 'ArrowRight' && wide.matches) {
      flyShow(a.getAttribute('data-sec'));
      var first = $('.ds-dsec.is-shown .ds-dlink, .ds-dsec.is-shown .ds-dgroup-btn:not(.ds-dsec-toggle)', dBody);
      if (first) { first.focus(); e.preventDefault(); }
    } else if (e.key === 'Escape' && flyOpen) flyClose(true);
  });
  document.addEventListener('focusin', function (e) {
    if (!wide.matches) return;
    if (!railEl.contains(e.target) && !drawer.contains(e.target) && (flyOpen || shownSec !== (routeNow && routeNow.sec.id))) flyClose(true);
  });
  drawer.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!wide.matches) { menuClose(); return; }
      var back = $('.ds-rail-link[data-sec="' + shownSec + '"]');
      flyClose(true);
      if (back) { quietFocus = true; back.focus(); }
    } else if (e.key === 'ArrowLeft' && wide.matches) {
      var r = $('.ds-rail-link[data-sec="' + shownSec + '"]');
      if (r) { r.focus(); e.preventDefault(); }
    }
  });

  /* Phone: the drawer is a sheet from the left with every section; the page behind is inert while it is open */
  var menuBtn = $('#ds-menu-open'), opener = null;
  function menuOpen() {
    opener = document.activeElement;
    drawer.classList.add('is-open');
    scrim.hidden = false; void scrim.offsetWidth; scrim.classList.add('is-on');
    menuBtn.setAttribute('aria-expanded', 'true');
    $('#ds-main').inert = true; $('.ds-topbar').inert = true;
    drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true');
    show(routeNow.sec.id);
    var cur = $('[aria-current="page"]', dBody) || $('#ds-menu-close');
    setTimeout(function () { cur.focus(); cur.scrollIntoView({ block: 'nearest' }); }, 30);
  }
  function menuClose(noFocus) {
    if (!drawer.classList.contains('is-open') || wide.matches) return;
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-on');
    setTimeout(function () { if (!drawer.classList.contains('is-open')) scrim.hidden = true; }, 240);
    menuBtn.setAttribute('aria-expanded', 'false');
    $('#ds-main').inert = false; $('.ds-topbar').inert = false;
    drawer.removeAttribute('role'); drawer.removeAttribute('aria-modal');
    if (!noFocus && opener && opener.focus) opener.focus();
  }
  menuBtn.addEventListener('click', menuOpen);
  $('#ds-menu-close').addEventListener('click', function () { menuClose(); });
  scrim.addEventListener('click', function () { if (wide.matches) flyClose(true); else menuClose(); });
  function onWide() {
    drawer.classList.remove('is-open'); scrim.classList.remove('is-on'); scrim.hidden = true; flyOpen = false;
    $('#ds-main').inert = false; $('.ds-topbar').inert = false; drawer.removeAttribute('role'); drawer.removeAttribute('aria-modal');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (routeNow) show(routeNow.sec.id);
  }
  wide.addEventListener('change', onWide);

  /* Colour scheme for the docs (examples keep their brand's own colours) */
  var schemeBtn = $('#ds-scheme'), sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  function isDark() { var a = document.documentElement.getAttribute('data-ds-scheme'); return a ? a === 'dark' : sysDark.matches; }
  function drawScheme() {
    var d = isDark();
    schemeBtn.innerHTML = icon(d ? 'sun' : 'moon');
    schemeBtn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
    schemeBtn.title = schemeBtn.getAttribute('aria-label');
  }
  schemeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-ds-scheme', next); store('ds-scheme', next); drawScheme();
  });
  sysDark.addEventListener('change', drawScheme);
  drawScheme();

  /* ── Hero art: blocks and goal lines in the brands' own colours ── */
  var ART = {
    home: ['#111111', [['r', 0, 0, 300, 480, '#ff4802'], ['r', 300, 0, 300, 240, '#ecfe54'], ['r', 300, 240, 300, 240, '#faf7f0'], ['c', 300, 240, 150, '#005EA2'], ['r', 0, 360, 300, 12, '#111111'], ['r', 300, 120, 300, 4, '#111111'], ['q', 600, 480, 180, '#00563C']]],
    start: ['#faf7f0', [['r', 0, 0, 600, 200, '#111111'], ['c', 170, 300, 150, '#ff4802'], ['r', 340, 200, 260, 280, '#ac54ff'], ['r', 340, 330, 260, 12, '#faf7f0'], ['c', 470, 100, 60, '#ecfe54']]],
    foundations: ['#00563C', [['r', 0, 0, 260, 480, '#faf7f0'], ['r', 0, 300, 260, 12, '#111111'], ['c', 430, 160, 110, '#ecfe54'], ['r', 260, 330, 340, 150, '#111111'], ['q', 0, 0, 200, '#ff4802']]],
    styles: ['#111111', [['r', 0, 0, 200, 240, '#ff4802'], ['r', 200, 0, 200, 240, '#009953'], ['r', 400, 0, 200, 240, '#ac54ff'], ['r', 0, 240, 200, 240, '#a3726d'], ['r', 200, 240, 200, 240, '#ecfe54'], ['r', 400, 240, 200, 240, '#faf7f0'], ['c', 400, 240, 70, '#005EA2']]],
    components: ['#ac54ff', [['r', 40, 40, 240, 160, '#faf7f0'], ['r', 320, 40, 240, 70, '#111111'], ['r', 320, 130, 240, 70, '#ecfe54'], ['c', 160, 340, 110, '#ff4802'], ['r', 320, 240, 240, 200, '#faf7f0'], ['r', 320, 330, 240, 8, '#111111']]],
    patterns: ['#faf7f0', [['r', 0, 0, 600, 160, '#ff4802'], ['r', 0, 160, 600, 160, '#ecfe54'], ['r', 0, 320, 600, 160, '#111111'], ['c', 150, 160, 90, '#ac54ff'], ['c', 450, 320, 90, '#009953'], ['r', 0, 236, 600, 8, '#111111']]],
    brands: ['#faf7f0', [['r', 0, 0, 150, 480, '#005EA2'], ['r', 150, 0, 150, 480, '#00563C'], ['r', 300, 0, 150, 480, '#ff4802'], ['r', 450, 0, 150, 480, '#d9d9d9'], ['c', 300, 240, 100, '#ecfe54'], ['r', 0, 236, 600, 8, '#111111']]]
  };
  function art(key) {
    var a = ART[key] || ART.home;
    var s = '<svg viewBox="0 0 600 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="600" height="480" fill="' + a[0] + '"/>';
    a[1].forEach(function (x) {
      if (x[0] === 'r') s += '<rect x="' + x[1] + '" y="' + x[2] + '" width="' + x[3] + '" height="' + x[4] + '" fill="' + x[5] + '"/>';
      if (x[0] === 'c') s += '<circle cx="' + x[1] + '" cy="' + x[2] + '" r="' + x[3] + '" fill="' + x[4] + '"/>';
      if (x[0] === 'q') s += '<circle cx="' + x[1] + '" cy="' + x[2] + '" r="' + x[3] + '" fill="' + x[4] + '"/>';
    });
    return s + '</svg>';
  }

  /* ── Brand chosen for examples and token tables (kept between pages and visits) ── */
  var brandId = store('ds-brand') || 'third-half';
  var cwId = store('ds-colourway') || 'orange';
  if (!T.brand(brandId)) brandId = 'third-half';

  /* ── Router ── */
  var page = $('#ds-page'), live = $('#ds-live'), routeNow = null, frags = {}, seq = 0;
  function fetchFrag(file) {
    if (!frags[file]) frags[file] = fetch(BASE + '/pages/' + file + '.html', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    });
    return frags[file];
  }

  function go(path, opts) {
    opts = opts || {};
    var route = BY[path];
    var my = ++seq;
    var title = route ? route.title : 'Page not found';
    (route ? fetchFrag(route.file) : Promise.reject()).catch(function () {
      return route ? '<p>This page has not been written yet.</p>' : '<p>There is no page at this address. Try <a href="' + href('') + '">Home</a> or search.</p>';
    }).then(function (html) {
      if (my !== seq) return;
      routeNow = route || { path: path, title: title, sec: NAV[0] };
      document.title = (route && route.path ? title + ' · ' : '') + 'DNSW Design System';
      page.innerHTML = head(routeNow) + '<div class="ds-layout"><article class="ds-content" id="ds-content">' + html + '</article><aside class="ds-toc" aria-label="On this page"></aside></div>' + foot(routeNow);
      $$('.ds-rail-link').forEach(function (a) {
        if (a.getAttribute('data-sec') === routeNow.sec.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
      document.body.classList.toggle('ds-no-pages', !routeNow.sec.pages);
      drawDrawer(route);
      if (!wide.matches) menuClose(true);
      else if (flyOpen) flyClose(true);
      enhance(page);
      toc();
      if (opts.anim && !reduce.matches) { page.classList.remove('is-entering'); void page.offsetWidth; page.classList.add('is-entering'); }
      if (opts.hash) { var t = document.getElementById(opts.hash); if (t) t.scrollIntoView(); }
      else if (opts.scroll !== false) window.scrollTo(0, 0);
      if (opts.focus) { var h = $('h1', page); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } live.textContent = title; }
    });
  }

  function head(r) {
    if (r.hero) {
      return '<header class="ds-hero"><div class="ds-hero-text"><h1>' + esc(r.path ? r.title : 'DNSW Design System') + '</h1><p class="ds-lede">' + esc(r.lede) + '</p></div><div class="ds-hero-art">' + art(r.art) + '</div></header>';
    }
    var crumbs = '<li><a href="' + href(r.sec.id) + '">' + esc(r.sec.title) + '</a></li>';
    if (r.parent) crumbs += '<li><a href="' + href(r.parentPath) + '">' + esc(r.parent.title) + '</a></li>';
    return '<header class="ds-head"><ol class="ds-crumbs" aria-label="Breadcrumb">' + crumbs + '</ol><h1>' + esc(r.title) + '</h1>' + (r.lede ? '<p class="ds-lede">' + esc(r.lede) + '</p>' : '') + '</header>';
  }
  function foot(r) {
    var i = ROUTES.indexOf(BY[r.path]), next = ROUTES[i + 1];
    return '<footer class="ds-foot"><span>Read live from the code in <code>public/wireframes/</code>. Built for WCAG 2.2 AA.</span>' +
      (next ? '<a href="' + href(next.path) + '">Next: ' + esc(next.title) + '</a>' : '') + '</footer>';
  }

  function toc() {
    var hs = $$('#ds-content > h2');
    var aside = $('.ds-toc', page), layout = $('.ds-layout', page);
    if (hs.length < 3) { aside.remove(); return; }
    layout.classList.add('has-toc');
    hs.forEach(function (h) { if (!h.id) h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); });
    aside.innerHTML = '<p class="ds-toc-t">On this page</p><ul>' + hs.map(function (h) { return '<li><a href="#' + h.id + '">' + esc(h.textContent) + '</a></li>'; }).join('') + '</ul>';
    if ('IntersectionObserver' in window) {
      var links = $$('a', aside);
      var io = new IntersectionObserver(function () {
        var top = 0;
        hs.forEach(function (h, i) { if (h.getBoundingClientRect().top < window.innerHeight * 0.3) top = i; });
        links.forEach(function (a, i) { a.classList.toggle('is-here', i === top); });
      }, { rootMargin: '0px 0px -60% 0px' });
      hs.forEach(function (h) { io.observe(h); });
    }
  }

  /* Links inside the site go through the router; anchors on the page just scroll */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) {
      e.preventDefault();
      var t = document.getElementById(url.hash.slice(1));
      if (t) { history.pushState(null, '', url.hash); t.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' }); }
      return;
    }
    if (url.pathname.indexOf(BASE) !== 0 || /\.(html|css|js)$/.test(url.pathname) && !/index\.html$/.test(url.pathname)) return;
    e.preventDefault();
    history.pushState(null, '', url.pathname + url.hash);
    var path = url.pathname.slice(BASE.length).replace(/^\/+|\/+$/g, '');
    go(path, { focus: true, anim: true, hash: url.hash.slice(1) });
  });
  window.addEventListener('popstate', function () { go(current(), { scroll: false }); });

  /* ── Search: pages, then tokens by name ── */
  var dlg = $('#ds-search'), sIn = $('#ds-search-input'), sOut = $('#ds-search-results'), sOpener = null, sSel = -1, tokenNames = null;
  function openSearch() {
    sOpener = document.activeElement;
    if (!wide.matches) menuClose(true);
    dlg.showModal(); sIn.value = ''; results(''); sIn.focus();
    if (!tokenNames) T.load('wireframe').then(function (set) { tokenNames = set.order; });
  }
  function results(q) {
    q = q.trim().toLowerCase();
    var hits = ROUTES.map(function (r) {
      if (!q) return { r: r, s: !r.parent && r.node ? 1 : 0 };
      var t = r.title.toLowerCase();
      var s = t === q ? 4 : t.indexOf(q) === 0 ? 3 : t.indexOf(q) >= 0 ? 2 : ((r.keywords || '') + ' ' + (r.lede || '') + ' ' + r.sec.title).toLowerCase().indexOf(q) >= 0 ? 1 : 0;
      return { r: r, s: s };
    }).filter(function (x) { return x.s; }).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.r; }).slice(0, 12).map(function (r) {
      return { href: href(r.path), t: r.title, p: r.sec.title + (r.parent ? ' / ' + r.parent.title : '') };
    });
    if (q.indexOf('--') === 0 || (q.length > 2 && tokenNames)) {
      (tokenNames || []).filter(function (n) { return n.indexOf(q.replace(/^-*/, '')) >= 0; }).slice(0, 6).forEach(function (n) {
        var where = /^--(c-|color-)/.test(n) ? 'styles/colour' : /^--(fs|fw|font)/.test(n) ? 'styles/typography' : /^--space/.test(n) ? 'styles/spacing' : /^--(radius|bw|border)/.test(n) ? 'styles/shape' : /^--(shadow|z)/.test(n) ? 'styles/elevation' : /^--(dur|ease)/.test(n) ? 'styles/motion' : 'styles';
        hits.push({ href: href(where), t: n, p: 'Token in ' + BY[where].title });
      });
    }
    sSel = hits.length ? 0 : -1;
    sOut.innerHTML = hits.length ? hits.map(function (h, i) {
      return '<li role="option" id="ds-sr-' + i + '" aria-selected="' + (i === 0) + '"><a href="' + h.href + '" tabindex="-1"><span class="ds-sr-t">' + esc(h.t) + '</span><span class="ds-sr-p">' + esc(h.p) + '</span></a></li>';
    }).join('') : '<li class="ds-search-empty">Nothing matches “' + esc(q) + '”.</li>';
    sIn.setAttribute('aria-activedescendant', sSel >= 0 ? 'ds-sr-0' : '');
  }
  function pick(i) {
    var opts = $$('[role="option"]', sOut);
    if (!opts.length) return;
    sSel = (i + opts.length) % opts.length;
    opts.forEach(function (o, j) { o.setAttribute('aria-selected', j === sSel); });
    opts[sSel].scrollIntoView({ block: 'nearest' });
    sIn.setAttribute('aria-activedescendant', opts[sSel].id);
  }
  sIn.addEventListener('input', function () { results(sIn.value); });
  sIn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { pick(sSel + 1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { pick(sSel - 1); e.preventDefault(); }
    else if (e.key === 'Escape') { e.preventDefault(); dlg.close(); }
    else if (e.key === 'Enter') { e.preventDefault(); var o = $$('[role="option"] a', sOut)[sSel]; if (o) { dlg.close(); o.click(); } }
  });
  sOut.addEventListener('click', function (e) { if (e.target.closest('a')) { sOpener = null; dlg.close(); } });
  $('#ds-search-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (sOpener && sOpener.focus) sOpener.focus(); });
  $$('[data-ds-search]').forEach(function (b) { b.addEventListener('click', openSearch); });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !dlg.open && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape' && drawer.classList.contains('is-open') && !wide.matches) menuClose();
  });

  /* ── Blocks that read the code ── */
  var BRANDED = '[data-ds="swatches"],[data-ds="tokens"],[data-ds="type"],[data-ds="space"],[data-ds="radius"],[data-ds="shadow"],[data-ds="motion"],[data-ds="example"]';
  function enhance(root) {
    $$('[data-ds="cards"]', root).forEach(cards);
    $$('[data-ds="icons"]', root).forEach(icons);
    $$('[data-ds="brands"]', root).forEach(brandList);
    var branded = $$(BRANDED, root).filter(function (el) { return !el.hasAttribute('data-brand'); });
    if (branded.length) {
      var bar = document.createElement('div');
      bar.className = 'ds-brandbar';
      $('#ds-content').insertBefore(bar, $('#ds-content').firstChild);
      brandBar(bar);
    }
    paint(root);
  }
  function paint(root) {
    $$(BRANDED, root).forEach(function (el) {
      var b = el.getAttribute('data-brand') || brandId, cw = el.getAttribute('data-colourway') || (b === 'third-half' ? cwId : '');
      var kind = el.getAttribute('data-ds');
      if (kind === 'example') return example(el, b, cw);
      T.load(b, cw).then(function (set) { BLOCKS[kind](el, set, b); }).catch(function (err) {
        el.innerHTML = '<p class="ds-note ds-note--warn">Could not read the tokens (' + esc(err.message) + ').</p>';
      });
    });
  }

  function brandBar(bar) {
    var b = T.brand(brandId);
    bar.innerHTML = '<label>Brand <select class="ds-select" id="ds-brand">' + T.BRANDS.map(function (x) {
      return '<option value="' + x.id + '"' + (x.id === brandId ? ' selected' : '') + '>' + esc(x.name) + '</option>';
    }).join('') + '</select></label>' +
      (b.colourways ? '<label>Colourway <select class="ds-select" id="ds-cw">' + b.colourways.map(function (c) {
        return '<option value="' + c.id + '"' + (c.id === cwId ? ' selected' : '') + '>' + esc(c.name) + '</option>';
      }).join('') + '</select></label>' : '') +
      '<span class="ds-brandbar-note">' + esc(brandNote(b)) + '</span>';
    $('#ds-brand', bar).addEventListener('change', function (e) {
      brandId = e.target.value; store('ds-brand', brandId); brandBar(bar); paint(page);
      live.textContent = 'Showing ' + T.brand(brandId).name;
      $('#ds-brand', bar).focus();
    });
    var cw = $('#ds-cw', bar);
    if (cw) cw.addEventListener('change', function (e) {
      cwId = e.target.value; store('ds-colourway', cwId); paint(page);
      live.textContent = 'Showing the ' + e.target.selectedOptions[0].text + ' colourway';
    });
  }
  function brandNote(b) {
    if (b.id === 'wireframe') return 'The base. Every other brand builds on these values.';
    if (b.id === 'third-half') return 'Sets the prototype roles. Values marked Brand are its own; the rest come from Wireframe.';
    return b.name + ' sets page tokens (--color-*) only. Prototype roles fall back to Wireframe.';
  }

  /* One value per token, with the chain it resolved through */
  function val(set, n) { return T.resolve(set, n); }
  function chain(r) { return r.chain.length > 1 ? '<span class="ds-chain">via ' + r.chain.slice(1).map(function (c) { return '<code>' + esc(c) + '</code>'; }).join(' → ') + '</span>' : ''; }
  function names(el, set) {
    var list = (el.getAttribute('data-tokens') || '').split(/\s+/).filter(Boolean);
    var pre = el.getAttribute('data-prefix');
    if (pre) pre.split(/\s+/).forEach(function (p) { set.order.forEach(function (n) { if (n.indexOf(p) === 0 && list.indexOf(n) < 0) list.push(n); }); });
    var own = el.hasAttribute('data-own');
    return list.filter(function (n) { return set.map[n] && (!own || set.own.indexOf(n) >= 0); });
  }
  function ownTag(set, n, b) { var d = set.map[n]; return d && d.from === b && b !== 'wireframe' ? '<span class="ds-own" title="Set by this brand">Brand</span>' : ''; }
  function ratio(x) { return x ? (Math.floor(x * 10) / 10).toFixed(1) + ':1' : ''; }

  var BLOCKS = {
    swatches: function (el, set, b) {
      var on = el.getAttribute('data-on'), text = el.getAttribute('data-text');
      var bgOn = on ? val(set, on).value : '', fgText = text ? val(set, text).value : '';
      el.innerHTML = '<ul class="ds-swatches">' + names(el, set).map(function (n) {
        var r = val(set, n), d = set.map[n], c = '', label = '';
        if (on) { c = T.contrast(r.value, bgOn); label = c && T.hex(r.value) !== T.hex(bgOn) ? ratio(c) + (c >= 4.5 ? ' AA' : c >= 3 ? ' AA large' : ' Fails') : ''; }
        if (text) { c = T.contrast(fgText, r.value); label = c ? 'Text ' + ratio(c) + (c >= 4.5 ? ' AA' : c >= 3 ? ' AA large' : ' Fails') : ''; }
        return '<li class="ds-swatch' + (d.from === b && b !== 'wireframe' ? ' is-own' : '') + '"><div class="ds-swatch-chip"><span class="ds-swatch-fill" style="background:' + esc(r.value) + '"></span>' +
          (label ? '<span class="ds-swatch-aa">' + esc(label) + '</span>' : '') + '</div>' +
          '<div class="ds-swatch-body">' + (el.getAttribute('data-label') ? '<span class="ds-swatch-label">' + esc(el.getAttribute('data-label')) + '</span>' : '') + '<code>' + esc(n) + '</code>' + ownTag(set, n, b) + '<div class="ds-swatch-v">' + esc(T.hex(r.value)) + '</div>' + chain(r) +
          (d.note ? '<div class="ds-swatch-n">' + esc(d.note) + '</div>' : '') + '</div></li>';
      }).join('') + '</ul>';
    },
    tokens: function (el, set, b) {
      el.innerHTML = '<div class="ds-table-wrap"><table class="ds-table"><thead><tr><th scope="col">Token</th><th scope="col">Value</th><th scope="col">Use</th></tr></thead><tbody>' +
        names(el, set).map(function (n) {
          var r = val(set, n), d = set.map[n];
          return '<tr><td><code>' + esc(n) + '</code>' + ownTag(set, n, b) + '</td><td><code>' + esc(r.value) + '</code>' + chain(r) + '</td><td>' + esc(d.note) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    },
    type: function (el, set, b) {
      var font = val(set, el.getAttribute('data-font') || '--font-body').value;
      var sample = el.getAttribute('data-sample') || 'Plan your 3rd half around your team';
      el.innerHTML = '<div class="ds-spec">' + names(el, set).map(function (n) {
        var r = val(set, n);
        var px = /rem$/.test(r.value) ? ' (' + Math.round(parseFloat(r.value) * 16 * 100) / 100 + 'px)' : '';
        var isW = /^--fw/.test(n), isF = /^--font/.test(n);
        var style = isF ? 'font-family:' + r.value + ';font-size:1.5rem' : isW ? 'font-family:' + font + ';font-size:1.5rem;font-weight:' + r.value : 'font-family:' + font + ';font-size:' + r.value + ';line-height:1.25';
        return '<div class="ds-spec-row"><div class="ds-spec-meta"><code>' + esc(n) + '</code>' + ownTag(set, n, b) + '<div>' + esc(r.value) + px + '</div>' + chain(r) + '</div><div class="ds-spec-sample" style="' + esc(style) + '">' + esc(isF ? 'Aa Bb 0123 Kick-off 7:30pm' : sample) + '</div></div>';
      }).join('') + '</div>';
      fontsFor(b);
    },
    space: function (el, set, b) {
      el.innerHTML = '<div class="ds-spec">' + names(el, set).map(function (n) {
        var r = val(set, n), px = /rem$/.test(r.value) ? parseFloat(r.value) * 16 : parseFloat(r.value);
        return '<div class="ds-spec-row"><div class="ds-spec-meta"><code>' + esc(n) + '</code>' + ownTag(set, n, b) + '<div>' + esc(r.value) + (/rem$/.test(r.value) ? ' (' + px + 'px)' : '') + '</div></div><div class="ds-spec-sample"><div class="ds-bar" style="width:' + esc(r.value) + '"></div></div></div>';
      }).join('') + '</div>';
    },
    radius: function (el, set, b) {
      el.innerHTML = '<div class="ds-spec">' + names(el, set).map(function (n) {
        var r = val(set, n), isB = /^--bw/.test(n), d = set.map[n];
        var box = isB ? '<div class="ds-radius-box" style="border-width:' + esc(r.value) + ';border-radius:12px"></div>' : '<div class="ds-radius-box" style="border-radius:' + esc(r.value) + '"></div>';
        return '<div class="ds-spec-row"><div class="ds-spec-meta"><code>' + esc(n) + '</code>' + ownTag(set, n, b) + '<div>' + esc(r.value) + '</div>' + chain(r) + (d.note ? '<div>' + esc(d.note) + '</div>' : '') + '</div><div class="ds-spec-sample">' + box + '</div></div>';
      }).join('') + '</div>';
    },
    shadow: function (el, set, b) {
      el.innerHTML = '<div class="ds-spec">' + names(el, set).map(function (n) {
        var r = val(set, n), d = set.map[n], isZ = /^--z/.test(n);
        return '<div class="ds-spec-row"><div class="ds-spec-meta"><code>' + esc(n) + '</code>' + ownTag(set, n, b) + '<div>' + esc(r.value) + '</div>' + chain(r) + (d.note ? '<div>' + esc(d.note) + '</div>' : '') + '</div><div class="ds-spec-sample">' + (isZ ? '<span class="ds-muted">Layer ' + esc(r.value) + '</span>' : '<div class="ds-shadow-box" style="box-shadow:' + esc(r.value) + '"></div>') + '</div></div>';
      }).join('') + '</div>';
    },
    motion: function (el, set, b) {
      var dur = val(set, '--dur-large').value || '320ms';
      el.innerHTML = '<div class="ds-spec">' + names(el, set).map(function (n) {
        var r = val(set, n), d = set.map[n], isE = /^--ease/.test(n);
        var t = isE ? 'left ' + dur + ' ' + r.value : 'left ' + r.value + ' ' + (val(set, '--ease-out').value || 'ease-out');
        return '<div class="ds-spec-row"><div class="ds-spec-meta"><code>' + esc(n) + '</code>' + ownTag(set, n, b) + '<div>' + esc(r.value) + '</div>' + (d.note ? '<div>' + esc(d.note) + '</div>' : '') + '</div><div class="ds-spec-sample"><button type="button" class="ds-btn" data-play aria-label="Play ' + esc(n) + '">Play</button> <div class="ds-motion-track" style="margin-top:8px"><span class="ds-motion-dot" style="transition:' + esc(t) + '"></span></div></div></div>';
      }).join('') + '</div>';
      $$('[data-play]', el).forEach(function (btn) {
        btn.addEventListener('click', function () { var tr = btn.parentNode.querySelector('.ds-motion-track'); tr.classList.toggle('is-run'); btn.textContent = tr.classList.contains('is-run') ? 'Play back' : 'Play'; });
      });
    }
  };

  /* The stand-in fonts the Third Half theme loads, so type samples render in them here too */
  var fontsDone = false;
  function fontsFor(b) {
    if (fontsDone || b !== 'third-half') return;
    fontsDone = true;
    T.fetchText('/wireframes/themes/hifi.css').then(function (css) {
      var faces = css.match(/@font-face\s*\{[^}]+\}/g) || [];
      var st = document.createElement('style');
      st.textContent = faces.join('\n').replace(/url\('\.\.\//g, "url('/wireframes/");
      document.head.appendChild(st);
    });
  }

  /* Live examples: frame.html draws the markup with the prototypes' own CSS, in the chosen brand */
  var frameN = 0;
  function example(el, b, cw) {
    var id = el.getAttribute('data-ex');
    var src = BASE + '/frame.html?ex=' + encodeURIComponent(id) + '&brand=' + b + (cw ? '&cw=' + cw : '');
    var f = $('iframe', el);
    if (!f) {
      el.classList.add('ds-example');
      var fid = 'ds-f' + (++frameN);
      el.innerHTML = '<iframe class="ds-example-frame" id="' + fid + '" title="' + esc(el.getAttribute('data-title') || 'Live example') + '" loading="lazy"></iframe>' +
        (el.getAttribute('data-caption') ? '<div class="ds-example-cap"><span>' + el.getAttribute('data-caption') + '</span></div>' : '');
      f = $('iframe', el);
    }
    if (f.getAttribute('src') !== src) f.setAttribute('src', src);
  }
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || !e.data.dsFrameH) return;
    $$('.ds-example-frame').forEach(function (f) { if (f.contentWindow === e.source) f.style.height = Math.ceil(e.data.dsFrameH) + 'px'; });
  });

  /* Cards for a section's pages (or a group's children) */
  function cards(el) {
    var secId = el.getAttribute('data-section'), group = el.getAttribute('data-group');
    var items;
    if (el.hasAttribute('data-sections')) items = NAV.filter(function (s) { return s.pages; }).map(function (s) { return { path: s.id, title: s.title, lede: s.lede }; });
    else if (group) items = (BY[group].node.children || []).map(function (c) { return { path: group + '/' + c.id, title: c.title, lede: c.lede }; });
    else {
      var sec = NAV.filter(function (s) { return s.id === (secId || routeNow.sec.id); })[0];
      items = sec.pages.map(function (p) { return { path: sec.id + '/' + p.id, title: p.title, lede: p.lede }; });
    }
    el.innerHTML = '<ul class="ds-cards' + (el.hasAttribute('data-sections') ? ' ds-cards--home' : '') + '">' + items.map(function (it) {
      return '<li><a class="ds-card" href="' + href(it.path) + '"><span class="ds-card-t">' + esc(it.title) + '</span><span class="ds-card-l">' + esc(it.lede) + '</span>' + icon('arrow', 'ds-card-go') + '</a></li>';
    }).join('') + '</ul>';
  }

  /* The prototype icon set, read from concepts-teams.js */
  function icons(el) {
    T.loadIcons().then(function (set) {
      el.innerHTML = '<ul class="ds-icons">' + Object.keys(set).map(function (k) { return '<li>' + set[k] + '<code>' + esc(k) + '</code></li>'; }).join('') + '</ul>';
    }).catch(function () { el.innerHTML = '<p class="ds-note ds-note--warn">Could not read the icon set.</p>'; });
  }

  /* Brands table */
  function brandList(el) {
    el.innerHTML = '<div class="ds-table-wrap"><table class="ds-table"><thead><tr><th scope="col">Brand</th><th scope="col">Owner</th><th scope="col">Status</th><th scope="col">File</th></tr></thead><tbody>' +
      T.BRANDS.map(function (b) {
        return '<tr><td><a href="' + href('brands/' + b.id) + '">' + esc(b.name) + '</a></td><td>' + esc(b.owner) + '</td><td><span class="ds-status' + (/Draft|Concept/.test(b.status) ? ' ds-status--draft' : '') + '">' + esc(b.status) + '</span></td><td><code>' + esc(b.file.replace(/^\//, 'public/')) + '</code></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ── Start ── */
  setPin(pinned, false);
  var start = current();
  if (start && !BY[start]) start = start.replace(/\/$/, '');
  go(start, { hash: location.hash.slice(1) });
})();
