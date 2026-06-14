/**
 * Stage 2 — Static signals (deterministic, no LLM).
 *
 * Consumes the dom-snapshot (see render.js) and produces every hard fail from rubric §2 and
 * every `[static]` deduction from rubric §3. Fast, free, and reproducible: the same page
 * always yields the same findings.
 *
 * ── Output contract: static-findings ────────────────────────────────────────────────────
 *   { hardFails: [{ rule, cap, value, reason }], deductions: [{ rule, points, reason }] }
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

import {
  HARD_FAIL_CAPS,
  DEDUCTION_POINTS,
  CONTRAST,
  MIN_BODY_FONT_PX,
  MIN_TOUCH_TARGET_PX,
  OVERUSED_FONTS,
} from "./rubric-data.js";
import { contrastRatio, requiredRatio } from "./contrast.js";

/**
 * @param {object} snapshot dom-snapshot from render()
 * @returns {{ hardFails: Array, deductions: Array }}
 */
export function analyze(snapshot) {
  const { desktop, mobile } = snapshot;
  const hardFails = [];
  const deductions = [];

  checkBodyTextSize(desktop, hardFails);
  checkMobileOverflow(mobile, hardFails);
  checkContrast(desktop, hardFails);
  checkTouchTargets(mobile, hardFails);
  checkOverlap(desktop, hardFails);

  checkOverusedFont(desktop, deductions);
  checkFullPageGradient(desktop, deductions);
  checkEmojiUi(desktop, deductions);
  checkCardLeftBorder(desktop, deductions);
  checkRepeatedCards(desktop, deductions);
  checkPillAiCopy(desktop, deductions);

  return { hardFails, deductions };
}

/* ── Hard fails (rubric §2) ─────────────────────────────────────────────────────────── */

function checkBodyTextSize(vp, out) {
  // Body copy = substantial text runs, excluding captions / legal / inline labels.
  const candidates = vp.elements.filter(
    (el) => el.hasText && el.text.length >= 40 && !["small", "sup", "sub", "label"].includes(el.tag)
  );
  if (candidates.length < 2) return;
  let min = Infinity;
  for (const el of candidates) if (el.fontSize > 0) min = Math.min(min, el.fontSize);
  if (min < MIN_BODY_FONT_PX) {
    out.push({
      rule: "body-text-too-small",
      cap: HARD_FAIL_CAPS["body-text-too-small"],
      value: min,
      reason: `Body text as small as ${min.toFixed(0)}px (needs ≥ ${MIN_BODY_FONT_PX}px).`,
    });
  }
}

function checkMobileOverflow(vp, out) {
  const overflow = vp.scrollWidth - vp.width;
  if (overflow > 2) {
    out.push({
      rule: "mobile-overflow-390",
      cap: HARD_FAIL_CAPS["mobile-overflow-390"],
      value: overflow,
      reason: `Page is ${overflow}px wider than the 390px viewport (horizontal scroll on mobile).`,
    });
  }
}

function checkContrast(vp, out) {
  let worst = null;
  for (const el of vp.elements) {
    if (!el.hasText) continue;
    const ratio = contrastRatio(el.color, el.bgColor);
    if (!Number.isFinite(ratio)) continue;
    const required = requiredRatio(el.fontSize, el.fontWeight, CONTRAST);
    if (ratio + 0.05 < required) {
      if (!worst || ratio < worst.ratio) {
        worst = { ratio, required, text: el.text };
      }
    }
  }
  if (worst) {
    out.push({
      rule: "contrast-below-aa",
      cap: HARD_FAIL_CAPS["contrast-below-aa"],
      value: Number(worst.ratio.toFixed(2)),
      reason: `Text contrast ${worst.ratio.toFixed(1)}:1 (needs ${worst.required}:1)${
        worst.text ? ` — e.g. "${truncate(worst.text, 32)}"` : ""
      }.`,
    });
  }
}

function checkTouchTargets(vp, out) {
  let smallest = null;
  for (const el of vp.elements) {
    if (!el.isTouchTarget) continue;
    // Exclude long inline text links (tappable enough horizontally, not discrete controls).
    if (el.tag === "a" && el.text.length > 20) continue;
    const minDim = Math.min(el.box.w, el.box.h);
    if (minDim > 0 && minDim < MIN_TOUCH_TARGET_PX) {
      if (!smallest || minDim < smallest.minDim) {
        smallest = { minDim, tag: el.tag, text: el.text };
      }
    }
  }
  if (smallest) {
    out.push({
      rule: "touch-target-too-small",
      cap: HARD_FAIL_CAPS["touch-target-too-small"],
      value: smallest.minDim,
      reason: `<${smallest.tag}> touch target only ${smallest.minDim}px (needs ≥ ${MIN_TOUCH_TARGET_PX}px)${
        smallest.text ? ` — "${truncate(smallest.text, 24)}"` : ""
      }.`,
    });
  }
}

function checkOverlap(vp, out) {
  // Conservative: only leaf text elements (no element children) that strongly overlap and
  // do not contain one another. Avoids the parent/child and decorative-layer false positives.
  const leaves = vp.elements.filter(
    (el) => el.hasText && el.box.w * el.box.h > 0 && (el.sig.split("|")[2] || "") === "" && el.area < vp.width * vp.height * 0.25
  );
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i].box;
      const b = leaves[j].box;
      const ov = intersectionArea(a, b);
      if (ov <= 0) continue;
      const minArea = Math.min(a.w * a.h, b.w * b.h);
      if (contains(a, b) || contains(b, a)) continue;
      if (ov > 0.6 * minArea) {
        out.push({
          rule: "overlapping-layout",
          cap: HARD_FAIL_CAPS["overlapping-layout"],
          value: Math.round((ov / minArea) * 100),
          reason: `Overlapping text elements collide (~${Math.round((ov / minArea) * 100)}% overlap): "${truncate(
            leaves[i].text,
            18
          )}" / "${truncate(leaves[j].text, 18)}".`,
        });
        return; // one report is enough to cap; don't spam.
      }
    }
  }
}

