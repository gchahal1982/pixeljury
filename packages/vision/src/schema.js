/**
 * Vision output contract + defensive parsing.
 *
 * The vision pass must return ONLY this JSON shape:
 *   {
 *     dimensions: {
 *       typography:  { score: 0-100, reason: string },
 *       hierarchy:   { score: 0-100, reason: string },
 *       color:       { score: 0-100, reason: string },
 *       spacing:     { score: 0-100, reason: string },
 *       originality: { score: 0-100, reason: string },
 *       polish:      { score: 0-100, reason: string }
 *     },
 *     visionTropes: [ { rule: string, reason: string } ]
 *   }
 *
 * `rule` for visionTropes should be one of: centered-ai-hero, svg-illustration-slop,
 * fake-data-slop. Unknown rules default to a −3 deduction in the composer.
 */

import { rubric } from "pixeljury-core";

const { DIMENSION_KEYS } = rubric;

export const VISION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["dimensions", "visionTropes"],
  properties: {
    dimensions: {
      type: "object",
      additionalProperties: false,
      required: DIMENSION_KEYS,
      properties: Object.fromEntries(
        DIMENSION_KEYS.map((k) => [
          k,
          {
            type: "object",
            additionalProperties: false,
            required: ["score", "reason"],
            properties: {
              score: { type: "integer", minimum: 0, maximum: 100 },
              reason: { type: "string" },
            },
          },
        ])
      ),
    },
    visionTropes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["rule", "reason"],
        properties: { rule: { type: "string" }, reason: { type: "string" } },
      },
    },
  },
};

export class VisionParseError extends Error {
  constructor(message, raw) {
    super(message);
    this.name = "VisionParseError";
    this.raw = raw;
  }
}

/**
 * Parse + validate a model's raw text into the vision contract. Strips markdown fences,
 * extracts the first balanced JSON object, and coerces dimension scores. Throws
 * VisionParseError if no usable object is found.
 * @param {string} raw
 */
export function parseVision(raw) {
  const text = String(raw || "").trim();
  const jsonStr = extractJson(text);
  if (!jsonStr) throw new VisionParseError("No JSON object found in model output.", text);

  let obj;
  try {
    obj = JSON.parse(jsonStr);
  } catch (e) {
    throw new VisionParseError(`Model output was not valid JSON: ${e.message}`, text);
  }

  const dimsIn = obj.dimensions || obj.scores || {};
  const dimensions = {};
  for (const key of DIMENSION_KEYS) {
    const d = dimsIn[key] || {};
    const score = clampInt(d.score, 0, 100, 50);
    const reason = String(d.reason || "").trim() || "No reason provided.";
    dimensions[key] = { score, reason };
  }

  const tropesIn = Array.isArray(obj.visionTropes) ? obj.visionTropes : [];
  const visionTropes = tropesIn
    .filter((t) => t && t.rule)
    .map((t) => ({ rule: String(t.rule).trim(), reason: String(t.reason || t.rule).trim() }));

  return { dimensions, visionTropes };
}

/** Pull the first balanced {...} block out of arbitrary text (handles ```json fences). */
function extractJson(text) {
  let t = text.replace(/```json\s*/gi, "```").replace(/```/g, "");
  const start = t.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return t.slice(start, i + 1);
    }
  }
  return null;
}

function clampInt(v, lo, hi, dflt) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return dflt;
  return Math.max(lo, Math.min(hi, n));
}
