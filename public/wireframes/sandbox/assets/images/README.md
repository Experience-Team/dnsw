# High fidelity images

Pictures for the high fidelity version of the prototype (`prototype-pick-your-team.html`).
They show only when the **High fidelity** switch is on, or the page is opened with `?theme=hifi`. The wireframe keeps
its grey blocks.

## Adding a picture

1. Name the file after its placeholder, from the lists below, ending in `.webp` (preferred, smaller) or `.jpg`. For
   example `brickpit-ring-walk.webp`. Or keep your own name and add an alias (below).
2. Upload it to this folder (`public/wireframes/assets/images/`). On GitHub: open the folder, then **Add file > Upload
   files**, and commit to a branch.
3. That's all: the placeholder picks it up by name. A picture that isn't here yet leaves the grey block.

**Size:** landscape, about 1200 x 800px, under 300KB. Pictures are cropped to fill their space (`cover`, centred), so
keep the subject near the middle.

**Rights:** only pictures DNSW may use (its own library or licensed stock). Note the source and licence in the commit.

**Names come from the titles.** A placeholder's name is its title in lower case, accents dropped, anything that isn't
a letter or number turned into a hyphen. If a title in the fixtures changes, its file name changes with it.

## Aliases: which picture each placeholder shows

`IMG_ALIAS`, near the top of `public/wireframes/pv-device.js`, maps a placeholder name to a picture file (no
extension). It covers pictures saved under their own name, and, until the right picture exists, the **closest match**
from what is in this folder. Adding a file named after the placeholder (for example `bathers-way.webp`) and deleting its
line in `IMG_ALIAS` shows the real picture instead.

**Files used as stand-ins** (web-sized copies; the uploads they come from are kept as they are):

| File | From | Shows |
|---|---|---|
| `city-dining.webp` | `ivy-rooftop.jpg` | A busy city courtyard bar and restaurant |
| `coast-headland.webp` | `kathleen-banks-0h2KOlfkGck-unsplash.jpg` (Unsplash) | A forested headland and surf at sunset |
| `coast-aerial.webp` | `NSW hero image.png` | Turquoise water and reef from above |
| `river-national-park.webp` | `1004780_Southern_Cross_Kayaking_Wollemi_National_Park_DNSW.webp` (DNSW) | Kayaking a river in Wollemi National Park |
| `village.jpg` | | An outdoor big-screen crowd at night |
| `hero-stadium.webp` | Figma | A full stadium under lights |
| `white-rabbit-gallery.jpg` | upload 16 Nov | White Rabbit Gallery (its own picture); also galleries and museums with made-up names |
| `Kiama.webp` | upload 16 Nov (DNSW) | Kiama Blowhole (its own picture); also some made-up coast and swim spots |
| `Tanja_Lagoon_Camp_interior_view_tent.webp` | upload 16 Nov (DNSW) | South Coast, 3 nights (Tanja is on the South Coast); also made-up overnight stays |
| `172783_Audrey_Wilkinson_Pokolbin_DNSW_DT_0.webp` | upload 16 Nov (DNSW) | Hunter Valley, 2 nights (a Pokolbin vineyard); also made-up wineries |
| `hunter.webp` | upload 16 Nov | Pokolbin cellar doors (wine and cheese); also made-up cellar doors |
| `krinklewood-vineyard.webp` | `180274 - Krinklewood Vineyard … Credit Nikki To.webp` (DNSW, 1200px web copy) | Hunter Valley Gardens; also made-up vineyards |
| `1004868_Basalt_Luxury_Accomodation_Canobolas.webp` | upload 16 Nov (DNSW) | Barrington Tops overnight (stand-in: a country stay near Orange) |
| `23090deb477ebe636f2ddbd27480b6bb.webp` | upload 16 Nov | Not used yet: an Aboriginal cultural experience. Waiting to be told which experience it shows, so it is not used as a stand-in for unrelated places |

Version 2's hero (the full-bleed picture at the top of Home) shows `village.jpg`, not `hero-stadium.webp`, since 26 Nov 2026: the stadium
picture is 728px wide and was stretched up to 1,905px. `village.jpg` is only 1,024px, so it too is a stand-in; a wide (2.5:1), sharp
picture of at least 2,000px would replace it with one attribute (`data-img` on `.tp-home-video` in the Version 2 page).

Where a kind of place has several pictures (vineyards, coast, overnight stays, harbour), `IMG_GUESS` in `pv-device.js`
picks one by the place's name, the same every time, so neighbouring cards rarely share a picture.

