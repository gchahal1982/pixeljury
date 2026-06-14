/**
 * Builds the system + user prompts handed to the vision model.
 * The rubric (rubric.md, passed in verbatim) IS the scoring instruction.
 */

import { rubric } from "@pixeljury/core";

const { DIMENSION_KEYS } = rubric;

export function buildSystemPrompt(rubricText, { strict = false } = {}) {
  return [
    "You are PixelJury, a strict but fair design critic. You are shown screenshots of a",
    "rendered web page (desktop and a 390px mobile view) and a summary of deterministic",
    "signals already computed from the DOM. Score the page against the rubric below.",
    "",
    "Judge ONLY what you can see in the pixels. Be specific and concrete in every reason.",
    "Do not be generous: the median AI-generated page should land in the 55–69 band.",
    "",
    "Design philosophy you are judging against (apply it to every dimension):",
    "  - Less is more. Every element must earn its place — one thousand no's for every yes.",
    "  - Penalize data-slop: decorative stats, numbers, icons, or badges that carry no real",
    "    meaning, and filler content added just to fill space.",
    "  - Reward a committed, coherent aesthetic direction over a safe, templated default.",
    "  - Color should look like an intentional, harmonious palette with clear roles — not",
    "    random invented colors and not an accent applied everywhere or nowhere.",
    "  - Reward restraint and intentionality; penalize anything that reads as auto-generated.",
    "",
    "=== RUBRIC ===",
    rubricText.trim(),
    "=== END RUBRIC ===",
    "",
    "Return ONLY a JSON object, no prose, no markdown fences, with exactly this shape:",
    "{",
    '  "dimensions": {',
    ...DIMENSION_KEYS.map(
      (k, i) =>
        `    "${k}": { "score": <0-100 integer>, "reason": "<one concrete sentence>" }${
          i < DIMENSION_KEYS.length - 1 ? "," : ""
        }`
    ),
    "  },",
    '  "visionTropes": [',
    '    { "rule": "centered-ai-hero" | "svg-illustration-slop" | "fake-data-slop", "reason": "<what you saw>" }',
    "  ]",
    "}",
    "",
    "Only include a visionTrope if you actually see it. visionTropes may be an empty array.",
    strict
      ? "Your previous reply was not parseable. Output the raw JSON object ONLY — nothing before or after it."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildUserPrompt(staticSummary) {
  return [
    "Score this page. Deterministic signals already computed (treat as ground truth for the",
    "hard fails — do not re-score them, just factor them into your dimension judgments):",
    "",
    staticSummary,
    "",
    "Desktop screenshot is first, mobile (390px) screenshot is second.",
  ].join("\n");
}
