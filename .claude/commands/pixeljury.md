---
description: Score the current UI with PixelJury and iterate until it passes
argument-hint: "[url] [target-score]"
allowed-tools: Bash(npx pixeljury:*), Read, Edit, Write
---

Use PixelJury to judge and improve the running UI.

1. Run: `npx pixeljury review ${1:-http://localhost:3000} --provider claude-code`
   (falls back: if `claude` isn't available, try `--provider anthropic`, else `--provider mock`.)
2. Read `pixeljury/critique.md` and `pixeljury/fix-prompt.md`.
3. Apply every fix in `fix-prompt.md`, hard-fails first. Edit the actual source files.
4. Re-run the same `review` command.
5. Repeat until there are **0 hard fails** and the score is **≥ ${2:-85}**.
6. Show me the before → after score and a one-line summary of what changed.

Do not reintroduce slop tropes (gradient hero, emoji icons, Inter as primary, left-border
accent cards, repeated identical cards, "AI-powered" badge copy).
