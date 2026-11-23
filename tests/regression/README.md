# Prototype regression checks

Checks that a change to the prototype (`public/wireframes/prototype-pick-your-team.html`) has not broken another option,
theme or state. Two suites, run on every PR by `.github/workflows/regression.yml`:

- **Visual** (`visual.spec.js`): 100 screenshots compared pixel for pixel with the baselines in `__screenshots__/`.
  Options A, B and C, both themes (hifi, wireframe), 390 and 320 wide, in these states: Home, Plan tab with nothing
  picked, one team card picked, two cards picked, Option C's three later steps and Your answers, the open plan, a match
  sheet and the Settings menu. Page states are captured at their full height; sheets and menus at the screen's size.
  Files are named `<option>-<theme>-<width>-<state>.png`.
- **Behaviour** (`behaviour.spec.js`): pick, unpick, Clear all, Every NSW match, reload, Reset prototype and `?reset` in
  each option, and `?flow=a`, `?flow=c`, `?phone` and `?theme` doing their jobs.

Every test fails on a console error or an uncaught error.

## Running it

```bash
npm run test:regression
```

`npm run test:behaviour` runs the smoke tests alone; `npm run test:report` opens the last report. Run on a laptop, the
visual suite fails on fonts alone: baselines are only valid from the Playwright Docker image CI uses
(`mcr.microsoft.com/playwright:v1.63.0-noble`). To compare locally, run inside that image:

```bash
docker run --rm --ipc=host -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.63.0-noble sh -c "npm ci && npx playwright test"
```

## When a screenshot differs

The PR's comment and job summary list each state that changed. The run's `regression-report` artifact holds the
expected, actual and diff image for each one. Then either:

- **fix the change** and push, or
- **approve it**: add the `approve-baselines` label to the PR. CI remakes every screenshot in the same image, commits
  them to the branch, removes the label and runs the checks again. Two PRs that both change baselines conflict on the
  images; merge main into the later one and add the label again.

## Keeping it steady

The page's clock is fixed at 23 Nov 2026, 10am Sydney time (the countdown and the map's daily order), `Math.random` is
seeded, storage starts empty, the pointer is moved off the page, and each shot waits until fonts, CSS animations and
scripted motion (inline styles, scroll positions, the place and size of every landmark) have stopped. While a shot is
taken, `screenshot.css` paints `will-change` layers with the page, drops finished transitions and draws the map's photo
pins without smoothing (they look a little grainy in the screenshots). Without those, Chromium drew the same page with
a pixel or so of difference between runs. The browser flags in `playwright.config.js` (no compositor-thread animation,
one raster thread) do the same job.

Building the suite caught one real bug: the slogan's fit sometimes measured the planner's hero with the fallback font
and never refitted, so it stayed 30.41px instead of 31px. It now refits when a font loads or when the hero shows again
after a fit was skipped while it was hidden.

The tests find controls by the prototype's own ids, classes and accessible names (`#tp-reset`, `.tp-card2`,
`.tp-fc-next`, `data-flow-tab`). Renaming one breaks its test: update the test in the same PR.

Upgrading Playwright: change `@playwright/test` in `package.json` and both `image:` lines in the workflow together, then
approve the new baselines.
