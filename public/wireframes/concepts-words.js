/* Visitor-facing wording added or changed on 21 Nov (stage A to D of the round 3 fixes), in one place so it can be
   approved or changed here and nowhere else. Every entry is a placeholder the user has still to approve.
   Code and the fixtures' own field names keep their old words (pool, knockout). The kick game is called Drop goal, shown as
   Play on phones (22 Nov); the annotations and handover use that wording.
   Approved 21 Nov: Group A to F, later-round matches in counts, Play in the kick-game lines (since 22 Nov they say Drop goal, the name), Image of for stand-in photos. */
window.TP_WORDS = {
  // A1: the way back to the plan, on the plan bar (F-046)
  planLabel: 'Your plan',
  planLabelCount: function (n) { return 'Your plan (' + n + ')'; },
  // A2: a kick-off time the fixtures do not hold yet (F-052)
  timeTbc: 'Check the official timetable',
  // A2: visitor-facing names for the stages (F-052); the fixtures keep pool and knockout
  groupMatches: 'group matches', groupMatch: 'group match',
  laterRounds: 'the later rounds',
  // The kick game's name, Drop goal (22 Nov, user's call), for screen readers: the tab's section, the game's frame, Home's still
  dropGoal: 'Drop goal',
  // A3 (F-034): its short label on phones, in the capsule and the two headings (the tab's own and Home's section)
  play: 'Play',
  // The desktop website (21 and 22 Nov, user's calls): the capsule says Play Drop Goal and the two headings Drop Goal
  playDesktop: 'Play Drop Goal',
  dropGoalTitle: 'Drop Goal',
  // A2 follow-up (21 Nov): the number forms of the later rounds
  laterRoundMatches: function (shown, n) { return shown + (n === 1 ? ' later-round match' : ' later-round matches'); },
  // A2 follow-up: the fixtures' Pool A to F, shown as Group A to F
  groupName: function (s) { return String(s).replace(/\bPool ([A-F])\b/g, 'Group $1').replace(/\bthe pools finish\b/g, 'the groups finish'); },
  // A2 follow-up: what screen readers hear for a stand-in photo
  imageOf: function (s) { return 'Image of ' + s; },
  kickStill: 'A still from the Drop goal game',
  // B2 (F-053): what setting days does, above the dates on the page, in the plan and in the days sheet
  setDaysWhy: 'Set your days to see ideas for the rest of your trip.',
  setDaysWhyNoTeam: 'Set your days to see ideas for your time in NSW.', // Option B (23 Nov): Your days under the hand before a team is picked
  // B3 (F-051): the plan's card under the last match day while no days are set
  stayAfter: 'Staying after your last match?',
  setDays: 'Set your days',
  // Stage C (F-029): the match-day group for whoever is not at the game, and the tag on its places
  notGoing: 'Not going to the match?',
  eveningTag: 'Evening',
  // Stage D (F-048): a day whose matches are all interstate, on its card and in the strip's screen reader label
  awayLine: function (cities) { return 'Away from NSW: ' + cities.join(', '); },
  awaySay: function (cities) { return 'away from NSW, ' + (cities.length < 2 ? cities.join('') : cities.slice(0, -1).join(', ') + ' and ' + cities[cities.length - 1]); },
  // Stage D: the count, with days set and none of the NSW matches inside them; and the number of teams (two or more)
  noneInDays: 'none in your days',
  teamsCount: function (n) { return n + ' teams'; },
  // E3 (22 Nov): the plan's one line for days while none are set; its button is setDays (Set your days)
  planDaysUnset: 'Your days in NSW: not set.',
  // E2: the ideas sheet's line for an arrival or last day (only half-day ideas are offered)
  arrivalDay: 'Arrival day', lastDay: 'Last day',
  // 22 Nov, real destinations (§19): a free-day idea whose town page gives no travel time from that city
  gettingTbc: 'Getting there to be confirmed'
};

/* Pool A to F come from the fixtures (team records, match names such as 2nd Pool C v 2nd Pool F), which are also used
   as keys, so the swap is made on what the phone shows: its text and its screen reader names, never on data or ids. */
(function () {
  var W = window.TP_WORDS, RX = /\bPool [A-F]\b|\bthe pools finish\b/;
  function fix(root) {
    if (!root) return;
    if (root.nodeType === 3) { if (RX.test(root.nodeValue)) root.nodeValue = W.groupName(root.nodeValue); return; }
    if (root.nodeType !== 1) return;
    if (root.hasAttribute('aria-label') && RX.test(root.getAttribute('aria-label'))) root.setAttribute('aria-label', W.groupName(root.getAttribute('aria-label')));
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT), n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) { if (RX.test(n.nodeValue)) n.nodeValue = W.groupName(n.nodeValue); }
      else if (n.hasAttribute('aria-label') && RX.test(n.getAttribute('aria-label'))) n.setAttribute('aria-label', W.groupName(n.getAttribute('aria-label')));
    }
  }
  function start() {
    var ph = document.getElementById('tp-phone'); if (!ph) return;
    fix(ph);
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === 'characterData') fix(m.target);
        else if (m.type === 'attributes') fix(m.target);
        else m.addedNodes.forEach(fix);
      });
    }).observe(ph, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
