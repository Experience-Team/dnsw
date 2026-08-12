// Live fixture — Mother Chu's Taiwanese Gourmet (food_and_drink).
//
// Source: full saved-HTML export of the real sydney.com page, parsed
// directly for this fixture. Only fields marked `live` in
// docs/product-data-contract.md are populated; every field marked `gap`
// is null, not filled with a plausible guess.

import type { FoodAndDrinkProduct } from '../types/product';

export const motherChusLive: FoodAndDrinkProduct = {
  id: 'mother-chus-taiwanese-gourmet',
  type: 'food_and_drink',
  title: "Mother Chu's Taiwanese Gourmet",
  overview:
    "Mother Chu's Taiwanese Gourmet offers a range of traditional Taiwanese delicacies, ranging from street food staples to snacks, buns and dumplings. Begin with one of the traditional drinks, perhaps hot soy bean milk, sour plum juice or homemade iced green tea. Then dive into the street eats including youtiao (fried bread sticks), shallot pancakes and baked sesame flatbread.\n\n" +
    "Taiwanese cuisine is big on steamed buns dumplings, and Mother Chu's does not disappoint. There are more than a dozen varieties to choose from, ranging from the classic barbecued pork steamed bun to pork-and-prawn dim sims, vegetarian dumplings and steamed soup buns. Speciality side dishes are a must, and include a delicate cloud ear fungus salad, soy marinated eggs and omelette with salted and dried radish.",

  highlights: {
    items: [
      'Authentic Taiwanese street food and traditional delicacies',
      'Wide variety of steamed buns and dumplings to suit all tastes',
      'Unique drinks like hot soy milk and homemade iced green tea',
    ],
    provenance: 'generated',
    generated_at: null,
  },

  // The export confirms "4 photos" but carries no real asset URLs.
  gallery: [],

  address: {
    line: '1/84-88 Dixon Street',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: null,
  },

  // Confirmed: a phone number exists, no email link is present on this page.
  contact: { phone: '(02) 9211 0288', email: null },

  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/MyChuMama/' },
    { platform: 'instagram', url: 'https://www.instagram.com/mychumama/' },
  ],

  links: {
    // Confirmed absent on this record — matches the contract's note that
    // `links.booking` is optional and absent on Mother Chu's specifically.
    booking: null,
    website: 'https://mychumama.com/',
  },

  accessibility: {
    status: 'does_not_cater',
    detail: 'Does not cater for people with access needs.',
    features: [],
    operator_access_url: null,
  },

  venue_facilities: null,
  availability: null,
  pricing: null,
  trust: null,
  getting_there: null,
  live_availability: null,
  suitability: null,
  practical: null,
  faqs: [],

  place_ref: null,
  operator_ref: null,
  parent_ref: null,
  last_verified: null,

  extension: null,
};
