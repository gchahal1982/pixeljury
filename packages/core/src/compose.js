/**
 * Stage 4 — Compose.
 *
 * Combines the vision composite, the static + vision deductions, and the hard-fail caps into
 * the final score per the rubric formula, then writes the four output artifacts.
 *
 *   composite  = Σ (dimension_score × weight) / 100
 *   deductions = min(Σ slop points, 25)
 *   raw        = composite − deductions
 *   final      = clamp(min(raw, lowest_hard_fail_cap), 0, 100)
 */

import fs from "node:fs";
import path from "node:path";
import {
  RUBRIC_VERSION,
  DIMENSIONS,
  DIMENSION_KEYS,
  DEDUCTION_POINTS,
  MAX_TOTAL_DEDUCTION,
  bandFor,
} from "./rubric-data.js";

/**
 * @param {object} args
 * @param {string} args.url
 * @param {{hardFails:Array,deductions:Array}} args.findings   from static-signals
 * @param {{dimensions:object,visionTropes:Array}} args.vision from the vision pass
 * @param {{desktop:string,mobile:string}} args.screenshots    paths relative to cwd
 * @returns {object} score.json object
 */
export function buildScore({ url, findings, vision, screenshots }) {
  // 1. Dimensions → composite.
  const dimensions = {};
  let composite = 0;
  for (const { key, label, weight } of DIMENSIONS) {
    const v = (vision.dimensions && vision.dimensions[key]) || {};
    const score = clamp(Math.round(num(v.score, 50)), 0, 100);
    const reason = String(v.reason || "").trim() || "No reason provided.";
    dimensions[key] = { score, weight, label, reason };
    composite += (score * weight) / 100;
  }

  // 2. Merge deductions (static + vision), dedupe by rule, cap the total.
  const merged = new Map();
  for (const d of findings.deductions) {
    merged.set(d.rule, { rule: d.rule, points: -Math.abs(d.points), reason: d.reason });
  }
  for (const t of vision.visionTropes || []) {
    if (merged.has(t.rule)) continue; // static detection wins
    const pts = DEDUCTION_POINTS[t.rule] ?? 3;
    merged.set(t.rule, { rule: t.rule, points: -Math.abs(pts), reason: String(t.reason || t.rule) });
  }
  const deductions = [...merged.values()];
  const rawDeductionTotal = deductions.reduce((s, d) => s + Math.abs(d.points), 0);
  const deductionTotal = Math.min(rawDeductionTotal, MAX_TOTAL_DEDUCTION);

  // 3. Hard-fail caps. Lowest wins.
  const hardFails = findings.hardFails.map((h) => ({ rule: h.rule, cap: h.cap, reason: h.reason }));
  const lowestCap = hardFails.length ? Math.min(...hardFails.map((h) => h.cap)) : 100;

  // 4. Final.
  const raw = composite - deductionTotal;
  const final = clamp(Math.round(Math.min(raw, lowestCap)), 0, 100);

  return {
    url,
    rubricVersion: RUBRIC_VERSION,
    score: final,
    band: bandFor(final),
    composite: Number(composite.toFixed(1)),
    deductionTotal,
    cappedAt: lowestCap < 100 ? lowestCap : null,
    dimensions,
    deductions,
    hardFails,
    screenshots,
  };
}

/* ── Output writers ─────────────────────────────────────────────────────────────────── */

/** Writes score.json, critique.md, fix-prompt.md into outDir. */
export function writeOutputs(outDir, score) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "score.json"), JSON.stringify(score, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "critique.md"), renderCritique(score));
  fs.writeFileSync(path.join(outDir, "fix-prompt.md"), renderFixPrompt(score));
}

