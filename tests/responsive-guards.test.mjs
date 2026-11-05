import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

// Responsive audit, 3 Nov 2026: at 768px the /learn trial button was 4px wider
// than its three-column cell and made the page scroll sideways.
test("the /learn trial button wraps inside its column", () => {
  assert.match(read("src/app/(site)/learn/page.jsx"), /className="btn btn-primary mt-5 max-w-full whitespace-normal text-center" href="\/free-trial">Request a three-day trial/);
});

test("CMS hero and image-text sections use responsive AVIF/WebP image variants", () => {
  const sections = read("src/components/site/page-sections.jsx");
  const image = read("src/components/site/content-image.jsx");
  const hero = read("src/components/site/hero.jsx");
  assert.match(sections, /import \{ ContentImage \} from "@\/components\/site\/content-image";/);
  assert.equal((sections.match(/<ContentImage /g) || []).length, 2);
  assert.match(sections, /sizes="\(max-width: 1023px\) calc\(100vw - 2\.5rem\), \(max-width: 1599px\) 42vw, 42rem"/);
  assert.match(image, /<source type="image\/avif"/);
  assert.match(image, /srcSet=\{asset \? asset\.variants/);
  assert.match(image, /loading=\{priority \? "eager" : "lazy"\}/);
  assert.match(hero, /max-w-\[440px\]/);
  assert.match(hero, /const HERO_SIZES = "\(max-width: 639px\) 90vw, 440px"/);
});

test("the responsive audit covers phone to desktop widths and the market pages", () => {
  const src = read("scripts/responsive-audit.mjs");
  assert.match(src, /const WIDTHS = \[320, 360, 390, 430, 768, 820, 1024, 1280, 1440, 1600, 1920, 2560\];/);
  assert.match(src, /const DEVICE_PROFILES = \["iPhone 13", "iPhone 14 Pro Max", "Pixel 7", "iPad Pro 11"\];/);
  for (const path of ["/locations/united-kingdom", "/locations/united-states", "/locations/canada", "/locations/australia", "/locations/united-arab-emirates", "/learn", "/pricing", "/free-trial"]) {
    assert.ok(src.includes(`"${path}"`), path);
  }
});

test("floating support and review controls stay off contact and free-trial forms", () => {
  const support = read("src/components/site/contact-support-button.jsx");
  const reviews = read("src/components/site/reviews-button.jsx");
  assert.ok(support.includes('const HIDDEN_ON = ["/contact", "/free-trial"];'));
  assert.ok(support.includes("pathname.startsWith(`${path}/`)"));
  assert.ok(support.includes("window.scrollY > window.innerHeight * 0.8"));
  assert.ok(reviews.includes('pathname === "/contact" || pathname.startsWith("/contact/")'));
  assert.ok(reviews.includes("window.scrollY > window.innerHeight * 0.8"));
  assert.ok(reviews.includes('pathname === "/free-trial" || pathname.startsWith("/free-trial/")'));
});

test("public footer has no staff portal shortcut and support stays on the right", () => {
  const footer = read("src/components/site/footer.jsx");
  const support = read("src/components/site/contact-support-button.jsx");
  assert.doesNotMatch(footer, /href="\/admin"|>\s*Portal\s*</);
  assert.ok(support.includes("right-[calc(1rem+env(safe-area-inset-right))]"));
});
