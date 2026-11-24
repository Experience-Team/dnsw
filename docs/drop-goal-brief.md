# Drop goal: rebuild in the Third Half style

## Goal
Build a new version of the Drop goal game for the Plan your 3rd half prototype. Use the mechanic from the concept lab (card 10) and the visual style from the attached screenshot. Add it as the Play tab version in prototype-pick-your-team.html, and save places into the same saved state the planner uses (concepts-teams.js:89-152), so a saved place shows up in Your plan.

## References
- Mechanic: https://dnsw-discovery-gallery.vercel.app/concept-lab/cards/5c-dropgoal.html (read its code, don't copy its look)
- Style: the attached screenshot (left: result screen, right: kick screen). Save it into the repo as a reference.
- Existing Drop goal code: concepts-teams.js:2326-2399. Reuse what you can and tell me what you replaced.

## How it plays (from card 10)
1. Kick screen shows the kicker, the ball, the posts and "TAP TO KICK".
2. First tap (or click, or Space) drops the ball. Second tap kicks it as it comes up off the ground.
3. A timing bar shows the KICK zone and where the tap landed. In the style of the screenshot: a cream capsule with a yellow fill and the ball as the marker.
4. Goal: the ball goes through the posts, and a NSW place appears framed between them. Then the result screen opens.
5. Miss: say why in one short line (for example "Short, a touch late. Tap to go again.") and reset for another go. No penalty, no limit on goes.
6. "See the places" is always available, under the kick screen and on the result. It opens a list of every place, each with Save, so nobody has to win to see them.

## Result screen (from the screenshot, left)
- Split layout: pitch with "KICK AGAIN" on one side, place card on the other, with the coloured borders.
- Place card: photo, "The ball landed in ...", place name, Save button with the bookmark icon (not a heart), category tags (for example Food, Culture, Western Sydney), a short description, then FITS and TRAVEL rows.
- FITS: which match day it fits around, using the user's picked teams if they have any; otherwise a general line.
- TRAVEL: estimated time from the nearest host ground, marked as an estimate.
- Actions: Save, Kick again, See the places.

## Kick screen (from the screenshot, right)
- Isometric green pitch with pitch lines, cream posts with dark green pads, "The Third Half" logo top left.
- Kicker as SVG in several poses (ready, drop, kick, follow-through). Kit colours come from the user's picked team. Skin is a shade from the team palette, not a real skin colour. Default kit if no team is picked.
- Ball with stripes in the team colours.
- "TAP TO KICK" in large condensed uppercase.
- Nation table panel bottom right (sample scores), with "+3" when a goal adds to the user's nation and a "Share the table" button.

## Places
- Use precincts, regional areas and standalone attractions only, no individual businesses. DNSW can't favour one product over another.
- Rotate places so each one is shown about equally often. No repeats until every place has been shown once.
- Mix Sydney, Newcastle and regional NSW. Start with: Cabramatta, Newcastle Ocean Baths, a Blue Mountains lookout, Hunter Valley, plus four or five more I can edit later. Keep them in one data file.
- Mark sample or unconfirmed data in pink, like the rest of the prototype.
- The places shown after a goal are based on where the user's picked team plays. If their team plays in Newcastle, show places in and around Newcastle. If their team plays in Sydney, show places in and around Sydney.
- If the team plays in both cities, show places for both, with more weight on the city of their next match.
- If no team is picked, or they chose Every NSW match, mix places from both.
- Rotate evenly within that set: no repeats until every place in the set has been shown once.
- Tag each place in the data file with its nearest host city (Sydney or Newcastle) so it can be filtered.
- "See the places" shows the user's set first, then a link to see all.

## Accessibility
- Fully playable with Space or Enter. Screen reader label explains the two taps.
- Respect prefers-reduced-motion: no fly-through or photo transition, show the result straight away.
- Announce goal, miss and save with a live region.
- "See the places" must be reachable without playing.

## Out of scope
- Real nation scores (keep the table as sample data)
- Deals or prizes for scoring
- Power and angle controls

## At the end of the whole build
- Tell me which files changed and what you reused from the existing Drop goal.
- Update the flow chart so Play shows "saves into plan".
- Run the prototype-polish skill on the game screens.

This is a reference document. Build it in stages, only when asked, one section at a time.

Style reference: [drop-goal-style.png](drop-goal-style.png) (left: result screen, right: kick screen).
