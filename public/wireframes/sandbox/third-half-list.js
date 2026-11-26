// Plan your 3rd half: the fan's list of things to do around their match, kept with their team.
//
// Stored in localStorage under 'rwc-3rd-half' as { team, items }. If storage isn't available
// (private browsing, blocked storage, full quota) the list lives in memory for this page visit
// and nothing throws.
//
// API on window.thirdHalfList:
//   addItem(item)    add one item; false if it has no id or is already there
//   removeItem(id)   remove by id; false if it wasn't there
//   toggleItem(item) add if missing, remove if there; returns true when it's now in the list
//   hasItem(id)      true if the item is in the list
//   getItems()       copies of the items, in the order they were added
//   clearItems()     empty the list
//   count()          number of items
//   getTeam()        the team chosen on the page, or null
//
// Item fields: id, name, type, area, address, distanceToStadium, url, section. Other keys are dropped.
//
// Every change fires 'thirdhalf:change' on document, with detail
// { action: 'add' | 'remove' | 'clear' | 'sync', item, items, count, team }.
// 'sync' is the list changing in another tab.
// The team: the page's 'teamchange' event saves it alongside the list (unless detail.save is false,
// as for a ?team= preview), and the page reads it back with getTeam() on load. The list itself is
// kept when the team changes or is cleared.
(function () {
  var KEY = 'rwc-3rd-half';
  var FIELDS = ['id', 'name', 'type', 'area', 'address', 'distanceToStadium', 'url', 'section'];

  var storage = (function () {
    try {
      var probe = '__rwc-3rd-half-test';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return window.localStorage;
    } catch (e) {
      return null;
    }
  })();

  function clean(item) {
    if (!item || item.id === undefined || item.id === null || item.id === '') return null;
    var out = {};
    FIELDS.forEach(function (f) { out[f] = item[f] === undefined || item[f] === null ? '' : String(item[f]); });
    return out;
  }

  function load() {
    if (!storage) return { team: null, items: [] };
    try {
      var saved = JSON.parse(storage.getItem(KEY));
      if (saved && Array.isArray(saved.items)) {
        return { team: saved.team || null, items: saved.items.map(clean).filter(Boolean) };
      }
    } catch (e) {}
    return { team: null, items: [] };
  }

  var state = load();

  function save() {
    if (!storage) return;
    try {
      storage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      storage = null; // stop trying; the list carries on in memory
    }
  }

  function indexOf(id) {
    id = String(id);
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return i;
    return -1;
  }

  function getItems() {
    return state.items.map(function (it) { return Object.assign({}, it); });
  }

  function emit(action, item) {
    document.dispatchEvent(new CustomEvent('thirdhalf:change', {
      detail: { action: action, item: item ? Object.assign({}, item) : null, items: getItems(), count: state.items.length, team: state.team }
    }));
  }

  function addItem(item) {
    var it = clean(item);
    if (!it || indexOf(it.id) > -1) return false;
    state.items.push(it);
    save();
    emit('add', it);
    return true;
  }

  function removeItem(id) {
    if (id === undefined || id === null) return false;
    var i = indexOf(id);
    if (i === -1) return false;
    var removed = state.items.splice(i, 1)[0];
    save();
    emit('remove', removed);
    return true;
  }

  function toggleItem(item) {
    if (!item || item.id === undefined || item.id === null || item.id === '') return false;
    if (indexOf(item.id) > -1) { removeItem(item.id); return false; }
    return addItem(item);
  }

  function hasItem(id) {
    return id !== undefined && id !== null && indexOf(id) > -1;
  }

  function clearItems() {
    if (!state.items.length) return;
    state.items = [];
    save();
    emit('clear', null);
  }

  // Keep the chosen team with the list (not a list change, so no event). Previews aren't saved.
  document.addEventListener('teamchange', function (e) {
    if (e.detail && e.detail.save === false) return;
    state.team = (e.detail && e.detail.team) || null;
    save();
  });

  // Another tab changed the list
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY || !storage) return;
    state = load();
    emit('sync', null);
  });

  window.thirdHalfList = {
    addItem: addItem,
    removeItem: removeItem,
    toggleItem: toggleItem,
    hasItem: hasItem,
    getItems: getItems,
    clearItems: clearItems,
    count: function () { return state.items.length; },
    getTeam: function () { return state.team; }
  };
})();
