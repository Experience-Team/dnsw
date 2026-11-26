// The rigged SVG player: skeleton, poses, forward kinematics and part drawings.
// Poses are joint rotations only, so the character never changes shape between frames.

/* ---------- Rig (rest pose, local coords, facing right, ground at y=0) ---------- */
const J = {
  hip: [0, -102], knee: [0, -56], ankle: [0, -10],
  shoulder: [2, -152], elbow: [2, -124], wrist: [2, -98], neck: [1, -163]
};
const S = 1.45;           // player scale in scene
const GROUND = 560;
const TEE_X = 560;

function rot(p, a, c) {   // rotate point p clockwise by a degrees about c (SVG convention)
  const r = a * Math.PI / 180, dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)];
}
// apply a chain of [angle, pivot] (outermost first) to a point
function chain(p, links) {
  for (let i = links.length - 1; i >= 0; i--) p = rot(p, links[i][0], links[i][1]);
  return p;
}
function tf(links) { return links.map(([a, c]) => `rotate(${a.toFixed(2)} ${c[0]} ${c[1]})`).join(" "); }

/* ---------- Poses (degrees; + is clockwise, i.e. backwards for limbs, forwards for torso) ---------- */
const BASE = { x: 380, lift: 0, torso: 0, head: 0,
  lThigh: 0, lShin: 0, lFoot: 0, rThigh: 0, rShin: 0, rFoot: 0,
  lUpper: 0, lFore: 0, rUpper: 0, rFore: 0 };
const P = {
  ready:     { x: 400, torso: 3, head: 2, lThigh: 6, lShin: 2, rThigh: -8, rShin: 6,
               lUpper: -28, lFore: -78, rUpper: -22, rFore: -86 },
  place:     { x: 486, torso: 62, head: -28, lThigh: -78, lShin: 118, lFoot: -32, rThigh: 18, rShin: 96, rFoot: -10,
               lUpper: -66, lFore: -6, rUpper: -60, rFore: -2 },
  set:       { x: 340, torso: 22, head: 6, lThigh: 10, lShin: 26, lFoot: -8, rThigh: -14, rShin: 30, rFoot: -10,
               lUpper: -48, lFore: -58, rUpper: -52, rFore: -50 },
  run1:      { x: 360, torso: 14, head: 0, lThigh: -38, lShin: 34, lFoot: -6, rThigh: 30, rShin: 70, rFoot: 10,
               lUpper: 34, lFore: -50, rUpper: -40, rFore: -56 },
  run2:      { x: 385, torso: 14, head: 0, lThigh: 30, lShin: 70, lFoot: 10, rThigh: -38, rShin: 34, rFoot: -6,
               lUpper: -40, lFore: -56, rUpper: 34, rFore: -50 },
  plant:     { x: 403, torso: -6, head: 8, lThigh: -16, lShin: 18, lFoot: -6, rThigh: 48, rShin: 92, rFoot: 18,
               lUpper: -78, lFore: -24, rUpper: 34, rFore: -24 },
  contact:   { x: 438, torso: -14, head: 14, lThigh: 0, lShin: 12, lFoot: 0, rThigh: -42, rShin: 10, rFoot: 30,
               lUpper: -104, lFore: -12, rUpper: 44, rFore: -18 },
  follow:    { x: 458, torso: -22, head: 2, lThigh: 14, lShin: 6, lFoot: -24, rThigh: -92, rShin: 12, rFoot: 22,
               lUpper: -128, lFore: -8, rUpper: 54, rFore: -30 },
  celebrate: { x: 470, lift: 34, torso: -4, head: -16, lThigh: -14, lShin: 36, lFoot: 8, rThigh: 12, rShin: 46, rFoot: 14,
               lUpper: -150, lFore: -20, rUpper: -178, rFore: -8 },
  miss:      { x: 470, torso: 14, head: 18, lThigh: 4, lShin: 4, rThigh: -4, rShin: 6,
               lUpper: -146, lFore: -116, rUpper: -140, rFore: -120 }
};
const ORDER = [["ready","Ready"],["place","Place ball"],["set","Set"],["run1","Run-up 1"],["run2","Run-up 2"],
  ["plant","Plant"],["contact","Contact"],["follow","Follow-through"],["celebrate","Celebrate"],["miss","Miss"]];
const full = k => Object.assign({}, BASE, P[k]);

/* ---------- Forward kinematics helpers ---------- */
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
// vertical offset so the lowest sole / knee touches the ground
function groundOffset(p) {
  const L = links(p);
  const pts = [
    chain([-7, 1], L.lFt), chain([19, 1], L.lFt), chain([-7, 1], L.rFt), chain([19, 1], L.rFt),
    chain([0, -49], L.lSh), chain([0, -49], L.rSh)
  ];
  return -Math.max(...pts.map(q => q[1]));
}
function toScene(p, q) { return [p.x + q[0] * S, GROUND + (groundOffset(p) + q[1]) * S - p.lift]; }

