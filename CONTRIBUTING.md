# Contributing to PixelJury

Thanks for helping make AI-built frontends suck less. PRs and issues are welcome.

## Good first contributions

- **Argue with the rubric.** [`rubric.md`](./rubric.md) is the scoring brain. Disagree with a
  weight, a hard-fail cap, or a slop-trope deduction? Open a PR. The argument is the point.
- **New vision adapters.** Add a provider under `packages/vision/src/adapters/` following the
  existing `call({ system, user, images, apiKey, model })` shape.
- **Before/after examples.** Add a `examples/<name>/` page plus rendered screenshots and
  `score.json` in `examples/gallery/`.
- **Static signals.** Improve detection in `packages/core/src/static-signals.js` (each rule is
  small and testable).

## Dev setup

```bash
npm install
npm test                              # deterministic engine + parser tests, no browser
npx playwright install chromium       # needed only to run an actual review
node packages/cli/bin/pixeljury.js review http://localhost:3000 --provider mock
```

## Ground rules

- Keep deterministic signals deterministic (no network, no LLM) — they're half the score and
  must be reproducible.
- If you change a number in `rubric.md`, change its mirror in
  `packages/core/src/rubric-data.js`, and add a CHANGELOG entry.
- Add a test for new static signals and parsing logic.
- Be excellent to each other — see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## Submitting

1. Fork and branch.
2. `npm test` passes.
3. Open a PR with a clear description and, for design rules, a before/after example.
