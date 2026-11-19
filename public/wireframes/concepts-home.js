/* Home (19 Nov 2026, Figma 385:649, built in this prototype's own styles): the first tab of the Pick your team
   prototype. The hand of cards is the planner's own, lent here by the capsule script (prototype-pick-your-team.html),
   so this file only builds what is Home's alone:
   - the jumps (Plan your 3rd half to the hand, See all FAQs to the FAQs), which say where they go (check 8);
   - Plan around your matches, shown once anything is picked: the planner, at Your days;
   - Where the matches are: a cut-down planner map with the three NSW stadiums (each opens its host city sheet,
     concepts-third-half.js pmCity) and a few regions within reach, shown lightly; one card per stadium;
   - the FAQs (placeholder answers until copy is supplied), the updates sign-up and Share this page. */
(function () {
  'use strict';
  var tp = window.tpPicker, GEO = window.cnGeo;
  var home = document.getElementById('tp-home');
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
  var gn = document.getElementById('tp-glance-n'); if (gn && pool) gn.textContent = pool + ' pool matches, plus the knockouts';
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

  /* ---------- Articles: a masonry grid (two columns of cards in their own heights) of dummy content ----------
     Titles, categories, read times and pictures are placeholders. Cards link to the article page's future address; it
     is not built, so a tap keeps the person here and the card's meta line says Article page to come for a few
     seconds (in place, no toast). */
  var READS = [
    { slug: 'match-day-sydney', cat: 'Match day', title: 'A first-timer\u2019s guide to match day in Sydney', mins: 5, img: 'hero-stadium', r: '4 / 5' },
    { slug: 'eat-moore-park', cat: 'Food and drink', title: 'Where to eat near Moore Park before kick-off', mins: 4, img: 'city-dining', r: '1 / 1' },
    { slug: 'newcastle-day-trips', cat: 'Day trips', title: 'Five day trips from Newcastle between matches', mins: 6, img: 'Newcastle baths', r: '3 / 4' },
    { slug: 'ocean-pools', cat: 'Coast', title: 'Ocean pools for a post-match swim', mins: 3, img: 'Merwether baths', r: '4 / 3' },
    { slug: 'pacific-fans', cat: 'Culture', title: 'How Pacific fans celebrate their rugby', mins: 5, img: 'village', r: '4 / 5' },
    { slug: 'blue-mountains-day', cat: 'Nature', title: 'The Blue Mountains in a day: a fan\u2019s itinerary', mins: 7, img: 'Bush', r: '1 / 1' }
  ];
  var reads = document.getElementById('tp-reads');
  reads.innerHTML = READS.map(function (a) {
    return '<li class="tp-read"><a class="tp-read-a" href="pages/rwc-article.html?a=' + esc(a.slug) + '" data-read>' +
      '<span class="ph-img tp-read-img" data-img="' + esc(a.img) + '" style="aspect-ratio:' + a.r + '" aria-hidden="true"></span>' +
      '<span class="tp-read-cat">' + esc(a.cat) + '</span><span class="tp-read-t">' + esc(a.title) + '</span>' +
      '<span class="tp-read-m" aria-live="polite">' + a.mins + ' min read</span></a></li>';
  }).join('');
  reads.addEventListener('click', function (e) {
    var a = e.target.closest('[data-read]'); if (!a) return;
    e.preventDefault();
    var m = a.querySelector('.tp-read-m'), was = m.dataset.was || m.textContent;
    m.dataset.was = was; m.textContent = 'Article page to come'; a.classList.add('is-soon');
    clearTimeout(a._t); a._t = setTimeout(function () { m.textContent = was; a.classList.remove('is-soon'); }, 4000);
  });

  /* ---------- FAQs: one open at a time is not forced; each opens and closes on its own ---------- */
  var FAQ = ['How can I buy Rugby World Cup 2027 tickets?', 'Will there be fan festivals?', 'What can I do before or after a match?',
    'How do I get to Rugby World Cup 2027 matches in NSW?', 'Can I visit both Sydney and Newcastle during the tournament?',
    'What else can I see and do in NSW during Rugby World Cup 2027?'];
  var faq = document.getElementById('tp-faq');
  faq.innerHTML = FAQ.map(function (q, i) {
    return '<div class="tp-faq-i"><h4 class="tp-faq-h"><button type="button" class="tp-faq-q" id="tp-faq-q' + i + '" aria-expanded="false" aria-controls="tp-faq-a' + i + '"><span>' + esc(q) + '</span>' +
      '<svg class="tp-faq-chev" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 6l4.5 4.5L12.5 6"/></svg></button></h4>' +
      '<div class="tp-faq-a" id="tp-faq-a' + i + '" role="region" aria-labelledby="tp-faq-q' + i + '"><div class="tp-faq-in"><p class="tp-home-ph">[Answer to come]</p></div></div></div>';
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
