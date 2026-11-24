/* Drop goal, Version 2: the kicker, one rigged SVG figure in four poses (ready, drop, kick, follow-through).
   Copied from ../../drop-goal/js/rig.js (Options A to C's game, 24 Nov 2026), so a change there never moves this one:
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

  function parts(C) {
    function arm(back) {
      const sk = back ? C.skinBack : C.skin, je = back ? C.jerseyBack : C.jersey, tr = back ? C.trimBack : C.trim;
      return {
        upper: `<line x1="2" y1="-150" x2="2" y2="-137" stroke="${je}" stroke-width="16" stroke-linecap="round"/><rect x="-6" y="-139" width="16" height="4" rx="1" fill="${tr}"/><line x1="2" y1="-133" x2="2" y2="-124" stroke="${sk}" stroke-width="11" stroke-linecap="round"/>`,
        fore: `<line x1="2" y1="-124" x2="2" y2="-100" stroke="${sk}" stroke-width="10" stroke-linecap="round"/><circle cx="2.5" cy="-96" r="6.2" fill="${sk}"/>`
      };
    }
    function leg(back) {
      const sk = back ? C.skinBack : C.skin, sh = back ? C.shortsBack : C.shorts, so = back ? C.sockBack : C.sock, bd = back ? C.bandBack : C.band, bo = back ? C.bootBack : C.boot;
      return {
        thigh: `<line x1="0" y1="-82" x2="0" y2="-57" stroke="${sk}" stroke-width="15" stroke-linecap="round"/><path d="M-13,-113 L13,-113 L13,-80 Q0,-76 -13,-80 Z" fill="${sh}" stroke="${sh}" stroke-width="2" stroke-linejoin="round"/>`,
        shin: `<line x1="0" y1="-56" x2="0" y2="-46" stroke="${sk}" stroke-width="13" stroke-linecap="round"/><path d="M-6.5,-48 L6.5,-48 L5.5,-10 L-5.5,-10 Z" fill="${so}" stroke="${so}" stroke-width="2" stroke-linejoin="round"/><rect x="-7.5" y="-48" width="15" height="5" rx="1.5" fill="${bd}"/>`,
        foot: `<path d="M-7,-13 L7,-13 Q12,-10 17,-6 Q20,-3 19,1 L-7,1 Q-9,-6 -7,-13 Z" fill="${bo}"/><path d="M-7,-2 L19,-2" stroke="${back ? '#1f1f1f' : '#262626'}" stroke-width="2"/>`
      };
    }
    return {
      BA: arm(true), FA: arm(false), BL: leg(true), FL: leg(false),
      TORSO: `<rect x="-3" y="-170" width="9" height="12" rx="3" fill="${C.skinShade}"/><path d="M-15,-99 L15,-99 L17,-138 Q17,-160 6,-163 L-6,-163 Q-18,-160 -18,-138 Z" fill="${C.jersey}"/>` +
        (C.hoops ? `<rect x="-16.5" y="-142" width="33" height="7" fill="${C.hoops}"/><rect x="-16" y="-125" width="31.5" height="7" fill="${C.hoops}"/>` : '') +
        `<path d="M-15,-108 L15,-108" stroke="${C.jerseyLine}" stroke-width="2" opacity=".6"/><path d="M-6,-164 Q3,-158 10,-163 L8.5,-157 Q3,-152 -5,-158 Z" fill="${C.trim}"/>`,
      PELVIS: `<path d="M-15,-114 L15,-114 L15,-98 L-15,-98 Z" fill="${C.shorts}"/>`,
      HEAD: `<circle cx="3" cy="-181" r="15" fill="${C.skin}"/><path d="M-12,-182 Q-13,-199 4,-198 Q17,-197 19,-186 Q11,-190 3,-188 Q-3,-185 -5,-177 Q-10,-174 -12,-182 Z" fill="${C.hair}"/><ellipse cx="-2" cy="-178" rx="3" ry="4" fill="${C.skinShade}"/><circle cx="13" cy="-181" r="1.6" fill="${C.eye}"/><path d="M17,-176 Q14,-173 11,-174" stroke="${C.skinShade}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
    };
  }
  /* The figure's markup for a pose, standing on its ground line (the caller places and scales it) */
  function markup(Pt, pose) {
    const p = full(pose), L = links(p), g = groundOffset(p);
    const G = (l, body) => `<g transform="${tf(l)}">${body}</g>`;
    return `<g transform="translate(0 ${g.toFixed(2)})">` + [
      G(L.lUp, Pt.BA.upper), G(L.lFo, Pt.BA.fore), G(L.lTh, Pt.BL.thigh), G(L.lSh, Pt.BL.shin), G(L.lFt, Pt.BL.foot),
      Pt.PELVIS, G(L.torso, Pt.TORSO), G(L.head, Pt.HEAD),
      G(L.rTh, Pt.FL.thigh), G(L.rSh, Pt.FL.shin), G(L.rFt, Pt.FL.foot),
      G(L.rUp, Pt.FA.upper), G(L.rFo, Pt.FA.fore)
    ].join('') + '</g>';
  }
  window.DG2Kicker = { POSES: Object.keys(POSES), lerpPose, parts, markup, hands, boot };
})();
