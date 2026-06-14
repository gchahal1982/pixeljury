# pixeljury-core

Render + static-signal engine + score composer for **[PixelJury](https://www.npmjs.com/package/pixeljury)** —
visual design QA for AI-built frontends.

This is an internal package. You almost certainly want the CLI instead:

```bash
npx pixeljury review http://localhost:3000
```

It provides the Playwright render stage, the deterministic static-signal engine (WCAG contrast,
mobile overflow at 390px, touch targets, overused fonts, gradient panels, repeated cards, AI-copy
badges), and the score composer that applies the [rubric](https://github.com/gchahal1982/pixeljury/blob/main/rubric.md).

Docs & source: https://github.com/gchahal1982/pixeljury · MIT
