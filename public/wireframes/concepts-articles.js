/* ARTICLES for Read before you go on Home (22 November 2026). DUMMY EDITORIAL CONTENT written for the prototype: the facts
   come from the destination data (sydney-towns-aeo.xlsx, the town pages on sydney.com and visitnsw.com) and the match
   fixtures (concepts-fixtures.js, themselves placeholders); the framing, timings and advice are written for the prototype.
   As a government site, no business is named. Articles are editorial pages, not products, so they are not in the
   product data contract.

   Each article: the tile (cat, title, img, r = the tile picture's shape), a dek (the standfirst under the title), the
   prose (body: [kind, text], kind h = a section heading, p = a paragraph, i = a picture between paragraphs as
   [i, picture key, what it shows]; pictures are stand-ins from the library, none of a named business), then the reading, SEO and AEO block:
   q and answer (the question the page answers and a 40 to 60 word answer), facts (key facts as label and value), faqs
   (answers of 50 words or fewer) and places (the named places, for the reader and for structured data).
   The read time is worked out from the page itself, so the tile always matches it. */
window.TP_ARTICLES = [
  {
    slug: 'match-day-sydney', cat: 'Match day', img: 'hero-stadium', r: '4 / 5',
    title: 'A first-timer’s guide to match day in Sydney',
    dek: 'Two stadiums, one city: how to get there, where to spend the hours either side, and how to get home.',
    body: [
      ['h', 'Two stadiums, two different days'],
      ['p', 'Sydney’s matches are split between two grounds, and they make for quite different days out. Stadium Australia, the bigger of the two, sits at Sydney Olympic Park in the city’s west. It hosts group matches, the quarter-finals, the semi-finals and the Final on Saturday 13 November. Sydney Football Stadium is at Moore Park, on the eastern edge of the city centre, and hosts group matches and two round of 16 matches.'],
      ['p', 'Check which ground your ticket is for before you plan anything else. The two are about 15 kilometres apart as the crow flies, and getting between them takes longer than it looks on a map.'],
      ['h', 'Getting to Stadium Australia'],
      ['p', 'The simplest way in is the train. Services run from Central to Olympic Park Station in about 30 minutes, and you can also take a ferry from Circular Quay, which takes about an hour. The station is a short walk from the stadium, so you arrive on foot with everyone else, which is half the fun.'],
      ['p', 'Give yourself time to look around. Sydney Olympic Park was built for the 2000 Olympic Games: you can still swim in the pool where Ian Thorpe won gold, or cycle some of the 35 kilometres of paths in Bicentennial Park before the gates open.'],
      ['i', 'river-national-park', 'paths in Bicentennial Park, Sydney Olympic Park'],
      ['h', 'Getting to Sydney Football Stadium'],
      ['p', 'Moore Park is close enough to the city to walk from several neighbourhoods. Surry Hills is a 10-minute walk from Central Station and its streets lead out towards the stadium, and Paddington’s terraces sit just to the north. Many fans eat in one or the other, then walk to the ground together.'],
      ['i', 'village', 'fans gathering on the grass before a match'],
      ['h', 'Before the match'],
      ['p', 'Treat the hours before kick-off as part of the day, not as waiting time. In October and November Paddington’s leafy streets turn purple with jacarandas, and its markets run every Saturday. Surry Hills is known for its restaurants, small bars and coffee, and Sydney Olympic Park has parkland and paths right beside the stadium.'],
      ['i', 'city-dining', 'an outdoor table in Surry Hills'],
      ['p', 'For an evening match, book a table if you can. Places to eat near both grounds fill quickly on match days.'],
      ['h', 'After the final whistle'],
      ['p', 'Crowds leave together, so the first trains and buses are the busiest. If you are in no hurry, let the rush pass: have a meal or a drink nearby and travel a little later. Check your last service home before the match, especially after a late kick-off.'],
      ['h', 'Times and tickets'],
      ['p', 'Kick-off times are given in Sydney time. If friends are following from home, convert carefully, and check the official tournament timetable for any changes. Keep your ticket on a charged phone and allow extra time to get through the gates.']
    ],
    q: 'What should I know before a Rugby World Cup match in Sydney?',
    answer: 'Sydney hosts Rugby World Cup 2027 matches at two stadiums: Stadium Australia at Sydney Olympic Park, about 30 minutes by train from Central, and Sydney Football Stadium at Moore Park, near Surry Hills and Paddington. Arrive early, travel by public transport, and plan where to eat and how to get home before kick-off.',
    facts: [
      ['Stadiums', 'Stadium Australia (Sydney Olympic Park) and Sydney Football Stadium (Moore Park)'],
      ['Train to Stadium Australia', 'About 30 minutes from Central to Olympic Park Station'],
      ['Ferry to Sydney Olympic Park', 'About 1 hour from Circular Quay'],
      ['On foot to Moore Park', 'From Surry Hills, itself a 10-minute walk from Central Station'],
      ['The Final', 'Saturday 13 November 2027, Stadium Australia'],
      ['Kick-off times', 'Given in Sydney time']
    ],
    faqs: [
      ['Which stadiums host Rugby World Cup 2027 matches in Sydney?', 'Two: Stadium Australia at Sydney Olympic Park, which hosts the Final, and Sydney Football Stadium at Moore Park. Check which one your ticket is for before planning travel, as they are about 15 kilometres apart.'],
      ['How do I get to Stadium Australia by public transport?', 'Take a train from Central to Olympic Park Station, about 30 minutes, then walk to the stadium. A ferry from Circular Quay takes about an hour.'],
      ['Where can I eat before a match at Moore Park?', 'Surry Hills and Paddington are the closest neighbourhoods. Surry Hills is known for restaurants, small bars and coffee, and Paddington for heritage pubs and its Saturday markets. Book ahead for evening kick-offs.'],
      ['When is the Rugby World Cup 2027 Final?', 'Saturday 13 November 2027 at Stadium Australia, Sydney Olympic Park. Check the official timetable for the kick-off time.']
    ],
    places: ['Stadium Australia', 'Sydney Football Stadium', 'Sydney Olympic Park', 'Moore Park', 'Surry Hills', 'Paddington', 'Central Station', 'Circular Quay']
  },
  {
    slug: 'eat-moore-park', cat: 'Food and drink', img: 'city-dining', r: '1 / 1',
    title: 'Where to eat near Moore Park before kick-off',
    dek: 'Four neighbourhoods within easy reach of Sydney Football Stadium, and how to time a meal around the match.',
    body: [
      ['p', 'Moore Park sits between some of Sydney’s best neighbourhoods for food. Pick the one that suits your kick-off, eat well, then walk to the ground with the crowd.'],
      ['h', 'Surry Hills: restaurants, small bars and coffee'],
      ['p', 'Surry Hills is a 10-minute walk from Central Station and one of the city’s busiest food suburbs. Crown Street is lined with restaurants listed in the Good Food Guide, along with small bars and some of Sydney’s most serious coffee. It suits an afternoon match well: coffee and a long lunch, then a walk to Moore Park.'],
      ['p', 'Between courses there is plenty to see: vintage boutiques, street art, the Brett Whiteley Studio and Belvoir St Theatre.'],
      ['i', 'village', 'evening crowds in the inner city'],
      ['h', 'Paddington: pubs, boutiques and markets'],
      ['p', 'Paddington’s terrace-lined streets are known for fashion, art galleries and heritage pubs. Oxford Street and William Street hold designer boutiques, and Paddington Markets have run every Saturday since 1973. Before a Saturday match, make a morning of the markets and have lunch nearby.'],
      ['i', 'hunter', 'sharing plates and a glass of wine in Paddington'],
      ['h', 'Later on: Newtown and Marrickville'],
      ['p', 'If you would rather eat after the final whistle, head to the inner west. Newtown is about 10 minutes by train from the city, and King Street is packed with multicultural restaurants, bars and bookshops. Next door, Marrickville is known for Vietnamese, Greek and Filipino food, late-night music venues and more breweries than any other suburb in Australia.'],
      ['h', 'Timing your meal'],
      ['p', 'Group matches at Sydney Football Stadium kick off at 5:15pm or 7:45pm. For the earlier one, have a late lunch and plan dinner for after the match. For the later one, aim to finish eating by about 6:30pm, which leaves time for the walk and the gates. On match days, book ahead wherever you can.'],
      ['i', 'hero-stadium', 'Sydney Football Stadium on a match night'],
      ['h', 'Eating at the ground'],
      ['p', 'Food and drink are sold inside the stadium, but the queues are longest at half-time. If you plan to eat inside, buy before kick-off.']
    ],
    q: 'Where can I eat near Sydney Football Stadium?',
    answer: 'The closest places to eat before a match at Sydney Football Stadium are Surry Hills and Paddington, both within walking distance of Moore Park. Surry Hills is known for restaurants, small bars and coffee, and Paddington for heritage pubs and boutiques. Newtown and Marrickville, a short train ride away, suit a meal after the match.',
    facts: [
      ['Nearest neighbourhoods', 'Surry Hills and Paddington'],
      ['Surry Hills', 'A 10-minute walk from Central Station'],
      ['Paddington Markets', 'Every Saturday, since 1973'],
      ['Newtown', 'About 10 minutes by train from the city'],
      ['Group match kick-offs', '5:15pm or 7:45pm, Sydney time']
    ],
    faqs: [
      ['What is the closest place to eat to Sydney Football Stadium?', 'Surry Hills and Paddington are both within walking distance of Moore Park. Surry Hills has the widest choice of restaurants and small bars; Paddington has heritage pubs and, on Saturdays, Paddington Markets.'],
      ['Do I need to book a restaurant on match day?', 'Book ahead for evening matches if you can. Places to eat near Moore Park fill quickly on match days, especially in Surry Hills.'],
      ['Where can I eat late after a match in Sydney?', 'Newtown and Marrickville in the inner west suit a later meal. Newtown is about 10 minutes by train from the city, and Marrickville is known for Vietnamese, Greek and Filipino food and late-night music venues.']
    ],
    places: ['Moore Park', 'Sydney Football Stadium', 'Surry Hills', 'Crown Street', 'Paddington', 'Paddington Markets', 'Newtown', 'Marrickville']
  },
  {
    slug: 'newcastle-day-trips', cat: 'Day trips', img: 'Newcastle baths', r: '3 / 4',
    title: 'Five day trips from Newcastle between matches',
    dek: 'Sea caves, heritage towns, vineyards, dolphins and dunes, all within a day of Newcastle Stadium.',
    body: [
      ['p', 'Newcastle’s matches leave free days in between, and the city makes a good base for them. Within a day’s return you can explore sea caves, watch dolphins, slide down sand dunes and taste wine where it is made. Here are five ideas, from the shortest trip to the longest day.'],
      ['h', '1. Lake Macquarie: Swansea and Caves Beach'],
      ['p', 'Swansea sits between Lake Macquarie, the largest saltwater lake in the Southern Hemisphere, and the Pacific Ocean, about 40 minutes from Newcastle. Nearby Caves Beach has sea caves you can walk into at low tide only, so check the tide times first. Carry on south to Catherine Hill Bay, a State Heritage-listed coal mining village with a patrolled beach and an old coal-loading jetty.'],
      ['i', 'hero-coast', 'the coast near Caves Beach'],
      ['h', '2. Maitland: heritage, street art and markets'],
      ['p', 'Maitland is a historic Hunter River town halfway between Newcastle and the Hunter Valley vineyards. Walk its heritage streets, find the street art and visit Maitland Regional Art Gallery. It is also home to Australia’s first accredited Slow Food market.'],
      ['h', '3. The Hunter Valley: Pokolbin and Wollombi'],
      ['p', 'Pokolbin is the wine capital of the Hunter Valley, Australia’s oldest wine region, with the area’s highest concentration of wineries. Start early for a sunrise hot air balloon flight, then spend the day at cellar doors. If you are tasting, book a tour or choose a designated driver.'],
      ['i', 'hunter', 'a tasting at a Pokolbin cellar door'],
      ['p', 'On the way back, stop at Wollombi, a village established in 1830 on the convict-built Great North Road, with well-preserved 19th-century streets and a small museum.'],
      ['h', '4. Port Stephens: dolphins and whales'],
      ['p', 'More than 100 dolphins live in the marine park at Nelson Bay, the largest town in Port Stephens, and cruises run all year. Whale season runs from May to November, so a cruise during the tournament could bring both. The sheltered beaches suit young families.'],
      ['i', 'coast-aerial', 'Port Stephens from the air'],
      ['h', '5. Anna Bay: the Stockton Bight dunes'],
      ['p', 'Anna Bay is the gateway to the Stockton Bight Sand Dunes in the Worimi Conservation Lands, the largest moving coastal dunes in the Southern Hemisphere. Go sandboarding, ride a camel or join a 4WD tour, then cool off at Birubi or One Mile beach. Pair it with Nelson Bay for a full day in Port Stephens.'],
      ['h', 'Planning the day'],
      ['p', 'Most of these trips are easiest by car or with a tour, as public transport is limited outside the city. Check travel times before you set off, leave a margin before an evening match, and keep the day after a big night for somewhere closer.']
    ],
    q: 'What are the best day trips from Newcastle?',
    answer: 'Five good day trips from Newcastle are Lake Macquarie’s Swansea and Caves Beach, historic Maitland, the Hunter Valley around Pokolbin and Wollombi, Port Stephens for dolphins and whales, and the Stockton Bight dunes at Anna Bay. Swansea is about 40 minutes away; the others suit a full day with a car or a tour.',
    facts: [
      ['Closest', 'Swansea, about 40 minutes from Newcastle'],
      ['Caves Beach sea caves', 'Low tide only'],
      ['Dolphins at Nelson Bay', 'More than 100; cruises all year'],
      ['Whale season', 'May to November'],
      ['Stockton Bight', 'The largest moving coastal dunes in the Southern Hemisphere'],
      ['Hunter Valley', 'Australia’s oldest wine region']
    ],
    faqs: [
      ['What is the best day trip from Newcastle?', 'It depends on the day you want. Port Stephens suits wildlife, with dolphin cruises all year and whales until November. The Hunter Valley suits food and wine. Swansea on Lake Macquarie is the closest, about 40 minutes away.'],
      ['Can I see whales near Newcastle in October?', 'Yes. Whale season off Port Stephens runs from May to November, so October and November fall within it. Cruises leave from Nelson Bay.'],
      ['Do I need a car for day trips from Newcastle?', 'A car or a tour makes these trips much easier, as public transport outside Newcastle is limited. In the Hunter Valley, book a tour or choose a designated driver if you are tasting wine.']
    ],
    places: ['Newcastle', 'Swansea', 'Caves Beach', 'Lake Macquarie', 'Catherine Hill Bay', 'Maitland', 'Pokolbin', 'Wollombi', 'Nelson Bay', 'Port Stephens', 'Anna Bay', 'Stockton Bight Sand Dunes']
  },
  {
    slug: 'ocean-pools', cat: 'Coast', img: 'Merwether baths', r: '4 / 3',
    title: 'Ocean pools for a post-match swim',
    dek: 'Sea water without the surf: ocean pools and baths near Sydney and Newcastle.',
    body: [
      ['p', 'After eighty minutes of rugby and the hours either side, few things beat a swim in the sea. Ocean pools, built into the rocks at the edge of the beach, let you swim in sea water without taking on the surf, and NSW has some of the best.'],
      ['h', 'Sydney’s eastern beaches'],
      ['p', 'Bondi is home to the Bondi Icebergs ocean pool and the start of the 6-kilometre coastal walk to Coogee. Coogee has historic ocean pools of its own, including McIver Baths and Wylie’s Baths, and snorkelling at Gordons Bay. Walking between the two, with a swim at each end, makes a good morning after a match at Moore Park.'],
      ['i', 'coast-headland', 'the coastal walk between Bondi and Coogee'],
      ['h', 'Further afield in Sydney'],
      ['p', 'Cronulla, about 50 minutes by train from Central, is the only Sydney beach you can reach directly by train, with ocean rock pools along its 4-kilometre beach walk. At the northern tip of the Northern Beaches, Palm Beach has an ocean pool too. On the harbour, Balmain’s Dawn Fraser Baths are Australia’s oldest pool, a ferry ride from Circular Quay.'],
      ['h', 'Newcastle'],
      ['p', 'Newcastle has some of the finest ocean baths anywhere. Merewether Ocean Baths are the largest ocean baths complex in the Southern Hemisphere, at the southern end of the 6-kilometre Bathers Way, which follows the coast from Nobbys Beach. Bar Beach, on the way, takes its name from a rock pool formation called The Bar.'],
      ['i', 'Newcastle baths', 'Newcastle’s ocean baths'],
      ['h', 'On a longer trip'],
      ['p', 'Heading south, Kiama has ocean pools alongside its famous blowhole, and Wollongong has rock pools among its 17 patrolled beaches. On the Central Coast, The Entrance has two heritage-listed ocean baths.'],
      ['i', 'Kiama', 'the coast at Kiama'],
      ['h', 'Swim safely'],
      ['p', 'Ocean pools are still the ocean. Waves can wash over the wall in big seas, and pools close for cleaning or rough weather, so check conditions and any signs before you get in. The water is cool in spring: bring something warm for afterwards.']
    ],
    q: 'Where are the best ocean pools near the Rugby World Cup venues?',
    answer: 'The best ocean pools near the Rugby World Cup 2027 venues include Bondi’s ocean pool and Coogee’s historic baths in Sydney, and Merewether Ocean Baths in Newcastle, the largest ocean baths complex in the Southern Hemisphere. Ocean pools give you sea water without the surf, but check conditions first, as big seas can close them.',
    facts: [
      ['Largest', 'Merewether Ocean Baths, Newcastle: the largest ocean baths complex in the Southern Hemisphere'],
      ['Oldest pool', 'Dawn Fraser Baths, Balmain'],
      ['Bondi to Coogee', 'A 6-kilometre coastal walk with pools at both ends'],
      ['Bathers Way, Newcastle', '6 kilometres, Nobbys Beach to Merewether'],
      ['By train', 'Cronulla, about 50 minutes from Central']
    ],
    faqs: [
      ['What is the largest ocean pool near Newcastle?', 'Merewether Ocean Baths, the largest ocean baths complex in the Southern Hemisphere. They sit at the southern end of the Bathers Way coastal walk.'],
      ['Which Sydney ocean pools can I reach by public transport?', 'Bondi and Coogee are about 30 minutes from the city by public transport. Cronulla is about 50 minutes by train from Central, and Balmain’s Dawn Fraser Baths are a ferry ride from Circular Quay.'],
      ['Are ocean pools safe to swim in?', 'They are generally calmer than the surf, but waves can wash over the wall in big seas and pools can close. Check conditions and signs before you swim, and never swim alone.']
    ],
    places: ['Bondi', 'Coogee', 'McIver Baths', 'Wylie’s Baths', 'Cronulla', 'Palm Beach', 'Dawn Fraser Baths', 'Balmain', 'Merewether Ocean Baths', 'Bathers Way', 'Bar Beach', 'Kiama', 'Wollongong', 'The Entrance']
  },
  {
    slug: 'pacific-fans', cat: 'Culture', img: 'village', r: '4 / 5',
    title: 'How Pacific fans celebrate their rugby',
    dek: 'Fiji, Samoa and Tonga bring some of the loudest, proudest support in the game. Here is what to expect, and how to join in.',
    body: [
      ['p', 'Few fans make a stadium feel like home quite like Pacific supporters. Rugby is part of everyday life in Fiji, Samoa and Tonga, and their supporters, many from communities across Australia and New Zealand, turn a match into a celebration of family, faith and identity.'],
      ['h', 'The challenge before kick-off'],
      ['p', 'Before kick-off, each of the three teams performs a traditional challenge facing their opponents: Fiji the Cibi, Samoa the Siva Tau and Tonga the Sipi Tau. It is a moment of real meaning for players and supporters, and stadiums tend to fall quiet to watch, then roar when it ends.'],
      ['i', 'hero-stadium', 'a Pacific team facing their opponents before kick-off'],
      ['h', 'Colour, flags and song'],
      ['p', 'Expect stands full of flags and team colours, from Fiji’s white to Samoa’s blue and Tonga’s red. Singing is a big part of the day, in the stands and outside the ground, and it often carries on long after the final whistle, win or lose.'],
      ['i', 'village', 'supporters in team colours'],
      ['h', 'Where to see them in NSW'],
      ['p', 'In NSW, Samoa meets Japan at Newcastle Stadium on Sunday 3 October and France at Sydney Football Stadium on Sunday 17 October. Fiji plays Spain in Newcastle on Monday 4 October. Tonga’s group matches are played interstate, in Perth, Melbourne and Adelaide.'],
      ['h', 'Joining in'],
      ['p', 'Everyone is welcome to share the atmosphere. A few words go a long way: bula in Fijian, talofa in Samoan and mālō e lelei in Tongan. Stand for the anthems, watch the challenge respectfully, ask before you photograph people up close, and follow the lead of the fans around you.'],
      ['h', 'Beyond the stadium'],
      ['p', 'Western Sydney is home to large Pacific communities, and match days can bring community gatherings and food to share. Look out for local listings closer to the tournament.']
    ],
    q: 'How do Pacific rugby fans celebrate?',
    answer: 'Pacific fans celebrate with song, colour and pride. Before kick-off, Fiji, Samoa and Tonga each perform a traditional challenge: the Cibi, the Siva Tau and the Sipi Tau. In NSW, Samoa plays Japan in Newcastle and France at Moore Park, and Fiji plays Spain in Newcastle, during Rugby World Cup 2027.',
    facts: [
      ['Pacific teams', 'Fiji, Samoa and Tonga'],
      ['Challenges', 'Cibi (Fiji), Siva Tau (Samoa), Sipi Tau (Tonga)'],
      ['Samoa in NSW', 'v Japan, Newcastle Stadium, Sun 3 Oct; v France, Sydney Football Stadium, Sun 17 Oct'],
      ['Fiji in NSW', 'v Spain, Newcastle Stadium, Mon 4 Oct'],
      ['Greetings', 'Bula (Fijian), talofa (Samoan), mālō e lelei (Tongan)']
    ],
    faqs: [
      ['What is the Siva Tau?', 'The Siva Tau is Samoa’s traditional challenge, performed by the team facing their opponents before kick-off. Fiji’s is the Cibi and Tonga’s is the Sipi Tau.'],
      ['Where can I see Pacific teams play in NSW?', 'Samoa plays Japan at Newcastle Stadium on Sunday 3 October and France at Sydney Football Stadium on Sunday 17 October 2027. Fiji plays Spain at Newcastle Stadium on Monday 4 October.'],
      ['How should I behave during the challenge?', 'Watch respectfully. Crowds usually fall quiet during the challenge and cheer once it ends. Follow the lead of the fans around you.']
    ],
    places: ['Newcastle Stadium', 'Sydney Football Stadium', 'Western Sydney']
  },
  {
    slug: 'blue-mountains-day', cat: 'Nature', img: 'Bush', r: '1 / 1',
    title: 'The Blue Mountains in a day: a fan’s itinerary',
    dek: 'Lookouts, a clifftop walk and a mountain village, by train from Central and back for the evening.',
    body: [
      ['p', 'The World Heritage-listed Blue Mountains are close enough to Sydney for a day trip, and you do not need a car. Here is a simple plan for a free day between matches. Keep it off a match day: you will want the whole day, and an unhurried train home.'],
      ['h', '7:30am: the train from Central'],
      ['p', 'Trains on the Blue Mountains line reach Katoomba in about two hours. Take an early one, bring a jacket, as the mountains are noticeably cooler than the city, and watch the line climb out of the suburbs.'],
      ['h', '9:30am: Echo Point and the Three Sisters'],
      ['p', 'From Katoomba, head to Echo Point for the classic view of the Three Sisters and the Jamison Valley. Early morning is quieter, and the light is at its best.'],
      ['i', 'river-national-park', 'the Jamison Valley from Echo Point'],
      ['h', '10:30am: into the valley'],
      ['p', 'Ride the steep scenic railway down into the rainforest and the skyway across the valley, or take one of the bushwalks into the Jamison Valley. Choose a walk that fits your fitness and your time, and read the bushwalking safety tips before you set off.'],
      ['h', '12:30pm: the clifftops to Leura'],
      ['p', 'Follow the Prince Henry Cliff Walk from Echo Point towards Leura, with lookouts along the way. Leura is a village of gardens, boutiques and cafes, made for a slow lunch, and its gardens are at their best in spring.'],
      ['i', 'city-dining', 'lunch in Leura'],
      ['h', '3:00pm: Art Deco Katoomba, or Glenbrook on the way home'],
      ['p', 'Back in Katoomba, the main streets have Art Deco buildings, bars and breweries for an afternoon drink. If you would rather walk again, break the journey home at Glenbrook, the eastern gateway to the mountains, for its creek waterholes and the walk to Red Hands Cave.'],
      ['h', '5:00pm: back to Sydney'],
      ['p', 'A late-afternoon train has you back in Sydney by early evening. If you are driving instead, allow about 90 minutes each way, and check for changes on the Great Western Highway, including a detour at Victoria Pass, before you go further west.']
    ],
    q: 'Can you see the Blue Mountains in a day from Sydney?',
    answer: 'Yes. You can see the best of the Blue Mountains in a day by train. Leave Central early for Katoomba, about two hours away, see the Three Sisters from Echo Point, walk the clifftops to Leura for lunch and its gardens, and take an afternoon train back to Sydney in time for the evening.',
    facts: [
      ['Getting there', 'About 2 hours by train from Central, or 90 minutes’ drive'],
      ['Main town', 'Katoomba'],
      ['The classic view', 'Echo Point: the Three Sisters and the Jamison Valley'],
      ['Lunch', 'Leura, along the clifftop walk'],
      ['Status', 'World Heritage-listed']
    ],
    faqs: [
      ['Can you do the Blue Mountains in a day from Sydney?', 'Yes. Katoomba is about two hours by train from Central, so you can see Echo Point, walk to Leura and be back in Sydney for the evening without a car.'],
      ['What is the best lookout in the Blue Mountains?', 'Echo Point in Katoomba is the best known, with views of the Three Sisters and the Jamison Valley. Go early in the morning for fewer people.'],
      ['Is it colder in the Blue Mountains than in Sydney?', 'Yes, noticeably, especially in the morning and evening. Bring a warm layer and good walking shoes.']
    ],
    places: ['Blue Mountains', 'Katoomba', 'Echo Point', 'Three Sisters', 'Jamison Valley', 'Leura', 'Prince Henry Cliff Walk', 'Glenbrook', 'Red Hands Cave', 'Central Station']
  }
];

/* Read time from everything on the page that is read (about 200 words a minute, at least one), so the tile matches it */
window.TP_ARTICLES.forEach(function (a) {
  var w = function (t) { return t.split(/\s+/).length; };
  var words = [a.dek, a.q, a.answer].concat(a.body.filter(function (b) { return b[0] !== 'i'; }).map(function (b) { return b[1]; }), a.facts.map(function (f) { return f.join(' '); }),
    a.faqs.map(function (f) { return f.join(' '); })).reduce(function (n, t) { return n + w(t); }, 0);
  a.mins = Math.max(1, Math.round(words / 200));
});
