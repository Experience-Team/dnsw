/* Drop goal, Version 2: which place a goal lands in, the result screen, See the places, and Save.
   docs/drop-goal-brief.md (Result screen, Places). Style: docs/drop-goal-style.png (left).
   - The person's places come from where their picked teams play in NSW (the match fixtures, ../../concepts-fixtures.js):
     Sydney, Newcastle, or both. No team, or Every NSW match: both. No place repeats until every place in the set has
     been shown once (kept for this visit). Within each round of the set, places in the city of their next match come
     two for every one from the other city, so the weight changes the order, never how often a place is shown.
   - Save writes Version 2's own copy of the planner's saved state (the same shape as Options A to C's tp-pick-v1, in
     concepts-teams.js), filed under v2:, so Version 2's plan can read it once it has one. Nothing else is changed.
   - The result screen is a full-screen layer over the kick screen; See the places is a full-screen layer too, open
     from the kick screen and the result, so nobody has to score to see the places. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const PLACES = window.DG2Places || [];
  /* Watch parties (24 Nov, the January brief; watch-parties.js, sample data, contract §20). The first picked team, the
     kicker, decides what a goal lands on: places near where they play if they have a match in NSW, and their watch
     parties in NSW if they have none. A watch party goes on the same card as a place. */
  const PARTIES = window.DG2Parties || [];
  const byId = id => PLACES.concat(PARTIES).find(p => p.id === id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const CITY = { sydney: 'Sydney', newcastle: 'Newcastle' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const IMG = f => '../../assets/images/' + encodeURIComponent(f);

  /* ---------- the person's matches ---------- */
  const FIX = (window.cnFixtures || []).filter(f => !f.a && f.t);
  const MON = { Oct: 9, Nov: 10 };
  const dateOf = f => { const m = /(\d+) (\w+)/.exec(f.d); return Date.UTC(2027, MON[m[2]], +m[1]); };
  const cityOf = f => (f.v === 'Newcastle Stadium' ? 'newcastle' : 'sydney');
  const matchesOf = teams => FIX.filter(f => f.t.split(' v ').some(t => teams.indexOf(t) > -1)).sort((a, b) => dateOf(a) - dateOf(b));
  function nextOf(ms) { const today = Date.now(); return ms.find(m => dateOf(m) + 864e5 > today) || ms[0] || null; }

  /* The kicker's watch parties, when the kicker's team has no match in NSW; otherwise none, and a goal lands on places */
  function partiesFor(teams) {
    const t = teams[0];
    return t && !matchesOf([t]).length ? PARTIES.filter(p => p.team === t) : [];
  }
  /* The kicker's next NSW match, beside a place: "England v Wales · Sat 16 Oct, 7:45pm · Stadium Australia".
     Contract §17: with no kick-off the time is left out */
  function matchLine(teams) {
    const m = teams[0] && nextOf(matchesOf([teams[0]]));
    return m ? `${m.t} \u00b7 ${m.d}${m.k ? ', ' + m.k : ''} \u00b7 ${m.v}` : '';
  }

  /* The set a goal draws from: which cities, and which one comes first in each round */
  function setFor(teams) {
    const ms = matchesOf(teams), cities = [...new Set(ms.map(cityOf))];
    if (!cities.length) return { key: 'mix', cities: ['sydney', 'newcastle'], weight: null };
    if (cities.length === 1) return { key: cities[0], cities, weight: null };
    const first = cityOf(nextOf(ms));
    return { key: 'both-' + first, cities: [first, first === 'sydney' ? 'newcastle' : 'sydney'], weight: first };
  }

  /* ---------- rotation: every place in the set once before any repeats, kept for this visit ---------- */
  const ROT = 'v2:dg-rotation';   /* under v2:, so Version 2's Reset clears it */
  function rot() { try { return JSON.parse(sessionStorage.getItem(ROT)) || {}; } catch (e) { return {}; } }
  function keep(r) { try { sessionStorage.setItem(ROT, JSON.stringify(r)); } catch (e) {} }
  function next(teams) {
    /* A team with no NSW match: its watch parties, each once before any repeat, never the same twice running */
    const wp = partiesFor(teams);
    if (wp.length) {
      const r = rot(), key = 'wp-' + teams[0], st = r[key] || { seen: [] };
      let seen = st.seen.filter(id => wp.some(p => p.id === id)), last = null;
      if (seen.length >= wp.length) { last = seen[seen.length - 1]; seen = []; }
      const left = wp.filter(p => seen.indexOf(p.id) < 0 && !(p.id === last && wp.length > 1));
      const pick = left[Math.floor(Math.random() * left.length)];
      seen.push(pick.id); r[key] = { seen }; keep(r);
      return pick;
    }
    const S = setFor(teams), all = PLACES.filter(p => S.cities.indexOf(p.host_city) > -1), r = rot();
    const st = r[S.key] || { seen: [], k: 0 };
    let seen = st.seen.filter(id => all.some(p => p.id === id));
    let last = null;
    if (seen.length >= all.length) { last = seen[seen.length - 1]; seen = []; st.k = 0; }   /* the round is done: start again */
    /* a new round never opens with the place just shown, so it never comes twice in a row */
    const left = c => all.filter(p => p.host_city === c && seen.indexOf(p.id) < 0 && !(p.id === last && all.length > 1));
    let city = S.cities.length === 1 ? S.cities[0]
      : S.weight ? (st.k % 3 < 2 ? S.cities[0] : S.cities[1])            /* two from the next match's city, then one */
      : S.cities[st.k % 2];                                               /* no team: take turns */
    if (!left(city).length) city = S.cities.find(c => left(c).length);  /* that city is done for this round */
    st.k++;
    const fresh = left(city), pick = fresh[Math.floor(Math.random() * fresh.length)];
    seen.push(pick.id); st.seen = seen; r[S.key] = st; keep(r);
    return pick;
  }

  /* FITS: the match day it fits around, from the person's team; otherwise a general line */
  function fits(p, teams) {
    if (p.kind === 'watch') return p.match ? `${p.match.d}: ${p.match.t}` : '';   /* the match being screened */
    const ms = matchesOf(teams).filter(m => cityOf(m) === p.host_city), m = nextOf(ms);
    return m ? `${m.d}: before or after ${m.t}` : `A free day around ${CITY[p.host_city]}`;
  }

  /* ---------- Save: Version 2's own copy of the planner's saved state ---------- */
  const KEY = 'v2:tp-pick-v1';
  function readState() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && typeof s === 'object' ? s : {}; } catch (e) { return {}; } }
  function saved() { const a = readState().added; return Array.isArray(a) ? a.filter(x => x && x.kind === 'kick') : []; }
  const isSaved = p => saved().some(x => x.id === 'kick:' + p.id);
  /* The item has the planner's shape for a Drop goal save: Saved, not placed yet, never slotted onto a day */
  function toggle(p) {
    const s = readState(), on = !isSaved(p);
    const added = Array.isArray(s.added) ? s.added.filter(x => !(x && x.id === 'kick:' + p.id)) : [];
    if (on) added.push({ id: 'kick:' + p.id, kind: 'kick', title: p.name, day: '', unplaced: true, kick: { place: p.id, host_city: p.host_city } });
    s.added = added;
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return on;
  }

  const BOOKMARK = on => `<svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true" focusable="false"><path d="M1.5 1.5h9v11L6 9.6 1.5 12.5z" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  function saveBtn(b, p) {
    const on = isSaved(p);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('aria-label', on ? `Saved ${p.name} to your plan. Press to remove it` : `Save ${p.name} to your plan`);
    b.innerHTML = `<span class="dg-save-in">${BOOKMARK(on)}<span>${on ? 'Saved' : 'Save'}</span></span>`;
  }
  /* The bookmark pops as it fills, so the save is felt where the finger is */
  function pop(b) {
    const i = b.querySelector('svg');
    if (i && i.animate && !reduce.matches) i.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.34,1.4,.64,1)' });
  }
  function onSave(p, b) {
    const on = toggle(p);
    saveBtn(b, p);
    if (on) pop(b);
    document.querySelectorAll(`.dg-save[data-id="${p.id}"]`).forEach(x => { if (x !== b) saveBtn(x, p); });
    countLine();
    api.say(on ? `${p.name} saved to your plan.` : `${p.name} removed from your plan.`);
  }

  /* A picture. Without one, high fidelity shows a poster in the same space: the place's name on the team's colour, as
     it was framed in the posts (game.js sets api.teamColour). The wireframe keeps the drawn placeholder */
  function poster(p, cls) {
    const c = api.teamColour || { bg: '#256a3e', band: '#fdce01', ink: '#ffffff' };
    const words = p.name.toUpperCase().split(/\s+/), cap = Math.max(9, ...words.map(s => s.length)), lines = [];
    words.forEach(s => { const l = lines.length - 1; if (l >= 0 && (lines[l] + ' ' + s).length <= cap) lines[l] += ' ' + s; else lines.push(s); });
    const fs = Math.min(84 / (Math.max(...lines.map(s => s.length)) * 0.6), 44 / (lines.length * 0.92), 24);
    return `<span class="${cls} dg-poster" style="background:${c.bg};color:${c.ink}" role="img" aria-label="${esc(p.name)}, picture to come">` +
      `<b aria-hidden="true" style="font-size:${fs.toFixed(1)}cqw">${lines.map(esc).join('<br>')}</b><i style="background:${c.band}"></i></span>`;
  }
  function photo(p, cls) {
    if (!p.image && document.documentElement.getAttribute('data-theme') === 'hifi') return poster(p, cls);
    const pic = p.image ? `<img src="${IMG(p.image)}" alt="" loading="lazy">` : '';
    return `<span class="${cls}${p.stand_in ? ' dg-sample' : ''}${p.image ? ' has-img' : ''}" role="img" aria-label="${esc(p.image ? (p.stand_in ? 'Stand-in picture for ' : 'Picture of ') + p.name : 'Picture of ' + p.name + ' to come')}">` +
      `<span class="dg-ph" aria-hidden="true"><svg width="20" height="16" viewBox="0 0 20 16"><rect x="1" y="1" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 13l4.5-5 3.5 3.5 2.5-2.5L17 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>${esc(p.name)}</span>${pic}</span>`;
  }
  const tagsHTML = p => (p.tags && p.tags.length ? `<ul class="dg-tags dg-sample">${p.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '');

  /* ---------- the result screen ---------- */
  const res = $('dg-result'), stage = $('dg');
  let shown = null, onAgain = null, openerR = null, push = null;
  const PHONE = matchMedia('(max-width: 699px)');   /* stacked below 700px, side by side from there (game.css) */
  function open(p, teams, again) {
    shown = p; onAgain = again;
    $('dg-r-frame').innerHTML = api.frameSVG(p);
    $('dg-r-photo').innerHTML = photo(p, 'dg-r-img');
    const watch = p.kind === 'watch';
    $('dg-r-name').textContent = p.name; $('dg-r-name').classList.toggle('dg-sample', watch);
    $('dg-r-tags').innerHTML = tagsHTML(p);
    const d = $('dg-r-desc'); d.textContent = p.summary || ''; d.classList.toggle('dg-sample', !!p.sample); d.hidden = !p.summary;
    /* A place: the kicker's next NSW match beside it, then FITS and TRAVEL as before. A watch party: FITS is the match
       being screened and TRAVEL is where it is, with one line under them on the later rounds */
    const ml = watch ? '' : matchLine(teams);
    $('dg-r-match-row').hidden = !ml; $('dg-r-match').textContent = ml;
    $('dg-r-fits').textContent = fits(p, teams); $('dg-r-fits').classList.toggle('dg-sample', watch);
    $('dg-r-travel').textContent = watch ? (p.location || 'Location to be confirmed') : p.travel ? p.travel + ' (estimate)' : 'Travel time to be confirmed';
    const later = $('dg-r-later');
    later.hidden = !watch; later.textContent = watch ? `If ${p.team} get through, the later rounds are in NSW.` : '';
    const b = $('dg-r-save'); b.dataset.id = p.id; saveBtn(b, p); countLine();
    res.scrollTop = 0;
    res.hidden = false; stage.inert = true;
    const root = document.documentElement;
    if (PHONE.matches && !reduce.matches && res.animate) {
      /* Phones (24 Nov): the card comes up from the bottom and pushes the field up and off the top as it does, one
         movement, so the screen ends as Kick again at the top and the card under it. The field stays in view until it
         has gone (is-result hides it after) */
      const go = { duration: 460, easing: 'cubic-bezier(.3,.7,.2,1)' };
      stage.animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], go);
      push = res.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], go);
      push.onfinish = () => { push = null; if (!res.hidden) root.classList.add('is-result'); };
    } else root.classList.add('is-result');
    if (!PHONE.matches && !reduce.matches && res.animate) {
      res.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
      $('dg-r-card').animate([{ transform: 'translateY(48px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, delay: 80, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    }
    if (!api.quiet) $('dg-r-name').focus({ preventScroll: true });
  }
  function close() {
    if (res.hidden) return;
    const root = document.documentElement, done = () => { res.hidden = true; root.classList.remove('is-result'); };
    stage.inert = false;
    if (push) { push.onfinish = null; push = null; }
    if (PHONE.matches && !reduce.matches && res.animate) {
      /* Phones: back the way it came, a little faster: the card goes down and the field comes back down with it */
      const go = { duration: 320, easing: 'cubic-bezier(.4,0,.6,1)' };
      root.classList.remove('is-result');
      stage.animate([{ transform: 'translateY(-100%)' }, { transform: 'none' }], go);
      res.animate([{ transform: 'none' }, { transform: 'translateY(100%)' }], go).onfinish = done;
    } else if (!reduce.matches && res.animate) res.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in' }).onfinish = done; else done();
    stage.focus({ preventScroll: true });
    const f = onAgain; onAgain = null; shown = null;
    if (f) f();
  }
  $('dg-r-again').addEventListener('click', close);
  $('dg-r-save').addEventListener('click', e => { if (shown) onSave(shown, e.currentTarget); });
  res.addEventListener('keydown', e => { if (e.key === 'Escape' && placesEl.hidden) { e.preventDefault(); close(); } });

  /* ---------- See the places ---------- */
  const placesEl = $('dg-places');
  let openerP = null, teams0 = [], inertWas = [], closingP = null;
  function row(p) {
    /* a watch party's row also says which match and where, as the same site screens different matches for different teams */
    const meta = p.kind === 'watch' ? `<span class="dg-pl-meta dg-sample">${esc(fits(p, []))} \u00b7 ${esc(p.location || 'Location to be confirmed')}</span>` : '';
    return `<li class="dg-pl-row">${photo(p, 'dg-pl-img')}<div class="dg-pl-t"><b${p.kind === 'watch' ? ' class="dg-sample"' : ''}>${esc(p.name)}</b>${meta}${tagsHTML(p)}</div>` +
      `<button type="button" class="dg-save" data-id="${p.id}"></button></li>`;
  }
  /* In the Version 2 page (24 Nov) the count is the whole of Your plan and it is a link: "[n] saved · Your plan" on
     the result card and in the list opens the page's sheet over the game. On its own the game keeps the plain line */
  const planApi = () => { try { return parent !== window && parent.v2Saved ? parent.v2Saved : null; } catch (e) { return null; } };
  function countLine() {
    const pa = planApi(), a = readState().added;
    const n = pa ? (Array.isArray(a) ? a.filter(x => x && (x.kind === 'kick' || x.kind === 'v2art')).length : 0) : saved().length, el = $('dg-pl-count');
    if (el) { el.textContent = pa && n ? '' : n ? `${n} saved to your plan` : 'Nothing saved yet'; el.classList.toggle('is-none', !n); }
    ['dg-r-plan', 'dg-pl-plan'].forEach(id => { const b = $(id); if (!b) return; b.hidden = !(pa && n); b.textContent = `${n} saved \u00b7 Your plan`; });
  }
  ['dg-r-plan', 'dg-pl-plan'].forEach(id => $(id).addEventListener('click', e => { const pa = planApi(), b = e.currentTarget; if (pa) pa.open(b, () => { try { b.focus({ preventScroll: true }); } catch (x) {} }); }));
  /* A remove, Undo or Clear all in Your plan: every Save button and the count follow it */
  function follow() { document.querySelectorAll('.dg-save[data-id]').forEach(b => { const p = byId(b.dataset.id); if (p) saveBtn(b, p); }); countLine(); }
  window.addEventListener('storage', e => { if (e.key === KEY) follow(); });
  function renderPlaces(all) {
    /* A team with no NSW match: that team's watch parties, and nothing else */
    const wp = partiesFor(teams0);
    if (wp.length) {
      $('dg-pl-body').innerHTML = `<h3 class="dg-pl-h" id="dg-pl-mine">Where to watch ${esc(teams0[0])} in NSW</h3><ul class="dg-pl-list">${wp.map(row).join('')}</ul>` +
        `<p class="dg-r-later">If ${esc(teams0[0])} get through, the later rounds are in NSW.</p>`;
      $('dg-pl-body').querySelectorAll('.dg-save').forEach(b => saveBtn(b, byId(b.dataset.id)));
      countLine();
      return;
    }
    const S = setFor(teams0), mine = PLACES.filter(p => S.cities.indexOf(p.host_city) > -1), rest = PLACES.filter(p => mine.indexOf(p) < 0);
    const where = S.cities.length === 2 ? 'Sydney and Newcastle' : CITY[S.cities[0]];
    let html = `<h3 class="dg-pl-h" id="dg-pl-mine">${!teams0.length || !matchesOf(teams0).length ? 'Around Sydney and Newcastle' : `Near ${teams0.length === 1 ? esc(teams0[0]) + '’s' : 'your teams’'} matches in ${where}`}</h3><ul class="dg-pl-list">${mine.map(row).join('')}</ul>`;
    if (rest.length) {
      html += all ? `<h3 class="dg-pl-h" id="dg-pl-more" tabindex="-1">More places</h3><ul class="dg-pl-list">${rest.map(row).join('')}</ul>`
        : `<button type="button" class="dg-link" id="dg-pl-all">See all ${PLACES.length} places</button>`;
    }
    $('dg-pl-body').innerHTML = html;
    $('dg-pl-body').querySelectorAll('.dg-save').forEach(b => saveBtn(b, byId(b.dataset.id)));
    countLine();
  }
  /* Shown full screen in the Version 2 page, the page's own close cross sits top right, where this layer's cross goes
     (check 7): it steps aside while the places are open, so the cross here closes the places and the game stays */
  function pageSettings(show) { try { if (parent !== window && parent.v2Play) parent.v2Play.cross(show); } catch (e) {} }
  /* ?places: the list on its own, opened from Home without the game (v2-view.js). All of it shows, nothing sits
     behind it, and closing it closes the page's layer */
  const ONLY = /[?&]places(?:&|$)/.test(location.search);
  function openPlaces(from, teams) {
    if (closingP) { closingP.onfinish = null; closingP.cancel(); closingP = null; placesEl.style.pointerEvents = ''; }   /* reopened while it was leaving */
    pageSettings(false);
    openerP = from; teams0 = teams;
    renderPlaces(ONLY);
    /* On its own there has been no kick, so the heading and line leave the posts and the goal out */
    if (ONLY) { $('dg-pl-title').innerHTML = 'The places &middot; <span class="dg-sample">Sample</span>'; placesEl.querySelector('.dg-pl-p').firstChild.textContent = 'Save any of them to your plan. '; }
    inertWas = [stage, res].map(el => [el, el.inert]); stage.inert = true; res.inert = true;
    placesEl.hidden = false; placesEl.scrollTop = 0;
    if (!ONLY && !reduce.matches && placesEl.animate) placesEl.animate([{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
    $('dg-pl-title').focus({ preventScroll: true });
  }
  function closePlaces() {
    if (placesEl.hidden || closingP) return;
    if (ONLY) { try { if (parent !== window && parent.v2Play) { parent.v2Play.close(); return; } } catch (e) {} }
    /* It leaves the way it came, a little faster; focus and the screens behind come back at once */
    const done = () => { closingP = null; placesEl.hidden = true; placesEl.style.pointerEvents = ''; };
    if (!reduce.matches && placesEl.animate) {
      placesEl.style.pointerEvents = 'none';   /* while it leaves, a tap goes to what is under it */
      closingP = placesEl.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(24px)', opacity: 0 }], { duration: 220, easing: 'ease-in' });
      closingP.onfinish = done;
    } else done();
    pageSettings(true);
    inertWas.forEach(([el, was]) => { el.inert = was; }); inertWas = [];
    if (openerP && openerP.isConnected) openerP.focus({ preventScroll: true });
    openerP = null;
  }
  $('dg-pl-close').addEventListener('click', closePlaces);
  placesEl.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePlaces(); } });
  placesEl.addEventListener('click', e => {
    const b = e.target.closest('.dg-save');
    if (b) { onSave(byId(b.dataset.id), b); return; }
    if (e.target.closest('#dg-pl-all')) { renderPlaces(true); $('dg-pl-more').focus({ preventScroll: false }); }
  });
  /* Layers are not the pitch: a press on them never kicks */
  [res, placesEl].forEach(el => el.addEventListener('pointerdown', e => e.stopPropagation()));

  const api = {
    next, open, close, openPlaces, fits, isOpen: () => !res.hidden || (!placesEl.hidden && !closingP),
    frameSVG: () => '', say: () => {}, saved, setFor, partiesFor, matchLine,
    /* something a goal could land on for these teams, without using up the rotation (the demo's picture) */
    sample: teams => partiesFor(teams)[0] || PLACES.find(p => p.image && !p.stand_in) || PLACES[0],
    /* For the game playing itself (game.js, ?demo): quiet takes no focus; reset puts the result away at once */
    quiet: false,
    /* the page closed the game with the places open: they are put away at once, with no movement */
    away() {
      if (placesEl.hidden) return;
      if (closingP) { closingP.onfinish = null; closingP.cancel(); closingP = null; }
      placesEl.hidden = true; placesEl.style.pointerEvents = ''; pageSettings(true);
      inertWas.forEach(([el, was]) => { el.inert = was; }); inertWas = []; openerP = null;
    },
    reset() { push = null; res.getAnimations().concat(stage.getAnimations()).forEach(a => { a.onfinish = null; a.cancel(); }); res.hidden = true; stage.inert = false; document.documentElement.classList.remove('is-result'); shown = null; onAgain = null; }
  };
  window.DG2Result = api;
})();
