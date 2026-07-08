# Changelog

All notable changes are documented here. Scores are reproducible against a stated rubric
version; rubric changes ship with before/after deltas on a fixed example set.

## [0.1.5] - 2026-07-07

### Fixed
- Passed Codex passthrough screenshots as separate `--image` arguments instead of one
  comma-joined value.
- Strengthened passthrough isolation tests so the Codex adapter's image argument shape is
  covered.

## [0.1.4] - 2026-07-07

### Fixed
- Isolated `claude-code` and `codex` passthrough provider runs by staging screenshots in a
  temporary working directory before invoking the local agent CLI.
- Added regression coverage for passthrough provider staging so local CLI calls do not receive
  original project screenshot paths.
- Replaced silent `postpack` cleanup with explicit forced removal.
- Warned that `--key` can be visible in shell history and process lists; environment variables
  are preferred for provider keys.

## [0.1.3] - 2026-07-07

### Fixed
- Corrected the `pixeljury-core` npm README quickstart to match the real `buildScore`
  dimension contract and returned `score` field.
- Clarified provider fallback docs: PixelJury auto-selects `mock` only when no provider is
  selected and no provider key is available.

## [0.1.2] - 2026-07-07

### Changed
- Reworked the root and npm package READMEs around the developer outcome, install path,
  quickstart, comparison, compatibility notes, and trust links.
- Expanded npm metadata for `pixeljury-core` and `pixeljury-vision` with descriptions,
  keywords, repository, homepage, bugs, and Node engine fields.
- Tightened the `pixeljury` CLI package description and keywords for npm search.

### Fixed
- `pixeljury --version` now reads from the package manifest instead of a stale hardcoded value.
- The CLI package now copies `rubric.md` during `npm pack`/`npm publish` and removes the
  temporary copy afterward.

## [0.1.1] - 2026-06-14

### Added
- `pixeljury review <url>` — the full 0.1 pipeline: render → static signals → vision score →
  compose. Writes `screenshot.png`, `screenshot-390.png`, `critique.md`, `fix-prompt.md`,
  and `score.json`.
- **Rubric v0.1** ([`rubric.md`](./rubric.md)): six weighted dimensions, deterministic hard
  fails, and named slop-trope deductions.
- Deterministic static-signal engine: contrast, mobile overflow, touch targets, body-text
  size, overused fonts, gradient panels, repeated cards, AI-copy badges.
- BYO-key vision adapters: `openai`, `anthropic`, `gemini`, `ollama`, plus a deterministic
  `mock` provider for tests and key-less demos.
- **Subscription passthrough providers** — `claude-code` and `codex` shell out to the user's
  locally-installed CLI and use its existing login (incl. a Claude Pro/Max or ChatGPT
  subscription), so no separate API key is required. No backend, no credential handling.
- **Agent integration** — `AGENTS.md` recipe and a `/pixeljury` Claude Code slash command so an
  agent can run review → fix → re-review until the score clears a threshold.
- `examples/sloppy-saas` — a runnable "before" page for the demo (scores 30/100).
- `examples/polished-saas` — the redesigned "after" of the same product, dogfooded through
  PixelJury until it reported zero hard fails and zero deductions.
- `examples/gallery` — rendered before/after screenshots + `score.json` for both, embedded in
  the README so the visible change is front and center.

### Aligned with the design-judgment source spec
- Added **Fraunces** to the overused-font list (the spec names it alongside Inter/Roboto/Arial).
- Baked the restraint philosophy — *less is more, every element earns its place, one thousand
  no's for every yes* — into the vision system prompt and the Polish/Originality criteria.
- Sharpened the Color dimension toward harmonious palettes (oklch, no random invented colors)
  and enriched fix-prompt hints with concrete techniques (`text-wrap: pretty`, CSS grid,
  real materials over auto-drawn SVG).

### Notes
- `fix`, `compare`, `report`, `--ci`, and the GitHub Action are scoped to 0.2+.
