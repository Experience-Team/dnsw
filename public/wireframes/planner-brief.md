# Plan your 3rd half: RWC trip planner brief

## Fidelity rules (apply to every screen)
- Low-fidelity wireframes only. A separate UI designer will do the visual design.
- Greyscale only. No brand colours, gradients, shadows, icons or illustrations.
- Plain system font, 2 or 3 sizes only.
- Images and maps are grey boxes with an X and a label (e.g. "Map: day 2 stops").
- Placeholder text in plain English. Use "Team A", "Venue name", "Place name". Never real business names.
- Numbered annotation markers next to sections, with short notes in a side column.
- Match the layout patterns and annotation style already used in this project.
- If in doubt, simpler.

## Context
- Client: Destination NSW (DNSW), sites sydney.com and visitnsw.com. Government agency, so no business can be favoured. No bookings on site, we link to partners.
- Host cities in NSW: Sydney and Newcastle.
- The planner is called "Plan your 3rd half". In rugby, the third half is the social part after the game. This name must be used.

## The problem
Fans plan around their team's matches. Once they reach our sites they get overwhelmed, and they ask practical questions: how far is it, what can I do between matches, is it open, will I have enough time and money. Many already use AI chatbots, so a generic "AI itinerary" will be ignored.

## The idea
The planner doesn't generate a whole trip. It places the fan's matches on a timeline, shows the free time around them as gaps, and shows options that fit each gap using real DNSW listings, opening hours on those dates, and travel times. The fan chooses what goes in.

## Principles
- Matches are fixed. Gaps around them are what the fan plans.
- Only real listings. Every option shows a one-line reason, e.g. "Open Saturday, free, 10 min from the stadium".
- No chat box, no "Generate with AI" button, no sparkle icons, no long paragraphs of generated text. Everything is a card, a time or a map.
- A map is always visible or one tap away.
- The fan can swap, remove or lock any item.
- No account needed. Research shows fans rarely use our save function and prefer notes apps, spreadsheets or pen and paper, so the plan must be easy to copy, download, print or share.

## Features
1. Set-up sentence: "I'm following [Team] to [matches], staying [X nights] in [city], travelling [who], into [interests], [car / no car]." Each part is a dropdown. The sentence stays at the top of the plan and can be edited there.
2. Plan view: day-by-day timeline. Match blocks are fixed. Gaps are labelled by length and location (e.g. "4 hrs before kick-off", "2 free days between Sydney and Newcastle"). Each gap shows 3 options.
3. Map: a trip map for the whole stay and a map for each day showing stops in order with travel times.
4. Surprise me: uses our existing randomiser component inside a gap to show something unexpected, often regional NSW.
5. Editing: swap, remove, lock; quick changes "Cheaper", "Closer", "Indoors"; rain plan for outdoor days.
6. Check my plan: fans add places they already have (from friends, notes or other tools) and the planner shows flags against their dates: "Closed Mondays", "Clashes with kick-off", "2 hrs from your hotel", "Also on nearby: fan zone screening".
7. Take it with you: copy as text, download spreadsheet (CSV), print or PDF with tick boxes, copy a single card, add to calendar, open in Google Maps, share link.
8. States: loading, not enough options, details to be confirmed, "How we choose options" note.

## Screens (built in this order)
1. Entry points and set-up
2. Plan view and maps
3. Editing and Surprise me
4. Check my plan
5. Take it with you
6. States and annotation review
