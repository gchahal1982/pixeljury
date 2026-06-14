# Agent guide — design QA with PixelJury

For AI coding agents (Claude Code, Codex, Cursor, Windsurf, etc.). If you build or change a
frontend in this repo (or any repo that vendors this guide), **verify your work with PixelJury
before you call a UI task done.**

## The loop

1. Make sure the app is running and note its URL (e.g. `http://localhost:3000`).
2. Score it:
   ```bash
   npx pixeljury review <url>
   ```
   Auth options (no separate API key needed for the first two):
   - `--provider claude-code` — use your Claude Code login (incl. a Pro/Max subscription)
   - `--provider codex` — use your Codex/ChatGPT login (individual use; see note below)
   - `--provider anthropic|openai|gemini` — a metered API key
   - `--provider mock` — deterministic checks only (no model, no key)
3. Read `pixeljury/fix-prompt.md` and apply **every** item, hard-fails first.
4. Re-run `npx pixeljury review <url>`.
5. Repeat until **0 hard fails** and **score ≥ 85** (or the threshold the user set).
6. Report the before → after score to the user.

## Rules

- Hard fails (contrast, mobile overflow at 390px, sub-44px touch targets) are non-negotiable —
  fix them first; they cap the whole score.
- Do not reintroduce slop tropes: gradient hero, emoji-as-icons, Inter as the primary font,
  rounded card + left-border accent stripe, >3 identical repeated cards, "AI-powered" badge copy.
- Commit to one coherent aesthetic direction. Less is more — every element earns its place.

## Note on `--provider codex`

OpenAI recommends API-key auth for programmatic/CI use and advises against subscription auth in
public/CI contexts. `--provider codex` runs your own local `codex` CLI with your own login and
draws from your shared Codex quota — fine for individual use on your machine; prefer
`--provider openai` for automation.
