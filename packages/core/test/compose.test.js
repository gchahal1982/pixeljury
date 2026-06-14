import { test } from "node:test";
import assert from "node:assert/strict";
import { buildScore } from "../src/compose.js";

const fullVision = {
  dimensions: {
    typography: { score: 80, reason: "ok" },
    hierarchy: { score: 80, reason: "ok" },
    color: { score: 80, reason: "ok" },
    spacing: { score: 80, reason: "ok" },
    originality: { score: 80, reason: "ok" },
    polish: { score: 80, reason: "ok" },
  },
  visionTropes: [],
};

const screenshots = { desktop: "pixeljury/screenshot.png", mobile: "pixeljury/screenshot-390.png" };

test("composite equals weighted average of dimensions", () => {
  const score = buildScore({ url: "u", findings: { hardFails: [], deductions: [] }, vision: fullVision, screenshots });
  assert.equal(score.composite, 80); // all 80 → 80
  assert.equal(score.score, 80);
  assert.equal(score.band, "Good, fixable gaps");
});

test("deductions subtract from composite and are capped at 25", () => {
  const findings = {
    hardFails: [],
    deductions: [
      { rule: "overused-font", points: 5, reason: "Inter" },
      { rule: "full-page-gradient", points: 5, reason: "gradient" },
      { rule: "repeated-card-pattern", points: 5, reason: "cards" },
      { rule: "card-left-border", points: 4, reason: "stripe" },
      { rule: "emoji-as-ui", points: 4, reason: "emoji" },
      { rule: "pill-ai-copy", points: 3, reason: "pill" }, // total 26 -> capped to 25
    ],
  };
  const score = buildScore({ url: "u", findings, vision: fullVision, screenshots });
  assert.equal(score.deductionTotal, 25);
  assert.equal(score.score, 55); // 80 - 25
});

test("hard fail caps the final score regardless of composite", () => {
  const findings = {
    hardFails: [{ rule: "contrast-below-aa", cap: 65, reason: "low contrast" }],
    deductions: [],
  };
  const score = buildScore({ url: "u", findings, vision: fullVision, screenshots });
  assert.equal(score.cappedAt, 65);
  assert.equal(score.score, 65); // composite 80 capped to 65
});

test("vision tropes merge but static detection of the same rule wins", () => {
  const findings = { hardFails: [], deductions: [{ rule: "centered-ai-hero", points: 5, reason: "static" }] };
  const vision = {
    ...fullVision,
    visionTropes: [
      { rule: "centered-ai-hero", reason: "vision dup" },
      { rule: "fake-data-slop", reason: "vision only" },
    ],
  };
  const score = buildScore({ url: "u", findings, vision, screenshots });
  const rules = score.deductions.map((d) => d.rule).sort();
  assert.deepEqual(rules, ["centered-ai-hero", "fake-data-slop"]);
  const hero = score.deductions.find((d) => d.rule === "centered-ai-hero");
  assert.equal(hero.reason, "static"); // static wins
});
