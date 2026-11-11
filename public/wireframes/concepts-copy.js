/* Concepts: "Group chat" (copy the page) and "Spreadsheet" (copy a table) on the Save and share sheet.
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
  var TIME_SLOTS = ['Morning', 'Lunch', 'Afternoon', 'Evening'];
  var COLUMNS = ['Day', 'Theme', 'Time of day', 'Order', 'Name', 'Type', 'Area', 'Address', 'Details', 'Link'];

  /* ---------- Placeholder data (prototype only) ----------
     One object per stop with the fields in the brief. Each stop's day comes from where it sits in the list, so a stop
     dragged to another day moves with its day's theme, start point and getting there. Replace with the real stop data. */
  var DATA = {
    page: {
      title: 'Your Rugby World Cup 2027 itinerary',
      sourceName: 'sydney.com',
      sourceUrl: 'https://www.sydney.com/'
    },
    days: {
      'Fri 8 Oct': { theme: 'Parklands and the fan zone', startPoint: 'Sydney CBD', gettingThere: 'Use public transport with an Opal or contactless card.' },
      'Sat 9 Oct': { theme: 'Match day', startPoint: 'Sydney CBD', gettingThere: 'Use public transport with an Opal or contactless card and allow time for crowds.' },
      'Sun 10 Oct': { theme: 'A day by the water', startPoint: 'Sydney CBD', gettingThere: 'Use public transport with an Opal or contactless card.' }
    },
    stops: [
      { id: 'centennial-parklands', timeOfDay: 'Morning', name: 'Centennial Parklands', type: 'Area', area: 'Centennial Park', address: 'Street name, Centennial Park NSW', description: 'A large park close to the city, good for a walk before the weekend.', url: 'https://www.sydney.com/' },
      { id: 'fan-zone', timeOfDay: 'Evening', name: 'Fan zone', type: 'Event', area: 'Darling Harbour', address: 'Tumbalong Park, Darling Harbour NSW', description: 'Watch matches on the big screens with fans from around the world. Dates to be confirmed.', url: '' },
      { id: 'nz-v-australia', timeOfDay: 'Evening', name: 'New Zealand v Australia', type: 'Event', area: 'Sydney Olympic Park', address: 'Stadium Australia, Sydney Olympic Park NSW', description: 'Pool match, kick-off 5:10 pm.', url: 'https://www.sydney.com/' },
      { id: 'patonga-beach', timeOfDay: 'Lunch', name: 'Patonga Beach', type: 'Area', area: 'Patonga', address: 'Street name, Patonga NSW', description: 'A quiet beach on the way north. A hidden gem.', url: 'https://www.sydney.com/' },
      { id: 'newcastle-ocean-baths', timeOfDay: '', name: 'Newcastle Ocean Baths', type: 'Attraction', area: 'Newcastle East', address: 'Street name, Newcastle East NSW', description: 'A coastal stop in Newcastle.', url: '' }
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
        var d = dated ? (data.days[label] || {}) : {};
        out.push(Object.assign({}, s, {
          day: dated ? label : 'Not yet planned', dayTheme: d.theme || '', startPoint: d.startPoint || '', gettingThere: d.gettingThere || ''
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
  // Dated days in order, each with its stops grouped by time of day; then the stops with no day
  function group(stops) {
    var days = [], idx = {}, rest = [];
    stops.forEach(function (s) {
      if (s.day === 'Not yet planned') { rest.push(s); return; }
      if (!(s.day in idx)) { idx[s.day] = days.length; days.push({ label: s.day, theme: s.dayTheme, startPoint: s.startPoint, gettingThere: s.gettingThere, stops: [] }); }
      days[idx[s.day]].stops.push(s);
    });
    days.forEach(function (d) {
      var slots = TIME_SLOTS.concat(['Anytime']);
      d.slots = slots.map(function (name) {
        return { name: name, stops: d.stops.filter(function (s) { return (TIME_SLOTS.indexOf(s.timeOfDay) > -1 ? s.timeOfDay : 'Anytime') === name; }) };
      }).filter(function (sl) { return sl.stops.length; });
    });
    return { days: days, rest: rest };
  }
  function overview(g, stops) {
    var setup = window.cnTripSetup || {};
    return 'A ' + g.days.length + '-day plan with ' + stops.length + ' stops' + (setup.arrive && setup.leave ? ', from ' + setup.arrive + ' to ' + setup.leave : '') + '.';
  }
  function noStop(x) { return String(x || 'to be confirmed').replace(/[.\s]+$/, ''); } // one full stop at the end, whatever the data has
  function dayLine(d) { return d.label + '. Start point: ' + noStop(d.startPoint) + '. Getting there: ' + noStop(d.gettingThere) + '.'; }

  /* ---------- Copy page: text/html and text/plain ---------- */
  function buildPage(data, stops, cfg) {
    cfg = cfg || CONFIG;
    var g = group(stops), ov = overview(g, stops), src = link(data.page.sourceUrl, cfg);
    var h = '<h1>' + esc(data.page.title) + '</h1>';
    h += '<p>Source: <a href="' + esc(src) + '">' + esc(data.page.sourceName) + '</a></p>';
    h += '<p>' + esc(ov) + '</p>';
    var t = [data.page.title.toUpperCase(), 'Source: ' + src, 'Copied on ' + copiedOn(cfg), '', ov];
    function stopHtml(s) {
      var u = link(s.url, cfg);
      return '<li>' + (u ? '<a href="' + esc(u) + '">' + esc(s.name) + '</a>' : esc(s.name)) + ' [' + esc(s.type) + ']' + (s.description ? ': ' + esc(s.description) : '') + '</li>';
    }
    function stopText(s) {
      var u = link(s.url, cfg), l = ['- ' + s.name + ' [' + s.type + ']'];
      if (s.description) l.push('  ' + s.description);
      if (u) l.push('  ' + u);
      return l;
    }
    g.days.forEach(function (d, n) {
      var title = 'Day ' + (n + 1) + (d.theme ? ': ' + d.theme : '');
      h += '<h2>' + esc(title) + '</h2><p>' + esc(dayLine(d)) + '</p>';
      t.push('', title.toUpperCase(), new Array(Math.max(24, Math.min(60, title.length)) + 1).join('-'), dayLine(d));
      d.slots.forEach(function (sl) {
        h += '<h3>' + esc(sl.name) + '</h3><ul>' + sl.stops.map(stopHtml).join('') + '</ul>';
        t.push('', sl.name.toUpperCase());
        sl.stops.forEach(function (s) { stopText(s).forEach(function (x) { t.push(x); }); });
      });
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
      return [s.day, s.dayTheme, s.timeOfDay, i + 1, s.name, s.type, s.area, s.address, s.description, link(s.url, cfg)];
    });
    var text = [COLUMNS.map(tsvField).join('\t')].concat(rows.map(function (r) { return r.map(tsvField).join('\t'); })).join('\n');
    var html = '<table><thead><tr>' + COLUMNS.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr>' + r.map(function (v, c) {
        if (c === 4 && r[9]) return '<td><a href="' + esc(r[9]) + '">' + esc(htmlField(v)) + '</a></td>';
        return '<td>' + esc(htmlField(v)) + '</td>';
      }).join('') + '</tr>';
    });
    html += '</tbody></table>';
    return { html: html, text: text, count: stops.length };
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
      if (how === 'manual') window.cnShowCopied(tile, 'Press Cmd+C or Ctrl+C to copy', true);
      else window.cnShowCopied(tile, opts.done);
      if (how === 'manual') fallbackText.focus();
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

  // For testing and for swapping in the real stop data: window.cnCopy.data, .config, .buildPage(data, stops), .buildSheet(data, stops)
  window.cnCopy = { data: DATA, config: CONFIG, buildPage: buildPage, buildSheet: buildSheet, currentStops: function () { return currentStops(DATA); } };
})();
