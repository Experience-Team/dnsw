// The result card's two heights on a phone (22 Nov). Where the card is a bottom sheet it opens at full height. Dragging
// the grabber or the card's head down shrinks it to a short card (the place, Add to your plan and the action bar) so the
// landing shows on the pitch above; dragging further, or a flick down, closes it. From the short card, a drag or flick
// up brings back the full card. A tap on the grabber switches between the two heights. A short drag springs back.
// Elsewhere (the landscape side panel, the desktop) the card has one height and none of this applies.
// openCard and closeCard are game.js globals: wrapped here, not changed (js/plan-link.js wraps them again after this).
(function () {
  const card = $("card"), grab = $("cardGrab");
  const sheetMQ = matchMedia("(max-width: 760px)"), sideMQ = matchMedia("(min-width: 600px) and (max-height: 560px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const isSheet = () => sheetMQ.matches && !sideMQ.matches;
  const EASE = "transform .32s cubic-bezier(.25,.8,.3,1)";

  function label() {
    const short = card.classList.contains("is-short");
    grab.setAttribute("aria-expanded", String(!short));
    grab.setAttribute("aria-label", short ? "Show more" : "Show less");
  }
  // Change height while keeping the card's top edge where it is now, then let it glide to its new resting place
  function setShort(short, fromY) {
    const top0 = card.getBoundingClientRect().top;
    card.classList.add("dragging");
    card.style.transform = "";
    card.classList.toggle("is-short", short);
    label();
    if (!short) card.querySelector(".card-inner").scrollTop = 0;
    const top1 = card.getBoundingClientRect().top, dy = top0 - top1;
    if (reduce.matches || Math.abs(dy) < 1) { card.classList.remove("dragging"); return; }
    card.style.transform = `translateY(${dy}px)`;
    card.getBoundingClientRect();
    card.classList.remove("dragging");
    card.style.transition = EASE;
    card.style.transform = "";
    setTimeout(() => { card.style.transition = ""; }, 340);
  }
  function springBack() {
    card.classList.remove("dragging");
    if (reduce.matches) { card.style.transform = ""; return; }
    card.style.transition = EASE; card.style.transform = "";
    setTimeout(() => { card.style.transition = ""; }, 340);
  }
  function close() { card.classList.remove("dragging"); card.style.transition = ""; card.style.transform = ""; closeCard(); }

  // Dragging. A press on the grabber or the card's head (not a button) follows the finger; on release it settles
  let drag = null, dragged = false;
  card.addEventListener("pointerdown", e => {
    if (!isSheet() || card.hidden || e.button > 0) return;
    const onGrab = grab.contains(e.target);
    if (!onGrab && (e.target.closest("button, a, input") || !e.target.closest(".kicker, .card h2"))) return;
    drag = { id: e.pointerId, y0: e.clientY, y: e.clientY, t: performance.now(), v: 0, moved: false, onGrab,
             h: card.offsetHeight, short: card.classList.contains("is-short") };
    try { card.setPointerCapture(e.pointerId); } catch (err) {}
  });
  card.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    const now = performance.now(), dt = Math.max(1, now - drag.t);
    drag.v = 0.7 * ((e.clientY - drag.y) / dt) + 0.3 * drag.v; drag.y = e.clientY; drag.t = now;
    let dy = e.clientY - drag.y0;
    if (!drag.moved && Math.abs(dy) < 6) return;
    drag.moved = true;
    if (dy < 0) dy = drag.short ? Math.max(dy, -80) / 2 : dy / 4;   // a pull up stretches a little, then holds
    card.classList.add("dragging");
    card.style.transform = `translateY(${dy}px)`;
  });
  function end(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (d.moved) { dragged = true; setTimeout(() => { dragged = false; }, 0); }
    if (!d.moved) { if (d.onGrab && e.type === "pointerup") setShort(!d.short); else springBack(); return; }
    const dy = e.clientY - d.y0, flick = Math.abs(d.v) > 0.6 && performance.now() - d.t < 100;
    if (e.type === "pointercancel") { springBack(); return; }
    if (d.short) {
      if ((flick && d.v > 0) || dy > d.h / 3) close();
      else if ((flick && d.v < 0) || dy < -40) setShort(false);
      else springBack();
      return;
    }
    // Full: the short card is about this much lower; past it (by a third of the short card) it closes
    const shortH = shortHeight(), drop = Math.max(0, d.h - shortH);
    if ((flick && d.v > 0) || dy > drop + shortH / 3) close();
    else if (dy > drop / 2 && drop > 24) setShort(true);
    else springBack();
  }
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", end);
  // A drag is not a click: stop the release from pressing what sits under the finger
  card.addEventListener("click", e => { if (dragged) { e.stopPropagation(); e.preventDefault(); } }, true);
  // The keyboard: Enter or Space on the grabber switches heights (its click); a pointer tap is handled above
  grab.addEventListener("click", e => { if (e.detail === 0) setShort(!card.classList.contains("is-short")); });

  function shortHeight() {
    const keep = card.style.transform; card.classList.add("dragging", "is-short");
    const h = card.offsetHeight; card.classList.remove("is-short"); card.style.transform = keep;
    return h;
  }

  // Always opens at full height
  const open0 = openCard;
  openCard = function () { card.classList.remove("is-short", "dragging"); card.style.transform = ""; card.style.transition = ""; label(); return open0.apply(this, arguments); };
  // Turning the phone to landscape (the side panel): one height again
  sideMQ.addEventListener("change", () => { if (!isSheet()) { card.classList.remove("is-short"); label(); } });
  sheetMQ.addEventListener("change", () => { if (!isSheet()) { card.classList.remove("is-short"); label(); } });
})();
