/* Drop goal, Version 2: the kicker's kit and skin, and the ball's stripes, from a team's palette.
   Copied from ../../drop-goal/js/teams.js (Options A to C's game, 24 Nov 2026) so a change there never moves this
   game: the 24 teams' flag colours (Figma node 395:531) and the skin rule, trimmed to what the kick screen needs.
   Skin rule (do not relax): skin is only ever a blue or green from the team's own palette, never red, yellow, orange,
   white, brown or black, and never a realistic skin tone. Teams with no blue or green use a neutral slate. */
(function () {
  const W = '#f5f5f5', RED = '#ff4b55', NAVY = '#41479b', GRN = '#73af00', LB = '#82afff',
    BLU = '#4173cd', ORG = '#ff9b46', YEL = '#ffe15a', ESR = '#c8414b', ESY = '#ffd250';
  const TEAMS = [
    { name: 'Argentina', jersey: W, hoops: LB, trim: LB, shorts: W, socks: LB, band: W, skin: LB },
    { name: 'Australia', jersey: RED, trim: W, shorts: W, socks: RED, band: NAVY, skin: NAVY },
    { name: 'Canada', jersey: RED, trim: W, shorts: W, socks: RED, band: W, skin: null },
    { name: 'Chile', jersey: RED, trim: W, shorts: W, socks: NAVY, band: W, skin: NAVY },
    { name: 'England', jersey: W, trim: RED, shorts: W, socks: W, band: RED, skin: null },
    { name: 'Fiji', jersey: W, trim: LB, shorts: W, socks: W, band: LB, skin: LB },
    { name: 'France', jersey: W, trim: RED, shorts: RED, socks: W, band: RED, skin: NAVY },
    { name: 'Georgia', jersey: W, trim: RED, shorts: RED, socks: W, band: RED, skin: null },
    { name: 'Hong Kong China', jersey: RED, trim: W, shorts: RED, socks: W, band: RED, skin: null },
    { name: 'Ireland', jersey: W, trim: ORG, shorts: ORG, socks: W, band: ORG, skin: GRN },
    { name: 'Italy', jersey: RED, trim: W, shorts: W, socks: W, band: GRN, skin: GRN },
    { name: 'Japan', jersey: RED, hoops: W, trim: W, shorts: W, socks: RED, band: W, skin: null },
    { name: 'New Zealand', jersey: W, trim: RED, shorts: W, socks: RED, band: W, skin: NAVY },
    { name: 'Portugal', jersey: RED, trim: GRN, shorts: W, socks: RED, band: GRN, skin: GRN },
    { name: 'Romania', jersey: YEL, trim: RED, shorts: RED, socks: YEL, band: RED, skin: NAVY },
    { name: 'Samoa', jersey: RED, trim: W, shorts: RED, socks: RED, band: W, skin: NAVY },
    { name: 'Scotland', jersey: W, trim: BLU, shorts: W, socks: BLU, band: W, skin: BLU },
    { name: 'South Africa', jersey: GRN, trim: W, shorts: W, socks: GRN, band: RED, skin: NAVY },
    { name: 'Spain', jersey: ESR, trim: ESY, shorts: ESY, socks: ESR, band: ESY, skin: null },
    { name: 'Tonga', jersey: RED, trim: W, shorts: RED, socks: RED, band: W, skin: null },
    { name: 'USA', jersey: W, hoops: RED, trim: RED, shorts: NAVY, socks: W, band: RED, skin: NAVY },
    { name: 'Uruguay', jersey: W, trim: BLU, shorts: W, socks: W, band: BLU, skin: BLU },
    { name: 'Wales', jersey: RED, trim: W, shorts: W, socks: RED, band: GRN, skin: GRN },
    { name: 'Zimbabwe', jersey: YEL, trim: GRN, shorts: W, socks: YEL, band: RED, skin: GRN }
  ];
  /* No team picked: the Third Half kit from the style reference (docs/drop-goal-style.png), green and gold */
  const DEFAULT = { name: '', jersey: '#256a3e', trim: '#fdce01', shorts: '#fdce01', socks: '#256a3e', band: '#fdce01', skin: '#256a3e' };

  function hexToHsl(h) {
    const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let hh = 0, ss = 0;
    if (mx !== mn) {
      const d = mx - mn; ss = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60;
    }
    return [hh, ss, l];
  }
  function hslToHex(h, s, l) {
    l = Math.max(0.06, Math.min(0.94, l));
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))).toString(16).padStart(2, '0');
    return '#' + f(0) + f(8) + f(4);
  }
  function darken(hex, amt) { const [h, s, l] = hexToHsl(hex); return hslToHex(h, s, l - amt); }
  /* The team's blue or green, at a lightness that stays clear of the pitch; slate where the team has neither */
  function skinFor(t) {
    let [h, s] = t.skin ? hexToHsl(t.skin) : [218, 0.16];
    if (t.skin && h > 70 && h < 100) h = 100;               // the flag lime goes olive when dark: nudge it to green
    const sat = t.skin ? Math.min(0.7, Math.max(0.42, s)) : s;
    const green = t.skin && h > 80 && h < 175;
    const L = green ? 0.7 : 0.62;
    return { skin: hslToHex(h, sat, L), skinBack: hslToHex(h, sat, L - 0.07), skinShade: hslToHex(h, sat, L - 0.09), eye: '#17211a' };
  }
  /* The ball: cream, its stripes in the team's two strongest colours (white is skipped, as it vanishes on cream) */
  function ballFor(t) {
    const cols = [t.jersey, t.trim, t.band, t.socks, t.shorts].filter(c => c && c !== W);
    const a = cols[0] || '#256a3e', b = cols.find(c => c !== a) || '#fdce01';
    return { base: '#f4f2ea', line: darken(a, 0.1), stripe: a, stripe2: b };
  }
  function kitFor(name) {
    const t = TEAMS.find(x => x.name === name) || DEFAULT;
    return Object.assign({ team: t.name }, skinFor(t), {
      hair: '#262022', jersey: t.jersey, jerseyBack: darken(t.jersey, 0.08), jerseyLine: darken(t.jersey, 0.12),
      hoops: t.hoops || null, trim: t.trim, trimBack: darken(t.trim, 0.08), shorts: t.shorts, shortsBack: darken(t.shorts, 0.08),
      sock: t.socks, sockBack: darken(t.socks, 0.08), band: t.band, bandBack: darken(t.band, 0.08),
      boot: '#3a3a3a', bootBack: '#2c2c2c', ball: ballFor(t)
    });
  }
  window.DG2Kit = { TEAMS: TEAMS.map(t => t.name), kitFor };
})();