**Which picture each placeholder shows (since 25 Nov 2026):** the list of record is `IMG_ALIAS` in
`public/wireframes/pv-device.js`, set out by the list each thumbnail shows in (Home, Around your matches, Where to
watch, trips, stops, free-day ideas, places on the map, stadiums). The rule: a picture belongs to one place, and the
same place keeps its picture wherever it shows. Where there are not enough pictures, places of the same kind share
one, and a list repeats a picture only when its kind has run out.

Added on 25 Nov: 30 pictures named `sydneycom_<article>_<n>` (from sydney.com articles), and `deli`, `gallery`,
`gallery2`, `manly-ferry`, `rugby-2`, `rugby-match-1` and `sculpture`. Each new file is also listed in `IMG_FILES` in
the same script, with its file type; a file not listed there is never requested.

- **Not used yet:** `sydneycom_new-sydney-and-nsw-hotels_1` and `_3`, `sydneycom_tv-and-film-locations-in-sydney-and-nsw_3`
  (the Parkes dish), `sculpture` (a desert sculpture), and `23090deb477ebe636f2ddbd27480b6bb` (see above).
- **Licence to confirm:** `rugby-2` and `rugby-match-1` look like Rugby World Cup 2023 press photos.
- **Still sharing a picture:** the eight named stadiums (one stadium photo), most pubs and clubs in Where to watch,
  coast towns among the free-day ideas, and some trip stops and map places. Pictures most wanted: stadiums, pub and
  club exteriors, beaches, a museum interior, fans on a train or walking to a ground.
- **Version 2's game** names its pictures in `v2/drop-goal/places.js` (`image:`), not here. A place with `image: null`
  shows its poster.


`ivy-rooftop.jpg` is the same photo as `city-dining.webp`, so cafés have only two real pictures between them (city dining and Marrickville Tavern). A few more café or bakery photos would cut the repeats most.

**Real places still without a picture of their own (16 Nov).** Each shows a stand-in until its picture is added:

- Around your matches: Armory Wharf Cafe, Brickpit Ring Walk, Waterview in Bicentennial Park, Bourke Street Bakery, Entertainment Quarter, Darby Street cafés, Bathers Way, Beaumont Street bars.
- Free-day ideas: Manly ferry, Bondi to Coogee walk, Sydney Opera House, The Rocks.
- Curated trips: Blue Mountains day out, Royal National Park coast walk, Port Stephens bay day, Lake Macquarie by bike, Barrington Tops overnight.
- Trip stops: Echo Point lookout, Prince Henry Cliff Walk, Leura Mall cafés, The Coast Track, Bundeena village cafés, Nelson Bay dolphin cruise, Stockton Bight sand dunes tour, Shoal Bay beach, Warners Bay bike hire, Speers Point Park, Hunter Valley balloon flight, Kiama Coast Walk, Jervis Bay whale-watching cruise, Barrington Tops rainforest walk, Gloucester country pub.
- Where to watch: Darling Harbour fan zone, Rugby village, Foreshore Park.
- Itinerary prototype: Centennial Parklands, Patonga Beach, Newcastle Ocean Baths.
- Stadiums: Stadium Australia, Sydney Football Stadium and Newcastle Stadium share one stadium photo.

