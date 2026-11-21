# Working on this project

Read `README.md` first. It explains the rig, physics, zone sizing and the open items.

## Context
- Prototype for Destination NSW (sydney.com and visitnsw.com), Rugby World Cup "Plan your 3rd half" campaign.
- DNSW is a government agency and must not give preferential treatment to any destination. Every stop should get roughly equal exposure.

## Rules
- Write all copy and comments in UK English. Do not use em dashes.
- **Skin colour:** only a blue or green from the team's own palette. Never red, yellow, orange, white, brown or black, and never realistic skin tones. Do not relax this rule.
- **Equal exposure:** after any change to physics, wind, power, routes, terrain or `PLAYER_MODEL`, run `checkDistribution()` in the browser console. Every stop should stay within about 8–12%.
- **Placeholder data:** all destinations, distances, summaries and images are placeholders. Do not present them as verified.
- **No real logos, crests or sponsor marks** on the player kits.
- Keep the player a single rigged SVG: new poses are joint angles in `P` (`js/rig.js`), not new drawings.
- No build step. Keep it runnable by opening `index.html`. Scripts are classic and share globals, so keep the load order in `index.html` intact.

## Checking work
- Open `index.html` and play a kick on each route: Sydney West (mountains), a Local route (skyline), and a Newcastle route.
- Check the destination card on a narrow viewport (about 390px wide), where it becomes a bottom sheet with a sticky action bar.
