# Reference Site — Structural Notes

> Source: https://subhhousing.com/seggovias-sector70a-spr-road-gurugram/ (fetched 2026-07-10)
> Purpose: capture STRUCTURE AND MECHANICS ONLY for reuse as a builder spec. No copy,
> claims, images, or brand elements from this site are to be reused anywhere in our build.
> Method: fetched raw HTML + linked `style.css` / `script.js` directly (not a rendered
> screenshot), so section order, form fields, and JS behavior below are read from source,
> not inferred.

---

## 1. Section order (top to bottom)

1. **Fixed nav** (not a section, but present on every scroll position — see §4)
2. **Hero** (`#home`)
3. **Story / About the concept** (`#story`)
4. **Highlights strip** (4-stat band, no id — sits right after Story)
5. **Location & connectivity** (`#location`)
6. **Floor plans** (`#floorplan`)
7. **Site plan** (`#siteplan`)
8. **Amenities grid** (`#amenities`)
9. **Single full-width image break** (no id, no heading — just one banner image between Amenities and Specs)
10. **Specs / project details + price** (`#specs`)
11. **Developer / about-the-builder** (`#about`)
12. **Lead form section** (`#contact`)
13. **Footer** (disclaimer, RERA QR, one internal privacy-policy link)
14. **Mobile sticky bottom bar** (fixed, not in document flow order but always present on mobile)
15. **Auto-popup modal** (`#leadPopup`, fires on load, not part of scroll order)

Nav anchor links only cover 6 of these (Overview/Location/Floor plans/Site Plans/Amenities/Specifications) — Story, Developer, and Contact are reachable by scroll/CTA only, not in the nav itself.

---

## 2. Section-by-section layout patterns

