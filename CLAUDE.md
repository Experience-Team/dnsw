# Standing rules

- `docs/product-data-contract.md` is the source of truth for all product page fields. Do not invent fields. If a field is needed that is not in the contract, stop and ask.
- Fields marked `gap` in the contract do not exist in live data. They render from fixtures only, and every module must define its empty state explicitly.
- Fields marked `unverified` must not be built against until confirmed.
- `public/wireframes/` and `src/` are separate deliverables. `src/` is the CJM and research tool. Do not add product page code to `src/`.
- When a brief ends with stop-and-show, do not commit, open a PR, or merge until the person has answered any questions raised. A stop means stop.

# Previews

- Share preview links only from the Vercel project the user can open (`mopo123-gmailcoms-projects`), in chat and in PR
  descriptions, and point to the page that changed. Another Vercel project also deploys this repo, and its previews are
  behind sign-in for that account, so its links ask for access.
- When a change alters what an existing address does (a flag added, a default changed, a theme moved behind `?tools`),
  say which links already shared now behave differently, and give the new form. For example, links ending
  `?theme=hifi` on the plain prototype address opened in low fidelity after the two addresses were split; high
  fidelity now needs `?tools&theme=hifi`.

# Adding standing flags

When the user gives a new standing flag, a correction, or a "you missed X" as a specific example:

1. **Don't add it verbatim.** Work out the underlying principle the example is an instance of, and word it so it
   applies beyond the one case. Keep the user's example as a short "for example" if it helps.
2. **Fit it into the existing structure.** If an existing category or numbered check already covers the principle,
   extend or sharpen that entry rather than adding a near-duplicate. If none fits, propose a new category.
3. **Show before saving.** Present the proposed wording and where it will go (which section, new or amended entry)
   and wait for the user's approval before editing this file. Fixing the issue itself does not need to wait.

# Prototype interaction checks

Lessons from things the user had to point out. Check every prototype change against all of them before committing.
When the user says "you missed X" (or corrects something they expected you to catch), propose a lesson for this
list as set out in "Adding standing flags" above, and add it once the user has approved the wording.

1. **Movement can be followed.** Anything that moves because of a tap or click glides so the eye can track it from
   start to end (for example a picked card travelling to the middle of a fan). Check motion frame by frame, not only
   where it ends up; a front-loaded curve such as expo-out that covers most of the distance in the first few frames
   reads as a jump.
2. **Choices behave like what they mean.** An "all", "any" or "none" option replaces specific picks, and picking a
   specific item replaces it, so the two never mix.
3. **Every multi-select can be cleared.** If people can pick several things, give them one action to clear them all
   and start again, shown only when something is picked.
4. **Walk every combination before handing over.** Pick, unpick, mix, clear, change your mind, reload, keyboard only
   and reduced motion. Use every control from every place it appears and in every starting state: inside sheets and
   stacked sheets as well as on the page, and before a team is picked as well as after. Press it twice to check it can
   be undone. Use each control again after it has been used, and treat a tap differently from keyboard focus: a
   tapped button keeps focus, and focus rules meant for the keyboard must not catch it (for example, tap the floating
   tab bar, then scroll; it must still shrink). Make several changes in a row and check that every status or summary
   line describes the latest one, not the one before. Fix the gaps you find rather than leaving them for the user to
   spot.
5. **The movement that matters is obvious, not just present.** A change the user should notice must be clear at real
   size and speed. When a whole group moves together (a fan turning, a list shifting), the item the user acted on
   gets lost, so single it out: lift it, scale it, bring it above its neighbours, then settle it. Judge it from a
   strip of frames at real size, not from numbers that only prove it moved.
6. **Content fits its window, with even breathing room.** Nothing the user is meant to see is cut off by its
   container at rest (a card corner, a shadow, a lifted item), and the space above and below it is even. Size the
   container from the content's real extremes in every state it can be in (dragged to either end, picked, lifted,
   focused), not from a guess, and measure the rendered result. Clip only the sides that are meant to run on (a fan
   or carousel running off the edge); let a brief lift or pull rise out of the box rather than reserving space for it.
   Text meant to sit on one line (a tab label, a slogan line, a button) holds on one line in every theme and font,
   from 320 to 390px wide, not only in the theme being worked in; the wireframe's system font is wider than the high
   fidelity one, and a page-wide rule can let text wrap.
