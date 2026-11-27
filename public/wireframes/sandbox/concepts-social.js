/* Sydney on social (25 Nov 2026): fixtures for Version 1 and Version 2's Sydney on social module. Data only, read only
   by both (like concepts-fixtures.js); nothing here runs. Every field is a gap field (docs/product-data-contract.md §21)
   and none exists in live data, so all of it is invented sample content: the accounts, handles, links, pictures,
   captions and dates. Pictures are stand-ins from assets/images/. Links are placeholders until the accounts are
   confirmed. Empty states (no accounts, no stories, no posts) are in each version's module script. */
window.cnSocial = {
  accounts: [
    // 27 Nov 2026 (sandbox): the same addresses as the footer's Instagram and TikTok links
    { id: 'ig', platform: 'instagram', name: 'Sydney', handle: '@sydney', url: 'https://instagram.com/sydney' },
    { id: 'tt', platform: 'tiktok', name: 'Sydney', handle: '@sydney', url: 'https://tiktok.com/@sydney' }
  ],
  stories: [
    { id: 's-ig-1', account: 'ig', image: 'assets/images/coast-aerial.webp', caption: 'Ocean pools at sunrise: the best way to start a match day.' },
    { id: 's-ig-2', account: 'ig', image: 'assets/images/manly-ferry.jpeg', caption: 'Take the ferry the long way round to the footy.' },
    { id: 's-ig-3', account: 'ig', image: 'assets/images/rugby-match-1.jpeg', caption: 'The roar of the crowd. Counting down to 1 October 2027.' },
    { id: 's-ig-4', account: 'ig', image: 'assets/images/deli.jpg', caption: 'Pre-match pies and pastries, the locals’ way.' },
    { id: 's-tt-1', account: 'tt', image: 'assets/images/ivy-rooftop.jpg', caption: 'Rooftop views before kick-off.' },
    { id: 's-tt-2', account: 'tt', image: 'assets/images/lord-nelson.webp', caption: 'A cold one with a view, near the stadium.' }
  ],
  posts: [
    { id: 'p-ig-1', account: 'ig', image: 'assets/images/Merwether baths.jpg', caption: 'Newcastle’s ocean baths, a short stroll from the stadium.', posted: '2026-11-21', url: null },
    { id: 'p-tt-1', account: 'tt', image: 'assets/images/city-dining.webp', caption: 'Where Sydney eats before kick-off.', posted: '2026-11-19', url: null },
    { id: 'p-ig-2', account: 'ig', image: 'assets/images/rugby-2.jpeg', caption: 'Fans in full voice. This is what the third half looks like.', posted: '2026-11-17', url: null },
    { id: 'p-ig-3', account: 'ig', image: 'assets/images/gallery.webp', caption: 'Art stops between matches: a gallery for a rainy afternoon.', posted: '2026-11-14', url: null },
    { id: 'p-tt-2', account: 'tt', image: 'assets/images/sydneycom_guide-to-western-sydney-nightlife_1.jpg', caption: 'After dark in the west.', posted: '2026-11-12', url: null },
    { id: 'p-ig-4', account: 'ig', image: 'assets/images/marickville-tavern.webp', caption: 'A Marrickville pub crawl, planned around the match.', posted: '2026-11-09', url: null }
  ]
};
