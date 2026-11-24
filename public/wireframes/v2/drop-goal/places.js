/* Drop goal, Version 2: the places a goal can land in (24 Nov 2026). Edit this list freely.
   Data contract §19 (destinations), every field `gap`: fixtures only. Places are precincts, areas and standalone
   attractions, never a business: DNSW does not favour one product over another.
   - summary: the destination page's direct answer, from concepts-destinations.js (sydney.com and visitnsw.com, read
     22 Nov 2026). Where there is none yet, sample: true marks the line as sample (pink with Annotations on).
   - host_city: the nearer host city, used to choose a person's places from where their team plays.
   - ground: the nearest host ground; travel: an estimate from it, written for the prototype (sample).
   - image: a file in ../../assets/images/, or null for the drawn placeholder. stand_in: true when the picture is a
     closest match, not the place itself (pink with Annotations on). Pictures of businesses are never used.
   - tags: up to three, sample until the content team sets them. */
window.DG2Places = [
  { id: 'cabramatta', name: 'Cabramatta', host_city: 'sydney', ground: 'Stadium Australia',
    tags: ['Food', 'Culture', 'Western Sydney'],
    summary: 'Bánh mì and fresh herbs on the food streets of Sydney’s south-west, with laneways and arcades packed with stalls.', sample: true,
    travel: 'About 35 min by car from Stadium Australia', image: null },
  { id: 'blue-mountains', name: 'Blue Mountains lookout', host_city: 'sydney', ground: 'Stadium Australia',
    tags: ['Nature', 'Lookouts', 'Day trip'],
    summary: 'Katoomba is the main town of the World Heritage-listed Blue Mountains, a 90-minute drive or two-hour train ride from Sydney. It is the base for Echo Point and the Three Sisters, a steep scenic railway and skyway, and bushwalks into the Jamison Valley, with Art Deco streets, bars and breweries.',
    travel: 'About 1 h 30 min by car from Stadium Australia', image: null },
  { id: 'bondi-coogee', name: 'Bondi to Coogee walk', host_city: 'sydney', ground: 'Sydney Football Stadium',
    tags: ['Coast', 'Walks', 'Eastern Sydney'],
    summary: 'Bondi is Sydney’s world-famous beach suburb, about 30 minutes by public transport from Town Hall. It is home to the Bondi Icebergs ocean pool, the world’s oldest surf lifesaving club (1907), year-round surf and the start of the 6km Bondi to Coogee Coastal Walk.',
    travel: 'About 15 min by bus from Sydney Football Stadium', image: 'coast-headland.webp', stand_in: true },
  { id: 'parramatta', name: 'Parramatta', host_city: 'sydney', ground: 'Stadium Australia',
    tags: ['Heritage', 'Food', 'Western Sydney'],
    summary: 'Parramatta is Sydney’s second CBD and the heart of Western Sydney, about 25 minutes by train from Central. It has UNESCO World Heritage-listed convict sites including Old Government House, the new Powerhouse Parramatta museum, Riverside Theatre, Elizabeth Farm and multicultural eat streets including Harris Park’s ‘Little India’.',
    travel: 'About 15 min by car from Stadium Australia', image: null },
  { id: 'the-rocks', name: 'The Rocks', host_city: 'sydney', ground: 'Sydney Football Stadium',
    tags: ['Heritage', 'Harbour', 'City'],
    summary: 'The Rocks is Sydney’s oldest neighbourhood and the birthplace of modern Sydney, settled in 1788. Beside Circular Quay, it pairs cobbled laneways, sandstone buildings and the city’s oldest pubs with the Museum of Contemporary Art, weekend markets and close-up views of the Sydney Harbour Bridge and Opera House.',
    travel: 'About 20 min by light rail from Sydney Football Stadium', image: null },
  { id: 'newcastle-baths', name: 'Newcastle Ocean Baths', host_city: 'newcastle', ground: 'Newcastle Stadium',
    tags: ['Swimming', 'Coast', 'Newcastle'],
    summary: 'A saltwater pool on the edge of the surf. Swim before breakfast, then walk the Bathers Way.', sample: true,
    travel: 'About 10 min by car from Newcastle Stadium', image: 'Newcastle baths.jpg' },
  { id: 'hunter-valley', name: 'Hunter Valley', host_city: 'newcastle', ground: 'Newcastle Stadium',
    tags: ['Food and wine', 'Countryside', 'Day trip'],
    summary: 'A long lunch between the vines, with nowhere to be until evening.', sample: true,
    travel: 'About 50 min by car from Newcastle Stadium', image: null },
  { id: 'nobbys-beach', name: 'Nobbys Beach', host_city: 'newcastle', ground: 'Newcastle Stadium',
    tags: ['Beach', 'Walks', 'Newcastle'],
    summary: 'Nobbys Beach is Newcastle’s highest-profile beach, popular with families, learner surfers and local dolphins. Walk the break-wall beneath the iconic Nobbys Lighthouse and you may see tugs guide coal ships into the harbour. It has barbecues and a kiosk, marks the northern end of the Bathers Way, and is reached by Light Rail or car.',
    travel: 'About 15 min by car from Newcastle Stadium', image: null },
  { id: 'port-stephens', name: 'Port Stephens', host_city: 'newcastle', ground: 'Newcastle Stadium',
    tags: ['Wildlife', 'Beaches', 'Day trip'],
    summary: 'Nelson Bay is the largest town in Port Stephens, about 2 hours 45 minutes’ drive north of Sydney. More than 100 dolphins live in its marine park, with dolphin cruises year-round, wild dolphin swims in warmer months and whale watching from May to November. Sheltered beaches suit young families.',
    travel: 'About 1 h by car from Newcastle Stadium', image: 'coast-aerial.webp', stand_in: true },
  { id: 'lake-macquarie', name: 'Lake Macquarie', host_city: 'newcastle', ground: 'Newcastle Stadium',
    tags: ['Lake', 'Walks', 'Cycling'],
    summary: 'Warners Bay is a lakeside suburb on Lake Macquarie, just under two hours’ drive from Sydney and 30 minutes from Newcastle. Its 9km waterfront path and Red Bluff Boardwalk suit walking and cycling, the Creative Lake Sculpture Trail features Australian artists, and Speers Point Park has a giant spiral slide.',
    travel: 'About 25 min by car from Newcastle Stadium', image: null }
];
