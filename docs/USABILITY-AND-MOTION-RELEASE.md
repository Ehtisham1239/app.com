# Public usability and homepage motion

The homepage now hides empty tutor/testimonial sections until approved records exist, removes a repeated teaching pitch, and offers direct section links for courses, fees, the lesson process and questions. Primary hero actions appear before the country list. Published records and routes remain intact.

Motion includes one-time staggered heading/card reveals, a finite ambient hero entrance, portrait/action entrances and pointer hover details. It uses CSS transforms/opacity and IntersectionObserver, with no animation dependency, continuous ticker or scroll interception. Reduced-motion changes are respected during the session; server-rendered content remains readable without JavaScript.

The mobile menu collapses the course list, closes on same-page links and supports visible-item keyboard focus trapping. Desktop course navigation supports Escape, outside-click dismissal and focus exit. Resizing to desktop releases the mobile scroll lock. Footer Portal navigation now starts a fresh document, matching the header and clearing public chat before sign-in.

The country directory searches country names, common UK/USA aliases and city names; matching cities provide direct links and empty results offer a recovery action. All country links remain server-rendered. Contact and trial forms focus invalid fields, associate error text with controls, announce confirmation, and move focus to the next trial step. Lead submission endpoints, consent requirements and attribution remain unchanged.

Validation uses automated unit/database checks, production build, responsive checks and the `scripts/usability-smoke.mjs` browser flow. Form/vendor transports are stubbed in browser tests; no real leads or chat messages are sent. Tests cover keyboard navigation, same-page mobile links, location filtering, two form confirmations, reduced motion and no-JavaScript content.
