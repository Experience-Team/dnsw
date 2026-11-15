/* Prototype viewer: phone view, the QR code that opens it, and the theme.
   Phone view (html.pv-device, set in each page's <head> for ?phone, or a touch screen under 500px wide) shows only the
   phone screen, edge to edge, so a real phone uses its own keyboard and controls. Here it keeps the screen the height
   of what is visible above the keyboard: Android resizes the page itself (interactive-widget=resizes-content), iOS
   only shrinks the visual viewport, so its height is copied into --pv-vh and the page is held at the top.
   In the desktop viewer, #pv-qr draws a QR code for this page with ?phone&theme=hifi, so a scan always opens the
   high fidelity version whichever theme the viewer shows (the wireframe on a phone: ?phone&theme=wireframe), and Copy
   link copies the same address. The High fidelity switch (#pv-theme-toggle) sets data-theme="hifi" on <html> (the <head> script
   sets it first, from ?theme= or the last choice) and remembers it in this browser.
   In the high fidelity theme, each placeholder with data-img shows assets/images/<name>.webp (or .jpg).
   QR encoding: vendor/qrcode.js (qrcode-generator, Kazuhiko Arase, MIT). */
(function () {
  var root = document.documentElement;
  function hifi() { return root.getAttribute('data-theme') === 'hifi'; }

  /* ---------- High fidelity pictures ----------
     Every placeholder that names its picture (data-img) gets assets/images/<name>.webp or .jpg as a background (both
     are listed, so whichever file exists shows), over its grey
     block, so a picture not added yet simply leaves the block. Placeholders drawn later (sheets, cards) are picked up
     as they appear. The wireframe takes them off again. */
  var IMG_DIR = 'assets/images/';
  // Placeholder name -> picture file (no extension). Pictures saved under their own name, and the closest match where
  // there is no picture of the place itself yet (see assets/images/README.md for what is a stand-in and what is missing)
  var IMG_ALIAS = {
    'golden-barley-hotel': 'golden-barley',
    'lord-nelson-brewery-hotel': 'lord-nelson',
    'marrickville-tavern': 'marickville-tavern',
    'rugby-village-foreshore-park': 'village',
    'darling-harbour-fan-zone': 'village',
    'armory-wharf-cafe': 'city-dining',
    'bourke-street-bakery': 'city-dining',
    'darby-street-cafes': 'city-dining',
    'entertainment-quarter': 'city-dining',
    'waterview-in-bicentennial-park': 'city-dining',
    'white-rabbit-gallery': 'city-dining',
    'beaumont-street-bars': 'marickville-tavern',
    'bathers-way': 'coast-headland',
    'brickpit-ring-walk': 'river-national-park',
    'blue-mountains-day-out': 'river-national-park',
    'barrington-tops-overnight': 'river-national-park',
    'lake-macquarie-by-bike': 'river-national-park',
    'royal-national-park-coast-walk': 'coast-headland',
    'port-stephens-bay-day': 'coast-aerial',
    'south-coast-3-nights': 'coast-headland',
    'hunter-valley-2-nights': 'city-dining',
    'echo-point-lookout': 'river-national-park',
    'prince-henry-cliff-walk': 'river-national-park',
    'leura-mall-cafes': 'city-dining',
    'the-coast-track': 'coast-headland',
    'bundeena-village-cafes': 'city-dining',
    'nelson-bay-dolphin-cruise': 'coast-aerial',
    'stockton-bight-sand-dunes-tour': 'coast-aerial',
    'shoal-bay-beach': 'coast-aerial',
    'warners-bay-bike-hire': 'river-national-park',
    'speers-point-park': 'river-national-park',
    'pokolbin-cellar-doors': 'city-dining',
    'hunter-valley-balloon-flight': 'river-national-park',
    'hunter-valley-gardens': 'river-national-park',
    'kiama-blowhole': 'coast-headland',
    'kiama-coast-walk': 'coast-headland',
    'jervis-bay-whale-watching-cruise': 'coast-aerial',
    'barrington-tops-rainforest-walk': 'river-national-park',
    'gloucester-country-pub': 'lord-nelson',
    'centennial-parklands': 'river-national-park',
    'fan-zone': 'village',
    'newcastle-ocean-baths': 'coast-aerial',
    'nz-v-australia': 'hero-stadium',
    // Getting there and back cards show the stadium (one stadium photo stands in for all of them)
    'stadium-australia': 'hero-stadium', 'sydney-football-stadium': 'hero-stadium', 'newcastle-stadium': 'hero-stadium', 'adelaide-oval': 'hero-stadium', 'brisbane-stadium': 'hero-stadium', 'docklands-stadium': 'hero-stadium', 'perth-stadium': 'hero-stadium', 'north-queensland-stadium': 'hero-stadium',
    'patonga-beach': 'coast-headland'
  };
  function paint(el) {
    var name = el.getAttribute('data-img'); name = IMG_ALIAS[name] || name;
    var want = hifi() ? 'url("' + IMG_DIR + name + '.webp"), url("' + IMG_DIR + name + '.jpg")' : '';
    if (el.style.backgroundImage !== want) el.style.backgroundImage = want;
  }
  function paintAll(scope) { Array.prototype.forEach.call((scope || document).querySelectorAll('.cn-phone [data-img]'), paint); }
  var watch = new MutationObserver(function (list) {
    if (!hifi()) return;
    list.forEach(function (m) {
      Array.prototype.forEach.call(m.addedNodes, function (n) {
        if (n.nodeType !== 1) return;
        if (n.hasAttribute('data-img')) paint(n);
        Array.prototype.forEach.call(n.querySelectorAll('[data-img]'), paint);
      });
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('.cn-phone'), function (ph) { watch.observe(ph, { childList: true, subtree: true }); });
  paintAll();

  if (root.classList.contains('pv-device')) {
    var vv = window.visualViewport;
    if (!vv) return;
    var fit = function () {
      root.style.setProperty('--pv-vh', Math.round(vv.height) + 'px');
      if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
    };
    vv.addEventListener('resize', fit);
    vv.addEventListener('scroll', fit);
    fit();
    return;
  }

  /* ---------- Theme switch ---------- */
  var themeBtn = document.getElementById('pv-theme-toggle');
  function setTheme(on, save) {
    if (on) root.setAttribute('data-theme', 'hifi'); else root.removeAttribute('data-theme');
    if (themeBtn) themeBtn.setAttribute('aria-checked', on ? 'true' : 'false');
    if (save) { try { localStorage.setItem('pv-theme', on ? 'hifi' : 'wireframe'); } catch (e) {} }
    paintAll();
    drawQr();
  }
  if (themeBtn) themeBtn.addEventListener('click', function () { setTheme(!hifi(), true); });

  /* ---------- QR code and Copy link ---------- */
  var box = document.getElementById('pv-qr');
  var code, text, copy, status, shown, url = '';
  var local = location.protocol === 'file:' || /^(localhost|127\.|0\.0\.0\.0$|\[::1\]$)/.test(location.hostname);
  // Always the high fidelity version: that is what someone scanning the code should see
  function phoneUrl() { return location.origin + location.pathname + '?phone&theme=hifi'; }
  function drawQr() {
    if (!box) return;
    url = phoneUrl();
    if (local || typeof qrcode !== 'function') {
      code.hidden = true;
      document.getElementById('pv-qr-show').textContent = 'Why no QR code';
      text.textContent = local
        ? 'This is a local address, so a phone can’t open it. Use the Vercel preview link.'
        : 'The QR code could not be drawn. Copy the link and open it on your phone.';
      return;
    }
    var qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    var n = qr.getModuleCount(), q = 2, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += 'M' + (c + q) + ' ' + (r + q) + 'h1v1h-1z';
    code.innerHTML = '<svg viewBox="0 0 ' + (n + q * 2) + ' ' + (n + q * 2) + '" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#1a1a1a"/></svg>';
    code.dataset.url = url;
    text.textContent = 'Scan to open just the phone screen, in the high fidelity version. Your phone’s keyboard and controls work there.';
  }
  if (box) {
    code = document.getElementById('pv-qr-code'); text = document.getElementById('pv-qr-p');
    copy = document.getElementById('pv-qr-copy'); status = document.getElementById('pv-qr-status');
    shown = document.getElementById('pv-qr-url');

    // Short windows: the QR code button opens the code as a popover; it closes on the button, Escape or a click elsewhere
    var show = document.getElementById('pv-qr-show');
    var openPop = function (on) { box.classList.toggle('is-open', on); show.setAttribute('aria-expanded', on ? 'true' : 'false'); };
    show.addEventListener('click', function () { openPop(!box.classList.contains('is-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('is-open')) { openPop(false); show.focus(); } });
    document.addEventListener('pointerdown', function (e) { if (box.classList.contains('is-open') && !box.contains(e.target)) openPop(false); });

    var timer;
    var copied = function (ok) {
      clearTimeout(timer);
      copy.classList.toggle('is-copied', ok);
      copy.lastChild.textContent = ok ? 'Copied' : 'Copy link';
      status.textContent = ok ? 'Link copied' : '';
      if (ok) shown.hidden = true;
      if (ok) timer = setTimeout(function () { copied(false); }, 2000);
    };
    var fallback = function () {
      // The browser blocked copying: show the address, selected, to copy by hand
      shown.hidden = false;
      shown.textContent = url;
      status.textContent = 'Copying was blocked. The link is shown and selected.';
      var range = document.createRange();
      range.selectNodeContents(shown);
      var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
    };
    copy.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { copied(true); }, fallback);
      else fallback();
    });
  }
  setTheme(hifi(), false);
})();
