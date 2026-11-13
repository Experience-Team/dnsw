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

/* GAP DATA: placeholders only, not real. Pub screenings, fan zones and the Rugby World Cup village are not in the
   live data. Per CLAUDE.md they render from fixtures only, with the pink gap marker. Each spot has a name, a type
   (pub, fan_zone or village), a place and the matches it shows (key: date|teams, as in cnFixtures). A match no spot
   lists has no "where to watch" line: that is the empty state. Names and places are deliberately fake, and no pub is
   a real business. NOT IN THE PRODUCT DATA CONTRACT: the spot type and the screening link (which spot shows which
   match) have no contract field; fixture-only for now, as agreed on 13 November 2026. The village has open_from and
   open_to (also fixture-only), assumed open every day between them. Real data is still needed. */
window.cnWatchSpots = [
  { name: 'Sample fan zone (placeholder)', type: 'fan_zone', place: 'Placeholder site, Sydney', shows: ['Fri 1 Oct|Australia v Hong Kong China', 'Sat 2 Oct|New Zealand v Chile', 'Sat 2 Oct|Argentina v Canada', 'Sun 3 Oct|England v Tonga', 'Sat 9 Oct|Ireland v Scotland', 'Sat 16 Oct|Australia v Chile'] },
  { name: 'Sample rugby village (placeholder)', type: 'village', place: 'Placeholder site, Newcastle', open_from: '2027-10-01', open_to: '2027-11-13', shows: ['Fri 1 Oct|Australia v Hong Kong China', 'Sat 16 Oct|Australia v Chile', 'Sat 9 Oct|France v Japan'] },
  { name: 'Sample pub A (placeholder)', type: 'pub', place: 'Placeholder suburb, Sydney', shows: ['Fri 1 Oct|Australia v Hong Kong China', 'Sat 2 Oct|Scotland v Uruguay', 'Sat 9 Oct|New Zealand v Australia', 'Sat 9 Oct|England v Zimbabwe', 'Sat 16 Oct|England v Wales', 'Sat 16 Oct|Australia v Chile'] },
  { name: 'Sample pub B (placeholder)', type: 'pub', place: 'Placeholder suburb, Sydney', shows: ['Sun 3 Oct|Wales v Zimbabwe', 'Fri 8 Oct|Wales v Tonga', 'Sat 9 Oct|Ireland v Scotland', 'Mon 4 Oct|Ireland v Portugal', 'Sat 30 Oct|Quarter-final 1', 'Sat 13 Nov|Final'] },
  { name: 'Sample pub C (placeholder)', type: 'pub', place: 'Placeholder suburb, Newcastle', shows: ['Sun 3 Oct|Japan v Samoa', 'Sat 9 Oct|France v Japan', 'Sun 17 Oct|France v Samoa', 'Thu 14 Oct|Fiji v Canada', 'Sun 10 Oct|Argentina v Fiji'] }
];

/* GAP DATA: placeholder products for "Suits your 3rd half". Shaped like the product data contract's shared record
   (§1: id, type, title, address.suburb, links) plus availability (§4, gap), pricing (§5, gap) and distance_to_venue
   (§7, gap, derived). venue_ref names the stadium, as cnFixtures does (v). Every title is fake; links go nowhere and
   nothing is booked (links.booking is null on every record). distance_to_venue also carries walking_minutes and
   transit_minutes: NOT IN THE CONTRACT (it has km only, and notes that a walking or transit time can replace it later),
   fixture-only, preferred over km on the cards as agreed on 13 November 2026. Real listings, opening hours on the
   dates, distances and travel times are still needed. */
(function () {
  function week(opens, closes, days) { return (days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']).map(function (d) { return { day: d, opens: opens, closes: closes }; }); }
  function rec(id, type, title, suburb, hours, pricing, venue, km, transit) {
    return { id: id, type: type, title: title, address: { suburb: suburb, state: 'NSW' }, links: { website: '#', booking: null },
      availability: { kind: 'opening_hours', opening_hours: hours }, pricing: pricing,
      // Walking at about 5 km/h; transit only where it is too far to walk (placeholder figures)
      distance_to_venue: { venue_ref: venue, km: km, label: 'the stadium', walking_minutes: Math.max(1, Math.round(km * 12)), transit_minutes: transit || null } };
  }
  var free = { is_free: true, band: '' }, b1 = { is_free: false, band: '$' }, b2 = { is_free: false, band: '$$' };
  window.cnThirdHalf = [
    rec('ph-sa-cafe', 'food_and_drink', 'Sample café (placeholder)', 'Sydney Olympic Park', week('07:00', '15:00'), b1, 'Stadium Australia', 0.4),
    rec('ph-sa-park', 'attraction', 'Sample parklands walk (placeholder)', 'Sydney Olympic Park', week('06:00', '20:00'), free, 'Stadium Australia', 0.9),
    rec('ph-sa-bar', 'food_and_drink', 'Sample bar and grill (placeholder)', 'Sydney Olympic Park', week('16:00', '23:59', ['thu', 'fri', 'sat', 'sun']), b2, 'Stadium Australia', 0.7),
    rec('ph-sfs-cafe', 'food_and_drink', 'Sample bakery (placeholder)', 'Moore Park', week('06:30', '14:00'), b1, 'Sydney Football Stadium', 0.6),
    rec('ph-sfs-gallery', 'attraction', 'Sample gallery (placeholder)', 'Paddington', week('10:00', '17:00', ['tue', 'wed', 'thu', 'fri', 'sat', 'sun']), free, 'Sydney Football Stadium', 1.4, 9),
    rec('ph-sfs-dining', 'food_and_drink', 'Sample dining hall (placeholder)', 'Moore Park', week('11:30', '23:00'), b2, 'Sydney Football Stadium', 0.8),
    rec('ph-ncl-cafe', 'food_and_drink', 'Sample espresso bar (placeholder)', 'Broadmeadow', week('07:00', '14:30'), b1, 'Newcastle Stadium', 0.5),
    rec('ph-ncl-beach', 'attraction', 'Sample coastal walk (placeholder)', 'Newcastle', week('06:00', '19:00'), free, 'Newcastle Stadium', 3.2, 14),
    rec('ph-ncl-bar', 'food_and_drink', 'Sample small bar (placeholder)', 'Hamilton', week('15:00', '23:59', ['wed', 'thu', 'fri', 'sat', 'sun']), b2, 'Newcastle Stadium', 1.1)
  ];
})();
