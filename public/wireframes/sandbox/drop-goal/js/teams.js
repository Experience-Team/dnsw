// Teams, colour palette and per-team curation state (kit shade, skin shade, field colour).
// Skin rule: skin is only ever a blue or green from the team's own palette. See README.

/* ---------- Teams (colours sampled from the RWC team cards in Figma) ----------
   Skin uses a blue or green from each team's palette, never red, yellow, orange, white,
   brown or black, because those read as real skin colours or map to racial slurs.
   Teams with no blue or green get a neutral slate placeholder (flagged with *). */
const W = "#f5f5f5", RED = "#ff4b55", NAVY = "#41479b", GRN = "#73af00", LB = "#82afff",
      BLU = "#4173cd", ORG = "#ff9b46", YEL = "#ffe15a", ESR = "#c8414b", ESY = "#ffd250";
// colours sampled from the "Requested country flags" set in Figma (node 395:531)
const TEAMS = [
  { code: "ARG", name: "Argentina",    jersey: W,    hoops: LB,  trim: LB,   shorts: W,    socks: LB,   band: W,    skin: LB },
  { code: "AUS", name: "Australia",    jersey: RED,  trim: W,    shorts: W,    socks: RED,  band: NAVY, skin: NAVY },
  { code: "CAN", name: "Canada",       jersey: RED,  trim: W,    shorts: W,    socks: RED,  band: W,    skin: null },
  { code: "CHI", name: "Chile",        jersey: RED,  trim: W,    shorts: W,    socks: NAVY, band: W,    skin: NAVY },
  { code: "ENG", name: "England",      jersey: W,    trim: RED,  shorts: W,    socks: W,    band: RED,  skin: null },
  { code: "FIJ", name: "Fiji",         jersey: W,    trim: LB,   shorts: W,    socks: W,    band: LB,   skin: LB },
  { code: "FRA", name: "France",       jersey: W,    trim: RED,  shorts: RED,  socks: W,    band: RED,  skin: NAVY },
  { code: "GEO", name: "Georgia",      jersey: W,    trim: RED,  shorts: RED,  socks: W,    band: RED,  skin: null },
  { code: "HKG", name: "Hong Kong China", jersey: RED, trim: W,  shorts: RED,  socks: W,    band: RED,  skin: null },
  { code: "IRE", name: "Ireland",      jersey: W,    trim: ORG,  shorts: ORG,  socks: W,    band: ORG,  skin: GRN },
  { code: "ITA", name: "Italy",        jersey: RED,  trim: W,    shorts: W,    socks: W,    band: GRN,  skin: GRN },
  { code: "JPN", name: "Japan",        jersey: RED,  hoops: W,   trim: W,    shorts: W,    socks: RED,  band: W,    skin: null },
  { code: "NZL", name: "New Zealand",  jersey: W,    trim: RED,  shorts: W,    socks: RED,  band: W,    skin: NAVY },
  { code: "POR", name: "Portugal",     jersey: RED,  trim: GRN,  shorts: W,    socks: RED,  band: GRN,  skin: GRN },
  { code: "ROU", name: "Romania",      jersey: YEL,  trim: RED,  shorts: RED,  socks: YEL,  band: RED,  skin: NAVY },
  { code: "SAM", name: "Samoa",        jersey: RED,  trim: W,    shorts: RED,  socks: RED,  band: W,    skin: NAVY },
  { code: "SCO", name: "Scotland",     jersey: W,    trim: BLU,  shorts: W,    socks: BLU,  band: W,    skin: BLU },
  { code: "RSA", name: "South Africa", jersey: GRN,  trim: W,    shorts: W,    socks: GRN,  band: RED,  skin: NAVY },
  { code: "ESP", name: "Spain",        jersey: ESR,  trim: ESY,  shorts: ESY,  socks: ESR,  band: ESY,  skin: null },
  { code: "TGA", name: "Tonga",        jersey: RED,  trim: W,    shorts: RED,  socks: RED,  band: W,    skin: null },
  { code: "USA", name: "USA",          jersey: W,    hoops: RED, trim: RED,  shorts: NAVY, socks: W,    band: RED,  skin: NAVY },
  { code: "URU", name: "Uruguay",      jersey: W,    trim: BLU,  shorts: W,    socks: W,    band: BLU,  skin: BLU },
  { code: "WAL", name: "Wales",        jersey: RED,  trim: W,    shorts: W,    socks: RED,  band: GRN,  skin: GRN },
  { code: "ZIM", name: "Zimbabwe",     jersey: YEL,  trim: GRN,  shorts: W,    socks: YEL,  band: RED,  skin: GRN }
];
const SHADES = [0.74, 0.62, 0.5, 0.39];   // lightness steps; hue always stays the team's blue or green

