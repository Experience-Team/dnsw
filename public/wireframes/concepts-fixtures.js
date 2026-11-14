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
  {"d": "Sat 2 Oct", "t": "Scotland v Uruguay", "s": "Pool D", "v": "North Queensland Stadium", "p": "Townsville", "k": "3:00pm", "a": "Townsville"},
  {"d": "Sat 2 Oct", "t": "Argentina v Canada", "s": "Pool C", "v": "Adelaide Oval", "p": "Adelaide", "k": "4:30pm", "a": "Adelaide"},
  {"d": "Sat 2 Oct", "t": "New Zealand v Chile", "s": "Pool A", "v": "Brisbane Stadium", "p": "Brisbane", "k": "6:30pm", "a": "Brisbane"},
  {"d": "Sat 2 Oct", "t": "France v USA", "s": "Pool E", "v": "Docklands Stadium", "p": "Melbourne", "k": "7:45pm", "a": "Melbourne"},
  {"d": "Sun 3 Oct", "t": "Wales v Zimbabwe", "s": "Pool F", "v": "Brisbane Stadium", "p": "Brisbane", "k": "3:00pm", "a": "Brisbane"},
  {"d": "Sun 3 Oct", "t": "South Africa v Italy", "s": "Pool B", "v": "Docklands Stadium", "p": "Melbourne", "k": "7:45pm", "a": "Melbourne"},
  {"d": "Sun 3 Oct", "t": "England v Tonga", "s": "Pool F", "v": "Perth Stadium", "p": "Perth", "k": "9:00pm", "a": "Perth"},
  {"d": "Tue 5 Oct", "t": "Georgia v Romania", "s": "Pool B", "v": "Adelaide Oval", "p": "Adelaide", "k": "7:30pm", "a": "Adelaide"},
  {"d": "Thu 7 Oct", "t": "Chile v Hong Kong China", "s": "Pool A", "v": "North Queensland Stadium", "p": "Townsville", "k": "5:15pm", "a": "Townsville"},
  {"d": "Fri 8 Oct", "t": "Spain v Canada", "s": "Pool C", "v": "Adelaide Oval", "p": "Adelaide", "k": "7:30pm", "a": "Adelaide"},
  {"d": "Fri 8 Oct", "t": "Wales v Tonga", "s": "Pool F", "v": "Docklands Stadium", "p": "Melbourne", "k": "7:45pm", "a": "Melbourne"},
  {"d": "Sat 9 Oct", "t": "England v Zimbabwe", "s": "Pool F", "v": "Adelaide Oval", "p": "Adelaide", "k": "7:30pm", "a": "Adelaide"},
  {"d": "Sat 9 Oct", "t": "Ireland v Scotland", "s": "Pool D", "v": "Docklands Stadium", "p": "Melbourne", "k": "8:00pm", "a": "Melbourne"},
  {"d": "Sat 9 Oct", "t": "France v Japan", "s": "Pool E", "v": "Brisbane Stadium", "p": "Brisbane", "k": "8:00pm", "a": "Brisbane"},
  {"d": "Sat 9 Oct", "t": "South Africa v Georgia", "s": "Pool B", "v": "Perth Stadium", "p": "Perth", "k": "9:30pm", "a": "Perth"},
  {"d": "Sun 10 Oct", "t": "USA v Samoa", "s": "Pool E", "v": "Adelaide Oval", "p": "Adelaide", "k": "4:30pm", "a": "Adelaide"},
  {"d": "Sun 10 Oct", "t": "Argentina v Fiji", "s": "Pool C", "v": "Docklands Stadium", "p": "Melbourne", "k": "7:45pm", "a": "Melbourne"},
  {"d": "Wed 13 Oct", "t": "Tonga v Zimbabwe", "s": "Pool F", "v": "Adelaide Oval", "p": "Adelaide", "k": "7:30pm", "a": "Adelaide"},
  {"d": "Thu 14 Oct", "t": "Fiji v Canada", "s": "Pool C", "v": "Brisbane Stadium", "p": "Brisbane", "k": "7:00pm", "a": "Brisbane"},
  {"d": "Thu 14 Oct", "t": "Japan v USA", "s": "Pool E", "v": "North Queensland Stadium", "p": "Townsville", "k": "7:00pm", "a": "Townsville"},
  {"d": "Thu 14 Oct", "t": "New Zealand v Hong Kong China", "s": "Pool A", "v": "Docklands Stadium", "p": "Melbourne", "k": "7:45pm", "a": "Melbourne"},
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

