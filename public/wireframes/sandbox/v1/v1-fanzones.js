/* Fan zones, fan villages and watch parties (26 Nov 2026), Version 1 only. Two sections after Where to watch:
   1. Fan zones and fan villages: every one, whatever team the person follows.
   2. Pubs and fan zones on their own map, separate from the planner's map: pins by suburb or venue, a card for the one
      chosen, and the list. Three views (Sydney centre, Parramatta to Wollongong, Newcastle) so no two pins sit on top
      of each other. All details are sample data (v1-fanspots.js) and are marked Sample. */
(function () {
  var SPOTS = window.v1FanSpots, KIND = window.v1FanKinds, GEO = window.cnGeo;
  var phone = document.getElementById('tp-phone'), watch = document.getElementById('tp-watch');
  if (!SPOTS || !SPOTS.length || !GEO || !phone || !watch) return;
  var B = GEO.bounds, IMG = 'assets/images/map/nsw-relief.webp';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* The map views, by the places on them (lon0, lon1, lat0 south, lat1 north). Each is picked so its pins are at least a
     finger apart at phone width. */
  var VIEWS = [
    { id: 'centre', label: 'Sydney centre', lon0: 151.12, lon1: 151.32, lat0: -33.95, lat1: -33.77, ids: ['fz-harbour', 'fv-darling', 'pub-tanner', 'pub-breakwater', 'pub-wattle', 'club-headland'],
      lb: { 'fz-harbour': 'r', 'fv-darling': 'l', 'pub-tanner': 'r', 'pub-breakwater': 'r', 'pub-wattle': 'r', 'club-headland': 'l' } },
    { id: 'west', label: 'Parramatta to Wollongong', lon0: 150.55, lon1: 151.35, lat0: -34.5, lat1: -33.7, ids: ['pub-riveroak', 'club-westvale', 'club-escarpment'],
      lb: { 'pub-riveroak': 'r', 'club-westvale': 'r', 'club-escarpment': 'r' } },
    { id: 'ncl', label: 'Newcastle', lon0: 151.6, lon1: 151.85, lat0: -33.07, lat1: -32.88, ids: ['fz-foreshore', 'fv-newcastle', 'pub-coalwharf', 'club-lakeside'],
      lb: { 'fz-foreshore': 't', 'fv-newcastle': 'l', 'pub-coalwharf': 'bl', 'club-lakeside': 'r' } }
  ];
  function spot(id) { return SPOTS.filter(function (s) { return s.id === id; })[0]; }
  function isFan(s) { return s.kind === 'fan_zone' || s.kind === 'fan_village'; }

  /* ---- a card: the same wherever it shows ---- */
  function card(s, opt) {
    opt = opt || {};
    return '<article class="v1-fz-card' + (opt.sel ? ' is-sel' : '') + '" data-spot="' + esc(s.id) + '">' +
      '<header class="v1-fz-head"><div><h4 class="v1-fz-name">' + (opt.n ? '<span class="v1-fz-n" aria-hidden="true">' + opt.n + '</span>' : '') + esc(s.name) + '</h4>' +
      '<p class="v1-fz-meta"><span class="v1-fz-kind is-' + s.kind + '">' + esc(KIND[s.kind]) + '</span><span class="v1-fz-sub">' + esc(s.suburb) + '</span></p></div>' +
      '<span class="v1-sample provenance-gap">Sample</span></header>' +
      '<dl class="v1-fz-dl"><div><dt>Getting there</dt><dd>' + esc(s.transport) + '</dd></div>' +
      '<div><dt>Open</dt><dd>' + esc(s.opens) + '</dd></div>' +
      '<div><dt>What is there</dt><dd><ul class="v1-fz-has">' + s.has.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul></dd></div></dl></article>';
  }

  /* ---- 1. every fan zone and fan village ---- */
  var fz = document.createElement('section');
  fz.className = 'tp-sec v1-fz'; fz.id = 'v1-fz'; fz.setAttribute('aria-labelledby', 'v1-fz-h');
  var CITY = { sydney: 'Sydney', newcastle: 'Newcastle' };
  fz.innerHTML = '<h3 class="tp-sec-title" id="v1-fz-h" tabindex="-1">Fan zones and fan villages</h3>' +
    '<p class="tp-sec-note">All of them, whichever team you follow. Sample details: the names, places, transport, opening times and what is there are made up for this prototype.</p>' +
    ['sydney', 'newcastle'].map(function (c) {
      var ms = SPOTS.filter(function (s) { return isFan(s) && s.city === c; });
      return ms.length ? '<h4 class="v1-fz-city">' + CITY[c] + '</h4><div class="v1-fz-list">' + ms.map(function (s) { return card(s); }).join('') + '</div>' : '';
    }).join('');

  /* ---- 2. the map of pubs and fan zones ---- */
  var fm = document.createElement('section');
  fm.className = 'tp-sec v1-fm'; fm.id = 'v1-fm'; fm.setAttribute('aria-labelledby', 'v1-fm-h');
  var view = VIEWS[0], sel = view.ids[0];
  function drawMap() {
    var v = view, lonW = v.lon1 - v.lon0, latH = v.lat1 - v.lat0;
    var pxW = lonW * ((2800) / (B.lon1 - B.lon0)), pxH = latH * ((3602) / (B.lat1 - B.lat0));
    var img = '<img class="v1-fm-img" src="' + IMG + '" alt="" style="left:' + (-(v.lon0 - B.lon0) / lonW * 100) + '%;top:' + (-(B.lat1 - v.lat1) / latH * 100) + '%;width:' + ((B.lon1 - B.lon0) / lonW * 100) + '%;height:' + ((B.lat1 - B.lat0) / latH * 100) + '%">';
    var pins = v.ids.map(function (id, i) {
      var s = spot(id);
      return '<button type="button" class="v1-fm-pin ' + (isFan(s) ? 'is-fan' : 'is-watch') + (id === sel ? ' is-sel' : '') + '" data-pick="' + id + '" aria-pressed="' + (id === sel) + '" ' +
        'aria-label="' + (i + 1) + ', ' + esc(s.name) + ', ' + esc(s.suburb) + ', ' + esc(KIND[s.kind]) + '" style="left:' + ((s.ll[1] - v.lon0) / lonW * 100) + '%;top:' + ((v.lat1 - s.ll[0]) / latH * 100) + '%">' + (i + 1) + '<span class="v1-fm-lb is-' + ((v.lb || {})[id] || 'r') + '" aria-hidden="true">' + esc(s.suburb) + '</span></button>';
    }).join('');
    return '<div class="v1-fm-map" role="group" aria-label="Map: ' + esc(v.label) + '" style="aspect-ratio:' + pxW.toFixed(0) + ' / ' + pxH.toFixed(0) + '">' + img + pins + '</div>';
  }
  function render() {
    var s = spot(sel);
    fm.innerHTML = '<h3 class="tp-sec-title" id="v1-fm-h" tabindex="-1">Pubs and fan zones on the map</h3>' +
      '<p class="tp-sec-note">Where to watch the rugby, by suburb. Sample details: the venues, places, transport, opening times and what is there are made up for this prototype.</p>' +
      '<div class="v1-fm-tabs" role="group" aria-label="Map area">' + VIEWS.map(function (x) { return '<button type="button" class="v1-fm-tab" data-view="' + x.id + '" aria-pressed="' + (x === view) + '">' + esc(x.label) + '</button>'; }).join('') + '</div>' +
      drawMap() +
      '<p class="v1-fm-key" aria-hidden="true"><span class="v1-fm-k is-fan">Fan zone or fan village</span><span class="v1-fm-k is-watch">Pub or club</span></p>' +
      '<div class="v1-fm-sel" aria-live="polite">' + card(s, { n: view.ids.indexOf(sel) + 1, sel: true }) + '</div>' +
      '<ol class="v1-fm-rows" aria-label="Places on this map">' + view.ids.map(function (id, i) {
        var x = spot(id);
        return '<li><button type="button" class="v1-fm-row' + (id === sel ? ' is-sel' : '') + '" data-pick="' + id + '" aria-current="' + (id === sel ? 'true' : 'false') + '"><span class="v1-fz-n" aria-hidden="true">' + (i + 1) + '</span>' +
          '<span class="v1-fm-rt"><b>' + esc(x.name) + '</b><span>' + esc(KIND[x.kind]) + ' · ' + esc(x.suburb) + '</span></span></button></li>';
      }).join('') + '</ol>';
  }
  fm.addEventListener('click', function (e) {
    var t = e.target.closest('[data-view]');
    if (t) { view = VIEWS.filter(function (x) { return x.id === t.dataset.view; })[0]; sel = view.ids[0]; render(); var b = fm.querySelector('[data-view="' + view.id + '"]'); if (b) b.focus({ preventScroll: true }); return; }
    var p = e.target.closest('[data-pick]');
    if (p) { sel = p.dataset.pick; render(); var q = fm.querySelector('.v1-fm-pin[data-pick="' + sel + '"], .v1-fm-row[data-pick="' + sel + '"]'); if (p.classList.contains('v1-fm-row')) { var r = fm.querySelector('.v1-fm-row[data-pick="' + sel + '"]'); if (r) r.focus({ preventScroll: true }); } else if (q) q.focus({ preventScroll: true }); }
  });
  render();
  watch.parentNode.insertBefore(fz, watch.nextSibling);
  watch.parentNode.insertBefore(fm, fz.nextSibling);
})();
