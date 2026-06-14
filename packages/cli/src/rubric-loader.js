/**
 * Locates rubric.md — the scoring instruction handed to the vision model.
 * Resolution order: $PIXELJURY_RUBRIC → ./rubric.md (cwd) → walk up from this module
 * (finds the repo root in dev, or the bundled package copy after npm publish).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadRubricText() {
  const candidates = [];
  if (process.env.PIXELJURY_RUBRIC) candidates.push(process.env.PIXELJURY_RUBRIC);
  candidates.push(path.resolve(process.cwd(), "rubric.md"));

  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    candidates.push(path.join(dir, "rubric.md"));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
    } catch {
      /* keep looking */
    }
  }
  throw new Error("Could not find rubric.md. Set PIXELJURY_RUBRIC to its path.");
}
