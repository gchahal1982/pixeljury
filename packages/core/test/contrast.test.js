import { test } from "node:test";
import assert from "node:assert/strict";
import { parseColor, contrastRatio, requiredRatio } from "../src/contrast.js";
import { CONTRAST } from "../src/rubric-data.js";

test("parseColor handles rgb, rgba, hex, transparent", () => {
  assert.deepEqual(parseColor("rgb(255, 0, 0)"), { r: 255, g: 0, b: 0, a: 1 });
  assert.deepEqual(parseColor("rgba(0, 0, 0, 0.5)"), { r: 0, g: 0, b: 0, a: 0.5 });
  assert.deepEqual(parseColor("#fff"), { r: 255, g: 255, b: 255, a: 1 });
  assert.equal(parseColor("transparent").a, 0);
  assert.equal(parseColor("linear-gradient(...)"), null);
});

test("contrastRatio: black on white is 21:1", () => {
  assert.equal(Math.round(contrastRatio("rgb(0,0,0)", "rgb(255,255,255)")), 21);
});

test("contrastRatio: identical colors are 1:1", () => {
  assert.equal(contrastRatio("rgb(128,128,128)", "rgb(128,128,128)"), 1);
});

test("contrastRatio: low-contrast grey fails AA for normal text", () => {
  const ratio = contrastRatio("rgb(150,150,150)", "rgb(255,255,255)");
  assert.ok(ratio < CONTRAST.normal, `expected ${ratio} < ${CONTRAST.normal}`);
});

test("requiredRatio: large/bold text uses the lower threshold", () => {
  assert.equal(requiredRatio(28, 400, CONTRAST), CONTRAST.large);
  assert.equal(requiredRatio(19, 700, CONTRAST), CONTRAST.large);
  assert.equal(requiredRatio(14, 400, CONTRAST), CONTRAST.normal);
});
