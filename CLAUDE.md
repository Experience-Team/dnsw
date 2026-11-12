# Standing rules

- `docs/product-data-contract.md` is the source of truth for all product page fields. Do not invent fields. If a field is needed that is not in the contract, stop and ask.
- Fields marked `gap` in the contract do not exist in live data. They render from fixtures only, and every module must define its empty state explicitly.
- Fields marked `unverified` must not be built against until confirmed.
- `public/wireframes/` and `src/` are separate deliverables. `src/` is the CJM and research tool. Do not add product page code to `src/`.
- When a brief ends with stop-and-show, do not commit, open a PR, or merge until the person has answered any questions raised. A stop means stop.

# Prototype interaction checks

Lessons from things the user had to point out. Check every prototype change against all of them before committing.
When the user says "you missed X" (or corrects something they expected you to catch), add the lesson to this list
in the same change as the fix, in general terms so it applies beyond the one case.

1. **Movement can be followed.** Anything that moves because of a tap or click glides so the eye can track it from
   start to end (for example a picked card travelling to the middle of a fan). Check motion frame by frame, not only
   where it ends up; a front-loaded curve such as expo-out that covers most of the distance in the first few frames
   reads as a jump.
2. **Choices behave like what they mean.** An "all", "any" or "none" option replaces specific picks, and picking a
   specific item replaces it, so the two never mix.
3. **Every multi-select can be cleared.** If people can pick several things, give them one action to clear them all
   and start again, shown only when something is picked.
4. **Walk every combination before handing over.** Pick, unpick, mix, clear, change your mind, reload, keyboard only
   and reduced motion. Fix the gaps you find rather than leaving them for the user to spot.
5. **The movement that matters is obvious, not just present.** A change the user should notice must be clear at real
   size and speed. When a whole group moves together (a fan turning, a list shifting), the item the user acted on
   gets lost, so single it out: lift it, scale it, bring it above its neighbours, then settle it. Judge it from a
   strip of frames at real size, not from numbers that only prove it moved.
