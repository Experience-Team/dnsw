# Map image for Your days, in order

`nsw-relief.webp` (2800 x 3602) is the DNSW discovery gallery's map illustration
(https://dnsw-discovery-gallery.vercel.app/#map), reused as agreed on 15 November 2026, rendered once from straight
above so the page needs no 3D on the phone.

- **Source:** the gallery's own scene code (`map.js`): its relief (`relief.png`), its coast (Natural Earth 1:10m via
  world-atlas, public domain), its rivers, trees, vineyard rows and its plain venue symbol, drawn at all three NSW
  stadiums. Its raised miniatures (the harbour, the winery) are left out: at true scale they would hide the suburbs.
- **Projection:** linear in longitude and latitude, north up. Bounds: longitude 150.2 to 152.25, latitude -34.75 to
  -32.55. A point's pixel is `x = (lng - 150.2) / 2.05 * 2800`, `y = (-32.55 - lat) / 2.2 * 3602`.
- **To render again:** `bake.html` is the render page. Put it next to the gallery's `vendor/three.min.js` (as
  `three.min.js`), `assets/relief.png` and `assets/geography.json`, open it with `?w=2800`, and save the canvas.
