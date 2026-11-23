/* Home (19 Nov 2026, Figma 385:649, built in this prototype's own styles): the first tab of the Pick your team
   prototype. The hand of cards is the planner's own, lent here by the capsule script (prototype-pick-your-team.html),
   so this file only builds what is Home's alone:
   - the jumps (Plan your 3rd half to the hand, See all FAQs to the FAQs), which say where they go (check 8);
   - Plan around your matches, shown once anything is picked: the planner, at Your days;
   - Where the matches are: a cut-down planner map with the three NSW stadiums (each opens its host city sheet,
     concepts-third-half.js pmCity) and a few regions within reach, shown lightly; one card per stadium;
   - the FAQs (answers supplied 22 Nov), the updates sign-up and Share this page. */
(function () {
  'use strict';
  var tp = window.tpPicker, GEO = window.cnGeo;
  var home = document.getElementById('tp-home');
  /* The kick game is called Drop goal, shown as Play on phones (22 Nov, user's call; Play came in on 21 Nov, F-034). On
     phones the capsule and Home's section heading say Play, and the tab's own h2 Play Drop Goal (23 Nov); on the desktop website the
     capsule says Play Drop Goal and the headings Drop Goal. The tab's section, its frame and Home's still are named Drop
     goal for screen readers; the capsule and headings are read as shown (WCAG 2.5.3). The page title follows the capsule.
     Set here, before the capsule measures its tabs */
  (function () {
    var W = window.TP_WORDS || {}, name = W.play; if (!name) return;
    var both = function (el, phone, desk) { if (!el) return; var ph = el.querySelector('.tp-cap-phone, .tp-on-phone'), dk = el.querySelector('.tp-cap-desk, .tp-on-desk'); if (ph) ph.textContent = phone; else el.textContent = phone; if (dk) dk.textContent = desk || phone; };
    both(document.querySelector('.tp-cap-i[data-view="kick"]'), name, W.playDesktop);
    both(document.getElementById('tp-home-kick-title'), name, W.dropGoalTitle);
    both(document.getElementById('tp-kick-title'), W.playTitle || W.playDesktop || name, W.dropGoalTitle); // the tab's own heading: Play Drop Goal on phones too (23 Nov)
    var full = W.dropGoal || 'Drop goal';
    var sec = document.getElementById('tp-kick'); if (sec) sec.setAttribute('aria-label', full);
    var fr = document.getElementById('tp-kick-frame'); if (fr) fr.title = fr.title.replace(/^[^:]+/, full);
  })();
  if (!tp || !home) return;
  var phone = document.getElementById('tp-phone'), esc = tp.esc, state = tp.state;
  var ARR = '<svg class="tp-home-arr" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

  /* ---------- Jumps within Home ---------- */
  home.addEventListener('click', function (e) {
    var j = e.target.closest('[data-home-jump]');
    if (j) { e.preventDefault(); tp.goTo(document.getElementById(j.dataset.homeJump)); return; }
    if (e.target.closest('#tp-home-go')) {
      e.preventDefault();
      // To the planner, at Your days (or the picker's tabs before Your days shows)
      window.tpView.go('plan');
      if (window.tpFlowC) { window.tpFlowC.focusStep(); return; } // Option C: the step it was on, or the Your answers card opened
      var ask = document.getElementById('tp-ask');
      requestAnimationFrame(function () { tp.goTo(ask && !ask.hidden ? ask : document.getElementById('tp-pick')); });
    }
  });
  var go = document.getElementById('tp-home-go');
  function syncGo() { go.hidden = !state.picked.length; }
  phone.addEventListener('tp:state', syncGo);
  syncGo();

  /* ---------- Where the matches are ---------- */
  var V = window.cnVenues || [], HOSTS = tp.hosts || {};
  var nsw = ['Sydney Football Stadium', 'Stadium Australia', 'Newcastle Stadium'];
  function count(v) { return tp.hostMatches ? tp.hostMatches(v).length : 0; }
  // The glance line, from the fixtures
  var pool = (window.cnFixtures || []).filter(function (f) { return !f.a && /^Pool /.test(f.s); }).length;
  var gn = document.getElementById('tp-glance-n'); if (gn && pool) gn.textContent = pool + ' ' + ((window.TP_WORDS || {}).groupMatches || 'pool matches'); var gk = document.getElementById('tp-glance-ko'); if (gk) gk.textContent = (window.TP_WORDS || {}).laterRounds || 'the knockouts'; // A2 (21 Nov)
  document.getElementById('tp-home-cities').innerHTML = nsw.map(function (v) {
    var h = HOSTS[v] || { title: v }, n = count(v);
    return '<li><button type="button" class="tp-city" data-open="city:' + esc(v) + '" aria-haspopup="dialog">' +
      '<span class="tp-city-t">' + esc(h.title) + '</span>' +
      '<span class="tp-city-m">' + esc(v) + ' • ' + n + (n === 1 ? ' match' : ' matches') + '</span>' +
      '<span class="tp-city-go"><span class="tp-u">Match day, where to eat and stay, and day trips</span>' + ARR + '</span></button></li>';
  }).join('');
  // The map: the planner's illustration (assets/images/map), cropped to Sydney up to Port Stephens. Stadium pins are
  // buttons; the regions are labels only, shown lightly
  var mapEl = document.getElementById('tp-home-map');
  if (mapEl && GEO) {
    var B = GEO.bounds, TOP = -32.6, BOT = -34.05;
    var IW = 2800, IH = 3602, frac = (TOP - BOT) / (B.lat1 - B.lat0);
    mapEl.style.aspectRatio = IW + ' / ' + Math.round(IH * frac);
    var xy = function (ll) { return 'left:' + ((ll[1] - B.lon0) / (B.lon1 - B.lon0) * 100).toFixed(2) + '%;top:' + ((TOP - ll[0]) / (TOP - BOT) * 100).toFixed(2) + '%'; };
    var P = GEO.places || {};
    var REG = [['Blue Mountains', P.Katoomba, 'r'], ['Central Coast', P.Gosford, 'r'], ['Hunter Valley', P.Pokolbin, 'l'], ['Port Stephens', P['Nelson Bay'], 'l']];
    // Label sides keep the two Sydney pins apart: Olympic Park to the left, Moore Park to the right
    var SIDE = { 'Stadium Australia': 'l', 'Sydney Football Stadium': 'r', 'Newcastle Stadium': 'l' };
    var SHORT = { 'Stadium Australia': 'Olympic Park', 'Sydney Football Stadium': 'Moore Park', 'Newcastle Stadium': 'Newcastle' };
    mapEl.innerHTML = '<img class="tp-home-map-img" src="assets/images/map/nsw-relief.webp" alt="" draggable="false" style="transform:translateY(' + (-(B.lat1 - TOP) / (B.lat1 - B.lat0) * 100).toFixed(2) + '%)">' +
      REG.filter(function (r) { return r[1]; }).map(function (r) { return '<span class="tp-home-reg is-' + r[2] + '" style="' + xy(r[1]) + '" aria-hidden="true">' + esc(r[0]) + '</span>'; }).join('') +
      nsw.map(function (v) {
        var ll = GEO.venues[v]; if (!ll) return '';
        return '<button type="button" class="tp-home-pin is-' + SIDE[v] + '" style="' + xy(ll) + '" data-open="city:' + esc(v) + '" aria-haspopup="dialog" aria-label="' + esc((HOSTS[v] || {}).title || v) + ', ' + esc(v) + '"><span class="tp-home-pin-i" aria-hidden="true"></span><span class="tp-home-pin-l" aria-hidden="true">' + esc(SHORT[v]) + '</span></button>';
      }).join('');
  }

  /* ---------- The stadium cards as a carousel, linked to the pins (19 Nov) ----------
     On a phone the cards are one at a time with the next peeking in, as Where to watch and the team cards are; the
     card in view marks its pin (is-on). A tap on a card or a pin opens that host city sheet, as before; a pin also
     brings its card into view behind the sheet. Only the carousel moves sideways, never the page (check 8). On the
     desktop website the cards are a grid and nothing scrolls. */
  var cityList = document.getElementById('tp-home-cities');
  if (cityList) {
    cityList.classList.add('is-car');
    cityList.setAttribute('aria-label', 'Host stadiums, ' + nsw.length + ' cards, scroll sideways');
    var cHint = document.createElement('p');
    cHint.className = 'tp-deck-hint tp-wcs-hint tp-home-cities-hint';
    cHint.textContent = nsw.length + ' host stadiums. Swipe for the others.';
    cityList.parentNode.insertBefore(cHint, cityList.nextSibling);
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var cards = function () { return [].slice.call(cityList.querySelectorAll('.tp-city')); };
    var pins = function () { return [].slice.call(document.querySelectorAll('#tp-home-map .tp-home-pin')); };
    var curV = null;
    var mark = function (v) {
      if (v === curV) return; curV = v;
      pins().forEach(function (p) { var on = p.dataset.open === 'city:' + v; p.classList.toggle('is-on', on); if (on) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current'); });
    };
    var scrolls = function () { return cityList.scrollWidth > cityList.clientWidth + 2; };
    // The card whose left edge is nearest the carousel's own is the one in view
    var inView = function () {
      var cs = cards(), x = cityList.getBoundingClientRect().left + parseFloat(getComputedStyle(cityList).paddingLeft || 0), best = cs[0], d = Infinity;
      cs.forEach(function (c) { var dd = Math.abs(c.getBoundingClientRect().left - x); if (dd < d) { d = dd; best = c; } });
      return best;
    };
    var sync = function () {
      var sc = scrolls(); cHint.hidden = !sc || cityList.scrollLeft + cityList.clientWidth >= cityList.scrollWidth - 4;
      if (!sc) { mark(null); return; }
      var c = inView(); if (c) mark(c.dataset.open.slice(5));
    };
    var tick = 0;
    cityList.addEventListener('scroll', function () { cancelAnimationFrame(tick); tick = requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', function () { cancelAnimationFrame(tick); tick = requestAnimationFrame(sync); });
    var show = function (card, smooth) {
      if (!card || !scrolls()) return;
      var li = card.parentNode, left = li.offsetLeft - cityList.firstElementChild.offsetLeft;
      cityList.scrollTo({ left: left, behavior: smooth && !reduce.matches ? 'smooth' : 'auto' });
    };
    // Keyboard: the card that takes focus comes into view and marks its pin
    cityList.addEventListener('focusin', function (e) { var c = e.target.closest('.tp-city'); if (c) { show(c, true); mark(c.dataset.open.slice(5)); } });
    // A pin opens its sheet (concepts-third-half.js) and brings its card into view behind it
    var mapBox = document.getElementById('tp-home-map');
    if (mapBox) mapBox.addEventListener('click', function (e) {
      var p = e.target.closest('.tp-home-pin'); if (!p) return;
      var c = cityList.querySelector('.tp-city[data-open="' + CSS.escape(p.dataset.open) + '"]');
      show(c, false); mark(p.dataset.open.slice(5));
    });
    // Measured only once Home is showing (hidden, every width reads as zero)
    phone.addEventListener('tp:view', function () { requestAnimationFrame(sync); });
    requestAnimationFrame(sync);
  }

  /* ---------- Articles: a masonry grid (two columns of cards in their own heights) of dummy articles (22 Nov) ----------
     The articles are in concepts-articles.js. A tile is a link to its article, which opens here, in place of Home's
     sections: the address gains ?a=<slug>, so the browser's back button returns to the tile and a shared link opens the
     article. Back to Read before you go does the same. The prose comes first; under it, a block formatted for reading,
     search and answer engines (the short answer, key facts, questions people ask, the places named), with matching
     structured data (Article, FAQPage and BreadcrumbList) and a meta description while the article shows. */
  var ARTS = window.TP_ARTICLES || [], W = window.TP_WORDS || {};
  var imgOf = W.imageOf || function (s) { return 'Image of ' + s; };
  function artBy(slug) { for (var i = 0; i < ARTS.length; i++) if (ARTS[i].slug === slug) return ARTS[i]; return null; }
  function tile(a) {
    return '<li class="tp-read"><a class="tp-read-a" href="?a=' + esc(a.slug) + '" data-read="' + esc(a.slug) + '">' +
      '<span class="ph-img tp-read-img" data-img="' + esc(a.img) + '" style="aspect-ratio:' + a.r + '" aria-hidden="true"></span>' +
      '<span class="tp-read-cat">' + esc(a.cat) + '</span><span class="tp-read-t">' + esc(a.title) + '</span>' +
      '<span class="tp-read-m">' + a.mins + ' min read</span></a></li>';
  }
  var reads = document.getElementById('tp-reads');
  reads.innerHTML = ARTS.map(tile).join('');

  var home = document.getElementById('tp-home'), artEl = document.getElementById('tp-article');
  var pbody = phone.querySelector('.cn-body'), reading = null, pushed = false, backY = 0, backSlug = null, backEl = null, prevTitle = '';
  var UPDATED = '22 November 2026', UPDATED_ISO = '2026-11-22';
  function artHtml(a) {
    var h = '<article class="tp-art" aria-labelledby="tp-art-title">';
    h += '<a class="tp-art-back" href="' + esc(urlFor(null)) + '" data-art-back><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M13 8H3M7 4L3 8l4 4"/></svg>Read before you go</a>';
    h += '<p class="tp-art-cat">' + esc(a.cat) + '</p><h2 class="tp-art-h" id="tp-art-title" tabindex="-1">' + esc(a.title) + '</h2>';
    h += '<p class="tp-art-dek">' + esc(a.dek) + '</p>';
    h += '<p class="tp-art-by">Destination NSW <span aria-hidden="true">·</span> Updated ' + UPDATED + ' <span aria-hidden="true">·</span> ' + a.mins + ' min read</p>';
    h += '<div class="ph-img tp-art-img" data-img="' + esc(a.img) + '" role="img" aria-label="' + esc(imgOf(a.title)) + '"></div>';
    h += '<div class="tp-art-body">' + a.body.map(function (b) {
      if (b[0] === 'h') return '<h3>' + esc(b[1]) + '</h3>';
      // A picture between paragraphs: a stand-in from the library, named for screen readers as the picture it stands for
      if (b[0] === 'i') return '<div class="ph-img tp-art-img tp-art-fig" data-img="' + esc(b[1]) + '" role="img" aria-label="' + esc(imgOf(b[2])) + '"></div>';
      return '<p>' + esc(b[1]) + '</p>';
    }).join('') + '</div>';
    // For reading, search and answer engines: one short answer that stands alone, then facts, questions and places
    h += '<section class="tp-art-aeo" aria-labelledby="tp-art-aeo-h"><h3 class="tp-sec-title" id="tp-art-aeo-h">Quick answers</h3>';
    h += '<div class="tp-art-short"><h4>' + esc(a.q) + '</h4><p>' + esc(a.answer) + '</p></div>';
    h += '<h4>Key facts</h4><dl class="tp-art-facts">' + a.facts.map(function (f) { return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>';
    h += '<h4>Questions people ask</h4><div class="tp-art-faqs">' + a.faqs.map(function (f) { return '<div class="tp-art-faq"><h5>' + esc(f[0]) + '</h5><p>' + esc(f[1]) + '</p></div>'; }).join('') + '</div>';
    h += '<h4>Places in this article</h4><ul class="tp-art-places">' + a.places.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></section>';
    var more = ARTS.filter(function (x) { return x.slug !== a.slug; }).slice(0, 4);
    h += '<section class="tp-art-more" aria-labelledby="tp-art-more-h"><h3 class="tp-sec-title" id="tp-art-more-h">More to read</h3><ul class="tp-reads">' + more.map(tile).join('') + '</ul>';
    h += '<button type="button" class="tp-home-cta" data-view="plan">Plan your 3rd half<svg class="tp-home-arr" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4"/></svg></button></section>';
    return h + '</article>';
  }
  function urlFor(slug) {
    var q = new URLSearchParams(location.search);
    if (slug) { q.set('a', slug); if (q.has('view')) q.set('view', 'home'); } else q.delete('a');
    var s = q.toString().replace(/=(?=&|$)/g, ''); // keep bare flags (?phone&tools) bare
    return location.pathname + (s ? '?' + s : '') + location.hash;
  }
  // Structured data and the meta description, only while an article shows
  function seo(a) {
    var ld = document.getElementById('tp-art-ld'), md = document.getElementById('tp-art-desc');
    if (!a) { if (ld) ld.remove(); if (md) md.remove(); return; }
    var data = [
      { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.dek, articleSection: a.cat, inLanguage: 'en-AU',
        dateModified: UPDATED_ISO, author: { '@type': 'Organization', name: 'Destination NSW' }, publisher: { '@type': 'Organization', name: 'Destination NSW' },
        about: a.places.map(function (p) { return { '@type': 'Place', name: p }; }) },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [[a.q, a.answer]].concat(a.faqs).map(function (f) {
        return { '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } }; }) },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Rugby World Cup 2027 in NSW' }, { '@type': 'ListItem', position: 2, name: 'Read before you go' },
        { '@type': 'ListItem', position: 3, name: a.title }] }
    ];
    if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'tp-art-ld'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify(data);
    if (!md) { md = document.createElement('meta'); md.name = 'description'; md.id = 'tp-art-desc'; document.head.appendChild(md); }
    md.content = a.dek;
  }
  function openArt(slug, opts) {
    var a = artBy(slug); if (!a) return;
    opts = opts || {};
    if (!reading) { backY = pbody.scrollTop; prevTitle = document.title; backSlug = opts.from || slug; backEl = opts.el || null; }
    reading = slug;
    artEl.innerHTML = artHtml(a); artEl.hidden = false; home.classList.add('is-reading');
    document.title = a.title + ' · ' + (prevTitle.split(' · ').slice(1).join(' · ') || prevTitle);
    seo(a);
    if (opts.push) { history.pushState({ tpArt: slug }, '', urlFor(slug)); pushed = true; }
    // A new page starts at its top, under the header and capsule, with focus on its title
    pbody.scrollTop = 0;
    var t = document.getElementById('tp-art-title'); if (t) t.focus({ preventScroll: true });
  }
  function closeArt(opts) {
    if (!reading) return;
    opts = opts || {};
    reading = null; pushed = false;
    home.classList.remove('is-reading'); artEl.hidden = true; artEl.innerHTML = '';
    document.title = prevTitle; seo(null);
    if (!opts.fromHistory && location.search.indexOf('a=') > -1) history.replaceState(null, '', urlFor(null));
    // Back where they left: the same scroll, and focus on the tile they opened (not when another tab takes over)
    pbody.scrollTop = backY;
    // Focus goes back to what opened it: a card, or a link elsewhere on Home (Read the match day guide)
    if (!opts.quiet) { var b = backEl && backEl.isConnected ? backEl : reads.querySelector('[data-read="' + CSS.escape(backSlug || '') + '"]'); if (b) b.focus({ preventScroll: true }); }
  }
  function back() { if (pushed && history.state && history.state.tpArt) history.back(); else closeArt(); }
  phone.addEventListener('click', function (e) {
    var t = e.target.closest('[data-read]');
    if (t && phone.contains(t)) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return; // a new tab or window loads the article there
      e.preventDefault();
      var from = reads.contains(t) ? t.dataset.read : backSlug;
      // One article at a time in the history: from an article, the next replaces it, so back always means Home
      if (reading) { history.replaceState(pushed ? { tpArt: t.dataset.read } : null, '', urlFor(t.dataset.read)); openArt(t.dataset.read, { from: from }); }
      else openArt(t.dataset.read, { push: true, from: from, el: t });
      return;
    }
    if (e.target.closest('[data-art-back]')) { e.preventDefault(); back(); }
  });
  // A tab picked while an article shows: Home's own tab goes back to the tile; another tab closes it first, quietly
  phone.addEventListener('click', function (e) {
    var v = e.target.closest('[data-view]'); if (!v || !reading || !phone.contains(v)) return;
    // The article's own buttons go when it closes, so the tab is picked from here
    e.stopPropagation();
    if (v.dataset.view === 'event') back(); else { var to = v.dataset.view; closeArt({ quiet: true }); if (window.tpView) window.tpView.go(to);
      var tab = document.querySelector('#tp-cap [data-view="' + to + '"]'); if (tab && !v.closest('#tp-cap')) tab.focus({ preventScroll: true }); }
  }, true);
  window.addEventListener('popstate', function () {
    var m = /[?&]a=([a-z0-9-]+)/.exec(location.search);
    if (m && artBy(m[1])) {
      if (window.tpView && window.tpView.get() !== 'event') window.tpView.go('event');
      openArt(m[1], { from: backSlug || m[1] }); pushed = !!(history.state && history.state.tpArt);
    }
    else closeArt({ fromHistory: true });
  });
  // A shared link (?a=<slug>) opens the article on Home once the page has set itself up
  var startA = /[?&]a=([a-z0-9-]+)/.exec(location.search);
  function startArt() {
    if (window.tpView && window.tpView.get() !== 'event') window.tpView.go('event');
    openArt(startA[1], { from: startA[1] });
    history.replaceState(null, '', urlFor(startA[1])); // the address names Home (view=home where a view was given)
  }
  if (startA && artBy(startA[1])) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startArt); else setTimeout(startArt, 0); }
  window.tpArticle = { open: function (s) { openArt(s, { push: true }); }, close: back, get: function () { return reading; } };

  /* ---------- FAQs (answers supplied 22 Nov): each opens and closes on its own ----------
     The questions and answers as the user gave them, links included. An answer is a list of paragraphs; [text](url)
     marks a link, which opens in a new tab and says so to screen readers. */
  var FAQ = [
    ['How can I buy Rugby World Cup 2027 tickets?', [
      'Tickets for Men’s Rugby World Cup 2027 are on sale now and are subject to availability. Always purchase tickets through official [Rugby World Cup 2027](https://rwc2027.rugbyworldcup.com/) ticketing channels.']],
    ['Will there be fan festivals?', [
      'Fan festivals are planned across the Rugby World Cup 2027 host cities, including Sydney and [Newcastle](https://www.visitnsw.com/destinations/north-coast/newcastle-area). More details about locations, dates and programming will be announced closer to the tournament on the official website.']],
    ['What can I do before or after a match?', [
      'Make match day part of a bigger NSW adventure. Explore Sydney’s iconic [harbour](https://www.sydney.com/destinations/sydney/sydney-city/sydney-harbour), [beaches](https://www.sydney.com/things-to-do/beaches-and-water-activities), [dining](https://www.sydney.com/things-to-do/food-and-drink) and [neighbourhoods](https://www.sydney.com/destinations), or discover Newcastle’s [best beaches](https://www.visitnsw.com/articles/different-ways-to-play-at-newcastles-best-beaches), coastal walks and [hikes](https://www.visitnsw.com/articles/best-hikes-and-walks-in-newcastle), and thriving [food and drink scene](https://www.visitnsw.com/articles/food-and-drink-experiences-in-newcastle). With matches spread across the tournament, there’s also plenty of time to squeeze in a [day trip](https://www.sydney.com/articles/best-day-trips-from-sydney) and explore further afield.']],
    ['How do I get to Rugby World Cup 2027 matches in NSW?', [
      'Public transport is an easy way to get to Rugby World Cup matches in Sydney and Newcastle. Use the Transport for NSW [Trip Planner](https://transportnsw.info/trip-planner) to plan your journey to Sydney Football Stadium, Accor Stadium (Stadium Australia) and Newcastle Stadium, with detailed event transport information available closer to the tournament.',
      'Planning to explore beyond the host cities? Hiring a car is a great option if you want to turn your journey between Sydney and Newcastle into a road trip, with the Central Coast, Hunter Valley and more to discover along the way. Find out more about [car hire and driving in NSW](https://www.sydney.com/travel-information/car-rentals-and-driving).']],
    ['Can I visit both Sydney and Newcastle during the tournament?', [
      'Absolutely. Sydney and Newcastle are around 160km apart, making it easy to include both cities in your Rugby World Cup trip. Travel by train or make a road trip of it, stopping to explore the [Central Coast](https://www.visitnsw.com/destinations/central-coast) and [Hunter Valley](https://www.visitnsw.com/destinations/hunter/hunter-valley) along the way.']],
    ['What else can I see and do in NSW during Rugby World Cup 2027?', [
      'There’s plenty to discover beyond the host cities. Add a coastal [road trip](https://www.visitnsw.com/things-to-do/drives-and-road-trips), visit the [wineries of the Hunter Valley](https://www.visitnsw.com/articles/sip-through-hunter-valleys-best-wineries-and-cellar-doors), escape to the [Blue Mountains](https://www.visitnsw.com/destinations/blue-mountains) or spend a few days exploring [regional NSW](https://www.visitnsw.com/destinations/country-nsw). Use our travel inspiration articles to [start planning your trip](https://www.visitnsw.com/articles).']]
  ];
  // Plain text with [text](url) links: the text is escaped, each link opens in a new tab and says so
  function linked(t) {
    var out = '', re = /\[([^\]]+)\]\((https?:[^)\s]+)\)/g, last = 0, m;
    while ((m = re.exec(t))) {
      out += esc(t.slice(last, m.index)) + '<a class="tp-faq-link" href="' + esc(m[2]) + '" target="_blank" rel="noopener">' + esc(m[1]) + '<span class="visually-hidden"> (opens in a new tab)</span></a>';
      last = re.lastIndex;
    }
    return out + esc(t.slice(last));
  }
  var faq = document.getElementById('tp-faq');
  faq.innerHTML = FAQ.map(function (f, i) {
    return '<div class="tp-faq-i"><h4 class="tp-faq-h"><button type="button" class="tp-faq-q" id="tp-faq-q' + i + '" aria-expanded="false" aria-controls="tp-faq-a' + i + '"><span>' + esc(f[0]) + '</span>' +
      '<svg class="tp-faq-chev" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 6l4.5 4.5L12.5 6"/></svg></button></h4>' +
      '<div class="tp-faq-a" id="tp-faq-a' + i + '" role="region" aria-labelledby="tp-faq-q' + i + '"><div class="tp-faq-in">' + f[1].map(function (p) { return '<p>' + linked(p) + '</p>'; }).join('') + '</div></div></div>';
  }).join('');
  faq.addEventListener('click', function (e) {
    var b = e.target.closest('.tp-faq-q'); if (!b) return;
    var open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open);
    b.closest('.tp-faq-i').classList.toggle('is-open', open);
  });

  /* ---------- Updates: an email only; a confirmation in place of a toast, as the change shows where they are ---------- */
  var form = document.getElementById('tp-news'), email = document.getElementById('tp-news-email');
  var err = document.getElementById('tp-news-err'), done = document.getElementById('tp-news-done');
  function bad(msg) { err.textContent = msg; err.hidden = !msg; email.setAttribute('aria-invalid', !!msg); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = email.value.trim();
    if (!v) { bad('Enter your email address.'); email.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { bad('Enter an email address like name@example.com.'); email.focus(); return; }
    bad('');
    done.textContent = 'Thanks. We’ve sent a confirmation to ' + v + '. (Prototype: nothing is sent.)';
    done.hidden = false; done.focus();
    email.value = '';
  });
  email.addEventListener('input', function () { if (!err.hidden) bad(''); if (!done.hidden) done.hidden = true; });

  /* ---------- Share this page: the device's share sheet, or the link is copied. The button itself confirms (Link
     copied, for a few seconds), not a toast: a toast here would sit over the button (check 11). If the copy fails, the
     link shows under the button to copy by hand ---------- */
  var shareBtn = document.getElementById('tp-home-share-btn'), shareSaid = document.getElementById('tp-home-share-said'), shareT = 0;
  var TICK = '<svg class="tp-home-arr" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8.5l3.2 3.2L13 5"/></svg>';
  shareBtn.addEventListener('click', function () {
    var url = location.href.split('#')[0];
    var data = { title: 'Rugby World Cup 2027 in NSW', text: 'Plan your 3rd half: our matches and our days in NSW.', url: url };
    if (navigator.share && matchMedia('(pointer: coarse)').matches) { navigator.share(data).catch(function () {}); return; }
    function copied() {
      shareBtn.innerHTML = TICK + 'Link copied'; shareSaid.textContent = 'Link copied. Paste it in a message to the people you\u2019re going with.';
      clearTimeout(shareT); shareT = setTimeout(function () { shareBtn.textContent = 'Share this page'; shareSaid.textContent = ''; }, 6000);
    }
    function cant() { shareSaid.innerHTML = 'Copy this link to share it: <span class="tp-home-share-url">' + esc(url) + '</span>'; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(copied, cant);
    else cant();
  });
})();
