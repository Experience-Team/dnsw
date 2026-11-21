/* Tokens, read from the code. Code is the source of truth: these pages fetch the same CSS files the wireframes and
   prototypes load, pull out each brand's custom properties (with the comment beside each one as its description), and
   resolve var() chains per brand. Nothing here repeats a value. */
(function () {
  'use strict';

  /* Each brand: the file and the rule that holds its tokens, and the brand it builds on. `frame` says how the live
     example frame switches the prototypes' own CSS into this brand. */
  var BRANDS = [
    { id: 'wireframe', name: 'Wireframe', owner: 'DNSW', file: '/wireframes/shared.css', selector: ':root',
      status: 'Base', frame: {} },
    { id: 'third-half', name: 'The Third Half', owner: 'DNSW', file: '/wireframes/themes/hifi.css',
      selector: ':root[data-theme="hifi"] .cn-phone', base: 'wireframe', status: 'Draft v0.1',
      frame: { theme: 'hifi' },
      colourways: [
        { id: 'orange', name: 'Orange', selector: null },
        { id: 'green', name: 'Green', selector: ':root[data-theme="hifi"][data-colourway="green"] .cn-phone' },
        { id: 'violet', name: 'Violet', selector: ':root[data-theme="hifi"][data-colourway="violet"] .cn-phone' },
        { id: 'clay', name: 'Clay', selector: ':root[data-theme="hifi"][data-colourway="clay"] .cn-phone' }
      ] },
    { id: 'sydney', name: 'Sydney.com', owner: 'DNSW', file: '/wireframes/themes/sydney.css', selector: '.theme-sydney',
      base: 'wireframe', status: 'Page tokens only', frame: { bodyClass: 'theme-sydney' } },
    { id: 'visitnsw', name: 'Visit NSW', owner: 'DNSW', file: '/wireframes/themes/nsw.css', selector: '.theme-nsw',
      base: 'wireframe', status: 'Page tokens only', frame: { bodyClass: 'theme-nsw' } },
    { id: 'rwc-2027', name: 'RWC 2027 page style', owner: 'To confirm', file: '/wireframes/themes/rwc-2027.css',
      selector: '.theme-rwc', base: 'wireframe', status: 'Concept', frame: { bodyClass: 'theme-rwc' } }
  ];

  var files = {};
  function fetchText(url) {
    if (!files[url]) files[url] = fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.text();
    });
    return files[url];
  }

  /* The body of the first rule whose selector is exactly `selector`, skipping comments while matching braces */
  function ruleBody(css, selector) {
    var i = 0;
    while (true) {
      var at = css.indexOf(selector, i);
      if (at < 0) return null;
      var after = css.slice(at + selector.length).match(/^\s*\{/);
      var prev = at ? css[at - 1] : '\n';
      if (after && /[\s},]/.test(prev)) {
        var start = at + selector.length + after[0].length, depth = 1, j = start;
        while (j < css.length && depth) {
          if (css[j] === '/' && css[j + 1] === '*') { j = css.indexOf('*/', j + 2); if (j < 0) return null; j += 2; continue; }
          if (css[j] === '{') depth++;
          else if (css[j] === '}') depth--;
          j++;
        }
        return css.slice(start, j - 1);
      }
      i = at + selector.length;
    }
  }

  /* Custom properties in a rule body, in order, with the comment that follows each on its line, and the most recent
     heading comment on a line of its own (for grouping) */
  function parse(body) {
    var out = [], heading = '';
    body.split('\n').forEach(function (line) {
      var t = line.trim();
      var head = t.match(/^\/\*\s*(.*?)\s*(\*\/)?$/);
      if (head && t.indexOf('--') !== 0) { heading = head[1].replace(/^[─\s\d.a-z]*?(?=[A-Z])/, '').replace(/[─\s]+$/, ''); return; }
      var re = /(--[\w-]+)\s*:\s*([^;]+);(?:[ \t]*\/\*\s*(.*?)\s*\*\/)?/g, m;
      while ((m = re.exec(line))) out.push({ name: m[1], value: m[2].trim(), note: m[3] || '', heading: heading });
    });
    return out;
  }

  function brand(id) { return BRANDS.filter(function (b) { return b.id === id; })[0]; }

  /* All declarations for a brand: its base's, then its own on top, then a colourway on top of that */
  var cache = {};
  function load(id, colourway) {
    var key = id + '/' + (colourway || '');
    if (cache[key]) return cache[key];
    var b = brand(id);
    cache[key] = Promise.all([
      b.base ? load(b.base) : Promise.resolve(null),
      fetchText(b.file)
    ]).then(function (res) {
      var base = res[0], css = res[1];
      var own = parse(ruleBody(css, b.selector) || '');
      var cw = null;
      if (colourway && b.colourways) {
        var c = b.colourways.filter(function (x) { return x.id === colourway; })[0];
        if (c && c.selector) cw = parse(ruleBody(css, c.selector) || '');
      }
      var map = {}, order = [];
      if (base) base.order.forEach(function (n) { map[n] = Object.assign({}, base.map[n], { overrides: false }); order.push(n); });
      function put(list, from) {
        list.forEach(function (d) {
          var prev = map[d.name];
          if (!prev) order.push(d.name);
          map[d.name] = { name: d.name, value: d.value, note: d.note || (prev && prev.note) || '',
            heading: prev ? prev.heading : d.heading, from: from, overrides: !!prev };
        });
      }
      put(own, id);
      if (cw) put(cw, id);
      return { id: id, map: map, order: order, own: own.map(function (d) { return d.name; }) };
    });
    return cache[key];
  }

  /* Follow var() to a final value. Returns { value, chain } where chain lists the names passed through. */
  function resolve(set, name, seen) {
    seen = seen || [];
    var d = set.map[name];
    if (!d || seen.indexOf(name) >= 0) return { value: '', chain: seen.concat(name) };
    var chain = seen.concat(name);
    var v = d.value.replace(/var\((--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, function (all, n, fb) {
      var r = resolve(set, n, chain);
      return r.value || (fb ? fb.trim() : all);
    });
    var direct = d.value.match(/^var\((--[\w-]+)\)$/);
    var sub = direct ? resolve(set, direct[1], chain).chain : chain;
    return { value: v, chain: direct ? sub : chain };
  }

  /* Colour maths for contrast: let the browser turn any CSS colour (hex, rgba, color-mix) into numbers */
  var probe;
  function rgba(css) {
    if (!probe) { probe = document.createElement('i'); probe.style.display = 'none'; document.body.appendChild(probe); }
    probe.style.color = '';
    probe.style.color = css;
    if (!probe.style.color) return null;
    var s = getComputedStyle(probe).color;
    var n = s.match(/[\d.]+/g);
    if (!n) return null;
    if (/^color\(srgb/.test(s)) return [n[0] * 255, n[1] * 255, n[2] * 255, n[3] != null ? +n[3] : 1];
    return [+n[0], +n[1], +n[2], n[3] != null ? +n[3] : 1];
  }
  function over(fg, bg) { var a = fg[3]; return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1]; }
  function lum(c) { return [c[0], c[1], c[2]].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (s, v, i) { return s + v * [0.2126, 0.7152, 0.0722][i]; }, 0); }
  function contrast(fgCss, bgCss) {
    var bg = rgba(bgCss), fg = rgba(fgCss);
    if (!bg || !fg) return null;
    if (bg[3] < 1) bg = over(bg, [255, 255, 255, 1]);
    if (fg[3] < 1) fg = over(fg, bg);
    var a = lum(fg), b = lum(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  function hex(css) {
    var c = rgba(css);
    if (!c) return css;
    var h = '#' + [c[0], c[1], c[2]].map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join('').toUpperCase();
    return c[3] < 1 ? h + ' at ' + Math.round(c[3] * 100) + '%' : h;
  }

  /* The prototypes' icon set (window.tpIcons in concepts-teams.js), read as text rather than run, so none of that
     file's page code executes here */
  var iconsP = null;
  function loadIcons() {
    if (!iconsP) iconsP = fetchText('/wireframes/concepts-teams.js').then(function (js) {
      var at = js.indexOf('window.tpIcons = {');
      if (at < 0) throw new Error('tpIcons not found');
      var block = js.slice(at, js.indexOf('\n  };', at));
      var out = {}, re = /^\s*(\w+):\s*'(<svg[^']*)'/gm, m;
      while ((m = re.exec(block))) out[m[1]] = m[2];
      return out;
    });
    return iconsP;
  }

  window.DSTokens = { BRANDS: BRANDS, brand: brand, load: load, loadIcons: loadIcons, resolve: resolve, contrast: contrast, hex: hex, rgba: rgba, fetchText: fetchText, ruleBody: ruleBody, parse: parse };
})();
