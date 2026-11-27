/* Drop goal, Version 2: the kicker, one rigged SVG figure in four poses (ready, drop, kick, follow-through).
   Copied from ../drop-goal/js/rig.js (Options A to C's game, 24 Nov 2026), so a change there never moves this one:
   the same skeleton, joints and part drawings. Poses are joint angles only, so the figure never changes shape; the
   game tweens between them. Drawn side-on, facing right, ground at y = 0. Angles in degrees, + is clockwise: backwards
   for a limb, forwards for the torso. The near (front, r) leg kicks. */
(function () {
  const J = { hip: [0, -102], knee: [0, -56], ankle: [0, -10], shoulder: [2, -152], elbow: [2, -124], wrist: [2, -98], neck: [1, -163] };
  const BASE = { torso: 0, head: 0, lThigh: 0, lShin: 0, lFoot: 0, rThigh: 0, rShin: 0, rFoot: 0, lUpper: 0, lFore: 0, rUpper: 0, rFore: 0 };
  const POSES = {
    /* ball held out at the waist, weight on both feet */
    ready:  { torso: 6, head: 2, lThigh: 6, lShin: 2, rThigh: -8, rShin: 6, lUpper: -40, lFore: -62, rUpper: -34, rFore: -70 },
    /* the hands open and let the ball fall; the kicking leg cocks back */
    drop:   { torso: 12, head: 10, lThigh: -6, lShin: 8, rThigh: 34, rShin: 80, rFoot: 14, lUpper: -64, lFore: -10, rUpper: -50, rFore: -8 },
    /* the boot meets the ball as it comes up off the ground */
    kick:   { torso: -10, head: 14, lThigh: 2, lShin: 12, rThigh: -52, rShin: 10, rFoot: 30, lUpper: -100, lFore: -12, rUpper: 40, rFore: -18 },
    /* through and up, leaning back, watching it go */
    follow: { torso: -20, head: 0, lThigh: 14, lShin: 6, lFoot: -24, rThigh: -96, rShin: 12, rFoot: 22, lUpper: -128, lFore: -8, rUpper: 54, rFore: -30 }
  };
  const full = p => Object.assign({}, BASE, typeof p === 'string' ? POSES[p] : p);
  const lerpPose = (a, b, t) => { a = full(a); b = full(b); const o = {}; for (const k in BASE) o[k] = a[k] + (b[k] - a[k]) * t; return o; };

  function rot(p, a, c) {
    const r = a * Math.PI / 180, dx = p[0] - c[0], dy = p[1] - c[1];
    return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)];
  }
  function chain(p, links) { for (let i = links.length - 1; i >= 0; i--) p = rot(p, links[i][0], links[i][1]); return p; }
  const tf = links => links.map(([a, c]) => `rotate(${a.toFixed(2)} ${c[0]} ${c[1]})`).join(' ');
  function links(p) {
    const torso = [[p.torso, J.hip]];
    return {
      torso, head: [...torso, [p.head, J.neck]],
      lUp: [...torso, [p.lUpper, J.shoulder]], lFo: [...torso, [p.lUpper, J.shoulder], [p.lFore, J.elbow]],
      rUp: [...torso, [p.rUpper, J.shoulder]], rFo: [...torso, [p.rUpper, J.shoulder], [p.rFore, J.elbow]],
      lTh: [[p.lThigh, J.hip]], lSh: [[p.lThigh, J.hip], [p.lShin, J.knee]], lFt: [[p.lThigh, J.hip], [p.lShin, J.knee], [p.lFoot, J.ankle]],
      rTh: [[p.rThigh, J.hip]], rSh: [[p.rThigh, J.hip], [p.rShin, J.knee]], rFt: [[p.rThigh, J.hip], [p.rShin, J.knee], [p.rFoot, J.ankle]]
    };
  }
  /* How far the figure lifts so the lowest sole or knee touches the ground */
  function groundOffset(p) {
    const L = links(p);
    const pts = [chain([-7, 1], L.lFt), chain([19, 1], L.lFt), chain([-7, 1], L.rFt), chain([19, 1], L.rFt), chain([0, -49], L.lSh), chain([0, -49], L.rSh)];
    return -Math.max(...pts.map(q => q[1]));
  }
  /* Points the game needs, in the figure's own units (ground at 0): between the hands, and the front boot's laces */
  function hands(p) { p = full(p); const L = links(p), a = chain(J.wrist, L.lFo), b = chain(J.wrist, L.rFo), g = groundOffset(p); return [(a[0] + b[0]) / 2 + 8, (a[1] + b[1]) / 2 + g + 2]; }
  function boot(p) { p = full(p); const L = links(p), q = chain([12, -6], L.rFt); return [q[0], q[1] + groundOffset(p)]; }

  /* Drawn to docs/drop-goal-style.png's player (25 Nov 2026): turned a little towards the viewer, so the far shoulder
     and hip sit ahead of the near ones (FAR_ARM, FAR_LEG) and the chest shows, with a V collar, cuffs, a wide band on
     the socks and a plain face. The skeleton and poses are unchanged. */
  const FAR_ARM = 'translate(8 -2)', FAR_LEG = 'translate(6 -2)';
  function parts(C) {
    function arm(back) {
      const sk = back ? C.skinBack : C.skin, je = back ? C.jerseyBack : C.jersey, tr = back ? C.trimBack : C.trim;
      return {
        upper: `<line x1="2" y1="-133" x2="2" y2="-124" stroke="${sk}" stroke-width="11" stroke-linecap="round"/><path d="M-6.5,-152 Q-6.5,-158 2,-158 Q10.5,-158 10.5,-152 L11,-134 L-7,-134 Z" fill="${je}"/><path d="M-7,-138 L11,-138 L11,-133 L-7,-133 Z" fill="${tr}"/>`,
        fore: `<path d="M-3.5,-125 L7.5,-125 L6,-98 L-1.5,-98 Z" fill="${sk}" stroke="${sk}" stroke-width="2" stroke-linejoin="round"/><circle cx="2.5" cy="-95" r="6.4" fill="${sk}"/>`
      };
    }
    function leg(back) {
      const sk = back ? C.skinBack : C.skin, sh = back ? C.shortsBack : C.shorts, so = back ? C.sockBack : C.sock, bd = back ? C.bandBack : C.band, bo = back ? C.bootBack : C.boot;
      return {
        thigh: `<path d="M-7.5,-84 L8,-84 L6.5,-56 L-6,-56 Z" fill="${sk}" stroke="${sk}" stroke-width="3" stroke-linejoin="round"/><path d="M-12.5,-106 L12.5,-106 L13.5,-81 Q1,-77 -12.5,-80 Z" fill="${sh}" stroke="${sh}" stroke-width="2" stroke-linejoin="round"/>`,
        shin: `<line x1="0" y1="-56" x2="0" y2="-46" stroke="${sk}" stroke-width="13" stroke-linecap="round"/><path d="M-7.5,-44 Q-9,-30 -5.5,-10 L5.5,-10 L7,-44 Z" fill="${so}" stroke="${so}" stroke-width="2" stroke-linejoin="round"/><rect x="-9" y="-48" width="17.5" height="9" rx="2" fill="${bd}"/>`,
        foot: `<path d="M-8,-14 L7,-14 Q13,-11.5 19,-7 Q23.5,-3.5 21.5,1 L-8,1 Q-10.5,-6 -8,-14 Z" fill="${bo}"/>`
      };
    }
    return {
      BA: arm(true), FA: arm(false), BL: leg(true), FL: leg(false),
      TORSO: `<path d="M-2,-173 L9,-173 L10,-160 L-3,-160 Z" fill="${C.skinShade}"/><path d="M-15,-99 L19,-100 L21.5,-138 Q21.5,-159 11,-162 L-6,-163 Q-18,-160 -18,-138 Z" fill="${C.jersey}"/>` +
        `<path d="M-15,-99 L-5,-99.3 L-7,-162.6 Q-18,-160 -18,-138 Z" fill="${C.jerseyBack}"/>` +
        (C.hoops ? `<path d="M-18,-138 L21.5,-138 L21.2,-131 L-17.7,-131 Z" fill="${C.hoops}"/><path d="M-17,-122 L20.4,-122 L20,-115 L-16.5,-115 Z" fill="${C.hoops}"/>` : '') +
        `<path d="M-6,-164 L11,-163 L5.5,-146 Z" fill="${C.trim}"/><path d="M-2.5,-164 L8.5,-163.4 L5,-153 Z" fill="${C.skinShade}"/>`,
      PELVIS: `<path d="M-14,-108 L19,-108 L19,-94 L-14,-94 Z" fill="${C.shorts}"/>`,
      HEAD: `<ellipse cx="5" cy="-181" rx="12.5" ry="14.5" fill="${C.skin}"/><path d="M-7.6,-180 Q-10,-197 5,-196.5 Q16.5,-196 17.6,-186 Q11,-190.5 4,-188.5 Q-0.5,-187 -1.5,-180 Q-2,-174.5 -5,-172.5 Q-8,-176 -7.6,-180 Z" fill="${C.hair}"/><ellipse cx="1.2" cy="-179" rx="2.6" ry="3.8" fill="${C.skinShade}"/>`
    };
  }
  /* The figure's markup for a pose, standing on its ground line (the caller places and scales it) */
  function markup(Pt, pose) {
    const p = full(pose), L = links(p), g = groundOffset(p);
    const G = (l, body, off) => `<g transform="${off ? off + ' ' : ''}${tf(l)}">${body}</g>`;
    return `<g transform="translate(0 ${g.toFixed(2)})">` + [
      G(L.lUp, Pt.BA.upper, FAR_ARM), G(L.lFo, Pt.BA.fore, FAR_ARM), G(L.lTh, Pt.BL.thigh, FAR_LEG), G(L.lSh, Pt.BL.shin, FAR_LEG), G(L.lFt, Pt.BL.foot, FAR_LEG),
      Pt.PELVIS, G(L.torso, Pt.TORSO), G(L.head, Pt.HEAD),
      G(L.rTh, Pt.FL.thigh), G(L.rSh, Pt.FL.shin), G(L.rFt, Pt.FL.foot),
      G(L.rUp, Pt.FA.upper), G(L.rFo, Pt.FA.fore)
    ].join('') + '</g>';
  }
  window.DG2Kicker = { POSES: Object.keys(POSES), lerpPose, parts, markup, hands, boot };
})();
