# Version 1

Version 1 (was Option C until 25 Nov) is `../prototype-pick-your-team-v1-frame.html`, shown in the viewer as the first tab
(`../prototype-pick-your-team.html?version=1`). It runs on the shared scripts and styles (`../shared.css`, `../concepts-*.js`,
`../pv-device.js`), which Version 2 and a few other pages also load, so **nothing for Version 1 goes into a shared file**.
New behaviour is a file here, linked from Version 1's own page, that reads what the shared scripts draw and adds to it.
The same rule as `../v2/README.md`, the other way round.

| File | What it does |
| --- | --- |
| `v1-device.css` | Version 1's own page styles. |
| `v1-social.css`, `v1-social.js` | Sydney on social, Version 1's copy (Home, above the FAQs, and its viewer). |
| `v1-flow-motion.js`, `.css` | Moving through the questions (26 Nov 2026). Next, Skip and Show every NSW match **push**: a still of the step on show (the ghost, copied just before the flow redraws, with each part keeping the display it has) slides out the way the person is going while the real next step slides in, over the same distance and time (480ms, an even ease), inside the stage `#tp-pick`, which is the frame (clipped at its sides). Back is the mirror. Finishing the flow does not push. The cards **deal in** each time the hand arrives at step 1 (the Plan tab opened): they leave a pile at the foot of the hand and fan out (640ms, 17ms apart). It replaces the flow's own 32px slide and the shared one-off fade-in of the cards while it runs. Reduced motion: nothing moves. |
| `v1-flow-foot.js`, `.css` | Back in the pinned bar (26 Nov 2026). The flow draws Back at the top of each question; this copies it into the bar as the first button (a 36px square beside Skip and Next) after every redraw, and hides the one at the top. The copy keeps `data-fc-go="-1"`, so the flow's own handler and the push treat it as the original. |
| `v1-dates.css`, `v1-third-half.js`, `v1-flow-c.js` | Dates (26 Nov 2026): a read-only strip of the tournament in NSW that scrolls sideways (the later rounds as diamonds, named by stage) and one open range calendar, on the Your days step, in the Your days sheet and in Your answers. The slider and the typed First day and Last day fields are gone. `v1-third-half.js` and `v1-flow-c.js` are Version 1's copies of `../concepts-third-half.js` and `../concepts-flow-c.js`, copied so no shared script is edited: the page loads these now, and nothing loads the originals. `v1-dates.css` holds the strip, the calendar marks and the step's list of picked matches. |

Tests: `tests/regression/catchup-26-nov.behaviour.spec.js` (the push, Back in the bar, the deal and reduced motion) and the
existing `behaviour.spec.js`, which exercise the flow.
