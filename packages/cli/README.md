# PixelJury

PixelJury is a visual QA CLI for AI-built frontends that renders your page, catches generic design and accessibility problems, and writes the fix prompt your coding agent can apply.

[![npm version](https://img.shields.io/npm/v/pixeljury.svg)](https://www.npmjs.com/package/pixeljury)
[![npm downloads](https://img.shields.io/npm/dm/pixeljury.svg)](https://www.npmjs.com/package/pixeljury)
[![license](https://img.shields.io/npm/l/pixeljury.svg)](https://github.com/gchahal1982/pixeljury/blob/main/LICENSE)
![Node](https://img.shields.io/badge/node-%3E%3D18-43853d.svg)

- Reviews the rendered page in Chromium instead of guessing from source code.
- Flags hard failures: contrast, mobile overflow at 390px, small touch targets, tiny text, and repeated AI UI tropes.
- Scores typography, hierarchy, color, spacing, originality, and polish with your chosen vision provider.
- Writes `critique.md`, `fix-prompt.md`, screenshots, and `score.json` for an agent review -> fix -> re-review loop.

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

```bash
npx pixeljury review http://localhost:3000 --provider mock
```

PixelJury writes:

```text
pixeljury/
  screenshot.png
  screenshot-390.png
  critique.md
  fix-prompt.md
  score.json
```

Give `pixeljury/fix-prompt.md` to your coding agent, apply the fixes, and re-run the command. Use a model-backed provider for the full visual score:

```bash
npx pixeljury review http://localhost:3000 --provider anthropic
npx pixeljury review http://localhost:3000 --provider openai
npx pixeljury review http://localhost:3000 --provider claude-code
npx pixeljury review http://localhost:3000 --provider codex
```

## What You Can Do With It

- Review a landing page before shipping it.
- Catch common AI-generated UI tells: gradient heroes, emoji feature cards, fake metrics, repeated card grids, default fonts, and low-contrast footer text.
- Turn vague design feedback into an agent-ready remediation prompt.
- Keep screenshots and `score.json` as before/after proof for a PR or CI gate.

## Why PixelJury?

- **It inspects real pixels.** The CLI opens the URL in Chromium and reviews the page users will see.
- **Deterministic checks run without a key.** Contrast, mobile overflow, touch-target size, tiny text, and slop-trope detections work with `--provider mock`.
- **The output is actionable.** `fix-prompt.md` is written for coding agents and prioritizes hard fails first.
- **No hosted service is required.** Use provider API keys, local Ollama, Claude Code, Codex, or the mock provider.
- **The rubric is public.** Scores trace back to [`rubric.md`](https://github.com/gchahal1982/pixeljury/blob/main/rubric.md).

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

API providers read keys from `--key`, then `PIXELJURY_KEY`, then the provider's standard environment variable. Prefer environment variables for keys; command-line arguments can be visible in shell history and process lists. When no provider is selected and no key is available, PixelJury auto-selects `mock`; if you explicitly choose an API provider, you must provide that provider's key.

`--provider claude-code` and `--provider codex` shell out to your local CLI. PixelJury stages screenshots in a temporary working directory for those passthrough runs so the local agent is not pointed at your project checkout. Use API-key providers for shared automation or public CI.

## Compared To Alternatives

| Need | PixelJury | Common alternative |
|---|---|---|
| AI UI cleanup | Detects repeated cards, default fonts, gradients, fake stats, and generic AI copy in the rendered page. | Prompt snippets and design skills help before generation but do not inspect the final page. |
| Accessibility smoke check | Includes contrast, mobile overflow, touch target, and tiny-text checks. | Axe and Lighthouse cover broader accessibility and performance concerns. |
| Agent handoff | Writes `fix-prompt.md` for targeted implementation work. | Manual review often leaves comments the agent must interpret. |

## Compatibility And Limitations

- Requires Node.js 18 or newer.
- Uses Playwright and Chromium to render pages. If Chromium is missing, run `npx playwright install chromium`.
- Reviews a URL, so the app must already be running.
- `mock` runs deterministic checks only; use a model-backed provider for visual dimension scoring.

## Lower-Level Packages

- [`pixeljury-core`](https://www.npmjs.com/package/pixeljury-core): Playwright rendering, static signals, contrast helpers, and score composition.
- [`pixeljury-vision`](https://www.npmjs.com/package/pixeljury-vision): OpenAI, Anthropic, Gemini, Ollama, Claude Code, Codex, and mock vision adapters.

## Links

- [Repository](https://github.com/gchahal1982/pixeljury)
- [Examples](https://github.com/gchahal1982/pixeljury/tree/main/examples)
- [Rubric](https://github.com/gchahal1982/pixeljury/blob/main/rubric.md)
- [Security policy](https://github.com/gchahal1982/pixeljury/blob/main/SECURITY.md)

## License

MIT