/* ── Deductions (rubric §3, [static] rows) ──────────────────────────────────────────── */

function checkOverusedFont(vp, out) {
  const counts = new Map();
  for (const el of vp.elements) {
    if (!el.hasText) continue;
    const fam = primaryFamily(el.fontFamily);
    counts.set(fam, (counts.get(fam) || 0) + 1);
  }
  let dominant = null;
  let max = 0;
  for (const [fam, n] of counts) {
    if (n > max) {
      max = n;
      dominant = fam;
    }
  }
  if (dominant && OVERUSED_FONTS.includes(dominant)) {
    out.push({
      rule: "overused-font",
      points: DEDUCTION_POINTS["overused-font"],
      reason: `"${dominant}" is the primary typeface — an AI/template default.`,
    });
  }
}

function checkFullPageGradient(vp, out) {
  for (const el of vp.elements) {
    if (/gradient/i.test(el.backgroundImage) && el.box.w >= 0.8 * vp.width && el.box.h >= 300) {
      out.push({
        rule: "full-page-gradient",
        points: DEDUCTION_POINTS["full-page-gradient"],
        reason: `Large gradient background panel (${el.box.w}×${el.box.h}px) — a classic AI-SaaS tell.`,
      });
      return;
    }
  }
}

function checkEmojiUi(vp, out) {
  const iconish = vp.elements.filter((el) => el.emoji && el.text.replace(/\s/g, "").length <= 4);
  const interactiveEmoji = vp.elements.some((el) => el.emoji && el.isInteractive);
  if (iconish.length >= 1 || interactiveEmoji) {
    out.push({
      rule: "emoji-as-ui",
      points: DEDUCTION_POINTS["emoji-as-ui"],
      reason: `Emoji used as UI icons/decoration (${iconish.length || 1} instance${
        iconish.length === 1 ? "" : "s"
      }).`,
    });
  }
}

function checkCardLeftBorder(vp, out) {
  const hit = vp.elements.find(
    (el) => el.borderLeftWidth >= 3 && el.borderRadius > 0 && el.padding >= 8
  );
  if (hit) {
    out.push({
      rule: "card-left-border",
      points: DEDUCTION_POINTS["card-left-border"],
      reason: "Rounded card with a left-border accent stripe — a recognizable AI card pattern.",
    });
  }
}

function checkRepeatedCards(vp, out) {
  const counts = new Map();
  for (const el of vp.elements) {
    const childTags = el.sig.split("|")[2] || "";
    const childCount = childTags ? childTags.split(">").length : 0;
    const cardish = (el.hasBorder || el.hasShadow || el.borderRadius > 0) && childCount >= 2;
    const sizedLikeCard = el.area >= 5000 && el.area <= 400000;
    if (cardish && sizedLikeCard) {
      counts.set(el.sig, (counts.get(el.sig) || 0) + 1);
    }
  }
  let max = 0;
  for (const n of counts.values()) max = Math.max(max, n);
  if (max > 3) {
    out.push({
      rule: "repeated-card-pattern",
      points: DEDUCTION_POINTS["repeated-card-pattern"],
      reason: `The same card pattern is reused ${max}× — reads as templated.`,
    });
  }
}

function checkPillAiCopy(vp, out) {
  const aiCopy = /✨|🚀|ai[- ]powered|powered by ai|supercharge|unleash|effortless|next[- ]gen|revolutioni[sz]e/i;
  const hit = vp.elements.find(
    (el) => el.hasText && aiCopy.test(el.text) && (el.borderRadius >= 12 || el.emoji) && el.area < 60000
  );
  if (hit) {
    out.push({
      rule: "pill-ai-copy",
      points: DEDUCTION_POINTS["pill-ai-copy"],
      reason: `Pill/badge with AI-marketing copy — "${truncate(hit.text, 36)}".`,
    });
  }
}

/* ── helpers ────────────────────────────────────────────────────────────────────────── */

function primaryFamily(stack) {
  return String(stack || "")
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase();
}

function intersectionArea(a, b) {
  const x = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return x * y;
}

function contains(outer, inner) {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}

function truncate(s, n) {
  s = String(s);
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

/**
 * Compact summary of static findings for the vision prompt — gives the model the
 * deterministic context without dumping the whole DOM.
 * @param {{hardFails:Array,deductions:Array}} findings
 * @param {object} snapshot
 */
export function summarizeForVision(findings, snapshot) {
  const lines = [];
  lines.push(`Detected fonts: ${snapshot.fonts.join(", ") || "unknown"}`);
  lines.push(`Mobile overflow: ${Math.max(0, snapshot.mobile.scrollWidth - snapshot.mobile.width)}px`);
  if (findings.hardFails.length) {
    lines.push("Deterministic hard fails:");
    for (const h of findings.hardFails) lines.push(`  - ${h.reason}`);
  } else {
    lines.push("Deterministic hard fails: none");
  }
  if (findings.deductions.length) {
    lines.push("Deterministic slop tropes detected:");
    for (const d of findings.deductions) lines.push(`  - ${d.reason}`);
  } else {
    lines.push("Deterministic slop tropes detected: none");
  }
  return lines.join("\n");
}
