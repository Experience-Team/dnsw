/* Placeholder product records for the Concepts timeline's product page modal. Prototype data only.
   Fields follow docs/product-data-contract.md and nothing else:
     gap   type (section 1: the contract's product type; shown as a label in the exports)
     live  title, overview, gallery[].alt, address.line, address.suburb (section 1)
     gap   availability.sessions[].datetime (section 4), getting_there.nearest_transport (section 11),
           practical.what_to_bring, .on_site_facilities, .best_time_to_visit (section 14)
   Gap fields render from these fixtures only, with the pink .provenance-gap marker.
   Records for matches the fan has not added to their list are built from concepts-fixtures.js in
   concepts-itinerary.js, with the same shape. Keyed by the list item's data-stop. */
window.cnProducts = {
  'centennial-parklands': {
    type: 'attraction',
    title: 'Centennial Parklands',
    overview: 'A large park close to the city, with ponds, cycle paths and open lawns. Good for a slow morning before a match weekend.',
    gallery: [{ alt: 'Placeholder image of Centennial Parklands' }],
    address: { line: 'Grand Drive', suburb: 'Centennial Park' },
    getting_there: { nearest_transport: [{ mode: 'Bus', name: 'Oxford Street', walking_minutes: 8 }] },
    practical: { what_to_bring: ['Water', 'Sunscreen'], on_site_facilities: ['Toilets', 'Cafe'], best_time_to_visit: 'Early morning' }
  },
  'fan-zone': {
    type: 'event',
    title: 'Fan zone',
    overview: 'Watch matches on the big screens with fans from around the world. Dates to be confirmed.',
    gallery: [{ alt: 'Placeholder image of the fan zone' }],
    address: { line: 'Tumbalong Park', suburb: 'Darling Harbour' },
    getting_there: { nearest_transport: [{ mode: 'Light rail', name: 'Exhibition Centre', walking_minutes: 4 }] },
    practical: { what_to_bring: [], on_site_facilities: ['Food stalls', 'Toilets'], best_time_to_visit: 'Evening, for the late matches' }
  },
  'nz-v-australia': {
    type: 'event',
    title: 'New Zealand v Australia',
    overview: 'Pool A match at Rugby World Cup 2027. Gates open two hours before kick-off.',
    gallery: [{ alt: 'Placeholder image of Stadium Australia' }],
    address: { line: 'Stadium Australia', suburb: 'Sydney Olympic Park' },
    availability: { kind: 'event_dates', sessions: [{ datetime: '2027-10-09T17:10:00+11:00' }] },
    getting_there: { nearest_transport: [{ mode: 'Train', name: 'Olympic Park', walking_minutes: 10 }] },
    practical: { what_to_bring: ['Your ticket on your phone', 'A clear bag'], on_site_facilities: ['Food and drink', 'Accessible seating'], best_time_to_visit: null }
  },
  'patonga-beach': {
    type: 'attraction',
    title: 'Patonga Beach',
    overview: 'A quiet beach on the way north, where the Hawkesbury River meets Broken Bay. A hidden gem.',
    gallery: [{ alt: 'Placeholder image of Patonga Beach' }],
    address: { line: 'Patonga Drive', suburb: 'Patonga' },
    getting_there: { nearest_transport: [] },
    practical: { what_to_bring: ['Swimmers', 'Towel'], on_site_facilities: ['Toilets'], best_time_to_visit: 'Lunchtime, at low tide' }
  },
  'newcastle-ocean-baths': {
    type: 'attraction',
    title: 'Newcastle Ocean Baths',
    overview: 'Heritage ocean pools on the edge of Newcastle East, free to swim in.',
    gallery: [{ alt: 'Placeholder image of Newcastle Ocean Baths' }],
    address: { line: 'Shortland Esplanade', suburb: 'Newcastle East' },
    getting_there: { nearest_transport: [{ mode: 'Light rail', name: 'Newcastle Beach', walking_minutes: 6 }] },
    practical: { what_to_bring: ['Swimmers'], on_site_facilities: ['Change rooms'], best_time_to_visit: null }
  }
};

/* One label per stop for every export (AI prompt, Group chat, Spreadsheet), so a place has the same type everywhere.
   A match is labelled Match; anything else uses its contract type. */
window.cnStopType = function (id, name) {
  if (/ v /.test(name || '')) return 'Match';
  var r = window.cnProducts[id], t = r && r.type;
  return t ? t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ') : 'Place';
};
// "Grand Drive, Centennial Park NSW": the record's address, or an empty string when there is none
window.cnStopAddress = function (id) {
  var a = window.cnProducts[id] && window.cnProducts[id].address;
  return a ? [a.line, a.suburb ? a.suburb + ' NSW' : ''].filter(Boolean).join(', ') : '';
};
