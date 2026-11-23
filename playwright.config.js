// Regression checks for the prototype (public/wireframes/prototype-pick-your-team.html).
//   npm run test:regression   both suites
//   npm run test:visual       screenshots only
//   npm run test:behaviour    smoke tests only
// Baselines are made only in the Playwright Docker image (see tests/regression/README.md), because the wireframe
// theme uses the system font and fonts render differently on each machine.
import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PORT) || 4173;

export default defineConfig({
  testDir: 'tests/regression',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]]
    : [['list'], ['html', { open: 'never' }]],
  expect: {
    // Any pixel difference fails: no colour tolerance, no allowance of changed pixels
    toHaveScreenshot: { threshold: 0, maxDiffPixels: 0, animations: 'disabled', caret: 'hide', scale: 'css', timeout: 15_000,
      stylePath: 'tests/regression/screenshot.css' },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: 'chromium',
    deviceScaleFactor: 1,
    hasTouch: false,
    locale: 'en-AU',
    timezoneId: 'Australia/Sydney',
    colorScheme: 'light',
    trace: 'off',
    // Render the same pixels on every run: no compositor-thread animation or scrolling, and images decoded before
    // they are drawn rather than filled in later
    launchOptions: {
      args: ['--disable-threaded-animation', '--disable-threaded-scrolling', '--disable-checker-imaging',
        '--disable-partial-raster', '--disable-gpu', '--font-render-hinting=none', '--num-raster-threads=1'],
    },
  },
  projects: [
    { name: 'visual', testMatch: /visual\.spec\.js/ },
    { name: 'behaviour', testMatch: /behaviour\.spec\.js/ },
  ],
  webServer: {
    command: `node tests/regression/serve.mjs`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/wireframes/prototype-pick-your-team.html`,
    reuseExistingServer: !process.env.CI,
  },
});
