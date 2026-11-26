// Game-wide constants and small DOM helpers.

/* ================= Kick to NSW: game layer ================= */
const $ = id => document.getElementById(id);
const REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- World constants (world units are roughly metres, y up) ---------- */
const GY = 590;                // screen y of the ground line
const POST_X = 10, BAR_H = 3, POST_H = 9;
const ZONE_START = 40, ZONE_W = 60, NZ = 10;
const G = 9.8;
const RIG = 0.0095;            // world units per rig unit (player is about 1.9 tall)
const START_CAM = { k: 55, x: 5.4 };
const FIELD_COL = "#67a656";
