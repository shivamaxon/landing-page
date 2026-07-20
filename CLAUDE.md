# CLAUDE.md — The Riviera Landing Page

> Read this file first. It should be enough to understand the project, the locked
> decisions, the constraints, and what's next — without re-scanning the codebase.

## 1. PROJECT

- **What this is:** a single-page, mobile-first marketing landing page for "The
  Riviera" — 20 river-touching villa plots by Axon Developers, on the Gad River,
  Konkan, Sindhudurg (Mumbai–Goa corridor, NH-66).
- **Purpose:** lead capture from Meta ad traffic. Fast mobile load is priority #1 —
  ad traffic has a high bounce risk on slow pages.
- **Tagline (locked, brand-wide):** "India's Rarest Riverfront Address."
- **Hero tagline (page-specific, current):** "India's Most Exclusive River Side
  Living" — set by the July 2026 marketing revision pass, sits under the "THE
  RIVIERA" title on the hero only. The brand-wide tagline above is unchanged and
  still governs elsewhere (e.g. `<title>`/meta description in `Layout.astro`).
- **Source of truth for all copy/claims:** `docs/brand-guidelines.md`. A second
  reference doc, `docs/reference-site-notes.md`, captures structural/mechanical
  patterns (section order, form mechanics, popup timing) borrowed from a competitor
  site during early layout work — it does not govern content or brand. A third
  reference now exists: `assets-private/The RIVIERA-Brochure.pdf`, an updated
  brochure supplied July 2026 — see §11 for how it was reconciled against
  brand-guidelines.md (not auto-applied; flagged as discrepancies only).
- **No git repository is initialized in this project.** There is no commit
  history to check — this file and the docs/ folder are the only persistent record
  of decisions.

## 2. STACK & ARCHITECTURE

- **Astro 7** (static output, zero JS by default), vanilla CSS via custom
  properties, npm. No UI framework, no Tailwind.

### Folder structure (actual, current)

```
/src
  /assets/images   — source images actually imported/optimized (subset of public/images)
  /components
    AxonLogo.astro          — Axon Developers' own logo; `variant="original"`
                               (crimson+dark-grey, cream backgrounds) or
                               `variant="dark-theme"` (crimson+white, dark
                               backgrounds) — no box/chip either way (see §4)
    Carousel.astro            — shared carousel shell (track/edge-arrows/dots);
                                 used by both LifestyleDetail and GrowthThesis
                                 (see §4, "Shared carousel")
    Header.astro             — fixed header, uniform dark strip: Riviera logo +
                               Axon logo (dark-theme variant) + hamburger
    ImageFrame.astro         — shared optimized-image wrapper for grid tiles/banners
    Lightbox.astro           — single shared full-size image viewer (gallery + map)
    Logo.astro                — The Riviera logo wrapper, light/dark variant prop
    LeadModal.astro            — the single reusable lead-capture modal
    Placeholder.astro          — dashed-box placeholder for still-pending assets
    QuickContactStack.astro    — fixed right-side stack: WhatsApp + Call (see §4)
    StickyCta.astro            — mobile-only fixed bottom bar (2 buttons, see §4)
    /sections   — one file per page section, see §4 for order/behavior
  /data
    country-codes.js       — ~230-entry country calling-code list for the modal's dropdown
    gallery-images.js       — single source of truth for the 9 lifestyle-gallery photos;
                               imported by both LifestyleGallery.astro (grid tiles) and
                               Lightbox.astro (full-size slides) so order can't drift
  /layouts
    Layout.astro           — <head>, meta/OG tags, global.css import, font preloads
  /pages
    index.astro             — assembles the whole page; the single source of section order
    thank-you.astro           — post-submit redirect target for Google Ads conversion
                                 tracking (see §4)
    privacy-policy.astro      — Disclaimer + Privacy Policy page, linked from the footer
  /scripts
    reveal.js               — IntersectionObserver scroll-reveal (.reveal → .is-visible)
    lightbox.js               — vanilla lightbox logic (see §4)
    carousel.js                — shared peek-carousel logic (autoplay/swipe-sync/
                                  dots), drives every `[data-carousel]` element on
                                  the page — both Lifestyle and infra carousels
    gating.js                — modal open/close, validation, submit → redirect to
                                /thank-you, popup timers, country-code auto-detect
                                prep, WhatsApp/Call TODOs
  /styles
    global.css               — design tokens + every shared class (see §3)
/public
  /images    — ALL raw source photos + original logo.png, unoptimized, served as-is
  /fonts     — self-hosted woff2 (Inter 300/400/700, Oswald 700)
  /downloads — placeholder-asset.txt (stub for gated brochure/site plan)
  favicon.ico, favicon-16.png, favicon-32.png, apple-touch-icon.png
             — generated from the logo's wave mark on a solid teal background
/assets-private
  The RIVIERA-Brochure.pdf  — the real, current brochure. Deliberately OUTSIDE
                              /public and /dist — see §4 "Gated downloads" for why.
                              Git-ignored (`/assets-private/` in .gitignore).
/docs
  brand-guidelines.md        — locked copy/claims/colors/fonts/compliance rules
  reference-site-notes.md    — structural notes from a competitor site (mechanics only)
```

### Naming discrepancy to flag

Earlier planning discussions referred to an "OptImage" wrapper component. **That
component does not exist under that name.** The actual, current component is
`src/components/ImageFrame.astro`. It wraps `astro:assets`'s `<Picture>` and
supports:
- `mode="cover"` (default) — fixed `aspect-ratio` box, `object-fit: cover`, a
  per-image `focal` prop (`object-position`).
- `mode="contain"` — cream background, image never cropped (used for diagrams/
  infographics/maps).

`Lightbox.astro` does **not** use `ImageFrame` either — it renders `astro:assets`'s
`<Picture>` directly at larger widths, since lightbox slides need `object-fit:
contain` at full viewport size (showing the *entire* image), which is a different
job from `ImageFrame`'s fixed-aspect-ratio tiles. `GrowthThesis.astro`'s 5 infra
cards (see §4) also render `<Picture>` directly rather than through `ImageFrame`,
since they need a dark gradient overlay composited on top — a different job again.

### Astro image gotcha (important, easy to get wrong)

Astro's built-in image optimizer (`astro:assets`) only processes images that are
**imported as modules from `src/`**. Anything referenced by a plain `/images/...`
URL string pointing into `public/` is served raw — no resizing, no AVIF/WebP, no
responsive `srcset`.

**Current state:** `public/images/` holds all raw original photos (unoptimized) as
delivered, plus the logos. Only the images actually used on the page have been
**copied** into `src/assets/images/` and imported from there — that's what gets
optimized. `public/images/` itself is not linked from the page and exists as the
untouched source folder.

**Workflow for any new image:** copy the file into `src/assets/images/`, `import`
it in the relevant `.astro` (or `.js` data) module, and render it through
`ImageFrame` (grid/banner tiles), a direct `<Picture>` (infra cards, lightbox
slides), or `astro:assets`'s `<Image>` directly (logos). Never reference
`public/images/*` directly in markup where optimization matters.

## 3. DESIGN TOKENS

From `src/styles/global.css`, `:root`:

```css
/* Brand colors — the only source of color in this project */
--brand-teal: #10899a;
--brand-teal-bright: #169eaa;
--brand-teal-deep: #0a6e85;
--brand-aqua-light: #89d3d9;

--brand-forest-deep: #042d2f;
--brand-forest: #12382d;
--brand-forest-mid: #192926;

--brand-cream: #f7ecdf;
--brand-cream-cool: #f3f1e5;

--text-on-dark: #f7ecdf;
--text-on-light: #12382d;

--hairline: rgba(18, 56, 45, 0.12);

/* Utility (non-brand) — validation/error state only, no brand color reads as "error" */
--color-error: #a5372a;

/* Fonts */
--font-display: 'Oswald', sans-serif;   /* PLACEHOLDER — see §7 */
--font-body: 'Inter', sans-serif;

/* Spacing / layout */
--content-max-width: 480px;
--section-pad-y: 1.75rem;
--section-pad-x: 1.25rem;
--radius: 2px;
```