export function renderCritique(score) {
  const L = [];
  L.push(`# PixelJury critique`);
  L.push("");
  L.push(`**${score.url}**`);
  L.push("");
  L.push(`## Design score: ${score.score}/100 — ${score.band}`);
  L.push("");
  if (score.cappedAt != null) {
    L.push(`> Score capped at ${score.cappedAt} by a hard fail. Fix the hard fails first.`);
    L.push("");
  }

  L.push(`### Dimensions`);
  L.push("");
  L.push(`| Dimension | Score | Weight | Notes |`);
  L.push(`|---|---|---|---|`);
  for (const key of DIMENSION_KEYS) {
    const d = score.dimensions[key];
    L.push(`| ${d.label} | ${d.score} | ${d.weight} | ${escapePipes(d.reason)} |`);
  }
  L.push("");

  if (score.hardFails.length) {
    L.push(`### Hard fails`);
    L.push("");
    for (const h of score.hardFails) L.push(`- ❌ ${h.reason} _(caps at ${h.cap})_`);
    L.push("");
  }

  if (score.deductions.length) {
    L.push(`### Slop-trope deductions`);
    L.push("");
    for (const d of score.deductions) L.push(`- ✗ ${d.reason} _(${d.points})_`);
    L.push("");
  }

  L.push(`### Screenshots`);
  L.push(`- Desktop: \`${score.screenshots.desktop}\``);
  L.push(`- Mobile (390px): \`${score.screenshots.mobile}\``);
  L.push("");
  L.push(`---`);
  L.push(`Scored against PixelJury rubric v${score.rubricVersion}. Run \`npx pixeljury review\` again after fixing to watch the score move.`);
  L.push("");
  return L.join("\n");
}

export function renderFixPrompt(score) {
  const L = [];
  L.push(`You are fixing the design of the page at ${score.url}. Address each item below.`);
  L.push("");

  let n = 1;
  if (score.hardFails.length) {
    L.push(`HARD FAILS (fix first — these cap the score no matter how good the rest is):`);
    for (const h of score.hardFails) L.push(`${n++}. ${stripCap(h.reason)}`);
    L.push("");
  }

  // Design instructions: weakest dimensions first, then slop tropes.
  const weak = DIMENSION_KEYS.map((k) => score.dimensions[k])
    .filter((d) => d.score < 70)
    .sort((a, b) => a.score - b.score);

  if (weak.length || score.deductions.length) {
    L.push(`DESIGN:`);
    for (const d of weak) {
      L.push(`${n++}. ${d.label} scored ${d.score}/100 — ${d.reason} ${fixHint(d)}`);
    }
    for (const d of score.deductions) {
      L.push(`${n++}. ${stripCap(d.reason)} ${dedupeHint(d.rule)}`);
    }
    L.push("");
  }

  L.push(`When you're done, re-run \`npx pixeljury review ${score.url}\` to confirm the score improved.`);
  L.push("");
  return L.join("\n");
}

/* ── small content helpers ──────────────────────────────────────────────────────────── */

function fixHint(d) {
  const hints = {
    typography: "Establish a real type scale (≥4 intentional sizes), size up the headline, and use text-wrap: pretty for clean line breaks.",
    hierarchy: "Create one clear focal point; make the primary CTA dominant; break the centered single-column layout (CSS grid helps).",
    color: "Define a small, harmonious palette with clear roles (bg / surface / text / accent) — derive it with oklch rather than inventing random hex values.",
    spacing: "Use a consistent spacing scale; give sections room to breathe; align edges.",
    originality: "Commit to one bold, coherent aesthetic direction — make at least one deliberate, non-default choice instead of the generic AI-SaaS look.",
    polish: "Add considered hover/focus/empty states; remove data-slop and filler so every element earns its place.",
  };
  return hints[keyOf(d)] || "";
}

function keyOf(d) {
  return DIMENSION_KEYS.find((k) => k && d.label && d.label.toLowerCase().includes(k.slice(0, 4))) || "";
}

function dedupeHint(rule) {
  const hints = {
    "overused-font": "Choose a more intentional typeface pairing.",
    "full-page-gradient": "Drop the full-page gradient for a more restrained background.",
    "emoji-as-ui": "Replace emoji with real icons, or use placeholders until you have real assets.",
    "card-left-border": "Vary the card treatment; drop the left-accent-stripe cliché.",
    "repeated-card-pattern": "Introduce variation across repeated sections.",
    "pill-ai-copy": "Cut the generic AI-marketing badge copy.",
    "centered-ai-hero": "Redesign the hero away from the centered-gradient-+-two-pills template.",
    "svg-illustration-slop": "Drop generic SVG blobs/illustrations — use real materials or honest placeholders, not auto-drawn art.",
    "fake-data-slop": "Remove decorative stats/numbers/icons that carry no real meaning.",
  };
  return hints[rule] || "";
}

function stripCap(s) {
  return String(s).replace(/\s*\(caps at \d+\)\s*$/i, "");
}
function escapePipes(s) {
  return String(s).replace(/\|/g, "\\|");
}
function num(v, d) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}
