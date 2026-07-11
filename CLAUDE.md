# CLAUDE.md — The Riviera Landing Page

> Read this file first. It should be enough to understand the project, the locked
> decisions, the constraints, and what's next — without re-scanning the codebase.

## 1. PROJECT

- **What this is:** a single-page, mobile-first marketing landing page for "The
  Riviera" — 20 river-touching villa plots by Axon Developers, on the Gad River,
  Konkan, Sindhudurg (Mumbai–Goa corridor, NH-66).
- **Purpose:** lead capture from Meta ad traffic. Fast mobile load is priority #1 —
  ad traffic has a high bounce risk on slow pages.
- **Tagline (locked):** "India's Rarest Riverfront Address."
- **Source of truth for all copy/claims:** `docs/brand-guidelines.md`. A second
  reference doc, `docs/reference-site-notes.md`, captures structural/mechanical
  patterns (section order, form mechanics, popup timing) borrowed from a competitor
  site during early layout work — it does not govern content or brand.

## 2. STACK & ARCHITECTURE

- **Astro 7** (static output, zero JS by default), vanilla CSS via custom
  properties, npm. No UI framework, no Tailwind.
- **No git repository is initialized in this project.** There is no commit
  history to check — this file and the docs/ folder are the only persistent record
  of decisions.

### Folder structure (actual, current)

