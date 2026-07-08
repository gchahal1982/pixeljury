#!/usr/bin/env node
/**
 * PixelJury CLI entrypoint.
 *
 * 0.1 ships exactly one command: `review`. fix / compare / report land in 0.2+.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "../src/args.js";
import { runReview } from "../src/review.js";
import { c } from "../src/terminal.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")).version;

const HELP = `
  ${c.bold("PixelJury")} — make your AI-built site stop looking AI-built.

  ${c.bold("Usage")}
    npx pixeljury review <url> [options]

  ${c.bold("Options")}
    --provider <name>   openai | anthropic | gemini | ollama | claude-code | codex | mock
                        (default: auto-detect from env keys, else mock)
                        claude-code / codex use your local CLI's login — no API key needed
    --model <id>        override the provider's default model
    --key <key>         API key override; prefer env vars because argv can be visible
    --out <dir>         output directory (default: ./pixeljury)
    --json              print score.json to stdout instead of the report
    -h, --help          show this help
    -v, --version       show version

  ${c.bold("Example")}
    npx pixeljury review http://localhost:3000 --provider anthropic

  Coming in 0.2+: fix · compare · report · --ci · GitHub Action
`;

async function main() {
  const argv = process.argv.slice(2);
  const { command, url, options, error } = parseArgs(argv);

  if (options.help || command === "help" || (!command && !options.version)) {
    process.stdout.write(HELP + "\n");
    return;
  }
  if (options.version) {
    process.stdout.write(VERSION + "\n");
    return;
  }
  if (error) {
    process.stderr.write(c.red(`  ${error}\n`));
    process.stderr.write(`  Run ${c.bold("npx pixeljury --help")} for usage.\n`);
    process.exit(2);
  }

  if (["fix", "compare", "report"].includes(command)) {
    process.stdout.write(
      `  ${c.bold(command)} ships in PixelJury 0.2. 0.1 is just ${c.bold("review")} — ` +
        `it already writes ${c.bold("fix-prompt.md")} you can hand to your agent.\n`
    );
    return;
  }

  if (command !== "review") {
    process.stderr.write(c.red(`  Unknown command "${command}".\n`));
    process.stderr.write(`  Run ${c.bold("npx pixeljury --help")} for usage.\n`);
    process.exit(2);
  }

  if (!url) {
    process.stderr.write(c.red(`  Missing <url>. Try: npx pixeljury review http://localhost:3000\n`));
    process.exit(2);
  }

  await runReview(url, options);
}

main().catch((err) => {
  process.stderr.write(c.red(`\n  ${err.message || err}\n`));
  if (process.env.PIXELJURY_DEBUG && err.stack) process.stderr.write(err.stack + "\n");
  process.exit(1);
});
