# pixeljury-core

`pixeljury-core` is the Node.js rendering and deterministic scoring engine behind PixelJury: it captures web pages with Playwright, detects static design/accessibility issues, and composes review artifacts.

[![npm version](https://img.shields.io/npm/v/pixeljury-core.svg)](https://www.npmjs.com/package/pixeljury-core)
[![npm downloads](https://img.shields.io/npm/dm/pixeljury-core.svg)](https://www.npmjs.com/package/pixeljury-core)
[![license](https://img.shields.io/npm/l/pixeljury-core.svg)](https://github.com/gchahal1982/pixeljury/blob/main/LICENSE)
![Node](https://img.shields.io/badge/node-%3E%3D18-43853d.svg)

- Render desktop and 390px mobile screenshots from a URL.
- Detect deterministic hard fails such as contrast, mobile overflow, small touch targets, and tiny text.
- Identify common AI UI tropes including default fonts, gradient panels, repeated cards, and AI-marketing badges.
- Compose findings, vision scores, screenshots, and markdown outputs into the PixelJury score format.

## Install

```bash
npm install pixeljury-core
pnpm add pixeljury-core
yarn add pixeljury-core
bun add pixeljury-core
```

Most developers should install the CLI instead:

```bash
npx pixeljury review http://localhost:3000
```

## Quickstart

```js
import { analyze, buildScore, render, summarizeForVision } from "pixeljury-core";

const rendered = await render("http://localhost:3000", { outDir: "pixeljury" });
const findings = analyze(rendered.snapshot);
const staticSummary = summarizeForVision(findings, rendered.snapshot);

const score = buildScore({
  url: "http://localhost:3000",
  findings,
  screenshots: rendered.screenshots,
  vision: {
    dimensions: {
      typography: { score: 70, reason: "Readable type scale." },
      hierarchy: { score: 70, reason: "Primary content is clear." },
      color: { score: 70, reason: "Palette is coherent." },
      spacing: { score: 70, reason: "Spacing is mostly consistent." },
      originality: { score: 70, reason: "Some distinctive choices." },
      polish: { score: 70, reason: "No major finish issues." },
    },
    visionTropes: [],
  },
});

console.log(staticSummary);
console.log(score.score);
```

## What You Can Build With It

- A custom visual QA command that uses PixelJury's deterministic checks.
- CI jobs that render a page and inspect `score.json`.
- Internal dashboards that combine static signals with your own model or review workflow.
- Tests around contrast, mobile overflow, touch-target size, or repeated AI UI patterns.

## Why pixeljury-core?

- **The checks are reproducible.** Static signals do not require an LLM or network call.
- **It ships the same engine as the CLI.** Integrations can use the exact renderer and composer behind `npx pixeljury`.
- **It separates deterministic evidence from model judgment.** You can pair the static summary with any scoring layer.
- **The scoring contract is inspectable.** Rubric constants and output composition live in source.

## Compared To Alternatives

| Need | pixeljury-core | Common alternative |
|---|---|---|
| Browser-rendered design signals | Captures screenshots and a DOM/CSS snapshot before running PixelJury checks. | DOM-only linters miss final layout and rendered sizes. |
| Accessibility smoke checks | Includes contrast, mobile overflow, touch target, and tiny-text findings. | Axe and Lighthouse are broader and more mature accessibility/performance tools. |
| AI UI trope detection | Includes default font, gradient panel, repeated-card, and AI-copy heuristics. | General-purpose test libraries do not include these design-specific rules. |

## API

```js
import {
  RenderError,
  analyze,
  buildScore,
  contrastRatio,
  parseColor,
  relativeLuminance,
  render,
  renderCritique,
  renderFixPrompt,
  rubric,
  summarizeForVision,
  writeOutputs,
} from "pixeljury-core";
```

Key exports:

- `render(url, options)`: uses Playwright to capture screenshots and a page snapshot.
- `analyze(snapshot)`: returns deterministic findings.
- `summarizeForVision(findings, snapshot)`: prepares a compact summary for a vision model.
- `buildScore({ url, findings, vision, screenshots })`: composes the final score payload.
- `writeOutputs(outDir, score)`: writes `critique.md`, `fix-prompt.md`, and `score.json`.
- `contrastRatio`, `parseColor`, `relativeLuminance`: contrast utilities.

## Compatibility And Limitations

- Requires Node.js 18 or newer.
- Uses Playwright and Chromium; run `npx playwright install chromium` if the browser is missing.
- It does not call a vision model. Use [`pixeljury-vision`](https://www.npmjs.com/package/pixeljury-vision) or the [`pixeljury`](https://www.npmjs.com/package/pixeljury) CLI for model-backed scoring.
- The package exports JavaScript modules; TypeScript declaration files are not currently published.

## Links

- [Repository](https://github.com/gchahal1982/pixeljury)
- [CLI package](https://www.npmjs.com/package/pixeljury)
- [Rubric](https://github.com/gchahal1982/pixeljury/blob/main/rubric.md)
- [Security policy](https://github.com/gchahal1982/pixeljury/blob/main/SECURITY.md)

## License

MIT
