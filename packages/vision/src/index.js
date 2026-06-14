/**
 * @pixeljury/vision — Stage 3. Sends the screenshots + static summary + rubric to a
 * vision model and returns the validated { dimensions, visionTropes } contract.
 *
 * BYO key. No PixelJury backend, no auth wall, no cost to the maintainer.
 */

import fs from "node:fs";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.js";
import { parseVision, VisionParseError } from "./schema.js";

import * as openai from "./adapters/openai.js";
import * as anthropic from "./adapters/anthropic.js";
import * as gemini from "./adapters/gemini.js";
import * as ollama from "./adapters/ollama.js";
import * as mock from "./adapters/mock.js";

const ADAPTERS = { openai, anthropic, gemini, ollama, mock };

/** Provider → env var holding its key (PIXELJURY_KEY overrides all). */
const KEY_ENV = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
  ollama: null,
  mock: null,
};

export const PROVIDERS = Object.keys(ADAPTERS);

export { parseVision, VisionParseError };
export { VISION_JSON_SCHEMA } from "./schema.js";

/** Resolve the API key for a provider from explicit arg or environment. */
export function resolveKey(provider, explicit) {
  if (explicit) return explicit;
  if (process.env.PIXELJURY_KEY) return process.env.PIXELJURY_KEY;
  const env = KEY_ENV[provider];
  return env ? process.env[env] || "" : "";
}

/**
 * @param {object} args
 * @param {string} args.provider     one of PROVIDERS
 * @param {string} args.rubricText   rubric.md contents (the scoring instruction)
 * @param {string} args.staticSummary  from core.summarizeForVision
 * @param {{desktop:string,mobile:string}} args.screenshots  file paths
 * @param {string} [args.apiKey]     overrides env
 * @param {string} [args.model]      overrides provider default
 * @returns {Promise<{dimensions:object,visionTropes:Array}>}
 */
export async function score({ provider, rubricText, staticSummary, screenshots, apiKey, model }) {
  const adapter = ADAPTERS[provider];
  if (!adapter) throw new Error(`Unknown provider "${provider}". Use one of: ${PROVIDERS.join(", ")}.`);

  const key = resolveKey(provider, apiKey);
  const images = [readImage(screenshots.desktop), readImage(screenshots.mobile)].filter(Boolean);
  const user = buildUserPrompt(staticSummary);

  // First attempt, then one strict retry if the output won't parse.
  for (let attempt = 0; attempt < 2; attempt++) {
    const system = buildSystemPrompt(rubricText, { strict: attempt > 0 });
    const raw = await adapter.call({ system, user, images, apiKey: key, model });
    try {
      return parseVision(raw);
    } catch (e) {
      if (attempt === 1 || !(e instanceof VisionParseError)) throw e;
    }
  }
  // unreachable
  throw new VisionParseError("Vision scoring failed after retry.");
}

function readImage(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  return { base64: fs.readFileSync(filePath).toString("base64"), mime: "image/png" };
}