Three extra non-palette colors exist, each deliberately outside the brand system:
- `#25D366` (WhatsApp's own brand green) — the WhatsApp button in `QuickContactStack.astro` only.
- The Riviera logo (see §4) is a flat teal-gradient-to-white asset baked as a
  raster image, not CSS — it doesn't introduce a new token, but its background
  isn't transparent.
- **Axon Developers' own logo** carries its own brand colors — a crimson mark
  paired with either a dark-grey or a light/white "DEVELOPERS" wordmark
  depending on which of the two logo files is in use — which are **not**
  part of The Riviera's palette and are rendered as-is (not recolored). See §4
  ("The Axon logo — TWO files, two contexts") for why two files exist and
  which goes where — no box/chip either way, just matching the logo file's
  own color scheme to the (now uniform, non-gradient) background it sits on.

- **Body font:** Inter, self-hosted WOFF2, weights 300/400/700, Latin-subset,
  `font-display: swap`.
- **Display font:** Oswald, self-hosted WOFF2, weight 700 — a **placeholder**
  standing in for the real brand display face (see §7).

## 4. CURRENT STATE — WHAT'S BUILT

Page section order (from `src/pages/index.astro`), top to bottom — **restructured
in the July 2026 marketing revision pass** per a marketing-supplied "ideal flow";
the previous order (Hero → ScarcityHook → UspGrid → LocationConnectivity →
WaterfrontPremium → GrowthThesis → InvestmentCase → LifestyleGallery →
LifestyleDetail → SitePlanGated → AxonPromise → BookSiteVisit → FinalCta →
Footer) is retired:

1. **Header** (fixed) + hamburger nav overlay — *ungated*, see below. Now carries
   **two logos**: The Riviera (left) and Axon Developers (right, before the
   hamburger) — see "The Axon logo" below.
2. **Hero** (`#home`) — now a **rotating 3-image cross-fade** (was a single static
   image), see "Rotating hero" below. "Enquire Now" (gated CTA) + "Discover More"
   (plain anchor scroll to `#overview`, ungated).
3. **RivieraOverview** (`#overview`) — replaces the old separate ScarcityHook +
   UspGrid sections; the "Only 1% of India's land is riverfront" statement (USP #1
   in brand-guidelines.md) is folded into this section's lead-in rather than kept
   as its own standalone section, since the marketing-supplied flow lists no
   separate scarcity section — **flagged as an interpretation, not an explicit
   instruction; revisit if a standalone scarcity section is wanted back.**
   **Restructured in the design-review pass** — the scarcity line and the
   20-plots line used to be two same-weight headlines stacked back to back,
   competing for attention. Now: the scarcity line is a small, quiet lead-in
   (`.overview-lead-in`), and "20 Exclusive River-Touching Plots. That's All
   There Ever Will Be." is the section's one dominant headline
   (`.overview-headline`). Body copy got more top margin and a `46ch` max-width
   for readability. The 3-card fact strip — **stacked vertically on mobile,
   3-up from 640px** — got bigger padding, bigger gaps, and larger/more legible
   value and label text (`.overview-fact-value` / `.overview-fact-label`).
   Cards: 20 River-Touching Villa Plots / **OC Applied** (status) / Private.
   "OC Applied" replaces the old "Freehold / Clear title" card — **note this
   conflicts with the current brochure, which still says "clear freehold
   title"; see §11.**
4. **LocationConnectivity** (`#location`) — road image banner → "The Place"
   heading/body (Gad-river framing) → a **4-item "Key Distances" fact strip**
   in this exact order: 25 min to beaches / 50 min to Sindhudurg Airport / 60 min
   to Goa International Airport (MOPA) / 40 min to Sindhudurg Fort. **"On NH-66"
   was dropped as its own box in the design-review pass** — the section's own
   title already states the NH-66 framing, so it was redundant as a 5th box; a
   clean 2×2 grid on mobile, 4-across from 900px. `.stat-card__label` also
   gained `overflow-wrap: break-word; hyphens: auto;` (global, applies to every
   stat card) so the long MOPA label wraps cleanly instead of risking clipping
   at 375px. **The MOPA/60-min figure and the "Sindhudurg Airport" naming are
   not present in docs/brand-guidelines.md or in the brochure** — supplied
   directly, verbatim, by marketing; treated as authoritative per their
   instruction, but flagged since they aren't independently corroborated (see
   §11). A **full-bleed, edge-to-edge map** with a "Tap to expand" badge
   (pinch-zoomable lightbox) closes the section — **the "Beaches Near the Site"
   checklist and the Kudal Railway Station checklist were removed entirely in
   the design-review pass** (the map alone now carries that information); the
   map wrapper gained extra top/bottom margin so it reads as the section's
   closing visual instead of being followed by a dense text list. **Desktop
   fix:** the banner and map are capped at `max-width: 960px` and centered from
   900px viewports up, and the distances fact strip goes 4-across — previously
   these sat in a narrow centered 560px column lost in a wide desktop canvas,
   which marketing flagged as effectively invisible without scrolling past a
   lot of empty space.
5. **LifestyleDetail** (`id="lifestyle"`) — moved to sit directly after the
   location map (previously much later in the flow, after the gallery). Header:
   "Living on the water, not near it." **Rebuilt in the design-review pass from
   a static 2×2 fact-card grid into a horizontal peek-carousel** — see
   "Lifestyle carousel" below. Cards: "Your own boat, your own jetty" / "One
   architectural language" / "A view that stays yours" / "Konkan, all year."
6. **LifestyleGallery** (`#gallery`) — unchanged grid + lightbox mechanics, but
   the grid is now **capped at `max-width: 720px` from 900px viewports up** —
   marketing flagged the tiles as too large on desktop.