function hexToHsl(h) {
  const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let hh = 0, ss = 0;
  if (mx !== mn) { const d = mx - mn; ss = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; }
  return [hh, ss, l];
}
const hsl = (h, s, l) => `hsl(${h.toFixed(0)} ${(s * 100).toFixed(0)}% ${(Math.max(0.08, Math.min(0.92, l)) * 100).toFixed(0)}%)`;
function darken(hex, amt) { const [h, s, l] = hexToHsl(hex); return hsl(h, s, l - amt); }
function skinFor(team, shadeIdx) {
  let [h, s] = team.skin ? hexToHsl(team.skin) : [218, 0.16];
  if (team.skin && h > 70 && h < 100) h = 100;   // the flag lime goes olive (brown-looking) when dark, so nudge it towards true green
  const sat = team.skin ? Math.min(0.7, Math.max(0.42, s)) : s;
  const isGreen = team.skin && h > 80 && h < 175;   // keep green skin clear of the pitch's lightness
  const L = (isGreen ? [0.8, 0.7, 0.33, 0.25] : SHADES)[shadeIdx];
  return { skin: hslToHex(h, sat, L), skinBack: hslToHex(h, sat, L - 0.07), skinShade: hslToHex(h, sat, L - 0.09),
           eye: L < 0.55 ? "#f4f3ee" : "#17211a" };
}
/* ---------- Curation state (per team kit + skin shade, field colour global or per team) ---------- */
const KIT_STEPS = [-0.18, -0.09, 0, 0.08, 0.15];   // lightness shift applied to every non-white kit colour
const FIELDS = ["#67a656", "#7cb867", "#4f8f45", "#3d7340", "#5e9a7a", "#3f7a6a", "#8a9a5b", "#4a6d8c", "#3b4a5c"];
const DEFAULT_FIELD = FIELDS[0];
let teamIdx = 0, shadeIdx = 1, kitIdx = 2, C;
let cfg = { field: DEFAULT_FIELD, fieldPerTeam: false, teams: {} };
try { const saved = JSON.parse(localStorage.getItem("sb:kickerCurate") || "null"); if (saved && saved.teams) cfg = Object.assign(cfg, saved); } catch (e) {}
function saveCfg() { try { localStorage.setItem("sb:kickerCurate", JSON.stringify(cfg)); } catch (e) {} }
function teamCfg(code) { return Object.assign({ kit: 2, skin: 1, field: null }, cfg.teams[code] || {}); }
function setTeamCfg(patch) { const code = TEAMS[teamIdx].code; cfg.teams[code] = Object.assign(teamCfg(code), patch); saveCfg(); }
function fieldColour() { const tc = teamCfg(TEAMS[teamIdx].code); return (cfg.fieldPerTeam && tc.field) || cfg.field; }

function hslToHex(h, s, l) {
  l = Math.max(0.06, Math.min(0.94, l));
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))).toString(16).padStart(2, "0");
  return "#" + f(0) + f(8) + f(4);
}
function kitAdjust(hex, d) { if (!hex || hex === W || d === 0) return hex; const [h, s, l] = hexToHsl(hex); return hslToHex(h, s, l + d); }
function setPalette() {
  const t0 = TEAMS[teamIdx], d = KIT_STEPS[kitIdx];
  const t = {}; for (const key of ["jersey", "hoops", "trim", "shorts", "socks", "band"]) t[key] = kitAdjust(t0[key], d);
  const k = skinFor(t0, shadeIdx);
  C = Object.assign({}, k, {
    hair: "#262022", jersey: t.jersey, jerseyBack: darken(t.jersey, 0.08), jerseyLine: darken(t.jersey, 0.12),
    hoops: t.hoops, trim: t.trim, trimBack: darken(t.trim, 0.08), shorts: t.shorts, shortsBack: darken(t.shorts, 0.08),
    sock: t.socks, sockBack: darken(t.socks, 0.08), band: t.band, bandBack: darken(t.band, 0.08),
    boot: "#3a3a3a", bootBack: "#2c2c2c", cream: "#f1ecdc", green: "#1f6b3a", gold: "#f2b41b"
  });
}
setPalette();