7. **Patterns go everywhere they apply.** When a visual or behavioural cue is attached to a kind of control (an icon,
   a confirm step, a focus rule), find every control of that kind and apply it to all of them, not just the one in the
   brief. List them before handing over. For example, the calendar icon belongs on every button that sets or changes
   dates, not only the prompts, and the card-fan icon on every Pick your teams prompt, the hero button included.
   dates, not only the prompts; and every close cross sits in the same corner (top right, 16px from the edge) on every
   sheet, stacked sheet and full-screen layer.
8. **The page only moves when people expect it to.** A control never scrolls or jumps the page to another section
   unless its label says it will take you there (for example "See where to watch in NSW", "Skip the map"). Anything
   that asks for input or shows more detail opens where the person is, in a sheet or an expanding panel, and closing it
   returns focus to what opened it. When an action changes content above the person, hold the page so what they were
   looking at stays put. For example, "Staying longer? Set your days" used to scroll down to the date fields; it now
   opens the calendar in a sheet.
9. **Check the build against the whole brief before handing over.** Go through the brief line by line and say what is
   done, what is deliberately not done yet and why (a stop-and-show step, an open question, a conflict with these
   rules), and what is next. When a brief is built in steps, say at each stop which steps remain. For example,
   stopping after steps 1 and 2 of a five-step brief without saying so left the user to find "a lot is missing".

# Build notes

Implementation lessons that testing caught; they are about the code, not the experience.

- Code that measures layout (fitting text to a width, sizing a panel) skips anything hidden, where widths read as
  zero, and re-runs only when the measured width actually changes, never on its own height changes. For example, the
  slogan fit measured the planner while another tab was showing and shifted it 6px on every return.
9. **Look, don't only measure.** Check every change by eye from screenshots in both themes (low and high fidelity) at
   390 and 320 wide, in each state the change touches. Use `?phone&tools&theme=wireframe` or `&theme=hifi`: without
   `?phone` the phone frame stays 358 wide at any window size, and without `?tools` the theme switch is ignored.
   Measurements back up the look but don't replace it. Optical alignment (centring, padding, indents, even gaps) is
   judged from the rendered pixels, because fonts and their metrics differ between themes and devices. For example,
   the Add buttons measured as centred but read low in one font, and the card text measured fine but sat 4px in from
   its title.

# Experience principles

Apply these to every flow in wireframes and prototypes, and flag any brief or design that breaks them,
even when not asked.

1. **Reward early, then build on it.** Give people something useful as soon as possible and let each
   extra input improve it, rather than holding results back until a form is finished. Reveal options
   and detail as they become relevant, not all up front. For example:
   - A trip planner shows suggestions from the first choice (a region, a date or an interest) and
     refines them as more is added, instead of opening with a long questionnaire.
   - Search and listing pages show results straight away and offer filters alongside them, rather than
     asking for filters before showing anything.
   - Product and event pages lead with what helps someone decide (when, where, price, why go) and keep
     the fine print behind an expand or further down.
2. **Don't make people do the work.** Ask only for what the next step needs. Prefer sensible defaults,
   inferring from what they have already done, and asking later over asking now. Make an input optional
   whenever the result still works without it. Before adding a required field or step, check whether it
   can be defaulted, inferred or deferred. For example:
   - Saving or shortlisting works without an account; ask people to sign in only when they want to keep
     or share the list.
   - Carry choices forward: a region or date picked on one page is already set on the next, not asked
     for again.
   - Newsletter or enquiry forms ask for the minimum (often just an email) and gather preferences later,
     once there is a reason to.
3. **Accessibility target: WCAG 2.2 AA, not AAA.** Size controls to AA: at least 24px to tap (2.5.8), with
   36px as the usual button height, rather than the 44px AAA size. Don't pad tap areas out to 44px. For example,
   buttons in the Pick your team prototype were moved from 44px to 36px.
4. **White space groups what belongs together.** Use one spacing rhythm on the 4px scale, so distance shows how things
   relate: tight inside a component (4 to 16px), 24px between parts of one family, 48px between families and before
   each section's rule, and the largest break after the hero. Pairs that belong together sit closer than their
   neighbours (a slogan and its event line). Prefer space to boxes and dividers for grouping. For example, the hand of
   cards, the map and the match cards read as one block until 48px separated them.
