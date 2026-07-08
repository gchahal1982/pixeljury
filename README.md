# PixelJury

PixelJury is a visual QA CLI for AI-built frontends that renders your page, catches generic design and accessibility problems, and writes the fix prompt your coding agent can apply.

[![npm version](https://img.shields.io/npm/v/pixeljury.svg)](https://www.npmjs.com/package/pixeljury)
[![npm downloads](https://img.shields.io/npm/dm/pixeljury.svg)](https://www.npmjs.com/package/pixeljury)
[![CI](https://github.com/gchahal1982/pixeljury/actions/workflows/ci.yml/badge.svg)](https://github.com/gchahal1982/pixeljury/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/pixeljury.svg)](./LICENSE)
![Node](https://img.shields.io/badge/node-%3E%3D18-43853d.svg)

- Reviews the actual rendered page in Chromium, not just source files or component names.
- Flags hard failures developers can fix immediately: contrast, mobile overflow at 390px, small touch targets, tiny text, and repeated AI UI tropes.
- Scores typography, hierarchy, color, spacing, originality, and polish with your chosen vision provider.
- Writes `critique.md`, `fix-prompt.md`, screenshots, and `score.json` so an agent can run a review -> fix -> re-review loop.

## Install

Run it directly:

```bash
npx pixeljury review http://localhost:3000
```

Or install it in a project:

```bash
npm install --save-dev pixeljury
pnpm add -D pixeljury
yarn add -D pixeljury
bun add -d pixeljury
```

## Quickstart

Start your app, then point PixelJury at the local URL:

```bash
npx pixeljury review http://localhost:3000 --provider mock
```

That creates:

```text
pixeljury/
  screenshot.png
  screenshot-390.png
  critique.md
  fix-prompt.md
  score.json
```

Open `pixeljury/fix-prompt.md`, give it to your coding agent, apply the fixes, and run the same command again. Use a model-backed provider when you want the full visual score:

```bash
npx pixeljury review http://localhost:3000 --provider anthropic
npx pixeljury review http://localhost:3000 --provider openai
npx pixeljury review http://localhost:3000 --provider claude-code
npx pixeljury review http://localhost:3000 --provider codex
```

## What You Can Do With It

- Review a landing page before shipping it.
- Catch the common AI-generated UI tells: gradient heroes, emoji feature cards, fake metrics, repeated card grids, default fonts, and low-contrast footer text.
- Give Cursor, Claude Code, Codex, Windsurf, or another coding agent a concrete design-fix prompt instead of vague feedback.
- Keep before/after proof in CI or pull requests with screenshots and `score.json`.
- Tune design work against an open rubric instead of a private taste call.

## Why PixelJury?

- **It judges pixels, not intentions.** PixelJury opens the URL in Chromium and reviews the page that users will actually see.
- **Hard fails are deterministic.** Contrast, mobile overflow, touch-target size, tiny text, and named slop-trope detections run without an API key.
- **The output is agent-ready.** The generated `fix-prompt.md` prioritizes hard fails first so a coding agent can make targeted changes.
- **No hosted service is required.** Use provider API keys, local Ollama, Claude Code, Codex, or the deterministic `mock` provider.
- **The rubric is public.** Scores trace back to [`rubric.md`](./rubric.md), so the standard can be inspected and changed.

## Compared To Alternatives

| Need | PixelJury | Common alternative |
|---|---|---|
| Accessibility smoke check | Checks contrast, mobile overflow, touch targets, and tiny text while also producing design feedback. | Axe/Lighthouse are stronger for broad accessibility coverage and performance auditing. |
| AI UI cleanup | Detects repeated cards, default fonts, gradient panels, fake stats, and generic AI copy in the rendered page. | Design-system rules or prompt snippets help before generation but do not inspect final pixels. |
| Agent handoff | Writes `fix-prompt.md` with concrete remediation instructions. | Manual design review often leaves feedback in screenshots, comments, or chat. |
| Visual scoring | Combines deterministic findings with a vision-model rubric. | Pure linters are more deterministic but cannot judge originality, hierarchy, or polish. |

Use Lighthouse, Axe, Playwright tests, and visual regression tools when you need their specific coverage. Use PixelJury when the page works but still looks generic, broken, or unready.

## Example Output

```text
PixelJury  ·  rubric v0.1

Design score: 61/100   - Generic AI output

Hard fails
  x Page is 70px wider than the 390px viewport (horizontal scroll on mobile)   caps at 70
  x Text contrast 3.1:1 (needs 4.5:1) - e.g. "Copyright 2026 FlowSync..."     caps at 65

Problems
  x "inter" is the primary typeface - an AI/template default        -5
  x Large gradient background panel (1440x420px)                    -5
  x The same card pattern is reused 5x - reads as templated         -5
  x Pill/badge with AI-marketing copy                               -3

-> pixeljury/critique.md   pixeljury/fix-prompt.md   pixeljury/screenshot.png
```

## See It Work

The repository includes a before/after SaaS page pair in [`examples/`](./examples). PixelJury rendered and scored both pages.

| Before: `examples/sloppy-saas` | After: `examples/polished-saas` |
|:---:|:---:|
| <img src="./examples/gallery/before-desktop.png" width="420" alt="Generic AI SaaS page with a purple gradient hero, emoji cards, fake stats, and low contrast footer text" /> | <img src="./examples/gallery/after-desktop.png" width="420" alt="Redesigned SaaS page with editorial typography, a warmer palette, a product mock, and cleaner hierarchy" /> |
| **16 / 100 - Broken or pure slop** | **84 / 100 - Good, fixable gaps** |
| 3 hard fails, 6 slop-trope deductions | 0 hard fails, 0 deductions |

Full scoring artifacts: [`before.score.json`](./examples/gallery/before.score.json) and [`after.score.json`](./examples/gallery/after.score.json).

## Providers

```bash
npx pixeljury review <url> --provider anthropic     # ANTHROPIC_API_KEY
npx pixeljury review <url> --provider openai        # OPENAI_API_KEY
npx pixeljury review <url> --provider gemini        # GEMINI_API_KEY
npx pixeljury review <url> --provider ollama        # local model, no API key
npx pixeljury review <url> --provider claude-code   # local Claude Code login
npx pixeljury review <url> --provider codex         # local Codex / ChatGPT login
npx pixeljury review <url> --provider mock          # deterministic checks only
```

API providers read keys from `--key`, then `PIXELJURY_KEY`, then the provider's standard environment variable. Prefer environment variables for keys; command-line arguments can be visible in shell history and process lists. When no provider is selected and no key is available, PixelJury auto-selects `mock`; if you explicitly choose an API provider, you must provide that provider's key. The deterministic hard-fail and trope checks still run with `mock`.

`--provider claude-code` and `--provider codex` shell out to the local CLI you already have logged in. PixelJury stages screenshots in a temporary working directory for those passthrough runs so the local agent is not pointed at your project checkout. Use API-key providers for shared automation or public CI.

## How It Works

```text
Render with Playwright
  -> analyze deterministic static signals
  -> score screenshots with a vision provider
  -> compose the final score and write artifacts
```

The deterministic stage finds:

- WCAG contrast failures
- mobile overflow at 390px
- touch targets below 44px
- tiny body text
- overused default fonts
- large gradient panels
- repeated card patterns
- AI-marketing badges and fake-looking stats

The vision stage scores six rubric dimensions: typography, hierarchy, color, spacing, originality, and polish. The final score is capped by hard fails and reduced by deterministic deductions.

## API Packages

Most developers should install [`pixeljury`](https://www.npmjs.com/package/pixeljury), the CLI. The lower-level packages are published for integrations:

- [`pixeljury-core`](https://www.npmjs.com/package/pixeljury-core): Playwright rendering, deterministic static signals, contrast helpers, and score composition.
- [`pixeljury-vision`](https://www.npmjs.com/package/pixeljury-vision): OpenAI, Anthropic, Gemini, Ollama, Claude Code, Codex, and mock vision-scoring adapters.

## Compatibility And Limitations

- Requires Node.js 18 or newer.
- Uses Playwright and Chromium to render pages. If Chromium is not installed, run `npx playwright install chromium`.
- Reviews a URL, so your app must already be running.
- The `mock` provider runs deterministic checks but does not produce a model-backed visual critique.
- PixelJury is not a replacement for full accessibility, performance, security, or visual regression testing.

## Development

```bash
npm install
npm test
npx playwright install chromium
node packages/cli/bin/pixeljury.js review http://localhost:3000 --provider mock
```

Workspace layout:

```text
packages/cli      # npx entrypoint and review command
packages/core     # Playwright render, static signals, score composer
packages/vision   # provider adapters and structured-output parsing
examples/         # before/after pages and gallery artifacts
rubric.md         # scoring rubric
```

## Trust And Project Links

- [Examples](./examples)
- [Rubric](./rubric.md)
- [Changelog](./CHANGELOG.md)
- [Contributing](./CONTRIBUTING.md)
- [Security policy](./SECURITY.md)
- [Code of conduct](./CODE_OF_CONDUCT.md)

## License

MIT © PixelJury contributors
