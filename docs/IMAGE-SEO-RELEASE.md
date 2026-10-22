# Learning imagery and image SEO

Six original AI-generated educational illustrations match the college's forest green, ivory and amber palette. They illustrate learning situations and are not representations of enrolled students or endorsements. The existing college logo remains unchanged.

Each image has pre-encoded 400, 800 and 1200 pixel WebP variants. The public component chooses an appropriate source with `srcset` and `sizes`, reserves intrinsic dimensions, decodes asynchronously and lazily loads cards. Main course, location and guide covers load eagerly. No runtime image transformation service is required for these assets. Generated originals remain outside the application bundle.

The six masters are also stored in Supabase's public media bucket and registered in the CMS media library with descriptions and an AI illustration caption. Courses, posts, learning guides and location pages reference these editable records. `cover_alt` is editable independently on each content record. A media URL matching the release manifest uses the local responsive copies; replacing it in the CMS displays the replacement directly, without incorrectly retaining a previous image's variants.

Migration `20261022000900_learning_images.sql` adds cover descriptions without changing access policies and fills empty covers. Existing custom covers are preserved. A private pre-update backup is retained outside Git. The public fallback contains the same image assignments.

Image SEO includes descriptive filenames and alt text, Open Graph image descriptions, article/course image structured data, and image sitemap entries. Related blog tags express natural subject phrases rather than invented search-volume figures. Existing country/city canonicals, location schedules and internal links remain in place. SEO improvements support discovery; search rankings and real-user Core Web Vitals require external measurement over time.

Validation: `npm test`, `npm run lint`, `npm run build`, and `node scripts/image-smoke.mjs <origin>`. The smoke check fetches every responsive file, verifies all 165 location pages, and checks loaded cover images and horizontal overflow at mobile and desktop sizes. External chat JavaScript is stubbed in this deterministic visual check; it does not validate the provider's delivery behavior.

## Mobile-first follow-up

The public header now shows a branded “Portal” button and omits its WhatsApp links. Footer and contextual enquiry links retain their existing contact details. The Portal link remains a full document navigation to isolate the staff area from public chat code.

Home motion uses CSS transforms and brief entry/reveal effects with a small IntersectionObserver enhancement. Content is visible without JavaScript; `prefers-reduced-motion` disables the effects. No animation library or background video was added. The mobile menu traps keyboard focus, closes on Escape and restores focus. Narrow contact cards wrap the email address; form controls can shrink inside grid columns. Mobile controls use 16px type to avoid automatic iOS focus zoom.

Security headers restrict embedding, plugin objects, base URLs and form destinations while preserving the existing chat integration. Staff pages send private/no-store caching headers. Cookie-authenticated cache revalidation rejects cross-site browser requests before checking staff permissions. Existing Supabase RLS and authentication remain authoritative. These changes do not constitute a complete penetration test.

Responsive validation covers public routes and the login screen at 320, 375, 390, 768, 1024, 1440 and 1920px. Touch/iPhone viewport emulation runs in Chromium; it is not a claim of physical iPhone/Safari testing. Real-device testing remains useful for OS-specific behavior.