/* GAP DATA, FIXTURE-ONLY: curated trips for "Around your matches" (free days between matches). A curated trip is NOT
   in the product data contract: it is a proposed record (docs/proposal-curated-trips.md), curated by the DNSW team
   from ATDW products and the team's own custom products. Every title, stop and figure here is a placeholder; the
   region names (Blue Mountains, Hunter Valley and so on) are real places, the trips are not. Links go nowhere and
   nothing is booked.
   Shape: id, kind ('day' | 'long'), nights (long only), title, summary, region, bases (where it starts from:
   'sydney' | 'newcastle'), on_the_way (suits a stretch between a Newcastle match and a Sydney match), travel (per
   base: mode and minutes, generalising travel_time_from_cbd_minutes to more than one origin), and stops. Each stop is
   either an ATDW product reference (source 'atdw') or a custom DNSW product (source 'custom'), with the fields a
   card needs: title, type, suburb, open days and a price band. The trip's open days and price band are worked out
   from its stops (concepts-third-half.js), not written by hand. */
(function () {
  var ALL = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  function stop(source, title, type, suburb, days, band, minutes) {
    return { source: source, ref: source === 'atdw' ? 'atdw:placeholder-' + title.toLowerCase().replace(/[^a-z]+/g, '-') : null,
      title: title, type: type, suburb: suburb, days: days || ALL, band: band || '', minutes_from_start: minutes || 0 };
  }
  window.cnTrips = [
    { id: 'trip-blue-mountains', kind: 'day', title: 'Blue Mountains day out (placeholder)', region: 'Blue Mountains',
      summary: 'Lookouts, a bushwalk and lunch in a mountain village, back by evening.', bases: ['sydney'],
      travel: { sydney: { mode: 'train', minutes: 120 } },
      stops: [stop('atdw', 'Sample lookout (placeholder)', 'attraction', 'Katoomba', ALL, '', 0),
        stop('custom', 'Sample cliff-top walk (placeholder)', 'attraction', 'Leura', ALL, '', 20),
        stop('atdw', 'Sample village café (placeholder)', 'food_and_drink', 'Leura', ['wed', 'thu', 'fri', 'sat', 'sun', 'mon'], '$$', 25)] },
    { id: 'trip-royal-np', kind: 'day', title: 'Royal National Park coast walk (placeholder)', region: 'Royal National Park',
      summary: 'A coastal track, a swim spot and fish and chips by the water.', bases: ['sydney'],
      travel: { sydney: { mode: 'train', minutes: 60 } },
      stops: [stop('custom', 'Sample coast track (placeholder)', 'attraction', 'Royal National Park', ALL, '', 0),
        stop('atdw', 'Sample kiosk (placeholder)', 'food_and_drink', 'Bundeena', ALL, '$', 30)] },
    { id: 'trip-port-stephens', kind: 'day', title: 'Port Stephens bay day (placeholder)', region: 'Port Stephens',
      summary: 'A dolphin cruise, the dunes and a beach lunch.', bases: ['newcastle'],
      travel: { newcastle: { mode: 'car', minutes: 50 } },
      stops: [stop('atdw', 'Sample bay cruise (placeholder)', 'tour', 'Nelson Bay', ['thu', 'fri', 'sat', 'sun', 'mon'], '$$', 0),
        stop('atdw', 'Sample dune tour (placeholder)', 'tour', 'Anna Bay', ALL, '$$', 25),
        stop('custom', 'Sample beach picnic spot (placeholder)', 'attraction', 'Shoal Bay', ALL, '', 15)] },
    { id: 'trip-lake-macquarie', kind: 'day', title: 'Lake Macquarie by bike (placeholder)', region: 'Lake Macquarie',
      summary: 'A flat lakeside ride with a café at each end.', bases: ['newcastle'],
      travel: { newcastle: { mode: 'car', minutes: 30 } },
      stops: [stop('atdw', 'Sample bike hire (placeholder)', 'hire', 'Warners Bay', ['fri', 'sat', 'sun', 'mon', 'tue'], '$', 0),
        stop('custom', 'Sample lakeside path (placeholder)', 'attraction', 'Speers Point', ALL, '', 10)] },
    { id: 'trip-hunter', kind: 'long', nights: 2, title: 'Hunter Valley, 2 nights (placeholder)', region: 'Hunter Valley',
      summary: 'Cellar doors, a long lunch and a hot-air balloon at dawn.', bases: ['newcastle', 'sydney'], on_the_way: true,
      travel: { newcastle: { mode: 'car', minutes: 50 }, sydney: { mode: 'car', minutes: 120 } },
      stops: [stop('atdw', 'Sample cellar door (placeholder)', 'food_and_drink', 'Pokolbin', ['thu', 'fri', 'sat', 'sun', 'mon'], '$$', 0),
        stop('atdw', 'Sample balloon flight (placeholder)', 'tour', 'Pokolbin', ALL, '$$$', 5),
        stop('custom', 'Sample vineyard walk (placeholder)', 'attraction', 'Lovedale', ALL, '', 15)] },
    { id: 'trip-south-coast', kind: 'long', nights: 3, title: 'South Coast, 3 nights (placeholder)', region: 'South Coast',
      summary: 'Blowholes, beaches and a whale-watching cruise, by train then car.', bases: ['sydney'],
      travel: { sydney: { mode: 'train', minutes: 120 } },
      stops: [stop('atdw', 'Sample blowhole lookout (placeholder)', 'attraction', 'Kiama', ALL, '', 0),
        stop('custom', 'Sample coastal drive (placeholder)', 'attraction', 'Gerringong', ALL, '', 20),
        stop('atdw', 'Sample whale cruise (placeholder)', 'tour', 'Huskisson', ['fri', 'sat', 'sun', 'mon', 'tue', 'wed'], '$$', 70)] },
    { id: 'trip-barrington', kind: 'long', nights: 1, title: 'Barrington Tops overnight (placeholder)', region: 'Barrington Tops',
      summary: 'Rainforest walks and a night in the hills, an hour and a half from Newcastle.', bases: ['newcastle'],
      travel: { newcastle: { mode: 'car', minutes: 95 } },
      stops: [stop('custom', 'Sample rainforest loop (placeholder)', 'attraction', 'Barrington Tops', ALL, '', 0),
        stop('atdw', 'Sample country pub (placeholder)', 'food_and_drink', 'Gloucester', ALL, '$', 30)] }
  ];
})();

