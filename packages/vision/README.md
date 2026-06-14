# pixeljury-vision

BYO-key + subscription vision adapters for **[PixelJury](https://www.npmjs.com/package/pixeljury)** —
visual design QA for AI-built frontends.

This is an internal package. You almost certainly want the CLI instead:

```bash
npx pixeljury review http://localhost:3000
```

It sends the rendered screenshots + the [rubric](https://github.com/gchahal1982/pixeljury/blob/main/rubric.md)
to a vision model and returns a validated `{ dimensions, visionTropes }` score. Adapters:
`openai`, `anthropic`, `gemini`, `ollama`, `claude-code` and `codex` (use your existing CLI
login — no API key), plus a deterministic `mock`.

Docs & source: https://github.com/gchahal1982/pixeljury · MIT
