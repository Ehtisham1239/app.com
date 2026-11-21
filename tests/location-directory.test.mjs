import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// /locations INP (3 Nov 2026): typing must not synchronously re-render every country card.
test("location search defers the card grid and builds search text once", () => {
  const src = readFileSync(new URL("../src/components/site/location-directory.jsx", import.meta.url), "utf8");
  assert.match(src, /const deferredQuery = useDeferredValue\(query\);/);
  assert.match(src, /const term = deferredQuery\.trim\(\)\.toLocaleLowerCase\(\);/);
  assert.match(src, /const haystacks = useMemo\(/);
  assert.match(src, /value=\{query\}/, "the input itself stays bound to the immediate value");
  assert.match(src, /loading="lazy"/, "card images stay lazy");
});