/* RWC 2027 host venues: 7 cities, 8 stadiums, 1 Oct to 13 Nov 2027.
   Source: summary supplied 13 Nov 2027; verify against the official RWC 2027 matches page.
   city: plain English name used in chips and copy; cityTraditional: dual name as published.
   nsw: true for the NSW venues (drives In NSW only and the city chips). */
window.cnVenues = [
  { id: 'adelaide-oval',            stadium: 'Adelaide Oval',            city: 'Adelaide',   cityTraditional: 'Adelaide | Tarntanya',          state: 'South Australia',   stateCode: 'SA',  nsw: false, matches: { pool: 6, r16: 0, qf: 0, sf: 0, bronze: 0, final: 0 } },
  { id: 'brisbane-stadium',         stadium: 'Brisbane Stadium',         city: 'Brisbane',   cityTraditional: 'Brisbane | Meeanjin',           state: 'Queensland',        stateCode: 'QLD', nsw: false, matches: { pool: 6, r16: 2, qf: 2, sf: 0, bronze: 0, final: 0 } },
  { id: 'docklands-stadium',        stadium: 'Docklands Stadium',        city: 'Melbourne',  cityTraditional: 'Melbourne | Narrm',             state: 'Victoria',          stateCode: 'VIC', nsw: false, matches: { pool: 6, r16: 2, qf: 0, sf: 0, bronze: 0, final: 0 } },
  { id: 'newcastle-stadium',        stadium: 'Newcastle Stadium',        city: 'Newcastle',  cityTraditional: 'Newcastle | Awabakal-Worimi',    state: 'New South Wales',   stateCode: 'NSW', nsw: true,  matches: { pool: 4, r16: 0, qf: 0, sf: 0, bronze: 0, final: 0 } },
  { id: 'perth-stadium',            stadium: 'Perth Stadium',            city: 'Perth',      cityTraditional: 'Perth | Boorloo',               state: 'Western Australia', stateCode: 'WA',  nsw: false, matches: { pool: 5, r16: 2, qf: 0, sf: 0, bronze: 0, final: 0 }, note: 'Opening match' },
  { id: 'stadium-australia',        stadium: 'Stadium Australia',        city: 'Sydney',     cityTraditional: 'Sydney | Gadigal/Wangal',       state: 'New South Wales',   stateCode: 'NSW', nsw: true,  matches: { pool: 2, r16: 0, qf: 2, sf: 2, bronze: 1, final: 1 }, note: 'Final, Sat 13 Nov 2027' },
  { id: 'sydney-football-stadium',  stadium: 'Sydney Football Stadium',  city: 'Sydney',     cityTraditional: 'Sydney | Gadigal',              state: 'New South Wales',   stateCode: 'NSW', nsw: true,  matches: { pool: 3, r16: 2, qf: 0, sf: 0, bronze: 0, final: 0 } },
  { id: 'north-queensland-stadium', stadium: 'North Queensland Stadium', city: 'Townsville', cityTraditional: 'Townsville | Gurambilbarra',    state: 'Queensland',        stateCode: 'QLD', nsw: false, matches: { pool: 4, r16: 0, qf: 0, sf: 0, bronze: 0, final: 0 } }
];
