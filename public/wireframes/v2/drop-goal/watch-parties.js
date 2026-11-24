/* Drop goal, Version 2: watch parties (24 Nov 2026, the January brief). Edit this list freely.
   For a team with no match in NSW, a goal lands on one of that team's watch parties, on the same card as a place.
   SAMPLE DATA, ALL OF IT: no watch party data exists, so every record here is invented for the prototype and shows in
   pink with Annotations on. Data contract §20 (watch parties), every field `gap`.
   - Precincts, public venues and fan sites only, never an individual business. The sites are real public places; that
     anything is screened there is invented.
   - team: who it is for. In real data this is worked out from the match (§20); it is held here to keep the file readable.
   - match: the fixture being screened, by its date and teams as in ../../concepts-fixtures.js (§17).
   - Every team with no NSW match has one in Sydney and one in Newcastle.
   Known gap, not solved: a watch party is tied to one match, so its card goes stale once that match has passed. */
window.DG2Parties = [
  { id: 'wp-argentina-darling-harbour', kind: 'watch', team: "Argentina", name: "Darling Harbour live site", host_city: 'sydney', location: "Tumbalong Park, Darling Harbour, Sydney",
    match: { d: 'Sat 2 Oct', t: "Argentina v Canada" }, tags: ['Watch party', 'Big screen', 'Sydney'],
    summary: "Watch Argentina v Canada on the big screen at Tumbalong Park, a short walk from Town Hall. Free and outdoors, with room to spread out on the grass.", image: null, sample: true },
  { id: 'wp-argentina-foreshore-park', kind: 'watch', team: "Argentina", name: "Foreshore Park rugby village", host_city: 'newcastle', location: "Foreshore Park, Newcastle",
    match: { d: 'Sun 10 Oct', t: "Argentina v Fiji" }, tags: ['Watch party', 'Harbour', 'Newcastle'],
    summary: "Watch Argentina v Fiji at the rugby village on Newcastle Harbour. Free, on the grass, with the foreshore walk either side.", image: 'village.jpg', stand_in: true, sample: true },
  { id: 'wp-canada-the-rocks', kind: 'watch', team: "Canada", name: "The Rocks fan site", host_city: 'sydney', location: "First Fleet Park, The Rocks, Sydney",
    match: { d: 'Sat 2 Oct', t: "Argentina v Canada" }, tags: ['Watch party', 'Harbour', 'Sydney'],
    summary: "Watch Argentina v Canada on a screen by the water at Circular Quay, with the Harbour Bridge behind it. Free, with food stalls on the night.", image: null, sample: true },
  { id: 'wp-canada-wheeler-place', kind: 'watch', team: "Canada", name: "Wheeler Place live site", host_city: 'newcastle', location: "Wheeler Place, Newcastle",
    match: { d: 'Fri 8 Oct', t: "Spain v Canada" }, tags: ['Watch party', 'Big screen', 'Newcastle'],
    summary: "Watch Spain v Canada on the screen in Wheeler Place, in the middle of the city by the Civic light rail stop. Free.", image: null, sample: true },
  { id: 'wp-chile-parramatta-square', kind: 'watch', team: "Chile", name: "Parramatta Square live site", host_city: 'sydney', location: "Parramatta Square, Parramatta",
    match: { d: 'Sat 2 Oct', t: "New Zealand v Chile" }, tags: ['Watch party', 'Big screen', 'Western Sydney'],
    summary: "Watch New Zealand v Chile on the big screen in Parramatta Square, two minutes from the station. Free and under cover if it rains.", image: null, sample: true },
  { id: 'wp-chile-honeysuckle', kind: 'watch', team: "Chile", name: "Honeysuckle fan site", host_city: 'newcastle', location: "Honeysuckle foreshore, Newcastle",
    match: { d: 'Sat 16 Oct', t: "Australia v Chile" }, tags: ['Watch party', 'Waterfront', 'Newcastle'],
    summary: "Watch Australia v Chile on the waterfront at Honeysuckle, a few minutes from Newcastle Interchange. Free, with places to eat along the promenade.", image: null, sample: true },
  { id: 'wp-hong-kong-china-darling-harbour', kind: 'watch', team: "Hong Kong China", name: "Darling Harbour live site", host_city: 'sydney', location: "Tumbalong Park, Darling Harbour, Sydney",
    match: { d: 'Fri 1 Oct', t: "Australia v Hong Kong China" }, tags: ['Watch party', 'Big screen', 'Sydney'],
    summary: "Watch Australia v Hong Kong China on the big screen at Tumbalong Park, a short walk from Town Hall. Free and outdoors, with room to spread out on the grass.", image: null, sample: true },
  { id: 'wp-hong-kong-china-foreshore-park', kind: 'watch', team: "Hong Kong China", name: "Foreshore Park rugby village", host_city: 'newcastle', location: "Foreshore Park, Newcastle",
    match: { d: 'Thu 14 Oct', t: "New Zealand v Hong Kong China" }, tags: ['Watch party', 'Harbour', 'Newcastle'],
    summary: "Watch New Zealand v Hong Kong China at the rugby village on Newcastle Harbour. Free, on the grass, with the foreshore walk either side.", image: 'village.jpg', stand_in: true, sample: true },
  { id: 'wp-scotland-the-rocks', kind: 'watch', team: "Scotland", name: "The Rocks fan site", host_city: 'sydney', location: "First Fleet Park, The Rocks, Sydney",
    match: { d: 'Sat 9 Oct', t: "Ireland v Scotland" }, tags: ['Watch party', 'Harbour', 'Sydney'],
    summary: "Watch Ireland v Scotland on a screen by the water at Circular Quay, with the Harbour Bridge behind it. Free, with food stalls on the night.", image: null, sample: true },
  { id: 'wp-scotland-wheeler-place', kind: 'watch', team: "Scotland", name: "Wheeler Place live site", host_city: 'newcastle', location: "Wheeler Place, Newcastle",
    match: { d: 'Sun 17 Oct', t: "Scotland v Portugal" }, tags: ['Watch party', 'Big screen', 'Newcastle'],
    summary: "Watch Scotland v Portugal on the screen in Wheeler Place, in the middle of the city by the Civic light rail stop. Free.", image: null, sample: true },
  { id: 'wp-south-africa-parramatta-square', kind: 'watch', team: "South Africa", name: "Parramatta Square live site", host_city: 'sydney', location: "Parramatta Square, Parramatta",
    match: { d: 'Sun 3 Oct', t: "South Africa v Italy" }, tags: ['Watch party', 'Big screen', 'Western Sydney'],
    summary: "Watch South Africa v Italy on the big screen in Parramatta Square, two minutes from the station. Free and under cover if it rains.", image: null, sample: true },
  { id: 'wp-south-africa-honeysuckle', kind: 'watch', team: "South Africa", name: "Honeysuckle fan site", host_city: 'newcastle', location: "Honeysuckle foreshore, Newcastle",
    match: { d: 'Fri 15 Oct', t: "South Africa v Romania" }, tags: ['Watch party', 'Waterfront', 'Newcastle'],
    summary: "Watch South Africa v Romania on the waterfront at Honeysuckle, a few minutes from Newcastle Interchange. Free, with places to eat along the promenade.", image: null, sample: true },
  { id: 'wp-tonga-darling-harbour', kind: 'watch', team: "Tonga", name: "Darling Harbour live site", host_city: 'sydney', location: "Tumbalong Park, Darling Harbour, Sydney",
    match: { d: 'Sun 3 Oct', t: "England v Tonga" }, tags: ['Watch party', 'Big screen', 'Sydney'],
    summary: "Watch England v Tonga on the big screen at Tumbalong Park, a short walk from Town Hall. Free and outdoors, with room to spread out on the grass.", image: null, sample: true },
  { id: 'wp-tonga-foreshore-park', kind: 'watch', team: "Tonga", name: "Foreshore Park rugby village", host_city: 'newcastle', location: "Foreshore Park, Newcastle",
    match: { d: 'Fri 8 Oct', t: "Wales v Tonga" }, tags: ['Watch party', 'Harbour', 'Newcastle'],
    summary: "Watch Wales v Tonga at the rugby village on Newcastle Harbour. Free, on the grass, with the foreshore walk either side.", image: 'village.jpg', stand_in: true, sample: true },
  { id: 'wp-usa-the-rocks', kind: 'watch', team: "USA", name: "The Rocks fan site", host_city: 'sydney', location: "First Fleet Park, The Rocks, Sydney",
    match: { d: 'Sat 2 Oct', t: "France v USA" }, tags: ['Watch party', 'Harbour', 'Sydney'],
    summary: "Watch France v USA on a screen by the water at Circular Quay, with the Harbour Bridge behind it. Free, with food stalls on the night.", image: null, sample: true },
  { id: 'wp-usa-wheeler-place', kind: 'watch', team: "USA", name: "Wheeler Place live site", host_city: 'newcastle', location: "Wheeler Place, Newcastle",
    match: { d: 'Thu 14 Oct', t: "Japan v USA" }, tags: ['Watch party', 'Big screen', 'Newcastle'],
    summary: "Watch Japan v USA on the screen in Wheeler Place, in the middle of the city by the Civic light rail stop. Free.", image: null, sample: true },
  { id: 'wp-zimbabwe-parramatta-square', kind: 'watch', team: "Zimbabwe", name: "Parramatta Square live site", host_city: 'sydney', location: "Parramatta Square, Parramatta",
    match: { d: 'Sun 3 Oct', t: "Wales v Zimbabwe" }, tags: ['Watch party', 'Big screen', 'Western Sydney'],
    summary: "Watch Wales v Zimbabwe on the big screen in Parramatta Square, two minutes from the station. Free and under cover if it rains.", image: null, sample: true },
  { id: 'wp-zimbabwe-honeysuckle', kind: 'watch', team: "Zimbabwe", name: "Honeysuckle fan site", host_city: 'newcastle', location: "Honeysuckle foreshore, Newcastle",
    match: { d: 'Sat 9 Oct', t: "England v Zimbabwe" }, tags: ['Watch party', 'Waterfront', 'Newcastle'],
    summary: "Watch England v Zimbabwe on the waterfront at Honeysuckle, a few minutes from Newcastle Interchange. Free, with places to eat along the promenade.", image: null, sample: true }
];
