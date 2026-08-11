// Live fixture — Disney's The Lion King (event).
//
// Source: sydney.com's Lion King event page. No saved HTML export of this
// exact page was ever obtained in this session (every HTML file supplied
// for it turned out to be a different page); the copy below comes from a
// Figma screenshot of the real page plus the exact Overview text the user
// pasted directly. Everything not explicitly confirmed by one of those two
// sources is null — see the inline notes.
//
// Only fields marked `live` in docs/product-data-contract.md are populated.
// Every field marked `gap` is null, not filled with a plausible guess.

import type { EventProduct } from '../types/product';

export const lionKingLive: EventProduct = {
  id: 'disneys-the-lion-king',
  type: 'event',
  title: "Disney's The Lion King",
  overview:
    "Disney's The Lion King is is now playing at the Capitol Theatre!\n\n" +
    'Prepare for a spectacle far beyond your imagination as you follow the powerful story of Simba as he journeys from wide-eyed cub to his destined role as King of the Pridelands.\n\n' +
    "Seen by over 124 million people worldwide, this landmark musical combines breathtaking visual artistry, unforgettable music, and a deeply moving story that has captured hearts across generations.\n\n" +
    'Winner of six Tony Awards® including Best Musical, this is a spectacular theatrical experience you will never forget.',

  // `highlights` is absent on events per the contract ("Absent on events only").
  highlights: null,

  // No real image URLs were ever captured — the wireframe only recorded a
  // "5 photos" count against gray placeholders.
  gallery: [],

  address: {
    // The real page shows the venue name "Capitol Theatre" ahead of the
    // street address. The contract's shared record has no field for a venue
    // name today (see §3, place_ref — a nullable `venue` object is proposed
    // but not confirmed). Not invented here; line holds the street address only.
    line: '13 Campbell St',
    suburb: 'Haymarket',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    geo: null,
  },

  // Never confirmed for this record.
  contact: { phone: null, email: null },

  // The real page shows Facebook and Instagram icons in the sidebar, but no
  // destination URL was ever captured for either — an empty array is more
  // honest than a platform entry with an invented url.
  socials: [],

  // Both "Booking details" and "Visit website" buttons are visible on the
  // real page; neither URL was captured.
  links: { booking: null, website: null },

  // No accessibility copy for this record was ever sourced — the FAQ answer
  // used earlier in the wireframe build was an acknowledged placeholder, not
  // extracted text, and is not reused here.
  accessibility: { status: 'not_stated', features: [], detail: null, operator_access_url: null },

  // Gap on every type (contract §4). The real page does carry a raw start
  // date, end date and a "DAILY event" display string outside this schema,
  // but the structured `availability` block itself has no live data today.
  availability: null,

  // Gap on every type (contract §5).
  pricing: null,

  // Every audited page's FAQ block holds no actual questions — accessibility
  // occupies the slot instead. Confirmed empty, not unknown.
  faqs: [],

  place_ref: null,
  operator_ref: null,
  parent_ref: null,
  last_verified: null,

  // Empty for every type today (contract §6).
  extension: null,
};
