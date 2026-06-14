/**
 * @pixeljury/core — render + static-signal engine + score composer.
 */
export { render, RenderError } from "./render.js";
export { analyze, summarizeForVision } from "./static-signals.js";
export { buildScore, writeOutputs, renderCritique, renderFixPrompt } from "./compose.js";
export { contrastRatio, parseColor, relativeLuminance } from "./contrast.js";
export * as rubric from "./rubric-data.js";
