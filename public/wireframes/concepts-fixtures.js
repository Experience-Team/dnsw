/* Placeholder fixtures for the Concepts timeline: the 44 matches in the RWC page's fixture list
   (pages/rugby-world-cup.html, #rwc-fixtures), trimmed. d date, t teams (null for knockout matches not yet drawn),
   s stage, v venue, p precinct, k kick-off (Sydney time), a city when the match is outside NSW.
   ticket: the fan has a ticket (prototype: New Zealand v Australia, Sat 9 Oct). Prototype data only. */
window.cnFixtures = [
  {"d": "Sun 3 Oct", "t": "Japan v Samoa", "s": "Pool E", "v": "Newcastle Stadium", "p": "Broadmeadow", "k": "12:15pm"},
  {"d": "Mon 4 Oct", "t": "Fiji v Spain", "s": "Pool C", "v": "Newcastle Stadium", "p": "Broadmeadow", "k": "2:15pm"},
  {"d": "Mon 4 Oct", "t": "Ireland v Portugal", "s": "Pool D", "v": "Sydney Football Stadium", "p": "Moore Park", "k": "5:15pm"},
  {"d": "Sat 9 Oct", "t": "New Zealand v Australia", "s": "Pool A", "v": "Stadium Australia", "p": "Sydney Olympic Park", "k": "5:10pm", "ticket": true},
  {"d": "Mon 11 Oct", "t": "Uruguay v Portugal", "s": "Pool D", "v": "Newcastle Stadium", "p": "Broadmeadow", "k": "5:15pm"},
  {"d": "Mon 11 Oct", "t": "Italy v Romania", "s": "Pool B", "v": "Sydney Football Stadium", "p": "Moore Park", "k": "7:45pm"},
  {"d": "Sat 16 Oct", "t": "England v Wales", "s": "Pool F", "v": "Stadium Australia", "p": "Sydney Olympic Park", "k": "7:45pm"},
  {"d": "Sun 17 Oct", "t": "Italy v Georgia", "s": "Pool B", "v": "Newcastle Stadium", "p": "Broadmeadow", "k": "12:15pm"},
  {"d": "Sun 17 Oct", "t": "France v Samoa", "s": "Pool E", "v": "Sydney Football Stadium", "p": "Moore Park", "k": "7:45pm"},
  {"d": "Sat 23 Oct", "t": "2nd Pool C v 2nd Pool F", "s": "Round of 16 (1)", "v": "Sydney Football Stadium", "p": "Moore Park", "k": "2:15pm"},
  {"d": "Sun 24 Oct", "t": null, "s": "Round of 16 (2)", "v": "Sydney Football Stadium", "p": "Moore Park", "k": "4:45pm"},
  {"d": "Sat 30 Oct", "t": null, "s": "Quarter-final 1", "v": "Stadium Australia", "p": "Sydney Olympic Park", "k": "4:45pm"},
  {"d": "Sun 31 Oct", "t": null, "s": "Quarter-final 2", "v": "Stadium Australia", "p": "Sydney Olympic Park"},
  {"d": "Fri 5 Nov", "t": null, "s": "Semi-final 1", "v": "Stadium Australia", "p": "Sydney Olympic Park", "k": "9:00am"},
  {"d": "Sat 6 Nov", "t": null, "s": "Semi-final 2", "v": "Stadium Australia", "p": "Sydney Olympic Park"},
  {"d": "Fri 12 Nov", "t": null, "s": "Bronze Final", "v": "Stadium Australia", "p": "Sydney Olympic Park", "k": "8:45am"},
  {"d": "Sat 13 Nov", "t": null, "s": "Final", "v": "Stadium Australia", "p": "Sydney Olympic Park", "k": "8:00pm"},
  {"d": "Fri 1 Oct", "t": "Australia v Hong Kong China", "s": "Pool A", "v": "Perth Stadium", "p": "Perth", "k": "9:00pm", "a": "Perth"},
  {"d": "Sat 2 Oct", "t": "Scotland v Uruguay", "s": "Pool D", "v": "Townsville Stadium", "p": "Townsville", "k": "3:00pm", "a": "Townsville"},
  {"d": "Sat 2 Oct", "t": "Argentina v Canada", "s": "Pool C", "v": "Adelaide Oval", "p": "Adelaide", "k": "4:30pm", "a": "Adelaide"},
  {"d": "Sat 2 Oct", "t": "New Zealand v Chile", "s": "Pool A", "v": "Brisbane Stadium", "p": "Brisbane", "k": "6:30pm", "a": "Brisbane"},
  {"d": "Sat 2 Oct", "t": "France v USA", "s": "Pool E", "v": "Melbourne Stadium", "p": "Melbourne", "k": "7:45pm", "a": "Melbourne"},
  {"d": "Sun 3 Oct", "t": "Wales v Zimbabwe", "s": "Pool F", "v": "Brisbane Stadium", "p": "Brisbane", "k": "3:00pm", "a": "Brisbane"},
  {"d": "Sun 3 Oct", "t": "South Africa v Italy", "s": "Pool B", "v": "Melbourne Stadium", "p": "Melbourne", "k": "7:45pm", "a": "Melbourne"},
  {"d": "Sun 3 Oct", "t": "England v Tonga", "s": "Pool F", "v": "Perth Stadium", "p": "Perth", "k": "9:00pm", "a": "Perth"},
  {"d": "Tue 5 Oct", "t": "Georgia v Romania", "s": "Pool B", "v": "Adelaide Oval", "p": "Adelaide", "k": "7:30pm", "a": "Adelaide"},
  {"d": "Thu 7 Oct", "t": "Chile v Hong Kong China", "s": "Pool A", "v": "Townsville Stadium", "p": "Townsville", "k": "5:15pm", "a": "Townsville"},
  {"d": "Fri 8 Oct", "t": "Spain v Canada", "s": "Pool C", "v": "Adelaide Oval", "p": "Adelaide", "k": "7:30pm", "a": "Adelaide"},
  {"d": "Fri 8 Oct", "t": "Wales v Tonga", "s": "Pool F", "v": "Melbourne Stadium", "p": "Melbourne", "k": "7:45pm", "a": "Melbourne"},
  {"d": "Sat 9 Oct", "t": "England v Zimbabwe", "s": "Pool F", "v": "Adelaide Oval", "p": "Adelaide", "k": "7:30pm", "a": "Adelaide"},
  {"d": "Sat 9 Oct", "t": "Ireland v Scotland", "s": "Pool D", "v": "Melbourne Stadium", "p": "Melbourne", "k": "8:00pm", "a": "Melbourne"},
  {"d": "Sat 9 Oct", "t": "France v Japan", "s": "Pool E", "v": "Brisbane Stadium", "p": "Brisbane", "k": "8:00pm", "a": "Brisbane"},
  {"d": "Sat 9 Oct", "t": "South Africa v Georgia", "s": "Pool B", "v": "Perth Stadium", "p": "Perth", "k": "9:30pm", "a": "Perth"},
  {"d": "Sun 10 Oct", "t": "USA v Samoa", "s": "Pool E", "v": "Adelaide Oval", "p": "Adelaide", "k": "4:30pm", "a": "Adelaide"},
  {"d": "Sun 10 Oct", "t": "Argentina v Fiji", "s": "Pool C", "v": "Melbourne Stadium", "p": "Melbourne", "k": "7:45pm", "a": "Melbourne"},
  {"d": "Wed 13 Oct", "t": "Tonga v Zimbabwe", "s": "Pool F", "v": "Adelaide Oval", "p": "Adelaide", "k": "7:30pm", "a": "Adelaide"},
  {"d": "Thu 14 Oct", "t": "Fiji v Canada", "s": "Pool C", "v": "Brisbane Stadium", "p": "Brisbane", "k": "7:00pm", "a": "Brisbane"},
  {"d": "Thu 14 Oct", "t": "Japan v USA", "s": "Pool E", "v": "Townsville Stadium", "p": "Townsville", "k": "7:00pm", "a": "Townsville"},
  {"d": "Thu 14 Oct", "t": "New Zealand v Hong Kong China", "s": "Pool A", "v": "Melbourne Stadium", "p": "Melbourne", "k": "7:45pm", "a": "Melbourne"},
  {"d": "Fri 15 Oct", "t": "South Africa v Romania", "s": "Pool B", "v": "Brisbane Stadium", "p": "Brisbane", "k": "8:00pm", "a": "Brisbane"},
  {"d": "Fri 15 Oct", "t": "Ireland v Uruguay", "s": "Pool D", "v": "Perth Stadium", "p": "Perth", "k": "9:30pm", "a": "Perth"},
  {"d": "Sat 16 Oct", "t": "Australia v Chile", "s": "Pool A", "v": "Brisbane Stadium", "p": "Brisbane", "k": "8:00pm", "a": "Brisbane"},
  {"d": "Sat 16 Oct", "t": "Argentina v Spain", "s": "Pool C", "v": "Perth Stadium", "p": "Perth", "k": "9:30pm", "a": "Perth"},
  {"d": "Sun 17 Oct", "t": "Scotland v Portugal", "s": "Pool D", "v": "Adelaide Oval", "p": "Adelaide", "k": "3:30pm", "a": "Adelaide"}
];

/* GAP DATA: placeholders only, not real. Fan zones and the Rugby World Cup village are not in the live data or in
   docs/product-data-contract.md, so per CLAUDE.md they render from fixtures only, with the pink gap marker. Each spot
   lists the interstate matches it shows (key: date|teams, as in cnFixtures). A match not listed here has no "watch in
   NSW" line: that is the empty state. Names and places are deliberately fake. Real data is still needed. */
window.cnWatchSpots = [
  { name: 'Sample fan zone (placeholder)', place: 'Placeholder site, Sydney', shows: ['Fri 1 Oct|Australia v Hong Kong China', 'Sat 2 Oct|New Zealand v Chile', 'Sat 2 Oct|Argentina v Canada', 'Sun 3 Oct|England v Tonga', 'Sat 9 Oct|Ireland v Scotland', 'Sat 16 Oct|Australia v Chile'] },
  { name: 'Sample rugby village (placeholder)', place: 'Placeholder site, Newcastle', shows: ['Fri 1 Oct|Australia v Hong Kong China', 'Sat 16 Oct|Australia v Chile', 'Sat 9 Oct|France v Japan'] }
];