| # | Section | Layout pattern | Mobile stacking |
|---|---------|----------------|------------------|
| 1 | Hero | Full-viewport (`min-height:100vh`), single background image (CSS `background-image`, not an `<img>`) with a flat black gradient scrim (`rgba(0,0,0,.5)` top+bottom, not a color-tinted overlay), centered text stack, a 4-item inline "spec strip" (config / area / price / location) separated by vertical dividers, two CTA buttons (primary filled + outline), a small "Scroll" cue at the bottom. | Everything centered in a single column; the 4-item spec strip presumably wraps/scrolls at narrow widths (divider items are inline-flex, no explicit mobile-only rule found, so likely wraps to 2×2). |
| 2 | Story | **Split 2-column grid** (`grid-template-columns: 1fr 1fr`, 80px gap) — text block (label → heading → body → pull-quote → divider → body) on one side, a single framed portrait-oriented image (`aspect-ratio:3/4`) on the other. | Grid collapses to single column at mobile breakpoint (standard CSS grid auto-stack; text first, image second based on source order). |
| 3 | Highlights strip | **4-column stat/icon row** — icon (image) + big number + label + short description, no card borders/background, just a flat grid. | Grid columns reduce at mobile breakpoint (exact breakpoint not captured, but pattern is a standard responsive stat-grid — expect 2×2 or 1-column stack under ~600px). |
| 4 | Location | **Split 2-column grid** — left: heading + body copy + divider + a plain vertical list of "connectivity" rows (name + time, e.g. "IGI Airport via NH-48 — 20 min"); right: a "Nearby landmarks" list with dot-marker + title + distance (not an actual map embed — a styled list standing in for one). | Same grid-collapse-to-single-column pattern as Story. |
| 5 | Floor plans | **2-up card grid** (Bootstrap `row`/`col-md-6`) — two floor-plan images side by side, no framing beyond the raw image, heading above. | Bootstrap grid auto-stacks the two cards to full-width single column below `md`. |
| 6 | Site plan | **Single centered full-width image** under a centered heading, no gating, no form. | Stays single column/full-width naturally — nothing to collapse. |
| 7 | Amenities | **3-column icon-card grid** (`grid-template-columns: repeat(3,1fr)`, near-zero gap so cards visually tile edge-to-edge) — icon + title + one-line description per card. Below the grid: a **flex-wrap "pill/tag" row** of secondary amenities (bordered text chips, no icons). | 3-column grid presumably reduces at mobile (breakpoint not confirmed in excerpt) — treat as needing explicit mobile override (likely 1 or 2 columns) since a rigid 3-col grid at 375px would cramp text badly. |
| 8 | Image break | **One full-bleed banner image**, no text, no heading — a deliberate visual pause between Amenities and Specs. | Naturally full-width at all sizes. |
| 9 | Specs | **Split 2-column grid** — left: heading + body + a boxed "price highlight" card (label, big price, sub-note, CTA button); right: a **definition-list style spec table** (label/value rows: Project, Developer, Location, RERA No., Configuration, Area, Total Units, Floors, Total Area, Possession, Structure, Bank). | Grid collapses to single column; spec-table rows likely stay full-width stacked key/value pairs. |
| 10 | Developer/About | **Split 2-column grid** — left: heading + body + a 4-item stat grid (years/acres/debt/RERA); right: a bordered "Our Principles" panel with 4 icon+title+description rows (inline flex, not a grid). | Grid collapses to single column. |
| 11 | Lead form | **Centered single-column form card** inside a `.form-wrap` — heading block centered above, then a boxed form with **paired fields per row** (`.form-row` = 2 fields), 3 rows total, then a full-width submit button, then a small disclaimer paragraph below the form (RERA + "not an offer to sell" language). | Field-pairs-per-row likely stack to 1 field per row at mobile (no explicit rule confirmed, but this is the near-universal pattern for this markup style). |
| 12 | Footer | Single-column: logo, one long paragraph of descriptive/brand copy, a RERA line with a QR-code image inline, one internal link ("Privacy policy" — the only link in the whole page, and it's same-site, not outbound). | Already single-column. |

---

## 3. Lead-capture mechanics

- **Two separate forms exist**, both posting to the same `mail.php` endpoint (i.e., simple server-side mail relay, not a CRM API call visible in the front-end):
  1. **In-page form** (`#contact` section): Full Name, Mobile Number, Email Address, "I Am A" (select: End-User/Investor/NRI/Channel Partner), Current Location (text), Budget Range (select: 3 price bands). 6 fields total, laid out as 3 rows of paired fields. No consent checkbox on this form.
  2. **Popup modal form** (`#leadPopup`): First Name, Email, Mobile — 3 fields only, plus a **pre-checked, required** consent checkbox ("I agree... override Registry on DND/NDNC"). Shorter/faster than the in-page form, consistent with a popup's job being low-friction capture.
- **No gating of content behind the form.** I checked specifically: the `#siteplan` anchor leads to a section with the site-plan image rendered directly and publicly, no lock/blur/CTA-to-unlock pattern. Floor plans are likewise directly visible. So despite the URL fragment naming, **nothing on this reference page is actually gated** — the "unlock via form" mechanic you asked about does not exist here. (Worth noting since our own build IS adding a visual gate for site plan/floor plan — that's our own design decision, not something borrowed from this reference.)
- Both forms' `action="mail.php"` with no client-side validation library beyond native HTML `required` attributes — no visible client-side lead-scoring, no multi-step form.

---

## 4. Sticky / fixed elements

- **Sticky header/nav**: `position: fixed; top:0; z-index:1000`, full-width, present at all scroll positions on all breakpoints. Contains logo, nav links (desktop) / hamburger (mobile), and a nav-bar CTA button ("Enquire Now") that smooth-scrolls to `#contact`.
- **Mobile sticky bottom bar**: a `position:fixed; bottom:0` full-width two-button bar, **hidden by default and only shown via a `max-width:768px` media query** (`display:flex` under 768px, `display:none` otherwise) — i.e. this is mobile-only, does not appear on desktop. Two 50%-width buttons: "ENQUIRE NOW" (scrolls to `#contact`) and "CALL NOW" (`tel:` link). `z-index:999999` — deliberately layered above everything including the nav.
- **No floating WhatsApp button** was found anywhere in the markup or CSS (only a tel: call button in the sticky bar).

---

## 5. Popup / modal behavior

- One modal (`#leadPopup`, Bootstrap 5 modal component) fires via **pure timer**: `window.addEventListener('load', ...)` → `setTimeout(..., 3000)` → `bootstrap.Modal(...).show()`.
- **Fires exactly once**, 3 seconds after the `load` event (not DOMContentLoaded, not scroll depth, not exit-intent). No re-trigger logic, no cookie/localStorage check visible in `script.js` to suppress it on repeat visits (though Bootstrap's own modal-instance behavior may prevent a second `.show()` call within the same page life — irrelevant across reloads).
- Modal content: a banner image at top, "PLEASE FILL YOUR DETAILS BELOW" heading, the 3-field form described in §3, close button (×) top-corner.

---

## 6. Navigation pattern

- **Fixed/sticky header** at all times (see §4).
- **Desktop**: horizontal inline nav links + a filled CTA button, all visible directly in the nav bar.
- **Mobile**: hamburger icon (`#menuToggle`, 3-line CSS icon) toggles a slide-in/overlay nav (`#navLinks` gets an `active` class) plus a dark `#menuOverlay` behind it that also closes the menu on tap. Clicking any nav link also auto-closes the mobile menu.
- **All in-page nav is anchor-scroll** (`href="#section-id"`), several with explicit `scrollIntoView({behavior:'smooth'})` JS rather than relying on native anchor jump — no page reloads, no external navigation.
- Nav only links to 6 of the page's ~9 content sections (see §1) — Story, Developer, and the Lead-form section itself are not in the nav, only reachable via scroll or CTA buttons that target `#contact`.

---

## 7. Scroll / motion mechanics (bonus — relevant to our animation requirements)

- A single `.reveal` / `.reveal-delay-N` class pattern, driven by one shared `IntersectionObserver` (threshold `0.12`) that adds a `.visible` class and then unobserves — i.e., **fade/reveal-once-per-element, not on every re-entry**. This is a lightweight vanilla-JS pattern (~30 lines total in `script.js`), no animation library. Structurally, this is exactly the kind of scroll-reveal mechanic already planned for our build.

---

## 8. What I could NOT determine from this fetch

- The **exact mobile breakpoint value(s)** used for grid-to-single-column collapses in Story/Location/Specs/Developer (the `@media` rules governing these weren't in the excerpts I inspected — only the `.mobile-fixed-buttons` breakpoint at `768px` was directly confirmed).
- The **exact mobile column count** for the 3-column Amenities grid and 4-column Highlights strip (whether they go to 1 or 2 columns) — not confirmed from the CSS excerpt reviewed.
- Real-device rendering/visual polish (shadows, exact spacing scale, hover states) — I read markup and CSS source, not a rendered screenshot, so purely visual nuance beyond what's in the stylesheet rules isn't captured here.

---

## 9. Explicit non-transfers (do not carry into our build)

Per the task instructions, none of the following from this reference are to be used: their copy/wording, their claims, their color palette (gold/purple "castle" theme), their fonts (Cormorant Garamond / Cinzel / Jost), their images, or their brand voice. Only the **section order** and **layout mechanics** documented above are for reuse.
