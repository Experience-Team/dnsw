/* Version 1's places (26 Nov 2026). Moore Park is a place to stay (Around Moore Park on the where-you're-staying question)
   with the coordinates of the Sydney Football Stadium, which sits in it. cnGeo (concepts-geo.js) is shared and is not edited:
   this adds the one place to this page's copy of it, before anything reads it. Sydney Olympic Park is already in cnGeo.places. */
(function () {
  'use strict';
  var G = window.cnGeo; if (!G || !G.places || !G.venues) return;
  if (!G.places['Moore Park'] && G.venues['Sydney Football Stadium']) G.places['Moore Park'] = G.venues['Sydney Football Stadium'].slice();
})();
