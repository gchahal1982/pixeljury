/**
 * Claude Code passthrough adapter.
 *
 * Shells out to the user's locally-installed `claude` CLI in headless (`-p`) mode, using
 * whatever auth that install already has — including a Pro/Max subscription (via
 * `claude setup-token` → CLAUDE_CODE_OAUTH_TOKEN) — so no separate ANTHROPIC_API_KEY is
 * required. PixelJury never bundles or transmits credentials; it just invokes the user's CLI.
 *
 * Screenshots are passed by file path; the prompt instructs Claude to open them with the Read
 * tool (headless image input goes through Read, not a flag).
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stageImages } from "./util.js";

export async function call({ system, user, imagePaths = [], model }) {
  const bin = process.env.PIXELJURY_CLAUDE_BIN || "claude";

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pixeljury-cc-"));
  const sysFile = path.join(tmp, "system.txt");
  let imgs = [];

  try {
    fs.writeFileSync(sysFile, system);
    imgs = stageImages(imagePaths, tmp);

    const imgLines = [];
    if (imgs[0]) imgLines.push(`Desktop screenshot: ${imgs[0]}`);
    if (imgs[1]) imgLines.push(`Mobile (390px) screenshot: ${imgs[1]}`);
    const prompt =
      `${user}\n\nUse the Read tool to open these screenshot files, then score what you actually see:\n` +
      imgLines.join("\n") +
      `\n\nReturn ONLY the JSON object — no prose, no markdown fences.`;

    const args = [
      "-p", prompt,
      "--append-system-prompt-file", sysFile,
      "--allowedTools", "Read",
      "--output-format", "json",
      "--max-turns", "6",
      "--add-dir", tmp,
    ];
    if (model) args.push("--model", model);

    const res = spawnSync(bin, args, { cwd: tmp, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    if (res.error) {
      if (res.error.code === "ENOENT") {
        throw new Error(
          `Claude Code CLI ("${bin}") not found on PATH. Install Claude Code (and run \`claude\` once to sign in), ` +
            `set PIXELJURY_CLAUDE_BIN to its path, or use --provider anthropic for the API instead.`
        );
      }
      throw res.error;
    }
    if (res.status !== 0) {
      throw new Error(`claude -p exited ${res.status}: ${(res.stderr || "").trim().slice(0, 500)}`);
    }

    // `--output-format json` returns a result envelope; the model's text is in `.result`.
    const out = res.stdout || "";
    try {
      const env = JSON.parse(out);
      if (env && typeof env.result === "string") return env.result;
      if (env && env.structured_output) return JSON.stringify(env.structured_output);
    } catch {
      /* not an envelope — fall through to raw, parseVision will extract */
    }
    return out;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
