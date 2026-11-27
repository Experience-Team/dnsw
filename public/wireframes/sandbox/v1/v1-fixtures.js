/* Version 1's fixtures fix (26 Nov 2026). Two later-round kick-offs in concepts-fixtures.js (shared, not edited) are in UTC,
   not Sydney time: Semi-final 1 9:00am is 8:00pm and the Bronze Final 8:45am is 7:45pm on the Sydney clock (AEDT, UTC+11).
   This corrects them in place on this page only, before anything reads them. The shared fixtures, Version 2, the sandbox
   and the Rugby World Cup pages still carry the UTC times. Every other fixture is between 12:15pm and 9:30pm. */
(function () {
  'use strict';
  var FIX = window.cnFixtures; if (!FIX) return;
  var FIXES = [
    { d: 'Fri 5 Nov', s: 'Semi-final 1', was: '9:00am', k: '8:00pm' },
    { d: 'Fri 12 Nov', s: 'Bronze Final', was: '8:45am', k: '7:45pm' }
  ];
  FIXES.forEach(function (x) {
    var f = FIX.filter(function (m) { return m.d === x.d && m.s === x.s; })[0];
    // Only the known wrong value is changed: if the shared list has moved on, nothing is touched and the console says so
    if (f && f.k === x.was) f.k = x.k;
    else if (window.console) console.warn('v1-fixtures.js: ' + x.s + ' (' + x.d + ') is not ' + x.was + ' any more; left as it is');
  });
})();
