/* Prototype viewer: Compare options (22 Nov). Tools version only, in the desktop viewer.
   Up to three more phones beside the main one, labelled Option A, B and C. Each is this page in a frame
   (?phone&tools&opt=a…), so it is the real prototype, not a picture. Its option flags are the design tests and the
   theme, set per option in the panel and passed in its address: theme=, fan= (Stacked hand), plan= (one day at a time),
   slogan=. Its saved state is its own: the <head> of the page files every storage key of a framed option under opt-a:
   (and so on). When an option is added, the main phone's saved state is copied under its name, so it starts where the
   main phone is; after that nothing is shared. Removing an option clears what it saved. The list of options and their
   flags is kept in this browser (pv-compare), so they come back on reload. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('pv-tools') || root.classList.contains('pv-device') || root.classList.contains('pv-opt')) return;
  var panel = document.getElementById('pv-cmp-panel'), stage = document.getElementById('tp-stage');
  if (!panel || !stage) return;
  var main = stage.querySelector('.pv-phone'), list = document.getElementById('pv-cmp-list'), addBtn = document.getElementById('pv-cmp-add');
  var status = document.getElementById('pv-cmp-status'), spare = stage.querySelector('.pv-spare');
  var KEY = 'pv-compare', IDS = ['a', 'b', 'c'];
  var FLAGS = [
    { k: 'theme', label: 'High fidelity', on: 'hifi', off: 'wireframe' },
    { k: 'fan', label: 'Stacked hand (test)', on: 'stacked', off: 'classic' },
    { k: 'plan', label: 'Plan: one day at a time (test)', on: 'swipe', off: 'cards' },
    { k: 'slogan', label: 'Slogan B (test)', on: 'b', off: 'a' },
    { k: 'flow', label: 'Option A flow (test)', on: 'a', off: 'main' }
  ];
  var opts = [], els = {};
  try { var rec = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(rec)) opts = rec.filter(function (o) { return o && IDS.indexOf(o.id) > -1; }); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(opts)); } catch (e) {} }
  function name(id) { return 'Option ' + id.toUpperCase(); }
  function say(t) { status.textContent = ''; setTimeout(function () { status.textContent = t; }, 30); }

  // The main phone's flags as they are now, for a new option to start from
  function mainFlags() {
    var fan = document.getElementById('tp-fan-toggle');
    return {
      theme: root.getAttribute('data-theme') === 'hifi' ? 'hifi' : 'wireframe',
      fan: fan && fan.getAttribute('aria-checked') === 'false' ? 'classic' : 'stacked',
      plan: root.getAttribute('data-plan') === 'swipe' ? 'swipe' : 'cards',
      slogan: root.getAttribute('data-slogan') === 'b' ? 'b' : 'a',
      flow: root.getAttribute('data-flow') === 'a' ? 'a' : 'main'
    };
  }
  function keys(store) { var out = []; try { for (var i = 0; i < store.length; i++) out.push(store.key(i)); } catch (e) {} return out; }
  // The main phone's saved state (its picks, tickets, days, plan, the Drop goal's) copied under the option's name.
  // Viewer settings (the theme, the annotations, this list) and other options' keys are not copied
  function copyState(id) {
    keys(localStorage).forEach(function (k) {
      if (/^opt-[abc]:/.test(k) || /^flow-a:/.test(k) || /^pv-/.test(k) || k === 'tp-annotations') return; // on Option A's tab, reading k gives Option A's own state
      try { localStorage.setItem('opt-' + id + ':' + k, localStorage.getItem(k)); } catch (e) {}
    });
  }
  function clearState(id) {
    [localStorage, sessionStorage].forEach(function (s) {
      keys(s).forEach(function (k) { if (k.indexOf('opt-' + id + ':') === 0) try { s.removeItem(k); } catch (e) {} });
    });
  }
  function url(o, view) {
    return location.pathname + '?phone&tools&opt=' + o.id + '&theme=' + o.theme + '&fan=' + o.fan + '&plan=' + o.plan +
      (o.slogan === 'b' ? '&slogan=b' : '') + (o.flow === 'a' ? '&flow=a' : '') + (view ? '&view=' + view : '');
  }

  function flagRow(o, f) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'cn-switch pv-switch'; b.setAttribute('role', 'switch');
    b.setAttribute('aria-checked', o[f.k] === f.on ? 'true' : 'false'); b.dataset.flag = f.k;
    b.innerHTML = '<span class="cn-switch-track" aria-hidden="true"></span>' + f.label;
    return b;
  }
  function build(o) {
    var li = document.createElement('li');
    li.className = 'pv-cmp-opt'; li.dataset.id = o.id;
    li.setAttribute('aria-label', name(o.id));
    li.innerHTML = '<div class="pv-cmp-opt-head"><span class="pv-cmp-opt-name">' + name(o.id) + '</span>' +
      '<button type="button" class="pv-cmp-rm" data-rm aria-label="Remove ' + name(o.id) + '">Remove</button></div><div class="pv-cmp-flags"></div>';
    var fl = li.querySelector('.pv-cmp-flags');
    FLAGS.forEach(function (f) { fl.appendChild(flagRow(o, f)); });
    var fr = document.createElement('div');
    fr.className = 'pv-cmp-frame'; fr.dataset.id = o.id;
    fr.innerHTML = '<p class="pv-cmp-label">' + name(o.id) + '</p>';
    var ifr = document.createElement('iframe');
    ifr.title = name(o.id) + ', phone screen'; ifr.src = url(o);
    fr.appendChild(ifr);
    els[o.id] = { li: li, frame: fr, ifr: ifr };
  }
  // Lists and frames in A, B, C order, frames to the right of the main phone
  function place() {
    var after = main;
    IDS.forEach(function (id) {
      var e = els[id]; if (!e) return;
      list.appendChild(e.li);
      after.parentNode.insertBefore(e.frame, after.nextSibling); after = e.frame;
    });
    var n = opts.length;
    stage.classList.toggle('has-cmp', n > 0);
    addBtn.disabled = n >= IDS.length;
    addBtn.setAttribute('aria-describedby', 'pv-cmp-p');
    if (spare) spare.hidden = n > 0;
  }

  addBtn.addEventListener('click', function () {
    var id = IDS.filter(function (x) { return !els[x]; })[0]; if (!id) return;
    var o = mainFlags(); o.id = id;
    clearState(id); copyState(id);
    opts.push(o); opts.sort(function (a, b) { return a.id < b.id ? -1 : 1; }); save();
    build(o); place();
    els[id].frame.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', inline: 'nearest', block: 'nearest' });
    say(name(id) + ' added beside the main phone, a copy of it.');
  });
  list.addEventListener('click', function (e) {
    var li = e.target.closest('.pv-cmp-opt'); if (!li) return;
    var id = li.dataset.id, o = opts.filter(function (x) { return x.id === id; })[0], ed = els[id]; if (!o || !ed) return;
    if (e.target.closest('[data-rm]')) {
      clearState(id);
      opts = opts.filter(function (x) { return x !== o; }); save();
      ed.li.remove(); ed.frame.remove(); delete els[id];
      place(); addBtn.focus();
      say(name(id) + ' removed.');
      return;
    }
    var sw = e.target.closest('[data-flag]'); if (!sw) return;
    var f = FLAGS.filter(function (x) { return x.k === sw.dataset.flag; })[0];
    o[f.k] = o[f.k] === f.on ? f.off : f.on; save();
    sw.setAttribute('aria-checked', o[f.k] === f.on ? 'true' : 'false');
    // The option loads again with its new flag, on the tab it was showing; what it saved stays
    var view = null; try { view = ed.ifr.contentWindow.tpView.get(); } catch (err) {}
    ed.ifr.src = url(o, view === 'event' ? 'home' : view);
    say(name(id) + ': ' + f.label.replace(' (test)', '') + (o[f.k] === f.on ? ' on.' : ' off.'));
  });

  opts.forEach(build); place();
})();
