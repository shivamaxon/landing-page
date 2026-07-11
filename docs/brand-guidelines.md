# brand-guidelines.md — The Riviera (Axon Developers)

> Source of truth for the landing page build. Extracted from the official brochure.
> Claude Code: treat every token below as literal. Do not invent colors, fonts, or claims not listed here.
> Voice is first-person plural ("we / our"). No individual names anywhere. No roadmap / phase / timeline language.

---

## 1. PROJECT IDENTITY

- **Project name:** The Riviera
- **Developer:** Axon Developers
- **Tagline (locked):** India's Rarest Riverfront Address.
- **Category:** Branded riverfront villa plots (second-home / land investment)
- **Location:** Konkan, Sindhudurg — on NH-66 (Mumbai–Goa corridor), beside the Gad River
- **The offer in one line:** 20 river-touching villa plots, clear freehold title, ready to build.

---

## 2. COLOR PALETTE (exact hex — use as CSS custom properties)

Extracted from brochure renders. These are the ONLY brand colors.

```css
:root {
  /* Primary — teal/aqua (cover gradient, water, primary accents) */
  --brand-teal:        #10899A;  /* primary brand teal */
  --brand-teal-bright: #169EAA;  /* brighter aqua for highlights */
  --brand-teal-deep:   #0A6E85;  /* deeper teal for gradient base */
  --brand-aqua-light:  #89D3D9;  /* soft aqua tint */

  /* Dark — forest / deep green (dark section backgrounds, footers) */
  --brand-forest-deep: #042D2F;  /* deepest forest, near-black green */
  --brand-forest:      #12382D;  /* forest green section bg */
  --brand-forest-mid:  #192926;  /* muted dark green (Axon brand pages) */

  /* Neutral — cream / ivory (light section backgrounds, cards) */
  --brand-cream:       #F7ECDF;  /* warm ivory background */
  --brand-cream-cool:  #F3F1E5;  /* cooler cream variant */

  /* Text */
  --text-on-dark:      #F7ECDF;  /* cream text on dark/teal */
  --text-on-light:     #12382D;  /* forest text on cream */

  /* Utility (define once, don't spawn new greys) */
  --hairline:          rgba(18,56,45,0.12);
}
```

**Gradient (hero / cover):** linear blend from `--brand-teal-bright` → `--brand-teal-deep`, echoing the brochure cover.
**Contrast rule:** cream text on teal/forest; forest text on cream. Never teal text on cream (fails legibility at body sizes).

> ⚠️ CONFIRM WITH DESIGNER: these hex values are sampled from the PDF render (compression may shift them ±2–3 points). If the designer has exact brand hex codes or a logo with defined swatches, those override this block.

---

## 3. TYPOGRAPHY

Fonts confirmed from the brochure font table.

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / headlines | **Trade Gothic LT Std Bold Extended** | 700, extended | All-caps, wide letter-spacing. This is the signature look. |
| Body / paragraphs | **Inter** | 300 (Light), 400 (Regular), 700 (Bold) | Clean, neutral, high legibility on mobile. |

**Web-font strategy (performance-critical):**
- Trade Gothic is a licensed font — CONFIRM the designer has a valid web license. If not, substitute a free extended-grotesque with similar character: **Oswald** (already appears in the brochure) or **Archivo Expanded**. Flag this to the designer before build.
- Inter is free (Google Fonts / self-host). **Self-host WOFF2, subset to Latin, `font-display: swap`.** Do not pull the full Google Fonts CSS (render-blocking).
- Load a maximum of 3 font files total. Every extra weight is a mobile speed cost.

**Type treatment (brand signature):**
- Headlines: ALL CAPS, letter-spacing ~0.08–0.15em, extended width.
- Body: sentence case, generous line-height (1.5–1.6), never justified.

---

## 4. TONE OF VOICE

- Aspirational but grounded in scarcity and numbers — not flowery.
- Short, declarative lines. The brochure uses fragments as impact statements ("The location never can.").
- First-person plural where we speak as the developer ("We stay invested as long as you are.").
- Confidence without hard-sell. Let scarcity + data carry urgency.

**Signature phrases (reusable, on-brand):**
- "India's Rarest Riverfront Address."
- "The same land. A very different value."
- "When they're gone, they're gone forever."
- "Everything inside a home can be upgraded. The location never can."

---

## 5. USPs / KEY SELLING POINTS (ranked for landing-page hierarchy)

1. **Riverfront scarcity** — Only 1% of India's land is riverfront; a fraction is ownable. Limited shoreline + environmental regulation = permanent rarity.
2. **20 river-touching villa plots only** — hard inventory cap. Each with uninterrupted river access + panoramic views.
3. **Clear freehold title, ready to build** — development-ready infrastructure, own and build at your pace.
4. **Location & connectivity** — On NH-66 (Mumbai–Goa). 25 min beaches · 40 min Sindhudurg Fort · 50 min airport. Next to Goa.
5. **Waterfront premium** — Waterfront consistently commands +15% (conservative) / +25% (typical) / +40% (exceptional) over comparable inland.
6. **Sindhudurg growth thesis** — major sanctioned infra: ₹68,720 Cr coastal highway, ₹7,851 Cr bridge project, Shaktipeeth expressway (Nagpur–Goa 18h→7–8h by 2028–29), ₹2,000 Cr film city, ₹46.9 Cr underwater museum, scuba centre.
7. **Investment case** — "Goa/Alibaug/Lonavala were once undiscovered; Sindhudurg is next." Indicative 2.8×–4.2× projections.
8. **Lifestyle** — private boat access, Balinese tropical architecture, unobstructed river views from every plot, year-round Konkan excursions.
9. **The Axon promise** — one company, one focus: best second homes across India. End-to-end (design → approvals → leasing → resale support). Customers across 61 cities in 12 states.

---

## 6. COMPLIANCE / DISCLAIMER RULES (must appear on page)

The brochure repeats these — legally required, do NOT drop them:
- Appreciation projections are **indicative estimates**, not guarantees of returns. Full disclaimer text near any number/projection.
- Premium figures (+15/25/40%) cite: Market reports 2025–26; Square Yards; SRFDCL/GharPe. Keep the "*indicative of the category, not a guarantee*" note.
- Add RERA registration line + QR when the number is available (CONFIRM with legal/CSO).

---

## 7. DO-NOT LIST (hard constraints for Claude Code)

- ❌ No external links / outbound redirects anywhere. User must not be able to leave the page.
- ❌ No individual names (no broker, no founder, no signatory names).
- ❌ No phased / roadmap / "30-60-90" / "Phase 1" language in any copy.
- ❌ No render-blocking web fonts or full Google Fonts CSS imports.
- ❌ No unlicensed Trade Gothic embedding — confirm license or substitute.
- ❌ No stock-photo placeholders — use only the designer's creatives folder assets.
- ❌ No claims beyond this document (no invented amenities, prices, or dates).
- ❌ Gated assets (brochure, floor plan, price sheet) must NOT be reachable via direct URL before the form is submitted — see gating spec (separate file).
- ❌ No auto-playing audio/video with sound.

---

## 8. ASSET INVENTORY (from creatives folder — to be confirmed on receipt)

- Aerial river / highway renders (hero candidates)
- Villa exterior + interior renders (Balinese tropical)
- Lifestyle shots (couples, riverfront living)
- Connectivity map (Konkan coastline, NH-66)
- Floor plans (GATED asset)
- Logo (CONFIRM: format — SVG preferred; get transparent PNG fallback)

> All images must be compressed + served as WebP/AVIF with correct `width`/`height` and lazy-loading below the fold. Hero image preloaded. (Detail lives in the performance spec.)
