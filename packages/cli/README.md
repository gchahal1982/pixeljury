<!--
  Keywords: AI slop, anti-slop, AI-generated UI checker, visual QA for AI frontends, design QA
  CLI, frontend design linter, rendered-pixel design scoring, screenshot design review,
  Playwright design audit, Cursor, Claude Code, Codex, v0, Lovable, Bolt, vibe coding, design
  system, WCAG contrast, accessibility, mobile overflow, LLM vision scoring, npx CLI tool.
-->

<p align="center">
  <a href="https://github.com/gchahal1982/pixeljury">
    <img src="https://raw.githubusercontent.com/gchahal1982/pixeljury/main/assets/banner.png" alt="PixelJury — make your AI-built site stop looking AI-built" width="100%">
  </a>
</p>

# PixelJury

### Make your AI-built site stop looking AI-built. 🎨

> Your code works — so why does the page still look like a robot made it? **PixelJury shows you
> exactly what's giving it away, hands your AI agent the fix, and proves the glow-up with a score.**

<p>
  <a href="https://www.npmjs.com/package/pixeljury"><img alt="npm" src="https://img.shields.io/npm/v/pixeljury?color=cb3837&label=npm"></a>
  <a href="https://www.npmjs.com/package/pixeljury"><img alt="downloads" src="https://img.shields.io/npm/dm/pixeljury?color=cb3837"></a>
  <a href="https://github.com/gchahal1982/pixeljury"><img alt="GitHub stars" src="https://img.shields.io/github/stars/gchahal1982/pixeljury?style=social"></a>
  <a href="https://github.com/gchahal1982/pixeljury/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
</p>

You vibe-coded a site with **Cursor, Claude Code, v0, Lovable or Bolt**. It *works*. But it has
that look — the purple gradient hero, the Inter font, emoji feature cards, fake
"10k+ / 99.9% / 24-7" stats. **Generic. AI-made. Slop.**

**PixelJury is the taste your agent is missing.** It opens your running page, looks at the
actual pixels like a picky designer would, tells you *specifically* what's making it look cheap,
then writes a ready-to-paste fix for your agent and gives you a design score so you can watch it
get better. The example below went from **16 → 84** in a single pass. ✨

```bash
npx pixeljury review http://localhost:3000
```

No design degree, no Figma, no API key required.

## See it work — before / after

<table>
  <tr>
    <td align="center"><b>Before — 16/100 · Broken or pure slop</b></td>
    <td align="center"><b>After — 84/100 · looks designed</b></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/gchahal1982/pixeljury/main/examples/gallery/before-desktop.png" alt="Generic AI-SaaS page: purple gradient hero, emoji cards, fake stats" width="100%"></td>
    <td><img src="https://raw.githubusercontent.com/gchahal1982/pixeljury/main/examples/gallery/after-desktop.png" alt="Redesigned page: editorial serif headline, warm palette, real product mock" width="100%"></td>
  </tr>
  <tr>
    <td align="center">3 hard fails · 6 slop-trope deductions</td>
    <td align="center">0 hard fails · 0 deductions</td>
  </tr>
</table>

Run it, hand the generated `fix-prompt.md` to your agent, run it again, watch the score climb.
**That loop is the product.**

## What you get

Every run writes to `./pixeljury/`:

| File | What it is |
|---|---|
| `screenshot.png` / `screenshot-390.png` | desktop + mobile renders |
| `critique.md` | human-readable verdict with per-dimension scores |
| `fix-prompt.md` | agent-ready instructions, hard-fails first |
| `score.json` | machine-readable result |

## Providers — bring a key, or use a subscription you already have

```bash
npx pixeljury review <url> --provider anthropic     # ANTHROPIC_API_KEY
npx pixeljury review <url> --provider openai        # OPENAI_API_KEY
npx pixeljury review <url> --provider gemini        # GEMINI_API_KEY
npx pixeljury review <url> --provider ollama        # local, no key
npx pixeljury review <url> --provider claude-code   # your Claude Code login — no API key
npx pixeljury review <url> --provider codex         # your Codex / ChatGPT login — no API key
npx pixeljury review <url> --provider mock          # deterministic, no key, no network
```

With no key, PixelJury falls back to `mock` so it always runs end-to-end — the deterministic
checks (contrast, mobile overflow, touch targets, slop tropes) are still real.

## How it works

```
RENDER (Playwright) → STATIC SIGNALS (deterministic) → VISION SCORE (BYO key) → COMPOSE
```

Six weighted design dimensions (typography, hierarchy, color, spacing, **originality**, polish)
scored by a vision model, minus deterministic slop deductions, capped by any hard fail. Every
point traces to an open, versioned [rubric](https://github.com/gchahal1982/pixeljury/blob/main/rubric.md).

## Who it's for

Developers vibe-coding UIs with Cursor / Claude Code / v0 / Lovable / Bolt who want a second
opinion before they ship — and teams that want a repeatable design-quality bar in code review
and CI instead of "looks fine to me."

---

**Full docs, the rubric, and how to contribute:** https://github.com/gchahal1982/pixeljury  ·  MIT
