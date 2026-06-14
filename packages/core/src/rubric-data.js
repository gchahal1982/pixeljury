/**
 * Machine-readable mirror of rubric.md (v0.1).
 *
 * This is the single source of truth for every weight, cap, and point value used by
 * BOTH the deterministic static-signal engine and the score composer. If you change a
 * number here, change it in rubric.md too — and add a changelog entry with the delta.
 */

export const RUBRIC_VERSION = "0.1";

/** The six weighted dimensions. Weights sum to 100. */
export const DIMENSIONS = [
  { key: "typography", label: "Typography & scale", weight: 20 },
  { key: "hierarchy", label: "Layout & hierarchy", weight: 20 },
  { key: "color", label: "Color & system", weight: 15 },
  { key: "spacing", label: "Spacing & rhythm", weight: 15 },
  { key: "originality", label: "Originality (anti-slop)", weight: 20 },
  { key: "polish", label: "Polish & finish", weight: 10 },
];

export const DIMENSION_KEYS = DIMENSIONS.map((d) => d.key);

/** Hard fails cap the final score. Lowest applicable cap wins. */
export const HARD_FAIL_CAPS = {
  "body-text-too-small": 70,
  "mobile-overflow-390": 70,
  "contrast-below-aa": 65,
  "touch-target-too-small": 75,
  "overlapping-layout": 50,
};

/** Slop-trope deductions (negative is applied as an absolute subtraction). */
export const DEDUCTION_POINTS = {
  // [static]
  "overused-font": 5,
  "full-page-gradient": 5,
  "emoji-as-ui": 4,
  "card-left-border": 4,
  "repeated-card-pattern": 5,
  "pill-ai-copy": 3,
  // [vision]
  "svg-illustration-slop": 3,
  "centered-ai-hero": 5,
  "fake-data-slop": 3,
};

/** Total deductions are capped so the composite drives the headline number. */
export const MAX_TOTAL_DEDUCTION = 25;

/** Contrast thresholds (WCAG AA). */
export const CONTRAST = {
  normal: 4.5,
  large: 3.0,
  /** px size at/above which text is "large" */
  largePx: 24,
  /** px size at/above which bold text is "large" */
  largeBoldPx: 18.66,
};

export const MIN_BODY_FONT_PX = 14;
export const MIN_TOUCH_TARGET_PX = 44;
export const MOBILE_VIEWPORT_WIDTH = 390;
export const DESKTOP_VIEWPORT_WIDTH = 1440;

/**
 * Fonts that read as AI/template defaults when used as the primary face.
 * The named set (Inter, Roboto, Arial, Fraunces, system fonts) mirrors the design-judgment
 * spec's anti-slop list verbatim — Fraunces included, since the "intentional serif" default
 * is as much a tell as Inter is.
 */
export const OVERUSED_FONTS = [
  "inter",
  "roboto",
  "arial",
  "fraunces",
  "system-ui",
  "-apple-system",
  "segoe ui",
];

/** Score → band lookup, highest band first. */
export const BANDS = [
  { min: 85, label: "Shipped by a designer" },
  { min: 70, label: "Good, fixable gaps" },
  { min: 55, label: "Generic AI output" },
  { min: 40, label: "Slop" },
  { min: 0, label: "Broken or pure slop" },
];

/** @param {number} score 0-100 @returns {string} band label */
export function bandFor(score) {
  for (const b of BANDS) {
    if (score >= b.min) return b.label;
  }
  return BANDS[BANDS.length - 1].label;
}
