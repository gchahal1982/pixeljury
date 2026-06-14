/**
 * Codex CLI passthrough adapter (OPT-IN).
 *
 * Shells out to the user's locally-installed `codex exec` using whatever auth that install
 * has, including a ChatGPT subscription (~/.codex/auth.json). Screenshots pass via `--image`,
 * and `--output-schema` constrains the final message to our JSON contract.
 *
 * ⚠️ Heads-up surfaced to the user by the CLI: OpenAI recommends API-key auth for programmatic
 * Codex use and advises against the subscription-in-automation path for public/OSS repos.
 * PixelJury never pools or transfers credentials — it only invokes the user's own CLI on their
 * own machine. Prefer --provider openai (API key) for automation; this is for individual use.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export async function call({ system, user, imagePaths = [], model, schema }) {
  const bin = process.env.PIXELJURY_CODEX_BIN || "codex";
  const imgs = imagePaths.filter(Boolean).map((p) => path.resolve(p));

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pixeljury-codex-"));
  const schemaFile = path.join(tmp, "schema.json");
  const outFile = path.join(tmp, "out.json");
  if (schema) fs.writeFileSync(schemaFile, JSON.stringify(schema));

  const prompt = `${system}\n\n${user}\n\nReturn ONLY the JSON object described above.`;

  const args = [
    "exec",
    "--skip-git-repo-check",
    "--sandbox", "read-only",
    "--output-last-message", outFile,
  ];
  if (schema) args.push("--output-schema", schemaFile);
  if (imgs.length) args.push("--image", imgs.join(","));
  if (model) args.push("-m", model);
  args.push(prompt);

  let res;
  try {
    res = spawnSync(bin, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    if (res.error) {
      if (res.error.code === "ENOENT") {
        throw new Error(
          `Codex CLI ("${bin}") not found on PATH. Install it (and run \`codex\` once to sign in), ` +
            `set PIXELJURY_CODEX_BIN to its path, or use --provider openai for the API instead.`
        );
      }
      throw res.error;
    }
    if (res.status !== 0) {
      throw new Error(`codex exec exited ${res.status}: ${(res.stderr || "").trim().slice(0, 500)}`);
    }
    if (fs.existsSync(outFile)) return fs.readFileSync(outFile, "utf8");
    return res.stdout || "";
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}
