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
  const DEMO = /[?&]demo(?:=taps)?(?:&|$)/.test(location.search);
  /* ?demo=taps is the onboarding's picture: the whole screen as it is, playing once */
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
  const MISS = { wide: 'Wide, a touch early. Tap to go again.', short: 'Short, a touch late. Tap to go again.',
    /* one tap and no second: the boot swings anyway, so say what was missing, not "late" (24 Nov, from play-testing) */
    none: 'No kick. Tap once to drop, then again as it bounces.' };

  /* ---------- the picked teams (?team=, from the page) ----------
     A comma list of the planner's picks: the first kicks (kit, ball, the table's +3), and all of them choose the places
     and the FITS line. "Every NSW match" picks no team: the default kit, and places from both cities. */
  const q = /[?&]team=([^&]+)/.exec(location.search);
  const asked = q ? decodeURIComponent(q[1].replace(/\+/g, ' ')).split(',').map(x => x.trim()) : [];
  const teams = asked.filter((x, i) => window.DG2Kit.TEAMS.indexOf(x) > -1 && asked.indexOf(x) === i);
  const team = teams[0] || '';
  const C = window.DG2Kit.kitFor(team);
  const PARTS = window.DG2Kicker.parts(C);

  /* ---------- the scene, in the picture's own units (390 x 520) ---------- */
  const K = { x: 96, y: 488, s: 0.72 };                      /* the kicker's feet, and the figure's scale */
  const NEAR = { x: 248, top: 36, base: 252, w: 7 };        /* the near (left) upright */
  const FAR = { x: 318, top: 80, base: 300, w: 6 };         /* the far one: further down the try line */
  const BAR_AT = 0.46;                                       /* the crossbar, down from the top of each upright */
  const barY = u => lerp(u.top, u.base, BAR_AT);
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };

  function drawPitch() {
    const g = $('dg-lines');
    /* lines parallel to the try line (through the post bases), and one across */
    const dx = FAR.x - NEAR.x, dy = FAR.base - NEAR.base, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const line = (off, from, to, dash) => {
      const cx = NEAR.x - nx * off, cy = NEAR.base - ny * off;
      el('line', { class: 'dg-line', x1: cx + ux * from, y1: cy + uy * from, x2: cx + ux * to, y2: cy + uy * to, 'stroke-dasharray': dash || 'none' }, g);
    };
    line(-90, -900, 900);                 /* dead-ball line */
    line(0, -900, 900);                   /* try line */
    line(48, -900, 900, '28 44');         /* 5 m, dashed */
    line(330, -900, 900);                 /* 22 */
    const ax = 120, ay = 150;             /* one line across, towards the near touchline */
    el('line', { class: 'dg-line', x1: ax - nx * 900, y1: ay - ny * 900, x2: ax + nx * 900, y2: ay + ny * 900 }, g);
  }
  function drawPosts() {
    const g = $('dg-posts');
    [FAR, NEAR].forEach(u => {
      el('rect', { class: 'dg-upright', x: u.x - u.w / 2, y: u.top, width: u.w, height: u.base - u.top - 8, rx: u.w / 2 }, g);
    });
    el('line', { class: 'dg-bar-x', x1: NEAR.x, y1: barY(NEAR), x2: FAR.x, y2: barY(FAR) }, g);
    [NEAR, FAR].forEach(u => {
      const w = u === NEAR ? 17 : 15, h = u === NEAR ? 46 : 42;
      el('rect', { class: 'dg-pad', x: u.x - w / 2, y: u.base - h, width: w, height: h, rx: 3 }, g);
      el('ellipse', { class: 'dg-pad-top', cx: u.x, cy: u.base - h, rx: w / 2, ry: 3 }, g);
    });
  }

  /* ---------- the place framed between the posts, above the bar ---------- */
  const R = window.DG2Result;
  R.quiet = DEMO;
  function frameMarkup(p, id) {
    const pts = [[NEAR.x, NEAR.top], [FAR.x, FAR.top], [FAR.x, barY(FAR)], [NEAR.x, barY(NEAR)]].map(q => q.join(',')).join(' ');
    const x = NEAR.x, y = NEAR.top, w = FAR.x - NEAR.x, h = barY(FAR) - NEAR.top;
    const img = p.image && document.documentElement.getAttribute('data-theme') === 'hifi'
      ? `<image href="../../assets/images/${encodeURIComponent(p.image)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>` : '';
    const cx = x + w / 2, cy = y + h * 0.52;
    return `<clipPath id="${id}"><polygon points="${pts}"/></clipPath><g clip-path="url(#${id})"><rect class="dg-frame-ph" x="${x}" y="${y}" width="${w}" height="${h}"/>` +
      `<g class="dg-frame-icon" transform="translate(${cx - 10} ${cy - 8})"><rect x="1" y="1" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 13l4.5-5 3.5 3.5 2.5-2.5L17 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></g>${img}</g>`;
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
  const BALL = `<ellipse rx="17" ry="11.5" fill="${B.base}" stroke="${B.line}" stroke-width="1.6"/>` +
    `<path d="M-12,8 Q0,-2 15,-5 Q12,1 -6,10 Z" fill="${B.stripe2}"/>` +
    `<path d="M-14,4 Q2,-6 16,-3" stroke="${B.stripe}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const ballG = $('dg-ball');
  ballG.innerHTML = `<g id="dg-ball-in">${BALL}</g>`;
  const ballIn = $('dg-ball-in');
  $('dg-mark-ball').innerHTML = BALL;
  $('dg-r-ball').innerHTML = `<g transform="rotate(-28)">${BALL}</g>`;
  const ball = { x: 0, y: 0, rot: -40, s: 1, o: 1, sq: 1 };
  function drawBall() {
    ballG.setAttribute('opacity', ball.o.toFixed(3));
    ballIn.setAttribute('transform', `translate(${ball.x.toFixed(2)} ${ball.y.toFixed(2)}) rotate(${ball.rot.toFixed(1)}) scale(${(K.s * ball.s).toFixed(3)} ${(K.s * ball.s * ball.sq).toFixed(3)})`);
  }
  const toScene = p => ({ x: K.x + p[0] * K.s, y: K.y + p[1] * K.s });

  /* ---------- the kicker: four poses, tweened ---------- */
  const kickerG = $('dg-kicker');
  kickerG.setAttribute('transform', `translate(${K.x} ${K.y}) scale(${K.s})`);
  const KP = window.DG2Kicker;
  const pose = { from: 'ready', to: 'ready', t0: 0, dur: 0, ease: E.out, now: 'ready' };
  function poseTo(to, dur, ease) { pose.from = pose.now; pose.to = to; pose.t0 = now; pose.dur = reduce.matches ? 0 : dur; pose.ease = ease || E.out; }
  function setPose(p) { pose.from = pose.to = pose.now = p; pose.dur = 0; }
  function updateKicker() {
    const t = pose.dur ? clamp((now - pose.t0) / (pose.dur * 1000), 0, 1) : 1;
    pose.now = t >= 1 ? pose.to : KP.lerpPose(pose.from, pose.to, pose.ease(t));
    kickerG.innerHTML = KP.markup(PARTS, pose.now);
  }
  function ballInHands() { const p = toScene(KP.hands(pose.now)); ball.x = p.x; ball.y = p.y; ball.rot = -40; ball.s = 1; ball.o = 1; ball.sq = 1; }

  /* ---------- timing bar ---------- */
  const span = T.end - T.release, at = t => clamp((t - T.release) / span, 0, 1) * 100;
  const zone = $('dg-zone'), zoneL = $('dg-zone-l'), mark = $('dg-mark');
  zone.style.left = at(T.bounce + T.perfect - T.tol).toFixed(2) + '%';
  zone.style.width = (2 * T.tol / span * 100).toFixed(2) + '%';
  zoneL.style.left = at(T.bounce + T.perfect).toFixed(2) + '%';
  function markAt(t) { mark.style.left = at(t).toFixed(2) + '%'; }

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
  function setHint(txt) { if (txt) hint.textContent = txt; hint.classList.toggle('is-off', !txt); }
  /* The call to act follows the two taps (24 Nov, from play-testing: one tap read as the whole game): Tap to drop, then
     Tap to kick while the ball falls, then Kick now while a kick would score, in step with the bar's KICK zone */
  const HEAD = { drop: 'Tap to drop', kick: 'Tap to kick', now: 'Kick now', goal: 'Goal' };
  let headIs = '';
  function setHead(state) {
    if (state === true) state = 'goal'; else if (!state) state = 'drop';
    if (state === headIs) return;
    headIs = state; head.textContent = HEAD[state];
    head.classList.toggle('is-goal', state === 'goal'); head.classList.toggle('is-now', state === 'now');
    /* GOAL lands with a small pop; the other words change at once, as the taps are timed against them */
    if (state === 'goal' && head.animate && !reduce.matches) head.animate([{ transform: 'scale(.8)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
  function say(msg) { if (DEMO) return; sayEl.textContent = ''; setTimeout(() => { sayEl.textContent = msg; }, 30); }
  R.say = say;

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
    if (phase === 'hold' || (phase === 'pass' && !D.passing)) ballInHands();
    drawBall();
    const moving = (phase !== 'hold' && phase !== 'result') || timers.length || (pose.dur && now < pose.t0 + pose.dur * 1000 + 40);
    if (moving) raf = requestAnimationFrame(loop);
  }

  /* the ball in the hands, waiting; after a miss the friendly line stays up until the next drop */
  function hold(note) {
    setPhase('hold');
    setHint(note || 'Then tap again as it bounces.');
    setHead('drop');
    start();
    if (DEMO && demoGo && !reduce.matches) {
      if (demoRan) { demoGo = demoRan = false; markAt(T.release); if (window.__dgDemo.onDone) window.__dgDemo.onDone(); }   /* once through: rest here */
      else after(0.9, () => { if (phase === 'hold' && demoGo) { demoRan = true; demoTap(1); drop(); } });
    }
  }
  /* Demo: where a press lands, and which it is: Tap 1, Tap 2 on touch screens, Click 1, Click 2 with a mouse. The
     marker holds long enough to read, and the ring pulses out from under it */
  const CLICK = document.documentElement.classList.contains('is-click');
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
    setHint('Now tap again as it bounces.'); setHead('kick');
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
      to = { x: mid.x + (FAR.x - NEAR.x) * o, y: mid.y - 54 + (barY(FAR) - barY(NEAR)) * o };
      peak = 120; fade = 0.12;
    } else if (out === 'wide') {
      to = { x: NEAR.x - 30 - sev * 40, y: mid.y - 46 }; peak = 110; fade = 0.3;
    } else {
      to = { x: lerp(from.x, NEAR.x, 0.75 - sev * 0.25), y: NEAR.base - 10 }; peak = 120 - sev * 50; fade = 0;
    }
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
      dropBallAt(t); markAt(t);
      setHead(Math.abs(t - (T.bounce + T.perfect)) <= T.tol ? 'now' : 'kick');
      if (DEMO && !D.kicked && t >= T.bounce + T.perfect) { demoTap(2); kick(T.bounce + T.perfect); return; }   /* the second tap, as it comes up */
      if (t >= T.end && !D.kicked) { D.none = true; kick(T.end); }   /* never tapped: the boot swings anyway, late */
    } else if (phase === 'swing') {
      dropBallAt(D.tTap + t);
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
      const dp = (window.DG2Places || []).find(p => p.image && !p.stand_in) || window.DG2Places[0];
      setHead(true); showFrame(dp);
      after(1.7, () => { if (phase === 'goal') { hideFrame(); D.note = null; pass(); } });
      return;
    }
    goals++;
    renderTable();
    setHead(true);
    const p = R.next(teams); D.place = p;
    setHint(team ? `Through the posts. +3 for ${team}.` : 'Through the posts.');
    if (team) { plus.classList.remove('is-on'); void plus.offsetWidth; plus.classList.add('is-on'); }
    showFrame(p);
    const rank = team ? rows().findIndex(x => x.me) + 1 : 0;
    say(`Goal. The ball landed in ${p.name}.` + (team ? ` 3 points for ${team}, ${ord(rank)} on the table.` : ''));
    after(reduce.matches ? 0 : 1.2, result);
  }
  function result() { if (phase !== 'goal') return; setPhase('result'); R.open(D.place, teams, kickAgain); }
  /* Kick again: back to the pitch, and the next ball comes */
  function kickAgain() { hideFrame(); D.note = null; pass(); }

  /* a miss is friendly: it says what happened in plain words, the next ball is on its way, and a tap takes it at once */
  function miss(kind) {
    setPhase('miss');
    D.note = MISS[D.none ? 'none' : kind];
    setHint(D.note); setHead('drop');
    say(D.note);
    after(0.45, () => { if (phase === 'miss') pass(); });
  }

  function pass() {
    setPhase('pass');
    plus.classList.remove('is-on');
    setHead(false);
    poseTo('ready', 0.3, E.out);
    if (reduce.matches) { D.passing = false; hold(D.note); return; }
    D.passing = true; D.px = 430; D.py = K.y - 60; D.passDur = 0.6;
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
    if (R.isOpen()) return;                                  /* the result and the places are not the pitch */
    now = performance.now();                                 /* one clock: every tap is timed on performance.now() */
    if (phase === 'goal') { timers = []; result(); return; }
    if (phase === 'hold') drop();
    else if (phase === 'drop') { const td = (now - t0) / 1000; if (td > T.release + 0.05) kick(td); }
    else if (phase === 'miss' || phase === 'pass') again();
  }
  const stage = $('dg');
  if (DEMO) {
    stage.removeAttribute('tabindex'); stage.removeAttribute('role'); stage.setAttribute('aria-hidden', 'true');
    const rest = () => { timers = []; D.passing = false; R.reset(); hideFrame(); setPose('ready'); markAt(T.release); };
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
  if (!DEMO) stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { stage.focus({ preventScroll: true }); } catch (x) {}
    tap();
  });
  if (!DEMO) document.addEventListener('keydown', e => {
    if (R.isOpen()) return;
    /* Escape on the kick screen leaves the game, when the Version 2 page shows it full screen */
    if (e.key === 'Escape') { try { if (parent !== window && parent.v2Play) { e.preventDefault(); parent.v2Play.close(); } } catch (x) {} return; }
    if (e.target && e.target.closest && e.target.closest('button')) return;      /* a button's own Enter and Space */
    if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) tap(); }
  });

  /* See the places: from the kick screen and from the result, never a kick */
  const see = $('dg-see');
  see.addEventListener('pointerdown', e => e.stopPropagation());
  see.addEventListener('click', () => R.openPlaces(see, teams));
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
  drawPitch(); drawPosts(); renderTable();
  setPose('ready'); markAt(T.release);
  hold();
  window.__dg2 = { phase: () => phase, team: () => team, teams: () => teams.slice(), goals: () => goals, place: () => (D.place ? D.place.id : null), T };   /* read-only, for the regression checks */
})();
