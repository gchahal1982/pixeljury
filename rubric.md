# PixelJury Rubric v0.1
### How the score is calculated. Open, versioned, argue with it.

PixelJury renders your page, then grades what actually appeared on screen. The score is
**not vibes** — every point traces to a rule below. This file is the source of truth: the
vision model is handed this rubric verbatim as its scoring instructions, and the
deterministic engine implements §2 and the `[static]` rows of §3 exactly.

**Final score = weighted composite of 6 dimensions, minus deterministic slop deductions, capped by any hard fails.**

```
composite   = Σ (dimension_score × weight) / 100   # 0–100, from vision pass
deductions  = Σ (slop_trope_hits)                  # capped at 25 total
raw         = composite − deductions
final       = min(raw, lowest_hard_fail_cap)       # hard fails cap the ceiling
```

---

## 1. The six dimensions (weighted composite = 100)

Each is scored 0–100 by the vision pass against the criteria below, then weighted.

| # | Dimension | Weight | Scores high when… | Scores low when… |
|---|---|---|---|---|
| 1 | **Typography & scale** | 20 | Clear type scale (≥4 distinct, intentional sizes), confident headline sizing, readable body, considered line-height/measure | 2 effective sizes, timid headlines, default browser scale, cramped or overlong line length |
| 2 | **Layout & hierarchy** | 20 | Eye knows where to go; one clear focal point; intentional asymmetry or grid; CTA stands out | Everything centered single-column; equal-weight elements; no focal point; CTA blends in |
| 3 | **Color & system** | 15 | Coherent, harmonious palette with roles (bg/surface/text/accent), restrained, intentional | Random invented colors, no system, muddy neutrals, accent used everywhere or nowhere |
| 4 | **Spacing & rhythm** | 15 | Consistent spacing scale, generous whitespace, sections breathe, aligned | Ad-hoc gaps, cramped, no vertical rhythm, misaligned edges |
| 5 | **Originality (anti-slop)** | 20 | Committed, coherent aesthetic direction; you would NOT instantly say "AI built this" | Templated; the generic AI-SaaS look; could be any of 10,000 vibe-coded pages |
| 6 | **Polish & finish** | 10 | Considered hover/focus/empty/loading states; restraint — every element earns its place | Default states, unfinished edges, placeholder slop, data-slop (pointless stats/icons), filler content |

**Dimension 5 is the soul of the product.** It maps to one test: *if someone saw this
interface and was told AI built it, would they believe it immediately?* If yes →
Originality scores below 40.

**The philosophy behind every dimension.** *Less is more — every element must earn its place,
one thousand no's for every yes.* Reward a committed, coherent aesthetic direction; penalize
filler, data-slop, and anything that reads as auto-generated. (Adapted from the design-quality
core of a battle-tested design-judgment spec — its principles only, none of its tooling.)

---

## 2. Hard fails (cap the final score)

Usability/accessibility failures, detected **deterministically** (static signals, no LLM).
They **cap** the final score no matter how pretty the page is. Lowest applicable cap wins.

| Hard fail | Detection | Caps final at |
|---|---|---|
| Body text below readable min (< 14px effective) | computed font-size on body/paragraph nodes | **70** |
| Horizontal overflow at 390px viewport | scrollWidth > viewport width in mobile pass | **70** |
| Text contrast below WCAG AA (4.5:1 normal / 3:1 large) | computed fg/bg luminance ratio | **65** |
| Touch target < 44px on mobile | bounding box of interactive elements | **75** |
| Overlapping / broken layout (elements colliding) | bounding-box intersection of siblings | **50** |

Hard fails are listed explicitly in the critique so the user sees *why* the ceiling dropped.

---

## 3. Slop-trope deductions

Flat point deductions, applied after the composite. Each hit is logged with a named reason.
**[static]** = computed from DOM/CSS, no LLM. **[vision]** = judged from the screenshot.

| Trope | Deduction | Detection |
|---|---|---|
| Overused font as primary (Inter / Roboto / Arial / Fraunces / system) | −5 | [static] |
| Aggressive full-page gradient background | −5 | [static] |
| Emoji used as UI icons / decoration | −4 | [static] |
| Rounded card + left-border accent stripe pattern | −4 | [static] |
| SVG-drawn "illustrations" / gradient blobs | −3 | [vision] |
| Same card/section pattern repeated > 3× | −5 | [static] |
| Centered single-column "AI hero" (gradient + centered H1 + two pills) | −5 | [vision] |
| Pill badges + "✨ AI-powered"-style copy | −3 | [static] |
| Fake data-slop (decorative stats/numbers/icons with no purpose) | −3 | [vision] |

Deductions are **capped at −25 total** so the composite, not the deduction pile, drives the
headline number.

---

## 4. Score bands

| Score | Band | Meaning |
|---|---|---|
| 85–100 | **Shipped by a designer** | Intentional, coherent, no slop tells |
| 70–84 | **Good, fixable gaps** | Solid bones, a few slop tells or weak hierarchy |
| 55–69 | **Generic AI output** | Works, but reads as templated; the default vibe-code result |
| 40–54 | **Slop** | Multiple tells + weak system; needs real rework |
| < 40 | **Broken or pure slop** | Hard fails and/or no design system at all |

---

## 5. What this rubric deliberately is NOT

- **Not a static linter.** A rules-on-code linter cannot see that the rendered hero looks
  generic. Dimensions 2 and 5 require *looking at the pixels*. That's the moat.
- **Not brand-prescriptive.** It scores *coherence and intentionality*, not "use these fonts."
  A brutalist page and a soft editorial page can both score 90. (v0.4 adds a brand profile.)
- **Not subjective-only.** Half the signal (every hard fail + most slop tropes) is
  deterministic and reproducible. The vision pass handles the irreducibly visual judgment.

---

## 6. Versioning

This rubric is versioned (`v0.1`). Changes ship in the changelog with before/after score
deltas on a fixed example set, so a score is always reproducible against a stated rubric version.

> **Disagree with a weight or a deduction? That's the point.** Open a PR. The argument is the marketing.
