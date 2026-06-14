/**
 * Deterministic mock provider. No network, no key. Lets PixelJury run end-to-end for tests,
 * CI of this repo, and key-less demos. It reacts to the static summary so its output is
 * plausible (a clean page scores higher than one riddled with hard fails) but never random.
 */
export async function call({ user }) {
  const summary = String(user || "");
  const hasHardFails = /hard fails:\s*(?!none)/i.test(summary) || /- .+(overflow|contrast|touch|too small)/i.test(summary);
  const hasGradient = /gradient/i.test(summary);
  const hasOverusedFont = /(inter|roboto|arial|system-ui)/i.test(summary);

  const base = {
    typography: hasOverusedFont ? 55 : 68,
    hierarchy: 52,
    color: 70,
    spacing: 66,
    originality: hasGradient ? 38 : 48,
    polish: 60,
  };

  const dimensions = {};
  for (const [k, v] of Object.entries(base)) {
    dimensions[k] = { score: v, reason: `Mock score for ${k} (deterministic; no model called).` };
  }

  const visionTropes = [];
  if (hasGradient) {
    visionTropes.push({
      rule: "centered-ai-hero",
      reason: "Mock: centered single-column hero over a gradient (the AI-SaaS template).",
    });
  }

  return JSON.stringify({ dimensions, visionTropes });
}
