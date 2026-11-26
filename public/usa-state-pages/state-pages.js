/* Decorative pointer feedback for the public cards and state guides. */
(() => {
  const motion = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const selector = "#main a.editorial-card, #main .explore-card, .card, .explore a";
  let card;
  let frame = 0;
  let pointerX;
  let pointerY;

  function paint() {
    frame = 0;
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", Math.round(pointerX - box.left) + "px");
    card.style.setProperty("--my", Math.round(pointerY - box.top) + "px");
    card.setAttribute("data-pointer-highlight", "");
  }

  function move(event) {
    if (event.pointerType !== "mouse") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function clear() {
    if (!card) return;
    cancelAnimationFrame(frame);
    frame = 0;
    card.removeAttribute("data-pointer-highlight");
    card.style.removeProperty("--mx");
    card.style.removeProperty("--my");
    card.removeEventListener("pointermove", move);
    card.removeEventListener("pointerleave", clear);
    card = null;
  }

  function enter(event) {
    if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return;
    const target = event.target.closest(selector);
    if (!target || target === card) return;
    clear();
    card = target;
    card.addEventListener("pointermove", move, { passive: true });
    card.addEventListener("pointerleave", clear, { once: true });
    move(event);
  }

  function updatePreference() {
    clear();
    document.documentElement.toggleAttribute("data-oqc-pointer-motion", motion.matches);
    if (motion.matches) document.addEventListener("pointerover", enter, { passive: true });
    else document.removeEventListener("pointerover", enter);
  }

  motion.addEventListener("change", updatePreference);
  window.addEventListener("blur", clear);
  updatePreference();
})();
