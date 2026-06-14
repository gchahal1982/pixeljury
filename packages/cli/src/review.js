/**
 * The `review` command — the whole 0.1 pipeline:
 *   render → static signals → vision score → compose → write outputs → print report
 */

import fs from "node:fs";
import path from "node:path";
import { render, analyze, summarizeForVision, buildScore, writeOutputs, RenderError } from "pixeljury-core";
import { score as visionScore, PROVIDERS } from "pixeljury-vision";
import { loadRubricText } from "./rubric-loader.js";
import { c, renderReport } from "./terminal.js";

export async function runReview(url, options) {
  const outDirAbs = path.resolve(process.cwd(), options.out || "pixeljury");
  const outRel = path.relative(process.cwd(), outDirAbs) || "pixeljury";
  fs.mkdirSync(outDirAbs, { recursive: true });

  const provider = pickProvider(options);
  const rubricText = loadRubricText();

  if (provider === "codex" && !options.json) {
    process.stderr.write(
      c.yellow(
        "  Note: OpenAI recommends API-key auth (--provider openai) for automation and advises\n" +
          "  against subscription auth in public/CI contexts. --provider codex runs your local\n" +
          "  `codex` CLI with its own login; scoring draws from your shared Codex quota.\n"
      )
    );
  }

  if (!options.json) {
    process.stderr.write(c.dim(`  Rendering ${url} …\n`));
  }

  // Stage 1 — render
  let rendered;
  try {
    rendered = await render(url, { outDir: outDirAbs });
  } catch (e) {
    if (e instanceof RenderError) throw e;
    throw new RenderError(`Render failed: ${e.message}`, { cause: e });
  }
  const { snapshot, screenshots } = rendered;

  // Stage 2 — static signals (deterministic)
  if (!options.json) process.stderr.write(c.dim(`  Analyzing static signals …\n`));
  const findings = analyze(snapshot);

  // Stage 3 — vision score (BYO key)
  if (!options.json) process.stderr.write(c.dim(`  Scoring with ${provider} …\n`));
  const summary = summarizeForVision(findings, snapshot);
  let vision;
  try {
    vision = await visionScore({
      provider,
      rubricText,
      staticSummary: summary,
      screenshots,
      apiKey: options.key,
      model: options.model,
    });
  } catch (e) {
    throw new Error(`Vision scoring (${provider}) failed: ${e.message}`);
  }

  // Stage 4 — compose + write
  const relScreenshots = {
    desktop: path.join(outRel, "screenshot.png"),
    mobile: path.join(outRel, "screenshot-390.png"),
  };
  const score = buildScore({ url, findings, vision, screenshots: relScreenshots });
  writeOutputs(outDirAbs, score);

  if (options.json) {
    process.stdout.write(JSON.stringify(score, null, 2) + "\n");
  } else {
    process.stdout.write(renderReport(score, { out: outRel }));
  }
  return score;
}

/**
 * Provider selection: explicit flag → PIXELJURY_PROVIDER → first env key present →
 * mock (with a heads-up, so the tool always runs end-to-end).
 */
function pickProvider(options) {
  if (options.provider) {
    if (!PROVIDERS.includes(options.provider)) {
      throw new Error(`Unknown provider "${options.provider}". Use: ${PROVIDERS.join(", ")}.`);
    }
    return options.provider;
  }
  if (process.env.PIXELJURY_PROVIDER && PROVIDERS.includes(process.env.PIXELJURY_PROVIDER)) {
    return process.env.PIXELJURY_PROVIDER;
  }
  // A specific provider key wins; a generic PIXELJURY_KEY defaults to anthropic.
  for (const p of ["anthropic", "openai", "gemini"]) {
    if (process.env[`${p === "anthropic" ? "ANTHROPIC" : p.toUpperCase()}_API_KEY`]) return p;
  }
  if (process.env.PIXELJURY_KEY) return "anthropic";
  process.stderr.write(
    c.yellow(
      "  No API key found — using the deterministic mock provider.\n" +
        "  For a real visual score: set ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY,\n" +
        "  or use your existing subscription with --provider claude-code (or --provider codex).\n"
    )
  );
  return "mock";
}
