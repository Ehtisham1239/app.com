// Pointer glow for the US state pages: the hovered card's highlight follows the cursor
// through the --mx/--my custom properties read by state-pages.css. Mouse and trackpad
// only; touch screens and visitors who prefer reduced motion get the static hover colour.
(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let frame = 0;
  let target = null;
  let x = 0;
  let y = 0;
  const paint = () => {
    frame = 0;
    if (!target) return;
    const box = target.getBoundingClientRect();
    target.style.setProperty("--mx", `${Math.round(x - box.left)}px`);
    target.style.setProperty("--my", `${Math.round(y - box.top)}px`);
  };
  document.addEventListener("pointermove", (event) => {
    target = event.target instanceof Element ? event.target.closest(".card") : null;
    if (!target) return;
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(paint);
  }, { passive: true });
})();
