/* Concepts: "Group chat" (copy the page), "Spreadsheet" (copy a table), Print and the two downloads on the Save and share sheet.
   Both are built from one structured data object per stop, not from the page, and write rich and plain text to the
   clipboard in a single operation. Nothing is sent anywhere. */
(function () {
  'use strict';
  var phone = document.getElementById('cn-phone');
  var chatTile = document.getElementById('cn-tile-chat');
  var sheetTile = document.getElementById('cn-tile-sheet');
  if (!phone || !chatTile || !sheetTile) return;

  /* ---------- Config ---------- */
  var CONFIG = {
    // Campaign tracking on every link: utm_source=copy_page, utm_medium=clipboard, utm_campaign=<campaign>. Off by default.
    utm: { enabled: false, campaign: 'itinerary_copy' },
    locale: 'en-AU',
    timeZone: 'Australia/Sydney'
  };
  var COLUMNS = ['Day', 'Theme', 'Time of day', 'Order', 'Name', 'Type', 'Area', 'Address', 'Details', 'Link'];

  /* ---------- Placeholder data (prototype only) ----------
     Each stop's day and order come from where it sits in the list. Type, area, address and description come from the
     product records (concepts-products.js), the same source as the AI prompt, so all three copies agree. Nothing the fan
     has not set is filled in: no day themes, no times of day apart from a match's kick-off, and no start point or
     getting-there advice per day. Only links stay here. */
  var DATA = {
    page: {
      title: 'Your Rugby World Cup 2027 itinerary',
      sourceName: 'sydney.com',
      sourceUrl: 'https://www.sydney.com/'
    },
    stops: [
      { id: 'centennial-parklands', url: 'https://www.sydney.com/' },
      { id: 'fan-zone', url: '' },
      { id: 'nz-v-australia', url: 'https://www.sydney.com/' },
      { id: 'patonga-beach', url: 'https://www.sydney.com/' },
      { id: 'newcastle-ocean-baths', url: '' }
    ]
  };

  /* ---------- Reading the list: order and day only ---------- */
  // Returns the stops in the order the fan has put them, each with the day it now sits under. Stops with no date are "Not yet planned".
  function currentStops(data) {
    var byId = {}, out = [];
    data.stops.forEach(function (s) { byId[s.id] = s; });
    phone.querySelectorAll('.cn-pane[data-pane="list"] .cn-day').forEach(function (h) {
      var label = h.textContent.trim(), ul = h.nextElementSibling;
      while (ul && ul.tagName !== 'UL') ul = ul.nextElementSibling;
      var dated = /^[A-Z][a-z]{2} \d+ [A-Z][a-z]{2}$/.test(label);
      Array.prototype.forEach.call(ul ? ul.querySelectorAll('.cn-item') : [], function (li) {
        var s = byId[li.dataset.stop];
        if (!s) return;
        var r = (window.cnProducts || {})[s.id] || {}, name = li.querySelector('.cn-item-name').textContent.trim();
        var kick = / v /.test(name) ? (/(\d{1,2}:\d{2}\s*[ap]m)/i.exec(li.querySelector('.cn-item-meta').textContent) || [])[1] : '';
        out.push(Object.assign({
          name: r.title || name,
          type: window.cnStopType ? window.cnStopType(s.id, name) : '',
          area: r.address ? r.address.suburb || '' : '',
          address: window.cnStopAddress ? window.cnStopAddress(s.id) : '',
          description: r.overview || '',
          kickoff: kick ? 'Kick-off ' + kick : ''
        }, s, {
          day: dated ? label : 'Not yet planned'
        }));
      });
    });
    return out;
  }

  /* ---------- Helpers ---------- */
  function esc(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  // Adds the campaign parameters when tracking is on; an empty address stays empty
  function link(u, cfg) {
    cfg = cfg || CONFIG;
    if (!u) return '';
    if (!cfg.utm.enabled) return u;
    try {
      var x = new URL(u);
      x.searchParams.set('utm_source', 'copy_page');
      x.searchParams.set('utm_medium', 'clipboard');
      x.searchParams.set('utm_campaign', cfg.utm.campaign);
      return x.toString();
    } catch (e) { return u; }
  }
  function copiedOn(cfg) { return new Date().toLocaleDateString((cfg || CONFIG).locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: (cfg || CONFIG).timeZone }); }
  // Dated days in the fan's order, each with its stops in the fan's order; then the stops with no day
  function group(stops) {
    var days = [], idx = {}, rest = [];
    stops.forEach(function (s) {
      if (s.day === 'Not yet planned') { rest.push(s); return; }
      if (!(s.day in idx)) { idx[s.day] = days.length; days.push({ label: s.day, stops: [] }); }
      days[idx[s.day]].stops.push(s);
    });
    return { days: days, rest: rest };
  }
  function overview(g, stops) {
    // "1 match and 3 places on 3 days, and 1 place not yet planned. In NSW from Sun 26 Sep 2027 to Mon 11 Oct 2027."
    var setup = window.cnTripSetup || {}, dated = [];
    g.days.forEach(function (d) { dated = dated.concat(d.stops); });
    var matches = dated.filter(function (s) { return s.type === 'Match'; }).length, places = dated.length - matches;
    function n(k, one, many) { return k + ' ' + (k === 1 ? one : many); }
    var what = [matches ? n(matches, 'match', 'matches') : '', places ? n(places, 'place', 'places') : ''].filter(Boolean).join(' and ') || 'Nothing';
    return what + ' on ' + n(g.days.length, 'day', 'days') + (g.rest.length ? ', and ' + n(g.rest.length, 'place', 'places') + ' not yet planned' : '') + '.' + (setup.arrive && setup.leave ? ' In NSW from ' + setup.arrive + ' 2027 to ' + setup.leave + ' 2027.' : '');
  }
  function details(s) { return [s.kickoff, s.description].filter(Boolean).join('. '); }
  // The fan's matches outside NSW that fall inside their days in NSW (set by the timeline), so no copy hides them
  function awayMatches() { var a = (window.cnTripSetup || {}).away; return Array.isArray(a) ? a : []; }
  function awayLine(a) { return a.day + ' 2027: ' + a.match + ' in ' + a.city + ', ' + a.venue + '. Kick-off ' + a.kick + '.'; }

  /* ---------- Copy page: text/html and text/plain ---------- */
  // stamp: the word before the date in the plain text, 'Copied on' unless the text is saved as a file
  function buildPage(data, stops, cfg, stamp) {
    cfg = cfg || CONFIG;
    var g = group(stops), ov = overview(g, stops), src = link(data.page.sourceUrl, cfg);
    var h = '<h1>' + esc(data.page.title) + '</h1>';
    h += '<p>Source: <a href="' + esc(src) + '">' + esc(data.page.sourceName) + '</a></p>';
    h += '<p>' + esc(ov) + '</p>';
    var t = [data.page.title.toUpperCase(), 'Source: ' + src, (stamp || 'Copied on') + ' ' + copiedOn(cfg), '', ov];
    var away = awayMatches();
    if (away.length) {
      h += '<h2>Away from NSW</h2><ul>' + away.map(function (a) { return '<li>' + esc(awayLine(a)) + '</li>'; }).join('') + '</ul>';
      t.push('', 'AWAY FROM NSW', new Array(25).join('-'));
      away.forEach(function (a) { t.push('- ' + awayLine(a)); });
    }
    function stopHtml(s) {
      var u = link(s.url, cfg);
      return '<li>' + (u ? '<a href="' + esc(u) + '">' + esc(s.name) + '</a>' : esc(s.name)) + ' [' + esc(s.type) + ']' + (details(s) ? ': ' + esc(details(s)) : '') + '</li>';
    }
    function stopText(s) {
      var u = link(s.url, cfg), l = ['- ' + s.name + ' [' + s.type + ']'];
      if (details(s)) l.push('  ' + details(s));
      if (u) l.push('  ' + u);
      return l;
    }
    g.days.forEach(function (d, n) {
      var title = d.label + ' 2027'; // the date itself: a "Day 1" count would start from the first planned day, not the trip
      h += '<h2>' + esc(title) + '</h2><ul>' + d.stops.map(stopHtml).join('') + '</ul>';
      t.push('', title.toUpperCase(), new Array(Math.max(24, Math.min(60, title.length)) + 1).join('-'));
      d.stops.forEach(function (s) { stopText(s).forEach(function (x) { t.push(x); }); });
    });
    if (g.rest.length) {
      h += '<h2>Not yet planned</h2><ul>' + g.rest.map(stopHtml).join('') + '</ul>';
      t.push('', 'NOT YET PLANNED', new Array(25).join('-'));
      g.rest.forEach(function (s) { stopText(s).forEach(function (x) { t.push(x); }); });
    }
    return { html: h, text: t.join('\n'), count: stops.length };
  }

  /* ---------- Copy for spreadsheet: a ten-column table ---------- */
  // Tabs and newlines inside a field become one space, then it is trimmed; a field that starts with = + - or @ gets a leading space
  function tsvField(v) {
    var s = String(v == null ? '' : v).replace(/[\t\r\n]+/g, ' ').trim();
    return /^[=+\-@]/.test(s) ? ' ' + s : s;
  }
  // The same guard for the HTML table, using a non-breaking space because HTML collapses an ordinary one
  function htmlField(v) {
    var s = String(v == null ? '' : v).replace(/[\t\r\n]+/g, ' ').trim();
    return /^[=+\-@]/.test(s) ? ' ' + s : s;
  }
  function buildSheet(data, stops, cfg) {
    cfg = cfg || CONFIG;
    var rows = stops.map(function (s, i) {
      // Theme and Time of day stay empty unless the fan set them; a match's kick-off is the one time we know
      return [s.day === 'Not yet planned' ? s.day : s.day + ' 2027', s.theme || '', s.kickoff || '', i + 1, s.name, s.type, s.area, s.address, s.description, link(s.url, cfg)];
    });
    // Matches outside NSW come last, with no order number, so the fan's own order stays as it is
    awayMatches().forEach(function (a) { rows.push([a.day + ' 2027', '', a.kick, '', a.match, 'Match (outside NSW)', a.city, a.venue, 'Outside NSW, during your days in NSW', '']); });
    var text = [COLUMNS.map(tsvField).join('\t')].concat(rows.map(function (r) { return r.map(tsvField).join('\t'); })).join('\n');
    // The same rows as a .csv file: every field quoted, with the same leading-character guard
    var csv = [COLUMNS].concat(rows).map(function (r) { return r.map(function (v) { return '"' + tsvField(v).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
    var html = '<table><thead><tr>' + COLUMNS.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr>' + r.map(function (v, c) {
        if (c === 4 && r[9]) return '<td><a href="' + esc(r[9]) + '">' + esc(htmlField(v)) + '</a></td>';
        return '<td>' + esc(htmlField(v)) + '</td>';
      }).join('') + '</tr>';
    });
    html += '</tbody></table>';
    return { html: html, text: text, csv: csv, count: stops.length };
  }

  /* ---------- Clipboard: both formats in one write, then plain text, then a box to copy from ---------- */
  var fallbackBox = document.getElementById('cn-fallback');
  var fallbackText = document.getElementById('cn-fallback-text');
  function hideFallback() { fallbackBox.hidden = true; }
  phone.addEventListener('cn:screen', function (e) { if (e.detail !== 'm3') hideFallback(); });

  // The write call is made straight from the click, with the blobs ready, so Safari accepts it as a user gesture
  function copyBoth(c) {
    var canRich = !!(window.ClipboardItem && navigator.clipboard && navigator.clipboard.write);
    var rich = null;
    if (canRich) {
      try { rich = navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([c.html], { type: 'text/html' }), 'text/plain': new Blob([c.text], { type: 'text/plain' }) })]); }
      catch (e) { rich = null; }
    }
    var plain = function () {
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(c.text).then(function () { return 'fallback'; });
      return Promise.reject(new Error('No clipboard'));
    };
    return (rich ? rich.then(function () { return 'success'; }) : Promise.reject(new Error('No rich write'))).catch(plain).catch(function () {
      // Neither worked: a read-only box with the text selected
      fallbackText.value = c.text;
      fallbackBox.hidden = false;
      fallbackText.focus({ preventScroll: false });
      fallbackText.select();
      return 'manual';
    });
  }
  function track(ev) {
    (window.dataLayer = window.dataLayer || []).push(ev);
    console.log('dataLayer', ev);
  }
  function run(tile, build, opts) {
    hideFallback();
    var stops = currentStops(DATA), c;
    try { c = build(DATA, stops); }
    catch (e) { track(opts.event(0, 'error')); window.cnShowCopied(tile, 'Sorry, that did not copy. Try again.', true); return; }
    copyBoth(c).then(function (how) {
      // success: both formats written. fallback: plain text only, or a box to copy from.
      track(opts.event(c.count, how === 'success' ? 'success' : 'fallback'));
      if (how === 'manual') { window.cnShowBlocked(tile); fallbackText.focus(); fallbackText.select(); }
      else window.cnShowCopied(tile, opts.done);
    });
  }
  chatTile.addEventListener('click', function () {
    run(chatTile, buildPage, {
      done: 'Copied. Paste it into Notes, an email, a document or a chat.',
      event: function (n, outcome) { return { event: 'copy_page', copy_format: 'rich_and_plain', stop_count: n, page_path: location.pathname, outcome: outcome }; }
    });
  });
  sheetTile.addEventListener('click', function () {
    run(sheetTile, buildSheet, {
      done: 'Copied for your spreadsheet. Paste into cells.',
      event: function (n, outcome) { return { event: 'copy_for_spreadsheet', stop_count: n, outcome: outcome }; }
    });
  });

  // The AI assistant tile (prototype-itinerary.html) uses the same box when the browser blocks copying
  window.cnShowManual = function (tile, text) {
    fallbackText.value = text;
    fallbackBox.hidden = false;
    window.cnShowBlocked(tile);
    fallbackText.focus();
    fallbackText.select();
  };

  /* ---------- Print and download: the whole plan, built from the same copy text ---------- */
  var printTile = document.getElementById('cn-tile-print');
  var txtTile = document.getElementById('cn-tile-txt');
  var csvTile = document.getElementById('cn-tile-csv');
  // "rwc-2027-itinerary-26-sep-to-11-oct", from the trip dates when they are set
  function fileName(ext) {
    var t = window.cnTripSetup || {}, d = function (x) { return String(x || '').split(' ').slice(1).join('-').toLowerCase(); };
    return 'rwc-2027-itinerary' + (t.arrive && t.leave ? '-' + d(t.arrive) + '-to-' + d(t.leave) : '') + '.' + ext;
  }
  function download(tile, body, type, ext, event) {
    hideFallback();
    var name = fileName(ext), a = document.createElement('a');
    // A byte order mark so Excel reads the .csv as UTF-8
    a.href = URL.createObjectURL(new Blob([ext === 'csv' ? '\ufeff' + body : body], { type: type + ';charset=utf-8' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    track({ event: event, stop_count: currentStops(DATA).length });
    window.cnShowCopied(tile, 'Downloaded ' + name);
  }
  if (txtTile) txtTile.addEventListener('click', function () { var c = buildPage(DATA, currentStops(DATA), CONFIG, 'Downloaded on'); download(txtTile, c.text, 'text/plain', 'txt', 'download_txt'); });
  if (csvTile) csvTile.addEventListener('click', function () { var c = buildSheet(DATA, currentStops(DATA)); download(csvTile, c.csv, 'text/csv', 'csv', 'download_csv'); });
  // Print lays out the Group chat page on its own, in a hidden frame, so the wireframe around the phone is not printed
  if (printTile) printTile.addEventListener('click', function () {
    hideFallback();
    var c = buildPage(DATA, currentStops(DATA)), old = document.getElementById('cn-print-frame');
    if (old) old.remove();
    var f = document.createElement('iframe');
    f.id = 'cn-print-frame'; f.title = 'Itinerary for printing'; f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1;
    f.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(f);
    var doc = f.contentDocument;
    doc.open();
    doc.write('<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><title>' + esc(DATA.page.title) + '</title><style>body{font:11pt/1.5 system-ui,sans-serif;color:#111;margin:1.5cm}h1{font-size:18pt;margin:0 0 6pt}h2{font-size:13pt;margin:16pt 0 4pt;break-after:avoid}ul{margin:0;padding-left:16pt}li{margin:3pt 0;break-inside:avoid}a{color:#111}a[href]::after{content:" (" attr(href) ")";font-size:9pt;color:#444;word-break:break-all}p{margin:0 0 6pt}</style></head><body>' + c.html + '<p style="margin-top:16pt;font-size:9pt;color:#444">Printed on ' + esc(copiedOn()) + '. Times and prices can change, so check before you go.</p></body></html>');
    doc.close();
    track({ event: 'print_plan', stop_count: c.count });
    f.contentWindow.focus();
    f.contentWindow.print();
  });

  // For testing and for swapping in the real stop data: window.cnCopy.data, .config, .buildPage(data, stops), .buildSheet(data, stops)
  window.cnCopy = { data: DATA, config: CONFIG, buildPage: buildPage, buildSheet: buildSheet, currentStops: function () { return currentStops(DATA); } };
})();