7. **GrowthThesis** (`#growth`) — retitled "Sindhudurg — The Tourist Destination
   & Upcoming Development" (was "Sindhudurg Is Being Built For What's Next"). The
   5 infrastructure stats are now **5 image cards**, not a stat-grid: each is a
   real photo (`src/assets/images/infra-*.png`, supplied July 2026, exact
   filenames below) with a dark gradient overlay at the bottom carrying the ₹
   figure (large) and label (beneath), uniform `4/3` aspect ratio, 1-up on
   mobile / 3-up from 640px. Cards: `infra-coastal-highway.png` (₹68,720 Cr,
   Coastal highway), `infra-bridge.png` (₹7,851 Cr, Bridge project),
   `infra-expressway.png` (18h → 7–8h, Shaktipeeth expressway, Nagpur–Goa, by
   2028–29 — **the brochure gives this project a ₹20,787 Cr figure not present
   in brand-guidelines.md or on this card; flagged, not added, see §11**),
   `infra-film-city.png` (₹2,000 Cr, Film city), `infra-underwater-museum.png`
   (₹46.9 Cr, Underwater museum & scuba centre — **the brochure actually splits
   this into ₹46.9 Cr museum+reef and a separate ₹20 Cr/800+ jobs scuba centre;
   the site keeps them combined per marketing's explicit card list, see §11**).
   The old `4.png` Sindhudurg infographic composite is no longer used on the
   page (still present in `src/assets/images/` but unimported).
8. **SitePlanGated** (`#site-plan`) — **"Floor Plan" removed entirely.** One
   gated asset only: Site Plan. Single `<Placeholder>` box behind the lock
   overlay, single "View Site Plan" CTA. A desktop "clicking Site Plan does
   nothing" bug was reported; root cause wasn't reproducible via static review
   (the click-delegate logic in `gating.js` isn't viewport-dependent), so
   defensive fixes were applied instead — explicit `z-index: 1` and
   `pointer-events: auto` on `.gate__overlay` and its buttons. **Re-verify in a
   real desktop browser; if it still doesn't work, the cause is elsewhere
   (possibly a stacking-context issue from a section higher up the page).**
9. **AboutDeveloper** (new) — Axon Developers' logo centered at the top, then the
   exact "cutting edge of global experiences... Integrated Tourism Townships"
   copy supplied by marketing. Replaces the old AxonPromise section (the 01–04
   Design → Approvals → Leasing → Resale Support process grid, and the "61
   cities in 12 states" line) entirely — that content is retired, not merged in.
10. **BookSiteVisit** (`#site-visit`) — unchanged; compact CTA prompt, opens
    modal with `intent="sitevisit"`.
11. **FinalCta** (`#enquire`) — unchanged; compact CTA prompt, opens modal with
    `intent="enquiry"`.
12. **Footer** — real Riviera logo, brand line, a trimmed disclaimer (see
    below), a new **"Disclaimer & Privacy Policy" line** (truncated text +
    "Read More" linking to `/privacy-policy`), copyright line. **No RERA
    reference of any kind — unchanged, still a hard constraint.**

**Sections removed entirely this pass** (files deleted, not just unlinked):
`ScarcityHook.astro`, `UspGrid.astro` (both folded into `RivieraOverview.astro`),
`WaterfrontPremium.astro` (+15/25/40% cards), `InvestmentCase.astro`
(Goa/Alibaug/Lonavala → 2.8×–4.2×), `AxonPromise.astro` (replaced by
`AboutDeveloper.astro`). Their orphaned disclaimer lines (waterfront-premium
sourcing, appreciation-projection wording) were removed from the footer along
with them; the still-relevant infrastructure-timeline disclaimer was kept.

Then, outside the section flow (all `position: fixed`):
- **StickyCta** — mobile-only (`max-width: 640px`) bottom bar, now **2 buttons**
  (was 2 already, but different pair): "Enquire Now" (`intent="enquiry"`),
  "Download Brochure" (`intent="brochure"`) — "View Site Plan" moved off the bar.
  Larger padding/font than before ("more visible" per marketing) and the shared
  `.shine-cta` shimmer-sweep animation (see below).
- **QuickContactStack** (new, replaces `StickySideTabs.astro` and
  `WhatsAppButton.astro`, both deleted) — fixed right-side vertical stack, all
  viewports: WhatsApp (`wa.me` link, unchanged number/message) above a new
  **Call button** (`tel:+919821003165`, direct dial, does not open the modal —
  a deliberately different number from WhatsApp's, updated in a later pass; see
  §5). Do not conflate the two.
  Both circular, 56px, each now wrapped in a `.quick-contact__ring-wrap`
  (56×56px, `overflow: visible`) carrying the pulse-ring animation — see below
  for why the ring lives on a wrapper rather than the button itself. Positioned
  `bottom: 4.75rem` under 640px to clear the sticky bar (same clearance value
  the old single WhatsApp FAB used) — verified no collision with the bottom
  bar at a 375px viewport: the bar is ~50–60px tall, the stack's bottom edge
  sits at 76px from viewport bottom, leaving a margin.
- **Sticky-button animation, replaced in the design-review pass.** The old
  `.pulse-cta` (a `3.2s` scale(1→1.045)+opacity dip) was reported as
  effectively invisible. Replaced with two effects, both `transform`/`opacity`
  only and disabled under `prefers-reduced-motion: reduce`:
  - **`.shine-cta`** (all four buttons) — a diagonal light band (`::after`,
    a `linear-gradient` with soft white stops) `translateX`'d across the
    button periodically. The button itself gets `overflow: hidden` so the
    band is clipped to its shape (rectangular bar segments or the circular
    icon buttons alike — border-radius on the button clips the pseudo-element
    automatically, no extra markup needed). One `3.8s` cycle: the band sweeps
    across during the first ~35% of the cycle, then holds off-screen
    (`translateX(160%)`) for the rest — reads as a slow periodic sweep, not a
    constant back-and-forth loop.
  - **`.icon-cta-ring`** (WhatsApp + Call only, applied to the new
    `.quick-contact__ring-wrap` div, not the button) — an expanding,
    fading ring (`::after`, `border-radius: 50%`, `scale(1→1.35)` +
    opacity 0.6→0), same `3.8s` cadence. **Why a wrapper and not the button
    itself:** the button needs `overflow: hidden` for its own shine sweep,
    which would clip the ring before it could expand past the button's
    circular edge — so the ring lives on an unclipped parent instead.
  - **Staggered via a CSS custom property**, not hardcoded per-selector
    animation-delay: each button/wrapper sets an inline `--shine-delay` or
    `--ring-delay` (custom properties inherit through to pseudo-elements),
    and `global.css` reads it via `animation-delay: var(--shine-delay, 0s)` /
    `var(--ring-delay, 0s)`. Current stagger: Enquire Now 0s, Download
    Brochure 0.9s, Call ring 0s / shine 1.2s, WhatsApp ring 0.3s / shine 1.8s
    — chosen so no two of the four visibly move in lockstep.
- **The old 4-tab `StickySideTabs`** (Enquire / Site Plan / Book Site Visit /
  Download Brochure) is **retired** — reduced to the 4 buttons above (2 in the
  bar, 2 in the side stack) per marketing's explicit instruction to cut sticky
  buttons down to exactly 4 total.
- **LeadModal** — same shared modal, same 4 fields. **Consent checkbox now
  pre-ticked by default** (`checked` attribute; user can still untick). All
  four fields now have visible placeholder text (`Your full name`,
  `you@example.com`, `98765 43210`; the country-code `<select>` doesn't support
  a true placeholder but defaults to a real, visible selection). On successful
  submit, the modal **no longer shows an in-page success state** — it redirects
  to `/thank-you?intent=<intent>` (see below) instead. The old `.form-success` /
  `.is-submitted` markup and CSS were removed as dead code once the redirect
  replaced them.
- **Lightbox** — unchanged; the shared full-size image viewer, hidden until
  opened.

### The Axon logo — TWO files, two contexts (second design-review pass)

The first design-review pass tried a horizontal dark→cream header gradient so
Axon's full-colour logo (crimson mark, dark-grey "DEVELOPERS") could sit on a
light zone without a chip. **That gradient was reverted** — flagged in the
next review round as reading like a "muddy smear" rather than a deliberate
design element (see "Header — reverted to a uniform dark strip" below). A
second Axon file was supplied to solve the contrast problem properly instead:

- **`public/images/Axon_logo.png`** (1536×1024 transparent PNG, crimson mark +
  **dark-grey** "DEVELOPERS") — the ORIGINAL full-colour file. Legible only on
  light/cream backgrounds. Cropped copy lives at
  `src/assets/images/Axon_logo.png` (1192×455, aspect ≈2.62). Used on the
  **About the Developer** section (cream background) via
  `<AxonLogo width={160} />` (default `variant="original"`).
- **`public/images/axon logo dark theme.png`** (754×275 transparent PNG,
  supplied July 2026, crimson mark + **light/white** "DEVELOPERS") — the
  DARK-THEME file. Legible only on dark backgrounds. Already tightly cropped
  at the source (alpha bbox 2–751 of 754px wide, 0–275 of 275px tall — almost
  no padding to trim, unlike the other two logos in this project). Cropped
  copy lives at `src/assets/images/axon-logo-dark-theme.png` (749×275). Used
  in the **header** (uniform dark strip, see below) via
  `<AxonLogo width={52} variant="dark-theme" />`.

`AxonLogo.astro` takes a `variant?: 'original' | 'dark-theme'` prop (mirrors
`Logo.astro`'s own `variant` pattern for the Riviera logo) and picks the
matching imported file. **Using the wrong variant in either location makes
that logo invisible** — dark-theme-on-cream or original-on-dark both fail
contrast; this is the one thing to double-check if either section is touched
again.

Sizing: `Header.astro` requests `width={52}` for Axon vs. Riviera's
`width={100}` — smaller optical height, since Axon is a secondary developer
credit, not the primary brand mark. No box/chip/CSS filter anywhere — both
variants render directly on their background in native color.

### Header — reverted to a uniform dark strip (second design-review pass)

`.site-header` (`global.css`) is back to a **flat, solid background**
(`rgba(4, 45, 47, 0.95)`, still with `backdrop-filter: blur(6px)`) — the
horizontal dark→cream gradient from the prior pass is gone. Both logos now
sit on the same dark strip: Riviera's light variant (unchanged) and Axon's
new dark-theme variant (see above), each legible in their native colors with
no box needed. This is simpler and was judged cleaner in review than the
gradient attempt.

**The hamburger toggle reverted too** — `.site-header__toggle span` is back to
`var(--text-on-dark)` (it had briefly switched to `var(--brand-forest)` for
the gradient's now-gone cream zone).

### Rotating hero (new this pass)

`Hero.astro` now cross-fades between 3 images (`Hero1.png`, `Hero2.png`,
`Hero3.png`, supplied July 2026) instead of one static drone shot. All three
render as absolutely-stacked `<Picture>` elements; a tiny inline `<script>`
toggles an `.is-active` class every 4.5s (`ROTATE_INTERVAL_MS`), cross-fading
via `opacity` transition only (`1.2s ease`) — no layout shift, no library. The
first image is `loading="eager"` / `fetchpriority="high"` (it's the LCP
element); the other two are `loading="lazy"`. Under
`prefers-reduced-motion: reduce`, the rotation script never starts and CSS
forces only the first image visible (`display: none` on the rest) — matching
the old single-image hero's effective behavior. The `hero-zoom` slow-scale
keyframe (existing, pre-dates this pass) still applies only to the currently
active slide.

**Overlay retuned (design-review pass):** `.hero__overlay`'s gradient was too
heavy and too blue, washing the photos out cold. Replaced the
teal-tinted stops (`rgba(22,158,170,...)` → `rgba(10,110,133,...)` →
`rgba(4,45,47,...)`) with a neutral near-black/forest scrim
(`rgba(4,20,18,...)` throughout, 0.08 → 0.22 → 0.78 top to bottom) — much
lighter at the top, still strong enough at the bottom to hold headline/CTA
contrast. Added a small `text-shadow` to `.hero__title` as extra legibility
insurance now that the overlay is substantially lighter overall.

### Gated downloads (brochure now stored outside the build)

`assets-private/The RIVIERA-Brochure.pdf` — the real, current brochure,
supplied July 2026 — is stored at the project root, **outside `/public` and
`/src`, and listed in `.gitignore`**. This is deliberate: anything in
`/public` is served at a guessable public URL and gets indexed, which would let
anyone bypass the lead form. The download flow is **unchanged** and still
serves `public/downloads/placeholder-asset.txt` (the stub text file's wording
was updated to drop its old "floor plan" mention, since Floor Plan no longer
exists as a gated asset). `triggerDownload(intent)` — now duplicated in both
`gating.js` (for repeat-visitor direct downloads) and `thank-you.astro` (for
first-time downloads, see below) — carries a `TODO` marking exactly where a
signed, expiring S3 URL fetch should replace the static stub once the backend
exists. **When the real brochure is wired up, do not put it in `/public` —
same rule applies to the Site Plan asset when it arrives.**

### Thank-you page (new this pass)

`src/pages/thank-you.astro` — a real, separate page (not a modal state),
needed so Google Ads/Meta conversion pixels have a distinct URL to fire
against. On successful modal submit, `gating.js`'s submit handler now does
`window.location.href = '/thank-you?intent=<intent>'` (a real navigation)
instead of showing an in-modal success state. The page shows the Riviera logo,
a "Thank You" / "Our team will be in touch shortly" message, and a next-steps
line. If `?intent=` is `brochure` or `siteplan`, an inline script on the page
triggers the placeholder download automatically. The page auto-redirects to
`/` after 5s (`AUTO_REDIRECT_MS`) and also has a visible "Back to Site" button
so the user isn't forced to wait. A `TODO` comment on the page marks exactly
where the Google Ads / Meta conversion pixel should fire, keyed off the
`intent` query param.

### Privacy policy page (new this pass)

`src/pages/privacy-policy.astro` — a real, separate internal page (internal
links are permitted; this isn't an external redirect) containing the full
Disclaimer + Privacy Policy text supplied by marketing, verbatim. The supplied
text contained **no "Origin Kudal" reference to swap** (checked — the task
instructions anticipated one, but this particular pasted text was already
generic/Riviera-agnostic in that respect; flagged here as a non-finding).
Linked from the footer via a truncated line + "Read More".

### Header / hamburger / nav — ungated

`src/components/Header.astro`: the hamburger toggle and all in-nav anchor links
(`Overview`, `Location`, `Growth Story`, `Gallery`, `Site Plan` — anchors updated
to `#overview` to match the renamed first section) work as plain, unconditional
scroll/toggle behavior — **no gating logic touches them at all.** The one
exception inside the nav overlay is the "Enquire Now" button, which is a real
CTA (`data-gate-trigger`) and does open the modal.

### The lead modal

`src/components/LeadModal.astro`, driven by `src/scripts/gating.js`.

**Fields (exactly these, every use of the modal):**
1. Name — text, `required`, `minlength="2"`, placeholder "Your full name".
2. Email — `type="email"`, `required`, placeholder "you@example.com".
3. Country code — `<select>`, ~230 entries from `src/data/country-codes.js`,
   default selection driven by `detectCountryCode()` (see below; currently always
   resolves to `+91 India`).
4. Phone Number — `type="tel"`, `required`, `inputmode="numeric"`, placeholder
   "98765 43210".

**Consent checkbox (required, exact text, now pre-ticked by default):**
> "I authorise Axon Developers & its representatives to contact me with updates
> and notifications via Email/SMS/WhatsApp/Call. This will override DND/NDNC."

The checkbox renders with the `checked` attribute — the user can still untick
it, at which point the submit button disables per the existing validation
rules (unchanged: submit stays disabled until all fields + consent are valid).

**Validation (`gating.js`):**
- Name: trimmed length ≥ 2.
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- Phone: strip spaces/dashes, then `/^\d{7,15}$/`.
- Submit button stays `disabled` until name+email+phone+consent are all valid;
  inline `.has-error` styling appears per-field on blur/input.

**Which CTAs open the modal (explicit interest only):** Hero "Enquire Now",
Header nav "Enquire Now", StickyCta (both buttons: enquiry, brochure),
SitePlanGated ("View Site Plan"), BookSiteVisit, FinalCta. QuickContactStack's
WhatsApp and Call buttons are **direct links, not gated** — unchanged behavior
from the old WhatsApp-only FAB, now extended to the Call button too. Every
gated trigger passes a `data-intent` (`enquiry | siteplan | brochure |
sitevisit`) which becomes the modal's hidden `intent` field and is included in
the object passed to `submitLead()`. **`floorplan` is retired as an intent**
along with the Floor Plan asset itself.

**On successful submit:** `markCaptured()` → `stopPopups()` → real navigation
to `/thank-you?intent=<intent>` (see "Thank-you page" above). The modal itself
no longer shows an in-page success state before this pass's redirect was added.

**Gating was deliberately made aggressive (every click gated) and then rolled
back, in an earlier pass.** The old `GATE_NAV` toggle and the global
click-delegate that gated literally everything (nav, hamburger, gallery tiles)
were removed then and remain removed now. Do not reintroduce a global
click-gate — nav/hamburger/gallery/lightbox are always free; only the named
CTAs above open the modal.

### Country-code auto-detect (prep only)

`detectCountryCode()` in `gating.js` currently just returns `'+91'` (hardcoded).
It's called once on script init and sets the `<select>`'s value if a matching
`<option>` exists. There's a `TODO` comment directly on the function marking
exactly where a `CloudFront-Viewer-Country` header value (available for free once
deployed behind AWS CloudFront — no third-party geolocation call) should be read
in and mapped to a dial code. The dropdown still contains every country; detection
only changes the *default* selection.

### Popup behavior (retuned this pass — scroll triggers removed)

Named constants at the top of `gating.js`:
```js
const POPUP_FIRST_DELAY_MS = 30000;   // first fire, 30s after load
const POPUP_REFIRE_DELAY_MS = 60000;  // single re-fire, 60s after the first
```
- **Scroll-depth triggers are removed entirely** (the old `SCROLL_TRIGGER_THRESHOLDS`
  constant, the `onScroll` handler, and the `scroll` listener are all gone). Timer
  is now the only trigger mechanism.
- Timer: fires once at 30s via `setTimeout`. If the user hasn't converted, it
  re-fires **exactly once more** at +60s (i.e. 90s after page load), then stops
  scheduling further fires for the session — this is a deliberate change from the
  previous behavior (which kept re-firing every 45s indefinitely).
- **Stops completely and permanently** the moment `sessionStorage.getItem
  ('riviera_lead_captured') === 'true'` — checked both inside the timer callback
  and inside the submit handler (`stopPopups()` clears the pending timeout).
- These were previously 15s first-fire / 45s indefinite repeat / 50%+90% scroll
  (and before that, 6s/6s/25-50-75-100% scroll) — each retune was deliberate and
  progressively less aggressive. Don't re-tighten these without being asked; if
  asked to tune again, only touch the two named constants above, and confirm
  with the user whether scroll triggers should come back before adding them.

### Shared carousel (`Carousel.astro` + `carousel.js`) — second design-review pass

The Lifestyle carousel (below) originally had its own bespoke markup/JS. The
Sindhudurg infrastructure section (5 image cards) was then also converted
from a static grid to a matching carousel, and rather than duplicate the
logic, both were refactored onto one shared component + one shared script:

- **`src/components/Carousel.astro`** — owns only the carousel *shell*:
  `.carousel__track` (scroll-snap flex row) + edge-positioned prev/next arrow
  buttons + dot indicators, generated from a `count` prop. Callers pass their
  own card markup as children, each card wrapped in a
  `.carousel__slide[data-carousel-slide]` div — card *visuals* (background
  image, gradient overlay, text) stay owned by the calling section
  (`LifestyleDetail.astro`, `GrowthThesis.astro`), only the mechanics are
  shared.
- **`src/scripts/carousel.js`** — one shared vanilla-JS module (added to
  `index.astro`'s shared script list, unlike the old per-component
  `<script>` pattern) that calls `initCarousel()` on every
  `[data-carousel]` element found on the page. Both the Lifestyle and infra
  carousels get identical behavior by construction: `AUTOPLAY_INTERVAL_MS =
  3200`, `RESUME_AFTER_MS = 4000`, pause-on-pointerdown/touchstart/hover,
  resume after the delay, a debounced `scroll` listener to keep the active
  dot synced with manual swipes, and `prefers-reduced-motion` disabling
  autoplay + forcing instant (`behavior: 'auto'`) scrolls.
- **Shared CSS** (`global.css`, "Shared carousel" block): `.carousel__slide`
  is `flex: 0 0 82%` (60% from 640px, 44% from 960px) — the ~15–20% peek is
  identical on both carousels. **Arrows are edge-positioned** (`left:
  0.5rem` / `right: 0.5rem`, `top: 50%`, constant across all breakpoints) —
  the second design-review pass moved them off the card artwork (they
  previously sat mid-card, tied to the peek percentage, and obscured
  content) to the outer edges of the carousel wrapper instead, per explicit
  design-review feedback. Native touch swipe comes "for free" from
  `scroll-snap-type` on the track — no manual touch-tracking needed (unlike
  `lightbox.js`'s pinch-zoom, which handles a gesture the browser doesn't
  support natively).
- Fixed `aspect-ratio` on every `.carousel__slide` (not a min-height guess)
  is what keeps CLS at ~0 on both carousels regardless of image load timing.

### Lifestyle carousel (`LifestyleDetail.astro`, `id="lifestyle"`)

Rebuilt from a static 2×2 fact-card grid into the shared peek-carousel above.

- Each card: `aspect-ratio: 4/5`, a background photo (`<Picture>`,
  `object-fit: cover`, per-card `object-position` focal point via inline
  `style`) with a bottom-anchored dark gradient overlay
  (`linear-gradient(180deg, transparent 42%, rgba(4,20,18,.88) 100%)`)
  carrying just the bold headline + body copy — the old separate sub-title
  line was dropped per the task's explicit ask to reduce card text.
- **Images chosen** (fresh photos, not reused from `LifestyleGallery`'s 9
  gallery images, so this section doesn't repeat what the gallery already
  shows — copied from `public/images/` into `src/assets/images/`):
  `couple driving the boat.png` (boat/jetty card, `focal: center 55%`),
  `couple walking along villas.png` (architecture card, `focal: center`),
  `river view from site.png` (the "view that stays yours" card, `focal:
  center 58%`), `site view along river drone view.png` (the "Konkan, all
  year" card, `focal: center 58%` — the two drone-ish shots default to `58%`
  per the existing landscape-focal convention, see §9).

### Sindhudurg infrastructure carousel (`GrowthThesis.astro`, `id="growth"`)

Converted from a static grid to the shared peek-carousel above (second
design-review pass) — same mechanics as the Lifestyle carousel via
`Carousel.astro` + `carousel.js`. Card visual design is unchanged (background
photo + bottom dark gradient overlay + ₹ figure + label), but **the aspect
ratio changed from the grid version's `4/3` to `4/5`**, matching the
Lifestyle carousel's cards — needed so the two carousels actually "feel like
the same component" as the task asked, rather than one being visibly
shorter/squatter than the other at the same peek width. The 5 cards and their
figures are unchanged: `infra-coastal-highway.png` (₹68,720 Cr, Coastal
highway), `infra-bridge.png` (₹7,851 Cr, Bridge project),
`infra-expressway.png` (18h → 7–8h, Shaktipeeth expressway, Nagpur–Goa, by
2028–29), `infra-film-city.png` (₹2,000 Cr, Film city),
`infra-underwater-museum.png` (₹46.9 Cr, Underwater museum & scuba centre).

### Gallery grid + lightbox

`LifestyleGallery.astro` (grid) + `Lightbox.astro` (viewer) + `src/scripts/
lightbox.js`. Ungated everywhere — tapping a tile or the map never opens the lead
modal.

- **Grid:** 3-column, uniform 1:1 `ImageFrame` tiles (`gap: 0.3rem`), 9 lifestyle
  photos from `src/data/gallery-images.js`. Each tile is a `<button
  data-lightbox-trigger data-lightbox-index={i}>`. **Capped at `max-width: 720px`
  from 900px viewports up** (new this pass — marketing flagged tiles as too large
  on desktop).
- **Lightbox:** one shared instance mounted once in `index.astro`. Contains 10
  slides total — the same 9 gallery images (indices 0–8, same array/order as the
  grid) **plus the location map at index 9** (appended in `Lightbox.astro`,
  referenced by `LocationConnectivity.astro` via a `MAP_LIGHTBOX_INDEX = 9`
  constant — keep these in sync if the array composition ever changes).
- Prev/Next arrows, 44×44px tap targets, over a `rgba(4,45,47,.92)` scrim.
- Closes via the X button, `Escape` key, or tapping the scrim (not the image
  itself).
- Keyboard `ArrowLeft`/`ArrowRight` navigate; native touch swipe (40px threshold,
  `SWIPE_THRESHOLD_PX` in `lightbox.js`) on the stage — swipe-to-navigate only
  fires when the active image is at `scale === 1` (not zoomed).
- **Pinch-to-zoom + pan**, added specifically to make the location map's labels
  actually readable. Two-finger touch computes a distance ratio → CSS `transform:
  scale()` on the active slide's `<img>` (clamped 1–`MAX_ZOOM`, currently 4);
  single-finger drag pans via `translate()` once `scale > 1`; double-tap toggles
  to 2×. Zoom/pan resets on slide change and on close. `.lightbox__stage` has
  `touch-action: none` so the browser's native pinch/scroll doesn't fight the
  custom handlers. This logic lives entirely in `lightbox.js` — no library.
- Slide switching is a simple `display: none` ↔ `.is-active` toggle per slide —
  **not** a sliding/transform-based track (see §9 for why).
- Body scroll locked while open (`document.body.style.overflow = 'hidden'`).
- Only the open/close opacity fade is animated; that fade is skipped entirely
  under `prefers-reduced-motion: reduce`.

### The location + map section

`LocationConnectivity.astro` (`#location`) holds, in order: road-image banner →
"The Place" heading/body → **"Key Distances"** 4-item fact strip (see §4, item 4,
for the exact list and ordering) → a **full-bleed map**, now the section's
closing visual. Structurally the same shape established in an earlier pass
(full-bleed map, pinch-zoom lightbox — see §9 for the original "map was
illegible when inset" fix); the design-review pass changed the **distances
content** (5 items → 4, "On NH-66" dropped), **removed the two beach/Kudal
checklists entirely**, gave the map extra top/bottom margin so it reads as the
section's focal close rather than being followed by a text list, and widened
the desktop cap to `960px`.

**Nav anchor points at the map, not the section top (second design-review
pass).** The hamburger nav's "Location" link previously scrolled to `#location`
(the section root, landing on the "The Place" heading) — now it's
`#location-map`, an `id` on the `.location-map-wrap` div specifically, so
clicking "Location" lands on the map itself. `.location-map-wrap` carries its
own `scroll-margin-top: 88px` (not the generic `section[id] { scroll-margin-top:
4rem }` rule, since this target is a div, not the section) — 88px = the fixed
header's actual rendered height (2 × 1rem padding + the 44px nav-toggle, its
tallest child = 76px) plus ~12px breathing room, so the map isn't tucked
under the header after the jump.

**Data shape:** `keyDistances` in `LocationConnectivity.astro` is `{ name:
string; time: string }[]`. The `nearbyBeaches` / `otherNearby` arrays and their
`{ name: string; time?: string }[]` shape (documented in earlier passes as "kept
simple for a later drop-in") no longer exist — the checklists were deleted, not
just hidden. If per-beach detail is wanted back later, it'll need to be
reintroduced from scratch (not restored from dead code, since none was left).

### Image focal points currently applied

| Image | Used in | `focal` / mode |
|---|---|---|
| Hero1.png / Hero2.png / Hero3.png | Hero (rotating bg) | default center (no explicit prop; hero uses raw CSS, not `ImageFrame`) |
| road to location.png | LocationConnectivity banner | `center 58%` |
| Beaches from site (on India's Map).png | LocationConnectivity map | `mode="contain"` — never cropped, no focal needed |
| villa view with swimming pool.png | Gallery grid + lightbox | `center 58%` |
| sitting along the swimming pool.png | Gallery grid + lightbox | `center 65%` |
| boat along with dock.png | Gallery grid + lightbox | `center 58%` |
| boat in river sunset.png | Gallery grid + lightbox | `center 58%` |
| couple looking at river.png | Gallery grid + lightbox | `center 30%` |
| walking along the garden.png | Gallery grid + lightbox | `center 60%` |
| river view from living room.png | Gallery grid + lightbox | `center` (interior shot) |
| sunset view of villa lined up.png | Gallery grid + lightbox | `center 45%` |
| villa lined up against the river.png | Gallery grid + lightbox | `center 55%` |
| infra-coastal-highway.png / infra-bridge.png / infra-expressway.png / infra-film-city.png / infra-underwater-museum.png | GrowthThesis infra cards | `object-fit: cover`, no focal prop (rendered via raw `<Picture>`, not `ImageFrame`) |
| couple driving the boat.png | Lifestyle carousel (boat/jetty card) | `center 55%` |
| couple walking along villas.png | Lifestyle carousel (architecture card) | `center` |
| river view from site.png | Lifestyle carousel (view card) | `center 58%` |
| site view along river drone view.png | Lifestyle carousel (Konkan card) | `center 58%` |
| logo.png / logo-dark.png | Header/Modal/Footer/Thank-you | N/A — rendered at natural aspect via `<Image>`, not `ImageFrame` |
| Axon_logo.png / axon-logo-dark-theme.png (src/assets copies, both cropped to their artwork bbox, see "The Axon logo — TWO files, two contexts") | AboutDeveloper (original) / Header (dark-theme) respectively | N/A — rendered via `<Image>` directly on each section's background, no chip |

Note: the lightbox itself always uses `object-fit: contain` for every slide
(gallery photos included) — it shows the *whole* image regardless of how that
same photo is cropped in its grid tile. The `focal` values above only govern the
grid-tile crop. The old `4.png` Sindhudurg infographic composite is no longer
imported anywhere (superseded by the 5 infra image cards) but remains on disk.

### Current metrics

**Not re-measured this pass** — this was an explicit "front-end only, build-must-
pass, no full audit" task (per the user's instruction). `npm run build` was
confirmed green and the required string/collision checks were verified (§10),
but Lighthouse was not re-run. The rotating hero (3 images vs. 1, though only
one is eager-loaded) and the 5 new infra card images are the most likely
candidates to shift the payload/LCP numbers from the last recorded run
(~227 KiB / 100 Lighthouse / ~0.0001 CLS, itself already stale — see the prior
version of this file's own caveat about re-running before trusting it). **Re-run
Lighthouse against `astro preview` (never `astro dev`) before quoting any
number as current.**

## 5. HARD CONSTRAINTS (never violate)

- Mobile-first, 375px baseline.
- No individual names anywhere.
- No phase / roadmap / "30-60-90" / timeline language anywhere. (The July 2026
  brochure's own "Sindhudurg's 10-Year Growth Trajectory" chart uses phase
  language — Airport & Aerocity Operational → Infrastructure Completion →
  Tourism boom phase → Market maturity → Premium positioning. This was
  deliberately **not** ported to the site; flagged in §11.)
- First-person plural voice ("we/our") in all copy.
- No external links or outbound redirects — **two approved exceptions:** the
  WhatsApp floating button (`wa.me/919355499004`, prefilled message, opens in a
  new tab) and the **Call button** (`tel:+919821003165`, direct dial). **These
  are two deliberately different numbers** — updated in a later pass; do not
  make them match. Internal links to `/thank-you` and `/privacy-policy` are
  fine (they're not external). No other external links anywhere.
- **No RERA references anywhere** — the project has no RERA number. "OC Applied"
  is the status indicator used instead (see §4, RivieraOverview). Do not
  reintroduce a RERA line or QR code.
- Never invent claims, distances, or drive times. All content must trace back to
  `docs/brand-guidelines.md`, the brochure, or an explicit, literal instruction
  from the user/marketing (see §11 for the specific figures given this pass that
  aren't independently sourced in either document). If a fact isn't in one of
  those three places, list it without the number rather than estimating one.
- Keep all disclaimers intact and relevant to what's still on the page: the
  infrastructure-timelines-subject-to-change disclaimer. The waterfront-premium-
  sourcing and appreciation-projection disclaimers were removed along with the
  sections they supported (WaterfrontPremium, InvestmentCase) — don't re-add them
  unless those sections come back.
- Animations: `transform`/`opacity` only, GPU-composited, must respect
  `prefers-reduced-motion: reduce` everywhere (reveal-on-scroll, hero
  cross-fade + zoom, modal transitions, lightbox fade, the new `.pulse-cta`
  sticky-button animation).
- No JS libraries — no lightbox library, no animation library, no form-validation
  library. All of `reveal.js`, `lightbox.js`, and `gating.js` are hand-written
  vanilla JS, loaded as a single deferred `type="module"` script from
  `index.astro`. The hero's rotation script and the thank-you page's
  download/redirect script are small inline `<script>` blocks in their own
  `.astro` files — same "no library" rule applies.
- Lighthouse mobile must stay 90+ (not re-measured this pass — see §4).
- Gated assets (brochure, site plan) must never live in `/public` or `/dist` —
  see "Gated downloads" in §4.

## 6. KEY DECISIONS ALREADY MADE (do not re-litigate)

- **The cream-background Riviera logo variant is a solid-color raster recolor
  (`logo-dark.png`), not a CSS `filter` chain.** Keep this approach if that logo
  needs recoloring again before a real designer dark variant arrives. **This
  approach does NOT apply to the Axon logo** — Axon's mark carries its own brand
  colors that would be lost by a flat recolor; instead, **two separate Axon
  files exist** (crimson+dark-grey "original" for cream backgrounds, crimson+
  white "dark-theme" for dark backgrounds — see §4, "The Axon logo — TWO
  files, two contexts") and the correct one is picked per location via
  `AxonLogo.astro`'s `variant` prop. Two earlier approaches were tried and
  retired for this: a cream chip/box around the logo, then a horizontal
  dark→cream header gradient — see below.
- **The header background is a uniform solid strip**
  (`rgba(4, 45, 47, 0.95)` + `backdrop-filter: blur(6px)`) — **this is the
  second reversion**. First pass: flat scrim + cream chip around Axon. Second
  pass (first design-review round): a horizontal dark→cream gradient, no chip.
  Third and current state (second design-review round): the gradient was
  judged a "muddy smear" rather than a deliberate design element and was
  reverted to a uniform dark strip — the dual-logo contrast problem is now
  solved by using the correct Axon logo *file* for a dark background (see
  above) rather than by varying the header's own background. **Do not
  reintroduce the gradient** without a specific request — it was tried and
  explicitly rolled back. The hamburger toggle is back to
  `var(--text-on-dark)` accordingly.
- Gating is unconditionally ungated for nav, hamburger, and the gallery/lightbox.
  Only explicit-interest CTAs open the modal. **Do not re-add a global
  click-gate** — this was tried and explicitly reversed in an earlier pass.
- The lead form is a **modal**, not an anchor-scroll target, and **submission now
  redirects to a real page (`/thank-you`)** rather than showing an in-modal
  success state — added this pass specifically for Google Ads conversion
  tracking, which needs a distinct URL. Don't revert to an in-modal-only success
  state without re-solving that tracking requirement.
- The **gallery is a grid + lightbox, not a carousel** (see §9 for why a
  carousel was tried once and broke). Do not reintroduce a sliding/auto-
  advancing carousel without being asked. The **hero's rotation is a simple
  cross-fade between absolutely-stacked images, not a carousel/track either** —
  same reasoning applies if extending it (e.g. don't add swipe/drag controls
  without being asked).
- One reusable modal, one `submitLead(data)` stub function
  (`console.log`s and resolves). Every entry point passes an `intent` field
  (`enquiry | siteplan | brochure | sitevisit` — `floorplan` retired this pass)
  so the eventual CRM integration can track source.
- Popup aggressiveness has been dialed back twice now (6s/6s/25-50-75-100% scroll
  → 15s/45s/50-90% scroll → **30s/90s, timer-only, no scroll triggers**, this
  pass). It must still stop permanently after submit. If asked to retune again,
  edit only the two named constants in `gating.js`, and check with the user
  before reintroducing scroll triggers.
- Form fields are fixed: Name, Email, Country code (dropdown, default-detected,
  currently always +91), Phone. Plus a required consent checkbox with the exact
  text in §4 — **now pre-ticked by default** (this pass; user can untick). Do not
  add or remove fields without being asked.
- WhatsApp and Call buttons do **not** open the modal — both are direct,
  user-initiated contact channels (`wa.me` and `tel:` respectively).
- The site-plan gate is a genuinely separate mechanic from the modal's own
  gating: the *visual* blur/lock UI lives in `SitePlanGated.astro` and is
  toggled by `.gate.is-unlocked` — it doesn't have its own inline form. **Floor
  Plan is retired** — Site Plan is the only gated asset in this section now.
- Location content is consolidated into one section (`LocationConnectivity.astro`)
  rather than split across two.
- **The Waterfront Premium, Investment Case, and Axon Promise sections are
  removed, not hidden** — their component files were deleted this pass. If any
  of them need to come back, they'll need to be rebuilt or restored from git-free
  memory of this file's prior revision (no git history exists — see §1).
- **Sticky buttons are capped at exactly 4 total** (2 in the bottom bar, 2 in the
  right-side stack) — down from 6 (the old 2-button bar + 4-tab side stack). Do
  not add a 5th sticky button without being asked; if a new CTA needs sticky
  placement, it should replace one of the existing 4, not add a 5th.

## 7. OPEN QUESTIONS / PENDING (flag these, don't guess)

- **Display font:** currently Oswald as a placeholder. The real brand font is
  Trade Gothic LT Std Bold Extended — **web license not yet confirmed.** It is
  isolated to the single `--font-display` CSS variable in `global.css` for an
  easy one-line swap once licensing is resolved.
- **Need a real dark-on-transparent logo variant from the designer** (SVG
  ideal) for The Riviera's own logo. The current `logo-dark.png` (solid
  forest-green recolor) is a functional stopgap, not a designer asset.
- **Axon Developers' logo contrast** — flagged this pass, not yet resolved with
  real design input. See §4, "The Axon logo," for the cream-chip stopgap and
  exactly what to re-verify if real brand hex values arrive.
- **Pending assets:** Site Plan is still a `<Placeholder>` component (dashed
  cream box). The 5 infra card images, both logos, and the 3 hero images are no
  longer pending — all real, supplied July 2026.
- **Brand hex values** were sampled from the brochure PDF render (per
  `docs/brand-guidelines.md`) and may shift ±2–3 points from the designer's actual
  swatches if/when those are provided.
- **Gated assets are placeholder files** (`public/downloads/placeholder-asset.txt`)
  for both intents now that Floor Plan is retired (brochure, siteplan). The real
  brochure file itself now exists (`assets-private/The RIVIERA-Brochure.pdf`) but
  is intentionally not wired into the download flow yet — see §4, "Gated
  downloads."
- **RERA number:** does not exist for this project. "OC Applied" is the
  deliberate substitute status indicator (this pass). If a RERA number is issued
  later, adding it back is a deliberate content decision to be made explicitly.
- **"OC Applied" itself is unconfirmed against any source document** — it
  appears in neither `docs/brand-guidelines.md` nor the July 2026 brochure (which
  still says "clear freehold title," and separately has a "Zero Waiting — All
  Approvals in Place" placeholder headline). It was supplied directly by
  marketing for this pass and used as instructed, but **this is the single
  highest-priority item to confirm** — "OC Applied" (Occupancy Certificate
  applied for) and "freehold title" describe different, non-overlapping legal
  states, and neither matches "all approvals in place." See §11.
- **The "60 min to Goa International Airport (MOPA)" and "50 min to Sindhudurg
  Airport" figures are unconfirmed against any source document** — same
  situation as OC Applied. See §11.
- **Country-code detection is unimplemented**, just prepped — see §4. Needs the
  actual CloudFront-Viewer-Country wiring once deployed (§8, item 5).
- **The "About the Developer" section's placement (item 9, after Site Plan) and
  the folding of the old scarcity statement into RivieraOverview (item 3) were
  both this agent's interpretation of an "ideal flow" list that didn't name every
  prior section explicitly** — confirm both with marketing if the exact
  positioning matters.

## 8. WHAT IS DELIBERATELY NOT BUILT YET (in order)

These are separate, isolated steps. Do not start them unless explicitly asked:

1. **Backend** — `submitLead()` is a stub (`console.log` only, in
   `src/scripts/gating.js`). Planned: leads POST to a small AWS Lambda (behind API
   Gateway) which (a) writes the lead to DynamoDB first, (b) sends an SES email
   notification, (c) forwards to the Sell.Do CRM, (d) retries failed Sell.Do
   pushes via SQS. Sell.Do API key + endpoint not yet received. **Explicitly out
   of scope for the July 2026 marketing revision pass** (front-end only).
2. **Gated asset serving** — the real brochure (now sitting in
   `assets-private/`) and the real site plan (still pending) must be served via
   signed, expiring S3 URLs issued only *after* lead capture — never a publicly
   guessable path. `TODO` comments in `gating.js`'s `triggerDownload()` and in
   `thank-you.astro`'s equivalent function mark exactly where this fetch goes —
   keep both in sync if this changes.
3. **Meta pixel** — PageView, Lead (on submit), ViewContent (on gate unlock),
   plus a WhatsApp-click and Call-click event. **Explicitly out of scope for the
   July 2026 marketing revision pass.** `TODO` comments mark the WhatsApp click
   handler and the new Call click handler in `gating.js`, and the `/thank-you`
   page's own script (for the Google Ads/Meta conversion fire, keyed off
   `?intent=`).
4. **Performance hardening pass** (post-pixel/CRM, since third-party scripts
   typically regress Lighthouse — re-baseline after each is added, and also
   re-baseline after this pass's hero-rotation/infra-card changes regardless,
   since neither was measured — see §4).
5. **AWS deployment** — S3 + CloudFront, ACM certificate for HTTPS. Once live,
   wire the real `CloudFront-Viewer-Country` value into `detectCountryCode()`
   (see the `TODO` in `gating.js`).
6. **Domain** — GoDaddy domain, DNS pointed at CloudFront. Allow time for DNS
   propagation before go-live.

## 9. GOTCHAS LEARNED

- **`astro:assets`'s `<Image>` only generates the exact `width` you request —
  it does not auto-generate a higher-density version for retina screens.** Both
  `Logo.astro` and `AxonLogo.astro` fix this by requesting `width * 3` from the
  optimizer and letting the container's own CSS scale it back down — apply the
  same pattern to any other small, sharp-critical raster asset.
- **That "container's own CSS scales it back down" half of the pattern only
  works if the container actually has a definite width — a real bug, caught
  and fixed in the design-review pass.** `AxonLogo.astro`'s wrapper `<span>`
  had `width: 100%` on its `<img>` but no explicit width on the span itself;
  with no definite containing block to resolve the percentage against, the
  browser fell back to the image's full fetched raster size (3× the intended
  display size) instead of scaling down — this is very likely why the Axon
  logo looked oversized even before the transparent-padding problem was
  considered. `Logo.astro` never had this bug because its *caller*
  (`.site-header__logo { width: 100px }` etc.) always supplies a fixed-width
  container. Fixed by setting `style="width: {width}px"` directly on
  `AxonLogo.astro`'s own wrapper so it's self-contained regardless of caller
  CSS. **Lesson: when this width*3-then-scale-down pattern silently renders
  oversized, check for a missing definite-width container before assuming
  it's a source-image problem.**
- **Always re-read an asset fresh when told it's been updated — don't trust
  a cached mental model from earlier in the session.** Caught the Axon logo's
  actual colors (crimson + dark grey, not brand-neutral) this way rather than
  assuming it would need the same treatment as The Riviera's logo.
- **A carousel was built, then broke, then was removed — root cause worth
  remembering.** A `:global(...)` selector was used inside plain `global.css`
  (not a component's scoped `<style>` block), where it means nothing and is
  silently dropped by the browser — the slide images never got their sizing/crop
  rules. Never write `:global(...)` outside an Astro component's own `<style>`
  block. Both the gallery (grid + lightbox toggling) and this pass's hero
  rotation (absolute-stack + opacity cross-fade) deliberately avoid any
  transform-based sliding track for this reason.
- **Kill stray `astro dev` processes before running Lighthouse.** A dev server
  left running can squat on the port `astro preview` tries to use, producing a
  falsely low score. Always verify you're hitting the production `astro preview`
  build (check `lsof -i :<port>` if a score looks suspicious).
- **Image focal points:** most of this project's drone/landscape photos have
  their subject sitting in the lower-middle band of the frame. Default new,
  unverified landscape/drone images to `object-position: center 58%`, not plain
  `center`. Interior shots default fine to plain `center`. The 3 new hero images
  and 5 new infra card images were **not** individually focal-tuned this pass
  (hero uses full-bleed `object-fit: cover` with no crop control needed at that
  scale; infra cards use a fixed `4/3` cover crop) — revisit if any image crops
  awkwardly once viewed in a real browser.
- **Infographic/map-type images** (the location map) must use `ImageFrame`'s
  `mode="contain"` on the cream background, never `mode="cover"`. The 5 new
  infra cards are a **different case** — they're real photographs (not
  diagrams), so `object-fit: cover` is correct there; they're composited with a
  text overlay instead, which is why they bypass `ImageFrame` entirely (see §2).
- **`astro:assets` only optimizes imported images**, not anything referenced from
  `public/` by URL string — see §2 for the full workflow this implies.
- Astro's scoped component `<style>` blocks can silently override global CSS
  rules with the same specificity if they target the same selector unconditionally.
  Caught and fixed once in `SitePlanGated.astro` in an earlier pass; this pass
  added explicit `z-index`/`pointer-events` rules to the same component
  defensively (see §4, item 8) without being able to reproduce a reported
  desktop click bug via static review — worth a real-browser check.
- **Always double-check a file actually exists before building on it.** This
  pass confirmed the Axon logo, 3 hero images, 5 infra images, and the updated
  brochure PDF were all already present under `public/images/` and the project
  root (respectively) before writing any code against them, rather than
  assuming from the task description alone.
- **A pip-managed system Python may refuse global installs (PEP 668
  "externally-managed-environment").** Reading the brochure PDF's text for the
  discrepancy check (§11) needed `pypdf`; installed into a throwaway venv
  (`/tmp/pdfenv`) rather than forcing a system-wide install with
  `--break-system-packages`. That venv is outside the repo and not part of the
  project — recreate it (or use any PDF text tool) if this check needs redoing.

## 10. VERIFICATION DONE (July 2026 marketing revision pass)

- `npm run build` — **passes**, 3 pages built (`/`, `/thank-you`,
  `/privacy-policy`).
- Grepped `src/` for `Floor Plan`, `Freehold`, `RERA`, `Next door — Goa` —
  **none found** as live copy (one harmless code-comment mention of "Next door —
  Goa" documenting the removal itself). The static placeholder-asset stub file's
  wording was also updated to drop its own "floor plan" mention.
- Sticky-button collision check at 375px — **no collision**, by CSS math: the
  bottom bar is ~50–60px tall; the right-side stack's bottom edge sits at 76px
  from the viewport bottom (`bottom: 4.75rem`), clearing the bar with margin to
  spare. Not verified with a real rendered screenshot this pass — recommend a
  quick visual check before shipping.
- **Not done this pass:** a full Lighthouse re-run (see §4), a real-browser check
  of the SitePlanGated desktop-click fix (see §4, item 8, and §9), and visual
  confirmation of the Axon logo's contrast against real (vs. sampled) brand
  colors (see §7).

## 11. BROCHURE-VS-GUIDELINES DISCREPANCY REPORT (July 2026)

Read in full (37 pages, `assets-private/The RIVIERA-Brochure.pdf`) and compared
against `docs/brand-guidelines.md`. **None of this was auto-applied to site
copy** — flagged here for the user to decide. Ranked by materiality:

1. **"Freehold" vs "OC Applied" — direct conflict.** The brochure (page 14)
   still reads "Every plot comes with a clear freehold title... CLEAR FREEHOLD
   TITLE, READY TO BUILD." This pass's marketing instruction explicitly replaced
   "Freehold" with "OC Applied" everywhere on the site. These describe different
   legal states (a freehold title vs. an Occupancy Certificate application) —
   this isn't a wording preference, it's a substantive claim change. Separately,
   brochure page 26 has a placeholder headline "ZERO WAITING — ALL APPROVALS IN
   PLACE," which doesn't match "applied" (pending) either. **Recommend
   confirming the actual current title/approval status before the site ships
   with "OC Applied."**
2. **MOPA/Sindhudurg-Airport distance figures are not corroborated anywhere.**
   Brand-guidelines.md and the brochure (page 13) both give only a generic "50
   mins from Airport" (no name, no MOPA, no 60-min Goa figure). The "60 min to
   Goa International Airport (MOPA)" and "50 min to Sindhudurg Airport" (as a
   named, distinct airport) used on the site this pass came directly from
   marketing's literal instruction, not from either source document. Recommend
   double-confirming both before the next content review.
3. **Underwater museum/scuba centre figure is combined on-site but split in the
   brochure.** Brochure page 20: "₹46.9 Cr. is sanctioned for an underwater
   museum and artificial reef" plus a separately-figured "World-class scuba
   diving centre... ₹20 crore with 800+ jobs." The site's infra card (per
   marketing's explicit card list this pass) shows one combined "₹46.9 Cr —
   Underwater museum & scuba centre" line. Not necessarily wrong, but the ₹20 Cr
   scuba figure and the 800+ jobs detail are currently unused.
4. **Shaktipeeth expressway has a ₹20,787 Cr figure in the brochure (page 22)
   that isn't on the site or in brand-guidelines.md.** The site's card for this
   project shows only the time-reduction stat ("18h → 7–8h") with no rupee
   amount, making it the only one of the 5 infra cards without a leading ₹
   figure. Worth asking marketing whether to add it for consistency.
5. **Investment Case content (brochure pages 28–31) — moot for this pass since
   the section is removed, but worth recording for later:** the brochure now
   cites specific historical price-per-sq-ft figures for Goa (2008: ₹1,000 →
   2026: ₹15,000+), Alibaug (2012: ₹1,500 → 2026: ₹12,000+), and Lonavala (2010:
   ₹2,000 → 2026: ₹10,000+) — brand-guidelines.md's existing USP #7 description
   explicitly says no historical figures for those three cities should be cited
   or implied. If InvestmentCase is ever rebuilt, don't port these numbers in
   without a legal/compliance check. The brochure also has new specific rupee
   projections (₹50L → ₹1.4Cr/₹1.75Cr/₹2.1Cr conservative/realistic/optimistic,
   and a separate "₹50L → ₹1.8Cr by 2034" headline) not present in
   brand-guidelines.md's generic 2.8×–4.2× framing.
6. **The brochure's own growth-trajectory chart (page 28) uses phase language**
   ("Airport & Aerocity Operational," "Infrastructure Completion," "Tourism boom
   phase," "Market maturity," "Premium positioning" across a 10-year, 5-phase
   axis) — this directly conflicts with this project's own hard "no phase /
   roadmap language" constraint. Confirmed **not** ported to the site. Flagging
   only so it isn't accidentally copied from the brochure in a future pass.
7. **Hero tagline corroboration (not a discrepancy, a confirmation):** the
   brochure's page 9 headline "BEHOLD INDIA'S MOST EXCLUSIVE RIVERFRONT ADDRESS"
   closely matches this pass's new hero tagline, "India's Most Exclusive River
   Side Living" — the marketing-supplied tagline change appears to be
   brochure-aligned, not an outlier.
8. **No "Origin Kudal" reference found anywhere in the brochure or in the
   privacy-policy text supplied for this pass** — see §4, "Privacy policy page."
9. **Beach names previously used in `LocationConnectivity.astro`** (Munage,
   Achara, Tondavali, Malvan, Tarkarli, Bhogwe, Vengurla) and "Kudal Railway
   Station" did not appear as extractable text anywhere in the brochure (they
   may exist only on a map graphic that wasn't OCR'd by this check). **Now
   moot as a discrepancy** — the design-review pass removed both checklists
   from the page entirely (§4, "The location + map section"); kept here only
   as a historical note in case the list is ever rebuilt.

## 12. VERIFICATION DONE (design-review pass, July 2026)

Second pass on top of §10/§11's marketing-revision pass — 7 numbered sections
(header gradient, hero overlay, distances grid, location section, lifestyle
carousel, sticky-button animations, RivieraOverview restructure), front-end
only.

- `npm run build` — **passes**, still 3 pages built.
- Grepped `src/` for `Floor Plan`, `Freehold`, `RERA`, `Next door — Goa`,
  `On NH-66'` (as a standalone fact-strip entry) — **none found** as live copy;
  only historical mentions inside code comments explaining the removals.
  `OC Applied` confirmed still present, unchanged wording.
- Sticky-button collision check at 375px — **no collision**, unchanged geometry
  from §10 (the ring-wrapper redesign kept both circular buttons at 56×56px,
  same `bottom: 4.75rem` stack position). Still not verified with a real
  rendered screenshot — no browser/screenshot tool was available this pass
  either; recommend a visual check before shipping, especially the header
  gradient (see below) and the lifestyle carousel's peek/swipe feel.
- **A real bug was caught and fixed mid-pass, not just cosmetic polish:**
  `AxonLogo.astro`'s wrapper had no explicit CSS width, so the Axon logo was
  rendering at its full 3×-fetched raster size instead of the intended
  display size — see §9 for the full explanation. Caught by inspecting the
  compiled build output's HTML/CSS directly (`grep`-ing `dist/`), not by
  visual inspection — worth doing this kind of build-output spot-check on any
  future sizing-sensitive component change, since it wouldn't have been
  caught by `npm run build` succeeding alone.
- **Header gradient — implemented and compiled-CSS-verified, but not
  screenshot-verified.** See §4, "Header gradient" and "The Axon logo," for
  the honest assessment given (reads as premium/intentional in this
  implementer's judgment from static review) and the explicit caveat that
  this wasn't checked against a real rendered page across all three hero
  images. **Flag this to the user as the single highest-value thing to
  visually spot-check before treating this pass as fully verified.**
- CLS risk areas (explicitly called out in the task): the lifestyle carousel
  uses a fixed `aspect-ratio` per card (not a min-height guess), and both
  sticky-button animations (shine sweep, pulse ring) animate a pseudo-element
  via `transform`/`opacity` only, never the real button/card box — neither
  should introduce layout shift, but this was reasoned from the CSS, not
  measured with a Lighthouse/CLS tool this pass.
- Lifestyle carousel images used: `couple driving the boat.png`, `couple
  walking along villas.png`, `river view from site.png`, `site view along
  river drone view.png` — see §4, "Lifestyle carousel," for per-card mapping
  and focal points. All four are images not already used in
  `LifestyleGallery`'s 9-photo set.
- **Not done this pass:** a full Lighthouse re-run, any real-browser/screenshot
  verification (no such tool was available), and re-confirmation of the
  brochure-vs-guidelines discrepancies in §11 (none of the design-review
  pass's changes touch copy/claims covered by that report, so it wasn't
  re-run).

## 13. VERIFICATION DONE (second design-review pass, July 2026)

A follow-up refinement pass on top of §12: header reverted from gradient to a
uniform solid strip (using a second, supplied dark-theme Axon logo file
instead), carousel arrows moved to the wrapper edges, the infra section
converted from a grid to a carousel sharing the Lifestyle carousel's
component/logic, and the "Location" nav link fixed to land on the map.

- `npm run build` — **passes**, still 3 pages built.
- Grepped `src/` for `Floor Plan`, `Freehold`, `RERA`, `Next door — Goa` —
  **none found** as live copy; one historical code-comment mention only.
- **Axon logo file confirmed per location:** header uses
  `variant="dark-theme"` (`axon-logo-dark-theme.png`, crimson + white
  wordmark); `AboutDeveloper.astro` uses the default `variant="original"`
  (`Axon_logo.png`, crimson + dark-grey wordmark) — confirmed by reading both
  call sites directly, not assumed.
- **Header gradient removed**, replaced with `rgba(4, 45, 47, 0.95)` flat
  background — confirmed via `global.css`, no `linear-gradient` left on
  `.site-header`. Hamburger toggle reverted to `var(--text-on-dark)`.
- **Carousel arrows confirmed at the wrapper edges** on both carousels
  (`.carousel__arrow--prev { left: 0.5rem }` / `--next { right: 0.5rem }`,
  constant across breakpoints — no longer tied to the peek percentage or
  sitting over card art) — shared CSS in `global.css`, so both carousels are
  identical by construction, not by manual matching.
- **Both carousels confirmed to share one component/module:**
  `Carousel.astro` (shell) + `carousel.js` (behavior), used by both
  `LifestyleDetail.astro` and `GrowthThesis.astro`. Same `AUTOPLAY_INTERVAL_MS
  = 3200` / `RESUME_AFTER_MS = 4000`, same peek (82%/60%/44%), same
  pause-on-interaction/resume behavior — one shared script initializes every
  `[data-carousel]` element on the page, so there is no risk of the two
  drifting apart the way two independent implementations could.
- **Location nav anchor confirmed fixed:** `#location-map` id added to
  `.location-map-wrap`, nav link updated in `Header.astro`, `scroll-margin-top:
  88px` computed from the actual header height (76px) + 12px buffer — see §4,
  "The location + map section," for the full math. Reasoned from the CSS, not
  measured with a real scroll-and-screenshot test (no browser tool available).
- **CLS:** both carousels use a fixed `aspect-ratio: 4/5` on every slide (the
  infra carousel's ratio changed from the old grid's `4/3` to match the
  Lifestyle carousel — see §4, "Sindhudurg infrastructure carousel," for why);
  sticky-button animations (unchanged this pass) still animate only a
  pseudo-element/wrapper, never the box itself. Reasoned from the CSS, not
  measured.
- **Not done this pass:** any real-browser/screenshot verification (no such
  tool was available in this environment either — same limitation as §12),
  a full Lighthouse re-run, and re-confirmation of the §11 brochure
  discrepancies (this pass touched no copy/claims covered by that report).