Places with made-up names (the map's places near the stadiums, most free-day ideas, the screening venues) keep
stand-ins on purpose: there is no real place to photograph.

**Kinds of picture still missing** (each placeholder above marked "stand-in" needs its own):

- **Cafés, bakeries and food:** Armory Wharf Cafe, Bourke Street Bakery, Darby Street cafés, Leura Mall cafés,
  Bundeena village cafés, Waterview in Bicentennial Park. All show the city courtyard bar.
- **Culture and indoor venues:** White Rabbit Gallery, Entertainment Quarter.
- **Small bars and country pubs:** Beaumont Street bars (shows Marrickville Tavern), Gloucester country pub (shows the
  Lord Nelson).
- **Wine country:** Hunter Valley, Pokolbin cellar doors, Hunter Valley Gardens, balloon flight. Shown with the bar or
  the national park river.
- **Mountains, lookouts and bush walks:** Blue Mountains, Echo Point, Prince Henry Cliff Walk, Barrington Tops, Brickpit
  Ring Walk. All show the Wollemi river.
- **Lakes, parks and cycling:** Lake Macquarie, Warners Bay, Speers Point Park, Centennial Parklands. Also the river.
- **Beaches, bays and cruises:** Port Stephens, Nelson Bay dolphins, Jervis Bay whales, Shoal Bay, Stockton dunes,
  Newcastle Ocean Baths, Patonga Beach. Shown with the aerial reef or the headland.
- **Coastal walks:** Bathers Way, the Coast Track, Kiama. Shown with the headland, which is close.
- **A daytime fan zone:** the Darling Harbour fan zone shares the village's night-time screening.

**Rights:** `ivy-rooftop.jpg` and the pub pictures show real businesses, and the stand-ins put one venue's picture on
another's listing. Fine for a prototype; check the source and licence of each upload before anything is shared outside.

The tables below list each placeholder's name; a file with that name (`.webp` or `.jpg`) needs no alias.

## Pick your team: hero

| Name (add .webp or .jpg) | Shows |
|---|---|
| `hero-stadium` | The stadium picture above the headline (in the repo, from Figma node 309:644) |
| `hero-coast` | The coastal picture below the button: a headland at sunset, cropped from `kathleen-banks-0h2KOlfkGck-unsplash.jpg` (Unsplash; confirm DNSW may use it). It replaced the Figma road picture |

`tth-logo.webp` is The Third Half logo in the hero header (from the same Figma node). It's an `<img>`, shown in high
fidelity only, not a placeholder.

## Your 3rd half: places and products

Cards under each match day, and the sheet each one opens.

| Name (add .webp or .jpg) | Shows |
|---|---|
| `armory-wharf-cafe` | Armory Wharf Cafe |
| `bathers-way` | Bathers Way |
| `beaumont-street-bars` | Beaumont Street bars |
| `bourke-street-bakery` | Bourke Street Bakery |
| `brickpit-ring-walk` | Brickpit Ring Walk |
| `darby-street-cafes` | Darby Street cafés |
| `entertainment-quarter` | Entertainment Quarter |
| `waterview-in-bicentennial-park` | Waterview in Bicentennial Park |
| `white-rabbit-gallery` | White Rabbit Gallery |

## Your 3rd half: trips

Day and longer trip cards, and their sheets.

| Name (add .webp or .jpg) | Shows |
|---|---|
| `barrington-tops-overnight` | Barrington Tops overnight |
| `blue-mountains-day-out` | Blue Mountains day out |
| `hunter-valley-2-nights` | Hunter Valley, 2 nights |
| `lake-macquarie-by-bike` | Lake Macquarie by bike |
| `port-stephens-bay-day` | Port Stephens bay day |
| `royal-national-park-coast-walk` | Royal National Park coast walk |
| `south-coast-3-nights` | South Coast, 3 nights |

## Your 3rd half: trip stops

The stops listed inside a trip's sheet.

| Name (add .webp or .jpg) | Shows |
|---|---|
| `barrington-tops-rainforest-walk` | Barrington Tops rainforest walk |
| `bundeena-village-cafes` | Bundeena village cafés |
| `echo-point-lookout` | Echo Point lookout |
| `gloucester-country-pub` | Gloucester country pub |
| `hunter-valley-balloon-flight` | Hunter Valley balloon flight |
| `hunter-valley-gardens` | Hunter Valley Gardens |
| `jervis-bay-whale-watching-cruise` | Jervis Bay whale-watching cruise |
| `kiama-blowhole` | Kiama Blowhole |
| `kiama-coast-walk` | Kiama Coast Walk |
| `leura-mall-cafes` | Leura Mall cafés |
| `nelson-bay-dolphin-cruise` | Nelson Bay dolphin cruise |
| `pokolbin-cellar-doors` | Pokolbin cellar doors |
| `prince-henry-cliff-walk` | Prince Henry Cliff Walk |
| `shoal-bay-beach` | Shoal Bay beach |
| `speers-point-park` | Speers Point Park |
| `stockton-bight-sand-dunes-tour` | Stockton Bight sand dunes tour |
| `the-coast-track` | The Coast Track |
| `warners-bay-bike-hire` | Warners Bay bike hire |

## Where to watch

The portrait cards in Where to watch, and the sheet each one opens.

| Name (add .webp or .jpg) | Shows |
|---|---|
| `darling-harbour-fan-zone` | Darling Harbour fan zone |
| `golden-barley-hotel` | Golden Barley Hotel |
| `lord-nelson-brewery-hotel` | Lord Nelson Brewery Hotel |
| `marrickville-tavern` | Marrickville Tavern |
| `rugby-village-foreshore-park` | Rugby village, Foreshore Park |

## Share/edit itinerary

The thumbnails in the itinerary list, and the sheet each one opens.

| Name (add .webp or .jpg) | Shows |
|---|---|
| `centennial-parklands` | Centennial Parklands |
| `fan-zone` | Fan zone |
| `newcastle-ocean-baths` | Newcastle Ocean Baths |
| `nz-v-australia` | New Zealand v Australia |
| `patonga-beach` | Patonga Beach |
