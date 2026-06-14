import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, summarizeForVision, buildScore } from "pixeljury-core";
import { score as visionScore } from "../src/index.js";

// End-to-end of everything except the Playwright render (which needs a browser):
// synthetic snapshot → static signals → mock vision → composed score.
test("mock pipeline produces a 'Generic AI output' score on a sloppy page", async () => {
  const snapshot = {
    url: "http://localhost:3000",
    fonts: ["inter"],
    desktop: {
      width: 1440,
      height: 900,
      scrollWidth: 1440,
      elements: [
        {
          tag: "div",
          text: "",
          fontFamily: "Inter",
          fontSize: 16,
          fontWeight: 400,
          color: "rgb(0,0,0)",
          bgColor: "rgb(255,255,255)",
          ownBgColor: "rgb(255,255,255)",
          backgroundImage: "linear-gradient(135deg,#6366f1,#a855f7)",
          borderLeftWidth: 0,
          borderRadius: 0,
          hasBorder: false,
          hasShadow: false,
          padding: 0,
          box: { x: 0, y: 0, w: 1440, h: 500 },
          area: 1440 * 500,
          isInteractive: false,
          isTouchTarget: false,
          hasText: false,
          emoji: false,
          sig: "div||",
        },
        {
          tag: "p",
          text: "Body copy that is long enough to count as real reading content on the page.",
          fontFamily: "Inter",
          fontSize: 16,
          fontWeight: 400,
          color: "rgb(20,20,20)",
          bgColor: "rgb(255,255,255)",
          ownBgColor: "rgb(255,255,255)",
          backgroundImage: "none",
          borderLeftWidth: 0,
          borderRadius: 0,
          hasBorder: false,
          hasShadow: false,
          padding: 0,
          box: { x: 0, y: 600, w: 600, h: 60 },
          area: 36000,
          isInteractive: false,
          isTouchTarget: false,
          hasText: true,
          emoji: false,
          sig: "p||",
        },
      ],
    },
    get mobile() {
      return this.desktop;
    },
  };

  const findings = analyze(snapshot);
  const summary = summarizeForVision(findings, snapshot);
  const vision = await visionScore({
    provider: "mock",
    rubricText: "RUBRIC",
    staticSummary: summary,
    screenshots: { desktop: "missing.png", mobile: "missing.png" },
  });

  const score = buildScore({
    url: snapshot.url,
    findings,
    vision,
    screenshots: { desktop: "pixeljury/screenshot.png", mobile: "pixeljury/screenshot-390.png" },
  });

  assert.ok(score.score >= 40 && score.score <= 75, `score ${score.score} should read as generic/slop`);
  assert.ok(score.deductions.some((d) => d.rule === "overused-font"));
  assert.ok(score.deductions.some((d) => d.rule === "full-page-gradient"));
});