/* ---------- Part drawings (rebuilt whenever the team or shade changes) ---------- */
function arm(back) {
  const sk = back ? C.skinBack : C.skin, je = back ? C.jerseyBack : C.jersey, tr = back ? C.trimBack : C.trim;
  return {
    upper: `<line x1="2" y1="-150" x2="2" y2="-137" stroke="${je}" stroke-width="16" stroke-linecap="round"/>
            <rect x="-6" y="-139" width="16" height="4" rx="1" fill="${tr}"/>
            <line x1="2" y1="-133" x2="2" y2="-124" stroke="${sk}" stroke-width="11" stroke-linecap="round"/>`,
    fore:  `<line x1="2" y1="-124" x2="2" y2="-100" stroke="${sk}" stroke-width="10" stroke-linecap="round"/>
            <circle cx="2.5" cy="-96" r="6.2" fill="${sk}"/>`
  };
}
function leg(back) {
  const sk = back ? C.skinBack : C.skin, sh = back ? C.shortsBack : C.shorts, so = back ? C.sockBack : C.sock,
        bd = back ? C.bandBack : C.band, bo = back ? C.bootBack : C.boot;
  return {
    thigh: `<line x1="0" y1="-82" x2="0" y2="-57" stroke="${sk}" stroke-width="15" stroke-linecap="round"/>
            <path d="M-13,-113 L13,-113 L13,-80 Q0,-76 -13,-80 Z" fill="${sh}" stroke="${sh}" stroke-width="2" stroke-linejoin="round"/>`,
    shin:  `<line x1="0" y1="-56" x2="0" y2="-46" stroke="${sk}" stroke-width="13" stroke-linecap="round"/>
            <path d="M-6.5,-48 L6.5,-48 L5.5,-10 L-5.5,-10 Z" fill="${so}" stroke="${so}" stroke-width="2" stroke-linejoin="round"/>
            <rect x="-7.5" y="-48" width="15" height="5" rx="1.5" fill="${bd}"/>`,
    foot:  `<path d="M-7,-13 L7,-13 Q12,-10 17,-6 Q20,-3 19,1 L-7,1 Q-9,-6 -7,-13 Z" fill="${bo}"/>
            <path d="M-7,-2 L19,-2" stroke="${back ? '#1f1f1f' : '#262626'}" stroke-width="2"/>`
  };
}
let BACK_ARM, FRONT_ARM, BACK_LEG, FRONT_LEG, TORSO, PELVIS, HEAD;
function buildParts() {
  BACK_ARM = arm(true); FRONT_ARM = arm(false); BACK_LEG = leg(true); FRONT_LEG = leg(false);
  TORSO = `
  <rect x="-3" y="-170" width="9" height="12" rx="3" fill="${C.skinShade}"/>
  <path d="M-15,-99 L15,-99 L17,-138 Q17,-160 6,-163 L-6,-163 Q-18,-160 -18,-138 Z" fill="${C.jersey}"/>
  ${C.hoops ? `<rect x="-16.5" y="-142" width="33" height="7" fill="${C.hoops}"/><rect x="-16" y="-125" width="31.5" height="7" fill="${C.hoops}"/>` : ""}
  <path d="M-15,-108 L15,-108" stroke="${C.jerseyLine}" stroke-width="2" opacity=".6"/>
  <path d="M-6,-164 Q3,-158 10,-163 L8.5,-157 Q3,-152 -5,-158 Z" fill="${C.trim}"/>`;
  PELVIS = `<path d="M-15,-114 L15,-114 L15,-98 L-15,-98 Z" fill="${C.shorts}"/>`;
  HEAD = `
  <circle cx="3" cy="-181" r="15" fill="${C.skin}"/>
  <path d="M-12,-182 Q-13,-199 4,-198 Q17,-197 19,-186 Q11,-190 3,-188 Q-3,-185 -5,-177 Q-10,-174 -12,-182 Z" fill="${C.hair}"/>
  <ellipse cx="-2" cy="-178" rx="3" ry="4" fill="${C.skinShade}"/>
  <circle cx="13" cy="-181" r="1.6" fill="${C.eye}"/>
  <path d="M17,-176 Q14,-173 11,-174" stroke="${C.skinShade}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
}
buildParts();

function ballSVG() {
  return `<ellipse cx="0" cy="0" rx="17" ry="11.5" fill="${C.cream}" stroke="${C.green}" stroke-width="1.5"/>
    <path d="M-12,8 Q0,-2 15,-5 Q12,1 -6,10 Z" fill="${C.gold}"/>
    <path d="M-14,4 Q2,-6 16,-3" stroke="${C.green}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

/* Player markup. ballMode: 'held' draws the ball between the hands. */
function playerMarkup(p, ballMode) {
  const L = links(p);
  const g = (id, l, body) => `<g id="${id}" transform="${tf(l)}">${body}</g>`;
  let ball = "";
  if (ballMode === "held") {
    const a = chain([J.wrist[0], J.wrist[1]], L.lFo), b = chain([J.wrist[0], J.wrist[1]], L.rFo);
    const cx = (a[0] + b[0]) / 2 + 6, cy = (a[1] + b[1]) / 2 - 2;
    ball = `<g id="ball-held" transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(-55) scale(0.95)">${ballSVG()}</g>`;
  }
  return [
    g("arm-back-upper", L.lUp, BACK_ARM.upper), g("arm-back-fore", L.lFo, BACK_ARM.fore),
    g("leg-back-thigh", L.lTh, BACK_LEG.thigh), g("leg-back-shin", L.lSh, BACK_LEG.shin), g("leg-back-foot", L.lFt, BACK_LEG.foot),
    `<g id="pelvis">${PELVIS}</g>`,
    g("torso", L.torso, TORSO), g("head", L.head, HEAD),
    g("leg-front-thigh", L.rTh, FRONT_LEG.thigh), g("leg-front-shin", L.rSh, FRONT_LEG.shin), g("leg-front-foot", L.rFt, FRONT_LEG.foot),
    ball,
    g("arm-front-upper", L.rUp, FRONT_ARM.upper), g("arm-front-fore", L.rFo, FRONT_ARM.fore)
  ].join("");
}
function playerTransform(p) { return `translate(${p.x.toFixed(1)} ${(GROUND + groundOffset(p) * S - p.lift).toFixed(1)}) scale(${S})`; }
