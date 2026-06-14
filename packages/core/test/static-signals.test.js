import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, summarizeForVision } from "../src/static-signals.js";

/** Build an Element with sane defaults; override what the test cares about. */
function el(o = {}) {
  return {
    tag: "div",
    text: "",
    fontFamily: "Inter, sans-serif",
    fontSize: 16,
    fontWeight: 400,
    color: "rgb(20, 20, 20)",
    bgColor: "rgb(255, 255, 255)",
    ownBgColor: "rgb(255, 255, 255)",
    backgroundImage: "none",
    borderLeftWidth: 0,
    borderRadius: 0,
    hasBorder: false,
    hasShadow: false,
    padding: 0,
    box: { x: 0, y: 0, w: 100, h: 40 },
    area: 4000,
    isInteractive: false,
    isTouchTarget: false,
    hasText: false,
    emoji: false,
    sig: "div||",
    ...o,
  };
}

function snapshot(desktopEls, { mobileScroll = 390 } = {}) {
  return {
    url: "http://localhost:3000",
    fonts: ["inter"],
    desktop: { width: 1440, height: 900, scrollWidth: 1440, elements: desktopEls },
    mobile: { width: 390, height: 844, scrollWidth: mobileScroll, elements: desktopEls },
  };
}

test("detects mobile overflow, contrast fail, overused font, gradient, repeated cards", () => {
  const text = (extra) =>
    el({ hasText: true, text: "This is a reasonably long line of body copy on the page.", ...extra });

  const cards = Array.from({ length: 4 }, (_, i) =>
    el({
      tag: "div",
      borderRadius: 12,
      hasShadow: true,
      area: 60000,
      box: { x: i * 320, y: 600, w: 300, h: 200 },
      sig: "div|card|h3>p",
    })
  );

  const els = [
    ...cards,
    text(), // good-contrast inter body text (makes inter dominant)
    text(),
    text({ color: "rgb(150,150,150)" }), // low contrast -> hard fail
    el({
      backgroundImage: "linear-gradient(135deg, #6366f1, #a855f7)",
      box: { x: 0, y: 0, w: 1440, h: 420 },
      area: 1440 * 420,
    }),
  ];

  const { hardFails, deductions } = analyze(snapshot(els, { mobileScroll: 460 }));

  const hf = new Set(hardFails.map((h) => h.rule));
  assert.ok(hf.has("mobile-overflow-390"), "mobile overflow");
  assert.ok(hf.has("contrast-below-aa"), "contrast");

  const dd = new Set(deductions.map((d) => d.rule));
  assert.ok(dd.has("overused-font"), "overused font");
  assert.ok(dd.has("full-page-gradient"), "gradient");
  assert.ok(dd.has("repeated-card-pattern"), "repeated cards");
});

test("clean page yields no hard fails and no deductions", () => {
  const els = [
    el({ hasText: true, text: "A confident headline that is clearly the focal point here.", fontFamily: "Söhne, serif", fontSize: 48, fontWeight: 700, color: "rgb(15,15,15)" }),
    el({ hasText: true, text: "Body copy with good contrast and a real reading measure on this page.", fontFamily: "Söhne, serif", fontSize: 18, color: "rgb(30,30,30)" }),
  ];
  const { hardFails, deductions } = analyze(snapshot(els));
  assert.equal(hardFails.length, 0);
  assert.equal(deductions.length, 0);
});

test("summarizeForVision is a compact string", () => {
  const els = [el({ hasText: true, text: "x".repeat(50) })];
  const snap = snapshot(els);
  const summary = summarizeForVision(analyze(snap), snap);
  assert.match(summary, /Detected fonts:/);
  assert.match(summary, /Mobile overflow:/);
});
