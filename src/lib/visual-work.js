// Decorative enhancements can wait until the browser has time after rendering.
export function scheduleVisualWork(work) {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(work, { timeout: 1200 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(work, 120);
  return () => window.clearTimeout(handle);
}