```
/src
  /assets/images   — source images actually imported/optimized (subset of public/images)
  /components
    Header.astro         — fixed header: logo + hamburger + nav overlay
    ImageFrame.astro      — shared optimized-image wrapper for grid tiles/banners
    Lightbox.astro         — single shared full-size image viewer (gallery + map)
    Logo.astro              — logo wrapper, light/dark variant prop (see §4)
    LeadModal.astro          — the single reusable lead-capture modal
    Placeholder.astro        — dashed-box placeholder for still-pending assets
    StickyCta.astro          — mobile-only fixed bottom bar (2 buttons)
    StickySideTabs.astro     — fixed vertical side tabs (4 buttons, all viewports)
    WhatsAppButton.astro     — fixed WhatsApp FAB, bottom-right
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
  /scripts
    reveal.js               — IntersectionObserver scroll-reveal (.reveal → .is-visible)
    lightbox.js               — vanilla lightbox logic (see §4)
    gating.js                — modal open/close, validation, submit, popup timers,
                                country-code auto-detect prep, WhatsApp TODO
  /styles
    global.css               — design tokens + every shared class (see §3)
/public
  /images    — ALL raw source photos + original logo.png, unoptimized, served as-is
  /fonts     — self-hosted woff2 (Inter 300/400/700, Oswald 700)
  /downloads — placeholder-asset.txt (stub for gated brochure/site plan/floor plan)
  favicon.ico, favicon-16.png, favicon-32.png, apple-touch-icon.png
             — generated from the logo's wave mark on a solid teal background
               (see §4); wired into Layout.astro's <head>
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
job from `ImageFrame`'s fixed-aspect-ratio tiles.

### Astro image gotcha (important, easy to get wrong)

Astro's built-in image optimizer (`astro:assets`) only processes images that are
**imported as modules from `src/`**. Anything referenced by a plain `/images/...`
URL string pointing into `public/` is served raw — no resizing, no AVIF/WebP, no
responsive `srcset`.

**Current state:** `public/images/` holds all raw original photos (unoptimized) as
delivered, plus the logo. Only the images actually used on the page have been
**copied** into `src/assets/images/` and imported from there — that's what gets
optimized. `public/images/` itself is not linked from the page and exists as the
untouched source folder.

**Workflow for any new image:** copy the file into `src/assets/images/`, `import`
it in the relevant `.astro` (or `.js` data) module, and render it through
`ImageFrame` (grid/banner tiles) or `astro:assets`'s `<Picture>`/`<Image>` directly
(logo, lightbox slides). Never reference `public/images/*` directly in markup if
optimization matters.

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

Two extra non-palette colors exist, each commented in `global.css` as
deliberately outside the brand system:
- `#25D366` (WhatsApp's own brand green) — WhatsApp FAB only.
- The real logo (see below) is a flat teal-gradient-to-white asset baked as a
  raster image, not CSS — it doesn't introduce a new token, but its background
  isn't transparent (see §7).

- **Body font:** Inter, self-hosted WOFF2, weights 300/400/700, Latin-subset,
  `font-display: swap`.
- **Display font:** Oswald, self-hosted WOFF2, weight 700 — a **placeholder**
  standing in for the real brand display face (see §7).

## 4. CURRENT STATE — WHAT'S BUILT

Page section order (from `src/pages/index.astro`), top to bottom:

1. **Header** (fixed) + hamburger nav overlay — *ungated*, see below. Logo is the
   real asset now (`Logo.astro`), not a placeholder.
2. **Hero** (`#home`) — full-viewport Gad River drone image, gradient overlay,
   subtle CSS zoom (disabled under reduced-motion), "Enquire Now" (gated CTA) +
   "Discover More" (plain anchor scroll, ungated).
3. **ScarcityHook** (`#scarcity`) — full-width statement section, "Only 1% of
   India's land is riverfront."
4. **UspGrid** — 3 stat cards (20 plots / freehold / private access), 2-up grid,
   odd card spans full width.
5. **LocationConnectivity** (`#location`) — the merged location section:
   road image banner → address copy → "Key Distances" 4-tile stat grid
   (beaches/fort/airport/Goa) → a **full-bleed, edge-to-edge map** with a
   "Tap to expand" badge (opens the shared lightbox, pinch-zoomable) →
   "Beaches Near the Site" checklist (7 beaches, names only) → a second
   checklist (Kudal Railway Station). See below — this was reworked twice;
   the current shape is the result of a follow-up fix, not the original.
6. **WaterfrontPremium** — +15/25/40% stat cards + sourcing disclaimer.
7. **GrowthThesis** (`#growth`) — infographic banner (`contain` mode, see §9) +
   5 infrastructure stat cards.
8. **InvestmentCase** — Goa/Alibaug/Lonavala comparison chips → arrow →
   "Sindhudurg — Next" stat card (2.8×–4.2× indicative), with a disclaimer that no
   historical figures for those three cities are cited or implied.
9. **LifestyleGallery** (`#gallery`) — 3-column grid of uniform 1:1 tiles, tap to
   open the shared lightbox. *Ungated.* (Previously a carousel — reverted, see §9.)
10. **LifestyleDetail** — 3 stat cards (boat access / Balinese architecture /
    Konkan excursions), 2-up grid.
11. **SitePlanGated** (`#site-plan`) — visual gate: blurred `Placeholder` boxes for
    Site Plan + Floor Plan behind a lock overlay with two CTAs ("View Site Plan",
    "View Floor Plan") that open the modal.
12. **AxonPromise** — 4-step process grid (Design → Approvals → Leasing → Resale
    Support); "61 cities in 12 states" is inline body copy, not a separate stat row.
13. **BookSiteVisit** (`#site-visit`) — compact CTA prompt, opens modal with
    `intent="sitevisit"`.
14. **FinalCta** (`#enquire`) — compact CTA prompt, opens modal with
    `intent="enquiry"`. There is no inline form on the page anymore — the modal is
    the only form.
15. **Footer** — real logo, brand line, combined disclaimer paragraph (indicative
    projections, waterfront premium sourcing, infra timelines subject to change,
    verify independently), copyright line. **No RERA reference of any kind.**

Then, outside the section flow (all `position: fixed`):
- **StickyCta** — mobile-only (`max-width: 640px`) bottom bar, 2 buttons:
  "Enquire Now" (`intent="enquiry"`), "View Site Plan" (`intent="siteplan"`).
- **StickySideTabs** — vertical tabs, right edge, all viewports: Enquire Now,
  Site Plan, Book Site Visit, Download Brochure (`intent="brochure"`).
- **WhatsAppButton** — bottom-right FAB, `bottom: 4.75rem` under 640px (clears the
  sticky bottom bar), `z-index: 92` (between side-tabs' 85 and sticky-cta's 90).
- **LeadModal** — the shared lead-capture modal, hidden until opened. Real logo
  now, no separate "The Riviera" text label (the logo's own wordmark covers it —
  the old redundant text line was removed).
- **Lightbox** — the shared full-size image viewer, hidden until opened.

### The logo

The logo was replaced mid-project with a **transparent-background** PNG
(4000×2828 source, near-white wave mark + pale yellow→aqua gradient wordmark,
designed for dark backgrounds). The original source has a lot of transparent
padding and also includes a baked-in tagline row ("INDIA'S RAREST RIVERFRONT
ADDRESS.") below the wordmark.

`src/assets/images/` holds two derived, pre-cropped assets (generated with
Pillow, not hand-drawn):
- `logo.png` — the source tightly cropped to just the wave mark + "THE RIVIERA"
  wordmark (tagline row excluded — it's redundant with hero copy and illegible
  at small sizes anyway), transparency preserved. This is the **light** variant.
- `logo-dark.png` — the exact same crop/alpha shape, but every pixel forced to
  solid `#12382D` (`--brand-forest`, per `brand-guidelines.md`'s own contrast
  rule: "forest text on cream, never teal on cream"). This is the **dark**
  variant, generated as a reliable stopgap instead of guessing a CSS `filter`
  chain — see §9.

`src/components/Logo.astro` picks between them via a `variant="light" | "dark"`
prop (default `light`) and requests the source at **3× the CSS display width**
(`width={width * 3}`) so it stays sharp at retina density — the container's own
CSS (`width: 100%; height: auto`) scales it back down. See the retina gotcha in
§9 for why this matters.

Usage: `<Logo width={100} variant="light" />` in Header, `<Logo width={170}
variant="dark" />` in LeadModal, `<Logo width={140} variant="light" />` in
Footer. No box/card/background wraps it anywhere — it sits directly on its
background in all three places.

**Why header = light, not dark, despite sitting over a nominally "cream"
header bar:** `.site-header` is `position: fixed` and fully transparent by
default — it's not a solid cream bar, it's an overlay that sits over the hero
image AND every section that scrolls beneath it (dark sections and cream
sections alike, since the header never moves). A light-only logo went
near-invisible whenever a cream section scrolled underneath it. Fixed by giving
`.site-header` a permanent `rgba(4, 45, 47, 0.45)` scrim + `backdrop-filter:
blur(6px)`, so the light logo (and the hamburger icon, which was already
hardcoded to `--text-on-dark`) stays legible regardless of what's scrolling
underneath. This is a real behavior change beyond "swap the logo asset" — flagged
here since it wasn't explicitly requested, but was necessary to make the header
legible at all.

### Favicon

Generated (not designer-provided) from the logo's wave mark alone — the full
wordmark is illegible at 16×16. Cropped tightly to just the wave symbol,
recolored solid cream (`#F7ECDF`), and composited onto a solid `--brand-teal`
(`#10899A`) square so it stays visible on both light and dark browser-tab
themes (a transparent-only mark would vanish on a white tab). Produces
`favicon.ico` (16+32 multi-size), `favicon-16.png`, `favicon-32.png`, and
`apple-touch-icon.png` (180×180, solid background — Apple doesn't composite
transparency), all wired into `Layout.astro`'s `<head>`. Generation script isn't
kept as a project file — it was a one-off Pillow script; if the crop/colors ever
need regenerating, redo it from `public/images/logo.png`'s wave mark (original
alpha bbox: roughly x 1785–2153, y 997–1380 out of the 4000×2828 source).

### Header / hamburger / nav — ungated

`src/components/Header.astro`: the hamburger toggle and all in-nav anchor links
(`Overview`, `Location`, `Growth Story`, `Gallery`, `Site Plan`) work as plain,
unconditional scroll/toggle behavior — **no gating logic touches them at all.**
The one exception inside the nav overlay is the "Enquire Now" button, which is a
real CTA (`data-gate-trigger`) and does open the modal.

### The lead modal

`src/components/LeadModal.astro`, driven by `src/scripts/gating.js`.

**Fields (exactly these, every use of the modal):**
1. Name — text, `required`, `minlength="2"`.
2. Email — `type="email"`, `required`.
3. Country code — `<select>`, ~230 entries from `src/data/country-codes.js`,
   default selection driven by `detectCountryCode()` (see below; currently always
   resolves to `+91 India`).
4. Phone Number — `type="tel"`, `required`, `inputmode="numeric"`.

**Consent checkbox (required, exact text):**
> "I authorise Axon Developers & its representatives to contact me with updates
> and notifications via Email/SMS/WhatsApp/Call. This will override DND/NDNC."

**Validation (`gating.js`):**
- Name: trimmed length ≥ 2.
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- Phone: strip spaces/dashes, then `/^\d{7,15}$/`.
- Submit button stays `disabled` until name+email+phone+consent are all valid;
  inline `.has-error` styling appears per-field on blur/input.

**Which CTAs open the modal (explicit interest only):** Hero "Enquire Now",
Header nav "Enquire Now", StickyCta (both buttons), StickySideTabs (all four),
SitePlanGated ("View Site Plan" / "View Floor Plan"), BookSiteVisit, FinalCta.
Every trigger passes a `data-intent` (`enquiry | siteplan | floorplan | brochure |
sitevisit`) which becomes the modal's hidden `intent` field and is included in the
object passed to `submitLead()`.

**Gating was deliberately made aggressive (every click gated) and then rolled
back.** The old `GATE_NAV` toggle and the global click-delegate that gated
literally everything (nav, hamburger, gallery tiles) were **removed**. Do not
reintroduce a global click-gate — nav/hamburger/gallery/lightbox are always free;
only the named CTAs above open the modal.

### Country-code auto-detect (prep only)

`detectCountryCode()` in `gating.js` currently just returns `'+91'` (hardcoded).
It's called once on script init and sets the `<select>`'s value if a matching
`<option>` exists. There's a `TODO` comment directly on the function marking
exactly where a `CloudFront-Viewer-Country` header value (available for free once
deployed behind AWS CloudFront — no third-party geolocation call) should be read
in and mapped to a dial code. The dropdown still contains every country; detection
only changes the *default* selection.

### Popup behavior

Named constants at the top of `gating.js`:
```js
const POPUP_FIRST_DELAY_MS = 15000;      // first fire, ~15s after load
const POPUP_REPEAT_INTERVAL_MS = 45000;  // re-fire cadence if dismissed, ~45s
const SCROLL_TRIGGER_THRESHOLDS = [50, 90]; // percent scrolled
```
- Timer: first fire at 15s via `setTimeout`; if the user hasn't converted, it
  reschedules itself every 45s for as long as they keep dismissing it (a
  recursive `setTimeout`, not `setInterval`, since the first delay and the repeat
  interval differ).
- Scroll: fires once each at 50% and 90% scroll depth.
- **Stops completely and permanently** the moment `sessionStorage.getItem
  ('riviera_lead_captured') === 'true'` — checked both inside the timer callback
  and inside the submit handler (`stopPopups()` clears the pending timeout and
  removes the scroll listener).
- These were previously far more aggressive (6s first-fire, 6s repeat, 25/50/75/
  100% scroll) and were deliberately dialed back — don't re-tighten these without
  being asked; if asked to tune again, only touch the three named constants above.

### Gallery grid + lightbox

`LifestyleGallery.astro` (grid) + `Lightbox.astro` (viewer) + `src/scripts/
lightbox.js`. Ungated everywhere — tapping a tile or the map never opens the lead
modal.

- **Grid:** 3-column, uniform 1:1 `ImageFrame` tiles (`gap: 0.3rem`), 9 lifestyle
  photos from `src/data/gallery-images.js`. Each tile is a `<button
  data-lightbox-trigger data-lightbox-index={i}>`.
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
  **not** a sliding/transform-based track. This was a deliberate choice after the
  carousel's transform-based approach broke (see §9) — toggling display is
  simpler and has no transition-timing edge cases to get wrong.
- Body scroll locked while open (`document.body.style.overflow = 'hidden'`).
- Only the open/close opacity fade is animated; that fade is skipped entirely
  under `prefers-reduced-motion: reduce` (slide switching itself was already
  instant, so "instant transitions" was true by construction, not extra work).

### The location + map section (reworked twice — this is the current shape)

`LocationConnectivity.astro` (`#location`) holds, in order: road-image banner →
"On NH-66..." heading/body → **"Key Distances"** stat grid (Beaches 25 min /
Sindhudurg Fort 40 min / Airport 50 min / Goa next door — the only 4 figures
that exist in `docs/brand-guidelines.md`) → a **full-bleed map** → **"Beaches
Near the Site"** checklist (7 beaches, names only) → a second checklist
(Kudal Railway Station, name only).

**The map was originally shown small and inset (contained inside
`.section-inner`'s 560px max-width) and was reported illegible.** It's now:
- Rendered as a direct child of `<section>`, broken out of the section's own
  horizontal padding via negative margins (`.map-trigger`: `width: calc(100% +
  section-pad-x * 2)`, matching negative `margin-left`/`margin-right`) — true
  edge-to-edge on mobile, not just "full width of the padded content column."
- Given its own `ImageFrame` ratio, `5/3` (added to `ImageFrame`'s ratio union
  specifically for this — it's the map's *exact* source aspect ratio, 2300×1380,
  so `mode="contain"` has zero wasted letterbox space, unlike the closest
  existing option `16/9`).
- Given a visible `.map-trigger__badge` overlay ("Tap to expand" + a magnifier
  icon, bottom-right) so it reads as tappable, not just a static image.
- Tapping it opens lightbox index 9 same as before, but the lightbox itself now
  supports **pinch-zoom + pan** (see below) specifically so the map's labels
  are actually readable once expanded.

**The nearby-highlights list was split and re-scoped.** Previously one 8-item
list mixed beaches + Fort + Kudal + Airport, with Fort/Airport carrying times
that duplicated the stat grid above. Now: Fort and Airport times live *only* in
the "Key Distances" stat grid; the beach checklist is beaches-only (7 names, no
times — 2 more beaches, Bhogwe and Vengurla, were added and none of the 7 carry
an invented time); a separate one-item checklist holds Kudal Railway Station.

**Data shape, kept intentionally simple for a later drop-in:** both
`nearbyBeaches` and `otherNearby` in `LocationConnectivity.astro` are
`{ name: string; time?: string }[]`. The template already renders `{h.time &&
<span>...}` conditionally — adding a real per-beach time later is a one-line
data edit, no template/CSS changes needed.

### Gated downloads

`triggerDownload(intent)` in `gating.js` fires for `intent` in
`{brochure, siteplan, floorplan}` on successful modal submit. It currently
downloads `public/downloads/placeholder-asset.txt` (renamed client-side to
`riviera-<intent>-placeholder.txt`). There is a `TODO` comment directly above it
marking where a signed, expiring-URL fetch to the backend should replace the
static stub.

### Image focal points currently applied

| Image | Used in | `focal` / mode |
|---|---|---|
| Gad river view drone shot.jpg | Hero (full-bleed bg) | default center (no explicit prop; hero uses raw CSS, not `ImageFrame`) |
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
| 4.png (Sindhudurg infra composite) | GrowthThesis banner | `mode="contain"`, never cropped |
| logo.png | Header/Modal/Footer | N/A — rendered at natural aspect via `<Image>`, not `ImageFrame` |

Note: the lightbox itself always uses `object-fit: contain` for every slide
(gallery photos included) — it shows the *whole* image regardless of how that
same photo is cropped in its grid tile. The `focal` values above only govern the
grid-tile crop.

### Current metrics (last full Lighthouse run — see caveat below)

- **Lighthouse mobile performance: 100/100**
- **Page payload: ~227 KiB over 14 requests**
- **CLS: ~0.0001**

These are from the logo-integration pass, *before* the location/map rework
(full-bleed map, pinch-zoom JS). The map-fix task was explicitly a "front-end
only, build-must-pass, no full audit" pass — `npm run build` was confirmed
green and the map/lightbox/distance-data were spot-checked with Puppeteer, but
**Lighthouse was not re-run**. Re-run it before trusting these numbers as
current — the new pinch-zoom touch handlers and full-bleed map are unlikely to
regress performance (still no libraries, same image), but that's an assumption,
not a measurement. Always re-run against `astro preview` (never `astro dev`);
see the gotcha in §9.

## 5. HARD CONSTRAINTS (never violate)

- Mobile-first, 375px baseline.
- No individual names anywhere.
- No phase / roadmap / "30-60-90" / timeline language anywhere.
- First-person plural voice ("we/our") in all copy.
- No external links or outbound redirects — **with one approved exception:** the
  WhatsApp floating button (`wa.me/919355499004`, prefilled message, opens in a
  new tab). No other external links anywhere.
- **No RERA references anywhere** — the project has no RERA number, and an earlier
  "RERA registration details to be added on confirmation" placeholder line was
  explicitly removed from the footer and must not be reintroduced.
- Never invent claims, distances, or drive times. All content must trace back to
  `docs/brand-guidelines.md` — if a fact (e.g. a per-beach drive time) isn't in
  there, list it without the number rather than estimating one.
- Keep all disclaimers intact: indicative projections, waterfront premium
  sourcing (Market reports 2025–26 / Square Yards / SRFDCL-GharPe), infrastructure
  timelines subject to change, verify independently before purchase.
- Animations: `transform`/`opacity` only, GPU-composited, must respect
  `prefers-reduced-motion: reduce` everywhere (reveal-on-scroll, hero zoom, modal
  transitions, lightbox fade).
- No JS libraries — no lightbox library, no animation library, no form-validation
  library. All of `reveal.js`, `lightbox.js`, and `gating.js` are hand-written
  vanilla JS, loaded as a single deferred `type="module"` script from
  `index.astro`.
- Lighthouse mobile must stay 90+.

## 6. KEY DECISIONS ALREADY MADE (do not re-litigate)

- **The cream-background logo variant is a solid-color raster recolor
  (`logo-dark.png`), not a CSS `filter` chain.** A filter chain was suggested
  as one option but a Pillow-generated flat-forest-green recolor from the
  alpha mask was used instead — more reliable, exact brand color, no filter-
  tuning guesswork. Keep this approach if the logo needs recoloring again
  before a real designer dark variant arrives.
- **The header has a permanent dark scrim + backdrop-blur**
  (`rgba(4,45,47,.45)` + `blur(6px)` on `.site-header`), added specifically so
  a single light-variant logo (and the hamburger) stays legible across the
  full mix of light/dark backgrounds that scroll beneath the fixed transparent
  header. Don't remove this without also solving that legibility problem
  another way.
- Gating was made aggressive (every click gated) in one pass, then **deliberately
  rolled back** in the next. Nav, hamburger, and the gallery/lightbox are
  unconditionally ungated. Only explicit-interest CTAs open the modal. **Do not
  re-add a global click-gate** — this was tried and explicitly reversed.
- The lead form is a **modal**, not an anchor-scroll target. An earlier version
  had inline forms in page sections (anchor-scrolling to them, which had a "wrong
  scroll position" bug) — that pattern is retired. All CTAs open the modal.
- The **gallery is a grid + lightbox, not a carousel.** A carousel was built once,
  broke (see §9), and was explicitly removed at the user's request in favor of a
  grid with a full-size lightbox viewer. Do not reintroduce a sliding/auto-
  advancing carousel without being asked.
- One reusable modal, one `submitLead(data)` stub function
  (`console.log`s and resolves). Every entry point passes an `intent` field
  (`enquiry | siteplan | floorplan | brochure | sitevisit`) so the eventual CRM
  integration can track source.
- Popup aggressiveness (repeating timer + scroll-depth triggers, re-appears on
  dismissal) is intentional, but was explicitly **dialed back once already**
  (6s/6s/25-50-75-100% → 15s/45s/50-90%). It must still stop permanently after
  submit. If asked to retune, edit only the three named constants in `gating.js`.
- Form fields are fixed: Name, Email, Country code (dropdown, default-detected,
  currently always +91), Phone. Plus a required consent checkbox with the exact
  text in §4. Do not add or remove fields without being asked.
- WhatsApp button does **not** open the modal — it's a direct, user-initiated
  contact channel straight to `wa.me`.
- The site-plan/floor-plan gate is a genuinely separate mechanic from the modal's
  own gating: the *visual* blur/lock UI lives in `SitePlanGated.astro` and is
  toggled by `.gate.is-unlocked`, set only after a real modal submit — it doesn't
  have its own inline form (that was also retired in favor of the modal).
- Location content is consolidated into one section (`LocationConnectivity.astro`)
  rather than split across two — the map and nearby-highlights checklist were
  deliberately added there instead of as a new standalone section.

## 7. OPEN QUESTIONS / PENDING (flag these, don't guess)

- **Display font:** currently Oswald as a placeholder. The real brand font is
  Trade Gothic LT Std Bold Extended — **web license not yet confirmed.** It is
  isolated to the single `--font-display` CSS variable in `global.css` for an
  easy one-line swap once licensing is resolved.
- **Need a real dark-on-transparent logo variant from the designer** (SVG
  ideal). The current `logo-dark.png` (solid forest-green recolor) is a
  functional stopgap generated in-repo, not a designer asset — it drops the
  original's gradient entirely in favor of a flat brand color. Fine for now,
  but worth swapping for a real designer-made dark variant if one becomes
  available.
- **Pending assets:** Site Plan and Floor Plan are still `<Placeholder>`
  components (dashed cream box). The logo is no longer pending — it's real,
  transparent, and cropped now.
- **Brand hex values** were sampled from the brochure PDF render (per
  `docs/brand-guidelines.md`) and may shift ±2–3 points from the designer's actual
  swatches if/when those are provided.
- **Gated assets are placeholder files** (`public/downloads/placeholder-asset.txt`).
  Real assets must **not** be dropped into `/public` when they arrive — see §8,
  item 2, for why (guessable URLs) and where the real implementation goes.
- **RERA number:** does not exist for this project as of now. If one is issued
  later, adding it back is a deliberate content decision to be made explicitly —
  don't infer it should reappear just because competitor sites have one (see
  `docs/reference-site-notes.md`).
- **Country-code detection is unimplemented**, just prepped — see §4. Needs the
  actual CloudFront-Viewer-Country wiring once deployed (§8, item 5).

## 8. WHAT IS DELIBERATELY NOT BUILT YET (in order)

These are separate, isolated steps. Do not start them unless explicitly asked:

1. **Backend** — `submitLead()` is a stub (`console.log` only, in
   `src/scripts/gating.js`). Planned: leads POST to a small AWS Lambda (behind API
   Gateway) which (a) writes the lead to DynamoDB first, (b) sends an SES email
   notification, (c) forwards to the Sell.Do CRM, (d) retries failed Sell.Do
   pushes via SQS. Sell.Do API key + endpoint not yet received.
2. **Gated asset serving** — the real brochure/site plan/floor plan must be served
   via signed, expiring S3 URLs issued only *after* lead capture — never a
   publicly guessable path. The `TODO` comment in `gating.js`'s
   `triggerDownload()` marks exactly where this fetch goes.
3. **Meta pixel** — PageView, Lead (on submit), ViewContent (on gate unlock), plus
   a WhatsApp-click event. The WhatsApp click handler in `gating.js` already has a
   `TODO` marking where that event fires.
4. **Performance hardening pass** (post-pixel/CRM, since third-party scripts
   typically regress Lighthouse — re-baseline after each is added).
5. **AWS deployment** — S3 + CloudFront, ACM certificate for HTTPS. Once live,
   wire the real `CloudFront-Viewer-Country` value into `detectCountryCode()`
   (see the `TODO` in `gating.js`).
6. **Domain** — GoDaddy domain, DNS pointed at CloudFront. Allow time for DNS
   propagation before go-live.

## 9. GOTCHAS LEARNED

- **`astro:assets`'s `<Image>` only generates the exact `width` you request —
  it does not auto-generate a higher-density version for retina screens.** If
  you request `width={170}` and display it at 170 CSS px on a 2x/3x device, the
  browser upscales a 170-real-pixel image and it looks soft. `Logo.astro` fixes
  this by requesting `width * 3` from the optimizer and letting the
  container's own CSS (`width: 100%; height: auto`) scale it back down to the
  intended display size — apply the same pattern (request 2–3× the display
  size) to any other small, sharp-critical raster asset (icons, logos), not
  just this one.
- **Always re-read an asset fresh when told it's been updated — don't trust
  a cached mental model from earlier in the session.** The logo was swapped
  from a non-transparent to a transparent version mid-project; re-checking
  `hasAlpha`/dimensions directly rather than assuming caught this immediately.
- **A carousel was built, then broke, then was removed — root cause worth
  remembering.** The original gallery carousel's CSS included a rule like
  `.carousel__slide :global(img) { width:100%; height:100%; object-fit:cover; }`
  sitting in plain `global.css`. `:global(...)` is an Astro/Vue/Svelte **scoped-
  component-style** pseudo-selector — it means nothing in a plain CSS file loaded
  via `import '../styles/global.css'`, so the whole rule was silently invalid and
  dropped by the browser. The slide images never got their sizing/crop rules,
  which is why slides rendered blank/broken. Lesson: never write `:global(...)`
  outside an Astro component's own `<style>` block — in global.css, just use the
  real selector directly. The replacement gallery avoids the whole class of bug by
  using simple `display: none` / `.is-active` toggling instead of a transform-
  based sliding track.
- **Kill stray `astro dev` processes before running Lighthouse.** A dev server
  left running (e.g. from an earlier `npm run dev` in the same session) can end
  up squatting on the same port `astro preview` tries to use. Lighthouse then
  silently tests the dev build (HMR client, dev toolbar, unminified everything)
  and reports a falsely low score — this happened once mid-project: 79/100 with a
  2.1MB payload, entirely because of a leftover dev-server process from hours
  earlier. Always verify you're hitting the production `astro preview` build
  (check `lsof -i :<port>` if a score looks suspicious) before trusting a
  Lighthouse number.
- **Image focal points:** most of this project's drone/landscape photos have
  their subject sitting in the lower-middle band of the frame. Default new,
  unverified landscape/drone images to `object-position: center 58%`, not plain
  `center` — plain `center` tends to crop straight into empty sky on these
  specific images. Interior shots default fine to plain `center`.
- **Infographic/map-type images** (the Sindhudurg growth composite `4.png`, and
  the location map) must use `ImageFrame`'s `mode="contain"` on the cream
  background, never `mode="cover"` (the default) — `cover` slices labels and
  detail unreadable since they're not photographs with a forgiving crop area.
- **`astro:assets` only optimizes imported images**, not anything referenced from
  `public/` by URL string — see §2 for the full workflow this implies.
- Astro's scoped component `<style>` blocks can silently override global CSS
  rules with the same specificity if they target the same selector unconditionally
  (e.g. a component setting `display: grid` on both a "locked" and "unlocked"
  variant of an element, clobbering global.css's `display: none` default for the
  unlocked one). Caught and fixed once in `SitePlanGated.astro` — worth a second
  look any time a component's scoped styles touch a class that a global "state"
  rule (like `.is-unlocked`) also targets.
- **Always double-check a file actually exists before building on it.** A task
  once referenced a logo file "already in public/images/" that in fact did not
  exist yet at the time — caught by searching the repo rather than assuming, and
  the work was picked back up cleanly once the file was actually added.

## 10. MAINTENANCE RULE

**Keep this file current.** At the end of every task, update `CLAUDE.md` to
reflect any change to: architecture, components, decisions, constraints, current
state, metrics, open questions, or next steps. Treat updating `CLAUDE.md` as part
of the definition of done for every task — not an optional extra.
