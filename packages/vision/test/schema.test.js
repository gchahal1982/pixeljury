import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVision, VisionParseError } from "../src/schema.js";

const valid = {
  dimensions: {
    typography: { score: 55, reason: "two sizes" },
    hierarchy: { score: 50, reason: "centered" },
    color: { score: 70, reason: "generic" },
    spacing: { score: 68, reason: "even" },
    originality: { score: 38, reason: "AI saas" },
    polish: { score: 60, reason: "default states" },
  },
  visionTropes: [{ rule: "centered-ai-hero", reason: "gradient hero" }],
};

test("parses clean JSON", () => {
  const out = parseVision(JSON.stringify(valid));
  assert.equal(out.dimensions.originality.score, 38);
  assert.equal(out.visionTropes[0].rule, "centered-ai-hero");
});

test("strips markdown fences and surrounding prose", () => {
  const raw = "Here is the result:\n```json\n" + JSON.stringify(valid) + "\n```\nDone.";
  const out = parseVision(raw);
  assert.equal(out.dimensions.color.score, 70);
});

test("coerces out-of-range and missing scores", () => {
  const out = parseVision(
    JSON.stringify({ dimensions: { typography: { score: 250 }, hierarchy: { score: -5 } }, visionTropes: [] })
  );
  assert.equal(out.dimensions.typography.score, 100);
  assert.equal(out.dimensions.hierarchy.score, 0);
  assert.equal(out.dimensions.color.score, 50); // missing → default
});

test("throws on output with no JSON object", () => {
  assert.throws(() => parseVision("I refuse to answer."), VisionParseError);
});

test("drops malformed tropes", () => {
  const out = parseVision(JSON.stringify({ dimensions: {}, visionTropes: [{ reason: "no rule" }, { rule: "ok", reason: "r" }] }));
  assert.equal(out.visionTropes.length, 1);
  assert.equal(out.visionTropes[0].rule, "ok");
});
