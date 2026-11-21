// Start points and routes. ALL DESTINATIONS AND DISTANCES ARE PLACEHOLDERS (approximate, unverified).

/* ---------- Start points and routes (placeholder destinations, ordered by approx. road distance from the start) ----------
   Local covers roughly the first 30 km; North, South and West start beyond that so stops are not repeated. */
const STYLE = {
  coastN: { sea: true, hill: "#86b47c", hill2: "#6f9f6a", ground: ["#e5d29c", "#8fbd72"], hillFn: x => 5 + 3 * Math.sin(x / 23) + 2 * Math.sin(x / 7.3) },
  coastS: { sea: true, hill: "#4f8a5e", hill2: "#3f7450", ground: ["#e5d29c", "#6aa266"], hillFn: x => 12 + 6 * Math.sin(x / 31) + 3 * Math.sin(x / 9) },
  hunter: { sea: false, hill: "#8fae62", hill2: "#6f8f5a", ground: ["#9cc06a", "#7fa95d", "#b9c26a", "#8db363", "#c6bf68", "#a8b866", "#cdb760", "#c9a85a", "#c49a55", "#b98a50"],
            hillFn: x => 6 + 4 * Math.sin(x / 27) + 2 * Math.sin(x / 8) },
  city:   { sea: false, city: true, hill: "#8fa3b6", hill2: "#b3c2cf", ground: ["#9aa7a0", "#86b36f"], hillFn: x => 1 + 0.6 * Math.sin(x / 11) }
};
const alt = (pair, n = 10) => pair.length >= n ? pair : Array.from({ length: n }, (_, i) => pair[i % 2]);
function route(label, style, zones, extra = {}) { const s = STYLE[style]; return Object.assign({ label }, s, { ground: alt(s.ground) }, extra, { zones }); }

const STARTS = { sydney: "Sydney", newcastle: "Newcastle" };
const ROUTES = {
  "sydney-local": route("Local", "city", [["The Rocks", 1], ["Darling Harbour", 2], ["Surry Hills", 3], ["Newtown", 5], ["Bondi", 7],
    ["Coogee", 8], ["Sydney Olympic Park", 15], ["Manly", 17], ["Parramatta", 24], ["Cronulla", 26]]),
  "sydney-north": route("North coast", "coastN", [["Palm Beach", 40], ["Terrigal", 85], ["Lake Macquarie", 130], ["Newcastle", 160], ["Port Stephens", 210],
    ["Forster", 310], ["Port Macquarie", 390], ["Coffs Harbour", 530], ["Yamba", 640], ["Byron Bay", 765]]),
  "sydney-south": route("South coast", "coastS", [["Royal National Park", 35], ["Stanwell Park", 55], ["Wollongong", 85], ["Kiama", 120], ["Berry", 145],
    ["Jervis Bay", 185], ["Ulladulla", 230], ["Batemans Bay", 280], ["Narooma", 345], ["Eden", 470]]),
  "sydney-west": route("West", "hunter", [["Penrith", 55], ["Glenbrook", 65], ["Katoomba", 105], ["Lithgow", 140], ["Bathurst", 200],
    ["Orange", 255], ["Parkes", 355], ["Dubbo", 390], ["Cobar", 710], ["Broken Hill", 1150]], {
    hill: "#b9b26e", hill2: "#7690ab",
    ground: ["#7fb267", "#73a56a", "#62828f", "#6a879b", "#9fb06a", "#c2b265", "#d6b55c", "#d9a253", "#c97a45", "#b85d3a"],
    hillFn: x => x < 330 ? 1.5 + 1.2 * Math.sin(x / 9) : 3 + 1.5 * Math.sin(x / 13),
    // fixed geometry, found by simulation so the foothills, the plateau and the plains split kicks 20 / 20 / 60
    mountains: { f0: 70, p0: 100, p1: 200, e1: 238, height: 16, plateauZones: [2, 3] },   // Katoomba and Lithgow sit on top
    solidName: "Blue Mountains", solidCol: "#5f7d99", solidTop: "#7e9ab4" }),
  "newcastle-local": route("Local", "city", [["Honeysuckle", 1], ["Nobbys Beach", 2], ["Bar Beach", 3], ["Hamilton", 4], ["Merewether", 5],
    ["Charlestown", 10], ["Warners Bay", 15], ["Redhead", 16], ["Raymond Terrace", 25], ["Maitland", 30]]),
  "newcastle-north": route("North coast", "coastN", [["Anna Bay", 50], ["Nelson Bay", 60], ["Hawks Nest", 75], ["Seal Rocks", 125], ["Forster", 150],
    ["Taree", 160], ["Port Macquarie", 245], ["South West Rocks", 300], ["Coffs Harbour", 380], ["Byron Bay", 600]]),
  "newcastle-south": route("Central Coast to Sydney", "coastS", [["Swansea", 25], ["Catherine Hill Bay", 40], ["Norah Head", 75], ["The Entrance", 80], ["Gosford", 85],
    ["Terrigal", 95], ["Brooklyn", 120], ["Palm Beach", 140], ["Manly", 155], ["Sydney", 160]]),
  "newcastle-west": route("Hunter Valley", "hunter", [["Cessnock", 50], ["Pokolbin", 55], ["Wollombi", 75], ["Singleton", 80], ["Muswellbrook", 125],
    ["Denman", 135], ["Scone", 145], ["Mudgee", 250], ["Tamworth", 280], ["Gunnedah", 320]])
};
let startKey = "sydney", dirKey = "north";
let routeKey = "sydney-north";
const WIND_MAX = 0.7;
