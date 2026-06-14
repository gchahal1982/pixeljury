# Security Policy

## Reporting a vulnerability

Please report security issues privately via GitHub's
[security advisory](https://github.com/gchahal1982/pixeljury/security/advisories/new) form, or
by opening a minimal issue asking a maintainer to contact you (do not include exploit details
in a public issue).

We'll acknowledge within a few days and work with you on a fix and disclosure timeline.

## Scope notes

- PixelJury runs **locally** with **no backend** and **no telemetry**. Your API keys are read
  from your environment and sent only to the provider you choose (OpenAI / Anthropic / Gemini)
  or to your local Ollama instance.
- PixelJury renders arbitrary URLs in headless Chromium. Only point it at pages you trust, the
  same as opening them in a browser.
