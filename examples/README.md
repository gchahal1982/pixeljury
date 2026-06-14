# Examples

This folder holds the before/after gallery — the actual marketing surface. The single most
important deliverable in 0.1 is one genuinely impressive before/after pair, and it ships here.

Two pages, **same product** ("FlowSync"):

- **`sloppy-saas/`** — the "before". A deliberately generic AI-SaaS page: purple gradient hero,
  Inter font, emoji icon cards with left-border stripes, fake `10k+ / 99.9% / 24/7` stats, a
  low-contrast footer, and a features row that overflows at 390px. PixelJury scores it
  **16/100 — Broken or pure slop** (3 hard fails, 6 slop-trope deductions).
- **`polished-saas/`** — the "after". The same product, redesigned to pass the rubric: a
  committed editorial direction (Newsreader display + Space Grotesk), an asymmetric hero with a
  real product mock, a coherent warm palette, AA contrast, 44px+ targets, and no mobile
  overflow. PixelJury scores it **84/100 — Good, fixable gaps** (0 hard fails, 0 deductions).

The rendered screenshots + scores for both live in [`gallery/`](./gallery) and are embedded in
the root README.

## Try it locally in 30 seconds

```bash
# from the repo root, serve the examples on :3000
npx serve examples -l 3000

# in another terminal, judge the before and the after
npx pixeljury review http://localhost:3000/sloppy-saas   --provider anthropic
npx pixeljury review http://localhost:3000/polished-saas --provider anthropic
```

No API key? Add `--provider mock` — the render and the deterministic static signals (every
hard fail + slop trope) still run; only the vision dimension scores become fixed placeholders.

## How the gallery was made (it's dogfooded)

The "after" page wasn't hand-waved as "good" — it was run through PixelJury itself, which
caught two real defects on the first pass (a 3.5:1 contrast on the customer-logo strip and a
33px-wide footer touch target). Both were fixed until the tool reported zero hard fails and
zero deductions. The library validates its own demo.

To refresh the gallery after editing a page: re-run `review` on both and copy
`pixeljury/screenshot.png` / `screenshot-390.png` / `score.json` into `gallery/` with the
`before-*` / `after-*` names.
