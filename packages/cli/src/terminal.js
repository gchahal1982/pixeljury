/**
 * Terminal styling + the score block renderer (build spec §6).
 * No dependencies; respects NO_COLOR and non-TTY output.
 */

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));

export const c = {
  bold: wrap("1"),
  dim: wrap("2"),
  red: wrap("31"),
  green: wrap("32"),
  yellow: wrap("33"),
  cyan: wrap("36"),
  gray: wrap("90"),
};

/** Color the score by band. */
function scoreColor(score) {
  if (score >= 85) return c.green;
  if (score >= 70) return c.cyan;
  if (score >= 55) return c.yellow;
  return c.red;
}

/**
 * Render the report block from a score.json object.
 * @param {object} score
 * @param {{out:string}} ctx  output paths for the footer
 * @returns {string}
 */
export function renderReport(score, ctx) {
  const L = [];
  const tint = scoreColor(score.score);
  L.push("");
  L.push(`  ${c.bold("PixelJury")}  ${c.dim("·")}  ${c.dim(`rubric v${score.rubricVersion}`)}`);
  L.push("");
  L.push(`  ${c.bold("Design score:")} ${tint(c.bold(`${score.score}/100`))}   ${c.dim("— " + score.band)}`);
  L.push("");

  if (score.hardFails.length) {
    L.push(`  ${c.bold("Hard fails")}`);
    for (const h of score.hardFails) {
      L.push(`    ${c.red("✗")} ${trimReason(h.reason)}  ${c.dim(`caps at ${h.cap}`)}`);
    }
  }

  const problems = buildProblems(score);
  if (problems.length) {
    L.push(`  ${c.bold("Problems")}`);
    for (const p of problems) {
      L.push(`    ${c.yellow("✗")} ${p.label}  ${c.dim(p.note)}`);
    }
  }

  if (!score.hardFails.length && !problems.length) {
    L.push(`  ${c.green("✓")} No hard fails or slop tropes detected.`);
  }

  L.push("");
  L.push(
    `  ${c.cyan("→")} ${ctx.out}/critique.md   ${ctx.out}/fix-prompt.md   ${ctx.out}/screenshot.png`
  );
  L.push("");
  L.push(`  ${c.dim("Run your agent on fix-prompt.md, then re-run to see the score move.")}`);
  L.push("");
  return L.join("\n");
}

/** The terminal "Problems" list = slop deductions + the weakest dimensions. */
function buildProblems(score) {
  const out = [];
  for (const d of score.deductions) {
    out.push({ label: trimReason(d.reason), note: `${d.points}` });
  }
  const weak = Object.values(score.dimensions)
    .filter((d) => d.score < 60)
    .sort((a, b) => a.score - b.score);
  for (const d of weak) {
    out.push({ label: `${d.label} weak`, note: `${labelKey(d.label)} ${d.score}` });
  }
  return out.slice(0, 8);
}

function labelKey(label) {
  return String(label).split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
}

function trimReason(s) {
  return String(s).replace(/\s*\((caps at \d+|-?\d+)\)\s*$/i, "");
}
