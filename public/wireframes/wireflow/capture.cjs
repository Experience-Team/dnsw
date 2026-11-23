// Captures the screens for the wire flow (wireflow/index.html) from the prototype, with real taps.
//
// Happy path for someone with no plan yet, Option A, high fidelity, 390 x 844:
//   1 Home, nothing picked > 2 a team picked > 3 Plan around your matches lands on Your days >
//   4 days set on the slider > 5 one idea added from Around your matches > 6 the plan opened from the plan bar.
//
// Run from the repository root (Playwright and Chromium must be installed):
//   node public/wireframes/wireflow/capture.cjs
// It serves public/wireframes itself, starts with fresh storage, and writes 1-home.jpg to 6-plan.jpg beside this file.
// Nothing is set by editing saved state: every step is a tap or a drag, as a person would make it.
// If the prototype changes, run it again; check the titles and arrow labels in index.html still match.

const http = require("http");
const fs = require("fs");
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) {
  console.error("Playwright is needed: npm i -D playwright, or run with NODE_PATH pointing at a global install.");
  process.exit(1);
}

const ROOT = path.resolve(__dirname, "..");
const OUT = __dirname;
const TEAM = "Australia";          // a team with matches in NSW, so Around your matches has ideas
const DAYS = { from: 3, to: 12 };  // days of October to drag the slider to (day 0 = 1 Oct)
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {});
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); // fresh storage
  const page = await context.newPage();
  page.on("pageerror", (e) => console.warn("page error:", String(e).slice(0, 160)));
  const shot = async (name) => { await page.mouse.move(1, 1); await page.waitForTimeout(900); await page.screenshot({ path: path.join(OUT, name), type: "jpeg", quality: 82 }); console.log("saved", name); };
  // scroll the prototype's own scroller so an element sits a set distance from the top
  const scrollTo = (sel, top) => page.evaluate(([s, t]) => {
    const el = document.querySelector(s); const sc = document.querySelector(".cn-body");
    sc.scrollTop += el.getBoundingClientRect().top - t;
  }, [sel, top]);

  // 1. Home, nothing picked
  await page.goto(`${base}/prototype-pick-your-team.html?phone&theme=hifi&view=home`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot("1-home.jpg");

  // 2. Scroll to Plan your 3rd half and tap a team card; Plan around your matches appears
  await scrollTo("#tp-home-plan", 90);
  await page.waitForTimeout(900); // the hand deals as it comes into view
  const card = page.locator(`#tp-home-hand .tp-card2[aria-label^="${TEAM}"]`);
  await card.click();
  await page.waitForTimeout(1600);
  await scrollTo("#tp-home-hand", 40); // the hand, with the picked card, and the button under it
  await shot("2-picked.jpg");

  // 3. Tap Plan around your matches; it lands on Your days when that is showing, else on the team picker
  // the same test the button makes (concepts-home.js): Your days is showing when #tp-ask is not hidden
  const daysShowing = await page.evaluate(() => { const a = document.getElementById("tp-ask"); return !!a && !a.hidden; });
  console.log("Your days showing when the button is tapped:", daysShowing);
  await page.locator("#tp-home-go").click();
  await page.waitForTimeout(1600);
  await shot("3-your-days.jpg");

  // 4. Drag the slider's handles to the days
  const track = page.locator("#tp-ask .tp-range-track").first();
  const box = await track.boundingBox();
  const at = (day) => box.x + ((day + 2) / 47) * box.width; // the track runs from day -2 (29 Sep) to 45 (15 Nov)
  const drag = async (which, day) => {
    const h = page.locator(`#tp-ask [data-h="${which}"]`).first();
    const hb = await h.boundingBox();
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await page.mouse.down();
    await page.mouse.move(at(day), hb.y + hb.height / 2, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(700);
  };
  await drag("to", DAYS.to);
  await drag("from", DAYS.from);
  await page.waitForTimeout(800);
  console.log("days now:", await page.evaluate(() => { const b = document.querySelector("#tp-ask [aria-expanded], #tp-ask .tp-ask-type"); return b ? b.textContent.trim() : "(not found)"; }));
  await scrollTo("#tp-ask", 60);
  await shot("4-days-set.jpg");

  // 5. Add one idea from Around your matches
  const add = page.locator("#tp-third .tp-add[aria-pressed='false']").first();
  await add.scrollIntoViewIfNeeded();
  await scrollTo("#tp-third .tp-add[aria-pressed='false']", 420);
  await page.waitForTimeout(500);
  await add.click();
  await page.waitForTimeout(600);
  await shot("5-idea-added.jpg");

  // 6. Open the plan from the plan bar, once the Added toast has gone (it stays 6 seconds)
  await page.waitForTimeout(6500);
  await page.locator("#tp-tl-toggle").click();
  await page.waitForTimeout(1400);
  await shot("6-plan.jpg");

  await browser.close();
  server.close();
})().catch((e) => { console.error(e); process.exit(1); });
