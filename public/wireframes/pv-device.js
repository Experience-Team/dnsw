/* Prototype viewer: phone view and the QR code that opens it.
   Phone view (html.pv-device, set in each page's <head> for ?phone, or a touch screen under 500px wide) shows only the
   phone screen, edge to edge, so a real phone uses its own keyboard and controls. Here it keeps the screen the height
   of what is visible above the keyboard: Android resizes the page itself (interactive-widget=resizes-content), iOS
   only shrinks the visual viewport, so its height is copied into --pv-vh and the page is held at the top.
   In the desktop viewer, #pv-qr draws a QR code for this page with ?phone, and Copy link copies the same address.
   QR encoding: vendor/qrcode.js (qrcode-generator, Kazuhiko Arase, MIT). */
(function () {
  var root = document.documentElement;

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

  var box = document.getElementById('pv-qr');
  if (!box) return;
  var code = document.getElementById('pv-qr-code'), text = document.getElementById('pv-qr-p'),
      copy = document.getElementById('pv-qr-copy'), status = document.getElementById('pv-qr-status'),
      shown = document.getElementById('pv-qr-url');
  var url = location.origin + location.pathname + '?phone';
  var local = location.protocol === 'file:' || /^(localhost|127\.|0\.0\.0\.0$|\[::1\]$)/.test(location.hostname);

  if (local || typeof qrcode !== 'function') {
    code.hidden = true;
    document.getElementById('pv-qr-show').textContent = 'Why no QR code';
    text.textContent = local
      ? 'This is a local address, so a phone can’t open it. Use the Vercel preview link.'
      : 'The QR code could not be drawn. Copy the link and open it on your phone.';
  } else {
    var qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    var n = qr.getModuleCount(), q = 2, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += 'M' + (c + q) + ' ' + (r + q) + 'h1v1h-1z';
    code.innerHTML = '<svg viewBox="0 0 ' + (n + q * 2) + ' ' + (n + q * 2) + '" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#1a1a1a"/></svg>';
    code.dataset.url = url;
  }

  // Short windows: the QR code button opens the code as a popover; it closes on the button, Escape or a click elsewhere
  var show = document.getElementById('pv-qr-show');
  function openPop(on) { box.classList.toggle('is-open', on); show.setAttribute('aria-expanded', on ? 'true' : 'false'); }
  show.addEventListener('click', function () { openPop(!box.classList.contains('is-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('is-open')) { openPop(false); show.focus(); } });
  document.addEventListener('pointerdown', function (e) { if (box.classList.contains('is-open') && !box.contains(e.target)) openPop(false); });

  var timer;
  function copied(ok) {
    clearTimeout(timer);
    copy.classList.toggle('is-copied', ok);
    copy.lastChild.textContent = ok ? 'Copied' : 'Copy link';
    status.textContent = ok ? 'Link copied' : '';
    if (ok) shown.hidden = true;
    if (ok) timer = setTimeout(function () { copied(false); }, 2000);
  }
  function fallback() {
    // The browser blocked copying: show the address, selected, to copy by hand
    shown.hidden = false;
    shown.textContent = url;
    status.textContent = 'Copying was blocked. The link is shown and selected.';
    var range = document.createRange();
    range.selectNodeContents(shown);
    var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
  }
  copy.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { copied(true); }, fallback);
    else fallback();
  });
})();
