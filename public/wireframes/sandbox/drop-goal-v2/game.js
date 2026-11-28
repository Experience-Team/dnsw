/* Drop goal, Version 2: the kick screen.
   Mechanic: concept lab card 10 (dnsw-discovery-gallery, concept-lab/cards/5c-dropgoal.html), ported unchanged except
   the kick window (see T): the timings, how a kick is judged (contact), the two miss lines, the next ball arriving with a pass, and a tap at
   any point after a miss taking the next ball at once. Only the drawing is new: the scene is laid out flat in screen
   space to match docs/drop-goal-style.png (right), so the flight is a curve towards the posts, not card 10's 3D path.
   A goal frames a place between the posts, then the result screen opens (result.js); Kick again comes back here. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const E = {
    out: t => 1 - Math.pow(1 - t, 3),
    inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    p2: t => 1 - (1 - t) * (1 - t)
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  /* Demo (?demo): Home's how-to-play snippet. The game plays itself through one goal when the page asks
     (window.__dgDemo.play), then rests with the ball in the hands and tells the page (onDone). It takes no input, says
     nothing to screen readers, saves nothing and never opens the result. */
  const DEMO = /[?&]demo(?:&|$)/.test(location.search);
  /* With a mouse the game says Click where it says Tap on a touch screen: the calls to act, the hints and the miss lines */
  const CLICK = document.documentElement.classList.contains('is-click'), Wd = CLICK ? 'Click' : 'Tap', wd = CLICK ? 'click' : 'tap';
  let demoGo = false, demoRan = false;

  /* ---------- timing (seconds, from the first tap) ----------
     Card 10's values, except the window (24 Nov, from play-testing): card 10 scored a kick 0.04s after the bounce,
     give or take 0.1s, so the second tap had to land between 0.66s and 0.86s, before most people can see the ball
     touch the ground and react (about 0.2s). Nobody could score. The window now opens as the ball lands and stays
     open for 0.3s, as it comes up off the ground: early is still wide, late is still short. */
  const T = {
    release: 0.12,   /* the hands open */
    fall: 0.6,       /* hands to ground */
    perfect: 0.15,   /* after the bounce: kicked as it comes up (card 10: 0.04) */
    tol: 0.15,       /* either side of perfect (card 10: 0.1) */
    late: 0.42,      /* after the bounce: the boot swings anyway */
    swing: 0.07,     /* tap to contact */
    flight: 0.9      /* boot to the posts */
  };
  T.bounce = T.release + T.fall;
  T.end = T.bounce + T.late;
  const MISS = { wide: `Wide, a touch early. ${Wd} to go again.`, short: `Short, a touch late. ${Wd} to go again.`,
    /* one tap and no second: the boot swings anyway, so say what was missing, not "late" (24 Nov, from play-testing) */
    none: `No kick. ${Wd} once to drop, then again as it bounces.` };

  /* ---------- the picked teams (?team=, from the page) ----------
     A comma list of the planner's picks: the first kicks (kit, ball, the table's +3), and all of them choose the places
     and the FITS line. "Every NSW match" picks no team: the default kit, and places from both cities. */
  const q = /[?&]team=([^&]+)/.exec(location.search);
  const asked = q ? decodeURIComponent(q[1].replace(/\+/g, ' ')).split(',').map(x => x.trim()) : [];
  const teams = asked.filter((x, i) => window.DG2Kit.TEAMS.indexOf(x) > -1 && asked.indexOf(x) === i);
  const team = teams[0] || '';
  const C = window.DG2Kit.kitFor(team);
  const PARTS = window.DG2Kicker.parts(C);

  /* ---------- the scene ----------
     Isometric, to the reference picture (25 Nov 2026): every line on the ground runs at 30 degrees, one way along the
     try line (down to the right) and the other way up the pitch, and everything upright is vertical. So the two
     uprights are the same height, and the crossbar, the tops of the posts and the try line are parallel; nothing is
     skewed. Two layouts, by the shape of the space: tall for phones, wide for desktops, where the kicker and the posts
     spread out as they do in the reference. */
  const SL = Math.tan(Math.PI / 6);
  const LAY = {
    tall: { vw: 390, vh: 520, k: [96, 488, 0.72], near: [232, 278], dx: 84, h: 214, cross: 440 },
    wide: { vw: 1120, vh: 520, k: [196, 436, 0.82], near: [600, 322], dx: 125, h: 280, cross: 641 }
  };
  let lay = null;
  const K = { x: 0, y: 0, s: 1 };                            /* the kicker's feet, and the figure's scale */
  const NEAR = { x: 0, top: 0, base: 0, w: 0 };              /* the near (left) upright */
  const FAR = { x: 0, top: 0, base: 0, w: 0 };               /* the far one: further down the try line */
  const BAR_AT = 0.58;                                       /* the crossbar, down from the top of each upright */
  const barY = u => lerp(u.top, u.base, BAR_AT);
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const sceneEl = $('dg-scene');
  function whichLayout() {
    const r = sceneEl.getBoundingClientRect();
    return r.height && r.width / r.height >= 1.4 ? 'wide' : 'tall';
  }
  function setLayout(name) {
    const l = LAY[name]; lay = l; lay.name = name;
    K.x = l.k[0]; K.y = l.k[1]; K.s = l.k[2];
    NEAR.x = l.near[0]; NEAR.base = l.near[1]; NEAR.top = NEAR.base - l.h;
    FAR.x = NEAR.x + l.dx; FAR.base = NEAR.base + l.dx * SL; FAR.top = FAR.base - l.h;
    NEAR.w = FAR.w = l.dx * 0.074;
    sceneEl.setAttribute('viewBox', `0 0 ${l.vw} ${l.vh}`);
    /* the result screen's picture of the posts: the same drawing, cropped to them */
    $('dg-r-frame').setAttribute('viewBox', `${(NEAR.x - l.dx * 0.6).toFixed(0)} ${(NEAR.top - 20).toFixed(0)} ${(l.dx * 2.2).toFixed(0)} ${(FAR.base - NEAR.top + 44).toFixed(0)}`);
  }

  function drawPitch() {
    const g = $('dg-lines'); g.innerHTML = '';
    const f = lay.dx / 224, sw = (lay.dx * 0.07).toFixed(1), far = 3000;
    /* along the try line: a line through (x0, y0), from x0 + a to x0 + b */
    const along = (x0, y0, a, b, dash) => el('line', { class: 'dg-line', 'stroke-width': sw, x1: x0 + a, y1: y0 + a * SL, x2: x0 + b, y2: y0 + b * SL, 'stroke-dasharray': dash || 'none' }, g);
    along(NEAR.x, NEAR.base - 420 * f, -far, far);           /* dead-ball line */
    along(NEAR.x, NEAR.base, -far, far);                     /* try line, through the foot of each post */
    along(NEAR.x, NEAR.base + 1110 * f, -far, far);          /* 22 */
    /* one line up the pitch, meeting the try line; the dashed 5 m line starts from it */
    const jx = NEAR.x - lay.cross * f, jy = NEAR.base - lay.cross * f * SL;
    el('line', { class: 'dg-line', 'stroke-width': sw, x1: jx, y1: jy, x2: jx - far, y2: jy + far * SL }, g);
    const off = 206 * f, d = -off / (2 * SL);
    along(jx + d, jy + d * SL + off, 0, far, `${(215 * f).toFixed(1)} ${(330 * f).toFixed(1)}`);
  }
  function drawPosts() {
    const g = $('dg-posts'); g.innerHTML = '';
    const pw = lay.dx * 0.2, ph = lay.dx * 0.6, cap = pw * 0.3;
    /* pads first, then the bar, then the uprights, which stand in the top of each pad */
    [NEAR, FAR].forEach(u => {
      el('rect', { class: 'dg-pad', x: u.x - pw / 2, y: u.base - ph, width: pw, height: ph + cap, rx: pw / 2 }, g);
      el('ellipse', { class: 'dg-pad-top', cx: u.x, cy: u.base - ph + cap + 1, rx: pw / 2 - 1.5, ry: cap }, g);
    });
    el('line', { class: 'dg-bar-x', 'stroke-width': (NEAR.w * 0.9).toFixed(1), x1: NEAR.x, y1: barY(NEAR), x2: FAR.x, y2: barY(FAR) }, g);
    [NEAR, FAR].forEach(u => {
      el('rect', { class: 'dg-upright', x: u.x - u.w / 2, y: u.top, width: u.w, height: u.base - ph + cap + 2 - u.top, rx: u.w / 2 }, g);
    });
  }

  /* ---------- the place framed between the posts, above the bar ---------- */
  const R = window.DG2Result;
  R.quiet = DEMO;
  /* The team's colour for a place with no picture: its strongest colour, ink or white on it by how light it is */
  const lum = c => { const v = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(u => u <= .03928 ? u / 12.92 : Math.pow((u + .055) / 1.055, 2.4)); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const TEAMC = { bg: C.ball.stripe, band: C.ball.stripe2, ink: lum(C.ball.stripe) > .2 ? '#111111' : '#ffffff' };
  R.teamColour = TEAMC;
  function frameMarkup(p, id) {
    const pts = [[NEAR.x, NEAR.top], [FAR.x, FAR.top], [FAR.x, barY(FAR)], [NEAR.x, barY(NEAR)]].map(q => q.join(',')).join(' ');
    const x = NEAR.x, y = NEAR.top, w = FAR.x - NEAR.x, h = barY(FAR) - NEAR.top;
    const hifi = document.documentElement.getAttribute('data-theme') === 'hifi';
    const img = p.image && hifi
      ? `<image href="../assets/images/${encodeURIComponent(p.image)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>` : '';
    if (img || !hifi) {
      const cx = x + w / 2, cy = y + h * 0.52;
      return `<clipPath id="${id}"><polygon points="${pts}"/></clipPath><g clip-path="url(#${id})"><rect class="dg-frame-ph" x="${x}" y="${y}" width="${w}" height="${h}"/>` +
        `<g class="dg-frame-icon" transform="translate(${cx - 10} ${cy - 8})"><rect x="1" y="1" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 13l4.5-5 3.5 3.5 2.5-2.5L17 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></g>${img}</g>`;
    }
    /* No picture (critique, 24 Nov): the place's name set large on the team's colour, so the goal still lands on
       something. Words stack, sized to fill the frame and leaning with it; a band in the team's second colour runs along the bar, on the
       same slope as the posts' tops */
    const words = p.name.toUpperCase().split(/\s+/), band = 12, slope = (barY(FAR) - barY(NEAR)) / w;
    const pack = cap => { const o = []; words.forEach(s => { const l = o.length - 1; if (l >= 0 && (o[l] + ' ' + s).length <= cap) o[l] += ' ' + s; else o.push(s); }); return o; };
    const lines = pack(Math.max(8, ...words.map(s => s.length)));
    const fs = Math.min((w - 14) / (Math.max(...lines.map(s => s.length)) * 0.62), (h - band - 30) / (lines.length * 1.0), 40);
    const cx = x + w / 2, midY = y + (h - band) / 2 + 4;
    const txt = lines.map((s, i) => `<text x="${cx}" y="${(midY + (i - (lines.length - 1) / 2) * fs).toFixed(1)}" font-size="${fs.toFixed(1)}" dominant-baseline="central">${s.replace(/&/g, '&amp;')}</text>`).join('');
    const turn = `skewY(${(Math.atan(slope) * 180 / Math.PI).toFixed(2)})`;
    return `<clipPath id="${id}"><polygon points="${pts}"/></clipPath><g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h + 20}" fill="${TEAMC.bg}"/>` +
      `<polygon points="${x},${barY(NEAR) - band} ${x + w},${barY(FAR) - band} ${x + w},${barY(FAR) + 2} ${x},${barY(NEAR) + 2}" fill="${TEAMC.band}"/>` +
      `<g class="dg-frame-name" fill="${TEAMC.ink}" transform="translate(${cx} ${midY}) ${turn} translate(${-cx} ${-midY})">${txt}</g></g>`;
  }
  const frameG = $('dg-frame');
  function showFrame(p) {
    frameG.innerHTML = frameMarkup(p, 'dg-clip-a');
    if (!reduce.matches && frameG.animate) frameG.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
  }
  function hideFrame() { frameG.innerHTML = ''; }
  /* The result screen's pitch: the same lines and posts, with the place in the frame */
  R.frameSVG = p => $('dg-lines').outerHTML.replace('id="dg-lines"', '') + frameMarkup(p, 'dg-clip-b') + $('dg-posts').outerHTML.replace('id="dg-posts"', '');

  /* ---------- the ball ---------- */
  const B = C.ball;
  /* Cream, with two bands sweeping from one point to the other in the team's colours and a rim along one side */
  const BALL = `<ellipse rx="17" ry="11.5" fill="${B.base}"/>` +
    `<path d="M-17,0 A17,11.5 0 0 0 7,10.48 Q-7,10 -17,0 Z" fill="${B.stripe2}"/>` +
    `<path d="M-17,0 A17,11.5 0 0 0 1,11.48 Q-9,9.6 -17,0 Z" fill="${B.stripe}"/>` +
    `<path d="M-17,0.6 Q2,0.5 14.9,-5.5 L16.6,-2.5 Q2,4.6 -17,0.6 Z" fill="${B.stripe}"/>` +
    `<path d="M-17,0.6 Q2,4.6 16.6,-2.5 L16.98,0.5 Q2,7.6 -17,0.6 Z" fill="${B.stripe2}"/>`;
  const ballG = $('dg-ball');
  ballG.innerHTML = `<g id="dg-ball-in">${BALL}</g>`;
  const ballIn = $('dg-ball-in');
  $('dg-r-ball').innerHTML = `<g transform="rotate(-28)">${BALL}</g>`;
  const ball = { x: 0, y: 0, rot: -40, s: 1, o: 1, sq: 1 };
  function drawBall() {
    ballG.setAttribute('opacity', ball.o.toFixed(3));
    ballIn.setAttribute('transform', `translate(${ball.x.toFixed(2)} ${ball.y.toFixed(2)}) rotate(${ball.rot.toFixed(1)}) scale(${(K.s * ball.s).toFixed(3)} ${(K.s * ball.s * ball.sq).toFixed(3)})`);
  }
  const toScene = p => ({ x: K.x + p[0] * K.s, y: K.y + p[1] * K.s });

  /* ---------- the kicker: four poses, tweened ---------- */
  const kickerG = $('dg-kicker');
  const KP = window.DG2Kicker;
  const pose = { from: 'ready', to: 'ready', t0: 0, dur: 0, ease: E.out, now: 'ready' };
  function poseTo(to, dur, ease) { pose.from = pose.now; pose.to = to; pose.t0 = now; pose.dur = reduce.matches ? 0 : dur; pose.ease = ease || E.out; }
  function setPose(p) { pose.from = pose.to = pose.now = p; pose.dur = 0; }
  function updateKicker() {
    const t = pose.dur ? clamp((now - pose.t0) / (pose.dur * 1000), 0, 1) : 1;
    pose.now = t >= 1 ? pose.to : KP.lerpPose(pose.from, pose.to, pose.ease(t));
    kickerG.setAttribute('transform', `translate(${K.x} ${K.y}) scale(${K.s})`);
    kickerG.innerHTML = KP.markup(PARTS, pose.now);
  }
  function ballInHands() { const p = toScene(KP.hands(pose.now)); ball.x = p.x; ball.y = p.y; ball.rot = -40; ball.s = 1; ball.o = 1; ball.sq = 1; }

  /* ---------- timing bar ---------- */
  const span = T.end - T.release, at = t => clamp((t - T.release) / span, 0, 1) * 100;
  const zone = $('dg-zone'), mark = $('dg-mark'), fill = $('dg-fill');
  zone.style.left = at(T.bounce + T.perfect - T.tol).toFixed(2) + '%';
  zone.style.width = (2 * T.tol / span * 100).toFixed(2) + '%';
  /* The meter fills from the left to the needle (28 Nov 2026). At rest it is empty: game.css dims it and hides the needle */
  function markAt(t) { const p = at(t).toFixed(2) + '%'; mark.style.left = p; fill.style.width = p; }

  /* ---------- the landing mark: where the ball comes down ----------
     A ring on the ground under the ball. It closes as the ball falls, and fills yellow for as long as a kick would
     score (the same window as the meter's KICK block and Kick now), so the timing can be read where the ball is */
  const spot = $('dg-spot-e');
  function spotAt(t, on) {
    if (!on) { spot.setAttribute('opacity', '0'); spot.classList.remove('is-now'); return; }
    const p = toScene([D.lx, 1]), k = t < T.bounce ? lerp(2.3, 1, clamp((t - T.release) / T.fall, 0, 1)) : 1;
    const hot = Math.abs(t - (T.bounce + T.perfect)) <= T.tol, gone = clamp((t - (T.bounce + T.perfect + T.tol)) / 0.2, 0, 1);
    spot.setAttribute('cx', p.x.toFixed(1)); spot.setAttribute('cy', p.y.toFixed(1));
    spot.setAttribute('rx', (17 * K.s * k).toFixed(1)); spot.setAttribute('ry', (6.5 * K.s * k).toFixed(1));
    spot.setAttribute('opacity', (hot ? 1 : t < T.release ? 0 : 0.85 * (1 - gone)).toFixed(2));
    spot.classList.toggle('is-now', hot);
  }

  /* ---------- the nation table (sample) ---------- */
  const SEEDS = [['Ireland', 63], ['France', 54], ['Fiji', 48], ['Japan', 45], ['Samoa', 39], ['South Africa', 36]];
  const MINE0 = 41;                                          /* your nation's sample score before your kicks */
  let goals = 0;
  const plus = document.createElement('span'); plus.className = 'dg-plus'; plus.textContent = '+3'; plus.setAttribute('aria-hidden', 'true');
  function rows() {
    if (!team) return SEEDS.slice(0, 5).map(([n, p]) => ({ n, p, me: false }));
    const r = SEEDS.filter(([n]) => n !== team).slice(0, 4).map(([n, p]) => ({ n, p, me: false })).concat([{ n: team, p: MINE0 + goals * 3, me: true }]);
    return r.sort((a, b) => b.p - a.p || (a.me ? 1 : b.me ? -1 : 0));
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function renderTable() {
    /* Screen readers hear "1, Ireland, 63 points" and which row is the kicker's team */
    $('dg-rows').innerHTML = rows().map((r, i) => `<li class="${r.me ? 'is-mine' : ''}"><span>${i + 1}<span class="dg-vh">,</span></span><span>${esc(r.n)}${r.me ? '<span class="dg-vh"> (your team)</span>' : ''}<span class="dg-vh">,</span></span><span>${r.p}<span class="dg-vh"> points</span></span></li>`).join('');
    const mine = $('dg-rows').querySelector('.is-mine'); if (mine) mine.appendChild(plus);
  }
  const ord = n => n + (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
  function shareLine() {
    const r = rows();
    if (!team) return `${r[0].n} lead the Third Half drop goal table on ${r[0].p}. Sample scores.`;
    const i = r.findIndex(x => x.me);
    return `${team} ${ord(i + 1)} of ${r.length} on the Third Half drop goal table. I kicked ${goals} ${goals === 1 ? 'goal' : 'goals'}. Sample scores.`;
  }
  const shareBtn = $('dg-share');
  let shareT = 0;
  shareBtn.addEventListener('click', () => {
    const line = shareLine();
    const done = ok => {
      clearTimeout(shareT);
      let shown = $('dg-share-line');
      if (ok) { if (shown) shown.remove(); }
      else {
        /* copying was blocked: show the line, selected, to copy by hand */
        if (!shown) { shown = document.createElement('p'); shown.className = 'dg-share-line'; shown.id = 'dg-share-line'; shareBtn.after(shown); }
        shown.textContent = line;
        const range = document.createRange(); range.selectNodeContents(shown);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      }
      if (!shareBtn.style.minWidth && shareBtn.offsetWidth) shareBtn.style.minWidth = shareBtn.offsetWidth + 'px';   /* Line copied is shorter: hold the width */
      shareBtn.textContent = ok ? 'Line copied' : 'Copy the line below';
      say(ok ? 'The table’s line is copied: ' + line : 'Copying was blocked. The line is shown under the button, selected.');
      shareT = setTimeout(() => { shareBtn.textContent = 'Share the table'; }, ok ? 2000 : 6000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(line).then(() => done(true), () => done(false));
    else done(false);
  });
  /* The table is not the pitch: a press on it never kicks */
  $('dg-table').addEventListener('pointerdown', e => e.stopPropagation());

  /* ---------- words ---------- */
  const hint = $('dg-hint'), head = $('dg-head'), sayEl = $('dg-say');
  /* The caption above the bar is typed out quickly each time it changes, to draw the eye to it (24 Nov). The whole
     line is in place from the start, the part not yet typed unseen, so the chip keeps its size and nothing shifts;
     its text reads the same to code and to screen readers throughout. Reduced motion shows it at once */
  let typeT = 0;
  /* the page shows the game again (v2-view.js): the caption already there is typed afresh */
  window.__dgRetype = () => { const t = hint.textContent; if (!t || hint.classList.contains('is-off')) return; clearInterval(typeT); hint.textContent = ''; setHint(t); };
  /* A line the next tap is timed against is shown at once (28 Nov 2026): typed, it finished after the ball had landed */
  function setHint(txt, atOnce) {
    hint.classList.toggle('is-off', !txt);
    if (!txt || txt === hint.textContent) return;
    clearInterval(typeT);
    if (reduce.matches || DEMO || atOnce) { hint.textContent = txt; return; }
    const esc = x => x.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const step = Math.max(1, Math.ceil(txt.length / 28));   /* about half a second, however long the line */
    let n = 0;
    const draw = () => { hint.innerHTML = `<span>${esc(txt.slice(0, n))}</span><span class="dg-hint-caret" aria-hidden="true"></span><span class="dg-hint-rest">${esc(txt.slice(n))}</span>`; };
    draw();
    typeT = setInterval(() => { n = Math.min(txt.length, n + step); if (n >= txt.length) { clearInterval(typeT); hint.textContent = txt; } else draw(); }, 18);
  }
  /* The call to act follows the two taps (24 Nov, from play-testing: one tap read as the whole game): Tap to drop, then
     Tap to kick while the ball falls, then Kick now while a kick would score, in step with the bar's KICK zone */
  /* kicked: the word after the second tap, so Kick now is not still lit while the ball is in the air. late: nobody
     tapped. got and start: the practice kick's own result, and the handover that follows it (28 Nov 2026) */
  const HEAD = { drop: `${Wd} to drop`, kick: `${Wd} to kick`, now: 'Kick now', goal: 'Goal', wait: `${Wd} now to kick`,
    kicked: 'Kicked', late: 'Too late', got: 'Got it', start: `${Wd} to start` };
  let headIs = '';
  function setHead(state) {
    if (state === true) state = 'goal'; else if (!state) state = 'drop';
    if (state === headIs) return;
    /* Set as the reference has it, TAP To Kick: the press in capitals, the rest with a capital each (game.css) */
    headIs = state; head.innerHTML = HEAD[state].replace(/^(Tap|Click)\b/, '<b>$1</b>');
    head.classList.toggle('is-goal', state === 'goal'); head.classList.toggle('is-now', state === 'now' || state === 'wait');
    /* GOAL lands with a small pop; the other words change at once, as the taps are timed against them */
    if (state === 'goal' && head.animate && !reduce.matches) head.animate([{ transform: 'scale(.8)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
  function say(msg) { if (DEMO) return; sayEl.textContent = ''; setTimeout(() => { sayEl.textContent = msg; }, 30); }
  R.say = say;

  /* What a goal lands on, said where people look before each kick: the line above the bar, at rest (it was the rules
     screen's third tip until the practice kick replaced that screen) */
  const LANDS = !team ? 'A goal lands on somewhere to go in Sydney or NSW.'
    : R.partiesFor(teams).length ? `A goal lands on a watch party for ${team} in NSW.` : `A goal lands on a place near where ${team} play.`;

  /* ---------- the practice kick (first time, and from the page's ? button) ----------
     One kick with nothing timed: Tap to drop, the ball drops and stops at the bounce with the bar in the KICK zone,
     Tap now to kick, and it goes through at normal speed. It doesn't count. Then the game carries on as normal, and a
     miss on the first real kick is the game's own miss line. Each prompt is announced. The page starts it and is told
     when it is done or skipped (parent.sbPlay). */
  let prac = null;
  /* The second press, told apart (24 Nov): too soon is a press while the ball is still falling; too late is the ball
     left waiting past where a real kick would have gone. Both say so and why; the practice still lets the kick through */
  let pracSoon = false;
  const page = fn => { try { if (parent !== window && parent.sbPlay && parent.sbPlay[fn]) return parent.sbPlay[fn](); } catch (x) {} };
  function startPractice() {
    if (DEMO) return;
    timers = []; D.passing = false; D.prac = false; R.reset(); hideFrame(); setPose('ready'); markAt(T.release); spotAt(0, false);
    plus.classList.remove('is-on'); nowCard(false);
    prac = 'drop'; document.documentElement.classList.add('is-practice');
    pracSoon = false; page('practiceStart');   // the page puts its How to play button away until the game is ready
    const m = `${Wd} to drop the ball. It will wait for you at the bounce.`;
    hold(m); say('Practice kick. It doesn\u2019t count. ' + m);
  }
  function endPractice() { prac = null; nowCard(false); document.documentElement.classList.remove('is-practice'); page('practiceDone'); }
  /* The handover (28 Nov 2026): the practice is over and the game starts. One card says so, in the middle of the pitch;
     the nation table, the kicker's line and How to play come in only once it has gone. A tap starts the game (not for
     the first half second, so a tap meant for the practice never skips it); left alone, it starts itself */
  const nowEl = $('dg-now');
  $('dg-now-p').textContent = `The ball won\u2019t wait: ${wd} as it bounces. ` + LANDS;
  function nowCard(on) {
    document.documentElement.classList.toggle('is-handover', on);
    if (on === !nowEl.hidden) return;
    if (on) { nowEl.hidden = false; if (!reduce.matches && nowEl.animate) nowEl.animate([{ opacity: 0, transform: 'translate(-50%, -50%) scale(.92)' }, { opacity: 1, transform: 'translate(-50%, -50%)' }], { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' }); }
    else if (!reduce.matches && nowEl.animate) nowEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-in' }).onfinish = () => { nowEl.hidden = true; };
    else nowEl.hidden = true;
  }
  function handover() {
    timers = []; D.passing = false; D.prac = false;
    setPhase('ready'); setPose('ready'); markAt(T.release); spotAt(0, false);
    setHint(''); setHead('start'); nowCard(true);
    say(`Practice over. Now for real. The ball won\u2019t wait: ${wd} as it bounces. ${LANDS} ${Wd} to start.`);
    after(6, () => { if (phase === 'ready') startReal(); });
    start();
  }
  function startReal() { timers = []; endPractice(); hold(); }
  $('dg-skip').addEventListener('pointerdown', e => e.stopPropagation());
  $('dg-skip').addEventListener('click', () => {
    if (!prac) return;
    endPractice(); timers = []; D.passing = false; D.prac = false; setPose('ready'); markAt(T.release); spotAt(0, false); hold();
    say(`Practice skipped. ${Wd} to drop the ball.`); stage.focus({ preventScroll: true });
  });
  window.__dgPractice = { start: startPractice, active: () => !!prac };
  /* The page closed the game (v2-view.js): a result card, or a goal on its way to one, is put away, so the game
     opens again on the pitch, ready to kick. The goal still counts and a saved place stays saved */
  window.__dgAway = () => {
    if (DEMO) return;
    R.away();
    if (phase !== 'goal' && phase !== 'result') return;
    timers = []; D.passing = false; D.note = null; R.reset(); hideFrame(); setPose('ready'); markAt(T.release);
    plus.classList.remove('is-on');
    hold();
  };

  /* ---------- How to play (28 Nov 2026): the page's ? opens a short card; a practice kick is offered inside it ---------- */
  const howEl = $('dg-how');
  let howOpen = false;
  howEl.querySelectorAll('.dg-w').forEach(x => { x.textContent = Wd; });
  function openHow() {
    if (howOpen || DEMO || R.isOpen()) return;
    howOpen = true; howEl.hidden = false; stage.inert = true;
    if (!reduce.matches && howEl.animate) howEl.querySelector('.dg-how').animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' });
    $('dg-how-h').focus({ preventScroll: true });
    say('How to play, opened.');
  }
  function closeHow(back) {
    if (!howOpen) return;
    howOpen = false; howEl.hidden = true; stage.inert = false;
    if (back !== false) { page('howClosed'); say('How to play closed.'); }
  }
  howEl.addEventListener('click', e => { if (e.target === howEl || e.target.closest('#dg-how-x')) closeHow(); });
  $('dg-how-prac').addEventListener('click', () => { closeHow(false); startPractice(); stage.focus({ preventScroll: true }); });
  window.__dgHow = { open: openHow, close: () => closeHow(false), isOpen: () => howOpen };

  /* ---------- who is kicking, with Change (the page's team screen) ---------- */
  (function () {
    const who = $('dg-who'); let inPage = false;
    try { inPage = parent !== window && !!parent.sbPlay; } catch (x) {}
    if (DEMO || !team || !inPage) return;
    $('dg-who-t').textContent = 'Kicking for ' + team; who.hidden = false;
    who.addEventListener('pointerdown', e => e.stopPropagation());
    $('dg-change').addEventListener('click', () => page('changeTeam'));
  })();

  const stage = $('dg');

  /* ---------- the loop ---------- */
  let phase = 'hold', t0 = 0, now = performance.now(), raf = 0, timers = [];
  const D = {};
  function after(sec, fn) { timers.push({ at: now + sec * 1000, fn }); start(); }
  function start() { if (!raf) raf = requestAnimationFrame(loop); }
  function setPhase(p) { phase = p; t0 = now; document.documentElement.dataset.phase = p; }
  function loop(ts) {
    now = ts || performance.now(); raf = 0;
    const due = timers.filter(x => x.at <= now); timers = timers.filter(x => x.at > now); due.forEach(x => x.fn());
    step(); updateKicker();
    if (phase === 'hold' || phase === 'ready' || (phase === 'pass' && !D.passing)) ballInHands();
    drawBall();
    const moving = (phase !== 'hold' && phase !== 'result' && phase !== 'wait' && phase !== 'ready') || timers.length || (pose.dur && now < pose.t0 + pose.dur * 1000 + 40);
    if (moving) raf = requestAnimationFrame(loop);
  }

  /* the ball in the hands, waiting; after a miss the friendly line stays up until the next drop */
  function hold(note) {
    setPhase('hold');
    markAt(T.release); spotAt(0, false);   /* the meter is empty at rest (28 Nov 2026): it used to stay where the last kick was */
    setHint(note || LANDS);
    setHead('drop');
    start();
    if (DEMO && demoGo && !reduce.matches) {
      if (demoRan) { demoGo = demoRan = false; markAt(T.release); if (window.__dgDemo.onDone) window.__dgDemo.onDone(); }   /* once through: rest here */
      else after(0.9, () => { if (phase === 'hold' && demoGo) { demoRan = true; demoTap(1); drop(); } });
    }
  }
  /* Demo: where a press lands, and which it is: Tap 1, Tap 2 on touch screens, Click 1, Click 2 with a mouse. The
     marker holds long enough to read, and the ring pulses out from under it */
  function demoTap(n) {
    const el = $('dg-tap'), ring = $('dg-tap-ring'); if (!el || !el.animate) return;
    $('dg-tap-l').textContent = (CLICK ? 'Click ' : 'Tap ') + n;
    el.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .75 }, { opacity: 0 }], { duration: n === 1 ? 760 : 900, easing: 'linear' });
    ring.animate([{ transform: 'scale(.55)' }, { transform: 'scale(1)', offset: .35 }, { transform: 'scale(1.25)' }], { duration: 520, easing: 'ease-out', fill: 'forwards' });
  }

  /* first tap: the hands open and the ball drops */
  function drop() {
    setPhase('drop');
    const h = KP.hands('drop'), k = KP.boot('kick');
    D.lx = (h[0] + k[0]) / 2 + 2;                            /* where it falls, in the figure's units: under the hands, in reach of the boot */
    D.y0 = h[1]; D.yg = -11.5;                               /* from the hands to resting on its point */
    D.g = 2 * (D.yg - D.y0) / (T.fall * T.fall);
    D.vb = 0.42 * D.g * T.fall;
    D.kicked = false; D.out = null; D.resolved = false; D.F = null; D.none = false;
    poseTo('drop', T.release + 0.3, E.out);
    markAt(T.release);
    setHint(prac ? 'The ball will wait for you at the bounce.' : `Now ${wd} again as it bounces.`, true); setHead('kick');
    D.prac = false; if (prac === 'drop') prac = 'falling';
    start();
  }
  function dropBallAt(t) {
    if (t < T.release) { ballInHands(); return; }
    const tf = t - T.release;
    let ly, rot, sq = 1;
    if (tf <= T.fall) { ly = D.y0 + 0.5 * D.g * tf * tf; rot = lerp(-40, 78, E.out(clamp(tf / 0.35, 0, 1))); }
    else {
      const tb = tf - T.fall;
      ly = D.yg - D.vb * tb + 0.5 * D.g * tb * tb; rot = lerp(78, 64, clamp(tb / 0.3, 0, 1));
      sq = tb < 0.05 ? lerp(0.78, 1, tb / 0.05) : 1;           /* the instant of the bounce */
    }
    const p = toScene([D.lx, Math.min(ly, D.yg)]);
    ball.x = p.x; ball.y = p.y; ball.rot = rot; ball.s = 1; ball.o = 1; ball.sq = sq;
  }

  /* second tap: the boot swings through to the ball */
  function kick(tTap) {
    if (phase !== 'drop' || D.kicked) return;
    D.kicked = true; D.tTap = tTap;
    markAt(tTap);
    setHead(D.none ? 'late' : 'kicked');
    setPhase('swing');
    poseTo('kick', T.swing, E.out);
  }

  /* the boot meets the ball: early hooks it wide of the near upright, late is a weak kick that dies short */
  function contact() {
    const err = D.tTap - (T.bounce + T.perfect);
    const out = Math.abs(err) <= T.tol ? 'goal' : err < 0 ? 'wide' : 'short';
    D.out = out; D.err = err;
    const sev = clamp((Math.abs(err) - T.tol) / 0.3, 0, 1);
    const from = { x: ball.x, y: ball.y };
    const mid = { x: (NEAR.x + FAR.x) / 2, y: (barY(NEAR) + barY(FAR)) / 2 };
    let to, peak, fade;
    if (out === 'goal') {
      const o = clamp(err * 8, -1, 1) * 0.3;                 /* a touch either side of perfect drifts along the bar */
      to = { x: mid.x + (FAR.x - NEAR.x) * o, y: mid.y - lay.h * 0.25 + (barY(FAR) - barY(NEAR)) * o };
      peak = lay.h * 0.5; fade = 0.12;
    } else if (out === 'wide') {
      to = { x: NEAR.x - lay.dx * (0.4 + sev * 0.5), y: mid.y - lay.h * 0.22 }; peak = lay.h * 0.46; fade = 0.3;
    } else {
      to = { x: lerp(from.x, NEAR.x, 0.75 - sev * 0.25), y: NEAR.base - 10 }; peak = 120 - sev * 50; fade = 0;
    }
    spotAt(0, false);
    D.F = { from, to, peak, fade, t0: now, dur: out === 'short' ? T.flight * 0.95 : T.flight, spin: out === 'short' ? 520 : 760 };
    poseTo('follow', 0.38, E.p2);
    setPhase('flight');
    if (reduce.matches) { D.resolved = true; ball.o = 0; resolve(); }
  }
  /* time along the path: it leaves the boot fast and arrives without hanging */
  const flightU = tau => (tau <= 1 ? 1 - Math.pow(1 - tau, 1.8) : 1);
  function flightAt(t) {
    const F = D.F, tau = t / F.dur, u = flightU(tau);
    const cx = (F.from.x + F.to.x) / 2, cy = Math.min(F.from.y, F.to.y) - F.peak;
    ball.x = (1 - u) * (1 - u) * F.from.x + 2 * (1 - u) * u * cx + u * u * F.to.x;
    ball.y = (1 - u) * (1 - u) * F.from.y + 2 * (1 - u) * u * cy + u * u * F.to.y;
    ball.s = lerp(1, D.out === 'short' ? 0.7 : 0.42, u); ball.sq = 1;
    ball.rot = 78 + F.spin * t;
    if (D.out === 'short') ball.o = 1 - clamp((u - 0.6) / 0.26, 0, 1);              /* gone before it lands */
    else ball.o = tau <= 1 ? 1 : 1 - clamp((t - F.dur) / F.fade, 0, 1);
    return u;
  }

  function step() {
    const t = (now - t0) / 1000;
    if (phase === 'drop') {
      dropBallAt(t); markAt(t); spotAt(t, true);
      /* The practice kick: the ball stops at the bounce, in the middle of the KICK zone, and waits. Nothing is timed */
      if (prac === 'falling' && t >= T.bounce + T.perfect) {
        dropBallAt(T.bounce + T.perfect); markAt(T.bounce + T.perfect); spotAt(T.bounce + T.perfect, true);
        prac = 'wait'; setPhase('wait'); setHead('wait');
        const m = `The ball is at the bounce. ${Wd} now to kick.`;
        setHint(pracSoon ? `It has bounced now: ${wd} to kick.` : 'It\u2019s waiting for you at the bounce. Kick now.', true); say(m);
        /* left waiting: a nudge, never a telling-off (28 Nov 2026). The panel says the ball waits, so the practice does
           not say Too late, and it always ends on Got it; that the game won't wait is said on the handover card */
        after(4, () => { if (prac !== 'wait') return; const l = `Still waiting. ${Wd} to kick.`; setHint(l, true); say(l); });
        return;
      }
      /* before the window Tap to kick, in it Kick now, after it Too late: it used to flip back to Tap to kick for a moment */
      setHead(t < T.bounce + T.perfect - T.tol ? 'kick' : t <= T.bounce + T.perfect + T.tol ? 'now' : 'late');
      if (DEMO && !D.kicked && t >= T.bounce + T.perfect) { demoTap(2); kick(T.bounce + T.perfect); return; }   /* the second tap, as it comes up */
      if (t >= T.end && !D.kicked) { D.none = true; kick(T.end); }   /* never tapped: the boot swings anyway, late */
    } else if (phase === 'swing') {
      dropBallAt(D.tTap + t); spotAt(D.tTap + t, true);
      if (t >= T.swing) contact();
    } else if (phase === 'flight' && D.F && !reduce.matches) {
      const tf = (now - D.F.t0) / 1000, u = flightAt(tf);
      if (!D.resolved && (D.out === 'short' ? u >= 0.84 : tf >= D.F.dur)) { D.resolved = true; resolve(); }
    } else if ((phase === 'goal' || phase === 'miss') && D.F && !reduce.matches) {
      flightAt((now - D.F.t0) / 1000);                     /* the ball finishes fading out */
    } else if (phase === 'pass' && D.passing) {
      const r = clamp(t / D.passDur, 0, 1), e = E.out(r), h = toScene(KP.hands(pose.now));
      /* the next ball comes the way a pass must: backwards, from a teammate ahead, low, rising late into the hands */
      ball.x = lerp(D.px, h.x, e); ball.y = lerp(D.py, h.y, Math.pow(e, 2.2));
      ball.s = lerp(0.6, 1, e); ball.o = 1; ball.sq = 1; ball.rot = lerp(-40, -40, e) + (1 - e) * 360;
      if (r >= 1) { D.passing = false; hold(D.note); }
    }
  }

  function resolve() { if (D.out === 'goal') goal(); else miss(D.out); }

  /* the win: +3, a place framed between the posts, then the result screen. Reduced motion: straight to it */
  function goal() {
    setPhase('goal');
    if (DEMO) {   /* the win, shown and no more: a place between the posts, then the next ball */
      const dp = R.sample(teams);
      setHead(true); showFrame(dp);
      after(1.7, () => { if (phase === 'goal') { hideFrame(); D.note = null; pass(); } });
      return;
    }
    if (D.prac) {   /* the practice kick doesn't count: no points, no place, nothing used from the rotation. It has its own
                       result, not Goal, and the handover follows it (28 Nov 2026) */
      const msg = pracSoon ? 'That\u2019s the timing: just after the bounce.' : 'That\u2019s the timing.';
      setHead('got'); setHint(msg, true); say('Got it. ' + msg);
      after(reduce.matches ? 0.8 : 1.1, () => { if (phase === 'goal') handover(); });
      return;
    }
    goals++; missRun = 0; document.documentElement.classList.remove('is-struggling');
    renderTable();
    setHead(true);
    const p = R.next(teams); D.place = p;
    /* the place is named in words too: between the posts it is too small to read on a phone (28 Nov 2026) */
    setHint(`${p.name}.` + (team ? ` +3 for ${team}.` : ''), true);
    if (team) { plus.classList.remove('is-on'); void plus.offsetWidth; plus.classList.add('is-on'); }
    showFrame(p); zoomPosts();
    const rank = team ? rows().findIndex(x => x.me) + 1 : 0;
    say(`Goal. The ball landed in ${p.name}.` + (team ? ` 3 points for ${team}, ${ord(rank)} on the table.` : ''));
    after(reduce.matches ? 0 : 2, result);   /* 2s, or a tap: at 1.2s the place had barely landed (28 Nov 2026) */
  }
  /* The goal is the moment: the pitch moves in on the posts while the place shows (game.css scales the scene about
     the middle of the frame, measured here) */
  function zoomPosts() {
    const a = sceneEl.getBoundingClientRect(), b = frameG.getBoundingClientRect();
    if (!a.width || !b.width) return;
    sceneEl.style.transformOrigin = `${(b.left + b.width / 2 - a.left).toFixed(0)}px ${(b.top + b.height / 2 - a.top).toFixed(0)}px`;
  }
  function result() { if (phase !== 'goal') return; setPhase('result'); R.open(D.place, teams, kickAgain); }
  /* Kick again: back to the pitch, and the next ball comes */
  /* After a few goals the line at rest counts them up, so the game has somewhere to arrive (28 Nov 2026) */
  function kickAgain() {
    hideFrame();
    const n = R.saved().length;
    D.note = goals >= 2 ? `${goals} places found${n ? `, ${n} in your plan` : ''}. Keep kicking for more.` : null;
    pass();
  }

  /* a miss is friendly: it says what happened in plain words, the next ball is on its way, and a tap takes it at once */
  let missRun = 0;
  function miss(kind) {
    setPhase('miss');
    /* three misses in a row: the places are offered without a goal (game.css shows Or see the places) */
    if (++missRun >= 3) document.documentElement.classList.add('is-struggling');
    D.note = MISS[D.none ? 'none' : kind];
    setHint(D.note); setHead('drop');
    say(D.note);
    after(0.45, () => { if (phase === 'miss') pass(); });
  }

  function pass() {
    setPhase('pass');
    markAt(T.release); spotAt(0, false);
    plus.classList.remove('is-on');
    setHead(false);
    poseTo('ready', 0.3, E.out);
    if (reduce.matches) { D.passing = false; hold(D.note); return; }
    D.passing = true; D.px = Math.min(lay.vw + 40, K.x + 340); D.py = K.y - 60; D.passDur = 0.6;
    start();
  }

  /* a tap while the next ball is on its way: it is in the hands now, and the hands open */
  function again() {
    timers = []; D.passing = false; plus.classList.remove('is-on');
    setPose('ready');
    drop();
  }

  /* ---------- input: tap, click, Space or Enter ---------- */
  function tap() {
    if (R.isOpen() || howOpen) return;                       /* the result, the places and How to play are not the pitch */
    now = performance.now();                                 /* one clock: every tap is timed on performance.now() */
    /* the handover: a tap starts the game, but not in its first half second, and it is never the drop */
    if (phase === 'ready') { if (now - t0 > 500) startReal(); return; }
    if (phase === 'goal') { if (D.prac) { if (now - t0 > 500) handover(); } else { timers = []; result(); } return; }
    if (prac === 'falling') {                                /* practice: too soon, the ball has not bounced yet */
      pracSoon = true; const l = `Too soon. Wait for the bounce, then ${wd}.`; setHint(l); say(l);
      return;
    }
    if (phase === 'wait') {                                  /* practice: the kick, from the middle of the zone, at normal speed */
      const tt = T.bounce + T.perfect;
      prac = 'kicked'; setPhase('drop'); t0 = now - tt * 1000; kick(tt); D.prac = true; start();
      return;
    }
    if (phase === 'hold') drop();
    else if (phase === 'drop') { const td = (now - t0) / 1000; if (td > T.release + 0.05) kick(td); }
    else if (phase === 'miss' || phase === 'pass') again();
  }
  if (DEMO) {
    stage.removeAttribute('tabindex'); stage.removeAttribute('role'); stage.setAttribute('aria-hidden', 'true');
    const rest = () => { timers = []; D.passing = false; R.reset(); hideFrame(); setPose('ready'); markAt(T.release); spotAt(0, false); };
    window.__dgDemo = {
      onDone: null,
      /* play: once through, from the ball in the hands. stop: back to rest at once, nothing played */
      play() { if (reduce.matches) return; rest(); demoRan = false; demoGo = true; hold(); },
      stop() { demoGo = demoRan = false; rest(); hold(); },
      playing: () => demoGo
    };
  }
  /* The focus ring is for the keyboard: any key shows it, any press hides it (game.css, .is-keys) */
  document.addEventListener('keydown', () => document.documentElement.classList.add('is-keys'), true);
  document.addEventListener('pointerdown', () => document.documentElement.classList.remove('is-keys'), true);
  /* A press that moves is not a tap (28 Nov 2026): people dragged along the meter, the press dropped the ball and the
     drag ended as a miss. The kick is timed, so while the ball is falling it is still taken on the press itself. Every
     other tap (the drop, the practice kick, the next ball, Tap to start) is taken on release, and only if the finger
     has moved less than 10px; a drag or a cancelled press does nothing */
  let press = null;
  if (!DEMO) stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { stage.focus({ preventScroll: true }); } catch (x) {}
    if (phase === 'drop') { press = null; tap(); return; }
    press = { id: e.pointerId, x: e.clientX, y: e.clientY };
  });
  if (!DEMO) addEventListener('pointerup', e => {
    const p = press; if (!p || p.id !== e.pointerId) return;
    press = null;
    if (Math.hypot(e.clientX - p.x, e.clientY - p.y) <= 10) tap();
  });
  if (!DEMO) addEventListener('pointercancel', e => { if (press && press.id === e.pointerId) press = null; });
  if (!DEMO) document.addEventListener('keydown', e => {
    if (howOpen) { if (e.key === 'Escape') { e.preventDefault(); closeHow(); } return; }
    if (R.isOpen()) return;
    /* Escape on the kick screen leaves the game, when the Version 2 page shows it full screen */
    if (e.key === 'Escape') { try { if (parent !== window && parent.sbPlay) { e.preventDefault(); parent.sbPlay.close(); } } catch (x) {} return; }
    if (e.target && e.target.closest && e.target.closest('button')) return;      /* a button's own Enter and Space */
    if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) tap(); }
  });

  /* See the places: from the kick screen and from the result, never a kick */
  const see = $('dg-see');
  try { if (parent !== window && parent.sbPlay) see.textContent = 'Or see the places'; } catch (x) {}   /* in the page it shows only after three misses */
  see.addEventListener('pointerdown', e => e.stopPropagation());
  see.addEventListener('click', () => R.openPlaces(see, teams));
  if (/[?&]places(?:&|$)/.test(location.search)) R.openPlaces(null, teams);
  $('dg-r-see').addEventListener('click', e => R.openPlaces(e.currentTarget, teams));

  /* ---------- the page around it: theme and annotations, when shown in the Version 2 phone ---------- */
  (function () {
    let pdoc = null;
    try { if (parent !== window) pdoc = parent.document; } catch (x) {}
    if (!pdoc) return;
    const root = document.documentElement, stageEl = pdoc.getElementById('tp-stage');
    const sync = () => {
      root.setAttribute('data-theme', pdoc.documentElement.getAttribute('data-theme') === 'hifi' ? 'hifi' : 'wireframe');
      root.classList.toggle('has-notes', !!(stageEl && stageEl.classList.contains('has-notes')));
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(pdoc.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (stageEl) mo.observe(stageEl, { attributes: true, attributeFilter: ['class'] });
  })();

  /* ---------- start ---------- */
  setLayout(whichLayout()); drawPitch(); drawPosts(); renderTable();
  /* The space changed shape (a window resized, a phone turned): draw the layout that fits it */
  addEventListener('resize', () => {
    const n = whichLayout(); if (n === lay.name) return;
    setLayout(n); drawPitch(); drawPosts();
    if (frameG.innerHTML && D.place) frameG.innerHTML = frameMarkup(D.place, 'dg-clip-a');
    start();
  });
  setPose('ready'); markAt(T.release);
  hold();
  window.__dg2 = { phase: () => phase, team: () => team, teams: () => teams.slice(), goals: () => goals, practice: () => prac, place: () => (D.place ? D.place.id : null), T };   /* read-only, for the regression checks */
})();
